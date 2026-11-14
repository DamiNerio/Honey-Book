const CACHE_NAME = 'honey-book-v1';
const APP_SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-512.png',
];

const DEV_PATH_PREFIXES = ['/@vite', '/@react-refresh', '/@fs', '/src/', '/node_modules/'];

function isViteDevRequest(url) {
  return (
    DEV_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    url.searchParams.has('t')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await cache.addAll(APP_SHELL_URLS);
        try {
          const indexRes = await fetch('./index.html', { cache: 'no-cache' });
          if (indexRes && indexRes.ok) {
            await cache.put('./index.html', indexRes.clone());
            const html = await indexRes.text();
            const assetMatches = Array.from(
              html.matchAll(/(?:src|href)=["'](\.?\/?assets\/[^"']+)["']/g),
              (m) => (m[1].startsWith('./') || m[1].startsWith('/') ? m[1] : `./${m[1]}`)
            );
            const uniqueAssets = [...new Set(assetMatches)];
            if (uniqueAssets.length > 0) {
              await cache.addAll(uniqueAssets);
            }
          }
        } catch {
          // Ignore asset pre-fetch failures gracefully
        }
      })
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isViteDevRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match('./index.html').then((res) => res || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
