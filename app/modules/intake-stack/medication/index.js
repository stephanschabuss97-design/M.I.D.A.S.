'use strict';
/**
 * MODULE: medication/index.js
 * Description: Data-access scaffold for the Medication module (Phase B1).
 * Responsibilities:
 *  - Load medication rows for a given day via Supabase RPC (`med_list`)
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
    return {
      id: row.id,
      name: row.name,
      ingredient: row.ingredient,
      strength: row.strength,
      leaflet_url: row.leaflet_url,
      dose_per_day: Number(row.dose_per_day ?? 1) || 1,
      stock_count: Number(row.stock_count ?? 0),
      low_stock_days: Number(row.low_stock_days ?? 0),
      active: row.active !== false,
      days_left: Number.isFinite(row.days_left) ? Number(row.days_left) : null,
      runout_day: row.runout_day || null,
      low_stock: !!row.low_stock,
      taken: !!row.taken,
      taken_at: row.taken_at || null,
      qty: Number(row.qty ?? 0),
      low_stock_ack_day: row.low_stock_ack_day || null,
      low_stock_ack_stock: Number.isFinite(row.low_stock_ack_stock) ? Number(row.low_stock_ack_stock) : null
    };
  };

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
          'med_list',
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

  async function confirmMedication(medId, { dayIso, reason } = {}) {
    const normalizedDay = normalizeDayIso(dayIso);
    if (!medId) throw new Error('confirmMedication requires medId');
    return await mutateAndReload({
      rpc: 'med_confirm_dose',
      payload: { p_med_id: medId, p_day: normalizedDay },
      reason: reason || 'confirm',
      dayIso: normalizedDay
    });
  }

  async function undoMedication(medId, { dayIso, reason } = {}) {
    const normalizedDay = normalizeDayIso(dayIso);
    if (!medId) throw new Error('undoMedication requires medId');
    return await mutateAndReload({
      rpc: 'med_undo_dose',
      payload: { p_med_id: medId, p_day: normalizedDay },
      reason: reason || 'undo',
      dayIso: normalizedDay
    });
  }

  async function upsertMedication(data = {}, { reason } = {}) {
    const payload = {
      p_id: data.id ?? data.p_id ?? null,
      p_name: data.name,
      p_ingredient: data.ingredient ?? null,
      p_strength: data.strength ?? null,
      p_leaflet_url: data.leaflet_url ?? null,
      p_dose_per_day: data.dose_per_day ?? 1,
      p_stock_count: data.stock_count ?? 0,
      p_low_stock_days: data.low_stock_days ?? 7,
      p_active: typeof data.active === 'boolean' ? data.active : true
    };
    const result = await callMedicationRpc('med_upsert', payload, { reason: reason || 'upsert' });
    invalidateMedicationCache();
    emitMedicationChanged({ reason: `mutate:${reason || 'upsert'}`, updated: result });
    return result;
  }

  async function adjustStock(medId, delta, { reason, dayIso } = {}) {
    if (!medId) throw new Error('adjustStock requires medId');
    if (!Number.isFinite(delta) || delta === 0) throw new Error('adjustStock delta must be non-zero');
    const normalizedDay = dayIso ? normalizeDayIso(dayIso) : null;
    const result = await callMedicationRpc(
      'med_adjust_stock',
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
      'med_set_stock',
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
    const result = await callMedicationRpc('med_ack_low_stock', payload, { reason: reason || 'ack' });
    invalidateMedicationCache(normalizedDay);
    await loadMedicationForDay(normalizedDay, { force: true, reason: `mutate:${reason || 'ack'}` });
    emitMedicationChanged({ reason: `mutate:${reason || 'ack'}`, updated: result });
    return result;
  }

  async function setMedicationActive(medId, active, { dayIso, reason } = {}) {
    if (!medId) throw new Error('setMedicationActive requires medId');
    const normalizedDay = dayIso ? normalizeDayIso(dayIso) : null;
    await mutateAndReload({
      rpc: 'med_set_active',
      payload: { p_med_id: medId, p_active: !!active },
      reason: reason || 'setActive',
      dayIso: normalizedDay || todayIso()
    });
  }

  async function deleteMedication(medId, { dayIso, reason } = {}) {
    if (!medId) throw new Error('deleteMedication requires medId');
    const normalizedDay = dayIso ? normalizeDayIso(dayIso) : null;
    await mutateAndReload({
      rpc: 'med_delete',
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
      stock: form.querySelector('#medFormStock'),
      lowStock: form.querySelector('#medFormLowStock'),
      active: form.querySelector('#medFormActive')
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

    const setFormDisabled = (disabled, message) => {
      medicationState.ui.disabled = !!disabled;
      const ui = medicationState.ui.elements;
      const controls = [
        ui.name,
        ui.ingredient,
        ui.strength,
        ui.dose,
        ui.stock,
        ui.lowStock,
        ui.active,
        ui.resetBtn,
        ui.saveBtn
      ].filter(Boolean);
      controls.forEach((el) => {
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
      ui.stock.value = '0';
      ui.lowStock.value = '7';
      ui.active.checked = true;
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
      if (!ui.name.value.trim()) {
        ui.name.focus();
        updateFormStatus('Name ist Pflicht.');
        return;
      }
      const payload = {
        id: ui.id.value || null,
        name: ui.name.value.trim(),
        ingredient: ui.ingredient.value.trim() || null,
        strength: ui.strength.value.trim() || null,
        dose_per_day: Number(ui.dose.value) || 1,
        stock_count: Number(ui.stock.value) || 0,
        low_stock_days: Number(ui.lowStock.value) || 0,
        active: ui.active.checked
      };
      setFormBusy(true);
      updateFormStatus('');
      try {
        await upsertMedication(payload, { reason: 'form:save' });
        clearForm();
        updateFormStatus('Gespeichert.');
      } catch (err) {
        updateFormStatus(err?.message || 'Speichern fehlgeschlagen.');
      } finally {
        setFormBusy(false);
      }
    });

    resetBtn?.addEventListener('click', () => {
      clearForm();
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
        ui.dose.value = entry.dose_per_day ?? 1;
        ui.stock.value = entry.stock_count ?? 0;
        ui.lowStock.value = entry.low_stock_days ?? 0;
        ui.active.checked = entry.active !== false;
        ui.name.focus();
        updateFormStatus('Bearbeitung aktiv.');
        return;
      }

      if (action === 'restock') {
        const raw = global.prompt
          ? global.prompt(
              `Bestandsaenderung fuer ${entry.name || 'Medikation'} (z. B. 10 oder -5)`,
              '10'
            )
          : null;
        if (raw === null) return;
        const delta = Number(raw.replace(',', '.'));
        if (!Number.isFinite(delta) || delta === 0) {
          updateFormStatus('Ungueltige Menge fuer Restock.');
          return;
        }
        return withBusy(target, async () => {
          await adjustStock(id, Math.trunc(delta), {
            reason: 'card:restock',
            dayIso: currentDayIso
          });
          updateFormStatus(
            `Bestand ${delta > 0 ? '+' : ''}${Math.trunc(delta)} gespeichert.`
          );
        });
        return;
      }

      if (action === 'set-stock') {
        const raw = global.prompt
          ? global.prompt(
              `Neuer Bestand fuer ${entry.name || 'Medikation'}`,
              String(entry.stock_count ?? 0)
            )
          : null;
        if (raw === null) return;
        const value = Number(raw.replace(',', '.'));
        if (!Number.isFinite(value) || value < 0) {
          updateFormStatus('Bestand muss >= 0 sein.');
          return;
        }
        return withBusy(target, async () => {
          await setStock(id, Math.trunc(value), {
            reason: 'card:set-stock',
            dayIso: currentDayIso
          });
          updateFormStatus(`Bestand auf ${Math.trunc(value)} gesetzt.`);
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
          updateFormStatus(
            nextActive ? 'Medikament reaktiviert.' : 'Medikament archiviert.'
          );
          if (!nextActive && ui.id.value === id) {
            clearForm();
          }
        });
        return;
      }

      if (action === 'delete') {
        const confirmed = global.confirm
          ? global.confirm(
              `Medikament ${entry.name || ''} dauerhaft löschen? Diese Aktion kann nicht rueckgaengig gemacht werden.`
            )
          : true;
        if (!confirmed) return;
        return withBusy(target, async () => {
          await deleteMedication(id, { dayIso: currentDayIso, reason: 'card:delete' });
          updateFormStatus('Medikament geloescht.');
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
            `Dose/Tag: ${med.dose_per_day ?? 1}`,
            `Low-Stock: ${med.low_stock_days ?? 0}`
          ];
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
