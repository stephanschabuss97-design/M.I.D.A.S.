'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const semanticsPath = path.join(__dirname, 'semantics.js');
const harnessPath = path.join(__dirname, 'semantics-harness.html');
const roadmapPath = path.resolve(
  __dirname,
  '../../../../..',
  'docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md'
);
const source = fs.readFileSync(semanticsPath, 'utf8');

require(semanticsPath);

const api = globalThis.AppModules.activityV2.semantics;
const catalog = api.getCatalog();
const FIELD_KEYS = [
  'assistance_kg',
  'distance_km',
  'distance_m',
  'duration_min',
  'duration_sec',
  'note',
  'reps',
  'weight_kg'
];
const ERROR_CODES = [
  'duplicate_value',
  'invalid_order',
  'invalid_type',
  'invalid_value',
  'missing_field',
  'normalized_collision',
  'policy_mismatch',
  'unknown_field',
  'unknown_reference'
];
const MEASUREMENT_POLICIES = {
  'M/W!': ['strength_sets', { distance_m: 'required', weight_kg: 'required' }],
  'M/W?': ['strength_sets', { distance_m: 'required', weight_kg: 'optional' }],
  MIN: ['duration', { duration_min: 'required' }],
  'MIN+KM?': [
    'duration_distance',
    { distance_km: 'optional', duration_min: 'required' }
  ],
  'R/-': ['strength_sets', { reps: 'required' }],
  'R/A!': [
    'strength_sets',
    { assistance_kg: 'required', reps: 'required' }
  ],
  'R/W!': ['strength_sets', { reps: 'required', weight_kg: 'required' }],
  'R/W?': ['strength_sets', { reps: 'required', weight_kg: 'optional' }],
  'T/-': ['strength_sets', { duration_sec: 'required' }],
  'T/W?': [
    'strength_sets',
    { duration_sec: 'required', weight_kg: 'optional' }
  ]
};

