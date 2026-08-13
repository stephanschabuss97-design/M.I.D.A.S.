'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const semanticsPath = path.join(__dirname, 'semantics.js');
const semanticsV2Path = path.join(__dirname, 'semantics-v2.js');
const draftPath = path.join(__dirname, 'session-draft.js');
const shellPath = path.join(__dirname, 'session-shell.js');
const cssPath = path.join(__dirname, 'session-shell.css');
const harnessPath = path.join(__dirname, 'session-shell-harness.html');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const semanticsV2Source = fs.readFileSync(semanticsV2Path, 'utf8');
const draftSource = fs.readFileSync(draftPath, 'utf8');
const shellSource = fs.readFileSync(shellPath, 'utf8');
const cssSource = fs.readFileSync(cssPath, 'utf8');
const harnessSource = fs.readFileSync(harnessPath, 'utf8');
const SAFE_MESSAGE = 'The activity session shell operation could not be completed.';
const UUIDS = [
  '00000000-0000-4000-8000-000000000011',
  '00000000-0000-4000-8000-000000000012'
];

class FakeElement {
  constructor(tagName, ownerDocument, nodeType = 1) {
    this.tagName = String(tagName).toUpperCase();
    this.nodeType = nodeType;
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this._children = [];
    this._text = '';
    this._value = '';
    this._selectedIndex = -1;
    this.attributes = new Map();
    this.dataset = {};
    this.listeners = new Map();
    this.style = { overflow: '' };
    this.className = '';
    this.id = '';
    this.hidden = false;
    this.disabled = false;
    this.selected = false;
    this.type = '';
    this.rows = 0;
    this.maxLength = -1;
    this.placeholder = '';
    this.htmlFor = '';
  }

  get children() {
    return this._children.filter((child) => child.nodeType === 1);
  }

  get childNodes() {
    return [...this._children];
  }

  get textContent() {
    return this._text + this._children.map((child) => child.textContent).join('');
  }

  set textContent(value) {
    this._children.forEach((child) => {
      child.parentNode = null;
    });
    this._children = [];
    this._text = String(value);
  }

  get value() {
    if (this.tagName === 'SELECT') {
      const selected = this.options.find((option) => option.selected);
      if (selected) return selected.value;
    }
    return this._value;
  }

  set value(value) {
    this._value = String(value);
    if (this.tagName === 'SELECT') {
      let selectedIndex = -1;
      this.options.forEach((option, index) => {
        option.selected = option.value === this._value;
        if (option.selected) selectedIndex = index;
      });
      this._selectedIndex = selectedIndex;
    }
  }

  get options() {
    return this.tagName === 'SELECT' ? this.children : [];
  }

  get selectedIndex() {
    return this._selectedIndex;
  }

  set selectedIndex(value) {
    this._selectedIndex = value;
    this.options.forEach((option, index) => {
      option.selected = index === value;
    });
    this._value = value >= 0 && this.options[value] ? this.options[value].value : '';
  }

  get isConnected() {
    let current = this;
    while (current) {
      if (current === this.ownerDocument?.body) return true;
      current = current.parentNode;
    }
    return false;
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    if (node.nodeType === 11) {
      [...node._children].forEach((child) => this.appendChild(child));
      node._children = [];
      return node;
    }
    if (node.parentNode) node.parentNode.removeChild(node);
    node.parentNode = this;
    this._children.push(node);
    return node;
  }

  replaceChildren(...nodes) {
    this._children.forEach((child) => {
      child.parentNode = null;
    });
    this._children = [];
    this._text = '';
    nodes.forEach((node) => this.appendChild(node));
  }

  removeChild(node) {
    const index = this._children.indexOf(node);
    if (index !== -1) {
      this._children.splice(index, 1);
      node.parentNode = null;
    }
    return node;
  }

  remove() {
    this.parentNode?.removeChild(this);
  }

  setAttribute(name, value) {
    const text = String(value);
    this.attributes.set(name, text);
    if (name === 'id') this.id = text;
    if (name === 'class') this.className = text;
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    event.currentTarget = this;
    if (typeof event.preventDefault !== 'function') {
      event.defaultPrevented = false;
      event.preventDefault = () => {
        event.defaultPrevented = true;
      };
    }
    if (typeof event.stopPropagation !== 'function') {
      event.propagationStopped = false;
      event.stopPropagation = () => {
        event.propagationStopped = true;
      };
    }
    [...(this.listeners.get(event.type) || [])].forEach((listener) => listener(event));
    return !event.defaultPrevented;
  }

  focus() {
    if (!this.disabled) this.ownerDocument.activeElement = this;
  }

  contains(candidate) {
    if (candidate === this) return true;
    return this._children.some((child) => child.contains(candidate));
  }

  matches(selector) {
    const trimmed = selector.trim();
    if (trimmed.startsWith('.')) {
      return this.className.split(/\s+/).includes(trimmed.slice(1));
    }
    if (trimmed.startsWith('#')) return this.id === trimmed.slice(1);
    const attribute = /^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(trimmed);
    if (attribute) {
      const [, name, expected] = attribute;
      let actual;
      if (name.startsWith('data-')) {
        const key = name
          .slice(5)
          .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        actual = this.dataset[key];
      } else {
        actual = this.getAttribute(name);
      }
      return expected === undefined ? actual !== undefined && actual !== null : actual === expected;
    }
    return this.tagName === trimmed.toUpperCase();
  }

  querySelectorAll(selector) {
    const selectors = selector.split(',').map((part) => part.trim());
    const result = [];
    const visit = (node) => {
      node._children.forEach((child) => {
        if (child.nodeType === 1 && selectors.some((part) => child.matches(part))) {
          result.push(child);
        }
        visit(child);
      });
    };
    visit(this);
    return result;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
}

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.body = new FakeElement('body', this);
    this.activeElement = this.body;
    this.visibilityState = 'visible';
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  createDocumentFragment() {
    return new FakeElement('#fragment', this, 11);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    if (typeof event.preventDefault !== 'function') {
      event.defaultPrevented = false;
      event.preventDefault = () => {
        event.defaultPrevented = true;
      };
    }
    if (typeof event.stopPropagation !== 'function') {
      event.propagationStopped = false;
      event.stopPropagation = () => {
        event.propagationStopped = true;
      };
    }
    [...(this.listeners.get(event.type) || [])].forEach((listener) => listener(event));
  }
}

function assertFrozenTree(value, seen = new WeakSet()) {
  if (
    value === null ||
    (typeof value !== 'object' && typeof value !== 'function') ||
    seen.has(value)
  ) {
    return;
  }
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  Reflect.ownKeys(value).forEach((key) => assertFrozenTree(value[key], seen));
}

function assertShellError(action, code) {
  let caught;
  assert.throws(action, (error) => {
    caught = error;
    return true;
  });
  assert.equal(caught.name, 'ActivityV2SessionShellError');
  assert.equal(caught.code, code);
  assert.equal(caught.message, SAFE_MESSAGE);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  Reflect.ownKeys(value).forEach((key) => deepFreeze(value[key], seen));
  return Object.freeze(value);
}

function createRuntime(options = {}) {
  const document = new FakeDocument();
  let intervalSequence = 0;
  const intervals = new Map();
  let requestIdIndex = 0;
  const now = options.now || (() => 1_722_509_200_000);
  const createRequestId =
    options.createRequestId || (() => UUIDS[Math.min(requestIdIndex++, UUIDS.length - 1)]);
  let context;
  context = vm.createContext({
    document,
    confirm: options.confirm || (() => false),
    crypto: { randomUUID: () => UUIDS[0] },
    setInterval(callback, delay) {
      if (options.requireTimerReceiver && this?.AppModules !== context.AppModules) {
        throw new TypeError('Illegal invocation');
      }
      intervalSequence += 1;
      intervals.set(intervalSequence, { callback, delay });
      return intervalSequence;
    },
    clearInterval(id) {
      if (options.requireTimerReceiver && this?.AppModules !== context.AppModules) {
        throw new TypeError('Illegal invocation');
      }
      intervals.delete(id);
    }
  });
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  vm.runInContext(semanticsV2Source, context, { filename: semanticsV2Path });
  vm.runInContext(draftSource, context, { filename: draftPath });
  vm.runInContext(shellSource, context, { filename: shellPath });

  const background = document.createElement('main');
  background.id = 'background';
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  background.appendChild(opener);
  document.body.appendChild(background);
  opener.focus();

  const semantics = options.useSemanticsV2
    ? context.AppModules.activityV2.semanticsV2
    : context.AppModules.activityV2.semantics;
  const draft = context.AppModules.activityV2.sessionDraft.create({
    semantics,
    now,
    createRequestId
  });
  const shellApi = context.AppModules.activityV2.sessionShell;
  return {
    context,
    document,
    background,
    opener,
    semantics,
    draft,
    shellApi,
    intervals
  };
}

function mountRuntime(runtime, overrides = {}) {
  const shell = runtime.shellApi.mount({
    host: runtime.document.body,
    draft: runtime.draft,
    semantics: runtime.semantics,
    confirmDiscard: () => false,
    setIntervalFn: runtime.context.setInterval,
    clearIntervalFn: runtime.context.clearInterval,
    ...overrides
  });
  const panel = runtime.document.body.children.find((child) =>
    child.className.split(/\s+/).includes('activity-v2-session-shell')
  );
  return { shell, panel };
}

function recoveryState(state, overrides = {}) {
  return deepFreeze({
    state,
    started_at: null,
    saved_at: null,
    item_count: 0,
    reason: null,
    ...overrides
  });
}

function createRecoveryFacade(draft, initialState, overrides = {}) {
  let state = initialState;
  let listener = null;
  let discardCalls = 0;
  let destroyCalls = 0;
  let unsubscribeCalls = 0;
  const facade = deepFreeze({
    getState: () => state,
    getDraft: () => draft,
    startNew: overrides.startNew || (() => draft),
    continueSession: overrides.continueSession || (() => draft),
    flush: overrides.flush || (() => Promise.resolve(state)),
    discard() {
      discardCalls += 1;
      return overrides.discard
        ? overrides.discard({
            emit,
            getDiscardCalls: () => discardCalls
          })
        : Promise.resolve(state);
    },
    subscribe(nextListener) {
      if (overrides.subscribe) return overrides.subscribe(nextListener);
      listener = nextListener;
      nextListener(state);
      return () => {
        unsubscribeCalls += 1;
        listener = null;
      };
    },
    destroy() {
      destroyCalls += 1;
      overrides.destroy?.();
    }
  });

  function emit(nextState) {
    state = nextState;
    listener?.(nextState);
  }

  return {
    facade,
    emit,
    getDiscardCalls: () => discardCalls,
    getDestroyCalls: () => destroyCalls,
    getUnsubscribeCalls: () => unsubscribeCalls
  };
}

function sessionCommitState(state, overrides = {}) {
  return deepFreeze({
    state,
    reason: null,
    focus_target: null,
    intent_present: false,
    ...overrides
  });
}

function createSessionCommitFacade(initialState, overrides = {}) {
  let state = initialState;
  const listeners = new Set();
  let finishCalls = 0;
  let retryCalls = 0;
  let destroyCalls = 0;
  let unsubscribeCalls = 0;

  function emit(nextState) {
    state = nextState;
    [...listeners].forEach((listener) => listener(nextState));
  }

  const methods = {
    getState() {
      return state;
    },
    finish() {
      finishCalls += 1;
      return overrides.finish
        ? overrides.finish({ emit, state, finishCalls })
        : Promise.resolve(state);
    },
    retry() {
      retryCalls += 1;
      return overrides.retry
        ? overrides.retry({ emit, state, retryCalls })
        : Promise.resolve(state);
    },
    subscribe(listener) {
      if (overrides.subscribe) return overrides.subscribe(listener);
      listener(state);
      listeners.add(listener);
      return () => {
        if (!listeners.delete(listener)) return;
        unsubscribeCalls += 1;
      };
    },
    destroy() {
      destroyCalls += 1;
      return overrides.destroy ? overrides.destroy({ emit, state }) : state;
    }
  };
  Object.values(methods).forEach(Object.freeze);
  const facade = Object.freeze(methods);
  return {
    facade,
    emit,
    getFinishCalls: () => finishCalls,
    getRetryCalls: () => retryCalls,
    getDestroyCalls: () => destroyCalls,
    getUnsubscribeCalls: () => unsubscribeCalls
  };
}

function actionElement(panel, action, itemKey = null) {
  return panel
    .querySelectorAll('button')
    .find(
      (button) =>
        button.dataset.action === action &&
        (itemKey === null || button.dataset.itemKey === itemKey)
    );
}

function click(panel, target) {
  panel.dispatchEvent({ type: 'click', target });
}

function typeSearch(panel, value) {
  const search = panel.querySelector('input');
  search.value = value;
  panel.dispatchEvent({ type: 'input', target: search });
  return search;
}

function setInputElement(panel, itemKey, setOrder, fieldKey) {
  return panel
    .querySelectorAll('input')
    .find(
      (input) =>
        input.dataset.itemKey === itemKey &&
        input.dataset.setOrder === String(setOrder) &&
        input.dataset.fieldKey === fieldKey
    );
}

function inputSetField(panel, itemKey, setOrder, fieldKey, value) {
  const input = setInputElement(panel, itemKey, setOrder, fieldKey);
  assert.ok(input, `${itemKey} set ${setOrder} field ${fieldKey}`);
  input.value = value;
  panel.dispatchEvent({ type: 'input', target: input });
  return input;
}

function itemInputElement(panel, itemKey, fieldKey) {
  return panel
    .querySelectorAll('input, textarea')
    .find(
      (input) =>
        input.dataset.itemKey === itemKey &&
        input.dataset.fieldKey === fieldKey &&
        input.dataset.setOrder === undefined
    );
}

function inputItemField(panel, itemKey, fieldKey, value) {
  const input = itemInputElement(panel, itemKey, fieldKey);
  assert.ok(input, `${itemKey} item field ${fieldKey}`);
  input.value = value;
  panel.dispatchEvent({ type: 'input', target: input });
  return input;
}

function itemElement(panel, itemKey) {
  return panel
    .querySelectorAll('.activity-v2-session-item')
    .find((item) => item.dataset.itemKey === itemKey);
}

function editorElement(panel, itemKey) {
  return itemElement(panel, itemKey)?.querySelector(
    '.activity-v2-session-strength-editor'
  );
}

function setRowElement(panel, itemKey, setOrder) {
  return itemElement(panel, itemKey)
    ?.querySelectorAll('.activity-v2-session-set-row')
    .find((row) => row.dataset.setOrder === String(setOrder));
}

function pressKey(runtime, target, key, options = {}) {
  const event = { type: 'keydown', target, key, ...options };
  runtime.document.dispatchEvent(event);
  return event;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolveValue, rejectValue) => {
    resolve = resolveValue;
    reject = rejectValue;
  });
  return { promise, resolve, reject };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeLookupResult(runtime, itemKey, overrides = {}) {
  const entry = runtime.semantics.getEntryByKey(itemKey);
  assert.ok(entry, `missing fixture entry: ${itemKey}`);
  const fields = jsonClone(entry.fields);
  const item = {
    id: '00000000-0000-4000-8000-000000000701',
    catalog_version: runtime.semantics.getCatalog().catalog_version,
    item_key: itemKey,
    item_order: 1,
    item_label_snapshot: entry.label,
    tracking_mode_snapshot: entry.tracking_mode,
    equipment_snapshot: entry.equipment,
    load_comparability_snapshot: entry.load_comparability,
    field_policy_snapshot: fields,
    duration_min: null,
    distance_km: null,
    note: null,
    created_at: '2026-08-01T10:00:00.000000Z',
    sets: []
  };
  if (entry.tracking_mode === 'strength_sets') {
    item.sets.push({
      id: '00000000-0000-4000-8000-000000000702',
      set_order: 1,
      tracking_mode: 'strength_sets',
      reps: fields.reps === 'required' ? 12 : null,
      duration_sec: fields.duration_sec === 'required' ? 45 : null,
      distance_m: fields.distance_m === 'required' ? 30 : null,
      weight_kg: fields.weight_kg === 'forbidden' ? null : 77.5,
      assistance_kg: fields.assistance_kg === 'forbidden' ? null : 40,
      created_at: '2026-08-01T10:00:00.000000Z'
    });
  } else {
    item.duration_min = 45;
    if (entry.tracking_mode === 'duration_distance') item.distance_km = 5.25;
  }
  Object.assign(item, overrides.item || {});
  return {
    schema_version: 'midas.activity-last-performance.v1',
    session: {
      id: '00000000-0000-4000-8000-000000000700',
      started_at: '2026-08-01T09:00:00.000000Z',
      day: '2026-08-01',
      ...(overrides.session || {})
    },
    item,
    ...(overrides.top || {})
  };
}

