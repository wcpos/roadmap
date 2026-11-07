# V2 flows — guests first

Worked order $182.50. Split opens guest mode with 2 guests and Guest 1 selected. After a guest is paid in full, the next unpaid guest is selected. "+ Lemonade" is the `+` of that line's stepper on the bill (tablet) or in the `Pick items` list (phone), and it gives the unit to the selected guest.

- **S1** Whole bill: Card → `Take $182.50 in Card`. Split is never touched.
- **S2** Even 4 ways: Split → `+` `+` (4 guests: $45.62 ×3, Guest 4 $45.64) → Card → `Take $45.62 in Card · Guest 1 of 4` → Take ×3 (any method each).
- **S3** $50 on card, the rest cash, one person: no Split needed: 5 0 → Card → Take → Cash → `Take $132.50 in Cash · pays it off`. Inside a split it is one guest with two takes: Guest 1 (share $91.25) types 5 0 → Card → `Take $50.00 in Card · Guest 1 of 2` → Guest 1 stays selected with `$41.25 still to pay` → Cash → Take.
- **S4** 25 %: **detour, there is no percent control.** Split → `+` `+` (4) → `Take $45.62 · Guest 1 of 4` → `−` `−` (2 guests) → Guest 2 = $136.88 → Take.
- **S5** Whole lines: Split → tap `Burger` (all 3 to Guest 1) → `Take $55.50 · Guest 1 of 2`.
- **S6** Part of a line: Split → + Lemonade → `Take $5.00 in Cash · Guest 1 of 2`.
- **S7** Items + amount: Split → + Lemonade → `+ amount` → 1 0 → `Take $15.00 · Guest 1 of 2`.
- **S8** Items shared by 3: leave the shared lines with nobody. Guests with nothing given share whatever nobody holds, evenly. **Detour** if those three also had their own items: give each their items, then type each one's share of the platter as `+ amount`.
- **S9** $20 then 3 ways: Split → `+` `+` (4) → 2 0 on Guest 1. Guests 2–4 read $54.16, $54.16, $54.18 → Take ×4. One visit.
- **S10** Paul's table, 25 taps in all. The whole plan is on screen before the first Take.
  - Count: Split, `+` ×4 (6 guests) (5 taps).
  - Guest 1: + Flat white, + Burger ($23.00) (2 taps).
  - Guest 2: tap Guest 2, + Lemonade, `+ amount`, 1 0 ($15.00) (5 taps).
  - Guest 3: tap Guest 3, 2 0 ($20.00) (3 taps). Guests 4–6 read $41.50 by themselves.
  - Take: tap Guest 1, Card, Take, then Cash, Take (Guest 2), Take (Guest 3), Card, Take (Guest 4), Take (Guest 5), Cash, `Take $41.50 in Cash · pays it off` (10 taps).
  - On the phone, picking shows the collapsed chooser (`Guest 2 · $15.00 ‹ › − 6 +`), and `›` steps to the next guest.
- **S11** The rest as one payment: **not one tap.** `−` until one unpaid guest is left (k − 1 taps), then Take.
- **S12** Less than planned (s6): on Guest 4 type 4 0. Two chips appear: `Guest 4 pays $1.50 later` (default, Guest 4 stays open with `$1.50 still to pay`) or `Move $1.50 to Guests 5 and 6` (they read $42.25). Then `Take $40.00 · Guest 4 of 6`.
- **S13** More than planned, cash (s7, after the move): Guest 6 is $42.25. Cash → 5 0 → `Change $7.75` → `Take $42.25 in Cash · pays it off`.
- **S14** One of three leaves: `−` (5 guests). The unpaid guests re-share; paid guests never change.
- **S15** Cancel a taken payment: the existing Cancel payment flow. The guest tile loses its check and keeps its lines and amount.
- **S16** Cents left: the last unpaid guest takes the odd cents (s3.html: Guest 6 $36.14 against $36.12). Discount rounding lands on the last guest paid.
- **S17** Offline: an `Offline` badge, and SumUp is disabled with `Needs internet` (s8.html, left).
- **S18** Terminal fails on Guest 4: the existing failure view. Guest 4 is still selected on return.
- **S19** Legacy: locked from the first payment, with the existing reason line (not drawn).
- **S20** 10 % off: bill line totals are discounted, and each guest tile already includes their part. One summary line says so (not drawn).
