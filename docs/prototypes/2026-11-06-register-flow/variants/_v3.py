import sys; sys.path.insert(0, sys.argv[1])
import _v1
from _v1 import *

# V3 · Rows and sentences: the panel is a list, not a dashboard. Every surface is a stack of MenuRows
# (56 px for the verbs, 44 for the rest) with the primary action pinned at the foot. Money panes use a
# plain field and the reason as a choice list with the ✓ slot, and say what will happen in one
# sentence above the button ("$20.00 goes in · Change"). The count keeps the 2026-11-05 family sheet
# but reads the ledger as rows; the closed moment is a receipt-shaped column; the Closures room is a
# dense table (44 px rows, hairlines) with the document as a column on the right.
# Ruled surfaces (Choose register, the cashier sheet) are V1's, unchanged.

I['chevu'] = '<path d="M6 15l6-6 6 6"/>'

CSS = _v1.CSS + '''
/* Grouped MenuRows (packages/components/src/menu-row: min-h-row, gap-2, px-2.5; choice ✓ in a w-5 slot) */
/* ListRow (packages/components/src/list-row): flush, border-b hairline, no radius; default min-h-14, sm min-h-row */
.rgroup{margin:0 -16px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);flex-shrink:0}
.rgroup>.mr+.mr,.rgroup>.mr+.lad,.rgroup>.lad+.mr{border-top:1px solid var(--border)}
.mr{display:flex;align-items:center;gap:10px;min-height:var(--spacing-row);padding:6px 16px}
.mr.tall{min-height:56px}
.mr .ml{flex:1;min-width:0;font-weight:var(--w-ui)}
.mr .ml small{display:block;color:var(--muted-foreground);font-size:var(--text-xs);font-weight:400}
.mr .val{font-weight:var(--w-ui);white-space:nowrap}
.mr .val.muted{font-weight:400}
.mr .val.lead{font-size:20px;font-weight:700}
.mr>.i:last-child{color:var(--muted-foreground)}
.mr .ico{width:32px;height:32px;border-radius:999px;background:var(--muted);display:flex;align-items:center;justify-content:center;flex:none}
.mr .slot{width:20px;display:flex;justify-content:center;color:var(--primary);flex:none}
.mr.on{background:var(--accent)}
.mr.bad{background:var(--bad-bg);color:var(--bad);min-height:48px}.mr.bad .ml{display:flex;align-items:center;gap:8px;font-weight:var(--w-strong);font-size:17px}.mr.bad .val{font-weight:var(--w-strong);font-size:17px}
/* The ledger as rows: read-only lines, 30 px, under the row they add up to */
.lad{padding:2px 16px}
.lr{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:30px}
.lr .k{color:var(--muted-foreground)}.lr .k small{font-size:var(--text-xs);margin-left:4px}
.lr .v{font-variant-numeric:tabular-nums}
.lr.sum{border-top:1px solid var(--border);font-weight:var(--w-strong)}.lr.sum .k{color:var(--foreground)}
.rp .pb{gap:6px;padding:12px 16px}
.rp .lad .lr{min-height:26px}
.rp .pb>*{flex-shrink:0}
.glabel{font-size:var(--text-xs);color:var(--muted-foreground);font-weight:var(--w-ui);margin:4px 0 -2px}
/* The one-sentence confirmation above the button */
.sentence{text-align:center;color:var(--muted-foreground)}.sentence b{color:var(--foreground);font-weight:var(--w-strong)}
.sentence .textbtn{min-height:0;margin-left:2px}
.pfrow{flex-direction:row!important}.pfrow .btn{flex:1}.pfrow .btn.primary{flex:1.4}
.lblrow{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;min-height:20px}
.lblrow .lbl{margin:0}
.lblrow .textbtn{min-height:36px;margin:-8px 0}
textarea.note.one{height:44px;min-height:44px;padding:11px 12px}
/* The closed moment: a receipt-shaped column, labels left, values right */
.receipt{border:1px solid var(--border);border-radius:var(--radius-tile);background:var(--background);padding:12px 16px;display:flex;flex-direction:column}
.receipt .rhead{text-align:center;padding-bottom:8px;border-bottom:1px solid var(--border);margin-bottom:4px}
.receipt .rhead b{display:block;font-weight:var(--w-strong)}.receipt .rhead span{color:var(--muted-foreground);font-size:var(--text-xs)}
.receipt .lr{min-height:28px}
.receipt .gap{border-top:1px solid var(--border);margin-top:4px;padding-top:4px}
.receipt .var{display:flex;justify-content:space-between;align-items:center;min-height:44px;margin:6px -8px;padding:0 8px;border-radius:var(--radius);background:var(--bad-bg);color:var(--bad);font-weight:var(--w-strong);font-size:17px}
.receipt .var .l{display:flex;align-items:center;gap:8px}
.receipt .note{padding-top:6px}.receipt .note .k{color:var(--muted-foreground);font-size:var(--text-xs);display:block;margin-bottom:2px}
/* Closures room: a dense table (Table: head h-9 caption text; rows min-h-row border-b; selected border-l-2 primary bg-muted) */
.room3{flex:1;display:grid;grid-template-columns:1fr 380px;min-width:0}
.tbl{padding:16px 20px;display:flex;flex-direction:column;gap:10px;min-width:0}
.tbl h1{font-size:20px;font-weight:var(--w-strong)}
.tr{display:grid;grid-template-columns:40px 1.2fr 0.85fr 1fr 0.9fr 0.9fr 0.95fr 1.25fr;align-items:center;min-height:var(--spacing-row);border-bottom:1px solid var(--border);border-left:2px solid transparent}
.tr>span{padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tr .r{text-align:right}
.tr>span:last-child{overflow:visible}
.tr.th{min-height:36px;color:var(--muted-foreground);font-size:var(--text-xs);font-weight:var(--w-ui)}
.tr.on{border-left-color:var(--primary);background:var(--muted)}
.tr .n{color:var(--muted-foreground)}
.tday{min-height:32px;display:flex;align-items:flex-end;padding:0 10px 4px;color:var(--muted-foreground);font-size:var(--text-xs);font-weight:var(--w-ui);border-bottom:1px solid var(--border)}
.doccol{border-left:1px solid var(--border);background:var(--card);display:flex;flex-direction:column;min-height:0}
.doccol .ph{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border)}
.doccol .ph h1{font-size:17px;font-weight:var(--w-strong)}.doccol .ph .sub{color:var(--muted-foreground);font-size:var(--text-xs);margin-top:2px}
.doccol .pb{flex:1;overflow:hidden;padding:16px;display:flex;flex-direction:column;gap:10px}
.doccol .pf{padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:8px}
@media (max-width:767px){
 .room3{display:block}.tbl{padding:12px}
 .tr{grid-template-columns:40px 1fr auto auto}
 .tr .c-who,.tr .c-sess,.tr .c-exp,.tr .c-cnt{display:none}
 .doccol.desk-only{display:none}
 .rp .pb{gap:8px}
 .lblrow .textbtn .i{display:none}
 .lblrow{gap:4px}.lblrow .lbl,.lblrow .textbtn{white-space:nowrap}
 .rp textarea.note.one{height:62px}
}
'''

