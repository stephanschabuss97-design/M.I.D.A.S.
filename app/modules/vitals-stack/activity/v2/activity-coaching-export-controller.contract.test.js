'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const contractPath = path.join(__dirname, 'activity-coaching-export.js');
const controllerPath = path.join(__dirname, 'activity-coaching-export-controller.js');
const fixturePath = path.join(__dirname, 'activity-coaching-export.fixture.json');
const contractSource = fs.readFileSync(contractPath, 'utf8');
const controllerSource = fs.readFileSync(controllerPath, 'utf8');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const NOW = Date.parse('2026-08-22T12:00:00.000Z');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function shape(range, empty = false) {
  const value = clone(fixture);
  value.range = { ...range, inclusive: true };
  if (empty) {
    value.sessions = [];
    value.completeness = {
      status: 'complete', truncated: false,
      session_count: 0, item_count: 0, set_count: 0
    };
    value.quality = { status: 'no_data', cautions: ['no_sessions_in_range'] };
  }
  return value;
}

function load() {
  const context = vm.createContext({ Blob, URL, console, AppModules: {} });
  new vm.Script(contractSource, { filename: contractPath }).runInContext(context);
  new vm.Script(controllerSource, { filename: controllerPath }).runInContext(context);
  return context;
}

function makeController(adapter) {
  const context = load();
  const urls = new Map();
  const revoked = [];
  let nextUrl = 1;
  const controller = context.AppModules.activityV2.coachingExportController.create({
    adapter,
    now: () => NOW,
    makeBlob: (parts, options) => new Blob(parts, options),
    createObjectURL(blob) {
      const url = `blob:test-${nextUrl++}`;
      urls.set(url, blob);
      return url;
    },
    revokeObjectURL(url) {
      revoked.push(url);
      urls.delete(url);
    }
  });
  return { controller, context, urls, revoked };
}

test('T-ACT-R10-12 defaults to six months and exposes explicit three/custom ranges', () => {
  const harness = makeController({ async loadCoachingExport() {} });
  assert.deepEqual(JSON.parse(JSON.stringify(harness.controller.getState().range)), {
    from: '2026-02-22', to: '2026-08-22', inclusive: true
  });
  assert.equal(harness.controller.getState().preset, 6);
  harness.controller.setPreset(3);
  assert.deepEqual(JSON.parse(JSON.stringify(harness.controller.getState().range)), {
    from: '2026-05-22', to: '2026-08-22', inclusive: true
  });
  assert.equal(harness.controller.getState().preset, 3);
  harness.controller.setCustomRange({ from: '2026-06-01', to: '2026-08-22' });
  assert.equal(harness.controller.getState().preset, 'custom');
  assert.equal(harness.controller.getState().status, 'idle');
  harness.controller.setCustomRange({ from: '2026-08-23', to: '2026-08-22' });
  assert.equal(harness.controller.getState().status, 'error');
  assert.equal(harness.controller.getState().errorCode, 'INVALID_EXPORT_REQUEST');
  assert.equal(harness.controller.getState().canRetry, false);
});

test('T-ACT-R10-12 validates complete response before creating parseable download', async () => {
  let calls = 0;
  const harness = makeController({
    async loadCoachingExport(range) {
      calls += 1;
      return shape(range);
    }
  });
  const transitions = [];
  harness.controller.subscribe((state) => transitions.push(state.status));
  harness.controller.subscribe((state) => {
    if (state.status === 'ready') throw new Error('consumer render failed');
  });
  await harness.controller.load();
  const state = harness.controller.getState();
  assert.equal(calls, 1);
  assert.deepEqual(transitions, ['idle', 'loading', 'ready']);
  assert.deepEqual(JSON.parse(JSON.stringify(state.counts)), {
    sessions: 2, items: 3, sets: 1
  });
  assert.equal(state.download.filename, 'midas-activity-coaching_2026-02-22_2026-08-22.json');
  const blob = harness.urls.get(state.download.url);
  assert.equal(blob.type, 'application/json;charset=utf-8');
  assert.equal(blob.size, state.download.bytes);
  const downloaded = JSON.parse(await blob.text());
  assert.equal(downloaded.schema_version, 'midas.activity-coaching-export.v1');
  assert.equal(downloaded.completeness.session_count, 2);
  harness.context.AppModules.activityV2.coachingExport.validateExport(downloaded);
  const url = state.download.url;
  harness.controller.releaseDownload();
  assert.deepEqual(harness.revoked, [url]);
  assert.equal(harness.controller.getState().download, null);
});

test('T-ACT-R10-12 supports a complete empty export and releases URL on destroy', async () => {
  const harness = makeController({
    async loadCoachingExport(range) { return shape(range, true); }
  });
  await harness.controller.load();
  const state = harness.controller.getState();
  assert.equal(state.status, 'empty');
  assert.equal(state.counts.sessions, 0);
  assert.ok(state.download);
  const url = state.download.url;
  harness.controller.destroy();
  assert.deepEqual(harness.revoked, [url]);
});

test('T-ACT-R10-12 retries only safe read failures and never downloads an error', async () => {
  let calls = 0;
  const harness = makeController({
    async loadCoachingExport(range) {
      calls += 1;
      if (calls === 1) {
        throw Object.assign(new Error('raw'), {
          code: 'REQUEST_FAILED', retryable: true
        });
      }
      return shape(range);
    }
  });
  await harness.controller.load();
  assert.equal(harness.controller.getState().status, 'error');
  assert.equal(harness.controller.getState().errorCode, 'REQUEST_FAILED');
  assert.equal(harness.controller.getState().canRetry, true);
  assert.equal(harness.controller.getState().download, null);
  await harness.controller.retry();
  assert.equal(calls, 2);
  assert.equal(harness.controller.getState().status, 'ready');

  const invalid = makeController({
    async loadCoachingExport(range) {
      return { ...shape(range), unexpected: true };
    }
  });
  await invalid.controller.load();
  assert.equal(invalid.controller.getState().errorCode, 'EXPORT_CONTRACT_INVALID');
  assert.equal(invalid.controller.getState().canRetry, false);
  assert.equal(invalid.urls.size, 0);
});

test('T-ACT-R10-12 ignores stale responses after a range change', async () => {
  let resolve;
  const pending = new Promise((done) => { resolve = done; });
  const harness = makeController({
    async loadCoachingExport() { return await pending; }
  });
  const loadPromise = harness.controller.load();
  assert.equal(harness.controller.getState().status, 'loading');
  harness.controller.setPreset(3);
  resolve(shape({ from: '2026-02-22', to: '2026-08-22' }));
  await loadPromise;
  assert.equal(harness.controller.getState().status, 'idle');
  assert.equal(harness.controller.getState().preset, 3);
  assert.equal(harness.urls.size, 0);
});
