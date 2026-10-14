'use strict';

// Shared disposable fixture. No full boot, real auth, backend, device or network.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const clone = (value) => JSON.parse(JSON.stringify(value));

function sources(intakeSource = read('app/modules/intake-stack/intake/index.js')) {
  const main = read('assets/js/main.js');
  const parserStart = main.indexOf('function toNumDE(s) {');
  const parserEnd = main.indexOf('// @refactor:', parserStart);
  assert.ok(parserStart >= 0 && parserEnd > parserStart, 'Original parser boundary');
  const api = read('app/supabase/api/intake.js');
  const imports = [...api.matchAll(/^import \{ (\w+) \} from '[^']+';$/gm)];
  assert.equal(imports.length, 7, 'Explicit API import boundary changed');
  // Only module syntax is adapted; all API function bodies remain original.
  const apiFixture = `(function(){ const {${imports.map((m) => m[1]).join(',')}} = __providers;\n`
    + api.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')
    + '\nObject.assign(globalThis, {saveIntakeTotalsRpc, loadIntakeToday}); })();';
  return [
    main.slice(parserStart, parserEnd),
    read('app/core/capture-globals.js'),
    read('app/diagnostics/logger.js'),
    read('app/core/diag.js'),
    read('assets/js/ui.js'),
    apiFixture,
    intakeSource
  ];
}

function e2Sources() {
  const base = sources();
  const select = read('app/supabase/api/select.js');
  const imports = [...select.matchAll(/^import \{ (\w+) \} from '[^']+';$/gm)];
  assert.equal(imports.length, 3, 'Select import boundary');
  const adapted = `(function(){ const {${imports.map((m) => m[1]).join(',')}} = __providers;\n`
    + select.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')
    + '\nglobalThis.sbSelect = sbSelect; __providers.sbSelect = sbSelect; })();';
  return [...base.slice(0, 5), read('assets/js/ui-errors.js'), adapted,
    read('app/modules/intake-stack/medication/index.js'), ...base.slice(5)];
}

function e3Sources() {
  const list = e2Sources();
  const boundary = "})(typeof window !== 'undefined' ? window : globalThis);";
  assert.ok(list.at(-1).endsWith(boundary + '\n') || list.at(-1).endsWith(boundary + '\r\n'), 'Original intake IIFE boundary');
  // Explicit location provider at the IIFE boundary, before any protocol handoff.
  // No handler body is copied, rewritten or replaced.
  list[list.length - 1] = list.at(-1).replace(boundary, '})(__e3Global);');
  return list;
}

function installE3Providers() {
  const state = globalThis.__test;
  state.medId = 'SYNTHETIC_E3_MED_ID';
  state.stock = 731;
  state.source = 'SYNTHETIC_E3_FREE_SOURCE';
  state.medRows[0].id = state.medId;
  state.medRows[0].stock_count = state.stock;
  state.medRows[0].name = 'Synthetic E3 medication';
  state.doctor = { primary_doctor_email: 'e3-doctor@example.invalid', primary_doctor_name: 'Synthetic doctor' };
  AppModules.profile = { getData: () => state.doctor };
  state.launches = [];
  Date.now = () => 1900000000000 + state.clock;
  const location = { set href(value) { state.launches.push(String(value)); } };
  globalThis.__e3Global = { AppModules, document: globalThis.document, location };
}

// One scenario driver for VM and browser; all actions reach original listeners/API.
async function runE3Scenario(mode) {
  const s = globalThis.__test;
  const api = AppModules.capture;
  const flush = async () => { for (let i = 0; i < 80; i++) await Promise.resolve(); };
  captureIntakeState.logged = true;
  captureIntakeState.totals = { ...s.totals };
  diag.init();
  api.bindIntakeCapture();
  await api.refreshCaptureIntake('fixture:e3-seed');
  await flush();
  const host = document.getElementById('medLowStockBox');
  const selected = {};
  const action = (attr) => {
    let button;
    if (s.vmAction) return s.vmAction(attr);
    button = document.querySelector(`[${attr}]`) || selected[attr];
    if (!button) throw new Error('Original E3 rendered action missing: ' + attr);
    selected[attr] = button;
    // Restore an original stale control to reproduce concurrency/guard races.
    if (!button.isConnected) host.appendChild(button);
    button.click();
  };
  if (!s.vmAction) selected['data-med-mail'] = document.querySelector('[data-med-mail]');
  const followup = () => api.startMedicationLowStockReorder({ dayIso: s.day,
    medIds: [s.medId], source: s.source, reason: 'voice:medication-low-stock-followup' });
  s.expectedHref = AppModules.medication.getMedicationReorderStartContract(s.medRows[0], {
    doctorInfo: { email: s.doctor.primary_doctor_email, name: s.doctor.primary_doctor_name },
    meds: s.medRows, dayIso: s.day
  }).href;
  if ((mode.startsWith('confirm-') && mode !== 'confirm-armed') || mode === 'cancel') {
    action('data-med-mail');
    if (!s.vmAction) selected['data-med-mail-confirm'] = document.querySelector('[data-med-mail-confirm]');
  }
  if (mode.endsWith('-lock') || mode.endsWith('-cooldown') || mode === 'reopen') {
    await followup();
    if (mode.endsWith('-cooldown')) s.advance(4000);
    if (mode === 'reopen') s.advance(12000);
  }
  const offsets = { touch: diag.lines.length,
    logger: AppModules.diagnosticsLayer.logger.history.length, console: s.console.length };
  s.requests.length = 0;
  s.launches.length = 0;
  if (mode.endsWith('-blocked')) s.doctor = {};
  if (mode.endsWith('-unauth')) captureIntakeState.logged = false;
  if (mode === 'followup-missing') AppModules.medication = null;
  if (mode.startsWith('ack')) {
    if (mode === 'ack-error') s.failRpc = 'med_ack_low_stock_v2';
    if (mode === 'ack-disabled') {
      if (s.vmAction) s.disabledAction = true;
      else document.querySelector('[data-med-ack]').disabled = true;
    }
    action('data-med-ack');
  } else if (mode.startsWith('start-')) action('data-med-mail');
  else if (mode === 'confirm-armed') {
    // First arm occurs at the measured boundary, without launching.
    action('data-med-mail');
  } else if (mode.startsWith('confirm-')) action('data-med-mail-confirm');
  else if (mode === 'cancel') action('data-med-mail-cancel');
  else s.result = await followup();
  await flush();
  return {
    mode, medId: s.medId, day: s.day, stock: s.stock, source: s.source,
    result: s.result, expectedHref: s.expectedHref, launches: s.launches,
    requests: s.requests, totals: captureIntakeState.totals,
    ui: host.innerHTML, buttonDisabled: s.actionButton?.disabled || false,
    outputs: {
      touch: diag.lines.slice(0, diag.lines.length - offsets.touch).map((e) => e.base.replace(/^\[[^\]]+\] /, '').replace(/^\[(?:ERROR|WARN|INFO)\] /, '')),
      logger: AppModules.diagnosticsLayer.logger.history.slice(0, AppModules.diagnosticsLayer.logger.history.length - offsets.logger).map((e) => e.message),
      console: s.console.slice(offsets.console).filter((e) => e.args[0] === '[diagnostics/logger]').map((e) => e.args[1])
    },
    console: s.console.slice(offsets.console)
  };
}

const e3Cases = {
  ack: ['F35-C08', '[capture:med] low-stock ack'],
  'start-blocked': ['F35-C10', '[capture:med] reorder start blocked reason=medication-reorder-doctor-email-missing'],
  'start-lock': ['F35-C11', '[capture:med] reorder start blocked reason=reorder-launch-locked'],
  'start-cooldown': ['F35-C12', '[capture:med] reorder start blocked reason=reorder-reopen-cooldown'],
  'confirm-armed': ['F35-C13', '[capture:med] reorder confirm armed'],
  'confirm-blocked': ['F35-C14', '[capture:med] reorder confirm blocked reason=medication-reorder-doctor-email-missing'],
  'confirm-lock': ['F35-C15', '[capture:med] reorder confirm blocked reason=reorder-launch-locked'],
  'confirm-prompted': ['F35-C16', '[capture:med] reorder prompted'],
  cancel: ['F35-C17', '[capture:med] reorder confirm cancelled'],
  'followup-blocked': ['F35-C19', '[capture:med] reorder follow-up blocked reason=medication-reorder-doctor-email-missing'],
  'followup-lock': ['F35-C20', '[capture:med] reorder follow-up blocked reason=reorder-launch-locked'],
  'followup-cooldown': ['F35-C21', '[capture:med] reorder follow-up blocked reason=reorder-reopen-cooldown'],
  'followup-prompted': ['F35-C22', '[capture:med] reorder prompted source=follow-up']
};

function checkE3(result) {
  const { mode } = result;
  const target = e3Cases[mode];
  if (target) for (const [sink, lines] of Object.entries(result.outputs)) {
    const [id, marker] = target;
    assert.ok(lines.filter((line) => line === marker).length === 1, `${id} ${sink}: one fixed positive marker`);
    const selected = lines.filter((line) => line.startsWith(marker.split(' reason=')[0]));
    assert.ok(!JSON.stringify(selected).includes(result.medId) && !JSON.stringify(selected).includes(result.day)
      && !JSON.stringify(selected).includes(String(result.stock)) && !JSON.stringify(selected).includes(result.source), `${id} ${sink}: no ID/stock/day/free source`);
  }
  const launch = ['confirm-prompted', 'followup-prompted', 'reopen'].includes(mode);
  assert.ok(result.launches.length === (launch ? 1 : 0), `${mode}: exact controlled launch count`);
  if (launch) {
    assert.ok(result.launches[0] === result.expectedHref && result.expectedHref.startsWith('mailto:e3-doctor%40example.invalid?'), `${mode}: original synthetic mailto URL`);
    const url = new URL(result.launches[0]);
    assert.ok(url.searchParams.get('subject') === 'Bitte um neues Rezept: Synthetic E3 medication', 'Original mail subject retained');
    assert.ok(url.searchParams.get('body').includes('- Synthetic E3 medication'), 'Original medication mail body retained');
  }
  const writes = result.requests.filter((r) => r.method === 'POST' && !r.url.endsWith('/med_list_v2'));
  assert.ok(writes.length === (mode === 'ack' || mode === 'ack-error' ? 1 : 0), `${mode}: exact write count`);
  if (mode === 'ack' || mode === 'ack-error') {
    assert.ok(writes[0].url.endsWith('/med_ack_low_stock_v2'), 'Original ack RPC');
    assert.ok(JSON.stringify(writes[0].body) === JSON.stringify({ p_med_id: result.medId, p_day: result.day, p_stock_snapshot: result.stock }), 'Ack retains ID/stock/day payload');
    assert.ok(!result.buttonDisabled, 'Ack releases busy');
    assert.ok(result.requests.filter((r) => r.url.endsWith('/med_list_v2')).length === (mode === 'ack' ? 1 : 0), 'Ack refresh count preserved');
  }
  if (mode === 'ack-error') {
    for (const lines of Object.values(result.outputs)) assert.ok(lines.includes('[capture:med] low-stock ack error code=medication_action_failed'), 'E2 ack error retained');
    assert.ok(!JSON.stringify(result.outputs).includes('SYNTHETIC_E2_RAW_CANARY'), 'E2 ack error remains bounded');
  }
  if (mode === 'confirm-armed') assert.ok(result.ui.includes('confirming') && result.ui.includes(result.medId), 'Confirm UI/ID retained');
  if (mode === 'cancel') assert.ok(!result.ui.includes('data-med-mail-confirm='), 'Cancel clears confirm UI');
  if (launch) assert.ok(result.ui.includes('reorder_prompted'), 'Prompted UI retained');
  if (mode.startsWith('followup') || mode === 'reopen') {
    const expected = { 'followup-blocked': 'medication-reorder-doctor-email-missing', 'followup-lock': 'reorder-launch-locked',
      'followup-cooldown': 'reorder-reopen-cooldown', 'followup-unauth': 'medication-not-authenticated', 'followup-missing': 'medication-module-missing' };
    assert.ok(result.result.ok === launch && result.result.reason === (expected[mode] || null), `${mode}: original API status/guard`);
    if (launch) assert.ok(result.result.medId === result.medId && result.result.dayIso === result.day, 'Follow-up identity/day return retained');
  }
}

// Original main day-change/timer block, not a copied reset implementation.
function mainResetSource() {
  const main = read('assets/js/main.js');
  const start = main.indexOf('function millisUntilNextMidnight(){');
  const end = main.indexOf('/** END MODULE */', start);
  assert.ok(start >= 0 && end > start, 'Main day-change block boundary');
  return main.slice(start, end);
}

function installE2Providers() {
  const state = globalThis.__test;
  state.canary = 'SYNTHETIC_E2_RAW_CANARY';
  state.requests = [];
  state.authCalls = [];
  state.delays = [];
  state.readFail = false;
  state.failRpc = '';
  state.saveFail = false;
  state.rawError = Object.assign(new Error(state.canary + ':message'), {
    details: state.canary + ':details', code: state.canary + ':code', status: state.canary + ':status'
  });
  state.medRows = [{ id: 'E2_MED_ID', name: 'Synthetic medication', active: true,
    low_stock: true, stock_count: 3, total_count: 1, taken_count: 0,
    slots: [{ slot_id: 'E2_SLOT_ID', slot_type: 'morning', qty: 1, is_taken: false }] }];
  const baseFetch = globalThis.fetch;
  const response = (status, body) => {
    const make = () => ({ status, ok: status >= 200 && status < 300,
      json: async () => JSON.parse(JSON.stringify(body)), clone: make });
    return make();
  };
  globalThis.fetch = async (url, options = {}) => {
    const request = { url: String(url), method: options.method || 'GET',
      body: options.body ? JSON.parse(options.body) : null, headers: options.headers };
    state.requests.push(request);
    if (request.method === 'GET') {
      if (state.readThrow) throw state.rawError;
      return state.readFail ? response(500, { message: state.canary, details: state.canary })
        : response(200, [{ id: 'synthetic-row', payload: state.totals }]);
    }
    const rpc = String(url).split('/').pop();
    if (rpc.startsWith('med_')) {
      if (state.medThrow) throw state.rawError;
      if (state.failRpc === rpc) return response(500, { message: state.canary, details: state.canary });
      return response(200, rpc === 'med_list_v2' ? state.medRows : { ok: true });
    }
    if (state.saveThrow) throw state.rawError;
    if (state.saveFail) {
      state.writes.push(request);
      return response(500, { message: state.canary, details: state.canary, code: state.canary });
    }
    return baseFetch(url, options);
  };
  const auth = globalThis.__providers.fetchWithAuth;
  globalThis.__providers.fetchWithAuth = async (request, options) => {
    state.authCalls.push(options);
    return auth(() => request({ 'x-fixture-auth': 'synthetic' }));
  };
  Object.assign(globalThis.AppModules.supabase, {
    fetchWithAuth: globalThis.__providers.fetchWithAuth,
    baseUrlFromRest: globalThis.__providers.baseUrlFromRest
  });
  globalThis.isLoggedInFast = async () => state.logged;
  globalThis.delay = (ms) => { state.delays.push(ms); return Promise.resolve(); };
  globalThis.localStorage = { values: new Map(), getItem(key) { return this.values.get(key); },
    setItem(key, value) { this.values.set(key, value); } };
}

// Runs identically in VM and isolated browser. Providers are explicit seams.
function installProviders() {
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const state = {
    day: '2031-04-08', logged: true, stage: true, status: 200, hold: false,
    writes: [], refreshes: [], snapshots: [], feedback: [], login: [], console: [],
    loads: [], config: [], release: null, timers: [], clock: 0,
    totals: { water_ml: 811, salt_g: 1.23, protein_g: 24.56 }
  };
  globalThis.__test = state;
  globalThis.todayStr = () => state.day;
  globalThis.setTimeout = (fn, ms = 0) => {
    const timer = { fn, at: state.clock + ms };
    state.timers.push(timer);
    return timer;
  };
  globalThis.clearTimeout = (timer) => { state.timers = state.timers.filter((t) => t !== timer); };
  state.advance = (ms) => {
    state.clock += ms;
    const due = state.timers.filter((t) => t.at <= state.clock);
    state.timers = state.timers.filter((t) => t.at > state.clock);
    due.forEach((t) => t.fn());
  };
  globalThis.console = Object.fromEntries(['debug', 'log', 'info', 'warn', 'error'].map((level) => [
    level, (...args) => state.console.push({ level, args: copy(args) })
  ]));
  const supabaseState = { authState: 'auth', lastLoggedIn: true, intakeRpcDisabled: false };
  globalThis.AppModules = {
    config: { DIAGNOSTICS_ENABLED: true },
    supabase: { supabaseState },
    bootFlow: { isStageAtLeast: () => state.stage },
    hub: { applyAssistantIntakeSnapshot: (value) => state.snapshots.push(copy(value)) },
    feedback: { feedback: (...args) => state.feedback.push(copy(args)) }
  };
  globalThis.isLoggedIn = async () => state.logged;
  globalThis.getUserId = async () => state.logged ? 'synthetic-user' : null;
  globalThis.getConf = async () => 'https://fixture.invalid/rest/v1/health_events';
  globalThis.showLoginOverlay = (value) => state.login.push(value);
  globalThis.requestUiRefresh = (value) => {
    state.refreshes.push(copy(value));
    return Promise.resolve(); // Original producer has resolve-only Promise contract.
  };
  globalThis.fetch = async (url, options) => {
    state.writes.push({ url: String(url), method: options.method, body: JSON.parse(options.body) });
    if (state.hold) await new Promise((resolve) => { state.release = resolve; });
    const status = state.status;
    const body = status === 200 ? [{ id: 'synthetic-row' }] : { message: 'synthetic-save-error' };
    const response = () => ({ status, ok: status === 200, json: async () => copy(body), clone: response });
    return response();
  };
  globalThis.__providers = {
    supabaseState,
    baseUrlFromRest: () => 'https://fixture.invalid',
    fetchWithAuth: async (request) => {
      if (!state.logged) {
        const error = new Error('synthetic-auth-error');
        error.status = 401;
        throw error;
      }
      return request({}); // No real headers/session, retries or HTTP implementation.
    },
    setConfigStatus: (...args) => state.config.push(args),
    getUserId: globalThis.getUserId,
    toEventsUrl: (url) => url,
    sbSelect: async (options) => {
      state.loads.push(copy(options));
      return [{ id: 'synthetic-row', payload: copy(state.totals) }];
    }
  };
}

class Element {
  constructor(id, document) {
    this.id = id;
    this.ownerDocument = document;
    this.value = '';
    this.disabled = false;
    this.innerHTML = '+ Menge';
    this.textContent = '';
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.listeners = {};
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((n) => classes.add(n)),
      remove: (...names) => names.forEach((n) => classes.delete(n)),
      contains: (name) => classes.has(name)
    };
  }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] || []).filter((f) => f !== fn); }
  closest(selector) {
    if (selector === '#cap-intake-wrap') return this.ownerDocument.getElementById('cap-intake-wrap');
    const attr = selector.match(/^\[([^\]]+)\]$/)?.[1];
    return attr && this.getAttribute(attr) !== null ? this : null;
  }
  cloneNode() {
    const element = new Element(this.id, this.ownerDocument);
    element.innerHTML = this.innerHTML;
    element.disabled = this.disabled;
    return element;
  }
  replaceWith(element) { this.ownerDocument.elements.set(this.id, element); }
  click() {
    if (!this.disabled) {
      const event = { target: this, preventDefault() {} };
      (this.listeners.click || []).forEach((fn) => fn(event));
      (this.parentElement?.listeners.click || []).forEach((fn) => fn(event));
    }
  }
}

