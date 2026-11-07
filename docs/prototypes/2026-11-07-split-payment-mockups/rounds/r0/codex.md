<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: v1 — no system sheet; the change to the Split action-chip fill (white → #D9EAFF in light) is unjudged against its siblings.

SYSTEM BREAK: v2 — no system sheet; the change to the Split action-chip fill (white → #D9EAFF in light) is unjudged against its siblings.

SYSTEM BREAK: v3 — no system sheet; the change to the Split action-chip fill (white → #D9EAFF in light) is unjudged against its siblings.

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
| **Average — scored rows** | **6.5** | **6.4** | **6.5** | **6.8** | **6.4** | **5.9** | **6.1** | **5.8** | **6.7** |

### v1

1. **`shots/v1-s5-phone-light.png` — Hierarchy:** The six equal-split choices occupy the space needed to show completed, current and upcoming payments. “4 of 6” does not identify what happened. **Smallest fix:** replace that grid on the keypad with the plan strip; keep equal-split choices behind the existing Split control, below the method row.

2. **`shots/v1-s2-phone-light.png` — Clarity:** The rightmost amount means selected quantity for selected rows, but whole-line total for unselected rows: $4.50 beside Flat white, $20.00 beside Lemonade. **Smallest fix:** consistently show this payment’s contribution—$0.00 for unselected rows—and retain unit prices beneath names.

3. **`shots/v1-states-desktop-light.png` — States covered:** The last-leg frame resets D to $41.50 after the preceding frame accepted $40.00; it does not demonstrate carrying the shortfall forward. **Smallest fix:** redraw the final ledger with D at $40.00, E at $41.50 and F owing $43.00, then show change against that balance.

### v2

1. **`shots/v2-states-desktop-light.png` — Clarity:** “Guest” equates a person with one payment. The fixed-amount/card-then-cash scenario would misleadingly become two guests. **Smallest fix:** use “Payment” consistently and label the count “Payments in total.”

2. **`shots/v2-s2-phone-light.png` — Density:** Six guest tiles separate the amount and methods from the items being selected, consuming two rows during the item task. **Smallest fix:** collapse the chooser to the current payment and a count control; expand the other payments only when switching.

3. **`shots/v2-s5-desktop-dark.png` — Clarity:** Item provenance replaces the payment method with “Guest 1”; payment history also drops the purchased-item/top-up descriptions. **Smallest fix:** restore method names on paid item rows and concise item/top-up descriptions in payment history.

### v3

1. **`shots/v3-s5-phone-light.png` — Consistency:** Payment history, upcoming legs and Change split intervene between the amount and method row, breaking the binding pane order. **Smallest fix:** move the method row directly beneath the amount and place the plan strip below it.

2. **`shots/v3-s2-phone-light.png` — Clarity:** No method is visible while building the item payment, and “Pay for these” does not reveal whether it charges or opens another step. **Smallest fix:** retain the method row beneath the amount and label the commit with the selected method.

3. **`shots/v3-s5-phone-light.png` — Spacing and alignment:** Plan chips are approximately 32 px tall, with tightly packed targets and a small Change split link. These are difficult counter-height touch controls. **Smallest fix:** provide 44 px targets with 8 px gaps in a fixed grid, retaining visible done/now/next labels.