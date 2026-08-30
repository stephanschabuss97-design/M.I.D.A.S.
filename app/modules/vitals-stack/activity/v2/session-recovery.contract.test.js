'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const recoveryPath = path.join(__dirname, 'session-recovery.js');
const draftPath = path.join(__dirname, 'session-draft.js');
const semanticsPath = path.join(__dirname, 'semantics.js');
const semanticsV2Path = path.join(__dirname, 'semantics-v2.js');
const shellHarnessPath = path.join(__dirname, 'session-shell-harness.html');
const recoveryHarnessPath = path.join(__dirname, 'session-recovery-harness.html');
const cssPath = path.join(__dirname, 'session-shell.css');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const serviceWorkerPath = path.resolve(
  __dirname,
  '../../../../..',
  'service-worker.js'
);
const recoverySource = fs.readFileSync(recoveryPath, 'utf8');
const draftSource = fs.readFileSync(draftPath, 'utf8');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const semanticsV2Source = fs.readFileSync(semanticsV2Path, 'utf8');
const shellHarnessSource = fs.readFileSync(shellHarnessPath, 'utf8');
const recoveryHarnessSource = fs.readFileSync(recoveryHarnessPath, 'utf8');
const cssSource = fs.readFileSync(cssPath, 'utf8');
const SAFE_MESSAGE =
  'The activity session recovery operation could not be completed.';
const RECOVERY_SCHEMA = 'midas.activity-session-recovery.v1';
const RECOVERY_SCHEMA_V2 = 'midas.activity-session-recovery.v2';
const COMMIT_INTENT_SCHEMA = 'midas.activity-session-commit-intent.v1';
const COMMIT_ATTEMPT_SCHEMA = 'midas.activity-session-commit-attempt.v1';
const SLOT_KEY = 'active_session';
const UUIDS = [
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006'
];
const TIMES = [
  Date.UTC(2026, 7, 9, 8, 0, 0),
  Date.UTC(2026, 7, 9, 8, 0, 1),
  Date.UTC(2026, 7, 9, 8, 0, 2),
  Date.UTC(2026, 7, 9, 8, 0, 3)
];

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function cloneValue(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function freezeTree(value, seen = new WeakSet()) {
  if (
    value === null ||
    (typeof value !== 'object' && typeof value !== 'function') ||
    seen.has(value)
  ) {
    return value;
  }
  seen.add(value);
  Reflect.ownKeys(value).forEach((key) => freezeTree(value[key], seen));
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

async function assertRecoveryError(action, code) {
  let caught;
  try {
    await action();
  } catch (error) {
    caught = error;
  }
  assert.ok(caught, `expected recovery error ${code}`);
  assert.equal(caught.name, 'ActivityV2SessionRecoveryError');
  assert.equal(caught.code, code);
  assert.equal(caught.message, SAFE_MESSAGE);
}

function nextTurn() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function settleTurns(count = 3) {
  for (let index = 0; index < count; index += 1) await nextTurn();
}

function createFakeIndexedDb(initialRecord) {
  const state = {
    record: cloneValue(initialRecord),
    databaseExists: initialRecord !== undefined,
    storeExists: initialRecord !== undefined,
    openCalls: [],
    transactionModes: [],
    transactionCount: 0,
    activeReadwrites: 0,
    maxActiveReadwrites: 0,
    closedConnections: 0,
    connections: new Set(),
    pendingCommits: [],
    holdCommits: false,
    openErrorCount: 0,
    throwOpenCount: 0,
    blockedCount: 0,
    lateSuccessAfterBlocked: false,
    failNextRequest: false,
    abortNextTransaction: false,
    throwNextTransaction: false
  };

  function createTransaction(mode) {
    if (state.throwNextTransaction) {
      state.throwNextTransaction = false;
      throw new Error('transaction detail');
    }
    state.transactionCount += 1;
    state.transactionModes.push(mode);
    if (mode === 'readwrite') {
      state.activeReadwrites += 1;
      state.maxActiveReadwrites = Math.max(
        state.maxActiveReadwrites,
        state.activeReadwrites
      );
    }
    let active = true;
    let pending = 0;
    let completionQueued = false;
    let stagedRecord;
    let hasStagedRecord = false;

    const transaction = {
      oncomplete: null,
      onerror: null,
      onabort: null,
      objectStore(name) {
        if (name !== 'session_recovery' || !state.storeExists) {
          throw new Error('store detail');
        }
        return {
          get(key) {
            assert.equal(key, SLOT_KEY);
            return queueRequest(() => cloneValue(state.record));
          },
          put(record) {
            return queueRequest(() => {
              stagedRecord = cloneValue(record);
              hasStagedRecord = true;
              return record.slot_key;
            });
          }
        };
      },
      abort() {
        if (!active) return;
        active = false;
        finishReadwrite();
        queueMicrotask(() => transaction.onabort?.({ target: transaction }));
      }
    };

    function finishReadwrite() {
      if (mode === 'readwrite' && state.activeReadwrites > 0) {
        state.activeReadwrites -= 1;
      }
    }

    function commit() {
      if (!active) return;
      if (state.abortNextTransaction) {
        state.abortNextTransaction = false;
        transaction.abort();
        return;
      }
      active = false;
      if (hasStagedRecord) state.record = cloneValue(stagedRecord);
      finishReadwrite();
      transaction.oncomplete?.({ target: transaction });
    }

    function scheduleCompletion() {
      if (!active || pending !== 0 || completionQueued) return;
      completionQueued = true;
      queueMicrotask(() => {
        completionQueued = false;
        if (!active || pending !== 0) return;
        if (state.holdCommits) {
          state.pendingCommits.push(commit);
        } else {
          commit();
        }
      });
    }

    function queueRequest(readResult) {
      const request = { onsuccess: null, onerror: null, result: undefined };
      pending += 1;
      queueMicrotask(() => {
        if (!active) return;
        if (state.failNextRequest) {
          state.failNextRequest = false;
          request.onerror?.({ target: request });
          if (active) transaction.abort();
          return;
        }
        request.result = readResult();
        request.onsuccess?.({ target: request });
        pending -= 1;
        scheduleCompletion();
      });
      return request;
    }

    return transaction;
  }

  function createDatabase() {
    const database = {
      onversionchange: null,
      objectStoreNames: {
        contains(name) {
          return name === 'session_recovery' && state.storeExists;
        }
      },
      createObjectStore(name, options) {
        assert.equal(name, 'session_recovery');
        assert.equal(options.keyPath, 'slot_key');
        assert.deepEqual(Object.keys(options), ['keyPath']);
        state.storeExists = true;
        return {};
      },
      transaction(name, mode) {
        if (!state.connections.has(database)) throw new Error('closed detail');
        assert.equal(name, 'session_recovery');
        return createTransaction(mode);
      },
      close() {
        if (!state.connections.delete(database)) return;
        state.closedConnections += 1;
      }
    };
    state.connections.add(database);
    return database;
  }

  const indexedDB = {
    open(name, version) {
      state.openCalls.push([name, version]);
      if (state.throwOpenCount > 0) {
        state.throwOpenCount -= 1;
        throw new Error('synchronous open detail');
      }
      const request = {
        result: null,
        transaction: null,
        onupgradeneeded: null,
        onblocked: null,
        onerror: null,
        onsuccess: null
      };
      queueMicrotask(() => {
        if (state.openErrorCount > 0) {
          state.openErrorCount -= 1;
          request.onerror?.({ target: request });
          return;
        }
        if (state.blockedCount > 0) {
          state.blockedCount -= 1;
          request.onblocked?.({ target: request });
          if (!state.lateSuccessAfterBlocked) return;
          queueMicrotask(() => {
            request.result = createDatabase();
            request.onsuccess?.({ target: request });
          });
          return;
        }
        const database = createDatabase();
        request.result = database;
        if (!state.databaseExists) {
          state.databaseExists = true;
          let upgradeAborted = false;
          request.transaction = {
            abort() {
              upgradeAborted = true;
            }
          };
          request.onupgradeneeded?.({ target: request });
          if (upgradeAborted) {
            request.onerror?.({ target: request });
            database.close();
            return;
          }
        }
        request.onsuccess?.({ target: request });
      });
      return request;
    }
  };

  const control = {
    state,
    getRecord: () => cloneValue(state.record),
    setRecord(value) {
      state.record = cloneValue(value);
      state.databaseExists = true;
      state.storeExists = true;
    },
    releaseCommit() {
      const commit = state.pendingCommits.shift();
      if (commit) commit();
    },
    triggerVersionchange() {
      [...state.connections].forEach((database) =>
        database.onversionchange?.({ target: database })
      );
    }
  };
  return { indexedDB, control };
}

function loadRuntime({ contextValues = {}, includeSemanticsV2 = true } = {}) {
  const activityV1 = { marker: 'activity-v1' };
  const context = vm.createContext({
    AppModules: { activity: activityV1, activityV2: {} },
    queueMicrotask,
    setTimeout,
    clearTimeout,
    ...contextValues
  });
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  if (includeSemanticsV2) {
    vm.runInContext(semanticsV2Source, context, { filename: semanticsV2Path });
  }
  vm.runInContext(draftSource, context, { filename: draftPath });
  vm.runInContext(recoverySource, context, { filename: recoveryPath });
  return {
    context,
    activityV1,
    semantics: context.AppModules.activityV2.semantics,
    semanticsV2: context.AppModules.activityV2.semanticsV2,
    draftApi: context.AppModules.activityV2.sessionDraft,
    recoveryApi: context.AppModules.activityV2.sessionRecovery
  };
}

function loadRuntimeWithSnapshotFault() {
  const activityV1 = { marker: 'activity-v1' };
  const context = vm.createContext({
    AppModules: { activity: activityV1, activityV2: {} },
    queueMicrotask,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  vm.runInContext(semanticsV2Source, context, { filename: semanticsV2Path });
  vm.runInContext(draftSource, context, { filename: draftPath });
  const semantics = context.AppModules.activityV2.semantics;
  const semanticsV2 = context.AppModules.activityV2.semanticsV2;
  const draftApi = context.AppModules.activityV2.sessionDraft;
  let readsBeforeThrow = null;

  function wrapDraft(draft) {
    const wrapped = {};
    Object.keys(draft).forEach((key) => {
      wrapped[key] = key === 'getSnapshot'
        ? () => {
            if (readsBeforeThrow === 0) throw new Error('snapshot read fault');
            if (readsBeforeThrow !== null) readsBeforeThrow -= 1;
            return draft.getSnapshot();
          }
        : draft[key];
    });
    return Object.freeze(wrapped);
  }

  const faultingDraftApi = Object.freeze({
    create: (options) => wrapDraft(draftApi.create(options)),
    restore: (options) => wrapDraft(draftApi.restore(options))
  });
  context.AppModules.activityV2 = {
    semantics,
    semanticsV2,
    sessionDraft: faultingDraftApi
  };
  vm.runInContext(recoverySource, context, { filename: recoveryPath });
  return {
    context,
    activityV1,
    semantics,
    semanticsV2,
    draftApi: faultingDraftApi,
    recoveryApi: context.AppModules.activityV2.sessionRecovery,
    fault: {
      arm(reads) {
        readsBeforeThrow = reads;
      }
    }
  };
}

function createDraft(runtime, {
  requestId = UUIDS[0],
  now = TIMES[0],
  note = null
} = {}) {
  const draft = runtime.draftApi.create({
    semantics: runtime.semantics,
    now: () => now,
    createRequestId: () => requestId
  });
  const firstActive = runtime.semantics
    .getCatalog()
    .entries.find((entry) => entry.status === 'active');
  draft.addItem(firstActive.key);
  if (note !== null) draft.setNote(note);
  return draft;
}

function activeRecord(snapshot, {
  generation = 0,
  sequence = 1,
  leaseToken = UUIDS[1],
  savedAt = new Date(TIMES[1]).toISOString()
} = {}) {
  return {
    slot_key: SLOT_KEY,
    recovery_schema_version: RECOVERY_SCHEMA,
    slot_generation: generation,
    write_sequence: sequence,
    lease_token: leaseToken,
    request_id: snapshot.request_id,
    persisted_revision: snapshot.revision,
    saved_at: savedAt,
    draft: plain(snapshot)
  };
}

function tombstone({ generation = 1, leaseToken = UUIDS[2] } = {}) {
  return {
    slot_key: SLOT_KEY,
    recovery_schema_version: RECOVERY_SCHEMA,
    slot_generation: generation,
    write_sequence: 0,
    lease_token: leaseToken,
    request_id: null,
    persisted_revision: null,
    saved_at: null,
    draft: null
  };
}

function v2ActiveRecord(snapshot, {
  intent = null,
  attempt = null,
  ...recordOptions
} = {}) {
  const record = activeRecord(snapshot, recordOptions);
  record.recovery_schema_version = RECOVERY_SCHEMA_V2;
  record.commit_intent = intent;
  record.commit_attempt = attempt;
  return record;
}

function v2Tombstone({ generation = 1, leaseToken = UUIDS[2] } = {}) {
  return {
    ...tombstone({ generation, leaseToken }),
    recovery_schema_version: RECOVERY_SCHEMA_V2,
    commit_intent: null,
    commit_attempt: null
  };
}

function numeric(value) {
  return value === null ? null : Number(String(value).replace(',', '.'));
}

function integer(value) {
  return value === null ? null : Number.parseInt(value, 10);
}

function commitIntent(snapshot, {
  preparedAt = new Date(TIMES[2]).toISOString()
} = {}) {
  const elapsed = Date.parse(preparedAt) - Date.parse(snapshot.started_at);
  return {
    commit_intent_schema_version: COMMIT_INTENT_SCHEMA,
    request_id: snapshot.request_id,
    draft_revision: snapshot.revision,
    catalog_version: snapshot.catalog_version,
    prepared_at: preparedAt,
    payload: {
      schema_version: 'midas.activity-session.v1',
      catalog_version: snapshot.catalog_version,
      started_at: snapshot.started_at,
      ended_at: preparedAt,
      duration_min: Math.max(1, Math.round(elapsed / 60000)),
      title: null,
      note: snapshot.note,
      items: snapshot.items.map((item, itemIndex) => ({
        item_key: item.item_key,
        item_order: itemIndex + 1,
        duration_min: integer(item.duration_min),
        distance_km: numeric(item.distance_km),
        note: item.note,
        sets: item.sets.map((set, setIndex) => ({
          set_order: setIndex + 1,
          reps: integer(set.reps),
          duration_sec: integer(set.duration_sec),
          distance_m: numeric(set.distance_m),
          weight_kg: numeric(set.weight_kg),
          assistance_kg: numeric(set.assistance_kg)
        }))
      }))
    }
  };
}

function commitAttempt(number, token) {
  return {
    commit_attempt_schema_version: COMMIT_ATTEMPT_SCHEMA,
    attempt_number: number,
    attempt_token: token
  };
}

test('classic-script recovery namespace is exact, immutable and resolves only catalog 1 or 2', () => {
  const runtime = loadRuntime();
  const { recoveryApi, context, activityV1 } = runtime;

  assert.deepEqual(Object.keys(recoveryApi), [
    'resolveSemantics',
    'createIndexedDbStore',
    'open'
  ]);
  assertFrozenTree(recoveryApi);
  assert.equal(recoveryApi.resolveSemantics(1), runtime.semantics);
  assert.equal(recoveryApi.resolveSemantics(2), runtime.semanticsV2);
  assert.equal(recoveryApi.resolveSemantics(3), null);
  assert.equal(context.AppModules.activity, activityV1);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(context.AppModules.activityV2, 'sessionRecovery'),
    {
      value: recoveryApi,
      enumerable: true,
      writable: false,
      configurable: false
    }
  );
  [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '1'].forEach((version) => {
    assert.throws(
      () => recoveryApi.resolveSemantics(version),
      (error) => error.code === 'INVALID_CATALOG_VERSION'
    );
  });
  assert.throws(
    () => vm.runInContext(recoverySource, context, { filename: recoveryPath }),
    /already registered/
  );
});

test('IndexedDB factory has fixed database, store, key and protected missing observation', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: fake.indexedDB
  });

  assert.deepEqual(Object.keys(store), ['read', 'save', 'discard', 'close']);
  assertFrozenTree(store);
  const observation = await store.read();
  assert.deepEqual(plain(observation), { kind: 'missing', value: null });
  assertFrozenTree(observation);
  assert.deepEqual(fake.control.state.openCalls, [
    ['midas_activity_v2_recovery', 1]
  ]);
  assert.equal(fake.control.state.storeExists, true);
  assert.deepEqual(fake.control.state.transactionModes, ['readonly']);

  await assertRecoveryError(
    () => runtime.recoveryApi.createIndexedDbStore(null),
    'INVALID_OPTIONS'
  );
  await assertRecoveryError(
    () => runtime.recoveryApi.createIndexedDbStore({ indexedDB: {} }),
    'INDEXED_DB_UNAVAILABLE'
  );
  await assertRecoveryError(
    () => runtime.recoveryApi.createIndexedDbStore({
      indexedDB: fake.indexedDB,
      name: 'other'
    }),
    'INVALID_OPTIONS'
  );
});

