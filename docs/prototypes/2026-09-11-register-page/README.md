# Register page prototype — wcpos/roadmap#214

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build).

**Question it answers:** what the **Register** page looks like in the left-hand menu, what a cashier sees in each state, how the open / move cash / count / close / print chain flows, and how the page divides from **Reports**.

Built on the decided language (#207), session model (#210), offline binding (#211), closure document (#212) and permission rows (#213). One in-memory register, *Front counter* at *UK Store*; nothing persists.

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Width** | Tablet (≥ 1024, icon rail) or Phone (390, hamburger) |
| **Layout** | A · Board / B · Ledger / C · Focus — the register page body only; `←` `→` also cycle |
| **Page** | Register or Reports |
| **Jump to** | Signed out · Sessions off · Register closed · Session open · Counting · Overdue |
| **Can** | `manage_woocommerce_pos_cash`, `view_woocommerce_pos_reports` (untick = blind count), `manage_woocommerce_pos_closures` (manager override) |
| **Edition** | Pro / Free — the Closures view on Reports is Pro |
| **Network** | Offline puts 3 unsynced sales into the count and marks the closure *Unsynced* |
| **Menu** | Register after POS, or before Reports |
| **Float** | Register default float £200, or carry the last closure's counted cash |

Everything inside the frame is live: Open register → Paid in / Paid out / No sale (void by a new row) → X-report → Close register → count (typed or by denomination) → manager approval above the £5 threshold → Closure N written → Z-report printed once → Reprint copy. The state and an action log render under the frame.

## Screens

`screens/` holds Playwright captures of every state (`A|B|C-tablet-*`, `*-phone-*`, `flow-1…14-*` for the full chain, `*-blind`, `*-offline-*`, `reports-*`). Regenerate with `node shoot.js` (uses the monorepo's Playwright).

## Layouts

- **A · Board** — status, four figures, action row, movements beside tenders, last closure. The manager's view of the drawer.
- **B · Ledger** — the session as one running ledger with the arithmetic on show; actions pinned to the bottom. Shows *which line moved*.
- **C · Focus** — one number, one button, three small ones; the rest folds. Phone-first.

The sheets (open, movement, void, manager approval, Z print, reprint, X-report), the counting screen and the Reports page are shared across layouts.

## Reports split

- **Sales** — today's range report, renamed away from "Z-report" (its Print stays).
- **Closures** (Pro) — every register's closures; a row opens the closure *as recorded* with its corrections and settled figures; Export CSV/PDF, Recount… (gated), Reprint copy.
- Free sees an upgrade card on the Closures tab; the Register page's last-closure card and reprint are Free.

## Questions the prototype raised

Listed at the bottom of the page (opening-float semantics, blind count after close, "back to selling" from counting, landing page after sign-in, menu position and icon, the sessions-off state, card counted at close, where register settings live).

## Reaction

_To be recorded after Paul has walked it — which layout, which pieces from the others, what changed._
