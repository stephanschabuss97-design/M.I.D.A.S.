'use strict';

const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const BASE =
  'http://127.0.0.1:8767/app/modules/doctor-stack/doctor/activity-consumer-harness.html';
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
  await expect(page).toHaveTitle('Doctor Activity Consumer - isolierter Test');
  await expect(page.getByRole('heading', { name: 'Arztbericht' })).toBeVisible();
  await page.waitForFunction(() => Boolean(window.__midasActivityConsumerHarness));
  await expect(page.locator('body')).not.toBeEmpty();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return { consoleErrors, pageErrors };
}

async function assertTouchTargets(page) {
  const sizes = await page.locator('button:visible, input:visible').evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { label: node.textContent || node.getAttribute('data-role'), width: box.width, height: box.height };
    })
  );
  for (const size of sizes) {
    expect(size.width, `${size.label} width`).toBeGreaterThanOrEqual(44);
    expect(size.height, `${size.label} height`).toBeGreaterThanOrEqual(44);
  }
}

test('T-ACT-R11-07 desktop is report-first, lazy and source-safe', async ({ page }) => {
  const errors = await openHarness(page, 'ready', { width: 1280, height: 900 });
  const report = page.locator('[data-role="report"]');
  await expect(report).toContainText('Aktive Tage/Woche: 2');
  await expect(report).toContainText('Gesamtdauer: 90 Min (Durchschnitt: 30 Min/Einheit)');
  await expect(report).not.toContainText(/Übung|Satz|Reps|Gewicht|Volumen|Empfehlung/i);
  expect(await page.evaluate(() => window.__midasActivityConsumerHarness.getCalls())).toBe(0);

  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.locator('.activity-consumer-row')).toHaveCount(3);
  expect(await page.evaluate(() => window.__midasActivityConsumerHarness.getCalls())).toBe(1);
  await expect(page.locator('.activity-consumer-row').first()).toHaveAttribute('data-source', 'activity_v2');
  await expect(page.locator('[data-source="activity_v2"] [data-action="delete-v1"]')).toHaveCount(0);
  await expect(page.locator('[data-source="activity_v1"] [data-action="delete-v1"]')).toHaveCount(1);

  await page.locator('[data-source="activity_v1"] [data-action="delete-v1"]').click();
  await expect(page.locator('.activity-consumer-row')).toHaveCount(2);
  expect(await page.evaluate(() => window.__midasActivityConsumerHarness.getDeletes())).toBe(1);
  await assertTouchTargets(page);
  await page.screenshot({ path: screenshotPath('r11-doctor-activity-desktop.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R11-07 390px fences stale range and clears on logout', async ({ page }) => {
  const errors = await openHarness(page, 'stale', { width: 390, height: 844 });
  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.locator('[data-role="root"]')).toHaveAttribute('data-state', 'loading');
  await page.locator('[data-role="from"]').fill('2026-08-18');
  await expect(page.locator('[data-role="root"]')).toHaveAttribute('data-state', 'ready');
  expect(await page.evaluate(() => window.__midasActivityConsumerHarness.getCalls())).toBe(2);
  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page.locator('[data-role="root"]')).toHaveAttribute('data-state', 'locked');
  await expect(page.locator('[data-role="panel"]')).toBeHidden();
  await assertTouchTargets(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: screenshotPath('r11-doctor-activity-390.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R11-07 320px empty and explicit partial error stay usable', async ({ page }) => {
  let errors = await openHarness(page, 'empty', { width: 320, height: 800 });
  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.locator('.activity-consumer-message')).toContainText(
    'Keine Trainingseinträge im Zeitraum.'
  );
  await assertTouchTargets(page);
  await page.screenshot({ path: screenshotPath('r11-doctor-activity-320-empty.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = await openHarness(page, 'error', { width: 320, height: 800 });
  await page.getByRole('button', { name: 'Einzelwerte anzeigen' }).click();
  await expect(page.getByRole('alert')).toHaveText('Training konnte nicht geladen werden.');
  await expect(page.locator('[data-role="status"]')).toContainText(
    'Einzelne Datenbereiche konnten nicht geladen werden.'
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R11-08 desktop builds the exact isolated V3 payload without a download seam', async ({ page }) => {
  const errors = await openHarness(page, 'ready', { width: 1280, height: 900 });
  expect(await page.evaluate(() => window.__midasActivityConsumerHarness.getExportAttempts())).toBe(0);

  await page.getByRole('button', { name: 'V3-Export prüfen' }).click();
  await expect(page.locator('[data-role="export-status"]')).toHaveAttribute(
    'data-export-state',
    'ready'
  );
  const payload = await page.evaluate(() => window.__midasActivityConsumerHarness.getLastExport());
  expect(Object.keys(payload)).toEqual([
    'schema_version', 'generated_at', 'timezone', 'range', 'completeness',
    'blood_pressure', 'body', 'notes', 'labs', 'activity_summary',
    'activity_quality', 'activities'
  ]);
  expect(payload.schema_version).toBe('midas.health-export.v3');
  expect(payload.completeness.counts.activities).toBe(3);
  expect(payload.activities).toHaveLength(3);
  expect(JSON.stringify({
    summary: payload.activity_summary,
    quality: payload.activity_quality,
    activities: payload.activities
  })).not.toMatch(/exercise|sets|reps|weight|volume|recommendation/i);
  expect(await page.locator('a[download]').count()).toBe(0);
  expect(await page.evaluate(() => window.__midasActivityConsumerHarness.getExportAttempts())).toBe(1);
  await page.screenshot({ path: screenshotPath('r11-health-export-v3-desktop.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('T-ACT-R11-08 320px is complete when empty and all-or-error on a failed read', async ({ page }) => {
  let errors = await openHarness(page, 'empty', { width: 320, height: 800 });
  await page.getByRole('button', { name: 'V3-Export prüfen' }).click();
  await expect(page.locator('[data-role="export-status"]')).toHaveAttribute(
    'data-export-state',
    'ready'
  );
  expect(await page.evaluate(() =>
    window.__midasActivityConsumerHarness.getLastExport().completeness.counts.activities
  )).toBe(0);
  await assertTouchTargets(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = await openHarness(page, 'error', { width: 320, height: 800 });
  await page.getByRole('button', { name: 'V3-Export prüfen' }).click();
  await expect(page.locator('[data-role="export-status"]')).toHaveAttribute(
    'data-export-state',
    'error'
  );
  expect(await page.evaluate(() => window.__midasActivityConsumerHarness.getLastExport())).toBeNull();
  expect(await page.locator('a[download]').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: screenshotPath('r11-health-export-v3-320-error.png'), fullPage: true });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
