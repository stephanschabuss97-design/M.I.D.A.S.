'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const semanticsPath = path.join(__dirname, 'semantics.js');
const semanticsV2Path = path.join(__dirname, 'semantics-v2.js');
const semanticsTestPath = path.join(__dirname, 'semantics.contract.test.js');
const draftPath = path.join(__dirname, 'session-draft.js');
const shellPath = path.join(__dirname, 'session-shell.js');
const shellTestPath = path.join(__dirname, 'session-shell.contract.test.js');
const indexPath = path.resolve(__dirname, '../../../../..', 'index.html');
const contractPath = path.resolve(
  __dirname,
  '../../../../..',
  'docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md'
);

const semanticsSource = fs.readFileSync(semanticsPath, 'utf8');
const semanticsV2Source = fs.readFileSync(semanticsV2Path, 'utf8');
const draftSource = fs.readFileSync(draftPath, 'utf8');
const shellSource = fs.readFileSync(shellPath, 'utf8');
const shellTestSource = fs.readFileSync(shellTestPath, 'utf8');
const indexSource = fs.readFileSync(indexPath, 'utf8');
const API_KEYS = [
  'getCatalog',
  'getEntryByKey',
  'normalizeSearchText',
  'validateCatalog',
  'search'
];

function readContract() {
  const source = fs.readFileSync(contractPath, 'utf8');
  const match = source.match(
    /<!-- MIDAS_ACTIVITY_V2_C2_CONTRACT_JSON_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- MIDAS_ACTIVITY_V2_C2_CONTRACT_JSON_END -->/
  );
  assert.ok(match, 'machine-readable C2 contract markers are required');
  return JSON.parse(match[1]);
}

function createContext(overrides = {}) {
  const context = vm.createContext({
    confirm: () => false,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000021' },
    setInterval: () => 1,
    clearInterval: () => {},
    ...overrides
  });
  vm.runInContext(semanticsSource, context, { filename: semanticsPath });
  return context;
}

