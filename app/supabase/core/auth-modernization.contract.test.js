'use strict';
// Run: node --experimental-vm-modules --test app/supabase/core/auth-modernization.contract.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
if (typeof vm.SourceTextModule !== 'function') {
  throw new Error('These tests require node --experimental-vm-modules --test.');
}
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const OWNER = '00000000-0000-4000-8000-000000000013';
const TOKEN = 'fixture_header.fixture_payload.fixture_signature';
const KEY = 'sb_publishable_fixture_public';
const REST = 'https://midas-fixture.supabase.co/rest/v1/health_events';
const legacy = role => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.fixture_signature`;
const validSession = (access_token = TOKEN) => ({ access_token, expires_at: Date.now() / 1000 + 3600, user: { id: OWNER, is_anonymous: false } });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
async function fixture() {
  const config = { webhookUrl: REST, webhookKey: KEY };
  let session = validSession(), readSession = async () => ({ data: { session }, error: null }), refresh = async () => ({ data: { session }, error: null });
  const created = [], listeners = [], unsubscribed = [], overlays = [];
  const window = { getConf: async name => config[name], diag: { add() {} }, showLoginOverlay() { overlays.push(true); },
    supabase: { createClient(url, key, options) { const client = { url, key, options, auth: { getSession: () => readSession(), getUser: async () => ({ data: { user: session?.user }, error: null }), refreshSession: () => refresh(), stopAutoRefresh() {}, onAuthStateChange(callback) { listeners.push(callback); return { data: { subscription: { unsubscribe() { unsubscribed.push(client); } } } }; } } }; created.push(client); return client; } } };
  const context = vm.createContext({ window, URL, console, setTimeout, clearTimeout, Date, atob, btoa, fetch: (...args) => window.fetch(...args) });
  const modules = new Map();
  async function load(file) {
    file = path.resolve(file.split('?')[0]);
    if (modules.has(file)) return modules.get(file);
    const module = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), { context, identifier: file });
    modules.set(file, module);
    await module.link(specifier => load(path.resolve(path.dirname(file), specifier.split('?')[0])));
    return module;
  }
  const http = await load(path.join(__dirname, 'http.js')); await http.evaluate();
  const client = (await load(path.join(__dirname, 'client.js'))).namespace;
  const state = (await load(path.join(__dirname, 'state.js'))).namespace;
  const types = (await load(path.join(__dirname, 'public-key.js'))).namespace;
  const core = await load(path.join(__dirname, '../auth/core.js')); await core.evaluate();
  return { config, created, listeners, unsubscribed, overlays, core: core.namespace, http: http.namespace, client, state, types, setSession: v => { session = v; }, setRead: fn => { readSession = fn; }, setRefresh: fn => { refresh = fn; }, window,
    loadNotes: async () => { const m = await load(path.join(__dirname, '../api/notes.js')); await m.evaluate(); return m.namespace; } };
}

test('F22 Notes consumer reports uncertain write outcome without demanding login or replay', async () => {
  for (const logout of [false, true]) {
    const f = await fixture(), response = deferred(), sent = deferred(), feedback = [];
    await f.client.ensureSupabaseClient();
    f.window.toHealthEvents = () => [{ type: 'note', payload: { text: 'synthetic' } }];
    f.window.saveFeedback = { error: ({ message }) => feedback.push(message) };
    let effects = 0; f.window.fetch = () => { effects++; sent.resolve(); return response.promise; };
    const notes = await f.loadNotes();
    const pending = notes.syncWebhook({ date: '2026-10-09' }, 'synthetic-local-id');
    const rejected = assert.rejects(pending, e => e.message === 'auth-context-changed');
    await sent.promise; f.state.clearHeaderCache(); if (logout) f.setSession(null);
    response.resolve({ status: 200 }); await rejected; assert.equal(effects, 1);
    assert.equal(feedback.length, 1);
    assert.equal(feedback[0], logout ? 'Bitte erneut anmelden, um weiter zu speichern.' : 'Die Antwort ist nicht mehr aktuell. Bitte prüfen, ob der Eintrag bereits gespeichert wurde.');
  }
});

test('F22 actual listener: unchanged session events reject stale response without reopening login', async () => {
  for (const event of ['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED']) {
    const f = await fixture(), response = deferred(), sent = deferred();
    await f.client.ensureSupabaseClient();
    f.core.initAuth({ onLoginOverlay: visible => f.overlays.push(visible) });
    f.core.watchAuthState();
    let transports = 0;
    const pending = f.http.fetchWithAuth(() => { transports++; sent.resolve(); return response.promise; }, { requestUrl: REST });
    await sent.promise;
    const generation = f.state.supabaseState.headerGeneration;
    f.listeners[0](event, validSession());
    await new Promise(r => setTimeout(r, 10));
    assert.ok(f.state.supabaseState.headerGeneration > generation);
    assert.equal(f.state.supabaseState.authState, 'auth');
    f.overlays.length = 0;
    response.resolve({ status: 200 });
    await assert.rejects(pending, e => e.message === 'auth-context-changed' && e.status === 401);
    assert.equal(transports, 1, 'no replay of an emitted write');
    assert.deepEqual(f.overlays, [], event);
  }
});

test('F22 actual listener: refreshed valid session rejects old response without login', async () => {
  const f = await fixture(), response = deferred(), sent = deferred();
  await f.client.ensureSupabaseClient();
  f.core.initAuth({ onLoginOverlay: visible => f.overlays.push(visible) }); f.core.watchAuthState();
  const pending = f.http.fetchWithAuth(() => { sent.resolve(); return response.promise; }, { requestUrl: REST });
  await sent.promise; const next = validSession('fixture_header.refreshed_payload.fixture_signature');
  f.setSession(next); f.listeners[0]('TOKEN_REFRESHED', next); await new Promise(r => setTimeout(r, 10));
  f.overlays.length = 0; response.resolve({ status: 200 });
  await assert.rejects(pending, e => e.message === 'auth-context-changed');
  assert.deepEqual(f.overlays, []); assert.ok(await f.http.getSessionHeaders());
});

test('F22 logout/session loss still requires login; stale transport error is never replayed', async () => {
  for (const loss of ['SIGNED_OUT', 'expired', 'missing']) {
    const f = await fixture(), response = deferred(), sent = deferred();
    await f.client.ensureSupabaseClient(); f.core.initAuth({ onLoginOverlay: visible => f.overlays.push(visible) }); f.core.watchAuthState();
    const pending = f.http.fetchWithAuth(() => { sent.resolve(); return response.promise; });
    await sent.promise;
    if (loss === 'SIGNED_OUT') { f.setSession(null); f.listeners[0](loss, null); }
    if (loss === 'expired') f.setSession({ ...validSession(), expires_at: 0 });
    if (loss === 'missing') f.setSession(null);
    await new Promise(r => setTimeout(r, 10)); response.resolve({ status: 200 });
    await assert.rejects(pending, e => e.status === 401); assert.ok(f.overlays.includes(true), loss);
  }
  const f = await fixture(); let transports = 0;
  await assert.rejects(f.http.fetchWithAuth(() => { transports++; f.state.clearHeaderCache(); throw new Error('synthetic transport failure'); }), e => e.message === 'auth-context-changed');
  assert.equal(transports, 1); assert.deepEqual(f.overlays, []);
});

test('F22 failed or superseded current-session recheck remains inconclusive without login or authorization', async () => {
  for (const change of ['read-error', 'late-event', 'late-client']) {
    const f = await fixture(), response = deferred(), sent = deferred(), read = deferred();
    const pending = f.http.fetchWithAuth(() => { sent.resolve(); return response.promise; });
    const rejected = assert.rejects(pending, e => e.message === 'auth-context-changed' && e.status === 401);
    await sent.promise; f.state.clearHeaderCache();
    if (change === 'read-error') f.setRead(async () => ({ error: new Error('synthetic session read failure') }));
    else f.setRead(() => read.promise);
    response.resolve({ status: 200 }); await new Promise(r => setTimeout(r, 5));
    if (change === 'late-event') f.state.clearHeaderCache();
    if (change === 'late-client') f.client.resetSupabaseClient();
    read.resolve({ data: { session: null }, error: null });
    await rejected;
    assert.deepEqual(f.overlays, []);
  }
});

test('F22 current-session recheck timeout discards response without speculative login', async () => {
  const f = await fixture(), response = deferred(), sent = deferred();
  const pending = f.http.fetchWithAuth(() => { sent.resolve(); return response.promise; });
  const rejected = assert.rejects(pending, e => e.message === 'auth-context-changed');
  await sent.promise; f.state.clearHeaderCache(); f.setRead(() => new Promise(() => {}));
  response.resolve({ status: 200 }); await rejected; assert.deepEqual(f.overlays, []);
});

test('F22 changed config or delayed current-session read cannot accept old response', async () => {
  for (const change of ['client', 'config', 'delayed-read']) {
    const f = await fixture(), response = deferred(), sent = deferred(), read = deferred();
    const pending = f.http.fetchWithAuth(() => { sent.resolve(); return response.promise; }, { requestUrl: REST });
    await sent.promise;
    if (change === 'client') { f.client.resetSupabaseClient(); await f.client.ensureSupabaseClient(); }
    if (change === 'config') { f.config.webhookKey = 'sb_publishable_fixture_changed'; await f.client.ensureSupabaseClient(); }
    if (change === 'delayed-read') { f.state.clearHeaderCache(); f.setRead(() => read.promise); }
    response.resolve({ status: 200 });
    if (change === 'delayed-read') { await new Promise(r => setTimeout(r, 5)); assert.deepEqual(f.overlays, []); read.resolve({ data: { session: validSession() }, error: null }); }
    await assert.rejects(pending, e => e.message === 'auth-context-changed');
    assert.deepEqual(f.overlays, []);
  }
});
test('L3 public types accept modern/legacy anon; reject private, user, whitespace and malformed keys', async () => {
  const f = await fixture();
  for (const key of [KEY, legacy('anon'), `Bearer ${legacy('anon')}`]) assert.ok(f.types.normalizePublicKey(key));
  for (const key of ['sb_secret_fixture_private', legacy('service_role'), legacy('authenticated'), TOKEN, '', 'bad', ` ${KEY}`, `${KEY} `, `${KEY}\n`, `sb_publishable_bad key`, `Bearer  ${KEY}`]) assert.equal(f.types.normalizePublicKey(key), null);
  assert.equal(f.types.normalizePublicKey(`Bearer ${KEY}`, { allowBearerPrefix: false }), null);
});
test('L3 client validates config before cached return and cannot create with a privileged restored key', async () => {
  const f = await fixture(); const first = await f.client.ensureSupabaseClient(); assert.ok(first);
  assert.equal(await f.client.ensureSupabaseClient(), first); assert.equal(f.created.length, 1);
  f.config.webhookKey = 'sb_secret_fixture_private'; assert.equal(await f.client.ensureSupabaseClient(), null); assert.equal(f.state.supabaseState.sbClient, null); assert.equal(f.created.length, 1);
  f.config.webhookKey = legacy('anon'); assert.ok(await f.client.ensureSupabaseClient()); assert.equal(f.created.length, 2);
});
test('L3 current session splits public apikey/JWT; missing/anonymous/expired/private session has no fallback cache', async () => {
  const f = await fixture(); const headers = await f.http.getSessionHeaders(); assert.equal(headers.apikey, KEY); assert.equal(headers.Authorization, `Bearer ${TOKEN}`);
  for (const session of [null, { ...validSession(), user: { id: OWNER, is_anonymous: true } }, { ...validSession(), expires_at: 0 }, validSession(legacy('service_role')), validSession(legacy('anon'))]) {
    f.setSession(session); assert.equal(await f.http.getSessionHeaders(), null);
    let effects = 0; await assert.rejects(f.http.fetchWithAuth(() => { effects++; }, { maxAttempts: 0 }), e => e.status === 401); assert.equal(effects, 0);
  }
});
test('L3 late key/project/client completion never publishes headers from old generation', async () => {
  const f = await fixture(), gate = deferred();
  f.setRead(() => gate.promise);
  const loading = f.http.getSessionHeaders(); await new Promise(r => setTimeout(r, 5));
  const first = f.state.supabaseState.sbClient;
  f.config.webhookUrl = 'https://other-fixture.supabase.co/rest/v1/health_events'; f.config.webhookKey = 'sb_publishable_fixture_other';
  await f.client.ensureSupabaseClient(); assert.notEqual(f.state.supabaseState.sbClient, first);
  gate.resolve({ data: { session: validSession() }, error: null }); assert.equal(await loading, null); assert.equal(f.state.getCachedHeaders(), null);
  const fresh = await f.http.getSessionHeaders(); assert.equal(fresh.apikey, 'sb_publishable_fixture_other');
});
test('L3 pending session invalidation and timeouts never authorize stale cached transport', async () => {
  const f = await fixture(); assert.ok(await f.http.getSessionHeaders());
  const gate = deferred(); f.setRead(() => gate.promise);
  const loading = f.http.getSessionHeaders(); await new Promise(r => setTimeout(r, 5)); f.state.clearHeaderCache();
  gate.resolve({ data: { session: validSession() } }); assert.equal(await loading, null);
  f.setRead(() => new Promise(() => {})); assert.equal(await f.http.getSessionHeaders({ timeoutMs: 1 }), null);
});
test('L3 old endpoint/new configuration cannot emit a cross-project request', async () => {
  const f = await fixture(); f.config.webhookUrl = 'https://other-fixture.supabase.co/rest/v1/health_events';
  let effects = 0; await assert.rejects(f.http.fetchWithAuth(() => { effects++; }, { requestUrl: REST }), e => e.status === 401); assert.equal(effects, 0);
});
test('L3 successful refresh retries once with the new current JWT; failed refresh has no stale retry', async () => {
  const f = await fixture(); const seen = [];
  f.setRefresh(async () => { f.setSession(validSession('fixture_header.refreshed_payload.fixture_signature')); return { error: null }; });
  const response = await f.http.fetchWithAuth(headers => { seen.push(headers.Authorization); return { status: seen.length === 1 ? 401 : 200 }; }, { requestUrl: REST });
  assert.equal(response.status, 200); assert.deepEqual(seen, [`Bearer ${TOKEN}`, 'Bearer fixture_header.refreshed_payload.fixture_signature']);
  f.setRefresh(async () => ({ error: { message: 'synthetic refresh failure' } })); let effects = 0;
  await assert.rejects(f.http.fetchWithAuth(() => { effects++; return { status: 401 }; }, { requestUrl: REST }), e => e.status === 401); assert.equal(effects, 1);
});
test('L3 already emitted request response is discarded after logout/client/session replacement', async () => {
  for (const change of ['logout', 'client', 'session']) {
    const f = await fixture(), gate = deferred(), started = deferred();
    const result = f.http.fetchWithAuth(() => { started.resolve(); return gate.promise; }, { requestUrl: REST }); await started.promise;
    if (change === 'logout') f.setSession(null);
    if (change === 'client') { f.client.resetSupabaseClient(); await f.client.ensureSupabaseClient(); }
    if (change === 'session') f.setSession(validSession('fixture_header.changed_payload.fixture_signature'));
    gate.resolve({ status: 200 }); await assert.rejects(result, e => e.status === 401);
  }
});
test('L3 configuration write fence rejects readers throughout a partial configuration write', async () => {
  const f = await fixture(); assert.ok(await f.http.getSessionHeaders()); f.state.supabaseState.configChanging = true; f.client.resetSupabaseClient();
  assert.equal(await f.client.ensureSupabaseClient(), null); assert.equal(await f.http.getSessionHeaders(), null);
  f.config.webhookKey = 'sb_publishable_fixture_changed'; f.state.supabaseState.configChanging = false;
  assert.equal((await f.http.getSessionHeaders()).apikey, 'sb_publishable_fixture_changed');
});
test('L3 listener deduplicates, unsubscribes and discards queued old-generation events', async () => {
  const f = await fixture(); await f.client.ensureSupabaseClient();
  f.core.watchAuthState(); f.core.watchAuthState(); assert.equal(f.listeners.length, 1);
  f.listeners[0]('SIGNED_IN', validSession());
  f.client.resetSupabaseClient(); await f.client.ensureSupabaseClient(); f.core.watchAuthState();
  assert.equal(f.unsubscribed.length, 1); assert.equal(f.listeners.length, 2);
  await new Promise(r => setTimeout(r, 10)); assert.equal(f.state.supabaseState.authState, 'unauth'); assert.equal(f.state.supabaseState.lastUserId, null);
  f.listeners[1]('SIGNED_IN', validSession()); await new Promise(r => setTimeout(r, 10)); assert.equal(f.state.supabaseState.authState, 'auth');
  f.listeners[0]('SIGNED_OUT', null); await new Promise(r => setTimeout(r, 10)); assert.equal(f.state.supabaseState.authState, 'auth');
});
test('L3 current-owner lookup rejects errors, anonymous and late config completion without cached identity', async () => {
  const f = await fixture(); const client = await f.client.ensureSupabaseClient();
  assert.equal(await f.core.getUserId(), OWNER);
  client.auth.getUser = async () => ({ error: { message: 'fixture error' }, data: { user: validSession().user } }); assert.equal(await f.core.getUserId(), null);
  client.auth.getUser = async () => ({ data: { user: { id: OWNER, is_anonymous: true } } }); assert.equal(await f.core.getUserId(), null);
  const gate = deferred(); client.auth.getUser = () => gate.promise;
  const pending = f.core.getUserId(); await new Promise(r => setTimeout(r, 5)); f.config.webhookKey = 'sb_publishable_changed';
  gate.resolve({ data: { user: validSession().user } }); assert.equal(await pending, null); assert.equal(f.state.supabaseState.lastUserId, null);
});
test('L3 fast/grace session checks cannot resurrect stale owner or anonymous session', async () => {
  const f = await fixture(); await f.client.ensureSupabaseClient(); f.state.supabaseState.lastLoggedIn = true;
  f.setRead(() => new Promise(() => {})); assert.equal(await f.core.isLoggedInFast({ timeout: 1 }), false);
  const gate = deferred(); f.setRead(() => gate.promise); f.core.scheduleAuthGrace(); await new Promise(r => setTimeout(r, 420));
  f.client.resetSupabaseClient(); await f.client.ensureSupabaseClient(); gate.resolve({ data: { session: validSession() } });
  await new Promise(r => setTimeout(r, 10)); assert.equal(f.state.supabaseState.authState, 'unauth');
  f.setSession({ ...validSession(), user: { id: OWNER, is_anonymous: true } }); f.setRead(async () => ({ data: { session: { ...validSession(), user: { id: OWNER, is_anonymous: true } } } }));
  f.core.scheduleAuthGrace(); await new Promise(r => setTimeout(r, 430)); assert.equal(f.state.supabaseState.authState, 'unauth');
});
test('L3 native invalid restore is rejected before cached client use; late native session import is not published', async () => {
  const f = await fixture(); const client = await f.client.ensureSupabaseClient();
  f.window.__midasAndroidNativeAuthOwner = true; f.window.__midasAndroidAuthBootstrapState = { status: 'invalid-config' };
  assert.equal(await f.http.getSessionHeaders(), null); assert.equal(f.state.supabaseState.sbClient, null);
  f.window.__midasAndroidAuthBootstrapState = { status: 'session-staged', accessToken: TOKEN, refreshToken: 'synthetic_refresh', sessionGeneration: 1 };
  const replacement = await f.client.ensureSupabaseClient(), gate = deferred(); replacement.auth.setSession = () => gate.promise;
  const pending = f.core.applyAndroidBootstrapSession(); await new Promise(r => setTimeout(r, 5)); f.client.resetSupabaseClient(); await f.client.ensureSupabaseClient();
  gate.resolve({ error: null }); assert.equal(await pending, 'session-staging-invalid'); assert.equal(f.window.__midasAndroidAuthBootstrapState.applied, undefined);
  assert.notEqual(client, f.state.supabaseState.sbClient);
});
