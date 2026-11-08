# Split payment: the payment is built, not planned

Date: 2026-11-07. Lane: `main` (2.0). Owner: Paul. Status: **built** (2026-11-08, monorepo #3400, #3405, #3412, #3414, #3421; the § Built section records where the build departed from this text); was **approved** (*"continue as you
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

- A **unit's payable price** is the line's `total + total_tax` divided by the quantity, floored to
  the minor unit; the remainder cents sit on the line's last unit, so picking all of a line always
  sums to the line's tax-inclusive total. Tax is always inside the money a unit adds to a payment,
  whatever the cart's tax display: with prices shown exclusive, the bill's sub-line reads
  `$5.00 + $0.50 tax each` and the stepper cell shows the tax-inclusive figure the unit adds. (Today's
  item plan reads `total_tax` only when the cart shows prices inclusive, so an exclusive store's
  item payments leave the tax unpaid; this spec closes that.) Order-level discounts are already in
  the line totals; nothing else (fees, shipping) is apportioned to units, so a bill with a fee or
  shipping line keeps that money in the rest, which the even row and `The rest` pay.
- **Even shares** stay `evenSplitShareMinor` (half-up on the share, the last leg takes what is
  left: $182.50 / 4 → 45.63 × 3, 45.61; the mockup's 45.62 / 45.64 was drawn by hand and the code's
  rule wins). A **shared item payment** of $37.00 three ways is 12.33, 12.33, 12.34.
- **Cents left over** (S16): the hero for a picked line is the line's price plus any outstanding
  rounding when picking it would leave less than one minor unit's worth of lines unpaid, with the
  hint `includes $0.02 left from rounding`. No sub-minimum payment is ever planned.
- **Less than planned** re-plans the remainder evenly over the legs still to come (unchanged).
  **More than planned** on cash is change (unchanged, #3393).
- **Cancel a payment** (S15) is **one payment**, not the order's. Today's `useVoidPayments(order)`
  voids every live row and is the checkout-abandonment path; it stays for that. New:
  `voidPayment(order, paymentId)` beside it in `checkout/payments/use-void-payments.ts`, the same
  rules per row (`partitionVoidableRows`: a captured card leg, or a manual row a **completion**
  has counted, is retained and reported `captured_refund_required`, never voided). A completion is
  written when the sale closes, so while the balance is open every manual row is voidable: in S15
  B's $15.00 cash is recorded but counted by no completion, and the void succeeds. After the sale
  has closed, the same action reports `captured_refund_required` and the existing refund path is
  the way back, exactly as today. The same journal and log lines with the one id. The payment's `cancel` action in the opened done disclosure and in the bill's Payments
  section passes that row's id; `cancel-payment-view.tsx` keeps the whole-order list for the
  existing `Cancel payment` entry point. On success the payment's allocation (below) is dropped, so
  its units go back to unpaid (`0 of 4`), the strip and eyebrow recount, and the hint says what came
  back once (`Cash $15.00 cancelled · its lemonade is unpaid again`).
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

**Provenance is per payment.** `linesPaidBy` is replaced by an allocation keyed by the payment
row: `allocations: Record<PaymentRow['id'], Record<TenderLineId, number>>` (units of each line that
payment covered; the `+ amount` extra is not allocated, it is money against the order). It is
written with the leg that records the payment (the manual path's `recorded` and the terminal's
`captured`), into the checkout-mode store and onto the order's meta beside the `_wcpos_split`
summary (which keeps `kind / ways / shares`). Everything the UI shows derives from it: a line's
paid units are the sum over live rows, its methods the titles of those rows, and cancelling a row
drops exactly its allocation, so two $10 cash payments that covered one $5 unit + $5 extra and two
$5 units respectively each restore their own units. The receipt's `paid · Card` mark reads
`1 of 2 paid · Card`. Nothing is recomputed on the order; a part-line payment is money against the
order plus this allocation, exactly as an item plan is today.

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
`checkout-quick-<value>`, `checkout-keypad-key-<k>`, `checkout-commit`. Removed with the sub-view:
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

1. **State and maths** (ceiling 400 added production lines), **additive**: the new state fields,
   actions and plan shapes above are added beside today's (`lineIds` stays next to `units`,
   `linesPaidBy` arrays stay next to `allocations`, the four `split*` actions still reduce), so
   `split-view.tsx` and `tender-pane.tsx` build and behave unchanged; `planLegs` with `thenWays`
   and `units`, tax-inclusive unit pricing with the cents rule, percent entry, per-payment
   allocations written with the leg, `voidPayment(order, paymentId)`; `tender-state.test.ts`
   covers S2, S4, S6, S7, S8, S9, S12, S15, S16 as tables. No UI.
2. **The pane** (ceiling 500): helpers row in all its states, the strip under the method row with
   the collapsing done pill and its disclosure (single-payment cancel from it), `Change split`,
   Split-chip-off clears, commit tails, strings; **then the retirement**: delete `split-view.tsx`
   and its test, the `split*` actions, `SplitTab`, `lineIds`, `linesPaidBy` and the sixteen strings,
   in this PR, once nothing reads them. Frames s2–s8, s11, s12, s14, s15.
3. **The bill is the picker** (ceiling 450): tablet bill rows with the stepper and `This payment`
   column, phone `Pick items` list, paid marks by units, recorded-payments-only with struck
   cancelled rows, the discount line. Frames s2, s9, s10, s13.
4. **Copy, Legacy and E2E** (ceiling 250): `Whole bill only`, the remaining strings, a web E2E
   walk of S1, S2, S6, S7, S9, S10 (Paul's table, 20 taps), S15 and S16; tablet and phone
   screenshots of every frame in the PR body.

Acceptance for each slice: the named frames of the mockup, screenshotted tablet and phone in the
PR body, every bullet of CODING_STANDARDS § Design's definition of done, and every string the
cashier reads being one the cashier would say.

## Built (2026-11-08): where the code departs from this contract

Five PRs on `main`: #3400 (slice 1, state and maths), #3405 (slice 2, the pane; Paul
lifted its ceiling to 560, *"Lift to 560"*), #3412 (slice 3, the bill is the picker), #3414
(slice 4, Legacy copy and the E2E walks), #3421 (a partial leg's picked units journaled on the
order). Each departure below is the code as merged; the sections
above stay as the design intent.

