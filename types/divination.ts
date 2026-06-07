// 複数の占い種別を扱うための型定義。M7で追加。

export type ZodiacSignId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export interface ZodiacSign {
  id: ZodiacSignId;
  nameJa: string;
  nameEn: string;
  glyph: string; // ♈ など
  dateRange: string; // 例: "3/21–4/19"
  element: '火' | '土' | '風' | '水';
  imagePath: string;
}

export type AnimalId =
  | 'lion'
  | 'panther'
  | 'pegasus'
  | 'wolf'
  | 'monkey'
  | 'raccoon'
  | 'fawn'
  | 'koala'
  | 'sheep'
  | 'elephant'
  | 'tiger'
  | 'cheetah';

export interface AnimalType {
  id: AnimalId;
  nameJa: string;
  nameEn: string;
  imagePath: string;
  /** カラー: 黒・茶・緑・橙・紅・青・紫・黄・銀・ピンク */
  baseColor?: string;
}

export type LifePathNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export type PalmHand = 'right' | 'left';

export type RokuseiStarId =
  | 'saturn'
  | 'venus'
  | 'mars'
  | 'uranus'
  | 'jupiter'
  | 'mercury';

export type RokuseiPolarity = '+' | '-';

export type RokuseiCycleId =
  | 'seed'
  | 'sprout'
  | 'bloom'
  | 'fragile'
  | 'achieve'
  | 'turmoil'
  | 'reunion'
  | 'wealth'
  | 'stable'
  | 'shadow'
  | 'pause'
  | 'decline';

export interface RokuseiStar {
  id: RokuseiStarId;
  nameJa: string;
  nameEn: string;
  symbol: string; // ♄♀♂♅♃☿
  element: string;
  imagePath: string;
}

export interface RokuseiCycle {
  id: RokuseiCycleId;
  nameJa: string;
  description: string;
  isDaisakkai: boolean;
}

export interface BirthDate {
  year: number; // 例: 1990
  month: number; // 1-12
  day: number; // 1-31
}

// ---- API リクエスト/レスポンス ----

export interface NumerologyRequest {
  birth: BirthDate;
  /** 任意。名前があれば表現数も計算 */
  name?: string;
}

export interface NumerologyResponse {
  lifePathNumber: LifePathNumber;
  interpretation: string;
}

export interface ZodiacRequest {
  birth: BirthDate;
}

export interface ZodiacResponse {
  signId: ZodiacSignId;
  interpretation: string;
}

export interface AnimalRequest {
  birth: BirthDate;
}

export interface AnimalResponse {
  animalId: AnimalId;
  characterNumber: number; // 1-60
  interpretation: string;
}

export interface PalmRequest {
  hand: PalmHand;
  /** data URL (data:image/jpeg;base64,...) */
  image: string;
}

export interface PalmResponse {
  hand: PalmHand;
  interpretation: string;
}

export interface RokuseiRequest {
  birth: BirthDate;
}

export interface RokuseiResponse {
  starId: RokuseiStarId;
  polarity: RokuseiPolarity;
  fortuneNumber: number; // 1-60
  currentCycleId: RokuseiCycleId; // 今年の運命周期
  interpretation: string;
}

// ---- 履歴の統合エントリ（discriminated union）----

import type { Reading as TarotReading } from './tarot';

export type HistoryEntry =
  | (TarotReading & { kind?: 'tarot' })
  | NumerologyHistoryEntry
  | ZodiacHistoryEntry
  | AnimalHistoryEntry
  | PalmHistoryEntry
  | RokuseiHistoryEntry;

export interface NumerologyHistoryEntry {
  kind: 'numerology';
  id: string;
  createdAt: string;
  birth: BirthDate;
  name?: string;
  lifePathNumber: LifePathNumber;
  interpretation: string;
}

export interface ZodiacHistoryEntry {
  kind: 'zodiac';
  id: string;
  createdAt: string;
  birth: BirthDate;
  signId: ZodiacSignId;
  interpretation: string;
}

export interface AnimalHistoryEntry {
  kind: 'animal';
  id: string;
  createdAt: string;
  birth: BirthDate;
  animalId: AnimalId;
  characterNumber: number;
  interpretation: string;
}

/**
 * 手相鑑定の履歴。画像はプライバシー保護のため一切保存しない。
 */
export interface PalmHistoryEntry {
  kind: 'palm';
  id: string;
  createdAt: string;
  hand: PalmHand;
  interpretation: string;
}

export interface RokuseiHistoryEntry {
  kind: 'rokusei';
  id: string;
  createdAt: string;
  birth: BirthDate;
  starId: RokuseiStarId;
  polarity: RokuseiPolarity;
  fortuneNumber: number;
  currentCycleId: RokuseiCycleId;
  interpretation: string;
}
