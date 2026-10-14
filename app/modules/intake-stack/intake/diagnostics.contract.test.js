'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { clone, createFixture, settle, sinks, checkEvents } = require('./diagnostics.test-support.cjs');
const { runE3Scenario, e3Cases, checkE3 } = require('./diagnostics.test-support.cjs');

for (const mode of [...Object.keys(e3Cases), 'ack-disabled', 'ack-unauth', 'ack-error',
  'reopen', 'followup-unauth', 'followup-missing']) {
  const group = mode.startsWith('ack') ? 'ACK' : mode.startsWith('start') ? 'START'
    : mode.startsWith('confirm') || mode === 'cancel' ? 'CONFIRM' : 'FOLLOWUP';
  test(`E3-${group} ${mode}: original listener/API, three sinks and functional contract`, async () => {
    const f = createFixture({ e3: true });
    f.state.vmAction = (attr) => {
      const attributes = { [attr]: f.state.medId };
      if (attr === 'data-med-ack') attributes['data-med-stock'] = String(f.state.stock);
      const button = f.medButton('medLowStockBox', attributes);
      button.disabled = Boolean(f.state.disabledAction);
      f.state.actionButton = button;
      button.click();
    };
    const result = await require('node:vm').runInContext(`(${runE3Scenario.toString()})(${JSON.stringify(mode)})`, f.context);
    checkE3(result);
  });
}

test('E3-FOLLOWUP voice: original caller forwards context to real exported intake API', async () => {
  const { read } = require('./diagnostics.test-support.cjs');
  const f = createFixture({ e3: true });
  await f.api.refreshCaptureIntake('fixture:voice-seed');
  const voice = read('app/modules/assistant-stack/voice/index.js');
  const start = voice.indexOf('  const runVoiceMedicationLowStockReorderStart = async (pendingContext) => {');
  const end = voice.indexOf('\n  const ', start + 10);
  assert.ok(start >= 0 && end > start, 'Original Voice caller boundary');
  const original = f.api.startMedicationLowStockReorder;
  const calls = [];
  f.api.startMedicationLowStockReorder = (options) => { calls.push(clone(options)); return original(options); };
  f.window.getVoiceTodayIso = () => f.state.day;
  vm.runInContext('(function(global){' + voice.slice(start, end) + '\nglobalThis.__voiceStart = runVoiceMedicationLowStockReorderStart;})(window);', f.context);
  const result = await f.window.__voiceStart({ payload_snapshot: { dayIso: f.state.day, med_ids: [f.state.medId] } });
  equal(calls, [{ dayIso: f.state.day, medIds: [f.state.medId], source: 'voice-medication-low-stock-followup',
    reason: 'voice:medication-low-stock-followup' }], 'Original Voice options preserved');
  assert.ok(result.handled && result.outcome === 'handled' && result.reason === 'voice-medication-reorder-started', 'Original Voice result');
  assert.ok(f.state.launches.length === 1 && f.state.launches[0].startsWith('mailto:'), 'Voice protocol captured before handoff');
  for (const lines of Object.values(sinks(f.window))) assert.ok(lines.includes(e3Cases['followup-prompted'][1]), 'Voice fixed follow-up marker');
});

