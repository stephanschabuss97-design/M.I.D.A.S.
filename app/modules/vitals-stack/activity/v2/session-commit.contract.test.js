'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const commitPath = path.join(__dirname, 'session-commit.js');
const draftPath = path.join(__dirname, 'session-draft.js');
const semanticsPath = path.join(__dirname, 'semantics.js');
const semanticsV2Path = path.join(__dirname, 'semantics-v2.js');
const dataAccessPath = path.join(__dirname, 'data-access.js');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const serviceWorkerPath = path.resolve(
  __dirname,
  '../../../../..',
  'service-worker.js'
);
const commitSource = fs.readFileSync(commitPath, 'utf8');
const draftSource = fs.readFileSync(draftPath, 'utf8');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const semanticsV2Source = fs.readFileSync(semanticsV2Path, 'utf8');
const dataAccessSource = fs.readFileSync(dataAccessPath, 'utf8');
const indexSource = fs.readFileSync(indexPath, 'utf8');
const serviceWorkerSource = fs.readFileSync(serviceWorkerPath, 'utf8');
const SAFE_MESSAGE =
  'The activity session commit operation could not be completed.';
const REQUEST_ID = 'aaaaaaaa-0000-4000-8000-000000000008';
const START_MS = Date.parse('2026-08-10T08:00:00.000Z');
const CORE_MARKER = '  const sessionCommitApi = deepFreeze({ create });';

function instrumentCommitSource() {
  assert.equal(commitSource.includes(CORE_MARKER), true);
  return commitSource.replace(
    CORE_MARKER,
    '  root.__activityV2SessionCommitCore = commitCore;\n' + CORE_MARKER
  );
}

function loadRuntime({ instrument = true } = {}) {
  const activityV1 = { marker: 'preserved' };
  const context = vm.createContext({
    AppModules: { activity: activityV1, activityV2: {} }
  });
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  vm.runInContext(semanticsV2Source, context, { filename: semanticsV2Path });
  vm.runInContext(draftSource, context, { filename: draftPath });
  vm.runInContext(instrument ? instrumentCommitSource() : commitSource, context, {
    filename: commitPath
  });
  return {
    activityV1,
    context,
    core: context.__activityV2SessionCommitCore,
    commitApi: context.AppModules.activityV2.sessionCommit,
    draftApi: context.AppModules.activityV2.sessionDraft,
    semantics: context.AppModules.activityV2.semantics,
    semanticsV2: context.AppModules.activityV2.semanticsV2
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
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

function assertCommitError(action, code, expectedFocus = null) {
  let caught;
  assert.throws(action, (error) => {
    caught = error;
    return true;
  });
  assert.equal(caught.name, 'ActivityV2SessionCommitError');
  assert.equal(caught.code, code);
  assert.equal(caught.message, SAFE_MESSAGE);
  assert.equal(caught.message.includes(REQUEST_ID), false);
  assertFrozenTree(caught.focus_target);
  if (expectedFocus !== null) {
    assert.deepEqual(plain(caught.focus_target), expectedFocus);
  }
}

function findEntry(semantics, predicate) {
  const entry = semantics.getCatalog().entries.find(predicate);
  assert.ok(entry);
  return entry;
}

function createDraft(runtime, semantics = runtime.semanticsV2) {
  return runtime.draftApi.create({
    semantics,
    now: () => START_MS,
    createRequestId: () => REQUEST_ID
  });
}

function populateRequiredSetFields(controller, entry, setOrder = 1) {
  const values = {
    reps: '08',
    duration_sec: '030',
    distance_m: '100,50',
    weight_kg: '80,25',
    assistance_kg: '25.50'
  };
  ['reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'].forEach(
    (fieldKey) => {
      if (entry.fields[fieldKey] !== 'forbidden') {
        controller.setSetField(entry.key, setOrder, fieldKey, values[fieldKey]);
      }
    }
  );
}

function createValidStrengthDraft(runtime, semantics = runtime.semanticsV2) {
  const entry = findEntry(
    semantics,
    (candidate) =>
      candidate.status === 'active' &&
      candidate.tracking_mode === 'strength_sets' &&
      candidate.fields.reps === 'required' &&
      candidate.fields.weight_kg === 'optional'
  );
  const controller = createDraft(runtime, semantics);
  controller.addItem(entry.key);
  populateRequiredSetFields(controller, entry);
  return { controller, entry, snapshot: controller.getSnapshot() };
}

function makeJsonResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      return plain(body);
    },
    clone() {
      return makeJsonResponse(status, body);
    }
  };
}

function loadR2Consumer() {
  const calls = [];
  const context = vm.createContext({
    AppModules: {
      activityV2: {},
      supabase: {
        baseUrlFromRest(value) {
          return String(value).replace(/\/rest\/v1\/?$/, '');
        },
        async fetchWithAuth(makeRequest) {
          return await makeRequest({ authorization: 'Bearer test-token' });
        }
      }
    },
    Headers,
    URL,
    console,
    diag: { add() {} },
    async getConf() {
      return 'https://example.supabase.co/rest/v1/';
    },
    async fetch(url, options) {
      calls.push({ url, options });
      return makeJsonResponse(401, { message: 'auth' });
    }
  });
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  vm.runInContext(dataAccessSource, context, { filename: dataAccessPath });
  return { api: context.AppModules.activityV2.dataAccess, calls };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolveValue, rejectValue) => {
    resolve = resolveValue;
    reject = rejectValue;
  });
  return { promise, resolve, reject };
}

function nextTurn() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function settleTurns(count = 3) {
  for (let index = 0; index < count; index += 1) await nextTurn();
}

async function assertCoordinatorError(action, code) {
  let caught;
  try {
    await action();
  } catch (error) {
    caught = error;
  }
  assert.ok(caught, `expected coordinator error ${code}`);
  assert.equal(caught.name, 'ActivityV2SessionCommitError');
  assert.equal(caught.code, code);
  assert.equal(caught.message, SAFE_MESSAGE);
  assert.equal(caught.message.includes(REQUEST_ID), false);
  assertFrozenTree(caught.focus_target);
}

function makeRemoteError(code, commitState) {
  const error = new Error('raw remote fixture');
  error.name = 'ActivityV2DataAccessError';
  error.code = code;
  error.operation = 'commitSession';
  error.retryable = code === 'REQUEST_FAILED';
  error.commitState = commitState;
  return error;
}

