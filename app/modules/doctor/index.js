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
  const DOCTOR_TABS = ['bp', 'body', 'lab', 'inbox'];
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
      inbox: doc.getElementById('doctorTabInbox')
    };
  };

  const inboxPanelState = {
    el: null,
    closeBound: false,
    range: { from: '', to: '' }
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
    const result = await fetcher({
      from,
      to,
      subtype: 'monthly_report',
      order: 'day.desc'
    });
    return Array.isArray(result) ? result : [];
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
      <div></div>
      <div>Gewicht (kg)</div>
      <div>Bauchumfang (cm)</div>
      <div>Fett (%)</div>
      <div>Muskel (%)</div>
    </div>
    <div class="measure-grid">
      <div class="measure-row">
        <div class="label">Werte</div>
        <div class="num">${dash(fmtNum(day.weight))}</div>
        <div class="num">${dash(fmtNum(day.waist_cm))}</div>
        <div class="num">${dash(fmtNum(day.fat_pct))}</div>
        <div class="num">${dash(fmtNum(day.muscle_pct))}</div>
      </div>
    </div>
  </div>
</section>`;
  };

  // Rendern / Leerzustand
  if (!daysArr.length){
    if (panels.bp) panels.bp.innerHTML = placeholderHtml('Keine Einträge im Zeitraum.');
    if (panels.body) panels.body.innerHTML = placeholderHtml('Keine Körperdaten im Zeitraum.');
    if (panels.lab) panels.lab.innerHTML = placeholderHtml('Lab-Tab wird demnächst befüllt.');
    if (panels.inbox) panels.inbox.innerHTML = placeholderHtml('Inbox öffnet in einem separaten Fenster.');
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
  } else {
    if (panels.bp) panels.bp.innerHTML = daysArr.map(renderDoctorDay).join("");
    if (panels.body) {
      const bodyHtml = daysArr.map(renderDoctorBodyDay).filter(Boolean).join('');
      panels.body.innerHTML = bodyHtml || placeholderHtml('Keine Körperdaten im Zeitraum.');
    }
    if (panels.lab) panels.lab.innerHTML = placeholderHtml('Lab-Tab wird demnächst befüllt.');
    if (panels.inbox) panels.inbox.innerHTML = placeholderHtml('Inbox öffnet in einem separaten Fenster.');

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

    //  Loeschen: alle Server-Events des Tages entfernen
    const bindDomainDeleteButtons = (panel, attrName, type, label) => {
      if (!panel) return;
      panel.querySelectorAll(`[${attrName}]`).forEach((btn) => {
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

    bindDomainDeleteButtons(panels.bp, 'data-del-bp', 'bp', 'Blutdruck');
    bindDomainDeleteButtons(panels.body, 'data-del-body', 'body', 'Koerper');
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

  const renderMonthlyReportsSection = (panel, reports, fmtDateDE, { error } = {}) => {
    if (!panel) return;
    if (error) {
      panel.innerHTML = `<div class="small u-doctor-placeholder">Monatsberichte konnten nicht geladen werden.</div>`;
      return;
    }
    if (!reports?.length) {
      panel.innerHTML = `<div class="small u-doctor-placeholder">Noch keine Monatsberichte vorhanden.</div>`;
      return;
    }
    const cards = reports.map((report) => renderMonthlyReportCard(report, fmtDateDE)).join('');
    panel.innerHTML = `<div class="doctor-inbox">${cards}</div>`;
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

  const formatReportBody = (text) => {
    const raw = (text || '').trim();
    if (!raw) return '<p class="report-empty">Kein Berichtstext vorhanden.</p>';
    const escaped = escapeAttr(raw);
    if (typeof nl2br === 'function') {
      return nl2br(escaped);
    }
    return escaped.replace(/\r?\n/g, '<br>');
  };

  const renderMonthlyReportCard = (report, fmtDateDE) => {
    const monthLabel = formatMonthLabel(report.reportMonth || report.day || '');
    const createdLabel = formatReportDateTime(report.reportCreatedAt || report.ts);
    const summary = (report.summary || '').trim() || 'Kein Summary verfügbar.';
    const textHtml = formatReportBody(report.text);
    return `
<article class="doctor-report-card" data-report-id="${escapeAttr(report.id || '')}">
  <div class="doctor-report-head">
    <div class="doctor-report-period">
      <strong>${escapeAttr(monthLabel || 'Unbekannter Monat')}</strong>
      <span>${report.day ? fmtDateDE(report.day) : '-'}</span>
    </div>
    <div class="doctor-report-meta">Erstellt ${escapeAttr(createdLabel)}</div>
  </div>
  <div class="doctor-report-summary">${escapeAttr(summary)}</div>
  <div class="doctor-report-body">${textHtml}</div>
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
    if (rangeEl) {
      const fromLabel = from || '—';
      const toLabel = to || '—';
      rangeEl.textContent = `Zeitraum: ${fromLabel} bis ${toLabel}`;
    }
    list.innerHTML = `<div class="small u-doctor-placeholder">Monatsberichte werden geladen …</div>`;
    if (countEl) countEl.textContent = '';
    try {
      const reports = await loadMonthlyReports(from, to);
      renderMonthlyReportsSection(list, reports, fmtDateDE, {});
      if (countEl) {
        const countText = `${reports.length} Bericht${reports.length === 1 ? '' : 'e'}`;
        countEl.textContent = countText;
      }
    } catch (err) {
      logDoctorError('monthly reports fetch failed', err);
      renderMonthlyReportsSection(list, [], fmtDateDE, { error: err });
      if (countEl) countEl.textContent = 'Fehler beim Laden';
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

  async function generateMonthlyReport() {
    const doc = global.document;
    const from = doc?.getElementById('from')?.value || '';
    const to = doc?.getElementById('to')?.value || '';
    if (!from || !to) {
      const err = new Error('Bitte Zeitraum wählen.');
      logDoctorError('monthly report range missing', err);
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
      result = await generator({ from, to });
    } catch (err) {
      logDoctorError('monthly report edge call failed', err);
      throw err;
    }
    toast('Monatsbericht ausgelöst – Inbox aktualisiert.');
    await refreshDoctorAfterMonthlyReport({ from, to });
    return result;
  }

  appModules.doctor = appModules.doctor || {};
  Object.assign(appModules.doctor, doctorApi);
})(typeof window !== 'undefined' ? window : globalThis);
