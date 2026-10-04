'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function setup() {
  const context = vm.createContext({ TextEncoder, setTimeout, clearTimeout, crypto: require('node:crypto').webcrypto });
  for (const file of ['semantics.js', 'semantics-v2.js', 'session-draft.js', 'session-template.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
  }
  return context.AppModules.activityV2;
}
const base = { schema_version: 'midas.activity-session-template.v1', catalog_version: 2,
  name: 'Gewohnte Einheit', items: [{ item_order: 1, item_key: 'leg_curl' }] };
test('R15 T01: exact parser, limits and catalog identity', () => {
  const api = setup();
  const parse = text => api.sessionTemplate.parse(text, api.semanticsV2);
  const mutate = fn => { const value = structuredClone(base); fn(value); return JSON.stringify(value); };
  const invalid = [
    ['malformed', '{'], ['unknown root field', mutate(v => { v.sets = []; })],
    ['wrong schema', mutate(v => { v.schema_version += '.future'; })],
    ['wrong catalog', mutate(v => { v.catalog_version = 1; })],
    ['unsafe catalog', mutate(v => { v.catalog_version = 9007199254740992; })],
    ['zero catalog', mutate(v => { v.catalog_version = 0; })],
    ['blank name', mutate(v => { v.name = '  '; })], ['long name', mutate(v => { v.name = 'ä'.repeat(81); })],
    ['empty items', mutate(v => { v.items = []; })], ['too many', mutate(v => { v.items = Array(51).fill(v.items[0]); })],
    ['order gap', mutate(v => { v.items[0].item_order = 2; })],
    ['unsafe order', mutate(v => { v.items[0].item_order = 9007199254740992; })],
    ['unknown key', mutate(v => { v.items[0].item_key = 'invented'; })],
    ['duplicate key', mutate(v => { v.items.push({ item_order: 2, item_key: 'leg_curl' }); })],
    ['performance', mutate(v => { v.items[0].weight_kg = 20; })],
    ['prototype', JSON.stringify(base).replace('"name":', '"__proto__":{},"name":')],
    ['duplicate property', JSON.stringify(base).replace('"name":', '"name":"first","name":')],
    ['escaped duplicate property', JSON.stringify(base).replace('"name":', '"na\\u006de":"first","name":')],
    ['oversize UTF8', JSON.stringify(base).replace('Gewohnte Einheit', 'ä'.repeat(33000))]
  ];
  for (const [label, text] of invalid) assert.throws(() => parse(text), { name: 'ActivityTemplateError' }, label);
  const normalized = parse(mutate(v => { v.name = '  Einheit ä  '; }));
  assert.equal(normalized.name, 'Einheit ä');
  assert.equal(Object.isFrozen(normalized.items[0]), true);
  assert.equal(parse(mutate(v => { v.name = '🦵'.repeat(80); })).name.length, 160);
  const inactiveSemantics = { getCatalog: () => ({ catalog_version: 2 }), getEntryByKey: () => ({ status: 'inactive' }) };
  assert.throws(() => api.sessionTemplate.parse(JSON.stringify(base), inactiveSemantics), { code: 'UNKNOWN_ITEM' });
  const fifty = { ...base, items: api.semanticsV2.getCatalog().entries.slice(0, 50).map((entry, index) => ({ item_order: index + 1, item_key: entry.key })) };
  assert.equal(parse(JSON.stringify(fifty)).items.length, 50);
  const accessor = Object.defineProperty({}, 'name', { get() { throw new Error('getter executed'); } });
  assert.throws(() => api.sessionTemplate.validate(accessor, api.semanticsV2), { code: 'INVALID_TEMPLATE' });
});
test('R15 T01: normal factory, empty performance, first-item timer, example and schema', () => {
  const api = setup();
  const raw = fs.readFileSync(path.resolve(__dirname, '../../../../../docs/reference/activity-v2/activity-session-template-v1.example.json'), 'utf8');
  const template = api.sessionTemplate.parse(raw, api.semanticsV2);
  const result = api.sessionTemplate.compose(template, { semantics: api.semanticsV2, sessionDraft: api.sessionDraft,
    now: () => Date.parse('2026-10-04T08:00:00.000Z'), createRequestId: () => '00000000-0000-4000-8000-000000000001' });
  const snapshot = result.draft.getSnapshot();
  assert.equal(snapshot.request_id, '00000000-0000-4000-8000-000000000001');
  assert.equal(snapshot.started_at, '2026-10-04T08:00:00.000Z');
  assert.equal(snapshot.protein_target_relevant, true);
  assert.equal(snapshot.note, null);
  assert.deepEqual(Array.from(snapshot.items, item => item.item_key), Array.from(template.items, item => item.item_key));
  for (const item of snapshot.items) {
    assert.equal(item.duration_min, null);
    assert.equal(item.distance_km, null);
    for (const set of item.sets) for (const key of ['reps', 'weight_kg', 'assistance_kg', 'duration_sec', 'distance_m']) assert.equal(set[key], null);
  }
  const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../../docs/reference/activity-v2/activity-session-template-v1.schema.json'), 'utf8'));
  assert.equal(schema.properties.schema_version.const, template.schema_version);
  assert.deepEqual(schema.required.sort(), Object.keys(template).sort());
});
test('R15 T01: file size checked before reading and read errors have no composition', async () => {
  const api = setup();
  let reads = 0;
  await assert.rejects(api.sessionTemplate.readFile({ size: 65537, text: () => { reads += 1; return JSON.stringify(base); } }, api.semanticsV2), { code: 'INVALID_FILE' });
  assert.equal(reads, 0);
  const file = { size: JSON.stringify(base).length, text: async () => JSON.stringify(base) };
  assert.equal((await api.sessionTemplate.readFile(file, api.semanticsV2)).items.length, 1);
  await assert.rejects(api.sessionTemplate.readFile({ size: 1, text: async () => '{' }, api.semanticsV2), { code: 'INVALID_JSON' });
});
