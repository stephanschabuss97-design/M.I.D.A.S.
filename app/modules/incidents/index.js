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
  const PUSH_ROUTING_REFRESH_MS = 5 * 60 * 1000;
  const MEDICATION_SECTION_ORDER = Object.freeze(['morning', 'noon', 'evening', 'night']);
  const MEDICATION_SECTION_THRESHOLDS = Object.freeze({
    morning: {
      reminderAfter: { hour: 10, minute: 0 },
      incidentAfter: { hour: 12, minute: 0 },
    },
    noon: {
      reminderAfter: { hour: 14, minute: 0 },
      incidentAfter: { hour: 16, minute: 0 },
    },
    evening: {
      reminderAfter: { hour: 20, minute: 0 },
      incidentAfter: { hour: 22, minute: 0 },
    },
    night: {
      reminderAfter: { hour: 22, minute: 30 },
      incidentAfter: { hour: 23, minute: 30 },
    },
  });
  const MEDICATION_INCIDENT_META = Object.freeze({
    morning: {
      type: 'medication_morning',
      reminderTitle: 'Morgenmedikation noch nicht erfasst?',
      reminderBody: 'Falls noch offen: bitte kurz bestaetigen.',
      incidentTitle: 'Morgenmedikation weiterhin offen',
      incidentBody: 'Bitte jetzt pruefen und bestaetigen.',
    },
    noon: {
      type: 'medication_noon',
      reminderTitle: 'Mittagmedikation noch nicht erfasst?',
      reminderBody: 'Falls noch offen: bitte kurz bestaetigen.',
      incidentTitle: 'Mittagmedikation weiterhin offen',
      incidentBody: 'Bitte jetzt pruefen und bestaetigen.',
    },
    evening: {
      type: 'medication_evening',
      reminderTitle: 'Abendmedikation noch nicht erfasst?',
      reminderBody: 'Falls noch offen: bitte kurz bestaetigen.',
      incidentTitle: 'Abendmedikation weiterhin offen',
      incidentBody: 'Bitte jetzt pruefen und bestaetigen.',
    },
    night: {
      type: 'medication_night',
      reminderTitle: 'Nachtmedikation noch nicht erfasst?',
      reminderBody: 'Falls noch offen: bitte kurz bestaetigen.',
      incidentTitle: 'Nachtmedikation weiterhin offen',
      incidentBody: 'Bitte jetzt pruefen und bestaetigen.',
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
        morning: { reminder: null, incident: null },
        noon: { reminder: null, incident: null },
        evening: { reminder: null, incident: null },
        night: { reminder: null, incident: null },
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

  const getLocalCutoff = (hour, minute = 0) => {
    const now = new Date();
    now.setHours(hour, minute, 0, 0);
    return now.getTime();
  };

  const createMedicationSentState = () => ({
    morning: { reminder: null, incident: null },
    noon: { reminder: null, incident: null },
    evening: { reminder: null, incident: null },
    night: { reminder: null, incident: null },
  });

  const getMedicationSeverityForSection = (section, date = new Date()) => {
    const normalizedSection = normalizeMedicationSection(section);
    if (!normalizedSection) return '';
    if (!state.medsOpenBySection?.[normalizedSection]) return '';
    const threshold = MEDICATION_SECTION_THRESHOLDS[normalizedSection];
    if (!threshold) return '';
    const nowMs = date instanceof Date ? date.getTime() : Date.now();
    const incidentAt = getLocalCutoff(threshold.incidentAfter.hour, threshold.incidentAfter.minute);
    if (nowMs >= incidentAt) return 'incident';
    const reminderAt = getLocalCutoff(threshold.reminderAfter.hour, threshold.reminderAfter.minute);
    if (nowMs >= reminderAt) return 'reminder';
    return '';
  };

  const updateDayState = () => {
    const today = getDayIso();
    if (state.dayIso === today) return false;
    state.dayIso = today;
    state.sent.medication = createMedicationSentState();
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

  const buildNotificationPayload = ({ title, body, tag, type, dayIso, severity = 'incident' }) => {
    const isIncident = severity === 'incident';
    return {
      title,
      body,
      tag,
      data: {
        type,
        severity,
        dayIso,
        source: 'local',
      },
      renotify: false,
      icon: 'public/img/icons/icon-192.png',
      badge: 'public/img/icons/icon-192.png',
      ...(isIncident
        ? {
            silent: false,
            requireInteraction: true,
            vibrate: INCIDENT_VIBRATE_PATTERN,
            actions: INCIDENT_ACTIONS,
          }
        : {
            silent: false,
            requireInteraction: false,
          }),
    };
  };

  const notify = async ({ title, body, tag, type, dayIso, severity = 'incident' }) => {
    const payload = buildNotificationPayload({ title, body, tag, type, dayIso, severity });
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

  const shouldPushBp = () => {
    if (!state.bpMorning || state.bpEvening) return false;
    const now = Date.now();
    return now >= getLocalCutoff(BP_PUSH_HOUR);
  };

  const resolveSentBucket = (key) => {
    if (Array.isArray(key)) {
      const [namespace, bucketKey, severityKey] = key;
      if (namespace === 'medication') {
        const medicationBucket = state.sent.medication?.[bucketKey];
        if (severityKey && medicationBucket) {
          return [medicationBucket, severityKey];
        }
        return [state.sent.medication, bucketKey];
      }
    }
    return [state.sent, key];
  };

  const pushOnce = async ({ key, type, title, body, severity = 'incident' }) => {
    const day = getDayIso();
    const [bucket, bucketKey] = resolveSentBucket(key);
    if (!bucket || !bucketKey) return false;
    if (bucket[bucketKey] === day) return false;
    const shouldSuppress = await (async () => {
      const profileModule = appModules.profile || null;
      if (!profileModule?.getPushRoutingStatus) return false;
      const routing = profileModule.getPushRoutingStatus();
      const checkedAtMs = Date.parse(routing?.checkedAt || '');
      const isStale = !Number.isFinite(checkedAtMs) || (Date.now() - checkedAtMs) > PUSH_ROUTING_REFRESH_MS;
      if (isStale && typeof profileModule.refreshPushStatus === 'function') {
        try {
          await profileModule.refreshPushStatus({ reason: 'incidents-routing-check' });
        } catch (_) {
          // fall back to the last known routing state
        }
      }
      return !!profileModule.shouldSuppressLocalPushes?.();
    })();
    if (shouldSuppress) {
      bucket[bucketKey] = day;
      if (appModules.config?.LOG_HUB_DEBUG) {
        diag?.add?.(`[incidents] local push suppressed type=${type} severity=${severity} reason=remote-healthy`);
      }
      return true;
    }
    const tagPrefix = severity === 'reminder' ? 'midas-reminder' : 'midas-incident';
    const sent = await notify({
      title,
      body,
      type,
      severity,
      dayIso: day,
      tag: `${tagPrefix}-${type}-${day}`,
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

    for (const section of MEDICATION_SECTION_ORDER) {
      const severity = getMedicationSeverityForSection(section);
      if (!severity) continue;
      const meta = MEDICATION_INCIDENT_META[section];
      if (!meta) continue;
      const title = severity === 'reminder' ? meta.reminderTitle : meta.incidentTitle;
      const body = severity === 'reminder' ? meta.reminderBody : meta.incidentBody;
      await pushOnce({
        key: ['medication', section, severity],
        type: meta.type,
        title,
        body,
        severity,
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
        ? MEDICATION_SECTION_ORDER
          .map((section) => {
            if (!state.medsOpenBySection[section]) return `${section}:0`;
            const severity = getMedicationSeverityForSection(section);
            return `${section}:${severity || 'open'}`;
          })
          .join(',')
        : 'n/a';
      diag.add?.(
        `[incidents] refresh reason=${reason} medSections=${medState} bpM=${state.bpMorning} bpA=${state.bpEvening}`
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
