// The open switches only: the two tab styles, the personality themes, and the touches before / after.
// Decided items (tender close, void, legacy) no longer have switches. Run after shoot.js.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'variants');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
// Split-flow audit: exercise real controls; penny expectations use a £93.70 cart.
async function auditSplitFlows(page, w, shot) {
  const saved = await page.evaluate(() => {
    const saved = LINES.map(l => [...l]);
    LINES.splice(0, LINES.length, ['A',1,20,'','p'], ['B',1,30,'','p'], ['C',1,40,'','p'], ['D',1,3.70,'','p']);
    jump('split');
    const click = selector => { const el=document.querySelector(selector); if(!el || el.disabled) throw new Error('Unavailable: '+selector); el.click(); };
    click('[data-act="splitMode"][data-v="percent"]');
    for (const value of ['20','30']) {
      for (const k of value) click(`[data-act="splitKey"][data-k="${k}"]`);
      click('[data-act="splitAdd"]');
    }
    const chips=[...document.querySelectorAll('.splitdraft .chip')];
    if(chips.length!==3 || !chips[0].textContent.includes('20 %') || !chips[1].textContent.includes('30 %') || !chips[2].textContent.includes('the rest')) throw new Error('20/30/rest chips');
    const amounts=chips.map(c=>Math.round(Number(c.textContent.match(/£([\d.]+)/)[1])*100));
    if(JSON.stringify(amounts)!=='[1874,2811,4685]' || amounts.reduce((a,b)=>a+b,0)!==9370) throw new Error('percent pennies');
    return saved;
  });
  await shot(`split-three-percent-${w}`);
  await page.evaluate(() => {
    const check = (ok, msg) => { if(!ok) throw new Error(msg); };
    const click = selector => { const el=document.querySelector(selector); check(el&&!el.disabled, 'Unavailable: '+selector); el.click(); };
    const act = a => click(`[data-act="${a}"]`);
    const mode = v => click(`[data-act="splitMode"][data-v="${v}"]`);
    const type = (value, key='splitKey') => { for(const k of value) click(`[data-act="${key}"][data-k="${k}"]`); };
    const plan = want => check(JSON.stringify(S.payPlan)===JSON.stringify(want), 'plan '+JSON.stringify(S.payPlan)+' expected '+JSON.stringify(want));
    const sum = () => check(S.payPlan.reduce((n,a)=>n+Math.round(a*100),0)===9370,'plan sum');
    const even = () => { jump('split'); click('[data-act="splitEven"][data-v="2"]'); };
    act('splitDone'); plan([18.74,28.11,46.85]);
    click('[data-act="method"][data-m="cash"]'); act('take');
    click('[data-act="method"][data-m="card"]'); act('take');
    check(remaining()===46.85,'third leg remaining'); act('take');
    check(document.querySelector('.paidwrap'),'paid view');
    if(S.w!=='phone') check(document.querySelector('.paylist').textContent.includes('Paid in full'),'paid ledger');
    jump('split'); mode('amount'); type('2000'); act('splitAdd'); type('3000'); act('splitDone'); plan([20,30,43.7]);
    even(); act('splitOpen'); mode('even'); act('splitMore');
    while(S.split.n<8) click('[data-act="splitCount"][data-v="1"]');
    act('splitDone'); plan([11.72,11.72,11.71,11.71,11.71,11.71,11.71,11.71]); sum();
    act('splitOpen'); act('splitMore');
    while(S.split.n<20) click('[data-act="splitCount"][data-v="1"]');
    check(document.querySelector('[data-act="splitCount"][data-v="1"]').disabled,'20-way upper bound');
    act('splitDone'); check(S.payPlan.length===20,'20 ways'); sum();
    act('splitOpen'); act('splitMore');
    while(S.split.n>2) click('[data-act="splitCount"][data-v="-1"]');
    check(document.querySelector('[data-act="splitCount"][data-v="-1"]').disabled,'2-way lower bound');
    jump('split'); mode('item');
    for(const i of [0,1]) click(`[data-act="splitItem"][data-i="${i}"]`);
    act('splitAdd');
    for(const i of [0,1]) { const el=document.querySelector(`[data-act="splitItem"][data-i="${i}"]`); check(el.disabled && el.querySelector('.cb').textContent==='1','locked payer number'); }
    click('[data-act="splitItem"][data-i="2"]'); act('splitDone'); plan([50,40,3.7]);
    even(); act('splitOpen'); act('splitNone');
    check(S.payPlan===null && S.split===null && document.querySelector('.pay .keys'),'No split');
    for(const [value,want] of [['7028',[70.28,23.42]],['2343',[23.43,70.27]]]) {   // flows 13 and 14 on Card: above the leg pays more, below it leaves a shortfall; the pending legs re-flow
      even(); click('[data-act="method"][data-m="card"]'); type(value,'key'); act('take'); plan(want); sum();
      act('cancelPay'); check(S.pays.length===0 && S.leg===0,'cancel last payment'); sum();
    }
    // flow 12: cash tendered above a planned leg is change for that leg, and the plan holds
    even(); click('[data-act="method"][data-m="cash"]'); type('5000','key'); act('take');
    check(S.pays[0].amt===46.85 && S.pays[0].change===3.15,'cash change on a leg'); plan([46.85,46.85]); sum();
    act('cancelPay'); check(S.pays.length===0,'cancel the cash leg'); sum();
    even(); click('[data-act="method"][data-m="sumup"]'); act('take');
    const cancel=[...document.querySelectorAll('.term button')].find(b=>b.textContent==='Cancel on terminal');
    check(cancel,'terminal cancel'); cancel.click();
    check(S.tender && S.view==='keypad' && S.pays.length===0 && S.pending===null && document.querySelector('.pay .keys'),'terminal returns to keypad'); plan([46.85,46.85]);
    jump('tender'); type('2000','key'); act('take'); act('splitOpen');
    check(document.querySelector('.pay .lbl').textContent.toUpperCase().includes('£73.70 LEFT'),'remaining label');
    check(document.querySelector('[data-act="splitEven"][data-v="2"]').textContent.includes('£36.85'),'remaining tiles');
    check(JSON.stringify(splitDrawingLegs().map(l=>l.amount))==='[20,73.7]','ring includes the unpaid balance');
    check(document.querySelectorAll('.pay .legs .taken, .pay .legs .paid').length===1 && !document.querySelector('.taken [data-act="splitRemove"], .paid [data-act="splitRemove"]'),'taken chips immutable');
    click('[data-act="splitEven"][data-v="2"]'); plan([20,36.85,36.85]);
    act('splitOpen'); mode('percent'); type('33'); act('splitDone'); plan([20,24.32,49.38]); sum();
    jump('split'); mode('percent'); type('33'); act('splitDone'); plan([30.92,62.78]); sum();
    // Item removal unlocks the rows; assigned items cannot be paid twice within the draft.
    jump('split'); mode('item'); click('[data-act="splitItem"][data-i="0"]'); act('splitAdd');
    act('splitRemove'); check(!document.querySelector('[data-act="splitItem"][data-i="0"]').disabled,'item unlocked');
    // Removing a draft returns its allocation; the empty buffer commits only the rest.
    jump('split'); mode('percent'); type('20'); act('splitAdd'); type('30'); act('splitAdd');
    click('[data-act="splitRemove"][data-i="0"]'); act('splitDone'); plan([28.11,65.59]);
    jump('split'); mode('percent'); type('75'); act('splitAdd'); type('50');
    check(document.querySelector('[data-act="splitDone"]').disabled && document.querySelector('[data-act="splitAdd"]').disabled,'overallocated percentage');
    // Cash change on the final leg; all-card and unequal settlement use the same plan.
    even(); click('[data-act="method"][data-m="card"]'); act('take');
    click('[data-act="method"][data-m="cash"]'); type('5000','key'); act('take');
    check(S.pays[1].change===3.15 && remaining()===0,'cash change'); sum();
    even(); for(let i=0;i<2;i++){ click('[data-act="method"][data-m="card"]'); act('take'); }
    check(S.pays.every(p=>p.m==='card') && document.querySelector('.paidwrap'),'two cards');
  });
  await page.evaluate(saved => { LINES.splice(0, LINES.length, ...saved); jump('split'); }, saved);
}
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1400 } /* tall enough that the 844 px phone frame never scrolls under the sticky control strip */, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(DIR, 'index.html'));
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const scn = (v) => page.click(`.strip button[data-scn="${v}"]`);
  const shot = async (name) => { await page.evaluate(() => window.scrollTo(0, 0)); await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 82, animations: 'disabled' }); };
  await set('w', 'tablet'); await set('theme', 'light'); await set('scale', 'regular');
  // the free strip at the top (Paul 2026-09-17: a banner, slightly annoying on purpose; later the same day: top, decided); and the bell panel with the update at its head
  for (const w of ['tablet', 'phone']) { await set('w', w); await scn('open'); await set('plan', 'top'); await shot(`plan-top-${w}`); if (!(await page.locator('.upstrip.top').count())) throw new Error('strip not drawn: ' + w); if (await page.locator('.strip [data-set="plan"][data-v="bottom"]').count()) throw new Error('the bottom option is still in the strip'); }
  await set('w', 'tablet'); await set('plan', 'top'); await page.click('.upstrip [data-act="dismissStrip"]'); await page.waitForTimeout(100); if (await page.locator('.upstrip').count()) throw new Error('strip still drawn after ×'); await shot('plan-dismissed');
  await set('plan', 'top'); if (!(await page.locator('.upstrip.top').count())) throw new Error('strip did not come back on a plan change');
  await set('plan', 'pro'); if (await page.locator('.upstrip').count()) throw new Error('strip still drawn on pro');
  for (const w of ['tablet', 'desktop', 'phone']) { await set('w', w); await scn('open'); if (!(await page.locator('.bar .ndot').count())) throw new Error('bell has no dot: ' + w); await page.click('.bar [data-sheet="notif"]'); await page.waitForTimeout(300); if (!(await page.locator('.sidepanel .nitem.upd').count())) throw new Error('update not at the head of the panel: ' + w); await shot(`notif-${w}`); await page.click('.sidepanel [data-act="closeSheet"].ibtn'); }
  await set('w', 'tablet'); await scn('open'); await page.click('.bar [data-sheet="notif"]'); await page.click('.nitem.upd [data-set="upd"]'); await page.waitForTimeout(200);
  if (await page.locator('.bar .ndot').count()) throw new Error('dot stayed after Update now'); await shot('notif-after-update'); await page.click('.sidepanel [data-act="closeSheet"].ibtn'); await set('upd', 'ready');
  // the tabs: amount over status on large screens, amount + dot on the phone (decided 2026-09-17), 12 orders
  for (const w of ['tablet', 'phone']) { await set('w', w); await scn('many-orders'); await page.click('.ordlist [data-act="ordlist"]'); await shot(`tabs-${w}`); }
  await set('w', 'tablet');
  // the order note: three homes (Paul 2026-09-17)
  for (const n of ['row', 'line', 'chip']) { await set('note', n); await scn('open'); await shot(`note-${n}`); if (!(await page.locator('.onote, .nline, .chip.notechip').count())) throw new Error('note not drawn: ' + n); }
  await set('note', 'row');
  // the personality themes, session open
  for (const th of ['paper', 'bold', 'warm', 'market', 'ocean', 'sunset', 'monochrome']) { await set('theme', th); await scn('open'); await page.waitForTimeout(300); await shot(`theme-${th}`); }
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
  // the order sheet (Paul 2026-09-17): the row is gone, ⋯ | Checkout on every width, the ⋯ opens the sheet from the left over the products, the cart in view
  await set('w', 'tablet'); await scn('open');
  if (await page.locator('.cart-f2').count()) throw new Error('the details | save | print row is still drawn');
  if (!(await page.locator('.cart-f .btn.dots').count())) throw new Error('no ⋯ in the cart foot');
  if (await page.locator('.cart-f [data-act="void"]').count()) throw new Error('a Void button is still in the cart foot');
  await shot('osheet-foot-tablet');
  for (const w of ['tablet', 'desktop', 'phone']) { await set('w', w); await scn('open'); await page.click('.cart-f .btn.dots'); await page.waitForTimeout(300);
    if (!(await page.locator('.sidepanel .osfoot [data-act="void"]').count())) throw new Error('order sheet has no Void: ' + w);
    if (await page.locator('.sidewrap.right').count()) throw new Error('order sheet came from the right: ' + w);
    await shot('osheet-' + w); await page.click('.sidepanel .osfoot [data-act="togglePop"][data-pop="details"]'); await page.waitForTimeout(100); }
  await set('w', 'tablet'); await scn('open'); await page.click('.cart-f .btn.dots'); await page.waitForTimeout(200); await page.click('.sidepanel .osfoot [data-act="void"]'); await page.waitForTimeout(200);
  if (await page.locator('.sidepanel').count()) throw new Error('sheet still open after void'); if (!(await page.locator('.toast').count())) throw new Error('no voided toast'); await shot('osheet-voided');
  await page.click('[data-act="undoVoid"]'); await set('w', 'tablet');
  // Cart → ledger: removing a head row, shrinking the customer row or moving tabs must fail these checks.
  const ledgerPosition = async (option, w, scale, tabs = 'bottom') => {
    await set('w', w); await set('scale', scale); await scn('open');   // the ledger head is decided (still); no switch
    await page.evaluate(() => window.scrollTo(0, 0));
    const head = async () => page.locator('.cartcol').evaluate(el => {
      const y = selector => el.querySelector(selector).getBoundingClientRect().y;
      return { line: y('.lines .line'), customer: y('.custrow'), header: y('.cart-th') };
    });
    const cart = await head();
    await page.click('[data-act="checkout"]'); await page.waitForTimeout(400);
    const ledger = await head();
    const label = `${option}-${w}-${scale}-${tabs}`;
    for (const part of ['line', 'customer', 'header']) {
      if (Math.abs(cart[part] - ledger[part]) > .5) throw new Error(`${label}: ${part} cart=${cart[part]}, ledger=${ledger[part]}`);
    }
    if (scale === 'regular' && tabs === 'bottom') await shot(`ledger-${option}-${w}-${scale}`);
    await page.click('[data-act="closeTender"]'); await page.waitForTimeout(400);
    const back = await head();
    if (Math.abs(cart.line - back.line) > .5) throw new Error(`${label}: return cart=${cart.line}, back=${back.line}`);
    console.log('ledger geometry', label, JSON.stringify({ cart, ledger, back }));
  };
  await set('tabsPos', 'bottom');
  if (await page.locator('.strip [data-set="ledgerHead"]').count()) throw new Error('the Ledger head switch is still in the strip');
  for (const option of ['still']) {
    for (const scale of ['regular', 'compact', 'spacious']) await ledgerPosition(option, 'tablet', scale);
    await ledgerPosition(option, 'desktop', 'regular');
  }
  if (await page.locator('.strip [data-set="tabsPos"][data-v="top"]').count()) {
    await set('tabsPos', 'top'); await ledgerPosition('still', 'tablet', 'regular', 'top'); await set('tabsPos', 'bottom');
  } // No top-tabs assertion on a prototype without a Tab position switch.

  // Real motion in a separate context. Freeze each sampled frame only while writing its screenshot.
  const motion = await browser.newContext({ viewport: { width: 1500, height: 1400 } });
  const fadePage = await motion.newPage();
  fadePage.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  fadePage.on('pageerror', e => errors.push('fade pageerror: ' + e.message));
  await fadePage.goto('file://' + path.join(DIR, 'index.html'));
  await fadePage.click('.strip [data-set="w"][data-v="tablet"]');
  await fadePage.click('.strip [data-scn="open"]');
  await fadePage.evaluate(() => window.scrollTo(0, 0));
  const timing = await fadePage.evaluate(async () => {
    document.querySelector('[data-act="checkout"]').click();
    const start = performance.now();
    const read = () => ({ elapsed: performance.now() - start, pay: +getComputedStyle(document.querySelector('.pay')).opacity,
      line: +getComputedStyle(document.querySelector('.ledger .lines .line')).opacity });
    const initial = read(); await new Promise(resolve => setTimeout(resolve, 400));
    return { initial, end: read() };
  });
  if (timing.initial.elapsed > 20 || timing.initial.pay >= 1 || timing.initial.line !== 1 || timing.end.pay !== 1 || timing.end.line !== 1)
    throw new Error('live fade at 0/400 ms: ' + JSON.stringify(timing));
  console.log('ledger live fade', JSON.stringify(timing));
  await fadePage.click('[data-act="closeTender"]'); await fadePage.waitForTimeout(400);
  for (const ms of [0, 100, 220]) {
    const sample = await fadePage.evaluate(async ms => {
      document.querySelector('[data-act="checkout"]').click();
      const start = performance.now();
      // Force the initial animation style before waiting for the next sample.
      getComputedStyle(document.querySelector('.pay')).opacity;
      if (ms) await new Promise(resolve => setTimeout(resolve, ms));
      const sample = { elapsed: performance.now() - start, pay: +getComputedStyle(document.querySelector('.pay')).opacity,
        line: +getComputedStyle(document.querySelector('.ledger .lines .line')).opacity };
      // Keep the sampled pixels even if the 320 ms cleanup runs while the screenshot is written.
      document.querySelector('#frame').getAnimations({ subtree: true }).forEach(a => {
        if (a.animationName !== 'xfade') return;
        const el = a.effect.target, opacity = getComputedStyle(el).opacity;
        el.style.animation = 'none'; el.style.opacity = opacity;
      });
      return sample;
    }, ms);
    if (ms === 0 && (sample.elapsed > 20 || sample.pay >= 1)) throw new Error('fade initial sample: ' + JSON.stringify(sample));
    if (sample.line !== 1) throw new Error(`line faded at ${ms}: ${sample.line}`);
    await fadePage.locator('#frame').screenshot({ path: path.join(OUT, `ledger-fade-t${String(ms).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 82, animations: 'allow' });
    console.log('ledger fade frame', ms, JSON.stringify(sample));
    await fadePage.click('[data-act="closeTender"]'); await fadePage.waitForTimeout(400);
  }
  // A keypad re-render inside the cleanup window must not replay the transition.
  const keypadOpacity = await fadePage.evaluate(() => {
    document.querySelector('[data-act="checkout"]').click();
    document.querySelector('.pay [data-act="key"]').click();
    return +getComputedStyle(document.querySelector('.pay')).opacity;
  });
  if (keypadOpacity !== 1) throw new Error('keypad replayed the fade: ' + keypadOpacity);
  await motion.close();
  // Split: dev-next's pane drawing settles the remaining balance.
  if (await page.locator('.strip [data-set="splitUi"]').count()) throw new Error('split drawing switch still exists');
  await set('theme', 'light'); await set('scale', 'regular');
  const balance = () => page.locator('.ledger .totals .r2').last().locator('.money').innerText();
  const money = n => '£' + n.toFixed(2);
  for (const w of ['tablet', 'phone']) {
    await set('w', w);
    await scn('split');
    if (await page.locator('[data-act="splitMode"]').count() !== 4) throw new Error('split chooser modes: ' + w);
    if (await page.locator('.sheet').count() !== 0) throw new Error('split chooser placement: ' + w);
    await shot(`split-${w}`);
    await page.click('.pay .commit [data-act="splitClose"]');
    await page.locator('.pay .keys').waitFor();
    await page.click('.pay [data-act="splitOpen"]');
    await page.click('.pay .hd [data-act="splitClose"]');
    await page.locator('.pay .keys').waitFor();
    await scn('split-1of2');
    if (w === 'tablet') {
      const total = await page.evaluate(() => sub());
      if (await page.locator('.ledger .payrow').count() !== 1 || !/Cash/.test(await page.locator('.ledger .payrow').innerText())) throw new Error('split first cash leg: ' + w);
      if (await balance() !== money(total - Math.ceil(total * 100 / 2) / 100)) throw new Error('split remaining half: ' + w);
    }
    await shot(`split-1of2-${w}`);
    await page.click('.pay .commit [data-act="take"]');
    await page.locator('.paidwrap').waitFor();
    await scn('split-item'); await shot(`split-item-${w}`);
  }
  // Paul 2026-09-17: no half-page scrolling. At compact and regular the whole pane fits the page; at spacious nothing is pinned and
  // only the whole pane may scroll (no inner scroller ever overflows); nothing overflows sideways at any scale.
  for (const w of ['tablet', 'phone']) for (const scale of ['compact', 'regular', 'spacious']) {
    await set('w', w); await set('scale', scale);
    for (const state of ['split', 'split-item', 'split-1of2', 'tender']) {
      await scn(state);
      const fits = await page.locator('.pay').evaluate((el, scale) => {
        const wholeFits = el.scrollHeight <= el.clientHeight + 1;
        const noInner = [...el.querySelectorAll('.scroll')].every(sc => sc.scrollHeight <= sc.clientHeight + 1 && getComputedStyle(sc).overflowY !== 'auto');
        const noSideways = el.scrollWidth <= el.clientWidth + 1 && [...el.querySelectorAll('.scroll, .splitbody, .splitgrid, .legs')].every(control => getComputedStyle(control).overflowX === 'auto' || control.scrollWidth <= control.clientWidth + 1);   // the phone's plan chips scroll sideways on purpose
        return noInner && noSideways && (scale === 'spacious' || wholeFits);
      }, scale);
      if (!fits) throw new Error(`tender pane does not fit the page: ${w}-${scale}-${state}`);
    }
  }
  await set('scale', 'regular');
  await set('w', 'tablet'); await scn('tender');
  const splitTotal = await page.evaluate(() => sub());
  for (const k of ['2', '0', '0', '0']) await page.click(`.pay [data-act="key"][data-k="${k}"]`);
  if (!/left after this/.test(await page.locator('.amtblock .line').innerText())) throw new Error('typed partial hint');
  await page.click('.pay .commit [data-act="take"]');
  if (await page.locator('.ledger .payrow').count() !== 1 || await page.locator('.paidwrap').count()) throw new Error('partial payment prematurely completed sale');
  if (await balance() !== money(splitTotal - 20)) throw new Error('typed partial remaining');
  await page.click('.pay .hd [data-act="cancelPay"]');
  if (await page.locator('.ledger .payrow').count()) throw new Error('cancel did not remove payment');
  // Amount / Percent: keypad input previews a two-leg plan before committing it.
  for (const w of ['tablet', 'phone']) {
    await set('w', w); await scn('split');
    const total = await page.evaluate(() => sub());
    const mode = v => page.click(`[data-act="splitMode"][data-v="${v}"]`);
    const key = k => page.click(`[data-act="splitKey"][data-k="${k}"]`);
    const value = () => page.locator('.splitbody .big').innerText();
    const line = () => page.locator('.splitbody .line').innerText();
    const commit = page.locator('.commit [data-act="splitDone"]');
    await mode('amount');
    if (await page.locator('.splitbody .big.ghost').count() !== 1) throw new Error(`${w}: missing ghost amount`);
    await shot(`split-amount-${w}`);
    for (const k of ['2', '0', '0', '0']) await key(k);
    if (await value() !== '£20.00' || !(await line()).includes('first')) throw new Error(`${w}: typed amount preview`);
    await shot(`split-amount-typed-${w}`);
    await commit.click();
    const amountPlan = await page.evaluate(() => ({ plan: S.payPlan, closed: S.split === null }));
    if (!amountPlan.closed || JSON.stringify(amountPlan.plan) !== JSON.stringify([20, Math.round((total - 20) * 100) / 100])) throw new Error(`${w}: amount plan`);
    await page.click('[data-act="splitOpen"]'); await mode('percent');
    await page.locator('.splitbody .helpers .chip').filter({ hasText: /^25 %$/ }).click();
    if (!(await line()).includes('25 %')) throw new Error(`${w}: percent chip preview`);
    await key('C'); await key('7'); await key('5');
    if (await value() !== '75 %') throw new Error(`${w}: typed percent`);
    await shot(`split-percent-typed-${w}`);
    await commit.click();
    const percentPlan = await page.evaluate(() => ({ plan: S.payPlan, closed: S.split === null }));
    const first = Math.round(total * 75) / 100;
    if (!percentPlan.closed || JSON.stringify(percentPlan.plan) !== JSON.stringify([first, Math.round((total - first) * 100) / 100])) throw new Error(`${w}: percent plan`);
    await page.click('[data-act="splitOpen"]'); await mode('amount');
    for (const k of ['9', '9', '9', '9', '9']) await key(k);
    if (!(await commit.isDisabled()) || !(await line()).includes('below')) throw new Error(`${w}: invalid amount accepted`);
    await mode('even');
    if (await page.locator('.splitgrid [data-act="splitEven"]').count() !== 5) throw new Error(`${w}: Even tiles changed`);
    await mode('item');
    if (!(await page.locator('.splitbody [data-act="splitItem"]').count())) throw new Error(`${w}: Item list missing`);
    await mode('amount');
    if (await value() !== '£999.99') throw new Error(`${w}: amount buffer lost on mode switch`);
    await mode('percent'); await page.keyboard.type('25');
    await page.keyboard.press('Backspace');
    if (await value() !== '2 %') throw new Error(`${w}: physical keyboard/backspace`);
    await mode('amount'); await mode('percent');
    if (await value() !== '2 %') throw new Error(`${w}: percent buffer lost on mode switch`);
    await page.keyboard.press('Escape');
    if (!(await page.evaluate(() => S.split === null))) throw new Error(`${w}: Escape did not close chooser`);
    await page.click('[data-act="splitOpen"]');
    for (const scale of ['compact', 'regular', 'spacious']) for (const v of ['amount', 'percent']) {
      await set('scale', scale); await mode(v);
      if (await page.locator('.splitbody .big.ghost').count() !== 1) throw new Error(`${w}: reopening did not clear ${v}`);
      if (v === 'amount') for (const k of '99999999') await key(k);
      const fits = await page.locator('.pay').evaluate(el => {
        const pane = el.getBoundingClientRect();
        return [...el.querySelectorAll('.keys, .commit')].every(control => {
          const r = control.getBoundingClientRect();
          return r.top >= pane.top && r.bottom <= pane.bottom + 1 && r.left >= pane.left && r.right <= pane.right + 1 && control.parentElement === el;
        }) && [...el.querySelectorAll('.scroll, .splitbody, .helpers, .splitbody .big')].every(control => control.scrollWidth <= control.clientWidth + 1);
      });
      if (!fits) throw new Error(`split keypad overflow: ${w}-${scale}-${v}`);
      await key('C');
    }
    await set('scale', 'regular');
    // Half rounding uses pennies, including odd-penny balances.
    const savedLines = await page.evaluate(() => LINES.map(l => [...l]));
    await page.evaluate(() => { LINES.splice(0, LINES.length, ['Odd penny', 1, .29, '', 'p']); S.pays=[]; S.payPlan=null; openSplit(); render(); });
    await mode('amount');
    await page.locator('.splitbody .helpers .chip').filter({ hasText: /^Half$/ }).click();
    if (await value() !== '£0.15') throw new Error(`${w}: odd-penny Half`);
    await commit.click();
    if (await page.evaluate(() => JSON.stringify(S.payPlan)) !== '[0.15,0.14]') throw new Error(`${w}: odd-penny plan`);
    await page.evaluate(saved => LINES.splice(0, LINES.length, ...saved), savedLines);
  }
  // Every split flow, on both widths; existing capture blocks stay above and below.
  for (const w of ['tablet', 'phone']) {
    await set('w', w); await set('scale', 'regular');
    await auditSplitFlows(page, w, shot);
    for (const scale of ['compact', 'regular']) {
      await set('scale', scale);
      for (const mode of ['percent', 'amount', 'item', 'even']) {
        await scn('split');
        await page.click(`[data-act="splitMode"][data-v="${mode}"]`);
        await page.evaluate(mode => {
          if(mode==='even') document.querySelector('[data-act="splitMore"]').click();
          else if(mode==='item') { document.querySelector('[data-act="splitItem"]').click(); document.querySelector('[data-act="splitAdd"]').click(); }
          else for(const value of ['20','30']) {
            for(const k of mode==='amount'?value+'0':value) document.querySelector(`[data-act="splitKey"][data-k="${k}"]`).click();
            document.querySelector('[data-act="splitAdd"]').click();
          }
        }, mode);
        const fits=await page.locator('.pay').evaluate(el => el.scrollHeight<=el.clientHeight+1 && el.scrollWidth<=el.clientWidth+1 && [...el.querySelectorAll('.scroll, .splitbody, .keys, .commit')].every(c=>c.scrollWidth<=c.clientWidth+1));
        if(!fits) throw new Error(`multi-leg pane overflow: ${w}-${scale}-${mode}`);
      }
    }
  }
  await set('scale', 'regular');
  // The ring, decided (Paul 2026-09-17); the other four looks live on only for board-split.html, the record of the choice.
  const looks = ['chips', 'bar', 'ring', 'tear', 'seats'];
  if (await page.locator('.strip [data-set="splitLook"]').count()) throw new Error('the Split look switch is still in the strip');
  for (const look of ['ring']) {
    for (const w of ['tablet', 'phone']) {
      await set('w', w); await scn('split'); await shot(`split-look-${look}-${w}`);
      await scn('split-1of2');
      if (w === 'tablet') {
        const total = await page.evaluate(() => sub());
        if (await page.locator('.ledger .payrow').count() !== 1 || !/Cash/.test(await page.locator('.ledger .payrow').innerText())) throw new Error(`${look}: cash leg`);
        if (await balance() !== money(total - Math.ceil(total * 100 / 2) / 100)) throw new Error(`${look}: remaining half`);
      }
      await shot(`split-look-${look}-1of2-${w}`);
      await page.click('.pay .commit [data-act="take"]'); await page.locator('.paidwrap').waitFor();
      await scn('split-item'); await shot(`split-look-${look}-item-${w}`);
    }
    await set('w', 'tablet'); await scn('tender');
    for (const k of ['2', '0', '0', '0']) await page.click(`.pay [data-act="key"][data-k="${k}"]`);
    if (!/left after this/.test(await page.locator('.amtblock .line').innerText())) throw new Error(`${look}: partial hint`);
    await page.click('.pay .commit [data-act="take"]');
    if (await page.locator('.ledger .payrow').count() !== 1 || await page.locator('.paidwrap').count()) throw new Error(`${look}: partial settlement`);
    await page.click('.pay .hd [data-act="cancelPay"]');
    if (await page.locator('.ledger .payrow').count()) throw new Error(`${look}: cancel payment`);
  }
  await page.setViewportSize({ width: 2700, height: 800 });
  await page.goto('file://' + path.join(DIR, 'board-split.html') + '?w=tablet');
  if (await page.locator('iframe').count() !== 5) throw new Error('board: five iframes');
  for (const look of looks) {
    const panel = page.frameLocator(`iframe[data-look="${look}"]`);
    await panel.locator('.frame[data-screen="register"][data-w="tablet"]').waitFor();
    if (await panel.locator('#strip').isVisible()) throw new Error('board: strip visible');
    if (await panel.locator('[data-act="splitMode"]').count() !== 4) throw new Error('board: wrong state');
  }
  await page.screenshot({ path: path.join(OUT, 'board-split.jpg'), type: 'jpeg', quality: 82, fullPage: true });
  // Six payment-list drawings share the same ledger facts.
  await page.setViewportSize({ width: 1500, height: 1400 });
  await page.goto('file://' + path.join(DIR, 'index.html'));
  const payLists = ['bar'];   // Paul 2026-09-18: decided; the other five live on only for board-payments.html
  if (await page.locator('.strip [data-set="payList"]').count()) throw new Error('the Payments list switch is still in the strip');
  for (const opt of payLists) {
    await set('w', 'tablet'); await scn('split-2of3');
    if (await page.locator('.ledger [data-pay="taken"]').count() !== 2 || await page.locator('.ledger [data-pay="pending"]').count() !== 1) throw new Error(`${opt}: expected two taken and one pending`);
    if (await balance() !== '£11.50') throw new Error(`${opt}: remaining £11.50`);
    const text = await page.locator('.paylist').innerText();
    for (const fact of ['14:02', '14:03', '10.60', '2.00', '11.50']) if (!text.includes(fact)) throw new Error(`${opt}: missing ${fact}`);
    await shot(`paylist-${opt}-2of3`);
    await scn('tender-card'); await page.waitForTimeout(1200);
    if (await page.locator('.ledger [data-status="waiting"]').count() !== 1) throw new Error(`${opt}: expected one Waiting marker`);
    await shot(`paylist-${opt}-waiting`);
    await scn('paid');
    if (!/Paid in full/i.test(await page.locator('.paylist').innerText())) throw new Error(`${opt}: missing Paid in full`);
    await shot(`paylist-${opt}-paid`);
    await scn('tender');
    if (!/no payments yet/i.test(await page.locator('.paylist').innerText())) throw new Error(`${opt}: empty state`);   // the receipt drawing uppercases with CSS and innerText reports it
  }
  // Layout contract: payment content fits narrow/wide ledgers and totals stay outside the scroll area.
  for (const opt of payLists) for (const theme of ['light', 'dark']) for (const scale of ['compact', 'regular', 'spacious']) {
    await set('theme', theme); await set('scale', scale); await scn('split-2of3');
    for (const width of [340, 480]) {
      const fits = await page.locator('.ledger').evaluate((el, width) => {
        el.style.width = width + 'px'; el.style.flex = 'none';
        const list = el.querySelector('.paylist'), totals = el.querySelector('.totals');
        return list.scrollWidth <= list.clientWidth + 1 && [...list.querySelectorAll('.pay-copy, .pay-card, .pay-receipt-line')].every(row => row.scrollWidth <= row.clientWidth + 1)
          && totals.parentElement === el && totals.getBoundingClientRect().bottom <= el.getBoundingClientRect().bottom + 1;
      }, width);
      if (!fits) throw new Error(`paylist layout: ${opt}-${theme}-${scale}-${width}`);
    }
  }
  await page.setViewportSize({ width: 2700, height: 900 });
  await page.goto('file://' + path.join(DIR, 'board-payments.html'));
  if (await page.locator('iframe').count() !== 6) throw new Error('payments board: six iframes');
  for (const opt of payLists) {
    const panel = page.frameLocator(`iframe[data-look="${opt}"]`);
    await panel.locator('.frame[data-screen="register"][data-w="tablet"]').waitFor();
    if (await panel.locator('.ledger [data-pay="taken"]').count() !== 2) throw new Error(`payments board: ${opt} state`);
    if (await panel.locator('#strip').isVisible()) throw new Error('payments board: strip visible');
  }
  await page.screenshot({ path: path.join(OUT, 'board-payments.jpg'), type: 'jpeg', quality: 82, fullPage: true });
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok · variants in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