function createRecoveryHarness(draft, {
  intent: initialIntent = null,
  nextAttemptNumber = 1
} = {}) {
  let persistedIntent = initialIntent;
  let attemptNumber = nextAttemptNumber - 1;
  const calls = [];
  const handlers = {};
  const attemptTokens = [
    'bbbbbbbb-0000-4000-8000-000000000001',
    'bbbbbbbb-0000-4000-8000-000000000002',
    'bbbbbbbb-0000-4000-8000-000000000003'
  ];

  function invoke(name, fallback, ...args) {
    calls.push({ method: name, args });
    try {
      return handlers[name]
        ? handlers[name](...args)
        : Promise.resolve().then(fallback);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  const recovery = {
    getState() {
      return { state: 'saved' };
    },
    getDraft() {
      return draft;
    },
    startNew() {
      throw new Error('unexpected startNew');
    },
    continueSession() {
      throw new Error('unexpected continueSession');
    },
    flush() {
      return invoke('flush', () => ({ state: 'saved' }));
    },
    discard() {
      return invoke('discard', () => ({ state: 'destroyed' }));
    },
    subscribe() {
      return () => {};
    },
    destroy() {},
    getCommitIntent() {
      calls.push({ method: 'getCommitIntent', args: [] });
      return persistedIntent;
    },
    prepareCommit(candidate) {
      return invoke(
        'prepareCommit',
        () => {
          persistedIntent = candidate;
          return candidate;
        },
        candidate
      );
    },
    beginCommitAttempt(candidate) {
      return invoke(
        'beginCommitAttempt',
        () => {
          assert.deepEqual(plain(candidate), plain(persistedIntent));
          attemptNumber += 1;
          return {
            commit_attempt_schema_version:
              'midas.activity-session-commit-attempt.v1',
            attempt_number: attemptNumber,
            attempt_token:
              attemptTokens[Math.min(attemptNumber - 1, attemptTokens.length - 1)]
          };
        },
        candidate
      );
    },
    releaseCommit(candidate) {
      return invoke(
        'releaseCommit',
        () => {
          assert.deepEqual(plain(candidate), plain(persistedIntent));
          persistedIntent = null;
          return null;
        },
        candidate
      );
    },
    completeCommit(candidate) {
      return invoke(
        'completeCommit',
        () => {
          assert.deepEqual(plain(candidate), plain(persistedIntent));
          persistedIntent = null;
          return { state: 'destroyed' };
        },
        candidate
      );
    }
  };
  return {
    recovery,
    calls,
    handlers,
    getIntent: () => persistedIntent,
    setIntent(value) {
      persistedIntent = value;
    },
    setAttemptNumber(value) {
      attemptNumber = value - 1;
    }
  };
}

function createCoordinator(runtime, {
  draft,
  recovery,
  semantics = runtime.semanticsV2,
  commitSession = async () => ({ outcome: 'created' }),
  now = () => START_MS + 60000
}) {
  return runtime.commitApi.create({
    draft,
    recovery,
    semantics,
    commitSession,
    now
  });
}

function assertCoordinatorState(controller, expected) {
  const state = controller.getState();
  assert.deepEqual(Object.keys(state), [
    'state',
    'reason',
    'focus_target',
    'intent_present'
  ]);
  assertFrozenTree(state);
  assert.deepEqual(plain(state), expected);
}

test('S4.5 public namespace is exact while R14 product loading stays explicit', () => {
  const runtime = loadRuntime({ instrument: false });

  assert.deepEqual(Object.keys(runtime.commitApi), ['create']);
  assertFrozenTree(runtime.commitApi);
  assert.equal(runtime.context.AppModules.activity, runtime.activityV1);
  assert.doesNotMatch(commitSource, /\bfetch\s*\(/);
  assert.doesNotMatch(commitSource, /indexedDB|localStorage|sessionStorage/);
  assert.doesNotMatch(commitSource, /supabase|activity_v2_commit_session/i);
  assert.equal(indexSource.includes('session-commit.js'), true);
  assert.equal(serviceWorkerSource.includes('session-commit.js'), true);
  assert.throws(
    () => vm.runInContext(commitSource, runtime.context, { filename: commitPath }),
    /already registered/
  );

  const instrumented = loadRuntime();
  assert.deepEqual(Object.keys(instrumented.core), [
    'projectDraft',
    'createCommitIntent',
    'validateCommitIntent'
  ]);
  assertFrozenTree(instrumented.core);
});

test('S4.1 maps a real mixed v2 draft into exact canonical item payloads', () => {
  const runtime = loadRuntime();
  const semantics = runtime.semanticsV2;
  const strength = findEntry(
    semantics,
    (entry) =>
      entry.status === 'active' &&
      entry.tracking_mode === 'strength_sets' &&
      entry.fields.reps === 'required' &&
      entry.fields.weight_kg === 'optional'
  );
  const duration = findEntry(
    semantics,
    (entry) => entry.status === 'active' && entry.tracking_mode === 'duration'
  );
  const distance = findEntry(
    semantics,
    (entry) =>
      entry.status === 'active' && entry.tracking_mode === 'duration_distance'
  );
  const draft = createDraft(runtime, semantics);
  draft.addItem(strength.key);
  draft.addItem(duration.key);
  draft.addItem(distance.key);
  draft.setNote('  Training  ');
  draft.setItemField(strength.key, 'note', '  Satznotiz  ');
  draft.setSetField(strength.key, 1, 'reps', '08');
  draft.setSetField(strength.key, 1, 'weight_kg', '80,50');
  draft.setSetField(strength.key, 2, 'reps', '10');
  draft.setItemField(duration.key, 'duration_min', '045');
  draft.setItemField(distance.key, 'duration_min', '30');
  draft.setItemField(distance.key, 'distance_km', '5,25');

  const snapshot = draft.getSnapshot();
  const projection = runtime.core.projectDraft(snapshot, semantics);

  assert.deepEqual(Object.keys(projection), [
    'request_id',
    'draft_revision',
    'catalog_version',
    'started_at',
    'note',
    'items'
  ]);
  assert.deepEqual(
    plain(projection),
    {
      request_id: REQUEST_ID,
      draft_revision: snapshot.revision,
      catalog_version: 2,
      started_at: '2026-08-10T08:00:00.000Z',
      note: 'Training',
      items: [
        {
          item_key: strength.key,
          item_order: 1,
          duration_min: null,
          distance_km: null,
          note: 'Satznotiz',
          sets: [
            {
              set_order: 1,
              reps: 8,
              duration_sec: null,
              distance_m: null,
              weight_kg: 80.5,
              assistance_kg: null
            },
            {
              set_order: 2,
              reps: 10,
              duration_sec: null,
              distance_m: null,
              weight_kg: null,
              assistance_kg: null
            }
          ]
        },
        {
          item_key: duration.key,
          item_order: 2,
          duration_min: 45,
          distance_km: null,
          note: null,
          sets: []
        },
        {
          item_key: distance.key,
          item_order: 3,
          duration_min: 30,
          distance_km: 5.25,
          note: null,
          sets: []
        }
      ]
    }
  );
  assertFrozenTree(projection);
  assert.equal(draft.getSnapshot(), snapshot);
});

test('S4.1 covers every real strength policy and omits only trailing empty rows', () => {
  const runtime = loadRuntime();
  const semantics = runtime.semanticsV2;
  const bySignature = new Map();
  semantics
    .getCatalog()
    .entries.filter(
      (entry) => entry.status === 'active' && entry.tracking_mode === 'strength_sets'
    )
    .forEach((entry) => {
      const signature = [
        'reps',
        'duration_sec',
        'distance_m',
        'weight_kg',
        'assistance_kg'
      ]
        .map((fieldKey) => entry.fields[fieldKey])
        .join('|');
      if (!bySignature.has(signature)) bySignature.set(signature, entry);
    });
  assert.equal(bySignature.size, 8);

  bySignature.forEach((entry) => {
    const draft = createDraft(runtime, semantics);
    draft.addItem(entry.key);
    populateRequiredSetFields(draft, entry);
    const item = runtime.core.projectDraft(draft.getSnapshot(), semantics).items[0];
    assert.equal(item.sets.length, 1);
    assert.equal(item.sets[0].set_order, 1);
    ['reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'].forEach(
      (fieldKey) => {
        assert.equal(
          item.sets[0][fieldKey] === null,
          entry.fields[fieldKey] === 'forbidden'
        );
      }
    );
  });
});

test('S4.1 rejects strength gaps and partial or invalid fields at first visible focus', () => {
  const runtime = loadRuntime();
  const semantics = runtime.semanticsV2;
  const { entry } = createValidStrengthDraft(runtime, semantics);

  const emptyPerformance = createDraft(runtime, semantics);
  emptyPerformance.addItem(entry.key);
  emptyPerformance.setItemField(entry.key, 'note', 'Nur Notiz');
  assertCommitError(
    () => runtime.core.projectDraft(emptyPerformance.getSnapshot(), semantics),
    'INVALID_SET_VALUE',
    { scope: 'set', item_key: entry.key, set_order: 1, field_key: 'reps' }
  );

  const gapDraft = createDraft(runtime, semantics);
  gapDraft.addItem(entry.key);
  gapDraft.setSetField(entry.key, 2, 'reps', '10');
  assertCommitError(
    () => runtime.core.projectDraft(gapDraft.getSnapshot(), semantics),
    'INVALID_SET_VALUE',
    { scope: 'set', item_key: entry.key, set_order: 1, field_key: 'reps' }
  );

  const partialDraft = createDraft(runtime, semantics);
  partialDraft.addItem(entry.key);
  partialDraft.setSetField(entry.key, 1, 'weight_kg', '20');
  assertCommitError(
    () => runtime.core.projectDraft(partialDraft.getSnapshot(), semantics),
    'INVALID_SET_VALUE',
    { scope: 'set', item_key: entry.key, set_order: 1, field_key: 'reps' }
  );

  const invalidDraft = createDraft(runtime, semantics);
  invalidDraft.addItem(entry.key);
  invalidDraft.setSetField(entry.key, 1, 'reps', '8');
  invalidDraft.setSetField(entry.key, 1, 'weight_kg', '10,');
  assertCommitError(
    () => runtime.core.projectDraft(invalidDraft.getSnapshot(), semantics),
    'INVALID_SET_VALUE',
    {
      scope: 'set',
      item_key: entry.key,
      set_order: 1,
      field_key: 'weight_kg'
    }
  );
});

test('S4.1 never lets a note hide missing non-strength performance', () => {
  const runtime = loadRuntime();
  const semantics = runtime.semanticsV2;
  const entry = findEntry(
    semantics,
    (candidate) => candidate.status === 'active' && candidate.tracking_mode === 'duration'
  );
  const draft = createDraft(runtime, semantics);
  draft.addItem(entry.key);
  draft.setItemField(entry.key, 'note', 'Nur Notiz');

  assertCommitError(
    () => runtime.core.projectDraft(draft.getSnapshot(), semantics),
    'INVALID_ITEM_VALUE',
    {
      scope: 'item',
      item_key: entry.key,
      set_order: null,
      field_key: 'duration_min'
    }
  );
});

test('S4.1 parser rejects signs, exponents, spaces, excess decimals and ranges', () => {
  const runtime = loadRuntime();
  const semantics = runtime.semanticsV2;
  const entry = findEntry(
    semantics,
    (candidate) =>
      candidate.status === 'active' &&
      candidate.tracking_mode === 'duration_distance'
  );
  const cases = [
    ['duration_min', '+5'],
    ['duration_min', '5.0'],
    ['duration_min', ' 5'],
    ['duration_min', '0'],
    ['duration_min', '1441'],
    ['distance_km', '1e2'],
    ['distance_km', '-1'],
    ['distance_km', '1,234'],
    ['distance_km', '1000.01']
  ];
  cases.forEach(([fieldKey, rawValue]) => {
    const draft = createDraft(runtime, semantics);
    draft.addItem(entry.key);
    draft.setItemField(entry.key, 'duration_min', '30');
    draft.setItemField(entry.key, fieldKey, rawValue);
    assertCommitError(
      () => runtime.core.projectDraft(draft.getSnapshot(), semantics),
      'INVALID_ITEM_VALUE',
      {
        scope: 'item',
        item_key: entry.key,
        set_order: null,
        field_key: fieldKey
      }
    );
  });
});

test('S4.1 preserves non-ASCII item-note edges while applying SQL ASCII btrim', () => {
  const runtime = loadRuntime();
  const { controller, entry } = createValidStrengthDraft(runtime);
  controller.setItemField(entry.key, 'note', '  \u00a0x\u00a0  ');

  const item = runtime.core.projectDraft(
    controller.getSnapshot(),
    runtime.semanticsV2
  ).items[0];
  assert.equal(item.note, '\u00a0x\u00a0');
});

test('S4.1 fails closed for empty, unfrozen, mismatched and forbidden drafts', () => {
  const runtime = loadRuntime();
  const empty = createDraft(runtime, runtime.semantics);
  assertCommitError(
    () => runtime.core.projectDraft(empty.getSnapshot(), runtime.semantics),
    'EMPTY_SESSION',
    { scope: 'session', item_key: null, set_order: null, field_key: 'items' }
  );

  const { snapshot, entry } = createValidStrengthDraft(runtime);
  assertCommitError(
    () => runtime.core.projectDraft(plain(snapshot), runtime.semanticsV2),
    'INVALID_DRAFT'
  );
  assertCommitError(
    () => runtime.core.projectDraft(snapshot, runtime.semantics),
    'CATALOG_VERSION_MISMATCH',
    {
      scope: 'session',
      item_key: null,
      set_order: null,
      field_key: 'catalog_version'
    }
  );

  const forbidden = plain(snapshot);
  forbidden.items[0].duration_min = '5';
  deepFreeze(forbidden);
  assertCommitError(
    () => runtime.core.projectDraft(forbidden, runtime.semanticsV2),
    'INVALID_ITEM_VALUE',
    {
      scope: 'item',
      item_key: entry.key,
      set_order: null,
      field_key: 'duration_min'
    }
  );
});

test('S4.1 keeps item-first then session-field validation and exact focus', () => {
  const runtime = loadRuntime();
  const { snapshot, entry } = createValidStrengthDraft(runtime);
  const itemAndTimeInvalid = plain(snapshot);
  itemAndTimeInvalid.items[0].sets[0].reps = null;
  itemAndTimeInvalid.started_at = 'invalid';
  deepFreeze(itemAndTimeInvalid);
  assertCommitError(
    () => runtime.core.projectDraft(itemAndTimeInvalid, runtime.semanticsV2),
    'INVALID_SET_VALUE',
    { scope: 'set', item_key: entry.key, set_order: 1, field_key: 'reps' }
  );

  const noteInvalid = plain(snapshot);
  noteInvalid.note = ' not-trimmed ';
  deepFreeze(noteInvalid);
  assertCommitError(
    () => runtime.core.projectDraft(noteInvalid, runtime.semanticsV2),
    'INVALID_DRAFT',
    { scope: 'session', item_key: null, set_order: null, field_key: 'note' }
  );

  const startInvalid = plain(snapshot);
  startInvalid.started_at = 'invalid';
  deepFreeze(startInvalid);
  assertCommitError(
    () => runtime.core.projectDraft(startInvalid, runtime.semanticsV2),
    'INVALID_DRAFT',
    {
      scope: 'session',
      item_key: null,
      set_order: null,
      field_key: 'started_at'
    }
  );

  const r2YearInvalid = plain(snapshot);
  r2YearInvalid.started_at = '0000-01-01T00:00:00.000Z';
  deepFreeze(r2YearInvalid);
  assertCommitError(
    () => runtime.core.projectDraft(r2YearInvalid, runtime.semanticsV2),
    'INVALID_DRAFT',
    {
      scope: 'session',
      item_key: null,
      set_order: null,
      field_key: 'started_at'
    }
  );
});

test('S4.2 creates exact payload and intent with one clock read and deep freeze', () => {
  const runtime = loadRuntime();
  const { snapshot } = createValidStrengthDraft(runtime);
  let reads = 0;
  const nowValue = START_MS + 90000;
  const intent = runtime.core.createCommitIntent(
    snapshot,
    runtime.semanticsV2,
    () => {
      reads += 1;
      return nowValue;
    }
  );

  assert.equal(reads, 1);
  assert.deepEqual(Object.keys(intent), [
    'commit_intent_schema_version',
    'request_id',
    'draft_revision',
    'catalog_version',
    'prepared_at',
    'payload'
  ]);
  assert.deepEqual(Object.keys(intent.payload), [
    'schema_version',
    'catalog_version',
    'started_at',
    'ended_at',
    'duration_min',
    'title',
    'note',
    'items'
  ]);
  assert.equal(intent.commit_intent_schema_version, 'midas.activity-session-commit-intent.v1');
  assert.equal(intent.request_id, snapshot.request_id);
  assert.equal(intent.draft_revision, snapshot.revision);
  assert.equal(intent.catalog_version, snapshot.catalog_version);
  assert.equal(intent.prepared_at, '2026-08-10T08:01:30.000Z');
  assert.equal(intent.payload.schema_version, 'midas.activity-session.v1');
  assert.equal(intent.payload.started_at, snapshot.started_at);
  assert.equal(intent.payload.ended_at, intent.prepared_at);
  assert.equal(intent.payload.duration_min, 2);
  assert.equal(intent.payload.title, null);
  assertFrozenTree(intent);

  const same = runtime.core.createCommitIntent(
    snapshot,
    runtime.semanticsV2,
    () => nowValue
  );
  assert.deepEqual(plain(same), plain(intent));
});

test('S4.2 enforces negative, zero, 24-hour and rounded upper time boundaries', () => {
  const runtime = loadRuntime();
  const { snapshot } = createValidStrengthDraft(runtime);
  const createAt = (delta) =>
    runtime.core.createCommitIntent(
      snapshot,
      runtime.semanticsV2,
      () => START_MS + delta
    );

  assert.equal(createAt(0).payload.duration_min, 1);
  assert.equal(createAt(29000).payload.duration_min, 1);
  assert.equal(createAt(24 * 60 * 60000).payload.duration_min, 1440);
  assert.equal(
    createAt(24 * 60 * 60000 + 29999).payload.duration_min,
    1440
  );
  assertCommitError(() => createAt(-1), 'INVALID_TIME', {
    scope: 'session',
    item_key: null,
    set_order: null,
    field_key: 'ended_at'
  });
  assertCommitError(() => createAt(24 * 60 * 60000 + 30000), 'INVALID_TIME', {
    scope: 'session',
    item_key: null,
    set_order: null,
    field_key: 'duration_min'
  });
});

test('S4.2 rejects invalid clocks and never reads time for invalid projection', () => {
  const runtime = loadRuntime();
  const { snapshot } = createValidStrengthDraft(runtime);
  [null, 1, () => NaN, () => Infinity, () => '2026-08-10'].forEach((now) => {
    assertCommitError(
      () => runtime.core.createCommitIntent(snapshot, runtime.semanticsV2, now),
      'INVALID_CLOCK'
    );
  });
  const yearTenThousand = Date.parse('+010000-01-01T00:00:00.000Z');
  assert.equal(Number.isFinite(yearTenThousand), true);
  assertCommitError(
    () =>
      runtime.core.createCommitIntent(
        snapshot,
        runtime.semanticsV2,
        () => yearTenThousand
      ),
    'INVALID_CLOCK',
    {
      scope: 'session',
      item_key: null,
      set_order: null,
      field_key: 'ended_at'
    }
  );
  assertCommitError(
    () =>
      runtime.core.createCommitIntent(snapshot, runtime.semanticsV2, () => {
        throw new Error('raw-clock-error');
      }),
    'INVALID_CLOCK'
  );

  const empty = createDraft(runtime, runtime.semanticsV2);
  let reads = 0;
  assertCommitError(
    () =>
      runtime.core.createCommitIntent(empty.getSnapshot(), runtime.semanticsV2, () => {
        reads += 1;
        return START_MS;
      }),
    'EMPTY_SESSION'
  );
  assert.equal(reads, 0);
});

test('S4.2 validates persisted JSON intent exactly and returns a protected clone', () => {
  const runtime = loadRuntime();
  const { snapshot } = createValidStrengthDraft(runtime);
  const intent = runtime.core.createCommitIntent(
    snapshot,
    runtime.semanticsV2,
    () => START_MS + 60000
  );
  const stored = plain(intent);
  const validated = runtime.core.validateCommitIntent(
    stored,
    snapshot,
    runtime.semanticsV2
  );
  assert.notEqual(validated, stored);
  assert.notEqual(validated.payload, stored.payload);
  assert.deepEqual(plain(validated), stored);
  assertFrozenTree(validated);

  const corruptions = [
    (value) => {
      value.request_id = value.request_id.toUpperCase();
    },
    (value) => {
      value.prepared_at = '2026-08-10T08:02:00.000Z';
    },
    (value) => {
      value.payload.duration_min += 1;
    },
    (value) => {
      value.payload.items[0].sets[0].reps += 1;
    },
    (value) => {
      value.extra = true;
    },
    (value) => {
      value.payload = {
        ended_at: value.payload.ended_at,
        schema_version: value.payload.schema_version,
        catalog_version: value.payload.catalog_version,
        started_at: value.payload.started_at,
        duration_min: value.payload.duration_min,
        title: value.payload.title,
        note: value.payload.note,
        items: value.payload.items
      };
    }
  ];
  corruptions.forEach((corrupt) => {
    const candidate = plain(intent);
    corrupt(candidate);
    assertCommitError(
      () =>
        runtime.core.validateCommitIntent(
          candidate,
          snapshot,
          runtime.semanticsV2
        ),
      'INVALID_COMMIT_INTENT'
    );
  });
});

test('S4.1/S4.2 output passes the real R2 v1 consumer without body drift', async () => {
  const runtime = loadRuntime();
  const { snapshot } = createValidStrengthDraft(runtime, runtime.semantics);
  const intent = runtime.core.createCommitIntent(
    snapshot,
    runtime.semantics,
    () => START_MS + 60000
  );
  const consumer = loadR2Consumer();

  await assert.rejects(
    consumer.api.commitSession({
      requestId: intent.request_id,
      payload: intent.payload
    }),
    (error) =>
      error.name === 'ActivityV2DataAccessError' && error.code === 'AUTH_REQUIRED'
  );
  assert.equal(consumer.calls.length, 1);
  assert.deepEqual(JSON.parse(consumer.calls[0].options.body), {
    p_request_id: intent.request_id,
    p_payload: plain(intent.payload)
  });
});

test('S4.5 exposes an exact controller/state and rejects ambient or accessor injections', async () => {
  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft);
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery
  });

  assert.deepEqual(Object.keys(controller), [
    'getState',
    'finish',
    'retry',
    'subscribe',
    'destroy'
  ]);
  assertFrozenTree(controller);
  assertCoordinatorState(controller, {
    state: 'editing',
    reason: null,
    focus_target: null,
    intent_present: false
  });

  await assertCoordinatorError(
    () =>
      runtime.commitApi.create({
        draft,
        recovery: harness.recovery,
        semantics: runtime.semanticsV2,
        commitSession: async () => ({ outcome: 'created' }),
        now: () => START_MS + 60000,
        storage: {}
      }),
    'INVALID_OPTIONS'
  );

  let getterCalls = 0;
  const accessorOptions = {
    draft,
    recovery: harness.recovery,
    semantics: runtime.semanticsV2,
    commitSession: async () => ({ outcome: 'created' })
  };
  Object.defineProperty(accessorOptions, 'now', {
    enumerable: true,
    get() {
      getterCalls += 1;
      return () => START_MS + 60000;
    }
  });
  await assertCoordinatorError(
    () => runtime.commitApi.create(accessorOptions),
    'INVALID_OPTIONS'
  );
  assert.equal(getterCalls, 0);

  await assertCoordinatorError(() => controller.retry(), 'INVALID_STATE');
});

