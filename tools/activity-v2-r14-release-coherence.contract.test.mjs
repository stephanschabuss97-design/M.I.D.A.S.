import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');
const index = read('index.html');
const css = read('app/app.css');
const worker = read('service-worker.js');
const supabaseIndex = read('app/supabase/index.js');
const authIndex = read('app/supabase/auth/index.js');
const rollback = read('tools/activity-v2-r14-v1-productload-rollback.ps1');

const supabaseModuleGraph = [
  'app/supabase/index.js',
  'app/supabase/core/state.js',
  'app/supabase/core/client.js',
  'app/supabase/core/http.js',
  'app/supabase/auth/index.js',
  'app/supabase/auth/core.js',
  'app/supabase/auth/ui.js',
  'app/supabase/auth/guard.js',
  'app/supabase/realtime/index.js',
  'app/supabase/api/intake.js',
  'app/supabase/api/vitals.js',
  'app/supabase/api/notes.js',
  'app/supabase/api/select.js',
  'app/supabase/api/push.js',
  'app/supabase/api/system-comments.js',
  'app/supabase/api/trendpilot.js',
  'app/supabase/api/reports.js',
  'assets/js/boot-auth.js'
];

const captureScripts = [
  'semantics.js',
  'semantics-v2.js',
  'session-draft.js',
  'session-recovery.js',
  'session-commit.js',
  'session-canonicalization.js',
  'activity-coaching-export.js',
  'data-access.js',
  'session-shell.js',
  'session-correction.js',
  'session-history.js',
  'session-history-shell.js',
  'activity-coaching-export-controller.js',
  'activity-coaching-export-shell.js',
  'activity-product-controller.js'
].map((file) => `app/modules/vitals-stack/activity/v2/${file}`);

test('R14 v22 release-critical URLs cannot hit unversioned or v20 runtime entries', () => {
  const critical = [
    'app/app.css',
    'app/supabase/index.js',
    'app/modules/doctor-stack/charts/index.js',
    'assets/js/main.js',
    ...captureScripts
  ];
  for (const relativePath of critical) {
    const releaseUrl = `${relativePath}?v=22`;
    assert.match(index, new RegExp(releaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(worker, new RegExp(releaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.notEqual(releaseUrl, relativePath);
    assert.notEqual(releaseUrl, `${relativePath}?v=20`);
  }
  for (const stylesheet of [
    'session-shell.css',
    'session-history-shell.css',
    'activity-coaching-export-shell.css',
    'activity-product-controller.css'
  ]) {
    assert.match(css, new RegExp(`${stylesheet.replace('.', '\\.')}\\?v=22`));
  }
  assert.match(supabaseIndex, /from '\.\/auth\/index\.js\?v=22'/);
  assert.match(supabaseIndex, /from '\.\/api\/vitals\.js\?v=22'/);
  assert.match(authIndex, /from '\.\/core\.js\?v=22'/);
  assert.match(worker, /test\(new URL\(request\.url\)\.pathname\)/);
});

test('R14 worker reads fallbacks and assets only from its own release caches', () => {
  assert.match(worker, /const shell = await caches\.open\(SHELL_CACHE\)/);
  assert.match(worker, /const runtime = await caches\.open\(RUNTIME_CACHE\)/);
  assert.match(worker, /getCurrentAssetResponse\(request\)\.then/);
  assert.doesNotMatch(worker, /caches\.match\(request\)/);
  assert.doesNotMatch(worker, /return caches\.match\(toUrl\('offline\.html'\)\)/);
});

test('R14 v22 installs one fully versioned Supabase ESM graph', () => {
  assert.match(index, /src="app\/supabase\/index\.js\?v=22"/);
  assert.match(index, /src="assets\/js\/boot-auth\.js\?v=22"/);

  for (const relativePath of supabaseModuleGraph) {
    const source = read(relativePath);
    assert.match(worker, new RegExp(
      `toUrl\\('${relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?v=22'\\)`
    ), `${relativePath} must be installed in the v22 shell cache`);

    const localImports = [...source.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+\.js(?:\?v=\d+)?)['"]/g)];
    for (const [, specifier] of localImports) {
      assert.match(specifier, /\?v=22$/, `${relativePath} has an unversioned or mixed import: ${specifier}`);
    }
  }
  assert.match(read('assets/js/boot-auth.js'), /from "\.\.\/\.\.\/app\/supabase\/index\.js\?v=22"/);
});

test('R14 v23 rollback changes every release-critical V1 URL again', () => {
  for (const relativePath of [
    'app/app.css',
    'app/modules/vitals-stack/activity/index.js',
    'app/supabase/index.js',
    'app/modules/doctor-stack/charts/index.js',
    'assets/js/main.js'
  ]) {
    assert.match(rollback, new RegExp(`${relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?v=23`));
  }
  assert.match(rollback, /\$supabaseModulePaths/);
  assert.match(rollback, /Set-ReleaseModuleVersion/);
  assert.match(rollback, /assets\/js\/boot-auth\.js\?v=23/);
  assert.match(rollback, /app\/supabase\/api\/reports\.js\?v=23/);
});