function selectSearchResult(panel, itemKey, childSelector = null) {
  const button = actionElement(panel, 'select-search-result', itemKey);
  assert.ok(button, `missing search result: ${itemKey}`);
  click(panel, childSelector ? button.querySelector(childSelector) : button);
}

test('namespace, mount and hidden dialog structure are immutable and fail closed', () => {
  const runtime = createRuntime();
  const { shell, panel } = mountRuntime(runtime);
  const descriptor = Object.getOwnPropertyDescriptor(
    runtime.context.AppModules.activityV2,
    'sessionShell'
  );

  assertFrozenTree(runtime.shellApi);
  assertFrozenTree(shell);
  assert.deepEqual(
    {
      enumerable: descriptor.enumerable,
      writable: descriptor.writable,
      configurable: descriptor.configurable
    },
    { enumerable: true, writable: false, configurable: false }
  );
  assert.equal(panel.hidden, true);
  assert.equal(panel.hasAttribute('inert'), true);
  assert.equal(panel.getAttribute('aria-hidden'), 'true');
  assert.equal(panel.getAttribute('role'), 'dialog');
  assert.equal(panel.getAttribute('aria-modal'), 'true');
  assert.ok(panel.getAttribute('aria-labelledby'));
  assert.equal(panel.querySelector('.activity-v2-session-title').textContent, 'Training erfassen');
  assert.equal(panel.querySelector('.activity-v2-session-status').getAttribute('role'), 'status');
  const search = panel.querySelector('input');
  assert.equal(search.type, 'search');
  assert.ok(search.getAttribute('aria-controls'));
  assert.equal(search.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.querySelector('.activity-v2-session-search-results').tagName, 'UL');
  assertShellError(
    () => runtime.shellApi.mount({ host: runtime.document.body, draft: runtime.draft }),
    'SHELL_ALREADY_MOUNTED'
  );
});

test('mount validates exact options, dependencies and scheduler pairs before DOM mutation', () => {
  const cases = [
    [null, 'INVALID_OPTIONS'],
    [{}, 'INVALID_OPTIONS'],
    [{ host: {}, draft: {} }, 'INVALID_HOST']
  ];
  cases.forEach(([options, code]) => {
    const runtime = createRuntime();
    const before = runtime.document.body.children.length;
    assertShellError(() => runtime.shellApi.mount(options), code);
    assert.equal(runtime.document.body.children.length, before);
  });

  let runtime = createRuntime();
  assertShellError(
    () => runtime.shellApi.mount({
      host: runtime.document.body,
      draft: {},
      semantics: runtime.semantics,
      confirmDiscard: () => false,
      setIntervalFn: () => 1,
      clearIntervalFn: () => {}
    }),
    'INVALID_DRAFT_API'
  );
  runtime = createRuntime();
  const legacyDraftFacade = Object.freeze({
    getSnapshot: () => runtime.draft.getSnapshot(),
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem() {},
    removeItem() {},
    moveItem() {},
    setNote() {},
    discard() {},
    addSet() {},
    removeSet() {},
    setSetField() {}
  });
  assertShellError(
    () => mountRuntime(runtime, { draft: legacyDraftFacade }),
    'INVALID_DRAFT_API'
  );
  runtime = createRuntime();
  assertShellError(
    () => runtime.shellApi.mount({
      host: runtime.document.body,
      draft: runtime.draft,
      semantics: {},
      confirmDiscard: () => false,
      setIntervalFn: () => 1,
      clearIntervalFn: () => {}
    }),
    'SEMANTICS_MISSING'
  );
  runtime = createRuntime();
  assertShellError(
    () => runtime.shellApi.mount({
      host: runtime.document.body,
      draft: runtime.draft,
      semantics: runtime.semantics,
      confirmDiscard: null,
      setIntervalFn: () => 1,
      clearIntervalFn: () => {}
    }),
    'INVALID_CONFIRMATION'
  );
  runtime = createRuntime();
  assertShellError(
    () => runtime.shellApi.mount({
      host: runtime.document.body,
      draft: runtime.draft,
      semantics: runtime.semantics,
      confirmDiscard: () => false,
      setIntervalFn: () => 1
    }),
    'INVALID_SCHEDULER'
  );
  runtime = createRuntime();
  assertShellError(
    () => mountRuntime(runtime, { loadLastPerformance: null }),
    'INVALID_OPTIONS'
  );
  runtime = createRuntime();
  assertShellError(
    () => mountRuntime(runtime, { loadLastPerformance: 'lookup' }),
    'INVALID_OPTIONS'
  );
  runtime = createRuntime();
  assert.doesNotThrow(() => mountRuntime(runtime, { loadLastPerformance: undefined }));
  runtime = createRuntime();
  assertShellError(
    () => mountRuntime(runtime, {
      semantics: {
        getCatalog: runtime.semantics.getCatalog,
        getEntryByKey: runtime.semantics.getEntryByKey
      }
    }),
    'SEMANTICS_MISSING'
  );
  runtime = createRuntime();
  const invalidCatalog = jsonClone(runtime.semantics.getCatalog());
  invalidCatalog.entries.find(
    (entry) => entry.key === 'ab_wheel_rollout'
  ).fields.reps = 'forbidden';
  const baseSemantics = runtime.semantics;
  assertShellError(
    () => mountRuntime(runtime, {
      semantics: {
        getCatalog: () => invalidCatalog,
        getEntryByKey: (key) => baseSemantics.getEntryByKey(key),
        normalizeSearchText: (query) => baseSemantics.normalizeSearchText(query),
        search: (query, options) => baseSemantics.search(query, options)
      }
    }),
    'INVALID_DRAFT_STATE'
  );
});

test('open is idempotent, traps focus and restores background, overflow and opener', async () => {
  const runtime = createRuntime();
  runtime.document.body.style.overflow = 'auto';
  let confirmCalls = 0;
  const { shell, panel } = mountRuntime(runtime, {
    confirmDiscard() {
      confirmCalls += 1;
      return true;
    }
  });
  const picker = panel.querySelector('input');
  const note = panel.querySelector('.activity-v2-session-note');
  const pristine = runtime.draft.getSnapshot();

  assert.equal(shell.open({ opener: runtime.opener }), shell);
  assert.equal(shell.open(), shell);
  assert.equal(shell.isOpen(), true);
  assert.equal(panel.hidden, false);
  assert.equal(panel.hasAttribute('inert'), false);
  assert.equal(panel.getAttribute('aria-hidden'), 'false');
  assert.equal(runtime.background.hasAttribute('inert'), true);
  assert.equal(runtime.document.body.style.overflow, 'hidden');
  assert.equal(runtime.document.activeElement, picker);
  assert.equal(runtime.document.listeners.get('keydown').size, 1);

  note.focus();
  const forward = { type: 'keydown', key: 'Tab' };
  runtime.document.dispatchEvent(forward);
  assert.equal(forward.defaultPrevented, true);
  assert.equal(runtime.document.activeElement, actionElement(panel, 'close'));

  const close = actionElement(panel, 'close');
  close.focus();
  const backward = { type: 'keydown', key: 'Tab', shiftKey: true };
  runtime.document.dispatchEvent(backward);
  assert.equal(backward.defaultPrevented, true);
  assert.equal(runtime.document.activeElement, note);

  assert.equal(await shell.requestClose(), true);
  assert.equal(shell.isOpen(), false);
  assert.equal(panel.hidden, true);
  assert.equal(runtime.background.hasAttribute('inert'), false);
  assert.equal(runtime.document.body.style.overflow, 'auto');
  assert.equal(runtime.document.activeElement, runtime.opener);
  assert.equal(runtime.document.listeners.get('keydown').size, 0);
  assert.equal(confirmCalls, 0);
  assert.equal(runtime.draft.getSnapshot(), pristine);
});

test('open focus failure rolls lifecycle effects back and releases the document registry', () => {
  const runtime = createRuntime();
  runtime.document.body.style.overflow = 'clip';
  const preserved = runtime.document.createElement('aside');
  preserved.setAttribute('inert', '');
  runtime.document.body.appendChild(preserved);
  const { shell, panel } = mountRuntime(runtime);
  const picker = panel.querySelector('input');
  const originalFocus = picker.focus.bind(picker);
  picker.focus = () => {
    throw new Error('focus failed');
  };

  assertShellError(
    () => shell.open({ opener: runtime.opener }),
    'INVALID_HOST'
  );
  assert.equal(shell.isOpen(), false);
  assert.equal(panel.hidden, true);
  assert.equal(panel.hasAttribute('inert'), true);
  assert.equal(runtime.background.hasAttribute('inert'), false);
  assert.equal(preserved.hasAttribute('inert'), true);
  assert.equal(runtime.document.body.style.overflow, 'clip');
  assert.equal(runtime.document.listeners.get('keydown').size, 0);

  picker.focus = originalFocus;
  assert.doesNotThrow(() => shell.open({ opener: runtime.opener }));
  assert.equal(shell.isOpen(), true);
});

test('open rolls back a started draft when the injected scheduler fails', () => {
  const runtime = createRuntime();
  runtime.draft.addItem('ab_wheel_rollout');
  const { shell, panel } = mountRuntime(runtime, {
    setIntervalFn() {
      throw new Error('scheduler failed');
    },
    clearIntervalFn() {}
  });

  assertShellError(
    () => shell.open({ opener: runtime.opener }),
    'INVALID_SCHEDULER'
  );
  assert.equal(shell.isOpen(), false);
  assert.equal(panel.hidden, true);
  assert.equal(panel.hasAttribute('inert'), true);
  assert.equal(runtime.background.hasAttribute('inert'), false);
  assert.equal(runtime.document.body.style.overflow, '');
  assert.equal(runtime.document.listeners.get('keydown').size, 0);
  assert.equal(runtime.document.listeners.get('visibilitychange').size, 0);
  assert.equal(runtime.draft.getSnapshot().revision, 1);
});

test('only one shell per document can be open at a time', () => {
  const runtime = createRuntime();
  const hostOne = runtime.document.createElement('div');
  const hostTwo = runtime.document.createElement('div');
  runtime.document.body.append(hostOne, hostTwo);
  const first = runtime.shellApi.mount({
    host: hostOne,
    draft: runtime.draft,
    semantics: runtime.semantics,
    confirmDiscard: () => false,
    setIntervalFn: () => 1,
    clearIntervalFn: () => {}
  });
  let idIndex = 0;
  const secondDraft = runtime.context.AppModules.activityV2.sessionDraft.create({
    semantics: runtime.semantics,
    now: () => 0,
    createRequestId: () => UUIDS[++idIndex]
  });
  const second = runtime.shellApi.mount({
    host: hostTwo,
    draft: secondDraft,
    semantics: runtime.semantics,
    confirmDiscard: () => false,
    setIntervalFn: () => 1,
    clearIntervalFn: () => {}
  });
  first.open();
  assertShellError(() => second.open(), 'SHELL_ALREADY_OPEN');
  first.destroy();
  assert.doesNotThrow(() => second.open());
});

test('local search is limited, canonical, nested-click safe and duplicate aware', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const search = typeSearch(panel, 'Multi Hip');
  const results = panel.querySelectorAll('[data-action="select-search-result"]');

  assert.equal(search.getAttribute('aria-expanded'), 'true');
  assert.equal(results.length, 3);
  assert.deepEqual(
    results.map((button) => button.dataset.itemKey),
    ['glute_kickback', 'hip_abduction', 'hip_adduction']
  );
  assert.match(results[0].textContent, /Variable Ausstattung/);
  selectSearchResult(panel, 'glute_kickback', '.activity-v2-session-search-result-label');
  assert.equal(runtime.draft.getSnapshot().items[0].item_key, 'glute_kickback');
  assert.equal(search.value, '');
  assert.equal(search.getAttribute('aria-expanded'), 'false');
  assert.equal(runtime.document.activeElement.dataset.itemKey, 'glute_kickback');
  assert.equal(runtime.document.activeElement.getAttribute('tabindex'), '-1');

  typeSearch(panel, 'Multi Hip');
  const duplicate = actionElement(panel, 'select-search-result', 'glute_kickback');
  assert.match(duplicate.textContent, /Bereits in Session/);
  selectSearchResult(panel, 'glute_kickback');
  assert.equal(runtime.draft.getSnapshot().items.length, 1);
  assert.equal(runtime.document.activeElement.dataset.itemKey, 'glute_kickback');
  assert.equal(panel.querySelector('.activity-v2-session-empty').hidden, true);
  assert.equal(panel.querySelector('.activity-v2-session-count').textContent, '1 Eintrag');
});

test('search start, empty, malformed, keyboard and Escape states are deterministic', async () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  let confirmCalls = 0;
  const base = runtime.semantics;
  let searchMode = 'valid';
  let lookupCalls = 0;
  const semantics = {
    getCatalog: () => base.getCatalog(),
    getEntryByKey: (key) => base.getEntryByKey(key),
    normalizeSearchText: (query) => base.normalizeSearchText(query),
    search(query, options) {
      assert.equal(options.limit, 8);
      assert.deepEqual(Object.keys(options), ['limit']);
      if (searchMode === 'throw') throw new Error('private-search-error');
      if (searchMode === 'duplicate') {
        const entry = base.getEntryByKey('running');
        return [entry, entry];
      }
      return base.search(query, options);
    }
  };
  const { shell, panel } = mountRuntime(runtime, {
    semantics,
    confirmDiscard() {
      confirmCalls += 1;
      return false;
    },
    loadLastPerformance() {
      lookupCalls += 1;
      return Promise.resolve(null);
    }
  });
  shell.open({ opener: runtime.opener });
  const search = panel.querySelector('input');
  const hint = panel.querySelector('.activity-v2-session-search-status');
  assert.match(hint.textContent, /Suche/);
  assert.equal(search.getAttribute('aria-expanded'), 'false');

  typeSearch(panel, '---');
  assert.equal(search.getAttribute('aria-expanded'), 'false');
  assert.equal(lookupCalls, 0);
  typeSearch(panel, 'kein-sicherer-treffer-xyz');
  assert.equal(
    hint.textContent,
    'Keine passende Übung oder Aktivität gefunden.'
  );
  assert.equal(search.getAttribute('aria-expanded'), 'true');

  searchMode = 'duplicate';
  typeSearch(panel, 'running');
  assert.match(hint.textContent, /Suche ist derzeit nicht verfügbar/);
  assert.equal(runtime.draft.getSnapshot().items.length, 0);
  searchMode = 'throw';
  typeSearch(panel, 'running');
  assert.match(hint.textContent, /Suche ist derzeit nicht verfügbar/);
  assert.doesNotMatch(hint.textContent, /private-search-error/);

  searchMode = 'valid';
  typeSearch(panel, 'High Row');
  const arrow = pressKey(runtime, search, 'ArrowDown');
  assert.equal(arrow.defaultPrevented, true);
  assert.equal(
    runtime.document.activeElement.dataset.itemKey,
    'high_row'
  );
  runtime.document.activeElement = search;
  pressKey(runtime, search, 'Enter');
  assert.equal(runtime.draft.getSnapshot().items[0].item_key, 'high_row');
  assert.equal(lookupCalls, 1);

  typeSearch(panel, 'Leg Curl');
  const firstEscape = pressKey(runtime, search, 'Escape');
  assert.equal(firstEscape.defaultPrevented, true);
  assert.equal(firstEscape.propagationStopped, true);
  assert.equal(search.value, 'Leg Curl');
  assert.equal(search.getAttribute('aria-expanded'), 'false');
  assert.equal(confirmCalls, 0);
  const reopen = pressKey(runtime, search, 'ArrowDown');
  assert.equal(reopen.defaultPrevented, true);
  assert.equal(search.getAttribute('aria-expanded'), 'true');
  assert.equal(runtime.document.activeElement.dataset.itemKey, 'leg_curl');
  pressKey(runtime, runtime.document.activeElement, 'Escape');
  const secondEscape = pressKey(runtime, search, 'Escape');
  await settle();
  assert.equal(secondEscape.defaultPrevented, true);
  assert.equal(confirmCalls, 1);
  assert.equal(shell.isOpen(), true);
});

