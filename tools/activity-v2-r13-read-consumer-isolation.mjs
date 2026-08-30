import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');
const fail = (code) => {
  throw new Error(`ACTIVITY_V2_R13_ISOLATION_${code}`);
};
const requireCondition = (condition, code) => {
  if (!condition) fail(code);
};
const count = (source, pattern) => (source.match(pattern) || []).length;
const countLiteral = (source, value) => source.split(value).length - 1;

const config = read('backend/supabase/config.toml');
const functionFlags = [...config.matchAll(
  /\[functions\.([^\]]+)\]\s*\r?\nverify_jwt\s*=\s*(true|false)/g
)].map((match) => ({ name: match[1], value: match[2] === 'true' }));
const falseFunctions = functionFlags
  .filter((entry) => !entry.value)
  .map((entry) => entry.name)
  .sort();
requireCondition(
  JSON.stringify(falseFunctions) === JSON.stringify([
    'midas-protein-targets',
    'midas-trendpilot'
  ]),
  'VERIFY_JWT_FALSE_SCOPE'
);
requireCondition(
  functionFlags.some((entry) => entry.name === 'midas-monthly-report' && entry.value),
  'MONTHLY_VERIFY_JWT_TRUE'
);

const workflowContracts = Object.freeze([
  {
    path: '.github/workflows/protein-targets.yml',
    cron: '0 1 * * 5',
    urlSecret: 'PROTEIN_TARGETS_URL',
    keySecret: 'PROTEIN_TARGETS_SECRET_KEY'
  },
  {
    path: '.github/workflows/trendpilot.yml',
    cron: '0 1 * * 2',
    urlSecret: 'TRENDPILOT_URL',
    keySecret: 'TRENDPILOT_SECRET_KEY'
  }
]);

