'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const semanticsPath = path.join(__dirname, 'semantics.js');
const semanticsV2Path = path.join(__dirname, 'semantics-v2.js');
const dataAccessPath = path.join(__dirname, 'data-access.js');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const semanticsV2Source = fs.readFileSync(semanticsV2Path, 'utf8');
const dataAccessSource = fs.readFileSync(dataAccessPath, 'utf8');
const REQUEST_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const RESPONSE_TIME = '2026-07-31T12:34:56.123456Z';
const R9_RESPONSE_TIME = '2026-07-31T12:34:56.123Z';
const FINGERPRINT = 'a'.repeat(64);

function jsonClone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function makeResponse(status, body, { jsonError = null } = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      if (jsonError) throw jsonError;
      return jsonClone(body);
    },
    clone() {
      return makeResponse(status, body, { jsonError });
    }
  };
}

function makeHarness() {
  const state = {
    calls: [],
    diagnostics: [],
    fetchOptions: [],
    restConfig: 'https://example.supabase.co/rest/v1/',
    fetchImpl: async () => {
      throw new Error('fetch mock missing');
    },
    fetchWithAuthImpl: null
  };
  const activityV1 = { sentinel: true };
  const supabase = {
    baseUrlFromRest(value) {
      if (!value) return '';
      return String(value).replace(/\/rest\/v1\/?$/, '');
    },
    async fetchWithAuth(makeRequest, options) {
      state.fetchOptions.push(jsonClone(options));
      if (state.fetchWithAuthImpl) {
        return await state.fetchWithAuthImpl(makeRequest, options);
      }
      return await makeRequest({ authorization: 'Bearer test-token' });
    }
  };
  const context = vm.createContext({
    AppModules: { activity: activityV1, supabase },
    Headers,
    URL,
    console,
    diag: { add(message) { state.diagnostics.push(String(message)); } },
    async fetch(url, options) {
      state.calls.push({ url, options: { ...options, headers: options.headers } });
      return await state.fetchImpl(url, options);
    },
    async getConf(key) {
      assert.equal(key, 'webhookUrl');
      return state.restConfig;
    }
  });
  new vm.Script(semanticsSource, { filename: semanticsPath }).runInContext(context);
  new vm.Script(semanticsV2Source, { filename: semanticsV2Path }).runInContext(context);
  new vm.Script(dataAccessSource, { filename: dataAccessPath }).runInContext(context);
  return {
    activityV1,
    api: context.AppModules.activityV2.dataAccess,
    context,
    state
  };
}

function makeSet(setOrder, values = {}) {
  return {
    set_order: setOrder,
    reps: null,
    duration_sec: null,
    distance_m: null,
    weight_kg: null,
    assistance_kg: null,
    ...values
  };
}

function makePayload(mode = 'duration_distance') {
  const item =
    mode === 'strength_sets'
      ? {
          item_key: 'bench_press',
          item_order: 1,
          sets: [
            makeSet(2, { reps: 8, weight_kg: 82.5 }),
            makeSet(1, { reps: 10, weight_kg: 80 })
          ]
        }
      : mode === 'duration'
        ? {
            item_key: 'football',
            item_order: 1,
            duration_min: 45,
            sets: []
          }
        : {
            item_key: 'running',
            item_order: 1,
            duration_min: 30,
            distance_km: 5.25,
            note: ' Pace ',
            sets: []
          };
  return {
    schema_version: 'midas.activity-session.v1',
    catalog_version: 1,
    started_at: '2026-07-31T10:00:00.000000Z',
    ended_at: '2026-07-31T10:30:00.000000Z',
    duration_min: mode === 'duration' ? 45 : 30,
    title: ' Morning ',
    note: '',
    items: [item]
  };
}

