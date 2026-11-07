# V1 — This payment is built, not planned

No token changes.

System sheet: `system.html`; the Split chip `on` reads the real Chip on-state (`--selected` / `--selected-foreground`), no token change. Its "bill rows rest / picked" sample is drawn with the ledger's own container and classes, so it is exactly what the bill draws.

## The idea

There is no split sub-view. A split is a run of ordinary payments, and each one is built on the keypad pane from picked lines, a typed amount, a share (`Percent`), or an even split. The bill on the right is the item picker.

## Pane order (round 2, final)

label row → hero (with its hint line) → method row → plan strip → helpers → keypad → commit.

## Elements re-arranged or added

- **Split chip** (Chip, real on-state). On: the bill's lines become pickable, and the helpers row is the even row while no plan is set. Off: today's checkout.
- **Eyebrow** (12 px uppercase): `Payment 2 · $159.50 left`, or `Payment 4 of 6 · $124.50 left` with a plan.
- **Hero** (44 px / 700): always THIS payment. The hint line under it carries one fact: `25 % of $182.50`, `Less than planned · …`, `Change $7.75`, or `Cash $15.00 cancelled · its lemonade is unpaid again`.
- **Plan strip (round 2: under the method row; round 5: the collapsed done pill is a disclosure, opened in s14):** 44 px status pills, 8 px apart: done (`--ok-bg` + check + method + amount), now (`--primary` border), to come (`Then 2 × $41.50`), open rest (dashed). With a plan, `Change split` (Button `ghost`) sits at the end. **Never scrolls and never clips (round 2):** where the done pills do not fit the width, they collapse into ONE pill, `✓ 3 paid · $58.00` (success wash). Whatever still does not fit wraps to a second line. On the tablet the six-pill strip collapses (s5–s8). At 390 and in the half-width s8 frames it collapses and wraps to two lines (see conflicts below).
- **Helpers row:**
  - Split on, no plan, nothing picked: **`Split the rest` (round 4; was `Split the rest evenly`, which was wrong for a percentage)** with a **`Percent` tile (sub `a share`; round 4, was `%`)** + `2 ways … 6 ways` Tiles. `Percent` replaces the round-1 `1 payment` tile. Tapping it puts the keypad into percent entry: the tile is selected, the hint reads `25 % of $182.50`, and the hero shows $45.63 (s11).
  - **An amount typed or lines picked (round 3):** the caption reads `After this payment · $124.50`, and `2 ways … 6 ways` divide that remainder. In s4, with $20 typed, the tiles read 3 ways · $41.50, not the $48.16 that split the $144.50 still owed before the payment. Tapping one plans this payment plus N equal payments in one visit (S9).
  - Lines picked: the leg chips (`1 Lemonade ×`, `+ amount`, **`Share`** (Chip `add`)). `Share` divides THIS payment between people (S8); the round-2 `Share this payment` tile row is gone, because the even row now plans the rest.
  - Plan exists: `The rest · $124.50`, or with Cash the quick amounts / Exact.
  - Phone: `Pick items` opens the line list in place of the keypad.