test('S4.5 coalesces reentrant finish and orders flush, intent, claim, dispatch and complete', async () => {
  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft);
  const flushGate = deferred();
  const prepareGate = deferred();
  const beginGate = deferred();
  const remoteGate = deferred();
  const order = [];
  let clockReads = 0;
  let dispatchedRequest = null;

  harness.handlers.flush = () => {
    order.push('flush');
    return flushGate.promise;
  };
  harness.handlers.prepareCommit = (candidate) => {
    order.push('prepare');
    return prepareGate.promise.then(() => {
      harness.setIntent(candidate);
      return candidate;
    });
  };
  harness.handlers.beginCommitAttempt = () => {
    order.push('begin');
    return beginGate.promise.then(() => ({
      commit_attempt_schema_version:
        'midas.activity-session-commit-attempt.v1',
      attempt_number: 1,
      attempt_token: 'bbbbbbbb-0000-4000-8000-000000000001'
    }));
  };
  harness.handlers.completeCommit = (candidate) => {
    order.push('complete');
    assert.deepEqual(plain(candidate), plain(harness.getIntent()));
    harness.setIntent(null);
    return Promise.resolve({ state: 'destroyed' });
  };

  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    now() {
      clockReads += 1;
      order.push('clock');
      queueMicrotask(() => order.push('post-clock-microtask'));
      return START_MS + 60000;
    },
    commitSession(request) {
      order.push('dispatch');
      dispatchedRequest = request;
      return remoteGate.promise;
    }
  });
  let reentrantPromise = null;
  controller.subscribe((state) => {
    if (state.state === 'preparing' && reentrantPromise === null) {
      reentrantPromise = controller.finish();
    }
  });

  const finishPromise = controller.finish();
  assert.equal(reentrantPromise, finishPromise);
  assert.equal(controller.finish(), finishPromise);
  assertCoordinatorState(controller, {
    state: 'preparing',
    reason: null,
    focus_target: null,
    intent_present: false
  });
  assert.deepEqual(order, ['flush']);

  flushGate.resolve({ state: 'saved' });
  await settleTurns();
  assert.deepEqual(order, [
    'flush',
    'clock',
    'prepare',
    'post-clock-microtask'
  ]);
  assert.equal(clockReads, 1);
  assert.equal(dispatchedRequest, null);

  prepareGate.resolve();
  await settleTurns();
  assert.equal(order.at(-1), 'begin');
  assertCoordinatorState(controller, {
    state: 'preparing',
    reason: null,
    focus_target: null,
    intent_present: true
  });
  assert.equal(dispatchedRequest, null);

  beginGate.resolve();
  await settleTurns();
  assert.equal(order.at(-1), 'dispatch');
  assertCoordinatorState(controller, {
    state: 'committing',
    reason: null,
    focus_target: null,
    intent_present: true
  });
  assert.deepEqual(Object.keys(dispatchedRequest), ['requestId', 'payload']);
  assert.equal(dispatchedRequest.requestId, REQUEST_ID);
  assert.deepEqual(
    plain(dispatchedRequest.payload),
    plain(harness.getIntent().payload)
  );

  remoteGate.resolve({ outcome: 'created' });
  const result = await finishPromise;
  assert.equal(result, controller.getState());
  assert.deepEqual(order, [
    'flush',
    'clock',
    'prepare',
    'post-clock-microtask',
    'begin',
    'dispatch',
    'complete'
  ]);
  assertCoordinatorState(controller, {
    state: 'committed',
    reason: null,
    focus_target: null,
    intent_present: false
  });
});

