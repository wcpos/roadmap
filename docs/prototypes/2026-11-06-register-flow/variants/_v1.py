import sys; sys.path.insert(0, sys.argv[1])
from _common import *

# V1 · Tiles and ledger: the 2026-10-28 map drawn literally. The panel is figure tiles, three money
# tiles and the ledger; every money task is a pane pushed inside the panel with ‹ back; the count is the
# 2026-11-05 family sheet; the Closures room is a list with the document in a right pane.

CSS = '''
.figs{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fig{padding:12px;border:1px solid var(--border);border-radius:var(--radius-tile);background:var(--card)}
.fig .k{color:var(--muted-foreground);font-size:var(--text-xs)}.fig .v{font-size:22px;font-weight:var(--w-strong);margin-top:2px}
.money{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.money .tile{min-height:72px}
.door{border:1px solid var(--border);border-radius:var(--radius-tile);background:var(--card);padding:12px;display:flex;flex-direction:column;gap:8px}
.door .top{display:flex;align-items:center;gap:10px}
.door .verb{color:var(--primary);font-weight:var(--w-ui);padding-top:8px;border-top:1px solid var(--border);display:flex;align-items:center;gap:4px}
.band{font-size:var(--text-xs);color:var(--muted-foreground);font-weight:var(--w-ui);text-transform:none;margin:6px 0 2px}
.pickrow{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-tile);background:var(--card)}
.pickrow .dot{width:10px;height:10px;border-radius:999px;flex:none}
.dot.ok{background:var(--ok)}.dot.muted{background:var(--neutral)}.dot.warn{background:var(--warning)}
.pickrow .n{font-weight:var(--w-ui)}.pickrow .s{color:var(--muted-foreground);font-size:var(--text-xs)}
.card{border:1px solid var(--border);border-radius:var(--radius-tile);background:var(--card);padding:16px;display:flex;flex-direction:column;gap:12px}
.card h3{font-size:17px;font-weight:var(--w-strong)}
.lbl{font-size:var(--text-xs);color:var(--muted-foreground);font-weight:var(--w-ui);margin-bottom:6px;display:block}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.bigfield{min-height:56px;font-size:22px;font-weight:var(--w-strong)}
.bigfield .cur{font-size:18px;font-weight:400}
.q{font-size:17px;font-weight:var(--w-strong)}
.fold{border:1px solid var(--border);border-radius:var(--radius-tile);overflow:hidden}
.fold summary{list-style:none;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;font-weight:var(--w-ui);cursor:default}
.fold summary .grow{flex:1}.fold summary::-webkit-details-marker{display:none}
.fold .bd{padding:4px 12px 10px;border-top:1px solid var(--border)}
.diff{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:0 12px;border-radius:var(--radius-tile);font-weight:var(--w-strong);font-size:17px}
.diff.bad{background:var(--bad-bg);color:var(--bad)}.diff.ok{background:var(--ok-bg);color:var(--ok)}.diff.warn{background:var(--warning-bg);color:var(--warning-text)}
.diff .l{display:flex;align-items:center;gap:8px}
textarea.note{width:100%;min-height:64px;border:var(--shape-ctl-border) solid var(--chip-border);background:var(--card);border-radius:var(--radius-field);padding:10px 12px;font:inherit;color:inherit;resize:none}
.split{display:flex;justify-content:space-between;gap:8px;color:var(--muted-foreground)}.split b{color:var(--foreground);font-weight:var(--w-ui)}.split .pair{white-space:nowrap}
.tiles3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.tiles3 .fig .v{font-size:18px}
.done{display:flex;align-items:center;gap:12px}
.done h2{font-size:17px;font-weight:var(--w-strong)}.done p{color:var(--muted-foreground);font-size:var(--text-xs)}
.textbtn{display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-weight:var(--w-ui);min-height:36px}
/* Closures room */
.room{flex:1;display:grid;grid-template-columns:1fr 420px;min-width:0}
.list{padding:16px 20px;display:flex;flex-direction:column;gap:10px;min-width:0}
.list h1{font-size:20px;font-weight:var(--w-strong)}
.scope{display:flex;gap:8px}
.thead,.trow{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr 1fr;gap:12px;align-items:center;padding:0 12px;min-height:44px}
.thead{color:var(--muted-foreground);font-size:var(--text-xs);font-weight:var(--w-ui);min-height:32px}
.trow{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-tile);min-height:56px}
.trow.on{border-color:var(--primary);background:var(--muted)}
.trow .who{display:flex;flex-direction:column}.trow .who small{color:var(--muted-foreground);font-size:var(--text-xs)}
.trow .r{text-align:right}
.day{color:var(--muted-foreground);font-size:var(--text-xs);font-weight:var(--w-ui);margin-top:6px}
.room .pane{position:relative;inset:auto;width:auto;height:100%}
@media (max-width:767px){.room{display:block}.list{padding:12px}.thead{display:none}.trow{grid-template-columns:1fr auto;}.trow .r.hide{display:none}}
'''

