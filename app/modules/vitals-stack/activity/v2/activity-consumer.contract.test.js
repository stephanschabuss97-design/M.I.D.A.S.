'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const modulePath = path.join(__dirname, 'activity-consumer.js');
const fixturePath = path.join(__dirname, 'activity-consumer.fixture.json');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const source = fs.readFileSync(modulePath, 'utf8');
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const indexSource = fs.readFileSync(indexPath, 'utf8');
const API_KEYS = [
  'validateRange',
  'compareUnits',
  'aggregateUnits',
  'validateSnapshot'
];

function load(overrides = {}) {
  const context = vm.createContext({ ...overrides });
  const globalsBefore = Reflect.ownKeys(context).sort();
  vm.runInContext(source, context, { filename: modulePath });
  return {
    api: context.AppModules.activityV2.consumer,
    context,
    globalsBefore
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function plain(value) {
  return clone(value);
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

function assertCode(callback, code) {
  assert.throws(callback, (error) => {
    assert.equal(error.name, 'ActivityConsumerContractError');
    assert.equal(error.code, code);
    assert.equal(error.message, 'The activity consumer payload is invalid.');
    assert.equal('cause' in error, false);
    assert.equal('payload' in error, false);
    assert.equal('details' in error, false);
    return true;
  });
}

function makeV2Unit(index, overrides = {}) {
  const suffix = String(index).padStart(12, '0');
  return {
    source: 'activity_v2',
    id: `10000000-0000-4000-8000-${suffix}`,
    day: '2026-08-23',
    occurred_at: '2026-08-23T10:00:00.000Z',
    label: 'Training',
    duration_min: 30,
    note: null,
    item_count: 1,
    ...overrides
  };
}

test('registers only the frozen R13 product consumer API', () => {
  const { api, context, globalsBefore } = load();
  assert.deepEqual(Reflect.ownKeys(api), API_KEYS);
  assertFrozenTree(api);
  assert.deepEqual(
    Reflect.ownKeys(context).filter((key) => key !== 'AppModules').sort(),
    globalsBefore
  );
  assert.match(indexSource, /activity-consumer\.js/);

  assert.throws(
    () => load({ AppModules: [] }),
    /AppModules must be an object/
  );
  assert.throws(
    () => load({ AppModules: { activityV2: { consumer: {} } } }),
    /already registered/
  );
});

test('validates inclusive Vienna ranges at the 1, 400, 401 and future boundaries', () => {
  const { api } = load();
  const oneDay = api.validateRange(
    { from: '2026-08-23', to: '2026-08-23', inclusive_days: 1 },
    fixtures.today
  );
  const fourHundredDays = api.validateRange(
    { from: '2025-07-20', to: '2026-08-23', inclusive_days: 400 },
    fixtures.today
  );
  assert.deepEqual(plain(oneDay), {
    from: '2026-08-23',
    to: '2026-08-23',
    inclusive_days: 1
  });
  assert.deepEqual(plain(fourHundredDays), {
    from: '2025-07-20',
    to: '2026-08-23',
    inclusive_days: 400
  });
  assertFrozenTree(oneDay);
  assertFrozenTree(fourHundredDays);

  const invalidRanges = [
    { from: '2025-07-19', to: '2026-08-23', inclusive_days: 401 },
    { from: '2026-08-24', to: '2026-08-24', inclusive_days: 1 },
    { from: '2026-08-23', to: '2026-08-22', inclusive_days: 0 },
    { from: '2026-02-29', to: '2026-02-29', inclusive_days: 1 },
    { from: '2026-08-23', to: '2026-08-23', inclusive_days: 2 },
    { from: '2026-08-23', to: '2026-08-23', inclusive_days: 1, extra: true }
  ];
  invalidRanges.forEach((range) =>
    assertCode(() => api.validateRange(range, fixtures.today), 'INVALID_RANGE')
  );
});

test('aggregates and validates every shared golden fixture deterministically', () => {
  const { api } = load();
  assert.equal(fixtures.schema_version, 'midas.activity-consumer.fixtures.v1');
  assert.deepEqual(
    fixtures.cases.map((entry) => entry.name),
    ['empty', 'v1_only', 'v2_only', 'mixed', 'same_day']
  );

  fixtures.cases.forEach((entry) => {
    const originalUnits = clone(entry.units);
    const aggregate = api.aggregateUnits(entry.units, entry.range, fixtures.today);
    const validated = api.validateSnapshot(entry.snapshot, fixtures.today);
    assert.deepEqual(plain(aggregate), entry.snapshot, entry.name);
    assert.deepEqual(plain(validated), entry.snapshot, entry.name);
    assert.deepEqual(entry.units, originalUnits, `${entry.name} input mutated`);
    assertFrozenTree(aggregate);
    assertFrozenTree(validated);
  });
});

test('uses the canonical day, timestamp, source and id ordering', () => {
  const { api } = load();
  const base = makeV2Unit(1);
  const ordered = [
    {
      ...base,
      id: '00000000-0000-4000-8000-000000000002',
      source: 'activity_v1',
      item_count: null
    },
    { ...base, id: '00000000-0000-4000-8000-000000000001' },
    { ...base, id: '00000000-0000-4000-8000-000000000002' },
    {
      ...base,
      id: '00000000-0000-4000-8000-000000000003',
      occurred_at: '2026-08-23T11:00:00.000Z'
    }
  ];
  assert.deepEqual(
    ordered.slice().reverse().sort(api.compareUnits),
    ordered
  );
  assert.equal(api.compareUnits(ordered[0], ordered[0]), 0);
});

test('derives stored Vienna days across the spring DST boundary', () => {
  const { api } = load();
  const range = { from: '2026-03-29', to: '2026-03-30', inclusive_days: 2 };
  const snapshot = api.aggregateUnits(
    [
      makeV2Unit(1, {
        day: '2026-03-29',
        occurred_at: '2026-03-28T23:30:00.000Z'
      }),
      makeV2Unit(2, {
        day: '2026-03-30',
        occurred_at: '2026-03-29T22:30:00.000Z'
      })
    ],
    range,
    fixtures.today
  );
  assert.equal(snapshot.summary.active_day_count, 2);
  assert.equal(snapshot.summary.active_days_per_week, 7);
  assert.equal(snapshot.summary.last_day, '2026-03-30');
});

test('rejects key, accessor, prototype, type and source-specific unit drift', () => {
  const { api } = load();
  const range = { from: '2026-08-23', to: '2026-08-23', inclusive_days: 1 };
  const invalidUnits = [
    { ...makeV2Unit(1), extra: true },
    { ...makeV2Unit(1), id: 'NOT-A-UUID' },
    { ...makeV2Unit(1), day: '2026-08-22' },
    { ...makeV2Unit(1), occurred_at: '2026-08-22T20:00:00.000Z' },
    { ...makeV2Unit(1), label: ' Training ' },
    { ...makeV2Unit(1), duration_min: 1441 },
    { ...makeV2Unit(1), note: '' },
    { ...makeV2Unit(1), item_count: null },
    {
      ...makeV2Unit(1),
      source: 'activity_v1',
      duration_min: 2147483648,
      item_count: null
    },
    { ...makeV2Unit(1), source: 'activity_v1', item_count: 0 }
  ];
  invalidUnits.forEach((unit) =>
    assertCode(() => api.aggregateUnits([unit], range, fixtures.today), 'INVALID_UNITS')
  );

  const accessor = makeV2Unit(1);
  Object.defineProperty(accessor, 'label', {
    enumerable: true,
    get() {
      throw new Error('RAW_ACCESSOR_SECRET');
    }
  });
  assertCode(
    () => api.aggregateUnits([accessor], range, fixtures.today),
    'INVALID_UNITS'
  );

  const customPrototype = Object.create({ inherited: true });
  Object.assign(customPrototype, makeV2Unit(1));
  assertCode(
    () => api.aggregateUnits([customPrototype], range, fixtures.today),
    'INVALID_UNITS'
  );

  const sparse = [makeV2Unit(1), makeV2Unit(2)];
  delete sparse[0];
  assertCode(
    () => api.aggregateUnits(sparse, range, fixtures.today),
    'INVALID_UNITS'
  );

  const oversizedSparse = [];
  oversizedSparse.length = 1000000;
  assertCode(
    () => api.aggregateUnits(oversizedSparse, range, fixtures.today),
    'INVALID_UNITS'
  );
});

test('rejects duplicates, impossible V1 days and the 1001st V2 session', () => {
  const { api } = load();
  const range = { from: '2026-08-23', to: '2026-08-23', inclusive_days: 1 };
  const duplicate = makeV2Unit(1);
  assertCode(
    () => api.aggregateUnits([duplicate, clone(duplicate)], range, fixtures.today),
    'INVALID_UNITS'
  );
  assertCode(
    () =>
      api.aggregateUnits(
        [
          { ...makeV2Unit(1), source: 'activity_v1', item_count: null },
          { ...makeV2Unit(2), source: 'activity_v1', item_count: null }
        ],
        range,
        fixtures.today
      ),
    'INVALID_UNITS'
  );

  const thousand = Array.from({ length: 1000 }, (_, index) =>
    makeV2Unit(index + 1, {
      occurred_at: `2026-08-23T10:${String(index % 60).padStart(2, '0')}:00.000Z`
    })
  );
  const accepted = api.aggregateUnits(thousand, range, fixtures.today);
  assert.equal(accepted.summary.unit_count, 1000);
  assertCode(
    () => api.aggregateUnits([...thousand, makeV2Unit(1001)], range, fixtures.today),
    'INVALID_UNITS'
  );
});

test('recomputes summary and quality and rejects sort or snapshot drift', () => {
  const { api } = load();
  const mixed = fixtures.cases.find((entry) => entry.name === 'mixed').snapshot;
  const mutations = [
    (value) => {
      value.summary.total_duration_min += 1;
    },
    (value) => {
      value.summary.active_days_per_week = 2.1;
    },
    (value) => {
      value.quality.mixed_source_days = [];
      value.quality.mixed_source_day_count = 0;
    },
    (value) => {
      value.units.reverse();
    },
    (value) => {
      value.user_id = '00000000-0000-4000-8000-000000000099';
    },
    (value) => {
      value.summary.extra = 1;
    }
  ];
  mutations.forEach((mutate) => {
    const value = clone(mixed);
    mutate(value);
    assertCode(() => api.validateSnapshot(value, fixtures.today), 'INVALID_SNAPSHOT');
  });
});

test('fails closed without leaking raw proxy or accessor errors', () => {
  const { api } = load();
  const rawMarker = 'RAW_SUPABASE_PAYLOAD_SECRET';
  const proxy = new Proxy({}, {
    ownKeys() {
      throw new Error(rawMarker);
    }
  });
  assert.throws(() => api.validateSnapshot(proxy, fixtures.today), (error) => {
    assert.equal(error.name, 'ActivityConsumerContractError');
    assert.equal(error.code, 'INVALID_SNAPSHOT');
    assert.equal(error.message.includes(rawMarker), false);
    assert.equal(JSON.stringify(error).includes(rawMarker), false);
    return true;
  });
});

test('contains no I/O or mutation API and is activated only by composition', () => {
  assert.doesNotMatch(
    source,
    /\b(?:fetch|XMLHttpRequest|WebSocket|indexedDB|localStorage|sessionStorage)\b/
  );
  assert.doesNotMatch(source, /\.(?:rpc|insert|update|delete|upsert)\s*\(/);
  assert.doesNotMatch(source, /service[_-]?role|Authorization|Bearer/i);
  assert.match(indexSource, /activity-consumer\.js/);
});
