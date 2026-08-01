'use strict';

(function initActivityV2SemanticsV2(root) {
  const SCHEMA_VERSION = 'midas.activity-catalog.v1';
  const BASE_CATALOG_VERSION = 1;
  const CATALOG_VERSION = 2;
  const BASE_ENTRY_COUNT = 78;
  const ENTRY_COUNT = 80;
  const API_KEYS = Object.freeze([
    'getCatalog',
    'getEntryByKey',
    'normalizeSearchText',
    'validateCatalog',
    'search'
  ]);
  const ALIAS_APPENDS = Object.freeze({
    back_extension: Object.freeze(['Lower Back']),
    bench_press: Object.freeze(['Kurzhantel-Bankdrücken', 'Langhantel-Bankdrücken']),
    bent_over_row: Object.freeze(['Kurzhantel-Rudern', 'Langhantel-Rudern']),
    biceps_curl: Object.freeze(['Kurzhantel-Curl']),
    calf_raise: Object.freeze(['Rotary Calf']),
    chest_fly: Object.freeze(['Pectoral', 'Dumbbell Fly', 'Kurzhantel-Fly']),
    clean: Object.freeze(['Kettlebell Clean']),
    clean_and_press: Object.freeze(['Kettlebell Clean and Press']),
    core_press: Object.freeze(['Abdominal Crunch']),
    cycling: Object.freeze(['Fahrradergometer']),
    deadlift: Object.freeze([
      'Kettlebell Deadlift',
      'Dumbbell Deadlift',
      'Kurzhantel-Kreuzheben',
      'Langhantel-Kreuzheben'
    ]),
    farmer_carry: Object.freeze([
      'Kettlebell Carry',
      'Dumbbell Carry',
      'Kurzhantel Carry'
    ]),
    glute_kickback: Object.freeze(['Glute', 'Multi Hip Extension']),
    hip_abduction: Object.freeze(['Abductor', 'Multi Hip Abduction']),
    hip_adduction: Object.freeze(['Adductor', 'Multi Hip Adduction']),
    lat_pulldown: Object.freeze(['Pulldown', 'Vertical Traction']),
    lateral_raise: Object.freeze([
      'Delts Machine',
      'Dumbbell Lateral Raise',
      'Kurzhantel-Seitheben'
    ]),
    lunge: Object.freeze(['Dumbbell Lunge', 'Kurzhantel-Ausfallschritt']),
    romanian_deadlift: Object.freeze([
      'Dumbbell Romanian Deadlift',
      'Kettlebell Romanian Deadlift',
      'Kurzhantel-RDL'
    ]),
    seated_row: Object.freeze(['Low Row']),
    shoulder_press: Object.freeze([
      'Dumbbell Shoulder Press',
      'Kurzhantel-Schulterdrücken',
      'Kettlebell Press',
      'Kettlebell Shoulder Press'
    ]),
    snatch: Object.freeze(['Kettlebell Snatch']),
    squat: Object.freeze([
      'Kettlebell Goblet Squat',
      'Kurzhantel-Kniebeuge',
      'Langhantel-Kniebeuge'
    ]),
    stair_climber: Object.freeze(['Stepmill'])
  });
  const EMPTY_RESULTS = Object.freeze([]);

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function asciiCompare(left, right) {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  }

  function deepFreeze(value, seen = new WeakSet()) {
    const freezeable =
      value !== null && (typeof value === 'object' || typeof value === 'function');
    if (!freezeable || seen.has(value)) return value;
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => deepFreeze(value[key], seen));
    return Object.freeze(value);
  }

  function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (!isRecord(value)) return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneValue(child)])
    );
  }

  function failBase(message, validation) {
    const error = new Error(message);
    error.code = 'activity_v2_catalog_v2_base_invalid';
    if (validation !== undefined) error.validation = validation;
    throw error;
  }

  if (!isRecord(root.AppModules?.activityV2)) {
    failBase('Activity V2 semantics v1 namespace is required');
  }
  const namespace = root.AppModules.activityV2;
  if ('semanticsV2' in namespace) {
    throw new Error('AppModules.activityV2.semanticsV2 is already registered');
  }
  if (!Object.isExtensible(namespace)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const baseApi = namespace.semantics;
  if (
    !isRecord(baseApi) ||
    Reflect.ownKeys(baseApi).length !== API_KEYS.length ||
    !API_KEYS.every((key) => typeof baseApi[key] === 'function')
  ) {
    failBase('Activity V2 semantics v1 API is invalid');
  }

  let baseCatalog;
  try {
    baseCatalog = baseApi.getCatalog();
  } catch {
    failBase('Activity V2 semantics v1 catalog is unavailable');
  }
  let baseValidation;
  try {
    baseValidation = baseApi.validateCatalog(baseCatalog);
  } catch {
    failBase('Activity V2 semantics v1 validator failed');
  }
  if (
    !isRecord(baseCatalog) ||
    baseCatalog.schema_version !== SCHEMA_VERSION ||
    baseCatalog.catalog_version !== BASE_CATALOG_VERSION ||
    !Array.isArray(baseCatalog.entries) ||
    baseCatalog.entries.length !== BASE_ENTRY_COUNT ||
    !baseCatalog.entries.every((entry) => entry?.status === 'active') ||
    !isRecord(baseValidation) ||
    baseValidation.valid !== true ||
    !Array.isArray(baseValidation.errors) ||
    baseValidation.errors.length !== 0
  ) {
    failBase('Activity V2 semantics v1 catalog is not the approved baseline', baseValidation);
  }

  const catalog = cloneValue(baseCatalog);
  catalog.catalog_version = CATALOG_VERSION;
  const entryByKey = new Map(catalog.entries.map((entry) => [entry.key, entry]));
  Object.entries(ALIAS_APPENDS).forEach(([key, aliases]) => {
    const entry = entryByKey.get(key);
    if (!entry) failBase(`Activity V2 semantics v1 is missing ${key}`);
    entry.aliases.push(...aliases);
  });

  const requiredStrengthFields = {
    assistance_kg: 'forbidden',
    distance_km: 'forbidden',
    distance_m: 'forbidden',
    duration_min: 'forbidden',
    duration_sec: 'forbidden',
    note: 'optional',
    reps: 'required',
    weight_kg: 'required'
  };
  catalog.entries.push(
    {
      key: 'high_row',
      label: 'High Row',
      aliases: ['Upper Back'],
      category: 'strength',
      tracking_mode: 'strength_sets',
      equipment: 'machine',
      load_comparability: 'device_relative',
      fields: cloneValue(requiredStrengthFields),
      muscle_groups: ['back', 'biceps', 'shoulders'],
      sport_tags: [],
      status: 'active'
    },
    {
      key: 'total_abdominal',
      label: 'Total Abdominal',
      aliases: [],
      category: 'strength',
      tracking_mode: 'strength_sets',
      equipment: 'machine',
      load_comparability: 'device_relative',
      fields: cloneValue(requiredStrengthFields),
      muscle_groups: ['core', 'hip_flexors'],
      sport_tags: [],
      status: 'active'
    }
  );
  catalog.entries.sort((left, right) => asciiCompare(left.key, right.key));
  if (
    catalog.entries.length !== ENTRY_COUNT ||
    new Set(catalog.entries.map((entry) => entry.key)).size !== ENTRY_COUNT
  ) {
    failBase('Activity V2 catalog v2 entry projection is invalid');
  }

  const validation = baseApi.validateCatalog(catalog);
  if (!isRecord(validation) || validation.valid !== true) {
    const error = new Error('Activity V2 built-in catalog v2 is invalid');
    error.code = 'activity_v2_catalog_v2_invalid';
    error.validation = validation;
    throw error;
  }
  deepFreeze(catalog);

  const v2EntryByKey = new Map(catalog.entries.map((entry) => [entry.key, entry]));
  const searchIndex = catalog.entries
    .filter((entry) => entry.status === 'active')
    .map((entry) => ({
      entry,
      forms: [
        { normalized: baseApi.normalizeSearchText(entry.label), source_rank: 0 },
        { normalized: baseApi.normalizeSearchText(entry.key), source_rank: 1 },
        ...entry.aliases.map((alias) => ({
          normalized: baseApi.normalizeSearchText(alias),
          source_rank: 2
        }))
      ]
    }));

  function getCatalog() {
    return catalog;
  }

  function getEntryByKey(key) {
    if (typeof key !== 'string') {
      throw new TypeError('getEntryByKey requires a string');
    }
    return v2EntryByKey.get(key) || null;
  }

  function normalizeSearchText(text) {
    return baseApi.normalizeSearchText(text);
  }

  function validateCatalog(candidate) {
    return baseApi.validateCatalog(candidate);
  }

  function compareRank(left, right) {
    if (left.match_class !== right.match_class) {
      return left.match_class - right.match_class;
    }
    if (left.source_rank !== right.source_rank) {
      return left.source_rank - right.source_rank;
    }
    return asciiCompare(left.entry.key, right.entry.key);
  }

  function classifyForm(query, queryTokens, form) {
    const exactClass =
      form.normalized === query ? (form.source_rank === 2 ? 1 : 0) : null;
    if (exactClass !== null) {
      return {
        match_class: exactClass,
        source_rank: exactClass === 1 ? 0 : form.source_rank
      };
    }
    if (form.normalized.startsWith(query)) {
      return { match_class: 2, source_rank: form.source_rank };
    }
    const formTokens = form.normalized.split(' ');
    const tokenMatch = queryTokens.every((queryToken) =>
      formTokens.some((formToken) => formToken.startsWith(queryToken))
    );
    return tokenMatch
      ? { match_class: 3, source_rank: form.source_rank }
      : null;
  }

  function search(query, options) {
    if (options === undefined) options = {};
    if (!isRecord(options)) throw new TypeError('search options must be an object');
    const optionKeys = Object.keys(options);
    if (optionKeys.some((key) => key !== 'limit')) {
      throw new TypeError('search options contain an unknown field');
    }
    const limit = Object.prototype.hasOwnProperty.call(options, 'limit')
      ? options.limit
      : 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new RangeError('search limit must be an integer from 1 to 50');
    }

    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return EMPTY_RESULTS;
    const queryTokens = [...new Set(normalizedQuery.split(' '))];
    const matches = [];
    searchIndex.forEach((indexedEntry) => {
      let best = null;
      indexedEntry.forms.forEach((form) => {
        const classification = classifyForm(normalizedQuery, queryTokens, form);
        if (!classification) return;
        const candidate = {
          entry: indexedEntry.entry,
          match_class: classification.match_class,
          source_rank: classification.source_rank
        };
        if (best === null || compareRank(candidate, best) < 0) best = candidate;
      });
      if (best !== null) matches.push(best);
    });
    if (matches.length === 0) return EMPTY_RESULTS;
    matches.sort(compareRank);
    return Object.freeze(matches.slice(0, limit).map((match) => match.entry));
  }

  const semanticsV2Api = deepFreeze({
    getCatalog,
    getEntryByKey,
    normalizeSearchText,
    validateCatalog,
    search
  });
  Object.defineProperty(namespace, 'semanticsV2', {
    value: semanticsV2Api,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(globalThis);
