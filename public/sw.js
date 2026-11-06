/* eslint-disable no-restricted-globals */
// __VSMAT_VERSION__ and __VSMAT_PRECACHE__ are substituted at build time by
// the `vsmat-sw-manifest` plugin in vite.config.ts. In dev the SW is not registered.
const VERSION = '__VSMAT_VERSION__';
const CACHE_NAME = `vsmat-cache-${VERSION}`;
const PRECACHE_ASSETS = '__VSMAT_PRECACHE__';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n.startsWith('vsmat-cache-') && n !== CACHE_NAME).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

async function putInCache(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin requests

  // Content-hashed build output and OCR language data: cache first, fill on demand.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/tessdata/') || url.pathname.startsWith('/tesseract/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            event.waitUntil(putInCache(request, response.clone()));
            return response;
          })
      )
    );
    return;
  }

  // Page navigations: network first (to pick up new deploys), cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          event.waitUntil(putInCache('/index.html', response.clone()));
          return response;
        })
        .catch(async () => (await caches.match('/index.html')) || (await caches.match('/')) || Response.error())
    );
    return;
  }

  // Everything else same-origin (icons, manifest): cache first, then network.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          event.waitUntil(putInCache(request, response.clone()));
          return response;
        })
    )
  );
});
