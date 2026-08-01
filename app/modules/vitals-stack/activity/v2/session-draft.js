'use strict';

(function initActivityV2SessionDraft(root) {
  const DRAFT_SCHEMA_VERSION = 'midas.activity-session-draft.v1';
  const ITEM_LIMIT = 50;
  const NOTE_LIMIT = 500;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const OPTION_KEYS = Object.freeze([
    'createRequestId',
    'now',
    'semantics'
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
        entries.has(entry.key)
      ) {
        fail('INVALID_CATALOG');
      }
      entries.set(entry.key, entry.status);
    }
    return { catalogVersion: catalog.catalog_version, entries };
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
    let entry;
    try {
      entry = semantics.getEntryByKey(itemKey);
    } catch {
      fail('UNKNOWN_ITEM_KEY');
    }
    if (entry === null || entry === undefined || !catalogState.entries.has(itemKey)) {
      fail('UNKNOWN_ITEM_KEY');
    }
    if (!isRecord(entry) || entry.key !== itemKey) fail('INVALID_CATALOG');
    if (entry.status !== 'active' || catalogState.entries.get(itemKey) !== 'active') {
      fail('INACTIVE_ITEM_KEY');
    }
  }

  function assertRevisionAvailable(snapshot) {
    if (snapshot.revision === Number.MAX_SAFE_INTEGER) {
      fail('REVISION_LIMIT_REACHED');
    }
  }

  function createSnapshot({ requestId, catalogVersion, revision, startedAt, note, items }) {
    return deepFreeze({
      draft_schema_version: DRAFT_SCHEMA_VERSION,
      request_id: requestId,
      catalog_version: catalogVersion,
      revision,
      started_at: startedAt,
      note,
      items: items.map((itemKey, index) => ({
        item_key: itemKey,
        item_order: index + 1
      }))
    });
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

  function create(optionsValue) {
    const options = assertOptions(optionsValue);
    const semantics = resolveSemantics(options);
    const now = resolveClock(options);
    const requestIdSource = resolveRequestIdSource(options);
    let catalogState = captureCatalog(semantics);
    let snapshot = createSnapshot({
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
      assertKnownActiveItem(semantics, catalogState, itemKey);
      if (snapshot.items.some((item) => item.item_key === itemKey)) {
        fail('DUPLICATE_ITEM');
      }
      if (snapshot.items.length >= ITEM_LIMIT) fail('ITEM_LIMIT_REACHED');
      assertRevisionAvailable(snapshot);

      const startedAt =
        snapshot.started_at === null
          ? new Date(readNow(now)).toISOString()
          : snapshot.started_at;
      const itemKeys = snapshot.items.map((item) => item.item_key);
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt,
        note: snapshot.note,
        items: [...itemKeys, itemKey]
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

      const itemKeys = snapshot.items.map((item) => item.item_key);
      itemKeys.splice(itemIndex, 1);
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items: itemKeys
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

      const itemKeys = snapshot.items.map((item) => item.item_key);
      itemKeys.splice(itemIndex, 1);
      itemKeys.splice(targetOrder - 1, 0, itemKey);
      snapshot = createSnapshot({
        requestId: snapshot.request_id,
        catalogVersion: snapshot.catalog_version,
        revision: snapshot.revision + 1,
        startedAt: snapshot.started_at,
        note: snapshot.note,
        items: itemKeys
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
        items: snapshot.items.map((item) => item.item_key)
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

    return deepFreeze({
      getSnapshot,
      getTimerSnapshot,
      addItem,
      removeItem,
      moveItem,
      setNote,
      discard
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
  if ('sessionDraft' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionDraft is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const sessionDraftApi = deepFreeze({ create });
  Object.defineProperty(root.AppModules.activityV2, 'sessionDraft', {
    value: sessionDraftApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
