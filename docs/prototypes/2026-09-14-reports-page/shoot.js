// Screenshot + smoke-test the Reports page prototype. Throwaway.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname;
const OUT = path.join(DIR, 'screens');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(DIR, 'index.html'));

  const shot = async (name) => { await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.png'), animations: 'disabled' }); console.log('shot', name); };
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const act = (sel) => page.click(sel);
  const has = async (text) => { const t = await page.locator('#frame').textContent(); if (!t.includes(text)) throw new Error(`expected "${text}" in frame`); };

  // Picker B (default), tablet, Pro
  await shot('B-tablet-session-open');
  await act('.rlist .li[data-k="closures"]'); await shot('B-tablet-closures-today'); await has('Closures'); await act('.chip.on'); await act('.pop .pr[data-r="last7"]'); await act('.chip[data-p="register"]'); await act('.pop .pr[data-r="all"]'); await shot('B-tablet-closures-week');
  await act('table.t tr.click[data-s="c11"]'); await shot('B-tablet-closure-11-settled'); await has('settled');
  await act('.rlist .li[data-k="sales"]'); await shot('B-tablet-sales-payment');
  await act('.gb .c[data-g="tax"]'); await shot('B-tablet-sales-tax');
  await act('.scopebar .mode button[data-m="range"]'); await act('.chip.on'); await shot('B-tablet-sales-range-popover');
  await act('.pop .pr[data-r="last7"]'); await shot('B-tablet-sales-last7');
  await act('.rlist .li[data-k="cash"]'); await shot('B-tablet-cash');
  await act('.rlist .li[data-k="deposits"]'); await shot('B-tablet-deposits');
  await set('online', 'false'); await shot('B-tablet-deposits-offline'); await has('unavailable offline'); await set('online', 'true');
  await page.fill('input[data-search]', 'tax'); await shot('B-tablet-search-tax'); await has('by Tax rate'); await page.fill('input[data-search]', '');
  await act('.rlist .li[data-k="session"]'); await act('.chip.on'); await shot('B-tablet-session-popover');
  await act('.pop .pr[data-s="c10"]'); await shot('B-tablet-session-closure-10');
  await set('stores', '2'); await act('.chip[data-p="store"]'); await shot('B-tablet-store-popover'); await page.keyboard.press('Escape'); await set('stores', '1');
  await set('regOpen', 'false'); await shot('B-tablet-register-closed'); await set('regOpen', 'true');

  // Free, gate in the picker
  await set('pro', 'false'); await shot('B-free-session');
  await act('.chip.on'); await shot('B-free-session-popover');
  await act('.pop .pr.lock'); await shot('B-free-session-popover-hint'); await has('are in WCPOS Pro');
  await page.keyboard.press('Escape');
  await act('.rlist .li[data-k="closures"]'); await shot('B-free-closures');
  await act('.chip.on'); await act('.pop .pr.lock'); await shot('B-free-dates-popover-hint');
  await page.keyboard.press('Escape');
  await act('.chip[data-p="register"]'); await act('.pop .pr.lock'); await shot('B-free-register-popover-hint'); await page.keyboard.press('Escape');
  await act('.rlist .li[data-k="sales"]'); await shot('B-free-sales');
  await set('pro', 'true');

  // Dark
  await set('theme', 'dark'); await shot('B-tablet-dark'); await act('.rlist .li[data-k="sales"]'); await shot('B-tablet-dark-sales'); await set('theme', 'light');

  // Phone
  await set('viewport', 'phone');
  await shot('phone-B-list');
  await act('.rlist .li[data-k="session"]'); await shot('phone-B-session');
  await act('.chip.on'); await shot('phone-B-session-sheet'); await act('.scrim');
  await act('[data-act="back"]'); await act('.rlist .li[data-k="closures"]'); await shot('phone-B-closures');
  await act('table.t tr.click[data-s="c12"]'); await shot('phone-B-closure-12');
  await act('[data-act="unselect"]'); await act('[data-act="back"]'); await act('.rlist .li[data-k="sales"]'); await shot('phone-B-sales');
  await set('pro', 'false'); await act('.chip.on'); await act('.pop .pr.lock, .sheet .pr.lock'); await shot('phone-B-free-hint'); await act('.scrim'); await set('pro', 'true');

  // Below the frame
  await page.locator('#shapes').screenshot({ path: path.join(OUT, 'shapes-side-by-side.png') });
  await page.locator('#panelmock').screenshot({ path: path.join(OUT, 'panel-mapping.png') });

  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok, no page errors');
})().catch(e => { console.error(e); process.exit(1); });
