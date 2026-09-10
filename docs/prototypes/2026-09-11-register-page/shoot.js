// Screenshot + smoke-test the register-page prototype. Throwaway.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const DIR = '/Users/kilbot/Projects/roadmap-worktrees/docs-register-page-prototype/docs/prototypes/2026-09-11-register-page';
const OUT = path.join(DIR, 'screens');
require('fs').mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(DIR, 'index.html'));

  const shot = async (name) => { await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.png') }); console.log('shot', name); };
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const scn = (v) => page.click(`.strip button[data-scn="${v}"]`);
  const act = (sel) => page.click(sel);
  const logTop = async () => (await page.locator('#log div').first().textContent());

  // 1. layouts × states, tablet
  for (const v of ['A', 'B', 'C']) {
    await set('variant', v);
    await scn('closed'); await shot(`${v}-tablet-closed`);
    await scn('open'); await shot(`${v}-tablet-open`);
  }
  await scn('overdue'); await shot('A-tablet-overdue');
  await scn('counting'); await shot('shared-tablet-counting');
  await scn('signedout'); await shot('shared-tablet-signedout');
  await scn('off'); await shot('shared-tablet-sessions-off');

  // 2. phone
  await set('viewport', 'phone');
  for (const v of ['A', 'B', 'C']) { await set('variant', v); await scn('open'); await shot(`${v}-phone-open`); }
  await set('variant', 'C'); await scn('closed'); await shot('C-phone-closed');
  await scn('counting'); await shot('shared-phone-counting');
  await set('viewport', 'tablet');

  // 3. the full chain: closed → open (float 195) → paid out → close → count → override → print
  await set('variant', 'A'); await scn('closed');
  await act('[data-act="openSheet"][data-type="open"]'); await shot('flow-1-open-sheet');
  await page.fill('[data-sheet="counted"]', '195'); await shot('flow-2-open-sheet-variance');
  await act('[data-act="doOpen"]');
  if (!/Register opened/.test(await logTop())) throw new Error('open failed: ' + await logTop());
  await act('[data-act="openSheet"][data-mtype="paid_out"]');
  await page.fill('[data-sheet="amount"]', '10'); await page.fill('[data-sheet="reason"]', 'Parking'); await shot('flow-3-paid-out-sheet');
  await act('[data-act="doMove"]');
  if (!/Paid out/.test(await logTop())) throw new Error('move failed: ' + await logTop());
  await shot('flow-4-after-paid-out');
  // void it
  await act('[data-act="openSheet"][data-type="void"]'); await shot('flow-5-void-sheet'); await act('[data-act="voidMove"]');
  if (!/Voided/.test(await logTop())) throw new Error('void failed');
  // no sale
  await act('[data-act="openSheet"][data-mtype="no_sale"]'); await page.fill('[data-sheet="reason"]', 'Change for the meter'); await act('[data-act="doMove"]');
  await act('[data-act="openSheet"][data-type="xreport"]'); await shot('flow-6-xreport'); await act('[data-act="xprint"]');
  await act('[data-act="startCounting"]'); await shot('flow-7-counting-empty');
  // denomination helper
  await act('[data-act="toggleCollapse"][data-k="den"]');
  await page.fill('[data-den="20"]', '8'); await page.fill('[data-den="5"]', '3'); await page.fill('[data-den="1"]', '2'); await page.fill('[data-den="0.5"]', '1');
  await shot('flow-8-denominations');
  const cash = await page.inputValue('[data-count="cash"]');
  if (cash !== '177.50') throw new Error('denomination total wrong: ' + cash);
  // that's 177.50 vs expected 195 → short 17.50 → override
  await act('[data-act="tryClose"]'); await shot('flow-9-override');
  await act('[data-act="approve"]');
  await shot('flow-10-closure-written');
  await act('[data-act="print"]'); await shot('flow-11-printed');
  await act('[data-act="closeSheet"]'); await shot('flow-12-closed-after');
  if (!/Closure 13/.test(await page.locator('#frame').textContent())) throw new Error('closure 13 not shown');
  // reprint
  await act('[data-act="toggleMenu"]'); await shot('flow-13-overflow');
  await act('[data-act="openSheet"][data-type="reprint"]'); await shot('flow-14-reprint'); await act('[data-act="print"]');
  await act('[data-act="closeSheet"]');

  // 4. blind + offline
  await scn('open'); await page.click('.strip input[data-cap="reports"]'); await shot('A-tablet-blind');
  await set('variant', 'C'); await shot('C-tablet-blind');
  await scn('counting'); await shot('shared-tablet-blind-counting');
  await page.click('.strip input[data-cap="reports"]');
  await set('online', 'false'); await scn('counting'); await shot('shared-tablet-offline-counting');
  await page.fill('[data-count="cash"]', '480.80'); await act('[data-act="tryClose"]'); await shot('offline-closure-unsynced');
  await act('[data-act="closeSheet"]'); await set('variant', 'A'); await shot('A-tablet-closed-unsynced');
  await set('online', 'true');
  // no cash permission
  await scn('open'); await page.click('.strip input[data-cap="cash"]'); await shot('A-tablet-no-cash-perm'); await page.click('.strip input[data-cap="cash"]');

  // 5. reports
  await set('page', 'reports'); await shot('reports-sales');
  await act('[data-act="reportsTab"][data-t="closures"]'); await shot('reports-closures');
  await page.click('tr[data-act="selClosure"][data-n="11"]'); await shot('reports-closure-11-settled');
  await set('pro', 'false'); await shot('reports-closures-free'); await set('pro', 'true');
  await set('viewport', 'phone'); await act('[data-act="reportsTab"][data-t="closures"]'); await shot('reports-phone-closures');
  await page.click('tr[data-act="selClosure"][data-n="12"]'); await shot('reports-phone-closure-12');

  // 6. menu position
  await set('viewport', 'tablet'); await set('page', 'register'); await set('menuPos', 'reports'); await scn('open'); await shot('A-tablet-menu-before-reports');

  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
  if (errors.length) process.exit(1);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
