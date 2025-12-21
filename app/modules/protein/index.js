'use strict';
/**
 * MODULE: protein/index.js
 * Description: Edge function bridge for dynamic protein targets.
 * Exports:
 *  - recomputeTargets({ weight_kg, dayIso, force, trigger })
 */

(function initProteinModule(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;

  const diag =
    global.diag ||
    appModules.diag ||
    appModules.diagnostics ||
    { add() {} };

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

  async function callProteinTargets(payload = {}, { reason = 'manual' } = {}) {
    const supabaseApi = getSupabaseApi();
    const fetchWithAuth = supabaseApi.fetchWithAuth;
    const baseUrlFromRest = supabaseApi.baseUrlFromRest;
    if (typeof fetchWithAuth !== 'function' || typeof baseUrlFromRest !== 'function') {
      const err = new Error('supabase-api-missing');
      err.code = 'protein_rpc_deps_missing';
      throw err;
    }

    const authed = await ensureAuthenticated();
    if (!authed) {
      diag.add?.('[protein] edge blocked (not authenticated)');
      const err = new Error('Nicht angemeldet');
      err.code = 'protein_not_authenticated';
      throw err;
    }

    const restUrl = await getConf('webhookUrl');
    const baseUrl = baseUrlFromRest(restUrl);
    if (!baseUrl) {
      const err = new Error('rest-base-missing');
      err.code = 'protein_rest_missing';
      throw err;
    }

    const endpoint = new URL(`${baseUrl}/functions/v1/midas-protein-targets`);
    diag.add?.(`[protein] edge start reason=${reason}`);

    const response = await fetchWithAuth(
      (headers) =>
        fetch(endpoint.toString(), {
          method: 'POST',
          headers: makeJsonHeaders(headers),
          body: JSON.stringify(payload || {})
        }),
      { tag: 'protein-targets', maxAttempts: 1 }
    );

    if (!response.ok) {
      const msg = await response.text().catch(() => '');
      diag.add?.(`[protein] edge fail ${response.status} ${msg || ''}`);
      const err = new Error(msg || `protein targets failed (${response.status})`);
      err.status = response.status;
      err.code = 'protein_edge_failed';
      throw err;
    }

    return await response.json().catch(() => ({}));
  }

  async function recomputeTargets({ weight_kg, dayIso, force = false, trigger = 'body_save' } = {}) {
    const payload = {
      trigger: trigger || 'body_save',
      weight_kg: typeof weight_kg === 'number' ? weight_kg : null,
      dayIso: dayIso || null,
      force: !!force
    };
    return await callProteinTargets(payload, { reason: trigger || 'body_save' });
  }

  appModules.protein = Object.assign(appModules.protein || {}, {
    recomputeTargets,
    _callProteinTargets: callProteinTargets
  });
})(typeof window !== 'undefined' ? window : globalThis);
