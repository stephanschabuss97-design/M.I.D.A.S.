'use strict';
/**
 * MODULE: app/doctor.js
 * Description: Steuert die Arzt-Ansicht lädt Tagesdaten, verwaltet Sperrlogik (Unlock), Scrollstatus und Exportfunktionen.
 * Submodules:
 *  - globals (AppModules, diag, Scroll-State)
 *  - access-control (Doctor-Unlock-Logik und Fehlerbehandlung)
 *  - renderDoctor (Haupt-Renderer mit Zugriffsschutz, Scrollwiederherstellung und Lösch-Handling)
 *  - renderDoctorDay (Template-Funktion für Tageskarten)
 *  - exportDoctorJson (Exportfunktion für alle Gesundheitsdaten als JSON)
 *  - doctorApi (Registrierung im global.AppModules-Namespace)
 */

// SUBMODULE: globals @internal - Initialisierung globaler Handles & State
(function(global){
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const getSupabaseState = () => getSupabaseApi()?.supabaseState || {};
  const isAuthReady = () => getSupabaseState()?.authState !== 'unknown';
  const isStageReady = () => {
    const bootFlow = global.AppModules?.bootFlow;
    if (!bootFlow?.isStageAtLeast) return isAuthReady();
    return bootFlow.isStageAtLeast('INIT_MODULES') && isAuthReady();
  };
  const DEBUG_DOCTOR_LOGS =
    typeof appModules?.config?.DEV_ALLOW_DEFAULTS === 'boolean'
      ? appModules.config.DEV_ALLOW_DEFAULTS
      : false;
  const logDoctorConsole = (level, ...args) => {
    if (!DEBUG_DOCTOR_LOGS) return;
    try {
      global.console?.[level]?.(...args);
    } catch (_) {
      /* noop */
    }
  };
  const DOCTOR_TABS = ['bp', 'body', 'lab', 'activity'];
  const MAX_DOCTOR_RANGE_DAYS = 400;
  let __doctorActiveTab = DOCTOR_TABS[0];
  let __doctorScrollSnapshot = { top: 0, ratio: 0 };
  const doctorRefreshLogInflight = new Map();
  const doctorRefreshKey = (reason, from, to) =>
    `${reason || 'manual'}|${from || 'n/a'}|${to || 'n/a'}`;
  const logDoctorRefreshStart = (reason, from, to) => {
    const key = doctorRefreshKey(reason, from, to);
    const entry = doctorRefreshLogInflight.get(key);
    if (entry) {
      entry.count += 1;
      return key;
    }
    doctorRefreshLogInflight.set(key, { count: 1 });
    diag.add?.(
      `[doctor] refresh start reason=${reason} range=${from || 'n/a'}..${to || 'n/a'}`
    );
    return key;
  };
  const logDoctorRefreshEnd = (reason, from, to, status = 'done', detail, severity) => {
    const key = doctorRefreshKey(reason, from, to);
    const entry = doctorRefreshLogInflight.get(key);
    doctorRefreshLogInflight.delete(key);
    const count = entry?.count || 1;
    const suffix = count > 1 ? ` (x${count})` : '';
    const extra = detail ? ` – ${detail}` : '';
    const opts = severity ? { severity } : undefined;
    diag.add?.(
      `[doctor] refresh ${status} reason=${reason} range=${from || 'n/a'}..${to || 'n/a'}${extra}${suffix}`,
      opts
    );
  };
  const getSupabaseApi = () => global.AppModules?.supabase || {};
  const toast =
    global.toast ||
    appModules.ui?.toast ||
    ((msg) => {
      try {
        diag.add?.(`[doctor:toast] ${msg}`);
      } catch (_) {}
      logDoctorConsole('info', '[doctor]', msg);
    });
  const escapeAttr = (value = '') =>
    String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch));
  const fmtDateDE = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(`${iso}T00:00:00Z`);
      if (Number.isNaN(d.getTime())) throw new Error('invalid');
      return d.toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (_) {
      return '-';
    }
  };
  const TRENDPILOT_SEVERITY_META = {
    warning: { label: 'Warnung', className: 'is-warning' },
    critical: { label: 'Kritisch', className: 'is-critical' }
  };
  const TRENDPILOT_STATUS_LABELS = {
    none: 'Kein Arzt-Status',
    planned: 'Arztabklärung geplant',
    done: 'Arztabklärung erledigt'
  };
  const getDoctorStatusLabel = (status) =>
    TRENDPILOT_STATUS_LABELS[status] || TRENDPILOT_STATUS_LABELS.none;
  const getSeverityMeta = (severity) =>
    TRENDPILOT_SEVERITY_META[severity] || { label: 'Info', className: 'is-info' };

  const TRENDPILOT_TEXT_MAP = {
    'bp-trend-v1': {
      doctor:
        'BP-Trend: Wochenmittel ueber Baseline. Baseline {baseline_sys}/{baseline_dia}, aktuell {avg_sys}/{avg_dia}, Delta {delta_sys}/{delta_dia}, Dauer {weeks} Wochen.'
    },
    'body-weight-trend-v1': {
      doctor:
        'Gewicht-Trend: Wochenmittel ueber Baseline. Baseline {baseline_kg} kg, aktuell {avg_kg} kg, Delta {delta_kg} kg, Dauer {weeks} Wochen.'
    },
    'lab-egfr-creatinine-trend-v1': {
      doctor:
        'Labor-Trend: eGFR/Kreatinin. Baseline {baseline_egfr}/{baseline_creatinine}, aktuell {avg_egfr}/{avg_creatinine}, Delta {delta_egfr}/{delta_creatinine}, Dauer {weeks} Wochen.'
    },
    'bp-weight-correlation-v1': {
      doctor:
        'BP/Gewicht-Korrelation: Gewicht Delta {weight_delta_kg} kg, Zeitraum {window_from} bis {window_to}, BP-Events: {bp_event_ids}, Body-Events: {body_event_ids}.'
    },
    'baseline-normalized-v1': {
      doctor:
        'Baseline neu gesetzt: {baseline_sys}/{baseline_dia} seit {baseline_from} (stabile Wochen: {sample_weeks}).'
    }
  };

  const formatTrendpilotText = (template, payload) => {
    if (!template) return '';
    return String(template).replace(/\{(\w+)\}/g, (_, key) => {
      const value = payload?.[key];
      if (value == null) return '-';
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'number') return value.toFixed(1).replace(/\.0$/, '');
      return String(value);
    });
  };

  // SUBMODULE: access-control @internal - Unlock- und Authentifizierungslogik
  const fallbackRequireDoctorUnlock = async () => {
    diag.add?.('[doctor] requireDoctorUnlock missing - blocking access');
    logDoctorConsole('warn', '[doctor] requireDoctorUnlock not available; denying unlock');
    return false;
  };
  const getAuthGuardState = () => {
    const api = global.AppModules?.supabase;
    const state = api?.authGuardState;
    return state && typeof state === 'object' ? state : null;
  };
  const isDoctorUnlockedSafe = () => {
    if (typeof global.__doctorUnlocked !== 'undefined') {
      return !!global.__doctorUnlocked;
    }
    return !!getAuthGuardState()?.doctorUnlocked;
  };
  const requestDoctorUnlock = async () => {
    const unlockFn = global.AppModules?.supabase?.requireDoctorUnlock;
    if (typeof unlockFn === 'function') {
      return unlockFn();
    }
    return fallbackRequireDoctorUnlock();
  };
  const logDoctorError = (msg, err) => {
    const detail = err?.message || err;
    diag.add?.(`[doctor] ${msg}: ${detail}`);
    if (err) {
      logDoctorConsole('error', `[doctor] ${msg}`, err);
    } else {
      logDoctorConsole('error', `[doctor] ${msg}`);
    }
  };

  const resolveTrendpilotFetcher = () => {
    const api = getSupabaseApi();
    if (typeof api.fetchTrendpilotEventsRange === 'function') return api.fetchTrendpilotEventsRange;
    return typeof api.fetchSystemCommentsRange === 'function' ? api.fetchSystemCommentsRange : null;
  };

  const resolveTrendpilotDeleter = () => {
    const api = getSupabaseApi();
    if (typeof api.deleteTrendpilotEvent === 'function') return api.deleteTrendpilotEvent;
    return typeof api.deleteSystemComment === 'function' ? api.deleteSystemComment : null;
  };

  const resolveTrendpilotAckSetter = () => {
    const api = getSupabaseApi();
    return typeof api.setTrendpilotAck === 'function' ? api.setTrendpilotAck : null;
  };

  const resolveTrendpilotStatusSetter = () => {
    const api = getSupabaseApi();
    return typeof api.setSystemCommentDoctorStatus === 'function'
      ? api.setSystemCommentDoctorStatus
      : null;
  };

  const resolveLabRangeLoader = () => {
    const api = getSupabaseApi();
    return typeof api.loadLabEventsRange === 'function' ? api.loadLabEventsRange : null;
  };

  const resolveActivityRangeLoader = () => {
    const loader = appModules?.activity?.loadActivities;
    return typeof loader === 'function' ? loader : null;
  };

  const resolveUserIdFetcher = () => {
    const api = getSupabaseApi();
    return typeof api.getUserId === 'function' ? api.getUserId : null;
  };

  const loadLabEventsSafe = async (from, to) => {
    const loader = resolveLabRangeLoader();
    const uidFetcher = resolveUserIdFetcher();
    if (typeof loader !== 'function' || typeof uidFetcher !== 'function') return [];
    const uid = await uidFetcher();
    if (!uid) return [];
    const rows = await loader({ user_id: uid, from, to });
    return Array.isArray(rows) ? rows : [];
  };

  const loadActivityEventsSafe = async (from, to) => {
    const loader = resolveActivityRangeLoader();
    if (typeof loader !== 'function') return [];
    const rows = await loader(from, to, { reason: 'doctor:activity' });
    return Array.isArray(rows) ? rows : [];
  };

  const renderTrendpilotActionButton = (status, current) => {
    const isActive = status === (current || 'none');
    const label =
      status === 'planned'
        ? 'Arztabklärung geplant'
        : status === 'done'
          ? 'Erledigt'
          : 'Zurücksetzen';
    return `<button class="btn ghost ${isActive ? 'is-active' : ''}" data-doctor-status="${status}">${label}</button>`;
  };

  
  
  const formatTrendpilotRange = (entry, fmtDateDE) => {
    const from = entry?.window_from || entry?.day || '';
    const to = entry?.window_to || entry?.day || '';
    if (!from && !to) return '-';
    if (from && to && from != to) {
      return `${fmtDateDE(from)} - ${fmtDateDE(to)}`;
    }
    return fmtDateDE(from || to);
  };

  const resolveTrendpilotText = (entry) => {
    const payload = entry?.payload || {};
    const ruleId = payload.rule_id || entry?.source || '';
    const template = TRENDPILOT_TEXT_MAP[ruleId];
    const contextSentence = buildTrendpilotContextSentence(entry);
    if (template?.doctor) {
      const base = formatTrendpilotText(template.doctor, payload);
      return contextSentence ? `${base} ${contextSentence}` : base;
    }
    const fallback =
      payload.text ||
      payload.summary ||
      payload.rule_id ||
      entry?.source ||
      entry?.text ||
      'Trendpilot-Hinweis';
    return contextSentence ? `${fallback} ${contextSentence}` : fallback;
  };

  const buildTrendpilotContextSentence = (entry) => {
    if (!entry || (entry.severity !== 'warning' && entry.severity !== 'critical')) return '';
    if (entry.type === 'combined' || entry.type === 'lab') return '';
    const ctx = entry?.payload?.context;
    if (!ctx || typeof ctx !== 'object') return '';
    const weight = ctx.weight || {};
    const activity = ctx.activity || {};
    const bodycomp = ctx.bodycomp || {};
    const lab = ctx.lab || {};
    const weightUp = weight.trend === 'up';
    const waistUp = weight.waist_trend === 'up';
    const activityLevel = activity.level;
    const muscleUp = bodycomp.muscle_trend === 'up';
    const fatUp = bodycomp.fat_trend === 'up';
    const labDown = lab.egfr_trend === 'down';

    if (weightUp && waistUp) {
      return 'Kontext: Bauchumfang ist in der gleichen Phase gestiegen.';
    }
    if (weightUp && activityLevel === 'low') {
      return 'Kontext: Aktivitaet war in den letzten 4 Wochen niedrig.';
    }
    if (weightUp && activityLevel === 'high' && muscleUp) {
      return 'Kontext: Aktivitaet hoch, Muskelmasse ist gestiegen.';
    }
    if (weightUp && activityLevel === 'high' && fatUp) {
      return 'Kontext: Aktivitaet hoch, Fettanteil ist gestiegen.';
    }
    if (weightUp && activityLevel === 'high' && !muscleUp && !fatUp) {
      return 'Kontext: Aktivitaet hoch; Body-Comp fehlt fuer Einordnung.';
    }
    if (labDown) {
      return 'Kontext: Laborwerte in der Phase ruecklaeufig (eGFR).';
    }
    return '';
  };

  const renderTrendpilotRow = (entry, fmtDateDE) => {
    const severity = getSeverityMeta(entry.severity);
    const safeText = escapeAttr(resolveTrendpilotText(entry));
    const dateLabel = formatTrendpilotRange(entry, fmtDateDE);
    const ackLabel = entry.ack ? 'Bestätigt' : 'Akzeptieren';
    const ackDisabled = entry.ack ? ' disabled' : '';
    const ackClass = entry.ack ? 'ghost' : 'primary';
    return `
<article class="tp-row" data-trendpilot-id="${escapeAttr(entry.id || '')}">
  <div class="tp-meta">
    <span class="tp-date">${dateLabel}</span>
    <span class="tp-badge ${severity.className}">${severity.label}</span>
  </div>
  <div class="tp-text">${safeText}</div>
  <div class="tp-actions">
    <button class="btn ${ackClass}" type="button" data-trendpilot-action="ack"${ackDisabled}>${ackLabel}</button>
    <button class="btn ghost" type="button" data-trendpilot-action="delete">Löschen</button>
  </div>
</article>`;
  };

  const renderTrendpilotSection = (host, entries, fmtDateDE, { unavailable = false } = {}) => {
    if (!host) return;
    const count = entries?.length || 0;
    const countText = `${count} Hinweis${count === 1 ? '' : 'e'}`;
    let body = '';
    if (unavailable) {
      body = '<div class="doctor-trendpilot-empty">Trendpilot-Hinweise momentan nicht verfügbar.</div>';
    } else if (!entries?.length) {
      body = '<div class="doctor-trendpilot-empty">Keine Trendpilot-Hinweise in diesem Zeitraum.</div>';
    } else {
      const rows = entries.map((entry) => renderTrendpilotRow(entry, fmtDateDE)).join('');
      body = `<div class="doctor-trendpilot-list">${rows}</div>`;
    }
    const hasUnacked = Array.isArray(entries) ? entries.some((entry) => !entry?.ack) : false;
    const openAttr = hasUnacked ? ' open' : '';
    host.innerHTML = `
<details class="doctor-accordion doctor-trendpilot-accordion"${openAttr}>
  <summary class="doctor-accordion-head">
    <strong>Trendpilot-Hinweise</strong>
    <span class="small">${countText}</span>
  </summary>
  <div class="doctor-accordion-body">
    ${body}
  </div>
</details>`;
  };

  const updateTrendpilotStatusUi = (row, status) => {
    if (!row) return;
    row.querySelectorAll('[data-doctor-status]').forEach((btn) => {
      const btnStatus = btn.getAttribute('data-doctor-status');
      btn.classList.toggle('is-active', btnStatus === status);
    });
    const labelEl = row.querySelector('[data-status-label]');
    if (labelEl) labelEl.textContent = getDoctorStatusLabel(status);
  };

  const getDoctorTabPanels = () => {
    const doc = global.document;
    if (!doc) return {};
    return {
      bp: doc.getElementById('doctorTabBp'),
      body: doc.getElementById('doctorTabBody'),
      lab: doc.getElementById('doctorTabLab'),
      activity: doc.getElementById('doctorTabActivity')
    };
  };

  const primaryReportState = {
    userId: null,
    lifecycle: 0,
    status: 'idle',
    result: null,
    promise: null,
    createInFlight: false,
    createVersion: 0
  };
  let reportCreateOpener = null;

  const liveRangeState = {
    version: 0,
    from: '',
    to: '',
    status: 'idle',
    userSelected: false,
    loadedKey: '',
    dirty: true
  };

  const liveRangeKey = (from, to) => `${from || ''}|${to || ''}`;

  const validateLiveRange = (from, to) => {
    const reportsModule = global.AppModules?.reports;
    if (typeof reportsModule?.validateRangeReportInput === 'function') {
      return reportsModule.validateRangeReportInput({
        from,
        to,
        today: reportsModule.getViennaToday?.()
      });
    }
    const validIso = (value) => {
      const raw = String(value || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
      const date = new Date(`${raw}T00:00:00Z`);
      return !Number.isNaN(date.getTime())
        && date.toISOString().slice(0, 10) === raw;
    };
    const errors = [];
    if (!validIso(from)) errors.push('from_invalid');
    if (!validIso(to)) errors.push('to_invalid');
    if (validIso(from) && validIso(to) && from > to) errors.push('range_reversed');
    if (validIso(from) && validIso(to) && from <= to) {
      const spanDays =
        (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`))
          / 86_400_000 + 1;
      if (spanDays > MAX_DOCTOR_RANGE_DAYS) errors.push('range_too_long');
    }
    return { valid: errors.length === 0, errors, from, to };
  };

  const getLiveRangeErrorMessage = (validation) => {
    const errors = validation?.errors || [];
    if (errors.includes('future_to')) {
      return 'Das Bis-Datum darf nicht in der Zukunft liegen.';
    }
    if (errors.includes('range_reversed')) {
      return 'Das Von-Datum muss vor oder am Bis-Datum liegen.';
    }
    if (errors.includes('range_too_long')) {
      return `Der Zeitraum darf maximal ${MAX_DOCTOR_RANGE_DAYS} Tage umfassen.`;
    }
    return 'Bitte einen vollständigen gültigen Zeitraum wählen.';
  };

  const setLiveRangeStatus = (message, state = 'loading') => {
    const statusEl = global.document?.getElementById('doctorLiveRangeStatus');
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.hidden = !message;
    statusEl.classList.toggle('is-error', state === 'error');
    statusEl.classList.toggle('is-partial', state === 'partial');
    statusEl.dataset.state = state;
  };

  const setLiveRangePanelsMessage = (message) => {
    Object.values(getDoctorTabPanels()).forEach((panel) => {
      if (!panel) return;
      panel.textContent = message;
      panel.classList.add('u-doctor-placeholder');
    });
  };

  const clearLiveRangePanelState = () => {
    Object.values(getDoctorTabPanels()).forEach((panel) => {
      panel?.classList.remove('u-doctor-placeholder');
    });
  };

  const clearLiveRangePanels = () => {
    Object.values(getDoctorTabPanels()).forEach((panel) => {
      if (!panel) return;
      panel.innerHTML = '';
      panel.classList.remove('u-doctor-placeholder');
    });
  };

  const resetLiveRangeState = () => {
    liveRangeState.version += 1;
    liveRangeState.from = '';
    liveRangeState.to = '';
    liveRangeState.status = 'idle';
    liveRangeState.userSelected = false;
    liveRangeState.loadedKey = '';
    liveRangeState.dirty = true;
    setLiveRangeStatus('');
    clearLiveRangePanels();
  };

  const invalidateLiveDetails = ({ clear = false } = {}) => {
    liveRangeState.version += 1;
    liveRangeState.status = 'idle';
    liveRangeState.loadedKey = '';
    liveRangeState.dirty = true;
    setLiveRangeStatus('');
    if (clear) clearLiveRangePanels();
  };

  const closeLiveDetails = () => {
    liveRangeState.version += 1;
    if (liveRangeState.status === 'loading' || liveRangeState.status === 'queued') {
      liveRangeState.loadedKey = '';
      liveRangeState.dirty = true;
    }
    liveRangeState.status = liveRangeState.dirty ? 'idle' : 'ready';
    setLiveRangeStatus('');
  };

  const initializeLiveRangeFromReport = (report) => {
    if (liveRangeState.userSelected) return false;
    const fromInput = global.document?.getElementById('from');
    const toInput = global.document?.getElementById('to');
    if (!fromInput || !toInput) return false;
    const from = report?.period?.from || report?.payload?.period?.from || '';
    const to = report?.period?.to || report?.payload?.period?.to || '';
    const validation = validateLiveRange(from, to);
    if (!validation.valid) return false;
    fromInput.value = from;
    toInput.value = to;
    return true;
  };

  const readLiveDetailRange = () => {
    const from = global.document?.getElementById('from')?.value || '';
    const to = global.document?.getElementById('to')?.value || '';
    const validation = validateLiveRange(from, to);
    return validation.valid
      ? { from: validation.from, to: validation.to, source: 'live_details' }
      : null;
  };

  const readPrimaryReportRange = () => {
    const report = primaryReportState.result?.report || null;
    const from = report?.period?.from || report?.payload?.period?.from || '';
    const to = report?.period?.to || report?.payload?.period?.to || '';
    const validation = validateLiveRange(from, to);
    return validation.valid
      ? { from: validation.from, to: validation.to, source: 'visible_report' }
      : null;
  };

  const getActiveConsumerRange = () => {
    const details = global.document?.getElementById('doctorDailyWrap');
    if (details && !details.hidden) {
      return readLiveDetailRange();
    }
    return readPrimaryReportRange()
      || readLiveDetailRange()
      || null;
  };

  const queueLiveRangeRefresh = () => {
    const details = global.document?.getElementById('doctorDailyWrap');
    if (!details || details.hidden) {
      invalidateLiveDetails();
      return Promise.resolve(false);
    }
    const from = global.document?.getElementById('from')?.value || '';
    const to = global.document?.getElementById('to')?.value || '';
    const validation = validateLiveRange(from, to);
    liveRangeState.version += 1;
    const requestVersion = liveRangeState.version;
    liveRangeState.from = from;
    liveRangeState.to = to;
    liveRangeState.userSelected = true;
    liveRangeState.loadedKey = '';
    liveRangeState.dirty = true;
    if (!validation.valid) {
      liveRangeState.status = 'error';
      const message = getLiveRangeErrorMessage(validation);
      setLiveRangeStatus(message, 'error');
      setLiveRangePanelsMessage(message);
      return Promise.resolve(false);
    }
    liveRangeState.status = 'queued';
    setLiveRangeStatus(
      `Einzelwerte ${fmtDateDE(from)} bis ${fmtDateDE(to)} werden geladen ...`,
      'loading'
    );
    setLiveRangePanelsMessage('Einzelwerte werden geladen ...');
    if (typeof global.requestUiRefresh !== 'function') {
      liveRangeState.status = 'error';
      const message =
        `Einzelwerte ${fmtDateDE(from)} bis ${fmtDateDE(to)} konnten nicht aktualisiert werden.`;
      setLiveRangeStatus(message, 'error');
      setLiveRangePanelsMessage(message);
      return Promise.resolve(false);
    }
    const handleRefreshFailure = (err) => {
      const currentFrom = global.document?.getElementById('from')?.value || '';
      const currentTo = global.document?.getElementById('to')?.value || '';
      if (
        liveRangeState.version !== requestVersion
        || currentFrom !== from
        || currentTo !== to
      ) {
        return false;
      }
      const message =
        `Einzelwerte ${fmtDateDE(from)} bis ${fmtDateDE(to)} konnten nicht aktualisiert werden.`;
      liveRangeState.status = 'error';
      setLiveRangeStatus(message, 'error');
      setLiveRangePanelsMessage(message);
      logDoctorError('live range refresh failed', err);
      return false;
    };
    try {
      return Promise.resolve(global.requestUiRefresh({
        reason: 'doctor:range-change',
        doctor: true
      })).catch(handleRefreshFailure);
    } catch (err) {
      return Promise.resolve(handleRefreshFailure(err));
    }
  };

  const beginLiveRangeRender = (from, to) => {
    const reuseQueuedVersion =
      liveRangeState.status === 'queued'
      && liveRangeState.from === from
      && liveRangeState.to === to;
    if (!reuseQueuedVersion) liveRangeState.version += 1;
    liveRangeState.from = from;
    liveRangeState.to = to;
    liveRangeState.status = 'loading';
    const version = liveRangeState.version;
    setLiveRangeStatus(
      `Einzelwerte ${fmtDateDE(from)} bis ${fmtDateDE(to)} werden geladen ...`,
      'loading'
    );
    setLiveRangePanelsMessage('Einzelwerte werden geladen ...');
    return { version, from, to };
  };

  const isLiveRangeRequestCurrent = (request) => {
    if (!request || liveRangeState.version !== request.version) return false;
    const currentFrom = global.document?.getElementById('from')?.value || '';
    const currentTo = global.document?.getElementById('to')?.value || '';
    return currentFrom === request.from && currentTo === request.to;
  };

  const finishLiveRangeRequest = (request, { partial = false } = {}) => {
    if (!isLiveRangeRequestCurrent(request)) return false;
    liveRangeState.status = 'ready';
    liveRangeState.loadedKey = partial ? '' : liveRangeKey(request.from, request.to);
    liveRangeState.dirty = partial;
    if (partial) {
      setLiveRangeStatus(
        `Einzelwerte ${fmtDateDE(request.from)} bis ${fmtDateDE(request.to)}: `
          + 'Einzelne Datenbereiche konnten nicht geladen werden.',
        'partial'
      );
    } else {
      setLiveRangeStatus('');
    }
    clearLiveRangePanelState();
    return true;
  };

  const setPrimaryReportStatus = (message, state = 'loading') => {
    const doc = global.document;
    const statusEl = doc?.getElementById('doctorPrimaryReportStatus');
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.hidden = !message;
    statusEl.classList.toggle('is-error', state === 'error');
    statusEl.classList.toggle('is-partial', state === 'partial');
    statusEl.dataset.state = state;
  };

  const closeReportCreatePanel = ({ restoreFocus = true } = {}) => {
    const doc = global.document;
    const panel = doc?.getElementById('doctorReportCreatePanel');
    const opener = doc?.getElementById('doctorNewRangeReportBtn');
    const errorEl = doc?.getElementById('doctorReportCreateError');
    if (panel) panel.hidden = true;
    if (opener) opener.setAttribute('aria-expanded', 'false');
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
    const focusTarget = reportCreateOpener;
    reportCreateOpener = null;
    if (
      restoreFocus
      && focusTarget?.isConnected
      && typeof focusTarget.focus === 'function'
    ) {
      focusTarget.focus();
    }
  };

  const setReportCreateBusy = (busy) => {
    const doc = global.document;
    const submitBtn = doc?.getElementById('doctorReportCreateSubmit');
    const fromInput = doc?.getElementById('doctorReportFrom');
    const toInput = doc?.getElementById('doctorReportTo');
    if (submitBtn) submitBtn.disabled = busy;
    if (fromInput) fromInput.disabled = busy;
    if (toInput) toInput.disabled = busy;
  };

  const resetDoctorState = ({ clearDom = true, status = 'loading' } = {}) => {
    primaryReportState.lifecycle += 1;
    primaryReportState.createVersion += 1;
    primaryReportState.userId = null;
    primaryReportState.status = 'idle';
    primaryReportState.result = null;
    primaryReportState.promise = null;
    primaryReportState.createInFlight = false;
    setReportCreateBusy(false);
    resetLiveRangeState();
    closeReportCreatePanel({ restoreFocus: false });
    const doc = global.document;
    const details = doc?.getElementById('doctorDailyWrap');
    const detailsBtn = doc?.getElementById('doctorDetailsBtn');
    if (details) details.hidden = true;
    if (detailsBtn) detailsBtn.setAttribute('aria-expanded', 'false');
    if (!clearDom) return;
    const reportHost = doc?.getElementById('doctorPrimaryReport');
    if (reportHost) reportHost.innerHTML = '';
    if (status === 'loading') {
      setPrimaryReportStatus('Bericht wird geladen ...', 'loading');
    } else {
      setPrimaryReportStatus('', status);
    }
  };

  const beginDoctorPanelLifecycle = () => {
    resetDoctorState({ clearDom: true });
    return primaryReportState.lifecycle;
  };

  const setDoctorActiveTab = (tab) => {
    const doc = global.document;
    if (!doc) return;
    const target = DOCTOR_TABS.includes(tab) ? tab : DOCTOR_TABS[0];
    __doctorActiveTab = target;
    doc.querySelectorAll('[data-doctor-tab]').forEach((btn) => {
      const btnTab = btn.getAttribute('data-doctor-tab');
      const isActive = btnTab === target;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (btn.hasAttribute('aria-selected')) {
        btn.setAttribute('aria-selected', String(isActive));
      }
    });
    doc.querySelectorAll('[data-doctor-panel]').forEach((panel) => {
      const panelTab = panel.getAttribute('data-doctor-panel');
      const isActive = panelTab === target;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  };

  const bindDoctorTabs = () => {
    const doc = global.document;
    if (!doc || doc.__doctorTabsBound) return;
    doc.addEventListener('click', (event) => {
      const btn = event.target?.closest?.('[data-doctor-tab]');
      if (!btn || !btn.closest('#doctor')) return;
      const tab = btn.getAttribute('data-doctor-tab');
      if (!tab) return;
      setDoctorActiveTab(tab);
    });
    doc.addEventListener('keydown', (event) => {
      const btn = event.target?.closest?.('[data-doctor-tab]');
      if (!btn || !btn.closest('#doctor')) return;
      const tabButtons = Array.from(
        doc.querySelectorAll('#doctor [data-doctor-tab]')
      );
      const currentIndex = tabButtons.indexOf(btn);
      if (currentIndex < 0) return;
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabButtons.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabButtons.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      const nextButton = tabButtons[nextIndex];
      setDoctorActiveTab(nextButton.getAttribute('data-doctor-tab'));
      nextButton.focus();
    });
    setDoctorActiveTab(__doctorActiveTab);
    doc.__doctorTabsBound = true;
  };

  if (global.document?.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', bindDoctorTabs, { once: true });
  } else {
    bindDoctorTabs();
  }

  async function loadTrendpilotEntries(from, to) {
    const api = getSupabaseApi();
    const fetcher = resolveTrendpilotFetcher();
    if (typeof fetcher !== 'function') return [];
    const order = typeof api.fetchTrendpilotEventsRange === 'function' ? 'window_from.desc' : 'day.desc';
    const result = await fetcher({ from, to, order });
    return Array.isArray(result) ? result : [];
  }


  async function onTrendpilotAction(event) {
    const btn = event.target.closest('[data-trendpilot-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-trendpilot-action');
    const row = btn.closest('[data-trendpilot-id]');
    if (!row) return;
    const id = row.getAttribute('data-trendpilot-id');
    if (!id) return;

    if (action === 'ack') {
    if (btn.disabled) return;
      const setter = resolveTrendpilotAckSetter();
      if (typeof setter !== 'function') {
        toast('Trendpilot-Ack kann nicht gesetzt werden.');
        return;
      }
      row.classList.add('is-loading');
      btn.disabled = true;
      try {
        await setter({ id, ack: true });
        toast('Trendpilot bestätigt.');
        const from = global.document?.getElementById('from')?.value || '';
        const to = global.document?.getElementById('to')?.value || '';
        const trendpilotWrap = global.document?.getElementById('doctorTrendpilot');
        if (trendpilotWrap) {
          const entries = await loadTrendpilotEntries(from, to);
          renderTrendpilotSection(trendpilotWrap, entries, fmtDateDE, { unavailable: false });
        }
      } catch (err) {
        logDoctorError('trendpilot ack failed', err);
        uiError?.('Trendpilot-Ack konnte nicht gesetzt werden.');
      } finally {
        row.classList.remove('is-loading');
        btn.disabled = false;
      }
      return;
    }

    if (action !== 'delete') return;
    const deleter = resolveTrendpilotDeleter();
    if (typeof deleter !== 'function') {
      toast('Trendpilot-Eintrag kann nicht gelöscht werden.');
      return;
    }
    if (!confirm('Trendpilot-Eintrag wirklich l?schen?')) return;
    row.classList.add('is-loading');
    btn.disabled = true;
    try {
      await deleter({ id });
      toast('Trendpilot-Eintrag gelöscht.');
      const from = global.document?.getElementById('from')?.value || '';
      const to = global.document?.getElementById('to')?.value || '';
      const trendpilotWrap = global.document?.getElementById('doctorTrendpilot');
      if (trendpilotWrap) {
        const entries = await loadTrendpilotEntries(from, to);
        renderTrendpilotSection(trendpilotWrap, entries, fmtDateDE, { unavailable: false });
      }
    } catch (err) {
      logDoctorError('trendpilot delete failed', err);
      uiError?.('Trendpilot-Eintrag konnte nicht gelöscht werden.');
    } finally {
      row.classList.remove('is-loading');
      btn.disabled = false;
    }
  }

/* ===== Doctor view ===== */

const __t0 = performance.now();

// SUBMODULE: renderDoctor @extract-candidate - orchestrates gated render flow, fetches days, manages scroll state
async function renderDoctor(triggerReason = 'manual'){
  if (!isStageReady()) return;
  const host = $("#doctorView");
  if (!host) return;
  const panels = getDoctorTabPanels();
  const placeholderHtml = (text) => `<div class="small u-doctor-placeholder">${text}</div>`;
  const fillAllPanels = (html) => {
    Object.values(panels).forEach((panel) => {
      if (panel) panel.innerHTML = html;
    });
  };

  const scroller = document.getElementById('doctorDailyWrap') || host.parentElement || host;
  if (!scroller.dataset.scrollWatcher) {
    scroller.addEventListener('scroll', () => {
      const h = scroller.scrollHeight || 1;
      __doctorScrollSnapshot.top = scroller.scrollTop;
      __doctorScrollSnapshot.ratio = h ? Math.min(1, scroller.scrollTop / h) : 0;
    }, { passive: true });
    scroller.dataset.scrollWatcher = "1";
  }

  const online = global?.navigator?.onLine !== false;
  let loggedIn = false;
  try {
    loggedIn = await isLoggedIn();
  } catch (_) {
    loggedIn = false;
  }
  if (!loggedIn && online){
    resetDoctorState({ clearDom: true, status: 'idle' });
    fillAllPanels(placeholderHtml('Bitte anmelden, um die Arzt-Ansicht zu sehen.'));
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
    return;
  }
  // Nur sperren, wenn die Arzt-Ansicht wirklich aktiv angezeigt wird
  const doctorSection = document.getElementById('doctor');
  const isActive = !!doctorSection && doctorSection.classList.contains('active');
  if (!isDoctorUnlockedSafe()){
    if (isActive){
      fillAllPanels(placeholderHtml('Bitte Arzt-Ansicht kurz entsperren.'));
      try {
        await requestDoctorUnlock();
      } catch(err) {
        logDoctorError('Failed to requireDoctorUnlock', err);
      }
      if (!isDoctorUnlockedSafe()) return;
    } else {
      return;
    }
  }

  const prevScrollTop = (__doctorScrollSnapshot?.top ?? scroller.scrollTop ?? 0) || 0;
  const prevScrollRatio = (__doctorScrollSnapshot?.ratio ?? 0) || 0;
  bindReportFirstControls();
  await renderPrimaryDoctorReport();

  const details = document.getElementById('doctorDailyWrap');
  if (!details || details.hidden) {
    invalidateLiveDetails();
    return;
  }

  fillAllPanels('');

  // Anzeige-Helper
  const dash = v => (v === null || v === undefined || v === "" ? "-" : String(v));
  const fromInput = $("#from");
  const toInput = $("#to");
  const from = fromInput?.value || '';
  const to = toInput?.value || '';
  const liveRangeValidation = validateLiveRange(from, to);
  if (!liveRangeValidation.valid){
    liveRangeState.version += 1;
    liveRangeState.from = from;
    liveRangeState.to = to;
    liveRangeState.status = 'error';
    const message = getLiveRangeErrorMessage(liveRangeValidation);
    setLiveRangeStatus(message, 'error');
    fillAllPanels(placeholderHtml(message));
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
    return;
  }
  const liveRangeRequest = beginLiveRangeRender(from, to);
  const isDayInRange = (day) => {
    if (!day) return false;
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  };
  const normalizeLocalCtx = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return null;
    if (raw === 'm' || raw.startsWith('morg')) return 'M';
    if (raw === 'a' || raw.startsWith('aben')) return 'A';
    return null;
  };
  const buildDailyFromLocalEntries = (entries = []) => {
    const days = new Map();
    for (const entry of entries) {
      const day = entry?.date || entry?.day || '';
      if (!day || !isDayInRange(day)) continue;
      let bucket = days.get(day);
      if (!bucket) {
        bucket = {
          date: day,
          morning: { sys: null, dia: null, pulse: null, map: null },
          evening: { sys: null, dia: null, pulse: null, map: null },
          weight: null,
          waist_cm: null,
          fat_pct: null,
          muscle_pct: null,
          fat_kg: null,
          muscle_kg: null,
          notes: '',
          remoteIds: [],
          hasCloud: false,
          __notesTs: -1,
          __noteText: '',
          __bpNotes: []
        };
        days.set(day, bucket);
      }
      const ts = Number.isFinite(entry?.ts) ? entry.ts : Date.parse(entry?.dateTime || '') || 0;
      const note = (entry?.notes || '').trim();
      if (note && ts >= (bucket.__notesTs ?? -1)) {
        bucket.__noteText = note;
        bucket.__notesTs = ts;
      }
      const ctx = normalizeLocalCtx(entry?.context || entry?.ctx);
      const bpComment = (entry?.bp_comment || '').trim();
      if (bpComment && ctx) {
        const prefix = ctx === 'M' ? '[Morgens] ' : '[Abends] ';
        bucket.__bpNotes.push(`${prefix}${bpComment}`.trim());
      }
      if (entry?.sys != null || entry?.dia != null || entry?.pulse != null) {
        const block = ctx === 'M' ? bucket.morning : ctx === 'A' ? bucket.evening : null;
        if (block) {
          if (entry.sys != null) block.sys = entry.sys;
          if (entry.dia != null) block.dia = entry.dia;
          if (entry.pulse != null) block.pulse = entry.pulse;
          if (entry.map != null) block.map = entry.map;
        }
      }
      if (
        entry?.weight != null ||
        entry?.waist_cm != null ||
        entry?.fat_pct != null ||
        entry?.muscle_pct != null ||
        entry?.fat_kg != null ||
        entry?.muscle_kg != null
      ) {
        if (entry.weight != null) bucket.weight = entry.weight;
        if (entry.waist_cm != null) bucket.waist_cm = entry.waist_cm;
        if (entry.fat_pct != null) bucket.fat_pct = entry.fat_pct;
        if (entry.muscle_pct != null) bucket.muscle_pct = entry.muscle_pct;
        if (entry.fat_kg != null) bucket.fat_kg = entry.fat_kg;
        if (entry.muscle_kg != null) bucket.muscle_kg = entry.muscle_kg;
      }
    }
    const arr = Array.from(days.values());
    arr.forEach((row) => {
      const parts = [];
      if (Array.isArray(row.__bpNotes)) parts.push(...row.__bpNotes);
      if (row.__noteText) parts.push(row.__noteText);
      row.notes = parts.filter(Boolean).join('\n').trim();
      delete row.__notesTs;
      delete row.__noteText;
      delete row.__bpNotes;
    });
    arr.sort((a, b) => b.date.localeCompare(a.date));
    return arr;
  };
  const buildLabRowsFromLocalEntries = (entries = []) => {
    const byDay = new Map();
    for (const entry of entries) {
      const day = entry?.date || entry?.day || '';
      if (!day || !isDayInRange(day)) continue;
      const hasLab =
        entry?.egfr != null ||
        entry?.creatinine != null ||
        entry?.hba1c != null ||
        entry?.ldl != null ||
        entry?.potassium != null ||
        entry?.ckd_stage != null ||
        entry?.lab_comment != null;
      if (!hasLab) continue;
      const ts = Number.isFinite(entry?.ts) ? entry.ts : Date.parse(entry?.dateTime || '') || 0;
      const existing = byDay.get(day);
      if (existing && ts < existing.__ts) continue;
      byDay.set(day, {
        day,
        egfr: entry?.egfr ?? null,
        creatinine: entry?.creatinine ?? null,
        hba1c: entry?.hba1c ?? null,
        ldl: entry?.ldl ?? null,
        potassium: entry?.potassium ?? null,
        ckd_stage: entry?.ckd_stage ?? null,
        doctor_comment: entry?.lab_comment ?? null,
        __ts: ts
      });
    }
    const rows = Array.from(byDay.values());
    rows.forEach((row) => { delete row.__ts; });
    rows.sort((a, b) => (b.day || '').localeCompare(a.day || ''));
    return rows;
  };
  logDoctorRefreshStart(triggerReason, from, to);
  let doctorRefreshLogClosed = false;
  const closeDoctorRefreshLog = (status = 'done', detail, severity) => {
    if (doctorRefreshLogClosed) return;
    doctorRefreshLogClosed = true;
    logDoctorRefreshEnd(triggerReason, from, to, status, detail, severity);
  };
  const stopIfLiveRangeStale = () => {
    if (isLiveRangeRequestCurrent(liveRangeRequest)) return false;
    closeDoctorRefreshLog('stale', 'durch neueren Zeitraum ersetzt');
    return true;
  };

  const useLocalFallback = !online || !loggedIn;

  //  Server lesen  Tagesobjekte
  let daysArr = [];
  let labRows = [];
  let labLoadError = null;
  let activityRows = [];
  let activityLoadError = null;
  if (!useLocalFallback) {
    try{
      daysArr = await fetchDailyOverview(from, to);
      if (stopIfLiveRangeStale()) return;
    }catch(err){
      if (stopIfLiveRangeStale()) return;
      logDoctorError('fetchDailyOverview failed', err);
      const message =
        `Einzelwerte ${fmtDateDE(from)} bis ${fmtDateDE(to)} konnten nicht geladen werden.`;
      liveRangeState.status = 'error';
      setLiveRangeStatus(message, 'error');
      fillAllPanels(placeholderHtml(message));
      if (scroller) scroller.scrollTop = 0;
      __doctorScrollSnapshot = { top: 0, ratio: 0 };
      closeDoctorRefreshLog('error', err?.message || err, 'error');
      return;
    }

    daysArr = daysArr.filter((entry) => isDayInRange(entry?.date));
    daysArr.sort((a,b)=> b.date.localeCompare(a.date));
    try {
      labRows = await loadLabEventsSafe(from, to);
      if (stopIfLiveRangeStale()) return;
      if (Array.isArray(labRows)) {
        labRows = labRows.filter((entry) => isDayInRange(entry?.day));
        labRows.sort((a, b) => (b.day || '').localeCompare(a.day || ''));
      } else {
        labRows = [];
      }
    } catch (err) {
      if (stopIfLiveRangeStale()) return;
      labLoadError = err;
      logDoctorError('lab events fetch failed', err);
    }

    try {
      activityRows = await loadActivityEventsSafe(from, to);
      if (stopIfLiveRangeStale()) return;
      if (Array.isArray(activityRows)) {
        activityRows = activityRows.filter((entry) => isDayInRange(entry?.day));
        activityRows.sort((a, b) => (b.day || '').localeCompare(a.day || ''));
      } else {
        activityRows = [];
      }
    } catch (err) {
      if (stopIfLiveRangeStale()) return;
      activityLoadError = err;
      logDoctorError('activity events fetch failed', err);
    }
  } else {
    try {
      const local = typeof getAllEntries === 'function' ? await getAllEntries() : [];
      if (stopIfLiveRangeStale()) return;
      const filtered = Array.isArray(local) ? local.filter((entry) => isDayInRange(entry?.date)) : [];
      daysArr = buildDailyFromLocalEntries(filtered);
      labRows = buildLabRowsFromLocalEntries(filtered);
      activityRows = [];
    } catch (err) {
      if (stopIfLiveRangeStale()) return;
      logDoctorError('local fallback failed', err);
    }
  }

  const trendpilotWrap = document.getElementById('doctorTrendpilot');
  if (trendpilotWrap) {
    let trendpilotEntries = [];
    let trendpilotUnavailable = false;
    try {
      trendpilotEntries = await loadTrendpilotEntries(from, to);
      if (stopIfLiveRangeStale()) return;
    } catch (err) {
      if (stopIfLiveRangeStale()) return;
      trendpilotUnavailable = true;
      logDoctorError('trendpilot fetch failed', err);
    }
    renderTrendpilotSection(trendpilotWrap, trendpilotEntries, fmtDateDE, { unavailable: trendpilotUnavailable });
    if (!trendpilotWrap.dataset.tpBound) {
      trendpilotWrap.addEventListener('click', onTrendpilotAction);
      trendpilotWrap.dataset.tpBound = '1';
    }
  }

  const formatNotesHtml = (notes) => {
    const raw = (notes || '').trim();
    if (!raw) return '-';
    const escaped = escapeAttr(raw);
    if (typeof nl2br === 'function') {
      return nl2br(escaped);
    }
    return escaped.replace(/\r?\n/g, '<br>');
  };
  const formatInlineNote = (note) => {
    const raw = (note || '').trim();
    if (!raw) return '-';
    const escaped = escapeAttr(raw);
    if (typeof nl2br === 'function') {
      return nl2br(escaped);
    }
    return escaped.replace(/\r?\n/g, '<br>');
  };

  // SUBMODULE: renderDoctorDay @internal - templates per-day HTML card for doctor view
  const calcPulsePressure = (sys, dia) => {
    if (sys == null || dia == null) return null;
    const s = Number(sys);
    const d = Number(dia);
    if (!Number.isFinite(s) || !Number.isFinite(d)) return null;
    return s - d;
  };

  const renderDoctorDay = (day) => {
    const safeNotes = formatNotesHtml(day.notes);
    const morningPp = calcPulsePressure(day.morning.sys, day.morning.dia);
    const eveningPp = calcPulsePressure(day.evening.sys, day.evening.dia);
    return `
<section class="doctor-day" data-date="${escapeAttr(day.date)}">
  <div class="col-date">
    <div class="date-top">
      <span class="date-label">${fmtDateDE(day.date)}</span>
      <span class="date-cloud" title="In Cloud gespeichert?">${day.hasCloud ? "&#9729;&#65039;" : ""}</span>
    </div>
    <div class="date-actions">
      <button class="btn ghost" data-del-bp="${escapeAttr(day.date)}">Löschen</button>
    </div>
  </div>

  <div class="col-measure">
    <div class="measure-head">
      <div></div>
      <div>Sys</div><div>Dia</div><div>Puls</div><div>MAP</div><div>PP</div>
    </div>
    <div class="measure-grid">
      <div class="measure-row">
        <div class="label">morgens</div>
        <div class="num ${ (day.morning.sys!=null && day.morning.sys>130) ? 'alert' : '' }">${escapeAttr(dash(day.morning.sys))}</div>
        <div class="num ${ (day.morning.dia!=null && day.morning.dia>90)  ? 'alert' : '' }">${escapeAttr(dash(day.morning.dia))}</div>
        <div class="num">${escapeAttr(dash(day.morning.pulse))}</div>
        <div class="num ${ (day.morning.map!=null && day.morning.map>100) ? 'alert' : '' }">${escapeAttr(dash(fmtNum(day.morning.map)))}</div>
        <div class="num">${escapeAttr(dash(fmtNum(morningPp)))}</div>
      </div>
      <div class="measure-row">
        <div class="label">abends</div>
        <div class="num ${ (day.evening.sys!=null && day.evening.sys>130) ? 'alert' : '' }">${escapeAttr(dash(day.evening.sys))}</div>
        <div class="num ${ (day.evening.dia!=null && day.evening.dia>90)  ? 'alert' : '' }">${escapeAttr(dash(day.evening.dia))}</div>
        <div class="num">${escapeAttr(dash(day.evening.pulse))}</div>
        <div class="num ${ (day.evening.map!=null && day.evening.map>100) ? 'alert' : '' }">${escapeAttr(dash(fmtNum(day.evening.map)))}</div>
        <div class="num">${escapeAttr(dash(fmtNum(eveningPp)))}</div>
      </div>
    </div>
  </div>

  <div class="col-special">
    <div class="notes">${safeNotes}</div>
  </div>
</section>
`;
  };

  const renderDoctorBodyDay = (day) => {
    const hasBody =
      day.weight != null ||
      day.waist_cm != null ||
      day.fat_pct != null ||
      day.muscle_pct != null;
    if (!hasBody) return '';
    return `
<section class="doctor-day doctor-body-day" data-date="${escapeAttr(day.date)}">
  <div class="col-date">
    <div class="date-top">
      <span class="date-label">${fmtDateDE(day.date)}</span>
      <span class="date-cloud" title="In Cloud gespeichert?">${day.hasCloud ? "&#9729;&#65039;" : ""}</span>
    </div>
    <div class="date-actions">
      <button class="btn ghost" data-del-body="${escapeAttr(day.date)}">Löschen</button>
    </div>
  </div>
  <div class="col-measure doctor-body-metrics">
    <div class="measure-head">
      <div>Gewicht (kg)</div>
      <div>Bauchumfang (cm)</div>
      <div>Fett (%)</div>
      <div>Muskel (%)</div>
    </div>
    <div class="measure-grid">
      <div class="measure-row">
        <div class="num">${escapeAttr(dash(fmtNum(day.weight)))}</div>
        <div class="num">${escapeAttr(dash(fmtNum(day.waist_cm)))}</div>
        <div class="num">${escapeAttr(dash(fmtNum(day.fat_pct)))}</div>
        <div class="num">${escapeAttr(dash(fmtNum(day.muscle_pct)))}</div>
      </div>
    </div>
  </div>
</section>`;
  };

  const renderDoctorLabDay = (entry) => {
    const formatLabValue = (value, decimals = 1) => {
      if (value === null || value === undefined || value === '') return '-';
      const num = Number(value);
      if (!Number.isFinite(num)) return dash(value);
      return fmtNum(num, decimals);
    };
    const createLabGroup = (columns) => {
      const head = columns.map((col) => `<div>${escapeAttr(col.label)}</div>`).join('');
      const values = columns
        .map((col) => `<div class="num">${escapeAttr(col.value)}</div>`)
        .join('');
      return `
    <div class="doctor-lab-group">
      <div class="measure-head doctor-lab-head">
        ${head}
      </div>
      <div class="measure-grid doctor-lab-grid">
        <div class="measure-row">
          ${values}
        </div>
      </div>
    </div>`;
    };
    const commentRaw = formatNotesHtml(entry.doctor_comment);
    const commentHtml =
      commentRaw === '-'
        ? '<span class="doctor-lab-comment-empty">Kein Kommentar</span>'
        : commentRaw;
    const stageValue = entry.ckd_stage || '-';
    return `
<section class="doctor-day doctor-lab-day" data-date="${escapeAttr(entry.day || '')}">
  <div class="col-date">
    <div class="date-top">
      <span class="date-label">${fmtDateDE(entry.day)}</span>
      <span class="date-cloud" title="In Cloud gespeichert?">&#9729;&#65039;</span>
    </div>
    <div class="date-actions">
      <button class="btn ghost" data-del-lab="${escapeAttr(entry.day || '')}">Löschen</button>
    </div>
  </div>
  <div class="col-measure doctor-lab-metrics">
    ${createLabGroup([
      { label: 'eGFR (ml/min)', value: formatLabValue(entry.egfr, 0) },
      { label: 'Kreatinin (mg/dl)', value: formatLabValue(entry.creatinine, 2) },
      { label: 'Kalium (mmol/l)', value: formatLabValue(entry.potassium, 2) }
    ])}
    ${createLabGroup([
      { label: 'HbA1c (%)', value: formatLabValue(entry.hba1c, 1) },
      { label: 'LDL (mg/dl)', value: formatLabValue(entry.ldl, 0) },
      { label: 'CKD-Stufe', value: stageValue }
    ])}
  </div>
  <div class="col-special doctor-lab-special">
    <div class="doctor-lab-comment">
      <div class="doctor-lab-comment-label">Kommentar</div>
      <div class="doctor-lab-comment-text">${commentHtml}</div>
    </div>
  </div>
</section>`;
  };

  const renderDoctorActivityDay = (entry) => {
    const safeActivity = entry?.activity ? escapeAttr(entry.activity) : '-';
    const durationValue =
      entry?.duration_min === null || entry?.duration_min === undefined
        ? '-'
        : dash(fmtNum(entry.duration_min, 0));
    const noteHtml = formatInlineNote(entry?.note);
    const dayValue = entry?.day || '';
    return `
<section class="doctor-day doctor-activity-day" data-date="${escapeAttr(dayValue)}">
  <div class="col-date">
    <div class="date-top">
      <span class="date-label">${fmtDateDE(dayValue)}</span>
      <span class="date-cloud" title="In Cloud gespeichert?">&#9729;&#65039;</span>
    </div>
    <div class="date-actions">
      <button class="btn ghost" data-del-activity="${escapeAttr(dayValue)}">Löschen</button>
    </div>
  </div>
  <div class="col-measure doctor-activity-metrics">
    <div class="measure-head">
      <div class="activity-col">Aktivität</div>
      <div class="duration-col">Dauer (Min)</div>
      <div class="note-col">Notiz</div>
    </div>
    <div class="measure-grid">
      <div class="measure-row">
        <div class="activity-col">${safeActivity}</div>
        <div class="num duration-col">${durationValue}</div>
        <div class="note-col">${noteHtml}</div>
      </div>
    </div>
  </div>
</section>`;
  };

  const bindDomainDeleteButtons = (panel, attrName, type, label) => {
    if (!panel) return;
    panel.querySelectorAll(`[${attrName}]`).forEach((btn) => {
      if (btn.dataset.boundDelete === '1') return;
      btn.dataset.boundDelete = '1';
      btn.addEventListener('click', async () => {
        const date = btn.getAttribute(attrName);
        if (!date) return;
        if (!confirm(`Alle ${label}-Einträge für ${date} löschen?`)) return;

        btn.disabled = true;
        const old = btn.textContent;
        btn.textContent = 'Lösche...';
        try {
          const result = await deleteRemoteByType(date, type);
          if (!result?.ok) {
            alert(`Server-Löschung fehlgeschlagen (${result?.status || "?"}).`);
            return;
          }
          await requestUiRefresh({ reason: `doctor:delete:${type}` });
        } catch (err) {
          logDoctorError(`deleteRemoteByType failed (${type})`, err);
          alert('Server-Löschung fehlgeschlagen (Fehler siehe Konsole).');
        } finally {
          btn.disabled = false;
          btn.textContent = old;
        }
      });
    });
  };

    // Rendern / Leerzustand
  if (!daysArr.length){
    if (panels.bp) panels.bp.innerHTML = placeholderHtml('Keine Einträge im Zeitraum.');
    if (panels.body) panels.body.innerHTML = placeholderHtml('Keine Körperdaten im Zeitraum.');
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
  } else {
    if (panels.bp) panels.bp.innerHTML = daysArr.map(renderDoctorDay).join("");
    if (panels.body) {
      const bodyHtml = daysArr.map(renderDoctorBodyDay).filter(Boolean).join('');
      panels.body.innerHTML = bodyHtml || placeholderHtml('Keine Körperdaten im Zeitraum.');
    }

    const restoreScroll = () => {
      const targetEl = scroller || host;
      const height = targetEl.scrollHeight || 1;
      const maxScroll = Math.max(0, height - targetEl.clientHeight);
      const fromTop = Math.max(0, Math.min(prevScrollTop, maxScroll));
      const fromRatio = Math.max(0, Math.min(Math.round(prevScrollRatio * height), maxScroll));
      const target = prevScrollTop ? fromTop : fromRatio;
      targetEl.scrollTop = target;
      const h = targetEl.scrollHeight || 1;
      __doctorScrollSnapshot.top = targetEl.scrollTop;
      __doctorScrollSnapshot.ratio = h ? Math.min(1, targetEl.scrollTop / h) : 0;
    };
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(restoreScroll);
    } else {
      setTimeout(restoreScroll, 0);
    }

    bindDomainDeleteButtons(panels.bp, 'data-del-bp', 'bp', 'Blutdruck');
    bindDomainDeleteButtons(panels.body, 'data-del-body', 'body', 'Körper');
  }

  if (panels.lab) {
    if (labLoadError) {
      panels.lab.innerHTML = placeholderHtml('Labordaten konnten nicht geladen werden.');
    } else if (labRows.length) {
      panels.lab.innerHTML = labRows.map(renderDoctorLabDay).join('');
      bindDomainDeleteButtons(panels.lab, 'data-del-lab', 'lab_event', 'Labor');
    } else {
      panels.lab.innerHTML = placeholderHtml('Keine Laborwerte im Zeitraum.');
    }
  }

  if (panels.activity) {
    if (activityLoadError) {
      panels.activity.innerHTML = placeholderHtml('Training konnte nicht geladen werden.');
    } else if (activityRows.length) {
      panels.activity.innerHTML = activityRows.map(renderDoctorActivityDay).join('');
      bindDomainDeleteButtons(panels.activity, 'data-del-activity', 'activity_event', 'Training');
    } else {
      panels.activity.innerHTML = placeholderHtml('Keine Trainingseinträge im Zeitraum.');
    }
  }

  if (stopIfLiveRangeStale()) return;
  finishLiveRangeRequest(liveRangeRequest, {
    partial: Boolean(labLoadError || activityLoadError)
  });
  closeDoctorRefreshLog();
}


// --- Arzt-Export ---
const HEALTH_EXPORT_SCHEMA_VERSION = 'midas.health-export.v2';
const HEALTH_EXPORT_DOMAINS = [
  'blood_pressure',
  'body',
  'notes',
  'labs',
  'activities'
];
const HEALTH_EXPORT_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const exportNumberOrNull = (value, field) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Ungültiger Zahlenwert in ${field}.`);
  }
  return parsed;
};

const buildHealthExportV2 = ({
  range,
  daily,
  labs,
  activities,
  generatedAt = new Date()
} = {}) => {
  const validation = validateLiveRange(range?.from || '', range?.to || '');
  if (!validation.valid) {
    throw new Error('Ungültiger Exportzeitraum.');
  }
  if (!Array.isArray(daily) || !Array.isArray(labs) || !Array.isArray(activities)) {
    throw new Error('Unvollständige Exportdaten.');
  }

  const normalizedGeneratedAt = new Date(generatedAt);
  if (Number.isNaN(normalizedGeneratedAt.getTime())) {
    throw new Error('Ungültiger Exportzeitpunkt.');
  }

  const { from, to } = validation;
  const isCanonicalExportDay = (day) => {
    const raw = String(day || '');
    if (!HEALTH_EXPORT_DAY_RE.test(raw)) return false;
    const date = new Date(`${raw}T00:00:00Z`);
    return !Number.isNaN(date.getTime())
      && date.toISOString().slice(0, 10) === raw;
  };
  const isDayInRange = (day) =>
    isCanonicalExportDay(day) && day >= from && day <= to;
  const assertDay = (day, domain) => {
    if (!isCanonicalExportDay(day)) {
      throw new Error(`Ungültiger Tag in ${domain}.`);
    }
    return day;
  };

  const bloodPressure = [];
  const body = [];
  const notes = [];
  daily.forEach((entry) => {
    const day = assertDay(entry?.date, 'daily');
    if (!isDayInRange(day)) return;
    [
      ['morning', entry?.morning],
      ['evening', entry?.evening]
    ].forEach(([daypart, values]) => {
      const systolic = exportNumberOrNull(values?.sys, `${day}.${daypart}.sys`);
      const diastolic = exportNumberOrNull(values?.dia, `${day}.${daypart}.dia`);
      const pulse = exportNumberOrNull(values?.pulse, `${day}.${daypart}.pulse`);
      if (systolic === null && diastolic === null && pulse === null) return;
      bloodPressure.push({
        day,
        daypart,
        systolic_mmhg: systolic,
        diastolic_mmhg: diastolic,
        pulse_bpm: pulse
      });
    });

    const bodyEntry = {
      day,
      weight_kg: exportNumberOrNull(entry?.weight, `${day}.weight`),
      waist_cm: exportNumberOrNull(entry?.waist_cm, `${day}.waist_cm`),
      fat_kg: exportNumberOrNull(entry?.fat_kg, `${day}.fat_kg`),
      muscle_kg: exportNumberOrNull(entry?.muscle_kg, `${day}.muscle_kg`)
    };
    if (Object.values(bodyEntry).slice(1).some((value) => value !== null)) {
      body.push(bodyEntry);
    }

    const text = String(entry?.notes || '').trim();
    if (text) notes.push({ day, text });
  });

  const normalizedLabs = labs.filter((entry) => isDayInRange(entry?.day)).map((entry) => {
    const day = assertDay(entry?.day, 'labs');
    return {
      day,
      egfr: exportNumberOrNull(entry?.egfr, `${day}.egfr`),
      creatinine: exportNumberOrNull(entry?.creatinine, `${day}.creatinine`),
      hba1c: exportNumberOrNull(entry?.hba1c, `${day}.hba1c`),
      ldl: exportNumberOrNull(entry?.ldl, `${day}.ldl`),
      potassium: exportNumberOrNull(entry?.potassium, `${day}.potassium`),
      ckd_stage: entry?.ckd_stage == null ? null : String(entry.ckd_stage),
      doctor_comment:
        entry?.doctor_comment == null ? null : String(entry.doctor_comment)
    };
  });

  const normalizedActivities = activities
    .filter((entry) => isDayInRange(entry?.day))
    .map((entry) => {
      const day = assertDay(entry?.day, 'activities');
      const id = String(entry?.id || '').trim();
      const activity = String(entry?.activity || '').trim();
      const occurredAt = new Date(entry?.ts || entry?.occurred_at || '');
      if (!id || !activity || Number.isNaN(occurredAt.getTime())) {
        throw new Error(`Ungültiger Trainingseintrag am ${day}.`);
      }
      const durationMin = exportNumberOrNull(
        entry?.duration_min,
        `${day}.duration_min`
      );
      if (durationMin === null) {
        throw new Error(`Fehlende Trainingsdauer am ${day}.`);
      }
      const normalized = {
        id,
        occurred_at: occurredAt.toISOString(),
        day,
        activity,
        duration_min: durationMin
      };
      const note = String(entry?.note || '').trim();
      if (note) normalized.note = note;
      return normalized;
    });

  const daypartOrder = { morning: 0, evening: 1 };
  bloodPressure.sort(
    (left, right) =>
      left.day.localeCompare(right.day)
      || daypartOrder[left.daypart] - daypartOrder[right.daypart]
  );
  body.sort((left, right) => left.day.localeCompare(right.day));
  notes.sort((left, right) => left.day.localeCompare(right.day));
  normalizedLabs.sort((left, right) => left.day.localeCompare(right.day));
  normalizedActivities.sort(
    (left, right) =>
      left.occurred_at.localeCompare(right.occurred_at)
      || left.id.localeCompare(right.id)
  );

  const counts = {
    blood_pressure: bloodPressure.length,
    body: body.length,
    notes: notes.length,
    labs: normalizedLabs.length,
    activities: normalizedActivities.length
  };

  return {
    schema_version: HEALTH_EXPORT_SCHEMA_VERSION,
    generated_at: normalizedGeneratedAt.toISOString(),
    timezone: 'Europe/Vienna',
    range: { from, to },
    completeness: {
      status: 'complete',
      loaded_domains: [...HEALTH_EXPORT_DOMAINS],
      counts
    },
    blood_pressure: bloodPressure,
    body,
    notes,
    labs: normalizedLabs,
    activities: normalizedActivities
  };
};

// SUBMODULE: exportDoctorJson @internal - creates one complete, versioned health export
async function exportDoctorJson(){
  if (!isStageReady()) return false;
  if (!isDoctorUnlockedSafe()) {
    setAuthPendingAfterUnlock('export');
    const ok = await requestDoctorUnlock();
    if (!ok) return false;
    setAuthPendingAfterUnlock(null);
  }

  const range = getActiveConsumerRange();
  if (!range) {
    toast('Für den Export ist kein gültiger Zeitraum verfügbar.');
    return false;
  }
  if (global.navigator?.onLine === false) {
    if (typeof global.uiError === 'function') {
      global.uiError('Export nicht möglich: MIDAS ist offline.');
    } else {
      toast('Export nicht möglich: MIDAS ist offline.');
    }
    return false;
  }

  const exportButton = global.document?.getElementById('doctorExportJson');
  const previousLabel = exportButton?.textContent || 'Export JSON';
  if (exportButton) {
    exportButton.disabled = true;
    exportButton.textContent = 'Exportiere ...';
  }

  try {
    const loggedIn = await isLoggedInFast();
    if (!loggedIn) {
      throw new Error('Keine aktive Supabase-Sitzung.');
    }
    const labLoader = resolveLabRangeLoader();
    const activityLoader = resolveActivityRangeLoader();
    const userIdFetcher = resolveUserIdFetcher();
    if (
      typeof fetchDailyOverview !== 'function'
      || typeof labLoader !== 'function'
      || typeof activityLoader !== 'function'
      || typeof userIdFetcher !== 'function'
    ) {
      throw new Error('Ein Export-Datenbereich ist nicht verfügbar.');
    }
    const userId = await userIdFetcher();
    if (!userId) throw new Error('Benutzerkontext ist nicht verfügbar.');

    const [daily, labs, activities] = await Promise.all([
      fetchDailyOverview(range.from, range.to),
      labLoader({ user_id: userId, from: range.from, to: range.to }),
      activityLoader(range.from, range.to, { reason: 'doctor:export-v2' })
    ]);
    const payload = buildHealthExportV2({
      range,
      daily,
      labs,
      activities
    });
    dl('gesundheitslog.json', JSON.stringify(payload, null, 2), 'application/json');
    return true;
  } catch (err) {
    logDoctorError('health export v2 failed', err);
    if (typeof global.uiError === 'function') {
      global.uiError('Export fehlgeschlagen. Es wurde keine Datei erstellt.');
    } else {
      toast('Export fehlgeschlagen. Es wurde keine Datei erstellt.');
    }
    return false;
  } finally {
    if (exportButton) {
      exportButton.disabled = false;
      exportButton.textContent = previousLabel;
    }
  }
}
  const invalidatePrimaryReport = () => {
    primaryReportState.lifecycle += 1;
    primaryReportState.createVersion += 1;
    primaryReportState.status = 'idle';
    primaryReportState.result = null;
    primaryReportState.promise = null;
    primaryReportState.createInFlight = false;
    setReportCreateBusy(false);
  };

  const getRangeValidationMessage = (validation) => {
    const errors = validation?.errors || [];
    if (errors.includes('future_to')) {
      return 'Das Bis-Datum darf nicht in der Zukunft liegen.';
    }
    if (errors.includes('range_reversed')) {
      return 'Das Von-Datum muss vor oder am Bis-Datum liegen.';
    }
    if (errors.includes('range_too_long')) {
      return `Der Zeitraum darf maximal ${MAX_DOCTOR_RANGE_DAYS} Tage umfassen.`;
    }
    return 'Bitte einen gültigen Zeitraum wählen.';
  };

  async function renderPrimaryDoctorReport({ force = false } = {}) {
    const doc = global.document;
    const reportHost = doc?.getElementById('doctorPrimaryReport');
    const titleEl = doc?.getElementById('doctorPrimaryReportTitle');
    if (!reportHost) return null;
    if (!force && primaryReportState.status === 'ready' && primaryReportState.result) {
      return primaryReportState.result;
    }
    if (!force && primaryReportState.promise) return primaryReportState.promise;

    let requestLifecycle = primaryReportState.lifecycle;
    const task = (async () => {
      const userIdFetcher = resolveUserIdFetcher();
      if (typeof userIdFetcher !== 'function') {
        throw new Error('doctor report user resolver missing');
      }
      const userId = await userIdFetcher();
      if (!userId) throw new Error('doctor report user unavailable');
      if (primaryReportState.lifecycle !== requestLifecycle) return null;
      if (primaryReportState.userId && primaryReportState.userId !== userId) {
        resetDoctorState({ clearDom: true });
        requestLifecycle = primaryReportState.lifecycle;
      }
      primaryReportState.userId = userId;
      const activeLifecycle = primaryReportState.lifecycle;
      primaryReportState.status = 'loading';
      reportHost.innerHTML = '';
      if (titleEl) titleEl.textContent = 'Aktueller Bericht';
      setPrimaryReportStatus('Bericht wird geladen ...', 'loading');

      const reportsModule = getReportsModule();
      if (typeof reportsModule.loadLatestRangeReport !== 'function') {
        throw new Error('latest range report loader missing');
      }
      const result = await reportsModule.loadLatestRangeReport();
      if (
        primaryReportState.lifecycle !== activeLifecycle
        || primaryReportState.userId !== userId
      ) {
        return null;
      }
      primaryReportState.result = result;
      primaryReportState.status = 'ready';

      if (result.status === 'success' && result.report) {
        initializeLiveRangeFromReport(result.report);
        reportsModule.renderPrimaryRangeReport?.(reportHost, result.report);
        const periodTo = result.report.period?.to || result.report.payload?.period?.to || '';
        if (titleEl) {
          titleEl.textContent = periodTo
            ? `Bericht bis ${fmtDateDE(periodTo)}`
            : 'Aktueller Bericht';
        }
        const flags = reportsModule.reportFlags?.(result.report) || [];
        if (flags.length) {
          setPrimaryReportStatus(
            'Eingeschränkte Datengrundlage: Der Bericht enthält Hinweise zur Datenqualität.',
            'partial'
          );
        } else {
          setPrimaryReportStatus('', 'ready');
        }
        return result;
      }

      reportHost.innerHTML = '';
      if (result.status === 'empty') {
        setPrimaryReportStatus('Noch kein Arzt-Bericht vorhanden.', 'empty');
      } else {
        setPrimaryReportStatus(
          'Vorhandene Berichte konnten nicht als gültiger Arzt-Bericht verwendet werden.',
          'error'
        );
      }
      return result;
    })()
      .catch((err) => {
        if (primaryReportState.lifecycle === requestLifecycle) {
          primaryReportState.status = 'error';
          primaryReportState.result = null;
          reportHost.innerHTML = '';
          const offline = global.navigator?.onLine === false;
          setPrimaryReportStatus(
            offline
              ? 'Berichte sind offline derzeit nicht erreichbar.'
              : 'Berichte konnten nicht geladen werden.',
            'error'
          );
          logDoctorError('primary report load failed', err);
        }
        return null;
      })
      .finally(() => {
        if (primaryReportState.promise === task) {
          primaryReportState.promise = null;
        }
      });
    primaryReportState.promise = task;
    return task;
  }

  const openReportCreatePanel = () => {
    const doc = global.document;
    const reportsModule = global.AppModules?.reports || {};
    const panel = doc?.getElementById('doctorReportCreatePanel');
    const fromInput = doc?.getElementById('doctorReportFrom');
    const toInput = doc?.getElementById('doctorReportTo');
    const errorEl = doc?.getElementById('doctorReportCreateError');
    if (!panel || !fromInput || !toInput) return;
    const today = reportsModule.getViennaToday?.() || '';
    const latest = primaryReportState.result?.report || null;
    const latestTo = latest?.period?.to || latest?.payload?.period?.to || '';
    const fallbackFrom = doc?.getElementById('from')?.value || '';
    const safeFallback = reportsModule.validateRangeReportInput?.({
      from: fallbackFrom,
      to: today,
      today
    })?.valid
      ? fallbackFrom
      : today;
    fromInput.value = latestTo && latestTo <= today ? latestTo : safeFallback;
    toInput.value = today;
    fromInput.max = today;
    toInput.max = today;
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
    reportCreateOpener = doc.activeElement;
    panel.hidden = false;
    doc.getElementById('doctorNewRangeReportBtn')
      ?.setAttribute('aria-expanded', 'true');
    fromInput.focus();
  };

  async function submitRangeReport(event) {
    event.preventDefault();
    if (primaryReportState.createInFlight) return;
    const doc = global.document;
    const reportsModule = getReportsModule();
    const fromInput = doc?.getElementById('doctorReportFrom');
    const toInput = doc?.getElementById('doctorReportTo');
    const errorEl = doc?.getElementById('doctorReportCreateError');
    const today = reportsModule.getViennaToday?.() || '';
    const validation = reportsModule.validateRangeReportInput?.({
      from: fromInput?.value || '',
      to: toInput?.value || '',
      today
    });
    if (!validation?.valid) {
      if (errorEl) {
        errorEl.textContent = getRangeValidationMessage(validation);
        errorEl.hidden = false;
      }
      return;
    }

    primaryReportState.createInFlight = true;
    const createVersion = ++primaryReportState.createVersion;
    const createLifecycle = primaryReportState.lifecycle;
    const createUserId = primaryReportState.userId;
    setReportCreateBusy(true);
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
    try {
      if (typeof reportsModule.generateDoctorReport !== 'function') {
        throw new Error('range report generator missing');
      }
      await reportsModule.generateDoctorReport({
        from: validation.from,
        to: validation.to,
        today
      }, {
        toast,
        logError: logDoctorError
      });
      if (
        primaryReportState.createVersion !== createVersion
        || primaryReportState.lifecycle !== createLifecycle
        || (createUserId && primaryReportState.userId !== createUserId)
      ) {
        return;
      }
      invalidatePrimaryReport();
      closeReportCreatePanel();
      await renderPrimaryDoctorReport({ force: true });
    } catch (err) {
      if (
        primaryReportState.createVersion !== createVersion
        || primaryReportState.lifecycle !== createLifecycle
        || (createUserId && primaryReportState.userId !== createUserId)
      ) {
        return;
      }
      logDoctorError('range report create failed', err);
      if (errorEl) {
        errorEl.textContent = err?.validation
          ? getRangeValidationMessage(err.validation)
          : 'Arzt-Bericht konnte nicht erstellt werden.';
        errorEl.hidden = false;
      }
    } finally {
      if (primaryReportState.createVersion === createVersion) {
        primaryReportState.createInFlight = false;
        setReportCreateBusy(false);
      }
    }
  }

  const bindReportFirstControls = () => {
    const doc = global.document;
    if (!doc || doc.__doctorReportFirstBound) return;
    const reportsModule = global.AppModules?.reports || {};
    const today = reportsModule.getViennaToday?.() || '';
    const onLiveRangeChange = () => {
      queueLiveRangeRefresh();
    };
    ['from', 'to'].forEach((id) => {
      const input = doc.getElementById(id);
      if (!input) return;
      if (today) input.max = today;
      input.addEventListener('change', onLiveRangeChange);
    });
    doc.getElementById('doctorNewRangeReportBtn')?.addEventListener(
      'click',
      openReportCreatePanel
    );
    doc.getElementById('doctorReportCreateCancel')?.addEventListener(
      'click',
      closeReportCreatePanel
    );
    doc.getElementById('doctorReportCreateDismiss')?.addEventListener(
      'click',
      closeReportCreatePanel
    );
    doc.getElementById('doctorReportCreateForm')?.addEventListener(
      'submit',
      submitRangeReport
    );
    doc.getElementById('doctorReportCreatePanel')?.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Escape' || primaryReportState.createInFlight) return;
        event.preventDefault();
        closeReportCreatePanel();
      }
    );
    doc.getElementById('doctorDetailsBtn')?.addEventListener('click', async (event) => {
      const details = doc.getElementById('doctorDailyWrap');
      if (!details) return;
      const opening = details.hidden;
      details.hidden = !opening;
      event.currentTarget.setAttribute('aria-expanded', String(opening));
      if (!opening) {
        closeLiveDetails();
        return;
      }

      const range = readLiveDetailRange();
      if (!range) {
        const from = doc.getElementById('from')?.value || '';
        const to = doc.getElementById('to')?.value || '';
        const validation = validateLiveRange(from, to);
        const message = getLiveRangeErrorMessage(validation);
        liveRangeState.status = 'error';
        liveRangeState.dirty = true;
        setLiveRangeStatus(message, 'error');
        setLiveRangePanelsMessage(message);
        return;
      }

      const key = liveRangeKey(range.from, range.to);
      if (!liveRangeState.dirty && liveRangeState.loadedKey === key) {
        liveRangeState.status = 'ready';
        setLiveRangeStatus('');
        return;
      }

      if (typeof global.requestUiRefresh !== 'function') {
        const message =
          `Einzelwerte ${fmtDateDE(range.from)} bis ${fmtDateDE(range.to)} konnten nicht aktualisiert werden.`;
        liveRangeState.status = 'error';
        liveRangeState.dirty = true;
        setLiveRangeStatus(message, 'error');
        setLiveRangePanelsMessage(message);
        return;
      }

      setLiveRangeStatus(
        `Einzelwerte ${fmtDateDE(range.from)} bis ${fmtDateDE(range.to)} werden geladen ...`,
        'loading'
      );
      setLiveRangePanelsMessage('Einzelwerte werden geladen ...');
      try {
        await global.requestUiRefresh({
          reason: 'doctor:details-open',
          doctor: true
        });
      } catch (err) {
        const currentRange = readLiveDetailRange();
        if (
          details.hidden
          || !currentRange
          || liveRangeKey(currentRange.from, currentRange.to) !== key
        ) {
          return;
        }
        const message =
          `Einzelwerte ${fmtDateDE(range.from)} bis ${fmtDateDE(range.to)} konnten nicht aktualisiert werden.`;
        liveRangeState.status = 'error';
        liveRangeState.dirty = true;
        setLiveRangeStatus(message, 'error');
        setLiveRangePanelsMessage(message);
        logDoctorError('details open refresh failed', err);
      }
    });
    doc.__doctorReportFirstBound = true;
  };