test('lookup callback is request-free while hidden and cached once per key and mount', async () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  runtime.draft.addItem('running');
  const calls = [];
  const pending = new Map();
  const { shell, panel } = mountRuntime(runtime, {
    loadLastPerformance(itemKey) {
      calls.push(itemKey);
      const wait = deferred();
      pending.set(itemKey, wait);
      return wait.promise;
    }
  });
  assert.deepEqual(calls, []);
  shell.open({ opener: runtime.opener });
  assert.deepEqual(calls, ['bench_press', 'running']);
  assert.equal(
    panel.querySelectorAll('.activity-v2-session-history').every(
      (region) => /wird geladen/.test(region.textContent)
    ),
    true
  );

  shell.render();
  panel.querySelector('.activity-v2-session-note').value = 'Ruhig';
  panel.dispatchEvent({
    type: 'input',
    target: panel.querySelector('.activity-v2-session-note')
  });
  click(panel, actionElement(panel, 'move-down', 'bench_press'));
  assert.deepEqual(calls, ['bench_press', 'running']);

  pending.get('bench_press').resolve(null);
  pending.get('running').resolve(makeLookupResult(runtime, 'running'));
  await settle();
  typeSearch(panel, 'Bench Press');
  selectSearchResult(panel, 'bench_press');
  assert.deepEqual(calls, ['bench_press', 'running']);
  click(panel, actionElement(panel, 'remove', 'bench_press'));
  typeSearch(panel, 'Bench Press');
  selectSearchResult(panel, 'bench_press');
  assert.deepEqual(calls, ['bench_press', 'running']);
  assert.match(
    panel.querySelectorAll('.activity-v2-session-history').find(
      (region) => region.dataset.itemKey === 'bench_press'
    ).textContent,
    /Noch kein vorheriger Eintrag/
  );
});

test('T-ACT-R9-16 refreshLastPerformance fences generations and returns terminal cache states', async () => {
  let runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('running');
  const waits = [deferred(), deferred(), deferred()];
  const calls = [];
  let callIndex = 0;
  let mounted = mountRuntime(runtime, {
    loadLastPerformance(itemKey) {
      calls.push(itemKey);
      return waits[callIndex++].promise;
    }
  });
  assert.deepEqual(Object.keys(mounted.shell), [
    'open',
    'render',
    'requestClose',
    'isOpen',
    'refreshLastPerformance',
    'destroy'
  ]);
  mounted.shell.open({ opener: runtime.opener });
  assert.deepEqual(calls, ['running']);

  const refreshed = mounted.shell.refreshLastPerformance(['running', 'football']);
  assert.deepEqual(calls, ['running', 'running']);
  waits[0].resolve(makeLookupResult(runtime, 'running'));
  await settle();
  assert.match(
    mounted.panel.querySelector('.activity-v2-session-history').textContent,
    /wird geladen/
  );
  waits[1].resolve(null);
  const result = await refreshed;
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    status: 'success',
    items: [
      { item_key: 'running', status: 'empty' },
      { item_key: 'football', status: 'invalidated' }
    ]
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.items), true);
  assert.match(
    mounted.panel.querySelector('.activity-v2-session-history').textContent,
    /Noch kein vorheriger Eintrag/
  );

  const failed = mounted.shell.refreshLastPerformance(['running']);
  assert.deepEqual(calls, ['running', 'running', 'running']);
  waits[2].reject(new Error('private lookup failure'));
  assert.deepEqual(JSON.parse(JSON.stringify(await failed)), {
    status: 'error',
    items: [{ item_key: 'running', status: 'error' }]
  });
  assert.match(
    mounted.panel.querySelector('.activity-v2-session-history').textContent,
    /derzeit nicht verfügbar/
  );

  runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('running');
  let closedCalls = 0;
  mounted = mountRuntime(runtime, {
    loadLastPerformance() {
      closedCalls += 1;
      return Promise.resolve(null);
    }
  });
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(await mounted.shell.refreshLastPerformance(['running']))
    ),
    {
      status: 'success',
      items: [{ item_key: 'running', status: 'invalidated' }]
    }
  );
  assert.equal(closedCalls, 0);
  mounted.shell.open({ opener: runtime.opener });
  await settle();
  assert.equal(closedCalls, 1);

  const accessor = [];
  Object.defineProperty(accessor, '0', {
    enumerable: true,
    get() {
      throw new Error('must not execute');
    }
  });
  assert.equal(accessor.length, 1);
  await assert.rejects(
    mounted.shell.refreshLastPerformance(accessor),
    (error) => error?.code === 'INVALID_OPTIONS'
  );
  await assert.rejects(
    mounted.shell.refreshLastPerformance(['running', 'running']),
    (error) => error?.code === 'INVALID_OPTIONS'
  );
});

test('lookup renders immutable read-only success, empty, error and explicit retry', async () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  const raw = makeLookupResult(runtime, 'bench_press', {
    item: { item_label_snapshot: '<b>Historisches Bankdrücken</b>', note: '<img src=x onerror=alert(1)>' }
  });
  raw.item.sets.push({
    ...jsonClone(raw.item.sets[0]),
    id: '00000000-0000-4000-8000-000000000703',
    set_order: 2,
    reps: 13,
    weight_kg: 80
  });
  const attempts = new Map();
  const waits = new Map();
  const { shell, panel } = mountRuntime(runtime, {
    loadLastPerformance(itemKey) {
      attempts.set(itemKey, (attempts.get(itemKey) || 0) + 1);
      const wait = deferred();
      waits.set(`${itemKey}:${attempts.get(itemKey)}`, wait);
      return wait.promise;
    }
  });
  shell.open({ opener: runtime.opener });
  for (const key of ['bench_press', 'football', 'running']) {
    typeSearch(panel, runtime.semantics.getEntryByKey(key).label);
    selectSearchResult(panel, key);
  }
  const draftBefore = runtime.draft.getSnapshot();
  waits.get('bench_press:1').resolve(raw);
  waits.get('football:1').resolve(null);
  waits.get('running:1').reject(new Error('private lookup error'));
  await settle();

  const regions = panel.querySelectorAll('.activity-v2-session-history');
  const success = regions.find((region) => region.dataset.itemKey === 'bench_press');
  const empty = regions.find((region) => region.dataset.itemKey === 'football');
  const error = regions.find((region) => region.dataset.itemKey === 'running');
  assert.match(success.textContent, /Zuletzt am 01\.08\.2026/);
  const dayStart = shellSource.indexOf('function formatLookupDay');
  const dayEnd = shellSource.indexOf('function hasAtMostTwoDecimals');
  assert.ok(dayStart >= 0 && dayEnd > dayStart, 'formatLookupDay must be present');
  const dayFormatter = shellSource.slice(dayStart, dayEnd);
  assert.doesNotMatch(dayFormatter, /\bDate\b/);
  assert.match(success.textContent, /12 × 77,5 kg/);
  assert.match(success.textContent, /13 × 80 kg/);
  assert.match(success.textContent, /<b>Historisches Bankdrücken<\/b>/);
  assert.match(success.textContent, /<img src=x onerror=alert\(1\)>/);
  assert.equal(success.querySelectorAll('input').length, 0);
  assert.equal(success.querySelectorAll('[type="checkbox"]').length, 0);
  assert.match(empty.textContent, /Noch kein vorheriger Eintrag/);
  assert.match(error.textContent, /derzeit nicht verfügbar/);
  assert.ok(actionElement(panel, 'retry-lookup', 'running'));
  assert.equal(runtime.draft.getSnapshot(), draftBefore);

  raw.item.sets[0].reps = 999;
  raw.item.note = 'mutiert';
  assert.doesNotMatch(success.textContent, /999|mutiert/);
  shell.render();
  const rerendered = panel.querySelectorAll('.activity-v2-session-history').find(
    (region) => region.dataset.itemKey === 'bench_press'
  );
  assert.doesNotMatch(rerendered.textContent, /999|mutiert/);

  const retry = actionElement(panel, 'retry-lookup', 'running');
  click(panel, retry);
  click(panel, retry);
  assert.equal(attempts.get('running'), 2);
  assert.match(
    panel.querySelectorAll('.activity-v2-session-history').find(
      (region) => region.dataset.itemKey === 'running'
    ).textContent,
    /wird geladen/
  );
  waits.get('running:2').resolve(makeLookupResult(runtime, 'running'));
  await settle();
  assert.match(
    panel.querySelectorAll('.activity-v2-session-history').find(
      (region) => region.dataset.itemKey === 'running'
    ).textContent,
    /45 min.*5,25 km/
  );
  for (const key of ['football', 'running']) {
    assert.equal(itemInputElement(panel, key, 'duration_min').value, '');
    assert.equal(itemInputElement(panel, key, 'note').value, '');
    assert.equal(
      itemInputElement(panel, key, 'duration_min').getAttribute('placeholder'),
      null
    );
  }
  assert.equal(itemInputElement(panel, 'running', 'distance_km').value, '');
  assert.equal(runtime.draft.getSnapshot(), draftBefore);
});

test('lookup callback protocol handles disabled, throw, non-thenable, thenable and malformed success', async () => {
  let runtime = createRuntime({ useSemanticsV2: true });
  let mounted = mountRuntime(runtime);
  mounted.shell.open({ opener: runtime.opener });
  typeSearch(mounted.panel, 'Bench Press');
  selectSearchResult(mounted.panel, 'bench_press');
  assert.equal(mounted.panel.querySelectorAll('.activity-v2-session-history').length, 0);

  const cases = [
    () => { throw new Error('private sync throw'); },
    () => null,
    () => ({ then(resolve) { resolve(null); } }),
    (activeRuntime) => Promise.resolve({
      ...makeLookupResult(activeRuntime, 'bench_press'),
      extra: true
    })
  ];
  for (let index = 0; index < cases.length; index += 1) {
    runtime = createRuntime({ useSemanticsV2: true });
    let calls = 0;
    mounted = mountRuntime(runtime, {
      loadLastPerformance(itemKey) {
        calls += 1;
        assert.equal(itemKey, 'bench_press');
        return cases[index](runtime);
      }
    });
    mounted.shell.open({ opener: runtime.opener });
    typeSearch(mounted.panel, 'Bench Press');
    selectSearchResult(mounted.panel, 'bench_press');
    await settle();
    const region = mounted.panel.querySelector('.activity-v2-session-history');
    assert.equal(calls, 1);
    if (index === 2) assert.match(region.textContent, /Noch kein vorheriger Eintrag/);
    else assert.match(region.textContent, /derzeit nicht verfügbar/);
    assert.doesNotMatch(region.textContent, /private sync throw/);
  }

  runtime = createRuntime({ useSemanticsV2: true });
  const invalidPolicy = makeLookupResult(runtime, 'bench_press');
  invalidPolicy.item.field_policy_snapshot.note = 'forbidden';
  mounted = mountRuntime(runtime, {
    loadLastPerformance: () => Promise.resolve(invalidPolicy)
  });
  mounted.shell.open({ opener: runtime.opener });
  typeSearch(mounted.panel, 'Bench Press');
  selectSearchResult(mounted.panel, 'bench_press');
  await settle();
  assert.match(
    mounted.panel.querySelector('.activity-v2-session-history').textContent,
    /derzeit nicht verfügbar/
  );

  const invalidTimestampMutations = [
    (result) => { result.session.started_at = '2026-13-01T09:00:00.000000Z'; },
    (result) => { result.item.created_at = '2026-02-30T10:00:00.000000Z'; },
    (result) => { result.item.sets[0].created_at = '2026-08-01T24:00:00.000000Z'; }
  ];
  for (const mutate of invalidTimestampMutations) {
    runtime = createRuntime({ useSemanticsV2: true });
    const invalidTimestamp = makeLookupResult(runtime, 'bench_press');
    mutate(invalidTimestamp);
    mounted = mountRuntime(runtime, {
      loadLastPerformance: () => Promise.resolve(invalidTimestamp)
    });
    mounted.shell.open({ opener: runtime.opener });
    typeSearch(mounted.panel, 'Bench Press');
    selectSearchResult(mounted.panel, 'bench_press');
    await settle();
    assert.match(
      mounted.panel.querySelector('.activity-v2-session-history').textContent,
      /derzeit nicht verfügbar/
    );
  }
});

test('lookup formats set duration, set distance and assistance from snapshots', async () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  for (const key of ['assisted_pull_up', 'plank', 'farmer_carry']) {
    runtime.draft.addItem(key);
  }
  const { shell, panel } = mountRuntime(runtime, {
    loadLastPerformance: (itemKey) => Promise.resolve(makeLookupResult(runtime, itemKey))
  });
  shell.open({ opener: runtime.opener });
  await settle();
  const byKey = new Map(
    panel.querySelectorAll('.activity-v2-session-history').map((region) => [
      region.dataset.itemKey,
      region.textContent
    ])
  );
  assert.match(byKey.get('assisted_pull_up'), /12 × 40 kg Unterstützung/);
  assert.match(byKey.get('plank'), /45 s/);
  assert.match(byKey.get('farmer_carry'), /30 m/);
});

test('lookup races keep late remove, close, guard and destroy settlements cache-only', async () => {
  let runtime = createRuntime({ useSemanticsV2: true });
  let wait = deferred();
  let calls = 0;
  let mounted = mountRuntime(runtime, {
    loadLastPerformance() {
      calls += 1;
      return wait.promise;
    }
  });
  mounted.shell.open({ opener: runtime.opener });
  typeSearch(mounted.panel, 'Bench Press');
  selectSearchResult(mounted.panel, 'bench_press');
  click(mounted.panel, actionElement(mounted.panel, 'remove', 'bench_press'));
  wait.resolve(makeLookupResult(runtime, 'bench_press'));
  await settle();
  assert.equal(mounted.panel.querySelectorAll('.activity-v2-session-history').length, 0);
  typeSearch(mounted.panel, 'Bench Press');
  selectSearchResult(mounted.panel, 'bench_press');
  assert.equal(calls, 1);
  assert.match(
    mounted.panel.querySelector('.activity-v2-session-history').textContent,
    /Zuletzt am/
  );

  runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  wait = deferred();
  const draftFacade = Object.freeze({
    getSnapshot: () => runtime.draft.getSnapshot(),
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem: (key) => runtime.draft.addItem(key),
    removeItem: (key) => runtime.draft.removeItem(key),
    moveItem: (key, order) => runtime.draft.moveItem(key, order),
    setNote: (note) => runtime.draft.setNote(note),
    discard() {},
    addSet: (key) => runtime.draft.addSet(key),
    removeSet: (key, order) => runtime.draft.removeSet(key, order),
    setSetField: (key, order, field, value) =>
      runtime.draft.setSetField(key, order, field, value),
    setItemField: (key, field, value) =>
      runtime.draft.setItemField(key, field, value)
  });
  calls = 0;
  mounted = mountRuntime(runtime, {
    draft: draftFacade,
    confirmDiscard: () => true,
    loadLastPerformance() {
      calls += 1;
      return wait.promise;
    }
  });
  mounted.shell.open({ opener: runtime.opener });
  assert.equal(await mounted.shell.requestClose(), true);
  assert.equal(mounted.shell.isOpen(), false);
  wait.resolve(makeLookupResult(runtime, 'bench_press'));
  await settle();
  assert.equal(mounted.panel.hidden, true);
  mounted.shell.open({ opener: runtime.opener });
  assert.equal(calls, 1);
  assert.match(mounted.panel.querySelector('.activity-v2-session-history').textContent, /Zuletzt am/);

  runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('running');
  const lookupWait = deferred();
  const guardWait = deferred();
  mounted = mountRuntime(runtime, {
    confirmDiscard: () => guardWait.promise,
    loadLastPerformance: () => lookupWait.promise
  });
  mounted.shell.open({ opener: runtime.opener });
  const close = actionElement(mounted.panel, 'close');
  close.focus();
  const closing = mounted.shell.requestClose('close_button');
  await settle();
  lookupWait.resolve(makeLookupResult(runtime, 'running'));
  await settle();
  assert.match(mounted.panel.querySelector('.activity-v2-session-history').textContent, /wird geladen/);
  assert.equal(runtime.document.activeElement, close);
  guardWait.resolve(false);
  assert.equal(await closing, false);
  assert.match(mounted.panel.querySelector('.activity-v2-session-history').textContent, /Zuletzt am/);
  assert.equal(runtime.document.activeElement, close);
  assert.match(mounted.panel.querySelector('.activity-v2-session-status').textContent, /nicht verworfen/);

  runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('running');
  wait = deferred();
  mounted = mountRuntime(runtime, { loadLastPerformance: () => wait.promise });
  mounted.shell.open({ opener: runtime.opener });
  const panel = mounted.panel;
  mounted.shell.destroy();
  wait.resolve(makeLookupResult(runtime, 'running'));
  await settle();
  assert.equal(panel.isConnected, false);
  assert.equal(runtime.document.activeElement, runtime.opener);
});

