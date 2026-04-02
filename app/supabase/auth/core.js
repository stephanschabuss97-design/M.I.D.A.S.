'use strict';
/**
 * MODULE: supabase/auth/core.js
 * Description: Steuert Authentifizierungszustand, Session-Prüfung, Hooks und Grace-Period-Handling für Supabase-Login.
 * Submodules:
 *  - imports (Core-State & Client-Helfer)
 *  - globals (Diagnose & Window)
 *  - constants (Auth-Timing & Defaults)
 *  - fallbackUserId (UserID-Fallback bei Fehlern)
 *  - authHooks (Hook-Verwaltung)
 *  - Hook-Call-Handler (sichere Hook-Ausführung)
 *  - authGrace (Grace-Period-Logik)
 *  - requireSession (Session-Prüfung)
 *  - isLoggedInFast (schnelle Login-Erkennung)
 *  - watchAuthState (Realtime-Listener)
 *  - afterLoginBoot (Post-Login-Initialisierung)
 *  - getUserId (User-ID mit Timeout & Fallback)
 *  - initAuth (Hook-Registrierung)
 *  - resetAuthHooks (Hook-Reset)
 */

// SUBMODULE: imports @internal - Supabase Core-State & Client-Helfer
import { supabaseState } from '../core/state.js';
import { ensureSupabaseClient, maskUid } from '../core/client.js';

// SUBMODULE: globals @internal - Diagnose- und Window-Hilfen
const globalWindow = typeof window !== 'undefined' ? window : undefined;
const diag =
  (globalWindow?.diag ||
    globalWindow?.AppModules?.diag ||
    globalWindow?.AppModules?.diagnostics ||
    { add() {} });
const getSupabaseApi = () => globalWindow?.AppModules?.supabase || null;
const getBootFlow = () => globalWindow?.AppModules?.bootFlow || null;
const reportBootStatus = (msg, tone = 'info') => {
  try {
    getBootFlow()?.report?.(msg, tone);
  } catch (_) {
    /* noop */
  }
};
const inflightDiagLogs = new Map();
const userIdLogSeenSuccess = new Set();
const userIdLogSuppressed = new Set();
const resetUserIdLogCache = () => {
  userIdLogSeenSuccess.clear();
  userIdLogSuppressed.clear();
};
if (globalWindow?.addEventListener) {
  globalWindow.addEventListener('pageshow', resetUserIdLogCache);
  globalWindow.addEventListener('midas:log-reset', resetUserIdLogCache);
}
if (globalWindow?.document?.addEventListener) {
  globalWindow.document.addEventListener('visibilitychange', () => {
    if (globalWindow.document.visibilityState === 'visible') {
      resetUserIdLogCache();
    }
  });
}
const logDiagStart = (key, message) => {
  if (key === 'auth:getUserId' && userIdLogSeenSuccess.has(key)) {
    userIdLogSuppressed.add(key);
    return;
  }
  if (key === 'auth:getUserId') {
    userIdLogSuppressed.delete(key);
  }
  const entry = inflightDiagLogs.get(key);
  if (entry) {
    entry.dupes += 1;
    return;
  }
  inflightDiagLogs.set(key, { dupes: 0 });
  diag.add?.(message);
};
const logDiagEnd = (key, message, { success = false } = {}) => {
  if (key === 'auth:getUserId' && userIdLogSuppressed.has(key)) {
    userIdLogSuppressed.delete(key);
    if (success) userIdLogSeenSuccess.add(key);
    return;
  }
  const entry = inflightDiagLogs.get(key);
  if (!entry) {
    diag.add?.(message);
    if (success && key === 'auth:getUserId') {
      userIdLogSeenSuccess.add(key);
    }
    return;
  }
  inflightDiagLogs.delete(key);
  const suffix = entry.dupes ? ` (+${entry.dupes})` : '';
  diag.add?.(`${message}${suffix}`);
  if (success && key === 'auth:getUserId') {
    userIdLogSeenSuccess.add(key);
  }
};

    // SUBMODULE: constants @internal - Authentifizierungs-Timing & Defaults
const AUTH_GRACE_MS = 400;
const GET_USER_TIMEOUT_MS = globalWindow?.GET_USER_TIMEOUT_MS ?? 2000;

