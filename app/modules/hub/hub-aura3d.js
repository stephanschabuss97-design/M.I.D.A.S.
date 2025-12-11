'use strict';
/**
 * MODULE: hub-aura3d.js
 * Description: Lightweight WebGL/Three.js particle aura that lives between the MIDAS background PNG
 *              and the foreground sprite. All effects are strictly visual and degrade gracefully when
 *              WebGL/Three is unavailable.
 */

(function hubAura3DModule(global) {
  const MAX_PARTICLES = 18;
  const PARTICLE_OPACITY_BASE = 0.04;
  const PARTICLE_OPACITY_RANGE = 0.035;
  const PULSE_DURATION = 0.25;
  const DEFAULT_CONFIG = Object.freeze({
    enabled: true,
    sweepImpulseStrength: 0.18,
    sweepDecay: 0.87,
    sweepLerp: 0.12,
    noiseIntensity: 1,
    opacityMultiplier: 1,
    dampening: Object.freeze({
      spring: 6.2,
      velocity: 2.8,
      pulse: 1.4,
    }),
    boundaryElasticity: Object.freeze({
      softStart: 0.78,
      easePower: 1.8,
      rebound: 0.6,
    }),
  });
  const CONFIG = {
    enabled: DEFAULT_CONFIG.enabled,
    sweepImpulseStrength: DEFAULT_CONFIG.sweepImpulseStrength,
    sweepDecay: DEFAULT_CONFIG.sweepDecay,
    sweepLerp: DEFAULT_CONFIG.sweepLerp,
    noiseIntensity: DEFAULT_CONFIG.noiseIntensity,
    opacityMultiplier: DEFAULT_CONFIG.opacityMultiplier,
    dampening: { ...DEFAULT_CONFIG.dampening },
    boundaryElasticity: { ...DEFAULT_CONFIG.boundaryElasticity },
  };
  const state = {
    canvas: null,
    hostCanvas: null,
    renderer: null,
    scene: null,
    camera: null,
    particles: null,
    rafId: 0,
    lastTime: 0,
    sweepVelocity: 0,
    sweepTarget: 0,
    pulses: [],
    ready: false,
  };

  const hasThree = () => typeof global.THREE !== 'undefined';
  const warn = (msg, err) => global.console?.warn?.(`[hub-aura3d] ${msg}`, err || '');

  const randomRange = (min, max) => min + Math.random() * (max - min);

  const cloneConfig = () => ({
    enabled: CONFIG.enabled,
    sweepImpulseStrength: CONFIG.sweepImpulseStrength,
    sweepDecay: CONFIG.sweepDecay,
    sweepLerp: CONFIG.sweepLerp,
    noiseIntensity: CONFIG.noiseIntensity,
    opacityMultiplier: CONFIG.opacityMultiplier,
    dampening: { ...CONFIG.dampening },
    boundaryElasticity: { ...CONFIG.boundaryElasticity },
  });

  const getAuraConfig = () => cloneConfig();

  const configureAura3D = (partial = {}) => {
    if (!partial || typeof partial !== 'object') {
      return cloneConfig();
    }
    const prevEnabled = CONFIG.enabled;
    Object.keys(partial).forEach((key) => {
      if (key === 'dampening' && typeof partial[key] === 'object' && partial[key]) {
        Object.keys(partial[key]).forEach((inner) => {
          const value = partial[key][inner];
          if (inner in CONFIG.dampening && typeof value === 'number' && Number.isFinite(value)) {
            CONFIG.dampening[inner] = value;
          }
        });
        return;
      }
      if (key === 'boundaryElasticity' && typeof partial[key] === 'object' && partial[key]) {
        Object.keys(partial[key]).forEach((inner) => {
          const value = partial[key][inner];
          if (
            inner in CONFIG.boundaryElasticity &&
            typeof value === 'number' &&
            Number.isFinite(value)
          ) {
            CONFIG.boundaryElasticity[inner] = value;
          }
        });
        return;
      }
      if (key === 'noiseIntensity') {
        if (typeof value === 'number' && Number.isFinite(value)) {
          CONFIG.noiseIntensity = Math.max(0, value);
        }
        return;
      }
      if (!(key in CONFIG)) return;
      const value = partial[key];
      if (typeof CONFIG[key] === 'number' && typeof value === 'number' && Number.isFinite(value)) {
        CONFIG[key] = value;
      } else if (typeof CONFIG[key] === 'boolean' && typeof value === 'boolean') {
        CONFIG[key] = value;
      }
    });
    if (prevEnabled && !CONFIG.enabled) {
      disposeAura3D({ preserveHost: true });
    } else if (!prevEnabled && CONFIG.enabled && state.hostCanvas) {
      initAura3D(state.hostCanvas);
    }
    return cloneConfig();
  };

  const resetAuraConfig = () => {
    CONFIG.enabled = DEFAULT_CONFIG.enabled;
    CONFIG.sweepImpulseStrength = DEFAULT_CONFIG.sweepImpulseStrength;
    CONFIG.sweepDecay = DEFAULT_CONFIG.sweepDecay;
    CONFIG.sweepLerp = DEFAULT_CONFIG.sweepLerp;
    CONFIG.noiseIntensity = DEFAULT_CONFIG.noiseIntensity;
    CONFIG.opacityMultiplier = DEFAULT_CONFIG.opacityMultiplier;
    CONFIG.dampening = { ...DEFAULT_CONFIG.dampening };
    CONFIG.boundaryElasticity = { ...DEFAULT_CONFIG.boundaryElasticity };
    return cloneConfig();
  };

  const createParticles = (THREE) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const baseRadii = new Float32Array(MAX_PARTICLES);
    const angles = new Float32Array(MAX_PARTICLES);
    const angularVel = new Float32Array(MAX_PARTICLES);
    const angularBase = new Float32Array(MAX_PARTICLES);
    const noiseSeeds = new Float32Array(MAX_PARTICLES);
    const noisePhaseA = new Float32Array(MAX_PARTICLES);
    const noisePhaseB = new Float32Array(MAX_PARTICLES);
    const noiseSpeedA = new Float32Array(MAX_PARTICLES);
    const noiseSpeedB = new Float32Array(MAX_PARTICLES);
    const noiseAmpRadius = new Float32Array(MAX_PARTICLES);
    const noiseAmpAngle = new Float32Array(MAX_PARTICLES);
    const zHeights = new Float32Array(MAX_PARTICLES);
    const offsetX = new Float32Array(MAX_PARTICLES);
    const offsetY = new Float32Array(MAX_PARTICLES);
    const velocityX = new Float32Array(MAX_PARTICLES);
    const velocityY = new Float32Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = randomRange(0.35, 0.92);
      baseRadii[i] = radius;
      angles[i] = angle;
      angularBase[i] = randomRange(-0.4, 0.4);
      angularVel[i] = angularBase[i];
      noiseSeeds[i] = Math.random() * Math.PI * 2;
      noisePhaseA[i] = Math.random() * Math.PI * 2;
      noisePhaseB[i] = Math.random() * Math.PI * 2;
      noiseSpeedA[i] = randomRange(0.35, 0.8);
      noiseSpeedB[i] = randomRange(0.2, 0.55);
      noiseAmpRadius[i] = randomRange(0.015, 0.05);
      noiseAmpAngle[i] = randomRange(0.08, 0.28);
      const idx = i * 3;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = randomRange(-0.25, 0.25);
      zHeights[i] = z;
      offsetX[i] = 0;
      offsetY[i] = 0;
      velocityX[i] = 0;
      velocityY[i] = 0;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: PARTICLE_OPACITY_BASE,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return {
      points,
      baseRadii,
      angles,
      angularVel,
      angularBase,
      noiseSeeds,
      noisePhaseA,
      noisePhaseB,
      noiseSpeedA,
      noiseSpeedB,
      noiseAmpRadius,
      noiseAmpAngle,
      zHeights,
      offsetX,
      offsetY,
      velocityX,
      velocityY,
      geometry,
    };
  };

  const resetState = ({ preserveHost } = {}) => {
    if (state.canvas) {
      state.canvas.style.opacity = '0';
    }
    if (state.rafId) {
      global.cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
    state.renderer?.dispose?.();
    if (!preserveHost) {
      state.hostCanvas = null;
    }
    state.canvas = null;
    state.renderer = null;
    state.scene = null;
    state.camera = null;
    state.particles = null;
    state.lastTime = 0;
    state.pulses = [];
    state.sweepVelocity = 0;
    state.sweepTarget = 0;
    state.ready = false;
  };

  const updateLayout = () => {
    if (!state.renderer || !state.camera || !state.canvas) return false;
    const { clientWidth, clientHeight } = state.canvas;
    if (!clientWidth || !clientHeight) return false;
    state.renderer.setSize(clientWidth, clientHeight, false);
    state.camera.aspect = clientWidth / clientHeight;
    state.camera.updateProjectionMatrix();
    return true;
  };

  const updateParticles = (time, delta) => {
    if (!state.particles) return;
    const THREE = global.THREE;
    const attr = state.particles.geometry.getAttribute('position');
    const arr = attr.array;
    const {
      baseRadii,
      angles,
      angularVel,
      angularBase,
      noiseSeeds,
      noisePhaseA,
      noisePhaseB,
      noiseSpeedA,
      noiseSpeedB,
      noiseAmpRadius,
      noiseAmpAngle,
      zHeights,
      offsetX,
      offsetY,
      velocityX,
      velocityY,
    } = state.particles;
    const boundaryCfg = CONFIG.boundaryElasticity || DEFAULT_CONFIG.boundaryElasticity;
    const softStart = Math.min(0.99, Math.max(0, boundaryCfg.softStart ?? 0.78));
    const easePower = Math.max(0.1, boundaryCfg.easePower ?? 1.8);
    const reboundFactor = Math.max(0.1, boundaryCfg.rebound ?? 0.6);
    const noiseStrength = Math.max(0, CONFIG.noiseIntensity);
    const microDriftScaleBase = 0.005 * noiseStrength;
    const breathing = 0.7 + 0.3 * Math.sin(time * 0.0005);
    const pulseBoost = state.pulses.reduce((boost, pulse) => Math.max(boost, pulse.life / PULSE_DURATION), 0);
    const opacityMultiplier = Math.max(0, CONFIG.opacityMultiplier || 1);
    const targetOpacity = Math.min(
      1,
      (PARTICLE_OPACITY_BASE + PARTICLE_OPACITY_RANGE * breathing + pulseBoost * 0.12) *
        opacityMultiplier,
    );
    const currentOpacity = state.particles.points.material.opacity || 0;
    state.particles.points.material.opacity = THREE.MathUtils
      ? THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.08)
      : currentOpacity + (targetOpacity - currentOpacity) * 0.08;

    // Decay pulses
    state.pulses = state.pulses.filter((pulse) => {
      const nextLife = pulse.life - delta;
      if (nextLife <= 0) return false;
      pulse.life = nextLife;
      return true;
    });

    // Sweep easing
    state.sweepVelocity += (state.sweepTarget - state.sweepVelocity) * CONFIG.sweepLerp;
    state.sweepTarget *= CONFIG.sweepDecay;

    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      const idx = i * 3;
      noisePhaseA[i] += noiseSpeedA[i] * delta;
      noisePhaseB[i] += noiseSpeedB[i] * delta;
      const wobble =
        (Math.sin(noisePhaseA[i]) * noiseAmpAngle[i] +
          Math.cos(noisePhaseB[i]) * (noiseAmpAngle[i] * 0.45)) *
        noiseStrength;
      const radiusNoise =
        (Math.sin(noisePhaseA[i] * 0.7) * noiseAmpRadius[i] +
          Math.cos(noisePhaseB[i] * 1.3) * (noiseAmpRadius[i] * 0.6)) *
        noiseStrength;
      const baseAngle = angles[i] + wobble;
      const baseRadius = baseRadii[i] + radiusNoise;
      const anchorX = baseRadius * Math.cos(baseAngle);
      const anchorY = baseRadius * Math.sin(baseAngle);
      const tangentX = -Math.sin(baseAngle);
      const tangentY = Math.cos(baseAngle);

      // Sweep impulse gently drifts particles along tangential path
      velocityX[i] += tangentX * state.sweepVelocity * CONFIG.sweepImpulseStrength * delta;
      velocityY[i] += tangentY * state.sweepVelocity * CONFIG.sweepImpulseStrength * delta;

      // Micro noise drift
      velocityX[i] += Math.sin(time * 0.00035 + noiseSeeds[i]) * microDriftScaleBase;
      velocityY[i] += Math.cos(time * 0.00027 + noiseSeeds[i]) * microDriftScaleBase;

      // Anchored spring return to center offsets
      velocityX[i] +=
        (-offsetX[i] * CONFIG.dampening.spring - velocityX[i] * CONFIG.dampening.velocity) * delta;
      velocityY[i] +=
        (-offsetY[i] * CONFIG.dampening.spring - velocityY[i] * CONFIG.dampening.velocity) * delta;

      // Current position before integration
      let x = anchorX + offsetX[i];
      let y = anchorY + offsetY[i];
      const z = zHeights[i] + Math.sin(time * 0.0003 + noiseSeeds[i]) * 0.02;

      // Touch pulses add short impulses
      state.pulses.forEach((pulse) => {
        const dx = x - (pulse.x * 0.9);
        const dy = y - (pulse.y * 0.9);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1.2) {
          const influence = (1 - dist / 1.2) * (pulse.life / PULSE_DURATION);
          const normX = dx / (dist || 1);
          const normY = dy / (dist || 1);
          velocityX[i] += normX * influence * CONFIG.dampening.pulse;
          velocityY[i] += normY * influence * CONFIG.dampening.pulse;
        }
      });

      // Integrate offsets with accumulated velocity
      offsetX[i] += velocityX[i] * delta;
      offsetY[i] += velocityY[i] * delta;
      x = anchorX + offsetX[i];
      y = anchorY + offsetY[i];

      // Progressive boundary easing
      const radius = Math.sqrt(x * x + y * y);
      let currentRadius = radius;
      if (currentRadius > softStart) {
        const t = Math.min(1, (currentRadius - softStart) / (1 - softStart));
        const damp = 1 - Math.pow(t, easePower) * 0.85;
        velocityX[i] *= damp;
        velocityY[i] *= damp;
        const easedRadius = currentRadius * (1 - t * t * 0.35);
        const targetRadius = Math.max(softStart, Math.min(1, easedRadius));
        if (currentRadius > 0 && targetRadius < currentRadius) {
          const scale = targetRadius / currentRadius;
          x *= scale;
          y *= scale;
          offsetX[i] = x - anchorX;
          offsetY[i] = y - anchorY;
        }
      }
      currentRadius = Math.sqrt(x * x + y * y);

      // Bounce against invisible boundary
      if (currentRadius > 1) {
        const overflow = currentRadius - 1;
        const nx = x / currentRadius;
        const ny = y / currentRadius;
        const clamp = Math.max(0, 1 - overflow * reboundFactor);
        x = nx * clamp;
        y = ny * clamp;
        offsetX[i] = x - anchorX;
        offsetY[i] = y - anchorY;
        velocityX[i] *= 0.4;
        velocityY[i] *= 0.4;
      }

      arr[idx] = x;
      arr[idx + 1] = y;
      arr[idx + 2] = z;
    }
    attr.needsUpdate = true;
  };

  const animate = (timestamp = 0) => {
    if (!state.renderer || !state.scene || !state.camera) return;
    const delta = state.lastTime ? (timestamp - state.lastTime) / 1000 : 0;
    state.lastTime = timestamp;
    updateParticles(timestamp, delta);
    state.renderer.render(state.scene, state.camera);
    state.rafId = global.requestAnimationFrame(animate);
  };

  const initAura3D = (canvas) => {
    const targetCanvas = canvas || state.hostCanvas;
    if (!targetCanvas) {
      warn('Canvas missing – aura layer skipped.');
      return false;
    }
    state.hostCanvas = targetCanvas;
    if (!CONFIG.enabled) {
      disposeAura3D({ preserveHost: true });
      warn('Aura layer disabled via config – init skipped.');
      return false;
    }
    if (!hasThree()) {
      warn('THREE.js not available – aura layer disabled.');
      return false;
    }
    resetState({ preserveHost: true });
    try {
      const THREE = global.THREE;
      state.canvas = targetCanvas;
      const renderer = new THREE.WebGLRenderer({
        canvas: targetCanvas,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(global.devicePixelRatio || 1);
      state.renderer = renderer;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
      camera.position.z = 5;
      state.scene = scene;
      state.camera = camera;
      const particleSystem = createParticles(THREE);
      scene.add(particleSystem.points);
      state.particles = particleSystem;
      updateLayout();
      state.canvas.style.opacity = '1';
      state.ready = true;
      state.lastTime = 0;
      state.rafId = global.requestAnimationFrame(animate);
      return true;
    } catch (err) {
      warn('Failed to initialize aura renderer', err);
      resetState({ preserveHost: true });
      return false;
    }
  };

  const triggerTouchPulse = (normX, normY) => {
    if (!state.ready) return false;
    state.pulses.push({
      x: normX,
      y: normY,
      life: PULSE_DURATION,
    });
    return true;
  };

  const triggerCarouselSweep = (direction) => {
    if (!state.ready) return false;
    const dir = direction === 'left' ? -1 : 1;
    state.sweepTarget = dir * CONFIG.sweepImpulseStrength;
    return true;
  };

  const disposeAura3D = ({ preserveHost = true } = {}) => {
    resetState({ preserveHost });
  };

  const api = {
    initAura3D,
    updateLayout,
    triggerTouchPulse,
    triggerCarouselSweep,
    disposeAura3D,
    getAuraConfig,
    configureAura3D,
    resetAuraConfig,
  };

  global.AppModules = global.AppModules || {};
  global.AppModules.hubAura3D = api;
})(typeof window !== 'undefined' ? window : this);