test('S4.5 keeps local validation in editing without clock, intent, claim or dispatch', async () => {
  const runtime = loadRuntime();
  const draft = createDraft(runtime);
  const harness = createRecoveryHarness(draft);
  let clockReads = 0;
  let remoteCalls = 0;
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    now() {
      clockReads += 1;
      return START_MS + 60000;
    },
    async commitSession() {
      remoteCalls += 1;
      return { outcome: 'created' };
    }
  });

  const result = await controller.finish();
  assert.equal(result, controller.getState());
  assertCoordinatorState(controller, {
    state: 'editing',
    reason: 'EMPTY_SESSION',
    focus_target: {
      scope: 'session',
      item_key: null,
      set_order: null,
      field_key: 'items'
    },
    intent_present: false
  });
  assert.equal(clockReads, 0);
  assert.equal(remoteCalls, 0);
  assert.equal(
    harness.calls.some(({ method }) => method === 'prepareCommit'),
    false
  );
  assert.equal(
    harness.calls.some(({ method }) => method === 'beginCommitAttempt'),
    false
  );
});

test('S4.5 destroy invalidates an active operation and suppresses late side effects', async () => {
  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft);
  const flushGate = deferred();
  let remoteCalls = 0;
  const observedStates = [];
  harness.handlers.flush = () => flushGate.promise;
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    async commitSession() {
      remoteCalls += 1;
      return { outcome: 'created' };
    }
  });
  controller.subscribe((state) => observedStates.push(state.state));

  const operation = controller.finish();
  const destroyed = controller.destroy();
  assert.equal(await operation, destroyed);
  assertCoordinatorState(controller, {
    state: 'destroyed',
    reason: null,
    focus_target: null,
    intent_present: false
  });
  flushGate.resolve({ state: 'saved' });
  await settleTurns();
  assert.deepEqual(observedStates, ['editing', 'preparing', 'destroyed']);
  assert.equal(remoteCalls, 0);
  assert.equal(
    harness.calls.some(({ method }) => method === 'prepareCommit'),
    false
  );
  await assertCoordinatorError(() => controller.finish(), 'CONTROLLER_DESTROYED');
});

