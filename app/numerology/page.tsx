'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { BirthDateInput, isCompleteBirthDate } from '@/components/BirthDateInput';
import { getLifePathProfile } from '@/data/numerology';
import { saveEntry } from '@/lib/history';
import type {
  BirthDate,
  NumerologyHistoryEntry,
  NumerologyResponse,
} from '@/types/divination';

type Phase = 'input' | 'loading' | 'result' | 'error';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function NumerologyPage() {
  const [phase, setPhase] = useState<Phase>('input');
  const [birth, setBirth] = useState<Partial<BirthDate>>({});
  const [name, setName] = useState('');
  const [result, setResult] = useState<NumerologyResponse | null>(null);
  const [submittedBirth, setSubmittedBirth] = useState<BirthDate | null>(null);
  const [submittedName, setSubmittedName] = useState<string>('');
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
      const res = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth, name: name.trim() || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<NumerologyResponse> & {
        error?: string;
      };
      if (!res.ok || !data.interpretation || typeof data.lifePathNumber !== 'number') {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const payload: NumerologyResponse = {
        lifePathNumber: data.lifePathNumber as NumerologyResponse['lifePathNumber'],
        interpretation: data.interpretation,
      };
      setResult(payload);
      setSubmittedBirth(birth);
      setSubmittedName(name.trim());

      const entry: NumerologyHistoryEntry = {
        kind: 'numerology',
        id: uuid(),
        createdAt: new Date().toISOString(),
        birth,
        name: name.trim() || undefined,
        lifePathNumber: payload.lifePathNumber,
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
    setSubmittedName('');
    setErrorMsg('');
    setValidationError('');
  }

  if (phase === 'input') {
    return (
      <div className="space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">NUMEROLOGY</p>
          <h1 className="font-serif text-3xl text-arcana-text">数秘術</h1>
          <p className="text-sm text-arcana-muted">
            生年月日から導く、あなたの人生のテーマ
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-sm text-arcana-muted">生年月日</p>
          <BirthDateInput value={birth} onChange={setBirth} />
        </section>

        <section className="space-y-2">
          <label htmlFor="num-name" className="block text-sm text-arcana-muted">
            お名前（任意）
          </label>
          <input
            id="num-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="入力すると鑑定文に反映されます"
            maxLength={100}
            className="w-full rounded-lg border border-white/10 bg-arcana-surface/60 px-4 py-3 text-arcana-text outline-none placeholder:text-arcana-muted/60 focus:border-arcana-accent/60"
          />
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
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="space-y-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">NUMEROLOGY</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-arcana-muted"
        >
          数を読み解いています
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
    const profile = getLifePathProfile(result.lifePathNumber);
    return (
      <div className="space-y-8">
        <header className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-accent">NUMEROLOGY</p>
          {submittedName && (
            <p className="text-sm text-arcana-muted">{submittedName} さん</p>
          )}
          <p className="text-xs text-arcana-muted">
            {submittedBirth.year}年{submittedBirth.month}月{submittedBirth.day}日生まれ
          </p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-arcana-muted">
            ライフパスナンバー
          </p>
          <p className="font-serif text-7xl text-arcana-accent">{result.lifePathNumber}</p>
          <p className="font-serif text-xl text-arcana-text">{profile.title}</p>
          <p className="text-sm text-arcana-muted">{profile.shortDescription}</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
