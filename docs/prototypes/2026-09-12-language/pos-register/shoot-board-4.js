// Capture board-table-4: each frame through its states, then the header and add-to-cart idioms on the all-white frame. Throwaway.
//   node shoot-board-4.js   → screens/board-table-4/
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'board-table-4');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(DIR, 'board-table-4.html'));
  const set = async (k, v) => { await page.locator(`.seg[data-k="${k}"] button[data-v="${v}"]`).click(); await page.waitForTimeout(60); };
  const panels = page.locator('section.panel'); const n = await panels.count();
  for (let i = 0; i < n; i++) {
    const p = panels.nth(i); const name = await p.getAttribute('data-n'); const f = p.locator('.frame');
    const shot = async (s) => f.screenshot({ path: path.join(OUT, `${name}-${s}.jpg`), type: 'jpeg', quality: 84 });
    await shot('1-products');
    await f.locator('.fbar [data-act="menu"]').click(); await page.waitForTimeout(80); await shot('2-category-menu');
    await f.locator('.menu [data-c="Coffee"]').click(); await page.waitForTimeout(120); await shot('3-mid-slide');
    await page.waitForTimeout(400); await shot('4-category');
    await f.locator('.crumb [data-act="pop"]').click(); await page.waitForTimeout(500);
    await f.locator('.tr [data-act="var"][data-i="7"]').first().click(); await page.waitForTimeout(500); await shot('5-variations');
    await f.locator('.tr[data-j="2"]').click(); await page.waitForTimeout(200); await shot('6-variation-added');
    const crumb = await f.locator('.crumb').innerText(); if (!/Tote bag/.test(crumb)) throw new Error('no breadcrumb for ' + name);
    const total = await f.locator('.btn.p').innerText(); if (!/29\.52/.test(total)) throw new Error('cart did not take the variation: ' + total);
    // drag the SKU column edge 40 px wider and check the grid changed
    const rz = f.locator('.thead .rz[data-i="3"]'); const box = await rz.boundingBox();
    const before = await f.locator('.thead').evaluate(el => el.style.gridTemplateColumns);
    await page.mouse.move(box.x + 4, box.y + 10); await page.mouse.down(); await page.mouse.move(box.x + 44, box.y + 10, { steps: 6 }); await shot('7-resizing'); await page.mouse.up();
    const after = await f.locator('.thead').evaluate(el => el.style.gridTemplateColumns);
    if (before === after) throw new Error('resize did nothing on ' + name);
    await f.locator('.crumb [data-act="pop"]').click(); await page.waitForTimeout(500);
  }
  // header and add idioms, on the all-white frame, one Flat white added so the in-cart states show
  const f = panels.nth(2).locator('.frame'); const name = await panels.nth(2).getAttribute('data-n');
  for (const h of ['caps', 'sentence', 'band', 'strong']) { await set('h', h); await f.screenshot({ path: path.join(OUT, `${name}-header-${h}.jpg`), type: 'jpeg', quality: 84 }); }
  await set('h', 'caps');
  for (const a of ['row', 'qty', 'holdplus', 'plus', 'price', 'stepper', 'word', 'hold', 'swipe']) {
    await set('a', a);
    if (a === 'swipe') { // drag Cold brew 120 px to the right, let go: added. then hover Sourdough: the stepper shows
      const b = await f.locator('.tr[data-i="2"] .lb').boundingBox(); await page.mouse.move(b.x + 200, b.y + 20); await page.mouse.down(); await page.mouse.move(b.x + 260, b.y + 20, { steps: 4 }); await page.mouse.move(b.x + 320, b.y + 20, { steps: 4 });
      await f.screenshot({ path: path.join(OUT, `${name}-add-swipe-dragging.jpg`), type: 'jpeg', quality: 84 }); await page.mouse.up(); await page.waitForTimeout(400);
      const h = await f.locator('.tr[data-i="4"] .lb').boundingBox(); await page.mouse.move(h.x + 200, h.y + 20); await page.waitForTimeout(300);
    } else {
    if (a === 'qty') { await f.locator('.qbar [data-q="3"]').click(); await f.screenshot({ path: path.join(OUT, `${name}-add-qty-armed.jpg`), type: 'jpeg', quality: 84 }); }
    const target = a === 'price' ? f.locator('.tr[data-i="2"] .pricebtn') : (a === 'row' || a === 'hold' || a === 'qty') ? f.locator('.tr[data-i="2"]') : f.locator('.tr[data-i="2"] [data-act="add"]');
    await target.click(); await page.waitForTimeout(150); }
    if (a === 'hold') { const b = await f.locator('.tr[data-i="4"]').boundingBox(); await page.mouse.move(b.x + 200, b.y + 20); await page.mouse.down(); await page.waitForTimeout(600); }
    if (a === 'holdplus') { const b = await f.locator('.tr[data-i="4"] [data-hold]').boundingBox(); await page.mouse.move(b.x + 16, b.y + 16); await page.mouse.down(); await page.waitForTimeout(600); }
    await f.screenshot({ path: path.join(OUT, `${name}-add-${a}.jpg`), type: 'jpeg', quality: 84 });
    if (a === 'hold' || a === 'holdplus') { await page.mouse.up(); if (!(await f.locator('.qpop').count())) throw new Error('hold popover did not open for ' + a); if (a === 'holdplus') { await f.locator('.qpop [data-act="qinc"]').click(); await f.screenshot({ path: path.join(OUT, `${name}-add-holdplus-2.jpg`), type: 'jpeg', quality: 84 }); const c = await f.locator('.tr[data-i="4"] .add.has').innerText(); if (c.trim() !== '2') throw new Error('the + did not take the count: ' + c); } }
    const total = await f.locator('.btn.p').innerText(); if (a === 'qty' ? !/43\.20/.test(total) : (!/34\.08/.test(total) && a !== 'hold' && a !== 'holdplus')) throw new Error(`add idiom ${a} did not add: ${total}`);
    // reset the cart line we added so each idiom starts the same
    await page.evaluate(() => { const app = window.APPS[2]; app.S.lines = app.S.lines.filter(l => l[1] !== 'Cold brew' && l[1] !== 'Sourdough loaf').concat([[1,'Sourdough loaf','',4.2]]); app.full(); });
  }
  await set('a', 'row');
  await page.screenshot({ path: path.join(OUT, '00-full.jpg'), type: 'jpeg', quality: 70, fullPage: true });
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`ok · ${n} frames in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
