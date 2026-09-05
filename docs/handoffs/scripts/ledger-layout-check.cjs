const fs = require('fs');
const path = require('path');
const M = require('mustache');
const { chromium } = require('playwright');
const pro = process.env.PRO;
const tpl = fs.readFileSync(path.join(pro, 'templates/display.html'), 'utf8');
const sample = JSON.parse(fs.readFileSync(path.join(pro, 'packages/display/src/sample-snapshot.json'), 'utf8'));
function ctx(state, extra) {
  const o = sample.states[state] || {};
  const c = { ...sample.order, ...(o.order || {}), ledger: o.ledger || sample.ledger };
  const p = sample.payment[state.split('.')[1]]; if (p) c.payment = p;
  return { ...c, ...extra };
}
const line = (i) => ({ name: 'Item ' + i, qty: 1, line_total_display: '£9.99', meta: [] });
const cases = [
  ['cart short + customer', ctx('cart', { customer: { id: 7, name: 'Max Power' }, lines: [line(1), line(2)] })],
  ['cart empty + customer', ctx('cart.empty', { customer: { id: 7, name: 'Max Power' }, lines: [] })],
  ['cart long + customer', ctx('cart', { customer: { id: 7, name: 'Max Power' }, lines: Array.from({ length: 40 }, (_, i) => line(i)) })],
  ['cart short guest', ctx('cart', { customer: { id: null, name: 'Guest' }, lines: [line(1), line(2)] })],
  ['payment.started + customer', ctx('payment.started', { customer: { id: 7, name: 'Max Power' }, lines: [line(1)] })],
];
(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const [name, c] of cases) {
      const html = M.render(tpl, c);
      // only the matching section, like the engine
      await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body></body></html>');
      await page.evaluate((html) => {
        const t = document.createElement('template'); t.innerHTML = html;
        const want = document.body.dataset.state;
        document.body.innerHTML = '';
        for (const n of t.content.children) document.body.appendChild(n.cloneNode(true));
      }, html);
      const state = c.payment ? 'payment.' + c.payment.state : 'cart';
      await page.evaluate((state) => {
        for (const s of document.querySelectorAll('section[data-wcpos-state]')) if (s.dataset.wcposState !== state) s.remove();
      }, state);
      const r = await page.evaluate(() => {
        const list = document.querySelector('.wcpos-ledger__list');
        const g = document.querySelector('.wcpos-ledger__greeting');
        const cap = document.querySelector('.wcpos-ledger__caption');
        const panel = document.querySelector('.wcpos-ledger__panel');
        const empty = document.querySelector('.wcpos-ledger__empty');
        return {
          pageScroll: document.scrollingElement.scrollHeight - innerHeight,
          listOverflow: list.scrollHeight - list.clientHeight,
          greetingTop: g ? Math.round(g.getBoundingClientRect().top) : null,
          greetingText: g ? g.textContent : null,
          captionTop: Math.round(cap.getBoundingClientRect().top),
          panelVisible: panel.getBoundingClientRect().top < innerHeight,
          emptyCentered: empty ? Math.round(empty.getBoundingClientRect().top + empty.getBoundingClientRect().height / 2 - list.getBoundingClientRect().top - list.clientHeight / 2) : null,
        };
      });
      console.log(`${w}x${h} | ${name.padEnd(28)} | pageScroll=${r.pageScroll} listOverflow=${r.listOverflow} greeting=${JSON.stringify(r.greetingText)}@${r.greetingTop} caption@${r.captionTop} panelVisible=${r.panelVisible} emptyOffset=${r.emptyCentered}`);
    }
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
