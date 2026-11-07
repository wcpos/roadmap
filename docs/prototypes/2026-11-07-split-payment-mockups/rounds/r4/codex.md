<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: r0 V1 — no system sheet; the change to the selected ListItem border (full perimeter → leading accent bar) is unjudged against its siblings.

SYSTEM BREAK: r0 V2 — no system sheet; the change to the selected ListItem border (full perimeter → leading accent bar) is unjudged against its siblings.

| Category | V1 r4 | V1 system sheet | V1 r0 | V2 r0 | V3 r0 | Product baseline | Chime | Revolut | Vipps | System gallery | Real tender |
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
| **Average** | **8.00** | **6.90** | **7.15** | **6.95** | **7.20** | **6.70** | **6.72** | **6.94** | **6.44** | **6.45** | **7.00** |

### V1 r4

1. **`shots/v1-s5-phone-light.png` — Clarity:** “3 paid · $58.00” hides the individual payments and methods, with no visible disclosure affordance. The phone cashier cannot check which payment was taken incorrectly. **Smallest fix:** make this pill an explicit disclosure to the recorded-payment list, add a chevron, and draw its expanded state.

2. **`shots/v1-phone-light.png`, `shots/v1-phone-dark.png` — Spacing and alignment:** method and split tiles occupy three columns, contrary to the brief’s one-or-two-column phone grid. Longer translated labels have little room. **Smallest fix:** use two fixed columns for these tile groups, with scrolling content above the pinned commit button.

3. **`shots/v1-states-desktop-light.png` — States covered:** “Share” is drawn as an entry control, and shared payments appear in history, but no frame shows choosing *k* people or the resulting per-person amount. S8’s critical decision remains unreviewable. **Smallest fix:** add one expanded Share frame with selected items, the people count, and the calculated payment amount.