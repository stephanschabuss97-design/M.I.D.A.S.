'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(
  path.join(__dirname, 'activity-product-controller.js'),
  'utf8'
);
const cssSource = fs.readFileSync(
  path.join(__dirname, 'activity-product-controller.css'),
  'utf8'
);

class FakeElement {
  constructor(ownerDocument, tagName) {
    this.nodeType = 1;
    this.ownerDocument = ownerDocument;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.attributes = new Map();
    this.className = '';
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.listeners = new Map();
    this.name = '';
    this.value = '';
    this.checked = false;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  append(...children) {
    children.forEach((child) => this.appendChild(child));
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
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

  contains(candidate) {
    if (candidate === this) return true;
    return this.children.some((child) => child.contains?.(candidate));
  }

  closest(selector) {
    if (selector === '[data-action]' && this.dataset.action) return this;
    return this.parentNode?.closest(selector) || null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  matches(selector) {
    const role = /^\[data-role="([^"]+)"\]$/.exec(selector);
    if (role) return this.dataset.role === role[1];
    if (selector === '[name="range-preset"]') return this.name === 'range-preset';
    return false;
  }

  querySelector(selector) {
    for (const child of this.children) {
      if (child.matches?.(selector)) return child;
      const nested = child.querySelector?.(selector);
      if (nested) return nested;
    }
    return null;
  }

  querySelectorAll(selector) {
    const matches = [];
    this.children.forEach((child) => {
      if (child.matches?.(selector)) matches.push(child);
      matches.push(...(child.querySelectorAll?.(selector) || []));
    });
    return matches;
  }

  replaceChildren(...children) {
    this.children.forEach((child) => {
      child.parentNode = null;
    });
    this.children = [];
    children.forEach((child) => this.appendChild(child));
  }

  removeChild(child) {
    this.children = this.children.filter((candidate) => candidate !== child);
    child.parentNode = null;
    return child;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }
}

class FakeDocument {
  constructor() {
    this.activeElement = null;
    this.listeners = new Map();
  }

  createElement(tagName) {
    return new FakeElement(this, tagName);
  }

  createTextNode(text) {
    return {
      nodeType: 3,
      ownerDocument: this,
      parentNode: null,
      textContent: String(text),
      remove() {
        this.parentNode?.removeChild(this);
      }
    };
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }
}

function loadModule() {
  const window = { AppModules: {}, setTimeout, clearTimeout };
  vm.runInNewContext(source, { window, globalThis: window, setTimeout, clearTimeout });
  return window.AppModules.activityV2.productController;
}

function api(methods) {
  return Object.fromEntries(methods.map((method) => [method, () => {}]));
}

function freezeRecoveryState(state, reason = null, itemCount = 0) {
  return Object.freeze({
    state,
    started_at: state === 'empty' ? null : '2026-08-29T05:00:00.000Z',
    saved_at: state === 'recoverable' ? '2026-08-29T05:01:00.000Z' : null,
    item_count: itemCount,
    reason
  });
}

function freezeCommitState(state, reason = null, intentPresent = false) {
  return Object.freeze({
    state,
    reason,
    focus_target: null,
    intent_present: intentPresent
  });
}

function createFixture({
  initialRecoveryState = 'empty',
  recoveredCatalogVersion = 2,
  flushFails = false,
  confirmDiscard = false
} = {}) {
  const document = new FakeDocument();
  const hosts = Array.from({ length: 4 }, () => document.createElement('div'));
  const calls = [];
  const semanticsByVersion = new Map();
  [1, 2].forEach((version) => {
    semanticsByVersion.set(version, {
      getCatalog: () => ({ catalog_version: version, entries: [] }),
      getEntryByKey: () => null,
      normalizeSearchText: (value) => String(value),
      search: () => []
    });
  });
  const makeDraft = (catalogVersion) => ({
    getSnapshot: () => Object.freeze({
      catalog_version: catalogVersion,
      draft_schema_version: 'midas.activity-session-draft.v3',
      items: Object.freeze([]),
      note: null,
      request_id: '00000000-0000-4000-8000-000000000001',
      revision: 0,
      started_at: '2026-08-29T05:00:00.000Z'
    })
  });
  let recoveryOpenCount = 0;
  let activeRecovery = null;
  let activeCommit = null;
  let historyCreateOptions = null;
  let exportRoot = null;

  function createRecovery(openState) {
    let state = freezeRecoveryState(
      openState,
      openState === 'blocked' ? 'unknown_recovery_schema' : null,
      openState === 'recoverable' ? 1 : 0
    );
    let draft = null;
    const listeners = new Set();
    const publish = (next) => {
      state = next;
      listeners.forEach((listener) => listener(state));
    };
    const recovery = {
      getState: () => state,
      getDraft: () => draft,
      startNew: () => {
        calls.push('recovery.startNew');
        draft = makeDraft(2);
        publish(freezeRecoveryState('active'));
        return draft;
      },
      continueSession: () => {
        calls.push('recovery.continueSession');
        draft = makeDraft(recoveredCatalogVersion);
        publish(freezeRecoveryState('saved', null, 1));
        return draft;
      },
      flush: async () => {
        calls.push('recovery.flush');
        if (flushFails) throw new Error('safe fixture flush failure');
        return state;
      },
      discard: async () => {
        calls.push('recovery.discard');
        publish(freezeRecoveryState('destroyed'));
        return state;
      },
      subscribe: (listener) => {
        listener(state);
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      destroy: () => {
        calls.push('recovery.destroy');
        publish(freezeRecoveryState('destroyed'));
      },
      getCommitIntent: () => null,
      prepareCommit: async () => null,
      beginCommitAttempt: async () => null,
      releaseCommit: async () => null,
      completeCommit: async () => null
    };
    return recovery;
  }

  function createCommit() {
    let state = freezeCommitState('editing');
    const listeners = new Set();
    const publish = (next) => {
      state = next;
      listeners.forEach((listener) => listener(state));
    };
    const commit = {
      getState: () => state,
      finish: async () => state,
      retry: async () => state,
      subscribe: (listener) => {
        listener(state);
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      destroy: () => calls.push('commit.destroy')
    };
    activeCommit = { controller: commit, publish };
    return commit;
  }

  const shell = {
    open: () => {
      calls.push('shell.open');
      shell.opened = true;
      return shell;
    },
    render: () => {},
    requestClose: async () => {
      calls.push('shell.requestClose');
      shell.opened = false;
      return true;
    },
    isOpen: () => shell.opened === true,
    refreshLastPerformance: async (itemKeys) => ({
      status: 'success',
      items: itemKeys.map((itemKey) => ({ item_key: itemKey, status: 'success' }))
    }),
    destroy: () => {
      calls.push('shell.destroy');
      shell.opened = false;
    }
  };
  const options = {
    host: hosts[0],
    sessionHost: hosts[1],
    historyHost: hosts[2],
    exportHost: hosts[3],
    semantics: semanticsByVersion.get(2),
    resolveSemantics: (version) => {
      calls.push(`resolveSemantics:${version}`);
      return semanticsByVersion.get(version) || null;
    },
    sessionDraft: api(['create', 'restore']),
    sessionRecovery: {
      createIndexedDbStore: () => {
        calls.push('recovery.createStore');
        return { close: () => calls.push('store.close') };
      },
      open: async () => {
        calls.push('recovery.open');
        const state = recoveryOpenCount === 0 ? initialRecoveryState : 'empty';
        recoveryOpenCount += 1;
        activeRecovery = createRecovery(state);
        return activeRecovery;
      }
    },
    sessionCommit: {
      create: (value) => {
        calls.push('commit.create');
        assert.equal(value.semantics.getCatalog().catalog_version, value.draft.getSnapshot().catalog_version);
        return createCommit();
      }
    },
    sessionShell: {
      mount: (value) => {
        calls.push('shell.mount');
        assert.equal(value.recovery, activeRecovery);
        assert.equal(value.sessionCommit, activeCommit.controller);
        return shell;
      }
    },
    dataAccess: api([
      'commitSession',
      'loadLastPerformance',
      'listSessions',
      'loadSessionDetail',
      'loadCoachingExport',
      'replaceSession',
      'deleteSession'
    ]),
    sessionCorrection: {
      create: (detail, value) => {
        calls.push(`correction.create:${detail.catalog_version}`);
        assert.equal(value.semantics.getCatalog().catalog_version, detail.catalog_version);
        return {};
      }
    },
    sessionHistory: {
      createMutationGuard: (value) => {
        calls.push('history.guard');
        assert.equal(value.getRecovery(), activeRecovery);
        return { check: () => Object.freeze({ allowed: true, reason: null }) };
      },
      create: (value) => {
        calls.push('history.create');
        historyCreateOptions = value;
        return {
          refreshAdmission: () => {},
          destroy: () => calls.push('history.destroy')
        };
      }
    },
    sessionHistoryShell: {
      mount: ({ host }) => {
        calls.push('historyShell.mount');
        const element = document.createElement('section');
        host.appendChild(element);
        return {
          getElement: () => element,
          destroy: () => {
            calls.push('historyShell.destroy');
            element.remove();
          }
        };
      }
    },
    coachingExport: api([
      'validateExport',
      'validateRange',
      'createPresetRange',
      'buildDownloadName'
    ]),
    coachingExportController: {
      create: () => {
        calls.push('export.create');
        return { destroy: () => calls.push('export.destroy') };
      }
    },
    coachingExportShell: {
      mount: (rootElement) => {
        calls.push('exportShell.mount');
        exportRoot = rootElement;
        ['form', 'custom-fields', 'from', 'to', 'submit', 'status', 'retry', 'download']
          .forEach((role) => assert.ok(rootElement.querySelector(`[data-role="${role}"]`)));
        return { destroy: () => calls.push('exportShell.destroy') };
      }
    },
    now: () => 0,
    createRequestId: () => '00000000-0000-4000-8000-000000000001',
    createLeaseToken: () => '00000000-0000-4000-8000-000000000002',
    confirmDiscard: () => confirmDiscard,
    refreshActivityConsumers: function refreshActivityConsumers() {
      calls.push(`refreshActivityConsumers:${arguments.length}`);
    }
  };
  return {
    document,
    hosts,
    options,
    calls,
    getRecovery: () => activeRecovery,
    getCommit: () => activeCommit,
    getHistoryOptions: () => historyCreateOptions,
    getExportRoot: () => exportRoot
  };
}

test('S4.1 registers one frozen product API with the exact controller surface', () => {
  const productController = loadModule();
  assert.deepEqual(Object.keys(productController), ['mount']);
  assert.ok(Object.isFrozen(productController));

  const fixture = createFixture();
  const controller = productController.mount(fixture.options);
  assert.deepEqual(Object.keys(controller), [
    'getState',
    'subscribe',
    'startSession',
    'continueSession',
    'discardRecoveredSession',
    'openHistory',
    'openExport',
    'requestClose',
    'setAuthenticated',
    'destroy'
  ]);
  assert.ok(Object.isFrozen(controller));
  assert.deepEqual(fixture.calls, []);
});

test('S4.1 validates the complete dependency contract before DOM mutation', () => {
  const productController = loadModule();
  const missing = createFixture();
  delete missing.options.sessionCommit;
  assert.throws(
    () => productController.mount(missing.options),
    (error) => error.code === 'INVALID_OPTIONS'
  );
  assert.equal(missing.hosts[0].children.length, 0);

  const unknown = createFixture();
  unknown.options.unplanned = true;
  assert.throws(
    () => productController.mount(unknown.options),
    (error) => error.code === 'INVALID_OPTIONS'
  );
  assert.equal(unknown.hosts[0].children.length, 0);

  const accessor = createFixture();
  const semantics = accessor.options.semantics;
  Object.defineProperty(accessor.options, 'semantics', {
    get: () => semantics,
    enumerable: true
  });
  assert.throws(
    () => productController.mount(accessor.options),
    (error) => error.code === 'INVALID_OPTIONS'
  );
  assert.equal(accessor.hosts[0].children.length, 0);
});

test('S4.1 rejects duplicate host or document ownership and releases it on destroy', async () => {
  const productController = loadModule();
  const fixture = createFixture();
  const first = productController.mount(fixture.options);
  assert.throws(
    () => productController.mount(fixture.options),
    (error) => error.code === 'ALREADY_MOUNTED'
  );
  assert.equal(fixture.hosts[0].children.length, 1);
  await first.destroy();
  assert.equal(fixture.hosts[0].children.length, 0);
  assert.doesNotThrow(() => productController.mount(fixture.options));
});

test('S4.2 basis renders safe German entry UI, exact public state and focus', async () => {
  const productController = loadModule();
  const fixture = createFixture();
  const controller = productController.mount(fixture.options);
  const rootElement = fixture.hosts[0].children[0];
  const [heading, status, primary, secondary] = rootElement.children;

  assert.equal(rootElement.dataset.activityV2R14Surface, 'capture-entry');
  assert.equal(heading.textContent, 'Training');
  assert.equal(status.getAttribute('aria-live'), 'polite');
  assert.equal(status.getAttribute('role'), 'alert');
  assert.deepEqual(Object.keys(controller.getState()), [
    'state',
    'reason',
    'busy',
    'recovery_state',
    'commit_state',
    'active_surface'
  ]);
  assert.equal(controller.getState().state, 'blocked');
  assert.equal(controller.getState().reason, 'auth_required');
  assert.ok(Object.isFrozen(controller.getState()));
  assert.equal(primary.children[0].textContent, 'Training starten');
  assert.equal(secondary.children[0].textContent, 'Verlauf');
  assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML|request_id|payload/i);

  const observed = [];
  const unsubscribe = controller.subscribe((state) => observed.push(state.state));
  await controller.setAuthenticated(true);
  assert.equal(controller.getState().state, 'idle');
  assert.equal(status.getAttribute('role'), 'status');
  assert.equal(fixture.document.activeElement, primary.children[0]);
  assert.equal(observed[0], 'blocked');
  assert.equal(observed.at(-1), 'idle');
  assert.match(cssSource, /min-height:\s*44px/);
  assert.match(cssSource, /@media\s*\(max-width:\s*390px\)/);
  assert.doesNotMatch(cssSource, /overflow-x:\s*(?:scroll|auto)/);
  unsubscribe();
});

test('S4.3 composes one v2 recovery, commit and session shell graph', async () => {
  const productController = loadModule();
  const fixture = createFixture();
  const controller = productController.mount(fixture.options);

  await controller.setAuthenticated(true);
  await controller.startSession();

  assert.equal(fixture.calls.filter((value) => value === 'recovery.open').length, 1);
  assert.equal(fixture.calls.filter((value) => value === 'recovery.startNew').length, 1);
  assert.equal(fixture.calls.filter((value) => value === 'commit.create').length, 1);
  assert.equal(fixture.calls.filter((value) => value === 'shell.mount').length, 1);
  assert.equal(fixture.calls.filter((value) => value === 'shell.open').length, 1);
  assert.equal(controller.getState().state, 'editing');
  assert.equal(controller.getState().active_surface, 'session');

  fixture.getCommit().publish(freezeCommitState('committed'));
  fixture.getCommit().publish(freezeCommitState('committed'));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(controller.getState().state, 'committed');
  assert.deepEqual(
    fixture.calls.filter((value) => value.startsWith('refreshActivityConsumers')),
    ['refreshActivityConsumers:0']
  );
});

test('S4.3 restores with the draft catalog version instead of current v2', async () => {
  const productController = loadModule();
  const fixture = createFixture({
    initialRecoveryState: 'recoverable',
    recoveredCatalogVersion: 1
  });
  const controller = productController.mount(fixture.options);

  await controller.setAuthenticated(true);
  assert.equal(controller.getState().state, 'recoverable');
  await controller.continueSession();

  assert.ok(fixture.calls.includes('recovery.continueSession'));
  assert.ok(fixture.calls.includes('resolveSemantics:1'));
  assert.equal(controller.getState().state, 'editing');
});

test('S4.3 logout waits for commit settlement, flushes and never discards', async () => {
  const productController = loadModule();
  const fixture = createFixture();
  const controller = productController.mount(fixture.options);
  await controller.setAuthenticated(true);
  await controller.startSession();
  fixture.getCommit().publish(freezeCommitState('preparing', null, true));

  let logoutSettled = false;
  const logout = controller.setAuthenticated(false).then(() => {
    logoutSettled = true;
  });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(logoutSettled, false);
  assert.equal(fixture.calls.includes('recovery.flush'), false);
  assert.equal(fixture.calls.includes('commit.destroy'), false);

  fixture.getCommit().publish(freezeCommitState('unknown', 'REQUEST_FAILED', true));
  await logout;
  assert.equal(logoutSettled, true);
  assert.ok(fixture.calls.indexOf('recovery.flush') < fixture.calls.indexOf('commit.destroy'));
  assert.equal(fixture.calls.includes('recovery.discard'), false);
  assert.equal(controller.getState().state, 'blocked');
  assert.equal(controller.getState().reason, 'auth_required');
});

test('S4.4 unknown close and reopen keeps the same commit controller for retry', async () => {
  const productController = loadModule();
  const fixture = createFixture();
  const controller = productController.mount(fixture.options);
  await controller.setAuthenticated(true);
  await controller.startSession();
  fixture.getCommit().publish(freezeCommitState('unknown', 'REQUEST_FAILED', true));

  assert.equal(await controller.requestClose(), true);
  assert.equal(controller.getState().state, 'unknown');
  assert.equal(controller.getState().active_surface, 'entry');
  await controller.continueSession();

  assert.equal(controller.getState().state, 'unknown');
  assert.equal(controller.getState().active_surface, 'session');
  assert.equal(fixture.calls.filter((value) => value === 'commit.create').length, 1);
  assert.equal(fixture.calls.filter((value) => value === 'recovery.open').length, 1);
});

test('S4.3 failed logout flush preserves the live recovery composition', async () => {
  const productController = loadModule();
  const fixture = createFixture({ flushFails: true });
  const controller = productController.mount(fixture.options);
  await controller.setAuthenticated(true);
  await controller.startSession();

  await controller.setAuthenticated(false);
  assert.equal(controller.getState().state, 'blocked');
  assert.equal(controller.getState().reason, 'recovery_flush_failed');
  assert.equal(fixture.calls.includes('shell.destroy'), false);
  assert.equal(fixture.calls.includes('commit.destroy'), false);
  assert.equal(fixture.calls.includes('recovery.destroy'), false);
  assert.equal(fixture.calls.includes('recovery.discard'), false);
});

test('S4.3 explicit recovered-draft discard uses only the normal recovery path', async () => {
  const productController = loadModule();
  const fixture = createFixture({
    initialRecoveryState: 'recoverable',
    confirmDiscard: true
  });
  const controller = productController.mount(fixture.options);
  await controller.setAuthenticated(true);

  assert.equal(await controller.discardRecoveredSession(), true);
  assert.equal(fixture.calls.filter((value) => value === 'recovery.discard').length, 1);
  assert.equal(fixture.calls.filter((value) => value === 'recovery.open').length, 2);
  assert.equal(fixture.calls.includes('commit.create'), false);
  assert.equal(controller.getState().state, 'idle');
});

test('S4.5 composes guarded history and safe export without health data events', async () => {
  const productController = loadModule();
  const fixture = createFixture();
  const controller = productController.mount(fixture.options);
  await controller.setAuthenticated(true);

  await controller.openHistory();
  const historyOptions = fixture.getHistoryOptions();
  assert.deepEqual(Object.keys(historyOptions.adapter), [
    'listSessions',
    'loadSessionDetail',
    'replaceSession',
    'deleteSession'
  ]);
  historyOptions.createCorrection({ catalog_version: 1 });
  assert.ok(fixture.calls.includes('correction.create:1'));
  assert.equal(controller.getState().state, 'history');

  await controller.requestClose();
  await controller.openExport();
  assert.ok(fixture.getExportRoot());
  assert.equal(controller.getState().state, 'export');
  assert.doesNotMatch(source, /CustomEvent\([^)]*,|console\.|localStorage/);
});

test('S4.5 rolls partial history and export composition back before exposure', async () => {
  const productController = loadModule();
  const historyFixture = createFixture();
  historyFixture.options.sessionHistoryShell.mount = () => {
    throw new Error('safe fixture shell failure');
  };
  const historyProduct = productController.mount(historyFixture.options);
  await historyProduct.setAuthenticated(true);
  await assert.rejects(
    historyProduct.openHistory(),
    (error) => error.code === 'HISTORY_COMPOSITION_FAILED'
  );
  assert.equal(historyFixture.hosts[2].children.length, 0);
  await historyProduct.destroy();

  const exportFixture = createFixture();
  exportFixture.options.coachingExportShell.mount = () => {
    throw new Error('safe fixture shell failure');
  };
  const exportProduct = productController.mount(exportFixture.options);
  await exportProduct.setAuthenticated(true);
  await assert.rejects(
    exportProduct.openExport(),
    (error) => error.code === 'EXPORT_COMPOSITION_FAILED'
  );
  assert.equal(exportFixture.hosts[3].children.length, 0);
});

test('S4.3 unknown recovery is quarantined and cannot be discarded', async () => {
  const productController = loadModule();
  const fixture = createFixture({ initialRecoveryState: 'blocked' });
  const controller = productController.mount(fixture.options);
  await controller.setAuthenticated(true);

  assert.equal(controller.getState().state, 'blocked');
  assert.equal(controller.getState().reason, 'unknown_recovery_schema');
  await assert.rejects(
    controller.discardRecoveredSession(),
    (error) => error.code === 'INVALID_STATE'
  );
  assert.equal(fixture.calls.includes('recovery.discard'), false);
});
