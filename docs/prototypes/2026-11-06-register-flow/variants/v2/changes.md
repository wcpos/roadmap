# V2 · The figure leads: changes

## Token values
None. The system sheet (`v2/system.html`) draws the amount's siblings in light and dark from the unchanged tokens.

## Elements that change which token they read
- Editable amounts (Open register float, Pay in, Pay out, Close register count): they keep the FieldBox boundary as it is today (`.field`: `--chip-border` at `--shape-ctl-border`, `--card`, `--radius-field`; `.open` = `--ring` border and ring while focused). Only the numerals inside change, from the field's 22 px text to AmountFigure `hero` (`text-amt` = `--text-amt`, bold, tabular; caret `--ring`); the frame grows to 64 px tall. An empty amount shows its placeholder `0.00` in `--muted-foreground` at regular weight.
- Read-only figures stay unframed AmountFigure `hero`: the panel's "In the drawer", the closed moment's variance and the Stat strip. The frame tells editable from display.
- Cashier-facing small text in the register family reads `--text-base` (14 px) instead of `--text-xs` (12 px). That covers pane header sub-lines, field labels, the reason beside a disabled button, the note rule, ladder details, tile labels, notice details, the cart bar's store line and the register picker's state line. The board's own captions and the Closures table head stay 12 px.
- Register panel, "In the drawer": the figure tile (`--card`, `--border`, `--radius-tile`, 22 px) becomes AmountFigure `hero` (`--text-amt`) with no surface; "Session sales" drops from a tile to a `--muted-foreground` line.
- Register panel, Pay in · Pay out · No sale: Tile (`--card`, `--border`, `--radius-tile`, `min-h-tile`) becomes Button `outline` (`--card`, `--border`, `--radius-control`).
- Close register, Expected and the difference: two separate surfaces become one block (`--border`, `--radius-tile`) whose lower half is the difference band: Short `--bad-bg`/`--bad`, Over `--ok-bg`/`--ok` (as today), Exact `--muted`/`--muted-foreground`.
- Close register footer: "Close without printing" Button `ghost` becomes "Close register" Button `outline` (`--card`, `--border`) at `lg` height beside the primary.
- Closure written and the Closures document: the variance leads as AmountFigure `hero` `tone="bad"` (`--text-amt`, `--bad`) with its eyebrow; Counted and Expected stay as two figure tiles (`--card`, `--border`, `--radius-tile`); "Closure paper" is the existing fold (`--border`, `--radius-tile`) and is open on the written moment.
- Closure written footer: Print closure and Done sit in one row (`lg` primary, `lg` outline) instead of stacked.
- Closures room: adds the Stat strip (`text-lg` semibold figures, caption labels `--muted-foreground`, `border-b` `--border`) and Tabs (`border-b` `--border`; active underline `--primary`). The rows gain a Difference column whose figure reads `--bad` (short) or `--ok` (over) next to a word badge; on the phone, Expected · Counted · Difference is a labelled caption line (`--muted-foreground`, values `--foreground`).

## Not in the repo today
- new: AmountFigure `hero` numerals inside a FieldBox (64 px tall) for every editable money amount in the register family.
- new: the difference band's Exact state on `--muted` with `--muted-foreground` and a check icon.
- new: Pay out over the limit shows the limit as a `--warning-text` line beside the button, and the button reads "Continue to approval".
- new: the Keypad (key face `bg-muted rounded-lg`, `text-xl` semibold) under every money amount, with 56 px rows on the tablet and 48 px on the phone. The component's own steps are `h-tile` (64) or `shrink` (`min-h-ctl` and up).
  - Ruled (Paul, 2026-11-06, "as you recommend"): on Close register the keypad collapses once the amount is entered and reopens on tapping the amount; collapsed, a `--muted-foreground` line under the field says "Tap the amount to change it". The other amounts (float, Pay in, Pay out) keep the keypad open: the ruling named the count.
- Round 3: the Closures scope row is a grid (four columns on desktop, two on the phone) and its date filter reads as a date range with a calendar glyph; the register panel's Expected ledger has an unfolded frame per layout; "Leave in drawer $…" and "To bank $…" each stay on one line.
- new: an `outline` Button 56 px tall (`h-14`) with its icon over its label (the three verbs in the panel). Button `lg` is `h-14` with `rounded-commit`; this one keeps `rounded-control`.
- new: Chip at 44 px tall (`h-ctl`) in a fixed grid of rows with 8 px gaps (reason chips, three per row; float chips, two per row on the tablet and one on the phone), against the Chip's own 32 px.
- new: the Stat strip's lead figure ("Net difference") at 24 px bold, one step above the other stats' `text-lg`.
