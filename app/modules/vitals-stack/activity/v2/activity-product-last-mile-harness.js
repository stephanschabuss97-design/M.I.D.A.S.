'use strict';

(function initActivityV2ProductLastMileHarness(root) {
  const status = root.document.getElementById('harness-status');
  const runButton = root.document.getElementById('harness-run');
  const productHost = root.document.getElementById('activity-v2-product-host');
  const sessionHost = root.document.getElementById('activity-v2-session-host');
  const historyHost = root.document.getElementById('activity-v2-history-host');
  const exportHost = root.document.getElementById('activity-v2-export-host');
  const url = new URL(root.location.href);
  const requestedMode = url.searchParams.get('mode');
  const mode = ['success', 'unknown', 'recovery', 'misdirect', 'reauth', 'aged'].includes(requestedMode)
    ? requestedMode
    : 'success';
  const phase = url.searchParams.get('phase') === 'resume' ? 'resume' : 'seed';
  const markers = new Set();
  const commitStates = [];
  const requestBodies = [];
  const responseLedger = new Map();
  let finishCalls = 0;
  let retryCalls = 0;
  let controller = null;
  let lastProductState = null;
  let diagnosticStage = 'not_started';
  let diagnosticCode = null;
  let uuidSequence = mode === 'recovery' && phase === 'resume' ? 100 : 1;
  let clock = Date.parse('2026-09-05T10:00:00.000Z');

  function fail(message) {
    throw new Error(message);
  }

  function deepFreeze(value, seen = new WeakSet()) {
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function') ||
      seen.has(value)
    ) {
      return value;
    }
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => deepFreeze(value[key], seen));
    return Object.freeze(value);
  }

  function waitFor(predicate, message, timeoutMs = 3000) {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve, reject) => {
      const inspect = () => {
        let value = null;
        try {
          value = predicate();
        } catch (error) {
          reject(error);
          return;
        }
        if (value) {
          resolve(value);
          return;
        }
        if (Date.now() >= deadline) {
          reject(new Error(message));
          return;
        }
        root.setTimeout(inspect, 10);
      };
      inspect();
    });
  }

  function makeUuid() {
    const tail = String(uuidSequence).padStart(12, '0');
    uuidSequence += 1;
    return `00000000-0000-4000-8000-${tail}`;
  }

  function response(body) {
    return {
      status: 200,
      ok: true,
      async json() { return JSON.parse(JSON.stringify(body)); },
      clone() { return response(body); }
    };
  }

  function makeCommitResult(rpcBody, outcome) {
    const semantics = root.AppModules.activityV2.semanticsV2;
    const responseTime = '2026-09-05T10:30:00.123456Z';
    const responseTimestamp = (value) => value.replace(/\.(\d{3})Z$/, '.$1000Z');
    return {
      schema_version: 'midas.activity-session-result.v1',
      outcome,
      session: {
        id: '00000000-0000-4000-8000-000000000900',
        request_id: rpcBody.p_request_id,
        started_at: responseTimestamp(rpcBody.p_payload.started_at),
        ended_at: responseTimestamp(rpcBody.p_payload.ended_at),
        day: rpcBody.p_payload.started_at.slice(0, 10),
        duration_min: rpcBody.p_payload.duration_min,
        title: rpcBody.p_payload.title,
        note: rpcBody.p_payload.note,
        created_at: responseTime,
        updated_at: responseTime,
        items: rpcBody.p_payload.items.map((item, itemIndex) => {
          const entry = semantics.getEntryByKey(item.item_key);
          return {
            id: `00000000-0000-4000-8000-${String(100 + itemIndex).padStart(12, '0')}`,
            catalog_version: rpcBody.p_payload.catalog_version,
            item_key: item.item_key,
            item_order: item.item_order,
            item_label_snapshot: entry.label,
            tracking_mode_snapshot: entry.tracking_mode,
            equipment_snapshot: entry.equipment,
            load_comparability_snapshot: entry.load_comparability,
            field_policy_snapshot: JSON.parse(JSON.stringify(entry.fields)),
            duration_min: item.duration_min,
            distance_km: item.distance_km,
            note: item.note,
            created_at: responseTime,
            sets: item.sets.map((set, setIndex) => ({
              id: `00000000-0000-4000-8000-${String(200 + setIndex).padStart(12, '0')}`,
              set_order: set.set_order,
              tracking_mode: 'strength_sets',
              reps: set.reps,
              duration_sec: set.duration_sec,
              distance_m: set.distance_m,
              weight_kg: set.weight_kg,
              assistance_kg: set.assistance_kg,
              created_at: responseTime
            }))
          };
        })
      }
    };
  }

  function installControlledTransport() {
    Object.defineProperty(root.AppModules, 'supabase', {
      value: Object.freeze({
        baseUrlFromRest(value) {
          return String(value).replace(/\/rest\/v1\/?$/, '');
        },
        async fetchWithAuth(makeRequest) {
          return await makeRequest({});
        }
      }),
      enumerable: true,
      configurable: true
    });
    root.getConf = async (key) => {
      if (key !== 'webhookUrl') fail('unexpected configuration key');
      return 'https://activity-v2-last-mile.invalid/rest/v1/';
    };
    root.fetch = async (url, options) => {
      if (!String(url).endsWith('/rest/v1/rpc/activity_v2_commit_session')) {
        return response(null);
      }
      markers.add('transport_attempted');
      requestBodies.push(options.body);
      const rpcBody = JSON.parse(options.body);
      const keys = Object.keys(rpcBody).sort();
      if (keys.join(',') !== 'p_payload,p_request_id') fail('rpc body drift');
      const identity = options.body;
      const previous = responseLedger.get(rpcBody.p_request_id);
      if (previous !== undefined && previous !== identity) fail('retry identity drift');
      const outcome = previous === undefined ? 'created' : 'replayed';
      responseLedger.set(rpcBody.p_request_id, identity);
      if (mode === 'unknown' && requestBodies.length === 1) {
        throw new TypeError('controlled response loss');
      }
      return response(makeCommitResult(rpcBody, outcome));
    };
  }

  function makeRecoveryFacade(realApi) {
    return Object.freeze({
      createIndexedDbStore: realApi.createIndexedDbStore,
      async open(options) {
        diagnosticStage = 'recovery_open';
        try {
          const real = await realApi.open(options);
          diagnosticStage = 'recovery_opened';
          return deepFreeze({
            getState: real.getState,
            getDraft: real.getDraft,
            startNew() {
              diagnosticStage = 'recovery_start_new';
              try {
                const draft = real.startNew();
                diagnosticStage = 'recovery_started';
                return draft;
              } catch (error) {
                diagnosticCode = error?.code || error?.name || 'unknown';
                throw error;
              }
            },
            continueSession: real.continueSession,
            flush: real.flush,
            discard: real.discard,
            subscribe: real.subscribe,
            destroy: real.destroy,
            getCommitIntent: real.getCommitIntent,
            prepareCommit: real.prepareCommit,
            beginCommitAttempt: real.beginCommitAttempt,
            releaseCommit: real.releaseCommit,
            completeCommit: real.completeCommit
          });
        } catch (error) {
          diagnosticCode = error?.code || error?.name || 'unknown';
          throw error;
        }
      }
    });
  }

  function makeCommitFacade(realApi) {
    return Object.freeze({
      create(options) {
        diagnosticStage = 'commit_create';
        const real = realApi.create(options);
        diagnosticStage = 'commit_created';
        real.subscribe((state) => {
          commitStates.push(state.state);
          if (state.state === 'preparing') markers.add('preparing_published');
          if (state.state === 'committing') {
            markers.add('recovery_flushed');
            markers.add('intent_created');
          }
        });
        return deepFreeze({
          getState: real.getState,
          preflight: real.preflight,
          finish() {
            finishCalls += 1;
            markers.add('finish_invoked');
            return real.finish();
          },
          retry() {
            retryCalls += 1;
            return real.retry();
          },
          subscribe: real.subscribe,
          destroy: real.destroy
        });
      }
    });
  }

  function makeShellFacade(realApi) {
    return Object.freeze({
      mount(options) {
        diagnosticStage = 'shell_mount';
        try {
          const real = realApi.mount(options);
          diagnosticStage = 'shell_mounted';
          return Object.freeze({
            open(optionsValue) {
              diagnosticStage = 'shell_open';
              try {
                const result = real.open(optionsValue);
                diagnosticStage = 'shell_opened';
                return result;
              } catch (error) {
                diagnosticCode = error?.code || error?.name || 'unknown';
                throw error;
              }
            },
            render: real.render,
            requestClose: real.requestClose,
            isOpen: real.isOpen,
            refreshLastPerformance: real.refreshLastPerformance,
            destroy: real.destroy
          });
        } catch (error) {
          diagnosticCode = error?.code || error?.name || 'unknown';
          throw error;
        }
      }
    });
  }

  function configureClickMarkers() {
    sessionHost.addEventListener('click', (event) => {
      const action = event.target?.closest?.('[data-action]')?.dataset?.action;
      if (action === 'finish' || action === 'retry') {
        markers.add('click_received');
        markers.add('action_resolved');
      }
    }, true);
  }

  function setInputValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function addValidItemThroughShell(activityV2) {
    const entry = activityV2.semanticsV2.getEntryByKey('high_row');
    if (!entry || entry.tracking_mode !== 'strength_sets') fail('fixture entry unavailable');
    const search = sessionHost.querySelector('.activity-v2-session-search');
    if (!search) fail('real shell search unavailable');
    setInputValue(search, entry.label);
    const result = sessionHost.querySelector('[data-action="select-search-result"]');
    if (!result) fail('real shell result unavailable');
    result.click();
    const reps = [...sessionHost.querySelectorAll(
      '[data-item-key="high_row"][data-field-key="reps"]'
    )];
    const weights = [...sessionHost.querySelectorAll(
      '[data-item-key="high_row"][data-field-key="weight_kg"]'
    )];
    if (reps.length === 0 || reps.length !== weights.length) {
      fail('real shell fields unavailable');
    }
    reps.forEach((input) => setInputValue(input, '8'));
    weights.forEach((input) => setInputValue(input, '50'));
  }

  function assertPass() {
    const expectedMarkers = [
      'listener_bound',
      'click_received',
      'action_resolved',
      'finish_invoked',
      'preparing_published',
      'recovery_flushed',
      'intent_created',
      'transport_attempted'
    ];
    expectedMarkers.forEach((marker) => {
      if (!markers.has(marker)) fail(`missing marker: ${marker}`);
    });
    if (finishCalls !== 1) fail('finish dispatch count drift');
    if (mode !== 'unknown' && (retryCalls !== 0 || requestBodies.length !== 1)) {
      fail('success request count drift');
    }
    if (mode === 'unknown') {
      if (retryCalls !== 1 || requestBodies.length !== 2) fail('retry request count drift');
      if (requestBodies[0] !== requestBodies[1]) fail('retry body identity drift');
    }
    ['preparing', 'committing', mode === 'unknown' ? 'unknown' : 'committed']
      .forEach((state) => {
        if (!commitStates.includes(state)) fail(`missing commit state: ${state}`);
      });
    if (commitStates.at(-1) !== 'committed') fail('commit did not settle');
    if (mode === 'misdirect' && !markers.has('misdirected_click_reproduced')) {
      fail('misdirected click symptom was not reproduced');
    }
    if (mode === 'reauth' && !markers.has('reauth_surface_preserved')) {
      fail('reauth surface was not preserved');
    }
  }

  async function run() {
    runButton.disabled = true;
    status.dataset.result = 'running';
    status.textContent = `${mode}: läuft …`;
    try {
      const activityV2 = root.AppModules?.activityV2;
      if (!activityV2) fail('Activity V2 modules unavailable');
      installControlledTransport();
      configureClickMarkers();
      const commitFacade = makeCommitFacade(activityV2.sessionCommit);
      controller = activityV2.productController.mount({
        host: productHost,
        sessionHost,
        historyHost,
        exportHost,
        semantics: activityV2.semanticsV2,
        resolveSemantics: activityV2.sessionRecovery.resolveSemantics,
        sessionDraft: activityV2.sessionDraft,
        sessionRecovery: makeRecoveryFacade(activityV2.sessionRecovery),
        sessionCommit: commitFacade,
        sessionShell: makeShellFacade(activityV2.sessionShell),
        dataAccess: activityV2.dataAccess,
        sessionCorrection: activityV2.sessionCorrection,
        sessionHistory: activityV2.sessionHistory,
        sessionHistoryShell: activityV2.sessionHistoryShell,
        coachingExport: activityV2.coachingExport,
        coachingExportController: activityV2.coachingExportController,
        coachingExportShell: activityV2.coachingExportShell,
        now() {
          clock += 60_000;
          return clock;
        },
        createRequestId: makeUuid,
        createLeaseToken: makeUuid,
        confirmDiscard: async () => false,
        refreshActivityConsumers: async () => true
      });
      controller.subscribe((state) => {
        lastProductState = state;
      });
      await controller.setAuthenticated(true);
      if (mode === 'recovery' && phase === 'resume') {
        const resume = productHost.querySelector('[data-action="continue-session"]');
        if (!resume || resume.disabled) fail('product recovery resume unavailable');
        resume.click();
      } else {
        const start = productHost.querySelector('[data-action="start-session"]');
        if (!start || start.disabled) fail('product start unavailable');
        start.click();
      }
      await waitFor(
        () => sessionHost.querySelector('[data-action="finish"]'),
        'real finish button unavailable'
      );
      if (!(mode === 'recovery' && phase === 'resume')) {
        addValidItemThroughShell(activityV2);
      }
      if (mode === 'aged') {
        clock += 24 * 60 * 60 * 1000;
        const preflight = controller.preflightSessionCommit();
        if (
          preflight?.state !== 'blocked' ||
          preflight?.reason !== 'INVALID_TIME' ||
          preflight?.focus_target?.field_key !== 'duration_min' ||
          requestBodies.length !== 0
        ) {
          fail('aged draft preflight drift');
        }
        status.dataset.result = 'pass';
        status.textContent = 'aged: BLOCKED BEFORE TRANSPORT \u00b7 PASS';
        root.document.title = 'Activity V2 Last Mile \u00b7 AGED \u00b7 PASS';
        return;
      }
      if (mode === 'reauth') {
        await controller.setAuthenticated(true);
        if (
          lastProductState?.state !== 'editing' ||
          lastProductState?.active_surface !== 'session'
        ) {
          fail('reauth changed the active session surface');
        }
        markers.add('reauth_surface_preserved');
      }
      if (mode === 'recovery' && phase === 'seed') {
        await waitFor(
          () => [...sessionHost.querySelectorAll('[aria-label="Lokaler Wiederherstellungsstatus"]')]
            .some((element) => element.textContent === 'Lokal gesichert'),
          'recovery draft was not persisted'
        );
        root.location.replace('?mode=recovery&phase=resume&autorun=1');
        return;
      }
      const finish = sessionHost.querySelector('[data-action="finish"]');
      if (!finish || finish.disabled) fail('real finish button disabled');
      if (mode === 'misdirect') {
        const heading = [...sessionHost.querySelectorAll('h2')]
          .find((element) => element.textContent === 'Session abschließen');
        if (!heading) fail('commit heading unavailable');
        heading.click();
        await new Promise((resolve) => root.setTimeout(resolve, 50));
        const ready = [...sessionHost.querySelectorAll('[role="status"]')]
          .some((element) => element.textContent === 'Session bereit.');
        if (finishCalls !== 0 || requestBodies.length !== 0 || !ready) {
          fail('misdirected click did not remain fail-closed');
        }
        markers.add('misdirected_click_reproduced');
      }
      markers.add('listener_bound');
      finish.click();
      if (mode === 'unknown') {
        const retry = await waitFor(
          () => sessionHost.querySelector('[data-action="retry"]'),
          'real retry button unavailable'
        );
        retry.click();
      }
      await waitFor(
        () => commitStates.at(-1) === 'committed',
        'real commit did not settle'
      );
      assertPass();
      status.dataset.result = 'pass';
      status.textContent = `${mode}: COMMITTED · PASS`;
      root.document.title = `Activity V2 Last Mile · ${mode.toUpperCase()} · PASS`;
    } catch (error) {
      status.dataset.result = 'fail';
      const productReason = lastProductState?.reason
        ? ` · product:${lastProductState.reason}`
        : '';
      const diagnostic = ` · stage:${diagnosticStage}${diagnosticCode ? `/${diagnosticCode}` : ''}`;
      const safeTrace = ` · states:${commitStates.join('>') || 'none'} · markers:${[...markers].join(',') || 'none'}`;
      status.textContent = `${mode}: FAIL · ${error?.message || 'unknown'}${productReason}${diagnostic}${safeTrace}`;
      root.document.title = `Activity V2 Last Mile · ${mode.toUpperCase()} · FAIL`;
    } finally {
      runButton.disabled = false;
    }
  }

  runButton.addEventListener('click', run);
  if (url.searchParams.get('autorun') === '1') run();
})(window);
