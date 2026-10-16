// Connect inside the register. Run from monorepo-v2; full matrix, no deletion or quick mode.
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('url');
const roots = ['/Users/kilbot/Projects/monorepo-v2'];
for (let p = __dirname; ; p = path.dirname(p)) { roots.push(p); if (p === path.dirname(p)) break; }
const { chromium } = require(require.resolve('playwright', { paths: roots }));
const OUT = path.join(__dirname, 'screens');
fs.mkdirSync(OUT, { recursive: true });
const STATES = ['first-run', 'typing', 'discovering', 'error-wp', 'error-timeout', 'error-host', 'error-woo', 'error-update', 'one-site', 'many-sites', 'no-users', 'checking-user', 'expired-user', 'no-stores', 'many-stores', 'incompatible', 'remove-site', 'demo'];
const STAGES = ['Finding your store…', 'Checking WordPress…', 'Checking WooCommerce POS…', 'Saving…'];
(async () => {
  const browser = await chromium.launch();
  const errors = [], captures = new Set();
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1500 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    await page.waitForURL('**/pos-register/index.html?screen=connect');
    await page.evaluate(() => document.fonts.ready);
    const frame = page.locator('#frame');
    const set = (key, value) => page.click(`.strip [data-set="${key}"][data-v="${value}"]`);
    const scene = value => page.click(`.strip [data-scn="${value}"]`);
    const action = (name, value) => page.locator(`#frame [data-cp="${name}"]${value === undefined ? '' : `[data-v="${value}"]`}`).first().click();
    const shot = async name => { await frame.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 80 }); captures.add(name); };
    const capturePage = async name => {
      await shot(name);
      if (await page.locator('.sheet').count()) return;
      const area = page.locator('.cp-scroll');
      const { height, max } = await area.evaluate(el => ({ height: el.clientHeight, max: el.scrollHeight - el.clientHeight }));
      for (let top = Math.min(max, height * .85), n = 2; top > 0; top = Math.min(max, top + height * .85), n++) {
        await area.evaluate((el, y) => { el.scrollTop = y; }, top); await shot(`${name}-below-${n}`); if (top === max) break;
      }
    };
    // Capture every requested drawing before the interaction walk.
    for (const width of ['phone', 'tablet', 'desktop']) {
      await set('w', width);
      for (const theme of ['light', 'dark']) for (const scale of ['regular', 'compact']) {
        await set('theme', theme); await set('scale', scale);
        for (const state of STATES) {
          await scene(state); await capturePage(`${width}-${theme}-${scale}-${state}`);
          assert.equal(await frame.getAttribute('data-screen'), 'connect');
          assert.equal(await page.locator('.strip [data-scn].on').getAttribute('data-scn'), state);
          assert.equal(await frame.locator('.rail,.upstrip').count(), 0, 'no logged-in furniture');
          const undersized = await frame.locator('button,input,a').evaluateAll(es => es.filter(e => e.checkVisibility()).filter(e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e), min = Math.max(parseFloat(c.getPropertyValue('--ctl')), parseFloat(c.getPropertyValue('--floor'))); return r.width + .1 < min || r.height + .1 < min; }).map(e => e.outerHTML.slice(0, 160)));
          assert.deepEqual(undersized, [], `control floor: ${width}/${theme}/${scale}/${state}`);
          assert.equal(await page.locator('.cp-scroll').evaluate(e => e.scrollWidth > e.clientWidth + 1), false, `horizontal overflow: ${width}/${theme}/${scale}/${state}`);
        }
        console.log(`captured ${width} / ${theme} / ${scale}`);
      }
    }
    await set('w', 'tablet'); await set('theme', 'light'); await set('scale', 'regular'); await scene('first-run');
    assert(await page.locator('[data-cp="connect"]').isDisabled());
    assert.equal(await frame.locator('button').count(), 2, 'first run has just Connect and Demo');
    await page.locator('#cp-address').fill('mystore.com');
    assert(await page.locator('[data-cp="connect"]').isEnabled());
    await page.locator('#cp-address').press('Enter');
    for (const [i, line] of STAGES.entries()) { await page.getByText(line, { exact: true }).waitFor(); await shot(`discovery-${i + 1}`); }
    await page.locator('.strip [data-scn="one-site"].on').waitFor();
    assert.equal(await frame.locator('.cp-site').count(), 1);
    assert.equal(await page.locator('#cp-address').count(), 0, 'address folds after success');
    assert.equal(await frame.locator('.cp-user').count(), 0, 'new site does not invent credentials');
    await shot('discovery-complete');
    await action('signin'); assert(await page.locator('[data-cp="open"]').isEnabled());
    await scene('one-site'); assert.equal(await page.evaluate(() => document.activeElement.dataset.cp), 'open', 'ready saved site focuses Open POS');
    assert.equal(await page.locator('.strip [data-set="field"]').count(), 0, 'Field comparison is retired');
    assert.equal(await page.locator('#cp-address').count(), 0, 'saved site keeps the address folded');
    await action('unfold'); await page.locator('#cp-address').fill('mystore.com'); await action('connect');
    await page.locator('.strip [data-scn="one-site"].on').waitFor();
    assert.equal(await frame.locator('.cp-site').count(), 1, 'reconnect updates rather than duplicates');
    assert.equal(await frame.locator('.cp-user').count(), 2, 'reconnect preserves local users');
    for (const state of ['error-wp', 'error-timeout', 'error-host', 'error-woo', 'error-update']) {
      await scene(state); assert(await page.locator('#cp-error').isVisible()); assert.equal(await frame.locator('a').count(), 1);
      await page.locator('#cp-address').fill('another.example'); assert.equal(await frame.locator('#cp-error').innerText(), ''); assert.equal(await frame.locator('a').count(), 0);
      await action('clear'); assert.equal(await page.locator('#cp-address').inputValue(), ''); assert(await page.locator('#cp-address').evaluate(e => e === document.activeElement));
    }
    for (const state of ['checking-user', 'expired-user', 'no-stores', 'many-stores']) { await scene(state); assert(await page.locator('[data-cp="open"]').isDisabled(), state); }
    await scene('many-stores'); await action('store', 'market'); assert(await page.locator('[data-cp="open"]').isEnabled());
    await page.locator('[data-cp="store"][data-v="market"]').press('ArrowDown'); assert.equal(await page.locator('[data-cp="store"][aria-checked="true"]').getAttribute('data-v'), 'upstairs');
    await action('user', 'amy'); assert.equal(await page.locator('[data-cp="store"][aria-checked="true"]').count(), 0, 'user change clears store choice');
    await scene('expired-user'); await action('reauth', 'sam'); await page.getByText('Checking…', { exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector('[data-cp="open"]').disabled);
    await scene('many-sites'); await action('site', 'bakery'); assert.equal(await frame.locator('.cp-body').count(), 1);
    await action('site', 'bakery'); assert.equal(await frame.locator('.cp-body').count(), 0);
    await action('site', 'weekend'); await action('remove-site', 'weekend'); await action('cancel'); assert.equal(await frame.locator('.cp-site').count(), 3);
    await action('remove-site', 'weekend'); await action('remove'); assert.equal(await frame.locator('.cp-site').count(), 2); assert.equal(await frame.locator('[data-site="main"] .cp-body').count(), 1);
    await scene('one-site'); await action('remove-user', 'sam'); await shot('remove-user');
    await page.keyboard.press('Escape'); assert(await page.locator('[data-cp="remove-user"][data-v="sam"]').evaluate(e => e === document.activeElement));
    await action('remove-user', 'sam'); await action('remove'); assert.equal(await frame.locator('.cp-user').count(), 1);
    await action('remove-user', 'amy'); await action('remove'); assert.equal(await frame.locator('[data-cp="open"]').count(), 0);
    await action('remove-site', 'main'); await action('remove'); assert.equal(await frame.locator('.cp-site').count(), 0); assert(await page.locator('#cp-address').isVisible());
    await action('demo'); for (const line of STAGES) await page.getByText(line, { exact: true }).waitFor();
    await page.locator('.strip [data-scn="demo"].on').waitFor(); assert(await page.getByText('Demo store', { exact: true }).count());
    await action('open'); assert.equal(await frame.getAttribute('data-screen'), 'register');
    await page.click('.rail .avr'); await page.click('[data-cp-enter]'); assert.equal(await frame.getAttribute('data-screen'), 'connect');
    assert.equal(await page.locator('.strip [data-scn].on').getAttribute('data-scn'), 'demo', 'Connect keeps its own state');
    await action('open'); await page.click('.strip [data-scn="connect"]'); assert.equal(await frame.getAttribute('data-screen'), 'connect');
    await set('w', 'phone'); await scene('one-site'); await action('open'); await page.click('.bar .avbtn'); await page.click('[data-cp-enter]'); assert.equal(await frame.getAttribute('data-screen'), 'connect');
    assert.deepEqual(errors, [], 'page/console errors');
    console.log(`PASS · Connect interactions · ${captures.size} captures written to ${OUT} · 0 page/console errors`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
