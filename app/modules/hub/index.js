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
  const MIDAS_ENDPOINTS = (() => {
    const base = `${SUPABASE_PROJECT_URL}/functions/v1`;
    if (global.location?.hostname?.includes('github.io')) {
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
  const VOICE_PARKED = true;
  const CAROUSEL_MODULES = [
    { id: 'intake', selector: '[data-carousel-id="intake"]', panel: 'intake' },
    { id: 'vitals', selector: '[data-carousel-id="vitals"]', panel: 'vitals' },
    { id: 'appointments', selector: '[data-carousel-id="appointments"]', panel: 'appointments' },
    { id: 'assistant-voice', selector: '[data-carousel-id="assistant-voice"]', panel: null },
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
    prefersReducedMotion: global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
  };
  let carouselKeyListenerBound = false;
  const quickbarState = {
    el: null,
    handle: null,
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
  const aura3dApi = global.AppModules?.hubAura3D || null;
  let aura3dCleanup = null;
  const auraState = {
    canvas: null,
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
  const getVoiceModule = () => appModules.voice || global.AppModules?.voice || null;
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
  const isVoiceConversationMode = () => !!getVoiceModule()?.isConversationMode?.();

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
    const length = getCarouselLength();
    if (!length) return;
    const dir = delta > 0 ? 1 : -1;
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
          openQuickbar();
        } else if (deltaY > SWIPE_THRESHOLD) {
          closeQuickbar();
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
    carouselState.items = CAROUSEL_MODULES.map((entry) => {
      const button = hub.querySelector(entry.selector);
      if (!button) return null;
      if (!button.dataset.carouselId) {
        button.dataset.carouselId = entry.id;
      }
      button.setAttribute('tabindex', '-1');
      button.setAttribute('aria-hidden', 'true');
      return { ...entry, button };
    }).filter(Boolean);
    setCarouselIdle();
    setupCarouselGestures(orbit);
    if (!carouselKeyListenerBound) {
      carouselKeyListenerBound = true;
      doc.addEventListener('keydown', handleCarouselKeydown);
    }
  };

  const handlePanelEsc = (event) => {
    if (event.key === 'Escape') {
      closeActivePanel();
    }
  };

  const getChartPanel = () => global.AppModules?.charts?.chartPanel;

  const closeActivePanel = ({ skipButtonSync = false, instant = false } = {}) => {
    if (!activePanel) return;
    const panel = activePanel;
    const panelName = panel.dataset?.hubPanel || 'unknown';
    diag.add?.(`[hub] close panel ${panelName} instant=${instant}`);
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
    syncCarouselToPanel(panelName);
    doc.addEventListener('keydown', handlePanelEsc);
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
          closeActivePanel({ instant: mode === 'instant' });
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
    if (!VOICE_PARKED) {
      initVoiceModule(hub);
    }
    setupAssistantChat(hub);
    setupIconBar(hub);
    setupOrbitHotspots(hub);
    setupPanels();
    setupDatePill(hub);
    moveIntakePillsToHub();
    setupChat(hub);
    setupSpriteState(hub);
    setupCarouselController(hub);
    setupQuickbar(hub);
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
        closeActivePanel();
        return;
      }
      const panel = openPanel(panelName);
      if (!panel) {
        syncButtonState(null);
        setSpriteStateFn?.('idle');
        return;
      }
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
  const setupChat = (hub) => {
    const form = hub.querySelector('#hubChatForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('#hubMessage');
      const value = input?.value?.trim();
      if (value) {
        if (HUB_DEBUG_ENABLED) {
          diag.add?.(`[hub-chat] stub send: ${value}`);
        }
        input.value = '';
      }
    });
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

  const updateAssistantPill = (key, text, isActive) => {
    const pill = assistantChatCtrl?.pills?.[key];
    if (!pill) return;
    pill.value.textContent = text;
    if (isActive) pill.root.classList.remove('muted');
    else pill.root.classList.add('muted');
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
    const refs = assistantChatCtrl?.contextExtras;
    if (!refs?.container) return;
    const isMissingProfile = !profile;
    const keepVisible = isAssistantDesktop() || isMissingProfile;
    let hasAny = false;
    const proteinText =
      formatTargetRange(profile?.protein_target_min, profile?.protein_target_max, 'g') ||
      formatTargetRange(profile?.protein_target, null, 'g');
    if (
      updateContextItem(refs.proteinTarget, proteinText, {
        keepVisible,
        placeholder: isMissingProfile ? ASSISTANT_CONTEXT_LOADING_HINT : '-- g',
      })
    )
      hasAny = true;
    const ckdStage = typeof profile?.ckd_stage === 'string' ? profile.ckd_stage.trim() : '';
    if (
      updateContextItem(refs.ckdStage, ckdStage || null, {
        keepVisible,
        placeholder: isMissingProfile ? ASSISTANT_CONTEXT_LOADING_HINT : '--',
      })
    )
      hasAny = true;
    refs.container.hidden = !hasAny;
  };

  const renderAssistantContextExpandable = (snapshot, profile) => {
    const refs = assistantChatCtrl?.contextExpandable;
    if (!refs?.container) return;
    const totals = snapshot?.totals || {};
    const fmt = getCaptureFormatFn();
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
    const remainingParts = [];
    let saltRemaining = null;
    let proteinRemaining = null;
    const saltTotal = Number(totals.salt_g) || 0;
    const proteinTotal = Number(totals.protein_g) || 0;
    if (saltLimit != null) {
      saltRemaining = saltLimit - saltTotal;
      remainingParts.push(`Salz ${fmt(saltRemaining, 1)} g`);
    }
    if (proteinTarget != null) {
      proteinRemaining = proteinTarget - proteinTotal;
      remainingParts.push(`Protein ${fmt(proteinRemaining, 1)} g`);
    }
    const isMissingProfile = !profile;
    const keepVisible = isAssistantDesktop() || isMissingProfile;
    const remainingText = remainingParts.length ? remainingParts.join(', ') : null;
    const hasRemaining = updateContextItem(refs.remaining, remainingText, {
      keepVisible,
      placeholder: isMissingProfile ? ASSISTANT_CONTEXT_LOADING_HINT : '--',
    });
    let warningText = null;
    if (saltRemaining != null && saltRemaining < 0) {
      warningText = 'Salz über Limit';
    }
    if (proteinRemaining != null && proteinRemaining < 0) {
      warningText = warningText ? `${warningText}, Protein über Limit` : 'Protein über Limit';
    }
    const hasWarning = updateContextItem(refs.warning, warningText);
    refs.container.hidden = !(hasRemaining || hasWarning);
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

  const renderAssistantAppointments = (items) => {
    const refs = assistantChatCtrl?.appointments;
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

  const APPOINTMENT_DATE_FORMAT = new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  });
  const APPOINTMENT_TIME_FORMAT = new Intl.DateTimeFormat('de-AT', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatAppointmentDateTime = (value, { includeTime = true } = {}) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const dayLabel = APPOINTMENT_DATE_FORMAT.format(date).replace(/\.$/, '');
    if (!includeTime) return dayLabel;
    const timeLabel = APPOINTMENT_TIME_FORMAT.format(date);
    return `${dayLabel} - ${timeLabel}`;
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
      if (!assistantChatCtrl?.panel) return;
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
    const messageTemplate = panel.querySelector('#assistantMessageTemplate');
    const photoTemplate = panel.querySelector('#assistantPhotoTemplate');
    const contextSection = panel.querySelector('.assistant-context');
    const contextToggle = panel.querySelector('#assistantContextToggle');
    const pillsWrap = panel.querySelector('#assistantIntakePills');
    const buildPillRef = (key) => {
      const root = pillsWrap?.querySelector(`[data-pill="${key}"]`);
      if (!root) return null;
      const value = root.querySelector('[data-pill-value]');
      if (!value) return null;
      return { root, value };
    };
    const contextExtras = panel.querySelector('#assistantContextExtras');
    const contextExpandable = panel.querySelector('#assistantContextExpandable');
    const buildContextValueRef = (wrap, attr, key, valueAttr) => {
      if (!wrap) return null;
      const root = wrap.querySelector(`[data-${attr}="${key}"]`);
      if (!root) return null;
      const value = root.querySelector(`[data-${valueAttr}]`);
      if (!value) return null;
      return { root, value };
    };
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
      thumb.alt = 'Ausgewähltes Foto';
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
      photoInput,
      photoDraft: null,
      photoDraftUi,
      contextSection,
      contextToggle,
      contextExpanded: false,
      pills: {
        water: buildPillRef('water'),
        salt: buildPillRef('salt'),
        protein: buildPillRef('protein'),
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
        context: {
          intake: null,
          appointments: [],
          profile: getAssistantProfileSnapshot(),
        },
      };

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
    photoInput.addEventListener('change', handleAssistantPhotoSelected, false);
    bindAssistantCameraButton(cameraBtn, photoInput);
    resetAssistantChat();
    debugLog('assistant-chat setup complete');
    refreshAssistantContext({ reason: 'assistant:init', forceRefresh: false });

    doc?.addEventListener('appointments:changed', () => {
      refreshAssistantContext({ reason: 'appointments:changed', forceRefresh: true });
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

      let suggestionConfirmInFlight = false;

      const handleSuggestionConfirmRequest = async (suggestion) => {
        if (!suggestion) return;
        if (suggestionConfirmInFlight) {
          diag.add?.('[assistant-suggest] confirm ignored (busy)');
          return;
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
            return;
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
        return `Alles klar - ich habe ${list} für heute vorgemerkt.`;
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
          'Soll ich dir basierend auf deinen heutigen Werten und dem nächsten Termin einen Essensvorschlag machen?';
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
          'System: Du bist ein hilfreicher Ernährungsassistent fuer kurze Essensideen.',
          'System: Nutze nur den bereitgestellten Context-Snapshot. Keine medizinischen Aussagen.',
          'User: Erstelle einen kurzen Essensvorschlag basierend auf dem Follow-up Payload.',
          'Constraints:',
          '- 1-2 kurze Vorschläge, insgesamt 2-4 Saetze.',
          '- Nutze Intake-Totals (Salz/Protein/Wasser) zum Ausbalancieren.',
          '- Berücksichtige appointment_type und time_slot wenn vorhanden.',
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
        `[assistant-vision] foto zu groß: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      );
      appendAssistantMessage('system', `Das Foto ist zu groß (max. ca. ${maxMb} MB).`);
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

  const ensureAssistantSession = () => {
    if (!assistantChatCtrl) return;
    if (!assistantChatCtrl.sessionId) {
      assistantChatCtrl.sessionId = `text-${Date.now()}`;
      debugLog('assistant-chat new session');
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
    appendAssistantMessage('user', text);
    if (assistantChatCtrl.input) {
      assistantChatCtrl.input.value = '';
    }
    setAssistantSending(true);
    try {
      const reply = await fetchAssistantTextReply(text);
      if (reply) {
        appendAssistantMessage('assistant', reply);
      } else {
        appendAssistantMessage('assistant', 'Ich habe nichts empfangen.');
      }
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
                : 'Analyse läuft ';
          statusEl.textContent = statusText;
        }
        const resultEl = bubble.querySelector('.assistant-photo-result');
        if (resultEl) {
          resultEl.textContent =
            message.resultText || (message.status === 'done' ? 'Keine Details verfügbar.' : 'Noch kein Ergebnis.');
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
    const reply = (data?.reply || '').trim();
    return reply;
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
    targetMessage.resultText = 'Analyse läuft ';
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
      getVoiceModule()?.getGateStatus?.() || { allowed: false, reason: 'voice-module-missing' },
    isVoiceReady: () => !!getVoiceModule()?.isReady?.(),
    onVoiceGateChange: (callback) => {
      if (typeof callback !== 'function') return () => {};
      const voiceApi = getVoiceModule();
      if (typeof voiceApi?.onGateChange === 'function') {
        return voiceApi.onGateChange(callback);
      }
      return () => {};
    },
    setCarouselModule: (id) => setCarouselActiveById(id),
    shiftCarousel: (delta) => shiftCarousel(delta),
    openQuickbar: () => openQuickbar(),
    closeQuickbar: () => closeQuickbar(),
  });
})(typeof window !== 'undefined' ? window : globalThis);

