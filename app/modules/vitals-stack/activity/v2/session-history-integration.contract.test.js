'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourceNames = [
  'semantics.js',
  'semantics-v2.js',
  'session-canonicalization.js',
  'session-correction.js',
  'data-access.js',
  'session-history.js'
];
const SESSION_ID = '00000000-0000-4000-8000-000000000901';

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function makeResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      return clone(body);
    },
    clone() {
      return makeResponse(status, body);
    }
  };
}

function snapshotItem(entry, itemOrder, values = {}) {
  const strength = entry.tracking_mode === 'strength_sets';
  return {
    item_key: entry.key,
    item_order: itemOrder,
    item_label_snapshot: entry.label,
    tracking_mode_snapshot: entry.tracking_mode,
    equipment_snapshot: entry.equipment,
    load_comparability_snapshot: entry.load_comparability,
    field_policy_snapshot: clone(entry.fields),
    duration_min: strength ? null : 30,
    distance_km: entry.tracking_mode === 'duration_distance' ? 5.25 : null,
    note: null,
    sets: strength
      ? [{
          set_order: 1,
          tracking_mode: 'strength_sets',
          reps: 10,
          duration_sec: null,
          distance_m: null,
          weight_kg: 80,
          assistance_kg: null
        }]
      : [],
    ...values
  };
}

function makeDetail(context) {
  const semantics = context.AppModules.activityV2.semanticsV2;
  return {
    schema_version: 'midas.activity-session-detail.v1',
    session_id: SESSION_ID,
    catalog_version: 2,
    revision: '7',
    content_fingerprint: 'a'.repeat(64),
    started_at: '2026-07-31T10:00:00.000Z',
    ended_at: '2026-07-31T10:30:00.000Z',
    day: '2026-07-31',
    title: 'Integration',
    duration_min: 30,
    note: null,
    items: [
      snapshotItem(semantics.getEntryByKey('running'), 1),
      snapshotItem(semantics.getEntryByKey('bench_press'), 2)
    ]
  };
}

function detailFromReplacement(context, detail, replacement) {
  const existing = new Map(detail.items.map((item) => [item.item_key, item]));
  const semantics = context.AppModules.activityV2.semanticsV2;
  const revision = String(BigInt(detail.revision) + 1n);
  return {
    ...clone(detail),
    revision,
    content_fingerprint: String.fromCharCode(97 + Number(revision) - 7).repeat(64),
    ended_at: new Date(
      Date.parse(detail.started_at) + replacement.duration_min * 60_000
    ).toISOString(),
    duration_min: replacement.duration_min,
    note: replacement.note,
    items: replacement.items.map((item) => {
      const snapshot = existing.get(item.item_key) ||
        snapshotItem(semantics.getEntryByKey(item.item_key), item.item_order);
      return {
        ...clone(snapshot),
        item_order: item.item_order,
        duration_min: item.duration_min,
        distance_km: item.distance_km,
        note: item.note,
        sets: item.sets.map((set) => ({
          set_order: set.set_order,
          tracking_mode: 'strength_sets',
          reps: set.reps,
          duration_sec: set.duration_sec,
          distance_m: set.distance_m,
          weight_kg: set.weight_kg,
          assistance_kg: set.assistance_kg
        }))
      };
    })
  };
}

function summary(detail) {
  return {
    session_id: detail.session_id,
    started_at: detail.started_at,
    day: detail.day,
    title: detail.title,
    duration_min: detail.duration_min,
    item_count: detail.items.length,
    revision: detail.revision
  };
}

function makeRuntime() {
  const transport = {
    calls: [],
    detail: null,
    unknownReplace: true
  };
  const activityV1 = Object.freeze({ sentinel: true });
  const context = vm.createContext({
    AppModules: {
      activity: activityV1,
      supabase: {
        baseUrlFromRest: (value) => String(value).replace(/\/rest\/v1\/?$/, ''),
        fetchWithAuth: (request) => request({ authorization: 'Bearer test' })
      }
    },
    Headers,
    URL,
    console,
    getConf: async () => 'https://example.supabase.co/rest/v1/',
    fetch: async (url, options) => {
      const rpc = new URL(url).pathname.split('/').at(-1);
      const body = JSON.parse(options.body);
      transport.calls.push({ rpc, body: clone(body) });
      if (rpc === 'activity_v2_list_sessions') {
        return makeResponse(200, {
          schema_version: 'midas.activity-session-history-page.v1',
          items: transport.detail === null ? [] : [summary(transport.detail)],
          has_more: false,
          next_cursor: null
        });
      }
      if (rpc === 'activity_v2_session_detail') {
        return makeResponse(200, clone(transport.detail));
      }
      if (rpc === 'activity_v2_replace_session') {
        assert.equal(body.p_session_id, SESSION_ID);
        assert.equal(body.p_expected_revision, transport.detail.revision);
        assert.equal(
          body.p_expected_content_fingerprint,
          transport.detail.content_fingerprint
        );
        transport.detail = detailFromReplacement(
          context,
          transport.detail,
          body.p_replacement
        );
        if (transport.unknownReplace) {
          transport.unknownReplace = false;
          return makeResponse(200, { outcome: 'response-lost' });
        }
        return makeResponse(200, {
          schema_version: 'midas.activity-session-mutation-result.v1',
          operation: 'replace',
          outcome: 'updated',
          session_id: SESSION_ID,
          revision: transport.detail.revision,
          content_fingerprint: transport.detail.content_fingerprint
        });
      }
      if (rpc === 'activity_v2_delete_session') {
        assert.equal(body.p_expected_revision, transport.detail.revision);
        assert.equal(
          body.p_expected_content_fingerprint,
          transport.detail.content_fingerprint
        );
        transport.detail = null;
        return makeResponse(200, {
          schema_version: 'midas.activity-session-mutation-result.v1',
          operation: 'delete',
          outcome: 'deleted',
          session_id: SESSION_ID
        });
      }
      throw new Error(`unexpected RPC ${rpc}`);
    }
  });
  sourceNames.forEach((name) => {
    const filename = path.join(__dirname, name);
    new vm.Script(fs.readFileSync(filename, 'utf8'), { filename })
      .runInContext(context);
  });
  transport.detail = makeDetail(context);
  return { context, transport, activityV1 };
}

