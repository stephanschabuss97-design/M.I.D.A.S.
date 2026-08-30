'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const consumerPath = path.join(__dirname, 'activity-consumer.js');
const dataAccessPath = path.join(__dirname, 'activity-consumer-data-access.js');
const fixturePath = path.join(__dirname, 'activity-consumer.fixture.json');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const consumerSource = fs.readFileSync(consumerPath, 'utf8');
const dataAccessSource = fs.readFileSync(dataAccessPath, 'utf8');
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const indexSource = fs.readFileSync(indexPath, 'utf8');
const EMPTY = fixtures.cases.find((entry) => entry.name === 'empty');
const MIXED = fixtures.cases.find((entry) => entry.name === 'mixed');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function response(status, body, jsonError = null) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      if (jsonError) throw jsonError;
      return clone(body);
    },
    clone() {
      return response(status, body, jsonError);
    }
  };
}

function makeHarness(overrides = {}) {
  const state = {
    calls: [],
    diagnostics: [],
    fetchOptions: [],
    fetchImpl: async () => response(200, MIXED.snapshot),
    authImpl: null
  };
  const activityV1 = Object.freeze({ sentinel: true });
  const supabase = {
    baseUrlFromRest(value) {
      return value ? String(value).replace(/\/rest\/v1\/?$/, '') : '';
    },
    async fetchWithAuth(makeRequest, options) {
      state.fetchOptions.push(clone(options));
      return state.authImpl
        ? await state.authImpl(makeRequest, options)
        : await makeRequest({ authorization: 'Bearer redacted' });
    },
    ...overrides.supabase
  };
  const contextValues = {
    AppModules: { activity: activityV1, supabase },
    Headers,
    URL,
    diag: { add(value) { state.diagnostics.push(String(value)); } },
    async getConf(key) {
      assert.equal(key, 'webhookUrl');
      return 'https://example.supabase.co/rest/v1/';
    },
    async fetch(url, options) {
      state.calls.push({ url, options: { ...options } });
      return await state.fetchImpl(url, options);
    },
    ...overrides.context
  };
  const context = vm.createContext(contextValues);
  new vm.Script(consumerSource, { filename: consumerPath }).runInContext(context);
  new vm.Script(dataAccessSource, { filename: dataAccessPath }).runInContext(context);
  return {
    api: context.AppModules.activityV2.consumerDataAccess,
    context,
    state,
    activityV1
  };
}

async function rejected(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  assert.fail('expected rejection');
}

function assertSafeError(error, code, retryable, status = null) {
  assert.equal(error.name, 'ActivityConsumerDataAccessError');
  assert.equal(error.message, 'The activity consumer request failed.');
  assert.equal(error.code, code);
  assert.equal(error.operation, 'loadSnapshot');
  assert.equal(error.retryable, retryable);
  assert.equal(error.status, status);
  ['response', 'cause', 'details', 'raw', 'payload', 'jwt'].forEach((key) => {
    assert.equal(Object.hasOwn(error, key), false);
  });
  assert.doesNotMatch(error.message, /MIDAS_|secret|Bearer/i);
}

function assertFrozenTree(value, seen = new WeakSet()) {
  if (
    value === null ||
    (typeof value !== 'object' && typeof value !== 'function') ||
    seen.has(value)
  ) {
    return;
  }
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  Reflect.ownKeys(value).forEach((key) => assertFrozenTree(value[key], seen));
}

test('T-ACT-R11-05 registers only the frozen R13 product read API', () => {
  const harness = makeHarness();
  assert.deepEqual(Reflect.ownKeys(harness.api), ['loadSnapshot']);
  assertFrozenTree(harness.api);
  assert.equal(harness.context.AppModules.activity.sentinel, true);
  assert.match(indexSource, /activity-consumer-data-access\.js/);
  assert.throws(
    () => makeHarness({ context: { AppModules: [] } }),
    /AppModules must be an object/
  );
  assert.throws(
    () => makeHarness({
      context: { AppModules: { activityV2: { consumerDataAccess: {} } } }
    }),
    /already registered/
  );
});

