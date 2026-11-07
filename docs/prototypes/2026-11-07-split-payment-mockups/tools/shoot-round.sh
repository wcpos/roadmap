#!/usr/bin/env bash
# Shoot every variant for one round: the entry state at four widths/themes, the other states as
# desktop-light frames stitched into one contact sheet per variant, plus phone shots of s2 and s5
# and a dark shot of s5. Usage: bash tools/shoot-round.sh rounds/r0 [v1 v2 v3]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROUND="$ROOT/$1"; shift
VARIANTS=("$@"); [ ${#VARIANTS[@]} -eq 0 ] && VARIANTS=(v1 v2 v3)
SHOOT=~/.claude/skills/mockup/scripts/shoot.sh
SHOTS="$ROUND/shots"; TMP="$ROUND/.tmp"
mkdir -p "$SHOTS" "$TMP"
# shoot.sh writes its dark copy beside the SHOTS, so the page's relative tokens link must resolve from there:
# `tokens.css` for an entry page copied into $SHOTS, `../tokens.css` for a state page copied into $TMP/$v.
cp "$ROOT/variants/tokens.css" "$SHOTS/tokens.css"; cp "$ROOT/variants/tokens.css" "$TMP/tokens.css"
for v in "${VARIANTS[@]}"; do
  [ -f "$ROOT/variants/$v.html" ] || { echo "no $v.html"; continue; }
  bash "$SHOOT" "$ROOT/variants/$v.html" "$SHOTS" >/dev/null
  for s in "$ROOT/variants/$v"/s*.html; do
    [ -f "$s" ] || continue
    n="$(basename "${s%.html}")"
    bash "$SHOOT" "$s" "$TMP/$v" >/dev/null
    cp "$TMP/$v/$n-desktop-light.png" "$TMP/$v-$n-desktop-light.png"
    case "$n" in
      s2|s5) cp "$TMP/$v/$n-phone-light.png" "$SHOTS/$v-$n-phone-light.png" ;;
    esac
    [ "$n" = s5 ] && cp "$TMP/$v/$n-desktop-dark.png" "$SHOTS/$v-s5-desktop-dark.png"
  done
  if [ -f "$ROOT/variants/$v/system.html" ]; then
    bash "$SHOOT" "$ROOT/variants/$v/system.html" "$TMP/$v" >/dev/null
    cp "$TMP/$v/system-desktop-light.png" "$SHOTS/$v-system-desktop-light.png"
    cp "$TMP/$v/system-desktop-dark.png" "$SHOTS/$v-system-desktop-dark.png"
  fi
  python3 - "$v" "$TMP" "$SHOTS" <<'EOF'
import sys, glob, os
from PIL import Image, ImageDraw
v, tmp, out = sys.argv[1:4]
files = sorted(glob.glob(f"{tmp}/{v}-s*-desktop-light.png"))
if not files: sys.exit(0)
ims = [Image.open(f) for f in files]
w, h = ims[0].size
scale = 0.5
tw, th = int(w*scale), int(h*scale)
cols = 2; rows = (len(ims)+cols-1)//cols
pad = 16; label = 22
sheet = Image.new("RGB", (cols*tw + (cols+1)*pad, rows*(th+label) + (rows+1)*pad), (235,235,238))
d = ImageDraw.Draw(sheet)
for i,(im,f) in enumerate(zip(ims,files)):
    r,c = divmod(i,cols)
    x = pad + c*(tw+pad); y = pad + r*(th+label+pad)
    d.text((x, y+2), os.path.basename(f).replace(f"{v}-","").replace("-desktop-light.png",""), fill=(60,60,60))
    sheet.paste(im.resize((tw,th), Image.LANCZOS), (x, y+label))
sheet.save(f"{out}/{v}-states-desktop-light.png")
print("sheet", v, len(ims))
EOF
done
rm -rf "$TMP" "$SHOTS/tokens.css"
ls -1 "$SHOTS"
