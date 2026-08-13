'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const shellPath = path.join(__dirname, 'session-history-shell.js');
const harnessPath = path.join(__dirname, 'session-history-harness.js');
const harnessHtmlPath = path.join(__dirname, 'session-history-harness.html');
const cssPath = path.join(__dirname, 'session-history-shell.css');
const rootIndexPath = path.resolve(__dirname, '..', '..', '..', '..', '..', 'index.html');
const shellSource = fs.readFileSync(shellPath, 'utf8');
const harnessSource = fs.readFileSync(harnessPath, 'utf8');
const harnessHtml = fs.readFileSync(harnessHtmlPath, 'utf8');
const cssSource = fs.readFileSync(cssPath, 'utf8');

test('Block C shell namespace is additive, exact, frozen and product-isolated', () => {
  const activityV1 = Object.freeze({ sentinel: true });
  const context = vm.createContext({
    AppModules: { activity: activityV1, activityV2: {} }
  });
  new vm.Script(shellSource, { filename: shellPath }).runInContext(context);
  const shell = context.AppModules.activityV2.sessionHistoryShell;
  assert.equal(context.AppModules.activity, activityV1);
  assert.deepEqual(Object.keys(shell), ['mount']);
  assert.equal(Object.isFrozen(shell), true);
  assert.throws(
    () => shell.mount({}),
    (error) =>
      error?.name === 'ActivityV2SessionHistoryShellError' &&
      error?.code === 'INVALID_OPTIONS' &&
      error?.message === 'The activity session history shell could not be completed.'
  );

  const rootIndex = fs.readFileSync(rootIndexPath, 'utf8');
  [
    'session-history.js',
    'session-history-shell.js',
    'session-history-harness.js',
    'session-history-shell.css'
  ].forEach((name) => assert.equal(rootIndex.includes(name), false));
});

test('shell mount releases an acquired subscription when initial render fails', () => {
  const context = vm.createContext({ AppModules: { activityV2: {} } });
  new vm.Script(shellSource, { filename: shellPath }).runInContext(context);
  const methodBlock = shellSource.match(
    /const CONTROLLER_METHODS = Object\.freeze\(\[([\s\S]*?)\]\);/
  );
  assert.ok(methodBlock);
  const methodNames = [...methodBlock[1].matchAll(/'([^']+)'/g)].map(
    (match) => match[1]
  );
  const controller = Object.fromEntries(methodNames.map((name) => [name, () => {}]));
  controller.getState = () => ({ mutation_busy: false });
  let unsubscribeCalls = 0;
  controller.subscribe = () => () => {
    unsubscribeCalls += 1;
  };
  controller.refreshHistory = () => Promise.resolve();

  let removed = false;
  let createElementCalls = 0;
  const rootElement = {
    className: '',
    dataset: {},
    setAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    contains() { return false; },
    remove() { removed = true; }
  };
  const document = {
    activeElement: null,
    createElement() {
      createElementCalls += 1;
      if (createElementCalls === 1) return rootElement;
      throw new Error('render failed');
    },
    createDocumentFragment() { return {}; }
  };
  const host = {
    nodeType: 1,
    ownerDocument: document,
    appendChild() {}
  };

  assert.throws(
    () => context.AppModules.activityV2.sessionHistoryShell.mount({ host, controller }),
    (error) =>
      error?.name === 'ActivityV2SessionHistoryShellError' &&
      error?.code === 'INVALID_CONTROLLER'
  );
  assert.equal(unsubscribeCalls, 1);
  assert.equal(removed, true);
});

