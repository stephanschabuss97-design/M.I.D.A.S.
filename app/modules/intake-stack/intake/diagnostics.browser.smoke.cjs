'use strict';

// Original DOM/handlers/API, disposable providers. No production app/session.
const assert = require('node:assert/strict');
const { sources, e2Sources, mainResetSource, markup, installProviders, installE2Providers, checkEvents } = require('./diagnostics.test-support.cjs');
const { e3Sources, installE3Providers, runE3Scenario, e3Cases, checkE3 } = require('./diagnostics.test-support.cjs');

async function runE3() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  let externalRequests = 0;
  let scenarios = 0;
  const modes = [...Object.keys(e3Cases), 'ack-disabled', 'ack-unauth', 'ack-error',
    'reopen', 'followup-unauth', 'followup-missing'];
  try {
    for (const mode of modes.filter((m) => !process.env.E3_GROUP || (process.env.E3_GROUP === 'ack'
      ? m.startsWith('ack') : process.env.E3_GROUP === 'reorder'
        ? m.startsWith('start') || m.startsWith('confirm') || m === 'cancel'
        : m.startsWith('followup') || m === 'reopen'))) {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      try {
        await context.route('**/*', (route) => { externalRequests++; return route.abort(); });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', () => errors.push('pageerror'));
        await page.setContent(markup());
        await page.evaluate(installProviders);
        await page.evaluate(installE2Providers);
        await page.evaluate(installE3Providers);
        for (const source of e3Sources()) await page.addScriptTag({ content: source });
        const result = await page.evaluate(runE3Scenario, mode);
        checkE3(result);
        if (e3Cases[mode]) assert.ok((await page.locator('#diagLog').innerText()).includes(e3Cases[mode][1]), 'E3 real Touchlog DOM marker');
        assert.ok(errors.length === 0 && await page.url() === 'about:blank', 'No page error/navigation/protocol handoff');
        scenarios++;
      } finally { await context.close(); }
    }
    assert.ok(externalRequests === 0 && scenarios > 0, 'No external requests; selected E3 cases ran');
    process.stdout.write(`E3-BROWSER PASS scenarios=${scenarios} externalRequests=0 protocolHandoffs=0 browser=${browser.version()}\n`);
  } finally { await browser.close(); }
}

