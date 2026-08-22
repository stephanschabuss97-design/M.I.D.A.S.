'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '../../../../..');
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const contractSource = read('app/modules/vitals-stack/activity/v2/activity-coaching-export.js');
const fixture = JSON.parse(
  read('app/modules/vitals-stack/activity/v2/activity-coaching-export.fixture.json')
);
const sql24 = read('sql/24_Activity_V2_Coaching_Export.sql');

const EXPECTED = Object.freeze({
  top: ['schema_version', 'generated_at', 'timezone', 'range', 'units', 'completeness', 'quality', 'sessions'],
  range: ['from', 'to', 'inclusive'],
  units: ['session_duration', 'item_duration', 'item_distance', 'set_duration', 'set_distance', 'weight', 'assistance', 'repetitions'],
  completeness: ['status', 'truncated', 'session_count', 'item_count', 'set_count'],
  quality: ['status', 'cautions'],
  session: ['session_id', 'catalog_version', 'revision', 'day', 'started_at', 'ended_at', 'duration_min', 'title', 'note', 'items'],
  item: ['item_key', 'item_order', 'item_label_snapshot', 'tracking_mode_snapshot', 'equipment_snapshot', 'load_comparability_snapshot', 'field_policy_snapshot', 'category', 'muscle_groups', 'sport_tags', 'duration_min', 'distance_km', 'note', 'sets'],
  set: ['set_order', 'tracking_mode', 'reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg']
});

function splitSqlArguments(source, callStart) {
  const open = source.indexOf('(', callStart);
  assert.notEqual(open, -1);
  const args = [];
  let start = open + 1;
  let depth = 1;
  let quoted = false;
  for (let index = open + 1; index < source.length; index += 1) {
    const char = source[index];
    if (char === "'") {
      if (quoted && source[index + 1] === "'") {
        index += 1;
        continue;
      }
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (char === '(') depth += 1;
    if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        args.push(source.slice(start, index).trim());
        return args;
      }
    }
    if (char === ',' && depth === 1) {
      args.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  assert.fail('unterminated jsonb_build_object');
}

function buildKeys(anchor) {
  const anchorIndex = sql24.indexOf(anchor);
  assert.notEqual(anchorIndex, -1, `missing SQL anchor ${anchor}`);
  const callStart = sql24.lastIndexOf('pg_catalog.jsonb_build_object(', anchorIndex);
  assert.notEqual(callStart, -1);
  const args = splitSqlArguments(sql24, callStart);
  assert.equal(args.length % 2, 0);
  return args.filter((_, index) => index % 2 === 0).map((argument) => {
    const match = /^'([^']+)'$/.exec(argument);
    assert.ok(match, `non-literal JSON key: ${argument}`);
    return match[1];
  });
}

