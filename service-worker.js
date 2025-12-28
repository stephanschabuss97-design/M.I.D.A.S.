'use strict';
/* PWA service worker (Phase 2): shell cache + offline fallback. */

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `midas-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `midas-runtime-${CACHE_VERSION}`;

const toUrl = (path) => new URL(path, self.registration.scope).toString();
const CORE_ASSETS = [
  toUrl('./'),
  toUrl('index.html'),
  toUrl('offline.html'),
  toUrl('app/app.css'),
  toUrl('app/core/boot-flow.js'),
  toUrl('app/core/config.js'),
  toUrl('app/core/diag.js'),
  toUrl('app/core/pwa.js'),
  toUrl('public/manifest.json'),
  toUrl('public/img/icons/icon-192.png'),
  toUrl('public/img/icons/icon-512.png'),
  toUrl('public/img/icons/icon-192-maskable.png'),
  toUrl('public/img/icons/icon-512-maskable.png'),
  toUrl('public/img/screenshots/screen-narrow.png'),
  toUrl('public/img/screenshots/screen-wide.png')
];

const isSameOrigin = (url) => url.origin === self.location.origin;
const isStaticAsset = (request) => {
  if (request.destination) {
    return ['style', 'script', 'image', 'font'].includes(request.destination);
  }
  return /\.(css|js|png|jpe?g|webp|svg|avif|ico|json|woff2?)$/i.test(request.url);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(toUrl('offline.html')))
        )
    );
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
  }
});