test('S4.5 blocks reentrant destroy at committing before remote dispatch', async () => {
  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft);
  let remoteCalls = 0;
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    async commitSession() {
      remoteCalls += 1;
      return { outcome: 'created' };
    }
  });
  controller.subscribe((state) => {
    if (state.state === 'committing') controller.destroy();
  });

  const result = await controller.finish();
  assert.equal(result.state, 'destroyed');
  assert.equal(remoteCalls, 0);
  assert.notEqual(harness.getIntent(), null);
  assert.equal(
    harness.calls.filter(({ method }) => method === 'beginCommitAttempt').length,
    1
  );
  assert.equal(
    harness.calls.some(({ method }) => method === 'completeCommit'),
    false
  );
});

test('S4.5 rejects raw dependency codes and a persistence confirmation that changes intent', async () => {
  const runtime = loadRuntime();
  const { controller: realDraft, snapshot } = createValidStrengthDraft(runtime);
  let focusGetterCalls = 0;
  const poisonedFocus = {};
  Object.defineProperties(poisonedFocus, {
    scope: {
      enumerable: true,
      get() {
        focusGetterCalls += 1;
        return 'session';
      }
    },
    item_key: { enumerable: true, value: null },
    set_order: { enumerable: true, value: null },
    field_key: { enumerable: true, value: 'secret-request-id' }
  });
  const poisonedDraft = Object.fromEntries(
    Object.keys(realDraft).map((key) => [
      key,
      key === 'getSnapshot'
        ? () => {
            const error = new Error('raw dependency fixture');
            error.code = 'SECRET_REQUEST_aaaaaaaa';
            error.focus_target = poisonedFocus;
            throw error;
          }
        : realDraft[key]
    ])
  );
  const poisonedHarness = createRecoveryHarness(poisonedDraft);
  const poisonedController = createCoordinator(runtime, {
    draft: poisonedDraft,
    recovery: poisonedHarness.recovery
  });
  await poisonedController.finish();
  assertCoordinatorState(poisonedController, {
    state: 'editing',
    reason: 'INVALID_DRAFT',
    focus_target: null,
    intent_present: false
  });
  assert.equal(focusGetterCalls, 0);

  const mismatchHarness = createRecoveryHarness(realDraft);
  const differentIntent = runtime.core.createCommitIntent(
    snapshot,
    runtime.semanticsV2,
    () => START_MS + 120000
  );
  let remoteCalls = 0;
  mismatchHarness.handlers.prepareCommit = () => {
    mismatchHarness.setIntent(differentIntent);
    return Promise.resolve(differentIntent);
  };
  const mismatchController = createCoordinator(runtime, {
    draft: realDraft,
    recovery: mismatchHarness.recovery,
    async commitSession() {
      remoteCalls += 1;
      return { outcome: 'created' };
    }
  });
  await mismatchController.finish();
  assertCoordinatorState(mismatchController, {
    state: 'blocked',
    reason: 'INVALID_COMMIT_INTENT',
    focus_target: null,
    intent_present: true
  });
  assert.equal(remoteCalls, 0);
  assert.equal(
    mismatchHarness.calls.some(
      ({ method }) => method === 'beginCommitAttempt'
    ),
    false
  );
});

