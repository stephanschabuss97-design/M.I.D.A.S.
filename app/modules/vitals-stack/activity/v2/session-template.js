'use strict';

(function initSessionTemplate(root) {
  const SCHEMA_VERSION = 'midas.activity-session-template.v1';
  const MAX_BYTES = 65536;
  const READ_TIMEOUT_MS = 10000;
  class TemplateError extends Error {
    constructor(code) { super('Die Trainingsvorlage konnte nicht geladen werden.'); this.name = 'ActivityTemplateError'; this.code = code; }
  }
  const fail = (code) => { throw new TemplateError(code); };
  function exactRecord(value, keys) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return false;
    const ownKeys = Reflect.ownKeys(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    return ownKeys.length === keys.length && ownKeys.every(key => keys.includes(key)) &&
      keys.every(key => Object.prototype.hasOwnProperty.call(descriptors[key] || {}, 'value'));
  }
  function validate(value, semantics) {
    if (!exactRecord(value, ['schema_version', 'catalog_version', 'name', 'items'])) fail('INVALID_TEMPLATE');
    if (value.schema_version !== SCHEMA_VERSION) fail('INVALID_VERSION');
    if (!Number.isSafeInteger(value.catalog_version) || value.catalog_version < 1 ||
        value.catalog_version !== semantics.getCatalog().catalog_version) fail('CATALOG_MISMATCH');
    if (typeof value.name !== 'string') fail('INVALID_NAME');
    const name = value.name.trim();
    if (Array.from(name).length < 1 || Array.from(name).length > 80) fail('INVALID_NAME');
    if (!Array.isArray(value.items) || value.items.length < 1 || value.items.length > 50 ||
        Reflect.ownKeys(value.items).length !== value.items.length + 1) fail('INVALID_ITEMS');
    const seen = new Set();
    const items = [];
    for (let index = 0; index < value.items.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value.items, String(index));
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) fail('INVALID_ITEMS');
      const item = descriptor.value;
      if (!exactRecord(item, ['item_order', 'item_key']) || item.item_order !== index + 1 ||
          !Number.isSafeInteger(item.item_order) || typeof item.item_key !== 'string') fail('INVALID_ITEMS');
      const entry = semantics.getEntryByKey(item.item_key);
      if (!entry || entry.status !== 'active') fail('UNKNOWN_ITEM');
      if (seen.has(item.item_key)) fail('DUPLICATE_ITEM');
      seen.add(item.item_key);
      items.push(Object.freeze({ item_order: index + 1, item_key: item.item_key }));
    }
    return Object.freeze({ schema_version: SCHEMA_VERSION, catalog_version: value.catalog_version,
      name, items: Object.freeze(items) });
  }
  function rejectDuplicateProperties(text) {
    const tokens = text.match(/"(?:\\.|[^"\\])*"|[{}\[\],:]|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g) || [];
    const stack = [];
    for (const token of tokens) {
      const current = stack[stack.length - 1];
      if (token === '{' || token === '[') {
        stack.push({ object: token === '{', key: true, keys: new Set() });
        if (stack.length > 8) fail('INVALID_TEMPLATE');
      } else if (token === '}' || token === ']') stack.pop();
      else if (current?.object && token === ',') current.key = true;
      else if (current?.object && current.key && token.startsWith('"')) {
        const key = JSON.parse(token);
        if (current.keys.has(key)) fail('DUPLICATE_PROPERTY');
        current.keys.add(key);
        current.key = false;
      }
    }
  }
  function parse(text, semantics) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BYTES) fail('FILE_TOO_LARGE');
    let value;
    try { value = JSON.parse(text); } catch { fail('INVALID_JSON'); }
    rejectDuplicateProperties(text);
    return validate(value, semantics);
  }
  async function readFile(file, semantics) {
    if (!file || !Number.isSafeInteger(file.size) || file.size < 0 || file.size > MAX_BYTES ||
        typeof file.text !== 'function') fail('INVALID_FILE');
    let timer;
    try {
      const text = await Promise.race([
        Promise.resolve().then(() => file.text()),
        new Promise((resolve, reject) => { timer = root.setTimeout(() => reject(new TemplateError('FILE_TIMEOUT')), READ_TIMEOUT_MS); })
      ]);
      return parse(text, semantics);
    } finally { root.clearTimeout(timer); }
  }
  function compose(value, { semantics, sessionDraft, now, createRequestId }) {
    const template = validate(value, semantics);
    const draft = sessionDraft.create({ semantics, now, createRequestId });
    for (const item of template.items) draft.addItem(item.item_key);
    return Object.freeze({ template, draft });
  }
  root.AppModules = root.AppModules || {};
  root.AppModules.activityV2 = root.AppModules.activityV2 || {};
  if ('sessionTemplate' in root.AppModules.activityV2) throw new Error('sessionTemplate already registered');
  Object.defineProperty(root.AppModules.activityV2, 'sessionTemplate', {
    value: Object.freeze({ SCHEMA_VERSION, MAX_BYTES, READ_TIMEOUT_MS, validate, parse, readFile, compose }), enumerable: true
  });
})(typeof window !== 'undefined' ? window : globalThis);
