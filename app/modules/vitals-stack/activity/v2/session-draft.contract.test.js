'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const draftPath = path.join(__dirname, 'session-draft.js');
const semanticsPath = path.join(__dirname, 'semantics.js');
const semanticsV2Path = path.join(__dirname, 'semantics-v2.js');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const source = fs.readFileSync(draftPath, 'utf8');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const semanticsV2Source = fs.readFileSync(semanticsV2Path, 'utf8');
const SAFE_MESSAGE = 'The activity session draft operation could not be completed.';
const UUIDS = [
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003'
];

function makeFields(overrides = {}) {
  return {
    assistance_kg: 'forbidden',
    distance_km: 'forbidden',
    distance_m: 'forbidden',
    duration_min: 'forbidden',
    duration_sec: 'forbidden',
    note: 'optional',
    reps: 'required',
    weight_kg: 'forbidden',
    ...overrides
  };
}

function makeEntry(
  key,
  status = 'active',
  trackingMode = 'strength_sets',
  fields = makeFields()
) {
  return { key, status, tracking_mode: trackingMode, fields };
}

function makeCatalog(version = 7, entries = null) {
  return {
    catalog_version: version,
    entries: entries || [
      makeEntry('alpha_item'),
      makeEntry(
        'beta_item',
        'active',
        'strength_sets',
        makeFields({ weight_kg: 'optional' })
      ),
      makeEntry(
        'run_item',
        'active',
        'duration_distance',
        makeFields({
          distance_km: 'optional',
          duration_min: 'required',
          reps: 'forbidden'
        })
      ),
      makeEntry('old_item', 'deprecated')
    ]
  };
}

function emptySet(setOrder) {
  return {
    set_order: setOrder,
    reps: null,
    duration_sec: null,
    distance_m: null,
    weight_kg: null,
    assistance_kg: null
  };
}

