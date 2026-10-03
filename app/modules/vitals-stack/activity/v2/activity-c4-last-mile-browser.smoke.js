'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const BASE =
  'http://127.0.0.1:8766/app/modules/vitals-stack/activity/v2/activity-product-last-mile-harness.html';
const executablePath = process.env.MIDAS_BROWSER_EXECUTABLE || [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((candidate) => fs.existsSync(candidate));

async function runCase(browser, name, viewport, manualTap) {
  const context = await browser.newContext({ viewport, hasTouch: viewport.width === 390 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  try {
    await page.goto(`${BASE}?mode=${name}&autorun=1${manualTap ? '&manual=1' : ''}`, {
      waitUntil: 'networkidle'
    });
    if (manualTap) {
      const toggle = page.locator('[data-action="toggle-protein-relevance"]');
      await toggle.waitFor();
      if (viewport.width === 390) await toggle.tap();
      else await toggle.click();
      await page.locator('[data-action="toggle-protein-relevance"][aria-pressed="true"]').waitFor();
      const finish = page.locator('[data-action="finish"]');
      if (viewport.width === 390) await finish.tap();
      else await finish.click();
    }
    await page.locator('#harness-status[data-result="pass"]').waitFor({ timeout: 15000 });
    assert.deepEqual(errors, []);
    assert.match(await page.title(), /PASS$/);
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    await runCase(browser, 'success', { width: 1280, height: 720 }, true);
    await runCase(browser, 'success', { width: 390, height: 844 }, true);
    await runCase(browser, 'unknown', { width: 390, height: 844 }, false);
    await runCase(browser, 'recovery', { width: 390, height: 844 }, false);
    await runCase(browser, 'protein_error', { width: 390, height: 844 }, false);
    process.stdout.write('C4_LAST_MILE_PASS desktop_tap=1 mobile_tap=1 frozen_retry=1 reload_recovery=1 protein_transport=1 protein_retry=1\n');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
