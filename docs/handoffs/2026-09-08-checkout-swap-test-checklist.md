# Checkout column swap — test checklist (dev-next, 1.11.0)

Build: web bundle `@next` (`entry-23706fa2…`, 2026-09-08), PHP 1.11.0 on `next`. Ticket wcpos/roadmap#165, PR wcpos/monorepo#1898.
Tender flow = the Cash / Card tiles. If you see the old webview form instead, the store is not serving `wcpos/v2/payment-methods`.

Walk these as chains, not screens: each block is one sale from start to finish.

## 1. Plain sale (desktop/tablet width)

- [ ] Add a product, press **Checkout**. Products fade out, tender pane fades in, in place (~180 ms, no slide). Cart column becomes the ledger; tab strip and totals stay put.
- [ ] Tender pane header reads `← Cart · Checkout Order #N · Payments | Legacy`. Tabs sit side by side.
- [ ] Ledger: `#N · customer` header, the lines, a **Payments** section reading "No payments yet", then Total / Paid / Remaining.
- [ ] Balance headline and **Split payment** are in the tender pane, not the ledger.
- [ ] Cash → keypad → take full amount. Pane fades to the **receipt stage**: green Paid banner (amount, method), template + printer selects side by side, preview fills the height.
- [ ] Footer: `No receipt · Email receipt · Download PDF · Print receipt` outline, **New sale** the only filled button, right-aligned.
- [ ] **New sale**: paid tab disappears, columns return to products + an empty cart.
- [ ] Repeat, ending with **No receipt** instead: same result.

## 2. Change due

- [ ] Cash, tender more than the balance (quick amount). Receipt banner shows **Change due** in large type with the right figure.
- [ ] Ledger leg line reads "Tendered X · change Y".

## 3. Back out

- [ ] Checkout, no payment taken, press **← Cart**: back to products + cart, order untouched.
- [ ] Same with **Escape** (desktop keyboard).
- [ ] Take a partial cash payment, press **← Cart**: the **cancel view** opens listing "Return X cash". **Keep taking payment** returns to tiles; **Cancel and void** voids the leg and returns to the cart (order back to open).
- [ ] With the email dialog open in the receipt stage, Escape closes the dialog only.

## 4. Two carts at once

- [ ] Order A: checkout, take a **partial** cash payment. Ledger shows the leg, Remaining > 0.
- [ ] Press **+** for a new order. Tab A shows a **Partly paid · X due** chip. The active tab has no chip.
- [ ] Add a product to B, checkout, pay in full → receipt stage for B. Tab A still there with its chip.
- [ ] **New sale** on B. Then tap tab A: its checkout resumes with the leg still listed and the same Remaining. Balance headline matches Remaining.
- [ ] Pay A's remainder → receipt stage → New sale. No tabs left over.
- [ ] While in A's checkout, press **+** then switch back to A: the keypad state is reset (expected), the leg is not.

## 5. Receipt options

- [ ] Change template in the receipt stage: preview re-renders; mismatch badge appears if the template paper width disagrees with the printer.
- [ ] Change printer: Auto vs a named printer; badge follows.
- [ ] **Print receipt** (or system dialog): after it runs, banner shows "Printed to …" and the button reads **Print again**.
- [ ] **Email receipt** opens the dialog; **Download PDF** downloads.
- [ ] Cart settings → **Automatically print receipt** ON: a paid sale prints once by itself; **New sale** / **No receipt** are disabled only until the preview has loaded, then enable. Switch to another tab and back: it does not print twice.
- [ ] Cart settings → **Automatically show receipt** OFF: a paid sale skips the receipt stage and goes straight back to products + new cart.

## 6. Merchant settings

- [ ] Cart settings → **Open orders position: Top**. Strip moves above the cart; checkout keeps it there; the swap does not move it. Back to Bottom.
- [ ] Products settings → **Panel position: Right**. Products on the right, cart on the left; Checkout puts the tender pane on the **right** (where products were) and the ledger stays left. Resize handle still works; width persists after reload.
- [ ] Both at once (products right + tabs top), then restore.

## 7. Legacy tab

- [ ] In checkout, tap **Legacy**: the order-pay form fills the whole tender pane. Pay through it once; it should still complete and land on a receipt (the routed receipt modal, not the stage — expected).

## 8. Deep link and reload

- [ ] Paste `/cart/<order-uuid>/checkout` (from a tab's URL) into the address bar on a wide window: lands on the columns with that order in checkout.
- [ ] Mid-checkout with a partial leg, reload the page: the order's tab shows **Partly paid**; opening it resumes checkout with the leg.
- [ ] Mid-checkout with no leg, reload: back to cart (expected: "entered checkout" is not persisted, only money is).

## 9. Phone width (narrow the window below ~640 px or use a phone)

- [ ] Checkout opens the full-screen sheet as before; balance bar collapses/expands to the legs.
- [ ] Pay in full: the sheet shows the receipt stage (banner, selects stacked, preview, wrapped footer, full-width New sale).
- [ ] **New sale** closes the sheet to the cart. The sheet's X in the receipt stage behaves like No receipt.
- [ ] Android device only: hardware back in checkout = ← Cart; in the receipt stage = No receipt.

## 10. Things that are deliberate (don't file as bugs)

- Drawer navigation or browser back mid-leg is **not** blocked; the leg stays live and the chip shows it when you return.
- The ledger's totals block sits a little lower than the cart's (the cart footer buttons are gone).
- Scanning a barcode during checkout does nothing.
- The tab strip on **Bottom** keeps its current spacing under the cart.
- Terminal chip, reader-busy tiles and background terminal polling come with #154.

## Known gaps I have not walked

Phone width, products-right, and anything native (iOS/Android) were unit-tested but not screenshotted; the E2E spec has not run on this lane. Tell me what breaks and where.
