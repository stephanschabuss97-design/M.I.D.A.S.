'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '../../../..');
const consumerPath = path.join(
  repoRoot,
  'app/modules/vitals-stack/activity/v2/activity-consumer.js'
);
const fixturePath = path.join(
  repoRoot,
  'app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json'
);
const modulePath = path.join(__dirname, 'health-export-v3.js');
const doctorPath = path.join(__dirname, 'index.js');
const indexPath = path.join(repoRoot, 'index.html');
const consumerSource = fs.readFileSync(consumerPath, 'utf8');
const moduleSource = fs.readFileSync(modulePath, 'utf8');
const doctorSource = fs.readFileSync(doctorPath, 'utf8');
const indexSource = fs.readFileSync(indexPath, 'utf8');
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const MIXED = fixtures.cases.find((entry) => entry.name === 'mixed');

const clone = (value) => JSON.parse(JSON.stringify(value));
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

function loadApi() {
  const context = vm.createContext({});
  new vm.Script(consumerSource, { filename: consumerPath }).runInContext(context);
  new vm.Script(moduleSource, { filename: modulePath }).runInContext(context);
  return {
    api: context.AppModules.doctor.healthExportV3,
    contract: context.AppModules.activityV2.consumer
  };
}

function buildV2(range, options = {}) {
  const day = range.from;
  const activities = options.activities || [{
    id: '00000000-0000-4000-8000-000000000099',
    occurred_at: `${day}T08:00:00.000Z`,
    day,
    activity: 'Gehen',
    duration_min: 25,
    note: 'Ruhig'
  }];
  const bloodPressure = options.emptyDomains ? [] : [
    {
      day,
      daypart: 'morning',
      systolic_mmhg: 120,
      diastolic_mmhg: 75,
      pulse_bpm: 60
    },
    {
      day,
      daypart: 'evening',
      systolic_mmhg: 118,
      diastolic_mmhg: 72,
      pulse_bpm: 58
    }
  ];
  const body = options.emptyDomains ? [] : [{
    day,
    weight_kg: 80,
    waist_cm: null,
    fat_kg: null,
    muscle_kg: null
  }];
  const notes = options.emptyDomains ? [] : [{ day, text: 'Stabil' }];
  const labs = options.emptyDomains ? [] : [{
    day,
    egfr: 60,
    creatinine: null,
    hba1c: null,
    ldl: null,
    potassium: 4.3,
    ckd_stage: 'G2',
    doctor_comment: null
  }];
  return {
    schema_version: 'midas.health-export.v2',
    generated_at: '2026-08-23T12:00:00.000Z',
    timezone: 'Europe/Vienna',
    range: { from: range.from, to: range.to },
    completeness: {
      status: 'complete',
      loaded_domains: [
        'blood_pressure', 'body', 'notes', 'labs', 'activities'
      ],
      counts: {
        blood_pressure: bloodPressure.length,
        body: body.length,
        notes: notes.length,
        labs: labs.length,
        activities: activities.length
      }
    },
    blood_pressure: bloodPressure,
    body,
    notes,
    labs,
    activities
  };
}

function buildFor(api, fixture, base = buildV2(fixture.range)) {
  return api.build(
    { baseExportV2: base, activitySnapshot: clone(fixture.snapshot) },
    { today: fixtures.today }
  );
}

function assertContractError(callback) {
  let caught;
  try {
    callback();
  } catch (error) {
    caught = error;
  }
  assert.equal(caught?.name, 'HealthExportV3ContractError');
  assert.equal(caught?.code, 'HEALTH_EXPORT_V3_CONTRACT_INVALID');
  assert.equal(caught?.message, 'The health export payload is invalid.');
  ['cause', 'payload', 'details', 'response'].forEach((key) => {
    assert.equal(Object.hasOwn(caught, key), false);
  });
}

async function assertLoadError(promise, code) {
  let caught;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  assert.equal(caught?.name, 'HealthExportV3LoadError');
  assert.equal(caught?.code, code);
  assert.equal(caught?.operation, 'loadHealthExportV3');
  assert.equal(caught?.message, 'The health export request failed.');
  ['cause', 'payload', 'details', 'response'].forEach((key) => {
    assert.equal(Object.hasOwn(caught, key), false);
  });
}

