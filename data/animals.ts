import type { AnimalId, AnimalType } from '@/types/divination';

// 12動物の基本データ。本家「動物占い」(個性心理學研究所/弦本將裕氏)とは独立した
// オリジナル鑑定文の生成に使用する。免責は app/animal/page.tsx 等で明示。

export const ANIMALS: ReadonlyArray<AnimalType> = [
  {
    id: 'lion',
    nameJa: 'ライオン',
    nameEn: 'Lion',
    imagePath: '/animals/lion.webp',
    baseColor: '紅',
  },
  {
    id: 'panther',
    nameJa: '黒ひょう',
    nameEn: 'Black Panther',
    imagePath: '/animals/panther.webp',
    baseColor: '青',
  },
  {
    id: 'pegasus',
    nameJa: 'ペガサス',
    nameEn: 'Pegasus',
    imagePath: '/animals/pegasus.webp',
    baseColor: 'ピンク',
  },
  {
    id: 'wolf',
    nameJa: '狼',
    nameEn: 'Wolf',
    imagePath: '/animals/wolf.webp',
    baseColor: '銀',
  },
  {
    id: 'monkey',
    nameJa: '猿',
    nameEn: 'Monkey',
    imagePath: '/animals/monkey.webp',
    baseColor: '黄',
  },
  {
    id: 'raccoon',
    nameJa: 'たぬき',
    nameEn: 'Raccoon Dog',
    imagePath: '/animals/raccoon.webp',
    baseColor: '茶',
  },
  {
    id: 'fawn',
    nameJa: 'こじか',
    nameEn: 'Fawn',
    imagePath: '/animals/fawn.webp',
    baseColor: '緑',
  },
  {
    id: 'koala',
    nameJa: 'コアラ',
    nameEn: 'Koala',
    imagePath: '/animals/koala.webp',
    baseColor: '紫',
  },
  {
    id: 'sheep',
    nameJa: 'ひつじ',
    nameEn: 'Sheep',
    imagePath: '/animals/sheep.webp',
    baseColor: '黒',
  },
  {
    id: 'elephant',
    nameJa: 'ゾウ',
    nameEn: 'Elephant',
    imagePath: '/animals/elephant.webp',
    baseColor: '橙',
  },
  {
    id: 'tiger',
    nameJa: '虎',
    nameEn: 'Tiger',
    imagePath: '/animals/tiger.webp',
    baseColor: '黒',
  },
  {
    id: 'cheetah',
    nameJa: 'チーター',
    nameEn: 'Cheetah',
    imagePath: '/animals/cheetah.webp',
    baseColor: '銀',
  },
];

export function getAnimal(id: AnimalId): AnimalType | undefined {
  return ANIMALS.find((a) => a.id === id);
}