const defaultSetupRealtime = async () => undefined;
const defaultResumeFromBackground = async () => undefined;
const noopRealtime = () => undefined;
const isIndexedDbPendingError = (err) =>
  /IndexedDB not initialized/i.test(String(err?.message || err || ''));

// SUBMODULE: fallbackUserId @internal - Rückfall bei Fehlern/Timeouts
const fallbackUserId = (variant) => {
  if (
    (supabaseState.authState === 'auth' || supabaseState.authState === 'unknown') &&
    supabaseState.lastUserId
  ) {
    const labelMap = {
      noClient: 'fallback (no client)',
      timeout: 'fallback (timeout)',
      noUid: 'fallback (no uid)',
      error: 'fallback (error)'
    };
    const label = labelMap[variant] || 'fallback';
    diag.add?.(`[auth] getUserId ${label} ${maskUid(supabaseState.lastUserId)}`);
    return supabaseState.lastUserId;
  }
  return null;
};

// SUBMODULE: authHooks @internal - Hook-Verwaltung für UI/Status
const authHooks = {
  onStatus: null,
  onLoginOverlay: null,
  onUserUi: null,
  onDoctorAccess: null
};

// SUBMODULE: Hook-Call-Handler @internal - sichere Ausführung aller Hook-Typen
const callStatus = (state) => {
  if (typeof authHooks.onStatus === 'function') {
    try {
      authHooks.onStatus(state);
    } catch (err) {
      diag.add?.('[auth] status hook error: ' + (err?.message || err));
    }
  }
};

const callLoginOverlay = (visible) => {
  if (typeof authHooks.onLoginOverlay === 'function') {
    try {
      authHooks.onLoginOverlay(!!visible);
      return;
    } catch (err) {
      diag.add?.('[auth] overlay hook error: ' + (err?.message || err));
    }
  }
  const supa = getSupabaseApi();
  try {
    supa?.showLoginOverlay?.(!!visible);
  } catch (_) {}
};

const callUserUi = (email) => {
  if (typeof authHooks.onUserUi === 'function') {
    try {
      authHooks.onUserUi(email);
      return;
    } catch (err) {
      diag.add?.('[auth] user hook error: ' + (err?.message || err));
    }
  }
  const supa = getSupabaseApi();
  try {
    supa?.setUserUi?.(email);
  } catch (_) {}
};

const callDoctorAccess = (enabled) => {
  if (typeof authHooks.onDoctorAccess === 'function') {
    try {
      authHooks.onDoctorAccess(!!enabled);
      return;
    } catch (err) {
      diag.add?.('[auth] doctor hook error: ' + (err?.message || err));
    }
  }
  const supa = getSupabaseApi();
  try {
    supa?.setDoctorAccess?.(!!enabled);
  } catch (_) {}
};

const callAuthGuard = (enabled) => {
  if (typeof globalWindow?.setAuthGuard === 'function') {
    try {
      globalWindow.setAuthGuard(!!enabled);
    } catch (_) {}
  }
};

const normalizeAuthState = (value) => {
  if (value === 'auth' || value === 'unauth') return value;
  return 'unknown';
};

const authStateWaiters = [];
const removeAuthStateWaiter = (waiter) => {
  const idx = authStateWaiters.indexOf(waiter);
  if (idx !== -1) {
    authStateWaiters.splice(idx, 1);
  }
};
const resolveAuthStateWaiters = (state) => {
  if (state === 'unknown') return;
  while (authStateWaiters.length) {
    const waiter = authStateWaiters.shift();
    try {
      waiter.cleanup?.();
    } catch (_) {}
    try {
      waiter.resolve(state);
    } catch (_) {}
  }
};

const updateBootStatusForState = (state) => {
  const decisionMeta = supabaseState.authDecisionMeta;
  if (state === 'auth') {
    reportBootStatus('');
    return;
  }
  if (state === 'unauth') {
    reportBootStatus(
      decisionMeta?.bootMessage || 'Nicht angemeldet',
      decisionMeta?.tone || 'error'
    );
    return;
  }
  reportBootStatus(decisionMeta?.bootMessage || 'Pr\u00fcfe Session ...', decisionMeta?.tone || 'info');
};

