'use strict';
/**
 * MODULE: capture/index.js
 * Description: UI-Orchestrierung der Tageserfassung (Intake/BP/Body) inkl. Statusanzeigen, Trendpilot-Pills und Timer.
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
  const getBpModule = () => global.AppModules?.bp;
  const invokeResetBpPanel = (ctx, opts) => getBpModule()?.resetBpPanel?.(ctx, opts);
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
    safetyEl: null,
    refreshBtn: null,
    dayIso: null,
    data: null,
    authRetryTimer: null,
    doctorWarnedMissing: false,
    lastLowStockCount: null,
    lastSafetyPending: null
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

  const formatMedTakenTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
  };

  const shiftDayIso = (dayIso, delta) => {
    if (!dayIso) return null;
    const base = new Date(`${dayIso}T00:00:00Z`);
    if (Number.isNaN(base.getTime())) return null;
    base.setUTCDate(base.getUTCDate() + delta);
    return base.toISOString().slice(0, 10);
  };

  function initMedicationDailyUi() {
    if (medicationDailyState.initialized) return;
    const doc = global.document;
    if (!doc) return;
    const listEl = doc.getElementById('medDailyList');
    if (!listEl) return;
    medicationDailyState.listEl = listEl;
    medicationDailyState.lowStockEl = doc.getElementById('medLowStockBox');
    medicationDailyState.safetyEl = doc.getElementById('medSafetyHint');
    medicationDailyState.refreshBtn = doc.getElementById('medDailyRefreshBtn');
    medicationDailyState.initialized = true;

    listEl.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-med-toggle]');
      if (!btn) return;
      event.preventDefault();
      handleMedicationToggle(btn);
    });

    medicationDailyState.lowStockEl?.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-med-ack]');
      if (!btn) return;
      event.preventDefault();
      handleLowStockAck(btn);
    });

    medicationDailyState.safetyEl?.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-med-safety-goto]');
      if (!btn) return;
      event.preventDefault();
      const targetDay = btn.getAttribute('data-med-safety-goto');
      if (!targetDay) return;
      const dateInput = doc.getElementById('date');
      if (dateInput) {
        dateInput.value = targetDay;
        AppModules.captureGlobals.setDateUserSelected(true);
        maybeRefreshForTodayChange({ force: true, source: 'med-safety' });
      }
    });

    medicationDailyState.refreshBtn?.addEventListener('click', () => {
      if (medicationDailyState.dayIso) {
        refreshMedicationDaily({ dayIso: medicationDailyState.dayIso, reason: 'manual', force: true });
      }
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
    diag.add?.(
      `[capture:med] placeholder day=${medicationDailyState.dayIso || 'n/a'} msg="${effectiveMessage}"`
    );
    if (medicationDailyState.lowStockEl) {
      medicationDailyState.lowStockEl.hidden = true;
      medicationDailyState.lowStockEl.innerHTML = '';
      medicationDailyState.lastLowStockCount = null;
    }
    if (medicationDailyState.safetyEl) {
      medicationDailyState.safetyEl.hidden = true;
      medicationDailyState.safetyEl.innerHTML = '';
      medicationDailyState.lastSafetyPending = null;
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
    const meds = Array.isArray(data?.medications) ? data.medications.filter((med) => med.active !== false) : [];
    if (!meds.length) {
      listEl.innerHTML = '<p class="muted small">Keine aktiven Medikamente für diesen Tag.</p>';
      renderMedicationLowStock(data);
      return;
    }
    const items = meds
      .map((med) => {
        const info = [];
        if (Number.isFinite(med.stock_count)) info.push(`${med.stock_count} Stk.`);
        if (Number.isFinite(med.days_left)) info.push(`${med.days_left} Tage übrig`);
        const infoText = info.join(' • ') || '';
        const takenTime = med.taken_at ? `Bestätigt ${formatMedTakenTime(med.taken_at)}` : 'Noch offen';
        const state = med.taken ? 'on' : 'off';
        const btnLabel = med.taken ? takenTime : 'Einnahme bestätigen';
        return `
          <article class="medication-daily-item ${med.low_stock ? 'is-low' : ''}">
            <div class="medication-daily-meta">
              <strong>${escapeHtml(med.name || 'Medikation')}</strong>
              <span>${escapeHtml([med.ingredient, med.strength].filter(Boolean).join(' • ') || 'Keine Details')}</span>
              ${infoText ? `<span>${escapeHtml(infoText)}</span>` : ''}
            </div>
            <button type="button"
              class="med-toggle-btn ${state === 'on' ? 'is-on' : ''}"
              data-med-toggle="${escapeAttr(med.id || '')}"
              data-med-state="${state}"
              data-med-name="${escapeAttr(med.name || '')}"
              data-med-time="${escapeAttr(med.taken_at || '')}">
              ${escapeHtml(btnLabel)}
            </button>
          </article>
        `;
      })
      .join('');
    listEl.innerHTML = items;
    renderMedicationLowStock(data);
  }

  async function handleMedicationToggle(btn) {
    if (!btn || btn.disabled) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      uiError('Medikationsmodul nicht verfügbar.');
      return;
    }
    if (!captureIntakeState.logged) {
      uiError('Bitte anmelden, um Medikamente zu bestätigen.');
      return;
    }
    const medId = btn.getAttribute('data-med-toggle');
    if (!medId) return;
    const state = btn.getAttribute('data-med-state') === 'on' ? 'on' : 'off';
    const takenTime = btn.getAttribute('data-med-time');
    const medName = btn.getAttribute('data-med-name') || 'Medikation';
    const dayIso = medicationDailyState.dayIso || document.getElementById('date')?.value || todayStr();
    if (state === 'on') {
      const timeLabel = formatMedTakenTime(takenTime);
      const confirmUndo = global.confirm
        ? global.confirm(`${medName} wurde heute bereits bestätigt${timeLabel ? ` um ${timeLabel}` : ''}. Rückgängig machen?`)
        : true;
      if (!confirmUndo) return;
    }
    withBusy(btn, true);
    try {
      if (state === 'on') {
        await medModule.undoMedication(medId, { dayIso, reason: 'capture-toggle' });
        uiInfo('Einnahme zurückgenommen.');
        diag.add?.(`[capture:med] undo med=${medId} day=${dayIso}`);
      } else {
        await medModule.confirmMedication(medId, { dayIso, reason: 'capture-toggle' });
        uiInfo('Einnahme bestätigt.');
        diag.add?.(`[capture:med] confirm med=${medId} day=${dayIso}`);
      }
      if (typeof medModule.invalidateMedicationCache === 'function') {
        medModule.invalidateMedicationCache(dayIso);
      }
      await refreshMedicationDaily({ dayIso, reason: 'toggle', force: true });
    } catch (err) {
      uiError(err?.message || 'Aktion fehlgeschlagen.');
      diag.add?.(`[capture:med] toggle error med=${medId} ${err?.message || err}`);
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
      uiError('Bitte anmelden, um Hinweise zu bestaetigen.');
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

  async function updateMedSafetyHint(dayIso) {
    const hintEl = medicationDailyState.safetyEl;
    if (!hintEl) return;
    const medModule = getMedicationModule();
    if (!medModule) {
      hintEl.hidden = true;
      hintEl.innerHTML = '';
      medicationDailyState.lastSafetyPending = null;
      return;
    }
    const prevDay = shiftDayIso(dayIso, -1);
    if (!prevDay) {
      hintEl.hidden = true;
      hintEl.innerHTML = '';
      medicationDailyState.lastSafetyPending = null;
      return;
    }
    try {
      const data = await medModule.loadMedicationForDay(prevDay, { reason: 'capture:safety' });
      const pending = Array.isArray(data?.medications)
        ? data.medications.some((med) => med.active !== false && !med.taken)
        : false;
      if (!pending) {
        hintEl.hidden = true;
        hintEl.innerHTML = '';
        if (medicationDailyState.lastSafetyPending !== false) {
          diag.add?.(
            `[capture:med] safety cleared prev=${prevDay}`
          );
          medicationDailyState.lastSafetyPending = false;
        }
        return;
      }
      if (medicationDailyState.lastSafetyPending !== true) {
        diag.add?.(`[capture:med] safety pending prev=${prevDay}`);
        medicationDailyState.lastSafetyPending = true;
      }
      hintEl.hidden = false;
      hintEl.innerHTML = `
        <strong>Sicherheitshinweis</strong>
        <p>Für ${prevDay} wurde mindestens eine Einnahme nicht bestätigt.</p>
        <div class="medication-safety-actions">
          <button type="button" class="btn ghost small" data-med-safety-goto="${escapeAttr(prevDay)}">Zu gestern wechseln</button>
        </div>
      `;
    } catch (err) {
      hintEl.hidden = true;
      hintEl.innerHTML = '';
      if (medicationDailyState.lastSafetyPending !== null) {
        diag.add?.('[capture:med] safety hint error');
        medicationDailyState.lastSafetyPending = null;
      }
      diag.add?.(`[capture:med] safety fetch error ${err?.message || err}`);
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
    medicationDailyState.dayIso = dayIso || todayStr();
    if (!captureIntakeState.logged) {
      renderMedicationDailyPlaceholder('Bitte anmelden, um Medikamente zu verwalten.');
      return;
    }
    diag.add?.(
      `[capture:med] refresh start day=${medicationDailyState.dayIso} reason=${reason} force=${force}`
    );
    if (!force && medicationDailyState.data && medicationDailyState.data.dayIso === medicationDailyState.dayIso) {
      renderMedicationDaily(medicationDailyState.data);
      updateMedSafetyHint(medicationDailyState.dayIso);
      return;
    }
    listEl.innerHTML = '<p class="muted small">Medikamente werden geladen …</p>';
    try {
      const data = await medModule.loadMedicationForDay(medicationDailyState.dayIso, { reason: `capture:${reason}` });
      medicationDailyState.data = data;
      renderMedicationDaily(data);
      updateMedSafetyHint(medicationDailyState.dayIso);
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

  // SUBMODULE: setCaptureIntakeDisabled @public - toggles capture inputs and buttons
  function setCaptureIntakeDisabled(disabled){
    const state = !!disabled;
    ['cap-water-add','cap-salt-add','cap-protein-add'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = state;
    });
    ['cap-water-add-btn','cap-salt-add-btn','cap-protein-add-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = state;
    });
  }

  /** MODULE: CAPTURE (Intake)
   * intent: UI Helpers fuer Intake-Status, Guards und Reset-Flows (Fortsetzung)
   * contracts: nutzt requestUiRefresh, saveIntakeTotals*, DATA ACCESS Helfer
   * exports: setCaptureIntakeDisabled, prepareIntakeStatusHeader, updateCaptureIntakeStatus, clearCaptureIntakeInputs, handleCaptureIntake
   * notes: Fortsetzung des Capture-Logikblocks (Status/Guards)
   */
  // SUBMODULE: clearCaptureIntakeInputs @internal - leert temporaere Intake-Felder vor neuem Save-Lauf
  function clearCaptureIntakeInputs(){
    ['water', 'salt', 'protein'].forEach(kind => {
      const input = document.getElementById(`cap-${kind}-add`);
      if (input) input.value = '';
    });
  }

  // SUBMODULE: millisUntilNextMidnight @public - calculates next midnight reset window
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

  // SUBMODULE: handleMidnightRefresh @public - triggers capture refresh on new day
  async function handleMidnightRefresh(){
    AppModules.captureGlobals.setMidnightTimer(null);
    try {
      await maybeRefreshForTodayChange({ force: true, source: 'midnight' });
    } finally {
      scheduleMidnightRefresh();
    }
  }

  // SUBMODULE: scheduleMidnightRefresh @public - arms midnight timer loop
  function scheduleMidnightRefresh(){
    try {
      const timer = AppModules.captureGlobals.getMidnightTimer();
      if (timer) clearTimeout(timer);
      const delay = millisUntilNextMidnight();
      AppModules.captureGlobals.setMidnightTimer(setTimeout(handleMidnightRefresh, delay));
    } catch (_) { /* noop */ }
  }

  // SUBMODULE: maybeResetIntakeForToday @public - ensures intake reset runs once per day
  async function maybeResetIntakeForToday(todayIso){
    try {
      const last = AppModules.captureGlobals.getIntakeResetDoneFor();
      if (last === todayIso) return;
      AppModules.captureGlobals.setIntakeResetDoneFor(todayIso);
    } catch (_) { /* noop */ }
  }

  // SUBMODULE: scheduleNoonSwitch @public - toggles BP context at noon
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

  // SUBMODULE: maybeRefreshForTodayChange @public - reconciles capture state for day switches
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
      try { maybeResetIntakeForToday(todayIso); } catch(_) {}
    }

    try {
      const normalizedSource = typeof source === 'string' && source.trim() ? source.trim() : '';
      await refreshCaptureIntake({
        reason: normalizedSource || (force ? 'force' : 'auto')
      });
    } catch(_) {}

    AppModules.captureGlobals.setLastKnownToday(todayIso);
    if (!AppModules.captureGlobals.getMidnightTimer()) scheduleMidnightRefresh();
    scheduleNoonSwitch();
    if (!userPinnedOtherDay) {
      AppModules.captureGlobals.setBpUserOverride(false);
      maybeAutoApplyBpContext({ force: true, source: source || 'day-change' });
    }
    diag.add?.(`intake: day refresh (${source || 'auto'})`);
  }

  // SUBMODULE: prepareIntakeStatusHeader @public - ensures pills/status header exists
  function prepareIntakeStatusHeader(){
    try {
      const wrap = document.getElementById('capturePillsRow');
      if (!wrap) return;

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

      const refNode = top?.nextSibling;
      if (wrap && top) {
        if (refNode) {
          wrap.insertBefore(top, refNode);
        } else {
          wrap.appendChild(top);
        }
      }
    } catch(_) {}
  }

  // SUBMODULE: updateCaptureIntakeStatus @public - renders intake KPI pills
  const updateCaptureIntakeStatus = debounce(function(){
    const startedAt = (typeof performance !== "undefined" && typeof performance.now === "function") ? performance.now() : null;
    try {
      const statusEl = document.getElementById('cap-intake-status');
      let statusTop = document.getElementById('cap-intake-status-top');
      if (!statusEl && !statusTop) return;

      if (!statusTop) {
        prepareIntakeStatusHeader();
        statusTop = document.getElementById('cap-intake-status-top');
      }

      if (statusTop) {
        statusTop.setAttribute('role','group');
        statusTop.setAttribute('aria-live','polite');
        statusTop.setAttribute('tabindex','0');
      }

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
        return;
      }

      const t = captureIntakeState.totals || {};
      const waterVal = Math.round(t.water_ml || 0);
      const saltVal = Number(t.salt_g || 0);
      const proteinVal = Number(t.protein_g || 0);

      const pills = [
        { cls: 'plain', label: 'Wasser', value: `${waterVal} ml` },
        { cls: 'plain', label: 'Salz', value: `${fmtDE(saltVal,1)} g` },
        { cls: 'plain', label: 'Protein', value: `${fmtDE(proteinVal,1)} g` }
      ];

      if (latestTrendpilotEntry && latestTrendpilotEntry.severity) {
        const tpMeta = getTrendpilotSeverityMeta(latestTrendpilotEntry.severity);
        if (tpMeta) {
          const dayLabel = formatTrendpilotDay(latestTrendpilotEntry.day);
          const preview = (latestTrendpilotEntry.text || '').split(/\r?\n/)[0].trim();
          const ariaParts = [`Trendpilot: ${tpMeta.longLabel}`];
          if (dayLabel) ariaParts.push(`am ${dayLabel}`);
          if (preview) ariaParts.push(preview);
          pills.push({
            cls: tpMeta.cls,
            label: 'Trendpilot',
            value: `${tpMeta.shortLabel}${dayLabel ? ` (${dayLabel})` : ''}`,
            ariaOverride: ariaParts.join(', '),
            title: preview
          });
        }
      }

      const summary = pills.map(p => `${p.label} ${p.value}`).join(', ');
      const html = pills.map(p => {
        const aria = p.ariaOverride || `${p.label}: ${p.value}`;
        const titleAttr = p.title ? ` title="${escapeAttr(p.title)}"` : '';
        const dot = p.cls === 'plain' ? '' : '<span class="dot" aria-hidden="true"></span>';
        return `<span class="pill ${p.cls}" role="status" aria-label="${aria}"${titleAttr}>${dot}${p.label}: ${p.value}</span>`;
      }).join(' ');

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
      recordPerfStat('header_intake', startedAt);
    }
  }, 150);

  const cloneIntakeTotals = (source) => ({
    water_ml: Number(source?.water_ml) || 0,
    salt_g: Number(source?.salt_g) || 0,
    protein_g: Number(source?.protein_g) || 0
  });

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

  // SUBMODULE: refreshCaptureIntake @extract-candidate - laedt Intake-Daten und synchronisiert Pills/UI
  const normalizeRefreshReason = (value, fallback = 'manual') => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && typeof value.reason === 'string' && value.reason.trim()) {
      return value.reason.trim();
    }
    return fallback;
  };

  async function refreshCaptureIntake(reasonOrOptions){
    const refreshReason = normalizeRefreshReason(reasonOrOptions, 'manual');
    const wrap = document.getElementById('cap-intake-wrap');
    const dayIso = document.getElementById('date')?.value || todayStr();
    logCaptureRefreshStart(refreshReason, dayIso);
    let refreshLogClosed = false;
    const closeRefreshLog = (status = 'done', detail, severity) => {
      if (refreshLogClosed) return;
      refreshLogClosed = true;
      logCaptureRefreshEnd(refreshReason, dayIso, status, detail, severity);
    };
    if (!wrap) {
      closeRefreshLog('skipped', 'capture wrapper missing');
      return;
    }
    try {
      captureIntakeState.dayIso = dayIso;
      clearCaptureIntakeInputs();

  const logged = await isLoggedInFast();
  // Unknown-Phase: so tun, als ob weiter eingeloggt (keine Sperre!)
  const effectiveLogged = (getAuthState() === 'unknown' && wasRecentlyLoggedIn()) ? true : !!logged;
  captureIntakeState.logged = effectiveLogged;

  if (!effectiveLogged){
    captureIntakeState.totals = { water_ml: 0, salt_g: 0, protein_g: 0 };
    setCaptureIntakeDisabled(true);
    updateCaptureIntakeStatus();
    try{ __lsTotals = { water_ml: 0, salt_g: 0, protein_g: 0 }; updateLifestyleBars(); }catch(_){ }
    renderMedicationDailyPlaceholder('Bitte anmelden, um Medikamente zu verwalten.');
    closeRefreshLog('skipped', 'auth required');
    return;
  }

  setCaptureIntakeDisabled(false);
  let refreshStatus = 'done';
  let refreshDetail = '';
  let refreshSeverity;
  try{
    const uid = await getUserId();
    // Unknown-Phase: UID kann transient null sein -> NICHT sperren
    if (!uid && getAuthState() !== 'unknown'){
      captureIntakeState.logged = false;
      captureIntakeState.totals = { water_ml: 0, salt_g: 0, protein_g: 0 };
      setCaptureIntakeDisabled(true);
    } else {
        const totals = await loadIntakeToday({ user_id: uid, dayIso, reason: refreshReason });
        captureIntakeState.totals = totals || { water_ml: 0, salt_g: 0, protein_g: 0 };
        captureIntakeState.logged = true;
        try{ __lsTotals = captureIntakeState.totals; updateLifestyleBars(); }catch(_){ }
      }
    }catch(e){
      captureIntakeState.totals = { water_ml: 0, salt_g: 0, protein_g: 0 };
      try {
        const errMsg = e?.message || e;
        refreshStatus = 'error';
        refreshDetail = errMsg;
        refreshSeverity = 'error';
        diag.add?.('Capture intake load error: ' + errMsg);
        updateLifestyleBars();
      } catch(_) { }
    }

    __lastKnownToday = todayStr();
    updateCaptureIntakeStatus();
    if (captureIntakeState.logged) {
      refreshMedicationDaily({ dayIso, reason: refreshReason }).catch(() => {});
    } else {
      renderMedicationDailyPlaceholder('Bitte anmelden, um Medikamente zu verwalten.');
    }
    closeRefreshLog(refreshStatus, refreshDetail, refreshSeverity);
  } catch (err) {
      closeRefreshLog('error', err?.message || err, 'error');
      throw err;
    }
  }

  // SUBMODULE: handleCaptureIntake @internal - validiert Intake-Eingaben, triggert RPC-Speicherpfad und Refresh-Fallbacks
  async function handleCaptureIntake(kind){
    if (!isHandlerStageReady()) return;
    const btn = document.getElementById(`cap-${kind}-add-btn`);
    const input = document.getElementById(`cap-${kind}-add`);
    if (!btn || !input) return;

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
    if (kind === 'water'){
      value = Number(input.value);
      if (!(value > 0)){
        uiError('Bitte gueltige Wassermenge eingeben.');
        diag.add?.('[capture] blocked: invalid water value ' + input.value);
        return;
      }
    } else {
      value = toNumDE(input.value);
      if (!(value > 0)){
        uiError(kind === 'salt' ? 'Bitte gueltige Salzmenge eingeben.' : 'Bitte gueltige Proteinmenge eingeben.');
        diag.add?.(`[capture] blocked: invalid ${kind} value ${input.value}`);
        return;
      }
    }
    diag.add?.(`[capture] parsed ${kind}=${value}`);

    const totals = { ...captureIntakeState.totals };
    let message = '';
    if (kind === 'water'){
      const total = Math.max(0, Math.min(MAX_WATER_ML, (totals.water_ml || 0) + value));
      totals.water_ml = roundValue('water_ml', total);
      message = 'Wasser aktualisiert.';
    } else if (kind === 'salt'){
      const total = Math.max(0, Math.min(MAX_SALT_G, (totals.salt_g || 0) + value));
      totals.salt_g = roundValue('salt_g', total);
      message = 'Salz aktualisiert.';
    } else {
      const total = Math.max(0, Math.min(MAX_PROTEIN_G, (totals.protein_g || 0) + value));
      totals.protein_g = roundValue('protein_g', total);
      message = 'Protein aktualisiert.';
    }
    diag.add?.(`[capture] totals ${JSON.stringify(totals)}`);

  withBusy(btn, true);
  try{
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
      uiInfo(message);
      diag.add?.(`[capture] save ok ${kind}`);
    }catch(e){
      const msg = e?.details || e?.message || e;
      if (e?.status === 401 || e?.status === 403) {
        showLoginOverlay(true);
        uiError('Bitte erneut anmelden, um weiter zu speichern.');
      } else {
        uiError('Update fehlgeschlagen: ' + msg);
      }
      diag.add?.(`[capture] save error ${kind}: ` + msg);
    }finally{
      withBusy(btn, false);
    }
  }

  // SUBMODULE: bindIntakeCapture @extract-candidate - verbindet Intake-Inputs mit Save/Guard Flows
  function bindIntakeCapture(){
    if (!isHandlerStageReady()) return;
    const wire = (id, kind) => {
      const oldBtn = document.getElementById(id);
      if (!oldBtn) return;

      // alten Button durch Clone ersetzen => entfernt alle alten Listener
      const fresh = oldBtn.cloneNode(true);
      oldBtn.replaceWith(fresh);

      // Safety: niemals "busy"/disabled, und Typ setzen
      fresh.disabled = false;
      fresh.classList.remove('busy');
      fresh.removeAttribute('aria-busy');
      fresh.removeAttribute('data-busy');
      if (!fresh.type) fresh.type = 'button';

      // Click-Handler binden (idempotent, weil frisch)
      fresh.addEventListener('click', () => {
        try { handleCaptureIntake(kind); } catch(_) {}
      });
    };

    wire('cap-water-add-btn',   'water');
    wire('cap-salt-add-btn',    'salt');
    wire('cap-protein-add-btn', 'protein');

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
      if (s > LS_SALT_MAX) status = ' * ueber Ziel';
      else if (s >= 5) status = ' * Warnung';
      sLbl.textContent = `${fmtDE(s,1)} / ${fmtDE(LS_SALT_MAX,1)} g${status}`;
    }

    if (pLbl) {
      let status = ' * noch offen';
      if (p >= 78 && p <= 90) status = ' * Zielbereich';
      else if (p > 90) status = ' * ueber Ziel';
      pLbl.textContent = `${fmtDE(p,1)} / ${fmtDE(LS_PROTEIN_GOAL,1)} g${status}`;
    }

    // Wasser: <50% rot, 50-89% gelb, 90% gruen
    let wState = 'bad';
    if (w >= LS_WATER_GOAL * 0.9) wState = 'ok';
    else if (w >= LS_WATER_GOAL * 0.5) wState = 'warn';
    setProgState(wProg, wState);

    // Salz: 0-4.9 g gruen, 5-6 gelb, >6 rot
    let sState = 'ok';
    if (s > LS_SALT_MAX) sState = 'bad';
    else if (s >= 5) sState = 'warn';
    setProgState(sProg, sState);

    // Protein: <78 neutral, 78-90 gruen, >90 rot
    let pState = 'neutral';
    if (p >= 78 && p <= 90) pState = 'ok';
    else if (p > 90) pState = 'bad';
    setProgState(pProg, pState);
  }

  async function renderLifestyle(){
    if (!isHandlerStageReady()) return;
    const logged = await isLoggedIn();
    if (!logged){
      // Nichts anzeigen, Tab ist ohnehin gesperrt
      return;
    }
    try{
      const uid = await getUserId();
      const dayIso = todayStr();
      const cur = await loadIntakeToday({ user_id: uid, dayIso });
      __lsTotals = { water_ml: cur.water_ml||0, salt_g: cur.salt_g||0, protein_g: cur.protein_g||0 };
      updateLifestyleBars();
    }catch(_){ /* ignore */ }
  }



  /** MODULE: CAPTURE (Intake)
   * intent: Panel Resets & Tastatur-Shortcuts
   * contracts: verbindet BP-/BODY-Panels und setzt UI-Kontext zurueck
   * exports: resetBodyPanel, resetCapturePanels, addCapturePanelKeys
   */
  const getResetBodyPanel = () => {
  const mod = global.AppModules?.body;
  if (mod && typeof mod.resetBodyPanel === 'function') return mod.resetBodyPanel;
  return null;
};
  function resetCapturePanels(opts = {}) {
    if (!isHandlerStageReady()) return;
    const { focus = true } = opts;
    invokeResetBpPanel('M', { focus: false });
    invokeResetBpPanel('A', { focus: false });
      const resetBodyPanelFn = getResetBodyPanel();
      if (resetBodyPanelFn) resetBodyPanelFn({ focus: false });
      window.AppModules?.lab?.resetLabPanel?.({ focus: false });
    const ctxSel = document.getElementById('bpContextSel');
    if (ctxSel) ctxSel.value = 'M';
    document.querySelectorAll('.bp-pane').forEach(pane => {
      pane.classList.toggle('active', pane.dataset.context === 'M');
    });
    window.AppModules?.bp?.updateBpCommentWarnings?.();
    if (focus) {
      const first = document.getElementById('captureAmount');
      if (first) first.focus();
    }
  }
  function addCapturePanelKeys(){
    if (!isHandlerStageReady()) return;
const getActiveBpSaveButton = () => document.querySelector('.bp-pane.active .save-bp-panel-btn');
const bind = (selectors, onEnter, onEsc) => {
      document.querySelectorAll(selectors).forEach(el => {
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); onEnter?.(); }
          if (e.key === 'Escape') { e.preventDefault(); onEsc?.(); }
        });
      });
    };
    bind('#captureAmount, #diaM, #pulseM, #bpCommentM', () => getActiveBpSaveButton()?.click(), () => invokeResetBpPanel('M'));
    bind('#sysA, #diaA, #pulseA, #bpCommentA', () => getActiveBpSaveButton()?.click(), () => invokeResetBpPanel('A'));
      const resetBodyPanelFn = getResetBodyPanel();
      bind('#weightDay, #input-waist-cm, #fatPctDay, #musclePctDay', () => document.getElementById('saveBodyPanelBtn')?.click(), () => resetBodyPanelFn?.());
      bind('#labEgfr, #labCreatinine, #labCkdStage, #labHba1c, #labLdl, #labPotassium, #labComment', () => document.getElementById('saveLabPanelBtn')?.click(), () => window.AppModules?.lab?.resetLabPanel?.());
    }

    const vitalsTabsHost = document.querySelector('.hub-vitals');
    const vitalsTabButtons = document.querySelectorAll('[data-vitals-tab]');
    const vitalsPanels = document.querySelectorAll('[data-vitals-panel]');
    let activeVitalsTab = 'bp';
    const setActiveVitalsTab = (tab) => {
      activeVitalsTab = tab;
      vitalsTabButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-vitals-tab') === tab;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      vitalsPanels.forEach((panel) => {
        const isActive = panel.getAttribute('data-vitals-panel') === tab;
        panel.classList.toggle('is-active', isActive);
        if (isActive) {
          panel.removeAttribute('aria-hidden');
          panel.hidden = false;
        } else {
          panel.setAttribute('aria-hidden', 'true');
          panel.hidden = true;
        }
      });
    };
    if (vitalsTabsHost && vitalsTabButtons.length && vitalsPanels.length) {
      vitalsTabsHost.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-vitals-tab]');
        if (!btn) return;
        const next = btn.getAttribute('data-vitals-tab');
        if (!next || next === activeVitalsTab) return;
        setActiveVitalsTab(next);
      });
      setActiveVitalsTab(activeVitalsTab);
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
    resetCapturePanels: resetCapturePanels,
    addCapturePanelKeys: addCapturePanelKeys,
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
