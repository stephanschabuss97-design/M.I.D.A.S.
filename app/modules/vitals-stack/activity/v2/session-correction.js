'use strict';

(function initActivityV2SessionCorrection(root) {
  const DETAIL_SCHEMA = 'midas.activity-session-detail.v1';
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const FINGERPRINT_RE = /^[0-9a-f]{64}$/;
  const REVISION_RE = /^[1-9][0-9]*$/;
  const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const MAX_REVISION = '9223372036854775807';
  const DETAIL_KEYS = Object.freeze([
    'schema_version',
    'session_id',
    'catalog_version',
    'revision',
    'content_fingerprint',
    'started_at',
    'ended_at',
    'day',
    'title',
    'duration_min',
    'note',
    'items'
  ]);
  const FIELD_KEYS = Object.freeze([
    'assistance_kg',
    'distance_km',
    'distance_m',
    'duration_min',
    'duration_sec',
    'note',
    'reps',
    'weight_kg'
  ]);
  const ITEM_KEYS = Object.freeze([
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
  const SET_KEYS = Object.freeze([
    'set_order',
    'tracking_mode',
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  const ITEM_FIELDS = Object.freeze(['duration_min', 'distance_km', 'note']);
  const SET_FIELDS = Object.freeze([
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  const SAFE_MESSAGE =
    'The activity session correction could not be completed.';

  class ActivityV2SessionCorrectionError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionCorrectionError';
      this.code = code;
    }
  }

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
  const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const asciiBtrim = (value) => value.replace(/^ +| +$/g, '');
  const textLength = (value) => Array.from(value).length;

  function fail(code) {
    throw new ActivityV2SessionCorrectionError(code);
  }

  function readExact(value, expected, code = 'INVALID_DETAIL') {
    if (!isRecord(value)) fail(code);
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expected.length ||
      keys.some((key) => typeof key !== 'string' || !expected.includes(key))
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      expected.some(
        (key) =>
          !descriptors[key] ||
          !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
      )
    ) {
      fail(code);
    }
    return Object.fromEntries(expected.map((key) => [key, descriptors[key].value]));
  }

  function deepFreeze(value, seen = new WeakSet()) {
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function') ||
      seen.has(value)
    ) {
      return value;
    }
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => deepFreeze(value[key], seen));
    return Object.freeze(value);
  }

  function assertInteger(value, min, max, code = 'INVALID_VALUE') {
    if (!Number.isSafeInteger(value) || value < min || value > max) fail(code);
    return value;
  }

  function hasAtMostTwoDecimals(value) {
    const text = String(value).toLowerCase();
    const [coefficient, exponentText] = text.split('e');
    const fractionLength = (coefficient.split('.')[1] || '').length;
    const exponent = exponentText === undefined ? 0 : Number(exponentText);
    return Number.isInteger(exponent) && Math.max(0, fractionLength - exponent) <= 2;
  }

  function assertDecimal(value, min, max) {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      !hasAtMostTwoDecimals(value)
    ) {
      fail('INVALID_VALUE');
    }
    return value;
  }

  function normalizeNote(value) {
    if (value === null) return null;
    if (typeof value !== 'string') fail('INVALID_VALUE');
    const normalized = asciiBtrim(value);
    if (textLength(normalized) > 500) fail('INVALID_VALUE');
    return normalized === '' ? null : normalized;
  }

  function assertCanonicalNullableText(value, maxLength) {
    if (value === null) return null;
    if (
      typeof value !== 'string' ||
      value === '' ||
      value !== asciiBtrim(value) ||
      textLength(value) > maxLength
    ) {
      fail('INVALID_DETAIL');
    }
    return value;
  }

  function assertDay(value) {
    if (typeof value !== 'string' || !DAY_RE.test(value)) fail('INVALID_DETAIL');
    const [year, month, day] = value.split('-').map(Number);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const maximum = [
      31,
      leap ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31
    ][month - 1];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > maximum) {
      fail('INVALID_DETAIL');
    }
    return value;
  }

  function resolveCanonicalization() {
    const source = root.AppModules?.activityV2?.sessionCanonicalization;
    if (!isRecord(source)) fail('CANONICALIZATION_MISSING');
    const descriptor = Object.getOwnPropertyDescriptor(source, 'project');
    if (
      !descriptor ||
      !Object.prototype.hasOwnProperty.call(descriptor, 'value') ||
      typeof descriptor.value !== 'function'
    ) {
      fail('CANONICALIZATION_MISSING');
    }
    return (workingCopy) => descriptor.value.call(source, workingCopy);
  }

  function readOptions(value) {
    if (value === undefined) return {};
    if (!isRecord(value)) fail('INVALID_OPTIONS');
    const keys = Reflect.ownKeys(value);
    if (
      keys.some((key) => typeof key !== 'string' || key !== 'semantics')
    ) {
      fail('INVALID_OPTIONS');
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      keys.some(
        (key) =>
          !descriptors[key] ||
          !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
      )
    ) {
      fail('INVALID_OPTIONS');
    }
    return keys.length === 0 ? {} : { semantics: descriptors.semantics.value };
  }

  function resolveSemantics(options, catalogVersion) {
    const source = hasOwn(options, 'semantics')
      ? options.semantics
      : catalogVersion === 1
        ? root.AppModules?.activityV2?.semantics
        : catalogVersion === 2
          ? root.AppModules?.activityV2?.semanticsV2
          : null;
    if (!isRecord(source)) fail('SEMANTICS_MISSING');
    const getCatalogDescriptor = Object.getOwnPropertyDescriptor(
      source,
      'getCatalog'
    );
    if (
      !getCatalogDescriptor ||
      !Object.prototype.hasOwnProperty.call(getCatalogDescriptor, 'value') ||
      typeof getCatalogDescriptor.value !== 'function'
    ) {
      fail('SEMANTICS_MISSING');
    }
    let catalog;
    try {
      catalog = getCatalogDescriptor.value.call(source);
    } catch {
      fail('INVALID_CATALOG');
    }
    if (
      !isRecord(catalog) ||
      catalog.catalog_version !== catalogVersion ||
      !Array.isArray(catalog.entries)
    ) {
      fail('CATALOG_VERSION_MISMATCH');
    }
    const entries = new Map();
    for (const entry of catalog.entries) {
      if (
        !isRecord(entry) ||
        typeof entry.key !== 'string' ||
        !ITEM_KEY_RE.test(entry.key) ||
        !['active', 'deprecated'].includes(entry.status) ||
        entries.has(entry.key)
      ) {
        fail('INVALID_CATALOG');
      }
      entries.set(entry.key, entry);
    }
    return entries;
  }

  function makeSet(source, setOrder = source.set_order) {
    return {
      set_order: setOrder,
      tracking_mode: source.tracking_mode,
      reps: source.reps,
      duration_sec: source.duration_sec,
      distance_m: source.distance_m,
      weight_kg: source.weight_kg,
      assistance_kg: source.assistance_kg
    };
  }

  function makeItem(source, changes = {}) {
    const value = { ...source, ...changes };
    return {
      item_key: value.item_key,
      item_order: value.item_order,
      item_label_snapshot: value.item_label_snapshot,
      tracking_mode_snapshot: value.tracking_mode_snapshot,
      equipment_snapshot: value.equipment_snapshot,
      load_comparability_snapshot: value.load_comparability_snapshot,
      field_policy_snapshot: Object.fromEntries(
        FIELD_KEYS.map((key) => [key, value.field_policy_snapshot[key]])
      ),
      duration_min: value.duration_min,
      distance_km: value.distance_km,
      note: value.note,
      sets: value.sets.map((set, index) => makeSet(set, index + 1))
    };
  }

  function makeWorkingCopy(source, changes = {}) {
    const value = { ...source, ...changes };
    return deepFreeze({
      catalog_version: value.catalog_version,
      duration_min: value.duration_min,
      note: value.note,
      items: value.items.map((item, index) =>
        makeItem(item, { item_order: index + 1 })
      )
    });
  }

  function validateDetailRoot(detailValue) {
    const detail = readExact(detailValue, DETAIL_KEYS);
    if (
      detail.schema_version !== DETAIL_SCHEMA ||
      typeof detail.session_id !== 'string' ||
      !UUID_RE.test(detail.session_id) ||
      typeof detail.revision !== 'string' ||
      !REVISION_RE.test(detail.revision) ||
      detail.revision.length > MAX_REVISION.length ||
      (detail.revision.length === MAX_REVISION.length &&
        detail.revision > MAX_REVISION) ||
      typeof detail.content_fingerprint !== 'string' ||
      !FINGERPRINT_RE.test(detail.content_fingerprint) ||
      typeof detail.started_at !== 'string' ||
      !TIMESTAMP_RE.test(detail.started_at) ||
      new Date(detail.started_at).toISOString() !== detail.started_at ||
      typeof detail.ended_at !== 'string' ||
      !TIMESTAMP_RE.test(detail.ended_at) ||
      new Date(detail.ended_at).toISOString() !== detail.ended_at ||
      detail.ended_at < detail.started_at
    ) {
      fail('INVALID_DETAIL');
    }
    assertDay(detail.day);
    assertCanonicalNullableText(detail.title, 120);
    assertInteger(detail.catalog_version, 1, 2147483647, 'INVALID_DETAIL');
    return detail;
  }

  function snapshotNewItem(entry, itemOrder) {
    if (
      entry.status !== 'active' ||
      typeof entry.label !== 'string' ||
      typeof entry.tracking_mode !== 'string' ||
      typeof entry.equipment !== 'string' ||
      typeof entry.load_comparability !== 'string' ||
      !isRecord(entry.fields)
    ) {
      fail('INVALID_CATALOG');
    }
    readExact(entry.fields, FIELD_KEYS, 'INVALID_CATALOG');
    const strength = entry.tracking_mode === 'strength_sets';
    return {
      item_key: entry.key,
      item_order: itemOrder,
      item_label_snapshot: entry.label,
      tracking_mode_snapshot: entry.tracking_mode,
      equipment_snapshot: entry.equipment,
      load_comparability_snapshot: entry.load_comparability,
      field_policy_snapshot: Object.fromEntries(
        FIELD_KEYS.map((key) => [key, entry.fields[key]])
      ),
      duration_min: null,
      distance_km: null,
      note: null,
      sets: strength
        ? [
            {
              set_order: 1,
              tracking_mode: 'strength_sets',
              reps: null,
              duration_sec: null,
              distance_m: null,
              weight_kg: null,
              assistance_kg: null
            }
          ]
        : []
    };
  }

  function create(detailValue, optionsValue) {
    const project = resolveCanonicalization();
    const options = readOptions(optionsValue);
    const detail = validateDetailRoot(detailValue);
    const catalogEntries = resolveSemantics(options, detail.catalog_version);
    let initialProjection;
    try {
      initialProjection = project({
        catalog_version: detail.catalog_version,
        duration_min: detail.duration_min,
        note: detail.note,
        items: detail.items
      });
    } catch {
      fail('INVALID_DETAIL');
    }
    let workingCopy = makeWorkingCopy({
      catalog_version: initialProjection.canonicalContent.catalog_version,
      duration_min: initialProjection.canonicalContent.duration_min,
      note: initialProjection.canonicalContent.note,
      items: initialProjection.canonicalContent.items
    });
    const originalText = JSON.stringify(workingCopy);
    const originalItems = new Map(
      workingCopy.items.map((item) => [item.item_key, item])
    );
    let state;

    function deriveState() {
      const dirty = JSON.stringify(workingCopy) !== originalText;
      let projection = null;
      try {
        projection = project(workingCopy);
      } catch {
        projection = null;
      }
      state = deepFreeze({
        status: dirty ? 'dirty' : 'pristine',
        valid: projection !== null,
        workingCopy,
        replacement: projection?.replacement || null,
        canonicalContent: projection?.canonicalContent || null,
        mutationRequest:
          projection === null
            ? null
            : {
                sessionId: detail.session_id,
                expectedRevision: detail.revision,
                expectedContentFingerprint: detail.content_fingerprint,
                session: projection.replacement
              }
      });
      return state;
    }

    function replaceWorking(changes) {
      workingCopy = makeWorkingCopy(workingCopy, changes);
      return deriveState();
    }

    function findItem(itemKey) {
      if (typeof itemKey !== 'string' || !ITEM_KEY_RE.test(itemKey)) {
        fail('INVALID_ITEM_KEY');
      }
      const index = workingCopy.items.findIndex(
        (item) => item.item_key === itemKey
      );
      if (index === -1) fail('ITEM_NOT_FOUND');
      return { item: workingCopy.items[index], index };
    }

    function getState() {
      return state;
    }

    function setDurationMin(value) {
      const next = value === null ? null : assertInteger(value, 1, 1440);
      if (next === workingCopy.duration_min) return state;
      return replaceWorking({ duration_min: next });
    }

    function setNote(value) {
      const next = normalizeNote(value);
      if (next === workingCopy.note) return state;
      return replaceWorking({ note: next });
    }

    function addItem(itemKey) {
      if (typeof itemKey !== 'string' || !ITEM_KEY_RE.test(itemKey)) {
        fail('INVALID_ITEM_KEY');
      }
      if (workingCopy.items.some((item) => item.item_key === itemKey)) {
        fail('DUPLICATE_ITEM');
      }
      if (workingCopy.items.length >= 50) fail('ITEM_LIMIT_REACHED');
      const original = originalItems.get(itemKey);
      const next = original
        ? makeItem(original, { item_order: workingCopy.items.length + 1 })
        : snapshotNewItem(
            catalogEntries.get(itemKey) || fail('ITEM_NOT_FOUND'),
            workingCopy.items.length + 1
          );
      return replaceWorking({ items: [...workingCopy.items, next] });
    }

    function removeItem(itemKey) {
      const { index } = findItem(itemKey);
      const items = [...workingCopy.items];
      items.splice(index, 1);
      return replaceWorking({ items });
    }

    function moveItem(itemKey, targetOrder) {
      const { index } = findItem(itemKey);
      if (
        !Number.isSafeInteger(targetOrder) ||
        targetOrder < 1 ||
        targetOrder > workingCopy.items.length
      ) {
        fail('INVALID_ITEM_ORDER');
      }
      if (index === targetOrder - 1) return state;
      const items = [...workingCopy.items];
      const [item] = items.splice(index, 1);
      items.splice(targetOrder - 1, 0, item);
      return replaceWorking({ items });
    }

    function setItemField(itemKey, fieldKey, value) {
      const { item, index } = findItem(itemKey);
      if (!ITEM_FIELDS.includes(fieldKey)) fail('INVALID_ITEM_FIELD');
      if (item.field_policy_snapshot[fieldKey] === 'forbidden') {
        fail('FORBIDDEN_ITEM_FIELD');
      }
      const next =
        fieldKey === 'note'
          ? normalizeNote(value)
          : value === null
            ? null
            : fieldKey === 'duration_min'
              ? assertInteger(value, 1, 1440)
              : assertDecimal(value, 0.01, 1000);
      if (next === item[fieldKey]) return state;
      const items = [...workingCopy.items];
      items[index] = makeItem(item, { [fieldKey]: next });
      return replaceWorking({ items });
    }

    function addSet(itemKey) {
      const { item, index } = findItem(itemKey);
      if (item.tracking_mode_snapshot !== 'strength_sets') {
        fail('NOT_STRENGTH_ITEM');
      }
      if (item.sets.length >= 50) fail('SET_LIMIT_REACHED');
      const items = [...workingCopy.items];
      items[index] = makeItem(item, {
        sets: [
          ...item.sets,
          {
            set_order: item.sets.length + 1,
            tracking_mode: 'strength_sets',
            reps: null,
            duration_sec: null,
            distance_m: null,
            weight_kg: null,
            assistance_kg: null
          }
        ]
      });
      return replaceWorking({ items });
    }

    function removeSet(itemKey, setOrder) {
      const { item, index } = findItem(itemKey);
      if (item.tracking_mode_snapshot !== 'strength_sets') {
        fail('NOT_STRENGTH_ITEM');
      }
      if (!Number.isSafeInteger(setOrder) || setOrder < 1) {
        fail('INVALID_SET_ORDER');
      }
      const setIndex = item.sets.findIndex((set) => set.set_order === setOrder);
      if (setIndex === -1) fail('SET_NOT_FOUND');
      if (item.sets.length === 1) fail('SET_MINIMUM_REACHED');
      const sets = [...item.sets];
      sets.splice(setIndex, 1);
      const items = [...workingCopy.items];
      items[index] = makeItem(item, { sets });
      return replaceWorking({ items });
    }

    function setSetField(itemKey, setOrder, fieldKey, value) {
      const { item, index } = findItem(itemKey);
      if (item.tracking_mode_snapshot !== 'strength_sets') {
        fail('NOT_STRENGTH_ITEM');
      }
      if (!Number.isSafeInteger(setOrder) || setOrder < 1) {
        fail('INVALID_SET_ORDER');
      }
      if (!SET_FIELDS.includes(fieldKey)) fail('INVALID_SET_FIELD');
      if (item.field_policy_snapshot[fieldKey] === 'forbidden') {
        fail('FORBIDDEN_SET_FIELD');
      }
      const setIndex = item.sets.findIndex((set) => set.set_order === setOrder);
      if (setIndex === -1) fail('SET_NOT_FOUND');
      let next = null;
      if (value !== null) {
        next =
          fieldKey === 'reps'
            ? assertInteger(value, 1, 1000)
            : fieldKey === 'duration_sec'
              ? assertInteger(value, 1, 3600)
              : fieldKey === 'distance_m'
                ? assertDecimal(value, 0.1, 10000)
                : assertDecimal(value, 0.01, 1000);
      }
      if (next === item.sets[setIndex][fieldKey]) return state;
      const sets = [...item.sets];
      sets[setIndex] = makeSet({ ...sets[setIndex], [fieldKey]: next });
      const items = [...workingCopy.items];
      items[index] = makeItem(item, { sets });
      return replaceWorking({ items });
    }

    deriveState();
    return deepFreeze({
      getState,
      setDurationMin,
      setNote,
      addItem,
      removeItem,
      moveItem,
      setItemField,
      addSet,
      removeSet,
      setSetField
    });
  }

  if (root.AppModules === undefined) {
    root.AppModules = {};
  } else if (!isRecord(root.AppModules)) {
    throw new TypeError('AppModules must be an object');
  }
  if (root.AppModules.activityV2 === undefined) {
    root.AppModules.activityV2 = {};
  } else if (!isRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('sessionCorrection' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionCorrection is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.defineProperty(root.AppModules.activityV2, 'sessionCorrection', {
    value: deepFreeze({ create }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
