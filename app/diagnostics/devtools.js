'use strict';
/**
 * MODULE: diagnostics/devtools.js
 * Description: Dev toggles attached to the Touch-Log panel (left column).
 * Notes:
 *  - Uses localStorage flags where possible.
 *  - Push toggle reuses profile buttons to avoid duplicate logic.
 */

(function initDevTools(global) {
  const doc = global.document;
  if (!doc) return;

  const selectors = {
    push: '#devTogglePush',
    sound: '#devToggleSound',
    haptic: '#devToggleHaptic',
    nocache: '#devToggleNoCache'
  };

  const getFeedback = () => global.AppModules?.feedback || null;
  const getProfileApi = () => global.AppModules?.profile || null;

  const readFlag = (key, fallback = null) => {
    try {
      const raw = global.localStorage?.getItem(key);
      if (raw == null) return fallback;
      if (raw === 'true' || raw === '1') return true;
      if (raw === 'false' || raw === '0') return false;
      return fallback;
    } catch (_) {
      return fallback;
    }
  };

  const writeFlag = (key, value) => {
    try {
      global.localStorage?.setItem(key, String(!!value));
    } catch (_) {
      /* ignore */
    }
  };

  const updateToggle = (el, value) => {
    if (!el) return;
    el.checked = !!value;
  };

  const updatePushToggle = async (el) => {
    if (!el) return;
    try {
      const profile = getProfileApi();
      if (profile?.isPushEnabled) {
        const enabled = await profile.isPushEnabled();
        updateToggle(el, !!enabled);
        return;
      }
      updateToggle(el, false);
    } catch (_) {
      updateToggle(el, false);
    }
  };

  const applyNoCacheMode = (enabled) => {
    writeFlag('DEV_NOCACHE_ASSETS', enabled);
    doc.body?.setAttribute('data-dev-nocache', enabled ? 'true' : 'false');
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('http')) return;
      const base = href.split('?')[0];
      if (enabled) {
        link.setAttribute('href', `${base}?v=${Date.now()}`);
      } else {
        link.setAttribute('href', base);
      }
    });
  };

  const bind = () => {
    const pushEl = doc.querySelector(selectors.push);
    const soundEl = doc.querySelector(selectors.sound);
    const hapticEl = doc.querySelector(selectors.haptic);
    const nocacheEl = doc.querySelector(selectors.nocache);

    const feedback = getFeedback();
    updateToggle(soundEl, feedback?.isSoundEnabled?.() ?? readFlag('FEEDBACK_SOUND_ENABLED', true));
    updateToggle(hapticEl, feedback?.isHapticEnabled?.() ?? readFlag('FEEDBACK_HAPTIC_ENABLED', true));
    updateToggle(nocacheEl, readFlag('DEV_NOCACHE_ASSETS', false));
    updatePushToggle(pushEl);

    soundEl?.addEventListener('change', () => {
      const on = !!soundEl.checked;
      writeFlag('FEEDBACK_SOUND_ENABLED', on);
      feedback?.setSoundEnabled?.(on);
    });

    hapticEl?.addEventListener('change', () => {
      const on = !!hapticEl.checked;
      writeFlag('FEEDBACK_HAPTIC_ENABLED', on);
      feedback?.setHapticEnabled?.(on);
    });

    nocacheEl?.addEventListener('change', () => {
      const on = !!nocacheEl.checked;
      applyNoCacheMode(on);
    });

    pushEl?.addEventListener('change', async () => {
      const profile = getProfileApi();
      if (pushEl.checked) {
        await profile?.enablePush?.();
      } else {
        await profile?.disablePush?.();
      }
      await updatePushToggle(pushEl);
    });

    const nocacheInitial = readFlag('DEV_NOCACHE_ASSETS', false);
    if (nocacheInitial) {
      applyNoCacheMode(true);
    }
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})(typeof window !== 'undefined' ? window : globalThis);
