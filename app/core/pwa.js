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
  const installBanner = global.document?.getElementById('installBanner');
  const installBtn = global.document?.getElementById('installBtn');
  let deferredInstallPrompt = null;
  let didApplyControllerReload = false;
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

  const showInstallBanner = () => {
    if (!installBanner) return;
    installBanner.hidden = false;
    installBanner.setAttribute('aria-hidden', 'false');
  };
  const hideInstallBanner = () => {
    if (!installBanner) return;
    installBanner.hidden = true;
    installBanner.setAttribute('aria-hidden', 'true');
  };

  global.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallBanner();
  });

  installBtn?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    hideInstallBanner();
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (_) {
      /* ignore */
    }
    deferredInstallPrompt = null;
  });

  global.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
  });

  const applyControllerReload = () => {
    if (didApplyControllerReload) return;
    didApplyControllerReload = true;
    hideUpdateBanner();
    global.location.reload();
  };
  const scheduleControllerReload = () => {
    const bootFlow = global.AppModules?.bootFlow || null;
    if (!bootFlow?.whenStage || !bootFlow?.getStage) {
      applyControllerReload();
      return;
    }
    const currentStage = String(bootFlow.getStage() || '');
    if (currentStage === 'IDLE' || currentStage === 'BOOT_ERROR') {
      applyControllerReload();
      return;
    }
    let settled = false;
    const timer = global.setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe?.();
      applyControllerReload();
    }, 2000);
    const unsubscribe = bootFlow.whenStage('IDLE', () => {
      if (settled) return;
      settled = true;
      global.clearTimeout(timer);
      applyControllerReload();
    });
  };
  global.navigator.serviceWorker.addEventListener('controllerchange', () => {
    scheduleControllerReload();
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
