import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(path.join(process.cwd(), 'package.json'));
const { JSDOM } = require('jsdom');
const dir = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
let assertions = 0;
let failures = 0;
const expect = {
  equal(actual, expected, message) { assertions++; assert.equal(actual, expected, message); },
  deepEqual(actual, expected, message) { assertions++; assert.deepEqual(actual, expected, message); },
  match(actual, expected, message) { assertions++; assert.match(actual, expected, message); },
};
const test = (name, callback) => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://tender-pane.test/' });
  try {
    callback(dom.window);
    console.log(`ok — ${name}`);
  } catch (error) {
    failures++;
    console.error(`not ok — ${name}\n${error.stack}`);
  } finally {
    dom.window.close();
  }
};
const click = (window, selector) => window.document.querySelector(selector).click();
const press = (window, key) => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key }));
const state = (window, expression) => {
  const value = window.eval(expression);
  return value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
};

test('split view blocks keypad input and Escape closes it', window => {
  click(window, '[data-split]');
  const before = state(window, '[S.sheet, S.entry, S.legs.length, S.view]');
  press(window, '1');
  press(window, 'Enter');
  expect.deepEqual(state(window, '[S.sheet, S.entry, S.legs.length, S.view]'), before);
  press(window, 'Escape');
  expect.equal(state(window, 'S.sheet'), 0);
});

test('pointer and keyboard digits enter displayed pounds', window => {
  click(window, '[data-key="2"]');
  click(window, '[data-key="0"]');
  expect.equal(state(window, 'S.entry'), 20);
  state(window, "jump('fresh')");
  press(window, '2');
  press(window, '0');
  expect.equal(state(window, 'S.entry'), 20);
});

test('method changes retain valid entries and clear invalid over-tender', window => {
  state(window, "jump('typed')");
  click(window, '[data-pick="card"]');
  expect.equal(state(window, 'S.entry'), 20);
  state(window, 'S.entry=50; render()');
  click(window, '[data-pick="sumup"]');
  expect.equal(state(window, 'S.entry'), null);
});

test('Cancel payment clears payment and split bookkeeping', window => {
  state(window, "S.legs=[{title:'Cash',amount:18}]; S.plan={kind:'items',first:22,ids:['scarf'],ways:1,from:1,title:'Scarf'}; S.itemsPaid={belt:'Cash'}; S.pickItems=['scarf']; render()");
  click(window, '[data-split]');
  click(window, '[data-cancel-payment]');
  expect.deepEqual(state(window, '[S.legs.length,S.plan,Object.keys(S.itemsPaid).length,S.pickItems.length,S.sheet]'), [0, null, 0, 0, 0]);
});

test('terminal methods refuse over-tender entered with Enter', window => {
  state(window, "S.method='sumup'; S.entry=50; render()");
  press(window, 'Enter');
  expect.deepEqual(state(window, '[S.view,S.term]'), ['keypad', null]);
});

test('custom Amount split becomes a fixed two-leg plan', window => {
  click(window, '[data-split]');
  click(window, '[data-tab="amount"]');
  click(window, '[data-ways="custom"]');
  expect.deepEqual(state(window, '[S.plan.kind,S.sheet,S.entry]'), ['custom', 0, 0]);
  state(window, 'S.entry=20; render()');
  expect.deepEqual(state(window, 'figures().plan.legs.map(l=>l.v)'), [20, 26]);
  state(window, "S.entry=20; take('cash')");
  expect.deepEqual(state(window, '[S.plan.kind,S.plan.first,S.legs.length,figures().remaining]'), ['fixed', 20, 1, 26]);
});

test('item groups remain current until their total is covered', window => {
  state(window, "S.plan={kind:'items',first:22,ids:['scarf'],ways:1,from:0,title:'Scarf'}; S.method='card'; S.entry=10; take('card')");
  expect.deepEqual(state(window, '[S.itemsPaid.scarf||null,figures().thisPay,!!document.querySelector(\'[data-tab-open="item"]\')]'), [null, 12, false]);
  state(window, "S.entry=12; take('card')");
  expect.deepEqual(state(window, '[S.itemsPaid.scarf,S.legs.length,figures().plan.afterGroup,!!document.querySelector(\'[data-tab-open="item"]\')]'), ['Card', 2, true, true]);
});

test('reduced motion disables the terminal ring animation', window => {
  const css = [...window.document.styleSheets[0].cssRules].map(rule => rule.cssText).join('\n');
  expect.match(css, /prefers-reduced-motion[\s\S]*\.ring\s*\{\s*animation:\s*none\s*!important/);
});

test('terminal phase updates preserve the view nodes', window => {
  const timers = [];
  window.setTimeout = callback => { timers.push(callback); return timers.length; };
  state(window, "S.method='sumup'; take('sumup')");
  const ring = window.document.querySelector('.ring');
  timers[0]();
  expect.equal(window.document.querySelector('.ring'), ring);
  expect.match(window.document.querySelector('[data-terminal-status]').textContent, /Waiting/);
});

test('terminal outcome Jump states expose recovery actions', window => {
  for (const [jump, copy] of [['terminal-failed','failed'], ['terminal-cancelled','cancelled'], ['terminal-expired','expired']]) {
    state(window, `jump('${jump}')`);
    expect.match(window.document.querySelector('[data-terminal-status]').textContent.toLowerCase(), new RegExp(copy));
    expect.equal(!!window.document.querySelector('[data-terminal-retry]'), true);
    expect.equal(!!window.document.querySelector('[data-terminal-choose]'), true);
  }
  for (const jump of ['terminal-cancel-requested','terminal-cancelling']) {
    state(window, `jump('${jump}')`);
    expect.match(window.document.querySelector('[data-terminal-status]').textContent, /cancel/i);
  }
});

test('split takeover retains the normal checkout header controls', window => {
  state(window, "S.legs=[{title:'Cash',amount:20}]; render()");
  click(window, '[data-split]');
  expect.equal(!!window.document.querySelector('[data-cancel-payment]'), true);
  expect.equal(!!window.document.querySelector('.hd .seg'), true);
});

test('terminal header derives the mock order item count', window => {
  state(window, "jump('terminal')");
  expect.match(window.document.querySelector('.hd .title').textContent, /3 items/);
});

if (failures) {
  console.error(`FAILED (${failures} of 12 tests; ${assertions} assertions)`);
  process.exitCode = 1;
} else {
  console.log(`OK (12 tests, ${assertions} assertions)`);
}
