'use strict';

(function initActivityV2SessionHistory(root) {
  const PAGE_SCHEMA = 'midas.activity-session-history-page.v1';
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const REVISION_RE = /^[1-9][0-9]*$/;
  const FINGERPRINT_RE = /^[0-9a-f]{64}$/;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const MAX_REVISION = '9223372036854775807';
  const SAFE_MESSAGE =
    'The activity session history operation could not be completed.';
  const ADAPTER_METHODS = Object.freeze([
    'listSessions',
    'loadSessionDetail',
    'replaceSession',
    'deleteSession'
  ]);
  const RECOVERY_STATE_KEYS = Object.freeze([
    'state',
    'started_at',
    'saved_at',
    'item_count',
    'reason'
  ]);
  const COMMIT_STATE_KEYS = Object.freeze([
    'state',
    'reason',
    'focus_target',
    'intent_present'
  ]);
  const RECOVERY_STATES = Object.freeze([
    'empty',
    'recoverable',
    'active',
    'saving',
    'saved',
    'degraded',
    'conflict',
    'discarding',
    'blocked',
    'destroyed'
  ]);
  const COMMIT_STATES = Object.freeze([
    'editing',
    'preparing',
    'committing',
    'unknown',
    'cleanup_pending',
    'release_pending',
    'committed',
    'not_committed',
    'blocked',
    'destroyed'
  ]);
  const FOCUS_KEYS = Object.freeze([
    'scope',
    'item_key',
    'set_order',
    'field_key'
  ]);
  const HISTORY_PAGE_KEYS = Object.freeze([
    'schema_version',
    'items',
    'has_more',
    'next_cursor'
  ]);
  const HISTORY_ITEM_KEYS = Object.freeze([
    'session_id',
    'started_at',
    'day',
    'title',
    'duration_min',
    'item_count',
    'revision'
  ]);
  const CURSOR_KEYS = Object.freeze(['started_at', 'id']);
  const SAFE_CODES = new Set([
    'AUTH_REQUIRED',
    'INVALID_HISTORY_REQUEST',
    'INVALID_SESSION',
    'MUTATION_OUTCOME_UNKNOWN',
    'REQUEST_FAILED',
    'REVISION_EXHAUSTED',
    'SESSION_CONFLICT',
    'SESSION_NOT_FOUND'
  ]);

  class ActivityV2SessionHistoryError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionHistoryError';
      this.code = code;
    }
  }

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
  const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

  function fail(code) {
    throw new ActivityV2SessionHistoryError(code);
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

  function hasExactDataKeys(value, expected) {
    if (!isRecord(value)) return false;
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expected.length ||
      keys.some((key) => typeof key !== 'string' || !expected.includes(key))
    ) {
      return false;
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    return expected.every(
      (key) =>
        descriptors[key] &&
        Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
    );
  }

  function hasExactDenseDataArray(value, length) {
    if (!Array.isArray(value) || value.length !== length) return false;
    const expectedKeys = [
      ...Array.from({ length }, (_, index) => String(index)),
      'length'
    ];
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expectedKeys.length ||
      keys.some((key) => typeof key !== 'string' || !expectedKeys.includes(key))
    ) {
      return false;
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    return Array.from({ length }, (_, index) => String(index)).every(
      (key) =>
        descriptors[key] &&
        Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
    );
  }

  function isCanonicalTimestamp(value) {
    return (
      typeof value === 'string' &&
      TIMESTAMP_RE.test(value) &&
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

  function safeCode(error, fallback = 'REQUEST_FAILED') {
    let code;
    try {
      code = error?.code;
    } catch {
      return fallback;
    }
    return typeof code === 'string' && SAFE_CODES.has(code) ? code : fallback;
  }

  function isUnknownMutation(error) {
    try {
      return (
        error?.code === 'MUTATION_OUTCOME_UNKNOWN' ||
        error?.mutationState === 'unknown'
      );
    } catch {
      return false;
    }
  }

  function callAsPromise(callback) {
    let result;
    try {
      result = callback();
    } catch (error) {
      return Promise.reject(error);
    }
    let then;
    try {
      then = result?.then;
    } catch (error) {
      return Promise.reject(error);
    }
    if (typeof then !== 'function') {
      return Promise.reject(new TypeError('promise required'));
    }
    return Promise.resolve(result);
  }

  function assertHistoryItem(value) {
    if (
      !hasExactDataKeys(value, HISTORY_ITEM_KEYS) ||
      typeof value.session_id !== 'string' ||
      !UUID_RE.test(value.session_id) ||
      !isCanonicalTimestamp(value.started_at) ||
      typeof value.day !== 'string' ||
      !DAY_RE.test(value.day) ||
      !(value.title === null || typeof value.title === 'string') ||
      !Number.isSafeInteger(value.duration_min) ||
      value.duration_min < 1 ||
      value.duration_min > 1440 ||
      !Number.isSafeInteger(value.item_count) ||
      value.item_count < 1 ||
      value.item_count > 50 ||
      !isCanonicalRevision(value.revision)
    ) {
      fail('INVALID_HISTORY_PAGE');
    }
    return value;
  }

  function assertHistoryPage(value) {
    if (
      !hasExactDataKeys(value, HISTORY_PAGE_KEYS) ||
      value.schema_version !== PAGE_SCHEMA ||
      !Array.isArray(value.items) ||
      value.items.length > 20 ||
      typeof value.has_more !== 'boolean'
    ) {
      fail('INVALID_HISTORY_PAGE');
    }
    const itemIds = new Set();
    value.items.forEach((item) => {
      assertHistoryItem(item);
      if (itemIds.has(item.session_id)) fail('INVALID_HISTORY_PAGE');
      itemIds.add(item.session_id);
    });
    if (value.has_more) {
      if (
        value.items.length === 0 ||
        !hasExactDataKeys(value.next_cursor, CURSOR_KEYS) ||
        !isCanonicalTimestamp(value.next_cursor.started_at) ||
        typeof value.next_cursor.id !== 'string' ||
        !UUID_RE.test(value.next_cursor.id) ||
        value.next_cursor.started_at !== value.items.at(-1).started_at ||
        value.next_cursor.id !== value.items.at(-1).session_id
      ) {
        fail('INVALID_HISTORY_PAGE');
      }
    } else if (value.next_cursor !== null) {
      fail('INVALID_HISTORY_PAGE');
    }
    return value;
  }

  function readGuardOptions(value) {
    if (!isRecord(value) || !hasExactDataKeys(value, ['getRecovery', 'getSessionCommit'])) {
      fail('INVALID_GUARD_OPTIONS');
    }
    if (
      typeof value.getRecovery !== 'function' ||
      typeof value.getSessionCommit !== 'function'
    ) {
      fail('INVALID_GUARD_OPTIONS');
    }
    return value;
  }

  function readControllerState(getController, stateKeys) {
    const controller = getController();
    if (controller === null) return null;
    if (!isRecord(controller)) fail('GUARD_UNAVAILABLE');
    const descriptor = Object.getOwnPropertyDescriptor(controller, 'getState');
    if (
      !descriptor ||
      !Object.prototype.hasOwnProperty.call(descriptor, 'value') ||
      typeof descriptor.value !== 'function'
    ) {
      fail('GUARD_UNAVAILABLE');
    }
    const state = descriptor.value.call(controller);
    if (!hasExactDataKeys(state, stateKeys)) fail('GUARD_UNAVAILABLE');
    return state;
  }

  function isNullableCanonicalTimestamp(value) {
    return value === null || isCanonicalTimestamp(value);
  }

  function isNullableString(value) {
    return value === null || typeof value === 'string';
  }

  function isValidFocusTarget(value) {
    if (value === null) return true;
    if (
      !Object.isFrozen(value) ||
      !hasExactDataKeys(value, FOCUS_KEYS) ||
      !['session', 'item', 'set'].includes(value.scope) ||
      !(value.field_key === null || typeof value.field_key === 'string')
    ) {
      return false;
    }
    if (value.scope === 'session') {
      return value.item_key === null && value.set_order === null;
    }
    if (typeof value.item_key !== 'string' || !ITEM_KEY_RE.test(value.item_key)) {
      return false;
    }
    return value.scope === 'item'
      ? value.set_order === null
      : Number.isSafeInteger(value.set_order) && value.set_order >= 1;
  }

  function assertRecoveryState(value) {
    if (
      !Object.isFrozen(value) ||
      !RECOVERY_STATES.includes(value.state) ||
      !isNullableCanonicalTimestamp(value.started_at) ||
      !isNullableCanonicalTimestamp(value.saved_at) ||
      !Number.isSafeInteger(value.item_count) ||
      value.item_count < 0 ||
      value.item_count > 50 ||
      !isNullableString(value.reason)
    ) {
      fail('GUARD_UNAVAILABLE');
    }
    return value;
  }

  function assertCommitState(value) {
    if (
      !Object.isFrozen(value) ||
      !COMMIT_STATES.includes(value.state) ||
      !isNullableString(value.reason) ||
      !isValidFocusTarget(value.focus_target) ||
      typeof value.intent_present !== 'boolean'
    ) {
      fail('GUARD_UNAVAILABLE');
    }
    return value;
  }

  function createMutationGuard(optionsValue) {
    const options = readGuardOptions(optionsValue);

    function check() {
      try {
        const recoveryValue = readControllerState(
          options.getRecovery,
          RECOVERY_STATE_KEYS
        );
        const recovery =
          recoveryValue === null ? null : assertRecoveryState(recoveryValue);
        if (recovery !== null) {
          if (recovery.item_count > 0) {
            return deepFreeze({ allowed: false, reason: 'active_draft' });
          }
        }
        const commitValue = readControllerState(
          options.getSessionCommit,
          COMMIT_STATE_KEYS
        );
        const commit = commitValue === null ? null : assertCommitState(commitValue);
        if (commit !== null) {
          if (
            commit.intent_present ||
            !['editing', 'not_committed'].includes(commit.state)
          ) {
            return deepFreeze({ allowed: false, reason: 'commit_unresolved' });
          }
        }
        return deepFreeze({ allowed: true, reason: null });
      } catch {
        return deepFreeze({ allowed: false, reason: 'guard_unavailable' });
      }
    }

    return deepFreeze({ check });
  }

  function readCreateOptions(value) {
    if (
      !isRecord(value) ||
      !hasExactDataKeys(value, [
        'adapter',
        'createCorrection',
        'mutationGuard',
        'refreshLastPerformance'
      ])
    ) {
      fail('INVALID_OPTIONS');
    }
    const adapter = value.adapter;
    if (
      !isRecord(adapter) ||
      !hasExactDataKeys(adapter, ADAPTER_METHODS) ||
      ADAPTER_METHODS.some((method) => typeof adapter[method] !== 'function') ||
      typeof value.createCorrection !== 'function' ||
      typeof value.refreshLastPerformance !== 'function' ||
      !isRecord(value.mutationGuard) ||
      !hasExactDataKeys(value.mutationGuard, ['check']) ||
      typeof value.mutationGuard.check !== 'function'
    ) {
      fail('INVALID_OPTIONS');
    }
    return value;
  }

  function create(optionsValue) {
    const options = readCreateOptions(optionsValue);
    const {
      adapter,
      createCorrection,
      mutationGuard,
      refreshLastPerformance
    } = options;
    const subscribers = new Set();
    let destroyed = false;
    let epoch = 0;
    let historyEpoch = 0;
    let detailEpoch = 0;
    let mutationEpoch = 0;
    let mutationBusy = false;
    let admission = deepFreeze({ allowed: true, reason: null });
    let history = {
      status: 'idle',
      items: [],
      has_more: false,
      next_cursor: null,
      loading_more: false,
      error: null
    };
    let detail = {
      status: 'closed',
      session_id: null,
      value: null,
      error: null
    };
    let correction = {
      status: 'closed',
      working_copy: null,
      valid: false,
      dirty: false,
      error: null,
      close_confirmation: false,
      retry_mode: null,
      confirmation: null
    };
    let deletion = {
      status: 'closed',
      context: null,
      error: null,
      retry_mode: null,
      confirmation: null
    };
    let correctionController = null;
    let correctionPreimage = null;
    let pendingCorrectionRequest = null;
    let pendingCorrectionDesired = null;
    let pendingDeleteRequest = null;
    let pendingDeletePreimage = null;
    let pendingMutationRefresh = null;
    let stateSnapshot;

    function makeState() {
      stateSnapshot = deepFreeze({
        history: {
          ...history,
          items: [...history.items],
          next_cursor:
            history.next_cursor === null ? null : { ...history.next_cursor }
        },
        detail: { ...detail },
        correction: { ...correction },
        deletion: {
          ...deletion,
          context: deletion.context === null ? null : { ...deletion.context }
        },
        admission,
        mutation_busy: mutationBusy
      });
      return stateSnapshot;
    }

    function publish() {
      const next = makeState();
      [...subscribers].forEach((listener) => {
        try {
          listener(next);
        } catch {
          subscribers.delete(listener);
        }
      });
      return next;
    }

    function assertUsable() {
      if (destroyed) fail('CONTROLLER_DESTROYED');
    }

    function readAdmission() {
      let value;
      try {
        value = mutationGuard.check();
      } catch {
        value = null;
      }
      admission =
        hasExactDataKeys(value, ['allowed', 'reason']) &&
        typeof value.allowed === 'boolean' &&
        [null, 'active_draft', 'commit_unresolved', 'guard_unavailable'].includes(
          value.reason
        ) &&
        ((value.allowed && value.reason === null) ||
          (!value.allowed && value.reason !== null))
          ? deepFreeze({ allowed: value.allowed, reason: value.reason })
          : deepFreeze({ allowed: false, reason: 'guard_unavailable' });
      return admission;
    }

    function requireAdmission(kind) {
      const current = readAdmission();
      if (current.allowed) return true;
      if (kind === 'correction') {
        correction = {
          ...correction,
          status: correctionController ? correction.status : 'error',
          error: 'MUTATION_BLOCKED',
          retry_mode: null
        };
      } else {
        deletion = {
          ...deletion,
          status: deletion.context ? 'error' : 'closed',
          error: 'MUTATION_BLOCKED',
          retry_mode: null
        };
      }
      publish();
      return false;
    }

    function getState() {
      assertUsable();
      return stateSnapshot;
    }

    function subscribe(listener) {
      assertUsable();
      if (typeof listener !== 'function') fail('INVALID_LISTENER');
      let active = true;
      try {
        listener(stateSnapshot);
        subscribers.add(listener);
      } catch {
        active = false;
      }
      return function unsubscribe() {
        if (!active) return;
        active = false;
        subscribers.delete(listener);
      };
    }

    async function refreshHistory() {
      assertUsable();
      if (mutationBusy) fail('INVALID_STATE');
      const operationEpoch = ++historyEpoch;
      history = {
        ...history,
        status: 'loading',
        loading_more: false,
        error: null
      };
      publish();
      try {
        const page = assertHistoryPage(
          await callAsPromise(() =>
            adapter.listSessions({ limit: 20, cursor: null })
          )
        );
        if (destroyed || operationEpoch !== historyEpoch) return stateSnapshot;
        history = {
          status: page.items.length === 0 ? 'empty' : 'ready',
          items: [...page.items],
          has_more: page.has_more,
          next_cursor: page.next_cursor,
          loading_more: false,
          error: null
        };
      } catch (error) {
        if (destroyed || operationEpoch !== historyEpoch) return stateSnapshot;
        history = {
          ...history,
          status: 'error',
          loading_more: false,
          error: safeCode(error)
        };
      }
      return publish();
    }

    async function loadMore() {
      assertUsable();
      if (
        mutationBusy ||
        history.status !== 'ready' ||
        !history.has_more ||
        history.loading_more ||
        history.next_cursor === null
      ) {
        fail('INVALID_STATE');
      }
      const operationEpoch = ++historyEpoch;
      const cursor = history.next_cursor;
      history = { ...history, loading_more: true, error: null };
      publish();
      try {
        const page = assertHistoryPage(
          await callAsPromise(() =>
            adapter.listSessions({ limit: 20, cursor })
          )
        );
        if (destroyed || operationEpoch !== historyEpoch) return stateSnapshot;
        const known = new Set(history.items.map((item) => item.session_id));
        if (page.items.some((item) => known.has(item.session_id))) {
          fail('INVALID_HISTORY_PAGE');
        }
        history = {
          status: 'ready',
          items: [...history.items, ...page.items],
          has_more: page.has_more,
          next_cursor: page.next_cursor,
          loading_more: false,
          error: null
        };
      } catch (error) {
        if (destroyed || operationEpoch !== historyEpoch) return stateSnapshot;
        history = {
          ...history,
          status: 'ready',
          loading_more: false,
          error: safeCode(error)
        };
      }
      return publish();
    }

    function resetMutationViews() {
      correctionController = null;
      correctionPreimage = null;
      pendingCorrectionRequest = null;
      pendingCorrectionDesired = null;
      pendingDeleteRequest = null;
      pendingDeletePreimage = null;
      pendingMutationRefresh = null;
      correction = {
        status: 'closed',
        working_copy: null,
        valid: false,
        dirty: false,
        error: null,
        close_confirmation: false,
        retry_mode: null,
        confirmation: null
      };
      deletion = {
        status: 'closed',
        context: null,
        error: null,
        retry_mode: null,
        confirmation: null
      };
    }

    async function openDetail(sessionId) {
      assertUsable();
      if (mutationBusy) fail('INVALID_STATE');
      if (typeof sessionId !== 'string' || !UUID_RE.test(sessionId)) {
        fail('INVALID_SESSION');
      }
      const operationEpoch = ++detailEpoch;
      resetMutationViews();
      detail = {
        status: 'loading',
        session_id: sessionId,
        value: null,
        error: null
      };
      publish();
      try {
        const value = await callAsPromise(() =>
          adapter.loadSessionDetail(sessionId)
        );
        if (destroyed || operationEpoch !== detailEpoch) return stateSnapshot;
        detail = value === null
          ? {
              status: 'not_found',
              session_id: sessionId,
              value: null,
              error: null
            }
          : {
              status: 'ready',
              session_id: sessionId,
              value: deepFreeze(value),
              error: null
            };
      } catch (error) {
        if (destroyed || operationEpoch !== detailEpoch) return stateSnapshot;
        detail = {
          status: 'error',
          session_id: sessionId,
          value: null,
          error: safeCode(error)
        };
      }
      return publish();
    }

    function closeDetail() {
      assertUsable();
      if (mutationBusy) return false;
      if (correctionController && correction.dirty) {
        correction = { ...correction, close_confirmation: true };
        publish();
        return false;
      }
      detailEpoch += 1;
      resetMutationViews();
      detail = {
        status: 'closed',
        session_id: null,
        value: null,
        error: null
      };
      publish();
      return true;
    }

    function syncCorrection(overrides = {}) {
      const model = correctionController.getState();
      correction = {
        status: model.status,
        working_copy: model.workingCopy,
        valid: model.valid,
        dirty: model.status === 'dirty',
        error: null,
        close_confirmation: false,
        retry_mode: null,
        confirmation: null,
        ...overrides
      };
      return publish();
    }

    function openCorrection() {
      assertUsable();
      if (mutationBusy) fail('INVALID_STATE');
      if (detail.status !== 'ready' || !detail.value) fail('INVALID_STATE');
      if (!requireAdmission('correction')) return false;
      try {
        correctionController = createCorrection(detail.value);
        const initial = correctionController.getState();
        correctionPreimage = initial.canonicalContent;
        syncCorrection();
        return true;
      } catch {
        correctionController = null;
        correction = {
          ...correction,
          status: 'error',
          error: 'INVALID_CORRECTION'
        };
        publish();
        return false;
      }
    }

    function mutateCorrection(method, args) {
      assertUsable();
      if (!correctionController || mutationBusy || pendingMutationRefresh) {
        fail('INVALID_STATE');
      }
      try {
        correctionController[method](...args);
        syncCorrection();
      } catch (error) {
        correction = {
          ...correction,
          status: 'error',
          error:
            typeof error?.code === 'string' ? error.code : 'INVALID_CORRECTION',
          close_confirmation: false,
          retry_mode: null,
          confirmation: null
        };
        publish();
      }
      return stateSnapshot;
    }

    const setCorrectionDurationMin = (value) =>
      mutateCorrection('setDurationMin', [value]);
    const setCorrectionNote = (value) =>
      mutateCorrection('setNote', [value]);
    const addCorrectionItem = (itemKey) =>
      mutateCorrection('addItem', [itemKey]);
    const removeCorrectionItem = (itemKey) =>
      mutateCorrection('removeItem', [itemKey]);
    const moveCorrectionItem = (itemKey, targetOrder) =>
      mutateCorrection('moveItem', [itemKey, targetOrder]);
    const setCorrectionItemField = (itemKey, fieldKey, value) =>
      mutateCorrection('setItemField', [itemKey, fieldKey, value]);
    const addCorrectionSet = (itemKey) =>
      mutateCorrection('addSet', [itemKey]);
    const removeCorrectionSet = (itemKey, setOrder) =>
      mutateCorrection('removeSet', [itemKey, setOrder]);
    const setCorrectionSetField = (itemKey, setOrder, fieldKey, value) =>
      mutateCorrection('setSetField', [itemKey, setOrder, fieldKey, value]);

    function requestCloseCorrection() {
      assertUsable();
      if (mutationBusy) return false;
      if (!correctionController) return true;
      if (correction.dirty && !['confirmed'].includes(correction.status)) {
        correction = { ...correction, close_confirmation: true };
        publish();
        return false;
      }
      resetMutationViews();
      publish();
      return true;
    }

    function cancelCloseCorrection() {
      assertUsable();
      if (!correctionController) fail('INVALID_STATE');
      correction = { ...correction, close_confirmation: false };
      return publish();
    }

    function confirmCloseCorrection() {
      assertUsable();
      if (!correctionController || !correction.close_confirmation) {
        fail('INVALID_STATE');
      }
      resetMutationViews();
      return publish();
    }

    function canonicalForDetail(value) {
      return createCorrection(value).getState().canonicalContent;
    }

    function sameContent(left, right) {
      try {
        return JSON.stringify(left) === JSON.stringify(right);
      } catch {
        return false;
      }
    }

    function itemKeysFromContent(value) {
      if (!isRecord(value) || !Array.isArray(value.items)) {
        throw new TypeError('invalid item content');
      }
      const keys = value.items.map((item) => item?.item_key);
      if (
        keys.length < 1 ||
        keys.length > 50 ||
        keys.some((itemKey) => typeof itemKey !== 'string' || !ITEM_KEY_RE.test(itemKey)) ||
        new Set(keys).size !== keys.length
      ) {
        throw new TypeError('invalid item keys');
      }
      return keys;
    }

    function itemKeyUnion(left, right) {
      const known = new Set();
      return [...left, ...right].filter((itemKey) => {
        if (known.has(itemKey)) return false;
        known.add(itemKey);
        return true;
      });
    }

    function assertRefreshResult(value, expectedKeys) {
      if (
        !hasExactDataKeys(value, ['status', 'items']) ||
        !['success', 'error'].includes(value.status) ||
        !hasExactDenseDataArray(value.items, expectedKeys.length)
      ) {
        throw new TypeError('invalid refresh result');
      }
      const hasError = value.items.some((item, index) => {
        if (
          !hasExactDataKeys(item, ['item_key', 'status']) ||
          item.item_key !== expectedKeys[index] ||
          !['success', 'empty', 'error', 'invalidated'].includes(item.status)
        ) {
          throw new TypeError('invalid refresh item');
        }
        return item.status === 'error';
      });
      if (value.status !== (hasError ? 'error' : 'success')) {
        throw new TypeError('inconsistent refresh result');
      }
      if (hasError) throw new TypeError('last performance refresh failed');
      return value;
    }

    function assertSummaryMatchesDetail(summary, current) {
      if (!summary) return;
      if (
        summary.session_id !== current.session_id ||
        summary.started_at !== current.started_at ||
        summary.day !== current.day ||
        summary.title !== current.title ||
        summary.duration_min !== current.duration_min ||
        summary.item_count !== current.items.length ||
        summary.revision !== current.revision
      ) {
        throw new TypeError('history and detail disagree');
      }
    }

    function startRefreshState(context) {
      historyEpoch += 1;
      detailEpoch += 1;
      history = {
        status: 'loading',
        items: [],
        has_more: false,
        next_cursor: null,
        loading_more: false,
        error: null
      };
      detail = {
        status: 'loading',
        session_id: context.sessionId,
        value: null,
        error: null
      };
      if (context.operation === 'replace') {
        correction = {
          ...correction,
          status: 'refreshing',
          error: null,
          retry_mode: null,
          confirmation: context.confirmation
        };
      } else {
        deletion = {
          ...deletion,
          status: 'refreshing',
          error: null,
          retry_mode: null,
          confirmation: context.confirmation
        };
      }
      publish();
    }

    function failMutationRefresh(context) {
      history = {
        status: 'error',
        items: [],
        has_more: false,
        next_cursor: null,
        loading_more: false,
        error: 'REQUEST_FAILED'
      };
      detail = {
        status: 'error',
        session_id: context.sessionId,
        value: null,
        error: 'REQUEST_FAILED'
      };
      if (context.operation === 'replace') {
        correction = {
          ...correction,
          status: 'error',
          error: 'POST_MUTATION_REFRESH_FAILED',
          retry_mode: 'refresh',
          confirmation: context.confirmation
        };
      } else {
        deletion = {
          ...deletion,
          status: 'error',
          error: 'POST_MUTATION_REFRESH_FAILED',
          retry_mode: 'refresh',
          confirmation: context.confirmation
        };
      }
      return publish();
    }

    async function refreshMutationConsumers(context, operationEpoch) {
      pendingMutationRefresh = context;
      startRefreshState(context);
      try {
        const [pageValue, current] = await Promise.all([
          callAsPromise(() => adapter.listSessions({ limit: 20, cursor: null })),
          callAsPromise(() => adapter.loadSessionDetail(context.sessionId))
        ]);
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        const page = assertHistoryPage(pageValue);
        const summary = page.items.find(
          (item) => item.session_id === context.sessionId
        );
        let nextDetail;
        let affectedKeys;
        if (context.operation === 'replace') {
          if (current === null) throw new TypeError('updated session missing');
          const currentCanonical = canonicalForDetail(current);
          if (
            current.revision !== context.expectedRevision ||
            current.content_fingerprint !== context.expectedContentFingerprint ||
            !sameContent(currentCanonical, context.expectedContent)
          ) {
            throw new TypeError('updated session drift');
          }
          assertSummaryMatchesDetail(summary, current);
          affectedKeys = itemKeyUnion(
            context.oldItemKeys,
            itemKeysFromContent(currentCanonical)
          );
          nextDetail = {
            status: 'ready',
            session_id: current.session_id,
            value: deepFreeze(current),
            error: null
          };
        } else {
          if (current !== null || summary) {
            throw new TypeError('deleted session still visible');
          }
          affectedKeys = [...context.oldItemKeys];
          nextDetail = {
            status: 'not_found',
            session_id: context.sessionId,
            value: null,
            error: null
          };
        }
        const refreshResult = await callAsPromise(() =>
          refreshLastPerformance(affectedKeys)
        );
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        assertRefreshResult(refreshResult, affectedKeys);
        history = {
          status: page.items.length === 0 ? 'empty' : 'ready',
          items: [...page.items],
          has_more: page.has_more,
          next_cursor: page.next_cursor,
          loading_more: false,
          error: null
        };
        detail = nextDetail;
        if (context.operation === 'replace') {
          correction = {
            ...correction,
            status: 'confirmed',
            error: null,
            retry_mode: null,
            confirmation: context.confirmation
          };
        } else {
          deletion = {
            ...deletion,
            status: 'confirmed',
            error: null,
            retry_mode: null,
            confirmation: context.confirmation
          };
        }
        pendingMutationRefresh = null;
        return publish();
      } catch {
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        return failMutationRefresh(context);
      }
    }

    async function reconcileCorrection(operationEpoch) {
      let current;
      try {
        current = await callAsPromise(() =>
          adapter.loadSessionDetail(pendingCorrectionRequest.sessionId)
        );
      } catch {
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        correction = {
          ...correction,
          status: 'error',
          error: 'RECONCILIATION_FAILED',
          retry_mode: 'reconcile'
        };
        return publish();
      }
      if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
      if (current === null) {
        correction = {
          ...correction,
          status: 'conflict',
          error: 'SESSION_NOT_FOUND',
          retry_mode: null
        };
        return publish();
      }
      let currentCanonical;
      try {
        currentCanonical = canonicalForDetail(current);
      } catch {
        correction = {
          ...correction,
          status: 'error',
          error: 'RECONCILIATION_FAILED',
          retry_mode: 'reconcile'
        };
        return publish();
      }
      if (sameContent(currentCanonical, pendingCorrectionDesired)) {
        return await refreshMutationConsumers(
          deepFreeze({
            operation: 'replace',
            sessionId: current.session_id,
            oldItemKeys: itemKeysFromContent(correctionPreimage),
            expectedRevision: current.revision,
            expectedContentFingerprint: current.content_fingerprint,
            expectedContent: pendingCorrectionDesired,
            confirmation: 'reconciled'
          }),
          operationEpoch
        );
      } else if (sameContent(currentCanonical, correctionPreimage)) {
        correction = {
          ...correction,
          status: 'error',
          error: 'MUTATION_NOT_APPLIED',
          retry_mode: 'redispatch'
        };
      } else {
        detail = {
          status: 'ready',
          session_id: current.session_id,
          value: deepFreeze(current),
          error: null
        };
        correction = {
          ...correction,
          status: 'conflict',
          error: 'SESSION_CONFLICT',
          retry_mode: null
        };
      }
      return publish();
    }

    async function dispatchCorrection(request, desired) {
      if (!requireAdmission('correction')) return stateSnapshot;
      const operationEpoch = ++mutationEpoch;
      mutationBusy = true;
      pendingCorrectionRequest = request;
      pendingCorrectionDesired = desired;
      correction = {
        ...correction,
        status: 'saving',
        error: null,
        close_confirmation: false,
        retry_mode: null,
        confirmation: null
      };
      publish();
      try {
        const result = await callAsPromise(() => adapter.replaceSession(request));
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        if (
          !isRecord(result) ||
          !['updated', 'replayed'].includes(result.outcome)
        ) {
          throw new TypeError('invalid replacement result');
        }
        return await refreshMutationConsumers(
          deepFreeze({
            operation: 'replace',
            sessionId: request.sessionId,
            oldItemKeys: itemKeysFromContent(correctionPreimage),
            expectedRevision: result.revision,
            expectedContentFingerprint: result.content_fingerprint,
            expectedContent: desired,
            confirmation: result.outcome
          }),
          operationEpoch
        );
      } catch (error) {
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        const code = safeCode(error);
        if (isUnknownMutation(error)) {
          correction = {
            ...correction,
            status: 'reconciling',
            error: null,
            retry_mode: null
          };
          publish();
          return await reconcileCorrection(operationEpoch);
        }
        correction = {
          ...correction,
          status:
            code === 'SESSION_CONFLICT' || code === 'SESSION_NOT_FOUND'
              ? 'conflict'
              : 'error',
          error: code,
          retry_mode: null
        };
        return publish();
      } finally {
        if (!destroyed && operationEpoch === mutationEpoch) {
          mutationBusy = false;
          publish();
        }
      }
    }

    function saveCorrection() {
      assertUsable();
      if (!correctionController || mutationBusy || pendingMutationRefresh) {
        fail('INVALID_STATE');
      }
      const model = correctionController.getState();
      if (!model.valid || model.status !== 'dirty' || !model.mutationRequest) {
        correction = {
          ...correction,
          status: 'error',
          error: 'INVALID_CORRECTION',
          retry_mode: null
        };
        publish();
        return Promise.resolve(stateSnapshot);
      }
      return dispatchCorrection(model.mutationRequest, model.canonicalContent);
    }

    function retryMutationRefresh(operation) {
      if (!pendingMutationRefresh || pendingMutationRefresh.operation !== operation) {
        fail('INVALID_STATE');
      }
      const operationEpoch = ++mutationEpoch;
      mutationBusy = true;
      return refreshMutationConsumers(
        pendingMutationRefresh,
        operationEpoch
      ).finally(() => {
        if (!destroyed && operationEpoch === mutationEpoch) {
          mutationBusy = false;
          publish();
        }
      });
    }

    function retryCorrection() {
      assertUsable();
      if (!correctionController || mutationBusy || correction.retry_mode === null) {
        fail('INVALID_STATE');
      }
      if (correction.retry_mode === 'reconcile') {
        if (!requireAdmission('correction')) return Promise.resolve(stateSnapshot);
        const operationEpoch = ++mutationEpoch;
        mutationBusy = true;
        correction = {
          ...correction,
          status: 'reconciling',
          error: null,
          retry_mode: null
        };
        publish();
        return reconcileCorrection(operationEpoch).finally(() => {
          if (!destroyed && operationEpoch === mutationEpoch) {
            mutationBusy = false;
            publish();
          }
        });
      }
      if (correction.retry_mode === 'refresh') {
        return retryMutationRefresh('replace');
      }
      return dispatchCorrection(
        pendingCorrectionRequest,
        pendingCorrectionDesired
      );
    }

    function openDelete() {
      assertUsable();
      if (mutationBusy) fail('INVALID_STATE');
      if (detail.status !== 'ready' || !detail.value || correctionController) {
        fail('INVALID_STATE');
      }
      if (!requireAdmission('delete')) return false;
      const value = detail.value;
      let itemKeys;
      try {
        itemKeys = itemKeysFromContent(value);
      } catch {
        fail('INVALID_STATE');
      }
      deletion = {
        status: 'confirming',
        context: {
          session_id: value.session_id,
          day: value.day,
          item_count: value.items.length
        },
        error: null,
        retry_mode: null,
        confirmation: null
      };
      pendingDeleteRequest = {
        sessionId: value.session_id,
        expectedRevision: value.revision,
        expectedContentFingerprint: value.content_fingerprint
      };
      pendingDeletePreimage = {
        revision: value.revision,
        content_fingerprint: value.content_fingerprint,
        item_keys: itemKeys
      };
      publish();
      return true;
    }

    function closeDelete() {
      assertUsable();
      if (mutationBusy || deletion.status === 'deleting') return false;
      deletion = {
        status: 'closed',
        context: null,
        error: null,
        retry_mode: null,
        confirmation: null
      };
      pendingDeleteRequest = null;
      pendingDeletePreimage = null;
      pendingMutationRefresh = null;
      publish();
      return true;
    }

    async function reconcileDelete(operationEpoch) {
      let current;
      try {
        current = await callAsPromise(() =>
          adapter.loadSessionDetail(pendingDeleteRequest.sessionId)
        );
      } catch {
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        deletion = {
          ...deletion,
          status: 'error',
          error: 'RECONCILIATION_FAILED',
          retry_mode: 'reconcile'
        };
        return publish();
      }
      if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
      if (current === null) {
        return await refreshMutationConsumers(
          deepFreeze({
            operation: 'delete',
            sessionId: pendingDeleteRequest.sessionId,
            oldItemKeys: [...pendingDeletePreimage.item_keys],
            expectedRevision: null,
            expectedContentFingerprint: null,
            expectedContent: null,
            confirmation: 'reconciled_absent'
          }),
          operationEpoch
        );
      } else if (
        current.revision === pendingDeletePreimage.revision &&
        current.content_fingerprint === pendingDeletePreimage.content_fingerprint
      ) {
        deletion = {
          ...deletion,
          status: 'error',
          error: 'MUTATION_NOT_APPLIED',
          retry_mode: 'redispatch'
        };
      } else {
        detail = {
          status: 'ready',
          session_id: current.session_id,
          value: deepFreeze(current),
          error: null
        };
        deletion = {
          ...deletion,
          status: 'conflict',
          error: 'SESSION_CONFLICT',
          retry_mode: null
        };
      }
      return publish();
    }

    async function dispatchDelete(request) {
      if (!requireAdmission('delete')) return stateSnapshot;
      const operationEpoch = ++mutationEpoch;
      mutationBusy = true;
      deletion = {
        ...deletion,
        status: 'deleting',
        error: null,
        retry_mode: null,
        confirmation: null
      };
      publish();
      await Promise.resolve();
      if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
      if (!requireAdmission('delete')) {
        mutationBusy = false;
        return publish();
      }
      try {
        const result = await callAsPromise(() => adapter.deleteSession(request));
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        if (
          !isRecord(result) ||
          !['deleted', 'already_absent'].includes(result.outcome)
        ) {
          throw new TypeError('invalid delete result');
        }
        return await refreshMutationConsumers(
          deepFreeze({
            operation: 'delete',
            sessionId: request.sessionId,
            oldItemKeys: [...pendingDeletePreimage.item_keys],
            expectedRevision: null,
            expectedContentFingerprint: null,
            expectedContent: null,
            confirmation: result.outcome
          }),
          operationEpoch
        );
      } catch (error) {
        if (destroyed || operationEpoch !== mutationEpoch) return stateSnapshot;
        const code = safeCode(error);
        if (isUnknownMutation(error)) {
          deletion = {
            ...deletion,
            status: 'reconciling',
            error: null,
            retry_mode: null
          };
          publish();
          return await reconcileDelete(operationEpoch);
        }
        deletion = {
          ...deletion,
          status: code === 'SESSION_CONFLICT' ? 'conflict' : 'error',
          error: code,
          retry_mode: null
        };
        return publish();
      } finally {
        if (!destroyed && operationEpoch === mutationEpoch) {
          mutationBusy = false;
          publish();
        }
      }
    }

    async function confirmDelete() {
      assertUsable();
      if (
        mutationBusy ||
        deletion.status !== 'confirming' ||
        !pendingDeleteRequest
      ) {
        fail('INVALID_STATE');
      }
      if (!requireAdmission('delete')) return stateSnapshot;
      return await dispatchDelete(pendingDeleteRequest);
    }

    function retryDelete() {
      assertUsable();
      if (mutationBusy || deletion.retry_mode === null || !pendingDeleteRequest) {
        fail('INVALID_STATE');
      }
      if (deletion.retry_mode === 'reconcile') {
        if (!requireAdmission('delete')) return Promise.resolve(stateSnapshot);
        const operationEpoch = ++mutationEpoch;
        mutationBusy = true;
        deletion = {
          ...deletion,
          status: 'reconciling',
          error: null,
          retry_mode: null
        };
        publish();
        return reconcileDelete(operationEpoch).finally(() => {
          if (!destroyed && operationEpoch === mutationEpoch) {
            mutationBusy = false;
            publish();
          }
        });
      }
      if (deletion.retry_mode === 'refresh') {
        return retryMutationRefresh('delete');
      }
      return dispatchDelete(pendingDeleteRequest);
    }

    function refreshAdmission() {
      assertUsable();
      readAdmission();
      return publish();
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      epoch += 1;
      historyEpoch += 1;
      detailEpoch += 1;
      mutationEpoch += 1;
      mutationBusy = false;
      subscribers.clear();
      correctionController = null;
      pendingCorrectionRequest = null;
      pendingCorrectionDesired = null;
      pendingDeleteRequest = null;
      pendingDeletePreimage = null;
      pendingMutationRefresh = null;
      void epoch;
    }

    makeState();
    return deepFreeze({
      getState,
      subscribe,
      refreshHistory,
      loadMore,
      openDetail,
      closeDetail,
      openCorrection,
      setCorrectionDurationMin,
      setCorrectionNote,
      addCorrectionItem,
      removeCorrectionItem,
      moveCorrectionItem,
      setCorrectionItemField,
      addCorrectionSet,
      removeCorrectionSet,
      setCorrectionSetField,
      requestCloseCorrection,
      cancelCloseCorrection,
      confirmCloseCorrection,
      saveCorrection,
      retryCorrection,
      openDelete,
      closeDelete,
      confirmDelete,
      retryDelete,
      refreshAdmission,
      destroy
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
  if ('sessionHistory' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionHistory is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.defineProperty(root.AppModules.activityV2, 'sessionHistory', {
    value: deepFreeze({ create, createMutationGuard }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
