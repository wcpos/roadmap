<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: R5 V1 — system-sheet and state-5 Keypad keys read 56 px high while entry-phone Keypad keys read 44 px high.

| Category | R5 V1 | R0 V1 | R0 V2 | R0 V3 | Baseline anchors | Chime | Revolut | Vipps | System gallery | System tender |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 7.5 | 7 | 7 | 8.5 | 8.5 | 7 | 6.5 | 8 |
| Typography | 8 | 7.5 | 7.5 | 7.5 | 7.5 | 8 | 8 | 7.5 | 6 | 7.5 |
| Spacing and alignment | 6 | 7.5 | 7 | 7 | 7.5 | 8 | 8 | 7 | 7 | 7.5 |
| Colour and contrast — light | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | — | 7.5 | 8 | 7 |
| Colour and contrast — dark | 8 | 8 | 8 | 8 | 8 | — | 8.5 | — | 7.5 | 6.5 |
| Iconography and indicators | 8 | 7.5 | 8 | 7.5 | 6.5 | 7.5 | 8 | 6.5 | 7.5 | 7 |
| Consistency | 5 | 7 | 7 | 7 | 8 | 8 | 8 | 7.5 | 9 | 9 |
| Clarity for the cashier | 7 | 6.5 | 6.5 | 6 | 5 | 4.5 | 5 | 4.5 | 3.5 | 6 |
| Density | 6 | 7.5 | 6.5 | 7 | 5 | 5.5 | 6 | 5.5 | 6.5 | 7 |
| States covered | 8 | 6 | 6 | 6.5 | 2.5 | 1 | 1 | 1 | 1 | 2.5 |
| **Average** | **7.25** | **7.40** | **7.25** | **7.20** | **6.55** | **6.61** | **6.78** | **6.00** | **6.25** | **6.80** |

### R5 V1 — observed findings

1. **`shots/v1-phone-light.png`, `shots/v1-phone-dark.png` — Density.** The expanded split choices push the keypad beneath the fixed commit button: 7–9 are cropped and Clear, 0 and backspace are invisible. Keys also shrink to 44 px. **Smallest fix:** tuck the split choices behind the existing Split control, preserving four complete rows of 56 px keys above the commit.

2. **`shots/v1-desktop-light.png`, `shots/v1-desktop-dark.png`, `shots/v1-s5-desktop-dark.png` — Clarity.** Caesar salad shows quantity 2 at $16.00 each but a $30.00 line total. The displayed lines therefore sum to $180.50, not the stated $182.50. **Smallest fix:** show $32.00 consistently for that line.

3. **`shots/v1-states-desktop-light.png`, frame `s11` — Clarity.** Percent is selected and “25% of $182.50” appears, but no percentage choices or editable percentage are visible. The dollar figure and numeric keypad do not establish whether typing changes dollars or percent. **Smallest fix:** when Percent is selected, replace the equal-split choices with explicitly labelled percentage choices; retain the resulting dollar amount above.