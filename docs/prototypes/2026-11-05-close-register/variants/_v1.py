import sys; sys.path.insert(0, sys.argv[1])
from _common import *
S['first'] = dict(S['first'], tone='muted', word='Difference unknown', icon='info', diff='')
def offline_badge(): return f'<span class="badge">{ic("cloudoff")}Offline <small>· saves here, syncs when online</small></span>'

CSS = '''
.reg{flex:1;display:grid;grid-template-columns:1fr 380px;min-width:0}
.prods{padding:20px 24px;display:flex;flex-direction:column;gap:16px;min-width:0}
.search{height:48px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);display:flex;align-items:center;gap:10px;padding:0 14px;color:var(--muted)}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.tile{height:112px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);padding:12px;display:flex;flex-direction:column;justify-content:flex-end;font-weight:600}
.tile span{color:var(--text-2);font-weight:400}
.cart{border-left:1px solid var(--line);background:var(--surface);padding:20px;display:flex;flex-direction:column;gap:16px}
.ccard{border:1px solid var(--line);border-radius:var(--radius);padding:14px;display:grid;gap:12px}
.ccard .who{display:flex;gap:12px;align-items:center}
.av{width:40px;height:40px;border-radius:50%;background:var(--surface-2);display:grid;place-items:center;font-weight:700;border:1px solid var(--line)}
.ccard .acts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.ccard .acts .btn{padding:0 8px;font-size:14px}
.cart .empty{flex:1;display:grid;place-items:center;color:var(--muted)}
.cart .pay{min-height:56px;border-radius:var(--radius);background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font-weight:600;font-size:17px}
.scrim{position:absolute;inset:0;background:var(--scrim)}

.sheet{position:absolute;top:0;right:0;bottom:0;width:500px;background:var(--surface);border-left:1px solid var(--line);display:flex;flex-direction:column}
.s-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:20px 24px 12px}
.s-head h1{font-size:22px;font-weight:700;letter-spacing:-.01em}
.s-head p{color:var(--text-2);margin-top:2px}
.s-badge{padding:0 24px 6px}
.s-body{flex:1;min-height:0;padding:8px 24px 16px;display:flex;flex-direction:column;gap:18px}
.count-label{display:block;font-size:15px;font-weight:600;color:var(--text-2);margin-bottom:8px}
.count-field{display:flex;align-items:center;height:80px;border:1.5px solid var(--line-strong);border-radius:var(--radius);padding:0 18px;background:var(--surface)}
.count-field .cur{font-size:40px;font-weight:400;color:var(--muted);margin-right:4px}
.count-field input{border:0;background:none;outline:none;width:100%;font-size:44px;font-weight:650;letter-spacing:-.01em}
.count-field input::placeholder{color:var(--muted);font-weight:400}
.count-field.focus{border-color:var(--focus);box-shadow:0 0 0 3px color-mix(in srgb,var(--focus) 28%,transparent)}
.denoms summary{margin-top:6px}
.recon{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
.recon .row{min-height:56px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.recon .row .l{display:flex;align-items:center;gap:8px;font-size:16px}
.recon .row .amt{font-size:20px;font-weight:600}
.recon details .bd{padding:0 16px 10px}
.recon .exp .l{color:var(--text-2)}
.recon .exp .r{display:flex;align-items:center;gap:10px}
.recon .exp .chev{color:var(--muted)}
.recon .diff{border-top:1px solid var(--line);background:var(--tw);color:var(--tc);font-weight:700}
.recon .diff .l{font-weight:700}
.recon .diff .amt{font-size:22px;font-weight:700}
.recon .diff .unk{font-weight:500;color:var(--text-2);font-size:14px;text-align:right}
.recon .float{border-top:1px solid var(--line);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface-2)}
.recon .float b{display:block}
.recon .float span{color:var(--text-2)}
.split{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--text-2)}
.split b{color:var(--text);font-weight:600}
.split .pair{white-space:nowrap}
.other{border-top:1px solid var(--line)}
.other summary{min-height:52px;display:flex;align-items:center;gap:10px}
.other summary .grow{flex:1}
.other summary small{color:var(--muted);font-size:14px}
.other .chev{color:var(--muted)}
.s-foot{padding:16px 24px 20px;border-top:1px solid var(--line);display:flex;align-items:center;gap:16px;background:var(--surface)}
.s-foot .btn-primary{flex:1}
.s-foot .why{display:flex;align-items:center;gap:8px;color:var(--text-2);font-weight:500;flex:1}
.s-foot .why + .btn-primary{flex:none}
.done{padding:28px 24px 8px;display:grid;gap:16px}
.done h2{font-size:24px;font-weight:700}
.done p{color:var(--text-2)}
.done .bd{border:1px solid var(--line);border-radius:var(--radius);padding:6px 16px;font-size:15px}
.done .bd .bad{color:var(--bad);font-weight:700}
.s-foot.stack{flex-direction:column;align-items:stretch;gap:10px}
.in-frame{position:static;width:480px;border-left:0;zoom:.8}
.in-frame .s-body{flex:none}
@media (max-width:767px){
 .reg,.scrim{display:none}
 .sheet{position:relative;width:100%;border-left:0;height:844px}
 .s-head,.s-badge,.s-body,.s-foot{padding-left:16px;padding-right:16px}
 .s-body{gap:16px}
 .in-frame{width:100%;height:auto;zoom:1}
}
'''

