// arcana-app PWAアイコン生成スクリプト
// 出力: public/icons/icon-192.png, icon-512.png
//
// 使い方:
//   node scripts/generate-icons.mjs
//
// 再生成不要なら scripts/ ディレクトリには残しておくだけでOK。

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ICON_DIR = join(process.cwd(), 'public', 'icons');
mkdirSync(ICON_DIR, { recursive: true });

function buildSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  // 六芒星（ヘキサグラム）: ふたつの正三角形を重ねたもの。タロットや神秘学の象徴。
  // safe area: maskableアイコンの中心60%圏内に主要グラフィックを収める。
  const r = size * 0.28;
  const r2 = r * 0.866; // sin(60°) ≈ 0.866
  const half = r / 2;
  // 上向き三角形
  const triUp = `${cx},${cy - r} ${cx + r2},${cy + half} ${cx - r2},${cy + half}`;
  // 下向き三角形
  const triDown = `${cx},${cy + r} ${cx + r2},${cy - half} ${cx - r2},${cy - half}`;
  const strokeWidth = Math.max(2, size / 60);
  const innerR = size * 0.04;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#1a153d"/>
      <stop offset="100%" stop-color="#0b0a1a"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <polygon points="${triUp}" fill="none" stroke="#c8a96a" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
  <polygon points="${triDown}" fill="none" stroke="#c8a96a" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#c8a96a"/>
</svg>`;
}

async function render(size, filename) {
  const svg = buildSvg(size);
  await sharp(Buffer.from(svg)).png().toFile(join(ICON_DIR, filename));
  console.log(`Wrote ${filename} (${size}x${size})`);
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
console.log('done.');