def mr(label, val='', sub='', chev=True, tall=False, ico=None, cls='', lead=False, slot=None):
    s = f'<small>{sub}</small>' if sub else ''
    i = f'<span class="ico">{ic(ico)}</span>' if ico else ''
    sl = f'<span class="slot">{ic("check","i sm") if slot else ""}</span>' if slot is not None else ''
    v = f'<span class="val{" lead" if lead else ""}">{val}</span>' if val else ''
    c = ic('chevr', 'i sm') if chev else ''
    return f'<div class="mr{" tall" if tall else ""} {cls}">{sl}{i}<span class="ml">{label}{s}</span>{v}{c}</div>'

def lr(k, v, small='', cls=''):
    sm = f'<small>{small}</small>' if small else ''
    return f'<div class="lr {cls}"><span class="k">{k}{sm}</span><span class="v">{v}</span></div>'

def ladder_rows(sum_row=True):
    rows = (lr('Float', f'${S["float_"]}') + lr('Cash sales', f'+${S["cash_sales"]}', f'{S["cash_sales_n"]} sales')
            + lr('Cash refunds', f'−${S["refunds"]}', '1') + lr('Paid in', f'+${S["paid_in"]}', 'Change · 09:40')
            + lr('Paid out', f'−${S["paid_out"]}', 'Supplier · 14:10'))
    if sum_row:
        rows += lr('Expected', f'${S["expected"]}', cls='sum')
    return rows

