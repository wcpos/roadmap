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

## Morning checklist

Reopen: `open ~/Projects/roadmap-worktrees/docs-register-page-prototype/docs/prototypes/2026-09-11-register-page/index.html`

**Pick the page shape**
- [ ] Cycle A → B → C with `←`/`→` on *Session open*, tablet width. Which one would a cashier want at 5 pm? Note any pieces to steal from the others.
- [ ] Same three on *Register closed*. Is the last-closure card the right thing to see before opening?
- [ ] Width → Phone, layout C, then A and B. Does anything clip or need scrolling that shouldn't?
- [ ] Menu toggle: after POS or before Reports. Drawer icon for Register acceptable?

**Walk the chain as a cashier** (Jump to *Register closed* first)
- [ ] Open register → type a float that differs from £200 → does the opening-variance line read right? Toggle Float to *carry last count* and do it again.
- [ ] Paid out £10 with a reason → Void it → the struck-through row and the voiding row: clear, or clutter?
- [ ] No sale → is one line of copy enough?
- [ ] X-report → print → back on the page: nothing changed, correct?
- [ ] Close register → *counting* banner → Back to selling: should that button exist?
- [ ] Count by denomination → total fills → variance over £5 → Approve & close → manager code sheet: right words, right fields?
- [ ] Closure written → Print once → Done → last-closure card shows closure 13 → ⋮ → Reprint copy: is the COPY stamp enough?

**Who sees what**
- [ ] Untick *view reports* on *Session open* and on *Counting*: is the blind count hidden in the right places? Should the Z print still carry the variance?
- [ ] Untick *manage cash*: is the locked wording acceptable?
- [ ] Jump to *Overdue*: banner and pill — enough, too much?
- [ ] Jump to *Sessions off*: too empty? Hide the menu item instead?
- [ ] Jump to *Signed out*: right that the register identity and last closure show before sign-in?

**Offline**
- [ ] Network → Offline, Jump to *Counting*, close with £480.80: the unsynced line on the count screen, the Unsynced pill on the closure, the Z's "Unsynced sales" line.

**Reports**
- [ ] Page → Reports: *Sales* tab — happy with the rename away from "Z-report"?
- [ ] *Closures* tab → click closure 11 (Settled) and 14 (Unsynced): does "as recorded + corrections + settled" read the way you expect?
- [ ] Edition → Free on the Closures tab: upgrade card wording.
- [ ] Phone width on Closures: list → detail → back.

**Then**
- [ ] Answer the questions at the foot of the page (or say "defaults") — I record the resolution on #214, fill in *Reaction* below, and mark PR #254 ready.

## Reaction

_To be recorded after Paul has walked it — which layout, which pieces from the others, what changed._
