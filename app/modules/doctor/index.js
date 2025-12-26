﻿'use strict';
/**
 * MODULE: app/doctor.js
 * Description: Steuert die Arzt-Ansicht – lädt Tagesdaten, verwaltet Sperrlogik (Unlock), Scrollstatus und Exportfunktionen.
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
  const DOCTOR_TABS = ['bp', 'body', 'lab', 'activity', 'inbox'];
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
  const getFocusTrap = () => global.AppModules?.uiCore?.focusTrap || global.focusTrap || null;
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
    return typeof api.fetchSystemCommentsRange === 'function' ? api.fetchSystemCommentsRange : null;
  };

  const resolveTrendpilotStatusSetter = () => {
    const api = getSupabaseApi();
    return typeof api.setSystemCommentDoctorStatus === 'function'
      ? api.setSystemCommentDoctorStatus
      : null;
  };
  const resolveMonthlyReportFetcher = () => {
    const api = getSupabaseApi();
    return typeof api.fetchSystemCommentsBySubtype === 'function'
      ? api.fetchSystemCommentsBySubtype
      : null;
  };

  const resolveMonthlyReportGenerator = () => {
    const api = getSupabaseApi();
    if (typeof api.generateMonthlyReportRemote === 'function') {
      return api.generateMonthlyReportRemote;
    }
    return null;
  };

  const resolveMonthlyReportDeleter = () => {
    const api = getSupabaseApi();
    return typeof api.deleteSystemComment === 'function'
      ? api.deleteSystemComment
      : null;
  };
  const resolveReportInboxClearer = () => {
    const api = getSupabaseApi();
    return typeof api.deleteSystemCommentsBySubtypes === 'function'
      ? api.deleteSystemCommentsBySubtypes
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

  const renderTrendpilotRow = (entry, fmtDateDE) => {
    const severity = getSeverityMeta(entry.severity);
    const ackLabel = entry.ack ? 'Bestätigt' : 'Offen';
    const ackClass = entry.ack ? 'is-ack' : 'is-open';
    const safeText = entry.text
      ? escapeAttr(entry.text)
      : 'Trendpilot-Hinweis';
    const dateLabel = fmtDateDE(entry.day);
    const currentStatus = entry.doctorStatus || 'none';
    return `
<article class="tp-row" data-trendpilot-id="${escapeAttr(entry.id || '')}" data-day="${escapeAttr(entry.day || '')}" data-doctor-status="${escapeAttr(currentStatus)}">
  <div class="tp-meta">
    <span class="tp-date">${dateLabel}</span>
    <span class="tp-badge ${severity.className}">${severity.label}</span>
    <span class="tp-ack ${ackClass}">${ackLabel}</span>
  </div>
  <div class="tp-text">${safeText}</div>
  <div class="tp-status" data-status-label>${getDoctorStatusLabel(currentStatus)}</div>
  <div class="tp-actions" role="group" aria-label="Trendpilot-Aktion">
    ${renderTrendpilotActionButton('planned', currentStatus)}
    ${renderTrendpilotActionButton('done', currentStatus)}
    ${renderTrendpilotActionButton('none', currentStatus)}
  </div>
</article>`;
  };

  const renderTrendpilotSection = (host, entries, fmtDateDE, { unavailable = false } = {}) => {
    if (!host) return;
    const countText = `${entries?.length || 0} Hinweis${entries?.length === 1 ? '' : 'e'}`;
    let inner = `<div class="doctor-trendpilot-head"><strong>Trendpilot-Hinweise</strong><span class="small">${countText}</span></div>`;
    if (unavailable) {
      inner += `<div class="doctor-trendpilot-empty">Trendpilot-Hinweise momentan nicht verfügbar.</div>`;
    } else if (!entries?.length) {
      inner += `<div class="doctor-trendpilot-empty">Keine Trendpilot-Hinweise in diesem Zeitraum.</div>`;
    } else {
      const rows = entries.map((entry) => renderTrendpilotRow(entry, fmtDateDE)).join('');
      inner += `<div class="doctor-trendpilot-list">${rows}</div>`;
    }
    host.innerHTML = inner;
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
      activity: doc.getElementById('doctorTabActivity'),
      inbox: doc.getElementById('doctorTabInbox')
    };
  };

  const inboxPanelState = {
    el: null,
    closeBound: false,
    range: { from: '', to: '' },
    filter: 'all',
    reports: []
  };

  function hideDoctorInboxPanel() {
    const panel = inboxPanelState.el || global.document?.getElementById('doctorInboxPanel');
    if (!panel) return;
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('inert', '');
    panel.classList.remove('is-open');
    panel.style.display = 'none';
    inboxPanelState.el = panel;
    getFocusTrap()?.deactivate?.();
  }

  const ensureDoctorInboxPanel = () => {
    if (inboxPanelState.el) return inboxPanelState.el;
    const doc = global.document;
    if (!doc) return null;
    const panel = doc.getElementById('doctorInboxPanel');
    if (!panel) return null;
    inboxPanelState.el = panel;
    if (!inboxPanelState.closeBound) {
      const closeBtn = doc.getElementById('doctorInboxClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => hideDoctorInboxPanel());
        inboxPanelState.closeBound = true;
      }
    }
    return panel;
  };

  const isDoctorInboxPanelOpen = () => {
    const panel = inboxPanelState.el || global.document?.getElementById('doctorInboxPanel');
    if (!panel) return false;
    const hiddenAttr = panel.getAttribute('aria-hidden');
    return panel.classList.contains('is-open') && hiddenAttr === 'false' && panel.hidden !== true;
  };

  const showDoctorInboxPanel = () => {
    const panel = ensureDoctorInboxPanel();
    if (!panel) return false;
    panel.hidden = false;
    panel.removeAttribute('inert');
    panel.style.display = 'block';
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-open');
    getFocusTrap()?.activate?.(panel);
    return true;
  };

  const openInboxOverlay = () => {
    try {
      const hub = global.AppModules?.hub;
      if (typeof hub?.openDoctorInboxPanel !== 'function') {
        toast('Inbox ist derzeit nicht verfügbar.');
        return;
      }
      const doc = global.document;
      const from = doc?.getElementById('from')?.value || '';
      const to = doc?.getElementById('to')?.value || '';
      hub.openDoctorInboxPanel({ from, to });
    } catch (err) {
      logDoctorError('open inbox overlay failed', err);
    }
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
      const btn = event.target.closest('[data-doctor-tab]');
      if (!btn || !btn.closest('#doctor')) return;
      const tab = btn.getAttribute('data-doctor-tab');
      if (!tab) return;
      if (tab === 'inbox') {
        event.preventDefault();
        openInboxOverlay();
        return;
      }
      setDoctorActiveTab(tab);
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
    const fetcher = resolveTrendpilotFetcher();
    if (typeof fetcher !== 'function') return [];
    const result = await fetcher({ from, to, metric: 'bp', order: 'day.desc' });
    return Array.isArray(result) ? result : [];
  }

  async function loadMonthlyReports(from, to) {
    const fetcher = resolveMonthlyReportFetcher();
    if (typeof fetcher !== 'function') return [];
    const [monthly, rangeReports] = await Promise.all([
      fetcher({
        from,
        to,
        subtype: 'monthly_report',
        order: 'day.desc'
      }),
      fetcher({
        from,
        to,
        subtype: 'range_report',
        order: 'day.desc'
      })
    ]);
    const merged = [
      ...(Array.isArray(monthly) ? monthly : []),
      ...(Array.isArray(rangeReports) ? rangeReports : [])
    ];
    merged.sort((a, b) => {
      const dayCmp = (b.day || '').localeCompare(a.day || '');
      if (dayCmp !== 0) return dayCmp;
      return (b.ts || '').localeCompare(a.ts || '');
    });
    return merged;
  }

  async function onTrendpilotAction(event) {
    const btn = event.target.closest('[data-doctor-status]');
    if (!btn) return;
    const row = btn.closest('[data-trendpilot-id]');
    if (!row) return;
    const nextStatus = btn.getAttribute('data-doctor-status');
    if (!nextStatus) return;
    const currentStatus = row.getAttribute('data-doctor-status') || 'none';
    if (nextStatus === currentStatus) return;
    const setter = resolveTrendpilotStatusSetter();
    if (typeof setter !== 'function') {
      toast('Trendpilot-Status kann nicht aktualisiert werden.');
      return;
    }
    const id = row.getAttribute('data-trendpilot-id');
    if (!id) return;
    row.classList.add('is-loading');
    btn.disabled = true;
    try {
      await setter({ id, doctorStatus: nextStatus });
      row.setAttribute('data-doctor-status', nextStatus);
      updateTrendpilotStatusUi(row, nextStatus);
      toast(`Trendpilot: ${getDoctorStatusLabel(nextStatus)}.`);
    } catch (err) {
      logDoctorError('trendpilot status update failed', err);
      uiError?.('Trendpilot-Status konnte nicht aktualisiert werden.');
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

  if (!(await isLoggedIn())){
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
  fillAllPanels('');

  // Anzeige-Helper
  const dash = v => (v === null || v === undefined || v === "" ? "-" : String(v));
  const fromInput = $("#from");
  const toInput = $("#to");
  const from = fromInput?.value || '';
  const to = toInput?.value || '';
  if (!from || !to){
    fillAllPanels(placeholderHtml('Bitte Zeitraum wählen.'));
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
    return;
  }
  logDoctorRefreshStart(triggerReason, from, to);
  let doctorRefreshLogClosed = false;
  const closeDoctorRefreshLog = (status = 'done', detail, severity) => {
    if (doctorRefreshLogClosed) return;
    doctorRefreshLogClosed = true;
    logDoctorRefreshEnd(triggerReason, from, to, status, detail, severity);
  };

  //  Server lesen  Tagesobjekte
  let daysArr = [];
  let labRows = [];
  let labLoadError = null;
  let activityRows = [];
  let activityLoadError = null;
  try{
    daysArr = await fetchDailyOverview(from, to);
  }catch(err){
    logDoctorError('fetchDailyOverview failed', err);
    fillAllPanels(placeholderHtml('Fehler beim Laden aus der Cloud.'));
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
    closeDoctorRefreshLog('error', err?.message || err, 'error');
    return;
  }

  daysArr.sort((a,b)=> b.date.localeCompare(a.date));
  try {
    labRows = await loadLabEventsSafe(from, to);
    if (Array.isArray(labRows)) {
      labRows.sort((a, b) => (b.day || '').localeCompare(a.day || ''));
    } else {
      labRows = [];
    }
  } catch (err) {
    labLoadError = err;
    logDoctorError('lab events fetch failed', err);
  }

  try {
    activityRows = await loadActivityEventsSafe(from, to);
    if (Array.isArray(activityRows)) {
      activityRows.sort((a, b) => (b.day || '').localeCompare(a.day || ''));
    } else {
      activityRows = [];
    }
  } catch (err) {
    activityLoadError = err;
    logDoctorError('activity events fetch failed', err);
  }

  const trendpilotWrap = document.getElementById('doctorTrendpilot');
  if (trendpilotWrap) {
    let trendpilotEntries = [];
    let trendpilotUnavailable = false;
    try {
      trendpilotEntries = await loadTrendpilotEntries(from, to);
    } catch (err) {
      trendpilotUnavailable = true;
      logDoctorError('trendpilot fetch failed', err);
    }
    renderTrendpilotSection(trendpilotWrap, trendpilotEntries, fmtDateDE, { unavailable: trendpilotUnavailable });
    if (!trendpilotWrap.dataset.tpBound) {
      trendpilotWrap.addEventListener('click', onTrendpilotAction);
      trendpilotWrap.dataset.tpBound = '1';
    }
  }

  if (panels.inbox) {
    panels.inbox.innerHTML = placeholderHtml('Inbox öffnet in einem separaten Fenster.');
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
<section class="doctor-day" data-date="${day.date}">
  <div class="col-date">
    <div class="date-top">
      <span class="date-label">${fmtDateDE(day.date)}</span>
      <span class="date-cloud" title="In Cloud gespeichert?">${day.hasCloud ? "&#9729;&#65039;" : ""}</span>
    </div>
    <div class="date-actions">
      <button class="btn ghost" data-del-bp="${day.date}">Loeschen</button>
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
        <div class="num ${ (day.morning.sys!=null && day.morning.sys>130) ? 'alert' : '' }">${dash(day.morning.sys)}</div>
        <div class="num ${ (day.morning.dia!=null && day.morning.dia>90)  ? 'alert' : '' }">${dash(day.morning.dia)}</div>
        <div class="num">${dash(day.morning.pulse)}</div>
        <div class="num ${ (day.morning.map!=null && day.morning.map>100) ? 'alert' : '' }">${dash(fmtNum(day.morning.map))}</div>
        <div class="num">${dash(fmtNum(morningPp))}</div>
      </div>
      <div class="measure-row">
        <div class="label">abends</div>
        <div class="num ${ (day.evening.sys!=null && day.evening.sys>130) ? 'alert' : '' }">${dash(day.evening.sys)}</div>
        <div class="num ${ (day.evening.dia!=null && day.evening.dia>90)  ? 'alert' : '' }">${dash(day.evening.dia)}</div>
        <div class="num">${dash(day.evening.pulse)}</div>
        <div class="num ${ (day.evening.map!=null && day.evening.map>100) ? 'alert' : '' }">${dash(fmtNum(day.evening.map))}</div>
        <div class="num">${dash(fmtNum(eveningPp))}</div>
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
<section class="doctor-day doctor-body-day" data-date="${day.date}">
  <div class="col-date">
    <div class="date-top">
      <span class="date-label">${fmtDateDE(day.date)}</span>
      <span class="date-cloud" title="In Cloud gespeichert?">${day.hasCloud ? "&#9729;&#65039;" : ""}</span>
    </div>
    <div class="date-actions">
      <button class="btn ghost" data-del-body="${day.date}">Loeschen</button>
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
        <div class="num">${dash(fmtNum(day.weight))}</div>
        <div class="num">${dash(fmtNum(day.waist_cm))}</div>
        <div class="num">${dash(fmtNum(day.fat_pct))}</div>
        <div class="num">${dash(fmtNum(day.muscle_pct))}</div>
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
        .map((col) => `<div class="num">${col.value}</div>`)
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
    const stageValue = entry.ckd_stage ? escapeAttr(entry.ckd_stage) : '-';
    return `
<section class="doctor-day doctor-lab-day" data-date="${escapeAttr(entry.day || '')}">
  <div class="col-date">
    <div class="date-top">
      <span class="date-label">${fmtDateDE(entry.day)}</span>
      <span class="date-cloud" title="In Cloud gespeichert?">&#9729;&#65039;</span>
    </div>
    <div class="date-actions">
      <button class="btn ghost" data-del-lab="${escapeAttr(entry.day || '')}">Loeschen</button>
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
      <button class="btn ghost" data-del-activity="${escapeAttr(dayValue)}">Loeschen</button>
    </div>
  </div>
  <div class="col-measure doctor-activity-metrics">
    <div class="measure-head">
      <div class="activity-col">Aktivitaet</div>
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
        if (!confirm(`Alle ${label}-Eintraege fuer ${date} loeschen?`)) return;

        btn.disabled = true;
        const old = btn.textContent;
        btn.textContent = 'Loesche...';
        try {
          const result = await deleteRemoteByType(date, type);
          if (!result?.ok) {
            alert(`Server-Loeschung fehlgeschlagen (${result?.status || "?"}).`);
            return;
          }
          await requestUiRefresh({ reason: `doctor:delete:${type}` });
        } catch (err) {
          logDoctorError(`deleteRemoteByType failed (${type})`, err);
          alert('Server-Loeschung fehlgeschlagen (Fehler siehe Konsole).');
        } finally {
          btn.disabled = false;
          btn.textContent = old;
        }
      });
    });
  };

    // Rendern / Leerzustand
  if (!daysArr.length){
    if (panels.bp) panels.bp.innerHTML = placeholderHtml('Keine Eintraege im Zeitraum.');
    if (panels.body) panels.body.innerHTML = placeholderHtml('Keine Koerperdaten im Zeitraum.');
    if (panels.inbox) panels.inbox.innerHTML = placeholderHtml('Inbox oeffnet in einem separaten Fenster.');
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
  } else {
    if (panels.bp) panels.bp.innerHTML = daysArr.map(renderDoctorDay).join("");
    if (panels.body) {
      const bodyHtml = daysArr.map(renderDoctorBodyDay).filter(Boolean).join('');
      panels.body.innerHTML = bodyHtml || placeholderHtml('Keine Koerperdaten im Zeitraum.');
    }
    if (panels.inbox) panels.inbox.innerHTML = placeholderHtml('Inbox oeffnet in einem separaten Fenster.');

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
    bindDomainDeleteButtons(panels.body, 'data-del-body', 'body', 'Koerper');
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
      panels.activity.innerHTML = placeholderHtml('Keine Trainingseintraege im Zeitraum.');
    }
  }


  closeDoctorRefreshLog();
}


// --- Arzt-Export ---
// SUBMODULE: exportDoctorJson @internal - triggers download (future: route via buildDoctorSummaryJson @extract-candidate @public)
async function exportDoctorJson(){
  if (!isStageReady()) return;
  try {
    const logged = await isLoggedInFast();
    if (!logged) {
      diag.add?.('[doctor] export while auth unknown');
      // Diagnostics only: export still runs so auth wrapper can trigger re-login if needed.
    }
  } catch(err) {
    diag.add?.('[doctor] export auth check failed: ' + (err?.message || err));
    logDoctorConsole('error', '[doctor] export auth check failed', err);
  }
  if (!isDoctorUnlockedSafe()) {
    setAuthPendingAfterUnlock('export');
    const ok = await requestDoctorUnlock();
    if (!ok) return;
    setAuthPendingAfterUnlock(null);
  }
  const all = await getAllEntries();
  dl("gesundheitslog.json", JSON.stringify(all, null, 2), "application/json");
}
// SUBMODULE: doctorApi @internal - registriert öffentliche API-Funktionen im globalen Namespace
  const doctorApi = {
    renderDoctor,
    exportDoctorJson,
    renderDoctorInboxOverlay,
    showDoctorInboxPanel,
    hideDoctorInboxPanel,
    generateMonthlyReport
  };

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

  const renderMonthlyReportsSection = (panel, reports, fmtDateDE, { error, emptyLabel } = {}) => {
    if (!panel) return;
    if (error) {
      panel.innerHTML = `<div class="small u-doctor-placeholder">Monatsberichte konnten nicht geladen werden.</div>`;
      return;
    }
    if (!reports?.length) {
      panel.innerHTML = `<div class="small u-doctor-placeholder">${emptyLabel || 'Noch keine Berichte vorhanden.'}</div>`;
      return;
    }
    const cards = reports.map((report) => renderMonthlyReportCard(report, fmtDateDE)).join('');
    panel.innerHTML = `<div class="doctor-inbox">${cards}</div>`;
  };

  const filterReportsByType = (reports, filter) => {
    if (!Array.isArray(reports)) return [];
    if (!filter || filter === 'all') return reports;
    return reports.filter((report) => (report.subtype || report.payload?.subtype) === filter);
  };

  const getFilterEmptyLabel = (filter) => {
    if (filter === 'monthly_report') return 'Keine Monatsberichte vorhanden.';
    if (filter === 'range_report') return 'Keine Arzt-Berichte vorhanden.';
    return 'Noch keine Berichte vorhanden.';
  };

  const formatMonthLabel = (value) => {
    if (!value) return 'Monat unbekannt';
    const parseDate = (iso) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    let candidate = parseDate(value);
    if (!candidate && value.length <= 7) {
      candidate = parseDate(`${value}-01T00:00:00Z`);
    }
    if (!candidate) return value;
    try {
      return candidate.toLocaleDateString('de-AT', { month: 'long', year: 'numeric' });
    } catch (_) {
      return value;
    }
  };

  const formatReportDateTime = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '-';
      return d.toLocaleString('de-AT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return '-';
    }
  };

  const markdownToHtml = (text = '') => {
    let html = escapeAttr(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return html;
  };

  const formatReportNarrative = (text) => {
    const raw = (text || '').trim();
    if (!raw) return '<p class="report-empty">Kein Berichtstext vorhanden.</p>';
    const lines = raw.split(/\r?\n/);
    const blocks = [];
    let bulletBuffer = [];

    const flushBullets = () => {
      if (!bulletBuffer.length) return;
      const items = bulletBuffer.map((entry) => `<li>${markdownToHtml(entry)}</li>`).join('');
      blocks.push(`<ul>${items}</ul>`);
      bulletBuffer = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushBullets();
        return;
      }
      if (trimmed.startsWith('- ')) {
        bulletBuffer.push(trimmed.slice(2));
      } else {
        flushBullets();
        blocks.push(`<p>${markdownToHtml(trimmed)}</p>`);
      }
    });
    flushBullets();
    return blocks.join('');
  };

  const reportFlags = (report) => {
    const flags = report?.payload?.meta?.flags;
    if (!Array.isArray(flags)) return [];
    return flags.filter((flag) => typeof flag === 'string' && flag.trim());
  };

  const renderMonthlyReportCard = (report, fmtDateDE) => {
    const subtype = report.subtype || report.reportType || 'monthly_report';
    const isRangeReport = subtype === 'range_report';
    const periodFrom = report.period?.from || report.day || '';
    const periodTo = report.period?.to || report.day || '';
    const monthLabel = formatMonthLabel(report.reportMonth || report.day || '');
    const createdLabel = formatReportDateTime(report.reportCreatedAt || report.ts);
    const summary = (report.summary || '').trim() || 'Kein Summary verfügbar.';
    const flags = reportFlags(report);
    const badgeHtml = flags
      .map((flag) => `<span class="report-flag">${escapeAttr(flag)}</span>`)
      .join('');
    const textHtml = formatReportNarrative(report.text);
    const monthTag = isRangeReport ? '' : report.reportMonth || '';
    const title = isRangeReport
      ? 'Arzt-Bericht - Zeitraum'
      : `Monatsbericht - ${monthLabel || 'Unbekannter Monat'}`;
    const subtitle = `Zeitraum: ${periodFrom || '-'} bis ${periodTo || '-'}`;
    const tag = isRangeReport ? 'Arzt-Bericht' : 'Monatsbericht';
    return `
<article class="doctor-report-card" data-report-id="${escapeAttr(report.id || '')}" data-report-month="${escapeAttr(monthTag)}" data-report-type="${escapeAttr(subtype)}" data-report-from="${escapeAttr(periodFrom)}" data-report-to="${escapeAttr(periodTo)}">
  <div class="doctor-report-head">
    <div class="doctor-report-period">
      <strong>${escapeAttr(title)}</strong>
      <span>${escapeAttr(subtitle)}</span>
    </div>
    <div class="doctor-report-meta">Erstellt ${escapeAttr(createdLabel)}</div>
  </div>
  <div class="doctor-report-tag">${escapeAttr(tag)}</div>
  <div class="doctor-report-summary">${escapeAttr(summary)}${badgeHtml}</div>
  <div class="doctor-report-body">${textHtml}</div>
  <div class="doctor-report-actions">
    <button class="btn ghost" type="button" data-report-action="regenerate">Neu erstellen</button>
    <button class="btn ghost" type="button" data-report-action="delete">Löschen</button>
  </div>
</article>`;
  };

  async function renderDoctorInboxOverlay({ from, to } = {}) {
    if (!showDoctorInboxPanel()) {
      toast('Inbox ist derzeit nicht verfügbar.');
      return;
    }
    inboxPanelState.range = { from: from || '', to: to || '' };
    const doc = global.document;
    const list = doc?.getElementById('doctorInboxList');
    const rangeEl = doc?.getElementById('doctorInboxRange');
    const countEl = doc?.getElementById('doctorInboxCount');
    if (!list) return;
    if (!list.dataset.reportActionsBound) {
      list.addEventListener('click', handleReportCardAction);
      list.dataset.reportActionsBound = '1';
    }
    const newReportBtn = doc?.getElementById('doctorInboxNewReportBtn');
    if (newReportBtn && !newReportBtn.dataset.boundNewReport) {
      newReportBtn.dataset.boundNewReport = '1';
      newReportBtn.addEventListener('click', async () => {
        newReportBtn.disabled = true;
        try {
          await generateMonthlyReport({ report_type: 'monthly_report' });
        } catch (err) {
          logDoctorError('new monthly report button failed', err);
          uiError?.('Neuer Monatsbericht fehlgeschlagen.');
        } finally {
          newReportBtn.disabled = false;
        }
      });
    }

    const newRangeReportBtn = doc?.getElementById('doctorInboxNewRangeReportBtn');
    if (newRangeReportBtn && !newRangeReportBtn.dataset.boundRangeReport) {
      newRangeReportBtn.dataset.boundRangeReport = '1';
      newRangeReportBtn.addEventListener('click', async () => {
        const range = inboxPanelState.range || {};
        const opts =
          range.from && range.to
            ? { from: range.from, to: range.to }
            : {};
        newRangeReportBtn.disabled = true;
        try {
          await generateMonthlyReport({ ...opts, report_type: 'range_report' });
        } catch (err) {
          logDoctorError('new range report button failed', err);
          uiError?.('Neuer Arzt-Bericht fehlgeschlagen.');
        } finally {
          newRangeReportBtn.disabled = false;
        }
      });
    }
    const clearInboxBtn = doc?.getElementById('doctorInboxClearBtn');
    if (clearInboxBtn && !clearInboxBtn.dataset.boundClearInbox) {
      clearInboxBtn.dataset.boundClearInbox = '1';
      clearInboxBtn.addEventListener('click', async () => {
        const clearer = resolveReportInboxClearer();
        if (typeof clearer !== 'function') {
          toast('Inbox kann derzeit nicht gelöscht werden.');
          return;
        }
        if (!confirm('Inbox wirklich komplett löschen?')) return;
        clearInboxBtn.disabled = true;
        try {
          await clearer({ subtypes: ['monthly_report', 'range_report'] });
          toast('Inbox geleert.');
          await refreshDoctorAfterMonthlyReport();
        } catch (err) {
          logDoctorError('inbox clear failed', err);
          uiError?.('Inbox konnte nicht gelöscht werden.');
        } finally {
          clearInboxBtn.disabled = false;
        }
      });
    }
    if (rangeEl) {
      const fromLabel = from || '-';
      const toLabel = to || '-';
      rangeEl.textContent = `Zeitraum: ${fromLabel} bis ${toLabel}`;
    }
    const filterButtons = Array.from(
      doc?.querySelectorAll('[data-report-filter]') || []
    );
    const applyFilterState = (filter, reports, { error } = {}) => {
      inboxPanelState.filter = filter || 'all';
      filterButtons.forEach((btn) => {
        const key = btn.getAttribute('data-report-filter');
        const isActive = key === inboxPanelState.filter;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      const filtered = filterReportsByType(reports, inboxPanelState.filter);
      renderMonthlyReportsSection(list, filtered, fmtDateDE, {
        error,
        emptyLabel: getFilterEmptyLabel(inboxPanelState.filter)
      });
      if (countEl) {
        const countText = `${filtered.length} Bericht${filtered.length === 1 ? '' : 'e'}`;
        countEl.textContent = countText;
      }
    };
    if (!list.dataset.reportFilterBound) {
      list.dataset.reportFilterBound = '1';
      filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-report-filter') || 'all';
          applyFilterState(key, inboxPanelState.reports || []);
        });
      });
    }

    list.innerHTML = `<div class="small u-doctor-placeholder">Berichte werden geladen ...</div>`;
    if (countEl) countEl.textContent = '';
    try {
      const reports = await loadMonthlyReports(from, to);
      inboxPanelState.reports = reports;
      applyFilterState(inboxPanelState.filter || 'all', reports, {});
    } catch (err) {
      logDoctorError('monthly reports fetch failed', err);
      applyFilterState(inboxPanelState.filter || 'all', [], { error: err });
      if (countEl) countEl.textContent = 'Fehler beim Laden';
    }
  }

  async function handleReportCardAction(event) {
    const btn = event.target.closest('[data-report-action]');
    if (!btn) return;
    const card = btn.closest('.doctor-report-card');
    if (!card) return;
    const reportId = card.getAttribute('data-report-id');
    if (!reportId) return;
    const action = btn.getAttribute('data-report-action');
    const reportType = card.getAttribute('data-report-type') || 'monthly_report';
    const reportLabel = reportType === 'range_report' ? 'Arzt-Bericht' : 'Monatsbericht';
    if (action === 'delete') {
      const deleter = resolveMonthlyReportDeleter();
      if (typeof deleter !== 'function') {
        toast('Löschen momentan nicht möglich.');
        return;
      }
      if (!confirm(`Diesen ${reportLabel} endgültig löschen?`)) return;
      btn.disabled = true;
      try {
        await deleter({ id: reportId });
        toast(`${reportLabel} gelöscht.`);
        await refreshDoctorAfterMonthlyReport();
      } catch (err) {
        logDoctorError('delete monthly report failed', err);
        uiError?.('Löschen fehlgeschlagen.');
      } finally {
        btn.disabled = false;
      }
    } else if (action === 'regenerate') {
      const monthTag = card.getAttribute('data-report-month') || null;
      const periodFrom = card.getAttribute('data-report-from') || '';
      const periodTo = card.getAttribute('data-report-to') || '';
      btn.disabled = true;
      try {
        if (reportType === 'range_report') {
          await generateMonthlyReport({
            report_type: 'range_report',
            from: periodFrom,
            to: periodTo
          });
        } else {
          await generateMonthlyReport(monthTag ? { month: monthTag } : {});
        }
      } catch (err) {
        logDoctorError('regenerate monthly report failed', err);
        uiError?.(reportType === 'range_report'
          ? 'Neuer Arzt-Bericht fehlgeschlagen.'
          : 'Neuer Monatsbericht fehlgeschlagen.');
      } finally {
        btn.disabled = false;
      }
    }
  }

  async function refreshDoctorAfterMonthlyReport(range = {}) {
    const defaultRange =
      inboxPanelState.range && (inboxPanelState.range.from || inboxPanelState.range.to)
        ? inboxPanelState.range
        : null;
    if (typeof global.requestUiRefresh === 'function') {
      try {
        await global.requestUiRefresh({ reason: 'doctor:monthly-report', doctor: true });
      } catch (err) {
        logDoctorError('ui refresh after monthly report failed', err);
      }
    }
    if (isDoctorInboxPanelOpen()) {
      try {
        const effectiveRange = defaultRange || range || {};
        await renderDoctorInboxOverlay({
          from: effectiveRange.from || '',
          to: effectiveRange.to || ''
        });
      } catch (err) {
        logDoctorError('monthly report inbox refresh failed', err);
      }
    }
  }

  async function generateMonthlyReport(options = {}) {
    const doc = global.document;
    const defaultFrom = doc?.getElementById('from')?.value || '';
    const defaultTo = doc?.getElementById('to')?.value || '';
    const month = options.month || null;
    const reportType = options.report_type || 'monthly_report';
    const from = reportType === 'range_report' ? (options.from || defaultFrom) : null;
    const to = reportType === 'range_report' ? (options.to || defaultTo) : null;
    if (reportType === 'range_report' && (!from || !to)) {
      const err = new Error('Bitte Zeitraum wählen.');
      logDoctorError('range report missing range', err);
      throw err;
    }
    const generator = resolveMonthlyReportGenerator();
    if (typeof generator !== 'function') {
      const err = new Error('monthly report generator missing');
      logDoctorError('monthly report generator unavailable', err);
      throw err;
    }
    let result;
    try {
      result = await generator({ from, to, month, report_type: reportType });
    } catch (err) {
      logDoctorError('monthly report edge call failed', err);
      throw err;
    }
    const reportLabel = reportType === 'range_report' ? 'Arzt-Bericht' : 'Monatsbericht';
    toast(`${reportLabel} ausgelöst - Inbox aktualisiert.`);
    await refreshDoctorAfterMonthlyReport({ from: from || '', to: to || '' });
    return result;
  }

  appModules.doctor = appModules.doctor || {};
  Object.assign(appModules.doctor, doctorApi);
})(typeof window !== 'undefined' ? window : globalThis);