test('save writes the exact active envelope and resolves only after transaction commit', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: fake.indexedDB
  });
  const observation = await store.read();
  const draft = createDraft(runtime).getSnapshot();
  const savedAt = new Date(TIMES[1]).toISOString();
  fake.control.state.holdCommits = true;

  let settled = false;
  const savePromise = store.save({
    observation,
    draft,
    savedAt,
    leaseToken: UUIDS[1]
  }).then((value) => {
    settled = true;
    return value;
  });
  await settleTurns();
  assert.equal(settled, false);
  assert.equal(fake.control.getRecord(), undefined);
  assert.equal(fake.control.state.pendingCommits.length, 1);

  fake.control.releaseCommit();
  const savedObservation = await savePromise;
  const expected = activeRecord(draft, {
    leaseToken: UUIDS[1],
    savedAt
  });
  assert.deepEqual(fake.control.getRecord(), expected);
  assert.deepEqual(plain(savedObservation), {
    kind: 'record',
    value: expected
  });
  assertFrozenTree(savedObservation);
  assert.equal(fake.control.state.transactionModes.at(-1), 'readwrite');
});

test('successive save retains token, increments sequence and enforces request and revision CAS', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: fake.indexedDB
  });
  const missing = await store.read();
  const raw = createDraft(runtime);
  const first = raw.getSnapshot();
  const firstObservation = await store.save({
    observation: missing,
    draft: first,
    savedAt: new Date(TIMES[1]).toISOString(),
    leaseToken: UUIDS[1]
  });
  const second = raw.setNote('synthetic second revision');
  const secondObservation = await store.save({
    observation: firstObservation,
    draft: second,
    savedAt: new Date(TIMES[2]).toISOString(),
    leaseToken: UUIDS[1]
  });

  assert.equal(secondObservation.value.slot_generation, 0);
  assert.equal(secondObservation.value.write_sequence, 2);
  assert.equal(secondObservation.value.lease_token, UUIDS[1]);
  assert.equal(secondObservation.value.persisted_revision, second.revision);
  assert.equal(secondObservation.value.draft.note, 'synthetic second revision');

  const wrongRequest = plain(second);
  wrongRequest.request_id = UUIDS[3];
  wrongRequest.revision += 1;
  await assertRecoveryError(
    () => store.save({
      observation: secondObservation,
      draft: wrongRequest,
      savedAt: new Date(TIMES[3]).toISOString(),
      leaseToken: UUIDS[1]
    }),
    'CONFLICT'
  );
  await assertRecoveryError(
    () => store.save({
      observation: secondObservation,
      draft: second,
      savedAt: new Date(TIMES[3]).toISOString(),
      leaseToken: UUIDS[1]
    }),
    'CONFLICT'
  );
});

