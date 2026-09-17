// The open switches only: the two tab styles, the personality themes, and the touches before / after.
// Decided items (tender close, void, legacy) no longer have switches. Run after shoot.js.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'variants');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(DIR, 'index.html'));
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const scn = (v) => page.click(`.strip button[data-scn="${v}"]`);
  const shot = async (name) => { await page.evaluate(() => window.scrollTo(0, 0)); await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 82, animations: 'disabled' }); };
  await set('w', 'tablet'); await set('theme', 'light'); await set('scale', 'regular');
  // the two tab styles left, 12 orders, tablet and phone
  for (const w of ['tablet', 'phone']) { await set('w', w);
    for (const s of ['line1', 'lines2']) { await set('tabStyle', s); await scn('many-orders'); await page.click('.ordlist [data-act="ordlist"]'); await shot(`tabs-${s}-${w}`); } }
  await set('w', 'tablet'); await set('tabStyle', 'line1');
  // the personality themes, session open
  for (const th of ['paper', 'bold', 'warm', 'market', 'stage']) { await set('theme', th); await scn('open'); await page.waitForTimeout(300); await shot(`theme-${th}`); }
  await set('theme', 'light');
  // the touches: after (all on) and before (all off), in three states; the whimsical ones under Market Stall too
  const flip = (v) => page.click(`.strip button[data-txall="${v}"]`);
  for (const [v, tag] of [['1', 'after'], ['0', 'before']]) {
    await flip(v);
    await scn('open'); await shot(`touch-${tag}-open`);
    await scn('empty'); await shot(`touch-${tag}-empty`);
    await scn('paid'); await page.waitForTimeout(500); await shot(`touch-${tag}-paid`);
  }
  await flip('1');
  await set('theme', 'market'); await scn('open'); await shot('touch-after-market'); await set('theme', 'light');
  // assert the flip actually changes the copy
  await scn('paid'); await page.waitForTimeout(300); const after = await page.locator('#frame .paidwrap').innerHTML();
  await flip('0'); await page.waitForTimeout(300); const before = await page.locator('#frame .paidwrap').innerHTML(); await flip('1');
  if (after === before) errors.push('before/after did not change the paid screen: ' + after);
  // the icon sets, session open
  for (const k of ['hugeicons','lucide']) { await set('icons', k); await scn('open'); await shot(`icons-${k}`); }
  await set('icons', 'tabler-15');
  // the table: filter bar, the row as the button, the count, the footer
  await scn('open'); await page.click('[data-act="toggleView"]'); await shot('table-bar-footer');
  await page.click('.tr.rowbtn[data-n="Cold brew"]'); await page.waitForTimeout(200); await page.click('.tr.rowbtn[data-n="Cold brew"]'); await page.waitForTimeout(200); await shot('table-row-tapped-twice');
  { const c = await page.locator('.tr.rowbtn[data-n="Cold brew"] .cnt').innerText(); if (c.trim() !== '2') throw new Error('row tap did not count to 2: ' + c); const l = await page.locator('.line[data-i="0"] .q').innerText(); if (l.trim() !== '2') throw new Error('cart line did not take 2: ' + l); }
  // the slide: a variable product, then a category, each behind a breadcrumb; inline rows as the other style
  await page.click('.tr.rowbtn[data-act="openVar"]'); await page.waitForTimeout(400); await shot('table-var-slide');
  { const h = await page.locator('.crumb .here').innerText(); if (h.trim() !== 'Tote bag') throw new Error('variation pane crumb: ' + h); if (await page.locator('.pane').count() !== 1) throw new Error('old pane not removed'); }
  await page.click('.tr.rowbtn[data-s="Natural · S"]'); await page.waitForTimeout(200); await shot('table-var-slide-tapped');
  { const c = await page.locator('.tr.rowbtn[data-s="Natural · S"] .cnt').innerText(); if (c.trim() !== '1') throw new Error('variation tap did not count: ' + c); }
  await page.click('.crumb [data-act="popView"]'); await page.waitForTimeout(400);
  if (await page.locator('.crumb').count()) throw new Error('crumb still there after Products');
  // categories and tags are multi-select chips, never a crumb (Paul 2026-09-17: today's POS allows many categories and a tag on top)
  await page.click('[data-act="catMenu"]'); await page.waitForTimeout(100); await page.click('.menu [data-act="togCat"][data-c="Drinks"]'); await page.waitForTimeout(200);
  { const n = await page.locator('.pane .tr').count(); if (n !== 3) throw new Error('Drinks should show 3 rows: ' + n); if (await page.locator('.crumb').count()) throw new Error('a category filter must not make a crumb'); }
  await page.click('.menu [data-act="togCat"][data-c="Bakery"]'); await page.waitForTimeout(200); await shot('table-cat-menu-two');
  { const n = await page.locator('.pane .tr').count(); if (n !== 6) throw new Error('Drinks + Bakery should show 6 rows: ' + n); const pill = await page.locator('.pill.on').first().innerText(); if (!/Drinks \+1/.test(pill)) throw new Error('Category chip should read Drinks +1: ' + pill); }
  await page.click('[data-act="tagMenu"]'); await page.waitForTimeout(100); await page.click('.menu [data-act="togTag"][data-c="Local"]'); await page.waitForTimeout(200); await page.click('.thead'); await page.waitForTimeout(150); await shot('table-cats-and-tag');
  { const n = await page.locator('.pane .tr').count(); if (n !== 3) throw new Error('Drinks + Bakery, tag Local should show 3 rows: ' + n); if (!(await page.locator('.pill.clr').count())) throw new Error('Clear all missing with two filter groups on'); }
  await page.click('.pill.clr'); await page.waitForTimeout(200);
  if (await page.locator('.pane .tr').count() < 12) throw new Error('Clear all did not restore the rows');
  await set('vars', 'inline'); await shot('table-var-inline');
  if (await page.locator('.tr.vh').count() !== 3) throw new Error('inline style should show 3 indented rows');
  await set('vars', 'slide');
  // filters and the breadcrumb: chips stay in the bar, the crumb stays the place, the footer says the count
  await page.click('.tr.rowbtn[data-act="openVar"]'); await page.waitForTimeout(400);
  await page.click('[data-act="stockMenu"]'); await page.waitForTimeout(100); await shot('table-var-stock-menu');
  await page.click('.menu [data-act="setStock"][data-v="in"]'); await page.waitForTimeout(200); await shot('table-var-with-stock-filter');
  { const n = await page.locator('.pane .tr').count(); if (n !== 2) throw new Error('in stock should leave 2 variations: ' + n); if (await page.locator('.pill.na').count() < 3) throw new Error('product-level chips not dimmed in the variations pane'); const f = await page.locator('.tfoot > span:not(.tax):not(.grow)').innerText(); if (!/2 of 3/.test(f)) throw new Error('variations footer: ' + f); const h = await page.locator('.crumb .here').innerText(); if (h.trim() !== 'Tote bag') throw new Error('crumb changed with a filter: ' + h); }
  await page.click('.crumb [data-act="popView"]'); await page.waitForTimeout(400);
  { const n = await page.locator('.pane .tr').count(); if (n !== 12) throw new Error('in stock should leave 12 products: ' + n); }
  await page.click('[data-act="toggleFeat"]'); await page.waitForTimeout(200); await shot('table-filters-stacked');
  { const n = await page.locator('.pane .tr').count(); if (n !== 3) throw new Error('in stock + featured should leave 3 rows: ' + n); const f = await page.locator('.tfoot > span:not(.tax):not(.grow)').innerText(); if (!/3 of 12/.test(f)) throw new Error('footer count: ' + f); }
  await page.click('[data-act="toggleFeat"]'); await page.waitForTimeout(200);
  await page.click('[data-act="quickMenu"]'); await page.waitForTimeout(200);
  { const n = await page.locator('.pane .tr').count(); if (n !== 6) throw new Error('Morning menu + in stock should leave 6 rows: ' + n); }
  await page.click('[data-act="quickMenu"]'); await page.waitForTimeout(150); await shot('table-quick-filter-open');
  if (!(await page.locator('.menu .part').count())) throw new Error('quick filter parts not shown');
  await page.click('[data-act="catMenu"]'); await page.click('.menu [data-act="togCat"][data-c="Merch"]'); await page.waitForTimeout(200); await page.click('.thead'); await page.waitForTimeout(150); await shot('table-empty-clear-filters');
  if (!(await page.locator('.pane [data-act="clearFilters"]').count())) throw new Error('Merch with Morning menu on should be empty with Clear filters');
  await page.click('.pane [data-act="clearFilters"]'); await page.waitForTimeout(200);
  { const n = await page.locator('.pane .tr').count(); if (n !== 12) throw new Error('after Clear filters: ' + n); }
  await page.click('[data-act="toggleView"]');
  // the grid: the same breadcrumb and slide, tiles instead of rows
  await page.click('.tile[data-act="openVar"]'); await page.waitForTimeout(700); await shot('grid-var-stagger');
  if (await page.locator('.pane').count() !== 1) throw new Error('grid: old pane not removed after the stagger');
  { const h = await page.locator('.crumb .here').innerText(); if (h.trim() !== 'Tote bag') throw new Error('grid crumb: ' + h); if (await page.locator('.tiles .tile').count() !== 3) throw new Error('grid variation tiles'); }
  await page.click('.tile[data-s="Natural · S"]'); await page.waitForTimeout(200);
  { const c = await page.locator('.tile[data-s="Natural · S"] .tcnt').innerText(); if (c.trim() !== '2') throw new Error('grid variation tap did not count to 2: ' + c); }
  await page.click('.crumb [data-act="popView"]'); await page.waitForTimeout(700);
  await page.click('[data-act="catMenu"]'); await page.click('.menu [data-act="togCat"][data-c="Bakery"]'); await page.waitForTimeout(700); await page.click('.ptable'); await page.waitForTimeout(150); await shot('grid-cat-stagger');
  if (await page.locator('.tiles .tile').count() !== 3) throw new Error('Bakery tiles');
  await page.click('.pill.on [data-act="clearCats"]'); await page.waitForTimeout(700);
  if (await page.locator('.tiles .tile').count() !== 12) throw new Error('clear category in the grid');
  // the cart line: the quantity expands, the swipe on the total, the desktop nudge, the phone sheet
  await scn('open'); await page.click('.line[data-i="1"] .q'); await page.waitForTimeout(250); await shot('cart-qty-open');
  await page.click('.qx [data-k="1"]'); await page.click('.qx [data-k="2"]'); await page.waitForTimeout(80); await shot('cart-qty-typed-12');
  { const q = await page.locator('.line[data-i="1"] .q').innerText(); if (q.trim() !== '12') throw new Error('keypad did not set 12: ' + q); }
  await page.click('.qx [data-act="qclose"]'); await page.waitForTimeout(80);
  { const tb = await page.locator('.line[data-i="2"] .tot').boundingBox(); await page.mouse.move(tb.x + 20, tb.y + 10); await page.mouse.down(); await page.mouse.move(tb.x - 60, tb.y + 10, { steps: 5 }); await page.mouse.move(tb.x - 110, tb.y + 10, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(300); await shot('cart-swipe-open');
    if (!(await page.locator('.line[data-i="2"]').evaluate(el => el.classList.contains('reveal')))) throw new Error('short swipe did not open the strip'); }
  await scn('open'); await set('w', 'desktop'); await page.waitForTimeout(450); await page.evaluate(() => window.scrollTo(0, 0));
  { const tot = page.locator('.line[data-i="1"] .tot'); await tot.hover(); await page.waitForTimeout(300);
    const tf = await page.locator('.line[data-i="1"] .lb').evaluate(el => getComputedStyle(el).transform); if (!/-14/.test(tf)) throw new Error('desktop hover did not nudge the line: ' + tf);
    await shot('cart-desktop-nudge'); await tot.click(); await page.waitForTimeout(300);
    if (!(await page.locator('.line[data-i="1"]').evaluate(el => el.classList.contains('reveal')))) throw new Error('desktop click on the total did not open the strip');
    await shot('cart-desktop-click-open'); }
  await set('w', 'phone'); await scn('open'); await page.click('.line[data-i="1"] .q'); await page.waitForTimeout(300); await shot('cart-phone-sheet'); await page.click('[data-act="qclose"]'); await set('w', 'tablet'); await scn('open');
  // phone: the dots
  await set('w', 'phone'); await scn('open'); await shot('phone-dots'); await page.click('[data-act="vmenu"]'); await shot('phone-dots-open'); await set('w', 'tablet');
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok · variants in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
