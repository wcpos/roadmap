# Split payment hill climb — rounds

Anchors (shot once, never changed): `anchors/baseline-split-open-tablet-{light,dark}.png` (the real register frame with the split open), `anchors/baseline-split-even-desktop-light.png` (Paul's screenshot), `anchors/system-real-tender-keypad-tablet-{light,dark}.png`, `anchors/system-gallery-{light,dark}.png`, `anchors/ref-{chime,revolut,vipps}-*.png`.

Judges: Codex GPT-6.1 Sol (every round), Opus (joins when Sol has every category ≥ 9.0), Fable (the confirming round only). Each judge gets `JUDGE.md` verbatim, the round's shots, the anchors and (from round 1) round 0's shots as the baseline; never a previous score or another judge's output.

## Round 0 — three variants, Sol only

SYSTEM BREAK (Sol): v1, v2, v3 — no system sheet; the Split chip's `on` fill (`--selected`) is unjudged against its siblings. → every variant renders `variants/vN/system.html` in round 1.

| Category | v1 | v2 | v3 | Baseline | Revolut | Splitwise | Vipps | System gallery | System tender |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 7 | 6.5 | 7.5 | 8 | 7 | 7.5 | 6.5 | 7.5 |
| Typography | 7 | 7 | 6.5 | 8 | 8.5 | 8 | 8 | 5.5 | 7.5 |
| Spacing and alignment | 7 | 6.5 | 6.5 | 7.5 | 8 | 7.5 | 8 | 7 | 7.5 |
| Colour and contrast — light | 7.5 | 7.5 | 7.5 | 8 | — | 8 | 8 | 7.5 | 7.5 |
| Colour and contrast — dark | 7 | 7 | 7.5 | 7.5 | 8.5 | — | — | 7.5 | 7 |
| Iconography and indicators | 7 | 7.5 | 6.5 | 6.5 | 8 | 7 | 7 | 7.5 | 7.5 |
| Consistency | 5 | 5 | 5 | 9 | 4.5 | 4.5 | 4.5 | 9 | 9 |
| Clarity for the cashier | 6 | 5.5 | 6 | 5.5 | 5 | 4.5 | 5 | 2 | 5 |
| Density | 5.5 | 5 | 6.5 | 5.5 | 5.5 | 5 | 5.5 | 4 | 6 |
| States covered | 5.5 | 5.5 | 6 | 2.5 | 2 | 1.5 | 1.5 | 1 | 2 |
| Average | 6.5 | 6.4 | 6.5 | 6.8 | 6.4 | 5.9 | 6.1 | 5.8 | 6.7 |

**No pick in round 0.** Every variant carries a SYSTEM BREAK and sits under the baseline in Typography, Spacing and Consistency, so none may be picked or climbed yet. Round 1 fixes the break (system sheets), applies Sol's nine findings, and matches the baseline's type scale; the pick is made on round 1's columns.

Orchestrator's reading of Sol's v3 finding 1 (plan strip between the amount and the method row breaks the ruled order): the live keypad pane already draws the plan pills under the amount and above the method tiles (`tender-pane.tsx`, `checkout-plan` before the method `TileGrid`), and the ruling's words are "method selector directly under the amount, with helpers changing with it". A ONE-LINE plan status is part of the amount block; a tall block of history is not. Round 1 keeps the strip to one compact row directly under the amount, the method row immediately after.

## Round 1 — three variants with system sheets, Sol only (baseline = round 0 shots)

SYSTEM BREAK (Sol): V1, V2 — the system sheet's "picked bill row" sample reads a neutral outline, not the primary edge its caption claims (a drawing defect in the sheet; the subject pages draw the edge). V3: none.

| Category | Baseline | Revolut | Splitwise | Vipps | System gallery | System tender | R0 V1 | R0 V2 | R0 V3 | V1 | V2 | V3 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 8 | 8 | 7.5 | 6.5 | 8 | 8 | 8 | 7 | 8 | 8 | 8 |
| Typography | 8 | 8.5 | 8 | 8 | 6 | 8 | 7.5 | 7.5 | 7 | 8 | 8 | 8 |
| Spacing and alignment | 7.5 | 8 | 7.5 | 7.5 | 7 | 8 | 7 | 6.5 | 7 | 7.5 | 7 | 8 |
| Colour and contrast — light | 8 | — | 8 | 7.5 | 7.5 | 7.5 | 8 | 8 | 8 | 8 | 8 | 8 |
| Colour and contrast — dark | 7.5 | 8.5 | — | — | 7 | 7.5 | 7.5 | 7.5 | 7.5 | 8 | 8 | 8 |
| Iconography and indicators | 7.5 | 8 | 7.5 | 7.5 | 8 | 7.5 | 7 | 7.5 | 6.5 | 7 | 7.5 | 6.5 |
| Consistency | 8.5 | 8 | 8 | 8 | 9 | 9 | 5 | 5 | 5 | 5 | 5 | 8 |
| Clarity for the cashier | 5.5 | 6.5 | 6 | 5.5 | 5 | 6 | 6.5 | 7 | 6.5 | 7 | 7.5 | 7.5 |
| Density | 7 | 7.5 | 6.5 | 6.5 | 7 | 7.5 | 7 | 6 | 7.5 | 7.5 | 7 | 8 |
| States covered | 2.5 | 1.5 | 1.5 | 1.5 | 1.5 | 2 | 6 | 6 | 6 | 6.5 | 6 | 7 |
| Average | 6.95 | 7.17 | 6.78 | 6.61 | 6.45 | 7.10 | 6.95 | 6.90 | 6.80 | 7.25 | 7.20 | 7.70 |

**Decision after round 1: V2 dropped; V1 and V3 go to round 2; the pick is made on round 2's columns.**
- V2 (guests first) is dropped: lowest average, a SYSTEM BREAK, and two scenario failures the judge and the flow notes agree on (S11 "the rest in one tap" takes k−1 taps; S8 items shared by guests who also have their own items needs typed shares). The seat model also assumes a seated party; a retail queue does not have guests.
- V1 cannot be picked yet (SYSTEM BREAK on the sheet sample) and V3 cannot be picked yet (Iconography 6.5 and Consistency 8 under the baseline's 7.5 and 8.5). Both get their breaks fixed and the judge's findings applied.
- Pane order, settled for round 2: the judge twice read the plan strip between the amount and the method row as a break of the ruled order. Rather than argue the live app's precedent, both variants move the strip under the method row (amount → method row → plan strip + Change split → helpers → keypad). The ruling's words ("method selector directly under the amount") are then met literally.
- V3's 44 px ring is removed (the judge: it reads as a loading indicator; the pills already carry the plan).
- Both: the phone plan strip must never clip a pill (round 1 opened it scrolled to the end and cut "Now"); done pills collapse to one `✓ 3 paid` pill when the row overflows.
- Both: two compact state frames added for S15 (after Cancel payment, the plan recounts) and S20 (a 10 % discount, an item leg apportioned).
- V1 gains Percent as a `%` tile in the even row (the keypad then types a percent and the hero shows the amount with `25 % of $182.50` under it), so S4 is no longer a detour; its picked bill row drops the `new:` 3 px edge and reads the shared selected ListItem treatment instead.

## Round 2 — V1 and V3, Sol only (baseline = round 0 shots)

SYSTEM BREAK (Sol): none on the round 2 sets (the r0 sets carry historical breaks only).

| Category | r2 V1 | r2 V3 | r0 V1 | r0 V2 | r0 V3 | Baseline | Revolut | Splitwise | Vipps | System gallery | System tender |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 8 | 7 | 7 | 7 | 6.5 | 8.5 | 8 | 7 | 7 | 8 |
| Typography | 8 | 8 | 7.5 | 7.5 | 7.5 | 7 | 8.5 | 8 | 7.5 | 6.5 | 7.5 |
| Spacing and alignment | 5 | 6 | 7 | 6.5 | 7 | 6.5 | 8 | 7.5 | 7 | 7 | 8 |
| Colour and contrast — light | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | — | 8 | 8 | 8 | 8 |
| Colour and contrast — dark | 8 | 8 | 8 | 8 | 8 | 8 | 8.5 | — | — | 8 | 7.5 |
| Iconography and indicators | 8 | 8 | 7.5 | 7.5 | 7.5 | 7 | 8.5 | 7.5 | 7.5 | 8 | 7.5 |
| Consistency | 8.5 | 8.5 | 5 | 5 | 5 | 8 | 8.5 | 8 | 8 | 9 | 8.5 |
| Clarity for the cashier | 6 | 6.5 | 6 | 5.5 | 6 | 5 | 3.5 | 3 | 3 | 3 | 6.5 |
| Density | 6.5 | 6.5 | 6.5 | 5.5 | 6.5 | 5 | 6 | 5.5 | 5 | 7 | 7.5 |
| States covered | 7 | 6.5 | 6 | 6 | 6 | 2 | 1.5 | 1.5 | 1.5 | 1.5 | 2 |
| Average | 7.30 | 7.45 | 6.90 | 6.70 | 6.90 | 6.35 | 6.83 | 6.33 | 6.06 | 6.50 | 7.10 |

**No pick in round 2, for one shared defect.** Both variants sit under the baseline in Spacing and alignment only, and for the same reason: round 2's layout change broke the phone footer (the commit button shrinks to a hairline on the dark entry page and is cut off at x≈255 in the item state). Every other column is at or above the baseline for both. Round 3 fixes the footer on both, applies the judge's remaining findings, and the pick is made on round 3's columns. Orchestrator's leaning, recorded before round 3 so the pick is not post-hoc: V1 (fewest taps on Paul's table, the bill is the picker, no sub-view), with V3 the safer evolution of the 2026-09-11 approved pane; if round 3 leaves them tied on columns, the question goes to Paul with V1 recommended.

## Round 3 — V1 and V3 with footers fixed, Sol only (baseline = round 0 shots)

SYSTEM BREAK (Sol): V3 — the system sheet's Item rows read ≈62 px with padded steppers while the phone Item rows read ≈44 px with the steppers flush to the border. V1: none.

| Category | r3 V1 | r3 V3 | r0 V1 | r0 V2 | r0 V3 | Baseline | Chime | Revolut | Vipps | System gallery | Real tender |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8.5 | 7.5 | 7.5 | 7.5 | 7 | 8.5 | 8.5 | 7 | 6.5 | 8 |
| Typography | 8 | 8 | 7.5 | 7.5 | 7.5 | 7.5 | 8 | 8.5 | 7.5 | 5.5 | 8 |
| Spacing and alignment | 7.5 | 6.5 | 7 | 7 | 7 | 7.5 | 8.5 | 8 | 7.5 | 7 | 8 |
| Colour and contrast — light | 8.5 | 8.5 | 8 | 8 | 8.5 | 8 | 8 | — | 7.5 | 7.5 | 8 |
| Colour and contrast — dark | 8 | 8 | 7.5 | 7.5 | 8 | 8 | — | 8.5 | — | 7.5 | 7.5 |
| Iconography and indicators | 8 | 7.5 | 7 | 7.5 | 7 | 7.5 | 8 | 8.5 | 7.5 | 7.5 | 7 |
| Consistency | 8.5 | 5 | 8 | 8 | 8 | 8.5 | 7.5 | 7.5 | 7.5 | 8.5 | 9 |
| Clarity for the cashier | 7 | 7.5 | 6.5 | 6.5 | 6.5 | 5 | 3 | 4 | 3.5 | 4.5 | 6.5 |
| Density | 7 | 8 | 6.5 | 6 | 7.5 | 6.5 | 7 | 7.5 | 6 | 6.5 | 8 |
| States covered | 7 | 7 | 6 | 6 | 6 | 3 | 1.5 | 1.5 | 1.5 | 2.5 | 2.5 |
| Average | 7.75 | 7.45 | 7.15 | 7.15 | 7.35 | 6.85 | 6.67 | 6.94 | 6.17 | 6.35 | 7.25 |

**Pick: V1 ("the payment is built, not planned").** Columns first: V1 is at or above the baseline in every category and carries no SYSTEM BREAK; V3 carries a SYSTEM BREAK (phone Item rows 44 px against the sheet's 62 px) and sits under the baseline in Spacing. The pick agrees with the leaning recorded after round 2. From round 4 only V1 is climbed; V3 is kept as a rejected variant at its round 3 state.

Round 4 brief for V1 (Sol's three findings, with one taste call): the phone pick-list's trailing figure becomes the row's contribution to this payment (bold when picked, nothing when unpicked; unit price stays under the name) so the row amounts reconcile with the hero; the tablet ledger keeps its TOTAL column (it is the bill) and the contribution in the stepper cell. The even row's heading becomes `Split the rest` and the `%` tile reads `Percent · a share`. A new frame shows S16 (the last items picked, two residual cents absorbed into that payment).

## Round 4 — V1 only, Sol only (baseline = round 0 shots)

SYSTEM BREAK (Sol): none on the round 4 set (the r0 sets carry their historical breaks).

| Category | V1 r4 | V1 system sheet | V1 r0 | V2 r0 | V3 r0 | Baseline | Chime | Revolut | Vipps | System gallery | Real tender |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8.5 | 7.5 | 8 | 7.5 | 7.5 | 7 | 8.5 | 8 | 7.5 | 7 | 7.5 |
| Typography | 8.5 | 8 | 8 | 8 | 8 | 8 | 8.5 | 8.5 | 8 | 6.5 | 8 |
| Spacing and alignment | 7.5 | 6.5 | 7 | 6.5 | 7 | 7.5 | 8 | 8 | 7.5 | 7.5 | 8 |
| Colour and contrast — light | 8 | 8 | 8 | 8 | 8 | 8 | 8.5 | — | 8 | 7.5 | 7 |
| Colour and contrast — dark | 8 | 8 | 8 | 8 | 8 | 8 | — | 8 | — | 7.5 | 7 |
| Iconography and indicators | 8 | 8 | 7.5 | 7.5 | 7.5 | 7.5 | 8 | 8.5 | 8 | 8 | 8 |
| Consistency | 8.5 | 8.5 | 5 | 5 | 7 | 8.5 | 8 | 8 | 8 | 9 | 9 |
| Clarity for the cashier | 7.5 | 5 | 6.5 | 7 | 6.5 | 5 | 4.5 | 5.5 | 4.5 | 3.5 | 6 |
| Density | 8 | 6.5 | 7.5 | 6 | 6.5 | 5.5 | 5 | 6 | 5 | 6 | 7 |
| States covered | 7.5 | 3 | 6 | 6 | 6 | 2 | 1.5 | 2 | 1.5 | 2 | 2.5 |
| Average | 8.00 | 6.90 | 7.15 | 6.95 | 7.20 | 6.70 | 6.72 | 6.94 | 6.44 | 6.45 | 7.00 |

Five categories rose against round 3 (Hierarchy, Typography, Clarity, Density, States), none fell. No category has reached 9.0, so Opus does not join yet. Round 5 is the cap: Sol's three findings are applied (the collapsed `✓ 3 paid` pill becomes a disclosure with its expanded state drawn; the phone method and split tiles go to two fixed columns with the content above the pinned commit scrolling; a Share frame shows the people count and the per-person amount), then the climb stops at the cap whatever the table says.

## Round 5 — V1 only, Sol only (baseline = round 0 shots) — the cap

SYSTEM BREAK (Sol): V1 — keypad keys read 44 px on the entry phone page against 56 px on the system sheet and in s5 (round 5's two-column phone grid pushed the keypad under the pinned commit and shrank the keys).

| Category | R5 V1 | R0 V1 | R0 V2 | R0 V3 | Baseline | Chime | Revolut | Vipps | System gallery | System tender |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 7.5 | 7 | 7 | 8.5 | 8.5 | 7 | 6.5 | 8 |
| Typography | 8 | 7.5 | 7.5 | 7.5 | 7.5 | 8 | 8 | 7.5 | 6 | 7.5 |
| Spacing and alignment | 6 | 7.5 | 7 | 7 | 7.5 | 8 | 8 | 7 | 7 | 7.5 |
| Colour and contrast — light | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | — | 7.5 | 8 | 7 |
| Colour and contrast — dark | 8 | 8 | 8 | 8 | 8 | — | 8.5 | — | 7.5 | 6.5 |
| Iconography and indicators | 8 | 7.5 | 8 | 7.5 | 6.5 | 7.5 | 8 | 6.5 | 7.5 | 7 |
| Consistency | 5 | 7 | 7 | 7 | 8 | 8 | 8 | 7.5 | 9 | 9 |
| Clarity for the cashier | 7 | 6.5 | 6.5 | 6 | 5 | 4.5 | 5 | 4.5 | 3.5 | 6 |
| Density | 6 | 7.5 | 6.5 | 7 | 5 | 5.5 | 6 | 5.5 | 6.5 | 7 |
| States covered | 8 | 6 | 6 | 6.5 | 2.5 | 1 | 1 | 1 | 1 | 2.5 |
| Average | 7.25 | 7.40 | 7.25 | 7.20 | 6.55 | 6.61 | 6.78 | 6.00 | 6.25 | 6.80 |

Spacing (7.5 → 6), Consistency (8.5 → 5) and Density (8 → 6) fell, all from one change: round 4's finding asked for two-column phone tiles; applied, it pushed the keypad under the commit and shrank the keys, which the same judge then scored down. Per the rule, the change is reverted (round 5b: round 4's phone layout restored; s14 and s15 kept), and one real defect the judge found is fixed (Caesar salad's line total read $30.00 for 2 × $16.00). The percent-choices finding (s11) is not taken: the cap is reached, and it would be new work. Round 5b is a revert-and-confirm, not a climb round; the climb stops after it whatever the table says.

## Round 5b — the revert, V1 only, Sol only (baseline = round 0 shots) — final

SYSTEM BREAK (Sol): none on the round 5b set.

| Category | r5b V1 | V1 system sheet | r0 V1 | r0 V2 | r0 V3 | Baseline | Chime | Revolut | Vipps | System gallery | System tender |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8.5 | 7.5 | 8 | 8 | 7 | 7 | 8.5 | 8.5 | 7 | 7.5 | 8 |
| Typography | 8.5 | 8.5 | 8 | 8 | 8 | 8 | 8.5 | 8 | 7.5 | 7 | 8 |
| Spacing and alignment | 7 | 7 | 8 | 7 | 7.5 | 8 | 8 | 8 | 7.5 | 8 | 8 |
| Colour and contrast — light | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | — | 7 | 8 | 7.5 |
| Colour and contrast — dark | 8 | 8 | 8 | 8 | 8.5 | 8 | — | 8.5 | — | 8 | 7 |
| Iconography and indicators | 8 | 8 | 7.5 | 8 | 8 | 8 | 8 | 8 | 6.5 | 8.5 | 7.5 |
| Consistency | 9 | 9 | 5 | 5 | 8 | 8.5 | 7.5 | 7.5 | 7.5 | 9 | 9 |
| Clarity for the cashier | 7.5 | 5 | 7 | 7 | 6.5 | 5.5 | 5.5 | 6 | 5.5 | 4.5 | 7 |
| Density | 8 | 7.5 | 7.5 | 7 | 7 | 6 | 6.5 | 7.5 | 6 | 7.5 | 8 |
| States covered | 8.5 | 2.5 | 6.5 | 5.5 | 6.5 | 2.5 | 2 | 2.5 | 2 | 1.5 | 2 |
| Average | 8.15 | 7.15 | 7.40 | 7.20 | 7.55 | 7.00 | 7.00 | 7.17 | 6.28 | 6.95 | 7.20 |

**Stop: round cap reached (5 rounds plus the revert).** The revert closed the break (Consistency 9, no SYSTEM BREAK) and restored the fallen categories (Spacing 6 → 7, Density 6 → 8); the delivered state is round 5b (average 8.15, the climb's best). No category reached 9.0 in two consecutive rounds, so Opus never joined and Fable did not judge; the tables above are Sol's alone, and the stop is the cap, not the bar.

Not applied, with reason: Sol's round 5b finding 1 asks again for two-column phone tiles, the change Sol asked for in round 4, scored down in round 5 (keys shrank, keypad under the commit) and this revert undid; the real pane's `phone ? 2 : 5` rule is a build-time question for the method grid, not a mockup change. Finding 2 (`Items · 2` chip should read `Back to keypad`) and finding 3 (`Whole bill only` under the locked Legacy segment) are good and small; they go into the build spec as copy, not another round. The salad-total finding of round 5 was a misread: no page carries `$30.00`.

## Post-climb (unscored) — `rounds/final`

Two frames changed after the cap, shot into `rounds/final` without a judge: `s11` gained the percent chips the last round asked for (`10 % · 20 % · 25 % · 50 % · Type` under `Percent of the rest`), and `s7` leads with the change (`Change $7.75` in the success tone, `Tendered $50.00 · Total $182.50` under it) to match monorepo #3393, merged on `main` while the climb ran. `index.html` is built from `rounds/final`.
