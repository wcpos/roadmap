SYSTEM BREAK: V3 r0 — the Access checkboxes read #007cba (the toggle colour) while the system checkbox reads #3858e9 (baseline Access and system-checkout anchors, sampled); V3 r3 reads #3858e9 and matches.

| Category | Baseline (today) | ref StackAI | ref Twenty | ref Zoho | V3 r0 | V3 r3 |
|---|---|---|---|---|---|---|
| Hierarchy | 6 | 7 | 7.5 | 7 | 6.5 | 8 |
| Typography | 7 | 7.5 | 8 | 7 | 7 | 7.5 |
| Spacing and alignment | 7 | 8 | 8 | 7 | 7.5 | 7.5 |
| Colour and contrast (light) | 7 | 8 | 8 | 6.5 | 6.5 | 8 |
| Colour and contrast (dark) | N/A | N/A | N/A | N/A | N/A | N/A |
| Iconography and indicators | 6 | 7 | 8 | 6.5 | 6.5 | 7 |
| Consistency | 8 | 8 | 8 | 7 | 5 | 7.5 |
| Clarity for the person in the brief | 5.5 | 6 | 7 | 6.5 | 7 | 8 |
| Density | 6 | 7 | 6.5 | 7.5 | 6.5 | 8 |
| States covered | 2.5 | 3 | 3 | 3 | 8.5 | 9 |
| **Average** (dark excluded) | 6.1 | 6.8 | 7.1 | 6.4 | 6.8 | 7.8 |

**V3 r3: three highest-leverage findings**

1. `v3-desktop-light-part02.png` (frame 3), `part03.png` (top of frame 4), `part04.png` (frame 8). **Spacing and alignment.** The open help tooltips sit on top of the rows they are meant to leave readable. In frame 3 the Customers tooltip runs about 175 px left of the table, across the role column, and covers the top edge of Advanced. In frame 4 it hides the "Manage coupons" label. In frame 8 it hides the "Customers" label. Each caption says the row "stays readable", and these frames do not show that. **Smallest fix:** cap the tooltip at about 320 px and let it wrap to two lines. Right-align it to the help icon so it stays inside the table, and open it above the icon when the row below has a label.
2. `v3-desktop-light-part02.png` (frame 3, Orders off). **Consistency / clarity.** The hidden-at-the-till tier is worded two ways. Rows that are on say "When off: only hidden at the till". Orders, switched off, says "Hidden at the till only." The owner tells the two kinds of promise apart by this wording alone, so a different phrase when the row is off reads like a different kind of row. **Smallest fix:** keep the same tier phrase in both states, "Only hidden at the till", with the off state adding only the follow-on sentence ("For a real limit, switch off See other cashiers' sales. Learn more").
3. `v3-desktop-light-part03.png` (frame 5, Partially granted). **Consistency.** The Products group count reads "3 on · 1 partly", while every other group heading reads "N of M on". It also drops the group size, so the owner can no longer tell how many Products rows there are. **Smallest fix:** "3 of 7 on · 1 partly".
