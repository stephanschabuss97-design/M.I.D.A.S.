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

const productHashes = Object.freeze({
  'index.html': '6cf9cf4e6e1c4c4e7722c568a590541c529d85e2e7dde483cac83f8a1bc3e30b',
  'service-worker.js': 'd02d5510a6ceee8140f1925e6c83630af5b75e35e31851dbc2b7f783a0ed0a8b',
  'public/manifest.json': '57d476c3ba086fb7331a27005ad5a6a73240783e4500eb708235b212aa9ee11f',
  'app/modules/vitals-stack/activity/index.js':
    'f3a4eff3248f2ce3778ec1b99bf902bae58c69892a64864363767d70c944d8d8',
  'app/modules/doctor-stack/doctor/index.js':
    '11200c055e34ef861b0c1d5507f32122b5d445afd7c0499e32571ffbf4fe7dd4',
  'backend/supabase/functions/midas-monthly-report/index.ts':
    '164f64e93ca5db4d3cdd972718908c93be694ce8a69f3e20707cb71ab250ca44'
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

test('T-ACT-R11-09 product load, cache, Doctor and Edge postimages remain exact', () => {
  for (const [relativePath, expectedHash] of Object.entries(productHashes)) {
    assert.equal(sha256(relativePath), expectedHash, relativePath);
  }
  const product = Object.keys(productHashes).map(read).join('\n');
  assert.doesNotMatch(
    product,
    /activity-consumer(?:-data-access|-view)?\.(?:js|ts)|health-export-v3\.js|activity_consumer_snapshot|midas\.activity-consumer\.v1|midas\.health-export\.v3/i
  );
  assert.match(read('service-worker.js'), /const CACHE_VERSION = 'v6'/);
});

test('T-ACT-R11-09 integrated isolation keeps R10 separate and R11 inactive', () => {
  const output = execFileSync(
    process.execPath,
    [path.join(repoRoot, 'tools/activity-v2-r8-isolation.mjs')],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  assert.equal(
    output,
    'PASS protected=10 product_v2_loads=0 core_network_edges=0 ' +
      'r11_product_loads=0 unsafe_diagnostics=0 secret_material=0 test_dml=0 ' +
      'recovery_deletes=0 local_worker_scope=1 r10_negative_oracles=20 ' +
      'r11_isolated=20 r13_read_seam=1 r14_capture_seam=1\n'
  );
});

test('T-ACT-R11-09 R13 owns read activation and R14 alone owns capture cutover', () => {
  const scope = read('docs/Future trainingsmodule update thoughts.md');
  assert.match(scope, /R13 aktiviert die read-only Consumer/);
  assert.match(
    scope,
    /R13 aktiviert ausschließlich read-only Consumer; Activity V1 bleibt dort\s+der einzige produktive Capture-Pfad/
  );
  assert.match(scope, /R14 ist der einzige produktive Writer-Cutover/);
  assert.match(scope, /R14 - Activity V2 Capture Cutover and Android PWA Validation/);
});
