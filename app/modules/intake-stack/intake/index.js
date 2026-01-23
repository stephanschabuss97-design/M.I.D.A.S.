'use strict';
/**
 * MODULE: intake/index.js
 * Description: UI-Orchestrierung der Tageserfassung (Intake) inkl. Statusanzeigen, Trendpilot-Pills und Timer.
 * Submodules:
 *  - capture state toggles (`setCaptureIntakeDisabled`, `clearCaptureIntakeInputs`)
 *  - day boundary helpers (`scheduleMidnightRefresh`, `maybeResetIntakeForToday`, `scheduleNoonSwitch`)
 *  - KPI/Header renderer (`prepareIntakeStatusHeader`, `updateCaptureIntakeStatus`, `refreshCaptureIntake`)
 *  - save handlers (`handleCaptureIntake`, `bindIntakeCapture`)
 * Notes:
 *  - Läuft weiterhin im Legacy-IIFE, exponiert API über `window.AppModules.capture`.
 *  - Refactor-Kandidaten (`refreshCaptureIntake`, `bindIntakeCapture`) behalten ihre @extract Marker.
 */
(function(global){
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const getSupabaseApi = () => global.AppModules?.supabase || {};
  const getSupabaseState = () => getSupabaseApi().supabaseState || null;
  const getAuthState = () => getSupabaseState()?.authState || 'unauth';
  const isAuthReady = () => getAuthState() !== 'unknown';
  const wasRecentlyLoggedIn = () => Boolean(getSupabaseState()?.lastLoggedIn);
  const isHandlerStageReady = () => {
    const bootFlow = global.AppModules?.bootFlow;
    if (!bootFlow?.isStageAtLeast) return isAuthReady();
    return bootFlow.isStageAtLeast('INIT_MODULES') && isAuthReady();
  };

  const MAX_WATER_ML = 6000;
  const MAX_SALT_G = 30;
  const MAX_PROTEIN_G = 300;
  const roundValue = (key, value) => {
    if (key === 'water_ml') {
      return Math.round(value);
    }
    return Math.round(value * 100) / 100;
  };
  const escapeAttr = (value = '') =>
    String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch));
  const TREND_PILOT_SEVERITY_META = {
    warning: { cls: 'warn', shortLabel: 'Warnung', longLabel: 'Trendpilot (Warnung)' },
    critical: { cls: 'bad', shortLabel: 'Kritisch', longLabel: 'Trendpilot (kritisch)' }
  };
  const medicationDailyState = {
    initialized: false,
    listEl: null,
    lowStockEl: null,
    refreshBtn: null,
    dayIso: null,
    data: null,
    authRetryTimer: null,
    doctorWarnedMissing: false,
    lastLowStockCount: null,
    cardOrder: [],
    selection: new Set(),
    selectionDirty: false,
    busy: false,
    elements: {}
  };
  let latestTrendpilotEntry = null;
  let trendpilotHookBound = false;
  const getTrendpilotSeverityMeta = (severity) => {
    if (!severity) return null;
    return TREND_PILOT_SEVERITY_META[severity] || null;
  };
  const escapeHtml = (value = '') => escapeAttr(value || '');
  const captureRefreshLogInflight = new Map();
  const captureRefreshKey = (reason, dayIso) =>
    `${reason || 'manual'}|${dayIso || 'unknown'}`;
  const logCaptureRefreshStart = (reason, dayIso) => {
    const key = captureRefreshKey(reason, dayIso);
    const entry = captureRefreshLogInflight.get(key);
    if (entry) {
      entry.count += 1;
      return key;
    }
    captureRefreshLogInflight.set(key, { count: 1 });
    diag.add?.(`[capture] refresh start reason=${reason} day=${dayIso}`);
    return key;
  };
  const logCaptureRefreshEnd = (reason, dayIso, status = 'done', detail, severity) => {
    const key = captureRefreshKey(reason, dayIso);
    const entry = captureRefreshLogInflight.get(key);
    captureRefreshLogInflight.delete(key);
    const count = entry?.count || 1;
    const suffix = count > 1 ? ` (x${count})` : '';
    const extra = detail ? ` – ${detail}` : '';
    const opts = severity ? { severity } : undefined;
    diag.add?.(
      `[capture] refresh ${status} reason=${reason} day=${dayIso}${extra}${suffix}`,
      opts
    );
  };

  const formatTrendpilotDay = (dayIso) => {
    if (!dayIso) return '';
    const date = new Date(`${dayIso}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return dayIso;
    return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const setLatestTrendpilotEntry = (entry) => {
    if (entry && entry.metric && entry.metric !== 'bp') {
      latestTrendpilotEntry = null;
      return;
    }
    latestTrendpilotEntry = entry && entry.severity ? entry : null;
  };

  const getMedicationModule = () => global.AppModules?.medication || null;
  const getProfileModule = () => global.AppModules?.profile || null;

  const getPrimaryDoctorInfo = () => {
    try {
      const profileMod = getProfileModule();
      if (!profileMod || typeof profileMod.getData !== 'function') return null;
      const data = profileMod.getData();
      if (!data) return null;
      const email = data.primary_doctor_email || data.primaryDoctorEmail || '';
      const name = data.primary_doctor_name || data.primaryDoctorName || '';
      if (!email && !name) return null;
      return {
        email: email || '',
        name: name || ''
      };
    } catch (_) {
      return null;
    }
  };

  const buildLowStockMailHref = (doctorInfo, med) => {
    if (!doctorInfo?.email || !med) return null;
    const medName = med.name || 'Medikation';
    const dayIso = medicationDailyState.dayIso || todayStr();
    const subject = `Low-Stock Hinweis: ${medName}`;
    const bodyLines = [
      'Hallo,',
      '',
      `mein Medikament ${medName} ist fast aufgebraucht.`,
      `Bestand: ${med.stock_count ?? '?'} Stück (${med.days_left ?? '?'} Tage).`,
      `Dosis pro Tag: ${med.dose_per_day ?? '?'} Stück`,
      `Tag: ${dayIso}`,
      '',
      'Bitte um neues Rezept bzw. Rückmeldung.',
      '',
      'Vielen Dank.'
    ];
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    return `mailto:${encodeURIComponent(doctorInfo.email)}?${query}`;
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

  const getActiveMedicationRows = (data) =>
    Array.isArray(data?.medications)
      ? data.medications.filter((med) => med && med.active !== false)
      : [];

  const getOpenMedicationRows = (data) =>
    getActiveMedicationRows(data).filter((med) => !med.taken);

  const getOpenMedicationIds = (data) =>
    getOpenMedicationRows(data).map((med) => med.id).filter(Boolean);

  const syncMedicationSelection = (data, { reset = false } = {}) => {
    const openIds = getOpenMedicationIds(data);
    const openSet = new Set(openIds);
    let nextSelection = new Set();
    if (!reset && medicationDailyState.selectionDirty) {
      medicationDailyState.selection.forEach((id) => {
        if (openSet.has(id)) nextSelection.add(id);
      });
    } else {
      openIds.forEach((id) => nextSelection.add(id));
    }
    medicationDailyState.selection = nextSelection;
    if (reset) {
      medicationDailyState.selectionDirty = false;
    }
  };

  const getSelectedOpenIds = (data) => {
    const openSet = new Set(getOpenMedicationIds(data));
    return Array.from(medicationDailyState.selection).filter((id) => openSet.has(id));
  };

  const updateMedicationBatchFooter = () => {
      const ui = medicationDailyState.elements;
      if (!ui?.footer) return;
      const data = medicationDailyState.data;
      const activeRows = getActiveMedicationRows(data);
      const openIds = getOpenMedicationIds(data);
      const selectedIds = getSelectedOpenIds(data);
      const selectedCount = selectedIds.length;
      const hasOpen = openIds.length > 0;
      const showFooter = activeRows.length && hasOpen;

      ui.footer.hidden = !showFooter;
      if (ui.actions) {
        ui.actions.hidden = !hasOpen;
      }
      if (ui.confirmBtn) {
        ui.confirmBtn.textContent = `Auswahl bestaetigen (${selectedCount})`;
        ui.confirmBtn.disabled = medicationDailyState.busy || selectedCount === 0;
      }
      if (!activeRows.length) {
        ui.footer.hidden = true;
      }
    };

  function initMedicationDailyUi() {
    if (medicationDailyState.initialized) return;
    const doc = global.document;
    if (!doc) return;
    const listEl = doc.getElementById('medDailyList');
    if (!listEl) return;
    medicationDailyState.listEl = listEl;
    medicationDailyState.lowStockEl = doc.getElementById('medLowStockBox');
    medicationDailyState.refreshBtn = doc.getElementById('medDailyRefreshBtn');
    medicationDailyState.elements = {
      footer: doc.getElementById('medicationBatchFooter'),
      actions: doc.getElementById('medicationBatchActions'),
      confirmBtn: doc.getElementById('medBatchConfirmBtn')
    };
    medicationDailyState.initialized = true;

    listEl.addEventListener('change', (event) => {
      const checkbox = event.target.closest('[data-med-select]');
      if (!checkbox) return;
      event.preventDefault();
      handleMedicationSelectionToggle(checkbox);
    });

    listEl.addEventListener('click', (event) => {
      const statusBtn = event.target.closest('[data-med-status-id]');
      if (statusBtn) {
        event.preventDefault();
        handleMedicationStatusToggle(statusBtn);
        return;
      }
      const card = event.target.closest('.medication-card');
      if (!card) return;
      if (event.target.closest('button, a, input, label')) return;
      handleMedicationCardClick(card);
    });

    medicationDailyState.lowStockEl?.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-med-ack]');
      if (!btn) return;
      event.preventDefault();
      handleLowStockAck(btn);
    });

    medicationDailyState.refreshBtn?.addEventListener('click', () => {
      if (medicationDailyState.dayIso) {
        refreshMedicationDaily({ dayIso: medicationDailyState.dayIso, reason: 'manual', force: true });
      }
    });

    medicationDailyState.elements.confirmBtn?.addEventListener('click', () => {
      handleMedicationBatchConfirm();
    });

    doc.addEventListener('medication:changed', (event) => {
      const detail = event?.detail || {};
      const payload = detail.data;
      const dayIso = payload?.dayIso || detail.dayIso;
      if (!dayIso || dayIso !== medicationDailyState.dayIso) return;
      if (payload) {
        medicationDailyState.data = payload;
        renderMedicationDaily(payload);
      } else {
        refreshMedicationDaily({ dayIso, reason: 'event', force: true }).catch(() => {});
      }
    });

    doc.addEventListener('profile:changed', () => {
      if (medicationDailyState.data) {
        renderMedicationLowStock(medicationDailyState.data);
      }
    });
  }

  function renderMedicationDailyPlaceholder(message) {
    initMedicationDailyUi();
    const listEl = medicationDailyState.listEl;
    const effectiveMessage = message || 'Keine Daten vorhanden.';
    if (listEl) {
      listEl.innerHTML = `<p class="muted small">${escapeHtml(effectiveMessage)}</p>`;
    }
    medicationDailyState.selection = new Set();
    medicationDailyState.selectionDirty = false;
    updateMedicationBatchFooter();
    diag.add?.(
      `[capture:med] placeholder day=${medicationDailyState.dayIso || 'n/a'} msg="${effectiveMessage}"`
    );
    if (medicationDailyState.lowStockEl) {
      medicationDailyState.lowStockEl.hidden = true;
      medicationDailyState.lowStockEl.innerHTML = '';
      medicationDailyState.lastLowStockCount = null;
    }
  }

  function renderMedicationLowStock(data) {
    const box = medicationDailyState.lowStockEl;
    if (!box) return;
    const meds = Array.isArray(data?.medications) ? data.medications.filter((med) => med.low_stock) : [];
    if (!meds.length) {
      if (medicationDailyState.lastLowStockCount) {
        diag.add?.(`[capture:med] low-stock cleared day=${medicationDailyState.dayIso || 'n/a'}`);
      }
      medicationDailyState.lastLowStockCount = 0;
      box.hidden = true;
      box.innerHTML = '';
      return;
    }
    if (medicationDailyState.lastLowStockCount !== meds.length) {
      diag.add?.(
        `[capture:med] low-stock count=${meds.length} day=${medicationDailyState.dayIso || 'n/a'}`
      );
      medicationDailyState.lastLowStockCount = meds.length;
    }
    const doctorInfo = getPrimaryDoctorInfo();
    if (!doctorInfo?.email && !medicationDailyState.doctorWarnedMissing) {
      diag.add?.('[capture:med] doctor email missing for low-stock contact');
      medicationDailyState.doctorWarnedMissing = true;
    } else if (doctorInfo?.email && medicationDailyState.doctorWarnedMissing) {
      diag.add?.('[capture:med] doctor email restored for low-stock contact');
      medicationDailyState.doctorWarnedMissing = false;
    }
    const doctorLine = doctorInfo?.email
      ? `<p class="medication-low-stock-contact small">Arzt: ${escapeHtml(
          doctorInfo.name ? `${doctorInfo.name} (${doctorInfo.email})` : doctorInfo.email
        )}</p>`
      : '<p class="medication-low-stock-contact small muted">Keine Arzt-Mail im Profil hinterlegt.</p>';
    const listHtml = meds
      .map((med) => {
        const mailHref = doctorInfo?.email ? buildLowStockMailHref(doctorInfo, med) : null;
        const mailAction = mailHref
          ? `<a class="btn ghost small" href="${escapeAttr(mailHref)}" target="_blank" rel="noopener" data-med-mail="${escapeAttr(
              med.id || ''
            )}">Arzt-Mail</a>`
          : '<small class="muted small">Mailkontakt fehlt</small>';
        const ackBtn = `<button type="button" class="btn ghost small" data-med-ack="${escapeAttr(
          med.id || ''
        )}" data-med-stock="${escapeAttr(String(med.stock_count ?? 0))}">Erledigt</button>`;
        return `
        <div class="low-stock-item">
          <div>
            <div>${escapeHtml(med.name || 'Medikation')}</div>
            <small>Noch ${med.stock_count ?? 0} Stk. (${med.days_left ?? '?'} Tage)</small>
          </div>
          <div class="medication-low-stock-actions">
            ${mailAction}
            ${ackBtn}
          </div>
        </div>`;
      })
      .join('');
    box.hidden = false;
    box.innerHTML = `
      <strong>Niedriger Bestand</strong>
      ${doctorLine}
      ${listHtml}
    `;
  }

  function renderMedicationDaily(data) {
    initMedicationDailyUi();
    const listEl = medicationDailyState.listEl;
    if (!listEl) return;
    const meds = getActiveMedicationRows(data);
    if (!meds.length) {
      listEl.innerHTML = '<p class="muted small">Keine aktiven Medikamente für diesen Tag.</p>';
      renderMedicationLowStock(data);
      medicationDailyState.selection = new Set();
      medicationDailyState.selectionDirty = false;
      updateMedicationBatchFooter();
      return;
    }
    syncMedicationSelection(data);
    const nextOrder = syncCardOrder(medicationDailyState.cardOrder, meds);
    medicationDailyState.cardOrder = nextOrder;
    const sortedMeds = sortByCardOrder(meds, nextOrder);
    const selectedIds = new Set(getSelectedOpenIds(data));
    const items = sortedMeds
      .map((med) => {
        const daysLeft = Number.isFinite(med.days_left) ? `${med.days_left} Tage übrig` : '';
        const statusText = daysLeft || '';
        const detailText = [med.ingredient, med.strength].filter(Boolean).join(' - ');
        const medId = med.id || '';
        const isTaken = !!med.taken;
        const isSelected = selectedIds.has(medId);
        const isDisabled = medicationDailyState.busy || isTaken;
        const checkLabel = isTaken ? 'Bereits genommen' : 'Auswählen';
        return `
            <article class="medication-card ${med.low_stock ? 'is-low' : ''} ${isTaken ? 'is-taken' : ''} ${isSelected ? 'is-selected' : ''}" data-med-id="${escapeAttr(medId)}">
              <div class="medication-card-header">
                <label class="medication-card-select">
                  <input
                    type="checkbox"
                    data-med-select="${escapeAttr(medId)}"
                    ${isTaken ? 'checked' : isSelected ? 'checked' : ''}
                    ${isDisabled ? 'disabled' : ''}
                    aria-label="${escapeAttr(`Medikation auswählen: ${med.name || 'Medikation'}`)}"
                  >
                  <span class="sr-only">${escapeHtml(checkLabel)}</span>
                </label>
                <div class="medication-card-title-wrap">
                  <h4 class="medication-card-title">${escapeHtml(med.name || 'Medikation')}</h4>
                  ${statusText ? `<span class="medication-card-status">${escapeHtml(statusText)}</span>` : ''}
                </div>
                <button
                  type="button"
                  class="medication-card-status-slot status-glow ${isTaken ? 'ok' : 'neutral'}"
                  data-med-status-slot
                  data-med-status-id="${escapeAttr(medId)}"
                  aria-label="${escapeAttr(isTaken ? 'Einnahme zuruecknehmen' : 'Einnahme bestaetigen')}"
                >
                  <svg class="medication-status-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            ${detailText ? `<p class="medication-card-meta small">${escapeHtml(detailText)}</p>` : ''}
          </article>
        `;
      })
      .join('');
    listEl.innerHTML = items;
    renderMedicationLowStock(data);
    updateMedicationBatchFooter();
  }

  function handleMedicationSelectionToggle(checkbox) {
    if (!checkbox || checkbox.disabled) return;
    const medId = checkbox.getAttribute('data-med-select');
    if (!medId) return;
    const card = checkbox.closest('.medication-card');
    if (checkbox.checked) {
      medicationDailyState.selection.add(medId);
      card?.classList.add('is-selected');
    } else {
      medicationDailyState.selection.delete(medId);
      card?.classList.remove('is-selected');
    }
    medicationDailyState.selectionDirty = true;
    updateMedicationBatchFooter();
  }

  function handleMedicationCardClick(card) {
    if (!card || medicationDailyState.busy) return;
    const medId = card.getAttribute('data-med-id');
    if (!medId) return;
    const checkbox = card.querySelector('[data-med-select]');
    if (!checkbox || checkbox.disabled) return;
    checkbox.checked = !checkbox.checked;
    handleMedicationSelectionToggle(checkbox);
  }

  async function handleMedicationBatchConfirm() {
    if (!captureIntakeState.logged) {
      uiError('Bitte anmelden, um Medikamente zu bestätigen.');
      return;
    }
    const medModule = getMedicationModule();
    if (!medModule) {
      uiError('Medikationsmodul nicht verfügbar.');
      return;
    }
    const data = medicationDailyState.data;
    const selectedIds = getSelectedOpenIds(data);
    if (!selectedIds.length) return;

    const dayIso = medicationDailyState.dayIso || document.getElementById('date')?.value || todayStr();
    const panel = document.getElementById('cap-intake-wrap');
    const triggerBtn = medicationDailyState.elements.confirmBtn;

    medicationDailyState.busy = true;
    updateMedicationBatchFooter();
    saveFeedback?.start({ button: triggerBtn, panel });
    try {
      await Promise.all(
        selectedIds.map((medId) =>
          medModule.confirmMedication(medId, { dayIso, reason: 'capture-batch' })
        )
      );
      medicationDailyState.selectionDirty = false;
      saveFeedback?.ok({ button: triggerBtn, panel, successText: '&#x2705; Tabletten gespeichert' });
      if (typeof medModule.invalidateMedicationCache === 'function') {
        medModule.invalidateMedicationCache(dayIso);
      }
      await refreshMedicationDaily({ dayIso, reason: 'batch', force: true });
    } catch (err) {
      saveFeedback?.error({
        button: triggerBtn,
        panel,
        message: err?.message || 'Speichern fehlgeschlagen.'
      });
      uiError(err?.message || 'Speichern fehlgeschlagen.');
      diag.add?.(`[capture:med] batch error ${err?.message || err}`);
    } finally {
      medicationDailyState.busy = false;
      updateMedicationBatchFooter();
    }
  }


  async function handleMedicationStatusToggle(btn) {
    if (!btn || medicationDailyState.busy) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      uiError('Medikationsmodul nicht verfuegbar.');
      return;
    }
    if (!captureIntakeState.logged) {
      uiError('Bitte anmelden, um Medikamente zu bestaetigen.');
      return;
    }
    const medId = btn.getAttribute('data-med-status-id');
    if (!medId) return;
    const dayIso = medicationDailyState.dayIso || document.getElementById('date')?.value || todayStr();
    const isTaken = btn.classList.contains('ok');
    withBusy(btn, true);
    try {
      if (isTaken) {
        await medModule.undoMedication(medId, { dayIso, reason: 'capture-status-toggle' });
        uiInfo('Einnahme zurueckgenommen.');
      } else {
        await medModule.confirmMedication(medId, { dayIso, reason: 'capture-status-toggle' });
        uiInfo('Einnahme bestaetigt.');
      }
      if (typeof medModule.invalidateMedicationCache === 'function') {
        medModule.invalidateMedicationCache(dayIso);
      }
      await refreshMedicationDaily({ dayIso, reason: 'status-toggle', force: true });
    } catch (err) {
      uiError(err?.message || 'Aktion fehlgeschlagen.');
      diag.add?.(`[capture:med] status toggle error med=${medId} ${err?.message || err}`);
    } finally {
      withBusy(btn, false);
    }
  }

  async function handleLowStockAck(btn) {
    if (!btn || btn.disabled) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      uiError('Medikationsmodul nicht verfügbar.');
      return;
    }
    if (!captureIntakeState.logged) {
      uiError('Bitte anmelden, um Hinweise zu bestätigen.');
      return;
    }
    const medId = btn.getAttribute('data-med-ack');
    if (!medId) return;
    const stock = Number(btn.getAttribute('data-med-stock')) || 0;
    const dayIso = medicationDailyState.dayIso || document.getElementById('date')?.value || todayStr();
    withBusy(btn, true);
    try {
      await medModule.ackLowStock(medId, { dayIso, stockSnapshot: stock, reason: 'capture-low-stock' });
      uiInfo('Hinweis ausgeblendet.');
      diag.add?.(`[capture:med] low-stock ack med=${medId} stock=${stock} day=${dayIso}`);
      await refreshMedicationDaily({ dayIso, reason: 'ack', force: true });
    } catch (err) {
      uiError(err?.message || 'Ack fehlgeschlagen.');
      diag.add?.(`[capture:med] low-stock ack error med=${medId} ${err?.message || err}`);
    } finally {
      withBusy(btn, false);
    }
  }

  async function refreshMedicationDaily({ dayIso, reason = 'auto', force = false } = {}) {
    if (!isHandlerStageReady()) return;
    initMedicationDailyUi();
    const listEl = medicationDailyState.listEl;
    if (!listEl) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      renderMedicationDailyPlaceholder('Medikationsmodul noch nicht aktiv.');
      return;
    }
    const nextDayIso = dayIso || todayStr();
    const dayChanged = medicationDailyState.dayIso && medicationDailyState.dayIso !== nextDayIso;
    medicationDailyState.dayIso = nextDayIso;
    if (dayChanged) {
      medicationDailyState.selectionDirty = false;
    }
    if (!captureIntakeState.logged) {
      renderMedicationDailyPlaceholder('Bitte anmelden, um Medikamente zu verwalten.');
      return;
    }
    diag.add?.(
      `[capture:med] refresh start day=${medicationDailyState.dayIso} reason=${reason} force=${force}`
    );
    if (!force && medicationDailyState.data && medicationDailyState.data.dayIso === medicationDailyState.dayIso) {
      renderMedicationDaily(medicationDailyState.data);
      return;
    }
    listEl.innerHTML = '<p class="muted small">Medikamente werden geladen …</p>';
    try {
      const data = await medModule.loadMedicationForDay(medicationDailyState.dayIso, { reason: `capture:${reason}` });
      medicationDailyState.data = data;
      renderMedicationDaily(data);
      const count = Array.isArray(data?.medications) ? data.medications.length : 0;
      diag.add?.(`[capture:med] refresh ok day=${medicationDailyState.dayIso} count=${count}`);
    } catch (err) {
      if (err?.code === 'medication_not_authenticated') {
        renderMedicationDailyPlaceholder('Bitte anmelden, um Medikamente zu verwalten.');
        diag.add?.('[capture:med] refresh blocked not authenticated');
        return;
      }
      listEl.innerHTML = `<p class="muted small">${escapeHtml(err?.message || 'Laden fehlgeschlagen.')}</p>`;
      diag.add?.(`[capture:med] refresh error ${err?.message || err}`);
    }
  }

  
  function clearFieldError(el){
    if (!el) return;
    el.style.outline = '';
    el.removeAttribute('aria-invalid');
  }

  function setFieldError(el){
    if (!el) return;
    el.style.outline = '2px solid var(--danger)';
    el.setAttribute('aria-invalid','true');
  }

  function prepareIntakeStatusHeader(){
    try {
      const wrap = document.getElementById('capturePillsRow');
      if (!wrap) return;
      const hasSlots = document.querySelector('[data-pill-kind]');
      if (hasSlots) {
        wrap.style.display = 'none';
        return;
      }

      wrap.style.gap = '8px';
      wrap.style.flexWrap = 'wrap';
      wrap.style.alignItems = 'center';

      let top = document.getElementById('cap-intake-status-top');
      if (!top) {
        top = document.createElement('div');
        top.id = 'cap-intake-status-top';
        top.className = 'small';
        top.style.opacity = '.8';
        top.setAttribute('role','group');
        top.setAttribute('aria-live','polite');
        top.setAttribute('tabindex','0');
      }

      if (top) {
        top.setAttribute('role','group');
        top.setAttribute('aria-live','polite');
        top.setAttribute('tabindex','0');
        top.style.display = 'flex';
        top.style.gap = '8px';
        top.style.flexWrap = 'wrap';
        top.style.alignItems = 'center';
      }

      if (wrap && top && !top.parentElement) {
        wrap.appendChild(top);
      }
    } catch(_) {}
  }

  const updateCaptureIntakeStatus = (typeof debounce === 'function' ? debounce : (fn) => fn)(function(){
    const startedAt = (typeof performance !== "undefined" && typeof performance.now === "function") ? performance.now() : null;
    try {
      const statusEl = document.getElementById('cap-intake-status');
      let statusTop = document.getElementById('cap-intake-status-top');
      const slotWater = document.querySelector('[data-pill-kind="water"]');
      const slotSalt = document.querySelector('[data-pill-kind="salt"]');
      const slotProtein = document.querySelector('[data-pill-kind="protein"]');
      const hasSlots = !!(slotWater || slotSalt || slotProtein);

      if (!statusEl && !statusTop && !hasSlots) return;

      if (!statusTop && !hasSlots) {
        prepareIntakeStatusHeader();
        statusTop = document.getElementById('cap-intake-status-top');
      }

      const clearSlots = () => {
        if (slotWater) slotWater.innerHTML = '';
        if (slotSalt) slotSalt.innerHTML = '';
        if (slotProtein) slotProtein.innerHTML = '';
      };

      if (!captureIntakeState.logged){
        if (statusEl) {
          statusEl.textContent = 'Bitte anmelden, um Intake zu erfassen.';
          statusEl.style.display = '';
        }
        if (statusTop) {
          statusTop.innerHTML = '';
          statusTop.style.display = 'none';
          statusTop.setAttribute('aria-label', 'Tagesaufnahme: Bitte anmelden, um Intake zu erfassen.');
        }
        if (hasSlots) {
          clearSlots();
        }
        return;
      }

      const t = captureIntakeState.totals || {};
      const waterVal = Math.round(t.water_ml || 0);
      const saltVal = Number(t.salt_g || 0);
      const proteinVal = Number(t.protein_g || 0);

      const waterRatio = LS_WATER_GOAL ? waterVal / LS_WATER_GOAL : 0;
      const waterCls = waterRatio >= 0.9 ? 'ok' : (waterRatio >= 0.5 ? 'warn' : 'bad');
      const saltCls = saltVal > LS_SALT_MAX ? 'bad' : (saltVal >= 5 ? 'warn' : 'ok');
      const proteinCls = (proteinVal >= 78 && proteinVal <= LS_PROTEIN_GOAL) ? 'ok' : (proteinVal > LS_PROTEIN_GOAL ? 'bad' : 'warn');

      const describe = (cls) => ({
        ok: 'Zielbereich',
        warn: 'Warnung',
        bad: 'kritisch',
        neutral: 'neutral'
      }[cls] || 'unbekannt');

      const pills = [
        { key: 'water', cls: waterCls, label: 'Wasser', value: `${waterVal} ml` },
        { key: 'salt', cls: saltCls, label: 'Salz', value: `${fmtDE(saltVal,1)} g` },
        { key: 'protein', cls: proteinCls, label: 'Protein', value: `${fmtDE(proteinVal,1)} g` },
      ];

      const buildPill = (p) => {
        const statusText = describe(p.cls);
        const aria = `${p.label}: ${p.value}, Status: ${statusText}`;
      return `<span class="pill ${p.cls}" role="status" aria-label="${aria}">${p.label}: ${p.value}</span>`;
      };

      if (hasSlots) {
        if (slotWater) slotWater.innerHTML = buildPill(pills[0]);
        if (slotSalt) slotSalt.innerHTML = buildPill(pills[1]);
        if (slotProtein) slotProtein.innerHTML = buildPill(pills[2]);
        if (statusEl) {
          statusEl.innerHTML = '';
          statusEl.style.display = 'none';
        }
        if (statusTop) {
          statusTop.innerHTML = '';
          statusTop.style.display = 'none';
        }
        return;
      }

      const summary = pills.map(p => `${p.label} ${p.value} (${describe(p.cls)})`).join(', ');
      const html = pills.map(buildPill).join(' ');

      if (statusEl) {
        statusEl.innerHTML = '';
        statusEl.style.display = 'none';
      }
      if (statusTop) {
        statusTop.innerHTML = html;
        statusTop.style.display = 'flex';
        statusTop.setAttribute('aria-label', `Tagesaufnahme: ${summary}`);
      }
    } finally {
      recordPerfStat?.('header_intake', startedAt);
    }
  }, 150);

  function millisUntilNextMidnight(){
    try {
      const now = new Date();
      const next = new Date(now);
      next.setHours(0, 0, 10, 0);
      next.setDate(next.getDate() + 1);
      const diff = next.getTime() - now.getTime();
      return Number.isNaN(diff) ? 3600_000 : Math.max(1000, diff);
    } catch {
      return 3600_000;
    }
  }

  async function handleMidnightRefresh(){
    AppModules.captureGlobals.setMidnightTimer(null);
    try {
      await maybeRefreshForTodayChange({ force: true, source: 'midnight' });
    } finally {
      scheduleMidnightRefresh();
    }
  }

  function scheduleMidnightRefresh(){
    try {
      const timer = AppModules.captureGlobals.getMidnightTimer();
      if (timer) clearTimeout(timer);
      const delay = millisUntilNextMidnight();
      AppModules.captureGlobals.setMidnightTimer(setTimeout(handleMidnightRefresh, delay));
    } catch (_) { /* noop */ }
  }

  async function maybeResetIntakeForToday(todayIso){
    try {
      const last = AppModules.captureGlobals.getIntakeResetDoneFor();
      if (last === todayIso) return;
    } catch (_) { /* noop */ }

    const sleep = AppModules.captureGlobals?.sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));
    const loadTotalsWithRetry = async (uid) => {
      let attempt = 0;
      let lastErr = null;
      while (attempt < 3) {
        try {
          return await loadIntakeToday({ user_id: uid, dayIso: todayIso });
        } catch (err) {
          lastErr = err;
          diag.add?.(`[capture] reset intake lookup failed (attempt ${attempt + 1}): ${err?.message || err}`);
          attempt += 1;
          if (attempt < 3) {
            await sleep(250 * attempt);
          }
        }
      }
      throw lastErr;
    };

    let guardSet = false;
    try {
      const logged = await isLoggedInFast?.();
      if (!logged) return;
      const uid = await getUserId?.();
      if (!uid) return;

      const existing = await loadTotalsWithRetry(uid);
      const hasTotals = !!(existing && (
        Number(existing.water_ml || 0) > 0 ||
        Number(existing.salt_g || 0) > 0 ||
        Number(existing.protein_g || 0) > 0
      ));

      if (hasTotals) {
        diag.add?.(`[capture] reset intake skip day=${todayIso} (existing totals)`);
        guardSet = true;
      } else {
        diag.add?.(`[capture] reset intake start day=${todayIso}`);
        const zeros = { water_ml: 0, salt_g: 0, protein_g: 0 };
        await saveIntakeTotalsRpc({ dayIso: todayIso, totals: zeros });
        diag.add?.('[capture] reset intake ok');
        guardSet = true;
      }
    } catch (e) {
      const message = e?.message || e;
      diag.add?.('[capture] reset intake error: ' + message);
      uiError?.('Intake konnte nicht automatisch zurückgesetzt werden. Bitte erneut versuchen.');
      throw e;
    } finally {
      if (guardSet) {
        AppModules.captureGlobals.setIntakeResetDoneFor(todayIso);
        try { window?.localStorage?.setItem(LS_INTAKE_RESET_DONE_KEY, todayIso); } catch(_) {}
        try { window.AppModules.capture?.refreshCaptureIntake?.('auto:intake-reset'); } catch(_) {}
      }
    }
  }

  function scheduleNoonSwitch(){
    try {
      const timer = AppModules.captureGlobals.getNoonTimer();
      if (timer) clearTimeout(timer);
      const now = new Date();
      const noon = new Date(now);
      noon.setHours(12, 0, 5, 0);
      if (noon.getTime() <= now.getTime()) {
        noon.setDate(noon.getDate() + 1);
      }
      const delay = Math.max(1000, noon.getTime() - now.getTime());
      AppModules.captureGlobals.setNoonTimer(setTimeout(async () => {
        try {
          AppModules.captureGlobals.setBpUserOverride(false);
          await maybeRefreshForTodayChange({ force: true, source: 'noon-switch' });
        } catch (_) { /* noop */ }
      }, delay));
    } catch (_) { /* noop */ }
  }

  async function maybeRefreshForTodayChange({ force = false, source = '' } = {}){
    const todayIso = todayStr();
    const dateEl = document.getElementById('date');
    const selected = dateEl?.value || '';
    const todayChanged = AppModules.captureGlobals.getLastKnownToday() !== todayIso;
    if (!force && !todayChanged) return;

    const userPinnedOtherDay = AppModules.captureGlobals.getDateUserSelected() && selected && selected !== todayIso;
    if (!userPinnedOtherDay && dateEl) {
      if (selected !== todayIso) {
        dateEl.value = todayIso;
      }
      AppModules.captureGlobals.setDateUserSelected(false);
    }

    if (!userPinnedOtherDay) {
      try { await maybeResetIntakeForToday(todayIso); } catch(_) {}
    }

    const normalizedSource = typeof source === 'string' && source.trim() ? source.trim() : '';
    const refreshReason = normalizedSource || (force ? 'force' : 'auto');
    try {
      await window.AppModules.capture?.refreshCaptureIntake?.(refreshReason);
    } catch(_) {}

    AppModules.captureGlobals.setLastKnownToday(todayIso);
    if (!AppModules.captureGlobals.getMidnightTimer()) scheduleMidnightRefresh();
    scheduleNoonSwitch();
    if (!userPinnedOtherDay) {
      AppModules.captureGlobals.setBpUserOverride(false);
    }
    diag.add?.(`intake: day refresh (${source || 'auto'})`);
  }

  function cloneIntakeTotals(source){
    return {
      water_ml: Number(source?.water_ml) || 0,
      salt_g: Number(source?.salt_g) || 0,
      protein_g: Number(source?.protein_g) || 0
    };
  }

  function getCaptureIntakeSnapshot(){
    const dayIso = captureIntakeState.dayIso || todayStr();
    return {
      dayIso,
      logged: !!captureIntakeState.logged,
      totals: cloneIntakeTotals(captureIntakeState.totals || {})
    };
  }

  async function fetchTodayIntakeTotals(options = {}){
    const todayIso = todayStr();
    const stateDay = captureIntakeState.dayIso || '';
    const hasFreshData =
      stateDay === todayIso &&
      captureIntakeState.totals &&
      typeof captureIntakeState.totals === 'object';

    if (!options.forceRefresh && hasFreshData) {
      return getCaptureIntakeSnapshot();
    }
    try {
      await refreshCaptureIntake(options.reason || 'assistant:intake-header');
    } catch (err) {
      diag.add?.('[capture] fetchTodayIntakeTotals failed: ' + (err?.message || err));
    }
    return getCaptureIntakeSnapshot();
  }

  async function refreshCaptureIntake(reasonOrOptions){
    const wrap = document.getElementById('cap-intake-wrap');
    const statusEl = document.getElementById('cap-intake-status');
    const opts = (typeof reasonOrOptions === 'object' && reasonOrOptions) ? reasonOrOptions : {};
    const refreshReason = typeof reasonOrOptions === 'string'
      ? reasonOrOptions
      : (opts.reason || opts.source || 'manual');

    const dayIso = document.getElementById('date')?.value || todayStr();
    captureIntakeState.dayIso = dayIso;
    clearCaptureIntakeInputs();

    const logKey = logCaptureRefreshStart(refreshReason, dayIso);
    const closeRefreshLog = (status, detail, severity) => {
      logCaptureRefreshEnd(refreshReason, dayIso, status, detail, severity);
    };

    if (wrap) {
      wrap.classList.add('busy');
    }

    let logged = false;
    try {
      logged = await isLoggedIn?.();
    } catch (_) {
      logged = false;
    }

    const effectiveLogged = (getAuthState() === 'unknown' && wasRecentlyLoggedIn()) ? true : !!logged;
    captureIntakeState.logged = effectiveLogged;

    if (!effectiveLogged){
      captureIntakeState.totals = { water_ml: 0, salt_g: 0, protein_g: 0 };
      setCaptureIntakeDisabled(true);
      updateCaptureIntakeStatus();
      if (statusEl) statusEl.textContent = 'Bitte anmelden, um Intake zu erfassen.';
      renderMedicationDailyPlaceholder('Bitte anmelden, um Medikamente zu verwalten.');
      if (wrap) wrap.classList.remove('busy');
      closeRefreshLog('done');
      return;
    }

    setCaptureIntakeDisabled(false);

    const uid = await getUserId?.();
    if (!uid && getAuthState() !== 'unknown') {
      captureIntakeState.logged = false;
      captureIntakeState.totals = { water_ml: 0, salt_g: 0, protein_g: 0 };
      setCaptureIntakeDisabled(true);
      updateCaptureIntakeStatus();
      if (wrap) wrap.classList.remove('busy');
      closeRefreshLog('error', 'missing user id');
      return;
    }

    try {
      const totals = await loadIntakeToday({ user_id: uid, dayIso, reason: refreshReason });
      captureIntakeState.totals = totals || { water_ml: 0, salt_g: 0, protein_g: 0 };
      captureIntakeState.logged = true;
      try { __lsTotals = captureIntakeState.totals; updateLifestyleBars(); } catch(_) {}
    } catch (e) {
      captureIntakeState.totals = { water_ml: 0, salt_g: 0, protein_g: 0 };
      captureIntakeState.logged = false;
      const errMsg = e?.message || e;
      if (e?.status === 401 || e?.status === 403) {
        showLoginOverlay?.(true);
      }
      uiError?.('Intake konnte nicht geladen werden: ' + errMsg);
      diag.add?.('Capture intake load error: ' + errMsg);
      closeRefreshLog('error', errMsg, 'error');
      if (wrap) wrap.classList.remove('busy');
      updateCaptureIntakeStatus();
      return;
    }

    updateCaptureIntakeStatus();
    if (captureIntakeState.logged) {
      refreshMedicationDaily({ dayIso, reason: refreshReason }).catch(() => {});
    } else {
      renderMedicationDailyPlaceholder('Bitte anmelden, um Medikamente zu verwalten.');
    }
    if (wrap) wrap.classList.remove('busy');
    closeRefreshLog('done');
  }

  async function handleCaptureIntake(kind){
    if (!isHandlerStageReady()) return;
    const btn = document.getElementById(`cap-${kind}-add-btn`);
    const input = document.getElementById(`cap-${kind}-add`);
    if (!btn || !input) return;
    const panel = btn.closest('#cap-intake-wrap') || document.getElementById('cap-intake-wrap');
    diag.add?.(`[capture] click ${kind}`);

    try {
      if (!AppModules.captureGlobals.getDateUserSelected()) {
        const todayIso = todayStr();
        const dateEl = document.getElementById('date');
        const selected = dateEl?.value || '';
        const stateDay = captureIntakeState.dayIso || '';
        if (stateDay !== todayIso || (selected && selected !== todayIso)) {
          await maybeRefreshForTodayChange({ force: true, source: 'capture:intake-click' });
        }
      }
    } catch(_){ }

    const dayIso = document.getElementById('date')?.value || todayStr();
    captureIntakeState.dayIso = dayIso;

    let value;
    const raw = input.value;
    if (kind === 'water'){
      value = Number(raw);
      if (raw.trim() && !Number.isFinite(value)){
        saveFeedback?.error({ button: btn, message: 'Bitte gültige Wassermenge eingeben.' });
        diag.add?.('[capture] blocked: invalid water value ' + input.value);
        return;
      }
      if (!raw.trim()) value = 0;
    } else {
      const parsed = toNumDE(raw);
      if (raw.trim() && !Number.isFinite(parsed)){
        saveFeedback?.error({
          button: btn,
          message: kind === 'salt'
            ? 'Bitte gültige Salzmenge eingeben.'
            : 'Bitte gültige Proteinmenge eingeben.'
        });
        diag.add?.(`[capture] blocked: invalid ${kind} value ${input.value}`);
        return;
      }
      value = Number.isFinite(parsed) ? parsed : 0;
    }
    diag.add?.(`[capture] parsed ${kind}=${value}`);

    const totals = { ...captureIntakeState.totals };
    let successText = '';
    if (kind === 'water'){
      totals.water_ml = roundValue('water_ml', (totals.water_ml || 0) + value);
      successText = '&#x2705; Wasser gespeichert';
    } else if (kind === 'salt'){
      totals.salt_g = roundValue('salt_g', (totals.salt_g || 0) + value);
      successText = '&#x2705; Salz gespeichert';
    } else {
      totals.protein_g = roundValue('protein_g', (totals.protein_g || 0) + value);
      successText = '&#x2705; Protein gespeichert';
    }
    diag.add?.(`[capture] totals ${JSON.stringify(totals)}`);

    saveFeedback?.start({ button: btn, panel });
    try {
      diag.add?.(`[capture] save start ${kind}: ${JSON.stringify(totals)}`);
      await saveIntakeTotalsRpc({ dayIso, totals });
      diag.add?.('[capture] save network ok');
      captureIntakeState.totals = totals;
      captureIntakeState.logged = true;
      input.value = '';
      updateCaptureIntakeStatus();
      const needsLifestyle = dayIso === todayStr();
      requestUiRefresh({
        reason: 'capture:intake',
        doctor: false,
        chart: false,
        appointments: false,
        lifestyle: needsLifestyle
      }).catch(err => {
        diag.add?.('ui refresh err: ' + (err?.message || err));
      });
      saveFeedback?.ok({ button: btn, panel, successText });
      diag.add?.(`[capture] save ok ${kind}`);
    } catch (e) {
      const msg = e?.details || e?.message || e;
      if (e?.status === 401 || e?.status === 403) {
        showLoginOverlay?.(true);
        saveFeedback?.error({ button: btn, message: 'Bitte erneut anmelden, um weiter zu speichern.' });
      } else {
        saveFeedback?.error({ button: btn, message: 'Update fehlgeschlagen: ' + msg });
      }
      diag.add?.(`[capture] save error ${kind}: ` + msg);
    }
  }

  async function handleSaltProteinCombo(){
    if (!isHandlerStageReady()) return;
    const btn = document.getElementById('cap-salt-protein-btn');
    const saltInput = document.getElementById('cap-salt-add');
    const proteinInput = document.getElementById('cap-protein-add');
    if (!btn || !saltInput || !proteinInput) return;
    const panel = btn.closest('#cap-intake-wrap') || document.getElementById('cap-intake-wrap');

    diag.add?.('[capture] click salt+protein');

    try {
      if (!AppModules.captureGlobals.getDateUserSelected()) {
        const todayIso = todayStr();
        const dateEl = document.getElementById('date');
        const selected = dateEl?.value || '';
        const stateDay = captureIntakeState.dayIso || '';
        if (stateDay !== todayIso || (selected && selected !== todayIso)) {
          await maybeRefreshForTodayChange({ force: true, source: 'capture:intake-click' });
        }
      }
    } catch (_) {}

    const dayIso = document.getElementById('date')?.value || todayStr();
    captureIntakeState.dayIso = dayIso;

    const saltRaw = saltInput.value;
    const proteinRaw = proteinInput.value;
    const saltParsed = toNumDE(saltRaw);
    const proteinParsed = toNumDE(proteinRaw);
    if (saltRaw.trim() && !Number.isFinite(saltParsed)) {
      saveFeedback?.error({ button: btn, message: 'Bitte gültige Salzmenge eingeben.' });
      return;
    }
    if (proteinRaw.trim() && !Number.isFinite(proteinParsed)) {
      saveFeedback?.error({ button: btn, message: 'Bitte gültige Proteinmenge eingeben.' });
      return;
    }
    const saltVal = Number.isFinite(saltParsed) ? saltParsed : 0;
    const proteinVal = Number.isFinite(proteinParsed) ? proteinParsed : 0;

    const totals = { ...captureIntakeState.totals };
    let messageParts = [];

    if (saltVal !== 0) {
      totals.salt_g = roundValue('salt_g', (totals.salt_g || 0) + saltVal);
      messageParts.push('Salz');
    }
    if (proteinVal !== 0) {
      totals.protein_g = roundValue('protein_g', (totals.protein_g || 0) + proteinVal);
      messageParts.push('Protein');
    }

    diag.add?.(`[capture] totals ${JSON.stringify(totals)}`);

    saveFeedback?.start({ button: btn, panel });
    try {
      diag.add?.('[capture] save start salt+protein: ' + JSON.stringify(totals));
      await saveIntakeTotalsRpc({ dayIso, totals });
      diag.add?.('[capture] save network ok');
      captureIntakeState.totals = totals;
      captureIntakeState.logged = true;
      if (saltVal > 0) saltInput.value = '';
      if (proteinVal > 0) proteinInput.value = '';
      updateCaptureIntakeStatus();
      const needsLifestyle = dayIso === todayStr();
      requestUiRefresh({
        reason: 'capture:intake',
        doctor: false,
        chart: false,
        appointments: false,
        lifestyle: needsLifestyle
      }).catch((err) => {
        diag.add?.('ui refresh err: ' + (err?.message || err));
      });
      saveFeedback?.ok({
        button: btn,
        panel,
        successText: messageParts.length
          ? `&#x2705; ${messageParts.join(' & ')} gespeichert`
          : '&#x2705; Intake gespeichert'
      });
      diag.add?.('[capture] save ok salt+protein');
    } catch (e) {
      const msg = e?.details || e?.message || e;
      if (e?.status === 401 || e?.status === 403) {
        showLoginOverlay?.(true);
        saveFeedback?.error({ button: btn, message: 'Bitte erneut anmelden, um weiter zu speichern.' });
      } else {
        saveFeedback?.error({ button: btn, message: 'Update fehlgeschlagen: ' + msg });
      }
      diag.add?.('[capture] save error salt+protein: ' + msg);
    }
  }

  function bindIntakeCapture(){
    if (!isHandlerStageReady()) return;
    const wire = (id, kind) => {
      const oldBtn = document.getElementById(id);
      if (!oldBtn) return;

      const fresh = oldBtn.cloneNode(true);
      oldBtn.replaceWith(fresh);

      fresh.disabled = false;
      fresh.classList.remove('busy');
      fresh.removeAttribute('aria-busy');
      fresh.removeAttribute('data-busy');
      if (!fresh.type) fresh.type = 'button';

      fresh.addEventListener('click', () => {
        try { handleCaptureIntake(kind); } catch(_) {}
      });
    };

    wire('cap-water-add-btn',   'water');
    wire('cap-salt-add-btn',    'salt');
    wire('cap-protein-add-btn', 'protein');
    const comboBtn = document.getElementById('cap-salt-protein-btn');
    if (comboBtn) {
      const replacement = comboBtn.cloneNode(true);
      comboBtn.replaceWith(replacement);
      replacement.disabled = false;
      if (!replacement.type) replacement.type = 'button';
      replacement.addEventListener('click', () => {
        try { handleSaltProteinCombo(); } catch (_) {}
      });
    }

    const openDoctorPanel = (startMode) => {
      const hubMod = global.AppModules?.hub;
      if (typeof hubMod?.openDoctorPanel !== 'function') {
        diag.add?.('[capture] hub.openDoctorPanel missing');
        return;
      }
      try {
        hubMod.openDoctorPanel({ startMode });
      } catch (err) {
        diag.add?.('[capture] openDoctorPanel error: ' + (err?.message || err));
      }
    };

    const wireDoctorAccessButton = (id, startMode) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const replacement = btn.cloneNode(true);
      btn.replaceWith(replacement);
      replacement.disabled = false;
      if (!replacement.type) replacement.type = 'button';
      replacement.addEventListener('click', () => openDoctorPanel(startMode));
    };

    wireDoctorAccessButton('vitalsDoctorBtn', 'list');
    wireDoctorAccessButton('vitalsChartBtn', 'chart');
  }

      const intakeTabsHost = document.querySelector('.hub-intake-tabs');
      const intakeTabButtons = document.querySelectorAll('[data-intake-tab]');
      const intakePanels = document.querySelectorAll('[data-intake-panel]');
      let activeIntakeTab = 'in';
      const setActiveIntakeTab = (tab) => {
        activeIntakeTab = tab;
        intakeTabButtons.forEach((btn) => {
          const isActive = btn.getAttribute('data-intake-tab') === tab;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
        });
        intakePanels.forEach((panel) => {
          const isActive = panel.getAttribute('data-intake-panel') === tab;
          panel.classList.toggle('is-active', isActive);
          if (isActive) {
            panel.hidden = false;
            panel.removeAttribute('aria-hidden');
          } else {
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
          }
        });
      };
      if (intakeTabsHost && intakeTabButtons.length && intakePanels.length) {
        intakeTabsHost.addEventListener('click', (event) => {
          const btn = event.target.closest('[data-intake-tab]');
          if (!btn) return;
          const next = btn.getAttribute('data-intake-tab');
          if (!next || next === activeIntakeTab) return;
          setActiveIntakeTab(next);
        });
        setActiveIntakeTab(activeIntakeTab);
      }

  function setProgState(el, state){
    if (!el) return;
    el.classList.remove('ok','warn','bad');
    if (state) el.classList.add(state);
  }

  function fmtDE(n, digits){
    if (!Number.isFinite(n)) return '0';
    return n.toFixed(digits).replace('.', ',');
  }

  function updateLifestyleBars(){
    if (!isHandlerStageReady()) return;
    const wBar = document.getElementById('ls-water-bar');
    const wProg = document.getElementById('ls-water-prog');
    const wLbl = document.getElementById('ls-water-label');
    const sBar = document.getElementById('ls-salt-bar');
    const sProg = document.getElementById('ls-salt-prog');
    const sLbl = document.getElementById('ls-salt-label');
    const pBar = document.getElementById('ls-protein-bar');
    const pProg = document.getElementById('ls-protein-prog');
    const pLbl = document.getElementById('ls-protein-label');

    const w = Math.max(0, Math.min(__lsTotals.water_ml || 0, MAX_WATER_ML));
    const s = Math.max(0, Math.min(__lsTotals.salt_g || 0, MAX_SALT_G));
    const p = Math.max(0, Math.min(__lsTotals.protein_g || 0, MAX_PROTEIN_G));

    const wPct = Math.min(1, w / LS_WATER_GOAL) * 100;
    const sPct = Math.min(1, s / LS_SALT_MAX) * 100;
    const pPct = Math.min(1, p / LS_PROTEIN_GOAL) * 100;

    if (wBar) wBar.style.width = `${wPct.toFixed(1)}%`;
    if (sBar) sBar.style.width = `${sPct.toFixed(1)}%`;
    if (pBar) pBar.style.width = `${pPct.toFixed(1)}%`;

    if (wLbl) {
      let status = '';
      if (w >= LS_WATER_GOAL * 1.1) status = ' * Ziel erreicht';
      else if (w >= LS_WATER_GOAL * 0.9) status = ' * Zielbereich';
      else if (w >= LS_WATER_GOAL * 0.5) status = ' * moderate Aufnahme';
      else status = ' * niedrig';
      wLbl.textContent = `${w|0} / ${LS_WATER_GOAL} ml${status}`;
    }

    if (sLbl) {
      let status = ' * Zielbereich';
      if (s > LS_SALT_MAX) status = ' * über Ziel';
      else if (s >= 5) status = ' * Warnung';
      sLbl.textContent = `${fmtDE(s,1)} / ${fmtDE(LS_SALT_MAX,1)} g${status}`;
    }

    if (pLbl) {
      let status = ' * noch offen';
      if (p >= 78 && p <= 90) status = ' * Zielbereich';
      else if (p > 90) status = ' * über Ziel';
      pLbl.textContent = `${fmtDE(p,1)} / ${fmtDE(LS_PROTEIN_GOAL,1)} g${status}`;
    }

    let wState = 'bad';
    if (w >= LS_WATER_GOAL * 0.9) wState = 'ok';
    else if (w >= LS_WATER_GOAL * 0.5) wState = 'warn';
    setProgState(wProg, wState);

    let sState = 'ok';
    if (s > LS_SALT_MAX) sState = 'bad';
    else if (s >= 5) sState = 'warn';
    setProgState(sProg, sState);

    let pState = 'neutral';
    if (p >= 78 && p <= 90) pState = 'ok';
    else if (p > 90) pState = 'bad';
    setProgState(pProg, pState);
  }

  async function renderLifestyle(){
    if (!isHandlerStageReady()) return;
    const logged = await isLoggedIn?.();
    if (!logged){
      return;
    }
    try{
      const uid = await getUserId?.();
      const dayIso = todayStr();
      const cur = await loadIntakeToday({ user_id: uid, dayIso });
      __lsTotals = { water_ml: cur.water_ml||0, salt_g: cur.salt_g||0, protein_g: cur.protein_g||0 };
      updateLifestyleBars();
    }catch(_){ }
  }

