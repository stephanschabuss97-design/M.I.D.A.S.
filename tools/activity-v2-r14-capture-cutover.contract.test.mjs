import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');
const sha256 = (relativePath) => createHash('sha256')
  .update(readFileSync(path.join(repoRoot, relativePath)))
  .digest('hex');
const count = (source, literal) => source.split(literal).length - 1;
const gitShow = (revision, relativePath) => execFileSync(
  'git',
  ['show', `${revision}:${relativePath}`],
  { cwd: repoRoot, encoding: 'utf8' }
);

const baselineCommit = '4be058b1b2e59f410ea8a6e3a4e5af9fdb86b652';
const captureOrder = Object.freeze([
  'app/modules/vitals-stack/activity/v2/semantics.js',
  'app/modules/vitals-stack/activity/v2/semantics-v2.js',
  'app/modules/vitals-stack/activity/v2/session-draft.js',
  'app/modules/vitals-stack/activity/v2/session-recovery.js',
  'app/modules/vitals-stack/activity/v2/session-commit.js',
  'app/modules/vitals-stack/activity/v2/session-canonicalization.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.js',
  'app/modules/vitals-stack/activity/v2/data-access.js',
  'app/modules/vitals-stack/activity/v2/session-shell.js',
  'app/modules/vitals-stack/activity/v2/session-correction.js',
  'app/modules/vitals-stack/activity/v2/session-history.js',
  'app/modules/vitals-stack/activity/v2/session-history-shell.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-controller.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.js',
  'app/modules/vitals-stack/activity/v2/activity-product-controller.js'
]);
const stylePaths = Object.freeze([
  'app/modules/vitals-stack/activity/v2/session-shell.css',
  'app/modules/vitals-stack/activity/v2/session-history-shell.css',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.css',
  'app/modules/vitals-stack/activity/v2/activity-product-controller.css'
]);
const readerHashes = Object.freeze({
  'app/modules/vitals-stack/activity/v2/activity-consumer.js':
    'f30fa02ae6ee10ce0e45df6b19314b8bf669e596599612dffbc326717dae5bc0',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js':
    '0bacdccb96c8471dfa165ebed306d69cc08608020fdc7335fb2395e310fa5791',
  'app/modules/doctor-stack/doctor/activity-consumer-view.js':
    '6a7b9126a52c3958acd703eca2fc6c7a5eb546bd6304abd414235ad22dad020f',
  'app/modules/doctor-stack/doctor/health-export-v3.js':
    '538a9db15687e8aff87880631ca6a57865d869290ffee5112635ee94853e1106'
});

