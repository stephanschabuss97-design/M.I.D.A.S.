'use strict';

(function initActivityV2SessionDraft(root) {
  const DRAFT_SCHEMA_VERSION = 'midas.activity-session-draft.v3';
  const ITEM_LIMIT = 50;
  const NOTE_LIMIT = 500;
  const SET_LIMIT = 50;
  const INITIAL_SET_COUNT = 3;
  const SET_VALUE_LIMIT = 32;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const OPTION_KEYS = Object.freeze([
    'createRequestId',
    'now',
    'semantics'
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
  const SAFE_MESSAGE = 'The activity session draft operation could not be completed.';

  class ActivityV2SessionDraftError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionDraftError';
      this.code = code;
    }
  }

  const hasOwn = (value, key) =>
    Object.prototype.hasOwnProperty.call(value, key);

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

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
    if (keys.length !== value.length + 1 || keys[keys.length - 1] !== 'length') {
      return false;
    }
    return value.every((entry, index) => keys[index] === String(index));
  }

  function fail(code) {
    throw new ActivityV2SessionDraftError(code);
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

  function assertOptions(value) {
    if (value === undefined) return {};
    if (!isRecord(value)) fail('INVALID_OPTIONS');
    if (Reflect.ownKeys(value).some((key) => !OPTION_KEYS.includes(key))) {
      fail('INVALID_OPTIONS');
    }
    return value;
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
      typeof semantics.getEntryByKey !== 'function'
    ) {
      fail('SEMANTICS_MISSING');
    }
    return semantics;
  }

  function captureCatalog(semantics) {
    let catalog;
    try {
      catalog = semantics.getCatalog();
    } catch {
      fail('INVALID_CATALOG');
    }
    if (
      !isRecord(catalog) ||
      !Number.isSafeInteger(catalog.catalog_version) ||
      catalog.catalog_version < 1 ||
      !Array.isArray(catalog.entries)
    ) {
      fail('INVALID_CATALOG');
    }

    const entries = new Map();
    for (const entry of catalog.entries) {
      if (
        !isRecord(entry) ||
        typeof entry.key !== 'string' ||
        !ITEM_KEY_RE.test(entry.key) ||
        (entry.status !== 'active' && entry.status !== 'deprecated') ||
        !TRACKING_MODES.includes(entry.tracking_mode) ||
        !hasExactKeys(entry.fields, CATALOG_FIELD_KEYS) ||
        CATALOG_FIELD_KEYS.some(
          (key) => !FIELD_POLICIES.includes(entry.fields[key])
        ) ||
        !isValidCatalogPolicy(entry.tracking_mode, entry.fields) ||
        entries.has(entry.key)
      ) {
        fail('INVALID_CATALOG');
      }
      entries.set(entry.key, deepFreeze({
        status: entry.status,
        trackingMode: entry.tracking_mode,
        fields: Object.fromEntries(
          CATALOG_FIELD_KEYS.map((key) => [key, entry.fields[key]])
        )
      }));
    }
    return { catalogVersion: catalog.catalog_version, entries };
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

  function resolveClock(options) {
    if (!hasOwn(options, 'now') || options.now === undefined) return Date.now;
    if (typeof options.now !== 'function') fail('INVALID_CLOCK');
    return options.now;
  }

  function readNow(now) {
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

  function resolveRequestIdSource(options) {
    if (
      hasOwn(options, 'createRequestId') &&
      options.createRequestId !== undefined
    ) {
      if (typeof options.createRequestId !== 'function') {
        fail('INVALID_REQUEST_ID');
      }
      return { injected: true, read: options.createRequestId };
    }
    return {
      injected: false,
      read() {
        if (
          !root.crypto ||
          typeof root.crypto.randomUUID !== 'function'
        ) {
          fail('REQUEST_ID_UNAVAILABLE');
        }
        return root.crypto.randomUUID();
      }
    };
  }

  function createRequestId(source, previousRequestId = null) {
    let value;
    try {
      value = source.read();
    } catch (error) {
      if (error instanceof ActivityV2SessionDraftError) throw error;
      fail('INVALID_REQUEST_ID');
    }
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
      fail('INVALID_REQUEST_ID');
    }
    const normalized = value.toLowerCase();
    if (normalized === previousRequestId) fail('INVALID_REQUEST_ID');
    return normalized;
  }

  function assertItemKey(itemKey) {
    if (typeof itemKey !== 'string' || !ITEM_KEY_RE.test(itemKey)) {
      fail('INVALID_ITEM_KEY');
    }
  }

  function assertKnownActiveItem(semantics, catalogState, itemKey) {
    const capturedEntry = catalogState.entries.get(itemKey);
    let entry;
    try {
      entry = semantics.getEntryByKey(itemKey);
    } catch {
      fail('UNKNOWN_ITEM_KEY');
    }
    if (!capturedEntry) fail('UNKNOWN_ITEM_KEY');
    if (entry === null || entry === undefined) fail('INVALID_CATALOG');
    if (!isRecord(entry) || entry.key !== itemKey) fail('INVALID_CATALOG');
    if (capturedEntry.status !== 'active') fail('INACTIVE_ITEM_KEY');
    if (
      entry.status !== capturedEntry.status ||
      entry.tracking_mode !== capturedEntry.trackingMode ||
      !hasExactKeys(entry.fields, CATALOG_FIELD_KEYS) ||
      CATALOG_FIELD_KEYS.some(
        (key) => entry.fields[key] !== capturedEntry.fields[key]
      )
    ) {
      fail('INVALID_CATALOG');
    }
    return capturedEntry;
  }

  function assertRevisionAvailable(snapshot) {
    if (snapshot.revision === Number.MAX_SAFE_INTEGER) {
      fail('REVISION_LIMIT_REACHED');
    }
  }

  function createSetRecord(setOrder, values = {}) {
    return {
      set_order: setOrder,
      reps: values.reps ?? null,
      duration_sec: values.duration_sec ?? null,
      distance_m: values.distance_m ?? null,
      weight_kg: values.weight_kg ?? null,
      assistance_kg: values.assistance_kg ?? null
    };
  }

  function createItemRecord(itemKey, itemOrder, catalogEntry) {
    const sets = catalogEntry.trackingMode === 'strength_sets'
      ? Array.from(
          { length: INITIAL_SET_COUNT },
          (_, index) => createSetRecord(index + 1)
        )
      : [];
    return {
      item_key: itemKey,
      item_order: itemOrder,
      duration_min: null,
      distance_km: null,
      note: null,
      sets
    };
  }

  function rebuildItemRecord(item, changes = {}) {
    return {
      item_key: item.item_key,
      item_order: hasOwn(changes, 'item_order')
        ? changes.item_order
        : item.item_order,
      duration_min: hasOwn(changes, 'duration_min')
        ? changes.duration_min
        : item.duration_min,
      distance_km: hasOwn(changes, 'distance_km')
        ? changes.distance_km
        : item.distance_km,
      note: hasOwn(changes, 'note') ? changes.note : item.note,
      sets: hasOwn(changes, 'sets') ? changes.sets : item.sets
    };
  }

  function withItemOrder(item, itemOrder) {
    return item.item_order === itemOrder
      ? item
      : rebuildItemRecord(item, { item_order: itemOrder });
  }

  function withSetOrder(set, setOrder) {
    return set.set_order === setOrder
      ? set
      : createSetRecord(setOrder, set);
  }

  function createSnapshot({ requestId, catalogVersion, revision, startedAt, note, items }) {
    return deepFreeze({
      draft_schema_version: DRAFT_SCHEMA_VERSION,
      request_id: requestId,
      catalog_version: catalogVersion,
      revision,
      started_at: startedAt,
      note,
      items: items.map((item, index) => withItemOrder(item, index + 1))
    });
  }

  function findItem(itemKey, snapshot) {
    assertItemKey(itemKey);
    const itemIndex = snapshot.items.findIndex(
      (item) => item.item_key === itemKey
    );
    if (itemIndex === -1) fail('ITEM_NOT_FOUND');
    return { item: snapshot.items[itemIndex], itemIndex };
  }

  function assertStrengthItem(item, catalogState) {
    const catalogEntry = catalogState.entries.get(item.item_key);
    if (!catalogEntry) fail('INVALID_CATALOG');
    if (catalogEntry.trackingMode !== 'strength_sets') {
      fail('SETS_UNAVAILABLE');
    }
    return catalogEntry;
  }

  function assertSetOrder(setOrder) {
    if (
      !Number.isSafeInteger(setOrder) ||
      setOrder < 1 ||
      setOrder > SET_LIMIT
    ) {
      fail('INVALID_SET_ORDER');
    }
  }

  function replaceItem(items, itemIndex, item) {
    const nextItems = [...items];
    nextItems[itemIndex] = item;
    return nextItems;
  }

  function formatTimer(elapsedMs) {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const pad = (value) => String(value).padStart(2, '0');
    if (totalMinutes < 60) return `${pad(totalMinutes)}:${pad(seconds)}`;
    return `${pad(Math.floor(totalMinutes / 60))}:${pad(minutes)}:${pad(seconds)}`;
  }

  function isCanonicalTimestamp(value) {
    if (typeof value !== 'string') return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString() === value;
  }

  function isRestorableRawValue(value, limit) {
    return (
      value === null ||
      (typeof value === 'string' &&
        value !== '' &&
        Array.from(value).length <= limit)
    );
  }

  function validateRestoredSnapshot(snapshot, catalogState) {
    if (
      !hasExactOrderedKeys(snapshot, SNAPSHOT_KEYS) ||
      snapshot.draft_schema_version !== DRAFT_SCHEMA_VERSION ||
      typeof snapshot.request_id !== 'string' ||
      !UUID_RE.test(snapshot.request_id) ||
      snapshot.request_id !== snapshot.request_id.toLowerCase() ||
      !Number.isSafeInteger(snapshot.catalog_version) ||
      snapshot.catalog_version < 1 ||
      !Number.isSafeInteger(snapshot.revision) ||
      snapshot.revision < 0 ||
      (snapshot.started_at !== null &&
        !isCanonicalTimestamp(snapshot.started_at)) ||
      !isRestorableRawValue(snapshot.note, NOTE_LIMIT) ||
      (snapshot.note !== null && snapshot.note.trim() !== snapshot.note) ||
      !isDenseArray(snapshot.items) ||
      snapshot.items.length > ITEM_LIMIT
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    if (snapshot.catalog_version !== catalogState.catalogVersion) {
      fail('CATALOG_VERSION_MISMATCH');
    }
    if (
      snapshot.revision === 0 &&
      (snapshot.started_at !== null ||
        snapshot.note !== null ||
        snapshot.items.length !== 0)
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    if (snapshot.items.length > 0 && snapshot.started_at === null) {
      fail('INVALID_DRAFT_STATE');
    }

    const seenItemKeys = new Set();
    snapshot.items.forEach((item, itemIndex) => {
      if (
        !hasExactOrderedKeys(item, DRAFT_ITEM_KEYS) ||
        typeof item.item_key !== 'string' ||
        !ITEM_KEY_RE.test(item.item_key) ||
        item.item_order !== itemIndex + 1 ||
        seenItemKeys.has(item.item_key) ||
        !isDenseArray(item.sets)
      ) {
        fail('INVALID_DRAFT_STATE');
      }

      const catalogEntry = catalogState.entries.get(item.item_key);
      if (!catalogEntry || catalogEntry.status !== 'active') {
        fail('INVALID_DRAFT_STATE');
      }
      ITEM_FIELD_KEYS.forEach((fieldKey) => {
        const limit = fieldKey === 'note' ? NOTE_LIMIT : SET_VALUE_LIMIT;
        if (
          !isRestorableRawValue(item[fieldKey], limit) ||
          (catalogEntry.fields[fieldKey] === 'forbidden' &&
            item[fieldKey] !== null)
        ) {
          fail('INVALID_DRAFT_STATE');
        }
      });

      if (catalogEntry.trackingMode === 'strength_sets') {
        if (item.sets.length < 1 || item.sets.length > SET_LIMIT) {
          fail('INVALID_DRAFT_STATE');
        }
      } else if (item.sets.length !== 0) {
        fail('INVALID_DRAFT_STATE');
      }

      item.sets.forEach((set, setIndex) => {
        if (
          !hasExactOrderedKeys(set, DRAFT_SET_KEYS) ||
          set.set_order !== setIndex + 1
        ) {
          fail('INVALID_DRAFT_STATE');
        }
        SET_FIELD_KEYS.forEach((fieldKey) => {
          if (
            !isRestorableRawValue(set[fieldKey], SET_VALUE_LIMIT) ||
            (catalogEntry.fields[fieldKey] === 'forbidden' &&
              set[fieldKey] !== null)
          ) {
            fail('INVALID_DRAFT_STATE');
          }
        });
      });
      seenItemKeys.add(item.item_key);
    });

    return deepFreeze(snapshot);
  }

  function createController(optionsValue, restoredSnapshot, isRestore) {
    const options = assertOptions(optionsValue);
    const semantics = resolveSemantics(options);
    const now = resolveClock(options);
    const requestIdSource = resolveRequestIdSource(options);
    let catalogState = captureCatalog(semantics);
    let snapshot = isRestore
      ? validateRestoredSnapshot(restoredSnapshot, catalogState)
      : createSnapshot({
          requestId: createRequestId(requestIdSource),
          catalogVersion: catalogState.catalogVersion,
          revision: 0,
          startedAt: null,
          note: null,
          items: []
        });

    function getSnapshot() {
      return snapshot;
    }

    function getTimerSnapshot() {
      if (snapshot.started_at === null) {
        return deepFreeze({ running: false, elapsed_ms: 0, label: '00:00' });
      }
      const elapsedMs = Math.floor(
        Math.max(0, readNow(now) - Date.parse(snapshot.started_at))
      );
      return deepFreeze({
        running: true,
        elapsed_ms: elapsedMs,
        label: formatTimer(elapsedMs)
      });
    }

    function addItem(itemKey) {
      assertItemKey(itemKey);
      const catalogEntry = assertKnownActiveItem(
        semantics,
        catalogState,
        itemKey
      );
      if (snapshot.items.some((item) => item.item_key === itemKey)) {
        fail('DUPLICATE_ITEM');
      }
      if (snapshot.items.length >= ITEM_LIMIT) fail('ITEM_LIMIT_REACHED');
      assertRevisionAvailable(snapshot);

      const startedAt =
        snapshot.started_at === null
          ? new Date(readNow(now)).toISOString()
          : snapshot.started_at;
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt,
        note: snapshot.note,
        items: [
          ...snapshot.items,
          createItemRecord(itemKey, snapshot.items.length + 1, catalogEntry)
        ]
      });
      return snapshot;
    }

    function removeItem(itemKey) {
      assertItemKey(itemKey);
      const itemIndex = snapshot.items.findIndex(
        (item) => item.item_key === itemKey
      );
      if (itemIndex === -1) fail('ITEM_NOT_FOUND');
      assertRevisionAvailable(snapshot);

      const items = [...snapshot.items];
      items.splice(itemIndex, 1);
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items
      });
      return snapshot;
    }

    function moveItem(itemKey, targetOrder) {
      assertItemKey(itemKey);
      const itemIndex = snapshot.items.findIndex(
        (item) => item.item_key === itemKey
      );
      if (itemIndex === -1) fail('ITEM_NOT_FOUND');
      if (
        !Number.isSafeInteger(targetOrder) ||
        targetOrder < 1 ||
        targetOrder > snapshot.items.length
      ) {
        fail('INVALID_ITEM_ORDER');
      }
      if (itemIndex === targetOrder - 1) return snapshot;
      assertRevisionAvailable(snapshot);

      const items = [...snapshot.items];
      const [item] = items.splice(itemIndex, 1);
      items.splice(targetOrder - 1, 0, item);
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items
      });
      return snapshot;
    }

    function setNote(value) {
      if (typeof value !== 'string') fail('INVALID_NOTE');
      const normalized = value.trim();
      if (Array.from(normalized).length > NOTE_LIMIT) fail('INVALID_NOTE');
      const note = normalized === '' ? null : normalized;
      if (note === snapshot.note) return snapshot;
      assertRevisionAvailable(snapshot);

      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note,
        items: snapshot.items
      });
      return snapshot;
    }

    function discard() {
      const nextCatalogState = captureCatalog(semantics);
      const nextRequestId = createRequestId(
        requestIdSource,
        snapshot.request_id
      );
      const nextSnapshot = createSnapshot({
        requestId: nextRequestId,
        catalogVersion: nextCatalogState.catalogVersion,
        revision: 0,
        startedAt: null,
        note: null,
        items: []
      });
      catalogState = nextCatalogState;
      snapshot = nextSnapshot;
      return snapshot;
    }

    function addSet(itemKey) {
      const { item, itemIndex } = findItem(itemKey, snapshot);
      assertStrengthItem(item, catalogState);
      if (item.sets.length >= SET_LIMIT) fail('SET_LIMIT_REACHED');
      assertRevisionAvailable(snapshot);

      const nextItem = rebuildItemRecord(item, {
        sets: [
          ...item.sets,
          createSetRecord(item.sets.length + 1)
        ]
      });
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items: replaceItem(snapshot.items, itemIndex, nextItem)
      });
      return snapshot;
    }

    function removeSet(itemKey, setOrder) {
      const { item, itemIndex } = findItem(itemKey, snapshot);
      assertStrengthItem(item, catalogState);
      assertSetOrder(setOrder);
      const setIndex = item.sets.findIndex(
        (set) => set.set_order === setOrder
      );
      if (setIndex === -1) fail('SET_NOT_FOUND');
      if (item.sets.length === 1) fail('SET_MINIMUM_REACHED');
      assertRevisionAvailable(snapshot);

      const sets = [...item.sets];
      sets.splice(setIndex, 1);
      const nextItem = rebuildItemRecord(item, {
        sets: sets.map((set, index) => withSetOrder(set, index + 1))
      });
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items: replaceItem(snapshot.items, itemIndex, nextItem)
      });
      return snapshot;
    }

    function setSetField(itemKey, setOrder, fieldKey, value) {
      const { item, itemIndex } = findItem(itemKey, snapshot);
      const catalogEntry = assertStrengthItem(item, catalogState);
      assertSetOrder(setOrder);
      const setIndex = item.sets.findIndex(
        (set) => set.set_order === setOrder
      );
      if (setIndex === -1) fail('SET_NOT_FOUND');
      if (typeof fieldKey !== 'string' || !SET_FIELD_KEYS.includes(fieldKey)) {
        fail('INVALID_SET_FIELD');
      }
      if (catalogEntry.fields[fieldKey] === 'forbidden') {
        fail('FORBIDDEN_SET_FIELD');
      }
      if (
        typeof value !== 'string' ||
        Array.from(value).length > SET_VALUE_LIMIT
      ) {
        fail('INVALID_SET_VALUE');
      }
      const canonicalValue = value === '' ? null : value;
      if (item.sets[setIndex][fieldKey] === canonicalValue) return snapshot;
      assertRevisionAvailable(snapshot);

      const sets = [...item.sets];
      sets[setIndex] = createSetRecord(setOrder, {
        ...sets[setIndex],
        [fieldKey]: canonicalValue
      });
      const nextItem = rebuildItemRecord(item, { sets });
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items: replaceItem(snapshot.items, itemIndex, nextItem)
      });
      return snapshot;
    }

    function setItemField(itemKey, fieldKey, value) {
      const { item, itemIndex } = findItem(itemKey, snapshot);
      const catalogEntry = catalogState.entries.get(item.item_key);
      if (!catalogEntry) fail('INVALID_CATALOG');
      if (
        typeof fieldKey !== 'string' ||
        !ITEM_FIELD_KEYS.includes(fieldKey)
      ) {
        fail('INVALID_ITEM_FIELD');
      }
      const fieldPolicy = catalogEntry.fields[fieldKey];
      if (fieldPolicy !== 'required' && fieldPolicy !== 'optional') {
        fail('FORBIDDEN_ITEM_FIELD');
      }
      const valueLimit = fieldKey === 'note' ? NOTE_LIMIT : SET_VALUE_LIMIT;
      if (
        typeof value !== 'string' ||
        Array.from(value).length > valueLimit
      ) {
        fail('INVALID_ITEM_VALUE');
      }
      const canonicalValue = value === '' ? null : value;
      if (item[fieldKey] === canonicalValue) return snapshot;
      assertRevisionAvailable(snapshot);

      const nextItem = rebuildItemRecord(item, {
        [fieldKey]: canonicalValue
      });
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items: replaceItem(snapshot.items, itemIndex, nextItem)
      });
      return snapshot;
    }

    return deepFreeze({
      getSnapshot,
      getTimerSnapshot,
      addItem,
      removeItem,
      moveItem,
      setNote,
      discard,
      addSet,
      removeSet,
      setSetField,
      setItemField
    });
  }

  function create(optionsValue) {
    return createController(optionsValue, undefined, false);
  }

  function restore(snapshot, optionsValue) {
    return createController(optionsValue, snapshot, true);
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
  if ('sessionDraft' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionDraft is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const sessionDraftApi = deepFreeze({ create, restore });
  Object.defineProperty(root.AppModules.activityV2, 'sessionDraft', {
    value: sessionDraftApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
