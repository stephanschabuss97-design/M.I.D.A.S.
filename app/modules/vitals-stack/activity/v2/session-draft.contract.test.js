'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const draftPath = path.join(__dirname, 'session-draft.js');
const semanticsPath = path.join(__dirname, 'semantics.js');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const source = fs.readFileSync(draftPath, 'utf8');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const SAFE_MESSAGE = 'The activity session draft operation could not be completed.';
const UUIDS = [
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003'
];

function makeCatalog(version = 7, entries = null) {
  return {
    catalog_version: version,
    entries: entries || [
      { key: 'alpha_item', status: 'active' },
      { key: 'beta_item', status: 'active' },
      { key: 'old_item', status: 'deprecated' }
    ]
  };
}

function makeSemantics(getCatalog) {
  return {
    getCatalog,
    getEntryByKey(itemKey) {
      return getCatalog().entries.find((entry) => entry.key === itemKey) || null;
    }
  };
}

function loadDraft({
  semantics = makeSemantics(() => makeCatalog()),
  crypto,
  number,
  appModules
} = {}) {
  const activityV1 = { marker: 'preserved' };
  const defaultModules = {
    activity: activityV1,
    activityV2: { semantics }
  };
  const context = vm.createContext({
    AppModules: appModules === undefined ? defaultModules : appModules,
    ...(crypto === undefined ? {} : { crypto }),
    ...(number === undefined ? {} : { Number: number })
  });
  vm.runInContext(source, context, { filename: draftPath });
  return {
    api: context.AppModules.activityV2.sessionDraft,
    context,
    activityV1
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
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

function assertDraftError(action, code) {
  let caught;
  assert.throws(action, (error) => {
    caught = error;
    return true;
  });
  assert.equal(caught.name, 'ActivityV2SessionDraftError');
  assert.equal(caught.code, code);
  assert.equal(caught.message, SAFE_MESSAGE);
}

function createController({ catalog = makeCatalog(), ids = UUIDS, now = () => 0 } = {}) {
  let idIndex = 0;
  const holder = { catalog };
  const semantics = makeSemantics(() => holder.catalog);
  const { api } = loadDraft({ semantics });
  const controller = api.create({
    semantics,
    now,
    createRequestId: () => ids[idIndex++]
  });
  return { api, controller, holder, semantics, getIdReads: () => idIndex };
}

test('classic-script namespace is immutable and preserves existing modules', () => {
  const semantics = makeSemantics(() => makeCatalog());
  const crypto = { randomUUID: () => UUIDS[0].toUpperCase() };
  const { api, context, activityV1 } = loadDraft({ semantics, crypto });

  assert.deepEqual(Object.keys(api), ['create']);
  assertFrozenTree(api);
  assert.equal(context.AppModules.activity, activityV1);
  assert.equal(Object.isExtensible(context.AppModules), true);
  assert.equal(Object.isExtensible(context.AppModules.activityV2), true);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(context.AppModules.activityV2, 'sessionDraft'),
    {
      value: api,
      enumerable: true,
      writable: false,
      configurable: false
    }
  );
  assert.throws(
    () => vm.runInContext(source, context, { filename: draftPath }),
    /already registered/
  );

  assert.throws(() => loadDraft({ appModules: [] }), /AppModules must be an object/);
  assert.throws(
    () => loadDraft({ appModules: { activityV2: [] } }),
    /AppModules\.activityV2 must be an object/
  );
});

test('create returns the exact pristine immutable draft with dynamic catalog data', () => {
  const semantics = makeSemantics(() => makeCatalog(23));
  const { api } = loadDraft({
    semantics,
    crypto: { randomUUID: () => UUIDS[0].toUpperCase() }
  });
  const controller = api.create({ now: () => 1234 });
  const snapshot = controller.getSnapshot();

  assertFrozenTree(controller);
  assert.deepEqual(Object.keys(controller), [
    'getSnapshot',
    'getTimerSnapshot',
    'addItem',
    'removeItem',
    'moveItem',
    'setNote',
    'discard'
  ]);
  assert.deepEqual(plain(snapshot), {
    draft_schema_version: 'midas.activity-session-draft.v1',
    request_id: UUIDS[0],
    catalog_version: 23,
    revision: 0,
    started_at: null,
    note: null,
    items: []
  });
  assert.equal(controller.getSnapshot(), snapshot);
  assertFrozenTree(snapshot);
  assertFrozenTree(controller.getTimerSnapshot());
  assert.deepEqual(plain(controller.getTimerSnapshot()), {
    running: false,
    elapsed_ms: 0,
    label: '00:00'
  });
});

test('default semantics dependency consumes the real R1 catalog without hardcoding', () => {
  const context = vm.createContext({
    crypto: { randomUUID: () => UUIDS[0] }
  });
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  vm.runInContext(source, context, { filename: draftPath });

  const catalog = context.AppModules.activityV2.semantics.getCatalog();
  const firstActive = catalog.entries.find((entry) => entry.status === 'active');
  const controller = context.AppModules.activityV2.sessionDraft.create({
    now: () => 0
  });
  assert.equal(controller.getSnapshot().catalog_version, catalog.catalog_version);
  assert.deepEqual(plain(controller.addItem(firstActive.key).items), [
    { item_key: firstActive.key, item_order: 1 }
  ]);
});

test('options, dependencies, catalog, request ID and clock fail closed', () => {
  const { api } = loadDraft();
  const valid = {
    semantics: makeSemantics(() => makeCatalog()),
    createRequestId: () => UUIDS[0]
  };

  assertDraftError(() => api.create(null), 'INVALID_OPTIONS');
  assertDraftError(() => api.create([]), 'INVALID_OPTIONS');
  assertDraftError(() => api.create({ extra: true }), 'INVALID_OPTIONS');
  const symbolOptions = { ...valid, [Symbol('extra')]: true };
  assertDraftError(() => api.create(symbolOptions), 'INVALID_OPTIONS');
  assertDraftError(
    () => api.create({ ...valid, semantics: {} }),
    'SEMANTICS_MISSING'
  );
  assertDraftError(
    () => api.create({ ...valid, now: 'soon' }),
    'INVALID_CLOCK'
  );
  assertDraftError(
    () => api.create({ ...valid, createRequestId: 4 }),
    'INVALID_REQUEST_ID'
  );
  assertDraftError(
    () => api.create({ ...valid, createRequestId: () => 'sensitive-id' }),
    'INVALID_REQUEST_ID'
  );
  assertDraftError(
    () => api.create({ ...valid, createRequestId: () => { throw new Error('secret'); } }),
    'INVALID_REQUEST_ID'
  );

  const noCryptoApi = loadDraft({
    semantics: valid.semantics
  }).api;
  assertDraftError(
    () => noCryptoApi.create({ semantics: valid.semantics }),
    'REQUEST_ID_UNAVAILABLE'
  );

  const invalidCatalogs = [
    null,
    { catalog_version: 0, entries: [] },
    { catalog_version: 2, entries: {} },
    makeCatalog(2, [{ key: 'Bad Key', status: 'active' }]),
    makeCatalog(2, [
      { key: 'duplicate', status: 'active' },
      { key: 'duplicate', status: 'active' }
    ]),
    makeCatalog(2, [{ key: 'alpha_item', status: 'unknown' }])
  ];
  invalidCatalogs.forEach((catalog) => {
    assertDraftError(
      () => api.create({
        semantics: makeSemantics(() => catalog),
        createRequestId: () => UUIDS[0]
      }),
      'INVALID_CATALOG'
    );
  });
  assertDraftError(
    () => api.create({
      semantics: makeSemantics(() => { throw new Error('catalog secret'); }),
      createRequestId: () => UUIDS[0]
    }),
    'INVALID_CATALOG'
  );
});

test('item mutations are atomic, ordered and keep identity and start time stable', () => {
  const started = Date.UTC(2026, 7, 1, 10, 20, 30, 456);
  const { controller } = createController({ now: () => started });
  const pristine = controller.getSnapshot();

  const first = controller.addItem('alpha_item');
  assert.notEqual(first, pristine);
  assert.equal(first.request_id, pristine.request_id);
  assert.equal(first.revision, 1);
  assert.equal(first.started_at, '2026-08-01T10:20:30.456Z');
  assert.deepEqual(plain(first.items), [
    { item_key: 'alpha_item', item_order: 1 }
  ]);

  let before = controller.getSnapshot();
  assertDraftError(() => controller.addItem('alpha_item'), 'DUPLICATE_ITEM');
  assert.equal(controller.getSnapshot(), before);
  assertDraftError(() => controller.addItem('missing_item'), 'UNKNOWN_ITEM_KEY');
  assert.equal(controller.getSnapshot(), before);
  assertDraftError(() => controller.addItem('old_item'), 'INACTIVE_ITEM_KEY');
  assert.equal(controller.getSnapshot(), before);
  assertDraftError(() => controller.addItem('Bad Key'), 'INVALID_ITEM_KEY');
  assert.equal(controller.getSnapshot(), before);

  const second = controller.addItem('beta_item');
  const moved = controller.moveItem('beta_item', 1);
  assert.equal(moved.revision, second.revision + 1);
  assert.deepEqual(plain(moved.items), [
    { item_key: 'beta_item', item_order: 1 },
    { item_key: 'alpha_item', item_order: 2 }
  ]);
  assert.equal(controller.moveItem('beta_item', 1), moved);

  before = controller.getSnapshot();
  assertDraftError(() => controller.moveItem('beta_item', 0), 'INVALID_ITEM_ORDER');
  assert.equal(controller.getSnapshot(), before);
  assertDraftError(() => controller.moveItem('missing_item', 1), 'ITEM_NOT_FOUND');
  assert.equal(controller.getSnapshot(), before);
  assertDraftError(() => controller.removeItem('missing_item'), 'ITEM_NOT_FOUND');
  assert.equal(controller.getSnapshot(), before);

  controller.removeItem('alpha_item');
  const empty = controller.removeItem('beta_item');
  assert.deepEqual(plain(empty.items), []);
  assert.equal(empty.started_at, first.started_at);
  assert.equal(empty.request_id, pristine.request_id);
  assertFrozenTree(empty);
});

test('notes normalize by trim, count Unicode codepoints and preserve no-op references', () => {
  const { controller } = createController();
  const pristine = controller.getSnapshot();
  assert.equal(controller.setNote('  \n\t '), pristine);

  const noted = controller.setNote('  Training note  ');
  assert.equal(noted.note, 'Training note');
  assert.equal(noted.revision, 1);
  assert.equal(controller.setNote('Training note'), noted);

  const fiveHundred = '😀'.repeat(500);
  const unicodeNote = controller.setNote(fiveHundred);
  assert.equal(Array.from(unicodeNote.note).length, 500);
  const before = controller.getSnapshot();
  assertDraftError(() => controller.setNote('😀'.repeat(501)), 'INVALID_NOTE');
  assert.equal(controller.getSnapshot(), before);
  assertDraftError(() => controller.setNote(null), 'INVALID_NOTE');
  assert.equal(controller.getSnapshot(), before);

  const cleared = controller.setNote(' ');
  assert.equal(cleared.note, null);
  assert.equal(cleared.started_at, null);
});

test('timer derives elapsed time from timestamps across background and clock jumps', () => {
  const start = Date.UTC(2026, 7, 1, 8, 0, 0, 0);
  let current = start;
  let reads = 0;
  const { controller } = createController({
    now: () => {
      reads += 1;
      return current;
    }
  });

  assert.deepEqual(plain(controller.getTimerSnapshot()), {
    running: false,
    elapsed_ms: 0,
    label: '00:00'
  });
  assert.equal(reads, 0);
  controller.addItem('alpha_item');
  assert.equal(reads, 1);

  current = start + 65_432.9;
  assert.deepEqual(plain(controller.getTimerSnapshot()), {
    running: true,
    elapsed_ms: 65_432,
    label: '01:05'
  });
  current = start - 10_000;
  assert.deepEqual(plain(controller.getTimerSnapshot()), {
    running: true,
    elapsed_ms: 0,
    label: '00:00'
  });
  current = start + ((25 * 60 + 2) * 60 + 3) * 1000;
  assert.equal(controller.getTimerSnapshot().label, '25:02:03');

  controller.removeItem('alpha_item');
  assert.equal(controller.getTimerSnapshot().running, true);
  const before = controller.getSnapshot();
  current = Number.NaN;
  assertDraftError(() => controller.getTimerSnapshot(), 'INVALID_CLOCK');
  assert.equal(controller.getSnapshot(), before);
});

test('invalid first-start clock and revision ceiling leave the snapshot unchanged', () => {
  const invalidClock = createController({ now: () => Infinity }).controller;
  const pristine = invalidClock.getSnapshot();
  assertDraftError(() => invalidClock.addItem('alpha_item'), 'INVALID_CLOCK');
  assert.equal(invalidClock.getSnapshot(), pristine);

  function TestNumber(value) {
    return Number(value);
  }
  TestNumber.isFinite = Number.isFinite;
  TestNumber.isSafeInteger = Number.isSafeInteger;
  TestNumber.MAX_SAFE_INTEGER = 2;
  const semantics = makeSemantics(() => makeCatalog());
  const { api } = loadDraft({ semantics, number: TestNumber });
  const controller = api.create({
    semantics,
    now: () => 0,
    createRequestId: () => UUIDS[0]
  });
  controller.setNote('one');
  controller.setNote('two');
  const atLimit = controller.getSnapshot();
  assert.equal(atLimit.revision, 2);
  assertDraftError(() => controller.setNote('three'), 'REVISION_LIMIT_REACHED');
  assert.equal(controller.getSnapshot(), atLimit);
});

test('the 50-item boundary rejects overflow without changing the draft', () => {
  const entries = Array.from({ length: 51 }, (_, index) => ({
    key: `item_${String(index + 1).padStart(2, '0')}`,
    status: 'active'
  }));
  const { controller } = createController({
    catalog: makeCatalog(31, entries),
    now: () => 0
  });
  entries.slice(0, 50).forEach((entry) => controller.addItem(entry.key));
  const full = controller.getSnapshot();
  assert.equal(full.items.length, 50);
  assert.equal(full.revision, 50);
  assertDraftError(() => controller.addItem(entries[50].key), 'ITEM_LIMIT_REACHED');
  assert.equal(controller.getSnapshot(), full);
  assert.deepEqual(
    plain(full.items).map((item) => item.item_order),
    Array.from({ length: 50 }, (_, index) => index + 1)
  );
});

test('discard is atomic and replaces only request identity and captured catalog state', () => {
  const { controller, holder, getIdReads } = createController();
  controller.addItem('alpha_item');
  controller.setNote('note');
  const dirty = controller.getSnapshot();

  holder.catalog = makeCatalog(9, [
    { key: 'gamma_item', status: 'active' }
  ]);
  const discarded = controller.discard();
  assert.equal(getIdReads(), 2);
  assert.deepEqual(plain(discarded), {
    draft_schema_version: 'midas.activity-session-draft.v1',
    request_id: UUIDS[1],
    catalog_version: 9,
    revision: 0,
    started_at: null,
    note: null,
    items: []
  });
  assert.notEqual(discarded.request_id, dirty.request_id);
  assertFrozenTree(discarded);
  controller.addItem('gamma_item');
  assertDraftError(() => controller.addItem('alpha_item'), 'UNKNOWN_ITEM_KEY');

  holder.catalog = { catalog_version: 10, entries: {} };
  const beforeBadCatalog = controller.getSnapshot();
  assertDraftError(() => controller.discard(), 'INVALID_CATALOG');
  assert.equal(controller.getSnapshot(), beforeBadCatalog);
  assert.equal(getIdReads(), 2);
});

test('discard rejects repeated or failing IDs without partially replacing state', () => {
  const semantics = makeSemantics(() => makeCatalog());
  const { api } = loadDraft({ semantics });
  const sameId = api.create({
    semantics,
    now: () => 0,
    createRequestId: () => UUIDS[0]
  });
  sameId.setNote('dirty');
  let before = sameId.getSnapshot();
  assertDraftError(() => sameId.discard(), 'INVALID_REQUEST_ID');
  assert.equal(sameId.getSnapshot(), before);

  let reads = 0;
  const failingId = api.create({
    semantics,
    now: () => 0,
    createRequestId() {
      reads += 1;
      if (reads === 1) return UUIDS[0];
      throw new Error('private generator failure');
    }
  });
  failingId.addItem('alpha_item');
  before = failingId.getSnapshot();
  assertDraftError(() => failingId.discard(), 'INVALID_REQUEST_ID');
  assert.equal(failingId.getSnapshot(), before);
});

test('runtime remains isolated from product, persistence, network and R2 data access', () => {
  const forbidden = [
    /\bfetch\b/,
    /XMLHttpRequest/,
    /WebSocket/,
    /EventSource/,
    /\bindexedDB\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bcaches\b/,
    /serviceWorker/,
    /\bdataAccess\b/,
    /commitSession/,
    /loadLastPerformance/,
    /beforeunload/,
    /pagehide/,
    /catalog_version\s*:\s*1\b/,
    /\b78\b/
  ];
  forbidden.forEach((pattern) => assert.doesNotMatch(source, pattern));
  assert.doesNotMatch(fs.readFileSync(indexPath, 'utf8'), /session-draft\.js/);
  assert.doesNotThrow(() => new vm.Script(source, { filename: draftPath }));
});
