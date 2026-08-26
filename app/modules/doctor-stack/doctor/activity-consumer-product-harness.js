'use strict';

(async function initR13ProductHarness(root) {
  const mode = new URLSearchParams(root.location.search).get('mode') || 'ready';
  const nativeFetch = root.fetch.bind(root);
  const fixtures = await (await nativeFetch(
    '../../vitals-stack/activity/v2/activity-consumer.fixture.json'
  )).json();
  const mixed = fixtures.cases.find((entry) => entry.name === 'mixed');
  const contract = root.AppModules.activityV2.consumer;
  const adapter = root.AppModules.activityV2.consumerDataAccess;
  const view = root.AppModules.doctor.activityConsumerView;
  const healthExportV3 = root.AppModules.doctor.healthExportV3;
  const host = document.querySelector('[data-role="activity"]');
  const details = document.querySelector('[data-role="details"]');
  const toggle = document.querySelector('[data-role="toggle"]');
  const fromInput = document.querySelector('[data-role="from"]');
  const toInput = document.querySelector('[data-role="to"]');
  const status = document.querySelector('[data-role="status"]');
  const exportButton = document.querySelector('[data-role="export"]');
  const exportStatus = document.querySelector('[data-role="export-status"]');
  let units = JSON.parse(JSON.stringify(mixed.units));
  let rpcCalls = 0;
  let deleteCalls = 0;
  let downloads = 0;
  let lastExport = null;
  let firstStaleRequest = null;

  const inclusiveDays = (from, to) =>
    Math.trunc(
      (Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`)) /
        86400000
    ) + 1;
  const snapshotFor = (range, forceEmpty = false) => contract.aggregateUnits(
    forceEmpty ? [] : units.filter((unit) => unit.day >= range.from && unit.day <= range.to),
    { from: range.from, to: range.to, inclusive_days: inclusiveDays(range.from, range.to) },
    fixtures.today
  );

  root.fetch = async (url, options = {}) => {
    if (!String(url).includes('/rest/v1/rpc/activity_consumer_snapshot')) {
      return nativeFetch(url, options);
    }
    rpcCalls += 1;
    const body = JSON.parse(options.body || '{}');
    const range = { from: body.p_from, to: body.p_to };
    if (mode === 'error') {
      return new Response(JSON.stringify({ message: 'opaque harness failure' }), {
        status: 503,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (mode === 'stale' && rpcCalls === 1) {
      return await new Promise((resolve) => {
        firstStaleRequest = { resolve, range };
      });
    }
    const response = new Response(
      JSON.stringify(snapshotFor(range, mode === 'empty')),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
    if (firstStaleRequest) {
      const stale = firstStaleRequest;
      firstStaleRequest = null;
      queueMicrotask(() => stale.resolve(new Response(
        JSON.stringify(snapshotFor(stale.range)),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )));
    }
    return response;
  };

  const sync = (state) => {
    document.querySelector('[data-role="root"]').dataset.consumerState = state.status;
    details.hidden = !state.opened;
    toggle.setAttribute('aria-expanded', String(state.opened));
    toggle.textContent = state.opened ? 'Einzelwerte schließen' : 'Einzelwerte anzeigen';
    status.textContent = state.status === 'loading'
      ? 'Trainingseinträge werden geladen ...'
      : state.status === 'error'
      ? 'Einzelne Datenbereiche konnten nicht geladen werden.'
      : state.status === 'locked'
      ? 'Arztdetails sind gesperrt.'
      : '';
  };

  const controller = view.create({
    adapter,
    contract,
    host,
    unlocked: true,
    renderer(renderHost, state, actions) {
      view.render(renderHost, state, actions);
      sync(state);
    },
    async deleteV1(unit) {
      if (unit.source !== 'activity_v1') throw new Error('source rejected');
      deleteCalls += 1;
      units = units.filter((candidate) =>
        !(candidate.source === 'activity_v1' && candidate.day === unit.day)
      );
    },
    diagnose() {}
  });
  await controller.setRange({ from: fromInput.value, to: toInput.value });

  toggle.addEventListener('click', async () => {
    if (controller.getState().opened) controller.close();
    else await controller.open();
  });
  const setRange = () => controller.setRange({ from: fromInput.value, to: toInput.value });
  fromInput.addEventListener('change', setRange);
  toInput.addEventListener('change', setRange);
  document.querySelector('[data-role="logout"]').addEventListener('click', () => {
    controller.logout();
  });

  const buildBaseExportV2 = (range) => ({
    schema_version: 'midas.health-export.v2',
    generated_at: '2026-08-23T10:00:00.000Z',
    timezone: 'Europe/Vienna',
    range: { ...range },
    completeness: {
      status: 'complete',
      loaded_domains: ['blood_pressure', 'body', 'notes', 'labs', 'activities'],
      counts: { blood_pressure: 0, body: 0, notes: 0, labs: 0, activities: 0 }
    },
    blood_pressure: [], body: [], notes: [], labs: [], activities: []
  });
  const exportLoader = healthExportV3.createLoader({
    contract,
    today: fixtures.today,
    async loadBaseExportV2(range) { return buildBaseExportV2(range); },
    loadActivitySnapshot: adapter.loadSnapshot
  });
  exportButton.addEventListener('click', async () => {
    lastExport = null;
    exportStatus.dataset.state = 'loading';
    exportStatus.textContent = 'V3-Export wird geprüft ...';
    try {
      lastExport = await exportLoader.load({ from: fromInput.value, to: toInput.value });
      exportStatus.dataset.state = 'ready';
      exportStatus.textContent = 'V3-Export verifiziert.';
    } catch (_) {
      exportStatus.dataset.state = 'error';
      exportStatus.textContent = 'V3-Export konnte nicht verifiziert werden.';
    }
  });

  root.__midasR13ProductHarness = Object.freeze({
    controller,
    getRpcCalls: () => rpcCalls,
    getDeleteCalls: () => deleteCalls,
    getDownloads: () => downloads,
    getLastExport: () => lastExport,
    getMode: () => mode
  });
})(window);
