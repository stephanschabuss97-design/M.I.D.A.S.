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
const r10NegativeOracleProtectedPaths = Object.freeze(
  r10NegativeOraclePaths.filter(
    (relativePath) => relativePath !== r10R14ProductloadContractPath
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

requireCondition(
  git(['diff', '--name-only', 'HEAD', '--', ...protectedPaths]) === '',
  'PROTECTED_DIFF'
);
requireCondition(
  git(['status', '--porcelain=v1', '--untracked-files=all', '--', ...protectedPaths]) === '',
  'PROTECTED_STATUS'
);
requireCondition(
  createHash('sha256')
    .update(read(explicitGrantsPath).replace(/\r\n/g, '\n'))
    .digest('hex') ===
    r11ExplicitGrantsSha256,
  'EXPLICIT_GRANTS_SOURCE'
);
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
requireCondition(
  createHash('sha256').update(read(r10R14ProductloadContractPath)).digest('hex') ===
    r10R14ProductloadContractSha256,
  'R10_R14_PRODUCTLOAD_CONTRACT'
);
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
  requireCondition(
    productIndex.split(`src="${relativePath}"`).length - 1 === 1 &&
      productWorker.split(`toUrl('${relativePath}')`).length - 1 === 1,
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
  `r11_isolated=${r11IsolatedPaths.length} r13_read_seam=1 r14_capture_seam=1\n`
);
