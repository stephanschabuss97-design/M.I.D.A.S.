'use strict';
/**
 * MODULE: supabase/core/http.js
 * Description: Führt zentrale Fetch- und Authentifizierungslogik für Supabase-REST-Aufrufe mit Retry, Header-Cache und Timeout durch.
 * Submodules:
 *  - imports (Client & State Utilities)
 *  - globals (Diagnostics / Window Binding)
 *  - util (Sleep-Helfer)
 *  - withRetry (generischer Retry-Mechanismus mit Exponential Backoff)
 *  - fetchWithAuth (authentifiziertes Fetch mit Header-Caching, Auto-Refresh & Timeout)
 * Notes:
 *  - Verwendet Diagnose-Logging über window.diag.
 *  - Unterstützt automatisches Session-Refresh bei 401/403.
 *  - Enthält Kurzzeit-Timeout für hängende Requests (10s).
 *  - Version: 1.8.2 (System Integration Layer, M.I.D.A.S.)
 */

// SUBMODULE: imports @internal - Supabase Client und Header-Cache-Funktionen
import { ensureSupabaseClient, readSupabaseConfiguration } from './client.js?v=34';
import { isUsableSession } from './public-key.js?v=34';
import { supabaseState, cacheHeaders, clearHeaderCache } from './state.js?v=34';

// SUBMODULE: globals @internal - Diagnostik-Objekt und globale Handles
const globalWindow = typeof window !== 'undefined' ? window : undefined;
const diag =
  (globalWindow?.diag ||
    globalWindow?.AppModules?.diag ||
    globalWindow?.AppModules?.diagnostics ||
    { add() {} });
const requestLogSummaries = new Map();
const getRequestSummary = (label) => {
  let summary = requestLogSummaries.get(label);
  if (!summary) {
    summary = {
      active: 0,
      startLogged: false,
      successCount: 0,
      successDuration: 0,
      flushTimer: null
    };
    requestLogSummaries.set(label, summary);
  }
  return summary;
};
const cleanupRequestSummary = (label, summary) => {
  if (!summary) return;
  if (summary.active === 0 && !summary.successCount && !summary.flushTimer) {
    summary.startLogged = false;
    requestLogSummaries.delete(label);
  }
};
const logRequestStart = (label) => {
  const summary = getRequestSummary(label);
  summary.active += 1;
  if (!summary.startLogged) {
    diag.add?.(`[auth] request start ${label}`);
    summary.startLogged = true;
  }
};
const flushSuccessSummary = (label, summary) => {
  if (!summary || !summary.successCount) return;
  const avg = Math.round(summary.successDuration / summary.successCount);
  diag.add?.(
    `[auth] request end ${label} status=200 avg=${avg} ms (x${summary.successCount})`
  );
  summary.successCount = 0;
  summary.successDuration = 0;
};
const scheduleSuccessFlush = (label, summary) => {
  if (summary.flushTimer) return;
  summary.flushTimer = setTimeout(() => {
    summary.flushTimer = null;
    if (!summary.successCount) {
      cleanupRequestSummary(label, summary);
      return;
    }
    flushSuccessSummary(label, summary);
    cleanupRequestSummary(label, summary);
  }, 25);
};
const logRequestSuccess = (label, durationMs) => {
  const summary = getRequestSummary(label);
  summary.active = Math.max(0, summary.active - 1);
  summary.successCount += 1;
  summary.successDuration += durationMs;
  scheduleSuccessFlush(label, summary);
};
const logRequestFailure = (label, status, durationMs, detail) => {
  const summary = getRequestSummary(label);
  summary.active = Math.max(0, summary.active - 1);
  if (summary.flushTimer) {
    clearTimeout(summary.flushTimer);
    summary.flushTimer = null;
  }
  flushSuccessSummary(label, summary);
  const suffix = detail ? ` – ${detail}` : '';
  diag.add?.(`[auth] request end ${label} status=${status} (${durationMs} ms)${suffix}`);
  cleanupRequestSummary(label, summary);
};

// SUBMODULE: util @internal - Sleep-Helper für Backoff-Zeiten
const sleep = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
const AUTH_REFRESH_TIMEOUT_MS = 10000;

// SUBMODULE: withRetry @public - generischer Wiederholungsmechanismus mit Exponential Backoff
export async function withRetry(fn, { tries = 3, base = 300 } = {}) {
  let attempts = Number.isFinite(tries) ? Math.floor(tries) : 0;
  if (attempts <= 0) attempts = 1;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      const code = e?.status ?? e?.response?.status ?? 0;
      if (!(code >= 500 && code < 600)) throw e;
      await sleep(base * Math.pow(2, i));
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('withRetry: all attempts failed');
}

const headerContexts = new WeakMap();
const boundedAuth = async (operation, timeoutMs) => {
  let timer;
  try { return await Promise.race([operation(), new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('auth-session-timeout')), timeoutMs);
  })]); } finally { clearTimeout(timer); }
};

