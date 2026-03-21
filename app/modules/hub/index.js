'use strict';
/**
 * MODULE: hub/index.js
 * Description: Aktiviert das neue MIDAS Hub Layout, sobald `CAPTURE_HUB_V2` gesetzt ist.
 * Notes: 
 *  - UI-only: Buttons/Chat reagieren lokal, steuern noch keine Module.
 */

(function (global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const doc = global.document;
  const SUPABASE_PROJECT_URL = 'https://jlylmservssinsavlkdi.supabase.co';
  const feedbackApi = appModules.feedback || global.AppModules?.feedback || null;
  const MIDAS_ENDPOINTS = (() => {
    const base = `${SUPABASE_PROJECT_URL}/functions/v1`;
    const hostname = `${global.location?.hostname || ''}`.trim().toLowerCase();
    const isDirectFunctionHost =
      hostname.includes('github.io') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1';
    if (isDirectFunctionHost) {
      return {
        assistant: `${base}/midas-assistant`,
        transcribe: `${base}/midas-transcribe`,
        tts: `${base}/midas-tts`,
        vision: `${base}/midas-vision`,
      };
    }
    return {
      assistant: '/api/midas-assistant',
      transcribe: '/api/midas-transcribe',
      tts: '/api/midas-tts',
      vision: '/api/midas-vision',
    };
  })();
  const DIRECT_SUPABASE_CALL = Object.values(MIDAS_ENDPOINTS).some((url) =>
    typeof url === 'string' && url.includes('.supabase.co/'),
  );

  const ORBIT_BUTTONS = {
    north: { angle: -90 },
    ne: { angle: -45, radiusScale: 0.88 },
    e: { angle: 0 },
    se: { angle: 45, radiusScale: 0.88 },
    s: { angle: 90 },
    sw: { angle: 135, radiusScale: 0.88 },
    w: { angle: 180 },
    nw: { angle: -135, radiusScale: 0.88 },
    core: { angle: 0, radiusScale: 0 },
  };
  const CAROUSEL_MODULES = [
    { id: 'assistant-voice', selector: '[data-carousel-id="assistant-voice"]', panel: null },
    { id: 'intake', selector: '[data-carousel-id="intake"]', panel: 'intake' },
    { id: 'vitals', selector: '[data-carousel-id="vitals"]', panel: 'vitals' },
    { id: 'appointments', selector: '[data-carousel-id="appointments"]', panel: 'appointments' },
    { id: 'doctor', selector: '[data-carousel-id="doctor"]', panel: 'doctor' },
    { id: 'chart', selector: '[data-carousel-id="chart"]', panel: null },
    { id: 'profile', selector: '[data-carousel-id="profile"]', panel: 'profile' },
    { id: 'assistant-text', selector: '[data-carousel-id="assistant-text"]', panel: 'assistant-text' },
  ];
  const PANEL_TO_CAROUSEL_ID = {
    intake: 'intake',
    vitals: 'vitals',
    'assistant-text': 'assistant-text',
    appointments: 'appointments',
    doctor: 'doctor',
    profile: 'profile',
  };
  const ICON_ENTER_CLASSES = {
    '-1': 'hub-icon-anim-enter-left',
    0: 'hub-icon-anim-enter-fade',
    1: 'hub-icon-anim-enter-right',
  };
  const ICON_EXIT_CLASSES = {
    '-1': 'hub-icon-anim-exit-right',
    0: 'hub-icon-anim-exit-fade',
    1: 'hub-icon-anim-exit-left',
  };
  const carouselState = {
    items: [],
    index: -1,
    idle: true,
    orbitEl: null,
    transitionDir: 0,
    activeButton: null,
    momentumTimers: [],
    showPassiveVoiceAnchor: false,
    prefersReducedMotion: global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
  };
  let carouselKeyListenerBound = false;
  let voiceGateUnsubscribe = null;
  const quickbarState = {
    el: null,
    handle: null,
    hubEl: null,
    open: false,
  };
  const dashboardState = {
    el: null,
    hubEl: null,
    open: false,
  };
  const MAX_ASSISTANT_PHOTO_BYTES = 6 * 1024 * 1024;
  const HUB_DEBUG_ENABLED = !!appModules.config?.LOG_HUB_DEBUG;

  let hubButtons = [];
  let activePanel = null;
  let setSpriteStateFn = null;
  let doctorUnlockWaitCancel = null;
  let openDoctorPanelWithGuard = null;
  let openDoctorInboxPanelWithGuard = null;
  let assistantSurfaceUnsubscribe = null;
  let hubDashboardCtrl = null;
  let dashboardIntakeRefreshBound = false;
  const aura3dApi = global.AppModules?.hubAura3D || null;
  let aura3dCleanup = null;
  const auraState = {
    canvas: null,
  };
  let trendpilotAuraBound = false;
  const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TICKER_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;
  const TICKER_DAY_FORMAT = new Intl.DateTimeFormat('de-AT', { weekday: 'short' });
  const TICKER_TIME_FORMAT = new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getTodayIso = () => new Date().toISOString().slice(0, 10);
  const getTickerRefs = () => {
    if (!doc) return null;
    const bar = doc.getElementById('tickerBar');
    const text = doc.getElementById('tickerBarText');
    if (!bar || !text) return null;
    return { bar, text };
  };
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const getTickerDayLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(date, today)) return 'Heute';
    if (isSameDay(date, tomorrow)) return 'Morgen';
    return TICKER_DAY_FORMAT.format(date).replace(/\.$/, '');
  };
  const getAppointmentDate = (item) => {
    if (!item) return null;
    if (item.start_at) {
      const dt = new Date(item.start_at);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (item.date) {
      const dt = new Date(item.date);
      if (Number.isNaN(dt.getTime())) return null;
      if (item.time) {
        const [h = 0, m = 0] = String(item.time).split(':').map((val) => Number(val) || 0);
        dt.setHours(h, m, 0, 0);
      } else {
        dt.setHours(0, 0, 0, 0);
      }
      return dt;
    }
    return null;
  };
  const buildTickerLine = (item) => {
    const startAt = getAppointmentDate(item);
    if (!startAt) return '';
    const dayLabel = getTickerDayLabel(startAt);
    const timeLabel = TICKER_TIME_FORMAT.format(startAt);
    const title = String(item.title || 'Termin').trim();
    const location = String(item.location || '').trim();
    const tail = location ? `, ${location}` : '';
    return `${dayLabel} ${timeLabel} ${title}${tail}`;
  };
  const updateTickerBar = ({ reason = 'init' } = {}) => {
    const refs = getTickerRefs();
    if (!refs) return;
    const provider = appModules.appointments;
    const items = provider?.getAll?.() || [];
    const now = Date.now();
    const visible = Array.isArray(items)
      ? items
        .filter((item) => item && item.status !== 'done' && item.status !== 'cancelled')
        .map((item) => {
          const startAt = getAppointmentDate(item);
          return {
            item,
            startAt,
            ts: startAt ? startAt.getTime() : NaN,
          };
        })
        .filter((entry) => Number.isFinite(entry.ts))
        .filter((entry) => entry.ts > now && now >= entry.ts - TICKER_WINDOW_MS)
        .sort((a, b) => a.ts - b.ts)
      : [];
    const lines = visible.map(({ item }) => buildTickerLine(item)).filter(Boolean);
    if (!lines.length) {
      refs.bar.hidden = true;
      refs.bar.setAttribute('aria-hidden', 'true');
      refs.text.textContent = '';
      return;
    }
    refs.text.textContent = lines.join(' | ');
    refs.bar.hidden = false;
    refs.bar.setAttribute('aria-hidden', 'false');
    if (HUB_DEBUG_ENABLED) {
      diag.add?.(`[ticker] update reason=${reason} items=${lines.length}`);
    }
  };

  const isTrendpilotOngoing = (entry) => {
    const to = entry?.window_to || entry?.day || '';
    if (!to || !ISO_DAY_RE.test(to)) return false;
    return to >= getTodayIso();
  };

  const applyTrendpilotAuraState = (entry) => {
    const orbit = doc?.querySelector('.hub-orbit');
    if (!orbit) return;
    const ongoing = isTrendpilotOngoing(entry);
    orbit.classList.toggle('trendpilot-active', ongoing);
    orbit.classList.toggle(
      'trendpilot-warning',
      ongoing && entry?.severity === 'warning'
    );
    orbit.classList.toggle(
      'trendpilot-critical',
      ongoing && entry?.severity === 'critical'
    );
  };

  const triggerAuraTouchPulse = (event) => {
    if (!auraState.canvas || !aura3dApi?.triggerTouchPulse || !event) return;
    const rect = auraState.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (event.clientX - rect.left) / rect.width;
    const normY = (event.clientY - rect.top) / rect.height;
    if (normX < 0 || normX > 1 || normY < 0 || normY > 1) return;
    aura3dApi.triggerTouchPulse(normX, normY);
  };
  let assistantChatCtrl = null;
  let assistantCopyFeedbackTimer = null;
  let assistantProfileSnapshot = appModules.profile?.getData?.() || null;
  let supabaseFunctionHeadersPromise = null;
  const panelPerfQuery = global.matchMedia?.('(max-width: 1024px)') || null;

  const getSupabaseApi = () => appModules.supabase || {};
  const getSupabaseState = () => getSupabaseApi()?.supabaseState || null;
  const getSupabaseFunctionHeaders = async () => {
    if (!DIRECT_SUPABASE_CALL) {
      return null;
    }
    if (supabaseFunctionHeadersPromise) {
      return supabaseFunctionHeadersPromise;
    }
    const loader = (async () => {
      if (typeof global.getConf !== 'function') {
        diag.add?.('[hub] getConf missing - cannot load Supabase key');
        return null;
      }
      try {
        const stored = await global.getConf('webhookKey');
        const raw = String(stored || '').trim();
        if (!raw) {
          diag.add?.('[hub] Supabase webhookKey missing - voice API locked');
          return null;
        }
        const bearer = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
        const apikey = bearer.replace(/^Bearer\s+/i, '');
        return {
          'Authorization': bearer,
          'apikey': apikey,
        };
      } catch (err) {
        console.error('[hub] Failed to load Supabase headers', err);
        return null;
      } finally {
        supabaseFunctionHeadersPromise = null;
      }
    })();
    supabaseFunctionHeadersPromise = loader;
    return loader;
  };
  const buildFunctionJsonHeaders = async () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (!DIRECT_SUPABASE_CALL) {
      return headers;
    }
    const authHeaders = await getSupabaseFunctionHeaders();
    if (!authHeaders) {
      diag.add?.('[hub] Supabase headers missing for assistant call');
      throw new Error('supabase-headers-missing');
    }
    return { ...headers, ...authHeaders };
  };
  const getAssistantUiHelpers = () =>
    appModules.assistantUi ||
    appModules.assistant?.ui ||
    global.AppModules?.assistantUi ||
    null;
  const getAssistantSuggestStore = () =>
    appModules.assistantSuggestStore ||
    global.AppModules?.assistantSuggestStore ||
    null;
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
      diag.add?.(`[intent] telemetry error: ${err?.message || err}`);
      return null;
    }
  };
  const getVoiceModule = () => appModules.voice || global.AppModules?.voice || null;
  const getVoiceGateLabel = (status = {}) => {
    const reason = String(status?.reason || '').trim();
    switch (reason) {
      case 'assistant-surface-off':
        return 'Voice ist deaktiviert';
      case 'voice-parked':
        return 'Voice ist noch geparkt';
      case 'booting':
        return 'Voice startet noch';
      case 'auth-check':
        return 'Voice wartet auf Anmeldung';
      case 'voice-module-missing':
        return 'Voice-Modul fehlt';
      default:
        return status?.allowed ? 'Voice bereit' : 'Voice aktuell gesperrt';
    }
  };
  const getVoiceFacade = () => {
    const voiceApi = getVoiceModule();
    if (voiceApi) return voiceApi;
    return null;
  };
  const syncVoiceEntryGateState = (hub, status = null) => {
    const button = hub?.querySelector?.('[data-carousel-id="assistant-voice"]');
    if (!button) return;
    const resolved = status || getVoiceFacade()?.getGateStatus?.() || { allowed: false, reason: 'voice-module-missing' };
    const locked = !resolved.allowed;
    const visualLock = locked && resolved.reason !== 'assistant-surface-off';
    const showVoiceLabel = resolved.reason !== 'assistant-surface-off';
    if (!button.dataset.voiceState) {
      button.dataset.voiceState = 'idle';
    }
    button.classList.toggle('is-voice-locked', visualLock);
    button.classList.toggle('is-voice-label-hidden', !showVoiceLabel);
    button.setAttribute('aria-disabled', locked ? 'true' : 'false');
    button.dataset.voiceGateReason = String(resolved.reason || '');
    button.dataset.voiceLabel = locked ? getVoiceGateLabel(resolved) : (button.dataset.voiceLabel || 'Bereit');
    button.setAttribute('aria-label', `MIDAS Voice â€“ ${button.dataset.voiceLabel}`);
    button.title = getVoiceGateLabel(resolved);
  };
  const setupVoiceGateState = (hub) => {
    if (!hub) return;
    try {
      voiceGateUnsubscribe?.();
    } catch (_) {}
    voiceGateUnsubscribe = null;
    syncVoiceEntryGateState(hub);
    const voiceApi = getVoiceFacade();
    if (typeof voiceApi?.onGateChange === 'function') {
      voiceGateUnsubscribe = voiceApi.onGateChange((status) => {
        syncVoiceEntryGateState(hub, status);
      });
    }
  };
  const initVoiceModule = (hub) => {
    const voiceApi = getVoiceModule();
    if (typeof voiceApi?.init !== 'function') return false;
    return voiceApi.init({
      hub,
      doc,
      endpoints: MIDAS_ENDPOINTS,
      directSupabaseCall: DIRECT_SUPABASE_CALL,
      buildFunctionJsonHeaders,
      getSupabaseFunctionHeaders,
      getSupabaseState,
      diag,
      config: appModules.config || {},
      isBootReady,
    });
  };
  const isVoiceConversationMode = () => !!getVoiceFacade()?.isConversationMode?.();

  const syncButtonState = (target) => {
    hubButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn === target));
    });
  };

  const getCarouselLength = () => carouselState.items.length;

  const iconAnimationHandlers = new WeakMap();

  const applyIconAnimation = (btn, className) => {
    if (!btn || !className) return;
    const current = iconAnimationHandlers.get(btn);
    if (current) {
      btn.removeEventListener('animationend', current.handler);
      btn.classList.remove(current.className);
      iconAnimationHandlers.delete(btn);
    }
    // Force reflow to allow re-adding the same class
    void btn.offsetWidth; // eslint-disable-line no-unused-expressions
    btn.classList.add(className);
    const handler = () => {
      btn.classList.remove(className);
      btn.removeEventListener('animationend', handler);
      if (className.startsWith('hub-icon-anim-exit')) {
        btn.classList.remove('hub-icon-exit');
      }
      iconAnimationHandlers.delete(btn);
    };
    btn.addEventListener('animationend', handler);
    iconAnimationHandlers.set(btn, { className, handler });
  };

  const applyCarouselUi = () => {
    const dir = carouselState.transitionDir;
    const enterClass = ICON_ENTER_CLASSES[dir] || ICON_ENTER_CLASSES[0];
    const exitClass = ICON_EXIT_CLASSES[dir] || ICON_EXIT_CLASSES[0];
    const prevActive = carouselState.activeButton;
    let nextActive = null;
    carouselState.items.forEach((item, index) => {
      const btn = item.button;
      if (!btn) return;
      const isActive = !carouselState.idle && index === carouselState.index;
      if (isActive) {
        nextActive = btn;
      }
      if (!isActive && btn !== prevActive) {
        btn.classList.remove('hub-icon-active', 'hub-icon-exit');
        btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = -1;
      }
    });
    const changed = prevActive !== nextActive;
    if (changed && prevActive) {
      prevActive.classList.remove('hub-icon-active');
      prevActive.classList.add('hub-icon-exit');
      prevActive.setAttribute('aria-hidden', 'true');
      prevActive.tabIndex = -1;
      applyIconAnimation(prevActive, exitClass);
    }
    if (nextActive) {
      nextActive.classList.add('hub-icon-active');
      nextActive.classList.remove('hub-icon-exit');
      nextActive.setAttribute('aria-hidden', 'false');
      nextActive.tabIndex = 0;
      if (changed) {
        applyIconAnimation(nextActive, enterClass);
      }
    }
    carouselState.activeButton = nextActive;
    carouselState.transitionDir = 0;
    if (carouselState.orbitEl) {
      carouselState.orbitEl.dataset.carouselState = carouselState.idle ? 'idle' : 'active';
    }
  };

  const setCarouselIdle = () => {
    carouselState.idle = true;
    carouselState.index = -1;
    carouselState.activeButton = null;
    carouselState.transitionDir = 0;
    applyCarouselUi();
  };

  const setCarouselActiveIndex = (index, { direction = 0 } = {}) => {
    const length = getCarouselLength();
    if (!length) return false;
    const prevIndex = carouselState.index;
    const wasIdle = carouselState.idle;
    const normalized = ((index % length) + length) % length;
    carouselState.index = normalized;
    carouselState.idle = false;
    carouselState.transitionDir = direction;
    applyCarouselUi();
    return wasIdle || normalized !== prevIndex;
  };

  const shiftCarousel = (delta = 1) => {
    let length = getCarouselLength();
    if (!length) return;
    const dir = delta > 0 ? 1 : -1;
    if (!isAssistantSurfaceEnabled() && carouselState.showPassiveVoiceAnchor) {
      const activeId = carouselState.activeButton?.dataset?.carouselId || null;
      const shouldPromotePassiveAnchor =
        carouselState.idle || activeId === 'assistant-voice';
      if (shouldPromotePassiveAnchor) {
        const targetIndex = dir > 0 ? 1 : length - 1;
        const changed = setCarouselActiveIndex(targetIndex, { direction: dir });
        carouselState.showPassiveVoiceAnchor = false;
        if (quickbarState.hubEl) {
          refreshCarouselItems(quickbarState.hubEl, {
            preserveActiveId: true,
          });
        }
        if (changed && aura3dApi?.triggerCarouselSweep) {
          aura3dApi.triggerCarouselSweep(dir > 0 ? 'left' : 'right');
        }
        return;
      }
      carouselState.showPassiveVoiceAnchor = false;
      if (quickbarState.hubEl) {
        refreshCarouselItems(quickbarState.hubEl, {
          preserveActiveId: true,
        });
      }
      length = getCarouselLength();
      if (!length) return;
    }
    let changed = false;
    if (carouselState.idle) {
      const startIndex = dir > 0 ? 0 : length - 1;
      changed = setCarouselActiveIndex(startIndex, { direction: dir });
    } else {
      changed = setCarouselActiveIndex(carouselState.index + delta, { direction: dir });
    }
    if (changed && aura3dApi?.triggerCarouselSweep) {
      aura3dApi.triggerCarouselSweep(dir > 0 ? 'left' : 'right');
    }
  };

  const clearMomentumTimers = () => {
    if (!carouselState.momentumTimers) return;
    carouselState.momentumTimers.forEach((timerId) => {
      try { global.clearTimeout(timerId); } catch (_) {}
    });
    carouselState.momentumTimers = [];
  };

  const queueMomentumSwings = (direction, steps) => {
    clearMomentumTimers();
    const clampedSteps = Math.min(2, Math.max(0, steps));
    if (!clampedSteps) return;
    const baseDelay = 140;
    for (let i = 1; i <= clampedSteps; i += 1) {
      const timerId = global.setTimeout(() => {
        shiftCarousel(direction);
        carouselState.momentumTimers = carouselState.momentumTimers.filter((id) => id !== timerId);
      }, baseDelay * i);
      carouselState.momentumTimers.push(timerId);
    }
  };

  const setCarouselActiveById = (id, { direction = 0 } = {}) => {
    const idx = carouselState.items.findIndex((item) => item.id === id);
    if (idx === -1) return;
    setCarouselActiveIndex(idx, { direction });
  };

  const syncCarouselToPanel = (panelName) => {
    const id = PANEL_TO_CAROUSEL_ID[panelName];
    if (!id) return;
    setCarouselActiveById(id);
  };

  const handleCarouselKeydown = (event) => {
    if (!doc?.body?.classList?.contains('hub-mode')) return;
    if (event.defaultPrevented) return;
    const target = event.target;
    const tagName = typeof target?.tagName === 'string' ? target.tagName.toLowerCase() : '';
    if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) return;
    if (event.key === 'ArrowRight') {
      clearMomentumTimers();
      shiftCarousel(1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      clearMomentumTimers();
      shiftCarousel(-1);
      event.preventDefault();
    }
  };

  const syncQuickbarUi = () => {
    if (!quickbarState.el) return;
    if (quickbarState.open) {
      quickbarState.el.removeAttribute('hidden');
      quickbarState.el.removeAttribute('inert');
      quickbarState.el.setAttribute('aria-hidden', 'false');
    } else {
      quickbarState.el.setAttribute('hidden', 'true');
      quickbarState.el.setAttribute('inert', '');
      quickbarState.el.setAttribute('aria-hidden', 'true');
    }
    if (quickbarState.handle) {
      quickbarState.handle.setAttribute('aria-expanded', quickbarState.open ? 'true' : 'false');
    }
    if (quickbarState.hubEl) {
      quickbarState.hubEl.classList.toggle('quickbar-open', quickbarState.open);
    }
  };

  const openQuickbar = () => {
    if (!quickbarState.el || quickbarState.open) return;
    closeDashboard();
    quickbarState.open = true;
    syncQuickbarUi();
  };

  const closeQuickbar = () => {
    if (!quickbarState.el || !quickbarState.open) return;
    quickbarState.open = false;
    syncQuickbarUi();
  };

  const toggleQuickbar = () => {
    if (!quickbarState.el) return;
    if (quickbarState.open) closeQuickbar();
    else openQuickbar();
  };

  const syncDashboardUi = () => {
    if (!dashboardState.el) return;
    if (dashboardState.open) {
      dashboardState.el.removeAttribute('hidden');
      dashboardState.el.removeAttribute('inert');
      dashboardState.el.setAttribute('aria-hidden', 'false');
    } else {
      dashboardState.el.setAttribute('hidden', 'true');
      dashboardState.el.setAttribute('inert', '');
      dashboardState.el.setAttribute('aria-hidden', 'true');
    }
    if (dashboardState.hubEl) {
      dashboardState.hubEl.classList.toggle('dashboard-open', dashboardState.open);
    }
  };

  const openDashboard = () => {
    if (!dashboardState.el || dashboardState.open) return;
    closeQuickbar();
    dashboardState.open = true;
    syncDashboardUi();
  };

  const closeDashboard = () => {
    if (!dashboardState.el || !dashboardState.open) return;
    dashboardState.open = false;
    syncDashboardUi();
  };

  const bindVerticalRevealGestures = (element, { onSwipeUp = null, onSwipeDown = null } = {}) => {
    if (!element) return;
    let pointerId = null;
    let startX = null;
    let startY = null;
    const SWIPE_THRESHOLD = 42;

    const reset = () => {
      pointerId = null;
      startX = null;
      startY = null;
    };

    element.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
    });

    element.addEventListener('pointerup', (event) => {
      if (pointerId === null || event.pointerId !== pointerId) {
        reset();
        return;
      }
      const deltaX = startX === null ? 0 : event.clientX - startX;
      const deltaY = startY === null ? 0 : event.clientY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absY > absX && absY > SWIPE_THRESHOLD) {
        if (deltaY < -SWIPE_THRESHOLD) {
          onSwipeUp?.();
        } else if (deltaY > SWIPE_THRESHOLD) {
          onSwipeDown?.();
        }
      }
      reset();
    });

    element.addEventListener('pointercancel', reset);
  };

  const setupCarouselGestures = (orbit) => {
    if (!orbit) return;
    let pointerId = null;
    let pointerStartX = null;
    let pointerStartY = null;
    const SWIPE_THRESHOLD = 48;
    let pointerStartTime = null;
    let lastMoveX = null;
    let lastMoveTime = null;

    const resetSwipe = () => {
      pointerId = null;
      pointerStartX = null;
      pointerStartY = null;
      pointerStartTime = null;
      lastMoveX = null;
      lastMoveTime = null;
    };

    orbit.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary) return;
      pointerId = event.pointerId;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerStartTime = performance.now();
      lastMoveX = event.clientX;
      lastMoveTime = pointerStartTime;
      triggerAuraTouchPulse(event);
    });

    orbit.addEventListener('pointermove', (event) => {
      if (pointerId === null || event.pointerId !== pointerId) return;
      lastMoveX = event.clientX;
      lastMoveTime = performance.now();
    });

    orbit.addEventListener('pointerup', (event) => {
      if (pointerId === null || event.pointerId !== pointerId) {
        resetSwipe();
        return;
      }
      const deltaX = pointerStartX === null ? 0 : event.clientX - pointerStartX;
      const elapsed = pointerStartTime ? performance.now() - pointerStartTime : 0;
      const velocityX =
        elapsed > 0 && pointerStartX !== null ? (lastMoveX - pointerStartX) / elapsed : 0;
      const deltaY = pointerStartY === null ? 0 : event.clientY - pointerStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absY > absX && absY > SWIPE_THRESHOLD) {
        if (deltaY < -SWIPE_THRESHOLD) {
          if (dashboardState.open) {
            closeDashboard();
          } else {
            openQuickbar();
          }
        } else if (deltaY > SWIPE_THRESHOLD) {
          if (quickbarState.open) {
            closeQuickbar();
          } else {
            openDashboard();
          }
        }
        resetSwipe();
        return;
      }
      let momentumSteps = 0;
      if (!carouselState.prefersReducedMotion) {
        const absVelocity = Math.abs(velocityX);
        if (absVelocity >= 0.7 && absX > SWIPE_THRESHOLD * 1.5) {
          momentumSteps = 1;
        }
      }
      const direction = deltaX < 0 ? 1 : -1;
      if (absX > SWIPE_THRESHOLD) {
        shiftCarousel(direction);
        if (momentumSteps > 0) {
          queueMomentumSwings(direction, momentumSteps);
        }
      }
      resetSwipe();
    });

    orbit.addEventListener('pointercancel', resetSwipe);
  };

  const setupCarouselController = (hub) => {
    if (!hub) return;
    const orbit = hub.querySelector('.hub-orbit');
    if (!orbit) return;
    carouselState.orbitEl = orbit;
    refreshCarouselItems(hub, { preserveActiveId: false });
    setupCarouselGestures(orbit);
    if (!carouselKeyListenerBound) {
      carouselKeyListenerBound = true;
      doc.addEventListener('keydown', handleCarouselKeydown);
    }
  };

  const handlePanelEsc = (event) => {
    if (event.key === 'Escape') {
      closeActivePanel({ intent: true });
    }
  };

  const getChartPanel = () => global.AppModules?.charts?.chartPanel;
  const getAssistantSurfaceApi = () => appModules.assistantSurface || global.AppModules?.assistantSurface || null;
  const isAssistantSurfaceEnabled = () => getAssistantSurfaceApi()?.isEnabled?.() === true;
  const shouldShowVoiceAnchor = () =>
    isAssistantSurfaceEnabled() || carouselState.showPassiveVoiceAnchor;

  const getVisibleCarouselModules = () =>
    CAROUSEL_MODULES.filter((entry) => {
      if (entry.id === 'assistant-text') return isAssistantSurfaceEnabled();
      if (entry.id === 'assistant-voice') return shouldShowVoiceAnchor();
      return true;
    });

  const syncAssistantTextSurface = (hub) => {
    if (!hub) return;
    const enabled = isAssistantSurfaceEnabled();
    hub.querySelectorAll('[data-hub-module="assistant-text"]').forEach((btn) => {
      btn.hidden = !enabled;
      btn.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      if (enabled) {
        btn.removeAttribute('inert');
      } else {
        btn.setAttribute('inert', '');
      }
    });
    const carouselBtn = hub.querySelector('[data-carousel-id="assistant-text"]');
    if (carouselBtn) {
      carouselBtn.hidden = !enabled;
      carouselBtn.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      if (enabled) {
        carouselBtn.removeAttribute('inert');
      } else {
        carouselBtn.setAttribute('inert', '');
        carouselBtn.classList.remove('hub-icon-active', 'hub-icon-exit');
        carouselBtn.tabIndex = -1;
      }
    }
    if (!enabled && activePanel?.dataset?.hubPanel === 'assistant-text') {
      closeActivePanel({ instant: true });
    }
    hubButtons = Array.from(hub.querySelectorAll('.hub-icon:not([disabled]):not([hidden])'));
  };

  const refreshCarouselItems = (hub, { preserveActiveId = true } = {}) => {
    if (!hub) return;
    const currentActiveId = preserveActiveId
      ? carouselState.activeButton?.dataset?.carouselId || null
      : null;
    carouselState.items = getVisibleCarouselModules().map((entry) => {
      const button = hub.querySelector(entry.selector);
      if (!button) return null;
      if (!button.dataset.carouselId) {
        button.dataset.carouselId = entry.id;
      }
      button.setAttribute('tabindex', '-1');
      button.setAttribute('aria-hidden', 'true');
      return { ...entry, button };
    }).filter(Boolean);
    if (!carouselState.items.length) {
      setCarouselIdle();
      return;
    }
    const nextId =
      currentActiveId && carouselState.items.some((item) => item.id === currentActiveId)
        ? currentActiveId
        : carouselState.items.some((item) => item.id === 'assistant-voice')
          ? 'assistant-voice'
          : carouselState.items[0]?.id;
    if (!nextId) {
      setCarouselIdle();
      return;
    }
    setCarouselActiveById(nextId, { direction: 0 });
  };

  const closeActivePanel = ({ skipButtonSync = false, instant = false, intent = false } = {}) => {
    if (!activePanel) return;
    const panel = activePanel;
    const panelName = panel.dataset?.hubPanel || 'unknown';
    diag.add?.(`[hub] close panel ${panelName} instant=${instant}`);
    if (intent) {
      feedbackApi?.feedback?.('hub:close', { intent: true, source: 'user' });
    }
    if (panelName === 'doctor') {
      if (typeof doctorUnlockWaitCancel === 'function') {
        diag.add?.('[hub] doctor close -> cancel pending unlock wait');
        try { doctorUnlockWaitCancel(false); } catch (_) {}
      }
      const chartPanel = getChartPanel();
      if (chartPanel?.open) {
        diag.add?.('[hub] doctor close -> chart still open, hiding chart first');
        try {
          chartPanel.hide();
        } catch (err) {
          console.warn('[hub] chartPanel.hide failed', err);
        }
      }
    }

    const activeEl = doc?.activeElement;
    if (activeEl && typeof activeEl.blur === 'function' && panel.contains(activeEl)) {
      try { activeEl.blur(); } catch (_) {}
    }

    const finish = () => {
      panel.removeEventListener('animationend', handleAnimationEnd);
      if (panel._hubCloseTimer) {
        global.clearTimeout(panel._hubCloseTimer);
        panel._hubCloseTimer = null;
      }
      panel.classList.remove('hub-panel-closing', 'hub-panel-open', 'is-visible');
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
      activePanel = null;
      if (doc?.body) {
        doc.body.classList.remove('hub-panel-active');
      }
      doc.removeEventListener('keydown', handlePanelEsc);
      setSpriteStateFn?.('idle');
      if (!skipButtonSync) {
        syncButtonState(null);
      }
    };

    const handleAnimationEnd = (event) => {
      if (event?.target !== panel) return;
      finish();
    };

    if (instant) {
      finish();
      return;
    }

    panel.classList.remove('hub-panel-open');
    panel.classList.add('hub-panel-closing');
    panel.setAttribute('aria-hidden', 'true');
    panel.hidden = false;
    panel.addEventListener('animationend', handleAnimationEnd);
    panel._hubCloseTimer = global.setTimeout(finish, 1200);
  };
  const forceClosePanelByName = (panelName, { instant = true } = {}) => {
    const target = doc?.querySelector(`[data-hub-panel="${panelName}"]`);
    if (!target) return false;
    activePanel = target;
    closeActivePanel({ skipButtonSync: false, instant });
    return true;
  };

  const setupOrbitHotspots = (hub) => {
    const orbit = hub.querySelector('.hub-orbit');
    const buttons = orbit?.querySelectorAll('[data-orbit-pos]');
    if (!orbit || !buttons.length) return;

    const getBaseFactor = () =>
      global.matchMedia('(max-width: 640px)').matches ? 0.76 : 0.72;

    const setPositions = () => {
      const rect = orbit.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const baseRadius = (Math.min(rect.width, rect.height) / 2) * getBaseFactor();

      buttons.forEach((btn) => {
        const key = btn.dataset.orbitPos;
        const config = ORBIT_BUTTONS[key];
        if (!config) return;
        const angle = ((config.angle ?? 0) * Math.PI) / 180;
        const radius = baseRadius * (config.radiusScale ?? 1);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
      });
    };

    const debouncedUpdate = () => global.requestAnimationFrame(setPositions);
    const resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(orbit);
    global.addEventListener('resize', debouncedUpdate);
    setPositions();
  };

  const openPanel = (panelName) => {
    if (!doc) return null;
    const panel = doc.querySelector(`[data-hub-panel="${panelName}"]`);
    if (!panel) return null;
    diag.add?.(`[hub] openPanel ${panelName}`);
    if (activePanel === panel) return panel;
    if (activePanel) {
      closeActivePanel({ skipButtonSync: true });
    }
    panel.classList.remove('hub-panel-closing');
    if (panel._hubCloseTimer) {
      global.clearTimeout(panel._hubCloseTimer);
      panel._hubCloseTimer = null;
    }
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.removeAttribute('inert');
    panel.classList.add('is-visible');
    // force reflow before animation to ensure restart
    void panel.offsetWidth; // eslint-disable-line no-unused-expressions
    panel.classList.add('hub-panel-open');
    activePanel = panel;
    if (doc?.body) {
      doc.body.classList.add('hub-panel-active');
    }
    syncCarouselToPanel(panelName);
    doc.addEventListener('keydown', handlePanelEsc);
    if (panelName === 'intake') {
      const tabButtons = panel.querySelectorAll('[data-intake-tab]');
      const tabPanels = panel.querySelectorAll('[data-intake-panel]');
      if (tabButtons.length && tabPanels.length) {
        const activeTab = 'in';
        tabButtons.forEach((btn) => {
          const isActive = btn.getAttribute('data-intake-tab') === activeTab;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
        });
        tabPanels.forEach((tabPanel) => {
          const isActive = tabPanel.getAttribute('data-intake-panel') === activeTab;
          tabPanel.classList.toggle('is-active', isActive);
          if (isActive) {
            tabPanel.hidden = false;
            tabPanel.removeAttribute('aria-hidden');
          } else {
            tabPanel.hidden = true;
            tabPanel.setAttribute('aria-hidden', 'true');
          }
        });
      }
    }
    if (panelName === 'appointments') {
      const tabButtons = panel.querySelectorAll('[data-appointments-tab]');
      const tabPanels = panel.querySelectorAll('[data-appointments-panel]');
      if (tabButtons.length && tabPanels.length) {
        const activeTab = 'overview';
        tabButtons.forEach((btn) => {
          const isActive = btn.getAttribute('data-appointments-tab') === activeTab;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
        });
        tabPanels.forEach((tabPanel) => {
          const isActive = tabPanel.getAttribute('data-appointments-panel') === activeTab;
          tabPanel.classList.toggle('is-active', isActive);
          if (isActive) {
            tabPanel.hidden = false;
            tabPanel.removeAttribute('aria-hidden');
          } else {
            tabPanel.hidden = true;
            tabPanel.setAttribute('aria-hidden', 'true');
          }
        });
      }
    }
    if (typeof panel.scrollIntoView === 'function') {
      requestAnimationFrame(() => {
        panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    }
    return panel;
  };

  const setupQuickbar = (hub) => {
    const quickbar = hub.querySelector('.hub-quickbar');
    if (!quickbar) return;
    quickbarState.el = quickbar;
    quickbarState.hubEl = hub;
    syncQuickbarUi();
    bindVerticalRevealGestures(quickbar, {
      onSwipeDown: () => {
        if (quickbarState.open) closeQuickbar();
      },
    });
    const handle = hub.querySelector('[data-quickbar-handle]');
    quickbarState.handle = handle || null;
    if (handle) {
      handle.addEventListener('click', () => {
        toggleQuickbar();
      });
    }
    quickbar.querySelectorAll('[data-hub-module]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const moduleId = btn.dataset.hubModule;
        if (moduleId) {
          const target = hub.querySelector(`.hub-icon[data-carousel-id="${moduleId}"]`);
          if (target) {
            target.click();
          }
        }
        closeQuickbar();
      });
    });
    quickbar.querySelectorAll('[data-quickbar-action="diag"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const diagPanel =
          appModules.diag ||
          global.diag ||
          global.AppModules?.diagnostics?.diag ||
          null;
        if (diagPanel) {
          if (diagPanel.open && typeof diagPanel.hide === 'function') {
            diagPanel.hide();
          } else if (typeof diagPanel.show === 'function') {
            diagPanel.show();
          }
        }
        closeQuickbar();
      });
    });
  };

  const setupPanels = () => {
    const panels = doc?.querySelectorAll('[data-hub-panel]');
    if (!panels) return;
    panels.forEach((panel) => {
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
      const closeMode = panel.dataset.closeMode || '';
      panel.querySelectorAll('[data-panel-close]').forEach((btn) => {
        const mode = btn.dataset.closeMode || closeMode;
        btn.addEventListener('click', (event) => {
          event?.preventDefault();
          event?.stopPropagation();
          diag.add?.(
            `[hub] close button ${panel.dataset.hubPanel || 'unknown'} mode=${mode}`
          );
          closeActivePanel({ instant: mode === 'instant', intent: true });
        });
      });
    });
  };

  const ensureDoctorUnlocked = async () => {
    const supa = getSupabaseApi();
    const unlockFn = supa?.requireDoctorUnlock;
    if (typeof unlockFn !== 'function') {
      diag.add?.('[hub] doctor unlock bypassed (no guard fn)');
      return true;
    }
    try {
      diag.add?.('[hub] doctor unlock start');
      const ok = await unlockFn();
      diag.add?.(`[hub] doctor unlock result=${ok ? 'ok' : 'cancelled'}`);
      return !!ok;
    } catch (err) {
      console.warn('[hub] doctor unlock failed', err);
      diag.add?.('[hub] doctor unlock failed: ' + (err?.message || err));
      return false;
    }
  };

  const waitForDoctorUnlock = ({ guardState, timeout = 60000 } = {}) =>
    new Promise((resolve) => {
      const state = guardState || getSupabaseApi()?.authGuardState;
      diag.add?.(
        `[hub] waitForDoctorUnlock start timeout=${timeout} state=${state ? 'yes' : 'no'}`
      );
      if (!state) {
        diag.add?.('[hub] waitForDoctorUnlock aborted (no guardState)');
        resolve(false);
        return;
      }
      if (state.doctorUnlocked) {
        diag.add?.('[hub] waitForDoctorUnlock skip (already unlocked)');
        resolve(true);
        return;
      }
      const interval = 200;
      let elapsed = 0;
      if (doctorUnlockWaitCancel) {
        diag.add?.('[hub] waitForDoctorUnlock cancelling previous wait');
        doctorUnlockWaitCancel(false);
      }
      let finished = false;
      let timerId = null;
      let cancelFn;
      const cleanup = (result, reason = 'resolved') => {
        if (finished) return;
        finished = true;
        diag.add?.(
          `[hub] waitForDoctorUnlock finish reason=${reason} result=${result ? 'success' : 'fail'}`
        );
        if (timerId) {
          global.clearInterval(timerId);
          timerId = null;
        }
        if (doctorUnlockWaitCancel === cancelFn) {
          doctorUnlockWaitCancel = null;
        }
        resolve(result);
      };
      cancelFn = (result = false) => cleanup(result, 'manual-cancel');
      timerId = global.setInterval(() => {
        if (state.doctorUnlocked) {
          cleanup(true, 'state-change');
          return;
        }
        elapsed += interval;
        if (elapsed >= timeout) {
          cleanup(false, 'timeout');
        }
      }, interval);
      doctorUnlockWaitCancel = cancelFn;
    });

  const isBootReady = () => {
    const stage = (doc?.body?.dataset?.bootStage || '').toLowerCase();
    return stage === 'idle' || stage === 'init_ui';
  };

  const activateHubLayout = () => {
    const config = appModules.config || {};
    if (!doc) {
      global.console?.debug?.('[hub] document object missing');
      return;
    }
    if (typeof aura3dCleanup === 'function') {
      aura3dCleanup();
    }
    auraState.canvas = null;
    const hub = doc.getElementById('captureHub');
    if (!hub) {
      global.console?.debug?.('[hub] #captureHub element not found', { config });
      return;
    }
    initVoiceModule(hub);
    carouselState.showPassiveVoiceAnchor = !isAssistantSurfaceEnabled();
    syncAssistantTextSurface(hub);
    setupHubDashboard(hub);
    setupAssistantChat(hub);
    setupIconBar(hub);
    setupOrbitHotspots(hub);
    setupPanels();
    setupDatePill(hub);
    moveIntakePillsToHub();
    setupSpriteState(hub);
    setupCarouselController(hub);
    setupVoiceGateState(hub);
    setupQuickbar(hub);
    if (typeof assistantSurfaceUnsubscribe === 'function') {
      try { assistantSurfaceUnsubscribe(); } catch (_) {}
    }
    assistantSurfaceUnsubscribe = getAssistantSurfaceApi()?.subscribe?.(({ enabled }) => {
      diag.add?.(`[hub] assistant surface toggled enabled=${enabled ? 'true' : 'false'}`);
      carouselState.showPassiveVoiceAnchor = !enabled;
      syncAssistantTextSurface(hub);
      refreshCarouselItems(hub);
    }) || null;
    updateTickerBar({ reason: 'hub-init' });
    if (!trendpilotAuraBound) {
      trendpilotAuraBound = true;
      doc.addEventListener('trendpilot:latest', (event) => {
        applyTrendpilotAuraState(event?.detail?.entry || null);
      });
    }
    if (typeof appModules.trendpilot?.getLatestSystemComment === 'function') {
      applyTrendpilotAuraState(appModules.trendpilot.getLatestSystemComment());
    }
    if (aura3dApi?.initAura3D) {
      const auraCanvas = hub.querySelector('#hubAuraCanvas');
      if (auraCanvas) {
        const resizeHandler = () => aura3dApi.updateLayout?.();
        const initialized = aura3dApi.initAura3D(auraCanvas);
        if (initialized) {
          auraState.canvas = auraCanvas;
          global.addEventListener('resize', resizeHandler);
          aura3dCleanup = () => {
            global.removeEventListener('resize', resizeHandler);
            aura3dApi.disposeAura3D?.();
            aura3dCleanup = null;
            auraState.canvas = null;
          };
        }
      }
    }
    doc.body.classList.add('hub-mode');
    applyPanelPerformanceMode(panelPerfQuery?.matches);
    if (panelPerfQuery) {
      const perfListener = (event) => applyPanelPerformanceMode(event.matches);
      if (typeof panelPerfQuery.addEventListener === 'function') {
        panelPerfQuery.addEventListener('change', perfListener);
      } else if (typeof panelPerfQuery.addListener === 'function') {
        panelPerfQuery.addListener(perfListener);
      }
    }
  };

  const applyPanelPerformanceMode = (isMobile) => {
    if (!doc?.body) return;
    doc.body.dataset.panelPerf = isMobile ? 'mobile' : 'desktop';
    if (aura3dApi?.configureAura3D) {
      const opacityMultiplier = isMobile ? 1.6 : 1;
      aura3dApi.configureAura3D({ opacityMultiplier });
    }
  };

  const setupIconBar = (hub) => {
    hubButtons = Array.from(hub.querySelectorAll('.hub-icon:not([disabled])'));

    const bindButton = (selector, handler, { sync = true } = {}) => {
      const btn = hub.querySelector(selector);
      if (!btn) return;
      const invoke = async () => {
        if (!isBootReady()) return;
        if (sync) syncButtonState(btn);
        try {
          await handler(btn);
        } catch (err) {
          console.error('[hub] button handler failed', err);
          if (sync) syncButtonState(null);
        }
      };
      btn.addEventListener('click', () => {
        if (!isBootReady()) return;
        invoke();
      });
    };

    const openPanelHandler = (panelName) => async (btn) => {
      if (activePanel?.dataset?.hubPanel === panelName) {
        closeActivePanel({ intent: true });
        return;
      }
      const panel = openPanel(panelName);
      if (!panel) {
        syncButtonState(null);
        setSpriteStateFn?.('idle');
        return;
      }
      feedbackApi?.feedback?.('hub:open', { intent: true, source: 'user' });
      syncButtonState(btn);
      setSpriteStateFn?.(panelName);
    };

    bindButton('[data-hub-module="intake"]', openPanelHandler('intake'), { sync: false });
    bindButton('[data-hub-module="vitals"]', openPanelHandler('vitals'), { sync: false });
    bindButton(
      '[data-hub-module="appointments"]',
      async (btn) => {
        await openPanelHandler('appointments')(btn);
        try {
          await appModules.appointments?.sync?.({ reason: 'panel-open' });
        } catch (err) {
          diag.add?.(`[hub] appointments sync failed: ${err?.message || err}`);
        }
      },
      { sync: false },
    );
    bindButton(
      '[data-hub-module="profile"]',
      async (btn) => {
        await openPanelHandler('profile')(btn);
        try {
          await appModules.profile?.sync?.({ reason: 'panel-open' });
        } catch (err) {
          diag.add?.(`[hub] profile sync failed: ${err?.message || err}`);
        }
      },
      { sync: false },
    );
    const openAssistantPanel = async (btn) => {
      if (!isBootReady()) return;
      await openPanelHandler('assistant-text')(btn);
      if (activePanel?.dataset?.hubPanel !== 'assistant-text') return;
      refreshAssistantContext({ reason: 'assistant:panel-open' });
    };

    const bindAssistantButton = () => {
      const btn = hub.querySelector('[data-hub-module="assistant-text"]');
      if (!btn) return;
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        if (!isBootReady()) return;
        openAssistantPanel(btn);
      });
    };

    bindAssistantButton();
    // Chart uses a shortcut: no hub panel exists; open doctor panel and trigger chart button.
    bindButton(
      '[data-hub-module="chart"]',
      async (btn) => {
        await openDoctorPanel({ triggerButton: btn, startMode: 'chart' });
      },
      { sync: false },
    );
    const doctorPanelHandler = openPanelHandler('doctor');
    const openDoctorPanel = async ({ triggerButton = null, onOpened, startMode = 'list' } = {}) => {
      const openFlow = async () => {
        diag.add?.('[hub] openDoctorPanel openFlow start', { startMode });
        await doctorPanelHandler(triggerButton);
        if (startMode === 'chart') {
          const chartBtn = doc?.getElementById('doctorChartBtn');
          if (chartBtn) {
            chartBtn.click();
          } else {
            diag.add?.('[hub] doctor chart button missing for chart mode');
          }
        }
        if (typeof onOpened === 'function') {
          await onOpened();
        }
      };
      if (await ensureDoctorUnlocked()) {
        await openFlow();
        return true;
      }
      const supa = getSupabaseApi();
      const guardState = supa?.authGuardState;
      const unlockedAfter = await waitForDoctorUnlock({ guardState });
      if (unlockedAfter) {
        await openFlow();
        return true;
      }
      return false;
    };
    openDoctorPanelWithGuard = openDoctorPanel;
    const openDoctorInboxPanel = async ({ onOpened, from, to } = {}) => {
      const openFlow = async () => {
        diag.add?.('[hub] openDoctorInboxPanel openFlow start');
        const doctorApi = appModules.doctor;
        const renderer = doctorApi?.renderDoctorInboxOverlay;
        if (typeof renderer !== 'function') {
          diag.add?.('[hub] doctor inbox renderer missing');
          return;
        }
        await renderer({ from, to });
        if (typeof onOpened === 'function') {
          await onOpened();
        }
      };
      if (await ensureDoctorUnlocked()) {
        await openFlow();
        return true;
      }
      const supa = getSupabaseApi();
      const guardState = supa?.authGuardState;
      const unlockedAfter = await waitForDoctorUnlock({ guardState });
      if (unlockedAfter) {
        await openFlow();
        return true;
      }
      return false;
    };
    openDoctorInboxPanelWithGuard = openDoctorInboxPanel;
    bindButton(
      '[data-hub-module="doctor"]',
      async (btn) => {
        await openDoctorPanel({ triggerButton: btn });
      },
      { sync: false },
    );
  };
  const setupSpriteState = (hub) => {
    const orb = hub.querySelector('.hub-orb');
    const fg = hub.querySelector('.hub-orb-fg');
    if (!orb) return;
    const defaultImg = 'assets/img/Idle_state.png';
    const persistIdle = () => {
      if (fg) {
        fg.src = defaultImg;
        fg.alt = 'MIDAS Orb idle';
      }
      orb.dataset.state = 'idle';
      global.console?.debug?.('[hub] sprite state locked -> idle');
    };
    persistIdle();
    setSpriteStateFn = persistIdle;
    appModules.hub = Object.assign(appModules.hub || {}, { setSpriteState: persistIdle });
  };

  const setupDatePill = () => {
    const captureDate = doc?.getElementById('date');
    if (!captureDate) return;
    if (!captureDate.value) {
      captureDate.value = new Date().toISOString().slice(0, 10);
      captureDate.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const moveIntakePillsToHub = () => {
    const hub = doc?.querySelector('[data-role="hub-intake-pills"]');
    const captureApi = appModules.capture || {};
    if (typeof captureApi.prepareIntakeStatusHeader === 'function') {
      captureApi.prepareIntakeStatusHeader();
    }
    if (typeof captureApi.updateCaptureIntakeStatus === 'function') {
      captureApi.updateCaptureIntakeStatus();
    }
    const pills = doc?.getElementById('cap-intake-status-top');
    if (!hub) return;
    if (!pills) {
      setTimeout(moveIntakePillsToHub, 500);
      return;
    }
    hub.innerHTML = '';
    pills.classList.add('hub-intake-pills');
    hub.appendChild(pills);
  };

  const getCaptureFormatFn = () => {
    const fmt = appModules.capture?.fmtDE;
    if (typeof fmt === 'function') return fmt;
    return (value, digits = 1) => {
      const num = Number(value) || 0;
      return num.toFixed(digits).replace('.', ',');
    };
  };

  const isAssistantDesktop = () => !panelPerfQuery?.matches;

  const buildPillRef = (wrap, key) => {
    const root = wrap?.querySelector?.(`[data-pill="${key}"]`);
    if (!root) return null;
    const value = root.querySelector('[data-pill-value]');
    if (!value) return null;
    return { root, value };
  };

  const buildContextValueRef = (wrap, attr, key, valueAttr) => {
    if (!wrap) return null;
    const root = wrap.querySelector(`[data-${attr}="${key}"]`);
    if (!root) return null;
    const value = root.querySelector(`[data-${valueAttr}]`);
    if (!value) return null;
    return { root, value };
  };

  const updatePillRef = (pill, text, isActive) => {
    if (!pill) return;
    pill.value.textContent = text;
    if (isActive) pill.root.classList.remove('muted');
    else pill.root.classList.add('muted');
  };

  const updateAssistantPill = (key, text, isActive) => {
    updatePillRef(assistantChatCtrl?.pills?.[key], text, isActive);
    updatePillRef(hubDashboardCtrl?.pills?.[key], text, isActive);
  };

  const updateContextItem = (ref, text, { placeholder = null, keepVisible = false } = {}) => {
    if (!ref) return false;
    const resolved = text || (keepVisible ? placeholder : null);
    if (resolved) {
      ref.value.textContent = resolved;
      ref.root.removeAttribute('hidden');
      return true;
    }
    ref.root.setAttribute('hidden', 'true');
    return false;
  };

  const formatTargetRange = (min, max, unit) => {
    const fmt = getCaptureFormatFn();
    const minVal = Number.isFinite(Number(min)) ? Number(min) : null;
    const maxVal = Number.isFinite(Number(max)) ? Number(max) : null;
    if (minVal != null && maxVal != null) {
      return `${fmt(minVal, 0)}-${fmt(maxVal, 0)} ${unit}`;
    }
    if (maxVal != null) return `${fmt(maxVal, 0)} ${unit}`;
    if (minVal != null) return `${fmt(minVal, 0)} ${unit}`;
    return null;
  };

  const ASSISTANT_CONTEXT_LOADING_HINT = 'Aktualisiere...';

  const renderAssistantContextExtras = (profile) => {
    const proteinText =
      formatTargetRange(profile?.protein_target_min, profile?.protein_target_max, 'g') ||
      formatTargetRange(profile?.protein_target, null, 'g');
    const ckdStage = typeof profile?.ckd_stage === 'string' ? profile.ckd_stage.trim() : '';
    const renderInto = (refs, { keepVisible = false } = {}) => {
      if (!refs?.container) return;
      const isMissingProfile = !profile;
      let hasAny = false;
      if (
        updateContextItem(refs.proteinTarget, proteinText, {
          keepVisible,
          placeholder: isMissingProfile ? ASSISTANT_CONTEXT_LOADING_HINT : '-- g',
        })
      )
        hasAny = true;
      if (
        updateContextItem(refs.ckdStage, ckdStage || null, {
          keepVisible,
          placeholder: isMissingProfile ? ASSISTANT_CONTEXT_LOADING_HINT : '--',
        })
      )
        hasAny = true;
      refs.container.hidden = !hasAny;
    };
    const isMissingProfile = !profile;
    renderInto(assistantChatCtrl?.contextExtras, {
      keepVisible: isAssistantDesktop() || isMissingProfile,
    });
    renderInto(hubDashboardCtrl?.contextExtras, { keepVisible: true });
  };

  const renderAssistantContextExpandable = (snapshot, profile) => {
    const remainingText = formatAssistantRemainingText(snapshot, profile);
    const warningText = formatAssistantWarningText(snapshot, profile);
    const renderInto = (refs, { keepVisible = false, includeWarning = true } = {}) => {
      if (!refs?.container) return;
      const isMissingProfile = !profile;
      const hasRemaining = updateContextItem(refs.remaining, remainingText, {
        keepVisible,
        placeholder: isMissingProfile ? ASSISTANT_CONTEXT_LOADING_HINT : '--',
      });
      const hasWarning =
        refs.warning && includeWarning ? updateContextItem(refs.warning, warningText) : false;
      refs.container.hidden = !(hasRemaining || hasWarning);
    };
    const isMissingProfile = !profile;
    renderInto(assistantChatCtrl?.contextExpandable, {
      keepVisible: isAssistantDesktop() || isMissingProfile,
      includeWarning: true,
    });
    renderInto(hubDashboardCtrl?.contextExpandable, {
      keepVisible: true,
      includeWarning: false,
    });
  };

  const renderAssistantIntakeTotals = (snapshot) => {
    const logged = !!snapshot?.logged;
    const totals = snapshot?.totals || {};
    const fmt = getCaptureFormatFn();
    const waterText = logged ? `${Math.round(Number(totals.water_ml) || 0)} ml` : '-- ml';
    const saltText = logged ? `${fmt(totals.salt_g, 1)} g` : '-- g';
    const proteinText = logged ? `${fmt(totals.protein_g, 1)} g` : '-- g';
    updateAssistantPill('water', waterText, logged);
    updateAssistantPill('salt', saltText, logged);
    updateAssistantPill('protein', proteinText, logged);
  };

  const applyAssistantIntakeSnapshot = (snapshot, { profile = null } = {}) => {
    if (!snapshot?.totals) return false;
    const resolvedProfile = profile || getAssistantProfileSnapshot();
    renderAssistantIntakeTotals(snapshot);
    renderAssistantContextExpandable(snapshot, resolvedProfile);
    if (assistantChatCtrl?.context) {
      assistantChatCtrl.context = {
        ...assistantChatCtrl.context,
        intake: snapshot,
        profile: resolvedProfile || assistantChatCtrl.context.profile || null,
      };
    }
    if (hubDashboardCtrl?.context) {
      hubDashboardCtrl.context = {
        ...hubDashboardCtrl.context,
        intake: snapshot,
        profile: resolvedProfile || hubDashboardCtrl.context.profile || null,
      };
    }
    return true;
  };

  const renderAssistantAppointments = (items) => {
    const renderInto = (refs) => {
      if (!refs?.container) return;
      const hasItems = Array.isArray(items) && items.length > 0;
      if (refs.list) {
        if (hasItems) {
          refs.list.hidden = false;
          refs.list.innerHTML = items
            .map(
              (item) =>
                `<li><span>${item.label || ''}</span><span>${item.detail || ''}</span></li>`,
            )
            .join('');
        } else {
          refs.list.hidden = true;
          refs.list.innerHTML = '';
        }
      }
      if (refs.empty) {
        if (hasItems) refs.empty.setAttribute('hidden', 'true');
        else {
          refs.empty.removeAttribute('hidden');
          refs.empty.textContent = 'Keine Termine geladen.';
        }
      }
    };
    renderInto(assistantChatCtrl?.appointments);
    renderInto(hubDashboardCtrl?.appointments);
  };

  const APPOINTMENT_DATE_FORMAT = new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  });
  const APPOINTMENT_TIME_FORMAT = new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const ASSISTANT_COPY_DATE_FORMAT = new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const ASSISTANT_COPY_TIME_FORMAT = new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const ASSISTANT_COPY_ICON_SVG = `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M9 9.75a2.25 2.25 0 0 1 2.25-2.25h6A2.25 2.25 0 0 1 19.5 9.75v7.5a2.25 2.25 0 0 1-2.25 2.25h-6A2.25 2.25 0 0 1 9 17.25z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
      <path
        d="M6.75 15.75A2.25 2.25 0 0 1 4.5 13.5V6.75A2.25 2.25 0 0 1 6.75 4.5h6.75"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>`;

  const formatAppointmentDateTime = (value, { includeTime = true } = {}) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const dayLabel = APPOINTMENT_DATE_FORMAT.format(date).replace(/\.$/, '');
    if (!includeTime) return dayLabel;
    const timeLabel = APPOINTMENT_TIME_FORMAT.format(date);
    return `${dayLabel} - ${timeLabel}`;
  };

  const buildAssistantRemainingMetrics = (snapshot, profile) => {
    const totals = snapshot?.totals || {};
    const saltLimit = Number.isFinite(Number(profile?.salt_limit_g))
      ? Number(profile.salt_limit_g)
      : Number.isFinite(Number(profile?.salt_target_g))
        ? Number(profile.salt_target_g)
        : Number.isFinite(Number(profile?.salt_target))
          ? Number(profile.salt_target)
          : null;
    const proteinTarget = Number.isFinite(Number(profile?.protein_target_max))
      ? Number(profile.protein_target_max)
      : Number.isFinite(Number(profile?.protein_target))
        ? Number(profile.protein_target)
        : Number.isFinite(Number(profile?.protein_target_min))
          ? Number(profile.protein_target_min)
          : null;
    const saltTotal = Number(totals.salt_g) || 0;
    const proteinTotal = Number(totals.protein_g) || 0;
    const saltRemaining = saltLimit != null ? saltLimit - saltTotal : null;
    const proteinRemaining = proteinTarget != null ? proteinTarget - proteinTotal : null;
    return {
      saltRemaining,
      proteinRemaining,
    };
  };

  const formatAssistantRemainingText = (snapshot, profile) => {
    const fmt = getCaptureFormatFn();
    const { saltRemaining, proteinRemaining } = buildAssistantRemainingMetrics(snapshot, profile);
    const remainingParts = [];
    if (saltRemaining != null) {
      remainingParts.push(`Salz ${fmt(saltRemaining, 1)} g`);
    }
    if (proteinRemaining != null) {
      remainingParts.push(`Protein ${fmt(proteinRemaining, 1)} g`);
    }
    return remainingParts.length ? remainingParts.join(', ') : null;
  };

  const formatAssistantWarningText = (snapshot, profile) => {
    const { saltRemaining, proteinRemaining } = buildAssistantRemainingMetrics(snapshot, profile);
    let warningText = null;
    if (saltRemaining != null && saltRemaining < 0) {
      warningText = 'Salz Ã¼ber Limit';
    }
    if (proteinRemaining != null && proteinRemaining < 0) {
      warningText = warningText ? `${warningText}, Protein Ã¼ber Limit` : 'Protein Ã¼ber Limit';
    }
    return warningText;
  };

  const normalizeAppointmentItems = (items, limit = 2) => {
    if (!Array.isArray(items)) return [];
    const normalized = [];
    items.some((raw, index) => {
      if (!raw) return false;
      const id =
        raw.id ||
        raw.appointment_id ||
        raw.remote_id ||
        raw.slug ||
        `appt-${index}`;
      let label =
        raw.label ||
        raw.title ||
        raw.name ||
        raw.doctor ||
        raw.summary ||
        raw.type ||
        '';
            let detail =
        raw.detail ||
        raw.subtitle ||
        raw.when ||
        raw.dateLabel ||
        '';
      if (!detail && raw.start_at) {
        detail = formatAppointmentDateTime(raw.start_at);
      } else if (!detail && (raw.start || raw.date) && raw.time) {
        const dayLabel = formatAppointmentDateTime(raw.start || raw.date, { includeTime: false });
        detail = dayLabel ? `${dayLabel} - ${raw.time}` : `${raw.time}`;
      } else if (!detail && (raw.start || raw.date)) {
        detail = formatAppointmentDateTime(raw.start || raw.date, { includeTime: false });
      } else if (!detail && raw.day && raw.time) {
        detail = `${raw.day} - ${raw.time}`;
      } else if (!detail && raw.day) {
        detail = raw.day;
      }
      const startAt =
        raw.start_at ||
        raw.start ||
        raw.date ||
        raw.starts_at ||
        raw.startTime ||
        null;
      const note =
        raw.note ||
        raw.notes ||
        raw.description ||
        raw.detail ||
        raw.subtitle ||
        '';
      if (!label && detail) label = 'Termin';
      if (!label && !detail && !note && !startAt) return false;
      normalized.push({ id, label, detail, startAt, note });

      return normalized.length >= limit;
    });
    return normalized.slice(0, limit);
  };

  const fetchAssistantAppointments = async ({ limit = 2, reason } = {}) => {
    const provider = appModules.appointments;
    if (!provider) return [];
    const getter =
      typeof provider.getUpcoming === 'function'
        ? provider.getUpcoming
        : typeof provider.getUpcomingAppointments === 'function'
          ? provider.getUpcomingAppointments
          : null;
    if (!getter) return [];
    try {
      const result = await getter.call(provider, limit, { reason });
      return normalizeAppointmentItems(result, limit);
    } catch (err) {
      diag.add?.(`[assistant-context] appointments fetch failed: ${err?.message || err}`);
      return [];
    }
  };

  const loadAssistantIntakeSnapshot = async ({ reason, forceRefresh = false } = {}) => {
    const captureApi = appModules.capture || {};
    let snapshot = null;
    if (typeof captureApi.fetchTodayIntakeTotals === 'function') {
      try {
        snapshot = await captureApi.fetchTodayIntakeTotals({
          reason,
          forceRefresh,
        });
      } catch (err) {
        diag.add?.(
          `[assistant-context] intake fetch failed: ${err?.message || err}`,
        );
      }
    }
    if (!snapshot && typeof captureApi.getCaptureIntakeSnapshot === 'function') {
      snapshot = captureApi.getCaptureIntakeSnapshot();
    }
    if (!snapshot && global.AppModules?.captureGlobals?.captureIntakeState) {
      const state = global.AppModules.captureGlobals.captureIntakeState;
      snapshot = {
        dayIso: state.dayIso,
        logged: !!state.logged,
        totals: {
          water_ml: Number(state.totals?.water_ml) || 0,
          salt_g: Number(state.totals?.salt_g) || 0,
          protein_g: Number(state.totals?.protein_g) || 0,
        },
      };
      }
      return snapshot;
    };

    let assistantProfileSyncInFlight = false;

    const requestAssistantProfileSync = async ({ reason } = {}) => {
      if (assistantProfileSyncInFlight) return;
      const profileApi = appModules.profile;
      if (!profileApi?.sync) return;
      assistantProfileSyncInFlight = true;
      try {
        await profileApi.sync({ reason: reason || 'assistant:lazy-refresh' });
      } catch (err) {
        diag.add?.(`[assistant-context] profile sync failed: ${err?.message || err}`);
      } finally {
        assistantProfileSyncInFlight = false;
      }
    };

    const getAssistantProfileSnapshot = ({ force = false } = {}) => {
      if (!force && assistantProfileSnapshot) return assistantProfileSnapshot;
      const data = appModules.profile?.getData?.();
      if (data) {
        assistantProfileSnapshot = data;
        return assistantProfileSnapshot;
      }
      return null;
    };

    const refreshAssistantContext = async ({ reason, forceRefresh = false } = {}) => {
      if (!assistantChatCtrl?.panel && !hubDashboardCtrl?.root) return;
      const profileSnapshot = getAssistantProfileSnapshot({ force: forceRefresh });
      if (!profileSnapshot) {
        requestAssistantProfileSync({ reason: reason || 'assistant:lazy-refresh' });
      }
      const [snapshot, appointments] = await Promise.all([
        loadAssistantIntakeSnapshot({ reason, forceRefresh }),
        fetchAssistantAppointments({ limit: 2, reason }),
      ]);
      renderAssistantIntakeTotals(snapshot);
      renderAssistantAppointments(appointments);
      const contextPayload = {
        intake: snapshot || null,
        appointments: Array.isArray(appointments) ? appointments : [],
        profile: getAssistantProfileSnapshot(),
      };
      renderAssistantContextExtras(contextPayload.profile);
      renderAssistantContextExpandable(snapshot, contextPayload.profile);
      if (assistantChatCtrl) {
        assistantChatCtrl.context = contextPayload;
      }
      if (hubDashboardCtrl) {
        hubDashboardCtrl.context = contextPayload;
      }
      const suggestStore = getAssistantSuggestStore();
      suggestStore?.setSnapshot?.(
        {
          ...contextPayload,
          updatedAt: Date.now(),
        },
        { reason: reason || 'refresh' },
      );
    };

  let assistantChatSetupAttempts = 0;
  const ASSISTANT_CHAT_MAX_ATTEMPTS = 10;
  const ASSISTANT_CHAT_RETRY_DELAY = 250;
  const debugLog = (msg, payload) => {
    if (!HUB_DEBUG_ENABLED) return;
    diag.add?.(`[hub:debug] ${msg}` + (payload ? ` ${JSON.stringify(payload)}` : ''));
  };

  const setupHubDashboard = (hub) => {
    const root = hub?.querySelector?.('#hubContextDashboard');
    if (!root) return;
    if (hubDashboardCtrl?.root === root) return;
    dashboardState.el = root;
    dashboardState.hubEl = hub;
    syncDashboardUi();
    const pillsWrap = root.querySelector('#hubDashboardIntakePills');
    const contextExtras = root.querySelector('.hub-dashboard-grid');
    const contextExpandable = root.querySelector('#hubDashboardExpandable');
    const appointmentsContainer = root.querySelector('#hubDashboardAppointments');
    const appointmentsList = root.querySelector('#hubDashboardAppointmentsList');
    const appointmentsEmpty = appointmentsContainer?.querySelector('[data-appointments-empty]');
    const copyBtn = root.querySelector('#hubDashboardCopySnapshot');
    const copyBtnIcon = copyBtn?.querySelector('[data-copy-icon]') || null;
    const closeBtn = root.querySelector('#hubDashboardClose');
    hubDashboardCtrl = {
      root,
      copyBtn,
      copyBtnIcon,
      closeBtn,
      pills: {
        water: buildPillRef(pillsWrap, 'water'),
        salt: buildPillRef(pillsWrap, 'salt'),
        protein: buildPillRef(pillsWrap, 'protein'),
      },
      contextExtras: {
        container: contextExtras,
        proteinTarget: buildContextValueRef(contextExtras, 'extra', 'protein-target', 'extra-value'),
        ckdStage: buildContextValueRef(contextExtras, 'extra', 'ckd-stage', 'extra-value'),
      },
      contextExpandable: {
        container: contextExpandable,
        remaining: buildContextValueRef(contextExpandable, 'expandable', 'remaining', 'expandable-value'),
        warning: null,
      },
      appointments: {
        container: appointmentsContainer,
        list: appointmentsList,
        empty: appointmentsEmpty,
      },
    };
    copyBtn?.addEventListener('click', handleAssistantSnapshotCopy);
    closeBtn?.addEventListener('click', (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      closeDashboard();
    });
    bindVerticalRevealGestures(root, {
      onSwipeUp: () => {
        if (dashboardState.open) closeDashboard();
      },
    });
    if (!dashboardIntakeRefreshBound) {
      dashboardIntakeRefreshBound = true;
      doc?.addEventListener('capture:intake-changed', (event) => {
        const intakeSnapshot = event?.detail
          ? {
              dayIso: event.detail.dayIso || null,
              logged: event.detail.logged !== false,
              totals: event.detail.totals || null,
            }
          : null;
        applyAssistantIntakeSnapshot(intakeSnapshot);
        refreshAssistantContext({
          reason: 'capture:intake-changed',
          forceRefresh: false,
        })?.catch?.((err) => {
          diag.add?.('[hub-dashboard] intake context refresh err: ' + (err?.message || err));
        });
      });
    }
    setAssistantCopyButtonState('idle');
  };

  const setupAssistantChat = (hub) => {
    debugLog('assistant-chat setup');
    if (assistantChatCtrl) {
      debugLog('assistant-chat controller already initialised');
      return;
    }
    const panel = doc?.getElementById('hubAssistantPanel');
    if (!panel) {
      assistantChatSetupAttempts += 1;
      if (assistantChatSetupAttempts === 1) {
        debugLog('assistant-chat panel missing, retrying');
      }
      if (assistantChatSetupAttempts < ASSISTANT_CHAT_MAX_ATTEMPTS) {
        global.setTimeout(() => setupAssistantChat(hub), ASSISTANT_CHAT_RETRY_DELAY);
      } else {
        diag.add?.('[assistant-chat] panel missing nach wiederholten Versuchen');
      }
      return;
    }
    assistantChatSetupAttempts = 0;
    debugLog('assistant-chat panel found');
    const chatEl = panel.querySelector('#assistantChat');
    const form = panel.querySelector('#assistantChatForm');
    const input = panel.querySelector('#assistantMessage');
    const sendBtn = panel.querySelector('#assistantSendBtn');
    const cameraBtn = panel.querySelector('#assistantCameraBtn');
    const clearBtn = panel.querySelector('#assistantClearChat');
    const copyBtn = panel.querySelector('#assistantCopySnapshot');
    const copyBtnIcon = copyBtn?.querySelector('[data-copy-icon]') || null;
    const messageTemplate = panel.querySelector('#assistantMessageTemplate');
    const photoTemplate = panel.querySelector('#assistantPhotoTemplate');
    const contextSection = panel.querySelector('.assistant-context');
    const contextToggle = panel.querySelector('#assistantContextToggle');
    const pillsWrap = panel.querySelector('#assistantIntakePills');
    const contextExtras = panel.querySelector('#assistantContextExtras');
    const contextExpandable = panel.querySelector('#assistantContextExpandable');
    const appointmentsContainer = panel.querySelector('#assistantAppointments');
    const appointmentsList = panel.querySelector('#assistantAppointmentsList');
    const appointmentsEmpty = appointmentsContainer?.querySelector('[data-appointments-empty]');

    const photoInput = doc.createElement('input');
    photoInput.type = 'file';
    photoInput.accept = 'image/*';
    photoInput.hidden = true;
    panel.appendChild(photoInput);

    if (messageTemplate) messageTemplate.remove();
    if (photoTemplate) photoTemplate.remove();

    const createAssistantPhotoDraftUi = () => {
      if (!form) return null;
      const wrap = doc.createElement('div');
      wrap.className = 'assistant-photo-draft';
      wrap.hidden = true;

      const thumb = doc.createElement('img');
      thumb.alt = 'AusgewÃ¤hltes Foto';
      thumb.loading = 'lazy';

      const meta = doc.createElement('div');
      meta.className = 'assistant-photo-draft-meta';
      const title = doc.createElement('span');
      title.className = 'assistant-photo-draft-title';
      title.textContent = 'Foto bereit';
      const status = doc.createElement('span');
      status.className = 'assistant-photo-draft-status';
      status.textContent = 'Bereit zum Senden';
      meta.appendChild(title);
      meta.appendChild(status);

      const actions = doc.createElement('div');
      actions.className = 'assistant-photo-draft-actions';
      const clearBtn = doc.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'assistant-photo-draft-clear';
      clearBtn.textContent = 'Entfernen';
      actions.appendChild(clearBtn);

      wrap.appendChild(thumb);
      wrap.appendChild(meta);
      wrap.appendChild(actions);
      form.prepend(wrap);

      return { wrap, thumb, status, clearBtn };
    };

    const photoDraftUi = createAssistantPhotoDraftUi();

    assistantChatCtrl = {
      panel,
      chatEl,
      form,
      input,
      sendBtn,
      cameraBtn,
      clearBtn,
      copyBtn,
      copyBtnIcon,
      photoInput,
      photoDraft: null,
      photoDraftUi,
      contextSection,
      contextToggle,
      contextExpanded: false,
      pills: {
        water: buildPillRef(pillsWrap, 'water'),
        salt: buildPillRef(pillsWrap, 'salt'),
        protein: buildPillRef(pillsWrap, 'protein'),
      },
      contextExtras: {
        container: contextExtras,
        proteinTarget: buildContextValueRef(contextExtras, 'extra', 'protein-target', 'extra-value'),
        ckdStage: buildContextValueRef(contextExtras, 'extra', 'ckd-stage', 'extra-value'),
      },
      contextExpandable: {
        container: contextExpandable,
        remaining: buildContextValueRef(contextExpandable, 'expandable', 'remaining', 'expandable-value'),
        warning: buildContextValueRef(contextExpandable, 'expandable', 'warning', 'expandable-value'),
      },
      appointments: {
        container: appointmentsContainer,
        list: appointmentsList,
        empty: appointmentsEmpty,
      },
        templates: {
          message: messageTemplate?.content?.firstElementChild || null,
          photo: photoTemplate?.content?.firstElementChild || null,
        },
        messages: [],
        sessionId: null,
        sending: false,
        pendingIntentContext: null,
        pendingIntentMeta: null,
        pendingIntentLocks: {
          inFlight: new Set(),
          consumed: new Map(),
        },
        context: {
          intake: null,
          appointments: [],
          profile: getAssistantProfileSnapshot(),
        },
      };

    setAssistantCopyButtonState('idle');

    const setAssistantContextExpanded = (expanded) => {
      if (!assistantChatCtrl?.contextSection) return;
      assistantChatCtrl.contextExpanded = !!expanded;
      assistantChatCtrl.contextSection.classList.toggle(
        'assistant-context-expanded',
        assistantChatCtrl.contextExpanded,
      );
      if (assistantChatCtrl.contextToggle) {
        assistantChatCtrl.contextToggle.setAttribute(
          'aria-expanded',
          assistantChatCtrl.contextExpanded ? 'true' : 'false',
        );
        assistantChatCtrl.contextToggle.textContent =
          assistantChatCtrl.contextExpanded ? 'Weniger' : 'Mehr';
      }
    };

    if (assistantChatCtrl.contextToggle && assistantChatCtrl.contextSection) {
      assistantChatCtrl.contextToggle.addEventListener('click', () => {
        setAssistantContextExpanded(!assistantChatCtrl.contextExpanded);
      });
      setAssistantContextExpanded(false);
    }

    if (photoDraftUi?.clearBtn) {
      photoDraftUi.clearBtn.addEventListener('click', () => clearAssistantPhotoDraft());
    }

    debugLog('assistant-chat controller ready');

    form?.addEventListener(
      'submit',
      (event) => {
        debugLog('assistant-chat form submit');
      },
      true,
    );
    sendBtn?.addEventListener('click', () => {
      debugLog('assistant-chat send button click');
    });

    chatEl?.addEventListener('click', handleAssistantChatClick);
    form?.addEventListener('submit', handleAssistantChatSubmit);
    clearBtn?.addEventListener('click', () => resetAssistantChat(true));
    copyBtn?.addEventListener('click', handleAssistantSnapshotCopy);
    photoInput.addEventListener('change', handleAssistantPhotoSelected, false);
    bindAssistantCameraButton(cameraBtn, photoInput);
    resetAssistantChat();
    debugLog('assistant-chat setup complete');
    refreshAssistantContext({ reason: 'assistant:init', forceRefresh: false });

    doc?.addEventListener('appointments:changed', () => {
      refreshAssistantContext({ reason: 'appointments:changed', forceRefresh: true });
      updateTickerBar({ reason: 'appointments:changed' });
    });
    doc?.addEventListener('profile:changed', (event) => {
      const detail = event?.detail || {};
      assistantProfileSnapshot = detail.data || null;
      refreshAssistantContext({ reason: 'profile:changed', forceRefresh: true });
    });
      const runAllowedAction = async (type, payload = {}, { source } = {}) => {
        const allowedActions = global.AppModules?.assistantAllowedActions;
        const executeAction = allowedActions?.executeAllowedAction;
        if (typeof executeAction !== 'function') {
          diag.add?.('[assistant-actions] allowed helper missing');
          return false;
        }
        const ok = await executeAction(type, payload, {
          getSupabaseApi: () => appModules.supabase,
          notify: (msg, level) =>
            diag.add?.(`[assistant-actions][${level || 'info'}] ${msg}`),
          source: source || 'hub',
        });
        if (!ok) {
          diag.add?.(
            `[assistant-actions] action failed type=${type} source=${source || 'unknown'}`,
          );
        } else {
          if (appModules.touchlog?.add) {
            appModules.touchlog.add(
              `[assistant-actions] success action=${type} source=${source || 'hub'}`,
            );
          }
          global.dispatchEvent(
            new CustomEvent('assistant:action-success', {
              detail: { type, payload, source: source || 'hub' },
            }),
          );
        }
        return ok;
      };

      const runUiSafeAction = async (type, payload = {}, { source } = {}) => {
        const allowedActions = global.AppModules?.assistantAllowedActions;
        const executeAction = allowedActions?.executeUiSafeAllowedAction;
        if (typeof executeAction !== 'function') {
          diag.add?.('[assistant-actions] ui-safe helper missing');
          return false;
        }
        const ok = await executeAction(type, payload, {
          notify: (msg, level) =>
            diag.add?.(`[assistant-actions][${level || 'info'}] ${msg}`),
          source: source || 'hub',
        });
        if (!ok) {
          diag.add?.(
            `[assistant-actions] ui-safe action failed type=${type} source=${source || 'unknown'}`,
          );
        } else {
          if (appModules.touchlog?.add) {
            appModules.touchlog.add(
              `[assistant-actions] success action=${type} source=${source || 'hub'} mode=ui-safe`,
            );
          }
          global.dispatchEvent(
            new CustomEvent('assistant:action-success', {
              detail: { type, payload, source: source || 'hub' },
            }),
          );
        }
        return ok;
      };

      let suggestionConfirmInFlight = false;

      const handleSuggestionConfirmRequest = async (suggestion) => {
        if (!suggestion) return { ok: false, reason: 'missing-suggestion' };
        if (suggestionConfirmInFlight) {
          diag.add?.('[assistant-suggest] confirm ignored (busy)');
          return { ok: false, reason: 'busy' };
        }
        suggestionConfirmInFlight = true;
        try {
          const metrics = suggestion.metrics || {};
          const payload = {
            water_ml: Number.isFinite(metrics.water_ml)
              ? Number(metrics.water_ml)
              : undefined,
            salt_g: Number.isFinite(metrics.salt_g)
              ? Number(metrics.salt_g)
              : undefined,
            protein_g: Number.isFinite(metrics.protein_g)
              ? Number(metrics.protein_g)
              : undefined,
            label: suggestion.title || 'Mahlzeit',
            note: suggestion.recommendation || null,
          };
          diag.add?.('[assistant-suggest] confirm flow start');
          const ok = await runAllowedAction('intake_save', payload, {
            source: 'suggestion-card',
          });
          if (!ok) {
            appendAssistantMessage(
              'system',
              'Es gab ein Problem beim Speichern des Vorschlags.',
            );
            global.dispatchEvent(
              new CustomEvent('assistant:suggest-confirm-reset', {
                detail: { suggestionId: suggestion.id },
              }),
            );
            return { ok: false, reason: 'save-failed' };
          }
          const store = getAssistantSuggestStore();
          store?.dismissCurrent?.({ reason: 'confirm-success' });
          appendAssistantMessage(
            'assistant',
            buildSuggestionConfirmMessage(payload),
          );
          const savedAt = Date.now();
          const snapshot = buildAssistantContextPayload({ includeTimeSlot: true });
          const followupKey = buildMealFollowupKey({
            payload,
            sessionId: assistantChatCtrl?.sessionId,
            savedAt,
          });
          await refreshAssistantContext({
            reason: 'suggest:confirmed',
            forceRefresh: true,
          });
          renderSuggestionFollowupAdvice(suggestion);
          createMealFollowupPrompt({
            source: 'suggestion-card',
            snapshot,
            followupKey,
            savedAt,
          });
          return {
            ok: true,
            reason: null,
            savedAt,
            followupKey,
          };
        } finally {
          suggestionConfirmInFlight = false;
        }
      };

      const buildSuggestionConfirmMessage = (payload) => {
        const parts = [];
        if (Number.isFinite(payload.water_ml) && payload.water_ml > 0) {
          parts.push(`${payload.water_ml.toFixed(0)} ml Wasser`);
        }
        if (Number.isFinite(payload.salt_g)) {
          parts.push(`${payload.salt_g.toFixed(1)} g Salz`);
        }
        if (Number.isFinite(payload.protein_g)) {
          parts.push(`${payload.protein_g.toFixed(1)} g Protein`);
        }
        const list = parts.length ? parts.join(', ') : 'deine Werte';
        return `Alles klar - ich habe ${list} fÃ¼r heute vorgemerkt.`;
      };

      const renderSuggestionFollowupAdvice = (suggestion) => {
        const store = getAssistantSuggestStore();
        const snapshot =
          store?.getState?.().snapshot || assistantChatCtrl?.context || null;
        if (!snapshot) return;
        const planner = global.AppModules?.assistantDayPlan;
        const generator = planner?.generateDayPlan;
        if (typeof generator !== 'function') return;
        const { lines } = generator(
          { ...snapshot, suggestion },
          {
            dateFormatter: (date) => formatAppointmentDateTime(date.toISOString?.() || date),
          },
        );
        if (lines?.length) {
          appendAssistantMessage('assistant', lines.join(' '));
        }
      };
      let mealFollowupPromptActive = false;
      let mealFollowupLastTriggeredAt = 0;
      let mealFollowupMessageId = null;
      let mealFollowupSnapshot = null;
      let mealFollowupMeta = null;
      let mealFollowupRequestInFlight = false;
      const mealFollowupSeenKeys = new Set();

      const setMealFollowupSnapshot = (snapshot) => {
        mealFollowupSnapshot = snapshot || null;
      };

      const setMealFollowupMeta = (meta) => {
        mealFollowupMeta = meta || null;
      };

      const buildMealFollowupKey = ({ payload, sessionId, savedAt } = {}) => {
        const saveId = payload?.save_id || payload?.saveId || payload?.id || null;
        if (saveId) return `save:${saveId}`;
        const sessionKey = payload?.session_id || payload?.sessionId || sessionId || 'unknown';
        const stamp = payload?.saved_at || payload?.savedAt || savedAt || Date.now();
        return `session:${sessionKey}:${stamp}`;
      };

      const removeAssistantMessage = (messageId) => {
        if (!assistantChatCtrl || !messageId) return;
        const nextMessages = assistantChatCtrl.messages.filter(
          (msg) => msg.id !== messageId,
        );
        if (nextMessages.length === assistantChatCtrl.messages.length) return;
        assistantChatCtrl.messages = nextMessages;
        renderAssistantChat();
      };

      const createMealFollowupPrompt = ({ source, snapshot, followupKey, savedAt } = {}) => {
        if (!assistantChatCtrl) return;
        if (mealFollowupPromptActive) return;
        const now = Date.now();
        if (now - mealFollowupLastTriggeredAt < 500) return;
        const hasFollowup = assistantChatCtrl.messages.some(
          (msg) => msg.type === 'followup',
        );
        if (hasFollowup) return;
        const resolvedKey = followupKey || null;
        if (resolvedKey && mealFollowupSeenKeys.has(resolvedKey)) return;
        mealFollowupPromptActive = true;
        mealFollowupLastTriggeredAt = now;
        setMealFollowupSnapshot(snapshot || buildAssistantContextPayload({ includeTimeSlot: true }));
        const metaSavedAt = savedAt || Date.now();
        if (resolvedKey) {
          mealFollowupSeenKeys.add(resolvedKey);
        }
        setMealFollowupMeta({
          followupKey: resolvedKey,
          savedAt: metaSavedAt,
          source: source || 'intake-save',
        });
        const promptText =
          'Soll ich dir basierend auf deinen heutigen Werten und dem nÃ¤chsten Termin einen Essensvorschlag machen?';
        const message = appendAssistantMessage('assistant', promptText, {
          type: 'followup',
          meta: {
            followupType: 'meal-idea',
            source: source || 'intake-save',
            followupKey: followupKey || null,
            savedAt: savedAt || null,
            followupVersion: 1,
          },
        });
        mealFollowupMessageId = message?.id || null;
      };

      const clearMealFollowupPrompt = () => {
        if (mealFollowupMessageId) {
          removeAssistantMessage(mealFollowupMessageId);
        }
        mealFollowupMessageId = null;
        mealFollowupPromptActive = false;
        setMealFollowupSnapshot(null);
        setMealFollowupMeta(null);
      };
      assistantChatCtrl.followup = {
        clearPrompt: clearMealFollowupPrompt,
        getSnapshot: () => mealFollowupSnapshot,
        getMeta: () => mealFollowupMeta,
      };

      const buildMealFollowupPromptText = (detail = {}) => {
        const payload = {
          followup_key: detail.followup_key || null,
          saved_at: detail.saved_at || null,
          context: detail.context || null,
          meta: detail.meta || { followup_version: 1 },
        };
        const payloadJson = JSON.stringify(payload);
        return [
          'System: Du bist ein hilfreicher ErnÃ¤hrungsassistent fuer kurze Essensideen.',
          'System: Nutze nur den bereitgestellten Context-Snapshot. Keine medizinischen Aussagen.',
          'User: Erstelle einen kurzen Essensvorschlag basierend auf dem Follow-up Payload.',
          'Constraints:',
          '- 1-2 kurze VorschlÃ¤ge, insgesamt 2-4 Saetze.',
          '- Nutze Intake-Totals (Salz/Protein/Wasser) zum Ausbalancieren.',
          '- BerÃ¼cksichtige appointment_type und time_slot wenn vorhanden.',
          '- Ton: praktisch, freundlich, knapp.',
          '- Keine medizinischen Claims, Diagnosen oder Therapiehinweise.',
          'Follow-up payload:',
          payloadJson,
        ].join('\n');
      };

      const requestMealFollowupSuggestion = async (detail) => {
        if (!detail || !detail.context) return;
        if (mealFollowupRequestInFlight) return;
        mealFollowupRequestInFlight = true;
        try {
          const promptText = buildMealFollowupPromptText(detail);
          const payload = {
            session_id: assistantChatCtrl?.sessionId || `followup-${Date.now()}`,
            mode: 'text',
            text: promptText,
            messages: [{ role: 'user', content: promptText }],
            context: detail.context || null,
            meta: {
              followup_key: detail.followup_key || null,
              saved_at: detail.saved_at || null,
              followup_version: detail.meta?.followup_version || 1,
            },
          };
          const headers = await buildFunctionJsonHeaders();
          const response = await fetch(MIDAS_ENDPOINTS.assistant, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });
          if (!response.ok) return;
          const data = await response.json().catch(() => ({}));
          const reply = (data?.reply || '').trim();
          if (reply) {
            appendAssistantMessage('assistant', reply);
          }
        } catch (_) {
          // silent skip on failure
        } finally {
          mealFollowupRequestInFlight = false;
        }
      };

      global.addEventListener('assistant:meal-followup-request', (event) => {
        requestMealFollowupSuggestion(event?.detail);
      });

    doc?.addEventListener('profile:changed', (event) => {
      assistantProfileSnapshot =
        event?.detail?.data || appModules.profile?.getData?.() || null;
        if (assistantChatCtrl?.context) {
          assistantChatCtrl.context.profile = assistantProfileSnapshot;
        }
        const currentIntake = assistantChatCtrl?.context?.intake || null;
        renderAssistantContextExtras(assistantProfileSnapshot);
        renderAssistantContextExpandable(currentIntake, assistantProfileSnapshot);
        const store = getAssistantSuggestStore();
        if (store && assistantChatCtrl?.context) {
          store.setSnapshot(
            { ...assistantChatCtrl.context, updatedAt: Date.now() },
            { reason: 'profile:changed' },
          );
        }
      });
      global.addEventListener('assistant:suggest-confirm', (event) => {
        const suggestion = event?.detail?.suggestion;
        if (!suggestion) return;
        diag.add?.(
          `[assistant-suggest] confirm requested source=${suggestion.source || 'unknown'}`,
        );
        handleSuggestionConfirmRequest(suggestion);
      });
      global.addEventListener('assistant:suggest-answer', (event) => {
        if (event?.detail?.accepted) return;
        diag.add?.('[assistant-suggest] user dismissed suggestion');
      });
      global.addEventListener('assistant:suggest-updated', () => {
        syncAssistantPendingIntentFromSuggestion();
      });
      global.addEventListener('assistant:suggest-dismissed', () => {
        clearAssistantPendingIntentContext('suggestion-dismissed');
      });
      global.addEventListener('assistant:action-request', (event) => {
        const type = event?.detail?.type;
        if (!type) return;
        const payload = event.detail.payload || {};
        const source = event.detail.source || 'event';
        diag.add?.(`[assistant-actions] request type=${type} source=${source}`);
        runAllowedAction(type, payload, { source });
      });

      global.addEventListener('assistant:action-success', (event) => {
        if (event?.detail?.type !== 'intake_save') return;
        const detailSource = event?.detail?.source || 'unknown';
        if (detailSource === 'suggestion-card') return;
        const payload = event?.detail?.payload || {};
        const savedAt = payload.saved_at || payload.savedAt || Date.now();
        global.AppModules?.capture?.refreshCaptureIntake?.({
          reason: `assistant:${detailSource}:intake-save`,
          forceRefresh: true,
        })?.catch?.((err) => {
          diag.add?.('[assistant-actions] intake refresh err: ' + (err?.message || err));
        });
        global.setTimeout(() => {
          refreshAssistantContext({
            reason: `assistant:${detailSource}:intake-save`,
            forceRefresh: true,
          })?.catch?.((err) => {
            diag.add?.('[assistant-actions] assistant context refresh err: ' + (err?.message || err));
          });
        }, 0);
        const snapshot = buildAssistantContextPayload({ includeTimeSlot: true });
        const followupKey = buildMealFollowupKey({
          payload,
          sessionId: assistantChatCtrl?.sessionId,
          savedAt,
        });
        global.setTimeout(() => {
          createMealFollowupPrompt({
            source: detailSource,
            snapshot,
            followupKey,
            savedAt,
          });
        }, 0);
      });
      syncAssistantPendingIntentFromSuggestion();
    };

  const bindAssistantCameraButton = (btn, input) => {
    if (!btn || !input) return;
    const LONG_PRESS_MS = 650;
    let pressTimer = null;
    let longPressTriggered = false;

    const resetTimer = () => {
      if (pressTimer) {
        global.clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    const openSelector = ({ capture }) => {
      input.value = '';
      if (capture) {
        input.setAttribute('capture', capture);
      } else {
        input.removeAttribute('capture');
      }
      input.click();
    };

    const handlePointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      longPressTriggered = false;
      resetTimer();
      pressTimer = global.setTimeout(() => {
        longPressTriggered = true;
        openSelector({ capture: null });
      }, LONG_PRESS_MS);
    };

    const handlePointerUp = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (!pressTimer) return;
      resetTimer();
      if (!longPressTriggered) {
        openSelector({ capture: 'environment' });
      }
    };

    const cancelPress = () => {
      resetTimer();
    };

    btn.addEventListener('pointerdown', handlePointerDown);
    btn.addEventListener('pointerup', handlePointerUp);
    btn.addEventListener('pointerleave', cancelPress);
    btn.addEventListener('pointercancel', cancelPress);
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  };

  const updateAssistantPhotoDraftUi = () => {
    if (!assistantChatCtrl?.photoDraftUi?.wrap) return;
    const draft = assistantChatCtrl.photoDraft;
    if (!draft) {
      assistantChatCtrl.photoDraftUi.wrap.hidden = true;
      return;
    }
    assistantChatCtrl.photoDraftUi.wrap.hidden = false;
    if (assistantChatCtrl.photoDraftUi.thumb) {
      assistantChatCtrl.photoDraftUi.thumb.src = draft.dataUrl || '';
    }
    if (assistantChatCtrl.photoDraftUi.status) {
      assistantChatCtrl.photoDraftUi.status.textContent =
        draft.status || 'Bereit zum Senden';
    }
    if (assistantChatCtrl.photoDraftUi.wrap) {
      assistantChatCtrl.photoDraftUi.wrap.setAttribute(
        'data-file-name',
        draft.fileName || '',
      );
    }
    const titleEl = assistantChatCtrl.photoDraftUi.wrap.querySelector(
      '.assistant-photo-draft-title',
    );
    if (titleEl) {
      titleEl.textContent = draft.fileName
        ? `Foto: ${draft.fileName}`
        : 'Foto bereit';
    }
  };

  const setAssistantPhotoDraft = (dataUrl, file) => {
    if (!assistantChatCtrl) return;
    assistantChatCtrl.photoDraft = {
      dataUrl,
      fileName: file?.name || '',
      file: file || null,
      status: 'Bereit zum Senden',
    };
    updateAssistantPhotoDraftUi();
  };

  const clearAssistantPhotoDraft = () => {
    if (!assistantChatCtrl) return;
    assistantChatCtrl.photoDraft = null;
    if (assistantChatCtrl.photoInput) {
      assistantChatCtrl.photoInput.value = '';
    }
    updateAssistantPhotoDraftUi();
  };

  const handleAssistantPhotoSelected = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    if (file.size > MAX_ASSISTANT_PHOTO_BYTES) {
      const maxMb = (MAX_ASSISTANT_PHOTO_BYTES / (1024 * 1024)).toFixed(1);
      diag.add?.(
        `[assistant-vision] foto zu groÃŸ: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      );
      appendAssistantMessage('system', `Das Foto ist zu groÃŸ (max. ca. ${maxMb} MB).`);
      if (event?.target) event.target.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAssistantPhotoDraft(dataUrl, file);
    } catch (err) {
      console.error('[assistant-chat] foto konnte nicht gelesen werden', err);
      diag.add?.(`[assistant-vision] foto konnte nicht gelesen werden: ${err?.message || err}`);
      appendAssistantMessage('system', 'Das Foto konnte nicht gelesen werden.');
    } finally {
      if (event?.target) event.target.value = '';
    }
  };

  const resetAssistantChat = (focusInput = false) => {
    if (!assistantChatCtrl) return;
    assistantChatCtrl.messages = [];
    assistantChatCtrl.sessionId = null;
    clearAssistantPhotoDraft();
    renderAssistantChat();
    setAssistantSending(false);
    if (focusInput) {
      assistantChatCtrl.input?.focus();
    }
  };

  const setAssistantCopyButtonIcon = (state = 'idle') => {
    const icons = [assistantChatCtrl?.copyBtnIcon, hubDashboardCtrl?.copyBtnIcon].filter(Boolean);
    icons.forEach((icon) => {
      if (state === 'success') {
        icon.textContent = 'OK';
        return;
      }
      if (state === 'error') {
        icon.textContent = '!';
        return;
      }
      icon.innerHTML = ASSISTANT_COPY_ICON_SVG;
    });
  };

  const setAssistantCopyButtonState = (state = 'idle') => {
    const buttons = [
      { btn: assistantChatCtrl?.copyBtn, title: 'Snapshot kopieren' },
      { btn: hubDashboardCtrl?.copyBtn, title: 'Dashboard kopieren' },
    ].filter((entry) => !!entry.btn);
    if (!buttons.length) return;
    if (assistantCopyFeedbackTimer) {
      global.clearTimeout(assistantCopyFeedbackTimer);
      assistantCopyFeedbackTimer = null;
    }
    if (state === 'success') {
      buttons.forEach(({ btn }) => {
        btn.dataset.copyState = 'success';
        btn.setAttribute('title', 'Kopiert');
      });
      setAssistantCopyButtonIcon('success');
      assistantCopyFeedbackTimer = global.setTimeout(() => {
        setAssistantCopyButtonState('idle');
      }, 1400);
      return;
    }
    if (state === 'error') {
      buttons.forEach(({ btn }) => {
        btn.dataset.copyState = 'error';
        btn.setAttribute('title', 'Kopieren fehlgeschlagen');
      });
      setAssistantCopyButtonIcon('error');
      assistantCopyFeedbackTimer = global.setTimeout(() => {
        setAssistantCopyButtonState('idle');
      }, 1800);
      return;
    }
    buttons.forEach(({ btn, title }) => {
      delete btn.dataset.copyState;
      btn.setAttribute('title', title);
    });
    setAssistantCopyButtonIcon('idle');
  };

  const writeTextToClipboard = async (text) => {
    const value = String(text || '');
    if (!value) return false;
    const nav = global.navigator;
    if (global.isSecureContext && nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(value);
      return true;
    }
    if (!doc?.body) {
      throw new Error('clipboard-unavailable');
    }
    const fallback = doc.createElement('textarea');
    fallback.value = value;
    fallback.setAttribute('readonly', 'readonly');
    fallback.style.position = 'fixed';
    fallback.style.top = '-9999px';
    fallback.style.left = '-9999px';
    doc.body.appendChild(fallback);
    fallback.focus();
    fallback.select();
    const copied = doc.execCommand && doc.execCommand('copy');
    doc.body.removeChild(fallback);
    if (!copied) {
      throw new Error('clipboard-copy-failed');
    }
    return true;
  };

  const buildAssistantContextSnapshotText = () => {
    const fmt = getCaptureFormatFn();
    const now = new Date();
    const context = assistantChatCtrl?.context || {};
    const intake = context.intake || {};
    const totals = intake.totals || {};
    const profile = context.profile || {};
    const appointments = Array.isArray(context.appointments) ? context.appointments : [];
    const hasIntake = !!intake.logged;
    const water = hasIntake ? `${Math.round(Number(totals.water_ml) || 0)} ml` : '-- ml';
    const salt = hasIntake ? `${fmt(totals.salt_g, 1)} g` : '-- g';
    const protein = hasIntake ? `${fmt(totals.protein_g, 1)} g` : '-- g';
    const proteinTarget =
      formatTargetRange(profile?.protein_target_min, profile?.protein_target_max, 'g') ||
      formatTargetRange(profile?.protein_target, null, 'g') ||
      '-- g';
    const ckdStage = typeof profile?.ckd_stage === 'string' && profile.ckd_stage.trim()
      ? profile.ckd_stage.trim()
      : '--';
    const remainingText = formatAssistantRemainingText(intake, profile) || '--';
    const appointmentLines = appointments.length
      ? appointments.flatMap((item) => [item?.label || 'Termin', item?.detail || '--'])
      : ['Keine Termine'];
    return [
      `Datum: ${ASSISTANT_COPY_DATE_FORMAT.format(now)}`,
      `Zeit: ${ASSISTANT_COPY_TIME_FORMAT.format(now)}`,
      `Wasser: ${water}`,
      `Salz: ${salt}`,
      `Protein: ${protein}`,
      `Protein-Ziel: ${proteinTarget}`,
      `CKD: ${ckdStage}`,
      'Termine:',
      ...appointmentLines,
      `Restbudget: ${remainingText}`,
    ].join('\n');
  };

  const handleAssistantSnapshotCopy = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const btn = event?.currentTarget || assistantChatCtrl?.copyBtn || hubDashboardCtrl?.copyBtn;
    if (!btn) return;
    btn.setAttribute('disabled', 'disabled');
    try {
      const text = buildAssistantContextSnapshotText();
      await writeTextToClipboard(text);
      setAssistantCopyButtonState('success');
    } catch (err) {
      diag.add?.(`[assistant-copy] snapshot copy failed: ${err?.message || err}`);
      setAssistantCopyButtonState('error');
    } finally {
      btn.removeAttribute('disabled');
    }
  };

  const ensureAssistantSession = () => {
    if (!assistantChatCtrl) return;
    if (!assistantChatCtrl.sessionId) {
      assistantChatCtrl.sessionId = `text-${Date.now()}`;
      debugLog('assistant-chat new session');
    }
  };

  const setAssistantPendingIntentContext = (context, meta = {}) => {
    if (!assistantChatCtrl) return;
    prunePendingIntentLocks();
    const key = getPendingIntentGuardKey(context);
    if (key) {
      assistantChatCtrl.pendingIntentLocks?.inFlight?.delete?.(key);
      assistantChatCtrl.pendingIntentLocks?.consumed?.delete?.(key);
    }
    assistantChatCtrl.pendingIntentContext = context || null;
    assistantChatCtrl.pendingIntentMeta = context
      ? {
          source: meta.source || null,
          reason: meta.reason || 'set',
          setAt: Date.now(),
          ...meta,
        }
      : null;
  };

  const clearAssistantPendingIntentContext = (reason = 'clear') => {
    if (!assistantChatCtrl) return;
    const currentKey = getPendingIntentGuardKey(assistantChatCtrl.pendingIntentContext);
    if (currentKey) {
      assistantChatCtrl.pendingIntentLocks?.inFlight?.delete?.(currentKey);
    }
    assistantChatCtrl.pendingIntentContext = null;
    assistantChatCtrl.pendingIntentMeta = {
      source: assistantChatCtrl.pendingIntentMeta?.source || null,
      reason,
      clearedAt: Date.now(),
    };
  };

  const getAssistantPendingIntentLockState = () =>
    assistantChatCtrl?.pendingIntentLocks || { inFlight: new Set(), consumed: new Map() };

  const PENDING_INTENT_CONSUMED_RETENTION_MS = 5 * 60 * 1000;

  const getPendingIntentGuardKey = (context) => {
    if (!context || typeof context !== 'object') return null;
    return context.dedupe_key || context.pending_intent_id || null;
  };

  const prunePendingIntentLocks = () => {
    const locks = getAssistantPendingIntentLockState();
    const consumed = locks?.consumed;
    if (!(consumed instanceof Map) || !consumed.size) {
      return;
    }
    const now = Date.now();
    for (const [key, value] of consumed.entries()) {
      const at = Number.isFinite(value?.at) ? value.at : 0;
      if (!at || now - at > PENDING_INTENT_CONSUMED_RETENTION_MS) {
        consumed.delete(key);
      }
    }
  };

  const getPendingIntentStateForAssistant = (context) => {
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

  const getUsableAssistantPendingIntentContext = () => {
    const context = assistantChatCtrl?.pendingIntentContext || null;
    if (!context) {
      return null;
    }
    prunePendingIntentLocks();
    const state = getPendingIntentStateForAssistant(context);
    if (state?.usable) {
      return context;
    }
    clearAssistantPendingIntentContext(state?.reason || 'pending-context-invalid');
    return null;
  };

  const isPendingIntentGuardLocked = (context) => {
    prunePendingIntentLocks();
    const key = getPendingIntentGuardKey(context);
    if (!key) return { locked: false, reason: null, key: null };
    const locks = getAssistantPendingIntentLockState();
    if (locks.inFlight.has(key)) {
      return { locked: true, reason: 'pending-intent-in-flight', key };
    }
    if (locks.consumed.has(key)) {
      return { locked: true, reason: 'pending-intent-consumed', key };
    }
    return { locked: false, reason: null, key };
  };

  const markPendingIntentInFlight = (context) => {
    const key = getPendingIntentGuardKey(context);
    if (!key || !assistantChatCtrl) return null;
    assistantChatCtrl.pendingIntentLocks.inFlight.add(key);
    return key;
  };

  const releasePendingIntentInFlight = (key) => {
    if (!key || !assistantChatCtrl) return;
    assistantChatCtrl.pendingIntentLocks.inFlight.delete(key);
  };

  const markPendingIntentConsumed = (context, reason = 'consumed') => {
    const key = getPendingIntentGuardKey(context);
    if (!key || !assistantChatCtrl) return;
    assistantChatCtrl.pendingIntentLocks.inFlight.delete(key);
    assistantChatCtrl.pendingIntentLocks.consumed.set(key, {
      reason,
      at: Date.now(),
    });
  };

  const syncAssistantPendingIntentFromSuggestion = () => {
    if (!assistantChatCtrl) return;
    const store = getAssistantSuggestStore();
    const suggestion = store?.getActiveSuggestion?.() || null;
    if (!suggestion) {
      clearAssistantPendingIntentContext('suggestion-missing');
      return;
    }
    const intentApi = getIntentEngine();
    if (typeof intentApi?.createPendingIntentContext !== 'function') {
      return;
    }
    const context = intentApi.createPendingIntentContext(
      'confirm_reject',
      'confirm_intake',
      {
        suggestion_id: suggestion.id || null,
        suggestion_source: suggestion.source || 'suggestion-card',
      },
      {
        dedupe_key: `suggestion-confirm:${suggestion.id || 'unknown'}`,
        source: 'text',
        ui_origin: 'assistant-suggestion-inline',
      },
    );
    setAssistantPendingIntentContext(context, {
      source: 'assistant-suggestion',
      reason: 'suggestion-active',
    });
  };

  const ASSISTANT_CONFIRM_ALLOWED_TARGET_ACTIONS = new Set([
    'intake_save',
    'open_module',
  ]);

  const createAssistantActionPendingContext = (action, { replyText, rawText } = {}) => {
    const intentApi = getIntentEngine();
    if (typeof intentApi?.createPendingIntentContext !== 'function') {
      return { ok: false, reason: 'intent-api-missing' };
    }
    if (!action || action.type !== 'ask_confirmation') {
      return { ok: false, reason: 'unsupported-action' };
    }
    const payload = action.payload && typeof action.payload === 'object' ? action.payload : {};
    const targetAction = `${payload.target_action || ''}`.trim();
    if (!targetAction) {
      return { ok: false, reason: 'confirm-target-missing' };
    }
    if (!ASSISTANT_CONFIRM_ALLOWED_TARGET_ACTIONS.has(targetAction)) {
      return { ok: false, reason: 'confirm-target-not-allowed' };
    }
    const payloadSnapshot =
      payload.payload_snapshot && typeof payload.payload_snapshot === 'object' && !Array.isArray(payload.payload_snapshot)
        ? { ...payload.payload_snapshot }
        : null;
    if (!payloadSnapshot) {
      return { ok: false, reason: 'confirm-payload-snapshot-missing' };
    }
    const context = intentApi.createPendingIntentContext(
      'confirm_reject',
      targetAction,
      payloadSnapshot,
      {
        dedupe_key:
          `${payload.dedupe_key || ''}`.trim() ||
          `assistant-confirm:${targetAction}:${assistantChatCtrl?.sessionId || 'text'}:${Date.now()}`,
        ttl_ms: Number.isFinite(payload.ttl_ms) ? payload.ttl_ms : undefined,
        expires_at: Number.isFinite(payload.expires_at) ? payload.expires_at : undefined,
        source: 'text',
        ui_origin: 'assistant-action',
      },
    );
    return {
      ok: true,
      context,
      meta: {
        source: 'assistant-action',
        reason: 'ask-confirmation',
        targetAction,
        rawText: rawText || '',
        replyText: replyText || '',
        confirmAcceptReply: `${payload.confirm_accept_reply || ''}`.trim() || null,
        confirmRejectReply: `${payload.confirm_reject_reply || ''}`.trim() || null,
      },
    };
  };

  const processAssistantResponseActions = async (responseData, options = {}) => {
    const actions = Array.isArray(responseData?.actions) ? responseData.actions : [];
    if (!actions.length) {
      return { handled: 0, ignored: 0 };
    }
    let handled = 0;
    let ignored = 0;
    for (let i = 0; i < actions.length; i += 1) {
      const action = actions[i] || {};
      if (action.type === 'ask_confirmation') {
        const created = createAssistantActionPendingContext(action, options);
        if (created.ok && created.context) {
          setAssistantPendingIntentContext(created.context, created.meta || {});
          diag.add?.(
            `[assistant-actions] ask_confirmation armed target=${created.meta?.targetAction || 'unknown'}`,
          );
          handled += 1;
          continue;
        }
        diag.add?.(
          `[assistant-actions] ask_confirmation ignored reason=${created.reason || 'unknown'}`,
        );
        ignored += 1;
        continue;
      }
      diag.add?.(
        `[assistant-actions] backend action ignored type=${action.type || 'unknown'} reason=not-wired-in-hub`,
      );
      ignored += 1;
    }
    return { handled, ignored };
  };

  const preflightAssistantIntent = (text) => {
    const intentApi = getIntentEngine();
    if (typeof intentApi?.parseAdapterInput !== 'function') {
      return null;
    }
    try {
      const result = intentApi.parseAdapterInput({
        raw_text: text,
        source: 'text',
        pending_context: getUsableAssistantPendingIntentContext(),
        ui_context: {
          module: 'assistant-text',
          panel: 'assistant-text',
        },
      });
      if (assistantChatCtrl) {
        assistantChatCtrl.lastIntentResult = result;
      }
      recordIntentTelemetry({
        source_type: 'text',
        decision: result?.decision || 'unknown',
        outcome: result?.decision === 'direct_match' ? 'pending-local-execution' : 'none',
        reason: result?.reason || 'none',
        intent_key: result?.intent_key || null,
        target_action: result?.target_action || null,
        route: 'text-preflight',
      });
      diag.add?.(
        `[intent] preflight decision=${result?.decision || 'unknown'} reason=${result?.reason || 'ok'}`,
      );
      return result;
    } catch (err) {
      diag.add?.(`[intent] preflight error: ${err?.message || err}`);
      return null;
    }
  };

  const DIRECT_INTENT_ACTIONS = new Set([
    'intake_save',
    'open_module',
    'medication_confirm_all',
    'start_breath_timer',
  ]);
  const getLocalTodayIso = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const waitForAssistantUiTick = () =>
    new Promise((resolve) => {
      global.requestAnimationFrame?.(() => resolve()) || global.setTimeout(resolve, 0);
    });

  const runAllowedAction = async (type, payload = {}, { source } = {}) => {
    const allowedActions = global.AppModules?.assistantAllowedActions;
    const executeAction = allowedActions?.executeAllowedAction;
    if (typeof executeAction !== 'function') {
      diag.add?.('[assistant-actions] allowed helper missing');
      return false;
    }
    const ok = await executeAction(type, payload, {
      getSupabaseApi: () => appModules.supabase,
      notify: (msg, level) =>
        diag.add?.(`[assistant-actions][${level || 'info'}] ${msg}`),
      source: source || 'hub',
    });
    if (!ok) {
      diag.add?.(
        `[assistant-actions] action failed type=${type} source=${source || 'unknown'}`,
      );
    } else {
      if (appModules.touchlog?.add) {
        appModules.touchlog.add(
          `[assistant-actions] success action=${type} source=${source || 'hub'}`,
        );
      }
      global.dispatchEvent(
        new CustomEvent('assistant:action-success', {
          detail: { type, payload, source: source || 'hub' },
        }),
      );
    }
    return ok;
  };

  const runUiSafeAction = async (type, payload = {}, { source } = {}) => {
    const allowedActions = global.AppModules?.assistantAllowedActions;
    const executeAction = allowedActions?.executeUiSafeAllowedAction;
    if (typeof executeAction !== 'function') {
      diag.add?.('[assistant-actions] ui-safe helper missing');
      return false;
    }
    const ok = await executeAction(type, payload, {
      notify: (msg, level) =>
        diag.add?.(`[assistant-actions][${level || 'info'}] ${msg}`),
      source: source || 'hub',
    });
    if (!ok) {
      diag.add?.(
        `[assistant-actions] ui-safe action failed type=${type} source=${source || 'unknown'}`,
      );
    } else {
      if (appModules.touchlog?.add) {
        appModules.touchlog.add(
          `[assistant-actions] success action=${type} source=${source || 'hub'} mode=ui-safe`,
        );
      }
      global.dispatchEvent(
        new CustomEvent('assistant:action-success', {
          detail: { type, payload, source: source || 'hub' },
        }),
      );
    }
    return ok;
  };

  const recordAssistantIntentDispatchSuccess = (intentResult, rawText) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    if (assistantChatCtrl) {
      assistantChatCtrl.lastIntentDispatch = {
        handled: true,
        action: targetAction,
        intent: intentResult?.intent_key || null,
        rawText: rawText || '',
        at: Date.now(),
      };
    }
    try {
      global.dispatchEvent(
        new CustomEvent('assistant:intent-direct-match', {
          detail: {
            source: 'text',
            action: targetAction,
            intent_key: intentResult?.intent_key || null,
            payload: intentResult?.payload || {},
          },
        }),
      );
    } catch (_) {
      // ignore
    }
    diag.add?.(
      `[intent] direct dispatch success action=${targetAction} intent=${intentResult?.intent_key || 'unknown'}`,
    );
  };

  const dispatchAssistantIntentVitalsMatch = async (intentResult, rawText) => {
    if (!intentResult || intentResult.decision !== 'direct_match') {
      return { handled: false, reason: 'not-direct-match' };
    }
    const targetAction = `${intentResult.target_action || ''}`.trim();
    const payload = intentResult.payload || {};
    if (targetAction === 'vitals_log_bp') {
      const saveIntentMeasurement = global.AppModules?.bp?.saveIntentMeasurement;
      if (typeof saveIntentMeasurement !== 'function') {
        return { handled: false, outcome: 'blocked_local', reason: 'bp-intent-helper-missing' };
      }
      const context = `${payload.context || ''}`.trim();
      if (!context) {
        diag.add?.('[intent] bp direct match blocked (context missing)');
        return { handled: false, outcome: 'blocked_local', reason: 'bp-context-missing' };
      }
      const result = await saveIntentMeasurement({
        context,
        systolic: payload.systolic,
        diastolic: payload.diastolic,
        pulse: payload.pulse,
        source: 'assistant-intent',
      });
      if (!result?.ok) {
        diag.add?.(`[intent] bp direct match failed reason=${result?.reason || 'unknown'}`);
        return {
          handled: false,
          outcome: 'blocked_local',
          reason: result?.reason || 'bp-save-failed',
        };
      }
      global.requestUiRefresh?.({ reason: 'intent:bp' })?.catch?.((err) => {
        diag.add?.('ui refresh err: ' + (err?.message || err));
      });
      if (typeof global.maybeRunTrendpilotAfterBpSave === 'function') {
        try {
          await global.maybeRunTrendpilotAfterBpSave(context);
        } catch (err) {
          diag.add?.('[intent] trendpilot after bp save err: ' + (err?.message || err));
        }
      }
      recordAssistantIntentDispatchSuccess(intentResult, rawText);
      return { handled: true, outcome: 'handled', reason: null };
    }
    if (targetAction === 'vitals_log_weight') {
      const saveIntentWeight = global.AppModules?.body?.saveIntentWeight;
      if (typeof saveIntentWeight !== 'function') {
        return { handled: false, outcome: 'blocked_local', reason: 'body-intent-helper-missing' };
      }
      const result = await saveIntentWeight({
        weight_kg: payload.weight_kg,
        source: 'assistant-intent',
      });
      if (!result?.ok) {
        diag.add?.(`[intent] weight direct match failed reason=${result?.reason || 'unknown'}`);
        return {
          handled: false,
          outcome: 'blocked_local',
          reason: result?.reason || 'body-save-failed',
        };
      }
      global.requestUiRefresh?.({ reason: 'intent:body' })?.catch?.((err) => {
        diag.add?.('ui refresh err: ' + (err?.message || err));
      });
      recordAssistantIntentDispatchSuccess(intentResult, rawText);
      return { handled: true, outcome: 'handled', reason: null };
    }
    if (targetAction === 'vitals_log_pulse') {
      diag.add?.('[intent] pulse direct match blocked (no guarded save path)');
      return { handled: false, outcome: 'unsupported_local', reason: 'pulse-local-dispatch-unsupported' };
    }
    return { handled: false, outcome: 'unsupported_local', reason: 'not-vitals-direct-match' };
  };

  const dispatchAssistantIntentDirectMatch = async (intentResult, rawText) => {
    if (!intentResult || intentResult.decision !== 'direct_match') {
      return { handled: false, outcome: 'fallback_semantic', reason: 'not-direct-match' };
    }
    const targetAction = `${intentResult.target_action || ''}`.trim();
    if (targetAction.startsWith('vitals_log_')) {
      return dispatchAssistantIntentVitalsMatch(intentResult, rawText);
    }
    if (!DIRECT_INTENT_ACTIONS.has(targetAction)) {
      diag.add?.(
        `[intent] direct match not locally dispatchable action=${targetAction || 'unknown'}`,
      );
      return { handled: false, outcome: 'unsupported_local', reason: 'local-dispatch-unsupported' };
    }
    if (targetAction === 'medication_confirm_all') {
      const medicationModule = global.AppModules?.medication;
      const loadMedicationForDay = medicationModule?.loadMedicationForDay;
      const confirmMedication = medicationModule?.confirmMedication;
      if (typeof loadMedicationForDay !== 'function' || typeof confirmMedication !== 'function') {
        return { handled: false, outcome: 'blocked_local', reason: 'medication-module-missing' };
      }
      const dayIso = getLocalTodayIso();
      let snapshot = null;
      try {
        snapshot = await loadMedicationForDay(dayIso, { reason: 'text:intent-medication-confirm-all' });
      } catch (_) {
        return { handled: false, outcome: 'blocked_local', reason: 'medication-load-failed' };
      }
      const openMedicationIds = (Array.isArray(snapshot?.medications) ? snapshot.medications : [])
        .filter((med) => med && med.id && med.active !== false && !med.taken)
        .map((med) => med.id);
      if (!openMedicationIds.length) {
        return { handled: false, outcome: 'blocked_local', reason: 'medication-none-open' };
      }
      try {
        await Promise.all(
          openMedicationIds.map((medId) =>
            confirmMedication(medId, {
              dayIso,
              reason: 'text:intent-confirm-all',
            })),
        );
      } catch (_) {
        return { handled: false, outcome: 'blocked_local', reason: 'medication-confirm-failed' };
      }
      recordAssistantIntentDispatchSuccess(intentResult, rawText);
      return { handled: true, outcome: 'handled', reason: null };
    }
    if (targetAction === 'start_breath_timer') {
      const minutes = Number(intentResult?.payload?.minutes) === 5 ? 5 : 3;
      const captureModule = global.AppModules?.capture;
      const breathTimer = global.AppModules?.breathTimer;
      if (typeof breathTimer?.startIntentPreset !== 'function') {
        return { handled: false, outcome: 'blocked_local', reason: 'breath-timer-helper-missing' };
      }
      const opened = await runUiSafeAction(
        'open_module',
        { module: 'vitals', target: 'vitals' },
        { source: 'intent-engine:text' },
      );
      if (!opened) {
        return { handled: false, outcome: 'blocked_local', reason: 'breath-open-module-failed' };
      }
      await waitForAssistantUiTick();
      const prepareResult =
        typeof captureModule?.prepareBreathTimerIntentEntry === 'function'
          ? captureModule.prepareBreathTimerIntentEntry({})
          : { ok: true };
      if (prepareResult?.ok === false) {
        return {
          handled: false,
          outcome: 'blocked_local',
          reason: prepareResult.reason || 'breath-prepare-failed',
        };
      }
      const startResult = breathTimer.startIntentPreset(minutes);
      if (!startResult?.ok) {
        return {
          handled: false,
          outcome: 'blocked_local',
          reason: startResult?.reason || 'breath-start-failed',
        };
      }
      recordAssistantIntentDispatchSuccess(intentResult, rawText);
      return { handled: true, outcome: 'handled', reason: null };
    }
    const executor =
      targetAction === 'open_module'
        ? runUiSafeAction
        : runAllowedAction;
    const ok = await executor(targetAction, intentResult.payload || {}, {
      source: 'intent-engine:text',
    });
    if (!ok) {
      return { handled: false, outcome: 'blocked_local', reason: 'local-dispatch-failed' };
    }
    recordAssistantIntentDispatchSuccess(intentResult, rawText);
    return { handled: true, outcome: 'handled', reason: null };
  };

  const buildAssistantLocalIntentReply = (intentResult) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    const payload = intentResult?.payload || {};
    if (targetAction === 'medication_confirm_all') {
      return 'Medikation bestaetigt.';
    }
    if (targetAction === 'start_breath_timer') {
      const minutes = Number(payload.minutes) === 5 ? 5 : 3;
      return `Ich habe den ${minutes}-Minuten-Atemtimer gestartet.`;
    }
    if (targetAction === 'intake_save') {
      if (Number.isFinite(payload.water_ml)) {
        return `${Math.round(Number(payload.water_ml))} ml Wasser wurden eingetragen.`;
      }
      if (Number.isFinite(payload.protein_g)) {
        return `${Number(payload.protein_g)} g Protein wurden eingetragen.`;
      }
      if (Number.isFinite(payload.salt_g)) {
        return `${Number(payload.salt_g)} g Salz wurden eingetragen.`;
      }
      return 'Der Eintrag wurde gespeichert.';
    }
    if (targetAction === 'open_module') {
      const target = `${payload.target || payload.module || ''}`.trim().toLowerCase();
      if (target === 'vitals') {
        return 'Die Vitaldaten sind offen.';
      }
      if (target === 'medikamente' || target === 'intake') {
        return 'Die Tageserfassung ist offen.';
      }
      return 'Das Modul ist offen.';
    }
    return 'Befehl lokal ausgefÃ¼hrt.';
  };

  const buildAssistantLocalIntentBlockedReply = (intentResult, localDispatch = null) => {
    const targetAction = `${intentResult?.target_action || ''}`.trim();
    const reason = `${localDispatch?.reason || ''}`.trim();
    if (targetAction === 'medication_confirm_all') {
      if (reason === 'medication-none-open') {
        return 'Es gibt heute keine offene Medikation.';
      }
      return 'Ich habe den Befehl erkannt, aber ich kann die Medikation gerade nicht bestaetigen.';
    }
    if (targetAction === 'start_breath_timer') {
      return 'Ich habe den Befehl erkannt, aber ich kann den Atemtimer gerade nicht starten.';
    }
    if (targetAction === 'open_module') {
      return 'Ich habe den Befehl erkannt, aber das Modul ist gerade noch nicht bereit.';
    }
    if (targetAction === 'intake_save') {
      return 'Ich habe den Befehl erkannt, aber ich kann den Eintrag gerade noch nicht speichern.';
    }
    if (targetAction === 'vitals_log_weight') {
      return 'Ich habe den Befehl erkannt, aber ich kann das Gewicht gerade noch nicht speichern.';
    }
    if (targetAction === 'vitals_log_bp') {
      if (reason === 'bp-context-missing') {
        return 'Ich habe den Befehl erkannt. Bitte sage beim Blutdruck noch morgens oder abends dazu.';
      }
      return 'Ich habe den Befehl erkannt, aber ich kann den Blutdruck gerade noch nicht speichern.';
    }
    if (targetAction === 'vitals_log_pulse') {
      return 'Ich habe den Befehl erkannt. Puls kann ich lokal im Moment nur zusammen mit Blutdruck verarbeiten.';
    }
    return 'Ich habe den Befehl erkannt, kann ihn aber gerade noch nicht lokal ausfuehren.';
  };

  const resolveAssistantConfirmIntent = async (intentResult, options = {}) => {
    if (!intentResult || intentResult.intent_key !== 'confirm_reject') {
      return { handled: false, reason: 'not-confirm-intent' };
    }
    const channel = `${options.channel || 'text'}`.trim().toLowerCase();
    const respond =
      typeof options.respond === 'function'
        ? options.respond
        : channel === 'voice'
          ? null
          : (message) => appendAssistantMessage('assistant', message);
    const emitReply = (message) => {
      const replyText = `${message || ''}`.trim();
      if (replyText && respond) {
        respond(replyText);
      }
      return replyText;
    };
    const confirmValue = `${intentResult.payload?.value || ''}`.trim().toLowerCase();
    const pendingContext = getUsableAssistantPendingIntentContext();
    const contextState = intentResult.context_state || null;
    if (!contextState?.usable || !pendingContext) {
      const replyText = emitReply('Es gibt aktuell nichts zu bestaetigen.');
      diag.add?.('[intent] confirm intent ignored (no usable pending context)');
      return { handled: true, outcome: 'handled', reason: 'pending-context-missing', replyText };
    }
    const guardState = isPendingIntentGuardLocked(pendingContext);
    if (guardState.locked) {
      const replyText =
        guardState.reason === 'pending-intent-in-flight'
          ? emitReply('Die Bestaetigung wird bereits verarbeitet.')
          : emitReply('Diese Bestaetigung wurde bereits verarbeitet.');
      diag.add?.(`[intent] confirm intent ignored (${guardState.reason})`);
      return { handled: true, outcome: 'handled', reason: guardState.reason, replyText };
    }
    if (pendingContext.target_action === 'confirm_intake') {
      const store = getAssistantSuggestStore();
      const activeSuggestion = store?.getActiveSuggestion?.() || null;
      const expectedSuggestionId = pendingContext.payload_snapshot?.suggestion_id || null;
      if (!activeSuggestion || (expectedSuggestionId && activeSuggestion.id !== expectedSuggestionId)) {
        clearAssistantPendingIntentContext('pending-suggestion-mismatch');
        const replyText = emitReply('Die vorherige Bestaetigung ist nicht mehr aktiv.');
        diag.add?.('[intent] confirm intent ignored (pending suggestion mismatch)');
        return { handled: true, outcome: 'handled', reason: 'pending-suggestion-mismatch', replyText };
      }
      if (confirmValue === 'yes' || confirmValue === 'save') {
        const lockKey = markPendingIntentInFlight(pendingContext);
        try {
          const result = await handleSuggestionConfirmRequest(activeSuggestion);
          if (!result?.ok) {
            const replyText = emitReply('Ich konnte das gerade nicht bestaetigen.');
            return {
              handled: true,
              outcome: 'blocked_local',
              reason: result?.reason || 'confirm-intake-failed',
              replyText,
            };
          }
          const intentApi = getIntentEngine();
          const consumed =
            typeof intentApi?.consumePendingIntentContext === 'function'
              ? intentApi.consumePendingIntentContext(pendingContext)
              : { ok: true, context: { ...pendingContext, consumed_at: Date.now() } };
          if (consumed?.ok) {
            markPendingIntentConsumed(consumed.context || pendingContext, 'confirm-intake-accepted');
          }
          clearAssistantPendingIntentContext('confirm-intake-accepted');
          return {
            handled: true,
            outcome: 'handled',
            reason: 'confirm-intake-accepted',
            replyText:
              channel === 'voice'
                ? 'Alles klar, ich habe den Vorschlag gespeichert.'
                : '',
          };
        } finally {
          releasePendingIntentInFlight(lockKey);
        }
      }
      if (confirmValue === 'no' || confirmValue === 'cancel') {
        const intentApi = getIntentEngine();
        const consumed =
          typeof intentApi?.consumePendingIntentContext === 'function'
            ? intentApi.consumePendingIntentContext(pendingContext)
            : { ok: true, context: { ...pendingContext, consumed_at: Date.now() } };
        if (consumed?.ok) {
          markPendingIntentConsumed(consumed.context || pendingContext, 'confirm-intake-rejected');
        }
        clearAssistantPendingIntentContext('confirm-intake-rejected');
        store?.dismissCurrent?.({ reason: 'intent-reject' });
        const replyText = emitReply('Alles klar, ich speichere das nicht.');
        diag.add?.('[intent] confirm intake rejected');
        return { handled: true, outcome: 'handled', reason: 'confirm-intake-rejected', replyText };
      }
    }
    const genericTargetAction = `${pendingContext.target_action || ''}`.trim();
    if (genericTargetAction) {
      if (confirmValue === 'yes' || confirmValue === 'save') {
        const lockKey = markPendingIntentInFlight(pendingContext);
        const confirmAcceptReply =
          assistantChatCtrl?.pendingIntentMeta?.confirmAcceptReply || 'Alles klar, ich fuehre das jetzt aus.';
        try {
          const ok = await runAllowedAction(genericTargetAction, pendingContext.payload_snapshot || {}, {
            source: `intent-confirm:${channel || 'text'}`,
          });
          if (!ok) {
            const replyText = emitReply('Ich konnte das gerade nicht bestaetigen.');
            return {
              handled: true,
              outcome: 'blocked_local',
              reason: 'confirm-target-failed',
              replyText,
            };
          }
          const intentApi = getIntentEngine();
          const consumed =
            typeof intentApi?.consumePendingIntentContext === 'function'
              ? intentApi.consumePendingIntentContext(pendingContext)
              : { ok: true, context: { ...pendingContext, consumed_at: Date.now() } };
          if (consumed?.ok) {
            markPendingIntentConsumed(consumed.context || pendingContext, 'confirm-target-accepted');
          }
          clearAssistantPendingIntentContext('confirm-target-accepted');
          const replyText = emitReply(confirmAcceptReply);
          return { handled: true, outcome: 'handled', reason: 'confirm-target-accepted', replyText };
        } finally {
          releasePendingIntentInFlight(lockKey);
        }
      }
      if (confirmValue === 'no' || confirmValue === 'cancel') {
        const confirmRejectReply =
          assistantChatCtrl?.pendingIntentMeta?.confirmRejectReply || 'Alles klar, ich mache das nicht.';
        const intentApi = getIntentEngine();
        const consumed =
          typeof intentApi?.consumePendingIntentContext === 'function'
            ? intentApi.consumePendingIntentContext(pendingContext)
            : { ok: true, context: { ...pendingContext, consumed_at: Date.now() } };
        if (consumed?.ok) {
          markPendingIntentConsumed(consumed.context || pendingContext, 'confirm-target-rejected');
        }
        clearAssistantPendingIntentContext('confirm-target-rejected');
        const replyText = emitReply(confirmRejectReply);
        return { handled: true, outcome: 'handled', reason: 'confirm-target-rejected', replyText };
      }
    }
    return { handled: false, reason: 'confirm-target-unsupported' };
  };

  const resolveAssistantIntentFallbackRoute = (intentResult, localDispatch = null) => {
    if (!intentResult) {
      return {
        shouldCallAssistant: true,
        route: 'no-intent-result',
      };
    }
    if (intentResult.decision === 'fallback') {
      return {
        shouldCallAssistant: true,
        route: 'intent-fallback',
      };
    }
    if (intentResult.decision === 'needs_confirmation') {
      return {
        shouldCallAssistant: true,
        route: 'intent-needs-confirmation',
      };
    }
    if (intentResult.decision === 'direct_match') {
      if (localDispatch?.handled === true) {
        return {
          shouldCallAssistant: false,
          route: 'direct-match-handled',
        };
      }
      if (localDispatch?.outcome === 'blocked_local') {
        return {
          shouldCallAssistant: false,
          route: localDispatch?.reason || 'direct-match-blocked-local',
        };
      }
      if (localDispatch?.outcome === 'unsupported_local') {
        return {
          shouldCallAssistant: false,
          route: localDispatch?.reason || 'direct-match-unsupported-local',
        };
      }
      if (localDispatch?.outcome === 'fallback_semantic') {
        return {
          shouldCallAssistant: true,
          route: localDispatch?.reason || 'direct-match-semantic-fallback',
        };
      }
    }
    return {
      shouldCallAssistant: true,
      route: 'assistant-default',
    };
  };

  const recordAssistantIntentFallback = (intentResult, fallbackRoute, rawText) => {
    if (!assistantChatCtrl || !fallbackRoute?.shouldCallAssistant) return;
    assistantChatCtrl.lastIntentFallback = {
      route: fallbackRoute.route || 'assistant-default',
      decision: intentResult?.decision || null,
      intent: intentResult?.intent_key || null,
      targetAction: intentResult?.target_action || null,
      rawText: rawText || '',
      at: Date.now(),
    };
    diag.add?.(
      `[intent] assistant fallback route=${fallbackRoute.route || 'assistant-default'} decision=${intentResult?.decision || 'none'} intent=${intentResult?.intent_key || 'none'}`,
    );
    recordIntentTelemetry({
      source_type: 'text',
      decision: intentResult?.decision || 'unknown',
      outcome: 'fallback_semantic',
      reason: intentResult?.reason || 'none',
      intent_key: intentResult?.intent_key || null,
      target_action: intentResult?.target_action || null,
      route: fallbackRoute.route || 'assistant-default',
    });
    try {
      global.dispatchEvent(
        new CustomEvent('assistant:intent-fallback', {
          detail: {
            source: 'text',
            route: fallbackRoute.route || 'assistant-default',
            decision: intentResult?.decision || null,
            intent_key: intentResult?.intent_key || null,
            target_action: intentResult?.target_action || null,
          },
        }),
      );
    } catch (_) {
      // ignore
    }
  };

  const recordAssistantIntentLlmBypass = (intentResult, rawText) => {
    if (!assistantChatCtrl || !intentResult) return;
    assistantChatCtrl.lastIntentBypass = {
      source: 'text',
      decision: intentResult.decision || null,
      intent: intentResult.intent_key || null,
      targetAction: intentResult.target_action || null,
      rawText: rawText || '',
      at: Date.now(),
    };
    diag.add?.(
      `[intent] llm bypass decision=${intentResult.decision || 'unknown'} intent=${intentResult.intent_key || 'unknown'} action=${intentResult.target_action || 'unknown'}`,
    );
    recordIntentTelemetry({
      source_type: 'text',
      decision: intentResult.decision || 'unknown',
      outcome: 'handled',
      reason: intentResult.reason || 'none',
      intent_key: intentResult.intent_key || null,
      target_action: intentResult.target_action || null,
      route: 'text-llm-bypass',
    });
    try {
      global.dispatchEvent(
        new CustomEvent('assistant:intent-llm-bypass', {
          detail: {
            source: 'text',
            decision: intentResult.decision || null,
            intent_key: intentResult.intent_key || null,
            target_action: intentResult.target_action || null,
          },
        }),
      );
    } catch (_) {
      // ignore
    }
  };

  const handleAssistantChatSubmit = (event) => {
    event.preventDefault();
    if (!assistantChatCtrl) return;
    const value = assistantChatCtrl.input?.value?.trim() || '';
    const hasDraft = !!assistantChatCtrl.photoDraft?.dataUrl;
    if (!value && !hasDraft) return;
    debugLog('assistant-chat submit');
    if (hasDraft) {
      sendAssistantPhotoMessage(
        assistantChatCtrl.photoDraft.dataUrl,
        assistantChatCtrl.photoDraft.file,
        null,
        { text: value },
      );
      if (assistantChatCtrl.input) {
        assistantChatCtrl.input.value = '';
      }
      clearAssistantPhotoDraft();
      return;
    }
    sendAssistantChatMessage(value);
  };

  const sendAssistantChatMessage = async (text) => {
    if (!assistantChatCtrl || assistantChatCtrl.sending) return;
    debugLog('assistant-chat send start');
    ensureAssistantSession();
    const intentResult = preflightAssistantIntent(text);
    appendAssistantMessage('user', text);
    if (assistantChatCtrl.input) {
      assistantChatCtrl.input.value = '';
    }
    setAssistantSending(true);
    try {
      let fallbackRoute = null;
      try {
        if (intentResult && intentResult.decision !== 'fallback') {
          debugLog('assistant-chat intent preflight hit', {
            decision: intentResult.decision,
            intent: intentResult.intent_key,
            reason: intentResult.reason || null,
          });
        }
        const localConfirm = await resolveAssistantConfirmIntent(intentResult);
        if (localConfirm.handled) {
          recordAssistantIntentLlmBypass(intentResult, text);
          debugLog('assistant-chat local confirm intent handled', {
            intent: intentResult?.intent_key || null,
            reason: localConfirm.reason || null,
          });
          return;
        }
        const localDispatch = await dispatchAssistantIntentDirectMatch(intentResult, text);
        if (localDispatch.handled) {
          recordAssistantIntentLlmBypass(intentResult, text);
          appendAssistantMessage(
            'assistant',
            buildAssistantLocalIntentReply(intentResult),
            {
              meta: {
                source: 'intent-local',
                intent_key: intentResult?.intent_key || null,
                action: intentResult?.target_action || null,
              },
            },
          );
          debugLog('assistant-chat local direct match handled', {
            intent: intentResult?.intent_key || null,
            action: intentResult?.target_action || null,
          });
          return;
        }
        fallbackRoute = resolveAssistantIntentFallbackRoute(intentResult, localDispatch);
        if (!fallbackRoute.shouldCallAssistant && intentResult?.decision === 'direct_match') {
          if (assistantChatCtrl) {
            assistantChatCtrl.lastIntentFallback = {
              route: fallbackRoute.route || 'direct-match-local',
              decision: intentResult?.decision || null,
              intent: intentResult?.intent_key || null,
              targetAction: intentResult?.target_action || null,
              outcome: localDispatch?.outcome || null,
              rawText: text || '',
              at: Date.now(),
            };
          }
          diag.add?.(
            `[intent] local direct match outcome=${localDispatch?.outcome || 'unknown'} reason=${localDispatch?.reason || 'none'} intent=${intentResult?.intent_key || 'none'}`,
          );
          recordIntentTelemetry({
            source_type: 'text',
            decision: intentResult?.decision || 'unknown',
            outcome: localDispatch?.outcome || 'none',
            reason: localDispatch?.reason || intentResult?.reason || 'none',
            intent_key: intentResult?.intent_key || null,
            target_action: intentResult?.target_action || null,
            route: fallbackRoute.route || 'direct-match-local',
          });
          appendAssistantMessage(
            'assistant',
            buildAssistantLocalIntentBlockedReply(intentResult, localDispatch),
            {
              meta: {
                source: 'intent-local-blocked',
                intent_key: intentResult?.intent_key || null,
                action: intentResult?.target_action || null,
                outcome: localDispatch?.outcome || null,
                reason: localDispatch?.reason || null,
              },
            },
          );
          debugLog('assistant-chat local direct match blocked', {
            intent: intentResult?.intent_key || null,
            action: intentResult?.target_action || null,
            outcome: localDispatch?.outcome || null,
            reason: localDispatch?.reason || null,
          });
          return;
        }
      } catch (localErr) {
        diag.add?.(
          `[intent] local execution error action=${intentResult?.target_action || 'unknown'} err=${localErr?.message || localErr}`,
        );
        if (intentResult?.decision === 'direct_match') {
          recordIntentTelemetry({
            source_type: 'text',
            decision: intentResult?.decision || 'unknown',
            outcome: 'blocked_local',
            reason: 'local-execution-error',
            intent_key: intentResult?.intent_key || null,
            target_action: intentResult?.target_action || null,
            route: 'direct-match-local-exception',
          });
          appendAssistantMessage(
            'assistant',
            'Ich habe den Befehl erkannt, aber lokal ist ein Fehler aufgetreten.',
            {
              meta: {
                source: 'intent-local-error',
                intent_key: intentResult?.intent_key || null,
                action: intentResult?.target_action || null,
                outcome: 'blocked_local',
                reason: 'local-execution-error',
              },
            },
          );
          return;
        }
        throw localErr;
      }
      recordAssistantIntentFallback(intentResult, fallbackRoute, text);
      const assistantResponse = await fetchAssistantTextReply(text);
      const reply = assistantResponse?.reply || '';
      if (reply) {
        appendAssistantMessage('assistant', reply);
      } else {
        appendAssistantMessage('assistant', 'Ich habe nichts empfangen.');
      }
      await processAssistantResponseActions(assistantResponse, {
        rawText: text,
        replyText: reply,
      });
    } catch (err) {
      console.error('[assistant-chat] request failed', err);
      if (err?.message === 'supabase-headers-missing') {
        appendAssistantMessage(
          'system',
          'Supabase-Konfiguration fehlt. Bitte REST-Endpoint + Key speichern.',
        );
      } else {
        appendAssistantMessage('system', 'Assistant nicht erreichbar.');
      }
    } finally {
      setAssistantSending(false);
      debugLog('assistant-chat send end');
    }
  };

    const appendAssistantMessage = (role, content, extras = {}) => {
      if (!assistantChatCtrl) return null;
      const message = {
        role: role === 'assistant' ? 'assistant' : role === 'system' ? 'system' : 'user',
        content: content?.trim?.() || '',
        id: extras.id || `m-${Date.now()}-${assistantChatCtrl.messages.length}`,
        imageData: extras.imageData || null,
        meta: extras.meta || null,
        type: extras.type || 'text',
        status: extras.status || null,
        resultText: extras.resultText || '',
        retryable: !!extras.retryable,
        retryPayload: extras.retryPayload || null,
      };
      assistantChatCtrl.messages.push(message);
      renderAssistantChat();
      return message;
    };

  const getAssistantTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'morning';
    if (hour < 17) return 'noon';
    return 'evening';
  };

  const APPOINTMENT_TYPE_KEYWORDS = {
    nephrology: ['nephro', 'niere', 'nieren', 'dialyse', 'kidney', 'ckd'],
    cardiology: ['cardio', 'herz', 'kardiologie', 'blutdruck', 'hypertension'],
    internist: ['internist', 'innere', 'innere medizin'],
    urology: ['urologe', 'urologie'],
    gastro: ['gastro', 'gastrologe', 'gastrologie', 'gastroenterologe', 'gastroenterologie'],
  };

  const normalizeAppointmentText = (item = {}) =>
    `${item.title || item.label || ''} ${item.note || ''} ${item.detail || ''}`
      .toLowerCase();

  const inferAppointmentType = (item) => {
    const text = normalizeAppointmentText(item);
    if (!text.trim()) return 'general';
    const entries = Object.entries(APPOINTMENT_TYPE_KEYWORDS);
    for (let i = 0; i < entries.length; i += 1) {
      const [bucket, keywords] = entries[i];
      for (let j = 0; j < keywords.length; j += 1) {
        if (text.includes(keywords[j])) return bucket;
      }
    }
    return 'general';
  };

  const pickNextAppointmentType = (appointments = []) => {
    if (!Array.isArray(appointments) || !appointments.length) return null;
    const parsed = appointments.map((item) => ({
      item,
      ts: Number.isFinite(Date.parse(item.start_at || item.startAt || ''))
        ? Date.parse(item.start_at || item.startAt || '')
        : null,
    }));
    if (!parsed.length) return inferAppointmentType(appointments[0]);
    parsed.sort((a, b) => {
      const aTs = a.ts == null ? Number.POSITIVE_INFINITY : a.ts;
      const bTs = b.ts == null ? Number.POSITIVE_INFINITY : b.ts;
      return aTs - bTs;
    });
    return inferAppointmentType(parsed[0].item);
  };

  const buildAssistantContextPayload = ({ includeTimeSlot = false } = {}) => {
    const ctx = assistantChatCtrl?.context;
    if (!ctx) return null;
    const payload = {};
    if (ctx.intake?.totals) {
      payload.intake = {
        dayIso: ctx.intake.dayIso || null,
        logged: !!ctx.intake.logged,
        totals: {
          water_ml: Number(ctx.intake.totals?.water_ml) || 0,
          salt_g: Number(ctx.intake.totals?.salt_g) || 0,
          protein_g: Number(ctx.intake.totals?.protein_g) || 0,
        },
      };
    }
    if (Array.isArray(ctx.appointments) && ctx.appointments.length) {
      payload.appointments = ctx.appointments.map((item) => ({
        id: item.id || null,
        title: item.title || item.label || '',
        start_at: item.startAt || item.start_at || null,
        note: item.note || null,
        label: item.label || '',
        detail: item.detail || '',
        type: inferAppointmentType(item),
      }));
      const appointmentType = pickNextAppointmentType(payload.appointments);
      if (appointmentType) {
        payload.appointment_type = appointmentType;
      }
    }
    if (ctx.profile) {
      const meds = Array.isArray(ctx.profile.medications)
        ? ctx.profile.medications
        : typeof ctx.profile.medications === 'string'
          ? ctx.profile.medications
              .split(/[\n;,]+/)
              .map((entry) => entry.trim())
              .filter(Boolean)
          : [];
      const proteinTarget =
        ctx.profile.protein_target_max ??
        ctx.profile.protein_target_min ??
        null;
      const saltTarget =
        ctx.profile.salt_limit_g ??
        ctx.profile.salt_target_g ??
        ctx.profile.salt_target ??
        null;
      payload.profile = {
        name: ctx.profile.full_name || null,
        birth_date: ctx.profile.birth_date || null,
        height_cm: ctx.profile.height_cm ?? null,
        ckd_stage: ctx.profile.ckd_stage || null,
        medications: meds,
        salt_limit_g: ctx.profile.salt_limit_g ?? null,
        protein_target_min: ctx.profile.protein_target_min ?? null,
        protein_target_max: ctx.profile.protein_target_max ?? null,
        protein_target: proteinTarget,
        salt_target: saltTarget,
        protein_limit_g:
          ctx.profile.protein_target_max ??
          ctx.profile.protein_target_min ??
          null,
        lifestyle_note: ctx.profile.lifestyle_note || null,
        smoker_status: ctx.profile.is_smoker ? 'smoker' : 'non-smoker',
      };
    }
    const hasData = Object.keys(payload).length > 0;
    if (includeTimeSlot || hasData) {
      payload.time_slot = getAssistantTimeSlot();
    }
    return Object.keys(payload).length ? payload : null;
  };

  const buildAssistantTurnPayload = ({
    text = '',
    imageBase64 = '',
    history = '',
    sessionId,
  } = {}) => {
    if (!assistantChatCtrl) return {};
    const payload = {
      session_id: sessionId ?? assistantChatCtrl.sessionId ?? `text-${Date.now()}`,
    };
    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (trimmedText) {
      payload.text = trimmedText;
    }
    if (typeof imageBase64 === 'string' && imageBase64.trim()) {
      payload.image_base64 = imageBase64.trim();
    }
    if (typeof history === 'string' && history.trim()) {
      payload.history = history.trim();
    }
    const contextPayload = buildAssistantContextPayload();
    if (contextPayload) {
      payload.context = contextPayload;
    }
    return payload;
  };

  const cloneAssistantTemplate = (key) => {
    const tmpl = assistantChatCtrl?.templates?.[key];
    if (!tmpl) return null;
    return tmpl.cloneNode(true);
  };

  const notifyAssistantChatRendered = () => {
    try {
      global.dispatchEvent(
        new CustomEvent('assistant:chat-rendered', {
          detail: {
            messageCount: assistantChatCtrl?.messages?.length || 0,
          },
        }),
      );
    } catch (err) {
      diag.add?.(
        `[assistant-chat] notify render failed: ${err?.message || err}`,
      );
    }
  };

  const renderAssistantChat = () => {
    if (!assistantChatCtrl?.chatEl) return;
    const container = assistantChatCtrl.chatEl;
    container.innerHTML = '';
    if (!assistantChatCtrl.messages.length) {
      const placeholder = doc.createElement('div');
      placeholder.className = 'assistant-chat-empty';
      placeholder.innerHTML = '<p class="muted">Starte eine Unterhaltung oder schicke ein Foto deines Essens.</p>';
      container.appendChild(placeholder);
      notifyAssistantChatRendered();
      return;
    }
    const frag = doc.createDocumentFragment();
    assistantChatCtrl.messages.forEach((message) => {
      let bubble;
      if (message.type === 'photo') {
        bubble = cloneAssistantTemplate('photo');
        if (!bubble) {
          bubble = doc.createElement('div');
        }
        bubble.classList.add('assistant-photo-bubble');
        const figure = bubble.querySelector('.assistant-photo');
        const img = figure?.querySelector('img');
        if (img) {
          img.src = message.imageData || '';
          img.alt = message.meta?.fileName ? `Foto ${message.meta.fileName}` : 'Hochgeladenes Foto';
        }
        const statusEl = bubble.querySelector('.assistant-photo-status');
        if (statusEl) {
          const statusText =
            message.status === 'error'
              ? 'Analyse fehlgeschlagen.'
              : message.status === 'done'
                ? 'Analyse abgeschlossen.'
                : 'Analyse lÃ¤uft ';
          statusEl.textContent = statusText;
        }
        const resultEl = bubble.querySelector('.assistant-photo-result');
        if (resultEl) {
          resultEl.textContent =
            message.resultText || (message.status === 'done' ? 'Keine Details verfÃ¼gbar.' : 'Noch kein Ergebnis.');
          if (message.status === 'error') {
            resultEl.classList.remove('muted');
          } else {
            resultEl.classList.add('muted');
          }
        }
        const captionText = message.content?.trim?.() || '';
        let captionEl = bubble.querySelector('.assistant-photo-caption');
        if (captionText) {
          if (!captionEl) {
            captionEl = doc.createElement('p');
            captionEl.className = 'assistant-photo-caption';
            if (resultEl) {
              bubble.insertBefore(captionEl, resultEl);
            } else {
              bubble.appendChild(captionEl);
            }
          }
          captionEl.textContent = captionText;
        } else if (captionEl) {
          captionEl.remove();
        }
        bubble.classList.toggle('is-processing', message.status !== 'done' && message.status !== 'error');
        bubble.classList.toggle('is-error', message.status === 'error');
        if (message.retryable) {
          const retryWrap = doc.createElement('div');
          retryWrap.className = 'assistant-photo-retry';
          const retryLabel = doc.createElement('span');
          retryLabel.textContent = 'Erneut versuchen?';
          const retryBtn = doc.createElement('button');
          retryBtn.type = 'button';
          retryBtn.textContent = 'Nochmal analysieren';
          retryBtn.setAttribute('data-assistant-retry-id', message.id);
          retryWrap.appendChild(retryLabel);
          retryWrap.appendChild(retryBtn);
          bubble.appendChild(retryWrap);
        }
      } else if (message.type === 'followup') {
        bubble = cloneAssistantTemplate('message');
        if (!bubble) {
          bubble = doc.createElement('div');
          bubble.className = 'assistant-bubble';
        }
        const textLine = bubble.querySelector('.assistant-text-line');
        if (textLine) {
          textLine.textContent = message.content;
        } else if (message.content) {
          const text = doc.createElement('p');
          text.className = 'assistant-text-line';
          text.textContent = message.content;
          bubble.appendChild(text);
        }
        const actions = doc.createElement('div');
        actions.className = 'assistant-followup-actions';
        const yesBtn = doc.createElement('button');
        yesBtn.type = 'button';
        yesBtn.className = 'btn primary';
        yesBtn.textContent = 'Ja, bitte';
        yesBtn.setAttribute('data-assistant-followup-action', 'yes');
        yesBtn.setAttribute('data-assistant-followup-id', message.id);
        const noBtn = doc.createElement('button');
        noBtn.type = 'button';
        noBtn.className = 'btn ghost';
        noBtn.textContent = 'Nein';
        noBtn.setAttribute('data-assistant-followup-action', 'no');
        noBtn.setAttribute('data-assistant-followup-id', message.id);
        actions.appendChild(yesBtn);
        actions.appendChild(noBtn);
        bubble.appendChild(actions);
      } else {
        bubble = cloneAssistantTemplate('message');
        if (!bubble) {
          bubble = doc.createElement('div');
          bubble.className = 'assistant-bubble';
        }
        const textLine = bubble.querySelector('.assistant-text-line');
        if (textLine) {
          textLine.textContent = message.content;
        } else if (message.content) {
          const text = doc.createElement('p');
          text.className = 'assistant-text-line';
          text.textContent = message.content;
          bubble.appendChild(text);
        }
      }
      bubble.classList.add(`assistant-${message.role}`);
      bubble.setAttribute('data-role', message.role);
      bubble.setAttribute('data-assistant-message-id', message.id);
      frag.appendChild(bubble);
    });
    container.appendChild(frag);
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
    notifyAssistantChatRendered();
  };

  const setAssistantSending = (state) => {
    if (!assistantChatCtrl) return;
    assistantChatCtrl.sending = !!state;
    if (assistantChatCtrl.sending) {
      assistantChatCtrl.sendBtn?.setAttribute('disabled', 'disabled');
      assistantChatCtrl.input?.setAttribute('disabled', 'disabled');
      assistantChatCtrl.cameraBtn?.setAttribute('disabled', 'disabled');
      assistantChatCtrl.photoDraftUi?.clearBtn?.setAttribute('disabled', 'disabled');
    } else {
      assistantChatCtrl.sendBtn?.removeAttribute('disabled');
      assistantChatCtrl.input?.removeAttribute('disabled');
      assistantChatCtrl.cameraBtn?.removeAttribute('disabled');
      assistantChatCtrl.photoDraftUi?.clearBtn?.removeAttribute('disabled');
      assistantChatCtrl.input?.focus();
    }
  };

  const fetchAssistantTextReply = async (lastUserText = '') => {
    ensureAssistantSession();
    if (!assistantChatCtrl) return '';
    const payload = {
      ...buildAssistantTurnPayload({ text: lastUserText }),
      mode: 'text',
      messages: assistantChatCtrl.messages
        .filter((msg) => msg.role === 'assistant' || msg.role === 'user')
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
    };
    let response;
    const headers = await buildFunctionJsonHeaders();
    try {
      response = await fetch(MIDAS_ENDPOINTS.assistant, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      throw networkErr;
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(errText || 'assistant failed');
    }
    const data = await response.json().catch(() => ({}));
    return {
      reply: `${data?.reply || ''}`.trim(),
      actions: Array.isArray(data?.actions) ? data.actions : [],
      meta: data?.meta || null,
    };
  };

  const sendAssistantPhotoMessage = async (
    dataUrl,
    file,
    existingMessage = null,
    { text = '' } = {},
  ) => {
    if (!assistantChatCtrl || assistantChatCtrl.sending) return;
    ensureAssistantSession();
    const trimmedText = typeof text === 'string' ? text.trim() : '';
    const resolvedDataUrl =
      dataUrl ||
      existingMessage?.retryPayload?.base64 ||
      existingMessage?.imageData ||
      '';
    const assistantUi = getAssistantUiHelpers();
    const basePayload =
      assistantUi?.createPhotoMessageModel?.({
        imageData: resolvedDataUrl,
        fileName: file?.name || existingMessage?.meta?.fileName || ''
      }) || {
        type: 'photo',
        status: 'processing',
        resultText: 'Noch kein Ergebnis.',
        imageData: resolvedDataUrl,
        meta: { fileName: file?.name || existingMessage?.meta?.fileName || '' },
        retryPayload: { base64: resolvedDataUrl, fileName: file?.name || existingMessage?.meta?.fileName || '' },
        retryable: false
      };
    const targetMessage =
      existingMessage || appendAssistantMessage('user', trimmedText, basePayload);
    if (!targetMessage) return;
    targetMessage.status = 'processing';
    targetMessage.resultText = 'Analyse lÃ¤uft ';
    targetMessage.retryable = false;
    targetMessage.retryPayload =
      targetMessage.retryPayload || { base64: resolvedDataUrl, fileName: file?.name || targetMessage.meta?.fileName || '' };
    renderAssistantChat();
    setAssistantSending(true);
    diag.add?.('[assistant-vision] analyse start');
    try {
      const result = await fetchAssistantVisionReply(resolvedDataUrl, file, trimmedText);
      targetMessage.status = 'done';
      targetMessage.resultText = formatAssistantVisionResult(result);
      targetMessage.retryable = false;
      diag.add?.('[assistant-vision] analyse success');
      const suggestionStore = getAssistantSuggestStore();
      const suggestionPayload = assistantUi?.buildVisionSuggestPayload?.(result, {
        messageId: targetMessage.id,
      });
      if (suggestionStore && suggestionPayload) {
        suggestionStore.clear?.({ reason: 'vision-replace' });
        suggestionStore.queueSuggestion(
          {
            ...suggestionPayload,
            source: 'vision',
            messageId: suggestionPayload.messageId || targetMessage.id,
            meta: {
              ...(suggestionPayload.meta || {}),
              fileName: file?.name || targetMessage.meta?.fileName || '',
              messageId: suggestionPayload.messageId || targetMessage.id,
            },
          },
          { reason: 'vision-result' },
        );
      }
    } catch (err) {
      console.error('[assistant-chat] vision request failed', err);
      diag.add?.(
        `[assistant-vision] analyse failed: ${err?.message || err}`,
      );
      targetMessage.status = 'error';
      targetMessage.resultText = 'Das Foto konnte nicht analysiert werden.';
      targetMessage.retryable = true;
      if (err?.message === 'supabase-headers-missing') {
        appendAssistantMessage(
          'system',
          'Supabase-Konfiguration fehlt. Bitte REST-Endpoint + Key speichern.',
        );
      } else {
        appendAssistantMessage('system', 'Das Foto konnte nicht analysiert werden.');
      }
    } finally {
      setAssistantSending(false);
      renderAssistantChat();
    }
  };

  const fetchAssistantVisionReply = async (dataUrl, file, text = '') => {
    ensureAssistantSession();
    if (!assistantChatCtrl) {
      throw new Error('vision-unavailable');
    }
    const base64 = (dataUrl.includes(',') ? dataUrl.split(',').pop() : dataUrl)?.trim() || '';
    if (!base64) {
      throw new Error('vision-image-missing');
    }
    const payload = {
      ...buildAssistantTurnPayload({
        text,
        imageBase64: base64,
        history: buildAssistantPhotoHistory(),
      }),
      mode: 'vision',
    };
    if (file?.name) {
      payload.meta = { fileName: file.name };
    }
    const headers = await buildFunctionJsonHeaders();
    let response;
    try {
      response = await fetch(MIDAS_ENDPOINTS.vision, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      throw networkErr;
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(errText || 'vision-failed');
    }
    const data = await response.json().catch(() => ({}));
    const reply = (data?.reply || '').trim();
    if (!reply) {
      throw new Error('vision-empty');
    }
    return {
      reply,
      analysis: data?.analysis || data?.meta?.analysis || null,
      meta: data?.meta || null,
    };
  };

  const buildAssistantPhotoHistory = () => {
    if (!assistantChatCtrl?.messages?.length) return '';
    const relevant = assistantChatCtrl.messages
      .filter((msg) => (msg.role === 'assistant' || msg.role === 'user') && !msg.imageData)
      .slice(-6);
    if (!relevant.length) return '';
    return relevant
      .map((msg) => `${msg.role === 'assistant' ? 'MIDAS' : 'Stephan'}: ${msg.content}`)
      .join('\n');
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      const cleanup = () => {
        reader.onload = null;
        reader.onerror = null;
      };
      const fallbackToBuffer = () => {
        cleanup();
        file
          .arrayBuffer()
          .then((buffer) => {
            resolve(arrayBufferToDataUrl(buffer, file.type));
          })
          .catch((bufferErr) => reject(bufferErr));
      };
      reader.onload = () => {
        cleanup();
        resolve(reader.result);
      };
      reader.onerror = (err) => {
        diag.add?.(`[assistant-vision] FileReader fehler: ${err?.message || err}`);
        fallbackToBuffer();
      };
      try {
        reader.readAsDataURL(file);
      } catch (err) {
        diag.add?.(`[assistant-vision] FileReader exception: ${err?.message || err}`);
        fallbackToBuffer();
      }
    });

  const arrayBufferToDataUrl = (buffer, mime = 'application/octet-stream') => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    const base64 = global.btoa(binary);
    return `data:${mime || 'application/octet-stream'};base64,${base64}`;
  };

  function handleAssistantChatClick(event) {
    const retryBtn = event.target.closest('button[data-assistant-retry-id]');
    if (retryBtn) {
      event.preventDefault();
      const messageId = retryBtn.getAttribute('data-assistant-retry-id');
      retryAssistantPhoto(messageId);
      return;
    }
    const followupBtn = event.target.closest(
      'button[data-assistant-followup-action]',
    );
    if (followupBtn) {
      event.preventDefault();
      const action = followupBtn.getAttribute('data-assistant-followup-action');
      const messageId = followupBtn.getAttribute('data-assistant-followup-id');
      const context = assistantChatCtrl?.followup?.getSnapshot?.() || null;
      const meta = assistantChatCtrl?.followup?.getMeta?.() || {};
      assistantChatCtrl?.followup?.clearPrompt?.();
      if (action === 'yes') {
        if (!context) {
          diag.add?.('[assistant-followup] missing snapshot context');
        }
        global.dispatchEvent(
          new CustomEvent('assistant:meal-followup-request', {
            detail: {
              source: 'intake-save',
              messageId: messageId || null,
              followup_key: meta.followupKey || null,
              saved_at: meta.savedAt || null,
              context,
              meta: { followup_version: 1 },
            },
          }),
        );
        diag.add?.('[assistant-followup] meal idea requested');
      } else {
        diag.add?.('[assistant-followup] meal idea dismissed');
      }
    }
  }

  const retryAssistantPhoto = (messageId) => {
    if (!messageId || !assistantChatCtrl) return;
    const message = assistantChatCtrl.messages.find((msg) => msg.id === messageId);
    if (!message || !message.retryPayload) return;
    sendAssistantPhotoMessage(message.retryPayload.base64, { name: message.retryPayload.fileName || '' }, message);
  };

  const formatAssistantVisionResult = (result) => {
    const assistantUi = getAssistantUiHelpers();
    if (assistantUi?.formatVisionResultText) {
      return assistantUi.formatVisionResultText(result);
    }
    if (!result) return 'Analyse abgeschlossen.';
    const parts = [];
    const analysis = result.analysis || {};
    if (analysis.water_ml != null) {
      parts.push(`Wasser: ${Math.round(Number(analysis.water_ml) || 0)} ml`);
    }
    if (analysis.salt_g != null) {
      parts.push(`Salz: ${(Number(analysis.salt_g) || 0).toFixed(1)} g`);
    }
    if (analysis.protein_g != null) {
      parts.push(`Protein: ${(Number(analysis.protein_g) || 0).toFixed(1)} g`);
    }
    const reply = typeof result.reply === 'string' ? result.reply.trim() : '';
    if (reply) {
      parts.push(reply);
    }
    return parts.join(' - ') || 'Analyse abgeschlossen.';
  };

  const bootFlow = global.AppModules?.bootFlow;
  if (bootFlow?.whenStage) {
    bootFlow.whenStage('INIT_UI', () => activateHubLayout());
  } else if (doc?.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', activateHubLayout, { once: true });
  } else {
    activateHubLayout();
  }

  appModules.hub = Object.assign(appModules.hub || {}, {
    activateHubLayout,
    openDoctorPanel: (options) => {
      if (openDoctorPanelWithGuard) {
        return openDoctorPanelWithGuard(options);
      }
      return Promise.resolve(false);
    },
    openDoctorInboxPanel: (options) => {
      if (openDoctorInboxPanelWithGuard) {
        return openDoctorInboxPanelWithGuard(options);
      }
      return Promise.resolve(false);
    },
    closePanel: (panelName) => {
      if (panelName && activePanel?.dataset?.hubPanel !== panelName) {
        return false;
      }
      closeActivePanel({ instant: true });
      return true;
    },
    forceClosePanel: (panelName, opts) => forceClosePanelByName(panelName, opts),
    getVoiceGateStatus: () =>
      getVoiceFacade()?.getGateStatus?.() || { allowed: false, reason: 'voice-module-missing' },
    isVoiceReady: () => !!getVoiceFacade()?.isReady?.(),
    onVoiceGateChange: (callback) => {
      if (typeof callback !== 'function') return () => {};
      const voiceApi = getVoiceFacade();
      if (typeof voiceApi?.onGateChange === 'function') {
        return voiceApi.onGateChange(callback);
      }
      return () => {};
    },
    getAssistantPendingIntentContext: () => {
      const context = getUsableAssistantPendingIntentContext();
      return context ? { ...context } : null;
    },
    resolveAssistantConfirmIntent: (intentResult, options = {}) =>
      resolveAssistantConfirmIntent(intentResult, options),
    setCarouselModule: (id) => setCarouselActiveById(id),
    shiftCarousel: (delta) => shiftCarousel(delta),
    openQuickbar: () => openQuickbar(),
    closeQuickbar: () => closeQuickbar(),
    applyAssistantIntakeSnapshot: (snapshot, options) =>
      applyAssistantIntakeSnapshot(snapshot, options || {}),
  });
})(typeof window !== 'undefined' ? window : globalThis);



