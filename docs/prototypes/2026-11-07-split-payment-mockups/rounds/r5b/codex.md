<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: r0 V1 — no system sheet; the change from the system’s thin selected-ListItem perimeter to a 3 px selected bill-row left edge is unjudged against its siblings.

SYSTEM BREAK: r0 V2 — no system sheet; the change from the system’s thin selected-ListItem perimeter to a 3 px selected bill-row left edge is unjudged against its siblings.

| Category | r5b V1 | V1 system sheet | r0 V1 | r0 V2 | r0 V3 | Baseline split | Chime | Revolut | Vipps | System gallery | System tender |
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
| **Average** | **8.15** | **7.15** | **7.40** | **7.20** | **7.55** | **7.00** | **7.00** | **7.17** | **6.28** | **6.95** | **7.20** |

### r5b V1

1. **`shots/v1-phone-light.png` — Spacing and alignment:** Method and split tiles remain three across, contrary to the binding one-or-two-column phone grid. Little room remains for translated labels. **Smallest fix:** use two columns in a scrollable controls region, preserving the 56 px keypad keys and commit button.

2. **`shots/v1-s2-phone-light.png` — Clarity:** The item list replaces the keypad, but `Items · 2` communicates a count, not how to return. `+ amount` appears to require adding something. **Smallest fix:** relabel the existing picker-toggle chip `Back to keypad`; retain the selected-item count alongside it if space permits.

3. **`shots/v1-s5-phone-light.png` — States covered:** Locked `Legacy` gives no reason for its unavailability or warning that it takes the whole order. The lock alone does not explain the payment restriction. **Smallest fix:** add `Whole bill only` beneath the disabled segment label.