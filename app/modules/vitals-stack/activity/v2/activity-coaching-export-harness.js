'use strict';

(async function initHarness(root) {
  const params = new URLSearchParams(root.location.search);
  const mode = params.get('mode') || 'ready';
  const fixtureResponse = await root.fetch('./activity-coaching-export.fixture.json');
  if (!fixtureResponse.ok) throw new Error('fixture unavailable');
  const fixture = await fixtureResponse.json();
  const adapterState = { calls: 0, mode };
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function shapeFixture(range, empty) {
    const value = clone(fixture);
    value.range = { ...range, inclusive: true };
    value.sessions = empty
      ? []
      : value.sessions.filter(
          (session) => session.day >= range.from && session.day <= range.to
        );
    const items = value.sessions.flatMap((session) => session.items);
    const sets = items.flatMap((item) => item.sets);
    value.completeness = {
      status: 'complete',
      truncated: false,
      session_count: value.sessions.length,
      item_count: items.length,
      set_count: sets.length
    };
    const cautions = [];
    if (value.sessions.length === 0) cautions.push('no_sessions_in_range');
    if (sets.some((set) => set.assistance_kg !== null)) {
      cautions.push('assistance_loads_present');
    }
    if (items.some((item) => item.load_comparability_snapshot === 'device_relative')) {
      cautions.push('device_relative_loads_present');
    }
    if (new Set(value.sessions.map((session) => session.catalog_version)).size > 1) {
      cautions.push('multiple_catalog_versions_present');
    }
    value.quality = {
      status: value.sessions.length === 0 ? 'no_data' : 'ok',
      cautions: cautions.sort()
    };
    return value;
  }

  const adapter = Object.freeze({
    async loadCoachingExport(range) {
      adapterState.calls += 1;
      if (mode === 'slow') await new Promise((resolve) => root.setTimeout(resolve, 350));
      if (mode === 'error' && adapterState.calls === 1) {
        throw Object.assign(new Error('safe harness failure'), {
          code: 'REQUEST_FAILED', retryable: true
        });
      }
      return shapeFixture(range, mode === 'empty');
    }
  });
  const controller = root.AppModules.activityV2.coachingExportController.create({
    adapter,
    now: () => Date.parse('2026-08-22T12:00:00.000Z')
  });
  const shell = root.AppModules.activityV2.coachingExportShell.mount(
    root.document.querySelector('[data-role="root"]'),
    controller
  );
  Object.defineProperty(root, '__midasActivityV2R10Harness', {
    value: Object.freeze({ controller, shell, adapterState, fixture }),
    enumerable: false,
    writable: false,
    configurable: false
  });
})(window);
