import { describe, expect, it } from 'vitest';
import { ROKUSEI_CYCLES, ROKUSEI_STARS } from '@/data/rokusei';
import { calculateRokusei, getCurrentCycle } from '@/lib/rokusei';

describe('rokusei calculation', () => {
  it('returns a valid star id and polarity', () => {
    const r = calculateRokusei({ year: 1990, month: 5, day: 15 });
    expect(['saturn', 'venus', 'mars', 'uranus', 'jupiter', 'mercury']).toContain(r.starId);
    expect(['+', '-']).toContain(r.polarity);
    expect(r.fortuneNumber).toBeGreaterThanOrEqual(1);
    expect(r.fortuneNumber).toBeLessThanOrEqual(60);
  });

  it('is deterministic for the same birth date', () => {
    const a = calculateRokusei({ year: 1985, month: 7, day: 22 });
    const b = calculateRokusei({ year: 1985, month: 7, day: 22 });
    expect(a).toEqual(b);
  });

  it('throws for invalid birth dates', () => {
    expect(() => calculateRokusei({ year: 2024, month: 2, day: 30 })).toThrow();
  });

  it('covers all 6 star buckets across a year', () => {
    const stars = new Set<string>();
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 28; d++) {
        const r = calculateRokusei({ year: 1990, month: m, day: d });
        stars.add(r.starId);
      }
    }
    expect(stars.size).toBe(6);
  });

  it('produces both polarities', () => {
    const polarities = new Set<string>();
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 28; d++) {
        const r = calculateRokusei({ year: 1990, month: m, day: d });
        polarities.add(r.polarity);
      }
    }
    expect(polarities.size).toBe(2);
  });
});

describe('current cycle', () => {
  it('returns one of the 12 cycle ids', () => {
    const c = getCurrentCycle('saturn', '+', 1990, 2026);
    expect([
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
    ]).toContain(c);
  });

  it('is deterministic per (star, polarity, birthYear, targetYear)', () => {
    const a = getCurrentCycle('mars', '-', 1985, 2026);
    const b = getCurrentCycle('mars', '-', 1985, 2026);
    expect(a).toBe(b);
  });

  it('shifts cycle as target year increments (mod 12)', () => {
    const c2026 = getCurrentCycle('venus', '+', 1990, 2026);
    const c2038 = getCurrentCycle('venus', '+', 1990, 2038);
    // 12年で1周
    expect(c2026).toBe(c2038);
  });
});

describe('rokusei data invariants', () => {
  it('has 6 stars', () => {
    expect(ROKUSEI_STARS.length).toBe(6);
  });

  it('every star has symbol and image path', () => {
    for (const s of ROKUSEI_STARS) {
      expect(s.symbol.length).toBeGreaterThan(0);
      expect(s.imagePath).toMatch(/^\/rokusei\//);
    }
  });

  it('has 12 cycles with exactly 3 daisakkai', () => {
    expect(ROKUSEI_CYCLES.length).toBe(12);
    const dai = ROKUSEI_CYCLES.filter((c) => c.isDaisakkai);
    expect(dai.length).toBe(3);
  });
});
