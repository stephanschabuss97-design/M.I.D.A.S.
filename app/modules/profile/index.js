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

  const MEDICATION_STATUS = Object.freeze({
    loading: 'loading',
    empty: 'empty',
    ready: 'ready',
    error: 'error'
  });
  const MEDICATION_SLOT_LABELS = Object.freeze({
    morning: 'Morgens',
    noon: 'Mittags',
    evening: 'Abends',
    night: 'Nachts'
  });

  const selectors = {
    panel: '#hubProfilePanel',
    tabsHost: '.hub-profile-tabs',
    tabButtons: '[data-profile-tab]',
    tabPanels: '[data-profile-panel]',
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
    proteinFactor: '#profileProteinFactorInput',
    proteinDoctorLock: '#profileProteinDoctorLock',
    proteinDoctorFactor: '#profileProteinDoctorFactor',
    proteinDoctorMin: '#profileProteinDoctorMin',
    proteinDoctorMax: '#profileProteinDoctorMax',
    proteinDoctorFields: '#profileDoctorFields',
    proteinAutoFields: '#profileAutoFields',
    smoker: '#profileIsSmoker',
    lifestyle: '#profileLifestyleNote',
    saveBtn: '#profileSaveBtn',
    refreshBtn: '#profileRefreshBtn',
    overview: '#profileOverview'
  };

  const state = {
    data: null,
    syncing: false,
    ready: false,
    syncPromise: null,
    latestLab: null,
    medicationSummary: {
      status: MEDICATION_STATUS.loading,
      rows: [],
      dayIso: null,
      errorCode: null
    }
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
      tabsHost: panel.querySelector(selectors.tabsHost),
      tabButtons: panel.querySelectorAll(selectors.tabButtons),
      tabPanels: panel.querySelectorAll(selectors.tabPanels),
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
      proteinFactor: panel.querySelector(selectors.proteinFactor),
      proteinDoctorLock: panel.querySelector(selectors.proteinDoctorLock),
      proteinDoctorFactor: panel.querySelector(selectors.proteinDoctorFactor),
      proteinDoctorMin: panel.querySelector(selectors.proteinDoctorMin),
      proteinDoctorMax: panel.querySelector(selectors.proteinDoctorMax),
      proteinDoctorFields: panel.querySelector(selectors.proteinDoctorFields),
      proteinAutoFields: panel.querySelector(selectors.proteinAutoFields),
      smoker: panel.querySelector(selectors.smoker),
      lifestyle: panel.querySelector(selectors.lifestyle),
      saveBtn: panel.querySelector(selectors.saveBtn),
      refreshBtn: panel.querySelector(selectors.refreshBtn),
      overview: panel.querySelector(selectors.overview)
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
      doc.dispatchEvent(
        new CustomEvent('profile:changed', {
          detail: { reason, data: getProfileDataSnapshot() }
        })
      );
    } catch (_) {
      /* no-op */
    }
  };

  const getSupabaseApi = () => appModules.supabase || {};
  const ensureLocalDb = async (reason) => {
    const init = global?.initDB;
    if (typeof init !== 'function') return;
    try {
      await init();
    } catch (err) {
      diag?.add?.(`[profile] initDB failed (${reason || 'unknown'}) ${err?.message || err}`);
    }
  };
  const getMedicationModule = () => appModules.medication || null;

  const requireSupabaseClient = async () => {
    const api = getSupabaseApi();
    const ensure = api?.ensureSupabaseClient;
    if (typeof ensure !== 'function') {
      throw new Error('Supabase-Konfiguration fehlt');
    }
    const client = await ensure();
    if (!client) throw new Error('Supabase Client nicht verfuegbar');
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

  const summarizeMedicationRows = (payload) => {
    const meds = Array.isArray(payload?.medications)
      ? payload.medications.filter((med) => med && med.active !== false)
      : [];
    if (!meds.length) return { rows: [], dayIso: payload?.dayIso || todayIso() };
    const rows = meds.map((med) => {
      const parts = [med.name || 'Medikation'];
      const detail = [];
      const slots = Array.isArray(med.slots)
        ? med.slots
            .slice()
            .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
        : [];
      if (med.strength) detail.push(med.strength);
      if (slots.length) {
        const planSummary = slots
          .map((slot) => {
            const slotType = `${slot?.slot_type || ''}`.trim().toLowerCase();
            const label = MEDICATION_SLOT_LABELS[slotType] || 'Einnahme';
            const qty = Number(slot?.qty) || 1;
            return qty > 1 ? `${label} (${qty})` : label;
          })
          .join(', ');
        detail.push(planSummary);
      } else if (Number.isFinite(med.total_count)) detail.push(`${med.total_count}x/Tag`);
      if (med.with_meal) detail.push('mit Mahlzeit');
      if (detail.length) parts.push(`(${detail.join(', ')})`);
      return `- ${parts.join(' ')}`.trim();
    });
    return { rows, dayIso: payload?.dayIso || todayIso() };
  };

  const fetchMedicationSummary = async () => {
    const dayIso = todayIso();
    try {
      const medModule = getMedicationModule();
      if (!medModule?.loadMedicationForDay) {
        diag?.add?.('[profile] medication summary failed medication module unavailable');
        return {
          status: MEDICATION_STATUS.error,
          rows: [],
          dayIso,
          errorCode: 'medication_module_unavailable'
        };
      }
      const snapshot = await medModule.loadMedicationForDay(dayIso, { reason: 'profile:snapshot' });
      if (!Array.isArray(snapshot?.medications)) {
        const error = new Error('Ungültiger Medication-Snapshot');
        error.code = 'medication_snapshot_invalid';
        throw error;
      }
      const summary = summarizeMedicationRows(snapshot);
      return {
        status: summary.rows.length ? MEDICATION_STATUS.ready : MEDICATION_STATUS.empty,
        rows: summary.rows,
        dayIso: summary.dayIso,
        errorCode: null
      };
    } catch (err) {
      if (err?.code !== 'medication_not_authenticated') {
        diag?.add?.(`[profile] medication summary failed ${err?.message || err}`);
      }
      return {
        status: MEDICATION_STATUS.error,
        rows: [],
        dayIso,
        errorCode: err?.code || 'medication_summary_failed'
      };
    }
  };

  const toNumberOrNull = (value, { precision = null } = {}) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    return precision != null ? Number(num.toFixed(precision)) : num;
  };

  const getDerivedCkdStage = () => state.latestLab?.ckd_stage || null;

  const formatFactor = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '--';
    return num.toFixed(2).replace('.', ',');
  };

  const formatFactorInput = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '';
    return num.toFixed(2);
  };

  const updateCkdBadge = () => {
    if (!refs?.ckdBadge) return;
    const stage = getDerivedCkdStage();
    refs.ckdBadge.value = stage || '--';
  };

  const getMedicationDisplayText = () => {
    const summary = state.medicationSummary;
    switch (summary?.status) {
      case MEDICATION_STATUS.ready:
        return Array.isArray(summary.rows) ? summary.rows.join('\n') : '';
      case MEDICATION_STATUS.empty:
        return 'Keine aktiven Medikamente';
      case MEDICATION_STATUS.error:
        return 'Medikation derzeit nicht verfügbar';
      case MEDICATION_STATUS.loading:
      default:
        return 'Medikation wird geladen ...';
    }
  };

  const setMedicationsField = (text) => {
    if (!refs?.medications) return;
    refs.medications.value = text || '';
    refs.medications.readOnly = true;
    refs.medications.classList.add('is-derived');
    refs.medications.classList.toggle(
      'has-error',
      state.medicationSummary?.status === MEDICATION_STATUS.error
    );
    refs.medications.setAttribute(
      'aria-busy',
      String(state.medicationSummary?.status === MEDICATION_STATUS.loading)
    );
  };

  const renderMedicationField = () => {
    setMedicationsField(getMedicationDisplayText());
  };

  const applyMedicationProjection = (profile, summary = state.medicationSummary) => {
    const hasProfile = !!profile && typeof profile === 'object';
    const hasMedicationContext =
      summary?.status === MEDICATION_STATUS.ready ||
      summary?.status === MEDICATION_STATUS.empty;
    if (!hasProfile && !hasMedicationContext) return null;

    const next = hasProfile ? { ...profile } : {};
    delete next.medications;
    if (hasMedicationContext) {
      next.medications = Array.isArray(summary.rows) ? [...summary.rows] : [];
    }
    return next;
  };

  const getProfileDataSnapshot = () => {
    const projected = applyMedicationProjection(state.data);
    if (!projected) return null;
    if (Array.isArray(projected.medications)) {
      projected.medications = [...projected.medications];
    }
    return projected;
  };

  const updateDoctorFieldsVisibility = () => {
    if (!refs?.proteinDoctorLock) return;
    const isActive = !!refs.proteinDoctorLock.checked;
    if (refs.proteinDoctorFields) {
      refs.proteinDoctorFields.hidden = !isActive;
      if (isActive) {
        refs.proteinDoctorFields.removeAttribute('aria-hidden');
      } else {
        refs.proteinDoctorFields.setAttribute('aria-hidden', 'true');
      }
    }
    if (refs.proteinAutoFields) {
      refs.proteinAutoFields.hidden = isActive;
      if (isActive) {
        refs.proteinAutoFields.setAttribute('aria-hidden', 'true');
      } else {
        refs.proteinAutoFields.removeAttribute('aria-hidden');
      }
    }
  };

  const fillForm = (profile) => {
    if (!refs) return;
    const data = profile || {};
    refs.fullName.value = sanitize(data.full_name);
    refs.birthDate.value = data.birth_date ? String(data.birth_date).slice(0, 10) : '';
    refs.height.value = data.height_cm != null ? String(data.height_cm) : '';
    renderMedicationField();
    refs.doctorName.value = sanitize(data.primary_doctor_name);
    refs.doctorEmail.value = sanitize(data.primary_doctor_email);
    refs.saltLimit.value = data.salt_limit_g != null ? String(data.salt_limit_g) : '';
    if (refs.proteinDoctorLock) {
      refs.proteinDoctorLock.checked = !!data.protein_doctor_lock;
    }
    if (refs.proteinDoctorFactor) {
      refs.proteinDoctorFactor.value = formatFactorInput(data.protein_doctor_factor);
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
    if (refs.proteinFactor) {
      refs.proteinFactor.value = formatFactor(data.protein_factor_current);
    }
    updateDoctorFieldsVisibility();
    refs.smoker.value = data.is_smoker ? 'yes' : 'no';
    refs.lifestyle.value = sanitize(data.lifestyle_note);
    updateCkdBadge();
  };

  const formatValue = (value) => {
    if (value == null || value === '') return '--';
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
      ['Groesse (cm)', state.data.height_cm],
      ['CKD-Stufe (Lab)', getDerivedCkdStage()],
      ['Medikation', getMedicationDisplayText().split('\n').join(', ')],
      ['Salzlimit (g/Tag)', state.data.salt_limit_g],
      ['Protein Faktor', state.data.protein_factor_current != null ? formatFactor(state.data.protein_factor_current) : null],
      ['Protein Min (g/Tag)', state.data.protein_doctor_lock ? null : state.data.protein_target_min],
      ['Protein Max (g/Tag)', state.data.protein_doctor_lock ? null : state.data.protein_target_max],
      [
        'Raucherstatus',
        typeof state.data.is_smoker === 'boolean'
          ? state.data.is_smoker
            ? 'Raucher'
            : 'Nichtraucher'
          : null
      ],
      ['Lifestyle', state.data.lifestyle_note],
      ['Arzt (Name)', state.data.primary_doctor_name],
      ['Arzt (E-Mail)', state.data.primary_doctor_email],
      ['Aktualisiert', state.data.updated_at ? new Date(state.data.updated_at).toLocaleString('de-AT') : '--'],
    ];
    if (state.data.protein_doctor_lock) {
      rows.splice(6, 0,
        ['Protein Min (Arzt, g/Tag)', state.data.protein_doctor_min],
        ['Protein Max (Arzt, g/Tag)', state.data.protein_doctor_max],
      );
    }
    const dl = doc.createElement('dl');
    rows.forEach(([label, value]) => {
      if (value == null || value === '') return;
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
    const doctorLock = !!refs.proteinDoctorLock?.checked;
    const doctorFactor = toNumberOrNull(refs.proteinDoctorFactor?.value, { precision: 2 });
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
      salt_limit_g: toNumberOrNull(refs.saltLimit?.value, { precision: 1 }),
      protein_doctor_lock: doctorLock,
      protein_doctor_factor: doctorFactor,
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
    await ensureLocalDb(reason);
    state.syncing = true;
    setFormDisabled(true);
    state.medicationSummary = {
      status: MEDICATION_STATUS.loading,
      rows: [],
      dayIso: todayIso(),
      errorCode: null
    };
    state.data = applyMedicationProjection(state.data);
    renderMedicationField();
    renderOverview();
    const promise = (async () => {
      try {
        const client = await requireSupabaseClient();
        const userId = await requireUserId();
        const { data, error } = await client
          .from('user_profile')
          .select(
            'user_id, full_name, birth_date, height_cm, salt_limit_g, protein_target_min, protein_target_max, protein_doctor_lock, protein_doctor_factor, protein_doctor_min, protein_doctor_max, protein_factor_current, protein_age_base, protein_activity_level, protein_activity_score_28d, protein_factor_pre_ckd, protein_ckd_stage_g, protein_ckd_factor, protein_last_calc_at, is_smoker, lifestyle_note, primary_doctor_name, primary_doctor_email, updated_at'
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
        const profileData = data ? { ...data } : null;
        if (profileData) {
          profileData.ckd_stage = getDerivedCkdStage();
        }
        state.medicationSummary = await fetchMedicationSummary();
        state.data = applyMedicationProjection(profileData);
        fillForm(state.data);
        renderOverview();
        notifyChange('sync');
        log?.(`sync ok reason=${reason}`);
      } catch (err) {
        diag?.add?.(`[profile] sync failed (${reason}) ${err.message || err}`);
        if (state.medicationSummary?.status === MEDICATION_STATUS.loading) {
          state.medicationSummary = {
            status: MEDICATION_STATUS.error,
            rows: [],
            dayIso: todayIso(),
            errorCode: err?.code || 'profile_sync_failed'
          };
          state.data = applyMedicationProjection(state.data);
          fillForm(state.data);
          renderOverview();
          notifyChange('sync-error');
        }
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
      const panel = refs?.panel || null;
      const saveBtn = refs?.saveBtn || null;
      saveFeedback?.start({ button: saveBtn, panel });
      setFormDisabled(true);
      const client = await requireSupabaseClient();
      const userId = await requireUserId();
      const upsertPayload = { ...payload, user_id: userId };
      const { data, error } = await client
        .from('user_profile')
        .upsert(upsertPayload, { onConflict: 'user_id' })
        .select(
          'user_id, full_name, birth_date, height_cm, salt_limit_g, protein_target_min, protein_target_max, protein_factor_current, protein_doctor_factor, protein_doctor_lock, protein_doctor_min, protein_doctor_max, is_smoker, lifestyle_note, primary_doctor_name, primary_doctor_email, updated_at'
        )
        .single();
      if (error) throw error;
      const savedProfile = { ...data, ckd_stage: getDerivedCkdStage() };
      state.data = applyMedicationProjection(savedProfile);
      fillForm(state.data);
      renderOverview();
      notifyChange('save');
      log?.('profil gespeichert');
      saveFeedback?.ok({ button: saveBtn, panel, successText: '&#x2705; Profil gespeichert' });
    } catch (err) {
      diag?.add?.(`[profile] save failed ${err.message || err}`);
      saveFeedback?.error({
        button: refs?.saveBtn || null,
        message: err?.message || 'Speichern fehlgeschlagen.'
      });
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
    const setActiveProfileTab = (tab) => {
      panelRefs.tabButtons?.forEach((btn) => {
        const isActive = btn.getAttribute('data-profile-tab') === tab;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      panelRefs.tabPanels?.forEach((panel) => {
        const isActive = panel.getAttribute('data-profile-panel') === tab;
        panel.classList.toggle('is-active', isActive);
        if (isActive) {
          panel.hidden = false;
          panel.removeAttribute('aria-hidden');
        } else {
          panel.hidden = true;
          panel.setAttribute('aria-hidden', 'true');
        }
      });
    };
    if (panelRefs.tabsHost && panelRefs.tabButtons?.length && panelRefs.tabPanels?.length) {
      panelRefs.tabsHost.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-profile-tab]');
        if (!btn) return;
        const next = btn.getAttribute('data-profile-tab');
        if (!next) return;
        setActiveProfileTab(next);
      });
      setActiveProfileTab('view');
    }
    panelRefs.proteinDoctorLock?.addEventListener('change', updateDoctorFieldsVisibility);
    updateDoctorFieldsVisibility();
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
    getData: getProfileDataSnapshot
  };

  if (doc?.readyState === 'complete' || doc?.readyState === 'interactive') {
    init();
  } else {
    doc?.addEventListener('DOMContentLoaded', init, { once: true });
  }
})(typeof window !== 'undefined' ? window : globalThis);
