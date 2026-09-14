// Capture every width × state of the register prototype at default light and dark, regular and
// compact scale; fail on any page or console error. Throwaway.
//   node docs/prototypes/2026-09-12-language/pos-register/shoot.js            (all)
//   node …/shoot.js --quick                                                    (tablet light regular only)
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname;
const OUT = path.join(DIR, 'screens');
const QUICK = process.argv.includes('--quick');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const STATES = ['open','added','line-actions','line-edit','many-orders','cart-settings','empty','closed','pick','counting','overdue','panel','closure','offline','loading','noresults','settings','tender','tender-card','paid','long'];
const WIDTHS = QUICK ? ['tablet'] : ['phone','tablet','desktop'];
const THEMES = QUICK ? ['light'] : ['light','dark'];
const SCALES = QUICK ? ['regular'] : ['regular','compact'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(DIR, 'index.html'));

  const set = (k, v) => page.click(`.strip button[data-set="${k}"][data-v="${v}"]`);
  const scn = (v) => page.click(`.strip button[data-scn="${v}"]`);
  let n = 0;
  for (const w of WIDTHS) for (const theme of THEMES) for (const scale of SCALES) {
    await set('w', w); await set('theme', theme); await set('scale', scale);
    for (const s of STATES) {
      await scn(s);
      // phone: the products-side states live on the Products tab, cart-side on the Cart tab (jump() already picks)
      const name = `${w}-${theme}-${scale}-${s}`;
      await page.locator('#frame').screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 82, animations: 'disabled' });
      n++;
    }
  }
  // a few interaction assertions: add a line, open the panel, close it, type on the keypad
  await set('w','tablet'); await set('theme','light'); await set('scale','regular'); await scn('empty');
  await page.click('.tile >> nth=0');
  if (!(await page.locator('.line.settle').count())) throw new Error('adding a line did not settle');
  await page.click('[data-act="openPanel"]');
  if (!(await page.locator('.panel').count())) throw new Error('panel did not open');
  await page.click('.panel [data-act="closePanel"]');
  if (await page.locator('.panel').count()) throw new Error('panel did not close');
  await scn('tender');
  await page.keyboard.type('5000');
  const big = await page.locator('.pay .big').textContent();
  if (!/50\.00/.test(big)) throw new Error('keypad did not type: ' + big);
  await page.keyboard.press('Enter');
  if (!(await page.locator('.paidwrap').count())) throw new Error('Enter did not take cash');
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`ok · ${n} captures in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
