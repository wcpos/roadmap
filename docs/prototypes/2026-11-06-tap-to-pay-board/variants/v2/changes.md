# v2 · The state line carries it: changes

No token changes; no token value in tokens.css is altered.

## What this variant changes

- Q1: "Selected" follows the state word on the DeviceRow state line ("Online · Selected", "Ready · Selected", "Connected · 82% · Selected") on every section, Smart readers included; the Selected Chip leaves the action slot, which keeps Connect / Disconnect / Set up / Use this reader.
- Q2: tile order Tap to Pay on iPhone, Cash, Card, Stripe Terminal, Mollie Terminal, SumUp Terminal. Stripe Terminal's help line carries the selected smart reader's name.
- Q3: one Tap to Pay tile, owned by the provider set up last, named on its help line ("SumUp"); P5b shows the other provider's row on the Card readers page with Use this reader.
- Q4: the same full-screen sheet on iOS and Android, platform words and symbol swapped; Android's Continue then opens the SDK's own screens.

## Elements read (shared by all three variants)

- Settings bar, page, section rule: `--background`, `--foreground`, `--muted-foreground` (intro, help), `--border` + `--hairline-width` + `--shape-rule-style` (section rule, row hairlines).
- DeviceRow: icon square `--muted` / `--muted-foreground` (muted), `color-mix(--ok 15%)` / `--ok` (ok, = `bg-ok/15`); tag Badge `--muted` / `--muted-foreground`; state dot `--ok`, `--muted-foreground`, `--warning` (iOS below 17.6); identifiers `--muted-foreground`.
- Buttons: primary `--primary` / `--primary-foreground`; outline `--card` / `--border` / `--foreground`; ghost `--muted-foreground`; pressed `--accent`; radius `--shape-radius-control` (commit: `--shape-radius-commit`); weights `--type-w-ui`, `--type-w-strong`, `--type-w-commit`.
- Chip `on`: `--selected` (fill and border), `--selected-foreground`, radius `--shape-radius-chip`, border `--shape-ctl-border`.
- Progress (S3): track `--muted`, bar `--primary`.
- Pay sheet: Tile `--card` / `--border`, selected `--primary` border + `--muted` fill, dimmed opacity .45 (PressableSurface), radius `--shape-radius-tile`; segmented control `--card` / `--border` / `--muted`; offline line `--warning-text`; P6 Tap to Pay help line `--warning-text`; P3 notice `--muted` (the tender pane's existing pending-notice pattern) and its link `--primary`.
- Tablet rail: `--rail`, `--rail-border`, `--rail-foreground`, `--rail-selected`, `--rail-selected-foreground`.
- Terminal moment (P7): step segments `--border` / `--primary`, indeterminate sweep `--border` / `--primary`.
- Dark mode: the `body[data-theme="dark"]` block of tokens.css restated verbatim under `html[data-theme="dark"] body` (no value changed).

## Element changes (no token involved)

- Tap to Pay row icon (This phone): the `wave.3.right.circle` symbol (Android: the contactless arcs) in place of `icon="card"`.
- Pay sheet tile: the "Works offline" badge sits on the help-line slot under the title (the brief's own description of the tile), not in the top-right corner of the 2026-10 anchor, so the German "Funktioniert offline" fits a 2-column phone tile.
- Type: native base 16 px (brief); the ladder's ratios kept (`text-sm` = 16 × 0.929, `text-lg` = 16 × 1.143); 12 px floor.
- "Connect a reader" drawn `outline` throughout, because every state has a chosen reader (code draws it primary while no Bluetooth reader is held).

## new:

- new: awareness sheet (S6, full screen): `--background`, symbol `--primary`, title `--foreground`, body and admin line `--muted-foreground`, one Continue `--primary` / `--primary-foreground`. Body text stands in for Apple's published copy block.
- new: SDK stand-in frame (S6 Android): dashed `--border`, `--muted-foreground`. Not a design; it marks where the provider SDK draws its own screens.
- new: terminal moment "Getting ready" step for a Tap to Pay leg (P7): eyebrow with the symbol, `--foreground` amount, segments `--border` / `--primary`.
- new: state-line Selected word (StatusBadge label suffix): `--selected-foreground` at `--type-w-strong`, 12 px, after a `·` in `--muted-foreground`. Replaces the Chip `on` in the action slot on Smart readers rows too.
