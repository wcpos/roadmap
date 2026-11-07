<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: R0 V1 — no system sheet; the 52 px phone keypad-height treatment is unjudged against its siblings.

SYSTEM BREAK: R0 V2 — no system sheet; the 52 px phone keypad-height treatment is unjudged against its siblings.

SYSTEM BREAK: R0 V3 — no system sheet; the 52 px phone keypad-height treatment is unjudged against its siblings.

SYSTEM BREAK: V1 — the selected ListItem reads a 1 px primary outline while the picked bill-row sample reads a 1 px neutral outline, without its caption’s claimed primary edge.

SYSTEM BREAK: V2 — the selected ListItem reads a 1 px primary outline while the picked bill-row sample reads a 1 px neutral outline, without its caption’s claimed primary edge.

| Category | Baseline | Revolut ref | Splitwise ref | Vipps ref | System gallery | System tender | R0 V1 | R0 V2 | R0 V3 | V1 | V2 | V3 |
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
| **Average** | **6.95** | **7.17** | **6.78** | **6.61** | **6.45** | **7.10** | **6.95** | **6.90** | **6.80** | **7.25** | **7.20** | **7.70** |

### V1

1. **`shots/v1-system-desktop-light.png`, `shots/v1-system-desktop-dark.png` — Consistency.** Observed: the picked bill-row sample lacks the primary selection edge used by the neighbouring selected ListItem; its caption claims an absent 3 px edge. **Smallest fix:** use the shared selected ListItem’s primary perimeter and muted fill for selected item rows, including the ledger samples.

2. **`shots/v1-s5-phone-light.png`, `shots/v1-s5-desktop-dark.png` — Hierarchy.** Observed: the plan strip separates the amount from the method row, violating the binding pane order. **Smallest fix:** move the strip immediately below the method tiles.

3. **`shots/v1-states-desktop-light.png` — States covered / clarity.** Observed: no percentage control or percentage-building state is shown. The visible keypad and equal-share tiles do not tell a returning cashier how to take 25%. **Smallest fix:** expose Percent through the existing Split control and draw one percentage-selection state.

### V2

1. **`shots/v2-system-desktop-light.png`, `shots/v2-system-desktop-dark.png` — Consistency.** Observed: selected ListItems have primary outlines, but the picked bill-row sample retains a neutral outline. **Smallest fix:** apply the same shared selected-row treatment to both, and make the ledger match the sheet.

2. **`shots/v2-s2-phone-light.png` — Spacing and alignment / clarity.** Observed: previous/next guest arrows touch, and sit beside another minus/plus pair controlling guest count. Inferred: hurried taps can change the party size instead of the active guest. **Smallest fix:** put the count stepper on its own labelled row and give the navigation arrows the required 8 px gap.

3. **`shots/v2-states-desktop-light.png` — States covered.** Observed: neither percentage entry nor sharing selected items between several people is drawn. Guest count visibly distributes the remainder, not the selected items. **Smallest fix:** expose these choices through the existing Split control and render their resulting allocations.

### V3

1. **`shots/v3-s5-phone-light.png`, `shots/v3-s5-desktop-dark.png` — Hierarchy.** Observed: the plan strip again intervenes between amount and payment method. **Smallest fix:** place the method row directly beneath the amount, then the plan strip.

2. **`shots/v3-phone-light.png`, `shots/v3-s2-phone-light.png` — Iconography and indicators.** Observed: the small ring has no labelled meaning; its segments must communicate progress beside amounts already explained by the balance bar. Inferred: it can read as a loading indicator. **Smallest fix:** remove it and retain the explicit payment number and remaining amount.

3. **`shots/v3-states-desktop-light.png` — States covered.** Observed: offline and saving are drawn, but cancellation/recount, terminal failure/return, and discounted item allocation are not. Their payment consequences remain unverified. **Smallest fix:** add compact frames showing the restored plan after cancellation/failure and one apportioned discounted item leg.