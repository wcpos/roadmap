// Capture board-table-4 in its states: products, category (via the pill), variations, mid-slide. Throwaway.
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
    await f.locator('.tr [data-act="addv"][data-j="2"]').click(); await page.waitForTimeout(200); await shot('6-variation-added');
    const crumb = await f.locator('.crumb').innerText(); if (!/Tote bag/.test(crumb)) throw new Error('no breadcrumb for ' + name);
    const total = await f.locator('.btn.p').innerText(); if (!/29\.52/.test(total)) throw new Error('cart did not take the variation: ' + total);
    await f.locator('.crumb [data-act="pop"]').click(); await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(OUT, '00-full.jpg'), type: 'jpeg', quality: 70, fullPage: true });
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`ok · ${n} frames × 6 states in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
