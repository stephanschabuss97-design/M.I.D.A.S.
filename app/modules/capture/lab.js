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

  const LAB_CATEGORIES = new Set(['A1', 'A2', 'A3']);
  const warnCollisions = Boolean(global?.BP_DEBUG_COLLISIONS);

  const getInput = (id) => document.getElementById(id);
  const numberOrNull = (value) => (Number.isFinite(value) ? value : null);

  function resetLabPanel(opts = {}) {
    const { focus = true } = opts;
    const ids = [
      'labEgfr',
      'labCreatinine',
      'labAlbuminuria',
      'labAcr',
      'labHba1c',
      'labLdl',
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
        uiError?.(`Bitte ${label} eingeben.`);
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

  const determineGfrStage = (value) => {
    if (!Number.isFinite(value)) return null;
    if (value >= 90) return 'G1';
    if (value >= 60) return 'G2';
    if (value >= 45) return 'G3a';
    if (value >= 30) return 'G3b';
    if (value >= 15) return 'G4';
    return 'G5';
  };

  const deriveCkdStage = (egfr, albumCat) => {
    const gStage = determineGfrStage(egfr);
    const aStage = albumCat ? albumCat.trim().toUpperCase() : '';
    if (!gStage && !aStage) return null;
    return [gStage, aStage].filter(Boolean).join(' ').trim() || null;
  };

  async function saveLabEntry() {
    const date = document.getElementById('date')?.value || todayStr();
    const entry = createBaseEntry(date, '12:00', 'Tag');
    entry.notes = '';

    let valid = true;
    const egfrResult = parseLabNumber(getInput('labEgfr'), {
      label: 'eGFR',
      min: 0,
      max: 200,
      required: true
    });
    if (!egfrResult.valid) valid = false;

    const creatinineResult = parseLabNumber(getInput('labCreatinine'), {
      label: 'Kreatinin',
      min: 0.1,
      max: 20,
      required: true
    });
    if (!creatinineResult.valid) valid = false;

    const albumEl = getInput('labAlbuminuria');
    let albumCat = (albumEl?.value || '').trim().toUpperCase();
    if (albumCat) {
      if (!LAB_CATEGORIES.has(albumCat)) {
        setFieldError?.(albumEl);
        uiError?.('Albuminurie-Kategorie muss A1, A2 oder A3 sein.');
        valid = false;
        albumCat = null;
      } else {
        clearFieldError?.(albumEl);
      }
    } else {
      albumCat = null;
      clearFieldError?.(albumEl);
    }

    const acrResult = parseLabNumber(getInput('labAcr'), {
      label: 'ACR',
      min: 0,
      max: 5000,
      required: false
    });
    if (!acrResult.valid) valid = false;
    const hba1cResult = parseLabNumber(getInput('labHba1c'), {
      label: 'HbA1c',
      min: 3,
      max: 25,
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
    const comment = (getInput('labComment')?.value || '').trim();

    if (!albumCat && acrResult.value == null) {
      uiError?.('Bitte Albuminurie-Kategorie oder ACR angeben.');
      setFieldError?.(albumEl);
      const acrEl = getInput('labAcr');
      setFieldError?.(acrEl);
      valid = false;
    } else {
      clearFieldError?.(albumEl);
      clearFieldError?.(getInput('labAcr'));
    }

    if (!valid) return false;

    entry.egfr = numberOrNull(egfrResult.value);
    entry.creatinine = numberOrNull(creatinineResult.value);
    entry.albuminuria_category = albumCat;
    entry.acr_value = numberOrNull(acrResult.value);
    entry.hba1c = numberOrNull(hba1cResult.value);
    entry.ldl = numberOrNull(ldlResult.value);
    entry.lab_comment = comment;
    entry.ckd_stage = deriveCkdStage(entry.egfr, entry.albuminuria_category);

    const hasPayload =
      entry.egfr != null ||
      entry.creatinine != null ||
      entry.albuminuria_category ||
      entry.acr_value != null ||
      entry.hba1c != null ||
      entry.ldl != null ||
      (entry.lab_comment && entry.lab_comment.length);

    if (!hasPayload) {
      uiError?.('Keine Labordaten eingegeben.');
      return false;
    }

    try {
      const localId = await addEntry(entry);
      await syncWebhook(entry, localId);
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
