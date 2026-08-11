'use strict';

(function initializeActivityV2LocalTestPwa(root) {
  const status = root.document?.getElementById('local-pwa-status');
  const allowedHosts = Object.freeze(['localhost', '127.0.0.1', '[::1]']);
  const expectedPath = '/app/modules/vitals-stack/activity/v2/test-pwa/';
  const expectedWorkerPath = `${expectedPath}service-worker.js`;
  const expectedWorkerSearch = '?v=r8-s5-3';
  const moduleSources = Object.freeze([
    '../semantics.js?v=r8-s5-3',
    '../semantics-v2.js?v=r8-s5-3',
    '../session-draft.js?v=r8-s5-3',
    '../session-recovery.js?v=r8-s5-3',
    '../session-commit.js?v=r8-s5-3',
    '../session-shell.js?v=r8-s5-3',
    '../session-commit-harness-adapter.js?v=r8-s5-3',
    '../session-commit-harness.js?v=r8-s5-3'
  ]);
  const isLocal = allowedHosts.includes(root.location.hostname);
  const isExpectedPath = [
    expectedPath.slice(0, -1),
    expectedPath,
    `${expectedPath}index.html`
  ].includes(root.location.pathname);
  let resumeCount = 0;
  let workerState = 'unsupported';
  let harnessLoaded = false;

  function publish(message, tone) {
    if (!status) return;
    status.textContent = message;
    status.dataset.workerState = workerState;
    status.dataset.resumeCount = String(resumeCount);
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;
  }

  function snapshot() {
    return Object.freeze({
      local: isLocal,
      expected_path: isExpectedPath,
      harness_loaded: harnessLoaded,
      resume_count: resumeCount,
      worker_state: workerState
    });
  }

  Object.defineProperty(root, '__midasActivityV2LocalTestPwa', {
    value: Object.freeze({ getState: snapshot }),
    enumerable: false,
    writable: false,
    configurable: false
  });

  root.document?.addEventListener('visibilitychange', () => {
    if (root.document.visibilityState !== 'visible') return;
    resumeCount += 1;
    publish(`Lokale PWA aktiv. Resume-Zähler: ${resumeCount}.`, 'ready');
  });

  function isLocalWorkerController(controller) {
    if (!controller || typeof controller.scriptURL !== 'string') return false;
    try {
      const url = new URL(controller.scriptURL);
      return url.origin === root.location.origin &&
        url.pathname === expectedWorkerPath &&
        url.search === expectedWorkerSearch;
    } catch (_) {
      return false;
    }
  }

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = root.document.createElement('script');
      script.src = source;
      script.async = false;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      root.document.body.appendChild(script);
    });
  }

  async function loadHarness() {
    if (harnessLoaded) return;
    for (const source of moduleSources) {
      await loadScript(source);
    }
    harnessLoaded = true;
  }

  function waitForLocalController(timeoutMs = 5_000) {
    if (isLocalWorkerController(root.navigator.serviceWorker.controller)) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        root.clearTimeout(timer);
        root.navigator.serviceWorker.removeEventListener('controllerchange', onChange);
        resolve(value);
      };
      const onChange = () => {
        if (isLocalWorkerController(root.navigator.serviceWorker.controller)) finish(true);
      };
      const timer = root.setTimeout(() => finish(false), timeoutMs);
      root.navigator.serviceWorker.addEventListener('controllerchange', onChange);
    });
  }

  async function start() {
    if (!isLocal || !isExpectedPath) {
      workerState = 'blocked';
      publish('Service Worker blockiert: Diese Test-PWA ist ausschließlich lokal gebunden.', 'blocked');
      return;
    }
    if (!('serviceWorker' in root.navigator)) {
      publish('Lokale Test-Runtime ohne Service-Worker-Unterstützung; Harness wird ohne Offline-Scope geladen.', 'blocked');
      await loadHarness();
      return;
    }

    workerState = 'registering';
    publish('Lokale PWA aktiv; isolierter Service Worker wird registriert.', 'pending');
    try {
      const registration = await root.navigator.serviceWorker.register(
        './service-worker.js?v=r8-s5-3',
        { scope: './' }
      );
      if (!registration.scope.endsWith(expectedPath)) throw new Error('scope');
      const controlled = await waitForLocalController();
      if (!controlled) throw new Error('controller');
      workerState = 'ready';
      publish('Lokale PWA und isolierter Service Worker sind bereit.', 'ready');
    } catch (_) {
      workerState = 'failed';
      publish('Lokale PWA aktiv; Service-Worker-Registrierung fehlgeschlagen.', 'blocked');
      return;
    }
    await loadHarness();
  }

  start().catch(() => {
    workerState = 'failed';
    publish('Lokale PWA konnte den isolierten Harness nicht starten.', 'blocked');
  });
})(typeof window !== 'undefined' ? window : globalThis);
