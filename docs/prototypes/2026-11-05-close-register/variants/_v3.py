import sys; sys.path.insert(0, sys.argv[1])
from _common import *

CSS = '''
.task{flex:1;display:flex;flex-direction:column;background:var(--bg);min-width:0}
.t-head{min-height:72px;display:flex;align-items:center;gap:16px;padding:12px 32px 12px 24px;background:var(--surface);border-bottom:1px solid var(--line);flex:none}
.t-head h1{font-size:20px;font-weight:700}
.t-head p{color:var(--text-2)}
.t-head .badge{margin-left:auto}
.t-scroll{flex:1;min-height:0;overflow:hidden;padding:32px 32px 24px;display:flex;flex-direction:column;gap:12px}
.cols{display:grid;grid-template-columns:minmax(0,1.4fr) 64px minmax(0,1fr) 64px minmax(0,1fr)}
.term{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px 16px;display:flex;flex-direction:column;gap:6px;min-height:176px}
.term .lbl{font-weight:600;color:var(--text-2);font-size:15px;display:flex;align-items:center;gap:8px}
.term .amt{font-size:34px;font-weight:600;margin-top:auto;letter-spacing:-.01em}
.term .sub{color:var(--text-2);font-size:14px;min-height:20px}
.term.lead{border:1.5px solid var(--line-strong)}
.term.lead.focus{border-color:var(--focus);box-shadow:0 0 0 3px color-mix(in srgb,var(--focus) 28%,transparent)}
.term.lead .field{margin-top:auto;display:flex;align-items:baseline}
.term.lead .cur{font-size:44px;color:var(--muted);margin-right:4px}
.term.lead input{border:0;background:none;outline:none;width:100%;font-size:60px;font-weight:650;letter-spacing:-.02em;line-height:1.1}
.term.lead input::placeholder{color:var(--muted);font-weight:400}
.term.res{background:var(--tw);border-color:color-mix(in srgb,var(--tc) 30%,transparent)}
.term.res .lbl{color:var(--tc);font-weight:700;font-size:16px}
.term.res .amt{color:var(--tc);font-weight:700}
.term.res .sub{color:var(--text)}
.term .miss{color:var(--info);display:flex;align-items:center;gap:6px;font-weight:600}
.term .miss .i{width:18px;height:18px}
.op{display:grid;place-items:center;font-size:40px;font-weight:300;color:var(--muted)}
.foot-notes{align-items:start}
.foot-notes > *{min-width:0}
.foot-notes .bd{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:4px 16px;margin-top:6px}
.foot-notes .c1{grid-column:1}
.foot-notes .c3{grid-column:3}
.foot-notes .c5{grid-column:5}
.foot-notes .chev{color:var(--muted)}
.lower{display:grid;grid-template-columns:minmax(0,1.4fr) 64px minmax(0,2fr);margin-top:12px}
.lower .note{grid-column:1}
.after{grid-column:3;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:4px 18px;align-self:start}
.after .ln{min-height:52px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--line)}
.after .ln .grow{flex:1;color:var(--text-2)}
.after .ln b{font-size:16px}
.after summary{min-height:52px;display:flex;align-items:center;gap:10px}
.after summary .grow{flex:1;color:var(--text-2)}
.after summary small{color:var(--muted);font-size:14px}
.after .chev{color:var(--muted)}
.after details .bd{padding-bottom:8px}
.t-foot{flex:none;background:var(--surface);border-top:1px solid var(--line);padding:16px 32px;display:flex;align-items:center;justify-content:flex-end;gap:16px}
.t-foot .why{display:flex;align-items:center;gap:8px;color:var(--text-2);font-weight:500}
.t-foot .btn-primary{min-width:300px}
.t-foot .btn{min-height:56px;min-width:120px}
.done-head{display:flex;align-items:center;gap:16px;margin-bottom:12px}
.done-head h2{font-size:24px;font-weight:700}
.done-head p{color:var(--text-2)}
.in-frame{width:940px;zoom:.62;flex:none}
@media (max-width:767px){
 .t-head{min-height:64px;padding:8px 16px;gap:12px}
 .t-head h1{font-size:18px}
 .t-scroll{padding:16px;gap:10px}
 .cols.eq{grid-template-columns:36px minmax(0,1fr);grid-template-areas:"c c" "o1 e" "o2 r";row-gap:8px}
 .eq .lead{grid-area:c;min-height:0}
 .eq .op1{grid-area:o1}.eq .exp{grid-area:e}.eq .op2{grid-area:o2}.eq .res{grid-area:r}
 .op{font-size:30px;place-items:center start}
 .term{min-height:0;padding:12px 16px}
 .term.lead input{font-size:46px}
 .term.lead .cur{font-size:36px}
 .eq .exp,.eq .res{display:grid;grid-template-columns:1fr auto;align-items:center;column-gap:12px}
 .eq .exp .amt,.eq .res .amt{font-size:24px;margin:0;grid-row:1 / span 2;grid-column:2}
 .eq .exp .sub,.eq .res .sub{min-height:0}
 .foot-notes{display:flex;flex-wrap:wrap;gap:0 16px}
 .foot-notes .c5{display:none}
 .lower{display:block;margin-top:4px}
 .lower .note textarea{min-height:76px}
 .after{display:none}
 .t-foot{padding:12px 16px 16px}
 .t-foot .btn-primary{flex:1;min-width:0}
 .in-frame{width:100%;zoom:1}
}
'''

