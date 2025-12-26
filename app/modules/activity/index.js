'use strict';
/**
 * MODULE: activity/index.js
 * Minimal data-access layer for activity_event (load/add/delete).
 */

(function initActivityModule(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;

  const diag =
    global.diag ||
    appModules.diag ||
    appModules.diagnostics ||
    { add() {} };

  const doc = global.document;
  const ISO_DAY_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  const getSupabaseApi = () => appModules.supabase || global.SupabaseAPI || {};
  const getSupabaseState = () => getSupabaseApi()?.supabaseState || null;
  const getAuthState = () => getSupabaseState()?.authState || 'unknown';

  async function ensureAuthenticated() {
    const state = getAuthState();
    if (state === 'auth') return true;
    if (state === 'unauth') return false;
    const supa = getSupabaseApi();
    if (typeof supa.waitForAuthDecision === 'function') {
      try {
        const decision = await supa.waitForAuthDecision();
        return decision === 'auth';
      } catch (_) {
        return getAuthState() === 'auth';
      }
    }
    return getAuthState() === 'auth';
  }

  const getConf = (...args) => {
    const fn = global.getConf;
    if (typeof fn !== 'function') return Promise.resolve(null);
    try {
      const result = fn(...args);
      return result && typeof result.then === 'function' ? result : Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const emitActivityChanged = (detail) => {
    if (!doc || typeof doc.dispatchEvent !== 'function') return;
    const payload = detail || {};
    try {
      doc.dispatchEvent(new CustomEvent('activity:changed', { detail: payload }));
      return;
    } catch (err) {
      diag.add?.(`[activity] CustomEvent fallback: ${err?.message || err}`);
    }
    if (typeof doc.createEvent === 'function') {
      const evt = doc.createEvent('Event');
      evt.initEvent('activity:changed', false, false);
      evt.detail = payload;
      doc.dispatchEvent(evt);
    }
  };

  const makeJsonHeaders = (headers) => {
    if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      const merged = new Headers(headers);
      merged.set('content-type', 'application/json');
      return merged;
    }
    const merged = Object.assign({}, headers);
    merged['content-type'] = 'application/json';
    return merged;
  };

  async function callActivityRpc(functionName, payload = {}, { reason = 'manual' } = {}) {
    const supabaseApi = getSupabaseApi();
    const fetchWithAuth = supabaseApi.fetchWithAuth;
    const baseUrlFromRest = supabaseApi.baseUrlFromRest;
    if (typeof fetchWithAuth !== 'function' || typeof baseUrlFromRest !== 'function') {
      const err = new Error('supabase-api-missing');
      err.code = 'activity_rpc_deps_missing';
      throw err;
    }

    const authed = await ensureAuthenticated();
    if (!authed) {
      diag.add?.(`[activity] rpc blocked (not authenticated) fn=${functionName}`);
      const err = new Error('Not authenticated');
      err.code = 'activity_not_authenticated';
      throw err;
    }

    const restUrl = await getConf('webhookUrl');
    const baseUrl = baseUrlFromRest(restUrl);
    if (!baseUrl) {
      const err = new Error('rest-base-missing');
      err.code = 'activity_rest_missing';
      throw err;
    }

    const rpcUrl = new URL(`${baseUrl}/rest/v1/rpc/${functionName}`);
    const tag = `activity:${functionName}`;
    diag.add?.(`[activity] rpc start fn=${functionName} reason=${reason}`);

    const response = await fetchWithAuth(
      (headers) =>
        fetch(rpcUrl.toString(), {
          method: 'POST',
          headers: makeJsonHeaders(headers),
          body: JSON.stringify(payload || {})
        }),
      { tag, maxAttempts: 2 }
    );

    if (!response.ok) {
      let detail = '';
      try {
        const errJson = await response.clone().json();
        detail = errJson?.message || errJson?.details || '';
      } catch (_) {
        /* ignore */
      }
      diag.add?.(`[activity] rpc fail fn=${functionName} status=${response.status} ${detail}`);
      const err = new Error(detail || `rpc ${functionName} failed`);
      err.status = response.status;
      err.code = 'activity_rpc_failed';
      throw err;
    }

    if (response.status === 204) {
      return null;
    }
    try {
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  const todayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeDayIso = (value) => {
    if (typeof value === 'string' && ISO_DAY_RE.test(value)) return value;
    return todayIso();
  };

  const mapActivityRow = (row) => {
    if (!row || typeof row !== 'object') return null;
    return {
      id: row.id,
      user_id: row.user_id || null,
      ts: row.ts || null,
      day: row.day || null,
      activity: row.activity || '',
      duration_min: Number(row.duration_min ?? 0),
      note: row.note || null
    };
  };

  async function loadActivities(fromDay, toDay, { reason } = {}) {
    const p_from = normalizeDayIso(fromDay);
    const p_to = normalizeDayIso(toDay);
    try {
      const rows = await callActivityRpc(
        'activity_list',
        { p_from, p_to },
        { reason: reason || 'load' }
      );
      const data = Array.isArray(rows) ? rows.map(mapActivityRow).filter(Boolean) : [];
      emitActivityChanged({ reason: reason || 'load', data, range: { from: p_from, to: p_to } });
      return data;
    } catch (err) {
      emitActivityChanged({
        reason: reason || 'load',
        error: { message: err?.message, status: err?.status }
      });
      throw err;
    }
  }

  async function addActivity(data = {}, { reason } = {}) {
    const activityText = (data.activity || '').trim();
    const durationValue = Number(data.duration_min);
    if (!activityText) {
      const err = new Error('activity required');
      err.code = 'activity_invalid';
      throw err;
    }
    if (!Number.isFinite(durationValue) || durationValue < 1) {
      const err = new Error('duration_min must be >= 1');
      err.code = 'activity_invalid';
      throw err;
    }
    const payload = {
      activity: activityText,
      duration_min: Math.trunc(durationValue),
      note: data.note ? String(data.note).trim() : null
    };
    const p_day = data.day || data.dayIso || null;
    try {
      const result = await callActivityRpc(
        'activity_add',
        { p_day, p_payload: payload },
        { reason: reason || 'add' }
      );
      emitActivityChanged({ reason: reason || 'add', created: result });
      return result;
    } catch (err) {
      emitActivityChanged({
        reason: reason || 'add',
        error: { message: err?.message, status: err?.status }
      });
      throw err;
    }
  }

  async function deleteActivity(id, { reason } = {}) {
    if (!id) throw new Error('deleteActivity requires id');
    try {
      const result = await callActivityRpc(
        'activity_delete',
        { p_event_id: id },
        { reason: reason || 'delete' }
      );
      emitActivityChanged({ reason: reason || 'delete', deleted: id });
      return !!result;
    } catch (err) {
      emitActivityChanged({
        reason: reason || 'delete',
        error: { message: err?.message, status: err?.status }
      });
      throw err;
    }
  }

  appModules.activity = Object.assign(appModules.activity || {}, {
    loadActivities,
    addActivity,
    deleteActivity,
    _callActivityRpc: callActivityRpc
  });
})(typeof window !== 'undefined' ? window : globalThis);
