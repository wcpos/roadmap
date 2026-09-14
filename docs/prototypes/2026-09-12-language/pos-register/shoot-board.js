// Capture each panel of board.html to screens/board/NN-slug.jpg. Throwaway.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'board');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(DIR, 'board.html'));
  const panels = page.locator('section.panel');
  const n = await panels.count();
  for (let i = 0; i < n; i++) {
    const p = panels.nth(i); const name = await p.getAttribute('data-n');
    await p.locator('.frame').screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 84 });
  }
  await page.screenshot({ path: path.join(OUT, '00-board-full.jpg'), type: 'jpeg', quality: 70, fullPage: true });
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`ok · ${n} panels in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
