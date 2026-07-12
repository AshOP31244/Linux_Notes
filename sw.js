/* ==========================================================================
   SERVICE WORKER — makes the site installable and usable fully offline.
   Bump CACHE_NAME (e.g. v2, v3) whenever you change css/js/html so
   returning visitors get the fresh files instead of a stale cache.
   ========================================================================== */

const CACHE_NAME = 'linux-lab-v3';

const CORE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/render.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for everything, including third-party CDN assets (Mermaid,
// Tippy, Google Fonts) so the page still works with no network at all
// after the first successful visit.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const okToCache =
            response &&
            (response.status === 200 || response.type === 'opaque');
          if (okToCache) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});