test('T-ACT-R11-08 registers only the frozen R13 product V3 API', () => {
  const { api } = loadApi();
  assert.deepEqual(Reflect.ownKeys(api), [
    'schemaVersion', 'validateV2', 'build', 'validateV3', 'createLoader',
    'ContractError', 'LoadError'
  ]);
  assert.equal(api.schemaVersion, 'midas.health-export.v3');
  assert.equal(Object.isFrozen(api), true);
  assert.equal(hash(doctorSource), '3505237e84f22f24b787c621213dbe7776fa163d069b7c4bc3bd79e01784616e');
  assert.match(doctorSource, /healthExportV3/);
  assert.match(indexSource, /health-export-v3/);
});

test('T-ACT-R11-08 builds exact V1, V2, mixed, same-day and empty V3 payloads', () => {
  const { api } = loadApi();
  for (const fixture of fixtures.cases) {
    const built = buildFor(api, fixture, buildV2(fixture.range, {
      emptyDomains: fixture.name === 'empty',
      activities: fixture.name === 'empty' ? [] : undefined
    }));
    assert.deepEqual(Reflect.ownKeys(built), [
      'schema_version', 'generated_at', 'timezone', 'range', 'completeness',
      'blood_pressure', 'body', 'notes', 'labs', 'activity_summary',
      'activity_quality', 'activities'
    ]);
    assert.deepEqual(clone(built.activity_summary), fixture.snapshot.summary);
    assert.deepEqual(clone(built.activity_quality), fixture.snapshot.quality);
    assert.deepEqual(clone(built.activities), fixture.snapshot.units);
    assert.equal(built.completeness.counts.activities, fixture.snapshot.units.length);
    assert.equal(Object.isFrozen(built), true);
    assert.equal(Object.isFrozen(built.activities), true);
    assert.deepEqual(
      clone(api.validateV3(clone(built), { today: fixtures.today })),
      clone(built)
    );
  }
});

test('T-ACT-R11-08 preserves every non-Activity V2 field and leaves input untouched', () => {
  const { api } = loadApi();
  const base = buildV2(MIXED.range);
  const before = clone(base);
  const built = buildFor(api, MIXED, base);
  for (const key of [
    'generated_at', 'timezone', 'range', 'blood_pressure', 'body', 'notes', 'labs'
  ]) {
    assert.deepEqual(clone(built[key]), before[key]);
  }
  for (const key of ['blood_pressure', 'body', 'notes', 'labs']) {
    assert.equal(
      built.completeness.counts[key],
      before.completeness.counts[key]
    );
  }
  assert.deepEqual(base, before);
  assert.deepEqual(
    clone(api.validateV2(clone(base), { today: fixtures.today })),
    base
  );
});

test('T-ACT-R11-08 rejects V2/V3 schema, range, domain, count and sort drift', () => {
  const { api } = loadApi();
  const base = buildV2(MIXED.range);
  const built = buildFor(api, MIXED, base);
  const candidates = [
    { ...clone(base), schema_version: 'midas.health-export.v3' },
    { ...clone(base), extra: true },
    { ...clone(base), range: { from: MIXED.range.from, to: '2026-08-24' } },
    {
      ...clone(base),
      completeness: {
        ...clone(base.completeness),
        loaded_domains: [...base.completeness.loaded_domains].reverse()
      }
    },
    {
      ...clone(base),
      completeness: {
        ...clone(base.completeness),
        loaded_domains: []
      }
    },
    {
      ...clone(base),
      completeness: {
        ...clone(base.completeness),
        counts: { ...clone(base.completeness.counts), labs: 99 }
      }
    },
    { ...clone(base), blood_pressure: [...clone(base.blood_pressure)].reverse() },
    { ...clone(base), notes: [{ day: MIXED.range.from, text: '  ' }] },
    {
      ...clone(base),
      activities: [{ ...clone(base.activities[0]), activity: ' Gehen' }]
    }
  ];
  candidates.forEach((candidate) => assertContractError(() =>
    api.validateV2(candidate, { today: fixtures.today })
  ));
  assertContractError(() => api.validateV2(clone(built), { today: fixtures.today }));
  assertContractError(() => api.validateV3(clone(base), { today: fixtures.today }));
  assertContractError(() => api.validateV3({ ...clone(built), extra: true }, {
    today: fixtures.today
  }));
  assertContractError(() => api.validateV3({
    ...clone(built),
    activity_summary: { ...clone(built.activity_summary), unit_count: 99 }
  }, { today: fixtures.today }));
});

