// 6惑星のWebPアイコンを生成する。
// 各アイコン: 暗紺グラデ背景 + 中央に惑星記号(♄♀♂♅♃☿) + 周囲に装飾の星
// 出力: public/rokusei/<id>.webp

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const OUT_DIR = join(process.cwd(), 'public', 'rokusei');
mkdirSync(OUT_DIR, { recursive: true });

const STARS = [
  { id: 'saturn', symbol: '♄', nameEn: 'SATURN' },
  { id: 'venus', symbol: '♀', nameEn: 'VENUS' },
  { id: 'mars', symbol: '♂', nameEn: 'MARS' },
  { id: 'uranus', symbol: '♅', nameEn: 'URANUS' },
  { id: 'jupiter', symbol: '♃', nameEn: 'JUPITER' },
  { id: 'mercury', symbol: '☿', nameEn: 'MERCURY' },
];

const SIZE = 400;

function seededRand(seed) {
  let s = 0;
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return (s % 10000) / 10000;
  };
}

function decorativeStars(seed) {
  const rand = seededRand(seed);
  const out = [];
  const count = 20;
  for (let i = 0; i < count; i++) {
    const r = 0.30 + rand() * 0.18;
    const theta = rand() * Math.PI * 2;
    const cx = SIZE / 2 + Math.cos(theta) * SIZE * r;
    const cy = SIZE / 2 + Math.sin(theta) * SIZE * r;
    const radius = 1 + rand() * 2.2;
    const opacity = (0.35 + rand() * 0.55).toFixed(2);
    out.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(
        1
      )}" fill="#c8a96a" fill-opacity="${opacity}"/>`
    );
  }
  return out.join('');
}

function buildSvg({ id, symbol, nameEn }) {
  const stars = decorativeStars(id);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg-${id}" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#1a153d"/>
      <stop offset="100%" stop-color="#0b0a1a"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg-${id})"/>
  ${stars}
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE * 0.22}" fill="none" stroke="#c8a96a" stroke-opacity="0.35" stroke-width="1.5"/>
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE * 0.15}" fill="none" stroke="#c8a96a" stroke-opacity="0.2" stroke-width="1"/>
  <text x="${SIZE / 2}" y="${SIZE * 0.6}" font-family="Georgia, 'Times New Roman', serif" font-size="${SIZE * 0.4}" fill="#c8a96a" text-anchor="middle">${symbol}</text>
  <text x="${SIZE / 2}" y="${SIZE * 0.92}" font-family="Georgia, serif" font-size="${SIZE * 0.055}" fill="#c8a96a" fill-opacity="0.7" text-anchor="middle" letter-spacing="3">${nameEn}</text>
</svg>`;
}

async function main() {
  for (const star of STARS) {
    const svg = buildSvg(star);
    const out = join(OUT_DIR, `${star.id}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(out);
    console.log(`Wrote ${star.id}.webp`);
  }
  console.log(`done. ${STARS.length} files in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
