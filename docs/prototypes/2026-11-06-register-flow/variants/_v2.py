import sys; sys.path.insert(0, sys.argv[1])
import _v1
from _v1 import *

# V2 · The figure leads: every money surface has ONE amount at 40 px (the theme's --text-amt, the
# repo's AmountFigure `hero`) and the checkout Keypad under it (56 px keys on the tablet, 48 on the
# phone); the ledger folds under "Expected"; the panel is one figure and a verb row; the closed moment
# leads with the variance over Counted and Expected; the Closures room opens with the repo's Stat strip.
# Round 1 (judge r0): the count keeps Other tenders and Change; Counted · Expected · Variance and the
# Closure paper are back; every chip is 44 px in rows; Closures rows carry Expected · Counted · Difference;
# the phone board draws every sub-state; `python3 -I _v2.py <dir> <out>` also writes v2/system.html.
# Ruled surfaces (Choose register, the cashier sheet) are V1's, unchanged.

I['bksp'] = '<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/>'
I['calendar'] = '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'

CSS = _v1.CSS + '''
.amtbig{font-size:var(--text-amt);line-height:1.1;font-weight:700;display:flex;align-items:baseline;gap:6px}
.amtbig .cur{font-size:22px;color:var(--muted-foreground);font-weight:400}
.amtbig.placeholder{color:var(--muted-foreground);font-weight:400}
/* Round 2: an EDITABLE amount keeps the FieldBox boundary (.field: --chip-border at --shape-ctl-border,
   --card, --radius-field; .open = the focus ring) with the 40 px numerals inside; a READ-ONLY figure
   (the panel's In the drawer, the variance, the stat strip) stays unframed. */
.field.hero{min-height:64px;padding:0 14px}
.field.hero .amtbig{padding:0}
.amtbig .caret{width:2px;height:36px;background:var(--ring);align-self:center;margin-left:2px}
.amtbig.placeholder .caret{margin:0 2px 0 0}
.amtline{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
/* Keypad (packages/components/src/keypad): key = bg-muted rounded-lg, text-xl semibold; rows gap-2 */
.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.key{height:56px;display:flex;align-items:center;justify-content:center;background:var(--muted);border-radius:var(--radius);font-size:20px;font-weight:600}
.key .i{width:22px;height:22px}
.verbs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.verbs .btn{height:56px;flex-direction:column;gap:2px;padding:0 8px}
.figlead{display:flex;flex-direction:column;gap:4px}
.figlead .k{color:var(--muted-foreground)}
.figlead .line{color:var(--muted-foreground)}.figlead .line b{color:var(--foreground);font-weight:var(--w-ui)}
.joined{border:1px solid var(--border);border-radius:var(--radius-tile);overflow:hidden}
.joined .fold{border:0;border-radius:0}
.joined .diff{border-radius:0}
.lblrow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:6px}
.lblrow .lbl{margin:0}
.count .pb{gap:6px;padding:8px 16px}
/* Round 3: the count's keypad keeps the component's 8 px gaps (the sheet's); 6 px was a SYSTEM BREAK */
.count .lblrow{align-items:center}.count .lblrow>*{white-space:nowrap}.count .lblrow .textbtn{min-height:36px;margin:-9px 0}
.diff.muted{background:var(--muted);color:var(--muted-foreground)}
.pf .why.warn{color:var(--warning-text)}
.pay .pb{gap:12px}
.count .pb>*{flex-shrink:0}
.count textarea.note{height:60px;min-height:60px;padding:10px 12px}
/* Corrective pass: cashier-facing metadata, labels and validation lines at --text-base (14 px), never 12 */
.pane .ph .sub,.pane .pf .why,.pane .xs,.card .xs,.cartbody .xs,.pane .lbl,.card .lbl,.pane .kv small,.card .kv small,
.pane .fig .k,.pane .notice .d,.scrollcue,.pane .fold summary small,.bar .place small,.pickrow .s{font-size:var(--text-base)}
.card .why{display:flex;align-items:center;gap:6px;color:var(--muted-foreground);font-size:var(--text-base)}
.pfrow{flex-direction:row!important}.pfrow .btn{flex:1}.pfrow .btn.primary{flex:1.4}
.vlead{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 0 4px;text-align:center}
.vlead .k{display:flex;align-items:center;gap:6px;font-weight:var(--w-ui)}
.vlead .v{font-size:var(--text-amt);font-weight:700;line-height:1.1}
.vlead .line{color:var(--muted-foreground)}.vlead .line b{color:var(--foreground);font-weight:var(--w-ui)}
/* Stat strip (packages/components/src/stat): label caption over text-lg semibold; border-b pb-3 */
.statstrip{display:flex;flex-wrap:wrap;gap:12px 24px;border-bottom:1px solid var(--border);padding-bottom:12px}
.statstrip .s .k{color:var(--muted-foreground);font-size:var(--text-xs);font-weight:var(--w-ui)}
.statstrip .s .v{font-size:18px;font-weight:600}
.statstrip .s.lead .v{font-size:24px;font-weight:700}
.tabsrow{display:flex;gap:4px;border-bottom:1px solid var(--border)}
.tabsrow span{min-height:44px;display:flex;align-items:center;padding:0 12px;color:var(--muted-foreground);font-weight:var(--w-ui);border-bottom:2px solid transparent}
.tabsrow span.on{color:var(--foreground);border-bottom-color:var(--primary)}
/* Reason and float chips: Chip at 44 px in explicit rows with 8 px gaps (round 1, finding 3) */
.rchips{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.rchips.two{grid-template-columns:1fr 1fr}
.rchips .chip{height:44px;justify-content:center;padding:0 10px}
/* The count at the tablet's full 800 px pane height */
.fwrap.tall{height:800px}
.splitrow{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--muted-foreground)}
.splitrow b{color:var(--foreground);font-weight:var(--w-ui)}
.splitrow .textbtn{min-height:36px;margin:-8px 0}
.splitrow .pair{white-space:nowrap}
.fold summary small{color:var(--muted-foreground);font-weight:400;font-size:var(--text-xs);margin-left:4px}
.scrollcue{font-size:var(--text-xs);color:var(--muted-foreground);display:flex;align-items:center;gap:6px}
/* The closed moment: the variance leads, Counted and Expected as two tiles, the paper folds open */
.wr .pb{gap:10px}
.wr .vlead{padding:4px 0 0}
.paper .bd{padding:2px 12px 8px}
.paper .kv{min-height:28px}
.paper .kv.tot{padding-top:4px;margin-top:2px}
/* Closures rows: Expected · Counted · Difference on every row, the result badge apart (finding 4) */
.chead,.crow{display:grid;grid-template-columns:1.7fr 1fr 1fr 1fr 1.25fr 20px;gap:10px;align-items:center;padding:0 12px}
.chead{color:var(--muted-foreground);font-size:var(--text-xs);font-weight:var(--w-ui);min-height:32px}
.crow{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-tile);min-height:56px}
.crow.on{border-color:var(--primary);background:var(--muted)}
.crow .who{display:flex;flex-direction:column;min-width:0}.crow .who small{color:var(--muted-foreground);font-size:var(--text-xs)}
.crow .r,.chead .r{text-align:right}
.crow .res,.chead span:nth-child(5){padding-left:10px}
.crow .csub{display:none}
.room .pane.doc .pb{gap:10px}
/* Round 3 (Paul, 2026-11-06, "as you recommend"): the count's keypad collapses once the amount is entered
   and reopens on tapping the amount; collapsed, the amount shows a tap hint under it */
.count .taphint{display:flex;align-items:center;gap:6px;color:var(--muted-foreground);font-size:var(--text-base);margin-top:6px}
/* Round 3: the Closures scope row is an explicit grid, never a clipped flex row */
.scope{display:grid;grid-template-columns:repeat(4,max-content);gap:8px}
@media (max-width:767px){
 .scope{grid-template-columns:1fr 1fr}
 .scope .chip{justify-content:space-between;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .key{height:48px}
 .count .pb{gap:8px}
 .cartbody .card{gap:8px;padding:14px}.cartcol .tabs{flex-shrink:0}
 .count .lblrow{flex-wrap:wrap;row-gap:4px}.count .lblrow>*{white-space:nowrap}
 .statstrip{gap:10px 18px}
 .rchips.two{grid-template-columns:1fr}
 .wr .pb{gap:8px}.paper .kv{min-height:26px}
 .chead{display:none}
 .crow{grid-template-columns:1fr auto;grid-template-areas:"who res" "sub sub";row-gap:4px;padding:8px 12px}
 .crow .who{grid-area:who}.crow .res{grid-area:res}.crow .c,.crow .chev{display:none}
 .crow .csub{display:block;grid-area:sub;font-size:var(--text-xs);color:var(--muted-foreground)}
 .crow .csub b{color:var(--foreground);font-weight:var(--w-ui)}
}
'''

