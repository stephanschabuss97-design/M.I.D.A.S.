'use strict';
/**
 * MODULE: capture/lab.js
 * Description: Validiert und speichert Laborwerte im Tageskontext (lab_event) inklusive UI-Reset.
 * Submodules:
 *  - resetLabPanel (UI-Reset)
 *  - saveLabEntry (Persistierung + Validierung)
 *  - API export & global attach
 */

(function (global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const feedbackApi = appModules.feedback || global.AppModules?.feedback || null;
  const diag =
    global.diag ||
    global.AppModules?.diag ||
    global.AppModules?.diagnostics ||
    { add() {} };
  const createBaseEntry =
    appModules.captureEntry?.createBaseEntry ||
    ((date, time, contextLabel) => {
      const safeDate = typeof date === 'string' && date ? date : todayStr();
      const safeTime = typeof time === 'string' && time ? time : '12:00';
      const iso = new Date(`${safeDate}T${safeTime}`).toISOString();
      const ts = new Date(`${safeDate}T${safeTime}`).getTime();
      return {
        date: safeDate,
        time: safeTime,
        dateTime: iso,
        ts,
        context: contextLabel || 'Tag',
        sys: null,
        dia: null,
        pulse: null,
        weight: null,
        map: null,
        notes: ''
      };
    });

  const warnCollisions = Boolean(global?.BP_DEBUG_COLLISIONS);

  const getInput = (id) => document.getElementById(id);
  const numberOrNull = (value) => (Number.isFinite(value) ? value : null);

  function resetLabPanel(opts = {}) {
    const { focus = true } = opts;
    if (opts.intent) {
      feedbackApi?.feedback?.('vitals:reset', { intent: true, source: 'user' });
    }
    const ids = [
      'labEgfr',
      'labCreatinine',
      'labCkdStage',
      'labHba1c',
      'labLdl',
      'labPotassium',
      'labComment'
    ];
    ids.forEach((id) => {
      const el = getInput(id);
      if (!el) return;
      el.value = '';
      if (typeof clearFieldError === 'function') {
        clearFieldError(el);
      }
    });
    if (focus) {
      const first = getInput('labEgfr');
      if (first) first.focus();
    }
  }

  function parseLabNumber(el, { label, min, max, required = false }) {
    if (!el) return { value: null, valid: !required };
    const raw = (el.value || '').trim();
    if (!raw) {
      if (required) {
        setFieldError?.(el);
        return { value: null, valid: false };
      }
      clearFieldError?.(el);
      return { value: null, valid: true };
    }
    const value = toNumDE(raw);
    if (!Number.isFinite(value) || value < min || value > max) {
      setFieldError?.(el);
      uiError?.(`${label} ist ungültig (${min}–${max}).`);
      return { value: null, valid: false };
    }
    clearFieldError?.(el);
    return { value, valid: true };
  }

  async function saveLabEntry() {
    const date = document.getElementById('date')?.value || todayStr();
    const entry = createBaseEntry(date, '12:00', 'Tag');
    entry.notes = '';

    let valid = true;
    const egfrResult = parseLabNumber(getInput('labEgfr'), {
      label: 'eGFR',
      min: 0,
      max: 200,
      required: false
    });
    if (!egfrResult.valid) valid = false;

    const creatinineResult = parseLabNumber(getInput('labCreatinine'), {
      label: 'Kreatinin',
      min: 0.1,
      max: 20,
      required: false
    });
    if (!creatinineResult.valid) valid = false;

    const ckdEl = getInput('labCkdStage');
    const ckdStage = (ckdEl?.value || '').trim();

    const hba1cResult = parseLabNumber(getInput('labHba1c'), {
      label: 'HbA1c',
      min: 3,
      max: 99,
      required: false
    });
    if (!hba1cResult.valid) valid = false;
    const ldlResult = parseLabNumber(getInput('labLdl'), {
      label: 'LDL',
      min: 0,
      max: 600,
      required: false
    });
    if (!ldlResult.valid) valid = false;
    const potassiumResult = parseLabNumber(getInput('labPotassium'), {
      label: 'Kalium',
      min: 2,
      max: 7,
      required: false
    });
    if (!potassiumResult.valid) valid = false;
    const comment = (getInput('labComment')?.value || '').trim();

    if (!valid) return false;

    entry.egfr = numberOrNull(egfrResult.value);
    entry.creatinine = numberOrNull(creatinineResult.value);
    entry.hba1c = numberOrNull(hba1cResult.value);
    entry.ldl = numberOrNull(ldlResult.value);
    entry.potassium = numberOrNull(potassiumResult.value);
    entry.lab_comment = comment;
    entry.ckd_stage = ckdStage || null;

    try {
      const localId = await addEntry(entry);
      await syncWebhook(entry, localId);
      feedbackApi?.feedback?.('vitals:save', {
        intent: true,
        source: 'user',
        dedupeKey: 'vitals:save:lab'
      });
      return true;
    } catch (err) {
      diag.add?.(`[lab] save failed: ${err?.message || err}`);
      uiError?.('Laborwerte konnten nicht gespeichert werden.');
      return false;
    }
  }

  const labApi = {
    resetLabPanel,
    saveLabEntry
  };
  appModules.lab = Object.assign(appModules.lab || {}, labApi);
  global.AppModules.lab = appModules.lab;
  Object.entries(labApi).forEach(([name, fn]) => {
    if (typeof global[name] === 'undefined') {
      global[name] = fn;
      return;
    }
    if (warnCollisions) {
      console.warn('[lab] global collision', {
        name,
        existingType: typeof global[name],
        incomingType: typeof fn
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
