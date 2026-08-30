'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const modulePath = path.join(__dirname, 'activity-coaching-export.js');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const source = fs.readFileSync(modulePath, 'utf8');
const indexSource = fs.readFileSync(indexPath, 'utf8');
const API_KEYS = [
  'validateExport',
  'validateRange',
  'createPresetRange',
  'buildDownloadName'
];

function load(overrides = {}) {
  const context = vm.createContext({ ...overrides });
  const globalsBefore = Reflect.ownKeys(context).sort();
  vm.runInContext(source, context, { filename: modulePath });
  return {
    api: context.AppModules.activityV2.coachingExport,
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
    assert.equal(error.name, 'ActivityV2CoachingExportError');
    assert.equal(error.code, code);
    assert.equal(error.message, 'The activity coaching export is invalid.');
    return true;
  });
}

function durationPolicy() {
  return {
    assistance_kg: 'forbidden',
    distance_km: 'forbidden',
    distance_m: 'forbidden',
    duration_min: 'required',
    duration_sec: 'forbidden',
    note: 'optional',
    reps: 'forbidden',
    weight_kg: 'forbidden'
  };
}

function distancePolicy() {
  return { ...durationPolicy(), distance_km: 'required' };
}

function assistancePolicy() {
  return {
    assistance_kg: 'required',
    distance_km: 'forbidden',
    distance_m: 'forbidden',
    duration_min: 'forbidden',
    duration_sec: 'forbidden',
    note: 'optional',
    reps: 'required',
    weight_kg: 'forbidden'
  };
}

function makeDurationItem(overrides = {}) {
  return {
    item_key: 'running',
    item_order: 1,
    item_label_snapshot: 'Laufen',
    tracking_mode_snapshot: 'duration',
    equipment_snapshot: 'none',
    load_comparability_snapshot: 'not_applicable',
    field_policy_snapshot: durationPolicy(),
    category: 'endurance',
    muscle_groups: ['calves', 'full_body'],
    sport_tags: ['endurance', 'outdoor'],
    duration_min: 42,
    distance_km: null,
    note: 'Locker',
    sets: [],
    ...overrides
  };
}

function makeStrengthItem(overrides = {}) {
  return {
    item_key: 'lat_pulldown',
    item_order: 2,
    item_label_snapshot: 'Latzug',
    tracking_mode_snapshot: 'strength_sets',
    equipment_snapshot: 'machine',
    load_comparability_snapshot: 'device_relative',
    field_policy_snapshot: assistancePolicy(),
    category: 'strength',
    muscle_groups: ['back', 'biceps'],
    sport_tags: [],
    duration_min: null,
    distance_km: null,
    note: null,
    sets: [
      {
        set_order: 1,
        tracking_mode: 'strength_sets',
        reps: 10,
        duration_sec: null,
        distance_m: null,
        weight_kg: null,
        assistance_kg: 25.5
      }
    ],
    ...overrides
  };
}

function makeDistanceItem(overrides = {}) {
  return {
    item_key: 'cycling',
    item_order: 1,
    item_label_snapshot: 'Radfahren',
    tracking_mode_snapshot: 'duration_distance',
    equipment_snapshot: 'cardio_machine',
    load_comparability_snapshot: 'not_applicable',
    field_policy_snapshot: distancePolicy(),
    category: 'endurance',
    muscle_groups: ['calves', 'quadriceps'],
    sport_tags: ['endurance', 'indoor'],
    duration_min: 60,
    distance_km: 20.25,
    note: null,
    sets: [],
    ...overrides
  };
}

function makeSession(overrides = {}) {
  return {
    session_id: '00000000-0000-4000-8000-000000000001',
    catalog_version: 1,
    revision: '1',
    day: '2026-02-28',
    started_at: '2026-02-28T09:00:00.000Z',
    ended_at: '2026-02-28T10:00:00.000Z',
    duration_min: 60,
    title: 'Frühtraining',
    note: null,
    items: [makeDurationItem(), makeStrengthItem()],
    ...overrides
  };
}

