'use strict';

(function initActivityV2CoachingExport(root) {
  const EXPORT_SCHEMA = 'midas.activity-coaching-export.v1';
  const TIMEZONE = 'Europe/Vienna';
  const SAFE_MESSAGE = 'The activity coaching export is invalid.';
  const RANGE_KEYS = Object.freeze(['from', 'to', 'inclusive']);
  const TOP_LEVEL_KEYS = Object.freeze([
    'schema_version',
    'generated_at',
    'timezone',
    'range',
    'units',
    'completeness',
    'quality',
    'sessions'
  ]);
  const UNIT_KEYS = Object.freeze([
    'session_duration',
    'item_duration',
    'item_distance',
    'set_duration',
    'set_distance',
    'weight',
    'assistance',
    'repetitions'
  ]);
  const EXPECTED_UNITS = Object.freeze({
    session_duration: 'min',
    item_duration: 'min',
    item_distance: 'km',
    set_duration: 's',
    set_distance: 'm',
    weight: 'kg',
    assistance: 'kg',
    repetitions: 'count'
  });
  const COMPLETENESS_KEYS = Object.freeze([
    'status',
    'truncated',
    'session_count',
    'item_count',
    'set_count'
  ]);
  const QUALITY_KEYS = Object.freeze(['status', 'cautions']);
  const SESSION_KEYS = Object.freeze([
    'session_id',
    'catalog_version',
    'revision',
    'day',
    'started_at',
    'ended_at',
    'duration_min',
    'title',
    'note',
    'items'
  ]);
  const ITEM_KEYS = Object.freeze([
    'item_key',
    'item_order',
    'item_label_snapshot',
    'tracking_mode_snapshot',
    'equipment_snapshot',
    'load_comparability_snapshot',
    'field_policy_snapshot',
    'category',
    'muscle_groups',
    'sport_tags',
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
  const FIELD_POLICY_KEYS = Object.freeze([
    'assistance_kg',
    'distance_km',
    'distance_m',
    'duration_min',
    'duration_sec',
    'note',
    'reps',
    'weight_kg'
  ]);
  const SET_VALUE_KEYS = Object.freeze([
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  const TRACKING_MODES = Object.freeze([
    'duration',
    'duration_distance',
    'strength_sets'
  ]);
  const EQUIPMENT = Object.freeze([
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
  const LOAD_COMPARABILITY = Object.freeze([
    'device_relative',
    'not_applicable',
    'standardized'
  ]);
  const CATEGORIES = Object.freeze(['endurance', 'sport', 'strength']);
  const MUSCLE_GROUPS = Object.freeze([
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
  ]);
  const SPORT_TAGS = Object.freeze([
    'endurance',
    'indoor',
    'outdoor',
    'team_sport',
    'water_sport'
  ]);
  const POLICY_VALUES = Object.freeze(['forbidden', 'optional', 'required']);
  const CAUTIONS = Object.freeze([
    'assistance_loads_present',
    'device_relative_loads_present',
    'multiple_catalog_versions_present',
    'no_sessions_in_range'
  ]);
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const REVISION_RE = /^[1-9][0-9]*$/;
  const MAX_REVISION = '9223372036854775807';
  const MAX_SESSIONS = 1000;
  const MAX_ITEMS = 10000;
  const MAX_SETS = 50000;
  const DAY_MS = 86400000;
  const VIENNA_DAY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  class ActivityV2CoachingExportError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2CoachingExportError';
      this.code = code;
    }
  }

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function fail(code) {
    throw new ActivityV2CoachingExportError(code);
  }

  function guard(code, callback) {
    try {
      return callback();
    } catch (error) {
      if (error instanceof ActivityV2CoachingExportError) throw error;
      fail(code);
    }
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

  function readExact(value, expected, code) {
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

  function readDenseArray(value, code) {
    if (!Array.isArray(value)) fail(code);
    const expected = [
      ...Array.from({ length: value.length }, (_, index) => String(index)),
      'length'
    ];
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expected.length ||
      keys.some((key) => typeof key !== 'string' || !expected.includes(key))
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const children = expected.slice(0, -1).map((key) => {
      const descriptor = descriptors[key];
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
        fail(code);
      }
      return descriptor.value;
    });
    return children;
  }

  function compareText(left, right) {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  }

  function isCanonicalDay(value) {
    if (typeof value !== 'string' || !DAY_RE.test(value) || value.slice(0, 4) === '0000') {
      return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function dayNumber(value) {
    return Math.trunc(Date.parse(`${value}T00:00:00.000Z`) / DAY_MS);
  }

  function isCanonicalTimestamp(value) {
    return (
      typeof value === 'string' &&
      TIMESTAMP_RE.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString() === value
    );
  }

  function isCanonicalRevision(value) {
    return (
      typeof value === 'string' &&
      REVISION_RE.test(value) &&
      (value.length < MAX_REVISION.length ||
        (value.length === MAX_REVISION.length && value <= MAX_REVISION))
    );
  }

  function isCanonicalText(value, maxLength) {
    return (
      typeof value === 'string' &&
      value.replace(/^ +| +$/g, '') === value &&
      Array.from(value).length >= 1 &&
      Array.from(value).length <= maxLength
    );
  }

  function hasAtMostTwoDecimals(value) {
    const text = String(value).toLowerCase();
    const [coefficient, exponentText] = text.split('e');
    const fractionLength = (coefficient.split('.')[1] || '').length;
    const exponent = exponentText === undefined ? 0 : Number(exponentText);
    return Number.isInteger(exponent) && Math.max(0, fractionLength - exponent) <= 2;
  }

  function isIntegerInRange(value, min, max) {
    return Number.isSafeInteger(value) && value >= min && value <= max;
  }

  function isDecimalInRange(value, min, max) {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= min &&
      value <= max &&
      hasAtMostTwoDecimals(value)
    );
  }

  function readRange(value, today, code) {
    const range = readExact(value, RANGE_KEYS, code);
    if (
      !isCanonicalDay(range.from) ||
      !isCanonicalDay(range.to) ||
      range.inclusive !== true
    ) {
      fail(code);
    }
    const fromDay = dayNumber(range.from);
    const toDay = dayNumber(range.to);
    if (fromDay > toDay || toDay - fromDay > 365) fail(code);
    if (today !== null) {
      if (!isCanonicalDay(today) || toDay > dayNumber(today)) fail(code);
    }
    return { from: range.from, to: range.to, inclusive: true };
  }

  function validateRange(value, today) {
    return guard('INVALID_EXPORT_REQUEST', () =>
      deepFreeze(readRange(value, today, 'INVALID_EXPORT_REQUEST'))
    );
  }

  function formatViennaDay(epochMs) {
    if (
      typeof epochMs !== 'number' ||
      !Number.isFinite(epochMs) ||
      !Number.isFinite(new Date(epochMs).getTime())
    ) {
      fail('INVALID_EXPORT_REQUEST');
    }
    const parts = Object.fromEntries(
      VIENNA_DAY_FORMATTER.formatToParts(new Date(epochMs)).map((part) => [
        part.type,
        part.value
      ])
    );
    const day = `${parts.year}-${parts.month}-${parts.day}`;
    if (!isCanonicalDay(day)) fail('INVALID_EXPORT_REQUEST');
    return day;
  }

  function daysInMonth(year, month) {
    const probe = new Date(0);
    probe.setUTCFullYear(year, month, 0);
    probe.setUTCHours(0, 0, 0, 0);
    return probe.getUTCDate();
  }

  function createPresetRange(months, now) {
    return guard('INVALID_EXPORT_REQUEST', () => {
      if (months !== 3 && months !== 6) fail('INVALID_EXPORT_REQUEST');
      const to = formatViennaDay(now);
      const year = Number(to.slice(0, 4));
      const month = Number(to.slice(5, 7));
      const day = Number(to.slice(8, 10));
      const monthIndex = year * 12 + month - 1 - months;
      const targetYear = Math.floor(monthIndex / 12);
      const targetMonthIndex = monthIndex - targetYear * 12;
      if (targetYear < 1 || targetYear > 9999) fail('INVALID_EXPORT_REQUEST');
      const targetMonth = targetMonthIndex + 1;
      const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
      const from = `${String(targetYear).padStart(4, '0')}-${String(targetMonth).padStart(
        2,
        '0'
      )}-${String(targetDay).padStart(2, '0')}`;
      return deepFreeze(
        readRange({ from, to, inclusive: true }, to, 'INVALID_EXPORT_REQUEST')
      );
    });
  }

  function buildDownloadName(value) {
    return guard('INVALID_EXPORT_REQUEST', () => {
      const range = readRange(value, null, 'INVALID_EXPORT_REQUEST');
      return `midas-activity-coaching_${range.from}_${range.to}.json`;
    });
  }

  function readEnumArray(value, allowed, code) {
    const entries = readDenseArray(value, code);
    let previous = null;
    const seen = new Set();
    entries.forEach((entry) => {
      if (
        typeof entry !== 'string' ||
        !allowed.includes(entry) ||
        seen.has(entry) ||
        (previous !== null && compareText(previous, entry) >= 0)
      ) {
        fail(code);
      }
      seen.add(entry);
      previous = entry;
    });
    return entries;
  }

  function readFieldPolicy(value, code) {
    const policy = readExact(value, FIELD_POLICY_KEYS, code);
    if (FIELD_POLICY_KEYS.some((key) => !POLICY_VALUES.includes(policy[key]))) {
      fail(code);
    }
    return policy;
  }

  function assertPolicyValue(policy, key, value, code) {
    if (
      (policy[key] === 'forbidden' && value !== null) ||
      (policy[key] === 'required' && value === null)
    ) {
      fail(code);
    }
  }

  function assertModePolicy(mode, policy, code) {
    const setFieldsForbidden = SET_VALUE_KEYS.every(
      (key) => policy[key] === 'forbidden'
    );
    if (mode === 'strength_sets') {
      if (
        policy.duration_min !== 'forbidden' ||
        policy.distance_km !== 'forbidden' ||
        setFieldsForbidden
      ) {
        fail(code);
      }
      return;
    }
    if (
      policy.duration_min !== 'required' ||
      setFieldsForbidden !== true ||
      (mode === 'duration' && policy.distance_km !== 'forbidden') ||
      (mode === 'duration_distance' && policy.distance_km === 'forbidden')
    ) {
      fail(code);
    }
  }

  function readSet(value, expectedOrder, mode, policy, code) {
    const set = readExact(value, SET_KEYS, code);
    if (
      set.set_order !== expectedOrder ||
      set.tracking_mode !== 'strength_sets' ||
      set.tracking_mode !== mode ||
      !(set.reps === null || isIntegerInRange(set.reps, 1, 1000)) ||
      !(set.duration_sec === null || isIntegerInRange(set.duration_sec, 1, 3600)) ||
      !(set.distance_m === null || isDecimalInRange(set.distance_m, 0.1, 10000)) ||
      !(set.weight_kg === null || isDecimalInRange(set.weight_kg, 0.01, 1000)) ||
      !(set.assistance_kg === null ||
        isDecimalInRange(set.assistance_kg, 0.01, 1000))
    ) {
      fail(code);
    }
    const primaryCount = [set.reps, set.duration_sec, set.distance_m].filter(
      (entry) => entry !== null
    ).length;
    if (
      primaryCount !== 1 ||
      (set.weight_kg !== null && set.assistance_kg !== null)
    ) {
      fail(code);
    }
    SET_VALUE_KEYS.forEach((key) => assertPolicyValue(policy, key, set[key], code));
    return { ...set };
  }

  function readItem(value, expectedOrder, code) {
    const item = readExact(value, ITEM_KEYS, code);
    if (
      typeof item.item_key !== 'string' ||
      item.item_key.length > 64 ||
      !ITEM_KEY_RE.test(item.item_key) ||
      item.item_order !== expectedOrder ||
      !isCanonicalText(item.item_label_snapshot, 80) ||
      !TRACKING_MODES.includes(item.tracking_mode_snapshot) ||
      !EQUIPMENT.includes(item.equipment_snapshot) ||
      !LOAD_COMPARABILITY.includes(item.load_comparability_snapshot) ||
      !CATEGORIES.includes(item.category) ||
      !(item.duration_min === null || isIntegerInRange(item.duration_min, 1, 1440)) ||
      !(item.distance_km === null || isDecimalInRange(item.distance_km, 0.01, 1000)) ||
      !(item.note === null || isCanonicalText(item.note, 500))
    ) {
      fail(code);
    }
    const policy = readFieldPolicy(item.field_policy_snapshot, code);
    assertModePolicy(item.tracking_mode_snapshot, policy, code);
    assertPolicyValue(policy, 'duration_min', item.duration_min, code);
    assertPolicyValue(policy, 'distance_km', item.distance_km, code);
    assertPolicyValue(policy, 'note', item.note, code);
    const muscleGroups = readEnumArray(item.muscle_groups, MUSCLE_GROUPS, code);
    const sportTags = readEnumArray(item.sport_tags, SPORT_TAGS, code);
    const sets = readDenseArray(item.sets, code);
    if (
      item.tracking_mode_snapshot === 'strength_sets'
        ? sets.length < 1 || sets.length > 50
        : sets.length !== 0
    ) {
      fail(code);
    }
    const clonedSets = sets.map((set, index) =>
      readSet(set, index + 1, item.tracking_mode_snapshot, policy, code)
    );
    return {
      ...item,
      field_policy_snapshot: { ...policy },
      muscle_groups: [...muscleGroups],
      sport_tags: [...sportTags],
      sets: clonedSets
    };
  }

  function readSession(value, expectedRange, code) {
    const session = readExact(value, SESSION_KEYS, code);
    if (
      typeof session.session_id !== 'string' ||
      !UUID_RE.test(session.session_id) ||
      !isIntegerInRange(session.catalog_version, 1, 2147483647) ||
      !isCanonicalRevision(session.revision) ||
      !isCanonicalDay(session.day) ||
      session.day < expectedRange.from ||
      session.day > expectedRange.to ||
      !isCanonicalTimestamp(session.started_at) ||
      !isCanonicalTimestamp(session.ended_at) ||
      session.ended_at < session.started_at ||
      formatViennaDay(Date.parse(session.started_at)) !== session.day ||
      !isIntegerInRange(session.duration_min, 1, 1440) ||
      !(session.title === null || isCanonicalText(session.title, 120)) ||
      !(session.note === null || isCanonicalText(session.note, 500))
    ) {
      fail(code);
    }
    const items = readDenseArray(session.items, code);
    if (items.length < 1 || items.length > 50) fail(code);
    const itemKeys = new Set();
    const clonedItems = items.map((item, index) => {
      const clone = readItem(item, index + 1, code);
      if (itemKeys.has(clone.item_key)) fail(code);
      itemKeys.add(clone.item_key);
      return clone;
    });
    return { ...session, items: clonedItems };
  }

  function readUnits(value, code) {
    const units = readExact(value, UNIT_KEYS, code);
    if (UNIT_KEYS.some((key) => units[key] !== EXPECTED_UNITS[key])) fail(code);
    return { ...units };
  }

  function readCompleteness(value, code) {
    const completeness = readExact(value, COMPLETENESS_KEYS, code);
    if (
      completeness.status !== 'complete' ||
      completeness.truncated !== false ||
      !isIntegerInRange(completeness.session_count, 0, MAX_SESSIONS) ||
      !isIntegerInRange(completeness.item_count, 0, MAX_ITEMS) ||
      !isIntegerInRange(completeness.set_count, 0, MAX_SETS)
    ) {
      fail(code);
    }
    return { ...completeness };
  }

  function readQuality(value, code) {
    const quality = readExact(value, QUALITY_KEYS, code);
    if (!['ok', 'no_data'].includes(quality.status)) fail(code);
    return {
      status: quality.status,
      cautions: readEnumArray(quality.cautions, CAUTIONS, code)
    };
  }

  function assertSortedSessions(sessions, code) {
    for (let index = 1; index < sessions.length; index += 1) {
      const previous = sessions[index - 1];
      const current = sessions[index];
      const comparison =
        compareText(previous.day, current.day) ||
        compareText(previous.started_at, current.started_at) ||
        compareText(previous.session_id, current.session_id);
      if (comparison >= 0) fail(code);
    }
  }

  function expectedCautions(sessions) {
    if (sessions.length === 0) return ['no_sessions_in_range'];
    const cautions = [];
    const versions = new Set();
    let deviceRelative = false;
    let assistance = false;
    sessions.forEach((session) => {
      versions.add(session.catalog_version);
      session.items.forEach((item) => {
        if (item.load_comparability_snapshot === 'device_relative') {
          deviceRelative = true;
        }
        if (item.sets.some((set) => set.assistance_kg !== null)) assistance = true;
      });
    });
    if (assistance) cautions.push('assistance_loads_present');
    if (deviceRelative) cautions.push('device_relative_loads_present');
    if (versions.size > 1) cautions.push('multiple_catalog_versions_present');
    return cautions.sort(compareText);
  }

  function validateExport(value) {
    return guard('EXPORT_CONTRACT_INVALID', () => {
      const exportValue = readExact(value, TOP_LEVEL_KEYS, 'EXPORT_CONTRACT_INVALID');
      if (
        exportValue.schema_version !== EXPORT_SCHEMA ||
        !isCanonicalTimestamp(exportValue.generated_at) ||
        exportValue.timezone !== TIMEZONE
      ) {
        fail('EXPORT_CONTRACT_INVALID');
      }
      const range = readRange(
        exportValue.range,
        formatViennaDay(Date.parse(exportValue.generated_at)),
        'EXPORT_CONTRACT_INVALID'
      );
      const units = readUnits(exportValue.units, 'EXPORT_CONTRACT_INVALID');
      const completeness = readCompleteness(
        exportValue.completeness,
        'EXPORT_CONTRACT_INVALID'
      );
      const quality = readQuality(exportValue.quality, 'EXPORT_CONTRACT_INVALID');
      const sessionValues = readDenseArray(
        exportValue.sessions,
        'EXPORT_CONTRACT_INVALID'
      );
      if (sessionValues.length > MAX_SESSIONS) fail('EXPORT_CONTRACT_INVALID');
      const sessionIds = new Set();
      const sessions = sessionValues.map((session) => {
        const clone = readSession(session, range, 'EXPORT_CONTRACT_INVALID');
        if (sessionIds.has(clone.session_id)) fail('EXPORT_CONTRACT_INVALID');
        sessionIds.add(clone.session_id);
        return clone;
      });
      assertSortedSessions(sessions, 'EXPORT_CONTRACT_INVALID');
      const itemCount = sessions.reduce((sum, session) => sum + session.items.length, 0);
      const setCount = sessions.reduce(
        (sum, session) =>
          sum +
          session.items.reduce((itemSum, item) => itemSum + item.sets.length, 0),
        0
      );
      if (
        itemCount > MAX_ITEMS ||
        setCount > MAX_SETS ||
        completeness.session_count !== sessions.length ||
        completeness.item_count !== itemCount ||
        completeness.set_count !== setCount
      ) {
        fail('EXPORT_CONTRACT_INVALID');
      }
      const expectedQualityStatus = sessions.length === 0 ? 'no_data' : 'ok';
      const cautions = expectedCautions(sessions);
      if (
        quality.status !== expectedQualityStatus ||
        quality.cautions.length !== cautions.length ||
        quality.cautions.some((caution, index) => caution !== cautions[index])
      ) {
        fail('EXPORT_CONTRACT_INVALID');
      }
      return deepFreeze({
        schema_version: exportValue.schema_version,
        generated_at: exportValue.generated_at,
        timezone: exportValue.timezone,
        range,
        units,
        completeness,
        quality,
        sessions
      });
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
  if ('coachingExport' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.coachingExport is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.defineProperty(root.AppModules.activityV2, 'coachingExport', {
    value: deepFreeze({
      validateExport,
      validateRange,
      createPresetRange,
      buildDownloadName
    }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
