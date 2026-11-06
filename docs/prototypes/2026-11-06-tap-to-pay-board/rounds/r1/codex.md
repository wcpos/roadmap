<!-- judge: gpt-6.1-sol -->
| Category | v1 · r1 | v1 · r0v1 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8.5 | 8.5 | 8 | 7 | 9 | 8.5 | 8 | 8 | 7.5 |
| Typography | 7.5 | 8 | 8 | 7.5 | 8.5 | 8.5 | 7 | 7 | 7 |
| Spacing and alignment | 8 | 7 | 8.5 | 7.5 | 8.5 | 8.5 | 8.5 | 8 | 8.5 |
| Colour and contrast (light) | 8.5 | 8.5 | 8.5 | 8 | — | 8.5 | 8 | 8.5 | 7.5 |
| Colour and contrast (dark) | 8 | 8 | — | — | 8 | — | — | 8 | 7 |
| Iconography and indicators | 8.5 | 8.5 | 8 | 7 | 8.5 | 8 | 8 | 8 | 8 |
| Consistency | 8.5 | 8.5 | 8.5 | 7.5 | 7 | 7.5 | 9 | 9 | 9 |
| Clarity for the person in the brief | 7.5 | 8 | 8 | 5.5 | 8 | 8.5 | 8 | 8 | 7.5 |
| Density | 6.5 | 6.5 | 8.5 | 8 | 8.5 | 9 | 8 | 8.5 | 8 |
| States covered | 7.5 | 7.5 | 2.5 | 2.5 | 3 | 3.5 | 2 | 2.5 | 2 |
| **Average** | **7.90** | **7.90** | **7.61** | **6.72** | **7.67** | **7.83** | **7.39** | **7.55** | **7.20** |

### v1 · r1

1. **`shots/v1-desktop-light.png`, `shots/v1-desktop-dark.png` — Typography / clarity.** S1 truncates the principal label to “Tap to Pay on iPho…” beside its provider badge and Set up button. The S7 smart-reader identifiers also become narrow stacks. **Smallest fix:** let the name and identifiers retain readable width; move the provider badge below the name and wrap the complete action group underneath when necessary.

2. **`shots/v1-phone-light-p3.png`, `shots/v1-phone-dark-p3.png` — Density.** P4 replaces the existing selected-tender amount controls with a full-balance Send button. Neither amount entry nor a route to it is visible, unlike the baseline checkout and tablet reference. **Smallest fix:** retain an explicit amount-editing entry point to the existing keypad, and draw its expanded state.

3. **`shots/v1-desktop-light.png` — States covered.** Tablet-width coverage stops at S1 and P1. The selected/disconnected action combinations, preparation, two-provider checkout and terminal moment are demonstrated only at phone width. **Smallest fix:** add the missing tablet-light state frames, particularly S4/S5 and P5/P7, without introducing another layout design.