- **Phone pick list (round 4): the trailing figure is what the row adds to THIS payment**, bold when picked (`$4.50`, `$18.50`, which add up to the hero's $23.00) and absent when unpicked: the unit price under the name and the stepper's `0 of 2` say enough. On the phone the stepper carries no amount sub, so the contribution is said once. A fully paid line has no stepper; its sub-line says `2 of 2 paid`. The system sheet's phone-row sample draws exactly this.
- **Bill rows (tablet, unchanged in round 4):** price as the sub-line, a `This payment` column with the cart stepper (centre `1 of 2` + picked amount), and the line total always on the right. **Picked row (round 2): the shared selected ListItem treatment, `border-primary` perimeter + `bg-muted` + tile radius**, on the tablet bill and the phone list alike. The round-1 `new:` 3 px left edge is gone everywhere. Paid part: `✓ 1 of 2 paid · Card`.
- **Bill Payments section (round 3): recorded payments only.** Each one lists what it paid for. The round-2 `Now` / `Then` forecast rows are gone, so the strip is the only place for now / to come. A cancelled payment stays listed, struck through, with a muted `Cancelled` (s9).
- **Discount (s10):** a `Discount 10 %` line under Subtotal. Line prices are shown discounted (`$4.05 each`), and one muted line under the picked chips reads `Prices include the 10 % discount`.
- **ListItem rows (phone list):** `min-h-row gap-3 px-3 py-2`, as the component. The round-1 rows had 2 px padding.
- **Terminal failure return (s12, round 3):** a one-line Notice (warning band: icon, `SumUp didn't answer · payment 4 not taken`, ghost `Try again`) at the top of the pane. The eyebrow, the strip, the SumUp tile (selected) and the bill (three payments, $58.00 paid) are unchanged.
- **Commit (round 3: a non-shrinking, full-width 56 px block, `flex: 0 0 56px`, at every width and in the s8 half frames; 16 px / 600, `px-6`):** `Take $23.00 in Card · $159.50 left`, `Take $41.50 in Card · 4 of 6`, `… · pays it off`.

## Routes retired (one way to do each thing)

| Retired | Replaced by |
|---|---|
| Split sub-view: ring, `Even / Amount / Percent / Item`, hint, `No split` | The even row in the helpers; Split chip off = no split |
| Item tab, `Pay for these`, `Pick next items` | Bill lines with the stepper (phone: `Pick items` list) |
| `or share these between 2 · 3 · 4` | The `Share` chip in the leg chips (round 3) |
| Amount tab | The keypad: a typed amount is a payment, and the rest stays open |
| Percent tab (its `10 · 20 · 25 · 30 · 50 · 75 %` tiles) | The `Percent` tile in the `Split the rest` row (round 2; named `Percent` in round 4); its share tiles are now the `10 % · 20 % · 25 % · 50 % · Type` chips that replace that row while `Percent` is on (post-climb) |
| `1 payment` tile (round 0/1) | Take with nothing picked and no plan (the hero is the rest); with a plan, `The rest · $x` |
| 3 px primary left edge on picked bill rows and the Payments `Now` row (round 1) | The selected ListItem treatment; bold text on the `Now` row |
| Cart `Split` link as the way to pay part of a line | The stepper on the bill (the cart link keeps its cart jobs) |

## Post-climb

- s11: with `Percent` on, the `Split the rest` row becomes `Percent of the rest`: the existing Chip in a row, `10 % · 20 % · 25 % · 50 % · Type`, with `25 %` on (`--selected`). The hint reads `25 % of $182.50 · type another share`. While `Type` is on, the keypad types the share, with the `%` after the typed figure in the hint (e.g. `33 % of $182.50`). Four 56 px key rows still fit above the commit at 390 and 1280. The chip row is on the system sheet beside the other chips.
- s7 (follows monorepo #3393): once the cash tendered exceeds the amount due, the change leads. The figure's slot shows `Change $7.75` in the success tone (AmountFigure `tone="ok"`), with one muted key-rank line under it: `Tendered $50.00 · Total $182.50` (the total joins because the order is part-paid). The typed $50.00 is no longer the hero. Eyebrow, strip, Cash, the `$50.00` helper, keypad and `Take $42.25 in Cash · pays it off` are unchanged.

## Round 5b changes (a revert)

- **Round 5's phone grids and scrolling content column are reverted** to round 4: method tiles and the split row are three across on the phone, there is no scrolling column, and the s8 half frames are as in round 4. The two-column change dropped keys to 44 px on the entry phone page and pushed the last key row under the commit.
- **Keys are 56 px on every page at both widths** (`grid-template-rows: repeat(4, 56px)`; the keypad never shrinks), matching the system sheet's key sample. Every phone page shows all twelve keys above the commit, except the pages where a list takes the keypad's place (s2, s10 and s13 pick lists; s14, below).
- **s14 (the opened payments list):** three payment rows plus four 56 px key rows plus the rest of the pane come to about 890 px, which does not fit 844 at 390 or 800 at 1280. While the list is open it takes the keypad's place, as the phone's `Pick items` list does in s2, and the helpers row folds away; `Hide` brings both back. **This conflicts with the round-5b ask that s14 keep four key rows;** the alternative was shrinking keys, which is what this revert undoes.
- **s15:** the Share row has no separate caption (the `Share` chip, on, names it), and on the phone the strip drops the open-rest pill (`Then $145.50`; the balance bar carries the open balance). Four 56 px key rows then fit above the commit at 390 and 1280.
- **s11:** while the keypad is in percent entry, the phone folds the `Pick items` chip away (a different way to build the payment), so four 56 px key rows fit above the commit.
- **Caesar salad:** the data was already 2 × $16.00 = $32.00 on every page (s10, discounted: 2 × $14.40 = $28.80), and no page drew `$30.00`. The generator now asserts that the lines sum to the total ($182.50, and $164.25 discounted). Subtotal, Paid and Remaining were re-checked on every frame.

## Round 5 changes

- **The collapsed done pill is a disclosure:** `✓ 3 paid · $58.00` keeps the pill look with a small chevron at its end. Opened (s14), the done pills unfold in place into the recorded payments, one ListItem per payment (`✓ Card · $23.00` / `1 Flat white, 1 Burger`), each with the existing `Cancel payment` as a ghost-destructive action, and `Hide` (ghost) at the end. Now / to come and `Change split` stay a pill row under it, and the rest of the pane is unchanged. On the phone this is the way to reach Cancel payment, since the bill is not on screen.
- ~~Phone grids in two columns and a pinned, scrolling content column~~: **reverted in round 5b** (see below).
- **Share drawn (s15, S8):** 3 Lemonade + 1 Fish & chips = $37.00, with the `Share` chip on. Under it, `Share this payment` with `2 ways · $18.50 each`, `3 ways · $12.33 each` (selected), `4 ways · $9.25 each`. The eyebrow reads `Payment 1 of 3 · shared`, the hero `$12.33`, the hint `3 share $37.00 · the last pays $12.34`, the strip `Now $12.33 · Then $12.33 · Then $12.34 · Then $145.50`, and the commit `Take $12.33 in Card · 1 of 3`.
- Continuity checked across s2–s15. All 15 phone pages (light and dark) checked for a complete, pinned 56 px commit.

## Round 4 changes

- Phone pick list: the trailing figure = the row's contribution to this payment (bold) or nothing; no amount in the phone stepper. The tablet bill keeps TOTAL as the line total and the contribution in the stepper cell: the bill is the bill.
- `Split the rest` with a `Percent` tile; the round-3 `After this payment · $x` caption rule still applies.
- New frame s13 (S16): only the Caesar salad is unpaid, and $0.02 of rounding is left from a 3-way share of the drinks (3 × $9.66 for $29.00). Picking both salads makes the hero the whole balance, `$32.02`, with the hint `includes $0.02 left from rounding` and `Take $32.02 in Cash · pays it off`; Remaining $32.02.
- Continuity checked across s2–s13. I looked at every V1 phone page (light and dark) for a complete 56 px footer.

## Round 3 changes

- The phone footer is a non-shrinking 56 px block. The round-2 phone shots that lost it were a capture race in the shooter, not the layout; see the report.
- The s4 even row now splits what is left after the typed payment (`After this payment · $124.50`).
- The bill's Payments section lists recorded payments only.
- New frame s12: SumUp did not answer on payment 4.

## Round 2 changes, and conflicts

- Pane order is final: the strip sits under the method row in every frame and at every width.
- The phone strip collapses the done pills and never scrolls. **Conflict with "one row":** at 390 (and in the 326 px s8 frames), `✓ 3 paid · $58.00` + `Now $41.50` + `Then 2 × $41.50` + `Change split` measure about 470 px, so the strip wraps to two 44 px lines instead of clipping. No pill is cut.
- New frames: s9 (Cancel payment on B), s10 (10 % discount, leg A $20.70), s11 (25 % typed); later s12 (terminal failure) and s13 (cents absorbed).
- Continuity holds across s2–s11. The eyebrow, hero, strip, commit, bill Payments, Paid and Remaining agree in every frame (s6 → s7: D $40.00, E $42.25, F $42.25; s9: Paid $23.00, $159.50 left; s10: total $164.25, $143.55 left after A).
