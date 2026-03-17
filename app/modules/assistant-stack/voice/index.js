'use strict';

(function initMidasVoice(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const fallbackDiag =
    appModules.diag ||
    global.diag ||
    appModules.diagnostics || { add() {} };

  const VOICE_STATE_LABELS = {
    idle: 'Bereit',
    listening: 'Ich hoere zu',
    transcribing: 'Transkribiere',
    parsing: 'Pruefe Befehl',
    executing: 'Fuehre aus',
    confirming: 'Bestaetige',
    error: 'Fehler',
  };
  const VAD_SINGLE_COMMAND_SILENCE_MS = 450;
  const VAD_SHORT_UTTERANCE_SILENCE_MS = 550;
  const VAD_SILENCE_MS = 700;
  const VAD_MULTI_COMMAND_SILENCE_MS = 1200;
  const VAD_LONG_UTTERANCE_SILENCE_MS = 1600;
  const VAD_MIN_SPEECH_BEFORE_AUTOSTOP_MS = 550;
  const VOICE_MEDICATION_LOW_STOCK_TARGET = 'medication_low_stock_reorder_start';

  let voiceCtrl = null;
  let voiceGateObserver = null;
  let lastVoiceGateStatus = { allowed: false, reason: 'booting' };
  const voiceGateListeners = new Set();
  let deps = {
    hub: null,
    doc: null,
    endpoints: null,
    directSupabaseCall: false,
    buildFunctionJsonHeaders: null,
    getSupabaseFunctionHeaders: null,
    getSupabaseState: null,
    diag: null,
    config: null,
    isBootReady: null,
  };

  const getDiag = () => deps.diag || fallbackDiag;
  const nowMs = () =>
    (typeof global.performance?.now === 'function' ? global.performance.now() : Date.now());
  const getPerfProxy = () => global.perfStats || null;
  const addVoicePerfDelta = (key, start, end = nowMs()) => {
    const perf = getPerfProxy();
    if (!perf?.add || !Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      return;
    }
    try {
      perf.add(key, end - start);
    } catch (_) {
      // ignore perf collector errors
    }
  };
  const resetVoicePerfTrace = () => {
    if (!voiceCtrl) return;
    voiceCtrl.perfTrace = {
      tapStartedAt: 0,
      firstSpeechAt: 0,
      stopRequestedAt: 0,
      transcribeStartedAt: 0,
      transcribeCompletedAt: 0,
      replyReadyAt: 0,
    };
  };
  const markVoiceReplyReady = () => {
    if (!voiceCtrl?.perfTrace) return;
    const trace = voiceCtrl.perfTrace;
    if (!Number.isFinite(trace.replyReadyAt) || trace.replyReadyAt <= 0) {
      trace.replyReadyAt = nowMs();
    }
    if (Number.isFinite(trace.transcribeCompletedAt) && trace.transcribeCompletedAt > 0) {
      addVoicePerfDelta(
        'voice_transcribe_to_reply_ready',
        trace.transcribeCompletedAt,
        trace.replyReadyAt,
      );
    }
  };
  const getIntentEngine = () =>
    appModules.intentEngine ||
    global.AppModules?.intentEngine ||
    null;
  const recordIntentTelemetry = (event = {}) => {
    const intentApi = getIntentEngine();
    if (typeof intentApi?.recordTelemetry !== 'function') {
      return null;
    }
    try {
      return intentApi.recordTelemetry(event);
    } catch (err) {
      getDiag().add?.(`[midas-voice][intent] telemetry error: ${err?.message || err}`);
      return null;
    }
  };

  const runAllowedVoiceAction = async (type, payload = {}, { source } = {}) => {
    const allowedActions = global.AppModules?.assistantAllowedActions;
    const executeAction = allowedActions?.executeAllowedAction;
    if (typeof executeAction !== 'function') {
      getDiag().add?.('[midas-voice][intent] allowed helper missing');
      return false;
    }
    const ok = await executeAction(type, payload, {
      getSupabaseApi: () => appModules.supabase,
      notify: (msg, level) =>
        getDiag().add?.(`[midas-voice][assistant-actions][${level || 'info'}] ${msg}`),
      source: source || 'voice',
    });
    if (!ok) {
      getDiag().add?.(
        `[midas-voice][assistant-actions] action failed type=${type} source=${source || 'voice'}`,
      );
      return false;
    }
    try {
      global.dispatchEvent(
        new CustomEvent('assistant:action-success', {
          detail: { type, payload, source: source || 'voice' },
        }),
      );
    } catch (_) {
      // ignore
    }
    return true;
  };

  const runUiSafeVoiceAction = async (type, payload = {}, { source } = {}) => {
    const allowedActions = global.AppModules?.assistantAllowedActions;
    const executeAction = allowedActions?.executeUiSafeAllowedAction;
    if (typeof executeAction !== 'function') {
      getDiag().add?.('[midas-voice][intent] ui-safe helper missing');
      return false;
    }
    const ok = await executeAction(type, payload, {
      notify: (msg, level) =>
        getDiag().add?.(`[midas-voice][assistant-actions][${level || 'info'}] ${msg}`),
      source: source || 'voice',
    });
    if (!ok) {
      getDiag().add?.(
        `[midas-voice][assistant-actions] ui-safe action failed type=${type} source=${source || 'voice'}`,
      );
      return false;
    }
    try {
      global.dispatchEvent(
        new CustomEvent('assistant:action-success', {
          detail: { type, payload, source: source || 'voice' },
        }),
      );
    } catch (_) {
      // ignore
    }
    return true;
  };

  const recordVoiceOutcome = (event = {}) => {
    if (!voiceCtrl) return null;
    const snapshot = {
      at: Date.now(),
      stage: typeof event.stage === 'string' ? event.stage : 'unknown',
      outcome: typeof event.outcome === 'string' ? event.outcome : 'unknown',
      reason: typeof event.reason === 'string' ? event.reason : 'none',
      label: typeof event.label === 'string' ? event.label : null,
      detail: event.detail && typeof event.detail === 'object' ? { ...event.detail } : null,
    };
    voiceCtrl.lastOutcome = snapshot;
    getDiag().add?.(
      `[midas-voice][outcome] stage=${snapshot.stage} outcome=${snapshot.outcome} reason=${snapshot.reason}`,
    );
    return snapshot;
  };

  const isBootReady = () => {
    if (typeof deps.isBootReady === 'function') {
      return deps.isBootReady();
    }
    const stage = (deps.doc?.body?.dataset?.bootStage || '').toLowerCase();
    return stage === 'idle' || stage === 'init_ui';
  };

  const computeVoiceGateStatus = () => {
    if (!isBootReady()) {
      return { allowed: false, reason: 'booting' };
    }
    const authState = typeof deps.getSupabaseState === 'function'
      ? deps.getSupabaseState()?.authState
      : null;
    if (authState === 'unknown') {
      return { allowed: false, reason: 'auth-check' };
    }
    return { allowed: true, reason: '' };
  };

  const applyVoiceGateUi = (status) => {
    if (!deps.doc?.body) return;
    deps.doc.body.classList.toggle('voice-locked', !status.allowed);
    if (voiceCtrl?.button) {
      voiceCtrl.button.classList.toggle('is-voice-locked', !status.allowed);
      voiceCtrl.button.setAttribute('aria-disabled', status.allowed ? 'false' : 'true');
    }
  };

  const notifyVoiceGateStatus = () => {
    const status = computeVoiceGateStatus();
    lastVoiceGateStatus = status;
    applyVoiceGateUi(status);
    voiceGateListeners.forEach((listener) => {
      try {
        listener({ ...status });
      } catch (err) {
        getDiag().add?.(`[voice] gate listener error: ${err?.message || err}`);
      }
    });
    return status;
  };

  const ensureVoiceGateObserver = () => {
    if (voiceGateObserver || !deps.doc?.body || typeof MutationObserver === 'undefined') return;
    voiceGateObserver = new MutationObserver(() => notifyVoiceGateStatus());
    voiceGateObserver.observe(deps.doc.body, {
      attributes: true,
      attributeFilter: ['class', 'data-boot-stage'],
    });
  };

  const bindVoiceButton = () => {
    if (!voiceCtrl?.button) return;
    if (voiceCtrl.button.dataset.voiceBound === 'true') return;
    voiceCtrl.button.dataset.voiceBound = 'true';
    voiceCtrl.button.addEventListener('click', (event) => {
      event.preventDefault();
      if (!isBootReady()) return;
      handleVoiceTrigger();
    });
  };

  const init = (options = {}) => {
    deps = { ...deps, ...options };
    if (!deps.hub || !deps.doc) return false;
    const button = deps.hub.querySelector('[data-hub-module="assistant-voice"]');
    if (!button || !global.navigator?.mediaDevices?.getUserMedia) {
      return false;
    }
    voiceCtrl = {
      button,
      status: 'idle',
      recorder: null,
      stream: null,
      chunks: [],
      audioEl: null,
      currentAudioUrl: null,
      orbitEl: deps.hub.querySelector('.hub-orbit'),
      audioCtx: null,
      analyser: null,
      mediaSource: null,
      ampData: null,
      ampRaf: null,
      lastAmp: 0,
      vadCtrl: global.MidasVAD?.createController({
        threshold: 0.015,
        minSpeechFrames: 2,
        minSilenceFrames: 5,
        reportInterval: 4,
      }),
      vadSilenceTimer: null,
      recordingStartedAt: 0,
      firstSpeechAt: 0,
      hasDetectedSpeech: false,
      speechBurstCount: 0,
      lastVadState: 'silence',
      lastSpeechAt: 0,
      lastCommandPlan: null,
      lastAdapterInput: null,
      lastTranscription: null,
      lastOutcome: null,
      localPendingIntentContext: null,
      localPendingIntentMeta: null,
      perfTrace: null,
    };
    resetVoicePerfTrace();
    voiceCtrl.orbitEl?.setAttribute('data-voice-state', 'idle');
    voiceCtrl.orbitEl?.style.setProperty('--voice-amp', '0');
    setVoiceState('idle');
    bindVoiceButton();
    ensureVoiceGateObserver();
    notifyVoiceGateStatus();
    return true;
  };

  const setVoiceState = (state, customLabel) => {
    if (!voiceCtrl?.button) return;
    voiceCtrl.status = state;
    const label = customLabel ?? VOICE_STATE_LABELS[state] ?? '';
    voiceCtrl.button.dataset.voiceState = state;
    voiceCtrl.button.dataset.voiceLabel = label;
    voiceCtrl.button.setAttribute('aria-label', `MIDAS Voice – ${label || 'Bereit'}`);
    voiceCtrl.button.setAttribute('aria-pressed', state === 'listening');
    if (state !== 'listening') {
      clearVadSilenceTimer();
    }
    if (voiceCtrl.orbitEl) {
      voiceCtrl.orbitEl.setAttribute('data-voice-state', state);
    if (state !== 'confirming') {
      setVoiceAmplitude(0);
    }
    }
    if (state !== 'confirming') {
      stopVoiceMeter();
    }
  };

  const setVoiceAmplitude = (value) => {
    if (!voiceCtrl?.orbitEl) return;
    const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
    voiceCtrl.orbitEl.style.setProperty('--voice-amp', clamped.toFixed(3));
    voiceCtrl.lastAmp = clamped;
  };

  const ensureVoiceAnalyser = () => {
    if (!voiceCtrl) return false;
    const AudioCtx = global.AudioContext || global.webkitAudioContext;
    if (!AudioCtx) return false;
    if (!voiceCtrl.audioCtx) {
      try {
        voiceCtrl.audioCtx = new AudioCtx();
      } catch (err) {
        console.warn('[hub] AudioContext init failed', err);
        return false;
      }
    }
    if (!voiceCtrl.analyser && voiceCtrl.audioCtx) {
      voiceCtrl.analyser = voiceCtrl.audioCtx.createAnalyser();
      voiceCtrl.analyser.fftSize = 1024;
      voiceCtrl.analyser.smoothingTimeConstant = 0.85;
      voiceCtrl.ampData = new Uint8Array(voiceCtrl.analyser.fftSize);
    }
    const audioEl = ensureVoiceAudioElement();
    if (audioEl && voiceCtrl.audioCtx && !voiceCtrl.mediaSource) {
      try {
        voiceCtrl.mediaSource = voiceCtrl.audioCtx.createMediaElementSource(audioEl);
        voiceCtrl.mediaSource.connect(voiceCtrl.analyser);
        voiceCtrl.analyser.connect(voiceCtrl.audioCtx.destination);
      } catch (err) {
        console.warn('[hub] media source init failed', err);
      }
    }
    return !!voiceCtrl.analyser;
  };

  const startVoiceMeter = async () => {
    if (!voiceCtrl || !ensureVoiceAnalyser()) return;
    try {
      if (voiceCtrl.audioCtx?.state === 'suspended') {
        await voiceCtrl.audioCtx.resume();
      }
    } catch (err) {
      console.warn('[hub] audioCtx resume failed', err);
    }
    if (voiceCtrl.ampRaf) {
      global.cancelAnimationFrame(voiceCtrl.ampRaf);
      voiceCtrl.ampRaf = null;
    }
    const tick = () => {
      if (!voiceCtrl?.analyser || !voiceCtrl.ampData) return;
      voiceCtrl.analyser.getByteTimeDomainData(voiceCtrl.ampData);
      let sum = 0;
      for (let i = 0; i < voiceCtrl.ampData.length; i += 1) {
        sum += Math.abs(voiceCtrl.ampData[i] - 128);
      }
      const avg = sum / voiceCtrl.ampData.length; // 0..128
      const normalized = Math.min(1, avg / 50);
      const smoothed = voiceCtrl.lastAmp * 0.7 + normalized * 0.3;
      setVoiceAmplitude(smoothed);
      voiceCtrl.ampRaf = global.requestAnimationFrame(tick);
    };
    tick();
  };

  const stopVoiceMeter = () => {
    if (voiceCtrl?.ampRaf) {
      global.cancelAnimationFrame(voiceCtrl.ampRaf);
      voiceCtrl.ampRaf = null;
    }
    if (voiceCtrl?.orbitEl) {
      voiceCtrl.orbitEl.style.setProperty('--voice-amp', '0');
    }
    if (voiceCtrl) {
      voiceCtrl.lastAmp = 0;
    }
  };

  const clearVadSilenceTimer = () => {
    if (voiceCtrl?.vadSilenceTimer) {
      global.clearTimeout(voiceCtrl.vadSilenceTimer);
      voiceCtrl.vadSilenceTimer = null;
    }
  };

  const scheduleVadSilenceRecheck = (delayMs) => {
    if (!voiceCtrl) return;
    const nextDelay = Math.max(0, Number(delayMs) || 0);
    voiceCtrl.vadSilenceTimer = global.setTimeout(() => {
      if (voiceCtrl) {
        voiceCtrl.vadSilenceTimer = null;
      }
      handleVadStateChange('silence');
    }, nextDelay);
  };

  const showVoiceOperationalError = (label, timeoutMs = 2600) => {
    recordVoiceOutcome({
      stage: 'runtime-error',
      outcome: 'error',
      reason: 'voice-operational-error',
      label,
      route: 'voice-runtime-error',
    });
    setVoiceState('error', label);
    global.setTimeout(() => {
      if (voiceCtrl?.status === 'error') {
        setVoiceState('idle');
      }
    }, timeoutMs);
  };

  const getVoiceVadAutoStopMs = () => {
    if (!voiceCtrl) return VAD_SILENCE_MS;
    const recordingAgeMs = Math.max(
      0,
      Date.now() - (Number.isFinite(voiceCtrl.recordingStartedAt) ? voiceCtrl.recordingStartedAt : 0),
    );
    if (voiceCtrl.speechBurstCount <= 1 && recordingAgeMs < 1800) {
      return VAD_SINGLE_COMMAND_SILENCE_MS;
    }
    if (voiceCtrl.speechBurstCount <= 2 && recordingAgeMs < 2200) {
      return VAD_SHORT_UTTERANCE_SILENCE_MS;
    }
    if (voiceCtrl.speechBurstCount >= 3 || recordingAgeMs >= 4000) {
      return VAD_LONG_UTTERANCE_SILENCE_MS;
    }
    if (voiceCtrl.speechBurstCount >= 2 || recordingAgeMs >= 2000) {
      return VAD_MULTI_COMMAND_SILENCE_MS;
    }
    return VAD_SILENCE_MS;
  };

  const handleVadStateChange = (state) => {
    if (!voiceCtrl || voiceCtrl.status !== 'listening') return;
    if (state === 'speech') {
      if (voiceCtrl.lastVadState !== 'speech') {
        voiceCtrl.speechBurstCount += 1;
      }
      voiceCtrl.lastVadState = 'speech';
      if (!Number.isFinite(voiceCtrl.firstSpeechAt) || voiceCtrl.firstSpeechAt <= 0) {
        voiceCtrl.firstSpeechAt = Date.now();
        if (voiceCtrl.perfTrace) {
          voiceCtrl.perfTrace.firstSpeechAt = nowMs();
        }
      }
      voiceCtrl.hasDetectedSpeech = true;
      voiceCtrl.lastSpeechAt = Date.now();
      clearVadSilenceTimer();
      return;
    }
    if (state === 'silence') {
      voiceCtrl.lastVadState = 'silence';
      if (!voiceCtrl.hasDetectedSpeech) {
        return;
      }
      if (voiceCtrl.vadSilenceTimer) return;
      voiceCtrl.vadSilenceTimer = global.setTimeout(() => {
        voiceCtrl.vadSilenceTimer = null;
        if (!voiceCtrl || voiceCtrl.status !== 'listening') return;
        const now = Date.now();
        const silenceBudgetMs = getVoiceVadAutoStopMs();
        const silenceAgeMs = Math.max(
          0,
          now - (Number.isFinite(voiceCtrl.lastSpeechAt) ? voiceCtrl.lastSpeechAt : now),
        );
        const spokenDurationMs = Math.max(
          0,
          now - (Number.isFinite(voiceCtrl.firstSpeechAt) ? voiceCtrl.firstSpeechAt : now),
        );
        if (spokenDurationMs < VAD_MIN_SPEECH_BEFORE_AUTOSTOP_MS) {
          scheduleVadSilenceRecheck(VAD_MIN_SPEECH_BEFORE_AUTOSTOP_MS - spokenDurationMs);
          return;
        }
        if (silenceAgeMs < silenceBudgetMs) {
          scheduleVadSilenceRecheck(silenceBudgetMs - silenceAgeMs);
          return;
        }
        if (deps.config?.DEV_ALLOW_DEFAULTS) {
          getDiag().add?.(
            `[midas-voice] Auto-stop nach Stille bursts=${voiceCtrl.speechBurstCount} silence_ms=${silenceAgeMs}`,
          );
        }
        stopVoiceRecording();
      }, getVoiceVadAutoStopMs());
    }
  };

  const handleVoiceTrigger = () => {
    const gateStatus = notifyVoiceGateStatus();
    if (!gateStatus.allowed) {
      getDiag().add?.(`[hub] voice trigger blocked (${gateStatus.reason || 'gate'})`);
      setVoiceState('error', 'Voice deaktiviert – bitte warten');
      setTimeout(() => setVoiceState('idle'), 1800);
      return;
    }
    if (!voiceCtrl) {
      console.warn('[hub] voice controller missing');
      return;
    }
    if (voiceCtrl.button) {
      voiceCtrl.button.classList.add('is-pressed');
      global.setTimeout(() => {
        voiceCtrl?.button?.classList.remove('is-pressed');
      }, 220);
    }
    resetVoicePerfTrace();
    if (voiceCtrl?.perfTrace) {
      voiceCtrl.perfTrace.tapStartedAt = nowMs();
    }
    if (voiceCtrl.status === 'listening') {
      stopVoiceRecording();
      return;
    }
    if (voiceCtrl.status === 'confirming') {
      stopVoicePlayback();
      setVoiceState('idle');
      return;
    }
    if (
      voiceCtrl.status === 'transcribing' ||
      voiceCtrl.status === 'parsing' ||
      voiceCtrl.status === 'executing'
    ) {
      getDiag().add?.('[hub] voice is busy processing');
      return;
    }
    startVoiceRecording();
  };

  const startVoiceRecording = async () => {
    try {
      const gate = notifyVoiceGateStatus();
      if (!gate.allowed) {
        getDiag().add?.(`[hub] voice record blocked (${gate.reason || 'gate'})`);
        setVoiceState('idle');
        return;
      }
      const stream = await global.navigator.mediaDevices.getUserMedia({ audio: true });
      const options = {};
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ];
      const supportedType = preferredTypes.find((type) =>
        global.MediaRecorder?.isTypeSupported?.(type)
      );
      if (supportedType) {
        options.mimeType = supportedType;
      }
      const recorder = new MediaRecorder(stream, options);
      voiceCtrl.chunks = [];
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data?.size) {
          voiceCtrl.chunks.push(event.data);
        }
      });
      recorder.addEventListener('stop', () => handleRecordingStop(recorder));
      recorder.start();
      voiceCtrl.stream = stream;
      voiceCtrl.recorder = recorder;
      voiceCtrl.recordingStartedAt = Date.now();
      voiceCtrl.firstSpeechAt = 0;
      voiceCtrl.lastSpeechAt = voiceCtrl.recordingStartedAt;
      voiceCtrl.hasDetectedSpeech = false;
      voiceCtrl.speechBurstCount = 0;
      voiceCtrl.lastVadState = 'silence';
      clearVadSilenceTimer();
      if (voiceCtrl.vadCtrl) {
        try {
          await voiceCtrl.vadCtrl.start(stream, handleVadStateChange);
        } catch (vadErr) {
          console.warn('[hub] vad start failed', vadErr);
        }
      }
      setVoiceState('listening');
      if (voiceCtrl?.perfTrace && Number.isFinite(voiceCtrl.perfTrace.tapStartedAt)) {
        addVoicePerfDelta('voice_tap_to_listening', voiceCtrl.perfTrace.tapStartedAt);
      }
    } catch (err) {
      console.error('[hub] Unable to access microphone', err);
      try {
        voiceCtrl?.vadCtrl?.stop();
      } catch (_) {
        /* no-op */
      }
      showVoiceOperationalError('Mikrofon nicht verfuegbar.', 2400);
    }
  };

  const stopVoiceRecording = () => {
    clearVadSilenceTimer();
    try {
      voiceCtrl?.vadCtrl?.stop();
    } catch (err) {
      console.warn('[hub] vad stop failed', err);
    }
    if (!voiceCtrl?.recorder) return;
    try {
      voiceCtrl.recorder.stop();
    } catch (err) {
      console.warn('[hub] recorder stop failed', err);
    }
    if (voiceCtrl?.perfTrace) {
      voiceCtrl.perfTrace.stopRequestedAt = nowMs();
      if (Number.isFinite(voiceCtrl.perfTrace.firstSpeechAt) && voiceCtrl.perfTrace.firstSpeechAt > 0) {
        addVoicePerfDelta(
          'voice_first_speech_to_stop',
          voiceCtrl.perfTrace.firstSpeechAt,
          voiceCtrl.perfTrace.stopRequestedAt,
        );
      }
    }
    if (voiceCtrl.stream) {
      voiceCtrl.stream.getTracks().forEach((track) => track.stop());
    }
    voiceCtrl.stream = null;
    voiceCtrl.recorder = null;
    setVoiceState('transcribing');
  };

  const handleRecordingStop = async (recorder) => {
    try {
      if (!voiceCtrl?.chunks?.length) {
        setVoiceState('idle');
        return;
      }
      const blob = new Blob(voiceCtrl.chunks, {
        type: recorder?.mimeType || 'audio/webm',
      });
      voiceCtrl.chunks = [];
      if (deps.config?.DEV_ALLOW_DEFAULTS) {
        getDiag().add?.(
          `[midas-voice] Aufnahme abgeschlossen: ${blob.type}, ${(blob.size / 1024).toFixed(1)} KB`
        );
      }
      await processVoiceBlob(blob);
    } catch (err) {
      console.error('[hub] voice processing failed', err);
      if (voiceCtrl?.status !== 'error') {
        showVoiceOperationalError('Sprachverarbeitung gerade nicht moeglich.', 2400);
      }
    }
  };

  const processVoiceBlob = async (blob) => {
    try {
      setVoiceState('transcribing');
      if (voiceCtrl?.perfTrace) {
        voiceCtrl.perfTrace.transcribeStartedAt = nowMs();
      }
      const transcription = await transcribeAudio(blob);
      if (voiceCtrl?.perfTrace) {
        voiceCtrl.perfTrace.transcribeCompletedAt = nowMs();
        if (Number.isFinite(voiceCtrl.perfTrace.stopRequestedAt) && voiceCtrl.perfTrace.stopRequestedAt > 0) {
          addVoicePerfDelta(
            'voice_stop_to_transcribe_response',
            voiceCtrl.perfTrace.stopRequestedAt,
            voiceCtrl.perfTrace.transcribeCompletedAt,
          );
        }
      }
      const rawTranscript = `${transcription?.rawText || ''}`.trim();
      const normalizedTranscript = `${transcription?.normalizedText || rawTranscript}`.trim();
      if (!normalizedTranscript) {
        setVoiceState('idle');
        return;
      }
      if (voiceCtrl) {
        voiceCtrl.lastTranscription = {
          rawText: rawTranscript,
          normalizedText: normalizedTranscript,
          at: Date.now(),
        };
      }
      getDiag().add?.(`[midas-voice] Transcript: ${rawTranscript || normalizedTranscript}`);
      if (rawTranscript && normalizedTranscript && rawTranscript !== normalizedTranscript) {
        getDiag().add?.(`[midas-voice] Normalized Transcript: ${normalizedTranscript}`);
      }
      setVoiceState('parsing');
      const commandPlan = buildVoiceCommandPlan(normalizedTranscript);
      if (!commandPlan?.units?.length) {
        recordVoiceIntentRoute(
          null,
          normalizedTranscript,
          {
            handled: false,
            outcome: 'fallback_semantic',
            reason: commandPlan?.reason || 'voice-command-plan-empty',
          },
          commandPlan,
          null,
        );
        await finalizeVoiceIntentFallback(
          null,
          normalizedTranscript,
          {
            handled: false,
            outcome: 'fallback_semantic',
            reason: commandPlan?.reason || 'voice-command-plan-empty',
          },
          commandPlan,
          null,
        );
        return;
      }
      const commandUnit = commandPlan.units[0] || null;
      if (commandPlan.mode === 'multi_unit_pending') {
        await executeVoiceCompoundCommandPlan(normalizedTranscript, commandPlan);
        return;
      }
      if (commandPlan.mode !== 'single_unit') {
        recordVoiceIntentRoute(
          null,
          normalizedTranscript,
          {
            handled: false,
            outcome: 'fallback_semantic',
            reason: commandPlan.reason || 'voice-command-plan-mode-unsupported',
          },
          commandPlan,
          commandUnit,
        );
        await finalizeVoiceIntentFallback(
          null,
          normalizedTranscript,
          {
            handled: false,
            outcome: 'fallback_semantic',
            reason: commandPlan.reason || 'voice-command-plan-mode-unsupported',
          },
          commandPlan,
          commandUnit,
        );
        return;
      }
      const intentResult = preflightVoiceCommandUnit(commandUnit, commandPlan);
      setVoiceState('executing');
      if (intentResult?.intent_key === 'confirm_reject' && intentResult?.decision === 'needs_confirmation') {
        const localDispatch = await resolveVoiceConfirmIntent(intentResult);
        recordVoiceIntentRoute(
          intentResult,
          normalizedTranscript,
          localDispatch,
          commandPlan,
          commandUnit,
        );
        if (localDispatch.handled) {
          await finalizeVoiceIntentBypass(
            intentResult,
            normalizedTranscript,
            commandPlan,
            commandUnit,
            localDispatch.replyText || null,
          );
          return;
        }
        await finalizeVoiceIntentBlocked(
          intentResult,
          normalizedTranscript,
          localDispatch,
          commandPlan,
          commandUnit,
          localDispatch.replyText || null,
        );
        return;
      }
      const localDispatch = await dispatchVoiceIntentDirectMatch(intentResult, commandUnit, commandPlan);
      recordVoiceIntentRoute(
        intentResult,
        normalizedTranscript,
        localDispatch,
        commandPlan,
        commandUnit,
      );
      if (localDispatch.handled) {
        await finalizeVoiceIntentBypass(
          intentResult,
          normalizedTranscript,
          commandPlan,
          commandUnit,
          localDispatch.replyText || null,
        );
        return;
      }
      if (intentResult?.decision === 'direct_match') {
        await finalizeVoiceIntentBlocked(
          intentResult,
          normalizedTranscript,
          localDispatch,
          commandPlan,
          commandUnit,
          localDispatch.replyText || null,
        );
        return;
      }
      await finalizeVoiceIntentFallback(
        intentResult,
        normalizedTranscript,
        localDispatch,
        commandPlan,
        commandUnit,
      );
    } catch {
      setVoiceState('idle');
    }
  };

  const normalizeVoiceCommandText = (value) =>
    typeof value === 'string'
      ? value
          .replace(/(\d),(\d)/g, '$1.$2')
          .replace(/\s+/g, ' ')
          .trim()
      : '';

  const stripVoiceWakePrefix = (value) => {
    const normalized = normalizeVoiceCommandText(value);
    if (!normalized) return '';
    return normalized
      .replace(/^(?:hey |hallo |ok )?midas[,:]?\s*/i, '')
      .replace(/^(?:bitte |mal )+/i, '')
      .trim();
  };

  const classifyVoiceCommandUnit = (normalizedText) => {
    const text = `${normalizedText || ''}`.trim().toLowerCase();
    if (!text) return 'unknown_command_unit';
    if (/^(?:ja|nein|speichern|abbrechen)$/.test(text)) {
      return 'confirm_command_unit';
    }
    if (/\b(?:medikamente?|tabletten?)\b/.test(text)) {
      return 'medication_command_unit';
    }
    if (/\b(?:wasser|protein(?:e|en)?|salz)\b/.test(text)) {
      return 'intake_command_unit';
    }
    if (/\b(?:oeffne|offne|gehe zu|vitals)\b/.test(text)) {
      return 'navigation_command_unit';
    }
    if (/\b(?:blutdruck|puls|gewicht)\b/.test(text)) {
      return 'vitals_command_unit';
    }
    return 'unknown_command_unit';
  };

  const countVoiceCommandCues = (normalizedText) => {
    const text = `${normalizedText || ''}`.trim().toLowerCase();
    if (!text) return 0;
    const cues = [
      /\bwasser\b/,
      /\bprotein(?:e|en)?\b/,
      /\bsalz\b/,
      /\bmedikamente?\b/,
      /\btabletten?\b/,
      /\bja\b/,
      /\bnein\b/,
      /\bspeichern\b/,
      /\babbrechen\b/,
      /\boeffne\b/,
      /\boffne\b/,
      /\bgehe zu\b/,
      /\bvitals\b/,
      /\bgewicht\b/,
      /\bpuls\b/,
      /\bblutdruck\b/,
    ];
    return cues.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
  };

  const VOICE_STRUCTURED_FRAGMENT_PATTERNS = [
    /(?<fragment>wasser\s+\d+(?:\.\d+)?\s+(?:ml|l)|\d+(?:\.\d+)?\s+(?:ml|l)\s+wasser(?:\s+(?:getrunken|eingetragen|eintragen))?)/gi,
    /(?<fragment>(?:protein(?:e|en)?|salz)\s+\d+(?:\.\d+)?\s+g|\d+(?:\.\d+)?\s+g\s+(?:protein(?:e|en)?|salz)(?:\s+(?:gegessen|genommen|eingetragen|eintragen))?)/gi,
    /(?<fragment>(?:alle\s+)?(?:meine\s+)?(?:medikamente|tabletten)\s+genommen)/gi,
  ];

  const normalizeVoiceResidualText = (value) =>
    normalizeVoiceCommandText(value)
      .toLowerCase()
      .replace(/[.,;]+/g, ' ')
      .replace(/\b(?:ich|habe|und|bitte|mal|heute|schon|dann|sowie)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const extractStructuredVoiceFragments = (value) => {
    const normalized = normalizeVoiceCommandText(value);
    if (!normalized) return [];
    const matches = [];
    VOICE_STRUCTURED_FRAGMENT_PATTERNS.forEach((pattern) => {
      pattern.lastIndex = 0;
      let match = null;
      while ((match = pattern.exec(normalized))) {
        const fragment = `${match.groups?.fragment || match[0] || ''}`.trim();
        if (!fragment) continue;
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: fragment,
        });
      }
    });
    if (matches.length < 2) {
      return [];
    }
    matches.sort((left, right) => left.start - right.start || left.end - right.end);
    const selected = [];
    let cursor = 0;
    for (const match of matches) {
      if (match.start < cursor) {
        continue;
      }
      const gap = normalized.slice(cursor, match.start);
      if (normalizeVoiceResidualText(gap)) {
        return [];
      }
      selected.push(match);
      cursor = match.end;
    }
    if (normalizeVoiceResidualText(normalized.slice(cursor))) {
      return [];
    }
    return selected.map((entry) => normalizeVoiceCommandText(entry.text)).filter(Boolean);
  };

  const splitVoiceCompoundFragments = (value) => {
    const normalized = normalizeVoiceCommandText(value);
    if (!normalized) return [];
    const structuredFragments = extractStructuredVoiceFragments(normalized);
    if (structuredFragments.length > 1) {
      return structuredFragments;
    }
    const primarySegments = normalized
      .split(/\s*[,;]\s*/g)
      .map((segment) => normalizeVoiceCommandText(segment))
      .filter(Boolean);
    const fragments = [];
    primarySegments.forEach((segment) => {
      if (!/\bund\b/i.test(segment) || countVoiceCommandCues(segment) < 2) {
        fragments.push(segment);
        return;
      }
      const candidateParts = segment
        .split(/\s+\bund\b\s+/i)
        .map((part) => normalizeVoiceCommandText(part))
        .filter(Boolean);
      const everyPartLooksLikeCommand =
        candidateParts.length > 1 &&
        candidateParts.every((part) => countVoiceCommandCues(part) >= 1);
      if (everyPartLooksLikeCommand) {
        fragments.push(...candidateParts);
        return;
      }
      fragments.push(segment);
    });
    return fragments;
  };

  const buildVoiceCommandUnit = (rawText, index) => {
    const normalizedText = normalizeVoiceCommandText(rawText);
    const kind = classifyVoiceCommandUnit(normalizedText);
    return {
      id: `unit-${index + 1}`,
      index,
      kind,
      rawText: typeof rawText === 'string' ? rawText.trim() : '',
      normalizedText,
      adapterInput: null,
    };
  };

  const buildVoiceCommandPlan = (transcript) => {
    const normalizedTranscript = normalizeVoiceCommandText(transcript);
    const strippedTranscript = stripVoiceWakePrefix(normalizedTranscript);
    const commandPlan = {
      version: 'voice-v1',
      mode: 'single_unit',
      rawTranscript: typeof transcript === 'string' ? transcript : '',
      normalizedTranscript,
      strippedTranscript,
      units: [],
      reason: null,
      createdAt: Date.now(),
    };
    if (!strippedTranscript) {
      commandPlan.reason = 'empty-transcript';
      if (voiceCtrl) {
        voiceCtrl.lastCommandPlan = commandPlan;
      }
      return commandPlan;
    }
    const fragments = splitVoiceCompoundFragments(strippedTranscript);
    commandPlan.units = fragments
      .map((fragment, index) => buildVoiceCommandUnit(fragment, index))
      .filter((unit) => !!unit.normalizedText);
    if (!commandPlan.units.length) {
      commandPlan.reason = 'voice-command-plan-empty';
    } else if (commandPlan.units.length === 1) {
      commandPlan.mode = 'single_unit';
    } else {
      const hasUnknownUnits = commandPlan.units.some((unit) => unit.kind === 'unknown_command_unit');
      commandPlan.mode = hasUnknownUnits ? 'multi_unit_rejected' : 'multi_unit_pending';
      commandPlan.reason = hasUnknownUnits
        ? 'voice-compound-segmentation-ambiguous'
        : 'voice-compound-dispatch-pending';
    }
    if (voiceCtrl) {
      voiceCtrl.lastCommandPlan = commandPlan;
    }
    getDiag().add?.(
      `[midas-voice][orchestrator] mode=${commandPlan.mode} units=${commandPlan.units.length} reason=${commandPlan.reason || 'ok'}`,
    );
    return commandPlan;
  };

  const getVoiceUiContext = () => ({
    module: 'assistant-voice',
    panel: 'assistant-text',
  });

  const getVoicePendingIntentContext = () => {
    const localContext = getUsableVoiceLocalPendingIntentContext();
    if (localContext) {
      return localContext;
    }
    const hubApi = global.AppModules?.hub || deps.hubApi || null;
    if (typeof hubApi?.getAssistantPendingIntentContext === 'function') {
      return hubApi.getAssistantPendingIntentContext() || null;
    }
    return null;
  };

  const getVoicePendingState = (context) => {
    const intentApi = getIntentEngine();
    if (typeof intentApi?.getPendingContextState === 'function') {
      return intentApi.getPendingContextState(context);
    }
    if (!context || typeof context !== 'object') {
      return { usable: false, reason: 'pending-context-missing' };
    }
    if (Number.isFinite(context.consumed_at)) {
      return { usable: false, reason: 'pending-context-consumed' };
    }
    if (Number.isFinite(context.expires_at) && context.expires_at <= Date.now()) {
      return { usable: false, reason: 'pending-context-expired' };
    }
    return { usable: true, reason: null, context };
  };

  const setVoiceLocalPendingIntentContext = (context, meta = {}) => {
    if (!voiceCtrl) return false;
    voiceCtrl.localPendingIntentContext = context ? { ...context } : null;
    voiceCtrl.localPendingIntentMeta = context
      ? {
          setAt: Date.now(),
          ...meta,
        }
      : null;
    if (context?.target_action) {
      getDiag().add?.(
        `[midas-voice][intent] local pending armed target=${context.target_action} source=${meta.source || 'voice-local'}`,
      );
    }
    return true;
  };

  const clearVoiceLocalPendingIntentContext = (reason = 'clear') => {
    if (!voiceCtrl?.localPendingIntentContext) return;
    const targetAction = `${voiceCtrl.localPendingIntentContext?.target_action || ''}`.trim();
    voiceCtrl.localPendingIntentContext = null;
    voiceCtrl.localPendingIntentMeta = {
      source: voiceCtrl.localPendingIntentMeta?.source || null,
      reason,
      clearedAt: Date.now(),
    };
    if (targetAction) {
      getDiag().add?.(
        `[midas-voice][intent] local pending cleared target=${targetAction} reason=${reason}`,
      );
    }
  };

  const getUsableVoiceLocalPendingIntentContext = () => {
    const context = voiceCtrl?.localPendingIntentContext || null;
    if (!context) {
      return null;
    }
    const state = getVoicePendingState(context);
    if (state?.usable) {
      return state.context || context;
    }
    clearVoiceLocalPendingIntentContext(state?.reason || 'pending-context-invalid');
    return null;
  };

  const createVoiceMedicationLowStockPendingContext = (followup = {}) => {
    const intentApi = getIntentEngine();
    if (typeof intentApi?.createPendingIntentContext !== 'function') {
      return null;
    }
    const dayIso = `${followup.dayIso || getVoiceTodayIso()}`.trim() || getVoiceTodayIso();
    const medIds = Array.isArray(followup.medIds)
      ? followup.medIds.map((value) => `${value || ''}`.trim()).filter(Boolean)
      : [];
    return intentApi.createPendingIntentContext(
      'confirm_reject',
      VOICE_MEDICATION_LOW_STOCK_TARGET,
      {
        dayIso,
        med_ids: medIds,
        low_stock_count: Number.isFinite(followup.lowStockCount) ? followup.lowStockCount : medIds.length,
      },
      {
        dedupe_key: `voice-medication-low-stock:${dayIso}:${medIds.join(',') || 'default'}`,
        ttl_ms: 20_000,
        source: 'voice',
        ui_origin: 'voice-medication-low-stock-followup',
      },
    );
  };

  const armVoiceMedicationLowStockFollowup = (followup = {}) => {
    const context = createVoiceMedicationLowStockPendingContext(followup);
    if (!context) {
      getDiag().add?.('[midas-voice][intent] local pending arm skipped reason=intent-api-missing');
      return false;
    }
    return setVoiceLocalPendingIntentContext(context, {
      source: 'voice-medication-low-stock-followup',
      reason: 'medication-confirm-low-stock',
    });
  };

  const buildVoiceMedicationLowStockFollowupPrompt = ({
    includeMedicationConfirmed = true,
    spoken = true,
  } = {}) => {
    const parts = [];
    if (includeMedicationConfirmed) {
      parts.push('Medikation bestaetigt.');
    }
    if (spoken) {
      parts.push('Medikament ist knapp.');
      parts.push('Lokalen Rezeptkontakt starten?');
    } else {
      parts.push('Mindestens ein Medikament ist knapp.');
      parts.push('Soll ich den lokalen Rezeptkontakt starten?');
    }
    return parts.join(' ').trim();
  };

  const runVoiceMedicationLowStockReorderStart = async (pendingContext) => {
    const captureModule = global.AppModules?.capture || null;
    const startReorder = captureModule?.startMedicationLowStockReorder;
    if (typeof startReorder !== 'function') {
      return {
        handled: true,
        outcome: 'blocked_local',
        reason: 'voice-medication-reorder-helper-missing',
        replyText: 'Rezeptkontakt ist gerade nicht verfuegbar.',
      };
    }
    const payload = pendingContext?.payload_snapshot || {};
    const result = await startReorder({
      dayIso: payload.dayIso || getVoiceTodayIso(),
      medIds: Array.isArray(payload.med_ids) ? payload.med_ids : [],
      source: 'voice-medication-low-stock-followup',
      reason: 'voice:medication-low-stock-followup',
    });
    if (!result?.ok) {
      return {
        handled: true,
        outcome: 'blocked_local',
        reason: result?.reason || 'voice-medication-reorder-start-failed',
        replyText: `${result?.replyText || 'Rezeptkontakt ist gerade nicht verfuegbar.'}`.trim(),
      };
    }
    return {
      handled: true,
      outcome: 'handled',
      reason: 'voice-medication-reorder-started',
      replyText: `${result?.replyText || 'Mail-App wird geoeffnet. Rezeptkontakt bleibt lokal.'}`.trim(),
    };
  };

  const resolveVoiceMedicationLowStockConfirmIntent = async (intentResult, pendingContext) => {
    const confirmValue = `${intentResult?.payload?.value || ''}`.trim().toLowerCase();
    if (confirmValue === 'yes' || confirmValue === 'save') {
      const result = await runVoiceMedicationLowStockReorderStart(pendingContext);
      clearVoiceLocalPendingIntentContext(
        result.handled && result.outcome === 'handled'
          ? 'voice-medication-low-stock-accepted'
          : result.reason || 'voice-medication-low-stock-failed',
      );
      return result;
    }
    if (confirmValue === 'no' || confirmValue === 'cancel') {
      clearVoiceLocalPendingIntentContext('voice-medication-low-stock-rejected');
      return {
        handled: true,
        outcome: 'handled',
        reason: 'voice-medication-low-stock-rejected',
        replyText: 'Alles klar.',
      };
    }
    return {
      handled: false,
      outcome: 'unsupported_local',
      reason: 'voice-medication-low-stock-confirm-unsupported',
      replyText: '',
    };
  };

  const resolveVoiceConfirmIntent = async (intentResult) => {
    const localPendingContext = getUsableVoiceLocalPendingIntentContext();
    if (`${localPendingContext?.target_action || ''}`.trim() === VOICE_MEDICATION_LOW_STOCK_TARGET) {
      return resolveVoiceMedicationLowStockConfirmIntent(intentResult, localPendingContext);
    }
    const hubApi = global.AppModules?.hub || deps.hubApi || null;
    if (typeof hubApi?.resolveAssistantConfirmIntent !== 'function') {
      return {
        handled: false,
        outcome: 'unsupported_local',
        reason: 'voice-confirm-resolver-missing',
        replyText: '',
      };
    }
    const result = await hubApi.resolveAssistantConfirmIntent(intentResult, {
      channel: 'voice',
    });
    return {
      handled: result?.handled === true,
      outcome: result?.outcome || (result?.handled === true ? 'handled' : 'unsupported_local'),
      reason: result?.reason || null,
      replyText: `${result?.replyText || ''}`.trim(),
    };
  };

  const buildVoiceAdapterMeta = (commandPlan = null, commandUnit = null, extraMeta = null) => {
    const meta = {
      input_mode: 'voice-v1',
      command_plan_mode: commandPlan?.mode || 'single_unit',
      command_unit_kind: commandUnit?.kind || null,
      command_unit_index: Number.isFinite(commandUnit?.index) ? commandUnit.index : null,
    };
    if (extraMeta && typeof extraMeta === 'object' && !Array.isArray(extraMeta)) {
      return { ...meta, ...extraMeta };
    }
    return meta;
  };

  const buildVoiceAdapterSourceId = (commandPlan = null, commandUnit = null) => {
    const mode = commandPlan?.mode || 'single-unit';
    const unitId = `${commandUnit?.id || 'unit-1'}`.trim() || 'unit-1';
    return `assistant-voice:${mode}:${unitId}`;
  };

  const buildVoiceAdapterDedupeKey = (rawText, commandPlan = null, commandUnit = null) => {
    const mode = commandPlan?.mode || 'single_unit';
    const unitKey = `${commandUnit?.normalizedText || rawText || ''}`.trim() || 'empty';
    return `voice:${mode}:${unitKey}`;
  };

  const buildVoiceAdapterInput = (rawText, extra = {}) => {
    const intentApi = getIntentEngine();
    const commandPlan = extra.commandPlan || null;
    const commandUnit = extra.commandUnit || null;
    const pendingContext =
      Object.prototype.hasOwnProperty.call(extra, 'pending_context')
        ? extra.pending_context
        : getVoicePendingIntentContext();
    const adapterInput = {
      raw_text: typeof rawText === 'string' ? rawText : String(rawText || ''),
      source: 'voice',
      source_id: extra.source_id || buildVoiceAdapterSourceId(commandPlan, commandUnit),
      dedupe_key:
        extra.dedupe_key || buildVoiceAdapterDedupeKey(rawText, commandPlan, commandUnit),
      pending_context: pendingContext,
      ui_context: getVoiceUiContext(),
      meta: buildVoiceAdapterMeta(commandPlan, commandUnit, extra.meta || null),
    };
    if (typeof intentApi?.createAdapterInput === 'function') {
      return intentApi.createAdapterInput(rawText, adapterInput);
    }
    return adapterInput;
  };

  const preflightVoiceCommandUnit = (commandUnit, commandPlan = null) => {
    const adapterInput = buildVoiceAdapterInput(
      commandUnit?.normalizedText || commandPlan?.strippedTranscript || commandPlan?.normalizedTranscript || '',
      {
        commandPlan,
        commandUnit,
      },
    );
    return preflightVoiceIntent(adapterInput, {
      route: 'voice-preflight-command-unit',
    });
  };

  const preflightVoiceIntent = (adapterInputOrTranscript, options = {}) => {
    const intentApi = getIntentEngine();
    if (typeof intentApi?.parseAdapterInput !== 'function') {
      return null;
    }
    try {
      const adapterInput =
        adapterInputOrTranscript && typeof adapterInputOrTranscript === 'object'
          ? buildVoiceAdapterInput(adapterInputOrTranscript.raw_text || '', {
              source_id: adapterInputOrTranscript.source_id,
              dedupe_key: adapterInputOrTranscript.dedupe_key,
              pending_context: adapterInputOrTranscript.pending_context,
              meta: adapterInputOrTranscript.meta,
            })
          : buildVoiceAdapterInput(adapterInputOrTranscript || '');
      if (voiceCtrl) {
        voiceCtrl.lastAdapterInput = adapterInput;
      }
      const result = intentApi.parseAdapterInput(adapterInput);
      if (voiceCtrl) {
        voiceCtrl.lastIntentResult = result;
      }
      const normalized = result?.normalized || null;
      if (normalized?.surface_normalized_text) {
        const rawText = `${adapterInput?.raw_text || ''}`.trim();
        const surfaceText = `${normalized.surface_normalized_text}`.trim();
        const semanticText = `${normalized.semantic_normalized_text || normalized.normalized_text || ''}`.trim();
        if (surfaceText && surfaceText !== rawText) {
          getDiag().add?.(`[midas-voice][intent] Surface Normalized: ${surfaceText}`);
        }
        if (semanticText && semanticText !== surfaceText) {
          getDiag().add?.(`[midas-voice][intent] Semantic Normalized: ${semanticText}`);
        }
        if (Array.isArray(normalized.slots) && normalized.slots.length) {
          const compactSlots = normalized.slots
            .map((slot) => `${slot.type}:${slot.value}`)
            .join(', ');
          getDiag().add?.(`[midas-voice][intent] Slots: ${compactSlots}`);
        }
      }
      recordIntentTelemetry({
        source_type: 'voice',
        decision: result?.decision || 'unknown',
        outcome: result?.decision === 'direct_match' ? 'pending-local-execution' : 'none',
        reason: result?.reason || 'none',
        intent_key: result?.intent_key || null,
        target_action: result?.target_action || null,
        route: options.route || 'voice-preflight',
      });
      getDiag().add?.(
        `[midas-voice][intent] preflight decision=${result?.decision || 'unknown'} reason=${result?.reason || 'ok'}`,
      );
      return result;
    } catch (err) {
      getDiag().add?.(`[midas-voice][intent] preflight error: ${err?.message || err}`);
      return null;
    }
  };

  const resolveVoiceIntentRoute = (intentResult, localDispatch = null) => {
    if (!intentResult) {
      return { shouldCallAssistant: false, route: 'voice-intent-no-result' };
    }
    if (intentResult.decision === 'fallback') {
      return { shouldCallAssistant: false, route: 'voice-intent-fallback' };
    }
    if (intentResult.decision === 'needs_confirmation') {
      return { shouldCallAssistant: false, route: 'voice-intent-needs-confirmation' };
    }
    if (intentResult.decision === 'direct_match') {
      if (localDispatch?.handled === true) {
        return { shouldCallAssistant: false, route: 'voice-intent-direct-match-handled' };
      }
      if (localDispatch?.outcome === 'blocked_local') {
        return { shouldCallAssistant: false, route: localDispatch?.reason || 'voice-intent-blocked-local' };
      }
      if (localDispatch?.outcome === 'unsupported_local') {
        return { shouldCallAssistant: false, route: localDispatch?.reason || 'voice-intent-unsupported-local' };
      }
      if (localDispatch?.outcome === 'fallback_semantic') {
        return { shouldCallAssistant: false, route: localDispatch?.reason || 'voice-intent-semantic-fallback' };
      }
      return { shouldCallAssistant: false, route: 'voice-intent-direct-match' };
    }
    return { shouldCallAssistant: false, route: 'voice-intent-fallback' };
  };

  const VOICE_V1_ALLOWED_TARGET_ACTIONS = new Set([
    'intake_save',
    'open_module',
    'medication_confirm_all',
    'start_breath_timer',
  ]);
  const VOICE_V1_ALLOWED_OPEN_MODULE_TARGETS = new Set(['intake', 'medikamente', 'vitals']);
  const getVoiceTodayIso = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const waitForVoiceUiTick = () =>
    new Promise((resolve) => {
      if (typeof global.requestAnimationFrame === 'function') {
        global.requestAnimationFrame(() => resolve());
        return;
      }
      global.setTimeout(resolve, 0);
    });

  const isVoiceV1AllowedIntent = (intentResult) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    if (!targetAction || !VOICE_V1_ALLOWED_TARGET_ACTIONS.has(targetAction)) {
      return {
        allowed: false,
        reason: 'voice-v1-action-not-allowed',
      };
    }
    if (targetAction === 'open_module') {
      const target = `${intentResult?.payload?.target || intentResult?.payload?.module || ''}`
        .trim()
        .toLowerCase();
      if (!VOICE_V1_ALLOWED_OPEN_MODULE_TARGETS.has(target)) {
        return {
          allowed: false,
          reason: 'voice-v1-open-module-not-allowed',
        };
      }
    }
    return {
      allowed: true,
      reason: null,
    };
  };

  const recordVoiceIntentRoute = (
    intentResult,
    transcript,
    localDispatch = null,
    commandPlan = null,
    commandUnit = null,
  ) => {
    if (!voiceCtrl) return;
    const route = resolveVoiceIntentRoute(intentResult, localDispatch);
    voiceCtrl.lastIntentRoute = {
      route: route.route,
      decision: intentResult?.decision || null,
      intent: intentResult?.intent_key || null,
      targetAction: intentResult?.target_action || null,
      outcome: localDispatch?.outcome || null,
      reason: localDispatch?.reason || intentResult?.reason || null,
      transcript: transcript || '',
      commandPlanMode: commandPlan?.mode || null,
      commandUnitKind: commandUnit?.kind || null,
      commandUnitText: commandUnit?.normalizedText || null,
      at: Date.now(),
    };
    getDiag().add?.(
      `[midas-voice][intent] route=${route.route} decision=${intentResult?.decision || 'none'} intent=${intentResult?.intent_key || 'none'}`,
    );
    recordIntentTelemetry({
      source_type: 'voice',
      decision: intentResult?.decision || 'unknown',
      outcome: localDispatch?.outcome || 'none',
      reason: localDispatch?.reason || intentResult?.reason || 'none',
      intent_key: intentResult?.intent_key || null,
      target_action: intentResult?.target_action || null,
      route: route.route,
    });
  };

  const buildVoiceLocalIntentSpokenReply = (intentResult) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    const payload = intentResult?.payload || {};
    if (targetAction === 'intake_save') {
      if (Number.isFinite(payload.water_ml)) {
        return 'Wasser ist eingetragen.';
      }
      if (Number.isFinite(payload.protein_g)) {
        return 'Protein ist eingetragen.';
      }
      if (Number.isFinite(payload.salt_g)) {
        return 'Salz ist eingetragen.';
      }
      return 'Eintrag ist gespeichert.';
    }
    if (targetAction === 'open_module') {
      const target = `${payload.target || payload.module || ''}`.trim().toLowerCase();
      if (target === 'medikamente' || target === 'intake') {
        return 'Tageserfassung ist offen.';
      }
      return 'Modul ist offen.';
    }
    if (targetAction === 'medication_confirm_all') {
      return 'Medikation bestaetigt.';
    }
    if (targetAction === 'start_breath_timer') {
      const minutes = Number(payload.minutes) === 5 ? 5 : 3;
      return `${minutes} Minuten Atemtimer gestartet.`;
    }
    return 'Erledigt.';
  };

  const buildVoiceLocalIntentBlockedReply = (intentResult, localDispatch = null) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    const reason = `${localDispatch?.reason || ''}`.trim();
    if (reason === 'voice-v1-action-not-allowed' || reason === 'voice-v1-open-module-not-allowed') {
      return 'Diesen Befehl unterstuetze ich per Voice im Moment noch nicht.';
    }
    if (reason === 'voice-medication-none-open') {
      return 'Es gibt heute keine offene Medikation.';
    }
    if (targetAction === 'open_module') {
      return 'Ich habe den Befehl erkannt, aber das Modul ist gerade noch nicht bereit.';
    }
    if (targetAction === 'intake_save') {
      return 'Ich habe den Befehl erkannt, aber ich kann den Eintrag gerade noch nicht speichern.';
    }
    if (targetAction === 'medication_confirm_all') {
      return 'Ich habe den Befehl erkannt, aber ich kann die Medikation gerade nicht bestaetigen.';
    }
    if (targetAction === 'start_breath_timer') {
      return 'Ich habe den Befehl erkannt, aber ich kann den Atemtimer gerade nicht starten.';
    }
    return 'Ich habe den Befehl erkannt, kann ihn aber gerade noch nicht lokal ausfuehren.';
  };

  const buildVoiceLocalIntentSpokenBlockedReply = (intentResult, localDispatch = null) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    const reason = `${localDispatch?.reason || ''}`.trim();
    if (reason === 'voice-v1-action-not-allowed' || reason === 'voice-v1-open-module-not-allowed') {
      return 'Diesen Befehl unterstuetze ich per Voice noch nicht.';
    }
    if (reason === 'voice-medication-none-open') {
      return 'Heute ist keine Medikation offen.';
    }
    if (reason === 'voice-medication-module-missing' || reason === 'voice-medication-load-failed') {
      return 'Medikation ist gerade nicht bereit.';
    }
    if (reason === 'voice-medication-confirm-failed') {
      return 'Medikation konnte ich gerade nicht bestaetigen.';
    }
    if (reason === 'voice-local-dispatch-failed') {
      if (targetAction === 'open_module') {
        return 'Modul gerade nicht bereit.';
      }
      if (targetAction === 'intake_save') {
        return 'Eintrag gerade nicht moeglich.';
      }
      return 'Das geht gerade nicht.';
    }
    if (targetAction === 'open_module') {
      return 'Modul gerade nicht bereit.';
    }
    if (targetAction === 'intake_save') {
      return 'Eintrag gerade nicht moeglich.';
    }
    if (targetAction === 'medication_confirm_all') {
      return 'Medikation gerade nicht bestaetigbar.';
    }
    if (targetAction === 'start_breath_timer') {
      return 'Atemtimer gerade nicht startbar.';
    }
    return 'Das geht gerade nicht.';
  };

  const runVoiceStartBreathTimer = async (payload = {}) => {
    const minutes = Number(payload.minutes) === 5 ? 5 : 3;
    const captureModule = global.AppModules?.capture;
    const breathTimer = global.AppModules?.breathTimer;
    if (typeof breathTimer?.startIntentPreset !== 'function') {
      return { handled: false, outcome: 'blocked_local', reason: 'voice-breath-timer-helper-missing' };
    }
    const opened = await runUiSafeVoiceAction(
      'open_module',
      { module: 'vitals', target: 'vitals' },
      { source: 'intent-engine:voice' },
    );
    if (!opened) {
      return { handled: false, outcome: 'blocked_local', reason: 'voice-breath-open-module-failed' };
    }
    await waitForVoiceUiTick();
    const prepared =
      typeof captureModule?.prepareBreathTimerIntentEntry === 'function'
        ? captureModule.prepareBreathTimerIntentEntry({})
        : { ok: true };
    if (prepared?.ok === false) {
      return {
        handled: false,
        outcome: 'blocked_local',
        reason: prepared.reason || 'voice-breath-prepare-failed',
      };
    }
    const result = breathTimer.startIntentPreset(minutes);
    if (!result?.ok) {
      return {
        handled: false,
        outcome: 'blocked_local',
        reason: result?.reason || 'voice-breath-start-failed',
      };
    }
    return { handled: true, outcome: 'handled', reason: null };
  };

  const buildVoiceLocalIntentFallbackReply = (
    intentResult,
    localDispatch = null,
    commandPlan = null,
    commandUnit = null,
  ) => {
    const reason = `${localDispatch?.reason || intentResult?.reason || ''}`.trim();
    const shouldExportReport = shouldAutoExportVoiceFallbackReport(
      intentResult,
      localDispatch,
      commandPlan,
      commandUnit,
    );
    if (!intentResult) {
      const effectivePlan = commandPlan || voiceCtrl?.lastCommandPlan || null;
      if (shouldExportReport) {
        return 'Sprachbefehl nicht erkannt. JSON-Datei wurde bereitgestellt.';
      }
      if (reason === 'voice-command-plan-empty' || reason === 'empty-transcript') {
        return 'Ich habe gerade keinen klaren Befehl erkannt.';
      }
      if (effectivePlan?.mode === 'multi_unit_pending') {
        return 'Mehrere Befehle habe ich erkannt.';
      }
      if (effectivePlan?.mode === 'multi_unit_rejected') {
        return 'Den Mehrfachbefehl konnte ich noch nicht eindeutig aufteilen.';
      }
      return 'Ich konnte den Befehl gerade nicht zuordnen.';
    }
    if (reason === 'voice-compound-confirmation-not-allowed') {
      return 'Bestaetigungen kann ich in diesem Mehrfachbefehl gerade nicht sicher verarbeiten.';
    }
    if (intentResult.decision === 'needs_confirmation') {
      if (intentResult.intent_key === 'confirm_reject') {
        return 'Es gibt aktuell nichts zu bestaetigen.';
      }
      return 'Diesen Befehl kann ich gerade noch nicht bestaetigen.';
    }
    if (shouldExportReport) {
      return 'Sprachbefehl nicht erkannt. JSON-Datei wurde bereitgestellt.';
    }
    return 'Ich konnte den Befehl gerade nicht zuordnen.';
  };

  const buildVoiceLocalIntentSpokenFallbackReply = (
    intentResult,
    localDispatch = null,
    commandPlan = null,
    commandUnit = null,
  ) => {
    const reason = `${localDispatch?.reason || intentResult?.reason || ''}`.trim();
    const shouldExportReport = shouldAutoExportVoiceFallbackReport(
      intentResult,
      localDispatch,
      commandPlan,
      commandUnit,
    );
    if (!intentResult) {
      const effectivePlan = commandPlan || voiceCtrl?.lastCommandPlan || null;
      if (shouldExportReport) {
        return 'Sprachbefehl nicht erkannt. JSON Datei wurde bereitgestellt.';
      }
      if (reason === 'voice-command-plan-empty' || reason === 'empty-transcript') {
        return 'Keinen klaren Befehl erkannt.';
      }
      if (effectivePlan?.mode === 'multi_unit_pending') {
        return 'Mehrere Befehle erkannt.';
      }
      if (effectivePlan?.mode === 'multi_unit_rejected') {
        return 'Mehrfachbefehl nicht eindeutig.';
      }
      return 'Befehl nicht erkannt.';
    }
    if (reason === 'voice-compound-confirmation-not-allowed') {
      return 'Bestaetigung bitte separat sagen.';
    }
    if (intentResult.decision === 'needs_confirmation') {
      if (intentResult.intent_key === 'confirm_reject') {
        return 'Aktuell nichts zu bestaetigen.';
      }
      return 'Bestaetigung gerade nicht moeglich.';
    }
    if (shouldExportReport) {
      return 'Sprachbefehl nicht erkannt. JSON Datei wurde bereitgestellt.';
    }
    if (commandUnit?.kind === 'unknown_command_unit') {
      return 'Befehl nicht erkannt.';
    }
    return 'Befehl nicht erkannt.';
  };

  const shouldAutoExportVoiceFallbackReport = (
    intentResult,
    localDispatch = null,
    commandPlan = null,
    commandUnit = null,
  ) => {
    const reason = `${localDispatch?.reason || intentResult?.reason || ''}`.trim();
    if (reason === 'no-rule-match') {
      return true;
    }
    if (!intentResult && commandUnit?.kind === 'unknown_command_unit') {
      return true;
    }
    if (!intentResult && commandPlan?.reason === 'voice-compound-segmentation-ambiguous') {
      return true;
    }
    return false;
  };

  const createVoiceFallbackReportFilename = () => {
    const stamp = new Date()
      .toISOString()
      .replace(/[:]/g, '-')
      .replace(/\.\d{3}Z$/, 'Z');
    return `midas-voice-fallback-${stamp}.json`;
  };

  const downloadVoiceFallbackReport = (report) => {
    const serialized = JSON.stringify(report, null, 2);
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = deps.doc?.createElement?.('a');
    if (!anchor) {
      URL.revokeObjectURL(url);
      return false;
    }
    anchor.href = url;
    anchor.download = createVoiceFallbackReportFilename();
    anchor.style.display = 'none';
    deps.doc.body?.appendChild?.(anchor);
    anchor.click();
    anchor.remove();
    global.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    return true;
  };

  const maybeExportVoiceFallbackReport = (
    intentResult,
    transcript,
    localDispatch = null,
    commandPlan = null,
    commandUnit = null,
  ) => {
    if (!shouldAutoExportVoiceFallbackReport(intentResult, localDispatch, commandPlan, commandUnit)) {
      return false;
    }
    const transcription = voiceCtrl?.lastTranscription || null;
    const normalized = intentResult?.normalized || voiceCtrl?.lastIntentResult?.normalized || null;
    const report = {
      version: 'voice-fallback-v1',
      created_at: new Date().toISOString(),
      reason: `${localDispatch?.reason || intentResult?.reason || 'unknown-fallback'}`.trim(),
      decision: intentResult?.decision || 'fallback',
      intent_key: intentResult?.intent_key || null,
      target_action: intentResult?.target_action || null,
      command_plan_mode: commandPlan?.mode || null,
      command_plan_reason: commandPlan?.reason || null,
      command_unit_kind: commandUnit?.kind || null,
      raw_transcript: `${transcription?.rawText || ''}`.trim() || null,
      normalized_transcript:
        `${transcription?.normalizedText || transcript || ''}`.trim() || null,
      surface_normalized_transcript:
        `${normalized?.surface_normalized_text || ''}`.trim() || null,
      semantic_normalized_transcript:
        `${normalized?.semantic_normalized_text || normalized?.normalized_text || ''}`.trim() || null,
      slots: Array.isArray(normalized?.slots) ? normalized.slots : null,
      adapter_input: voiceCtrl?.lastAdapterInput || null,
      intent_result: intentResult || null,
      local_dispatch: localDispatch || null,
    };
    const downloaded = downloadVoiceFallbackReport(report);
    getDiag().add?.(
      downloaded
        ? '[midas-voice] Fallback report downloaded.'
        : '[midas-voice] Fallback report download failed.',
    );
    return downloaded;
  };

  const getVoiceOutcomeLabel = (intentResult, commandUnit = null) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    const payload = intentResult?.payload || {};
    if (targetAction === 'intake_save') {
      if (Number.isFinite(payload.water_ml)) return 'Wasser';
      if (Number.isFinite(payload.salt_g)) return 'Salz';
      if (Number.isFinite(payload.protein_g)) return 'Protein';
      return 'Eintrag';
    }
    if (targetAction === 'open_module') {
      const target = `${payload.target || payload.module || ''}`.trim().toLowerCase();
      if (target === 'medikamente' || target === 'intake') return 'Tageserfassung';
      return 'Modul';
    }
    if (targetAction === 'medication_confirm_all') {
      return 'Medikation';
    }
    if (commandUnit?.kind === 'medication_command_unit') {
      return 'Medikation';
    }
    if (commandUnit?.kind === 'confirm_command_unit') {
      return 'Bestaetigung';
    }
    return 'Befehl';
  };

  const joinVoiceLabels = (items = []) => {
    const labels = items.filter(Boolean);
    if (!labels.length) return '';
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return `${labels[0]} und ${labels[1]}`;
    return `${labels.slice(0, -1).join(', ')} und ${labels[labels.length - 1]}`;
  };

  const buildVoiceCompoundReply = (results = []) => {
    const successLabels = [];
    const blockedLabels = [];
    let hasConfirmationPending = false;
    let hasMedicationSuccess = false;
    results.forEach((entry) => {
      const label = getVoiceOutcomeLabel(entry.intentResult, entry.commandUnit);
      if (entry.localDispatch?.handled === true) {
        successLabels.push(label);
        if (`${entry.intentResult?.target_action || ''}`.trim() === 'medication_confirm_all') {
          hasMedicationSuccess = true;
        }
        return;
      }
      if (entry.localDispatch?.reason === 'voice-compound-confirmation-not-allowed') {
        hasConfirmationPending = true;
      }
      blockedLabels.push(label);
    });
    const successVerb = hasMedicationSuccess ? 'verarbeitet' : 'eingetragen';
    if (successLabels.length && !blockedLabels.length) {
      return `${joinVoiceLabels(successLabels)} ${successVerb}.`;
    }
    if (successLabels.length && blockedLabels.length) {
      if (hasConfirmationPending && blockedLabels.length === 1) {
        return `${joinVoiceLabels(successLabels)} ${successVerb}. Eine Bestaetigung im Mehrfachbefehl kann ich gerade nicht sicher verarbeiten.`;
      }
      return `${joinVoiceLabels(successLabels)} ${successVerb}. ${joinVoiceLabels(blockedLabels)} konnte ich noch nicht verarbeiten.`;
    }
    if (blockedLabels.length) {
      if (hasConfirmationPending && blockedLabels.length === 1) {
        return 'Eine Bestaetigung im Mehrfachbefehl kann ich gerade nicht sicher verarbeiten.';
      }
      return `${joinVoiceLabels(blockedLabels)} konnte ich noch nicht verarbeiten.`;
    }
    return 'Den Mehrfachbefehl konnte ich gerade nicht verarbeiten.';
  };

  const buildVoiceCompoundSpokenReply = (results = []) => {
    const successLabels = [];
    const blockedLabels = [];
    let hasMedicationSuccess = false;
    let hasConfirmationBlocked = false;
    results.forEach((entry) => {
      const label = getVoiceOutcomeLabel(entry.intentResult, entry.commandUnit);
      if (entry.localDispatch?.handled === true) {
        successLabels.push(label);
        if (`${entry.intentResult?.target_action || ''}`.trim() === 'medication_confirm_all') {
          hasMedicationSuccess = true;
        }
        return;
      }
      if (entry.localDispatch?.reason === 'voice-compound-confirmation-not-allowed') {
        hasConfirmationBlocked = true;
      }
      blockedLabels.push(label);
    });
    if (successLabels.length && !blockedLabels.length) {
      if (hasMedicationSuccess) {
        return `${joinVoiceLabels(successLabels)} verarbeitet.`;
      }
      return `${joinVoiceLabels(successLabels)} eingetragen.`;
    }
    if (successLabels.length && blockedLabels.length) {
      if (hasConfirmationBlocked && blockedLabels.length === 1) {
        return `${joinVoiceLabels(successLabels)} verarbeitet. Bestaetigung separat sagen.`;
      }
      return `${joinVoiceLabels(successLabels)} verarbeitet. ${joinVoiceLabels(blockedLabels)} offen.`;
    }
    if (blockedLabels.length) {
      if (hasConfirmationBlocked && blockedLabels.length === 1) {
        return 'Bestaetigung bitte separat sagen.';
      }
      return `${joinVoiceLabels(blockedLabels)} noch offen.`;
    }
    return 'Mehrfachbefehl erledigt.';
  };

  const runVoiceMedicationConfirmAll = async () => {
    const medicationModule = global.AppModules?.medication;
    const loadMedicationForDay = medicationModule?.loadMedicationForDay;
    const confirmMedication = medicationModule?.confirmMedication;
    if (typeof loadMedicationForDay !== 'function' || typeof confirmMedication !== 'function') {
      return { handled: false, outcome: 'blocked_local', reason: 'voice-medication-module-missing' };
    }
    const dayIso = getVoiceTodayIso();
    let snapshot = null;
    try {
      snapshot = await loadMedicationForDay(dayIso, { reason: 'voice:intent-medication-confirm-all' });
    } catch (_) {
      return { handled: false, outcome: 'blocked_local', reason: 'voice-medication-load-failed' };
    }
    const openMedicationIds = (Array.isArray(snapshot?.medications) ? snapshot.medications : [])
      .filter((med) => med && med.id && med.active !== false && !med.taken)
      .map((med) => med.id);
    if (!openMedicationIds.length) {
      return { handled: false, outcome: 'blocked_local', reason: 'voice-medication-none-open' };
    }
    try {
      await Promise.all(
        openMedicationIds.map((medId) =>
          confirmMedication(medId, {
            dayIso,
            reason: 'voice:intent-confirm-all',
          })),
      );
    } catch (_) {
      return { handled: false, outcome: 'blocked_local', reason: 'voice-medication-confirm-failed' };
    }
    let refreshedSnapshot = null;
    try {
      refreshedSnapshot = await loadMedicationForDay(dayIso, {
        force: true,
        reason: 'voice:intent-confirm-all-followup',
      });
    } catch (_) {
      refreshedSnapshot = null;
    }
    const lowStockMeds = (Array.isArray(refreshedSnapshot?.medications) ? refreshedSnapshot.medications : [])
      .filter((med) => med && med.active !== false && med.low_stock && med.id)
      .map((med) => `${med.id}`.trim())
      .filter(Boolean);
    if (lowStockMeds.length) {
      getDiag().add?.(
        `[midas-voice][intent] medication low-stock follow-up eligible day=${dayIso} count=${lowStockMeds.length}`,
      );
      return {
        handled: true,
        outcome: 'handled',
        reason: null,
        replyText: buildVoiceMedicationLowStockFollowupPrompt({
          includeMedicationConfirmed: true,
          spoken: true,
        }),
        followup: {
          type: 'medication_low_stock_reorder',
          dayIso,
          medIds: lowStockMeds,
          lowStockCount: lowStockMeds.length,
        },
      };
    }
    return { handled: true, outcome: 'handled', reason: null };
  };

  const executeVoiceCompoundCommandPlan = async (transcript, commandPlan) => {
    const results = [];
    setVoiceState('executing');
    for (const commandUnit of commandPlan?.units || []) {
      const intentResult = preflightVoiceCommandUnit(commandUnit, commandPlan);
      let localDispatch = null;
      if (!intentResult) {
        localDispatch = {
          handled: false,
          outcome: 'fallback_semantic',
          reason: 'voice-intent-no-result',
        };
      } else if (intentResult.decision === 'direct_match') {
        localDispatch = await dispatchVoiceIntentDirectMatch(intentResult, commandUnit, commandPlan);
      } else if (intentResult.decision === 'needs_confirmation') {
        localDispatch = {
          handled: false,
          outcome: 'unsupported_local',
          reason: 'voice-compound-confirmation-not-allowed',
        };
      } else {
        localDispatch = {
          handled: false,
          outcome: 'fallback_semantic',
          reason: intentResult.reason || 'voice-compound-no-rule-match',
        };
      }
      recordVoiceIntentRoute(intentResult, transcript, localDispatch, commandPlan, commandUnit);
      results.push({
        commandUnit,
        intentResult,
        localDispatch,
      });
    }

    const lowStockFollowup = results.find(
      (entry) =>
        entry.localDispatch?.handled === true &&
        entry.localDispatch?.followup?.type === 'medication_low_stock_reorder',
    )?.localDispatch?.followup || null;
    let replyText = buildVoiceCompoundSpokenReply(results);
    let bypassReplyText = buildVoiceCompoundReply(results);
    if (lowStockFollowup && armVoiceMedicationLowStockFollowup(lowStockFollowup)) {
      replyText = `${replyText} ${buildVoiceMedicationLowStockFollowupPrompt({
        includeMedicationConfirmed: false,
        spoken: true,
      })}`.trim();
      bypassReplyText = `${bypassReplyText} ${buildVoiceMedicationLowStockFollowupPrompt({
        includeMedicationConfirmed: false,
        spoken: false,
      })}`.trim();
    }
    if (voiceCtrl) {
      voiceCtrl.lastIntentBypass = {
        source: 'voice',
        transcript: transcript || '',
        replyText: bypassReplyText,
        blocked: results.some((entry) => entry.localDispatch?.handled !== true),
        outcome:
          results.every((entry) => entry.localDispatch?.handled === true)
            ? 'handled'
            : results.some((entry) => entry.localDispatch?.handled === true)
              ? 'partial'
              : 'blocked',
        reason: commandPlan?.reason || 'voice-compound-dispatch',
        commandPlanMode: commandPlan?.mode || null,
        units: results.map((entry) => ({
          kind: entry.commandUnit?.kind || null,
          text: entry.commandUnit?.normalizedText || '',
          decision: entry.intentResult?.decision || null,
          intent: entry.intentResult?.intent_key || null,
          targetAction: entry.intentResult?.target_action || null,
          outcome: entry.localDispatch?.outcome || null,
          reason: entry.localDispatch?.reason || entry.intentResult?.reason || null,
          handled: entry.localDispatch?.handled === true,
        })),
        at: Date.now(),
      };
    }
    markVoiceReplyReady();
    const spoken = await speakLocalIntentConfirmation(replyText, {
      source: 'intent-local-compound',
      interrupt: true,
    });
    recordVoiceOutcome({
      stage: 'compound-reply',
      outcome: spoken?.ok ? 'spoken' : 'silent-fallback',
      reason: spoken?.ok ? 'compound-reply-spoken' : spoken?.reason || 'tts-failed',
      route: 'voice-compound-reply',
      detail: {
        result_count: results.length,
        blocked: results.some((entry) => entry.localDispatch?.handled !== true),
      },
    });
    if (!spoken?.ok) {
      setVoiceState('idle');
    }
  };

  const recordVoiceIntentBypass = (intentResult, transcript, replyText = '') => {
    if (!voiceCtrl || !intentResult) return;
    voiceCtrl.lastIntentBypass = {
      source: 'voice',
      decision: intentResult.decision || null,
      intent: intentResult.intent_key || null,
      targetAction: intentResult.target_action || null,
      transcript: transcript || '',
      replyText: replyText || '',
      at: Date.now(),
    };
    getDiag().add?.(
      `[midas-voice][intent] local handled decision=${intentResult.decision || 'unknown'} intent=${intentResult.intent_key || 'unknown'} action=${intentResult.target_action || 'unknown'}`,
    );
    recordIntentTelemetry({
      source_type: 'voice',
      decision: intentResult.decision || 'unknown',
      outcome: 'handled',
      reason: intentResult.reason || 'none',
      intent_key: intentResult.intent_key || null,
      target_action: intentResult.target_action || null,
      route: 'voice-local-handled',
    });
  };

  const dispatchVoiceIntentDirectMatch = async (intentResult, commandUnit = null, commandPlan = null) => {
    if (!intentResult || intentResult.decision !== 'direct_match') {
      return { handled: false, outcome: 'fallback_semantic', reason: 'not-direct-match' };
    }
    if (!commandPlan || !['single_unit', 'multi_unit_pending'].includes(commandPlan.mode)) {
      return { handled: false, outcome: 'unsupported_local', reason: 'voice-command-plan-mode-unsupported' };
    }
    if (!commandUnit?.normalizedText) {
      return { handled: false, outcome: 'fallback_semantic', reason: 'voice-command-unit-missing' };
    }
    const policy = isVoiceV1AllowedIntent(intentResult);
    if (!policy.allowed) {
      return { handled: false, outcome: 'unsupported_local', reason: policy.reason };
    }
    const targetAction = `${intentResult.target_action || ''}`.trim();
    const payload = intentResult.payload || {};
    if (targetAction === 'intake_save') {
      const ok = await runAllowedVoiceAction(targetAction, payload, {
        source: 'intent-engine:voice',
      });
      if (!ok) {
        return { handled: false, outcome: 'blocked_local', reason: 'voice-local-dispatch-failed' };
      }
      return { handled: true, outcome: 'handled', reason: null };
    }
    if (targetAction === 'open_module') {
      const target = `${payload.target || payload.module || ''}`.trim().toLowerCase();
      if (!VOICE_V1_ALLOWED_OPEN_MODULE_TARGETS.has(target)) {
        return { handled: false, outcome: 'unsupported_local', reason: 'voice-v1-open-module-not-allowed' };
      }
      const executor = targetAction === 'open_module' ? runUiSafeVoiceAction : runAllowedVoiceAction;
      const ok = await executor(targetAction, payload, {
        source: 'intent-engine:voice',
      });
      if (!ok) {
        return { handled: false, outcome: 'blocked_local', reason: 'voice-local-dispatch-failed' };
      }
      return { handled: true, outcome: 'handled', reason: null };
    }
    if (targetAction === 'medication_confirm_all') {
      const result = await runVoiceMedicationConfirmAll();
      if (result?.handled && result?.followup && commandPlan?.mode === 'single_unit') {
        armVoiceMedicationLowStockFollowup(result.followup);
      }
      return result;
    }
    if (targetAction === 'start_breath_timer') {
      return runVoiceStartBreathTimer(payload);
    }
    return { handled: false, outcome: 'unsupported_local', reason: 'voice-local-dispatch-unsupported' };
  };

  const finalizeVoiceIntentBypass = async (
    intentResult,
    transcript,
    commandPlan = null,
    commandUnit = null,
    replyOverride = null,
  ) => {
    const replyText = `${replyOverride || ''}`.trim() || buildVoiceLocalIntentSpokenReply(intentResult);
    recordVoiceIntentBypass(intentResult, transcript, replyText);
    if (voiceCtrl?.lastIntentBypass) {
      voiceCtrl.lastIntentBypass.commandPlanMode = commandPlan?.mode || null;
      voiceCtrl.lastIntentBypass.commandUnitKind = commandUnit?.kind || null;
    }
    markVoiceReplyReady();
    const spoken = await speakLocalIntentConfirmation(replyText, {
      source: 'intent-local',
      interrupt: true,
    });
    recordVoiceOutcome({
      stage: 'local-reply',
      outcome: spoken?.ok ? 'spoken' : 'silent-fallback',
      reason: spoken?.ok ? 'local-reply-spoken' : spoken?.reason || 'tts-failed',
      decision: intentResult?.decision || null,
      intent_key: intentResult?.intent_key || null,
      target_action: intentResult?.target_action || null,
      route: 'voice-local-reply',
    });
    if (!spoken?.ok) {
      setVoiceState('idle');
    }
  };

  const finalizeVoiceIntentBlocked = async (
    intentResult,
    transcript,
    localDispatch = null,
    commandPlan = null,
    commandUnit = null,
    replyOverride = null,
  ) => {
    const replyText =
      `${replyOverride || ''}`.trim() ||
      buildVoiceLocalIntentSpokenBlockedReply(intentResult, localDispatch);
    if (voiceCtrl) {
      voiceCtrl.lastIntentBypass = {
        source: 'voice',
        decision: intentResult?.decision || null,
        intent: intentResult?.intent_key || null,
        targetAction: intentResult?.target_action || null,
        transcript: transcript || '',
        replyText: buildVoiceLocalIntentBlockedReply(intentResult, localDispatch),
        blocked: true,
        outcome: localDispatch?.outcome || null,
        reason: localDispatch?.reason || null,
        commandPlanMode: commandPlan?.mode || null,
        commandUnitKind: commandUnit?.kind || null,
        at: Date.now(),
      };
    }
    markVoiceReplyReady();
    const spoken = await speakLocalIntentConfirmation(replyText, {
      source: 'intent-local-blocked',
      interrupt: true,
    });
    recordVoiceOutcome({
      stage: 'blocked-reply',
      outcome: spoken?.ok ? 'spoken' : 'silent-fallback',
      reason: localDispatch?.reason || (spoken?.ok ? 'blocked-reply-spoken' : spoken?.reason || 'tts-failed'),
      decision: intentResult?.decision || null,
      intent_key: intentResult?.intent_key || null,
      target_action: intentResult?.target_action || null,
      route: 'voice-blocked-reply',
    });
    if (!spoken?.ok) {
      setVoiceState('idle');
    }
  };

  const finalizeVoiceIntentFallback = async (
    intentResult,
    transcript,
    localDispatch = null,
    commandPlan = null,
    commandUnit = null,
  ) => {
    maybeExportVoiceFallbackReport(
      intentResult,
      transcript,
      localDispatch,
      commandPlan,
      commandUnit,
    );
    const replyText = buildVoiceLocalIntentSpokenFallbackReply(
      intentResult,
      localDispatch,
      commandPlan,
      commandUnit,
    );
    if (voiceCtrl) {
      voiceCtrl.lastIntentBypass = {
        source: 'voice',
        decision: intentResult?.decision || null,
        intent: intentResult?.intent_key || null,
        targetAction: intentResult?.target_action || null,
        transcript: transcript || '',
        replyText: buildVoiceLocalIntentFallbackReply(
          intentResult,
          localDispatch,
          commandPlan,
          commandUnit,
        ),
        blocked: true,
        outcome: localDispatch?.outcome || 'fallback_semantic',
        reason: localDispatch?.reason || intentResult?.reason || 'no-rule-match',
        commandPlanMode: commandPlan?.mode || null,
        commandUnitKind: commandUnit?.kind || null,
        at: Date.now(),
      };
    }
    markVoiceReplyReady();
    const spoken = await speakLocalIntentConfirmation(replyText, {
      source: 'intent-local-fallback',
      interrupt: true,
    });
    recordVoiceOutcome({
      stage: 'fallback-reply',
      outcome: spoken?.ok ? 'spoken' : 'silent-fallback',
      reason:
        localDispatch?.reason ||
        intentResult?.reason ||
        (spoken?.ok ? 'fallback-reply-spoken' : spoken?.reason || 'tts-failed'),
      decision: intentResult?.decision || null,
      intent_key: intentResult?.intent_key || null,
      target_action: intentResult?.target_action || null,
      route: 'voice-fallback-reply',
    });
    if (!spoken?.ok) {
      setVoiceState('idle');
    }
  };

  const transcribeAudio = async (blob) => {
    if (!deps.endpoints?.transcribe) {
      throw new Error('voice-endpoints-missing');
    }
    const formData = new FormData();
    formData.append('audio', blob, 'midas-voice.webm');
    let response;
    try {
      const headers = typeof deps.getSupabaseFunctionHeaders === 'function'
        ? await deps.getSupabaseFunctionHeaders()
        : null;
      if (deps.directSupabaseCall && !headers) {
        console.warn('[hub] Supabase headers missing for direct call');
        showVoiceOperationalError('Voice-Konfiguration fehlt.');
        throw new Error('supabase-headers-missing');
      }
      response = await fetch(deps.endpoints.transcribe, {
        method: 'POST',
        headers: headers ?? undefined,
        body: formData,
      });
    } catch (networkErr) {
      console.error('[hub] network error transcribing', networkErr);
      showVoiceOperationalError('Sprachdienst nicht erreichbar.');
      throw networkErr;
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[hub] transcribe failed:', errText);
      showVoiceOperationalError('Sprache konnte gerade nicht verarbeitet werden.');
      throw new Error(errText || 'Transcription failed');
    }
    const payload = await response.json().catch(() => ({}));
    const rawText = `${payload.raw_text || payload.text || payload.transcript || ''}`.trim();
    const normalizedText = `${payload.surface_normalized_text || payload.normalized_text || rawText}`.trim();
    return {
      rawText,
      normalizedText,
    };
  };

  const getVoiceJsonHeaders = async () => {
    if (typeof deps.buildFunctionJsonHeaders !== 'function') {
      throw new Error('voice-headers-missing');
    }
    try {
      return await deps.buildFunctionJsonHeaders();
    } catch (err) {
      if (err?.message === 'supabase-headers-missing') {
        showVoiceOperationalError('Voice-Konfiguration fehlt.');
      }
      throw err;
    }
  };

  const canSpeakLocalIntentConfirmation = () =>
    !!deps.endpoints?.tts && typeof deps.buildFunctionJsonHeaders === 'function';

  const speakLocalIntentConfirmation = async (text, options = {}) => {
    const normalizedText = typeof text === 'string' ? text.trim() : '';
    if (!normalizedText) {
      return {
        ok: false,
        reason: 'empty-text',
      };
    }
    if (!canSpeakLocalIntentConfirmation()) {
      return {
        ok: false,
        reason: 'tts-not-available',
      };
    }
    if (options.interrupt === true) {
      stopVoicePlayback();
    }
    try {
      const audioUrl = await requestTtsAudio(normalizedText);
      if (!audioUrl) {
        return {
          ok: false,
          reason: 'tts-audio-missing',
        };
      }
      if (voiceCtrl) {
        voiceCtrl.lastLocalConfirmation = {
          text: normalizedText,
          source: options.source || 'intent-local',
          requestedAt: Date.now(),
        };
      }
      getDiag().add?.(
        `[midas-voice][intent] local confirmation prepared source=${options.source || 'intent-local'}`,
      );
      await playVoiceAudio(audioUrl);
      recordVoiceOutcome({
        stage: 'tts',
        outcome: 'spoken',
        reason: 'tts-playback-complete',
        route: 'voice-tts',
        detail: {
          source: options.source || 'intent-local',
        },
      });
      if (voiceCtrl?.perfTrace && Number.isFinite(voiceCtrl.perfTrace.replyReadyAt) && voiceCtrl.perfTrace.replyReadyAt > 0) {
        addVoicePerfDelta('voice_reply_ready_to_tts_complete', voiceCtrl.perfTrace.replyReadyAt);
      }
      return {
        ok: true,
        reason: null,
      };
    } catch (err) {
      getDiag().add?.(
        `[midas-voice][intent] local confirmation failed: ${err?.message || err}`,
      );
      return {
        ok: false,
        reason: err?.message || 'tts-failed',
      };
    }
  };

  const requestTtsAudio = async (text) => {
    if (!deps.endpoints?.tts) {
      throw new Error('voice-endpoints-missing');
    }
    const headers = await getVoiceJsonHeaders();
    let response;
    try {
      response = await fetch(deps.endpoints.tts, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });
    } catch (networkErr) {
      console.error('[hub] tts network error', networkErr);
      throw networkErr;
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(errText || 'tts failed');
    }
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      if (payload?.audio_base64) {
        const blob = base64ToBlob(payload.audio_base64, payload.mime_type || 'audio/mpeg');
        return URL.createObjectURL(blob);
      }
      if (payload?.audio_url) {
        return payload.audio_url;
      }
      return null;
    }
    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: contentType || 'audio/mpeg' });
    return URL.createObjectURL(blob);
  };

  const playVoiceAudio = (audioUrl) =>
    new Promise((resolve, reject) => {
      if (!voiceCtrl) {
        resolve();
        return;
      }
      const audioEl = ensureVoiceAudioElement();
      stopVoicePlayback();
      setVoiceState('confirming');
      voiceCtrl.currentAudioUrl = audioUrl;
      audioEl.src = audioUrl;
      startVoiceMeter();
      const cleanup = () => {
        if (voiceCtrl?.currentAudioUrl) {
          URL.revokeObjectURL(voiceCtrl.currentAudioUrl);
          voiceCtrl.currentAudioUrl = null;
        }
        audioEl.onended = null;
        audioEl.onerror = null;
        stopVoiceMeter();
      };
      audioEl.onended = () => {
        cleanup();
        setVoiceState('idle');
        resolve();
      };
      audioEl.onerror = (event) => {
        cleanup();
        setVoiceState('idle');
        reject(event?.error || new Error('audio playback failed'));
      };
      audioEl
        .play()
        .catch((err) => {
          cleanup();
          setVoiceState('idle');
          reject(err);
        });
    });

  const ensureVoiceAudioElement = () => {
    if (!voiceCtrl) return null;
    if (!voiceCtrl.audioEl) {
      voiceCtrl.audioEl = new Audio();
      voiceCtrl.audioEl.preload = 'auto';
      if (voiceCtrl.orbitEl && !voiceCtrl.orbitEl.style.getPropertyValue('--voice-amp')) {
        voiceCtrl.orbitEl.style.setProperty('--voice-amp', '0');
      }
    }
    return voiceCtrl.audioEl;
  };

  const stopVoicePlayback = () => {
    if (!voiceCtrl?.audioEl) return;
    try {
      voiceCtrl.audioEl.pause();
      voiceCtrl.audioEl.currentTime = 0;
    } catch (err) {
      console.warn('[hub] audio pause failed', err);
    }
    stopVoiceMeter();
    if (voiceCtrl?.currentAudioUrl) {
      URL.revokeObjectURL(voiceCtrl.currentAudioUrl);
      voiceCtrl.currentAudioUrl = null;
    }
  };

  const base64ToBlob = (base64, mimeType = 'application/octet-stream') => {
    const byteChars = global.atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i += 1) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const trigger = () => {
    if (!voiceCtrl) return false;
    if (!isBootReady()) return false;
    handleVoiceTrigger();
    return true;
  };

  const getGateStatus = () => ({ ...lastVoiceGateStatus });
  const isReady = () => !!lastVoiceGateStatus.allowed;
  const onGateChange = (callback) => {
    if (typeof callback !== 'function') return () => {};
    voiceGateListeners.add(callback);
    try {
      callback({ ...lastVoiceGateStatus });
    } catch (err) {
      getDiag().add?.(`[voice] gate listener error: ${err?.message || err}`);
    }
    return () => voiceGateListeners.delete(callback);
  };
  const isConversationMode = () => false;
  const getLastIntentState = () =>
    voiceCtrl
      ? {
          commandPlan: voiceCtrl.lastCommandPlan || null,
          adapterInput: voiceCtrl.lastAdapterInput || null,
          result: voiceCtrl.lastIntentResult || null,
          route: voiceCtrl.lastIntentRoute || null,
          bypass: voiceCtrl.lastIntentBypass || null,
          outcome: voiceCtrl.lastOutcome || null,
        }
      : { commandPlan: null, adapterInput: null, result: null, route: null, bypass: null };
  appModules.voice = Object.assign(appModules.voice || {}, {
    init,
    trigger,
    getGateStatus,
    isReady,
    onGateChange,
    isConversationMode,
    getLastIntentState,
    canSpeakLocalIntentConfirmation,
    speakLocalIntentConfirmation,
  });
})(typeof window !== 'undefined' ? window : globalThis);

