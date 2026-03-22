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

  const BP_PUSH_HOUR = 20;
  const CHECK_INTERVAL_MS = 60 * 1000;
  const MEDICATION_SECTION_ORDER = Object.freeze(['morning', 'noon', 'evening', 'night']);
  const MEDICATION_SECTION_CUTOFFS = Object.freeze({
    morning: 6,
    noon: 11,
    evening: 17,
    night: 21,
  });
  const MEDICATION_INCIDENT_META = Object.freeze({
    morning: {
      type: 'medication_morning',
      title: 'Morgen-Medikation offen',
      body: 'Bitte die offenen Morgen-Einnahmen jetzt bestaetigen.',
    },
    noon: {
      type: 'medication_noon',
      title: 'Mittag-Medikation offen',
      body: 'Bitte die offenen Mittag-Einnahmen jetzt bestaetigen.',
    },
    evening: {
      type: 'medication_evening',
      title: 'Abend-Medikation offen',
      body: 'Bitte die offenen Abend-Einnahmen jetzt bestaetigen.',
    },
    night: {
      type: 'medication_night',
      title: 'Nacht-Medikation offen',
      body: 'Bitte die offenen Nacht-Einnahmen jetzt bestaetigen.',
    },
  });
  const INCIDENT_VIBRATE_PATTERN = [300, 150, 300, 150, 600];
  const INCIDENT_ACTIONS = [
    {
      action: 'open-incident',
      title: 'Jetzt oeffnen',
    },
  ];

  const state = {
    dayIso: null,
    medsOpenBySection: null,
    bpMorning: false,
    bpEvening: false,
    sent: {
      medication: {
        morning: null,
        noon: null,
        evening: null,
        night: null,
      },
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

  const createMedicationSectionState = () => ({
    morning: false,
    noon: false,
    evening: false,
    night: false,
  });

  const normalizeMedicationSection = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return MEDICATION_SECTION_ORDER.includes(normalized) ? normalized : '';
  };

  const getLocalCutoff = (hour) => {
    const now = new Date();
    now.setHours(hour, 0, 0, 0);
    return now.getTime();
  };

  const getCurrentMedicationSection = (date = new Date()) => {
    const hour = date instanceof Date ? date.getHours() : new Date().getHours();
    if (hour >= MEDICATION_SECTION_CUTOFFS.night) return 'night';
    if (hour >= MEDICATION_SECTION_CUTOFFS.evening) return 'evening';
    if (hour >= MEDICATION_SECTION_CUTOFFS.noon) return 'noon';
    if (hour >= MEDICATION_SECTION_CUTOFFS.morning) return 'morning';
    return '';
  };

  const updateDayState = () => {
    const today = getDayIso();
    if (state.dayIso === today) return false;
    state.dayIso = today;
    state.sent.medication = {
      morning: null,
      noon: null,
      evening: null,
      night: null,
    };
    state.sent.bp = null;
    state.bpMorning = false;
    state.bpEvening = false;
    state.medsOpenBySection = null;
    state.lastMedicationPayload = null;
    state.medLoadDay = null;
    state.medLoadInFlight = false;
    return true;
  };

  const resolveMedicationOpenBySection = (payload) => {
    if (!payload || !Array.isArray(payload.medications)) return null;
    const sections = createMedicationSectionState();
    payload.medications
      .filter((med) => med && med.active !== false)
      .forEach((med) => {
        const slots = Array.isArray(med?.slots) ? med.slots : [];
        let matchedSlot = false;
        slots.forEach((slot) => {
          if (!slot || slot.is_taken) return;
          const section = normalizeMedicationSection(slot.slot_type);
          if (!section) return;
          sections[section] = true;
          matchedSlot = true;
        });
        if (!matchedSlot && med?.state !== 'done') {
          sections.morning = true;
        }
      });
    return sections;
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

  const buildNotificationPayload = ({ title, body, tag, type, dayIso }) => ({
    title,
    body,
    tag,
    data: {
      type,
      dayIso,
      source: 'local',
    },
    silent: false,
    renotify: false,
    requireInteraction: true,
    vibrate: INCIDENT_VIBRATE_PATTERN,
    actions: INCIDENT_ACTIONS,
    icon: 'public/img/icons/icon-192.png',
    badge: 'public/img/icons/icon-192.png',
  });

  const notify = async ({ title, body, tag, type, dayIso }) => {
    const payload = buildNotificationPayload({ title, body, tag, type, dayIso });
    try {
      if (global.navigator?.serviceWorker?.getRegistration) {
        const reg = await global.navigator.serviceWorker.getRegistration();
        if (reg?.showNotification) {
          await reg.showNotification(payload.title, payload);
          return true;
        }
      }
    } catch (_) {
      // fallback to Notification API
    }
    if ('Notification' in global && global.Notification?.permission === 'granted') {
      try {
        new global.Notification(payload.title, payload);
        return true;
      } catch (_) {
        return false;
      }
    }
    return false;
  };

  const shouldPushMedicationSection = (section) => {
    const normalizedSection = normalizeMedicationSection(section);
    if (!normalizedSection) return false;
    if (!state.medsOpenBySection?.[normalizedSection]) return false;
    return getCurrentMedicationSection() === normalizedSection;
  };

  const shouldPushBp = () => {
    if (!state.bpMorning || state.bpEvening) return false;
    const now = Date.now();
    return now >= getLocalCutoff(BP_PUSH_HOUR);
  };

  const resolveSentBucket = (key) => {
    if (Array.isArray(key)) {
      const [namespace, bucketKey] = key;
      if (namespace === 'medication') {
        return [state.sent.medication, bucketKey];
      }
    }
    return [state.sent, key];
  };

  const pushOnce = async ({ key, type, title, body }) => {
    const day = getDayIso();
    const [bucket, bucketKey] = resolveSentBucket(key);
    if (!bucket || !bucketKey) return false;
    if (bucket[bucketKey] === day) return false;
    const sent = await notify({
      title,
      body,
      type,
      dayIso: day,
      tag: `midas-incident-${type}-${day}`,
    });
    if (sent) {
      bucket[bucketKey] = day;
      return true;
    }
    return false;
  };

  const evaluateIncidents = async ({ reason = 'manual' } = {}) => {
    updateDayState();

    const medPayload =
      state.lastMedicationPayload ||
      loadMedicationCache() ||
      (state.medsOpenBySection === null ? await ensureMedicationPayload() : null);
    const medsOpenBySection = resolveMedicationOpenBySection(medPayload);
    if (medsOpenBySection) {
      state.medsOpenBySection = medsOpenBySection;
    }

    if (!state.bpMorning && !state.bpEvening) {
      await refreshBpStateFromLocal();
    }

    const currentMedicationSection = getCurrentMedicationSection();
    if (shouldPushMedicationSection(currentMedicationSection)) {
      const meta = MEDICATION_INCIDENT_META[currentMedicationSection];
      await pushOnce({
        key: ['medication', currentMedicationSection],
        type: meta.type,
        title: meta.title,
        body: meta.body,
      });
    }

    if (shouldPushBp()) {
      await pushOnce({
        key: 'bp',
        type: 'bp_evening',
        title: 'Abend-Blutdruck fehlt',
        body: 'Bitte den Blutdruck fuer heute Abend jetzt messen.',
      });
    }

    if (appModules.config?.LOG_HUB_DEBUG) {
      const medState = state.medsOpenBySection
        ? MEDICATION_SECTION_ORDER.map((section) => `${section}:${state.medsOpenBySection[section] ? 1 : 0}`).join(',')
        : 'n/a';
      diag.add?.(
        `[incidents] refresh reason=${reason} medSections=${medState} current=${currentMedicationSection || 'none'} bpM=${state.bpMorning} bpA=${state.bpEvening}`
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
      const medsOpenBySection = resolveMedicationOpenBySection(payload);
      if (medsOpenBySection) {
        state.medsOpenBySection = medsOpenBySection;
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
