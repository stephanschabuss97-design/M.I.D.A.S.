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

  function resetCapturePanels(opts = {}) {
    if (!isHandlerStageReady()) return;
    const { focus = true } = opts;
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
    bind('#captureAmount, #diaM, #pulseM, #bpCommentM', () => getActiveBpSaveButton()?.click(), () => invokeResetBpPanel('M'));
    bind('#sysA, #diaA, #pulseA, #bpCommentA', () => getActiveBpSaveButton()?.click(), () => invokeResetBpPanel('A'));
    const resetBodyPanelFn = getResetBodyPanel();
    bind('#weightDay, #input-waist-cm, #fatPctDay, #musclePctDay', () => document.getElementById('saveBodyPanelBtn')?.click(), () => resetBodyPanelFn?.());
    bind('#labEgfr, #labCreatinine, #labCkdStage, #labHba1c, #labLdl, #labPotassium, #labComment', () => document.getElementById('saveLabPanelBtn')?.click(), () => window.AppModules?.lab?.resetLabPanel?.());

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

  const captureApi = {
    resetCapturePanels,
    addCapturePanelKeys
  };
  appModules.capture = appModules.capture || {};
  Object.assign(appModules.capture, captureApi);
})(typeof window !== 'undefined' ? window : globalThis);
