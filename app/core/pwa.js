'use strict';
/**
 * MODULE: pwa.js
 * Description: Registers the service worker when supported.
 */

(function registerPwa(global) {
  if (!('serviceWorker' in global.navigator)) return;
  const updateBanner = global.document?.getElementById('updateBanner');
  const updateReloadBtn = global.document?.getElementById('updateReloadBtn');
  const updateBannerHint = global.document?.getElementById('updateBannerHint');
  const showUpdateBanner = () => {
    if (!updateBanner) return;
    updateBanner.hidden = false;
    updateBanner.setAttribute('aria-hidden', 'false');
  };
  const hideUpdateBanner = () => {
    if (!updateBanner) return;
    updateBanner.hidden = true;
    updateBanner.setAttribute('aria-hidden', 'true');
  };
  const promptForUpdate = (registration) => {
    showUpdateBanner();
    updateReloadBtn?.addEventListener('click', () => {
      if (updateBannerHint) {
        updateBannerHint.textContent = 'Aktualisiere...';
      }
      if (updateReloadBtn) {
        updateReloadBtn.disabled = true;
      }
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }, { once: true });
  };

  global.navigator.serviceWorker.addEventListener('controllerchange', () => {
    hideUpdateBanner();
    global.location.reload();
  });

  global.addEventListener('load', () => {
    global.navigator.serviceWorker
      .register('service-worker.js')
      .then((registration) => {
        if (registration.waiting) {
          promptForUpdate(registration);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && registration.waiting) {
              promptForUpdate(registration);
            }
          });
        });
      })
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
