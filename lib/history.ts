import type { Reading } from '@/types/tarot';

// localStorage キー（バージョン付き）。スキーマ変更時はキーを bump する。
const KEY = 'arcana:history:v1';
const MAX_ENTRIES = 100;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isValidReading(value: unknown): value is Reading {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.createdAt === 'string' &&
    typeof r.question === 'string' &&
    typeof r.spreadId === 'string' &&
    Array.isArray(r.drawnCards) &&
    typeof r.interpretation === 'string'
  );
}

export function loadHistory(): Reading[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidReading);
  } catch {
    return [];
  }
}

export function saveReading(reading: Reading): void {
  if (!isBrowser()) return;
  const list = loadHistory();
  list.push(reading);
  const trimmed = list.slice(-MAX_ENTRIES);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // Quota超過やプライベートモード等で失敗してもアプリ側は致命的ではない。
  }
}

export function deleteReading(id: string): void {
  if (!isBrowser()) return;
  const list = loadHistory().filter((r) => r.id !== id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // 無視
  }
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 無視
  }
}
