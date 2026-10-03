'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
const start = source.indexOf("doc?.addEventListener('protein:refresh-state',");
const end = source.indexOf("global.addEventListener('assistant:meal-followup-request',", start);
assert(start >= 0 && end > start, 'actual Hub listener registration must exist');
const registration = source.slice(start, end);

function fixture(open, state, refreshStatus) {
  let listener;
  const rendered = [];
  const profile = { protein_target_max: 90 };
  const status = { textContent: `${state} sentinel` };
  const context = {
    doc: { addEventListener: (event, callback) => { assert.equal(event, 'protein:refresh-state'); listener = callback; } },
    appModules: { profile: { getData: () => profile }, protein: { getActivityRefreshState: () => ({ status: refreshStatus }) } },
    assistantProfileSnapshot: null,
    renderAssistantContextExtras: value => rendered.push(value),
    proteinContextDialogState: { open, root: { dataset: { state } }, status }
  };
  vm.runInNewContext(registration, context);
  listener();
  assert.deepEqual(rendered, [profile], 'assistant context still refreshes for every event');
  return status.textContent;
}

for (const state of ['loading', 'empty', 'error']) {
  test(`protein refresh preserves open ${state} dialog status`, () => {
    for (const refresh of ['pending', 'error', 'ready']) assert.equal(fixture(true, state, refresh), `${state} sentinel`);
  });
}
test('protein refresh preserves closed dialog status', () => {
  for (const refresh of ['pending', 'error', 'ready']) assert.equal(fixture(false, 'data', refresh), 'data sentinel');
});
test('protein refresh updates only open data dialog with existing pending/error/ready text', () => {
  for (const refresh of ['pending', 'error']) assert.equal(fixture(true, 'data', refresh), 'Training bestätigt; Proteinziel noch nicht aktualisiert. Retry im Training verfügbar.');
  assert.equal(fixture(true, 'data', 'ready'), 'Gespeicherte Werte; es wird nichts neu berechnet.');
});
