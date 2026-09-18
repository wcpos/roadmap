# Checkout column swap — live screenshots (2026-09-07)

Taken on the local web build of wcpos/monorepo#1898 (`feat/checkout-column-swap`, base `next`)
against dev-next at 1280×800, after the taste pass. Ticket: wcpos/roadmap#165.

- `03-checkout-swapped.png` — Checkout pressed: tender pane in the products column, ledger in the cart column, strip at the bottom.
- `04-legacy-tab.png` — the Legacy (order-pay) tab at full pane width.
- `06-partial-leg.png` — a partial cash leg: Payments section in the ledger, Remaining, the `Partly paid · due` chip on the inactive tab.
- `07-cancel-view.png` — `← Cart` with a live leg opens the cancel view.
- `10-receipt-stage.png` — balance zero: Paid banner, selects side by side, preview, outline receipt actions, `New sale` primary.
- `14-checkout-products-right-tabs-top.png` — open-orders strip on top (setting), checkout again.

Products-right is covered by unit tests (`pos-columns.test.tsx`); the products settings dialog has no
trigger testID, so the probe could not flip it.