async function runE2() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  let externalRequests = 0;
  let scenarios = 0;
  const targets = {
    read: ['F35-C02/C31/X01', ['[capture] refresh error ', 'Capture intake load error:', '[sbSelect] REST '], 'read_failed'],
    slot: ['F35-C07/X02', ['[capture:med] status toggle error', '[medication] rpc fail '], 'medication_action_failed'],
    undo: ['F35-C07/X02', ['[capture:med] status toggle error', '[medication] rpc fail '], 'medication_action_failed'],
    batch: ['F35-C06/X02', ['[capture:med] batch error ', '[medication] rpc fail '], 'medication_action_failed'],
    ack: ['F35-C09/X02', ['[capture:med] low-stock ack error', '[medication] rpc fail '], 'medication_action_failed'],
    followup: ['F35-C18/X02', ['[capture:med] reorder follow-up load failed ', '[medication] rpc fail '], 'medication_load_failed'],
    refresh: ['F35-C25/X02', ['[capture:med] refresh error ', '[medication] rpc fail '], 'medication_load_failed'],
    water: ['F35-C38', ['[capture] save error water:'], 'intake_save_failed'],
    combo: ['F35-C42', ['[capture] save error salt+protein:'], 'intake_save_failed']
  };
  try {
    for (const errorDom of [true, false]) for (const mode of Object.keys(targets)) {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      try {
        await context.route('**/*', (route) => { externalRequests++; return route.abort(); });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', () => errors.push('pageerror'));
        // Medication containers are already part of the original extracted markup.
        await page.setContent(markup() + (errorDom ? '<div id="errBox"></div>' : ''));
        await page.evaluate(installProviders);
        await page.evaluate(installE2Providers);
        for (const source of e2Sources()) await page.addScriptTag({ content: source });
        await page.evaluate(async ({ mode }) => {
          captureIntakeState.totals = { ...__test.totals };
          captureIntakeState.logged = true;
          diag.init();
          AppModules.capture.bindIntakeCapture();
          const flush = async () => { for (let i = 0; i < 60; i++) await Promise.resolve(); };
          if (!['read', 'water', 'combo'].includes(mode)) {
            await AppModules.capture.refreshCaptureIntake('fixture:seed');
            await flush();
            if (mode === 'undo') document.querySelector('[data-med-slot-id]').setAttribute('data-med-slot-taken', '1');
          }
          diag.clear();
          __test.console.length = 0;
          __test.requests.length = 0;
          if (mode === 'read') {
            __test.readFail = true;
            await AppModules.capture.refreshCaptureIntake('fixture:read');
          } else if (mode === 'water' || mode === 'combo') {
            __test.saveFail = true;
            document.getElementById('cap-water-add').value = '237.6';
            document.getElementById('cap-salt-add').value = '0,42';
            document.getElementById('cap-protein-add').value = '13,27';
            document.getElementById(mode === 'water' ? 'cap-water-add-btn' : 'cap-salt-protein-btn').click();
          } else if (mode === 'followup' || mode === 'refresh') {
            AppModules.medication.invalidateMedicationCache();
            __test.failRpc = 'med_list_v2';
            if (mode === 'followup') __test.followup = await AppModules.capture.startMedicationLowStockReorder({ dayIso: __test.day });
            else document.dispatchEvent(new CustomEvent('medication:changed', { detail: { dayIso: __test.day } }));
          } else {
            __test.failRpc = mode === 'ack' ? 'med_ack_low_stock_v2' : mode === 'undo' ? 'med_undo_slot_v2' : 'med_confirm_slot_v2';
            const selector = mode === 'ack' ? '[data-med-ack]' : mode === 'batch' ? '[data-med-batch-section="morning"]' : '[data-med-slot-id]';
            const button = document.querySelector(selector);
            if (!button) throw new Error('Original rendered medication button missing');
            __test.actionButton = button;
            button.click();
          }
          await flush();
        }, { mode });
        const result = await page.evaluate(() => ({
          console: __test.console, requests: __test.requests, refreshes: __test.refreshes,
          errorText: document.getElementById('errBox')?.textContent || '',
          medText: document.getElementById('medDailyList').textContent,
          touchDom: document.getElementById('diagLog').textContent,
          buttonDisabled: __test.actionButton?.disabled || false,
          saveDisabled: document.getElementById('cap-water-add-btn').disabled || document.getElementById('cap-salt-protein-btn').disabled,
          totals: captureIntakeState.totals, followup: __test.followup,
          sinks: {
            touch: diag.lines.map((e) => e.base.replace(/^\[[^\]]+\] /, '').replace(/^\[(?:ERROR|WARN|INFO)\] /, '')),
            logger: AppModules.diagnosticsLayer.logger.history.map((e) => e.message),
            console: __test.console.filter((e) => e.args[0] === '[diagnostics/logger]').map((e) => e.args[1])
          }
        }));
        const [ids, prefixes, marker] = targets[mode];
        for (const [sink, lines] of Object.entries(result.sinks)) for (const prefix of prefixes) {
          const expected = prefix === '[medication] rpc fail ' ? 'medication_rpc_failed' : marker;
          assert.ok(lines.some((line) => line.startsWith(prefix) && line.includes(expected)), `E2-BROWSER ${ids} ${sink}: fixed positive marker`);
        }
        assert.ok(!JSON.stringify(result).includes('SYNTHETIC_E2_RAW_CANARY'), `E2-BROWSER ${ids}: all output sinks bounded`);
        assert.ok(result.touchDom.includes(marker), `E2-BROWSER ${ids}: real Touchlog DOM`);
        if (mode === 'slot' || mode === 'undo' || mode === 'ack') {
          const output = result.sinks.touch.filter((line) => line.startsWith(prefixes[0]));
          assert.ok(output.every((line) => !/E2_SLOT_ID|E2_MED_ID/.test(line)), `E2-BROWSER ${ids}: no IDs`);
        }
        if (['slot', 'undo', 'batch', 'ack', 'water', 'combo', 'read'].includes(mode)) {
          assert.ok(errorDom ? result.errorText.length > 0 : result.console.some((e) => e.args[0] === '[uiError]'), `E2-BROWSER ${ids}: feedback DOM/fallback`);
          assert.ok(!result.buttonDisabled && !result.saveDisabled, `E2-BROWSER ${ids}: busy released`);
        }
        const posts = result.requests.filter((r) => r.method === 'POST');
        assert.ok(posts.length === (mode === 'read' ? 0 : 1), `E2-BROWSER ${ids}: original transport count`);
        if (mode === 'water' || mode === 'combo') {
          assert.ok(result.refreshes.length === 0 && result.totals.water_ml === 811, 'Browser save failure preserves state/no refresh');
        }
        if (mode === 'followup') assert.ok(result.followup.ok === false && result.followup.reason === 'medication-load-failed', 'Original follow-up failure result');
        assert.ok(errors.length === 0, 'No uncaught browser errors');
        scenarios++;
      } finally { await context.close(); }
    }
    assert.ok(externalRequests === 0, 'No external requests/mailto actions');
    process.stdout.write(`E2-BROWSER PASS scenarios=${scenarios} externalRequests=0 browser=${browser.version()}\n`);
  } finally { await browser.close(); }
}

