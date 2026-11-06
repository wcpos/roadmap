<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: V1 r5 — no system sheet; the change from whole-tile dimming to icon/title-only dimming is unjudged against disabled sibling controls.

| Category | V1 r5 | V1 r4 baseline | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System anchors |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 6.5 | 6 | 8.5 | 7 | 7 |
| Typography | 8 | 8 | 7 | 7 | 8.5 | 8 | 6 |
| Spacing and alignment | 8 | 8 | 7.5 | 7 | 8.5 | 8 | 8 |
| Colour and contrast (light) | 8.5 | 7 | 8 | 8 | — | 8 | 8.5 |
| Colour and contrast (dark) | 8 | 6.5 | — | — | 7 | — | 8 |
| Iconography and indicators | 8 | 8 | 6.5 | 5 | 8 | 7.5 | 7.5 |
| Consistency | 5 | 7.5 | 7.5 | 7 | 7.5 | 7.5 | 9 |
| Clarity for the person in the brief | 7 | 7 | 6.5 | 5.5 | 7.5 | 7 | 7.5 |
| Density | 7 | 7 | 7 | 6.5 | 8 | 7 | 8 |
| States covered | 8 | 8 | 2 | 2 | 2.5 | 2.5 | 2 |
| **Average** | **7.55** | **7.50** | **6.50** | **6.00** | **7.33** | **6.94** | **7.15** |

### V1

1. **`shots/v1-phone-light-p4.png` — Density:** P4 hides Tap to Pay behind “Other tenders”; switching from the selected terminal now takes two taps, contrary to the one-tap requirement. **Smallest fix:** retain a Tap to Pay tile beside the selected terminal.

2. **`shots/v1-phone-dark-p4.png` — Clarity:** The keypad replaces the existing clear key with “00”; no visible control clears an entered amount in one action. **Smallest fix:** restore “C” in the bottom-left key.

3. **`shots/v1-phone-dark-p3.png` — Clarity:** P1’s ready Tap to Pay tile omits the required “This device” help line, while Stripe names “Counter 1”. The cashier must infer which reader Tap to Pay uses. **Smallest fix:** add “This device” beneath the single-provider Tap to Pay title; retain provider help lines in P5.