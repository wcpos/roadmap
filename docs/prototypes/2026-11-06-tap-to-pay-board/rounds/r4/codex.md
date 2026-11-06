<!-- judge: gpt-6.1-sol -->
| Category | V1 r4 | V1 r3 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 7.5 | 7 | 9 | 8.5 | 7.5 | 8 | 7.5 |
| Typography | 8 | 8 | 7 | 7 | 8.5 | 8 | 7 | 7 | 7 |
| Spacing and alignment | 7.5 | 7.5 | 8 | 6.5 | 8.5 | 8 | 8 | 8 | 8 |
| Colour and contrast — light | 8 | 8 | 8 | 7.5 | — | 8 | 8.5 | 8.5 | 8.5 |
| Colour and contrast — dark | 7.5 | 7.5 | — | — | 8 | — | — | 8 | 8 |
| Iconography and indicators | 8 | 8 | 7.5 | 6 | 8 | 7.5 | 8 | 8 | 8 |
| Consistency | 8.5 | 8.5 | 8 | 7 | 8 | 8 | 8.5 | 8.5 | 8.5 |
| Clarity for the person in the brief | 7.5 | 7.5 | 6.5 | 5.5 | 8 | 8 | 7.5 | 7.5 | 7.5 |
| Density | 7.5 | 7 | 7 | 6.5 | 8 | 8.5 | 8 | 8 | 7.5 |
| States covered | 8.5 | 6.5 | 2 | 2.5 | 3 | 3.5 | 2.5 | 3 | 2.5 |
| **Average** | **7.90** | **7.65** | **6.83** | **6.17** | **7.67** | **7.56** | **7.28** | **7.45** | **7.30** |

### V1 r4 — three highest-leverage findings

1. **`shots/v1-desktop-light-p2.png`, `shots/v1-desktop-dark-p2.png` — Colour and contrast.** Disabled-tile explanations fade along with the controls. “No terminals set up” measures approximately **2.16:1 light / 2.26:1 dark**, making the reason difficult to read. **Smallest fix:** retain dimmed icons and titles, but render explanatory text at normal muted-text contrast.

2. **`shots/v1-desktop-light-p2.png` — Density.** P4 removes the existing full-balance shortcut shown in `baseline-checkout-reader-line-2026-10-07.png`. After changing the payment amount, the cashier has no visible one-tap reset to the outstanding balance. **Smallest fix:** restore the full-balance control immediately above the keypad.

3. **`shots/v1-desktop-light-p1.png`, `shots/v1-desktop-dark-p1.png` — States covered.** S6 explicitly substitutes stand-in iOS copy and an explanatory Android SDK placeholder. These do not demonstrate the required awareness and terms screens. **Smallest fix:** replace the iOS stand-in with the approved copy and populate the existing Android frame with an SDK screenshot.