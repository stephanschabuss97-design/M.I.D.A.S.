import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');
const readBytes = (relativePath) => readFileSync(path.join(repoRoot, relativePath));
const count = (source, literal) => source.split(literal).length - 1;
const requireCondition = (condition, code) => {
  if (!condition) throw new Error(`ACTIVITY_V2_C3_TRAINING_${code}`);
};

const index = read('index.html');
const hub = read('app/modules/hub/index.js');
const main = read('assets/js/main.js');
const vitals = read('app/modules/vitals-stack/vitals/index.js');
const profile = read('app/modules/profile/index.js');
const protein = read('app/modules/vitals-stack/protein/index.js');
const appCss = read('app/app.css');
const hubCss = read('app/styles/hub.css');
const worker = read('service-worker.js');

for (const id of [
  'hubTrainingPanel',
  'hubTrainingTitle',
  'trainingDate',
  'activityForm',
  'activitySaveBtn',
  'activityCancelBtn',
  'activityFormStatus'
]) {
  requireCondition(count(index, `id="${id}"`) === 1, `ID_${id.toUpperCase()}`);
}

const vitalsCarousel = index.indexOf('data-carousel-id="vitals"');
const trainingCarousel = index.indexOf('data-carousel-id="training"');
const appointmentsCarousel = index.indexOf('data-carousel-id="appointments"');
requireCondition(
  vitalsCarousel < trainingCarousel && trainingCarousel < appointmentsCarousel,
  'CAROUSEL_ORDER'
);
const vitalsQuickbar = index.indexOf('data-hub-module="vitals"', vitalsCarousel + 1);
const trainingQuickbar = index.indexOf('data-hub-module="training"', trainingCarousel + 1);
const appointmentsQuickbar = index.indexOf('data-hub-module="appointments"', appointmentsCarousel + 1);
requireCondition(
  vitalsQuickbar < trainingQuickbar && trainingQuickbar < appointmentsQuickbar,
  'QUICKBAR_ORDER'
);

requireCondition(index.includes('src="assets/img/Activity_v2.png"'), 'ACTIVITY_ASSET_ROUTE');
requireCondition(index.includes('src="assets/img/Personal_data_v3.png"'), 'PROFILE_ASSET_ROUTE');
requireCondition(!index.includes('data-vitals-tab="activity"'), 'VITALS_ACTIVITY_TAB_REMOVED');
requireCondition(!index.includes('data-vitals-panel="activity"'), 'VITALS_ACTIVITY_PANEL_REMOVED');
requireCondition(!index.includes('data-protein-value='), 'TRAINING_PROTEIN_METRICS_REMOVED');

const trainingPanelStart = index.indexOf('id="hubTrainingPanel"');
const trainingPanelEnd = index.indexOf('</section>', trainingPanelStart);
const trainingPanel = index.slice(trainingPanelStart, trainingPanelEnd);
requireCondition(trainingPanel.includes('id="activityForm"'), 'FORM_IN_TRAINING_PANEL');
requireCondition(trainingPanel.includes('id="trainingDate"'), 'DATE_IN_TRAINING_PANEL');

requireCondition(hub.includes("{ id: 'training', selector: '[data-carousel-id=\"training\"]', panel: 'training' }"), 'HUB_CAROUSEL_MAP');
requireCondition(hub.includes("training: 'training'"), 'HUB_PANEL_MAP');
requireCondition(count(hub, "openPanelHandler('training')") === 1, 'HUB_BUTTON_BINDING');
requireCondition(
  count(index, 'src="app/modules/hub/index.js?v=13"') === 1,
  'HUB_SCRIPT_VERSIONED_LOAD'
);

requireCondition(count(main, "activityForm?.addEventListener('submit'") === 1, 'SUBMIT_LISTENER_COUNT');
requireCondition(count(main, 'activity?.addActivity?.({') === 1, 'V1_WRITER_COUNT');
requireCondition(main.includes("setInputValue('#trainingDate', todayIso)"), 'DATE_INITIALIZATION');
requireCondition(main.includes('day: trainingDayIso'), 'EXPLICIT_TRAINING_DAY');
requireCondition(main.includes('activitySaveInFlight'), 'IN_FLIGHT_GUARD');
requireCondition(main.includes('/^\\d{4}-\\d{2}-\\d{2}$/'), 'STRICT_DATE_SHAPE');
requireCondition(main.includes("toISOString().slice(0, 10) === dayIso"), 'STRICT_CALENDAR_ROUNDTRIP');

