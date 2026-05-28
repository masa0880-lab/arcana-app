// arcana-app Service Worker
// 戦略:
//   - /api/*  → 常にネットワーク（キャッシュしない）
//   - /cards/*, /icons/*, /manifest.webmanifest → cache-first（静的アセット）
//   - HTML（ナビゲーション）→ network-first、失敗時はキャッシュ（オフラインフォールバック）
//   - /_next/static/* など → cache-first
// 注意: バージョン文字列を更新すると旧キャッシュは activate で破棄される。

const VERSION = 'arcana-v3';
const STATIC_CACHE = `${VERSION}-static`;

// プリキャッシュ対象: 起動直後にオフラインでも開ける最小セット
const PRECACHE_URLS = ['/', '/reading', '/history', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // 失敗しても install を止めない（ネットワーク不通でも登録は通す）
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 同一オリジン以外は何もしない
  if (url.origin !== self.location.origin) return;

  // API は常にネットワーク（キャッシュしない）
  if (url.pathname.startsWith('/api/')) return;

  // HTML ナビゲーション: network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静的アセット: cache-first
  if (
    url.pathname.startsWith('/cards/') ||
    url.pathname.startsWith('/zodiac/') ||
    url.pathname.startsWith('/animals/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // それ以外（フォント等）: cache-first（取れなければそのまま）
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200 && response.type === 'basic') {
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // 最終フォールバック: ルートの当該キャッシュ
    const root = await cache.match('/');
    if (root) return root;
    throw err;
  }
}
