# V3 — Four tabs, each composing on the next payment

No token changes.

System sheet: `system.html`; the Split chip `on` reads the real Chip on-state (`--selected` / `--selected-foreground`), no token change. The sheet draws the Item tab rows and the `Towards the rest` row with the subject pages' own classes.

## The idea

Today's structure stays: Even / Amount / Percent / Item. Each tab finishes what a guest asks for in one visit and takes the money itself, in the ruled order.

## Pane order (round 2, final)

- Sub-view: caption → hero (with its hint line) → method row → plan strip → tabs → tab content → commit.
- Keypad pane: label → hero (+hint) → method row → plan strip → helpers → keypad → commit.

## Elements changed

- **Ring: removed (round 2).** The sub-view header is caption + hero + hint, and the strip carries the plan.
- **Plan strip (round 2: under the method row):** 44 px status pills, 8 px apart: done (`✓ Card $23.00`, `--ok-bg`), now (`--primary` border), to come (`Then 2 × $41.50`), open rest (dashed). On the keypad pane, `Change split` (Button `ghost`) sits at the end. It never scrolls and never clips: where the done pills do not fit the width they collapse into ONE pill, `✓ 3 paid · $58.00`, and anything that still does not fit wraps. It shows only once a payment is done.
- **Method row in the sub-view, and the commit takes the money:** `Take $23.00 in Card · $159.50 left` (Item), `Take $20.00 in Cash · 3 of 6` (Amount / Percent). On the Even tab before a tile is picked it reads `Choose a split`, disabled.
- **Item tab rows (ListItem, round 2):** Checkbox = the whole line, stepper = some of it. The picked amount is the stepper's sub (`1 of 4` / `$5.00`), as in V1. The right figure is the line total, muted while nothing is picked and foreground once picked.
- **`Add an amount` (ListItem `dashed`):** it now sits under the line list, outside its scroll, so it is always in view. Tapped, it becomes `Towards the rest` (ListItem selected) with the quick amounts as **Chips** (`$5 · $10 · $20 · Type`) and the amount at the right. `Type` goes to the keypad with the picked lines kept.
- **`Share these` row on the Item tab (round 3, kept and now drawn in s2):** today's `share these between 2 · 3 · 4`, drawn as a chip row between the list and the commit: `Share these · 2 ways · $11.50 · 3 ways · $7.66 · 4 ways · $5.75`. It divides the picked lines only; the Even tab's scope stays the whole balance. The 3-way figure is $7.66 with the odd cent on the last share, the rule every tile in both variants follows; the brief round said $7.67.
- **Amount and Percent tabs:** a second row, `Then split the rest` (`1 payment · 2 ways … 5 ways`).
- **Terminal failure return (s11, round 3):** a one-line warning Notice (icon, `SumUp didn't answer · payment 4 not taken`, ghost `Try again`) at the top of the keypad pane. The eyebrow, the strip, the SumUp tile (selected) and the bill (three payments, $58.00 paid) are unchanged.
- **Commit (round 3):** a non-shrinking, full-width 56 px block at every width and in the s8 half frames.
- **Keypad pane:** helpers `The rest · $124.50` with a plan; with Cash, quick amounts / Exact.
- **Cancel (s9):** the cancelled payment stays in the bill's Payments section, struck through with a muted `Cancelled`. Its lines go back to unpaid, and the eyebrow, strip and Remaining recount.
- **Discount (s10):** `Discount 10 %` under Subtotal on the bill, discounted line prices on the Item tab and the bill, and the hero hint `Prices include the 10 % discount`.

## Consistency audit against the system sheet (round 2)

What did not match the component it claims to be, and the fix:

1. **Item tab rows, `Towards the rest` and `Add an amount` had 2 px padding.** ListItem is `min-h-row gap-3 px-3 py-2`. Fixed to 12 px / 8 px, so rows are 62 px with the 44 px stepper. This was probably the main miss: the rows read tighter than every ListItem in the gallery.
2. **The checkbox was drawn 1.5 px with a 4 px radius and a 14 px glyph.** Checkbox is `size-5 rounded-sm border` (hairline) with a `size-3` glyph. Fixed: 20 px, hairline border, 2 px radius, 12 px glyph.
3. **The `$5 · $10 · $20 · Type` controls inside the row were 44 px Tiles**, under Tile's `min-h-tile` of 56. A Tile cannot be 44 px tall. They are now Chips (`h-ctl` 44), the same control the keypad pane uses for quick amounts.
4. **Commit padding was 16 px**, against Button `lg` `px-6`. Fixed to 24 px (16 px on the phone, for the long German labels).
5. **The ring was a fifth, undocumented component** (not in the gallery). It is removed (item 8).

## Routes retired

| Retired | Replaced by |
|---|---|
| The ring (192 px round 0, 44 px round 1) | Caption + hero + hint; the plan strip |
| `Pay for these · $x` | `Take $x in Method` in the sub-view |
| `Use this split · $x first` | `Take $20.00 in Cash · 3 of 6` |
| Wrapped plan strip with `Change split` / `Pick next items` above the methods | One strip under the method row, `Change split` at its end; the Item tab shows what is unpaid |
| Cart `Split` link as the way to pay part of a line | The Item tab stepper (the cart link keeps its cart jobs) |
| Amount tab's forced "then $x as ONE payment" | `Then split the rest` (`1 payment` keeps the old behaviour) |
| Typing a plain part payment for "items + $10" | `Add an amount` on the Item tab |

## Round 2 changes, and conflicts

- **Conflict with "one row":** at 390 and in the s8 half frames the collapsed strip (`✓ 3 paid · $58.00`, `Now $41.50`, `Then 2 × $41.50`, `Change split` ≈ 470 px) wraps to two 44 px lines rather than clipping or scrolling.
- With the correct ListItem padding, the Item tab list scrolls at 1280 × 800 in s3: Caesar salad sits just below the list's fold. The picked lines, `Towards the rest` and the commit are in the fold.
- New frames: s9 (Cancel payment on B), s10 (10 % discount, leg A $20.70).
- Continuity holds across s2–s10, as V1.
