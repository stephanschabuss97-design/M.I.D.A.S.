'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const semanticsPath = path.join(__dirname, 'semantics.js');
const semanticsV2Path = path.join(__dirname, 'semantics-v2.js');
const canonicalizationPath = path.join(
  __dirname,
  'session-canonicalization.js'
);
const correctionPath = path.join(__dirname, 'session-correction.js');
const sources = [
  semanticsPath,
  semanticsV2Path,
  canonicalizationPath,
  correctionPath
].map((filePath) => [filePath, fs.readFileSync(filePath, 'utf8')]);
const FINGERPRINT = 'a'.repeat(64);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function uuidFor(number) {
  return `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
}

function makeHarness() {
  const activityV1 = { sentinel: true };
  const context = vm.createContext({
    AppModules: { activity: activityV1 },
    console
  });
  sources.forEach(([filePath, source]) => {
    new vm.Script(source, { filename: filePath }).runInContext(context);
  });
  return {
    activityV1,
    context,
    canonicalization: context.AppModules.activityV2.sessionCanonicalization,
    correction: context.AppModules.activityV2.sessionCorrection
  };
}

function snapshotItem(entry, itemOrder, values = {}) {
  const strength = entry.tracking_mode === 'strength_sets';
  return {
    item_key: entry.key,
    item_order: itemOrder,
    item_label_snapshot: entry.label,
    tracking_mode_snapshot: entry.tracking_mode,
    equipment_snapshot: entry.equipment,
    load_comparability_snapshot: entry.load_comparability,
    field_policy_snapshot: clone(entry.fields),
    duration_min: strength ? null : 30,
    distance_km: entry.tracking_mode === 'duration_distance' ? 5.25 : null,
    note: null,
    sets: strength
      ? [
          {
            set_order: 1,
            tracking_mode: 'strength_sets',
            reps: 10,
            duration_sec: null,
            distance_m: null,
            weight_kg: entry.fields.weight_kg === 'forbidden' ? null : 80,
            assistance_kg: null
          }
        ]
      : [],
    ...values
  };
}

function makeDetail(context, catalogVersion = 2) {
  const semantics =
    catalogVersion === 2
      ? context.AppModules.activityV2.semanticsV2
      : context.AppModules.activityV2.semantics;
  const running = semantics.getEntryByKey('running');
  const bench = semantics.getEntryByKey('bench_press');
  const historicalBench = snapshotItem(bench, 2, {
    item_label_snapshot: 'Historical Press',
    equipment_snapshot: 'barbell',
    load_comparability_snapshot: 'standardized',
    note: 'Saved snapshot'
  });
  return {
    schema_version: 'midas.activity-session-detail.v1',
    session_id: uuidFor(900),
    catalog_version: catalogVersion,
    revision: '7',
    content_fingerprint: FINGERPRINT,
    started_at: '2026-07-31T10:00:00.000Z',
    ended_at: '2026-07-31T10:30:00.000Z',
    day: '2026-07-31',
    title: 'Immutable title',
    duration_min: 30,
    note: null,
    items: [snapshotItem(running, 1), historicalBench]
  };
}

function captureError(callback) {
  try {
    callback();
  } catch (error) {
    return error;
  }
  assert.fail('expected operation to throw');
}

test('S4.2 namespaces are exact, immutable and remain product-isolated', () => {
  const harness = makeHarness();
  assert.equal(harness.context.AppModules.activity, harness.activityV1);
  assert.deepEqual(Object.keys(harness.canonicalization), ['project']);
  assert.deepEqual(Object.keys(harness.correction), ['create']);
  assert.equal(Object.isFrozen(harness.canonicalization), true);
  assert.equal(Object.isFrozen(harness.correction), true);

  const controller = harness.correction.create(makeDetail(harness.context));
  assert.deepEqual(Object.keys(controller), [
    'getState',
    'setDurationMin',
    'setNote',
    'addItem',
    'removeItem',
    'moveItem',
    'setItemField',
    'addSet',
    'removeSet',
    'setSetField'
  ]);
  assert.equal(Object.isFrozen(controller), true);

  const rootIndex = fs.readFileSync(
    path.resolve(__dirname, '../../../../..', 'index.html'),
    'utf8'
  );
  assert.equal(rootIndex.includes('session-canonicalization.js'), false);
  assert.equal(rootIndex.includes('session-correction.js'), false);
  const implementation = sources
    .filter(([filePath]) =>
      [canonicalizationPath, correctionPath].includes(filePath)
    )
    .map(([, source]) => source)
    .join('\n');
  [
    /\bfetch\s*\(/,
    /\bindexedDB\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /commitIntent/,
    /sessionDraft/,
    /AppModules\.activity(?!V2)/
  ].forEach((pattern) =>
    assert.equal(pattern.test(implementation), false, String(pattern))
  );
});

test('T-ACT-R9-03 preserves immutable identity and snapshots while editing only mutable fields', () => {
  const harness = makeHarness();
  const detail = makeDetail(harness.context, 2);
  const controller = harness.correction.create(detail);
  const initial = controller.getState();

  assert.equal(initial.status, 'pristine');
  assert.equal(initial.valid, true);
  assert.equal(initial.workingCopy.catalog_version, 2);
  assert.equal(initial.workingCopy.items[1].item_label_snapshot, 'Historical Press');
  assert.equal(initial.workingCopy.items[1].equipment_snapshot, 'barbell');
  assert.equal(
    initial.workingCopy.items[1].load_comparability_snapshot,
    'standardized'
  );
  assert.equal(Object.isFrozen(initial), true);
  assert.equal(Object.isFrozen(initial.workingCopy.items[1].sets[0]), true);
  assert.equal(Object.hasOwn(initial.workingCopy.items[0], 'id'), false);
  assert.equal(Object.hasOwn(initial.workingCopy.items[0], 'catalog_version'), false);

  controller.setDurationMin(35);
  controller.setNote('  corrected  ');
  controller.setItemField('running', 'duration_min', 35);
  controller.setItemField('running', 'distance_km', 6.5);
  controller.moveItem('bench_press', 1);
  const edited = controller.getState();
  assert.equal(edited.status, 'dirty');
  assert.equal(edited.valid, true);
  assert.equal(edited.workingCopy.note, 'corrected');
  assert.equal(edited.workingCopy.items[0].item_key, 'bench_press');
  assert.equal(edited.workingCopy.items[0].item_label_snapshot, 'Historical Press');
  assert.equal(edited.mutationRequest.expectedRevision, '7');
  assert.equal(edited.mutationRequest.expectedContentFingerprint, FINGERPRINT);

  controller.removeItem('bench_press');
  controller.addItem('bench_press');
  const restoredExisting = controller.getState().workingCopy.items.at(-1);
  assert.equal(restoredExisting.item_label_snapshot, 'Historical Press');
  assert.equal(restoredExisting.equipment_snapshot, 'barbell');

  controller.addItem('high_row');
  const incomplete = controller.getState();
  const highRow = incomplete.workingCopy.items.at(-1);
  const catalogHighRow = harness.context.AppModules.activityV2.semanticsV2
    .getEntryByKey('high_row');
  assert.equal(incomplete.valid, false);
  assert.equal(incomplete.mutationRequest, null);
  assert.equal(highRow.item_label_snapshot, catalogHighRow.label);
  assert.equal(highRow.equipment_snapshot, catalogHighRow.equipment);
  assert.deepEqual(clone(highRow.field_policy_snapshot), clone(catalogHighRow.fields));
  controller.setSetField('high_row', 1, 'reps', 12);
  controller.setSetField('high_row', 1, 'weight_kg', 55);
  assert.equal(controller.getState().valid, true);

  const v1Controller = harness.correction.create(makeDetail(harness.context, 1));
  const missingV1Item = captureError(() => v1Controller.addItem('high_row'));
  assert.equal(missingV1Item.name, 'ActivityV2SessionCorrectionError');
  assert.equal(missingV1Item.code, 'ITEM_NOT_FOUND');

  const legacyDetail = makeDetail(harness.context, 2);
  legacyDetail.items[0].id = uuidFor(111);
  const legacyError = captureError(() => harness.correction.create(legacyDetail));
  assert.equal(legacyError.code, 'INVALID_DETAIL');

  const invalidDayDetail = makeDetail(harness.context, 2);
  invalidDayDetail.day = '2026-02-30';
  const invalidDayError = captureError(() =>
    harness.correction.create(invalidDayDetail)
  );
  assert.equal(invalidDayError.code, 'INVALID_DETAIL');
});

test('T-ACT-R9-04 builds exact replacement and canonical content with explicit nulls and order', () => {
  const harness = makeHarness();
  const controller = harness.correction.create(makeDetail(harness.context));
  controller.setDurationMin(40);
  controller.setNote('session note');
  controller.setItemField('running', 'duration_min', 40);
  controller.setItemField('running', 'distance_km', null);
  controller.moveItem('bench_press', 1);
  const state = controller.getState();

  assert.equal(state.valid, true);
  assert.deepEqual(Object.keys(state.canonicalContent), [
    'schema_version',
    'catalog_version',
    'duration_min',
    'note',
    'items'
  ]);
  assert.equal(
    state.canonicalContent.schema_version,
    'midas.activity-session-content.v1'
  );
  assert.deepEqual(Object.keys(state.canonicalContent.items[0]), [
    'item_key',
    'item_order',
    'item_label_snapshot',
    'tracking_mode_snapshot',
    'equipment_snapshot',
    'load_comparability_snapshot',
    'field_policy_snapshot',
    'duration_min',
    'distance_km',
    'note',
    'sets'
  ]);
  assert.deepEqual(Object.keys(state.canonicalContent.items[0].sets[0]), [
    'set_order',
    'tracking_mode',
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  assert.deepEqual(Object.keys(state.replacement), [
    'schema_version',
    'duration_min',
    'note',
    'items'
  ]);
  assert.deepEqual(Object.keys(state.replacement.items[0]), [
    'item_key',
    'item_order',
    'duration_min',
    'distance_km',
    'note',
    'sets'
  ]);
  assert.deepEqual(Object.keys(state.replacement.items[0].sets[0]), [
    'set_order',
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  assert.equal(state.replacement.items[1].distance_km, null);
  assert.equal(state.canonicalContent.items[0].sets[0].duration_sec, null);
  assert.deepEqual(Object.keys(state.mutationRequest), [
    'sessionId',
    'expectedRevision',
    'expectedContentFingerprint',
    'session'
  ]);
  assert.equal(state.mutationRequest.session, state.replacement);

  const canonicalText = JSON.stringify(state.canonicalContent);
  for (const forbidden of [
    'session_id',
    'user_id',
    'request_id',
    'request_fingerprint',
    'content_fingerprint',
    'revision',
    'started_at',
    'ended_at',
    'day',
    'created_at',
    'updated_at',
    'title',
    uuidFor(900)
  ]) {
    assert.equal(canonicalText.includes(forbidden), false, forbidden);
  }
  assert.equal(Object.isFrozen(state.canonicalContent), true);
  assert.equal(Object.isFrozen(state.replacement.items), true);
});

test('canonicalization fails closed on extras, accessors, policy drift and order gaps', () => {
  const harness = makeHarness();
  const valid = clone(
    harness.correction.create(makeDetail(harness.context)).getState().workingCopy
  );
  const cases = [
    (candidate) => {
      candidate.session_id = uuidFor(900);
    },
    (candidate) => {
      candidate.items[0].item_order = 2;
    },
    (candidate) => {
      candidate.items[0].field_policy_snapshot.note = 'required';
    },
    (candidate) => {
      candidate.items[1].sets[0].tracking_mode = 'duration';
    },
    (candidate) => {
      candidate.items[1].sets[0].duration_sec = 10;
    }
  ];
  for (const mutate of cases) {
    const candidate = clone(valid);
    mutate(candidate);
    const error = captureError(() => harness.canonicalization.project(candidate));
    assert.equal(error.name, 'ActivityV2SessionCanonicalizationError');
    assert.equal(error.code, 'INVALID_CONTENT');
  }

  const accessor = clone(valid);
  let getterCalls = 0;
  Object.defineProperty(accessor, 'note', {
    enumerable: true,
    get() {
      getterCalls += 1;
      return null;
    }
  });
  captureError(() => harness.canonicalization.project(accessor));
  assert.equal(getterCalls, 0);
});
