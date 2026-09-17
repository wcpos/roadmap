// Throwaway prototype verification: one browser, #frame only, no app/server required.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('node:assert/strict');
const roots = ['/Users/kilbot/Projects/monorepo-v2'];
for (let p = __dirname; ; p = path.dirname(p)) {
  roots.push(p);
  if (p === path.dirname(p)) break;
}
const { chromium } = require(require.resolve('playwright', { paths: roots }));
const OUT = path.join(__dirname, 'screens');
const QUICK = process.argv.includes('--quick');
const STATES = ['today','last-week','excluded','date','scope','payments','orders','session','closed','closure','recount','empty','loading','offline','offline-recount','free-sales','free-closures','bell','error'];
const WIDTHS = QUICK ? ['tablet'] : ['phone','tablet','desktop'];
const THEMES = QUICK ? ['light'] : ['light','dark'];
const SCALES = QUICK ? ['regular'] : ['regular','compact'];
const checks = {
  today: '.hero .big', 'last-week': '.chart[data-unit="week"]', excluded: '[data-act="resetTicks"]',
  date: '[data-menu="date"]', scope: '[data-menu="scope"]', payments: '.detail .touch-report, .detail .t',
  orders: '.detail input[data-act="tick"]', session: '[data-testid="session-expected"]',
  closed: '[data-testid="session-reprint"]', closure: '[data-testid="closure-settled"]',
  recount: '#recount-reason', empty: '[data-testid="closures-empty"]', loading: '.skeleton',
  offline: '.tile[data-v="deposits"][disabled]', 'offline-recount': '[data-testid="recount-offline"]',
  'free-sales': '[data-testid="reports-lock-hint"]', 'free-closures': '[data-testid="reports-lock-hint"]',
  bell: '.bd.notif', error: '[data-testid="closure-document-error"]',
};
(async () => {
  assert(fs.existsSync(path.join(__dirname, 'index.html')), 'Reports index.html must exist');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1400 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(pathToFileURL(path.join(__dirname, '../pos-register/index.html')).href);
    fs.mkdirSync(OUT, { recursive: true });
    const set = (k, v) => page.click(`.strip [data-set="${k}"][data-v="${v}"]`);
    await page.click('.rail [data-nav="reports"]');   // Reports is reached from the rail, as in the app
    assert(await page.locator('.frame[data-screen="reports"]').count(), 'the rail did not open Reports');
    const scn = v => page.click(`.strip [data-scn="${v}"]`);
    let n = 0;
    for (const w of WIDTHS) for (const theme of THEMES) for (const scale of SCALES) {
      await set('w', w); await set('theme', theme); await set('scale', scale);
      for (const s of STATES) {
        await scn(s);
        assert(await page.locator(checks[s]).count(), `${w}/${theme}/${scale}/${s}: distinguishing element missing`);
        if (['today','last-week'].includes(s)) assert(await page.locator('.ref-line').count(), 'comparison line missing');
        if (s === 'today') assert.equal(await page.locator('.future-bar').count(), 2, 'hours still to come missing');
        if (['today','last-week'].includes(s)) {
          assert(await page.locator('.bars rect:not(.hit)').evaluateAll(bars => bars.every(b => b.getBoundingClientRect().width <= 40.1)), 'bar exceeds 40 px');
          assert.equal(await page.locator('.peak-label').count(), 1, 'busiest hour not labelled on the chart');
          assert.equal(await page.locator('.chart-mode button.on').textContent(), s === 'today' ? 'By hour' : 'By day');
          assert(/ vs /.test(await page.locator('.hero .prev .delta').textContent()), 'delta chip must name the comparison');
          assert.equal(await page.locator('.hero .kpi .delta').count(), 3, 'companions carry deltas');
          assert((await page.locator('.hero .datebtn').textContent()).startsWith(s === 'today' ? 'Today' : 'Last week'), 'the date is the chart title');
          assert.equal(await page.locator('.scope-row').count(), 0, 'Sales has no scope row');
        }
        if (s === 'session') {
          assert.equal(await page.locator('.scope-row [data-p="overflow"][aria-label="More"]').count(), 1);
          assert.equal(await page.locator('.bar [data-p="filter"]').count(), 1, 'the filter lives in the bar');
          assert.equal(await page.locator('.bar [data-p="scope"]').count(), 1, 'register and store are the bar title');
          assert.equal(await page.locator('.pad [data-p="overflow"]').count(), 0);
        }
        if (s === 'today') assert.equal(await page.locator('.scope-row [data-p="overflow"]').count(), 0);
        if (s === 'closure') {
          assert.equal(await page.locator('.detail .h [aria-label="Close"]').count(), w === 'phone' ? 0 : 1);
          assert.equal(await page.locator('.detail .ft .status').textContent(), w === 'phone' ? 'Recorded 17:45' : 'As recorded at 17:45');
        }
        if (s === 'orders') {
          assert.equal(await page.locator('.orders-head label').textContent(), 'All orders');
          assert.equal(await page.locator('.orders-left-out').count(), 0);
          if (w !== 'phone') assert(await page.locator('.order-row').evaluateAll(rows => rows.every(r => Math.abs(r.getBoundingClientRect().height - parseFloat(getComputedStyle(r).getPropertyValue('--row'))) <= 1.5 /* the hairline border sits on top of --row */)), 'order row too tall');
        }
        if (s === 'recount') {
          assert.equal(await page.locator('.sheet-h .t').textContent(), 'Recount');
          assert.equal(await page.locator('.sheet-context').textContent(), 'Recorded £412.00 · expected £422.00');
          assert.equal(await page.locator('.fold > button').textContent(), 'Count by denominations');
          assert.equal(await page.locator('#save-recount').evaluate(b => getComputedStyle(b).opacity), '0.45');
          assert(await page.locator('#recount-reason').evaluate(input => { const r=input.getBoundingClientRect(), b=input.closest('.sheet-b').getBoundingClientRect(); return r.left >= b.left+4 && r.right <= b.right-4; }), 'focus ring has no room');
        }
        if (s === 'free-closures') {
          const row = await page.locator('[data-act="hint"][data-v="closures"]').first().boundingBox(), pop = await page.locator('.pop').boundingBox();
          assert(Math.abs(pop.x-row.x)<1 && Math.abs(pop.y-row.y-row.height-6)<1 && Math.abs(pop.width-row.width)<1, 'gate is not under full locked row');
        }
        if (s === 'last-week') assert.equal(await page.locator('.cur-bar').count(), 7, 'week must have seven day buckets');
        if (s.startsWith('free-')) {
          assert.equal(await page.locator('[data-testid="reports-lock-hint"]').textContent(), s === 'free-sales' ? 'Earlier days are in WCPOS Pro' : 'Earlier closures are in WCPOS Pro');
          assert.equal(await page.locator('.gate-action').textContent(), 'See Pro');
        }
        if (s === 'error') assert.equal(await page.locator('.detail .docv').count(), 0, 'stale document shown on online error');
        if (s === 'offline-recount') assert(await page.locator('#save-recount').isDisabled(), 'offline recount enabled');
        assert(await page.locator('#frame').evaluate(f => f.scrollWidth <= f.clientWidth + 1), `${s}: frame overflow`);
        assert(await page.locator('.main').evaluate(f => f.scrollWidth <= f.clientWidth + 1), `${s}: main overflow`);
        await page.locator('#frame').screenshot({ path: path.join(OUT, `${w}-${theme}-${scale}-${s}.jpg`), type: 'jpeg', quality: 82, animations: 'disabled' });
        n++;
      }
      for (const plan of ['top','pro']) {   // Paul 2026-09-17: the strip is at the top, decided; the bottom option is gone from the register
        await scn('today'); await set('plan', plan);
        assert.equal(await page.locator('.upstrip').count(), plan === 'pro' ? 0 : 1);
        if (plan !== 'pro') assert(await page.locator(`#frame > .upstrip.${plan}`).count(), 'strip must be outside body');
      }
    }
    // Exercise interactions, not just strip presets.
    await set('w','tablet'); await set('theme','light'); await set('scale','regular'); await scn('today');
    const total = await page.locator('.hero .big').textContent();
    await page.click('.tile[data-v="orders"]');
    await page.locator('[data-act="tick"]').first().click();
    await page.locator('[data-act="tick"]').nth(1).click();
    assert.equal(await page.locator('.orders-left-out').textContent(), '2 orders left out');
    assert.equal(await page.locator('.order-row.off').count(), 2);
    await page.click('.detail [data-act="closePanel"]');
    assert.notEqual(await page.locator('.hero .big').textContent(), total, 'unticking must change totals');
    await page.click('[data-act="resetTicks"]');
    assert.equal(await page.locator('.hero .big').textContent(), total);
    await page.click('[data-act="chart"][data-v="run"]');   // the chart toggle (Paul 2026-09-17)
    assert.equal(await page.locator('.run-line').count(), 1, 'running total did not draw');
    assert.equal(await page.locator('.chart-mode button.on').textContent(), 'Running total');
    await page.click('[data-act="chart"][data-v="hour"]');
    assert.equal(await page.locator('.cur-bar').count(), 9, 'hour bars did not come back');
    await set('plan','pro'); await page.click('.hero [data-p="date"]');   // the picker: quick ranges beside a calendar (Paul 2026-09-17)
    assert.equal(await page.locator('.pop .quick .pr').count(), 6); assert.equal(await page.locator('.pop .cal .d').count(), 30, 'September has 30 days');
    await page.click('.pop .cal .d[data-v="6"]'); await page.click('.pop .cal .d[data-v="1"]');
    assert((await page.locator('.hero .datebtn').textContent()).startsWith('8–13 Sep'), 'two taps make a range');
    await page.click('.pop [data-act="preset"][data-v="day:0"]'); assert.equal(await page.locator('.pop').count(), 1, 'a quick range keeps the picker open');
    await page.click('.pop [data-act="closePop"]'); assert.equal(await page.locator('.pop').count(), 0);
    await scn('free-closures'); await page.click('.popwrap', { position: { x: 1, y: 1 } });
    const locked = page.locator('[data-act="hint"][data-v="closures"]').nth(1);
    await locked.scrollIntoViewIfNeeded();
    const lockedId = await locked.getAttribute('data-id');
    const scroll = await page.locator('.page>.pad').evaluate(p => p.scrollTop);
    await locked.click();
    assert.equal(await page.locator('.page>.pad').evaluate(p => p.scrollTop), scroll, 'gate reset list scroll');
    const rowBox = await page.locator(`[data-id="${lockedId}"]`).boundingBox(), gateBox = await page.locator('.pop').boundingBox();
    assert(Math.abs(gateBox.y-rowBox.y-rowBox.height-6)<1, 'gate anchored to a different locked row');
    await set('plan','pro');
    assert.equal(await page.locator('[data-testid="reports-lock-hint"]').count(), 0, 'Pro left an obsolete gate');
    await scn('date'); await set('plan','pro');
    await page.click('.pop .cal .d[data-v="13"]'); await page.click('.pop .cal .d[data-v="0"]');   // 1–14 Sep on the calendar
    assert.equal(await page.locator('.chart').getAttribute('data-unit'), 'custom');
    await scn('scope'); await set('plan','pro'); await page.click('[data-act="register"][data-v="all"]');
    assert(await page.locator('.tile[data-v="registers"]').count());
    await scn('payments'); await page.selectOption('#template','thermal');
    assert(await page.locator('.docv.thermal').count(), 'template did not change document');
    await scn('bell'); await page.click('.bd.notif');
    assert(await page.locator('.bd.notif').count(), 'panel interior closed overlay');
    await page.click('.sidewrap', { position: { x: 10, y: 20 } });
    assert.equal(await page.locator('.bd.notif').count(), 0, 'scrim did not close overlay');
    await scn('recount');
    assert(await page.locator('#save-recount').isDisabled(), 'blank reason accepted');
    await page.fill('#recount-reason','Coins found in tray'); await page.fill('#recount-total','422.00');
    assert(!(await page.locator('#save-recount').isDisabled()), 'valid recount did not enable save');
    await page.click('#save-recount');
    assert(await page.locator('[data-testid="closure-settled"]').count(), 'recount did not return to correction');
    await scn('error'); await page.click('[data-act="retry"]');
    assert.equal(await page.locator('[data-testid="closure-document-error"]').count(), 0);
    assert.deepEqual(errors, [], errors.join('\n'));
    console.log(`PASS · ${n} state captures; plan and interaction assertions · ${OUT}`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
