// Screenshot + smoke-test the Reports page prototype (third cut). Throwaway.
// Playwright is not a dependency of this repo. Resolve it from the environment first, then from a sibling monorepo checkout.
const { chromium } = (() => {
  const path = require('path');
  const candidates = ['playwright', path.join(__dirname, '..', '..', '..', '..', 'monorepo-v2', 'node_modules', 'playwright'), path.join(__dirname, '..', '..', '..', '..', 'monorepo', 'node_modules', 'playwright')];
  for (const c of candidates) { try { return require(c); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } }
  console.error('playwright not found: npm i -D playwright, or keep a monorepo checkout beside this repo'); process.exit(1);
})();
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

  const shot = async (name) => { await page.evaluate(() => window.scrollTo(0, 0)); await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.png'), animations: 'disabled' }); console.log('shot', name); };
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const act = (sel) => page.click(sel);
  const has = async (text) => { const t = await page.locator('#frame').textContent(); if (!t.includes(text)) throw new Error(`expected "${text}" in frame`); };
  const esc = () => page.keyboard.press('Escape');

  // Sales room, tablet, Pro
  await shot('sales-today'); await has('by now last Monday');
  await act('.cmpbtn'); await shot('sales-cmp-menu'); await act('.pop .pr[data-v="yesterday"]'); await shot('sales-vs-yesterday');
  await act('.cmpbtn'); await act('.pop .pr[data-v="lastweek"]');
  await act('rect.hit[data-i="4"]'); await shot('sales-bar-tip'); await act('rect.hit[data-i="4"]');
  await act('[data-act="step"][data-v="1"]'); await shot('sales-yesterday'); await act('[data-act="step"][data-v="-1"]');
  await act('.datebtn'); await shot('date-menu'); await act('.pop .pr[data-v="week:0"]'); await shot('sales-week'); await has('This week');
  await act('[data-act="step"][data-v="1"]'); await shot('sales-last-week');
  await act('.datebtn'); await act('.pop .pr[data-v="month:0"]'); await shot('sales-month'); await has('September so far');
  await act('.datebtn'); await page.fill('#cFrom', '2026-08-01'); await page.fill('#cTo', '2026-09-14'); await act('[data-act="applyRange"]'); await shot('sales-custom-range'); await has('45 days');
  await act('.datebtn'); await page.fill('#cFrom', '2026-05-01'); await act('[data-act="applyRange"]'); await shot('date-range-too-long'); await has('further back than your history'); await esc();
  await act('.datebtn'); await act('.pop .pr[data-v="day:0"]');
  await act('.hero .printb'); await shot('detail-summary'); await has('Sales summary');
  await act('.sel2[data-p="tpl"]'); await shot('detail-template-menu'); await has('Template · report'); await act('.pop .pr[data-v="handover"]'); await shot('detail-summary-handover');
  await act('.sel2[data-p="tpl"]'); await act('.pop .pr[data-v="thermal"]'); await shot('detail-summary-thermal');
  await act('.sel2[data-p="tpl"]'); await act('.pop .pr[data-v="default"]'); await act('[data-act="closePanel"].x');
  await act('.tile[data-v="payments"]'); await shot('detail-payments'); await has('Sales by payment method'); await act('[data-act="closePanel"].x');
  await act('.tile[data-v="cash"]'); await shot('detail-cash'); await has('To bank'); await act('[data-act="closePanel"].x');
  await act('.tile[data-v="categories"]'); await shot('detail-categories'); await act('[data-act="closePanel"].x');
  await act('.tile[data-v="orders"]'); await shot('detail-orders');
  await act('input.cb[data-k="day:0:1237"]'); await act('input.cb[data-k="day:0:1234"]'); await shot('detail-orders-unticked'); await has('2 orders left out');
  await act('.sel2[data-p="tpl"]'); await act('.pop .pr[data-v="a4"]'); await shot('detail-orders-a4'); await act('.sel2[data-p="tpl"]'); await act('.pop .pr[data-v="default"]');
  await act('[data-act="closePanel"].x'); await shot('sales-with-excluded'); await act('[data-act="resetTicks"]');
  await act('.tile[data-v="products"]'); await shot('detail-products'); await act('[data-act="closePanel"].x');
  await act('.tile[data-v="channels"]'); await shot('detail-channels'); await act('[data-act="closePanel"].x');
  await act('.btn.fbtn'); await shot('filter-menu'); await act('.pop .pr[data-v="Dylan"]'); await shot('sales-cashier-dylan'); await act('.btn.fbtn'); await act('.pop .pr[data-v="all"]');
  await set('stores', '2'); await act('.scope'); await shot('scope-menu'); await act('.pop .pr[data-v="all"]'); await shot('sales-all-registers'); await has('Registers'); await act('.scope'); await act('.pop .pr[data-v="front"]'); await set('stores', '1');
  await set('online', 'false'); await shot('sales-offline'); await has('Unavailable offline'); await set('online', 'true');

  // Closures room
  await act('[data-act="view"][data-v="closures"]'); await shot('closures'); await has('expected in drawer');
  await act('[data-act="xreport"]'); await shot('closures-xreport'); await has('interim'); await act('[data-act="closePanel"].x');
  await act('tr[data-v="c11"]'); await shot('closure-11-settled'); await has('Settled');
  await act('.sel2[data-p="tpl"]'); await shot('closure-template-menu'); await act('.pop .pr[data-v="thermal"]'); await shot('closure-11-thermal');
  await act('.sel2[data-p="tpl"]'); await act('.pop .pr[data-v="a4"]'); await shot('closure-11-a4');
  await act('[data-act="closePanel"].x');
  await act('tr[data-v="c2"]'); await shot('closure-2-unsynced'); await act('[data-act="closePanel"].x');
  await set('regOpen', 'false'); await shot('closures-register-closed'); await set('regOpen', 'true');

  // Free
  await set('pro', 'false'); await act('[data-act="view"][data-v="sales"]'); await shot('free-sales');
  await act('[data-act="step"][data-v="1"]'); await shot('free-earlier-hint'); await has('Earlier days are in WCPOS Pro'); await esc();
  await act('.datebtn'); await shot('free-date-menu'); await act('.pop .pr.lock'); await shot('free-week-hint'); await esc();
  await act('.scope'); await act('.pop .pr.lock'); await shot('free-register-hint'); await esc();
  await act('[data-act="view"][data-v="closures"]'); await shot('free-closures'); await act('tr.lock'); await shot('free-closures-hint'); await esc();
  await set('pro', 'true'); await act('[data-act="view"][data-v="sales"]');

  // Dark
  await set('theme', 'dark'); await shot('sales-dark'); await set('theme', 'light');

  // Phone
  await set('viewport', 'phone');
  await shot('phone-sales'); await act('.datebtn'); await shot('phone-date-sheet'); await act('.sheet .pr[data-v="week:0"]'); await shot('phone-week'); await act('.datebtn'); await act('.sheet .pr[data-v="day:0"]');
  await act('.cmpbtn'); await shot('phone-cmp-sheet'); await esc();
  await act('.tile[data-v="orders"]'); await shot('phone-orders'); await act('[data-act="closePanel"]');
  await act('.tile[data-v="payments"]'); await shot('phone-payments'); await act('[data-act="closePanel"]');
  await act('[data-act="view"][data-v="closures"]'); await shot('phone-closures');
  await act('tr[data-v="c12"]'); await shot('phone-closure-12'); await act('[data-act="closePanel"]');
  await set('pro', 'false'); await act('[data-act="view"][data-v="sales"]'); await act('[data-act="step"][data-v="1"]'); await shot('phone-free-hint'); await esc(); await set('pro', 'true');

  await page.locator('#panelmock').screenshot({ path: path.join(OUT, 'panel-mapping.png') });

  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok, no page errors');
})().catch(e => { console.error(e); process.exit(1); });