def choices(sel, items):
    return '<div class="rgroup">' + ''.join(mr(r, chev=False, slot=(r == sel), cls='on' if r == sel else '') for r in items) + '</div>'

# 2 · Open register: plain field, the two known floats as a choice list, one sentence
def open_card(first=False):
    if first:
        field = '<div class="field bigfield open"><span class="cur">$</span><input value="" placeholder="0.00"></div>'
        rows = '<div class="xs muted">First open on this register · no float on record</div>'
        foot = f'<div class="pf" style="padding:0;border:0"><div class="why">{ic("info","i sm")}Enter the float</div><button class="btn lg block disabled">Open register</button></div>'
    else:
        field = f'<div class="field bigfield"><span class="cur">$</span><input value="{S["float_"]}"></div>'
        rows = ('<div class="rgroup">' + mr(f'${S["float_"]} default float', chev=False, slot=True, cls='on')
                + mr(f'${S["last_count"]} last count', 'yesterday', chev=False, slot=False).replace('class="val"', 'class="val muted"') + '</div>'
                + lr('Last closure', '#41 · yesterday 17:52'))
        foot = f'<div class="sentence">The drawer opens with <b>${S["float_"]}</b></div><button class="btn lg block primary">Open register</button>'
    return f'<div class="cartbody"><div class="card"><h3>Open register</h3><div><span class="lbl">Cash in the drawer</span>{field}</div>{rows}{foot}</div></div>'

# 4 · Register panel: a list of rows, the close pinned
def panel(offline=False):
    head = pane_head(S['reg'], f'{S["store"]} · open since {S["opened"]} · {S["age"]} · {S["cashier"]}', disc=f'<div class="disc ok">{ic("reg")}</div>')
    badge = f'<div class="sbadge"><span class="badge warn">{ic("cloudoff","i sm")}Offline · 3 sales to send</span></div>' if offline else ''
    drawer = '<div class="rgroup">' + mr('In the drawer', f'${S["expected"]}', tall=True, lead=True) + f'<div class="lad">{ladder_rows()}</div></div>'
    sales = '<div class="rgroup">' + mr('Session sales', f'${S["session_sales"]}', sub=f'Other tenders ${S["other_total"]}') + '</div>'
    verbs = ('<div class="rgroup">' + mr('Pay in', tall=True, ico='in') + mr('Pay out', tall=True, ico='out')
             + mr('No sale', 'Opens the drawer', tall=True, ico='nosale', chev=False).replace('class="val"', 'class="val muted"') + '</div>')
    last = '<div class="rgroup">' + mr('Last closure #41', f'<span class="badge ok">{ic("check","i sm")}over $1.80</span>', sub='yesterday 17:52') + '</div>'
    foot = f'<footer class="pf"><button class="btn lg block primary">Close register · it\'s past 17:30</button></footer>'
    return f'<section class="pane rp">{head}{badge}<div class="pb">{drawer}{sales}{verbs}{last}</div>{foot}</section>'

PAY_IN = ['Change', 'Float', 'Tips', 'Mistake', 'Other…']
PAY_OUT = ['Supplier', 'Petty cash', 'Bank', 'Change', 'Mistake', 'Other…']

# 5 · Pay in
def pay_in(empty=False):
    head = pane_head('Pay in', f'{S["reg"]} · ${S["expected"]} in the drawer', back=True)
    if empty:
        field = '<div class="field bigfield open"><span class="cur">$</span><span class="ph">0.00</span></div>'
        rs = choices(None, PAY_IN)
        foot = f'<footer class="pf"><div class="why">{ic("info","i sm")}Enter an amount · Add a reason</div><button class="btn lg block disabled">Put cash in</button></footer>'
    else:
        field = f'<div class="field bigfield"><span class="cur">$</span><input value="{S["paid_in"]}"></div>'
        rs = choices('Change', PAY_IN)
        foot = f'<footer class="pf"><div class="sentence"><b>${S["paid_in"]}</b> goes in · Change</div><button class="btn lg block primary">Put ${S["paid_in"]} in</button></footer>'
    return f'<section class="pane rp">{head}<div class="pb"><div class="q">How much is going into the drawer?</div>{field}<div class="glabel">Reason</div>{rs}</div>{foot}</section>'

