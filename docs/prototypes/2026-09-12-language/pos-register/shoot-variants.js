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
  // surfaces: the sheet and all white, tiles and table, tablet and desktop
  for (const k of ['float','allwhite']) { await set('surface', k); await scn('open'); await shot(`surface-${k}-tiles`); await page.click('[data-act="toggleView"]'); await shot(`surface-${k}-table`); await set('w','desktop'); await shot(`surface-${k}-desktop-table`); await page.click('[data-act="toggleView"]'); await set('w','tablet'); }
  await set('surface', 'today');
  // the cart line: the quantity expands, the swipe on the total, the desktop nudge, the phone sheet
  await scn('open'); await page.click('.line[data-i="1"] .q'); await page.waitForTimeout(250); await shot('cart-qty-open');
  await page.click('.qx [data-k="1"]'); await page.click('.qx [data-k="2"]'); await page.waitForTimeout(80); await shot('cart-qty-typed-12');
  { const q = await page.locator('.line[data-i="1"] .q').innerText(); if (q.trim() !== '12') throw new Error('keypad did not set 12: ' + q); }
  await page.click('.qx [data-act="qclose"]'); await page.waitForTimeout(80);
  { const tb = await page.locator('.line[data-i="2"] .tot').boundingBox(); await page.mouse.move(tb.x + 20, tb.y + 10); await page.mouse.down(); await page.mouse.move(tb.x - 60, tb.y + 10, { steps: 5 }); await page.mouse.move(tb.x - 110, tb.y + 10, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(300); await shot('cart-swipe-open');
    if (!(await page.locator('.line[data-i="2"]').evaluate(el => el.classList.contains('reveal')))) throw new Error('short swipe did not open the strip'); }
  await scn('open'); await set('w', 'desktop'); await page.waitForTimeout(450); await page.evaluate(() => window.scrollTo(0, 0)); { const tb = await page.locator('.line[data-i="1"] .tot').boundingBox(); await page.mouse.move(tb.x + 20, tb.y + 10); await page.waitForTimeout(300); await shot('cart-desktop-nudge'); await page.mouse.click(tb.x + 20, tb.y + 10); await page.waitForTimeout(300); await shot('cart-desktop-click-open'); }
  await set('w', 'phone'); await scn('open'); await page.click('.line[data-i="1"] .q'); await page.waitForTimeout(300); await shot('cart-phone-sheet'); await page.click('[data-act="qclose"]'); await set('w', 'tablet'); await scn('open');
  // phone: the dots
  await set('w', 'phone'); await scn('open'); await shot('phone-dots'); await page.click('[data-act="vmenu"]'); await shot('phone-dots-open'); await set('w', 'tablet');
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok · variants in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
