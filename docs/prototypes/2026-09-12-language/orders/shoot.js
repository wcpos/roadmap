// Capture every width × state of the orders prototype at default light and dark, regular and
// compact scale; fail on any page or console error. Throwaway.
//   node docs/prototypes/2026-09-12-language/orders/shoot.js            (all)
//   node …/shoot.js --quick                                              (desktop light regular only)
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname;
const OUT = path.join(DIR, 'screens');
const QUICK = process.argv.includes('--quick');
// clear only this script's own captures; the board and variant folders under screens/ are kept
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.jpg') || f.endsWith('.png')) fs.rmSync(path.join(OUT, f));

const STATES = ['default','keyboard','open','open-refund','rowmenu','columns','filter-status','filter-date','filtered','loading','searching','empty','noresults','error','syncing','offline','delete','long'];
const WIDTHS = QUICK ? ['desktop'] : ['phone','tablet','desktop'];
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
      await page.locator('#frame').screenshot({ path: path.join(OUT, `${w}-${theme}-${scale}-${s}.jpg`), type: 'jpeg', quality: 82, animations: 'disabled' });
      n++;
    }
  }
  // interaction assertions: keyboard opens and closes an order; a column toggle changes the table live
  await set('w','desktop'); await set('theme','light'); await set('scale','regular'); await scn('default');
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  if (!(await page.locator('.pane').count())) throw new Error('Enter did not open the focused order');
  await page.keyboard.press('Escape');
  if (await page.locator('.pane').count()) throw new Error('Escape did not close the pane');
  await scn('columns');
  const before = await page.locator('.thead .th').count();
  await page.click('.pop [data-act="col"][data-k="billing"]');
  const after = await page.locator('.thead .th').count();
  if (after !== before - 1) throw new Error(`column toggle did not change the table live (${before} → ${after})`);
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`ok · ${n} captures in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
