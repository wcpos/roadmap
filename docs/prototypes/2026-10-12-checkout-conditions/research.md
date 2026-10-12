# Over-stock cart lines at the register: survey — 2026-10-12

Companion to `index.html` in this folder (the board for the cart's "checkout condition unmet" state). The question: when a cart line's quantity is more than the stock on hand, does the POS block, warn, or allow with a flag? Where does the message sit, and how does the cashier resolve it?

Sources are official help centres only. Community forum posts were read but left out. **n/f** = not found in an official source. The Lightspeed X-Series page sits behind Cloudflare, so it was read through the help centre's own Zendesk API copy of the same article.

## Comparison table

| Vendor | Default | Merchant setting | Where the message sits | How the cashier resolves it | Source |
|---|---|---|---|---|---|
| **Square (Retail POS)** | n/f for a quantity over stock. Items marked sold out are hidden from checkout. | Settings > Checkout > "Negative stock warning" > "Show warning". What it does is n/f. | n/f | n/f | [1] [2] |
| **Shopify POS** | **Warns, then allows.** "Staff can continue selling products when available inventory reaches zero and below." | None for POS. "Continue selling when out of stock" does not apply to POS orders. | POS "warns staff before they sell an item that has limited or no availability". Whether that is at add time or at checkout is n/f. | Confirm "that they want to sell the item anyway", or "go back to the cart". | [3] [4] |
| **Lightspeed X-Series** | Allows. The warning is an option set per outlet. | Outlets and registers > Edit outlet > "Negative inventory" checkbox. Whether it is on by default is n/f. | A warning on the sell screen when "you add a product to a sale" and the quantity is more than is available (**add time**). | Remove the item or reduce the quantity, "Continue anyway", or "Mark sale as unfulfilled". | [5] |
| **Lightspeed R-Series** | Allows. Stock goes negative and appears in the negative inventory report. | Optional Modules > Negative inventory. It is on in newer accounts. | "An alert on the Sell screen (desktop only)" (**add time**). | The sale goes through. Corrections are made afterwards with a refund, a receipt of stock or a count. | [6] [7] |
| **Zettle (PayPal POS)** | Allows. "Inventory will never prevent you from selling." | A low-stock alert per product. The default threshold is 3. | **"Red text notifications under the relevant item placed in the shopping cart"**, at 3 or fewer left. Nothing extra is documented for a quantity over stock. | Nothing. It is information only. | [8] |
| **SumUp POS** | Allows. "Sold-out items can still be added to the checkout." | Track stock per item. No setting to block was found (n/f). | A "Sold Out" label on the **item tile** at 0 or less. A scanned unavailable item gets a notification at the bottom of the checkout screen. A quantity over stock that is still above 0: n/f. | Proceed. The cashier's options are n/f. | [9] |
| **Loyverse** | Allows. The warning is opt-in. | Settings > Features > "Negative stock alerts". Needs a connection; there are no alerts offline. | A warning at **three moments**: adding a quantity over stock, editing the quantity of a line already on the ticket, and tapping **Charge**. | Reduce the quantity and tap Save, or tap Continue to sell anyway. | [10] |

## What it means for this board

1. **No vendor hard-blocks an in-person sale.** WCPOS blocks only because the merchant turned *Prevent overselling* on. The block is the merchant's rule, and the copy should read as a statement of stock ("Only 2 available for Belt"), never as the app refusing.
2. **Loyverse is the precedent for a check on the pay button.** It warns again on Charge, not only at add time. Variant C is that idiom without Loyverse's "Continue".
3. **Only Zettle marks the cart line itself**, and only with text under it. All four variants keep that mark, adding an icon and the attention colour.
4. **Reducing the quantity is the shared fix** (Lightspeed, Loyverse). That is why every tap on the board lands on the line's quantity keypad.
5. **Counts can be stale or missing offline** (Loyverse, SumUp, and Lightspeed's "Continue anyway" for shelf-versus-system drift). Whatever variant is chosen, the line should still read as "the app knows 2", not "there are 2".

## Sources

[1] https://squareup.com/help/us/en/article/8332-schedule-inventory-restocks
[2] https://squareup.com/help/us/en/article/8430-mark-items-and-modifiers-as-sold-out
[3] https://help.shopify.com/en/manual/products/inventory/setup/selling-when-out-of-stock
[4] https://help.shopify.com/en/manual/sell-in-person/shopify-pos/inventory-management/changing-inventory-quantities-pos
[5] https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534084085659-Enabling-the-negative-inventory-warning
[6] https://retail-support.lightspeedhq.com/hc/en-us/articles/360020062234-Correcting-negative-inventory
[7] https://retail-support.lightspeedhq.com/hc/en-us/articles/360020565353-Enabling-negative-inventory
[8] https://www.zettle.com/gb/help/articles/2771896-inventory
[9] https://help.sumup.com/en-GB/articles/WcT1PpyBZHREhzgn7Wstl
[10] https://help.loyverse.com/help/negative-stock-alerts
