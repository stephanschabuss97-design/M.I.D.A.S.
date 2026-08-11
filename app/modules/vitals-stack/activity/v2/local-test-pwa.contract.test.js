'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../../../../..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const gradle = read('android/app/build.gradle.kts');
const mainManifest = read('android/app/src/main/AndroidManifest.xml');
const mainStrings = read('android/app/src/main/res/values/strings.xml');
const debugManifest = read('android/app/src/debug/AndroidManifest.xml');
const debugStrings = read('android/app/src/debug/res/values/strings.xml');
const productIndex = read('index.html');
const productWorker = read('service-worker.js');
const localIndex = read('app/modules/vitals-stack/activity/v2/test-pwa/index.html');
const localRuntime = read('app/modules/vitals-stack/activity/v2/test-pwa/local-test-pwa.js');
const localWorker = read('app/modules/vitals-stack/activity/v2/test-pwa/service-worker.js');
const localManifest = JSON.parse(
  read('app/modules/vitals-stack/activity/v2/test-pwa/manifest.webmanifest')
);
const runbook = read('docs/qa/activity-v2-r8-local-android-pwa-runbook.md');

test('S4.11 Android seam separates debug identity, URL and cleartext from main', () => {
  assert.match(gradle, /debug\s*\{[\s\S]*applicationIdSuffix = "\.activityv2test"/);
  assert.match(gradle, /release\s*\{[\s\S]*isMinifyEnabled = false/);
  assert.match(debugManifest, /android:usesCleartextTraffic="true"/);
  assert.match(debugStrings, /<string name="midas_url">http:\/\/localhost:8765\/app\/modules\/vitals-stack\/activity\/v2\/test-pwa\/\?fixture=all<\/string>/);
  assert.match(debugStrings, /MIDAS Activity V2 Local Test/);
  assert.match(mainStrings, /<string name="midas_url">https:\/\/stephanschabuss97-design\.github\.io\/M\.I\.D\.A\.S\.\/<\/string>/);
  assert.doesNotMatch(mainManifest, /usesCleartextTraffic/);
  assert.doesNotMatch(mainManifest, /activityv2test|localhost/);
  assert.doesNotMatch(mainStrings, /activityv2test|localhost/);
});

test('S4.11 local PWA has an installable self-scoped localhost-only runtime', () => {
  assert.equal(localManifest.id, '/app/modules/vitals-stack/activity/v2/test-pwa/');
  assert.equal(localManifest.start_url, './?fixture=all');
  assert.equal(localManifest.scope, './');
  assert.equal(localManifest.display, 'standalone');
  assert.equal(localManifest.icons.length, 2);
  assert.match(localIndex, /<link rel="manifest" href="\.\/manifest\.webmanifest">/);
  assert.match(localIndex, /data-runtime-boundary="localhost-only"/);
  assert.doesNotMatch(localIndex, /<script src="\.\.\/session-/);
  assert.match(localIndex, /local-test-pwa\.js\?v=r8-s5-3/);
  assert.match(localRuntime, /Object\.freeze\(\['localhost', '127\.0\.0\.1', '\[::1\]'\]\)/);
  assert.match(
    localRuntime,
    /expectedPath\.slice\(0, -1\),\s*expectedPath,\s*`\$\{expectedPath\}index\.html`/
  );
  assert.match(localRuntime, /\.register\(\s*'\.\/service-worker\.js\?v=r8-s5-3',\s*\{ scope: '\.\/' \}\s*\)/);
  assert.match(localRuntime, /url\.search === expectedWorkerSearch/);
  assert.match(localRuntime, /isLocalWorkerController/);
  assert.match(localRuntime, /await waitForLocalController\(\)/);
  assert.match(localRuntime, /await loadHarness\(\)/);
  assert.match(
    localRuntime,
    /catch \(_\) \{[\s\S]*?Service-Worker-Registrierung fehlgeschlagen[\s\S]*?return;[\s\S]*?\}\s*await loadHarness\(\);/
  );
  assert.match(localRuntime, /'\.\.\/session-commit-harness\.js\?v=r8-s5-3'/);
  assert.match(localRuntime, /visibilitychange/);
  assert.doesNotMatch(localRuntime, /console\.|localStorage|sessionStorage|fetch\(/);
});

test('S5 local PWA cache-busters are identical between HTML requests and worker assets', () => {
  const stylesheetUrls = [...localIndex.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]
    .map((match) => match[1])
    .sort();
  const cachedStylesheetUrls = [...localWorker.matchAll(/'((?:\.\.\/|\.\/)[^']+\.css\?v=[^']+)'/g)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(cachedStylesheetUrls, stylesheetUrls);
  stylesheetUrls.forEach((url) => assert.match(url, /\?v=r8-s5-3$/));
  assert.match(localRuntime, /const expectedWorkerSearch = '\?v=r8-s5-3';/);
  assert.match(localWorker, /const CACHE_NAME = `\$\{CACHE_PREFIX\}v5`;/);
  assert.match(localWorker, /'\.\/local-test-pwa\.js\?v=r8-s5-3'/);
  assert.match(localWorker, /'\.\.\/session-commit-harness\.js\?v=r8-s5-3'/);
});

test('S4.11 local worker caches only the isolated harness and never owns Recovery storage', () => {
  assert.match(localWorker, /midas-activity-v2-r8-local-test-/);
  assert.match(localWorker, /event\.waitUntil\([\s\S]*?cache\.put\(request, copy\)/);
  assert.match(localWorker, /cached \|\| Response\.error\(\)/);
  assert.match(localWorker, /\.\.\/session-recovery\.js/);
  assert.match(localWorker, /\.\.\/session-commit\.js/);
  assert.match(localWorker, /\.\.\/session-commit-harness-adapter\.js/);
  assert.doesNotMatch(localWorker, /public\/manifest\.json|\/M\.I\.D\.A\.S\.\/|midas-shell-|activity\/index\.js/);
  assert.doesNotMatch(localWorker, /indexedDB|deleteDatabase|session_recovery|active_session/);
  assert.doesNotMatch(localIndex, /data-access\.js|app\/modules\/vitals-stack\/activity\/index\.js/);
  assert.match(productIndex, /app\/modules\/vitals-stack\/activity\/index\.js/);
  assert.doesNotMatch(productIndex, /activity\/v2\/|test-pwa/);
  assert.match(productWorker, /const CACHE_VERSION = 'v6'/);
  assert.doesNotMatch(productWorker, /activity\/v2\/|test-pwa|r8-local-test/);
});

test('S4.11 runbook keeps credentials ephemeral and device actions owner-gated', () => {
  assert.match(runbook, /Owner-Gate/);
  assert.match(runbook, /supabase status -o env/);
  assert.match(runbook, /adb reverse tcp:8765 tcp:8765/);
  assert.match(runbook, /adb reverse tcp:54321 tcp:54321/);
  assert.match(runbook, /de\.schabuss\.midas\.activityv2test/);
  assert.match(runbook, /kein(?:e|)\s+App-Data-Clear/i);
  assert.match(runbook, /kein(?:e|)\s+Uninstall/i);
  assert.match(runbook, /kein(?:e|)\s+physisches Recovery/i);
  assert.doesNotMatch(runbook, /service_role|eyJ[a-zA-Z0-9_-]{10,}\./);
});
