import type {
  BirthDate,
  RokuseiCycleId,
  RokuseiPolarity,
  RokuseiStarId,
} from '@/types/divination';
import { calculateCharacterNumber } from './animal';
import { validateBirth } from './numerology';

// 本実装は細木数子氏/同名団体の「六星占術®」とは無関係の独立アルゴリズム。
// 動物占いと共通の 1925 基点 60サイクルを流用し、6グループ(10ずつ)に分割する。

function bucketFromFortuneNumber(n: number): {
  starId: RokuseiStarId;
  polarity: RokuseiPolarity;
} {
  if (n < 1 || n > 60) {
    throw new Error(`fortune number out of range: ${n}`);
  }
  const idx = Math.floor((n - 1) / 10); // 0..5
  const starIds: RokuseiStarId[] = [
    'saturn',
    'venus',
    'mars',
    'uranus',
    'jupiter',
    'mercury',
  ];
  const starId = starIds[idx];
  // 各10の前半5つを (+)、後半5つを (-) に振り分け
  const within = ((n - 1) % 10) + 1; // 1..10
  const polarity: RokuseiPolarity = within <= 5 ? '+' : '-';
  return { starId, polarity };
}

/**
 * 生年月日から、6星人/陰陽/運命数を算出。
 */
export function calculateRokusei(birth: BirthDate): {
  starId: RokuseiStarId;
  polarity: RokuseiPolarity;
  fortuneNumber: number;
} {
  validateBirth(birth);
  const fortuneNumber = calculateCharacterNumber(birth);
  const { starId, polarity } = bucketFromFortuneNumber(fortuneNumber);
  return { starId, polarity, fortuneNumber };
}

/**
 * 現在年(またはtargetYear)の運命周期を算出。
 * シンプルなオフセット方式: (年 - 生年 + 星固有のオフセット) mod 12 で周期インデックス。
 * 同じ年・同じ星人なら全員同じ周期に位置する近似実装。
 */
const STAR_OFFSETS: Record<RokuseiStarId, number> = {
  saturn: 0,
  venus: 2,
  mars: 4,
  uranus: 6,
  jupiter: 8,
  mercury: 10,
};

const CYCLE_ORDER: RokuseiCycleId[] = [
  'seed',
  'sprout',
  'bloom',
  'fragile',
  'achieve',
  'turmoil',
  'reunion',
  'wealth',
  'stable',
  'shadow',
  'pause',
  'decline',
];

export function getCurrentCycle(
  starId: RokuseiStarId,
  polarity: RokuseiPolarity,
  birthYear: number,
  targetYear: number = new Date().getFullYear()
): RokuseiCycleId {
  const offset = STAR_OFFSETS[starId] + (polarity === '-' ? 6 : 0);
  const idx = (((targetYear - birthYear + offset) % 12) + 12) % 12;
  return CYCLE_ORDER[idx];
}