test('different fresh requests and same-request forks lose on complete observation mismatch', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const firstStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const secondStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const [firstMissing, secondMissing] = await Promise.all([
    firstStore.read(),
    secondStore.read()
  ]);
  const firstDraft = createDraft(runtime, { requestId: UUIDS[0] }).getSnapshot();
  const secondDraft = createDraft(runtime, { requestId: UUIDS[3] }).getSnapshot();
  await firstStore.save({
    observation: firstMissing,
    draft: firstDraft,
    savedAt: new Date(TIMES[1]).toISOString(),
    leaseToken: UUIDS[1]
  });
  await assertRecoveryError(
    () => secondStore.save({
      observation: secondMissing,
      draft: secondDraft,
      savedAt: new Date(TIMES[1]).toISOString(),
      leaseToken: UUIDS[4]
    }),
    'CONFLICT'
  );
  assert.equal(fake.control.getRecord().request_id, UUIDS[0]);

  const forkStoreA = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const forkStoreB = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const [forkObservationA, forkObservationB] = await Promise.all([
    forkStoreA.read(),
    forkStoreB.read()
  ]);
  const forkA = runtime.draftApi.restore(plain(firstDraft), {
    semantics: runtime.semantics,
    createRequestId: () => UUIDS[5]
  });
  const forkB = runtime.draftApi.restore(plain(firstDraft), {
    semantics: runtime.semantics,
    createRequestId: () => UUIDS[5]
  });
  const nextA = forkA.setNote('fork A');
  const nextB = forkB.setNote('fork B');
  await forkStoreA.save({
    observation: forkObservationA,
    draft: nextA,
    savedAt: new Date(TIMES[2]).toISOString(),
    leaseToken: UUIDS[1]
  });
  await assertRecoveryError(
    () => forkStoreB.save({
      observation: forkObservationB,
      draft: nextB,
      savedAt: new Date(TIMES[3]).toISOString(),
      leaseToken: UUIDS[1]
    }),
    'CONFLICT'
  );
  assert.equal(fake.control.getRecord().draft.note, 'fork A');
});

test('discard commits a rotated generation tombstone and permanently fences stale observations', async () => {
  const runtime = loadRuntime();
  const initialDraft = createDraft(runtime).getSnapshot();
  const fake = createFakeIndexedDb(activeRecord(initialDraft, {
    generation: 4,
    sequence: 9,
    leaseToken: UUIDS[1]
  }));
  const discardStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const staleStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const [discardObservation, staleObservation] = await Promise.all([
    discardStore.read(),
    staleStore.read()
  ]);
  const staleDraft = runtime.draftApi.restore(plain(initialDraft), {
    semantics: runtime.semantics,
    createRequestId: () => UUIDS[5]
  }).setNote('stale branch');

  const tombstoneObservation = await discardStore.discard({
    observation: discardObservation,
    leaseToken: UUIDS[2]
  });
  assert.deepEqual(plain(tombstoneObservation.value), tombstone({
    generation: 5,
    leaseToken: UUIDS[2]
  }));
  assert.deepEqual(fake.control.getRecord(), tombstone({
    generation: 5,
    leaseToken: UUIDS[2]
  }));
  await assertRecoveryError(
    () => staleStore.save({
      observation: staleObservation,
      draft: staleDraft,
      savedAt: new Date(TIMES[2]).toISOString(),
      leaseToken: UUIDS[1]
    }),
    'CONFLICT'
  );
  assert.deepEqual(fake.control.getRecord(), tombstone({
    generation: 5,
    leaseToken: UUIDS[2]
  }));
});

test('unknown and ambiguous records are quarantined while declared v1 corruption remains CAS-discardable', async () => {
  const runtime = loadRuntime();
  const corrupt = {
    slot_key: SLOT_KEY,
    recovery_schema_version: 'future.schema.v9',
    slot_generation: 'broken',
    nested: { neutral: ['fixture'] }
  };
  const fake = createFakeIndexedDb(corrupt);
  const firstStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  await assertRecoveryError(
    async () => firstStore.discard({
      observation: await firstStore.read(),
      leaseToken: UUIDS[2]
    }),
    'UNSAFE_DISCARD'
  );
  assert.deepEqual(fake.control.getRecord(), corrupt);

  const validGenerationCorrupt = {
    slot_key: SLOT_KEY,
    recovery_schema_version: RECOVERY_SCHEMA,
    slot_generation: 7,
    write_sequence: 'broken'
  };
  fake.control.setRecord(validGenerationCorrupt);
  const thirdStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const thirdObservation = await thirdStore.read();
  const repaired = await thirdStore.discard({
    observation: thirdObservation,
    leaseToken: UUIDS[4]
  });
  assert.equal(repaired.value.slot_generation, 8);
  assert.equal(repaired.value.lease_token, UUIDS[4]);

  const malformedV2 = v2ActiveRecord(createDraft(runtime).getSnapshot());
  malformedV2.commit_attempt = commitAttempt(1, UUIDS[5]);
  fake.control.setRecord(malformedV2);
  const v2Store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const v2Observation = await v2Store.read();
  await assertRecoveryError(
    () => v2Store.discard({
      observation: v2Observation,
      leaseToken: UUIDS[0],
      recoverySchemaVersion: RECOVERY_SCHEMA_V2,
      commitIntent: null,
      commitAttempt: null
    }),
    'UNSAFE_DISCARD'
  );
  assert.deepEqual(fake.control.getRecord(), malformedV2);
});

test('blocked open, abort, versionchange and non-JSON values fail without confirmed success', async () => {
  const runtime = loadRuntime();

  const synchronous = createFakeIndexedDb();
  synchronous.control.state.throwOpenCount = 1;
  const synchronousStore = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: synchronous.indexedDB
  });
  await assertRecoveryError(() => synchronousStore.read(), 'STORAGE_ERROR');
  assert.deepEqual(plain(await synchronousStore.read()), {
    kind: 'missing',
    value: null
  });
  assert.equal(synchronous.control.state.openCalls.length, 2);

  const blocked = createFakeIndexedDb();
  blocked.control.state.blockedCount = 1;
  blocked.control.state.lateSuccessAfterBlocked = true;
  const blockedStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: blocked.indexedDB });
  await assertRecoveryError(() => blockedStore.read(), 'STORAGE_ERROR');
  await settleTurns();
  assert.equal(blocked.control.state.closedConnections, 1);

  const aborting = createFakeIndexedDb();
  const abortStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: aborting.indexedDB });
  const missing = await abortStore.read();
  const draft = createDraft(runtime).getSnapshot();
  aborting.control.state.abortNextTransaction = true;
  await assertRecoveryError(
    () => abortStore.save({
      observation: missing,
      draft,
      savedAt: new Date(TIMES[1]).toISOString(),
      leaseToken: UUIDS[1]
    }),
    'STORAGE_ERROR'
  );
  assert.equal(aborting.control.getRecord(), undefined);

  const versioned = createFakeIndexedDb();
  const versionStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: versioned.indexedDB });
  const versionMissing = await versionStore.read();
  versioned.control.state.holdCommits = true;
  const versionSave = versionStore.save({
    observation: versionMissing,
    draft,
    savedAt: new Date(TIMES[1]).toISOString(),
    leaseToken: UUIDS[1]
  });
  await settleTurns();
  versioned.control.triggerVersionchange();
  versioned.control.releaseCommit();
  await assertRecoveryError(() => versionSave, 'STORAGE_ERROR');

  const nonJson = createFakeIndexedDb(new Date(TIMES[0]));
  const nonJsonStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: nonJson.indexedDB });
  await assertRecoveryError(() => nonJsonStore.read(), 'STORAGE_ERROR');
});

test('generation and sequence overflow, repeated token and close all fail closed', async () => {
  const runtime = loadRuntime();
  const draftController = createDraft(runtime);
  const draft = draftController.getSnapshot();
  const sequenceMax = activeRecord(draft, {
    sequence: Number.MAX_SAFE_INTEGER,
    leaseToken: UUIDS[1]
  });
  const sequenceFake = createFakeIndexedDb(sequenceMax);
  const sequenceStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: sequenceFake.indexedDB });
  const sequenceObservation = await sequenceStore.read();
  const nextDraft = draftController.setNote('overflow fixture');
  await assertRecoveryError(
    () => sequenceStore.save({
      observation: sequenceObservation,
      draft: nextDraft,
      savedAt: new Date(TIMES[2]).toISOString(),
      leaseToken: UUIDS[1]
    }),
    'STORAGE_ERROR'
  );
  assert.deepEqual(sequenceFake.control.getRecord(), sequenceMax);

  const generationMax = activeRecord(draft, {
    generation: Number.MAX_SAFE_INTEGER,
    leaseToken: UUIDS[1]
  });
  const generationFake = createFakeIndexedDb(generationMax);
  const generationStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: generationFake.indexedDB });
  const generationObservation = await generationStore.read();
  await assertRecoveryError(
    () => generationStore.discard({
      observation: generationObservation,
      leaseToken: UUIDS[2]
    }),
    'STORAGE_ERROR'
  );

  const repeatedTokenFake = createFakeIndexedDb(activeRecord(draft, {
    generation: 5,
    leaseToken: UUIDS[1]
  }));
  const repeatedTokenStore = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: repeatedTokenFake.indexedDB
  });
  const repeatedTokenObservation = await repeatedTokenStore.read();
  await assertRecoveryError(
    () => repeatedTokenStore.discard({
      observation: repeatedTokenObservation,
      leaseToken: UUIDS[1]
    }),
    'INVALID_LEASE_TOKEN'
  );
  generationStore.close();
  generationStore.close();
  await assertRecoveryError(() => generationStore.read(), 'STORAGE_ERROR');
  assert.deepEqual(generationFake.control.getRecord(), generationMax);
});

