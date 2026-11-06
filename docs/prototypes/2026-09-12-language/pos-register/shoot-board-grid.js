// captures board-grid.html: each panel idle, after the Tote bag drill-in, and inside a category
// run from /Users/kilbot/Projects/monorepo-v2 (node_modules/playwright lives there)
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const here = path.resolve(__dirname); const out = path.join(here, 'screens', 'board-grid'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', e => { throw new Error('page error: ' + e.message); });
  await page.goto('file://' + path.join(here, 'board-grid.html'));
  await page.waitForTimeout(300);
  const panels = await page.locator('section.panel').all();
  for (const p of panels) {
    const n = await p.getAttribute('data-n'); const f = p.locator('.frame'); const t = await f.getAttribute('data-t');
    await f.screenshot({ path: path.join(out, `${n}.jpg`), type: 'jpeg', quality: 82 });
    await f.locator('.tile[data-act="var"]').click(); await page.waitForTimeout(600);
    if (await f.locator('.pane').count() !== 1) throw new Error(`${t}: old pane not removed after push`);
    if (t === 'backtile') { if (!(await f.locator('.tile.back').count())) throw new Error('backtile: no back tile'); }
    else { const h = await f.locator('.crumb .here').innerText(); if (h.trim() !== 'Tote bag') throw new Error(`${t}: crumb ${h}`); }
    if (await f.locator('.tiles .tile:not(.back)').count() !== 3) throw new Error(`${t}: variation tiles`);
    await f.screenshot({ path: path.join(out, `${n}-var.jpg`), type: 'jpeg', quality: 82 });
    await f.locator('[data-act="pop"]').first().click(); await page.waitForTimeout(600);
    if (await f.locator('.pane').count() !== 1) throw new Error(`${t}: old pane not removed after pop`);
    if (await f.locator('.tiles .tile:not(.back)').count() !== 12) throw new Error(`${t}: back to 12 tiles`);
    await f.locator('[data-act="menu"]').click(); await page.waitForTimeout(100);
    await f.locator('.menu [data-c="Drinks"]').click(); await page.waitForTimeout(600);
    if (await f.locator('.tiles .tile:not(.back)').count() !== 3) throw new Error(`${t}: Drinks tiles`);
    await f.screenshot({ path: path.join(out, `${n}-cat.jpg`), type: 'jpeg', quality: 82 });
    await f.locator('[data-act="clearcat"]').click(); await page.waitForTimeout(600);
    if (await f.locator('.tiles .tile:not(.back)').count() !== 12) throw new Error(`${t}: clear category`);
  }
  await browser.close(); console.log('ok · board-grid captures in', out);
})().catch(e => { console.error(e); process.exit(1); });
