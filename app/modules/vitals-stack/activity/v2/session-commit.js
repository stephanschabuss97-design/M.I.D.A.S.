'use strict';

(function initActivityV2SessionCommit(root) {
  const DRAFT_SCHEMA_VERSION = 'midas.activity-session-draft.v3';
  const PAYLOAD_SCHEMA_VERSION = 'midas.activity-session.v1';
  const COMMIT_INTENT_SCHEMA_VERSION =
    'midas.activity-session-commit-intent.v1';
  const ITEM_LIMIT = 50;
  const SET_LIMIT = 50;
  const SESSION_NOTE_LIMIT = 500;
  const ITEM_NOTE_LIMIT = 500;
  const RAW_NUMERIC_LIMIT = 32;
  const MAX_SESSION_DURATION_MIN = 1440;
  const SAFE_MESSAGE =
    'The activity session commit operation could not be completed.';
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const INTEGER_RE = /^[0-9]+$/;
  const DECIMAL_RE = /^[0-9]+(?:[,.][0-9]+)?$/;
  const CANONICAL_TIMESTAMP_RE =
    /^(\d{4})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const CREATE_OPTION_KEYS = Object.freeze([
    'draft',
    'recovery',
    'semantics',
    'commitSession',
    'now'
  ]);
  const CONTROLLER_KEYS = Object.freeze([
    'getState',
    'finish',
    'retry',
    'subscribe',
    'destroy'
  ]);
  const STATE_KEYS = Object.freeze([
    'state',
    'reason',
    'focus_target',
    'intent_present'
  ]);
  const DRAFT_CONTROLLER_KEYS = Object.freeze([
    'getSnapshot',
    'getTimerSnapshot',
    'addItem',
    'removeItem',
    'moveItem',
    'setNote',
    'discard',
    'addSet',
    'removeSet',
    'setSetField',
    'setItemField'
  ]);
  const RECOVERY_CONTROLLER_KEYS = Object.freeze([
    'getState',
    'getDraft',
    'startNew',
    'continueSession',
    'flush',
    'discard',
    'subscribe',
    'destroy',
    'getCommitIntent',
    'prepareCommit',
    'beginCommitAttempt',
    'releaseCommit',
    'completeCommit'
  ]);
  const RECOVERY_ERROR_CODES = Object.freeze([
    'INVALID_COMMIT_INTENT',
    'COMMIT_INTENT_REQUIRED',
    'COMMIT_INTENT_MISMATCH',
    'INVALID_COMMIT_ATTEMPT',
    'COMMIT_ATTEMPT_REQUIRED',
    'COMMIT_ATTEMPT_MISMATCH',
    'RELEASE_BLOCKED',
    'UNSAFE_DISCARD',
    'MUTATION_BLOCKED',
    'CONFLICT',
    'STORAGE_ERROR'
  ]);
  const COMMIT_ERROR_CODES = Object.freeze([
    'INVALID_DRAFT',
    'INVALID_SEMANTICS',
    'CATALOG_VERSION_MISMATCH',
    'EMPTY_SESSION',
    'UNKNOWN_ITEM',
    'INACTIVE_ITEM',
    'INVALID_ITEM_VALUE',
    'INVALID_SET_VALUE',
    'INVALID_TIME',
    'INVALID_CLOCK',
    'INVALID_COMMIT_INTENT'
  ]);
  const KNOWN_NOT_COMMITTED_CODES = Object.freeze([
    'AUTH_REQUIRED',
    'INVALID_SESSION',
    'REQUEST_FAILED'
  ]);
  const COMMIT_OUTCOMES = Object.freeze(['created', 'replayed']);
  const FIELD_POLICIES = Object.freeze(['forbidden', 'optional', 'required']);
  const TRACKING_MODES = Object.freeze([
    'duration',
    'duration_distance',
    'strength_sets'
  ]);
  const CATALOG_FIELD_KEYS = Object.freeze([
    'assistance_kg',
    'distance_km',
    'distance_m',
    'duration_min',
    'duration_sec',
    'note',
    'reps',
    'weight_kg'
  ]);
  const ITEM_NUMERIC_FIELD_KEYS = Object.freeze([
    'duration_min',
    'distance_km'
  ]);
  const SET_FIELD_KEYS = Object.freeze([
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  const SNAPSHOT_KEYS = Object.freeze([
    'draft_schema_version',
    'request_id',
    'catalog_version',
    'revision',
    'started_at',
    'note',
    'items'
  ]);
  const DRAFT_ITEM_KEYS = Object.freeze([
    'item_key',
    'item_order',
    'duration_min',
    'distance_km',
    'note',
    'sets'
  ]);
  const DRAFT_SET_KEYS = Object.freeze([
    'set_order',
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  const PAYLOAD_KEYS = Object.freeze([
    'schema_version',
    'catalog_version',
    'started_at',
    'ended_at',
    'duration_min',
    'title',
    'note',
    'items'
  ]);
  const PAYLOAD_ITEM_KEYS = Object.freeze([
    'item_key',
    'item_order',
    'duration_min',
    'distance_km',
    'note',
    'sets'
  ]);
  const PAYLOAD_SET_KEYS = Object.freeze([
    'set_order',
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  const COMMIT_INTENT_KEYS = Object.freeze([
    'commit_intent_schema_version',
    'request_id',
    'draft_revision',
    'catalog_version',
    'prepared_at',
    'payload'
  ]);
  const PROJECTION_KEYS = Object.freeze([
    'request_id',
    'draft_revision',
    'catalog_version',
    'started_at',
    'note',
    'items'
  ]);
  const STRENGTH_POLICY_SIGNATURES = new Set([
    'required|forbidden|forbidden|forbidden|forbidden',
    'required|forbidden|forbidden|required|forbidden',
    'required|forbidden|forbidden|optional|forbidden',
    'required|forbidden|forbidden|forbidden|required',
    'forbidden|required|forbidden|forbidden|forbidden',
    'forbidden|required|forbidden|optional|forbidden',
    'forbidden|forbidden|required|required|forbidden',
    'forbidden|forbidden|required|optional|forbidden'
  ]);
  const FIELD_DEFINITION_CONTRACT = Object.freeze({
    assistance_kg: Object.freeze({ scope: 'set', type: 'number', unit: 'kg' }),
    distance_km: Object.freeze({ scope: 'item', type: 'number', unit: 'km' }),
    distance_m: Object.freeze({ scope: 'set', type: 'number', unit: 'm' }),
    duration_min: Object.freeze({ scope: 'item', type: 'integer', unit: 'min' }),
    duration_sec: Object.freeze({ scope: 'set', type: 'integer', unit: 's' }),
    reps: Object.freeze({ scope: 'set', type: 'integer', unit: 'count' }),
    weight_kg: Object.freeze({ scope: 'set', type: 'number', unit: 'kg' })
  });

  class ActivityV2SessionCommitError extends Error {
    constructor(code, focusTarget) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionCommitError';
      this.code = code;
      this.focus_target = focusTarget;
    }
  }

  const hasOwn = (value, key) =>
    Object.prototype.hasOwnProperty.call(value, key);
  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
  const textLength = (value) => Array.from(value).length;
  const asciiBtrim = (value) => value.replace(/^ +| +$/g, '');

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

  function assertFrozenTree(value, seen = new WeakSet()) {
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function') ||
      seen.has(value)
    ) {
      return;
    }
    if (!Object.isFrozen(value)) throw new TypeError('unfrozen');
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => assertFrozenTree(value[key], seen));
  }

  function hasExactKeys(value, expected) {
    if (!isRecord(value)) return false;
    const keys = Reflect.ownKeys(value);
    return (
      keys.length === expected.length &&
      keys.every((key) => typeof key === 'string' && expected.includes(key))
    );
  }

  function hasExactOrderedKeys(value, expected) {
    if (!isRecord(value)) return false;
    const keys = Reflect.ownKeys(value);
    return (
      keys.length === expected.length &&
      keys.every((key, index) => key === expected[index])
    );
  }

  function isDenseArray(value) {
    if (!Array.isArray(value)) return false;
    const keys = Reflect.ownKeys(value);
    return (
      keys.length === value.length + 1 &&
      keys[keys.length - 1] === 'length' &&
      value.every((entry, index) => keys[index] === String(index))
    );
  }

  function focus(scope, itemKey = null, setOrder = null, fieldKey = null) {
    return deepFreeze({
      scope,
      item_key: itemKey,
      set_order: setOrder,
      field_key: fieldKey
    });
  }

  const SESSION_FOCUS = focus('session');

  function fail(code, focusTarget = SESSION_FOCUS) {
    throw new ActivityV2SessionCommitError(code, focusTarget);
  }

  function isCanonicalTimestamp(value) {
    if (typeof value !== 'string') return false;
    const match = CANONICAL_TIMESTAMP_RE.exec(value);
    if (!match || Number(match[1]) < 1) return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString() === value;
  }

  function isRawValue(value, limit) {
    return (
      value === null ||
      (typeof value === 'string' &&
        value !== '' &&
        textLength(value) <= limit)
    );
  }

  function isValidCatalogPolicy(trackingMode, fields) {
    if (fields.note !== 'optional') return false;
    const setFieldsForbidden = SET_FIELD_KEYS.every(
      (fieldKey) => fields[fieldKey] === 'forbidden'
    );
    if (trackingMode === 'duration') {
      return (
        fields.duration_min === 'required' &&
        fields.distance_km === 'forbidden' &&
        setFieldsForbidden
      );
    }
    if (trackingMode === 'duration_distance') {
      return (
        fields.duration_min === 'required' &&
        fields.distance_km === 'optional' &&
        setFieldsForbidden
      );
    }
    return (
      fields.duration_min === 'forbidden' &&
      fields.distance_km === 'forbidden' &&
      STRENGTH_POLICY_SIGNATURES.has(
        SET_FIELD_KEYS.map((fieldKey) => fields[fieldKey]).join('|')
      )
    );
  }

  function captureFieldDefinitions(catalog) {
    if (
      !isRecord(catalog.field_definitions) ||
      !hasExactKeys(catalog.field_definitions, CATALOG_FIELD_KEYS)
    ) {
      fail('INVALID_SEMANTICS', focus('session', null, null, 'catalog_version'));
    }
    const definitions = {};
    Object.entries(FIELD_DEFINITION_CONTRACT).forEach(([fieldKey, contract]) => {
      const definition = catalog.field_definitions[fieldKey];
      const integer = contract.type === 'integer';
      const expectedKeys = integer
        ? ['scope', 'value_type', 'unit', 'min', 'max']
        : ['scope', 'value_type', 'unit', 'min', 'max', 'max_decimals'];
      if (
        !hasExactKeys(definition, expectedKeys) ||
        definition.scope !== contract.scope ||
        definition.value_type !== contract.type ||
        definition.unit !== contract.unit ||
        !Number.isFinite(definition.min) ||
        !Number.isFinite(definition.max) ||
        definition.min <= 0 ||
        definition.max < definition.min ||
        (integer &&
          (!Number.isSafeInteger(definition.min) ||
            !Number.isSafeInteger(definition.max))) ||
        (!integer &&
          (!Number.isSafeInteger(definition.max_decimals) ||
            definition.max_decimals < 1))
      ) {
        fail('INVALID_SEMANTICS', focus('session', null, null, 'catalog_version'));
      }
      definitions[fieldKey] = deepFreeze({
        value_type: definition.value_type,
        min: definition.min,
        max: definition.max,
        max_decimals: integer ? null : definition.max_decimals
      });
    });

    const noteDefinition = catalog.field_definitions.note;
    if (
      !hasExactKeys(noteDefinition, [
        'scope',
        'value_type',
        'trim',
        'min_length',
        'max_length'
      ]) ||
      noteDefinition.scope !== 'item' ||
      noteDefinition.value_type !== 'string' ||
      noteDefinition.trim !== true ||
      noteDefinition.min_length !== 1 ||
      noteDefinition.max_length !== ITEM_NOTE_LIMIT
    ) {
      fail('INVALID_SEMANTICS', focus('session', null, null, 'catalog_version'));
    }
    definitions.note = deepFreeze({
      min_length: noteDefinition.min_length,
      max_length: noteDefinition.max_length,
      trim: noteDefinition.trim
    });
    return deepFreeze(definitions);
  }

  function captureSemantics(semantics) {
    if (
      !isRecord(semantics) ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function'
    ) {
      fail('INVALID_SEMANTICS', focus('session', null, null, 'catalog_version'));
    }
    let catalog;
    try {
      catalog = semantics.getCatalog();
    } catch {
      fail('INVALID_SEMANTICS', focus('session', null, null, 'catalog_version'));
    }
    if (
      !isRecord(catalog) ||
      !Number.isSafeInteger(catalog.catalog_version) ||
      catalog.catalog_version < 1 ||
      catalog.catalog_version > 2147483647 ||
      !isDenseArray(catalog.entries)
    ) {
      fail('INVALID_SEMANTICS', focus('session', null, null, 'catalog_version'));
    }
    const definitions = captureFieldDefinitions(catalog);
    const entries = new Map();
    catalog.entries.forEach((entry) => {
      if (
        !isRecord(entry) ||
        typeof entry.key !== 'string' ||
        !ITEM_KEY_RE.test(entry.key) ||
        (entry.status !== 'active' && entry.status !== 'deprecated') ||
        !TRACKING_MODES.includes(entry.tracking_mode) ||
        !hasExactKeys(entry.fields, CATALOG_FIELD_KEYS) ||
        CATALOG_FIELD_KEYS.some(
          (fieldKey) => !FIELD_POLICIES.includes(entry.fields[fieldKey])
        ) ||
        !isValidCatalogPolicy(entry.tracking_mode, entry.fields) ||
        entries.has(entry.key)
      ) {
        fail('INVALID_SEMANTICS', focus('session', null, null, 'catalog_version'));
      }
      entries.set(
        entry.key,
        deepFreeze({
          status: entry.status,
          tracking_mode: entry.tracking_mode,
          fields: Object.fromEntries(
            CATALOG_FIELD_KEYS.map((fieldKey) => [
              fieldKey,
              entry.fields[fieldKey]
            ])
          )
        })
      );
    });
    return {
      catalog_version: catalog.catalog_version,
      definitions,
      entries,
      semantics
    };
  }

  function validateDraftEnvelope(draft) {
    try {
      assertFrozenTree(draft);
    } catch {
      fail('INVALID_DRAFT');
    }
    if (
      !hasExactOrderedKeys(draft, SNAPSHOT_KEYS) ||
      draft.draft_schema_version !== DRAFT_SCHEMA_VERSION
    ) {
      fail('INVALID_DRAFT');
    }
    if (typeof draft.request_id !== 'string' || !UUID_RE.test(draft.request_id)) {
      fail('INVALID_DRAFT', focus('session', null, null, 'request_id'));
    }
    if (
      !Number.isSafeInteger(draft.catalog_version) ||
      draft.catalog_version < 1 ||
      draft.catalog_version > 2147483647
    ) {
      fail('INVALID_DRAFT', focus('session', null, null, 'catalog_version'));
    }
    if (!Number.isSafeInteger(draft.revision) || draft.revision < 0) {
      fail('INVALID_DRAFT', focus('session', null, null, 'revision'));
    }
    if (!isDenseArray(draft.items) || draft.items.length > ITEM_LIMIT) {
      fail('INVALID_DRAFT', focus('session', null, null, 'items'));
    }
    if (draft.items.length === 0) {
      fail('EMPTY_SESSION', focus('session', null, null, 'items'));
    }
  }

  function validateSessionFields(draft) {
    if (
      draft.note !== null &&
      (typeof draft.note !== 'string' ||
        draft.note === '' ||
        textLength(draft.note) > SESSION_NOTE_LIMIT ||
        draft.note.trim() !== draft.note)
    ) {
      fail('INVALID_DRAFT', focus('session', null, null, 'note'));
    }
    if (!isCanonicalTimestamp(draft.started_at)) {
      fail('INVALID_DRAFT', focus('session', null, null, 'started_at'));
    }
  }

  function assertEntryMatchesSemantics(itemKey, captured, semantics) {
    let liveEntry;
    try {
      liveEntry = semantics.getEntryByKey(itemKey);
    } catch {
      fail('INVALID_SEMANTICS', focus('item', itemKey, null, 'item_key'));
    }
    if (
      !isRecord(liveEntry) ||
      liveEntry.key !== itemKey ||
      liveEntry.status !== captured.status ||
      liveEntry.tracking_mode !== captured.tracking_mode ||
      !hasExactKeys(liveEntry.fields, CATALOG_FIELD_KEYS) ||
      CATALOG_FIELD_KEYS.some(
        (fieldKey) => liveEntry.fields[fieldKey] !== captured.fields[fieldKey]
      )
    ) {
      fail('INVALID_SEMANTICS', focus('item', itemKey, null, 'item_key'));
    }
  }

  function inspectNumeric(rawValue, definition) {
    if (rawValue === null) return { valid: true, value: null };
    if (definition.value_type === 'integer') {
      if (!INTEGER_RE.test(rawValue)) return { valid: false, value: null };
      const value = Number(rawValue);
      return {
        valid:
          Number.isSafeInteger(value) &&
          value >= definition.min &&
          value <= definition.max,
        value
      };
    }
    if (!DECIMAL_RE.test(rawValue)) return { valid: false, value: null };
    const separatorIndex = Math.max(rawValue.indexOf(','), rawValue.indexOf('.'));
    if (
      separatorIndex !== -1 &&
      rawValue.length - separatorIndex - 1 > definition.max_decimals
    ) {
      return { valid: false, value: null };
    }
    const value = Number(rawValue.replace(',', '.'));
    return {
      valid:
        Number.isFinite(value) &&
        value >= definition.min &&
        value <= definition.max,
      value
    };
  }

  function normalizeItemNote(rawValue, itemKey) {
    if (!isRawValue(rawValue, ITEM_NOTE_LIMIT)) {
      fail('INVALID_ITEM_VALUE', focus('item', itemKey, null, 'note'));
    }
    if (rawValue === null) return null;
    const normalized = asciiBtrim(rawValue);
    return normalized === '' ? null : normalized;
  }

  function validateDraftSetShape(set, setIndex, itemKey) {
    if (
      !hasExactOrderedKeys(set, DRAFT_SET_KEYS) ||
      set.set_order !== setIndex + 1
    ) {
      fail('INVALID_DRAFT', focus('set', itemKey, setIndex + 1));
    }
    SET_FIELD_KEYS.forEach((fieldKey) => {
      if (!isRawValue(set[fieldKey], RAW_NUMERIC_LIMIT)) {
        fail(
          'INVALID_SET_VALUE',
          focus('set', itemKey, set.set_order, fieldKey)
        );
      }
    });
  }

  function projectStrengthSets(item, entry, definitions) {
    if (item.sets.length < 1 || item.sets.length > SET_LIMIT) {
      fail('INVALID_ITEM_VALUE', focus('item', item.item_key, null, 'sets'));
    }
    const rows = item.sets.map((set, setIndex) => {
      validateDraftSetShape(set, setIndex, item.item_key);
      let firstErrorField = null;
      const values = {};
      SET_FIELD_KEYS.forEach((fieldKey) => {
        const rawValue = set[fieldKey];
        const policy = entry.fields[fieldKey];
        if (policy === 'forbidden') {
          values[fieldKey] = null;
          if (rawValue !== null && firstErrorField === null) {
            firstErrorField = fieldKey;
          }
          return;
        }
        const inspected = inspectNumeric(rawValue, definitions[fieldKey]);
        values[fieldKey] = inspected.value;
        if (
          firstErrorField === null &&
          (!inspected.valid || (policy === 'required' && rawValue === null))
        ) {
          firstErrorField = fieldKey;
        }
      });
      return {
        isEmpty: SET_FIELD_KEYS.every((fieldKey) => set[fieldKey] === null),
        firstErrorField,
        values
      };
    });

    const firstRequiredField = SET_FIELD_KEYS.find(
      (fieldKey) => entry.fields[fieldKey] === 'required'
    );
    for (let index = 0; index < rows.length; index += 1) {
      if (
        rows[index].isEmpty &&
        rows.slice(index + 1).some((row) => !row.isEmpty)
      ) {
        fail(
          'INVALID_SET_VALUE',
          focus('set', item.item_key, index + 1, firstRequiredField)
        );
      }
    }

    const nonEmptyRows = rows.filter((row) => !row.isEmpty);
    if (nonEmptyRows.length === 0) {
      fail(
        'INVALID_SET_VALUE',
        focus('set', item.item_key, 1, firstRequiredField)
      );
    }
    const projected = [];
    rows.forEach((row, index) => {
      if (row.isEmpty) return;
      if (row.firstErrorField !== null) {
        fail(
          'INVALID_SET_VALUE',
          focus('set', item.item_key, index + 1, row.firstErrorField)
        );
      }
      projected.push({
        set_order: projected.length + 1,
        reps: row.values.reps,
        duration_sec: row.values.duration_sec,
        distance_m: row.values.distance_m,
        weight_kg: row.values.weight_kg,
        assistance_kg: row.values.assistance_kg
      });
    });
    return projected;
  }

  function projectNonStrengthItem(item, entry, definitions) {
    if (item.sets.length !== 0) {
      fail('INVALID_ITEM_VALUE', focus('item', item.item_key, null, 'sets'));
    }
    const projected = {};
    ITEM_NUMERIC_FIELD_KEYS.forEach((fieldKey) => {
      const rawValue = item[fieldKey];
      const policy = entry.fields[fieldKey];
      if (policy === 'forbidden') {
        if (rawValue !== null) {
          fail(
            'INVALID_ITEM_VALUE',
            focus('item', item.item_key, null, fieldKey)
          );
        }
        projected[fieldKey] = null;
        return;
      }
      const inspected = inspectNumeric(rawValue, definitions[fieldKey]);
      if (!inspected.valid || (policy === 'required' && rawValue === null)) {
        fail(
          'INVALID_ITEM_VALUE',
          focus('item', item.item_key, null, fieldKey)
        );
      }
      projected[fieldKey] = inspected.value;
    });
    return projected;
  }

  function projectItem(item, itemIndex, catalogState, seenItemKeys) {
    const itemKey =
      isRecord(item) && typeof item.item_key === 'string' && ITEM_KEY_RE.test(item.item_key)
        ? item.item_key
        : null;
    if (
      !hasExactOrderedKeys(item, DRAFT_ITEM_KEYS) ||
      itemKey === null ||
      item.item_order !== itemIndex + 1 ||
      seenItemKeys.has(itemKey) ||
      !isDenseArray(item.sets)
    ) {
      fail('INVALID_DRAFT', focus('item', itemKey, null, 'item_key'));
    }
    ITEM_NUMERIC_FIELD_KEYS.forEach((fieldKey) => {
      if (!isRawValue(item[fieldKey], RAW_NUMERIC_LIMIT)) {
        fail('INVALID_ITEM_VALUE', focus('item', itemKey, null, fieldKey));
      }
    });
    const entry = catalogState.entries.get(itemKey);
    if (!entry) fail('UNKNOWN_ITEM', focus('item', itemKey, null, 'item_key'));
    if (entry.status !== 'active') {
      fail('INACTIVE_ITEM', focus('item', itemKey, null, 'item_key'));
    }
    assertEntryMatchesSemantics(itemKey, entry, catalogState.semantics);
    seenItemKeys.add(itemKey);

    const note = normalizeItemNote(item.note, itemKey);
    if (entry.tracking_mode === 'strength_sets') {
      ITEM_NUMERIC_FIELD_KEYS.forEach((fieldKey) => {
        if (item[fieldKey] !== null) {
          fail('INVALID_ITEM_VALUE', focus('item', itemKey, null, fieldKey));
        }
      });
      return {
        item_key: itemKey,
        item_order: itemIndex + 1,
        duration_min: null,
        distance_km: null,
        note,
        sets: projectStrengthSets(
          item,
          entry,
          catalogState.definitions
        )
      };
    }

    const fields = projectNonStrengthItem(
      item,
      entry,
      catalogState.definitions
    );
    return {
      item_key: itemKey,
      item_order: itemIndex + 1,
      duration_min: fields.duration_min,
      distance_km: fields.distance_km,
      note,
      sets: []
    };
  }

  function projectDraftInternal(draft, semantics) {
    validateDraftEnvelope(draft);
    const catalogState = captureSemantics(semantics);
    if (draft.catalog_version !== catalogState.catalog_version) {
      fail(
        'CATALOG_VERSION_MISMATCH',
        focus('session', null, null, 'catalog_version')
      );
    }
    const seenItemKeys = new Set();
    const items = draft.items.map((item, itemIndex) =>
      projectItem(item, itemIndex, catalogState, seenItemKeys)
    );
    validateSessionFields(draft);
    return deepFreeze({
      request_id: draft.request_id,
      draft_revision: draft.revision,
      catalog_version: draft.catalog_version,
      started_at: draft.started_at,
      note: draft.note,
      items
    });
  }

  function projectDraft(draft, semantics) {
    try {
      const projection = projectDraftInternal(draft, semantics);
      if (!hasExactOrderedKeys(projection, PROJECTION_KEYS)) fail('INVALID_DRAFT');
      return projection;
    } catch (error) {
      if (error instanceof ActivityV2SessionCommitError) throw error;
      fail('INVALID_DRAFT');
    }
  }

  function readClock(now) {
    if (typeof now !== 'function') fail('INVALID_CLOCK');
    let value;
    try {
      value = now();
    } catch {
      fail('INVALID_CLOCK');
    }
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      !Number.isFinite(new Date(value).getTime())
    ) {
      fail('INVALID_CLOCK');
    }
    return value;
  }

  function durationFor(startedAt, endedAt, errorCode = 'INVALID_TIME') {
    const delta = Date.parse(endedAt) - Date.parse(startedAt);
    if (!Number.isFinite(delta) || delta < 0) fail(errorCode, focus('session', null, null, 'ended_at'));
    const duration = Math.max(1, Math.round(delta / 60000));
    if (duration > MAX_SESSION_DURATION_MIN) {
      fail(errorCode, focus('session', null, null, 'duration_min'));
    }
    return duration;
  }

  function structurallyEqual(left, right) {
    if (Object.is(left, right)) return true;
    if (Array.isArray(left) || Array.isArray(right)) {
      return (
        Array.isArray(left) &&
        Array.isArray(right) &&
        isDenseArray(left) &&
        isDenseArray(right) &&
        left.length === right.length &&
        left.every((value, index) => structurallyEqual(value, right[index]))
      );
    }
    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Reflect.ownKeys(left);
    const rightKeys = Reflect.ownKeys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key, index) =>
          key === rightKeys[index] && structurallyEqual(left[key], right[key])
      )
    );
  }

  function payloadFromProjection(projection, endedAt, durationMin) {
    return {
      schema_version: PAYLOAD_SCHEMA_VERSION,
      catalog_version: projection.catalog_version,
      started_at: projection.started_at,
      ended_at: endedAt,
      duration_min: durationMin,
      title: null,
      note: projection.note,
      items: projection.items
    };
  }

  function normalizeIntentAgainstProjection(intent, projection) {
    if (
      !hasExactOrderedKeys(intent, COMMIT_INTENT_KEYS) ||
      intent.commit_intent_schema_version !== COMMIT_INTENT_SCHEMA_VERSION ||
      intent.request_id !== projection.request_id ||
      !UUID_RE.test(intent.request_id) ||
      intent.draft_revision !== projection.draft_revision ||
      intent.catalog_version !== projection.catalog_version ||
      !isCanonicalTimestamp(intent.prepared_at) ||
      !hasExactOrderedKeys(intent.payload, PAYLOAD_KEYS) ||
      intent.payload.schema_version !== PAYLOAD_SCHEMA_VERSION ||
      intent.payload.catalog_version !== projection.catalog_version ||
      intent.payload.started_at !== projection.started_at ||
      intent.payload.ended_at !== intent.prepared_at ||
      intent.payload.title !== null ||
      intent.payload.note !== projection.note ||
      !isDenseArray(intent.payload.items)
    ) {
      fail('INVALID_COMMIT_INTENT');
    }
    const durationMin = durationFor(
      projection.started_at,
      intent.prepared_at,
      'INVALID_COMMIT_INTENT'
    );
    const expectedPayload = payloadFromProjection(
      projection,
      intent.prepared_at,
      durationMin
    );
    if (
      intent.payload.duration_min !== durationMin ||
      !structurallyEqual(intent.payload, expectedPayload) ||
      intent.payload.items.some(
        (item) =>
          !hasExactOrderedKeys(item, PAYLOAD_ITEM_KEYS) ||
          !isDenseArray(item.sets) ||
          item.sets.some((set) => !hasExactOrderedKeys(set, PAYLOAD_SET_KEYS))
      )
    ) {
      fail('INVALID_COMMIT_INTENT');
    }
    return deepFreeze({
      commit_intent_schema_version: COMMIT_INTENT_SCHEMA_VERSION,
      request_id: projection.request_id,
      draft_revision: projection.draft_revision,
      catalog_version: projection.catalog_version,
      prepared_at: intent.prepared_at,
      payload: expectedPayload
    });
  }

  function createCommitIntent(draft, semantics, now) {
    const projection = projectDraft(draft, semantics);
    const clockValue = readClock(now);
    const endedAt = new Date(clockValue).toISOString();
    if (!isCanonicalTimestamp(endedAt)) {
      fail('INVALID_CLOCK', focus('session', null, null, 'ended_at'));
    }
    const durationMin = durationFor(projection.started_at, endedAt);
    return normalizeIntentAgainstProjection(
      {
        commit_intent_schema_version: COMMIT_INTENT_SCHEMA_VERSION,
        request_id: projection.request_id,
        draft_revision: projection.draft_revision,
        catalog_version: projection.catalog_version,
        prepared_at: endedAt,
        payload: payloadFromProjection(projection, endedAt, durationMin)
      },
      projection
    );
  }

  function validateCommitIntent(intent, draft, semantics) {
    const projection = projectDraft(draft, semantics);
    try {
      return normalizeIntentAgainstProjection(intent, projection);
    } catch (error) {
      if (
        error instanceof ActivityV2SessionCommitError &&
        error.code === 'INVALID_COMMIT_INTENT'
      ) {
        throw error;
      }
      fail('INVALID_COMMIT_INTENT');
    }
  }

  const commitCore = deepFreeze({
    projectDraft,
    createCommitIntent,
    validateCommitIntent
  });

  function readExactOptions(optionsValue) {
    if (!hasExactKeys(optionsValue, CREATE_OPTION_KEYS)) fail('INVALID_OPTIONS');
    const descriptors = Object.getOwnPropertyDescriptors(optionsValue);
    if (
      CREATE_OPTION_KEYS.some(
        (key) =>
          !descriptors[key] ||
          !hasOwn(descriptors[key], 'value') ||
          descriptors[key].enumerable !== true
      )
    ) {
      fail('INVALID_OPTIONS');
    }
    return Object.fromEntries(
      CREATE_OPTION_KEYS.map((key) => [key, descriptors[key].value])
    );
  }

  function hasExactFunctionSurface(value, keys) {
    if (!hasExactKeys(value, keys)) return false;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    return keys.every(
      (key) =>
        descriptors[key] &&
        hasOwn(descriptors[key], 'value') &&
        typeof descriptors[key].value === 'function'
    );
  }

  function readOwnData(value, key) {
    if (!isRecord(value)) return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && hasOwn(descriptor, 'value')
      ? descriptor.value
      : undefined;
  }

  function normalizedFocus(error) {
    const value = readOwnData(error, 'focus_target');
    const scope = readOwnData(value, 'scope');
    const itemKey = readOwnData(value, 'item_key');
    const setOrder = readOwnData(value, 'set_order');
    const fieldKey = readOwnData(value, 'field_key');
    if (
      !hasExactOrderedKeys(value, [
        'scope',
        'item_key',
        'set_order',
        'field_key'
      ]) ||
      !['session', 'item', 'set'].includes(scope) ||
      !(itemKey === null || typeof itemKey === 'string') ||
      !(setOrder === null || Number.isSafeInteger(setOrder)) ||
      !(fieldKey === null || typeof fieldKey === 'string')
    ) {
      return null;
    }
    return focus(scope, itemKey, setOrder, fieldKey);
  }

  function commitErrorCode(error) {
    const code = readOwnData(error, 'code');
    return COMMIT_ERROR_CODES.includes(code) ? code : 'INVALID_DRAFT';
  }

  function recoveryErrorCode(error) {
    const code = readOwnData(error, 'code');
    return RECOVERY_ERROR_CODES.includes(code) ? code : 'STORAGE_ERROR';
  }

  function inspectRemoteError(error) {
    const code = readOwnData(error, 'code');
    const operation = readOwnData(error, 'operation');
    const commitState = readOwnData(error, 'commitState');
    if (operation !== 'commitSession') {
      return { code: 'REQUEST_FAILED', kind: 'unknown' };
    }
    if (code === 'IDEMPOTENCY_CONFLICT') {
      return { code, kind: 'idempotency_conflict' };
    }
    if (
      KNOWN_NOT_COMMITTED_CODES.includes(code) &&
      commitState === 'not_committed'
    ) {
      return { code, kind: 'not_committed' };
    }
    return {
      code: KNOWN_NOT_COMMITTED_CODES.includes(code) ? code : 'REQUEST_FAILED',
      kind: 'unknown'
    };
  }

  function readAttemptNumber(value) {
    const schema = readOwnData(value, 'commit_attempt_schema_version');
    const attemptNumber = readOwnData(value, 'attempt_number');
    const attemptToken = readOwnData(value, 'attempt_token');
    if (
      !hasExactOrderedKeys(value, [
        'commit_attempt_schema_version',
        'attempt_number',
        'attempt_token'
      ]) ||
      schema !== 'midas.activity-session-commit-attempt.v1' ||
      !Number.isSafeInteger(attemptNumber) ||
      attemptNumber < 1 ||
      typeof attemptToken !== 'string' ||
      !UUID_RE.test(attemptToken)
    ) {
      return null;
    }
    return attemptNumber;
  }

  function readCommitOutcome(value) {
    const outcome = readOwnData(value, 'outcome');
    return COMMIT_OUTCOMES.includes(outcome) ? outcome : null;
  }

  function requirePromiseCall(call) {
    let value;
    try {
      value = call();
    } catch (error) {
      return Promise.reject(error);
    }
    let then;
    try {
      then = value?.then;
    } catch (error) {
      return Promise.reject(error);
    }
    if (typeof then !== 'function') return Promise.reject(new TypeError('promise'));
    return Promise.resolve(value);
  }

  function create(optionsValue) {
    const options = readExactOptions(optionsValue);
    const { draft, recovery, semantics, commitSession, now } = options;
    if (
      !hasExactFunctionSurface(draft, DRAFT_CONTROLLER_KEYS) ||
      !hasExactFunctionSurface(recovery, RECOVERY_CONTROLLER_KEYS) ||
      !isRecord(semantics) ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function' ||
      typeof commitSession !== 'function' ||
      typeof now !== 'function'
    ) {
      fail('INVALID_OPTIONS');
    }
    try {
      if (recovery.getDraft() !== draft) fail('INVALID_OPTIONS');
    } catch (error) {
      if (error instanceof ActivityV2SessionCommitError) throw error;
      fail('INVALID_OPTIONS');
    }

    let phase = 'editing';
    let reason = null;
    let focusTarget = null;
    let intent = null;
    let stateSnapshot = null;
    let activeOperation = null;
    let controllerEpoch = 0;
    let pendingReleaseReason = null;
    const subscribers = new Set();

    function createState(nextState, nextReason, nextFocus) {
      const value = {
        state: nextState,
        reason: nextReason,
        focus_target: nextFocus,
        intent_present: intent !== null
      };
      if (!hasExactOrderedKeys(value, STATE_KEYS)) fail('INVALID_STATE');
      return deepFreeze(value);
    }

    function notifySubscribers() {
      [...subscribers].forEach((listener) => {
        try {
          listener(stateSnapshot);
        } catch {
          subscribers.delete(listener);
        }
      });
    }

    function publish(nextState, nextReason = null, nextFocus = null) {
      if (phase === 'destroyed' && nextState !== 'destroyed') return stateSnapshot;
      phase = nextState;
      reason = nextReason;
      focusTarget = nextFocus;
      stateSnapshot = createState(phase, reason, focusTarget);
      notifySubscribers();
      return stateSnapshot;
    }

    function getState() {
      if (arguments.length !== 0) fail('INVALID_OPTIONS');
      return stateSnapshot;
    }

    function isCurrent(operation) {
      return (
        activeOperation === operation &&
        operation.epoch === controllerEpoch &&
        phase !== 'destroyed'
      );
    }

    function finishCurrent(operation, nextState, nextReason = null, nextFocus = null) {
      if (!isCurrent(operation)) return stateSnapshot;
      return publish(nextState, nextReason, nextFocus);
    }

    function settleOperation(operation, result) {
      if (operation.settled) return;
      operation.settled = true;
      if (activeOperation === operation) activeOperation = null;
      operation.resolve(result);
    }

    function startOperation(initialState, runner) {
      let resolveOperation;
      const promise = new Promise((resolve) => {
        resolveOperation = resolve;
      });
      const operation = {
        epoch: controllerEpoch,
        promise,
        resolve: resolveOperation,
        settled: false
      };
      activeOperation = operation;
      publish(initialState);
      if (!isCurrent(operation)) {
        settleOperation(operation, stateSnapshot);
        return promise;
      }
      let running;
      try {
        running = runner(operation);
      } catch (error) {
        running = Promise.reject(error);
      }
      Promise.resolve(running).then(
        (result) => settleOperation(operation, result),
        () => {
          const fallback = intent === null ? 'blocked' : 'unknown';
          const result = finishCurrent(operation, fallback, 'STORAGE_ERROR');
          settleOperation(operation, result);
        }
      );
      return promise;
    }

    function recoveryCall(method, argument, hasArgument = true) {
      return requirePromiseCall(() =>
        hasArgument ? recovery[method](argument) : recovery[method]()
      );
    }

    async function completeSuccessfulCommit(operation, confirmedIntent) {
      let completion;
      try {
        completion = await recoveryCall('completeCommit', confirmedIntent);
      } catch (error) {
        return finishCurrent(
          operation,
          'cleanup_pending',
          recoveryErrorCode(error)
        );
      }
      if (!isCurrent(operation)) return stateSnapshot;
      if (readOwnData(completion, 'state') !== 'destroyed') {
        return finishCurrent(operation, 'cleanup_pending', 'STORAGE_ERROR');
      }
      intent = null;
      return finishCurrent(operation, 'committed');
    }

    async function releaseKnownFailure(
      operation,
      confirmedIntent,
      remoteCode,
      attemptNumber
    ) {
      if (attemptNumber !== 1) {
        return finishCurrent(operation, 'unknown', remoteCode);
      }
      pendingReleaseReason = remoteCode;
      let releaseResult;
      try {
        releaseResult = await recoveryCall('releaseCommit', confirmedIntent);
      } catch (error) {
        const code = recoveryErrorCode(error);
        if (code !== 'STORAGE_ERROR') pendingReleaseReason = null;
        return finishCurrent(
          operation,
          code === 'STORAGE_ERROR' ? 'release_pending' : 'unknown',
          code
        );
      }
      if (!isCurrent(operation)) return stateSnapshot;
      if (releaseResult !== null) {
        return finishCurrent(operation, 'release_pending', 'STORAGE_ERROR');
      }
      intent = null;
      pendingReleaseReason = null;
      return finishCurrent(operation, 'not_committed', remoteCode);
    }

    async function handleRemoteFailure(
      operation,
      confirmedIntent,
      claim,
      error
    ) {
      const classified = inspectRemoteError(error);
      if (classified.kind === 'idempotency_conflict') {
        return finishCurrent(operation, 'blocked', classified.code);
      }
      if (classified.kind === 'not_committed') {
        return await releaseKnownFailure(
          operation,
          confirmedIntent,
          classified.code,
          claim.attempt_number
        );
      }
      return finishCurrent(operation, 'unknown', classified.code);
    }

    async function dispatchIntent(operation) {
      if (!isCurrent(operation) || intent === null) return stateSnapshot;
      const confirmedIntent = intent;
      try {
        commitCore.validateCommitIntent(
          confirmedIntent,
          draft.getSnapshot(),
          semantics
        );
      } catch (error) {
        return finishCurrent(
          operation,
          'blocked',
          commitErrorCode(error),
          normalizedFocus(error)
        );
      }

      let claim;
      try {
        claim = await recoveryCall('beginCommitAttempt', confirmedIntent);
      } catch (error) {
        return finishCurrent(operation, 'unknown', recoveryErrorCode(error));
      }
      if (!isCurrent(operation)) return stateSnapshot;
      const attemptNumber = readAttemptNumber(claim);
      if (attemptNumber === null) {
        return finishCurrent(operation, 'unknown', 'INVALID_COMMIT_ATTEMPT');
      }
      publish('committing');
      if (!isCurrent(operation)) return stateSnapshot;

      let result;
      try {
        result = await requirePromiseCall(() =>
          commitSession({
            requestId: confirmedIntent.request_id,
            payload: confirmedIntent.payload
          })
        );
      } catch (error) {
        if (!isCurrent(operation)) return stateSnapshot;
        return await handleRemoteFailure(
          operation,
          confirmedIntent,
          { attempt_number: attemptNumber },
          error
        );
      }
      if (!isCurrent(operation)) return stateSnapshot;
      if (readCommitOutcome(result) === null) {
        return finishCurrent(operation, 'unknown', 'REQUEST_FAILED');
      }
      return await completeSuccessfulCommit(operation, confirmedIntent);
    }

    async function finishFlow(operation) {
      let flushState;
      try {
        flushState = await recoveryCall('flush', undefined, false);
      } catch (error) {
        return finishCurrent(operation, 'blocked', recoveryErrorCode(error));
      }
      if (!isCurrent(operation)) return stateSnapshot;
      const flushPhase = readOwnData(flushState, 'state');
      if (flushPhase !== 'saved') {
        const flushReason =
          flushPhase === 'conflict' ? 'CONFLICT' : 'STORAGE_ERROR';
        return finishCurrent(operation, 'blocked', flushReason);
      }

      let candidate;
      let snapshot;
      try {
        snapshot = draft.getSnapshot();
        candidate = commitCore.createCommitIntent(snapshot, semantics, now);
      } catch (error) {
        if (!isCurrent(operation)) return stateSnapshot;
        return finishCurrent(
          operation,
          'editing',
          commitErrorCode(error),
          normalizedFocus(error)
        );
      }

      let preparation;
      try {
        // No await may be inserted between the final snapshot/clock and this call.
        preparation = recovery.prepareCommit(candidate);
        let then;
        try {
          then = preparation?.then;
        } catch (error) {
          throw error;
        }
        if (typeof then !== 'function') throw new TypeError('promise');
      } catch (error) {
        if (!isCurrent(operation)) return stateSnapshot;
        return finishCurrent(operation, 'blocked', recoveryErrorCode(error));
      }

      let preparedIntent;
      try {
        preparedIntent = await preparation;
      } catch (error) {
        return finishCurrent(operation, 'blocked', recoveryErrorCode(error));
      }
      if (!isCurrent(operation)) return stateSnapshot;
      try {
        const confirmedIntent = commitCore.validateCommitIntent(
          preparedIntent,
          snapshot,
          semantics
        );
        if (!structurallyEqual(confirmedIntent, candidate)) {
          throw new TypeError('intent mismatch');
        }
        intent = confirmedIntent;
      } catch (error) {
        intent = candidate;
        return finishCurrent(operation, 'blocked', 'INVALID_COMMIT_INTENT');
      }
      if (!isCurrent(operation)) return stateSnapshot;
      publish('preparing');
      return await dispatchIntent(operation);
    }

    async function releasePendingFlow(operation) {
      const confirmedIntent = intent;
      let releaseResult;
      try {
        releaseResult = await recoveryCall('releaseCommit', confirmedIntent);
      } catch (error) {
        const code = recoveryErrorCode(error);
        if (code !== 'STORAGE_ERROR') pendingReleaseReason = null;
        return finishCurrent(
          operation,
          code === 'STORAGE_ERROR' ? 'release_pending' : 'unknown',
          code
        );
      }
      if (!isCurrent(operation)) return stateSnapshot;
      if (releaseResult !== null) {
        return finishCurrent(operation, 'release_pending', 'STORAGE_ERROR');
      }
      const remoteCode = pendingReleaseReason;
      pendingReleaseReason = null;
      intent = null;
      return finishCurrent(operation, 'not_committed', remoteCode);
    }

    function finish() {
      if (arguments.length !== 0) fail('INVALID_OPTIONS');
      if (phase === 'destroyed') fail('CONTROLLER_DESTROYED');
      if (activeOperation) return activeOperation.promise;
      if (!['editing', 'not_committed'].includes(phase)) fail('INVALID_STATE');
      return startOperation('preparing', finishFlow);
    }

    function retry() {
      if (arguments.length !== 0) fail('INVALID_OPTIONS');
      if (phase === 'destroyed') fail('CONTROLLER_DESTROYED');
      if (activeOperation) return activeOperation.promise;
      if (phase === 'release_pending') {
        return startOperation('release_pending', releasePendingFlow);
      }
      if (phase === 'blocked' && intent === null && reason === 'STORAGE_ERROR') {
        return startOperation('preparing', finishFlow);
      }
      if (!['unknown', 'cleanup_pending'].includes(phase)) fail('INVALID_STATE');
      return startOperation('committing', dispatchIntent);
    }

    function subscribe(listener) {
      if (arguments.length !== 1 || typeof listener !== 'function') {
        fail('INVALID_LISTENER');
      }
      if (phase === 'destroyed') fail('CONTROLLER_DESTROYED');
      let active = true;
      try {
        listener(stateSnapshot);
        if (phase === 'destroyed') {
          active = false;
        } else {
          subscribers.add(listener);
        }
      } catch {
        active = false;
      }
      return function unsubscribe() {
        if (!active) return;
        active = false;
        subscribers.delete(listener);
      };
    }

    function destroy() {
      if (arguments.length !== 0) fail('INVALID_OPTIONS');
      if (phase === 'destroyed') return stateSnapshot;
      controllerEpoch += 1;
      const operation = activeOperation;
      activeOperation = null;
      const result = publish('destroyed');
      subscribers.clear();
      if (operation && !operation.settled) {
        operation.settled = true;
        operation.resolve(result);
      }
      return result;
    }

    let persistedIntent;
    try {
      persistedIntent = recovery.getCommitIntent();
    } catch {
      fail('INVALID_OPTIONS');
    }
    if (persistedIntent !== null) {
      intent = persistedIntent;
      try {
        intent = commitCore.validateCommitIntent(
          persistedIntent,
          draft.getSnapshot(),
          semantics
        );
        stateSnapshot = createState('unknown', 'RECOVERY_RESUME', null);
        phase = 'unknown';
        reason = 'RECOVERY_RESUME';
      } catch (error) {
        stateSnapshot = createState(
          'blocked',
          commitErrorCode(error),
          normalizedFocus(error)
        );
        phase = 'blocked';
        reason = commitErrorCode(error);
        focusTarget = normalizedFocus(error);
      }
    } else {
      stateSnapshot = createState('editing', null, null);
    }

    const controller = deepFreeze({
      getState,
      finish,
      retry,
      subscribe,
      destroy
    });
    if (!hasExactOrderedKeys(controller, CONTROLLER_KEYS)) fail('INVALID_STATE');
    return controller;
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
  if ('sessionCommit' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionCommit is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const sessionCommitApi = deepFreeze({ create });
  Object.defineProperty(root.AppModules.activityV2, 'sessionCommit', {
    value: sessionCommitApi,
    enumerable: true,
    writable: false,
    configurable: false
  });

  void commitCore;
})(globalThis);
