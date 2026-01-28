'use strict';
/**
 * MODULE: vitals/index.js
 * Description: Vitals panel helpers (BP/Body/Lab) and panel shortcuts.
 * Notes:
 *  - Exposes vitals-only helpers via `window.AppModules.capture`.
 */
(function(global){
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const feedbackApi = appModules.feedback || global.AppModules?.feedback || null;
  const getSupabaseApi = () => global.AppModules?.supabase || {};
  const getSupabaseState = () => getSupabaseApi().supabaseState || null;
  const getAuthState = () => getSupabaseState()?.authState || 'unauth';
  const isAuthReady = () => getAuthState() !== 'unknown';
  const isHandlerStageReady = () => {
    const bootFlow = global.AppModules?.bootFlow;
    if (!bootFlow?.isStageAtLeast) return isAuthReady();
    return bootFlow.isStageAtLeast('INIT_MODULES') && isAuthReady();
  };

  const getBpModule = () => global.AppModules?.bp;
  const invokeResetBpPanel = (ctx, opts) => getBpModule()?.resetBpPanel?.(ctx, opts);

  const getResetBodyPanel = () => {
    const mod = global.AppModules?.body;
    if (mod && typeof mod.resetBodyPanel === 'function') return mod.resetBodyPanel;
    return null;
  };

  const formatNumberDE = (value, digits = 1) => {
    if (!Number.isFinite(value)) return '--';
    if (!digits) return String(Math.round(value));
    return Number(value).toFixed(digits).replace('.', ',');
  };

  const formatTargetRange = (min, max, unit) => {
    const minVal = min == null ? null : Number(min);
    const maxVal = max == null ? null : Number(max);
    const minOk = Number.isFinite(minVal) && minVal > 0;
    const maxOk = Number.isFinite(maxVal) && maxVal > 0;
    if (minOk && maxOk) {
      return `${formatNumberDE(minVal, 0)}-${formatNumberDE(maxVal, 0)} ${unit}`;
    }
    if (maxOk) return `${formatNumberDE(maxVal, 0)} ${unit}`;
    if (minOk) return `${formatNumberDE(minVal, 0)} ${unit}`;
    return '--';
  };

  const activityModifierFor = (score) => {
    if (!Number.isFinite(score)) return null;
    if (score >= 6) return 0.3;
    if (score >= 2) return 0.2;
    return 0.1;
  };

  let latestWeightCache = null;
  let latestWeightFetch = null;

  const fetchLatestWeight = async () => {
    if (latestWeightCache && Number.isFinite(latestWeightCache.value)) {
      return latestWeightCache.value;
    }
    if (latestWeightFetch) return latestWeightFetch;
    const supabase = global.AppModules?.supabase;
    if (!supabase?.getUserId || !supabase?.sbSelect) return null;
    latestWeightFetch = (async () => {
      const uid = await supabase.getUserId();
      if (!uid) return null;
      const rows = await supabase.sbSelect({
        table: 'v_events_body',
        select: 'day,kg',
        filters: [['user_id', `eq.${uid}`]],
        order: 'day.desc',
        limit: 1
      });
      const row = Array.isArray(rows) && rows.length ? rows[0] : null;
      const val = row && Number.isFinite(Number(row.kg)) ? Number(row.kg) : null;
      if (val !== null) {
        latestWeightCache = { value: val };
      }
      return val;
    })().finally(() => {
      latestWeightFetch = null;
    });
    return latestWeightFetch;
  };

  const setProteinMetricValue = (key, value) => {
    const el = document.querySelector(`[data-protein-value="${key}"]`);
    if (el) el.textContent = value;
  };

  const renderProteinMetrics = (profile) => {
    const data = profile || global.AppModules?.profile?.getData?.() || null;
    if (!data) {
      ['age-base', 'activity-score', 'ckd-factor', 'factor-current', 'weight-latest', 'target-range'].forEach((key) => {
        setProteinMetricValue(key, '--');
      });
      return;
    }
    const ageBase = data.protein_age_base;
    setProteinMetricValue(
      'age-base',
      typeof ageBase === 'number' && Number.isFinite(ageBase) ? formatNumberDE(ageBase, 1) : '--'
    );

    const activityScore = data.protein_activity_score_28d;
    const activityModifier = activityModifierFor(activityScore);
    const activityText =
      Number.isFinite(activityScore) && Number.isFinite(activityModifier)
        ? `${formatNumberDE(activityScore, 0)} (+${formatNumberDE(activityModifier, 1)})`
        : '--';
    setProteinMetricValue('activity-score', activityText);

    const ckdFactor = data.protein_ckd_factor;
    const ckdText = typeof ckdFactor === 'number' && Number.isFinite(ckdFactor)
      ? `x${formatNumberDE(ckdFactor, 2)}`
      : '--';
    setProteinMetricValue('ckd-factor', ckdText);

    const factorCurrent = data.protein_factor_current;
    setProteinMetricValue(
      'factor-current',
      typeof factorCurrent === 'number' && Number.isFinite(factorCurrent)
        ? formatNumberDE(factorCurrent, 2)
        : '--'
    );

    const weightEl = document.getElementById('weightDay');
    const weightRaw = weightEl?.value?.trim();
    const weightVal = weightRaw ? Number(weightRaw.replace(',', '.')) : null;
    if (Number.isFinite(weightVal)) {
      setProteinMetricValue('weight-latest', `${formatNumberDE(weightVal, 1)} kg`);
    } else {
      setProteinMetricValue('weight-latest', '--');
      fetchLatestWeight().then((latest) => {
        if (Number.isFinite(latest)) {
          setProteinMetricValue('weight-latest', `${formatNumberDE(latest, 1)} kg`);
        }
      });
    }

    let targetText = formatTargetRange(
      data.protein_target_min,
      data.protein_target_max,
      'g'
    );
    if (targetText === '--') {
      targetText = formatTargetRange(data.protein_target, null, 'g');
    }
    setProteinMetricValue('target-range', targetText);
  };

  function resetCapturePanels(opts = {}) {
    if (!isHandlerStageReady()) return;
    const { focus = true, intent = false } = opts;
    if (intent) {
      feedbackApi?.feedback?.('vitals:reset', { intent: true, source: 'user' });
    }
    invokeResetBpPanel('M', { focus: false });
    invokeResetBpPanel('A', { focus: false });
    const resetBodyPanelFn = getResetBodyPanel();
    if (resetBodyPanelFn) resetBodyPanelFn({ focus: false });
    window.AppModules?.lab?.resetLabPanel?.({ focus: false });
    const ctxSel = document.getElementById('bpContextSel');
    if (ctxSel) ctxSel.value = 'M';
    document.querySelectorAll('.bp-pane').forEach(pane => {
      pane.classList.toggle('active', pane.dataset.context === 'M');
    });
    window.AppModules?.bp?.updateBpCommentWarnings?.();
    if (focus) {
      const first = document.getElementById('captureAmount');
      if (first) first.focus();
    }
  }

  function addCapturePanelKeys(){
    if (!isHandlerStageReady()) return;
    const getActiveBpSaveButton = () => document.querySelector('.bp-pane.active .save-bp-panel-btn');
    const bind = (selectors, onEnter, onEsc) => {
      document.querySelectorAll(selectors).forEach(el => {
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); onEnter?.(); }
          if (e.key === 'Escape') { e.preventDefault(); onEsc?.(); }
        });
      });
    };
    bind('#captureAmount, #diaM, #pulseM, #bpCommentM', () => getActiveBpSaveButton()?.click(), () => invokeResetBpPanel('M', { intent: true }));
    bind('#sysA, #diaA, #pulseA, #bpCommentA', () => getActiveBpSaveButton()?.click(), () => invokeResetBpPanel('A', { intent: true }));
    const resetBodyPanelFn = getResetBodyPanel();
    bind('#weightDay, #input-waist-cm, #fatPctDay, #musclePctDay', () => document.getElementById('saveBodyPanelBtn')?.click(), () => resetBodyPanelFn?.({ intent: true }));
    bind('#labEgfr, #labCreatinine, #labCkdStage, #labHba1c, #labLdl, #labPotassium, #labComment', () => document.getElementById('saveLabPanelBtn')?.click(), () => window.AppModules?.lab?.resetLabPanel?.({ intent: true }));

    const vitalsTabsHost = document.querySelector('.hub-vitals');
    const vitalsTabButtons = document.querySelectorAll('[data-vitals-tab]');
    const vitalsPanels = document.querySelectorAll('[data-vitals-panel]');
    let activeVitalsTab = 'bp';
    const setActiveVitalsTab = (tab) => {
      activeVitalsTab = tab;
      vitalsTabButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-vitals-tab') === tab;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      vitalsPanels.forEach((panel) => {
        const isActive = panel.getAttribute('data-vitals-panel') === tab;
        panel.classList.toggle('is-active', isActive);
        if (isActive) {
          panel.removeAttribute('aria-hidden');
          panel.hidden = false;
        } else {
          panel.setAttribute('aria-hidden', 'true');
          panel.hidden = true;
        }
      });
    };
    if (vitalsTabsHost && vitalsTabButtons.length && vitalsPanels.length) {
      vitalsTabsHost.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-vitals-tab]');
        if (!btn) return;
        const next = btn.getAttribute('data-vitals-tab');
        if (!next || next === activeVitalsTab) return;
        setActiveVitalsTab(next);
      });
      setActiveVitalsTab(activeVitalsTab);
    }

    const intakeTabsHost = document.querySelector('.hub-intake-tabs');
    const intakeTabButtons = document.querySelectorAll('[data-intake-tab]');
    const intakePanels = document.querySelectorAll('[data-intake-panel]');
    let activeIntakeTab = 'in';
    const setActiveIntakeTab = (tab) => {
      activeIntakeTab = tab;
      intakeTabButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-intake-tab') === tab;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      intakePanels.forEach((panel) => {
        const isActive = panel.getAttribute('data-intake-panel') === tab;
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
    if (intakeTabsHost && intakeTabButtons.length && intakePanels.length) {
      intakeTabsHost.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-intake-tab]');
        if (!btn) return;
        const next = btn.getAttribute('data-intake-tab');
        if (!next || next === activeIntakeTab) return;
        setActiveIntakeTab(next);
      });
      setActiveIntakeTab(activeIntakeTab);
    }
  }

  function initProteinMetrics() {
    renderProteinMetrics();
    if (document?.addEventListener) {
      document.addEventListener('profile:changed', (event) => {
        renderProteinMetrics(event?.detail?.data);
      });
    }
  }

  const captureApi = {
    resetCapturePanels,
    addCapturePanelKeys
  };
  appModules.capture = appModules.capture || {};
  Object.assign(appModules.capture, captureApi);

  if (document?.readyState === 'complete' || document?.readyState === 'interactive') {
    initProteinMetrics();
  } else {
    document?.addEventListener('DOMContentLoaded', initProteinMetrics, { once: true });
  }
})(typeof window !== 'undefined' ? window : globalThis);
