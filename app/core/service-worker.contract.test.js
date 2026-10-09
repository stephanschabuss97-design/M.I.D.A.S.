// Run: node --test app/core/service-worker.contract.test.js
// Executes the actual worker in a local VM; no network, storage or device effects.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../service-worker.js'), 'utf8');
const fresh = () => new Response('fresh asset', { status: 200 });
const tick = () => new Promise((resolve) => setImmediate(resolve));

function fixture({ cached, fetch = async () => fresh(), open, put = async () => {} } = {}) {
  const listeners = {}, pending = [], writes = [];
  const cache = {
    match: async () => cached,
    put: async (request, response) => {
      writes.push({ url: request.url, body: await response.text() });
      return put();
    }
  };
  vm.runInNewContext(source, {
    self: {
      registration: { scope: 'https://fixture.invalid/' },
      location: { origin: 'https://fixture.invalid' },
      addEventListener: (type, listener) => { listeners[type] = listener; }
    },
    URL, fetch, caches: { open: open || (async () => cache) }
  });
  return {
    pending, writes, cache,
    dispatch(overrides = {}) {
      let response;
      listeners.fetch({
        request: { method: 'GET', url: 'https://fixture.invalid/fresh.js', destination: 'script', ...overrides },
        respondWith: (promise) => { response = promise; },
        waitUntil: (promise) => { pending.push(promise); }
      });
      return response;
    }
  };
}

test('uncached HTTP200 survives a cache quota failure', async () => {
  const f = fixture({ put: async () => { throw new Error('synthetic cache quota failure'); } });
  assert.equal(await (await f.dispatch()).text(), 'fresh asset');
  await Promise.all(f.pending);
  assert.equal(f.writes[0].body, 'fresh asset');
});

test('uncached HTTP200 survives cache-open failure during persistence', async () => {
  let calls = 0, f;
  f = fixture({ open: async () => {
    if (++calls === 3) throw new Error('synthetic persistence open failure');
    return f.cache;
  } });
  assert.equal(await (await f.dispatch()).text(), 'fresh asset');
  await Promise.all(f.pending);
});

test('unavailable cache lookup still allows a fresh network response', async () => {
  const f = fixture({ open: async () => { throw new Error('synthetic cache unavailable'); } });
  assert.equal(await (await f.dispatch()).text(), 'fresh asset');
  await Promise.all(f.pending);
});

test('cached offline response has a settled background lifetime', async () => {
  const cached = new Response('cached asset');
  const f = fixture({ cached, fetch: async () => { throw new Error('synthetic offline'); } });
  assert.equal(await (await f.dispatch()).text(), 'cached asset');
  assert.equal(f.pending.length, 1);
  await Promise.all(f.pending);
});

test('uncached network failure remains a network failure', async () => {
  const f = fixture({ fetch: async () => { throw new Error('synthetic offline'); } });
  await assert.rejects(f.dispatch(), /synthetic offline/);
  await Promise.all(f.pending);
});

test('cached response returns promptly while waitUntil holds the cachewrite', async () => {
  let release;
  const writing = new Promise((resolve) => { release = resolve; });
  const f = fixture({ cached: new Response('cached asset'), put: () => writing });
  assert.equal(await (await f.dispatch()).text(), 'cached asset');
  await tick();
  assert.equal(f.writes.length, 1);
  let settled = false;
  f.pending[0].then(() => { settled = true; });
  await tick();
  assert.equal(settled, false);
  release();
  await Promise.all(f.pending);
  assert.equal(settled, true);
});

test('navigation HTTP200 survives cache quota failure with tracked lifetime', async () => {
  const f = fixture({ put: async () => { throw new Error('synthetic navigation quota failure'); } });
  assert.equal(await (await f.dispatch({ mode: 'navigate', destination: 'document' })).text(), 'fresh asset');
  assert.equal(f.pending.length, 1);
  await Promise.all(f.pending);
});

test('non-GET and cross-origin requests bypass worker caching', () => {
  const f = fixture();
  assert.equal(f.dispatch({ method: 'POST' }), undefined);
  assert.equal(f.dispatch({ url: 'https://other.invalid/fresh.js' }), undefined);
  assert.equal(f.pending.length, 0);
  assert.equal(f.writes.length, 0);
});
