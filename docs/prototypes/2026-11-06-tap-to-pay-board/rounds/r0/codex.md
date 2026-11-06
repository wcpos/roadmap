<!-- judge: gpt-6.1-sol -->
| Category | v1 | v2 | v3 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 8 | 7 | 7.5 | 6 | 8 | 6.5 | 7 | 7 | 6 |
| Typography | 7 | 7 | 7 | 7 | 7 | 8 | 8 | 5 | 5 | 5 |
| Spacing and alignment | 7 | 7.5 | 6.5 | 8 | 7 | 8 | 7.5 | 8 | 8 | 8 |
| Colour and contrast — light | 8 | 8 | 8 | 8 | 7.5 | — | 8 | 8 | 8 | 8 |
| Colour and contrast — dark | 8 | 8 | 8 | — | — | 7.5 | — | — | 8 | 8 |
| Iconography and indicators | 8 | 7.5 | 7.5 | 7.5 | 6.5 | 8 | 7.5 | 7.5 | 7 | 7 |
| Consistency | 8 | 7.5 | 7.5 | 7.5 | 7 | 6.5 | 7 | 8 | 8 | 8 |
| Clarity for the person in the brief | 7.5 | 7 | 6.5 | 6.5 | 5 | 7.5 | 8 | 6 | 7 | 7 |
| Density | 6.5 | 7.5 | 5.5 | 7.5 | 6 | 8 | 8 | 8 | 8 | 8 |
| States covered | 8 | 8.5 | 6.5 | 2 | 2 | 2.5 | 3 | 2 | 3 | 2 |
| **Average** | **7.55** | **7.65** | **7.00** | **6.83** | **6.00** | **7.11** | **7.06** | **6.61** | **6.90** | **6.70** |

### v1

1. **`shots/v1-phone-light-p3.png`, P4 — Density.** The selected-terminal view draws only the tiles and Send button; the existing reader-change and amount-entry controls have no visible access. **Smallest fix:** restore the selected-reader line with Change and access to the existing amount controls below the grid.

2. **`shots/v1-phone-light-p1.png`, S1 — Spacing and alignment.** Selected occupies a separate action band beneath an otherwise short smart-reader row. Repeating this arrangement pushes the remembered reader’s Connect action below the initial phone viewport. **Smallest fix:** keep the existing Selected chip alongside the reader body rather than on its own vertical band.

3. **`shots/v1-phone-dark-p3.png`, P5 — Typography.** Two identically titled Tap to Pay tiles depend on small, muted provider help lines for differentiation. That distinction is difficult to scan at arm’s length. **Smallest fix:** make Stripe and SumUp help lines at least 14 px with normal secondary-text contrast.

### v2

1. **`shots/v2-phone-light-p3.png`, P4 — Density.** Selecting Stripe exposes Send but does not draw access to the existing reader-change or amount-entry controls. **Smallest fix:** restore the selected-reader Change line and existing amount-control access beneath the grid.

2. **`shots/v2-phone-light-p3.png`, P5b — Clarity for the person in the brief.** “Use this reader” switches ownership of the Tap to Pay tile, while the same label on smart readers selects a payment destination. “On the pay sheet” does not explain that distinction in cashier language. **Smallest fix:** label the phone-provider action “Use for Tap to Pay” and its selected state “Used for Tap to Pay.”

3. **`shots/v2-phone-dark-p1.png`, S4–S5 — Typography.** The decisive Selected indicator is small secondary text appended to another small state word. It is substantially less scannable than the adjacent action labels. **Smallest fix:** raise the state line to at least 14 px and retain a distinct, consistently placed Selected treatment.

### v3

1. **`shots/v3-phone-light-p2.png`, P1 — Hierarchy.** Card precedes Tap to Pay, contradicting the requirement that Tap to Pay come first among card options. **Smallest fix:** order the first four tiles Cash, Tap to Pay, Card, Stripe Terminal.

2. **`shots/v3-phone-light-p1.png`, S1–S5 — Density.** “Paying with” copies the selected reader rather than lifting it out of its original section. The cashier sees the same device twice, while setup and connection actions move farther down the page. **Smallest fix:** show the chosen reader once, in Paying with, retaining the unchosen readers in their original sections.

3. **`shots/v3-phone-light-p2.png`, S6 Android — States covered.** The Android route jumps directly to an SDK placeholder; the required app-owned pre-alert line is absent. **Smallest fix:** draw the Android phone row with the location-permission pre-alert and Continue before the SDK handoff.