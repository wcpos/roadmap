import sys; sys.path.insert(0, sys.argv[1])
from _common import *

CSS = '''
.task{flex:1;display:flex;flex-direction:column;background:var(--bg);min-width:0}
.t-head{min-height:72px;display:flex;align-items:center;gap:16px;padding:12px 24px;background:var(--surface);border-bottom:1px solid var(--line)}
.t-head h1{font-size:20px;font-weight:700}
.t-head p{color:var(--text-2)}
.t-head .badge{margin-left:auto}
.t-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.count-pane{padding:28px 32px;display:flex;flex-direction:column;gap:14px;background:var(--surface);border-right:1px solid var(--line)}
.recon-pane{padding:28px 32px 24px;display:flex;flex-direction:column;gap:18px;min-width:0}
.readout{background:var(--sunken);border:1px solid var(--line);border-radius:var(--radius);padding:14px 20px 12px;display:flex;flex-direction:column;align-items:flex-end}
.readout .lbl{align-self:flex-start;font-weight:600;color:var(--text-2);font-size:15px}
.readout .big{display:flex;align-items:center;font-size:64px;font-weight:650;letter-spacing:-.02em;line-height:1.1}
.readout .big .cur{font-weight:400;color:var(--muted);margin-right:6px;font-size:52px}
.readout .big.zero{color:var(--muted);font-weight:400}
.caret{width:3px;height:54px;background:var(--focus);margin-left:6px;border-radius:2px}
.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.key{height:68px;border-radius:var(--radius);border:1px solid var(--line);background:var(--surface-2);font-size:26px;font-weight:600;display:grid;place-items:center;color:var(--text)}
.key .i{width:26px;height:26px}
.denoms summary{align-self:flex-start}
.eqcard{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
.eqcard .row{min-height:56px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:16px}
.eqcard .row + .row,.eqcard details + .row,.eqcard .row + details,.eqcard .fl{border-top:1px solid var(--line)}
.eqcard .row .l{color:var(--text-2);display:flex;align-items:center;gap:8px}
.eqcard .row .amt{font-size:20px;font-weight:600}
.eqcard .row .r{display:flex;align-items:center;gap:10px}
.eqcard .chev{color:var(--muted)}
.eqcard details .bd{padding:0 18px 10px}
.eqcard .diff{background:var(--tw);color:var(--tc)}
.eqcard .diff .l{color:var(--tc);font-weight:700}
.eqcard .diff .amt{font-size:22px;font-weight:700}
.eqcard .fl{padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface-2)}
.eqcard .fl span{display:block;color:var(--text-2)}
.split{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--text-2)}
.split b{color:var(--text)}
.other{border-top:1px solid var(--line)}
.other summary{min-height:52px;display:flex;align-items:center;gap:10px}
.other summary .grow{flex:1}
.other summary small{color:var(--muted);font-size:14px}
.other .chev{color:var(--muted)}
.action{margin-top:auto;display:flex;align-items:center;justify-content:flex-end;gap:16px;padding-top:8px}
.action{flex-wrap:wrap}
.action .btn-primary{min-width:260px}
.action .why{display:flex;align-items:center;gap:8px;color:var(--text-2);font-weight:500;flex:1 1 160px;justify-content:flex-end}
.donewrap{grid-column:1 / -1;max-width:560px;width:100%;margin:0 auto;padding:40px 24px;display:grid;gap:18px;align-content:start}
.donewrap h2{font-size:26px;font-weight:700}
.donewrap p{color:var(--text-2)}
.donewrap .bd{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:6px 18px;font-size:15px}
.donewrap .bad{color:var(--bad);font-weight:700}
.donewrap .acts{display:flex;gap:12px}
.donewrap .acts .btn-primary{flex:1}
.donewrap .acts .btn{min-height:56px;min-width:120px}
.in-frame{width:940px;zoom:.62;flex:none}
@media (max-width:767px){
 .t-head{min-height:64px;padding:8px 16px;gap:12px}
 .t-head h1{font-size:18px}
 .t-head p{font-size:14px}
 .t-body{display:flex;flex-direction:column;gap:12px;padding:12px 16px 16px;overflow:hidden}
 .count-pane,.recon-pane{display:contents}
 .readout,.eqcard,.keypad,.note,.action,.denoms,.split,.other{flex-shrink:0}
 .readout{order:1;padding:10px 16px}
 .readout .big{font-size:48px}
 .readout .big .cur{font-size:40px}
 .caret{height:42px}
 .eqcard{order:2}
 .eqcard .row{min-height:48px}
 .eqcard .row.counted{display:none}
 .keypad{order:3;gap:8px}
 .key{height:52px;font-size:22px}
 .note{order:4}
 .note label.nl{margin-bottom:6px}
 .note textarea{min-height:68px}
 .action{order:5;margin-top:0;padding-top:0}
 .action .btn-primary{flex:1;min-width:0}
 .denoms,.split,.other{order:6}
 .in-frame{width:100%;zoom:1}
}
'''

