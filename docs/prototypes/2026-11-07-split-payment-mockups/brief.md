mode: inside-a-system

# Split payment — hill-climb brief (2026-11-07)

## Subject

The **Split view** of the checkout tender pane (`packages/core/src/screens/main/pos/checkout/tender/split-view.tsx`) and the **plan strip** it leaves on the keypad pane (`tender-pane.tsx`, `checkout-plan`). One job: let the cashier take one bill as several payments, each defined a different way, without losing track of who has paid what.

## Who stands in front of it

A cashier at a counter, standing, arm's length from a shared tablet, under shop lighting, with a table of six waiting to pay. Sometimes a stall-holder who last opened the app four months ago. Judge at 5 pm with a queue: can the next action be found in under a second without reading?

## The problem, in the reporter's words (Paul, 2026-11-07)

> I'm not convinced these screens are as easy to use as they could be.
>
> There are 6 drinks and 8 meals in a cart. One customer wants to pay for 1 drink + 1 meal, another user wants to pay for 1 drink + $10, another customer wants to pay $20 off the bill, and the remaining 3 customers want to split it evenly.
>
> There are so many permutations. We need to document each one and make sure we have an intuitive flow to take the payments.

## What exists today (inventory, so no variant evaluates a straw man)

Screen order on the keypad pane (ruled, see constraints): label row (`TO PAY` / `REMAINING` + **Split** chip + offline badge) → amount figure → method tiles (Cash, Card, terminals…) → helpers (quick amounts / Exact) → keypad → commit button (`Take 18,00 € in Cash · 2 of 3`).

Tapping **Split** takes over the pane (no sheet): caption `SPLIT` (or `SPLIT THE REMAINING`), a 192 px ring around the balance (segments = the legs still to take), a four-way segmented control, then per tab:

| Tab | Controls | Plan it makes |
|---|---|---|
| Even | tiles 2 · 3 · 4 · 5 · 6 ways, `$x each` | N equal legs over the remaining balance, remainder on the last |
| Amount | tiles $5 · $10 · $20 · $50 (those under the balance, `then $y`), Half, *Type the first payment* | ONE leg of that amount, then ONE leg of the rest |
| Percent | tiles 10 · 20 · 25 · 30 · 50 · 75 %, amount shown | same as Amount, titled "25 %" |
| Item | every cart line as a tick-box row (`paid · Card` on paid lines), `Pay for these · $x`, `or share these between 2 · 3 · 4` | legs over the ticked WHOLE lines, then "the rest"; loops: `Pick next items` after the group lands |

Hint line under the options (one per tab) and `No split` when a plan is set. Back on the keypad: the label becomes `Payment 2 of 3 · $12.00 left`, a strip of pill legs (done = green wash + check, now = primary border, todo = dim, rest = dashed) with `Pick next items` / `Change split` links; the commit reads `Take $6.00 in Card · 2 of 3`. Typing less than the planned leg: `Less than planned · $x moves to the next payment`. Each leg can use any method. Offline: a `Offline` word beside the label; online-only tiles disabled. Busy/saving: everything drawn, nothing pressable. A "legacy" gateway takes the whole order and shows `Takes the whole order, so not once a payment has been taken`.

Since #3393 (merged 2026-11-07 while this climb ran): once cash tendered exceeds the amount due, `Change $x` takes the big figure's slot in the success tone and the tendered amount drops to a key-rank line under it (`Tendered $50.00 · Total $182.50` on a part-paid order). State 7 follows it.

Strings live in `packages/core/src/contexts/translations/locales/en/core.json` under `pos_checkout.*` (split_even, n_ways, each_amount, then_amount, half, type_first_payment, pay_for_these, tick_items, share_these_between, line_paid_by, items_paid_of, less_than_planned, pick_next_items, change_split, no_split, payment_n_of, rest_of_the_order, item_payment_n_of).

Quantity today: a cart line with qty 6 is ONE row in the Item tab; paying for 1 of the 6 means going back to the cart and using the line's `Split` link (`pos_cart.split_qty`) first. The Item tab cannot take "1 drink + $10". A fixed amount and an even split cannot be planned in one visit: Amount makes two legs, so "$20 then split the rest 3 ways" is two trips through Change split.

### What goes wrong in Paul's scenario today (6 drinks + 8 meals)

1. Guest A, 1 drink + 1 meal: Item tab shows "Lemonade ×4 $20.00" as one row. Cashier must close, go to the cart, split the line, come back. Two screens, four taps, before the first tick.
2. Guest B, 1 drink + $10: no tab does this. Cashier takes the drink as an item leg, then types $10 as a plain part payment with no plan.
3. Guest C, $20 off the bill: Amount tab → $20 tile. The plan now says "then $x" as ONE payment, which is wrong for the three left.
4. Guests D–F split the rest: `Change split` → Even → 3 ways. Works, but the ring, hint and strip have changed meaning three times, and nothing on screen says A, B and C are done.

## Start state and end state