export async function getSessionHeaders({ forceRefresh = false, expectedBase = null, timeoutMs = AUTH_REFRESH_TIMEOUT_MS } = {}) {
  try {
    const client = await ensureSupabaseClient();
    if (!client) return null;
    const generation = supabaseState.clientGeneration;
    if (forceRefresh) {
      clearHeaderCache();
      const refreshed = await boundedAuth(() => client.auth.refreshSession(), timeoutMs);
      if (refreshed?.error || client !== supabaseState.sbClient || generation !== supabaseState.clientGeneration) return null;
    }
    const headerGeneration = supabaseState.headerGeneration;
    const result = await boundedAuth(() => client.auth.getSession(), timeoutMs);
    const session = result?.data?.session;
    const current = await readSupabaseConfiguration();
    if (result?.error || !isUsableSession(session) || !current || supabaseState.configChanging ||
        current.identity !== supabaseState.clientIdentity || client !== supabaseState.sbClient ||
        generation !== supabaseState.clientGeneration || headerGeneration !== supabaseState.headerGeneration ||
        (expectedBase !== null && current.base !== expectedBase)) return null;
    const headers = Object.freeze({ 'Content-Type': 'application/json', apikey: current.key,
      Authorization: `Bearer ${session.access_token}`, Prefer: 'return=representation' });
    headerContexts.set(headers, { client, generation, headerGeneration, identity: current.identity, token: session.access_token });
    cacheHeaders(headers);
    return headers;
  } catch (_) { return null; }
}

export async function isHeaderContextCurrent(headers) {
  const previous = headerContexts.get(headers);
  if (!previous || previous.client !== supabaseState.sbClient || previous.generation !== supabaseState.clientGeneration ||
      previous.headerGeneration !== supabaseState.headerGeneration) return false;
  const current = await getSessionHeaders();
  const next = current && headerContexts.get(current);
  return !!next && previous.identity === next.identity && previous.client === next.client &&
    previous.generation === next.generation && previous.headerGeneration === next.headerGeneration && previous.token === next.token;
}

const authFailure = (message = 'auth-headers-missing') => {
  const error = new Error(message); error.status = 401;
  globalWindow?.showLoginOverlay?.(true); return error;
};

// A stale response is unusable even when the current session is valid.
// Revalidate only the login requirement; never accept or replay that response.
const authContextChanged = async () => {
  const error = new Error('auth-context-changed'); error.status = 401; error.code = 'auth-context-changed';
  try {
    const client = await ensureSupabaseClient();
    if (!client) return error;
    const generation = supabaseState.clientGeneration, headerGeneration = supabaseState.headerGeneration;
    const result = await boundedAuth(() => client.auth.getSession(), AUTH_REFRESH_TIMEOUT_MS);
    const current = await readSupabaseConfiguration();
    // An error/timeout or another context change is inconclusive, not proof of logout.
    if (result?.error || !current || supabaseState.configChanging ||
        current.identity !== supabaseState.clientIdentity || client !== supabaseState.sbClient ||
        generation !== supabaseState.clientGeneration || headerGeneration !== supabaseState.headerGeneration) return error;
    if (!isUsableSession(result?.data?.session)) return authFailure('auth-context-changed');
  } catch (_) { /* No cached authorization or speculative login prompt. */ }
  return error;
};

// Each attempt rechecks current configuration/session. No cache-only or timeout fallback.
export async function fetchWithAuth(makeRequest, { tag = '', retry401 = true, maxAttempts = 2, requestUrl = null } = {}) {
  let attempts = 0, refreshed = false, forceRefresh = false;
  let expectedBase = null;
  if (requestUrl !== null) {
    try { expectedBase = new URL(String(requestUrl)).origin; } catch (_) { throw authFailure('auth-request-url-invalid'); }
  }
  while (true) {
    const headers = await getSessionHeaders({ forceRefresh, expectedBase }); forceRefresh = false;
    if (!headers) throw authFailure();
    const label = tag || 'request', start = Date.now();
    logRequestStart(label);
    let response, timer;
    try {
      response = await Promise.race([makeRequest(headers), new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('request-timeout')), 10000);
      })]);
    } catch (error) {
      logRequestFailure(label, 'error', Date.now() - start, 'transport-failed');
      if (!(await isHeaderContextCurrent(headers))) throw await authContextChanged();
      if (attempts < Math.max(0, maxAttempts)) { attempts++; await sleep(200 * attempts); continue; }
      throw error;
    } finally { clearTimeout(timer); }
    if (!(await isHeaderContextCurrent(headers))) {
      logRequestFailure(label, 401, Date.now() - start, 'auth-context-changed');
      throw await authContextChanged();
    }
    if (!response || typeof response.status !== 'number') {
      logRequestFailure(label, 'error', Date.now() - start, 'invalid-response');
      throw new Error('invalid-response');
    }
    if (response.status === 200) logRequestSuccess(label, Date.now() - start);
    else logRequestFailure(label, response.status, Date.now() - start);
    if (response.status === 401 || response.status === 403) {
      if (retry401 && !refreshed) { refreshed = true; forceRefresh = true; attempts = 0; continue; }
      const error = authFailure('auth-http'); error.status = response.status; error.response = response; throw error;
    }
    if (response.status >= 500 && response.status < 600 && attempts < Math.max(0, maxAttempts)) {
      attempts++; await sleep(200 * attempts); continue;
    }
    return response;
  }
}
