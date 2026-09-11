# Register in the POS screen — prototype for wcpos/roadmap#214

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build).

**Question it answers:** where the register lives, what a cashier sees in each session state, how the open / move cash / count / close / print chain flows, and how that divides from **Reports**.

**Second cut (2026-09-11).** The first cut drew a Register *page* in the left-hand menu with a sign-in state. Paul's reaction: the cashier is already signed in by the time any page is visible, and the page overlapped Reports. This cut makes the register **a state of the POS screen plus one panel**:

- **Register closed** → the cart column *is* the Open register card (expected float, counted float, opening variance, Open register). Products stay browsable for price checks.
- **Session open** → the cart, with a **register bar** at the top (register, status, expected cash). Tapping it opens the **Register panel** (right panel on tablet, sheet on phone): expected in drawer, Paid in / Paid out / No sale, X-report, cash movements, tenders, last closure with reprint, and **Close register** in its footer.
- **Counting** → the cart column *is* the count screen; the product grid is dimmed. *Back to selling* returns the cart.
- **Overdue** → the bar turns amber with the close time.
- **Sessions off** → the POS screen exactly as today.
- **First sign-in** → registers are **server records** (Paul, 2026-09-11 late — superseding the earlier "name it on the POS screen"): every store gets one by default, more are created in the plugin's admin, never in the POS. The device holds only a pointer. Strip → *Registers* → 1: binding is silent and the bar says *Register*; → 3: a one-time picker (register, status, who opened it) replaces the cart, changed later under the avatar. A wiped device re-binds and loses no numbering.
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
6. ~~First sign-in names the register on the POS screen~~ **Superseded the same night:** registers are created on the server (one per store by default, more in the plugin's admin); the device only picks one, and only when the store has more than one. Creating on the device would lose the register on a wipe or duplicate it.
7. **Several devices may point at one register** (Paul, 2026-09-11 late): two cashiers with their own tablets sharing one cash drawer ring on the same session; each row is stamped with its actor. The picker's "Open since 09:02 · Amy Okafor" line is that case. Shopify's 2026-04 CashDrawer model is the same shape.
8. Questions from the first cut that this settles: landing page after sign-in (POS), menu position and icon (none), the sessions-off state (nothing shows), back-to-selling (exists).

## No title bar (Paul's suggestion, 2026-09-11 evening)

Strip → **Header**. *Title bar* is the app as today. The three *No bar* variants remove the app's title bar and move the store name, online dot, notifications and user into the bar above the cart, which then exists in **every** state (set up, closed, open, counting, overdue), not only while open:

- **A · one line** — `[drawer] Front counter [Open] £480.80 › … ● 🔔 DC ▾`. The store name does not fit beside the register at cart width, so it moves under the avatar menu. The gate cards drop their own heading because the bar carries it.
- **B · two lines** — a store row (`UK Store … ● 🔔 DC`) above a register row (`[drawer] Front counter [Open] £480.80 ›`). Costs ~34 px; keeps "where and who" apart from "the drawer".
- **C · split** — chrome sits on the product search row (`UK Store ● 🔔 DC`) and the bar carries the register alone. Phone falls back to A because the search row is on the other tab.

**Round two (same evening), after "online status somewhere else, notifications in the sidebar, no cashier dropdown"** — two more variants built from Mobbin's work-tool conventions (see `mobbin-notes.md`, round two):

- **D · rail** — the bar is the register only: drawer icon, name, store (Pro), status pill, expected cash, chevron, 48 pt tall. **Offline** is an amber pill in the bar that exists only while offline; online is the absence of a badge (rule 5: one badge, one place, top of the pane). **Notifications** are a bell in the rail's bottom cluster with a red count only when there is a count. **Identity** is a 28 px initials avatar as the rail's last item, no caret; tapping it opens the user panel (switch user, switch store, sign out). Phone: hamburger in the bar with a dot when unread; the offline pill replaces the amount, which is one tap away in the panel.
- **E · cashier on bar** — as D, but the avatar sits at the right end of the bar (44 pt target, no caret) because the session records who acted and Switch User is a till action. The rail's bottom cluster is bell, health, settings, support.

Strip → *Alerts* switches quiet (no badge anywhere) and 2 unread; *Network* → Offline shows the pill.

On phone the hamburger moves into the bar. Reports gets a page bar (`Reports … UK Store ● 🔔 DC`). The rail gains a logo tile so it has a top. Captures: `screens/header/{bar,A,B,C}-*`; `node shoot-header.js` regenerates them (run it after `shoot.js`, which clears `screens/`).

## Direction chosen: E (Paul, 2026-09-11 evening)

"E is the right direction … still way too complex and cluttered, but we can start with this and refine." E is now the prototype's default; the other variants stay in the strip for comparison.

**Declutter pass 1** (applied with the decision):
- The bar shows a status pill only when the state is not the normal one: closed, counting, overdue, set up. While open and on time it reads `Front counter · UK Store   £480.80 ›   DC` and nothing else. The drawer icon is gone; the chevron is the affordance.
- The Open register card is the amount (prefilled with the expected float), one or two chips (`£200.00 default float`, `£570.10 closure 12 count`), and one button. The expected-float row, "Use £200", the "or type what you counted" hint and the drawer/printer sentence are gone. The opening-variance line appears only when the typed amount differs.
- The bar names the register only when the store has more than one; otherwise it says *Register*. Most stores never see a register name.
**Declutter pass 2** (the panel and the count):
- Panel: the amount is the title (`£480.80` / `in the drawer · Register · opened 09:02 by Demo Cashier`); three 56 pt tiles Paid in / Paid out / No sale; one list — Cash, Card, Paid in/out (tap for the rows and Void), Print X-report; one row for the last closure with its reprint; `Close register` alone in the footer, neutral not red (closing is not destructive). Gone: the Register title, the status row, the hero card and its breakdown sentence, the three folds, the Reports link, the Done button. Blind cashiers see the register name as the title and a sales count instead of the totals.
- Count: one big input (`Cash counted, float included`), one line under it (`Expected £480.80 · −£17.50 short`, live as you type), the manager line only over the limit, denomination and card counted folded, one button. Gone: the two cards, the breakdown sentence, the closure/printer line.
- Products notice while closed shortened to `Price check only until the register is open.`
**Pass 3 — the bar names the place, not the money** (Paul, 2026-09-11 late):
- The expected figure is gone from the bar; it lives in the panel one tap away. Names on the left are places you can change; icons on the right are things you open.
- One register → `UK Store`; several → `Front counter · UK Store`. Strip → *Stores* → 2 (Pro): the store name is a tap target that opens a **Switch store** sheet (rows with register count, Current pill). A register belongs to one store, so switching re-binds the register: silently when the new store has one, by the picker when it has more.
- A **drawer icon button** opens the register panel while a session is open (amber when overdue); the **avatar** opens the **user sheet**: *Your sales today* (the cashier's own figure — the one number a cashier without reports may see), *Switch user* listing the device's stored users plus *Another account…* (WordPress login, the token follows the person, #217), *Switch register* when the store has more than one, and *Sign out* apart at the bottom in the destructive outline.
**Polish pass — "spark joy"** (Paul, 2026-09-11 late; joy = speed, precision, a quiet acknowledgement; see `mobbin-notes.md` round three):
- **Pressed states** on every tap target within 100 ms; focus rings for keyboard; `prefers-reduced-motion` honoured.
- **Motion**: sheets fade and rise 150–200 ms, the panel slides 220 ms, the toast drops in 200 ms, all ease-out, none over 250 ms.
- **Beats**: Open register → the cart returns with `✓ Register open · float £195.00`. Paid in / out → the panel's Paid in/out row settles with a highlight and the figure updates in place; a toast names the movement with **Undo** (the voiding row). Count → the variance line updates as you type; exact shows a green check and the word *Exact*. Close → **Closure N written** is the one moment with its own sheet: a 40 px pale disc with a thin check that stamps in, the three figures, the Z-report as a preview fold, one primary *Print Z-report*; after printing, a green *Printed on …* line, *Done*, and a PRINTED stamp on the receipt.
- **Precision**: amounts are 32 px tabular figures with the `£` locked to the digits; nothing below 12 px; chips 44 pt, tiles 56 pt, rows 44 pt; the panel's headline is 32 px.
- Not touched yet, for Paul to direct: the panel (hero + three actions + folds), the count screen, the products-column notice while closed, the tab bar labels on phone, the Reports page bar.

## Questions still open

Listed at the foot of the page: where the bar sits (cart column vs app header); products while closed (browsable vs dimmed vs no gate at all); opening-float semantics; blind count after close; card counted at close; where register settings live.

## Next

- Paul walks the second cut; the resolution on #214 records which of the open questions changed anything.
- `CONTEXT.md` in the monorepo: the **Register** entry's "left-hand menu item is Register … the cashier signs in inside it" sentence is superseded by this cut (separate docs PR).

## Five ideas beyond the bar and the panel (2026-09-11, late — "think outside the box")

`ideas.html` shows each one live beside the others; the main prototype's strip → *Idea* switches the same things, and *Cart* → empty matters for 1 and 3. Captures in `screens/ideas/` (`node shoot-ideas.js`, run after `shoot.js`).

1. ~~**The empty cart is the register.**~~ **Dropped** (Paul: "weird and confusing if the empty cart is full of other stuff" — the drawer icon stays). No bar, no panel, no drawer icon. With nothing in the cart the column *is* the register: the figure, Paid in / Paid out / No sale, the list, Close register in the footer. Add an item and it is the cart. The avatar sits in the cart header. Removes a whole layer.
2. **The first cash sale opens the register.** No morning gate: the cart is there, one muted line says the first cash sale opens the register with the carried float, and tapping Checkout does exactly that with one toast. The float check moves to closing (*Started with £200.00 · Change* on the count). Shopify's auto-open. A session-model change, so a ruling.
3. **The primary button knows the time.** Past close time with an empty cart, *Checkout* becomes *Close register*; no Overdue pill. With items it is Checkout as usual.
4. **Count by tapping notes, not typing.** The denomination counter is a grid of note and coin tiles: tap once per piece, hold for ×10, the count badge stamps in and the total ticks into the cash field. Mirrors the physical act; no mis-keys.
5. **The drawer is a drawer.** The register sheet rises from the bottom of the cart column, where the hardware sits, with a handle; *No sale* kicks it open with a toast (haptic on native). Same content as the panel.

Recommendation after 1 was dropped: **3** and **4** into the design, **2** as a ruling on the session model, **5** as the phone shape of the panel.

## Cart tabs (2026-09-11, late)

The app's cart column has a tab row: one tab per open order (`Cart: £22.60`, from `pos_cart.cart`), a `+` tab for a new order, scrollable; then the card with `Customer: [Guest]`, the add-items `+` and the cart settings gear, the lines, totals, a Note / Meta / Save row, and Void beside Checkout. The prototype now rehosts that (strip → *Open orders* 1 / 2; *Cart* → new (empty) selects the `+` tab). Two placements, `ideas.html` top:

- **Their own row** — under the bar, exactly as the app today. Bar = place + drawer icon + avatar; tabs = orders. Two strips.
- **In the bar** — the tabs share the bar's row: tabs on the left, status pill, drawer icon and avatar on the right; the store name moves under the avatar. One strip fewer. On phone the hamburger sits left of the tabs.

Closing with open orders is allowed (ruling above); the tabs stay when the register closes and the count replaces the card.
