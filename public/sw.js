// arcana-app Service Worker (v4)
// 戦略:
//   - /api/*  → 常にネットワーク（キャッシュしない）
//   - /cards/*, /zodiac/*, /animals/*, /icons/*, /manifest.webmanifest → cache-first（静的アセット）
//   - /_next/static/* → network-first（古いchunkの取り違いを避ける）
//   - HTML（ナビゲーション）→ network-first、失敗時はキャッシュ
//
// v4 で行うこと:
//   - 旧バージョンの全キャッシュを破棄
//   - アクティブ化時に全クライアントへ "reload" を通知（自分が掴んでいる古いJSを捨てさせる）

const VERSION = 'arcana-v4';
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE_URLS = ['/', '/reading', '/zodiac', '/animal', '/numerology', '/history', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
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
      // 旧バージョンの全キャッシュ削除
      await Promise.all(
        keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
      // 既存タブに「新SWに切り替わったので再読み込みして」と通知
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const c of clientsList) {
        c.postMessage({ type: 'arcana-sw-updated' });
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API は常にネットワーク（キャッシュしない）
  if (url.pathname.startsWith('/api/')) return;

  // HTML ナビゲーション: network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Next.js の build artifact (JS/CSS chunks): network-first
  // 内容ハッシュ付きとはいえ、SWキャッシュとビルド世代のズレを避けるためネットワーク優先
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 自作の静的アセット (cards, zodiac, animals, icons, manifest): cache-first
  if (
    url.pathname.startsWith('/cards/') ||
    url.pathname.startsWith('/zodiac/') ||
    url.pathname.startsWith('/animals/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // それ以外: ネットワーク優先
  event.respondWith(networkFirst(request));
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
    const root = await cache.match('/');
    if (root) return root;
    throw err;
  }
}
