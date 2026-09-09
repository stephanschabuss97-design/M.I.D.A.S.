'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8766/?r14=v24';
const sensitiveConsolePattern = /(?:\b(?:uid|user_id|day|id|payload|water_ml|salt_g|protein_g|sys|dia)\s*=|\b(?:health_events|request[_-]?id)\b)/i;
const intakeApiDiagnosticPattern = /(?:loadIntakeToday|\[intake\] (?:POST|cleanup))/i;
const supabaseGraph = Object.freeze([
  'app/supabase/index.js',
  'app/supabase/core/state.js',
  'app/supabase/core/client.js',
  'app/supabase/core/http.js',
  'app/supabase/auth/index.js',
  'app/supabase/auth/core.js',
  'app/supabase/auth/ui.js',
  'app/supabase/auth/guard.js',
  'app/supabase/realtime/index.js',
  'app/supabase/api/intake.js',
  'app/supabase/api/vitals.js',
  'app/supabase/api/notes.js',
  'app/supabase/api/select.js',
  'app/supabase/api/push.js',
  'app/supabase/api/system-comments.js',
  'app/supabase/api/trendpilot.js',
  'app/supabase/api/reports.js',
  'assets/js/boot-auth.js'
]);
const browserExecutable = process.env.MIDAS_BROWSER_EXECUTABLE || [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((candidate) => fs.existsSync(candidate));

(async () => {
  const browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  const pageErrors = [];
  let sensitiveConsoleHits = 0;
  let intakeApiSensitiveConsoleHits = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (!sensitiveConsolePattern.test(text)) return;
    sensitiveConsoleHits += 1;
    if (intakeApiDiagnosticPattern.test(text)) intakeApiSensitiveConsoleHits += 1;
  });
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(window.AppModules?.activityV2?.productController));
    const state = await page.evaluate(async () => {
      const v2Scripts = [...document.scripts]
        .map((script) => script.getAttribute('src'))
        .filter((src) => src?.includes('/activity/v2/') && !src.includes('activity-consumer'));
      const overlayIds = [
        'activityV2SessionHost',
        'activityV2HistoryHost',
        'activityV2ExportHost'
      ];
      const worker = await (await fetch('service-worker.js', { cache: 'no-store' })).text();
      const registration = await navigator.serviceWorker.register('service-worker.js');
      await navigator.serviceWorker.ready;
      const cacheKeys = await caches.keys();
      const shell = await caches.open('midas-shell-v24');
      const shellUrls = (await shell.keys()).map((request) => request.url);
      return {
        v2Scripts,
        v1WriterScripts: [...document.scripts]
          .map((script) => script.getAttribute('src'))
          .filter((src) => src?.includes('/activity/index.js')),
        appCss: document.querySelector('link[href^="app/app.css"]')?.getAttribute('href'),
        overlayParents: overlayIds.map((id) => ({
          id,
          parent: document.getElementById(id)?.parentElement?.tagName,
          transformedAncestor: Boolean(document.getElementById(id)?.closest('.hub-panel'))
        })),
        cacheKeys,
        shellUrls,
        supabaseResourceUrls: performance.getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter((url) => url.includes('/app/supabase/') || url.includes('/assets/js/boot-auth.js')),
        workerV24: worker.includes("const CACHE_VERSION = 'v24';"),
        lifecyclePreflight: typeof window.AppModules.activityV2.productLifecycle?.preflightSessionCommit
      };
    });
    assert.equal(state.v2Scripts.length, 15);
    assert.ok(state.v2Scripts.every((src) => src.endsWith('?v=24')));
    assert.deepEqual(state.v1WriterScripts, []);
    assert.equal(state.appCss, 'app/app.css?v=24');
    assert.ok(state.overlayParents.every((entry) => entry.parent === 'BODY'));
    assert.ok(state.overlayParents.every((entry) => entry.transformedAncestor === false));
    assert.equal(state.workerV24, true);
    assert.equal(state.lifecyclePreflight, 'function');
    assert.ok(state.cacheKeys.includes('midas-shell-v24'));
    assert.ok(state.supabaseResourceUrls.length >= supabaseGraph.length);
    assert.ok(state.supabaseResourceUrls.every((url) => new URL(url).search === '?v=24'));
    assert.equal(new Set(state.supabaseResourceUrls.map((url) => new URL(url).pathname)).size,
      supabaseGraph.length);
    for (const relativePath of supabaseGraph) {
      assert.ok(state.shellUrls.some((url) => url.endsWith(`/${relativePath}?v=24`)), relativePath);
    }
    for (const suffix of [
      '/app/app.css?v=24',
      '/app/modules/vitals-stack/activity/v2/session-shell.js?v=24',
      '/app/modules/vitals-stack/activity/v2/activity-product-controller.js?v=24',
      '/app/supabase/index.js?v=24',
      '/app/modules/doctor-stack/charts/index.js?v=24',
      '/assets/js/main.js?v=24'
    ]) {
      assert.ok(state.shellUrls.some((url) => url.endsWith(suffix)), suffix);
    }
    assert.deepEqual(pageErrors, []);
    assert.equal(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), true);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(window.AppModules?.activityV2?.productController));
    const offlineState = await page.evaluate(() => ({
      controlled: Boolean(navigator.serviceWorker.controller),
      v2Scripts: [...document.scripts]
        .map((script) => script.getAttribute('src'))
        .filter((src) => src?.includes('/activity/v2/') && !src.includes('activity-consumer')),
      v1WriterScripts: [...document.scripts]
        .map((script) => script.getAttribute('src'))
        .filter((src) => src?.includes('/activity/index.js')),
      supabaseResourceUrls: performance.getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => url.includes('/app/supabase/') || url.includes('/assets/js/boot-auth.js'))
    }));
    assert.equal(offlineState.controlled, true);
    assert.equal(offlineState.v2Scripts.length, 15);
    assert.ok(offlineState.v2Scripts.every((src) => src.endsWith('?v=24')));
    assert.deepEqual(offlineState.v1WriterScripts, []);
    assert.ok(offlineState.supabaseResourceUrls.every((url) => new URL(url).search === '?v=24'));
    assert.equal(new Set(offlineState.supabaseResourceUrls.map((url) => new URL(url).pathname)).size,
      supabaseGraph.length);
    assert.deepEqual(pageErrors, []);
    assert.equal(
      intakeApiSensitiveConsoleHits,
      0,
      `intake_api_sensitive_console_hits=${intakeApiSensitiveConsoleHits}`
    );
    process.stdout.write(
      `R14_LOCAL_V24_PRODUCT_BROWSER_PASS fresh_online=1 fresh_offline=1 ` +
      `intake_api_sensitive_console_hits=0 shared_sensitive_console_hits=${sensitiveConsoleHits}\n`
    );
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
