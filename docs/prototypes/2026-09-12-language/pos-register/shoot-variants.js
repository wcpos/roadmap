// The open switches only: the two tab styles, the personality themes, and the touches before / after.
// Decided items (tender close, void, legacy) no longer have switches. Run after shoot.js.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'variants');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
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
    await set('w', w); await set('scale', scale); await set('ledgerHead', option); await scn('open');
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
  for (const option of ['still', 'customer', 'progress', 'facts']) {
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
  await fadePage.click('.strip [data-set="ledgerHead"][data-v="still"]');
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
  // The pinned controls must fit at every scale; the area above them may scroll.
  for (const w of ['tablet', 'phone']) for (const scale of ['compact', 'regular', 'spacious']) {
    await set('w', w); await set('scale', scale);
    for (const state of ['split', 'split-item', 'split-1of2']) {
      await scn(state);
      const fits = await page.locator('.pay').evaluate(el => {
        const pane = el.getBoundingClientRect();
        return [...el.querySelectorAll('.keys, .commit')].every(control => {
          const r = control.getBoundingClientRect();
          return r.top >= pane.top && r.bottom <= pane.bottom + 1 && r.left >= pane.left && r.right <= pane.right + 1;
        }) && el.scrollWidth <= el.clientWidth + 1
          && [...el.querySelectorAll('.scroll, .splitbody, .splitgrid, .legs')].every(control => control.scrollWidth <= control.clientWidth + 1);
      });
      if (!fits) throw new Error(`split pinned controls overflow: ${w}-${scale}-${state}`);
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
  // Five drawings, one payment flow.
  const looks = ['chips', 'bar', 'ring', 'tear', 'seats'];
  if (await page.locator('.strip [data-set="splitLook"]').count() !== 5) throw new Error('expected five split looks');
  for (const look of looks) {
    await set('splitLook', look);
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
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok · variants in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