function createManualScheduler({ throwOnEnqueue = false } = {}) {
  const callbacks = [];
  return {
    callbacks,
    enqueue(callback) {
      if (throwOnEnqueue) throw new Error('scheduler detail');
      callbacks.push(callback);
    },
    runNext() {
      const callback = callbacks.shift();
      if (callback) callback();
    },
    runAll() {
      while (callbacks.length > 0) callbacks.shift()();
    }
  };
}

function createEventHub() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type) {
      [...(listeners.get(type) || [])].forEach((listener) => listener({ type }));
    },
    count(type) {
      return listeners.get(type)?.size || 0;
    }
  };
}

function createOpenOptions(runtime, store, {
  scheduler = createManualScheduler(),
  requestIds = [UUIDS[0]],
  leaseTokens = [UUIDS[1], UUIDS[2], UUIDS[3]],
  times = [TIMES[1], TIMES[2], TIMES[3]],
  resolver = runtime.recoveryApi.resolveSemantics
} = {}) {
  let requestIndex = 0;
  let leaseIndex = 0;
  let timeIndex = 0;
  const reads = { request: 0, lease: 0, time: 0 };
  return {
    scheduler,
    reads,
    options: {
      storage: store,
      semantics: runtime.semantics,
      resolveSemantics: resolver,
      now: () => {
        reads.time += 1;
        return times[Math.min(timeIndex++, times.length - 1)];
      },
      createRequestId: () => {
        reads.request += 1;
        return requestIds[Math.min(requestIndex++, requestIds.length - 1)];
      },
      createLeaseToken: () => {
        reads.lease += 1;
        return leaseTokens[Math.min(leaseIndex++, leaseTokens.length - 1)];
      },
      enqueue: scheduler.enqueue
    }
  };
}

async function waitForState(controller, expected, turns = 20) {
  for (let index = 0; index < turns; index += 1) {
    if (controller.getState().state === expected) return controller.getState();
    await nextTurn();
  }
  assert.equal(controller.getState().state, expected);
  return controller.getState();
}

test('open missing exposes exact controller state and pristine managed draft without persistence', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);

  assert.deepEqual(Object.keys(controller), [
    'getState',
    'getDraft',
    'startNew',
    'continueSession',
    'flush',
    'discard',
    'subscribe',
    'destroy',
    'getCommitIntent',
    'prepareCommit',
    'beginCommitAttempt',
    'releaseCommit',
    'completeCommit'
  ]);
  assertFrozenTree(controller);
  assert.deepEqual(plain(controller.getState()), {
    state: 'empty',
    started_at: null,
    saved_at: null,
    item_count: 0,
    reason: null
  });
  assert.deepEqual(Object.keys(controller.getState()), [
    'state',
    'started_at',
    'saved_at',
    'item_count',
    'reason'
  ]);
  assertFrozenTree(controller.getState());
  assert.equal(controller.getDraft(), null);
  assert.deepEqual(setup.reads, { request: 0, lease: 0, time: 0 });

  const states = [];
  const unsubscribe = controller.subscribe((state) => states.push(state.state));
  const managed = controller.startNew();
  assert.equal(controller.getDraft(), managed);
  assert.deepEqual(Object.keys(managed), [
    'getSnapshot',
    'getTimerSnapshot',
    'addItem',
    'removeItem',
    'moveItem',
    'setNote',
    'discard',
    'addSet',
    'removeSet',
    'setSetField',
    'setItemField'
  ]);
  assertFrozenTree(managed);
  assert.equal(managed.getSnapshot().revision, 0);
  assert.equal(controller.getState().state, 'active');
  assert.deepEqual(setup.reads, { request: 1, lease: 0, time: 0 });
  assert.equal(setup.scheduler.callbacks.length, 0);
  assert.equal(fake.control.getRecord(), undefined);
  await assertRecoveryError(() => managed.discard(), 'PERSISTENT_DISCARD_REQUIRED');
  assert.equal(managed.getSnapshot().revision, 0);
  unsubscribe();
  unsubscribe();
  assert.deepEqual(states, ['empty', 'active']);
});

test('real mutations enqueue once, canonical no-ops enqueue nothing and save the latest state', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.startNew();

  const first = draft.setNote('synthetic autosave');
  assert.equal(first.revision, 1);
  assert.equal(controller.getState().state, 'saving');
  assert.equal(setup.scheduler.callbacks.length, 1);
  assert.equal(draft.setNote('synthetic autosave'), first);
  assert.equal(setup.scheduler.callbacks.length, 1);
  assert.throws(() => draft.addItem('Bad Key'));
  assert.equal(setup.scheduler.callbacks.length, 1);

  setup.scheduler.runNext();
  await waitForState(controller, 'saved');
  assert.equal(fake.control.getRecord().draft.note, 'synthetic autosave');
  assert.equal(fake.control.getRecord().persisted_revision, 1);
  assert.equal(fake.control.getRecord().write_sequence, 1);
  assert.equal(fake.control.getRecord().recovery_schema_version, RECOVERY_SCHEMA_V2);
  assert.equal(fake.control.getRecord().commit_intent, null);
  assert.equal(fake.control.getRecord().commit_attempt, null);
  assert.deepEqual(setup.reads, { request: 1, lease: 1, time: 1 });

  const second = draft.setNote('synthetic autosave 2');
  assert.equal(second.revision, 2);
  setup.scheduler.runNext();
  await waitForState(controller, 'saved');
  assert.equal(fake.control.getRecord().draft.note, 'synthetic autosave 2');
  assert.equal(fake.control.getRecord().write_sequence, 2);
  assert.equal(setup.reads.lease, 1);
});

test('one active write coalesces intermediate snapshots and saved appears only after latest commit', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.startNew();
  const states = [];
  controller.subscribe((state) => states.push(state.state));
  fake.control.state.holdCommits = true;

  draft.setNote('revision one');
  setup.scheduler.runNext();
  await settleTurns();
  assert.equal(fake.control.state.pendingCommits.length, 1);
  draft.setNote('revision two');
  const latest = draft.setNote('revision three');
  assert.equal(setup.scheduler.callbacks.length, 0);
  assert.equal(controller.getState().state, 'saving');

  fake.control.releaseCommit();
  await settleTurns();
  assert.equal(fake.control.getRecord().draft.note, 'revision one');
  assert.equal(controller.getState().state, 'saving');
  assert.equal(fake.control.state.pendingCommits.length, 1);
  assert.notEqual(states.at(-1), 'saved');

  fake.control.releaseCommit();
  await waitForState(controller, 'saved');
  assert.equal(fake.control.getRecord().draft.note, 'revision three');
  assert.equal(fake.control.getRecord().persisted_revision, latest.revision);
  assert.equal(fake.control.getRecord().write_sequence, 2);
  assert.equal(fake.control.state.maxActiveReadwrites, 1);
  assert.equal(states.at(-1), 'saved');
});

test('valid active envelope stays recoverable until explicit continue and preserves the stored draft', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime, { note: 'stored fixture' }).getSnapshot();
  const savedAt = new Date(TIMES[2]).toISOString();
  const fake = createFakeIndexedDb(activeRecord(source, {
    generation: 3,
    sequence: 4,
    leaseToken: UUIDS[1],
    savedAt
  }));
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, { requestIds: [UUIDS[5]] });
  const controller = await runtime.recoveryApi.open(setup.options);

  assert.deepEqual(plain(controller.getState()), {
    state: 'recoverable',
    started_at: source.started_at,
    saved_at: savedAt,
    item_count: source.items.length,
    reason: null
  });
  assert.equal(controller.getDraft(), null);
  assert.deepEqual(setup.reads, { request: 0, lease: 0, time: 0 });
  await assertRecoveryError(() => controller.startNew(), 'INVALID_STATE');

  const managed = controller.continueSession();
  assert.equal(controller.getDraft(), managed);
  assert.equal(controller.getState().state, 'saved');
  assert.deepEqual(plain(managed.getSnapshot()), plain(source));
  assert.equal(managed.getSnapshot().request_id, source.request_id);
  assert.equal(managed.getSnapshot().revision, source.revision);
  assert.equal(setup.scheduler.callbacks.length, 0);
  assert.deepEqual(fake.control.getRecord(), activeRecord(source, {
    generation: 3,
    sequence: 4,
    leaseToken: UUIDS[1],
    savedAt
  }));
});

