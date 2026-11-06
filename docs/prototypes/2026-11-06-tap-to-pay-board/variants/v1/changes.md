# v1 · Rows as they are: changes

No token changes; no token value in tokens.css is altered.

## What this variant changes

- Q1: the read-only Selected Chip (`on`) sits first in the DeviceRow action slot on the This phone row and on Bluetooth rows, beside Disconnect / Connect, exactly as on Smart readers rows. Reads `--selected`, `--selected-foreground`, `--shape-radius-chip`.
- Round 1: on the phone the action slot stays on the row's own line, right-aligned after the body (`shrink-0 flex-row items-center justify-end gap-2`); only when the group cannot fit at 390 does the whole group wrap under the body, still right-aligned. A row with Selected is the same height as one without. The Android pre-alert row keeps its line above Cancel / Continue.
- Q2: tile order Cash, Tap to Pay on iPhone, Card, Stripe Terminal, Mollie Terminal, SumUp Terminal. Stripe Terminal's help line carries the selected smart reader's name ("Counter 1", `--muted-foreground`).
- Q3: one Tap to Pay tile per provider; help line "Stripe" / "SumUp" at 14 px in `--muted-foreground` (round 1; other help lines stay 12 px).
- Round 1, P4: checkout's reader line under the grid, "Counter 1 · Online" (text-sm `--foreground`, separator `--muted-foreground`, dot `--ok`, reader glyph `--muted-foreground`) with a ghost Change (`--muted-foreground`, opens Settings › Card readers), then the commit "Send 18,00 £ to Counter 1".
- Round 1: tile grid row gap and column gap both 8 px, phone and tablet.
- Q4: iOS full-screen sheet; Android: one pre-alert line grown under the Tap to Pay row (`--foreground` text, `--muted-foreground` info glyph) with Cancel (ghost) and Continue (primary) in the action slot, then the SDK's own screens.

## Elements read (shared by all three variants)