test('Block D harness uses real isolated data access and cache seams deterministically', () => {
  const scriptSources = [...harnessHtml.matchAll(/<script src="([^\"]+)"/g)].map(
    (match) => match[1].split('?')[0]
  );
  assert.deepEqual(scriptSources, [
    './semantics.js',
    './semantics-v2.js',
    './session-draft.js',
    './session-shell.js',
    './session-canonicalization.js',
    './session-correction.js',
    './data-access.js',
    './session-history.js',
    './session-history-shell.js',
    './session-history-harness.js'
  ]);
  assert.equal(/https?:\/\//i.test(harnessHtml), false);
  assert.equal(/\bfetch\s*\(/.test(harnessSource), false);
  assert.equal(/localStorage|sessionStorage|serviceWorker/.test(harnessSource), false);
  assert.match(harnessHtml, /productSentinel/);
  assert.match(harnessSource, /__midasActivityV2R9Harness/);
  assert.match(harnessSource, /dataAccess\.listSessions/);
  assert.match(harnessSource, /dataAccess\.replaceSession/);
  assert.match(harnessSource, /liveSessionShell\.refreshLastPerformance/);
  assert.doesNotMatch(harnessSource, /async listSessions\(request\)/);
});

test('T-ACT-R9-05/-06 shell states, snapshots and responsive boundary stay explicit', () => {
  [
    'refresh-history',
    'load-more',
    'open-detail',
    'retry-detail',
    'item_label_snapshot',
    'field_policy_snapshot'
  ].forEach((marker) => assert.match(shellSource, new RegExp(marker)));
  assert.match(cssSource, /@media \(max-width: 56rem\)/);
  assert.match(cssSource, /@media \(max-width: 38rem\)/);
  assert.match(cssSource, /:focus-visible/);
  assert.match(cssSource, /prefers-reduced-motion/);
});

test('T-ACT-R9-07/-08 correction UX exposes policy fields and bounded state actions only', () => {
  [
    'correction-close',
    'correction-cancel-close',
    'correction-confirm-close',
    'correction-save',
    'correction-retry',
    'correction-add-item',
    'correction-remove-item',
    'correction-move-item',
    'correction-add-set',
    'correction-remove-set'
  ].forEach((marker) => assert.match(shellSource, new RegExp(marker)));
  assert.match(shellSource, /originalCatalogEntries\(working\.catalog_version\)/);
  assert.match(shellSource, /field_policy_snapshot\[key\] !== 'forbidden'/);
  assert.match(shellSource, /Ungespeicherte Korrektur verwerfen\?/);
  assert.match(shellSource, /focusByKey\(opened \? 'correction-title'/);
  assert.match(shellSource, /focusByKey\(closed \? 'open-correction' : 'correction-cancel-close'/);
  assert.match(
    shellSource,
    /catch \{\s*render\(\);\s*return;\s*\} finally \{\s*suppressNextRender = false;/
  );
  assert.match(
    shellSource,
    /function focusByKey\(key\) \{[\s\S]*?try \{[\s\S]*?querySelector\([\s\S]*?catch \{/
  );
  assert.match(shellSource, /rootElement\.dataset\.busy = state\.mutation_busy \? 'true' : 'false'/);
  assert.match(
    cssSource,
    /\.activity-v2-history-entry:disabled,[\s\S]*?cursor: not-allowed;/
  );
  assert.match(
    cssSource,
    /\.activity-v2-history-shell\[data-busy="true"\][\s\S]*?cursor: wait;/
  );
  assert.doesNotMatch(shellSource, /aria-modal/);
  assert.equal(/liveCatalog|highestCatalog|catalogMigration/i.test(shellSource), false);
});

test('T-ACT-R9-09 delete UX has one scoped confirmation and no bulk or undo action', () => {
  assert.equal(
    (shellSource.match(/'delete-confirm'/g) || []).length,
    2,
    'one render marker and one dispatcher branch are expected'
  );
  assert.match(shellSource, /current\.context\.day/);
  assert.match(shellSource, /current\.context\.item_count/);
  assert.match(shellSource, /Dieses Training endgültig löschen/);
  assert.match(shellSource, /focusByKey\(opened \? 'delete-title'/);
  assert.equal(/data-action[^\n]*(bulk|undo)|'(bulk|undo)[^']*'/i.test(shellSource), false);
});
