'use strict';

(function initHealthExportV3(root) {
  const V2_SCHEMA = 'midas.health-export.v2';
  const V3_SCHEMA = 'midas.health-export.v3';
  const CONSUMER_SCHEMA = 'midas.activity-consumer.v1';
  const TIMEZONE = 'Europe/Vienna';
  const DAY_MS = 86400000;
  const TOP_V2_KEYS = Object.freeze([
    'schema_version', 'generated_at', 'timezone', 'range', 'completeness',
    'blood_pressure', 'body', 'notes', 'labs', 'activities'
  ]);
  const TOP_V3_KEYS = Object.freeze([
    'schema_version', 'generated_at', 'timezone', 'range', 'completeness',
    'blood_pressure', 'body', 'notes', 'labs', 'activity_summary',
    'activity_quality', 'activities'
  ]);
  const RANGE_KEYS = Object.freeze(['from', 'to']);
  const COMPLETENESS_KEYS = Object.freeze(['status', 'loaded_domains', 'counts']);
  const COUNT_KEYS = Object.freeze([
    'blood_pressure', 'body', 'notes', 'labs', 'activities'
  ]);
  const DOMAINS = Object.freeze([
    'blood_pressure', 'body', 'notes', 'labs', 'activities'
  ]);
  const BP_KEYS = Object.freeze([
    'day', 'daypart', 'systolic_mmhg', 'diastolic_mmhg', 'pulse_bpm'
  ]);
  const BODY_KEYS = Object.freeze([
    'day', 'weight_kg', 'waist_cm', 'fat_kg', 'muscle_kg'
  ]);
  const NOTE_KEYS = Object.freeze(['day', 'text']);
  const LAB_KEYS = Object.freeze([
    'day', 'egfr', 'creatinine', 'hba1c', 'ldl', 'potassium', 'ckd_stage',
    'doctor_comment'
  ]);
  const V2_ACTIVITY_KEYS = Object.freeze([
    'id', 'occurred_at', 'day', 'activity', 'duration_min'
  ]);
  const V2_ACTIVITY_NOTE_KEYS = Object.freeze([...V2_ACTIVITY_KEYS, 'note']);
  const SAFE_CONTRACT_MESSAGE = 'The health export payload is invalid.';
  const SAFE_LOAD_MESSAGE = 'The health export request failed.';

  class HealthExportV3ContractError extends Error {
    constructor() {
      super(SAFE_CONTRACT_MESSAGE);
      this.name = 'HealthExportV3ContractError';
      this.code = 'HEALTH_EXPORT_V3_CONTRACT_INVALID';
    }
  }

  class HealthExportV3LoadError extends Error {
    constructor(code) {
      super(SAFE_LOAD_MESSAGE);
      this.name = 'HealthExportV3LoadError';
      this.code = code;
      this.operation = 'loadHealthExportV3';
    }
  }

  const fail = () => {
    throw new HealthExportV3ContractError();
  };

  const guard = (callback) => {
    try {
      return callback();
    } catch (error) {
      if (error instanceof HealthExportV3ContractError) throw error;
      return fail();
    }
  };

  const isPlainRecord = (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null;
  };

  const readExact = (value, expectedKeys) => {
    if (!isPlainRecord(value)) fail();
    const keys = Reflect.ownKeys(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      keys.length !== expectedKeys.length ||
      keys.some((key) => typeof key !== 'string' || !expectedKeys.includes(key)) ||
      expectedKeys.some((key) => {
        const descriptor = descriptors[key];
        return !descriptor ||
          !descriptor.enumerable ||
          !Object.prototype.hasOwnProperty.call(descriptor, 'value');
      })
    ) {
      fail();
    }
    return Object.fromEntries(
      expectedKeys.map((key) => [key, descriptors[key].value])
    );
  };

  const readDenseArray = (value, maxLength) => {
    if (!Array.isArray(value)) fail();
    const prototype = Object.getPrototypeOf(value);
    if (
      prototype === null ||
      Object.getPrototypeOf(prototype) === null ||
      Object.getPrototypeOf(Object.getPrototypeOf(prototype)) !== null
    ) {
      fail();
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const length = descriptors.length?.value;
    if (
      !Number.isSafeInteger(length) ||
      length < 0 ||
      (maxLength !== undefined && length > maxLength)
    ) fail();
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== length + 1 ||
      !keys.includes('length') ||
      keys.some((key) => {
        if (key === 'length') return false;
        if (typeof key !== 'string' || !/^(0|[1-9]\d*)$/.test(key)) return true;
        const index = Number(key);
        const descriptor = descriptors[key];
        return !Number.isSafeInteger(index) ||
          index < 0 ||
          index >= length ||
          !descriptor ||
          !descriptor.enumerable ||
          !Object.prototype.hasOwnProperty.call(descriptor, 'value');
      })
    ) {
      fail();
    }
    return Array.from({ length }, (_, index) => descriptors[String(index)].value);
  };

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

  const canonicalDay = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };

  const canonicalTimestamp = (value) =>
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value;

  const readRange = (value, contract, today) => {
    const range = readExact(value, RANGE_KEYS);
    if (!canonicalDay(range.from) || !canonicalDay(range.to)) fail();
    const inclusiveDays = Math.trunc(
      (Date.parse(`${range.to}T00:00:00.000Z`) -
        Date.parse(`${range.from}T00:00:00.000Z`)) /
        DAY_MS
    ) + 1;
    const validated = contract.validateRange({
      from: range.from,
      to: range.to,
      inclusive_days: inclusiveDays
    }, today);
    return { from: validated.from, to: validated.to };
  };

  const requireDay = (value, range) => {
    if (!canonicalDay(value) || value < range.from || value > range.to) fail();
    return value;
  };

  const numberOrNull = (value) => {
    if (value === null) return null;
    if (typeof value !== 'number' || !Number.isFinite(value)) fail();
    return value;
  };

  const textOrNull = (value) => {
    if (value === null) return null;
    if (typeof value !== 'string') fail();
    return value;
  };

  const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

  const assertSorted = (rows, comparator) => {
    if (rows.some((row, index) => index > 0 && comparator(rows[index - 1], row) > 0)) {
      fail();
    }
    return rows;
  };

  const readBloodPressure = (value, range) => assertSorted(
    readDenseArray(value).map((entry) => {
      const row = readExact(entry, BP_KEYS);
      const normalized = {
        day: requireDay(row.day, range),
        daypart: row.daypart,
        systolic_mmhg: numberOrNull(row.systolic_mmhg),
        diastolic_mmhg: numberOrNull(row.diastolic_mmhg),
        pulse_bpm: numberOrNull(row.pulse_bpm)
      };
      if (
        !['morning', 'evening'].includes(normalized.daypart) ||
        [normalized.systolic_mmhg, normalized.diastolic_mmhg, normalized.pulse_bpm]
          .every((entryValue) => entryValue === null)
      ) {
        fail();
      }
      return normalized;
    }),
    (left, right) => compareText(left.day, right.day) ||
      ({ morning: 0, evening: 1 }[left.daypart] -
        { morning: 0, evening: 1 }[right.daypart])
  );

  const readBody = (value, range) => assertSorted(
    readDenseArray(value).map((entry) => {
      const row = readExact(entry, BODY_KEYS);
      const normalized = {
        day: requireDay(row.day, range),
        weight_kg: numberOrNull(row.weight_kg),
        waist_cm: numberOrNull(row.waist_cm),
        fat_kg: numberOrNull(row.fat_kg),
        muscle_kg: numberOrNull(row.muscle_kg)
      };
      if (Object.values(normalized).slice(1).every((entryValue) => entryValue === null)) {
        fail();
      }
      return normalized;
    }),
    (left, right) => compareText(left.day, right.day)
  );

  const readNotes = (value, range) => assertSorted(
    readDenseArray(value).map((entry) => {
      const row = readExact(entry, NOTE_KEYS);
      if (
        typeof row.text !== 'string' ||
        !row.text ||
        row.text.trim() !== row.text
      ) fail();
      return { day: requireDay(row.day, range), text: row.text };
    }),
    (left, right) => compareText(left.day, right.day)
  );

  const readLabs = (value, range) => assertSorted(
    readDenseArray(value).map((entry) => {
      const row = readExact(entry, LAB_KEYS);
      return {
        day: requireDay(row.day, range),
        egfr: numberOrNull(row.egfr),
        creatinine: numberOrNull(row.creatinine),
        hba1c: numberOrNull(row.hba1c),
        ldl: numberOrNull(row.ldl),
        potassium: numberOrNull(row.potassium),
        ckd_stage: textOrNull(row.ckd_stage),
        doctor_comment: textOrNull(row.doctor_comment)
      };
    }),
    (left, right) => compareText(left.day, right.day)
  );

  const readV2Activities = (value, range) => assertSorted(
    readDenseArray(value).map((entry) => {
      if (!isPlainRecord(entry)) fail();
      const keys = Reflect.ownKeys(entry);
      const expected = keys.length === V2_ACTIVITY_NOTE_KEYS.length
        ? V2_ACTIVITY_NOTE_KEYS
        : V2_ACTIVITY_KEYS;
      const row = readExact(entry, expected);
      if (
        typeof row.id !== 'string' || !row.id || row.id.trim() !== row.id ||
        !canonicalTimestamp(row.occurred_at) ||
        typeof row.activity !== 'string' || !row.activity ||
        row.activity.trim() !== row.activity ||
        typeof row.duration_min !== 'number' || !Number.isFinite(row.duration_min) ||
        (expected === V2_ACTIVITY_NOTE_KEYS &&
          (typeof row.note !== 'string' || !row.note || row.note.trim() !== row.note))
      ) {
        fail();
      }
      const normalized = {
        id: row.id,
        occurred_at: row.occurred_at,
        day: requireDay(row.day, range),
        activity: row.activity,
        duration_min: row.duration_min
      };
      if (expected === V2_ACTIVITY_NOTE_KEYS) normalized.note = row.note;
      return normalized;
    }),
    (left, right) => compareText(left.occurred_at, right.occurred_at) ||
      compareText(left.id, right.id)
  );

  const readCompleteness = (value, counts) => {
    const completeness = readExact(value, COMPLETENESS_KEYS);
    const domains = readDenseArray(completeness.loaded_domains, DOMAINS.length);
    const actualCounts = readExact(completeness.counts, COUNT_KEYS);
    if (
      completeness.status !== 'complete' ||
      domains.length !== DOMAINS.length ||
      domains.some((domain, index) => domain !== DOMAINS[index]) ||
      COUNT_KEYS.some((key) =>
        !Number.isSafeInteger(actualCounts[key]) ||
        actualCounts[key] !== counts[key]
      )
    ) {
      fail();
    }
    return {
      status: 'complete',
      loaded_domains: [...DOMAINS],
      counts: { ...counts }
    };
  };

  const resolveOptions = (options = {}) => {
    const contract = options.contract || root.AppModules?.activityV2?.consumer;
    if (
      typeof contract?.validateRange !== 'function' ||
      typeof contract?.validateSnapshot !== 'function'
    ) {
      fail();
    }
    return { contract, today: options.today };
  };

  const readV2 = (value, options) => {
    const { contract, today } = resolveOptions(options);
    const raw = readExact(value, TOP_V2_KEYS);
    if (
      raw.schema_version !== V2_SCHEMA ||
      raw.timezone !== TIMEZONE ||
      !canonicalTimestamp(raw.generated_at)
    ) {
      fail();
    }
    const range = readRange(raw.range, contract, today);
    const bloodPressure = readBloodPressure(raw.blood_pressure, range);
    const body = readBody(raw.body, range);
    const notes = readNotes(raw.notes, range);
    const labs = readLabs(raw.labs, range);
    const activities = readV2Activities(raw.activities, range);
    const counts = {
      blood_pressure: bloodPressure.length,
      body: body.length,
      notes: notes.length,
      labs: labs.length,
      activities: activities.length
    };
    return {
      schema_version: V2_SCHEMA,
      generated_at: raw.generated_at,
      timezone: TIMEZONE,
      range,
      completeness: readCompleteness(raw.completeness, counts),
      blood_pressure: bloodPressure,
      body,
      notes,
      labs,
      activities
    };
  };

  const validateV2 = (value, options) => guard(() => deepFreeze(readV2(value, options)));

  const build = (value, options) => guard(() => {
    const input = readExact(value, ['baseExportV2', 'activitySnapshot']);
    const { contract, today } = resolveOptions(options);
    const base = readV2(input.baseExportV2, { contract, today });
    const snapshot = contract.validateSnapshot(input.activitySnapshot, today);
    if (
      snapshot.range.from !== base.range.from ||
      snapshot.range.to !== base.range.to
    ) {
      fail();
    }
    return deepFreeze({
      schema_version: V3_SCHEMA,
      generated_at: base.generated_at,
      timezone: TIMEZONE,
      range: { ...base.range },
      completeness: {
        status: 'complete',
        loaded_domains: [...DOMAINS],
        counts: {
          blood_pressure: base.blood_pressure.length,
          body: base.body.length,
          notes: base.notes.length,
          labs: base.labs.length,
          activities: snapshot.units.length
        }
      },
      blood_pressure: base.blood_pressure,
      body: base.body,
      notes: base.notes,
      labs: base.labs,
      activity_summary: { ...snapshot.summary },
      activity_quality: {
        mixed_source_day_count: snapshot.quality.mixed_source_day_count,
        mixed_source_days: [...snapshot.quality.mixed_source_days]
      },
      activities: snapshot.units.map((unit) => ({ ...unit }))
    });
  });

  const validateV3 = (value, options) => guard(() => {
    const { contract, today } = resolveOptions(options);
    const raw = readExact(value, TOP_V3_KEYS);
    if (
      raw.schema_version !== V3_SCHEMA ||
      raw.timezone !== TIMEZONE ||
      !canonicalTimestamp(raw.generated_at)
    ) {
      fail();
    }
    const range = readRange(raw.range, contract, today);
    const bloodPressure = readBloodPressure(raw.blood_pressure, range);
    const body = readBody(raw.body, range);
    const notes = readNotes(raw.notes, range);
    const labs = readLabs(raw.labs, range);
    const inclusiveDays = Math.trunc(
      (Date.parse(`${range.to}T00:00:00.000Z`) -
        Date.parse(`${range.from}T00:00:00.000Z`)) /
        DAY_MS
    ) + 1;
    const snapshot = contract.validateSnapshot({
      schema_version: CONSUMER_SCHEMA,
      timezone: TIMEZONE,
      range: { ...range, inclusive_days: inclusiveDays },
      summary: raw.activity_summary,
      quality: raw.activity_quality,
      units: raw.activities
    }, today);
    const counts = {
      blood_pressure: bloodPressure.length,
      body: body.length,
      notes: notes.length,
      labs: labs.length,
      activities: snapshot.units.length
    };
    return deepFreeze({
      schema_version: V3_SCHEMA,
      generated_at: raw.generated_at,
      timezone: TIMEZONE,
      range,
      completeness: readCompleteness(raw.completeness, counts),
      blood_pressure: bloodPressure,
      body,
      notes,
      labs,
      activity_summary: { ...snapshot.summary },
      activity_quality: {
        mixed_source_day_count: snapshot.quality.mixed_source_day_count,
        mixed_source_days: [...snapshot.quality.mixed_source_days]
      },
      activities: snapshot.units.map((unit) => ({ ...unit }))
    });
  });

  const createLoader = (options = {}) => {
    const loadBaseExportV2 = options.loadBaseExportV2;
    const loadActivitySnapshot = options.loadActivitySnapshot;
    const contract = options.contract || root.AppModules?.activityV2?.consumer;
    const today = options.today;
    if (
      typeof loadBaseExportV2 !== 'function' ||
      typeof loadActivitySnapshot !== 'function' ||
      typeof contract?.validateRange !== 'function' ||
      typeof contract?.validateSnapshot !== 'function'
    ) {
      throw new HealthExportV3LoadError('CONFIG_UNAVAILABLE');
    }
    const load = async (rangeValue) => {
      let range;
      try {
        range = readRange(rangeValue, contract, today);
      } catch (_) {
        throw new HealthExportV3LoadError('INVALID_RANGE');
      }
      let baseExportV2;
      let activitySnapshot;
      try {
        [baseExportV2, activitySnapshot] = await Promise.all([
          loadBaseExportV2({ ...range }),
          loadActivitySnapshot({ ...range })
        ]);
      } catch (_) {
        throw new HealthExportV3LoadError('READ_FAILED');
      }
      try {
        return build(
          { baseExportV2, activitySnapshot },
          { contract, today }
        );
      } catch (_) {
        throw new HealthExportV3LoadError('CONTRACT_INVALID');
      }
    };
    return deepFreeze({ load });
  };

  if (root.AppModules === undefined) root.AppModules = {};
  if (!isPlainRecord(root.AppModules)) throw new TypeError('AppModules must be an object');
  if (root.AppModules.doctor === undefined) root.AppModules.doctor = {};
  if (!isPlainRecord(root.AppModules.doctor)) {
    throw new TypeError('AppModules.doctor must be an object');
  }
  if ('healthExportV3' in root.AppModules.doctor) {
    throw new Error('AppModules.doctor.healthExportV3 is already registered');
  }
  Object.defineProperty(root.AppModules.doctor, 'healthExportV3', {
    value: deepFreeze({
      schemaVersion: V3_SCHEMA,
      validateV2,
      build,
      validateV3,
      createLoader,
      ContractError: HealthExportV3ContractError,
      LoadError: HealthExportV3LoadError
    }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
