import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getZodiacSign } from '@/data/zodiac';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';
import { getZodiacSignFromBirth } from '@/lib/zodiac';
import type {
  BirthDate,
  ZodiacRequest,
  ZodiacResponse,
} from '@/types/divination';

export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `あなたは西洋占星術の星読みです。ユーザーの星座をもとに「今日一日の運勢」を日本語で綴ってください。

【スタンス】
- 「決まった未来」ではなく「今日意識すると良い視点・流れ」として提示する
- ポジティブと注意点をバランスよく
- 医療・法律・自傷・他者への加害など重い悩みには軽率に踏み込まず、専門家への相談を勧める

【文体】
- 落ち着いた自然な日本語、占星術らしい穏やかな語り
- マークダウン記法は使わずプレーンテキスト
- 全体で350〜500字程度
- 「〜してみるとよいでしょう」「〜という流れがあります」など押しつけない語尾

【出力の構成】
1. 今日の全体運（2〜3文、星座らしいキーワードを織り交ぜて）
2. 恋愛・人間関係
3. 仕事・学び
4. 金運・物質
5. 最後にラッキーカラーとラッキーアイテムを1つずつ（「ラッキーカラー: ◯◯」「ラッキーアイテム: ◯◯」の形）`;

function validate(body: unknown): ZodiacRequest | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'リクエストボディが不正です。' };
  }
  const b = body as Record<string, unknown>;
  const birth = b.birth as Record<string, unknown> | undefined;
  if (!birth || typeof birth !== 'object') {
    return { error: '生年月日を指定してください。' };
  }
  const year = Number(birth.year);
  const month = Number(birth.month);
  const day = Number(birth.day);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return { error: '生年月日の形式が不正です。' };
  }
  return { birth: { year, month, day } as BirthDate };
}

const client = new Anthropic();

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'サーバー設定が未完了です（ANTHROPIC_API_KEY 未設定）。' },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited('zodiac', ip)) {
    return NextResponse.json(
      { error: 'リクエストが多すぎます。少し時間を置いて再度お試しください。' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSONの解析に失敗しました。' }, { status: 400 });
  }

  const validated = validate(body);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  let signId: ReturnType<typeof getZodiacSignFromBirth>;
  try {
    signId = getZodiacSignFromBirth(validated.birth);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '生年月日が不正です。' },
      { status: 400 }
    );
  }
  const sign = getZodiacSign(signId);
  if (!sign) {
    return NextResponse.json({ error: '星座の判定に失敗しました。' }, { status: 500 });
  }

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  const userMessage = [
    `今日: ${dateStr}`,
    `星座: ${sign.nameJa}（${sign.nameEn} ${sign.glyph}、${sign.dateRange}、${sign.element}のエレメント）`,
    '',
    'この星座の人向けに、今日一日の運勢を上記の出力構成に沿って綴ってください。',
  ].join('\n');

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1536,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const interpretation = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!interpretation) {
      return NextResponse.json(
        { error: '鑑定文を生成できませんでした。もう一度お試しください。' },
        { status: 502 }
      );
    }

    const result: ZodiacResponse = { signId, interpretation };
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'API側のレート制限に達しました。少し時間を置いてください。' },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: 'APIキーが無効です。サーバー設定を確認してください。' },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API エラー: ${err.message}` },
        { status: 502 }
      );
    }
    console.error('zodiac API error:', err);
    return NextResponse.json(
      { error: '鑑定文の生成に失敗しました。' },
      { status: 500 }
    );
  }
}