test('tombstone opens empty, retains its lease on first save and catalog v2 restores exactly', async () => {
  const runtime = loadRuntime();
  const tombstoneFake = createFakeIndexedDb(tombstone({
    generation: 5,
    leaseToken: UUIDS[2]
  }));
  const tombstoneStore = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: tombstoneFake.indexedDB
  });
  const tombstoneSetup = createOpenOptions(runtime, tombstoneStore, {
    requestIds: [UUIDS[3]],
    leaseTokens: [UUIDS[4]]
  });
  const empty = await runtime.recoveryApi.open(tombstoneSetup.options);
  assert.equal(empty.getState().state, 'empty');
  const newDraft = empty.startNew();
  newDraft.setNote('new branch after tombstone');
  tombstoneSetup.scheduler.runNext();
  await waitForState(empty, 'saved');
  const saved = tombstoneFake.control.getRecord();
  assert.equal(saved.slot_generation, 5);
  assert.equal(saved.write_sequence, 1);
  assert.equal(saved.lease_token, UUIDS[2]);
  assert.equal(saved.request_id, UUIDS[3]);
  assert.equal(saved.recovery_schema_version, RECOVERY_SCHEMA_V2);
  assert.equal(saved.commit_intent, null);
  assert.equal(saved.commit_attempt, null);
  assert.equal(tombstoneSetup.reads.lease, 0);

  const v2Controller = runtime.draftApi.create({
    semantics: runtime.semanticsV2,
    now: () => TIMES[0],
    createRequestId: () => UUIDS[0]
  });
  const v2Entry = runtime.semanticsV2
    .getCatalog()
    .entries.find((entry) => entry.status === 'active');
  const v2Snapshot = v2Controller.addItem(v2Entry.key);
  const v2Fake = createFakeIndexedDb(activeRecord(v2Snapshot, {
    leaseToken: UUIDS[1]
  }));
  const v2Store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: v2Fake.indexedDB });
  const v2Setup = createOpenOptions(runtime, v2Store);
  const v2Recovery = await runtime.recoveryApi.open(v2Setup.options);
  assert.equal(v2Recovery.getState().state, 'recoverable');
  assert.equal(
    v2Recovery.continueSession().getSnapshot().catalog_version,
    2
  );
});

test('v2 store writes exact ordered metadata and rejects attempt-without-intent', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const observation = await store.read();
  const snapshot = createDraft(runtime).getSnapshot();
  const savedAt = new Date(TIMES[1]).toISOString();

  const result = await store.save({
    observation,
    draft: snapshot,
    savedAt,
    leaseToken: UUIDS[1],
    recoverySchemaVersion: RECOVERY_SCHEMA_V2,
    commitIntent: null,
    commitAttempt: null
  });
  assert.deepEqual(Reflect.ownKeys(result.value), [
    'slot_key',
    'recovery_schema_version',
    'slot_generation',
    'write_sequence',
    'lease_token',
    'request_id',
    'persisted_revision',
    'saved_at',
    'draft',
    'commit_intent',
    'commit_attempt'
  ]);
  assert.deepEqual(plain(result.value), v2ActiveRecord(snapshot, {
    savedAt,
    leaseToken: UUIDS[1]
  }));

  await assertRecoveryError(
    () => store.save({
      observation: result,
      draft: snapshot,
      savedAt,
      leaseToken: UUIDS[1],
      recoverySchemaVersion: RECOVERY_SCHEMA_V2,
      commitIntent: null,
      commitAttempt: commitAttempt(1, UUIDS[3])
    }),
    'INVALID_COMMIT_ATTEMPT'
  );

  const tombstoneFake = createFakeIndexedDb(v2Tombstone());
  const tombstoneStore = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: tombstoneFake.indexedDB
  });
  const tombstoneObservation = await tombstoneStore.read();
  await assertRecoveryError(
    () => tombstoneStore.save({
      observation: tombstoneObservation,
      draft: snapshot,
      savedAt,
      leaseToken: UUIDS[2]
    }),
    'CONFLICT'
  );
  assert.deepEqual(tombstoneFake.control.getRecord(), v2Tombstone());
});

test('v1 continue and autosave stay v1 while v2 continue and autosave stay v2', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();

  const v1Fake = createFakeIndexedDb(activeRecord(source));
  const v1Store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: v1Fake.indexedDB });
  const v1Setup = createOpenOptions(runtime, v1Store);
  const v1Controller = await runtime.recoveryApi.open(v1Setup.options);
  v1Controller.continueSession().setNote('legacy autosave');
  v1Setup.scheduler.runNext();
  await waitForState(v1Controller, 'saved');
  assert.equal(v1Fake.control.getRecord().recovery_schema_version, RECOVERY_SCHEMA);
  assert.equal(Object.hasOwn(v1Fake.control.getRecord(), 'commit_intent'), false);

  const v2Fake = createFakeIndexedDb(v2ActiveRecord(source));
  const v2Store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: v2Fake.indexedDB });
  const v2Setup = createOpenOptions(runtime, v2Store);
  const v2Controller = await runtime.recoveryApi.open(v2Setup.options);
  v2Controller.continueSession().setNote('v2 autosave');
  v2Setup.scheduler.runNext();
  await waitForState(v2Controller, 'saved');
  assert.equal(v2Fake.control.getRecord().recovery_schema_version, RECOVERY_SCHEMA_V2);
  assert.equal(v2Fake.control.getRecord().commit_intent, null);
  assert.equal(v2Fake.control.getRecord().commit_attempt, null);
});

test('prepare synchronously locks mutation and migrates exact v1 draft only on transaction complete', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime, { note: 'prepare fixture' }).getSnapshot();
  const initial = activeRecord(source, { generation: 4, sequence: 7 });
  const fake = createFakeIndexedDb(initial);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.continueSession();
  const intent = commitIntent(source);
  fake.control.state.holdCommits = true;

  const preparePromise = controller.prepareCommit(intent);
  assert.equal(controller.getCommitIntent(), null);
  await assertRecoveryError(() => draft.setNote('must stay locked'), 'MUTATION_BLOCKED');
  await assertRecoveryError(() => controller.discard(), 'UNSAFE_DISCARD');
  await settleTurns();
  assert.deepEqual(fake.control.getRecord(), initial);
  assert.equal(fake.control.state.pendingCommits.length, 1);

  fake.control.releaseCommit();
  const prepared = await preparePromise;
  assert.notEqual(prepared, intent);
  assertFrozenTree(prepared);
  assert.deepEqual(plain(prepared), plain(intent));
  assert.deepEqual(plain(controller.getCommitIntent()), plain(intent));
  assert.notEqual(controller.getCommitIntent(), controller.getCommitIntent());
  assert.equal(fake.control.getRecord().recovery_schema_version, RECOVERY_SCHEMA_V2);
  assert.equal(fake.control.getRecord().write_sequence, 8);
  assert.deepEqual(fake.control.getRecord().draft, plain(source));
  assert.deepEqual(fake.control.getRecord().commit_intent, plain(intent));
  assert.equal(fake.control.getRecord().commit_attempt, null);
  assert.equal(setup.reads.time, 0);
});

test('attempt claim is monotonic and persistent-first; release attempt one unlocks only after complete', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime, { note: 'attempt fixture' }).getSnapshot();
  const intent = commitIntent(source);
  const initial = v2ActiveRecord(source, { intent, sequence: 2 });
  const fake = createFakeIndexedDb(initial);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    leaseTokens: [UUIDS[3], UUIDS[4]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.continueSession();
  fake.control.state.holdCommits = true;

  let claimSettled = false;
  const claimPromise = controller.beginCommitAttempt(intent).then((claim) => {
    claimSettled = true;
    return claim;
  });
  await settleTurns();
  assert.equal(claimSettled, false);
  assert.equal(fake.control.getRecord().commit_attempt, null);
  fake.control.releaseCommit();
  const claim = await claimPromise;
  assert.deepEqual(plain(claim), commitAttempt(1, UUIDS[3]));
  assertFrozenTree(claim);

  fake.control.state.holdCommits = true;
  const releasePromise = controller.releaseCommit(intent);
  await assertRecoveryError(() => draft.setNote('still locked'), 'MUTATION_BLOCKED');
  await assertRecoveryError(() => controller.discard(), 'UNSAFE_DISCARD');
  await settleTurns();
  assert.deepEqual(fake.control.getRecord().commit_attempt, commitAttempt(1, UUIDS[3]));
  fake.control.releaseCommit();
  assert.equal(await releasePromise, null);
  assert.equal(controller.getCommitIntent(), null);
  assert.equal(fake.control.getRecord().commit_intent, null);
  assert.equal(fake.control.getRecord().commit_attempt, null);
  assert.equal(draft.setNote('editing unlocked').note, 'editing unlocked');
});

test('prepare snapshot faults stay asynchronous, unlocked and never reach storage', async () => {
  const runtime = loadRuntimeWithSnapshotFault();
  const source = createDraft(runtime, { note: 'prepare snapshot fault' }).getSnapshot();
  const intent = commitIntent(source);
  const initial = v2ActiveRecord(source, { sequence: 2 });
  const fake = createFakeIndexedDb(initial);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.continueSession();

  runtime.fault.arm(2);
  let preparePromise;
  assert.doesNotThrow(() => {
    preparePromise = controller.prepareCommit(intent);
  });
  await assert.rejects(preparePromise, /snapshot read fault/);
  assert.equal(controller.getState().state, 'saved');
  assert.equal(controller.getCommitIntent(), null);
  assert.equal(fake.control.getRecord().commit_intent, null);
  runtime.fault.arm(null);
  assert.equal(draft.setNote('prepare remained editable').note, 'prepare remained editable');
});

