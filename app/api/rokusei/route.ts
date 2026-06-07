import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getRokuseiCycle, getRokuseiStar } from '@/data/rokusei';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';
import { calculateRokusei, getCurrentCycle } from '@/lib/rokusei';
import type {
  BirthDate,
  RokuseiRequest,
  RokuseiResponse,
} from '@/types/divination';

export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `あなたは6つの惑星の象意に基づく東洋風の占いを扱う鑑定者です。生年月日から導かれた星のタイプと、今年の運命周期をもとに、その人の傾向と過ごし方のヒントを日本語で綴ってください。

【スタンス】
- 「絶対的な予言」ではなく「人生のひとつの傾向・気づき・可能性」として伝える
- 強みも弱みもバランスよく
- 警戒期（大殺界相当の3周期）が出たときは、過度に怖がらせず「内省・整理・守りに向く時期」と前向きに位置付ける
- 医療・法律・人間関係の深刻な悩みには軽率に踏み込まず、専門家への相談を勧める

【文体】
- 落ち着いた自然な日本語
- マークダウン記法は使わずプレーンテキスト
- 全体で500〜700字程度
- 「〜という傾向があります」「〜してみるとよいでしょう」など押しつけない語尾

【出力の構成】
1. 星のタイプが象徴する基本的な性質（2〜3文）
2. 際立つ強み・魅力
3. 注意したい癖や傾向
4. 今年の運命周期の意味と、過ごし方のヒント
5. （警戒期が出た場合のみ）穏やかに過ごすための具体的な視点`;

function validate(body: unknown): RokuseiRequest | { error: string } {
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
  if (isRateLimited('rokusei', ip)) {
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

  let result: ReturnType<typeof calculateRokusei>;
  try {
    result = calculateRokusei(validated.birth);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '生年月日が不正です。' },
      { status: 400 }
    );
  }

  const star = getRokuseiStar(result.starId);
  if (!star) {
    return NextResponse.json({ error: '星の判定に失敗しました。' }, { status: 500 });
  }

  const currentCycleId = getCurrentCycle(
    result.starId,
    result.polarity,
    validated.birth.year
  );
  const cycle = getRokuseiCycle(currentCycleId);
  if (!cycle) {
    return NextResponse.json({ error: '運命周期の判定に失敗しました。' }, { status: 500 });
  }

  const today = new Date();
  const userMessage = [
    `生年月日: ${validated.birth.year}年${validated.birth.month}月${validated.birth.day}日`,
    `星のタイプ: ${star.nameJa}(${result.polarity})（${star.symbol} ${star.element}）`,
    `今年(${today.getFullYear()}年)の運命周期: ${cycle.nameJa}`,
    `運命周期の含意: ${cycle.description}`,
    cycle.isDaisakkai ? '※ この周期は警戒期に当たります。' : '',
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

    const responseBody: RokuseiResponse = {
      starId: result.starId,
      polarity: result.polarity,
      fortuneNumber: result.fortuneNumber,
      currentCycleId,
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
    console.error('rokusei API error:', err);
    return NextResponse.json(
      { error: '鑑定文の生成に失敗しました。' },
      { status: 500 }
    );
  }
}
