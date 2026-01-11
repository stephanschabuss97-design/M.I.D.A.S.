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
    const extra = detail ? ` â€“ ${detail}` : '';
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
    planned: 'ArztabklÃ¤rung geplant',
    done: 'ArztabklÃ¤rung erledigt'
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
        ? 'ArztabklÃ¤rung geplant'
        : status === 'done'
          ? 'Erledigt'
          : 'ZurÃ¼cksetzen';
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
        toast('Inbox ist derzeit nicht verfÃ¼gbar.');
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
        toast('Trendpilot best?tigt.');
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
    fillAllPanels(placeholderHtml('Bitte Zeitraum wÃ¤hlen.'));
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
    return;
  }
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
    }catch(err){
      logDoctorError('fetchDailyOverview failed', err);
      fillAllPanels(placeholderHtml('Fehler beim Laden aus der Cloud.'));
      if (scroller) scroller.scrollTop = 0;
      __doctorScrollSnapshot = { top: 0, ratio: 0 };
      closeDoctorRefreshLog('error', err?.message || err, 'error');
      return;
    }

    daysArr = daysArr.filter((entry) => isDayInRange(entry?.date));
    daysArr.sort((a,b)=> b.date.localeCompare(a.date));
    try {
      labRows = await loadLabEventsSafe(from, to);
      if (Array.isArray(labRows)) {
        labRows = labRows.filter((entry) => isDayInRange(entry?.day));
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
        activityRows = activityRows.filter((entry) => isDayInRange(entry?.day));
        activityRows.sort((a, b) => (b.day || '').localeCompare(a.day || ''));
      } else {
        activityRows = [];
      }
    } catch (err) {
      activityLoadError = err;
      logDoctorError('activity events fetch failed', err);
    }
  } else {
    try {
      const local = typeof getAllEntries === 'function' ? await getAllEntries() : [];
      const filtered = Array.isArray(local) ? local.filter((entry) => isDayInRange(entry?.date)) : [];
      daysArr = buildDailyFromLocalEntries(filtered);
      labRows = buildLabRowsFromLocalEntries(filtered);
      activityRows = [];
    } catch (err) {
      logDoctorError('local fallback failed', err);
    }
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
    panels.inbox.innerHTML = placeholderHtml('Inbox Ã¶ffnet in einem separaten Fenster.');
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
      <button class="btn ghost" data-del-bp="${day.date}">LÃ¶schen</button>
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
      <button class="btn ghost" data-del-body="${day.date}">LÃ¶schen</button>
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
      <button class="btn ghost" data-del-lab="${escapeAttr(entry.day || '')}">LÃ¶schen</button>
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
      <button class="btn ghost" data-del-activity="${escapeAttr(dayValue)}">LÃ¶schen</button>
    </div>
  </div>
  <div class="col-measure doctor-activity-metrics">
    <div class="measure-head">
      <div class="activity-col">AktivitÃ¤t</div>
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
        if (!confirm(`Alle ${label}-EintrÃ¤ge fÃ¼r ${date} lÃ¶schen?`)) return;

        btn.disabled = true;
        const old = btn.textContent;
        btn.textContent = 'LÃ¶sche...';
        try {
          const result = await deleteRemoteByType(date, type);
          if (!result?.ok) {
            alert(`Server-LÃ¶schung fehlgeschlagen (${result?.status || "?"}).`);
            return;
          }
          await requestUiRefresh({ reason: `doctor:delete:${type}` });
        } catch (err) {
          logDoctorError(`deleteRemoteByType failed (${type})`, err);
          alert('Server-LÃ¶schung fehlgeschlagen (Fehler siehe Konsole).');
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
    if (panels.body) panels.body.innerHTML = placeholderHtml('Keine KÃ¶rperdaten im Zeitraum.');
    if (panels.inbox) panels.inbox.innerHTML = placeholderHtml('Inbox Ã¶ffnet in einem separaten Fenster.');
    if (scroller) scroller.scrollTop = 0;
    __doctorScrollSnapshot = { top: 0, ratio: 0 };
  } else {
    if (panels.bp) panels.bp.innerHTML = daysArr.map(renderDoctorDay).join("");
    if (panels.body) {
      const bodyHtml = daysArr.map(renderDoctorBodyDay).filter(Boolean).join('');
      panels.body.innerHTML = bodyHtml || placeholderHtml('Keine KÃ¶rperdaten im Zeitraum.');
    }
    if (panels.inbox) panels.inbox.innerHTML = placeholderHtml('Inbox Ã¶ffnet in einem separaten Fenster.');

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
    bindDomainDeleteButtons(panels.body, 'data-del-body', 'body', 'KÃ¶rper');
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
  const from = $("#from")?.value || '';
  const to = $("#to")?.value || '';
  if (!from || !to) {
    toast('Bitte Zeitraum wÃ¤hlen.');
    return;
  }
  const isDayInRange = (day) => {
    if (!day) return false;
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  };
  const buildEntriesFromDaily = (days = []) => {
    const out = [];
    for (const d of days) {
      const notes = d?.notes || '';
      const day = d?.date || '';
      if (!day) continue;
      const hasMorning =
        d?.morning?.sys != null || d?.morning?.dia != null || d?.morning?.pulse != null;
      const hasEvening =
        d?.evening?.sys != null || d?.evening?.dia != null || d?.evening?.pulse != null;
      const hasBody =
        d?.weight != null || d?.waist_cm != null || d?.fat_kg != null || d?.muscle_kg != null;
      const hasAny = hasMorning || hasEvening || hasBody;
      const pushEntry = (context, tsHour, patch = {}) => {
        const ts = Date.parse(`${day}T${tsHour}:00Z`);
        const dateTime = Number.isFinite(ts) ? new Date(ts).toISOString() : '';
        out.push({
          date: day,
          time: `${tsHour}:00`,
          dateTime,
          ts: Number.isFinite(ts) ? ts : null,
          context,
          sys: null,
          dia: null,
          pulse: null,
          weight: null,
          waist_cm: null,
          fat_kg: null,
          muscle_kg: null,
          notes,
          ...patch
        });
      };
      if (hasMorning) {
        pushEntry('Morgen', '07', {
          sys: d.morning.sys ?? null,
          dia: d.morning.dia ?? null,
          pulse: d.morning.pulse ?? null
        });
      }
      if (hasEvening) {
        pushEntry('Abend', '19', {
          sys: d.evening.sys ?? null,
          dia: d.evening.dia ?? null,
          pulse: d.evening.pulse ?? null
        });
      }
      if (hasBody) {
        pushEntry('Tag', '12', {
          weight: d.weight ?? null,
          waist_cm: d.waist_cm ?? null,
          fat_kg: d.fat_kg ?? null,
          muscle_kg: d.muscle_kg ?? null
        });
      }
      if (!hasAny && notes) {
        pushEntry('Tag', '12', {});
      }
    }
    return out;
  };
  const payload = {
    range: { from, to },
    bp_body_notes: [],
    lab: [],
    activity: []
  };

  const online = global.navigator?.onLine !== false;
  let useSupabase = false;
  try {
    useSupabase = online && (await isLoggedInFast());
  } catch (_) {
    useSupabase = online;
  }

  if (useSupabase) {
    try {
      const days = await fetchDailyOverview(from, to);
      const filtered = Array.isArray(days) ? days.filter((entry) => isDayInRange(entry?.date)) : [];
      payload.bp_body_notes = buildEntriesFromDaily(filtered);
    } catch (err) {
      logDoctorError('export daily overview failed', err);
    }
    try {
      const labRows = await loadLabEventsSafe(from, to);
      payload.lab = Array.isArray(labRows) ? labRows.filter((entry) => isDayInRange(entry?.day)) : [];
    } catch (err) {
      logDoctorError('export lab failed', err);
    }
    try {
      const activityRows = await loadActivityEventsSafe(from, to);
      payload.activity = Array.isArray(activityRows)
        ? activityRows.filter((entry) => isDayInRange(entry?.day))
        : [];
    } catch (err) {
      logDoctorError('export activity failed', err);
    }
  } else {
    try {
      const local = typeof getAllEntries === 'function' ? await getAllEntries() : [];
      payload.bp_body_notes = Array.isArray(local)
        ? local.filter((entry) => isDayInRange(entry?.date))
        : [];
    } catch (err) {
      logDoctorError('export local entries failed', err);
    }
  }

  dl("gesundheitslog.json", JSON.stringify(payload, null, 2), "application/json");
}
// SUBMODULE: doctorApi @internal - registriert Ã¶ffentliche API-Funktionen im globalen Namespace
  const doctorApi = {
    renderDoctor,
    exportDoctorJson,
    renderDoctorInboxOverlay,
    showDoctorInboxPanel,
    hideDoctorInboxPanel,
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

  const getReportsModule = () => global.AppModules?.reports || {};
  const renderMonthlyReportsSection = (panel, reports, fmtDateDE, opts = {}) => {
    const reportsModule = getReportsModule();
    if (typeof reportsModule.renderMonthlyReportsSection === 'function') {
      return reportsModule.renderMonthlyReportsSection(panel, reports, fmtDateDE, opts);
    }
    if (!panel) return;
    panel.innerHTML = '<div class="small u-doctor-placeholder">Reports-Modul nicht geladen.</div>';
  };

  const filterReportsByType = (reports, filter) => {
    const reportsModule = getReportsModule();
    if (typeof reportsModule.filterReportsByType === 'function') {
      return reportsModule.filterReportsByType(reports, filter);
    }
    if (!Array.isArray(reports)) return [];
    if (!filter || filter === 'all') return reports;
    return reports.filter((report) => (report.subtype || report.payload?.subtype) === filter);
  };

  const getFilterEmptyLabel = (filter) => {
    const reportsModule = getReportsModule();
    if (typeof reportsModule.getFilterEmptyLabel === 'function') {
      return reportsModule.getFilterEmptyLabel(filter);
    }
    if (filter === 'monthly_report') return 'Keine Monatsberichte vorhanden.';
    if (filter === 'range_report') return 'Keine Arzt-Berichte vorhanden.';
    return 'Noch keine Berichte vorhanden.';
  };


  async function renderDoctorInboxOverlay({ from, to } = {}) {
    if (!showDoctorInboxPanel()) {
      toast('Inbox ist derzeit nicht verfÃ¼gbar.');
      return;
    }
    inboxPanelState.range = { from: from || '', to: to || '' };
    const doc = global.document;
    const list = doc?.getElementById('doctorInboxList');
    const rangeEl = doc?.getElementById('doctorInboxRange');
    const countEl = doc?.getElementById('doctorInboxCount');
    if (!list) return;
    const reportsModule = getReportsModule();
    const reportDeps = {
      toast,
      uiError,
      logError: logDoctorError,
      refreshAfter: refreshDoctorAfterMonthlyReport
    };
    if (!list.dataset.reportActionsBound) {
      list.addEventListener('click', (event) => {
        if (typeof reportsModule.handleReportCardAction !== 'function') return;
        reportsModule.handleReportCardAction(event, reportDeps);
      });
      list.dataset.reportActionsBound = '1';
    }
    const newReportBtn = doc?.getElementById('doctorInboxNewReportBtn');
    if (newReportBtn && !newReportBtn.dataset.boundNewReport) {
      newReportBtn.dataset.boundNewReport = '1';
      newReportBtn.addEventListener('click', async () => {
        newReportBtn.disabled = true;
        try {
          if (typeof reportsModule.generateMonthlyReport !== 'function') {
            throw new Error('monthly report generator missing');
          }
          await reportsModule.generateMonthlyReport({ report_type: 'monthly_report' }, reportDeps);
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
          if (typeof reportsModule.generateMonthlyReport !== 'function') {
            throw new Error('monthly report generator missing');
          }
          await reportsModule.generateMonthlyReport({ ...opts, report_type: 'range_report' }, reportDeps);
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
        if (typeof reportsModule.clearReportInbox !== 'function') {
          toast('Inbox kann derzeit nicht geloescht werden.');
          return;
        }
        clearInboxBtn.disabled = true;
        try {
          await reportsModule.clearReportInbox({
            subtypes: ['monthly_report', 'range_report'],
            ...reportDeps
          });
        } catch (err) {
          logDoctorError('inbox clear failed', err);
          uiError?.('Inbox konnte nicht geloescht werden.');
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
      const reportsModule = getReportsModule();
      const reports = typeof reportsModule.loadMonthlyReports === 'function'
        ? await reportsModule.loadMonthlyReports(from, to)
        : [];
      inboxPanelState.reports = reports;
      applyFilterState(inboxPanelState.filter || 'all', reports, {});
    } catch (err) {
      logDoctorError('monthly reports fetch failed', err);
      applyFilterState(inboxPanelState.filter || 'all', [], { error: err });
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


  appModules.doctor = appModules.doctor || {};
  Object.assign(appModules.doctor, doctorApi);
})(typeof window !== 'undefined' ? window : globalThis);
