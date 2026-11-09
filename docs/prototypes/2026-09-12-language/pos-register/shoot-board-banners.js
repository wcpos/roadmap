// captures board-banners.html: each panel with both messages, then upgrade only, then update only
// run from /Users/kilbot/Projects/monorepo-v2 (node_modules/playwright lives there)
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const here = path.resolve(__dirname); const out = path.join(here, 'screens', 'board-banners'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', e => { throw new Error('page error: ' + e.message); });
  await page.goto('file://' + path.join(here, 'board-banners.html'));
  await page.waitForTimeout(300);
  if (await page.locator('#refs a').count() < 10) throw new Error('refs strip empty');
  for (const m of ['both', 'up', 'upd']) {
    await page.click(`#mseg button[data-m="${m}"]`); await page.waitForTimeout(100);
    for (const p of await page.locator('section.panel').all()) {
      const n = await p.getAttribute('data-n'); const f = p.locator('.frame');
      const up = await f.locator('.only-up:visible').count(), upd = await f.locator('.only-upd:visible').count();
      if (m === 'up' && (!up || upd)) throw new Error(`${n}: upgrade-only state wrong (${up}/${upd})`);
      if (m === 'upd' && (up || !upd)) throw new Error(`${n}: update-only state wrong (${up}/${upd})`);
      if (m === 'both' && (!up || !upd)) throw new Error(`${n}: both state wrong (${up}/${upd})`);
      await f.screenshot({ path: path.join(out, `${n}-${m}.jpg`), type: 'jpeg', quality: 82 });
    }
  }
  await browser.close(); console.log('ok · board-banners captures in', out);
})().catch(e => { console.error(e); process.exit(1); });
