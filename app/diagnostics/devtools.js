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
    pushStatus: '#devPushStatus',
    sound: '#devToggleSound',
    haptic: '#devToggleHaptic',
    nocache: '#devToggleNoCache',
    assistant: '#devToggleAssistant'
  };
  const ASSISTANT_SURFACE_STORAGE_KEY = 'MIDAS_ASSISTANT_SURFACE_ENABLED';
  const assistantSurfaceListeners = new Set();

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

  const setPushDiagStatus = (el, text, tone = '') => {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('is-ok', tone === 'ok');
    el.classList.toggle('is-warn', tone === 'warn');
    el.classList.toggle('is-error', tone === 'error');
  };

  const formatShortDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const describePushRouting = (routing) => {
    if (!routing?.hasBrowserSubscription) {
      const permission = routing?.permission || global.Notification?.permission || 'default';
      if (permission === 'denied') {
        return { text: 'Push: Browser blockiert', tone: 'error' };
      }
      return { text: 'Push: kein Browser-Abo', tone: 'warn' };
    }
    if (routing.remoteHealthy) {
      const lastSuccess = formatShortDateTime(routing.lastRemoteSuccessAt);
      return {
        text: `Push: Abo aktiv, Remote gesund${lastSuccess ? ` (${lastSuccess})` : ''}`,
        tone: 'ok',
      };
    }
    if (routing.healthRefreshError) {
      return { text: 'Push: Abo aktiv, Health-Check nicht lesbar', tone: 'warn' };
    }
    if (routing.hasRemoteSubscription) {
      const hasFailure = routing.remoteDisabled
        || !!routing.lastRemoteFailureAt
        || Number(routing.consecutiveRemoteFailures || 0) > 0;
      if (!hasFailure && !routing.lastRemoteSuccessAt) {
        return {
          text: 'Push: bereit, wartet auf erste faellige Erinnerung',
          tone: '',
        };
      }
      const lastFailure = formatShortDateTime(routing.lastRemoteFailureAt);
      const reason = routing.lastRemoteFailureReason ? ` - ${routing.lastRemoteFailureReason}` : '';
      return {
        text: `Push: Zustellung pruefen${lastFailure ? ` (${lastFailure})` : ''}${reason}`,
        tone: 'warn',
      };
    }
    return { text: 'Push: Abo aktiv, wartet auf Remote-Bestaetigung', tone: 'warn' };
  };

  const readAssistantSurfaceEnabled = () => readFlag(ASSISTANT_SURFACE_STORAGE_KEY, false) === true;

  const applyAssistantSurfaceState = (enabled) => {
    doc.body?.setAttribute('data-assistant-surface', enabled ? 'on' : 'off');
  };

  const notifyAssistantSurfaceChanged = (enabled) => {
    const detail = { enabled: !!enabled };
    assistantSurfaceListeners.forEach((listener) => {
      try {
        listener(detail);
      } catch (_) {
        /* ignore */
      }
    });
    try {
      global.dispatchEvent?.(
        new CustomEvent('assistant-surface:changed', {
          detail,
        }),
      );
    } catch (_) {
      /* ignore */
    }
  };

  const setAssistantSurfaceEnabled = (enabled) => {
    const next = !!enabled;
    writeFlag(ASSISTANT_SURFACE_STORAGE_KEY, next);
    applyAssistantSurfaceState(next);
    notifyAssistantSurfaceChanged(next);
    return next;
  };

  global.AppModules = global.AppModules || {};
  global.AppModules.assistantSurface = Object.assign(global.AppModules.assistantSurface || {}, {
    isEnabled: readAssistantSurfaceEnabled,
    getEnabled: readAssistantSurfaceEnabled,
    setEnabled: setAssistantSurfaceEnabled,
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      assistantSurfaceListeners.add(listener);
      return () => {
        assistantSurfaceListeners.delete(listener);
      };
    }
  });

  applyAssistantSurfaceState(readAssistantSurfaceEnabled());

  const updatePushToggle = async (el, statusEl = null) => {
    if (!el) return;
    try {
      const profile = getProfileApi();
      if (profile?.isPushEnabled) {
        await profile.refreshPushStatus?.({ reason: 'devtools' });
        const enabled = await profile.isPushEnabled();
        updateToggle(el, !!enabled);
        const routing = profile.getPushRoutingStatus?.();
        const status = describePushRouting(routing);
        setPushDiagStatus(statusEl, status.text, status.tone);
        return;
      }
      updateToggle(el, false);
      setPushDiagStatus(statusEl, 'Push: Profilmodul nicht bereit', 'warn');
    } catch (err) {
      updateToggle(el, false);
      setPushDiagStatus(statusEl, `Push: Diagnose fehlgeschlagen (${err?.message || err})`, 'error');
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
    const pushStatusEl = doc.querySelector(selectors.pushStatus);
    const soundEl = doc.querySelector(selectors.sound);
    const hapticEl = doc.querySelector(selectors.haptic);
    const nocacheEl = doc.querySelector(selectors.nocache);
    const assistantEl = doc.querySelector(selectors.assistant);

    const feedback = getFeedback();
    updateToggle(soundEl, feedback?.isSoundEnabled?.() ?? readFlag('FEEDBACK_SOUND_ENABLED', true));
    updateToggle(hapticEl, feedback?.isHapticEnabled?.() ?? readFlag('FEEDBACK_HAPTIC_ENABLED', true));
    updateToggle(nocacheEl, readFlag('DEV_NOCACHE_ASSETS', false));
    updateToggle(assistantEl, readAssistantSurfaceEnabled());
    updatePushToggle(pushEl, pushStatusEl);

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

    assistantEl?.addEventListener('change', () => {
      const on = !!assistantEl.checked;
      setAssistantSurfaceEnabled(on);
      updateToggle(assistantEl, on);
    });

    pushEl?.addEventListener('change', async () => {
      const profile = getProfileApi();
      if (pushEl.checked) {
        await profile?.enablePush?.();
      } else {
        await profile?.disablePush?.();
      }
      await updatePushToggle(pushEl, pushStatusEl);
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