def pane_head(title, sub, back=False, close=True, disc=None):
    b = f'<div class="ibtn" aria-label="Back">{ic("chevl")}</div>' if back else ''
    d = disc or ''
    c = f'<div class="ibtn" aria-label="Close">{ic("x")}</div>' if close else ''
    return f'<header class="ph">{b}{d}<div class="grow"><h1>{title}</h1><div class="sub">{sub}</div></div>{c}</header>'

# 1 · Choose register (ruled 2P·A)
def picker():
    rows = (f'<div class="pickrow"><span class="dot ok"></span><div><div class="n">{S["other"]}</div><div class="s">Open since 08:55 · Tom R.</div></div></div>'
            f'<div class="pickrow"><span class="dot muted"></span><div><div class="n">{S["reg"]}</div><div class="s">Closed · last closure #41, yesterday</div></div></div>')
    return f'<div class="cartbody"><div class="q">Which register is this device at?</div>{rows}<div class="xs muted">Change it later from your avatar · Switch register.</div></div>'

# 2 · Open register card
def open_card(first=False):
    if first:
        field = f'<div class="field bigfield open"><span class="cur">$</span><input value="" placeholder="0.00"></div>'
        chips = ''
        last = '<div class="xs muted">First open on this register · no float on record</div>'
        foot = f'<div class="pf" style="padding:0;border:0"><div class="why" style="justify-content:flex-start">{ic("info","i sm")}Enter the float</div><button class="btn lg block disabled">Open register</button></div>'
    else:
        field = f'<div class="field bigfield"><span class="cur">$</span><input value="{S["float_"]}"></div>'
        chips = f'<div class="chips"><span class="chip on">${S["float_"]} default float</span><span class="chip">${S["last_count"]} last count</span></div>'
        last = f'<div class="kv"><span class="k">Last closure</span><span class="v">#41 · yesterday 17:52</span></div>'
        foot = '<button class="btn lg block primary">Open register</button>'
    return f'<div class="cartbody"><div class="card"><h3>Open register</h3><div><span class="lbl">Cash in the drawer</span>{field}</div>{chips}{last}{foot}</div></div>'

# 3 · Cashier sheet (ruled frame D)
def cashier_sheet():
    head = f'<header class="ph"><div class="av">{S["initials"]}</div><div class="grow"><h1>{S["cashier"]}</h1><div class="sub">{S["store"]} · {S["reg"]} · since {S["opened"]}</div></div><div class="ibtn">{ic("x")}</div></header>'
    sales = f'<div class="kv"><span class="k">Your sales today</span><span class="v">${S["session_sales"]}</span></div>'
    door = (f'<div class="door"><div class="top"><div class="disc">{ic("drawer")}</div><div style="flex:1"><div class="strong">In the drawer</div><div class="xs muted">{S["reg"]} · opened {S["opened"]} by ({S["initials"]})</div></div><div class="strong" style="font-size:17px">${S["expected"]}</div></div>'
            f'<div class="verb">Pay in · Pay out · Close register {ic("chevr","i sm")}</div></div>')
    hand = (f'<div class="band">Hand the till to</div>'
            f'<div class="row"><div class="av" style="width:28px;height:28px">TR</div><span class="lbl">Tom R.</span><span class="v xs">2 open carts</span></div>'
            f'<div class="row"><span class="slot">{ic("plus","i sm")}</span><span class="lbl">Another account…</span></div>')
    props = (f'<div class="kv"><span class="k">Store</span><span class="v">{S["store"]} <span class="textbtn" style="margin-left:8px">Switch</span></span></div>'
             f'<div class="kv"><span class="k">Register</span><span class="v">{S["reg"]} <span class="muted xs">· {S["other"]} open</span> <span class="textbtn" style="margin-left:8px">Switch</span></span></div>')
    links = '<div class="xs muted" style="text-align:center">↗ WordPress Admin · ↗ Desktop App</div>'
    foot = '<footer class="pf" style="flex-direction:row;justify-content:space-between"><button class="btn ghost" style="color:var(--destructive)">Sign out</button><button class="btn outline">Close</button></footer>'
    return f'<section class="pane">{head}<div class="pb">{sales}{door}{hand}<div class="hr"></div>{props}<div style="flex:1"></div>{links}</div>{foot}</section>'

