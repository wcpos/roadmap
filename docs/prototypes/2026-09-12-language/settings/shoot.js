// Settings inside the register. Run from monorepo-v2; no capture deletion or quick mode.
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('url');
const roots = ['/Users/kilbot/Projects/monorepo-v2'];
for (let p = __dirname; ; p = path.dirname(p)) { roots.push(p); if (p === path.dirname(p)) break; }
const { chromium } = require(require.resolve('playwright', { paths: roots }));
const OUT = path.join(__dirname, 'screens');
fs.mkdirSync(OUT, { recursive: true });
const STATES = ['index', 'general', 'general-saved', 'general-restore', 'general-restore-failed', 'tax', 'printing', 'printing-empty', 'printing-test', 'printing-wizard', 'printing-saved', 'printing-edit', 'printing-delete', 'theme', 'display', 'display-locked', 'scanning', 'scanning-sound', 'scanning-register', 'loading'];

(async () => {
  const browser = await chromium.launch();
  const errors = [], captures = new Set();
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1500 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    await page.waitForURL('**/pos-register/index.html?screen=settings');
    await page.evaluate(() => document.fonts.ready);
    const frame = page.locator('#frame');
    const set = (key, value) => page.click(`.strip [data-set="${key}"][data-v="${value}"]`);
    const scene = value => page.click(`.strip [data-scn="${value}"]`);
    const action = (name, value) => page.locator(`#frame [data-sp="${name}"]${value === undefined ? '' : `[data-v="${value}"]`}`).first().click();
    const shot = async name => {
      await frame.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 80 });
      captures.add(name);
    };
    const capturePage = async name => {
      await shot(name);
      const scroll = page.locator('#frame .panel-b').count().then(n => page.locator(n ? '#frame .panel-b' : '#frame .sp-scroll'));
      const area = await scroll;
      if (!await area.count()) return;
      const { height, max } = await area.evaluate(el => ({ height: el.clientHeight, max: el.scrollHeight - el.clientHeight }));
      for (let top = Math.min(max, height * .85), n = 2; top > 0; top = Math.min(max, top + height * .85), n++) {
        await area.evaluate((el, y) => { el.scrollTop = y; }, top);
        await shot(`${name}-below-${n}`);
        if (top === max) break;
      }
    };

    // Drawings first: the full requested matrix, including the scrolled portions.
    for (const width of ['phone', 'tablet', 'desktop']) {
      await set('w', width);
      for (const theme of ['light', 'dark']) for (const scale of ['regular', 'compact']) {
        await set('theme', theme); await set('scale', scale);
        for (const state of STATES.filter(s => s !== 'index' || width === 'phone')) {
          await scene(state);
          await capturePage(`${width}-${theme}-${scale}-${state}`);
          assert.equal(await frame.getAttribute('data-screen'), 'settings');
          assert.equal(await page.locator('.strip [data-scn].on').getAttribute('data-scn'), state);
          const undersized = await page.locator('#frame .sp-page button, #frame .sp-panel button, #frame .sp-page input, #frame .sp-page select').evaluateAll(es => es.filter(e => e.checkVisibility()).filter(e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e), min = Math.max(parseFloat(c.getPropertyValue('--ctl')), parseFloat(c.getPropertyValue('--floor'))); return r.width + .1 < min || r.height + .1 < min; }).map(e => e.outerHTML.slice(0, 160)));
          assert.deepEqual(undersized, [], `control floor: ${width}/${theme}/${scale}/${state}`);
          assert.equal(await page.locator('#frame .sp-scroll').evaluateAll(es => es.some(e => e.scrollWidth > e.clientWidth + 1)), false, `horizontal overflow: ${width}/${theme}/${scale}/${state}`);
        }
        console.log(`captured ${width} / ${theme} / ${scale}`);
      }
    }

    // Required interaction: editing a real value updates it and shows a fading local Saved.
    await set('w', 'tablet'); await set('theme', 'light'); await set('scale', 'regular'); await scene('general');
    await page.locator('#sp-name').fill('Front counter');
    assert.equal(await page.locator('#sp-name').inputValue(), 'Front counter');
    assert.equal(await page.locator('[data-saved="name"]').innerText(), 'Saved');
    assert(await page.locator('[data-saved="name"].on').count(), 'Saved appears beside the changed value');
    await shot('saved-interaction');
    await page.waitForTimeout(1350);
    assert.equal(await page.locator('[data-saved="name"]').evaluate(el => getComputedStyle(el).opacity), '0', 'Saved fades after 1.2 s');
    await set('saved', 'header'); await scene('general-saved'); await shot('saved-header');
    assert.equal(await page.locator('[data-saved="header"]').innerText(), 'Saved · just now');
    await set('saved', 'none'); await scene('general-saved'); await shot('saved-none');
    assert.equal(await page.locator('[data-saved].on').count(), 0);
    await set('saved', 'row'); await scene('general');
    await action('toggle', 'cashier'); assert(await page.locator('#sp-customer').isDisabled());
    await action('toggle', 'cashier'); assert(await page.locator('#sp-customer').isEnabled());
    await scene('general-restore'); await action('destroy', 'restore');
    await page.locator('[data-row="restore"]').scrollIntoViewIfNeeded(); await shot('restored');
    assert.equal(await page.locator('[data-saved="restore"]').innerText(), 'Restored');

    await scene('printing'); await action('test', 'epson');
    assert(await page.getByRole('button', { name: 'Printing…', exact: true }).count());
    await page.getByText('Printed on Epson TM-m30', { exact: true }).waitFor(); await shot('printer-printed');
    await scene('printing-delete'); await action('destroy', 'delete:epson');
    assert.equal(await page.locator('[data-printer="epson"]').count(), 0);
    await scene('printing-edit'); assert.equal(await page.locator('.sp-panel details[open]').count(), 0);
    await page.keyboard.press('Escape'); assert.equal(await page.locator('.sp-panel').count(), 0);

    await scene('display'); await action('pair'); await shot('display-pairing');
    await action('confirm', 'forget:Counter display'); await shot('display-forget'); await action('destroy', 'forget:Counter display');
    await action('confirm', 'forget:Window display'); await action('destroy', 'forget:Window display');
    assert(await page.getByText('No displays are paired with this device.', { exact: true }).count()); await shot('display-empty');

    await scene('scanning'); await action('toggle', 'sound');
    assert(await page.locator('[data-testid="scan-sound-options"]').count());
    await page.getByText('Detected as a scan', { exact: true }).scrollIntoViewIfNeeded(); await shot('scanner-detected');
    await scene('scanning-register');
    await page.locator('#sp-scannerName').fill('Warehouse scanner'); await action('save-scanner');
    assert(await page.getByText('Warehouse scanner', { exact: true }).count());
    await page.getByText('Scanner connection options', { exact: true }).click();
    await action('register-scanner');
    assert.equal(await page.getByText('Warehouse scanner', { exact: true }).count(), 0, 'registration replaces the list');
    await page.keyboard.type('5012345678900'); await page.keyboard.press('Enter');
    assert(await page.locator('#sp-scannerName').isVisible(), 'a scanned code reaches the naming step');
    await action('cancel-scanner');
    await scene('theme'); assert.equal(await page.locator('.sp-theme').count(), 10, 'System plus nine themes');
    await action('scale', 'auto'); await set('w', 'phone'); assert.equal(await frame.getAttribute('data-scale'), 'compact');
    await set('w', 'tablet'); assert.equal(await frame.getAttribute('data-scale'), 'regular');
    await scene('loading'); assert.equal(await page.locator('.sp-content .sp-row').count(), 0);

    // The new entry points and per-page State; not a broad legacy regression claim.
    await scene('tax'); await page.click('.rail [data-nav="register"]');
    await page.click('.rail [data-nav="settings"]');
    assert.equal(await page.locator('.strip [data-scn].on').getAttribute('data-scn'), 'tax');
    assert(await page.locator('.rail [data-nav="settings"][aria-current="page"]').count());
    await set('w', 'phone'); await scene('index');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    assert(await page.locator('.sheet [data-nav="settings"]').count());
    await page.click('.sheet [data-nav="orders"]');
    await page.click('[data-act="openSheet"][data-sheet="menu"]');
    await page.click('.sheet [data-nav="settings"]');
    assert.equal(await frame.getAttribute('data-screen'), 'settings');
    await action('section', 'general');
    assert(await page.getByRole('button', { name: 'Back to Settings', exact: true }).count());
    await page.keyboard.press('Escape'); assert(await page.locator('.sp-nav').count());

    assert.deepEqual(errors, [], 'page/console errors');
    console.log(`PASS · Settings interactions · ${captures.size} captures written to ${OUT} · 0 page/console errors`);
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