test('T-ACT-R9-16 real data access reconciles and refreshes history, detail and key unions', async () => {
  const runtime = makeRuntime();
  const api = runtime.context.AppModules.activityV2;
  const dataAccess = api.dataAccess;
  const adapter = Object.freeze({
    listSessions: (options) => dataAccess.listSessions(options),
    loadSessionDetail: (sessionId) => dataAccess.loadSessionDetail(sessionId),
    replaceSession: (options) => dataAccess.replaceSession(options),
    deleteSession: (options) => dataAccess.deleteSession(options)
  });
  const refreshes = [];
  let failNextRefresh = false;
  const refreshLastPerformance = async (itemKeys) => {
    refreshes.push([...itemKeys]);
    const failed = failNextRefresh;
    failNextRefresh = false;
    if (failed) {
      return {
        status: 'success',
        items: new Array(itemKeys.length)
      };
    }
    return {
      status: 'success',
      items: itemKeys.map((itemKey) => ({
        item_key: itemKey,
        status: 'success'
      }))
    };
  };
  const guard = api.sessionHistory.createMutationGuard({
    getRecovery: () => null,
    getSessionCommit: () => null
  });
  const controller = api.sessionHistory.create({
    adapter,
    createCorrection: (detail) => api.sessionCorrection.create(detail),
    mutationGuard: guard,
    refreshLastPerformance
  });

  await controller.refreshHistory();
  await controller.openDetail(SESSION_ID);
  controller.openCorrection();
  controller.removeCorrectionItem('bench_press');
  controller.addCorrectionItem('high_row');
  controller.setCorrectionSetField('high_row', 1, 'reps', 12);
  controller.setCorrectionSetField('high_row', 1, 'weight_kg', 55);
  await controller.saveCorrection();
  assert.equal(controller.getState().correction.status, 'confirmed');
  assert.equal(controller.getState().correction.confirmation, 'reconciled');
  assert.deepEqual(refreshes[0], ['running', 'bench_press', 'high_row']);
  assert.equal(controller.getState().history.items[0].revision, '8');
  assert.equal(controller.getState().detail.value.revision, '8');
  assert.equal(
    runtime.transport.calls.filter((call) =>
      call.rpc === 'activity_v2_replace_session'
    ).length,
    1
  );

  controller.requestCloseCorrection();
  controller.openCorrection();
  controller.setCorrectionDurationMin(40);
  failNextRefresh = true;
  await controller.saveCorrection();
  assert.equal(controller.getState().correction.status, 'error');
  assert.equal(controller.getState().correction.retry_mode, 'refresh');
  assert.equal(controller.getState().history.items.length, 0);
  assert.equal(controller.getState().detail.value, null);
  const replaceCount = runtime.transport.calls.filter((call) =>
    call.rpc === 'activity_v2_replace_session'
  ).length;
  await controller.retryCorrection();
  assert.equal(controller.getState().correction.status, 'confirmed');
  assert.equal(
    runtime.transport.calls.filter((call) =>
      call.rpc === 'activity_v2_replace_session'
    ).length,
    replaceCount
  );
  assert.equal(controller.getState().detail.value.revision, '9');

  controller.requestCloseCorrection();
  assert.equal(controller.openDelete(), true);
  await controller.confirmDelete();
  assert.equal(controller.getState().deletion.status, 'confirmed');
  assert.equal(controller.getState().detail.status, 'not_found');
  assert.equal(controller.getState().history.status, 'empty');
  assert.deepEqual(refreshes.at(-1), ['running', 'high_row']);

  const listBodies = runtime.transport.calls
    .filter((call) => call.rpc === 'activity_v2_list_sessions')
    .map((call) => call.body);
  assert.equal(listBodies.every((body) =>
    body.p_limit === 20 &&
    body.p_cursor_started_at === null &&
    body.p_cursor_id === null
  ), true);
  assert.equal(
    runtime.transport.calls
      .filter((call) => call.rpc === 'activity_v2_replace_session')
      .some((call) => /"(?:id|session_id|item_id|set_id)":/.test(
        JSON.stringify(call.body.p_replacement)
      )),
    false
  );
  assert.equal(runtime.context.AppModules.activity, runtime.activityV1);
});