test('move, remove and note interactions keep DOM order, draft order and focus aligned', async () => {
  const runtime = createRuntime();
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const firstKey = 'ab_wheel_rollout';
  const secondKey = 'back_extension';
  typeSearch(panel, runtime.semantics.getEntryByKey(firstKey).label);
  selectSearchResult(panel, firstKey);
  typeSearch(panel, runtime.semantics.getEntryByKey(secondKey).label);
  selectSearchResult(panel, secondKey);
  assert.deepEqual(
    Array.from(runtime.draft.getSnapshot().items, (item) => item.item_key),
    [firstKey, secondKey]
  );

  click(panel, actionElement(panel, 'move-down', firstKey));
  assert.deepEqual(
    Array.from(runtime.draft.getSnapshot().items, (item) => item.item_key),
    [secondKey, firstKey]
  );
  assert.equal(runtime.document.activeElement.dataset.itemKey, firstKey);
  assert.equal(runtime.document.activeElement.dataset.action, 'move-up');
  assert.deepEqual(
    panel.querySelectorAll('.activity-v2-session-item').map((row) => row.dataset.itemKey),
    [secondKey, firstKey]
  );

  click(panel, actionElement(panel, 'remove', secondKey));
  assert.deepEqual(
    Array.from(runtime.draft.getSnapshot().items, (item) => item.item_key),
    [firstKey]
  );
  assert.equal(runtime.document.activeElement.dataset.itemKey, firstKey);

  const note = panel.querySelector('.activity-v2-session-note');
  note.value = '  Ruhig und sauber  ';
  panel.dispatchEvent({ type: 'input', target: note });
  assert.equal(runtime.draft.getSnapshot().note, 'Ruhig und sauber');
  const dirty = runtime.draft.getSnapshot();
  assert.equal(await shell.requestClose('close_button'), false);
  assert.equal(shell.isOpen(), true);
  assert.equal(runtime.draft.getSnapshot(), dirty);
  assert.match(panel.querySelector('.activity-v2-session-status').textContent, /nicht verworfen/);
});

test('timer uses epoch reads, one scheduler and visible-only repaint triggers', () => {
  let now = 1_722_509_200_000;
  const runtime = createRuntime({ now: () => now, requireTimerReceiver: true });
  const { shell, panel } = mountRuntime(runtime, {
    setIntervalFn: undefined,
    clearIntervalFn: undefined
  });
  shell.open({ opener: runtime.opener });
  const timer = panel.querySelector('.activity-v2-session-timer');

  assert.equal(timer.textContent, '00:00');
  assert.equal(runtime.intervals.size, 0);
  typeSearch(panel, 'Ab Wheel Rollout');
  selectSearchResult(panel, 'ab_wheel_rollout');
  assert.equal(runtime.intervals.size, 1);
  const interval = [...runtime.intervals.values()][0];
  assert.equal(interval.delay, 1000);

  now += 65_400;
  interval.callback();
  assert.equal(timer.textContent, '01:05');
  shell.render();
  assert.equal(runtime.intervals.size, 1);

  runtime.document.visibilityState = 'hidden';
  now += 60_000;
  runtime.document.dispatchEvent({ type: 'visibilitychange' });
  assert.equal(timer.textContent, '01:05');
  runtime.document.visibilityState = 'visible';
  runtime.document.dispatchEvent({ type: 'visibilitychange' });
  assert.equal(timer.textContent, '02:05');

  shell.destroy();
  assert.equal(runtime.intervals.size, 0);
  assert.equal(runtime.document.listeners.get('visibilitychange').size, 0);
});

test('dirty close coalesces confirmation, restores focus on cancel and discards before close', async () => {
  const runtime = createRuntime();
  const confirmations = [];
  const { shell, panel } = mountRuntime(runtime, {
    confirmDiscard(context) {
      return new Promise((resolve) => confirmations.push({ context, resolve }));
    }
  });
  shell.open({ opener: runtime.opener });
  typeSearch(panel, 'Ab Wheel Rollout');
  selectSearchResult(panel, 'ab_wheel_rollout');
  const dirty = runtime.draft.getSnapshot();
  const focused = actionElement(panel, 'remove', dirty.items[0].item_key);
  focused.focus();

  const first = shell.requestClose('close_button');
  const coalesced = shell.requestClose('escape');
  assert.equal(first, coalesced);
  await Promise.resolve();
  assert.equal(confirmations.length, 1);
  assertFrozenTree(confirmations[0].context);
  assert.equal(
    confirmations[0].context.message,
    'Session verwerfen? Deine bisherigen Änderungen gehen verloren.'
  );
  assert.equal(confirmations[0].context.source, 'close_button');
  assert.equal(confirmations[0].context.snapshot, dirty);
  confirmations[0].resolve(1);
  assert.equal(await first, false);
  assert.equal(shell.isOpen(), true);
  assert.equal(runtime.draft.getSnapshot(), dirty);
  assert.equal(runtime.document.activeElement, focused);
  assert.equal(runtime.intervals.size, 1);

  const second = shell.requestClose('api');
  await Promise.resolve();
  assert.equal(confirmations.length, 2);
  confirmations[1].resolve(true);
  assert.equal(await second, true);
  assert.equal(shell.isOpen(), false);
  assert.equal(runtime.draft.getSnapshot().revision, 0);
  assert.notEqual(runtime.draft.getSnapshot().request_id, dirty.request_id);
  assert.equal(runtime.intervals.size, 0);
  assert.equal(runtime.document.listeners.get('keydown').size, 0);
  assert.equal(runtime.document.listeners.get('visibilitychange').size, 0);
  assert.equal(runtime.document.activeElement, runtime.opener);
});

test('Escape uses the shared discard guard and the default confirm receives its message', async () => {
  let confirmArgument;
  const runtime = createRuntime({
    confirm(argument) {
      confirmArgument = argument;
      return false;
    }
  });
  const shell = runtime.shellApi.mount({
    host: runtime.document.body,
    draft: runtime.draft,
    semantics: runtime.semantics,
    setIntervalFn: runtime.context.setInterval,
    clearIntervalFn: runtime.context.clearInterval
  });
  const panel = runtime.document.body.children.find((child) =>
    child.className.split(/\s+/).includes('activity-v2-session-shell')
  );
  shell.open({ opener: runtime.opener });
  typeSearch(panel, 'Ab Wheel Rollout');
  selectSearchResult(panel, 'ab_wheel_rollout');
  const escape = { type: 'keydown', key: 'Escape' };
  runtime.document.dispatchEvent(escape);
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(escape.defaultPrevented, true);
  assert.equal(
    confirmArgument,
    'Session verwerfen? Deine bisherigen Änderungen gehen verloren.'
  );
  assert.equal(shell.isOpen(), true);
});

test('confirmation and discard failures preserve draft, timer, focus and open shell', async () => {
  const runtime = createRuntime();
  runtime.draft.addItem('ab_wheel_rollout');
  const dirty = runtime.draft.getSnapshot();
  let confirmationCall = 0;
  let discardCalls = 0;
  const failingDraft = Object.freeze({
    getSnapshot: () => runtime.draft.getSnapshot(),
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem: (key) => runtime.draft.addItem(key),
    removeItem: (key) => runtime.draft.removeItem(key),
    moveItem: (key, order) => runtime.draft.moveItem(key, order),
    setNote: (note) => runtime.draft.setNote(note),
    discard() {
      discardCalls += 1;
      throw new Error('private discard detail');
    },
    addSet: (key) => runtime.draft.addSet(key),
    removeSet: (key, order) => runtime.draft.removeSet(key, order),
    setSetField: (key, order, field, value) =>
      runtime.draft.setSetField(key, order, field, value),
    setItemField: (key, field, value) =>
      runtime.draft.setItemField(key, field, value)
  });
  const { shell, panel } = mountRuntime(runtime, {
    draft: failingDraft,
    confirmDiscard() {
      confirmationCall += 1;
      if (confirmationCall === 1) throw new Error('private confirm detail');
      if (confirmationCall === 2) return Promise.reject(new Error('private rejection'));
      return true;
    }
  });
  shell.open({ opener: runtime.opener });
  const focused = actionElement(panel, 'remove', dirty.items[0].item_key);
  focused.focus();

  assert.equal(await shell.requestClose(), false);
  assert.equal(await shell.requestClose(), false);
  assert.equal(await shell.requestClose(), false);
  assert.equal(discardCalls, 1);
  assert.equal(shell.isOpen(), true);
  assert.equal(runtime.draft.getSnapshot(), dirty);
  assert.equal(runtime.document.activeElement, focused);
  assert.equal(runtime.intervals.size, 1);
  itemElement(panel, 'ab_wheel_rollout')
    .querySelectorAll('.activity-v2-session-set-input')
    .forEach((input) => assert.equal(input.disabled, false));
  assert.equal(actionElement(panel, 'add-set', 'ab_wheel_rollout').disabled, false);
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    'Die Session konnte nicht verworfen werden.'
  );
  assert.doesNotMatch(
    panel.querySelector('.activity-v2-session-status').textContent,
    /private/i
  );
});

test('optional recovery validates exact ownership and state before DOM mutation', () => {
  let runtime = createRuntime();
  let before = runtime.document.body.children.length;
  assertShellError(
    () => mountRuntime(runtime, { recovery: {} }),
    'INVALID_RECOVERY_API'
  );
  assert.equal(runtime.document.body.children.length, before);

  runtime = createRuntime();
  before = runtime.document.body.children.length;
  const otherDraft = createRuntime().draft;
  const mismatch = createRecoveryFacade(
    otherDraft,
    recoveryState('active')
  ).facade;
  assertShellError(
    () => mountRuntime(runtime, { recovery: mismatch }),
    'RECOVERY_DRAFT_MISMATCH'
  );
  assert.equal(runtime.document.body.children.length, before);

  runtime = createRuntime();
  before = runtime.document.body.children.length;
  const invalidState = createRecoveryFacade(
    runtime.draft,
    Object.freeze({
      state: 'saved',
      started_at: null,
      saved_at: null,
      item_count: -1,
      reason: null
    })
  ).facade;
  assertShellError(
    () => mountRuntime(runtime, { recovery: invalidState }),
    'INVALID_RECOVERY_STATE'
  );
  assert.equal(runtime.document.body.children.length, before);

  runtime = createRuntime();
  before = runtime.document.body.children.length;
  const invalidSubscription = createRecoveryFacade(
    runtime.draft,
    recoveryState('active'),
    { subscribe: () => null }
  ).facade;
  assertShellError(
    () => mountRuntime(runtime, { recovery: invalidSubscription }),
    'INVALID_RECOVERY_API'
  );
  assert.equal(runtime.document.body.children.length, before);
});

test('recovery status patches only its polite region and preserves draft UI state', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  const rawDraft = runtime.draft;
  let snapshotReads = 0;
  let timerReads = 0;
  const managedDraft = deepFreeze({
    getSnapshot() {
      snapshotReads += 1;
      return rawDraft.getSnapshot();
    },
    getTimerSnapshot() {
      timerReads += 1;
      return rawDraft.getTimerSnapshot();
    },
    addItem: (key) => rawDraft.addItem(key),
    removeItem: (key) => rawDraft.removeItem(key),
    moveItem: (key, order) => rawDraft.moveItem(key, order),
    setNote: (note) => rawDraft.setNote(note),
    discard: () => {
      throw new Error('raw managed discard must not run');
    },
    addSet: (key) => rawDraft.addSet(key),
    removeSet: (key, order) => rawDraft.removeSet(key, order),
    setSetField: (key, order, field, value) =>
      rawDraft.setSetField(key, order, field, value),
    setItemField: (key, field, value) =>
      rawDraft.setItemField(key, field, value)
  });
  const initialSnapshot = rawDraft.getSnapshot();
  const recovery = createRecoveryFacade(
    managedDraft,
    recoveryState('active', {
      started_at: initialSnapshot.started_at,
      item_count: 1
    })
  );
  const { shell, panel } = mountRuntime(runtime, {
    draft: managedDraft,
    recovery: recovery.facade,
    loadLastPerformance: () => Promise.resolve(null)
  });
  shell.open({ opener: runtime.opener });
  const input = setInputElement(panel, 'bench_press', 1, 'reps');
  input.value = '8';
  input.focus();
  const history = panel.querySelector('.activity-v2-session-history');
  const timerText = panel.querySelector('.activity-v2-session-timer').textContent;
  const generalStatus = panel.querySelector('.activity-v2-session-status');
  const recoveryStatus = panel.querySelector(
    '.activity-v2-session-recovery-status'
  );
  assert.equal(recoveryStatus.getAttribute('role'), 'status');
  assert.equal(recoveryStatus.getAttribute('aria-live'), 'polite');
  assert.equal(
    panel.querySelector('.activity-v2-session-lead').textContent,
    'Baue dein Training Schritt für Schritt auf. Die Session wird lokal auf diesem Gerät gesichert.'
  );

  snapshotReads = 0;
  timerReads = 0;
  const states = [
    ['saving', 'Wird lokal gesichert …', 'notice', null],
    ['saved', 'Lokal gesichert', 'success', null],
    [
      'degraded',
      'Lokale Wiederherstellung derzeit nicht garantiert.',
      'error',
      'storage_error'
    ],
    [
      'conflict',
      'Die Session wurde in einem anderen Tab verändert. Bitte neu laden, bevor du sie lokal weiter sicherst oder verwirfst.',
      'error',
      'conflict'
    ]
  ];
  states.forEach(([state, message, tone, reason]) => {
    recovery.emit(
      recoveryState(state, {
        started_at: initialSnapshot.started_at,
        saved_at:
          state === 'saved' ? '2026-08-09T08:00:00.000Z' : null,
        item_count: 1,
        reason
      })
    );
    assert.equal(recoveryStatus.textContent, message);
    assert.equal(recoveryStatus.dataset.tone, tone);
    assert.equal(panel.querySelector('.activity-v2-session-history'), history);
    assert.equal(panel.querySelector('.activity-v2-session-timer').textContent, timerText);
    assert.equal(input.value, '8');
    assert.equal(runtime.document.activeElement, input);
    assert.equal(generalStatus.textContent, '');
  });
  assert.equal(snapshotReads, 0);
  assert.equal(timerReads, 0);

  shell.destroy();
  assert.equal(recovery.getUnsubscribeCalls(), 1);
  assert.equal(recovery.getDestroyCalls(), 0);
});