def keypad():
    keys = [str(n) for n in range(1, 10)] + ['.', '0']
    return '<div class="keypad">' + ''.join(f'<div class="key">{k}</div>' for k in keys) + f'<div class="key" aria-label="Backspace">{ic("bksp")}</div></div>'

def amount(v, empty=False, caret=True, tone='', editable=True):
    """An editable amount is a FieldBox (`.field`, `.open` while focused) holding the 40 px numerals;
    editable=False is the read-only AmountFigure: no frame."""
    c = '<span class="caret"></span>' if caret else ''
    if empty:
        inner = f'<div class="amtbig placeholder"><span class="cur">$</span>{c}0.00</div>'
    else:
        inner = f'<div class="amtbig {tone}"><span class="cur">$</span>{v}{c}</div>'
    if not editable:
        return inner
    return f'<div class="field hero{" open" if caret else ""}">{inner}</div>'

def chips(sel, items, cls='rchips'):
    return f'<div class="{cls}">' + ''.join(f'<span class="chip{" on" if r == sel else ""}">{r}</span>' for r in items) + '</div>'

PAY_IN = ['Change', 'Float', 'Tips', 'Mistake', 'Other…']
PAY_OUT = ['Supplier', 'Petty cash', 'Bank', 'Change', 'Mistake', 'Other…']

