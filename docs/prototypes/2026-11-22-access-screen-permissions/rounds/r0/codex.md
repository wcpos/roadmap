<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: V1 — system Checkout’s checked checkboxes use #3858E9 while Access and the lock frames use #007CBA.
SYSTEM BREAK: V3 — system Checkout’s checked checkboxes use #3858E9 while Access and the till-settings table use #007CBA.

| Category | V1 Folded | V2 Summary | V3 Table | Baseline Access | StackAI | Twenty | Zoho | System Checkout | System General |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 7.5 | 8 | 7.5 | 8 | 8 | 7.5 | 7.5 | 8 |
| Typography | 7.5 | 7.5 | 7.5 | 8 | 8 | 8 | 7.5 | 8 | 8 |
| Spacing and alignment | 7 | 7.5 | 8 | 7.5 | 8 | 8 | 8 | 7.5 | 8 |
| Colour and contrast (light) | 8 | 8 | 8 | 8 | 8.5 | 8 | 8 | 8 | 8 |
| Colour and contrast (dark) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Iconography and indicators | 6.5 | 6 | 7 | 7.5 | 7.5 | 8 | 7 | 7.5 | 7.5 |
| Consistency | 5 | 8 | 5 | 9 | 8 | 8 | 8 | 9 | 9 |
| Clarity for the person in the brief | 7 | 7 | 8 | 5.5 | 5 | 5 | 6 | 7 | 7.5 |
| Density | 8.5 | 6 | 7.5 | 8 | 7 | 7.5 | 7.5 | 7 | 7.5 |
| States covered | 8 | 7 | 8 | 3 | 2.5 | 2.5 | 2 | 2 | 2 |
| **Average (scored rows)** | **7.3** | **7.2** | **7.4** | **7.1** | **6.9** | **7.0** | **6.8** | **7.1** | **7.3** |

### V1 — Folded groups

1. **`shots/v1-desktop-light-part04.png` — Spacing and alignment:** Eight generously spaced role rows push the permissions below the first phone screen. **Smallest fix:** Reduce mobile role-row padding and arrange roles in two columns.
2. **`shots/v1-desktop-light-part01.png` — Clarity:** The folded Products verdict lists withheld cost data alongside blocked deletion actions without distinguishing their consequences. **Smallest fix:** Add a short “Not sent to tills” qualifier beside the cost restriction in the closed summary.
3. **`shots/v1-desktop-light-part02.png` — Consistency:** Checked permission boxes use a different fill from existing system checkboxes. **Smallest fix:** Restore the system checkbox fill without changing toggle colours.

### V2 — Summary first

1. **`shots/v2-desktop-light-part03.png` — Iconography and indicators:** Edit products appears switched off despite three permissions being granted; the “Cashier can’t” panel reinforces that misleading binary reading. **Smallest fix:** Use the existing mixed-state checkbox for this multi-permission row and describe it as partially allowed in the summary.
2. **`shots/v2-desktop-light-part01.png` — Density:** The summary makes restrictions quick to read, but editing still exposes all 33 rows in one long column. **Smallest fix:** Make each group collapsible while retaining the summary and its jump links.
3. **`shots/v2-desktop-light-part01.png` — States covered:** Restore defaults is enabled, but no supplied frame draws its required confirmation dialog. **Smallest fix:** Add one confirmation frame using the existing modal.

### V3 — Promise table

1. **`shots/v3-desktop-light-part01.png` — Consistency:** Checked table boxes depart from the system checkbox fill. **Smallest fix:** Restore #3858E9 for checked checkboxes, including those in the lock frame.
2. **`shots/v3-desktop-light-part01.png` — Density:** Repeating “Refused by your store” across ordinary rows consumes substantial width and competes with permission names. **Smallest fix:** State the ordinary consequence once above the table; retain row-level wording for exceptions.
3. **`shots/v3-desktop-light-part03.png` — Clarity:** The partially granted Edit products row contributes to “4 of 33 off,” although it is not fully off. **Smallest fix:** Rename the filter “Show restrictions” and count “restricted” rows rather than “off” rows.