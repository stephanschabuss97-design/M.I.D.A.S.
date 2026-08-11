import { execFileSync } from 'node:child_process';
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
  'index.html',
  'service-worker.js',
  'public/manifest.json',
  'app/modules/vitals-stack/activity/index.js',
  'app/modules/vitals-stack/activity/v2/session-draft.js',
  'android/app/src/main',
  'sql/16_Explicit_Grants.sql'
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

requireCondition(
  git(['diff', '--name-only', 'HEAD', '--', ...protectedPaths]) === '',
  'PROTECTED_DIFF'
);
requireCondition(
  git(['status', '--porcelain=v1', '--untracked-files=all', '--', ...protectedPaths]) === '',
  'PROTECTED_STATUS'
);
git(['diff', '--check']);

const productSources = [
  read('index.html'),
  read('service-worker.js'),
  read('public/manifest.json'),
  read('app/modules/vitals-stack/activity/index.js')
].join('\n');
const productV2Loads = (productSources.match(/activity\/v2|session-commit|test-pwa/gi) || []).length;
requireCondition(productV2Loads === 0, 'PRODUCT_V2_LOAD');

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
const secretPatterns = Object.freeze([
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{16,}\b/g,
  /https:\/\/[a-z0-9-]+\.supabase\.co/gi
]);
const secretMaterial = secretPatterns.reduce(
  (count, pattern) => count + (blockFSources.match(pattern) || []).length,
  0
);
requireCondition(secretMaterial === 0, 'SECRET_MATERIAL');

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
  'PASS protected=7 product_v2_loads=0 core_network_edges=0 ' +
  'unsafe_diagnostics=0 secret_material=0 recovery_deletes=0 local_worker_scope=1\n'
);
