'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCardById } from '@/data/deck';
import { getSpread } from '@/data/spreads';
import { clearHistory, deleteReading, loadHistory } from '@/lib/history';
import type { Reading } from '@/types/tarot';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function truncate(s: string, max = 60): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

export default function HistoryPage() {
  const [readings, setReadings] = useState<Reading[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function refresh() {
    // 新しい順に表示（保存は末尾追加なので reverse）
    setReadings([...loadHistory()].reverse());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (readings === null) {
    return (
      <p className="text-center text-sm text-arcana-muted">読み込み中…</p>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="font-serif text-3xl text-arcana-accent">履歴</h1>
        <p className="text-arcana-muted">
          まだ占いの履歴はありません。
        </p>
        <div className="pt-2">
          <Link
            href="/reading"
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
    deleteReading(id);
    refresh();
    if (expandedId === id) setExpandedId(null);
  }

  function handleClearAll() {
    if (typeof window !== 'undefined' && !window.confirm('履歴をすべて削除しますか？この操作は取り消せません。')) {
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
        {readings.length}件 — このブラウザのlocalStorageにのみ保存されています。
      </p>

      <ul className="space-y-2">
        {readings.map((r) => {
          const spread = getSpread(r.spreadId);
          const expanded = expandedId === r.id;
          return (
            <li
              key={r.id}
              className="rounded-xl border border-white/5 bg-arcana-surface/50"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : r.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={expanded}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-arcana-muted">
                    {formatDateTime(r.createdAt)} ・ {spread?.name ?? r.spreadId}
                  </p>
                  <p className="truncate font-serif text-base text-arcana-text">
                    {truncate(r.question, 80)}
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
                      <ReadingDetail reading={r} />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
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

function ReadingDetail({ reading }: { reading: Reading }) {
  const spread = getSpread(reading.spreadId);
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-arcana-muted">
          引かれたカード
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {reading.drawnCards.map((dc) => {
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
          {reading.interpretation}
        </p>
      </div>
    </div>
  );
}
