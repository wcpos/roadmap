<!-- judge: gpt-6.1-sol -->
| Category | v1 · r3 | v1 · r2 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System list rows | System tiles |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7 | 6.5 | 7 | 6 | 8.5 | 8 | 8 | 8 | 7 |
| Typography | 8 | 7 | 7.5 | 7 | 8 | 8 | 6.5 | 6.5 | 6.5 |
| Spacing and alignment | 7.5 | 7 | 7 | 6.5 | 8 | 8 | 8 | 8 | 8 |
| Colour and contrast · light | 8 | 8 | 8 | 7.5 | — | 8 | 8.5 | 8.5 | 8 |
| Colour and contrast · dark | 8 | 8 | — | — | 8 | — | — | 7.5 | 7.5 |
| Iconography and indicators | 8 | 8 | 7.5 | 6.5 | 8.5 | 7.5 | 7 | 8 | 7.5 |
| Consistency | 8 | 8 | 8 | 7 | 7.5 | 7.5 | 9 | 9 | 9 |
| Clarity for the person in the brief | 7.5 | 7 | 7.5 | 5.5 | 8 | 8 | 6 | 7 | 6 |
| Density | 7 | 6.5 | 7.5 | 6.5 | 8 | 8 | 8 | 8 | 8 |
| States covered | 7.5 | 6.5 | 2 | 2 | 2 | 2 | 1 | 1.5 | 1 |
| **Average · available rows** | **7.7** | **7.3** | **6.9** | **6.1** | **7.4** | **7.2** | **6.9** | **7.2** | **6.9** |

### v1 · r3

1. **`shots/v1-desktop-light-p2.png`, P4; `shots/v1-phone-dark-p3.png`, P4 — Density.** Selecting Stripe collapses the grid and hides Tap to Pay behind **Change tender**. It now takes two taps rather than one. **Smallest fix:** retain the Tap to Pay tile beside the selected Stripe tile in the collapsed view, in both themes and widths.

2. **`shots/v1-desktop-light-p2.png`, P4 — Hierarchy.** Two equally prominent **18,00 £** figures compete: the order total and the payment amount immediately below it. The phone and tablet repeat this. **Smallest fix:** demote the order total to a compact balance line once the keypad opens; keep the payment amount as the sole large figure.

3. **`shots/v1-desktop-light-p1.png` and `shots/v1-desktop-light-p2.png` — States covered.** The tablet set omits S2’s cashier setup restriction, S7’s update/store-lock case, and P2/P3’s administrator-versus-cashier checkout setup states. Phone frames do not establish that these survive the rail layout. **Smallest fix:** add those four tablet-light frames using the existing layouts.