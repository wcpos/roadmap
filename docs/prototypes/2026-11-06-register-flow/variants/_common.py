# Shared pieces for the register-flow variants. Generator only: `python3 _vN.py <this dir> <out.html>`
# writes a self-contained page (tokens.css inlined verbatim; CSS only, no JavaScript).
#
# Every element is drawn with the token the component reads in code (packages/components/src):
#   Button default  : bg-primary text-primary-foreground h-ctl(44) rounded-control  / lg: h-14 rounded-commit
#   Button outline  : border-border bg-card                 / ghost: no surface
#   FieldBox rest   : border-chip-border bg-card rounded-field border-[--shape-ctl-border]; open: border-ring ring-1
#   Tile            : bg-card rounded-tile border border-border min-h-tile(64); selected: border-primary bg-muted
#   MenuRow         : min-h-row(44) rounded-md px-2.5 py-1.5; choice ✓ in a w-5 slot
#   Notice          : rounded-lg border px-3 py-2.5, tone band (border-<tone>/45 bg-<tone>-bg)
#   Badge tinted    : bg-<tone>/15 text-<tone>; Chip: bg-chip border-chip-border rounded-chip
#   Dialog right    : h-full border-l bg-card, w-96 (md) → the register family's panes are 420 px (brief: assumed)
#   Rail            : bg-rail text-rail-foreground border-rail-border; selected: bg-rail-selected
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TOKENS = open(os.path.join(HERE, 'tokens.css')).read()
# The light theme is the page's default: the shoot script only sets data-theme="dark".
TOKENS = TOKENS.replace('html[data-theme="light"] {', 'html:not([data-theme]), html[data-theme="light"] {', 1)