def ledger(first=False):
    fl = '<span class="v tone-muted">Not recorded</span>' if first else f'<span class="v">${S["float_"]}</span>'
    return (f'<div class="kv"><span class="k">Float</span>{fl}</div>'
            f'<div class="kv"><span class="k">Cash sales <small>{S["cash_sales_n"]} sales</small></span><span class="v">+${S["cash_sales"]}</span></div>'
            f'<div class="kv"><span class="k">Cash refunds <small>1</small></span><span class="v">−${S["refunds"]}</span></div>'
            f'<div class="kv"><span class="k">Paid in <small>Change · 09:40</small></span><span class="v">+${S["paid_in"]}</span></div>'
            f'<div class="kv"><span class="k">Paid out <small>Supplier · 14:10</small></span><span class="v">−${S["paid_out"]}</span></div>'
            f'<div class="kv tot"><span class="k">Expected in the drawer</span><span class="v">${S["expected"]}</span></div>')

def other_tenders():
    return (f'<details class="fold"><summary>{ic("orders")}<span class="grow">Other tenders</span><b>${S["other_total"]}</b>{ic("chev","i sm")}</summary>'
            f'<div class="bd"><div class="kv"><span class="k">Card <small>{S["card_n"]}</small></span><span class="v">${S["card"]}</span></div><div class="kv"><span class="k">Gift card <small>{S["gift_n"]}</small></span><span class="v">${S["gift"]}</span></div><div class="kv"><span class="k">Store credit <small>{S["credit_n"]}</small></span><span class="v">${S["credit"]}</span></div></div></details>')

# 4 · Register panel
def panel(offline=False):
    head = pane_head(S['reg'], f'{S["store"]} · open since {S["opened"]} · {S["age"]} · {S["cashier"]}', disc=f'<div class="disc ok">{ic("reg")}</div>')
    badge = f'<div class="sbadge"><span class="badge warn">{ic("cloudoff","i sm")}Offline · 3 sales to send</span></div>' if offline else ''
    figs = f'<div class="figs"><div class="fig"><div class="k">In the drawer</div><div class="v">${S["expected"]}</div></div><div class="fig"><div class="k">Session sales</div><div class="v">${S["session_sales"]}</div></div></div>'
    money = f'<div class="money"><div class="tile">{ic("in")}<span class="t">Pay in</span></div><div class="tile">{ic("out")}<span class="t">Pay out</span></div><div class="tile">{ic("nosale")}<span class="t">No sale</span></div></div>'
    led = f'<details class="fold" open><summary>{ic("coins")}<span class="grow">Expected in the drawer</span><b>${S["expected"]}</b>{ic("chev","i sm")}</summary><div class="bd">{ledger()}</div></details>'
    last = f'<div class="row"><span class="lbl">Last closure #41 · yesterday 17:52</span><span class="badge ok">{ic("check","i sm")}over $1.80</span>{ic("chevr","i sm")}</div>'
    foot = f'<footer class="pf"><button class="btn lg block primary">Close register · it\'s past 17:30</button></footer>'
    return f'<section class="pane">{head}{badge}<div class="pb">{figs}{money}{led}{other_tenders()}{last}</div>{foot}</section>'

def reasons(sel, items):
    return '<div class="chips">'+''.join(f'<span class="chip{" on" if r==sel else ""}">{r}</span>' for r in items)+'</div>'