test('E3-INTEGRATION: disjoint 29-candidate coverage, four E2 targets, 13 retained dispositions', () => {
  const { read, events, root } = require('./diagnostics.test-support.cjs');
  const fs = require('node:fs');
  const path = require('node:path');
  const active = 'docs/MIDAS Intake Diagnostics Rolling Wave Roadmap.md';
  const parent = read(fs.existsSync(path.join(root, active)) ? active
    : 'docs/archive/MIDAS Intake Diagnostics Rolling Wave Roadmap (DONE).md');
  const assignments = [...parent.matchAll(/^\| (F35-C\d+) \| (E[123]) \|/gm)].map((m) => [m[1], m[2]]);
  const e3Ids = Object.values(e3Cases).map(([id]) => id);
  const e2Ids = ['F35-C02', 'F35-C06', 'F35-C07', 'F35-C09', 'F35-C18', 'F35-C25',
    'F35-C26', 'F35-C29', 'F35-C31', 'F35-C38', 'F35-C42'];
  const expected = [...Object.keys(events).map((id) => [id, 'E1']), ...e2Ids.map((id) => [id, 'E2']), ...e3Ids.map((id) => [id, 'E3'])];
  equal(assignments, expected, 'Registry assignment equals exercised E1/E2/E3 coverage');
  assert.ok(assignments.length === 29 && new Set(assignments.map(([id]) => id)).size === 29, 'Exactly 29, no duplicate repairs');
  for (const id of ['F35-X01', 'F35-X02', 'F35-X03', 'F35-X04']) assert.ok(parent.includes(`| ${id} |`) && parent.includes(`r-e2-${id.slice(4).toLowerCase()}`), 'Four E2 targets retain result references');
  const findings = read('docs/archive/MIDAS Activity V2 R14 Repair Findings (DONE).md').split('## Aktuelle F35-Einzeltriage')[1];
  const retained = [...findings.matchAll(/^\| (F35-C\d+) \|[^\n]+\*\*BEIBEHALTEN\*\*/gm)].map((m) => m[1]);
  equal(retained, ['F35-C01', 'F35-C03', 'F35-C04', 'F35-C05', 'F35-C23', 'F35-C24',
    'F35-C27', 'F35-C28', 'F35-C30', 'F35-C32', 'F35-C33', 'F35-C37', 'F35-C41'], 'Exactly 13 retained dispositions');
});

const waterIds = ['F35-C34', 'F35-C35', 'F35-C36'];
const comboIds = ['F35-C39', 'F35-C40'];
const buttonId = (kind) => kind === 'water' ? 'cap-water-add-btn' : 'cap-salt-protein-btn';

function enter(f, kind, values = {}) {
  if (kind === 'water') f.element('cap-water-add').value = values.water ?? '237.6';
  else {
    f.element('cap-salt-add').value = values.salt ?? '0,42';
    f.element('cap-protein-add').value = values.protein ?? '13,27';
  }
}

function equal(actual, expected, label) {
  assert.ok(JSON.stringify(clone(actual)) === JSON.stringify(expected), label);
}

function successContract(f, kind, expected) {
  assert.ok(f.state.writes.length === 1, 'Exactly one transport write');
  const write = f.state.writes[0];
  assert.ok(write.url === 'https://fixture.invalid/rest/v1/rpc/upsert_intake' && write.method === 'POST', 'Original RPC route/method');
  equal(write.body, {
    p_day: f.state.day, p_water_ml: expected.water_ml,
    p_salt_g: expected.salt_g, p_protein_g: expected.protein_g
  }, 'Original RPC payload, units and today boundary');
  equal(f.window.captureIntakeState.totals, expected, 'Original totals state');
  equal(f.state.snapshots, [{ dayIso: f.state.day, logged: true, totals: expected }], 'Hub snapshot preserved');
  equal(f.state.refreshes, [{ reason: 'capture:intake', doctor: false, chart: false,
    appointments: false, lifestyle: true }], 'Refresh contract preserved');
  assert.ok(f.window.captureIntakeState.logged, 'Logged status retained');
  const button = f.element(buttonId(kind));
  assert.ok(button.disabled && /gespeichert/.test(button.innerHTML), 'Original success feedback/cooldown');
  assert.ok(f.element('pill-water').innerHTML.includes(`${expected.water_ml} ml`), 'Water pill preserves ml');
  assert.ok(f.element('pill-salt').innerHTML.includes(' g'), 'Salt pill preserves unit');
  assert.ok(f.element('pill-protein').innerHTML.includes(' g'), 'Protein pill preserves unit');
  for (const lines of Object.values(sinks(f.window))) {
    assert.ok(lines.includes('[capture] save network ok'), 'Positive network marker');
    assert.ok(lines.includes(`[capture] save ok ${kind === 'water' ? 'water' : 'salt+protein'}`), 'Positive save marker');
  }
  f.state.advance(1200);
  assert.ok(!button.disabled && button.innerHTML === '+ Menge', 'Original button restored');
}

