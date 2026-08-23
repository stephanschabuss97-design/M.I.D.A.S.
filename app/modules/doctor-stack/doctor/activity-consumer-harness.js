'use strict';

(async function initDoctorActivityConsumerHarness(root) {
  const mode = new URLSearchParams(root.location.search).get('mode') || 'ready';
  const fixtureUrl = '../../vitals-stack/activity/v2/activity-consumer.fixture.json';
  const fixtures = await (await fetch(fixtureUrl)).json();
  const mixed = fixtures.cases.find((entry) => entry.name === 'mixed');
  const contract = root.AppModules.activityV2.consumer;
  const healthExportV3 = root.AppModules.doctor.healthExportV3;
  const view = root.AppModules.doctor.activityConsumerView;
  const panel = document.querySelector('[data-role="panel"]');
  const host = document.querySelector('[data-role="activity-list"]');
  const status = document.querySelector('[data-role="status"]');
  const toggle = document.querySelector('[data-role="toggle"]');
  const fromInput = document.querySelector('[data-role="from"]');
  const toInput = document.querySelector('[data-role="to"]');
  const reportCopy = document.querySelector('[data-role="report-copy"]');
  const exportButton = document.querySelector('[data-role="export-v3"]');
  const exportStatus = document.querySelector('[data-role="export-status"]');
  let units = JSON.parse(JSON.stringify(mixed.units));
  let calls = 0;
  let deletes = 0;
  let exportAttempts = 0;
  let lastExport = null;
  let pendingStale = null;

  const inclusiveDays = (from, to) =>
    Math.trunc(
      (Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`)) /
        86400000
    ) + 1;

  const buildSnapshot = (range, forceEmpty = false) => {
    const selected = forceEmpty
      ? []
      : units.filter((unit) => unit.day >= range.from && unit.day <= range.to);
    return contract.aggregateUnits(selected, {
      from: range.from,
      to: range.to,
      inclusive_days: inclusiveDays(range.from, range.to)
    }, fixtures.today);
  };

  const initialSnapshot = buildSnapshot({ from: fromInput.value, to: toInput.value });
  reportCopy.className = 'report-copy';
  const reportLines = initialSnapshot.units.length
    ? [
        `Letzte Aktivität: ${initialSnapshot.summary.last_day.slice(8, 10)}.${initialSnapshot.summary.last_day.slice(5, 7)}.${initialSnapshot.summary.last_day.slice(0, 4)}`,
        `Aktive Tage/Woche: ${String(initialSnapshot.summary.active_days_per_week).replace('.', ',')}`,
        `Gesamtdauer: ${initialSnapshot.summary.total_duration_min} Min (Durchschnitt: ${initialSnapshot.summary.average_duration_min} Min/Einheit)`
      ]
    : ['Keine Einträge im Zeitraum.'];
  reportLines.forEach((line) => {
    const row = document.createElement('p');
    row.textContent = line;
    reportCopy.append(row);
  });

  const buildBaseExportV2 = (range) => ({
    schema_version: 'midas.health-export.v2',
    generated_at: '2026-08-23T10:00:00.000Z',
    timezone: 'Europe/Vienna',
    range: { ...range },
    completeness: {
      status: 'complete',
      loaded_domains: ['blood_pressure', 'body', 'notes', 'labs', 'activities'],
      counts: {
        blood_pressure: 0,
        body: 0,
        notes: 0,
        labs: 0,
        activities: 0
      }
    },
    blood_pressure: [],
    body: [],
    notes: [],
    labs: [],
    activities: []
  });

  const exportLoader = healthExportV3.createLoader({
    contract,
    today: fixtures.today,
    async loadBaseExportV2(range) {
      return buildBaseExportV2(range);
    },
    async loadActivitySnapshot(range) {
      if (mode === 'error') throw new Error('raw export harness error');
      return buildSnapshot(range, mode === 'empty');
    }
  });

  exportButton.addEventListener('click', async () => {
    exportAttempts += 1;
    lastExport = null;
    exportButton.disabled = true;
    exportStatus.dataset.exportState = 'loading';
    exportStatus.textContent = 'V3-Export wird geprüft ...';
    try {
      lastExport = await exportLoader.load({
        from: fromInput.value,
        to: toInput.value
      });
      exportStatus.dataset.exportState = 'ready';
      exportStatus.textContent = 'V3-Export verifiziert.';
    } catch (_) {
      exportStatus.dataset.exportState = 'error';
      exportStatus.textContent = 'V3-Export konnte nicht verifiziert werden.';
    } finally {
      exportButton.disabled = false;
    }
  });

  const adapter = {
    async loadSnapshot(range) {
      calls += 1;
      if (mode === 'error') {
        throw Object.assign(new Error('raw harness error'), {
          code: 'REQUEST_FAILED', status: 503
        });
      }
      if (mode === 'stale' && calls === 1) {
        return await new Promise((resolve) => { pendingStale = { resolve, range }; });
      }
      const snapshot = buildSnapshot(range, mode === 'empty');
      if (pendingStale) {
        const stale = pendingStale;
        pendingStale = null;
        queueMicrotask(() => stale.resolve(buildSnapshot(stale.range)));
      }
      return snapshot;
    }
  };

  let controller;
  const sync = (state) => {
    document.querySelector('[data-role="root"]').dataset.state = state.status;
    status.textContent = state.status === 'loading'
      ? 'Trainingseinträge werden geladen ...'
      : state.status === 'error'
      ? 'Einzelne Datenbereiche konnten nicht geladen werden.'
      : state.status === 'locked'
      ? 'Arztdetails sind gesperrt.'
      : '';
    toggle.textContent = state.opened ? 'Einzelwerte schließen' : 'Einzelwerte anzeigen';
    toggle.setAttribute('aria-expanded', String(state.opened));
    panel.hidden = !state.opened;
  };

  controller = view.create({
    adapter,
    contract,
    host,
    unlocked: true,
    renderer(renderHost, state, actions) {
      view.render(renderHost, state, actions);
      sync(state);
    },
    async deleteV1(unit) {
      deletes += 1;
      units = units.filter((candidate) => candidate.id !== unit.id);
    },
    diagnose() {}
  });
  await controller.setRange({ from: fromInput.value, to: toInput.value });

  toggle.addEventListener('click', async () => {
    if (controller.getState().opened) controller.close();
    else await controller.open();
  });
  const changeRange = async () => {
    await controller.setRange({ from: fromInput.value, to: toInput.value });
  };
  fromInput.addEventListener('change', changeRange);
  toInput.addEventListener('change', changeRange);
  document.querySelector('[data-role="lock"]').addEventListener('click', () => {
    controller.lock();
  });
  document.querySelector('[data-role="logout"]').addEventListener('click', () => {
    controller.logout();
  });

  root.__midasActivityConsumerHarness = Object.freeze({
    controller,
    getCalls: () => calls,
    getDeletes: () => deletes,
    getExportAttempts: () => exportAttempts,
    getLastExport: () => lastExport,
    getMode: () => mode
  });
})(window);