test('recovery close awaits only persistent discard and failure remains retryable', async () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  const dirty = runtime.draft.getSnapshot();
  let rawDiscardCalls = 0;
  const managedDraft = deepFreeze({
    getSnapshot: () => runtime.draft.getSnapshot(),
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem: (key) => runtime.draft.addItem(key),
    removeItem: (key) => runtime.draft.removeItem(key),
    moveItem: (key, order) => runtime.draft.moveItem(key, order),
    setNote: (note) => runtime.draft.setNote(note),
    discard() {
      rawDiscardCalls += 1;
      throw new Error('raw managed discard must not run');
    },
    addSet: (key) => runtime.draft.addSet(key),
    removeSet: (key, order) => runtime.draft.removeSet(key, order),
    setSetField: (key, order, field, value) =>
      runtime.draft.setSetField(key, order, field, value),
    setItemField: (key, field, value) =>
      runtime.draft.setItemField(key, field, value)
  });
  const firstDiscard = deferred();
  const secondDiscard = deferred();
  const recovery = createRecoveryFacade(
    managedDraft,
    recoveryState('saved', {
      started_at: dirty.started_at,
      saved_at: '2026-08-09T08:00:00.000Z',
      item_count: 1
    }),
    {
      discard({ emit, getDiscardCalls }) {
        emit(
          recoveryState('discarding', {
            started_at: dirty.started_at,
            saved_at: '2026-08-09T08:00:00.000Z',
            item_count: 1
          })
        );
        return (getDiscardCalls() === 1 ? firstDiscard.promise : secondDiscard.promise)
          .then(() => {
            emit(recoveryState('destroyed'));
          })
          .catch((error) => {
            emit(
              recoveryState('degraded', {
                started_at: dirty.started_at,
                saved_at: '2026-08-09T08:00:00.000Z',
                item_count: 1,
                reason: 'storage_error'
              })
            );
            throw error;
          });
      }
    }
  );
  const { shell, panel } = mountRuntime(runtime, {
    draft: managedDraft,
    recovery: recovery.facade,
    confirmDiscard: () => true,
    loadLastPerformance: () => Promise.resolve(null)
  });
  shell.open({ opener: runtime.opener });
  const focused = actionElement(panel, 'remove', 'bench_press');
  focused.focus();
  const history = panel.querySelector('.activity-v2-session-history');
  const timerText = panel.querySelector('.activity-v2-session-timer').textContent;

  const failedClose = shell.requestClose('close_button');
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(shell.isOpen(), true);
  assert.equal(recovery.getDiscardCalls(), 1);
  assert.equal(
    panel.querySelector('.activity-v2-session-recovery-status').textContent,
    'Lokale Session wird verworfen …'
  );
  assert.equal(actionElement(panel, 'remove', 'bench_press').disabled, true);
  firstDiscard.reject(new Error('private storage detail'));
  assert.equal(await failedClose, false);
  assert.equal(shell.isOpen(), true);
  assert.equal(runtime.draft.getSnapshot(), dirty);
  assert.equal(runtime.document.activeElement, focused);
  assert.equal(panel.querySelector('.activity-v2-session-history'), history);
  assert.equal(panel.querySelector('.activity-v2-session-timer').textContent, timerText);
  assert.equal(actionElement(panel, 'remove', 'bench_press').disabled, false);
  assert.equal(
    panel.querySelector('.activity-v2-session-recovery-status').textContent,
    'Lokale Wiederherstellung derzeit nicht garantiert.'
  );
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    'Die Session konnte nicht verworfen werden.'
  );

  const successfulClose = shell.requestClose('escape');
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(recovery.getDiscardCalls(), 2);
  secondDiscard.resolve();
  assert.equal(await successfulClose, true);
  assert.equal(shell.isOpen(), false);
  assert.equal(rawDiscardCalls, 0);
  assert.equal(recovery.getDestroyCalls(), 0);
  assert.equal(runtime.draft.getSnapshot(), dirty);
  assert.equal(runtime.document.activeElement, runtime.opener);
});

test('destroy invalidates a pending confirmation without late discard or DOM effects', async () => {
  const runtime = createRuntime();
  runtime.draft.addItem('ab_wheel_rollout');
  const dirty = runtime.draft.getSnapshot();
  let resolveConfirmation;
  let discardCalls = 0;
  const guardedDraft = Object.freeze({
    getSnapshot: () => runtime.draft.getSnapshot(),
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem: (key) => runtime.draft.addItem(key),
    removeItem: (key) => runtime.draft.removeItem(key),
    moveItem: (key, order) => runtime.draft.moveItem(key, order),
    setNote: (note) => runtime.draft.setNote(note),
    discard() {
      discardCalls += 1;
      return runtime.draft.discard();
    },
    addSet: (key) => runtime.draft.addSet(key),
    removeSet: (key, order) => runtime.draft.removeSet(key, order),
    setSetField: (key, order, field, value) =>
      runtime.draft.setSetField(key, order, field, value),
    setItemField: (key, field, value) =>
      runtime.draft.setItemField(key, field, value)
  });
  const { shell, panel } = mountRuntime(runtime, {
    draft: guardedDraft,
    confirmDiscard: () =>
      new Promise((resolve) => {
        resolveConfirmation = resolve;
      })
  });
  shell.open({ opener: runtime.opener });
  const pending = shell.requestClose();
  await Promise.resolve();
  shell.destroy();
  resolveConfirmation(true);

  assert.equal(await pending, false);
  assert.equal(discardCalls, 0);
  assert.equal(runtime.draft.getSnapshot(), dirty);
  assert.equal(panel.isConnected, false);
  assert.equal(runtime.intervals.size, 0);
  assert.equal(runtime.document.listeners.get('keydown').size, 0);
  assert.equal(runtime.document.listeners.get('visibilitychange').size, 0);
});

test('draft-v3 item, set, policy and catalog violations fail before DOM mutation', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  runtime.draft.addItem('cross_trainer');
  runtime.draft.addItem('running');
  runtime.draft.setItemField('cross_trainer', 'duration_min', '1e2');
  runtime.draft.setItemField('running', 'duration_min', '000');
  runtime.draft.setItemField('running', 'distance_km', '05,20');
  runtime.draft.setItemField('running', 'note', '  raw note  ');
  const validSnapshot = runtime.draft.getSnapshot();
  let snapshot = validSnapshot;
  let timer = runtime.draft.getTimerSnapshot();
  const fakeDraft = Object.freeze({
    getSnapshot: () => snapshot,
    getTimerSnapshot: () => timer,
    addItem() {},
    removeItem() {},
    moveItem() {},
    setNote() {},
    discard() {},
    addSet() {},
    removeSet() {},
    setSetField() {},
    setItemField() {}
  });
  const { shell, panel } = mountRuntime(runtime, { draft: fakeDraft });
  const originalText = panel.textContent;

  const invalidMutations = [
    (candidate) => { candidate.items[0].item_order = 2; },
    (candidate) => { delete candidate.items[0].duration_min; },
    (candidate) => { candidate.items[0].duration_min = '12'; },
    (candidate) => { candidate.items[0].note = ''; },
    (candidate) => { candidate.items[0].note = '\u{1F600}'.repeat(501); },
    (candidate) => { candidate.items[1].distance_km = '5'; },
    (candidate) => { candidate.items[1].duration_min = ''; },
    (candidate) => { candidate.items[2].duration_min = 12; },
    (candidate) => { candidate.items[2].distance_km = '\u{1F600}'.repeat(33); },
    (candidate) => {
      const item = candidate.items[2];
      candidate.items[2] = {
        item_key: item.item_key,
        duration_min: item.duration_min,
        item_order: item.item_order,
        distance_km: item.distance_km,
        note: item.note,
        sets: item.sets
      };
    },
    (candidate) => { delete candidate.items[0].sets[0].reps; },
    (candidate) => { candidate.items[0].sets[0].set_order = 2; },
    (candidate) => { candidate.items[0].sets[0].reps = ''; },
    (candidate) => { candidate.items[0].sets[0].assistance_kg = '1'; },
    (candidate) => { candidate.items[0].sets[0].reps = '😀'.repeat(33); },
    (candidate) => { candidate.items[0].sets = []; }
  ];
  invalidMutations.forEach((mutate) => {
    const candidate = jsonClone(validSnapshot);
    mutate(candidate);
    snapshot = deepFreeze(candidate);
    assertShellError(() => shell.render(), 'INVALID_DRAFT_STATE');
    assert.equal(panel.textContent, originalText);
  });

  snapshot = deepFreeze({
    ...validSnapshot,
    catalog_version: validSnapshot.catalog_version + 1
  });
  assertShellError(() => shell.render(), 'CATALOG_VERSION_MISMATCH');
  assert.equal(panel.textContent, originalText);

  snapshot = validSnapshot;
  timer = deepFreeze({ running: true, elapsed_ms: 0, label: '00:01' });
  assertShellError(() => shell.render(), 'INVALID_DRAFT_STATE');
  assert.equal(panel.textContent, originalText);
});

test('expected draft failures stay open, preserve state and report a safe status', () => {
  const runtime = createRuntime();
  const snapshot = runtime.draft.getSnapshot();
  const fakeDraft = Object.freeze({
    getSnapshot: () => snapshot,
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem() {
      const error = new Error('private catalog detail');
      error.code = 'UNKNOWN_ITEM_KEY';
      throw error;
    },
    removeItem() {},
    moveItem() {},
    setNote() {},
    discard() {},
    addSet() {},
    removeSet() {},
    setSetField() {},
    setItemField() {}
  });
  const { shell, panel } = mountRuntime(runtime, { draft: fakeDraft });
  shell.open({ opener: runtime.opener });
  const picker = typeSearch(panel, 'Ab Wheel Rollout');
  selectSearchResult(panel, 'ab_wheel_rollout');

  const status = panel.querySelector('.activity-v2-session-status');
  assert.equal(shell.isOpen(), true);
  assert.equal(fakeDraft.getSnapshot(), snapshot);
  assert.equal(runtime.document.activeElement, picker);
  assert.equal(status.textContent, 'Die Aktion konnte nicht ausgeführt werden.');
  assert.doesNotMatch(status.textContent, /private|catalog detail/i);
});

test('strength editors retain all eight policies and expose only the shared item note', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  const setFields = [
    'reps',
    'duration_sec',
    'distance_m',
    'weight_kg',
    'assistance_kg'
  ];
  const labels = {
    reps: 'Wiederholungen',
    duration_sec: 'Dauer (Sek.)',
    distance_m: 'Distanz (m)',
    weight_kg: 'Gewicht (kg)',
    assistance_kg: 'Unterstützung (kg)'
  };
  const representatives = new Map();
  runtime.semantics.getCatalog().entries
    .filter((entry) => entry.status === 'active' && entry.tracking_mode === 'strength_sets')
    .forEach((entry) => {
      const signature = setFields.map((key) => entry.fields[key]).join('|');
      if (!representatives.has(signature)) representatives.set(signature, entry);
    });
  assert.equal(representatives.size, 8);
  representatives.forEach((entry) => runtime.draft.addItem(entry.key));
  const nonStrength = runtime.semantics.getCatalog().entries.find(
    (entry) => entry.status === 'active' && entry.tracking_mode !== 'strength_sets'
  );
  runtime.draft.addItem(nonStrength.key);

  const { shell, panel } = mountRuntime(runtime, {
    loadLastPerformance: () => Promise.resolve(null)
  });
  shell.open({ opener: runtime.opener });
  representatives.forEach((entry) => {
    const item = itemElement(panel, entry.key);
    const editor = editorElement(panel, entry.key);
    assert.ok(editor);
    assert.equal(editor.dataset.state, 'empty');
    assert.equal(item.querySelectorAll('.activity-v2-session-set-row').length, 3);
    assert.equal(item.querySelector('.activity-v2-session-history').querySelectorAll('input').length, 0);
    const allowed = setFields.filter((key) => entry.fields[key] !== 'forbidden');
    assert.deepEqual(
      item.querySelectorAll('.activity-v2-session-set-input')
        .filter((input) => input.dataset.setOrder === '1')
        .map((input) => input.dataset.fieldKey),
      allowed
    );
    allowed.forEach((fieldKey) => {
      const input = setInputElement(panel, entry.key, 1, fieldKey);
      const label = item.querySelectorAll('label').find(
        (candidate) => candidate.htmlFor === input.id
      );
      assert.equal(label.textContent, labels[fieldKey]);
      assert.equal(input.type, 'text');
      assert.equal(input.value, '');
      assert.equal(input.getAttribute('inputmode'),
        fieldKey === 'reps' || fieldKey === 'duration_sec' ? 'numeric' : 'decimal');
      assert.equal(input.maxLength, 32);
      assert.equal(input.getAttribute('maxlength'), '32');
      assert.equal(input.getAttribute('autocomplete'), 'off');
      assert.equal(input.getAttribute('spellcheck'), 'false');
      assert.equal(input.getAttribute('aria-invalid'), 'false');
      assert.ok(input.getAttribute('aria-describedby'));
      assert.equal(input.getAttribute('placeholder'), null);
    });
    const add = actionElement(panel, 'add-set', entry.key);
    assert.equal(add.textContent, '+ Satz');
    assert.equal(add.getAttribute('aria-label'), 'Satz hinzufügen');
    assert.equal(add.getAttribute('title'), 'Satz hinzufügen');
    const removeSets = item.querySelectorAll('button').filter(
      (button) => button.dataset.action === 'remove-set'
    );
    assert.equal(removeSets.length, 3);
    assert.equal(removeSets[0].getAttribute('aria-label'), 'Satz 1 entfernen');
    assert.equal(removeSets[0].getAttribute('title'), 'Satz 1 entfernen');
    assert.equal(item.querySelectorAll('button').filter(
      (button) => button.dataset.action === 'remove'
    ).length, 1);
    const validValues = {
      reps: '1',
      duration_sec: '1',
      distance_m: '0,1',
      weight_kg: '0,01',
      assistance_kg: '0,01'
    };
    allowed.forEach((fieldKey) => {
      inputSetField(panel, entry.key, 1, fieldKey, validValues[fieldKey]);
    });
    const draftItem = runtime.draft.getSnapshot().items.find(
      (candidate) => candidate.item_key === entry.key
    );
    setFields.forEach((fieldKey) => {
      assert.equal(
        draftItem.sets[0][fieldKey],
        allowed.includes(fieldKey) ? validValues[fieldKey] : null
      );
    });
    const note = itemInputElement(panel, entry.key, 'note');
    assert.equal(note.tagName, 'TEXTAREA');
    assert.equal(note.maxLength, 500);
    assert.equal(note.getAttribute('autocomplete'), 'off');
    assert.equal(note.getAttribute('placeholder'), null);
    inputItemField(panel, entry.key, 'note', `  ${entry.key}  `);
    assert.equal(
      runtime.draft.getSnapshot().items.find(
        (candidate) => candidate.item_key === entry.key
      ).note,
      `  ${entry.key}  `
    );
  });

  const neutralItem = itemElement(panel, nonStrength.key);
  assert.equal(neutralItem.querySelector('.activity-v2-session-strength-editor'), null);
  const itemEditor = neutralItem.querySelector('.activity-v2-session-item-editor');
  assert.ok(itemEditor);
  assert.equal(itemEditor.dataset.state, 'empty');
  assert.equal(itemInputElement(panel, nonStrength.key, 'duration_min').value, '');
  assert.equal(itemInputElement(panel, nonStrength.key, 'distance_km'), undefined);
  assert.equal(itemInputElement(panel, nonStrength.key, 'note').value, '');
  assert.equal(neutralItem.querySelectorAll('.activity-v2-session-set-input').length, 0);
});