test('E1-WATER: original listener preserves payload, today, rounding, refresh and feedback', async () => {
  const f = createFixture();
  // Old state date must not redirect the current-day handler to yesterday.
  f.window.captureIntakeState.dayIso = '2031-04-07';
  enter(f, 'water');
  f.element(buttonId('water')).click();
  await settle(f);
  successContract(f, 'water', { water_ml: 1049, salt_g: 1.23, protein_g: 24.56 });
  assert.ok(f.element('cap-water-add').value === '', 'Successful water clears input');
});

for (const id of waterIds) test(`E1-WATER ${id}: all three original sinks`, async () => {
  const f = createFixture();
  enter(f, 'water');
  f.element(buttonId('water')).click();
  await settle(f);
  checkEvents(sinks(f.window), [id]);
});

test('E1-COMBO: original listener preserves decimal parsing, payload, refresh and feedback', async () => {
  const f = createFixture();
  enter(f, 'combo');
  f.element(buttonId('combo')).click();
  await settle(f);
  successContract(f, 'combo', { water_ml: 811, salt_g: 1.65, protein_g: 37.83 });
  assert.ok(f.element('cap-salt-add').value === '' && f.element('cap-protein-add').value === '', 'Positive combo inputs cleared');
});

for (const id of comboIds) test(`E1-COMBO ${id}: all three original sinks`, async () => {
  const f = createFixture();
  enter(f, 'combo');
  f.element(buttonId('combo')).click();
  await settle(f);
  checkEvents(sinks(f.window), [id]);
});

for (const values of [{ salt: '', protein: '13,27' }, { salt: '0,42', protein: '' },
  { salt: '', protein: '' }, { salt: '-0,42', protein: '-13,27' }]) {
  test('E1-COMBO: partial, empty and negative branches retain arithmetic/input semantics', async () => {
    const f = createFixture();
    enter(f, 'combo', values);
    f.element(buttonId('combo')).click();
    await settle(f);
    const salt = Number(values.salt.replace(',', '.'));
    const protein = Number(values.protein.replace(',', '.'));
    successContract(f, 'combo', { water_ml: 811,
      salt_g: Math.round((1.23 + salt) * 100) / 100,
      protein_g: Math.round((24.56 + protein) * 100) / 100 });
    assert.ok(f.element('cap-salt-add').value === (salt > 0 ? '' : values.salt), 'Salt clear condition');
    assert.ok(f.element('cap-protein-add').value === (protein > 0 ? '' : values.protein), 'Protein clear condition');
    checkEvents(sinks(f.window), comboIds);
  });
}

