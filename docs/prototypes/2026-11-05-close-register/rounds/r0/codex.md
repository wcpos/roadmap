<!-- judge: gpt-6-astra -->
| Category | V1 · Side sheet | V2 · Counting desk | V3 · Equation |
|---|---:|---:|---:|
| Hierarchy | 7.5 | 7 | 7.5 |
| Typography | 8 | 8 | 8 |
| Spacing and alignment | 4 | 4 | 4 |
| Colour and contrast (light) | 7.5 | 7.5 | 7.5 |
| Colour and contrast (dark) | 7.5 | 7.5 | 7.5 |
| Iconography and indicators | 7 | 7 | 7 |
| Consistency | 5 | 5 | 5 |
| Clarity for the person in the brief | 6 | 5.5 | 5.5 |
| Density | 8 | 6 | 5.5 |
| States covered | 8 | 8 | 8 |
| **Average** | **6.85** | **6.55** | **6.55** |

### V1 — Observed findings

1. **Files:** `shots/v1-phone-light.png`, `shots/v1-phone-dark.png`  
   **Category:** Spacing and alignment  
   The pane clips its left edge while leaving a white strip on the right. The heading, amount, note and banking figures lose content. **Smallest fix:** remove the phone’s horizontal offset and fit the pane and footer to the full 390 px viewport.

2. **Files:** `shots/v1-desktop-light.png`, `shots/v1-desktop-dark.png` — first-ever close  
   **Category:** Clarity  
   “Unchecked +$150.00” looks like a known discrepancy even though the opening float is unknown. **Smallest fix:** show “Difference unknown” with “Opening float not recorded”; retain the sales-based expected amount and existing entry action.

3. **Files:** `shots/v1-desktop-light.png`, `shots/v1-desktop-dark.png` — offline  
   **Category:** States covered  
   “Offline — saves on this device” does not tell the cashier whether the closure will subsequently reach Reports elsewhere. **Smallest fix:** use one badge reading “Offline · saves here, syncs when online.”

### V2 — Observed findings

1. **Files:** `shots/v2-phone-light.png`, `shots/v2-phone-dark.png`  
   **Category:** Spacing and alignment  
   The close control, labels and note are clipped on the left; the right edge has an unused white strip. **Smallest fix:** remove the desktop horizontal offset below the phone breakpoint and use the full viewport width.

2. **Files:** `shots/v2-phone-light.png`, `shots/v2-phone-dark.png`  
   **Category:** Density  
   “Count by notes and coins” appears below the note and closing action, although it changes how the cashier performs the first step. **Smallest fix:** move it directly beneath the counted amount, before reconciliation and the keypad.

3. **Files:** `shots/v2-desktop-light.png`, `shots/v2-desktop-dark.png`  
   **Category:** Hierarchy  
   The large keypad remains visually dominant while the note is focused and required; the amount also retains a competing caret. **Smallest fix:** collapse the keypad when editing the note and restore it when the amount is selected.

### V3 — Observed findings

1. **Files:** `shots/v3-phone-light.png`, `shots/v3-phone-dark.png`  
   **Category:** Spacing and alignment  
   Horizontal clipping removes the close control, currency symbol and beginnings of labels, despite unused space on the right. **Smallest fix:** reset the phone container’s horizontal offset and fit its content and footer to the viewport.

2. **Files:** `shots/v3-phone-light.png`, `shots/v3-phone-dark.png`  
   **Category:** Density  
   The phone shows neither the retained float, banking amount nor other-payments disclosure, despite substantial blank space above Close. **Smallest fix:** place the existing allocation summary and tender disclosure beneath the note.

3. **Files:** `shots/v3-desktop-light.png`, `shots/v3-desktop-dark.png`, `shots/v3-phone-light.png`, `shots/v3-phone-dark.png`  
   **Category:** Clarity  
   The discrepancy card still instructs “Add a note to explain” after a note has been entered and Close is enabled. **Smallest fix:** remove that instruction once the note requirement is satisfied.