# 5 · Pay in
def pay_in(empty=False):
    head = pane_head('Pay in', f'{S["reg"]} · ${S["expected"]} in the drawer', back=True)
    if empty:
        field = '<div class="field bigfield open"><span class="cur">$</span><span class="ph">0.00</span></div>'
        rs = reasons(None, ['Change','Float','Tips','Mistake','Other…'])
        foot = f'<footer class="pf"><div class="why">{ic("info","i sm")}Enter an amount</div><button class="btn lg block disabled">Put cash in</button></footer>'
    else:
        field = f'<div class="field bigfield"><span class="cur">$</span><input value="{S["paid_in"]}"></div>'
        rs = reasons('Change', ['Change','Float','Tips','Mistake','Other…'])
        foot = f'<footer class="pf"><button class="btn lg block primary">Put ${S["paid_in"]} in</button></footer>'
    return f'<section class="pane">{head}<div class="pb"><div class="q">How much is going into the drawer?</div>{field}<div><span class="lbl">Reason</span>{rs}</div><div class="kv"><span class="k">In the drawer after</span><span class="v">$539.35</span></div></div>{foot}</section>'

# 6 · Pay out (+ approval)
def pay_out(approval=False, offline=False):
    head = pane_head('Pay out', f'{S["reg"]} · ${S["expected"]} in the drawer', back=True)
    field = f'<div class="field bigfield"><span class="cur">$</span><input value="{S["paid_out"]}"></div>'
    rs = reasons('Supplier', ['Supplier','Petty cash','Bank','Change','Mistake','Other…'])
    body = f'<div class="q">How much is leaving the drawer?</div>{field}<div><span class="lbl">Reason</span>{rs}</div>'
    if approval:
        n = f'<div class="notice warn">{ic("warn")}<div><b>Over the ${S["limit"]} limit · a manager must approve</b></div></div>'
        if offline:
            appr = f'<div class="notice info">{ic("cloudoff")}<div><b>Approval needs a connection</b><div class="d">Take the cash out when you are back online, or ask a manager to approve on their device.</div></div></div>'
            foot = f'<footer class="pf"><button class="btn lg block disabled">Take ${S["paid_out"]} out</button></footer>'
        else:
            appr = (f'<div><span class="lbl">Manager approval</span><div class="field" style="margin-bottom:8px">{ic("user","i sm")}<input value="" placeholder="WordPress username"></div>'
                    f'<div class="field">{ic("lock","i sm")}<span class="ph">Password</span></div></div>')
            foot = f'<footer class="pf"><div class="why">{ic("info","i sm")}Approval needed</div><button class="btn lg block primary">Approve &amp; take ${S["paid_out"]} out</button></footer>'
        body += n + appr
    else:
        body += f'<div class="kv"><span class="k">In the drawer after</span><span class="v">$474.35</span></div>'
        foot = f'<footer class="pf"><button class="btn lg block primary">Take ${S["paid_out"]} out</button></footer>'
    return f'<section class="pane">{head}<div class="pb">{body}</div>{foot}</section>'

# 7 · Close register (the family sheet)
def count():
    head = pane_head(f'Close {S["reg"]}', f'{S["cashier"]} · {S["opened"]} to {S["now"]}', back=True)
    field = f'<div><span class="lbl">Cash counted, float included</span><div class="field bigfield open"><span class="cur">$</span><input value="{S["counted"]}"></div><div class="textbtn" style="margin-top:6px">{ic("coins","i sm")}Count by notes and coins</div></div>'
    exp = f'<details class="fold"><summary><span class="grow">Expected</span><b>${S["expected"]}</b>{ic("chev","i sm")}</summary><div class="bd">{ledger()}</div></details>'
    diff = f'<div class="diff bad"><span class="l">{ic("down")}Short</span><span>−${S["short"]}</span></div>'
    note = f'<div><span class="lbl">Note <span class="tone-bad">· Required: drawer is short</span></span><textarea class="note">{S["note"]}</textarea></div>'
    split = f'<div class="split"><span class="pair">Leave in drawer <b>${S["keep"]}</b></span><span class="pair">To bank <b>${S["bank"]}</b></span></div>'
    foot = f'<footer class="pf"><button class="btn lg block primary">Close &amp; print</button><button class="btn ghost block">Close without printing</button></footer>'
    return f'<section class="pane">{head}<div class="pb">{field}{exp}{diff}{note}{split}{other_tenders()}</div>{foot}</section>'

