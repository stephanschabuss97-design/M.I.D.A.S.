'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');

function fixture(storage = new Map()) {
  const bodies = [], events = [], logs = [];
  let result = { ok: true, skipped: false }, httpOk = true, syncStatus = 'ready', profileFail = false;
  let reads = 0;
  const sandbox = {
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key)
    },
    URL, Headers, CustomEvent: class { constructor(type) { this.type = type; } },
    document: { dispatchEvent: (event) => events.push(event.type) },
    diag: { add: (value) => logs.push(value) },
    getConf: async () => 'https://local.invalid/rest/v1/',
    fetch: async (url, options) => {
      assert.equal(url, 'https://local.invalid/functions/v1/midas-protein-targets');
      bodies.push(JSON.parse(options.body));
      return { ok: httpOk, status: 502, text: async () => 'secret', json: async () => result };
    },
    AppModules: {
      supabase: {
        supabaseState: { authState: 'auth' },
        baseUrlFromRest: (value) => value.replace(/\/rest\/v1\/$/, ''),
        fetchWithAuth: async (fn, options) => {
          assert.equal(options.maxAttempts, 1);
          return fn({ Authorization: 'fixture' });
        }
      },
      profile: {
        sync: async () => { reads++; syncStatus = profileFail ? 'error' : 'ready'; },
        getSyncStatus: () => ({ status: syncStatus }), getData: () => ({ protein_target_max: 90 })
      }
    }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return {
    api: sandbox.AppModules.protein, bodies, events, logs,
    get reads() { return reads; },
    setResult: (value) => { result = value; },
    setHttp: (value) => { httpOk = value; },
    setProfileFailure: (value) => { profileFail = value; },
    setStatus: (value) => { syncStatus = value; },
    logout: () => { sandbox.AppModules.supabase.supabaseState.authState = 'unauth'; }
  };
}

test('C4 each confirmed mutation sends only its trigger, reloads Profile and acknowledges ready', async () => {
  const f = fixture();
  for (const trigger of ['activity_save', 'activity_correction', 'activity_delete']) {
    const refresh = f.api.refreshAfterActivity(trigger);
    assert.equal(f.api.getActivityRefreshState().status, 'pending');
    await refresh;
    assert.equal(f.api.getActivityRefreshState().status, 'ready');
  }
  assert.deepEqual(f.bodies, ['activity_save', 'activity_correction', 'activity_delete'].map(trigger => ({ trigger, weight_kg: null, dayIso: null, force: false })));
  assert.equal(f.reads, 3);
  assert.deepEqual(f.events, Array(6).fill('protein:refresh-state'));
});

test('C4 transport and swallowed Profile errors remain stale; explicit retry can recover safely', async () => {
  const f = fixture();
  f.setHttp(false);
  await assert.rejects(f.api.refreshAfterActivity('activity_save'), /noch nicht aktualisiert/);
  assert.equal(f.api.getActivityRefreshState().status, 'error');
  assert.equal(f.reads, 0);
  assert.ok(f.logs.every(value => !value.includes('secret')));
  f.setHttp(true); f.setProfileFailure(true);
  await assert.rejects(f.api.refreshAfterActivity('activity_save'), /noch nicht aktualisiert/);
  assert.equal(f.api.getActivityRefreshState().status, 'error');
  f.setProfileFailure(false); f.setResult({ ok: true, skipped: true, reason: 'cooldown_unchanged' });
  await f.api.refreshAfterActivity('activity_save');
  assert.equal(f.api.getActivityRefreshState().status, 'ready');
  assert.equal(f.bodies.length, 3);
});

test('C4 invalid acknowledgements, missing CKD skips and logout never present a current target', async () => {
  for (const result of [{}, { ok: true }, { ok: true, skipped: false, dry_run: true }, { ok: true, skipped: true, reason: 'ckd_unknown' }, { ok: false, skipped: false }]) {
    const f = fixture(); f.setResult(result);
    await assert.rejects(f.api.refreshAfterActivity('activity_correction'));
    assert.equal(f.reads, 0);
    assert.equal(f.api.getActivityRefreshState().status, 'error');
  }
  const f = fixture(); f.logout();
  await assert.rejects(f.api.refreshAfterActivity('activity_delete'));
  assert.equal(f.bodies.length, 0);
  assert.equal(f.api.getActivityRefreshState().status, 'error');
});

test('C4 drains older Profile reads and serializes mutations without clearing newer pending state', async () => {
  const f = fixture(); f.setStatus('loading');
  const first = f.api.refreshAfterActivity('activity_save');
  const second = f.api.refreshAfterActivity('activity_delete');
  await first;
  assert.equal(f.api.getActivityRefreshState().trigger, 'activity_delete');
  await second;
  assert.equal(f.reads, 3);
  assert.equal(f.api.getActivityRefreshState().status, 'ready');
});

test('C4 reload preserves only a stale trigger marker until confirmed Edge and Profile success', async () => {
  const storage = new Map();
  const f = fixture(storage); f.setHttp(false);
  await assert.rejects(f.api.refreshAfterActivity('activity_delete'));
  assert.deepEqual([...storage.values()], ['activity_delete']);
  const reloaded = fixture(storage);
  assert.equal(reloaded.api.getActivityRefreshState().status, 'error');
  assert.equal(reloaded.api.getActivityRefreshState().trigger, 'activity_delete');
  assert.equal(reloaded.bodies.length, 0);
  await reloaded.api.refreshAfterActivity('activity_delete');
  assert.equal(storage.size, 0);
});