for (const kind of ['water', 'combo']) {
  test(`E1-GUARDS ${kind}: stage, disabled auth UI and auth provider prevent writes`, async () => {
    const f = createFixture();
    enter(f, kind);
    f.state.stage = false;
    f.element(buttonId(kind)).click();
    await settle(f);
    assert.ok(f.state.writes.length === 0 && f.window.diag.lines.length === 0, 'Stage guard before events/write');
    f.state.stage = true;
    f.state.logged = false;
    f.window.AppModules.supabase.supabaseState.authState = 'unauth';
    await f.api.refreshCaptureIntake('fixture:unauth');
    assert.ok(f.element(buttonId(kind)).disabled, 'Original unauth refresh disables UI');
    enter(f, kind);
    f.element(buttonId(kind)).click();
    await settle(f);
    assert.ok(f.state.writes.length === 0, 'Disabled listener does not write');
    // Explicit bypass tests provider failure, without inventing a handler auth guard.
    f.element(buttonId(kind)).disabled = false;
    f.element(buttonId(kind)).click();
    await settle(f);
    assert.ok(f.state.writes.length === 0 && f.state.login.includes(true), 'Controlled auth rejection before transport');
    assert.ok(f.state.refreshes.length === 0, 'No false success refresh');
  });

  test(`E1-GUARDS ${kind}: in-flight double click keeps one write`, async () => {
    const f = createFixture();
    enter(f, kind);
    f.state.hold = true;
    const button = f.element(buttonId(kind));
    button.click();
    button.click();
    await settle(f);
    assert.ok(button.disabled && button.innerHTML === 'Speichere ...', 'Original busy UI');
    assert.ok(f.state.writes.length === 1 && f.state.refreshes.length === 0, 'One in-flight write without premature success');
    f.state.release();
    await settle(f);
    assert.ok(f.state.writes.length === 1 && f.state.refreshes.length === 1, 'One completion/refresh');
  });

  for (const status of [500, 401, 403]) test(`E1-GUARDS ${kind}: save ${status} retains state, input and error`, async () => {
    const f = createFixture();
    enter(f, kind);
    f.state.status = status;
    f.element(buttonId(kind)).click();
    await settle(f);
    assert.ok(f.state.writes.length === 1 && f.state.refreshes.length === 0, 'One failed write; no success refresh');
    equal(f.window.captureIntakeState.totals, f.state.totals, 'Failure preserves prior totals');
    assert.ok(!f.element(buttonId(kind)).disabled, 'Error restores button');
    assert.ok(f.element(kind === 'water' ? 'cap-water-add' : 'cap-salt-add').value !== '', 'Failure preserves input');
    assert.ok(f.state.console.some((entry) => entry.level === 'error' && entry.args[0] === '[uiError]'), 'Original visible error fallback');
    assert.ok(f.state.login.includes(true) === (status === 401 || status === 403), 'Auth error overlay contract');
    for (const lines of Object.values(sinks(f.window))) {
      assert.ok(lines.some((line) => line.startsWith('[capture] save error ')), 'Error marker retained');
      assert.ok(!lines.some((line) => line.startsWith('[capture] save ok ')), 'No false success marker');
    }
  });
}

test('E1-GUARDS: invalid combo input uses original parser and prevents writes', async () => {
  for (const values of [{ salt: '??', protein: '2' }, { salt: '1', protein: '??' }]) {
    const f = createFixture();
    enter(f, 'combo', values);
    f.element(buttonId('combo')).click();
    await settle(f);
    assert.ok(f.state.writes.length === 0 && f.state.refreshes.length === 0, 'Invalid input has no write/refresh');
    assert.ok(f.state.console.some((entry) => entry.level === 'error'), 'Validation feedback retained');
  }
});

test('E1-GUARDS: synthetic invalid Number DOM checks C32 without changing its diagnosis', async () => {
  const f = createFixture();
  enter(f, 'water', { water: '??' }); // Real number input sanitizes this; VM-only defensive branch.
  f.element(buttonId('water')).click();
  await settle(f);
  assert.ok(f.state.writes.length === 0, 'Invalid Number DOM has no write');
  assert.ok(sinks(f.window).logger.some((line) => line.startsWith('[capture] blocked: invalid water value ')), 'C32 intentionally retained');
});

const vm = require('node:vm');
const { mainResetSource } = require('./diagnostics.test-support.cjs');

const e2Targets = {
  'F35-C02': ['[capture] refresh error ', 'read_failed'],
  'F35-C31': ['Capture intake load error:', 'read_failed'],
  'F35-X01': ['[sbSelect] REST ', 'read_failed'],
  'F35-X02': ['[medication] rpc fail ', 'medication_rpc_failed'],
  'F35-C06': ['[capture:med] batch error ', 'medication_action_failed'],
  'F35-C07': ['[capture:med] status toggle error', 'medication_action_failed'],
  'F35-C09': ['[capture:med] low-stock ack error', 'medication_action_failed'],
  'F35-C18': ['[capture:med] reorder follow-up load failed ', 'medication_load_failed'],
  'F35-C25': ['[capture:med] refresh error ', 'medication_load_failed'],
  'F35-C26': ['[capture] reset intake lookup failed ', 'reset_lookup_failed'],
  'F35-C29': ['[capture] reset intake error:', 'reset_failed'],
  'F35-X03': ['[capture] reset intake lookup failed ', 'reset_lookup_failed'],
  'F35-X04': ['[capture] reset intake error:', 'reset_failed'],
  'F35-C38': ['[capture] save error water:', 'intake_save_failed'],
  'F35-C42': ['[capture] save error salt+protein:', 'intake_save_failed']
};