test('T-ACT-R11-05 performs one exact read RPC and strictly freezes success', async () => {
  const harness = makeHarness();
  const source = clone(MIXED.snapshot);
  harness.state.fetchImpl = async () => response(200, source);

  const result = await harness.api.loadSnapshot({
    from: MIXED.range.from,
    to: MIXED.range.to
  });

  assert.equal(harness.state.calls.length, 1);
  assert.equal(
    harness.state.calls[0].url,
    'https://example.supabase.co/rest/v1/rpc/activity_consumer_snapshot'
  );
  assert.equal(harness.state.calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(harness.state.calls[0].options.body), {
    p_from: MIXED.range.from,
    p_to: MIXED.range.to
  });
  assert.deepEqual(harness.state.fetchOptions, [{
    tag: 'activity-v2:activity_consumer_snapshot',
    retry401: true,
    maxAttempts: 0
  }]);
  assert.notEqual(result, source);
  assertFrozenTree(result);
  source.range.from = '2026-01-01';
  assert.equal(result.range.from, MIXED.range.from);
});

test('T-ACT-R11-05 accepts the canonical empty snapshot without fallback reads', async () => {
  const harness = makeHarness();
  harness.state.fetchImpl = async () => response(200, EMPTY.snapshot);
  const result = await harness.api.loadSnapshot({
    from: EMPTY.range.from,
    to: EMPTY.range.to
  });
  assert.equal(result.summary.unit_count, 0);
  assert.deepEqual(Array.from(result.units), []);
  assert.equal(harness.state.calls.length, 1);
});

test('T-ACT-R11-05 rejects invalid/accessor ranges before config or network I/O', async () => {
  let configCalls = 0;
  const harness = makeHarness({
    context: {
      async getConf() {
        configCalls += 1;
        return 'https://example.supabase.co/rest/v1/';
      }
    }
  });
  const invalid = [
    null,
    {},
    { from: EMPTY.range.from, to: EMPTY.range.to, extra: true },
    { from: '2026-08-01', to: '2026-07-31' },
    { from: '2025-01-01', to: '2026-08-23' },
    { from: '9999-12-30', to: '9999-12-31' }
  ];
  for (const value of invalid) {
    assertSafeError(
      await rejected(harness.api.loadSnapshot(value)),
      'INVALID_RANGE',
      false
    );
  }
  const accessor = { to: EMPTY.range.to };
  Object.defineProperty(accessor, 'from', {
    enumerable: true,
    get() { throw new Error('must not run'); }
  });
  assertSafeError(
    await rejected(harness.api.loadSnapshot(accessor)),
    'INVALID_RANGE',
    false
  );
  const hidden = { from: EMPTY.range.from, to: EMPTY.range.to };
  Object.defineProperty(hidden, 'extra', { value: true });
  assertSafeError(
    await rejected(harness.api.loadSnapshot(hidden)),
    'INVALID_RANGE',
    false
  );
  assert.equal(configCalls, 0);
  assert.equal(harness.state.calls.length, 0);
});

