'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../..');
test('R15 T05: actual product/harness script order and SW cache assets agree', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const harness = fs.readFileSync(path.join(__dirname, 'activity-product-last-mile-harness.html'), 'utf8');
  const appCss = fs.readFileSync(path.join(root, 'app/app.css'), 'utf8');
  const css = index.match(/<link rel="stylesheet" href="(app\/app\.css\?v=\d+)"/)[1];
  assert.equal(css, 'app/app.css?v=32');
  assert.ok(sw.includes(`toUrl('${css}')`), 'parent stylesheet matches SW');
  const activityCss = appCss.match(/@import url\("\.\/(modules\/vitals-stack\/activity\/v2\/activity-product-controller\.css\?v=\d+)"\)/)[1];
  assert.equal(activityCss, 'modules/vitals-stack/activity/v2/activity-product-controller.css?v=32');
  assert.ok(sw.includes(`toUrl('app/${activityCss}')`), 'actual imported activity CSS matches SW');
  const scripts = Array.from(index.matchAll(/<script src="([^"]+)"/g), match => match[1]);
  const names = ['session-draft.js', 'session-template.js', 'session-template-cache.js', 'session-recovery.js', 'activity-product-controller.js'];
  let previous = -1;
  for (const name of names) {
    const matches = scripts.filter(script => script.split('?')[0].endsWith('/' + name));
    assert.equal(matches.length, 1, name);
    const position = scripts.indexOf(matches[0]);
    assert.ok(position > previous, name);
    previous = position;
    assert.ok(fs.existsSync(path.join(root, matches[0].split('?')[0])), name);
    assert.ok(sw.includes(`toUrl('${matches[0]}')`), name);
    assert.equal((harness.match(new RegExp('src="\\./'+name.replaceAll('.', '\\.')+'"', 'g')) || []).length, 1, name);
  }
  assert.match(sw, /const CACHE_VERSION = 'v32'/);
  assert.ok(!scripts.some(script => /activity\/index\.js/.test(script)), 'no V1 writer');
  const recovery = fs.readFileSync(path.join(__dirname, 'session-recovery.js'), 'utf8');
  assert.match(recovery, /const DATABASE_NAME = 'midas_activity_v2_recovery'/);
  assert.match(recovery, /const DATABASE_VERSION = 1/);
  assert.match(recovery, /const STORE_NAME = 'session_recovery'/);
  assert.ok(!recovery.includes('last_used_template'), 'cache is outside Recovery DB');
});
