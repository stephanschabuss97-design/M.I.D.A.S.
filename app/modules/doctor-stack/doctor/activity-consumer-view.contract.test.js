'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootPath = path.resolve(__dirname, '../../../..');
const consumerPath = path.join(
  rootPath,
  'app/modules/vitals-stack/activity/v2/activity-consumer.js'
);
const fixturePath = path.join(
  rootPath,
  'app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json'
);
const modulePath = path.join(__dirname, 'activity-consumer-view.js');
const indexPath = path.join(rootPath, 'index.html');
const doctorIndexPath = path.join(__dirname, 'index.js');
const consumerSource = fs.readFileSync(consumerPath, 'utf8');
const moduleSource = fs.readFileSync(modulePath, 'utf8');
const indexSource = fs.readFileSync(indexPath, 'utf8');
const doctorIndexSource = fs.readFileSync(doctorIndexPath, 'utf8');
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const EMPTY = fixtures.cases.find((entry) => entry.name === 'empty');
const MIXED = fixtures.cases.find((entry) => entry.name === 'mixed');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function makeHarness(options = {}) {
  const renders = [];
  const calls = [];
  const deleted = [];
  const diagnostics = [];
  const adapter = options.adapter || {
    async loadSnapshot(range) {
      calls.push(clone(range));
      return clone(MIXED.snapshot);
    }
  };
  const context = vm.createContext({});
  new vm.Script(consumerSource, { filename: consumerPath }).runInContext(context);
  new vm.Script(moduleSource, { filename: modulePath }).runInContext(context);
  const api = context.AppModules.doctor.activityConsumerView;
  const controller = api.create({
    adapter,
    contract: context.AppModules.activityV2.consumer,
    host: {},
    renderer(_host, state) { renders.push(clone(state)); },
    async deleteV1(unit) {
      deleted.push(clone(unit));
      if (options.deleteError) throw options.deleteError;
    },
    diagnose(value) {
      diagnostics.push(clone(value));
      if (options.diagnoseError) throw options.diagnoseError;
    },
    unlocked: options.unlocked === true
  });
  return { api, context, controller, calls, renders, deleted, diagnostics };
}

function state(controller) {
  return clone(controller.getState());
}

test('T-ACT-R11-07 registers a frozen API without product loading or handler edits', () => {
  const harness = makeHarness();
  assert.deepEqual(Reflect.ownKeys(harness.api), ['create', 'render']);
  assert.equal(Object.isFrozen(harness.api), true);
  assert.equal(Object.isFrozen(harness.api.create), true);
  assert.doesNotMatch(indexSource, /activity-consumer-(?:view|harness)/);
  assert.doesNotMatch(doctorIndexSource, /activityConsumerView/);
});

test('T-ACT-R11-07 remains locked and lazy until explicit unlock and open', async () => {
  const harness = makeHarness();
  await harness.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  await harness.controller.open();
  assert.equal(harness.calls.length, 0);
  assert.equal(state(harness.controller).status, 'locked');
  harness.controller.unlock();
  assert.equal(harness.calls.length, 0);
  await harness.controller.open();
  assert.equal(harness.calls.length, 1);
  assert.equal(state(harness.controller).status, 'ready');
});

test('T-ACT-R11-07 renders ready and empty states through strict validation', async () => {
  const harness = makeHarness({ unlocked: true });
  await harness.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  await harness.controller.open();
  assert.equal(state(harness.controller).snapshot.summary.unit_count, 3);
  assert.equal(Object.isFrozen(harness.controller.getState()), true);

  const empty = makeHarness({
    unlocked: true,
    adapter: { async loadSnapshot() { return clone(EMPTY.snapshot); } }
  });
  await empty.controller.setRange({ from: EMPTY.range.from, to: EMPTY.range.to });
  await empty.controller.open();
  assert.equal(state(empty.controller).status, 'empty');
});

