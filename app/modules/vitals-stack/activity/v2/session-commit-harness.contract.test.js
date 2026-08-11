'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const adapterPath = path.join(__dirname, 'session-commit-harness-adapter.js');
const harnessPath = path.join(__dirname, 'session-commit-harness.js');
const htmlPath = path.join(__dirname, 'session-commit-harness.html');
const cssPath = path.join(__dirname, 'session-commit-harness.css');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const serviceWorkerPath = path.resolve(__dirname, '../../../../..', 'service-worker.js');
const adapterSource = fs.readFileSync(adapterPath, 'utf8');
const harnessSource = fs.readFileSync(harnessPath, 'utf8');
const htmlSource = fs.readFileSync(htmlPath, 'utf8');
const cssSource = fs.readFileSync(cssPath, 'utf8');

function loadAdapter() {
  const delays = [];
  const context = vm.createContext({
    setTimeout(callback, milliseconds) {
      delays.push(milliseconds);
      callback();
      return delays.length;
    }
  });
  vm.runInContext(adapterSource, context, { filename: adapterPath });
  return {
    api: context.AppModules.activityV2.sessionCommitHarnessAdapter,
    delays
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function payload(note = 'stable') {
  return Object.freeze({
    schema_version: 'midas.activity-session.v1',
    catalog_version: 2,
    note
  });
}

test('S4.10 adapter namespace is exact, immutable and models response loss as identical replay', async () => {
  const { api } = loadAdapter();
  assert.deepEqual(Object.keys(api), ['createServer', 'createStorageAdapter']);
  assert.equal(Object.isFrozen(api), true);
  assert.equal(Object.isFrozen(api.createServer), true);
  const server = api.createServer();
  const commit = server.createClient({ fault: 'response_loss' });
  const options = {
    requestId: '00000000-0000-4000-8000-000000000111',
    payload: payload()
  };
  await assert.rejects(
    () => commit(options),
    (error) =>
      error.code === 'REQUEST_FAILED' &&
      error.operation === 'commitSession' &&
      error.commitState === 'unknown'
  );
  assert.deepEqual(plain(await commit(options)), { outcome: 'replayed' });
  assert.deepEqual(plain(server.getSnapshot()), {
    dispatch_count: 2,
    created_count: 1,
    replayed_count: 1,
    conflict_count: 0,
    identity_stable: true
  });
});

test('S4.10 remote faults stay payload-free while identity drift becomes a conflict', async () => {
  const { api, delays } = loadAdapter();
  const server = api.createServer();
  const requestId = '00000000-0000-4000-8000-000000000112';
  assert.deepEqual(
    plain(await server.createClient({ delayMs: 25 })({
      requestId,
      payload: payload()
    })),
    { outcome: 'created' }
  );
  assert.deepEqual(delays, [25]);
  await assert.rejects(
    () =>
      server.createClient()({
        requestId,
        payload: payload('changed')
      }),
    (error) =>
      error.code === 'IDEMPOTENCY_CONFLICT' &&
      error.commitState === 'not_committed' &&
      error.message ===
        'The isolated activity commit harness adapter operation could not be completed.'
  );
  await assert.rejects(
    () =>
      server.createClient({ fault: 'known_auth' })({
        requestId: '00000000-0000-4000-8000-000000000113',
        payload: payload()
      }),
    (error) => error.code === 'AUTH_REQUIRED' && error.commitState === 'not_committed'
  );
  assert.deepEqual(
    plain(
      await server.createClient({ fault: 'malformed' })({
        requestId: '00000000-0000-4000-8000-000000000114',
        payload: payload()
      })
    ),
    { outcome: 'invalid' }
  );
  assert.equal(server.getSnapshot().identity_stable, false);
});

test('S4.10 storage adapter injects intent, release and cleanup faults without delete', async () => {
  const { api } = loadAdapter();
  const calls = [];
  const events = [];
  const base = Object.freeze({
    read: () => Promise.resolve(Object.freeze({ kind: 'missing', value: null })),
    save(options) {
      calls.push(['save', options]);
      return Promise.resolve(Object.freeze({ kind: 'record', value: {} }));
    },
    discard(options) {
      calls.push(['discard', options]);
      return Promise.resolve(Object.freeze({ kind: 'record', value: {} }));
    },
    close() {
      calls.push(['close']);
    }
  });
  const control = {
    intentFailureOnce: true,
    intentDelayMs: 0,
    releaseArmed: true,
    releaseFailureOnce: true,
    cleanupFailureOnce: true
  };
  const storage = api.createStorageAdapter({
    base,
    control,
    onEvent: (event) => events.push(plain(event))
  });
  await assert.rejects(() =>
    storage.save({ commitIntent: {}, commitAttempt: null })
  );
  await assert.rejects(() =>
    storage.save({ commitIntent: null, commitAttempt: null })
  );
  await storage.save({
    commitIntent: {},
    commitAttempt: { attempt_number: 2 }
  });
  await assert.rejects(() => storage.discard({ observation: {} }));
  await storage.discard({ observation: {} });
  storage.close();
  assert.deepEqual(
    events.map((event) => [event.type, event.attempt_number]),
    [
      ['intent_failure', null],
      ['release_failure', null],
      ['attempt_claim', 2],
      ['cleanup_failure', null],
      ['tombstone', null]
    ]
  );
  assert.deepEqual(calls.map((call) => call[0]), ['save', 'discard', 'close']);
  assert.equal(Object.isFrozen(storage), true);
});

test('S4.10 harness loads only real isolated modules and exposes every deterministic fixture', () => {
  assert.doesNotThrow(() => new vm.Script(adapterSource, { filename: adapterPath }));
  assert.doesNotThrow(() => new vm.Script(harnessSource, { filename: harnessPath }));
  [
    'semantics.js',
    'semantics-v2.js',
    'session-draft.js',
    'session-recovery.js',
    'session-commit.js',
    'session-shell.js',
    'session-commit-harness-adapter.js',
    'session-commit-harness.js'
  ].forEach((file) => {
    assert.match(
      htmlSource,
      new RegExp(`<script src="\\./${file.replace('.', '\\.')}\\?v=r8-s5-3"></script>`)
    );
  });
  [
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
  ].forEach((fixture) => assert.match(htmlSource, new RegExp(`fixture=${fixture}`)));
  assert.match(harnessSource, /EXPECTED_STATES/);
  assert.match(
    harnessSource,
    /if \(version === 1\) return activityV2\.semantics \?\? null;/
  );
  assert.match(
    harnessSource,
    /async function settlePersistedSlot\(\)[\s\S]*?try \{[\s\S]*?try \{[\s\S]*?commit\.destroy\(\);[\s\S]*?finally \{[\s\S]*?recovery\.destroy\(\);/
  );
  assert.match(
    harnessSource,
    /run\(\)\.catch\(async \(error\)[\s\S]*?try \{[\s\S]*?publishResult\([\s\S]*?catch \{[\s\S]*?__MIDAS_ACTIVITY_V2_COMMIT_HARNESS__[\s\S]*?catch \{/
  );
  assert.match(harnessSource, /participants - 1/);
  assert.match(harnessSource, /serverState\.replayed_count === 1/);
  assert.match(harnessSource, /recovery\.getCommitIntent\(\) !== null/);
  assert.match(harnessSource, /await commit\.retry\(\)/);
  assert.match(harnessSource, /await recovery\.discard\(\)/);
  assert.match(
    harnessSource,
    /active === context && context\.publishUpdates !== false/
  );
  assert.match(
    harnessSource,
    /publishUpdates: options\.publishUpdates !== false/
  );
  ['preparing', 'committing'].forEach((fixture) => {
    assert.match(
      harnessSource,
      new RegExp(
        `if \\(fixture === '${fixture}'\\) \\{[\\s\\S]*?` +
        `options\\.publishUpdates = false;`
      )
    );
  });
  assert.match(cssSource, /@media \(max-width: 720px\)/);
  assert.match(cssSource, /min-height:\s*44px/);
  const combined = `${adapterSource}\n${harnessSource}\n${htmlSource}`;
  [
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /WebSocket/,
    /EventSource/,
    /supabase/i,
    /activity_v2_commit_session/,
    /serviceWorker/,
    /deleteDatabase/,
    /\.delete\s*\(/,
    /localStorage/,
    /sessionStorage/,
    /<script[^>]+index\.js/,
    /authorization/i,
    /bearer\s/i,
    /\.innerHTML\b/
  ].forEach((pattern) => assert.doesNotMatch(combined, pattern));
  assert.doesNotMatch(fs.readFileSync(indexPath, 'utf8'), /session-commit-harness/);
  assert.doesNotMatch(
    fs.readFileSync(serviceWorkerPath, 'utf8'),
    /session-commit-harness/
  );
});
