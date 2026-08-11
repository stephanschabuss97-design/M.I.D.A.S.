'use strict';

(function initActivityV2SessionRecovery(root) {
  const DATABASE_NAME = 'midas_activity_v2_recovery';
  const DATABASE_VERSION = 1;
  const STORE_NAME = 'session_recovery';
  const SLOT_KEY = 'active_session';
  const RECOVERY_SCHEMA_VERSION_V1 = 'midas.activity-session-recovery.v1';
  const RECOVERY_SCHEMA_VERSION_V2 = 'midas.activity-session-recovery.v2';
  const DRAFT_SCHEMA_VERSION = 'midas.activity-session-draft.v3';
  const COMMIT_INTENT_SCHEMA_VERSION =
    'midas.activity-session-commit-intent.v1';
  const COMMIT_ATTEMPT_SCHEMA_VERSION =
    'midas.activity-session-commit-attempt.v1';
  const PAYLOAD_SCHEMA_VERSION = 'midas.activity-session.v1';
  const SAFE_MESSAGE =
    'The activity session recovery operation could not be completed.';
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const STORE_OPTION_KEYS = Object.freeze(['indexedDB']);
  const OPEN_OPTION_KEYS = Object.freeze([
    'storage',
    'semantics',
    'resolveSemantics',
    'now',
    'createRequestId',
    'createLeaseToken',
    'enqueue'
  ]);
  const STORE_METHOD_KEYS = Object.freeze(['read', 'save', 'discard', 'close']);
  const RECOVERY_METHOD_KEYS = Object.freeze([
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
  const DRAFT_METHOD_KEYS = Object.freeze([
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
  const MUTATION_METHOD_KEYS = Object.freeze([
    'addItem',
    'removeItem',
    'moveItem',
    'setNote',
    'addSet',
    'removeSet',
    'setSetField',
    'setItemField'
  ]);
  const RECORD_KEYS_V1 = Object.freeze([
    'slot_key',
    'recovery_schema_version',
    'slot_generation',
    'write_sequence',
    'lease_token',
    'request_id',
    'persisted_revision',
    'saved_at',
    'draft'
  ]);
  const RECORD_KEYS_V2 = Object.freeze([
    ...RECORD_KEYS_V1,
    'commit_intent',
    'commit_attempt'
  ]);
  const COMMIT_INTENT_KEYS = Object.freeze([
    'commit_intent_schema_version',
    'request_id',
    'draft_revision',
    'catalog_version',
    'prepared_at',
    'payload'
  ]);
  const COMMIT_ATTEMPT_KEYS = Object.freeze([
    'commit_attempt_schema_version',
    'attempt_number',
    'attempt_token'
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
  const OBSERVATION_KEYS = Object.freeze(['kind', 'value']);
  const STATE_KEYS = Object.freeze([
    'state',
    'started_at',
    'saved_at',
    'item_count',
    'reason'
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
  const JSON_NODE_LIMIT = 50000;
  const JSON_DEPTH_LIMIT = 100;
  const ITEM_LIMIT = 50;
  const SET_LIMIT = 50;
  const NOTE_LIMIT = 500;
  const MAX_SESSION_DURATION_MIN = 1440;
  const INTEGER_RE = /^[0-9]+$/;
  const DECIMAL_RE = /^[0-9]+(?:[,.][0-9]+)?$/;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const CANONICAL_COMMIT_TIMESTAMP_RE =
    /^(\d{4})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const CANCELED_WRITE = Object.freeze({ canceled: true });

  class ActivityV2SessionRecoveryError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionRecoveryError';
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

  function fail(code) {
    throw new ActivityV2SessionRecoveryError(code);
  }

  function makeError(code) {
    return new ActivityV2SessionRecoveryError(code);
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

  function assertCanonicalUuid(value, code) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) fail(code);
    return value;
  }

  function isCanonicalTimestamp(value) {
    if (typeof value !== 'string') return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString() === value;
  }

  function cloneJsonCompatible(value) {
    const seen = new WeakSet();
    let nodes = 0;

    function clone(current, depth) {
      nodes += 1;
      if (nodes > JSON_NODE_LIMIT || depth > JSON_DEPTH_LIMIT) {
        throw new TypeError('unsafe value');
      }
      if (
        current === null ||
        typeof current === 'string' ||
        typeof current === 'boolean'
      ) {
        return current;
      }
      if (typeof current === 'number') {
        if (!Number.isFinite(current)) throw new TypeError('unsafe value');
        return current;
      }
      if (typeof current !== 'object' || seen.has(current)) {
        throw new TypeError('unsafe value');
      }
      seen.add(current);

      if (Array.isArray(current)) {
        const keys = Reflect.ownKeys(current);
        if (
          keys.length !== current.length + 1 ||
          keys[keys.length - 1] !== 'length' ||
          !keys.slice(0, -1).every((key, index) => key === String(index))
        ) {
          throw new TypeError('unsafe value');
        }
        return current.map((entry) => clone(entry, depth + 1));
      }

      if (Object.prototype.toString.call(current) !== '[object Object]') {
        throw new TypeError('unsafe value');
      }

      const descriptors = Object.getOwnPropertyDescriptors(current);
      const keys = Reflect.ownKeys(current);
      if (
        keys.some(
          (key) =>
            typeof key !== 'string' ||
            !descriptors[key] ||
            !hasOwn(descriptors[key], 'value') ||
            descriptors[key].enumerable !== true
        )
      ) {
        throw new TypeError('unsafe value');
      }
      const result = {};
      keys.forEach((key) => {
        Object.defineProperty(result, key, {
          value: clone(descriptors[key].value, depth + 1),
          enumerable: true,
          writable: true,
          configurable: true
        });
      });
      return result;
    }

    return clone(value, 0);
  }

  function protectedJsonClone(value, code = 'STORAGE_ERROR') {
    try {
      return deepFreeze(cloneJsonCompatible(value));
    } catch {
      fail(code);
    }
  }

  function structurallyEqual(left, right, seen = new WeakMap()) {
    if (Object.is(left, right)) return true;
    if (
      left === null ||
      right === null ||
      typeof left !== 'object' ||
      typeof right !== 'object' ||
      Array.isArray(left) !== Array.isArray(right)
    ) {
      return false;
    }
    if (seen.get(left) === right) return true;
    seen.set(left, right);
    const leftKeys = Reflect.ownKeys(left);
    const rightKeys = Reflect.ownKeys(right);
    if (
      leftKeys.length !== rightKeys.length ||
      leftKeys.some((key) => !rightKeys.includes(key))
    ) {
      return false;
    }
    return leftKeys.every((key) =>
      structurallyEqual(left[key], right[key], seen)
    );
  }

  function createObservation(value, issuedObservations) {
    const observation =
      value === undefined
        ? deepFreeze({ kind: 'missing', value: null })
        : deepFreeze({ kind: 'record', value: protectedJsonClone(value) });
    if (issuedObservations) issuedObservations.add(observation);
    return observation;
  }

  function validateObservationShape(observation) {
    if (!hasExactOrderedKeys(observation, OBSERVATION_KEYS)) {
      fail('INVALID_OBSERVATION');
    }
    if (observation.kind === 'missing' && observation.value === null) {
      return observation;
    }
    if (observation.kind !== 'record') fail('INVALID_OBSERVATION');
    protectedJsonClone(observation.value, 'INVALID_OBSERVATION');
    return observation;
  }

  function isDenseArray(value) {
    if (!Array.isArray(value)) return false;
    const keys = Reflect.ownKeys(value);
    return (
      keys.length === value.length + 1 &&
      keys[keys.length - 1] === 'length' &&
      keys.slice(0, -1).every((key, index) => key === String(index))
    );
  }

  function isNullableFiniteNonnegative(value) {
    return value === null ||
      (typeof value === 'number' && Number.isFinite(value) && value >= 0);
  }

  function isNullableSafeNonnegativeInteger(value) {
    return value === null ||
      (Number.isSafeInteger(value) && value >= 0);
  }

  function isCanonicalCommitTimestamp(value) {
    const match =
      typeof value === 'string' ? CANONICAL_COMMIT_TIMESTAMP_RE.exec(value) : null;
    return Boolean(
      match &&
      match[1] !== '0000' &&
      isCanonicalTimestamp(value)
    );
  }

  function textLength(value) {
    return Array.from(value).length;
  }

  function normalizedDraftNumber(value, integer) {
    if (value === null) return null;
    if (
      typeof value !== 'string' ||
      !(integer ? INTEGER_RE : DECIMAL_RE).test(value)
    ) {
      return NaN;
    }
    return Number(integer ? value : value.replace(',', '.'));
  }

  function normalizedItemNote(value) {
    if (value === null) return null;
    if (typeof value !== 'string' || textLength(value) > NOTE_LIMIT) return undefined;
    const normalized = value.replace(/^[\u0009-\u000d\u0020]+|[\u0009-\u000d\u0020]+$/g, '');
    return normalized === '' ? null : normalized;
  }

  function validateCommitAttemptValue(attempt, code = 'INVALID_COMMIT_ATTEMPT') {
    attempt = protectedJsonClone(attempt, code);
    if (
      !hasExactOrderedKeys(attempt, COMMIT_ATTEMPT_KEYS) ||
      attempt.commit_attempt_schema_version !== COMMIT_ATTEMPT_SCHEMA_VERSION ||
      !Number.isSafeInteger(attempt.attempt_number) ||
      attempt.attempt_number < 1 ||
      typeof attempt.attempt_token !== 'string' ||
      !UUID_RE.test(attempt.attempt_token)
    ) {
      fail(code);
    }
    return attempt;
  }

  function validatePayloadItem(item, draftItem, itemIndex) {
    if (
      !hasExactOrderedKeys(item, PAYLOAD_ITEM_KEYS) ||
      item.item_key !== draftItem?.item_key ||
      typeof item.item_key !== 'string' ||
      !ITEM_KEY_RE.test(item.item_key) ||
      item.item_order !== itemIndex + 1 ||
      !isNullableSafeNonnegativeInteger(item.duration_min) ||
      !isNullableFiniteNonnegative(item.distance_km) ||
      !(item.note === null || typeof item.note === 'string') ||
      item.note !== normalizedItemNote(draftItem?.note) ||
      item.duration_min !== normalizedDraftNumber(draftItem?.duration_min, true) ||
      item.distance_km !== normalizedDraftNumber(draftItem?.distance_km, false) ||
      !isDenseArray(item.sets) ||
      item.sets.length > SET_LIMIT ||
      item.sets.length !== draftItem?.sets?.length
    ) {
      return false;
    }
    return item.sets.every(
      (set, setIndex) =>
        hasExactOrderedKeys(set, PAYLOAD_SET_KEYS) &&
        set.set_order === setIndex + 1 &&
        isNullableSafeNonnegativeInteger(set.reps) &&
        isNullableSafeNonnegativeInteger(set.duration_sec) &&
        isNullableFiniteNonnegative(set.distance_m) &&
        isNullableFiniteNonnegative(set.weight_kg) &&
        isNullableFiniteNonnegative(set.assistance_kg) &&
        set.reps === normalizedDraftNumber(draftItem.sets[setIndex].reps, true) &&
        set.duration_sec === normalizedDraftNumber(
          draftItem.sets[setIndex].duration_sec,
          true
        ) &&
        set.distance_m === normalizedDraftNumber(
          draftItem.sets[setIndex].distance_m,
          false
        ) &&
        set.weight_kg === normalizedDraftNumber(
          draftItem.sets[setIndex].weight_kg,
          false
        ) &&
        set.assistance_kg === normalizedDraftNumber(
          draftItem.sets[setIndex].assistance_kg,
          false
        )
    );
  }

  function validateCommitIntentValue(
    intent,
    draft,
    code = 'INVALID_COMMIT_INTENT'
  ) {
    try {
      intent = protectedJsonClone(intent, code);
      if (
        !hasExactOrderedKeys(intent, COMMIT_INTENT_KEYS) ||
        intent.commit_intent_schema_version !== COMMIT_INTENT_SCHEMA_VERSION ||
        typeof intent.request_id !== 'string' ||
        !UUID_RE.test(intent.request_id) ||
        intent.request_id !== draft?.request_id ||
        intent.draft_revision !== draft?.revision ||
        intent.catalog_version !== draft?.catalog_version ||
        !isCanonicalCommitTimestamp(intent.prepared_at) ||
        !hasExactOrderedKeys(intent.payload, PAYLOAD_KEYS) ||
        intent.payload.schema_version !== PAYLOAD_SCHEMA_VERSION ||
        intent.payload.catalog_version !== draft.catalog_version ||
        intent.payload.started_at !== draft.started_at ||
        intent.payload.ended_at !== intent.prepared_at ||
        !Number.isSafeInteger(intent.payload.duration_min) ||
        intent.payload.duration_min < 1 ||
        intent.payload.duration_min > MAX_SESSION_DURATION_MIN ||
        intent.payload.title !== null ||
        intent.payload.note !== draft.note ||
        (draft.note !== null &&
          (typeof draft.note !== 'string' ||
            draft.note === '' ||
            textLength(draft.note) > NOTE_LIMIT ||
            draft.note.trim() !== draft.note)) ||
        !isDenseArray(intent.payload.items) ||
        intent.payload.items.length < 1 ||
        intent.payload.items.length > ITEM_LIMIT ||
        intent.payload.items.length !== draft.items.length
      ) {
        fail(code);
      }
      const elapsed = Date.parse(intent.prepared_at) - Date.parse(draft.started_at);
      const duration = Math.max(1, Math.round(elapsed / 60000));
      if (
        !Number.isFinite(elapsed) ||
        elapsed < 0 ||
        !Number.isFinite(duration) ||
        duration !== intent.payload.duration_min ||
        !intent.payload.items.every((item, index) =>
          validatePayloadItem(item, draft.items[index], index)
        )
      ) {
        fail(code);
      }
      return intent;
    } catch (error) {
      if (
        error instanceof ActivityV2SessionRecoveryError &&
        error.code === code
      ) {
        throw error;
      }
      fail(code);
    }
  }

  function inspectRecord(record) {
    if (!isRecord(record)) return { kind: 'invalid', discardSafe: false };
    const version = record.recovery_schema_version;
    if (
      typeof version === 'string' &&
      version !== RECOVERY_SCHEMA_VERSION_V1 &&
      version !== RECOVERY_SCHEMA_VERSION_V2
    ) {
      return { kind: 'unknown', discardSafe: false };
    }
    const isV1 = version === RECOVERY_SCHEMA_VERSION_V1;
    const isV2 = version === RECOVERY_SCHEMA_VERSION_V2;
    const discardSafe =
      isV1 && !hasOwn(record, 'commit_intent') && !hasOwn(record, 'commit_attempt');
    const recordKeys = isV2 ? RECORD_KEYS_V2 : RECORD_KEYS_V1;
    if (
      (!isV1 && !isV2) ||
      !hasExactOrderedKeys(record, recordKeys) ||
      record.slot_key !== SLOT_KEY ||
      !Number.isSafeInteger(record.slot_generation) ||
      record.slot_generation < 0 ||
      !Number.isSafeInteger(record.write_sequence) ||
      record.write_sequence < 0 ||
      typeof record.lease_token !== 'string' ||
      !UUID_RE.test(record.lease_token)
    ) {
      return { kind: 'invalid', discardSafe };
    }

    const hasNullCommitState =
      isV1 || (record.commit_intent === null && record.commit_attempt === null);
    const isTombstone =
      record.write_sequence === 0 &&
      record.request_id === null &&
      record.persisted_revision === null &&
      record.saved_at === null &&
      record.draft === null &&
      hasNullCommitState;
    if (isTombstone) return { kind: 'tombstone', record, version };

    if (
      record.write_sequence < 1 ||
      typeof record.request_id !== 'string' ||
      !UUID_RE.test(record.request_id) ||
      !Number.isSafeInteger(record.persisted_revision) ||
      record.persisted_revision < 1 ||
      !isCanonicalTimestamp(record.saved_at) ||
      !hasExactOrderedKeys(record.draft, SNAPSHOT_KEYS) ||
      record.draft.draft_schema_version !== DRAFT_SCHEMA_VERSION ||
      record.draft.request_id !== record.request_id ||
      record.draft.revision !== record.persisted_revision ||
      !Number.isSafeInteger(record.draft.catalog_version) ||
      record.draft.catalog_version < 1
    ) {
      return { kind: 'invalid', discardSafe };
    }
    if (isV2) {
      try {
        if (record.commit_intent !== null) {
          validateCommitIntentValue(record.commit_intent, record.draft);
        }
        if (record.commit_attempt !== null) {
          if (record.commit_intent === null) fail('INVALID_COMMIT_ATTEMPT');
          validateCommitAttemptValue(record.commit_attempt);
        }
      } catch {
        return { kind: 'invalid', discardSafe: false };
      }
    }
    return { kind: 'active', record, version };
  }

  function createActiveRecord({
    observation,
    draft,
    savedAt,
    leaseToken,
    recoverySchemaVersion,
    commitIntent = null,
    commitAttempt = null
  }) {
    const inspected =
      observation.kind === 'missing'
        ? { kind: 'missing' }
        : inspectRecord(observation.value);
    if (
      inspected.kind !== 'missing' &&
      inspected.kind !== 'tombstone' &&
      inspected.kind !== 'active'
    ) {
      fail('INVALID_OBSERVATION');
    }
    const version = recoverySchemaVersion || RECOVERY_SCHEMA_VERSION_V1;
    const isV2 = version === RECOVERY_SCHEMA_VERSION_V2;
    if (!isV2 && version !== RECOVERY_SCHEMA_VERSION_V1) {
      fail('INVALID_OPTIONS');
    }
    draft = protectedJsonClone(draft, 'INVALID_DRAFT_STATE');
    if (
      !hasExactOrderedKeys(draft, SNAPSHOT_KEYS) ||
      draft.draft_schema_version !== DRAFT_SCHEMA_VERSION ||
      typeof draft.request_id !== 'string' ||
      !UUID_RE.test(draft.request_id) ||
      !Number.isSafeInteger(draft.catalog_version) ||
      draft.catalog_version < 1 ||
      !Number.isSafeInteger(draft.revision) ||
      draft.revision < 1 ||
      !isCanonicalTimestamp(savedAt)
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    assertCanonicalUuid(leaseToken, 'INVALID_LEASE_TOKEN');
    const normalizedIntent =
      isV2 && commitIntent !== null
        ? validateCommitIntentValue(commitIntent, draft)
        : null;
    const normalizedAttempt =
      isV2 && commitAttempt !== null
        ? validateCommitAttemptValue(commitAttempt)
        : null;
    if ((!isV2 && (commitIntent !== null || commitAttempt !== null)) ||
        (normalizedAttempt !== null && normalizedIntent === null)) {
      fail('INVALID_COMMIT_ATTEMPT');
    }

    let generation = 0;
    let sequence = 0;
    if (inspected.kind !== 'missing') {
      generation = inspected.record.slot_generation;
      sequence = inspected.record.write_sequence;
      if (leaseToken !== inspected.record.lease_token) {
        fail('INVALID_LEASE_TOKEN');
      }
    }
    if (inspected.kind === 'active') {
      if (
        draft.request_id !== inspected.record.request_id ||
        draft.revision < inspected.record.persisted_revision
      ) {
        fail('CONFLICT');
      }
      if (draft.revision === inspected.record.persisted_revision) {
        if (!structurallyEqual(draft, inspected.record.draft) || !isV2) {
          fail('CONFLICT');
        }
        if (inspected.version === RECOVERY_SCHEMA_VERSION_V1) {
          if (normalizedIntent === null || normalizedAttempt !== null) {
            fail('INVALID_COMMIT_INTENT');
          }
        } else {
          const previousIntent = inspected.record.commit_intent;
          const previousAttempt = inspected.record.commit_attempt;
          const preparing =
            previousIntent === null &&
            previousAttempt === null &&
            normalizedIntent !== null &&
            normalizedAttempt === null;
          const attempting =
            previousIntent !== null &&
            structurallyEqual(normalizedIntent, previousIntent) &&
            normalizedAttempt !== null &&
            normalizedAttempt.attempt_number ===
              (previousAttempt?.attempt_number ?? 0) + 1 &&
            (previousAttempt === null ||
              normalizedAttempt.attempt_token !== previousAttempt.attempt_token);
          const releasing =
            previousIntent !== null &&
            previousAttempt !== null &&
            previousAttempt.attempt_number === 1 &&
            normalizedIntent === null &&
            normalizedAttempt === null;
          if (!preparing && !attempting && !releasing) fail('CONFLICT');
        }
      } else {
        if (
          inspected.version !== version ||
          normalizedIntent !== null ||
          normalizedAttempt !== null ||
          (inspected.version === RECOVERY_SCHEMA_VERSION_V2 &&
            (inspected.record.commit_intent !== null ||
              inspected.record.commit_attempt !== null))
        ) {
          fail('CONFLICT');
        }
      }
    } else {
      if (
        inspected.kind === 'tombstone' &&
        inspected.version === RECOVERY_SCHEMA_VERSION_V2 &&
        version !== RECOVERY_SCHEMA_VERSION_V2
      ) {
        fail('CONFLICT');
      }
      if (normalizedIntent !== null || normalizedAttempt !== null) {
        fail('INVALID_COMMIT_INTENT');
      }
    }
    if (sequence >= Number.MAX_SAFE_INTEGER) fail('STORAGE_ERROR');

    const record = {
      slot_key: SLOT_KEY,
      recovery_schema_version: version,
      slot_generation: generation,
      write_sequence: sequence + 1,
      lease_token: leaseToken,
      request_id: draft.request_id,
      persisted_revision: draft.revision,
      saved_at: savedAt,
      draft
    };
    if (isV2) {
      record.commit_intent = normalizedIntent;
      record.commit_attempt = normalizedAttempt;
    }
    return deepFreeze(record);
  }

  function createTombstoneRecord(
    observation,
    leaseToken,
    recoverySchemaVersion,
    commitIntent = null,
    commitAttempt = null
  ) {
    assertCanonicalUuid(leaseToken, 'INVALID_LEASE_TOKEN');
    let generation = 1;
    let previousToken = null;
    let inspected = { kind: 'missing' };
    if (observation.kind === 'record') {
      const record = observation.value;
      inspected = inspectRecord(record);
      if (
        inspected.kind === 'unknown' ||
        (inspected.kind === 'invalid' && !inspected.discardSafe)
      ) {
        fail('UNSAFE_DISCARD');
      }
      previousToken = isRecord(record) ? record.lease_token : null;
      if (
        typeof previousToken === 'string' &&
        UUID_RE.test(previousToken.toLowerCase())
      ) {
        previousToken = previousToken.toLowerCase();
      }
      if (
        isRecord(record) &&
        Number.isSafeInteger(record.slot_generation) &&
        record.slot_generation >= 0
      ) {
        if (record.slot_generation >= Number.MAX_SAFE_INTEGER) {
          fail('STORAGE_ERROR');
        }
        generation = record.slot_generation + 1;
      }
    }
    if (leaseToken === previousToken) fail('INVALID_LEASE_TOKEN');
    const version =
      recoverySchemaVersion ||
      inspected.version ||
      (inspected.discardSafe
        ? RECOVERY_SCHEMA_VERSION_V1
        : RECOVERY_SCHEMA_VERSION_V2);
    if (
      version !== RECOVERY_SCHEMA_VERSION_V1 &&
      version !== RECOVERY_SCHEMA_VERSION_V2
    ) {
      fail('INVALID_OPTIONS');
    }
    if (inspected.kind === 'active' && inspected.version === RECOVERY_SCHEMA_VERSION_V2) {
      if (version !== RECOVERY_SCHEMA_VERSION_V2) fail('UNSAFE_DISCARD');
      let suppliedIntent = null;
      let suppliedAttempt = null;
      try {
        suppliedIntent =
          commitIntent === null
            ? null
            : validateCommitIntentValue(commitIntent, inspected.record.draft);
        suppliedAttempt =
          commitAttempt === null
            ? null
            : validateCommitAttemptValue(commitAttempt);
      } catch {
        fail('UNSAFE_DISCARD');
      }
      const matchesNormalDiscard =
        inspected.record.commit_intent === null &&
        inspected.record.commit_attempt === null &&
        suppliedIntent === null &&
        suppliedAttempt === null;
      const matchesCompletion =
        inspected.record.commit_intent !== null &&
        inspected.record.commit_attempt !== null &&
        structurallyEqual(suppliedIntent, inspected.record.commit_intent) &&
        structurallyEqual(suppliedAttempt, inspected.record.commit_attempt);
      if (!matchesNormalDiscard && !matchesCompletion) fail('UNSAFE_DISCARD');
    } else {
      if (
        inspected.kind === 'active' &&
        inspected.version === RECOVERY_SCHEMA_VERSION_V1 &&
        version !== RECOVERY_SCHEMA_VERSION_V1
      ) {
        fail('UNSAFE_DISCARD');
      }
      if (commitIntent !== null || commitAttempt !== null) {
        fail('UNSAFE_DISCARD');
      }
    }
    const record = {
      slot_key: SLOT_KEY,
      recovery_schema_version: version,
      slot_generation: generation,
      write_sequence: 0,
      lease_token: leaseToken,
      request_id: null,
      persisted_revision: null,
      saved_at: null,
      draft: null
    };
    if (version === RECOVERY_SCHEMA_VERSION_V2) {
      record.commit_intent = null;
      record.commit_attempt = null;
    }
    return deepFreeze(record);
  }

  function createIndexedDbStore(optionsValue) {
    const options = optionsValue === undefined ? {} : optionsValue;
    if (!isRecord(options)) fail('INVALID_OPTIONS');
    if (Reflect.ownKeys(options).some((key) => !STORE_OPTION_KEYS.includes(key))) {
      fail('INVALID_OPTIONS');
    }
    const indexedDb =
      !hasOwn(options, 'indexedDB') || options.indexedDB === undefined
        ? root.indexedDB
        : options.indexedDB;
    if (!isRecord(indexedDb) || typeof indexedDb.open !== 'function') {
      fail('INDEXED_DB_UNAVAILABLE');
    }

    let database = null;
    let opening = null;
    let storeEpoch = 0;
    let closed = false;
    const issuedObservations = new WeakSet();

    function storageError() {
      return makeError('STORAGE_ERROR');
    }

    function getDatabase() {
      if (closed) return Promise.reject(storageError());
      if (database) return Promise.resolve({ database, epoch: storeEpoch });
      if (opening) return opening;

      const openEpoch = storeEpoch;
      let openPromise;
      openPromise = new Promise((resolve, reject) => {
        let request;
        let settled = false;
        let blocked = false;

        function rejectOpen() {
          if (settled) return;
          settled = true;
          reject(storageError());
        }

        try {
          request = indexedDb.open(DATABASE_NAME, DATABASE_VERSION);
        } catch {
          rejectOpen();
          return;
        }
        if (!isRecord(request)) {
          rejectOpen();
          return;
        }

        request.onupgradeneeded = () => {
          try {
            const upgradeDb = request.result;
            if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
              upgradeDb.createObjectStore(STORE_NAME, { keyPath: 'slot_key' });
            }
          } catch {
            try {
              request.transaction?.abort();
            } catch {
              // The open error remains generic and payload-free.
            }
          }
        };
        request.onblocked = () => {
          blocked = true;
          storeEpoch += 1;
          rejectOpen();
        };
        request.onerror = rejectOpen;
        request.onsuccess = () => {
          const opened = request.result;
          if (
            settled ||
            blocked ||
            closed ||
            openEpoch !== storeEpoch ||
            !opened
          ) {
            try {
              opened?.close();
            } catch {
              // Late handles are never published.
            }
            rejectOpen();
            return;
          }
          settled = true;
          database = opened;
          opening = null;
          opened.onversionchange = () => {
            if (database !== opened) return;
            database = null;
            storeEpoch += 1;
            try {
              opened.close();
            } catch {
              // Calls after invalidation fail or reopen through a fresh epoch.
            }
          };
          resolve({ database: opened, epoch: openEpoch });
        };
      });
      opening = openPromise;
      openPromise.catch(() => {
        if (opening === openPromise) opening = null;
      });
      return openPromise;
    }

    function runTransaction(mode, operation) {
      return getDatabase().then(
        ({ database: activeDatabase, epoch: operationEpoch }) =>
          new Promise((resolve, reject) => {
            let transaction;
            let store;
            let result;
            let operationError = null;
            let settled = false;

            function finishError(error = operationError || storageError()) {
              if (settled) return;
              settled = true;
              reject(error);
            }

            try {
              transaction = activeDatabase.transaction(STORE_NAME, mode);
              store = transaction.objectStore(STORE_NAME);
            } catch {
              finishError();
              return;
            }

            transaction.oncomplete = () => {
              if (settled) return;
              if (
                closed ||
                operationEpoch !== storeEpoch ||
                database !== activeDatabase
              ) {
                finishError();
                return;
              }
              settled = true;
              resolve(result);
            };
            transaction.onerror = () => finishError();
            transaction.onabort = () => finishError();

            function abortWith(error) {
              operationError = error;
              try {
                transaction.abort();
              } catch {
                finishError(error);
              }
            }

            try {
              operation({
                store,
                setResult(value) {
                  result = value;
                },
                abortWith
              });
            } catch (error) {
              abortWith(
                error instanceof ActivityV2SessionRecoveryError
                  ? error
                  : storageError()
              );
            }
          })
      );
    }

    function read() {
      if (arguments.length !== 0) fail('INVALID_OPTIONS');
      return runTransaction('readonly', ({ store, setResult, abortWith }) => {
        let request;
        try {
          request = store.get(SLOT_KEY);
        } catch {
          abortWith(storageError());
          return;
        }
        request.onerror = () => abortWith(storageError());
        request.onsuccess = () => {
          try {
            setResult(createObservation(request.result, issuedObservations));
          } catch (error) {
            abortWith(error);
          }
        };
      });
    }

    function save(options) {
      const isV1Save = hasExactKeys(options, [
        'observation',
        'draft',
        'savedAt',
        'leaseToken'
      ]);
      const isV2Save = hasExactKeys(options, [
        'observation',
        'draft',
        'savedAt',
        'leaseToken',
        'recoverySchemaVersion',
        'commitIntent',
        'commitAttempt'
      ]);
      if (arguments.length !== 1 || (!isV1Save && !isV2Save)) {
        fail('INVALID_OPTIONS');
      }
      if (
        isV2Save &&
        options.recoverySchemaVersion !== RECOVERY_SCHEMA_VERSION_V2
      ) {
        fail('INVALID_OPTIONS');
      }
      if (!issuedObservations.has(options.observation)) {
        fail('INVALID_OBSERVATION');
      }
      const observation = validateObservationShape(options.observation);
      const record = createActiveRecord({
        observation,
        draft: options.draft,
        savedAt: options.savedAt,
        leaseToken: options.leaseToken,
        recoverySchemaVersion: isV2Save
          ? options.recoverySchemaVersion
          : RECOVERY_SCHEMA_VERSION_V1,
        commitIntent: isV2Save ? options.commitIntent : null,
        commitAttempt: isV2Save ? options.commitAttempt : null
      });

      return runTransaction('readwrite', ({ store, setResult, abortWith }) => {
        let getRequest;
        try {
          getRequest = store.get(SLOT_KEY);
        } catch {
          abortWith(storageError());
          return;
        }
        getRequest.onerror = () => abortWith(storageError());
        getRequest.onsuccess = () => {
          let current;
          try {
            current = createObservation(getRequest.result);
          } catch (error) {
            abortWith(error);
            return;
          }
          if (!structurallyEqual(current, observation)) {
            abortWith(makeError('CONFLICT'));
            return;
          }
          let putRequest;
          try {
            putRequest = store.put(record);
          } catch {
            abortWith(storageError());
            return;
          }
          putRequest.onerror = () => abortWith(storageError());
          putRequest.onsuccess = () => {
            setResult(createObservation(record, issuedObservations));
          };
        };
      });
    }

    function discard(options) {
      const isV1Discard = hasExactKeys(options, ['observation', 'leaseToken']);
      const isV2Discard = hasExactKeys(options, [
        'observation',
        'leaseToken',
        'recoverySchemaVersion',
        'commitIntent',
        'commitAttempt'
      ]);
      if (arguments.length !== 1 || (!isV1Discard && !isV2Discard)) {
        fail('INVALID_OPTIONS');
      }
      if (
        isV2Discard &&
        options.recoverySchemaVersion !== RECOVERY_SCHEMA_VERSION_V2
      ) {
        fail('INVALID_OPTIONS');
      }
      if (!issuedObservations.has(options.observation)) {
        fail('INVALID_OBSERVATION');
      }
      const observation = validateObservationShape(options.observation);
      const record = createTombstoneRecord(
        observation,
        options.leaseToken,
        isV2Discard ? options.recoverySchemaVersion : undefined,
        isV2Discard ? options.commitIntent : null,
        isV2Discard ? options.commitAttempt : null
      );

      return runTransaction('readwrite', ({ store, setResult, abortWith }) => {
        let getRequest;
        try {
          getRequest = store.get(SLOT_KEY);
        } catch {
          abortWith(storageError());
          return;
        }
        getRequest.onerror = () => abortWith(storageError());
        getRequest.onsuccess = () => {
          let current;
          try {
            current = createObservation(getRequest.result);
          } catch (error) {
            abortWith(error);
            return;
          }
          if (!structurallyEqual(current, observation)) {
            abortWith(makeError('CONFLICT'));
            return;
          }
          let putRequest;
          try {
            putRequest = store.put(record);
          } catch {
            abortWith(storageError());
            return;
          }
          putRequest.onerror = () => abortWith(storageError());
          putRequest.onsuccess = () => {
            setResult(createObservation(record, issuedObservations));
          };
        };
      });
    }

    function close() {
      if (arguments.length !== 0) fail('INVALID_OPTIONS');
      if (closed) return;
      closed = true;
      storeEpoch += 1;
      const activeDatabase = database;
      database = null;
      opening = null;
      try {
        activeDatabase?.close();
      } catch {
        // Closing is idempotent and never deletes the database.
      }
    }

    return deepFreeze({ read, save, discard, close });
  }

  function resolveSemantics(catalogVersion) {
    if (
      !Number.isSafeInteger(catalogVersion) ||
      catalogVersion < 1
    ) {
      fail('INVALID_CATALOG_VERSION');
    }
    const activityV2 = root.AppModules?.activityV2;
    const semantics =
      catalogVersion === 1
        ? activityV2?.semantics
        : catalogVersion === 2
          ? activityV2?.semanticsV2
          : null;
    if (
      !isRecord(semantics) ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function'
    ) {
      return null;
    }
    try {
      return semantics.getCatalog().catalog_version === catalogVersion
        ? semantics
        : null;
    } catch {
      return null;
    }
  }

  function assertStorage(storage) {
    if (
      !hasExactKeys(storage, STORE_METHOD_KEYS) ||
      STORE_METHOD_KEYS.some((key) => typeof storage[key] !== 'function')
    ) {
      fail('INVALID_STORAGE');
    }
    return storage;
  }

  function assertDraftApi() {
    const draftApi = root.AppModules?.activityV2?.sessionDraft;
    if (
      !isRecord(draftApi) ||
      typeof draftApi.create !== 'function' ||
      typeof draftApi.restore !== 'function'
    ) {
      fail('DRAFT_API_MISSING');
    }
    return draftApi;
  }

  function assertSemantics(semantics) {
    if (
      !isRecord(semantics) ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function'
    ) {
      fail('SEMANTICS_MISSING');
    }
    return semantics;
  }

  function resolveNow(options) {
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

  function resolveUuidFactory(options, key, code) {
    if (hasOwn(options, key) && options[key] !== undefined) {
      if (typeof options[key] !== 'function') fail(code);
      return options[key];
    }
    return () => {
      if (!root.crypto || typeof root.crypto.randomUUID !== 'function') {
        fail(code === 'INVALID_LEASE_TOKEN' ? 'LEASE_TOKEN_UNAVAILABLE' : 'REQUEST_ID_UNAVAILABLE');
      }
      return root.crypto.randomUUID();
    };
  }

  function readUuid(factory, code, previous = null) {
    let value;
    try {
      value = factory();
    } catch (error) {
      if (error instanceof ActivityV2SessionRecoveryError) throw error;
      fail(code);
    }
    if (typeof value !== 'string' || !UUID_RE.test(value.toLowerCase())) {
      fail(code);
    }
    const normalized = value.toLowerCase();
    if (normalized === previous) fail(code);
    return normalized;
  }

  function resolveEnqueue(options) {
    if (hasOwn(options, 'enqueue') && options.enqueue !== undefined) {
      if (typeof options.enqueue !== 'function') fail('INVALID_SCHEDULER');
      return options.enqueue;
    }
    if (typeof root.queueMicrotask === 'function') return root.queueMicrotask;
    if (typeof root.setTimeout === 'function') {
      return (callback) => root.setTimeout(callback, 0);
    }
    fail('INVALID_SCHEDULER');
  }

  function resolveCatalogResolver(options) {
    if (
      hasOwn(options, 'resolveSemantics') &&
      options.resolveSemantics !== undefined
    ) {
      if (typeof options.resolveSemantics !== 'function') {
        fail('INVALID_SEMANTICS_RESOLVER');
      }
      return options.resolveSemantics;
    }
    return resolveSemantics;
  }

  function createState(state, rawDraft, savedAt, reason) {
    const snapshot = rawDraft ? rawDraft.getSnapshot() : null;
    return deepFreeze({
      state,
      started_at: snapshot?.started_at ?? null,
      saved_at: savedAt,
      item_count: snapshot?.items.length ?? 0,
      reason
    });
  }

  function normalizeStorageError(error) {
    if (
      error instanceof ActivityV2SessionRecoveryError &&
      error.code === 'CONFLICT'
    ) {
      return error;
    }
    return makeError('STORAGE_ERROR');
  }

  async function callStorage(storage, method, argument, hasArgument = true) {
    let result;
    try {
      result = hasArgument ? storage[method](argument) : storage[method]();
    } catch (error) {
      throw normalizeStorageError(error);
    }
    let then;
    try {
      then = result?.then;
    } catch (error) {
      throw normalizeStorageError(error);
    }
    if (typeof then !== 'function') throw makeError('STORAGE_ERROR');
    try {
      return await result;
    } catch (error) {
      throw normalizeStorageError(error);
    }
  }

  function assertCoordinatorObservation(observation) {
    validateObservationShape(observation);
    return deepFreeze(observation);
  }

  async function open(optionsValue) {
    if (!isRecord(optionsValue)) fail('INVALID_OPTIONS');
    if (
      Reflect.ownKeys(optionsValue).some(
        (key) => !OPEN_OPTION_KEYS.includes(key)
      )
    ) {
      fail('INVALID_OPTIONS');
    }
    if (!hasOwn(optionsValue, 'storage') || !hasOwn(optionsValue, 'semantics')) {
      fail('INVALID_OPTIONS');
    }

    const storage = assertStorage(optionsValue.storage);
    const currentSemantics = assertSemantics(optionsValue.semantics);
    const catalogResolver = resolveCatalogResolver(optionsValue);
    const now = resolveNow(optionsValue);
    const requestIdFactory = resolveUuidFactory(
      optionsValue,
      'createRequestId',
      'INVALID_REQUEST_ID'
    );
    const leaseTokenFactory = resolveUuidFactory(
      optionsValue,
      'createLeaseToken',
      'INVALID_LEASE_TOKEN'
    );
    const enqueue = resolveEnqueue(optionsValue);
    const draftApi = assertDraftApi();

    let phase = 'empty';
    let reason = null;
    let observation = null;
    let hasObservation = false;
    let rawDraft = null;
    let managedDraft = null;
    let recoveredDraft = null;
    let savedAt = null;
    let persistedRevision = null;
    let writeRecoveryVersion = RECOVERY_SCHEMA_VERSION_V2;
    let confirmedIntent = null;
    let confirmedAttempt = null;
    let heldAttempt = null;
    let commitLock = false;
    let commitOperation = null;
    let quarantined = false;
    let pendingSnapshot = null;
    let activeWrite = null;
    let retryBlocked = false;
    let controllerEpoch = 0;
    let queued = false;
    let queueToken = 0;
    let discardPromise = null;
    let canStartDegraded = false;
    let stateSnapshot = createState('empty', null, null, null);
    const subscribers = new Set();
    const lifecycleRemovers = [];

    function notifySubscribers() {
      [...subscribers].forEach((listener) => {
        try {
          listener(stateSnapshot);
        } catch {
          subscribers.delete(listener);
        }
      });
    }

    function publish(nextPhase, nextReason = null) {
      phase = nextPhase;
      reason = nextReason;
      stateSnapshot = createState(phase, rawDraft || recoveredDraft, savedAt, reason);
      notifySubscribers();
    }

    function currentRecord() {
      if (!hasObservation || observation.kind !== 'record') return null;
      return inspectRecord(observation.value);
    }

    function updateConfirmedObservation(nextObservation) {
      observation = assertCoordinatorObservation(nextObservation);
      hasObservation = true;
      canStartDegraded = false;
      const inspected = currentRecord();
      if (inspected?.kind === 'active') {
        savedAt = inspected.record.saved_at;
        persistedRevision = inspected.record.persisted_revision;
        writeRecoveryVersion = inspected.version;
        confirmedIntent =
          inspected.version === RECOVERY_SCHEMA_VERSION_V2
            ? inspected.record.commit_intent
            : null;
        confirmedAttempt =
          inspected.version === RECOVERY_SCHEMA_VERSION_V2
            ? inspected.record.commit_attempt
            : null;
        if (confirmedIntent !== null) commitLock = true;
      } else {
        savedAt = null;
        persistedRevision = null;
        confirmedIntent = null;
        confirmedAttempt = null;
        if (inspected?.kind === 'tombstone' || observation.kind === 'missing') {
          writeRecoveryVersion = RECOVERY_SCHEMA_VERSION_V2;
        }
      }
    }

    async function acquireObservationForSave(operationEpoch) {
      if (hasObservation) return true;
      const nextObservation = assertCoordinatorObservation(
        await callStorage(storage, 'read', undefined, false)
      );
      updateConfirmedObservation(nextObservation);
      if (operationEpoch !== controllerEpoch) return false;
      if (nextObservation.kind === 'missing') return true;
      const inspected = inspectRecord(nextObservation.value);
      if (inspected.kind === 'tombstone') return true;
      throw makeError('CONFLICT');
    }

    function leaseTokenForSave() {
      const inspected = currentRecord();
      if (inspected?.kind === 'active' || inspected?.kind === 'tombstone') {
        return inspected.record.lease_token;
      }
      if (hasObservation && observation.kind !== 'missing') {
        fail('CONFLICT');
      }
      return readUuid(leaseTokenFactory, 'INVALID_LEASE_TOKEN');
    }

    async function performSave(snapshot, operationEpoch) {
      const acquired = await acquireObservationForSave(operationEpoch);
      if (!acquired || operationEpoch !== controllerEpoch) return CANCELED_WRITE;
      const leaseToken = leaseTokenForSave();
      const savedAtValue = new Date(readNow(now)).toISOString();
      const saveOptions = {
        observation,
        draft: snapshot,
        savedAt: savedAtValue,
        leaseToken
      };
      if (writeRecoveryVersion === RECOVERY_SCHEMA_VERSION_V2) {
        saveOptions.recoverySchemaVersion = RECOVERY_SCHEMA_VERSION_V2;
        saveOptions.commitIntent = confirmedIntent;
        saveOptions.commitAttempt = confirmedAttempt;
      }
      const nextObservation = await callStorage(storage, 'save', saveOptions);
      return assertCoordinatorObservation(nextObservation);
    }

    function startNextWrite(expectedEpoch) {
      if (
        activeWrite ||
        pendingSnapshot === null ||
        expectedEpoch !== controllerEpoch ||
        phase === 'destroyed' ||
        phase === 'discarding' ||
        phase === 'conflict' ||
        retryBlocked ||
        commitLock
      ) {
        return null;
      }

      const snapshot = pendingSnapshot;
      pendingSnapshot = null;
      publish('saving');
      let outcome = 'success';
      const operation = performSave(snapshot, expectedEpoch)
        .then((nextObservation) => {
          if (nextObservation === CANCELED_WRITE) {
            outcome = 'canceled';
            return;
          }
          updateConfirmedObservation(nextObservation);
        })
        .catch((error) => {
          outcome = error.code === 'CONFLICT' ? 'conflict' : 'storage_error';
        })
        .finally(() => {
          activeWrite = null;
          if (expectedEpoch !== controllerEpoch) return;
          if (outcome === 'canceled') return;
          if (outcome === 'conflict') {
            pendingSnapshot = null;
            retryBlocked = true;
            publish('conflict', 'conflict');
            return;
          }
          if (outcome === 'storage_error') {
            if (pendingSnapshot === null) {
              pendingSnapshot = snapshot;
              retryBlocked = true;
              publish('degraded', 'storage_error');
              return;
            }
            retryBlocked = false;
            startNextWrite(expectedEpoch);
            return;
          }
          if (pendingSnapshot !== null) {
            publish('saving');
            startNextWrite(expectedEpoch);
            return;
          }
          const latest = rawDraft?.getSnapshot();
          if (latest && latest.revision === persistedRevision) {
            publish('saved');
          } else {
            publish('saving');
          }
        });
      activeWrite = operation;
      return operation;
    }

    function scheduleWrite() {
      if (
        activeWrite ||
        queued ||
        retryBlocked ||
        phase === 'conflict' ||
        phase === 'discarding' ||
        phase === 'destroyed' ||
        commitLock
      ) {
        return;
      }
      queued = true;
      const expectedEpoch = controllerEpoch;
      const expectedToken = ++queueToken;
      try {
        enqueue(() => {
          if (!queued || expectedToken !== queueToken) return;
          queued = false;
          if (expectedEpoch !== controllerEpoch) return;
          startNextWrite(expectedEpoch);
        });
      } catch {
        if (expectedToken === queueToken) queued = false;
        retryBlocked = true;
        publish('degraded', 'storage_error');
      }
    }

    function onMutation(snapshot) {
      if (phase === 'conflict') {
        publish('conflict', 'conflict');
        return;
      }
      pendingSnapshot = snapshot;
      retryBlocked = false;
      publish('saving');
      if (!activeWrite) scheduleWrite();
    }

    function assertReadable() {
      if (phase === 'destroyed') fail('CONTROLLER_DESTROYED');
      if (!rawDraft || !managedDraft) fail('INVALID_STATE');
    }

    function assertMutable() {
      assertReadable();
      if (phase === 'discarding' || commitLock || confirmedIntent !== null) {
        fail('MUTATION_BLOCKED');
      }
    }

    function createManagedDraft(controller) {
      const managed = {
        getSnapshot() {
          assertReadable();
          return controller.getSnapshot();
        },
        getTimerSnapshot() {
          assertReadable();
          return controller.getTimerSnapshot();
        },
        addItem: null,
        removeItem: null,
        moveItem: null,
        setNote: null,
        discard() {
          assertMutable();
          fail('PERSISTENT_DISCARD_REQUIRED');
        },
        addSet: null,
        removeSet: null,
        setSetField: null,
        setItemField: null
      };
      MUTATION_METHOD_KEYS.forEach((method) => {
        managed[method] = (...args) => {
          assertMutable();
          const before = controller.getSnapshot();
          const result = controller[method](...args);
          if (result !== before) onMutation(result);
          return result;
        };
      });
      return deepFreeze(managed);
    }

    function getState() {
      return stateSnapshot;
    }

    function getDraft() {
      return managedDraft;
    }

    function draftOptions(semantics) {
      return {
        semantics,
        now,
        createRequestId: requestIdFactory
      };
    }

    function startNew() {
      if (quarantined || commitLock || confirmedIntent !== null) {
        fail('MUTATION_BLOCKED');
      }
      if (
        phase !== 'empty' &&
        !(phase === 'degraded' && rawDraft === null && canStartDegraded)
      ) {
        fail(phase === 'destroyed' ? 'CONTROLLER_DESTROYED' : 'INVALID_STATE');
      }
      const wasDegraded = phase === 'degraded';
      const controller = draftApi.create(draftOptions(currentSemantics));
      rawDraft = controller;
      recoveredDraft = null;
      managedDraft = createManagedDraft(controller);
      publish(wasDegraded ? 'degraded' : 'active', wasDegraded ? 'storage_error' : null);
      return managedDraft;
    }

    function continueSession() {
      if (
        !recoveredDraft ||
        !['recoverable', 'degraded', 'conflict'].includes(phase)
      ) {
        fail(phase === 'destroyed' ? 'CONTROLLER_DESTROYED' : 'INVALID_STATE');
      }
      const continuedPhase = phase;
      const continuedReason = reason;
      rawDraft = recoveredDraft;
      recoveredDraft = null;
      managedDraft = createManagedDraft(rawDraft);
      publish(
        continuedPhase === 'recoverable' ? 'saved' : continuedPhase,
        continuedPhase === 'recoverable' ? null : continuedReason
      );
      return managedDraft;
    }

    async function flush() {
      if (phase === 'destroyed') fail('CONTROLLER_DESTROYED');
      if (phase === 'discarding') fail('MUTATION_BLOCKED');
      if (commitLock) return stateSnapshot;
      if (phase === 'conflict') return stateSnapshot;
      const flushEpoch = controllerEpoch;
      queued = false;
      queueToken += 1;

      if (activeWrite) await activeWrite;
      if (flushEpoch !== controllerEpoch || phase === 'conflict') {
        return stateSnapshot;
      }
      if (pendingSnapshot !== null) {
        retryBlocked = false;
        startNextWrite(flushEpoch);
        if (activeWrite) await activeWrite;
      }
      while (activeWrite && flushEpoch === controllerEpoch) {
        const currentWrite = activeWrite;
        await currentWrite;
        if (activeWrite === currentWrite) break;
      }
      return stateSnapshot;
    }

    async function acquireObservationForDiscard() {
      if (hasObservation) return;
      updateConfirmedObservation(
        assertCoordinatorObservation(
          await callStorage(storage, 'read', undefined, false)
        )
      );
    }

    function removeLifecycleListeners() {
      lifecycleRemovers.splice(0).forEach((remove) => {
        try {
          remove();
        } catch {
          // Listener cleanup cannot alter storage truth.
        }
      });
    }

    function closeStorage() {
      try {
        storage.close();
      } catch {
        // A committed tombstone or explicit destroy remains terminal.
      }
    }

    function discard() {
      if (phase === 'destroyed') {
        return Promise.reject(makeError('CONTROLLER_DESTROYED'));
      }
      if (quarantined || commitLock || confirmedIntent !== null) {
        return Promise.reject(makeError('UNSAFE_DISCARD'));
      }
      if (discardPromise) return discardPromise;

      let resolveDiscard;
      let rejectDiscard;
      const publicDiscardPromise = new Promise((resolve, reject) => {
        resolveDiscard = resolve;
        rejectDiscard = reject;
      });
      discardPromise = publicDiscardPromise;
      controllerEpoch += 1;
      const discardEpoch = controllerEpoch;
      queued = false;
      queueToken += 1;
      pendingSnapshot = null;
      retryBlocked = true;
      publish('discarding');
      const writeToAwait = activeWrite;

      (async () => {
        if (phase === 'destroyed' || discardEpoch !== controllerEpoch) {
          throw makeError('CONTROLLER_DESTROYED');
        }
        if (writeToAwait) await writeToAwait;
        if (phase === 'destroyed' || discardEpoch !== controllerEpoch) {
          throw makeError('CONTROLLER_DESTROYED');
        }
        await acquireObservationForDiscard();
        if (phase === 'destroyed' || discardEpoch !== controllerEpoch) {
          throw makeError('CONTROLLER_DESTROYED');
        }
        const inspected = currentRecord();
        const previousToken =
          inspected?.kind === 'active' || inspected?.kind === 'tombstone'
            ? inspected.record.lease_token
            : null;
        const nextToken = readUuid(
          leaseTokenFactory,
          'INVALID_LEASE_TOKEN',
          previousToken
        );
        const discardOptions = {
          observation,
          leaseToken: nextToken
        };
        const discardAsV2 =
          inspected?.version === RECOVERY_SCHEMA_VERSION_V2 ||
          inspected?.kind === 'tombstone' ||
          inspected?.kind === 'missing' ||
          observation.kind === 'missing';
        if (discardAsV2) {
          discardOptions.recoverySchemaVersion = RECOVERY_SCHEMA_VERSION_V2;
          discardOptions.commitIntent = null;
          discardOptions.commitAttempt = null;
        }
        const nextObservation = await callStorage(storage, 'discard', discardOptions);
        updateConfirmedObservation(nextObservation);
        rawDraft = null;
        recoveredDraft = null;
        managedDraft = null;
        savedAt = null;
        persistedRevision = null;
        publish('destroyed');
        removeLifecycleListeners();
        subscribers.clear();
        closeStorage();
        return stateSnapshot;
      })().then(resolveDiscard, (error) => {
        const normalized =
          error instanceof ActivityV2SessionRecoveryError &&
          error.code === 'CONTROLLER_DESTROYED'
            ? error
            : normalizeStorageError(error);
        if (phase === 'destroyed') {
          discardPromise = null;
          rejectDiscard(normalized);
          return;
        }
        const snapshot = rawDraft?.getSnapshot() || recoveredDraft?.getSnapshot();
        if (
          snapshot &&
          snapshot.revision > 0 &&
          snapshot.revision !== persistedRevision
        ) {
          pendingSnapshot = snapshot;
        }
        retryBlocked = true;
        publish(
          normalized.code === 'CONFLICT' ? 'conflict' : 'degraded',
          normalized.code === 'CONFLICT' ? 'conflict' : 'storage_error'
        );
        discardPromise = null;
        rejectDiscard(normalized);
      });
      return publicDiscardPromise;
    }

    function cloneCommitIntent() {
      return confirmedIntent === null
        ? null
        : protectedJsonClone(confirmedIntent, 'INVALID_COMMIT_INTENT');
    }

    function getCommitIntent() {
      if (arguments.length !== 0) fail('INVALID_OPTIONS');
      if (phase === 'destroyed') fail('CONTROLLER_DESTROYED');
      return cloneCommitIntent();
    }

    function assertSuppliedIntent(intent) {
      const snapshot = rawDraft?.getSnapshot() || recoveredDraft?.getSnapshot();
      if (!snapshot) fail('COMMIT_INTENT_REQUIRED');
      return validateCommitIntentValue(intent, snapshot);
    }

    function assertPersistentIntent(intent) {
      const normalized = assertSuppliedIntent(intent);
      if (confirmedIntent === null) fail('COMMIT_INTENT_REQUIRED');
      if (!structurallyEqual(normalized, confirmedIntent)) {
        fail('COMMIT_INTENT_MISMATCH');
      }
      return normalized;
    }

    function activeCommitRecord() {
      const inspected = currentRecord();
      if (inspected?.kind !== 'active') fail('CONFLICT');
      return inspected;
    }

    function commitSaveOptions(intent, attempt) {
      const inspected = activeCommitRecord();
      return {
        observation,
        draft: rawDraft.getSnapshot(),
        savedAt,
        leaseToken: inspected.record.lease_token,
        recoverySchemaVersion: RECOVERY_SCHEMA_VERSION_V2,
        commitIntent: intent,
        commitAttempt: attempt
      };
    }

    function publishCommitPersistenceFailure(error) {
      retryBlocked = true;
      commitLock = true;
      if (error.code === 'CONFLICT') {
        publish('conflict', 'conflict');
      } else {
        publish('degraded', 'storage_error');
      }
    }

    function assertCommitOperationEpoch(operationEpoch) {
      if (phase === 'destroyed' || operationEpoch !== controllerEpoch) {
        fail('CONTROLLER_DESTROYED');
      }
    }

    function handleCommitOperationError(error) {
      if (
        phase === 'destroyed' ||
        (error instanceof ActivityV2SessionRecoveryError &&
          error.code === 'CONTROLLER_DESTROYED')
      ) {
        return makeError('CONTROLLER_DESTROYED');
      }
      const normalizedError = normalizeStorageError(error);
      publishCommitPersistenceFailure(normalizedError);
      return normalizedError;
    }

    function prepareCommit(intent) {
      if (arguments.length !== 1) {
        return Promise.reject(makeError('INVALID_COMMIT_INTENT'));
      }
      if (phase === 'destroyed') {
        return Promise.reject(makeError('CONTROLLER_DESTROYED'));
      }

      let normalized;
      let saveOptions;
      try {
        assertReadable();
        normalized = assertSuppliedIntent(intent);
        const snapshot = rawDraft.getSnapshot();
        const inspected = activeCommitRecord();
        if (
          commitOperation ||
          commitLock ||
          confirmedIntent !== null ||
          confirmedAttempt !== null ||
          phase !== 'saved' ||
          activeWrite ||
          pendingSnapshot !== null ||
          queued ||
          retryBlocked ||
          snapshot.revision !== persistedRevision ||
          snapshot.revision !== inspected.record.persisted_revision ||
          !structurallyEqual(snapshot, inspected.record.draft)
        ) {
          fail('MUTATION_BLOCKED');
        }
        saveOptions = commitSaveOptions(normalized, null);
      } catch (error) {
        return Promise.reject(error);
      }

      // This lock is intentionally acquired before storage.save can yield.
      commitLock = true;
      const operationEpoch = controllerEpoch;
      const operation = callStorage(
        storage,
        'save',
        saveOptions
      )
        .then((nextObservation) => {
          assertCommitOperationEpoch(operationEpoch);
          updateConfirmedObservation(nextObservation);
          if (
            confirmedIntent === null ||
            confirmedAttempt !== null ||
            !structurallyEqual(confirmedIntent, normalized)
          ) {
            fail('STORAGE_ERROR');
          }
          publish('saved');
          return cloneCommitIntent();
        })
        .catch((error) => {
          const normalizedError = handleCommitOperationError(error);
          throw normalizedError;
        })
        .finally(() => {
          if (commitOperation === operation) commitOperation = null;
        });
      commitOperation = operation;
      return operation;
    }

    function beginCommitAttempt(intent) {
      if (arguments.length !== 1) {
        return Promise.reject(makeError('INVALID_COMMIT_INTENT'));
      }
      if (phase === 'destroyed') {
        return Promise.reject(makeError('CONTROLLER_DESTROYED'));
      }
      let normalized;
      let attempt;
      let saveOptions;
      try {
        normalized = assertPersistentIntent(intent);
        if (commitOperation) fail('MUTATION_BLOCKED');
        if (confirmedAttempt?.attempt_number >= Number.MAX_SAFE_INTEGER) {
          fail('INVALID_COMMIT_ATTEMPT');
        }
        const previousToken = confirmedAttempt?.attempt_token ?? null;
        attempt = deepFreeze({
          commit_attempt_schema_version: COMMIT_ATTEMPT_SCHEMA_VERSION,
          attempt_number: (confirmedAttempt?.attempt_number ?? 0) + 1,
          attempt_token: readUuid(
            leaseTokenFactory,
            'INVALID_COMMIT_ATTEMPT',
            previousToken
          )
        });
        saveOptions = commitSaveOptions(normalized, attempt);
      } catch (error) {
        return Promise.reject(error);
      }

      const operationEpoch = controllerEpoch;
      const operation = callStorage(storage, 'save', saveOptions)
        .then((nextObservation) => {
          assertCommitOperationEpoch(operationEpoch);
          updateConfirmedObservation(nextObservation);
          if (
            confirmedAttempt === null ||
            !structurallyEqual(confirmedAttempt, attempt)
          ) {
            fail('STORAGE_ERROR');
          }
          heldAttempt = protectedJsonClone(
            confirmedAttempt,
            'INVALID_COMMIT_ATTEMPT'
          );
          publish('saved');
          return protectedJsonClone(
            confirmedAttempt,
            'INVALID_COMMIT_ATTEMPT'
          );
        })
        .catch((error) => {
          const normalizedError = handleCommitOperationError(error);
          throw normalizedError;
        })
        .finally(() => {
          if (commitOperation === operation) commitOperation = null;
        });
      commitOperation = operation;
      return operation;
    }

    function assertHeldAttempt() {
      if (confirmedAttempt === null) fail('COMMIT_ATTEMPT_REQUIRED');
      if (
        heldAttempt === null ||
        !structurallyEqual(heldAttempt, confirmedAttempt)
      ) {
        fail('COMMIT_ATTEMPT_MISMATCH');
      }
      return confirmedAttempt;
    }

    function releaseCommit(intent) {
      if (arguments.length !== 1) {
        return Promise.reject(makeError('INVALID_COMMIT_INTENT'));
      }
      if (phase === 'destroyed') {
        return Promise.reject(makeError('CONTROLLER_DESTROYED'));
      }
      let saveOptions;
      try {
        assertPersistentIntent(intent);
        if (commitOperation) fail('MUTATION_BLOCKED');
        if (assertHeldAttempt().attempt_number !== 1) fail('RELEASE_BLOCKED');
        saveOptions = commitSaveOptions(null, null);
      } catch (error) {
        return Promise.reject(error);
      }

      const operationEpoch = controllerEpoch;
      const operation = callStorage(storage, 'save', saveOptions)
        .then((nextObservation) => {
          assertCommitOperationEpoch(operationEpoch);
          updateConfirmedObservation(nextObservation);
          if (confirmedIntent !== null || confirmedAttempt !== null) {
            fail('STORAGE_ERROR');
          }
          heldAttempt = null;
          commitLock = false;
          retryBlocked = false;
          publish('saved');
          return null;
        })
        .catch((error) => {
          const normalizedError = handleCommitOperationError(error);
          throw normalizedError;
        })
        .finally(() => {
          if (commitOperation === operation) commitOperation = null;
        });
      commitOperation = operation;
      return operation;
    }

    function completeCommit(intent) {
      if (arguments.length !== 1) {
        return Promise.reject(makeError('INVALID_COMMIT_INTENT'));
      }
      if (phase === 'destroyed') {
        return Promise.reject(makeError('CONTROLLER_DESTROYED'));
      }
      let persistentIntent;
      let persistentAttempt;
      let nextToken;
      try {
        persistentIntent = assertPersistentIntent(intent);
        if (commitOperation) fail('MUTATION_BLOCKED');
        persistentAttempt = assertHeldAttempt();
        const inspected = activeCommitRecord();
        nextToken = readUuid(
          leaseTokenFactory,
          'INVALID_LEASE_TOKEN',
          inspected.record.lease_token
        );
      } catch (error) {
        return Promise.reject(error);
      }

      const operationEpoch = controllerEpoch;
      const operation = callStorage(storage, 'discard', {
        observation,
        leaseToken: nextToken,
        recoverySchemaVersion: RECOVERY_SCHEMA_VERSION_V2,
        commitIntent: persistentIntent,
        commitAttempt: persistentAttempt
      })
        .then((nextObservation) => {
          assertCommitOperationEpoch(operationEpoch);
          updateConfirmedObservation(nextObservation);
          rawDraft = null;
          recoveredDraft = null;
          managedDraft = null;
          heldAttempt = null;
          commitLock = true;
          savedAt = null;
          persistedRevision = null;
          publish('destroyed');
          removeLifecycleListeners();
          subscribers.clear();
          closeStorage();
          return stateSnapshot;
        })
        .catch((error) => {
          const normalizedError = handleCommitOperationError(error);
          throw normalizedError;
        })
        .finally(() => {
          if (commitOperation === operation) commitOperation = null;
        });
      commitOperation = operation;
      return operation;
    }

    function subscribe(listener) {
      if (typeof listener !== 'function') fail('INVALID_LISTENER');
      if (phase === 'destroyed') fail('CONTROLLER_DESTROYED');
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

    function destroy() {
      if (phase === 'destroyed') return;
      controllerEpoch += 1;
      queued = false;
      queueToken += 1;
      pendingSnapshot = null;
      retryBlocked = true;
      rawDraft = null;
      recoveredDraft = null;
      managedDraft = null;
      savedAt = null;
      persistedRevision = null;
      publish('destroyed');
      removeLifecycleListeners();
      subscribers.clear();
      closeStorage();
    }

    const controller = deepFreeze({
      getState,
      getDraft,
      startNew,
      continueSession,
      flush,
      discard,
      subscribe,
      destroy,
      getCommitIntent,
      prepareCommit,
      beginCommitAttempt,
      releaseCommit,
      completeCommit
    });

    function registerLifecycleListener(target, type, listener) {
      if (
        !target ||
        typeof target.addEventListener !== 'function' ||
        typeof target.removeEventListener !== 'function'
      ) {
        return;
      }
      try {
        target.addEventListener(type, listener);
        lifecycleRemovers.push(() => target.removeEventListener(type, listener));
      } catch {
        // Lifecycle flush remains best effort.
      }
    }

    registerLifecycleListener(root.document, 'visibilitychange', () => {
      if (root.document.visibilityState !== 'hidden') return;
      flush().catch(() => {});
    });
    registerLifecycleListener(root, 'pagehide', () => {
      flush().catch(() => {});
    });

    try {
      updateConfirmedObservation(
        assertCoordinatorObservation(
          await callStorage(storage, 'read', undefined, false)
        )
      );
      if (observation.kind === 'missing') {
        publish('empty');
        return controller;
      }
      const inspected = inspectRecord(observation.value);
      if (inspected.kind === 'unknown') {
        quarantined = true;
        commitLock = true;
        publish('blocked', 'unknown_recovery_schema');
        return controller;
      }
      if (inspected.kind === 'invalid') {
        quarantined = !inspected.discardSafe;
        if (quarantined) commitLock = true;
        publish('blocked', 'invalid_record');
        return controller;
      }
      if (inspected.kind === 'tombstone') {
        publish('empty');
        return controller;
      }

      let restoredSemantics;
      try {
        restoredSemantics = catalogResolver(
          inspected.record.draft.catalog_version
        );
      } catch {
        restoredSemantics = null;
      }
      if (!restoredSemantics) {
        publish('blocked', 'catalog_unavailable');
        return controller;
      }
      try {
        if (
          !isRecord(restoredSemantics) ||
          typeof restoredSemantics.getCatalog !== 'function' ||
          typeof restoredSemantics.getEntryByKey !== 'function' ||
          restoredSemantics.getCatalog().catalog_version !==
            inspected.record.draft.catalog_version
        ) {
          publish('blocked', 'catalog_unavailable');
          return controller;
        }
      } catch {
        publish('blocked', 'catalog_unavailable');
        return controller;
      }
      try {
        recoveredDraft = draftApi.restore(
          inspected.record.draft,
          draftOptions(restoredSemantics)
        );
      } catch {
        recoveredDraft = null;
        if (inspected.version === RECOVERY_SCHEMA_VERSION_V2) {
          quarantined = true;
          commitLock = true;
        }
        publish('blocked', 'invalid_record');
        return controller;
      }
      publish('recoverable');
      return controller;
    } catch {
      observation = null;
      hasObservation = false;
      savedAt = null;
      persistedRevision = null;
      canStartDegraded = true;
      publish('degraded', 'storage_error');
      return controller;
    }
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
  if ('sessionRecovery' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionRecovery is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const sessionRecoveryApi = deepFreeze({
    resolveSemantics,
    createIndexedDbStore,
    open
  });
  Object.defineProperty(root.AppModules.activityV2, 'sessionRecovery', {
    value: sessionRecoveryApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
