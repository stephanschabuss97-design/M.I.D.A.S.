'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
test('R15 T02: disposable real IndexedDB owner replace/read and bounded failure', async () => {
  const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<title>R15 disposable cache</title>'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const executablePath = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.addScriptTag({ path: path.join(__dirname, 'session-template-cache.js') });
    const result = await page.evaluate(async () => {
      const api = AppModules.activityV2.sessionTemplateCache;
      const owner = '00000000-0000-4000-8000-000000000001';
      const other = '00000000-0000-4000-8000-000000000002';
      const outcomes = [];
      const check = (condition, label) => { if (!condition) throw new Error(label); outcomes.push(label); };
      const cache = api.create();
      const plan = { schema_version: 'midas.activity-session-template.v1', catalog_version: 2, name: 'A', items: [{ item_order: 1, item_key: 'leg_curl' }] };
      check(await cache.load(owner) === null, 'empty');
      await cache.save(owner, plan);
      await cache.save(owner, { ...plan, name: 'B' });
      check((await cache.load(owner)).name === 'B', 'replace');
      check(await cache.load(other) === null, 'owner isolation');
      await cache.save(other, { ...plan, name: 'Other' });
      check((await cache.load(owner)).name === 'B', 'independent owner');
      const db = await new Promise((resolve, reject) => { const request = indexedDB.open(api.DATABASE_NAME); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      await new Promise((resolve, reject) => { const tx = db.transaction(api.STORE_NAME, 'readwrite'); tx.objectStore(api.STORE_NAME).put({ owner_id: owner, alien: true }); tx.oncomplete = resolve; tx.onerror = reject; });
      let corrupt = null;
      try { await cache.load(owner); } catch (error) { corrupt = error.code; }
      check(corrupt === 'CACHE_CORRUPT', 'corrupt rejected');
      db.close(); cache.close();
      let closed = null;
      try { await cache.load(other); } catch (error) { closed = error.code; }
      check(closed === 'CACHE_OWNER_INVALID', 'closed unusable');
      const stalled = api.create({ indexedDB: { open: () => ({}) }, timeoutMs: 30 });
      let timeout = null;
      try { await stalled.load(owner); } catch (error) { timeout = error.code; }
      check(timeout === 'CACHE_TIMEOUT', 'bounded timeout'); stalled.close();
      const pending = api.create({ indexedDB: { open: () => ({}) } });
      const loading = pending.load(owner).catch(error => error.code);
      pending.close(); check(await loading === 'CACHE_CLOSED', 'close cancels pending');
      const unavailable = api.create({ indexedDB: { open() { throw new Error('quota'); } } });
      check(await unavailable.save(owner, plan).catch(error => error.code) === 'CACHE_UNAVAILABLE', 'fail soft storage');
      unavailable.close();
      check(api.DATABASE_NAME !== 'midas_activity_v2_recovery' && api.DATABASE_VERSION === 1, 'separate DB');
      const holder = await new Promise(resolve => { const request = indexedDB.open(api.DATABASE_NAME); request.onsuccess = () => resolve(request.result); });
      const blockedCache = api.create({ indexedDB: { open: () => indexedDB.open(api.DATABASE_NAME, 2) } });
      check(await blockedCache.load(owner).catch(error => error.code) === 'CACHE_BLOCKED', 'actual blocked upgrade bounded');
      holder.close(); blockedCache.close();
      return outcomes;
    });
    assert.equal(result.length, 11);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
