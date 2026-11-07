#!/usr/bin/env python3
"""Build the static delivery page for the split-payment climb.

Usage: build-index.py <picked variant e.g. v1> <final round dir e.g. rounds/r3> <rejected variants comma-separated e.g. v3,v2>
Writes index.html in the climb root. No JavaScript; every image is a relative path to the round's shots or the anchors.
"""
import html, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
pick, final, rejected = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
FINAL = ROOT / final

def img(path, label=''):
    rel = Path(path).resolve().relative_to(ROOT) if Path(path).is_absolute() else path
    return f'<figure><img src="{rel}" alt="{html.escape(label)}" loading="lazy"><figcaption>{html.escape(label)}</figcaption></figure>'

def shots_of(v, rnd):
    d = ROOT / rnd / 'shots'
    return {p.name: p for p in sorted(d.glob(f'{v}-*.png'))}

def md_table_to_html(md):
    out, rows = [], [l for l in md.splitlines() if l.startswith('|')]
    if not rows: return ''
    out.append('<table>')
    for i, r in enumerate(rows):
        cells = [c.strip() for c in r.strip('|').split('|')]
        if all(set(c) <= set('-: ') for c in cells): continue
        tag = 'th' if i == 0 else 'td'
        out.append('<tr>' + ''.join(f'<{tag}>{html.escape(c)}</{tag}>' for c in cells) + '</tr>')
    out.append('</table>')
    return '\n'.join(out)

def md_to_html(md):
    """Minimal: headings, tables, bullet lists, paragraphs, inline code and bold."""
    blocks, buf, out = [], [], []
    def flush():
        if buf: blocks.append('\n'.join(buf)); buf.clear()
    for line in md.splitlines():
        if line.startswith('|') or line.startswith('- ') or line.startswith('#') or not line.strip():
            flush()
            if line.strip(): blocks.append(line)
        else:
            buf.append(line)
    flush()
    merged, i = [], 0
    while i < len(blocks):
        b = blocks[i]
        if b.startswith('|') or b.startswith('- '):
            kind = b[0]; group = [b]; i += 1
            while i < len(blocks) and blocks[i].startswith(kind): group.append(blocks[i]); i += 1
            merged.append('\n'.join(group))
        else:
            merged.append(b); i += 1
    def inline(s):
        s = html.escape(s)
        s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
        s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
        return s
    for b in merged:
        if b.startswith('|'): out.append(md_table_to_html(b))
        elif b.startswith('- '): out.append('<ul>' + ''.join(f'<li>{inline(l[2:])}</li>' for l in b.splitlines()) + '</ul>')
        elif b.startswith('#'):
            n = len(b) - len(b.lstrip('#')); out.append(f'<h{min(n+1,4)}>{inline(b.lstrip("# "))}</h{min(n+1,4)}>')
        else: out.append(f'<p>{inline(b)}</p>')
    return '\n'.join(out)

brief = (ROOT / 'brief.md').read_text()
rounds = (ROOT / 'rounds.md').read_text()
catalogue = brief[brief.index('## Scenario catalogue'):brief.index('## States every variant')]
flows = {v: (ROOT / 'variants' / v / 'flow.md').read_text() for v in [pick] + rejected if (ROOT / 'variants' / v / 'flow.md').exists()}
changes = (ROOT / 'variants' / pick / 'changes.md').read_text()

S = shots_of(pick, final)
def pick_shot(name): return S.get(f'{pick}-{name}.png')

