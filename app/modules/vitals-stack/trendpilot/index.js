'use strict';
/**
 * MODULE: trendpilot/index.js
 * Description: Laedt Trendpilot-Events (Edge Function) und zeigt Popup-Hinweise bei warning/critical.
 */

(function (global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  let trendpilotInitialized = false;
  let initializingTrendpilot = false;
  let dependencyWarned = false;
  let initRetryCount = 0;
  let latestSystemComment = null;
  let lastDialogId = null;
  const MAX_INIT_RETRIES = 20;
  const RETRY_DELAY_BASE = 250;
  const MAX_RETRY_DELAY = 4000;

  const getSupabaseApi = () => global.AppModules?.supabase || {};

  const initTrendpilot = () => {
    if (trendpilotInitialized || initializingTrendpilot) return;
    initializingTrendpilot = true;

  const config = appModules.config || {};
  const configFlag =
    typeof config.TREND_PILOT_ENABLED === 'boolean' ? config.TREND_PILOT_ENABLED : undefined;
  const globalFlag =
    typeof global.TREND_PILOT_ENABLED === 'boolean' ? global.TREND_PILOT_ENABLED : undefined;
  const TREND_PILOT_FLAG = Boolean(configFlag ?? globalFlag ?? false);

  const diag =
    global.diag ||
    appModules.diag ||
    appModules.diagnostics ||
    { add() {} };

  const toast = global.toast || appModules.ui?.toast || ((msg) => console.info('[trendpilot]', msg));
  const stubApi = {
    getLatestSystemComment: () => null,
    refreshLatestSystemComment: () => Promise.resolve(null)
  };
  appModules.trendpilot = Object.assign(appModules.trendpilot || {}, stubApi);
  const grabTrendpilotDeps = () => {
    const supabaseApi = getSupabaseApi();
    return {
      supabaseApi,
      setTrendpilotAck: supabaseApi.setTrendpilotAck,
      fetchTrendpilotEventsRange: supabaseApi.fetchTrendpilotEventsRange
    };
  };

  if (!TREND_PILOT_FLAG) {
    trendpilotInitialized = true;
    initializingTrendpilot = false;
    dependencyWarned = false;
    initRetryCount = 0;
    return;
  }

  const {
    supabaseApi,
    setTrendpilotAck,
    fetchTrendpilotEventsRange
  } = grabTrendpilotDeps();

  const missingDeps = [];
  if (typeof fetchTrendpilotEventsRange !== 'function') missingDeps.push('fetchTrendpilotEventsRange');

  if (missingDeps.length) {
    if (!dependencyWarned) {
      const supaKeys = Object.keys(supabaseApi || {});
      console.warn(
        `[trendpilot] Dependencies missing; waiting: ${missingDeps.join(', ')}; SupabaseAPI keys=${supaKeys.join(', ')}`
      );
      dependencyWarned = true;
    }
    if (initRetryCount >= MAX_INIT_RETRIES) {
      diag.add?.(
        `[trendpilot] init aborted after ${MAX_INIT_RETRIES} retries (still missing: ${missingDeps.join(', ')})`
      );
      initializingTrendpilot = false;
      return;
    }
    const delay = Math.min(RETRY_DELAY_BASE * Math.pow(2, initRetryCount), MAX_RETRY_DELAY);
    initRetryCount += 1;
    setTimeout(() => {
      initTrendpilot();
    }, delay);
    initializingTrendpilot = false;
    return;
  }
  dependencyWarned = false;

  const TRENDPILOT_TEXT_MAP = {
    'bp-trend-v1': {
      popup:
        'Blutdruck-Wochenmittel ueber Baseline ({baseline_sys}/{baseline_dia}). Aktuell {avg_sys}/{avg_dia} (Delta {delta_sys}/{delta_dia}) seit {window_from}.',
      doctor:
        'BP-Trend: Wochenmittel ueber Baseline. Baseline {baseline_sys}/{baseline_dia}, aktuell {avg_sys}/{avg_dia}, Delta {delta_sys}/{delta_dia}, Dauer {weeks} Wochen.'
    },
    'body-weight-trend-v1': {
      popup:
        'Gewicht-Wochenmittel ueber Baseline ({baseline_kg} kg). Aktuell {avg_kg} kg (Delta {delta_kg} kg) seit {window_from}.',
      doctor:
        'Gewicht-Trend: Wochenmittel ueber Baseline. Baseline {baseline_kg} kg, aktuell {avg_kg} kg, Delta {delta_kg} kg, Dauer {weeks} Wochen.'
    },
    'lab-egfr-creatinine-trend-v1': {
      popup:
        'Labor-Trend auffaellig (eGFR/Kreatinin). Aktuell {avg_egfr}/{avg_creatinine}, Delta {delta_egfr}/{delta_creatinine} seit {window_from}.',
      doctor:
        'Labor-Trend: eGFR/Kreatinin. Baseline {baseline_egfr}/{baseline_creatinine}, aktuell {avg_egfr}/{avg_creatinine}, Delta {delta_egfr}/{delta_creatinine}, Dauer {weeks} Wochen.'
    },
    'bp-weight-correlation-v1': {
      popup:
        'BP + Gewicht korrelieren. Gewicht Delta {weight_delta_kg} kg im Zeitraum {window_from} bis {window_to}.',
      doctor:
        'BP/Gewicht-Korrelation: Gewicht Delta {weight_delta_kg} kg, Zeitraum {window_from} bis {window_to}, BP-Events: {bp_event_ids}, Body-Events: {body_event_ids}.'
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

  function formatTrendpilotRange(entry) {
    const from = entry?.window_from || entry?.day || '';
    const to = entry?.window_to || entry?.day || '';
    if (from && to && from !== to) return `${from} - ${to}`;
    return from || to || '';
  }

  function resolveTrendpilotMessage(entry) {
    const payload = entry?.payload || {};
    const ruleId = payload.rule_id || entry?.source || '';
    const template = TRENDPILOT_TEXT_MAP[ruleId];
    if (template) {
      return formatTrendpilotText(template.popup, payload);
    }
    return (
      payload.text ||
      payload.summary ||
      payload.rule_id ||
      entry?.source ||
      'Trendpilot-Hinweis.'
    );
  }

  function showTrendpilotDialog(entry) {
    return new Promise((resolve) => {
      const doc = global.document;
      const severity = entry?.severity === 'critical' ? 'Kritischer Hinweis' : 'Warnhinweis';
      const recommendation =
        entry?.severity === 'critical'
          ? 'Bitte aerztliche Klaerung empfohlen.'
          : 'Bitte beobachten.';
      const message = resolveTrendpilotMessage(entry);
      const range = formatTrendpilotRange(entry);
      if (!doc || !doc.body) {
        toast(`Trendpilot: ${severity}. ${message}`);
        resolve(false);
        return;
      }
      const overlay = doc.createElement('div');
      overlay.className = 'trendpilot-overlay';
      const card = doc.createElement('div');
      card.className = 'trendpilot-dialog';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      const msg = doc.createElement('div');
      msg.className = 'trendpilot-dialog-message';
      const msgId = 'trendpilotDialogMessage';
      msg.id = msgId;
      msg.textContent = `Trendpilot: ${severity}. ${recommendation}`;
      card.setAttribute('aria-labelledby', msgId);
      const deltas = doc.createElement('div');
      deltas.className = 'trendpilot-dialog-deltas';
      deltas.textContent = range ? `Zeitraum: ${range} | ${message}` : message;
      const btn = doc.createElement('button');
      btn.textContent = 'Zur Kenntnis genommen';
      btn.type = 'button';
      btn.className = 'btn primary trendpilot-dialog-btn';
      const previousActive = doc.activeElement;
      const previousOverflow = doc.body.style.overflow;
      doc.body.classList.add('trendpilot-lock');
      let resolved = false;
      const canRestoreFocus = () => {
        if (!previousActive) return false;
        if (typeof previousActive.focus !== 'function') return false;
        if (!doc.contains(previousActive)) return false;
        if (previousActive.disabled) return false;
        const tabIndex =
          typeof previousActive.tabIndex === 'number'
            ? previousActive.tabIndex
            : Number(previousActive.getAttribute?.('tabindex') ?? 0);
        if (Number.isFinite(tabIndex) && tabIndex < 0) return false;
        if (typeof previousActive.getBoundingClientRect === 'function') {
          const rect = previousActive.getBoundingClientRect();
          if ((rect?.width || 0) <= 0 && (rect?.height || 0) <= 0) return false;
        } else if ('offsetParent' in previousActive && previousActive.offsetParent === null) {
          return false;
        }
        return true;
      };
      const closeDialog = (acknowledged) => {
        if (resolved) return;
        resolved = true;
        doc.removeEventListener('keydown', onKeydown, true);
        doc.body.classList.remove('trendpilot-lock');
        doc.body.style.overflow = previousOverflow;
        overlay.remove();
        if (canRestoreFocus()) {
          try {
            previousActive.focus();
          } catch (_) {
            /* ignore */
          }
        }
        resolve(Boolean(acknowledged));
      };
      const confirmAndClose = () => closeDialog(true);
      const onKeydown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          confirmAndClose();
        } else if (event.key === 'Tab') {
          event.preventDefault();
          btn.focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          confirmAndClose();
        }
      };
      doc.addEventListener('keydown', onKeydown, true);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) confirmAndClose();
      });
      card.addEventListener('click', (event) => event.stopPropagation());
      btn.addEventListener('click', confirmAndClose);
      card.append(msg, deltas, btn);
      overlay.appendChild(card);
      doc.body.appendChild(overlay);
      setTimeout(() => btn.focus(), 0);
    });
  }
  function emitLatestTrendpilot(entry) {
    const doc = global.document;
    if (!doc || typeof doc.dispatchEvent !== 'function') return;
    try {
      doc.dispatchEvent(new CustomEvent('trendpilot:latest', { detail: { entry } }));
    } catch (_) {
      /* ignore */
    }
  }

  async function maybeShowTrendpilotDialog(entry) {
    if (!entry || entry.ack || !entry.id) return;
    if (entry.severity !== 'warning' && entry.severity !== 'critical') return;
    if (entry.id === lastDialogId) return;
    lastDialogId = entry.id;
    const acknowledged = await showTrendpilotDialog(entry);
    if (!acknowledged || typeof setTrendpilotAck !== 'function') return;
    try {
      await setTrendpilotAck({ id: entry.id, ack: true });
      latestSystemComment = {
        ...entry,
        ack: true,
        ack_at: new Date().toISOString()
      };
      emitLatestTrendpilot(latestSystemComment);
    } catch (err) {
      diag.add?.(`[trendpilot] trendpilot ack failed: ${err?.message || err}`);
    }
  }
  async function refreshLatestSystemComment({ silent = false } = {}) {
    const fetcher =
      (typeof fetchTrendpilotEventsRange === 'function' && fetchTrendpilotEventsRange) ||
      supabaseApi.fetchTrendpilotEventsRange;
    if (typeof fetcher !== 'function') {
      if (!silent) {
        diag.add?.('[trendpilot] fetchTrendpilotEventsRange not available');
      }
      return null;
    }
    try {
      const rows = await fetcher({ order: 'window_from.desc', limit: 1 });
      const raw = Array.isArray(rows) && rows.length ? rows[0] : null;
      const payload = raw?.payload || {};
      latestSystemComment = raw
        ? {
            ...raw,
            day: raw.window_from || raw.day || null,
            text:
              payload.text ||
              payload.summary ||
              payload.rule_id ||
              raw.source ||
              'Trendpilot-Hinweis'
          }
        : null;
      emitLatestTrendpilot(latestSystemComment);
      await maybeShowTrendpilotDialog(latestSystemComment);
      return latestSystemComment;
    } catch (err) {
      diag.add?.(`[trendpilot] latest load failed: ${err?.message || err}`);
      return null;
    }
  }

  const trendpilotApi = {
    getLatestSystemComment: () => latestSystemComment,
    refreshLatestSystemComment
  };

  appModules.trendpilot = Object.assign(appModules.trendpilot || {}, trendpilotApi);
  refreshLatestSystemComment({ silent: true }).catch(() => {});
  trendpilotInitialized = true;
  initializingTrendpilot = false;
  initRetryCount = 0;
  };

  if (appModules.supabase) {
    initTrendpilot();
  } else if (global.document) {
    const onReady = () => {
      global.document.removeEventListener('supabase:ready', onReady);
      initTrendpilot();
    };
    global.document.addEventListener('supabase:ready', onReady);
  }
})(typeof window !== 'undefined' ? window : globalThis);
