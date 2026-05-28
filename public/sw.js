// arcana-app Service Worker — 最小実装。
// M6 でキャッシュ戦略を本実装する（現状はパススルー）。

const VERSION = 'arcana-v1';

self.addEventListener('install', (event) => {
  // 次のSWへ即座に置き換え
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // M1ではキャッシュせずネットワークにそのまま通す。
  // /api/* は将来もキャッシュしない方針。
  return;
});
