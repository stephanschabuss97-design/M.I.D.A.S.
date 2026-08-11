'use strict';

(function runActivityV2SessionCommitHarness(root) {
  const FIXTURES = Object.freeze([
    'success',
    'known',
    'release',
    'unknown',
    'cleanup',
    'blocked',
    'preparing',
    'committing',
    'reload',
    'race2',
    'race3',
    'all'
  ]);
  const FINAL_STATES = Object.freeze([
    'editing',
    'not_committed',
    'release_pending',
    'unknown',
    'cleanup_pending',
    'committed',
    'blocked',
    'destroyed'
  ]);
  const EXPECTED_STATES = Object.freeze([
    'editing',
    'preparing',
    'committing',
    'not_committed',
    'release_pending',
    'unknown',
    'cleanup_pending',
    'committed',
    'blocked',
    'destroyed'
  ]);
  const BASE_CLOCK = Date.parse('2026-08-10T09:00:00.000Z');
  const status = root.document.getElementById('harness-status');
  const metrics = root.document.getElementById('harness-metrics');
  const dashboard = root.document.getElementById('harness-dashboard');
  const activityV2 = root.AppModules?.activityV2;
  const semantics = activityV2?.semanticsV2;
  const recoveryApi = activityV2?.sessionRecovery;
  const commitApi = activityV2?.sessionCommit;
  const shellApi = activityV2?.sessionShell;
  const adapterApi = activityV2?.sessionCommitHarnessAdapter;
  let uuidSequence = 1;
  let scenarioClock = BASE_CLOCK;
  let active = null;
  let harnessStage = 'startup';

  function fail(message) {
    throw new Error(message);
  }

  function nextUuid() {
    const suffix = uuidSequence.toString(16).padStart(12, '0');
    uuidSequence += 1;
    return `00000000-0000-4000-8000-${suffix}`;
  }

  async function synchronizeUuidSequence() {
    const store = recoveryApi.createIndexedDbStore();
    try {
      const observation = await store.read();
      const seen = new WeakSet();
      function visit(value) {
        if (typeof value === 'string') {
          const match = /^00000000-0000-4000-8000-([0-9a-f]{12})$/.exec(value);
          if (match) {
            const parsed = Number.parseInt(match[1], 16);
            if (Number.isSafeInteger(parsed) && parsed >= uuidSequence) {
              uuidSequence = parsed + 1;
            }
          }
          return;
        }
        if (value === null || typeof value !== 'object' || seen.has(value)) return;
        seen.add(value);
        Reflect.ownKeys(value).forEach((key) => {
          const descriptor = Object.getOwnPropertyDescriptor(value, key);
          if (descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
            visit(descriptor.value);
          }
        });
      }
      visit(observation);
    } finally {
      store.close();
    }
  }

  function delay(milliseconds) {
    return new Promise((resolve) => root.setTimeout(resolve, milliseconds));
  }

  function resolveSemantics(version) {
    if (version === 1) return activityV2.semantics ?? null;
    if (version === 2) return activityV2.semanticsV2;
    return null;
  }

  function metric(label, value) {
    const row = root.document.createElement('div');
    const term = root.document.createElement('dt');
    const description = root.document.createElement('dd');
    term.textContent = label;
    description.textContent = String(value);
    row.append(term, description);
    return row;
  }

  function publishResult(result) {
    const snapshot = Object.freeze({
      fixture: result.fixture,
      state: result.state,
      pass: result.pass === true,
      ready: result.ready === true,
      observed_states: Object.freeze([...(result.observed_states || [])]),
      attempt_numbers: Object.freeze([...(result.attempt_numbers || [])]),
      dispatch_count: result.dispatch_count || 0,
      identity_stable: result.identity_stable !== false,
      race_participants: result.race_participants || 0,
      race_committed: result.race_committed || 0,
      race_unknown: result.race_unknown || 0,
      failure_stage: result.failure_stage || null,
      failure_code: result.failure_code || null
    });
    root.__MIDAS_ACTIVITY_V2_COMMIT_HARNESS__ = snapshot;
    status.dataset.result = snapshot.pass ? 'pass' : 'fail';
    status.dataset.ready = snapshot.ready ? 'true' : 'false';
    status.dataset.fixture = snapshot.fixture;
    status.dataset.state = snapshot.state;
    status.dataset.identityStable = String(snapshot.identity_stable);
    if (snapshot.failure_stage) status.dataset.failureStage = snapshot.failure_stage;
    else delete status.dataset.failureStage;
    if (snapshot.failure_code) status.dataset.failureCode = snapshot.failure_code;
    else delete status.dataset.failureCode;
    status.textContent = snapshot.pass
      ? `${snapshot.fixture}: ${snapshot.state} · PASS`
      : `${snapshot.fixture}: ${snapshot.state} · FAIL`;
    status.dataset.tone = snapshot.pass ? 'success' : 'error';
    metrics.replaceChildren(
      metric('Fixture', snapshot.fixture),
      metric('Zustand', snapshot.state),
      metric('Dispatches', snapshot.dispatch_count),
      metric('Attempts', snapshot.attempt_numbers.join(',') || '—'),
      metric('Identität stabil', snapshot.identity_stable ? 'ja' : 'nein'),
      metric(
        'Race',
        snapshot.race_participants
          ? `${snapshot.race_committed} commit / ${snapshot.race_unknown} unknown`
          : '—'
      )
    );
    root.document.title =
      `Activity V2 Commit Harness · ${snapshot.state.toUpperCase()} · ` +
      (snapshot.pass ? 'PASS' : 'FAIL');
    return snapshot;
  }

  function assertDependencies() {
    if (
      !status ||
      !metrics ||
      !dashboard ||
      typeof semantics?.getCatalog !== 'function' ||
      typeof recoveryApi?.createIndexedDbStore !== 'function' ||
      typeof recoveryApi?.open !== 'function' ||
      typeof commitApi?.create !== 'function' ||
      typeof shellApi?.mount !== 'function' ||
      typeof adapterApi?.createServer !== 'function' ||
      typeof adapterApi?.createStorageAdapter !== 'function'
    ) {
      fail('Harness dependencies are unavailable.');
    }
  }

  async function openRecovery(storage) {
    return await recoveryApi.open({
      storage,
      semantics,
      resolveSemantics,
      now: () => scenarioClock,
      createRequestId: nextUuid,
      createLeaseToken: nextUuid
    });
  }

  function createControlledStorage(control, events) {
    return adapterApi.createStorageAdapter({
      base: recoveryApi.createIndexedDbStore(),
      control,
      onEvent(event) {
        events.push(event);
      }
    });
  }

  async function disposeActive() {
    if (!active) return;
    try {
      active.shell?.destroy();
    } catch {
      // View cleanup is best effort and never owns persistence.
    }
    try {
      active.commit?.destroy();
    } catch {
      // Coordinator destroy is persistence-free.
    }
    try {
      active.recovery?.destroy();
    } catch {
      // Recovery destroy closes only the local handle.
    }
    active = null;
    await delay(0);
  }

  async function settlePersistedSlot() {
    harnessStage = 'settle:open';
    const recovery = await openRecovery(recoveryApi.createIndexedDbStore());
    try {
      const initial = recovery.getState().state;
      if (initial === 'empty') return;
      if (initial === 'blocked' || initial === 'degraded') {
        fail('Persisted harness slot is not safely recoverable.');
      }
      if (initial === 'recoverable') recovery.continueSession();
      const draft = recovery.getDraft();
      if (!draft) fail('Persisted harness draft is unavailable.');
      if (recovery.getCommitIntent() !== null) {
        harnessStage = 'settle:retry-intent';
        const server = adapterApi.createServer();
        const commit = commitApi.create({
          draft,
          recovery,
          semantics,
          commitSession: server.createClient(),
          now: () => scenarioClock
        });
        try {
          const result = await commit.retry();
          if (result.state !== 'committed') fail('Persisted intent cleanup failed.');
        } finally {
          commit.destroy();
        }
        return;
      }
      harnessStage = 'settle:discard-draft';
      await recovery.discard();
    } finally {
      recovery.destroy();
    }
  }

  function fillDraft(draft) {
    draft.addItem('running');
    draft.setItemField('running', 'duration_min', '35');
    draft.setItemField('running', 'distance_km', '5,25');
    draft.setItemField('running', 'note', 'Lokales Harness-Fixture');
    draft.setNote('Isolierter Commit-Nachweis');
  }

  function attemptNumbers(events) {
    return events
      .filter((event) => event.type === 'attempt_claim')
      .map((event) => event.attempt_number);
  }

  function liveResult(context, ready = false, overrides = {}) {
    const server = context.server.getSnapshot();
    const current = context.commit.getState();
    return publishResult({
      fixture: context.fixture,
      state: current.state,
      pass: EXPECTED_STATES.includes(current.state),
      ready: ready || FINAL_STATES.includes(current.state),
      observed_states: context.states,
      attempt_numbers: attemptNumbers(context.events),
      dispatch_count: server.dispatch_count,
      identity_stable: server.identity_stable,
      ...overrides
    });
  }

  async function setupFresh(options = {}) {
    harnessStage = `setup:${options.fixture || 'success'}:dispose`;
    await disposeActive();
    harnessStage = `setup:${options.fixture || 'success'}:settle`;
    await settlePersistedSlot();
    scenarioClock += 3_600_000;
    const control = {
      intentFailureOnce: options.intentFailureOnce === true,
      intentDelayMs: options.intentDelayMs || 0,
      releaseArmed: false,
      releaseFailureOnce: options.releaseFailureOnce === true,
      cleanupFailureOnce: options.cleanupFailureOnce === true
    };
    const events = [];
    const storage = createControlledStorage(control, events);
    harnessStage = `setup:${options.fixture || 'success'}:open`;
    const recovery = await openRecovery(storage);
    if (recovery.getState().state !== 'empty') fail('Fresh harness slot expected.');
    const draft = recovery.startNew();
    if (options.fill !== false) fillDraft(draft);
    else draft.setNote('Lokale Leersession für Fokusvalidierung');
    harnessStage = `setup:${options.fixture || 'success'}:flush`;
    await recovery.flush();
    scenarioClock += 35 * 60 * 1000;
    harnessStage = `setup:${options.fixture || 'success'}:server`;
    const server = adapterApi.createServer();
    const commitSession = server.createClient({
      fault: options.fault || 'success',
      delayMs: options.remoteDelayMs || 0,
      onDispatch() {
        if (options.releaseFailureOnce === true) control.releaseArmed = true;
      }
    });
    harnessStage = `setup:${options.fixture || 'success'}:commit`;
    const commit = commitApi.create({
      draft,
      recovery,
      semantics,
      commitSession,
      now: () => scenarioClock
    });
    const states = [];
    const context = {
      fixture: options.fixture || 'success',
      publishUpdates: options.publishUpdates !== false,
      control,
      events,
      recovery,
      draft,
      server,
      commit,
      shell: null,
      states
    };
    harnessStage = `setup:${options.fixture || 'success'}:subscribe`;
    commit.subscribe((state) => {
      states.push(state.state);
      if (active === context && context.publishUpdates !== false) {
        liveResult(context, false);
      }
    });
    harnessStage = `setup:${options.fixture || 'success'}:mount`;
    const shell = shellApi.mount({
      host: root.document.body,
      draft,
      recovery,
      sessionCommit: commit,
      semantics,
      confirmDiscard: () => false
    });
    context.shell = shell;
    active = context;
    harnessStage = `setup:${options.fixture || 'success'}:ready`;
    if (options.visible !== false) shell.open({ opener: root.document.activeElement });
    return context;
  }

  async function waitForState(commit, expected, timeoutMs = 2_000) {
    const started = Date.now();
    while (commit.getState().state !== expected) {
      if (Date.now() - started > timeoutMs) fail(`State ${expected} timed out.`);
      await delay(5);
    }
  }

  async function runSimpleFixture(fixture, visible = true) {
    harnessStage = `simple:${fixture}`;
    const options = {
      fixture,
      visible,
      fault: 'success'
    };
    if (fixture === 'known') options.fault = 'known_auth';
    if (fixture === 'release') {
      options.fault = 'known_auth';
      options.releaseFailureOnce = true;
    }
    if (fixture === 'unknown') options.fault = 'response_loss';
    if (fixture === 'cleanup') options.cleanupFailureOnce = true;
    if (fixture === 'blocked') options.intentFailureOnce = true;
    if (fixture === 'preparing') {
      options.intentDelayMs = 10_000;
      options.publishUpdates = false;
    }
    if (fixture === 'committing') {
      options.remoteDelayMs = 10_000;
      options.publishUpdates = false;
    }
    const context = await setupFresh(options);
    const operation = context.commit.finish();
    if (fixture === 'preparing') {
      await waitForState(context.commit, 'preparing');
      return liveResult(context, true);
    }
    if (fixture === 'committing') {
      await waitForState(context.commit, 'committing');
      return liveResult(context, true);
    }
    await operation;
    return liveResult(context, true);
  }

  async function runReloadFixture(visible = true) {
    harnessStage = 'reload:seed';
    const seed = await setupFresh({
      fixture: 'reload',
      visible: false,
      fault: 'response_loss'
    });
    await seed.commit.finish();
    if (seed.commit.getState().state !== 'unknown') fail('Unknown seed failed.');
    const server = seed.server;
    const seedStates = [...seed.states];
    const seedEvents = [...seed.events];
    await disposeActive();
    harnessStage = 'reload:resume';

    const events = [];
    const control = {
      intentFailureOnce: false,
      intentDelayMs: 0,
      releaseArmed: false,
      releaseFailureOnce: false,
      cleanupFailureOnce: false
    };
    const recovery = await openRecovery(createControlledStorage(control, events));
    if (recovery.getState().state !== 'recoverable') fail('Reload recovery failed.');
    const draft = recovery.continueSession();
    const commit = commitApi.create({
      draft,
      recovery,
      semantics,
      commitSession: server.createClient(),
      now: () => scenarioClock
    });
    if (commit.getState().state !== 'unknown') fail('Reload intent was not resumed.');
    const states = [...seedStates, commit.getState().state];
    const context = {
      fixture: 'reload',
      control,
      events: [...seedEvents, ...events],
      recovery,
      draft,
      server,
      commit,
      shell: null,
      states
    };
    commit.subscribe((state) => {
      states.push(state.state);
      if (active === context) liveResult(context, false);
    });
    const shell = shellApi.mount({
      host: root.document.body,
      draft,
      recovery,
      sessionCommit: commit,
      semantics,
      confirmDiscard: () => false
    });
    context.shell = shell;
    active = context;
    if (visible) shell.open({ opener: root.document.activeElement });
    await commit.retry();
    context.events = [...seedEvents, ...events];
    const result = liveResult(context, true);
    if (
      result.state !== 'committed' ||
      !result.identity_stable ||
      server.getSnapshot().replayed_count !== 1
    ) {
      fail('Reload replay contract failed.');
    }
    return result;
  }

  async function openRaceParticipant(server, events) {
    const control = {
      intentFailureOnce: false,
      intentDelayMs: 0,
      releaseArmed: false,
      releaseFailureOnce: false,
      cleanupFailureOnce: false
    };
    const recovery = await openRecovery(createControlledStorage(control, events));
    if (recovery.getState().state !== 'recoverable') fail('Race recovery failed.');
    const draft = recovery.continueSession();
    const commit = commitApi.create({
      draft,
      recovery,
      semantics,
      commitSession: server.createClient(),
      now: () => scenarioClock
    });
    if (commit.getState().state !== 'unknown') fail('Race intent missing.');
    return { recovery, commit };
  }

  async function runRace(participants, publish = true) {
    harnessStage = `race${participants}:seed`;
    const seed = await setupFresh({
      fixture: `race${participants}`,
      visible: false,
      fault: 'response_loss'
    });
    await seed.commit.finish();
    if (seed.commit.getState().state !== 'unknown') fail('Race seed failed.');
    const server = seed.server;
    const seedEvents = [...seed.events];
    await disposeActive();
    harnessStage = `race${participants}:participants`;
    const events = [];
    const tabs = [];
    for (let index = 0; index < participants; index += 1) {
      tabs.push(await openRaceParticipant(server, events));
    }
    const results = await Promise.all(tabs.map((tab) => tab.commit.retry()));
    const committed = results.filter((result) => result.state === 'committed').length;
    const unknown = results.filter((result) => result.state === 'unknown').length;
    const serverState = server.getSnapshot();
    const allEvents = [...seedEvents, ...events];
    const attempts = attemptNumbers(allEvents);
    const pass =
      committed === 1 &&
      unknown === participants - 1 &&
      serverState.created_count === 1 &&
      serverState.replayed_count === 1 &&
      serverState.identity_stable &&
      attempts.includes(1) &&
      attempts.includes(2);
    tabs.forEach((tab) => {
      try {
        tab.commit.destroy();
      } catch {}
      try {
        tab.recovery.destroy();
      } catch {}
    });
    const result = {
      fixture: `race${participants}`,
      state: pass ? 'committed' : 'blocked',
      pass,
      ready: true,
      observed_states: results.map((value) => value.state),
      attempt_numbers: attempts,
      dispatch_count: serverState.dispatch_count,
      identity_stable: serverState.identity_stable,
      race_participants: participants,
      race_committed: committed,
      race_unknown: unknown
    };
    return publish ? publishResult(result) : Object.freeze(result);
  }

  async function captureCase(fixture, retryState = null) {
    harnessStage = `all:${fixture}`;
    const context = await setupFresh({
      fixture,
      visible: false,
      fault:
        fixture === 'known' || fixture === 'release'
          ? 'known_auth'
          : fixture === 'unknown'
            ? 'response_loss'
            : 'success',
      fill: fixture !== 'validation',
      releaseFailureOnce: fixture === 'release',
      cleanupFailureOnce: fixture === 'cleanup',
      intentFailureOnce: fixture === 'blocked'
    });
    await context.commit.finish();
    if (retryState && context.commit.getState().state === retryState) {
      await context.commit.retry();
    }
    const states = [...context.states];
    context.commit.destroy();
    states.push('destroyed');
    await disposeActive();
    return states;
  }

  async function runAll() {
    harnessStage = 'all:start';
    const observed = new Set();
    const cases = [
      ['validation', null],
      ['known', null],
      ['release', 'release_pending'],
      ['unknown', 'unknown'],
      ['cleanup', 'cleanup_pending'],
      ['blocked', null]
    ];
    for (const [fixture, retryState] of cases) {
      const states = await captureCase(fixture, retryState);
      states.forEach((state) => observed.add(state));
    }
    const race2 = await runRace(2, false);
    const race3 = await runRace(3, false);
    const missing = EXPECTED_STATES.filter((state) => !observed.has(state));
    return publishResult({
      fixture: 'all',
      state: missing.length === 0 && race2.pass && race3.pass ? 'committed' : 'blocked',
      pass: missing.length === 0 && race2.pass && race3.pass,
      ready: true,
      observed_states: [...observed],
      attempt_numbers: [...race2.attempt_numbers, ...race3.attempt_numbers],
      dispatch_count: race2.dispatch_count + race3.dispatch_count,
      identity_stable: race2.identity_stable && race3.identity_stable,
      race_participants: 5,
      race_committed: race2.race_committed + race3.race_committed,
      race_unknown: race2.race_unknown + race3.race_unknown
    });
  }

  async function run() {
    assertDependencies();
    await synchronizeUuidSequence();
    const requested = new URL(root.location.href).searchParams.get('fixture');
    const fixture = requested === null ? null : requested.toLowerCase();
    if (fixture === null) {
      publishResult({
        fixture: 'menu',
        state: 'editing',
        pass: true,
        ready: true,
        observed_states: ['editing'],
        attempt_numbers: [],
        dispatch_count: 0,
        identity_stable: true
      });
      return;
    }
    if (!FIXTURES.includes(fixture)) fail('Unknown fixture.');
    status.textContent = `${fixture}: läuft …`;
    status.dataset.ready = 'false';
    if (fixture === 'reload') await runReloadFixture();
    else if (fixture === 'race2') await runRace(2);
    else if (fixture === 'race3') await runRace(3);
    else if (fixture === 'all') await runAll();
    else await runSimpleFixture(fixture);
  }

  run().catch(async (error) => {
    const codeDescriptor = Object.getOwnPropertyDescriptor(error || {}, 'code');
    const failureCode =
      codeDescriptor && Object.prototype.hasOwnProperty.call(codeDescriptor, 'value')
        ? String(codeDescriptor.value)
        : String(error?.name || 'Error');
    try {
      await disposeActive();
    } catch {
      // Failure publication below must remain the terminal error boundary.
    }
    try {
      publishResult({
        fixture: 'harness',
        state: 'blocked',
        pass: false,
        ready: true,
        observed_states: [],
        attempt_numbers: [],
        dispatch_count: 0,
        identity_stable: true,
        failure_stage: harnessStage,
        failure_code: failureCode
      });
    } catch {
      try {
        root.__MIDAS_ACTIVITY_V2_COMMIT_HARNESS__ = Object.freeze({
          fixture: 'harness',
          state: 'blocked',
          pass: false,
          ready: true,
          failure_stage: harnessStage,
          failure_code: failureCode
        });
      } catch {
        // A non-writable root still must not create a second rejection.
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
