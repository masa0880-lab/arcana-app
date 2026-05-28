import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DECK } from '@/data/deck';

// 各カードの imagePath に対応する WebP ファイルが public/cards/ に存在することを検証。
describe('card image files', () => {
  const publicDir = join(process.cwd(), 'public');

  for (const card of DECK) {
    it(`has image file for ${card.id}`, () => {
      const filePath = join(publicDir, card.imagePath);
      expect(existsSync(filePath), `missing: ${card.imagePath}`).toBe(true);
    });
  }
});
