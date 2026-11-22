SYSTEM BREAK: V3 r0 — the system's checked checkbox (`system-checkout-desktop-light.png`, `baseline-access-cashier-desktop-light.png`) reads rgb(56, 88, 233) while V3 r0's checked checkbox reads rgb(0, 124, 186), the toggle's fill; one role, two fills. (V3 r3 measures rgb(56, 88, 233) for checkboxes and rgb(0, 124, 186) for the toggle and links, matching the anchors.)

| Category | V3 r3 | V3 r0 | baseline | ref-stackai | ref-twenty | ref-zoho |
|---|---|---|---|---|---|---|
| Hierarchy | 7.5 | 6.5 | 6 | 7 | 7.5 | 6.5 |
| Typography | 7 | 6.5 | 6.5 | 7 | 7.5 | 7 |
| Spacing and alignment | 7.5 | 7 | 6 | 7.5 | 8 | 7 |
| Colour and contrast (light) | 7.5 | 6 | 6.5 | 7 | 7.5 | 6 |
| Colour and contrast (dark) | N/A | N/A | N/A | N/A | N/A | N/A |
| Iconography and indicators | 6.5 | 6 | 5 | 6.5 | 7.5 | 6.5 |
| Consistency | 7.5 | 5 | 7 | 7.5 | 8 | 7 |
| Clarity for the person in the brief | 7.5 | 6.5 | 5 | 5.5 | 7 | 6 |
| Density | 7.5 | 6.5 | 5 | 7 | 6.5 | 7 |
| States covered | 8.5 | 7 | 3 | 4 | 4 | 4 |
| **Average** | **7.4** | **6.3** | **5.6** | **6.6** | **7.1** | **6.3** |

## V3 r3

1. `v3-desktop-light-part02.png` (state 1, Pages group; state 3) and `v3-desktop-light-part04.png` (state 8) — iconography and indicators. The two kinds of promise are told apart only by text weight: "When off: not sent to the till" in grey and "When off: only hidden at the till" in dark, both the same size, both with the same "When off:" opening and the same faint grey help bubble. An owner scanning down the column sees five look-alike sub-lines and cannot tell that two of them are the weak promise without reading each; the open help then covers the next row's name ("Customers" in state 8, "Manage coupons" in state 4). Smallest change: on the two Pages rows only, drop the "When off:" opening and show the first clause already drawn for Orders off ("Hidden at the till only") in both on and off states, so the weak rows start with a different word; open the help above the row rather than over the row below.

2. `v3-desktop-light-part03.png` (state 5) — clarity for the person in the brief. The Products group count changes grammar to "3 on · 1 partly" while every other group reads "4 of 6 on", and the filter count rises to "10 restricted" by counting a row that is partly on; beside it the chip says "3 of 7", so three different counts sit within one group header and one row. Smallest change: keep the one form everywhere and append the exception, "3 of 7 on · 1 partly", and leave the chip as the only "3 of 7".

3. `v3-desktop-light-part06.png` (state 11, locked and unlocked) — clarity for the person in the brief. The brief asks for a switch "Cashiers can change this"; it is drawn as a bare checkbox in a column, while the Gateways table on the same page (`system-checkout-desktop-light.png`) uses a toggle for its per-row on/off column. In the locked frame an off toggle and an empty checkbox sit in one row and both read as "off"; only the grey line "Set by your store on every till." says which one is the lock. Smallest change: draw the "Cashiers can change" column with the Toggle, as the Gateways "Enabled" column does, so the store value and the lock are the same control with the column header telling them apart.
