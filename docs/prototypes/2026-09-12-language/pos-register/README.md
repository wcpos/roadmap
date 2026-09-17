# POS register in the 1.11.0 language — prototype for wcpos/roadmap#287

Throwaway, self-contained HTML. Double-click `index.html`. The dark strip is not part of the design.

**Question it answers:** what the register (the POS screen with the cart column, the register
states, the tender pane and the beats) looks like in the direction decided on 2026-09-12, at phone,
tablet and desktop, light and dark, compact and regular. The structure and flow are fixed
([#214](https://github.com/wcpos/roadmap/issues/214), PR #259, the 2026-09-11 prototype beside
this one); the split-payment functionality is dev-next’s and signed off; this study only cleans up its UI.

## Cut 2 (2026-09-14) — Paul's nine points on cut 1

Paul: *"Generally the right direction, but we should make some changes to really dial it in."*
Each point, what changed, and where the strip shows it:

1. **Note is part of the order-details modal now; rename Meta.** Footer reads **Order details**
   · **Save order**. "Order details" over "Details" (too generic beside a cart) and "This order"
   (reads as a heading, not a button); it names what the modal holds — status, cashier, note,
   currency, transaction ID, metadata. "Save order" follows the verb-plus-object rule (today:
   *Save to Server*).
2. **Title and price editable with one click.** The name and the price in a line are quiet text
   with a hover tint; one tap turns them into a field in place. State *Line · inline edit*:
   focus on the name, Tab to price, Enter saves, Esc cancels.
3. **Column titles and cart sort.** A muted uppercase header row over the lines: **Qty · Item ·
   Price · Total**. Cart settings (the sliders on the cart) gain **Sort items**: newest at the
   bottom (today's order), newest on top, by name, by price — fees and shipping always stay last,
   said under the options. State *Cart settings (anchored)*; the fee line in every state shows the
   last-place rule.
4. **Line actions by swipe or hover.** State *Line actions*: on touch the row slides left to
   reveal **Edit** and **Remove** (56 pt each, Remove in the destructive colour); on the desktop
   the same two appear at the row's right end on hover, no swipe. Edit opens the line-item sheet
   (name, quantity, price, tax class, metadata, split — the app's edit dialog). The research
   behind the choice is in `mobbin-notes.md` (iOS list swipe actions, Shopify POS cart rows).
5. **Open-order tabs.** No longer buttons: a tab strip with a two-line tab — the amount (bold when
   current) over a status line that is either the customer or the status chip already on `next`
   (*Waiting for terminal*, *Partly paid · £46.40 due*, *Paid · receipt*, *Saving order…*, *Save
   refused*, *In checkout · offline*), each with its dot. Past the width the strip folds into
   **+N more**, which opens the **Open orders** list: every open cart with amount, customer, status
   or age, the current one marked. State *12 open orders*. Phone shows one tab plus the count.
6. **Column resize.** The 8 px divider between products and cart is drawn with its grip: always
   faint on touch, on hover on the desktop, primary while dragging.
7. **Terminal animation.** The approved 2026-09-11 moment is back on the neutral surface: *On the
   terminal*, the amount, the status line crossfading, the 112 px ring, the reader card with
   connection and battery, the four steps **Sent → On terminal → Approved → Captured**, *Cancel on
   terminal*. Take a terminal method to run it; when no balance remains it lands on the Paid beat, which keeps the pop and
   the drawn check from the mockup. State *Tender · on the terminal*.
8. **Tile / table is one toggle.** A segmented control in the products toolbar.
9. **Products settings is the slide-out that is live on `next`.** Drawn as a panel sliding in
   over the products column with the grid still visible beside it. State *Products settings*.
10. **Tender close and the Payments / Legacy toggle — three options each, in the strip.**
    *Tender close:* top-left × (cut 1) · **top-right ×** (default now; the pane is on the left, the
    cart on the right, so the way out sits nearest what the cashier goes back to) · *Back to cart*
    under the keypad (a labelled action, costs a row). *Legacy:* **legacy gateways as dashed tiles
    in the same grid under a Legacy divider** (default; a gateway is a way to pay, so it lives with
    the others, and the toggle disappears) · an *Other ways to pay ▾* link under the grid · the
    Payments / Legacy segmented toggle in the header (cut 1). Picks and reasons in
    `../README.md`.

## What changed from the 2026-09-11 register prototype (cut 1)

Same bar, same cart, same open card, same panel, same count, same closure sheet, same tender
pane. On top of them: tokens not values (`--u`, `--ctl`, `--row`, `--tile`, `--r`, `--amt`, the
touch floor); controls at 44 by default; flat, hairline, one radius, no shadow; a pale rail; line
weight icons; status as a dot plus a word; the focus story drawn; the tender pane on the neutral
surface with a fixed three-column method grid; the Paid beat as a stamped disc; no toast on a line
add.

## States (the strip's *State* row)

Session open · Line just added (beat) · Line actions (swipe / hover) · Line · inline edit · 12 open
orders · Cart settings (anchored) · New empty cart · Register closed · Choose register · Counting ·
Overdue · Register panel · Closure written (beat) · Offline · Products loading · No results ·
Products settings (slide-out) · Tender keypad · Tender on the terminal · Paid (beat) · German
strings. Plus the two workshop switches (*Tender close*, *Legacy*).

**Ledger head** (register only, beside *Order note*): **Same head, stilled** (`still`, default) ·
*Customer stays live* (`customer`) · *Payment progress* (`progress`) · *Receipt facts* (`facts`).
The first two keep the column labels; the others use that row for the payment amounts or receipt
facts. Customer stays live keeps the customer chip tappable, with a receipt hint when a customer
is set; Guest has no hint. The customer picker remains a no-op in this prototype.

### Split payments (2026-09-17)

**The ring** (Paul 2026-09-17, decided): the amount sits inside a ring that divides into arcs per
leg and fills leg by leg in the method's colour; the leg chips carry matching dots; the Even,
Percent and Amount tiles carry little pies. There is no switch. The four other looks drawn on the
way (chips, the bar that fills, tear the receipt, seats) live on only in `board-split.html`, the
record of the choice, which opens them from the URL with State and tablet/phone switches.
The Split chip opens Even, Amount, Percent and Item in the pay pane; Done or × returns to the
keypad, with the plan and Change split below the amount.
Quick-amount helpers stay above the pinned keypad, and Cancel payment is in the pay head after
a payment is taken.

State **Tender · split open** (`split`) opens the chooser; **Tender · 1 of 2 taken**
(`split-1of2`) has the first half taken in Cash and the second ready on Card; **Tender · split
by item** (`split-item`) opens Item mode with the first two lines ticked.

The model keeps taken payments in `S.pays`, planned amounts in `S.payPlan` and a method per leg,
with `remaining()` and `settle()` shared by cash and terminal payments and halves based on the
current cart total. Typing a first amount below the balance takes a partial payment, Cancel
payment removes the last taken payment, and `S.plan` remains the unrelated Free/Pro switch.

### Payments list (2026-09-17)

**Payments list** (register only, beside *Ledger head*): Rows (as drawn) (`rows`) · Rows with
method tiles (`tiles`) · **Paid · left bar and timeline** (`bar`, default) · The story (`story`) ·
Receipt tender lines (`receipt`) · Cards (`cards`). The URL also accepts `payList=<option>`.
State **Tender · 2 of 3 taken** (`split-2of3`) has Cash £10.60 at 14:02, Card £2.00 at 14:03,
and a planned Card £11.50 next. The fixture clock starts at 14:02 and advances per payment.

Every drawing shows each taken payment’s method, amount, time, status, and method detail
(cash tendered/change, card contactless/masked number, or terminal device), plus planned legs
with their amounts and methods and the first marked next. Waiting terminal payments and fixture
Declined statuses are distinct from Captured. With no plan or payments it says “No payments yet”;
the Paid view ends with “Paid in full · 14:04”. Rows keeps the original row treatment with these
additional facts. Only the payments block changes: line items, pinned totals, and Cancel payment
in the pay pane stay in their existing places. These are prototype facts, not live payment data.

Open `board-payments.html` for six side-by-side right-column crops at half scale. Its State
switch compares 2 of 3 taken, 1 of 2 taken, terminal in progress, and Paid. Captions link to
information-pattern references; the drawings are interpretations, not verified product replicas.
`node shoot-variants.js` includes payment-list assertions and `paylist-<option>-{2of3,waiting,paid}`
captures plus `board-payments.jpg`, all under `screens/variants/`.

### Cart → checkout (2026-09-17)

The line items do not move between the cart and the ledger. The head is the same height by
construction: the control height, padding and border, then the same column-header-height row.
Tabs keep their chosen position. The panes and the surrounding cart/ledger furniture fade over
200 ms; the line items do not fade. Reduced motion turns the fade off.

Reports is a page of the app, reached from the rail (the menu sheet on the phone), not a strip
switch (Paul 2026-09-17: link it into the sidebar so the app can be felt as a whole). Each page
keeps its own State while you move between them. Its states and README are in `../reports/`.

## Inventory

Rule 9: the real screen on `next` was sent to Codex read-only (`-m gpt-6-astra`, effort high) for
its state and string inventory before drawing; it returned after cut 1 and cut 2 is reconciled to
it. What it confirmed or corrected: the cart columns (Qty, Name, Price, Total, Actions shown; Image,
SKU, Regular price, Subtotal, Tax, Split hidden) with fees then shipping always after products; the
footer today is *Order Meta* and *Save to Server* with a joined Void / Checkout group; the tab chips
and their priority (rejected → receipt → terminal → part-paid → saving/offline); the register bar's
badge priority and the *Front counter · UK Store* naming; the 8 px draggable divider with a hover
grip and a 25 % minimum per pane; the grid/table toggle and the sliders on the products toolbar;
the products settings as a side Dialog; the tender header today (close 44 px, Payments/Legacy
tabs), method buttons `h-12 rounded-xl`, keypad `min-h-56`, commit `h-14`; the terminal states
and strings (*Starting the terminal…*, *Waiting for the customer on the terminal*, *Sent / On
terminal / Approved / Captured*, *Cancel on terminal*); Void has no confirmation and offers Undo;
the scanner is captured on every POS route. Nothing in the inventory contradicts the decided
structure; the strings in the prototype are the app's, sentence-cased.

## Rejected

- Slate tender surface and full-bleed Paid — the out-list bans coloured working surfaces.
- A wrapping method row — rule 5, tiles keep their width and order.
- Toast per scan — noise on the happy path.
- Navy rail carried over — the loudest block on a calm screen.
- Tabs as buttons — they read as actions and get lost among the real ones (Paul, cut 1).
- A kebab menu per line for edit and remove — a third tap; swipe and hover put the two actions
  where the hand already is.

## Screens

`screens/<width>-<theme>-<scale>-<state>.jpg` for phone, tablet and desktop × default light and
dark × regular and compact × the states in `shoot.js`. `node shoot.js` regenerates them (uses the
monorepo's Playwright), runs the interaction assertions, and fails on any page or console error.
`--quick` captures tablet light regular only.
