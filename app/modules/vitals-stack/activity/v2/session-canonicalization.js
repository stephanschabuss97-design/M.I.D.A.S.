'use strict';

(function initActivityV2SessionCanonicalization(root) {
  const REPLACEMENT_SCHEMA = 'midas.activity-session-replacement.v1';
  const CONTENT_SCHEMA = 'midas.activity-session-content.v1';
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
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
  const WORKING_KEYS = Object.freeze([
    'catalog_version',
    'duration_min',
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
  const POLICIES = Object.freeze(['forbidden', 'optional', 'required']);
  const SAFE_MESSAGE =
    'The activity session content could not be canonicalized.';

  class ActivityV2SessionCanonicalizationError extends Error {
    constructor() {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionCanonicalizationError';
      this.code = 'INVALID_CONTENT';
    }
  }

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
  const asciiBtrim = (value) => value.replace(/^ +| +$/g, '');
  const textLength = (value) => Array.from(value).length;

  function fail() {
    throw new ActivityV2SessionCanonicalizationError();
  }

  function readExact(value, expected) {
    if (!isRecord(value)) fail();
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expected.length ||
      keys.some((key) => typeof key !== 'string' || !expected.includes(key))
    ) {
      fail();
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      expected.some(
        (key) =>
          !descriptors[key] ||
          !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
      )
    ) {
      fail();
    }
    return Object.fromEntries(expected.map((key) => [key, descriptors[key].value]));
  }

  function assertDenseArray(value, min, max) {
    if (!Array.isArray(value) || value.length < min || value.length > max) fail();
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== value.length + 1 ||
      keys[keys.length - 1] !== 'length'
    ) {
      fail();
    }
    for (let index = 0; index < value.length; index += 1) {
      if (keys[index] !== String(index)) fail();
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

  function assertInteger(value, min, max) {
    if (!Number.isSafeInteger(value) || value < min || value > max) fail();
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
      fail();
    }
    return value;
  }

  function optionalInteger(value, min, max) {
    return value === null ? null : assertInteger(value, min, max);
  }

  function optionalDecimal(value, min, max) {
    return value === null ? null : assertDecimal(value, min, max);
  }

  function optionalText(value, maxLength) {
    if (value === null) return null;
    if (typeof value !== 'string') fail();
    const normalized = asciiBtrim(value);
    if (
      normalized === '' ||
      normalized !== value ||
      textLength(value) > maxLength
    ) {
      fail();
    }
    return value;
  }

  function validatePolicy(value, trackingMode, equipment, loadComparability) {
    const policy = readExact(value, FIELD_KEYS);
    if (FIELD_KEYS.some((key) => !POLICIES.includes(policy[key]))) fail();
    const primary = [policy.reps, policy.duration_sec, policy.distance_m];
    const activeLoads = [policy.weight_kg, policy.assistance_kg].filter(
      (entry) => entry !== 'forbidden'
    ).length;
    const hasWeight = policy.weight_kg !== 'forbidden';
    const hasAssistance = policy.assistance_kg !== 'forbidden';
    if (policy.note !== 'optional') fail();

    if (trackingMode === 'strength_sets') {
      if (
        primary.filter((entry) => entry === 'required').length !== 1 ||
        primary.some(
          (entry) => entry !== 'required' && entry !== 'forbidden'
        ) ||
        policy.duration_min !== 'forbidden' ||
        policy.distance_km !== 'forbidden' ||
        activeLoads > 1
      ) {
        fail();
      }
    } else if (trackingMode === 'duration') {
      if (
        policy.duration_min !== 'required' ||
        policy.distance_km !== 'forbidden' ||
        primary.some((entry) => entry !== 'forbidden') ||
        activeLoads !== 0
      ) {
        fail();
      }
    } else if (
      policy.duration_min !== 'required' ||
      policy.distance_km !== 'optional' ||
      primary.some((entry) => entry !== 'forbidden') ||
      activeLoads !== 0
    ) {
      fail();
    }

    if (!hasWeight && !hasAssistance) {
      if (loadComparability !== 'not_applicable') fail();
    } else if (hasAssistance) {
      if (loadComparability !== 'device_relative') fail();
    } else if (
      !['device_relative', 'standardized'].includes(loadComparability) ||
      (['cable', 'machine', 'variable'].includes(equipment) &&
        loadComparability !== 'device_relative')
    ) {
      fail();
    }
    return policy;
  }

  function assertPolicyValue(policy, key, value) {
    if (
      (policy[key] === 'required' && value === null) ||
      (policy[key] === 'forbidden' && value !== null)
    ) {
      fail();
    }
  }

  function validateSet(value, policy, expectedOrder) {
    const set = readExact(value, SET_KEYS);
    if (
      set.set_order !== expectedOrder ||
      set.tracking_mode !== 'strength_sets'
    ) {
      fail();
    }
    const result = {
      set_order: assertInteger(set.set_order, 1, 50),
      tracking_mode: 'strength_sets',
      reps: optionalInteger(set.reps, 1, 1000),
      duration_sec: optionalInteger(set.duration_sec, 1, 3600),
      distance_m: optionalDecimal(set.distance_m, 0.1, 10000),
      weight_kg: optionalDecimal(set.weight_kg, 0.01, 1000),
      assistance_kg: optionalDecimal(set.assistance_kg, 0.01, 1000)
    };
    if (
      [result.reps, result.duration_sec, result.distance_m].filter(
        (entry) => entry !== null
      ).length !== 1 ||
      (result.weight_kg !== null && result.assistance_kg !== null)
    ) {
      fail();
    }
    ['reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg'].forEach(
      (key) => assertPolicyValue(policy, key, result[key])
    );
    return result;
  }

  function validateItem(value, expectedOrder) {
    const item = readExact(value, ITEM_KEYS);
    if (
      typeof item.item_key !== 'string' ||
      !ITEM_KEY_RE.test(item.item_key) ||
      textLength(item.item_key) > 64 ||
      item.item_order !== expectedOrder ||
      typeof item.item_label_snapshot !== 'string' ||
      item.item_label_snapshot === '' ||
      item.item_label_snapshot !== asciiBtrim(item.item_label_snapshot) ||
      textLength(item.item_label_snapshot) > 80 ||
      !TRACKING_MODES.includes(item.tracking_mode_snapshot) ||
      !EQUIPMENT.includes(item.equipment_snapshot) ||
      !LOAD_COMPARABILITY.includes(item.load_comparability_snapshot)
    ) {
      fail();
    }
    const policy = validatePolicy(
      item.field_policy_snapshot,
      item.tracking_mode_snapshot,
      item.equipment_snapshot,
      item.load_comparability_snapshot
    );
    const durationMin = optionalInteger(item.duration_min, 1, 1440);
    const distanceKm = optionalDecimal(item.distance_km, 0.01, 1000);
    const note = optionalText(item.note, 500);
    assertPolicyValue(policy, 'duration_min', durationMin);
    assertPolicyValue(policy, 'distance_km', distanceKm);
    assertPolicyValue(policy, 'note', note);
    const strength = item.tracking_mode_snapshot === 'strength_sets';
    assertDenseArray(item.sets, strength ? 1 : 0, strength ? 50 : 0);
    const sets = item.sets.map((set, index) =>
      validateSet(set, policy, index + 1)
    );
    return {
      item_key: item.item_key,
      item_order: item.item_order,
      item_label_snapshot: item.item_label_snapshot,
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

  function project(workingValue) {
    const working = readExact(workingValue, WORKING_KEYS);
    const catalogVersion = assertInteger(
      working.catalog_version,
      1,
      2147483647
    );
    const durationMin = assertInteger(working.duration_min, 1, 1440);
    const note = optionalText(working.note, 500);
    assertDenseArray(working.items, 1, 50);
    const items = working.items.map((item, index) =>
      validateItem(item, index + 1)
    );
    if (new Set(items.map((item) => item.item_key)).size !== items.length) fail();

    const replacement = {
      schema_version: REPLACEMENT_SCHEMA,
      duration_min: durationMin,
      note,
      items: items.map((item) => ({
        item_key: item.item_key,
        item_order: item.item_order,
        duration_min: item.duration_min,
        distance_km: item.distance_km,
        note: item.note,
        sets: item.sets.map((set) => ({
          set_order: set.set_order,
          reps: set.reps,
          duration_sec: set.duration_sec,
          distance_m: set.distance_m,
          weight_kg: set.weight_kg,
          assistance_kg: set.assistance_kg
        }))
      }))
    };
    const canonicalContent = {
      schema_version: CONTENT_SCHEMA,
      catalog_version: catalogVersion,
      duration_min: durationMin,
      note,
      items
    };
    return deepFreeze({ replacement, canonicalContent });
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
  if ('sessionCanonicalization' in root.AppModules.activityV2) {
    throw new Error(
      'AppModules.activityV2.sessionCanonicalization is already registered'
    );
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.defineProperty(root.AppModules.activityV2, 'sessionCanonicalization', {
    value: deepFreeze({ project }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
