// Run from the monorepo root: node docs/.../shoot.mjs  (uses the monorepo's Playwright)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const checkoutRequire = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium } = checkoutRequire('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const url = 'file://' + path.join(dir, 'index.html');
if (process.argv.includes('--check')) { console.log('Playwright resolved from the invoking checkout:', checkoutRequire.resolve('playwright')); process.exit(0); }
// [name, jump, {set: val}]
const shots = [
  ['fresh', 'fresh', {}], ['typed', 'typed', {}], ['card', 'card', {}], ['sumup', 'sumup', {}], ['split-sheet', 'splitsheet', {}], ['split', 'split', {}], ['split3-after', 'split3after', {}], ['split-percent', 'splitpct', {}], ['split-item', 'splititem', {}], ['split-items-after', 'splititems-after', {}], ['split-items-share', 'splititems-share', {}], ['split-items-loop', 'splititems-loop', {}], ['phone-split-item', 'splititem', {phone:'1'}], ['phone-split-sheet', 'splitsheet', {phone:'1'}], ['partpaid', 'partpaid', {}],
  ['terminal', 'terminal', {}], ['paid', 'paid', {}], ['offline', 'fresh', {offline:'1'}], ['unavail-open', 'unavail', {offline:'1'}],
  ['blue', 'typed', {surface:'blue'}], ['light', 'typed', {surface:'light'}],
  ['phone-fresh', 'fresh', {phone:'1'}], ['phone-paid', 'paid', {phone:'1'}], ['phone-terminal', 'terminal', {phone:'1'}],
];
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1320,height:900}});
await p.goto(url);
for (const [name, jump, sets] of shots){
  await p.evaluate(() => { document.querySelector('.strip').style.display = 'flex'; });
  await p.click(`.strip button[data-set="offline"][data-val="0"]`); await p.click(`.strip button[data-set="surface"][data-val="slate"]`); await p.click(`.strip button[data-set="phone"][data-val="0"]`);
  for (const [k,v] of Object.entries(sets)) await p.click(`.strip button[data-set="${k}"][data-val="${v}"]`);
  await p.click(`.strip button[data-jump="${jump}"]`);
  await p.evaluate(() => { document.querySelector('.strip').style.display = 'none'; });
  await p.waitForTimeout(650);
  const frame = await p.$('#frame'); await frame.screenshot({path: path.join(dir, 'screens', name + '.png')});
  console.log('shot', name);
}
await b.close();
