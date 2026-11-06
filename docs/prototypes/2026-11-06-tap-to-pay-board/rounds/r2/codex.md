<!-- judge: gpt-6.1-sol -->
| Category | v1 · r2 | v1 · r1 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 8 | 8 | 6.5 | 8.5 | 8 | 8 | 8 | 7.5 |
| Typography | 7 | 6.5 | 7.5 | 7 | 8 | 8 | 6.5 | 6.5 | 6.5 |
| Spacing and alignment | 7 | 7 | 8.5 | 7 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 |
| Colour and contrast (light) | 8 | 8 | 8.5 | 8 | — | 8.5 | 8 | 8 | 8 |
| Colour and contrast (dark) | 8 | 8 | — | — | 7.5 | — | — | 8 | 7.5 |
| Iconography and indicators | 8.5 | 8.5 | 8 | 6.5 | 8 | 8 | 8 | 8 | 7.5 |
| Consistency | 8.5 | 8.5 | 8.5 | 7.5 | 7 | 7.5 | 9 | 9 | 9 |
| Clarity for the person in the brief | 8 | 7.5 | 8 | 5.5 | 8 | 8.5 | 7.5 | 8 | 7.5 |
| Density | 6 | 7 | 8 | 7 | 8 | 8.5 | 8 | 8.5 | 8 |
| States covered | 8 | 7 | 2 | 2 | 2.5 | 3 | 1 | 1.5 | 1 |
| **Average** | **7.65** | **7.60** | **7.44** | **6.33** | **7.33** | **7.61** | **7.17** | **7.40** | **7.10** |

### v1 · r2

1. **`shots/v1-phone-light-p3.png`, `shots/v1-phone-dark-p3.png` — Density.** P4 grows beyond the required 844 px phone height. Measured in light: the frame is approximately 1,011 px tall; Send starts 877 px below its top, entirely outside the viewport. **Smallest fix:** after selecting a method, collapse the tile grid into a selected-method summary with Change, keeping the keypad and Send visible.

2. **`shots/v1-phone-light-p1.png`, `shots/v1-phone-dark-p1.png` — Typography.** Operational states—including Online, Offline, Not connected and the administrator restriction—use approximately 12 px text, below the brief’s 14 px minimum for cashier reading. **Smallest fix:** raise state and instructional text to 14 px; retain 12 px only for incidental metadata.

3. **`shots/v1-desktop-light-p1.png`, `shots/v1-desktop-light-p2.png` — States covered.** Tablet coverage stops at S1/S4/S5 and P1/P4/P5. Preparing, cashier restrictions, awareness, store lock/update, offline checkout and the terminal moment remain undrawn at that width. **Smallest fix:** add tablet frames for those existing states without introducing new layouts.