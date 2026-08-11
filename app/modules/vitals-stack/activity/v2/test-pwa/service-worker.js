'use strict';

const CACHE_PREFIX = 'midas-activity-v2-r8-local-test-';
const CACHE_NAME = `${CACHE_PREFIX}v5`;
const LOCAL_SHELL = Object.freeze([
  './',
  './index.html',
  './index.html?fixture=all',
  './manifest.webmanifest',
  './icon.svg',
  './local-test-pwa.css?v=r8-s5-3',
  './local-test-pwa.js?v=r8-s5-3',
  '../session-shell.css?v=r8-s5-3',
  '../session-commit-harness.css?v=r8-s5-3',
  '../semantics.js?v=r8-s5-3',
  '../semantics-v2.js?v=r8-s5-3',
  '../session-draft.js?v=r8-s5-3',
  '../session-recovery.js?v=r8-s5-3',
  '../session-commit.js?v=r8-s5-3',
  '../session-shell.js?v=r8-s5-3',
  '../session-commit-harness-adapter.js?v=r8-s5-3',
  '../session-commit-harness.js?v=r8-s5-3'
]);
const ALLOWED_ASSETS = new Set(
  LOCAL_SHELL.map((path) => new URL(path, self.registration.scope).href)
);
const FALLBACK_URL = new URL('./index.html?fixture=all', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(LOCAL_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' && url.pathname.startsWith(self.registration.scope.replace(url.origin, ''))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, copy))
                .catch(() => {})
            );
          }
          return response;
        })
        .catch(() => caches.match(FALLBACK_URL).then(
          (cached) => cached || Response.error()
        ))
    );
    return;
  }

  if (!ALLOWED_ASSETS.has(url.href)) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