async function run() {
  const args = process.argv.slice(2);
  assert.ok(args.length === 2 && args[0] === '--suite' && ['e1', 'e2', 'e3'].includes(args[1]), 'Use --suite e1, e2 or e3');
  if (args[1] === 'e3') return runE3();
  if (args[1] === 'e2') return runE2();
  // Existing global Playwright via NODE_PATH; never install a project dependency.
  const { chromium } = require('playwright');
  const channel = process.env.E1_BROWSER_CHANNEL;
  const browser = await chromium.launch({ ...(channel ? { channel } : {}), headless: true });
  let externalRequests = 0;
  let scenarios = 0;
  try {
    for (const kind of ['water', 'combo']) for (const mode of ['success', 'error', 'busy', 'unauth', 'invalid']) {
      const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1000, height: 800 } });
      try {
        await context.route('**/*', (route) => { externalRequests++; return route.abort(); });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', () => errors.push('pageerror'));
        await page.setContent(markup());
        assert.ok(await page.title() === 'MIDAS E1 isolated fixture', 'Fixture identity');
        await page.evaluate(installProviders);
        for (const source of sources()) await page.addScriptTag({ content: source });
        await page.evaluate(async ({ mode }) => {
          captureIntakeState.totals = { ...__test.totals };
          captureIntakeState.logged = true;
          diag.init();
          AppModules.capture.bindIntakeCapture();
          if (mode === 'error') __test.status = 500;
          if (mode === 'busy') __test.hold = true;
          if (mode === 'unauth') {
            __test.logged = false;
            AppModules.supabase.supabaseState.authState = 'unauth';
            await AppModules.capture.refreshCaptureIntake('fixture:unauth');
          }
        }, { mode });
        const button = kind === 'water' ? '#cap-water-add-btn' : '#cap-salt-protein-btn';
        if (mode !== 'unauth') {
          if (kind === 'water') await page.locator('#cap-water-add').fill(mode === 'invalid' ? '' : '237.6');
          else {
            await page.locator('#cap-salt-add').fill(mode === 'invalid' ? '??' : '0,42');
            await page.locator('#cap-protein-add').fill('13,27');
          }
          await page.locator(button).click();
          if (mode === 'busy') {
            assert.ok(await page.locator(button).isDisabled(), 'In-flight button disabled');
            // HTMLElement.click respects disabled; no forced synthetic event bypass.
            await page.locator(button).evaluate((element) => element.click());
            assert.ok(await page.evaluate(() => __test.writes.length === 1 && __test.refreshes.length === 0), 'One in-flight transport');
            await page.evaluate(() => __test.release());
          }
        } else {
          assert.ok(await page.locator(button).isDisabled(), 'Unauth UI disabled');
          await page.locator(button).evaluate((element) => element.click());
        }
        await page.evaluate(async () => {
          for (let i = 0; i < 30; i++) await Promise.resolve();
          __test.advance(200);
        });
        const result = await page.evaluate(() => ({
          writes: __test.writes, refreshes: __test.refreshes,
          totals: captureIntakeState.totals,
          consoleErrors: __test.console.filter((e) => e.level === 'error').length,
          sinks: {
            touch: diag.lines.map((e) => e.base.replace(/^\[[^\]]+\] /, '')),
            logger: AppModules.diagnosticsLayer.logger.history.map((e) => e.message),
            console: __test.console.filter((e) => e.args[0] === '[diagnostics/logger]').map((e) => e.args[1])
          }
        }));
        if (mode === 'unauth' || (mode === 'invalid' && kind === 'combo')) {
          assert.ok(result.writes.length === 0 && result.refreshes.length === 0, 'Guard has no write/refresh');
          if (mode === 'invalid') assert.ok(result.consoleErrors > 0, 'Invalid combo feedback');
        } else if (mode === 'error') {
          assert.ok(result.writes.length === 1 && result.refreshes.length === 0 && result.consoleErrors > 0, 'Failure is visible without success refresh');
          assert.ok(JSON.stringify(result.totals) === JSON.stringify({ water_ml: 811, salt_g: 1.23, protein_g: 24.56 }), 'Failure preserves original totals');
          assert.ok(!await page.locator(button).isDisabled(), 'Error restores button');
        } else {
          // Empty number input is valid zero in the actual UI; C32 is VM-only.
          const expected = kind === 'water'
            ? { p_day: '2031-04-08', p_water_ml: mode === 'invalid' ? 811 : 1049, p_salt_g: 1.23, p_protein_g: 24.56 }
            : { p_day: '2031-04-08', p_water_ml: 811, p_salt_g: 1.65, p_protein_g: 37.83 };
          assert.ok(result.writes.length === 1 && JSON.stringify(result.writes[0].body) === JSON.stringify(expected), 'Original browser API payload/write count');
          assert.ok(result.refreshes.length === 1 && result.consoleErrors === 0, 'Success refresh and console health');
          assert.ok((await page.locator('[data-pill-kind="water"]').innerText()).includes(`${expected.p_water_ml} ml`), 'Original rendered water pill');
          assert.ok((await page.locator(button).innerText()).includes('gespeichert'), 'Rendered success feedback');
          await page.evaluate(() => __test.advance(1200));
          assert.ok(!await page.locator(button).isDisabled(), 'Success cooldown restores button');
        }
        if (mode !== 'unauth' && !(kind === 'combo' && mode === 'invalid')) {
          checkEvents(result.sinks, kind === 'water' ? ['F35-C34', 'F35-C35', 'F35-C36'] : ['F35-C39', 'F35-C40']);
          const renderedLog = await page.locator('#diagLog').innerText();
          assert.ok(renderedLog.includes('[capture] totals calculated'), 'Original Touchlog DOM updated');
        }
        assert.ok(errors.length === 0, 'No uncaught browser errors');
        scenarios++;
      } finally { await context.close(); }
    }
    assert.ok(externalRequests === 0, 'No external network requests');
    process.stdout.write(`E1-BROWSER PASS scenarios=${scenarios} externalRequests=0 browser=${browser.version()}\n`);
  } finally { await browser.close(); }
}

run().catch((error) => {
  // Assertions use explicit labels and boolean comparisons, never payload dumps.
  process.stderr.write(`DIAGNOSTICS-BROWSER FAIL: ${error.message}\n`);
  process.exitCode = 1;
});
