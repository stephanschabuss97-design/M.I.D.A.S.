'use strict';

(function initActivityV2Consumer(root) {
  const SCHEMA_VERSION = 'midas.activity-consumer.v1';
  const TIMEZONE = 'Europe/Vienna';
  const SAFE_MESSAGE = 'The activity consumer payload is invalid.';
  const TOP_LEVEL_KEYS = Object.freeze([
    'schema_version',
    'timezone',
    'range',
    'summary',
    'quality',
    'units'
  ]);
  const RANGE_KEYS = Object.freeze(['from', 'to', 'inclusive_days']);
  const SUMMARY_KEYS = Object.freeze([
    'unit_count',
    'active_day_count',
    'active_days_per_week',
    'total_duration_min',
    'average_duration_min',
    'last_day'
  ]);
  const QUALITY_KEYS = Object.freeze([
    'mixed_source_day_count',
    'mixed_source_days'
  ]);
  const UNIT_KEYS = Object.freeze([
    'source',
    'id',
    'day',
    'occurred_at',
    'label',
    'duration_min',
    'note',
    'item_count'
  ]);
  const SOURCES = Object.freeze(['activity_v1', 'activity_v2']);
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const DAY_MS = 86400000;
  const MAX_RANGE_DAYS = 400;
  const MAX_V1_DURATION_MIN = 2147483647;
  const MAX_V2_DURATION_MIN = 1440;
  const MAX_V2_SESSIONS = 1000;
  const VIENNA_DAY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  class ActivityConsumerContractError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityConsumerContractError';
      this.code = code;
    }
  }

  function fail(code) {
    throw new ActivityConsumerContractError(code);
  }

  function guard(code, callback) {
    try {
      return callback();
    } catch (error) {
      if (error instanceof ActivityConsumerContractError) throw error;
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

  function isPlainRecord(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null;
  }

  function isStandardArray(value) {
    if (!Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    if (prototype === null) return false;
    const objectPrototype = Object.getPrototypeOf(prototype);
    return objectPrototype !== null && Object.getPrototypeOf(objectPrototype) === null;
  }

  function readExact(value, expectedKeys, code) {
    if (!isPlainRecord(value)) fail(code);
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expectedKeys.length ||
      keys.some((key) => typeof key !== 'string' || !expectedKeys.includes(key))
    ) {
      fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      expectedKeys.some((key) => {
        const descriptor = descriptors[key];
        return (
          !descriptor ||
          !descriptor.enumerable ||
          !Object.prototype.hasOwnProperty.call(descriptor, 'value')
        );
      })
    ) {
      fail(code);
    }
    return Object.fromEntries(
      expectedKeys.map((key) => [key, descriptors[key].value])
    );
  }

  function readDenseArray(value, maxLength, code) {
    if (!isStandardArray(value)) fail(code);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const lengthDescriptor = descriptors.length;
    if (
      !lengthDescriptor ||
      !Object.prototype.hasOwnProperty.call(lengthDescriptor, 'value') ||
      !isIntegerInRange(lengthDescriptor.value, 0, maxLength)
    ) {
      fail(code);
    }
    const keys = Reflect.ownKeys(value);
    const expectedKeys = [
      ...Array.from({ length: lengthDescriptor.value }, (_, index) => String(index)),
      'length'
    ];
    if (
      keys.length !== expectedKeys.length ||
      keys.some((key) => typeof key !== 'string' || !expectedKeys.includes(key))
    ) {
      fail(code);
    }
    if (
      expectedKeys.slice(0, -1).some((key) => {
        const descriptor = descriptors[key];
        return (
          !descriptor ||
          !descriptor.enumerable ||
          !Object.prototype.hasOwnProperty.call(descriptor, 'value')
        );
      })
    ) {
      fail(code);
    }
    return expectedKeys.slice(0, -1).map((key) => descriptors[key].value);
  }

  function compareText(left, right) {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  }

  function isCanonicalDay(value) {
    if (typeof value !== 'string' || !DAY_RE.test(value) || value.startsWith('0000')) {
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

  function formatViennaDay(epochMs) {
    const parts = Object.fromEntries(
      VIENNA_DAY_FORMATTER.formatToParts(new Date(epochMs)).map((part) => [
        part.type,
        part.value
      ])
    );
    const day = `${parts.year}-${parts.month}-${parts.day}`;
    if (!isCanonicalDay(day)) fail('INVALID_RANGE');
    return day;
  }

  function resolveToday(today, code) {
    const value = today === undefined ? formatViennaDay(Date.now()) : today;
    if (!isCanonicalDay(value)) fail(code);
    return value;
  }

  function isIntegerInRange(value, min, max) {
    return Number.isSafeInteger(value) && value >= min && value <= max;
  }

  function hasValidTextLength(value, min, max) {
    return (
      typeof value === 'string' &&
      Array.from(value).length >= min &&
      Array.from(value).length <= max
    );
  }

  function readRange(value, today, code) {
    const range = readExact(value, RANGE_KEYS, code);
    if (!isCanonicalDay(range.from) || !isCanonicalDay(range.to)) fail(code);
    const fromDay = dayNumber(range.from);
    const toDay = dayNumber(range.to);
    const inclusiveDays = toDay - fromDay + 1;
    if (
      inclusiveDays < 1 ||
      inclusiveDays > MAX_RANGE_DAYS ||
      range.inclusive_days !== inclusiveDays ||
      toDay > dayNumber(resolveToday(today, code))
    ) {
      fail(code);
    }
    return {
      from: range.from,
      to: range.to,
      inclusive_days: inclusiveDays
    };
  }

  function validateRange(value, today) {
    return guard('INVALID_RANGE', () =>
      deepFreeze(readRange(value, today, 'INVALID_RANGE'))
    );
  }

  function readUnit(value, range, code) {
    const unit = readExact(value, UNIT_KEYS, code);
    if (
      !SOURCES.includes(unit.source) ||
      typeof unit.id !== 'string' ||
      !UUID_RE.test(unit.id) ||
      !isCanonicalDay(unit.day) ||
      !isCanonicalTimestamp(unit.occurred_at) ||
      formatViennaDay(Date.parse(unit.occurred_at)) !== unit.day ||
      !hasValidTextLength(unit.label, 1, unit.source === 'activity_v1' ? 200 : 120) ||
      unit.label.trim().length === 0 ||
      (unit.note !== null && !hasValidTextLength(unit.note, 1, 500))
    ) {
      fail(code);
    }
    if (
      range !== null &&
      (dayNumber(unit.day) < dayNumber(range.from) ||
        dayNumber(unit.day) > dayNumber(range.to))
    ) {
      fail(code);
    }
    if (unit.source === 'activity_v1') {
      if (
        !isIntegerInRange(unit.duration_min, 1, MAX_V1_DURATION_MIN) ||
        unit.item_count !== null
      ) {
        fail(code);
      }
    } else if (
      !isIntegerInRange(unit.duration_min, 1, MAX_V2_DURATION_MIN) ||
      !isIntegerInRange(unit.item_count, 0, 50) ||
      unit.label.trim() !== unit.label
    ) {
      fail(code);
    }
    return {
      source: unit.source,
      id: unit.id,
      day: unit.day,
      occurred_at: unit.occurred_at,
      label: unit.label,
      duration_min: unit.duration_min,
      note: unit.note,
      item_count: unit.item_count
    };
  }

  function compareCanonicalUnits(left, right) {
    return (
      compareText(left.day, right.day) ||
      compareText(left.occurred_at, right.occurred_at) ||
      compareText(left.source, right.source) ||
      compareText(left.id, right.id)
    );
  }

  function compareUnits(left, right) {
    return guard('INVALID_UNITS', () =>
      compareCanonicalUnits(
        readUnit(left, null, 'INVALID_UNITS'),
        readUnit(right, null, 'INVALID_UNITS')
      )
    );
  }

  function readUnits(value, range, code) {
    const rawUnits = readDenseArray(
      value,
      range.inclusive_days + MAX_V2_SESSIONS,
      code
    );
    const units = rawUnits.map((unit) => readUnit(unit, range, code));
    let v2Count = 0;
    const identities = new Set();
    const v1Days = new Set();
    units.forEach((unit) => {
      const identity = `${unit.source}:${unit.id}`;
      if (identities.has(identity)) fail(code);
      identities.add(identity);
      if (unit.source === 'activity_v2') {
        v2Count += 1;
      } else {
        if (v1Days.has(unit.day)) fail(code);
        v1Days.add(unit.day);
      }
    });
    if (
      v2Count > MAX_V2_SESSIONS ||
      v1Days.size > range.inclusive_days ||
      units.length > range.inclusive_days + MAX_V2_SESSIONS
    ) {
      fail(code);
    }
    return units;
  }

  function buildSnapshot(range, units, code) {
    const sortedUnits = units.slice().sort(compareCanonicalUnits);
    const sourcesByDay = new Map();
    let totalDurationMin = 0;
    sortedUnits.forEach((unit) => {
      totalDurationMin += unit.duration_min;
      if (!Number.isSafeInteger(totalDurationMin)) fail(code);
      if (!sourcesByDay.has(unit.day)) sourcesByDay.set(unit.day, new Set());
      sourcesByDay.get(unit.day).add(unit.source);
    });
    const activeDays = Array.from(sourcesByDay.keys()).sort(compareText);
    const mixedSourceDays = activeDays.filter(
      (day) => sourcesByDay.get(day).size > 1
    );
    const unitCount = sortedUnits.length;
    const activeDayCount = activeDays.length;
    return {
      schema_version: SCHEMA_VERSION,
      timezone: TIMEZONE,
      range,
      summary: {
        unit_count: unitCount,
        active_day_count: activeDayCount,
        active_days_per_week:
          Math.round((activeDayCount * 70) / range.inclusive_days) / 10,
        total_duration_min: totalDurationMin,
        average_duration_min:
          unitCount === 0 ? null : Math.round(totalDurationMin / unitCount),
        last_day: activeDays.length === 0 ? null : activeDays[activeDays.length - 1]
      },
      quality: {
        mixed_source_day_count: mixedSourceDays.length,
        mixed_source_days: mixedSourceDays
      },
      units: sortedUnits
    };
  }

  function aggregateUnits(unitsValue, rangeValue, today) {
    return guard('INVALID_UNITS', () => {
      const range = readRange(rangeValue, today, 'INVALID_UNITS');
      const units = readUnits(unitsValue, range, 'INVALID_UNITS');
      return deepFreeze(buildSnapshot(range, units, 'INVALID_UNITS'));
    });
  }

  function scalarObjectsEqual(left, right, keys) {
    return keys.every((key) => Object.is(left[key], right[key]));
  }

  function validateSnapshot(value, today) {
    return guard('INVALID_SNAPSHOT', () => {
      const snapshot = readExact(value, TOP_LEVEL_KEYS, 'INVALID_SNAPSHOT');
      if (
        snapshot.schema_version !== SCHEMA_VERSION ||
        snapshot.timezone !== TIMEZONE
      ) {
        fail('INVALID_SNAPSHOT');
      }
      const range = readRange(snapshot.range, today, 'INVALID_SNAPSHOT');
      const units = readUnits(snapshot.units, range, 'INVALID_SNAPSHOT');
      if (
        units.some(
          (unit, index) =>
            index > 0 && compareCanonicalUnits(units[index - 1], unit) > 0
        )
      ) {
        fail('INVALID_SNAPSHOT');
      }
      const summary = readExact(snapshot.summary, SUMMARY_KEYS, 'INVALID_SNAPSHOT');
      const quality = readExact(snapshot.quality, QUALITY_KEYS, 'INVALID_SNAPSHOT');
      const mixedSourceDays = readDenseArray(
        quality.mixed_source_days,
        range.inclusive_days,
        'INVALID_SNAPSHOT'
      );
      const candidate = buildSnapshot(range, units, 'INVALID_SNAPSHOT');
      if (
        !scalarObjectsEqual(summary, candidate.summary, SUMMARY_KEYS) ||
        quality.mixed_source_day_count !== candidate.quality.mixed_source_day_count ||
        mixedSourceDays.length !== candidate.quality.mixed_source_days.length ||
        mixedSourceDays.some(
          (day, index) => day !== candidate.quality.mixed_source_days[index]
        )
      ) {
        fail('INVALID_SNAPSHOT');
      }
      return deepFreeze(candidate);
    });
  }

  if (root.AppModules === undefined) {
    root.AppModules = {};
  } else if (!isPlainRecord(root.AppModules)) {
    throw new TypeError('AppModules must be an object');
  }
  if (root.AppModules.activityV2 === undefined) {
    root.AppModules.activityV2 = {};
  } else if (!isPlainRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('consumer' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.consumer is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.defineProperty(root.AppModules.activityV2, 'consumer', {
    value: deepFreeze({
      validateRange,
      compareUnits,
      aggregateUnits,
      validateSnapshot
    }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