# 2 · Open register: the float is the one amount; the keypad is under it
def open_card(first=False):
    if first:
        a = amount('', empty=True); ch = ''
        last = '<div class="xs muted">First open on this register · no float on record</div>'
        foot = f'<div class="pf" style="padding:0;border:0"><div class="why">{ic("info","i sm")}Enter the float</div><button class="btn lg block disabled">Open register</button></div>'
    else:
        a = amount(S['float_'])
        ch = chips(f'${S["float_"]} default float', [f'${S["float_"]} default float', f'${S["last_count"]} last count'], 'rchips two')
        last = f'<div class="kv"><span class="k">Last closure</span><span class="v">#41 · yesterday 17:52</span></div>'
        foot = '<button class="btn lg block primary">Open register</button>'
    return f'<div class="cartbody"><div class="card"><h3>Open register</h3><div><span class="lbl">Cash in the drawer</span>{a}</div>{ch}{keypad()}{last}{foot}</div></div>'

def other_tenders_fold():
    return (f'<details class="fold"><summary>{ic("orders")}<span class="grow">Other tenders<small>not counted</small></span><b>${S["other_total"]}</b>{ic("chev","i sm")}</summary>'
            f'<div class="bd"><div class="kv"><span class="k">Card <small>{S["card_n"]}</small></span><span class="v">${S["card"]}</span></div><div class="kv"><span class="k">Gift card <small>{S["gift_n"]}</small></span><span class="v">${S["gift"]}</span></div><div class="kv"><span class="k">Store credit <small>{S["credit_n"]}</small></span><span class="v">${S["credit"]}</span></div></div></details>')

# 4 · Register panel: one figure, a verb row, the ledger folded under Expected
def panel(offline=False, ledger_open=False):
    head = pane_head(S['reg'], f'{S["store"]} · open since {S["opened"]} · {S["age"]} · {S["cashier"]}', disc=f'<div class="disc ok">{ic("reg")}</div>')
    badge = f'<div class="sbadge"><span class="badge warn">{ic("cloudoff","i sm")}Offline · 3 sales to send</span></div>' if offline else ''
    lead = f'<div class="figlead"><span class="k">In the drawer</span>{amount(S["expected"], caret=False, editable=False)}<span class="line">Session sales <b>${S["session_sales"]}</b> · 87 sales</span></div>'
    verbs = f'<div class="verbs"><button class="btn outline">{ic("in")}Pay in</button><button class="btn outline">{ic("out")}Pay out</button><button class="btn outline">{ic("nosale")}No sale</button></div>'
    led = f'<details class="fold"{" open" if ledger_open else ""}><summary>{ic("coins")}<span class="grow">Expected</span><b>${S["expected"]}</b>{ic("chev","i sm")}</summary><div class="bd">{ledger()}</div></details>'
    last = f'<div class="row"><span class="lbl">Last closure #41 · yesterday 17:52</span><span class="badge ok">{ic("check","i sm")}over $1.80</span>{ic("chevr","i sm")}</div>'
    foot = f'<footer class="pf"><button class="btn lg block primary">Close register · it\'s past 17:30</button></footer>'
    return f'<section class="pane">{head}{badge}<div class="pb">{lead}{verbs}{led}{other_tenders()}{last}</div>{foot}</section>'

