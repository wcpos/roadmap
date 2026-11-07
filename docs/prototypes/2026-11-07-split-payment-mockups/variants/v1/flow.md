# V1 flows — the payment is built on the keypad pane

Worked order $182.50. "Split" is the chip beside the eyebrow. "+ Lemonade" is the `+` of that line's stepper on the bill (tablet) or in the `Pick items` list (phone). The chosen method stays selected from one payment to the next.

- **S1** Whole bill: Card → `Take $182.50 in Card`. Split is never touched.
- **S2** Even 4 ways: Split → `4 ways` → Card → `Take $45.62 in Card · 1 of 4` → Take ×3 (any method each). The last reads `$45.64`.
- **S3** $50 then the rest: type 5 0 → Card → `Take $50.00 in Card · $132.50 left` → Cash → `Take $132.50 in Cash · pays it off`. No Split needed.
- **S4** 25 % (s11): Split → `Percent` → 2 5. The hero reads $45.63 with `25 % of $182.50` → `Take $45.63 in Cash · $136.87 left` → Take (the hero is the rest, $136.87).
- **S5** Whole lines: Split → tap `Burger` (all 3, $55.50) → `Take $55.50 in Card`.
- **S6** Part of a line: Split → + Lemonade (`1 of 4 · $5.00`) → `Take $5.00 in Cash · $177.50 left`.
- **S7** Items + amount: Split → + Lemonade → `+ amount` → 1 0 → `Take $15.00 in Cash · $167.50 left`.
- **S8** Items shared by 3 (s15): Split → + Lemonade ×3, + Fish & chips ($37.00) → `Share` (leg chip) → `3 ways`. The eyebrow reads `Payment 1 of 3 · shared`, the hero `$12.33`, the hint `3 share $37.00 · the last pays $12.34` → `Take $12.33 in Card · 1 of 3` → Take → Take ($12.34). The rest of the bill ($145.50) stays open.
- **S9** $20 then 3 ways: Split → 2 0. The even row reads `After this payment · $162.50` → `3 ways` ($54.16, $54.16, $54.18) → `Take $20.00 · 1 of 4` → Take ×3. Planned in one visit.
- **S10** Paul's table, 20 taps in all.
  - A (s2): Split, + Flat white, + Burger, Card, `Take $23.00 in Card · $159.50 left` (5 taps).
  - B (s3): + Lemonade, `+ amount`, 1 0, Cash, `Take $15.00 in Cash · $144.50 left` (6 taps).
  - C (s4): 2 0. The row reads `After this payment · $124.50`, with `3 ways · $41.50 each` → `3 ways` → `Take $20.00 in Cash · 3 of 6` (4 taps).
  - D–F (s5): Card, `Take $41.50 in Card · 4 of 6`, Take, Cash, `Take $41.50 in Cash · pays it off` (5 taps).
  - Still 20 taps in all; the plan is now set while C is on screen.
- **S11** The rest as one payment: with nothing picked and no plan the hero already is the rest, so it is just Take. With a plan, the `The rest · $x` helper chip (one tap).
- **S12** Less than planned (s6): on D type 4 0. The hint reads `Less than planned · $1.50 moves to payments 5 and 6`, and the strip reads `Then 2 × $42.25` → `Take $40.00 in Card · 4 of 6`.
- **S13** More than planned, cash (s7, after s6): F is $42.25. Cash → `$50.00`. The change leads: the figure reads `Change $7.75` in the success tone, with `Tendered $50.00 · Total $182.50` under it → `Take $42.25 in Cash · pays it off`. The payment records $42.25.
- **S14** One of three leaves: `Change split` (end of the strip) → the even row returns over what is left → `2 ways`. Done payments never move.
- **S15** Cancel a taken payment (s14 → s9): on the tablet, B's row in the bill's Payments section. On the phone (no bill), tap the `✓ 3 paid · $58.00` pill: it unfolds into the recorded payments, each with `Cancel payment` (s14). Then the existing Cancel payment flow runs. B stays listed, struck through and `Cancelled`. Its lemonade goes back to `0 of 4`. The eyebrow reads `Payment 2 · $159.50 left`, the strip keeps A done with `Now $159.50`, and Paid / Remaining recount to $23.00 / $159.50.
- **S16** Cents left (s13): everything but the Caesar salad was paid by item payments, one of them a 3-way share of the drinks taken as 3 × $9.66 for $29.00, so $0.02 is outstanding. Split → tap `Caesar salad` (2 of 2). The hero is the whole balance, `$32.02`, with `includes $0.02 left from rounding` → `Take $32.02 in Cash · pays it off`. No $0.02 payment to chase. Even splits put the odd cents on the last payment (182.50 / 4 → 45.62 ×3, 45.64).
- **S17** Offline (s8, left): an `Offline` badge, and SumUp is disabled with `Needs internet`. Everything else works.
- **S18** Terminal fails on D (s12): SumUp → `Send $41.50 to SumUp · 4 of 6` → no answer → back on the pane. A warning Notice reads `SumUp didn't answer · payment 4 not taken` with `Try again`. The eyebrow still reads `Payment 4 of 6 · $124.50 left`, the strip reads `✓ 3 paid · $58.00 · Now $41.50 · Then 2 × $41.50`, SumUp stays selected, and the bill still shows three payments / $58.00 paid. `Try again` re-sends; another method tile + Take takes it another way.
- **S19** Legacy: the segment is locked from the first payment, with the existing reason line when tapped (not drawn).
- **S20** 10 % off the bill (s10): the bill carries `Discount 10 %` under Subtotal, and every line price is the discounted one (`$4.05 each`). Split → + Flat white, + Burger = `$20.70`, with one muted line `Prices include the 10 % discount` → `Take $20.70 in Card · $143.55 left`.
