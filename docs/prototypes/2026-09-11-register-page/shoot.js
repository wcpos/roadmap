// Screenshot + smoke-test the register-in-the-POS-screen prototype. Throwaway.
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
  const scn = (v) => page.click(`.strip button[data-scn="${v}"]`);
  const act = (sel) => page.click(sel);
  const logTop = async () => (await page.locator('#log div').first().textContent());
  const frameText = async () => (await page.locator('#frame').textContent());
  const expect = async (re, what) => { const t = await logTop(); if (!re.test(t)) throw new Error(`${what}: ${t}`); };

  // 1. states, tablet
  await scn('new'); await shot('tablet-1-first-signin');
  await scn('off'); await shot('tablet-2-sessions-off');
  await scn('closed'); await shot('tablet-3-closed-gate');
  await scn('open'); await shot('tablet-4-open-bar');
  await act('[data-act="openPanel"]'); await shot('tablet-5-open-panel');
  await act('[data-act="toggleCollapse"][data-k="mov"]'); await shot('tablet-6-panel-movements');
  await act('[data-act="closePanel"]');
  await scn('overdue'); await shot('tablet-7-overdue-bar');
  await scn('counting'); await shot('tablet-8-counting');

  // 2. states, phone
  await set('viewport', 'phone');
  await scn('closed'); await shot('phone-1-closed-gate');
  await scn('open'); await shot('phone-2-open-cart');
  await act('[data-act="openPanel"]'); await shot('phone-3-panel');
  await act('[data-act="closePanel"]');
  await page.click('.tabbar button[data-set="phoneTab"][data-v="products"]'); await shot('phone-4-products');
  await scn('counting'); await shot('phone-5-counting');
  await scn('new'); await shot('phone-6-first-signin');
  await set('viewport', 'tablet');

  // 3. the full chain: first sign-in → closed → open (float 195) → paid out → void → no sale → X → close → count → override → print → reprint
  await scn('new');
  await page.fill('[data-setup="name"]', 'Till 3'); await act('[data-act="createRegister"]');
  await expect(/created/, 'create register failed');
  if (!/Never opened/.test(await frameText())) throw new Error('closed gate not shown after create');
  await shot('flow-01-closed-after-setup');
  await act('.tile[data-name="Tote bag"]'); await expect(/Price check only/, 'product tap while closed should not add');
  await page.fill('[data-open="counted"]', '195'); await shot('flow-02-open-card-variance');
  await act('[data-act="doOpen"]'); await expect(/Register opened/, 'open failed');
  if (!/Checkout/.test(await frameText())) throw new Error('cart not back after open');
  await shot('flow-03-cart-back');
  await act('[data-act="openPanel"]');
  await act('[data-act="openSheet"][data-mtype="paid_out"]');
  await page.fill('[data-sheet="amount"]', '10'); await page.fill('[data-sheet="reason"]', 'Parking'); await shot('flow-04-paid-out-sheet-over-panel');
  await act('[data-act="doMove"]'); await expect(/Paid out/, 'move failed');
  await page.evaluate('S.countOpen.mov=true; render()'); await shot('flow-05-panel-after-paid-out');
  await act('[data-act="openSheet"][data-type="void"]'); await act('[data-act="voidMove"]'); await expect(/Voided/, 'void failed');
  await act('[data-act="openSheet"][data-mtype="no_sale"]'); await page.fill('[data-sheet="reason"]', 'Change for the meter'); await act('[data-act="doMove"]');
  await act('[data-act="openSheet"][data-type="xreport"]'); await shot('flow-06-xreport'); await act('[data-act="xprint"]');
  await act('[data-act="startCounting"]'); await expect(/counting/, 'start counting failed');
  if (await page.locator('.panel').count()) throw new Error('panel should close on Close register');
  await shot('flow-07-counting-empty');
  if (!(await page.locator('.prodcol .gate').count())) throw new Error('product grid not gated while counting');
  await page.evaluate('S.countOpen.den=true; render()');
  await page.fill('[data-den="20"]', '8'); await page.fill('[data-den="5"]', '3'); await page.fill('[data-den="1"]', '2'); await page.fill('[data-den="0.5"]', '1');
  await shot('flow-08-denominations');
  const cash = await page.inputValue('[data-count="cash"]');
  if (cash !== '177.50') throw new Error('denomination total wrong: ' + cash);
  await act('[data-act="tryClose"]'); await shot('flow-09-override');
  await act('[data-act="approve"]'); await expect(/Closure 1 /, 'closure 1 not written'); await shot('flow-10-closure-written');
  await act('[data-act="print"]'); await shot('flow-11-printed');
  await act('[data-act="closeSheet"]'); await shot('flow-12-closed-gate-after');
  if (!/closure 1\b/.test(await frameText())) throw new Error('closure 1 not shown on the gate');
  await page.evaluate('S.countOpen.lastc=true; render()'); await shot('flow-13-last-closure-under-gate');
  await act('[data-act="openSheet"][data-type="reprint"]'); await shot('flow-14-reprint'); await act('[data-act="print"]'); await expect(/copy 1/, 'reprint failed');
  await act('[data-act="closeSheet"]');

  // 4. back to selling
  await scn('counting'); await act('[data-act="resume"]'); await expect(/Back to selling/, 'resume failed');
  if (!/Checkout/.test(await frameText())) throw new Error('cart not back after resume');

  // 5. blind + no-cash + offline
  await scn('open'); await page.click('.strip input[data-cap="reports"]'); await shot('tablet-blind-bar');
  await act('[data-act="openPanel"]'); await shot('tablet-blind-panel'); await act('[data-act="closePanel"]');
  await scn('counting'); await shot('tablet-blind-counting');
  await page.click('.strip input[data-cap="reports"]');
  await scn('closed'); await page.click('.strip input[data-cap="cash"]'); await shot('tablet-no-cash-closed'); await page.click('.strip input[data-cap="cash"]');
  await set('online', 'false'); await scn('counting'); await shot('tablet-offline-counting');
  await page.fill('[data-count="cash"]', '480.80'); await act('[data-act="tryClose"]'); await shot('tablet-offline-closure-unsynced');
  await act('[data-act="closeSheet"]'); await shot('tablet-offline-gate-unsynced');
  await set('online', 'true');

  // 6. reports
  await set('page', 'reports'); await shot('reports-sales');
  await act('[data-act="reportsTab"][data-t="closures"]'); await shot('reports-closures');
  await page.click('tr[data-act="selClosure"][data-n="11"]'); await shot('reports-closure-11-settled');
  await set('pro', 'false'); await shot('reports-closures-free'); await set('pro', 'true');
  await set('viewport', 'phone'); await act('[data-act="reportsTab"][data-t="closures"]'); await shot('reports-phone-closures');
  await page.click('tr[data-act="selClosure"][data-n="12"]'); await shot('reports-phone-closure-12');

  // 7. the rail has no Register item
  await set('viewport', 'tablet'); await set('page', 'pos');
  const tips = await page.locator('.rail .tip').allTextContents();
  if (tips.includes('Register')) throw new Error('rail still has a Register item');

  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
  if (errors.length) process.exit(1);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