function fakeDocument() {
  const doc = {
    elements: new Map(), readyState: 'complete',
    getElementById(id) { return this.elements.get(id) || null; },
    querySelector(selector) {
      const kind = selector.match(/^\[data-pill-kind="(\w+)"\]$/)?.[1];
      return kind ? this.getElementById(`pill-${kind}`) : null;
    },
    querySelectorAll: () => [], listeners: {},
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
    dispatchEvent(event) { (this.listeners[event.type] || []).forEach((fn) => fn(event)); }
  };
  for (const id of ['cap-intake-wrap', 'cap-water-add', 'cap-salt-add', 'cap-protein-add',
    'cap-water-add-btn', 'cap-salt-protein-btn', 'diag', 'diagLog', 'diagClose',
    'pill-water', 'pill-salt', 'pill-protein']) doc.elements.set(id, new Element(id, doc));
  return doc;
}

async function settle(fixture) {
  // No sleeps/polling: bounded Promise turns, then controlled debounce/feedback clock.
  for (let i = 0; i < 30; i++) await Promise.resolve();
  fixture.window.__test.advance(200);
}

function createFixture(options = {}) {
  const window = { document: fakeDocument(), performance: { now: () => 0 }, URL, addEventListener() {} };
  window.window = window;
  const context = vm.createContext(window);
  vm.runInContext(`(${installProviders.toString()})();`, context);
  if (options.e2 || options.e3) {
    window.CustomEvent = class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } };
    for (const id of ['medDailyList', 'medLowStockBox', 'medicationBatchFooter', 'medicationBatchActions',
      ...(options.errorDom ? ['errBox'] : [])]) {
      window.document.elements.set(id, new Element(id, window.document));
    }
    vm.runInContext(`(${installE2Providers.toString()})();`, context);
  }
  if (options.e3) vm.runInContext(`(${installE3Providers.toString()})();`, context);
  for (const source of options.e3 ? e3Sources() : options.e2 ? e2Sources() : sources(options.intakeSource)) vm.runInContext(source, context);
  if (options.e2 || options.e3) window.AppModules.captureGlobals.sleep = window.delay;
  window.captureIntakeState.totals = clone(window.__test.totals);
  window.captureIntakeState.logged = true;
  window.diag.init();
  window.AppModules.capture.bindIntakeCapture();
  return { window, context, api: window.AppModules.capture, state: window.__test,
    medButton: (hostId, attributes) => {
      const button = new Element('synthetic-med-button', window.document);
      for (const [key, value] of Object.entries(attributes)) button.setAttribute(key, value);
      button.parentElement = window.document.getElementById(hostId);
      return button;
    },
    element: (id) => window.document.getElementById(id) };
}