# 5 · Pay in
def pay_in(empty=False, noreason=False):
    head = pane_head('Pay in', f'{S["reg"]} · ${S["expected"]} in the drawer', back=True)
    if noreason:
        a = amount(S['paid_in'], caret=False); rs = chips(None, PAY_IN)
        foot = f'<footer class="pf"><div class="why">{ic("info","i sm")}Add a reason</div><button class="btn lg block disabled">Put ${S["paid_in"]} in</button></footer>'
    elif empty:
        a = amount('', empty=True); rs = chips(None, PAY_IN)
        foot = f'<footer class="pf"><div class="why">{ic("info","i sm")}Enter an amount</div><button class="btn lg block disabled">Put cash in</button></footer>'
    else:
        a = amount(S['paid_in']); rs = chips('Change', PAY_IN)
        foot = f'<footer class="pf"><button class="btn lg block primary">Put ${S["paid_in"]} in</button></footer>'
    return f'<section class="pane pay">{head}<div class="pb"><div class="q">How much is going into the drawer?</div>{a}{keypad()}<div><span class="lbl">Reason</span>{rs}</div></div>{foot}</section>'

# 6 · Pay out (+ approval: the keypad gives way to the manager's fields)
def pay_out(approval=False, offline=False, under=False):
    head = pane_head('Pay out', f'{S["reg"]} · ${S["expected"]} in the drawer', back=True)
    rs = chips('Supplier', PAY_OUT)
    body = f'<div class="q">How much is leaving the drawer?</div>'
    if under:
        body += amount('12.00') + keypad() + f'<div><span class="lbl">Reason</span>{chips("Petty cash", PAY_OUT)}</div>'
        foot = '<footer class="pf"><button class="btn lg block primary">Take $12.00 out</button></footer>'
        return f'<section class="pane pay">{head}<div class="pb">{body}</div>{foot}</section>'
    if not approval:
        body += amount(S['paid_out']) + keypad() + f'<div><span class="lbl">Reason</span>{rs}</div>'
        foot = (f'<footer class="pf"><div class="why warn">{ic("warn","i sm")}Over the ${S["limit"]} limit · a manager must approve</div>'
                f'<button class="btn lg block primary">Continue to approval</button></footer>')
        return f'<section class="pane pay">{head}<div class="pb">{body}</div>{foot}</section>'
    body += amount(S['paid_out'], caret=False) + f'<div><span class="lbl">Reason</span>{rs}</div>'
    body += f'<div class="notice warn">{ic("warn")}<div><b>Over the ${S["limit"]} limit · a manager must approve</b></div></div>'
    if offline:
        body += f'<div class="notice info">{ic("cloudoff")}<div><b>Approval needs a connection</b><div class="d">Take the cash out when you are back online, or ask a manager to approve on their device.</div></div></div>'
        foot = f'<footer class="pf"><div class="why">{ic("cloudoff","i sm")}Approval needs a connection</div><button class="btn lg block disabled">Take ${S["paid_out"]} out</button></footer>'
    else:
        body += (f'<div><span class="lbl">Manager approval</span><div class="field open" style="margin-bottom:8px">{ic("user","i sm")}<input value="" placeholder="WordPress username"></div>'
                 f'<div class="field">{ic("lock","i sm")}<span class="ph">Password</span></div></div>')
        foot = f'<footer class="pf"><div class="why">{ic("info","i sm")}Approval needed</div><button class="btn lg block primary">Approve &amp; take ${S["paid_out"]} out</button></footer>'
    return f'<section class="pane">{head}<div class="pb">{body}</div>{foot}</section>'

# 7 · Close register: the family sheet with the big amount and the keypad in place of the field.
# Nothing of the family is removed: Other tenders and "Leave in drawer · To bank · Change" stay.
# scrolled=True draws the same pane scrolled past the keypad (the phone's second frame).
COUNT_STATES = {
    # state: counted, band tone, band icon, band word, difference, to bank, note rule, note text
    'short': (S['counted'], 'bad', 'down', 'Short', f'−${S["short"]}', S['bank'], ('tone-bad', 'Required: drawer is short'), S['note']),
    'over': ('522.55', 'ok', 'up', 'Over', '+$3.20', '372.55', ('tone-bad', 'Required: drawer is over'), ''),
    'exact': (S['expected'], 'muted', 'check', 'Exact', '$0.00', '369.35', ('muted', 'Optional'), ''),
}

