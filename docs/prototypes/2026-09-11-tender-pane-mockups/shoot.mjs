// Run from the monorepo root: node docs/.../shoot.mjs  (uses the monorepo's Playwright)
import { chromium } from '/Users/kilbot/Projects/monorepo-v2/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const url = 'file://' + path.join(dir, 'index.html');
// [name, jump, {set: val}]
const shots = [
  ['fresh', 'fresh', {}], ['typed', 'typed', {}], ['card', 'card', {}], ['sumup', 'sumup', {}], ['split', 'split', {}], ['partpaid', 'partpaid', {}],
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