# 8 · Closure written
def written(unsynced=False):
    head = pane_head(f'Closure {S["closure"]} written', f'{S["reg"]} · {S["opened"]}–{S["now"]} · {S["cashier"]}', disc=f'<div class="disc ok">{ic("check")}</div>')
    badge = f'<div class="sbadge"><span class="badge warn">{ic("cloudoff","i sm")}Unsynced · 3 rows not yet on the store</span></div>' if unsynced else ''
    tiles = (f'<div class="tiles3"><div class="fig"><div class="k">Counted</div><div class="v">${S["counted"]}</div></div>'
             f'<div class="fig"><div class="k">Expected</div><div class="v">${S["expected"]}</div></div>'
             f'<div class="fig"><div class="k">Variance</div><div class="v tone-bad">−${S["short"]}</div></div></div>')
    note = f'<div class="kv"><span class="k">Note</span><span class="v" style="font-weight:400;text-align:right;max-width:60%">{S["note"]}</span></div>'
    ladder = f'<details class="fold"><summary><span class="grow">Closure paper</span>{ic("chev","i sm")}</summary><div class="bd">{ledger()}<div class="kv"><span class="k">To bank</span><span class="v">${S["bank"]}</span></div><div class="kv"><span class="k">Card, gift card, store credit</span><span class="v">${S["other_total"]}</span></div></div></details>'
    foot = '<footer class="pf"><button class="btn lg block primary">'+ic("printer")+'Print closure</button><button class="btn outline block">Done</button></footer>'
    return f'<section class="pane">{head}{badge}<div class="pb">{tiles}{note}{ladder}<div class="xs muted">Saved to Reports › Closures at 17:43</div></div>{foot}</section>'

# 9 · Reports › Closures
def closures_room():
    def row(n, reg, when, who, exp, cnt, badge, on=False, open_=False):
        b = f'<span class="badge {badge[0]}">{badge[1]}</span>'
        st = f'<span class="badge info">Open since 08:55</span>' if open_ else b
        return (f'<div class="trow{" on" if on else ""}"><div class="who"><span class="strong">{n}</span><small>{reg} · {when} · {who}</small></div>'
                f'<div class="r">{exp}</div><div class="r hide">{cnt}</div><div class="r">{st}</div><div class="r hide">{ic("chevr","i sm")}</div></div>')
    rows = ('<div class="day">Today · 6 Nov</div>'
            + row('Back bar', 'Open', '08:55 →', 'Tom R.', '$402.10', '—', ('info','Open'), open_=True)
            + row(f'Closure {S["closure"]}', S['reg'], f'{S["opened"]}–{S["now"]}', S['cashier'], f'${S["expected"]}', f'${S["counted"]}', ('bad', f'short ${S["short"]}'), on=True)
            + '<div class="day">Yesterday · 5 Nov</div>'
            + row('Closure 41', S['reg'], '09:00–17:52', S['cashier'], '$448.20', '$448.20', ('muted','Exact'))
            + row('Closure 40', S['other'], '08:50–18:05', 'Tom R.', '$611.00', '$612.80', ('ok','over $1.80')))
    head = f'<div class="thead"><span>Closure</span><span class="r">Expected</span><span class="r hide">Counted</span><span class="r">Result</span><span></span></div>'
    scope = f'<div class="scope"><span class="chip">{S["store"]} {ic("chev","i sm")}</span><span class="chip">All registers {ic("chev","i sm")}</span><span class="chip">All cashiers {ic("chev","i sm")}</span><span class="chip">This week {ic("chev","i sm")}</span></div>'
    lst = f'<div class="list"><h1>Closures</h1>{scope}{head}{rows}</div>'
    doc_head = pane_head(f'Closure {S["closure"]}', f'{S["reg"]} · {S["opened"]}–{S["now"]} · {S["cashier"]}', disc=f'<div class="disc bad">{ic("down")}</div>', close=False)
    tiles = (f'<div class="tiles3"><div class="fig"><div class="k">Counted</div><div class="v">${S["counted"]}</div></div>'
             f'<div class="fig"><div class="k">Expected</div><div class="v">${S["expected"]}</div></div>'
             f'<div class="fig"><div class="k">Variance</div><div class="v tone-bad">−${S["short"]}</div></div></div>')
    doc = (f'<section class="pane doc">{doc_head}<div class="pb">{tiles}{ledger()}<div class="kv"><span class="k">Note</span><span class="v" style="font-weight:400;text-align:right;max-width:60%">{S["note"]}</span></div>'
           f'<div class="kv"><span class="k">Card, gift card, store credit</span><span class="v">${S["other_total"]}</span></div><div class="xs muted">Printed on 17:43 · closed on this device</div></div>'
           f'<footer class="pf" style="flex-direction:row"><button class="btn outline" style="flex:1">Recount</button><button class="btn primary" style="flex:1">{ic("printer")}Reprint copy</button></footer></section>')
    return f'<div class="stage">{rail("reports")}<div class="room">{lst}{doc}</div></div>'

