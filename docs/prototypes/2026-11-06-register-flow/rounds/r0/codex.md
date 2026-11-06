<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: V1 — no system sheet; the change to amount-input typography is unjudged against its siblings.

SYSTEM BREAK: V2 — no system sheet; the change to amount-input border treatment is unjudged against its siblings.

SYSTEM BREAK: V3 — no system sheet; the change to selected-row fill (#EAF4FF in light) is unjudged against its siblings.

| Category | V1 | V2 | V3 | Family close | Base ref | Shopify ref | System gallery |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 6.5 | 8 | 7 | 9 | 9 | 8 | 7 |
| Typography | 7 | 8 | 7 | 8.5 | 8.5 | 8 | 7 |
| Spacing and alignment | 7 | 7.5 | 7 | 8.5 | 8.5 | 8.5 | 7 |
| Colour and contrast — light | 7.5 | 7.5 | 7.5 | 8.5 | 7 | 7.5 | 7.5 |
| Colour and contrast — dark | 7.5 | 7.5 | 7.5 | 8.5 | — | — | 7 |
| Iconography and indicators | 7 | 7 | 7.5 | 8 | 7 | 8 | 7.5 |
| Consistency | 5 | 5 | 5 | 6.5 | 8 | 8 | 8 |
| Clarity for the person in the brief | 6 | 6.5 | 6.5 | 8.5 | 7 | 6 | 3 |
| Density | 6.5 | 7 | 6.5 | 8.5 | 8 | 7.5 | 6.5 |
| States covered | 5.5 | 5 | 6 | 3 | 1 | 1 | 2 |
| **Average** | **6.55** | **6.90** | **6.75** | **7.75** | **7.11** | **6.94** | **6.25** |

### V1

1. **`shots/v1-desktop-dark.png` — Hierarchy:** Drawer cash and session sales have equal-sized figures, making two numbers compete. **Smallest fix:** retain both ruled tiles but reduce session sales to secondary typography.
2. **`shots/v1-phone-light.png` — Clarity:** Closure rows show an unlabelled expected amount, omit counted cash, and bury the difference inside a badge. **Smallest fix:** add a compact, labelled Expected · Counted · Difference subrow; keep the result badge separate. Add the missing Difference column on desktop.
3. **`shots/v1-desktop-light.png` — States covered:** “Closure 42 written” shows totals and a note but no accounting ladder. **Smallest fix:** add an expandable ladder beneath the three tiles, including float, sales, refunds and movements.

### V2

1. **`shots/v2-desktop-light.png` — Density:** The count keypad displaces the family’s other-payments disclosure, and there is no visible way to change the leave-in-drawer amount. Complexity has disappeared rather than folded away. **Smallest fix:** restore the collapsed other-payments row and the family’s “Change” action.
2. **`shots/v2-desktop-dark.png` — States covered:** The written moment replaces the required three tiles and ladder with a variance headline. The cashier cannot inspect the accounting behind the shortage. **Smallest fix:** restore Counted · Expected · Variance and an expandable ladder.
3. **`shots/v2-phone-light.png` — Spacing and alignment:** Reason chips are approximately 32 px tall, below the 44 px touch minimum. **Smallest fix:** enlarge their bounded targets to at least 44 px and place them in explicit rows with 8 px gaps.

### V3

1. **`shots/v3-desktop-light.png` — Hierarchy:** The count opens with the full expected-cash ledger expanded, while counted cash has lost the family anchor’s prominence. **Smallest fix:** collapse Expected initially and restore the larger counted-cash treatment.
2. **`shots/v3-phone-light.png` — Clarity:** The ledger retains Difference but drops Expected and Counted. An owner can identify a shortage without checking its basis. **Smallest fix:** retain both values in a labelled second line beneath each register row.
3. **`shots/v3-phone-dark.png` — States covered:** Phone frames omit first-ever opening, empty-amount validation, offline approval and the unsynced written closure. Desktop examples do not establish those phone layouts. **Smallest fix:** draw those four phone states in both themes using the existing panes.