Start: order of 14 line items, total **$182.50** (tax included), no payments, cashier on the keypad pane; a guest says "we'll split it".
End: six payments recorded, balance $0, the Paid moment; the receipt prints per-line provenance for item legs.

## The worked order (every variant uses exactly this)

| Line | Qty | Each | Total |
|---|---|---|---|
| Flat white | 2 | $4.50 | $9.00 |
| Lemonade | 4 | $5.00 | $20.00 |
| Burger | 3 | $18.50 | $55.50 |
| Fish & chips | 3 | $22.00 | $66.00 |
| Caesar salad | 2 | $16.00 | $32.00 |
| **Total** | 14 | | **$182.50** |

Legs: **A** Flat white ×1 + Burger ×1 = $23.00 (Card) · **B** Lemonade ×1 + $10.00 = $15.00 (Cash) · **C** $20.00 off the bill (Cash) · **D, E, F** the rest $124.50 split evenly = $41.50 each (Card, Card, Cash). Payment methods on this till: Cash, Card, SumUp (terminal).

## Scenario catalogue (every variant must have an answer for each; the delivered page shows the flow for each)

A leg is one payment. Its amount is defined one of these ways; a bill is any sequence of them.

| # | Leg kind | Example | What the cashier must be able to do |
|---|---|---|---|
| S1 | Whole bill, one payment | "I'll get it" | No split at all; never pass through the split view |
| S2 | Even, N ways, all at once | 4 friends, $45.62 each | Pick N; remainder cents land on the last leg; each leg any method |
| S3 | Fixed amount, then the rest | "$50 on my card, the rest cash" | Type or tap an amount; the rest is one more payment |
| S4 | Percent | "I'll cover 25 %" | Pick a share; same as S3 after that |
| S5 | Whole lines | "Just my burger" | Tap the line(s); the leg is their total; the line is marked paid afterwards |
| S6 | Part of a line (qty) | "1 of the 4 lemonades" | Pick how many of a multi-qty line WITHOUT leaving the tender pane. Rule: the cart stepper idiom (`− 1 +` with "of 4"), never per-unit dots |
| S7 | Items + an amount | "my drink, and put $10 towards the rest" | Combine S5/S6 with a typed top-up in ONE leg |
| S8 | Items shared by k people | "the three of us had the platter" | Items picked, then shared evenly k ways (today's `share these between`) |
| S9 | Fixed amount, then even N ways | "$20 off, then the three of us split" | Plan both without a second trip through Change split |
| S10 | Mixed sequence (Paul's case) | A: items, B: items + $10, C: $20, D–F: even | Each leg defined its own way, in any order; the screen shows what is done, what is now, what is left |
| S11 | The rest, one payment | after any plan | A single "the rest" leg is always one tap |
| S12 | Less than planned | the planned $41.50 leg, guest has $40 | The difference moves to the legs still to come; the plan re-balances, the screen says so |
| S13 | More than planned (cash) | $50 for a $41.50 leg | Change due, the leg is $41.50 |
| S14 | Change the split mid-way | one of the three leaves | Re-plan the remainder only; done legs never move |
| S15 | Cancel a taken leg | Guest A's card declined after record / wrong amount | Existing Cancel payment flow; the plan recounts |
| S16 | Everything paid by items, cents left | rounding leaves $0.02 | The last leg absorbs it; never a $0.02 payment to chase |
| S17 | Offline | no network | Same screens, `Offline` badge, online-only tiles disabled with reason |
| S18 | Terminal leg fails mid-split | SumUp times out on leg D | Existing terminal failure view; the plan is intact on return |
| S19 | Legacy (whole-order) gateway | | Hidden/disabled once any payment is taken, with the one-line reason |
| S20 | Order-level discount / fee / shipping with item legs | 10 % off the bill | Apportioned by line total; the line total shown is what the guest pays (state it once, never a paragraph) |

## States every variant must render (the shot list)

1. **Split opened, nothing taken** — the entry screen at 1280 (register frame: rail + tender pane + ledger) and at 390 (pane only). Light and dark.
2. **Leg A being built** — 1 Flat white of 2 and 1 Burger of 3 picked; the leg reads $23.00.
3. **Leg B being built** — 1 Lemonade + $10.00 typed; the leg reads $15.00; A is done.
4. **Leg C** — $20.00 off the bill; A and B done.
5. **The rest, 3 ways** — A–C done, D is "now" at $41.50 on the keypad pane with the method row and commit button (`Take $41.50 in Card · 4 of 6`), E and F to come.
6. **Less than planned** — $40.00 typed on leg D; the hint says what moves.
7. **Last leg / Paid** — F at $43.00 (absorbed the $1.50 + cents), or the Paid moment.
8. **Offline** and **busy (saving)** versions of state 5, as two small frames.

Phone (390) renders states 1, 2 and 5 at least. Dark renders state 1 and 5 at least.

## Widths

- 1280 × 800: the register's two-column layout (nav rail 64 px, tender pane ≈ 556 px, ledger ≈ 384 px) exactly as `anchors/baseline-split-open-tablet-light.png` has it. The ledger lists the worked order; paid lines show `paid · Card`.
- 390 × 844: the tender pane alone (phone layout, tabs; the ledger is a balance bar).

## Constraints (binding; copied from CODING_STANDARDS § Design and rulings)

- **Method row under the amount (Paul, 2026-10-07, ruling):** the pane order is label → amount → method row → helpers → keypad/controls → commit. The split is a sub-view of that pane and keeps that order. A method row at the bottom is a regression of an approved decision.
- **No per-unit dots for quantity (Paul, 2026-10-07, ruling):** picking "how many of this line" is the cart stepper (`− n +` with "of N", tap the name for the whole line). Never pips.
- **One way to do each thing (Paul, 2026-09-18):** for every outcome exactly one control. If a variant adds a route, it says which old route it retires.
- One number leads, one primary action; a second amount appears only when it differs, as a plan (`Payment 1 of 2`), not a second total.
- Touch: 44 pt minimum, 56 pt for keys and tiles hit every sale; 8 pt gaps; destructive apart from constructive; no hover-only affordance.
- Tiles are equal width in fixed columns; width never follows label length; a phone stacks to one or two columns.
- State is visible, not explained: one badge at the top for offline/saving; a disabled control says why in a few words; no walls of text; never colour alone.
- Calm colour, semantic tokens only (`variants/tokens.css`): one accent per screen (`--primary`), success/warning/destructive carry meaning only; flat surfaces, hairline borders, the theme's radius; no gradients, glass, shadows.
- Type: system font, tabular numerals for every amount, 14 px base web, nothing under 12 px that a cashier reads.
- Words the cashier uses: buttons are verbs with the object (`Take $23.00 in Card`); no label repeating the element; survives German length.
- Components: Tile (`bg-card rounded-tile border border-border`, selected `border-primary bg-muted`, min-h-tile), SegmentedControl (`min-h-ctl border-border bg-card rounded-lg border`, selected segment `bg-muted` + semibold), Chip, ListItem (`min-h-row flex-row gap-3 px-3 py-2` + tile surface), Keypad (`h-tile` keys, `bg-muted` faces), AmountFigure (`text-amt font-bold tabular-nums`), Button `default` (`bg-primary`), `outline` (`border-border bg-card border`), `ghost`. The system anchors (`anchors/system-gallery-*.png`, `anchors/system-real-tender-keypad-*.png`) are what every control must still match.
- House defaults to avoid: cream backgrounds, italic accent words, 01/02/03 section labels, monospace labels, pill buttons for actions, hairline broadsheet rules, emoji, confetti, mascots.
- `assumed:` output dir is `docs/mockups/2026-11-07-split-payment/` (the repo has `docs/mockups/`, not `docs/prototypes/`).
- `assumed:` the register frame at 1280 is drawn in the default light theme and the default dark theme only; the seven other themes are out of this climb.
- `assumed:` the worked order and leg amounts above (Paul gave counts, not prices).

## What other POS do (tie-breaker is the cashier's expectation)

From `wcpos/roadmap docs/research/2026-09-07-checkout-flow-research/vendor-checkout-flows.md` (sourced) and product knowledge (marked ✱, unverified against current builds):

- **Toast** — `Split evenly` on the payment screen; checks are split by seat/item before tender ("Split check"); any tender for less than the balance is a partial and the balance stays on screen ✱ the check pane on the left keeps every item and `Balance due` visible throughout.
- **Square for Restaurants** — check-level split before tender: by seat, by item (drag items between checks), evenly; each resulting check is paid on its own. Square POS — `Split Amount` on the tender screen; must finish within five minutes.
- **Lightspeed X** — overtype the amount field; "the remaining balance of the sale will be adjusted". Lightspeed R — every tender is a simultaneous amount field with `Max`; "enter the amount for each payment type until the Balance is 0".
- **SumUp POS Pro** — the payment screen keeps the item list; items tap-to-select (blue), paid items turn green with a check; a calculator with `/2`, `/3`, `÷`; methods on the right. ✱ Picking a quantity of a multi-qty line is a tap-per-unit on the line.
- **Loyverse** — `SPLIT`: `+/−` portions, a type per portion, lines marked Paid, `Done`.
- **Shopify POS** — `Split payment` → amount only, `Mark as partially paid`; no item split.
- **Clover** ✱ — Pay Full Amount / Split tabs: by item, evenly, custom amount; a "guest" count.
- **Zettle** — no tender-time split; saved cart "charge by items".
- **Fintech references on the anchors** — Chime (an expense split: the amount leads, one editable share per person, `Clear all`, one full-width commit; the Mobbin short link served Chime where Splitwise was expected), Revolut (Amount / Percent / Share tabs over a per-person list with editable amounts), Vipps (Even / Amount / Percentage with `Remaining to distribute: 0`).

The pattern the leaders share and we lack: **the items stay in sight and are the thing you touch**, a running **remaining** figure updates as the leg is built, and a fixed amount never forces "one more payment" on the rest.