// SUBMODULE: doctorApi @internal - registriert Öffentliche API-Funktionen im globalen Namespace
  const doctorApi = {
    renderDoctor,
    exportDoctorJson,
    buildHealthExportV2,
    beginDoctorPanelLifecycle,
    resetDoctorState,
    getActiveConsumerRange,
  };

  if (global.document?.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', bindReportFirstControls, {
      once: true
    });
  } else {
    bindReportFirstControls();
  }

  function bindHubDoctorCloseButton() {
    try {
      const doc = global.document;
      if (!doc) return;
      const panel = doc.getElementById('hubDoctorPanel');
      if (!panel) return;
      const btn = panel.querySelector('[data-panel-close]');
      if (!btn || btn.dataset.hubDoctorCloseBound === '1') return;
      btn.dataset.hubDoctorCloseBound = '1';
      btn.addEventListener('click', (event) => {
        const hub = global.AppModules?.hub;
        const closeFn = hub?.closePanel;
        if (typeof closeFn !== 'function') {
          diag.add?.('[doctor] hub.closePanel missing');
          return;
        }
        let closed = closeFn('doctor');
        if (!closed && typeof hub?.forceClosePanel === 'function') {
          diag.add?.('[doctor] closePanel fallback -> forceClosePanel');
          closed = hub.forceClosePanel('doctor', { instant: true });
        }
        if (closed) {
          event.preventDefault();
          event.stopPropagation();
        }
      }, { capture: true });
    } catch (_) {
      /* noop */
    }
  }

  if (global.document?.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', bindHubDoctorCloseButton, { once: true });
  } else {
    bindHubDoctorCloseButton();
  }

  const getReportsModule = () => global.AppModules?.reports || {};
  appModules.doctor = appModules.doctor || {};
  Object.assign(appModules.doctor, doctorApi);
})(typeof window !== 'undefined' ? window : globalThis);
