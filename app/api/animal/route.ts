import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getAnimal } from '@/data/animals';
import { getAnimalFromBirth } from '@/lib/animal';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';
import type { AnimalRequest, AnimalResponse, BirthDate } from '@/types/divination';

export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `あなたは動物のキャラクターに人の性格を重ねて読み解く鑑定者です。生年月日から導かれた動物タイプをもとに、その人の性格と日常を彩るヒントを日本語で綴ってください。

【スタンス】
- 「決定論的なラベル」ではなく「自分を知るためのひとつの視点」として伝える
- 強みも弱みもバランスよく
- 医療・法律・他者との深刻な対立など重い悩みには軽率に踏み込まず、専門家への相談を勧める

【文体】
- 親しみやすく落ち着いた日本語
- マークダウン記法は使わずプレーンテキスト
- 全体で500〜700字程度
- 「〜なところがあります」「〜してみるとよいでしょう」など押しつけない語尾

【出力の構成】
1. その動物が象徴する性格の核（2〜3文）
2. 際立った強み・魅力
3. 注意したい癖や傾向
4. 人間関係でのヒント
5. 日常で意識すると良いこと`;

function validate(body: unknown): AnimalRequest | { error: string } {
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
  if (isRateLimited('animal', ip)) {
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

  let result: ReturnType<typeof getAnimalFromBirth>;
  try {
    result = getAnimalFromBirth(validated.birth);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '生年月日が不正です。' },
      { status: 400 }
    );
  }
  const animal = getAnimal(result.animalId);
  if (!animal) {
    return NextResponse.json({ error: '動物の判定に失敗しました。' }, { status: 500 });
  }

  const userMessage = [
    `生年月日: ${validated.birth.year}年${validated.birth.month}月${validated.birth.day}日`,
    `動物タイプ: ${animal.nameJa}（${animal.nameEn}）`,
    animal.baseColor ? `ベースカラー: ${animal.baseColor}` : '',
    `個性ナンバー: ${result.characterNumber}`,
    '',
    '上記の動物タイプから読み取れる性格を、出力構成に沿って綴ってください。',
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

    const responseBody: AnimalResponse = {
      animalId: result.animalId,
      characterNumber: result.characterNumber,
      interpretation,
    };
    return NextResponse.json(responseBody);
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
    console.error('animal API error:', err);
    return NextResponse.json(
      { error: '鑑定文の生成に失敗しました。' },
      { status: 500 }
    );
  }
}