test('attempt and release snapshot faults stay asynchronous and never reach storage', async () => {
  const runtime = loadRuntimeWithSnapshotFault();
  const source = createDraft(runtime, { note: 'snapshot fault fixture' }).getSnapshot();
  const intent = commitIntent(source);
  const initial = v2ActiveRecord(source, { intent, sequence: 2 });
  const fake = createFakeIndexedDb(initial);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    leaseTokens: [UUIDS[3], UUIDS[4]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  controller.continueSession();

  runtime.fault.arm(1);
  let beginPromise;
  assert.doesNotThrow(() => {
    beginPromise = controller.beginCommitAttempt(intent);
  });
  await assert.rejects(beginPromise, /snapshot read fault/);
  assert.equal(fake.control.getRecord().commit_attempt, null);

  runtime.fault.arm(null);
  const claim = await controller.beginCommitAttempt(intent);
  assert.deepEqual(plain(claim), commitAttempt(1, UUIDS[4]));

  runtime.fault.arm(1);
  let releasePromise;
  assert.doesNotThrow(() => {
    releasePromise = controller.releaseCommit(intent);
  });
  await assert.rejects(releasePromise, /snapshot read fault/);
  assert.deepEqual(
    fake.control.getRecord().commit_attempt,
    commitAttempt(1, UUIDS[4])
  );
});

test('attempt two cannot release and stale observation cannot steal a persisted claim', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const intent = commitIntent(source);
  const firstAttempt = commitAttempt(1, UUIDS[2]);
  const initial = v2ActiveRecord(source, { intent, attempt: firstAttempt });
  const fake = createFakeIndexedDb(initial);
  const storeA = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const storeB = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setupA = createOpenOptions(runtime, storeA, { leaseTokens: [UUIDS[3]] });
  const setupB = createOpenOptions(runtime, storeB, { leaseTokens: [UUIDS[4]] });
  const [controllerA, controllerB] = await Promise.all([
    runtime.recoveryApi.open(setupA.options),
    runtime.recoveryApi.open(setupB.options)
  ]);
  controllerA.continueSession();
  controllerB.continueSession();

  const secondAttempt = await controllerA.beginCommitAttempt(intent);
  assert.deepEqual(plain(secondAttempt), commitAttempt(2, UUIDS[3]));
  await assertRecoveryError(() => controllerA.releaseCommit(intent), 'RELEASE_BLOCKED');
  const directStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const directObservation = await directStore.read();
  await assertRecoveryError(
    () => directStore.save({
      observation: directObservation,
      draft: source,
      savedAt: directObservation.value.saved_at,
      leaseToken: directObservation.value.lease_token,
      recoverySchemaVersion: RECOVERY_SCHEMA_V2,
      commitIntent: null,
      commitAttempt: null
    }),
    'CONFLICT'
  );
  await assertRecoveryError(
    () => controllerB.beginCommitAttempt(intent),
    'CONFLICT'
  );
  assert.deepEqual(fake.control.getRecord().commit_attempt, commitAttempt(2, UUIDS[3]));
  assert.equal(controllerB.getState().state, 'conflict');
});

test('complete requires the locally held current claim and tombstones only on transaction complete', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const intent = commitIntent(source);
  const initial = v2ActiveRecord(source, {
    intent,
    generation: 5,
    sequence: 9,
    leaseToken: UUIDS[1]
  });
  const fake = createFakeIndexedDb(initial);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    leaseTokens: [UUIDS[3], UUIDS[4]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.continueSession();

  await assertRecoveryError(() => controller.completeCommit(intent), 'COMMIT_ATTEMPT_REQUIRED');
  const claim = await controller.beginCommitAttempt(intent);
  assert.deepEqual(plain(claim), commitAttempt(1, UUIDS[3]));
  fake.control.state.holdCommits = true;
  const completePromise = controller.completeCommit(intent);
  await settleTurns();
  assert.equal(controller.getState().state, 'saved');
  assert.deepEqual(fake.control.getRecord().commit_attempt, commitAttempt(1, UUIDS[3]));
  await assertRecoveryError(() => draft.setNote('terminal lock'), 'MUTATION_BLOCKED');
  fake.control.releaseCommit();
  const terminal = await completePromise;
  assert.equal(terminal.state, 'destroyed');
  assert.equal(controller.getState().state, 'destroyed');
  assert.deepEqual(fake.control.getRecord(), v2Tombstone({
    generation: 6,
    leaseToken: UUIDS[4]
  }));
  await assertRecoveryError(() => draft.getSnapshot(), 'CONTROLLER_DESTROYED');
});

test('malformed v2 commit truth stays quarantined and byte-content unchanged', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const intent = commitIntent(source);
  intent.payload.duration_min += 1;
  const malformed = v2ActiveRecord(source, { intent });
  const fake = createFakeIndexedDb(malformed);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);

  assert.equal(controller.getState().state, 'blocked');
  assert.equal(controller.getState().reason, 'invalid_record');
  assert.equal(controller.getCommitIntent(), null);
  await assertRecoveryError(() => controller.discard(), 'UNSAFE_DISCARD');
  await assertRecoveryError(() => controller.startNew(), 'MUTATION_BLOCKED');
  assert.deepEqual(fake.control.getRecord(), plain(malformed));
});

test('invalid preparation has no lock side effect and reload requires a matching locally held attempt', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const v1Fake = createFakeIndexedDb(activeRecord(source));
  const v1Store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: v1Fake.indexedDB });
  const v1Setup = createOpenOptions(runtime, v1Store);
  const v1Controller = await runtime.recoveryApi.open(v1Setup.options);
  const v1Draft = v1Controller.continueSession();
  const malformedIntent = commitIntent(source);
  malformedIntent.payload.duration_min = 2;
  await assertRecoveryError(
    () => v1Controller.prepareCommit(malformedIntent),
    'INVALID_COMMIT_INTENT'
  );
  const accessorIntent = plain(commitIntent(source));
  let accessorReads = 0;
  Object.defineProperty(accessorIntent, 'prepared_at', {
    get() {
      accessorReads += 1;
      return new Date(TIMES[2]).toISOString();
    },
    enumerable: true
  });
  await assertRecoveryError(
    () => v1Controller.prepareCommit(accessorIntent),
    'INVALID_COMMIT_INTENT'
  );
  assert.equal(accessorReads, 0);
  assert.equal(v1Draft.setNote('still mutable').note, 'still mutable');

  const intent = commitIntent(source);
  const attempt = commitAttempt(1, UUIDS[3]);
  const v2Fake = createFakeIndexedDb(v2ActiveRecord(source, { intent, attempt }));
  const v2Store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: v2Fake.indexedDB });
  const v2Setup = createOpenOptions(runtime, v2Store);
  const v2Controller = await runtime.recoveryApi.open(v2Setup.options);
  const restoredIntent = v2Controller.getCommitIntent();
  assert.deepEqual(plain(restoredIntent), plain(intent));
  assertFrozenTree(restoredIntent);
  v2Controller.continueSession();
  await assertRecoveryError(
    () => v2Controller.releaseCommit(intent),
    'COMMIT_ATTEMPT_MISMATCH'
  );
  const differentIntent = commitIntent(source, {
    preparedAt: new Date(TIMES[3]).toISOString()
  });
  await assertRecoveryError(
    () => v2Controller.completeCommit(differentIntent),
    'COMMIT_INTENT_MISMATCH'
  );
  assert.deepEqual(v2Fake.control.getRecord(), plain(v2ActiveRecord(source, {
    intent,
    attempt
  })));
});

test('destroy stays terminal when an in-flight claim settles after storage close', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const intent = commitIntent(source);
  const fake = createFakeIndexedDb(v2ActiveRecord(source, { intent }));
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, { leaseTokens: [UUIDS[3]] });
  const controller = await runtime.recoveryApi.open(setup.options);
  controller.continueSession();
  fake.control.state.holdCommits = true;

  const claimPromise = controller.beginCommitAttempt(intent);
  await settleTurns();
  controller.destroy();
  fake.control.releaseCommit();
  await assertRecoveryError(() => claimPromise, 'CONTROLLER_DESTROYED');
  assert.equal(controller.getState().state, 'destroyed');
  assert.equal(controller.getDraft(), null);
});

test('unknown, invalid and unavailable-catalog records block without empty fallback', async () => {
  const runtime = loadRuntime();
  const unknownFake = createFakeIndexedDb({
    slot_key: SLOT_KEY,
    recovery_schema_version: 'future.schema.v9',
    neutral: 'fixture'
  });
  const unknownStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: unknownFake.indexedDB });
  const unknownSetup = createOpenOptions(runtime, unknownStore);
  const unknown = await runtime.recoveryApi.open(unknownSetup.options);
  assert.equal(unknown.getState().state, 'blocked');
  assert.equal(unknown.getState().reason, 'unknown_recovery_schema');
  assert.equal(unknown.getDraft(), null);
  await assertRecoveryError(() => unknown.startNew(), 'MUTATION_BLOCKED');

  const source = createDraft(runtime).getSnapshot();
  const invalidValue = activeRecord(source);
  invalidValue.request_id = UUIDS[3];
  const invalidFake = createFakeIndexedDb(invalidValue);
  const invalidStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: invalidFake.indexedDB });
  const invalidSetup = createOpenOptions(runtime, invalidStore);
  const invalid = await runtime.recoveryApi.open(invalidSetup.options);
  assert.equal(invalid.getState().state, 'blocked');
  assert.equal(invalid.getState().reason, 'invalid_record');

  const invalidSchemaFake = createFakeIndexedDb({
    slot_key: SLOT_KEY,
    recovery_schema_version: null,
    neutral: 'fixture'
  });
  const invalidSchemaStore = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: invalidSchemaFake.indexedDB
  });
  const invalidSchemaSetup = createOpenOptions(runtime, invalidSchemaStore);
  const invalidSchema = await runtime.recoveryApi.open(invalidSchemaSetup.options);
  assert.equal(invalidSchema.getState().state, 'blocked');
  assert.equal(invalidSchema.getState().reason, 'invalid_record');

  const catalogFake = createFakeIndexedDb(activeRecord(source));
  const catalogStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: catalogFake.indexedDB });
  const catalogSetup = createOpenOptions(runtime, catalogStore, {
    resolver: () => null
  });
  const unavailable = await runtime.recoveryApi.open(catalogSetup.options);
  assert.equal(unavailable.getState().state, 'blocked');
  assert.equal(unavailable.getState().reason, 'catalog_unavailable');
});