const updateBootLockForState = (state) => {
  const bootFlow = getBootFlow();
  if (!bootFlow) return;
  if (state === 'unknown') {
    bootFlow.lockReason = 'auth-check';
    return;
  }
  if (bootFlow.lockReason === 'auth-check') {
    delete bootFlow.lockReason;
  }
};

const applyAuthUi = (state) => {
  const normalized = normalizeAuthState(state);
  const isLoggedIn = normalized === 'auth';
  const body = globalWindow?.document?.body;
  if (body) {
    body.classList.toggle('auth-unknown', normalized === 'unknown');
  }
  callAuthGuard(isLoggedIn);
  callDoctorAccess(isLoggedIn);
  if (normalized === 'auth') {
    callLoginOverlay(false);
    return;
  }
  if (normalized === 'unauth') {
    callLoginOverlay(true);
  } else {
    callLoginOverlay(false);
  }
};

const setAuthDecisionMeta = (meta) => {
  supabaseState.authDecisionMeta = meta && typeof meta === 'object' ? { ...meta } : null;
};

const clearAuthDecisionMeta = () => {
  supabaseState.authDecisionMeta = null;
};

const setAuthState = (nextState, { force = false } = {}) => {
  const normalized = normalizeAuthState(nextState);
  if (!force && supabaseState.authState === normalized) {
    return normalized;
  }
  if (normalized === 'auth') {
    clearAuthDecisionMeta();
  } else if (!supabaseState.authDecisionMeta && normalized === 'unknown') {
    setAuthDecisionMeta({ source: 'auth-core', status: 'auth-check', bootMessage: 'Pr\u00fcfe Session ...', tone: 'info' });
  }
  supabaseState.authState = normalized;
  if (normalized === 'auth') {
    supabaseState.lastLoggedIn = true;
  } else if (normalized === 'unauth') {
    supabaseState.lastLoggedIn = false;
  }
  updateBootLockForState(normalized);
  updateBootStatusForState(normalized);
  applyAuthUi(normalized);
  callStatus(normalized);
  resolveAuthStateWaiters(normalized);
  return normalized;
};

export const isAuthDecisionKnown = () => supabaseState.authState !== 'unknown';

export const waitForAuthDecision = ({ signal } = {}) => {
  const current = normalizeAuthState(supabaseState.authState);
  if (current !== 'unknown') {
    return Promise.resolve(current);
  }
  return new Promise((resolve, reject) => {
    const waiter = {
      resolve(state) {
        resolve(state);
      },
      cleanup: null
    };
    if (signal) {
      const abortHandler = () => {
        signal.removeEventListener('abort', abortHandler);
        removeAuthStateWaiter(waiter);
        reject(signal.reason || new DOMException('Aborted', 'AbortError'));
      };
      signal.addEventListener('abort', abortHandler, { once: true });
      waiter.cleanup = () => signal.removeEventListener('abort', abortHandler);
    }
    authStateWaiters.push(waiter);
  });
};

// SUBMODULE: authGrace @internal - Grace-Period-Handling und Finalisierung
const clearAuthGrace = () => {
  if (supabaseState.authGraceTimer) {
    clearTimeout(supabaseState.authGraceTimer);
    supabaseState.authGraceTimer = null;
  }
};

const clearCachedAuthIdentity = () => {
  callUserUi('');
  supabaseState.lastLoggedIn = false;
  if (supabaseState.lastUserId) {
    diag.add?.('[auth] session cleared');
    supabaseState.lastUserId = null;
  }
};

const createPendingSignOutCleanup = () => async () => {
  (globalWindow?.teardownRealtime || noopRealtime)();
  try {
    await globalWindow?.AppModules?.capture?.refreshCaptureIntake?.('auth:logout');
  } catch (_) {}
  try {
    await globalWindow?.refreshAppointments?.();
  } catch (_) {}
};

const stageSignedOutState = () => {
  clearCachedAuthIdentity();
  supabaseState.pendingSignOut = createPendingSignOutCleanup();
};