test('S4.6 resumes a persisted intent and replays the identical request under one claim', async () => {
  const runtime = loadRuntime();
  const { controller: draft, snapshot } = createValidStrengthDraft(runtime);
  const intent = runtime.core.createCommitIntent(
    snapshot,
    runtime.semanticsV2,
    () => START_MS + 60000
  );
  const harness = createRecoveryHarness(draft, {
    intent,
    nextAttemptNumber: 2
  });
  const remoteGate = deferred();
  const remoteCalls = [];
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    commitSession(request) {
      remoteCalls.push(request);
      return remoteGate.promise;
    }
  });

  assertCoordinatorState(controller, {
    state: 'unknown',
    reason: 'RECOVERY_RESUME',
    focus_target: null,
    intent_present: true
  });
  const first = controller.retry();
  const second = controller.retry();
  assert.equal(first, second);
  await settleTurns();
  assert.equal(
    harness.calls.filter(({ method }) => method === 'beginCommitAttempt').length,
    1
  );
  assert.equal(remoteCalls.length, 1);
  assert.equal(remoteCalls[0].requestId, intent.request_id);
  assert.deepEqual(plain(remoteCalls[0].payload), plain(intent.payload));
  assert.equal(
    harness.calls.some(({ method }) => method === 'flush'),
    false
  );
  assert.equal(
    harness.calls.some(({ method }) => method === 'prepareCommit'),
    false
  );

  remoteGate.resolve({ outcome: 'replayed' });
  await first;
  assertCoordinatorState(controller, {
    state: 'committed',
    reason: null,
    focus_target: null,
    intent_present: false
  });
});