function uuidFor(number) {
  return `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
}

function makeCommitResult(
  context,
  rpcPayload,
  outcome = 'created',
  semantics = context.AppModules.activityV2.semantics
) {
  return {
    schema_version: 'midas.activity-session-result.v1',
    outcome,
    session: {
      id: uuidFor(900),
      request_id: rpcPayload.p_request_id,
      started_at: rpcPayload.p_payload.started_at,
      ended_at: rpcPayload.p_payload.ended_at,
      day: '2026-07-31',
      duration_min: rpcPayload.p_payload.duration_min,
      title: rpcPayload.p_payload.title,
      note: rpcPayload.p_payload.note,
      created_at: RESPONSE_TIME,
      updated_at: RESPONSE_TIME,
      items: rpcPayload.p_payload.items.map((item, itemIndex) => {
        const entry = semantics.getEntryByKey(item.item_key);
        return {
          id: uuidFor(100 + itemIndex),
          catalog_version: rpcPayload.p_payload.catalog_version,
          item_key: item.item_key,
          item_order: item.item_order,
          item_label_snapshot: entry.label,
          tracking_mode_snapshot: entry.tracking_mode,
          equipment_snapshot: entry.equipment,
          load_comparability_snapshot: entry.load_comparability,
          field_policy_snapshot: jsonClone(entry.fields),
          duration_min: item.duration_min,
          distance_km: item.distance_km,
          note: item.note,
          created_at: RESPONSE_TIME,
          sets: item.sets.map((set, setIndex) => ({
            id: uuidFor(200 + setIndex),
            set_order: set.set_order,
            tracking_mode: 'strength_sets',
            reps: set.reps,
            duration_sec: set.duration_sec,
            distance_m: set.distance_m,
            weight_kg: set.weight_kg,
            assistance_kg: set.assistance_kg,
            created_at: RESPONSE_TIME
          }))
        };
      })
    }
  };
}

function makeV2Payload() {
  const payload = makePayload('strength_sets');
  payload.catalog_version = 2;
  payload.items[0].item_key = 'high_row';
  return payload;
}

function makeLookupResult(commitResult) {
  return {
    schema_version: 'midas.activity-last-performance.v1',
    session: {
      id: commitResult.session.id,
      started_at: commitResult.session.started_at,
      day: commitResult.session.day
    },
    item: jsonClone(commitResult.session.items[0])
  };
}

function makeHistoricalLookupResult(context, itemKey, values = {}) {
  const entry = context.AppModules.activityV2.semantics.getEntryByKey(itemKey);
  assert.ok(entry, `missing v1 fixture entry: ${itemKey}`);
  const item = {
    id: uuidFor(700),
    catalog_version: 1,
    item_key: itemKey,
    item_order: 1,
    item_label_snapshot: entry.label,
    tracking_mode_snapshot: entry.tracking_mode,
    equipment_snapshot: entry.equipment,
    load_comparability_snapshot: entry.load_comparability,
    field_policy_snapshot: jsonClone(entry.fields),
    duration_min: null,
    distance_km: null,
    note: null,
    created_at: RESPONSE_TIME,
    sets: [],
    ...values
  };
  if (entry.tracking_mode === 'strength_sets' && values.sets === undefined) {
    item.sets = [
      {
        id: uuidFor(701),
        set_order: 1,
        tracking_mode: 'strength_sets',
        reps: 12,
        duration_sec: null,
        distance_m: null,
        weight_kg: entry.fields.weight_kg === 'forbidden' ? null : 77.5,
        assistance_kg: null,
        created_at: RESPONSE_TIME
      }
    ];
  }
  if (entry.tracking_mode !== 'strength_sets' && values.duration_min === undefined) {
    item.duration_min = 45;
  }
  if (
    entry.tracking_mode === 'duration_distance' &&
    values.distance_km === undefined
  ) {
    item.distance_km = 5.25;
  }
  return {
    schema_version: 'midas.activity-last-performance.v1',
    session: {
      id: uuidFor(699),
      started_at: '2026-07-31T10:00:00.000000Z',
      day: '2026-07-31'
    },
    item
  };
}

function makeHistoryItem(number, startedAt = R9_RESPONSE_TIME, values = {}) {
  return {
    session_id: uuidFor(number),
    started_at: startedAt,
    day: startedAt.slice(0, 10),
    title: null,
    duration_min: 30,
    item_count: 1,
    revision: '1',
    ...values
  };
}

function makeHistoryPage(items, hasMore = false) {
  const last = items.at(-1);
  return {
    schema_version: 'midas.activity-session-history-page.v1',
    items,
    has_more: hasMore,
    next_cursor: hasMore
      ? { started_at: last.started_at, id: last.session_id }
      : null
  };
}

function makeDetail(context, values = {}) {
  const running = context.AppModules.activityV2.semantics.getEntryByKey('running');
  const bench = context.AppModules.activityV2.semantics.getEntryByKey('bench_press');
  return {
    schema_version: 'midas.activity-session-detail.v1',
    session_id: uuidFor(900),
    catalog_version: 1,
    revision: '9223372036854775807',
    content_fingerprint: FINGERPRINT,
    started_at: '2026-07-31T10:00:00.000Z',
    ended_at: '2026-07-31T10:30:00.000Z',
    day: '2026-07-31',
    title: 'Morning',
    duration_min: 30,
    note: null,
    items: [
      {
        item_key: 'running',
        item_order: 1,
        item_label_snapshot: running.label,
        tracking_mode_snapshot: running.tracking_mode,
        equipment_snapshot: running.equipment,
        load_comparability_snapshot: running.load_comparability,
        field_policy_snapshot: jsonClone(running.fields),
        duration_min: 30,
        distance_km: 5.25,
        note: null,
        sets: []
      },
      {
        item_key: 'bench_press',
        item_order: 2,
        item_label_snapshot: bench.label,
        tracking_mode_snapshot: bench.tracking_mode,
        equipment_snapshot: bench.equipment,
        load_comparability_snapshot: bench.load_comparability,
        field_policy_snapshot: jsonClone(bench.fields),
        duration_min: null,
        distance_km: null,
        note: 'Heavy',
        sets: [
          {
            set_order: 1,
            tracking_mode: 'strength_sets',
            reps: 10,
            duration_sec: null,
            distance_m: null,
            weight_kg: 80,
            assistance_kg: null
          }
        ]
      }
    ],
    ...values
  };
}

function makeReplacement() {
  return {
    schema_version: 'midas.activity-session-replacement.v1',
    duration_min: 35,
    note: null,
    items: [
      {
        item_key: 'running',
        item_order: 1,
        duration_min: 35,
        distance_km: 6.5,
        note: null,
        sets: []
      }
    ]
  };
}

async function captureError(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  assert.fail('expected promise to reject');
}

function assertDomainError(error, expected) {
  assert.equal(error.name, 'ActivityV2DataAccessError');
  assert.equal(error.code, expected.code);
  assert.equal(error.operation, expected.operation);
  assert.equal(error.retryable, expected.retryable);
  if (expected.operation === 'commitSession') {
    assert.equal(error.commitState, expected.commitState);
  } else {
    assert.equal(Object.hasOwn(error, 'commitState'), false);
  }
  if (['replaceSession', 'deleteSession'].includes(expected.operation)) {
    assert.equal(error.mutationState, expected.mutationState);
  } else {
    assert.equal(Object.hasOwn(error, 'mutationState'), false);
  }
  ['response', 'cause', 'details', 'raw', 'jwt'].forEach((key) => {
    assert.equal(Object.hasOwn(error, key), false);
  });
  assert.equal(error.message.includes('MIDAS_ACTIVITY_'), false);
}

test('classic-script namespace is immutable and preserves Activity V1', () => {
  const harness = makeHarness();
  assert.equal(harness.context.AppModules.activity, harness.activityV1);
  assert.equal(harness.context.AppModules.activity.sentinel, true);
  assert.deepEqual(Object.keys(harness.api).sort(), [
    'commitSession',
    'deleteSession',
    'listSessions',
    'loadCoachingExport',
    'loadLastPerformance',
    'loadSessionDetail',
    'replaceSession'
  ]);
  assert.equal(Object.isFrozen(harness.api), true);
  assert.equal(Object.isExtensible(harness.context.AppModules.activityV2), true);
  const descriptor = Object.getOwnPropertyDescriptor(
    harness.context.AppModules.activityV2,
    'dataAccess'
  );
  assert.deepEqual(
    {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      writable: descriptor.writable
    },
    { configurable: false, enumerable: true, writable: false }
  );
  assert.throws(
    () =>
      new vm.Script(dataAccessSource, { filename: dataAccessPath }).runInContext(
        harness.context
      ),
    /already registered/
  );
});

test('commit canonicalizes once and keeps request ID and body across retries', async () => {
  const harness = makeHarness();
  const payload = makePayload('strength_sets');
  const before = jsonClone(payload);
  harness.state.fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    return makeResponse(200, makeCommitResult(harness.context, request));
  };
  harness.state.fetchWithAuthImpl = async (makeRequest) => {
    await makeRequest({ authorization: 'Bearer first' });
    return await makeRequest({ authorization: 'Bearer refreshed' });
  };

  const result = await harness.api.commitSession({ requestId: REQUEST_ID, payload });

  assert.equal(result.outcome, 'created');
  assert.deepEqual(payload, before);
  assert.equal(harness.state.calls.length, 2);
  assert.equal(harness.state.calls[0].url, harness.state.calls[1].url);
  assert.equal(
    harness.state.calls[0].url,
    'https://example.supabase.co/rest/v1/rpc/activity_v2_commit_session'
  );
  assert.equal(
    harness.state.calls[0].options.body,
    harness.state.calls[1].options.body
  );
  const sent = JSON.parse(harness.state.calls[0].options.body);
  assert.equal(sent.p_request_id, REQUEST_ID);
  assert.equal(sent.p_payload.title, 'Morning');
  assert.equal(sent.p_payload.note, null);
  assert.deepEqual(
    sent.p_payload.items[0].sets.map((set) => set.set_order),
    [1, 2]
  );
  assert.deepEqual(harness.state.fetchOptions, [
    { tag: 'activity-v2:activity_v2_commit_session', maxAttempts: 2 }
  ]);
});

test('S4.7 explicit v2 semantics validates request and response without body drift', async () => {
  const harness = makeHarness();
  const semanticsV2 = harness.context.AppModules.activityV2.semanticsV2;
  const payload = makeV2Payload();
  const before = jsonClone(payload);
  harness.state.fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    return makeResponse(
      200,
      makeCommitResult(harness.context, request, 'created', semanticsV2)
    );
  };
  harness.state.fetchWithAuthImpl = async (makeRequest) => {
    await makeRequest({ authorization: 'Bearer first' });
    return await makeRequest({ authorization: 'Bearer refreshed' });
  };

  const result = await harness.api.commitSession({
    requestId: REQUEST_ID,
    payload,
    semantics: semanticsV2
  });

  assert.equal(result.outcome, 'created');
  assert.equal(result.session.items[0].catalog_version, 2);
  assert.equal(result.session.items[0].item_key, 'high_row');
  assert.deepEqual(payload, before);
  assert.equal(harness.state.calls.length, 2);
  assert.equal(
    harness.state.calls[0].options.body,
    harness.state.calls[1].options.body
  );
  const sent = JSON.parse(harness.state.calls[0].options.body);
  assert.deepEqual(Object.keys(sent), ['p_request_id', 'p_payload']);
  assert.equal(sent.p_payload.catalog_version, 2);
  assert.equal(sent.p_payload.items[0].item_key, 'high_row');
  assert.equal(harness.state.calls[0].options.body.includes('semantics'), false);
  assert.deepEqual(harness.state.fetchOptions, [
    { tag: 'activity-v2:activity_v2_commit_session', maxAttempts: 2 }
  ]);
});

test('S4.7 keeps v1 default and rejects option or catalog drift before transport', async () => {
  const cases = [
    (harness) => ({ requestId: REQUEST_ID, payload: makeV2Payload() }),
    (harness) => ({
      requestId: REQUEST_ID,
      payload: makePayload(),
      semantics: harness.context.AppModules.activityV2.semanticsV2
    }),
    (harness) => ({
      requestId: REQUEST_ID,
      payload: makeV2Payload(),
      semantics: harness.context.AppModules.activityV2.semantics
    }),
    () => ({ requestId: REQUEST_ID, payload: makePayload(), semantics: null }),
    () => ({
      requestId: REQUEST_ID,
      payload: makePayload(),
      semantics: undefined
    }),
    () => ({ requestId: REQUEST_ID, payload: makePayload(), semantics: {} }),
    (harness) => ({
      requestId: REQUEST_ID,
      payload: makePayload(),
      semantics: harness.context.AppModules.activityV2.semantics,
      extra: true
    }),
    (harness) => {
      const options = {
        requestId: REQUEST_ID,
        payload: makePayload(),
        semantics: harness.context.AppModules.activityV2.semantics
      };
      options[Symbol('unexpected')] = true;
      return options;
    },
    () => ({
      requestId: REQUEST_ID,
      payload: makePayload(),
      semantics: {
        getCatalog() {
          return { catalog_version: 0 };
        },
        getEntryByKey() {
          return null;
        }
      }
    })
  ];

  for (const createOptions of cases) {
    const harness = makeHarness();
    const error = await captureError(
      harness.api.commitSession(createOptions(harness))
    );
    assertDomainError(error, {
      code: 'INVALID_SESSION',
      operation: 'commitSession',
      retryable: false,
      commitState: 'not_committed'
    });
    assert.equal(harness.state.calls.length, 0);
  }

  const accessorHarness = makeHarness();
  let getterCalls = 0;
  const accessorOptions = {
    requestId: REQUEST_ID,
    payload: makePayload()
  };
  Object.defineProperty(accessorOptions, 'semantics', {
    enumerable: true,
    get() {
      getterCalls += 1;
      return accessorHarness.context.AppModules.activityV2.semantics;
    }
  });
  const accessorError = await captureError(
    accessorHarness.api.commitSession(accessorOptions)
  );
  assertDomainError(accessorError, {
    code: 'INVALID_SESSION',
    operation: 'commitSession',
    retryable: false,
    commitState: 'not_committed'
  });
  assert.equal(getterCalls, 0);
  assert.equal(accessorHarness.state.calls.length, 0);

  const methodAccessorHarness = makeHarness();
  let methodGetterCalls = 0;
  const methodAccessorSemantics = {
    getEntryByKey() {
      return null;
    }
  };
  Object.defineProperty(methodAccessorSemantics, 'getCatalog', {
    enumerable: true,
    get() {
      methodGetterCalls += 1;
      return () => ({ catalog_version: 1 });
    }
  });
  const methodAccessorError = await captureError(
    methodAccessorHarness.api.commitSession({
      requestId: REQUEST_ID,
      payload: makePayload(),
      semantics: methodAccessorSemantics
    })
  );
  assertDomainError(methodAccessorError, {
    code: 'INVALID_SESSION',
    operation: 'commitSession',
    retryable: false,
    commitState: 'not_committed'
  });
  assert.equal(methodGetterCalls, 0);
  assert.equal(methodAccessorHarness.state.calls.length, 0);

  const throwingHarness = makeHarness();
  const throwingError = await captureError(
    throwingHarness.api.commitSession({
      requestId: REQUEST_ID,
      payload: makePayload(),
      semantics: {
        getCatalog() {
          throw new Error('catalog-secret');
        },
        getEntryByKey() {
          return null;
        }
      }
    })
  );
  assertDomainError(throwingError, {
    code: 'REQUEST_FAILED',
    operation: 'commitSession',
    retryable: false,
    commitState: 'not_committed'
  });
  assert.equal(throwingError.message.includes('catalog-secret'), false);
  assert.equal(throwingHarness.state.calls.length, 0);
});

test('S4.7 validates a successful response against the selected semantics', async () => {
  for (const mutate of [
    (response) => {
      response.session.items[0].field_policy_snapshot.weight_kg = 'optional';
    },
    (response) => {
      response.session.items[0].catalog_version = 1;
    }
  ]) {
    const harness = makeHarness();
    const semanticsV2 = harness.context.AppModules.activityV2.semanticsV2;
    harness.state.fetchImpl = async (_url, options) => {
      const request = JSON.parse(options.body);
      const response = makeCommitResult(
        harness.context,
        request,
        'created',
        semanticsV2
      );
      mutate(response);
      return makeResponse(200, response);
    };

    const error = await captureError(
      harness.api.commitSession({
        requestId: REQUEST_ID,
        payload: makeV2Payload(),
        semantics: semanticsV2
      })
    );
    assertDomainError(error, {
      code: 'REQUEST_FAILED',
      operation: 'commitSession',
      retryable: true,
      commitState: 'unknown'
    });
    assert.equal(harness.state.calls.length, 1);
  }

  const stableHarness = makeHarness();
  const baseV1 = stableHarness.context.AppModules.activityV2.semantics;
  const baseV2 = stableHarness.context.AppModules.activityV2.semanticsV2;
  const injected = {
    getCatalog() {
      return baseV2.getCatalog();
    },
    getEntryByKey(itemKey) {
      return baseV2.getEntryByKey(itemKey);
    }
  };
  stableHarness.state.fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    injected.getCatalog = () => baseV1.getCatalog();
    injected.getEntryByKey = (itemKey) => baseV1.getEntryByKey(itemKey);
    return makeResponse(
      200,
      makeCommitResult(stableHarness.context, request, 'created', baseV2)
    );
  };
  const stableResult = await stableHarness.api.commitSession({
    requestId: REQUEST_ID,
    payload: makeV2Payload(),
    semantics: injected
  });
  assert.equal(stableResult.outcome, 'created');
  assert.equal(stableResult.session.items[0].catalog_version, 2);
});

test('all three tracking modes pass local policy validation', async () => {
  for (const mode of ['duration', 'duration_distance', 'strength_sets']) {
    const harness = makeHarness();
    harness.state.fetchImpl = async (_url, options) => {
      const request = JSON.parse(options.body);
      return makeResponse(200, makeCommitResult(harness.context, request));
    };
    const result = await harness.api.commitSession({
      requestId: REQUEST_ID,
      payload: makePayload(mode)
    });
    assert.equal(result.schema_version, 'midas.activity-session-result.v1');
    assert.equal(harness.state.calls.length, 1);
  }
});

test('equivalent explicit offsets validate against canonical UTC responses', async () => {
  const harness = makeHarness();
  const payload = makePayload();
  payload.started_at = '2026-07-31T12:00:00.000000+02:00';
  payload.ended_at = '2026-07-31T12:30:00.000000+02:00';
  harness.state.fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    const response = makeCommitResult(harness.context, request);
    response.session.started_at = '2026-07-31T10:00:00.000000Z';
    response.session.ended_at = '2026-07-31T10:30:00.000000Z';
    return makeResponse(200, response);
  };
  const result = await harness.api.commitSession({ requestId: REQUEST_ID, payload });
  assert.equal(result.outcome, 'created');
  const sent = JSON.parse(harness.state.calls[0].options.body);
  assert.equal(sent.p_payload.started_at, payload.started_at);
  assert.equal(sent.p_payload.ended_at, payload.ended_at);
});

test('invalid requests fail locally without transport', async () => {
  const cases = [];
  const addCase = (mutator) => {
    const payload = makePayload();
    mutator(payload);
    cases.push(payload);
  };
  addCase((payload) => { payload.extra = true; });
  addCase((payload) => { payload.catalog_version = 2; });
  addCase((payload) => { payload.started_at = '2026-07-31T10:00:00'; });
  addCase((payload) => { payload.ended_at = '2026-07-31T09:59:59.999999Z'; });
  addCase((payload) => { payload.items[0].item_order = 2; });
  addCase((payload) => { payload.items[0].distance_km = 5.251; });
  addCase((payload) => { payload.items[0].sets = [makeSet(1, { reps: 1 })]; });
  addCase((payload) => { payload.items[0].item_key = 'unknown_item'; });

  for (const payload of cases) {
    const harness = makeHarness();
    const error = await captureError(
      harness.api.commitSession({ requestId: REQUEST_ID, payload })
    );
    assertDomainError(error, {
      code: 'INVALID_SESSION',
      operation: 'commitSession',
      retryable: false,
      commitState: 'not_committed'
    });
    assert.equal(harness.state.calls.length, 0);
  }

  const harness = makeHarness();
  const error = await captureError(
    harness.api.commitSession({ requestId: 'not-a-uuid', payload: makePayload() })
  );
  assert.equal(error.code, 'INVALID_SESSION');
  assert.equal(harness.state.calls.length, 0);
});

test('known SQL tokens map to stable domain errors without raw response data', async () => {
  const commitCases = [
    ['MIDAS_ACTIVITY_AUTH_REQUIRED', 'AUTH_REQUIRED'],
    ['MIDAS_ACTIVITY_INVALID_SESSION', 'INVALID_SESSION'],
    ['MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT', 'IDEMPOTENCY_CONFLICT']
  ];
  for (const [token, code] of commitCases) {
    const harness = makeHarness();
    harness.state.fetchImpl = async () =>
      makeResponse(400, { message: `database rejected ${token}`, details: 'raw-db-detail' });
    const error = await captureError(
      harness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
    );
    assertDomainError(error, {
      code,
      operation: 'commitSession',
      retryable: false,
      commitState: 'not_committed'
    });
    assert.equal(error.message.includes('raw-db-detail'), false);
    assert.equal(
      harness.state.diagnostics.some((line) => line.includes(`code=${code}`)),
      true
    );
  }

  const harness = makeHarness();
  harness.state.fetchImpl = async () =>
    makeResponse(400, { message: 'MIDAS_ACTIVITY_INVALID_ITEM_KEY' });
  const lookupError = await captureError(
    harness.api.loadLastPerformance('running')
  );
  assertDomainError(lookupError, {
    code: 'INVALID_ITEM_KEY',
    operation: 'loadLastPerformance',
    retryable: false
  });
});

test('auth, network, unknown server, and malformed-success failures are conservative', async () => {
  const authHarness = makeHarness();
  authHarness.state.fetchWithAuthImpl = async () => {
    const error = new Error('auth-http raw');
    error.status = 401;
    throw error;
  };
  assertDomainError(
    await captureError(
      authHarness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
    ),
    {
      code: 'AUTH_REQUIRED',
      operation: 'commitSession',
      retryable: false,
      commitState: 'not_committed'
    }
  );

  const networkHarness = makeHarness();
  const diagnosticSentinel =
    `socket-secret-detail request_id=${REQUEST_ID} payload=bench_press:150`;
  networkHarness.state.fetchImpl = async () => {
    throw new Error(diagnosticSentinel);
  };
  const networkError = await captureError(
    networkHarness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
  );
  assertDomainError(networkError, {
    code: 'REQUEST_FAILED',
    operation: 'commitSession',
    retryable: true,
    commitState: 'unknown'
  });
  assert.equal(networkError.message.includes('socket-secret-detail'), false);
  assert.equal(
    networkHarness.state.diagnostics.some((line) => line.includes('socket-secret-detail')),
    false
  );
  assert.equal(
    networkHarness.state.diagnostics.some(
      (line) => line.includes(REQUEST_ID) || line.includes('bench_press:150')
    ),
    false
  );

  const serverHarness = makeHarness();
  serverHarness.state.fetchImpl = async () =>
    makeResponse(503, { message: 'unknown-postgrest-detail' });
  assertDomainError(
    await captureError(
      serverHarness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
    ),
    {
      code: 'REQUEST_FAILED',
      operation: 'commitSession',
      retryable: true,
      commitState: 'unknown'
    }
  );

  const malformedHarness = makeHarness();
  malformedHarness.state.fetchImpl = async () => makeResponse(200, { outcome: 'created' });
  assertDomainError(
    await captureError(
      malformedHarness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
    ),
    {
      code: 'REQUEST_FAILED',
      operation: 'commitSession',
      retryable: true,
      commitState: 'unknown'
    }
  );
});

test('lookup trims only the SQL btrim space, returns null, and validates full blocks', async () => {
  const nullHarness = makeHarness();
  nullHarness.state.fetchImpl = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { p_item_key: 'running' });
    return makeResponse(200, null);
  };
  assert.equal(await nullHarness.api.loadLastPerformance('  running  '), null);

  const resultHarness = makeHarness();
  const canonicalPayload = makePayload('strength_sets');
  canonicalPayload.title = 'Morning';
  canonicalPayload.note = null;
  canonicalPayload.items[0].duration_min = null;
  canonicalPayload.items[0].distance_km = null;
  canonicalPayload.items[0].note = null;
  canonicalPayload.items[0].sets.sort((left, right) => left.set_order - right.set_order);
  const commitResult = makeCommitResult(resultHarness.context, {
    p_request_id: REQUEST_ID,
    p_payload: canonicalPayload
  });
  const lookupResult = makeLookupResult(commitResult);
  resultHarness.state.fetchImpl = async () => makeResponse(200, lookupResult);
  const loaded = await resultHarness.api.loadLastPerformance('bench_press');
  assert.deepEqual(loaded, lookupResult);

  const invalidHarness = makeHarness();
  const invalidError = await captureError(
    invalidHarness.api.loadLastPerformance('Running')
  );
  assertDomainError(invalidError, {
    code: 'INVALID_ITEM_KEY',
    operation: 'loadLastPerformance',
    retryable: false
  });
  assert.equal(invalidHarness.state.calls.length, 0);
});

test('lookup injects current semantics while validating historical snapshots independently', async () => {
  const v2OnlyHarness = makeHarness();
  const semanticsV2 = v2OnlyHarness.context.AppModules.activityV2.semanticsV2;
  v2OnlyHarness.state.fetchImpl = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { p_item_key: 'high_row' });
    return makeResponse(200, null);
  };
  assert.equal(
    await v2OnlyHarness.api.loadLastPerformance('high_row', { semantics: semanticsV2 }),
    null
  );
  assert.equal(v2OnlyHarness.state.calls.length, 1);

  const historyHarness = makeHarness();
  const baseV2 = historyHarness.context.AppModules.activityV2.semanticsV2;
  let catalogReads = 0;
  let entryReads = 0;
  const currentSemantics = {
    getCatalog() {
      catalogReads += 1;
      return baseV2.getCatalog();
    },
    getEntryByKey(itemKey) {
      entryReads += 1;
      return baseV2.getEntryByKey(itemKey);
    }
  };
  const historical = makeHistoricalLookupResult(
    historyHarness.context,
    'bench_press',
    { item_label_snapshot: 'Historisches Bankdrücken' }
  );
  historyHarness.state.fetchImpl = async () => makeResponse(200, historical);
  const loaded = await historyHarness.api.loadLastPerformance('bench_press', {
    semantics: currentSemantics
  });
  assert.deepEqual(loaded, historical);
  assert.equal(catalogReads, 1);
  assert.equal(entryReads, 1);
});

test('lookup options and selected semantics fail locally with stable domain errors', async () => {
  const cases = [
    (harness) => ['running', undefined],
    () => ['running', null],
    () => ['running', {}],
    () => ['running', { semantics: undefined }],
    (harness) => [
      'running',
      { semantics: harness.context.AppModules.activityV2.semanticsV2, extra: true }
    ],
    (harness) => {
      const options = {
        semantics: harness.context.AppModules.activityV2.semanticsV2
      };
      options[Symbol('unexpected')] = true;
      return ['running', options];
    },
    () => ['running', { semantics: {} }],
    () => [
      'running',
      {
        semantics: {
          getCatalog() {
            throw new Error('catalog-secret');
          },
          getEntryByKey() {
            return null;
          }
        }
      }
    ],
    () => [
      'running',
      {
        semantics: {
          getCatalog() {
            return { catalog_version: 0 };
          },
          getEntryByKey() {
            return null;
          }
        }
      }
    ],
    () => [
      'running',
      {
        semantics: {
          getCatalog() {
            return { catalog_version: 2 };
          },
          getEntryByKey() {
            throw new Error('entry-secret');
          }
        }
      }
    ],
    () => [
      'running',
      {
        semantics: {
          getCatalog() {
            return { catalog_version: 2 };
          },
          getEntryByKey() {
            return { key: 'walking' };
          }
        }
      }
    ]
  ];

  for (const makeArgs of cases) {
    const harness = makeHarness();
    const error = await captureError(
      harness.api.loadLastPerformance(...makeArgs(harness))
    );
    assertDomainError(error, {
      code: 'REQUEST_FAILED',
      operation: 'loadLastPerformance',
      retryable: false
    });
    assert.equal(harness.state.calls.length, 0);
  }

  const missingKeyHarness = makeHarness();
  const missingKeySemantics = {
    getCatalog() {
      return { catalog_version: 2 };
    },
    getEntryByKey() {
      return null;
    }
  };
  const missingKeyError = await captureError(
    missingKeyHarness.api.loadLastPerformance('running', {
      semantics: missingKeySemantics
    })
  );
  assertDomainError(missingKeyError, {
    code: 'INVALID_ITEM_KEY',
    operation: 'loadLastPerformance',
    retryable: false
  });
  assert.equal(missingKeyHarness.state.calls.length, 0);
});

test('historical lookup validator accepts all modes and rejects snapshot drift', async () => {
  for (const itemKey of ['bench_press', 'football', 'running']) {
    const harness = makeHarness();
    const result = makeHistoricalLookupResult(harness.context, itemKey);
    harness.state.fetchImpl = async () => makeResponse(200, result);
    assert.deepEqual(
      await harness.api.loadLastPerformance(itemKey, {
        semantics: harness.context.AppModules.activityV2.semanticsV2
      }),
      result
    );
  }

  for (const configureSnapshot of [
    (result) => {
      result.item.field_policy_snapshot.weight_kg = 'forbidden';
      result.item.field_policy_snapshot.assistance_kg = 'optional';
      result.item.load_comparability_snapshot = 'device_relative';
      result.item.sets[0].weight_kg = null;
      result.item.sets[0].assistance_kg = 40;
    },
    (result) => {
      result.item.equipment_snapshot = 'dumbbell';
      result.item.load_comparability_snapshot = 'standardized';
    }
  ]) {
    const harness = makeHarness();
    const result = makeHistoricalLookupResult(harness.context, 'bench_press');
    configureSnapshot(result);
    harness.state.fetchImpl = async () => makeResponse(200, result);
    assert.deepEqual(
      await harness.api.loadLastPerformance('bench_press', {
        semantics: harness.context.AppModules.activityV2.semanticsV2
      }),
      result
    );
  }

  const mutations = [
    (result) => { result.extra = true; },
    (result) => { result.schema_version = 'midas.activity-last-performance.v2'; },
    (result) => { result.session.id = 'not-a-uuid'; },
    (result) => { result.session.started_at = '2026-07-31T10:00:00Z'; },
    (result) => { result.session.day = '2026-02-30'; },
    (result) => { result.item.catalog_version = 0; },
    (result) => { result.item.catalog_version = 2147483648; },
    (result) => { result.item.item_key = 'running'; },
    (result) => { result.item.item_order = 0; },
    (result) => { result.item.item_label_snapshot = ' Bench Press '; },
    (result) => { result.item.item_label_snapshot = 'x'.repeat(81); },
    (result) => { result.item.tracking_mode_snapshot = 'unknown'; },
    (result) => { result.item.equipment_snapshot = 'unknown'; },
    (result) => { result.item.load_comparability_snapshot = 'not_applicable'; },
    (result) => { result.item.field_policy_snapshot.note = 'required'; },
    (result) => { result.item.field_policy_snapshot.extra = 'forbidden'; },
    (result) => {
      result.item.equipment_snapshot = 'machine';
      result.item.load_comparability_snapshot = 'standardized';
    },
    (result) => { result.item.duration_min = 10; },
    (result) => { result.item.note = ' historical note '; },
    (result) => { result.item.sets = []; },
    (result) => { result.item.sets[0].set_order = 2; },
    (result) => { result.item.sets[0].tracking_mode = 'duration'; },
    (result) => { result.item.sets[0].reps = null; },
    (result) => { result.item.sets[0].weight_kg = 77.555; },
    (result) => { result.item.sets[0].assistance_kg = 20; },
    (result) => { result.item.sets[0].extra = true; }
  ];

  for (const mutate of mutations) {
    const harness = makeHarness();
    const result = makeHistoricalLookupResult(harness.context, 'bench_press');
    mutate(result);
    harness.state.fetchImpl = async () => makeResponse(200, result);
    const error = await captureError(
      harness.api.loadLastPerformance('bench_press', {
        semantics: harness.context.AppModules.activityV2.semanticsV2
      })
    );
    assertDomainError(error, {
      code: 'REQUEST_FAILED',
      operation: 'loadLastPerformance',
      retryable: true
    });
  }
});

test('strict response validation rejects wrong request IDs and item order', async () => {
  for (const mutate of [
    (result) => { result.session.request_id = uuidFor(999); },
    (result) => { result.session.items[0].item_order = 2; },
    (result) => { result.extra = true; }
  ]) {
    const harness = makeHarness();
    harness.state.fetchImpl = async (_url, options) => {
      const request = JSON.parse(options.body);
      const result = makeCommitResult(harness.context, request);
      mutate(result);
      return makeResponse(200, result);
    };
    const error = await captureError(
      harness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
    );
    assertDomainError(error, {
      code: 'REQUEST_FAILED',
      operation: 'commitSession',
      retryable: true,
      commitState: 'unknown'
    });
  }
});

test('missing dependencies fail before transport and product integration remains absent', async () => {
  const harness = makeHarness();
  harness.context.AppModules.supabase = {};
  const error = await captureError(
    harness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
  );
  assertDomainError(error, {
    code: 'REQUEST_FAILED',
    operation: 'commitSession',
    retryable: false,
    commitState: 'not_committed'
  });
  assert.equal(harness.state.calls.length, 0);

  const invalidUrlHarness = makeHarness();
  invalidUrlHarness.state.restConfig = ':';
  const invalidUrlError = await captureError(
    invalidUrlHarness.api.commitSession({
      requestId: REQUEST_ID,
      payload: makePayload()
    })
  );
  assertDomainError(invalidUrlError, {
    code: 'REQUEST_FAILED',
    operation: 'commitSession',
    retryable: false,
    commitState: 'not_committed'
  });
  assert.equal(invalidUrlHarness.state.calls.length, 0);

  const rootIndex = fs.readFileSync(
    path.resolve(__dirname, '../../../../..', 'index.html'),
    'utf8'
  );
  assert.equal(rootIndex.includes('activity/v2/data-access.js'), false);
  assert.equal(rootIndex.includes('activityV2.dataAccess'), false);
  [
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/,
    /\bdocument\s*\./,
    /AppModules\.activity(?!V2)/
  ].forEach((pattern) => assert.equal(pattern.test(dataAccessSource), false, String(pattern)));
});

test('R9 history and detail enforce exact bounded immutable response contracts', async () => {
  const historyHarness = makeHarness();
  const page = makeHistoryPage([
    makeHistoryItem(902, '2026-07-31T12:34:56.123Z', { revision: '9' }),
    makeHistoryItem(901, '2026-07-31T12:34:56.123Z', { revision: '8' })
  ]);
  historyHarness.state.fetchImpl = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), {
      p_limit: 20,
      p_cursor_started_at: null,
      p_cursor_id: null
    });
    return makeResponse(200, page);
  };
  const history = await historyHarness.api.listSessions();
  assert.deepEqual(jsonClone(history), page);
  assert.equal(Object.isFrozen(history), true);
  assert.equal(Object.isFrozen(history.items), true);
  assert.equal(Object.isFrozen(history.items[0]), true);

  const cursorHarness = makeHarness();
  cursorHarness.state.fetchImpl = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), {
      p_limit: 2,
      p_cursor_started_at: page.next_cursor?.started_at ?? page.items[1].started_at,
      p_cursor_id: page.items[1].session_id
    });
    return makeResponse(200, makeHistoryPage([]));
  };
  await cursorHarness.api.listSessions({
    limit: 2,
    cursor: {
      started_at: page.items[1].started_at,
      id: page.items[1].session_id
    }
  });

  for (const options of [
    { limit: 0 },
    { limit: 51 },
    { limit: 20, cursor: { started_at: R9_RESPONSE_TIME } },
    { limit: 20, cursor: { started_at: R9_RESPONSE_TIME, id: REQUEST_ID.toUpperCase() } }
  ]) {
    const harness = makeHarness();
    assertDomainError(await captureError(harness.api.listSessions(options)), {
      code: 'INVALID_HISTORY_REQUEST',
      operation: 'listSessions',
      retryable: false
    });
    assert.equal(harness.state.calls.length, 0);
  }

  const detailHarness = makeHarness();
  const detail = makeDetail(detailHarness.context);
  detailHarness.state.fetchImpl = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { p_session_id: detail.session_id });
    return makeResponse(200, detail);
  };
  const loaded = await detailHarness.api.loadSessionDetail(detail.session_id);
  assert.deepEqual(jsonClone(loaded), detail);
  assert.equal(Object.isFrozen(loaded), true);
  assert.equal(Object.isFrozen(loaded.items[1].field_policy_snapshot), true);
  assert.equal(Object.isFrozen(loaded.items[1].sets[0]), true);
  assert.equal(Object.hasOwn(loaded.items[0], 'id'), false);
  assert.equal(Object.hasOwn(loaded.items[1].sets[0], 'id'), false);

  const nullHarness = makeHarness();
  nullHarness.state.fetchImpl = async () => makeResponse(200, null);
  assert.equal(await nullHarness.api.loadSessionDetail(uuidFor(999)), null);

  const legacyUuidHarness = makeHarness();
  const legacyDetail = makeDetail(legacyUuidHarness.context);
  legacyDetail.items[0].id = uuidFor(123);
  legacyUuidHarness.state.fetchImpl = async () => makeResponse(200, legacyDetail);
  assertDomainError(
    await captureError(
      legacyUuidHarness.api.loadSessionDetail(legacyDetail.session_id)
    ),
    {
      code: 'REQUEST_FAILED',
      operation: 'loadSessionDetail',
      retryable: true
    }
  );
});

test('R9 mutations preserve decimal CAS bytes and separate mutationState from R8 commitState', async () => {
  const replaceHarness = makeHarness();
  const replacement = makeReplacement();
  const before = jsonClone(replacement);
  replaceHarness.state.fetchImpl = async (_url, options) => {
    const sent = JSON.parse(options.body);
    return makeResponse(200, {
      schema_version: 'midas.activity-session-mutation-result.v1',
      operation: 'replace',
      outcome: 'updated',
      session_id: sent.p_session_id,
      revision: '9223372036854775807',
      content_fingerprint: 'b'.repeat(64)
    });
  };
  replaceHarness.state.fetchWithAuthImpl = async (makeRequest) => {
    await makeRequest({ authorization: 'Bearer first' });
    return await makeRequest({ authorization: 'Bearer refreshed' });
  };
  const replaceResult = await replaceHarness.api.replaceSession({
    sessionId: uuidFor(900),
    expectedRevision: '9223372036854775806',
    expectedContentFingerprint: FINGERPRINT,
    session: replacement
  });
  assert.equal(replaceResult.revision, '9223372036854775807');
  assert.equal(Object.isFrozen(replaceResult), true);
  assert.deepEqual(replacement, before);
  assert.equal(replaceHarness.state.calls.length, 2);
  assert.equal(
    replaceHarness.state.calls[0].options.body,
    replaceHarness.state.calls[1].options.body
  );
  assert.deepEqual(JSON.parse(replaceHarness.state.calls[0].options.body), {
    p_session_id: uuidFor(900),
    p_expected_revision: '9223372036854775806',
    p_expected_content_fingerprint: FINGERPRINT,
    p_replacement: replacement
  });
  assert.deepEqual(replaceHarness.state.fetchOptions, [
    { tag: 'activity-v2:activity_v2_replace_session', maxAttempts: 2 }
  ]);

  const conflictHarness = makeHarness();
  conflictHarness.state.fetchImpl = async () =>
    makeResponse(409, { message: 'MIDAS_ACTIVITY_SESSION_CONFLICT private' });
  assertDomainError(
    await captureError(
      conflictHarness.api.deleteSession({
        sessionId: uuidFor(900),
        expectedRevision: '1',
        expectedContentFingerprint: FINGERPRINT
      })
    ),
    {
      code: 'SESSION_CONFLICT',
      operation: 'deleteSession',
      retryable: false,
      mutationState: 'not_applied'
    }
  );

  const deleteHarness = makeHarness();
  deleteHarness.state.fetchImpl = async (_url, options) => {
    const sent = JSON.parse(options.body);
    return makeResponse(200, {
      schema_version: 'midas.activity-session-mutation-result.v1',
      operation: 'delete',
      outcome: 'already_absent',
      session_id: sent.p_session_id
    });
  };
  const deleteResult = await deleteHarness.api.deleteSession({
    sessionId: uuidFor(901),
    expectedRevision: '2',
    expectedContentFingerprint: FINGERPRINT
  });
  assert.deepEqual(jsonClone(deleteResult), {
    schema_version: 'midas.activity-session-mutation-result.v1',
    operation: 'delete',
    outcome: 'already_absent',
    session_id: uuidFor(901)
  });
  assert.equal(Object.isFrozen(deleteResult), true);

  for (const [token, code] of [
    ['MIDAS_ACTIVITY_SESSION_NOT_FOUND', 'SESSION_NOT_FOUND'],
    ['MIDAS_ACTIVITY_REVISION_EXHAUSTED', 'REVISION_EXHAUSTED'],
    ['MIDAS_ACTIVITY_INVALID_SESSION', 'INVALID_SESSION']
  ]) {
    const harness = makeHarness();
    harness.state.fetchImpl = async () => makeResponse(400, { message: token });
    assertDomainError(
      await captureError(
        harness.api.replaceSession({
          sessionId: uuidFor(900),
          expectedRevision: '1',
          expectedContentFingerprint: FINGERPRINT,
          session: makeReplacement()
        })
      ),
      {
        code,
        operation: 'replaceSession',
        retryable: false,
        mutationState: 'not_applied'
      }
    );
  }

  const unknownHarness = makeHarness();
  unknownHarness.state.fetchImpl = async () => makeResponse(200, { outcome: 'updated' });
  assertDomainError(
    await captureError(
      unknownHarness.api.replaceSession({
        sessionId: uuidFor(900),
        expectedRevision: '1',
        expectedContentFingerprint: FINGERPRINT,
        session: makeReplacement()
      })
    ),
    {
      code: 'MUTATION_OUTCOME_UNKNOWN',
      operation: 'replaceSession',
      retryable: false,
      mutationState: 'unknown'
    }
  );

  for (const revision of [1, '01', '0', '9223372036854775808']) {
    const harness = makeHarness();
    assertDomainError(
      await captureError(
        harness.api.deleteSession({
          sessionId: uuidFor(900),
          expectedRevision: revision,
          expectedContentFingerprint: FINGERPRINT
        })
      ),
      {
        code: 'INVALID_SESSION',
        operation: 'deleteSession',
        retryable: false,
        mutationState: 'not_applied'
      }
    );
    assert.equal(harness.state.calls.length, 0);
  }

  const undefinedHarness = makeHarness();
  const undefinedReplacement = makeReplacement();
  undefinedReplacement.items[0].distance_km = undefined;
  assertDomainError(
    await captureError(
      undefinedHarness.api.replaceSession({
        sessionId: uuidFor(900),
        expectedRevision: '1',
        expectedContentFingerprint: FINGERPRINT,
        session: undefinedReplacement
      })
    ),
    {
      code: 'INVALID_SESSION',
      operation: 'replaceSession',
      retryable: false,
      mutationState: 'not_applied'
    }
  );
  assert.equal(undefinedHarness.state.calls.length, 0);

  const legacyHarness = makeHarness();
  legacyHarness.state.fetchImpl = async () =>
    makeResponse(400, { message: 'MIDAS_ACTIVITY_INVALID_SESSION' });
  assertDomainError(
    await captureError(
      legacyHarness.api.commitSession({ requestId: REQUEST_ID, payload: makePayload() })
    ),
    {
      code: 'INVALID_SESSION',
      operation: 'commitSession',
      retryable: false,
      commitState: 'not_committed'
    }
  );
});

test('R9 keyset pagination keeps timestamp ties stable and fences intermediate inserts', async () => {
  const harness = makeHarness();
  const tieTime = '2026-07-31T12:00:00.000Z';
  const olderTime = '2026-07-30T12:00:00.000Z';
  const rows = [
    makeHistoryItem(6, tieTime),
    makeHistoryItem(5, tieTime),
    makeHistoryItem(4, tieTime),
    makeHistoryItem(3, olderTime)
  ];
  let callCount = 0;
  harness.state.fetchImpl = async (_url, options) => {
    callCount += 1;
    if (callCount === 2) rows.push(makeHistoryItem(7, tieTime));
    const request = JSON.parse(options.body);
    const sorted = [...rows].sort((left, right) =>
      left.started_at === right.started_at
        ? right.session_id.localeCompare(left.session_id)
        : right.started_at.localeCompare(left.started_at)
    );
    const afterCursor = sorted.filter(
      (row) =>
        request.p_cursor_started_at === null ||
        row.started_at < request.p_cursor_started_at ||
        (row.started_at === request.p_cursor_started_at &&
          row.session_id < request.p_cursor_id)
    );
    const selected = afterCursor.slice(0, request.p_limit + 1);
    return makeResponse(
      200,
      makeHistoryPage(
        selected.slice(0, request.p_limit),
        selected.length > request.p_limit
      )
    );
  };

  const first = await harness.api.listSessions({ limit: 2, cursor: null });
  const second = await harness.api.listSessions({
    limit: 2,
    cursor: first.next_cursor
  });
  assert.deepEqual(
    [...first.items, ...second.items].map((item) => item.session_id),
    [uuidFor(6), uuidFor(5), uuidFor(4), uuidFor(3)]
  );
  assert.equal(second.has_more, false);
  assert.equal(second.next_cursor, null);

  const refreshed = await harness.api.listSessions({ limit: 2, cursor: null });
  assert.equal(refreshed.items[0].session_id, uuidFor(7));
});
