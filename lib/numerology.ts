import type { BirthDate, LifePathNumber } from '@/types/divination';

const MASTER_NUMBERS = new Set([11, 22, 33]);

function digitSum(n: number): number {
  let sum = 0;
  let x = Math.abs(n);
  while (x > 0) {
    sum += x % 10;
    x = Math.floor(x / 10);
  }
  return sum;
}

function reduce(n: number): number {
  let cur = n;
  while (cur > 9 && !MASTER_NUMBERS.has(cur)) {
    cur = digitSum(cur);
  }
  return cur;
}

/**
 * ライフパスナンバーを計算する。
 * 年月日それぞれを単独で reduce してから合計、最後にもう一度 reduce する方式。
 * マスターナンバー(11/22/33)は途中・最終で出現したら保持する。
 */
export function calculateLifePath(birth: BirthDate): LifePathNumber {
  validateBirth(birth);
  const y = reduce(digitSum(birth.year));
  const m = reduce(digitSum(birth.month));
  const d = reduce(digitSum(birth.day));
  const total = y + m + d;
  const final = reduce(total);
  return final as LifePathNumber;
}

export function validateBirth(birth: BirthDate): void {
  const { year, month, day } = birth;
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error('生年が不正です（1900–2100の範囲で入力してください）。');
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('月が不正です（1–12）。');
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error('日が不正です（1–31）。');
  }
  // 月末チェック（うるう年含む）
  const lastDay = new Date(year, month, 0).getDate();
  if (day > lastDay) {
    throw new Error(`${year}年${month}月は${lastDay}日までしかありません。`);
  }
}