for (const contract of workflowContracts) {
  const source = read(contract.path);
  requireCondition(source.includes(`cron: "${contract.cron}"`), 'WORKFLOW_CRON');
  requireCondition(/^  workflow_dispatch:\s*$/m.test(source), 'WORKFLOW_DISPATCH');
  requireCondition(!/^\s+inputs:/m.test(source), 'WORKFLOW_INPUT_DRIFT');
  requireCondition(
    source.includes(`secrets.${contract.urlSecret}`) &&
      source.includes(`-H "apikey: \${{ secrets.${contract.keySecret} }}"`),
    'WORKFLOW_SECRET_NAME'
  );
  requireCondition(
    /curl --fail-with-body --silent --show-error -X POST/.test(source),
    'WORKFLOW_HTTP_FAIL'
  );
  requireCondition(
    source.includes(`-d '{"trigger":"scheduler"}'`),
    'WORKFLOW_PAYLOAD'
  );
  requireCondition(
    !/Authorization\s*:|SUPABASE_SERVICE_ROLE_KEY|Bearer\s+/i.test(source),
    'WORKFLOW_LEGACY_AUTH'
  );
  requireCondition(count(source, /-H "apikey:/g) === 1, 'WORKFLOW_APIKEY_COUNT');
  const secretNames = [...source.matchAll(/secrets\.([A-Z0-9_]+)/g)]
    .map((match) => match[1])
    .sort();
  requireCondition(
    JSON.stringify(secretNames) === JSON.stringify([
      contract.keySecret,
      contract.urlSecret
    ].sort()),
    'WORKFLOW_SECRET_SCOPE'
  );
}

const productOrder = Object.freeze([
  'app/modules/vitals-stack/activity/v2/activity-consumer.js',
  'app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js',
  'app/modules/doctor-stack/doctor/activity-consumer-view.js',
  'app/modules/doctor-stack/doctor/health-export-v3.js',
  'app/modules/doctor-stack/reports/index.js',
  'app/modules/doctor-stack/doctor/index.js'
]);
const captureOrder = Object.freeze([
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
const activatedReadPaths = productOrder.slice(0, 4);
const index = read('index.html');
const worker = read('service-worker.js');
const activatedPresence = activatedReadPaths.map((relativePath) => ({
  index: countLiteral(index, `src="${relativePath}"`),
  worker: countLiteral(worker, `toUrl('${relativePath}')`)
}));
const productMode = activatedPresence.every((entry) => entry.index === 0 && entry.worker === 0)
  ? 'legacy'
  : activatedPresence.every((entry) => entry.index === 1 && entry.worker === 1)
    ? 'final'
    : fail('PRODUCT_MIXED_STATE');
let productReadLoads = 0;
let cacheVersion = 6;
if (productMode === 'final') {
  let lastIndexPosition = -1;
  let lastWorkerPosition = -1;
  for (const relativePath of productOrder) {
    const indexPosition = index.indexOf(`src="${relativePath}"`);
    const workerPosition = worker.indexOf(`toUrl('${relativePath}')`);
    requireCondition(indexPosition > lastIndexPosition, 'PRODUCT_SCRIPT_ORDER');
    requireCondition(workerPosition > lastWorkerPosition, 'WORKER_CACHE_ORDER');
    requireCondition(
      countLiteral(index, `src="${relativePath}"`) === 1,
      'PRODUCT_SCRIPT_COUNT'
    );
    requireCondition(
      countLiteral(worker, `toUrl('${relativePath}')`) === 1,
      'WORKER_CACHE_COUNT'
    );
    lastIndexPosition = indexPosition;
    lastWorkerPosition = workerPosition;
  }
  requireCondition(/const CACHE_VERSION = 'v14'/.test(worker), 'WORKER_VERSION');
  productReadLoads = productOrder.length;
  cacheVersion = 14;
} else {
  requireCondition(/const CACHE_VERSION = 'v6'/.test(worker), 'WORKER_VERSION');
}
requireCondition(
  !/src="app\/modules\/vitals-stack\/activity\/index\.js"/.test(index) &&
    !/toUrl\('app\/modules\/vitals-stack\/activity\/index\.js'\)/.test(worker),
  'V1_CAPTURE_LOAD'
);

let lastCaptureIndexPosition = -1;
let lastCaptureWorkerPosition = -1;
for (const relativePath of captureOrder) {
  const indexPosition = index.indexOf(`src="${relativePath}"`);
  const workerPosition = worker.indexOf(`toUrl('${relativePath}')`);
  requireCondition(indexPosition > lastCaptureIndexPosition, 'R14_CAPTURE_SCRIPT_ORDER');
  requireCondition(workerPosition > lastCaptureWorkerPosition, 'R14_CAPTURE_CACHE_ORDER');
  requireCondition(countLiteral(index, `src="${relativePath}"`) === 1, 'R14_CAPTURE_SCRIPT_COUNT');
  requireCondition(countLiteral(worker, `toUrl('${relativePath}')`) === 1, 'R14_CAPTURE_CACHE_COUNT');
  lastCaptureIndexPosition = indexPosition;
  lastCaptureWorkerPosition = workerPosition;
}
requireCondition(
  lastCaptureIndexPosition < index.indexOf('src="app/supabase/index.js"'),
  'R14_CAPTURE_BEFORE_SUPABASE'
);

const captureProductSources = [
  index,
  worker,
  read('public/manifest.json'),
  read('app/modules/vitals-stack/activity/index.js'),
  read('android/app/src/main/AndroidManifest.xml')
].join('\n');
const forbiddenProductLoads = count(
  captureProductSources,
  /activity\/v2\/(?:test-pwa|[^\s"']*harness)|activityv2test|localhost:8765/gi
);
requireCondition(forbiddenProductLoads === 0, 'R14_PRODUCT_LOAD');
requireCondition(
  !/usesCleartextTraffic/.test(read('android/app/src/main/AndroidManifest.xml')),
  'NATIVE_CLEARTEXT'
);

const edgeSources = [
  read('backend/supabase/functions/_shared/activity-edge-principal.ts'),
  read('backend/supabase/functions/_shared/activity-consumer-runtime.ts'),
  read('backend/supabase/functions/midas-monthly-report/index.ts'),
  read('backend/supabase/functions/midas-protein-targets/index.ts'),
  read('backend/supabase/functions/midas-trendpilot/index.ts')
].join('\n');
requireCondition(
  count(edgeSources, /npm:@supabase\/server@1\.4\.1/g) === 1,
  'AUTH_PACKAGE_PIN'
);
requireCondition(
  !/SUPABASE_SERVICE_ROLE_KEY|Authorization Header fehlt|getUserIdFromToken/.test(
    `${read('backend/supabase/functions/midas-protein-targets/index.ts')}\n` +
    read('backend/supabase/functions/midas-trendpilot/index.ts')
  ),
  'LEGACY_HANDLER_AUTH'
);

const sqlForward = read('sql/26_Activity_Consumer_Runtime_Activation.sql');
const explicitGrants = read('sql/16_Explicit_Grants.sql');
const sqlRuntimeSources = [
  sqlForward,
  read('sql/26_Activity_Consumer_Runtime_Activation_Rollback.sql'),
  explicitGrants
].join('\n');
const stripSqlComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/--[^\r\n]*/g, '');
const productiveDmlPattern =
  /\b(?:insert\s+into|update|delete\s+from|truncate(?:\s+table)?|merge\s+into)\s+(?:only\s+)?(?:public\.)?(?:health_events|health_activity_[a-z_]+|range_report(?:_[a-z_]+)?|user_profile|trendpilot_(?:state|events))\b/gi;
requireCondition(
  count(stripSqlComments(sqlRuntimeSources), productiveDmlPattern) === 0,
  'PRODUCTIVE_SQL_DML'
);
requireCondition(count(sqlForward, /\bunion all\b/gi) === 1, 'SQL_UNION_COUNT');
requireCondition(
  /grant\s+select\s+on\s+table\s+public\.trendpilot_state\s+to\s+authenticated,\s*service_role\s*;/i.test(
    explicitGrants
  ) &&
    /grant\s+insert,\s*update,\s*delete\s+on\s+table\s+public\.trendpilot_state\s+to\s+service_role\s*;/i.test(
      explicitGrants
    ) &&
    !/grant\s+(?:select\s*,\s*)?insert[^;]*public\.trendpilot_state[^;]*authenticated/is.test(
      explicitGrants
    ),
  'TREND_STATE_ACL'
);

const secretScanSources = [
  config,
  ...workflowContracts.map((contract) => read(contract.path)),
  edgeSources,
  index,
  worker,
  sqlRuntimeSources
].join('\n');
const secretPatterns = Object.freeze([
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{16,}\b/g,
  /\b(?:ghp_|github_pat_)[A-Za-z0-9_]{16,}\b/g,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/g,
  /https:\/\/(?!example\.)[a-z0-9-]+\.supabase\.co/gi
]);
const secretMaterial = secretPatterns.reduce(
  (total, pattern) => total + count(secretScanSources, pattern),
  0
);
requireCondition(secretMaterial === 0, 'SECRET_MATERIAL');

process.stdout.write(
  'PASS verify_jwt_false=2 monthly_true=1 workflows=2 apikey_only=2 ' +
  `product_mode=${productMode} product_read_loads=${productReadLoads} ` +
  `cache_version=${cacheVersion} r14_capture_loads=${captureOrder.length} ` +
  'secret_material=0 productive_dml=0 sql_union=1 trend_state_acl=select_only ' +
  'v1_capture=0\n'
);
