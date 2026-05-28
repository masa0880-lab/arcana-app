import type { Spread } from '@/types/tarot';

export const SPREADS: ReadonlyArray<Spread> = [
  {
    id: 'single',
    name: '1枚引き',
    description: '今の問いに対するシンプルな助言',
    cardCount: 1,
    positions: [{ index: 0, label: '今の助言', meaningEn: 'Guidance for now' }],
  },
  {
    id: 'three-card',
    name: '3枚スプレッド（過去・現在・未来）',
    description: '流れと変化を読み解く',
    cardCount: 3,
    positions: [
      { index: 0, label: '過去', meaningEn: 'Past' },
      { index: 1, label: '現在', meaningEn: 'Present' },
      { index: 2, label: '未来', meaningEn: 'Future' },
    ],
  },
  {
    id: 'celtic-cross',
    name: 'ケルト十字',
    description: '状況を多面的に深く読み解く伝統的スプレッド',
    cardCount: 10,
    positions: [
      { index: 0, label: '現状', meaningEn: 'The present situation' },
      { index: 1, label: '障害／助け', meaningEn: 'The challenge or what crosses you' },
      { index: 2, label: '顕在意識（目標）', meaningEn: 'Conscious goal' },
      { index: 3, label: '潜在意識（基盤）', meaningEn: 'Subconscious foundation' },
      { index: 4, label: '過去', meaningEn: 'Recent past' },
      { index: 5, label: '近い未来', meaningEn: 'Near future' },
      { index: 6, label: '自分自身', meaningEn: 'Yourself' },
      { index: 7, label: '周囲の環境', meaningEn: 'External influences' },
      { index: 8, label: '希望と恐れ', meaningEn: 'Hopes and fears' },
      { index: 9, label: '最終結果', meaningEn: 'Final outcome' },
    ],
  },
];

export function getSpread(id: string): Spread | undefined {
  return SPREADS.find((s) => s.id === id);
}
