# Register in the POS screen — prototype for wcpos/roadmap#214

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build).

**Question it answers:** where the register lives, what a cashier sees in each session state, how the open / move cash / count / close / print chain flows, and how that divides from **Reports**.

**Second cut (2026-09-11).** The first cut drew a Register *page* in the left-hand menu with a sign-in state. Paul's reaction: the cashier is already signed in by the time any page is visible, and the page overlapped Reports. This cut makes the register **a state of the POS screen plus one panel**:

- **Register closed** → the cart column *is* the Open register card (expected float, counted float, opening variance, Open register). Products stay browsable for price checks.
- **Session open** → the cart, with a **register bar** at the top (register, status, expected cash). Tapping it opens the **Register panel** (right panel on tablet, sheet on phone): expected in drawer, Paid in / Paid out / No sale, X-report, cash movements, tenders, last closure with reprint, and **Close register** in its footer.
- **Counting** → the cart column *is* the count screen; the product grid is dimmed. *Back to selling* returns the cart.
- **Overdue** → the bar turns amber with the close time.
- **Sessions off** → the POS screen exactly as today.
- **First sign-in** → the cart column asks for the register's name before anything else; the register binds to the store.
- **No menu item, no sign-in state.**

Built on the decided language (#207 minus its menu item), session model (#210), offline binding (#211), closure document (#212) and permission rows (#213). One in-memory register, *Front counter* at *UK Store*; nothing persists.

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Width** | Tablet (≥ 1024, icon rail, cart column) or Phone (390, Products / Cart tabs) |
| **Page** | POS or Reports |
| **Jump to** | First sign-in · Sessions off · Register closed · Session open · Counting · Overdue |
| **Can** | `manage_woocommerce_pos_cash`, `view_woocommerce_pos_reports` (untick = blind count), `manage_woocommerce_pos_closures` (manager override) |
| **Edition** | Pro / Free — the Closures view on Reports is Pro |
| **Network** | Offline puts 3 unsynced sales into the count and marks the closure *Unsynced* |
| **Float** | Register default float £200, or carry the last closure's counted cash |

Everything inside the frame is live: name the register → Open register → Paid in / Paid out / No sale (void by a new row) → X-report → Close register → count (typed or by denomination) → manager approval above the £5 threshold → Closure N written → Z-report printed once → Reprint copy. The state and an action log render under the frame.

## Screens

`screens/` holds Playwright captures: `tablet-*` and `phone-*` for every state, `flow-01…14-*` for the full chain from first sign-in to reprint, `tablet-blind-*`, `tablet-no-cash-*`, `tablet-offline-*`, `reports-*`. Regenerate with `node shoot.js` (uses the monorepo's Playwright); it also asserts each step of the chain and fails on any page or console error.

## Reports split

- **Sales** — today's range report, renamed away from "Z-report" (its Print stays).
- **Closures** (Pro) — every register's closures; a row opens the closure *as recorded* with its corrections and settled figures; Export CSV/PDF, Recount… (gated), Reprint copy.
- Free sees an upgrade card on the Closures tab; the last closure and its reprint live under the register on the POS screen, Free.

## Reaction (2026-09-11)

What Paul's walk-through of the first cut changed, and the defaults he accepted for the second:

1. **No signed-out state.** The register is reached inside a signed-in app; a second sign-in was a Square/Shopify shape (device account + PIN), not ours (#209, #217 parked PIN).
2. **No Register page, no menu item.** Reverses the menu half of #207. A cashier opens the register to see the cart, and closes it from the cart. Lightspeed opens the register on reaching the sell screen; Square and SumUp prompt for the starting cash when the POS opens with cash management on.
3. **Reports overlap removed.** Free's till features (open, move, count, close, print once, reprint last) live in the POS screen as cards, panel and sheets; everything that looks back across registers is Pro on Reports. This is the #213 line ("the document is Free, reading it back is Pro") with no page in between.
4. **Menu item dropped entirely** rather than kept as a shortcut to the panel (default accepted).
5. **Closing with unpaid carts open is allowed** — open carts are unsynced orders, not tendered money (default accepted).
6. **First sign-in names the register on the POS screen**, not on the store picker (default accepted).
7. Questions from the first cut that this settles: landing page after sign-in (POS), menu position and icon (none), the sessions-off state (nothing shows), back-to-selling (exists).

## Questions still open

Listed at the foot of the page: where the bar sits (cart column vs app header); products while closed (browsable vs dimmed vs no gate at all); opening-float semantics; blind count after close; card counted at close; where register settings live.

## Next

- Paul walks the second cut; the resolution on #214 records which of the open questions changed anything.
- `CONTEXT.md` in the monorepo: the **Register** entry's "left-hand menu item is Register … the cashier signs in inside it" sentence is superseded by this cut (separate docs PR).