export const finalizeAuthState = (logged) => {
  clearAuthGrace();
  const nextState = logged ? 'auth' : 'unauth';
  if (logged) {
    supabaseState.pendingSignOut = null;
  } else if (typeof supabaseState.pendingSignOut === 'function') {
    Promise.resolve(supabaseState.pendingSignOut())
      .catch(() => {})
      .finally(() => {
        supabaseState.pendingSignOut = null;
      });
  }
  setAuthState(nextState, { force: true });
};

export const scheduleAuthGrace = () => {
  clearAuthGrace();
  setAuthState('unknown', { force: true });
  supabaseState.authGraceTimer = setTimeout(async () => {
    try {
      if (!supabaseState.sbClient) {
        finalizeAuthState(false);
        return;
      }
      diag.add?.('[capture] guard: request session');
      const { data } = await supabaseState.sbClient.auth.getSession();
      diag.add?.('[capture] guard: session resp');
      finalizeAuthState(!!data?.session);
    } catch (_) {
      finalizeAuthState(false);
    }
  }, AUTH_GRACE_MS);
};

// SUBMODULE: requireSession @public - prüft aktuelle Session und aktualisiert UI
const getAndroidBootstrapState = () => {
  const state = globalWindow?.__midasAndroidAuthBootstrapState;
  return state && typeof state === 'object' ? state : null;
};

const isAndroidNativeAuthOwnerContext = () => !!globalWindow?.__midasAndroidNativeAuthOwner;

const refreshAndroidBootstrapState = async () => {
  const fn = globalWindow?.__midasAndroidRefreshBootstrapState;
  if (typeof fn !== 'function') {
    return getAndroidBootstrapState();
  }
  try {
    const state = await fn();
    return state && typeof state === 'object' ? state : null;
  } catch (error) {
    diag.add?.('[auth] android bootstrap refresh failed: ' + (error?.message || error));
    return getAndroidBootstrapState();
  }
};

const markAndroidBootstrapSessionAbsent = () => {
  if (!globalWindow) return null;
  const current = getAndroidBootstrapState() || {};
  const nextState = {
    ...current,
    status: 'session-absent',
    accessToken: '',
    refreshToken: '',
    userId: '',
    applied: false,
    clearedAt: new Date().toISOString()
  };
  globalWindow.__midasAndroidAuthBootstrapState = nextState;
  return nextState;
};

const buildAndroidBootstrapDecision = (status) => {
  switch (status) {
    case 'invalid-config':
    case 'empty':
      return {
        authState: 'unauth',
        tone: 'error',
        bootMessage: 'Android-Konfiguration fehlt oder ist ungueltig.',
        reason: 'android-bootstrap-config'
      };
    case 'session-absent':
      return {
        authState: 'unauth',
        tone: 'error',
        bootMessage: 'Nicht angemeldet',
        reason: 'android-bootstrap-unauth'
      };
    case 'session-staged':
      return {
        authState: 'unknown',
        tone: 'info',
        bootMessage: 'Uebernehme native Session ...',
        reason: 'android-bootstrap-staged'
      };
    case 'session-imported':
      return {
        authState: 'unknown',
        tone: 'info',
        bootMessage: 'Pruefe native Session ...',
        reason: 'android-bootstrap-imported'
      };
    case 'session-import-error':
    case 'session-staging-invalid':
    case 'client-missing':
    case 'timeout':
    case 'error':
      return {
        authState: 'unauth',
        tone: 'error',
        bootMessage: 'Android-Session konnte nicht uebernommen werden.',
        reason: 'android-bootstrap-error'
      };
    case 'bridge-missing':
    case 'missing':
    default:
      return null;
  }
};

const applyAndroidBootstrapDecision = (status) => {
  const decision = buildAndroidBootstrapDecision(status);
  if (!decision) return null;
  setAuthDecisionMeta({
    source: 'android-bootstrap',
    status,
    bootMessage: decision.bootMessage,
    tone: decision.tone,
    reason: decision.reason
  });
  setAuthState(decision.authState, { force: true });
  return decision;
};