def head(s, title='Close register'):
    b = offline_badge() if s and s.get('offline') else ''
    return (f'<header class="t-head"><button class="icon-btn" aria-label="Close without saving">{ic("x")}</button>'
            f'<div><h1>{title}</h1><p>{META}</p></div>{b}</header>')

def task(k, hero=False, open_exp=False):
    s = S[k]
    zero = not s['counted']
    big = (f'<div class="big{" zero" if zero else ""}"><span class="cur">$</span>{s["counted"] or "0.00"}<span class="caret"></span></div>')
    readout = f'<div class="readout"><span class="lbl">Cash in drawer</span>{big}</div>'
    keys = ''.join(f'<button class="key">{x}</button>' for x in '123456789') + '<button class="key">.</button><button class="key">0</button>' + f'<button class="key" aria-label="Delete">{ic("back")}</button>'
    keypad = f'<div class="keypad">{keys}</div>'
    den = f'<details class="denoms"><summary class="textbtn">{ic("coins")}Count by notes and coins</summary>{denoms()}</details>'
    exp_l = 'Expected from sales' if s.get('first') else 'Expected'
    exp = (f'<details{" open" if open_exp else ""}><summary class="row"><span class="l">{exp_l}</span><span class="r"><span class="amt">${s["expected"]}</span>{ic("chev","i chev")}</span></summary>{breakdown(s)}</details>')
    fl = ''
    if s.get('first'):
        fl = (f'<div class="fl"><div><b>No opening float recorded</b><span>First close on this register</span></div>'
              f'<button class="btn">{ic("plus")}Enter opening float</button></div>')
    cnt = f'<div class="row counted"><span class="l">Counted</span><span class="amt">{money(s["counted"])}</span></div>'
    diff = f'<div class="row diff tone-{s["tone"]}"><span class="l">{ic(s["icon"])}{s["word"]}</span><span class="amt">{s["diff"]}</span></div>'
    card = f'<div class="eqcard">{exp}{fl}{cnt}{diff}</div>'
    split = (f'<div class="split"><span>Leave in drawer <b>${s["keep"]}</b> · To bank <b>{money(s["bank"])}</b></span>'
             f'<button class="textbtn">{ic("pencil")}Change</button></div>')
    other = (f'<details class="other"><summary>{ic("orders")}<span class="grow">Other payments <small>not counted</small></span>'
             f'<b>$1,369.60</b>{ic("chev","i chev")}</summary>{OTHER}</details>')
    if s['can']:
        act = '<div class="action"><button class="btn-primary">Close register</button></div>'
    else:
        act = f'<div class="action"><span class="why">{ic("info")}{s["reason"]}</span><button class="btn-primary" disabled>Close register</button></div>'
    body = (f'<div class="t-body"><div class="count-pane">{readout}{keypad}{den}</div>'
            f'<div class="recon-pane">{card}{note(s, focus=(hero and k=="short"))}{split}{other}{act}</div></div>')
    return f'<section class="task{"" if hero else " in-frame"}" aria-label="Close register">{head(s)}{body}</section>'

def closed():
    return (f'<section class="task in-frame" aria-label="Register closed">{head(None, "Register closed")}<div class="t-body">'
            f'<div class="donewrap"><div class="done-ico">{ic("check")}</div><div><h2>Front counter is closed</h2><p>Saved to Reports › Closures at 17:43</p></div>'
            '<dl class="bd"><dt>Counted cash</dt><dd>$504.35</dd><dt>Expected</dt><dd>$519.35</dd>'
            '<dt>Short</dt><dd class="bad">−$15.00</dd><dt>To bank</dt><dd>$354.35</dd><dt>Left in drawer</dt><dd>$150.00</dd>'
            '<dt>Card, gift card, store credit</dt><dd>$1,369.60</dd></dl>'
            f'<div class="acts"><button class="btn-primary">{ic("printer")}Print closure slip</button><button class="btn">Done</button></div></div></div></section>')

hero = f'<div class="hero">{RAIL}{task("short", hero=True)}</div>'
frames = [('over',task('over')),('balanced',task('balanced')),('first',task('first')),
          ('offline',task('offline')),('empty',task('empty')),('closed',closed())]
b = board('Variant 2: full-screen counting desk beside the rail; keypad left, reconciliation right. Each frame is the task at 62%.', frames, 'repeat(2,585px)', LABELS)
open(sys.argv[2],'w').write(page('Close register, counting desk', CSS, hero + b))
