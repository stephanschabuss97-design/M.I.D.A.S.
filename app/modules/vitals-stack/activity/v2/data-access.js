'use strict';

(function initActivityV2DataAccess(root) {
  const REQUEST_SCHEMA = 'midas.activity-session.v1';
  const COMMIT_RESULT_SCHEMA = 'midas.activity-session-result.v1';
  const LOOKUP_RESULT_SCHEMA = 'midas.activity-last-performance.v1';
  const HISTORY_PAGE_SCHEMA = 'midas.activity-session-history-page.v1';
  const DETAIL_SCHEMA = 'midas.activity-session-detail.v1';
  const REPLACEMENT_SCHEMA = 'midas.activity-session-replacement.v1';
  const MUTATION_RESULT_SCHEMA = 'midas.activity-session-mutation-result.v1';
  const DEFAULT_HISTORY_LIMIT = 20;
  const MAX_HISTORY_LIMIT = 50;
  const MAX_BIGINT_TEXT = '9223372036854775807';
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const CANONICAL_UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const FINGERPRINT_RE = /^[0-9a-f]{64}$/;
  const REVISION_RE = /^[1-9][0-9]*$/;
  const R9_RESPONSE_TIMESTAMP_RE =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const REQUEST_TIMESTAMP_RE =
    /^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?([Zz]|([+-])(\d{2}):(\d{2}))$/;
  const RESPONSE_TIMESTAMP_RE =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;
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
  const TOP_LEVEL_KEYS = Object.freeze([
    'catalog_version',
    'duration_min',
    'ended_at',
    'items',
    'note',
    'schema_version',
    'started_at',
    'title'
  ]);
  const ITEM_KEYS = Object.freeze([
    'distance_km',
    'duration_min',
    'item_key',
    'item_order',
    'note',
    'sets'
  ]);
  const SET_KEYS = Object.freeze([
    'assistance_kg',
    'distance_m',
    'duration_sec',
    'reps',
    'set_order',
    'weight_kg'
  ]);
  const HISTORICAL_TRACKING_MODES = Object.freeze([
    'duration',
    'duration_distance',
    'strength_sets'
  ]);
  const HISTORICAL_EQUIPMENT = Object.freeze([
    'barbell',
    'bodyweight',
    'cable',
    'cardio_machine',
    'dumbbell',
    'kettlebell',
    'machine',
    'none',
    'variable'
  ]);
  const HISTORICAL_LOAD_COMPARABILITY = Object.freeze([
    'device_relative',
    'not_applicable',
    'standardized'
  ]);
  const SQL_TOKEN_CODES = Object.freeze({
    MIDAS_ACTIVITY_AUTH_REQUIRED: 'AUTH_REQUIRED',
    MIDAS_ACTIVITY_IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
    MIDAS_ACTIVITY_INVALID_ITEM_KEY: 'INVALID_ITEM_KEY',
    MIDAS_ACTIVITY_INVALID_SESSION: 'INVALID_SESSION',
    MIDAS_ACTIVITY_REVISION_EXHAUSTED: 'REVISION_EXHAUSTED',
    MIDAS_ACTIVITY_SESSION_CONFLICT: 'SESSION_CONFLICT',
    MIDAS_ACTIVITY_SESSION_NOT_FOUND: 'SESSION_NOT_FOUND'
  });
  const SAFE_MESSAGES = Object.freeze({
    AUTH_REQUIRED: 'Authentication is required.',
    IDEMPOTENCY_CONFLICT: 'The request ID is already bound to different data.',
    INVALID_HISTORY_REQUEST: 'The activity history request is invalid.',
    INVALID_ITEM_KEY: 'The activity item key is invalid.',
    INVALID_SESSION: 'The activity session is invalid.',
    MUTATION_OUTCOME_UNKNOWN: 'The activity mutation outcome is unknown.',
    REVISION_EXHAUSTED: 'The activity session revision is exhausted.',
    REQUEST_FAILED: 'The activity request could not be completed.',
    SESSION_CONFLICT: 'The activity session changed before the mutation.',
    SESSION_NOT_FOUND: 'The activity session was not found.'
  });

  class ContractViolation extends Error {}

  class ActivityV2DataAccessError extends Error {
    constructor(code, operation, retryable, commitState, mutationState) {
      super(SAFE_MESSAGES[code] || SAFE_MESSAGES.REQUEST_FAILED);
      this.name = 'ActivityV2DataAccessError';
      this.code = code;
      this.operation = operation;
      this.retryable = retryable === true;
      if (operation === 'commitSession') {
        this.commitState = commitState === 'unknown' ? 'unknown' : 'not_committed';
      }
      if (operation === 'replaceSession' || operation === 'deleteSession') {
        this.mutationState =
          mutationState === 'unknown' ? 'unknown' : 'not_applied';
      }
    }
  }

  const violation = () => {
    throw new ContractViolation('contract-violation');
  };

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  const asciiBtrim = (value) => value.replace(/^ +| +$/g, '');
  const textLength = (value) => Array.from(value).length;

  function assertExactKeys(value, allowed, required = allowed) {
    if (!isRecord(value)) violation();
    const keys = Object.keys(value);
    if (keys.some((key) => !allowed.includes(key))) violation();
    if (required.some((key) => !Object.prototype.hasOwnProperty.call(value, key))) {
      violation();
    }
  }

  function assertExactDataKeys(value, expected) {
    if (!isRecord(value)) violation();
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expected.length ||
      keys.some((key) => typeof key !== 'string' || !expected.includes(key))
    ) {
      violation();
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      expected.some(
        (key) =>
          !descriptors[key] ||
          !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
      )
    ) {
      violation();
    }
    return Object.fromEntries(expected.map((key) => [key, descriptors[key].value]));
  }

  function assertDenseArray(value, min, max) {
    if (!Array.isArray(value) || value.length < min || value.length > max) {
      violation();
    }
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== value.length + 1 ||
      keys[keys.length - 1] !== 'length' ||
      value.some((_, index) => keys[index] !== String(index))
    ) {
      violation();
    }
    return value;
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

  function assertUuid(value) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) violation();
    return value;
  }

  function assertCanonicalUuid(value) {
    if (typeof value !== 'string' || !CANONICAL_UUID_RE.test(value)) violation();
    return value;
  }

  function assertFingerprint(value) {
    if (typeof value !== 'string' || !FINGERPRINT_RE.test(value)) violation();
    return value;
  }

  function assertRevision(value) {
    if (
      typeof value !== 'string' ||
      !REVISION_RE.test(value) ||
      value.length > MAX_BIGINT_TEXT.length ||
      (value.length === MAX_BIGINT_TEXT.length && value > MAX_BIGINT_TEXT)
    ) {
      violation();
    }
    return value;
  }

  function assertR9ResponseTimestamp(value) {
    if (
      typeof value !== 'string' ||
      !R9_RESPONSE_TIMESTAMP_RE.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString() !== value
    ) {
      violation();
    }
    return value;
  }

  function assertInteger(value, min, max) {
    if (!Number.isSafeInteger(value) || value < min || value > max) violation();
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
      violation();
    }
    return value;
  }

  function normalizeOptionalText(value, maxLength) {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') violation();
    const normalized = asciiBtrim(value);
    if (normalized === '') return null;
    if (textLength(normalized) > maxLength) violation();
    return normalized;
  }

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function daysInMonth(year, month) {
    return [
      31,
      isLeapYear(year) ? 29 : 28,
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
  }

  function parseTimestampMicros(value, responseFormat = false) {
    if (typeof value !== 'string') violation();
    if (responseFormat && !RESPONSE_TIMESTAMP_RE.test(value)) violation();
    const match = REQUEST_TIMESTAMP_RE.exec(value);
    if (!match) violation();

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] === undefined ? 0 : Number(match[6]);
    const fraction = match[7] || '';
    if (
      year < 1 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > daysInMonth(year, month) ||
      hour > 23 ||
      minute > 59 ||
      second > 59
    ) {
      violation();
    }

    let offsetMinutes = 0;
    if (!/^[Zz]$/.test(match[8])) {
      const offsetHour = Number(match[10]);
      const offsetMinute = Number(match[11]);
      if (
        offsetHour > 14 ||
        offsetMinute > 59 ||
        (offsetHour === 14 && offsetMinute !== 0)
      ) {
        violation();
      }
      offsetMinutes = (offsetHour * 60 + offsetMinute) * (match[9] === '+' ? 1 : -1);
    }

    const base = new Date(0);
    base.setUTCFullYear(year, month - 1, day);
    base.setUTCHours(hour, minute, second, 0);
    if (!Number.isFinite(base.getTime())) violation();

    let micros = Number((fraction.slice(0, 6) + '000000').slice(0, 6));
    if (fraction.length > 6 && Number(fraction[6]) >= 5) micros += 1;
    let carrySeconds = 0;
    if (micros === 1000000) {
      micros = 0;
      carrySeconds = 1;
    }

    return (
      BigInt(base.getTime()) * 1000n +
      BigInt(micros) +
      BigInt(carrySeconds - offsetMinutes * 60) * 1000000n
    );
  }

  function assertDay(value) {
    if (typeof value !== 'string' || !DAY_RE.test(value)) violation();
    const [year, month, day] = value.split('-').map(Number);
    if (
      year < 1 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > daysInMonth(year, month)
    ) {
      violation();
    }
    return value;
  }

  function getSemantics() {
    const semantics = root.AppModules?.activityV2?.semantics;
    if (
      !semantics ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function'
    ) {
      return null;
    }
    return semantics;
  }

  function assertFieldPolicy(policy) {
    assertExactKeys(policy, FIELD_KEYS);
    FIELD_KEYS.forEach((key) => {
      if (!['forbidden', 'optional', 'required'].includes(policy[key])) violation();
    });
    return policy;
  }

  function assertPolicyValue(policy, key, value) {
    const rule = policy[key];
    if ((rule === 'required' && value === null) || (rule === 'forbidden' && value !== null)) {
      violation();
    }
  }

  function normalizeOptionalInteger(value, min, max) {
    return value === undefined || value === null
      ? null
      : assertInteger(value, min, max);
  }

  function normalizeOptionalDecimal(value, min, max) {
    return value === undefined || value === null
      ? null
      : assertDecimal(value, min, max);
  }

  function normalizeExplicitNullableInteger(value, min, max) {
    if (value === undefined) violation();
    return value === null ? null : assertInteger(value, min, max);
  }

  function normalizeExplicitNullableDecimal(value, min, max) {
    if (value === undefined) violation();
    return value === null ? null : assertDecimal(value, min, max);
  }

  function normalizeExplicitNullableText(value, maxLength) {
    if (value === undefined) violation();
    return normalizeOptionalText(value, maxLength);
  }

  function normalizeSet(setValue, policy) {
    assertExactKeys(setValue, SET_KEYS, ['set_order']);
    const set = {
      set_order: assertInteger(setValue.set_order, 1, 50),
      reps: normalizeOptionalInteger(setValue.reps, 1, 1000),
      duration_sec: normalizeOptionalInteger(setValue.duration_sec, 1, 3600),
      distance_m: normalizeOptionalDecimal(setValue.distance_m, 0.1, 10000),
      weight_kg: normalizeOptionalDecimal(setValue.weight_kg, 0.01, 1000),
      assistance_kg: normalizeOptionalDecimal(setValue.assistance_kg, 0.01, 1000)
    };
    const primaryCount = [set.reps, set.duration_sec, set.distance_m].filter(
      (value) => value !== null
    ).length;
    if (primaryCount !== 1) violation();
    if (set.weight_kg !== null && set.assistance_kg !== null) violation();
    ['reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'].forEach(
      (key) => assertPolicyValue(policy, key, set[key])
    );
    return set;
  }

  function normalizeItem(
    itemValue,
    semantics,
    catalogVersion,
    { allowDeprecated = false } = {}
  ) {
    assertExactKeys(itemValue, ITEM_KEYS, ['item_key', 'item_order', 'sets']);
    if (
      typeof itemValue.item_key !== 'string' ||
      textLength(itemValue.item_key) < 1 ||
      textLength(itemValue.item_key) > 64 ||
      !ITEM_KEY_RE.test(itemValue.item_key)
    ) {
      violation();
    }
    const entry = semantics.getEntryByKey(itemValue.item_key);
    if (
      !entry ||
      (!allowDeprecated && entry.status !== 'active') ||
      semantics.getCatalog().catalog_version !== catalogVersion
    ) {
      violation();
    }
    const policy = assertFieldPolicy(entry.fields);
    if (!Array.isArray(itemValue.sets) || itemValue.sets.length > 50) violation();

    const item = {
      item_key: itemValue.item_key,
      item_order: assertInteger(itemValue.item_order, 1, 50),
      duration_min: normalizeOptionalInteger(itemValue.duration_min, 1, 1440),
      distance_km: normalizeOptionalDecimal(itemValue.distance_km, 0.01, 1000),
      note: normalizeOptionalText(itemValue.note, 500),
      sets: itemValue.sets.map((setValue) => normalizeSet(setValue, policy))
    };
    const setOrders = new Set(item.sets.map((set) => set.set_order));
    if (
      setOrders.size !== item.sets.length ||
      [...setOrders].some((order) => order > item.sets.length)
    ) {
      violation();
    }
    item.sets.sort((left, right) => left.set_order - right.set_order);

    if (
      (entry.tracking_mode === 'strength_sets' && item.sets.length < 1) ||
      (entry.tracking_mode !== 'strength_sets' && item.sets.length !== 0)
    ) {
      violation();
    }
    ['duration_min', 'distance_km', 'note'].forEach((key) =>
      assertPolicyValue(policy, key, item[key])
    );
    return item;
  }

  function readCommitOptions(options) {
    if (!isRecord(options)) violation();
    const keys = Reflect.ownKeys(options);
    if (
      ![2, 3].includes(keys.length) ||
      keys.some(
        (key) =>
          typeof key !== 'string' ||
          !['payload', 'requestId', 'semantics'].includes(key)
      ) ||
      !Object.prototype.hasOwnProperty.call(options, 'payload') ||
      !Object.prototype.hasOwnProperty.call(options, 'requestId')
    ) {
      violation();
    }
    const descriptors = Object.getOwnPropertyDescriptors(options);
    if (
      keys.some(
        (key) =>
          !descriptors[key] ||
          !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
      )
    ) {
      violation();
    }
    return {
      requestId: descriptors.requestId.value,
      payload: descriptors.payload.value,
      semantics: Object.prototype.hasOwnProperty.call(descriptors, 'semantics')
        ? descriptors.semantics.value
        : undefined,
      semanticsProvided: Object.prototype.hasOwnProperty.call(
        descriptors,
        'semantics'
      )
    };
  }

  function readOwnFunction(value, key) {
    if (!isRecord(value)) return null;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor &&
      Object.prototype.hasOwnProperty.call(descriptor, 'value') &&
      typeof descriptor.value === 'function'
      ? descriptor.value
      : null;
  }

  function resolveCommitSemantics(provided, semanticsValue) {
    const source = provided ? semanticsValue : getSemantics();
    if (!source && !provided) {
      throw new Error('activity-v2-semantics-missing');
    }
    const getCatalog = readOwnFunction(source, 'getCatalog');
    const getEntryByKey = readOwnFunction(source, 'getEntryByKey');
    if (!getCatalog || !getEntryByKey) violation();
    const semantics = Object.freeze({
      getCatalog(...args) {
        return getCatalog.apply(source, args);
      },
      getEntryByKey(...args) {
        return getEntryByKey.apply(source, args);
      }
    });
    const catalog = semantics.getCatalog();
    if (
      !isRecord(catalog) ||
      !Number.isSafeInteger(catalog.catalog_version) ||
      catalog.catalog_version < 1 ||
      catalog.catalog_version > 2147483647
    ) {
      violation();
    }
    return { semantics, catalog };
  }

  function normalizeCommitRequest(options) {
    const selected = readCommitOptions(options);
    const requestId = assertUuid(selected.requestId);
    const payload = selected.payload;
    assertExactKeys(payload, TOP_LEVEL_KEYS, [
      'catalog_version',
      'duration_min',
      'ended_at',
      'items',
      'schema_version',
      'started_at'
    ]);
    if (payload.schema_version !== REQUEST_SCHEMA) violation();

    const { semantics, catalog } = resolveCommitSemantics(
      selected.semanticsProvided,
      selected.semantics
    );
    const catalogVersion = assertInteger(payload.catalog_version, 1, 2147483647);
    if (catalogVersion !== catalog.catalog_version) violation();

    const startedMicros = parseTimestampMicros(payload.started_at);
    const endedMicros = parseTimestampMicros(payload.ended_at);
    if (endedMicros < startedMicros) violation();
    if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 50) {
      violation();
    }

    const items = payload.items.map((item) =>
      normalizeItem(item, semantics, catalogVersion)
    );
    const itemOrders = new Set(items.map((item) => item.item_order));
    const itemKeys = new Set(items.map((item) => item.item_key));
    if (
      itemOrders.size !== items.length ||
      itemKeys.size !== items.length ||
      [...itemOrders].some((order) => order > items.length)
    ) {
      violation();
    }
    items.sort((left, right) => left.item_order - right.item_order);

    return {
      requestId,
      semantics,
      payload: {
        schema_version: REQUEST_SCHEMA,
        catalog_version: catalogVersion,
        started_at: payload.started_at,
        ended_at: payload.ended_at,
        duration_min: assertInteger(payload.duration_min, 1, 1440),
        title: normalizeOptionalText(payload.title, 120),
        note: normalizeOptionalText(payload.note, 500),
        items
      }
    };
  }

  function resolveLookupSemantics(optionsProvided, optionsValue) {
    let semantics;
    if (!optionsProvided) {
      semantics = getSemantics();
    } else {
      if (!isRecord(optionsValue)) violation();
      const optionKeys = Reflect.ownKeys(optionsValue);
      if (
        optionKeys.length !== 1 ||
        optionKeys[0] !== 'semantics' ||
        !Object.prototype.hasOwnProperty.call(optionsValue, 'semantics')
      ) {
        violation();
      }
      semantics = optionsValue.semantics;
    }
    if (
      !isRecord(semantics) ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function'
    ) {
      violation();
    }
    const catalog = semantics.getCatalog();
    if (
      !isRecord(catalog) ||
      !Number.isSafeInteger(catalog.catalog_version) ||
      catalog.catalog_version < 1 ||
      catalog.catalog_version > 2147483647
    ) {
      violation();
    }
    return semantics;
  }

  function normalizeLookupKey(value) {
    if (typeof value !== 'string') violation();
    const itemKey = asciiBtrim(value);
    if (
      textLength(itemKey) < 1 ||
      textLength(itemKey) > 64 ||
      !ITEM_KEY_RE.test(itemKey)
    ) {
      violation();
    }
    return itemKey;
  }

  function selectedSemanticsHasKey(semantics, itemKey) {
    const entry = semantics.getEntryByKey(itemKey);
    if (entry === null || entry === undefined) return false;
    if (!isRecord(entry) || entry.key !== itemKey) violation();
    return true;
  }

  function assertCanonicalOptionalText(value, maxLength) {
    if (value === null) return null;
    if (
      typeof value !== 'string' ||
      value === '' ||
      value !== asciiBtrim(value) ||
      textLength(value) > maxLength
    ) {
      violation();
    }
    return value;
  }

  function assertResponseTimestamp(value) {
    parseTimestampMicros(value, true);
    return value;
  }

  function assertPolicySnapshot(value, expected) {
    assertFieldPolicy(value);
    FIELD_KEYS.forEach((key) => {
      if (value[key] !== expected[key]) violation();
    });
  }

  function validateSetResponse(value, policy, expected) {
    assertExactKeys(value, [
      'assistance_kg',
      'created_at',
      'distance_m',
      'duration_sec',
      'id',
      'reps',
      'set_order',
      'tracking_mode',
      'weight_kg'
    ]);
    assertUuid(value.id);
    assertResponseTimestamp(value.created_at);
    if (value.tracking_mode !== 'strength_sets') violation();
    const normalized = normalizeSet(
      {
        set_order: value.set_order,
        reps: value.reps,
        duration_sec: value.duration_sec,
        distance_m: value.distance_m,
        weight_kg: value.weight_kg,
        assistance_kg: value.assistance_kg
      },
      policy
    );
    if (expected) {
      SET_KEYS.forEach((key) => {
        if (normalized[key] !== expected[key]) violation();
      });
    }
    return normalized;
  }

  function validateItemResponse(
    value,
    semantics,
    expected,
    expectedCatalogVersion
  ) {
    assertExactKeys(value, [
      'catalog_version',
      'created_at',
      'distance_km',
      'duration_min',
      'equipment_snapshot',
      'field_policy_snapshot',
      'id',
      'item_key',
      'item_label_snapshot',
      'item_order',
      'load_comparability_snapshot',
      'note',
      'sets',
      'tracking_mode_snapshot'
    ]);
    assertUuid(value.id);
    assertResponseTimestamp(value.created_at);
    const catalog = semantics.getCatalog();
    const entry = semantics.getEntryByKey(value.item_key);
    if (
      !entry ||
      value.catalog_version !== expectedCatalogVersion ||
      catalog.catalog_version !== expectedCatalogVersion ||
      value.catalog_version !== catalog.catalog_version ||
      value.item_label_snapshot !== entry.label ||
      value.tracking_mode_snapshot !== entry.tracking_mode ||
      value.equipment_snapshot !== entry.equipment ||
      value.load_comparability_snapshot !== entry.load_comparability
    ) {
      violation();
    }
    assertPolicySnapshot(value.field_policy_snapshot, entry.fields);
    if (!Array.isArray(value.sets)) violation();
    const comparable = normalizeItem(
      {
        item_key: value.item_key,
        item_order: value.item_order,
        duration_min: value.duration_min,
        distance_km: value.distance_km,
        note: value.note,
        sets: value.sets.map((set) => ({
          set_order: set.set_order,
          reps: set.reps,
          duration_sec: set.duration_sec,
          distance_m: set.distance_m,
          weight_kg: set.weight_kg,
          assistance_kg: set.assistance_kg
        }))
      },
      semantics,
      catalog.catalog_version,
      { allowDeprecated: true }
    );
    value.sets.forEach((set, index) => {
      if (set.set_order !== index + 1) violation();
      validateSetResponse(set, entry.fields, expected?.sets[index]);
    });
    if (expected) {
      ITEM_KEYS.filter((key) => key !== 'sets').forEach((key) => {
        if (comparable[key] !== expected[key]) violation();
      });
      if (value.sets.length !== expected.sets.length) violation();
    }
    return comparable;
  }

  function validateCommitResponse(value, request) {
    assertExactKeys(value, ['outcome', 'schema_version', 'session']);
    if (
      value.schema_version !== COMMIT_RESULT_SCHEMA ||
      !['created', 'replayed'].includes(value.outcome)
    ) {
      violation();
    }
    const session = value.session;
    assertExactKeys(session, [
      'created_at',
      'day',
      'duration_min',
      'ended_at',
      'id',
      'items',
      'note',
      'request_id',
      'started_at',
      'title',
      'updated_at'
    ]);
    assertUuid(session.id);
    assertUuid(session.request_id);
    if (session.request_id.toLowerCase() !== request.requestId.toLowerCase()) violation();
    if (
      parseTimestampMicros(assertResponseTimestamp(session.started_at)) !==
        parseTimestampMicros(request.payload.started_at) ||
      parseTimestampMicros(assertResponseTimestamp(session.ended_at)) !==
        parseTimestampMicros(request.payload.ended_at)
    ) {
      violation();
    }
    assertResponseTimestamp(session.created_at);
    assertResponseTimestamp(session.updated_at);
    assertDay(session.day);
    if (
      session.duration_min !== request.payload.duration_min ||
      assertCanonicalOptionalText(session.title, 120) !== request.payload.title ||
      assertCanonicalOptionalText(session.note, 500) !== request.payload.note ||
      !Array.isArray(session.items) ||
      session.items.length !== request.payload.items.length
    ) {
      violation();
    }
    const semantics = request.semantics;
    if (!semantics) violation();
    session.items.forEach((item, index) =>
      validateItemResponse(
        item,
        semantics,
        request.payload.items[index],
        request.payload.catalog_version
      )
    );
    return value;
  }

  function assertHistoricalPolicySnapshot(
    policyValue,
    trackingMode,
    equipment,
    loadComparability
  ) {
    const policy = assertFieldPolicy(policyValue);
    const primaryPolicies = [
      policy.reps,
      policy.duration_sec,
      policy.distance_m
    ];
    const activeLoads = [policy.weight_kg, policy.assistance_kg].filter(
      (rule) => rule !== 'forbidden'
    ).length;
    const hasWeight = policy.weight_kg !== 'forbidden';
    const hasAssistance = policy.assistance_kg !== 'forbidden';

    if (policy.note !== 'optional') violation();
    if (trackingMode === 'strength_sets') {
      if (
        primaryPolicies.filter((rule) => rule === 'required').length !== 1 ||
        primaryPolicies.some(
          (rule) => rule !== 'required' && rule !== 'forbidden'
        ) ||
        policy.duration_min !== 'forbidden' ||
        policy.distance_km !== 'forbidden' ||
        activeLoads > 1
      ) {
        violation();
      }
    } else if (trackingMode === 'duration') {
      if (
        policy.duration_min !== 'required' ||
        policy.distance_km !== 'forbidden' ||
        policy.reps !== 'forbidden' ||
        policy.duration_sec !== 'forbidden' ||
        policy.distance_m !== 'forbidden' ||
        activeLoads !== 0
      ) {
        violation();
      }
    } else if (
      policy.duration_min !== 'required' ||
      policy.distance_km !== 'optional' ||
      policy.reps !== 'forbidden' ||
      policy.duration_sec !== 'forbidden' ||
      policy.distance_m !== 'forbidden' ||
      activeLoads !== 0
    ) {
      violation();
    }

    if (!hasWeight && !hasAssistance) {
      if (loadComparability !== 'not_applicable') violation();
    } else if (hasAssistance) {
      if (loadComparability !== 'device_relative') violation();
    } else if (
      !['device_relative', 'standardized'].includes(loadComparability) ||
      (['cable', 'machine', 'variable'].includes(equipment) &&
        loadComparability !== 'device_relative')
    ) {
      violation();
    }
    return policy;
  }

  function validateHistoricalSetResponse(value, policy, expectedOrder) {
    assertExactKeys(value, [
      'assistance_kg',
      'created_at',
      'distance_m',
      'duration_sec',
      'id',
      'reps',
      'set_order',
      'tracking_mode',
      'weight_kg'
    ]);
    assertUuid(value.id);
    assertResponseTimestamp(value.created_at);
    if (
      value.tracking_mode !== 'strength_sets' ||
      value.set_order !== expectedOrder
    ) {
      violation();
    }
    normalizeSet(
      {
        set_order: value.set_order,
        reps: value.reps,
        duration_sec: value.duration_sec,
        distance_m: value.distance_m,
        weight_kg: value.weight_kg,
        assistance_kg: value.assistance_kg
      },
      policy
    );
  }

  function validateHistoricalItemResponse(value, itemKey) {
    assertExactKeys(value, [
      'catalog_version',
      'created_at',
      'distance_km',
      'duration_min',
      'equipment_snapshot',
      'field_policy_snapshot',
      'id',
      'item_key',
      'item_label_snapshot',
      'item_order',
      'load_comparability_snapshot',
      'note',
      'sets',
      'tracking_mode_snapshot'
    ]);
    assertUuid(value.id);
    assertResponseTimestamp(value.created_at);
    assertInteger(value.catalog_version, 1, 2147483647);
    assertInteger(value.item_order, 1, 50);
    if (value.item_key !== itemKey) violation();
    if (
      typeof value.item_label_snapshot !== 'string' ||
      value.item_label_snapshot !== asciiBtrim(value.item_label_snapshot) ||
      textLength(value.item_label_snapshot) < 1 ||
      textLength(value.item_label_snapshot) > 80 ||
      !HISTORICAL_TRACKING_MODES.includes(value.tracking_mode_snapshot) ||
      !HISTORICAL_EQUIPMENT.includes(value.equipment_snapshot) ||
      !HISTORICAL_LOAD_COMPARABILITY.includes(
        value.load_comparability_snapshot
      )
    ) {
      violation();
    }
    const policy = assertHistoricalPolicySnapshot(
      value.field_policy_snapshot,
      value.tracking_mode_snapshot,
      value.equipment_snapshot,
      value.load_comparability_snapshot
    );
    const durationMin = normalizeOptionalInteger(value.duration_min, 1, 1440);
    const distanceKm = normalizeOptionalDecimal(value.distance_km, 0.01, 1000);
    const note = assertCanonicalOptionalText(value.note, 500);
    assertPolicyValue(policy, 'duration_min', durationMin);
    assertPolicyValue(policy, 'distance_km', distanceKm);
    assertPolicyValue(policy, 'note', note);
    if (!Array.isArray(value.sets)) violation();
    if (
      (value.tracking_mode_snapshot === 'strength_sets' &&
        (value.sets.length < 1 || value.sets.length > 50)) ||
      (value.tracking_mode_snapshot !== 'strength_sets' &&
        value.sets.length !== 0)
    ) {
      violation();
    }
    value.sets.forEach((set, index) =>
      validateHistoricalSetResponse(set, policy, index + 1)
    );
  }

  function validateLookupResponse(value, itemKey) {
    if (value === null) return null;
    assertExactKeys(value, ['item', 'schema_version', 'session']);
    if (value.schema_version !== LOOKUP_RESULT_SCHEMA) violation();
    assertExactKeys(value.session, ['day', 'id', 'started_at']);
    assertUuid(value.session.id);
    assertResponseTimestamp(value.session.started_at);
    assertDay(value.session.day);
    validateHistoricalItemResponse(value.item, itemKey);
    return value;
  }

  function readOptionalDataOptions(value, allowedKeys) {
    if (value === undefined) return {};
    if (!isRecord(value)) violation();
    const keys = Reflect.ownKeys(value);
    if (
      keys.some((key) => typeof key !== 'string' || !allowedKeys.includes(key))
    ) {
      violation();
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      keys.some(
        (key) =>
          !descriptors[key] ||
          !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
      )
    ) {
      violation();
    }
    return Object.fromEntries(keys.map((key) => [key, descriptors[key].value]));
  }

  function normalizeHistoryRequest(optionsValue) {
    const options = readOptionalDataOptions(optionsValue, ['cursor', 'limit']);
    const limit = Object.prototype.hasOwnProperty.call(options, 'limit')
      ? assertInteger(options.limit, 1, MAX_HISTORY_LIMIT)
      : DEFAULT_HISTORY_LIMIT;
    let cursorStartedAt = null;
    let cursorId = null;
    if (Object.prototype.hasOwnProperty.call(options, 'cursor')) {
      if (options.cursor !== null) {
        const cursor = assertExactDataKeys(options.cursor, ['started_at', 'id']);
        cursorStartedAt = assertR9ResponseTimestamp(cursor.started_at);
        cursorId = assertCanonicalUuid(cursor.id);
      }
    }
    return { limit, cursorStartedAt, cursorId };
  }

  function validateHistoryItem(value) {
    const item = assertExactDataKeys(value, [
      'session_id',
      'started_at',
      'day',
      'title',
      'duration_min',
      'item_count',
      'revision'
    ]);
    return {
      session_id: assertCanonicalUuid(item.session_id),
      started_at: assertR9ResponseTimestamp(item.started_at),
      day: assertDay(item.day),
      title: assertCanonicalOptionalText(item.title, 120),
      duration_min: assertInteger(item.duration_min, 1, 1440),
      item_count: assertInteger(item.item_count, 1, 50),
      revision: assertRevision(item.revision)
    };
  }

  function validateHistoryResponse(value, request) {
    const page = assertExactDataKeys(value, [
      'schema_version',
      'items',
      'has_more',
      'next_cursor'
    ]);
    if (page.schema_version !== HISTORY_PAGE_SCHEMA) violation();
    assertDenseArray(page.items, 0, request.limit);
    const items = page.items.map(validateHistoryItem);
    if (typeof page.has_more !== 'boolean') violation();
    for (let index = 1; index < items.length; index += 1) {
      const previous = items[index - 1];
      const current = items[index];
      if (
        previous.started_at < current.started_at ||
        (previous.started_at === current.started_at &&
          previous.session_id <= current.session_id)
      ) {
        violation();
      }
    }

    let nextCursor = null;
    if (page.has_more) {
      if (items.length !== request.limit || items.length === 0) violation();
      const cursor = assertExactDataKeys(page.next_cursor, ['started_at', 'id']);
      const last = items[items.length - 1];
      if (cursor.started_at !== last.started_at || cursor.id !== last.session_id) {
        violation();
      }
      nextCursor = { started_at: last.started_at, id: last.session_id };
    } else if (page.next_cursor !== null) {
      violation();
    }
    return deepFreeze({
      schema_version: HISTORY_PAGE_SCHEMA,
      items,
      has_more: page.has_more,
      next_cursor: nextCursor
    });
  }

  function assertSnapshotLabel(value) {
    if (
      typeof value !== 'string' ||
      value === '' ||
      value !== asciiBtrim(value) ||
      textLength(value) > 80
    ) {
      violation();
    }
    return value;
  }

  function validateDetailSet(value, policy, expectedOrder) {
    const set = assertExactDataKeys(value, [
      'set_order',
      'tracking_mode',
      'reps',
      'duration_sec',
      'distance_m',
      'weight_kg',
      'assistance_kg'
    ]);
    if (set.tracking_mode !== 'strength_sets' || set.set_order !== expectedOrder) {
      violation();
    }
    if (
      set.reps === undefined ||
      set.duration_sec === undefined ||
      set.distance_m === undefined ||
      set.weight_kg === undefined ||
      set.assistance_kg === undefined
    ) {
      violation();
    }
    const normalized = normalizeSet(
      {
        set_order: set.set_order,
        reps: set.reps,
        duration_sec: set.duration_sec,
        distance_m: set.distance_m,
        weight_kg: set.weight_kg,
        assistance_kg: set.assistance_kg
      },
      policy
    );
    return {
      set_order: normalized.set_order,
      tracking_mode: 'strength_sets',
      reps: normalized.reps,
      duration_sec: normalized.duration_sec,
      distance_m: normalized.distance_m,
      weight_kg: normalized.weight_kg,
      assistance_kg: normalized.assistance_kg
    };
  }

  function validateDetailItem(value, expectedOrder) {
    const item = assertExactDataKeys(value, [
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
    if (
      typeof item.item_key !== 'string' ||
      !ITEM_KEY_RE.test(item.item_key) ||
      textLength(item.item_key) > 64 ||
      item.item_order !== expectedOrder ||
      !HISTORICAL_TRACKING_MODES.includes(item.tracking_mode_snapshot) ||
      !HISTORICAL_EQUIPMENT.includes(item.equipment_snapshot) ||
      !HISTORICAL_LOAD_COMPARABILITY.includes(
        item.load_comparability_snapshot
      )
    ) {
      violation();
    }
    assertExactDataKeys(item.field_policy_snapshot, FIELD_KEYS);
    const policy = assertHistoricalPolicySnapshot(
      item.field_policy_snapshot,
      item.tracking_mode_snapshot,
      item.equipment_snapshot,
      item.load_comparability_snapshot
    );
    const durationMin = normalizeExplicitNullableInteger(
      item.duration_min,
      1,
      1440
    );
    const distanceKm = normalizeExplicitNullableDecimal(
      item.distance_km,
      0.01,
      1000
    );
    const note = assertCanonicalOptionalText(item.note, 500);
    assertPolicyValue(policy, 'duration_min', durationMin);
    assertPolicyValue(policy, 'distance_km', distanceKm);
    assertPolicyValue(policy, 'note', note);
    const minimumSets = item.tracking_mode_snapshot === 'strength_sets' ? 1 : 0;
    const maximumSets = item.tracking_mode_snapshot === 'strength_sets' ? 50 : 0;
    assertDenseArray(item.sets, minimumSets, maximumSets);
    const sets = item.sets.map((set, index) =>
      validateDetailSet(set, policy, index + 1)
    );
    return {
      item_key: item.item_key,
      item_order: item.item_order,
      item_label_snapshot: assertSnapshotLabel(item.item_label_snapshot),
      tracking_mode_snapshot: item.tracking_mode_snapshot,
      equipment_snapshot: item.equipment_snapshot,
      load_comparability_snapshot: item.load_comparability_snapshot,
      field_policy_snapshot: Object.fromEntries(
        FIELD_KEYS.map((key) => [key, policy[key]])
      ),
      duration_min: durationMin,
      distance_km: distanceKm,
      note,
      sets
    };
  }

  function validateDetailResponse(value, sessionId) {
    if (value === null) return null;
    const detail = assertExactDataKeys(value, [
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
    if (
      detail.schema_version !== DETAIL_SCHEMA ||
      assertCanonicalUuid(detail.session_id) !== sessionId
    ) {
      violation();
    }
    assertDenseArray(detail.items, 1, 50);
    const items = detail.items.map((item, index) =>
      validateDetailItem(item, index + 1)
    );
    if (new Set(items.map((item) => item.item_key)).size !== items.length) {
      violation();
    }
    return deepFreeze({
      schema_version: DETAIL_SCHEMA,
      session_id: detail.session_id,
      catalog_version: assertInteger(detail.catalog_version, 1, 2147483647),
      revision: assertRevision(detail.revision),
      content_fingerprint: assertFingerprint(detail.content_fingerprint),
      started_at: assertR9ResponseTimestamp(detail.started_at),
      ended_at: assertR9ResponseTimestamp(detail.ended_at),
      day: assertDay(detail.day),
      title: assertCanonicalOptionalText(detail.title, 120),
      duration_min: assertInteger(detail.duration_min, 1, 1440),
      note: assertCanonicalOptionalText(detail.note, 500),
      items
    });
  }

  function normalizeReplacementSet(value, expectedOrder) {
    const set = assertExactDataKeys(value, SET_KEYS);
    if (set.set_order !== expectedOrder) violation();
    const normalized = {
      set_order: assertInteger(set.set_order, 1, 50),
      reps: normalizeExplicitNullableInteger(set.reps, 1, 1000),
      duration_sec: normalizeExplicitNullableInteger(set.duration_sec, 1, 3600),
      distance_m: normalizeExplicitNullableDecimal(set.distance_m, 0.1, 10000),
      weight_kg: normalizeExplicitNullableDecimal(set.weight_kg, 0.01, 1000),
      assistance_kg: normalizeExplicitNullableDecimal(
        set.assistance_kg,
        0.01,
        1000
      )
    };
    if (
      [normalized.reps, normalized.duration_sec, normalized.distance_m].filter(
        (entry) => entry !== null
      ).length !== 1 ||
      (normalized.weight_kg !== null && normalized.assistance_kg !== null)
    ) {
      violation();
    }
    return normalized;
  }

  function normalizeReplacementItem(value, expectedOrder) {
    const item = assertExactDataKeys(value, ITEM_KEYS);
    if (
      typeof item.item_key !== 'string' ||
      !ITEM_KEY_RE.test(item.item_key) ||
      textLength(item.item_key) > 64 ||
      item.item_order !== expectedOrder
    ) {
      violation();
    }
    assertDenseArray(item.sets, 0, 50);
    const sets = item.sets.map((set, index) =>
      normalizeReplacementSet(set, index + 1)
    );
    const durationMin = normalizeExplicitNullableInteger(
      item.duration_min,
      1,
      1440
    );
    const distanceKm = normalizeExplicitNullableDecimal(
      item.distance_km,
      0.01,
      1000
    );
    if (
      (sets.length > 0 && (durationMin !== null || distanceKm !== null)) ||
      (sets.length === 0 && durationMin === null)
    ) {
      violation();
    }
    return {
      item_key: item.item_key,
      item_order: item.item_order,
      duration_min: durationMin,
      distance_km: distanceKm,
      note: normalizeExplicitNullableText(item.note, 500),
      sets
    };
  }

  function normalizeReplacement(value) {
    const replacement = assertExactDataKeys(value, [
      'schema_version',
      'duration_min',
      'note',
      'items'
    ]);
    if (replacement.schema_version !== REPLACEMENT_SCHEMA) violation();
    assertDenseArray(replacement.items, 1, 50);
    const items = replacement.items.map((item, index) =>
      normalizeReplacementItem(item, index + 1)
    );
    if (new Set(items.map((item) => item.item_key)).size !== items.length) {
      violation();
    }
    return {
      schema_version: REPLACEMENT_SCHEMA,
      duration_min: assertInteger(replacement.duration_min, 1, 1440),
      note: normalizeExplicitNullableText(replacement.note, 500),
      items
    };
  }

  function normalizeReplaceOptions(value) {
    const options = assertExactDataKeys(value, [
      'sessionId',
      'expectedRevision',
      'expectedContentFingerprint',
      'session'
    ]);
    return {
      sessionId: assertCanonicalUuid(options.sessionId),
      expectedRevision: assertRevision(options.expectedRevision),
      expectedContentFingerprint: assertFingerprint(
        options.expectedContentFingerprint
      ),
      session: normalizeReplacement(options.session)
    };
  }

  function normalizeDeleteOptions(value) {
    const options = assertExactDataKeys(value, [
      'sessionId',
      'expectedRevision',
      'expectedContentFingerprint'
    ]);
    return {
      sessionId: assertCanonicalUuid(options.sessionId),
      expectedRevision: assertRevision(options.expectedRevision),
      expectedContentFingerprint: assertFingerprint(
        options.expectedContentFingerprint
      )
    };
  }

  function validateReplaceResult(value, request) {
    const result = assertExactDataKeys(value, [
      'schema_version',
      'operation',
      'outcome',
      'session_id',
      'revision',
      'content_fingerprint'
    ]);
    if (
      result.schema_version !== MUTATION_RESULT_SCHEMA ||
      result.operation !== 'replace' ||
      !['updated', 'replayed'].includes(result.outcome) ||
      result.session_id !== request.sessionId
    ) {
      violation();
    }
    return deepFreeze({
      schema_version: MUTATION_RESULT_SCHEMA,
      operation: 'replace',
      outcome: result.outcome,
      session_id: assertCanonicalUuid(result.session_id),
      revision: assertRevision(result.revision),
      content_fingerprint: assertFingerprint(result.content_fingerprint)
    });
  }

  function validateDeleteResult(value, request) {
    const result = assertExactDataKeys(value, [
      'schema_version',
      'operation',
      'outcome',
      'session_id'
    ]);
    if (
      result.schema_version !== MUTATION_RESULT_SCHEMA ||
      result.operation !== 'delete' ||
      !['deleted', 'already_absent'].includes(result.outcome) ||
      result.session_id !== request.sessionId
    ) {
      violation();
    }
    return deepFreeze({
      schema_version: MUTATION_RESULT_SCHEMA,
      operation: 'delete',
      outcome: result.outcome,
      session_id: assertCanonicalUuid(result.session_id)
    });
  }

  const getSupabaseApi = () =>
    root.AppModules?.supabase || root.SupabaseAPI || {};

  async function getConfigValue(key) {
    if (typeof root.getConf !== 'function') return null;
    return await root.getConf(key);
  }

  function makeJsonHeaders(headers) {
    if (typeof root.Headers === 'function' && headers instanceof root.Headers) {
      const merged = new root.Headers(headers);
      merged.set('content-type', 'application/json');
      return merged;
    }
    return { ...(headers || {}), 'content-type': 'application/json' };
  }

  function extractProblem(responseBody) {
    if (!isRecord(responseBody)) return { detail: '', token: null };
    const parts = ['message', 'details', 'hint', 'code']
      .map((key) => responseBody[key])
      .filter((value) => typeof value === 'string');
    const combined = parts.join(' ');
    const token = Object.keys(SQL_TOKEN_CODES).find((candidate) => {
      const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|[^A-Z0-9_])${escaped}(?:$|[^A-Z0-9_])`).test(
        combined
      );
    });
    return { detail: combined, token: token || null };
  }

  function logFailure(operation, code, status) {
    const diag =
      root.diag ||
      root.AppModules?.diag ||
      root.AppModules?.diagnostics ||
      { add() {} };
    const safeStatus = Number.isInteger(status) ? String(status) : 'none';
    diag.add?.(`[activity-v2] ${operation} failed code=${code} status=${safeStatus}`);
  }

  function domainError(
    code,
    operation,
    retryable,
    commitState,
    diagnostic = {},
    mutationState
  ) {
    logFailure(operation, code, diagnostic.status);
    return new ActivityV2DataAccessError(
      code,
      operation,
      retryable,
      commitState,
      mutationState
    );
  }

  function mapThrownError(error, operation, requestDispatched) {
    if (error instanceof ActivityV2DataAccessError) return error;
    const status = Number(error?.status ?? error?.response?.status);
    if (status === 401 || status === 403) {
      return domainError('AUTH_REQUIRED', operation, false, 'not_committed', {
        status
      });
    }
    return domainError(
      'REQUEST_FAILED',
      operation,
      true,
      requestDispatched ? 'unknown' : 'not_committed',
      { status: Number.isInteger(status) ? status : undefined, detail: error?.message }
    );
  }

  async function callRpc(functionName, rpcPayload, operation, validateResult) {
    const supabaseApi = getSupabaseApi();
    const fetchWithAuth = supabaseApi.fetchWithAuth;
    const baseUrlFromRest = supabaseApi.baseUrlFromRest;
    if (typeof fetchWithAuth !== 'function' || typeof baseUrlFromRest !== 'function') {
      throw domainError('REQUEST_FAILED', operation, false, 'not_committed');
    }

    let restUrl;
    let baseUrl;
    try {
      restUrl = await getConfigValue('webhookUrl');
      baseUrl = baseUrlFromRest(restUrl);
    } catch (error) {
      throw domainError('REQUEST_FAILED', operation, false, 'not_committed', {
        detail: error?.message
      });
    }
    if (!baseUrl) {
      throw domainError('REQUEST_FAILED', operation, false, 'not_committed');
    }

    let rpcUrl;
    let requestBody;
    try {
      rpcUrl = new root.URL(`${baseUrl}/rest/v1/rpc/${functionName}`);
      requestBody = JSON.stringify(rpcPayload);
    } catch (error) {
      throw domainError('REQUEST_FAILED', operation, false, 'not_committed', {
        detail: error?.message
      });
    }
    let requestDispatched = false;
    let response;
    try {
      response = await fetchWithAuth(
        (headers) => {
          requestDispatched = true;
          return root.fetch(rpcUrl.toString(), {
            method: 'POST',
            headers: makeJsonHeaders(headers),
            body: requestBody
          });
        },
        { tag: `activity-v2:${functionName}`, maxAttempts: 2 }
      );
    } catch (error) {
      throw mapThrownError(error, operation, requestDispatched);
    }

    const status = Number(response?.status);
    const ok = response?.ok === true || (status >= 200 && status < 300);
    if (!ok) {
      let problemBody = null;
      try {
        problemBody = await response.clone().json();
      } catch (_) {
        try {
          problemBody = await response.json();
        } catch (_) {
          problemBody = null;
        }
      }
      const problem = extractProblem(problemBody);
      if (status === 401 || status === 403) {
        throw domainError('AUTH_REQUIRED', operation, false, 'not_committed', {
          status,
          detail: problem.detail
        });
      }
      if (problem.token) {
        throw domainError(
          SQL_TOKEN_CODES[problem.token],
          operation,
          false,
          'not_committed',
          { status, detail: problem.detail }
        );
      }
      throw domainError('REQUEST_FAILED', operation, status === 429 || status >= 500, 'unknown', {
        status,
        detail: problem.detail
      });
    }

    let value;
    try {
      value = await response.json();
      return validateResult(value);
    } catch (error) {
      if (error instanceof ActivityV2DataAccessError) throw error;
      throw domainError('REQUEST_FAILED', operation, true, 'unknown', {
        status,
        detail: error?.message
      });
    }
  }

  async function callR9Rpc(
    functionName,
    rpcPayload,
    operation,
    validateResult,
    mutation = false
  ) {
    const mutationState = mutation ? 'not_applied' : undefined;
    const supabaseApi = getSupabaseApi();
    const fetchWithAuth = supabaseApi.fetchWithAuth;
    const baseUrlFromRest = supabaseApi.baseUrlFromRest;
    if (typeof fetchWithAuth !== 'function' || typeof baseUrlFromRest !== 'function') {
      throw domainError(
        'REQUEST_FAILED',
        operation,
        false,
        undefined,
        {},
        mutationState
      );
    }

    let baseUrl;
    try {
      baseUrl = baseUrlFromRest(await getConfigValue('webhookUrl'));
    } catch (error) {
      throw domainError(
        'REQUEST_FAILED',
        operation,
        false,
        undefined,
        { detail: error?.message },
        mutationState
      );
    }
    if (!baseUrl) {
      throw domainError(
        'REQUEST_FAILED',
        operation,
        false,
        undefined,
        {},
        mutationState
      );
    }

    let rpcUrl;
    let requestBody;
    try {
      rpcUrl = new root.URL(`${baseUrl}/rest/v1/rpc/${functionName}`);
      requestBody = JSON.stringify(rpcPayload);
    } catch (error) {
      throw domainError(
        'REQUEST_FAILED',
        operation,
        false,
        undefined,
        { detail: error?.message },
        mutationState
      );
    }

    let requestDispatched = false;
    let response;
    try {
      response = await fetchWithAuth(
        (headers) => {
          requestDispatched = true;
          return root.fetch(rpcUrl.toString(), {
            method: 'POST',
            headers: makeJsonHeaders(headers),
            body: requestBody
          });
        },
        { tag: `activity-v2:${functionName}`, maxAttempts: 2 }
      );
    } catch (error) {
      const status = Number(error?.status ?? error?.response?.status);
      if (status === 401 || status === 403) {
        throw domainError(
          'AUTH_REQUIRED',
          operation,
          false,
          undefined,
          { status },
          mutationState
        );
      }
      if (mutation && requestDispatched) {
        throw domainError(
          'MUTATION_OUTCOME_UNKNOWN',
          operation,
          false,
          undefined,
          { status: Number.isInteger(status) ? status : undefined },
          'unknown'
        );
      }
      throw domainError(
        'REQUEST_FAILED',
        operation,
        requestDispatched,
        undefined,
        { status: Number.isInteger(status) ? status : undefined }
      );
    }

    const status = Number(response?.status);
    const ok = response?.ok === true || (status >= 200 && status < 300);
    if (!ok) {
      let problemBody = null;
      try {
        problemBody = await response.clone().json();
      } catch (_) {
        try {
          problemBody = await response.json();
        } catch (_) {
          problemBody = null;
        }
      }
      const problem = extractProblem(problemBody);
      if (status === 401 || status === 403) {
        throw domainError(
          'AUTH_REQUIRED',
          operation,
          false,
          undefined,
          { status },
          mutationState
        );
      }
      if (problem.token) {
        throw domainError(
          SQL_TOKEN_CODES[problem.token],
          operation,
          false,
          undefined,
          { status },
          mutationState
        );
      }
      if (mutation) {
        throw domainError(
          'MUTATION_OUTCOME_UNKNOWN',
          operation,
          false,
          undefined,
          { status },
          'unknown'
        );
      }
      throw domainError(
        'REQUEST_FAILED',
        operation,
        status === 429 || status >= 500,
        undefined,
        { status }
      );
    }

    try {
      return validateResult(await response.json());
    } catch (error) {
      if (error instanceof ActivityV2DataAccessError) throw error;
      if (mutation) {
        throw domainError(
          'MUTATION_OUTCOME_UNKNOWN',
          operation,
          false,
          undefined,
          { status },
          'unknown'
        );
      }
      throw domainError('REQUEST_FAILED', operation, true, undefined, { status });
    }
  }

  async function commitSession(options) {
    let request;
    try {
      request = normalizeCommitRequest(options);
    } catch (error) {
      if (error instanceof ContractViolation) {
        throw domainError('INVALID_SESSION', 'commitSession', false, 'not_committed');
      }
      throw domainError('REQUEST_FAILED', 'commitSession', false, 'not_committed', {
        detail: error?.message
      });
    }
    return await callRpc(
      'activity_v2_commit_session',
      { p_request_id: request.requestId, p_payload: request.payload },
      'commitSession',
      (value) => validateCommitResponse(value, request)
    );
  }

  async function loadLastPerformance(itemKeyValue, optionsValue) {
    let semantics;
    try {
      semantics = resolveLookupSemantics(arguments.length > 1, optionsValue);
    } catch (error) {
      throw domainError('REQUEST_FAILED', 'loadLastPerformance', false, undefined, {
        detail: error?.message
      });
    }
    let itemKey;
    try {
      itemKey = normalizeLookupKey(itemKeyValue);
    } catch (error) {
      if (error instanceof ContractViolation) {
        throw domainError('INVALID_ITEM_KEY', 'loadLastPerformance', false);
      }
      throw domainError('REQUEST_FAILED', 'loadLastPerformance', false, undefined, {
        detail: error?.message
      });
    }
    let keyExists;
    try {
      keyExists = selectedSemanticsHasKey(semantics, itemKey);
    } catch (error) {
      throw domainError('REQUEST_FAILED', 'loadLastPerformance', false, undefined, {
        detail: error?.message
      });
    }
    if (!keyExists) {
      throw domainError('INVALID_ITEM_KEY', 'loadLastPerformance', false);
    }
    return await callRpc(
      'activity_v2_last_performance',
      { p_item_key: itemKey },
      'loadLastPerformance',
      (value) => validateLookupResponse(value, itemKey)
    );
  }

  async function listSessions(optionsValue) {
    let request;
    try {
      request = normalizeHistoryRequest(optionsValue);
    } catch (error) {
      throw domainError(
        error instanceof ContractViolation
          ? 'INVALID_HISTORY_REQUEST'
          : 'REQUEST_FAILED',
        'listSessions',
        false
      );
    }
    return await callR9Rpc(
      'activity_v2_list_sessions',
      {
        p_limit: request.limit,
        p_cursor_started_at: request.cursorStartedAt,
        p_cursor_id: request.cursorId
      },
      'listSessions',
      (value) => validateHistoryResponse(value, request)
    );
  }

  async function loadSessionDetail(sessionIdValue) {
    let sessionId;
    try {
      sessionId = assertCanonicalUuid(sessionIdValue);
    } catch (error) {
      throw domainError(
        error instanceof ContractViolation ? 'INVALID_SESSION' : 'REQUEST_FAILED',
        'loadSessionDetail',
        false
      );
    }
    return await callR9Rpc(
      'activity_v2_session_detail',
      { p_session_id: sessionId },
      'loadSessionDetail',
      (value) => validateDetailResponse(value, sessionId)
    );
  }

  async function replaceSession(optionsValue) {
    let request;
    try {
      request = normalizeReplaceOptions(optionsValue);
    } catch (error) {
      throw domainError(
        error instanceof ContractViolation ? 'INVALID_SESSION' : 'REQUEST_FAILED',
        'replaceSession',
        false,
        undefined,
        {},
        'not_applied'
      );
    }
    return await callR9Rpc(
      'activity_v2_replace_session',
      {
        p_session_id: request.sessionId,
        p_expected_revision: request.expectedRevision,
        p_expected_content_fingerprint: request.expectedContentFingerprint,
        p_replacement: request.session
      },
      'replaceSession',
      (value) => validateReplaceResult(value, request),
      true
    );
  }

  async function deleteSession(optionsValue) {
    let request;
    try {
      request = normalizeDeleteOptions(optionsValue);
    } catch (error) {
      throw domainError(
        error instanceof ContractViolation ? 'INVALID_SESSION' : 'REQUEST_FAILED',
        'deleteSession',
        false,
        undefined,
        {},
        'not_applied'
      );
    }
    return await callR9Rpc(
      'activity_v2_delete_session',
      {
        p_session_id: request.sessionId,
        p_expected_revision: request.expectedRevision,
        p_expected_content_fingerprint: request.expectedContentFingerprint
      },
      'deleteSession',
      (value) => validateDeleteResult(value, request),
      true
    );
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
  if ('dataAccess' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.dataAccess is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const dataAccessApi = Object.freeze({
    commitSession,
    loadLastPerformance,
    listSessions,
    loadSessionDetail,
    replaceSession,
    deleteSession
  });
  Object.defineProperty(root.AppModules.activityV2, 'dataAccess', {
    value: dataAccessApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