- **The phone `Pick items` list moved from slice 2 to slice 3** (slice 2 ran over its ceiling at
  614; the list was the trim). Nothing was dropped.
- **The done pill folds from ONE taken payment, not two** (review on #3405: a lone payment had no
  way to be cancelled on its own). `checkout-plan-done` is the disclosure for any taken payment.
- **Picks replace an active plan.** Changing the picked units while a `2–6 ways` or percent plan is
  open drops the plan and makes the picks the entry (`clear-plan keepSplit keepPicks`); the plan
  never silently keeps a leg the cashier has just re-described.
- **A gateway leg carries no allocation.** Allocations are frozen at the press for manual and
  terminal legs (`freezePicks`); a Legacy / gateway payment pays the whole bill and has none.
- **Allocations are journaled on the order after every landed leg and after a single cancel**
  (`_wcpos_paid_units`, every live leg's units; a local order patch in `tenderRecorded` and
  `cancelOne`, monorepo #3421), and by the completing leg's provenance write as before. The four
  build PRs wrote the meta with the completing leg only (`persistProvenance` runs when the row pays
  the balance), so a reload mid-split lost every earlier leg's unit marks; the money was right.
  `voidPayments(order, deps, { paymentIds })` replaces the spec's `voidPayment(order, paymentId)`.
- **Bill-wide numbering** (ruled 2026-11-08): payments taken before a plan count toward `n of m`.
- **Copy as shipped:** `prices_include_discount` reads `Prices include the discount` (a discount may
  be an amount, not a percent); `percent_of_amount` and `type_another_share` are one key
  `percent_of_amount_type` (`{percent} % of {amount} · type another share`); `less_than_planned_n`
  names two payments and `less_than_planned_next_n` (`… moves to the next {n} payments`) names more;
  `payment_cancelled` (`Payment cancelled`) is the toast; the ledger's unit mark is `units_paid_of`
  and the phone list's figure `n_of_units`. `cancelled_items_unpaid` was not needed: the done
  disclosure lists what each payment paid for and the toast is the one line.
- **Test IDs as shipped:** the keypad's keys are `checkout-keypad-key-<k>` (not `checkout-key-<k>`);
  a line's picker is `checkout-line-<key>-pick` (a tap on the name) beside `-units`, `-plus`,
  `-minus`, `-paid`, where `<key>` is the POS line uuid; the cancel question from the done pill is
  `checkout-cancel-one-confirm`.
- **Slice 4's E2E walks are S3, S4, S7, S9 and S15**, beside slice 2's even split (S2) and slice 3's
  shared picked units (S6/S8). Paul's 20-tap table (S10) and S16 are not walked: the live store's
  E2E order is one line of quantity one, which cannot carry six drinks and eight meals; the
  tablet and phone frames are judged in the mockup, not screenshotted in the PR bodies.

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