def cartcol(body, pill='', tabs=False):
    return f'<div class="cartcol">{bar(pill=pill)}{body}{phone_tabs() if tabs else ""}</div>'

def build():
    hero = stage('<div class="empty">No items in the cart</div>', panel(), scrim=True)
    steps = [
        ('1 · Choose register', 'device unbound, two registers (ruled 2P·A)', cartcol(picker(), 'none')),
        ('2 · Open register', 'default float prefilled, last count one tap away', cartcol(open_card(), 'closed')),
        ('2b · First-ever open', 'no float on record, Open disabled with its reason', cartcol(open_card(first=True), 'closed')),
        ('3 · Cashier sheet', 'the avatar; the drawer card is the one door', cashier_sheet()),
        ('4 · Register panel, offline', 'one badge at the top of the pane', panel(offline=True)),
        ('5 · Pay in', '$20.00 · Change', pay_in()),
        ('5b · Pay in, nothing typed', 'the button says why', pay_in(empty=True)),
        ('6 · Pay out', '$45.00 · Supplier', pay_out()),
        ('6b · Pay out over the limit', 'a manager approves in place', pay_out(approval=True)),
        ('6c · Over the limit, offline', 'approval needs a connection', pay_out(approval=True, offline=True)),
        ('7 · Close register', 'the 2026-11-05 count, in the panel', count()),
        ('8 · Closure written', 'three tiles and the paper', written()),
        ('8b · Closure written, unsynced', 'the badge says what waits', written(unsynced=True)),
    ]
    frames = ''.join(frame(l, h, inner) for l, h, inner in steps)
    desk = (f'<div class="desk"><div class="board"><h2>V1 · Tiles and ledger</h2><p class="lead">The register panel over the register: figure tiles, three money tiles, the ledger. Every money task is a pane pushed inside it.</p>{hero}</div>'
            f'<div class="board"><h2>The flow</h2><p class="lead">Each frame is the pane or the cart column at full size.</p><div class="frames">{frames}</div></div>'
            f'<div class="board"><h2>9 · Reports › Closures</h2><p class="lead">The owner\'s ledger: newest first, the open session inline, the document in the pane.</p>{closures_room()}</div></div>')
    psteps = [
        ('1 · Choose register', 'phone', cartcol(picker(), 'none', tabs=True)),
        ('2 · Open register', 'phone', cartcol(open_card(), 'closed', tabs=True)),
        ('3 · Cashier sheet', 'full width', cashier_sheet()),
        ('4 · Register panel', 'full width', panel()),
        ('5 · Pay in', '', pay_in()),
        ('6 · Pay out, over the limit', '', pay_out(approval=True)),
        ('7 · Close register', '', count()),
        ('8 · Closure written', '', written()),
    ]
    room_phone = closures_room().replace('<div class="stage">', '<div style="display:flex;flex-direction:column;height:100%">', 1)
    phone = ('<div class="phone-board">' + ''.join(pframe(l, h, inner) for l, h, inner in psteps)
             + f'<div class="pframe"><div class="flabel">9 · Closures <span>· the list; the document opens as a pane</span></div><div class="pwrap"><div class="cartcol">{room_phone}</div></div></div></div>')
    write(sys.argv, 'Register flow · V1 Tiles and ledger', CSS, desk + phone)

if __name__ == '__main__':
    build()
