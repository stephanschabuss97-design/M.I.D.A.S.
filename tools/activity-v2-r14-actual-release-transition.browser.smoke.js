'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const roots = Object.freeze({
  v21: process.env.R14_RELEASE_V21_ROOT,
  v22: process.env.R14_RELEASE_V22_ROOT,
  v23: process.env.R14_RELEASE_V23_ROOT
});
for (const [release, root] of Object.entries(roots)) {
  assert.ok(root && fs.statSync(root).isDirectory(), `${release} release root is missing`);
}

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

let activeRoot = roots.v21;
const mime = Object.freeze({
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
});

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const root = path.resolve(activeRoot);
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    response.statusCode = 400;
    response.end('bad path');
    return;
  }
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Service-Worker-Allowed', '/');
  response.setHeader('Content-Type', mime[path.extname(target).toLowerCase()] || 'application/octet-stream');
  fs.createReadStream(target)
    .on('error', () => {
      if (!response.headersSent) response.statusCode = 404;
      response.end('not found');
    })
    .pipe(response);
});

async function startControlled(page, base, root) {
  activeRoot = root;
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/service-worker.js');
    await navigator.serviceWorker.ready;
  });
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload({ waitUntil: 'networkidle' });
  }
  assert.equal(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), true);
}

async function installWaiting(page, root) {
  activeRoot = root;
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
  });
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting));
}

async function inspectRelease(page, version, v2Expected) {
  await page.waitForFunction(() => Boolean(window.AppModules?.supabase));
  if (v2Expected) {
    await page.waitForFunction(() => Boolean(window.AppModules?.activityV2?.productController));
  }
  const state = await page.evaluate(() => ({
    controllerIsActive: navigator.serviceWorker.controller ===
      (window.__r14Registration || null)?.active,
    registration: null,
    v2Scripts: [...document.scripts]
      .map((script) => script.getAttribute('src'))
      .filter((src) => src?.includes('/activity/v2/') && !src.includes('activity-consumer')),
    v1WriterScripts: [...document.scripts]
      .map((script) => script.getAttribute('src'))
      .filter((src) => src?.includes('/activity/index.js')),
    supabaseUrls: performance.getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => url.includes('/app/supabase/') || url.includes('/assets/js/boot-auth.js'))
  }));
  state.registration = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      controllerIsActive: navigator.serviceWorker.controller === registration.active,
      waiting: Boolean(registration.waiting)
    };
  });
  assert.equal(state.registration.controllerIsActive, true);
  assert.equal(state.registration.waiting, true);
  assert.equal(state.v2Scripts.length, v2Expected ? 15 : 0);
  assert.equal(state.v1WriterScripts.length, v2Expected ? 0 : 1);
  assert.ok(state.supabaseUrls.every((url) => new URL(url).search === `?v=${version}`));
  assert.equal(new Set(state.supabaseUrls.map((url) => new URL(url).pathname)).size,
    supabaseGraph.length);
}

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  try {
    const staleContext = await browser.newContext({ serviceWorkers: 'allow' });
    const stalePage = await staleContext.newPage();
    await startControlled(stalePage, base, roots.v21);
    await installWaiting(stalePage, roots.v22);
    await stalePage.goto(`${base}?transition=v21-v22`, { waitUntil: 'networkidle' });
    await inspectRelease(stalePage, '22', true);
    await staleContext.close();

    const rollbackContext = await browser.newContext({ serviceWorkers: 'allow' });
    const rollbackPage = await rollbackContext.newPage();
    await startControlled(rollbackPage, base, roots.v22);
    await installWaiting(rollbackPage, roots.v23);
    await rollbackPage.goto(`${base}?transition=v22-v23`, { waitUntil: 'networkidle' });
    await inspectRelease(rollbackPage, '23', false);
    await rollbackContext.close();

    const offlineContext = await browser.newContext({ serviceWorkers: 'allow' });
    const offlinePage = await offlineContext.newPage();
    await startControlled(offlinePage, base, roots.v22);
    await offlinePage.waitForFunction(() => Boolean(window.AppModules?.activityV2?.productController));
    await offlineContext.setOffline(true);
    await offlinePage.reload({ waitUntil: 'networkidle' });
    await offlinePage.waitForFunction(() => Boolean(window.AppModules?.activityV2?.productController));
    const offlineUrls = await offlinePage.evaluate(() => performance.getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => url.includes('/app/supabase/') || url.includes('/assets/js/boot-auth.js')));
    assert.ok(offlineUrls.every((url) => new URL(url).search === '?v=22'));
    assert.equal(new Set(offlineUrls.map((url) => new URL(url).pathname)).size,
      supabaseGraph.length);
    await offlineContext.close();

    process.stdout.write(
      'R14_ACTUAL_RELEASE_TRANSITION_PASS stale_v21_v22=1 rollback_v22_v23=1 fresh_v22_offline=1\n'
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  server.close();
  process.exitCode = 1;
});
