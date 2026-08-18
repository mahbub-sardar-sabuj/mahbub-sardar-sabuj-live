// মাহবুব সরদার সবুজ — Service Worker v8.0
// v8: Clear the prior cache after the non-home performance release.
// HTML stays network-first; original-size gallery media is intentionally left to the HTTP cache.
const CACHE_NAME = 'mahbub-sardar-sabuj-v8';
const OFFLINE_URL = '/offline.html';

// Cache essential static assets on install (NOT HTML pages)
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

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

// Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API requests — always network
  if (event.request.url.includes('/api/')) return;

  // IMPORTANT: Never cache HTML navigation requests — always fetch fresh
  // This prevents stale HTML from being served after deployments
  if (event.request.mode === 'navigate' ||
      event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  const url = new URL(event.request.url);
  const isLargeOnDemandAsset =
    /\.(?:pdf|wasm)$/i.test(url.pathname) ||
    url.pathname.startsWith('/ffmpeg/') ||
    url.pathname.startsWith('/ffmpeg-st/') ||
    url.pathname.startsWith('/photos/gallery-2026-08/');
  const isVersionedOrVisualAsset = url.pathname.startsWith('/assets/') || /\.(?:css|js|mjs|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|ico)$/i.test(url.pathname);
  const isWritingsArchive = url.pathname === '/data/writingsArchive.json';

  // Large readers and media tools load only when the user asks for them. Avoid filling
  // the Cache Storage with multi-megabyte PDF/WASM files during normal browsing.
  if (isLargeOnDemandAsset) return;

  // Hashed builds, fonts and visual assets are stable between deployments. Cache-first
  // makes repeat visits and cross-page navigation substantially faster.
  if (isVersionedOrVisualAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response?.status === 200) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        });
      })
    );
    return;
  }

  // The writing archive is a compressed 2,357-item collection. Serve a cached
  // copy immediately on repeat visits, refresh it in the background, and let the
  // versioned worker invalidate it automatically on the next deployment.
  if (isWritingsArchive) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const refresh = fetch(event.request)
          .then((response) => {
            if (response?.status === 200) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
            return response;
          });
        return cached ?? refresh;
      })
    );
    return;
  }

  // Small unversioned data remains network-first so published updates appear
  // immediately, while still providing an offline fallback.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response?.status === 200) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