function e2Outputs(f, ids, { feedback = false } = {}) {
  for (const [sink, lines] of Object.entries(sinks(f.window))) for (const id of ids) {
    const [prefix, marker] = e2Targets[id];
    const matches = lines.filter((line) => line.startsWith(prefix));
    assert.ok(matches.length > 0 && matches.every((line) => line.includes(marker)), `${id} ${sink}: fixed positive class`);
    assert.ok(matches.every((line) => !line.includes(f.state.canary) && !/\[object Object\]/.test(line)), `${id} ${sink}: bounded output`);
    if (id === 'F35-C07' || id === 'F35-C09') {
      assert.ok(matches.every((line) => !/E2_SLOT_ID|E2_MED_ID/.test(line)), `${id} ${sink}: no unnecessary ID`);
    }
  }
  // Negative oracle covers this controlled chain, not unrelated MIDAS logs.
  assert.ok(!JSON.stringify(f.state.console).includes(f.state.canary), 'E2 console: no raw message/details/code/status');
  assert.ok(!JSON.stringify(sinks(f.window)).includes(f.state.canary), 'E2 diagnostics: no raw error');
  assert.ok(!f.element('medDailyList').innerHTML.includes(f.state.canary), 'E2 medication error DOM bounded');
  const err = f.element('errBox');
  if (err) assert.ok(!err.textContent.includes(f.state.canary), 'E2 error DOM bounded');
  if (feedback) {
    assert.ok(err ? /fehlgeschlagen|nicht geladen|nicht.*zurückgesetzt|erneut/.test(err.textContent)
      : f.state.console.some((e) => e.level === 'error' && e.args[0] === '[uiError]'), 'E2 technical feedback remains visible');
  }
}

