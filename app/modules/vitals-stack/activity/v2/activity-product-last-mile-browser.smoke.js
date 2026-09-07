'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const BASE =
  'http://127.0.0.1:8766/app/modules/vitals-stack/activity/v2/activity-product-last-mile-harness.html';
const browserExecutable = process.env.MIDAS_BROWSER_EXECUTABLE || [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((candidate) => fs.existsSync(candidate));

async function openAged(browser, viewport, hasTouch = false) {
  const context = await browser.newContext({ viewport, hasTouch });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(`${BASE}?mode=aged&autorun=1`, { waitUntil: 'networkidle' });
  await page.locator('#harness-status[data-result="pass"]').waitFor();
  assert.equal(await page.title(), 'Activity V2 Last Mile · AGED · PASS');
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(pageErrors, []);
  return { context, page };
}

async function inspectReachability(page) {
  return page.locator('[data-action="finish"]').evaluate((button) => {
    const shell = button.closest('.activity-v2-session-shell');
    const content = shell.querySelector('.activity-v2-session-content');
    content.scrollTop = content.scrollHeight;
    const box = button.getBoundingClientRect();
    return {
      shellParent: shell.parentElement.id,
      transformedAncestor: Boolean(shell.closest('.transformed-product-surface')),
      scrollable: content.scrollHeight > content.clientHeight,
      buttonTop: box.top,
      buttonBottom: box.bottom,
      viewportHeight: innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth
    };
  });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: browserExecutable,
    headless: true
  });
  try {
    const viewports = [
      { name: 'desktop', width: 1280, height: 720, input: 'mouse' },
      { name: 'small-desktop', width: 960, height: 640, input: 'keyboard' },
      { name: '390x844', width: 390, height: 844, input: 'touch' },
      { name: '320x800', width: 320, height: 800, input: 'touch' }
    ];
    for (const viewport of viewports) {
      const { context, page } = await openAged(
        browser,
        { width: viewport.width, height: viewport.height },
        viewport.input === 'touch'
      );
      const result = await inspectReachability(page);
      assert.equal(result.shellParent, 'activity-v2-session-host');
      assert.equal(result.transformedAncestor, false);
      assert.equal(result.scrollable, true);
      assert.ok(result.buttonTop >= 0, `${viewport.name}: finish above viewport`);
      assert.ok(result.buttonBottom <= result.viewportHeight, `${viewport.name}: finish below viewport`);
      assert.equal(result.horizontalOverflow, false);
      const finish = page.locator('[data-action="finish"]');
      if (viewport.input === 'touch') await finish.tap();
      else if (viewport.input === 'keyboard') {
        await finish.focus();
        await page.keyboard.press('Enter');
      } else await finish.click();
      await page.locator('.activity-v2-session-commit-status[data-tone="error"]').waitFor();
      await context.close();
    }
    process.stdout.write('R14_LAST_MILE_BROWSER_AGED_VIEWPORT_PASS 4/4\n');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