test('T-ACT-R11-07 preserves only stable error data and survives diagnostic failure', async () => {
  const harness = makeHarness({
    unlocked: true,
    diagnoseError: new Error('raw diagnostic'),
    adapter: {
      async loadSnapshot() {
        throw Object.assign(new Error('raw database secret'), {
          code: 'LIMIT_EXCEEDED', status: 409, response: { jwt: 'secret' }
        });
      }
    }
  });
  await harness.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  await harness.controller.open();
  assert.deepEqual(state(harness.controller), {
    status: 'error',
    range: MIXED.range,
    snapshot: null,
    errorCode: 'LIMIT_EXCEEDED',
    opened: true,
    unlocked: true
  });
  assert.deepEqual(harness.diagnostics, [{
    operation: 'loadDoctorActivity', code: 'LIMIT_EXCEEDED', status: 409
  }]);
  assert.equal(JSON.stringify(state(harness.controller)).includes('secret'), false);

  const accessorError = Object.defineProperties({}, {
    code: { enumerable: true, get() { throw new Error('raw code accessor'); } },
    status: { enumerable: true, get() { throw new Error('raw status accessor'); } }
  });
  const adversarial = makeHarness({
    unlocked: true,
    adapter: { async loadSnapshot() { throw accessorError; } }
  });
  await adversarial.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  await adversarial.controller.open();
  assert.equal(state(adversarial.controller).errorCode, 'REQUEST_FAILED');
  assert.deepEqual(adversarial.diagnostics, [{
    operation: 'loadDoctorActivity', code: 'REQUEST_FAILED', status: null
  }]);
});

test('T-ACT-R11-07 fences stale range, close and logout responses', async () => {
  const first = deferred();
  let call = 0;
  const harness = makeHarness({
    unlocked: true,
    adapter: {
      async loadSnapshot(range) {
        call += 1;
        if (call === 1) return await first.promise;
        return clone(EMPTY.snapshot);
      }
    }
  });
  await harness.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  const staleRange = harness.controller.open();
  await harness.controller.setRange({ from: EMPTY.range.from, to: EMPTY.range.to });
  first.resolve(clone(MIXED.snapshot));
  await staleRange;
  assert.equal(state(harness.controller).status, 'empty');
  assert.deepEqual(state(harness.controller).range, EMPTY.range);

  const closePending = deferred();
  const closeHarness = makeHarness({
    unlocked: true,
    adapter: { async loadSnapshot() { return await closePending.promise; } }
  });
  await closeHarness.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  const closeLoad = closeHarness.controller.open();
  closeHarness.controller.close();
  closePending.resolve(clone(MIXED.snapshot));
  await closeLoad;
  assert.equal(state(closeHarness.controller).opened, false);
  assert.equal(state(closeHarness.controller).snapshot, null);

  const logoutPending = deferred();
  const logoutHarness = makeHarness({
    unlocked: true,
    adapter: { async loadSnapshot() { return await logoutPending.promise; } }
  });
  await logoutHarness.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  const logoutLoad = logoutHarness.controller.open();
  logoutHarness.controller.logout();
  logoutPending.resolve(clone(MIXED.snapshot));
  await logoutLoad;
  assert.equal(state(logoutHarness.controller).status, 'locked');
  assert.equal(state(logoutHarness.controller).range, null);
});

test('T-ACT-R11-07 allows only current V1 units through the delete seam', async () => {
  const harness = makeHarness({ unlocked: true });
  await harness.controller.setRange({ from: MIXED.range.from, to: MIXED.range.to });
  await harness.controller.open();
  const units = harness.controller.getState().snapshot.units;
  const v1 = units.find((unit) => unit.source === 'activity_v1');
  const v2 = units.find((unit) => unit.source === 'activity_v2');
  await harness.controller.deleteUnit(v2);
  await harness.controller.deleteUnit({ ...v1, id: 'ffffffff-ffff-4fff-8fff-ffffffffffff' });
  assert.equal(harness.deleted.length, 0);
  await harness.controller.deleteUnit(v1);
  assert.equal(harness.deleted.length, 1);
  assert.equal(harness.deleted[0].source, 'activity_v1');
  assert.equal(harness.calls.length, 2);
});

test('T-ACT-R11-07 rejects invalid ranges without adapter I/O', async () => {
  const harness = makeHarness({ unlocked: true });
  const invalid = { from: MIXED.range.from, to: MIXED.range.to, extra: true };
  await harness.controller.setRange(invalid);
  await harness.controller.open();
  assert.equal(harness.calls.length, 0);
  assert.equal(state(harness.controller).errorCode, 'INVALID_RANGE');
});
