'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../../../..');
const read = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const indexSource = read('index.html');
const doctorSource = read('app/modules/doctor-stack/doctor/index.js');
const cssSource = read('app/app.css');
const serviceWorkerSource = read('service-worker.js');

const PRODUCT_ORDER = [
  'app/modules/vitals-stack/activity/v2/activity-consumer.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js',
  'app/modules/doctor-stack/doctor/activity-consumer-view.js',
  'app/modules/doctor-stack/doctor/health-export-v3.js',
  'app/modules/doctor-stack/reports/index.js',
  'app/modules/doctor-stack/doctor/index.js'
];
const CAPTURE_ORDER = [
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
];

test('T-ACT-R14-01 loads V2 capture before the unchanged reader order', () => {
  let previous = -1;
  PRODUCT_ORDER.forEach((source) => {
    const current = indexSource.indexOf(`src="${source}"`);
    assert.ok(current > previous, `${source} must follow the previous product module`);
    previous = current;
  });
  const activityV2Scripts = [...indexSource.matchAll(
    /<script[^>]+src="([^"]*\/activity\/v2\/[^"]+)"[^>]*><\/script>/g
  )].map((match) => match[1]);
  assert.deepEqual(activityV2Scripts, [...CAPTURE_ORDER, ...PRODUCT_ORDER.slice(0, 2)]);
  assert.ok(
    indexSource.indexOf(`src="${CAPTURE_ORDER.at(-1)}"`) <
      indexSource.indexOf('src="app/supabase/index.js"')
  );
  assert.doesNotMatch(indexSource, /activity-consumer-harness|test-pwa/);
});

test('T-ACT-R13-03 wires Doctor details lazily and preserves source-safe delete', () => {
  assert.match(doctorSource, /await renderPrimaryDoctorReport\(\);[\s\S]*details\.hidden/);
  assert.match(doctorSource, /activityConsumerView/);
  assert.match(doctorSource, /controller\.setRange\(\{ from, to \}\)/);
  assert.match(doctorSource, /const activityState = await controller\.open\(\)/);
  assert.match(doctorSource, /unit\?\.source !== 'activity_v1'/);
  assert.match(doctorSource, /deleteRemoteByType\(unit\.day, 'activity_event'\)/);
  assert.doesNotMatch(doctorSource, /data-del-activity|loadActivityEventsSafe|resolveActivityRangeLoader/);
  assert.doesNotMatch(doctorSource, /activity_v2[^\n]{0,120}(?:delete|remove|update|insert)/i);
});

test('T-ACT-R13-03 makes the visible download strict V3 with one shared snapshot', () => {
  assert.match(doctorSource, /healthExportV3\.createLoader/);
  assert.match(doctorSource, /activities: \[\]/);
  assert.match(doctorSource, /loadActivitySnapshot: activityAdapter\.loadSnapshot/);
  assert.equal(
    (doctorSource.match(/loadActivitySnapshot: activityAdapter\.loadSnapshot/g) || []).length,
    1
  );
  assert.match(doctorSource, /const payload = await exportLoader\.load/);
  assert.match(doctorSource, /exportLoader\.load[\s\S]*dl\('gesundheitslog\.json'/);
  assert.doesNotMatch(doctorSource, /doctor:export-v2|loadActivities\(/);
  assert.match(doctorSource, /buildHealthExportV2/);
});

test('T-ACT-R14-01 scopes product styles and keeps readers in the v14 shell', () => {
  const selectors = cssSource.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('.activity-consumer-'));
  assert.ok(selectors.length >= 8);
  selectors.forEach((selector) => {
    assert.match(selector, /^#doctor\s/);
  });
  assert.doesNotMatch(indexSource, /activity-consumer-harness\.css/);
  assert.match(serviceWorkerSource, /const CACHE_VERSION = 'v14'/);
  CAPTURE_ORDER.forEach((source) => {
    assert.match(serviceWorkerSource, new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  PRODUCT_ORDER.forEach((source) => {
    assert.match(serviceWorkerSource, new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.match(serviceWorkerSource, /\.filter\(\(key\) => !\[SHELL_CACHE, RUNTIME_CACHE\]\.includes\(key\)\)/);
});