def count(scrolled=False, state='short', typing=False):
    """typing=True: the keypad is open and the amount is being entered (the caret). Otherwise
    the amount is entered, the keypad is collapsed, and tapping the amount reopens it (round 3, Paul's
    ruling 2026-11-06)."""
    counted, tone, icon, word, diff, bank, (rule_tone, rule), text = COUNT_STATES[state]
    head = pane_head(f'Close {S["reg"]}', f'{S["cashier"]} · {S["opened"]} to {S["now"]}', back=True)
    if typing:
        a = (f'<div><div class="lblrow"><span class="lbl">Cash counted, float included</span><span class="textbtn">{ic("coins","i sm")}Count by notes and coins</span></div>'
             f'{amount(counted)}</div>')
    else:
        a = (f'<div><div class="lblrow"><span class="lbl">Cash counted, float included</span><span class="textbtn">{ic("coins","i sm")}Count by notes and coins</span></div>'
             f'{amount(counted, caret=False)}<div class="taphint">{ic("pencil","i sm")}Tap the amount to change it</div></div>')
    joined = (f'<div class="joined"><details class="fold"><summary><span class="grow">Expected</span><b>${S["expected"]}</b>{ic("chev","i sm")}</summary><div class="bd">{ledger()}</div></details>'
              f'<div class="diff {tone}"><span class="l">{ic(icon)}{word}</span><span>{diff}</span></div></div>')
    ph = {'over': 'Why is the drawer over?', 'exact': 'Add a note', 'short': ''}[state]
    note = (f'<div><div class="lblrow"><span class="lbl">Note</span><span class="xs {rule_tone}">{rule}</span></div>'
            f'<textarea class="note" rows="3" placeholder="{ph}">{text}</textarea></div>')
    split = f'<div class="splitrow"><span><span class="pair">Leave in drawer <b>${S["keep"]}</b></span> · <span class="pair">To bank <b>${bank}</b></span></span><span class="textbtn">{ic("pencil","i sm")}Change</span></div>'
    if state == 'over':
        foot = (f'<footer class="pf"><div class="why">{ic("info","i sm")}Add a note: the drawer is over</div><div class="pfrow" style="display:flex;gap:8px">'
                f'<button class="btn lg disabled" style="flex:1">Close register</button><button class="btn lg disabled" style="flex:1.4">{ic("printer")}Close &amp; print</button></div></footer>')
    else:
        foot = f'<footer class="pf pfrow"><button class="btn lg outline" style="box-shadow:none">Close register</button><button class="btn lg primary">{ic("printer")}Close &amp; print</button></footer>'
    if scrolled:
        top = f'<div class="scrollcue">{ic("up","i sm")}Counted ${counted} · keypad above</div>'
    else:
        top = a + (keypad() if typing else '')
    return f'<section class="pane count">{head}<div class="pb">{top}{joined}{note}{split}{other_tenders_fold()}</div>{foot}</section>'

def paper(open_=True):
    rows = (ledger() + f'<div class="kv"><span class="k">To bank</span><span class="v">${S["bank"]}</span></div>'
            f'<div class="kv"><span class="k">Other tenders <small>not counted</small></span><span class="v">${S["other_total"]}</span></div>')
    return f'<details class="fold paper"{" open" if open_ else ""}><summary><span class="grow">Closure paper</span>{ic("chev","i sm")}</summary><div class="bd">{rows}</div></details>'

def verdict():
    return (f'<div class="vlead"><span class="k tone-bad">{ic("down","i sm")}Variance · Short</span><span class="v tone-bad">−${S["short"]}</span></div>'
            f'<div class="figs"><div class="fig"><div class="k">Counted</div><div class="v">${S["counted"]}</div></div>'
            f'<div class="fig"><div class="k">Expected</div><div class="v">${S["expected"]}</div></div></div>')

def note_kv():
    return f'<div class="kv"><span class="k">Note</span><span class="v" style="font-weight:400;text-align:right;max-width:66%">{S["note"]}</span></div>'

# 8 · Closure written: the variance leads, Counted · Expected beside it, the paper beneath
def written(unsynced=False):
    head = pane_head(f'Closure {S["closure"]} written', f'{S["reg"]} · {S["opened"]}–{S["now"]} · {S["cashier"]}', disc=f'<div class="disc ok">{ic("check")}</div>')
    badge = f'<div class="sbadge"><span class="badge warn">{ic("cloudoff","i sm")}Unsynced · 3 rows not yet on the store</span></div>' if unsynced else ''
    saved = '' if unsynced else '<div class="xs muted">Saved to Reports › Closures at 17:43</div>'
    foot = f'<footer class="pf pfrow"><button class="btn lg outline" style="box-shadow:none">Done</button><button class="btn lg primary">{ic("printer")}Print closure</button></footer>'
    return f'<section class="pane wr">{head}{badge}<div class="pb">{verdict()}{note_kv()}{paper(open_=not unsynced)}{saved}</div>{foot}</section>'

