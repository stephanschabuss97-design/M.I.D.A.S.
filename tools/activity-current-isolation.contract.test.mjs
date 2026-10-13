import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tools = {
  r8: 'tools/activity-v2-r8-isolation.mjs',
  r13: 'tools/activity-v2-r13-read-consumer-isolation.mjs'
};
const run = (tool, args = ['--current']) => spawnSync(
  process.execPath, [path.join(repo, tools[tool]), ...args],
  { cwd: repo, encoding: 'utf8', timeout: 30000 }
);

for (const tool of Object.keys(tools)) {
  test(`${tool}: accepted current baseline passes`, () => {
    const result = run(tool);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /current_contract=1\n$/);
  });
  test(`${tool}: unknown options and foreign fixture roots fail closed`, () => {
    const unknown = run(tool, ['--current', '--ignore-failure']);
    assert.notEqual(unknown.status, 0);
    assert.match(unknown.stderr, /CURRENT_UNKNOWN_OPTIONS/);
    const foreign = run(tool, ['--current', '--source-root', os.tmpdir()]);
    assert.notEqual(foreign.status, 0);
    assert.match(foreign.stderr, /CURRENT_FIXTURE_PATH/);
  });
}

test('current product cache and local worker retain the historical protection questions', () => {
  const read = (file) => fs.readFileSync(path.join(repo, file), 'utf8');
  const index = read('index.html');
  const worker = read('service-worker.js');
  const stylesheet = read('app/app.css');
  const localWorker = read('app/modules/vitals-stack/activity/v2/test-pwa/service-worker.js');
  const localIndex = read('app/modules/vitals-stack/activity/v2/test-pwa/index.html');
  assert.match(localWorker, /midas-activity-v2-r8-local-test-/);
  assert.match(localWorker, /event\.waitUntil\([\s\S]*?cache\.put\(request, copy\)/);
  assert.match(localWorker, /cached \|\| Response\.error\(\)/);
  for (const name of ['session-recovery.js', 'session-commit.js', 'session-commit-harness-adapter.js']) {
    assert.ok(localWorker.includes(`../${name}`));
  }
  assert.doesNotMatch(localWorker, /public\/manifest\.json|\/M\.I\.D\.A\.S\.\/|midas-shell-|activity\/index\.js|indexedDB|deleteDatabase|session_recovery|active_session/);
  assert.doesNotMatch(localIndex, /data-access\.js|app\/modules\/vitals-stack\/activity\/index\.js/);
  assert.doesNotMatch(index, /test-pwa|app\/modules\/vitals-stack\/activity\/index\.js/);
  assert.doesNotMatch(worker, /test-pwa|r8-local-test/);
  assert.match(worker, /const CACHE_VERSION = 'v34'/);
  for (const [file, version] of [
    ['app/app.css', 32], ['assets/js/main.js', 34],
    ['app/modules/vitals-stack/protein/index.js', 31],
    ['app/modules/vitals-stack/activity/v2/activity-product-controller.js', 32],
    ['app/modules/hub/index.js', 34]
  ]) {
    assert.ok(index.includes(`${file}?v=${version}`), file);
    assert.ok(worker.includes(`${file}?v=${version}`), file);
  }
  for (const name of ['session-shell.css', 'session-history-shell.css']) {
    assert.ok(worker.includes(`app/modules/vitals-stack/activity/v2/${name}?v=30`));
    assert.ok(stylesheet.includes(`./modules/vitals-stack/activity/v2/${name}?v=30`));
  }
});

// Copy only statically referenced repo files. Fixtures are read as text by the
// guards; neither product code nor SQL is executed from this directory.
const fixtureParent = path.join(repo, '.tmp', 'repo-cleanup');
fs.mkdirSync(fixtureParent, { recursive: true });
const fixture = fs.mkdtempSync(path.join(fixtureParent, 'MC-EX-01-oracle-'));
const sources = new Set(['index.html', 'service-worker.js']);
for (const file of Object.values(tools)) {
  for (const match of fs.readFileSync(path.join(repo, file), 'utf8').matchAll(
    /['"]((?:app|assets|public|android|backend|sql|docs|\.github)\/[^'"\n]+)['"]/g
  )) sources.add(match[1]);
}
for (const file of sources) {
  const source = path.join(repo, file);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) continue;
  const target = path.join(fixture, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}
const cases = [
  ['r13', 'backend/supabase/config.toml', (s) => s.replace('[functions.midas-monthly-report]\nverify_jwt = true', '[functions.midas-monthly-report]\nverify_jwt = false'), 'VERIFY_JWT_FALSE_SCOPE'],
  ['r13', 'index.html', (s) => s.replace('semantics.js?v=24', 'semantics.js?v=99'), 'R14_CAPTURE_SCRIPT_ORDER'],
  ['r8', 'index.html', (s) => s.replace('semantics.js?v=24', 'semantics.js?v=99'), 'PRODUCT_V2_LOAD'],
  ['r13', 'index.html', (s) => s.replace('  <script src="app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js"></script>', ''), 'PRODUCT_MIXED_STATE'],
  ['r13', 'service-worker.js', (s) => s.replace("CACHE_VERSION = 'v34'", "CACHE_VERSION = 'v35'"), 'WORKER_VERSION'],
  ['r13', 'index.html', (s) => s + '\n<script src="app/modules/vitals-stack/activity/v2/test-pwa/local-test-pwa.js"></script>', 'R14_PRODUCT_LOAD'],
  ['r13', 'index.html', (s) => s + '\n<script src="app/modules/vitals-stack/activity/index.js"></script>', 'V1_CAPTURE_LOAD'],
  ['r13', 'android/app/src/main/AndroidManifest.xml', (s) => s + '\n<!-- usesCleartextTraffic="true" -->', 'NATIVE_CLEARTEXT'],
  ['r13', '.github/workflows/protein-targets.yml', (s) => s + '\n# Authorization: forbidden-fixture', 'WORKFLOW_LEGACY_AUTH'],
  ['r13', 'backend/supabase/functions/_shared/edge-auth.ts', (s) => s.replace('result.data.authKeyName !== name', 'result.data.authKeyName === name'), 'INCIDENT_AUTH'],
  ['r13', 'backend/supabase/functions/_shared/activity-edge-principal.ts', (s) => s.replace('server@1.4.1', 'server@9.9.9'), 'AUTH_PACKAGE_PIN'],
  ['r13', 'sql/26_Activity_Consumer_Runtime_Activation.sql', (s) => s + '\nDELETE FROM public.health_events;', 'PRODUCTIVE_SQL_DML'],
  ['r13', 'sql/16_Explicit_Grants.sql', (s) => s + '\ngrant insert on public.trendpilot_state to authenticated;', 'TREND_STATE_ACL'],
  ['r13', 'index.html', (s) => s + '\n<!-- ' + ['sb', 'secret', 'a'.repeat(24)].join('_') + ' -->', 'SECRET_MATERIAL'],
  ['r8', 'app/modules/vitals-stack/activity/v2/session-commit.js', (s) => s + '\nfetch("/fixture");', 'CORE_NETWORK_EDGE'],
  ['r8', 'app/modules/vitals-stack/activity/v2/session-commit.js', (s) => s + '\nconsole.log("fixture");', 'CORE_CONSOLE'],
  ['r8', 'app/modules/vitals-stack/activity/v2/session-commit.js', (s) => s + '\nindexedDB.deleteDatabase("fixture");', 'RECOVERY_DELETE'],
  ['r8', 'app/modules/vitals-stack/activity/v2/data-access.js', (s) => s + '\ndiagnosticText("fixture");', 'UNSAFE_DIAGNOSTIC'],
  ['r8', 'sql/tests/25_Activity_Consumer_Compatibility_fixture.sql', (s) => s + '\nUPDATE public.health_events SET id = id;', 'R11_TEST_DML'],
  ['r8', 'app/supabase/api/reports.js', (s) => s + '\n// Unexpected reader drift.', 'CURRENT_SOURCE_BINDING']
];
test('each isolated source mutation fails for its bound contract reason', () => {
  try {
    for (const tool of Object.keys(tools)) {
      const positive = run(tool, ['--current', '--source-root', fixture]);
      assert.equal(positive.status, 0, positive.stderr);
    }
    for (const [tool, file, mutate, expected] of cases) {
      const target = path.join(fixture, file);
      const original = fs.readFileSync(target, 'utf8');
      const normalized = original.replace(/\r\n/g, '\n');
      const changed = mutate(normalized);
      assert.notEqual(changed, normalized, `fixture mutation missed: ${expected}`);
      try {
        fs.writeFileSync(target, changed);
        const result = run(tool, ['--current', '--source-root', fixture]);
        assert.notEqual(result.status, 0, expected);
        assert.match(result.stderr, new RegExp(expected), `${expected}: ${result.stderr}`);
        assert.doesNotMatch(result.stderr, /ENOENT|SyntaxError/, 'harness failure is not a negative oracle');
      } finally {
        fs.writeFileSync(target, original);
      }
    }
    const app = path.join(fixture, 'app');
    const savedApp = path.join(fixture, 'app-original');
    fs.renameSync(app, savedApp);
    try {
      fs.symlinkSync(path.join(repo, 'app'), app, 'junction');
      const result = run('r8', ['--current', '--source-root', fixture]);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /CURRENT_REPARSE_POINT/);
    } finally {
      if (fs.existsSync(app) && fs.lstatSync(app).isSymbolicLink()) fs.unlinkSync(app);
      fs.renameSync(savedApp, app);
    }
  } finally {
    assert.ok(path.resolve(fixture).startsWith(path.resolve(fixtureParent) + path.sep));
    fs.rmSync(fixture, { recursive: true });
  }
});
