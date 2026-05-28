'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { BirthDateInput, isCompleteBirthDate } from '@/components/BirthDateInput';
import { getZodiacSign } from '@/data/zodiac';
import { saveEntry } from '@/lib/history';
import type {
  BirthDate,
  ZodiacHistoryEntry,
  ZodiacResponse,
} from '@/types/divination';

type Phase = 'input' | 'loading' | 'result' | 'error';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ZodiacPage() {
  const [phase, setPhase] = useState<Phase>('input');
  const [birth, setBirth] = useState<Partial<BirthDate>>({});
  const [result, setResult] = useState<ZodiacResponse | null>(null);
  const [submittedBirth, setSubmittedBirth] = useState<BirthDate | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  async function handleSubmit() {
    setValidationError('');
    if (!isCompleteBirthDate(birth)) {
      setValidationError('生年月日をすべて入力してください。');
      return;
    }
    setPhase('loading');
    try {
      const res = await fetch('/api/zodiac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<ZodiacResponse> & {
        error?: string;
      };
      if (!res.ok || !data.interpretation || !data.signId) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const payload: ZodiacResponse = {
        signId: data.signId,
        interpretation: data.interpretation,
      };
      setResult(payload);
      setSubmittedBirth(birth);

      const entry: ZodiacHistoryEntry = {
        kind: 'zodiac',
        id: uuid(),
        createdAt: new Date().toISOString(),
        birth,
        signId: payload.signId,
        interpretation: payload.interpretation,
      };
      try {
        saveEntry(entry);
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
    setResult(null);
    setSubmittedBirth(null);
    setErrorMsg('');
    setValidationError('');
  }

  if (phase === 'input') {
    return (
      <div className="space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">ZODIAC</p>
          <h1 className="font-serif text-3xl text-arcana-text">星座占い</h1>
          <p className="text-sm text-arcana-muted">
            あなたの星座から、今日一日の運勢を読み解きます
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-sm text-arcana-muted">生年月日</p>
          <BirthDateInput value={birth} onChange={setBirth} />
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
            今日の運勢を読む
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="space-y-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">ZODIAC</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-arcana-muted"
        >
          星を読んでいます
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            …
          </motion.span>
        </motion.p>
      </div>
    );
  }

  if (phase === 'result' && result && submittedBirth) {
    const sign = getZodiacSign(result.signId);
    if (!sign) {
      return <p className="text-center text-arcana-muted">星座データが見つかりません</p>;
    }
    return (
      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative h-[200px] w-[200px] overflow-hidden rounded-2xl border border-arcana-accent/30 shadow-[0_0_30px_-10px_rgba(200,169,106,0.5)]">
            <Image
              src={sign.imagePath}
              alt={sign.nameJa}
              fill
              sizes="200px"
              className="object-cover"
              priority
            />
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-arcana-muted">
              {sign.nameEn}
            </p>
            <h2 className="font-serif text-2xl text-arcana-accent">{sign.nameJa}</h2>
            <p className="text-xs text-arcana-muted">
              {sign.dateRange} ・ {sign.element}のエレメント
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-white/5 bg-arcana-surface/60 p-6"
        >
          <h2 className="mb-3 font-serif text-lg text-arcana-accent">今日の運勢</h2>
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
          履歴に保存されました。
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