CLOSURE_ROWS = [
    ('Today · 6 Nov', [
        (S['other'], f'Open · 08:55 → · Tom R.', '$402.10', '—', '—', '', ('info', f'Open since 08:55', None), False),
        (f'Closure {S["closure"]}', f'{S["reg"]} · {S["opened"]}–{S["now"]} · {S["cashier"]}', f'${S["expected"]}', f'${S["counted"]}', f'−${S["short"]}', 'tone-bad', ('bad', 'Short', 'down'), True),
    ]),
    ('Yesterday · 5 Nov', [
        ('Closure 41', f'{S["reg"]} · 09:00–17:52 · {S["cashier"]}', '$448.20', '$448.20', '$0.00', '', ('muted', 'Exact', None), False),
        ('Closure 40', f'{S["other"]} · 08:50–18:05 · Tom R.', '$611.00', '$612.80', '+$1.80', 'tone-ok', ('ok', 'Over', 'up'), False),
    ]),
]

# 9 · Reports › Closures: the Stat strip over the list; the document leads with the variance too
def closures_list():
    strip = (f'<div class="statstrip"><div class="s lead"><div class="k">Net difference</div><div class="v tone-bad">−$13.20</div></div>'
             f'<div class="s"><div class="k">Closures</div><div class="v">3</div></div>'
             f'<div class="s"><div class="k">Short</div><div class="v">1</div></div>'
             f'<div class="s"><div class="k">Over</div><div class="v">1</div></div>'
             f'<div class="s"><div class="k">Open now</div><div class="v">1</div></div></div>'
             f'<div class="tabsrow"><span class="on">All</span><span>Open</span><span>Closed</span></div>')
    head = '<div class="chead"><span>Closure</span><span class="r">Expected</span><span class="r">Counted</span><span class="r">Difference</span><span>Result</span><span></span></div>'
    rows = ''
    for day, items in CLOSURE_ROWS:
        rows += f'<div class="day">{day}</div>'
        for name, sub, exp, cnt, diff, dt, (tone, word, icon), on in items:
            b = f'<span class="badge {tone}">{ic(icon, "i sm") if icon else ""}{word}</span>'
            csub = f'Expected <b>{exp}</b> · Counted <b>{cnt}</b> · Difference <b class="{dt}">{diff}</b>'
            rows += (f'<div class="crow{" on" if on else ""}"><div class="who"><span class="strong">{name}</span><small>{sub}</small></div>'
                     f'<span class="c r">{exp}</span><span class="c r">{cnt}</span><span class="c r {dt}">{diff}</span><span class="res">{b}</span>'
                     f'<span class="chev">{ic("chevr","i sm")}</span><div class="csub">{csub}</div></div>')
    scope = f'<div class="scope"><span class="chip">{S["store"]} {ic("chev","i sm")}</span><span class="chip">All registers {ic("chev","i sm")}</span><span class="chip">All cashiers {ic("chev","i sm")}</span><span class="chip">{ic("calendar","i sm")}31 Oct – 6 Nov {ic("chev","i sm")}</span></div>'
    return f'<div class="list"><h1>Closures</h1>{scope}{strip}{head}{rows}</div>'

def closure_doc(back=False):
    head = pane_head(f'Closure {S["closure"]}', f'{S["reg"]} · {S["opened"]}–{S["now"]} · {S["cashier"]}', back=back, disc=f'<div class="disc bad">{ic("down")}</div>', close=False)
    foot = f'<footer class="pf pfrow"><button class="btn outline">Recount</button><button class="btn primary">{ic("printer")}Reprint copy</button></footer>'
    return f'<section class="pane doc wr">{head}<div class="pb">{verdict()}{note_kv()}{paper()}<div class="xs muted">Printed at 17:43 · closed on this device</div></div>{foot}</section>'

def closures_room():
    return f'<div class="stage">{rail("reports")}<div class="room">{closures_list()}{closure_doc()}</div></div>'

