// Live token sheet: full-length tablet captures, one per theme; no quick mode or deletion.
// Run from /Users/kilbot/Projects/monorepo-v2, matching orders/shoot-pages.js.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('node:assert/strict');
const { chromium } = require('/Users/kilbot/Projects/monorepo-v2/node_modules/playwright');
const OUT = path.join(__dirname, 'screens');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const errors = [], captures = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1400 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    await page.waitForURL('**/pos-register/index.html?screen=tokens');
    await page.evaluate(() => document.fonts.ready);
    const frame = page.locator('#frame');
    const set = (key, value) => page.click(`.strip [data-set="${key}"][data-v="${value}"]`);
    await set('w', 'tablet'); await set('scale', 'regular');
    const themes = await page.locator('.strip [data-set="theme"]').evaluateAll(es => es.map(e => e.dataset.v));
    assert.equal(themes.length, 9);
    for (const theme of themes) {
      await set('theme', theme);
      assert.equal(await frame.getAttribute('data-screen'), 'tokens');
      assert.equal(await frame.getAttribute('data-theme'), theme);
      assert.equal(await page.locator('#tk-colour tbody tr').count(), 28);
      assert.equal(await page.locator('#tk-contrast [data-contrast-theme]').count(), 54);
      assert.equal(await page.locator('.tk-page section').count(), 8);
      assert.equal(await frame.evaluate(e => e.scrollWidth > e.clientWidth + 1), false, 'tablet sheet fits');
      const name = `tablet-${theme}-regular.jpg`;
      await page.locator('#strip').evaluate(e => { e.style.visibility = 'hidden'; });
      await frame.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality: 82, animations: 'disabled' });
      await page.locator('#strip').evaluate(e => { e.style.visibility = ''; });
      captures.push(name);
    }
    // Required interaction assertion: neither default theme has a contrast failure.
    for (const theme of ['light', 'dark']) {
      await set('theme', theme);
      assert.equal(await page.locator(`[data-contrast-theme="${theme}"]`).count(), 6, 'five text pairs and one UI pair');
      const failures = await page.locator(`[data-contrast-theme="${theme}"][data-contrast-fail="true"]`).allTextContents();
      assert.deepEqual(failures, [], `${theme}: WCAG contrast failure`);
    }
    const categorical = await page.locator('#tk-colour tbody tr').evaluateAll(rows => rows.filter(r => /^--c[1-5]$/.test(r.querySelector('th').textContent)).map(r => [...r.querySelectorAll('td code')].map(c => c.textContent)));
    assert.equal(categorical.length, 5);
    categorical.forEach(values => assert.equal(new Set(values).size, 1, 'categorical colour is shared across themes'));
    await set('scale', 'compact');
    assert.match(await page.locator('#tk-scale').innerText(), /3\.5px/);
    await set('scale', 'spacious');
    assert.equal(await frame.getAttribute('data-scale'), 'spacious');
    assert.equal(await page.locator('#tk-type thead .tk-selected').innerText(), 'spacious');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: 'Play slam 0.38s', exact: true }).click();
    assert.equal(await page.locator('.tk-sample[style*="slam"]').evaluate(e => getComputedStyle(e).animationName), 'slam');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.tk-sample[style*="slam"]').evaluate(e => getComputedStyle(e).animationName), 'none');
    await set('w', 'phone');
    assert.equal(await frame.evaluate(e => e.scrollWidth > e.clientWidth + 1), false, 'phone scroll is local to colour matrices');
    await page.keyboard.press('Escape');
    assert.equal(await frame.getAttribute('data-screen'), 'register');
    assert.deepEqual(errors, [], 'page/console errors');
    console.log(`PASS · Tokens contrasts, shared categories, scale and motion · ${captures.length} captures written to ${OUT} · 0 page/console errors`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
