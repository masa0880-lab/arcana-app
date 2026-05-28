import type { ZodiacSign, ZodiacSignId } from '@/types/divination';

// 西洋占星術12星座。
// 期間は閾値方式（mm-dd以上、次の星座の前日まで）。1/1〜1/19はCapricorn扱い。

export const ZODIAC_SIGNS: ReadonlyArray<ZodiacSign> = [
  {
    id: 'aries',
    nameJa: '牡羊座',
    nameEn: 'Aries',
    glyph: '♈',
    dateRange: '3/21–4/19',
    element: '火',
    imagePath: '/zodiac/aries.webp',
  },
  {
    id: 'taurus',
    nameJa: '牡牛座',
    nameEn: 'Taurus',
    glyph: '♉',
    dateRange: '4/20–5/20',
    element: '土',
    imagePath: '/zodiac/taurus.webp',
  },
  {
    id: 'gemini',
    nameJa: '双子座',
    nameEn: 'Gemini',
    glyph: '♊',
    dateRange: '5/21–6/21',
    element: '風',
    imagePath: '/zodiac/gemini.webp',
  },
  {
    id: 'cancer',
    nameJa: '蟹座',
    nameEn: 'Cancer',
    glyph: '♋',
    dateRange: '6/22–7/22',
    element: '水',
    imagePath: '/zodiac/cancer.webp',
  },
  {
    id: 'leo',
    nameJa: '獅子座',
    nameEn: 'Leo',
    glyph: '♌',
    dateRange: '7/23–8/22',
    element: '火',
    imagePath: '/zodiac/leo.webp',
  },
  {
    id: 'virgo',
    nameJa: '乙女座',
    nameEn: 'Virgo',
    glyph: '♍',
    dateRange: '8/23–9/22',
    element: '土',
    imagePath: '/zodiac/virgo.webp',
  },
  {
    id: 'libra',
    nameJa: '天秤座',
    nameEn: 'Libra',
    glyph: '♎',
    dateRange: '9/23–10/23',
    element: '風',
    imagePath: '/zodiac/libra.webp',
  },
  {
    id: 'scorpio',
    nameJa: '蠍座',
    nameEn: 'Scorpio',
    glyph: '♏',
    dateRange: '10/24–11/22',
    element: '水',
    imagePath: '/zodiac/scorpio.webp',
  },
  {
    id: 'sagittarius',
    nameJa: '射手座',
    nameEn: 'Sagittarius',
    glyph: '♐',
    dateRange: '11/23–12/21',
    element: '火',
    imagePath: '/zodiac/sagittarius.webp',
  },
  {
    id: 'capricorn',
    nameJa: '山羊座',
    nameEn: 'Capricorn',
    glyph: '♑',
    dateRange: '12/22–1/19',
    element: '土',
    imagePath: '/zodiac/capricorn.webp',
  },
  {
    id: 'aquarius',
    nameJa: '水瓶座',
    nameEn: 'Aquarius',
    glyph: '♒',
    dateRange: '1/20–2/18',
    element: '風',
    imagePath: '/zodiac/aquarius.webp',
  },
  {
    id: 'pisces',
    nameJa: '魚座',
    nameEn: 'Pisces',
    glyph: '♓',
    dateRange: '2/19–3/20',
    element: '水',
    imagePath: '/zodiac/pisces.webp',
  },
];

export function getZodiacSign(id: ZodiacSignId): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((s) => s.id === id);
}
