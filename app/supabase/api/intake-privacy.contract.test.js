'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, 'intake.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const diagnosticArguments = [...source.matchAll(/diag\.add\?\.\(([\s\S]*?)\);/g)]
  .map((match) => match[1]);

test('R14 intake diagnostics expose only abstract operation, result and error markers', () => {
  assert.match(source, /diag\.add\?\.\('\[capture\] loadIntakeToday start'\)/);
  assert.match(
    source,
    /diag\.add\?\.\(`\[capture\] loadIntakeToday done result=\$\{row \? 'found' : 'empty'\}`\)/
  );
  assert.match(source, /diag\.add\?\.\('\[intake\] POST failed code=rest_post_rejected'\)/);
  assert.match(source, /diag\.add\?\.\('\[intake\] cleanup failed code=cleanup_exception'\)/);

  for (const argument of diagnosticArguments) {
    assert.doesNotMatch(
      argument,
      /maskUid|JSON\.stringify|user_id|baseDay|dayIso|payload|details|err\?\.|\b(?:uid|id|water_ml|salt_g|protein_g)\b/i
    );
  }
});

test('R14 intake privacy hardening preserves transport and returned data contracts', () => {
  assert.doesNotMatch(source, /console\.(?:log|debug|info|warn|error)\s*\(/);
  assert.match(source, /body:\s*JSON\.stringify\(payload\)/);
  assert.match(source, /body:\s*JSON\.stringify\(\{ payload: payloadTotals \}\)/);
  assert.match(source, /errPatch\.details = detailsPatch/);
  assert.match(source, /err\.details = details/);
  assert.match(source, /water_ml:\s*Number\(payload\.water_ml \|\| 0\)/);
  assert.match(source, /salt_g:\s*Number\(payload\.salt_g \|\| 0\)/);
  assert.match(source, /protein_g:\s*Number\(payload\.protein_g \|\| 0\)/);
});
