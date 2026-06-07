import type { HistoryEntry } from '@/types/divination';

// localStorage キー（バージョン付き）。スキーマ変更時はキーを bump する。
const KEY = 'arcana:history:v1';
const MAX_ENTRIES = 100;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isValidEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  if (
    typeof r.id !== 'string' ||
    typeof r.createdAt !== 'string' ||
    typeof r.interpretation !== 'string'
  ) {
    return false;
  }
  // kind 未指定は tarot として扱う（後方互換）
  const kind = r.kind ?? 'tarot';
  switch (kind) {
    case 'tarot':
      return (
        typeof r.question === 'string' &&
        typeof r.spreadId === 'string' &&
        Array.isArray(r.drawnCards)
      );
    case 'numerology':
      return !!r.birth && typeof r.lifePathNumber === 'number';
    case 'zodiac':
      return !!r.birth && typeof r.signId === 'string';
    case 'animal':
      return !!r.birth && typeof r.animalId === 'string';
    case 'palm':
      return r.hand === 'right' || r.hand === 'left';
    default:
      return false;
  }
}

function normalizeKind(entry: HistoryEntry): HistoryEntry {
  if (!('kind' in entry) || entry.kind === undefined) {
    return { ...entry, kind: 'tarot' } as HistoryEntry;
  }
  return entry;
}

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry).map(normalizeKind);
  } catch {
    return [];
  }
}

export function saveEntry(entry: HistoryEntry): void {
  if (!isBrowser()) return;
  const list = loadHistory();
  list.push(normalizeKind(entry));
  const trimmed = list.slice(-MAX_ENTRIES);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // Quota超過やプライベートモード等で失敗してもアプリ側は致命的ではない。
  }
}

// 旧名（タロット時代）互換
export const saveReading = saveEntry;

export function deleteEntry(id: string): void {
  if (!isBrowser()) return;
  const list = loadHistory().filter((r) => r.id !== id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // 無視
  }
}

export const deleteReading = deleteEntry;

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 無視
  }
}
