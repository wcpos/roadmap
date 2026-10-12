# Checkout conditions, the stock condition: the captures walk (2026-10-12)

wcpos/monorepo#2489 at `d09b8fa2a` (round 3), shot headless from the PR's preview deploy against the dev-next store with the demo cashier (app language set to English on the device, theme "system" with the browser's colour scheme emulated). Tablet 1024×768 and phone 390×844, light and dark. The state was made live: cart A held Zing Jump Rope at the full stock level, a second cart sold one unit in cash, and the sync lowered the level under cart A. Three one-unit sales of that product were left on dev-next by the three runs (stock 100 → 97). The small timing text under the store name is the preview build's own test readout, not the PR.

| File | What it shows |
|---|---|
| `tablet-light--unmet-one.png`, `tablet-dark--unmet-one.png` | The amber notice "Only 97 available for Zing Jump Rope · Reduce ›" in the banner's slot above Subtotal; the line marked "97 available" with the stock icon and an amber quantity box; Checkout dimmed to 0.38 with its label kept. The box is 46 px for its one 44 px row (round 2's ScrollView-as-box had grown to its 144 px cap). |
| `phone-light--unmet-one.png`, `phone-dark--unmet-one.png` | The same on the phone's Cart tab (box 40.5 px). |
| `tablet-light--after-row-tap.png`, `phone-light--after-row-tap.png` | A tap on the notice row: the line's quantity keypad open (a popover on the tablet, a bottom sheet on the phone). Round 2 head; the rows did not change in round 3. |
| `tablet-light--pay-press-before.png`, `tablet-light--pay-press.png` | A cart with nine fillers above the over-stock line, scrolled to the top, then one press on the dimmed Checkout: the line scrolls into view just above the notice and nothing else happens (same route, no payment screen, no keypad, no non-GET store request; opacity 0.38 in all 91 sampled frames). |
| `tablet-light--fixed.png`, `phone-light--fixed.png` | After reducing the quantity by one through the keypad: notice and mark gone, Checkout at full strength. The fade read 0.38 → 1 over about 180 ms, ease-out, sampled per frame. |

Not captured: two over-stock lines (adding the same product again merges into one line, and a second product needs a second stock drop), the `Remove` verb at zero stock, and native rendering.
