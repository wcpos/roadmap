// Captures for the no-title-bar variants. Throwaway.
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'header');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(DIR, 'index.html'));
  const shot = async (n) => { await page.locator('#frame').screenshot({ path: path.join(OUT, n + '.png'), animations: 'disabled' }); console.log('shot', n); };
  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const scn = (v) => page.click(`.strip button[data-scn="${v}"]`);
  for (const h of ['bar','A','B','C']) {
    await set('viewport','tablet'); await set('header', h);
    await scn('open'); await shot(`${h}-tablet-open`);
    await scn('closed'); await shot(`${h}-tablet-closed`);
    await scn('overdue'); await shot(`${h}-tablet-overdue`);
    await scn('counting'); await shot(`${h}-tablet-counting`);
    await set('page','reports'); await shot(`${h}-tablet-reports`); await set('page','pos');
    await set('viewport','phone');
    await scn('open'); await shot(`${h}-phone-open`);
    await scn('closed'); await shot(`${h}-phone-closed`);
  }
  await set('viewport','tablet'); await set('header','A'); await scn('open');
  await page.click('[data-act="openPanel"]'); await shot('A-tablet-panel');
  if (!(await page.locator('.panel').count())) throw new Error('panel did not open from the merged bar');
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close(); if (errors.length) process.exit(1);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
