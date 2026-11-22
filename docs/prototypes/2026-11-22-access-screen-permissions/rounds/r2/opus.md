SYSTEM BREAK: V3 r0 — the Checkout page's sub-option checkboxes (`system-checkout-desktop-light`, "New order") read the violet-blue checkbox fill, while the V3 r0 permission checkboxes read the teal toggle fill (the same as the Checkout toggles). One role, two fills. Judged by eye; no pixel sample taken.

| Category | Baseline (Access today) | ref StackAI | ref Twenty | ref Zoho | V3 r0 | V3 r2 |
|---|---|---|---|---|---|---|
| Hierarchy | 6 | 7 | 7.5 | 7 | 7 | 8 |
| Typography | 7 | 7 | 7.5 | 7 | 7 | 7 |
| Spacing and alignment | 6.5 | 7.5 | 8 | 7.5 | 7.5 | 7.5 |
| Colour and contrast (light) | 7 | 7.5 | 8 | 6.5 | 6.5 | 7.5 |
| Colour and contrast (dark) | N/A | N/A | N/A | N/A | N/A | N/A |
| Iconography and indicators | 6 | 6.5 | 8 | 6.5 | 7 | 7 |
| Consistency | 8 | 8 | 8 | 7.5 | 5 | 7.5 |
| Clarity for the person in the brief | 5 | 6 | 7 | 7 | 7.5 | 7.5 |
| Density | 6 | 7 | 7 | 7.5 | 6.5 | 8 |
| States covered | 2 | 3 | 3 | 3 | 8 | 8.5 |
| **Average** | **5.9** | **6.6** | **7.1** | **6.6** | **6.9** | **7.6** |

**V3 r2: three highest-leverage findings**

1. `v3-desktop-light-part02.png` (state 3), `part03.png` top (state 4), `part04.png` (state 8). Category: iconography and indicators, and states covered. Each open help tooltip is drawn over the row it explains. In state 4 it covers the name and checkbox of "See cost, profit and margin". In state 8 it covers the "Orders" row. In state 3 it covers the "Customers" row, so the "on" half of the on-and-off pair cannot be seen at all. Smallest fix: anchor the tooltip below the help bubble, under the "When off: …" line, so the row's checkbox and name stay visible.
2. `v3-desktop-light-part01.png` / `part02.png` (states 1 and 2). Category: clarity, and typography. The two kinds of promise do not look different. "When off: not sent to the till" is an enforced boundary. "When off: only hidden at the till" is the weaker promise. Both use the same dark semibold 11 px line and the same grey bubble, so the owner cannot tell them apart without reading every line. These dark captions also compete with the regular-weight row names above them. Smallest fix: set the three data-row lines in the grey caption colour already used for "Always on for administrators". Keep only the two "only hidden at the till" lines dark.
3. `v3-desktop-light-part02.png` (state 3, Orders switched off). Category: density, and clarity. With the row off it stacks three things under the name: the "When off: only hidden at the till" line, a two-line "Switched off: the menu is gone … switch off See other cashiers' sales. Learn more", and the help bubble, which repeats the same sentence again. This breaks the brief's one-line rule. Smallest fix: when the row is off, replace the "When off" line with the single consequence line plus "Learn more", and drop the duplicate tooltip text.
