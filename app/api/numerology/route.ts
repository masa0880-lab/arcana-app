import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getLifePathProfile } from '@/data/numerology';
import { calculateLifePath } from '@/lib/numerology';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';
import type {
  BirthDate,
  NumerologyRequest,
  NumerologyResponse,
} from '@/types/divination';

export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `あなたは数秘術（Numerology）に精通した鑑定者です。生年月日から導かれたライフパスナンバーをもとに、その人の人生のテーマと特性を日本語で読み解いてください。

【スタンス】
- 「絶対的な予言」ではなく「人生のひとつの傾向・気づき・可能性」として伝える
- 強みだけでなく注意点もバランスよく
- 医療・法律・人間関係の深刻な悩みには軽率に踏み込まず、専門家への相談を勧める

【文体】
- 落ち着いた自然な日本語
- 「〜という傾向があります」「〜してみてもよいでしょう」など押しつけない語尾
- マークダウン記法は使わずプレーンテキスト
- 全体で400〜600字程度

【出力の構成】
1. ライフパスナンバーが象徴する人生のテーマ（2〜3文）
2. 強みや活かしやすい資質
3. 注意したい傾向・課題
4. 日々の暮らしに活かすヒント`;

function validate(body: unknown): NumerologyRequest | { error: string } {
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
  const name = typeof b.name === 'string' && b.name.trim() ? b.name.trim() : undefined;
  if (name && name.length > 100) {
    return { error: '名前は100文字以内でお願いします。' };
  }
  return { birth: { year, month, day } as BirthDate, name };
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
  if (isRateLimited('numerology', ip)) {
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

  let lifePathNumber: ReturnType<typeof calculateLifePath>;
  try {
    lifePathNumber = calculateLifePath(validated.birth);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '生年月日が不正です。' },
      { status: 400 }
    );
  }

  const profile = getLifePathProfile(lifePathNumber);

  const userMessage = [
    `生年月日: ${validated.birth.year}年${validated.birth.month}月${validated.birth.day}日`,
    validated.name ? `名前: ${validated.name}` : '',
    '',
    `ライフパスナンバー: ${lifePathNumber}（${profile.title}）`,
    `テーマ: ${profile.shortDescription}`,
    `強み: ${profile.keywords.strengths.join('、')}`,
    `注意点: ${profile.keywords.challenges.join('、')}`,
    '',
    '上記をふまえて、出力構成に沿って鑑定文をお願いします。',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
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

    const result: NumerologyResponse = { lifePathNumber, interpretation };
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
    console.error('numerology API error:', err);
    return NextResponse.json(
      { error: '鑑定文の生成に失敗しました。' },
      { status: 500 }
    );
  }
}
