'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../../../../..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('R14 final guard reports the exact reader-preserving capture cutover boundary', () => {
  const output = execFileSync(
    process.execPath,
    [path.join(repoRoot, 'tools/activity-v2-r13-read-consumer-isolation.mjs')],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  assert.equal(
    output,
    'PASS verify_jwt_false=2 monthly_true=1 workflows=2 apikey_only=2 ' +
      'product_mode=final product_read_loads=6 cache_version=16 ' +
      'r14_capture_loads=15 secret_material=0 productive_dml=0 ' +
      'sql_union=1 trend_state_acl=select_only v1_capture=0\n'
  );
});

test('R13 guard protects flags, caller auth, product scope, secrets and SQL', () => {
  const source = read('tools/activity-v2-r13-read-consumer-isolation.mjs');
  assert.match(source, /VERIFY_JWT_FALSE_SCOPE/);
  assert.match(source, /MONTHLY_VERIFY_JWT_TRUE/);
  assert.match(source, /WORKFLOW_LEGACY_AUTH/);
  assert.match(source, /PRODUCT_SCRIPT_ORDER/);
  assert.match(source, /PRODUCT_MIXED_STATE/);
  assert.match(source, /productMode === 'final'/);
  assert.match(source, /CACHE_VERSION = 'v6'/);
  assert.match(source, /R14_PRODUCT_LOAD/);
  assert.match(source, /SECRET_MATERIAL/);
  assert.match(source, /PRODUCTIVE_SQL_DML/);
  assert.match(source, /SQL_UNION_COUNT/);
  assert.match(source, /TREND_STATE_ACL/);
});

test('S4.12 diagnostics retain only stable operation, code and status', () => {
  const source = read('app/modules/vitals-stack/activity/v2/data-access.js');
  assert.match(source, /`\[activity-v2\] \$\{operation\} failed code=\$\{code\} status=\$\{safeStatus\}`/);
  assert.doesNotMatch(source, /detail=|diagnosticText\s*\(/);

  const harness = read('app/modules/vitals-stack/activity/v2/session-commit-harness.js');
  assert.match(harness, /failure_stage: harnessStage/);
  assert.match(harness, /failure_code: failureCode/);
  assert.doesNotMatch(harness, /console\.|payloadText|request_id:/);
});

test('S4.12 commit core stays injection-only while the test PWA uses the local adapter', () => {
  const core = [
    read('app/modules/vitals-stack/activity/v2/session-commit.js'),
    read('app/modules/vitals-stack/activity/v2/session-recovery.js'),
    read('app/modules/vitals-stack/activity/v2/session-shell.js')
  ].join('\n');
  assert.doesNotMatch(core, /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|supabase\.co/);

  const localIndex = read('app/modules/vitals-stack/activity/v2/test-pwa/index.html');
  const localRuntime = read('app/modules/vitals-stack/activity/v2/test-pwa/local-test-pwa.js');
  assert.match(
    localRuntime,
    /'\.\.\/session-commit-harness-adapter\.js\?v=r8-s5-3'/
  );
  assert.doesNotMatch(localIndex, /data-access\.js|app\/modules\/vitals-stack\/activity\/index\.js/);
  assert.doesNotMatch(localRuntime, /console\.|localStorage|sessionStorage|fetch\s*\(/);
});

test('R14 productive surfaces load one V2 capture and preserve the R13 readers', () => {
  const productSources = [
    read('index.html'),
    read('service-worker.js'),
    read('public/manifest.json'),
    read('app/modules/vitals-stack/activity/index.js'),
    read('android/app/src/main/AndroidManifest.xml')
  ].join('\n');
  assert.match(productSources, /activity\/v2\/activity-consumer\.js/);
  assert.match(productSources, /activity\/v2\/activity-consumer-data-access\.js/);
  assert.match(productSources, /activity\/v2\/activity-product-controller\.js/);
  assert.doesNotMatch(productSources, /activity\/v2\/(?:test-pwa|[^\s"']*harness)|activityv2test|localhost:8765/);
  assert.doesNotMatch(read('index.html'), /src="app\/modules\/vitals-stack\/activity\/index\.js"/);
  assert.doesNotMatch(read('service-worker.js'), /toUrl\('app\/modules\/vitals-stack\/activity\/index\.js'\)/);
  assert.match(productSources, /const CACHE_VERSION = 'v16'/);
  assert.doesNotMatch(read('android/app/src/main/AndroidManifest.xml'), /usesCleartextTraffic/);
});