test('all eleven real non-strength policies render exact accessible item controls', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  const entries = runtime.semantics.getCatalog().entries.filter(
    (entry) =>
      entry.status === 'active' && entry.tracking_mode !== 'strength_sets'
  );
  assert.equal(entries.length, 11);
  assert.equal(
    entries.filter((entry) => entry.tracking_mode === 'duration').length,
    4
  );
  assert.equal(
    entries.filter((entry) => entry.tracking_mode === 'duration_distance').length,
    7
  );
  entries.forEach((entry) => runtime.draft.addItem(entry.key));
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });

  entries.forEach((entry) => {
    const item = itemElement(panel, entry.key);
    const editor = item.querySelector('.activity-v2-session-item-editor');
    const duration = itemInputElement(panel, entry.key, 'duration_min');
    const distance = itemInputElement(panel, entry.key, 'distance_km');
    const note = itemInputElement(panel, entry.key, 'note');
    assert.equal(item.dataset.state, 'empty');
    assert.equal(editor.dataset.state, 'empty');
    assert.equal(duration.type, 'text');
    assert.equal(duration.getAttribute('inputmode'), 'numeric');
    assert.equal(duration.getAttribute('aria-required'), 'true');
    assert.equal(duration.getAttribute('aria-invalid'), 'false');
    assert.equal(duration.getAttribute('maxlength'), '32');
    assert.equal(duration.getAttribute('autocomplete'), 'off');
    assert.equal(duration.getAttribute('spellcheck'), 'false');
    assert.ok(duration.getAttribute('aria-describedby'));
    assert.equal(duration.getAttribute('placeholder'), null);
    if (entry.tracking_mode === 'duration_distance') {
      assert.equal(distance.type, 'text');
      assert.equal(distance.getAttribute('inputmode'), 'decimal');
      assert.equal(distance.getAttribute('aria-required'), null);
      assert.equal(distance.getAttribute('maxlength'), '32');
      assert.equal(distance.getAttribute('placeholder'), null);
    } else {
      assert.equal(distance, undefined);
    }
    assert.equal(note.tagName, 'TEXTAREA');
    assert.equal(note.getAttribute('maxlength'), '500');
    assert.equal(note.getAttribute('autocomplete'), 'off');
    assert.equal(note.getAttribute('placeholder'), null);
    [duration, ...(distance ? [distance] : []), note].forEach((control) => {
      const label = item.querySelectorAll('label').find(
        (candidate) => candidate.htmlFor === control.id
      );
      assert.ok(label);
    });

    inputItemField(panel, entry.key, 'duration_min', '0045');
    if (distance) inputItemField(panel, entry.key, 'distance_km', '5,25');
    inputItemField(panel, entry.key, 'note', `  ${entry.key}  `);
    assert.equal(item.dataset.state, 'complete');
    assert.equal(editor.dataset.state, 'complete');
    const draftItem = runtime.draft.getSnapshot().items.find(
      (candidate) => candidate.item_key === entry.key
    );
    assert.equal(draftItem.duration_min, '0045');
    assert.equal(draftItem.distance_km, distance ? '5,25' : null);
    assert.equal(draftItem.note, `  ${entry.key}  `);
    assert.equal(draftItem.sets.length, 0);
  });
});

test('set and item field definitions fail closed at their exact catalog boundaries', () => {
  const mutationCases = [
    (catalog) => { catalog.field_definitions.reps.max = 1000.5; },
    (catalog) => { catalog.field_definitions.weight_kg.max_decimals = 0; },
    (catalog) => { catalog.field_definitions.distance_m.unit = 'km'; },
    (catalog) => { delete catalog.field_definitions.duration_sec.min; },
    (catalog) => { catalog.field_definitions.assistance_kg.extra = true; },
    (catalog) => { catalog.field_definitions.duration_min.min = 2; },
    (catalog) => { catalog.field_definitions.duration_min.max = 2000; },
    (catalog) => { catalog.field_definitions.duration_min.max = 1440.5; },
    (catalog) => { catalog.field_definitions.distance_km.min = 0.1; },
    (catalog) => { catalog.field_definitions.distance_km.max = 2000; },
    (catalog) => { catalog.field_definitions.distance_km.max_decimals = 0; },
    (catalog) => { catalog.field_definitions.distance_km.max_decimals = 3; },
    (catalog) => { catalog.field_definitions.distance_km.unit = 'm'; },
    (catalog) => { catalog.field_definitions.note.trim = false; },
    (catalog) => { catalog.field_definitions.note.max_length = 499; },
    (catalog) => { catalog.field_definitions.note.extra = true; }
  ];
  mutationCases.forEach((mutate) => {
    const runtime = createRuntime({ useSemanticsV2: true });
    const catalog = jsonClone(runtime.semantics.getCatalog());
    mutate(catalog);
    const base = runtime.semantics;
    assertShellError(
      () => mountRuntime(runtime, {
        semantics: {
          getCatalog: () => catalog,
          getEntryByKey: (key) => base.getEntryByKey(key),
          normalizeSearchText: (query) => base.normalizeSearchText(query),
          search: (query, options) => base.search(query, options)
        }
      }),
      'INVALID_DRAFT_STATE'
    );
  });

  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  runtime.draft.removeSet('bench_press', 3);
  runtime.draft.removeSet('bench_press', 2);
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const onlyRemove = itemElement(panel, 'bench_press').querySelectorAll('button').find(
    (button) => button.dataset.action === 'remove-set'
  );
  assert.equal(onlyRemove.disabled, true);
  assert.equal(actionElement(panel, 'add-set', 'bench_press').disabled, false);
  for (let count = 1; count < 50; count += 1) runtime.draft.addSet('bench_press');
  shell.render();
  const maxAdd = actionElement(panel, 'add-set', 'bench_press');
  assert.equal(maxAdd.disabled, true);
  assert.equal(itemElement(panel, 'bench_press').querySelectorAll('button').filter(
    (button) => button.dataset.action === 'remove-set' && !button.disabled
  ).length, 50);
  const stable = runtime.draft.getSnapshot();
  click(panel, maxAdd);
  assert.equal(runtime.draft.getSnapshot(), stable);
});