function validExport() {
  return {
    schema_version: 'midas.activity-coaching-export.v1',
    generated_at: '2026-08-31T12:00:00.000Z',
    timezone: 'Europe/Vienna',
    range: {
      from: '2026-02-28',
      to: '2026-08-31',
      inclusive: true
    },
    units: {
      session_duration: 'min',
      item_duration: 'min',
      item_distance: 'km',
      set_duration: 's',
      set_distance: 'm',
      weight: 'kg',
      assistance: 'kg',
      repetitions: 'count'
    },
    completeness: {
      status: 'complete',
      truncated: false,
      session_count: 2,
      item_count: 3,
      set_count: 1
    },
    quality: {
      status: 'ok',
      cautions: [
        'assistance_loads_present',
        'device_relative_loads_present',
        'multiple_catalog_versions_present'
      ]
    },
    sessions: [
      makeSession(),
      makeSession({
        session_id: '00000000-0000-4000-8000-000000000002',
        catalog_version: 2,
        revision: '9223372036854775807',
        day: '2026-08-31',
        started_at: '2026-08-31T16:30:00.000Z',
        ended_at: '2026-08-31T17:30:00.000Z',
        title: null,
        note: 'Ausdauer',
        items: [makeDistanceItem()]
      })
    ]
  };
}

function emptyExport() {
  const value = validExport();
  value.range = { from: '2026-08-31', to: '2026-08-31', inclusive: true };
  value.completeness = {
    status: 'complete',
    truncated: false,
    session_count: 0,
    item_count: 0,
    set_count: 0
  };
  value.quality = { status: 'no_data', cautions: ['no_sessions_in_range'] };
  value.sessions = [];
  return value;
}

test('T-ACT-R10-01 namespace is exact, immutable and R14-product-loaded', () => {
  const { api, context, globalsBefore } = load();

  assert.deepEqual(Object.keys(api), API_KEYS);
  assert.deepEqual(
    Reflect.ownKeys(context).sort(),
    [...globalsBefore, 'AppModules'].sort()
  );
  assertFrozenTree(api);
  const descriptor = Object.getOwnPropertyDescriptor(
    context.AppModules.activityV2,
    'coachingExport'
  );
  assert.deepEqual(
    {
      enumerable: descriptor.enumerable,
      writable: descriptor.writable,
      configurable: descriptor.configurable
    },
    { enumerable: true, writable: false, configurable: false }
  );
  assert.equal(indexSource.includes('activity-coaching-export.js'), true);
  assert.equal(/\b(fetch|XMLHttpRequest|WebSocket|indexedDB|localStorage)\b/.test(source), false);
  assert.equal(/\b(document|navigator)\b/.test(source), false);
  assert.equal(source.includes('supabase'), false);
});

test('T-ACT-R10-01 accepts the complete mixed V1 and returns a frozen clone', () => {
  const { api } = load();
  const input = validExport();
  const result = api.validateExport(input);

  assert.deepEqual(plain(result), input);
  assert.notEqual(result, input);
  assert.notEqual(result.sessions[0], input.sessions[0]);
  assert.notEqual(result.sessions[0].items[1].sets[0], input.sessions[0].items[1].sets[0]);
  assertFrozenTree(result);
  assert.equal(Object.isFrozen(input), false);
  assert.equal(Object.isFrozen(input.sessions[0].items[1].sets[0]), false);
});

test('T-ACT-R10-01 rejects missing, unknown, accessor and sparse data keys', () => {
  const { api } = load();
  const missing = validExport();
  delete missing.units.weight;
  assertCode(() => api.validateExport(missing), 'EXPORT_CONTRACT_INVALID');

  const unknown = validExport();
  unknown.sessions[0].user_id = 'secret';
  assertCode(() => api.validateExport(unknown), 'EXPORT_CONTRACT_INVALID');

  const accessor = validExport();
  Object.defineProperty(accessor.range, 'from', {
    enumerable: true,
    get() {
      throw new Error('must not be read');
    }
  });
  assertCode(() => api.validateExport(accessor), 'EXPORT_CONTRACT_INVALID');

  const sparse = validExport();
  delete sparse.sessions[0].items[1];
  assertCode(() => api.validateExport(sparse), 'EXPORT_CONTRACT_INVALID');
});

test('T-ACT-R10-01 enforces timestamps, revisions, enums, text and numeric nullability', () => {
  const { api } = load();
  const mutations = [
    (value) => {
      value.generated_at = '2026-08-31T12:00:00Z';
    },
    (value) => {
      value.sessions[0].revision = '9223372036854775808';
    },
    (value) => {
      value.sessions[0].items[0].equipment_snapshot = 'shoes';
    },
    (value) => {
      value.sessions[0].items[0].note = ' padded ';
    },
    (value) => {
      value.sessions[1].items[0].distance_km = 20.251;
    },
    (value) => {
      value.sessions[0].items[1].sets[0].reps = null;
    },
    (value) => {
      value.sessions[0].items[1].sets[0].weight_kg = 10;
    },
    (value) => {
      value.sessions[0].items[0].duration_min = null;
    }
  ];

  mutations.forEach((mutate) => {
    const value = validExport();
    mutate(value);
    assertCode(() => api.validateExport(value), 'EXPORT_CONTRACT_INVALID');
  });
});