test('T-ACT-R11-08 rejects accessors and forbidden privacy/detail fields', () => {
  const { api } = loadApi();
  const base = buildV2(MIXED.range);
  const accessor = clone(base);
  Object.defineProperty(accessor, 'activities', {
    enumerable: true,
    get() {
      throw new Error('raw health secret');
    }
  });
  assertContractError(() => api.validateV2(accessor, { today: fixtures.today }));
  for (const forbidden of [
    'user_id', 'items', 'sets', 'reps', 'weights', 'weight', 'volume',
    'recommendations'
  ]) {
    const snapshot = clone(MIXED.snapshot);
    snapshot.units[0][forbidden] = 'forbidden';
    assertContractError(() => api.build({
      baseExportV2: clone(base),
      activitySnapshot: snapshot
    }, { today: fixtures.today }));
  }
});

test('T-ACT-R11-08 loader is all-or-error and returns no partial export', async () => {
  const { api, contract } = loadApi();
  const calls = [];
  const loader = api.createLoader({
    contract,
    today: fixtures.today,
    async loadBaseExportV2(range) {
      calls.push(['v2', clone(range)]);
      return buildV2(MIXED.range);
    },
    async loadActivitySnapshot(range) {
      calls.push(['activity', clone(range)]);
      return clone(MIXED.snapshot);
    }
  });
  const built = await loader.load({ from: MIXED.range.from, to: MIXED.range.to });
  assert.equal(built.schema_version, 'midas.health-export.v3');
  assert.deepEqual(calls, [
    ['v2', { from: MIXED.range.from, to: MIXED.range.to }],
    ['activity', { from: MIXED.range.from, to: MIXED.range.to }]
  ]);

  let successfulReads = 0;
  const failing = api.createLoader({
    contract,
    today: fixtures.today,
    async loadBaseExportV2() {
      successfulReads += 1;
      return buildV2(MIXED.range);
    },
    async loadActivitySnapshot() {
      throw new Error('raw read secret');
    }
  });
  await assertLoadError(
    failing.load({ from: MIXED.range.from, to: MIXED.range.to }),
    'READ_FAILED'
  );
  assert.equal(successfulReads, 1);
});

test('T-ACT-R11-08 loader fails closed on invalid range, config and payload drift', async () => {
  const { api, contract } = loadApi();
  assert.throws(
    () => api.createLoader({}),
    (error) => error?.code === 'CONFIG_UNAVAILABLE'
  );
  const loader = api.createLoader({
    contract,
    today: fixtures.today,
    loadBaseExportV2: async () => ({ schema_version: 'partial' }),
    loadActivitySnapshot: async () => clone(MIXED.snapshot)
  });
  await assertLoadError(
    loader.load({ from: MIXED.range.from, to: MIXED.range.to, extra: true }),
    'INVALID_RANGE'
  );
  await assertLoadError(
    loader.load({ from: MIXED.range.from, to: MIXED.range.to }),
    'CONTRACT_INVALID'
  );
});

test('T-ACT-R11-08 module has no download, Blob, URL, mutation or coaching seam', () => {
  assert.doesNotMatch(
    moduleSource,
    /\bBlob\b|createObjectURL|revokeObjectURL|\.click\s*\(|\.download\b|\bdl\s*\(/
  );
  assert.doesNotMatch(
    moduleSource,
    /\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|coachingExport/
  );
  assert.doesNotMatch(moduleSource, /item_sets|repetitions|weight_kg_per_hand|1rm/i);
});