const events = {
  'F35-C34': { prefix: '[capture] parsed ', marker: '[capture] parsed water' },
  'F35-C35': { prefix: '[capture] totals ', marker: '[capture] totals calculated' },
  'F35-C36': { prefix: '[capture] save start ', marker: '[capture] save start water' },
  'F35-C39': { prefix: '[capture] totals ', marker: '[capture] totals calculated' },
  'F35-C40': { prefix: '[capture] save start ', marker: '[capture] save start salt+protein' }
};

function sinks(window) {
  return {
    touch: window.diag.lines.map((entry) => entry.base.replace(/^\[[^\]]+\] /, '').replace(/^\[(?:ERROR|WARN|INFO)\] /, '')),
    logger: window.AppModules.diagnosticsLayer.logger.history.map((entry) => entry.message),
    console: window.__test.console.filter((entry) => entry.args[0] === '[diagnostics/logger]').map((entry) => entry.args[1])
  };
}

function checkEvents(observed, ids) {
  for (const [sink, lines] of Object.entries(observed)) {
    for (const id of ids) {
      const { prefix, marker } = events[id];
      const matches = lines.filter((line) => line.startsWith(prefix));
      // Boolean assertions keep synthetic payloads out of failed test output.
      assert.ok(matches.length === 1, `${id} ${sink}: exactly one target event`);
      assert.ok(matches[0] === marker, `${id} ${sink}: value-free positive marker`);
      assert.ok(!/[{}]|water_ml|salt_g|protein_g|\d/.test(matches[0]), `${id} ${sink}: no values or totals`);
    }
  }
}

function markup() {
  const html = read('index.html');
  const start = html.indexOf('<div class="hub-intake-form" id="cap-intake-wrap">');
  assert.ok(start >= 0, 'Original intake markup');
  const tail = html.slice(start);
  let depth = 0;
  for (const tag of tail.matchAll(/<\/?div\b[^>]*>/g)) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (!depth) {
      const part = tail.slice(0, tag.index + tag[0].length);
      const log = html.match(/<pre id="diagLog"[^>]*><\/pre>/)?.[0];
      assert.ok(log, 'Original Touchlog markup');
      return `<title>MIDAS E1 isolated fixture</title>${part}${log}`;
    }
  }
  throw new Error('Original intake markup boundary');
}

module.exports = { root, read, clone, sources, e2Sources, mainResetSource, installProviders,
  installE2Providers, createFixture, settle, events, sinks, checkEvents, markup,
  e3Sources, installE3Providers, runE3Scenario, e3Cases, checkE3 };
