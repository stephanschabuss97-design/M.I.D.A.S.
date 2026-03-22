'use strict';
/**
 * MODULE: medication/index.js
 * Description: Data-access scaffold for the Medication module (Phase B1).
 * Responsibilities:
 *  - Load medication rows for a given day via Supabase RPC (`med_list_v2`)
 *  - Maintain a lightweight day cache & inflight dedupe
 *  - Emit `medication:changed` CustomEvents so UI blocks can subscribe without tight coupling
 *  - Expose helper methods for follow-up phases (invalidate cache, raw RPC bridge)
 */

(function initMedicationModule(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;

  const diag =
    global.diag ||
    appModules.diag ||
    appModules.diagnostics ||
    { add() {} };

  const doc = global.document;
  const ISO_DAY_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const medicationState = {
    cache: new Map(), // key -> dayIso, value -> { data, updatedAt }
    inflightLoads: new Map(), // key -> dayIso, value -> Promise
    lastError: null,
    ui: {
      initialized: false,
      dayIso: null,
      elements: {},
      disabled: false,
      authRetryTimer: null,
      cardOrder: []
    }
  };

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

  const showLoginOverlay = () => {
    try {
      getSupabaseApi()?.showLoginOverlay?.(true);
    } catch (_) {}
  };

  const getSupabaseApi = () => appModules.supabase || global.SupabaseAPI || {};
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
  const SLOT_TYPE_ORDER = Object.freeze(['morning', 'noon', 'evening', 'night']);
  const SLOT_TYPE_LABELS = Object.freeze({
    morning: 'Morgen',
    noon: 'Mittag',
    evening: 'Abend',
    night: 'Nacht'
  });
  const SLOT_TYPE_LABEL_ALIASES = Object.freeze({
    morgen: 'morning',
    morgens: 'morning',
    morning: 'morning',
    frueh: 'morning',
    früh: 'morning',
    mittag: 'noon',
    mittags: 'noon',
    noon: 'noon',
    abend: 'evening',
    abends: 'evening',
    evening: 'evening',
    nacht: 'night',
    nachts: 'night',
    night: 'night'
  });
  const DEFAULT_SLOT_LABELS = Object.freeze(SLOT_TYPE_ORDER.map((type) => SLOT_TYPE_LABELS[type]));

  const toIntOr = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
  };

  const normalizeSlotType = (value) => {
    const normalized = `${value || ''}`.trim().toLowerCase();
    return SLOT_TYPE_ORDER.includes(normalized) ? normalized : '';
  };

  const inferSlotTypeFromContext = ({ slotType, label, index, slotCount }) => {
    const normalizedType = normalizeSlotType(slotType);
    if (normalizedType) return normalizedType;

    const labelKey = `${label || ''}`.trim().toLowerCase();
    if (labelKey && SLOT_TYPE_LABEL_ALIASES[labelKey]) return SLOT_TYPE_LABEL_ALIASES[labelKey];

    const order = Math.max(0, toIntOr(index, 0));
    const count = Math.max(1, toIntOr(slotCount, 1));
    if (count <= 1) return 'morning';
    if (count === 2) return order === 0 ? 'morning' : 'evening';
    if (count === 3) return SLOT_TYPE_ORDER[Math.min(order, 2)] || 'evening';
    return SLOT_TYPE_ORDER[Math.min(order, SLOT_TYPE_ORDER.length - 1)] || 'night';
  };

  const normalizeSlot = (slot, index, dayIso) => {
    if (!slot || typeof slot !== 'object') return null;
    const slotId = `${slot.slot_id || slot.id || ''}`.trim();
    const qty = Math.max(1, toIntOr(slot.qty, 1));
    const slotCount = Math.max(1, toIntOr(slot.slot_count ?? slot.total_count, index + 1));
    const labelValue = `${slot.label || ''}`.trim();
    const slotType = inferSlotTypeFromContext({
      slotType: slot.slot_type,
      label: labelValue,
      index,
      slotCount
    });
    return {
      slot_id: slotId,
      label: labelValue || SLOT_TYPE_LABELS[slotType] || DEFAULT_SLOT_LABELS[index] || `Einnahme ${index + 1}`,
      slot_type: slotType,
      sort_order: Math.max(0, toIntOr(slot.sort_order, index)),
      qty,
      start_date: slot.start_date || null,
      end_date: slot.end_date || null,
      is_taken: !!slot.is_taken,
      taken_at: slot.taken_at || null,
      day: slot.day || dayIso
    };
  };

  const buildScheduleSlotsFromFrequency = (frequencyInput) => {
    const frequency = Math.min(12, Math.max(1, toIntOr(frequencyInput, 1)));
    return Array.from({ length: frequency }, (_, index) => {
      const slotType = inferSlotTypeFromContext({ index, slotCount: frequency });
      return {
        label: SLOT_TYPE_LABELS[slotType] || DEFAULT_SLOT_LABELS[index] || `Einnahme ${index + 1}`,
        slot_type: slotType,
        sort_order: index,
        qty: 1
      };
    });
  };

  const getMedicationSlots = (med) =>
    Array.isArray(med?.slots)
      ? med.slots.filter((slot) => slot && `${slot.slot_id || ''}`.trim())
      : [];

  const getOpenMedicationSlots = (med) =>
    getMedicationSlots(med).filter((slot) => !slot.is_taken);

  const getTakenMedicationSlots = (med) =>
    getMedicationSlots(med).filter((slot) => !!slot.is_taken);

  const getMedicationByIdFromCache = (medId, dayIsoInput) => {
    const dayIso = normalizeDayIso(dayIsoInput);
    const payload = medicationState.cache.get(dayIso)?.data;
    if (!Array.isArray(payload?.medications)) return null;
    return payload.medications.find((entry) => entry && entry.id === medId) || null;
  };

  const syncCardOrder = (order, items) => {
    const ids = items.map((item) => item?.id).filter(Boolean);
    const next = order.filter((id) => ids.includes(id));
    ids.forEach((id) => {
      if (!next.includes(id)) next.push(id);
    });
    return next;
  };

  const sortByCardOrder = (items, order) => {
    const rank = new Map(order.map((id, index) => [id, index]));
    return items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const aRank = rank.get(a.item?.id);
        const bRank = rank.get(b.item?.id);
        const aValue = Number.isFinite(aRank) ? aRank : Number.MAX_SAFE_INTEGER;
        const bValue = Number.isFinite(bRank) ? bRank : Number.MAX_SAFE_INTEGER;
        if (aValue !== bValue) return aValue - bValue;
        return a.index - b.index;
      })
      .map((entry) => entry.item);
  };

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

  const emitMedicationChanged = (detail) => {
    if (!doc || typeof doc.dispatchEvent !== 'function') return;
    const payload = detail || {};
    try {
      doc.dispatchEvent(new CustomEvent('medication:changed', { detail: payload }));
      return;
    } catch (err) {
      diag.add?.(`[medication] CustomEvent fallback: ${err?.message || err}`);
    }
    if (typeof doc.createEvent === 'function') {
      const evt = doc.createEvent('Event');
      evt.initEvent('medication:changed', false, false);
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

  async function callMedicationRpc(functionName, payload = {}, { reason = 'manual' } = {}) {
    const supabaseApi = getSupabaseApi();
    const fetchWithAuth = supabaseApi.fetchWithAuth;
    const baseUrlFromRest = supabaseApi.baseUrlFromRest;
    if (typeof fetchWithAuth !== 'function' || typeof baseUrlFromRest !== 'function') {
      const err = new Error('supabase-api-missing');
      err.code = 'medication_rpc_deps_missing';
      throw err;
    }

    const authed = await ensureAuthenticated();
    if (!authed) {
      diag.add?.(`[medication] rpc blocked (not authenticated) fn=${functionName}`);
      const err = new Error('Nicht angemeldet');
      err.code = 'medication_not_authenticated';
      throw err;
    }

    const restUrl = await getConf('webhookUrl');
    const baseUrl = baseUrlFromRest(restUrl);
    if (!baseUrl) {
      const err = new Error('rest-base-missing');
      err.code = 'medication_rest_missing';
      throw err;
    }

    const rpcUrl = new URL(`${baseUrl}/rest/v1/rpc/${functionName}`);
    const tag = `med:${functionName}`;
    diag.add?.(`[medication] rpc start fn=${functionName} reason=${reason}`);

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
      diag.add?.(`[medication] rpc fail fn=${functionName} status=${response.status} ${detail}`);
      const err = new Error(detail || `rpc ${functionName} failed`);
      err.status = response.status;
      err.code = 'medication_rpc_failed';
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

  const mapRpcRow = (row) => {
    if (!row || typeof row !== 'object') return null;
    const slotsRaw = Array.isArray(row.slots)
      ? row.slots
      : row.slots && typeof row.slots === 'object'
        ? row.slots
        : [];
    const slots = Array.isArray(slotsRaw)
      ? slotsRaw
          .map((slot, index) => normalizeSlot({ ...slot, slot_count: slotsRaw.length }, index, row.day))
          .filter(Boolean)
      : [];
    const totalCount = Math.max(0, toIntOr(row.total_count, slots.length));
    const takenCount = Math.max(0, toIntOr(row.taken_count, slots.filter((slot) => slot.is_taken).length));
    const dailyPlannedQty = Math.max(0, toIntOr(row.daily_planned_qty, slots.reduce((sum, slot) => sum + slot.qty, 0)));
    const dailyTakenQty = Math.max(0, toIntOr(row.daily_taken_qty, slots.filter((slot) => slot.is_taken).reduce((sum, slot) => sum + slot.qty, 0)));
    const dailyRemainingQty = Math.max(0, toIntOr(row.daily_remaining_qty, dailyPlannedQty - dailyTakenQty));
    const state =
      row.state ||
      (totalCount <= 0 ? null : takenCount <= 0 ? 'open' : takenCount < totalCount ? 'partial' : 'done');
    return {
      id: row.id,
      name: row.name,
      ingredient: row.ingredient,
      strength: row.strength,
      leaflet_url: row.leaflet_url,
      stock_count: toIntOr(row.stock_count, 0),
      low_stock_days: toIntOr(row.low_stock_days, 0),
      active: row.active !== false,
      with_meal: !!row.with_meal,
      plan_active: row.plan_active !== false && totalCount > 0,
      days_left: Number.isFinite(row.days_left) ? Number(row.days_left) : null,
      runout_day: row.runout_day || null,
      low_stock: !!row.low_stock,
      taken: state === 'done',
      taken_at: slots.find((slot) => slot.is_taken)?.taken_at || row.taken_at || null,
      qty: dailyTakenQty,
      total_count: totalCount,
      taken_count: takenCount,
      daily_planned_qty: dailyPlannedQty,
      daily_taken_qty: dailyTakenQty,
      daily_remaining_qty: dailyRemainingQty,
      state,
      slots,
      low_stock_ack_day: row.low_stock_ack_day || null,
      low_stock_ack_stock: Number.isFinite(row.low_stock_ack_stock) ? Number(row.low_stock_ack_stock) : null
    };
  };

  const MEDICATION_REORDER_GUARD_REASONS = Object.freeze({
    medMissing: 'medication-reorder-med-missing',
    medIdMissing: 'medication-reorder-id-missing',
    notLowStock: 'medication-reorder-not-low-stock',
    doctorEmailMissing: 'medication-reorder-doctor-email-missing',
    mailtoUnavailable: 'medication-reorder-mailto-unavailable'
  });

  function buildMedicationReorderMailHref(doctorInfo, med, meds = []) {
    if (!doctorInfo?.email || !med) return null;
    const medNames = Array.isArray(meds)
      ? meds
          .map((entry) => {
            const name = String(entry?.name || '').trim();
            const strength = String(entry?.strength || '').trim();
            if (!name) return '';
            return strength ? `${name} ${strength}` : name;
          })
          .filter(Boolean)
      : [];
    const uniqueNames = Array.from(new Set(medNames));
    const fallbackName = String(med.name || 'Medikation').trim();
    if (!uniqueNames.length && fallbackName) uniqueNames.push(fallbackName);
    const subject =
      uniqueNames.length === 1
        ? `Bitte um neues Rezept: ${uniqueNames[0]}`
        : `Bitte um neue Rezepte: ${uniqueNames.join(', ')}`;
    const medicationBulletList = uniqueNames.map((name) => `- ${name}`);
    const bodyLines = [
      'Hallo,',
      '',
      'mein aktueller Vorrat folgender Medikamente ist bald aufgebraucht:',
      '',
      ...medicationBulletList,
      '',
      'Ich bitte um Ausstellung eines neuen Rezepts auf der e-Card.',
      'Sollten noch Fragen offen sein, bitte ich um kurze Rückmeldung.',
      'Bisher wurden standardmässig zwei Packungen je Medikament verordnet.',
      '',
      'Vielen Dank und freundliche Grüsse',
      'Stephan'
    ];
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    return `mailto:${encodeURIComponent(doctorInfo.email)}?${query}`;
  }

  function getMedicationReorderStartContract(med, options = {}) {
    if (!med || typeof med !== 'object') {
      return { ok: false, reason: MEDICATION_REORDER_GUARD_REASONS.medMissing };
    }
    const medId = `${med.id || ''}`.trim();
    if (!medId) {
      return { ok: false, reason: MEDICATION_REORDER_GUARD_REASONS.medIdMissing };
    }
    if (!med.low_stock) {
      return { ok: false, reason: MEDICATION_REORDER_GUARD_REASONS.notLowStock, medId };
    }
    const doctorInfo =
      options.doctorInfo && typeof options.doctorInfo === 'object' ? { ...options.doctorInfo } : null;
    if (!doctorInfo?.email) {
      return { ok: false, reason: MEDICATION_REORDER_GUARD_REASONS.doctorEmailMissing, medId };
    }
    const dayIso = typeof options.dayIso === 'string' && options.dayIso.trim() ? normalizeDayIso(options.dayIso) : null;
    const meds = Array.isArray(options.meds) ? options.meds : [med];
    const href = buildMedicationReorderMailHref(doctorInfo, med, meds);
    if (!href) {
      return { ok: false, reason: MEDICATION_REORDER_GUARD_REASONS.mailtoUnavailable, medId };
    }
    return {
      ok: true,
      reason: '',
      type: 'medication_reorder_start',
      state: 'reorder_prompted',
      channel: 'mailto',
      requires_user_action: true,
      medId,
      dayIso,
      doctorEmail: doctorInfo.email,
      href
    };
  }

  async function loadMedicationForDay(dayIsoInput, options = {}) {
    const reason = typeof options.reason === 'string' ? options.reason : 'manual';
    const normalizedDay = normalizeDayIso(dayIsoInput);

    if (!options.force) {
      const cached = medicationState.cache.get(normalizedDay);
      if (cached?.data) {
        return cached.data;
      }
    }
    if (medicationState.inflightLoads.has(normalizedDay)) {
      return medicationState.inflightLoads.get(normalizedDay);
    }

    const promise = (async () => {
      try {
        const rows = await callMedicationRpc(
          'med_list_v2',
          { p_day: normalizedDay },
          { reason: `load:${reason}` }
        );
        const mappedRows = Array.isArray(rows) ? rows.map(mapRpcRow).filter(Boolean) : [];
        const payload = { dayIso: normalizedDay, medications: mappedRows };
        medicationState.cache.set(normalizedDay, { data: payload, updatedAt: Date.now() });
        medicationState.lastError = null;
        emitMedicationChanged({ reason: `load:${reason}`, dayIso: normalizedDay, data: payload });
        return payload;
      } catch (err) {
        medicationState.lastError = err;
        emitMedicationChanged({
          reason: `load:${reason}`,
          dayIso: normalizedDay,
          error: { message: err?.message, status: err?.status }
        });
        throw err;
      }
    })().finally(() => medicationState.inflightLoads.delete(normalizedDay));

    medicationState.inflightLoads.set(normalizedDay, promise);
    return promise;
  }

  async function mutateAndReload({ rpc, payload, reason, dayIso }) {
    const mutationReason = reason || rpc;
    await callMedicationRpc(rpc, payload, { reason: `mutate:${mutationReason}` });
    if (dayIso) {
      invalidateMedicationCache(dayIso);
      return await loadMedicationForDay(dayIso, { force: true, reason: `mutate:${mutationReason}` });
    }
    invalidateMedicationCache();
    emitMedicationChanged({ reason: `mutate:${mutationReason}`, dayIso: null });
    return null;
  }

  async function confirmMedicationSlot(slotId, { dayIso, reason } = {}) {
    const normalizedDay = normalizeDayIso(dayIso);
    if (!slotId) throw new Error('confirmMedicationSlot requires slotId');
    return await mutateAndReload({
      rpc: 'med_confirm_slot_v2',
      payload: { p_slot_id: slotId, p_day: normalizedDay },
      reason: reason || 'confirm-slot',
      dayIso: normalizedDay
    });
  }

  async function undoMedicationSlot(slotId, { dayIso, reason } = {}) {
    const normalizedDay = normalizeDayIso(dayIso);
    if (!slotId) throw new Error('undoMedicationSlot requires slotId');
    return await mutateAndReload({
      rpc: 'med_undo_slot_v2',
      payload: { p_slot_id: slotId, p_day: normalizedDay },
      reason: reason || 'undo-slot',
      dayIso: normalizedDay
    });
  }

  async function confirmMedication(medId, { dayIso, reason } = {}) {
    const normalizedDay = normalizeDayIso(dayIso);
    if (!medId) throw new Error('confirmMedication requires medId');
    const med = getMedicationByIdFromCache(medId, normalizedDay)
      || (await loadMedicationForDay(normalizedDay, { reason: reason || 'confirm-med' }))
        ?.medications?.find((entry) => entry?.id === medId);
    const openSlots = getOpenMedicationSlots(med);
    if (!openSlots.length) return null;
    await Promise.all(
      openSlots.map((slot) =>
        callMedicationRpc(
          'med_confirm_slot_v2',
          { p_slot_id: slot.slot_id, p_day: normalizedDay },
          { reason: `mutate:${reason || 'confirm-med'}` }
        ))
    );
    invalidateMedicationCache(normalizedDay);
    return await loadMedicationForDay(normalizedDay, { force: true, reason: `mutate:${reason || 'confirm-med'}` });
  }

  async function undoMedication(medId, { dayIso, reason } = {}) {
    const normalizedDay = normalizeDayIso(dayIso);
    if (!medId) throw new Error('undoMedication requires medId');
    const med = getMedicationByIdFromCache(medId, normalizedDay)
      || (await loadMedicationForDay(normalizedDay, { reason: reason || 'undo-med' }))
        ?.medications?.find((entry) => entry?.id === medId);
    const takenSlots = getTakenMedicationSlots(med);
    if (takenSlots.length !== 1) {
      throw new Error('undoMedication ist nur für Medikamente mit genau einer bestätigten Einnahme verfügbar');
    }
    return await undoMedicationSlot(takenSlots[0].slot_id, { dayIso: normalizedDay, reason: reason || 'undo-med' });
  }

  async function confirmMedicationSection(sectionInput, dayIsoInput, { reason } = {}) {
    const normalizedDay = normalizeDayIso(dayIsoInput);
    const normalizedSection = normalizeSlotType(sectionInput);
    if (!normalizedSection) {
      throw new Error('confirmMedicationSection requires valid section');
    }
    const payload = await loadMedicationForDay(normalizedDay, {
      force: false,
      reason: reason || `confirm-section:${normalizedSection}`
    });
    const openSlotIds = (Array.isArray(payload?.medications) ? payload.medications : [])
      .filter((med) => med && med.active !== false)
      .flatMap((med) =>
        getOpenMedicationSlots(med)
          .filter((slot) => normalizeSlotType(slot?.slot_type) === normalizedSection)
          .map((slot) => slot.slot_id)
      )
      .filter(Boolean);
    if (!openSlotIds.length) return payload;
    await Promise.all(
      openSlotIds.map((slotId) =>
        callMedicationRpc(
          'med_confirm_slot_v2',
          { p_slot_id: slotId, p_day: normalizedDay },
          { reason: `mutate:${reason || `confirm-section:${normalizedSection}`}` }
        ))
    );
    invalidateMedicationCache(normalizedDay);
    return await loadMedicationForDay(normalizedDay, {
      force: true,
      reason: `mutate:${reason || `confirm-section:${normalizedSection}`}`
    });
  }

  async function upsertMedication(data = {}, { reason } = {}) {
    const medPayload = {
      p_id: data.id ?? data.p_id ?? null,
      p_name: data.name,
      p_ingredient: data.ingredient ?? null,
      p_strength: data.strength ?? null,
      p_leaflet_url: data.leaflet_url ?? null,
      p_stock_count: data.stock_count ?? 0,
      p_low_stock_days: data.low_stock_days ?? 7,
      p_active: typeof data.active === 'boolean' ? data.active : true,
      p_with_meal: !!data.with_meal
    };
    const result = await callMedicationRpc('med_upsert_v2', medPayload, { reason: reason || 'upsert' });
    const scheduleSlots = Array.isArray(data.slots) && data.slots.length
      ? data.slots
      : buildScheduleSlotsFromFrequency(data.total_count ?? 1);
    await callMedicationRpc(
      'med_upsert_schedule_v2',
      {
        p_med_id: result?.id,
        p_effective_start_date: normalizeDayIso(data.start_date),
        p_slots: scheduleSlots
      },
      { reason: `${reason || 'upsert'}:schedule` }
    );
    invalidateMedicationCache();
    emitMedicationChanged({ reason: `mutate:${reason || 'upsert'}`, updated: result });
    return result;
  }

  async function adjustStock(medId, delta, { reason, dayIso } = {}) {
    if (!medId) throw new Error('adjustStock requires medId');
    if (!Number.isFinite(delta) || delta === 0) throw new Error('adjustStock delta must be non-zero');
    const normalizedDay = dayIso ? normalizeDayIso(dayIso) : null;
    const result = await callMedicationRpc(
      'med_adjust_stock_v2',
      { p_med_id: medId, p_delta: Math.trunc(delta), p_reason: reason || null },
      { reason: reason || 'adjust' }
    );
    if (normalizedDay) {
      invalidateMedicationCache(normalizedDay);
      await loadMedicationForDay(normalizedDay, { force: true, reason: `mutate:${reason || 'adjust'}` });
    } else {
      invalidateMedicationCache();
    }
    emitMedicationChanged({ reason: `mutate:${reason || 'adjust'}`, updated: result });
    return result;
  }

  async function setStock(medId, stock, { reason, dayIso } = {}) {
    if (!medId) throw new Error('setStock requires medId');
    if (!Number.isFinite(stock) || stock < 0) throw new Error('setStock requires stock >= 0');
    const normalizedDay = dayIso ? normalizeDayIso(dayIso) : null;
    const result = await callMedicationRpc(
      'med_set_stock_v2',
      { p_med_id: medId, p_stock: Math.trunc(stock), p_reason: reason || null },
      { reason: reason || 'setStock' }
    );
    if (normalizedDay) {
      invalidateMedicationCache(normalizedDay);
      await loadMedicationForDay(normalizedDay, { force: true, reason: `mutate:${reason || 'setStock'}` });
    } else {
      invalidateMedicationCache();
    }
    emitMedicationChanged({ reason: `mutate:${reason || 'setStock'}`, updated: result });
    return result;
  }

  async function ackLowStock(medId, { dayIso, stockSnapshot, reason } = {}) {
    if (!medId) throw new Error('ackLowStock requires medId');
    const normalizedDay = normalizeDayIso(dayIso);
    if (!Number.isFinite(stockSnapshot)) {
      throw new Error('ackLowStock requires stockSnapshot (int)');
    }
    const payload = {
      p_med_id: medId,
      p_day: normalizedDay,
      p_stock_snapshot: Math.trunc(stockSnapshot)
    };
    const result = await callMedicationRpc('med_ack_low_stock_v2', payload, { reason: reason || 'ack' });
    invalidateMedicationCache(normalizedDay);
    await loadMedicationForDay(normalizedDay, { force: true, reason: `mutate:${reason || 'ack'}` });
    emitMedicationChanged({ reason: `mutate:${reason || 'ack'}`, updated: result });
    return result;
  }

  async function setMedicationActive(medId, active, { dayIso, reason } = {}) {
    if (!medId) throw new Error('setMedicationActive requires medId');
    const normalizedDay = dayIso ? normalizeDayIso(dayIso) : null;
    await mutateAndReload({
      rpc: 'med_set_active_v2',
      payload: { p_med_id: medId, p_active: !!active },
      reason: reason || 'setActive',
      dayIso: normalizedDay || todayIso()
    });
  }

  async function deleteMedication(medId, { dayIso, reason } = {}) {
    if (!medId) throw new Error('deleteMedication requires medId');
    const normalizedDay = dayIso ? normalizeDayIso(dayIso) : null;
    await mutateAndReload({
      rpc: 'med_delete_v2',
      payload: { p_med_id: medId },
      reason: reason || 'delete',
      dayIso: normalizedDay || todayIso()
    });
  }

  function invalidateMedicationCache(dayIso) {
    if (dayIso) {
      medicationState.cache.delete(dayIso);
      return;
    }
    medicationState.cache.clear();
  }

  function getCachedMedicationDay(dayIsoInput) {
    const dayIso = normalizeDayIso(dayIsoInput);
    return medicationState.cache.get(dayIso)?.data || null;
  }

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch));

  const formatMedicationPlanSummary = (med) => {
    const slots = getMedicationSlots(med);
    if (!slots.length) return 'Kein Plan';
    return slots
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((slot) => (slot.qty > 1 ? `${slot.label} (${slot.qty})` : slot.label))
      .join(', ');
  };

  const getFrequencyPresetValue = (slots) => {
    if (!Array.isArray(slots) || !slots.length) return '1';
    const count = slots.length;
    if (count >= 1 && count <= 4) {
      const allDefault = slots.every((slot, index) => {
        const slotType = inferSlotTypeFromContext({
          slotType: slot?.slot_type,
          label: slot?.label,
          index,
          slotCount: count
        });
        const qty = Math.max(1, toIntOr(slot?.qty, 1));
        const expectedType = inferSlotTypeFromContext({ index, slotCount: count });
        return slotType === expectedType && qty === 1;
      });
      if (allDefault) return String(count);
    }
    return 'custom';
  };

  function initMedicationTabUi() {
    if (medicationState.ui.initialized || !doc) return;
    const manager = doc.getElementById('medicationManager');
    if (!manager) return;

    const form = manager.querySelector('#medicationForm');
    const statusEl = manager.querySelector('#medFormStatus');
    const resetBtn = manager.querySelector('#medFormResetBtn');
    const cardsMeta = manager.querySelector('#medicationCardsMeta');
    const cardList = manager.querySelector('#medicationCardList');
    const saveBtn = manager.querySelector('#medFormSaveBtn');
    if (!form || !cardList || !cardsMeta || !saveBtn) return;

    medicationState.ui.initialized = true;
    medicationState.ui.dayIso = todayIso();
    medicationState.ui.elements = {
      form,
      statusEl,
      resetBtn,
      cardsMeta,
      cardList,
      saveBtn,
      id: form.querySelector('#medFormId'),
      name: form.querySelector('#medFormName'),
      ingredient: form.querySelector('#medFormIngredient'),
      strength: form.querySelector('#medFormStrength'),
      dose: form.querySelector('#medFormDose'),
      startDate: form.querySelector('#medFormStartDate'),
      stock: form.querySelector('#medFormStock'),
      lowStock: form.querySelector('#medFormLowStock'),
      active: form.querySelector('#medFormActive'),
      withMeal: form.querySelector('#medFormWithMeal'),
      slotEditor: form.querySelector('#medFormSlotEditor'),
      slots: form.querySelector('#medFormSlots'),
      addSlotBtn: form.querySelector('#medFormAddSlotBtn')
    };

      const updateFormStatus = (msg) => {
        if (!statusEl) return;
        statusEl.textContent = msg || '';
      };

    const setFormBusy = (busy) => {
      if (medicationState.ui.disabled) return;
      saveBtn.disabled = !!busy;
      saveBtn.textContent = busy ? 'Speichere ...' : 'Speichern';
    };

    const getFrequencyValue = () => {
      const value = `${medicationState.ui.elements.dose?.value || '1'}`.trim();
      return value || '1';
    };

    const renderSlotEditor = (slots, { fixed = false } = {}) => {
      const ui = medicationState.ui.elements;
      if (!ui.slots) return;
      const normalizedSlots = (Array.isArray(slots) && slots.length ? slots : buildScheduleSlotsFromFrequency(1))
        .map((slot, index) => normalizeSlot(slot, index, ui.startDate?.value || todayIso()))
        .filter(Boolean);
      ui.slots.innerHTML = normalizedSlots
        .map((slot, index) => {
          const qty = Math.max(1, toIntOr(slot.qty, 1));
          const slotType = inferSlotTypeFromContext({
            slotType: slot.slot_type,
            label: slot.label,
            index,
            slotCount: normalizedSlots.length
          });
          return `
            <div class="medication-slot-row ${fixed ? 'is-fixed' : ''}" data-slot-row="${index}" data-slot-type="${escapeHtml(slotType)}">
              <label class="field-group">
                <span class="label">Slot ${index + 1}</span>
                <input
                  type="text"
                  data-slot-label
                  value="${escapeHtml(slot.label || '')}"
                  placeholder="${escapeHtml(SLOT_TYPE_LABELS[slotType] || DEFAULT_SLOT_LABELS[index] || `Einnahme ${index + 1}`)}"
                >
              </label>
              <label class="field-group">
                <span class="label">Menge</span>
                <input type="number" min="1" max="24" step="1" data-slot-qty value="${qty}">
              </label>
              <button type="button" class="btn ghost small" data-slot-remove ${fixed ? 'disabled' : ''}>Entfernen</button>
            </div>
          `;
        })
        .join('');
      if (ui.addSlotBtn) {
        ui.addSlotBtn.hidden = fixed;
      }
    };

    const collectFormSlots = () => {
      const ui = medicationState.ui.elements;
      const rows = Array.from(ui.slots?.querySelectorAll('[data-slot-row]') || []);
      return rows.map((row, index) => {
        const labelInput = row.querySelector('[data-slot-label]');
        const qtyInput = row.querySelector('[data-slot-qty]');
        const slotType = inferSlotTypeFromContext({
          slotType: row.getAttribute('data-slot-type'),
          label: labelInput?.value,
          index,
          slotCount: rows.length
        });
        return {
          label: `${labelInput?.value || ''}`.trim() || SLOT_TYPE_LABELS[slotType] || DEFAULT_SLOT_LABELS[index] || `Einnahme ${index + 1}`,
          slot_type: slotType,
          sort_order: index,
          qty: Math.max(1, toIntOr(qtyInput?.value, 1))
        };
      });
    };

    const validateFormSlots = (slots) => {
      if (!Array.isArray(slots) || !slots.length) {
        throw new Error('Mindestens ein Einnahme-Slot ist erforderlich.');
      }
      const normalized = slots.map((slot, index) => {
        const slotType = inferSlotTypeFromContext({
          slotType: slot?.slot_type,
          label: slot?.label,
          index,
          slotCount: slots.length
        });
        return {
          label: `${slot?.label || ''}`.trim() || SLOT_TYPE_LABELS[slotType] || DEFAULT_SLOT_LABELS[index] || `Einnahme ${index + 1}`,
          slot_type: slotType,
          sort_order: index,
          qty: Math.max(1, toIntOr(slot?.qty, 1))
        };
      });
      const hasInvalidQty = normalized.some((slot) => !Number.isFinite(slot.qty) || slot.qty <= 0);
      if (hasInvalidQty) {
        throw new Error('Jeder Slot braucht eine gültige Menge grösser als 0.');
      }
      const hasInvalidType = normalized.some((slot) => !normalizeSlotType(slot.slot_type));
      if (hasInvalidType) {
        throw new Error('Jeder Slot braucht einen gueltigen Tagesabschnitt.');
      }
      return normalized;
    };

    const syncSlotEditorWithFrequency = ({ preserveCustom = true } = {}) => {
      const preset = getFrequencyValue();
      const currentSlots = collectFormSlots();
      if (preset === 'custom') {
        renderSlotEditor(
          preserveCustom && currentSlots.length ? currentSlots : buildScheduleSlotsFromFrequency(2),
          { fixed: false }
        );
        return;
      }
      renderSlotEditor(buildScheduleSlotsFromFrequency(preset), { fixed: true });
    };

    const setFormDisabled = (disabled, message) => {
      medicationState.ui.disabled = !!disabled;
      const ui = medicationState.ui.elements;
      const controls = [
        ui.name,
        ui.ingredient,
        ui.strength,
        ui.dose,
        ui.startDate,
        ui.stock,
        ui.lowStock,
        ui.active,
        ui.withMeal,
        ui.addSlotBtn,
        ui.resetBtn,
        ui.saveBtn
      ].filter(Boolean);
      controls.forEach((el) => {
        el.disabled = !!disabled;
      });
      Array.from(ui.slots?.querySelectorAll('input, button') || []).forEach((el) => {
        el.disabled = !!disabled;
      });
      form.classList.toggle('is-disabled', !!disabled);
      if (!disabled && ui.saveBtn) {
        ui.saveBtn.textContent = 'Speichern';
      }
      if (typeof message !== 'undefined') {
        updateFormStatus(message);
      }
    };

    const clearForm = () => {
      const ui = medicationState.ui.elements;
      ui.id.value = '';
      ui.name.value = '';
      ui.ingredient.value = '';
      ui.strength.value = '';
      ui.dose.value = '1';
      if (ui.startDate) ui.startDate.value = '';
      ui.stock.value = '0';
      ui.lowStock.value = '7';
      ui.active.checked = true;
      if (ui.withMeal) ui.withMeal.checked = false;
      renderSlotEditor(buildScheduleSlotsFromFrequency(1), { fixed: true });
      if (!medicationState.ui.disabled) updateFormStatus('');
    };

    const ensureAuthForUi = async ({ prompt = false } = {}) => {
      const authed = await ensureAuthenticated();
      if (!authed) {
        setFormDisabled(true, 'Bitte anmelden, um Medikamente zu verwalten.');
        if (prompt) {
          showLoginOverlay();
        }
        return false;
      }
      setFormDisabled(false, '');
      return true;
    };

    const startAuthWatch = (onAuthed) => {
      const clearRetry = () => {
        if (medicationState.ui.authRetryTimer) {
          clearTimeout(medicationState.ui.authRetryTimer);
          medicationState.ui.authRetryTimer = null;
        }
      };
      const attempt = async () => {
        const authed = await ensureAuthForUi();
        if (authed) {
          clearRetry();
          onAuthed?.();
          return;
        }
        medicationState.ui.authRetryTimer = setTimeout(attempt, 2000);
      };
      clearRetry();
      attempt();
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!(await ensureAuthForUi({ prompt: true }))) return;
      const ui = medicationState.ui.elements;
      if (form && typeof form.reportValidity === 'function' && !form.reportValidity()) {
        return;
      }
      const slots = validateFormSlots(collectFormSlots());
      const payload = {
        id: ui.id.value || null,
        name: ui.name.value.trim(),
        ingredient: ui.ingredient.value.trim() || null,
        strength: ui.strength.value.trim() || null,
        dose_per_day: getFrequencyValue() === 'custom' ? slots.length : Number(ui.dose.value) || 1,
        start_date: ui.startDate?.value || null,
        slots,
        stock_count: Number(ui.stock.value) || 0,
        low_stock_days: Number(ui.lowStock.value) || 0,
        active: ui.active.checked,
        with_meal: !!ui.withMeal?.checked
      };
      setFormBusy(true);
      updateFormStatus('');
      try {
        await upsertMedication(payload, { reason: 'form:save' });
        clearForm();
        saveFeedback?.ok({
          button: ui.saveBtn,
          statusEl,
          successText: '&#x2705; Medikament gespeichert'
        });
      } catch (err) {
        saveFeedback?.error({
          button: ui.saveBtn,
          statusEl,
          message: err?.message || 'Speichern fehlgeschlagen.'
        });
      } finally {
        setFormBusy(false);
      }
    });

    resetBtn?.addEventListener('click', () => {
      clearForm();
    });

    medicationState.ui.elements.dose?.addEventListener('change', () => {
      syncSlotEditorWithFrequency();
    });

    medicationState.ui.elements.addSlotBtn?.addEventListener('click', () => {
      const currentSlots = collectFormSlots();
      const nextSlotType = inferSlotTypeFromContext({
        index: currentSlots.length,
        slotCount: currentSlots.length + 1
      });
      renderSlotEditor(
        currentSlots.concat({
          label: SLOT_TYPE_LABELS[nextSlotType] || DEFAULT_SLOT_LABELS[currentSlots.length] || `Einnahme ${currentSlots.length + 1}`,
          slot_type: nextSlotType,
          sort_order: currentSlots.length,
          qty: 1
        }),
        { fixed: false }
      );
      if (medicationState.ui.elements.dose) {
        medicationState.ui.elements.dose.value = 'custom';
      }
    });

    medicationState.ui.elements.slots?.addEventListener('click', (event) => {
      const removeBtn = event.target.closest('[data-slot-remove]');
      if (!removeBtn) return;
      const row = removeBtn.closest('[data-slot-row]');
      if (!row) return;
      const nextSlots = collectFormSlots().filter((_, index) => `${index}` !== row.getAttribute('data-slot-row'));
      renderSlotEditor(nextSlots.length ? nextSlots : buildScheduleSlotsFromFrequency(1), {
        fixed: getFrequencyValue() !== 'custom'
      });
    });

    cardList.addEventListener('click', (event) => {
      if (medicationState.ui.disabled) return;
      const target = event.target.closest('[data-med-action]');
      if (!target) return;
      const action = target.getAttribute('data-med-action');
      const id = target.getAttribute('data-med-id');
      if (!id) return;
      const meds = medicationState.cache.get(medicationState.ui.dayIso)?.data?.medications || [];
      const entry = meds.find((item) => item.id === id);
      if (!entry) return;

      const ui = medicationState.ui.elements;
      const currentDayIso = medicationState.ui.dayIso || todayIso();
      const withBusy = async (btn, fn) => {
        if (btn) {
          btn.disabled = true;
          btn.classList.add('busy');
        }
        try {
          await fn();
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.classList.remove('busy');
          }
        }
      };

      if (action === 'edit') {
        ui.id.value = entry.id;
        ui.name.value = entry.name || '';
        ui.ingredient.value = entry.ingredient || '';
        ui.strength.value = entry.strength || '';
        ui.dose.value = getFrequencyPresetValue(entry.slots);
        if (ui.startDate) {
          const firstSlot = Array.isArray(entry.slots) && entry.slots.length ? entry.slots[0] : null;
          ui.startDate.value = firstSlot?.start_date || '';
        }
        ui.stock.value = entry.stock_count ?? 0;
        ui.lowStock.value = entry.low_stock_days ?? 0;
        ui.active.checked = entry.active !== false;
        if (ui.withMeal) ui.withMeal.checked = !!entry.with_meal;
        renderSlotEditor(entry.slots, { fixed: ui.dose.value !== 'custom' });
        ui.name.focus();
        updateFormStatus('Bearbeitung aktiv.');
        return;
      }

      if (action === 'restock') {
        const raw = global.prompt
          ? global.prompt(
              `Bestandsänderung für ${entry.name || 'Medikation'} (z. B. 10 oder -5)`,
              '10'
            )
          : null;
        if (raw === null) return;
        const delta = Number(raw.replace(',', '.'));
        if (!Number.isFinite(delta) || delta === 0) {
          saveFeedback?.error({ statusEl, message: 'Ungültige Menge für Restock.' });
          return;
        }
        return withBusy(target, async () => {
          await adjustStock(id, Math.trunc(delta), {
            reason: 'card:restock',
            dayIso: currentDayIso
          });
          saveFeedback?.ok({
            statusEl,
            successText: `&#x2705; Bestand ${delta > 0 ? '+' : ''}${Math.trunc(delta)} gespeichert`
          });
        });
        return;
      }

      if (action === 'set-stock') {
        const raw = global.prompt
          ? global.prompt(
              `Neuer Bestand für ${entry.name || 'Medikation'}`,
              String(entry.stock_count ?? 0)
            )
          : null;
        if (raw === null) return;
        const value = Number(raw.replace(',', '.'));
        if (!Number.isFinite(value) || value < 0) {
          saveFeedback?.error({ statusEl, message: 'Bestand muss >= 0 sein.' });
          return;
        }
        return withBusy(target, async () => {
          await setStock(id, Math.trunc(value), {
            reason: 'card:set-stock',
            dayIso: currentDayIso
          });
          saveFeedback?.ok({
            statusEl,
            successText: `&#x2705; Bestand auf ${Math.trunc(value)} gesetzt`
          });
        });
        return;
      }

      if (action === 'toggle-active') {
        const nextActive = entry.active === false;
        const confirmed = global.confirm
          ? global.confirm(
              nextActive
                ? `Medikament ${entry.name || ''} reaktivieren?`
                : `Medikament ${entry.name || ''} archivieren?`
            )
          : true;
        if (!confirmed) return;
        return withBusy(target, async () => {
          await setMedicationActive(id, nextActive, {
            dayIso: currentDayIso,
            reason: nextActive ? 'card:reactivate' : 'card:archive'
          });
          saveFeedback?.ok({
            statusEl,
            successText: nextActive ? '&#x2705; Medikament reaktiviert' : '&#x2705; Medikament archiviert'
          });
          if (!nextActive && ui.id.value === id) {
            clearForm();
          }
        });
        return;
      }

      if (action === 'delete') {
        const confirmed = global.confirm
          ? global.confirm(
              `Medikament ${entry.name || ''} dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
            )
          : true;
        if (!confirmed) return;
        return withBusy(target, async () => {
          await deleteMedication(id, { dayIso: currentDayIso, reason: 'card:delete' });
          saveFeedback?.ok({ statusEl, successText: '&#x2705; Medikament geloescht' });
          if (ui.id.value === id) {
            clearForm();
          }
        });
      }
    });

    const renderMedications = (payload) => {
      if (!payload || !Array.isArray(payload.medications) || !payload.medications.length) {
        cardList.innerHTML =
          '<p class="muted small">Keine Medikamente vorhanden. Bitte lege oben ein neues an.</p>';
        cardsMeta.textContent = '0 Medikamente';
        return;
      }
      const nextOrder = syncCardOrder(medicationState.ui.cardOrder, payload.medications);
      medicationState.ui.cardOrder = nextOrder;
      const sortedMeds = sortByCardOrder(payload.medications, nextOrder);
      cardsMeta.textContent = `${sortedMeds.length} Medikamente`;
      cardList.innerHTML = sortedMeds
        .map((med) => {
          const meta = [
            `Bestand: ${med.stock_count ?? 0}`,
            `Plan: ${formatMedicationPlanSummary(med)}`,
            `Low-Stock: ${med.low_stock_days ?? 0}`
          ];
          if (med.with_meal) meta.push('Mit Mahlzeit');
          if (med.runout_day) meta.push(`Aufbrauch: ${med.runout_day}`);
          return `
            <article class="medication-card" data-med-id="${med.id}">
              <div class="medication-card-header">
                <h4>${escapeHtml(med.name || 'Unbenannt')}</h4>
                <span class="badge ${med.active === false ? 'muted' : ''}">${
            med.active === false ? 'Inaktiv' : 'Aktiv'
          }</span>
              </div>
              <div class="medication-card-meta">
                ${meta.map((entry) => `<span>${escapeHtml(entry)}</span>`).join('')}
              </div>
              <p class="medication-card-meta small">
                ${escapeHtml([med.ingredient, med.strength].filter(Boolean).join(' • ') || 'Keine Details')}
              </p>
              <div class="medication-card-actions">
                <button type="button" class="btn ghost small" data-med-action="edit" data-med-id="${med.id}">
                  Bearbeiten
                </button>
                <button type="button" class="btn ghost small" data-med-action="restock" data-med-id="${med.id}">
                  Bestand +/-
                </button>
                <button type="button" class="btn ghost small" data-med-action="set-stock" data-med-id="${med.id}">
                  Bestand setzen
                </button>
                <button type="button" class="btn ghost small" data-med-action="toggle-active" data-med-id="${med.id}">
                  ${med.active === false ? 'Reaktivieren' : 'Archivieren'}
                </button>
                <button type="button" class="btn warn small" data-med-action="delete" data-med-id="${med.id}">
                  Löschen
                </button>
              </div>
            </article>
          `;
        })
        .join('');
    };

    const dayIso = medicationState.ui.dayIso;
    renderSlotEditor(buildScheduleSlotsFromFrequency(1), { fixed: true });
    const cached = getCachedMedicationDay(dayIso);
    if (cached) {
      renderMedications(cached);
    }

    const refreshMedications = async (refreshReason) => {
      try {
        const data = await loadMedicationForDay(dayIso, { reason: refreshReason });
        renderMedications(data);
      } catch (err) {
        if (err?.code === 'medication_not_authenticated') {
          setFormDisabled(true, 'Bitte anmelden, um Medikamente zu verwalten.');
          startAuthWatch(() => refreshMedications('ui-init'));
          return;
        }
        updateFormStatus(err?.message || 'Laden fehlgeschlagen.');
      }
    };

    startAuthWatch(() => refreshMedications('ui-init'));

    doc.addEventListener('medication:changed', (event) => {
      const detail = event?.detail || {};
      const targetDay = detail.dayIso || detail.data?.dayIso || medicationState.ui.dayIso;
      if (targetDay !== medicationState.ui.dayIso) return;
      if (medicationState.ui.disabled) return;
      if (detail.data) {
        renderMedications(detail.data);
        return;
      }
      refreshMedications('ui-sync');
    });
  }

  if (doc) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', initMedicationTabUi, { once: true });
    } else {
      initMedicationTabUi();
    }
  }

  appModules.medication = Object.assign(appModules.medication || {}, {
    loadMedicationForDay,
    invalidateMedicationCache,
    getCachedMedicationDay,
    MEDICATION_REORDER_GUARD_REASONS,
    buildMedicationReorderMailHref,
    getMedicationReorderStartContract,
    getMedicationSlots,
    getOpenMedicationSlots,
    getTakenMedicationSlots,
    confirmMedicationSlot,
    undoMedicationSlot,
    confirmMedicationSection,
    confirmMedication,
    undoMedication,
    upsertMedication,
    adjustStock,
    setStock,
    ackLowStock,
    setMedicationActive,
    deleteMedication,
    _callMedicationRpc: callMedicationRpc
  });
})(typeof window !== 'undefined' ? window : globalThis);
