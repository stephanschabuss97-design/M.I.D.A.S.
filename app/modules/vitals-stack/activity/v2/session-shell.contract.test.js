'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const semanticsPath = path.join(__dirname, 'semantics.js');
const draftPath = path.join(__dirname, 'session-draft.js');
const shellPath = path.join(__dirname, 'session-shell.js');
const cssPath = path.join(__dirname, 'session-shell.css');
const harnessPath = path.join(__dirname, 'session-shell-harness.html');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
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
  vm.runInContext(draftSource, context, { filename: draftPath });
  vm.runInContext(shellSource, context, { filename: shellPath });

  const background = document.createElement('main');
  background.id = 'background';
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  background.appendChild(opener);
  document.body.appendChild(background);
  opener.focus();

  const semantics = context.AppModules.activityV2.semantics;
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
  const picker = panel.querySelector('select');
  const note = panel.querySelector('textarea');
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
  const picker = panel.querySelector('select');
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

test('picker follows active catalog order and add disables included keys', () => {
  const runtime = createRuntime();
  const catalog = runtime.semantics.getCatalog();
  const activeEntries = catalog.entries.filter((entry) => entry.status === 'active');
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const picker = panel.querySelector('select');

  assert.equal(picker.options.length, activeEntries.length);
  assert.deepEqual(
    picker.options.map((option) => option.value),
    Array.from(activeEntries, (entry) => entry.key)
  );
  assert.deepEqual(
    picker.options.map((option) => option.textContent),
    Array.from(activeEntries, (entry) => entry.label)
  );
  const firstKey = picker.value;
  click(panel, actionElement(panel, 'add'));
  assert.equal(runtime.draft.getSnapshot().items[0].item_key, firstKey);
  assert.equal(runtime.document.activeElement, picker);
  assert.equal(picker.options.find((option) => option.value === firstKey).disabled, true);
  assert.notEqual(picker.value, firstKey);
  assert.equal(panel.querySelector('.activity-v2-session-empty').hidden, true);
  assert.equal(panel.querySelector('.activity-v2-session-count').textContent, '1 Eintrag');
});

test('move, remove and note interactions keep DOM order, draft order and focus aligned', async () => {
  const runtime = createRuntime();
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const picker = panel.querySelector('select');
  const firstKey = picker.value;
  click(panel, actionElement(panel, 'add'));
  const secondKey = picker.value;
  click(panel, actionElement(panel, 'add'));
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

  const note = panel.querySelector('textarea');
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
  click(panel, actionElement(panel, 'add'));
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
  click(panel, actionElement(panel, 'add'));
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
  click(panel, actionElement(panel, 'add'));
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
    }
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
  assert.equal(
    panel.querySelector('.activity-v2-session-status').textContent,
    'Die Session konnte nicht verworfen werden.'
  );
  assert.doesNotMatch(
    panel.querySelector('.activity-v2-session-status').textContent,
    /private/i
  );
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
    }
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

test('invalid draft state and catalog mismatch fail before the existing DOM is patched', () => {
  const runtime = createRuntime();
  let snapshot = runtime.draft.getSnapshot();
  let timer = runtime.draft.getTimerSnapshot();
  const fakeDraft = Object.freeze({
    getSnapshot: () => snapshot,
    getTimerSnapshot: () => timer,
    addItem() {},
    removeItem() {},
    moveItem() {},
    setNote() {},
    discard() {}
  });
  const { shell, panel } = mountRuntime(runtime, { draft: fakeDraft });
  const picker = panel.querySelector('select');
  const originalOptions = [...picker.options];

  snapshot = deepFreeze({
    ...snapshot,
    revision: 1,
    items: [{ item_key: 'ab_wheel_rollout', item_order: 2 }]
  });
  assertShellError(() => shell.render(), 'INVALID_DRAFT_STATE');
  assert.deepEqual(picker.options, originalOptions);

  snapshot = deepFreeze({
    ...runtime.draft.getSnapshot(),
    catalog_version: runtime.draft.getSnapshot().catalog_version + 1
  });
  assertShellError(() => shell.render(), 'CATALOG_VERSION_MISMATCH');
  assert.deepEqual(picker.options, originalOptions);

  snapshot = runtime.draft.getSnapshot();
  timer = deepFreeze({ running: false, elapsed_ms: 0, label: '00:01' });
  assertShellError(() => shell.render(), 'INVALID_DRAFT_STATE');
  assert.deepEqual(picker.options, originalOptions);
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
    discard() {}
  });
  const { shell, panel } = mountRuntime(runtime, { draft: fakeDraft });
  shell.open({ opener: runtime.opener });
  const picker = panel.querySelector('select');
  click(panel, actionElement(panel, 'add'));

  const status = panel.querySelector('.activity-v2-session-status');
  assert.equal(shell.isOpen(), true);
  assert.equal(fakeDraft.getSnapshot(), snapshot);
  assert.equal(runtime.document.activeElement, picker);
  assert.equal(status.textContent, 'Die Aktion konnte nicht ausgeführt werden.');
  assert.doesNotMatch(status.textContent, /private|catalog detail/i);
});

test('destroy is idempotent, preserves the draft and releases all local lifecycle state', () => {
  const runtime = createRuntime();
  const { shell, panel } = mountRuntime(runtime);
  shell.open({ opener: runtime.opener });
  const picker = panel.querySelector('select');
  click(panel, actionElement(panel, 'add'));
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
    /min-height:\s*44px/,
    /min-width:\s*0/,
    /prefers-reduced-motion/
  ];
  requiredCss.forEach((pattern) => assert.match(cssSource, pattern));
  assert.match(harnessSource, /<script src="\.\/semantics\.js"><\/script>/);
  assert.match(harnessSource, /<script src="\.\/session-draft\.js"><\/script>/);
  assert.match(harnessSource, /<script src="\.\/session-shell\.js"><\/script>/);
  assert.match(harnessSource, /<link rel="stylesheet" href="\.\/session-shell\.css">/);
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
    /\bdataAccess\b/,
    /commitSession/,
    /loadLastPerformance/,
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