function initTrendpilotCaptureHook() {
    if (trendpilotHookBound) return;
    trendpilotHookBound = true;
    const doc = global.document;
    if (!doc) return;
    doc.addEventListener('trendpilot:latest', (event) => {
      const entry = event?.detail?.entry || null;
      setLatestTrendpilotEntry(entry);
      updateCaptureIntakeStatus();
    });
    const trendpilotMod = appModules.trendpilot || global.AppModules?.trendpilot || {};
    const current = trendpilotMod?.getLatestSystemComment?.();
    if (current) {
      setLatestTrendpilotEntry(current);
    }
    trendpilotMod?.refreshLatestSystemComment?.();
  }

  // SUBMODULE: clearCaptureIntakeInputs @internal - leert temporäre Intake-Felder vor neuem Save-Lauf
  function clearCaptureIntakeInputs(){
    ['cap-water-add','cap-salt-add','cap-protein-add'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  // SUBMODULE: setCaptureIntakeDisabled @public - toggles capture inputs and buttons
  function setCaptureIntakeDisabled(disabled){
    const state = !!disabled;
    ['cap-water-add','cap-salt-add','cap-protein-add'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = state;
    });
    ['cap-water-add-btn','cap-salt-add-btn','cap-protein-add-btn','cap-salt-protein-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = state;
    });
  }

  initTrendpilotCaptureHook();

  const captureApi = {
    clearCaptureIntakeInputs: clearCaptureIntakeInputs,
    refreshCaptureIntake: refreshCaptureIntake,
    fetchTodayIntakeTotals: fetchTodayIntakeTotals,
    getCaptureIntakeSnapshot: getCaptureIntakeSnapshot,
    handleCaptureIntake: handleCaptureIntake,
    setCaptureIntakeDisabled: setCaptureIntakeDisabled,
    prepareIntakeStatusHeader: prepareIntakeStatusHeader,
    updateCaptureIntakeStatus: updateCaptureIntakeStatus,
    millisUntilNextMidnight: millisUntilNextMidnight,
    handleMidnightRefresh: handleMidnightRefresh,
    scheduleMidnightRefresh: scheduleMidnightRefresh,
    maybeResetIntakeForToday: maybeResetIntakeForToday,
    scheduleNoonSwitch: scheduleNoonSwitch,
    maybeRefreshForTodayChange: maybeRefreshForTodayChange,
    bindIntakeCapture: bindIntakeCapture,
    renderLifestyle: renderLifestyle,
    updateLifestyleBars: updateLifestyleBars,
    fmtDE: fmtDE
  };
  appModules.capture = appModules.capture || {};
  Object.assign(appModules.capture, captureApi);

  ['fmtDE', 'updateLifestyleBars'].forEach((key) => {
    if (typeof captureApi[key] !== 'function') return;
    if (typeof global[key] === 'undefined') {
      Object.defineProperty(global, key, {
        value: captureApi[key],
        writable: false,
        configurable: true,
        enumerable: false
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