test('R14 productload is one ordered V2 writer graph with exact v14 cache identities', () => {
  const index = read('index.html');
  const worker = read('service-worker.js');
  const css = read('app/app.css');
  let previousIndex = -1;
  let previousWorker = -1;
  for (const relativePath of captureOrder) {
    const indexPosition = index.indexOf(`src="${relativePath}"`);
    const workerPosition = worker.indexOf(`toUrl('${relativePath}')`);
    assert.ok(indexPosition > previousIndex, relativePath);
    assert.ok(workerPosition > previousWorker, relativePath);
    assert.equal(count(index, `src="${relativePath}"`), 1, relativePath);
    assert.equal(count(worker, `toUrl('${relativePath}')`), 1, relativePath);
    previousIndex = indexPosition;
    previousWorker = workerPosition;
  }
  assert.ok(previousIndex < index.indexOf('src="app/supabase/index.js"'));
  for (const relativePath of stylePaths) {
    const importPath = relativePath.replace(/^app\//, './');
    assert.equal(count(css, `@import url("${importPath}")`), 1, relativePath);
    assert.equal(count(worker, `toUrl('${relativePath}')`), 1, relativePath);
  }
  assert.match(worker, /const CACHE_VERSION = 'v14'/);
  assert.doesNotMatch(index, /src="app\/modules\/vitals-stack\/activity\/index\.js"/);
  assert.doesNotMatch(worker, /toUrl\('app\/modules\/vitals-stack\/activity\/index\.js'\)/);
  assert.doesNotMatch(`${index}\n${worker}`, /activity\/v2\/(?:test-pwa|[^\s"']*harness)/);
});

test('R14 DOM, Main and auth lifecycle expose one fail-closed V2 capture owner', () => {
  const index = read('index.html');
  const main = read('assets/js/main.js');
  const auth = read('app/supabase/auth/core.js');
  for (const id of [
    'activityV2ProductHost',
    'activityV2SessionHost',
    'activityV2HistoryHost',
    'activityV2ExportHost'
  ]) {
    assert.equal(count(index, `id="${id}"`), 1, id);
  }
  assert.doesNotMatch(`${index}\n${main}`, /activityForm|trainingDate|activitySaveInFlight/);
  assert.doesNotMatch(`${index}\n${main}\n${read('service-worker.js')}`, /activity_add|\.addActivity\?\.\(/);
  assert.equal(count(main, 'activityV2.productController.mount({'), 1);
  assert.equal(count(main, "document.dispatchEvent(new Event('activity:changed'))"), 1);
  assert.doesNotMatch(main, /CustomEvent\('activity:changed'/);
  assert.match(main, /createRequestId: createActivityV2Uuid/);
  assert.match(main, /createLeaseToken: createActivityV2Uuid/);
  assert.match(main, /semantics: activityV2\.semanticsV2/);
  assert.match(main, /resolveSemantics: activityV2\.sessionRecovery\.resolveSemantics/);
  assert.match(auth, /await syncActivityV2Authentication\(false\);[\s\S]*?finalizeAuthState\(false\)/);
  assert.match(auth, /await syncActivityV2Authentication\(true\);[\s\S]*?finalizeAuthState\(true\)/);
});

test('R14 chart consumes only the unchanged R13 snapshot and aggregates markers deterministically', () => {
  const source = read('app/modules/doctor-stack/charts/index.js');
  assert.match(source, /activityV2\?\.consumerDataAccess\?\.loadSnapshot/);
  assert.match(source, /activityLoader\(\{ from: rangeFrom, to: rangeTo \}\)/);
  assert.doesNotMatch(source, /activityModule\.loadActivities|_callActivityRpc\(\s*"activity_list"/);

  const start = source.indexOf('const normalizeDayKey =');
  const end = source.indexOf('if (metric === "bp")', start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({ input: null, result: null });
  new vm.Script(`${source.slice(start, end)}\nresult = Array.from(buildActivityMarkerMap(input));`)
    .runInContext(context);

  context.input = [{
    source: 'activity_v1', day: '2026-08-01', label: 'Gym', duration_min: 45, note: 'ruhig'
  }];
  new vm.Script('result = Array.from(buildActivityMarkerMap(input));').runInContext(context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.result)), [[
    '2026-08-01', { activity: 'Gym', duration_min: 45, note: 'ruhig' }
  ]]);

  context.input = [
    { source: 'activity_v1', day: '2026-08-02', label: 'Gym', duration_min: 20, note: 'a' },
    { source: 'activity_v2', day: '2026-08-02', label: 'Laufen', duration_min: 30, note: 'b' }
  ];
  new vm.Script('result = Array.from(buildActivityMarkerMap(input));').runInContext(context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.result)), [[
    '2026-08-02', { activity: '2 Trainings', duration_min: 50, note: '' }
  ]]);
  for (const [relativePath, expectedHash] of Object.entries(readerHashes)) {
    assert.equal(sha256(relativePath), expectedHash, relativePath);
  }
});

test('R14 rollback material restores only explicit baseline product paths and creates v15', () => {
  const rollback = read('tools/activity-v2-r14-v1-productload-rollback.ps1');
  assert.match(rollback, /\[switch\]\$ConfirmRollback/);
  assert.match(rollback, new RegExp(baselineCommit));
  for (const relativePath of [
    'index.html',
    'app/app.css',
    'assets/js/main.js',
    'app/supabase/auth/core.js',
    'app/modules/doctor-stack/charts/index.js',
    'service-worker.js'
  ]) {
    assert.match(rollback, new RegExp(relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(rollback, /restore --source=\$baselineCommit --worktree -- @productPaths/);
  assert.match(rollback, /const CACHE_VERSION = 'v15'/);
  assert.match(rollback, /app\/modules\/vitals-stack\/activity\/index\.js/);
  assert.doesNotMatch(rollback, /reset --hard|clean\s+-|sql\/|docs\/|indexedDB\.deleteDatabase|Remove-Item/);

  const rollbackIndex = gitShow(baselineCommit, 'index.html');
  const rollbackMain = gitShow(baselineCommit, 'assets/js/main.js');
  let rollbackWorker = gitShow(baselineCommit, 'service-worker.js')
    .replace("const CACHE_VERSION = 'v13';", "const CACHE_VERSION = 'v15';")
    .replace(
      "  toUrl('assets/js/ui-tabs.js'),",
      "  toUrl('assets/js/ui-tabs.js'),\n  toUrl('app/modules/vitals-stack/activity/index.js'),"
    );
  assert.equal(count(rollbackIndex, 'id="activityForm"'), 1);
  assert.equal(count(rollbackIndex, 'src="app/modules/vitals-stack/activity/index.js"'), 1);
  assert.equal(count(rollbackMain, "activityForm?.addEventListener('submit'"), 1);
  assert.equal(count(rollbackMain, 'activity?.addActivity?.({'), 1);
  assert.match(rollbackWorker, /const CACHE_VERSION = 'v15'/);
  assert.equal(count(rollbackWorker, "toUrl('app/modules/vitals-stack/activity/index.js')"), 1);
  assert.doesNotMatch(rollbackWorker, /activity\/v2\/activity-product-controller\.js/);
});