function asciiCompare(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function entryKeys(entries) {
  return entries.map((entry) => entry.key);
}

function cloneCatalog() {
  return structuredClone(catalog);
}

function expectedFields(activeFields) {
  return {
    assistance_kg: 'forbidden',
    distance_km: 'forbidden',
    distance_m: 'forbidden',
    duration_min: 'forbidden',
    duration_sec: 'forbidden',
    note: 'optional',
    reps: 'forbidden',
    weight_kg: 'forbidden',
    ...activeFields
  };
}

function parseApprovedRows() {
  return fs
    .readFileSync(roadmapPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^\| `[a-z]/.test(line))
    .map((line) => {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
      return {
        key: cells[0].slice(1, -1),
        label: cells[1],
        aliases: cells[2]
          .split(';')
          .map((alias) => alias.trim())
          .filter(Boolean),
        category: cells[3],
        measurement: cells[4],
        equipment: cells[5],
        tags: cells[6]
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      };
    });
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

function assertErrorContract(result) {
  assertFrozenTree(result);
  result.errors.forEach((error) => {
    assert.equal(ERROR_CODES.includes(error.code), true);
    assert.match(
      error.path,
      /^\$(?:\.[A-Za-z_][A-Za-z0-9_]*|\[\d+\])*$/
    );
  });
  const sorted = [...result.errors].sort((left, right) => {
    const pathOrder = asciiCompare(left.path, right.path);
    return pathOrder !== 0
      ? pathOrder
      : asciiCompare(left.code, right.code);
  });
  assert.deepEqual(result.errors, sorted);
}

function validateMutation(mutator) {
  const candidate = cloneCatalog();
  mutator(candidate);
  const before = JSON.stringify(candidate);
  const result = api.validateCatalog(candidate);
  assert.equal(JSON.stringify(candidate), before);
  assert.equal(result.valid, false);
  assertErrorContract(result);
  return result;
}

function buildSearchOracle() {
  return catalog.entries
    .filter((entry) => entry.status === 'active')
    .map((entry) => ({
      entry,
      forms: [
        {
          normalized: api.normalizeSearchText(entry.label),
          sourceRank: 0,
          alias: false
        },
        {
          normalized: api.normalizeSearchText(entry.key),
          sourceRank: 1,
          alias: false
        },
        ...entry.aliases.map((alias) => ({
          normalized: api.normalizeSearchText(alias),
          sourceRank: 2,
          alias: true
        }))
      ]
    }));
}

function oracleSearch(index, query, limit = 20) {
  const normalizedQuery = api.normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const queryTokens = [...new Set(normalizedQuery.split(' '))];
  const matches = [];

  index.forEach((indexedEntry) => {
    let best = null;
    indexedEntry.forms.forEach((form) => {
      let rank = null;
      if (form.normalized === normalizedQuery) {
        rank = [
          form.alias ? 1 : 0,
          form.alias ? 0 : form.sourceRank,
          indexedEntry.entry.key
        ];
      } else if (form.normalized.startsWith(normalizedQuery)) {
        rank = [2, form.sourceRank, indexedEntry.entry.key];
      } else {
        const formTokens = form.normalized.split(' ');
        const matchesAllTokens = queryTokens.every((queryToken) =>
          formTokens.some((formToken) => formToken.startsWith(queryToken))
        );
        if (matchesAllTokens) {
          rank = [3, form.sourceRank, indexedEntry.entry.key];
        }
      }

      if (
        rank !== null &&
        (best === null ||
          rank[0] < best[0] ||
          (rank[0] === best[0] &&
            (rank[1] < best[1] ||
              (rank[1] === best[1] &&
                asciiCompare(rank[2], best[2]) < 0))))
      ) {
        best = rank;
      }
    });
    if (best !== null) matches.push({ key: indexedEntry.entry.key, rank: best });
  });

  matches.sort(
    (left, right) =>
      left.rank[0] - right.rank[0] ||
      left.rank[1] - right.rank[1] ||
      asciiCompare(left.rank[2], right.rank[2])
  );
  return matches.slice(0, limit).map((match) => match.key);
}

test('approved catalog baseline maps exactly to catalog_version 1', () => {
  const approvedRows = parseApprovedRows();

  assert.equal(catalog.schema_version, 'midas.activity-catalog.v1');
  assert.equal(catalog.catalog_version, 1);
  assert.equal(approvedRows.length, 78);
  assert.equal(catalog.entries.length, 78);
  assert.deepEqual(entryKeys(catalog.entries), [...entryKeys(catalog.entries)].sort());
  assert.deepEqual(catalog.taxonomies, {
    categories: ['endurance', 'sport', 'strength'],
    equipment: [
      'barbell',
      'bodyweight',
      'cable',
      'cardio_machine',
      'dumbbell',
      'kettlebell',
      'machine',
      'none',
      'variable'
    ],
    muscle_groups: [
      'adductors',
      'back',
      'biceps',
      'calves',
      'chest',
      'core',
      'forearms',
      'full_body',
      'glutes',
      'hamstrings',
      'hip_flexors',
      'quadriceps',
      'shoulders',
      'triceps'
    ],
    sport_tags: [
      'endurance',
      'indoor',
      'outdoor',
      'team_sport',
      'water_sport'
    ]
  });
  assert.deepEqual(Object.keys(catalog.field_definitions), FIELD_KEYS);

  approvedRows.forEach((row, index) => {
    const entry = catalog.entries[index];
    const [trackingMode, activeFields] =
      MEASUREMENT_POLICIES[row.measurement];
    const hasLoad = Object.keys(activeFields).some(
      (key) => key === 'weight_kg' || key === 'assistance_kg'
    );

    assert.deepEqual(
      {
        key: entry.key,
        label: entry.label,
        aliases: entry.aliases,
        category: entry.category,
        tracking_mode: entry.tracking_mode,
        equipment: entry.equipment,
        load_comparability: entry.load_comparability,
        fields: entry.fields,
        muscle_groups: entry.muscle_groups,
        sport_tags: entry.sport_tags,
        status: entry.status
      },
      {
        key: row.key,
        label: row.label,
        aliases: row.aliases,
        category: row.category,
        tracking_mode: trackingMode,
        equipment: row.equipment,
        load_comparability: hasLoad
          ? 'device_relative'
          : 'not_applicable',
        fields: expectedFields(activeFields),
        muscle_groups: row.category === 'strength' ? row.tags : [],
        sport_tags: row.category === 'strength' ? [] : row.tags,
        status: 'active'
      }
    );
  });

  assert.deepEqual(api.validateCatalog(catalog), { valid: true, errors: [] });
});

test('public API, lookup and returned values are immutable', () => {
  assert.deepEqual(Object.keys(api), [
    'getCatalog',
    'getEntryByKey',
    'normalizeSearchText',
    'validateCatalog',
    'search'
  ]);
  assert.equal(api.getCatalog(), catalog);
  assert.equal(api.getEntryByKey('biceps_curl').key, 'biceps_curl');
  assert.equal(api.getEntryByKey('syntactically_valid_but_missing'), null);
  assert.equal(api.getEntryByKey('Not a key'), null);
  assert.throws(() => api.getEntryByKey(1), TypeError);
  assertFrozenTree(api);
  assertFrozenTree(catalog);
  assertFrozenTree(api.search('press'));
});

test('normalization is locale-independent and follows the exact sequence', () => {
  assert.equal(
    api.normalizeSearchText('  FÜSSE--Straße___Étage  '),
    'fusse strasse etage'
  );
  assert.equal(api.normalizeSearchText('BICE...'), 'bice');
  assert.equal(api.normalizeSearchText('A___B---C'), 'a b c');
  assert.equal(api.normalizeSearchText('---'), '');
  assert.throws(() => api.normalizeSearchText(null), TypeError);
  assert.throws(() => api.normalizeSearchText(42), TypeError);
});

test('search matches the complete deterministic ranking oracle', () => {
  const index = buildSearchOracle();
  const normalizedForms = index.flatMap((item) =>
    item.forms.map((form) => form.normalized)
  );
  const queries = new Set([
    '',
    '---',
    'bice...',
    'curl biceps',
    'press',
    'fussball'
  ]);

  index.forEach((item) => {
    item.forms.forEach((form) => {
      queries.add(form.normalized);
      queries.add(form.normalized.slice(0, Math.min(5, form.normalized.length)));
      const tokens = form.normalized.split(' ');
      if (tokens.length > 1) queries.add([...tokens].reverse().join(' '));
    });
  });

  assert.equal(new Set(normalizedForms).size, 245);
  assert.equal(queries.size, 565);
  queries.forEach((query) => {
    assert.deepEqual(entryKeys(api.search(query)), oracleSearch(index, query));
    assert.deepEqual(
      entryKeys(api.search(query, { limit: 3 })),
      oracleSearch(index, query, 3)
    );
  });

  assert.deepEqual(entryKeys(api.search('bice...')), ['biceps_curl']);
  assert.deepEqual(entryKeys(api.search('Bizepscurl')), ['biceps_curl']);
  assert.deepEqual(entryKeys(api.search('curl biceps')), ['biceps_curl']);
  assert.deepEqual(entryKeys(api.search('biceps biceps curl')), [
    'biceps_curl'
  ]);
  assert.deepEqual(api.search('definitely-no-match'), []);
});

test('search option and limit boundaries fail deterministically', () => {
  assert.equal(api.search('press').length <= 20, true);
  assert.equal(api.search('press', { limit: 1 }).length, 1);
  assert.throws(() => api.search('press', null), TypeError);
  assert.throws(() => api.search('press', []), TypeError);
  assert.throws(() => api.search('press', { extra: true }), TypeError);
  assert.throws(() => api.search('press', { limit: 0 }), RangeError);
  assert.throws(() => api.search('press', { limit: 51 }), RangeError);
  assert.throws(() => api.search('press', { limit: 1.5 }), RangeError);
});

test('validator covers all stable codes, paths and semantic boundaries', () => {
  const seenCodes = new Set();
  const collect = (result) => {
    result.errors.forEach((error) => seenCodes.add(error.code));
    return result;
  };

  const nonObject = collect(api.validateCatalog(null));
  assert.deepEqual(nonObject.errors, [{ code: 'invalid_type', path: '$' }]);

  const empty = collect(api.validateCatalog({}));
  assert.deepEqual(empty.errors, [
    { code: 'missing_field', path: '$.catalog_version' },
    { code: 'missing_field', path: '$.entries' },
    { code: 'missing_field', path: '$.field_definitions' },
    { code: 'missing_field', path: '$.schema_version' },
    { code: 'missing_field', path: '$.taxonomies' }
  ]);

  collect(validateMutation((candidate) => {
    candidate.extra = true;
  }));
  collect(validateMutation((candidate) => {
    candidate.schema_version = 'other';
  }));
  collect(validateMutation((candidate) => {
    candidate.entries[0].label = 42;
  }));
  collect(validateMutation((candidate) => {
    [candidate.entries[0], candidate.entries[1]] = [
      candidate.entries[1],
      candidate.entries[0]
    ];
  }));
  collect(validateMutation((candidate) => {
    candidate.entries[1].key = candidate.entries[0].key;
  }));
  collect(validateMutation((candidate) => {
    candidate.entries[1].aliases.push(candidate.entries[0].label);
  }));
  collect(validateMutation((candidate) => {
    candidate.entries[0].equipment = 'ghost_device';
  }));
  collect(validateMutation((candidate) => {
    candidate.entries.find(
      (entry) => entry.key === 'leg_press'
    ).load_comparability = 'standardized';
  }));
  collect(validateMutation((candidate) => {
    candidate.taxonomies.equipment.push('zzz_device');
  }));

  assert.deepEqual([...seenCodes].sort(), ERROR_CODES);
});

test('structural failures suppress dependent follow-up errors', () => {
  const missingKey = cloneCatalog();
  delete missingKey.entries[0].key;
  assert.deepEqual(api.validateCatalog(missingKey).errors, [
    { code: 'missing_field', path: '$.entries[0].key' }
  ]);

  const missingPolicy = cloneCatalog();
  delete missingPolicy.entries[0].fields.reps;
  assert.deepEqual(api.validateCatalog(missingPolicy).errors, [
    { code: 'missing_field', path: '$.entries[0].fields.reps' }
  ]);
});

test('classic-script namespace contract preserves Activity V1', () => {
  const activityV1 = { sentinel: true };
  const context = vm.createContext({ AppModules: { activity: activityV1 } });

  new vm.Script(source, { filename: semanticsPath }).runInContext(context);

  assert.equal(context.AppModules.activity, activityV1);
  assert.equal(context.AppModules.activity.sentinel, true);
  assert.equal(Object.isExtensible(context.AppModules), true);
  assert.equal(Object.isExtensible(context.AppModules.activityV2), true);
  assert.equal(Object.isFrozen(context.AppModules), false);
  assert.equal(Object.isFrozen(context.AppModules.activityV2), false);
  const descriptor = Object.getOwnPropertyDescriptor(
    context.AppModules.activityV2,
    'semantics'
  );
  assert.deepEqual(
    {
      enumerable: descriptor.enumerable,
      writable: descriptor.writable,
      configurable: descriptor.configurable
    },
    { enumerable: true, writable: false, configurable: false }
  );
  assert.throws(
    () => new vm.Script(source).runInContext(context),
    /already registered/
  );

  const invalidRoot = vm.createContext({ AppModules: 'invalid' });
  assert.throws(
    () => new vm.Script(source).runInContext(invalidRoot),
    /AppModules must be an object/
  );
  const invalidV2 = vm.createContext({ AppModules: { activityV2: 42 } });
  assert.throws(
    () => new vm.Script(source).runInContext(invalidV2),
    /AppModules\.activityV2 must be an object/
  );
});

test('R1 source has no productive runtime or integration side effects', () => {
  const rootIndex = fs.readFileSync(
    path.resolve(__dirname, '../../../../..', 'index.html'),
    'utf8'
  );
  const forbiddenSourcePatterns = [
    /\bsupabase\b/i,
    /\bfetch\s*\(/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bdocument\s*\./,
    /AppModules\.activity(?!V2)/
  ];

  forbiddenSourcePatterns.forEach((pattern) => {
    assert.equal(pattern.test(source), false, String(pattern));
  });
  assert.equal(rootIndex.includes('activity/v2/semantics.js'), false);
  assert.equal(rootIndex.includes('activityV2'), false);
});

test('isolated browser harness uses classic scripts with valid syntax', () => {
  const harness = fs.readFileSync(harnessPath, 'utf8');
  const semanticsLoads =
    harness.match(/<script src="\.\/semantics\.js"><\/script>/g) || [];
  const inlineScripts = [
    ...harness.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)
  ]
    .map((match) => match[1])
    .filter((script) => script.trim());

  assert.equal(semanticsLoads.length, 1);
  assert.equal(/<script[^>]+\btype=["']module["']/.test(harness), false);
  assert.equal(inlineScripts.length, 2);
  inlineScripts.forEach((script, index) => {
    assert.doesNotThrow(
      () =>
        new vm.Script(script, {
          filename: `${harnessPath}#inline-${index + 1}`
        })
    );
  });
  [
    /\bsupabase\b/i,
    /\bfetch\s*\(/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/
  ].forEach((pattern) => {
    assert.equal(pattern.test(harness), false, String(pattern));
  });
});