# 6 · Pay out (+ approval: the chosen reason folds to one row, the manager's fields take its place)
def pay_out(approval=False, offline=False):
    head = pane_head('Pay out', f'{S["reg"]} · ${S["expected"]} in the drawer', back=True)
    field = f'<div class="field bigfield"><span class="cur">$</span><input value="{S["paid_out"]}"></div>'
    body = f'<div class="q">How much is leaving the drawer?</div>{field}'
    if not approval:
        body += f'<div class="glabel">Reason</div>{choices("Supplier", PAY_OUT)}'
        foot = f'<footer class="pf"><div class="sentence"><b>${S["paid_out"]}</b> comes out · Supplier</div><button class="btn lg block primary">Take ${S["paid_out"]} out</button></footer>'
        return f'<section class="pane rp">{head}<div class="pb">{body}</div>{foot}</section>'
    body += '<div class="rgroup">' + mr('Reason', 'Supplier') + '</div>'
    body += f'<div class="notice warn">{ic("warn")}<div><b>Over the ${S["limit"]} limit · a manager must approve</b></div></div>'
    if offline:
        body += f'<div class="notice info">{ic("cloudoff")}<div><b>Approval needs a connection</b><div class="d">Take the cash out when you are back online, or ask a manager to approve on their device.</div></div></div>'
        foot = f'<footer class="pf"><div class="why">{ic("cloudoff","i sm")}Approval needs a connection</div><button class="btn lg block disabled">Take ${S["paid_out"]} out</button></footer>'
    else:
        body += (f'<div class="glabel">Manager approval</div><div class="field open">{ic("user","i sm")}<input value="" placeholder="WordPress username"></div>'
                 f'<div class="field">{ic("lock","i sm")}<span class="ph">Password</span></div>')
        foot = f'<footer class="pf"><div class="sentence"><b>${S["paid_out"]}</b> comes out · Supplier, once a manager approves</div><button class="btn lg block primary">Approve &amp; take ${S["paid_out"]} out</button></footer>'
    return f'<section class="pane rp">{head}<div class="pb">{body}</div>{foot}</section>'

# 7 · Close register: the family sheet; the ledger reads as rows under Expected, the Short row closes it
def count():
    head = pane_head(f'Close {S["reg"]}', f'{S["cashier"]} · {S["opened"]} to {S["now"]}', back=True)
    a = (f'<div><div class="lblrow"><span class="lbl">Cash counted, float included</span><span class="textbtn">{ic("coins","i sm")}Count by notes and coins</span></div>'
         f'<div class="field bigfield open"><span class="cur">$</span><input value="{S["counted"]}"></div></div>')
    exp = ('<div class="rgroup">' + mr('Expected', f'${S["expected"]}', chev=False).replace('</div>', f'{ic("chevu","i sm")}</div>', 1)
           + f'<div class="lad">{ladder_rows(sum_row=False)}</div>'
           + f'<div class="mr bad"><span class="ml">{ic("down")}Short</span><span class="val">−${S["short"]}</span></div></div>')
    note = f'<div><div class="lblrow"><span class="lbl">Note</span><span class="xs tone-bad">Required: drawer is short</span></div><textarea class="note one" rows="1">{S["note"]}</textarea></div>'
    split = f'<div class="split"><span class="pair">Leave in drawer <b>${S["keep"]}</b> · To bank <b>${S["bank"]}</b></span></div>'
    other = '<div class="rgroup">' + mr('Other payments', f'${S["other_total"]}', sub='not counted') + '</div>'
    foot = f'<footer class="pf pfrow"><button class="btn lg outline" style="box-shadow:none">Close register</button><button class="btn lg primary">{ic("printer")}Close &amp; print</button></footer>'
    return f'<section class="pane rp">{head}<div class="pb">{a}{exp}{note}{split}{other}</div>{foot}</section>'

