<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: V3 r0v3 — Checkout’s checked email boxes read violet-blue (`#3858E9`) while the task checkboxes read teal (`#007CBA`).

| Category | V3 r1 | V3 r0v3 | Access baseline | StackAI ref | Twenty ref | Zoho ref | System Checkout | System General |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 7.5 | 7 | 8 | 8 | 7.5 | 7.5 | 8 |
| Typography | 8 | 7.5 | 8 | 8 | 8 | 8 | 8 | 8 |
| Spacing and alignment | 8 | 7.5 | 7.5 | 8 | 8 | 8 | 7.5 | 8 |
| Colour and contrast — light | 8.5 | 8 | 8.5 | 8.5 | 8 | 7.5 | 8.5 | 8.5 |
| Colour and contrast — dark | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Iconography and indicators | 7.5 | 7 | 7.5 | 8 | 8 | 7 | 7.5 | 7.5 |
| Consistency | 8.5 | 5 | 9 | 8.5 | 8 | 8 | 9 | 9 |
| Clarity for the person in the brief | 7 | 7.5 | 6 | 6.5 | 6.5 | 6.5 | 7 | 7.5 |
| Density | 8 | 7 | 6.5 | 8 | 7.5 | 7.5 | 7 | 8 |
| States covered | 8 | 7.5 | 3 | 2 | 2 | 2 | 2.5 | 2.5 |
| **Average, excluding N/A** | **7.9** | **7.2** | **7.0** | **7.3** | **7.1** | **6.9** | **7.2** | **7.4** |

### V3 r1

1. **`shots/v3-desktop-light-part02.png` — Clarity.** Checked rows say “Not sent to the till” or “Only hidden at the till,” which reads as their current state rather than what switching them off would do. Removing the previous conditional column heading exposed this ambiguity. **Smallest fix:** prefix these exception descriptions with “When off:”.

2. **`shots/v3-desktop-light-part01.png`, `shots/v3-desktop-light-part02.png` — States covered.** The frame captioned “All on” retains three unchecked rows: Manage POS settings in WP Admin, Delete products and Delete coupons. It does not draw the brief’s explicitly requested all-rows-on state. **Smallest fix:** add that frame separately, retaining the existing defaults frame if needed.

3. **`shots/v3-desktop-light-part02.png` — Clarity.** The Orders explanation warns that the till still holds the data, but does not identify the control that establishes the real boundary. The owner learns what will not work without learning what will. **Smallest fix:** append “To restrict access to other cashiers’ sales, use ‘See other cashiers’ sales’” to the existing help explanation.