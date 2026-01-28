'use strict';
/**
 * MODULE: feedback.js
 * Description: Central feedback dispatcher (sound + haptic).
 * Note: Step 4.1.1 provides the API surface only; handlers wired later.
 */

(function feedbackModule(global) {
  const diag =
    global.AppModules?.diag ||
    global.diag || { add() {} };
  const config = global.AppModules?.config || {};

  const state = {
    enabled: true,
    debug: false,
    soundEnabled: config.FEEDBACK_SOUND_ENABLED !== false,
    hapticEnabled: config.FEEDBACK_HAPTIC_ENABLED !== false,
    audioCtx: null,
    cooldownMs: 350,
    lastEventAt: new Map()
  };

  const isUserIntent = (opts = {}) =>
    opts.intent === true || opts.source === 'user';

  const setEnabled = (value) => {
    state.enabled = Boolean(value);
  };

  const setSoundEnabled = (value) => {
    state.soundEnabled = Boolean(value);
  };

  const setHapticEnabled = (value) => {
    state.hapticEnabled = Boolean(value);
  };

  const setDebug = (value) => {
    state.debug = Boolean(value);
  };

  const setCooldown = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return;
    state.cooldownMs = Math.max(0, Math.round(num));
  };

  const isCoolingDown = (eventKey) => {
    if (!state.cooldownMs) return false;
    const now = Date.now();
    const last = state.lastEventAt.get(eventKey) || 0;
    if (now - last < state.cooldownMs) return true;
    state.lastEventAt.set(eventKey, now);
    return false;
  };

  const ensureAudioContext = () => {
    if (state.audioCtx) return state.audioCtx;
    const AudioCtx = global.AudioContext || global.webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      state.audioCtx = new AudioCtx();
    } catch (_) {
      state.audioCtx = null;
    }
    return state.audioCtx;
  };

  const SOUND_PRESETS = {
    snd_open: { freq: 740, dur: 90, type: 'sine', gain: 0.035 },
    snd_close: { freq: 520, dur: 90, type: 'sine', gain: 0.035 },
    snd_confirm: { freq: 620, dur: 110, type: 'triangle', gain: 0.04 },
    snd_undo: { freq: 420, dur: 150, type: 'triangle', gain: 0.04 },
    snd_toggle: { freq: 560, dur: 60, type: 'sine', gain: 0.02 },
    snd_error: { freq: 360, dur: 140, type: 'square', gain: 0.03 }
  };

  const EVENT_TO_SOUND = {
    'hub:open': 'snd_open',
    'hub:close': 'snd_close',
    'intake:save': 'snd_confirm',
    'intake:combo-save': 'snd_confirm',
    'medication:confirm': 'snd_confirm',
    'medication:undo': 'snd_undo',
    'medication:toggle': 'snd_toggle',
    'vitals:save': 'snd_confirm',
    'vitals:reset': 'snd_undo',
    'appointments:save': 'snd_confirm',
    'appointments:toggle': 'snd_toggle',
    'appointments:delete': 'snd_undo'
  };

  const HAPTIC_PRESETS = {
    tap_light: [30],
    tap_soft: [20],
    tap_double: [30, 70, 30]
  };

  const EVENT_TO_HAPTIC = {
    'hub:open': 'tap_light',
    'hub:close': 'tap_soft',
    'intake:save': 'tap_light',
    'intake:combo-save': 'tap_light',
    'medication:confirm': 'tap_light',
    'medication:undo': 'tap_double',
    'medication:toggle': 'tap_soft',
    'vitals:save': 'tap_light',
    'vitals:reset': 'tap_soft',
    'appointments:save': 'tap_light',
    'appointments:toggle': 'tap_soft',
    'appointments:delete': 'tap_double'
  };

  const playHaptic = (patternId, opts = {}) => {
    const pattern = HAPTIC_PRESETS[patternId];
    if (!pattern) return { ok: false, reason: 'unknown-haptic' };
    if (!global?.navigator?.vibrate) return { ok: false, reason: 'no-vibrate' };
    try {
      const payload = Array.isArray(pattern) ? pattern : [pattern];
      global.navigator.vibrate(payload);
      return { ok: true };
    } catch (err) {
      diag.add?.(`[feedback] haptic error: ${err?.message || err}`);
      return { ok: false, reason: 'haptic-error' };
    }
  };

  const playSound = (soundId, opts = {}) => {
    const preset = SOUND_PRESETS[soundId];
    if (!preset) return { ok: false, reason: 'unknown-sound' };
    const ctx = ensureAudioContext();
    if (!ctx) return { ok: false, reason: 'no-audio-context' };
    if (ctx.state === 'suspended') {
      try {
        ctx.resume();
      } catch (_) {
        /* ignore */
      }
    }
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const duration = (opts.dur ?? preset.dur) / 1000;
      const targetGain = opts.gain ?? preset.gain;
      osc.type = preset.type;
      osc.frequency.setValueAtTime(preset.freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
      return { ok: true };
    } catch (err) {
      diag.add?.(`[feedback] sound error: ${err?.message || err}`);
      return { ok: false, reason: 'sound-error' };
    }
  };

  const feedback = (event, opts = {}) => {
    if (!state.enabled) return { ok: false, reason: 'disabled' };
    const name = String(event || '').trim();
    if (!name) return { ok: false, reason: 'missing-event' };
    if (!isUserIntent(opts)) return { ok: false, reason: 'no-intent' };
    const eventKey = opts.dedupeKey || name;
    if (isCoolingDown(eventKey)) {
      return { ok: false, reason: 'cooldown' };
    }
    if (state.soundEnabled && opts.sound !== false) {
      const soundId =
        opts.sound ||
        (name.startsWith('snd_') ? name : null) ||
        EVENT_TO_SOUND[name];
      if (soundId) playSound(soundId, opts);
    }
    if (state.hapticEnabled && opts.haptic !== false) {
      const hapticId =
        opts.haptic ||
        (name.startsWith('tap_') ? name : null) ||
        EVENT_TO_HAPTIC[name];
      if (hapticId) playHaptic(hapticId, opts);
    }
    if (state.debug || opts.debug) {
      diag.add?.(`[feedback] ${name}`);
    }
    return { ok: true, reason: 'noop' };
  };

  const feedbackApi = {
    feedback,
    setEnabled,
    setSoundEnabled,
    setHapticEnabled,
    setDebug,
    setCooldown,
    isEnabled: () => state.enabled,
    isSoundEnabled: () => state.soundEnabled,
    isHapticEnabled: () => state.hapticEnabled,
    getCooldown: () => state.cooldownMs
  };

  global.AppModules = global.AppModules || {};
  global.AppModules.feedback = feedbackApi;
})(typeof window !== 'undefined' ? window : globalThis);
