'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePaths = [
  'semantics.js',
  'semantics-v2.js',
  'session-canonicalization.js',
  'session-correction.js',
  'session-history.js'
].map((name) => path.join(__dirname, name));
const sources = sourcePaths.map((filePath) => [
  filePath,
  fs.readFileSync(filePath, 'utf8')
]);
const FINGERPRINT_A = 'a'.repeat(64);
const FINGERPRINT_B = 'b'.repeat(64);
const FINGERPRINT_C = 'c'.repeat(64);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function uuidFor(number) {
  return `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
}

function makeRuntime() {
  const activityV1 = { sentinel: true };
  const context = vm.createContext({
    AppModules: { activity: activityV1 },
    console,
    setTimeout,
    clearTimeout
  });
  sources.forEach(([filePath, source]) => {
    new vm.Script(source, { filename: filePath }).runInContext(context);
  });
  return {
    activityV1,
    context,
    history: context.AppModules.activityV2.sessionHistory,
    correction: context.AppModules.activityV2.sessionCorrection
  };
}

function snapshotItem(entry, itemOrder, values = {}) {
  const strength = entry.tracking_mode === 'strength_sets';
  return {
    item_key: entry.key,
    item_order: itemOrder,
    item_label_snapshot: entry.label,
    tracking_mode_snapshot: entry.tracking_mode,
    equipment_snapshot: entry.equipment,
    load_comparability_snapshot: entry.load_comparability,
    field_policy_snapshot: clone(entry.fields),
    duration_min: strength ? null : 30,
    distance_km: entry.tracking_mode === 'duration_distance' ? 5.25 : null,
    note: null,
    sets: strength
      ? [
          {
            set_order: 1,
            tracking_mode: 'strength_sets',
            reps: 10,
            duration_sec: null,
            distance_m: null,
            weight_kg: entry.fields.weight_kg === 'forbidden' ? null : 80,
            assistance_kg: null
          }
        ]
      : [],
    ...values
  };
}

function makeDetail(context, number = 901) {
  const semantics = context.AppModules.activityV2.semanticsV2;
  const running = semantics.getEntryByKey('running');
  const bench = semantics.getEntryByKey('bench_press');
  return {
    schema_version: 'midas.activity-session-detail.v1',
    session_id: uuidFor(number),
    catalog_version: 2,
    revision: '7',
    content_fingerprint: FINGERPRINT_A,
    started_at: '2026-07-31T10:00:00.000Z',
    ended_at: '2026-07-31T10:30:00.000Z',
    day: '2026-07-31',
    title: 'Immutable title',
    duration_min: 30,
    note: null,
    items: [
      snapshotItem(running, 1),
      snapshotItem(bench, 2, {
        item_label_snapshot: 'Historischer Press',
        note: 'Persistierter Snapshot'
      })
    ]
  };
}

function makeSummary(number, startedAt, title = null) {
  return {
    session_id: uuidFor(number),
    started_at: startedAt,
    day: startedAt.slice(0, 10),
    title,
    duration_min: 30,
    item_count: 2,
    revision: '7'
  };
}

function summaryFromDetail(detail) {
  return {
    session_id: detail.session_id,
    started_at: detail.started_at,
    day: detail.day,
    title: detail.title,
    duration_min: detail.duration_min,
    item_count: detail.items.length,
    revision: detail.revision
  };
}

function makePage(items, hasMore = false) {
  return {
    schema_version: 'midas.activity-session-history-page.v1',
    items,
    has_more: hasMore,
    next_cursor: hasMore
      ? {
          started_at: items.at(-1).started_at,
          id: items.at(-1).session_id
        }
      : null
  };
}

function makeRecoveryState(itemCount = 0) {
  return Object.freeze({
    state: itemCount > 0 ? 'active' : 'empty',
    started_at: itemCount > 0 ? '2026-08-13T08:00:00.000Z' : null,
    saved_at: null,
    item_count: itemCount,
    reason: null
  });
}

function makeCommitState(state = 'editing', intentPresent = false) {
  return Object.freeze({
    state,
    reason: null,
    focus_target: null,
    intent_present: intentPresent
  });
}

function makeGuard(runtime, state = {}) {
  const values = {
    recovery: state.recovery ?? null,
    commit: state.commit ?? null
  };
  const guard = runtime.history.createMutationGuard({
    getRecovery: () => values.recovery,
    getSessionCommit: () => values.commit
  });
  return { guard, values };
}

function makeAdapter(overrides = {}) {
  return {
    listSessions: async () => makePage([]),
    loadSessionDetail: async () => null,
    replaceSession: async (request) => ({
      schema_version: 'midas.activity-session-mutation-result.v1',
      operation: 'replace',
      outcome: 'updated',
      session_id: request.sessionId,
      revision: '8',
      content_fingerprint: FINGERPRINT_B
    }),
    deleteSession: async (request) => ({
      schema_version: 'midas.activity-session-mutation-result.v1',
      operation: 'delete',
      outcome: 'deleted',
      session_id: request.sessionId
    }),
    ...overrides
  };
}

function makeController(runtime, adapter, guard, refreshLastPerformance = async (itemKeys) => ({
  status: 'success',
  items: itemKeys.map((itemKey) => ({
    item_key: itemKey,
    status: 'invalidated'
  }))
})) {
  return runtime.history.create({
    adapter,
    createCorrection: (detail) => runtime.correction.create(detail),
    mutationGuard: guard,
    refreshLastPerformance
  });
}

function unknownMutationError() {
  const error = new Error('safe');
  error.code = 'MUTATION_OUTCOME_UNKNOWN';
  error.mutationState = 'unknown';
  return error;
}

function domainError(code) {
  const error = new Error('safe');
  error.code = code;
  error.mutationState = 'not_applied';
  return error;
}

function detailFromReplacement(detail, request, fingerprint = FINGERPRINT_B) {
  const existing = new Map(detail.items.map((item) => [item.item_key, item]));
  const items = request.session.items.map((replacement) => {
    const snapshot = existing.get(replacement.item_key);
    assert.ok(snapshot, `fixture lacks snapshot ${replacement.item_key}`);
    return {
      ...clone(snapshot),
      item_order: replacement.item_order,
      duration_min: replacement.duration_min,
      distance_km: replacement.distance_km,
      note: replacement.note,
      sets: replacement.sets.map((set) => ({
        set_order: set.set_order,
        tracking_mode: 'strength_sets',
        reps: set.reps,
        duration_sec: set.duration_sec,
        distance_m: set.distance_m,
        weight_kg: set.weight_kg,
        assistance_kg: set.assistance_kg
      }))
    };
  });
  return {
    ...clone(detail),
    revision: '8',
    content_fingerprint: fingerprint,
    ended_at: new Date(
      Date.parse(detail.started_at) + request.session.duration_min * 60_000
    ).toISOString(),
    duration_min: request.session.duration_min,
    note: request.session.note,
    items
  };
}

async function openReadyDetail(controller, detail) {
  await controller.refreshHistory();
  await controller.openDetail(detail.session_id);
  assert.equal(controller.getState().detail.status, 'ready');
}

test('Block C namespaces and controller surfaces are exact, frozen and R14-product-loaded', () => {
  const runtime = makeRuntime();
  const { guard } = makeGuard(runtime);
  const controller = makeController(runtime, makeAdapter(), guard);
  assert.equal(runtime.context.AppModules.activity, runtime.activityV1);
  assert.deepEqual(Object.keys(runtime.history), ['create', 'createMutationGuard']);
  assert.equal(Object.isFrozen(runtime.history), true);
  assert.deepEqual(Object.keys(guard), ['check']);
  assert.equal(Object.isFrozen(guard), true);
  assert.deepEqual(Object.keys(controller), [
    'getState',
    'subscribe',
    'refreshHistory',
    'loadMore',
    'openDetail',
    'closeDetail',
    'openCorrection',
    'setCorrectionDurationMin',
    'setCorrectionNote',
    'addCorrectionItem',
    'removeCorrectionItem',
    'moveCorrectionItem',
    'setCorrectionItemField',
    'addCorrectionSet',
    'removeCorrectionSet',
    'setCorrectionSetField',
    'requestCloseCorrection',
    'cancelCloseCorrection',
    'confirmCloseCorrection',
    'saveCorrection',
    'retryCorrection',
    'openDelete',
    'closeDelete',
    'confirmDelete',
    'retryDelete',
    'refreshAdmission',
    'destroy'
  ]);
  assert.equal(Object.isFrozen(controller), true);
  assert.equal(Object.isFrozen(controller.getState()), true);
  const rootIndex = fs.readFileSync(
    path.resolve(__dirname, '../../../../..', 'index.html'),
    'utf8'
  );
  assert.equal(rootIndex.includes('session-history.js'), true);
  const source = sources.at(-1)[1];
  for (const forbidden of [
    /\bfetch\s*\(/,
    /\bindexedDB\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\.prepareCommit\s*\(/,
    /\.finish\s*\(/
  ]) {
    assert.equal(forbidden.test(source), false, String(forbidden));
  }
});

test('T-ACT-R9-05 covers loading, empty, initial error/retry and bounded append preservation', async () => {
  const runtime = makeRuntime();
  const first = makeSummary(901, '2026-08-12T10:00:00.000Z', 'Upper');
  const second = makeSummary(902, '2026-08-11T10:00:00.000Z');
  const third = makeSummary(903, '2026-08-10T10:00:00.000Z');
  let initialFailures = 1;
  let appendFailures = 1;
  const calls = [];
  const adapter = makeAdapter({
    listSessions: async (request) => {
      calls.push(clone(request));
      if (request.cursor === null) {
        if (initialFailures-- > 0) throw domainError('REQUEST_FAILED');
        return makePage([first, second], true);
      }
      if (appendFailures-- > 0) throw domainError('REQUEST_FAILED');
      return makePage([third]);
    }
  });
  const { guard } = makeGuard(runtime);
  const controller = makeController(runtime, adapter, guard);
  const firstLoad = controller.refreshHistory();
  assert.equal(controller.getState().history.status, 'loading');
  await firstLoad;
  assert.equal(controller.getState().history.status, 'error');
  await controller.refreshHistory();
  assert.equal(controller.getState().history.status, 'ready');
  assert.equal(controller.getState().history.items.length, 2);
  assert.equal(controller.getState().history.has_more, true);
  await controller.loadMore();
  assert.equal(controller.getState().history.items.length, 2);
  assert.equal(controller.getState().history.error, 'REQUEST_FAILED');
  await controller.loadMore();
  assert.equal(controller.getState().history.items.length, 3);
  assert.equal(controller.getState().history.has_more, false);
  assert.deepEqual(calls.map((call) => call.limit), [20, 20, 20, 20]);

  const emptyController = makeController(
    runtime,
    makeAdapter({ listSessions: async () => makePage([]) }),
    guard
  );
  await emptyController.refreshHistory();
  assert.equal(emptyController.getState().history.status, 'empty');
});

test('T-ACT-R9-06 renders only persisted detail snapshots and keeps absent non-leaking', async () => {
  const runtime = makeRuntime();
  const detail = makeDetail(runtime.context);
  const { guard } = makeGuard(runtime);
  const controller = makeController(
    runtime,
    makeAdapter({
      listSessions: async () => makePage([
        makeSummary(901, detail.started_at, detail.title)
      ]),
      loadSessionDetail: async (sessionId) =>
        sessionId === detail.session_id ? clone(detail) : null
    }),
    guard
  );
  await openReadyDetail(controller, detail);
  const state = controller.getState();
  assert.equal(state.detail.value.items[1].item_label_snapshot, 'Historischer Press');
  assert.equal(state.detail.value.items[1].note, 'Persistierter Snapshot');
  assert.equal(Object.hasOwn(state.detail.value.items[1], 'id'), false);
  await controller.openDetail(uuidFor(999));
  assert.equal(controller.getState().detail.status, 'not_found');
  assert.equal(controller.getState().detail.value, null);
});

test('T-ACT-R9-07 preserves the correction working copy through validation and dirty close', async () => {
  const runtime = makeRuntime();
  const detail = makeDetail(runtime.context);
  const { guard } = makeGuard(runtime);
  const controller = makeController(
    runtime,
    makeAdapter({
      listSessions: async () => makePage([makeSummary(901, detail.started_at)]),
      loadSessionDetail: async () => clone(detail)
    }),
    guard
  );
  await openReadyDetail(controller, detail);
  assert.equal(controller.openCorrection(), true);
  assert.equal(controller.getState().correction.status, 'pristine');
  controller.setCorrectionDurationMin(0);
  assert.equal(controller.getState().correction.status, 'error');
  assert.equal(controller.getState().correction.error, 'INVALID_VALUE');
  controller.setCorrectionDurationMin(45);
  controller.setCorrectionNote('  korrigiert  ');
  assert.equal(controller.getState().correction.status, 'dirty');
  assert.equal(controller.getState().correction.valid, true);
  assert.equal(controller.getState().correction.working_copy.note, 'korrigiert');
  assert.equal(controller.requestCloseCorrection(), false);
  assert.equal(controller.getState().correction.close_confirmation, true);
  controller.cancelCloseCorrection();
  assert.equal(controller.getState().correction.dirty, true);
  assert.equal(controller.getState().correction.working_copy.duration_min, 45);
  controller.requestCloseCorrection();
  controller.confirmCloseCorrection();
  assert.equal(controller.getState().correction.status, 'closed');
});

test('T-ACT-R9-08 confirms updated/replayed and preserves working copy on known conflict', async () => {
  const runtime = makeRuntime();
  const detail = makeDetail(runtime.context);
  let current = clone(detail);
  let outcome = 'replayed';
  const requests = [];
  const adapter = makeAdapter({
    listSessions: async () => makePage([summaryFromDetail(current)]),
    loadSessionDetail: async () => clone(current),
    replaceSession: async (request) => {
      requests.push(request);
      if (outcome === 'conflict') throw domainError('SESSION_CONFLICT');
      current = detailFromReplacement(current, request);
      return {
        schema_version: 'midas.activity-session-mutation-result.v1',
        operation: 'replace',
        outcome,
        session_id: request.sessionId,
        revision: '8',
        content_fingerprint: FINGERPRINT_B
      };
    }
  });
  const { guard } = makeGuard(runtime);
  const controller = makeController(runtime, adapter, guard);
  await openReadyDetail(controller, detail);
  controller.openCorrection();
  controller.setCorrectionDurationMin(40);
  await controller.saveCorrection();
  assert.equal(controller.getState().correction.status, 'confirmed');
  assert.equal(controller.getState().correction.confirmation, 'replayed');

  controller.requestCloseCorrection();
  controller.openCorrection();
  controller.setCorrectionDurationMin(42);
  outcome = 'conflict';
  await controller.saveCorrection();
  assert.equal(controller.getState().correction.status, 'conflict');
  assert.equal(controller.getState().correction.working_copy.duration_min, 42);
  assert.equal(requests.length, 2);
});

test('T-ACT-R9-16 navigation and competing reads stay fenced while a mutation is busy', async () => {
  const runtime = makeRuntime();
  const original = makeDetail(runtime.context);
  let current = clone(original);
  let releaseReplace;
  const adapter = makeAdapter({
    listSessions: async () => makePage([summaryFromDetail(current)]),
    loadSessionDetail: async () => clone(current),
    replaceSession: async (request) => {
      current = detailFromReplacement(current, request);
      return await new Promise((resolve) => {
        releaseReplace = () => resolve({
          schema_version: 'midas.activity-session-mutation-result.v1',
          operation: 'replace',
          outcome: 'updated',
          session_id: request.sessionId,
          revision: current.revision,
          content_fingerprint: current.content_fingerprint
        });
      });
    }
  });
  const { guard } = makeGuard(runtime);
  const controller = makeController(runtime, adapter, guard);
  await openReadyDetail(controller, original);
  controller.openCorrection();
  controller.setCorrectionDurationMin(40);
  const saving = controller.saveCorrection();
  assert.equal(controller.getState().mutation_busy, true);
  await assert.rejects(
    controller.refreshHistory(),
    (error) => error?.code === 'INVALID_STATE'
  );
  await assert.rejects(
    controller.openDetail(original.session_id),
    (error) => error?.code === 'INVALID_STATE'
  );
  assert.equal(controller.closeDetail(), false);
  assert.equal(controller.requestCloseCorrection(), false);
  assert.throws(
    () => controller.openDelete(),
    (error) => error?.code === 'INVALID_STATE'
  );
  releaseReplace();
  await saving;
  assert.equal(controller.getState().correction.status, 'confirmed');
  assert.equal(controller.getState().history.items[0].revision, '8');
});

test('T-ACT-R9-08 reconciles desired/preimage/changed and redispatches the identical request only', async () => {
  for (const mode of ['desired', 'preimage', 'changed']) {
    const runtime = makeRuntime();
    const original = makeDetail(runtime.context);
    let current = clone(original);
    const requests = [];
    const adapter = makeAdapter({
      listSessions: async () => makePage([summaryFromDetail(current)]),
      loadSessionDetail: async () => clone(current),
      replaceSession: async (request) => {
        requests.push(request);
        if (requests.length === 1) {
          if (mode === 'desired') {
            current = detailFromReplacement(original, request);
          } else if (mode === 'changed') {
            current = {
              ...clone(original),
              revision: '8',
              content_fingerprint: FINGERPRINT_C,
              note: 'Parallel geändert'
            };
          }
          throw unknownMutationError();
        }
        current = detailFromReplacement(original, request);
        return {
          schema_version: 'midas.activity-session-mutation-result.v1',
          operation: 'replace',
          outcome: 'updated',
          session_id: request.sessionId,
          revision: '8',
          content_fingerprint: FINGERPRINT_B
        };
      }
    });
    const { guard } = makeGuard(runtime);
    const controller = makeController(runtime, adapter, guard);
    await openReadyDetail(controller, original);
    controller.openCorrection();
    controller.setCorrectionDurationMin(40);
    await controller.saveCorrection();
    const after = controller.getState().correction;
    if (mode === 'desired') {
      assert.equal(after.status, 'confirmed');
      assert.equal(after.confirmation, 'reconciled');
    } else if (mode === 'preimage') {
      assert.equal(after.status, 'error');
      assert.equal(after.retry_mode, 'redispatch');
      const originalRequest = requests[0];
      await controller.retryCorrection();
      assert.equal(requests[1], originalRequest);
      assert.equal(controller.getState().correction.status, 'confirmed');
    } else {
      assert.equal(after.status, 'conflict');
      assert.equal(after.error, 'SESSION_CONFLICT');
      assert.equal(after.working_copy.duration_min, 40);
    }
  }
});

test('T-ACT-R9-09 guard is read-only, exact and fail-closed for draft/commit/dependency states', () => {
  const runtime = makeRuntime();
  const recovery = { getState: () => makeRecoveryState(0) };
  const commit = { getState: () => makeCommitState('editing', false) };
  const { guard, values } = makeGuard(runtime, { recovery, commit });
  assert.deepEqual(clone(guard.check()), { allowed: true, reason: null });
  values.recovery = { getState: () => makeRecoveryState(1) };
  assert.deepEqual(clone(guard.check()), {
    allowed: false,
    reason: 'active_draft'
  });
  values.recovery = null;
  values.commit = { getState: () => makeCommitState('unknown', true) };
  assert.deepEqual(clone(guard.check()), {
    allowed: false,
    reason: 'commit_unresolved'
  });
  values.commit = { getState: () => makeCommitState('not_committed', false) };
  assert.deepEqual(clone(guard.check()), { allowed: true, reason: null });
  values.commit = null;
  values.recovery = {
    getState: () =>
      Object.freeze({
        state: 'invented',
        started_at: null,
        saved_at: null,
        item_count: 0,
        reason: null
      })
  };
  assert.deepEqual(clone(guard.check()), {
    allowed: false,
    reason: 'guard_unavailable'
  });
  values.recovery = {
    getState: () => ({
      state: 'empty',
      started_at: null,
      saved_at: null,
      item_count: 0,
      reason: null
    })
  };
  assert.deepEqual(clone(guard.check()), {
    allowed: false,
    reason: 'guard_unavailable'
  });
  values.recovery = null;
  values.commit = {
    getState: () =>
      Object.freeze({
        state: 'editing',
        reason: {},
        focus_target: null,
        intent_present: false
      })
  };
  assert.deepEqual(clone(guard.check()), {
    allowed: false,
    reason: 'guard_unavailable'
  });
  values.commit = { getState: () => ({ state: 'editing' }) };
  assert.deepEqual(clone(guard.check()), {
    allowed: false,
    reason: 'guard_unavailable'
  });
  values.commit = { getState: () => { throw new Error('foreign'); } };
  assert.deepEqual(clone(guard.check()), {
    allowed: false,
    reason: 'guard_unavailable'
  });
  assert.deepEqual(Object.keys(recovery), ['getState']);
  assert.deepEqual(Object.keys(commit), ['getState']);
});

test('T-ACT-R9-09 delete confirmation is singular, repeat-safe and rechecks guard before dispatch', async () => {
  const runtime = makeRuntime();
  const detail = makeDetail(runtime.context);
  let deleteCalls = 0;
  let detailValue = clone(detail);
  const adapter = makeAdapter({
    listSessions: async () =>
      makePage(detailValue === null ? [] : [summaryFromDetail(detailValue)]),
    loadSessionDetail: async () =>
      detailValue === null ? null : clone(detailValue),
    deleteSession: async (request) => {
      deleteCalls += 1;
      detailValue = null;
      return {
        schema_version: 'midas.activity-session-mutation-result.v1',
        operation: 'delete',
        outcome: deleteCalls === 1 ? 'deleted' : 'already_absent',
        session_id: request.sessionId
      };
    }
  });
  const { guard, values } = makeGuard(runtime);
  const controller = makeController(runtime, adapter, guard);
  await openReadyDetail(controller, detail);
  assert.equal(controller.openDelete(), true);
  assert.deepEqual(clone(controller.getState().deletion.context), {
    session_id: detail.session_id,
    day: detail.day,
    item_count: 2
  });
  const pending = controller.confirmDelete();
  values.recovery = { getState: () => makeRecoveryState(1) };
  await pending;
  assert.equal(deleteCalls, 0);
  assert.equal(controller.getState().admission.reason, 'active_draft');

  values.recovery = null;
  controller.closeDelete();
  assert.equal(controller.openDelete(), true);
  await controller.confirmDelete();
  assert.equal(deleteCalls, 1);
  assert.equal(controller.getState().deletion.status, 'confirmed');
  assert.equal(controller.getState().deletion.confirmation, 'deleted');
  assert.equal(controller.getState().detail.status, 'not_found');
});

test('T-ACT-R9-09 delete admission rejects malformed item keys through the stable error boundary', async () => {
  const runtime = makeRuntime();
  const detail = makeDetail(runtime.context);
  detail.items[0].item_key = 'INVALID KEY';
  const adapter = makeAdapter({
    loadSessionDetail: async () => clone(detail)
  });
  const { guard } = makeGuard(runtime);
  const controller = makeController(runtime, adapter, guard);
  await openReadyDetail(controller, detail);

  assert.throws(
    () => controller.openDelete(),
    (error) =>
      error?.name === 'ActivityV2SessionHistoryError' &&
      error?.code === 'INVALID_STATE' &&
      error?.message === 'The activity session history operation could not be completed.'
  );
  assert.equal(controller.getState().deletion.status, 'closed');
  assert.equal(controller.getState().mutation_busy, false);
});

test('T-ACT-R9-09 unknown delete reconciles absent/preimage/changed without false success', async () => {
  for (const mode of ['absent', 'preimage', 'changed']) {
    const runtime = makeRuntime();
    const original = makeDetail(runtime.context);
    let current = clone(original);
    const requests = [];
    const adapter = makeAdapter({
      listSessions: async () =>
        makePage(current === null ? [] : [summaryFromDetail(current)]),
      loadSessionDetail: async () => (current === null ? null : clone(current)),
      deleteSession: async (request) => {
        requests.push(request);
        if (requests.length === 1) {
          if (mode === 'absent') current = null;
          if (mode === 'changed') {
            current = {
              ...clone(original),
              revision: '8',
              content_fingerprint: FINGERPRINT_C
            };
          }
          throw unknownMutationError();
        }
        current = null;
        return {
          schema_version: 'midas.activity-session-mutation-result.v1',
          operation: 'delete',
          outcome: 'deleted',
          session_id: request.sessionId
        };
      }
    });
    const { guard } = makeGuard(runtime);
    const controller = makeController(runtime, adapter, guard);
    await openReadyDetail(controller, original);
    controller.openDelete();
    await controller.confirmDelete();
    const after = controller.getState().deletion;
    if (mode === 'absent') {
      assert.equal(after.status, 'confirmed');
      assert.equal(after.confirmation, 'reconciled_absent');
    } else if (mode === 'preimage') {
      assert.equal(after.status, 'error');
      assert.equal(after.retry_mode, 'redispatch');
      const originalRequest = requests[0];
      await controller.retryDelete();
      assert.equal(requests[1], originalRequest);
      assert.equal(controller.getState().deletion.status, 'confirmed');
    } else {
      assert.equal(after.status, 'conflict');
      assert.equal(after.error, 'SESSION_CONFLICT');
    }
  }
});
