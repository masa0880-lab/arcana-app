import type { BirthDate, ZodiacSignId } from '@/types/divination';
import { validateBirth } from './numerology';

// (月, 開始日) → そこから次の区切りまでがその星座
const BOUNDARIES: Array<{ month: number; day: number; sign: ZodiacSignId }> = [
  { month: 3, day: 21, sign: 'aries' },
  { month: 4, day: 20, sign: 'taurus' },
  { month: 5, day: 21, sign: 'gemini' },
  { month: 6, day: 22, sign: 'cancer' },
  { month: 7, day: 23, sign: 'leo' },
  { month: 8, day: 23, sign: 'virgo' },
  { month: 9, day: 23, sign: 'libra' },
  { month: 10, day: 24, sign: 'scorpio' },
  { month: 11, day: 23, sign: 'sagittarius' },
  { month: 12, day: 22, sign: 'capricorn' },
  { month: 1, day: 20, sign: 'aquarius' },
  { month: 2, day: 19, sign: 'pisces' },
];

export function getZodiacSignFromBirth(birth: BirthDate): ZodiacSignId {
  validateBirth(birth);
  const md = birth.month * 100 + birth.day; // YYYY無視、MMDD比較

  // 1/1〜1/19 は capricorn（前年12/22から続く）
  // 順番に「次の区切り日未満ならその星座」で判定
  // BOUNDARIES を3/21始まりの順に並べてあるので、3/21以前の日付は最後の項目（pisces/capricorn）に流れる

  // capricorn 12/22以降 と 1/19以前 を特殊処理
  if (md >= 1222 || md <= 119) return 'capricorn';

  for (let i = 0; i < BOUNDARIES.length - 1; i++) {
    const cur = BOUNDARIES[i];
    const next = BOUNDARIES[i + 1];
    const curMd = cur.month * 100 + cur.day;
    const nextMd = next.month * 100 + next.day;
    if (md >= curMd && md < nextMd) return cur.sign;
  }

  // capricornに該当しないが上で当たらないケースは pisces（2/19–3/20）
  return 'pisces';
}

export function dailyZodiacSeed(signId: ZodiacSignId, date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `zodiac-${signId}-${y}-${m}-${d}`;
}
