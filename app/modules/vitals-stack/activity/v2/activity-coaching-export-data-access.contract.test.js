'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const contractPath = path.join(__dirname, 'activity-coaching-export.js');
const dataAccessPath = path.join(__dirname, 'data-access.js');
const contractSource = fs.readFileSync(contractPath, 'utf8');
const dataAccessSource = fs.readFileSync(dataAccessPath, 'utf8');
const RANGE = Object.freeze({ from: '2026-02-22', to: '2026-08-22' });

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

function emptyExport(overrides = {}) {
  return {
    schema_version: 'midas.activity-coaching-export.v1',
    generated_at: '2026-08-22T12:00:00.000Z',
    timezone: 'Europe/Vienna',
    range: { ...RANGE, inclusive: true },
    units: {
      session_duration: 'min',
      item_duration: 'min',
      item_distance: 'km',
      set_duration: 's',
      set_distance: 'm',
      weight: 'kg',
      assistance: 'kg',
      repetitions: 'count'
    },
    completeness: {
      status: 'complete',
      truncated: false,
      session_count: 0,
      item_count: 0,
      set_count: 0
    },
    quality: { status: 'no_data', cautions: ['no_sessions_in_range'] },
    sessions: [],
    ...overrides
  };
}

function makeHarness() {
  const state = {
    calls: [],
    diagnostics: [],
    fetchOptions: [],
    fetchImpl: async () => response(200, emptyExport()),
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
    }
  };
  const context = vm.createContext({
    AppModules: { activity: activityV1, supabase },
    Headers,
    URL,
    console,
    diag: { add(value) { state.diagnostics.push(String(value)); } },
    async getConf(key) {
      assert.equal(key, 'webhookUrl');
      return 'https://example.supabase.co/rest/v1/';
    },
    async fetch(url, options) {
      state.calls.push({ url, options: { ...options } });
      return await state.fetchImpl(url, options);
    }
  });
  new vm.Script(contractSource, { filename: contractPath }).runInContext(context);
  new vm.Script(dataAccessSource, { filename: dataAccessPath }).runInContext(context);
  return { api: context.AppModules.activityV2.dataAccess, context, state, activityV1 };
}

async function rejected(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  assert.fail('expected rejection');
}

function assertSafeError(error, code, retryable) {
  assert.equal(error.name, 'ActivityV2DataAccessError');
  assert.equal(error.code, code);
  assert.equal(error.operation, 'loadCoachingExport');
  assert.equal(error.retryable, retryable);
  assert.equal(Object.hasOwn(error, 'commitState'), false);
  assert.equal(Object.hasOwn(error, 'mutationState'), false);
  ['response', 'cause', 'details', 'raw', 'jwt'].forEach((key) => {
    assert.equal(Object.hasOwn(error, key), false);
  });
  assert.equal(error.message.includes('MIDAS_ACTIVITY_'), false);
}

test('T-ACT-R10-05 export uses one RPC, exact body, strict validator and frozen clone', async () => {
  const harness = makeHarness();
  const source = emptyExport();
  harness.state.fetchImpl = async () => response(200, source);

  const result = await harness.api.loadCoachingExport({ ...RANGE });

  assert.equal(harness.context.AppModules.activity.sentinel, true);
  assert.equal(harness.state.calls.length, 1);
  assert.equal(
    harness.state.calls[0].url,
    'https://example.supabase.co/rest/v1/rpc/activity_v2_coaching_export'
  );
  assert.equal(harness.state.calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(harness.state.calls[0].options.body), {
    p_from: RANGE.from,
    p_to: RANGE.to
  });
  assert.deepEqual(harness.state.fetchOptions, [
    { tag: 'activity-v2:activity_v2_coaching_export', maxAttempts: 2 }
  ]);
  assert.notEqual(result, source);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.range), true);
  source.range.from = '2026-01-01';
  assert.equal(result.range.from, RANGE.from);
});