for (const errorDom of [true, false]) {
  test(`E2-READ C02/C31/X01 + SINK DOM=${errorDom}`, async () => {
    const f = createFixture({ e2: true, errorDom });
    f.state.readFail = true;
    await f.api.refreshCaptureIntake('fixture:read');
    assert.ok(!f.window.captureIntakeState.logged && !f.element('cap-intake-wrap').classList.contains('busy'), 'Read failure state/busy unchanged');
    assert.ok(f.state.writes.length === 0 && f.state.requests.length === 1, 'Read failure has one GET/no write');
    const url = new URL(f.state.requests[0].url);
    assert.ok(url.pathname === '/rest/v1/health_events' && url.searchParams.get('user_id') === 'eq.synthetic-user'
      && url.searchParams.get('day') === `eq.${f.state.day}` && url.searchParams.get('limit') === '1', 'Original read query');
    e2Outputs(f, ['F35-C02', 'F35-C31', 'F35-X01'], { feedback: true });
  });

  for (const mode of ['slot', 'undo', 'batch', 'ack', 'followup', 'refresh']) {
    test(`E2-MED ${mode} + X02/SINK DOM=${errorDom}`, async () => {
      const f = createFixture({ e2: true, errorDom });
      await f.api.refreshCaptureIntake('fixture:seed');
      await settle(f);
      f.window.diag.clear();
      f.state.console.length = 0;
      const start = f.state.requests.length;
      const spec = {
        slot: ['medDailyList', { 'data-med-slot-id': 'E2_SLOT_ID', 'data-med-slot-taken': '0' }, 'med_confirm_slot_v2', 'F35-C07'],
        undo: ['medDailyList', { 'data-med-slot-id': 'E2_SLOT_ID', 'data-med-slot-taken': '1' }, 'med_undo_slot_v2', 'F35-C07'],
        batch: ['medicationBatchActions', { 'data-med-batch-section': 'morning' }, 'med_confirm_slot_v2', 'F35-C06'],
        ack: ['medLowStockBox', { 'data-med-ack': 'E2_MED_ID', 'data-med-stock': '3' }, 'med_ack_low_stock_v2', 'F35-C09']
      }[mode];
      let button;
      if (spec) {
        f.state.failRpc = spec[2];
        button = f.medButton(spec[0], spec[1]);
        button.click();
        await settle(f);
        assert.ok(!button.disabled, 'Medication error restores busy button');
        const requests = f.state.requests.slice(start);
        assert.ok(requests.length === 1 && requests[0].method === 'POST', 'Exactly one failed medication RPC');
        equal(requests[0].body, mode === 'ack' ? { p_med_id: 'E2_MED_ID', p_day: f.state.day, p_stock_snapshot: 3 }
          : { p_slot_id: 'E2_SLOT_ID', p_day: f.state.day }, 'Original medication mutation payload');
        assert.ok(f.state.feedback.length === 0, 'No false success feedback');
        e2Outputs(f, [spec[3], 'F35-X02'], { feedback: true });
      } else {
        f.state.failRpc = 'med_list_v2';
        f.window.AppModules.medication.invalidateMedicationCache();
        if (mode === 'followup') {
          const result = await f.api.startMedicationLowStockReorder({ dayIso: f.state.day });
          assert.ok(result.ok === false && result.reason === 'medication-load-failed'
            && result.replyText === 'Rezeptkontakt ist gerade nicht verfügbar.', 'Follow-up retains failure result; no mailto');
          e2Outputs(f, ['F35-C18', 'F35-X02']);
        } else {
          f.window.document.dispatchEvent(new f.window.CustomEvent('medication:changed', { detail: { dayIso: f.state.day } }));
          await settle(f);
          assert.ok(f.element('medDailyList').innerHTML.includes('Laden fehlgeschlagen.'), 'Medication failure placeholder');
          e2Outputs(f, ['F35-C25', 'F35-X02']);
        }
        assert.ok(f.state.requests.slice(start).filter((r) => r.method === 'POST').length === 1, 'One failed medication load; no mutation/retry');
      }
    });
  }

  for (const kind of ['water', 'combo']) for (const raw of [false, true]) {
    test(`E2-SAVE ${kind} raw=${raw} + SINK DOM=${errorDom}`, async () => {
      const f = createFixture({ e2: true, errorDom });
      f.state.saveFail = !raw;
      f.state.saveThrow = raw;
      enter(f, kind);
      f.element(buttonId(kind)).click();
      await settle(f);
      equal(f.window.captureIntakeState.totals, f.state.totals, 'Save failure preserves state');
      assert.ok(f.state.requests.length === 1 && f.state.refreshes.length === 0, 'One save attempt/no false refresh');
      assert.ok(!f.element(buttonId(kind)).disabled, 'Save failure releases busy');
      assert.ok(f.state.rawError.message === f.state.canary + ':message' && f.state.rawError.details === f.state.canary + ':details', 'Raw Error properties unchanged');
      e2Outputs(f, [kind === 'water' ? 'F35-C38' : 'F35-C42'], { feedback: true });
    });
  }
}

test('E2-CONSUMERS: direct Select/RPC success, original errors, properties and auth options', async () => {
  const f = createFixture({ e2: true });
  const options = { table: 'health_events', select: 'id', filters: [['type', 'eq.intake']], order: 'ts.desc', limit: 2, offset: 3 };
  const rows = await f.window.sbSelect(options);
  assert.ok(rows[0].id === 'synthetic-row', 'Select JSON result retained');
  const url = new URL(f.state.requests[0].url);
  assert.ok(url.searchParams.get('offset') === '3' && url.searchParams.get('select') === 'id', 'Select optional query retained');
  f.state.readFail = true;
  await assert.rejects(f.window.sbSelect(options), (e) => e.message === `REST health_events failed 500 - ${f.state.canary}`);
  f.state.readThrow = true;
  await assert.rejects(f.window.sbSelect(options), (e) => e === f.state.rawError, 'Select transport Error identity');
  const med = f.window.AppModules.medication;
  f.state.failRpc = 'med_list_v2';
  await assert.rejects(med.loadMedicationForDay(f.state.day), (e) => e.message === f.state.canary && e.code === 'medication_rpc_failed' && e.status === 500);
  f.state.medThrow = true;
  await assert.rejects(med._callMedicationRpc('med_list_v2'), (e) => e === f.state.rawError, 'RPC transport Error identity');
  assert.ok(f.state.authCalls.every((o) => o.maxAttempts === 2), 'Original maxAttempts preserved');
  f.state.logged = false;
  f.window.AppModules.supabase.supabaseState.authState = 'unauth';
  const count = f.state.requests.length;
  await assert.rejects(med._callMedicationRpc('med_list_v2'), (e) => e.code === 'medication_not_authenticated');
  assert.ok(f.state.requests.length === count, 'Medication auth guard no transport');
});

