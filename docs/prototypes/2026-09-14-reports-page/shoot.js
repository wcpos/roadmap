// Screenshot + smoke-test the Reports page prototype (second cut). Throwaway.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname;
const OUT = path.join(DIR, 'screens');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1500 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(DIR, 'index.html'));

  const shot = async (name) => { await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.png'), animations: 'disabled' }); console.log('shot', name); };
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const act = (sel) => page.click(sel);
  const has = async (text) => { const t = await page.locator('#frame').textContent(); if (!t.includes(text)) throw new Error(`expected "${text}" in frame`); };
  const esc = () => page.keyboard.press('Escape');

  // Tablet, Pro
  await shot('tablet-summary-session');
  await act('.chart .cmp button[data-c="week"]'); await shot('tablet-chart-week');
  await act('.chart .cmp button[data-c="online"]'); await shot('tablet-chart-online');
  await act('.chart .cmp button[data-c="yesterday"]');
  await act('input.cb[data-n="1240"]'); await act('input.cb[data-n="1238"]'); await shot('tablet-unticked'); await has('2 orders unticked');
  await act('input.cb[data-act="tickAll"]'); await has('all selected');
  await act('.sel2[data-p="report"]'); await shot('tablet-report-select'); await has('pick dates in the date pill');
  await act('.pop .pr[data-k="tax"]'); await shot('tablet-sales-tax');
  await act('.sel2[data-p="template"]'); await shot('tablet-template-select'); await act('.pop .pr[data-t="thermal"]'); await shot('tablet-template-thermal');
  await act('.sel2[data-p="template"]'); await act('.pop .pr[data-t="a4"]'); await shot('tablet-template-a4');
  await act('.sel2[data-p="template"]'); await act('.pop .pr[data-t="default"]');
  await act('.sel2[data-p="report"]'); await act('.pop .pr[data-k="session"]'); await shot('tablet-session-open');
  await act('.chip[data-p="date"]'); await shot('tablet-date-popover');
  await act('.pop .pr[data-s="c12"]'); await shot('tablet-session-closure-12');
  await act('.chip[data-p="date"]'); await act('.pop .pr[data-r="last7"]'); await shot('tablet-summary-last7'); await has('Sales summary');
  await act('.sel2[data-p="report"]'); await act('.pop .pr[data-k="closures"]'); await act('.chip[data-p="register"]'); await act('.pop .pr[data-r="all"]'); await shot('tablet-closures-week');
  await act('table.t tr.click[data-s="c11"]'); await shot('tablet-closure-11-settled'); await has('settled');
  await act('[data-act="unselect"]');
  await act('.sel2[data-p="report"]'); await act('.pop .pr[data-k="cash"]'); await shot('tablet-cash');
  await act('.sel2[data-p="report"]'); await act('.pop .pr[data-k="deposits"]'); await shot('tablet-deposits');
  await set('online', 'false'); await shot('tablet-deposits-offline'); await has('unavailable offline'); await set('online', 'true');
  await set('stores', '2'); await act('.chip[data-p="store"]'); await shot('tablet-store-popover'); await esc(); await set('stores', '1');
  await set('regOpen', 'false'); await shot('tablet-register-closed'); await set('regOpen', 'true');

  // Free
  await set('pro', 'false'); await shot('free-summary');
  await act('.chip[data-p="date"]'); await shot('free-date-popover'); await act('.pop .pr.lock'); await shot('free-date-hint'); await has('are in WCPOS Pro'); await esc();
  await act('.chip[data-p="register"]'); await act('.pop .pr.lock'); await shot('free-register-hint'); await esc();
  await act('.chip[data-p="date"]'); await act('.pop .pr[data-s="c12"]'); await act('.sel2[data-p="report"]'); await act('.pop .pr[data-k="session"]'); await shot('free-session-closure-12');
  await set('pro', 'true');

  // Dark
  await set('theme', 'dark'); await shot('tablet-dark'); await set('theme', 'light');

  // Phone
  await set('viewport', 'phone');
  await shot('phone-summary');
  await act('.chart .cmp button[data-c="week"]'); await shot('phone-chart-week'); await act('.chart .cmp button[data-c="yesterday"]');
  await act('[data-act="phoneTab"][data-t="orders"]'); await shot('phone-orders'); await act('[data-act="phoneTab"][data-t="report"]');
  await act('.chip[data-p="date"]'); await shot('phone-date-sheet'); await esc();
  await act('.sel2[data-p="report"]'); await shot('phone-report-sheet'); await act('.sheet .pr[data-k="session"]'); await shot('phone-session');
  await act('.chip[data-p="date"]'); await act('.sheet .pr[data-r="today"]'); await act('.sel2[data-p="report"]'); await act('.sheet .pr[data-k="closures"]'); await shot('phone-closures');
  await act('table.t tr.click[data-s="c12"]'); await shot('phone-closure-12'); await act('[data-act="unselect"]');
  await set('pro', 'false'); await act('.chip[data-p="date"]'); await act('.sheet .pr.lock'); await shot('phone-free-hint'); await esc(); await set('pro', 'true');

  await page.locator('#panelmock').screenshot({ path: path.join(OUT, 'panel-mapping.png') });

  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok, no page errors');
})().catch(e => { console.error(e); process.exit(1); });
