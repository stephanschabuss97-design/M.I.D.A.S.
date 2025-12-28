'use strict';
/**
 * MODULE: pwa.js
 * Description: Registers the service worker when supported.
 */

(function registerPwa(global) {
  if (!('serviceWorker' in global.navigator)) return;
  global.addEventListener('load', () => {
    global.navigator.serviceWorker
      .register('service-worker.js')
      .catch(() => {
        // Keep silent; diagnostics are handled elsewhere.
      });
  });

  const banner = global.document?.getElementById('offlineBanner');
  const syncBanner = () => {
    if (!banner) return;
    const isOffline = global.navigator && global.navigator.onLine === false;
    banner.hidden = !isOffline;
    banner.setAttribute('aria-hidden', isOffline ? 'false' : 'true');
  };
  syncBanner();
  global.addEventListener('online', syncBanner);
  global.addEventListener('offline', syncBanner);
})(typeof window !== 'undefined' ? window : globalThis);
