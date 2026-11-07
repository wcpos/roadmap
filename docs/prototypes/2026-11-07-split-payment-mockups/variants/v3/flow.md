# V3 flows — four tabs, each composing on the next payment

Worked order $182.50. "Split" opens the sub-view on the Even tab. Every tab has the method row and a `Take` commit, so a payment is taken where it is defined. `Change split` (end of the strip on the keypad pane) reopens the sub-view.

- **S1** Whole bill: Card → `Take $182.50 in Card`. The sub-view is never opened.
- **S2** Even 4 ways: Split → `4 ways` → Card → `Take $45.62 in Card · 1 of 4` → (keypad pane) Take ×3 (any method each). The last is $45.64.
- **S3** $50 then the rest: Split → Amount → `$50` → `1 payment` → Card → `Take $50.00 in Card · 1 of 2` → Cash → Take.
- **S4** 25 %: Split → Percent → `25 %` → `1 payment` → `Take $45.63 in Card · 1 of 2` → Take.
- **S5** Whole lines: Split → Item → tick `Burger` (all 3) → `Take $55.50 in Card · $127.00 left`.
- **S6** Part of a line: Split → Item → + Lemonade (`1 of 4` / `$5.00`) → `Take $5.00 in Cash · $177.50 left`.
- **S7** Items + amount (s3): Split → Item → + Lemonade → `Add an amount` → `$10` → Cash → `Take $15.00 in Cash · $144.50 left` (A done). Other amounts: `Type`.
- **S8** Items shared by 3 (s2): Split → Item → tick / + the lines → `Share these · 3 ways` → Take ×3.
- **S9** $20 then 3 ways (s4): Split → Amount → `$20` → `3 ways` → `Take $20.00 in Cash · 3 of 6` → Take ×3. One visit.
- **S10** Paul's table, 23 taps in all.
  - A (s2): Split, Item, + Flat white, + Burger, Card, `Take $23.00 in Card · $159.50 left` (6 taps).
  - B (s3): Change split, Item, + Lemonade, `Add an amount`, `$10`, Cash, `Take $15.00 in Cash · $144.50 left` (7 taps).
  - C–F (s4, s5): Change split, Amount, `$20`, `3 ways`, `Take $20.00 in Cash · 3 of 6`, Card, `Take $41.50 in Card · 4 of 6`, Take, Cash, `Take $41.50 in Cash · pays it off` (10 taps).
- **S11** The rest as one payment: the `The rest · $x` chip on the keypad pane (one tap), or `1 payment` in a Then-split row.
- **S12** Less than planned (s6): on D type 4 0. The hint reads `Less than planned · $1.50 moves to the next 2 payments`, and the strip reads `Then 2 × $42.25`.
- **S13** More than planned, cash (s7, after s6): F is $42.25. Cash → `$50.00` → `Change $7.75` → `Take $42.25 in Cash · pays it off`.
- **S14** One of three leaves: Change split → Even → `2 ways`. It re-plans what is left; done legs keep their checks.
- **S15** Cancel a taken payment (s9): the existing Cancel payment flow on B. B stays in the bill's Payments section, struck through and `Cancelled`. Its lemonade is unpaid again (`1 of 4 paid` is gone from the line). The eyebrow reads `Payment 2 · $159.50 left`, the strip keeps A done with `Now $159.50`, and Paid / Remaining recount to $23.00 / $159.50.
- **S16** Cents left: the last leg of any plan takes the odd cents. On the Item tab, a pick that covers the last unpaid units reads the balance itself.
- **S17** Offline (s8, left): an `Offline` badge, and SumUp is disabled with `Needs internet`. All tabs work.
- **S18** Terminal fails on D (s11): SumUp → `Send $41.50 to SumUp · 4 of 6` → no answer → back on the keypad pane. A warning Notice reads `SumUp didn't answer · payment 4 not taken` with `Try again`. The eyebrow still reads `Payment 4 of 6 · $124.50 left`, the strip reads `✓ 3 paid · $58.00 · Now $41.50 · Then 2 × $41.50`, SumUp stays selected, and the bill still shows three payments / $58.00 paid.
- **S19** Legacy: locked from the first payment, with the existing reason when tapped (not drawn).
- **S20** 10 % off (s10): the bill carries `Discount 10 %` under Subtotal. The Item tab's line prices are discounted (`$4.05 each`), and the hero's hint reads `Prices include the 10 % discount`. + Flat white, + Burger = `$20.70` → `Take $20.70 in Card · $143.55 left`.
