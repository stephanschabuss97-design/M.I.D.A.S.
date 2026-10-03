import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');
const fail = (code) => {
  throw new Error(`ACTIVITY_V2_R8_ISOLATION_${code}`);
};
const requireCondition = (condition, code) => {
  if (!condition) fail(code);
};
const git = (args) => execFileSync('git', args, {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();
const c4Mode = process.argv.slice(2).length === 1 && process.argv[2] === '--c4';
requireCondition(process.argv.length === 2 || c4Mode, 'UNKNOWN_MODE');
// C4 may change these exact reviewed postimages. Every other negative
// consumer remains protected; the original R14 mode keeps its old boundary.
const c4SourceHashes = Object.freeze({
  'app/modules/vitals-stack/activity/v2/session-draft.js':
    'f685329d646c4310ef6a0c7251fa4b9625674595e3977c888b29de6da9daa144',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.js':
    'df4870bfe6e50c73abc5804ca5dd295abaad8c401b1658ba0fcc6af506001c4c',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.contract.test.js':
    'fe6df0f7237468287d2f11a454d08ff7a74623215dd7fbbdd2643dae8b43a99a',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.fixture.json':
    '47cbd5df9b1d0fc05f7100233e5aa386b09f0577aed3faf0ae34ff0b096fb35e',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-controller.js':
    '1684c793f531ac01b8ac04f859cc35dd27d90dc0a4cd43ed117fa0eafc97e9b8',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-controller.contract.test.js':
    'f824d71325784e12f3140c4757c9667d22b60eceb868a7f469e38b8a0144baaa',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-data-access.contract.test.js':
    '21c82e310103e4426c1afff7cc187bfcdb3938d9a0e3214d72ce8ab9e92ba031',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.js':
    '052dd34a5d23e5d87816aa724064964a35f8eb4919f32b099de8849eec74b6db',
  'app/modules/vitals-stack/protein/index.js':
    '3b9e179c4c1f8f2730e8fb3a4f3026b74bc8a9f9e9d4047e8153e0a1ce26e18b',
  'app/modules/vitals-stack/protein/activity-refresh.contract.test.js':
    '7aa9bf0ce5a8942be5c9f1d48bd6892fc71ebdf703c54288c4982453e2d5e867'
});
const sourceHash = (relativePath) => createHash('sha256')
  .update(read(relativePath).replace(/\r\n/g, '\n')).digest('hex');
const assertProtectedChanges = (paths, code) => {
  const tracked = git(['diff', '--name-only', 'HEAD', '--', ...paths]);
  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', ...paths]);
  const changed = [tracked, untracked].filter(Boolean).flatMap((value) => value.split('\n'));
  requireCondition(changed.every((relativePath) =>
    Object.hasOwn(c4SourceHashes, relativePath) &&
    sourceHash(relativePath) === c4SourceHashes[relativePath]), code);
};

const protectedPaths = Object.freeze([
  'public/manifest.json',
  'app/modules/vitals-stack/activity/index.js',
  'app/modules/vitals-stack/activity/v2/session-draft.js',
  'android/app/src/main',
  'app/modules/doctor-stack/doctor/index.js',
  'app/modules/doctor-stack/reports/index.js',
  'backend/supabase/functions/midas-monthly-report/index.ts'
]);
const explicitGrantsPath = 'sql/16_Explicit_Grants.sql';
const r11ExplicitGrantsSha256 =
  'fd173a3b2437f5899398630c9b7663ab05c558413a07f111ac656496e7a88538';
const protectedTargetCount = protectedPaths.length + 1;
const r10NegativeOraclePaths = Object.freeze([
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.contract.test.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.fixture.json',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-browser.smoke.spec.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-controller.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-controller.contract.test.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-data-access.contract.test.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-harness.html',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-harness.js',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.css',
  'app/modules/vitals-stack/activity/v2/activity-coaching-export-shell.js',
  'app/modules/vitals-stack/protein',
  'app/modules/vitals-stack/trendpilot',
  'app/supabase/api/reports.js',
  'app/supabase/api/trendpilot.js',
  'app/supabase/api/vitals.js',
  'sql/24_Activity_V2_Coaching_Export.sql',
  'sql/24_Activity_V2_Coaching_Export_Rollback.sql',
  'sql/tests/24_Activity_V2_Coaching_Export_fixture.sql'
]);
const r10R14ProductloadContractPath =
  'app/modules/vitals-stack/activity/v2/activity-coaching-export.contract.test.js';
const r10R14ProductloadContractSha256 =
  'e6d62f15d7e1b783214246761d6448c3f2b1deb0e6dadf8d39fe1f6ebed44f2a';
const r14SupabaseReleaseHashes = Object.freeze({
  'app/supabase/api/reports.js':
    '58f2cecdaa360222c64817f90d159569b654ebda1d87a1e76c6df6f294f4ee4c',
  'app/supabase/api/trendpilot.js':
    'dd434c3222472738984c67b0a2551011b18263b47d86e54b9dcd0d0810b37cfa',
  'app/supabase/api/vitals.js':
    '6bd3ca31f0b4abfee4639e9a984f1f307bc6c7f0fbc021e5e28d469eab177c1f'
});
// C4 starts from the documented ddbcf4c baseline, after the September auth
// recovery fix. These readers are unchanged by C4; normalize checkout EOLs.
const c4SupabaseBaselineHashes = Object.freeze({
  'app/supabase/api/reports.js':
    '271eebd5b96d0ee5ae77e8ecc7a54b06bc2daab24402af7577da8e3b990a67d9',
  'app/supabase/api/trendpilot.js':
    '6f5835146ef071dfe70d1fc79524fcba1fbf1fb732547ee56871eee9c39de31b',
  'app/supabase/api/vitals.js':
    '5647ec62781299d10ab47f6adb45e21d82c3eddc3f0ca727b4487f1182f4238f'
});
const r10NegativeOracleProtectedPaths = Object.freeze(
  r10NegativeOraclePaths.filter(
    (relativePath) =>
      relativePath !== r10R14ProductloadContractPath &&
      !Object.hasOwn(r14SupabaseReleaseHashes, relativePath)
  )
);
const r11IsolatedPaths = Object.freeze([
  'app/modules/vitals-stack/activity/v2/activity-consumer.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer.contract.test.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer.fixture.json',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.contract.test.js',
  'app/modules/doctor-stack/doctor/activity-consumer-view.js',
  'app/modules/doctor-stack/doctor/activity-consumer-view.contract.test.js',
  'app/modules/doctor-stack/doctor/activity-consumer-harness.html',
  'app/modules/doctor-stack/doctor/activity-consumer-harness.js',
  'app/modules/doctor-stack/doctor/activity-consumer-harness.css',
  'app/modules/doctor-stack/doctor/activity-consumer-browser.smoke.spec.js',
  'app/modules/doctor-stack/doctor/health-export-v3.js',
  'app/modules/doctor-stack/doctor/health-export-v3.contract.test.js',
  'backend/supabase/functions/midas-monthly-report/activity-consumer.ts',
  'backend/supabase/functions/midas-monthly-report/activity-consumer_test.ts',
  'backend/supabase/functions/midas-monthly-report/activity-report.ts',
  'backend/supabase/functions/midas-monthly-report/activity-report_test.ts',
  'sql/25_Activity_Consumer_Compatibility.sql',
  'sql/25_Activity_Consumer_Compatibility_Rollback.sql',
  'sql/tests/25_Activity_Consumer_Compatibility_fixture.sql'
]);
const r11TestPaths = Object.freeze([
  'app/modules/vitals-stack/activity/v2/activity-consumer.contract.test.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.contract.test.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer-final.contract.test.js',
  'app/modules/doctor-stack/doctor/activity-consumer-view.contract.test.js',
  'app/modules/doctor-stack/doctor/activity-consumer-browser.smoke.spec.js',
  'app/modules/doctor-stack/doctor/health-export-v3.contract.test.js',
  'backend/supabase/functions/midas-monthly-report/activity-consumer_test.ts',
  'backend/supabase/functions/midas-monthly-report/activity-report_test.ts',
  'sql/tests/25_Activity_Consumer_Compatibility_fixture.sql'
]);
const blockFPaths = Object.freeze([
  'android/app/build.gradle.kts',
  'android/app/src/debug/AndroidManifest.xml',
  'android/app/src/debug/res/values/strings.xml',
  'app/modules/vitals-stack/activity/v2/local-test-pwa.contract.test.js',
  'app/modules/vitals-stack/activity/v2/isolation.contract.test.js',
  'app/modules/vitals-stack/activity/v2/test-pwa/index.html',
  'app/modules/vitals-stack/activity/v2/test-pwa/local-test-pwa.js',
  'app/modules/vitals-stack/activity/v2/test-pwa/service-worker.js',
  'app/modules/vitals-stack/activity/v2/test-pwa/manifest.webmanifest'
]);
const coreRuntimePaths = Object.freeze([
  'app/modules/vitals-stack/activity/v2/session-commit.js',
  'app/modules/vitals-stack/activity/v2/session-recovery.js',
  'app/modules/vitals-stack/activity/v2/session-shell.js',
  'app/modules/vitals-stack/activity/v2/session-commit-harness-adapter.js',
  'app/modules/vitals-stack/activity/v2/session-commit-harness.js'
]);
const r14CapturePaths = Object.freeze([
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
]);
const r13ProductReaderPaths = Object.freeze([
  'app/modules/vitals-stack/activity/v2/activity-consumer.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js',
  'app/modules/doctor-stack/doctor/activity-consumer-view.js',
  'app/modules/doctor-stack/doctor/health-export-v3.js'
]);

if (c4Mode) {
  assertProtectedChanges(protectedPaths, 'C4_PROTECTED_DIFF');
  for (const [relativePath, expectedHash] of Object.entries(c4SourceHashes)) {
    requireCondition(sourceHash(relativePath) === expectedHash, 'C4_SOURCE_DRIFT');
  }
} else {
  requireCondition(
    git(['diff', '--name-only', 'HEAD', '--', ...protectedPaths]) === '',
    'PROTECTED_DIFF'
  );
  requireCondition(
    git(['status', '--porcelain=v1', '--untracked-files=all', '--', ...protectedPaths]) === '',
    'PROTECTED_STATUS'
  );
}
requireCondition(
  createHash('sha256')
    .update(read(explicitGrantsPath).replace(/\r\n/g, '\n'))
    .digest('hex') ===
    r11ExplicitGrantsSha256,
  'EXPLICIT_GRANTS_SOURCE'
);
if (c4Mode) {
  assertProtectedChanges(r10NegativeOracleProtectedPaths, 'C4_NEGATIVE_ORACLE_DIFF');
} else {
  requireCondition(
    git(['diff', '--name-only', 'HEAD', '--', ...r10NegativeOracleProtectedPaths]) === '',
    'R10_NEGATIVE_ORACLE_DIFF'
  );
  requireCondition(
    git([
      'status', '--porcelain=v1', '--untracked-files=all', '--',
      ...r10NegativeOracleProtectedPaths
    ]) === '',
    'R10_NEGATIVE_ORACLE_STATUS'
  );
}
requireCondition(
  (c4Mode ? sourceHash(r10R14ProductloadContractPath) :
    createHash('sha256').update(read(r10R14ProductloadContractPath)).digest('hex')) ===
    (c4Mode ? c4SourceHashes[r10R14ProductloadContractPath] : r10R14ProductloadContractSha256),
  'R10_R14_PRODUCTLOAD_CONTRACT'
);
for (const [relativePath, expectedHash] of Object.entries(
  c4Mode ? c4SupabaseBaselineHashes : r14SupabaseReleaseHashes
)) {
  requireCondition(
    createHash('sha256').update(c4Mode
      ? read(relativePath).replace(/\r\n/g, '\n') : read(relativePath)).digest('hex') === expectedHash,
    'R14_SUPABASE_RELEASE_CONTRACT'
  );
}
git(['diff', '--check']);

requireCondition(
  r11IsolatedPaths.every((relativePath) => read(relativePath).length > 0),
  'R11_OUTPUT_MISSING'
);

const productSources = [
  read('index.html'),
  read('service-worker.js'),
  read('public/manifest.json'),
  read('app/modules/vitals-stack/activity/index.js'),
  read('app/modules/doctor-stack/doctor/index.js'),
  read('app/modules/doctor-stack/reports/index.js'),
  read('backend/supabase/functions/midas-monthly-report/index.ts')
].join('\n');
const productIndex = read('index.html');
const productWorker = read('service-worker.js');
for (const relativePath of r14CapturePaths) {
  const matches = [...productIndex.matchAll(new RegExp(
    `src="${relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?v=(\\d+)"`, 'g'
  ))];
  const version = c4Mode && matches.length === 1 ? matches[0][1] : '24';
  requireCondition(
    (!c4Mode || matches.length === 1) &&
    productIndex.split(`src="${relativePath}?v=${version}"`).length - 1 === 1 &&
      productWorker.split(`toUrl('${relativePath}?v=${version}')`).length - 1 === 1,
    'PRODUCT_V2_LOAD'
  );
}
const productV2Loads = r14CapturePaths.length;
requireCondition(
  !/activity-coaching-export|coachingExport|loadCoachingExport/.test([
    read('app/modules/vitals-stack/activity/index.js'),
    read('app/modules/doctor-stack/doctor/index.js'),
    read('app/modules/doctor-stack/reports/index.js'),
    read('backend/supabase/functions/midas-monthly-report/index.ts')
  ].join('\n')),
  'PRODUCT_R10_LOAD'
);
for (const relativePath of r13ProductReaderPaths) {
  requireCondition(
    productIndex.split(`src="${relativePath}"`).length - 1 === 1 &&
      productWorker.split(`toUrl('${relativePath}')`).length - 1 === 1,
    'PRODUCT_R11_LOAD'
  );
}
const r11ProductLoads = r13ProductReaderPaths.length;

const coreRuntime = coreRuntimePaths.map(read).join('\n');
const coreNetworkEdges = (
  coreRuntime.match(/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|supabase\.co/gi) || []
).length;
requireCondition(coreNetworkEdges === 0, 'CORE_NETWORK_EDGE');
requireCondition(!/console\.(?:debug|info|log|warn|error)\s*\(/.test(coreRuntime), 'CORE_CONSOLE');

const dataAccess = read('app/modules/vitals-stack/activity/v2/data-access.js');
const unsafeDiagnostics = (
  dataAccess.match(/detail=|diagnosticText\s*\(|JSON\.stringify\([^)]*(?:intent|payload)[^)]*\)[^\n]*(?:log|diag|error)/gi) || []
).length;
requireCondition(unsafeDiagnostics === 0, 'UNSAFE_DIAGNOSTIC');
requireCondition(
  /failed code=\$\{code\} status=\$\{safeStatus\}/.test(dataAccess),
  'SAFE_DIAGNOSTIC_MISSING'
);

const blockFSources = blockFPaths.map(read).join('\n');
const r11Sources = r11IsolatedPaths.map(read).join('\n');
const secretPatterns = Object.freeze([
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{16,}\b/g,
  /https:\/\/(?!example\.)[a-z0-9-]+\.supabase\.co/gi
]);
const secretMaterial = secretPatterns.reduce(
  (count, pattern) =>
    count + (`${blockFSources}\n${r11Sources}`.match(pattern) || []).length,
  0
);
requireCondition(secretMaterial === 0, 'SECRET_MATERIAL');

const r11TestSources = r11TestPaths.map(read).join('\n');
const testDmlPattern =
  /\b(?:insert\s+into|delete\s+from|merge\s+into|update|truncate(?:\s+table)?)\s+(?:only\s+)?(?:public\.)?(?:health_events|health_activity_[a-z_]+|range_report(?:_[a-z_]+)?)\b/gi;
const matchesTestDml = (source) => {
  testDmlPattern.lastIndex = 0;
  return testDmlPattern.test(source);
};
requireCondition(
  [
    'insert into public.health_events',
    'delete from only public.health_activity_sessions',
    'merge into public.health_activity_session_items',
    'update public.range_report',
    'truncate table public.range_report_archive'
  ].every(matchesTestDml),
  'R11_TEST_DML_ORACLE'
);
testDmlPattern.lastIndex = 0;
const testDml = (r11TestSources.match(testDmlPattern) || []).length;
requireCondition(testDml === 0, 'R11_TEST_DML');

const scopeSource = [
  read('docs/Future trainingsmodule update thoughts.md'),
  read('docs/modules/Activity Module Overview.md')
].join('\n');
const r13ReadSeam =
  /R13 (?:hat|aktiviert)[^\n]*read-only Consumer/.test(scopeSource) &&
  /R13 aktiviert die bewiesenen read-only Consumer zunächst bei weiterhin\s+produktiver Activity-V1-Erfassung/.test(scopeSource) &&
  /R13 aktiviert ausschließlich read-only Consumer; Activity V1 bleibt dort\s+der einzige produktive Capture-Pfad/.test(scopeSource);
const r14CaptureSeam =
  /R14 (?:ist|bleibt)[^\n]*einzige[^\n]*(?:Writer-Cutover|Activity-V2-Writer-Cutover)/.test(scopeSource) &&
  /R14[^\n]*Activity-V2-Capture/.test(scopeSource);
requireCondition(r13ReadSeam, 'R13_READ_SEAM');
requireCondition(r14CaptureSeam, 'R14_CAPTURE_SEAM');

const recoveryDeletes = (
  `${coreRuntime}\n${blockFSources}`.match(
    /indexedDB\.deleteDatabase|objectStore\s*\.\s*delete\s*\(|session_recovery[^\n]*\.delete\s*\(/gi
  ) || []
).length;
requireCondition(recoveryDeletes === 0, 'RECOVERY_DELETE');

const gradle = read('android/app/build.gradle.kts');
const debugManifest = read('android/app/src/debug/AndroidManifest.xml');
const debugStrings = read('android/app/src/debug/res/values/strings.xml');
requireCondition(/applicationId = "de\.schabuss\.midas"/.test(gradle), 'BASE_APP_ID');
requireCondition(/applicationIdSuffix = "\.activityv2test"/.test(gradle), 'DEBUG_APP_ID');
requireCondition(/usesCleartextTraffic="true"/.test(debugManifest), 'DEBUG_CLEARTEXT');
requireCondition(/http:\/\/localhost:8765\/app\/modules\/vitals-stack\/activity\/v2\/test-pwa\//.test(debugStrings), 'DEBUG_URL');

const localRuntime = read('app/modules/vitals-stack/activity/v2/test-pwa/local-test-pwa.js');
const localWorker = read('app/modules/vitals-stack/activity/v2/test-pwa/service-worker.js');
requireCondition(/allowedHosts = Object\.freeze/.test(localRuntime), 'LOCAL_HOST_GATE');
requireCondition(/await waitForLocalController\(\)/.test(localRuntime), 'LOCAL_CONTROLLER_GATE');
requireCondition(/midas-activity-v2-r8-local-test-/.test(localWorker), 'LOCAL_WORKER_SCOPE');
requireCondition(!/public\/manifest\.json|midas-shell-|\/M\.I\.D\.A\.S\.\//.test(localWorker), 'LOCAL_WORKER_PRODUCT_EDGE');

process.stdout.write(
  `PASS protected=${protectedTargetCount} product_v2_loads=${productV2Loads} core_network_edges=0 ` +
  `r11_product_loads=${r11ProductLoads} unsafe_diagnostics=0 secret_material=0 test_dml=0 ` +
  'recovery_deletes=0 local_worker_scope=1 ' +
  `r10_negative_oracles=${r10NegativeOraclePaths.length} ` +
  `r11_isolated=${r11IsolatedPaths.length} r13_read_seam=1 r14_capture_seam=1` +
  (c4Mode ? ' c4_contract=1\n' : '\n')
);
