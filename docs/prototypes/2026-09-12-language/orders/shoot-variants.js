// The workshop switch on the orders screen: the four list styles at desktop and tablet, light,
// regular, default and filtered states. Run after shoot.js (which clears screens/).
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'variants');
const QUICK = process.argv.includes('--quick');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1400 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(pathToFileURL(path.join(DIR, '../pos-register/index.html')).href + '?screen=orders');
  const set = (k, v) => page.click(`.strip [data-set="${k}"][data-v="${v}"]`);
  const scn = (v) => page.click(`.strip [data-scn="${v}"]`);
  const shot = (name) => page.locator('#frame').screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 82, animations: 'disabled' });
  await set('theme', 'light'); await set('scale', 'regular');
  for (const w of (QUICK ? ['desktop'] : ['desktop', 'tablet'])) { await set('w', w);
    for (const s of ['bleed', 'grouped', 'stats', 'card']) { await set('listStyle', s);
      await scn('default'); await shot(`list-${s}-${w}`);
      await scn('filtered'); await shot(`list-${s}-${w}-filtered`);
      if (w === 'desktop') { await scn('open'); await shot(`list-${s}-${w}-open`); } } }
  await set('w', 'desktop'); await set('listStyle', 'bleed');
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok · variants in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