test('T-ACT-R10-05 validates range before I/O and rejects extra/accessor keys', async () => {
  const harness = makeHarness();
  const invalid = [
    null,
    { ...RANGE, extra: true },
    { from: '2025-01-01', to: '2026-08-22' },
    { from: '2026-08-23', to: '2026-08-22' }
  ];
  for (const value of invalid) {
    assertSafeError(
      await rejected(harness.api.loadCoachingExport(value)),
      'INVALID_EXPORT_REQUEST',
      false
    );
  }
  const accessor = { to: RANGE.to };
  Object.defineProperty(accessor, 'from', {
    enumerable: true,
    get() { throw new Error('must-not-run'); }
  });
  assertSafeError(
    await rejected(harness.api.loadCoachingExport(accessor)),
    'INVALID_EXPORT_REQUEST',
    false
  );
  const hiddenExtra = { ...RANGE };
  Object.defineProperty(hiddenExtra, 'hidden', { value: true });
  assertSafeError(
    await rejected(harness.api.loadCoachingExport(hiddenExtra)),
    'INVALID_EXPORT_REQUEST',
    false
  );
  assert.equal(harness.state.calls.length, 0);
});

test('T-ACT-R10-05 maps SQL tokens without leaking response details', async () => {
  const cases = [
    [401, 'MIDAS_ACTIVITY_AUTH_REQUIRED', 'AUTH_REQUIRED'],
    [400, 'MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST', 'INVALID_EXPORT_REQUEST'],
    [400, 'MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED', 'EXPORT_LIMIT_EXCEEDED'],
    [409, 'MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT', 'EXPORT_SNAPSHOT_DRIFT']
  ];
  for (const [status, token, code] of cases) {
    const harness = makeHarness();
    harness.state.fetchImpl = async () =>
      response(status, { message: `${token} raw-database-secret` });
    const error = await rejected(harness.api.loadCoachingExport({ ...RANGE }));
    assertSafeError(error, code, false);
    assert.equal(error.message.includes('raw-database-secret'), false);
    assert.equal(harness.state.diagnostics.some((line) => line.includes(token)), false);
  }
});

test('T-ACT-R10-05 fails closed on malformed success and response-range drift', async () => {
  const values = [
    { ...emptyExport(), unknown: true },
    emptyExport({ range: { from: '2026-02-23', to: RANGE.to, inclusive: true } })
  ];
  for (const value of values) {
    const harness = makeHarness();
    harness.state.fetchImpl = async () => response(200, value);
    assertSafeError(
      await rejected(harness.api.loadCoachingExport({ ...RANGE })),
      'EXPORT_CONTRACT_INVALID',
      false
    );
  }
  const parseHarness = makeHarness();
  parseHarness.state.fetchImpl = async () =>
    response(200, null, new SyntaxError('raw malformed response'));
  assertSafeError(
    await rejected(parseHarness.api.loadCoachingExport({ ...RANGE })),
    'EXPORT_CONTRACT_INVALID',
    false
  );
});

test('T-ACT-R10-05 request failures are retryable, read-only and safe to repeat', async () => {
  const harness = makeHarness();
  harness.state.fetchImpl = async () => response(503, { message: 'raw upstream' });
  assertSafeError(
    await rejected(harness.api.loadCoachingExport({ ...RANGE })),
    'REQUEST_FAILED',
    true
  );

  const retryHarness = makeHarness();
  retryHarness.state.authImpl = async (makeRequest) => {
    await makeRequest({ authorization: 'Bearer first' });
    return await makeRequest({ authorization: 'Bearer refreshed' });
  };
  await retryHarness.api.loadCoachingExport({ ...RANGE });
  assert.equal(retryHarness.state.calls.length, 2);
  assert.equal(
    retryHarness.state.calls[0].options.body,
    retryHarness.state.calls[1].options.body
  );
  assert.equal(retryHarness.state.calls[0].url, retryHarness.state.calls[1].url);
});
