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
})(typeof window !== 'undefined' ? window : globalThis);
