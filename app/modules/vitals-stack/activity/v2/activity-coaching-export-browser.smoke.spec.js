'use strict';

const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const BASE =
  'http://127.0.0.1:8766/app/modules/vitals-stack/activity/v2/activity-coaching-export-harness.html';

const browserExecutable = process.env.MIDAS_BROWSER_EXECUTABLE || [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((candidate) => fs.existsSync(candidate));
test.use({ launchOptions: browserExecutable ? { executablePath: browserExecutable } : {} });
const screenshotPath = (name) => path.join(os.tmpdir(), name);

async function openHarness(page, mode, viewport) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}?mode=${mode}`, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Activity V2 Export – isolierter Test');
  await expect(page.getByRole('heading', { name: 'Aktivitätsdaten exportieren' })).toBeVisible();
  await page.waitForFunction(() => Boolean(window.__midasActivityV2R10Harness));
  await expect(page.locator('body')).not.toBeEmpty();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return { consoleErrors, pageErrors };
}

async function assertTouchTargets(page) {
  const sizes = await page.locator('button:visible, a.download:visible, .preset-option span:visible, input[type="date"]:visible').evaluateAll(
    (nodes) => nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { text: node.textContent || node.getAttribute('data-role'), width: box.width, height: box.height };
    })
  );
  for (const size of sizes) {
    expect(size.width, `${size.text} width`).toBeGreaterThanOrEqual(44);
    expect(size.height, `${size.text} height`).toBeGreaterThanOrEqual(44);
  }
}

async function readDownload(page) {
  return await page.locator('[data-role="download"]').evaluate(async (anchor) => ({
    filename: anchor.download,
    value: JSON.parse(await (await fetch(anchor.href)).text()),
    href: anchor.href
  }));
}

test('T-ACT-R10-12 desktop default, three-month preset and downloadable JSON', async ({ page }) => {
  const errors = await openHarness(page, 'ready', { width: 1280, height: 900 });
  await expect(page.locator('[name="range-preset"][value="6"]')).toBeChecked();
  await page.getByRole('button', { name: 'Export laden' }).click();
  await expect(page.getByRole('link', { name: /JSON herunterladen/ })).toBeFocused();
  let download = await readDownload(page);
  expect(download.filename).toBe('midas-activity-coaching_2026-02-22_2026-08-22.json');
  expect(download.value.schema_version).toBe('midas.activity-coaching-export.v1');
  expect(download.value.completeness).toEqual({
    status: 'complete', truncated: false, session_count: 2, item_count: 3, set_count: 1
  });
  await page.locator('[name="range-preset"][value="3"]').check();
  await page.getByRole('button', { name: 'Export laden' }).click();
  download = await readDownload(page);
  expect(download.filename).toBe('midas-activity-coaching_2026-05-22_2026-08-22.json');
  const browserDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: /JSON herunterladen/ }).click();
  expect((await browserDownload).suggestedFilename()).toBe(download.filename);
  await expect(page.locator('[data-role="download"]')).toBeHidden();
  await assertTouchTargets(page);
  await page.screenshot({ path: screenshotPath('r10-export-desktop.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R10-12 390x844 error, focus and retry', async ({ page }) => {
  const errors = await openHarness(page, 'error', { width: 390, height: 844 });
  await page.keyboard.press('Tab');
  await expect(page.locator('[name="range-preset"][value="6"]')).toBeFocused();
  await page.getByRole('button', { name: 'Export laden' }).click();
  await expect(page.getByRole('button', { name: 'Erneut versuchen' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: /JSON herunterladen/ })).toBeFocused();
  expect((await readDownload(page)).value.completeness.session_count).toBe(2);
  await assertTouchTargets(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: screenshotPath('r10-export-390.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R10-12 320x800 custom empty export', async ({ page }) => {
  const errors = await openHarness(page, 'empty', { width: 320, height: 800 });
  await page.locator('[name="range-preset"][value="custom"]').check();
  await page.locator('[data-role="from"]').fill('2026-08-23');
  await page.locator('[data-role="to"]').fill('2026-08-22');
  await page.getByRole('button', { name: 'Export laden' }).click();
  await expect(page.locator('[data-role="status"]')).toContainText('ungültig');
  await expect(page.locator('[data-role="from"]')).toHaveValue('2026-08-23');
  await expect(page.locator('[data-role="to"]')).toHaveValue('2026-08-22');
  await page.locator('[data-role="from"]').fill('2026-06-01');
  await page.getByRole('button', { name: 'Export laden' }).click();
  await expect(page.locator('[data-role="status"]')).toContainText('Keine Sessions');
  const download = await readDownload(page);
  expect(download.filename).toBe('midas-activity-coaching_2026-06-01_2026-08-22.json');
  expect(download.value.sessions).toEqual([]);
  expect(download.value.quality).toEqual({
    status: 'no_data', cautions: ['no_sessions_in_range']
  });
  await assertTouchTargets(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: screenshotPath('r10-export-320.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
