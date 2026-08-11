'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../../../../..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('S4.12 integrated guard reports only the exact payload-free projection', () => {
  const output = execFileSync(
    process.execPath,
    [path.join(repoRoot, 'tools/activity-v2-r8-isolation.mjs')],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  assert.equal(
    output,
    'PASS protected=7 product_v2_loads=0 core_network_edges=0 ' +
      'unsafe_diagnostics=0 secret_material=0 recovery_deletes=0 local_worker_scope=1\n'
  );
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

test('S4.12 productive consumer, worker, manifest and native main stay V2-free', () => {
  const productSources = [
    read('index.html'),
    read('service-worker.js'),
    read('public/manifest.json'),
    read('app/modules/vitals-stack/activity/index.js'),
    read('android/app/src/main/AndroidManifest.xml')
  ].join('\n');
  assert.doesNotMatch(productSources, /activity\/v2|session-commit|test-pwa|activityv2test|localhost:8765/);
  assert.match(productSources, /app\/modules\/vitals-stack\/activity\/index\.js/);
  assert.match(productSources, /const CACHE_VERSION = 'v6'/);
  assert.doesNotMatch(read('android/app/src/main/AndroidManifest.xml'), /usesCleartextTraffic/);
});