function sourceArray(name) {
  const match = new RegExp(
    `const ${name} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\);`
  ).exec(contractSource);
  assert.ok(match, `missing ${name}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

function catalog(source, tag) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`\\$${escaped}\\$(\\[[\\s\\S]*?\\])\\$${escaped}\\$::jsonb`).exec(source);
  assert.ok(match, `missing ${tag}`);
  return JSON.parse(match[1]);
}

function distinct(entries, selector) {
  return [...new Set(entries.flatMap(selector))].sort();
}

test('T-ACT-R10-13 SQL and client JSON field sets stay exactly aligned', () => {
  assert.deepEqual(buildKeys("'schema_version', 'midas.activity-coaching-export.v1'"), EXPECTED.top);
  assert.deepEqual(buildKeys("'from', p_from::text"), EXPECTED.range);
  assert.deepEqual(buildKeys("'session_duration', 'min'"), EXPECTED.units);
  assert.deepEqual(buildKeys("'status', 'complete'"), EXPECTED.completeness);
  assert.deepEqual(buildKeys("'status', case when v_session_count"), EXPECTED.quality);
  assert.deepEqual(buildKeys("'session_id', s.id::text"), EXPECTED.session);
  assert.deepEqual(buildKeys("'item_key', i.item_key"), EXPECTED.item);
  assert.deepEqual(buildKeys("'set_order', st.set_order"), EXPECTED.set);
  assert.deepEqual(sourceArray('TOP_LEVEL_KEYS'), EXPECTED.top);
  assert.deepEqual(sourceArray('RANGE_KEYS'), EXPECTED.range);
  assert.deepEqual(sourceArray('UNIT_KEYS'), EXPECTED.units);
  assert.deepEqual(sourceArray('COMPLETENESS_KEYS'), EXPECTED.completeness);
  assert.deepEqual(sourceArray('QUALITY_KEYS'), EXPECTED.quality);
  assert.deepEqual(sourceArray('SESSION_KEYS'), EXPECTED.session);
  assert.deepEqual(sourceArray('ITEM_KEYS'), EXPECTED.item);
  assert.deepEqual(sourceArray('SET_KEYS'), EXPECTED.set);
});

test('T-ACT-R10-13 all R1/C2 catalog enums remain inside the frozen client vocabulary', () => {
  const entries = [
    ...catalog(read('sql/20_Activity_V2.sql'), 'activity_catalog'),
    ...catalog(read('sql/21_Activity_V2_Catalog_V2.sql'), 'activity_catalog_v2')
  ];
  const checks = [
    ['TRACKING_MODES', (entry) => [entry.tracking_mode]],
    ['EQUIPMENT', (entry) => [entry.equipment]],
    ['LOAD_COMPARABILITY', (entry) => [entry.load_comparability]],
    ['CATEGORIES', (entry) => [entry.category]],
    ['MUSCLE_GROUPS', (entry) => entry.muscle_groups],
    ['SPORT_TAGS', (entry) => entry.sport_tags],
    ['POLICY_VALUES', (entry) => Object.values(entry.fields)]
  ];
  for (const [name, selector] of checks) {
    const allowed = sourceArray(name);
    const used = distinct(entries, selector);
    assert.deepEqual(used.filter((value) => !allowed.includes(value)), [], name);
  }
});

test('T-ACT-R10-13 SQL export stays read-only, owner-filtered and independent of R9 history RPCs', () => {
  const functionBody = sql24.slice(
    sql24.indexOf('create or replace function public.activity_v2_coaching_export'),
    sql24.indexOf('$function$;', sql24.indexOf('create or replace function public.activity_v2_coaching_export'))
  );
  assert.doesNotMatch(functionBody, /activity_v2_(?:list_sessions|session_detail)\s*\(/i);
  assert.doesNotMatch(functionBody, /\b(?:insert\s+into|update\s+public\.|delete\s+from|merge\s+into)\b/i);
  assert.equal((functionBody.match(/s\.user_id = v_user/g) || []).length >= 2, true);
  assert.equal((functionBody.match(/i\.user_id = v_user/g) || []).length >= 2, true);
  assert.equal((functionBody.match(/st\.user_id = v_user/g) || []).length >= 2, true);
});

test('T-ACT-R10-14 realistic fixture is contract-valid and answers consumer questions deterministically', () => {
  const context = vm.createContext({ AppModules: {}, Intl, Date, console });
  new vm.Script(contractSource).runInContext(context);
  const value = context.AppModules.activityV2.coachingExport.validateExport(fixture);
  const items = value.sessions.flatMap((session) => session.items);
  const sets = items.flatMap((item) => item.sets);
  const answers = {
    sessions: value.sessions.length,
    items: items.length,
    sets: sets.length,
    catalog_versions: [...new Set(value.sessions.map((session) => session.catalog_version))],
    total_session_duration_min: value.sessions.reduce((sum, session) => sum + session.duration_min, 0),
    recorded_item_distance_km: items.reduce((sum, item) => sum + (item.distance_km || 0), 0),
    device_relative_item_keys: items.filter((item) => item.load_comparability_snapshot === 'device_relative').map((item) => item.item_key),
    assistance_set_count: sets.filter((set) => set.assistance_kg !== null).length,
    corrected_session_ids: value.sessions.filter((session) => session.revision !== '1').map((session) => session.session_id),
    cautions: value.quality.cautions
  };
  assert.deepEqual(JSON.parse(JSON.stringify(answers)), {
    sessions: 2,
    items: 3,
    sets: 1,
    catalog_versions: [1, 2],
    total_session_duration_min: 120,
    recorded_item_distance_km: 20.25,
    device_relative_item_keys: ['lat_pulldown'],
    assistance_set_count: 1,
    corrected_session_ids: ['00000000-0000-4000-8000-000000000002'],
    cautions: ['assistance_loads_present', 'device_relative_loads_present', 'multiple_catalog_versions_present']
  });
});

test('T-ACT-R10-14 product, medical and adjacent consumers contain no R10 load edge', () => {
  const paths = [
    'index.html',
    'service-worker.js',
    'app/modules/vitals-stack/activity/index.js',
    'app/modules/doctor-stack/doctor/index.js',
    'app/modules/doctor-stack/reports/index.js',
    'app/modules/vitals-stack/protein/index.js',
    'app/modules/vitals-stack/trendpilot/index.js',
    'app/supabase/api/reports.js',
    'app/supabase/api/trendpilot.js',
    'app/supabase/api/vitals.js'
  ];
  const sources = paths.map(read).join('\n');
  assert.doesNotMatch(sources, /activity-coaching-export|coachingExport|loadCoachingExport/);
});