test('Draft-first parser preserves raw values, node identity and exact R1 error states', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const reps = setInputElement(panel, 'bench_press', 1, 'reps');
  const weight = setInputElement(panel, 'bench_press', 1, 'weight_kg');
  reps.focus();

  const integerCases = [
    ['', 'empty', ''],
    ['01', 'valid', ''],
    ['0', 'invalid', 'Erlaubter Bereich: 1 bis 1000.'],
    ['1000', 'valid', ''],
    ['1001', 'invalid', 'Erlaubter Bereich: 1 bis 1000.'],
    ['1.0', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['-1', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['1e2', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['NaN', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['Infinity', 'invalid', 'Nur ganze Zahlen eingeben.'],
    [' 1', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['１', 'invalid', 'Nur ganze Zahlen eingeben.']
  ];
  integerCases.forEach(([raw, state, message]) => {
    const same = inputSetField(panel, 'bench_press', 1, 'reps', raw);
    assert.equal(same, reps);
    assert.equal(runtime.document.activeElement, reps);
    assert.equal(reps.value, raw);
    assert.equal(reps.parentNode.dataset.state, state);
    assert.equal(panel.querySelector(`#${reps.getAttribute('aria-describedby')}`).textContent, message);
    assert.equal(
      runtime.draft.getSnapshot().items[0].sets[0].reps,
      raw === '' ? null : raw
    );
  });

  inputSetField(panel, 'bench_press', 1, 'reps', '8');
  weight.focus();
  const decimalCases = [
    ['', 'empty', ''],
    ['1,', 'intermediate', ''],
    ['1.', 'intermediate', ''],
    ['01,20', 'valid', ''],
    ['1.2', 'valid', ''],
    ['0,01', 'valid', ''],
    ['1000', 'valid', ''],
    ['0', 'invalid', 'Erlaubter Bereich: 0,01 bis 1000.'],
    ['1000,01', 'invalid', 'Erlaubter Bereich: 0,01 bis 1000.'],
    ['1,234', 'invalid', 'Maximal 2 Nachkommastellen.'],
    [',5', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['.5', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['1,2.3', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['+1', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['1e2', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    [' 1', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['١', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.']
  ];
  decimalCases.forEach(([raw, state, message]) => {
    const same = inputSetField(panel, 'bench_press', 1, 'weight_kg', raw);
    assert.equal(same, weight);
    assert.equal(runtime.document.activeElement, weight);
    assert.equal(weight.value, raw);
    assert.equal(weight.parentNode.dataset.state, state);
    assert.equal(panel.querySelector(`#${weight.getAttribute('aria-describedby')}`).textContent, message);
    assert.equal(
      runtime.draft.getSnapshot().items[0].sets[0].weight_kg,
      raw === '' ? null : raw
    );
  });

  const beforeForgedEvent = runtime.draft.getSnapshot();
  const forged = runtime.document.createElement('input');
  forged.dataset.itemKey = 'bench_press';
  forged.dataset.setOrder = '1';
  forged.dataset.fieldKey = 'weight_kg';
  forged.value = '999';
  panel.dispatchEvent({ type: 'input', target: forged });
  assert.equal(runtime.draft.getSnapshot(), beforeForgedEvent);

  const stable = runtime.draft.getSnapshot();
  inputSetField(panel, 'bench_press', 1, 'weight_kg', '1'.repeat(33));
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(weight.value, stable.items[0].sets[0].weight_kg);
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    'Die Satzeingabe konnte nicht aktualisiert werden.'
  );
});

test('item parser preserves raw duration, distance and note with exact states and copy', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('running');
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const item = itemElement(panel, 'running');
  const duration = itemInputElement(panel, 'running', 'duration_min');
  const distance = itemInputElement(panel, 'running', 'distance_km');
  const note = itemInputElement(panel, 'running', 'note');
  duration.focus();

  const durationCases = [
    ['', 'empty', ''],
    ['0001', 'valid', ''],
    ['1440', 'valid', ''],
    ['0', 'invalid', 'Erlaubter Bereich: 1 bis 1440.'],
    ['1441', 'invalid', 'Erlaubter Bereich: 1 bis 1440.'],
    ['1,', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['1.0', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['-1', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['1e2', 'invalid', 'Nur ganze Zahlen eingeben.'],
    [' 1', 'invalid', 'Nur ganze Zahlen eingeben.'],
    ['\uFF11', 'invalid', 'Nur ganze Zahlen eingeben.']
  ];
  durationCases.forEach(([raw, state, message]) => {
    const same = inputItemField(panel, 'running', 'duration_min', raw);
    assert.equal(same, duration);
    assert.equal(runtime.document.activeElement, duration);
    assert.equal(duration.value, raw);
    assert.equal(duration.parentNode.dataset.state, state);
    assert.equal(
      duration.getAttribute('aria-invalid'),
      state === 'invalid' ? 'true' : 'false'
    );
    assert.equal(
      panel.querySelector(`#${duration.getAttribute('aria-describedby')}`)
        .textContent,
      message
    );
    assert.equal(
      runtime.draft.getSnapshot().items[0].duration_min,
      raw === '' ? null : raw
    );
  });

  inputItemField(panel, 'running', 'duration_min', '45');
  distance.focus();
  const distanceCases = [
    ['', 'empty', ''],
    ['1,', 'intermediate', ''],
    ['1.', 'intermediate', ''],
    ['01,20', 'valid', ''],
    ['0,01', 'valid', ''],
    ['1000,00', 'valid', ''],
    ['0', 'invalid', 'Erlaubter Bereich: 0,01 bis 1000.'],
    ['0,00', 'invalid', 'Erlaubter Bereich: 0,01 bis 1000.'],
    ['1000,01', 'invalid', 'Erlaubter Bereich: 0,01 bis 1000.'],
    ['1,234', 'invalid', 'Maximal 2 Nachkommastellen.'],
    [',5', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['.5', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['1,2.3', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['1.2,3', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['+1', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['1e2', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    [' 1', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.'],
    ['\u0661', 'invalid', 'Ziffern mit optionalem Komma oder Punkt eingeben.']
  ];
  distanceCases.forEach(([raw, state, message]) => {
    const same = inputItemField(panel, 'running', 'distance_km', raw);
    assert.equal(same, distance);
    assert.equal(runtime.document.activeElement, distance);
    assert.equal(distance.value, raw);
    assert.equal(distance.parentNode.dataset.state, state);
    assert.equal(
      distance.getAttribute('aria-invalid'),
      state === 'invalid' ? 'true' : 'false'
    );
    assert.equal(
      panel.querySelector(`#${distance.getAttribute('aria-describedby')}`)
        .textContent,
      message
    );
  });

  inputItemField(panel, 'running', 'distance_km', '5,25');
  inputItemField(panel, 'running', 'note', '  <img src=x>  ');
  assert.equal(note.value, '  <img src=x>  ');
  assert.equal(runtime.draft.getSnapshot().items[0].note, '  <img src=x>  ');
  assert.equal(item.dataset.state, 'complete');
  const fiveHundred = '\u{1F600}'.repeat(500);
  inputItemField(panel, 'running', 'note', fiveHundred);
  assert.equal(Array.from(note.value).length, 500);
  const stable = runtime.draft.getSnapshot();
  inputItemField(panel, 'running', 'note', '\u{1F600}'.repeat(501));
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(note.value, fiveHundred);
  assert.equal(runtime.document.activeElement, note);
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    'Die Aktivitätseingabe konnte nicht aktualisiert werden.'
  );
  inputItemField(panel, 'running', 'duration_min', '\u{1F600}'.repeat(33));
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(duration.value, '45');
  assert.equal(runtime.document.activeElement, duration);

  const forged = runtime.document.createElement('input');
  forged.dataset.itemKey = 'running';
  forged.dataset.fieldKey = 'duration_min';
  forged.value = '90';
  panel.dispatchEvent({ type: 'input', target: forged });
  assert.equal(runtime.draft.getSnapshot(), stable);
});

test('row and item validity derive partial, complete, invalid and prefix-gap states only', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  const optionalEntry = runtime.semantics.getCatalog().entries.find(
    (entry) =>
      entry.status === 'active' &&
      entry.tracking_mode === 'strength_sets' &&
      entry.fields.reps === 'required' &&
      entry.fields.weight_kg === 'optional'
  );
  runtime.draft.addItem(optionalEntry.key);
  runtime.draft.addItem('ab_wheel_rollout');
  runtime.draft.addItem('cross_trainer');
  runtime.draft.addItem('running');
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });

  assert.equal(editorElement(panel, 'bench_press').dataset.state, 'empty');
  inputSetField(panel, 'bench_press', 1, 'reps', '8');
  assert.equal(setRowElement(panel, 'bench_press', 1).dataset.state, 'partial');
  assert.equal(
    setRowElement(panel, 'bench_press', 1).querySelector('.activity-v2-session-set-status').textContent,
    'Satz unvollständig.'
  );
  assert.equal(editorElement(panel, 'bench_press').dataset.state, 'partial');
  inputSetField(panel, 'bench_press', 1, 'weight_kg', '80');
  assert.equal(setRowElement(panel, 'bench_press', 1).dataset.state, 'complete');
  assert.equal(editorElement(panel, 'bench_press').dataset.state, 'complete');
  inputSetField(panel, 'bench_press', 3, 'reps', '6');
  inputSetField(panel, 'bench_press', 3, 'weight_kg', '70');
  assert.equal(editorElement(panel, 'bench_press').dataset.state, 'invalid');
  assert.equal(
    editorElement(panel, 'bench_press').querySelector('.activity-v2-session-editor-status').textContent,
    'Leere Sätze sind nur am Ende erlaubt.'
  );
  inputSetField(panel, 'bench_press', 2, 'reps', '7');
  inputSetField(panel, 'bench_press', 2, 'weight_kg', '75');
  assert.equal(editorElement(panel, 'bench_press').dataset.state, 'complete');
  inputSetField(panel, 'bench_press', 2, 'weight_kg', '0');
  assert.equal(editorElement(panel, 'bench_press').dataset.state, 'invalid');
  assert.equal(setRowElement(panel, 'bench_press', 2).dataset.state, 'invalid');

  inputSetField(panel, optionalEntry.key, 1, 'reps', '10');
  assert.equal(setRowElement(panel, optionalEntry.key, 1).dataset.state, 'complete');
  assert.equal(editorElement(panel, optionalEntry.key).dataset.state, 'complete');
  assert.equal(itemElement(panel, optionalEntry.key).dataset.state, 'complete');
  inputItemField(panel, optionalEntry.key, 'note', 'optional note');
  assert.equal(editorElement(panel, optionalEntry.key).dataset.state, 'complete');
  assert.equal(itemElement(panel, optionalEntry.key).dataset.state, 'complete');

  inputItemField(panel, 'ab_wheel_rollout', 'note', 'note only');
  assert.equal(editorElement(panel, 'ab_wheel_rollout').dataset.state, 'empty');
  assert.equal(itemElement(panel, 'ab_wheel_rollout').dataset.state, 'partial');
  assert.equal(
    itemElement(panel, 'ab_wheel_rollout')
      .querySelector('.activity-v2-session-item-status').textContent,
    'Aktivität unvollständig.'
  );
  inputItemField(panel, 'ab_wheel_rollout', 'note', '');
  assert.equal(
    runtime.draft.getSnapshot().items.find(
      (item) => item.item_key === 'ab_wheel_rollout'
    ).note,
    null
  );
  assert.equal(itemElement(panel, 'ab_wheel_rollout').dataset.state, 'empty');

  const running = itemElement(panel, 'running');
  inputItemField(panel, 'running', 'note', 'note only');
  assert.equal(running.dataset.state, 'partial');
  inputItemField(panel, 'running', 'distance_km', '5');
  assert.equal(running.dataset.state, 'partial');
  inputItemField(panel, 'running', 'duration_min', '45');
  assert.equal(running.dataset.state, 'complete');
  inputItemField(panel, 'running', 'distance_km', '5,');
  assert.equal(running.dataset.state, 'partial');
  inputItemField(panel, 'running', 'distance_km', '0');
  assert.equal(running.dataset.state, 'invalid');
  inputItemField(panel, 'running', 'distance_km', '');
  assert.equal(running.dataset.state, 'complete');

  const durationOnly = itemElement(panel, 'cross_trainer');
  assert.equal(itemInputElement(panel, 'cross_trainer', 'distance_km'), undefined);
  inputItemField(panel, 'cross_trainer', 'duration_min', '30');
  assert.equal(durationOnly.dataset.state, 'complete');
});

test('set add, remove, item reorder and remove/re-add preserve focus, raw values and lookup cache', async () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  runtime.draft.addItem('ab_wheel_rollout');
  runtime.draft.addItem('running');
  let benchLookups = 0;
  const { shell, panel } = mountRuntime(runtime, {
    loadLastPerformance: (itemKey) => {
      if (itemKey === 'bench_press') benchLookups += 1;
      return Promise.resolve(null);
    }
  });
  shell.open({ opener: runtime.opener });
  await settle();
  inputSetField(panel, 'bench_press', 1, 'reps', '08');
  inputSetField(panel, 'bench_press', 1, 'weight_kg', '80,5');
  inputItemField(panel, 'bench_press', 'note', 'bench note');
  inputItemField(panel, 'running', 'duration_min', '45');
  inputItemField(panel, 'running', 'distance_km', '7,25');
  inputItemField(panel, 'running', 'note', 'run note');

  click(panel, actionElement(panel, 'add-set', 'bench_press'));
  assert.equal(runtime.draft.getSnapshot().items[0].sets.length, 4);
  assert.equal(runtime.document.activeElement, setInputElement(panel, 'bench_press', 4, 'reps'));
  inputSetField(panel, 'bench_press', 2, 'reps', '7');
  inputSetField(panel, 'bench_press', 2, 'weight_kg', '75');
  click(panel, itemElement(panel, 'bench_press').querySelectorAll('button').find(
    (button) => button.dataset.action === 'remove-set' && button.dataset.setOrder === '2'
  ));
  assert.equal(runtime.draft.getSnapshot().items[0].sets.length, 3);
  assert.equal(runtime.document.activeElement, setInputElement(panel, 'bench_press', 2, 'reps'));

  click(panel, actionElement(panel, 'move-down', 'bench_press'));
  let bench = runtime.draft.getSnapshot().items.find((item) => item.item_key === 'bench_press');
  assert.equal(bench.item_order, 2);
  assert.equal(bench.sets[0].reps, '08');
  assert.equal(bench.sets[0].weight_kg, '80,5');
  assert.equal(bench.note, 'bench note');
  assert.equal(setInputElement(panel, 'bench_press', 1, 'weight_kg').value, '80,5');
  assert.equal(itemInputElement(panel, 'bench_press', 'note').value, 'bench note');
  assert.equal(itemInputElement(panel, 'running', 'duration_min').value, '45');
  assert.equal(itemInputElement(panel, 'running', 'distance_km').value, '7,25');
  assert.equal(itemInputElement(panel, 'running', 'note').value, 'run note');

  click(panel, actionElement(panel, 'remove', 'bench_press'));
  typeSearch(panel, 'Bench Press');
  selectSearchResult(panel, 'bench_press');
  await settle();
  bench = runtime.draft.getSnapshot().items.find((item) => item.item_key === 'bench_press');
  assert.equal(bench.sets.length, 3);
  bench.sets.forEach((set) => {
    assert.equal(set.reps, null);
    assert.equal(set.weight_kg, null);
  });
  assert.equal(bench.note, null);
  const running = runtime.draft.getSnapshot().items.find(
    (item) => item.item_key === 'running'
  );
  assert.equal(running.duration_min, '45');
  assert.equal(running.distance_km, '7,25');
  assert.equal(running.note, 'run note');
  click(panel, actionElement(panel, 'move-up', 'running'));
  assert.equal(runtime.document.activeElement, actionElement(panel, 'move-down', 'running'));
  assert.equal(itemInputElement(panel, 'running', 'duration_min').value, '45');
  assert.equal(itemInputElement(panel, 'running', 'distance_km').value, '7,25');
  assert.equal(itemInputElement(panel, 'running', 'note').value, 'run note');
  assert.equal(benchLookups, 1);
  assert.ok(itemElement(panel, 'bench_press').querySelector('.activity-v2-session-history'));
});

test('pending close disables every draft mutation and restores controls and focus on cancel', async () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  let resolveConfirmation;
  const { shell, panel } = mountRuntime(runtime, {
    confirmDiscard: () => new Promise((resolve) => {
      resolveConfirmation = resolve;
    })
  });
  shell.open({ opener: runtime.opener });
  typeSearch(panel, 'Running');
  inputSetField(panel, 'bench_press', 1, 'reps', '8');
  const weight = inputSetField(panel, 'bench_press', 1, 'weight_kg', '80,');
  weight.focus();
  const stable = runtime.draft.getSnapshot();
  const pending = shell.requestClose('api');

  itemElement(panel, 'bench_press').querySelectorAll('.activity-v2-session-set-input')
    .forEach((input) => assert.equal(input.disabled, true));
  assert.equal(actionElement(panel, 'add-set', 'bench_press').disabled, true);
  itemElement(panel, 'bench_press').querySelectorAll('button')
    .filter((button) => button.dataset.action === 'remove-set')
    .forEach((button) => assert.equal(button.disabled, true));
  assert.equal(actionElement(panel, 'remove', 'bench_press').disabled, true);
  assert.equal(panel.querySelector('.activity-v2-session-search').disabled, true);
  assert.equal(panel.querySelector('.activity-v2-session-note').disabled, true);
  assert.equal(itemInputElement(panel, 'bench_press', 'note').disabled, true);
  panel.querySelectorAll('.activity-v2-session-search-result').forEach(
    (button) => assert.equal(button.disabled, true)
  );
  assert.equal(actionElement(panel, 'close').disabled, false);
  click(panel, actionElement(panel, 'remove', 'bench_press'));
  const guardedItemNote = itemInputElement(panel, 'bench_press', 'note');
  guardedItemNote.value = 'blocked item note';
  panel.dispatchEvent({ type: 'input', target: guardedItemNote });
  const guardedSessionNote = panel.querySelector('.activity-v2-session-note');
  guardedSessionNote.value = 'blocked session note';
  panel.dispatchEvent({ type: 'input', target: guardedSessionNote });
  weight.value = '99';
  panel.dispatchEvent({ type: 'input', target: weight });
  click(panel, panel.querySelector('.activity-v2-session-search-result'));
  assert.equal(runtime.draft.getSnapshot(), stable);
  guardedItemNote.value = '';
  guardedSessionNote.value = '';
  weight.value = '80,';

  await Promise.resolve();
  resolveConfirmation(false);
  assert.equal(await pending, false);
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(shell.isOpen(), true);
  assert.equal(weight.disabled, false);
  assert.equal(weight.value, '80,');
  assert.equal(runtime.document.activeElement, weight);
  assert.equal(actionElement(panel, 'add-set', 'bench_press').disabled, false);
  assert.equal(actionElement(panel, 'remove', 'bench_press').disabled, false);
  assert.equal(panel.querySelector('.activity-v2-session-search').disabled, false);
  assert.equal(panel.querySelector('.activity-v2-session-note').disabled, false);
  assert.equal(itemInputElement(panel, 'bench_press', 'note').disabled, false);
  panel.querySelectorAll('.activity-v2-session-search-result').forEach(
    (button) => assert.equal(button.disabled, false)
  );
});

test('lookup, timer and background settlements never replace intermediate inputs or focus', async () => {
  let now = 1_722_509_200_000;
  const runtime = createRuntime({ useSemanticsV2: true, now: () => now });
  runtime.draft.addItem('bench_press');
  runtime.draft.addItem('running');
  const startedAt = runtime.draft.getSnapshot().started_at;
  const lookup = deferred();
  const { shell, panel } = mountRuntime(runtime, {
    loadLastPerformance: () => lookup.promise
  });
  shell.open({ opener: runtime.opener });
  inputSetField(panel, 'bench_press', 1, 'reps', '8');
  const weight = inputSetField(panel, 'bench_press', 1, 'weight_kg', '80,');
  inputItemField(panel, 'running', 'duration_min', '45');
  const distance = inputItemField(panel, 'running', 'distance_km', '7,');
  assert.equal(runtime.draft.getSnapshot().started_at, startedAt);
  weight.focus();
  const editor = editorElement(panel, 'bench_press');
  const revision = runtime.draft.getSnapshot().revision;

  runtime.document.visibilityState = 'hidden';
  runtime.document.dispatchEvent({ type: 'visibilitychange' });
  const timer = [...runtime.intervals.values()][0];
  for (let second = 1; second <= 30; second += 1) {
    now += 1000;
    timer.callback();
  }
  runtime.document.visibilityState = 'visible';
  runtime.document.dispatchEvent({ type: 'visibilitychange' });
  assert.equal(setInputElement(panel, 'bench_press', 1, 'weight_kg'), weight);
  assert.equal(weight.value, '80,');
  assert.equal(weight.parentNode.dataset.state, 'intermediate');
  assert.equal(editorElement(panel, 'bench_press'), editor);
  assert.equal(itemInputElement(panel, 'running', 'distance_km'), distance);
  assert.equal(distance.value, '7,');
  assert.equal(distance.parentNode.dataset.state, 'intermediate');
  assert.equal(runtime.document.activeElement, weight);
  assert.equal(runtime.draft.getSnapshot().revision, revision);
  assert.equal(runtime.draft.getSnapshot().started_at, startedAt);

  lookup.resolve(makeLookupResult(runtime, 'bench_press'));
  await settle();
  assert.equal(setInputElement(panel, 'bench_press', 1, 'weight_kg'), weight);
  assert.equal(weight.value, '80,');
  assert.equal(weight.parentNode.dataset.state, 'intermediate');
  assert.equal(itemInputElement(panel, 'running', 'distance_km'), distance);
  assert.equal(distance.value, '7,');
  assert.equal(distance.parentNode.dataset.state, 'intermediate');
  assert.equal(runtime.document.activeElement, weight);
  assert.equal(
    itemElement(panel, 'bench_press').querySelector('.activity-v2-session-history')
      .querySelectorAll('input').length,
    0
  );
  const stable = runtime.draft.getSnapshot();
  shell.destroy();
  const remounted = mountRuntime(runtime, {
    loadLastPerformance: () => Promise.resolve(null)
  });
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(
    setInputElement(remounted.panel, 'bench_press', 1, 'weight_kg').value,
    '80,'
  );
  assert.equal(
    setInputElement(remounted.panel, 'bench_press', 1, 'weight_kg')
      .parentNode.dataset.state,
    'intermediate'
  );
  assert.equal(
    itemInputElement(remounted.panel, 'running', 'distance_km').value,
    '7,'
  );
  assert.equal(
    itemInputElement(remounted.panel, 'running', 'distance_km')
      .parentNode.dataset.state,
    'intermediate'
  );
});

test('set and item mutation failures restore stable Draft values, copy and focus', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  runtime.draft.addItem('running');
  const stable = runtime.draft.getSnapshot();
  const failingDraft = Object.freeze({
    getSnapshot: () => runtime.draft.getSnapshot(),
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem: (key) => runtime.draft.addItem(key),
    removeItem: (key) => runtime.draft.removeItem(key),
    moveItem: (key, order) => runtime.draft.moveItem(key, order),
    setNote: (note) => runtime.draft.setNote(note),
    discard: () => runtime.draft.discard(),
    addSet() { throw new Error('private add detail'); },
    removeSet() { throw new Error('private remove detail'); },
    setSetField() { throw new Error('private input detail'); },
    setItemField() { throw new Error('private item detail'); }
  });
  const { shell, panel } = mountRuntime(runtime, { draft: failingDraft });
  shell.open({ opener: runtime.opener });
  const input = inputSetField(panel, 'bench_press', 1, 'reps', '8');
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(input.value, '');
  assert.equal(runtime.document.activeElement, input);
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    'Die Satzeingabe konnte nicht aktualisiert werden.'
  );

  const duration = inputItemField(panel, 'running', 'duration_min', '45');
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(duration.value, '');
  assert.equal(runtime.document.activeElement, duration);
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    'Die Aktivitätseingabe konnte nicht aktualisiert werden.'
  );
  const itemNote = inputItemField(panel, 'running', 'note', 'private note');
  assert.equal(runtime.draft.getSnapshot(), stable);
  assert.equal(itemNote.value, '');
  assert.equal(runtime.document.activeElement, itemNote);
  assert.doesNotMatch(
    panel.querySelector('.activity-v2-session-status').textContent,
    /private note|private item/i
  );

  const add = actionElement(panel, 'add-set', 'bench_press');
  click(panel, add);
  assert.equal(runtime.document.activeElement, add);
  assert.equal(panel.querySelector('.activity-v2-session-status').textContent,
    'Satz konnte nicht hinzugefügt werden.');
  const remove = itemElement(panel, 'bench_press').querySelectorAll('button').find(
    (button) => button.dataset.action === 'remove-set'
  );
  click(panel, remove);
  assert.equal(runtime.document.activeElement, remove);
  assert.equal(panel.querySelector('.activity-v2-session-status').textContent,
    'Satz konnte nicht entfernt werden.');
  assert.equal(runtime.draft.getSnapshot(), stable);
});

test('item no-ops stay DOM-free and post-mutation breaches never stale-rollback', () => {
  const runtime = createRuntime({ useSemanticsV2: true });
  runtime.draft.addItem('bench_press');
  runtime.draft.addItem('running');
  let breakSnapshot = false;
  let snapshotReads = 0;
  const breakingDraft = Object.freeze({
    getSnapshot() {
      snapshotReads += 1;
      const snapshot = runtime.draft.getSnapshot();
      if (!breakSnapshot) return snapshot;
      return deepFreeze({
        ...jsonClone(snapshot),
        draft_schema_version: 'midas.activity-session-draft.invalid'
      });
    },
    getTimerSnapshot: () => runtime.draft.getTimerSnapshot(),
    addItem: (key) => runtime.draft.addItem(key),
    removeItem: (key) => runtime.draft.removeItem(key),
    moveItem: (key, order) => runtime.draft.moveItem(key, order),
    setNote: (note) => runtime.draft.setNote(note),
    discard: () => runtime.draft.discard(),
    addSet: (key) => runtime.draft.addSet(key),
    removeSet: (key, order) => runtime.draft.removeSet(key, order),
    setSetField(key, order, field, value) {
      const snapshot = runtime.draft.setSetField(key, order, field, value);
      breakSnapshot = true;
      return snapshot;
    },
    setItemField(key, field, value) {
      const before = runtime.draft.getSnapshot();
      const snapshot = runtime.draft.setItemField(key, field, value);
      if (snapshot !== before) breakSnapshot = true;
      return snapshot;
    }
  });
  const { shell, panel } = mountRuntime(runtime, { draft: breakingDraft });
  shell.open({ opener: runtime.opener });
  snapshotReads = 0;
  const pristine = runtime.draft.getSnapshot();
  let duration = itemInputElement(panel, 'running', 'duration_min');
  panel.dispatchEvent({ type: 'input', target: duration });
  assert.equal(runtime.draft.getSnapshot(), pristine);
  assert.equal(snapshotReads, 0);

  const input = setInputElement(panel, 'bench_press', 1, 'reps');
  input.value = '8';
  input.focus();

  assertShellError(
    () => panel.dispatchEvent({ type: 'input', target: input }),
    'INVALID_DRAFT_STATE'
  );
  assert.equal(runtime.draft.getSnapshot().items[0].sets[0].reps, '8');
  assert.equal(input.value, '8');
  assert.equal(runtime.document.activeElement, input);
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    ''
  );

  breakSnapshot = false;
  shell.render();
  duration = itemInputElement(panel, 'running', 'duration_min');
  snapshotReads = 0;
  duration.value = '45';
  duration.focus();
  assertShellError(
    () => panel.dispatchEvent({ type: 'input', target: duration }),
    'INVALID_DRAFT_STATE'
  );
  assert.equal(runtime.draft.getSnapshot().items[1].duration_min, '45');
  assert.equal(duration.value, '45');
  assert.equal(runtime.document.activeElement, duration);
  assert.equal(snapshotReads, 1);
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    ''
  );
});

test('S4.9 accepts only an explicit exact coordinator and leaves legacy mounts unchanged', () => {
  let runtime = createRuntime();
  let mounted = mountRuntime(runtime);
  assert.equal(
    mounted.panel.querySelector('.activity-v2-session-commit-card'),
    null
  );
  mounted.shell.destroy();

  runtime = createRuntime();
  const before = runtime.document.body.children.length;
  assertShellError(
    () => mountRuntime(runtime, { sessionCommit: {} }),
    'INVALID_SESSION_COMMIT_API'
  );
  assert.equal(runtime.document.body.children.length, before);

  runtime = createRuntime();
  const malformed = createSessionCommitFacade({
    state: 'editing',
    reason: null,
    focus_target: null,
    intent_present: false
  });
  assertShellError(
    () => mountRuntime(runtime, { sessionCommit: malformed.facade }),
    'INVALID_SESSION_COMMIT_STATE'
  );

  runtime = createRuntime();
  const commit = createSessionCommitFacade(sessionCommitState('editing'));
  mounted = mountRuntime(runtime, { sessionCommit: commit.facade });
  const card = mounted.panel.querySelector('.activity-v2-session-commit-card');
  assert.ok(card);
  assert.equal(card.getAttribute('aria-label'), 'Sessionabschluss');
  assert.equal(
    card.querySelector('.activity-v2-session-commit-status').getAttribute('role'),
    'status'
  );
  assert.equal(actionElement(mounted.panel, 'finish').textContent, 'Session abschließen');

  runtime = createRuntime();
  const recovery = createRecoveryFacade(runtime.draft, recoveryState('empty'));
  const recoveryR8 = Object.freeze({
    ...recovery.facade,
    getCommitIntent: () => null,
    prepareCommit: () => Promise.resolve(null),
    beginCommitAttempt: () => Promise.resolve(null),
    releaseCommit: () => Promise.resolve(null),
    completeCommit: () => Promise.resolve(null)
  });
  assert.doesNotThrow(() => mountRuntime(runtime, { recovery: recoveryR8 }));

  runtime = createRuntime();
  const recoveryWithUnknownExtra = Object.freeze({
    ...createRecoveryFacade(runtime.draft, recoveryState('empty')).facade,
    unknownCommitMethod: () => null
  });
  assertShellError(
    () => mountRuntime(runtime, { recovery: recoveryWithUnknownExtra }),
    'INVALID_RECOVERY_API'
  );
});

test('S4.9 locks mutations during busy states and freezes the timer only after intent persistence', async () => {
  let nowValue = 1_722_509_200_000;
  const runtime = createRuntime({ now: () => nowValue });
  runtime.draft.addItem('ab_wheel_rollout');
  runtime.draft.setSetField('ab_wheel_rollout', 1, 'reps', '10');
  const recovery = createRecoveryFacade(
    runtime.draft,
    recoveryState('saved', {
      started_at: new Date(nowValue).toISOString(),
      saved_at: new Date(nowValue).toISOString(),
      item_count: 1
    })
  );
  const commit = createSessionCommitFacade(sessionCommitState('editing'));
  const { shell, panel } = mountRuntime(runtime, {
    recovery: recovery.facade,
    sessionCommit: commit.facade
  });
  shell.open({ opener: runtime.opener });
  const search = panel.querySelector('.activity-v2-session-search');
  const reps = setInputElement(panel, 'ab_wheel_rollout', 1, 'reps');
  const timer = panel.querySelector('.activity-v2-session-timer');
  assert.equal(runtime.intervals.size, 1);

  commit.emit(sessionCommitState('preparing'));
  assert.equal(search.disabled, true);
  assert.equal(reps.disabled, true);
  assert.equal(actionElement(panel, 'finish').disabled, true);
  assert.equal(actionElement(panel, 'close').disabled, true);
  assert.equal(runtime.intervals.size, 1);
  nowValue += 65_000;
  [...runtime.intervals.values()][0].callback();
  assert.equal(timer.textContent, '01:05');

  commit.emit(
    sessionCommitState('preparing', {
      intent_present: true
    })
  );
  const frozen = timer.textContent;
  assert.equal(runtime.intervals.size, 0);
  nowValue += 120_000;
  runtime.document.dispatchEvent({ type: 'visibilitychange' });
  assert.equal(timer.textContent, frozen);
  assert.equal(await shell.requestClose('api'), false);
  assert.equal(shell.isOpen(), true);

  commit.emit(
    sessionCommitState('unknown', {
      reason: 'REQUEST_FAILED',
      intent_present: true
    })
  );
  assert.equal(actionElement(panel, 'retry').textContent, 'Identisch erneut versuchen');
  assert.equal(actionElement(panel, 'close').disabled, false);
  const escape = pressKey(runtime, runtime.document.activeElement, 'Escape');
  assert.equal(escape.defaultPrevented, true);
  assert.equal(shell.isOpen(), false);
  assert.equal(recovery.getDiscardCalls(), 0);

  shell.open({ opener: runtime.opener });
  assert.equal(runtime.intervals.size, 0);
  commit.emit(
    sessionCommitState('not_committed', {
      reason: 'AUTH_REQUIRED'
    })
  );
  assert.equal(search.disabled, false);
  assert.equal(
    setInputElement(panel, 'ab_wheel_rollout', 1, 'reps').disabled,
    false
  );
  assert.equal(runtime.intervals.size, 1);
  assert.notEqual(timer.textContent, frozen);
});

test('S4.9 drives finish, safe focus, retry, cleanup and terminal success without parallel actions', () => {
  const runtime = createRuntime();
  runtime.draft.addItem('ab_wheel_rollout');
  const finishGate = deferred();
  const retryGate = deferred();
  const commit = createSessionCommitFacade(sessionCommitState('editing'), {
    finish({ emit }) {
      emit(sessionCommitState('preparing'));
      return finishGate.promise;
    },
    retry({ emit }) {
      emit(
        sessionCommitState('committing', {
          intent_present: true
        })
      );
      return retryGate.promise;
    }
  });
  const { shell, panel } = mountRuntime(runtime, {
    sessionCommit: commit.facade
  });
  shell.open({ opener: runtime.opener });

  const finish = actionElement(panel, 'finish');
  click(panel, finish);
  click(panel, finish);
  assert.equal(commit.getFinishCalls(), 1);
  assert.equal(panel.getAttribute('aria-busy'), 'true');

  const focusTarget = deepFreeze({
    scope: 'set',
    item_key: 'ab_wheel_rollout',
    set_order: 1,
    field_key: 'reps'
  });
  commit.emit(
    sessionCommitState('editing', {
      reason: 'INVALID_SET_VALUE',
      focus_target: focusTarget
    })
  );
  assert.equal(
    runtime.document.activeElement,
    setInputElement(panel, 'ab_wheel_rollout', 1, 'reps')
  );
  assert.match(
    panel.querySelector('.activity-v2-session-commit-status').textContent,
    /markierte Eingabe/
  );

  commit.emit(
    sessionCommitState('unknown', {
      reason: 'REQUEST_FAILED',
      intent_present: true
    })
  );
  const retry = actionElement(panel, 'retry');
  click(panel, retry);
  click(panel, retry);
  assert.equal(commit.getRetryCalls(), 1);
  assert.equal(panel.getAttribute('aria-busy'), 'true');

  commit.emit(
    sessionCommitState('cleanup_pending', {
      reason: 'STORAGE_ERROR',
      intent_present: true
    })
  );
  assert.equal(actionElement(panel, 'retry').textContent, 'Abschluss bestätigen');
  actionElement(panel, 'retry').focus();
  commit.emit(sessionCommitState('committed'));
  assert.equal(
    panel.querySelector('.activity-v2-session-commit-status').textContent,
    'Session gespeichert.'
  );
  assert.equal(panel.querySelector('.activity-v2-session-commit-card').querySelector('button').hidden, true);
  assert.equal(runtime.document.activeElement, actionElement(panel, 'close'));
});

test('S5 closed views discard deferred commit-action focus before any later open', () => {
  assert.match(
    shellSource,
    /if \(!openState\) \{\s*commitActionFocusPending = false;\s*\} else if \(!presentation\.busy && commitActionFocusPending\)/
  );
  assert.match(
    shellSource,
    /function closeTechnical\(\) \{\s*commitActionFocusPending = false;\s*if \(!openState\) return true;/
  );
});

test('S4.9 view-close states never call Recovery discard and shell destroy never owns the coordinator', async () => {
  const closableStates = [
    sessionCommitState('release_pending', {
      reason: 'STORAGE_ERROR',
      intent_present: true
    }),
    sessionCommitState('unknown', {
      reason: 'REQUEST_FAILED',
      intent_present: true
    }),
    sessionCommitState('cleanup_pending', {
      reason: 'STORAGE_ERROR',
      intent_present: true
    }),
    sessionCommitState('blocked', {
      reason: 'IDEMPOTENCY_CONFLICT',
      intent_present: true
    }),
    sessionCommitState('committed')
  ];
  for (const state of closableStates) {
    const runtime = createRuntime();
    runtime.draft.addItem('ab_wheel_rollout');
    const recovery = createRecoveryFacade(runtime.draft, recoveryState('saved'));
    const commit = createSessionCommitFacade(state);
    const { shell } = mountRuntime(runtime, {
      recovery: recovery.facade,
      sessionCommit: commit.facade
    });
    shell.open({ opener: runtime.opener });
    assert.equal(await shell.requestClose('api'), true, state.state);
    assert.equal(recovery.getDiscardCalls(), 0, state.state);
    shell.destroy();
    assert.equal(commit.getUnsubscribeCalls(), 1, state.state);
    assert.equal(commit.getDestroyCalls(), 0, state.state);
  }
});

test('destroy is idempotent, preserves the draft and releases all local lifecycle state', () => {
  const runtime = createRuntime();
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const picker = typeSearch(panel, 'Ab Wheel Rollout');
  selectSearchResult(panel, 'ab_wheel_rollout');
  const dirty = runtime.draft.getSnapshot();

  shell.destroy();
  assert.doesNotThrow(() => shell.destroy());
  assert.equal(shell.isOpen(), false);
  assert.equal(panel.isConnected, false);
  assert.equal(runtime.background.hasAttribute('inert'), false);
  assert.equal(runtime.draft.getSnapshot(), dirty);
  assertShellError(() => shell.open(), 'SHELL_DESTROYED');
  assertShellError(() => shell.render(), 'SHELL_DESTROYED');
  assertShellError(() => shell.requestClose(), 'SHELL_DESTROYED');
  assert.equal(picker.isConnected, false);
});

test('CSS and harness encode the responsive isolated full-screen contract', () => {
  const requiredCss = [
    /\.activity-v2-session-shell\s*\{/,
    /position:\s*fixed/,
    /inset:\s*0/,
    /width:\s*100vw/,
    /height:\s*100vh/,
    /height:\s*100dvh/,
    /env\(safe-area-inset-top\)/,
    /position:\s*sticky/,
    /overflow-y:\s*auto/,
    /@media \(max-width:\s*640px\)/,
    /\.activity-v2-session-shell \.activity-v2-session-close\s*\{/,
    /min-height:\s*44px/,
    /min-width:\s*0/,
    /\.activity-v2-session-search-results/,
    /\.activity-v2-session-history/,
    /\.activity-v2-session-editor\s*\{[^}]*grid-column:\s*1 \/ -1/s,
    /\.activity-v2-session-set-row\s*\{[^}]*grid-template-columns:/s,
    /\.activity-v2-session-set-input\s*\{[^}]*width:\s*100%/s,
    /\.activity-v2-session-set-input\s*\{[^}]*min-height:\s*44px/s,
    /\.activity-v2-session-set-field-error:empty/,
    /\.activity-v2-session-item-fields\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s,
    /\.activity-v2-session-item-input,\s*\.activity-v2-session-item-note\s*\{[^}]*width:\s*100%/s,
    /\.activity-v2-session-item-input,\s*\.activity-v2-session-item-note\s*\{[^}]*min-height:\s*44px/s,
    /\.activity-v2-session-item-note-field\s*\{[^}]*grid-column:\s*1 \/ -1/s,
    /\.activity-v2-session-item-field-error:empty/,
    /\[data-action="remove-set"\]/,
    /@media \(max-width:\s*640px\)[\s\S]*\.activity-v2-session-set-row\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/,
    /@media \(max-width:\s*640px\)[\s\S]*\.activity-v2-session-item-fields\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/,
    /:is\(button, input, select, textarea\):focus-visible/,
    /prefers-reduced-motion/
  ];
  requiredCss.forEach((pattern) => assert.match(cssSource, pattern));
  assert.match(harnessSource, /<script src="\.\/semantics\.js"><\/script>/);
  assert.match(harnessSource, /<script src="\.\/semantics-v2\.js"><\/script>/);
  assert.match(harnessSource, /<script src="\.\/session-draft\.js"><\/script>/);
  assert.match(harnessSource, /<script src="\.\/session-shell\.js"><\/script>/);
  assert.match(
    harnessSource,
    /<link rel="stylesheet" href="\.\/session-shell\.css\?v=r6-s4-4">/
  );
  assert.match(harnessSource, /itemKey === 'bench_press'/);
  assert.match(harnessSource, /itemKey === 'ski_erg'/);
  assert.match(harnessSource, /itemKey === 'total_abdominal'/);
  assert.match(harnessSource, /itemKey === 'high_row'/);
  assert.match(harnessSource, /fixture=policies/);
  assert.match(harnessSource, /fixture=history/);
  assert.match(harnessSource, /fixture=all/);
  assert.match(harnessSource, /policyRepresentatives\.size !== 8/);
  assert.match(harnessSource, /const itemPolicyKeys = Object\.freeze\(\['cross_trainer', 'running'\]\)/);
  assert.match(harnessSource, /const itemPolicyModes = Object\.freeze\(\['duration', 'duration_distance'\]\)/);
  assert.match(harnessSource, /entry\.fields\.duration_min !== 'required'/);
  assert.match(harnessSource, /draft\.setItemField\('running', 'distance_km', '5,25'\)/);
  assert.match(harnessSource, /Gemeinsame R6-Itemnotiz am Strength-Editor/);
  assert.match(harnessSource, /validStressValues/);
  assert.match(harnessSource, /weight_kg', '1000,001'/);
  assert.match(harnessSource, /weight_kg', '80,'/);
  assert.match(harnessSource, /fields\.assistance_kg === 'required'/);
  assert.match(harnessSource, /fixtureKeys: Object\.freeze/);
  assert.match(harnessSource, /policyKeys,/);
  assert.match(harnessSource, /strengthPolicyKeys,/);
  assert.match(harnessSource, /itemPolicyKeys,/);
  assert.match(harnessSource, /getLookupCount:/);
  assert.match(harnessSource, /status\.dataset\.lookupCounts/);
  assert.doesNotMatch(harnessSource, /<script[^>]+index\.js/);
});

test('runtime and harness have no product, persistence, network or unsafe DOM path', () => {
  const combined = `${shellSource}\n${harnessSource}`;
  const forbidden = [
    /\bfetch\b/,
    /XMLHttpRequest/,
    /WebSocket/,
    /EventSource/,
    /\bindexedDB\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bcaches\b/,
    /serviceWorker/,
    /AppModules(?:\?|\.)[^\n]*dataAccess/,
    /commitSession/,
    /activity_v2_commit_session/,
    /activity_v2_last_performance/,
    /beforeunload/,
    /pagehide/,
    /catalog_version\s*:\s*1\b/,
    /\b78\b/,
    /\.innerHTML\b/
  ];
  forbidden.forEach((pattern) => assert.doesNotMatch(combined, pattern));
  const indexSource = fs.readFileSync(indexPath, 'utf8');
  assert.doesNotMatch(indexSource, /session-shell(?:\.js|\.css)/);
  assert.doesNotThrow(() => new vm.Script(shellSource, { filename: shellPath }));
});
