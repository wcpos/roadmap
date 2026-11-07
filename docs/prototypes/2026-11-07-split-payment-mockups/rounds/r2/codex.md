<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: r0 V1 — the selected phone ListItem reads a full primary outline while the selected desktop bill row reads only a primary left rule.

SYSTEM BREAK: r0 V2 — the selected phone ListItem reads a full primary outline while the selected desktop bill row reads only a primary left rule.

SYSTEM BREAK: r0 V3 — no system sheet; the change to compact plan-pill sizing is unjudged against its siblings.

| Category | r2 V1 | r2 V3 | r0 V1 | r0 V2 | r0 V3 | Baseline | Revolut | Splitwise-file¹ | Vipps | System gallery | System tender |
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
| **Average²** | **7.30** | **7.45** | **6.90** | **6.70** | **6.90** | **6.35** | **6.83** | **6.33** | **6.06** | **6.50** | **7.10** |

¹ The file named `ref-splitwise-split-options-phone-light.png` visibly depicts Chime.  
² Unavailable themes excluded; coverage and clarity judged against the supplied cashier brief.

### r2 V1

1. **Spacing and alignment — `shots/v1-phone-dark.png`, `shots/v1-s2-phone-light.png`.** Observed: the entry-screen commit collapses to a cyan hairline; the item-state commit ends around x=255, cutting off its label. **Smallest fix:** reserve a non-shrinking, full-width 56 px footer button with the existing 16 px side gutters.

2. **Clarity — `shots/v1-states-desktop-light.png`, frame s4.** Observed: while taking $20, “Split the rest evenly” offers three payments of $48.16—splitting the outstanding $144.50, not the $124.50 remaining after this payment. **Smallest fix:** scope that existing row to “After this payment: $124.50”; show three ways at $41.50 and retain the $20 first leg.

3. **Hierarchy — `shots/v1-s5-desktop-dark.png`.** Observed: “Payments” mixes recorded payments with proposed “Now” and “Then” rows, duplicating the plan strip. **Smallest fix:** remove the two forecast rows from the ledger; keep proposed payments exclusively in the plan strip.

### r2 V3

1. **Spacing and alignment — `shots/v3-s2-phone-light.png`.** Observed: the primary button is cut off around x=255, hiding the remaining-balance text and its right edge. **Smallest fix:** give the footer the available pane width, prevent shrinking, and retain both 16 px gutters.

2. **Density / clarity — `shots/v3-s2-phone-light.png`, `shots/v3-states-desktop-light.png`.** Observed: selected items offer “Add an amount,” but no visible control or rendered state shows sharing those items between people. “Even” does not communicate its scope. **Smallest fix:** use the existing Even route to show “Share selected $23.00” with two ways at $11.50; retain the item selection.

3. **States covered — `shots/v3-states-desktop-light.png`.** Observed: offline and saving are drawn, but terminal failure and return to the intact plan are absent. **Smallest fix:** add a failure/return inset showing three payments still recorded at $58.00 and payment 4 still due at $41.50.