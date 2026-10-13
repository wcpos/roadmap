# Keyboard hotkeys and the help sheet: the captures walk (2026-10-13)

wcpos/monorepo#2521 at `14e52a9c0` (round 2; the two later commits only gate the chords and the cart surface on the focused screen and leave an accented letter alone), shot headless from the PR's preview deploy against the dev-next store with the demo cashier (app language English on the device, store language Spanish). Tablet 1024×768 light and dark; phone 390×844 for the sheet. The small timing readout under the store name is the preview build's own test readout, not the PR.

| File | What it shows |
|---|---|
| `tablet-{light,dark}--help-sheet.png` | `Alt+/` on the blank cart: the sheet with eight rows, `⌥` keycaps (Mac user agent); Checkout, New cart, Add discount and Void greyed (0.45) because the cart is blank, Previous/Next greyed because one other cart was open. Rows are 44 px. First paint about 10 ms after the keydown. |
| `phone-{light,dark}--help-sheet.png` | The full-screen sheet on the phone. |
| `tablet-{light,dark}--help-open-alt-f.png` | `Alt+F` over the open sheet: the sheet closed, the search input focused, `jump` typed into it. |
| `tablet-{light,dark}--search-focus.png` | `Alt+F` on the cart: focus moved from the body to the search input; the products filtered to one tile. |
| `tablet-{light,dark}--new-cart.png` | `Alt+N`: the blank cart's tab selected, no lines. |
| `tablet-{light,dark}--cart-step.png` | `Alt+←`: back to the cart with its line. |
| `tablet-{light,dark}--checkout-open.png` | `Alt+P` with a line in the cart: the tender pane, about 25 ms after the keydown. On the blank cart the same chord did nothing (no pane, same URL, no toast, 2 s). |
| `tablet-{light,dark}--discount-open.png` | `Alt+D`: the discount dialog, about 12 ms. |
| `tablet-{light,dark}--void-refused-under-list.png` | `Alt+V` with the open-orders list over the cart: nothing happened, zero order writes in 4 s. |
| `tablet-light--void-fresh-cart.png` | `Alt+V` on a cart that never reached checkout: the cart emptied, the "Order removed / Undo" toast. |
| `tablet-light--void--key-no-effect.png`, `tablet-light--void--after-button.png`, `tablet-dark--void--FAIL.png` | `Alt+V` on a cart that had been through checkout, then the Void button clicked: the line stays, the tab reads "Save refused". The store refused the delete (403 `woocommerce_rest_cannot_delete`, the demo cashier cannot delete orders) and the app converted the order to pending (200). The button fails the same way, so this is the void path's kept-pending fallback, not the hotkeys; fixed separately in this run. |

Not captured: Electron, Windows (the `Alt` keycaps and the Firefox note), native (nothing renders there).