test('S4.6 releases only a known first-attempt non-commit', async () => {
  for (const fixture of [
    { code: 'AUTH_REQUIRED', commitState: 'not_committed' },
    { code: 'INVALID_SESSION', commitState: 'not_committed' },
    { code: 'REQUEST_FAILED', commitState: 'not_committed' }
  ]) {
    const runtime = loadRuntime();
    const { controller: draft } = createValidStrengthDraft(runtime);
    const harness = createRecoveryHarness(draft);
    const controller = createCoordinator(runtime, {
      draft,
      recovery: harness.recovery,
      async commitSession() {
        throw makeRemoteError(fixture.code, fixture.commitState);
      }
    });

    await controller.finish();
    assertCoordinatorState(controller, {
      state: 'not_committed',
      reason: fixture.code,
      focus_target: null,
      intent_present: false
    });
    assert.equal(harness.getIntent(), null);
    assert.equal(
      harness.calls.filter(({ method }) => method === 'releaseCommit').length,
      1
    );
  }

  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft, { nextAttemptNumber: 2 });
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    async commitSession() {
      throw makeRemoteError('INVALID_SESSION', 'not_committed');
    }
  });
  await controller.finish();
  assertCoordinatorState(controller, {
    state: 'unknown',
    reason: 'INVALID_SESSION',
    focus_target: null,
    intent_present: true
  });
  assert.equal(
    harness.calls.some(({ method }) => method === 'releaseCommit'),
    false
  );
});

test('S4.6 release_pending retries only local release and never the remote call', async () => {
  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft);
  let releaseCalls = 0;
  let remoteCalls = 0;
  harness.handlers.releaseCommit = (candidate) => {
    releaseCalls += 1;
    if (releaseCalls === 1) {
      const error = new Error('raw storage fixture');
      error.code = 'STORAGE_ERROR';
      return Promise.reject(error);
    }
    assert.deepEqual(plain(candidate), plain(harness.getIntent()));
    harness.setIntent(null);
    return Promise.resolve(null);
  };
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    async commitSession() {
      remoteCalls += 1;
      throw makeRemoteError('AUTH_REQUIRED', 'not_committed');
    }
  });

  await controller.finish();
  assertCoordinatorState(controller, {
    state: 'release_pending',
    reason: 'STORAGE_ERROR',
    focus_target: null,
    intent_present: true
  });
  const retry = controller.retry();
  assert.equal(controller.retry(), retry);
  await retry;
  assertCoordinatorState(controller, {
    state: 'not_committed',
    reason: 'AUTH_REQUIRED',
    focus_target: null,
    intent_present: false
  });
  assert.equal(remoteCalls, 1);
  assert.equal(releaseCalls, 2);
  assert.equal(
    harness.calls.filter(({ method }) => method === 'beginCommitAttempt').length,
    1
  );
});

test('S4.6 keeps unknown, malformed success and idempotency conflict locked', async () => {
  const fixtures = [
    {
      expectedState: 'unknown',
      expectedReason: 'REQUEST_FAILED',
      remote: async () => {
        throw makeRemoteError('REQUEST_FAILED', 'unknown');
      }
    },
    {
      expectedState: 'unknown',
      expectedReason: 'REQUEST_FAILED',
      remote: async () => ({ outcome: 'invalid' })
    },
    {
      expectedState: 'blocked',
      expectedReason: 'IDEMPOTENCY_CONFLICT',
      remote: async () => {
        throw makeRemoteError('IDEMPOTENCY_CONFLICT', 'not_committed');
      }
    }
  ];

  for (const fixture of fixtures) {
    const runtime = loadRuntime();
    const { controller: draft } = createValidStrengthDraft(runtime);
    const harness = createRecoveryHarness(draft);
    const controller = createCoordinator(runtime, {
      draft,
      recovery: harness.recovery,
      commitSession: fixture.remote
    });
    await controller.finish();
    assertCoordinatorState(controller, {
      state: fixture.expectedState,
      reason: fixture.expectedReason,
      focus_target: null,
      intent_present: true
    });
    assert.notEqual(harness.getIntent(), null);
    assert.equal(
      harness.calls.some(({ method }) => method === 'releaseCommit'),
      false
    );
    assert.equal(
      harness.calls.some(({ method }) => method === 'completeCommit'),
      false
    );
  }
});

