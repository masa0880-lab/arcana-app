import type { Card, DrawnCard } from '@/types/tarot';
import { DECK } from '@/data/deck';

// 決定論的な擬似乱数生成器（Mulberry32）。seedが同じなら同じ列を返す。
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a 32bitハッシュ。文字列seed → 数値seed。
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function makeRng(seed?: string): () => number {
  if (seed === undefined) {
    return Math.random;
  }
  return mulberry32(hashString(seed));
}

/**
 * Fisher–Yatesで78枚を非破壊的にシャッフルする。
 * seedを渡すと結果が決定論的になる（履歴再現用）。
 */
export function shuffleDeck(seed?: string): Card[] {
  const rng = makeRng(seed);
  const arr = DECK.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * count枚を引き、各カードに正位置/逆位置をランダム付与する。
 * seedを渡すとシャッフルも正逆も決定論的になる。
 */
export function drawCards(count: number, seed?: string): DrawnCard[] {
  if (count < 0) {
    throw new Error('drawCards: count must be >= 0');
  }
  if (count > DECK.length) {
    throw new Error(`drawCards: count (${count}) exceeds deck size (${DECK.length})`);
  }
  // 正逆判定にもseedを使うが、シャッフルと同じ乱数列を共有する。
  const rng = makeRng(seed);
  const shuffled = DECK.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, count);
  return picked.map((card, index) => ({
    cardId: card.id,
    orientation: rng() < 0.5 ? 'upright' : 'reversed',
    position: index,
  }));
}

/**
 * 日付（ローカルタイム）をシードに、その日固定の1枚を返す。
 * 同じ日に何度呼んでも同じカード・同じ正逆。
 */
export function getDailyCard(date: Date = new Date()): DrawnCard {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const seed = `daily-${y}-${m}-${d}`;
  return drawCards(1, seed)[0];
}

export function dailySeed(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `daily-${y}-${m}-${d}`;
}