def build():
    hero = stage('<div class="empty">No items in the cart</div>', panel(), scrim=True)
    steps = [
        ('1 · Choose register', 'device unbound, two registers (ruled 2P·A)', cartcol(picker(), 'none')),
        ('2 · Open register', 'default float prefilled, last count one tap away', cartcol(open_card(), 'closed')),
        ('2b · First-ever open', 'no float on record, Open disabled with its reason', cartcol(open_card(first=True), 'closed')),
        ('3 · Cashier sheet', 'the avatar; the drawer card is the one door', cashier_sheet()),
        ('4 · Register panel, offline', 'one badge at the top of the pane', panel(offline=True)),
        ('4b · Register panel, Expected open', 'the ledger unfolded under the figure', panel(ledger_open=True)),
        ('5 · Pay in', '$20.00 · Change', pay_in()),
        ('5b · Pay in, nothing typed', 'the button says why', pay_in(empty=True)),
        ('5c · Pay in, no reason', 'amount typed; "Add a reason" beside the button', pay_in(noreason=True)),
        ('6 · Pay out', '$45.00 · Supplier, over the $40.00 limit', pay_out()),
        ('6a · Pay out under the limit', '$12.00 · Petty cash, no approval', pay_out(under=True)),
        ('6b · Pay out over the limit', 'a manager approves in place', pay_out(approval=True)),
        ('6c · Over the limit, offline', 'approval needs a connection', pay_out(approval=True, offline=True)),
        ('7 · Close register, counting', 'keypad open while the amount is entered; full 800 px pane', count(typing=True), 'fwrap tall'),
        ('7a · Close register', 'amount entered, keypad collapsed; short $15.00, note required', count(), 'fwrap tall'),
        ('7b · Close register, over', 'counted $522.55 · +$3.20, note required', count(state='over'), 'fwrap tall'),
        ('7c · Close register, exact', 'counted $519.35, note optional, one tap', count(state='exact'), 'fwrap tall'),
        ('8 · Closure written', 'the variance leads; the paper open', written()),
        ('8b · Closure written, unsynced', 'the badge says what waits', written(unsynced=True)),
    ]
    frames = ''.join(frame(st[0], st[1], st[2], *st[3:]) for st in steps)
    desk = (f'<div class="desk"><div class="board"><h2>V2 · The figure leads</h2><p class="lead">One amount at 40 px leads every money surface, with the checkout keypad under it; the ledger folds under Expected.</p>{hero}</div>'
            f'<div class="board"><h2>The flow</h2><p class="lead">Each frame is the pane or the cart column at full size.</p><div class="frames">{frames}</div></div>'
            f'<div class="board"><h2>9 · Reports › Closures</h2><p class="lead">The owner\'s ledger: the week\'s net difference first, then newest first with Expected · Counted · Difference on every row, the document in the pane.</p>{closures_room()}</div></div>')
    psteps = [
        ('1 · Choose register', 'phone', cartcol(picker(), 'none', tabs=True)),
        ('2 · Open register', 'phone', cartcol(open_card(), 'closed', tabs=True)),
        ('2b · First-ever open', 'Open disabled with its reason', cartcol(open_card(first=True), 'closed', tabs=True)),
        ('3 · Cashier sheet', 'full width', cashier_sheet()),
        ('4 · Register panel', 'full width', panel()),
        ('4b · Register panel, Expected open', 'the ledger unfolded', panel(ledger_open=True)),
        ('5 · Pay in', '$20.00 · Change', pay_in()),
        ('5b · Pay in, nothing typed', 'the button says why', pay_in(empty=True)),
        ('5c · Pay in, no reason', '"Add a reason" beside the button', pay_in(noreason=True)),
        ('6 · Pay out', '$45.00 · over the limit, approval next', pay_out()),
        ('6b · Pay out over the limit', 'a manager approves in place', pay_out(approval=True)),
        ('6c · Over the limit, offline', 'approval needs a connection', pay_out(approval=True, offline=True)),
        ('7 · Close register, counting', 'keypad open while the amount is entered', count(typing=True)),
        ('7a · Close register', 'entered: keypad collapsed, the split line on the first screen', count()),
        ('7b · Close register, over', '+$3.20, note required', count(state='over')),
        ('7c · Close register, exact', 'note optional, one tap', count(state='exact')),
        ('8 · Closure written', 'the paper open', written()),
        ('8b · Closure written, unsynced', 'the badge says what waits', written(unsynced=True)),
    ]
    room_phone = f'<div class="cartcol" style="overflow:hidden">{closures_list()}</div>'
    phone = ('<div class="phone-board">' + ''.join(pframe(l, h, inner) for l, h, inner in psteps)
             + pframe('9 · Closures', 'every row: Expected · Counted · Difference', room_phone)
             + pframe('9b · Closure 42', 'the document as a full-width pane', closure_doc(back=True)) + '</div>')
    write(sys.argv, 'Register flow · V2 The figure leads', CSS, desk + phone)
    system_sheet(os.path.join(sys.argv[1], 'v2', 'system.html'))