I = {
 'x':'<path d="M6 6l12 12M18 6L6 18"/>',
 'chev':'<path d="M6 9l6 6 6-6"/>',
 'chevr':'<path d="M9 6l6 6-6 6"/>',
 'chevl':'<path d="M15 6l-6 6 6 6"/>',
 'down':'<path d="M12 5v14M6 13l6 6 6-6"/>',
 'up':'<path d="M12 19V5M6 11l6-6 6 6"/>',
 'check':'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
 'warn':'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
 'dash':'<path d="M7 12h10"/>',
 'cloudoff':'<path d="M3 3l18 18"/><path d="M9.2 5.4A6 6 0 0 1 17.7 9a4.5 4.5 0 0 1 3 7.6"/><path d="M17 19H7a5 5 0 0 1-1.9-9.6"/>',
 'coins':'<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.6-2.4-2.9-5.5-3"/>',
 'printer':'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 'reg':'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 'drawer':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 12h18M10 15.5h4"/>',
 'orders':'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 'products':'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 'customers':'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 2.8 3 6"/>',
 'reports':'<path d="M5 20V11M11 20V5M17 20v-6M3 20h18"/>',
 'settings':'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 'pencil':'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'in':'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 20h16"/>',
 'out':'<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 20h16"/>',
 'nosale':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 12h18"/>',
 'lock':'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
 'bell':'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
 'back':'<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/>',
 'wifi':'<path d="M2 9a16 16 0 0 1 20 0"/><path d="M5.5 12.5a11 11 0 0 1 13 0"/><path d="M9 16a6 6 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/>',
 'dots':'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
}
def ic(name, cls='i'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{I[name]}</svg>'

# The shift (brief § The shift)
S = dict(
    store='Corner Shop', reg='Front counter', other='Back bar', cashier='Maria L.', initials='ML',
    opened='09:02', now='17:41', age='8 h 39 m', float_='150.00', last_count='148.20',
    cash_sales='412.35', cash_sales_n=31, refunds='18.00', paid_in='20.00', paid_out='45.00',
    expected='519.35', session_sales='1,738.95', counted='504.35', short='15.00', closure=42,
    card='1,284.60', card_n=52, gift='60.00', gift_n=2, credit='25.00', credit_n=1, other_total='1,369.60',
    limit='40.00', keep='150.00', bank='354.35', note='Counted twice. Wrong change on the 16:20 order.',
)

# Base CSS: the computed tokens global.css derives in @theme inline (radii from --shape-*, weights from
# --type-w-*) plus the layout the components give every page.
BASE = '''
*{box-sizing:border-box;margin:0;padding:0}
html{--spacing:4px;--text-base:14px;--text-xs:12px;--text-2xs:11px;--text-amt:40px;--radius:8px;--spacing-ctl:44px;--spacing-row:44px;--spacing-tile:64px;
 --radius-control:calc(var(--radius)*var(--shape-radius-control));--radius-tile:calc(var(--radius)*var(--shape-radius-tile));
 --radius-commit:calc(var(--radius)*var(--shape-radius-commit));--radius-field:calc(var(--radius)*var(--shape-radius-field));
 --radius-chip:calc(var(--radius)*var(--shape-radius-chip));--w-ui:var(--type-w-ui);--w-strong:var(--type-w-strong);--w-commit:var(--type-w-commit);
 font-size:var(--text-base);background:var(--background)}
body{background:var(--background);color:var(--foreground);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums;line-height:1.35;-webkit-font-smoothing:antialiased}
.i{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
.i.sm{width:16px;height:16px}.i.lg{width:22px;height:22px}
.muted{color:var(--muted-foreground)}.strong{font-weight:var(--w-strong)}.xs{font-size:var(--text-xs)}
.amt{font-variant-numeric:tabular-nums}
.tone-ok{color:var(--ok)}.tone-bad{color:var(--bad)}.tone-warn{color:var(--warning-text)}.tone-info{color:var(--info)}.tone-muted{color:var(--muted-foreground)}
/* Button (packages/components/src/button): default 44 / lg 56 */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:var(--spacing-ctl);padding:0 16px;border-radius:var(--radius-control);font-weight:var(--w-ui);border:1px solid transparent;white-space:nowrap;color:var(--foreground)}
.btn.primary{background:var(--primary);color:var(--primary-foreground);border-color:transparent}
.btn.outline{background:var(--card);border-color:var(--border)}
.btn.ghost{background:transparent;color:var(--muted-foreground)}
.btn.destructive{background:var(--destructive);color:var(--destructive-foreground)}
.btn.lg{height:56px;border-radius:var(--radius-commit);font-weight:var(--w-commit);font-size:15px;box-shadow:var(--shape-commit-shadow)}
.btn.sm{height:36px;padding:0 12px}
.btn[disabled],.btn.disabled{background:var(--muted);color:var(--muted-foreground);border-color:transparent;box-shadow:none}
.btn.block{width:100%}
/* FieldBox / Input */
.field{display:flex;align-items:center;gap:8px;min-height:var(--spacing-ctl);padding:0 12px;border:var(--shape-ctl-border) solid var(--chip-border);background:var(--card);border-radius:var(--radius-field);color:var(--foreground)}
.field.open{border:1px solid var(--ring);box-shadow:0 0 0 1px var(--ring)}
.field.invalid{border:1px solid var(--bad)}
.field input{all:unset;flex:1;min-width:0;font:inherit;color:inherit}.field input::placeholder{color:var(--muted-foreground)}
.field .ph{color:var(--muted-foreground)}
.field .cur{color:var(--muted-foreground)}
/* the field's placeholder span is .ph, which the pane header also is: keep the field's own */
.pane .field .ph{display:inline;padding:0;border:0}
/* Tile */
.tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:var(--spacing-tile);padding:8px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-tile);text-align:center}
.tile.selected{border-color:var(--primary);background:var(--muted)}
.tile .t{font-weight:var(--w-ui)}
.tile .h{font-size:var(--text-xs);color:var(--muted-foreground)}
.tile.dashed{border-style:dashed;background:transparent}
/* Chip */
.chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:var(--radius-chip);border:var(--shape-ctl-border) solid var(--chip-border);background:var(--chip);color:var(--foreground);white-space:nowrap}
.chip.on{background:var(--selected);color:var(--selected-foreground);border-color:transparent}
.chip.sm{height:28px;padding:0 10px;font-size:var(--text-xs)}
/* Badge tinted */
.badge{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:999px;font-size:var(--text-xs);font-weight:var(--w-ui)}
.badge.ok{background:color-mix(in oklch,var(--ok) 15%,transparent);color:var(--ok)}
.badge.bad{background:color-mix(in oklch,var(--bad) 15%,transparent);color:var(--bad)}
.badge.warn{background:color-mix(in oklch,var(--warning) 15%,transparent);color:var(--warning-text)}
.badge.muted{background:color-mix(in oklch,var(--neutral) 15%,transparent);color:var(--muted-foreground)}
.badge.info{background:color-mix(in oklch,var(--info) 15%,transparent);color:var(--info)}
/* Notice band */
.notice{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border:1px solid;border-radius:var(--radius)}
.notice.warn{border-color:color-mix(in oklch,var(--warning) 45%,transparent);background:var(--warning-bg)}
.notice.info{border-color:color-mix(in oklch,var(--info) 45%,transparent);background:var(--accent)}
.notice.bad{border-color:color-mix(in oklch,var(--bad) 45%,transparent);background:var(--bad-bg)}
.notice b{font-weight:var(--w-ui)}
.notice .d{color:var(--muted-foreground);font-size:var(--text-xs)}
/* MenuRow */
.row{display:flex;align-items:center;gap:8px;min-height:var(--spacing-row);padding:6px 10px;border-radius:calc(var(--radius) - 2px)}
.row .slot{width:20px;display:flex;justify-content:center;color:var(--primary)}
.row .lbl{flex:1;min-width:0}
.row .v{color:var(--muted-foreground)}
.row.on{background:var(--accent)}
.row.dim{opacity:.55}
/* ToneDisc */
.disc{width:36px;height:36px;border-radius:999px;display:flex;align-items:center;justify-content:center;flex:none;background:var(--muted);color:var(--foreground)}
.disc.ok{background:var(--ok-bg);color:var(--ok)}.disc.bad{background:var(--bad-bg);color:var(--bad)}.disc.warn{background:var(--warning-bg);color:var(--warning-text)}.disc.info{background:var(--accent);color:var(--info)}
.av{width:32px;height:32px;border-radius:999px;background:var(--selected);color:var(--selected-foreground);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:var(--w-strong);flex:none}
/* PropertyList / ladder rows */
.kv{display:flex;justify-content:space-between;gap:12px;min-height:36px;align-items:center;padding:0 2px}
.kv .k{color:var(--muted-foreground)}.kv .v{font-weight:var(--w-ui)}
.kv.tot{border-top:1px solid var(--border);padding-top:8px;margin-top:4px}.kv.tot .k{color:var(--foreground)}.kv.tot .v{font-weight:var(--w-strong)}
.kv small{color:var(--muted-foreground);font-size:var(--text-xs);margin-left:4px}
.hr{height:1px;background:var(--border)}
/* The stage: rail + two columns, 1280 × 800 */
.stage{position:relative;width:1280px;height:800px;overflow:hidden;background:var(--background);display:flex;border:1px solid var(--border);border-radius:12px}
.rail{width:72px;background:var(--rail);border-right:1px solid var(--rail-border);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px;color:var(--rail-foreground)}
.rail a{display:flex;flex-direction:column;align-items:center;gap:3px;width:60px;padding:8px 0;border-radius:var(--radius);font-size:var(--text-2xs);font-weight:var(--w-ui);color:inherit;text-decoration:none}
.rail a.on{background:var(--rail-selected);color:var(--rail-selected-foreground)}
.rail .mark{width:36px;height:36px;border-radius:10px;background:var(--primary);color:var(--primary-foreground);display:flex;align-items:center;justify-content:center;font-weight:700;margin-bottom:8px}
.rail .spacer{flex:1}
.main{flex:1;display:grid;grid-template-columns:1fr 400px;min-width:0}
.prods{padding:16px 20px;display:flex;flex-direction:column;gap:12px;min-width:0}
.search{height:44px;border:var(--shape-ctl-border) solid var(--chip-border);border-radius:var(--radius-field);background:var(--card);display:flex;align-items:center;gap:10px;padding:0 12px;color:var(--muted-foreground)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ptile{height:120px;border:1px solid var(--border);border-radius:var(--radius-tile);background:var(--card);padding:10px;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;font-weight:var(--w-ui)}
.ptile span{color:var(--muted-foreground);font-weight:400}
.ptile.tint0{background:var(--tile-tint-0)}.ptile.tint1{background:var(--tile-tint-1)}.ptile.tint2{background:var(--tile-tint-2)}.ptile.tint3{background:var(--tile-tint-3)}.ptile.tint4{background:var(--tile-tint-4)}.ptile.tint5{background:var(--tile-tint-5)}
.cart{background:var(--cart);border-left:1px solid var(--border);display:flex;flex-direction:column;min-width:0}
.bar{height:48px;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid var(--border)}
.bar .place{flex:1;min-width:0;font-weight:var(--w-ui)}.bar .place small{display:block;color:var(--muted-foreground);font-size:var(--text-xs);font-weight:400}
.pill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:var(--text-xs);font-weight:var(--w-ui)}
.pill.warn{background:var(--warning-bg);color:var(--warning-text)}.pill.muted{background:var(--muted);color:var(--muted-foreground)}.pill.bad{background:var(--bad-bg);color:var(--bad)}
.cartbody{flex:1;display:flex;flex-direction:column;padding:16px;gap:12px}
.cart .empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted-foreground)}
.cart .foot{padding:12px 16px;border-top:1px solid var(--border)}
.scrim{position:absolute;inset:0;background:var(--scrim)}
/* Right-side pane (Dialog right): h-full border-l bg-card */
.pane{position:absolute;top:0;right:0;bottom:0;width:420px;background:var(--card);border-left:1px solid var(--border);display:flex;flex-direction:column}
.pane .ph{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border)}
.pane .ph h1{font-size:17px;font-weight:var(--w-strong);line-height:1.2}
.pane .ph .sub{color:var(--muted-foreground);font-size:var(--text-xs);margin-top:2px}
.pane .ph .grow{flex:1;min-width:0}
.ibtn{width:36px;height:36px;border-radius:var(--radius-control);display:flex;align-items:center;justify-content:center;color:var(--muted-foreground);flex:none}
.pane .pb{flex:1;overflow:hidden;padding:16px;display:flex;flex-direction:column;gap:14px}
.pane .pf{padding:12px 16px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px}
.pane .pf .why{display:flex;align-items:center;gap:6px;color:var(--muted-foreground);font-size:var(--text-xs);justify-content:center}
.sbadge{padding:8px 16px 0}
/* Boards */
main{max-width:1280px;margin:0 auto;padding:0 0 48px}
.board h2{font-size:17px;font-weight:var(--w-strong);margin:28px 0 4px}
.board p.lead{color:var(--muted-foreground);margin-bottom:12px}
/* three 420 px frames and two 10 px gaps fill the 1280 board exactly */
.frames{display:grid;grid-template-columns:repeat(3,420px);gap:24px 10px;align-items:start}
.frame{display:flex;flex-direction:column;gap:6px}
.flabel{font-weight:var(--w-ui)}.flabel span{color:var(--muted-foreground);font-weight:400}
.fwrap{position:relative;height:720px;width:420px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--card)}
.fwrap .pane{position:absolute;inset:0;width:auto;border:0}
.fwrap .cartcol{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--cart)}
/* Phone: the register's cart column is the screen; the family's panes are full width */
.phone-board{display:none}
@media (max-width:767px){
 main{max-width:390px;padding:0}
 .desk{display:none}
 .phone-board{display:flex;flex-direction:column;gap:14px;padding:10px}
 .pframe{display:flex;flex-direction:column;gap:6px}
 .pwrap{position:relative;width:370px;height:700px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--card)}
 .pwrap .pane{position:absolute;inset:0;width:auto;border:0}
 .pwrap .cartcol{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--cart)}
 .pwrap .rail{display:none}.pwrap .stage{width:auto;height:100%;border:0;border-radius:0}
 .pwrap .cartbody{flex:1}.pwrap .tabs{margin-top:auto}
 .tabs{height:52px;border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(4,1fr);align-items:center;background:var(--rail);color:var(--rail-foreground);font-size:var(--text-2xs);font-weight:var(--w-ui)}
 .tabs a{display:flex;flex-direction:column;align-items:center;gap:2px;color:inherit;text-decoration:none}.tabs a.on{color:var(--rail-selected-foreground)}
}
'''

def rail(on='reg'):
    items=[('reg','Register'),('orders','Orders'),('products','Products'),('customers','Customers'),('reports','Reports')]
    out=''.join(f'<a class="{"on" if k==on else ""}" href="#">{ic(k)}{l}</a>' for k,l in items)
    return f'<nav class="rail" aria-label="Main"><div class="mark">WC</div>{out}<div class="spacer"></div><a href="#">{ic("settings")}Settings</a></nav>'

PRODS=[('Cold brew 330ml','$4.50',0),('Sourdough loaf','$6.00',1),('Oat milk 1L','$2.80',2),('Almond croissant','$3.40',3),('Espresso beans 250g','$12.00',4),('Tote bag','$8.00',5),('Sparkling water','$1.90',0),('Granola jar','$7.50',1),('Ceramic mug','$14.00',2),('Gift card','$25.00',3),('Honey 340g','$9.00',4),('Lemon tart','$4.20',5)]
def products():
    tiles=''.join(f'<div class="ptile tint{t}">{n}<span>{p}</span></div>' for n,p,t in PRODS)
    return f'<div class="prods"><div class="search">{ic("search")}Search products</div><div class="grid">{tiles}</div></div>'

def bar(state='open', pill=''):
    place=f'<div class="place">{S["reg"]}<small>{S["store"]}</small></div>'
    p = {'counting':'<span class="pill warn">Counting</span>','closed':'<span class="pill muted">Closed</span>','offline':f'<span class="pill warn">{ic("cloudoff","i sm")}Offline</span>','none':'<span class="pill bad">No register</span>','':''}[pill]
    return f'<div class="bar">{place}{p}<div class="av">{S["initials"]}</div></div>'

def cart_column(body, state='open', pill='', foot=True):
    f = f'<div class="foot"><button class="btn lg block disabled">Checkout $0.00</button></div>' if foot else ''
    return f'<aside class="cart">{bar(state,pill)}{body}{f}</aside>'

def stage(cart_body, pane_html='', scrim=False, on='reg', pill='', foot=True, products_html=None):
    sc='<div class="scrim"></div>' if scrim else ''
    return f'<div class="stage">{rail(on)}<div class="main">{products_html or products()}{cart_column(cart_body, pill=pill, foot=foot)}</div>{sc}{pane_html}</div>'

def phone_tabs(on='reg'):
    items=[('reg','Register'),('orders','Orders'),('products','Products'),('customers','Customers')]
    return '<div class="tabs">'+''.join(f'<a class="{"on" if k==on else ""}" href="#">{ic(k)}{l}</a>' for k,l in items)+'</div>'

def page(title, css, body):
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title>
<style>{TOKENS}</style><style>{BASE}</style><style>{css}</style></head><body><main>{body}</main></body></html>'''

def frame(label, hint, inner, cls='fwrap'):
    return f'<div class="frame"><div class="flabel">{label} <span>· {hint}</span></div><div class="{cls}">{inner}</div></div>'

def pframe(label, hint, inner):
    return f'<div class="pframe"><div class="flabel">{label} <span>· {hint}</span></div><div class="pwrap">{inner}</div></div>'

def write(argv, title, css, body):
    open(argv[2],'w').write(page(title, css, body))
