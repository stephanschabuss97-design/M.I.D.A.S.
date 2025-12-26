'use strict';
/**
 * MODULE: profile/index.js
 * Description: Bindet das neue Profil-Panel an Supabase.user_profile (CRUD + Overview + Events).
 */
(function initProfileModule(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const doc = global.document;
  const diag = appModules.diag || global.diag || null;
  const log = (msg) => diag?.add?.(`[profile] ${msg}`);

  const selectors = {
    panel: '#hubProfilePanel',
    form: '#profileForm',
    fullName: '#profileFullName',
    birthDate: '#profileBirthDate',
    height: '#profileHeight',
    ckdBadge: '#profileCkdBadge',
    medications: '#profileMedications',
    doctorName: '#profileDoctorName',
    doctorEmail: '#profileDoctorEmail',
    saltLimit: '#profileSaltLimit',
    proteinMin: '#profileProteinMin',
    proteinMax: '#profileProteinMax',
    proteinDoctorLock: '#profileProteinDoctorLock',
    proteinDoctorMin: '#profileProteinDoctorMin',
    proteinDoctorMax: '#profileProteinDoctorMax',
    smoker: '#profileIsSmoker',
    lifestyle: '#profileLifestyleNote',
    saveBtn: '#profileSaveBtn',
    refreshBtn: '#profileRefreshBtn',
    overview: '#profileOverview',
  };

  const state = {
    data: null,
    syncing: false,
    ready: false,
    syncPromise: null,
    latestLab: null,
    medicationSummary: null
  };

  let refs = null;

  const sanitize = (val) => (val == null ? '' : String(val).trim());
  const todayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const ensureRefs = () => {
    if (refs) return refs;
    const panel = doc?.querySelector(selectors.panel);
    if (!panel) return null;
    refs = {
      panel,
      form: panel.querySelector(selectors.form),
      fullName: panel.querySelector(selectors.fullName),
      birthDate: panel.querySelector(selectors.birthDate),
      height: panel.querySelector(selectors.height),
      ckdBadge: panel.querySelector(selectors.ckdBadge),
      medications: panel.querySelector(selectors.medications),
      doctorName: panel.querySelector(selectors.doctorName),
      doctorEmail: panel.querySelector(selectors.doctorEmail),
      saltLimit: panel.querySelector(selectors.saltLimit),
      proteinMin: panel.querySelector(selectors.proteinMin),
      proteinMax: panel.querySelector(selectors.proteinMax),
      proteinDoctorLock: panel.querySelector(selectors.proteinDoctorLock),
      proteinDoctorMin: panel.querySelector(selectors.proteinDoctorMin),
      proteinDoctorMax: panel.querySelector(selectors.proteinDoctorMax),
      smoker: panel.querySelector(selectors.smoker),
      lifestyle: panel.querySelector(selectors.lifestyle),
      saveBtn: panel.querySelector(selectors.saveBtn),
      refreshBtn: panel.querySelector(selectors.refreshBtn),
      overview: panel.querySelector(selectors.overview),
    };
    return refs;
  };

  const setFormDisabled = (flag) => {
    const elements = refs?.form?.querySelectorAll('input, textarea, select, button');
    elements?.forEach((node) => {
      node.disabled = !!flag;
    });
    refs?.panel?.classList.toggle('is-loading', !!flag);
  };

  const notifyChange = (reason = 'update') => {
    if (!doc) return;
    try {
      doc.dispatchEvent(new CustomEvent('profile:changed', { detail: { reason, data: state.data } }));
    } catch (_) {
      /* no-op */
    }
  };

  const getSupabaseApi = () => appModules.supabase || {};
  const getMedicationModule = () => appModules.medication || null;

  const requireSupabaseClient = async () => {
    const api = getSupabaseApi();
    const ensure = api?.ensureSupabaseClient;
    if (typeof ensure !== 'function') {
      throw new Error('Supabase-Konfiguration fehlt');
    }
    const client = await ensure();
    if (!client) throw new Error('Supabase Client nicht verfÜgbar');
    return client;
  };

  const requireUserId = async () => {
    const api = getSupabaseApi();
    const getUid = api?.getUserId;
    if (typeof getUid !== 'function') throw new Error('Supabase User fehlt');
    const uid = await getUid();
    if (!uid) throw new Error('Supabase User nicht angemeldet');
    return uid;
  };

  const parseMedicationsInput = (text) => {
    if (!text) return [];
    return text
      .split(/[\n,;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  };

  const formatMedicationsOutput = (value) => {
    if (Array.isArray(value)) {
      return value.join('\n');
    }
    if (value && typeof value === 'object') {
      try {
        const arr = Object.values(value).filter(Boolean);
        return Array.isArray(arr) ? arr.join('\n') : '';
      } catch (_) {
        return '';
      }
    }
    if (typeof value === 'string') {
      return value;
    }
    return '';
  };

  const summarizeMedicationRows = (payload) => {
    const meds = Array.isArray(payload?.medications)
      ? payload.medications.filter((med) => med && med.active !== false)
      : [];
    if (!meds.length) return { rows: [], dayIso: payload?.dayIso || todayIso() };
    const rows = meds.map((med) => {
      const parts = [med.name || 'Medikation'];
      const detail = [];
      if (med.strength) detail.push(med.strength);
      if (Number.isFinite(med.dose_per_day)) detail.push(`${med.dose_per_day}×/Tag`);
      if (detail.length) parts.push(`(${detail.join(', ')})`);
      return `- ${parts.join(' ')}`.trim();
    });
    return { rows, dayIso: payload?.dayIso || todayIso() };
  };

  const fetchMedicationSummary = async () => {
    try {
      const medModule = getMedicationModule();
      if (!medModule?.loadMedicationForDay) return null;
      const snapshot = await medModule.loadMedicationForDay(todayIso(), { reason: 'profile:snapshot' });
      return summarizeMedicationRows(snapshot);
    } catch (err) {
      if (err?.code !== 'medication_not_authenticated') {
        diag?.add?.(`[profile] medication summary failed ${err?.message || err}`);
      }
      return null;
    }
  };

  const toNumberOrNull = (value, { precision = null } = {}) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    return precision != null ? Number(num.toFixed(precision)) : num;
  };

  const getDerivedCkdStage = () => state.latestLab?.ckd_stage || null;

  const updateCkdBadge = () => {
    if (!refs?.ckdBadge) return;
    const stage = getDerivedCkdStage();
    refs.ckdBadge.value = stage || '—';
  };

  const setMedicationsField = (text, { derived = false } = {}) => {
    if (!refs?.medications) return;
    refs.medications.value = text || '';
    refs.medications.readOnly = !!derived;
    refs.medications.classList.toggle('is-derived', !!derived);
  };

  const fillForm = (profile) => {
    if (!refs) return;
    const data = profile || {};
    refs.fullName.value = sanitize(data.full_name);
    refs.birthDate.value = data.birth_date ? String(data.birth_date).slice(0, 10) : '';
    refs.height.value = data.height_cm != null ? String(data.height_cm) : '';
    setMedicationsField(formatMedicationsOutput(data.medications), { derived: false });
    refs.doctorName.value = sanitize(data.primary_doctor_name);
    refs.doctorEmail.value = sanitize(data.primary_doctor_email);
    refs.saltLimit.value = data.salt_limit_g != null ? String(data.salt_limit_g) : '';
    if (refs.proteinDoctorLock) {
      refs.proteinDoctorLock.checked = !!data.protein_doctor_lock;
    }
    if (refs.proteinDoctorMin) {
      refs.proteinDoctorMin.value = data.protein_doctor_min != null ? String(data.protein_doctor_min) : '';
    }
    if (refs.proteinDoctorMax) {
      refs.proteinDoctorMax.value = data.protein_doctor_max != null ? String(data.protein_doctor_max) : '';
    }
    if (refs.proteinMin) {
      refs.proteinMin.value = data.protein_target_min != null ? String(data.protein_target_min) : '';
    }
    refs.proteinMax.value = data.protein_target_max != null ? String(data.protein_target_max) : '';
    refs.smoker.value = data.is_smoker ? 'yes' : 'no';
    refs.lifestyle.value = sanitize(data.lifestyle_note);
    updateCkdBadge();
  };

  const formatValue = (value) => {
    if (value == null || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
    return String(value);
  };

  const renderOverview = () => {
    if (!refs?.overview) return;
    const container = refs.overview;
    container.innerHTML = '';
    if (!state.data) {
      container.innerHTML = '<p class="muted small">Noch keine Daten gespeichert.</p>';
      return;
    }
    const rows = [
      ['Name', state.data.full_name],
      ['Geburtsdatum', state.data.birth_date],
      ['Größe (cm)', state.data.height_cm],
      ['CKD-Stufe (Lab)', getDerivedCkdStage()],
      ['Medikation', Array.isArray(state.data.medications) ? state.data.medications.join(', ') : '—'],
      ['Salzlimit (g/Tag)', state.data.salt_limit_g],
      ['Protein Min (g/Tag)', state.data.protein_target_min],
      ['Protein Max (g/Tag)', state.data.protein_target_max],
      ['Doctor-Lock (Protein)', state.data.protein_doctor_lock ? 'aktiv' : 'aus'],
      ['Doctor Min (g/Tag)', state.data.protein_doctor_min],
      ['Doctor Max (g/Tag)', state.data.protein_doctor_max],
      ['Raucherstatus', state.data.is_smoker ? 'Raucher' : 'Nichtraucher'],
      ['Lifestyle', state.data.lifestyle_note],
      ['Arzt (Name)', state.data.primary_doctor_name],
      ['Arzt (E-Mail)', state.data.primary_doctor_email],
      ['Aktualisiert', state.data.updated_at ? new Date(state.data.updated_at).toLocaleString('de-AT') : '—'],
    ];
    const dl = doc.createElement('dl');
    rows.forEach(([label, value]) => {
      const dt = doc.createElement('dt');
      dt.textContent = label;
      const dd = doc.createElement('dd');
      dd.textContent = formatValue(value);
      dl.append(dt, dd);
    });
    container.appendChild(dl);
  };

  const extractFormPayload = () => {
    if (!refs) return null;
    const medications = parseMedicationsInput(refs.medications?.value);
    const doctorLock = !!refs.proteinDoctorLock?.checked;
    const doctorMin = toNumberOrNull(refs.proteinDoctorMin?.value, { precision: 1 });
    const doctorMax = toNumberOrNull(refs.proteinDoctorMax?.value, { precision: 1 });
    const prevMin = state.data?.protein_target_min ?? null;
    const prevMax = state.data?.protein_target_max ?? null;
    const targetMin = doctorLock ? (doctorMin ?? prevMin) : prevMin;
    const targetMax = doctorLock ? (doctorMax ?? prevMax) : prevMax;
    const payload = {
      full_name: sanitize(refs.fullName?.value),
      birth_date: refs.birthDate?.value || null,
      height_cm: toNumberOrNull(refs.height?.value),
      medications: medications.length ? medications : [],
      salt_limit_g: toNumberOrNull(refs.saltLimit?.value, { precision: 1 }),
      protein_doctor_lock: doctorLock,
      protein_doctor_min: doctorMin,
      protein_doctor_max: doctorMax,
      protein_target_min: targetMin,
      protein_target_max: targetMax,
      is_smoker: (refs.smoker?.value || 'no') === 'yes',
      lifestyle_note: sanitize(refs.lifestyle?.value),
      primary_doctor_name: sanitize(refs.doctorName?.value) || null,
      primary_doctor_email: sanitize(refs.doctorEmail?.value) || null,
    };
    return payload;
  };

  const syncProfile = async ({ reason = 'manual' } = {}) => {
    if (state.syncing) return state.syncPromise;
    const refsOk = ensureRefs();
    if (!refsOk) return null;
    state.syncing = true;
    setFormDisabled(true);
    const promise = (async () => {
      try {
        const client = await requireSupabaseClient();
        const userId = await requireUserId();
        const { data, error } = await client
          .from('user_profile')
          .select(
            'user_id, full_name, birth_date, height_cm, medications, salt_limit_g, protein_target_min, protein_target_max, is_smoker, lifestyle_note, primary_doctor_name, primary_doctor_email, updated_at'
          )
          .eq('user_id', userId)
          .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        let latestLab = null;
        try {
          const api = getSupabaseApi();
          const loader = api?.loadLatestLabSnapshot;
          latestLab = typeof loader === 'function' ? await loader() : null;
        } catch (labErr) {
          diag?.add?.(`[profile] loadLatestLabSnapshot failed: ${labErr?.message || labErr}`);
        }
        state.latestLab = latestLab;
        state.data = data ? { ...data } : null;
        if (state.data) {
          state.data.ckd_stage = getDerivedCkdStage();
        }
        const medSummary = await fetchMedicationSummary();
        if (medSummary?.rows?.length) {
          state.medicationSummary = medSummary;
          if (!state.data) state.data = {};
          state.data.medications = [...medSummary.rows];
        } else {
          state.medicationSummary = null;
        }
        fillForm(state.data);
        if (state.medicationSummary?.rows?.length) {
          setMedicationsField(state.medicationSummary.rows.join('\n'), { derived: true });
        }
        renderOverview();
        notifyChange('sync');
        log?.(`sync ok reason=${reason}`);
      } catch (err) {
        diag?.add?.(`[profile] sync failed (${reason}) ${err.message || err}`);
      } finally {
        state.syncing = false;
        state.syncPromise = null;
        setFormDisabled(false);
      }
    })();
    state.syncPromise = promise;
    return promise;
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    const payload = extractFormPayload();
    if (!payload) return;
    if (refs?.form && !refs.form.reportValidity()) {
      return;
    }
    try {
      setFormDisabled(true);
      const client = await requireSupabaseClient();
      const userId = await requireUserId();
      const upsertPayload = { ...payload, user_id: userId };
      const { data, error } = await client
        .from('user_profile')
        .upsert(upsertPayload, { onConflict: 'user_id' })
        .select(
          'user_id, full_name, birth_date, height_cm, medications, salt_limit_g, protein_target_min, protein_target_max, protein_doctor_lock, protein_doctor_min, protein_doctor_max, is_smoker, lifestyle_note, primary_doctor_name, primary_doctor_email, updated_at'
        )
        .single();
      if (error) throw error;
      state.data = data;
      fillForm(state.data);
      renderOverview();
      notifyChange('save');
      log?.('profil gespeichert');
    } catch (err) {
      diag?.add?.(`[profile] save failed ${err.message || err}`);
    } finally {
      setFormDisabled(false);
    }
  };

  const handleRefresh = async (event) => {
    event?.preventDefault();
    await syncProfile({ reason: 'manual-refresh' });
  };

  const init = () => {
    if (state.ready) return;
    const panelRefs = ensureRefs();
    if (!panelRefs) return;
    panelRefs.saveBtn?.addEventListener('click', handleSave);
    panelRefs.refreshBtn?.addEventListener('click', handleRefresh);
    state.ready = true;
    syncProfile({ reason: 'init' });
    doc?.addEventListener(
      'supabase:ready',
      () => {
        syncProfile({ reason: 'supabase-ready' });
      },
      { once: true }
    );
  };

  appModules.profile = {
    init,
    sync: syncProfile,
    getData: () => (state.data ? { ...state.data } : null),
  };

  if (doc?.readyState === 'complete' || doc?.readyState === 'interactive') {
    init();
  } else {
    doc?.addEventListener('DOMContentLoaded', init, { once: true });
  }
})(typeof window !== 'undefined' ? window : globalThis);