import { describe, it, expect } from 'vitest';
import { DECK } from '@/data/deck';
import { shuffleDeck, drawCards, getDailyCard, dailySeed } from '@/lib/deck';

describe('DECK', () => {
  it('contains exactly 78 cards', () => {
    expect(DECK.length).toBe(78);
  });

  it('has 22 major arcana and 56 minor arcana', () => {
    const major = DECK.filter((c) => c.arcana === 'major');
    const minor = DECK.filter((c) => c.arcana === 'minor');
    expect(major.length).toBe(22);
    expect(minor.length).toBe(56);
  });

  it('has 14 cards per suit', () => {
    for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
      const cards = DECK.filter((c) => c.suit === suit);
      expect(cards.length, `suit ${suit}`).toBe(14);
    }
  });

  it('has unique ids across the whole deck', () => {
    const ids = DECK.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every card has non-empty keywords (both orientations)', () => {
    for (const c of DECK) {
      expect(c.keywords.upright.length, c.id).toBeGreaterThan(0);
      expect(c.keywords.reversed.length, c.id).toBeGreaterThan(0);
    }
  });

  it('every card has an imagePath under /cards/', () => {
    for (const c of DECK) {
      expect(c.imagePath.startsWith('/cards/'), c.id).toBe(true);
      expect(c.imagePath.endsWith('.webp'), c.id).toBe(true);
    }
  });

  it('major arcana ids cover 00..21', () => {
    const ids = DECK.filter((c) => c.arcana === 'major').map((c) => c.id).sort();
    expect(ids[0]).toBe('major-00');
    expect(ids[21]).toBe('major-21');
  });
});

describe('shuffleDeck', () => {
  it('returns all 78 cards with no duplicates', () => {
    const shuffled = shuffleDeck('test-seed');
    expect(shuffled.length).toBe(78);
    expect(new Set(shuffled.map((c) => c.id)).size).toBe(78);
  });

  it('does not mutate the source DECK', () => {
    const beforeFirst = DECK[0].id;
    shuffleDeck('mutate-check');
    expect(DECK[0].id).toBe(beforeFirst);
  });

  it('is deterministic for the same seed', () => {
    const a = shuffleDeck('reproducible').map((c) => c.id);
    const b = shuffleDeck('reproducible').map((c) => c.id);
    expect(a).toEqual(b);
  });

  it('produces different orders for different seeds', () => {
    const a = shuffleDeck('alpha').map((c) => c.id);
    const b = shuffleDeck('beta').map((c) => c.id);
    expect(a).not.toEqual(b);
  });
});

describe('drawCards', () => {
  it('returns exactly count cards', () => {
    expect(drawCards(1, 's').length).toBe(1);
    expect(drawCards(3, 's').length).toBe(3);
    expect(drawCards(10, 's').length).toBe(10);
  });

  it('assigns sequential position indexes starting at 0', () => {
    const drawn = drawCards(10, 'positions');
    drawn.forEach((d, i) => expect(d.position).toBe(i));
  });

  it('produces unique cardIds within a draw', () => {
    const drawn = drawCards(10, 'unique');
    const ids = drawn.map((d) => d.cardId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is reproducible with the same seed (cards + orientation)', () => {
    const a = drawCards(10, 'same');
    const b = drawCards(10, 'same');
    expect(a).toEqual(b);
  });

  it('throws when count exceeds deck size', () => {
    expect(() => drawCards(79, 's')).toThrow();
  });

  it('throws when count is negative', () => {
    expect(() => drawCards(-1, 's')).toThrow();
  });

  it('only assigns valid orientations', () => {
    const drawn = drawCards(20, 'orientation');
    for (const d of drawn) {
      expect(['upright', 'reversed']).toContain(d.orientation);
    }
  });
});

describe('getDailyCard', () => {
  it('returns the same card for the same date', () => {
    const d = new Date(2026, 4, 28);
    const a = getDailyCard(d);
    const b = getDailyCard(d);
    expect(a).toEqual(b);
  });

  it('produces different (likely) cards for different dates', () => {
    const a = getDailyCard(new Date(2026, 4, 28));
    const b = getDailyCard(new Date(2026, 4, 29));
    // 78枚から1枚なので確率的にはほぼ違うが厳密でない。最低限cardId+orientationの組が異なることを期待。
    expect(`${a.cardId}-${a.orientation}`).not.toBe(`${b.cardId}-${b.orientation}`);
  });

  it('returns position 0', () => {
    expect(getDailyCard(new Date(2026, 0, 1)).position).toBe(0);
  });
});

describe('dailySeed', () => {
  it('formats seed as daily-YYYY-MM-DD', () => {
    expect(dailySeed(new Date(2026, 4, 28))).toBe('daily-2026-05-28');
    expect(dailySeed(new Date(2026, 0, 1))).toBe('daily-2026-01-01');
  });
});
