'use strict';
/**
 * MODULE: protein/index.js
 * Description: Edge function bridge for dynamic protein targets.
 * Exports:
 *  - recomputeTargets({ weight_kg, dayIso, force, trigger })
 *  - loadStoredContext(profile): read-only projection for the dashboard dialog
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
  let latestWeightCache = null;
  let latestWeightPromise = null;

  const loadLatestStoredWeight = async () => {
    if (latestWeightCache && Number.isFinite(latestWeightCache.value)) {
      return latestWeightCache.value;
    }
    if (latestWeightPromise) return latestWeightPromise;
    const supabase = getSupabaseApi();
    if (typeof supabase?.getUserId !== 'function' || typeof supabase?.sbSelect !== 'function') {
      return null;
    }
    latestWeightPromise = (async () => {
      const userId = await supabase.getUserId();
      if (!userId) return null;
      const rows = await supabase.sbSelect({
        table: 'v_events_body',
        select: 'day,kg',
        filters: [['user_id', `eq.${userId}`]],
        order: 'day.desc',
        limit: 1
      });
      const row = Array.isArray(rows) && rows.length ? rows[0] : null;
      const value = row && Number.isFinite(Number(row.kg)) ? Number(row.kg) : null;
      if (value !== null) latestWeightCache = { value };
      return value;
    })().finally(() => {
      latestWeightPromise = null;
    });
    return latestWeightPromise;
  };

  const loadStoredContext = async (profile) => {
    if (!profile || typeof profile !== 'object') return null;
    const latestStoredWeightKg = await loadLatestStoredWeight();
    return Object.freeze({
      targetMin: profile.protein_target_min ?? null,
      targetMax: profile.protein_target_max ?? null,
      calcVersion: profile.protein_calc_version ?? null,
      lastCalcAt: profile.protein_last_calc_at ?? null,
      windowDays: profile.protein_window_days ?? null,
      ageBase: profile.protein_age_base ?? null,
      activityLevel: profile.protein_activity_level ?? null,
      activeDays: profile.protein_activity_score_28d ?? null,
      factorPreCkd: profile.protein_factor_pre_ckd ?? null,
      ckdStage: profile.protein_ckd_stage_g ?? profile.ckd_stage ?? null,
      ckdFactor: profile.protein_ckd_factor ?? null,
      factorCurrent: profile.protein_factor_current ?? null,
      doctorLock: profile.protein_doctor_lock ?? null,
      doctorFactor: profile.protein_doctor_factor ?? null,
      doctorMin: profile.protein_doctor_min ?? null,
      doctorMax: profile.protein_doctor_max ?? null,
      latestStoredWeightKg
    });
  };

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
    if (Number.isFinite(payload.weight_kg)) {
      latestWeightCache = { value: payload.weight_kg };
    }
    const result = await callProteinTargets(payload, { reason: trigger || 'body_save' });
    return result;
  }

  appModules.protein = Object.assign(appModules.protein || {}, {
    recomputeTargets,
    loadStoredContext,
    _callProteinTargets: callProteinTargets
  });
})(typeof window !== 'undefined' ? window : globalThis);