const waitForAndroidBootstrapState = async ({ timeoutMs = 2500 } = {}) => {
  const promise = globalWindow?.__midasAndroidAuthBootstrapPromise;
  if (!promise || typeof promise.then !== 'function') {
    return { status: 'missing' };
  }

  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(
      () => resolve({ status: 'timeout' }),
      Math.max(0, Number(timeoutMs) || 0)
    );
  });

  try {
    const result = await Promise.race([Promise.resolve(promise), timeoutPromise]);
    if (result && typeof result === 'object') {
      return result;
    }
    return { status: String(result?.status || result || 'resolved') };
  } catch (error) {
    diag.add?.('[auth] android bootstrap wait failed: ' + (error?.message || error));
    return {
      status: 'error',
      message: String(error?.message || error || 'android-bootstrap-wait-failed')
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export async function applyAndroidBootstrapSession() {
  const bootstrapState = (await refreshAndroidBootstrapState()) || getAndroidBootstrapState();
  if (!bootstrapState) return 'missing';
  const sessionGeneration = Number(bootstrapState.sessionGeneration || 0) || 0;
  if (
    bootstrapState.applied &&
    sessionGeneration > 0 &&
    Number(bootstrapState.appliedGeneration || 0) === sessionGeneration
  ) {
    return bootstrapState.status || 'already-applied';
  }
  if (bootstrapState.applied) return bootstrapState.status || 'already-applied';
  if (bootstrapState.status !== 'session-staged') {
    return bootstrapState.status || 'noop';
  }
  if (!supabaseState.sbClient?.auth?.setSession) {
    return 'client-missing';
  }
  const accessToken = String(bootstrapState.accessToken || '').trim();
  const refreshToken = String(bootstrapState.refreshToken || '').trim();
  if (!accessToken || !refreshToken) {
    bootstrapState.status = 'session-staging-invalid';
    return bootstrapState.status;
  }

  const { error } = await supabaseState.sbClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  if (error) {
    bootstrapState.status = 'session-import-error';
    bootstrapState.message = String(error?.message || error || 'android-session-import-failed');
    throw error;
  }

  bootstrapState.applied = true;
  bootstrapState.status = 'session-imported';
  bootstrapState.appliedAt = new Date().toISOString();
  bootstrapState.appliedGeneration = sessionGeneration;
  setAuthDecisionMeta({
    source: 'android-bootstrap',
    status: 'session-imported',
    bootMessage: 'Pruefe native Session ...',
    tone: 'info',
    reason: 'android-bootstrap-imported'
  });
  diag.add?.('[auth] android bootstrap session imported');
  return bootstrapState.status;
}

export async function prepareAndroidBootstrapAuthCheck({ timeoutMs = 2500 } = {}) {
  const bootstrapState = await waitForAndroidBootstrapState({ timeoutMs });
  const bootstrapStatus = bootstrapState?.status || 'missing';

  if (!isAndroidNativeAuthOwnerContext()) {
    return {
      status: bootstrapStatus,
      bootstrapStatus,
      action: 'browser-auth-owner'
    };
  }

  applyAndroidBootstrapDecision(bootstrapStatus);

  if (bootstrapStatus === 'session-staged') {
    const importStatus = await applyAndroidBootstrapSession();
    applyAndroidBootstrapDecision(importStatus);
    return {
      status: importStatus,
      bootstrapStatus,
      action: 'session-imported'
    };
  }

  return {
    status: bootstrapStatus,
    bootstrapStatus,
    action: 'bootstrap-observed'
  };
}

export async function handleAndroidNativeSessionCleared({ reload = true } = {}) {
  if (!isAndroidNativeAuthOwnerContext()) {
    return false;
  }

  clearAuthGrace();
  markAndroidBootstrapSessionAbsent();
  applyAndroidBootstrapDecision('session-absent');
  try {
    await refreshAndroidBootstrapState();
  } catch (_) {}

  stageSignedOutState();

  try {
    if (supabaseState.sbClient?.auth?.signOut) {
      await supabaseState.sbClient.auth.signOut();
    }
  } catch (error) {
    diag.add?.('[auth] android native clear signOut failed: ' + (error?.message || error));
  } finally {
    finalizeAuthState(false);
  }

  if (reload && globalWindow?.location?.reload) {
    globalWindow.location.reload();
  }
  return true;
}

export async function requireSession() {
  if (!supabaseState.sbClient) {
    reportBootStatus('Supabase Client fehlt', 'error');
    getBootFlow()?.markFailed?.('Supabase Client fehlt');
    callUserUi('');
    setAuthState('unauth', { force: true });
    return false;
  }
  try {
    if (isAndroidNativeAuthOwnerContext()) {
      const bootstrapState = (await refreshAndroidBootstrapState()) || getAndroidBootstrapState();
      const bootstrapStatus = bootstrapState?.status || 'missing';
      applyAndroidBootstrapDecision(bootstrapStatus);
      if (
        bootstrapStatus === 'session-absent' ||
        bootstrapStatus === 'invalid-config' ||
        bootstrapStatus === 'empty'
      ) {
        callUserUi('');
        setAuthState('unauth', { force: true });
        return false;
      }
      if (bootstrapStatus === 'session-staged') {
        await applyAndroidBootstrapSession();
      }
    }

    const { data: { session } = {} } = await supabaseState.sbClient.auth.getSession();
    const logged = !!session;
    callUserUi(session?.user?.email || '');
    if (logged) {
      clearAuthGrace();
    } else if (!supabaseState.authGraceTimer) {
      setAuthState('unauth');
    }
    if (logged) {
      setAuthState('auth');
    }
    return logged;
  } catch (_) {
    setAuthState('unknown');
    return false;
  }
}

// SUBMODULE: isLoggedInFast @public - schnelle Login-Prüfung mit Timeout
export async function isLoggedInFast({ timeout = 400 } = {}) {
  if (!supabaseState.sbClient) return supabaseState.lastLoggedIn;
  let timer = null;
  try {
    const sessionPromise = supabaseState.sbClient.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('session-timeout')), timeout);
    });
    const { data } = await Promise.race([sessionPromise, timeoutPromise]);
    if (timer) clearTimeout(timer);
    const logged = !!data?.session;
    if (supabaseState.authState === 'unknown' && !logged && supabaseState.lastLoggedIn) {
      return supabaseState.lastLoggedIn;
    }
    if (supabaseState.authState !== 'unknown') {
      setAuthState(logged ? 'auth' : 'unauth');
    } else {
      supabaseState.lastLoggedIn = logged;
    }
    return logged;
  } catch (_) {
    if (timer) clearTimeout(timer);
    return supabaseState.lastLoggedIn;
  }
}

