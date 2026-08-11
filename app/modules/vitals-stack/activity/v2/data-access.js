'use strict';

(function initActivityV2DataAccess(root) {
  const REQUEST_SCHEMA = 'midas.activity-session.v1';
  const COMMIT_RESULT_SCHEMA = 'midas.activity-session-result.v1';
  const LOOKUP_RESULT_SCHEMA = 'midas.activity-last-performance.v1';
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
    MIDAS_ACTIVITY_INVALID_SESSION: 'INVALID_SESSION'
  });
  const SAFE_MESSAGES = Object.freeze({
    AUTH_REQUIRED: 'Authentication is required.',
    IDEMPOTENCY_CONFLICT: 'The request ID is already bound to different data.',
    INVALID_ITEM_KEY: 'The activity item key is invalid.',
    INVALID_SESSION: 'The activity session is invalid.',
    REQUEST_FAILED: 'The activity request could not be completed.'
  });

  class ContractViolation extends Error {}

  class ActivityV2DataAccessError extends Error {
    constructor(code, operation, retryable, commitState) {
      super(SAFE_MESSAGES[code] || SAFE_MESSAGES.REQUEST_FAILED);
      this.name = 'ActivityV2DataAccessError';
      this.code = code;
      this.operation = operation;
      this.retryable = retryable === true;
      if (operation === 'commitSession') {
        this.commitState = commitState === 'unknown' ? 'unknown' : 'not_committed';
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

  function assertUuid(value) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) violation();
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

  function domainError(code, operation, retryable, commitState, diagnostic = {}) {
    logFailure(operation, code, diagnostic.status);
    return new ActivityV2DataAccessError(code, operation, retryable, commitState);
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

  const dataAccessApi = Object.freeze({ commitSession, loadLastPerformance });
  Object.defineProperty(root.AppModules.activityV2, 'dataAccess', {
    value: dataAccessApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
