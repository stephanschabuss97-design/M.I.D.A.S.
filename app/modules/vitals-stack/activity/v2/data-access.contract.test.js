'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const semanticsPath = path.join(__dirname, 'semantics.js');
const dataAccessPath = path.join(__dirname, 'data-access.js');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const dataAccessSource = fs.readFileSync(dataAccessPath, 'utf8');
const REQUEST_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const RESPONSE_TIME = '2026-07-31T12:34:56.123456Z';

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

function makeCommitResult(context, rpcPayload, outcome = 'created') {
  const semantics = context.AppModules.activityV2.semantics;
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
          catalog_version: 1,
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
    'loadLastPerformance'
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
    assert.equal(harness.state.diagnostics.some((line) => line.includes(token)), true);
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
  networkHarness.state.fetchImpl = async () => {
    throw new Error('socket-secret-detail');
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
    true
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