// SUBMODULE: watchAuthState @public - registriert Realtime-Auth-State-Listener
export function watchAuthState() {
  if (!supabaseState.sbClient) return;
  if (!supabaseState.sbClient.auth?.onAuthStateChange) return;
  const { data: { subscription } = {} } =
    supabaseState.sbClient.auth.onAuthStateChange(async (event, session) => {
      const logged = !!session;
      if (logged) {
        callUserUi(session?.user?.email || '');
        const newUid = session?.user?.id || null;
        if (newUid) {
        supabaseState.lastUserId = newUid;
        diag.add?.(`[auth] session uid=${maskUid(newUid)}`);
      }
      finalizeAuthState(true);
      await afterLoginBoot();
      await (globalWindow?.setupRealtime || defaultSetupRealtime)();
      globalWindow?.requestUiRefresh?.().catch((err) =>
        diag.add?.('ui refresh err: ' + (err?.message || err))
      );
      try { await globalWindow?.AppModules?.capture?.refreshCaptureIntake?.('auth:login'); } catch (_) {}
      try { await globalWindow?.refreshAppointments?.(); } catch (_) {}
      return;
    }

    if (isAndroidNativeAuthOwnerContext()) {
      const bootstrapState = (await refreshAndroidBootstrapState()) || getAndroidBootstrapState();
      const bootstrapStatus = bootstrapState?.status || 'missing';
      if (bootstrapStatus === 'session-staged') {
        diag.add?.('[auth] webview signed out while native session still staged; reimport session');
        try {
          await applyAndroidBootstrapSession();
        } catch (_) {}
        scheduleAuthGrace();
        return;
      }
    }

    stageSignedOutState();

    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      finalizeAuthState(false);
    } else {
      scheduleAuthGrace();
    }
  });
  return subscription || null;
}

// SUBMODULE: afterLoginBoot @public - führt Initialisierung nach Login aus
export async function afterLoginBoot() {
  if (supabaseState.booted) return;
  supabaseState.booted = true;
  getBootFlow()?.setStage?.('INIT_CORE');
  globalWindow
    ?.requestUiRefresh?.({ reason: 'boot:afterLogin' })
    .catch((err) => diag.add?.('ui refresh err: ' + (err?.message || err)));
}

