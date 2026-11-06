# v3 · Paying with: changes

No token changes; no token value in tokens.css is altered.

## What this variant changes

- Q1: no Selected mark on any row. A first SettingsSection "Paying with" (description "Card payments on this till go to this reader.") holds one DeviceRow for the chosen reader, whichever section it is in, with its section on the identifiers line ("Smart reader · High Street", "Tap to Pay on iPhone", "Bluetooth · serial") and a ghost Change action (none under a store lock). The Smart readers description drops "This till pays with the selected one."
- Q2: tile order Cash, Card, Tap to Pay on iPhone, Stripe Terminal, Mollie Terminal, SumUp Terminal (the Stripe gateway's place in the store order). Stripe Terminal's help line carries the reader name.
- Q3: one Tap to Pay tile; the second provider's Tap to Pay row (P5b) has no Set up and the one state line "Tap to Pay is set up with Stripe on this phone" (`--muted-foreground`).
- Q4: iOS full-screen sheet; Android Set up opens the SDK's own screens with no sheet of ours.

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
- new: "Paying with" section: SettingsSection + DeviceRow, no new tokens (`--foreground`, `--muted-foreground`, `--ok` tint, ghost Button `--muted-foreground`).
