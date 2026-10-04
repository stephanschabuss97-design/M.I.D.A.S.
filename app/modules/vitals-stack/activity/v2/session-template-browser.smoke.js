'use strict';
// T04/T05: one isolated UI wave, no real Auth/SQL/health transport.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { chromium } = require('playwright');
const project = path.resolve(__dirname, '../../../../..');
const screenshots = path.join(os.tmpdir(), 'midas-r15-qa-' + Date.now());
const template = { schema_version: 'midas.activity-session-template.v1', catalog_version: 2,
  name: '<b>Einheit ä</b>', items: [{ item_order: 1, item_key: 'leg_curl' }] };
const executablePath = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);

async function choose(page, contents) {
  const chooserPromise = page.waitForEvent('filechooser');
  await page.locator('[data-action="import-template"]').click();
  const chooser = await chooserPromise;
  await chooser.setFiles({ name: 'einheit.json', mimeType: 'application/json', buffer: Buffer.from(contents) });
}
async function state(page, expected) {
  await page.waitForFunction(value => window.__r15Harness?.state().state === value, expected);
}
async function closeSession(page) {
  await page.locator('[data-action="close"]').click();
  await state(page, 'idle');
}
async function runViewport(browser, url, viewport) {
  const context = await browser.newContext({ viewport, hasTouch: viewport.width === 390 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  try {
    await page.goto(url);
    await page.waitForFunction(() => window.__r15Harness?.ready);
    assert.match(await page.title(), /Activity V2 Product Last-Mile Harness/);
    assert.ok(await page.locator('h1').count());
    assert.equal(await page.locator('nextjs-portal, vite-error-overlay').count(), 0);
    await page.locator('[data-action="load-last-template"]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-action="load-last-template"]').isDisabled(), true);

    // Invalid and cancelled real file gestures do not start a session.
    await choose(page, '{');
    await page.locator('.activity-v2-product-template-status').filter({ hasText: 'ungültig' }).waitFor();
    assert.equal(await page.evaluate(() => window.__r15Harness.snapshot()), null);
    const cancelling = page.waitForEvent('filechooser');
    await page.locator('[data-action="import-template"]').click();
    await (await cancelling).setFiles([]);
    await page.waitForFunction(() => !document.querySelector('[data-action="import-template"]').disabled);
    assert.equal(await page.evaluate(() => window.__r15Harness.snapshot()), null);

    await choose(page, JSON.stringify(template));
    await state(page, 'editing');
    const original = await page.evaluate(() => window.__r15Harness.snapshot());
    assert.equal(original.protein_target_relevant, true);
    assert.equal(original.items[0].sets[0].reps, null);
    assert.equal(original.items[0].sets[0].weight_kg, null);
    assert.equal(original.note, null);
    await page.locator('[data-role="template-origin"]').filter({ hasText: template.name }).waitFor();
    assert.equal(await page.locator('[data-role="template-origin"] b').count(), 0, 'name remains text');
    await page.waitForFunction(() => !document.querySelector('[data-action="load-last-template"]').disabled);
    await page.screenshot({ path: path.join(screenshots, `import-${viewport.width}.png`) });

    if (viewport.width === 390) {
      // Actual Recovery reload preserves identity. The cache remains independent.
      await page.reload();
      await page.waitForFunction(() => window.__r15Harness?.ready);
      await state(page, 'recoverable');
      await page.locator('[data-action="continue-session"]').click();
      await state(page, 'editing');
      const recovered = await page.evaluate(() => window.__r15Harness.snapshot());
      assert.equal(recovered.request_id, original.request_id);
      assert.equal(recovered.started_at, original.started_at);
      assert.deepEqual(recovered.items, original.items);
      await closeSession(page);
      await page.waitForFunction(() => !document.querySelector('[data-action="load-last-template"]').disabled);
      await context.setOffline(true);
      await page.locator('[data-action="load-last-template"]').click();
      await state(page, 'editing');
      assert.equal((await page.evaluate(() => window.__r15Harness.snapshot())).items[0].sets[0].reps, null);
      assert.equal((await page.evaluate(() => window.__r15Harness.requests())).length, 0);
      await context.setOffline(false);
    }

    // User input and real finish listener reach the unchanged normal transport.
    await page.locator('[data-item-key="leg_curl"][data-field-key="reps"]').first().fill('8');
    await page.locator('[data-item-key="leg_curl"][data-field-key="weight_kg"]').first().fill('30');
    await page.locator('[data-action="finish"]').click();
    await state(page, 'committed');
    const requests = await page.evaluate(() => window.__r15Harness.requests());
    assert.equal(requests.length, 1);
    assert.equal(requests[0].p_payload.items[0].sets[0].reps, 8);
    assert.equal(requests[0].p_payload.protein_target_relevant, true);
    const markers = await page.evaluate(() => window.__r15Harness.markers());
    for (const marker of ['click_received', 'finish_invoked', 'preparing_published', 'intent_created', 'transport_attempted']) assert.ok(markers.includes(marker), marker);
    await closeSession(page);
    await page.waitForFunction(() => !document.querySelector('[data-action="load-last-template"]').disabled);
    await page.locator('[data-action="load-last-template"]').click();
    await state(page, 'editing');
    assert.equal((await page.evaluate(() => window.__r15Harness.snapshot())).items[0].sets[0].reps, null, 'cache never adopts actual performance');
    await closeSession(page);
    if (viewport.width === 390) {
      await page.setViewportSize({ width: 320, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '320px entry does not overflow');
      await page.screenshot({ path: path.join(screenshots, 'entry-320.png') });
    }
    assert.deepEqual(errors, []);
    return { viewport, identity: 'PASS', content: 'PASS', overlay: 'PASS', console: 'PASS',
      fileGesture: 'PASS', normalTransport: 'PASS', cacheIndependent: 'PASS', recoveryOffline: viewport.width === 390 ? 'PASS' : 'NOT_REQUIRED' };
  } finally { await context.close(); }
}

(async () => {
  fs.mkdirSync(screenshots, { recursive: true });
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
    const target = path.resolve(project, relative);
    if (!target.startsWith(project + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', target.endsWith('.js') ? 'text/javascript' : target.endsWith('.css') ? 'text/css' : 'text/html');
    fs.createReadStream(target).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const url = `http://127.0.0.1:${server.address().port}/app/modules/vitals-stack/activity/v2/activity-product-last-mile-harness.html?mode=r15&autorun=1`;
    const results = [];
    for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) results.push(await runViewport(browser, url, viewport));
    console.log(JSON.stringify({ result: 'PASS', url, results, screenshots, browserPlugin: 'ABSENT' }));
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
