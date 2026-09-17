// Orders inside the register (2026-09-17): the rail toggles POS, Orders and Reports.
// Captures the Orders page in every theme and both extra scales, then walks the rail
// round trip on tablet and the phone's Menu sheet, asserting each page keeps its State.
// Output: screens/pages/. Run from a directory that can resolve playwright.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('node:assert/strict');
const roots = ['/Users/kilbot/Projects/monorepo-v2'];
for (let p = __dirname; ; p = path.dirname(p)) { roots.push(p); if (p === path.dirname(p)) break; }
const { chromium } = require(require.resolve('playwright', { paths: roots }));
const OUT = path.join(__dirname, 'screens', 'pages');
fs.mkdirSync(OUT, { recursive: true });
const THEMES = ['light', 'dark', 'ocean', 'sunset', 'monochrome', 'paper', 'bold', 'warm', 'market', 'woo'];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1400 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(pathToFileURL(path.join(__dirname, '../pos-register/index.html')).href + '?screen=orders');
  const set = (k, v) => page.click(`.strip [data-set="${k}"][data-v="${v}"]`);
  const scn = v => page.click(`.strip [data-scn="${v}"]`);
  const shot = name => page.locator('#frame').screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 80 });
  const screen = () => page.locator('#frame').getAttribute('data-screen');
  const onState = () => page.locator('.strip [data-scn].on').getAttribute('data-scn');

  assert.equal(await screen(), 'orders', '?screen=orders must land on Orders');
  assert(await page.locator('.rail [data-nav="orders"].on').count(), 'the rail lights Orders');
  assert.equal(await page.locator('.strip [data-set="note"]').count(), 0, 'register-only switches hide on Orders');
  assert(await page.locator('.strip [data-set="listStyle"]').count(), 'the List style switch shows on Orders');

  // every theme, tablet, the default state; then the open order on desktop in the personality themes
  await set('w', 'tablet');
  for (const t of THEMES) {
    const ok = await page.locator(`.strip [data-set="theme"][data-v="${t}"]`).count();
    if (!ok) continue;
    await set('theme', t); await scn('default'); await shot(`orders-${t}-tablet`);
  }
  await set('w', 'desktop');
  for (const t of ['paper', 'bold', 'market', 'warm', 'woo', 'dark']) {
    if (!(await page.locator(`.strip [data-set="theme"][data-v="${t}"]`).count())) continue;
    await set('theme', t); await scn('open'); await shot(`orders-${t}-desktop-open`);
  }
  await set('theme', 'light');
  for (const sc of ['compact', 'spacious']) { await set('scale', sc); await scn('default'); await shot(`orders-light-tablet-${sc}`); }
  await set('scale', 'regular');

  // the List style switch drives data-list
  for (const ls of ['grouped', 'stats', 'card', 'bleed']) {
    await set('listStyle', ls); assert.equal(await page.locator('#frame').getAttribute('data-list'), ls, `data-list follows the switch: ${ls}`);
  }

  // the rail round trip on the tablet: Orders (state open) -> POS -> Reports -> Orders keeps its State; data-list leaves with it
  await set('w', 'tablet'); await scn('open');
  await page.click('.rail [data-nav="register"]'); await page.waitForTimeout(200);
  assert.equal(await screen(), 'register', 'POS from the rail'); assert.equal(await page.locator('#frame').getAttribute('data-list'), null, 'data-list cleared off Orders');
  assert.equal(await onState(), 'open', 'the register keeps its own State');
  await shot('rail-register-after-orders');
  await page.click('.rail [data-nav="reports"]'); await page.waitForTimeout(200);
  assert.equal(await screen(), 'reports', 'Reports from the rail'); await shot('rail-reports-after-orders');
  await page.click('.rail [data-nav="orders"]'); await page.waitForTimeout(200);
  assert.equal(await screen(), 'orders', 'Orders from the rail'); assert.equal(await onState(), 'open', 'Orders comes back with its order open');
  assert(await page.locator('.op-pane').count(), 'the open order pane is back'); await shot('rail-orders-back');

  // the phone: the Menu button opens the sheet listing the pages; a tap moves and closes the sheet
  await set('w', 'phone'); await scn('default');
  await page.click('.bar [data-sheet="menu"], .pagebar [data-sheet="menu"], [data-act="openSheet"][data-sheet="menu"]'); await page.waitForTimeout(200);
  assert(await page.locator('.sheet [data-nav="reports"]').count(), 'the phone menu lists Reports'); await shot('phone-orders-menu');
  await page.click('.sheet [data-nav="reports"]'); await page.waitForTimeout(200);
  assert.equal(await screen(), 'reports', 'Reports from the phone menu'); assert.equal(await page.locator('.sheet').count(), 0, 'the menu sheet closes after a tap');
  await page.click('[data-act="openSheet"][data-sheet="menu"]'); await page.waitForTimeout(200);
  await page.click('.sheet [data-nav="orders"]'); await page.waitForTimeout(200);
  assert.equal(await screen(), 'orders', 'Orders from the phone menu'); assert.equal(await page.locator('.sheet').count(), 0, 'the menu sheet closes after a tap');
  await shot('phone-orders-after-menu');
  // the rail avatar / phone user sheet on Orders
  await set('w', 'tablet'); await page.click('.rail .avr'); await page.waitForTimeout(200);
  assert(await page.locator('.sheet').count(), 'the cashier sheet opens on Orders'); await shot('orders-cashier-sheet');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);

  // the register untouched: its own default capture still renders with no errors
  await page.click('.rail [data-nav="register"]'); await page.waitForTimeout(200); await scn('open');
  assert(await page.locator('.cart-f .btn.dots').count(), 'the register cart foot is intact');

  assert.deepEqual(errors, [], 'page/console errors');
  await browser.close();
  console.log(`ok · ${fs.readdirSync(OUT).length} captures in ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
