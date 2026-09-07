'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = __dirname;
const html = fs.readFileSync(
  path.join(base, 'activity-product-last-mile-harness.html'),
  'utf8'
);
const script = fs.readFileSync(
  path.join(base, 'activity-product-last-mile-harness.js'),
  'utf8'
);
const index = fs.readFileSync(path.resolve(base, '../../../../..', 'index.html'), 'utf8');
const serviceWorker = fs.readFileSync(
  path.resolve(base, '../../../../..', 'service-worker.js'),
  'utf8'
);

test('R14 Last-Mile harness loads the real product composition in product order', () => {
  const expected = [
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
    'activity-product-controller.js',
    'activity-product-last-mile-harness.js'
  ];
  let previous = -1;
  expected.forEach((name) => {
    const offset = html.indexOf(`./${name}`);
    assert.ok(offset > previous, `${name} must follow the real product order`);
    previous = offset;
  });
  const productSurfaceEnd = html.indexOf('</section>', html.indexOf('transformed-product-surface'));
  assert.ok(html.indexOf('id="activity-v2-product-host"') < productSurfaceEnd);
  assert.ok(html.indexOf('id="activity-v2-session-host"') > productSurfaceEnd);
  assert.ok(html.indexOf('id="activity-v2-history-host"') > productSurfaceEnd);
  assert.ok(html.indexOf('id="activity-v2-export-host"') > productSurfaceEnd);
});

test('R14 Last-Mile harness crosses click, commit, recovery, semantics and Data Access', () => {
  [
    "markers.add('click_received')",
    "markers.add('action_resolved')",
    "markers.add('finish_invoked')",
    "markers.add('preparing_published')",
    "markers.add('recovery_flushed')",
    "markers.add('intent_created')",
    "markers.add('transport_attempted')",
    'activityV2.productController.mount',
    'activityV2.dataAccess',
    "mode === 'unknown'",
    'requestBodies[0] !== requestBodies[1]',
    "mode === 'recovery' && phase === 'resume' ? 100 : 1",
    "markers.add('reauth_surface_preserved')",
    "fail('reauth changed the active session surface')"
  ].forEach((token) => assert.ok(script.includes(token), `missing ${token}`));
});

test('R14 Last-Mile harness preflights aged drafts through the real composition without transport', () => {
  assert.match(script, /mode === 'aged'/);
  assert.match(script, /controller\.preflightSessionCommit\(\)/);
  assert.match(script, /preflight\?\.reason !== 'INVALID_TIME'/);
  assert.match(script, /preflight\?\.focus_target\?\.field_key !== 'duration_min'/);
  assert.match(script, /requestBodies\.length !== 0/);
});

test('R14 Last-Mile harness is local-only and exposes no sensitive diagnostic values', () => {
  const fileName = 'activity-product-last-mile-harness';
  assert.equal(index.includes(fileName), false);
  assert.equal(serviceWorker.includes(fileName), false);
  assert.equal(/console\.(?:log|info|warn|error)|localStorage|sessionStorage/.test(script), false);
  assert.equal(/textContent\s*=.*(?:requestBodies|p_request_id|p_payload)/.test(script), false);
});
