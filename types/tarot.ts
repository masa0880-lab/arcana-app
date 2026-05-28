// arcana-app のドメイン型。詳細は docs/DATA_MODEL.md を参照。

export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Orientation = 'upright' | 'reversed';
export type SpreadId = 'single' | 'three-card' | 'celtic-cross';

export interface Card {
  id: string;
  name: string;
  nameEn: string;
  arcana: Arcana;
  suit?: Suit;
  number: number;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  imagePath: string;
}

export interface DrawnCard {
  cardId: string;
  orientation: Orientation;
  position: number;
}

export interface SpreadPosition {
  index: number;
  label: string;
  meaningEn: string;
}

export interface Spread {
  id: SpreadId;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export interface Reading {
  id: string;
  createdAt: string;
  question: string;
  spreadId: SpreadId;
  drawnCards: DrawnCard[];
  interpretation: string;
  perCard?: string[];
  seed?: string;
}

export interface ReadingRequest {
  question: string;
  spreadId: SpreadId;
  drawnCards: DrawnCard[];
}

export interface ReadingResponse {
  interpretation: string;
  perCard?: string[];
}
