'use strict';

(function initSessionTemplateCache(root) {
  const DATABASE_NAME = 'midas_activity_v2_templates';
  const DATABASE_VERSION = 1;
  const STORE_NAME = 'last_used_template';
  const TIMEOUT_MS = 2000;
  const OWNER_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  class CacheError extends Error {
    constructor(code) { super('Der letzte Trainingsplan ist lokal nicht verfügbar.'); this.name = 'ActivityTemplateCacheError'; this.code = code; }
  }
  function create({ indexedDB = root.indexedDB, timeoutMs = TIMEOUT_MS } = {}) {
    if (!indexedDB || typeof indexedDB.open !== 'function' ||
        !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > TIMEOUT_MS) throw new CacheError('CACHE_UNAVAILABLE');
    let closed = false;
    const operations = new Set();
    function run(ownerId, mode, template) {
      if (closed || typeof ownerId !== 'string' || !OWNER_RE.test(ownerId)) return Promise.reject(new CacheError('CACHE_OWNER_INVALID'));
      return new Promise((resolve, reject) => {
        let done = false;
        let database = null;
        let transaction = null;
        let result = null;
        let request;
        let timer;
        const operation = { cancel: () => finish('CACHE_CLOSED') };
        function finish(code) {
          if (done) return;
          done = true;
          root.clearTimeout(timer);
          operations.delete(operation);
          if (code) { try { transaction?.abort(); } catch { /* Already completed. */ } }
          try { database?.close(); } catch { /* No live handle retained. */ }
          if (code) reject(new CacheError(code)); else resolve(result);
        }
        operations.add(operation);
        timer = root.setTimeout(() => finish('CACHE_TIMEOUT'), timeoutMs);
        try { request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION); }
        catch { finish('CACHE_UNAVAILABLE'); return; }
        request.onblocked = () => finish('CACHE_BLOCKED');
        request.onerror = () => finish('CACHE_ERROR');
        request.onupgradeneeded = () => {
          if (done || closed) { try { request.transaction.abort(); } catch { /* Cancelled open. */ } return; }
          try { request.result.createObjectStore(STORE_NAME, { keyPath: 'owner_id' }); }
          catch { finish('CACHE_ERROR'); }
        };
        request.onsuccess = () => {
          database = request.result;
          if (done || closed) { database.close(); finish('CACHE_CLOSED'); return; }
          database.onversionchange = () => { database.close(); finish('CACHE_CHANGED'); };
          try {
            transaction = database.transaction(STORE_NAME, mode);
            transaction.oncomplete = () => finish();
            transaction.onabort = () => finish('CACHE_ERROR');
            transaction.onerror = () => finish('CACHE_ERROR');
            const store = transaction.objectStore(STORE_NAME);
            const action = mode === 'readwrite' ? store.put({ owner_id: ownerId, template }) : store.get(ownerId);
            action.onerror = () => finish('CACHE_ERROR');
            action.onsuccess = () => {
              if (mode === 'readonly') {
                const record = action.result;
                if (record === undefined) result = null;
                else if (!record || record.owner_id !== ownerId ||
                  Object.keys(record).length !== 2 || !Object.prototype.hasOwnProperty.call(record, 'template')) finish('CACHE_CORRUPT');
                else result = record.template;
              }
            };
          } catch { finish('CACHE_ERROR'); }
        };
      });
    }
    return Object.freeze({ load: ownerId => run(ownerId, 'readonly'),
      save: (ownerId, template) => run(ownerId, 'readwrite', template),
      close() { closed = true; for (const operation of [...operations]) operation.cancel(); } });
  }
  root.AppModules = root.AppModules || {};
  root.AppModules.activityV2 = root.AppModules.activityV2 || {};
  if ('sessionTemplateCache' in root.AppModules.activityV2) throw new Error('sessionTemplateCache already registered');
  Object.defineProperty(root.AppModules.activityV2, 'sessionTemplateCache', {
    value: Object.freeze({ DATABASE_NAME, DATABASE_VERSION, STORE_NAME, TIMEOUT_MS, create }), enumerable: true
  });
})(typeof window !== 'undefined' ? window : globalThis);