test('T-ACT-R10-01 enforces every persisted numeric upper boundary', () => {
  const { api } = load();
  const accepted = validExport();
  accepted.sessions[0].duration_min = 1440;
  accepted.sessions[0].items[0].duration_min = 1440;
  accepted.sessions[0].items[1].sets[0].reps = 1000;
  accepted.sessions[0].items[1].sets[0].assistance_kg = 1000;
  accepted.sessions[1].items[0].distance_km = 1000;
  assert.deepEqual(plain(api.validateExport(accepted)), accepted);

  const mutations = [
    (value) => {
      value.sessions[0].duration_min = 1441;
    },
    (value) => {
      value.sessions[0].items[0].duration_min = 1441;
    },
    (value) => {
      value.sessions[1].items[0].distance_km = 1000.01;
    },
    (value) => {
      value.sessions[0].items[1].sets[0].reps = 1001;
    },
    (value) => {
      value.sessions[0].items[1].sets[0].assistance_kg = 1000.01;
    },
    (value) => {
      const item = value.sessions[0].items[1];
      item.field_policy_snapshot.reps = 'forbidden';
      item.field_policy_snapshot.duration_sec = 'required';
      item.sets[0].reps = null;
      item.sets[0].duration_sec = 3601;
    },
    (value) => {
      const item = value.sessions[0].items[1];
      item.field_policy_snapshot.reps = 'forbidden';
      item.field_policy_snapshot.distance_m = 'required';
      item.sets[0].reps = null;
      item.sets[0].distance_m = 10000.01;
    },
    (value) => {
      const item = value.sessions[0].items[1];
      item.field_policy_snapshot.assistance_kg = 'forbidden';
      item.field_policy_snapshot.weight_kg = 'required';
      item.sets[0].assistance_kg = null;
      item.sets[0].weight_kg = 1000.01;
    }
  ];
  mutations.forEach((mutate) => {
    const value = validExport();
    mutate(value);
    assertCode(() => api.validateExport(value), 'EXPORT_CONTRACT_INVALID');
  });
});

test('T-ACT-R10-02 validates inclusive canonical ranges through 366 days', () => {
  const { api } = load();

  assert.deepEqual(
    plain(
      api.validateRange(
        { from: '2024-01-01', to: '2024-12-31', inclusive: true },
        '2024-12-31'
      )
    ),
    { from: '2024-01-01', to: '2024-12-31', inclusive: true }
  );
  [
    [{ from: '2024-01-01', to: '2025-01-01', inclusive: true }, '2025-01-01'],
    [{ from: '2026-02-30', to: '2026-03-01', inclusive: true }, '2026-03-01'],
    [{ from: '2026-03-02', to: '2026-03-01', inclusive: true }, '2026-03-01'],
    [{ from: '2026-03-01', to: '2026-03-02', inclusive: true }, '2026-03-01'],
    [{ from: '2026-03-01', to: '2026-03-01', inclusive: false }, '2026-03-01']
  ].forEach(([range, today]) =>
    assertCode(() => api.validateRange(range, today), 'INVALID_EXPORT_REQUEST')
  );
});

test('T-ACT-R10-02 presets clamp month ends and leap years', () => {
  const { api } = load();

  assert.deepEqual(
    plain(api.createPresetRange(6, Date.parse('2026-08-31T12:00:00.000Z'))),
    { from: '2026-02-28', to: '2026-08-31', inclusive: true }
  );
  assert.deepEqual(
    plain(api.createPresetRange(6, Date.parse('2024-08-31T12:00:00.000Z'))),
    { from: '2024-02-29', to: '2024-08-31', inclusive: true }
  );
  assert.deepEqual(
    plain(api.createPresetRange(3, Date.parse('2026-05-31T12:00:00.000Z'))),
    { from: '2026-02-28', to: '2026-05-31', inclusive: true }
  );
  assertCode(
    () => api.createPresetRange(12, Date.parse('2026-08-31T12:00:00.000Z')),
    'INVALID_EXPORT_REQUEST'
  );
  assertCode(() => api.createPresetRange(6, new Date()), 'INVALID_EXPORT_REQUEST');
});

