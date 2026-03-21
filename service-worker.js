'use strict';
/* PWA service worker (Phase 2): shell cache + offline fallback. */

const CACHE_VERSION = 'v2';
const SHELL_CACHE = `midas-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `midas-runtime-${CACHE_VERSION}`;
const INCIDENT_VIBRATE_PATTERN = [300, 150, 300, 150, 600];
const INCIDENT_ACTIONS = [
  {
    action: 'open-incident',
    title: 'Jetzt oeffnen'
  }
];

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
const isIncidentNotification = ({ tag = '', data = {} } = {}) => {
  const normalizedTag = String(tag || '');
  const type = String(data?.type || '');
  return normalizedTag.startsWith('midas-incident-')
    || type === 'medication_morning'
    || type === 'medication_daily_open'
    || type === 'bp_evening';
};
const buildNotificationOptions = (payload = {}, fallback = {}) => {
  const data = payload.data || fallback.data || {};
  const tag = payload.tag || fallback.tag;
  const isIncident = isIncidentNotification({ tag, data });
  const options = {
    body: payload.body || fallback.body,
    tag,
    data,
    renotify: payload.renotify == null ? false : !!payload.renotify,
    icon: payload.icon || 'public/img/icons/icon-192.png',
    badge: payload.badge || 'public/img/icons/icon-192.png'
  };
  if (payload.silent != null) {
    options.silent = !!payload.silent;
  } else if (isIncident) {
    options.silent = false;
  }
  if (Array.isArray(payload.vibrate)) {
    options.vibrate = payload.vibrate;
  } else if (isIncident) {
    options.vibrate = INCIDENT_VIBRATE_PATTERN;
  }
  if (payload.requireInteraction != null) {
    options.requireInteraction = !!payload.requireInteraction;
  } else if (isIncident) {
    options.requireInteraction = true;
  }
  if (Array.isArray(payload.actions) && payload.actions.length) {
    options.actions = payload.actions;
  } else if (isIncident) {
    options.actions = INCIDENT_ACTIONS;
  }
  return options;
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
  const options = buildNotificationOptions(payload, fallback);
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification?.close?.();
  if (event.action && event.action !== 'open-incident') {
    return;
  }
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
