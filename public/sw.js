const CACHE_NAME = 'vsmat-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png'
];

// Install: precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network first with Cache fallback for navigation, Cache first for hashed static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // For same-origin requests
  if (url.origin === self.location.origin) {
    // Static assets (like /assets/...) have content hashes, use Cache First
    if (url.pathname.startsWith('/assets/')) {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
      );
      return;
    }

    // HTML Navigation requests: Stale-while-revalidate or Network first
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return caches.match('/index.html') || caches.match('/');
          })
      );
      return;
    }
  }

  // Fallback default fetch strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).catch(() => {
        // Return offline fallback if available
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
