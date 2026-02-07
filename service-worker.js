'use strict';
/* PWA service worker (Phase 2): shell cache + offline fallback. */

const CACHE_VERSION = 'v2';
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
  toUrl('app/core/feedback.js'),
  toUrl('app/core/pwa.js'),
  toUrl('app/core/utils.js'),
  toUrl('app/core/capture-globals.js'),
  toUrl('assets/js/ui.js'),
  toUrl('assets/js/ui-layout.js'),
  toUrl('assets/js/ui-errors.js'),
  toUrl('assets/js/format.js'),
  toUrl('assets/js/data-local.js'),
  toUrl('assets/js/ui-tabs.js'),
  toUrl('app/supabase/index.js'),
  toUrl('assets/js/boot-auth.js'),
  toUrl('assets/js/main.js'),
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
const getNavigateFallbackResponse = async (request) => {
  const direct = await caches.match(request);
  if (direct) return direct;
  const shellIndex = await caches.match(toUrl('index.html'));
  if (shellIndex) return shellIndex;
  const shellRoot = await caches.match(toUrl('./'));
  if (shellRoot) return shellRoot;
  return caches.match(toUrl('offline.html'));
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
        .catch(() => getNavigateFallbackResponse(request))
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

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'MIDAS Hinweis',
    body: 'Es liegt ein Incident vor.',
    tag: 'midas-incident',
    data: {}
  };
  let payload = {};
  try {
    payload = event?.data?.json?.() || {};
  } catch (_) {
    payload = {};
  }
  const title = payload.title || fallback.title;
  const options = {
    body: payload.body || fallback.body,
    tag: payload.tag || fallback.tag,
    data: payload.data || {},
    silent: !!payload.silent,
    renotify: !!payload.renotify,
    icon: 'public/img/icons/icon-192.png',
    badge: 'public/img/icons/icon-192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification?.close?.();
  const data = event.notification?.data || {};
  const params = new URLSearchParams();
  if (data.type) params.set('incident', data.type);
  if (data.dayIso) params.set('day', data.dayIso);
  const targetUrl = params.toString()
    ? new URL(`./?${params.toString()}`, self.registration.scope).toString()
    : new URL('./', self.registration.scope).toString();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