test('T-ACT-R11-05 permits only one auth refresh retry for the same RPC', async () => {
  const harness = makeHarness();
  harness.state.authImpl = async (makeRequest, options) => {
    assert.equal(options.maxAttempts, 0);
    const first = await makeRequest({ authorization: 'Bearer first' });
    assert.equal(first.status, 401);
    return await makeRequest({ authorization: 'Bearer refreshed' });
  };
  let calls = 0;
  harness.state.fetchImpl = async () => {
    calls += 1;
    return calls === 1
      ? response(401, { message: 'expired' })
      : response(200, MIXED.snapshot);
  };

  await harness.api.loadSnapshot({ from: MIXED.range.from, to: MIXED.range.to });
  assert.equal(harness.state.calls.length, 2);
  assert.equal(harness.state.calls[0].url, harness.state.calls[1].url);
  assert.equal(
    harness.state.calls[0].options.body,
    harness.state.calls[1].options.body
  );

  const exhausted = makeHarness();
  exhausted.state.authImpl = async (makeRequest, options) => {
    assert.equal(options.maxAttempts, 0);
    await makeRequest({ authorization: 'Bearer first' });
    await makeRequest({ authorization: 'Bearer refreshed' });
    throw Object.assign(new Error('raw auth exhaustion'), { status: 403 });
  };
  exhausted.state.fetchImpl = async () => response(403, { message: 'expired' });
  assertSafeError(
    await rejected(exhausted.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'AUTH_REQUIRED',
    false,
    403
  );
  assert.equal(exhausted.state.calls.length, 2);
});

test('T-ACT-R11-05 maps auth, SQL tokens and retry exhaustion without leaks', async () => {
  const cases = [
    [401, 'MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED', 'AUTH_REQUIRED'],
    [400, 'MIDAS_ACTIVITY_CONSUMER_INVALID_RANGE', 'INVALID_RANGE'],
    [400, 'MIDAS_ACTIVITY_CONSUMER_RANGE_TOO_LARGE', 'RANGE_TOO_LARGE'],
    [409, 'MIDAS_ACTIVITY_CONSUMER_LIMIT_EXCEEDED', 'LIMIT_EXCEEDED'],
    [400, 'MIDAS_ACTIVITY_CONSUMER_SOURCE_INVALID', 'CONTRACT_INVALID']
  ];
  for (const [status, token, code] of cases) {
    const harness = makeHarness();
    harness.state.fetchImpl = async () =>
      response(status, { message: `${token} raw-secret` });
    const error = await rejected(
      harness.api.loadSnapshot({ from: MIXED.range.from, to: MIXED.range.to })
    );
    assertSafeError(error, code, false, status);
    assert.equal(harness.state.diagnostics.some((line) => line.includes(token)), false);
    assert.equal(
      harness.state.diagnostics.every((line) =>
        /^\[activity-consumer\] loadSnapshot failed code=[A-Z_]+ status=(?:none|\d+)$/.test(line)
      ),
      true
    );
  }

  const retryHarness = makeHarness();
  retryHarness.state.authImpl = async () => {
    throw Object.assign(new Error('raw retry exhaustion'), { status: 503 });
  };
  assertSafeError(
    await rejected(retryHarness.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'REQUEST_FAILED',
    true,
    503
  );
});

test('T-ACT-R11-05 fails closed on non-JSON, partial, extra-key and range drift', async () => {
  const values = [
    { schema_version: 'midas.activity-consumer.v1' },
    { ...clone(MIXED.snapshot), unexpected: true },
    { ...clone(MIXED.snapshot), range: clone(EMPTY.range) }
  ];
  for (const value of values) {
    const harness = makeHarness();
    harness.state.fetchImpl = async () => response(200, value);
    assertSafeError(
      await rejected(harness.api.loadSnapshot({
        from: MIXED.range.from,
        to: MIXED.range.to
      })),
      'CONTRACT_INVALID',
      false,
      200
    );
  }
  const parseHarness = makeHarness();
  parseHarness.state.fetchImpl = async () =>
    response(200, null, new SyntaxError('raw malformed payload'));
  assertSafeError(
    await rejected(parseHarness.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'CONTRACT_INVALID',
    false,
    200
  );
});

test('T-ACT-R11-05 distinguishes missing API/config, network and abort failures', async () => {
  const noApi = makeHarness({ supabase: { fetchWithAuth: null } });
  assertSafeError(
    await rejected(noApi.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'API_UNAVAILABLE',
    false
  );

  const noConfig = makeHarness({ context: { getConf: null } });
  assertSafeError(
    await rejected(noConfig.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'CONFIG_UNAVAILABLE',
    false
  );

  const network = makeHarness();
  network.state.authImpl = async () => { throw new Error('raw network secret'); };
  assertSafeError(
    await rejected(network.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'REQUEST_FAILED',
    true
  );

  const aborted = makeHarness();
  aborted.state.authImpl = async () => {
    throw Object.assign(new Error('raw aborted request'), { name: 'AbortError' });
  };
  assertSafeError(
    await rejected(aborted.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'REQUEST_ABORTED',
    false
  );

  const brokenDiag = makeHarness({
    context: { diag: { add() { throw new Error('raw diagnostic failure'); } } }
  });
  brokenDiag.state.authImpl = async () => { throw new Error('raw network secret'); };
  assertSafeError(
    await rejected(brokenDiag.api.loadSnapshot({
      from: MIXED.range.from,
      to: MIXED.range.to
    })),
    'REQUEST_FAILED',
    true
  );
});

test('T-ACT-R11-05 isolated latest-request harness fences a stale response', async () => {
  let resolveFirst;
  const first = new Promise((resolve) => { resolveFirst = resolve; });
  let calls = 0;
  const adapter = {
    async loadSnapshot(range) {
      calls += 1;
      if (calls === 1) return await first;
      return { range, marker: 'current' };
    }
  };
  let generation = 0;
  let visible = null;
  async function load(range) {
    const requestGeneration = ++generation;
    const value = await adapter.loadSnapshot(range);
    if (requestGeneration !== generation) return 'STALE_RESULT';
    visible = value;
    return 'CURRENT_RESULT';
  }

  const stalePromise = load({ from: EMPTY.range.from, to: EMPTY.range.to });
  assert.equal(
    await load({ from: MIXED.range.from, to: MIXED.range.to }),
    'CURRENT_RESULT'
  );
  resolveFirst({ marker: 'stale' });
  assert.equal(await stalePromise, 'STALE_RESULT');
  assert.equal(visible.marker, 'current');
  assert.equal(calls, 2);
});
