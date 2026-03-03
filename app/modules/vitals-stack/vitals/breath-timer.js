'use strict';
/**
 * MODULE: breath-timer.js
 * Description: Deterministic breathing timer engine and S5 UI flow (cancel-confirm + fade-out).
 * Exports:
 *  - AppModules.breathTimer
 */
(function breathTimerModule(global) {
  const doc = global.document;
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;

  const PRESET_SECONDS = Object.freeze({ 3: 180, 5: 300 });
  const PHASE_MS = Object.freeze({
    inhale: 3000,
    exhale: 4000
  });
  const CYCLE_MS = PHASE_MS.inhale + PHASE_MS.exhale;
  const TICK_FALLBACK_MS = 100;
  const PHASE_LABEL_FADE_MS = 500;
  const CANCEL_CONFIRM_WINDOW_MS = 2500;
  const STATUS_HOLD_MS = 900;
  const FADE_OUT_MS = 420;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const nowMs = () => (global.performance?.now?.() || Date.now());
  const easeInOut = (t) => {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  };

  const listeners = new Set();

  const engine = {
    status: 'idle',
    selectedPresetMin: 3,
    durationSec: PRESET_SECONDS[3],
    remainingMs: PRESET_SECONDS[3] * 1000,
    phase: 'inhale',
    phaseRemainingMs: PHASE_MS.inhale,
    phaseProgress: 0,
    orbScale: 1,
    startedAtMs: 0,
    endAtMs: 0,
    rafId: null,
    tickTimerId: null,
    dom: {
      root: null,
      timeLabel: null,
      phaseLabel: null,
      orb: null
    }
  };

  const ui = {
    mode: 'idle',
    root: null,
    overlay: null,
    feedback: null,
    startButtons: [],
    presetButtons: [],
    panelCloseButtons: [],
    confirmTimerId: null,
    statusTimerId: null,
    fadeTimerId: null,
    unsubscribeEngine: null,
    isBound: false
  };

  const getSnapshot = () => ({
    status: engine.status,
    selectedPresetMin: engine.selectedPresetMin,
    durationSec: engine.durationSec,
    remainingMs: Math.max(0, Math.round(engine.remainingMs)),
    phase: engine.phase,
    phaseRemainingMs: Math.max(0, Math.round(engine.phaseRemainingMs)),
    phaseProgress: clamp(engine.phaseProgress, 0, 1),
    orbScale: Number(engine.orbScale.toFixed(4)),
    uiMode: ui.mode
  });

  const formatMmSs = (ms) => {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const applyDomSnapshot = (snapshot) => {
    const { root, timeLabel, phaseLabel, orb } = engine.dom;
    const phaseDurationMs = snapshot.phase === 'inhale' ? PHASE_MS.inhale : PHASE_MS.exhale;
    const phaseElapsedMs = clamp(phaseDurationMs - snapshot.phaseRemainingMs, 0, phaseDurationMs);
    const fadeIn = clamp(phaseElapsedMs / PHASE_LABEL_FADE_MS, 0, 1);
    const fadeOut = clamp(snapshot.phaseRemainingMs / PHASE_LABEL_FADE_MS, 0, 1);
    const phaseOpacity = clamp(Math.min(fadeIn, fadeOut), 0, 1);
    if (root) {
      root.setAttribute('data-breath-status', snapshot.status);
      root.setAttribute('data-breath-phase', snapshot.phase);
      root.style.setProperty('--breath-orb-scale', String(snapshot.orbScale));
      root.style.setProperty('--breath-phase-progress', String(snapshot.phaseProgress));
      root.setAttribute('data-breath-ui-mode', snapshot.uiMode);
      root.style.setProperty('--breath-phase-opacity', String(phaseOpacity));
    }
    if (timeLabel) {
      timeLabel.textContent = formatMmSs(snapshot.remainingMs);
    }
    if (phaseLabel) {
      phaseLabel.textContent = snapshot.phase === 'inhale' ? 'Einatmen' : 'Ausatmen';
      phaseLabel.style.opacity = String(phaseOpacity);
      phaseLabel.style.filter = `blur(${((1 - phaseOpacity) * 1.4).toFixed(2)}px)`;
    }
    if (orb) {
      orb.style.setProperty('--breath-orb-scale', String(snapshot.orbScale));
      orb.setAttribute('data-breath-phase', snapshot.phase);
    }
  };

  const emit = (reason) => {
    const snapshot = getSnapshot();
    applyDomSnapshot(snapshot);
    listeners.forEach((listener) => {
      try {
        listener(snapshot, reason);
      } catch (_) {
        // ignore listener failures to keep timer deterministic
      }
    });
    if (doc && typeof doc.dispatchEvent === 'function') {
      try {
        doc.dispatchEvent(new CustomEvent('breath:state', { detail: { ...snapshot, reason } }));
      } catch (_) {
        // noop
      }
    }
  };

  const clearSchedulers = () => {
    if (engine.rafId != null && typeof global.cancelAnimationFrame === 'function') {
      global.cancelAnimationFrame(engine.rafId);
    }
    if (engine.tickTimerId != null) {
      global.clearTimeout(engine.tickTimerId);
    }
    engine.rafId = null;
    engine.tickTimerId = null;
  };

  const clearUiTimers = () => {
    if (ui.confirmTimerId != null) global.clearTimeout(ui.confirmTimerId);
    if (ui.statusTimerId != null) global.clearTimeout(ui.statusTimerId);
    if (ui.fadeTimerId != null) global.clearTimeout(ui.fadeTimerId);
    ui.confirmTimerId = null;
    ui.statusTimerId = null;
    ui.fadeTimerId = null;
  };

  const isUiBlocking = () => (
    ui.mode === 'preset_select' ||
    ui.mode === 'running' ||
    ui.mode === 'cancel_confirm' ||
    ui.mode === 'completed' ||
    ui.mode === 'aborted' ||
    ui.mode === 'fading_out'
  );

  const setFeedback = (text) => {
    if (ui.feedback) ui.feedback.textContent = text || '';
  };

  const setUiMode = (mode) => {
    ui.mode = mode;
    if (engine.dom.root) {
      engine.dom.root.setAttribute('data-breath-ui-mode', mode);
    }
    emit('ui-mode');
  };

  const setOverlayVisible = (visible) => {
    const overlay = ui.overlay || engine.dom.root;
    if (!overlay) return;
    if (visible) {
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-visible');
      overlay.classList.remove('is-fading-out');
      return;
    }
    overlay.classList.remove('is-visible', 'is-fading-out');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
  };

  const setBackgroundLocked = (locked) => {
    if (ui.root) {
      ui.root.classList.toggle('breath-active', !!locked);
    }
  };

  const computePhaseData = (elapsedMs) => {
    const cyclePos = elapsedMs % CYCLE_MS;
    if (cyclePos < PHASE_MS.inhale) {
      const progress = cyclePos / PHASE_MS.inhale;
      const eased = easeInOut(progress);
      return {
        phase: 'inhale',
        phaseProgress: progress,
        phaseRemainingMs: PHASE_MS.inhale - cyclePos,
        orbScale: 1 + (1.22 - 1) * eased
      };
    }
    const exhalePos = cyclePos - PHASE_MS.inhale;
    const progress = exhalePos / PHASE_MS.exhale;
    const eased = easeInOut(progress);
    return {
      phase: 'exhale',
      phaseProgress: progress,
      phaseRemainingMs: PHASE_MS.exhale - exhalePos,
      orbScale: 1.22 - (1.22 - 1) * eased
    };
  };

  const finish = (status, reason) => {
    clearSchedulers();
    engine.status = status;
    engine.remainingMs = 0;
    engine.phaseRemainingMs = 0;
    engine.phaseProgress = 1;
    emit(reason);
  };

  const tick = () => {
    if (engine.status !== 'running') return;
    const currentNow = nowMs();
    const remaining = engine.endAtMs - currentNow;
    if (remaining <= 0) {
      finish('completed', 'timer-finished');
      return;
    }
    const elapsed = Math.max(0, currentNow - engine.startedAtMs);
    const phaseData = computePhaseData(elapsed);
    engine.remainingMs = remaining;
    engine.phase = phaseData.phase;
    engine.phaseRemainingMs = phaseData.phaseRemainingMs;
    engine.phaseProgress = phaseData.phaseProgress;
    engine.orbScale = phaseData.orbScale;
    emit('tick');

    if (typeof global.requestAnimationFrame === 'function') {
      engine.rafId = global.requestAnimationFrame(tick);
      return;
    }
    engine.tickTimerId = global.setTimeout(tick, TICK_FALLBACK_MS);
  };

  const selectPreset = (minutes) => {
    const preset = Number(minutes);
    if (!(preset === 3 || preset === 5)) {
      throw new Error('Invalid preset minutes. Allowed values are 3 or 5.');
    }
    engine.selectedPresetMin = preset;
    engine.durationSec = PRESET_SECONDS[preset];
    if (engine.status === 'idle') {
      engine.remainingMs = engine.durationSec * 1000;
      engine.phase = 'inhale';
      engine.phaseRemainingMs = PHASE_MS.inhale;
      engine.phaseProgress = 0;
      engine.orbScale = 1;
    }
    emit('preset-selected');
    return getSnapshot();
  };

  const start = () => {
    if (engine.status === 'running') return getSnapshot();
    clearSchedulers();
    engine.status = 'running';
    engine.durationSec = PRESET_SECONDS[engine.selectedPresetMin] || PRESET_SECONDS[3];
    engine.remainingMs = engine.durationSec * 1000;
    engine.startedAtMs = nowMs();
    engine.endAtMs = engine.startedAtMs + engine.durationSec * 1000;
    engine.phase = 'inhale';
    engine.phaseRemainingMs = PHASE_MS.inhale;
    engine.phaseProgress = 0;
    engine.orbScale = 1;
    emit('started');
    tick();
    return getSnapshot();
  };

  const startPreset = (minutes) => {
    selectPreset(minutes);
    return start();
  };

  const stop = (reason) => {
    if (engine.status !== 'running') return getSnapshot();
    clearSchedulers();
    engine.status = 'aborted';
    emit(reason || 'stopped');
    return getSnapshot();
  };

  const reset = () => {
    clearSchedulers();
    engine.status = 'idle';
    engine.durationSec = PRESET_SECONDS[engine.selectedPresetMin] || PRESET_SECONDS[3];
    engine.remainingMs = engine.durationSec * 1000;
    engine.phase = 'inhale';
    engine.phaseRemainingMs = PHASE_MS.inhale;
    engine.phaseProgress = 0;
    engine.orbScale = 1;
    emit('reset');
    return getSnapshot();
  };

  const bindDom = (opts = {}) => {
    const root = opts.root || doc?.querySelector?.('[data-breath-overlay]');
    engine.dom.root = root || null;
    engine.dom.timeLabel = opts.timeLabel || root?.querySelector?.('[data-breath-time]') || null;
    engine.dom.phaseLabel = opts.phaseLabel || root?.querySelector?.('[data-breath-phase-label]') || null;
    engine.dom.orb = opts.orb || root?.querySelector?.('[data-breath-orb]') || null;
    ui.overlay = root || ui.overlay;
    ui.feedback = opts.feedback || root?.querySelector?.('[data-breath-feedback]') || null;
    emit('dom-bound');
    return getSnapshot();
  };

  const onChange = (handler) => {
    if (typeof handler !== 'function') return () => {};
    listeners.add(handler);
    return () => listeners.delete(handler);
  };

  const beginFadeOut = () => {
    if (!ui.overlay) {
      reset();
      setUiMode('idle');
      return;
    }
    setUiMode('fading_out');
    ui.overlay.classList.add('is-fading-out');
    ui.fadeTimerId = global.setTimeout(() => {
      setOverlayVisible(false);
      setFeedback('');
      setBackgroundLocked(false);
      reset();
      setUiMode('idle');
    }, FADE_OUT_MS);
  };

  const completeWithStatus = (mode, message) => {
    if (ui.mode === 'fading_out' || ui.mode === 'idle') return;
    clearUiTimers();
    setUiMode(mode);
    setFeedback(message);
    ui.statusTimerId = global.setTimeout(() => {
      beginFadeOut();
    }, STATUS_HOLD_MS);
  };

  const armCancelConfirm = () => {
    if (ui.mode !== 'running') return;
    clearUiTimers();
    setUiMode('cancel_confirm');
    setFeedback('Nochmal tippen zum Abbrechen');
    ui.confirmTimerId = global.setTimeout(() => {
      if (ui.mode !== 'cancel_confirm') return;
      setUiMode('running');
      setFeedback('');
    }, CANCEL_CONFIRM_WINDOW_MS);
  };

  const abortByUser = () => {
    if (!(ui.mode === 'running' || ui.mode === 'cancel_confirm')) return;
    stop('user-abort');
  };

  const handleOverlayTap = (event) => {
    if (!(ui.mode === 'running' || ui.mode === 'cancel_confirm')) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (ui.mode === 'running') {
      armCancelConfirm();
      return;
    }
    abortByUser();
  };

  const parseButtonPresetMinutes = (button) => {
    const raw = button?.getAttribute?.('data-breath-minutes');
    const parsed = Number(raw);
    return parsed === 5 ? 5 : 3;
  };

  const openPresetSelection = (defaultMinutes = 3) => {
    if (isUiBlocking()) return;
    const minutes = defaultMinutes === 5 ? 5 : 3;
    selectPreset(minutes);
    setOverlayVisible(true);
    setBackgroundLocked(true);
    setUiMode('preset_select');
    setFeedback('Waehle 3 oder 5 Minuten');
  };

  const startFromPresetSelection = (minutes) => {
    if (ui.mode !== 'preset_select') return;
    setUiMode('running');
    setFeedback('');
    startPreset(minutes);
  };

  const startFromButton = (button) => {
    const minutes = parseButtonPresetMinutes(button);
    openPresetSelection(minutes);
  };

  const hardResetUi = () => {
    clearUiTimers();
    clearSchedulers();
    setOverlayVisible(false);
    setFeedback('');
    setBackgroundLocked(false);
    reset();
    setUiMode('idle');
  };

  const handlePanelCloseIntent = () => {
    if (!isUiBlocking()) return;
    hardResetUi();
  };

  const handleVitalsTabGuard = (event) => {
    if (!isUiBlocking()) return;
    const target = event?.target;
    const tabBtn = target?.closest?.('[data-vitals-tab]');
    if (!tabBtn) return;
    event.preventDefault?.();
    event.stopPropagation?.();
  };

  const bindUi = () => {
    if (ui.isBound) return;
    ui.root = doc?.querySelector?.('.hub-vitals-bp') || null;
    const overlay = doc?.querySelector?.('[data-breath-overlay]') || null;
    bindDom({ root: overlay });
    setOverlayVisible(false);
    setBackgroundLocked(false);

    if (overlay) {
      overlay.addEventListener('click', handleOverlayTap);
    }

    ui.startButtons = Array.from(doc?.querySelectorAll?.('.start-breath-timer-btn') || []);
    ui.startButtons.forEach((btn) => {
      btn.addEventListener('click', () => startFromButton(btn));
    });

    ui.presetButtons = Array.from(overlay?.querySelectorAll?.('[data-breath-preset-minutes]') || []);
    ui.presetButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        const minutes = Number(btn.getAttribute('data-breath-preset-minutes')) === 5 ? 5 : 3;
        startFromPresetSelection(minutes);
      });
    });

    const vitalsPanel = doc?.querySelector?.('[data-hub-panel="vitals"]');
    ui.panelCloseButtons = Array.from(vitalsPanel?.querySelectorAll?.('[data-panel-close]') || []);
    ui.panelCloseButtons.forEach((btn) => {
      btn.addEventListener('click', handlePanelCloseIntent, { capture: true });
    });

    doc?.addEventListener?.('click', handleVitalsTabGuard, { capture: true });

    if (ui.unsubscribeEngine) ui.unsubscribeEngine();
    ui.unsubscribeEngine = onChange((snapshot) => {
      if (snapshot.status === 'completed') {
        completeWithStatus('completed', 'Vorbereitung abgeschlossen');
      } else if (snapshot.status === 'aborted') {
        completeWithStatus('aborted', 'Vorbereitung beendet');
      }
    });
    ui.isBound = true;
  };

  const init = () => {
    if (!doc) return;
    bindUi();
  };

  if (doc?.readyState === 'complete' || doc?.readyState === 'interactive') {
    init();
  } else {
    doc?.addEventListener('DOMContentLoaded', init, { once: true });
  }

  const breathTimerApi = {
    getSnapshot,
    isRunning: () => engine.status === 'running',
    getUiMode: () => ui.mode,
    isUiBlocking,
    selectPreset,
    start,
    startPreset,
    stop,
    reset,
    bindDom,
    onChange,
    startFromButton,
    openPresetSelection,
    startFromPresetSelection,
    beginFadeOut
  };

  appModules.breathTimer = Object.assign(appModules.breathTimer || {}, breathTimerApi);
  if (typeof global.breathTimer === 'undefined') {
    global.breathTimer = appModules.breathTimer;
  }
})(typeof window !== 'undefined' ? window : globalThis);