def register():
    tiles = [('Cold brew 330ml','4.50'),('Sourdough loaf','6.00'),('Oat milk 1L','2.80'),('Almond croissant','3.40'),
             ('Espresso beans 250g','12.00'),('Tote bag','8.00'),('Sparkling water','1.90'),('Granola jar','7.50'),
             ('Ceramic mug','14.00'),('Gift card','25.00'),('Honey 340g','9.00'),('Lemon tart','4.20'),
             ('Filter papers','3.10'),('Olive oil 500ml','11.00'),('Tea tin','6.50'),('Postcard','1.50')]
    t = ''.join(f'<div class="tile">{n}<span>${p}</span></div>' for n,p in tiles)
    return (f'<div class="reg" aria-hidden="true"><div class="prods"><div class="search">{ic("search")}Search products</div>'
            f'<div class="tiles">{t}</div></div>'
            '<aside class="cart"><div class="ccard"><div class="who"><div class="av">ML</div><div><b>Maria L.</b><div style="color:var(--text-2)">Front counter · open since 09:02</div></div></div>'
            '<div class="acts"><span class="btn">Pay in</span><span class="btn">Pay out</span><span class="btn">Close register</span></div></div>'
            '<div class="empty">No items in the cart</div><div class="pay">Checkout $0.00</div></aside></div><div class="scrim"></div>')

def sheet(k, hero=False, open_exp=False):
    s = S[k]
    cls = 'sheet' + ('' if hero else ' in-frame')
    head = (f'<header class="s-head"><div><h1>Close register</h1><p>{META}</p></div>'
            f'<button class="icon-btn" aria-label="Close without saving">{ic("x")}</button></header>')
    badge = f'<div class="s-badge">{offline_badge()}</div>' if s.get('offline') else ''
    fcls = 'count-field' + (' focus' if k=='empty' else '')
    count = (f'<div><label class="count-label">Cash in drawer</label><div class="{fcls}"><span class="cur">$</span>'
             f'<input inputmode="decimal" value="{s["counted"]}" placeholder="0.00" aria-label="Cash in drawer"></div>'
             f'<details class="denoms"><summary class="textbtn">{ic("coins")}Count by notes and coins</summary>{denoms()}</details></div>')
    exp_l = 'Expected from sales' if s.get('first') else 'Expected'
    exp = (f'<details class="exp"{" open" if open_exp else ""}><summary class="row"><span class="l">{exp_l}</span>'
           f'<span class="r"><span class="amt">${s["expected"]}</span>{ic("chev","i chev")}</span></summary>{breakdown(s)}</details>')
    fl = ''
    if s.get('first'):
        fl = (f'<div class="float"><div><b>First close on this register</b><span>No float was entered when it opened</span></div>'
              f'<button class="btn">{ic("plus")}Enter opening float</button></div>')
    diff = (f'<div class="row diff tone-{s["tone"]}"><span class="l">{ic(s["icon"])}{s["word"]}</span>'
            + (f'<span class="unk">Opening float not recorded</span></div>' if s.get('first') else f'<span class="amt">{s["diff"]}</span></div>'))
    recon = f'<div class="recon">{exp}{fl}{diff}</div>'
    split = (f'<div class="split"><span><span class="pair">Leave in drawer <b>${s["keep"]}</b></span> · <span class="pair">To bank <b>{money(s["bank"])}</b></span></span>'
             f'<button class="textbtn">{ic("pencil")}Change</button></div>')
    other = (f'<details class="other"><summary>{ic("orders")}<span class="grow">Other payments <small>not counted</small></span>'
             f'<b>$1,369.60</b>{ic("chev","i chev")}</summary>{OTHER}</details>')
    if s['can']:
        foot = f'<footer class="s-foot"><button class="btn-primary">Close register</button></footer>'
    else:
        foot = (f'<footer class="s-foot"><span class="why">{ic("info")}{s["reason"]}</span>'
                f'<button class="btn-primary" disabled>Close register</button></footer>')
    body = f'<div class="s-body">{count}{recon}{note(s, focus=(hero and k=="short"))}{split}{other}</div>'
    return f'<section class="{cls}" aria-label="Close register">{head}{badge}{body}{foot}</section>'

def closed():
    return (f'<section class="sheet in-frame" aria-label="Register closed"><header class="s-head"><div><h1>Register closed</h1><p>{META}</p></div>'
            f'<button class="icon-btn" aria-label="Close">{ic("x")}</button></header>'
            f'<div class="done"><div class="done-ico">{ic("check")}</div><div><h2>Front counter is closed</h2><p>Saved to Reports › Closures at 17:43</p></div>'
            '<dl class="bd"><dt>Counted cash</dt><dd>$504.35</dd><dt>Expected</dt><dd>$519.35</dd>'
            f'<dt>Short</dt><dd class="bad">−$15.00</dd><dt>To bank</dt><dd>$354.35</dd><dt>Left in drawer</dt><dd>$150.00</dd>'
            '<dt>Card, gift card, store credit</dt><dd>$1,369.60</dd></dl></div>'
            f'<footer class="s-foot stack"><button class="btn-primary">{ic("printer")}Print closure slip</button><button class="btn">Done</button></footer></section>')

hero = f'<div class="hero">{RAIL}{register()}{sheet("short", hero=True)}</div>'
frames = [('over',sheet('over')),('balanced',sheet('balanced')),('first',sheet('first', open_exp=True)),
          ('offline',sheet('offline')),('empty',sheet('empty')),('closed',closed())]
b = board('Variant 1: right-side sheet over the dimmed register. Each frame is the sheet at 80%.', frames, 'repeat(3,384px)', LABELS)
open(sys.argv[2],'w').write(page('Close register, sheet', CSS, hero + b))