def receipt():
    return ('<div class="receipt">'
            f'<div class="rhead"><b>Closure {S["closure"]}</b><span>{S["store"]} · {S["reg"]}<br>Fri 6 Nov · {S["opened"]}–{S["now"]} · {S["cashier"]}</span></div>'
            + ladder_rows(sum_row=False)
            + f'<div class="gap">{lr("Expected", "$" + S["expected"])}{lr("Counted", "$" + S["counted"])}</div>'
            + f'<div class="var"><span class="l">{ic("down")}Short</span><span>−${S["short"]}</span></div>'
            + lr('Leave in drawer', f'${S["keep"]}') + lr('To bank', f'${S["bank"]}')
            + lr('Other tenders', f'${S["other_total"]}', 'not counted')
            + f'<div class="note gap"><span class="k">Note</span>{S["note"]}</div></div>')

# 8 · Closure written: the receipt column
def written(unsynced=False):
    head = pane_head(f'Closure {S["closure"]} written', f'{S["reg"]} · {S["opened"]}–{S["now"]} · {S["cashier"]}', disc=f'<div class="disc ok">{ic("check")}</div>')
    badge = f'<div class="sbadge"><span class="badge warn">{ic("cloudoff","i sm")}Unsynced · 3 rows not yet on the store</span></div>' if unsynced else ''
    foot = f'<footer class="pf pfrow"><button class="btn lg outline" style="box-shadow:none">Done</button><button class="btn lg primary">{ic("printer")}Print closure</button></footer>'
    return f'<section class="pane rp">{head}{badge}<div class="pb">{receipt()}<div class="xs muted">Saved to Reports › Closures at 17:43</div></div>{foot}</section>'

CLOSURES = [
    ('Today · Fri 6 Nov', [
        ('', S['other'], 'Tom R.', '08:55 →', '$402.10', '—', '—', ('info', 'Open', None), False),
        (str(S['closure']), S['reg'], S['cashier'], f'{S["opened"]}–{S["now"]}', f'${S["expected"]}', f'${S["counted"]}', f'−${S["short"]}', ('bad', 'Short', 'down'), True),
    ]),
    ('Thu 5 Nov', [
        ('41', S['reg'], S['cashier'], '09:00–17:52', '$448.20', '$448.20', '$0.00', ('muted', 'Exact', None), False),
        ('40', S['other'], 'Tom R.', '08:50–18:05', '$611.00', '$612.80', '+$1.80', ('ok', 'Over', 'up'), False),
    ]),
    ('Wed 4 Nov', [
        ('39', S['reg'], S['cashier'], '09:05–17:40', '$502.75', '$502.75', '$0.00', ('muted', 'Exact', None), False),
        ('38', S['other'], 'Tom R.', '08:52–18:10', '$588.40', '$588.00', '−$0.40', ('warn', 'Corrected', 'pencil'), False),
    ]),
    ('Tue 3 Nov', [
        ('37', S['reg'], 'Sam K.', '09:01–17:45', '$476.90', '$476.90', '$0.00', ('muted', 'Exact', None), False),
        ('36', S['other'], 'Tom R.', '08:58–18:02', '$640.15', '$641.15', '+$1.00', ('ok', 'Over', 'up'), False),
    ]),
]

def closures_table():
    head = ('<div class="tr th"><span>#</span><span>Register</span><span class="c-who">Cashier</span><span class="c-sess">Session</span>'
            '<span class="r c-exp">Expected</span><span class="r c-cnt">Counted</span><span class="r">Difference</span><span>Result</span></div>')
    body = ''
    for day, rows in CLOSURES:
        body += f'<div class="tday">{day}</div>'
        for n, reg, who, sess, exp, cnt, diff, (tone, word, icon), on in rows:
            dt = {'bad': ' tone-bad', 'ok': ' tone-ok'}.get(tone, '')
            b = f'<span class="badge {tone}">{ic(icon, "i sm") if icon else ""}{word}</span>'
            body += (f'<div class="tr{" on" if on else ""}"><span class="n">{n}</span><span class="strong">{reg}</span><span class="c-who">{who}</span><span class="c-sess">{sess}</span>'
                     f'<span class="r c-exp">{exp}</span><span class="r c-cnt">{cnt}</span><span class="r{dt}">{diff}</span><span>{b}</span></div>')
    scope = f'<div class="scope"><span class="chip">{S["store"]} {ic("chev","i sm")}</span><span class="chip">All registers {ic("chev","i sm")}</span><span class="chip">All cashiers {ic("chev","i sm")}</span><span class="chip">This week {ic("chev","i sm")}</span></div>'
    return f'<div class="tbl"><h1>Closures</h1>{scope}<div>{head}{body}</div></div>'