for (const implementation of ['module', 'main']) {
  test(`E2-RESET ${implementation}: retries, delays, rethrow, guards and real main day-change route`, async () => {
    const f = createFixture({ e2: true, errorDom: true });
    if (implementation === 'main') vm.runInContext(mainResetSource(), f.context);
    const reset = implementation === 'module' ? f.api.maybeResetIntakeForToday : f.window.maybeResetIntakeForToday;
    f.state.readThrow = true;
    await assert.rejects(reset(f.state.day), (e) => e === f.state.rawError, 'Original Error rethrow identity');
    assert.ok(f.state.requests.length === 3 && JSON.stringify(f.state.delays) === '[250,500]', 'Three lookups and 250/500 delays');
    assert.ok(f.state.writes.length === 0 && !f.window.AppModules.captureGlobals.getIntakeResetDoneFor(), 'Failed reset no write/no guard');
    e2Outputs(f, implementation === 'module' ? ['F35-C26', 'F35-C29'] : ['F35-X03', 'F35-X04'], { feedback: true });
    if (implementation === 'main') {
      f.state.requests.length = 0;
      await f.window.maybeRefreshForTodayChange({ force: true, source: 'midnight' });
      assert.ok(f.state.requests.length === 4, 'Actual main day-change route: 3 reset attempts + capture read');
      assert.ok(f.window.AppModules.captureGlobals.getLastKnownToday() === f.state.day, 'Original day-change postcondition');
      e2Outputs(f, ['F35-X03', 'F35-X04', 'F35-C31', 'F35-C02'], { feedback: true });
    }
    f.state.readThrow = false;
    const before = f.state.requests.length;
    await reset(f.state.day);
    assert.ok(f.state.writes.length === 0, 'Existing totals prevent zero write');
    assert.ok(f.window.AppModules.captureGlobals.getIntakeResetDoneFor() === f.state.day, 'Successful lookup sets day guard');
    await settle(f);
    const after = f.state.requests.length;
    await reset(f.state.day);
    assert.ok(f.state.requests.length === after && after > before, 'Day guard prevents duplicate lookup/write');
  });
}

for (const kind of ['water', 'combo']) test(`E2-CONSUMERS ${kind}: API details and caller payload remain original`, async () => {
  const f = createFixture({ e2: true });
  f.state.saveFail = true;
  const totals = { water_ml: 1049, salt_g: 1.65, protein_g: 37.83 };
  await assert.rejects(f.window.saveIntakeTotalsRpc({ dayIso: f.state.day, totals }),
    (e) => e.message === 'intake-rpc-failed' && e.details === f.state.canary && e.status === 500,
    'Original API message/details/status');
  f.state.requests.length = 0;
  enter(f, kind);
  f.element(buttonId(kind)).click();
  await settle(f);
  equal(f.state.requests[0].body, kind === 'water'
    ? { p_day: f.state.day, p_water_ml: 1049, p_salt_g: 1.23, p_protein_g: 24.56 }
    : { p_day: f.state.day, p_water_ml: 811, p_salt_g: 1.65, p_protein_g: 37.83 }, 'Original failed caller payload');
  e2Outputs(f, [kind === 'water' ? 'F35-C38' : 'F35-C42'], { feedback: true });
});

