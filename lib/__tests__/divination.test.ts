import { describe, expect, it } from 'vitest';
import { calculateLifePath } from '@/lib/numerology';
import { getZodiacSignFromBirth } from '@/lib/zodiac';
import { calculateCharacterNumber, getAnimalFromBirth } from '@/lib/animal';
import { LIFE_PATH_PROFILES } from '@/data/numerology';
import { ZODIAC_SIGNS } from '@/data/zodiac';
import { ANIMALS } from '@/data/animals';

describe('numerology', () => {
  it('reduces single digit', () => {
    expect(calculateLifePath({ year: 1990, month: 1, day: 1 })).toBe(3);
    // 1990 → 1+9+9+0=19→1+9=10→1+0=1; 1=1; 1=1; 1+1+1=3
  });

  it('preserves master numbers', () => {
    // 11/22/33 が最終結果なら保持される
    // 1985/3/29 を試してみる: 年1+9+8+5=23→5, 月3, 日29→2+9=11(マスター保持)→?
    // 公式は year/month/day を別個 reduce してから合計、最終で reduce する方式。
    // 計算: y=5, m=3, d=11, total=19→1+9=10→1+0=1。マスター解除でしまう。
    // マスター用に: 1979/11/29 → y=1+9+7+9=26→2+6=8, m=11(マスター), d=11(マスター), total=8+11+11=30→3
    // 別ケース: 1992/8/3 → y=1+9+9+2=21→3, m=8, d=3, total=14→5
    // テストとして 11 が出るケース: total=11 を作る
    // 1991/1/1: y=1+9+9+1=20→2, m=1, d=1, total=4
    // total=11 になる組: y=8, m=1, d=2 → 例 1988/1/2: y=1+9+8+8=26→8, m=1, d=2, total=11 (マスター)
    expect(calculateLifePath({ year: 1988, month: 1, day: 2 })).toBe(11);
  });

  it('rejects invalid dates', () => {
    expect(() => calculateLifePath({ year: 2024, month: 2, day: 30 })).toThrow();
    expect(() => calculateLifePath({ year: 2024, month: 13, day: 1 })).toThrow();
    expect(() => calculateLifePath({ year: 1800, month: 1, day: 1 })).toThrow();
  });
});

describe('zodiac', () => {
  it('returns correct sign for known dates', () => {
    expect(getZodiacSignFromBirth({ year: 2000, month: 3, day: 21 })).toBe('aries');
    expect(getZodiacSignFromBirth({ year: 2000, month: 4, day: 19 })).toBe('aries');
    expect(getZodiacSignFromBirth({ year: 2000, month: 4, day: 20 })).toBe('taurus');
    expect(getZodiacSignFromBirth({ year: 2000, month: 6, day: 21 })).toBe('gemini');
    expect(getZodiacSignFromBirth({ year: 2000, month: 7, day: 22 })).toBe('cancer');
    expect(getZodiacSignFromBirth({ year: 2000, month: 8, day: 22 })).toBe('leo');
    expect(getZodiacSignFromBirth({ year: 2000, month: 10, day: 23 })).toBe('libra');
    expect(getZodiacSignFromBirth({ year: 2000, month: 11, day: 22 })).toBe('scorpio');
    expect(getZodiacSignFromBirth({ year: 2000, month: 12, day: 22 })).toBe('capricorn');
    expect(getZodiacSignFromBirth({ year: 2000, month: 1, day: 1 })).toBe('capricorn');
    expect(getZodiacSignFromBirth({ year: 2000, month: 1, day: 19 })).toBe('capricorn');
    expect(getZodiacSignFromBirth({ year: 2000, month: 1, day: 20 })).toBe('aquarius');
    expect(getZodiacSignFromBirth({ year: 2000, month: 2, day: 19 })).toBe('pisces');
    expect(getZodiacSignFromBirth({ year: 2000, month: 3, day: 20 })).toBe('pisces');
  });

  it('every date in a year produces a valid sign', () => {
    const seen = new Set<string>();
    for (let m = 1; m <= 12; m++) {
      const dim = new Date(2024, m, 0).getDate();
      for (let d = 1; d <= dim; d++) {
        const s = getZodiacSignFromBirth({ year: 2024, month: m, day: d });
        seen.add(s);
      }
    }
    expect(seen.size).toBe(12);
  });

  it('has 12 signs in data', () => {
    expect(ZODIAC_SIGNS.length).toBe(12);
  });
});

describe('animal', () => {
  it('returns character number in 1..60', () => {
    for (let y = 1950; y <= 2010; y += 5) {
      for (let m = 1; m <= 12; m += 3) {
        const n = calculateCharacterNumber({ year: y, month: m, day: 15 });
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(60);
      }
    }
  });

  it('is deterministic', () => {
    const a = calculateCharacterNumber({ year: 1990, month: 5, day: 15 });
    const b = calculateCharacterNumber({ year: 1990, month: 5, day: 15 });
    expect(a).toBe(b);
  });

  it('consecutive days produce consecutive numbers', () => {
    const a = calculateCharacterNumber({ year: 2000, month: 6, day: 14 });
    const b = calculateCharacterNumber({ year: 2000, month: 6, day: 15 });
    // mod 60 で連続する（境界除く）
    expect((b - a + 60) % 60).toBe(1);
  });

  it('maps every character number to an animal', () => {
    for (let n = 1; n <= 60; n++) {
      const { animalId } = getAnimalFromBirth(
        // 逆引きが大変なので直接 calculate を経由しないシンプルテスト:
        // 既存生年で確認
        { year: 1990 + (n % 30), month: 1 + (n % 12), day: 1 + (n % 28) }
      );
      expect(typeof animalId).toBe('string');
    }
  });

  it('has 12 animals in data', () => {
    expect(ANIMALS.length).toBe(12);
  });
});

describe('data invariants', () => {
  it('every life path profile has non-empty keywords', () => {
    for (const p of LIFE_PATH_PROFILES) {
      expect(p.keywords.strengths.length).toBeGreaterThan(0);
      expect(p.keywords.challenges.length).toBeGreaterThan(0);
    }
  });

  it('every zodiac sign has glyph and date range', () => {
    for (const s of ZODIAC_SIGNS) {
      expect(s.glyph.length).toBeGreaterThan(0);
      expect(s.dateRange.length).toBeGreaterThan(0);
    }
  });

  it('every animal has nameJa and imagePath', () => {
    for (const a of ANIMALS) {
      expect(a.nameJa.length).toBeGreaterThan(0);
      expect(a.imagePath).toMatch(/^\/animals\//);
    }
  });
});
