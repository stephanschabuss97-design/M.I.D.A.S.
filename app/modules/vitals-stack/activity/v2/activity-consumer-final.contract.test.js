'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../../../../..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const sha256 = (relativePath) => createHash('sha256')
  .update(fs.readFileSync(path.join(repoRoot, relativePath)))
  .digest('hex');

const readerHashes = Object.freeze({
  'public/manifest.json': '57d476c3ba086fb7331a27005ad5a6a73240783e4500eb708235b212aa9ee11f',
  'app/modules/vitals-stack/activity/index.js':
    'f3a4eff3248f2ce3778ec1b99bf902bae58c69892a64864363767d70c944d8d8',
  'app/modules/vitals-stack/activity/v2/activity-consumer.js':
    'f30fa02ae6ee10ce0e45df6b19314b8bf669e596599612dffbc326717dae5bc0',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js':
    '0bacdccb96c8471dfa165ebed306d69cc08608020fdc7335fb2395e310fa5791',
  'app/modules/doctor-stack/doctor/activity-consumer-view.js':
    '6a7b9126a52c3958acd703eca2fc6c7a5eb546bd6304abd414235ad22dad020f',
  'app/modules/doctor-stack/doctor/health-export-v3.js':
    '538a9db15687e8aff87880631ca6a57865d869290ffee5112635ee94853e1106',
  'app/modules/doctor-stack/doctor/index.js':
    '3505237e84f22f24b787c621213dbe7776fa163d069b7c4bc3bd79e01784616e',
  'backend/supabase/functions/midas-monthly-report/index.ts':
    'e7bf04bb10682c55a87b992a22402e7003de5d88d7febdf678a74878440108b8'
});

test('T-ACT-R11-09 SQL 16 mirrors only the exact canonical SQL 25 postimage', () => {
  const grants = read('sql/16_Explicit_Grants.sql');
  const sql25 = read('sql/25_Activity_Consumer_Compatibility.sql');
  const start = grants.indexOf('do $activity_v2_r11_grants$');
  const end = grants.indexOf('$activity_v2_r11_grants$;', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const block = grants.slice(start, end);

  assert.equal((grants.match(/do \$activity_v2_r11_grants\$/g) || []).length, 1);
  assert.match(block, /to_regprocedure\(\s*'public\.activity_consumer_snapshot\(date,date\)'/);
  assert.match(block, /v_public_count = 0 and v_snapshot_oid is null/);
  assert.match(block, /v_public_count <> 1 or v_snapshot_oid is null/);
  assert.match(block, /f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d/);
  assert.match(block, /rolname = 'postgres'/);
  assert.match(block, /p\.prorettype = 'jsonb'::pg_catalog\.regtype/);
  assert.match(block, /not p\.prosecdef/);
  assert.match(block, /p\.provolatile = 's'/);
  assert.match(block, /p\.proconfig = array\['search_path=""'\]::text\[\]/);
  assert.match(block, /explicit-grant target ACL drift/);
  assert.match(
    block,
    /\[\["authenticated","postgres","EXECUTE",false\],\["postgres","postgres","EXECUTE",false\]\]/
  );
  assert.match(block, /has_function_privilege\(\s*'anon'/);
  assert.match(block, /has_function_privilege\(\s*'service_role'/);
  assert.match(block, /revoke all on function public\.activity_consumer_snapshot\(date, date\)/);
  assert.match(block, /grant execute on function public\.activity_consumer_snapshot\(date, date\)\s+to authenticated/);
  assert.doesNotMatch(block, /create\s+(?:or\s+replace\s+)?function|drop\s+function/i);
  assert.match(sql25, /f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d/);
  assert.equal(
    sha256('sql/25_Activity_Consumer_Compatibility.sql'),
    '77be7b9fb633d324a9f51f11640b015fcc54bea7e50dcf5392dc22ea424bc572'
  );
});

test('T-ACT-R14-04 keeps R13 readers, Doctor, Edge and the V1 rollback source exact', () => {
  for (const [relativePath, expectedHash] of Object.entries(readerHashes)) {
    assert.equal(sha256(relativePath), expectedHash, relativePath);
  }
  const indexSource = read('index.html');
  const workerSource = read('service-worker.js');
  for (const relativePath of [
    'app/modules/vitals-stack/activity/v2/activity-consumer.js',
    'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js',
    'app/modules/doctor-stack/doctor/activity-consumer-view.js',
    'app/modules/doctor-stack/doctor/health-export-v3.js'
  ]) {
    assert.equal(indexSource.split(`src="${relativePath}"`).length - 1, 1);
    assert.equal(workerSource.split(`toUrl('${relativePath}')`).length - 1, 1);
  }
  assert.doesNotMatch(indexSource, /src="app\/modules\/vitals-stack\/activity\/index\.js"/);
  assert.match(workerSource, /const CACHE_VERSION = 'v14'/);
});

test('T-ACT-R14-04 integrated isolation activates only the planned R14/R13 product loads', () => {
  const output = execFileSync(
    process.execPath,
    [path.join(repoRoot, 'tools/activity-v2-r8-isolation.mjs')],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  assert.equal(
    output,
    'PASS protected=8 product_v2_loads=15 core_network_edges=0 ' +
      'r11_product_loads=4 unsafe_diagnostics=0 secret_material=0 test_dml=0 ' +
      'recovery_deletes=0 local_worker_scope=1 r10_negative_oracles=19 ' +
      'r11_isolated=20 r13_read_seam=1 r14_capture_seam=1\n'
  );
});

test('T-ACT-R11-09 R13 owns read activation and R14 alone owns capture cutover', () => {
  const scope = read('docs/Future trainingsmodule update thoughts.md');
  assert.match(scope, /R13 (?:hat|aktiviert)[^\n]*read-only Consumer/);
  assert.match(
    scope,
    /R13 aktiviert ausschließlich read-only Consumer; Activity V1 bleibt dort\s+der einzige produktive Capture-Pfad/
  );
  assert.match(scope, /R14 (?:ist|bleibt)[^\n]*einzige[^\n]*(?:Writer-Cutover|Activity-V2-Writer-Cutover)/);
  assert.match(scope, /R14 - Activity V2 Capture Cutover and Android PWA Validation/);
});
