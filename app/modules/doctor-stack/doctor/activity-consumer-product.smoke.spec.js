'use strict';

const { test, expect } = require('playwright/test');
const fs = require('node:fs');

const BASE = 'http://127.0.0.1:8767/app/modules/doctor-stack/doctor/activity-consumer-product-harness.html';
const browserExecutable = process.env.MIDAS_BROWSER_EXECUTABLE || [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((candidate) => fs.existsSync(candidate));
test.use({ launchOptions: browserExecutable ? { executablePath: browserExecutable } : {} });

async function openHarness(page, mode, viewport) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}?mode=${mode}`, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('MIDAS R13 Doctor Activity Product Harness');
  await page.waitForFunction(() => Boolean(window.__midasR13ProductHarness));
  await expect(page.getByRole('heading', { name: 'Aktueller Bericht' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return { consoleErrors, pageErrors };
}

async function assertTouchTargets(page) {
  const sizes = await page.locator('.activity-consumer-delete:visible').evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { label: node.textContent || node.getAttribute('data-role'), width: box.width, height: box.height };
    })
  );
  sizes.forEach((size) => {
    expect(size.width, `${size.label} width`).toBeGreaterThanOrEqual(44);
    expect(size.height, `${size.label} height`).toBeGreaterThanOrEqual(44);
  });
}

test('T-ACT-R13-03 1280 fresh is report-first, lazy and source-safe', async ({ page }) => {
  const errors = await openHarness(page, 'ready', { width: 1280, height: 900 });
  await expect(page.locator('[data-role="report"]')).toContainText('Aktive Tage/Woche: 2');
  expect(await page.evaluate(() => window.__midasR13ProductHarness.getRpcCalls())).toBe(0);
  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.locator('.activity-consumer-row')).toHaveCount(3);
  expect(await page.evaluate(() => window.__midasR13ProductHarness.getRpcCalls())).toBe(1);
  await expect(page.locator('[data-source="activity_v2"] [data-action="delete-v1"]')).toHaveCount(0);
  await expect(page.locator('[data-source="activity_v1"] [data-action="delete-v1"]')).toHaveCount(1);
  await page.locator('[data-source="activity_v1"] [data-action="delete-v1"]').click();
  await expect(page.locator('.activity-consumer-row')).toHaveCount(2);
  expect(await page.evaluate(() => window.__midasR13ProductHarness.getDeleteCalls())).toBe(1);
  await assertTouchTargets(page);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R13-03 390 fences stale ranges, closes, and clears on logout', async ({ page }) => {
  const errors = await openHarness(page, 'stale', { width: 390, height: 844 });
  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.locator('[data-role="root"]')).toHaveAttribute('data-consumer-state', 'loading');
  await page.locator('[data-role="from"]').fill('2026-08-18');
  await expect(page.locator('[data-role="root"]')).toHaveAttribute('data-consumer-state', 'ready');
  expect(await page.evaluate(() => window.__midasR13ProductHarness.getRpcCalls())).toBe(2);
  await page.getByRole('button', { name: 'Einzelwerte schließen' }).click();
  await expect(page.locator('[data-role="details"]')).toBeHidden();
  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page.locator('[data-role="root"]')).toHaveAttribute('data-consumer-state', 'locked');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R13-03 320 handles empty, error, and all-or-error V3', async ({ page }) => {
  let errors = await openHarness(page, 'empty', { width: 320, height: 800 });
  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.locator('.activity-consumer-message')).toContainText('Keine Trainingseinträge im Zeitraum.');
  await page.getByRole('button', { name: 'V3-Export prüfen' }).click();
  await expect(page.locator('[data-role="export-status"]')).toHaveAttribute('data-state', 'ready');
  expect(await page.evaluate(() => window.__midasR13ProductHarness.getLastExport().schema_version))
    .toBe('midas.health-export.v3');
  expect(await page.evaluate(() => window.__midasR13ProductHarness.getDownloads())).toBe(0);
  await assertTouchTargets(page);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = await openHarness(page, 'error', { width: 320, height: 800 });
  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.getByRole('alert')).toHaveText('Training konnte nicht geladen werden.');
  await page.getByRole('button', { name: 'V3-Export prüfen' }).click();
  await expect(page.locator('[data-role="export-status"]')).toHaveAttribute('data-state', 'error');
  expect(await page.evaluate(() => window.__midasR13ProductHarness.getLastExport())).toBeNull();
  expect(await page.locator('a[download]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R13-03 fresh install activates the complete v7 product shell', async ({ page }) => {
  const errors = await openHarness(page, 'ready', { width: 1280, height: 900 });
  const cacheState = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    await navigator.serviceWorker.ready;
    await new Promise((resolve) => setTimeout(resolve, 250));
    return await caches.keys();
  });
  expect(cacheState).toContain('midas-shell-v7');
  expect(cacheState.filter((key) => key.startsWith('midas-shell-'))).toEqual(['midas-shell-v7']);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R13-03 v6 upgrade activates only the v7 shell and caches product readers', async ({ page }) => {
  const errors = await openHarness(page, 'ready', { width: 1280, height: 900 });
  const cacheState = await page.evaluate(async () => {
    const old = await caches.open('midas-shell-v6');
    await old.put('/r13-old-shell', new Response('old'));
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    await navigator.serviceWorker.ready;
    await new Promise((resolve) => setTimeout(resolve, 250));
    const keys = await caches.keys();
    const shell = await caches.open('midas-shell-v7');
    const urls = (await shell.keys()).map((request) => new URL(request.url).pathname);
    return { keys, urls };
  });
  expect(cacheState.keys).toContain('midas-shell-v7');
  expect(cacheState.keys).not.toContain('midas-shell-v6');
  [
    '/app/modules/vitals-stack/activity/v2/activity-consumer.js',
    '/app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js',
    '/app/modules/doctor-stack/doctor/activity-consumer-view.js',
    '/app/modules/doctor-stack/doctor/health-export-v3.js',
    '/app/modules/doctor-stack/reports/index.js',
    '/app/modules/doctor-stack/doctor/index.js'
  ].forEach((asset) => expect(cacheState.urls).toContain(asset));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