test('S4.6 retries an unknown outcome with a new claim and the identical frozen intent', async () => {
  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft);
  const remoteCalls = [];
  let clockReads = 0;
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    now() {
      clockReads += 1;
      return START_MS + 60000;
    },
    async commitSession(request) {
      remoteCalls.push(request);
      if (remoteCalls.length === 1) {
        throw makeRemoteError('REQUEST_FAILED', 'unknown');
      }
      return { outcome: 'replayed' };
    }
  });

  await controller.finish();
  assertCoordinatorState(controller, {
    state: 'unknown',
    reason: 'REQUEST_FAILED',
    focus_target: null,
    intent_present: true
  });
  const retry = controller.retry();
  assert.equal(controller.retry(), retry);
  await retry;
  assertCoordinatorState(controller, {
    state: 'committed',
    reason: null,
    focus_target: null,
    intent_present: false
  });
  assert.equal(clockReads, 1);
  assert.equal(remoteCalls.length, 2);
  assert.equal(remoteCalls[0].requestId, remoteCalls[1].requestId);
  assert.deepEqual(plain(remoteCalls[0].payload), plain(remoteCalls[1].payload));
  assert.equal(
    harness.calls.filter(({ method }) => method === 'prepareCommit').length,
    1
  );
  assert.equal(
    harness.calls.filter(({ method }) => method === 'beginCommitAttempt').length,
    2
  );
});

test('S4.6 never dispatches when the attempt claim conflicts or is malformed', async () => {
  const fixtures = [
    {
      reason: 'CONFLICT',
      begin() {
        const error = new Error('raw claim conflict fixture');
        error.code = 'CONFLICT';
        return Promise.reject(error);
      }
    },
    {
      reason: 'INVALID_COMMIT_ATTEMPT',
      begin() {
        return Promise.resolve({
          commit_attempt_schema_version:
            'midas.activity-session-commit-attempt.v1',
          attempt_number: 0,
          attempt_token: 'not-a-token'
        });
      }
    }
  ];

  for (const fixture of fixtures) {
    const runtime = loadRuntime();
    const { controller: draft } = createValidStrengthDraft(runtime);
    const harness = createRecoveryHarness(draft);
    let remoteCalls = 0;
    harness.handlers.beginCommitAttempt = fixture.begin;
    const controller = createCoordinator(runtime, {
      draft,
      recovery: harness.recovery,
      async commitSession() {
        remoteCalls += 1;
        return { outcome: 'created' };
      }
    });
    await controller.finish();
    assertCoordinatorState(controller, {
      state: 'unknown',
      reason: fixture.reason,
      focus_target: null,
      intent_present: true
    });
    assert.equal(remoteCalls, 0);
    assert.equal(
      harness.calls.some(({ method }) => method === 'releaseCommit'),
      false
    );
    assert.equal(
      harness.calls.some(({ method }) => method === 'completeCommit'),
      false
    );
  }
});

test('S4.6 cleanup_pending obtains a new claim, replays identically and tombstones', async () => {
  const runtime = loadRuntime();
  const { controller: draft } = createValidStrengthDraft(runtime);
  const harness = createRecoveryHarness(draft);
  const remoteCalls = [];
  let completeCalls = 0;
  let clockReads = 0;
  harness.handlers.completeCommit = (candidate) => {
    completeCalls += 1;
    assert.deepEqual(plain(candidate), plain(harness.getIntent()));
    if (completeCalls === 1) {
      const error = new Error('raw storage fixture');
      error.code = 'STORAGE_ERROR';
      return Promise.reject(error);
    }
    harness.setIntent(null);
    return Promise.resolve({ state: 'destroyed' });
  };
  const controller = createCoordinator(runtime, {
    draft,
    recovery: harness.recovery,
    now() {
      clockReads += 1;
      return START_MS + 60000;
    },
    async commitSession(request) {
      remoteCalls.push(request);
      return {
        outcome: remoteCalls.length === 1 ? 'created' : 'replayed'
      };
    }
  });

  await controller.finish();
  assertCoordinatorState(controller, {
    state: 'cleanup_pending',
    reason: 'STORAGE_ERROR',
    focus_target: null,
    intent_present: true
  });
  const retry = controller.retry();
  assert.equal(controller.retry(), retry);
  await retry;
  assertCoordinatorState(controller, {
    state: 'committed',
    reason: null,
    focus_target: null,
    intent_present: false
  });
  assert.equal(clockReads, 1);
  assert.equal(remoteCalls.length, 2);
  assert.equal(remoteCalls[0].requestId, remoteCalls[1].requestId);
  assert.deepEqual(plain(remoteCalls[0].payload), plain(remoteCalls[1].payload));
  assert.equal(
    harness.calls.filter(({ method }) => method === 'prepareCommit').length,
    1
  );
  assert.equal(
    harness.calls.filter(({ method }) => method === 'beginCommitAttempt').length,
    2
  );
  assert.equal(completeCalls, 2);
});

test('S4.6 treats malformed release and completion confirmations as pending', async () => {
  {
    const runtime = loadRuntime();
    const { controller: draft } = createValidStrengthDraft(runtime);
    const harness = createRecoveryHarness(draft);
    harness.handlers.releaseCommit = () => Promise.resolve({ released: true });
    const controller = createCoordinator(runtime, {
      draft,
      recovery: harness.recovery,
      async commitSession() {
        throw makeRemoteError('AUTH_REQUIRED', 'not_committed');
      }
    });
    await controller.finish();
    assertCoordinatorState(controller, {
      state: 'release_pending',
      reason: 'STORAGE_ERROR',
      focus_target: null,
      intent_present: true
    });
  }

  {
    const runtime = loadRuntime();
    const { controller: draft } = createValidStrengthDraft(runtime);
    const harness = createRecoveryHarness(draft);
    harness.handlers.completeCommit = () =>
      Promise.resolve({ state: 'saved' });
    const controller = createCoordinator(runtime, {
      draft,
      recovery: harness.recovery
    });
    await controller.finish();
    assertCoordinatorState(controller, {
      state: 'cleanup_pending',
      reason: 'STORAGE_ERROR',
      focus_target: null,
      intent_present: true
    });
  }
});
