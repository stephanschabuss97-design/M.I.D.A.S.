'use strict';
/**
 * MODULE: boot-flow.js
 * Description: Orchestriert den neuen Bootstrap-Funnel BOOT → AUTH_CHECK → INIT_CORE → INIT_MODULES → INIT_UI → IDLE.
 * Submodules:
 *  - Diagnostics & Constants
 *  - Config-Status Buffer (setConfigStatusSafe)
 *  - Stage Normalisierung & Ordering
 *  - Waiter/Listener & DOM-Binding
 *  - Stage Commit & Hang Timer
 *  - Public API (setStage/whenStage/onStageChange/markFailed)
 *  - Init
 */

(function bootFlowModule(global) {
  /** SUBMODULE: Diagnostics & Constants **/
  const doc = global.document;
  const diag =
    global.AppModules?.diag ||
    global.diag || { add() {} };

  const STAGES = ['BOOT', 'AUTH_CHECK', 'INIT_CORE', 'INIT_MODULES', 'INIT_UI', 'IDLE'];
  const FALLBACK_STAGE_ERROR = 'BOOT_ERROR';
  const STAGE_HANG_TIMEOUT_MS = 15000;
  const BOOT_ERROR_HISTORY_KEY = 'midas.bootErrorHistory.v1';
  const BOOT_ERROR_HISTORY_LIMIT = 3;
  const EARLY_BOOT_ERROR_FALLBACK_ID = 'earlyBootErrorFallback';
  const stageLabels = {
    BOOT: 'BOOT',
    AUTH_CHECK: 'AUTH CHECK',
    INIT_CORE: 'INIT CORE',
    INIT_MODULES: 'INIT MODULES',
    INIT_UI: 'INIT UI',
    IDLE: 'READY',
    BOOT_ERROR: 'BOOT ERROR'
  };
  const bootErrorState = {
    message: '',
    detail: '',
    phase: '',
    stack: '',
    timestamp: '',
    signature: ''
  };
  let bootErrorHistory = [];
  let pendingEarlyFallbackText = '';
  const getStorageSafe = () => {
    try {
      return global.localStorage || null;
    } catch (_) {
      return null;
    }
  };
  const sanitizeHistoryEntry = (entry) => {
    if (!entry || typeof entry !== 'object') return null;
    const message = typeof entry.message === 'string' ? entry.message : '';
    const detail = typeof entry.detail === 'string' ? entry.detail : '';
    const phase = typeof entry.phase === 'string' ? entry.phase : '';
    const stack = typeof entry.stack === 'string' ? entry.stack : '';
    const timestamp = typeof entry.timestamp === 'string' ? entry.timestamp : '';
    const signature = typeof entry.signature === 'string' ? entry.signature : '';
    const recordedAt = typeof entry.recordedAt === 'string' ? entry.recordedAt : '';
    if (!message && !detail) return null;
    return {
      message,
      detail,
      phase,
      stack,
      timestamp,
      signature,
      recordedAt
    };
  };
  const saveBootErrorHistory = () => {
    const storage = getStorageSafe();
    if (!storage) return;
    try {
      if (!bootErrorHistory.length) {
        storage.removeItem(BOOT_ERROR_HISTORY_KEY);
        return;
      }
      storage.setItem(BOOT_ERROR_HISTORY_KEY, JSON.stringify(bootErrorHistory));
    } catch (_) {
      /* ignore storage errors */
    }
  };
  const loadBootErrorHistory = () => {
    const storage = getStorageSafe();
    if (!storage) return [];
    try {
      const raw = storage.getItem(BOOT_ERROR_HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(sanitizeHistoryEntry)
        .filter(Boolean)
        .slice(0, BOOT_ERROR_HISTORY_LIMIT);
    } catch (_) {
      return [];
    }
  };
  const pushBootErrorHistory = (payload) => {
    const entry = sanitizeHistoryEntry({
      ...payload,
      recordedAt: new Date().toISOString()
    });
    if (!entry) return;
    const head = bootErrorHistory[0];
    if (head?.signature && entry.signature && head.signature === entry.signature) {
      bootErrorHistory[0] = entry;
    } else {
      bootErrorHistory.unshift(entry);
      bootErrorHistory = bootErrorHistory.slice(0, BOOT_ERROR_HISTORY_LIMIT);
    }
    saveBootErrorHistory();
  };
  const getBootErrorPanel = () => doc?.getElementById('bootErrorPanel');
  const getBootErrorMessageEl = () => doc?.getElementById('bootErrorMessage');
  const getBootErrorDetailEl = () => doc?.getElementById('bootErrorDetail');
  const getBootErrorDiagBtn = () => doc?.getElementById('bootErrorDiagBtn');
  const getBootErrorFallbackLogEl = () => doc?.getElementById('bootErrorFallbackLog');
  const getEarlyBootFallbackEl = () => doc?.getElementById(EARLY_BOOT_ERROR_FALLBACK_ID);
  const applyEarlyFallbackStyle = (el) => {
    if (!el?.style) return;
    el.style.position = 'fixed';
    el.style.left = '8px';
    el.style.right = '8px';
    el.style.top = '8px';
    el.style.padding = '10px 12px';
    el.style.margin = '0';
    el.style.maxHeight = '45vh';
    el.style.overflow = 'auto';
    el.style.whiteSpace = 'pre-wrap';
    el.style.background = '#0f1116';
    el.style.color = '#f3f4f6';
    el.style.border = '1px solid #ef4444';
    el.style.borderRadius = '8px';
    el.style.zIndex = '2147483647';
    el.style.font = '12px/1.4 monospace';
  };
  const getDiagPanel = () =>
    global.AppModules?.diag ||
    global.diag ||
    global.AppModules?.diagnostics?.diag ||
    null;
  const hideBootErrorFallbackLog = () => {
    const el = getBootErrorFallbackLogEl();
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  };
  const hideEarlyBootFallback = () => {
    const el = getEarlyBootFallbackEl();
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  };
  const buildEarlyFallbackText = (payload) => {
    const lines = [];
    lines.push('[MIDAS] Frueher Bootfehler');
    lines.push(`Message: ${payload?.message || 'Boot fehlgeschlagen.'}`);
    if (payload?.phase) lines.push(`Phase: ${payload.phase}`);
    if (payload?.timestamp) lines.push(`Timestamp: ${payload.timestamp}`);
    if (payload?.detail) lines.push(`Detail: ${payload.detail}`);
    const stackLine = String(payload?.stack || '').split('\n')[0] || '';
    if (stackLine) lines.push(`Stack: ${stackLine}`);
    return lines.join('\n');
  };
  const renderEarlyBootFallback = (payload) => {
    if (!doc) return false;
    const text = buildEarlyFallbackText(payload);
    const host = doc.body || doc.documentElement;
    if (!host) {
      pendingEarlyFallbackText = text;
      return false;
    }
    let el = getEarlyBootFallbackEl();
    if (!el) {
      el = doc.createElement('pre');
      el.id = EARLY_BOOT_ERROR_FALLBACK_ID;
      applyEarlyFallbackStyle(el);
      host.appendChild(el);
    }
    el.textContent = text;
    el.hidden = false;
    pendingEarlyFallbackText = '';
    return true;
  };
  const flushEarlyBootFallbackIfPending = () => {
    if (!pendingEarlyFallbackText || !doc) return;
    const host = doc.body || doc.documentElement;
    if (!host) return;
    let el = getEarlyBootFallbackEl();
    if (!el) {
      el = doc.createElement('pre');
      el.id = EARLY_BOOT_ERROR_FALLBACK_ID;
      applyEarlyFallbackStyle(el);
      host.appendChild(el);
    }
    el.textContent = pendingEarlyFallbackText;
    el.hidden = false;
    pendingEarlyFallbackText = '';
  };
  const collectFallbackLines = (reason = '') => {
    const lines = [];
    lines.push(`Message: ${bootErrorState.message || 'Boot fehlgeschlagen.'}`);
    if (bootErrorState.phase) {
      lines.push(`Phase: ${bootErrorState.phase}`);
    }
    if (bootErrorState.timestamp) {
      lines.push(`Timestamp: ${bootErrorState.timestamp}`);
    }
    if (bootErrorState.detail) {
      lines.push(`Detail: ${bootErrorState.detail}`);
    }
    if (reason) {
      lines.push(`Reason: ${reason}`);
    }
    if (bootErrorState.stack) {
      const stackLine = String(bootErrorState.stack).split('\n')[0] || '';
      if (stackLine) lines.push(`Stack: ${stackLine}`);
    }
    const diagPanel = getDiagPanel();
    const diagLines = Array.isArray(diagPanel?.lines) ? diagPanel.lines : [];
    if (diagLines.length) {
      lines.push('');
      lines.push('Touch-Log (latest):');
      diagLines.slice(0, 10).forEach((entry) => {
        const render = typeof entry?.render === 'string' ? entry.render : String(entry ?? '');
        if (render) lines.push(render);
      });
    }
    return lines;
  };
  const renderBootErrorFallbackLog = (reason = '') => {
    const panel = getBootErrorPanel();
    if (!panel || !doc) return false;
    let logEl = getBootErrorFallbackLogEl();
    if (!logEl) {
      logEl = doc.createElement('pre');
      logEl.id = 'bootErrorFallbackLog';
      logEl.className = 'boot-error-fallback-log';
      panel.appendChild(logEl);
    }
    const lines = collectFallbackLines(reason);
    logEl.textContent = lines.join('\n');
    logEl.hidden = false;
    const detailEl = getBootErrorDetailEl();
    if (detailEl) {
      detailEl.textContent = 'Fallback-Log aktiv (Touch-Log nicht verfuegbar).';
    }
    diag.add?.('[boot] fallback log rendered');
    return true;
  };
  const tryOpenDiagPanel = () => {
    try {
      const diagPanel = getDiagPanel();
      diagPanel?.show?.();
      const visible =
        !!diagPanel?.el &&
        (diagPanel.el.style.display === 'block' || !diagPanel.el.hidden);
      if (visible) {
        hideBootErrorFallbackLog();
        return true;
      }
    } catch (_) {
      /* noop */
    }
    return false;
  };
  let bootErrorDiagBound = false;
  const ensureBootErrorDiagBinding = () => {
    if (bootErrorDiagBound) return;
    const btn = getBootErrorDiagBtn();
    if (!btn) return;
    bootErrorDiagBound = true;
    btn.addEventListener('click', (event) => {
      event?.preventDefault();
      if (!tryOpenDiagPanel()) {
        renderBootErrorFallbackLog('diag-open-failed');
      }
    });
  };
  const normalizeErrorText = (value, fallback = '') => {
    const text = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
    return text || fallback;
  };
  const normalizeErrorPayload = (errorInput, options = {}) => {
    const input = errorInput ?? {};
    const err = input instanceof Error ? input : null;
    const source = err
      ? { message: err.message, stack: err.stack }
      : (typeof input === 'object' ? input : { message: input });
    const message = normalizeErrorText(source.message, 'Boot fehlgeschlagen.');
    const phase = normalizeStage(options.phase || source.phase || currentStage || 'BOOT');
    const timestamp = normalizeErrorText(
      source.timestamp || options.timestamp,
      new Date().toISOString()
    );
    const stack = normalizeErrorText(source.stack, '').slice(0, 4000);
    const detail =
      normalizeErrorText(options.detail || source.detail, '') ||
      `Phase ${phase} @ ${timestamp}`;
    const signature = `${phase}|${message}|${stack.split('\n')[0] || ''}`;
    return { message, detail, phase, stack, timestamp, signature };
  };
  const applyBootErrorState = (payload) => {
    bootErrorState.message = payload.message;
    bootErrorState.detail = payload.detail;
    bootErrorState.phase = payload.phase;
    bootErrorState.stack = payload.stack;
    bootErrorState.timestamp = payload.timestamp;
    bootErrorState.signature = payload.signature;
  };
  const reportBootError = (errorInput, options = {}) => {
    const payload = normalizeErrorPayload(errorInput, options);
    if (payload.signature && payload.signature === bootErrorState.signature) {
      diag.add?.('[boot] duplicate boot error suppressed');
      if (currentStage === FALLBACK_STAGE_ERROR) {
        updateDom();
        return currentStage;
      }
    }
    applyBootErrorState(payload);
    pushBootErrorHistory(payload);
    if (!getBootErrorPanel()) {
      renderEarlyBootFallback(payload);
    }
    setConfigStatusSafe(payload.message, options.tone || 'error');
    diag.add?.(
      `[boot] error reported phase=${payload.phase} reason=${options.reason || 'manual'}`
    );
    if (currentStage === FALLBACK_STAGE_ERROR) {
      updateDom();
      return currentStage;
    }
    return commitStage(FALLBACK_STAGE_ERROR, { reason: options.reason || 'manual-fail' });
  };
  const syncBootErrorPanel = () => {
    const panel = getBootErrorPanel();
    if (!panel) return;
    hideEarlyBootFallback();
    ensureBootErrorDiagBinding();
    const isError = currentStage === FALLBACK_STAGE_ERROR;
    panel.hidden = !isError;
    panel.setAttribute('aria-hidden', isError ? 'false' : 'true');
    if (!isError) return;
    const msgEl = getBootErrorMessageEl();
    if (msgEl) {
      msgEl.textContent = bootErrorState.message || 'Boot fehlgeschlagen.';
    }
    const detailEl = getBootErrorDetailEl();
    if (detailEl) {
      detailEl.textContent =
        bootErrorState.detail || 'Weitere Details im Touch-Log sehen.';
    }
    hideBootErrorFallbackLog();
  };

  /** SUBMODULE: Config-Status Buffer **/
  const pendingConfigStatus = [];
  const setConfigStatusSafe = (msg, tone = 'info') => {
    const supa = global.AppModules?.supabase;
    if (supa?.setConfigStatus) {
      try {
        supa.setConfigStatus(msg, tone);
      } catch (_) {
        /* ignore */
      }
      return;
    }
    pendingConfigStatus.push([msg, tone]);
  };
  const flushPendingConfigStatus = () => {
    if (!pendingConfigStatus.length) return;
    const supa = global.AppModules?.supabase;
    if (!supa?.setConfigStatus) return;
    while (pendingConfigStatus.length) {
      const [msg, tone] = pendingConfigStatus.shift();
      try {
        supa.setConfigStatus(msg, tone);
      } catch (_) {
        /* ignore */
      }
    }
  };
  doc?.addEventListener('supabase:ready', flushPendingConfigStatus, { once: false });

  /** SUBMODULE: Stage Normalisierung & Ordering **/
  const normalizeStage = (value) => {
    if (!value && value !== 0) return 'BOOT';
    const upper = String(value).trim().replace(/[\s-]+/g, '_').toUpperCase();
    if (STAGES.includes(upper)) return upper;
    if (upper === FALLBACK_STAGE_ERROR) return FALLBACK_STAGE_ERROR;
    return 'BOOT';
  };

  const stageOrder = (value) => {
    const upper = normalizeStage(value);
    const idx = STAGES.indexOf(upper);
    return idx === -1 ? STAGES.length : idx;
  };

  /** SUBMODULE: Waiter/Listener & DOM-Binding **/
  const waiters = new Map();
  const stageListeners = new Set();
  const getBody = () => doc?.body || doc?.documentElement;

  let currentStage = normalizeStage(doc?.body?.dataset?.bootStage || 'BOOT');
  let hangTimer = null;
  let hangOrigin = null;

  const updateDom = () => {
    const body = getBody();
    if (body) {
      body.dataset.bootStage = currentStage.toLowerCase();
      body.setAttribute('aria-busy', currentStage === 'IDLE' ? 'false' : 'true');
    }
    const labelEl = doc?.querySelector('[data-boot-stage-label]');
    if (labelEl) {
      labelEl.textContent = stageLabels[currentStage] || currentStage;
    }
    syncBootErrorPanel();
  };

  const flushWaiters = () => {
    waiters.forEach((callbacks, target) => {
      if (stageOrder(currentStage) >= stageOrder(target)) {
        callbacks.splice(0).forEach((cb) => {
          try {
            cb(currentStage);
          } catch (_) {
            /* noop */
          }
        });
        waiters.delete(target);
      }
    });
  };

  const notifyStageListeners = (nextStage, prevStage) => {
    stageListeners.forEach((listener) => {
      try {
        listener(nextStage, prevStage);
      } catch (err) {
        diag.add?.(`[boot] stage listener error: ${err?.message || err}`);
      }
    });
  };

  /** SUBMODULE: Stage Commit & Hang Timer **/
  const startHangTimer = (stage) => {
    if (hangTimer) {
      clearTimeout(hangTimer);
      hangTimer = null;
    }
    if (stage === 'IDLE' || stage === FALLBACK_STAGE_ERROR) return;
    hangOrigin = stage;
    hangTimer = setTimeout(() => {
      diag.add?.(`[boot] stage timeout @ ${hangOrigin}`);
      const timeoutMessage = 'Boot hängt, bitte neu laden.';
      reportBootError(
        {
          message: timeoutMessage,
          phase: hangOrigin,
          detail: `Phase ${hangOrigin} reagiert nicht.`
        },
        { reason: 'timeout' }
      );
    }, STAGE_HANG_TIMEOUT_MS);
  };

  const commitStage = (nextStage, options = {}) => {
    const normalized = normalizeStage(nextStage);
    if (normalized === currentStage) return currentStage;
    const prevStage = currentStage;
    const reasonStr = options.reason ? ` (${options.reason})` : '';
    currentStage = normalized;
    if (normalized === FALLBACK_STAGE_ERROR && !bootErrorState.message) {
      applyBootErrorState(
        normalizeErrorPayload('Boot fehlgeschlagen.', { phase: prevStage || 'BOOT' })
      );
    }
    diag.add?.(`[boot] stage ${prevStage} -> ${normalized}${reasonStr}`);
    updateDom();
    startHangTimer(normalized);
    flushWaiters();
    notifyStageListeners(normalized, prevStage);
    return currentStage;
  };

  /** SUBMODULE: Public API **/
  const setStage = (nextStage) => commitStage(nextStage, { isExternal: true });

  const whenStage = (targetStage, callback) => {
    const target = normalizeStage(targetStage);
    if (stageOrder(currentStage) >= stageOrder(target)) {
      try {
        callback(currentStage);
      } catch (_) {
        /* noop */
      }
      return () => {};
    }
    if (!waiters.has(target)) waiters.set(target, []);
    const list = waiters.get(target);
    list.push(callback);
    return () => {
      const idx = list.indexOf(callback);
      if (idx !== -1) list.splice(idx, 1);
    };
  };

  const onStageChange = (callback) => {
    if (typeof callback !== 'function') return () => {};
    stageListeners.add(callback);
    return () => stageListeners.delete(callback);
  };

  const bootFlowApi = {
    getStage: () => currentStage,
    getStages: () => [...STAGES],
    getStageIndex: stageOrder,
    setStage,
    whenStage,
    onStageChange,
    isStageAtLeast: (stage) => stageOrder(currentStage) >= stageOrder(stage),
    report: setConfigStatusSafe,
    getLastError: () => ({ ...bootErrorState }),
    getErrorHistory: () => bootErrorHistory.map((entry) => ({ ...entry })),
    clearErrorHistory: () => {
      bootErrorHistory = [];
      saveBootErrorHistory();
    },
    reportError: reportBootError,
    markFailed: (message = 'Boot fehlgeschlagen.', detail = '') => {
      return reportBootError(
        { message, detail, phase: currentStage },
        { reason: 'manual-fail' }
      );
    }
  };

  global.AppModules = global.AppModules || {};
  global.AppModules.bootFlow = bootFlowApi;

  /** SUBMODULE: Init **/
  const initialize = () => {
    bootErrorHistory = loadBootErrorHistory();
    updateDom();
    startHangTimer(currentStage);
    if (doc?.readyState === 'loading') {
      doc.addEventListener(
        'DOMContentLoaded',
        () => {
          flushEarlyBootFallbackIfPending();
          updateDom();
          flushPendingConfigStatus();
        },
        { once: true }
      );
    } else {
      flushPendingConfigStatus();
    }
  };

  initialize();
})(typeof window !== 'undefined' ? window : globalThis);