- Settings bar, page, section rule: `--background`, `--foreground`, `--muted-foreground` (intro, help), `--border` + `--hairline-width` + `--shape-rule-style` (section rule, row hairlines).
- DeviceRow: icon square `--muted` / `--muted-foreground` (muted), `color-mix(--ok 15%)` / `--ok` (ok, = `bg-ok/15`); tag Badge `--muted` / `--muted-foreground`; state dot `--ok`, `--muted-foreground`, `--warning` (iOS below 17.6); identifiers `--muted-foreground`.
- Buttons: primary `--primary` / `--primary-foreground`; outline `--card` / `--border` / `--foreground`; ghost `--muted-foreground`; pressed `--accent`; radius `--shape-radius-control` (commit: `--shape-radius-commit`); weights `--type-w-ui`, `--type-w-strong`, `--type-w-commit`.
- Chip `on`: `--selected` (fill and border), `--selected-foreground`, radius `--shape-radius-chip`, border `--shape-ctl-border`.
- Progress (S3): track `--muted`, bar `--primary`.
- Pay sheet: Tile `--card` / `--border`, selected `--primary` border + `--muted` fill, radius `--shape-radius-tile`; segmented control `--card` / `--border` / `--muted`; offline line `--warning-text`; P3 notice `--muted` (the tender pane's existing pending-notice pattern) and its link `--primary`.
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
- new: Android pre-alert line inside the Tap to Pay DeviceRow (S6): text `--foreground` at text-sm, glyph `--muted-foreground`; uses DeviceRow's existing children slot.

## Round 2

- DeviceRow (phone and tablet): the name and the identifier line are never truncated. The row body takes its natural width; when name + badge + action group cannot share the line, the whole action group wraps under the body, right-aligned. The name and identifiers wrap rather than clip. No tokens involved.
- P4 (phone and tablet): tapping Stripe Terminal opens its keypad pane under the tile grid: the "Stripe Terminal" caption, the amount 18,00 £ prefilled with the balance (tabular), a 3 × 4 keypad (1–9, 00, 0, backspace) with 56 px keys, checkout's reader line "Counter 1 · Online" with ghost Change, then the commit "Send 18,00 £ to Counter 1". On the tablet the pane is two columns, as in the chosen tablet pane: figure, reader line, keypad and commit on the left; Balance / This payment / After this on the right.
- new: keypad key: `--muted` fill, `--foreground` digits, `--accent` pressed, radius `--shape-radius-control`, 56 px high. Balance rows (tablet): `--muted-foreground` keys, `--foreground` values at `--type-w-strong`, `--border` hairlines.
- Tablet light frames added for S4, S5, P4 (keypad pane) and P5, in the same layout as the S1 / P1 tablet frames.

## Round 3

- P4 (phone and tablet): once Stripe Terminal is tapped the tile grid collapses to the selected tile with a ghost "Change tender" beside it (the button names its object, so it does not collide with the reader line's Change); then the amount, keypad, reader line and Send. Phone P4 fits 844 px; Send ends at 721 px. P2 / P3 stay as the full grid.
- Type: every reading line is 14 px: DeviceRow state lines, the Android pre-alert line, section descriptions and help lines, tile help lines and the "Works offline" badge, the offline line, the TOTAL / tender eyebrows, P7 step labels, the tablet balance rows. 12 px stays only on the provider tag badge and the frame captions. Tile help lines and the offline badge wrap rather than clamp ("Funktioniert offline" wraps to two lines in the German frame).
- Tablet light frames added: S3 (preparing), S6 (the awareness sheet as a centred sheet over the page, `--scrim` behind, `--background` sheet, `--border` hairline, 12 px radius), P6 (offline), P7 (terminal moment as a centred 440 px column).
- new: tablet awareness sheet container: `--scrim`, `--background`, `--border`.

## Round 4

- P4 (phone and tablet): with the keypad pane open, the header total becomes one line, "Total 18,00 £ · 1 item · Guest" (14 px, `--muted-foreground`, tabular), with Split kept beside it; the editable payment amount is the only large figure. P7 already has one figure. Tablet Balance / This payment / After this rows unchanged.
- P4 collapsed row: the selected tile plus a ghost "Other tenders" (was "Change tender"); the caption says the full grid, Tap to Pay included, is one tap back. No other tile in the row. Phone Send now ends at 679 px of 844.
- Tablet light frames added: S2 (cashier), S7 (store lock, update iOS), P2 (the awareness sheet centred over the pay sheet, same sheet as the S6 tablet frame), P3 (the one-line notice with the Card readers link).
- No new tokens this round.

## Round 5

- Unavailable tenders fold under the grid as tender-pane.tsx does; no dimmed tiles.
- P4 (phone and tablet): one chip row above the keypad, "Full 18,00 £", selected (Chip `on`: `--selected`, `--selected-foreground`, `--shape-radius-chip`, 44 px) while the amount equals the balance; unselected it reads `--chip` / `--chip-border`. Phone Send ends at 735 px of 844.
- S6 iOS phone, S6 tablet and P2 tablet captions carry: "Body text is a stand-in; Apple's approved copy from the Tap to Pay Marketing Toolkit replaces it before build." Drawing unchanged; the Android SDK stand-in unchanged.

## Delivery corrections

- Unavailable tenders fold under the grid as tender-pane.tsx does; no dimmed tiles. P1, P2, P3, P5 (phone and tablet) hold Cash, Tap to Pay on iPhone, Card, Stripe Terminal, SumUp Terminal, with "Mollie Terminal is not available right now ⌄" under the grid (German: "Mollie Terminal ist gerade nicht verfügbar"). P6 holds Cash, Tap to Pay on iPhone, Card, with "3 not available right now ⌃" drawn open: Stripe, Mollie and SumUp Terminal, each "Needs the internet". P4's collapsed view shows only the selected tile; the fold returns with the grid behind Other tenders.
- Keypad matches the system Keypad: 1–9, then the decimal separator "," (this store), 0, backspace. No "00", no "C".
- The single-provider Tap to Pay tile's help line reads "This device" ("Dieses Gerät" in the German frame) in P1, P2, P4 and P6, phone and tablet: 14 px `--muted-foreground`, as Stripe Terminal's "Counter 1". P3 keeps "Not set up"; P5 keeps "Stripe" / "SumUp".

## Delivered

**No token changes.** tokens.css is linked unaltered; dark mode restates its `body[data-theme="dark"]` block verbatim under `html[data-theme="dark"] body`.

### Elements and the tokens they read

- Page, settings bar, sections: `--background`, `--foreground`; intro, section descriptions and help lines `--muted-foreground` (14 px); section rule and row hairlines `--border`, `--hairline-width`, `--shape-rule-style`.
- DeviceRow: icon square `--muted` / `--muted-foreground` (muted) or `color-mix(--ok 15%)` / `--ok` (ok); provider tag Badge `--muted` / `--muted-foreground` (12 px); identifiers `--muted-foreground`; state line 14 px, dot `--ok`, `--muted-foreground` or `--warning`. Name and identifiers never truncate; the whole action group wraps under the body, right-aligned, when it cannot share the line.
- Selected Chip `on` (action slot, first): `--selected`, `--selected-foreground`, `--shape-radius-chip`, `--shape-ctl-border`, 44 px.
- Buttons, 44 px: primary `--primary` / `--primary-foreground`; outline `--card` / `--border` / `--foreground`; ghost `--muted-foreground`; pressed `--accent`; radius `--shape-radius-control`; commit radius `--shape-radius-commit`, weight `--type-w-commit`.
- Progress (S3): track `--muted`, bar `--primary`.
- Android pre-alert line (S6): `--foreground` text, `--muted-foreground` glyph, 14 px.
- Pay sheet: Tile `--card` / `--border`, radius `--shape-radius-tile`; selected `--primary` border + `--muted` fill; no dimmed tiles; help lines 14 px `--muted-foreground` ("This device", "Counter 1", "Stripe" / "SumUp", reasons); "Works offline" badge `--muted` / `--muted-foreground` 14 px; segmented control `--card` / `--border` / `--muted`; offline line `--warning-text`; P3 notice `--muted` with link `--primary`.
- Unavailable tenders fold (tender-pane.tsx): a centred ghost line in `--muted-foreground` with its chevron; open, each row is `--muted` (rounded-md, p-2) with the method icon `--muted-foreground`, the title 14 px `--foreground`, the reason 14 px `--muted-foreground`.
- P4 keypad pane: compact total line `--muted-foreground` 14 px; tender caption `--muted-foreground`; amount `--foreground` 40 px tabular (the one large figure); "Full 18,00 £" Chip `on` (`--selected`, `--selected-foreground`; off: `--chip`, `--chip-border`); keys `--muted` / `--foreground`, pressed `--accent`, radius `--shape-radius-control`, 56 px; reader line `--foreground`, separator and glyph `--muted-foreground`, dot `--ok`, ghost Change; "Other tenders" ghost; Send primary commit. Tablet balance rows `--muted-foreground` / `--foreground` at `--type-w-strong`, `--border` hairlines.
- Tablet rail: `--rail`, `--rail-border`, `--rail-foreground`, `--rail-selected`, `--rail-selected-foreground`.
- Terminal moment (P7): step segments and sweep `--border` / `--primary`; amount `--foreground`.

### new:

- new: awareness sheet (S6, full screen): `--background`, symbol `--primary`, title `--foreground`, body and admin line `--muted-foreground`, one Continue `--primary` / `--primary-foreground`. Body text stands in for Apple's published copy block.
- new: SDK stand-in frame (S6 Android): dashed `--border`, `--muted-foreground`. Not a design; it marks where the provider SDK draws its own screens.
- new: terminal moment "Getting ready" step for a Tap to Pay leg (P7): eyebrow with the symbol, `--foreground` amount, segments `--border` / `--primary`.
- new: Android pre-alert line inside the Tap to Pay DeviceRow (S6): text `--foreground` at text-sm, glyph `--muted-foreground`; uses DeviceRow's existing children slot.
- new: keypad key: `--muted` fill, `--foreground` digits, `--accent` pressed, radius `--shape-radius-control`, 56 px high. Balance rows (tablet): `--muted-foreground` keys, `--foreground` values at `--type-w-strong`, `--border` hairlines.
- new: tablet awareness sheet container: `--scrim`, `--background`, `--border`.
