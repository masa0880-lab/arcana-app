// 12動物のWebPアイコンを生成する。
// Twemoji (CC-BY 4.0) のSVGを取得し、ゴールド単色化して暗紺背景に配置。
// 出典は public/animals/LICENSE.txt に明記。
//
// 使い方: node scripts/generate-animal-icons.mjs
// 出力: public/animals/<id>.webp

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const OUT_DIR = join(process.cwd(), 'public', 'animals');
mkdirSync(OUT_DIR, { recursive: true });

const TWEMOJI_BASE = 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg';

const ANIMALS = [
  { id: 'lion', codepoint: '1f981', nameEn: 'LION' },
  { id: 'panther', codepoint: '1f408-200d-2b1b', fallback: '1f408', nameEn: 'PANTHER' },
  { id: 'pegasus', codepoint: '1f984', nameEn: 'PEGASUS' },
  { id: 'wolf', codepoint: '1f43a', nameEn: 'WOLF' },
  { id: 'monkey', codepoint: '1f412', nameEn: 'MONKEY' },
  { id: 'raccoon', codepoint: '1f99d', nameEn: 'RACCOON' },
  { id: 'fawn', codepoint: '1f98c', nameEn: 'FAWN' },
  { id: 'koala', codepoint: '1f428', nameEn: 'KOALA' },
  { id: 'sheep', codepoint: '1f411', nameEn: 'SHEEP' },
  { id: 'elephant', codepoint: '1f418', nameEn: 'ELEPHANT' },
  { id: 'tiger', codepoint: '1f42f', nameEn: 'TIGER' },
  { id: 'cheetah', codepoint: '1f406', nameEn: 'CHEETAH' },
];

const SIZE = 400;
const GOLD = '#c8a96a';

async function fetchSvg(codepoint) {
  const url = `${TWEMOJI_BASE}/${codepoint}.svg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${codepoint}: HTTP ${res.status}`);
  return res.text();
}

/** SVGのすべての fill="..." と stroke="..." をゴールドに置換してシルエット化 */
function recolorToGold(svg) {
  let out = svg;
  // fill属性すべて
  out = out.replace(/fill="(?!none)[^"]*"/gi, `fill="${GOLD}"`);
  // CSS fill: ...
  out = out.replace(/fill\s*:\s*[^;"}]+/gi, `fill:${GOLD}`);
  // stroke属性
  out = out.replace(/stroke="(?!none)[^"]*"/gi, `stroke="${GOLD}"`);
  return out;
}

function buildCardSvg(animalSvgInner, nameEn, id) {
  // Twemojiは viewBox 0 0 36 36 なので、card内で 220x220 に配置
  const innerSize = 220;
  const innerOffset = (SIZE - innerSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg-${id}" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#1a153d"/>
      <stop offset="100%" stop-color="#0b0a1a"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg-${id})"/>
  <circle cx="${SIZE / 2}" cy="${SIZE * 0.46}" r="${SIZE * 0.32}" fill="none" stroke="${GOLD}" stroke-opacity="0.25" stroke-width="1.5"/>
  <g transform="translate(${innerOffset} ${innerOffset - SIZE * 0.04}) scale(${innerSize / 36})">
    ${animalSvgInner}
  </g>
  <text x="${SIZE / 2}" y="${SIZE * 0.93}" font-family="Georgia, serif" font-size="${SIZE * 0.055}" fill="${GOLD}" fill-opacity="0.7" text-anchor="middle" letter-spacing="3">${nameEn}</text>
</svg>`;
}

function extractInnerSvg(svg) {
  // <svg ...>...</svg> の中身を取り出す
  const m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  return m ? m[1] : svg;
}

async function main() {
  for (const a of ANIMALS) {
    let rawSvg;
    try {
      rawSvg = await fetchSvg(a.codepoint);
    } catch (e) {
      if (a.fallback) {
        console.warn(`${a.id}: ${a.codepoint} failed, falling back to ${a.fallback}`);
        rawSvg = await fetchSvg(a.fallback);
      } else {
        throw e;
      }
    }
    const golden = recolorToGold(rawSvg);
    const inner = extractInnerSvg(golden);
    const cardSvg = buildCardSvg(inner, a.nameEn, a.id);
    const outPath = join(OUT_DIR, `${a.id}.webp`);
    await sharp(Buffer.from(cardSvg)).webp({ quality: 85 }).toFile(outPath);
    console.log(`Wrote ${a.id}.webp`);
  }

  const licenseText = `Animal silhouette icons in this directory are derived from Twemoji,
licensed under CC-BY 4.0 by Twitter, Inc and other contributors.
Source: https://github.com/twitter/twemoji
License: https://creativecommons.org/licenses/by/4.0/

This project recolors the original emoji SVGs to a single gold tone
and composites them on a dark gradient background. The recoloring is
performed by scripts/generate-animal-icons.mjs.
`;
  writeFileSync(join(OUT_DIR, 'LICENSE.txt'), licenseText);
  console.log('Wrote LICENSE.txt');
  console.log(`done. ${ANIMALS.length} files in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
