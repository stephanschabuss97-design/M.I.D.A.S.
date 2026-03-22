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
  const feedbackApi = appModules.feedback || global.AppModules?.feedback || null;
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
  const MEDICATION_REORDER_LAUNCH_LOCK_MS = 4000;
  const MEDICATION_REORDER_REOPEN_COOLDOWN_MS = 12000;
  const roundValue = (key, value) => {
    if (key === 'water_ml') {
      return Math.round(value);
    }
    return Math.round(value * 100) / 100;
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
    dayIso: null,
    data: null,
    authRetryTimer: null,
    doctorWarnedMissing: false,
    lastLowStockCount: null,
    reorderConfirming: new Map(),
    reorderLaunchLocks: new Map(),
    reorderPrompted: new Map(),
    cardOrder: [],
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

  const getMedicationReorderUiState = (medId) => {
    const key = `${medId || ''}`.trim();
    if (!key) return null;
    return medicationDailyState.reorderPrompted.get(key) || null;
  };

  const isMedicationReorderRecentlyPrompted = (medId) => {
    const entry = getMedicationReorderUiState(medId);
    if (!entry?.at) return false;
    return Date.now() - entry.at < MEDICATION_REORDER_REOPEN_COOLDOWN_MS;
  };

  const isMedicationReorderConfirming = (medId) => {
    const key = `${medId || ''}`.trim();
    if (!key) return false;
    return medicationDailyState.reorderConfirming.has(key);
  };

  const markMedicationReorderConfirming = (medId, contract) => {
    const key = `${medId || ''}`.trim();
    if (!key) return;
    medicationDailyState.reorderConfirming.set(key, {
      href: contract?.href || '',
      dayIso: contract?.dayIso || medicationDailyState.dayIso || todayStr(),
      at: Date.now()
    });
  };

  const clearMedicationReorderConfirming = (medId) => {
    const key = `${medId || ''}`.trim();
    if (!key) return;
    medicationDailyState.reorderConfirming.delete(key);
  };

  const isMedicationReorderLaunchLocked = (medId) => {
    const key = `${medId || ''}`.trim();
    if (!key) return false;
    const startedAt = medicationDailyState.reorderLaunchLocks.get(key);
    if (!startedAt) return false;
    if (Date.now() - startedAt >= MEDICATION_REORDER_LAUNCH_LOCK_MS) {
      medicationDailyState.reorderLaunchLocks.delete(key);
      return false;
    }
    return true;
  };

  const lockMedicationReorderLaunch = (medId) => {
    const key = `${medId || ''}`.trim();
    if (!key) return;
    medicationDailyState.reorderLaunchLocks.set(key, Date.now());
  };

  const getActiveMedicationRows = (data) => {
    if (!Array.isArray(data?.medications)) return [];
    return data.medications.filter((med) => med && med.active !== false);
  };

  const MEDICATION_DAYPART_ORDER = Object.freeze(['morning', 'noon', 'evening', 'night']);
  const MEDICATION_DAYPART_LABELS = Object.freeze({
    morning: 'Morgen',
    noon: 'Mittag',
    evening: 'Abend',
    night: 'Nacht'
  });
  const normalizeMedicationDaypart = (value) => {
    const normalized = `${value || ''}`.trim().toLowerCase();
    return MEDICATION_DAYPART_ORDER.includes(normalized) ? normalized : '';
  };

  const getCurrentMedicationDaypart = (date = new Date()) => {
    const hour = date instanceof Date ? date.getHours() : new Date().getHours();
    if (hour >= 21 || hour < 6) return 'night';
    if (hour >= 17) return 'evening';
    if (hour >= 11) return 'noon';
    return 'morning';
  };

  const getOpenMedicationDaypartGroups = (data) => {
    const groups = new Map();
    getActiveMedicationRows(data).forEach((med) => {
      const medId = `${med?.id || ''}`.trim();
      const slots = Array.isArray(med?.slots) ? med.slots : [];
      slots.forEach((slot) => {
        if (!slot || slot.is_taken) return;
        const slotId = `${slot.slot_id || ''}`.trim();
        const section = normalizeMedicationDaypart(slot.slot_type);
        if (!slotId || !section) return;
        let group = groups.get(section);
        if (!group) {
          group = {
            section,
            slotIds: new Set(),
            medIds: new Set()
          };
          groups.set(section, group);
        }
        group.slotIds.add(slotId);
        if (medId) group.medIds.add(medId);
      });
    });
    return MEDICATION_DAYPART_ORDER
      .map((section) => groups.get(section))
      .filter((group) => group && group.slotIds.size)
      .map((group) => ({
        section: group.section,
        label: MEDICATION_DAYPART_LABELS[group.section] || group.section,
        slotIds: Array.from(group.slotIds),
        medIds: Array.from(group.medIds),
        slotCount: group.slotIds.size,
        medCount: group.medIds.size
      }));
  };

  const getPrioritizedMedicationDaypartGroups = (data) => {
    const groups = getOpenMedicationDaypartGroups(data);
    if (groups.length <= 1) return groups;
    const currentSection = getCurrentMedicationDaypart();
    const primarySection = groups.some((group) => group.section === currentSection)
      ? currentSection
      : groups[0]?.section;
    const primaryGroup = groups.find((group) => group.section === primarySection);
    const secondaryGroups = groups.filter((group) => group.section !== primarySection);
    return primaryGroup ? [primaryGroup, ...secondaryGroups] : groups;
  };

  const markMedicationReorderPrompted = (medId, contract) => {
    const key = `${medId || ''}`.trim();
    if (!key) return;
    medicationDailyState.reorderConfirming.delete(key);
    medicationDailyState.reorderPrompted.set(key, {
      state: contract?.state || 'reorder_prompted',
      href: contract?.href || '',
      dayIso: contract?.dayIso || medicationDailyState.dayIso || todayStr(),
      at: Date.now()
    });
  };

  const updateMedicationBatchFooter = () => {
    const ui = medicationDailyState.elements;
    if (!ui?.footer) return;
    const data = medicationDailyState.data;
    const activeRows = getActiveMedicationRows(data);
    const groups = getPrioritizedMedicationDaypartGroups(data);
    const showFooter = activeRows.length && groups.length;

    ui.footer.hidden = !showFooter;
    if (!ui.actions) return;
    ui.actions.hidden = !groups.length;

    if (!showFooter) {
      ui.actions.innerHTML = '';
      return;
    }
    ui.actions.innerHTML = groups
      .map((group, index) => {
        const isPrimary = index === 0;
        const label = isPrimary
          ? `Alle ${group.label}-Medikamente genommen (${group.medCount})`
          : `${group.label} erledigen (${group.medCount})`;
        const classes = ['btn', isPrimary ? 'primary' : 'ghost', 'medication-batch-btn'];
        if (!isPrimary) classes.push('small', 'is-secondary');
        return `
          <button
            type="button"
            class="${classes.join(' ')}"
            data-med-batch-section="${escapeAttr(group.section)}"
            data-med-batch-primary="${isPrimary ? '1' : '0'}"
            ${medicationDailyState.busy ? 'disabled' : ''}
          >
            ${escapeHtml(label)}
          </button>
        `;
      })
      .join('');
  };


  function initMedicationDailyUi() {
    if (medicationDailyState.initialized) return;
    const doc = global.document;
    if (!doc) return;
    const listEl = doc.getElementById('medDailyList');
    if (!listEl) return;
    medicationDailyState.listEl = listEl;
    medicationDailyState.lowStockEl = doc.getElementById('medLowStockBox');
    medicationDailyState.elements = {
      footer: doc.getElementById('medicationBatchFooter'),
      actions: doc.getElementById('medicationBatchActions')
    };
    medicationDailyState.initialized = true;

    listEl.addEventListener('click', (event) => {
      const statusBtn = event.target.closest('[data-med-slot-id]');
      if (statusBtn) {
        event.preventDefault();
        handleMedicationStatusToggle(statusBtn);
      }
    });

    medicationDailyState.lowStockEl?.addEventListener('click', (event) => {
      const mailLink = event.target.closest('[data-med-mail]');
      if (mailLink) {
        handleMedicationReorderStart(mailLink, event);
        return;
      }
      const confirmLink = event.target.closest('[data-med-mail-confirm]');
      if (confirmLink) {
        handleMedicationReorderConfirm(confirmLink, event);
        return;
      }
      const cancelBtn = event.target.closest('[data-med-mail-cancel]');
      if (cancelBtn) {
        handleMedicationReorderCancel(cancelBtn, event);
        return;
      }
      const btn = event.target.closest('[data-med-ack]');
      if (!btn) return;
      event.preventDefault();
      handleLowStockAck(btn);
    });

    medicationDailyState.elements.actions?.addEventListener('click', (event) => {
      const batchBtn = event.target.closest('[data-med-batch-section]');
      if (!batchBtn) return;
      event.preventDefault();
      handleMedicationBatchConfirm(batchBtn.getAttribute('data-med-batch-section'), batchBtn);
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
      medicationDailyState.reorderConfirming.clear();
      medicationDailyState.reorderLaunchLocks.clear();
      medicationDailyState.reorderPrompted.clear();
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
        const reorderContract =
          typeof getMedicationModule()?.getMedicationReorderStartContract === 'function'
            ? getMedicationModule().getMedicationReorderStartContract(med, {
                doctorInfo,
                meds,
                dayIso: medicationDailyState.dayIso || todayStr()
              })
            : { ok: false, reason: 'medication-reorder-contract-missing' };
        const reorderUi = getMedicationReorderUiState(med.id);
        const isConfirming = isMedicationReorderConfirming(med.id);
        const reorderState = reorderUi?.state || (isConfirming ? 'confirming' : reorderContract?.ok ? 'ready' : 'unavailable');
        const reorderHint =
          reorderState === 'reorder_prompted'
            ? 'Rezeptkontakt angestoßen'
            : reorderContract?.ok
              ? 'Lokaler Rezeptkontakt möglich'
              : 'Rezeptkontakt nicht verfügbar';
        const mailAction = reorderContract?.ok
          ? `<a class="btn ghost small" href="${escapeAttr(
              reorderContract.href || ''
            )}" target="_blank" rel="noopener" data-med-mail="${escapeAttr(
              med.id || ''
            )}" data-med-reorder-state="${escapeAttr(reorderContract.state || '')}">Arzt-Mail</a>`
          : '<small class="muted small">Mailkontakt fehlt</small>';
        const effectiveReorderHint =
          reorderState === 'confirming'
            ? 'Mailstart bitte lokal bestätigen'
            : reorderState === 'reorder_prompted'
              ? 'Rezeptkontakt angestossen'
              : reorderContract?.ok
                ? 'Lokaler Rezeptkontakt möglich'
                : 'Rezeptkontakt nicht verfuegbar';
        const effectiveMailAction = isConfirming
          ? `<a class="btn small" href="${escapeAttr(
              reorderContract?.href || ''
            )}" data-med-mail-confirm="${escapeAttr(med.id || '')}">Mail jetzt öffnen</a>
             <button type="button" class="btn ghost small" data-med-mail-cancel="${escapeAttr(
               med.id || ''
             )}">Abbrechen</button>`
          : mailAction;
        const ackBtn = `<button type="button" class="btn ghost small" data-med-ack="${escapeAttr(
          med.id || ''
        )}" data-med-stock="${escapeAttr(String(med.stock_count ?? 0))}">Erledigt</button>`;
        return `
        <div class="low-stock-item" data-med-reorder-ui-state="${escapeAttr(reorderState)}">
          <div>
            <div>${escapeHtml(med.name || 'Medikation')}</div>
            <small>Noch ${med.stock_count ?? 0} Stk. (${med.days_left ?? '?'} Tage)</small>
            <small class="medication-low-stock-state" data-med-reorder-label="${escapeAttr(
              med.id || ''
            )}">${escapeHtml(effectiveReorderHint)}</small>
          </div>
          <div class="medication-low-stock-actions">
            ${effectiveMailAction}
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
      updateMedicationBatchFooter();
      return;
    }
    const nextOrder = syncCardOrder(medicationDailyState.cardOrder, meds);
    medicationDailyState.cardOrder = nextOrder;
    const sortedMeds = sortByCardOrder(meds, nextOrder);
    const items = sortedMeds
      .map((med) => {
        const daysLeft = Number.isFinite(med.days_left) ? `${med.days_left} Tage übrig` : '';
        const progressText =
          Number.isFinite(med.taken_count) && Number.isFinite(med.total_count)
            ? `${med.taken_count}/${med.total_count}`
            : '';
        const statusText = [progressText, daysLeft].filter(Boolean).join(' | ');
        const detailText = [med.ingredient, med.strength].filter(Boolean).join(' - ');
        const medId = med.id || '';
        const slots = Array.isArray(med.slots) ? med.slots.slice().sort((a, b) => a.sort_order - b.sort_order) : [];
        const primarySlot = slots.length === 1 ? slots[0] : null;
        const isTaken = med.state === 'done';
        const slotHtml =
          slots.length > 1
            ? `
                <div class="medication-slot-list">
                  ${slots
                    .map((slot) => {
                      const slotTaken = !!slot.is_taken;
                      const slotLabel = slot.qty > 1 ? `${slot.label} (${slot.qty})` : slot.label;
                      return `
                        <button
                          type="button"
                          class="medication-slot-btn ${slotTaken ? 'is-taken' : 'is-open'}"
                          data-med-slot-id="${escapeAttr(slot.slot_id || '')}"
                          data-med-slot-taken="${slotTaken ? '1' : '0'}"
                          ${medicationDailyState.busy ? 'disabled' : ''}
                        >
                          <span>${escapeHtml(slotLabel)}</span>
                          <span class="medication-slot-btn-state">${slotTaken ? 'Erledigt' : 'Offen'}</span>
                        </button>
                      `;
                    })
                    .join('')}
                </div>
              `
            : '';
        return `
            <article class="medication-card ${med.low_stock ? 'is-low' : ''} ${isTaken ? 'is-taken' : ''}" data-med-id="${escapeAttr(medId)}">
              <div class="medication-card-header">
                <div class="medication-card-title-wrap">
                  <h4 class="medication-card-title">${escapeHtml(med.name || 'Medikation')}</h4>
                  ${statusText ? `<span class="medication-card-status">${escapeHtml(statusText)}</span>` : ''}
                </div>
                ${
                  primarySlot
                    ? `
                        <button
                          type="button"
                          class="medication-card-status-slot status-glow ${isTaken ? 'ok' : 'neutral'}"
                          data-med-slot-id="${escapeAttr(primarySlot.slot_id || '')}"
                          data-med-slot-taken="${isTaken ? '1' : '0'}"
                          aria-label="${escapeAttr(isTaken ? 'Einnahme zurücknehmen' : 'Einnahme bestätigen')}"
                        >
                          <svg class="medication-status-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      `
                    : ''
                }
              </div>
            ${detailText ? `<p class="medication-card-meta small">${escapeHtml(detailText)}</p>` : ''}
            ${med.with_meal ? '<p class="medication-card-meta small">Mit Mahlzeit</p>' : ''}
            ${slotHtml}
          </article>
        `;
      })
      .join('');
    listEl.innerHTML = items;
    renderMedicationLowStock(data);
    updateMedicationBatchFooter();
  }

  async function handleMedicationBatchConfirm(section, triggerBtn) {
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
    const normalizedSection = normalizeMedicationDaypart(section);
    const group = getOpenMedicationDaypartGroups(data).find((entry) => entry.section === normalizedSection);
    if (!group?.slotIds?.length) return;

    const dayIso = todayStr();
    const panel = document.getElementById('cap-intake-wrap');

    medicationDailyState.dayIso = dayIso;
    medicationDailyState.busy = true;
    updateMedicationBatchFooter();
    saveFeedback?.start({ button: triggerBtn, panel });
    try {
      await Promise.all(
        group.slotIds.map((slotId) =>
          medModule.confirmMedicationSlot(slotId, { dayIso, reason: `capture-batch:${normalizedSection}` })
        )
      );
      feedbackApi?.feedback?.('medication:confirm', {
        intent: true,
        source: 'user',
        dedupeKey: `medication:confirm:batch:${normalizedSection}`
      });
      saveFeedback?.ok({
        button: triggerBtn,
        panel,
        successText: `&#x2705; ${escapeHtml(MEDICATION_DAYPART_LABELS[normalizedSection] || 'Medikamente')} gespeichert`
      });
      if (typeof medModule.invalidateMedicationCache === 'function') {
        medModule.invalidateMedicationCache(dayIso);
      }
      await refreshMedicationDaily({ dayIso, reason: `batch:${normalizedSection}`, force: true });
    } catch (err) {
      saveFeedback?.error({
        button: triggerBtn,
        panel,
        message: err?.message || 'Speichern fehlgeschlagen.'
      });
      uiError(err?.message || 'Speichern fehlgeschlagen.');
      diag.add?.(`[capture:med] batch error section=${normalizedSection} ${err?.message || err}`);
    } finally {
      medicationDailyState.busy = false;
      updateMedicationBatchFooter();
    }
  }


  async function handleMedicationStatusToggle(btn) {
    if (!btn || medicationDailyState.busy) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      uiError('Medikationsmodul nicht verfügbar.');
      return;
    }
    if (!captureIntakeState.logged) {
      uiError('Bitte anmelden, um Medikamente zu bestätigen.');
      return;
    }
    const slotId = btn.getAttribute('data-med-slot-id');
    if (!slotId) return;
    const dayIso = todayStr();
    const isTaken = btn.getAttribute('data-med-slot-taken') === '1';
    medicationDailyState.dayIso = dayIso;
    withBusy(btn, true);
    try {
      if (isTaken) {
        await medModule.undoMedicationSlot(slotId, { dayIso, reason: 'capture-status-toggle' });
        uiInfo('Einnahme zurückgenommen.');
        feedbackApi?.feedback?.('medication:undo', { intent: true, source: 'user' });
      } else {
        await medModule.confirmMedicationSlot(slotId, { dayIso, reason: 'capture-status-toggle' });
        uiInfo('Einnahme bestätigt.');
        feedbackApi?.feedback?.('medication:confirm', { intent: true, source: 'user' });
      }
      if (typeof medModule.invalidateMedicationCache === 'function') {
        medModule.invalidateMedicationCache(dayIso);
      }
      await refreshMedicationDaily({ dayIso, reason: 'status-toggle', force: true });
    } catch (err) {
      uiError(err?.message || 'Aktion fehlgeschlagen.');
      diag.add?.(`[capture:med] status toggle error slot=${slotId} ${err?.message || err}`);
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
    const dayIso = todayStr();
    medicationDailyState.dayIso = dayIso;
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

  function handleMedicationReorderStart(link, event) {
    if (!link) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      uiError('Medikationsmodul nicht verfügbar.');
      return;
    }
    if (!captureIntakeState.logged) {
      uiError('Bitte anmelden, um einen Rezeptkontakt zu starten.');
      return;
    }
    const medId = `${link.getAttribute('data-med-mail') || ''}`.trim();
    if (!medId) return;
    const data = medicationDailyState.data;
    const meds = Array.isArray(data?.medications) ? data.medications.filter((med) => med?.low_stock) : [];
    const med = meds.find((entry) => `${entry?.id || ''}`.trim() === medId);
    const contract =
      typeof medModule.getMedicationReorderStartContract === 'function'
        ? medModule.getMedicationReorderStartContract(med, {
            doctorInfo: getPrimaryDoctorInfo(),
            meds,
            dayIso: medicationDailyState.dayIso || todayStr()
          })
        : { ok: false, reason: 'medication-reorder-contract-missing' };
    if (!contract?.ok) {
      event?.preventDefault?.();
      diag.add?.(
        `[capture:med] reorder start blocked med=${medId} reason=${contract?.reason || 'unknown'}`
      );
      uiError('Rezeptkontakt ist gerade nicht verfügbar.');
      return;
    }
    if (isMedicationReorderLaunchLocked(medId)) {
      event?.preventDefault?.();
      diag.add?.(`[capture:med] reorder start blocked med=${medId} reason=reorder-launch-locked`);
      uiInfo('Rezeptkontakt wurde gerade bereits angestossen.');
      return;
    }
    if (isMedicationReorderRecentlyPrompted(medId)) {
      event?.preventDefault?.();
      diag.add?.(`[capture:med] reorder start blocked med=${medId} reason=reorder-reopen-cooldown`);
      uiInfo('Rezeptkontakt wurde gerade bereits geöffnet.');
      return;
    }
    event?.preventDefault?.();
    markMedicationReorderConfirming(medId, contract);
    diag.add?.(
      `[capture:med] reorder confirm armed med=${medId} day=${contract.dayIso || medicationDailyState.dayIso || 'n/a'}`
    );
    uiInfo('Rezeptkontakt lokal bestätigen, um die Mail-App zu öffnen.');
    renderMedicationLowStock(medicationDailyState.data);
    return;
  }

  function handleMedicationReorderConfirm(link, event) {
    event?.preventDefault?.();
    if (!link) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      uiError('Medikationsmodul nicht verfÃ¼gbar.');
      return;
    }
    const medId = `${link.getAttribute('data-med-mail-confirm') || ''}`.trim();
    if (!medId) return;
    const data = medicationDailyState.data;
    const meds = Array.isArray(data?.medications) ? data.medications.filter((med) => med?.low_stock) : [];
    const med = meds.find((entry) => `${entry?.id || ''}`.trim() === medId);
    const contract =
      typeof medModule.getMedicationReorderStartContract === 'function'
        ? medModule.getMedicationReorderStartContract(med, {
            doctorInfo: getPrimaryDoctorInfo(),
            meds,
            dayIso: medicationDailyState.dayIso || todayStr()
          })
        : { ok: false, reason: 'medication-reorder-contract-missing' };
    if (!contract?.ok) {
      clearMedicationReorderConfirming(medId);
      diag.add?.(
        `[capture:med] reorder confirm blocked med=${medId} reason=${contract?.reason || 'unknown'}`
      );
      uiError('Rezeptkontakt ist gerade nicht verfügbar.');
      renderMedicationLowStock(medicationDailyState.data);
      return;
    }
    if (isMedicationReorderLaunchLocked(medId)) {
      clearMedicationReorderConfirming(medId);
      diag.add?.(`[capture:med] reorder confirm blocked med=${medId} reason=reorder-launch-locked`);
      uiInfo('Rezeptkontakt wurde gerade bereits geöffnet.');
      renderMedicationLowStock(medicationDailyState.data);
      return;
    }
    markMedicationReorderPrompted(medId, contract);
    lockMedicationReorderLaunch(medId);
    diag.add?.(
      `[capture:med] reorder prompted med=${medId} day=${contract.dayIso || medicationDailyState.dayIso || 'n/a'}`
    );
    uiInfo('Mail-App wird geöffnet. Rezeptkontakt bleibt lokal.');
    renderMedicationLowStock(medicationDailyState.data);
    if (global?.location) {
      global.location.href = contract.href;
    }
  }

  function handleMedicationReorderCancel(btn, event) {
    event?.preventDefault?.();
    const medId = `${btn?.getAttribute('data-med-mail-cancel') || ''}`.trim();
    if (!medId) return;
    clearMedicationReorderConfirming(medId);
    diag.add?.(`[capture:med] reorder confirm cancelled med=${medId}`);
    renderMedicationLowStock(medicationDailyState.data);
  }

  async function startMedicationLowStockReorder(options = {}) {
    const medModule = getMedicationModule();
    if (!medModule) {
      return {
        ok: false,
        reason: 'medication-module-missing',
        replyText: 'Medikationsmodul nicht verfügbar.'
      };
    }
    if (!captureIntakeState.logged) {
      return {
        ok: false,
        reason: 'medication-not-authenticated',
        replyText: 'Bitte anmelden, um einen Rezeptkontakt zu starten.'
      };
    }
    const dayIso =
      typeof options.dayIso === 'string' && options.dayIso.trim()
        ? options.dayIso.trim()
        : todayStr();
    let data = null;
    try {
      data = await medModule.loadMedicationForDay(dayIso, {
        force: true,
        reason: options.reason || 'voice:medication-low-stock-followup'
      });
    } catch (err) {
      diag.add?.(`[capture:med] reorder follow-up load failed day=${dayIso} reason=${err?.message || err}`);
      return {
        ok: false,
        reason: 'medication-load-failed',
        replyText: 'Rezeptkontakt ist gerade nicht verfügbar.'
      };
    }
    const meds = Array.isArray(data?.medications) ? data.medications.filter((med) => med?.low_stock) : [];
    const requestedMedIds = Array.isArray(options.medIds)
      ? options.medIds.map((value) => `${value || ''}`.trim()).filter(Boolean)
      : [];
    const med =
      (requestedMedIds.length
        ? meds.find((entry) => requestedMedIds.includes(`${entry?.id || ''}`.trim()))
        : null) ||
      meds[0] ||
      null;
    const contract =
      typeof medModule.getMedicationReorderStartContract === 'function'
        ? medModule.getMedicationReorderStartContract(med, {
            doctorInfo: getPrimaryDoctorInfo(),
            meds,
            dayIso
          })
        : { ok: false, reason: 'medication-reorder-contract-missing' };
    if (!contract?.ok) {
      diag.add?.(
        `[capture:med] reorder follow-up blocked med=${contract?.medId || med?.id || 'n/a'} reason=${contract?.reason || 'unknown'}`
      );
      return {
        ok: false,
        reason: contract?.reason || 'medication-reorder-contract-missing',
        replyText: 'Rezeptkontakt ist gerade nicht verfügbar.'
      };
    }
    if (isMedicationReorderLaunchLocked(contract.medId)) {
      diag.add?.(`[capture:med] reorder follow-up blocked med=${contract.medId} reason=reorder-launch-locked`);
      return {
        ok: false,
        reason: 'reorder-launch-locked',
        replyText: 'Rezeptkontakt wurde gerade bereits geöffnet.'
      };
    }
    if (isMedicationReorderRecentlyPrompted(contract.medId)) {
      diag.add?.(`[capture:med] reorder follow-up blocked med=${contract.medId} reason=reorder-reopen-cooldown`);
      return {
        ok: false,
        reason: 'reorder-reopen-cooldown',
        replyText: 'Rezeptkontakt wurde gerade bereits geöffnet.'
      };
    }
    markMedicationReorderPrompted(contract.medId, contract);
    lockMedicationReorderLaunch(contract.medId);
    medicationDailyState.data = data;
    if ((medicationDailyState.dayIso || '') === dayIso) {
      renderMedicationLowStock(medicationDailyState.data);
    }
    diag.add?.(
      `[capture:med] reorder prompted med=${contract.medId} day=${contract.dayIso || dayIso} source=${options.source || 'unknown'}`
    );
    uiInfo('Mail-App wird geöffnet. Rezeptkontakt bleibt lokal.');
    if (global?.location) {
      global.location.href = contract.href;
    }
    return {
      ok: true,
      reason: null,
      medId: contract.medId,
      dayIso: contract.dayIso || dayIso,
      replyText: 'Mail-App wird geöffnet. Rezeptkontakt bleibt lokal.'
    };
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
    const nextDayIso = todayStr();
    const dayChanged = medicationDailyState.dayIso && medicationDailyState.dayIso !== nextDayIso;
    medicationDailyState.dayIso = nextDayIso;
    if (dayChanged) {
      medicationDailyState.reorderConfirming.clear();
      medicationDailyState.reorderLaunchLocks.clear();
      medicationDailyState.reorderPrompted.clear();
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

      if (!statusTop && !hasSlots) return;

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
    const todayChanged = AppModules.captureGlobals.getLastKnownToday() !== todayIso;
    if (!force && !todayChanged) return;

    try { await maybeResetIntakeForToday(todayIso); } catch(_) {}

    const normalizedSource = typeof source === 'string' && source.trim() ? source.trim() : '';
    const refreshReason = normalizedSource || (force ? 'force' : 'auto');
    try {
      await window.AppModules.capture?.refreshCaptureIntake?.(refreshReason);
    } catch(_) {}

    AppModules.captureGlobals.setLastKnownToday(todayIso);
    if (!AppModules.captureGlobals.getMidnightTimer()) scheduleMidnightRefresh();
    scheduleNoonSwitch();
    AppModules.captureGlobals.setBpUserOverride(false);
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
    const opts = (typeof reasonOrOptions === 'object' && reasonOrOptions) ? reasonOrOptions : {};
    const refreshReason = typeof reasonOrOptions === 'string'
      ? reasonOrOptions
      : (opts.reason || opts.source || 'manual');

    const dayIso = todayStr();
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

    const dayIso = todayStr();
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
      emitCaptureIntakeChanged({
        reason: 'capture:intake',
        source: kind,
        dayIso,
        totals,
        logged: true,
      });
      global.AppModules?.hub?.applyAssistantIntakeSnapshot?.({
        dayIso,
        logged: true,
        totals: cloneIntakeTotals(totals),
      });
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
      feedbackApi?.feedback?.('intake:save', { intent: true, source: 'user' });
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

    const dayIso = todayStr();
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
      emitCaptureIntakeChanged({
        reason: 'capture:intake',
        source: 'salt-protein-combo',
        dayIso,
        totals,
        logged: true,
      });
      global.AppModules?.hub?.applyAssistantIntakeSnapshot?.({
        dayIso,
        logged: true,
        totals: cloneIntakeTotals(totals),
      });
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
      feedbackApi?.feedback?.('intake:combo-save', { intent: true, source: 'user' });
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

  function emitCaptureIntakeChanged(detail = {}) {
    try {
      doc?.dispatchEvent?.(new CustomEvent('capture:intake-changed', {
        detail: {
          reason: detail.reason || 'capture:intake',
          source: detail.source || 'unknown',
          dayIso: detail.dayIso || todayStr(),
          logged: detail.logged !== false,
          totals: cloneIntakeTotals(detail.totals || captureIntakeState.totals || {}),
        },
      }));
    } catch (_) {}
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

  function fmtDE(n, digits){
    if (!Number.isFinite(n)) return '0';
    return n.toFixed(digits).replace('.', ',');
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
    ['cap-water-add-btn','cap-salt-protein-btn'].forEach(id => {
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
    fmtDE: fmtDE,
    startMedicationLowStockReorder: startMedicationLowStockReorder
  };
  appModules.capture = appModules.capture || {};
  Object.assign(appModules.capture, captureApi);

  ['fmtDE'].forEach((key) => {
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
