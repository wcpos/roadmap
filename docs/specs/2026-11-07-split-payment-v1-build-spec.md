# Split payment: the payment is built, not planned

Date: 2026-11-07. Lane: `main` (2.0). Owner: Paul. Status: **approved** (*"continue as you
recommend"* on the V1 pick of `docs/prototypes/2026-11-07-split-payment-mockups/index.html`, the
hill climb run on *"I'm not convinced these screens are as easy to use as they could be … 6 drinks
and 8 meals in a cart … so many permutations"*). This spec is the build contract; the mockup's
frames s2–s15 are the visual reference and every state named here is one of them. The brief's
scenario catalogue (S1–S20) and `variants/v1/flow.md` give the taps for each scenario.

## What it replaces

The **Split sub-view** of the tender pane (`packages/core/src/screens/main/pos/checkout/tender/
split-view.tsx`): the ring, the `Even / Amount / Percent / Item` segmented control, the hint line
under it, the item tick list with `Pay for these` and `or share these between`, and `No split`.
Its contract was § Split of `2026-09-11-tender-pane-keypad-spec.md`; that section is superseded by
this document. Everything else in that spec stands: the keypad pane, method row, helpers, commit,
the terminal moment, the Paid moment, Cancel payment, the Legacy tab, the ledger pane's job.

The idea: **there is no split sub-view.** A split is a run of ordinary payments. Each payment is
built on the keypad pane from one or more of: lines picked on the bill (whole lines or part of a
line, by quantity), a typed amount, a share (percent), a share of the picked lines between people,
or an even split of what is left. The bill on the right is the item picker. The cashier never
describes the whole split up front unless they want to (`2–6 ways` does that in one tap).

## The pane, top to bottom (unchanged order from the 09-11 spec; the strip moves)

1. **Label row.** The eyebrow (12 px uppercase caption, `checkout-label`): `TO PAY` / `REMAINING`
   as today; once a payment exists or a plan is set, `Payment 2 · $159.50 left`, or
   `Payment 4 of 6 · $124.50 left` with a plan, or `Payment 1 of 3 · shared` for a shared item
   payment. Beside it the **Split chip** (`checkout-split-chip`, the real Chip `on` state).
   **On:** the bill's lines become pickable and the helpers row becomes the even row while no plan
   is set. **Off (tap again):** the plan and the picks are cleared, nothing taken is touched; this
   is the only "no split". Offline badge as today.
2. **Hero.** Always THIS payment (`checkout-entry`). The hint line under it (`checkout-entry-hint`)
   carries one fact: `25 % of $182.50 · type another share`, `Less than planned · $1.50 moves to
   payments 5 and 6`, `3 share $37.00 · the last pays $12.34`, `includes $0.02 left from rounding`,
   `Cash $15.00 cancelled · its lemonade is unpaid again`, or the existing part-payment / no-change
   lines. Once cash tendered exceeds the due, the change leads (#3393, already built): `Change
   $7.75` in `AmountFigure tone="ok"` with `Tendered $50.00 · Total $182.50` under it.
3. **Method row.** Unchanged: the `TileGrid`, `phone ? 2 : 5` columns, status dots, unavailable
   list. The method row stays directly under the amount (ruling 2026-10-07).
4. **Plan strip** (`checkout-plan`), **now under the method row**, only once a payment exists or a
   plan is set. 44 px pills, 8 px apart: done (`bg-success/20 border-success/30`, check, method,
   amount), now (`border-primary`), to come (`Then 2 × $41.50`, one pill for a run of equal
   legs), open rest (dashed, `Then $145.50`). With a plan, `Change split` (ghost) at the end.
   **The strip never scrolls and never clips.** Where the done pills do not fit the width they
   collapse into ONE pill, `✓ 3 paid · $58.00`, with a chevron: it is a disclosure. Opened
   (`checkout-plan-done-open`, frame s14) the done pills unfold in place into the recorded
   payments, one `ListItem` per payment (`✓ Card · $23.00` / `1 Flat white, 1 Burger`), each with
   the existing `Cancel payment` as a ghost-destructive action, and `Hide` at the end. While it
   is open it takes the keypad's place and the helpers fold away (the phone has no bill, so this
   is the phone's way to reach Cancel payment). Whatever still does not fit after collapsing wraps
   to a second line. `Pick next items` is gone: the bill is always pickable while Split is on.
5. **Helpers row** (`checkout-helpers`), which changes with what is being built:
   - Split on, nothing picked, nothing typed, no plan: caption **`Split the rest`**, then tiles
     **`Percent`** (sub `a share`) and **`2 ways … 6 ways`** (sub `$x each`). The caption reads
     `After this payment · $124.50` once an amount is typed or lines are picked, and the tiles
     divide that remainder; tapping one plans this payment plus N equal payments in one visit
     (S9: `Take $20.00 in Cash · 1 of 4`).
   - `Percent` on: the row becomes **`Percent of the rest`** with Chips `10 % · 20 % · 25 % · 50 %
     · Type`, one `on`. `Type` puts the keypad into percent entry: digits type the share and the
     hint shows `33 % of $182.50`. The hero shows the money.
   - Lines picked: the **leg chips**: one per picked line (`1 Lemonade ×`, removable), **`+
     amount`** (Chip `add`: arms the keypad so the typed figure is added on top of the picked
     lines, S7: 1 lemonade + $10 = `$15.00`), and **`Share`** (Chip `add`: divides THIS payment
     between people). `Share` on: `Share this payment` with `2 ways · $18.50 each`, `3 ways ·
     $12.33 each`, `4 ways · $9.25 each` tiles (S8, frame s15).
   - A plan exists: `The rest · $124.50` chip; for cash the existing quick amounts and `Exact`.
   - Phone only: **`Pick items`** chip, which opens the line list in place of the keypad; the chip
     then reads `Back to keypad` with the picked count beside it (`Back to keypad · 2`).
6. **Keypad.** 56 px keys at both widths, four rows above the commit on every frame. Where a list
   takes the keypad's place (phone pick list, the opened done disclosure) the keypad is gone,
   not shrunk. The pane's existing short-height fallback stays as it is (`assumed:` not touched
   by this spec).
7. **Commit.** Full width, 56 px, non-shrinking: `Take $23.00 in Card · $159.50 left`, `Take
   $41.50 in Card · 4 of 6`, `Take $12.33 in Card · 1 of 3`, `… · pays it off`, `Send $41.50 to
   SumUp · 4 of 6`.

## The bill is the picker (ledger pane)

- **Tablet / desktop bill rows** (`LedgerLines`), while Split is on: the price as the sub-line
  (`$5.00 each`), a **`This payment` column with the cart stepper** (`− 1 of 4 +`, centre `1 of 4`
  plus the picked amount `$5.00`), the line total always on the right. A tap on the row's name
  picks every unpaid unit of the line (S5: tap `Burger` → all 3, $55.50). `+` picks one more unit,
  `−` one fewer. A **picked row** takes the shared selected `ListItem` treatment (`border-primary`
  + `bg-muted` + tile radius), never a coloured left edge (ruling: no per-unit dots, quantity is
  the stepper). A fully paid line has no stepper; its sub-line reads `2 of 2 paid · Card`; a part
  paid line reads `✓ 1 of 2 paid · Card` and its stepper runs over the unpaid units.
- **Phone pick list** (in place of the keypad): `ListItem min-h-row gap-3 px-3 py-2` rows, the
  unit price under the name, the stepper, and the trailing figure is what the row adds to THIS
  payment (bold `$4.50`), absent when unpicked. No amount inside the phone stepper.
- **Payments section of the bill:** recorded payments only, each listing what it paid for (`1 Flat
  white, 1 Burger`). No forecast rows (the strip is the only place for now / to come). A cancelled
  payment stays listed, struck through, with a muted `Cancelled` (frame s9).
- **Discount** (S20): line prices shown discounted (`$4.05 each`), one muted line under the leg
  chips, `Prices include the 10 % discount`. Apportioning stays by line total as in the 09-11
  spec; the order's totals are not recomputed.

## Money rules

- A **unit's price** is its line's displayed total (tax-inclusive when the cart shows prices
  inclusive) divided by the quantity, floored to the minor unit; the remainder cents sit on the
  line's last unit, so picking all of a line always sums to the line total.
- **Even shares** stay `evenSplitShareMinor` (half-up, the last leg takes what is left: $182.50 / 4
  → 45.62 × 3, 45.64). A **shared item payment** of $37.00 three ways is 12.33, 12.33, 12.34.
- **Cents left over** (S16): the hero for a picked line is the line's price plus any outstanding
  rounding when picking it would leave less than one minor unit's worth of lines unpaid, with the
  hint `includes $0.02 left from rounding`. No sub-minimum payment is ever planned.
- **Less than planned** re-plans the remainder evenly over the legs still to come (unchanged).
  **More than planned** on cash is change (unchanged, #3393).
- **Cancel a payment**: the existing void flow. Its items go back to unpaid (`0 of 4`), the strip
  and eyebrow recount, the hint says what came back once (`Cash $15.00 cancelled · its lemonade is
  unpaid again`).
- **Terminal did not answer** (S18): the existing unanswered-command Notice at the top of the
  pane (`SumUp didn't answer · payment 4 not taken` + `Try again`); the plan, strip and method
  selection are untouched.
- **Legacy** (S19): locked from the first payment as today; `Whole bill only` sits under the
  disabled segment label (new), the existing reason toast on tap stays.

## Reducer

`TenderState` loses `splitView`, `splitTab`, `pickedLineIds`; `SplitTab` and the actions
`open-split`, `close-split`, `set-split-tab`, `toggle-split-line` go. It gains:

```ts
picked: Record<TenderLineId, number>;          // units of each line in THIS payment
extraMinor: number | null;                     // "+ amount" on top of the picked lines; null = not armed
entryMode: 'money' | 'percent';                // `Type` under Percent of the rest
pickerOpen: boolean;                           // phone: the line list has the keypad's place
doneOpen: boolean;                             // the collapsed done pill is unfolded
```

`TenderPlan` becomes:

```ts
| { kind: 'even';  ways: number; from: number }
| { kind: 'fixed'; firstMinor: number; title: string | null; thenWays: number; from: number }
| { kind: 'items'; units: Record<TenderLineId, number>; firstMinor: number; ways: number; from: number }
```

`fixed.thenWays` (1 today's behaviour, N for `After this payment · 3 ways`) replaces the implicit
"one more payment"; `items.units` replaces `lineIds` so part of a line is a leg. New actions:
`pick-units {lineId, units}` (0 clears the line), `pick-line {lineId}` (all unpaid units),
`arm-extra`, `set-entry-mode`, `set-ways {ways}` (on picked lines: a Share; on nothing: an even
plan; on an amount: a fixed plan with `thenWays`), `set-percent {percent}`, `toggle-picker`,
`toggle-done`. `planLegs` renders `thenWays` equal legs after the first, and `items` legs from
`units`. Completion stays derived from payment rows since `from`, never a counter.

**Provenance.** `linesPaidBy` becomes `Record<TenderLineId, { units: number; methods: string[] }>`
in the checkout-mode store and on the order (the `_wcpos_split` summary keeps `kind / ways /
shares`; the per-line record gains `units`). The receipt's `paid · Card` mark reads
`1 of 2 paid · Card`. Nothing is recomputed on the order; a part-line payment is money against the
order plus a provenance note, exactly as an item plan is today.

## Copy

Retired (deleted from `en/core.json`, no caller left): `split_the_remaining`, `split_even`,
`split_amount`, `split_percent`, `split_item`, `type_first_payment`, `type_first_hint`,
`pay_for_these`, `tick_items`, `share_these_between`, `split_even_hint`, `split_amount_hint`,
`split_percent_hint`, `split_item_hint`, `items_paid_of`, `pick_next_items`, `no_split`.

New `pos_checkout.*` keys (English only): `split_the_rest`, `after_this_payment` (`After this
payment · {amount}`), `percent_tile` (`Percent`), `percent_tile_sub` (`a share`), `percent_of_the_rest`,
`percent_type` (`Type`), `percent_of_amount` (`{percent} % of {amount}`), `type_another_share`,
`plus_amount` (`+ amount`), `share` (`Share`), `share_this_payment`, `ways_each` (`{ways} ways ·
{amount} each`, replaces `share_each`), `shared_payment_n_of` (`Payment {n} of {ways} · shared`),
`share_hint` (`{ways} share {amount} · the last pays {last}`), `the_rest_amount` (`The rest ·
{amount}`), `pick_items`, `back_to_keypad`, `n_paid_amount` (`{n} paid · {amount}`), `hide`,
`then_n_times` (`Then {n} × {amount}`), `less_than_planned_n` (`Less than planned · {amount} moves to
payments {from} and {to}`), `includes_rounding_left` (`includes {amount} left from rounding`),
`cancelled_items_unpaid` (`{method} {amount} cancelled · its {items} is unpaid again`),
`units_paid_of` (`{n} of {total} paid · {methods}`), `this_payment` (column head), `cancelled`,
`prices_include_discount` (`Prices include the {percent} % discount`), `whole_bill_only`.

## Test IDs

Kept: `checkout-label`, `checkout-entry`, `checkout-entry-hint`, `checkout-split-chip`,
`checkout-plan`, `checkout-plan-leg-<i>`, `checkout-plan-change`, `checkout-method-<id>`,
`checkout-quick-<value>`, `checkout-key-<k>`, `checkout-commit`. Removed with the sub-view:
`checkout-split-tab-*`, `checkout-split-option-*`, `checkout-split-item-*`, `checkout-split-items-go`,
`checkout-split-share-*`, `checkout-plan-pick-items`. New: `checkout-plan-done` (the collapsed
pill), `checkout-plan-done-open`, `checkout-plan-payment-<i>`, `checkout-plan-payment-<i>-cancel`,
`checkout-plan-hide`, `checkout-helpers`, `checkout-even-<ways>`, `checkout-percent`,
`checkout-percent-<value>`, `checkout-percent-type`, `checkout-leg-<lineId>`, `checkout-plus-amount`,
`checkout-share`, `checkout-share-<ways>`, `checkout-the-rest`, `checkout-pick-items`,
`checkout-line-<lineId>-units` (the stepper's centre), `checkout-line-<lineId>-plus`,
`checkout-line-<lineId>-minus`, `checkout-line-<lineId>-paid`, `checkout-payment-<i>-cancelled`,
`checkout-legacy-whole-bill`.

## Build slices (one PR each, `main`, 600-line law; ceilings below are the brief's)

1. **State and maths** (ceiling 350 added production lines): the reducer shape above, `planLegs`
   with `thenWays` and `units`, unit pricing with the cents rule, percent entry, provenance
   `units`; `tender-state.test.ts` covers S2, S4, S6, S7, S8, S9, S12, S16 as tables. No UI.
2. **The pane** (ceiling 500): helpers row in all its states, the strip under the method row with
   the collapsing done pill and its disclosure, `Change split`, Split-chip-off clears, delete
   `split-view.tsx` and its test, commit tails, strings. Frames s2–s8, s11, s12, s14, s15.
3. **The bill is the picker** (ceiling 450): tablet bill rows with the stepper and `This payment`
   column, phone `Pick items` list, paid marks by units, recorded-payments-only with struck
   cancelled rows, the discount line. Frames s2, s9, s10, s13.
4. **Copy, Legacy and E2E** (ceiling 250): `Whole bill only`, the remaining strings, a web E2E
   walk of S1, S2, S6, S7, S9, S10 (Paul's table, 20 taps), S15 and S16; tablet and phone
   screenshots of every frame in the PR body.

Acceptance for each slice: the named frames of the mockup, screenshotted tablet and phone in the
PR body, every bullet of CODING_STANDARDS § Design's definition of done, and every string the
cashier reads being one the cashier would say.

## Decisions made without Paul (each marked where it binds)

- `assumed:` the method grid keeps `phone ? 2 : 5` columns; the mockup drew three across on the
  phone and the judge asked for two. The component rules the count; the split tiles use the same
  grid so the two rows match.
- `assumed:` the keypad's existing short-pane shrink fallback is untouched; this spec adds the
  "a list takes the keypad's place" rule for the two list states only.
- `assumed:` `Whole bill only` under the locked Legacy segment and `Back to keypad` for the phone
  picker chip, both from the final judge round, are in slices 4 and 3 rather than left as notes.
- `assumed:` per-unit pricing floors and puts the remainder on the last unit of a line; the order's
  stored totals are never recomputed (the 09-11 spec's apportioning rule, carried over).

## Out of scope

Tips, seat numbers / guest names (V2 was rejected), splitting tax or discount lines other than by
line total, the terminal and Paid moments, the receipt layout beyond the `n of m paid` mark, and
retiring the cart's own `Split` link on the quantity cell (it keeps its cart jobs; this spec does
not touch the cart).