test('T-ACT-R10-02 presets use the Vienna day across UTC boundaries', () => {
  const { api } = load();

  assert.deepEqual(
    plain(api.createPresetRange(3, Date.parse('2026-08-22T22:30:00.000Z'))),
    { from: '2026-05-23', to: '2026-08-23', inclusive: true }
  );
  assert.deepEqual(
    plain(api.createPresetRange(3, Date.parse('2026-01-31T23:30:00.000Z'))),
    { from: '2025-11-01', to: '2026-02-01', inclusive: true }
  );

  const value = emptyExport();
  value.generated_at = '2026-08-22T22:30:00.000Z';
  value.range = { from: '2026-08-23', to: '2026-08-23', inclusive: true };
  assert.deepEqual(plain(api.validateExport(value)), value);
});

test('T-ACT-R10-02 derives the deterministic filename only from a strict range', () => {
  const { api } = load();
  const range = { from: '2026-02-28', to: '2026-08-31', inclusive: true };

  assert.equal(
    api.buildDownloadName(range),
    'midas-activity-coaching_2026-02-28_2026-08-31.json'
  );
  assertCode(
    () => api.buildDownloadName({ ...range, extra: true }),
    'INVALID_EXPORT_REQUEST'
  );
});

test('T-ACT-R10-03 rejects session, item, set, tag and caution order drift', () => {
  const { api } = load();
  const mutations = [
    (value) => value.sessions.reverse(),
    (value) => value.sessions[0].items.reverse(),
    (value) => {
      const set = value.sessions[0].items[1].sets[0];
      value.sessions[0].items[1].sets = [
        { ...set, set_order: 2 },
        { ...set, set_order: 1 }
      ];
      value.completeness.set_count = 2;
    },
    (value) => value.sessions[0].items[0].muscle_groups.reverse(),
    (value) => value.quality.cautions.reverse()
  ];

  mutations.forEach((mutate) => {
    const value = validExport();
    mutate(value);
    assertCode(() => api.validateExport(value), 'EXPORT_CONTRACT_INVALID');
  });
});

test('T-ACT-R10-03 rejects duplicate identities and Vienna-day drift', () => {
  const { api } = load();
  const mutations = [
    (value) => {
      value.sessions[1].session_id = value.sessions[0].session_id;
    },
    (value) => {
      value.sessions[0].items[1].item_key = value.sessions[0].items[0].item_key;
    },
    (value) => {
      value.sessions[0].day = '2026-03-01';
    },
    (value) => {
      value.sessions[0].day = '2026-02-27';
    }
  ];

  mutations.forEach((mutate) => {
    const value = validExport();
    mutate(value);
    assertCode(() => api.validateExport(value), 'EXPORT_CONTRACT_INVALID');
  });
});

test('T-ACT-R10-04 enforces exact units, counts, completeness and quality', () => {
  const { api } = load();
  const mutations = [
    (value) => {
      value.units.weight = 'lb';
    },
    (value) => {
      value.completeness.item_count = 2;
    },
    (value) => {
      value.completeness.status = 'partial';
    },
    (value) => {
      value.completeness.truncated = true;
    },
    (value) => {
      value.completeness.session_count = 1001;
    },
    (value) => {
      value.quality.status = 'no_data';
    },
    (value) => {
      value.quality.cautions = [];
    }
  ];

  mutations.forEach((mutate) => {
    const value = validExport();
    mutate(value);
    assertCode(() => api.validateExport(value), 'EXPORT_CONTRACT_INVALID');
  });
});

test('T-ACT-R10-04 accepts only the exact complete no-data representation', () => {
  const { api } = load();
  const value = emptyExport();

  assert.deepEqual(plain(api.validateExport(value)), value);
  const wrongCaution = emptyExport();
  wrongCaution.quality.cautions = [];
  assertCode(() => api.validateExport(wrongCaution), 'EXPORT_CONTRACT_INVALID');
  const wrongStatus = emptyExport();
  wrongStatus.quality.status = 'ok';
  assertCode(() => api.validateExport(wrongStatus), 'EXPORT_CONTRACT_INVALID');
});

test('initialization rejects namespace collisions without replacing prior modules', () => {
  const existing = Object.freeze({ keep: true });
  const context = vm.createContext({
    AppModules: { activityV2: { coachingExport: existing } }
  });

  assert.throws(
    () => vm.runInContext(source, context, { filename: modulePath }),
    /already registered/
  );
  assert.equal(context.AppModules.activityV2.coachingExport, existing);
});