# The system sheet: the same tokens and class strings as the page, every sibling in its resting state,
# one row for light and one for dark (each row re-scopes its theme's block of tokens.css).
def theme_block(name):
    start = TOKENS.index(f'html[data-theme="{name}"]')
    body = TOKENS[TOKENS.index('{', start) + 1:]
    return body[:body.index('\n}')]

SYS_CSS = '''
body{padding:8px 12px}
.sys{display:flex;flex-direction:column;gap:8px;max-width:1256px;margin:0 auto}
.th{background:var(--background);color:var(--foreground);border:1px solid var(--border);border-radius:12px;padding:10px 14px}
.th h2{font-size:14px;font-weight:var(--w-strong);margin-bottom:4px}
.cells{display:grid;grid-template-columns:repeat(6,1fr);gap:8px 14px;align-items:start}
.cell{display:flex;flex-direction:column;gap:6px;min-width:0}
.cell.w2{grid-column:span 2}
.cap{font-size:12px;color:var(--muted-foreground)}
.surface{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:8px}
.cell .keypad{grid-template-columns:repeat(3,1fr)}
.cell .key{height:44px}
.sw{width:34px;height:20px;border-radius:999px;background:var(--border);position:relative;flex:none}
.sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:999px;background:var(--card)}
.sw.on{background:var(--primary)}.sw.on::after{left:16px}
.hstack{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.cell .amtbig{font-size:var(--text-amt)}
@media (max-width:767px){.cells{grid-template-columns:1fr 1fr}.cell.w2{grid-column:span 2}main{max-width:none}}
'''

def system_row(name, label):
    cells = [
        ('FieldBox · amount (V1)', f'<div class="field bigfield"><span class="cur">$</span><input value="{S["float_"]}"></div>', ''),
        ('AmountFigure in FieldBox · editable (as Pay in and the count)', amount(S['float_']), 'w2'),
        ('AmountFigure · display, read-only', amount(S['expected'], caret=False, editable=False), ''),
        ('Button lg · outline (the count)', '<button class="btn lg outline" style="box-shadow:none">Close register</button>', ''),
        ('Button lg · primary (the flow)', '<button class="btn lg block primary">Open register</button>', ''),
        ('Button · primary, default 44', '<button class="btn primary">Open register</button>', ''),
        ('Chip · rest · selected (44)', '<div class="hstack"><span class="chip" style="height:44px">Float</span><span class="chip on" style="height:44px">Change</span></div>', ''),
        ('Switch · off · on', '<div class="hstack" style="min-height:44px"><span class="sw"></span><span class="sw on"></span></div>', ''),
        ('Tabs', '<div class="tabsrow"><span class="on">All</span><span>Open</span><span>Closed</span></div>', 'w2'),
        ('Card / Tile', f'<div class="fig"><div class="k">Counted</div><div class="v">${S["counted"]}</div></div>', ''),
        ('Divider', '<div style="min-height:44px;display:flex;align-items:center"><div class="hr" style="width:100%"></div></div>', ''),
        ('MenuRow', f'<div class="surface" style="padding:0 4px"><div class="row"><span class="slot">{ic("check","i sm")}</span><span class="lbl" style="font-size:14px;color:var(--foreground);margin:0">Supplier</span></div></div>', ''),
        ('Badge · ok bad warn info muted', '<div class="hstack"><span class="badge ok">Over</span><span class="badge bad">Short</span><span class="badge warn">Unsynced</span><span class="badge info">Open</span><span class="badge muted">Exact</span></div>', 'w2'),
        ('Keypad keys', f'<div class="keypad"><div class="key">7</div><div class="key">8</div><div class="key">9</div><div class="key">.</div><div class="key">0</div><div class="key">{ic("bksp")}</div></div>', 'w2'),
    ]
    out = ''.join(f'<div class="cell {w}"><span class="cap">{c}</span>{html}</div>' for c, html, w in cells)
    return f'<section class="th th-{name}"><h2>{label}</h2><div class="cells">{out}</div></section>'

def system_sheet(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scoped = ''.join(f'.th-{n}{{{theme_block(n)}\n}}\n' for n in ('light', 'dark'))
    body = f'<div class="sys">{system_row("light", "Light")}{system_row("dark", "Dark")}</div>'
    open(path, 'w').write(page('Register flow · V2 system sheet', CSS + scoped + SYS_CSS, body))

if __name__ == '__main__':
    build()