def head(s, title='Close register'):
    b = offline_badge() if s and s.get('offline') else ''
    return (f'<header class="t-head"><button class="icon-btn" aria-label="Close without saving">{ic("x")}</button>'
            f'<div><h1>{title}</h1><p>{META}</p></div>{b}</header>')

def res_sub(s):
    if s.get('first'): return 'Enter the float to check'
    if s['tone'] in ('bad','warn'): return 'Add a note to explain'
    if s['tone']=='ok': return 'Nothing to explain'
    return 'Type the counted cash'

def task(k, hero=False, open_exp=False):
    s = S[k]
    lead = (f'<label class="term lead{" focus" if k=="empty" else ""}"><span class="lbl">Counted cash</span>'
            f'<span class="field"><span class="cur">$</span><input inputmode="decimal" value="{s["counted"]}" placeholder="0.00"></span></label>')
    if s.get('first'):
        esub = f'<span class="sub miss">{ic("info")}No opening float recorded</span>'
        elbl = 'Expected from sales'
    else:
        esub = '<span class="sub">Float, sales, refunds, pay in and out</span>'
        elbl = 'Expected in drawer'
    exp = f'<div class="term exp"><span class="lbl">{elbl}</span><span class="amt">${s["expected"]}</span>{esub}</div>'
    res = (f'<div class="term res tone-{s["tone"]}"><span class="lbl">{ic(s["icon"])}{s["word"]}</span>'
           f'<span class="amt">{s["diff"]}</span><span class="sub">{res_sub(s)}</span></div>')
    eq = f'<div class="cols eq">{lead}<div class="op op1" aria-label="minus">−</div>{exp}<div class="op op2" aria-label="equals">=</div>{res}</div>'
    c3 = (f'<button class="btn c3">{ic("plus")}Enter opening float</button>' if s.get('first') else
          f'<details class="c3"{" open" if open_exp else ""}><summary class="textbtn">How it adds up{ic("chev","i chev")}</summary>{breakdown(s)}</details>')
    notes = (f'<div class="cols foot-notes"><details class="c1"><summary class="textbtn">{ic("coins")}Count by notes and coins</summary>{denoms()}</details>'
             f'{c3}</div>')
    after = (f'<div class="after"><div class="ln"><span class="grow">Leave in drawer for next shift</span><b>${s["keep"]}</b>'
             f'<button class="textbtn">{ic("pencil")}Change</button></div>'
             f'<div class="ln"><span class="grow">To bank</span><b>{money(s["bank"])}</b></div>'
             f'<details><summary>{ic("orders")}<span class="grow">Other payments <small>not counted</small></span><b>$1,369.60</b>{ic("chev","i chev")}</summary>{OTHER}</details></div>')
    lower = f'<div class="lower">{note(s, focus=(hero and k=="short"))}{after}</div>'
    if s['can']:
        foot = '<footer class="t-foot"><button class="btn-primary">Close register</button></footer>'
    else:
        foot = f'<footer class="t-foot"><span class="why">{ic("info")}{s["reason"]}</span><button class="btn-primary" disabled>Close register</button></footer>'
    return f'<section class="task{"" if hero else " in-frame"}" aria-label="Close register">{head(s)}<div class="t-scroll">{eq}{notes}{lower}</div>{foot}</section>'

def closed():
    eq = ('<div class="cols eq"><div class="term"><span class="lbl">Counted cash</span><span class="amt">$504.35</span><span class="sub">Saved</span></div>'
          '<div class="op">−</div><div class="term"><span class="lbl">Expected in drawer</span><span class="amt">$519.35</span><span class="sub">At 17:43</span></div>'
          f'<div class="op">=</div><div class="term res tone-bad"><span class="lbl">{ic("down")}Short</span><span class="amt">−$15.00</span><span class="sub">Note saved</span></div></div>')
    after = ('<div class="lower"><div></div><div class="after" style="grid-column:3"><div class="ln"><span class="grow">Left in drawer</span><b>$150.00</b></div>'
             '<div class="ln"><span class="grow">To bank</span><b>$354.35</b></div><div class="ln" style="border:0"><span class="grow">Card, gift card, store credit</span><b>$1,369.60</b></div></div></div>')
    return (f'<section class="task in-frame" aria-label="Register closed">{head(None, "Register closed")}<div class="t-scroll">'
            f'<div class="done-head"><div class="done-ico">{ic("check")}</div><div><h2>Front counter is closed</h2><p>Saved to Reports › Closures at 17:43</p></div></div>'
            f'{eq}{after}</div><footer class="t-foot"><button class="btn">Done</button><button class="btn-primary">{ic("printer")}Print closure slip</button></footer></section>')

hero = f'<div class="hero">{RAIL}{task("short", hero=True)}</div>'
frames = [('over',task('over')),('balanced',task('balanced', open_exp=True)),('first',task('first')),
          ('offline',task('offline')),('empty',task('empty')),('closed',closed())]
b = board('Variant 3: the close as one equation, counted minus expected equals the difference, with footnotes under each term. Each frame is the task at 62%.', frames, 'repeat(2,583px)', LABELS)
open(sys.argv[2],'w').write(page('Close register, equation', CSS, hero + b))