for (const obsolete of [
  'activityModifierFor',
  'renderProteinMetrics',
  'fetchLatestWeight',
  'data-protein-value'
]) {
  requireCondition(!vitals.includes(obsolete), `VITALS_OBSOLETE_${obsolete.toUpperCase()}`);
}
requireCondition(!hubCss.includes('.hub-vitals-activity'), 'VITALS_ACTIVITY_CSS_REMOVED');
requireCondition(hubCss.includes('.hub-training .activity-form'), 'TRAINING_FORM_CSS');

for (const id of [
  'hubProteinTargetButton',
  'hubProteinContextDialog',
  'hubProteinContextClose',
  'hubProteinContextStatus',
  'hubProteinContextList'
]) {
  requireCondition(count(index, `id="${id}"`) === 1, `ID_${id.toUpperCase()}`);
}
for (const state of ['loading', 'empty', 'error']) {
  requireCondition(hub.includes(`renderProteinContextState('${state}'`), `DIALOG_STATE_${state.toUpperCase()}`);
}
requireCondition(hub.includes("projection ? 'data' : 'empty'"), 'DIALOG_STATE_DATA');
requireCondition(hub.includes('event.stopImmediatePropagation()'), 'DIALOG_ESCAPE_PRIORITY');
requireCondition(hub.includes("event.key !== 'Tab'"), 'DIALOG_FOCUS_TRAP');
requireCondition(
  hub.includes('!proteinContextDialogState.root?.contains(active)'),
  'DIALOG_FOCUS_RECAPTURE'
);
requireCondition(hub.includes("addEventListener('focusin', handleProteinContextFocusin, true)"), 'DIALOG_FOCUSIN_GUARD');
requireCondition(hub.includes("['click', 'pointerdown', 'pointerup', 'pointercancel']"), 'DIALOG_GESTURE_FENCE');
requireCondition(hub.includes('node.textContent = value'), 'DIALOG_TEXT_CONTENT');
requireCondition(!hub.includes('recomputeTargets'), 'DIALOG_NO_RECOMPUTE');
requireCondition(hubCss.includes('.hub-protein-context-dialog'), 'DIALOG_CSS');
requireCondition(hubCss.includes('grid-template-columns: minmax(0, 1fr)'), 'DIALOG_MOBILE_STACK');

requireCondition(profile.includes('protein_calc_version, protein_window_days'), 'PROFILE_CONTEXT_SELECT');
requireCondition(profile.includes('getSyncStatus: getProfileSyncStatus'), 'PROFILE_SYNC_STATUS');
const readOnlyProteinBlock = protein.slice(
  protein.indexOf('const loadLatestStoredWeight'),
  protein.indexOf('async function ensureAuthenticated')
);
requireCondition(readOnlyProteinBlock.includes("table: 'v_events_body'"), 'LATEST_WEIGHT_SOURCE');
requireCondition(readOnlyProteinBlock.includes("select: 'day,kg'"), 'LATEST_WEIGHT_COLUMNS');
requireCondition(!/\b(?:insert|upsert|update|delete|rpc)\b/i.test(readOnlyProteinBlock), 'PROJECTION_READ_ONLY');
requireCondition(protein.includes('loadStoredContext,'), 'PROJECTION_EXPORT');

requireCondition(worker.includes("const CACHE_VERSION = 'v13'"), 'WORKER_V13');
requireCondition(appCss.includes('@import url("./styles/hub.css?v=11")'), 'HUB_CSS_VERSIONED_IMPORT');
requireCondition(
  count(worker, "toUrl('app/styles/hub.css?v=11')") === 1,
  'WORKER_HUB_CSS_VERSIONED_ASSET'
);
for (const asset of ['assets/img/Activity_v2.png', 'assets/img/Personal_data_v3.png']) {
  requireCondition(count(worker, `toUrl('${asset}')`) === 1, `WORKER_ASSET_${asset.toUpperCase()}`);
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
requireCondition(
  sha256(readBytes('assets/img/Personal_data_v2.png')) ===
    sha256(readBytes('assets/img/Activity_v2.png')),
  'ACTIVITY_ASSET_BYTE_COPY'
);
requireCondition(
  sha256(readBytes('assets/img/Personal_data_v3.png')) ===
    '4ffe900bcdeb7a647f6bc99db847bf3a1a2489d7ab7d4686f8f1cfb94a5b56ae',
  'PROFILE_ASSET_APPROVED_BYTES'
);

for (const forbidden of [
  'activity-session.js',
  'activity-commit.js',
  'activity-history.js',
  'activity-recovery.js',
  'activity-coaching.js'
]) {
  requireCondition(!index.includes(`src="app/modules/vitals-stack/activity/v2/${forbidden}"`), `V2_CAPTURE_${forbidden.toUpperCase()}`);
}

console.log('ACTIVITY_V2_C3_TRAINING_CONTRACT_PASS');
