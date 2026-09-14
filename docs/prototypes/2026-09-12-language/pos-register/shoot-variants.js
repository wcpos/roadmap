// The workshop switches: capture the tender pane under each Legacy-switch placement and each
// close position, tablet light regular. Run after shoot.js (which clears screens/).
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'variants');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(DIR, 'index.html'));
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const scn = (v) => page.click(`.strip button[data-scn="${v}"]`);
  const shot = (name) => page.locator('#frame').screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 82, animations: 'disabled' });
  await set('w', 'tablet'); await set('theme', 'light'); await set('scale', 'regular');
  for (const leg of ['tile', 'header-icons', 'header-text', 'bottom']) {
    await set('legacy', leg); await scn('tender'); await shot(`legacy-${leg}`);
    await scn('tender-legacy'); await shot(`legacy-${leg}-view`);
  }
  await set('legacy', 'tile');
  for (const c of ['tl', 'tr', 'bottom']) { await set('closePos', c); await scn('tender'); await shot(`close-${c}`); }
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok · variants in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
