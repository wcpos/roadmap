// Run from the monorepo root: node docs/.../shoot.mjs  (uses the monorepo's Playwright)
import { chromium } from '/Users/kilbot/Projects/monorepo-v2/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const url = 'file://' + path.join(dir, 'index.html');
const base = {pick:'',split:'0',offline:0,phone:0,dark:0,paid:0,entry:null,legs:[]};
const shots = [
  ['tablet', {}],
  ['tablet-cash', {pick:'cash'}],
  ['tablet-sumup', {pick:'sumup'}],
  ['tablet-offline', {offline:1}],
  ['tablet-split-card', {pick:'card', split:'2'}],
  ['tablet-partpaid', {paid:1}],
  ['tablet-dark-cash', {dark:1, pick:'cash'}],
  ['phone', {phone:1}],
  ['phone-cash', {phone:1, pick:'cash'}],
  ['phone-dark', {phone:1, dark:1}],
];
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1320,height:900}, deviceScaleFactor:1});
await p.goto(url); await p.addStyleTag({content:'.strip{display:none}'});
for (const [name, st] of shots){
  await p.evaluate(s => { localStorage.setItem('tender-mock-v2', JSON.stringify(s)); }, {...base, ...st});
  await p.reload(); await p.addStyleTag({content:'.strip{display:none}'}); await p.waitForTimeout(200);
  const frame = await p.$('#frame'); await frame.screenshot({path: path.join(dir, 'screens', name + '.png')});
  console.log('shot', name);
}
await b.close();
