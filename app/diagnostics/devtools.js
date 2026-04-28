'use strict';
/**
 * MODULE: diagnostics/devtools.js
 * Description: Dev toggles attached to the Touch-Log panel (left column).
 * Notes:
 *  - Uses localStorage flags where possible.
 *  - Push control uses AppModules.push when available; profile remains a temporary backend.
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
  const getPushApi = () => global.AppModules?.push || null;
  const getDiag = () => global.AppModules?.diagnostics?.diag || global.diag || null;
  const getOperationalPushApi = () => {
    const push = getPushApi();
    if (
      push?.enablePush
      && push?.disablePush
      && push?.isPushEnabled
      && push?.refreshPushStatus
      && push?.getPushRoutingStatus
    ) {
      return push;
    }
    return null;
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

  const compactHash = (value) => {
    const text = String(value || '');
    if (!text) return '';
    if (text.length <= 12) return text;
    return `${text.slice(0, 8)}...${text.slice(-4)}`;
  };

  const describeContext = (routing) => {
    const context = routing?.context || {};
    const value = routing?.clientContext || context.clientContext || '';
    if (value === 'android-webview') return 'Android-WebView';
    if (value === 'pwa-standalone') return 'PWA/Standalone';
    if (value === 'browser') return 'Browser';
    return value || 'unbekannt';
  };

  const describeDeviceLabel = (routing) => {
    const context = routing?.context || {};
    return routing?.clientLabel
      || routing?.subscriptionMetadata?.client_label
      || [routing?.clientPlatform || context.platform, routing?.clientBrowser || context.browser, routing?.clientDisplayMode || context.displayMode]
        .filter(Boolean)
        .join(' / ')
      || 'unbekannt';
  };

  const describeDiagnosticDetail = (routing) => {
    if (!routing?.hasBrowserSubscription) return 'nicht verfuegbar';
    const successMs = Date.parse(routing?.lastDiagnosticSuccessAt || '');
    const failureMs = Date.parse(routing?.lastDiagnosticFailureAt || '');
    if (Number.isFinite(failureMs) && (!Number.isFinite(successMs) || failureMs > successMs)) {
      return 'pruefen';
    }
    if (Number.isFinite(successMs)) return 'Test erfolgreich';
    if (routing?.lastDiagnosticAttemptAt) return 'Test offen';
    return 'nicht getestet';
  };

  const isAndroidWebViewRouting = (routing) => (
    routing?.context?.isAndroidWebView === true || routing?.clientContext === 'android-webview'
  );

  const buildPushDetailRows = (routing) => {
    const permission = routing?.permission || global.Notification?.permission || 'default';
    const endpointHash = routing?.endpointHash || routing?.subscriptionMetadata?.endpoint_hash || '';
    const rows = [
      ['Kontext', describeContext(routing)],
      ['Geraet', describeDeviceLabel(routing)],
      ['Berechtigung', getPermissionLabel(permission)],
      ['Browser-Abo', routing?.hasBrowserSubscription ? 'aktiv' : 'fehlt'],
      ['Remote', describeRemoteDetail(routing)],
      ['Diagnose', describeDiagnosticDetail(routing)],
      ['Endpoint-Hash', compactHash(endpointHash) || '--'],
      ['Letzter Erfolg', formatShortDateTime(routing?.lastRemoteSuccessAt) || '--'],
      ['Letzter Fehler', formatShortDateTime(routing?.lastRemoteFailureAt) || '--'],
      ['Letzter Test', formatShortDateTime(routing?.lastDiagnosticSuccessAt) || '--'],
      ['Geprueft', formatShortDateTime(routing?.checkedAt) || '--'],
    ];
    if (isAndroidWebViewRouting(routing)) {
      rows.push(['Empfehlung', 'Fuer Erinnerungen MIDAS in Chrome/PWA aktivieren.']);
    }
    return rows;
  };

  const describePushRouting = (routing) => {
    if (isAndroidWebViewRouting(routing)) {
      return {
        text: 'Push: Android-WebView - Chrome/PWA empfohlen',
        tone: 'warn',
      };
    }
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

  const setPushControlBlocked = (el, blocked) => {
    if (!el) return;
    el.disabled = !!blocked;
    el.setAttribute('aria-disabled', blocked ? 'true' : 'false');
    const label = el.closest?.('label');
    label?.setAttribute('aria-disabled', blocked ? 'true' : 'false');
    if (blocked) {
      el.title = 'Diese Android-Ansicht ist fuer Widget und Sync gedacht. Fuer verlaessliche Erinnerungen bitte MIDAS in Chrome/PWA aktivieren.';
    } else {
      el.removeAttribute('title');
    }
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
      const push = getOperationalPushApi();
      if (push) {
        const routingFromRefresh = await push.refreshPushStatus({ reason: 'devtools' });
        const enabled = await push.isPushEnabled();
        const routing = routingFromRefresh || push.getPushRoutingStatus();
        const blocked = isAndroidWebViewRouting(routing);
        updateToggle(el, !!enabled);
        setPushControlBlocked(el, blocked);
        const status = describePushRouting(routing);
        setPushDiagStatus(statusEl, status.text, status.tone);
        setPushDiagDetails(detailsEl, buildPushDetailRows(routing));
        return;
      }
      updateToggle(el, false);
      setPushControlBlocked(el, false);
      setPushDiagStatus(statusEl, 'Push: unbekannt - Modul nicht bereit', 'warn');
      setPushDiagDetails(detailsEl, buildPushDetailRows(null));
    } catch (err) {
      updateToggle(el, false);
      setPushControlBlocked(el, false);
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
      const push = getOperationalPushApi();
      if (!push) {
        updateToggle(pushEl, false);
        setPushDiagStatus(pushStatusEl, 'Push: unbekannt - Modul nicht bereit', 'warn');
        return;
      }
      const currentRouting = push.getPushRoutingStatus();
      if (isAndroidWebViewRouting(currentRouting)) {
        updateToggle(pushEl, false);
        setPushDiagStatus(pushStatusEl, 'Push: Android-WebView - Chrome/PWA empfohlen', 'warn');
        setPushDiagDetails(doc.querySelector(selectors.pushDetails), buildPushDetailRows(currentRouting));
        setPushControlBlocked(pushEl, true);
        return;
      }
      if (pushEl.checked) {
        await push.enablePush();
      } else {
        await push.disablePush();
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
