'use strict';
/**
 * MODULE: incidents/index.js
 * Description: Local incident calculator (no UI) for one-time push signals.
 * Notes:
 *  - Appointments are explicitly not incidents.
 *  - Push delivery is local (Notification API / SW registration).
 */
(function initIncidentsModule(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const doc = global.document;
  const diag = appModules.diag || global.diag || null;

  const MED_PUSH_HOUR = 10;
  const BP_PUSH_HOUR = 20;
  const CHECK_INTERVAL_MS = 60 * 1000;

  const state = {
    dayIso: null,
    medsOpen: null,
    bpMorning: false,
    bpEvening: false,
    sent: {
      med: null,
      bp: null,
    },
    timer: null,
    lastMedicationPayload: null,
    medLoadDay: null,
    medLoadInFlight: false,
    started: false,
  };

  const toDayIso = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDayIso = () => {
    if (typeof global.todayStr === 'function') return global.todayStr();
    return toDayIso();
  };

  const getLocalCutoff = (hour) => {
    const now = new Date();
    now.setHours(hour, 0, 0, 0);
    return now.getTime();
  };

  const updateDayState = () => {
    const today = getDayIso();
    if (state.dayIso === today) return false;
    state.dayIso = today;
    state.sent.med = null;
    state.sent.bp = null;
    state.bpMorning = false;
    state.bpEvening = false;
    state.medsOpen = null;
    state.lastMedicationPayload = null;
    state.medLoadDay = null;
    state.medLoadInFlight = false;
    return true;
  };

  const resolveMedicationOpen = (payload) => {
    if (!payload || !Array.isArray(payload.medications)) return null;
    const open = payload.medications
      .filter((med) => med && med.active !== false)
      .filter((med) => !med.taken);
    return open.length > 0;
  };

  const loadMedicationCache = () => {
    const mod = appModules.medication;
    if (!mod?.getCachedMedicationDay) return null;
    const cached = mod.getCachedMedicationDay(getDayIso());
    if (cached) {
      state.lastMedicationPayload = cached;
    }
    return cached || null;
  };

  const ensureMedicationPayload = async () => {
    const dayIso = getDayIso();
    if (state.medLoadDay === dayIso || state.medLoadInFlight) {
      return state.lastMedicationPayload || loadMedicationCache();
    }
    const mod = appModules.medication;
    if (!mod?.loadMedicationForDay) {
      return loadMedicationCache();
    }
    state.medLoadInFlight = true;
    try {
      const payload = await mod.loadMedicationForDay(dayIso, { reason: 'incidents' });
      if (payload) {
        state.lastMedicationPayload = payload;
        state.medLoadDay = dayIso;
      }
      return payload || state.lastMedicationPayload;
    } catch (_) {
      return loadMedicationCache();
    } finally {
      state.medLoadInFlight = false;
    }
  };

  const refreshBpStateFromLocal = async () => {
    const bootFlow = appModules.bootFlow || global.AppModules?.bootFlow || null;
    if (bootFlow?.isStageAtLeast && !bootFlow.isStageAtLeast('INIT_MODULES')) {
      return;
    }
    if (typeof global.getAllEntries !== 'function') return;
    try {
      const all = await global.getAllEntries();
      const dayIso = getDayIso();
      const todayEntries = Array.isArray(all)
        ? all.filter((entry) => entry?.date === dayIso)
        : [];
      state.bpMorning = todayEntries.some((entry) => entry?.context === 'Morgen');
      state.bpEvening = todayEntries.some((entry) => entry?.context === 'Abend');
    } catch (_) {
      // silent
    }
  };

  const notify = async ({ title, body, tag }) => {
    const payload = {
      body,
      tag,
      silent: true,
      renotify: false,
    };
    try {
      if (global.navigator?.serviceWorker?.getRegistration) {
        const reg = await global.navigator.serviceWorker.getRegistration();
        if (reg?.showNotification) {
          await reg.showNotification(title, payload);
          return true;
        }
      }
    } catch (_) {
      // fallback to Notification API
    }
    if ('Notification' in global && global.Notification?.permission === 'granted') {
      try {
        new global.Notification(title, payload);
        return true;
      } catch (_) {
        return false;
      }
    }
    return false;
  };

  const shouldPushMed = () => {
    if (!state.medsOpen) return false;
    const now = Date.now();
    return now >= getLocalCutoff(MED_PUSH_HOUR);
  };

  const shouldPushBp = () => {
    if (!state.bpMorning || state.bpEvening) return false;
    const now = Date.now();
    return now >= getLocalCutoff(BP_PUSH_HOUR);
  };

  const pushOnce = async ({ key, title, body }) => {
    const day = getDayIso();
    if (state.sent[key] === day) return false;
    const sent = await notify({ title, body, tag: `midas-${key}-${day}` });
    if (sent) {
      state.sent[key] = day;
      return true;
    }
    return false;
  };

  const evaluateIncidents = async ({ reason = 'manual' } = {}) => {
    updateDayState();

    const medPayload =
      state.lastMedicationPayload ||
      loadMedicationCache() ||
      (state.medsOpen === null ? await ensureMedicationPayload() : null);
    const medsOpen = resolveMedicationOpen(medPayload);
    if (typeof medsOpen === 'boolean') {
      state.medsOpen = medsOpen;
    }

    if (!state.bpMorning && !state.bpEvening) {
      await refreshBpStateFromLocal();
    }

    if (shouldPushMed()) {
      await pushOnce({
        key: 'med',
        title: 'Medikation offen',
        body: 'Bitte Medikation fuer heute bestaetigen.',
      });
    }

    if (shouldPushBp()) {
      await pushOnce({
        key: 'bp',
        title: 'Abend-BP offen',
        body: 'Bitte Abend-Blutdruck messen.',
      });
    }

    if (appModules.config?.LOG_HUB_DEBUG) {
      diag.add?.(
        `[incidents] refresh reason=${reason} medsOpen=${state.medsOpen} bpM=${state.bpMorning} bpA=${state.bpEvening}`
      );
    }
  };

  const scheduleChecks = () => {
    if (state.timer) return;
    state.timer = global.setInterval(() => {
      evaluateIncidents({ reason: 'tick' });
    }, CHECK_INTERVAL_MS);
  };

  const handleMedicationChanged = (event) => {
    const detail = event?.detail || {};
    const payload = detail.data || null;
    if (payload) {
      state.lastMedicationPayload = payload;
      const medsOpen = resolveMedicationOpen(payload);
      if (typeof medsOpen === 'boolean') {
        state.medsOpen = medsOpen;
      }
    }
    evaluateIncidents({ reason: 'medication:changed' });
  };

  const handleBpChanged = (event) => {
    const detail = event?.detail || {};
    const ctx = detail.context;
    const dayIso = detail.dayIso || detail.date;
    if (dayIso && dayIso !== getDayIso()) return;
    if (ctx === 'M') state.bpMorning = true;
    if (ctx === 'A') state.bpEvening = true;
    evaluateIncidents({ reason: 'bp:changed' });
  };

  const init = () => {
    if (state.started) return;
    state.started = true;
    updateDayState();
    scheduleChecks();
    evaluateIncidents({ reason: 'init' });
    doc?.addEventListener('medication:changed', handleMedicationChanged);
    doc?.addEventListener('bp:changed', handleBpChanged);
    doc?.addEventListener('visibilitychange', () => {
      if (doc.visibilityState === 'visible') {
        evaluateIncidents({ reason: 'visibility' });
      }
    });
  };

  appModules.incidents = Object.assign(appModules.incidents || {}, {
    init,
    refresh: evaluateIncidents,
  });

  const bootFlow = appModules.bootFlow || global.AppModules?.bootFlow || null;
  if (bootFlow?.whenStage) {
    bootFlow.whenStage('INIT_MODULES', init);
  } else if (doc?.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
