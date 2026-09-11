// Captures for the five ideas. Throwaway. Run after shoot.js (which clears screens/).
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const DIR = __dirname; const OUT = path.join(DIR, 'screens', 'ideas');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const CASES = [
  ['0-tabs-own-row', 'scn=open&orders=2'],
  ['0-tabs-in-bar', 'scn=open&orders=2&tabs=bar'],
  ['0-tabs-in-bar-new-order', 'scn=open&orders=2&tabs=bar&cart=empty'],
  ['2-autoopen-closed', 'idea=autoopen&scn=closed'],
  ['3-timed-overdue-empty', 'idea=timed&scn=overdue&cart=empty'],
  ['4-tapcount', 'idea=tapcount&scn=counting&taps=1'],
  ['5-drawer-open', 'idea=drawer&scn=open&panel=1'],
];
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const vp of ['tablet','phone']) for (const [name, q] of CASES) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    page.on('pageerror', e => errors.push(name+': '+e.message)); page.on('console', m => { if (m.type()==='error') errors.push(name+': '+m.text()); });
    await page.goto('file://' + path.join(DIR, 'index.html') + '?embed=1&viewport=' + vp + '&' + q);
    await page.locator('#frame').screenshot({ path: path.join(OUT, `${vp}-${name}.png`), animations: 'disabled' }); console.log('shot', vp, name);
    await page.close();
  }
  // idea 2: the checkout opens the register
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.on('pageerror', e => errors.push('auto: '+e.message));
  await page.goto('file://' + path.join(DIR, 'index.html') + '?embed=1&idea=autoopen&scn=closed');
  await page.click('[data-act="checkoutCash"]');
  if (!/register opened itself/.test(await page.locator('#log div').first().textContent())) throw new Error('auto-open failed');
  await page.locator('#frame').screenshot({ path: path.join(OUT, 'tablet-2-autoopen-after-first-sale.png'), animations: 'disabled' }); console.log('shot auto-open after');
  // idea 4: tap and hold
  await page.goto('file://' + path.join(DIR, 'index.html') + '?embed=1&idea=tapcount&scn=counting');
  await page.click('[data-den-tap="20"]'); await page.click('[data-den-tap="20"]');
  const t20 = await page.locator('[data-den-tap="20"] .cnt').textContent(); if (t20 !== '2') throw new Error('tap count wrong: '+t20);
  const cash = await page.inputValue('[data-count="cash"]'); if (cash !== '40.00') throw new Error('tap total wrong: '+cash);
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close(); if (errors.length) process.exit(1);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
