'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAnimal } from '@/data/animals';
import { getCardById } from '@/data/deck';
import { getLifePathProfile } from '@/data/numerology';
import { getSpread } from '@/data/spreads';
import { getZodiacSign } from '@/data/zodiac';
import { clearHistory, deleteEntry, loadHistory } from '@/lib/history';
import type {
  AnimalHistoryEntry,
  HistoryEntry,
  NumerologyHistoryEntry,
  ZodiacHistoryEntry,
} from '@/types/divination';
import type { Reading as TarotReading } from '@/types/tarot';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function truncate(s: string, max = 80): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

const KIND_LABELS: Record<string, string> = {
  tarot: 'タロット',
  numerology: '数秘術',
  zodiac: '星座占い',
  animal: '動物占い',
};

function summary(entry: HistoryEntry): string {
  const kind = entry.kind ?? 'tarot';
  switch (kind) {
    case 'tarot': {
      const r = entry as TarotReading;
      return truncate(r.question, 80);
    }
    case 'numerology': {
      const e = entry as NumerologyHistoryEntry;
      const profile = getLifePathProfile(e.lifePathNumber);
      return `ライフパス ${e.lifePathNumber} — ${profile.title}`;
    }
    case 'zodiac': {
      const e = entry as ZodiacHistoryEntry;
      const sign = getZodiacSign(e.signId);
      return sign ? `${sign.nameJa}の今日の運勢` : '星座占い';
    }
    case 'animal': {
      const e = entry as AnimalHistoryEntry;
      const animal = getAnimal(e.animalId);
      return animal ? `あなたは「${animal.nameJa}」` : '動物占い';
    }
    default:
      return '';
  }
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function refresh() {
    setEntries([...loadHistory()].reverse());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (entries === null) {
    return <p className="text-center text-sm text-arcana-muted">読み込み中…</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="font-serif text-3xl text-arcana-accent">履歴</h1>
        <p className="text-arcana-muted">まだ鑑定の履歴はありません。</p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block rounded-full border border-arcana-accent/60 bg-arcana-accent/10 px-6 py-2 text-sm text-arcana-accent transition hover:bg-arcana-accent/20"
          >
            占いを始める
          </Link>
        </div>
        <p className="pt-4 text-xs text-arcana-muted">
          履歴はあなたのブラウザ（localStorage）にのみ保存されます。
        </p>
      </div>
    );
  }

  function handleDelete(id: string) {
    if (typeof window !== 'undefined' && !window.confirm('この鑑定を削除しますか？')) {
      return;
    }
    deleteEntry(id);
    refresh();
    if (expandedId === id) setExpandedId(null);
  }

  function handleClearAll() {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('履歴をすべて削除しますか？この操作は取り消せません。')
    ) {
      return;
    }
    clearHistory();
    refresh();
    setExpandedId(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl text-arcana-accent">履歴</h1>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs text-arcana-muted underline-offset-2 hover:text-arcana-danger hover:underline"
        >
          すべて削除
        </button>
      </header>
      <p className="text-xs text-arcana-muted">
        {entries.length}件 — このブラウザのlocalStorageにのみ保存されています。
      </p>

      <ul className="space-y-2">
        {entries.map((e) => {
          const kind = e.kind ?? 'tarot';
          const label = KIND_LABELS[kind] ?? kind;
          const expanded = expandedId === e.id;
          return (
            <li key={e.id} className="rounded-xl border border-white/5 bg-arcana-surface/50">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : e.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={expanded}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-arcana-muted">
                    {formatDateTime(e.createdAt)} ・ {label}
                  </p>
                  <p className="truncate font-serif text-base text-arcana-text">
                    {summary(e)}
                  </p>
                </div>
                <span
                  className={`mt-1 inline-block flex-shrink-0 text-arcana-accent transition-transform ${
                    expanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 border-t border-white/5 px-4 pb-4 pt-3">
                      <Detail entry={e} />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id)}
                          className="text-xs text-arcana-muted hover:text-arcana-danger"
                        >
                          この鑑定を削除
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Detail({ entry }: { entry: HistoryEntry }) {
  const kind = entry.kind ?? 'tarot';
  if (kind === 'tarot') {
    const r = entry as TarotReading;
    const spread = getSpread(r.spreadId);
    return (
      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-arcana-muted">
            質問
          </p>
          <p className="text-sm text-arcana-text">{r.question}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-arcana-muted">
            引かれたカード
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {r.drawnCards.map((dc) => {
              const card = getCardById(dc.cardId);
              if (!card) return null;
              const pos = spread?.positions[dc.position];
              return (
                <li
                  key={`${dc.cardId}-${dc.position}`}
                  className="rounded-lg border border-white/5 bg-arcana-bg/40 px-3 py-2"
                >
                  <p className="text-[9px] text-arcana-muted">
                    {pos?.label ?? `位置${dc.position + 1}`}
                  </p>
                  <p className="text-sm text-arcana-accentSoft">
                    {card.name}
                    <span className="ml-1 text-[10px] text-arcana-muted">
                      {dc.orientation === 'upright' ? '正' : '逆'}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-arcana-muted">
            鑑定文
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-arcana-text">
            {r.interpretation}
          </p>
        </div>
      </div>
    );
  }

  if (kind === 'numerology') {
    const e = entry as NumerologyHistoryEntry;
    const profile = getLifePathProfile(e.lifePathNumber);
    return (
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <p className="font-serif text-3xl text-arcana-accent">{e.lifePathNumber}</p>
          <div>
            <p className="font-serif text-base text-arcana-text">{profile.title}</p>
            <p className="text-[10px] text-arcana-muted">
              {e.birth.year}年{e.birth.month}月{e.birth.day}日
              {e.name ? ` ・ ${e.name}` : ''}
            </p>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-arcana-text">
          {e.interpretation}
        </p>
      </div>
    );
  }

  if (kind === 'zodiac') {
    const e = entry as ZodiacHistoryEntry;
    const sign = getZodiacSign(e.signId);
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {sign && (
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-arcana-accent/30">
              <Image
                src={sign.imagePath}
                alt={sign.nameJa}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-serif text-base text-arcana-accent">
              {sign?.nameJa ?? e.signId}
            </p>
            <p className="text-[10px] text-arcana-muted">
              {e.birth.year}年{e.birth.month}月{e.birth.day}日生まれ
            </p>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-arcana-text">
          {e.interpretation}
        </p>
      </div>
    );
  }

  if (kind === 'animal') {
    const e = entry as AnimalHistoryEntry;
    const animal = getAnimal(e.animalId);
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {animal && (
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-arcana-accent/30">
              <Image
                src={animal.imagePath}
                alt={animal.nameJa}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-serif text-base text-arcana-accent">
              {animal?.nameJa ?? e.animalId}
            </p>
            <p className="text-[10px] text-arcana-muted">
              個性ナンバー {e.characterNumber} ・{' '}
              {e.birth.year}年{e.birth.month}月{e.birth.day}日生まれ
            </p>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-arcana-text">
          {e.interpretation}
        </p>
      </div>
    );
  }

  return null;
}
