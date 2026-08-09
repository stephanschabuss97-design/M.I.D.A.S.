'use strict';

(function initActivityV2SessionShell(root) {
  const DRAFT_SCHEMA_VERSION = 'midas.activity-session-draft.v3';
  const NOTE_LIMIT = 500;
  const ITEM_LIMIT = 50;
  const SET_LIMIT = 50;
  const SET_VALUE_LIMIT = 32;
  const ITEM_VALUE_LIMIT = 32;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const MOUNT_OPTION_KEYS = Object.freeze([
    'clearIntervalFn',
    'confirmDiscard',
    'draft',
    'host',
    'loadLastPerformance',
    'recovery',
    'semantics',
    'setIntervalFn'
  ]);
  const OPEN_OPTION_KEYS = Object.freeze(['opener']);
  const DRAFT_METHODS = Object.freeze([
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
  const RECOVERY_METHODS = Object.freeze([
    'getState',
    'getDraft',
    'startNew',
    'continueSession',
    'flush',
    'discard',
    'subscribe',
    'destroy'
  ]);
  const RECOVERY_STATE_KEYS = Object.freeze([
    'state',
    'started_at',
    'saved_at',
    'item_count',
    'reason'
  ]);
  const RECOVERY_STATES = Object.freeze([
    'empty',
    'recoverable',
    'active',
    'saving',
    'saved',
    'degraded',
    'conflict',
    'blocked',
    'discarding',
    'destroyed'
  ]);
  const RECOVERY_REASONS = Object.freeze([
    'storage_error',
    'conflict',
    'unknown_recovery_schema',
    'invalid_record',
    'catalog_unavailable'
  ]);
  const SNAPSHOT_KEYS = Object.freeze([
    'catalog_version',
    'draft_schema_version',
    'items',
    'note',
    'request_id',
    'revision',
    'started_at'
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
  const SET_FIELD_KEYS = Object.freeze([
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ]);
  const ITEM_FIELD_KEYS = Object.freeze([
    'duration_min',
    'distance_km',
    'note'
  ]);
  const ITEM_NUMERIC_FIELD_KEYS = Object.freeze([
    'duration_min',
    'distance_km'
  ]);
  const FIELD_POLICIES = Object.freeze(['forbidden', 'optional', 'required']);
  const TRACKING_MODES = Object.freeze([
    'duration',
    'duration_distance',
    'strength_sets'
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
  const SET_FIELD_UI = Object.freeze({
    reps: Object.freeze({ label: 'Wiederholungen', inputMode: 'numeric' }),
    duration_sec: Object.freeze({ label: 'Dauer (Sek.)', inputMode: 'numeric' }),
    distance_m: Object.freeze({ label: 'Distanz (m)', inputMode: 'decimal' }),
    weight_kg: Object.freeze({ label: 'Gewicht (kg)', inputMode: 'decimal' }),
    assistance_kg: Object.freeze({
      label: 'Unterstützung (kg)',
      inputMode: 'decimal'
    })
  });
  const SET_FIELD_UNITS = Object.freeze({
    reps: 'count',
    duration_sec: 's',
    distance_m: 'm',
    weight_kg: 'kg',
    assistance_kg: 'kg'
  });
  const ITEM_FIELD_UI = Object.freeze({
    duration_min: Object.freeze({
      label: 'Dauer (Min.)',
      inputMode: 'numeric'
    }),
    distance_km: Object.freeze({
      label: 'Distanz (km)',
      inputMode: 'decimal'
    }),
    note: Object.freeze({ label: 'Notiz' })
  });
  const ITEM_FIELD_UNITS = Object.freeze({
    duration_min: 'min',
    distance_km: 'km'
  });
  const INTEGER_INPUT_MESSAGE = 'Nur ganze Zahlen eingeben.';
  const DECIMAL_INPUT_MESSAGE =
    'Ziffern mit optionalem Komma oder Punkt eingeben.';
  const PARTIAL_SET_MESSAGE = 'Satz unvollständig.';
  const PARTIAL_ITEM_MESSAGE = 'Aktivität unvollständig.';
  const GAP_MESSAGE = 'Leere Sätze sind nur am Ende erlaubt.';
  const TIMER_KEYS = Object.freeze(['elapsed_ms', 'label', 'running']);
  const CLOSE_SOURCES = Object.freeze(['api', 'close_button', 'escape']);
  const DISCARD_MESSAGE =
    'Session verwerfen? Deine bisherigen Änderungen gehen verloren.';
  const SEARCH_LIMIT = 8;
  const SEARCH_START_MESSAGE =
    'Suche nach einer Übung oder Aktivität im lokalen Katalog.';
  const SEARCH_EMPTY_MESSAGE =
    'Keine passende Übung oder Aktivität gefunden.';
  const SEARCH_ERROR_MESSAGE = 'Suche ist derzeit nicht verfügbar.';
  const LOOKUP_LOADING_MESSAGE = 'Letzte Ausführung wird geladen ...';
  const LOOKUP_EMPTY_MESSAGE = 'Noch kein vorheriger Eintrag.';
  const LOOKUP_ERROR_MESSAGE =
    'Letzte Ausführung ist derzeit nicht verfügbar. Du kannst die Übung trotzdem erfassen.';
  const LOOKUP_SCHEMA = 'midas.activity-last-performance.v1';
  const LOOKUP_UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const LOOKUP_TIMESTAMP_RE =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d{6}Z$/;
  const LOOKUP_DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  const EQUIPMENT_LABELS = Object.freeze({
    barbell: 'Langhantel',
    bodyweight: 'Körpergewicht',
    cable: 'Kabelzug',
    cardio_machine: 'Cardiogerät',
    dumbbell: 'Kurzhantel',
    kettlebell: 'Kettlebell',
    machine: 'Maschine',
    none: 'Ohne Gerät',
    variable: 'Variable Ausstattung'
  });
  const LOOKUP_FIELD_KEYS = Object.freeze([
    'assistance_kg',
    'distance_km',
    'distance_m',
    'duration_min',
    'duration_sec',
    'note',
    'reps',
    'weight_kg'
  ]);
  const SAFE_MESSAGE = 'The activity session shell operation could not be completed.';
  const mountedHosts = new WeakMap();
  const activeDocuments = new WeakMap();
  let shellSequence = 0;

  class ActivityV2SessionShellError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionShellError';
      this.code = code;
    }
  }

  const hasOwn = (value, key) =>
    Object.prototype.hasOwnProperty.call(value, key);

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function fail(code) {
    throw new ActivityV2SessionShellError(code);
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

  function assertMountOptions(value) {
    if (!isRecord(value)) fail('INVALID_OPTIONS');
    if (Reflect.ownKeys(value).some((key) => !MOUNT_OPTION_KEYS.includes(key))) {
      fail('INVALID_OPTIONS');
    }
    if (!hasOwn(value, 'host') || !hasOwn(value, 'draft')) {
      fail('INVALID_OPTIONS');
    }
    return value;
  }

  function assertOpenOptions(value) {
    if (value === undefined) return {};
    if (!isRecord(value)) fail('INVALID_OPTIONS');
    if (Reflect.ownKeys(value).some((key) => !OPEN_OPTION_KEYS.includes(key))) {
      fail('INVALID_OPTIONS');
    }
    if (
      hasOwn(value, 'opener') &&
      value.opener !== null &&
      (typeof value.opener !== 'object' || typeof value.opener.focus !== 'function')
    ) {
      fail('INVALID_OPTIONS');
    }
    return value;
  }

  function assertHost(host) {
    const document = host?.ownerDocument;
    if (
      !host ||
      host.nodeType !== 1 ||
      typeof host.appendChild !== 'function' ||
      !document ||
      typeof document.createElement !== 'function' ||
      typeof document.createDocumentFragment !== 'function' ||
      typeof document.addEventListener !== 'function' ||
      typeof document.removeEventListener !== 'function'
    ) {
      fail('INVALID_HOST');
    }
    return document;
  }

  function assertDraft(draft) {
    if (
      !isRecord(draft) ||
      DRAFT_METHODS.some((method) => typeof draft[method] !== 'function')
    ) {
      fail('INVALID_DRAFT_API');
    }
    return draft;
  }

  function assertRecoveryState(state) {
    if (
      !hasExactKeys(state, RECOVERY_STATE_KEYS) ||
      !RECOVERY_STATES.includes(state.state) ||
      (state.started_at !== null && !isCanonicalTimestamp(state.started_at)) ||
      (state.saved_at !== null && !isCanonicalTimestamp(state.saved_at)) ||
      !Number.isSafeInteger(state.item_count) ||
      state.item_count < 0 ||
      (state.reason !== null && !RECOVERY_REASONS.includes(state.reason))
    ) {
      fail('INVALID_RECOVERY_STATE');
    }
    try {
      assertFrozenTree(state);
    } catch {
      fail('INVALID_RECOVERY_STATE');
    }
    return state;
  }

  function resolveRecovery(options, draft) {
    if (!hasOwn(options, 'recovery') || options.recovery === undefined) {
      return null;
    }
    const recovery = options.recovery;
    if (
      !hasExactKeys(recovery, RECOVERY_METHODS) ||
      RECOVERY_METHODS.some((method) => typeof recovery[method] !== 'function')
    ) {
      fail('INVALID_RECOVERY_API');
    }
    let managedDraft;
    let state;
    try {
      managedDraft = recovery.getDraft();
      state = recovery.getState();
    } catch {
      fail('INVALID_RECOVERY_API');
    }
    if (managedDraft !== draft) fail('RECOVERY_DRAFT_MISMATCH');
    assertRecoveryState(state);
    return Object.freeze({ controller: recovery, state });
  }

  function resolveSemantics(options) {
    const fallback = root.AppModules?.activityV2?.semantics;
    const semantics =
      !hasOwn(options, 'semantics') || options.semantics === undefined
        ? fallback
        : options.semantics;
    if (
      !isRecord(semantics) ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function' ||
      typeof semantics.normalizeSearchText !== 'function' ||
      typeof semantics.search !== 'function'
    ) {
      fail('SEMANTICS_MISSING');
    }
    return semantics;
  }

  function resolveLookup(options) {
    if (
      !hasOwn(options, 'loadLastPerformance') ||
      options.loadLastPerformance === undefined
    ) {
      return null;
    }
    if (typeof options.loadLastPerformance !== 'function') {
      fail('INVALID_OPTIONS');
    }
    return options.loadLastPerformance;
  }

  function resolveConfirmation(options) {
    const usesDefault =
      !hasOwn(options, 'confirmDiscard') || options.confirmDiscard === undefined;
    const confirmation = usesDefault ? root.confirm : options.confirmDiscard;
    if (typeof confirmation !== 'function') fail('INVALID_CONFIRMATION');
    return usesDefault
      ? (context) => confirmation.call(root, context.message)
      : confirmation;
  }

  function resolveScheduler(options) {
    const hasSet = hasOwn(options, 'setIntervalFn') && options.setIntervalFn !== undefined;
    const hasClear =
      hasOwn(options, 'clearIntervalFn') && options.clearIntervalFn !== undefined;
    if (hasSet !== hasClear) fail('INVALID_SCHEDULER');
    const rawSetInterval = hasSet ? options.setIntervalFn : root.setInterval;
    const rawClearInterval = hasClear ? options.clearIntervalFn : root.clearInterval;
    if (
      typeof rawSetInterval !== 'function' ||
      typeof rawClearInterval !== 'function'
    ) {
      fail('INVALID_SCHEDULER');
    }
    const setIntervalFn = hasSet
      ? rawSetInterval
      : (callback, delay) => rawSetInterval.call(root, callback, delay);
    const clearIntervalFn = hasClear
      ? rawClearInterval
      : (id) => rawClearInterval.call(root, id);
    return Object.freeze({ setIntervalFn, clearIntervalFn });
  }

  function captureCatalog(semantics) {
    let catalog;
    try {
      catalog = semantics.getCatalog();
    } catch {
      fail('INVALID_DRAFT_STATE');
    }
    if (
      !isRecord(catalog) ||
      !Number.isSafeInteger(catalog.catalog_version) ||
      catalog.catalog_version < 1 ||
      !Array.isArray(catalog.entries) ||
      !isRecord(catalog.field_definitions)
    ) {
      fail('INVALID_DRAFT_STATE');
    }

    const fieldDefinitions = {};
    SET_FIELD_KEYS.forEach((fieldKey) => {
      const definition = catalog.field_definitions[fieldKey];
      const integer = fieldKey === 'reps' || fieldKey === 'duration_sec';
      if (
        !isRecord(definition) ||
        !hasExactKeys(
          definition,
          integer
            ? ['scope', 'value_type', 'unit', 'min', 'max']
            : ['scope', 'value_type', 'unit', 'min', 'max', 'max_decimals']
        ) ||
        definition.scope !== 'set' ||
        definition.value_type !== (integer ? 'integer' : 'number') ||
        definition.unit !== SET_FIELD_UNITS[fieldKey] ||
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
        fail('INVALID_DRAFT_STATE');
      }
      fieldDefinitions[fieldKey] = Object.freeze({
        valueType: definition.value_type,
        min: definition.min,
        max: definition.max,
        maxDecimals: integer ? null : definition.max_decimals
      });
    });
    ITEM_NUMERIC_FIELD_KEYS.forEach((fieldKey) => {
      const definition = catalog.field_definitions[fieldKey];
      const integer = fieldKey === 'duration_min';
      if (
        !isRecord(definition) ||
        !hasExactKeys(
          definition,
          integer
            ? ['scope', 'value_type', 'unit', 'min', 'max']
            : ['scope', 'value_type', 'unit', 'min', 'max', 'max_decimals']
        ) ||
        definition.scope !== 'item' ||
        definition.value_type !== (integer ? 'integer' : 'number') ||
        definition.unit !== ITEM_FIELD_UNITS[fieldKey] ||
        !Number.isFinite(definition.min) ||
        !Number.isFinite(definition.max) ||
        definition.min !== (integer ? 1 : 0.01) ||
        definition.max !== (integer ? 1440 : 1000) ||
        definition.min <= 0 ||
        definition.max < definition.min ||
        (integer &&
          (!Number.isSafeInteger(definition.min) ||
            !Number.isSafeInteger(definition.max))) ||
        (!integer &&
          (!Number.isSafeInteger(definition.max_decimals) ||
            definition.max_decimals !== 2))
      ) {
        fail('INVALID_DRAFT_STATE');
      }
      fieldDefinitions[fieldKey] = Object.freeze({
        valueType: definition.value_type,
        min: definition.min,
        max: definition.max,
        maxDecimals: integer ? null : definition.max_decimals
      });
    });
    const noteDefinition = catalog.field_definitions.note;
    if (
      !isRecord(noteDefinition) ||
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
      noteDefinition.max_length !== NOTE_LIMIT
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    fieldDefinitions.note = Object.freeze({
      minLength: noteDefinition.min_length,
      maxLength: noteDefinition.max_length,
      trim: noteDefinition.trim
    });

    const entries = [];
    const byKey = new Map();
    for (const entry of catalog.entries) {
      if (
        !isRecord(entry) ||
        typeof entry.key !== 'string' ||
        !ITEM_KEY_RE.test(entry.key) ||
        typeof entry.label !== 'string' ||
        entry.label.trim() === '' ||
        (entry.status !== 'active' && entry.status !== 'deprecated') ||
        !TRACKING_MODES.includes(entry.tracking_mode) ||
        !hasExactKeys(entry.fields, LOOKUP_FIELD_KEYS) ||
        LOOKUP_FIELD_KEYS.some(
          (key) => !FIELD_POLICIES.includes(entry.fields[key])
        ) ||
        !isValidCatalogPolicy(entry.tracking_mode, entry.fields) ||
        byKey.has(entry.key)
      ) {
        fail('INVALID_DRAFT_STATE');
      }
      byKey.set(entry.key, entry);
      if (entry.status === 'active') entries.push(entry);
    }
    return {
      catalogVersion: catalog.catalog_version,
      entries,
      byKey,
      fieldDefinitions: Object.freeze(fieldDefinitions)
    };
  }

  function isValidCatalogPolicy(trackingMode, fields) {
    if (fields.note !== 'optional') return false;
    const setFieldsForbidden = SET_FIELD_KEYS.every(
      (key) => fields[key] === 'forbidden'
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
        SET_FIELD_KEYS.map((key) => fields[key]).join('|')
      )
    );
  }

  function assertFrozenTree(value, seen = new WeakSet()) {
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function') ||
      seen.has(value)
    ) {
      return;
    }
    if (!Object.isFrozen(value)) fail('INVALID_DRAFT_STATE');
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => assertFrozenTree(value[key], seen));
  }

  function isCanonicalTimestamp(value) {
    if (typeof value !== 'string') return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString() === value;
  }

  function formatElapsed(elapsedMs) {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    const twoDigits = (value) => String(value).padStart(2, '0');
    return hours > 0
      ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`
      : `${twoDigits(totalMinutes)}:${twoDigits(seconds)}`;
  }

  function validateSnapshot(snapshot, catalogState) {
    if (!hasExactKeys(snapshot, SNAPSHOT_KEYS)) fail('INVALID_DRAFT_STATE');
    assertFrozenTree(snapshot);
    if (
      snapshot.draft_schema_version !== DRAFT_SCHEMA_VERSION ||
      typeof snapshot.request_id !== 'string' ||
      !UUID_RE.test(snapshot.request_id) ||
      !Number.isSafeInteger(snapshot.catalog_version) ||
      snapshot.catalog_version < 1 ||
      !Number.isSafeInteger(snapshot.revision) ||
      snapshot.revision < 0 ||
      (snapshot.started_at !== null && !isCanonicalTimestamp(snapshot.started_at)) ||
      (snapshot.note !== null &&
        (typeof snapshot.note !== 'string' ||
          snapshot.note.trim() !== snapshot.note ||
          Array.from(snapshot.note).length > NOTE_LIMIT)) ||
      !Array.isArray(snapshot.items) ||
      snapshot.items.length > ITEM_LIMIT
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    if (snapshot.catalog_version !== catalogState.catalogVersion) {
      fail('CATALOG_VERSION_MISMATCH');
    }
    if (
      snapshot.revision === 0 &&
      (snapshot.started_at !== null || snapshot.note !== null || snapshot.items.length > 0)
    ) {
      fail('INVALID_DRAFT_STATE');
    }

    const seenKeys = new Set();
    snapshot.items.forEach((item, index) => {
      if (
        !hasExactOrderedKeys(item, DRAFT_ITEM_KEYS) ||
        !Object.isFrozen(item) ||
        typeof item.item_key !== 'string' ||
        !ITEM_KEY_RE.test(item.item_key) ||
        item.item_order !== index + 1 ||
        seenKeys.has(item.item_key) ||
        !Array.isArray(item.sets) ||
        !Object.isFrozen(item.sets)
      ) {
        fail('INVALID_DRAFT_STATE');
      }
      const catalogEntry = catalogState.byKey.get(item.item_key);
      if (!catalogEntry || catalogEntry.status !== 'active') {
        fail('INVALID_DRAFT_STATE');
      }
      ITEM_FIELD_KEYS.forEach((fieldKey) => {
        const value = item[fieldKey];
        const valueLimit = fieldKey === 'note' ? NOTE_LIMIT : ITEM_VALUE_LIMIT;
        if (
          (value !== null &&
            (typeof value !== 'string' ||
              value === '' ||
              Array.from(value).length > valueLimit)) ||
          (catalogEntry.fields[fieldKey] === 'forbidden' && value !== null)
        ) {
          fail('INVALID_DRAFT_STATE');
        }
      });
      if (catalogEntry.tracking_mode === 'strength_sets') {
        if (item.sets.length < 1 || item.sets.length > SET_LIMIT) {
          fail('INVALID_DRAFT_STATE');
        }
      } else if (item.sets.length !== 0) {
        fail('INVALID_DRAFT_STATE');
      }
      item.sets.forEach((set, setIndex) => {
        if (
          !hasExactKeys(set, DRAFT_SET_KEYS) ||
          !Object.isFrozen(set) ||
          set.set_order !== setIndex + 1
        ) {
          fail('INVALID_DRAFT_STATE');
        }
        SET_FIELD_KEYS.forEach((fieldKey) => {
          const value = set[fieldKey];
          if (
            (value !== null &&
              (typeof value !== 'string' ||
                value === '' ||
                Array.from(value).length > SET_VALUE_LIMIT)) ||
            (catalogEntry.fields[fieldKey] === 'forbidden' && value !== null)
          ) {
            fail('INVALID_DRAFT_STATE');
          }
        });
      });
      seenKeys.add(item.item_key);
    });
    return snapshot;
  }

  function validateTimer(timer, snapshot) {
    if (!hasExactKeys(timer, TIMER_KEYS)) fail('INVALID_DRAFT_STATE');
    assertFrozenTree(timer);
    if (
      typeof timer.running !== 'boolean' ||
      !Number.isFinite(timer.elapsed_ms) ||
      !Number.isSafeInteger(timer.elapsed_ms) ||
      timer.elapsed_ms < 0 ||
      typeof timer.label !== 'string' ||
      timer.label !== formatElapsed(timer.elapsed_ms) ||
      timer.running !== (snapshot.started_at !== null)
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    if (!timer.running && (timer.elapsed_ms !== 0 || timer.label !== '00:00')) {
      fail('INVALID_DRAFT_STATE');
    }
    return timer;
  }

  function readState(draft, semantics) {
    const catalogState = captureCatalog(semantics);
    let snapshot;
    let timer;
    try {
      snapshot = draft.getSnapshot();
      timer = draft.getTimerSnapshot();
    } catch {
      fail('INVALID_DRAFT_STATE');
    }
    validateSnapshot(snapshot, catalogState);
    validateTimer(timer, snapshot);
    return { catalogState, snapshot, timer };
  }

  function makeElement(document, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setButton(button, action, label, accessibleName) {
    button.type = 'button';
    button.dataset.action = action;
    button.textContent = label;
    button.setAttribute('aria-label', accessibleName);
    return button;
  }

  function formatGermanNumber(value) {
    return String(value).replace('.', ',');
  }

  function parseNumericField(rawValue, definition) {
    if (rawValue === '') return Object.freeze({ state: 'empty', error: '' });
    if (definition.valueType === 'integer') {
      if (!/^[0-9]+$/.test(rawValue)) {
        return Object.freeze({ state: 'invalid', error: INTEGER_INPUT_MESSAGE });
      }
      const value = Number(rawValue);
      if (
        !Number.isSafeInteger(value) ||
        value < definition.min ||
        value > definition.max
      ) {
        return Object.freeze({
          state: 'invalid',
          error: `Erlaubter Bereich: ${formatGermanNumber(definition.min)} bis ${formatGermanNumber(definition.max)}.`
        });
      }
      return Object.freeze({ state: 'valid', error: '' });
    }

    if (/^[0-9]+[,.]$/.test(rawValue)) {
      return Object.freeze({ state: 'intermediate', error: '' });
    }
    if (!/^[0-9]+(?:[,.][0-9]+)?$/.test(rawValue)) {
      return Object.freeze({ state: 'invalid', error: DECIMAL_INPUT_MESSAGE });
    }
    const separatorIndex = Math.max(rawValue.indexOf(','), rawValue.indexOf('.'));
    if (
      separatorIndex !== -1 &&
      rawValue.length - separatorIndex - 1 > definition.maxDecimals
    ) {
      return Object.freeze({
        state: 'invalid',
        error: `Maximal ${definition.maxDecimals} Nachkommastellen.`
      });
    }
    const value = Number(rawValue.replace(',', '.'));
    if (
      !Number.isFinite(value) ||
      value < definition.min ||
      value > definition.max
    ) {
      return Object.freeze({
        state: 'invalid',
        error: `Erlaubter Bereich: ${formatGermanNumber(definition.min)} bis ${formatGermanNumber(definition.max)}.`
      });
    }
    return Object.freeze({ state: 'valid', error: '' });
  }

  function deriveStrengthState(item, entry, fieldDefinitions) {
    const fieldKeys = SET_FIELD_KEYS.filter(
      (fieldKey) => entry.fields[fieldKey] !== 'forbidden'
    );
    const rows = item.sets.map((set) => {
      const fields = {};
      let hasInvalid = false;
      let hasNonEmpty = false;
      let complete = true;
      fieldKeys.forEach((fieldKey) => {
        const rawValue = set[fieldKey] || '';
        const parsed = parseNumericField(rawValue, fieldDefinitions[fieldKey]);
        fields[fieldKey] = parsed;
        if (parsed.state !== 'empty') hasNonEmpty = true;
        if (parsed.state === 'invalid') hasInvalid = true;
        const policy = entry.fields[fieldKey];
        if (
          (policy === 'required' && parsed.state !== 'valid') ||
          (policy === 'optional' &&
            parsed.state !== 'empty' &&
            parsed.state !== 'valid')
        ) {
          complete = false;
        }
      });
      const state = hasInvalid
        ? 'invalid'
        : !hasNonEmpty
          ? 'empty'
          : complete
            ? 'complete'
            : 'partial';
      return Object.freeze({
        setOrder: set.set_order,
        state,
        fields: Object.freeze(fields)
      });
    });

    let seenEmpty = false;
    let gap = false;
    rows.forEach((row) => {
      if (row.state === 'empty') seenEmpty = true;
      else if (seenEmpty) gap = true;
    });
    let state;
    if (rows.every((row) => row.state === 'empty')) state = 'empty';
    else if (gap || rows.some((row) => row.state === 'invalid')) state = 'invalid';
    else if (rows.some((row) => row.state === 'partial')) state = 'partial';
    else state = 'complete';
    return Object.freeze({
      state,
      gap,
      fieldKeys: Object.freeze(fieldKeys),
      rows: Object.freeze(rows)
    });
  }

  function deriveItemState(item, entry, fieldDefinitions) {
    if (entry.tracking_mode === 'strength_sets') {
      const strength = deriveStrengthState(item, entry, fieldDefinitions);
      const state = strength.state === 'invalid'
        ? 'invalid'
        : strength.state === 'partial'
          ? 'partial'
          : strength.state === 'complete'
            ? 'complete'
            : item.note === null
              ? 'empty'
              : 'partial';
      return Object.freeze({
        state,
        fieldKeys: Object.freeze(['note']),
        fields: Object.freeze({}),
        strength
      });
    }

    const fieldKeys = ITEM_NUMERIC_FIELD_KEYS.filter(
      (fieldKey) => entry.fields[fieldKey] !== 'forbidden'
    );
    const fields = {};
    let hasInvalid = false;
    let hasNumericValue = false;
    let complete = true;
    fieldKeys.forEach((fieldKey) => {
      const parsed = parseNumericField(
        item[fieldKey] || '',
        fieldDefinitions[fieldKey]
      );
      fields[fieldKey] = parsed;
      if (parsed.state !== 'empty') hasNumericValue = true;
      if (parsed.state === 'invalid') hasInvalid = true;
      const policy = entry.fields[fieldKey];
      if (
        (policy === 'required' && parsed.state !== 'valid') ||
        (policy === 'optional' &&
          parsed.state !== 'empty' &&
          parsed.state !== 'valid')
      ) {
        complete = false;
      }
    });
    const state = hasInvalid
      ? 'invalid'
      : !hasNumericValue && item.note === null
        ? 'empty'
        : complete
          ? 'complete'
          : 'partial';
    return Object.freeze({
      state,
      fieldKeys: Object.freeze(fieldKeys),
      fields: Object.freeze(fields),
      strength: null
    });
  }

  function invalidLookupModel() {
    throw new Error('invalid-lookup-model');
  }

  function isLookupUuid(value) {
    return typeof value === 'string' && LOOKUP_UUID_RE.test(value);
  }

  function isLookupTimestamp(value) {
    if (typeof value !== 'string') return false;
    const match = LOOKUP_TIMESTAMP_RE.exec(value);
    if (!match) return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return (
      year >= 1 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= monthDays[month - 1] &&
      hour <= 23 &&
      minute <= 59 &&
      second <= 59
    );
  }

  function formatLookupDay(value) {
    if (typeof value !== 'string') invalidLookupModel();
    const match = LOOKUP_DAY_RE.exec(value);
    if (!match) invalidLookupModel();
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > monthDays[month - 1]) {
      invalidLookupModel();
    }
    return `${match[3]}.${match[2]}.${match[1]}`;
  }

  function hasAtMostTwoDecimals(value) {
    const text = String(value).toLowerCase();
    const [coefficient, exponentText] = text.split('e');
    const fractionLength = (coefficient.split('.')[1] || '').length;
    const exponent = exponentText === undefined ? 0 : Number(exponentText);
    return Number.isInteger(exponent) && Math.max(0, fractionLength - exponent) <= 2;
  }

  function assertLookupNumber(value, min, max, integer = false) {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer ? !Number.isSafeInteger(value) : !hasAtMostTwoDecimals(value))
    ) {
      invalidLookupModel();
    }
    return value;
  }

  function lookupOptionalNumber(value, min, max, integer = false) {
    return value === null ? null : assertLookupNumber(value, min, max, integer);
  }

  function formatLookupNumber(value) {
    return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1').replace('.', ',');
  }

  function assertLookupRule(policy, key, value) {
    if (
      (policy[key] === 'required' && value === null) ||
      (policy[key] === 'forbidden' && value !== null)
    ) {
      invalidLookupModel();
    }
  }

  function assertLookupPolicySnapshot(policy, trackingMode, equipment, comparability) {
    const primaryPolicies = [policy.reps, policy.duration_sec, policy.distance_m];
    const activeLoads = [policy.weight_kg, policy.assistance_kg].filter(
      (rule) => rule !== 'forbidden'
    ).length;
    const hasWeight = policy.weight_kg !== 'forbidden';
    const hasAssistance = policy.assistance_kg !== 'forbidden';
    if (policy.note !== 'optional') invalidLookupModel();
    if (trackingMode === 'strength_sets') {
      if (
        primaryPolicies.filter((rule) => rule === 'required').length !== 1 ||
        primaryPolicies.some((rule) => rule !== 'required' && rule !== 'forbidden') ||
        policy.duration_min !== 'forbidden' ||
        policy.distance_km !== 'forbidden' ||
        activeLoads > 1
      ) {
        invalidLookupModel();
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
        invalidLookupModel();
      }
    } else if (
      policy.duration_min !== 'required' ||
      policy.distance_km !== 'optional' ||
      policy.reps !== 'forbidden' ||
      policy.duration_sec !== 'forbidden' ||
      policy.distance_m !== 'forbidden' ||
      activeLoads !== 0
    ) {
      invalidLookupModel();
    }
    if (!hasWeight && !hasAssistance) {
      if (comparability !== 'not_applicable') invalidLookupModel();
    } else if (hasAssistance) {
      if (comparability !== 'device_relative') invalidLookupModel();
    } else if (
      !['device_relative', 'standardized'].includes(comparability) ||
      (['cable', 'machine', 'variable'].includes(equipment) &&
        comparability !== 'device_relative')
    ) {
      invalidLookupModel();
    }
  }

  function projectLookupDisplay(value, itemKey) {
    if (!hasExactKeys(value, ['item', 'schema_version', 'session'])) {
      invalidLookupModel();
    }
    if (value.schema_version !== LOOKUP_SCHEMA) invalidLookupModel();
    if (!hasExactKeys(value.session, ['day', 'id', 'started_at'])) {
      invalidLookupModel();
    }
    if (!isLookupUuid(value.session.id) || !isLookupTimestamp(value.session.started_at)) {
      invalidLookupModel();
    }
    const dateLabel = formatLookupDay(value.session.day);
    const item = value.item;
    if (!hasExactKeys(item, [
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
    ])) {
      invalidLookupModel();
    }
    if (
      !isLookupUuid(item.id) ||
      !isLookupTimestamp(item.created_at) ||
      !Number.isSafeInteger(item.catalog_version) ||
      item.catalog_version < 1 ||
      item.catalog_version > 2147483647 ||
      !Number.isSafeInteger(item.item_order) ||
      item.item_order < 1 ||
      item.item_order > 50 ||
      item.item_key !== itemKey ||
      typeof item.item_label_snapshot !== 'string' ||
      item.item_label_snapshot === '' ||
      item.item_label_snapshot.replace(/^ +| +$/g, '') !== item.item_label_snapshot ||
      Array.from(item.item_label_snapshot).length > 80 ||
      !['strength_sets', 'duration', 'duration_distance'].includes(
        item.tracking_mode_snapshot
      ) ||
      !hasOwn(EQUIPMENT_LABELS, item.equipment_snapshot) ||
      !['device_relative', 'not_applicable', 'standardized'].includes(
        item.load_comparability_snapshot
      ) ||
      !Array.isArray(item.sets)
    ) {
      invalidLookupModel();
    }
    const policy = item.field_policy_snapshot;
    if (!hasExactKeys(policy, LOOKUP_FIELD_KEYS)) invalidLookupModel();
    LOOKUP_FIELD_KEYS.forEach((key) => {
      if (!['forbidden', 'optional', 'required'].includes(policy[key])) {
        invalidLookupModel();
      }
    });
    assertLookupPolicySnapshot(
      policy,
      item.tracking_mode_snapshot,
      item.equipment_snapshot,
      item.load_comparability_snapshot
    );
    const durationMin = lookupOptionalNumber(item.duration_min, 1, 1440, true);
    const distanceKm = lookupOptionalNumber(item.distance_km, 0.01, 1000);
    let note = item.note;
    if (
      note !== null &&
      (typeof note !== 'string' ||
        note === '' ||
        note.replace(/^ +| +$/g, '') !== note ||
        Array.from(note).length > NOTE_LIMIT)
    ) {
      invalidLookupModel();
    }
    assertLookupRule(policy, 'duration_min', durationMin);
    assertLookupRule(policy, 'distance_km', distanceKm);
    assertLookupRule(policy, 'note', note);

    const lines = [];
    if (item.tracking_mode_snapshot === 'strength_sets') {
      if (item.sets.length < 1 || item.sets.length > 50) invalidLookupModel();
      item.sets.forEach((set, index) => {
        if (!hasExactKeys(set, [
          'assistance_kg',
          'created_at',
          'distance_m',
          'duration_sec',
          'id',
          'reps',
          'set_order',
          'tracking_mode',
          'weight_kg'
        ])) {
          invalidLookupModel();
        }
        if (
          !isLookupUuid(set.id) ||
          !isLookupTimestamp(set.created_at) ||
          set.set_order !== index + 1 ||
          set.tracking_mode !== 'strength_sets'
        ) {
          invalidLookupModel();
        }
        const reps = lookupOptionalNumber(set.reps, 1, 1000, true);
        const durationSec = lookupOptionalNumber(set.duration_sec, 1, 3600, true);
        const distanceM = lookupOptionalNumber(set.distance_m, 0.1, 10000);
        const weightKg = lookupOptionalNumber(set.weight_kg, 0.01, 1000);
        const assistanceKg = lookupOptionalNumber(set.assistance_kg, 0.01, 1000);
        const primary = [reps, durationSec, distanceM].filter(
          (candidate) => candidate !== null
        );
        if (primary.length !== 1 || (weightKg !== null && assistanceKg !== null)) {
          invalidLookupModel();
        }
        [
          ['reps', reps],
          ['duration_sec', durationSec],
          ['distance_m', distanceM],
          ['weight_kg', weightKg],
          ['assistance_kg', assistanceKg]
        ].forEach(([key, candidate]) => assertLookupRule(policy, key, candidate));

        let primaryText;
        if (reps !== null) primaryText = `${reps} Wiederholungen`;
        else if (durationSec !== null) primaryText = `${durationSec} s`;
        else primaryText = `${formatLookupNumber(distanceM)} m`;
        if (weightKg !== null) {
          primaryText = reps !== null
            ? `${reps} × ${formatLookupNumber(weightKg)} kg`
            : `${primaryText} · ${formatLookupNumber(weightKg)} kg`;
        } else if (assistanceKg !== null) {
          primaryText = reps !== null
            ? `${reps} × ${formatLookupNumber(assistanceKg)} kg Unterstützung`
            : `${primaryText} · ${formatLookupNumber(assistanceKg)} kg Unterstützung`;
        }
        lines.push(primaryText);
      });
    } else {
      if (item.sets.length !== 0 || durationMin === null) invalidLookupModel();
      lines.push(`${durationMin} min`);
      if (distanceKm !== null) lines.push(`${formatLookupNumber(distanceKm)} km`);
    }

    return deepFreeze({
      dateLabel,
      equipmentLabel: EQUIPMENT_LABELS[item.equipment_snapshot],
      itemLabel: item.item_label_snapshot,
      lines,
      note
    });
  }

  function createStructure(document, recoveryEnabled = false) {
    shellSequence += 1;
    const titleId = `activity-v2-session-title-${shellSequence}`;
    const searchId = `activity-v2-session-search-${shellSequence}`;
    const searchResultsId = `activity-v2-session-search-results-${shellSequence}`;
    const noteId = `activity-v2-session-note-${shellSequence}`;

    const panel = makeElement(document, 'section', 'activity-v2-session-shell');
    panel.hidden = true;
    panel.setAttribute('inert', '');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', titleId);

    const header = makeElement(document, 'header', 'activity-v2-session-header');
    const headingGroup = makeElement(
      document,
      'div',
      'activity-v2-session-heading-group'
    );
    const eyebrow = makeElement(
      document,
      'span',
      'activity-v2-session-eyebrow',
      'ACTIVITY V2'
    );
    const title = makeElement(
      document,
      'h1',
      'activity-v2-session-title',
      'Training erfassen'
    );
    title.id = titleId;
    headingGroup.append(eyebrow, title);

    const headerActions = makeElement(
      document,
      'div',
      'activity-v2-session-header-actions'
    );
    const timer = makeElement(
      document,
      'output',
      'activity-v2-session-timer',
      '00:00'
    );
    timer.setAttribute('aria-label', 'Sessiondauer');
    const close = setButton(
      makeElement(document, 'button', 'activity-v2-session-close'),
      'close',
      'Schließen',
      'Session schließen'
    );
    headerActions.append(timer, close);
    header.append(headingGroup, headerActions);

    const content = makeElement(document, 'div', 'activity-v2-session-content');
    const intro = makeElement(document, 'div', 'activity-v2-session-intro');
    intro.append(
      makeElement(
        document,
        'p',
        'activity-v2-session-kicker',
        'DEINE SESSION'
      ),
      makeElement(
        document,
        'p',
        'activity-v2-session-lead',
        recoveryEnabled
          ? 'Baue dein Training Schritt für Schritt auf. Die Session wird lokal auf diesem Gerät gesichert.'
          : 'Baue dein Training Schritt für Schritt auf. Gespeichert wird hier noch nichts.'
      )
    );

    const pickerCard = makeElement(
      document,
      'section',
      'activity-v2-session-card activity-v2-session-picker-card'
    );
    const pickerHeading = makeElement(
      document,
      'h2',
      'activity-v2-session-section-title',
      'Übung oder Aktivität'
    );
    const pickerField = makeElement(
      document,
      'div',
      'activity-v2-session-field'
    );
    const pickerLabel = makeElement(
      document,
      'label',
      '',
      'Katalog lokal durchsuchen'
    );
    pickerLabel.htmlFor = searchId;
    const search = makeElement(document, 'input', 'activity-v2-session-search');
    search.id = searchId;
    search.type = 'search';
    search.placeholder = 'Zum Beispiel Leg Curl oder Romanian Deadlift';
    search.setAttribute('autocomplete', 'off');
    search.setAttribute('aria-controls', searchResultsId);
    search.setAttribute('aria-expanded', 'false');
    const searchStatus = makeElement(
      document,
      'p',
      'activity-v2-session-search-status',
      SEARCH_START_MESSAGE
    );
    const searchResults = makeElement(
      document,
      'ul',
      'activity-v2-session-search-results'
    );
    searchResults.id = searchResultsId;
    searchResults.hidden = true;
    pickerField.append(pickerLabel, search, searchStatus, searchResults);
    pickerCard.append(pickerHeading, pickerField);

    const itemsSection = makeElement(
      document,
      'section',
      'activity-v2-session-items-section'
    );
    const itemsHeading = makeElement(
      document,
      'div',
      'activity-v2-session-section-heading'
    );
    itemsHeading.append(
      makeElement(
        document,
        'h2',
        'activity-v2-session-section-title',
        'Sessionablauf'
      )
    );
    const itemCount = makeElement(
      document,
      'span',
      'activity-v2-session-count',
      '0 Einträge'
    );
    itemsHeading.append(itemCount);
    const empty = makeElement(
      document,
      'p',
      'activity-v2-session-empty',
      'Noch keine Übung oder Aktivität hinzugefügt.'
    );
    const itemList = makeElement(document, 'ol', 'activity-v2-session-items');
    itemsSection.append(itemsHeading, empty, itemList);

    const noteCard = makeElement(
      document,
      'section',
      'activity-v2-session-card activity-v2-session-note-card'
    );
    const noteLabel = makeElement(
      document,
      'label',
      'activity-v2-session-section-title',
      'Sessionnotiz (optional)'
    );
    noteLabel.htmlFor = noteId;
    const noteHint = makeElement(
      document,
      'p',
      'activity-v2-session-hint',
      'Was möchtest du dir für diese Session merken?'
    );
    const note = makeElement(document, 'textarea', 'activity-v2-session-note');
    note.id = noteId;
    note.rows = 4;
    note.maxLength = NOTE_LIMIT;
    note.placeholder = 'Zum Beispiel: Fokus, Energie oder Technik …';
    noteCard.append(noteLabel, noteHint, note);

    const status = makeElement(document, 'div', 'activity-v2-session-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const recoveryStatus = recoveryEnabled
      ? makeElement(document, 'div', 'activity-v2-session-recovery-status')
      : null;
    if (recoveryStatus) {
      recoveryStatus.setAttribute('role', 'status');
      recoveryStatus.setAttribute('aria-live', 'polite');
      recoveryStatus.setAttribute('aria-label', 'Lokaler Wiederherstellungsstatus');
    }

    content.append(intro, pickerCard, itemsSection, noteCard);
    if (recoveryStatus) content.append(recoveryStatus);
    content.append(status);
    panel.append(header, content);
    return {
      panel,
      timer,
      close,
      search,
      searchStatus,
      searchResults,
      empty,
      itemList,
      itemCount,
      note,
      recoveryStatus,
      status
    };
  }

  function mount(optionsValue) {
    const options = assertMountOptions(optionsValue);
    const document = assertHost(options.host);
    const draft = assertDraft(options.draft);
    const recovery = resolveRecovery(options, draft);
    const semantics = resolveSemantics(options);
    const loadLastPerformance = resolveLookup(options);
    const confirmDiscard = resolveConfirmation(options);
    const scheduler = resolveScheduler(options);
    if (mountedHosts.has(options.host)) fail('SHELL_ALREADY_MOUNTED');

    const ui = createStructure(document, recovery !== null);
    let openState = false;
    let destroyed = false;
    let listenersBound = false;
    let opener = null;
    let inertRecords = [];
    let previousBodyOverflow = null;
    let currentState = null;
    let itemActionRefs = new Map();
    let intervalActive = false;
    let intervalId;
    let closeGuardPromise = null;
    let closeGuardGeneration = 0;
    let searchState = { mode: 'closed', entries: [] };
    let lookupGeneration = 0;
    let lookupStates = new Map();
    let unsubscribeRecovery = null;
    let controller;

    function setStatus(message, tone = '') {
      ui.status.textContent = message;
      if (tone) ui.status.dataset.tone = tone;
      else delete ui.status.dataset.tone;
    }

    function patchRecoveryStatus(nextState) {
      if (!ui.recoveryStatus) return;
      let state;
      try {
        state = assertRecoveryState(nextState);
      } catch {
        ui.recoveryStatus.textContent =
          'Lokale Wiederherstellung derzeit nicht garantiert.';
        ui.recoveryStatus.dataset.tone = 'error';
        return;
      }
      const presentation = {
        saving: ['Wird lokal gesichert …', 'notice'],
        saved: ['Lokal gesichert', 'success'],
        degraded: [
          'Lokale Wiederherstellung derzeit nicht garantiert.',
          'error'
        ],
        conflict: [
          'Die Session wurde in einem anderen Tab verändert. Bitte neu laden, bevor du sie lokal weiter sicherst oder verwirfst.',
          'error'
        ],
        discarding: ['Lokale Session wird verworfen …', 'notice']
      }[state.state] || ['', ''];
      ui.recoveryStatus.textContent = presentation[0];
      if (presentation[1]) ui.recoveryStatus.dataset.tone = presentation[1];
      else delete ui.recoveryStatus.dataset.tone;
    }

    function assertUsable() {
      if (destroyed) fail('SHELL_DESTROYED');
    }

    function renderSearchState() {
      const included = new Set(
        currentState?.snapshot.items.map((item) => item.item_key) || []
      );
      const fragment = document.createDocumentFragment();
      if (searchState.mode === 'results') {
        searchState.entries.forEach((entry) => {
          const listItem = makeElement(
            document,
            'li',
            'activity-v2-session-search-result-item'
          );
          const button = setButton(
            makeElement(
              document,
              'button',
              'activity-v2-session-search-result'
            ),
            'select-search-result',
            '',
            `${entry.label} auswählen`
          );
          button.dataset.itemKey = entry.key;
          button.disabled = closeGuardPromise !== null;
          button.append(
            makeElement(
              document,
              'span',
              'activity-v2-session-search-result-label',
              entry.label
            ),
            makeElement(
              document,
              'span',
              'activity-v2-session-search-result-equipment',
              EQUIPMENT_LABELS[entry.equipment]
            )
          );
          if (included.has(entry.key)) {
            button.append(
              makeElement(
                document,
                'span',
                'activity-v2-session-search-result-present',
                'Bereits in Session'
              )
            );
          }
          listItem.appendChild(button);
          fragment.appendChild(listItem);
        });
      }
      ui.searchResults.replaceChildren(fragment);
      const open = searchState.mode !== 'closed';
      ui.searchResults.hidden = searchState.mode !== 'results';
      ui.search.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (searchState.mode === 'empty') {
        ui.searchStatus.textContent = SEARCH_EMPTY_MESSAGE;
      } else if (searchState.mode === 'search_error') {
        ui.searchStatus.textContent = SEARCH_ERROR_MESSAGE;
      } else if (searchState.mode === 'results') {
        ui.searchStatus.textContent = `${searchState.entries.length} ${
          searchState.entries.length === 1 ? 'Treffer' : 'Treffer'
        }`;
      } else {
        ui.searchStatus.textContent = SEARCH_START_MESSAGE;
      }
    }

    function closeSearch(clearQuery) {
      if (clearQuery) ui.search.value = '';
      searchState = { mode: 'closed', entries: [] };
      renderSearchState();
    }

    function runSearch() {
      let normalized;
      try {
        normalized = semantics.normalizeSearchText(ui.search.value);
        if (typeof normalized !== 'string') throw new TypeError('invalid search');
      } catch {
        searchState = { mode: 'search_error', entries: [] };
        renderSearchState();
        return;
      }
      if (normalized === '') {
        closeSearch(false);
        return;
      }
      try {
        const result = semantics.search(ui.search.value, { limit: SEARCH_LIMIT });
        if (!Array.isArray(result) || result.length > SEARCH_LIMIT) {
          throw new TypeError('invalid search result');
        }
        const seen = new Set();
        const entries = result.map((candidate) => {
          if (
            !isRecord(candidate) ||
            typeof candidate.key !== 'string' ||
            seen.has(candidate.key)
          ) {
            throw new TypeError('invalid search result');
          }
          const entry = semantics.getEntryByKey(candidate.key);
          if (
            !isRecord(entry) ||
            entry.key !== candidate.key ||
            entry.status !== 'active' ||
            typeof entry.label !== 'string' ||
            !hasOwn(EQUIPMENT_LABELS, entry.equipment) ||
            currentState?.catalogState.byKey.get(entry.key) !== entry
          ) {
            throw new TypeError('invalid search result');
          }
          seen.add(entry.key);
          return entry;
        });
        searchState = {
          mode: entries.length === 0 ? 'empty' : 'results',
          entries
        };
      } catch {
        searchState = { mode: 'search_error', entries: [] };
      }
      renderSearchState();
    }

    function renderLookupRegion(region, itemKey, state) {
      const fragment = document.createDocumentFragment();
      fragment.appendChild(
        makeElement(
          document,
          'p',
          'activity-v2-session-history-title',
          'Letzte Ausführung'
        )
      );
      if (!state) {
        region.replaceChildren(fragment);
        return;
      }
      if (state.status === 'loading') {
        fragment.appendChild(
          makeElement(document, 'p', 'activity-v2-session-history-message', LOOKUP_LOADING_MESSAGE)
        );
      } else if (state.status === 'empty') {
        fragment.appendChild(
          makeElement(document, 'p', 'activity-v2-session-history-message', LOOKUP_EMPTY_MESSAGE)
        );
      } else if (state.status === 'error') {
        fragment.appendChild(
          makeElement(document, 'p', 'activity-v2-session-history-message', LOOKUP_ERROR_MESSAGE)
        );
        const retry = setButton(
          makeElement(document, 'button', 'activity-v2-session-secondary'),
          'retry-lookup',
          'Erneut versuchen',
          'Letzte Ausführung erneut laden'
        );
        retry.dataset.itemKey = itemKey;
        fragment.appendChild(retry);
      } else if (state.status === 'success') {
        const model = state.model;
        fragment.append(
          makeElement(
            document,
            'p',
            'activity-v2-session-history-summary',
            `Zuletzt am ${model.dateLabel}`
          ),
          makeElement(
            document,
            'p',
            'activity-v2-session-history-snapshot',
            `${model.itemLabel} · ${model.equipmentLabel}`
          )
        );
        const values = makeElement(document, 'ul', 'activity-v2-session-history-values');
        model.lines.forEach((line) => {
          values.appendChild(
            makeElement(document, 'li', 'activity-v2-session-history-value', line)
          );
        });
        fragment.appendChild(values);
        if (model.note !== null) {
          fragment.appendChild(
            makeElement(
              document,
              'p',
              'activity-v2-session-history-note',
              model.note
            )
          );
        }
      }
      region.replaceChildren(fragment);
    }

    function canPatchLookup(itemKey) {
      return (
        !destroyed &&
        openState &&
        closeGuardPromise === null &&
        currentState?.snapshot.items.some((item) => item.item_key === itemKey) &&
        itemActionRefs.has(itemKey)
      );
    }

    function patchLookup(itemKey) {
      if (!canPatchLookup(itemKey)) return;
      const refs = itemActionRefs.get(itemKey);
      if (refs?.history) {
        renderLookupRegion(refs.history, itemKey, lookupStates.get(itemKey));
      }
    }

    function settleLookup(itemKey, generation, outcome, rawValue) {
      if (destroyed) return;
      const current = lookupStates.get(itemKey);
      if (!current || current.generation !== generation || current.status !== 'loading') {
        return;
      }
      let next;
      if (outcome === 'error') {
        next = { status: 'error', generation };
      } else if (rawValue === null) {
        next = { status: 'empty', generation };
      } else {
        try {
          next = {
            status: 'success',
            generation,
            model: projectLookupDisplay(rawValue, itemKey)
          };
        } catch {
          next = { status: 'error', generation };
        }
      }
      lookupStates.set(itemKey, deepFreeze(next));
      patchLookup(itemKey);
    }

    function startLookup(itemKey, retry = false) {
      if (!loadLastPerformance || destroyed) return;
      const existing = lookupStates.get(itemKey);
      if ((!retry && existing) || (retry && existing?.status !== 'error')) return;
      lookupGeneration += 1;
      const generation = lookupGeneration;
      lookupStates.set(itemKey, deepFreeze({ status: 'loading', generation }));
      patchLookup(itemKey);

      let pending;
      try {
        pending = loadLastPerformance(itemKey);
        const kind = typeof pending;
        if (
          pending === null ||
          (kind !== 'object' && kind !== 'function') ||
          typeof pending.then !== 'function'
        ) {
          throw new TypeError('lookup callback must return a thenable');
        }
      } catch {
        settleLookup(itemKey, generation, 'error');
        return;
      }
      Promise.resolve(pending).then(
        (value) => settleLookup(itemKey, generation, 'success', value),
        () => settleLookup(itemKey, generation, 'error')
      );
    }

    function reconcileLookupDom() {
      if (!loadLastPerformance || destroyed || !openState || closeGuardPromise) return;
      currentState.snapshot.items.forEach((item) => {
        if (!lookupStates.has(item.item_key)) startLookup(item.item_key);
        else patchLookup(item.item_key);
      });
    }

    function applyEditorState(refs, item, derived, restoreValues = false) {
      if (!refs?.editor) return;
      refs.editor.dataset.state = derived.state;
      refs.editorStatus.textContent = derived.gap ? GAP_MESSAGE : '';
      derived.rows.forEach((rowState) => {
        const rowRefs = refs.setRows.get(rowState.setOrder);
        if (!rowRefs) return;
        rowRefs.row.dataset.state = rowState.state;
        rowRefs.status.textContent =
          rowState.state === 'partial' ? PARTIAL_SET_MESSAGE : '';
        derived.fieldKeys.forEach((fieldKey) => {
          const fieldRefs = rowRefs.fields.get(fieldKey);
          const fieldState = rowState.fields[fieldKey];
          if (!fieldRefs || !fieldState) return;
          fieldRefs.wrapper.dataset.state = fieldState.state;
          fieldRefs.input.setAttribute(
            'aria-invalid',
            fieldState.state === 'invalid' ? 'true' : 'false'
          );
          fieldRefs.error.textContent = fieldState.error;
          if (restoreValues) {
            fieldRefs.input.value =
              item.sets[rowState.setOrder - 1]?.[fieldKey] || '';
          }
        });
      });
    }

    function appendItemFields(editor, item, entry, derived) {
      const fields = makeElement(
        document,
        'div',
        'activity-v2-session-item-fields'
      );
      const itemFields = new Map();
      derived.fieldKeys
        .filter((fieldKey) => fieldKey !== 'note')
        .forEach((fieldKey) => {
          const uiDefinition = ITEM_FIELD_UI[fieldKey];
          const fieldState = derived.fields[fieldKey];
          const fieldId =
            `activity-v2-session-item-${shellSequence}-${item.item_key}-` +
            fieldKey;
          const errorId = `${fieldId}-error`;
          const wrapper = makeElement(
            document,
            'div',
            'activity-v2-session-item-field'
          );
          wrapper.dataset.state = fieldState.state;
          const label = makeElement(document, 'label', '', uiDefinition.label);
          label.htmlFor = fieldId;
          const input = makeElement(
            document,
            'input',
            'activity-v2-session-item-input'
          );
          input.id = fieldId;
          input.type = 'text';
          input.value = item[fieldKey] || '';
          input.maxLength = ITEM_VALUE_LIMIT;
          input.dataset.itemKey = item.item_key;
          input.dataset.fieldKey = fieldKey;
          input.setAttribute('inputmode', uiDefinition.inputMode);
          input.setAttribute('maxlength', String(ITEM_VALUE_LIMIT));
          input.setAttribute('autocomplete', 'off');
          input.setAttribute('spellcheck', 'false');
          input.setAttribute('aria-describedby', errorId);
          if (entry.fields[fieldKey] === 'required') {
            input.setAttribute('aria-required', 'true');
          }
          input.setAttribute(
            'aria-invalid',
            fieldState.state === 'invalid' ? 'true' : 'false'
          );
          input.disabled = closeGuardPromise !== null;
          const error = makeElement(
            document,
            'p',
            'activity-v2-session-item-field-error',
            fieldState.error
          );
          error.id = errorId;
          wrapper.append(label, input, error);
          fields.appendChild(wrapper);
          itemFields.set(fieldKey, { wrapper, input, error });
        });

      const noteId =
        `activity-v2-session-item-${shellSequence}-${item.item_key}-note`;
      const noteWrapper = makeElement(
        document,
        'div',
        'activity-v2-session-item-field activity-v2-session-item-note-field'
      );
      noteWrapper.dataset.state = item.note === null ? 'empty' : 'valid';
      const noteLabel = makeElement(
        document,
        'label',
        '',
        ITEM_FIELD_UI.note.label
      );
      noteLabel.htmlFor = noteId;
      const note = makeElement(
        document,
        'textarea',
        'activity-v2-session-item-note'
      );
      note.id = noteId;
      note.rows = 3;
      note.value = item.note || '';
      note.maxLength = NOTE_LIMIT;
      note.dataset.itemKey = item.item_key;
      note.dataset.fieldKey = 'note';
      note.setAttribute('maxlength', String(NOTE_LIMIT));
      note.setAttribute('autocomplete', 'off');
      note.disabled = closeGuardPromise !== null;
      noteWrapper.append(noteLabel, note);
      fields.appendChild(noteWrapper);
      itemFields.set('note', { wrapper: noteWrapper, input: note, error: null });

      const itemStatus = makeElement(
        document,
        'p',
        'activity-v2-session-item-status',
        derived.state === 'partial' ? PARTIAL_ITEM_MESSAGE : ''
      );
      editor.append(fields, itemStatus);
      return { itemFields, itemStatus };
    }

    function createItemEditor(item, entry, catalogState) {
      const itemDerived = deriveItemState(
        item,
        entry,
        catalogState.fieldDefinitions
      );
      if (entry.tracking_mode !== 'strength_sets') {
        const editor = makeElement(
          document,
          'section',
          'activity-v2-session-editor activity-v2-session-item-editor'
        );
        editor.dataset.itemKey = item.item_key;
        editor.dataset.state = itemDerived.state;
        editor.setAttribute('aria-label', `Aktuelle Leistung für ${entry.label}`);
        editor.appendChild(
          makeElement(
            document,
            'h3',
            'activity-v2-session-editor-title',
            'Aktuelle Leistung'
          )
        );
        const itemRefs = appendItemFields(
          editor,
          item,
          entry,
          itemDerived
        );
        return {
          node: editor,
          state: itemDerived.state,
          refs: {
            editor,
            editorStatus: null,
            setRows: null,
            addSet: null,
            ...itemRefs
          }
        };
      }

      const derived = itemDerived.strength;
      const editor = makeElement(
        document,
        'section',
        'activity-v2-session-editor activity-v2-session-strength-editor'
      );
      editor.dataset.itemKey = item.item_key;
      editor.dataset.state = derived.state;
      editor.setAttribute('aria-label', `Aktuelle Sätze für ${entry.label}`);
      editor.appendChild(
        makeElement(
          document,
          'h3',
          'activity-v2-session-editor-title',
          'Aktuelle Sätze'
        )
      );
      const setList = makeElement(document, 'ol', 'activity-v2-session-set-list');
      const setRows = new Map();
      item.sets.forEach((set, setIndex) => {
        const rowState = derived.rows[setIndex];
        const setRow = makeElement(
          document,
          'li',
          'activity-v2-session-set-row'
        );
        setRow.dataset.itemKey = item.item_key;
        setRow.dataset.setOrder = String(set.set_order);
        setRow.dataset.state = rowState.state;
        setRow.appendChild(
          makeElement(
            document,
            'h4',
            'activity-v2-session-set-title',
            `Satz ${set.set_order}`
          )
        );
        const fields = new Map();
        derived.fieldKeys.forEach((fieldKey) => {
          const uiDefinition = SET_FIELD_UI[fieldKey];
          const fieldState = rowState.fields[fieldKey];
          const fieldId =
            `activity-v2-session-set-${shellSequence}-${item.item_key}-` +
            `${set.set_order}-${fieldKey}`;
          const errorId = `${fieldId}-error`;
          const wrapper = makeElement(
            document,
            'div',
            'activity-v2-session-set-field'
          );
          wrapper.dataset.state = fieldState.state;
          const label = makeElement(document, 'label', '', uiDefinition.label);
          label.htmlFor = fieldId;
          const input = makeElement(
            document,
            'input',
            'activity-v2-session-set-input'
          );
          input.id = fieldId;
          input.type = 'text';
          input.value = set[fieldKey] || '';
          input.maxLength = SET_VALUE_LIMIT;
          input.dataset.itemKey = item.item_key;
          input.dataset.setOrder = String(set.set_order);
          input.dataset.fieldKey = fieldKey;
          input.setAttribute('inputmode', uiDefinition.inputMode);
          input.setAttribute('maxlength', String(SET_VALUE_LIMIT));
          input.setAttribute('autocomplete', 'off');
          input.setAttribute('spellcheck', 'false');
          input.setAttribute('aria-describedby', errorId);
          input.setAttribute(
            'aria-invalid',
            fieldState.state === 'invalid' ? 'true' : 'false'
          );
          input.disabled = closeGuardPromise !== null;
          const error = makeElement(
            document,
            'p',
            'activity-v2-session-set-field-error',
            fieldState.error
          );
          error.id = errorId;
          wrapper.append(label, input, error);
          setRow.appendChild(wrapper);
          fields.set(fieldKey, { wrapper, input, error });
        });
        const status = makeElement(
          document,
          'p',
          'activity-v2-session-set-status',
          rowState.state === 'partial' ? PARTIAL_SET_MESSAGE : ''
        );
        const removeSet = setButton(
          makeElement(document, 'button', 'activity-v2-session-secondary'),
          'remove-set',
          'Satz entfernen',
          `Satz ${set.set_order} entfernen`
        );
        removeSet.title = `Satz ${set.set_order} entfernen`;
        removeSet.setAttribute('title', removeSet.title);
        removeSet.dataset.itemKey = item.item_key;
        removeSet.dataset.setOrder = String(set.set_order);
        removeSet.disabled = item.sets.length === 1 || closeGuardPromise !== null;
        setRow.append(status, removeSet);
        setList.appendChild(setRow);
        setRows.set(set.set_order, { row: setRow, fields, status, removeSet });
      });
      const editorStatus = makeElement(
        document,
        'p',
        'activity-v2-session-editor-status',
        derived.gap ? GAP_MESSAGE : ''
      );
      const addSet = setButton(
        makeElement(document, 'button', 'activity-v2-session-secondary'),
        'add-set',
        '+ Satz',
        'Satz hinzufügen'
      );
      addSet.title = 'Satz hinzufügen';
      addSet.setAttribute('title', addSet.title);
      addSet.dataset.itemKey = item.item_key;
      addSet.disabled = item.sets.length >= SET_LIMIT || closeGuardPromise !== null;
      editor.append(setList, editorStatus, addSet);
      const itemRefs = appendItemFields(editor, item, entry, itemDerived);
      return {
        node: editor,
        state: itemDerived.state,
        refs: { editor, editorStatus, setRows, addSet, ...itemRefs }
      };
    }

    function applyItemState(refs, item, entry, derived, restoreValues = false) {
      if (!refs?.row || !refs.editor?.itemFields) {
        fail('INVALID_DRAFT_STATE');
      }
      refs.row.dataset.state = derived.state;
      if (entry.tracking_mode !== 'strength_sets') {
        refs.editor.editor.dataset.state = derived.state;
      }
      refs.editor.itemStatus.textContent =
        derived.state === 'partial' ? PARTIAL_ITEM_MESSAGE : '';
      derived.fieldKeys
        .filter((fieldKey) => fieldKey !== 'note')
        .forEach((fieldKey) => {
          const fieldRefs = refs.editor.itemFields.get(fieldKey);
          const fieldState = derived.fields[fieldKey];
          if (!fieldRefs || !fieldState) fail('INVALID_DRAFT_STATE');
          fieldRefs.wrapper.dataset.state = fieldState.state;
          fieldRefs.input.setAttribute(
            'aria-invalid',
            fieldState.state === 'invalid' ? 'true' : 'false'
          );
          fieldRefs.error.textContent = fieldState.error;
          if (restoreValues) fieldRefs.input.value = item[fieldKey] || '';
        });
      const noteRefs = refs.editor.itemFields.get('note');
      if (!noteRefs) fail('INVALID_DRAFT_STATE');
      noteRefs.wrapper.dataset.state = item.note === null ? 'empty' : 'valid';
      if (restoreValues) noteRefs.input.value = item.note || '';
    }

    function patchItemState(itemKey, restoreValues = false) {
      const nextState = readState(draft, semantics);
      const item = nextState.snapshot.items.find(
        (candidate) => candidate.item_key === itemKey
      );
      const entry = nextState.catalogState.byKey.get(itemKey);
      const refs = itemActionRefs.get(itemKey);
      if (!item || !entry || !refs?.editor) fail('INVALID_DRAFT_STATE');
      const derived = deriveItemState(
        item,
        entry,
        nextState.catalogState.fieldDefinitions
      );
      if (entry.tracking_mode === 'strength_sets') {
        applyEditorState(refs.editor, item, derived.strength, restoreValues);
      }
      applyItemState(refs, item, entry, derived, restoreValues);
      currentState = nextState;
      return nextState.snapshot;
    }

    function syncDraftControlsDisabled() {
      const guarded = closeGuardPromise !== null;
      ui.search.disabled = guarded;
      ui.note.disabled = guarded;
      ui.searchResults.querySelectorAll('button').forEach((button) => {
        if (button.dataset.action === 'select-search-result') {
          button.disabled = guarded;
        }
      });
      itemActionRefs.forEach((refs, itemKey) => {
        const item = currentState?.snapshot.items.find(
          (candidate) => candidate.item_key === itemKey
        );
        if (!item) return;
        refs.up.disabled = guarded || item.item_order === 1;
        refs.down.disabled =
          guarded || item.item_order === currentState.snapshot.items.length;
        refs.remove.disabled = guarded;
        refs.editor.itemFields.forEach(({ input }) => {
          input.disabled = guarded;
        });
        if (refs.editor.setRows) {
          refs.editor.addSet.disabled = guarded || item.sets.length >= SET_LIMIT;
          refs.editor.setRows.forEach((rowRefs) => {
            rowRefs.fields.forEach(({ input }) => {
              input.disabled = guarded;
            });
            rowRefs.removeSet.disabled = guarded || item.sets.length === 1;
          });
        }
      });
    }

    function render() {
      assertUsable();
      const nextState = readState(draft, semantics);
      const listFragment = document.createDocumentFragment();
      const nextActionRefs = new Map();
      nextState.snapshot.items.forEach((item, index) => {
        const entry = nextState.catalogState.byKey.get(item.item_key);
        const row = makeElement(document, 'li', 'activity-v2-session-item');
        row.dataset.itemKey = item.item_key;
        row.setAttribute('tabindex', '-1');
        const identity = makeElement(
          document,
          'div',
          'activity-v2-session-item-identity'
        );
        identity.append(
          makeElement(
            document,
            'span',
            'activity-v2-session-item-order',
            String(item.item_order).padStart(2, '0')
          ),
          makeElement(
            document,
            'span',
            'activity-v2-session-item-label',
            entry.label
          )
        );
        const actions = makeElement(
          document,
          'div',
          'activity-v2-session-item-actions'
        );
        const up = setButton(
          makeElement(document, 'button', 'activity-v2-session-secondary'),
          'move-up',
          'Nach oben',
          `${entry.label} nach oben verschieben`
        );
        const down = setButton(
          makeElement(document, 'button', 'activity-v2-session-secondary'),
          'move-down',
          'Nach unten',
          `${entry.label} nach unten verschieben`
        );
        const remove = setButton(
          makeElement(document, 'button', 'activity-v2-session-danger'),
          'remove',
          'Entfernen',
          `${entry.label} entfernen`
        );
        up.disabled = index === 0;
        down.disabled = index === nextState.snapshot.items.length - 1;
        up.dataset.itemKey = item.item_key;
        down.dataset.itemKey = item.item_key;
        remove.dataset.itemKey = item.item_key;
        actions.append(up, down, remove);
        let history = null;
        if (loadLastPerformance) {
          history = makeElement(
            document,
            'section',
            'activity-v2-session-history'
          );
          history.dataset.itemKey = item.item_key;
          history.setAttribute('aria-live', 'polite');
          history.setAttribute('aria-label', `Letzte Ausführung für ${entry.label}`);
          renderLookupRegion(history, item.item_key, lookupStates.get(item.item_key));
        }
        const editor = createItemEditor(item, entry, nextState.catalogState);
        row.dataset.state = editor.state;
        row.append(identity);
        if (history) row.append(history);
        row.append(editor.node);
        row.append(actions);
        listFragment.appendChild(row);
        nextActionRefs.set(item.item_key, {
          row,
          up,
          down,
          remove,
          history,
          editor: editor.refs
        });
      });

      ui.itemList.replaceChildren(listFragment);
      ui.empty.hidden = nextState.snapshot.items.length > 0;
      ui.itemList.hidden = nextState.snapshot.items.length === 0;
      ui.itemCount.textContent = `${nextState.snapshot.items.length} ${
        nextState.snapshot.items.length === 1 ? 'Eintrag' : 'Einträge'
      }`;
      ui.note.value = nextState.snapshot.note || '';
      ui.timer.textContent = nextState.timer.label;
      currentState = nextState;
      itemActionRefs = nextActionRefs;
      renderSearchState();
      syncDraftControlsDisabled();
      syncTimerScheduler();
      setStatus('');
      if (openState && closeGuardPromise === null) reconcileLookupDom();
      return nextState.snapshot;
    }

    function refreshTimer() {
      const nextState = readState(draft, semantics);
      ui.timer.textContent = nextState.timer.label;
      currentState = nextState;
      return nextState.timer;
    }

    function refreshTimerSafely() {
      try {
        refreshTimer();
      } catch {
        setStatus('Die Sessiondauer konnte nicht aktualisiert werden.', 'error');
      }
    }

    function stopTimerScheduler() {
      if (!intervalActive) return;
      const id = intervalId;
      intervalActive = false;
      intervalId = undefined;
      try {
        scheduler.clearIntervalFn(id);
      } catch {
        // Cleanup remains idempotent even if an injected scheduler misbehaves.
      }
    }

    function startTimerScheduler() {
      if (intervalActive) return;
      try {
        intervalId = scheduler.setIntervalFn(refreshTimerSafely, 1000);
        intervalActive = true;
      } catch {
        fail('INVALID_SCHEDULER');
      }
    }

    function syncTimerScheduler() {
      if (openState && currentState?.timer.running) startTimerScheduler();
      else stopTimerScheduler();
    }

    function focusElement(element) {
      if (!element || element.disabled || typeof element.focus !== 'function') {
        return false;
      }
      element.focus();
      return true;
    }

    function focusPicker() {
      return focusElement(ui.search) || focusElement(ui.close);
    }

    function focusItemRow(itemKey) {
      return focusElement(itemActionRefs.get(itemKey)?.row) || focusPicker();
    }

    function focusItemAction(itemKey, preferredAction) {
      const refs = itemActionRefs.get(itemKey);
      if (!refs) return focusPicker();
      const preferred =
        preferredAction === 'move-up'
          ? refs.up
          : preferredAction === 'move-down'
            ? refs.down
            : refs.remove;
      if (focusElement(preferred)) return true;
      return [refs.up, refs.down, refs.remove].some(focusElement) || focusPicker();
    }

    function focusSetInput(itemKey, setOrder) {
      const rowRefs = itemActionRefs.get(itemKey)?.editor?.setRows.get(setOrder);
      if (!rowRefs) return focusItemRow(itemKey);
      for (const fieldRefs of rowRefs.fields.values()) {
        if (focusElement(fieldRefs.input)) return true;
      }
      return focusItemRow(itemKey);
    }

    function getFocusableElements() {
      return Array.from(
        ui.panel.querySelectorAll('button, input, select, textarea')
      ).filter(
        (element) =>
          !element.disabled &&
          !element.hidden &&
          element.getAttribute('tabindex') !== '-1'
      );
    }

    function restoreOpener(target = opener) {
      if (
        target &&
        target.isConnected !== false &&
        typeof target.focus === 'function'
      ) {
        try {
          target.focus();
        } catch {
          // A detached or disabled opener is intentionally ignored.
        }
      }
    }

    function lockBackground() {
      inertRecords = Array.from(options.host.children)
        .filter((child) => child !== ui.panel)
        .map((child) => ({ child, wasInert: child.hasAttribute('inert') }));
      inertRecords.forEach(({ child }) => child.setAttribute('inert', ''));
      if (document.body?.style) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    }

    function unlockBackground() {
      inertRecords.forEach(({ child, wasInert }) => {
        if (!wasInert) child.removeAttribute('inert');
      });
      inertRecords = [];
      if (previousBodyOverflow !== null && document.body?.style) {
        document.body.style.overflow = previousBodyOverflow;
        previousBodyOverflow = null;
      }
    }

    function handleKeydown(event) {
      if (!openState) return;
      const keyTarget = event.target || document.activeElement;
      if (event.key === 'Escape' && closeGuardPromise) {
        event.preventDefault();
        event.stopPropagation?.();
        controller.requestClose('escape');
        return;
      }
      if (event.key === 'ArrowDown' && keyTarget === ui.search) {
        if (closeGuardPromise || ui.search.disabled) return;
        if (searchState.mode === 'closed' && ui.search.value !== '') runSearch();
        const firstResult = ui.searchResults.querySelector('button');
        if (searchState.mode === 'results' && firstResult) {
          event.preventDefault();
          firstResult.focus();
        }
        return;
      }
      if (event.key === 'Enter' && searchState.mode === 'results') {
        if (closeGuardPromise) return;
        const actionTarget = findActionButton(keyTarget);
        const selected =
          actionTarget?.dataset.action === 'select-search-result'
            ? actionTarget
            : keyTarget === ui.search
              ? ui.searchResults.querySelector('button')
              : null;
        if (selected) {
          event.preventDefault();
          selectSearchResult(selected.dataset.itemKey);
          return;
        }
      }
      if (event.key === 'Escape') {
        if (searchState.mode !== 'closed') {
          event.preventDefault();
          event.stopPropagation?.();
          closeSearch(false);
          return;
        }
        event.preventDefault();
        controller.requestClose('escape');
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !ui.panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !ui.panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    function findActionButton(target) {
      let candidate = target;
      while (candidate && candidate !== ui.panel) {
        if (
          candidate.nodeType === 1 &&
          candidate.tagName === 'BUTTON' &&
          candidate.dataset?.action
        ) {
          return candidate;
        }
        candidate = candidate.parentNode;
      }
      return null;
    }

    function handleVisibilityChange() {
      if (openState && document.visibilityState === 'visible') {
        refreshTimerSafely();
      }
    }

    function runDraftAction(action, successMessage, focusAfter, focusOnFailure) {
      const previousFocus = document.activeElement;
      try {
        action();
        render();
        setStatus(successMessage, 'success');
        focusAfter();
      } catch {
        setStatus('Die Aktion konnte nicht ausgeführt werden.', 'error');
        restoreOpener(focusOnFailure || previousFocus);
      }
    }

    function selectSearchResult(itemKey) {
      if (closeGuardPromise) return;
      const selected = searchState.entries.find((entry) => entry.key === itemKey);
      if (!selected) return;
      const alreadyIncluded = currentState?.snapshot.items.some(
        (item) => item.item_key === itemKey
      );
      if (alreadyIncluded) {
        closeSearch(true);
        setStatus('Eintrag ist bereits in der Session.', 'notice');
        focusItemRow(itemKey);
        return;
      }
      try {
        draft.addItem(itemKey);
        closeSearch(true);
        render();
        setStatus('Eintrag hinzugefügt.', 'success');
        focusItemRow(itemKey);
      } catch {
        setStatus('Die Aktion konnte nicht ausgeführt werden.', 'error');
        focusElement(ui.search);
      }
    }

    function handleClick(event) {
      const target = findActionButton(event.target);
      const action = target?.dataset?.action;
      if (!action || target.disabled) return;
      if (action === 'close') {
        controller.requestClose('close_button');
        return;
      }
      if (action === 'retry-lookup') {
        startLookup(target.dataset.itemKey, true);
        return;
      }
      if (closeGuardPromise) return;
      if (action === 'select-search-result') {
        selectSearchResult(target.dataset.itemKey);
        return;
      }
      const itemKey = target.dataset.itemKey;
      if (action === 'add-set') {
        if (itemActionRefs.get(itemKey)?.editor?.addSet !== target) return;
        const item = currentState?.snapshot.items.find(
          (candidate) => candidate.item_key === itemKey
        );
        if (!item) return;
        try {
          draft.addSet(itemKey);
          render();
          focusSetInput(itemKey, item.sets.length + 1);
        } catch {
          setStatus('Satz konnte nicht hinzugefügt werden.', 'error');
          focusElement(target);
        }
        return;
      }
      if (action === 'remove-set') {
        const item = currentState?.snapshot.items.find(
          (candidate) => candidate.item_key === itemKey
        );
        const setOrder = Number(target.dataset.setOrder);
        if (
          !item ||
          !Number.isSafeInteger(setOrder) ||
          setOrder < 1 ||
          setOrder > item.sets.length
        ) {
          return;
        }
        if (
          itemActionRefs.get(itemKey)?.editor?.setRows.get(setOrder)
            ?.removeSet !== target
        ) {
          return;
        }
        const nextOrder = Math.min(setOrder, item.sets.length - 1);
        try {
          draft.removeSet(itemKey, setOrder);
          render();
          focusSetInput(itemKey, nextOrder);
        } catch {
          setStatus('Satz konnte nicht entfernt werden.', 'error');
          focusElement(target);
        }
        return;
      }
      if (action === 'move-up' || action === 'move-down') {
        const item = currentState?.snapshot.items.find(
          (candidate) => candidate.item_key === itemKey
        );
        if (!item) return;
        const delta = action === 'move-up' ? -1 : 1;
        runDraftAction(
          () => draft.moveItem(itemKey, item.item_order + delta),
          'Reihenfolge aktualisiert.',
          () => focusItemAction(itemKey, action),
          target
        );
        return;
      }
      if (action === 'remove') {
        const items = currentState?.snapshot.items || [];
        const index = items.findIndex((item) => item.item_key === itemKey);
        const nextKey =
          index === -1
            ? null
            : items[index + 1]?.item_key || items[index - 1]?.item_key || null;
        runDraftAction(
          () => draft.removeItem(itemKey),
          'Eintrag entfernt.',
          () => (nextKey ? focusItemAction(nextKey, 'remove') : focusPicker()),
          target
        );
      }
    }

    function handleInput(event) {
      if (event.target === ui.search) {
        if (closeGuardPromise || ui.search.disabled) return;
        runSearch();
        return;
      }
      const setInput = event.target;
      const fieldKey = setInput?.dataset?.fieldKey;
      if (
        setInput?.nodeType === 1 &&
        setInput.tagName === 'INPUT' &&
        SET_FIELD_KEYS.includes(fieldKey)
      ) {
        const itemKey = setInput.dataset.itemKey;
        const setOrder = Number(setInput.dataset.setOrder);
        const item = currentState?.snapshot.items.find(
          (candidate) => candidate.item_key === itemKey
        );
        const entry = currentState?.catalogState.byKey.get(itemKey);
        if (
          closeGuardPromise ||
          setInput.disabled ||
          !item ||
          entry?.tracking_mode !== 'strength_sets' ||
          entry.fields[fieldKey] === 'forbidden' ||
          !Number.isSafeInteger(setOrder) ||
          setOrder < 1 ||
          setOrder > item.sets.length
        ) {
          return;
        }
        if (
          itemActionRefs.get(itemKey)?.editor?.setRows.get(setOrder)
            ?.fields.get(fieldKey)?.input !== setInput
        ) {
          return;
        }
        try {
          draft.setSetField(itemKey, setOrder, fieldKey, setInput.value);
        } catch {
          const stableItem = currentState?.snapshot.items.find(
            (candidate) => candidate.item_key === itemKey
          );
          const stableEntry = currentState?.catalogState.byKey.get(itemKey);
          if (stableItem && stableEntry?.tracking_mode === 'strength_sets') {
            const stableDerived = deriveStrengthState(
              stableItem,
              stableEntry,
              currentState.catalogState.fieldDefinitions
            );
            applyEditorState(
              itemActionRefs.get(itemKey)?.editor,
              stableItem,
              stableDerived,
              true
            );
          }
          setStatus('Die Satzeingabe konnte nicht aktualisiert werden.', 'error');
          focusElement(setInput);
          return;
        }
        patchItemState(itemKey);
        setStatus('');
        return;
      }
      const itemInput = event.target;
      const itemFieldKey = itemInput?.dataset?.fieldKey;
      const expectedTag = itemFieldKey === 'note' ? 'TEXTAREA' : 'INPUT';
      if (
        itemInput?.nodeType === 1 &&
        itemInput.tagName === expectedTag &&
        ITEM_FIELD_KEYS.includes(itemFieldKey)
      ) {
        const itemKey = itemInput.dataset.itemKey;
        const item = currentState?.snapshot.items.find(
          (candidate) => candidate.item_key === itemKey
        );
        const entry = currentState?.catalogState.byKey.get(itemKey);
        const fieldPolicy = entry?.fields[itemFieldKey];
        if (
          closeGuardPromise ||
          itemInput.disabled ||
          !item ||
          !entry ||
          (fieldPolicy !== 'required' && fieldPolicy !== 'optional') ||
          itemActionRefs.get(itemKey)?.editor?.itemFields.get(itemFieldKey)
            ?.input !== itemInput
        ) {
          return;
        }
        let nextSnapshot;
        try {
          nextSnapshot = draft.setItemField(
            itemKey,
            itemFieldKey,
            itemInput.value
          );
        } catch {
          const stableDerived = deriveItemState(
            item,
            entry,
            currentState.catalogState.fieldDefinitions
          );
          applyItemState(
            itemActionRefs.get(itemKey),
            item,
            entry,
            stableDerived,
            true
          );
          setStatus(
            'Die Aktivitätseingabe konnte nicht aktualisiert werden.',
            'error'
          );
          focusElement(itemInput);
          return;
        }
        if (nextSnapshot === currentState.snapshot) return;
        patchItemState(itemKey);
        setStatus('');
        return;
      }
      if (event.target !== ui.note) return;
      if (closeGuardPromise || ui.note.disabled) return;
      try {
        draft.setNote(ui.note.value);
        const nextState = readState(draft, semantics);
        currentState = nextState;
        setStatus('');
      } catch {
        setStatus('Die Sessionnotiz konnte nicht aktualisiert werden.', 'error');
      }
    }

    function bindListeners() {
      if (listenersBound) return;
      ui.panel.addEventListener('click', handleClick);
      ui.panel.addEventListener('input', handleInput);
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      listenersBound = true;
    }

    function unbindListeners() {
      if (!listenersBound) return;
      ui.panel.removeEventListener('click', handleClick);
      ui.panel.removeEventListener('input', handleInput);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      listenersBound = false;
    }

    function closeTechnical() {
      if (!openState) return true;
      stopTimerScheduler();
      unbindListeners();
      unlockBackground();
      ui.panel.hidden = true;
      ui.panel.setAttribute('aria-hidden', 'true');
      ui.panel.setAttribute('inert', '');
      openState = false;
      if (activeDocuments.get(document) === controller) {
        activeDocuments.delete(document);
      }
      restoreOpener();
      return true;
    }

    function open(optionsValue) {
      assertUsable();
      const openOptions = assertOpenOptions(optionsValue);
      if (openState) return controller;
      const activeShell = activeDocuments.get(document);
      if (activeShell && activeShell !== controller) fail('SHELL_ALREADY_OPEN');

      const nextOpener = hasOwn(openOptions, 'opener')
        ? openOptions.opener
        : document.activeElement;
      render();
      opener = nextOpener;
      try {
        lockBackground();
        ui.panel.hidden = false;
        ui.panel.removeAttribute('inert');
        ui.panel.setAttribute('aria-hidden', 'false');
        bindListeners();
        openState = true;
        activeDocuments.set(document, controller);
        syncTimerScheduler();
        focusPicker();
        reconcileLookupDom();
      } catch (error) {
        stopTimerScheduler();
        unbindListeners();
        unlockBackground();
        ui.panel.hidden = true;
        ui.panel.setAttribute('aria-hidden', 'true');
        ui.panel.setAttribute('inert', '');
        openState = false;
        if (activeDocuments.get(document) === controller) {
          activeDocuments.delete(document);
        }
        if (error instanceof ActivityV2SessionShellError) throw error;
        fail('INVALID_HOST');
      }
      return controller;
    }

    function requestClose(source = 'api') {
      assertUsable();
      if (!CLOSE_SOURCES.includes(source)) fail('INVALID_OPTIONS');
      if (!openState) return Promise.resolve(true);
      if (closeGuardPromise) return closeGuardPromise;
      const state = readState(draft, semantics);
      if (state.snapshot.revision === 0) {
        return Promise.resolve(closeTechnical());
      }

      const previousFocus = document.activeElement;
      const generation = closeGuardGeneration;
      let reconcileAfterGuard = false;
      const context = deepFreeze({
        message: DISCARD_MESSAGE,
        source,
        snapshot: state.snapshot
      });
      const guard = Promise.resolve()
        .then(() => confirmDiscard(context))
        .then(async (confirmed) => {
          if (
            destroyed ||
            generation !== closeGuardGeneration ||
            !openState
          ) {
            return false;
          }
          if (confirmed !== true) {
            setStatus('Session wurde nicht verworfen.', 'notice');
            reconcileAfterGuard = true;
            return false;
          }
          try {
            if (recovery) await recovery.controller.discard();
            else draft.discard();
          } catch {
            setStatus('Die Session konnte nicht verworfen werden.', 'error');
            reconcileAfterGuard = true;
            return false;
          }
          if (
            destroyed ||
            generation !== closeGuardGeneration ||
            !openState
          ) {
            return false;
          }
          return closeTechnical();
        })
        .catch(() => {
          if (
            !destroyed &&
            generation === closeGuardGeneration &&
            openState
          ) {
            setStatus('Die Session konnte nicht verworfen werden.', 'error');
            reconcileAfterGuard = true;
          }
          return false;
        })
        .finally(() => {
          if (closeGuardPromise === guard) {
            closeGuardPromise = null;
            if (!destroyed && openState) syncDraftControlsDisabled();
            if (reconcileAfterGuard && !destroyed && openState) {
              reconcileLookupDom();
              restoreOpener(previousFocus);
            }
          }
        });
      closeGuardPromise = guard;
      syncDraftControlsDisabled();
      return guard;
    }

    function isOpen() {
      return openState;
    }

    function destroy() {
      if (destroyed) return;
      closeGuardGeneration += 1;
      if (unsubscribeRecovery) {
        try {
          unsubscribeRecovery();
        } catch {
          // A foreign unsubscriber cannot prevent local shell cleanup.
        }
        unsubscribeRecovery = null;
      }
      closeTechnical();
      stopTimerScheduler();
      unbindListeners();
      unlockBackground();
      if (typeof ui.panel.remove === 'function') ui.panel.remove();
      else ui.panel.parentNode?.removeChild(ui.panel);
      mountedHosts.delete(options.host);
      destroyed = true;
      currentState = null;
      itemActionRefs = new Map();
      lookupStates.clear();
      lookupStates = new Map();
      searchState = { mode: 'closed', entries: [] };
    }

    controller = deepFreeze({
      open,
      render,
      requestClose,
      isOpen,
      destroy
    });

    try {
      if (recovery) {
        patchRecoveryStatus(recovery.state);
        unsubscribeRecovery = recovery.controller.subscribe(patchRecoveryStatus);
        if (typeof unsubscribeRecovery !== 'function') fail('INVALID_RECOVERY_API');
      }
      render();
      options.host.appendChild(ui.panel);
      mountedHosts.set(options.host, controller);
    } catch (error) {
      try {
        unsubscribeRecovery?.();
      } catch {
        // Detached mount rollback stays best-effort.
      }
      unsubscribeRecovery = null;
      if (ui.panel.parentNode) ui.panel.remove();
      if (error instanceof ActivityV2SessionShellError) throw error;
      fail('INVALID_HOST');
    }

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
  if ('sessionShell' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionShell is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const sessionShellApi = deepFreeze({ mount });
  Object.defineProperty(root.AppModules.activityV2, 'sessionShell', {
    value: sessionShellApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
