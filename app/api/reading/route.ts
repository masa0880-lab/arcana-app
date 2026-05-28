import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getCardById } from '@/data/deck';
import { getSpread } from '@/data/spreads';
import type {
  DrawnCard,
  ReadingRequest,
  ReadingResponse,
  Spread,
} from '@/types/tarot';

export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
// 単一インスタンス前提の素朴な実装。Vercelのサーバーレスではコールドスタートでリセットされ
// 完全には防げないが、悪意のない連打抑止には十分。本格運用ではUpstash Redis等を検討する。
const ipBuckets = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = (ipBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (bucket.length >= RATE_LIMIT) {
    ipBuckets.set(ip, bucket);
    return true;
  }
  bucket.push(now);
  ipBuckets.set(ip, bucket);
  return false;
}

const SYSTEM_PROMPT = `あなたは経験豊富で誠実なタロット占い師です。ユーザーが引いたカードと質問をもとに、思いやりがあり、現実的で、内省を促す鑑定文を日本語で綴ってください。

【スタンス】
- 占いの結果を「絶対的な予言」として書かず、「ひとつの視点・気づき・可能性」として提示する
- 励ましだけに偏らず、課題や注意点も率直に伝える
- 医療・法律・自傷・他者への加害など、安全に関わる内容には軽率に踏み込まず、必要に応じて専門家への相談を勧める

【文体】
- 落ち着いた自然な日本語。詩的すぎない、占い師らしい穏やかな語り
- 読み手の主体性を尊重する語尾（「〜してみてもよいでしょう」「〜という選択肢もあります」）
- マークダウン記法（**, # など）は使わずプレーンテキスト
- 全体で400〜600字程度

【スプレッド別の読み方】
- single（1枚）: 質問への核となる助言を1枚から読み解く
- three-card（3枚）: 過去・現在・未来を流れる物語として繋ぐ
- celtic-cross（10枚）: 各位置の役割を踏まえて状況を多面的に読み解く

【出力の構成】
1. 各カードについて1〜2文の短い解釈（位置の意味と正逆をふまえる）
2. 質問への総合的な答え（数文〜1段落）`;

function buildUserMessage(
  question: string,
  spread: Spread,
  drawnCards: DrawnCard[]
): string {
  const lines: string[] = [];
  lines.push(`質問: ${question}`);
  lines.push('');
  lines.push(`スプレッド: ${spread.name}（${spread.description}）`);
  lines.push('');
  lines.push('引かれたカード:');
  for (const dc of drawnCards) {
    const card = getCardById(dc.cardId);
    if (!card) {
      throw new Error(`unknown card id: ${dc.cardId}`);
    }
    const position = spread.positions[dc.position];
    const orientationJa = dc.orientation === 'upright' ? '正位置' : '逆位置';
    const keywords =
      dc.orientation === 'upright' ? card.keywords.upright : card.keywords.reversed;
    const posLabel = position
      ? `位置${dc.position + 1}「${position.label}」（${position.meaningEn}）`
      : `位置${dc.position + 1}`;
    lines.push(
      `- ${posLabel}: ${card.name} / ${card.nameEn}（${orientationJa}） — キーワード: ${keywords.join('、')}`
    );
  }
  lines.push('');
  lines.push('上記をふまえて、上で示した出力構成に沿って鑑定文をお願いします。');
  return lines.join('\n');
}

function validate(body: unknown): ReadingRequest | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'リクエストボディが不正です。' };
  }
  const b = body as Record<string, unknown>;
  if (typeof b.question !== 'string' || b.question.trim().length === 0) {
    return { error: '質問を入力してください。' };
  }
  if (b.question.length > 500) {
    return { error: '質問は500文字以内でお願いします。' };
  }
  if (typeof b.spreadId !== 'string') {
    return { error: 'スプレッドが選択されていません。' };
  }
  const spread = getSpread(b.spreadId);
  if (!spread) {
    return { error: 'スプレッドが不正です。' };
  }
  if (!Array.isArray(b.drawnCards) || b.drawnCards.length !== spread.cardCount) {
    return { error: 'カード枚数がスプレッドと一致しません。' };
  }
  const drawn: DrawnCard[] = [];
  for (let i = 0; i < b.drawnCards.length; i++) {
    const raw = b.drawnCards[i] as Record<string, unknown>;
    if (
      !raw ||
      typeof raw.cardId !== 'string' ||
      (raw.orientation !== 'upright' && raw.orientation !== 'reversed') ||
      typeof raw.position !== 'number'
    ) {
      return { error: `カード情報が不正です（${i + 1}枚目）。` };
    }
    if (!getCardById(raw.cardId)) {
      return { error: `存在しないカードIDです: ${raw.cardId}` };
    }
    drawn.push({
      cardId: raw.cardId,
      orientation: raw.orientation,
      position: raw.position,
    });
  }
  return {
    question: b.question.trim(),
    spreadId: b.spreadId as ReadingRequest['spreadId'],
    drawnCards: drawn,
  };
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
  if (isRateLimited(ip)) {
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

  const spread = getSpread(validated.spreadId);
  if (!spread) {
    return NextResponse.json({ error: 'スプレッドが不正です。' }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserMessage(validated.question, spread, validated.drawnCards),
        },
      ],
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

    const result: ReadingResponse = { interpretation };
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
    console.error('reading API error:', err);
    return NextResponse.json(
      { error: '鑑定文の生成に失敗しました。' },
      { status: 500 }
    );
  }
}