function strengthItem(itemKey, itemOrder, setCount = 3) {
  return {
    item_key: itemKey,
    item_order: itemOrder,
    duration_min: null,
    distance_km: null,
    note: null,
    sets: Array.from({ length: setCount }, (_, index) => emptySet(index + 1))
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

  assert.deepEqual(Object.keys(api), ['create', 'restore']);
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
    'discard',
    'addSet',
    'removeSet',
    'setSetField',
    'setItemField'
  ]);
  assert.deepEqual(Object.keys(snapshot), [
    'draft_schema_version',
    'request_id',
    'catalog_version',
    'revision',
    'started_at',
    'note',
    'items'
  ]);
  assert.deepEqual(plain(snapshot), {
    draft_schema_version: 'midas.activity-session-draft.v3',
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

test('restore preserves an exact mixed draft by reference without replaying dependencies', () => {
  const started = Date.UTC(2026, 7, 8, 9, 10, 11, 120);
  const { api, controller, semantics } = createController({
    now: () => started
  });
  controller.addItem('alpha_item');
  controller.setSetField('alpha_item', 1, 'reps', '0012');
  controller.setItemField('alpha_item', 'note', '  strength raw  ');
  controller.addItem('run_item');
  controller.setItemField('run_item', 'duration_min', '1e2');
  controller.setItemField('run_item', 'distance_km', '05,20');
  controller.setNote('  Mixed session 😀  ');
  controller.moveItem('run_item', 1);

  const storedSnapshot = plain(controller.getSnapshot());
  const expected = plain(storedSnapshot);
  let idReads = 0;
  let nowReads = 0;
  const restored = api.restore(storedSnapshot, {
    semantics,
    now: () => {
      nowReads += 1;
      return started + 65_432;
    },
    createRequestId: () => {
      idReads += 1;
      return UUIDS[1];
    }
  });

  assert.equal(idReads, 0);
  assert.equal(nowReads, 0);
  assert.deepEqual(Object.keys(restored), [
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
  assert.equal(restored.getSnapshot(), storedSnapshot);
  assert.deepEqual(plain(restored.getSnapshot()), expected);
  assertFrozenTree(storedSnapshot);
  assert.deepEqual(plain(restored.getTimerSnapshot()), {
    running: true,
    elapsed_ms: 65_432,
    label: '01:05'
  });
  assert.equal(nowReads, 1);

  const beforeMutation = restored.getSnapshot();
  const mutated = restored.setItemField('run_item', 'duration_min', ' 2,5 ');
  assert.notEqual(mutated, beforeMutation);
  assert.equal(mutated.request_id, expected.request_id);
  assert.equal(mutated.catalog_version, expected.catalog_version);
  assert.equal(mutated.started_at, expected.started_at);
  assert.equal(mutated.revision, expected.revision + 1);
  assert.equal(mutated.items[0].duration_min, ' 2,5 ');
  assert.equal(idReads, 0);
  assert.equal(nowReads, 1);

  const discarded = restored.discard();
  assert.equal(idReads, 1);
  assert.deepEqual(plain(discarded), {
    draft_schema_version: 'midas.activity-session-draft.v3',
    request_id: UUIDS[1],
    catalog_version: 7,
    revision: 0,
    started_at: null,
    note: null,
    items: []
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
  assert.deepEqual(
    plain(controller.addItem(firstActive.key).items),
    [strengthItem(firstActive.key, 1)]
  );
});

test('all eight real R1 strength policies initialize and expose only allowed fields', () => {
  const context = vm.createContext({});
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  vm.runInContext(source, context, { filename: draftPath });
  const semantics = context.AppModules.activityV2.semantics;
  const catalog = semantics.getCatalog();
  const setFields = [
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ];
  const representatives = new Map();
  catalog.entries
    .filter(
      (entry) => entry.status === 'active' && entry.tracking_mode === 'strength_sets'
    )
    .forEach((entry) => {
      const signature = setFields.map((key) => entry.fields[key]).join('|');
      if (!representatives.has(signature)) representatives.set(signature, entry);
    });
  assert.equal(representatives.size, 8);

  const controller = context.AppModules.activityV2.sessionDraft.create({
    semantics,
    now: () => 0,
    createRequestId: () => UUIDS[0]
  });
  for (const entry of representatives.values()) controller.addItem(entry.key);
  const nonStrength = catalog.entries.find(
    (entry) => entry.status === 'active' && entry.tracking_mode !== 'strength_sets'
  );
  controller.addItem(nonStrength.key);
  assert.deepEqual(
    plain(controller.getSnapshot().items.at(-1).sets),
    []
  );

  for (const entry of representatives.values()) {
    for (const fieldKey of setFields) {
      const before = controller.getSnapshot();
      if (entry.fields[fieldKey] === 'forbidden') {
        assertDraftError(
          () => controller.setSetField(entry.key, 1, fieldKey, '1e2'),
          'FORBIDDEN_SET_FIELD'
        );
        assert.equal(controller.getSnapshot(), before);
      } else {
        const next = controller.setSetField(entry.key, 1, fieldKey, '1e2');
        const item = next.items.find((candidate) => candidate.item_key === entry.key);
        assert.equal(item.sets[0][fieldKey], '1e2');
      }
    }
  }
  assertFrozenTree(controller.getSnapshot());
});

test('all eleven real catalog-v2 non-strength entries obey their item policies', () => {
  const context = vm.createContext({});
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  vm.runInContext(semanticsV2Source, context, { filename: semanticsV2Path });
  vm.runInContext(source, context, { filename: draftPath });
  const semantics = context.AppModules.activityV2.semanticsV2;
  const entries = semantics.getCatalog().entries.filter(
    (entry) =>
      entry.status === 'active' && entry.tracking_mode !== 'strength_sets'
  );
  assert.deepEqual(
    plain(entries.map((entry) => [entry.key, entry.tracking_mode])),
    [
      ['cross_trainer', 'duration'],
      ['cycling', 'duration_distance'],
      ['football', 'duration'],
      ['hiking', 'duration_distance'],
      ['jump_rope', 'duration'],
      ['rowing', 'duration_distance'],
      ['running', 'duration_distance'],
      ['ski_erg', 'duration_distance'],
      ['stair_climber', 'duration'],
      ['swimming', 'duration_distance'],
      ['walking', 'duration_distance']
    ]
  );

  const controller = context.AppModules.activityV2.sessionDraft.create({
    semantics,
    now: () => 0,
    createRequestId: () => UUIDS[0]
  });
  entries.forEach((entry) => controller.addItem(entry.key));

  entries.forEach((entry, index) => {
    const initialItem = controller.getSnapshot().items[index];
    assert.deepEqual(Object.keys(initialItem), [
      'item_key',
      'item_order',
      'duration_min',
      'distance_km',
      'note',
      'sets'
    ]);
    assert.equal(entry.fields.duration_min, 'required');
    assert.equal(entry.fields.note, 'optional');
    [
      'assistance_kg',
      'distance_m',
      'duration_sec',
      'reps',
      'weight_kg'
    ].forEach((fieldKey) => {
      assert.equal(entry.fields[fieldKey], 'forbidden');
    });
    assert.deepEqual(plain(initialItem), {
      item_key: entry.key,
      item_order: index + 1,
      duration_min: null,
      distance_km: null,
      note: null,
      sets: []
    });

    controller.setItemField(entry.key, 'duration_min', '1e2');
    controller.setItemField(entry.key, 'note', `  ${entry.key}  `);
    if (entry.tracking_mode === 'duration_distance') {
      assert.equal(entry.fields.distance_km, 'optional');
      controller.setItemField(entry.key, 'distance_km', '05,20');
    } else {
      assert.equal(entry.fields.distance_km, 'forbidden');
      const before = controller.getSnapshot();
      assertDraftError(
        () => controller.setItemField(entry.key, 'distance_km', '5'),
        'FORBIDDEN_ITEM_FIELD'
      );
      assert.equal(controller.getSnapshot(), before);
    }
  });

  entries.forEach((entry) => {
    const item = controller.getSnapshot().items.find(
      (candidate) => candidate.item_key === entry.key
    );
    assert.equal(item.duration_min, '1e2');
    assert.equal(item.note, `  ${entry.key}  `);
    assert.equal(
      item.distance_km,
      entry.tracking_mode === 'duration_distance' ? '05,20' : null
    );
    assert.deepEqual(plain(item.sets), []);
  });
  assertFrozenTree(controller.getSnapshot());

  const storedSnapshot = plain(controller.getSnapshot());
  let dependencyReads = 0;
  const restored = context.AppModules.activityV2.sessionDraft.restore(
    storedSnapshot,
    {
      semantics,
      now: () => {
        dependencyReads += 1;
        return 0;
      },
      createRequestId: () => {
        dependencyReads += 1;
        return UUIDS[1];
      }
    }
  );
  assert.equal(dependencyReads, 0);
  assert.equal(restored.getSnapshot(), storedSnapshot);
  assert.deepEqual(plain(restored.getSnapshot()), plain(controller.getSnapshot()));
  assertFrozenTree(restored.getSnapshot());
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
    makeCatalog(2, [makeEntry('Bad Key')]),
    makeCatalog(2, [
      makeEntry('duplicate'),
      makeEntry('duplicate')
    ]),
    makeCatalog(2, [makeEntry('alpha_item', 'unknown')]),
    makeCatalog(2, [{ ...makeEntry('alpha_item'), tracking_mode: 'unknown' }]),
    makeCatalog(2, [{ ...makeEntry('alpha_item'), fields: { reps: 'required' } }]),
    makeCatalog(2, [makeEntry(
      'alpha_item',
      'active',
      'strength_sets',
      makeFields({ reps: 'forbidden' })
    )])
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

test('restore options are exact and restoration does not require ID generation', () => {
  const semantics = makeSemantics(() => makeCatalog());
  const sourceApi = loadDraft({ semantics }).api;
  const pristine = plain(sourceApi.create({
    semantics,
    createRequestId: () => UUIDS[0]
  }).getSnapshot());
  const api = loadDraft({ semantics }).api;

  assertDraftError(() => api.restore(pristine, null), 'INVALID_OPTIONS');
  assertDraftError(
    () => api.restore(pristine, { semantics, extra: true }),
    'INVALID_OPTIONS'
  );
  assertDraftError(
    () => api.restore(pristine, { semantics, now: 'later' }),
    'INVALID_CLOCK'
  );
  assertDraftError(
    () => api.restore(pristine, { semantics, createRequestId: 1 }),
    'INVALID_REQUEST_ID'
  );

  const restored = api.restore(pristine, { semantics });
  assert.equal(restored.getSnapshot(), pristine);
  assertFrozenTree(pristine);
  const noteOnly = restored.setNote('note-only draft');
  assert.equal(noteOnly.revision, 1);
  assert.equal(noteOnly.started_at, null);
  const restoredNoteOnly = api.restore(plain(noteOnly), {
    semantics,
    createRequestId: () => UUIDS[1]
  });
  assert.deepEqual(plain(restoredNoteOnly.getSnapshot()), plain(noteOnly));
  assertDraftError(() => restored.discard(), 'REQUEST_ID_UNAVAILABLE');
  assert.equal(restored.getSnapshot(), noteOnly);
});

test('restore rejects non-canonical draft, item, set and raw-value states atomically', () => {
  const { api, controller, semantics } = createController({
    now: () => Date.UTC(2026, 7, 8, 12, 0, 0)
  });
  controller.addItem('alpha_item');
  const valid = plain(controller.getSnapshot());
  const options = {
    semantics,
    now: () => 0,
    createRequestId: () => UUIDS[1]
  };
  const invalidCases = [
    (draft) => { draft.draft_schema_version = 'midas.activity-session-draft.v2'; },
    (draft) => {
      draft.request_id = 'ABCDEFAB-CDEF-4ABC-8DEF-ABCDEFABCDEF';
    },
    (draft) => { draft.revision = -1; },
    (draft) => { draft.revision = Number.MAX_SAFE_INTEGER + 1; },
    (draft) => { draft.started_at = '2026-08-08T12:00:00Z'; },
    (draft) => { draft.note = ''; },
    (draft) => { draft.note = ' untrimmed '; },
    (draft) => { draft.items.extra = true; },
    (draft) => { draft.items[0].item_order = 2; },
    (draft) => { draft.items[0].item_key = 'old_item'; },
    (draft) => { draft.items[0].duration_min = '1'; },
    (draft) => { draft.items[0].note = ''; },
    (draft) => { draft.items[0].note = '😀'.repeat(501); },
    (draft) => { draft.items[0].sets = []; },
    (draft) => { draft.items[0].sets[0].set_order = 2; },
    (draft) => { draft.items[0].sets[0].duration_sec = '30'; },
    (draft) => { draft.items[0].sets[0].reps = ''; },
    (draft) => { draft.items[0].sets[0].reps = '😀'.repeat(33); },
    (draft) => { draft.items[0].sets[0].extra = null; }
  ];

  invalidCases.forEach((mutate) => {
    const candidate = plain(valid);
    mutate(candidate);
    assertDraftError(() => api.restore(candidate, options), 'INVALID_DRAFT_STATE');
    assert.equal(Object.isFrozen(candidate), false);
    assert.equal(Object.isFrozen(candidate.items), false);
  });

  const reordered = {
    request_id: valid.request_id,
    draft_schema_version: valid.draft_schema_version,
    catalog_version: valid.catalog_version,
    revision: valid.revision,
    started_at: valid.started_at,
    note: valid.note,
    items: valid.items
  };
  assertDraftError(() => api.restore(reordered, options), 'INVALID_DRAFT_STATE');

  const duplicate = plain(valid);
  duplicate.items.push({
    ...plain(duplicate.items[0]),
    item_order: 2
  });
  assertDraftError(() => api.restore(duplicate, options), 'INVALID_DRAFT_STATE');

  const pristineWithItems = plain(valid);
  pristineWithItems.revision = 0;
  assertDraftError(
    () => api.restore(pristineWithItems, options),
    'INVALID_DRAFT_STATE'
  );

  const missingStart = plain(valid);
  missingStart.started_at = null;
  assertDraftError(() => api.restore(missingStart, options), 'INVALID_DRAFT_STATE');

  const wrongCatalog = plain(valid);
  wrongCatalog.catalog_version += 1;
  assertDraftError(
    () => api.restore(wrongCatalog, options),
    'CATALOG_VERSION_MISMATCH'
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
    strengthItem('alpha_item', 1)
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
    strengthItem('beta_item', 1),
    strengthItem('alpha_item', 2)
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

test('catalog policy drives exact strength defaults and keeps non-strength sets empty', () => {
  const { controller } = createController();
  const strength = controller.addItem('alpha_item');
  assert.deepEqual(plain(strength.items[0]), strengthItem('alpha_item', 1));
  assertFrozenTree(strength.items[0]);

  const mixed = controller.addItem('run_item');
  assert.deepEqual(plain(mixed.items[1]), {
    item_key: 'run_item',
    item_order: 2,
    duration_min: null,
    distance_km: null,
    note: null,
    sets: []
  });
  assertFrozenTree(mixed.items[1]);

  const before = controller.getSnapshot();
  assertDraftError(() => controller.addSet('run_item'), 'SETS_UNAVAILABLE');
  assertDraftError(() => controller.removeSet('run_item', 1), 'SETS_UNAVAILABLE');
  assertDraftError(
    () => controller.setSetField('run_item', 1, 'reps', '12'),
    'SETS_UNAVAILABLE'
  );
  assert.equal(controller.getSnapshot(), before);
});

test('item field mutations preserve raw text, canonical no-ops and error precedence', () => {
  const { controller } = createController();
  controller.addItem('run_item');
  controller.addItem('beta_item');
  const initial = controller.getSnapshot();
  const runSets = initial.items[0].sets;

  const duration = controller.setItemField('run_item', 'duration_min', '1e2');
  assert.equal(duration.items[0].duration_min, '1e2');
  assert.equal(duration.items[0].sets, runSets);
  assert.equal(duration.revision, initial.revision + 1);
  assert.equal(
    controller.setItemField('run_item', 'duration_min', '1e2'),
    duration
  );

  const distance = controller.setItemField('run_item', 'distance_km', '05,20');
  assert.equal(distance.items[0].distance_km, '05,20');
  const whitespaceNote = controller.setItemField('run_item', 'note', '  note  ');
  assert.equal(whitespaceNote.items[0].note, '  note  ');
  const unicodeNote = controller.setItemField(
    'run_item',
    'note',
    '\u{1F600}'.repeat(500)
  );
  assert.equal(Array.from(unicodeNote.items[0].note).length, 500);
  const unicode = controller.setItemField(
    'run_item',
    'duration_min',
    '\u{1F600}'.repeat(32)
  );
  assert.equal(Array.from(unicode.items[0].duration_min).length, 32);
  const cleared = controller.setItemField('run_item', 'duration_min', '');
  assert.equal(cleared.items[0].duration_min, null);
  assert.equal(controller.setItemField('run_item', 'duration_min', ''), cleared);

  const cases = [
    [() => controller.setItemField('Bad Key', 'note', 'x'), 'INVALID_ITEM_KEY'],
    [
      () => controller.setItemField('missing_item', 'note', 'x'),
      'ITEM_NOT_FOUND'
    ],
    [
      () => controller.setItemField('run_item', 'unknown', null),
      'INVALID_ITEM_FIELD'
    ],
    [
      () => controller.setItemField('beta_item', 'duration_min', null),
      'FORBIDDEN_ITEM_FIELD'
    ],
    [
      () => controller.setItemField('run_item', 'duration_min', null),
      'INVALID_ITEM_VALUE'
    ],
    [
      () => controller.setItemField('run_item', 'distance_km', '\u{1F600}'.repeat(33)),
      'INVALID_ITEM_VALUE'
    ],
    [
      () => controller.setItemField('run_item', 'note', '\u{1F600}'.repeat(501)),
      'INVALID_ITEM_VALUE'
    ]
  ];
  cases.forEach(([action, code]) => {
    const before = controller.getSnapshot();
    assertDraftError(action, code);
    assert.equal(controller.getSnapshot(), before);
  });
  assertFrozenTree(controller.getSnapshot());
});

test('set field mutations preserve raw text, canonical no-ops and safe error precedence', () => {
  const { controller } = createController();
  const initial = controller.addItem('beta_item');
  const untouchedSet = initial.items[0].sets[1];

  const reps = controller.setSetField('beta_item', 1, 'reps', '0012');
  assert.equal(reps.items[0].sets[0].reps, '0012');
  assert.equal(reps.items[0].sets[1], untouchedSet);
  assert.equal(reps.revision, initial.revision + 1);
  assert.equal(controller.setSetField('beta_item', 1, 'reps', '0012'), reps);

  const weight = controller.setSetField('beta_item', 1, 'weight_kg', '77,50');
  assert.equal(weight.items[0].sets[0].weight_kg, '77,50');
  const unicode = controller.setSetField('beta_item', 2, 'reps', '😀'.repeat(32));
  assert.equal(Array.from(unicode.items[0].sets[1].reps).length, 32);
  const cleared = controller.setSetField('beta_item', 1, 'weight_kg', '');
  assert.equal(cleared.items[0].sets[0].weight_kg, null);
  assert.equal(controller.setSetField('beta_item', 1, 'weight_kg', ''), cleared);

  const cases = [
    [() => controller.addSet('Bad Key'), 'INVALID_ITEM_KEY'],
    [() => controller.addSet('missing_item'), 'ITEM_NOT_FOUND'],
    [() => controller.removeSet('beta_item', 0), 'INVALID_SET_ORDER'],
    [() => controller.removeSet('beta_item', 1.5), 'INVALID_SET_ORDER'],
    [() => controller.removeSet('beta_item', 51), 'INVALID_SET_ORDER'],
    [() => controller.removeSet('beta_item', 4), 'SET_NOT_FOUND'],
    [() => controller.setSetField('beta_item', 0, 'unknown', null), 'INVALID_SET_ORDER'],
    [() => controller.setSetField('beta_item', 4, 'unknown', null), 'SET_NOT_FOUND'],
    [() => controller.setSetField('beta_item', 1, 'unknown', '12'), 'INVALID_SET_FIELD'],
    [() => controller.setSetField('beta_item', 1, 'duration_sec', '12'), 'FORBIDDEN_SET_FIELD'],
    [() => controller.setSetField('beta_item', 1, 'reps', null), 'INVALID_SET_VALUE'],
    [() => controller.setSetField('beta_item', 1, 'reps', '😀'.repeat(33)), 'INVALID_SET_VALUE']
  ];
  cases.forEach(([action, code]) => {
    const before = controller.getSnapshot();
    assertDraftError(action, code);
    assert.equal(controller.getSnapshot(), before);
  });
  assertFrozenTree(controller.getSnapshot());
});

test('set add and remove enforce 1..50, reindex exactly and keep values', () => {
  let controller = createController().controller;
  controller.addItem('alpha_item');
  controller.setSetField('alpha_item', 2, 'reps', '20');
  const beforeAdd = controller.getSnapshot();
  const added = controller.addSet('alpha_item');
  assert.equal(added.items[0].sets.length, 4);
  assert.equal(added.items[0].sets[0], beforeAdd.items[0].sets[0]);
  assert.deepEqual(plain(added.items[0].sets[3]), emptySet(4));

  const removed = controller.removeSet('alpha_item', 1);
  assert.deepEqual(
    plain(removed.items[0].sets).map((set) => [set.set_order, set.reps]),
    [[1, '20'], [2, null], [3, null]]
  );
  controller.removeSet('alpha_item', 3);
  const minimum = controller.removeSet('alpha_item', 2);
  assert.equal(minimum.items[0].sets.length, 1);
  const beforeMinimumError = controller.getSnapshot();
  assertDraftError(
    () => controller.removeSet('alpha_item', 1),
    'SET_MINIMUM_REACHED'
  );
  assert.equal(controller.getSnapshot(), beforeMinimumError);

  controller = createController().controller;
  controller.addItem('alpha_item');
  for (let index = 3; index < 50; index += 1) controller.addSet('alpha_item');
  const full = controller.getSnapshot();
  assert.equal(full.items[0].sets.length, 50);
  assert.deepEqual(
    plain(full.items[0].sets).map((set) => set.set_order),
    Array.from({ length: 50 }, (_, index) => index + 1)
  );
  assertDraftError(() => controller.addSet('alpha_item'), 'SET_LIMIT_REACHED');
  assert.equal(controller.getSnapshot(), full);
});

test('all snapshot rebuilds preserve complete item and set records until removal', () => {
  const { controller } = createController();
  controller.addItem('alpha_item');
  controller.setItemField('alpha_item', 'note', 'alpha note');
  controller.setSetField('alpha_item', 1, 'reps', '12');
  const alphaBeforeAdd = controller.getSnapshot().items[0];
  controller.addItem('beta_item');
  assert.equal(controller.getSnapshot().items[0], alphaBeforeAdd);
  controller.setItemField('beta_item', 'note', 'beta note');
  controller.setSetField('beta_item', 2, 'reps', '9');
  controller.setSetField('beta_item', 2, 'weight_kg', '42,5');

  const beforeNote = controller.getSnapshot();
  const noted = controller.setNote('stable');
  assert.equal(noted.items[0], beforeNote.items[0]);
  assert.equal(noted.items[1], beforeNote.items[1]);

  const alphaSets = noted.items[0].sets;
  const betaSets = noted.items[1].sets;
  const moved = controller.moveItem('beta_item', 1);
  assert.equal(moved.items[0].sets, betaSets);
  assert.equal(moved.items[1].sets, alphaSets);
  assert.equal(moved.items[0].sets[1].reps, '9');
  assert.equal(moved.items[0].sets[1].weight_kg, '42,5');
  assert.equal(moved.items[1].sets[0].reps, '12');
  assert.equal(moved.items[0].note, 'beta note');
  assert.equal(moved.items[1].note, 'alpha note');
  assert.equal(moved.items[0].duration_min, null);
  assert.equal(moved.items[0].distance_km, null);

  controller.addItem('run_item');
  controller.setItemField('run_item', 'duration_min', '45');
  controller.setItemField('run_item', 'distance_km', '7,25');
  controller.setItemField('run_item', 'note', 'run note');
  const runBeforeSetRebuild = controller.getSnapshot().items[2];
  controller.addSet('beta_item');
  assert.equal(controller.getSnapshot().items[2], runBeforeSetRebuild);
  controller.removeSet('beta_item', 4);
  assert.equal(controller.getSnapshot().items[2], runBeforeSetRebuild);
  const runMoved = controller.moveItem('run_item', 1);
  assert.deepEqual(plain(runMoved.items[0]), {
    item_key: 'run_item',
    item_order: 1,
    duration_min: '45',
    distance_km: '7,25',
    note: 'run note',
    sets: []
  });
  controller.removeItem('run_item');
  assert.equal(controller.getSnapshot().items[0].sets[1].weight_kg, '42,5');
  const freshRun = controller.addItem('run_item');
  assert.deepEqual(
    plain(freshRun.items.find((item) => item.item_key === 'run_item')),
    {
      item_key: 'run_item',
      item_order: 3,
      duration_min: null,
      distance_km: null,
      note: null,
      sets: []
    }
  );
  controller.removeItem('run_item');
  controller.removeItem('alpha_item');
  const readded = controller.addItem('alpha_item');
  const freshAlpha = readded.items.find((item) => item.item_key === 'alpha_item');
  assert.deepEqual(plain(freshAlpha.sets), [emptySet(1), emptySet(2), emptySet(3)]);
  assert.equal(freshAlpha.note, null);
  assert.equal(freshAlpha.duration_min, null);
  assert.equal(freshAlpha.distance_km, null);
  assert.equal(readded.items[0].sets[1].weight_kg, '42,5');
});

test('captured catalog policy rejects live semantic drift before item creation', () => {
  const { controller, holder } = createController();
  holder.catalog = makeCatalog(7, [
    makeEntry(
      'alpha_item',
      'active',
      'strength_sets',
      makeFields({ weight_kg: 'optional' })
    )
  ]);
  const pristine = controller.getSnapshot();
  assertDraftError(() => controller.addItem('alpha_item'), 'INVALID_CATALOG');
  assert.equal(controller.getSnapshot(), pristine);

  holder.catalog = makeCatalog(7, [makeEntry('alpha_item', 'deprecated')]);
  assertDraftError(() => controller.addItem('alpha_item'), 'INVALID_CATALOG');
  assert.equal(controller.getSnapshot(), pristine);
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

test('set and item mutations honor the revision ceiling after canonical no-ops', () => {
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
  controller.addItem('alpha_item');
  const atLimit = controller.setSetField('alpha_item', 1, 'reps', '12');
  assert.equal(atLimit.revision, 2);
  assert.equal(controller.setSetField('alpha_item', 1, 'reps', '12'), atLimit);
  assert.equal(controller.setItemField('alpha_item', 'note', ''), atLimit);
  for (const action of [
    () => controller.setSetField('alpha_item', 1, 'reps', '13'),
    () => controller.setItemField('alpha_item', 'note', 'note'),
    () => controller.addSet('alpha_item'),
    () => controller.removeSet('alpha_item', 1)
  ]) {
    assertDraftError(action, 'REVISION_LIMIT_REACHED');
    assert.equal(controller.getSnapshot(), atLimit);
  }
});

test('the 50-item boundary rejects overflow without changing the draft', () => {
  const entries = Array.from({ length: 51 }, (_, index) => ({
    ...makeEntry(`item_${String(index + 1).padStart(2, '0')}`)
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
  controller.setSetField('alpha_item', 1, 'reps', '12');
  controller.setNote('note');
  const dirty = controller.getSnapshot();

  holder.catalog = makeCatalog(9, [
    makeEntry('gamma_item')
  ]);
  const discarded = controller.discard();
  assert.equal(getIdReads(), 2);
  assert.deepEqual(plain(discarded), {
    draft_schema_version: 'midas.activity-session-draft.v3',
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

test('runtime remains isolated from persistence, network and R2 data access', () => {
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
  assert.match(fs.readFileSync(indexPath, 'utf8'), /session-draft\.js/);
  assert.doesNotThrow(() => new vm.Script(source, { filename: draftPath }));
});
