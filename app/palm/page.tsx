'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PalmImageInput } from '@/components/PalmImageInput';
import { saveEntry } from '@/lib/history';
import type {
  PalmHand,
  PalmHistoryEntry,
  PalmResponse,
} from '@/types/divination';

type Phase = 'input' | 'loading' | 'result' | 'error';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function PalmPage() {
  const [phase, setPhase] = useState<Phase>('input');
  const [hand, setHand] = useState<PalmHand>('right');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PalmResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  async function handleSubmit() {
    setValidationError('');
    if (!image) {
      setValidationError('手のひらの写真を選択してください。');
      return;
    }
    setPhase('loading');
    try {
      const res = await fetch('/api/palm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hand, image }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<PalmResponse> & {
        error?: string;
      };
      if (!res.ok || !data.interpretation || !data.hand) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const payload: PalmResponse = {
        hand: data.hand,
        interpretation: data.interpretation,
      };
      setResult(payload);

      const entry: PalmHistoryEntry = {
        kind: 'palm',
        id: uuid(),
        createdAt: new Date().toISOString(),
        hand: payload.hand,
        interpretation: payload.interpretation,
      };
      try {
        saveEntry(entry);
      } catch (err) {
        console.warn('history save failed:', err);
      }

      // プライバシー: 鑑定完了後に画像メモリを破棄
      setImage(null);
      setPhase('result');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '鑑定中にエラーが発生しました。');
      setPhase('error');
    }
  }

  function reset() {
    setPhase('input');
    setImage(null);
    setResult(null);
    setErrorMsg('');
    setValidationError('');
  }

  if (phase === 'input') {
    return (
      <div className="space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">PALM</p>
          <h1 className="font-serif text-3xl text-arcana-text">手相占い</h1>
          <p className="text-sm text-arcana-muted">
            手のひらの写真から、Claudeが線を読み解きます
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-sm text-arcana-muted">どちらの手?</p>
          <div className="grid grid-cols-2 gap-3">
            {(['right', 'left'] as const).map((h) => {
              const active = h === hand;
              const label = h === 'right' ? '右手' : '左手';
              const sub = h === 'right' ? '現在・後天的' : '生まれ持った傾向';
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHand(h)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-arcana-accent/70 bg-arcana-accent/10'
                      : 'border-white/10 bg-arcana-surface/40 hover:border-arcana-accent/30'
                  }`}
                >
                  <p className={`font-serif text-base ${active ? 'text-arcana-accent' : 'text-arcana-text'}`}>
                    {label}
                  </p>
                  <p className="mt-1 text-xs text-arcana-muted">{sub}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm text-arcana-muted">手のひらの写真</p>
          <div className="flex justify-center">
            <PalmImageInput value={image} onChange={setImage} />
          </div>
          <p className="text-[10px] text-arcana-muted">
            ヒント: 明るい場所で、指を伸ばし、手のひら全体が画面に収まるように。
          </p>
        </section>

        {validationError && (
          <p className="rounded-lg border border-arcana-danger/40 bg-arcana-danger/10 px-4 py-2 text-sm text-arcana-danger">
            {validationError}
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full border border-arcana-accent/60 bg-arcana-accent/10 px-8 py-3 font-serif text-lg text-arcana-accent transition hover:bg-arcana-accent/20"
          >
            鑑定する
          </button>
        </div>

        <p className="rounded-lg border border-white/5 bg-arcana-surface/30 px-4 py-3 text-[10px] text-arcana-muted">
          ※ 送信された画像は鑑定文の生成のみに使用し、サーバーや履歴には保存されません。鑑定文だけが履歴に記録されます。
        </p>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="space-y-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">PALM</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-arcana-muted"
        >
          手のひらを読んでいます
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            …
          </motion.span>
        </motion.p>
        <p className="text-[10px] text-arcana-muted">
          画像の解析に少し時間がかかります（10〜30秒）
        </p>
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <div className="space-y-8">
        <header className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">PALM</p>
          <h1 className="font-serif text-2xl text-arcana-text">
            {result.hand === 'right' ? '右手' : '左手'}の手相
          </h1>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-arcana-surface/60 p-6"
        >
          <h2 className="mb-3 font-serif text-lg text-arcana-accent">鑑定</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-arcana-text">
            {result.interpretation}
          </p>
        </motion.section>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-arcana-accent/60 px-6 py-2 text-sm text-arcana-accent transition hover:bg-arcana-accent/10"
          >
            もう一度
          </button>
        </div>

        <p className="text-center text-xs text-arcana-muted">
          履歴に保存されました（画像は保存されていません）。
        </p>
      </div>
    );
  }

  // error
  return (
    <div className="space-y-6">
      <header className="space-y-1 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-arcana-danger">ERROR</p>
        <h1 className="font-serif text-2xl text-arcana-text">鑑定を生成できませんでした</h1>
      </header>
      <p className="rounded-lg border border-arcana-danger/40 bg-arcana-danger/10 px-4 py-3 text-sm text-arcana-danger">
        {errorMsg}
      </p>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-arcana-accent/60 bg-arcana-accent/10 px-6 py-2 text-sm text-arcana-accent transition hover:bg-arcana-accent/20"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
