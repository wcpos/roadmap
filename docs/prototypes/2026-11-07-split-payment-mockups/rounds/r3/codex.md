<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: r3 V3 — system-sheet Item rows read approximately 62 px high with padded steppers, while phone Item rows read approximately 44 px high with steppers flush against the borders (`shots/v3-system-desktop-light.png` versus `shots/v3-s2-phone-light.png`).

| Category | r3 V1 + sheet | r3 V3 + sheet | r0 V1 | r0 V2 | r0 V3 | Baseline | Chime | Revolut | Vipps | System gallery | Real tender |
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
| **Average** | **7.75** | **7.45** | **7.15** | **7.15** | **7.35** | **6.85** | **6.67** | **6.94** | **6.17** | **6.35** | **7.25** |

### r3 V1

1. **`shots/v1-s2-phone-light.png` — Clarity:** Selected rows end in $9.00 and $55.50, although this payment contains $4.50 and $18.50. The strongest row amounts do not reconcile with $23.00. **Smallest fix:** Put the selected contribution at the trailing edge; retain unit pricing beneath the item name.
2. **`shots/v1-phone-light.png` — Clarity:** “% / a share” sits under “Split the rest evenly,” mixing percentage and equal-payment choices under an inaccurate heading. **Smallest fix:** Rename the heading “Choose how to split” and label the percentage tile “Percent.”
3. **`shots/v1-states-desktop-light.png` — States covered:** No frame demonstrates S16: every item allocated with residual cents absorbed, rather than another payment required. **Smallest fix:** Add one rounding-resolution frame showing the last leg absorbing $0.02.

### r3 V3

1. **`shots/v3-s2-phone-light.png` — Spacing and alignment / Consistency:** Compressed item rows remove the system sheet’s vertical padding; steppers meet the row borders. **Smallest fix:** Restore the shared padded row treatment and scroll the item list above the fixed commit button.
2. **`shots/v3-s2-phone-light.png` — Clarity:** The trailing $9.00 and $55.50 describe whole lines, not the selected quantities. Their prominence competes with the actual contributions beneath the steppers. **Smallest fix:** Use $4.50 and $18.50 as the trailing selected amounts.
3. **`shots/v3-states-desktop-light.png` — States covered:** Percent is drawn only as a tab label; no percentage selection or resulting payment is shown. **Smallest fix:** Add a 25% frame showing $45.63 now and $136.87 remaining.