// SUBMODULE: getUserId @public - ermittelt aktuelle User-ID mit Timeout & Fallbacks
export async function getUserId() {
  const LOG_KEY = 'auth:getUserId';
  try {
    logDiagStart(LOG_KEY, '[auth] getUserId start');
    const bootStage = getBootFlow()?.getStage?.();
    const preInitCoreStage =
      !bootStage || bootStage === 'BOOT' || bootStage === 'AUTH_CHECK';
    if (!supabaseState.sbClient && preInitCoreStage) {
      // S4.1: avoid IndexedDB-backed client bootstrap before initDB/INIT_CORE.
      logDiagEnd(LOG_KEY, '[auth] getUserId done null (boot-pending)');
      return null;
    }
    const supa = await ensureSupabaseClient();
    if (!supa) {
      const fallback = fallbackUserId('noClient');
      if (fallback) {
        logDiagEnd(LOG_KEY, '[auth] getUserId done (fallback)', { success: true });
        return fallback;
      }
      logDiagEnd(LOG_KEY, '[auth] getUserId done null');
      return null;
    }
    let timeoutId;
    let timedOut = false;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        timedOut = true;
        reject(new Error('getUser-timeout'));
      }, GET_USER_TIMEOUT_MS);
    });
    let userInfo = null;
    try {
      const result = await Promise.race([supa.auth.getUser(), timeoutPromise]);
      userInfo = result?.data?.user ?? null;
    } catch (err) {
      if (timedOut) {
        diag.add?.('[auth] getUserId timeout');
        const fallback = fallbackUserId('timeout');
        if (fallback) {
          logDiagEnd(LOG_KEY, '[auth] getUserId done (fallback)', { success: true });
          return fallback;
        }
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
    const uid = userInfo?.id ?? null;
    if (uid) {
      supabaseState.lastUserId = uid;
      logDiagEnd(LOG_KEY, `[auth] getUserId done ${maskUid(uid)}`, { success: true });
      return uid;
    }
    const fallbackNoUid = fallbackUserId('noUid');
    if (fallbackNoUid) {
      logDiagEnd(LOG_KEY, '[auth] getUserId done (fallback)', { success: true });
      return fallbackNoUid;
    }
    logDiagEnd(LOG_KEY, '[auth] getUserId done null');
    return null;
  } catch (e) {
    if (isIndexedDbPendingError(e)) {
      logDiagEnd(LOG_KEY, '[auth] getUserId done null (db-init-pending)');
      return null;
    }
    diag.add?.('[auth] getUserId error: ' + (e?.message || e));
    const fallbackError = fallbackUserId('error');
    if (fallbackError) {
      logDiagEnd(LOG_KEY, '[auth] getUserId done (fallback)', { success: true });
      return fallbackError;
    }
    logDiagEnd(LOG_KEY, '[auth] getUserId done null');
    return null;
  }
}

// SUBMODULE: initAuth @public - setzt optionale Hook-Handler für UI & Status
export function initAuth(hooks = {}) {
  authHooks.onStatus =
    typeof hooks.onStatus === 'function' ? hooks.onStatus : authHooks.onStatus;
  authHooks.onLoginOverlay =
    typeof hooks.onLoginOverlay === 'function' ? hooks.onLoginOverlay : authHooks.onLoginOverlay;
  authHooks.onUserUi =
    typeof hooks.onUserUi === 'function' ? hooks.onUserUi : authHooks.onUserUi;
  authHooks.onDoctorAccess =
    typeof hooks.onDoctorAccess === 'function'
      ? hooks.onDoctorAccess
      : authHooks.onDoctorAccess;
  if (typeof hooks.onLoginOverlay === 'function') {
    try {
      hooks.onLoginOverlay(false);
    } catch (_) {}
  }
}

// SUBMODULE: resetAuthHooks @public - entfernt alle gesetzten Hook-Handler
export function resetAuthHooks() {
  authHooks.onStatus = null;
  authHooks.onLoginOverlay = null;
  authHooks.onUserUi = null;
  authHooks.onDoctorAccess = null;
}
