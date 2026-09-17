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
// clear only this script's own captures; the board and variant folders under screens/ are kept
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.jpg') || f.endsWith('.png')) fs.rmSync(path.join(OUT, f));

const STATES = ['open','added','line-actions','line-edit','many-orders','cart-settings','empty','closed','pick','counting','overdue','panel','closure','offline','loading','noresults','table','settings','tender','tender-card','tender-legacy','paid','long'];
const WIDTHS = QUICK ? ['tablet'] : ['phone','tablet','desktop'];
const THEMES = QUICK ? ['light'] : ['light','dark'];
const SCALES = QUICK ? ['regular'] : ['regular','compact'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1400 } /* tall enough that the 844 px phone frame never scrolls under the sticky control strip */, reducedMotion: 'reduce' });
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
  if (!/50\.?00/.test(big)) throw new Error('keypad did not type: ' + big);
  await page.keyboard.press('Enter');
  if (!(await page.locator('.paidwrap').count())) throw new Error('Enter did not take cash');
  // the rail links the pages: Reports and back, and the phone's menu sheet does the same
  await scn('open');
  await page.click('.rail [data-nav="reports"]');
  if (!(await page.locator('.frame[data-screen="reports"] .rail [data-nav="reports"][aria-current="page"]').count())) throw new Error('rail did not open Reports');
  await page.click('.rail [data-nav="register"]');
  if (!(await page.locator('.frame[data-screen="register"] .cartcol').count())) throw new Error('rail did not return to the register');
  await set('w','phone');
  await page.click('.bar [data-sheet="menu"]');
  await page.click('.sheet .menu-list [data-nav="reports"]');
  if (!(await page.locator('.frame[data-screen="reports"] .phone-tabs').count()) || await page.locator('.sheet').count()) throw new Error('phone menu did not open Reports');
  await page.click('.bar [data-sheet="menu"]');
  await page.click('.sheet .menu-list [data-nav="register"]');
  if (!(await page.locator('.frame[data-screen="register"]').count())) throw new Error('phone menu did not return to the register');
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`ok · ${n} captures in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
