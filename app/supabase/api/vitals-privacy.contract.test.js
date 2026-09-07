'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, 'vitals.js');
const source = fs.readFileSync(sourcePath, 'utf8');

test('R14 vitals calculation diagnostics expose only abstract failure markers', () => {
  const diagnosticLines = source
    .split(/\r?\n/)
    .filter((line) => line.includes('[vitals] calcMAP failed'));

  assert.deepEqual(diagnosticLines.map((line) => line.trim()), [
    "diag.add?.('[vitals] calcMAP failed code=calculator_exception');",
    "diag.add?.('[vitals] calcMAP failed code=aggregation_exception');"
  ]);

  for (const line of diagnosticLines) {
    assert.doesNotMatch(
      line,
      /\b(?:sys|dia|day|ctx|value|payload|comment|note|error|err)\b|\$\{|JSON\.stringify/i
    );
  }
});

test('R14 vitals calculation failure paths never write raw console context', () => {
  assert.doesNotMatch(source, /console\.(?:log|debug|info|warn|error)\s*\(/);
  assert.doesNotMatch(
    source,
    /\[vitals\][^\n]*(?:\$\{|JSON\.stringify|\{\s*(?:sys|dia|day|ctx)|err\?\.|error\s*:)/i
  );
});
