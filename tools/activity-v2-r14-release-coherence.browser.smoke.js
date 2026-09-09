'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const { chromium } = require('playwright');

const browserExecutable = process.env.MIDAS_BROWSER_EXECUTABLE || [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((candidate) => fs.existsSync(candidate));

let release = 'v23';
let graphMode = 'legacy';

const releaseQuery = (current) => `?v=${current.slice(1)}`;
const graphSpecifier = (path, current, mode) => (
  mode === 'coherent' ? `${path}${releaseQuery(current)}` : path
);

function htmlFor(current, mode) {
  const root = mode === 'legacy'
    ? '/supabase/index.js'
    : `/supabase/index.js${releaseQuery(current)}`;
  const boot = mode === 'coherent'
    ? `/boot-auth.js${releaseQuery(current)}`
    : '/boot-auth.js';
  return `<!doctype html><html data-release="${current}"><body data-boot="pending">
    <script type="module" src="${root}"></script>
    <script type="module" src="${boot}"></script>
    <script>navigator.serviceWorker.register('/sw.js?release=${current}&mode=${mode}');</script>
  </body></html>`;
}

function moduleFor(url, current, mode) {
  const servedRelease = url.searchParams.get('v')
    ? `v${url.searchParams.get('v')}`
    : current;
  const coherent = mode === 'coherent';
  if (url.pathname === '/supabase/auth/core.js') {
    return `
      globalThis.__coreReleases = globalThis.__coreReleases || [];
      globalThis.__coreReleases.push('${servedRelease}');
      export const coreRelease = '${servedRelease}';
    `;
  }
  if (url.pathname === '/supabase/auth/index.js') {
    const core = mode === 'legacy'
      ? '/supabase/auth/core.js'
      : `/supabase/auth/core.js${releaseQuery(servedRelease)}`;
    return `export { coreRelease } from '${core}';`;
  }
  if (url.pathname === '/supabase/api/vitals.js') {
    const core = coherent
      ? `/supabase/auth/core.js${releaseQuery(servedRelease)}`
      : '/supabase/auth/core.js';
    return `import { coreRelease } from '${core}'; export const vitalsCoreRelease = coreRelease;`;
  }
  if (url.pathname === '/supabase/index.js') {
    const auth = mode === 'legacy'
      ? '/supabase/auth/index.js'
      : `/supabase/auth/index.js${releaseQuery(servedRelease)}`;
    const vitals = mode === 'legacy'
      ? '/supabase/api/vitals.js'
      : `/supabase/api/vitals.js${releaseQuery(servedRelease)}`;
    return `
      import { coreRelease } from '${auth}';
      import { vitalsCoreRelease } from '${vitals}';
      globalThis.__rootReleases = globalThis.__rootReleases || [];
      globalThis.__rootReleases.push('${servedRelease}');
      export const rootRelease = '${servedRelease}';
      export const observedCoreReleases = [coreRelease, vitalsCoreRelease];
    `;
  }
  if (url.pathname === '/boot-auth.js') {
    const root = graphSpecifier('/supabase/index.js', servedRelease, mode);
    return `
      import { rootRelease, observedCoreReleases } from '${root}';
      const roots = [...new Set(globalThis.__rootReleases || [])];
      const cores = [...new Set([...(globalThis.__coreReleases || []), ...observedCoreReleases])];
      const expected = document.documentElement.dataset.release;
      document.body.dataset.roots = roots.join(',');
      document.body.dataset.cores = cores.join(',');
      document.body.dataset.boot = roots.length === 1 && cores.length === 1
        && rootRelease === expected && roots[0] === expected && cores[0] === expected
        ? 'coherent'
        : 'mixed';
    `;
  }
  return null;
}

function workerFor(current, mode) {
  const query = releaseQuery(current);
  const assets = mode === 'coherent'
    ? [
        '/',
        '/index.html',
        `/supabase/index.js${query}`,
        `/supabase/auth/index.js${query}`,
        `/supabase/auth/core.js${query}`,
        `/supabase/api/vitals.js${query}`,
        `/boot-auth.js${query}`
      ]
    : mode === 'partial'
      ? ['/', '/index.html', `/supabase/index.js${query}`, '/boot-auth.js']
      : [
          '/',
          '/index.html',
          '/supabase/index.js',
          '/supabase/auth/index.js',
          '/supabase/auth/core.js',
          '/supabase/api/vitals.js',
          '/boot-auth.js'
        ];
  return `'use strict';
    const CACHE = 'r14-${current}-${mode}';
    const ASSETS = ${JSON.stringify(assets)};
    self.addEventListener('install', event => event.waitUntil(
      caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    ));
    self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
    self.addEventListener('fetch', event => {
      const request = event.request;
      if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
      if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(() => caches.open(CACHE).then(cache => cache.match('/index.html'))));
        return;
      }
      event.respondWith(caches.open(CACHE).then(cache => cache.match(request)).then(
        cached => cached || fetch(request)
      ));
    });`;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  response.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/sw.js') {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(workerFor(url.searchParams.get('release'), url.searchParams.get('mode')));
    return;
  }
  const moduleSource = moduleFor(url, release, graphMode);
  if (moduleSource != null) {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(moduleSource);
    return;
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    response.setHeader('Content-Type', 'text/html');
    response.end(htmlFor(release, graphMode));
    return;
  }
  response.statusCode = 404;
  response.end('not found');
});

async function controlledPage(browser, base, initialRelease, initialMode) {
  release = initialRelease;
  graphMode = initialMode;
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload({ waitUntil: 'networkidle' });
  }
  assert.equal(await page.locator('body').getAttribute('data-boot'), 'coherent');
  return { context, page };
}

async function expectTransition(page, base, nextRelease, nextMode, expected) {
  release = nextRelease;
  graphMode = nextMode;
  await page.goto(`${base}?transition=${nextRelease}-${nextMode}`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('body').getAttribute('data-boot'), expected);
}

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}/`;
  const browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  try {
    const partial = await controlledPage(browser, base, 'v23', 'legacy');
    await expectTransition(partial.page, base, 'v24', 'partial', 'mixed');
    assert.match(await partial.page.locator('body').getAttribute('data-roots'), /v23/);
    assert.match(await partial.page.locator('body').getAttribute('data-roots'), /v24/);
    assert.match(await partial.page.locator('body').getAttribute('data-cores'), /v23/);
    assert.match(await partial.page.locator('body').getAttribute('data-cores'), /v24/);
    await partial.context.close();

    const cutover = await controlledPage(browser, base, 'v23', 'legacy');
    await expectTransition(cutover.page, base, 'v24', 'coherent', 'coherent');
    await cutover.context.close();

    const rollback = await controlledPage(browser, base, 'v24', 'coherent');
    await expectTransition(rollback.page, base, 'v25', 'coherent', 'coherent');
    await rollback.context.close();

    const offline = await controlledPage(browser, base, 'v24', 'coherent');
    await offline.context.setOffline(true);
    await offline.page.reload({ waitUntil: 'networkidle' });
    assert.equal(await offline.page.locator('body').getAttribute('data-boot'), 'coherent');
    assert.equal(await offline.page.locator('body').getAttribute('data-roots'), 'v24');
    assert.equal(await offline.page.locator('body').getAttribute('data-cores'), 'v24');
    await offline.context.close();

    process.stdout.write(
      'R14_RELEASE_COHERENCE_BROWSER_PASS partial_mixed=1 cutover_coherent=1 rollback_coherent=1 fresh_offline=1\n'
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