parts = []
parts.append(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Split payment — hill climb</title>
<style>
:root{{--bg:#f5f5f7;--fg:#1a1a1e;--mut:#666;--line:#ddd;--card:#fff}}
@media (prefers-color-scheme:dark){{:root{{--bg:#17171a;--fg:#ececf0;--mut:#9a9aa3;--line:#333;--card:#222226}}}}
body{{margin:0;padding:24px;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,system-ui,sans-serif;max-width:1500px;margin:auto}}
h1{{font-size:28px;margin:0 0 4px}} h2{{font-size:20px;margin:40px 0 12px;border-top:1px solid var(--line);padding-top:24px}} h3{{font-size:16px;margin:24px 0 8px}}
.sub{{color:var(--mut);margin:0 0 16px}}
.row{{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}}
figure{{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px;max-width:100%}}
figure img{{display:block;max-width:100%;height:auto;border-radius:4px}}
figcaption{{font-size:12px;color:var(--mut);margin-top:6px}}
.desk img{{width:900px}} .phone img{{width:280px}} .sheet img{{width:1000px}} .small img{{width:440px}}
table{{border-collapse:collapse;font-size:13px;margin:8px 0;max-width:100%}} th,td{{border:1px solid var(--line);padding:4px 8px;text-align:left;vertical-align:top}} th{{background:var(--card)}}
code{{font-family:ui-monospace,Menlo,monospace;font-size:12px;background:var(--card);padding:1px 4px;border-radius:3px}}
details{{margin:8px 0}} summary{{cursor:pointer;font-weight:600}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}} .pair figure img{{width:100%}}
</style></head><body>
<h1>Split payment — hill climb, 2026-11-07</h1>
<p class="sub">Picked: <strong>{pick.upper()}</strong> · final round {html.escape(final)} · rejected {", ".join(r.upper() for r in rejected)} · brief in <code>brief.md</code>, every judge table in <code>rounds.md</code></p>''')

parts.append(f'<h2>1. The pick — {pick.upper()}</h2>')
parts.append('<div class="row">')
for n, cls in [('desktop-light', 'desk'), ('phone-light', 'phone'), ('desktop-dark', 'desk'), ('phone-dark', 'phone')]:
    p = pick_shot(n)
    if p: parts.append(f'<div class="{cls}">{img(p, f"{pick} · entry state · {n}")}</div>')
parts.append('</div>')

parts.append('<h3>Every state (desktop, light)</h3><div class="row sheet">')
p = pick_shot('states-desktop-light')
if p: parts.append(img(p, 'states s2…: see the brief\'s shot list'))
parts.append('</div><div class="row">')
for n in ['s2-phone-light', 's5-phone-light', 's5-desktop-dark']:
    p = pick_shot(n)
    if p: parts.append(f'<div class="{"phone" if "phone" in n else "desk"}">{img(p, f"{pick} · {n}")}</div>')
parts.append('</div>')

parts.append('<h3>System sheet (siblings that read the same tokens, resting beside picked)</h3><div class="row sheet">')
for n in ['system-desktop-light', 'system-desktop-dark']:
    p = pick_shot(n)
    if p: parts.append(img(p, f'{pick} · {n}'))
parts.append('</div>')

parts.append('<h3>What changes in the system</h3>' + md_to_html(changes))

parts.append('<h2>2. Scenario catalogue and the picked flow for each</h2>')
parts.append(md_to_html(catalogue))
for v, f in flows.items():
    parts.append(f'<details {"open" if v == pick else ""}><summary>{v.upper()} flows{" (picked)" if v == pick else " (rejected)"}</summary>{md_to_html(f)}</details>')

parts.append('<h2>3. Before / after, one pair per change</h2>')
base = ROOT / 'anchors'
pairs = [
    (base / 'baseline-split-even-desktop-light.png', pick_shot('desktop-light'), 'Split opened: the four-tab sub-view with a ring → ' + ('the bill is the picker, the keypad pane stays' if pick == 'v1' else 'the tabs take the money directly, no ring')),
    (base / 'baseline-split-open-tablet-light.png', pick_shot('states-desktop-light'), 'One plan for the whole bill → every payment defined its own way (items, part of a line, items + amount, fixed, percent, the rest N ways)'),
]
for a, b, label in pairs:
    if a and b and Path(a).exists():
        parts.append(f'<p>{html.escape(label)}</p><div class="pair">{img(a, "before")}{img(b, "after")}</div>')

LAST_ROUND_OF = {'v3': 'rounds/r3', 'v2': 'rounds/r1'}  # the round each rejected variant was last shot in
for r in rejected:
    rnd = final if shots_of(r, final) else LAST_ROUND_OF.get(r, 'rounds/r0')
    rs = shots_of(r, rnd)
    parts.append(f'<h2>Rejected — {r.upper()} (as last shot, {html.escape(rnd)})</h2><div class="row">')
    for n, cls in [('desktop-light', 'desk'), ('phone-light', 'phone'), ('states-desktop-light', 'sheet')]:
        p = rs.get(f'{r}-{n}.png')
        if p: parts.append(f'<div class="{cls}">{img(p, f"{r} · {n}")}</div>')
    parts.append('</div>')

parts.append('<h2>Anchors (shot once)</h2><div class="row small">')
for p in sorted(base.glob('*.png')): parts.append(img(p, p.name))
parts.append('</div>')

parts.append('<h2>Rounds</h2>' + md_to_html(rounds))
parts.append('</body></html>')
(ROOT / 'index.html').write_text('\n'.join(parts))
print('wrote', ROOT / 'index.html')
