'use strict';

(function initActivityV2SessionCommitHarnessAdapter(root) {
  const SAFE_MESSAGE =
    'The isolated activity commit harness adapter operation could not be completed.';
  const SERVER_OPTION_KEYS = Object.freeze(['delay']);
  const CLIENT_OPTION_KEYS = Object.freeze(['fault', 'delayMs', 'onDispatch']);
  const STORE_OPTION_KEYS = Object.freeze(['base', 'control', 'onEvent']);
  const STORE_METHOD_KEYS = Object.freeze(['read', 'save', 'discard', 'close']);
  const CLIENT_FAULTS = Object.freeze([
    'success',
    'known_auth',
    'known_invalid',
    'response_loss',
    'malformed'
  ]);

  class ActivityV2CommitHarnessAdapterError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2CommitHarnessAdapterError';
      this.code = code;
    }
  }

  const hasOwn = (value, key) =>
    Object.prototype.hasOwnProperty.call(value, key);

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function fail(code) {
    throw new ActivityV2CommitHarnessAdapterError(code);
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

  function readOwnData(value, key) {
    if (!isRecord(value)) return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && hasOwn(descriptor, 'value')
      ? descriptor.value
      : undefined;
  }

  function fingerprint(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function remoteError(code, commitState) {
    const error = new Error(SAFE_MESSAGE);
    error.name = 'ActivityV2CommitHarnessRemoteError';
    error.code = code;
    error.operation = 'commitSession';
    error.commitState = commitState;
    return error;
  }

  function validateDelay(delay) {
    if (typeof delay !== 'function') fail('INVALID_OPTIONS');
    return delay;
  }

  function createServer(optionsValue = {}) {
    if (!isRecord(optionsValue)) fail('INVALID_OPTIONS');
    if (Reflect.ownKeys(optionsValue).some((key) => !SERVER_OPTION_KEYS.includes(key))) {
      fail('INVALID_OPTIONS');
    }
    const delay = validateDelay(
      hasOwn(optionsValue, 'delay')
        ? optionsValue.delay
        : (milliseconds) =>
            new Promise((resolve) => root.setTimeout(resolve, milliseconds))
    );
    const ledger = new Map();
    const dispatches = [];
    let created = 0;
    let replayed = 0;
    let conflicts = 0;

    function createClient(options = {}) {
      if (!isRecord(options)) fail('INVALID_OPTIONS');
      if (Reflect.ownKeys(options).some((key) => !CLIENT_OPTION_KEYS.includes(key))) {
        fail('INVALID_OPTIONS');
      }
      const fault = hasOwn(options, 'fault') ? options.fault : 'success';
      const delayMs = hasOwn(options, 'delayMs') ? options.delayMs : 0;
      const onDispatch = hasOwn(options, 'onDispatch') ? options.onDispatch : null;
      if (
        !CLIENT_FAULTS.includes(fault) ||
        !Number.isSafeInteger(delayMs) ||
        delayMs < 0 ||
        delayMs > 60_000 ||
        !(onDispatch === null || typeof onDispatch === 'function')
      ) {
        fail('INVALID_OPTIONS');
      }
      let responseLossUsed = false;

      return async function commitSession(optionsValue) {
        if (
          !hasExactKeys(optionsValue, ['requestId', 'payload']) ||
          typeof optionsValue.requestId !== 'string' ||
          !isRecord(optionsValue.payload)
        ) {
          throw remoteError('INVALID_SESSION', 'not_committed');
        }
        let serialized;
        try {
          serialized = JSON.stringify({
            request_id: optionsValue.requestId,
            payload: optionsValue.payload
          });
        } catch {
          throw remoteError('INVALID_SESSION', 'not_committed');
        }
        const identity = fingerprint(serialized);
        const event = deepFreeze({ type: 'dispatch', identity });
        dispatches.push(event);
        try {
          onDispatch?.(event);
        } catch {
          // Harness telemetry cannot alter the simulated remote outcome.
        }
        if (delayMs > 0) await delay(delayMs);

        if (fault === 'known_auth') {
          throw remoteError('AUTH_REQUIRED', 'not_committed');
        }
        if (fault === 'known_invalid') {
          throw remoteError('INVALID_SESSION', 'not_committed');
        }
        if (fault === 'malformed') return deepFreeze({ outcome: 'invalid' });

        const previous = ledger.get(optionsValue.requestId);
        if (previous !== undefined && previous !== serialized) {
          conflicts += 1;
          throw remoteError('IDEMPOTENCY_CONFLICT', 'not_committed');
        }
        const outcome = previous === undefined ? 'created' : 'replayed';
        if (previous === undefined) {
          ledger.set(optionsValue.requestId, serialized);
          created += 1;
        } else {
          replayed += 1;
        }
        if (fault === 'response_loss' && !responseLossUsed) {
          responseLossUsed = true;
          throw remoteError('REQUEST_FAILED', 'unknown');
        }
        return deepFreeze({ outcome });
      };
    }

    function getSnapshot() {
      const identities = dispatches.map((event) => event.identity);
      return deepFreeze({
        dispatch_count: dispatches.length,
        created_count: created,
        replayed_count: replayed,
        conflict_count: conflicts,
        identity_stable:
          identities.length < 2 || identities.every((value) => value === identities[0])
      });
    }

    return deepFreeze({ createClient, getSnapshot });
  }

  function createStorageAdapter(options) {
    if (!hasExactKeys(options, STORE_OPTION_KEYS)) fail('INVALID_OPTIONS');
    const base = options.base;
    const control = options.control;
    const onEvent = options.onEvent;
    if (
      !hasExactKeys(base, STORE_METHOD_KEYS) ||
      STORE_METHOD_KEYS.some((method) => typeof base[method] !== 'function') ||
      !isRecord(control) ||
      typeof onEvent !== 'function'
    ) {
      fail('INVALID_OPTIONS');
    }

    function emit(type, attemptNumber = null) {
      try {
        onEvent(deepFreeze({ type, attempt_number: attemptNumber }));
      } catch {
        // Harness telemetry cannot alter storage semantics.
      }
    }

    function wait(milliseconds) {
      return new Promise((resolve) => root.setTimeout(resolve, milliseconds));
    }

    function read() {
      return base.read();
    }

    async function save(optionsValue) {
      const intent = readOwnData(optionsValue, 'commitIntent');
      const attempt = readOwnData(optionsValue, 'commitAttempt');
      const attemptNumber = readOwnData(attempt, 'attempt_number');
      if (attemptNumber !== undefined) emit('attempt_claim', attemptNumber);
      if (
        intent !== null &&
        intent !== undefined &&
        attempt === null &&
        control.intentFailureOnce === true
      ) {
        control.intentFailureOnce = false;
        emit('intent_failure');
        throw new Error(SAFE_MESSAGE);
      }
      if (
        intent !== null &&
        intent !== undefined &&
        attempt === null &&
        Number.isSafeInteger(control.intentDelayMs) &&
        control.intentDelayMs > 0
      ) {
        const milliseconds = control.intentDelayMs;
        control.intentDelayMs = 0;
        emit('intent_delay');
        await wait(milliseconds);
      }
      if (
        control.releaseArmed === true &&
        intent === null &&
        attempt === null &&
        control.releaseFailureOnce === true
      ) {
        control.releaseFailureOnce = false;
        emit('release_failure');
        throw new Error(SAFE_MESSAGE);
      }
      return await base.save(optionsValue);
    }

    async function discard(optionsValue) {
      if (control.cleanupFailureOnce === true) {
        control.cleanupFailureOnce = false;
        emit('cleanup_failure');
        throw new Error(SAFE_MESSAGE);
      }
      emit('tombstone');
      return await base.discard(optionsValue);
    }

    function close() {
      return base.close();
    }

    return deepFreeze({ read, save, discard, close });
  }

  if (root.AppModules === undefined) root.AppModules = {};
  if (!isRecord(root.AppModules)) throw new TypeError('AppModules must be an object');
  if (root.AppModules.activityV2 === undefined) root.AppModules.activityV2 = {};
  if (!isRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('sessionCommitHarnessAdapter' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionCommitHarnessAdapter is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.defineProperty(root.AppModules.activityV2, 'sessionCommitHarnessAdapter', {
    value: deepFreeze({ createServer, createStorageAdapter }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
