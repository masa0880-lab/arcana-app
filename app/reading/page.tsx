'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { SpreadLayout } from '@/components/SpreadLayout';
import { SPREADS, getSpread } from '@/data/spreads';
import { drawCards } from '@/lib/deck';
import { saveReading } from '@/lib/history';
import type { DrawnCard, Reading, ReadingResponse, SpreadId } from '@/types/tarot';

type Phase = 'input' | 'revealing' | 'loading' | 'result' | 'error';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateSeed(): string {
  // crypto.randomUUID は安全な現代ブラウザで利用可。
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ReadingPage() {
  const [phase, setPhase] = useState<Phase>('input');
  const [question, setQuestion] = useState('');
  const [spreadId, setSpreadId] = useState<SpreadId>('single');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [interpretation, setInterpretation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  const spread = getSpread(spreadId)!;

  async function handleStart() {
    setValidationError('');
    const trimmed = question.trim();
    if (!trimmed) {
      setValidationError('質問を入力してください。');
      return;
    }
    if (trimmed.length > 500) {
      setValidationError('質問は500文字以内でお願いします。');
      return;
    }

    const seed = generateSeed();
    const cards = drawCards(spread.cardCount, seed);
    setDrawnCards(cards);
    setRevealedCount(0);
    setPhase('revealing');

    // 演出: 1枚ずつ順番にめくる（枚数が多いケルト十字は速める）
    const stagger = spread.cardCount >= 10 ? 250 : 600;
    for (let i = 1; i <= cards.length; i++) {
      await sleep(stagger);
      setRevealedCount(i);
    }
    await sleep(400);

    // API呼び出し
    setPhase('loading');
    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, spreadId, drawnCards: cards }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<ReadingResponse> & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `鑑定の生成に失敗しました（HTTP ${res.status}）`);
      }
      if (!data.interpretation) {
        throw new Error('鑑定文の取得に失敗しました。');
      }
      setInterpretation(data.interpretation);

      const reading: Reading = {
        id: generateSeed(),
        createdAt: new Date().toISOString(),
        question: trimmed,
        spreadId,
        drawnCards: cards,
        interpretation: data.interpretation,
        seed,
      };
      try {
        saveReading(reading);
      } catch (err) {
        console.warn('history save failed:', err);
      }

      setPhase('result');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '鑑定中にエラーが発生しました。');
      setPhase('error');
    }
  }

  function reset() {
    setPhase('input');
    setQuestion('');
    setDrawnCards([]);
    setRevealedCount(0);
    setInterpretation('');
    setErrorMsg('');
    setValidationError('');
  }

  function retryFromError() {
    setPhase('input');
    setDrawnCards([]);
    setRevealedCount(0);
    setErrorMsg('');
  }

  if (phase === 'input') {
    return (
      <div className="space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">READING</p>
          <h1 className="font-serif text-3xl text-arcana-text">心に問いを浮かべて</h1>
          <p className="text-sm text-arcana-muted">
            質問とスプレッドを選んだら、カードを引きます。
          </p>
        </header>

        <section className="space-y-2">
          <label htmlFor="question" className="block text-sm text-arcana-muted">
            質問
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例: 来月の仕事のテーマは何ですか？"
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-arcana-surface/60 px-4 py-3 text-arcana-text outline-none placeholder:text-arcana-muted/60 focus:border-arcana-accent/60"
          />
          <p className="text-right text-xs text-arcana-muted">{question.length} / 500</p>
        </section>

        <section className="space-y-3">
          <p className="text-sm text-arcana-muted">スプレッド</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SPREADS.map((s) => {
              const active = s.id === spreadId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSpreadId(s.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-arcana-accent/70 bg-arcana-accent/10'
                      : 'border-white/10 bg-arcana-surface/40 hover:border-arcana-accent/30'
                  }`}
                >
                  <p
                    className={`font-serif text-base ${
                      active ? 'text-arcana-accent' : 'text-arcana-text'
                    }`}
                  >
                    {s.name}
                  </p>
                  <p className="mt-1 text-xs text-arcana-muted">
                    {s.cardCount}枚 — {s.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {validationError && (
          <p className="rounded-lg border border-arcana-danger/40 bg-arcana-danger/10 px-4 py-2 text-sm text-arcana-danger">
            {validationError}
          </p>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full border border-arcana-accent/60 bg-arcana-accent/10 px-8 py-3 font-serif text-lg text-arcana-accent transition hover:bg-arcana-accent/20"
          >
            カードを引く
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'revealing' || phase === 'loading') {
    return (
      <div className="space-y-8">
        <header className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">
            {spread.name}
          </p>
          <p className="text-arcana-muted text-sm">「{question}」</p>
        </header>

        <div className="flex justify-center">
          <SpreadLayout
            spread={spread}
            drawnCards={drawnCards}
            revealedCount={revealedCount}
          />
        </div>

        {phase === 'loading' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-arcana-muted"
          >
            鑑定中
            <motion.span
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              …
            </motion.span>
          </motion.p>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="space-y-8">
        <header className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">
            {spread.name}
          </p>
          <p className="text-arcana-muted text-sm">「{question}」</p>
        </header>

        <div className="flex justify-center">
          <SpreadLayout
            spread={spread}
            drawnCards={drawnCards}
            revealedCount={drawnCards.length}
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/5 bg-arcana-surface/60 p-6"
        >
          <h2 className="mb-3 font-serif text-lg text-arcana-accent">鑑定</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-arcana-text">
            {interpretation}
          </div>
        </motion.section>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-arcana-accent/60 px-6 py-2 text-sm text-arcana-accent transition hover:bg-arcana-accent/10"
          >
            もう一度引く
          </button>
        </div>

        <p className="text-center text-xs text-arcana-muted">
          この鑑定は履歴に保存されました。
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
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={retryFromError}
          className="rounded-full border border-arcana-accent/60 bg-arcana-accent/10 px-6 py-2 text-sm text-arcana-accent transition hover:bg-arcana-accent/20"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
