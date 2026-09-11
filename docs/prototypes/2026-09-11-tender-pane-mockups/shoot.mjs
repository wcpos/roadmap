import { chromium } from '/Users/kilbot/Projects/monorepo-v2/node_modules/playwright/index.mjs';
const url = 'file:///Users/kilbot/Projects/roadmap-worktrees/docs-tender-pane-mockups/docs/prototypes/2026-09-11-tender-pane-mockups/index.html';
const shots = [
  ['A-tablet', {variant:'A',pick:'',split:'0',offline:0,phone:0,paid:0}],
  ['A-tablet-cash', {variant:'A',pick:'cash',split:'0',offline:0,phone:0,paid:0}],
  ['A-tablet-offline', {variant:'A',pick:'',split:'0',offline:1,phone:0,paid:0,unavailOpen:1}],
  ['B-tablet', {variant:'B',pick:'',split:'0',offline:0,phone:0,paid:0}],
  ['B-tablet-split-card', {variant:'B',pick:'card',split:'2',offline:0,phone:0,paid:0}],
  ['C-tablet', {variant:'C',pick:'',split:'0',offline:0,phone:0,paid:0}],
  ['C-tablet-cash-partpaid', {variant:'C',pick:'cash',split:'0',offline:0,phone:0,paid:1}],
  ['A-phone', {variant:'A',pick:'',split:'0',offline:0,phone:1,paid:0}],
  ['B-phone-card', {variant:'B',pick:'card',split:'0',offline:0,phone:1,paid:0}],
  ['C-phone', {variant:'C',pick:'',split:'0',offline:0,phone:1,paid:0}],
];
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1320,height:900}, deviceScaleFactor:1});
await p.goto(url);
for (const [name, st] of shots){
  await p.evaluate(s => { localStorage.setItem('tender-mock', JSON.stringify(s)); }, st);
  await p.reload(); await p.waitForTimeout(150);
  const frame = await p.$('#frame'); await frame.screenshot({path: '/Users/kilbot/Projects/roadmap-worktrees/docs-tender-pane-mockups/docs/prototypes/2026-09-11-tender-pane-mockups/screens/'+name+'.png'});
  console.log('shot', name);
}
await b.close();