test('unknown-schema controller is quarantined without discard, start-new or tombstone', async () => {
  const runtime = loadRuntime();
  const unknownRecord = {
    slot_key: SLOT_KEY,
    recovery_schema_version: 'future.schema.v9',
    slot_generation: 'broken',
    neutral: ['fixture']
  };
  const fake = createFakeIndexedDb(unknownRecord);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    leaseTokens: [UUIDS[2]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  assert.equal(controller.getState().state, 'blocked');

  await assertRecoveryError(() => controller.discard(), 'UNSAFE_DISCARD');
  await assertRecoveryError(() => controller.startNew(), 'MUTATION_BLOCKED');
  assert.equal(controller.getState().state, 'blocked');
  assert.equal(controller.getDraft(), null);
  assert.deepEqual(fake.control.getRecord(), unknownRecord);
  assert.equal(fake.control.state.closedConnections, 0);
});

test('two restored controllers conflict by observation and the losing RAM branch remains mutable', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const initial = activeRecord(source, {
    generation: 2,
    sequence: 3,
    leaseToken: UUIDS[1]
  });
  const fake = createFakeIndexedDb(initial);
  const storeA = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const storeB = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setupA = createOpenOptions(runtime, storeA);
  const setupB = createOpenOptions(runtime, storeB);
  const [controllerA, controllerB] = await Promise.all([
    runtime.recoveryApi.open(setupA.options),
    runtime.recoveryApi.open(setupB.options)
  ]);
  const draftA = controllerA.continueSession();
  const draftB = controllerB.continueSession();

  draftA.setNote('winner fixture');
  setupA.scheduler.runNext();
  await waitForState(controllerA, 'saved');
  draftB.setNote('loser fixture');
  setupB.scheduler.runNext();
  await waitForState(controllerB, 'conflict');
  assert.equal(controllerB.getState().reason, 'conflict');
  assert.equal(fake.control.getRecord().draft.note, 'winner fixture');

  const before = draftB.getSnapshot();
  const after = draftB.setNote('loser remains in RAM');
  assert.notEqual(after, before);
  assert.equal(controllerB.getState().state, 'conflict');
  assert.equal(setupB.scheduler.callbacks.length, 0);
  await controllerB.flush();
  assert.equal(fake.control.getRecord().draft.note, 'winner fixture');
});

test('storage failure degrades without losing RAM and explicit flush retries exactly the latest snapshot', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.startNew();

  fake.control.state.abortNextTransaction = true;
  const changed = draft.setNote('retry fixture');
  setup.scheduler.runNext();
  await waitForState(controller, 'degraded');
  assert.equal(controller.getState().reason, 'storage_error');
  assert.equal(draft.getSnapshot(), changed);
  assert.equal(fake.control.getRecord(), undefined);
  assert.equal(setup.scheduler.callbacks.length, 0);

  await controller.flush();
  assert.equal(controller.getState().state, 'saved');
  assert.equal(fake.control.getRecord().draft.note, 'retry fixture');
  assert.equal(fake.control.getRecord().persisted_revision, changed.revision);
});

test('later true mutation retries after failure while enqueue and subscriber throws stay isolated', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.startNew();
  let healthyCalls = 0;
  controller.subscribe(() => {
    healthyCalls += 1;
  });
  controller.subscribe(() => {
    throw new Error('subscriber detail');
  });

  fake.control.state.abortNextTransaction = true;
  draft.setNote('failed revision');
  setup.scheduler.runNext();
  await waitForState(controller, 'degraded');
  const latest = draft.setNote('later mutation');
  assert.equal(setup.scheduler.callbacks.length, 1);
  setup.scheduler.runNext();
  await waitForState(controller, 'saved');
  assert.equal(fake.control.getRecord().persisted_revision, latest.revision);
  assert.equal(fake.control.getRecord().draft.note, 'later mutation');
  assert.ok(healthyCalls >= 4);

  const throwingFake = createFakeIndexedDb();
  const throwingStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: throwingFake.indexedDB });
  const throwingScheduler = createManualScheduler({ throwOnEnqueue: true });
  const throwingSetup = createOpenOptions(runtime, throwingStore, {
    scheduler: throwingScheduler
  });
  const throwingController = await runtime.recoveryApi.open(throwingSetup.options);
  const throwingDraft = throwingController.startNew();
  const ramSnapshot = throwingDraft.setNote('RAM survives enqueue throw');
  assert.equal(throwingController.getState().state, 'degraded');
  assert.equal(throwingDraft.getSnapshot(), ramSnapshot);
  assert.equal(throwingFake.control.getRecord(), undefined);
  await throwingController.flush();
  assert.equal(throwingController.getState().state, 'saved');
});

test('initial read failure allows RAM start but first write re-reads and never takes an active slot', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  fake.control.state.openErrorCount = 1;
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    requestIds: [UUIDS[0]],
    leaseTokens: [UUIDS[1]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  assert.equal(controller.getState().state, 'degraded');
  const localDraft = controller.startNew();
  assert.equal(controller.getState().state, 'degraded');

  const foreignDraft = createDraft(runtime, { requestId: UUIDS[3] }).getSnapshot();
  const foreignRecord = activeRecord(foreignDraft, {
    generation: 6,
    sequence: 7,
    leaseToken: UUIDS[4]
  });
  fake.control.setRecord(foreignRecord);
  localDraft.setNote('local unseen branch');
  setup.scheduler.runNext();
  await waitForState(controller, 'conflict');
  assert.deepEqual(fake.control.getRecord(), foreignRecord);
  assert.equal(localDraft.getSnapshot().note, 'local unseen branch');
});

test('discard waits active write, drops pending, rotates token and blocks mutations until commit', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    leaseTokens: [UUIDS[1], UUIDS[2]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.startNew();
  fake.control.state.holdCommits = true;

  draft.setNote('active write');
  setup.scheduler.runNext();
  await settleTurns();
  assert.equal(fake.control.state.pendingCommits.length, 1);
  draft.setNote('pending must not write');
  const discardPromise = controller.discard();
  assert.equal(controller.getState().state, 'discarding');
  assert.equal(draft.getSnapshot().note, 'pending must not write');
  await assertRecoveryError(
    () => draft.setNote('blocked during discard'),
    'MUTATION_BLOCKED'
  );

  fake.control.releaseCommit();
  await settleTurns();
  assert.equal(fake.control.state.pendingCommits.length, 1);
  assert.equal(fake.control.getRecord().draft.note, 'active write');
  fake.control.releaseCommit();
  await discardPromise;
  assert.equal(controller.getState().state, 'destroyed');
  assert.deepEqual(fake.control.getRecord(), v2Tombstone({
    generation: 1,
    leaseToken: UUIDS[2]
  }));
  await assertRecoveryError(() => draft.getSnapshot(), 'CONTROLLER_DESTROYED');
  assert.equal(fake.control.getRecord().draft, null);
});

test('discard subscription reentrancy coalesces one operation and destroy prevents a late start', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const fake = createFakeIndexedDb(activeRecord(source, {
    leaseToken: UUIDS[1]
  }));
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    leaseTokens: [UUIDS[2]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  controller.continueSession();
  let nestedDiscard;
  controller.subscribe((state) => {
    if (state.state === 'discarding') nestedDiscard = controller.discard();
  });
  const outerDiscard = controller.discard();
  assert.equal(nestedDiscard, outerDiscard);
  await outerDiscard;
  assert.equal(fake.control.getRecord().slot_generation, 1);
  assert.equal(fake.control.state.transactionModes.filter(
    (mode) => mode === 'readwrite'
  ).length, 1);

  const destroyFake = createFakeIndexedDb(activeRecord(source, {
    leaseToken: UUIDS[1]
  }));
  const destroyStore = runtime.recoveryApi.createIndexedDbStore({
    indexedDB: destroyFake.indexedDB
  });
  const destroySetup = createOpenOptions(runtime, destroyStore, {
    leaseTokens: [UUIDS[2]]
  });
  const destroyController = await runtime.recoveryApi.open(destroySetup.options);
  destroyController.continueSession();
  destroyController.subscribe((state) => {
    if (state.state === 'discarding') destroyController.destroy();
  });
  await assertRecoveryError(
    () => destroyController.discard(),
    'CONTROLLER_DESTROYED'
  );
  assert.equal(destroyController.getState().state, 'destroyed');
  assert.deepEqual(destroyFake.control.getRecord(), activeRecord(source, {
    leaseToken: UUIDS[1]
  }));
});

test('failed persistent discard keeps the managed RAM session open and retryable', async () => {
  const runtime = loadRuntime();
  const source = createDraft(runtime).getSnapshot();
  const initial = activeRecord(source, {
    generation: 2,
    sequence: 2,
    leaseToken: UUIDS[1]
  });
  const fake = createFakeIndexedDb(initial);
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store, {
    leaseTokens: [UUIDS[2], UUIDS[3]]
  });
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.continueSession();
  fake.control.state.abortNextTransaction = true;

  await assertRecoveryError(() => controller.discard(), 'STORAGE_ERROR');
  assert.equal(controller.getState().state, 'degraded');
  assert.equal(controller.getState().reason, 'storage_error');
  assert.equal(controller.getDraft(), draft);
  assert.deepEqual(fake.control.getRecord(), initial);
  const next = draft.setNote('RAM remains open');
  assert.equal(next.note, 'RAM remains open');
  setup.scheduler.runNext();
  await waitForState(controller, 'saved');

  await controller.discard();
  assert.equal(controller.getState().state, 'destroyed');
  assert.equal(fake.control.getRecord().draft, null);
});

