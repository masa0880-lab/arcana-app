import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';
import type { PalmHand, PalmRequest, PalmResponse } from '@/types/divination';

export const runtime = 'nodejs';

// 画像を含むためレスポンスサイズ・実行時間の上限を緩める
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

// Anthropic Vision推奨: 5MB以下、長辺1568px以下
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const SYSTEM_PROMPT = `あなたは手相鑑定の経験豊富な鑑定者です。送られてきた手のひらの写真から、見える線や特徴をもとに鑑定文を日本語で綴ってください。

【スタンス】
- 「絶対的な未来予言」ではなく「今の傾向・気づき・可能性のひとつ」として伝える
- 写真から読み取れる範囲のことだけを述べ、判断できない場合は素直にその旨を書く
- 励ましだけでなく注意点も率直に
- 医療・健康・寿命に関わる断定は避け、不安なときは医療機関の受診を勧める

【着目する線（写真で見える範囲）】
- 生命線（親指の付け根から手首方向へ）— 体力・気力・人生の流れ
- 知能線/頭脳線（親指と人差し指の間から手のひら中央へ）— 思考の傾向
- 感情線（小指の下から人差し指方向へ）— 感情・人間関係
- 運命線（手のひら中央を縦に走る線）— 仕事・目的意識
- 補助線・特徴的な印（島・分岐・障害線など）— 気づくものがあれば

【文体】
- 落ち着いた自然な日本語、占い師らしい穏やかな語り
- マークダウン記法（**, # など）は使わずプレーンテキスト
- 全体で500〜700字程度
- 「〜という傾向が見えます」「〜してみてもよいでしょう」など押しつけない語尾

【出力の構成】
1. 全体的な印象（手のひら・指の様子、線の濃淡など、2〜3文）
2. 各主要線について、見える範囲での読み解き
3. 暮らしに活かすヒント・気をつけたい点
4. （写真がぼけている、線がよく見えない等あれば）どこを撮り直すと読みやすくなるかを最後に一文添える`;

function validate(body: unknown): PalmRequest | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'リクエストボディが不正です。' };
  }
  const b = body as Record<string, unknown>;
  if (b.hand !== 'right' && b.hand !== 'left') {
    return { error: '手の指定が不正です（right または left）。' };
  }
  if (typeof b.image !== 'string' || b.image.length === 0) {
    return { error: '画像が指定されていません。' };
  }
  if (!b.image.startsWith('data:image/')) {
    return { error: '画像形式が不正です。' };
  }
  return { hand: b.hand as PalmHand, image: b.image };
}

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  return { mediaType: m[1], base64: m[2] };
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
  if (isRateLimited('palm', ip)) {
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

  const parsed = parseDataUrl(validated.image);
  if (!parsed) {
    return NextResponse.json({ error: '画像形式が不正です。' }, { status: 400 });
  }
  if (!ALLOWED_MEDIA_TYPES.has(parsed.mediaType)) {
    return NextResponse.json(
      { error: 'JPEG / PNG / WebP 形式のみ対応しています。' },
      { status: 400 }
    );
  }
  // base64の概算デコードサイズチェック
  const approxBytes = Math.floor(parsed.base64.length * 0.75);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: '画像サイズが大きすぎます（5MB以下にしてください）。' },
      { status: 413 }
    );
  }

  const handJa = validated.hand === 'right' ? '右手' : '左手';
  const userMessage = `添付した${handJa}の手のひらの写真を、上記の出力構成に沿って鑑定してください。`;

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
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: parsed.mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
                data: parsed.base64,
              },
            },
            { type: 'text', text: userMessage },
          ],
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

    const result: PalmResponse = { hand: validated.hand, interpretation };
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
    if (err instanceof Anthropic.BadRequestError) {
      return NextResponse.json(
        { error: `Claude API: ${err.message}` },
        { status: 400 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API エラー: ${err.message}` },
        { status: 502 }
      );
    }
    console.error('palm API error:', err);
    return NextResponse.json(
      { error: '鑑定文の生成に失敗しました。' },
      { status: 500 }
    );
  }
}
