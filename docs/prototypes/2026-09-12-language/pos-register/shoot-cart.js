// Capture board-cart: each frame at rest, selected, and revealed, on touch then mouse. Throwaway.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'board-cart');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(DIR, 'board-cart.html'));
  const set = async (v) => { await page.locator(`.seg[data-k="pt"] button[data-v="${v}"]`).click(); await page.waitForTimeout(60); };
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  const panels = page.locator('details section.panel'); const n = await panels.count();
  for (const pt of ['touch', 'mouse']) {
    await set(pt);
    for (let i = 0; i < n; i++) {
      const p = panels.nth(i); const name = await p.getAttribute('data-n'); const f = p.locator('.frame'); const mode = await f.getAttribute('data-mode');
      const shot = async (s) => f.screenshot({ path: path.join(OUT, `${name}-${pt}-${s}.jpg`), type: 'jpeg', quality: 84 });
      await shot('1-rest');
      const l1 = f.locator('.line').nth(1);
      if (mode === 'qtybtn') await l1.locator('[data-act="qpop"]').click();
      else if (mode === 'menu') await l1.locator('[data-act="menu"]').click();
      else await l1.locator('.lb .nm').click();
      await page.waitForTimeout(120);
      if (pt === 'mouse') { const b = await l1.boundingBox(); await page.mouse.move(b.x + 200, b.y + 20); await page.waitForTimeout(100); }
      await shot('2-active');
      if (pt === 'touch' && mode !== 'expand') { // swipe the third line left and leave it open
        await page.mouse.click(10, 10); await page.waitForTimeout(100);
        const l2 = f.locator('.line').nth(2); const b = await l2.boundingBox();
        await page.mouse.move(b.x + 300, b.y + 20); await page.mouse.down(); await page.mouse.move(b.x + 200, b.y + 20, { steps: 5 }); await page.mouse.move(b.x + 140, b.y + 20, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(300);
        await shot('3-swiped');
      }
      if (pt === 'mouse') { // + key on the selected line, then remove it and show the undo toast
        if (mode === 'expand' || mode === 'inplace' || mode === 'reveal') { await f.focus(); await page.keyboard.press('+'); await page.waitForTimeout(80); const q = await f.locator('.line').nth(1).locator('.step b, .q').first().innerText(); if (q.trim() !== '2') throw new Error(`${name}: + key did not raise quantity: ${q}`); }
        await page.mouse.click(10, 10); await page.waitForTimeout(80);
      }
      await page.evaluate((k) => { const a = window.APPS[k]; a.S.lines = [{q:2,n:'Flat white',s:'Oat milk',p:3.2},{q:1,n:'Sourdough loaf',s:'',p:4.2},{q:1,n:'Tote bag',s:'Black · M',p:14},{q:3,n:'Croissant',s:'',p:2.4}]; a.S.sel=null;a.S.pop=null;a.S.menu=null;a.S.undo=null; a.render(); }, i);
    }
  }
  await set('touch');
  await page.screenshot({ path: path.join(OUT, '00-full.jpg'), type: 'jpeg', quality: 70, fullPage: true });
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`ok · ${n} frames × 2 pointers in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