def doc_column(cls='doccol'):
    head = f'<header class="ph"><div class="disc bad">{ic("down")}</div><div class="grow" style="flex:1"><h1>Closure {S["closure"]}</h1><div class="sub">{S["reg"]} · {S["opened"]}–{S["now"]} · {S["cashier"]}</div></div></header>'
    foot = f'<footer class="pf pfrow"><button class="btn outline" style="flex:1">Recount</button><button class="btn primary" style="flex:1.4">{ic("printer")}Reprint copy</button></footer>'
    return f'<section class="{cls}">{head}<div class="pb">{receipt()}<div class="xs muted">Printed at 17:43 · closed on this device</div></div>{foot}</section>'

# 9 · Reports › Closures: the dense table, the document as a column
def closures_room():
    return f'<div class="stage">{rail("reports")}<div class="room3">{closures_table()}{doc_column("doccol desk-only")}</div></div>'

def build():
    hero = stage('<div class="empty">No items in the cart</div>', panel(), scrim=True)
    steps = [
        ('1 · Choose register', 'device unbound, two registers (ruled 2P·A)', cartcol(picker(), 'none')),
        ('2 · Open register', 'default float chosen, last count one row away', cartcol(open_card(), 'closed')),
        ('2b · First-ever open', 'no float on record, Open disabled with its reason', cartcol(open_card(first=True), 'closed')),
        ('3 · Cashier sheet', 'the avatar; the drawer card is the one door', cashier_sheet()),
        ('4 · Register panel, offline', 'one badge at the top of the pane', panel(offline=True)),
        ('5 · Pay in', '$20.00 · Change', pay_in()),
        ('5b · Pay in, nothing typed', 'the button says why', pay_in(empty=True)),
        ('6 · Pay out', '$45.00 · Supplier', pay_out()),
        ('6b · Pay out over the limit', 'a manager approves in place', pay_out(approval=True)),
        ('6c · Over the limit, offline', 'approval needs a connection', pay_out(approval=True, offline=True)),
        ('7 · Close register', 'the 2026-11-05 count, the ledger as rows', count()),
        ('8 · Closure written', 'the receipt column', written()),
        ('8b · Closure written, unsynced', 'the badge says what waits', written(unsynced=True)),
    ]
    frames = ''.join(frame(l, h, inner) for l, h, inner in steps)
    desk = (f'<div class="desk"><div class="board"><h2>V3 · Rows and sentences</h2><p class="lead">The register panel is a list of rows with the close pinned; each money pane ends in one sentence that says what will happen.</p>{hero}</div>'
            f'<div class="board"><h2>The flow</h2><p class="lead">Each frame is the pane or the cart column at full size.</p><div class="frames">{frames}</div></div>'
            f'<div class="board"><h2>9 · Reports › Closures</h2><p class="lead">The owner\'s ledger as a table: newest first, Expected · Counted · Difference on every row, the open session inline, the document as a column.</p>{closures_room()}</div></div>')
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
    room_phone = f'<div class="cartcol" style="overflow:hidden">{closures_table()}</div>'
    doc_phone = doc_column('pane').replace('<header class="ph">', f'<header class="ph"><div class="ibtn" aria-label="Back">{ic("chevl")}</div>', 1)
    phone = ('<div class="phone-board">' + ''.join(pframe(l, h, inner) for l, h, inner in psteps)
             + pframe('9 · Closures', 'the table keeps # · Register · Difference · Result', room_phone)
             + pframe('9b · Closure 42', 'the document, full width', doc_phone) + '</div>')
    write(sys.argv, 'Register flow · V3 Rows and sentences', CSS, desk + phone)

if __name__ == '__main__':
    build()
