'use strict';

(function initActivityV2CoachingExportController(root) {
  const ERROR_CODES = Object.freeze([
    'AUTH_REQUIRED',
    'INVALID_EXPORT_REQUEST',
    'EXPORT_LIMIT_EXCEEDED',
    'EXPORT_SNAPSHOT_DRIFT',
    'EXPORT_CONTRACT_INVALID',
    'REQUEST_FAILED'
  ]);

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function freezeState(value) {
    if (!isRecord(value)) return value;
    Object.values(value).forEach((entry) => freezeState(entry));
    return Object.freeze(value);
  }

  function create(options) {
    if (!isRecord(options)) throw new TypeError('controller options are required');
    const adapter = options.adapter;
    const contract =
      options.contract || root.AppModules?.activityV2?.coachingExport;
    const now = options.now || (() => Date.now());
    const makeBlob = options.makeBlob || ((parts, blobOptions) => new root.Blob(parts, blobOptions));
    const createObjectURL =
      options.createObjectURL || ((blob) => root.URL.createObjectURL(blob));
    const revokeObjectURL =
      options.revokeObjectURL || ((url) => root.URL.revokeObjectURL(url));
    if (
      typeof adapter?.loadCoachingExport !== 'function' ||
      typeof contract?.validateExport !== 'function' ||
      typeof contract?.validateRange !== 'function' ||
      typeof contract?.createPresetRange !== 'function' ||
      typeof contract?.buildDownloadName !== 'function' ||
      typeof now !== 'function' ||
      typeof makeBlob !== 'function' ||
      typeof createObjectURL !== 'function' ||
      typeof revokeObjectURL !== 'function'
    ) {
      throw new TypeError('invalid controller dependency');
    }

    const listeners = new Set();
    let generation = 0;
    let released = false;
    let state = freezeState({
      status: 'idle',
      preset: 6,
      range: contract.createPresetRange(6, now()),
      errorCode: null,
      canRetry: false,
      download: null,
      counts: null
    });

    function publish(next) {
      state = freezeState(next);
      listeners.forEach((listener) => {
        try {
          listener(state);
        } catch (_) {
          listeners.delete(listener);
        }
      });
      return state;
    }

    function releaseUrl() {
      if (state.download?.url) revokeObjectURL(state.download.url);
    }

    function reset(preset, range) {
      generation += 1;
      releaseUrl();
      return publish({
        status: 'idle',
        preset,
        range,
        errorCode: null,
        canRetry: false,
        download: null,
        counts: null
      });
    }

    function setPreset(months) {
      if (released) throw new Error('controller is destroyed');
      return reset(months, contract.createPresetRange(months, now()));
    }

    function setCustomRange(value) {
      if (released) throw new Error('controller is destroyed');
      try {
        if (!isRecord(value)) throw new TypeError('invalid range');
        const keys = Reflect.ownKeys(value);
        const descriptors = Object.getOwnPropertyDescriptors(value);
        if (
          keys.length !== 2 ||
          !keys.every((key) => typeof key === 'string') ||
          !keys.includes('from') ||
          !keys.includes('to') ||
          !Object.hasOwn(descriptors.from || {}, 'value') ||
          !Object.hasOwn(descriptors.to || {}, 'value')
        ) {
          throw new TypeError('invalid range');
        }
        const today = contract.createPresetRange(3, now()).to;
        const range = contract.validateRange(
          {
            from: descriptors.from.value,
            to: descriptors.to.value,
            inclusive: true
          },
          today
        );
        return reset('custom', range);
      } catch (_) {
        generation += 1;
        releaseUrl();
        return publish({
          ...state,
          status: 'error',
          preset: 'custom',
          errorCode: 'INVALID_EXPORT_REQUEST',
          canRetry: false,
          download: null,
          counts: null
        });
      }
    }

    function safeError(error) {
      const code = ERROR_CODES.includes(error?.code) ? error.code : 'REQUEST_FAILED';
      return { code, retryable: code === 'REQUEST_FAILED' && error?.retryable === true };
    }

    async function load() {
      if (released) throw new Error('controller is destroyed');
      const requestGeneration = ++generation;
      const range = state.range;
      releaseUrl();
      publish({
        ...state,
        status: 'loading',
        errorCode: null,
        canRetry: false,
        download: null,
        counts: null
      });
      try {
        const exportValue = contract.validateExport(
          await adapter.loadCoachingExport({ from: range.from, to: range.to })
        );
        if (requestGeneration !== generation || released) return state;
        if (
          exportValue.range.from !== range.from ||
          exportValue.range.to !== range.to ||
          exportValue.range.inclusive !== true
        ) {
          throw Object.assign(new Error('contract mismatch'), {
            code: 'EXPORT_CONTRACT_INVALID'
          });
        }
        const json = `${JSON.stringify(exportValue, null, 2)}\n`;
        const filename = contract.buildDownloadName(range);
        const blob = makeBlob([json], {
          type: 'application/json;charset=utf-8'
        });
        const url = createObjectURL(blob);
        return publish({
          ...state,
          status: exportValue.sessions.length === 0 ? 'empty' : 'ready',
          errorCode: null,
          canRetry: false,
          download: {
            url,
            filename,
            bytes: blob.size
          },
          counts: {
            sessions: exportValue.completeness.session_count,
            items: exportValue.completeness.item_count,
            sets: exportValue.completeness.set_count
          }
        });
      } catch (error) {
        if (requestGeneration !== generation || released) return state;
        const safe = safeError(error);
        return publish({
          ...state,
          status: 'error',
          errorCode: safe.code,
          canRetry: safe.retryable,
          download: null,
          counts: null
        });
      }
    }

    async function retry() {
      if (state.status !== 'error' || state.canRetry !== true) return state;
      return await load();
    }

    function releaseDownload() {
      if (!state.download) return state;
      releaseUrl();
      return publish({ ...state, download: null });
    }

    function subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('listener required');
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    }

    function destroy() {
      if (released) return;
      generation += 1;
      releaseUrl();
      released = true;
      listeners.clear();
    }

    return Object.freeze({
      getState: () => state,
      subscribe,
      setPreset,
      setCustomRange,
      load,
      retry,
      releaseDownload,
      destroy
    });
  }

  if (root.AppModules === undefined) root.AppModules = {};
  if (!isRecord(root.AppModules)) throw new TypeError('AppModules must be an object');
  if (root.AppModules.activityV2 === undefined) root.AppModules.activityV2 = {};
  if (!isRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('coachingExportController' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.coachingExportController is already registered');
  }
  Object.defineProperty(root.AppModules.activityV2, 'coachingExportController', {
    value: Object.freeze({ create }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