for (const mode of ['slot', 'undo', 'batch', 'ack']) {
  test(`E2-MED ${mode}: successful real listener retains mutation/reload and payload`, async () => {
    const f = createFixture({ e2: true });
    await f.api.refreshCaptureIntake('fixture:seed');
    await settle(f);
    f.state.requests.length = 0;
    const spec = mode === 'ack' ? ['medLowStockBox', { 'data-med-ack': 'E2_MED_ID', 'data-med-stock': '3' }, 'med_ack_low_stock_v2']
      : mode === 'batch' ? ['medicationBatchActions', { 'data-med-batch-section': 'morning' }, 'med_confirm_slot_v2']
      : ['medDailyList', { 'data-med-slot-id': 'E2_SLOT_ID', 'data-med-slot-taken': mode === 'undo' ? '1' : '0' }, mode === 'undo' ? 'med_undo_slot_v2' : 'med_confirm_slot_v2'];
    f.medButton(spec[0], spec[1]).click();
    await settle(f);
    const reloads = mode === 'ack' ? 1 : 2; // Slot/batch caller additionally invalidates after mutateAndReload.
    assert.ok(f.state.requests.length === 1 + reloads && f.state.requests[0].url.endsWith(spec[2])
      && f.state.requests.slice(1).every((r) => r.url.endsWith('med_list_v2')), 'One mutation and original reload count');
    equal(f.state.requests[0].body, mode === 'ack' ? { p_med_id: 'E2_MED_ID', p_day: f.state.day, p_stock_snapshot: 3 }
      : { p_slot_id: 'E2_SLOT_ID', p_day: f.state.day }, 'Original successful medication payload');
    assert.ok(!sinks(f.window).logger.some((line) => line.includes('code=medication_action_failed')), 'No false action error');
    // Caller catch must also bound freely supplied error codes/status and details.
    f.state.medThrow = true;
    f.medButton(spec[0], spec[1]).click();
    await settle(f);
    e2Outputs(f, [mode === 'ack' ? 'F35-C09' : mode === 'batch' ? 'F35-C06' : 'F35-C07'], { feedback: true });
    assert.ok(f.state.rawError.code === f.state.canary + ':code' && f.state.rawError.status === f.state.canary + ':status', 'Error code/status unmodified');
  });
}

for (const implementation of ['module', 'main']) {
  test(`E2-RESET ${implementation}: auth, zero write, failed write and persisted main guard`, async () => {
    const f = createFixture({ e2: true });
    if (implementation === 'main') vm.runInContext(mainResetSource(), f.context);
    const reset = implementation === 'module' ? f.api.maybeResetIntakeForToday : f.window.maybeResetIntakeForToday;
    f.state.logged = false;
    await reset(f.state.day);
    assert.ok(f.state.requests.length === 0, 'Unauth reset has no requests');
    f.state.logged = true;
    f.state.totals = { water_ml: 0, salt_g: 0, protein_g: 0 };
    f.state.saveThrow = true;
    await assert.rejects(reset(f.state.day), (e) => e === f.state.rawError, 'Reset failed save preserves original Error');
    assert.ok(!f.window.AppModules.captureGlobals.getIntakeResetDoneFor(), 'Failed write never sets success guard');
    e2Outputs(f, [implementation === 'module' ? 'F35-C29' : 'F35-X04'], { feedback: true });
    f.state.saveThrow = false;
    f.state.requests.length = 0;
    await reset(f.state.day);
    await settle(f);
    const writes = f.state.requests.filter((r) => r.url.endsWith('upsert_intake'));
    assert.ok(writes.length === 1, 'Exactly one zero write');
    equal(writes[0].body, { p_day: f.state.day, p_water_ml: 0, p_salt_g: 0, p_protein_g: 0 }, 'Original reset zero payload');
    if (implementation === 'main') {
      f.window.AppModules.captureGlobals.setIntakeResetDoneFor('');
      const count = f.state.requests.length;
      await reset(f.state.day);
      assert.ok(f.state.requests.length === count, 'Persisted main guard prevents duplicate write');
    }
  });
}