function loadV2(context) {
  vm.runInContext(semanticsV2Source, context, { filename: semanticsV2Path });
  return context.AppModules.activityV2.semanticsV2;
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

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function getFakeDocumentClass() {
  const start = shellTestSource.indexOf('class FakeElement');
  const end = shellTestSource.indexOf('\nfunction assertFrozenTree', start);
  assert.ok(start >= 0 && end > start, 'approved R3 fake DOM fixture must be present');
  const fixtureContext = vm.createContext({});
  vm.runInContext(
    `${shellTestSource.slice(start, end)}\nglobalThis.C2FakeDocument = FakeDocument;`,
    fixtureContext,
    { filename: shellTestPath }
  );
  return fixtureContext.C2FakeDocument;
}

test('semanticsV2 is additive, exact, immutable and leaves v1 unchanged', () => {
  const contract = readContract();
  const context = createContext();
  const namespace = context.AppModules.activityV2;
  const v1 = namespace.semantics;
  const v1Before = plain(v1.getCatalog());
  const globalsBefore = Reflect.ownKeys(context).sort();
  const v2 = loadV2(context);

  assert.deepEqual(Object.keys(v2), API_KEYS);
  assert.deepEqual(Reflect.ownKeys(context).sort(), globalsBefore);
  assert.notEqual(v2, v1);
  assert.deepEqual(plain(v1.getCatalog()), v1Before);
  assert.equal(v1.getCatalog().catalog_version, 1);
  assert.equal(v1.getCatalog().entries.length, 78);
  assert.deepEqual(plain(v2.getCatalog()), contract.catalog);
  assert.deepEqual(plain(v2.validateCatalog(v2.getCatalog())), {
    valid: true,
    errors: []
  });
  assertFrozenTree(v2);
  assertFrozenTree(v2.getCatalog());

  const descriptor = Object.getOwnPropertyDescriptor(namespace, 'semanticsV2');
  assert.deepEqual(
    {
      enumerable: descriptor.enumerable,
      writable: descriptor.writable,
      configurable: descriptor.configurable
    },
    { enumerable: true, writable: false, configurable: false }
  );
});

test('catalog v2 retains 78 exact base entries and only the frozen C2 additions', () => {
  const contract = readContract();
  const context = createContext();
  const v1 = context.AppModules.activityV2.semantics;
  const v2 = loadV2(context);
  const base = v1.getCatalog();
  const catalog = v2.getCatalog();
  const byKey = new Map(catalog.entries.map((entry) => [entry.key, entry]));

  assert.equal(catalog.schema_version, 'midas.activity-catalog.v1');
  assert.equal(catalog.catalog_version, 2);
  assert.equal(catalog.entries.length, 80);
  assert.equal(catalog.entries.every((entry) => entry.status === 'active'), true);
  assert.deepEqual(
    plain(catalog.entries.map((entry) => entry.key)),
    [...catalog.entries.map((entry) => entry.key)].sort()
  );
  assert.deepEqual(contract.new_keys, ['high_row', 'total_abdominal']);
  assert.equal(byKey.has('multi_hip'), false);
  assert.equal(byKey.has('hip_flexion'), false);

  base.entries.forEach((baseEntry) => {
    const v2Entry = byKey.get(baseEntry.key);
    assert.ok(v2Entry, `${baseEntry.key} must remain present`);
    const baseWithoutAliases = plain(baseEntry);
    const v2WithoutAliases = plain(v2Entry);
    delete baseWithoutAliases.aliases;
    delete v2WithoutAliases.aliases;
    assert.deepEqual(v2WithoutAliases, baseWithoutAliases);
    assert.deepEqual(
      plain(v2Entry.aliases),
      [...plain(baseEntry.aliases), ...(contract.existing_alias_appends[baseEntry.key] || [])]
    );
  });
  assert.equal(Object.keys(contract.existing_alias_appends).length, 24);
  assert.equal(Object.values(contract.existing_alias_appends).flat().length, 47);
  Object.entries(contract.existing_alias_appends).forEach(([key, aliases]) => {
    aliases.forEach((alias) => {
      const normalizedAlias = v2.normalizeSearchText(alias);
      const exactOwners = catalog.entries
        .filter((entry) =>
          [entry.label, entry.key, ...entry.aliases].some(
            (form) => v2.normalizeSearchText(form) === normalizedAlias
          )
        )
        .map((entry) => entry.key);
      assert.deepEqual(plain(exactOwners), [key], `${alias} exact owners`);
      assert.equal(v2.search(alias)[0]?.key, key, `${alias} rank 1`);
    });
  });
  assert.ok(Math.max(...catalog.entries.map((entry) => entry.aliases.length)) <= 12);
});

test('all frozen studio, normalization, compatibility and limit searches pass', () => {
  const contract = readContract();
  const context = createContext();
  const v1 = context.AppModules.activityV2.semantics;
  const v2 = loadV2(context);

  assert.equal(contract.studio_search_cases.length, 53);
  assert.equal(contract.compatibility_search_cases.length, 5);
  [...contract.studio_search_cases, ...contract.compatibility_search_cases].forEach(
    (searchCase) => {
      const actual = v2
        .search(searchCase.query, searchCase.options)
        .map((entry) => entry.key);
      assert.deepEqual(plain(actual), searchCase.expected_keys, searchCase.id);
    }
  );
  assert.equal(v2.normalizeSearchText('HÜFTABDUKTION'), 'huftabduktion');
  assert.equal(
    v2.normalizeSearchText('HÜFTABDUKTION'),
    v1.normalizeSearchText('HÜFTABDUKTION')
  );
  assertFrozenTree(v2.search('Multi Hip'));
  assertFrozenTree(v2.search('no catalog result expected'));
  assert.throws(
    () => v2.search('Multi Hip', { limit: 0 }),
    (error) => error.name === 'RangeError'
  );
  assert.throws(
    () => v2.search('Multi Hip', { unknown: true }),
    (error) => error.name === 'TypeError'
  );
  assert.throws(() => v2.search(null), (error) => error.name === 'TypeError');
  assert.throws(
    () => v2.getEntryByKey(null),
    (error) => error.name === 'TypeError'
  );
  assert.equal(v2.getEntryByKey('unknown_key'), null);
  assert.equal(v2.getEntryByKey('high_row').label, 'High Row');
  assert.equal(v2.getEntryByKey('total_abdominal').label, 'Total Abdominal');
});

test('semanticsV2 fails closed without the exact valid v1 boundary', () => {
  const missingContext = vm.createContext({});
  assert.throws(
    () => vm.runInContext(semanticsV2Source, missingContext),
    (error) => error.code === 'activity_v2_catalog_v2_base_invalid'
  );
  assert.equal(missingContext.AppModules, undefined);

  const invalidContext = vm.createContext({
    AppModules: {
      activityV2: {
        semantics: {
          getCatalog: () => ({ catalog_version: 1, entries: [] }),
          getEntryByKey: () => null,
          normalizeSearchText: (value) => value,
          validateCatalog: () => ({ valid: false, errors: [] }),
          search: () => []
        }
      }
    }
  });
  assert.throws(
    () => vm.runInContext(semanticsV2Source, invalidContext),
    (error) => error.code === 'activity_v2_catalog_v2_base_invalid'
  );
  assert.equal('semanticsV2' in invalidContext.AppModules.activityV2, false);

  const duplicateContext = createContext();
  loadV2(duplicateContext);
  assert.throws(
    () => loadV2(duplicateContext),
    /semanticsV2 is already registered/
  );
});

test('real R3 draft and shell accept injected v2 and both new keys', () => {
  const FakeDocument = getFakeDocumentClass();
  const document = new FakeDocument();
  const intervals = new Map();
  let intervalId = 0;
  const context = createContext({
    document,
    setInterval(callback, delay) {
      intervalId += 1;
      intervals.set(intervalId, { callback, delay });
      return intervalId;
    },
    clearInterval(id) {
      intervals.delete(id);
    }
  });
  const v2 = loadV2(context);
  vm.runInContext(draftSource, context, { filename: draftPath });
  vm.runInContext(shellSource, context, { filename: shellPath });

  let requestSequence = 0;
  const draft = context.AppModules.activityV2.sessionDraft.create({
    semantics: v2,
    now: () => 1_722_509_200_000,
    createRequestId: () =>
      `00000000-0000-4000-8000-${String(++requestSequence).padStart(12, '0')}`
  });
  draft.addItem('high_row');
  draft.addItem('total_abdominal');
  assert.equal(draft.getSnapshot().catalog_version, 2);
  assert.deepEqual(
    plain(draft.getSnapshot().items.map((item) => item.item_key)),
    ['high_row', 'total_abdominal']
  );

  const background = document.createElement('main');
  const opener = document.createElement('button');
  background.appendChild(opener);
  document.body.appendChild(background);
  opener.focus();
  const shell = context.AppModules.activityV2.sessionShell.mount({
    host: document.body,
    draft,
    semantics: v2,
    confirmDiscard: () => false,
    setIntervalFn: context.setInterval,
    clearIntervalFn: context.clearInterval
  });
  shell.open({ opener });
  const panel = document.body.children.find((element) =>
    element.className.split(/\s+/).includes('activity-v2-session-shell')
  );
  assert.ok(panel);
  assert.deepEqual(
    plain(
      panel
        .querySelectorAll('.activity-v2-session-item-label')
        .map((element) => element.textContent)
    ),
    ['High Row', 'Total Abdominal']
  );
  const search = panel.querySelector('input');
  search.value = 'High Row';
  panel.dispatchEvent({ type: 'input', target: search });
  const result = panel
    .querySelectorAll('[data-action="select-search-result"]')
    .find((button) => button.dataset.itemKey === 'high_row');
  assert.ok(result);
  assert.match(result.textContent, /Bereits in Session/);
  shell.destroy();
  assert.equal(intervals.size, 0);
});

test('R3 fallback and product index remain v1-only and C2 has no side effects', () => {
  assert.match(draftSource, /root\.AppModules\?\.activityV2\?\.semantics/);
  assert.match(shellSource, /root\.AppModules\?\.activityV2\?\.semantics/);
  assert.doesNotMatch(draftSource, /semanticsV2/);
  assert.doesNotMatch(shellSource, /semanticsV2/);
  assert.doesNotMatch(indexSource, /semantics-v2\.js|semanticsV2/);
  assert.doesNotMatch(semanticsV2Source, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
  assert.doesNotMatch(semanticsV2Source, /require\s*\(|module\.exports|document\./);
  assert.equal(fs.existsSync(semanticsTestPath), true);
});
