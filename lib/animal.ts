import type { AnimalId, BirthDate } from '@/types/divination';
import { validateBirth } from './numerology';

// 公開されている個性ナンバー算出ロジック（参考: 1920–2100年範囲のオフセット表方式）。
// 本実装は公開情報を元にしたオリジナル実装で、本家「動物占い」アルゴリズムとは
// 細部が異なる可能性がある。鑑定文はすべてClaudeによるオリジナル生成。

// 各年の起点オフセット（年表アプローチ）
// 1925年を基点として 365日サイクル+うるう年で1年ごとに ((365 or 366) mod 60) を累積する。
// 起点となる 1925/1/1 の個性ナンバー = 26 を基準。

const BASE_YEAR = 1925;
const BASE_OFFSET = 26; // 1925/1/1 の個性ナンバー = 26（公開資料準拠の近似値）

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/**
 * 生年月日から個性ナンバー (1..60) を算出。
 */
export function calculateCharacterNumber(birth: BirthDate): number {
  validateBirth(birth);
  const { year, month, day } = birth;

  let offset = BASE_OFFSET;

  // BASE_YEAR から year-1 までの日数を加算
  for (let y = BASE_YEAR; y < year; y++) {
    offset += isLeapYear(y) ? 366 : 365;
  }
  // 当年の月初までの日数
  for (let m = 1; m < month; m++) {
    offset += daysInMonth(year, m);
  }
  // 当月の日数
  offset += day - 1;

  const mod = ((offset - 1) % 60 + 60) % 60 + 1; // 1..60
  return mod;
}

/**
 * 個性ナンバー (1..60) から12動物への割り当て。
 * 60キャラクターを 12 動物 × 5 個性タイプに分配する。
 * 順番は公開資料を参考にした近似マッピング。
 */
const ANIMAL_BUCKETS: Array<{ from: number; to: number; id: AnimalId }> = [
  { from: 1, to: 5, id: 'cheetah' },
  { from: 6, to: 10, id: 'lion' },
  { from: 11, to: 15, id: 'pegasus' },
  { from: 16, to: 20, id: 'sheep' },
  { from: 21, to: 25, id: 'monkey' },
  { from: 26, to: 30, id: 'fawn' },
  { from: 31, to: 35, id: 'wolf' },
  { from: 36, to: 40, id: 'tiger' },
  { from: 41, to: 45, id: 'koala' },
  { from: 46, to: 50, id: 'elephant' },
  { from: 51, to: 55, id: 'raccoon' },
  { from: 56, to: 60, id: 'panther' },
];

export function getAnimalFromCharacterNumber(num: number): AnimalId {
  for (const b of ANIMAL_BUCKETS) {
    if (num >= b.from && num <= b.to) return b.id;
  }
  throw new Error(`character number out of range: ${num}`);
}

export function getAnimalFromBirth(birth: BirthDate): {
  characterNumber: number;
  animalId: AnimalId;
} {
  const n = calculateCharacterNumber(birth);
  return { characterNumber: n, animalId: getAnimalFromCharacterNumber(n) };
}
