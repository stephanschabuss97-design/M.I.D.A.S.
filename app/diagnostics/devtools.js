'use strict';
/**
 * MODULE: diagnostics/devtools.js
 * Description: Dev toggles attached to the Touch-Log panel (left column).
 * Notes:
 *  - Uses localStorage flags where possible.
 *  - Push control uses the internal profile push API; no visible profile UI is required.
 */

(function initDevTools(global) {
  const doc = global.document;
  if (!doc) return;

  const selectors = {
    push: '#devTogglePush',
    pushStatus: '#devPushStatus',
    pushDetails: '#devPushDetails',
    activeModes: '#devActiveModes',
    clearLog: '#devClearLogBtn',
    sound: '#devToggleSound',
    haptic: '#devToggleHaptic',
    nocache: '#devToggleNoCache',
    assistant: '#devToggleAssistant'
  };
  const ASSISTANT_SURFACE_STORAGE_KEY = 'MIDAS_ASSISTANT_SURFACE_ENABLED';
  const assistantSurfaceListeners = new Set();

  const getFeedback = () => global.AppModules?.feedback || null;
  const getProfileApi = () => global.AppModules?.profile || null;
  const getDiag = () => global.AppModules?.diagnostics?.diag || global.diag || null;
  const getProfilePushApi = () => {
    const profile = getProfileApi();
    if (
      !profile?.enablePush
      || !profile?.disablePush
      || !profile?.isPushEnabled
      || !profile?.refreshPushStatus
      || !profile?.getPushRoutingStatus
    ) {
      return null;
    }
    return profile;
  };

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

  const renderActiveModes = (el, modes = []) => {
    if (!el) return;
    el.innerHTML = '';
    const active = modes.filter((mode) => mode?.active);
    if (!active.length) {
      const pill = doc.createElement('span');
      pill.className = 'diag-mode-pill is-muted';
      pill.textContent = 'Keine aktiv';
      el.appendChild(pill);
      return;
    }
    active.forEach((mode) => {
      const pill = doc.createElement('span');
      pill.className = 'diag-mode-pill';
      pill.textContent = mode.label;
      el.appendChild(pill);
    });
  };

  const setPushDiagStatus = (el, text, tone = '') => {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('is-ok', tone === 'ok');
    el.classList.toggle('is-warn', tone === 'warn');
    el.classList.toggle('is-error', tone === 'error');
  };

  const setPushDiagDetails = (el, rows = []) => {
    if (!el) return;
    el.innerHTML = '';
    const dl = doc.createElement('dl');
    rows.forEach(([label, value]) => {
      const dt = doc.createElement('dt');
      dt.textContent = label;
      const dd = doc.createElement('dd');
      dd.textContent = value || '--';
      dl.append(dt, dd);
    });
    el.appendChild(dl);
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

  const getPermissionLabel = (permission) => {
    if (permission === 'granted') return 'erlaubt';
    if (permission === 'denied') return 'blockiert';
    if (permission === 'default') return 'offen';
    return 'unbekannt';
  };

  const describeRemoteDetail = (routing) => {
    if (!routing?.hasBrowserSubscription) return 'unbekannt';
    if (routing.remoteHealthy) return 'gesund';
    if (routing.healthRefreshError) return 'Health-Check offen';
    if (routing.remoteDisabled) return 'pruefen';
    if (routing.hasRemoteSubscription) {
      const hasFailure = !!routing.lastRemoteFailureAt
        || Number(routing.consecutiveRemoteFailures || 0) > 0;
      if (hasFailure) return 'pruefen';
      if (!routing.lastRemoteSuccessAt) return 'bereit, wartet';
    }
    return 'unbekannt';
  };

  const buildPushDetailRows = (routing) => {
    const permission = routing?.permission || global.Notification?.permission || 'default';
    return [
      ['Berechtigung', getPermissionLabel(permission)],
      ['Browser-Abo', routing?.hasBrowserSubscription ? 'aktiv' : 'fehlt'],
      ['Remote', describeRemoteDetail(routing)],
      ['Letzter Erfolg', formatShortDateTime(routing?.lastRemoteSuccessAt) || '--'],
      ['Letzter Fehler', formatShortDateTime(routing?.lastRemoteFailureAt) || '--'],
      ['Geprueft', formatShortDateTime(routing?.checkedAt) || '--'],
    ];
  };

  const describePushRouting = (routing) => {
    if (!routing?.hasBrowserSubscription) {
      const permission = routing?.permission || global.Notification?.permission || 'default';
      if (permission === 'denied') {
        return { text: 'Push: Zustellung pruefen (Browser blockiert)', tone: 'error' };
      }
      if (permission === 'granted') {
        return { text: 'Push: Browser-Abo fehlt', tone: 'warn' };
      }
      return { text: 'Push: nicht aktiv', tone: '' };
    }
    if (routing.remoteHealthy) {
      const lastSuccess = formatShortDateTime(routing.lastRemoteSuccessAt);
      return {
        text: `Push: aktiv - remote gesund${lastSuccess ? ` (${lastSuccess})` : ''}`,
        tone: 'ok',
      };
    }
    if (routing.healthRefreshError) {
      return { text: 'Push: unbekannt - Health-Check offen', tone: 'warn' };
    }
    if (routing.hasRemoteSubscription) {
      const hasFailure = routing.remoteDisabled
        || !!routing.lastRemoteFailureAt
        || Number(routing.consecutiveRemoteFailures || 0) > 0;
      if (!hasFailure && !routing.lastRemoteSuccessAt) {
        return {
          text: 'Push: aktiv - bereit, wartet',
          tone: '',
        };
      }
      const lastFailure = formatShortDateTime(routing.lastRemoteFailureAt);
      return {
        text: `Push: Zustellung pruefen${lastFailure ? ` (${lastFailure})` : ''}`,
        tone: 'warn',
      };
    }
    return { text: 'Push: unbekannt - Remote offen', tone: 'warn' };
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
    const detailsEl = doc.querySelector(selectors.pushDetails);
    try {
      const profile = getProfilePushApi();
      if (profile) {
        await profile.refreshPushStatus({ reason: 'devtools' });
        const enabled = await profile.isPushEnabled();
        updateToggle(el, !!enabled);
        const routing = profile.getPushRoutingStatus();
        const status = describePushRouting(routing);
        setPushDiagStatus(statusEl, status.text, status.tone);
        setPushDiagDetails(detailsEl, buildPushDetailRows(routing));
        return;
      }
      updateToggle(el, false);
      setPushDiagStatus(statusEl, 'Push: unbekannt - Modul nicht bereit', 'warn');
      setPushDiagDetails(detailsEl, buildPushDetailRows(null));
    } catch (err) {
      updateToggle(el, false);
      setPushDiagStatus(statusEl, 'Push: unbekannt - Diagnose fehlgeschlagen', 'error');
      setPushDiagDetails(detailsEl, buildPushDetailRows(null));
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
    const activeModesEl = doc.querySelector(selectors.activeModes);
    const clearLogBtn = doc.querySelector(selectors.clearLog);

    const updateActiveModes = () => {
      renderActiveModes(activeModesEl, [
        { label: 'Sound', active: !!soundEl?.checked },
        { label: 'Haptik', active: !!hapticEl?.checked },
        { label: 'No Cache', active: !!nocacheEl?.checked },
        { label: 'Assistant', active: !!assistantEl?.checked },
      ]);
    };

    const feedback = getFeedback();
    updateToggle(soundEl, feedback?.isSoundEnabled?.() ?? readFlag('FEEDBACK_SOUND_ENABLED', true));
    updateToggle(hapticEl, feedback?.isHapticEnabled?.() ?? readFlag('FEEDBACK_HAPTIC_ENABLED', true));
    updateToggle(nocacheEl, readFlag('DEV_NOCACHE_ASSETS', false));
    updateToggle(assistantEl, readAssistantSurfaceEnabled());
    updateActiveModes();
    updatePushToggle(pushEl, pushStatusEl);

    soundEl?.addEventListener('change', () => {
      const on = !!soundEl.checked;
      writeFlag('FEEDBACK_SOUND_ENABLED', on);
      feedback?.setSoundEnabled?.(on);
      updateActiveModes();
    });

    hapticEl?.addEventListener('change', () => {
      const on = !!hapticEl.checked;
      writeFlag('FEEDBACK_HAPTIC_ENABLED', on);
      feedback?.setHapticEnabled?.(on);
      updateActiveModes();
    });

    nocacheEl?.addEventListener('change', () => {
      const on = !!nocacheEl.checked;
      applyNoCacheMode(on);
      updateActiveModes();
    });

    assistantEl?.addEventListener('change', () => {
      const on = !!assistantEl.checked;
      setAssistantSurfaceEnabled(on);
      updateToggle(assistantEl, on);
      updateActiveModes();
    });

    clearLogBtn?.addEventListener('click', () => {
      getDiag()?.clear?.();
    });

    pushEl?.addEventListener('change', async () => {
      const profile = getProfilePushApi();
      if (!profile) {
        updateToggle(pushEl, false);
        setPushDiagStatus(pushStatusEl, 'Push: unbekannt - Modul nicht bereit', 'warn');
        return;
      }
      if (pushEl.checked) {
        await profile.enablePush();
      } else {
        await profile.disablePush();
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
