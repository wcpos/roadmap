# Shared pieces for the Close Register variants (generator only; output files are self-contained).
I = {
 'x':'<path d="M6 6l12 12M18 6L6 18"/>',
 'chev':'<path d="M6 9l6 6 6-6"/>',
 'down':'<path d="M12 5v14M6 13l6 6 6-6"/>',
 'up':'<path d="M12 19V5M6 11l6-6 6 6"/>',
 'check':'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
 'dash':'<path d="M7 12h10"/>',
 'cloudoff':'<path d="M3 3l18 18"/><path d="M9.2 5.4A6 6 0 0 1 17.7 9a4.5 4.5 0 0 1 3 7.6"/><path d="M17 19H7a5 5 0 0 1-1.9-9.6"/>',
 'coins':'<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.6-2.4-2.9-5.5-3"/>',
 'printer':'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 'back':'<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/>',
 'reg':'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 'orders':'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 'products':'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 'customers':'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 2.8 3 6"/>',
 'reports':'<path d="M5 20V11M11 20V5M17 20v-6M3 20h18"/>',
 'settings':'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 'pencil':'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
}
def ic(name, cls='i'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{I[name]}</svg>'

TOKENS = '''
:root{
 --bg:#EDEFF2; --surface:#FFFFFF; --surface-2:#F4F5F7; --sunken:#E8EAEE;
 --line:#D8DCE1; --line-strong:#B4BAC3;
 --text:#14171B; --text-2:#4B535E; --muted:#646C78;
 --primary:#1D5FD6; --on-primary:#FFFFFF;
 --ok:#16764A; --ok-weak:#E3F2EA;
 --warn:#8F5300; --warn-weak:#FBEFDC;
 --bad:#B3261E; --bad-weak:#FBE8E6;
 --info:#2A5AA8; --info-weak:#E6EDF8;
 --scrim:rgba(18,21,26,.44);
 --disabled-bg:#E1E4E8; --disabled-text:#5F6772;
 --focus:#1D5FD6;
 --radius:10px;
}
:root[data-theme="dark"]{
 --bg:#0D0F12; --surface:#16191D; --surface-2:#1D2126; --sunken:#111316;
 --line:#2A2F36; --line-strong:#3F4650;
 --text:#ECEEF1; --text-2:#B3BAC4; --muted:#949CA7;
 --primary:#2F6FDB; --on-primary:#FFFFFF;
 --ok:#5CC690; --ok-weak:#12261B;
 --warn:#E8A33E; --warn-weak:#2A1F0E;
 --bad:#FF8A7F; --bad-weak:#2F1714;
 --info:#8DB3F2; --info-weak:#15213A;
 --scrim:rgba(0,0,0,.58);
 --disabled-bg:#24292F; --disabled-text:#9AA2AD;
 --focus:#6C9CF0;
}
'''

BASE = '''
*{box-sizing:border-box;margin:0;padding:0}
html{font-size:14px;background:var(--bg)}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums;line-height:1.4;-webkit-font-smoothing:antialiased}
button,input,textarea{font:inherit;color:inherit;font-variant-numeric:tabular-nums}
button{cursor:pointer}
.i{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex:none}
.num{font-variant-numeric:tabular-nums}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
summary{list-style:none;cursor:pointer}
summary::-webkit-details-marker{display:none}
details[open]>summary .chev{transform:rotate(180deg)}
.hero{height:800px;overflow:hidden;position:relative;display:flex;background:var(--bg)}
/* rail */
.rail{width:80px;flex:none;background:var(--surface);border-right:1px solid var(--line);display:flex;flex-direction:column;align-items:center;padding:14px 0;gap:6px}
.rail .mark{width:40px;height:40px;border-radius:var(--radius);background:var(--text);color:var(--bg);display:grid;place-items:center;font-weight:700;font-size:13px;letter-spacing:.02em;margin-bottom:10px}
.rail a{width:64px;height:60px;border-radius:var(--radius);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:var(--muted);text-decoration:none;font-size:12px;font-weight:500}
.rail a.on{background:var(--surface-2);color:var(--text);font-weight:600}
.rail .spacer{flex:1}
/* buttons */
.btn{min-height:48px;padding:0 18px;border-radius:var(--radius);border:1px solid var(--line-strong);background:var(--surface);font-weight:600;font-size:15px;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap}
.btn-primary{min-height:56px;padding:0 28px;border:0;background:var(--primary);color:var(--on-primary);font-size:17px;font-weight:600;border-radius:var(--radius);display:inline-flex;align-items:center;justify-content:center;gap:10px;white-space:nowrap}
.btn-primary[disabled]{background:var(--disabled-bg);color:var(--disabled-text);cursor:not-allowed}
.icon-btn{width:48px;height:48px;border-radius:var(--radius);border:1px solid var(--line);background:var(--surface);display:grid;place-items:center;color:var(--text);flex:none}
.textbtn{min-height:44px;padding:0 4px;border:0;background:none;color:var(--text);font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:6px;text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:3px}
.badge{display:inline-flex;align-items:center;gap:8px;min-height:32px;padding:0 12px;border-radius:var(--radius);border:1px solid var(--line-strong);background:var(--surface-2);font-weight:600;font-size:14px;color:var(--text)}
.badge small{font-weight:400;color:var(--text-2);font-size:14px}
/* tones: never colour alone; each tone is used with an icon and a word */
.tone-bad{--tc:var(--bad);--tw:var(--bad-weak)}
.tone-warn{--tc:var(--warn);--tw:var(--warn-weak)}
.tone-ok{--tc:var(--ok);--tw:var(--ok-weak)}
.tone-info{--tc:var(--info);--tw:var(--info-weak)}
.tone-muted{--tc:var(--muted);--tw:var(--surface-2)}
/* breakdown list */
.bd{display:grid;grid-template-columns:1fr auto;column-gap:16px;font-size:14px}
.bd dt{color:var(--text-2);padding:7px 0}
.bd dd{text-align:right;padding:7px 0}
.bd dt small{color:var(--muted);font-size:13px}
.bd .tot{border-top:1px solid var(--line);font-weight:600;color:var(--text)}
.bd .miss{color:var(--info);font-weight:600}
/* note */
.note label.nl{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px;font-weight:600;font-size:15px}
.note .req{font-weight:500;font-size:14px;color:var(--text-2)}
.note textarea{width:100%;min-height:88px;resize:none;border:1px solid var(--line-strong);border-radius:var(--radius);background:var(--surface);padding:12px 14px;font-size:16px;line-height:1.45}
.note textarea::placeholder{color:var(--muted)}
.note textarea.focus{border-color:var(--focus);box-shadow:0 0 0 3px color-mix(in srgb,var(--focus) 28%,transparent)}
/* denominations */
.dgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding-top:10px}
.dgrid label{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 6px 0 12px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);font-weight:600}
.dgrid input{width:64px;height:40px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface-2);text-align:right;padding:0 10px;font-size:16px}
/* board */
.board{padding:40px 32px 32px;background:var(--bg);border-top:1px solid var(--line)}
.board h2{font-size:20px;font-weight:700;margin-bottom:4px}
.board > p{color:var(--text-2);margin-bottom:24px}
.frames{display:grid;gap:28px 32px;align-items:start}
.flabel{font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px}
.flabel span{font-weight:400;color:var(--text-2)}
.fwrap{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:var(--surface)}
.done-ico{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--ok-weak);color:var(--ok)}
.done-ico .i{width:30px;height:30px;stroke-width:2}
@media (max-width:767px){
 .hero{height:844px}
 .rail{display:none}
 .board{padding:24px 16px}
 .frames{grid-template-columns:1fr !important}
}
'''

RAIL = ''.join([
 '<nav class="rail" aria-label="Main"><div class="mark">WC</div>',
 f'<a class="on" href="#">{ic("reg")}Register</a>',
 f'<a href="#">{ic("orders")}Orders</a>',
 f'<a href="#">{ic("products")}Products</a>',
 f'<a href="#">{ic("customers")}Customers</a>',
 f'<a href="#">{ic("reports")}Reports</a>',
 '<div class="spacer"></div>',
 f'<a href="#">{ic("settings")}Settings</a></nav>'])

META = 'Front counter · Maria L. · 09:02 to 17:41'

S = {
 'short':   dict(counted='504.35', expected='519.35', diff='−$15.00', tone='bad', word='Short', icon='down', note='Counted twice. I think I gave $15 too much change on the 16:20 ord', note_req=True, can=True, keep='150.00', bank='354.35'),
 'over':    dict(counted='522.55', expected='519.35', diff='+$3.20', tone='warn', word='Over', icon='up', note='', note_req=True, can=False, reason='Add a note to close', keep='150.00', bank='372.55'),
 'balanced':dict(counted='519.35', expected='519.35', diff='$0.00', tone='ok', word='Balanced', icon='check', note='', note_req=False, can=True, keep='150.00', bank='369.35'),
 'first':   dict(counted='519.35', expected='369.35', diff='+$150.00', tone='info', word='Unchecked', icon='info', note='', note_req=False, can=True, keep='150.00', bank='369.35', first=True),
 'offline': dict(counted='519.35', expected='519.35', diff='$0.00', tone='ok', word='Balanced', icon='check', note='', note_req=False, can=True, keep='150.00', bank='369.35', offline=True),
 'empty':   dict(counted='', expected='519.35', diff='—', tone='muted', word='Not counted', icon='dash', note='', note_req=False, can=False, reason='Enter the counted cash', keep='150.00', bank='—'),
}
def money(v): return '—' if v in ('', '—') else '$' + v

def req_text(s):
    if s.get('first'): return 'Optional'
    if s['tone']=='bad': return 'Required: drawer is short'
    if s['tone']=='warn': return 'Required: drawer is over'
    if s['tone']=='muted': return ''
    return 'Optional'

def note(s, focus=False, rows=None):
    ph = 'What happened? e.g. wrong change on an order' if s['note_req'] else 'Anything the next shift should know'
    return (f'<div class="note"><label class="nl" for="n">Note <span class="req">{req_text(s)}</span></label>'
            f'<textarea class="{"focus" if focus else ""}" placeholder="{ph}">{s["note"]}</textarea></div>')

def breakdown(s):
    fl = ('<dt>Opening float</dt><dd class="miss">Not recorded</dd>' if s.get('first')
          else '<dt>Opening float</dt><dd>$150.00</dd>')
    return ('<dl class="bd">' + fl +
      '<dt>Cash sales <small>31 orders</small></dt><dd>+$412.35</dd>'
      '<dt>Cash refunds <small>1</small></dt><dd>−$18.00</dd>'
      '<dt>Pay in</dt><dd>+$20.00</dd>'
      '<dt>Pay out</dt><dd>−$45.00</dd>'
      f'<dt class="tot">{"Before opening float" if s.get("first") else "Expected in drawer"}</dt><dd class="tot">${s["expected"]}</dd></dl>')

OTHER = ('<dl class="bd"><dt>Card <small>52</small></dt><dd>$1,284.60</dd>'
         '<dt>Gift card <small>2</small></dt><dd>$60.00</dd>'
         '<dt>Store credit <small>1</small></dt><dd>$25.00</dd></dl>')

def denoms():
    d = ['$100','$50','$20','$10','$5','$1','25¢','10¢','5¢','1¢']
    return '<div class="dgrid">' + ''.join(f'<label>{x}<input inputmode="numeric" placeholder="0"></label>' for x in d) + '</div>'

def offline_badge(): return f'<span class="badge">{ic("cloudoff")}Offline <small>saves on this device</small></span>'

def page(title, css, body):
    return f'''<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>{TOKENS}{BASE}{css}</style></head>
<body>
{body}
</body></html>
'''

def board(intro, frames, cols, labels):
    out = [f'<section class="board"><h2>States</h2><p>{intro}</p><div class="frames" style="grid-template-columns:{cols}">']
    for key, html in frames:
        t, sub = labels[key]
        out.append(f'<div><div class="flabel">{t} <span>· {sub}</span></div><div class="fwrap">{html}</div></div>')
    out.append('</div></section>')
    return ''.join(out)

LABELS = {
 'over':('Drawer over','counted $522.55, note missing so Close is disabled'),
 'balanced':('Drawer balanced','counted $519.35, note optional, one tap to close'),
 'first':('First-ever close','no opening float on record'),
 'offline':('Offline','counting and closing still work'),
 'empty':('Nothing counted yet','Close disabled with its reason'),
 'closed':('Closed','confirmation with the closure figures'),
}
