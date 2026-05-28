// 78枚のRider-Waiteカード画像を JPG → WebP に変換して public/cards/ に配置する。
// 元画像: https://github.com/searge/tarot (Unlicense / Public Domain)
//
// 使い方:
//   1. git clone --depth=1 https://github.com/searge/tarot.git /tmp/searge-tarot
//   2. node scripts/convert-cards.mjs
//
// 出力ファイル名は data/deck.ts の imagePath と一致させる:
//   major-{00..21}.webp, {wands,cups,swords,pentacles}-{01..10,page,knight,queen,king}.webp

import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = process.env.SRC_DIR ?? '/tmp/searge-tarot/assets/img/big';
const DST = join(process.cwd(), 'public', 'cards');

const WEBP_QUALITY = 80;
const MAX_WIDTH = 600; // スマホ表示には十分。Retinaでも実寸300pxの2倍。

const suitMap = {
  wands: 'wands',
  cups: 'cups',
  swords: 'swords',
  pents: 'pentacles', // 元ファイル名 pents → 内部ID pentacles
};

const courtByNumber = { 11: 'page', 12: 'knight', 13: 'queen', 14: 'king' };

function targetIdFor(srcName) {
  const base = srcName.replace(/\.jpg$/i, '');

  // Major: maj00 ... maj21
  const majMatch = base.match(/^maj(\d{2})$/);
  if (majMatch) {
    return `major-${majMatch[1]}`;
  }

  // Minor: <suit><nn> e.g. cups01 ... cups14
  const minorMatch = base.match(/^(wands|cups|swords|pents)(\d{2})$/);
  if (minorMatch) {
    const suit = suitMap[minorMatch[1]];
    const n = parseInt(minorMatch[2], 10);
    if (n >= 1 && n <= 10) {
      return `${suit}-${String(n).padStart(2, '0')}`;
    }
    if (courtByNumber[n]) {
      return `${suit}-${courtByNumber[n]}`;
    }
  }
  return null;
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`Source directory not found: ${SRC}`);
    console.error('Run: git clone --depth=1 https://github.com/searge/tarot.git /tmp/searge-tarot');
    process.exit(1);
  }
  mkdirSync(DST, { recursive: true });

  const files = readdirSync(SRC).filter((f) => /\.jpg$/i.test(f));
  let converted = 0;
  let skipped = 0;
  const seen = new Set();

  for (const f of files.sort()) {
    const id = targetIdFor(f);
    if (!id) {
      skipped++;
      continue;
    }
    if (seen.has(id)) {
      // 同じIDに複数の元ファイル候補がある場合は最初のものを採用
      continue;
    }
    seen.add(id);

    const outPath = join(DST, `${id}.webp`);
    await sharp(join(SRC, f))
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outPath);
    converted++;
  }

  console.log(`Converted: ${converted}, Skipped (no mapping): ${skipped}`);
  if (converted !== 78) {
    console.error(`Expected 78 cards, got ${converted}. Aborting check.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