test('destroy invalidates queued callbacks and closes without deleting or writing', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.startNew();
  const states = [];
  controller.subscribe((state) => states.push(state.state));
  draft.setNote('queued then destroyed');
  assert.equal(setup.scheduler.callbacks.length, 1);

  controller.destroy();
  controller.destroy();
  setup.scheduler.runAll();
  await settleTurns();
  assert.equal(controller.getState().state, 'destroyed');
  assert.equal(controller.getDraft(), null);
  assert.equal(fake.control.getRecord(), undefined);
  assert.equal(fake.control.state.closedConnections, 1);
  assert.equal(states.at(-1), 'destroyed');
});

test('visibility hidden flushes immediately, pagehide stays best effort and destroy removes listeners', async () => {
  const documentHub = createEventHub();
  const windowHub = createEventHub();
  const document = {
    visibilityState: 'visible',
    addEventListener: documentHub.addEventListener,
    removeEventListener: documentHub.removeEventListener
  };
  const runtime = loadRuntime({
    contextValues: {
      document,
      addEventListener: windowHub.addEventListener,
      removeEventListener: windowHub.removeEventListener
    }
  });
  const fake = createFakeIndexedDb();
  const store = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const setup = createOpenOptions(runtime, store);
  const controller = await runtime.recoveryApi.open(setup.options);
  const draft = controller.startNew();
  draft.setNote('lifecycle fixture');
  assert.equal(setup.scheduler.callbacks.length, 1);
  assert.equal(documentHub.count('visibilitychange'), 1);
  assert.equal(windowHub.count('pagehide'), 1);

  document.visibilityState = 'hidden';
  documentHub.dispatch('visibilitychange');
  await waitForState(controller, 'saved');
  assert.equal(fake.control.getRecord().draft.note, 'lifecycle fixture');
  setup.scheduler.runAll();
  windowHub.dispatch('pagehide');
  await settleTurns();
  assert.equal(fake.control.getRecord().write_sequence, 1);

  controller.destroy();
  assert.equal(documentHub.count('visibilitychange'), 0);
  assert.equal(windowHub.count('pagehide'), 0);
});

test('open validates exact dependencies while initial storage protocol failures degrade safely', async () => {
  const runtime = loadRuntime();
  const fake = createFakeIndexedDb();
  const validStore = runtime.recoveryApi.createIndexedDbStore({ indexedDB: fake.indexedDB });
  const valid = createOpenOptions(runtime, validStore).options;

  await assertRecoveryError(() => runtime.recoveryApi.open(), 'INVALID_OPTIONS');
  await assertRecoveryError(
    () => runtime.recoveryApi.open({ ...valid, extra: true }),
    'INVALID_OPTIONS'
  );
  await assertRecoveryError(
    () => runtime.recoveryApi.open({ ...valid, storage: {} }),
    'INVALID_STORAGE'
  );
  await assertRecoveryError(
    () => runtime.recoveryApi.open({ ...valid, semantics: {} }),
    'SEMANTICS_MISSING'
  );
  await assertRecoveryError(
    () => runtime.recoveryApi.open({ ...valid, enqueue: null }),
    'INVALID_SCHEDULER'
  );

  const nonThenableStorage = freezeTree({
    read: () => ({ kind: 'missing', value: null }),
    save: () => null,
    discard: () => null,
    close: () => {}
  });
  const degraded = await runtime.recoveryApi.open({
    ...valid,
    storage: nonThenableStorage
  });
  assert.equal(degraded.getState().state, 'degraded');
  assert.equal(degraded.getState().reason, 'storage_error');
});

test('recovery runtime is isolated from network, Supabase and existing storage', () => {
  const indexSource = fs.readFileSync(indexPath, 'utf8');
  const serviceWorkerSource = fs.readFileSync(serviceWorkerPath, 'utf8');
  [
    /\bfetch\s*\(/,
    /\bsupabase\b/i,
    /\bcommitSession\b/,
    /\bhealthlog_db\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bdeleteDatabase\b/,
    /\bconsole\s*\./
  ].forEach((pattern) => assert.doesNotMatch(recoverySource, pattern));
  assert.match(recoverySource, /midas_activity_v2_recovery/);
  assert.match(recoverySource, /session_recovery/);
  assert.match(recoverySource, /active_session/);
  assert.match(indexSource, /session-recovery\.js/);
  assert.match(serviceWorkerSource, /session-recovery\.js/);
});

test('isolated recovery harness owns exact gate copy, fixtures and R7-only storage cleanup', () => {
  assert.match(
    recoveryHarnessSource,
    /<script src="\.\/semantics\.js"><\/script>[\s\S]*<script src="\.\/semantics-v2\.js"><\/script>[\s\S]*<script src="\.\/session-draft\.js"><\/script>[\s\S]*<script src="\.\/session-recovery\.js"><\/script>[\s\S]*<script src="\.\/session-shell\.js"><\/script>/
  );
  assert.match(
    recoveryHarnessSource,
    /<link rel="stylesheet" href="\.\/session-shell\.css\?v=r7-s4-5">/
  );
  [
    'Unvollständige Session gefunden',
    'Session fortsetzen',
    'Session verwerfen',
    'Lokale Session verwerfen',
    'Wird lokal gesichert …',
    'Lokal gesichert',
    'Lokale Wiederherstellung derzeit nicht garantiert.',
    'Die Session wurde in einem anderen Tab verändert. Bitte neu laden, bevor du sie lokal weiter sicherst oder verwirfst.'
  ].forEach((copy) => assert.match(recoveryHarnessSource, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  [
    'empty',
    'recoverable',
    'malformed',
    'unavailable',
    'saving',
    'lifecycle',
    'degraded',
    'conflict',
    'discard'
  ].forEach((fixture) => assert.match(recoveryHarnessSource, new RegExp(`'${fixture}'`)));

  assert.match(recoveryHarnessSource, /indexedDB\.deleteDatabase\(DATABASE_NAME\)/);
  assert.match(recoveryHarnessSource, /DATABASE_NAME = 'midas_activity_v2_recovery'/);
  assert.match(recoveryHarnessSource, /discard_probe/);
  assert.match(recoveryHarnessSource, /triggerPagehideFlush/);
  assert.match(recoveryHarnessSource, /Pagehide-Flush auslösen/);
  assert.match(recoveryHarnessSource, /aria-live="polite"/);
  assert.match(recoveryHarnessSource, /role="alertdialog"/);
  assert.match(recoveryHarnessSource, /requestConfirmation\(context\.message\)/);
  assert.match(recoveryHarnessSource, /event\.key !== 'Tab'/);
  assert.match(recoveryHarnessSource, /event\.stopPropagation\(\)/);
  assert.match(recoveryHarnessSource, /id="recovery-title" tabindex="-1"/);
  assert.match(recoveryHarnessSource, /backgroundRecords[\s\S]*setAttribute\('inert', ''\)/);
  assert.match(recoveryHarnessSource, /record\.element\.removeAttribute\('aria-hidden'\)/);
  assert.match(recoveryHarnessSource, /else if \(!background\.hasAttribute\('inert'\)\) title\.focus\(\)/);
  assert.doesNotMatch(recoveryHarnessSource, /\b(?:root\.)?confirm\s*\(/);
  assert.match(cssSource, /\.activity-v2-recovery-stage/);
  assert.match(cssSource, /\.activity-v2-recovery-actions button[\s\S]*min-height:\s*44px/);
  assert.match(cssSource, /@media \(max-width:\s*420px\)/);
  assert.doesNotMatch(
    cssSource,
    /\.activity-v2-session-recovery-status:empty\s*\{[^}]*display:\s*none/
  );
  assert.match(recoveryHarnessSource, /finally\s*\{\s*database\.close\(\);\s*\}/);
  assert.match(recoveryHarnessSource, /if \(!controller\) return UNAVAILABLE_HARNESS_RESULT;/);
  assert.match(recoveryHarnessSource, /getHarnessErrorCode\(error\)/);
  assert.match(recoveryHarnessSource, /resolveModuleFacade\(\);[\s\S]*FIXTURES\.includes\(fixture\)/);
  assert.match(recoveryHarnessSource, /RECOVERY_MODULE_FACADE_MISSING/);
  assert.match(recoveryHarnessSource, /value === null \|\| value === undefined/);
  assert.match(recoveryHarnessSource, /pendingWrite\?\.reject\(new Error\('RECOVERY_FIXTURE_TEARDOWN'\)\)/);
  assert.match(recoveryHarnessSource, /RECOVERY_FIXTURE_WRITE_OVERLAP/);
  assert.doesNotMatch(recoveryHarnessSource, /delayedWrite\?\.\(\)/);

  const forbidden = [
    /<script[^>]+(?:index|data-access|data-local|service-worker)\.js/i,
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /WebSocket/,
    /EventSource/,
    /\bsupabase\b/i,
    /\bcommitSession\b/,
    /\bhealthlog_db\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bcaches\b/,
    /serviceWorker/,
    /\.innerHTML\b/,
    /\bconsole\s*\./
  ];
  forbidden.forEach((pattern) => assert.doesNotMatch(recoveryHarnessSource, pattern));
  assert.doesNotMatch(shellHarnessSource, /session-recovery\.js|\bindexedDB\b/);

  const inlineScripts = [...recoveryHarnessSource.matchAll(
    /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g
  )]
    .filter((match) => !/\ssrc\s*=/.test(match[0]))
    .map((match) => match[1]);
  assert.equal(inlineScripts.length, 2);
  inlineScripts.forEach((source) => {
    assert.doesNotThrow(() => new vm.Script(source, { filename: recoveryHarnessPath }));
  });
});
