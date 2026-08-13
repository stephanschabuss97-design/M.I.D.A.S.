'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');
const read = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const historySource = read(
  'app/modules/vitals-stack/activity/v2/session-history.js'
);
const historyShellSource = read(
  'app/modules/vitals-stack/activity/v2/session-history-shell.js'
);
const correctionSource = read(
  'app/modules/vitals-stack/activity/v2/session-correction.js'
);
const canonicalizationSource = read(
  'app/modules/vitals-stack/activity/v2/session-canonicalization.js'
);
const harnessSource = read(
  'app/modules/vitals-stack/activity/v2/session-history-harness.js'
);
const harnessHtml = read(
  'app/modules/vitals-stack/activity/v2/session-history-harness.html'
);
const dataAccessSource = read(
  'app/modules/vitals-stack/activity/v2/data-access.js'
);
const integrationTestSource = read(
  'app/modules/vitals-stack/activity/v2/session-history-integration.contract.test.js'
);
const evidenceSource = read(
  'docs/archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Evidence (DONE).md'
);

test('T-ACT-R9-17 keeps Productload, Activity V1 and R7/R8 state ownership isolated', () => {
  const productSources = [
    'index.html',
    'service-worker.js',
    'public/manifest.json',
    'app/modules/vitals-stack/activity/index.js'
  ].map(read).join('\n');
  const r9Runtime = [
    historySource,
    historyShellSource,
    correctionSource,
    canonicalizationSource
  ].join('\n');

  assert.doesNotMatch(
    productSources,
    /activity\/v2|session-history|session-correction|session-canonicalization/i
  );
  assert.doesNotMatch(
    r9Runtime,
    /commitSession|commitIntent|request_id|request_fingerprint|sessionRecovery|indexedDB/
  );
  assert.match(historySource, /getRecovery/);
  assert.match(historySource, /getSessionCommit/);
  assert.doesNotMatch(
    r9Runtime,
    /\.discard\s*\(|\.prepare\s*\(|\.complete\s*\(/
  );
  assert.match(harnessHtml, /productSentinel/);
  assert.doesNotMatch(harnessHtml, /session-commit|session-recovery/);
});

test('T-ACT-R9-17 keeps legacy child UUIDs outside R9 identity and R8 gaps honest', () => {
  const detailItemStart = dataAccessSource.indexOf(
    'function validateDetailItem(value, expectedOrder)'
  );
  const detailResponseStart = dataAccessSource.indexOf(
    'function validateDetailResponse(value, sessionId)'
  );
  assert.notEqual(detailItemStart, -1);
  assert.ok(detailResponseStart > detailItemStart);
  const detailItemContract = dataAccessSource.slice(
    detailItemStart,
    detailResponseStart
  );

  assert.doesNotMatch(detailItemContract, /['"](?:id|item_id|set_id)['"]/);
  assert.match(
    integrationTestSource,
    /\(\?:id\|session_id\|item_id\|set_id\)/
  );
  assert.match(evidenceSource, /R8-T16\/T19 bleiben/);
  assert.match(evidenceSource, /R8-T16\/T19 nicht als R9-PASS/);
});

test('S4.10 harness exposes the complete deterministic final fixture matrix only locally', () => {
  assert.match(harnessHtml, /MIDAS Activity V2 R9 Block E Harness/);
  assert.match(
    harnessHtml,
    /body\s*\{[\s\S]*?background:\s*#071119/
  );
  assert.match(harnessHtml, /#activity-v2-r9-open-live-shell\s*\{[\s\S]*?display:\s*block/);
  assert.doesNotMatch(harnessHtml, /#activity-v2-r9-open-live-shell\s*\{[\s\S]*?position:\s*fixed/);
  assert.equal(/https?:\/\//i.test(harnessHtml), false);
  assert.equal(/localStorage|sessionStorage|serviceWorker/.test(harnessSource), false);
  [
    'empty',
    'history-error',
    'detail-error',
    'updated',
    'replayed',
    'conflict',
    'unknown-desired',
    'unknown-preimage',
    'unknown-changed',
    'deleted',
    'already-absent',
    'unknown-absent',
    'active-draft',
    'commit-unresolved'
  ].forEach((fixture) => assert.match(harnessSource, new RegExp(fixture)));
  assert.match(harnessSource, /getLastReplaceRequest/);
  assert.match(harnessSource, /getLastDeleteRequest/);
  assert.match(harnessSource, /getProductSentinel/);
  assert.match(harnessSource, /refreshLastPerformance/);
});
