'use strict';

(function initActivityV2SessionHistoryHarness(root) {
  const FINGERPRINT_A = 'a'.repeat(64);
  const FINGERPRINT_B = 'b'.repeat(64);
  const UUIDS = Object.freeze({
    primary: '00000000-0000-4000-8000-000000000901',
    second: '00000000-0000-4000-8000-000000000902',
    third: '00000000-0000-4000-8000-000000000903'
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
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
        ? [
            {
              set_order: 1,
              tracking_mode: 'strength_sets',
              reps: 10,
              duration_sec: null,
              distance_m: null,
              weight_kg: entry.fields.weight_kg === 'forbidden' ? null : 80,
              assistance_kg: null
            }
          ]
        : [],
      ...values
    };
  }

  function makeDetail() {
    const semantics = root.AppModules.activityV2.semanticsV2;
    const running = semantics.getEntryByKey('running');
    const bench = semantics.getEntryByKey('bench_press');
    return {
      schema_version: 'midas.activity-session-detail.v1',
      session_id: UUIDS.primary,
      catalog_version: 2,
      revision: '7',
      content_fingerprint: FINGERPRINT_A,
      started_at: '2026-07-31T10:00:00.000Z',
      ended_at: '2026-07-31T10:30:00.000Z',
      day: '2026-07-31',
      title: 'Sommertraining',
      duration_min: 30,
      note: 'Persistierte Sessionnotiz',
      items: [
        snapshotItem(running, 1, { note: 'Ruhiger Dauerlauf' }),
        snapshotItem(bench, 2, {
          item_label_snapshot: 'Historischer Press',
          note: 'Persistierter Snapshot'
        })
      ]
    };
  }

  function summary(sessionId, day, title, durationMin, itemCount, revision) {
    return {
      session_id: sessionId,
      started_at: `${day}T10:00:00.000Z`,
      day,
      title,
      duration_min: durationMin,
      item_count: itemCount,
      revision
    };
  }

  function page(items, hasMore) {
    return {
      schema_version: 'midas.activity-session-history-page.v1',
      items,
      has_more: hasMore,
      next_cursor: hasMore
        ? {
            started_at: items.at(-1).started_at,
            id: items.at(-1).session_id
          }
        : null
    };
  }

  const queryFixture = new URLSearchParams(root.location.search).get('fixture');
  const initialMode = [
    'ready',
    'empty',
    'history-error',
    'detail-error'
  ].includes(queryFixture)
    ? queryFixture
    : 'ready';
  const queryReplace = new URLSearchParams(root.location.search).get('replace');
  const initialReplaceMode = [
    'updated',
    'replayed',
    'conflict',
    'unknown-desired',
    'unknown-preimage',
    'unknown-changed'
  ].includes(queryReplace)
    ? queryReplace
    : 'updated';
  const queryDelete = new URLSearchParams(root.location.search).get('delete');
  const initialDeleteMode = [
    'deleted',
    'already-absent',
    'conflict',
    'unknown-absent',
    'unknown-preimage',
    'unknown-changed'
  ].includes(queryDelete)
    ? queryDelete
    : 'deleted';
  const queryAdmission = new URLSearchParams(root.location.search).get(
    'admission'
  );
  const initialRecovery =
    queryAdmission === 'active-draft'
      ? Object.freeze({
          state: 'active',
          started_at: '2026-08-13T08:00:00.000Z',
          saved_at: null,
          item_count: 1,
          reason: null
        })
      : null;
  const initialCommit =
    queryAdmission === 'commit-unresolved'
      ? Object.freeze({
          state: 'committing',
          reason: null,
          focus_target: null,
          intent_present: true
        })
      : null;
  const fixture = {
    mode: initialMode,
    replaceMode: initialReplaceMode,
    deleteMode: initialDeleteMode,
    historyFailurePending: initialMode === 'history-error',
    detailFailurePending: initialMode === 'detail-error',
    recovery: initialRecovery,
    commit: initialCommit,
    currentDetail: makeDetail(),
    replaceUnknownPending: true,
    deleteUnknownPending: true,
    calls: {
      listSessions: 0,
      loadSessionDetail: 0,
      replaceSession: 0,
      deleteSession: 0,
      loadLastPerformance: 0
    }
  };
  const firstPage = page(
    [
      summary(UUIDS.primary, '2026-07-31', 'Sommertraining', 30, 2, '7'),
      summary(UUIDS.second, '2026-07-24', 'Beine & Core', 42, 4, '2')
    ],
    true
  );
  const secondPage = page(
    [summary(UUIDS.third, '2026-07-17', 'Kurze Runde', 18, 1, '1')],
    false
  );

  function detailFromRequest(detail, request) {
    const existing = new Map(detail.items.map((item) => [item.item_key, item]));
    return {
      ...clone(detail),
      revision: '8',
      content_fingerprint: FINGERPRINT_B,
      ended_at: new Date(
        Date.parse(detail.started_at) + request.session.duration_min * 60_000
      ).toISOString(),
      duration_min: request.session.duration_min,
      note: request.session.note,
      items: request.session.items.map((replacement) => {
        const snapshot =
          existing.get(replacement.item_key) ||
          snapshotItem(
            root.AppModules.activityV2.semanticsV2.getEntryByKey(
              replacement.item_key
            ),
            replacement.item_order
          );
        return {
          ...clone(snapshot),
          item_order: replacement.item_order,
          duration_min: replacement.duration_min,
          distance_km: replacement.distance_km,
          note: replacement.note,
          sets: replacement.sets.map((set) => ({
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

  function response(status, body) {
    return {
      status,
      ok: status >= 200 && status < 300,
      async json() {
        return clone(body);
      },
      clone() {
        return response(status, body);
      }
    };
  }

  function currentSummary() {
    const value = fixture.currentDetail;
    return value === null
      ? null
      : {
          session_id: value.session_id,
          started_at: value.started_at,
          day: value.day,
          title: value.title,
          duration_min: value.duration_min,
          item_count: value.items.length,
          revision: value.revision
        };
  }

  function lookupResponse(itemKey) {
    const value = fixture.currentDetail;
    const item = value?.items.find((entry) => entry.item_key === itemKey);
    if (!item) return null;
    return {
      schema_version: 'midas.activity-last-performance.v1',
      session: {
        id: value.session_id,
        started_at: value.started_at.replace('.000Z', '.000000Z'),
        day: value.day
      },
      item: {
        id: '00000000-0000-4000-8000-000000000971',
        catalog_version: value.catalog_version,
        ...clone(item),
        created_at: '2026-07-31T10:30:00.000000Z',
        sets: item.sets.map((set, index) => ({
          id: `00000000-0000-4000-8000-${String(980 + index).padStart(12, '0')}`,
          ...clone(set),
          created_at: '2026-07-31T10:30:00.000000Z'
        }))
      }
    };
  }

  Object.defineProperty(root.AppModules, 'supabase', {
    value: Object.freeze({
      baseUrlFromRest: (value) => String(value).replace(/\/rest\/v1\/?$/, ''),
      fetchWithAuth: (makeRequest) =>
        makeRequest({ authorization: 'Bearer isolated-harness' })
    }),
    enumerable: true,
    writable: false,
    configurable: false
  });
  root.getConf = async () => 'https://example.supabase.co/rest/v1/';
  root.fetch = async (url, options) => {
    const rpc = new URL(url).pathname.split('/').at(-1);
    const body = JSON.parse(options.body);
    if (rpc === 'activity_v2_list_sessions') {
      fixture.calls.listSessions += 1;
      if (fixture.mode === 'history-error' && fixture.historyFailurePending) {
        fixture.historyFailurePending = false;
        return response(500, { message: 'safe harness error' });
      }
      if (fixture.mode === 'empty') return response(200, page([], false));
      if (body.p_cursor_id !== null) return response(200, secondPage);
      const primary = currentSummary();
      return response(200, page([
        ...(primary ? [primary] : []),
        firstPage.items[1]
      ], false));
    }
    if (rpc === 'activity_v2_session_detail') {
      fixture.calls.loadSessionDetail += 1;
      if (fixture.mode === 'detail-error' && fixture.detailFailurePending) {
        fixture.detailFailurePending = false;
        return response(500, { message: 'safe harness error' });
      }
      return response(
        200,
        body.p_session_id === UUIDS.primary ? fixture.currentDetail : null
      );
    }
    if (rpc === 'activity_v2_last_performance') {
      fixture.calls.loadLastPerformance += 1;
      return response(200, lookupResponse(body.p_item_key));
    }
    if (rpc === 'activity_v2_replace_session') {
      fixture.calls.replaceSession += 1;
      const request = {
        sessionId: body.p_session_id,
        session: body.p_replacement
      };
      fixture.lastReplaceRequest = clone(body);
      if (fixture.replaceMode === 'conflict') {
        return response(409, { message: 'MIDAS_ACTIVITY_SESSION_CONFLICT' });
      }
      const unknown = fixture.replaceMode.startsWith('unknown-') &&
        fixture.replaceUnknownPending;
      if (unknown) {
        fixture.replaceUnknownPending = false;
        if (fixture.replaceMode === 'unknown-desired') {
          fixture.currentDetail = detailFromRequest(fixture.currentDetail, request);
        } else if (fixture.replaceMode === 'unknown-changed') {
          fixture.currentDetail = {
            ...clone(fixture.currentDetail),
            revision: '8',
            content_fingerprint: 'c'.repeat(64),
            note: 'Zwischenzeitlich geändert'
          };
        }
        return response(200, { outcome: 'response-lost' });
      }
      fixture.currentDetail = detailFromRequest(fixture.currentDetail, request);
      return response(200, {
        schema_version: 'midas.activity-session-mutation-result.v1',
        operation: 'replace',
        outcome: fixture.replaceMode === 'replayed' ? 'replayed' : 'updated',
        session_id: body.p_session_id,
        revision: fixture.currentDetail.revision,
        content_fingerprint: fixture.currentDetail.content_fingerprint
      });
    }
    if (rpc === 'activity_v2_delete_session') {
      fixture.calls.deleteSession += 1;
      fixture.lastDeleteRequest = clone(body);
      if (fixture.deleteMode === 'conflict') {
        return response(409, { message: 'MIDAS_ACTIVITY_SESSION_CONFLICT' });
      }
      const unknown = fixture.deleteMode.startsWith('unknown-') &&
        fixture.deleteUnknownPending;
      if (unknown) {
        fixture.deleteUnknownPending = false;
        if (fixture.deleteMode === 'unknown-absent') {
          fixture.currentDetail = null;
        } else if (fixture.deleteMode === 'unknown-changed') {
          fixture.currentDetail = {
            ...clone(fixture.currentDetail),
            revision: '8',
            content_fingerprint: 'c'.repeat(64),
            note: 'Zwischenzeitlich geändert'
          };
        }
        return response(200, { outcome: 'response-lost' });
      }
      fixture.currentDetail = null;
      return response(200, {
        schema_version: 'midas.activity-session-mutation-result.v1',
        operation: 'delete',
        outcome:
          fixture.deleteMode === 'already-absent' ? 'already_absent' : 'deleted',
        session_id: body.p_session_id
      });
    }
    return response(404, { message: 'unknown isolated harness RPC' });
  };

  const dataAccess = root.AppModules.activityV2.dataAccess;
  const adapter = Object.freeze({
    listSessions: (options) => dataAccess.listSessions(options),
    loadSessionDetail: (sessionId) => dataAccess.loadSessionDetail(sessionId),
    replaceSession: (options) => dataAccess.replaceSession(options),
    deleteSession: (options) => dataAccess.deleteSession(options)
  });

  const liveDraft = root.AppModules.activityV2.sessionDraft.create({
    semantics: root.AppModules.activityV2.semanticsV2,
    now: () => Date.parse('2026-08-13T08:00:00.000Z'),
    createRequestId: () => '00000000-0000-4000-8000-000000000990'
  });
  liveDraft.addItem('running');
  liveDraft.addItem('bench_press');
  const liveShellHost = document.getElementById('activity-v2-r9-live-shell');
  const liveSessionShell = root.AppModules.activityV2.sessionShell.mount({
    host: liveShellHost,
    draft: liveDraft,
    semantics: root.AppModules.activityV2.semanticsV2,
    confirmDiscard: () => false,
    loadLastPerformance: (itemKey) =>
      dataAccess.loadLastPerformance(itemKey, {
        semantics: root.AppModules.activityV2.semanticsV2
      })
  });

  const guard = root.AppModules.activityV2.sessionHistory.createMutationGuard({
    getRecovery: () => fixture.recovery,
    getSessionCommit: () => fixture.commit
  });
  const controller = root.AppModules.activityV2.sessionHistory.create({
    adapter,
    createCorrection: (detail) =>
      root.AppModules.activityV2.sessionCorrection.create(detail),
    mutationGuard: guard,
    refreshLastPerformance: (itemKeys) =>
      liveSessionShell.refreshLastPerformance(itemKeys)
  });
  const shell = root.AppModules.activityV2.sessionHistoryShell.mount({
    host: document.getElementById('activity-v2-r9-harness'),
    controller
  });

  function openLiveSession() {
    liveShellHost.hidden = false;
    return liveSessionShell.open();
  }
  document.getElementById('activity-v2-r9-open-live-shell')
    .addEventListener('click', openLiveSession);

  const harness = {
    getState: () => controller.getState(),
    getCalls: () => clone(fixture.calls),
    getLastReplaceRequest: () => clone(fixture.lastReplaceRequest ?? null),
    getLastDeleteRequest: () => clone(fixture.lastDeleteRequest ?? null),
    getProductSentinel: () => root.AppModules.activity.productSentinel,
    getLiveBenchLabel: () =>
      root.AppModules.activityV2.semanticsV2.getEntryByKey('bench_press').label,
    openLiveSession,
    async setMode(mode) {
      if (!['ready', 'empty', 'history-error', 'detail-error'].includes(mode)) {
        throw new TypeError('invalid harness mode');
      }
      fixture.mode = mode;
      fixture.historyFailurePending = mode === 'history-error';
      fixture.detailFailurePending = mode === 'detail-error';
      fixture.currentDetail = makeDetail();
      return controller.refreshHistory();
    },
    setAdmission(mode) {
      if (mode === 'allowed') {
        fixture.recovery = null;
        fixture.commit = null;
      } else if (mode === 'active-draft') {
        fixture.recovery = Object.freeze({
          state: 'active',
          started_at: '2026-08-13T08:00:00.000Z',
          saved_at: null,
          item_count: 1,
          reason: null
        });
        fixture.commit = null;
      } else if (mode === 'commit-unresolved') {
        fixture.recovery = null;
        fixture.commit = Object.freeze({
          state: 'committing',
          reason: null,
          focus_target: null,
          intent_present: true
        });
      } else {
        throw new TypeError('invalid admission mode');
      }
      return controller.refreshAdmission();
    },
    controller,
    shell
  };

  Object.defineProperty(root, '__midasActivityV2R9Harness', {
    value: Object.freeze(harness),
    enumerable: false,
    writable: false,
    configurable: false
  });
})(window);
