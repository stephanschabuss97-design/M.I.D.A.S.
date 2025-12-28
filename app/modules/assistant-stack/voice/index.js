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
    thinking: 'Verarbeite',
    speaking: 'Spreche',
    error: 'Fehler',
  };
  const VOICE_FALLBACK_REPLY = 'Hallo Stephan, ich bin bereit.';
  const VAD_SILENCE_MS = 1000;
  const CONVERSATION_AUTO_RESUME_DELAY = 450;
  const END_PHRASES = [
    /nein danke/i,
    /danke[, ]?(das)? war( es|)?/i,
    /(das )?(war'?|ist) alles/i,
    /passt[, ]?(danke)?/i,
    /danke[, ]?(das )?passt/i,
    /fertig/i,
    /alles erledigt/i,
    /nein[, ]?(alles )?(erledigt|gut|fertig)/i,
    /stop(p)?/i,
    /tschüss/i,
    /ciao/i,

    // --- Neue, fÇ¬r dich typische Varianten ---
    /passt so/i,
    /passt scho/i,
    /jo passt/i,
    /eh passt/i,
    /alles gut/i,
    /passt eh/i,
    /passt fÇ¬r mich/i,
    /mehr brauch ich nicht/i,
    /brauch nichts mehr/i,
    /brauch (ich )?sonst nix/i,
    /nix mehr/i,
    /nichts mehr/i,
    /keine ahnung, passt/i,   // du sagst das Çôfter scherzhaft
    /das wÇÏrs?/i,
    /des wars/i,             // dein Dialekt kommt bei dir durch :)
    /bin fertig/i,
    /eh fertig/i,
    /jo eh/i,
    /reicht/i,
    /reicht schon/i,
    /genug/i,
    /ok passt/i,
    /passt danke dir/i,
    /passt danke dir eh/i,
    /passt eh danke/i,
    /gut is/i,
    /is gut/i,
    /schon gut/i,
    /ja, danke dir/i,
    /ja passt/i,
    /ja danke passt/i,
    /fürs erste passts/i,
    /für jetzt passts/i,
    /alles gut danke/i,
    /nein passt eh/i,
    /ne passt/i,
    /passt schon danke/i,
    /ok danke/i,
    /jo danke/i,
    /gut so/i,
    /oke? passt/i,
    /gut, danke/i,
    /passt, erledigt/i,
    /alles erledigt danke/i
  ];
  const END_ACTIONS = ['endSession', 'closeConversation'];

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
    const button =
      deps.hub.querySelector('[data-hub-module="assistant-voice"]') ||
      deps.hub.querySelector('[data-hub-module="assistant-text"]');
    if (!button || !global.navigator?.mediaDevices?.getUserMedia) {
      return false;
    }
    voiceCtrl = {
      button,
      status: 'idle',
      recorder: null,
      stream: null,
      chunks: [],
      history: [],
      sessionId: `voice-${Date.now()}`,
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
        minSilenceFrames: 8,
        reportInterval: 4,
      }),
      vadSilenceTimer: null,
      lastSpeechAt: 0,
      conversationMode: false,
      conversationEndPending: false,
      pendingResumeTimer: null,
    };
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
    voiceCtrl.button.setAttribute('aria-pressed', state === 'listening');
    if (state !== 'idle') {
      clearPendingResume();
    }
    if (state !== 'listening') {
      clearVadSilenceTimer();
    }
    if (voiceCtrl.orbitEl) {
      voiceCtrl.orbitEl.setAttribute('data-voice-state', state);
      if (state !== 'speaking') {
        setVoiceAmplitude(0);
      }
    }
    if (state !== 'speaking') {
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

  const shouldEndConversationFromTranscript = (text) => {
    if (!text) return false;
    const normalized = text.trim();
    if (!normalized) return false;
    return END_PHRASES.some((regex) => regex.test(normalized));
  };

  const clearPendingResume = () => {
    if (voiceCtrl?.pendingResumeTimer) {
      global.clearTimeout(voiceCtrl.pendingResumeTimer);
      voiceCtrl.pendingResumeTimer = null;
    }
  };

  const endConversationSession = () => {
    if (!voiceCtrl) return;
    voiceCtrl.conversationMode = false;
    voiceCtrl.conversationEndPending = false;
    clearPendingResume();
  };

  const scheduleConversationResume = () => {
    if (!voiceCtrl || !voiceCtrl.conversationMode) return;
    clearPendingResume();
    voiceCtrl.pendingResumeTimer = global.setTimeout(() => {
      voiceCtrl.pendingResumeTimer = null;
      if (
        !voiceCtrl ||
        voiceCtrl.status !== 'idle' ||
        voiceCtrl.recorder
      ) {
        return;
      }
      startVoiceRecording();
    }, CONVERSATION_AUTO_RESUME_DELAY);
  };

  const clearVadSilenceTimer = () => {
    if (voiceCtrl?.vadSilenceTimer) {
      global.clearTimeout(voiceCtrl.vadSilenceTimer);
      voiceCtrl.vadSilenceTimer = null;
    }
  };

  const handleVadStateChange = (state) => {
    if (!voiceCtrl || voiceCtrl.status !== 'listening') return;
    if (state === 'speech') {
      voiceCtrl.lastSpeechAt = Date.now();
      clearVadSilenceTimer();
      return;
    }
    if (state === 'silence') {
      if (voiceCtrl.vadSilenceTimer) return;
      voiceCtrl.vadSilenceTimer = global.setTimeout(() => {
        voiceCtrl.vadSilenceTimer = null;
        if (!voiceCtrl || voiceCtrl.status !== 'listening') return;
        if (deps.config?.DEV_ALLOW_DEFAULTS) {
          getDiag().add?.('[midas-voice] Auto-stop nach Stille');
        }
        stopVoiceRecording();
      }, VAD_SILENCE_MS);
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
    if (voiceCtrl.status === 'listening') {
      voiceCtrl.conversationMode = false;
      voiceCtrl.conversationEndPending = false;
      clearPendingResume();
      stopVoiceRecording();
      return;
    }
    if (voiceCtrl.status === 'speaking') {
      stopVoicePlayback();
      setVoiceState('idle');
      return;
    }
    if (voiceCtrl.status === 'thinking') {
      getDiag().add?.('[hub] voice is busy processing');
      return;
    }
    if (voiceCtrl.status === 'idle') {
      voiceCtrl.conversationMode = true;
      voiceCtrl.conversationEndPending = false;
      clearPendingResume();
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
      clearPendingResume();
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
      voiceCtrl.lastSpeechAt = Date.now();
      clearVadSilenceTimer();
      if (voiceCtrl.vadCtrl) {
        try {
          await voiceCtrl.vadCtrl.start(stream, handleVadStateChange);
        } catch (vadErr) {
          console.warn('[hub] vad start failed', vadErr);
        }
      }
      setVoiceState('listening');
    } catch (err) {
      console.error('[hub] Unable to access microphone', err);
      try {
        voiceCtrl?.vadCtrl?.stop();
      } catch (_) {
        /* no-op */
      }
      setVoiceState('error', 'Mikrofon blockiert?');
      setTimeout(() => setVoiceState('idle'), 2400);
    }
  };

  const stopVoiceRecording = () => {
    clearVadSilenceTimer();
    clearPendingResume();
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
    if (voiceCtrl.stream) {
      voiceCtrl.stream.getTracks().forEach((track) => track.stop());
    }
    voiceCtrl.stream = null;
    voiceCtrl.recorder = null;
    setVoiceState('thinking');
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
      setVoiceState('error', 'Verarbeitung fehlgeschlagen');
      setTimeout(() => setVoiceState('idle'), 2400);
    }
  };

  const processVoiceBlob = async (blob) => {
    try {
      setVoiceState('thinking');
      const transcript = await transcribeAudio(blob);
      if (!transcript) {
        setVoiceState('idle');
        return;
      }
      getDiag().add?.(`[midas-voice] Transcript: ${transcript}`);
      if (
        voiceCtrl?.conversationMode &&
        shouldEndConversationFromTranscript(transcript)
      ) {
        voiceCtrl.conversationEndPending = true;
      }
      await handleAssistantRoundtrip(transcript);
    } catch {
      setVoiceState('idle');
    }
  };

  const ensureVoiceHistory = () => {
    if (!voiceCtrl) return;
    if (!Array.isArray(voiceCtrl.history)) {
      voiceCtrl.history = [];
    }
    if (!voiceCtrl.sessionId) {
      voiceCtrl.sessionId = `voice-${Date.now()}`;
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
        setVoiceState('error', 'Konfiguration fehlt');
        setTimeout(() => setVoiceState('idle'), 2600);
        throw new Error('supabase-headers-missing');
      }
      response = await fetch(deps.endpoints.transcribe, {
        method: 'POST',
        headers: headers ?? undefined,
        body: formData,
      });
    } catch (networkErr) {
      console.error('[hub] network error transcribing', networkErr);
      setVoiceState('error', 'Keine Verbindung');
      setTimeout(() => setVoiceState('idle'), 2600);
      throw networkErr;
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[hub] transcribe failed:', errText);
      setVoiceState('error', 'Transkription fehlgeschlagen');
      setTimeout(() => setVoiceState('idle'), 2600);
      throw new Error(errText || 'Transcription failed');
    }
    const payload = await response.json().catch(() => ({}));
    return (payload.text || payload.transcript || '').trim();
  };

  const getVoiceJsonHeaders = async () => {
    if (typeof deps.buildFunctionJsonHeaders !== 'function') {
      throw new Error('voice-headers-missing');
    }
    try {
      return await deps.buildFunctionJsonHeaders();
    } catch (err) {
      if (err?.message === 'supabase-headers-missing') {
        setVoiceState('error', 'Konfiguration fehlt');
        setTimeout(() => setVoiceState('idle'), 2600);
      }
      throw err;
    }
  };

  const handleAssistantRoundtrip = async (transcript) => {
    ensureVoiceHistory();
    if (!voiceCtrl) return;
    const userMessage = {
      role: 'user',
      content: transcript,
    };
    voiceCtrl.history.push(userMessage);
    try {
      const assistantResponse = await fetchAssistantReply();
      const replyText = assistantResponse.reply;
      if (replyText) {
        voiceCtrl.history.push({
          role: 'assistant',
          content: replyText,
        });
        getDiag().add?.(`[midas-voice] Assistant reply: ${replyText}`);
        if (assistantResponse.actions?.length) {
          if (deps.config?.DEV_ALLOW_DEFAULTS) {
            getDiag().add?.(
              `[midas-voice] Assistant actions: ${assistantResponse.actions.join(', ')}`
            );
          }
          if (
            voiceCtrl.conversationMode &&
            assistantResponse.actions.some((action) => END_ACTIONS.includes(action))
          ) {
            voiceCtrl.conversationEndPending = true;
          }
        }
        await synthesizeAndPlay(replyText);
      } else {
        getDiag().add?.('[midas-voice] Assistant reply empty');
      }
      const allowResume = voiceCtrl.conversationMode && !voiceCtrl.conversationEndPending;
      setVoiceState('idle');
      if (allowResume) {
        scheduleConversationResume();
      } else {
        endConversationSession();
      }
    } catch (err) {
      voiceCtrl.history.pop();
      console.error('[midas-voice] assistant roundtrip failed', err);
      setVoiceState('error', 'Assistant nicht erreichbar');
      setTimeout(() => setVoiceState('idle'), 2600);
      endConversationSession();
      throw err;
    }
  };

  const fetchAssistantReply = async () => {
    if (!voiceCtrl) {
      return { reply: '', actions: [], meta: null };
    }
    if (!deps.endpoints?.assistant) {
      throw new Error('voice-endpoints-missing');
    }
    const payload = {
      session_id: voiceCtrl.sessionId ?? `voice-${Date.now()}`,
      mode: 'voice',
      messages: voiceCtrl.history ?? [],
    };
    let response;
    try {
      const headers = await getVoiceJsonHeaders();
      response = await fetch(deps.endpoints.assistant, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      console.error('[hub] assistant network error', networkErr);
      throw networkErr;
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[hub] assistant failed:', errText);
      throw new Error(errText || 'assistant failed');
    }
    const rawText = await response.text();
    let data = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        console.warn('[hub] assistant response not JSON, falling back to default', err);
      }
    }

    let reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
    if (!reply) {
      if (rawText) {
        console.warn('[hub] assistant payload missing reply, snippet:', rawText.slice(0, 160));
      }
      getDiag().add?.('[midas-voice] Assistant reply empty, using fallback.');
      reply = VOICE_FALLBACK_REPLY;
    }
    const actions = Array.isArray(data?.actions) ? [...data.actions] : [];

    // Manche Antworten enthalten versehentlich ein JSON-Objekt als Text ({"reply":"...","actions":[]}).
    // In diesem Fall extrahieren wir den inneren reply-Text, damit TTS keinen JSON-Block vorliest.
    if (reply.startsWith('{')) {
      try {
        const nested = JSON.parse(reply);
        if (typeof nested?.reply === 'string' && nested.reply.trim()) {
          reply = nested.reply.trim();
        }
        // Wenn das verschachtelte Objekt Actions enthlt, nutze sie nur, wenn oben nichts bertragen wurde.
        if (!actions.length && Array.isArray(nested?.actions)) {
          actions.push(...nested.actions);
        }
      } catch (err) {
        console.warn('[hub] nested assistant reply not JSON-parsable', err);
      }
    }

    return {
      reply,
      actions,
      meta: data && typeof data === 'object' ? data.meta ?? null : null,
    };
  };

  const synthesizeAndPlay = async (text) => {
    if (!text) {
      setVoiceState('idle');
      return;
    }
    try {
      const audioUrl = await requestTtsAudio(text);
      if (!audioUrl) {
        setVoiceState('idle');
        return;
      }
      await playVoiceAudio(audioUrl);
    } catch (err) {
      console.error('[midas-voice] tts failed', err);
      setVoiceState('error', 'TTS fehlgeschlagen');
      setTimeout(() => setVoiceState('idle'), 2600);
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
      setVoiceState('speaking');
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
  const isConversationMode = () => !!voiceCtrl?.conversationMode;

  appModules.voice = Object.assign(appModules.voice || {}, {
    init,
    trigger,
    getGateStatus,
    isReady,
    onGateChange,
    isConversationMode,
  });
})(typeof window !== 'undefined' ? window : globalThis);
