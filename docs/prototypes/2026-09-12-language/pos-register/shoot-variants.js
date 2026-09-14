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
  // clicks scroll the page and the sticky strip would overlap the frame; reset before every capture
  const shot = async (name) => { await page.evaluate(() => window.scrollTo(0, 0)); await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 82, animations: 'disabled' }); };
  await set('w', 'tablet'); await set('theme', 'light'); await set('scale', 'regular');
  for (const leg of ['tile', 'header-icons', 'header-text', 'bottom']) {
    await set('legacy', leg); await scn('tender'); await shot(`legacy-${leg}`);
    await scn('tender-legacy'); await shot(`legacy-${leg}-view`);
  }
  await set('legacy', 'header-text');
  for (const c of ['tl', 'tr', 'bottom']) { await set('closePos', c); await scn('tender'); await shot(`close-${c}`); }
  await set('closePos', 'tr');
  // the open-order tab styles, 12 orders, list closed, tablet and phone
  for (const w of ['tablet', 'phone']) { await set('w', w);
    for (const s of ['lines2', 'line1', 'chips', 'cards', 'numbered', 'edge']) { await set('tabStyle', s); await scn('many-orders'); await page.click('.ordlist [data-act="ordlist"]'); await shot(`tabs-${s}-${w}`); } }
  await set('w', 'tablet'); await set('tabStyle', 'line1');
  // the void styles, live: tablet, session open; the menu opened, the hold mid-press
  for (const v of ['pill', 'link', 'ghost', 'iconword', 'outline2', 'square', 'outline', 'menu']) {
    await set('voidStyle', v); await scn('open');
    if (v === 'menu' || v === 'chip') await page.click('[data-act="vmenu"]');
    if (v === 'details') await page.click('[data-pop="details"]');
    if (v === 'hold') { await page.hover('[data-hold]'); await page.mouse.down(); await page.waitForTimeout(350); }
    await shot(`void-${v}`);
    if (v === 'hold') await page.mouse.up();
  }
  await set('voidStyle', 'menu');
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('ok · variants in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
