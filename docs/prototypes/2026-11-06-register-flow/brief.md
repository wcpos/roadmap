mode: inside-a-system

# Brief: the register flow (WCPOS 2.0, web)

## Subject (one flow, one job)
The cashier's register session on the POS, as one family of surfaces: pick the register this device is at,
open it with a float, run the shift (pay in, pay out), close it with a count, see the closure written, and
find that closure later under Reports › Closures. One job: the cash in the drawer is accounted for from the
first tap of the day to the owner's ledger.

## The problem in Paul's words
"I think I would like a sweep of that whole flow if it hasn't been done already." / "ie: choose register,
entering the float, Paid in, paid out, close register etc etc." (2026-11-06, after seeing the Close Register
mockup of 2026-11-05: "I kind of like the mockups that were produced".)

## Who stands in front of it
A cashier at a shop counter, standing, arm's length from a shared tablet or a counter screen, under shop
lighting. At 9 am they want the till open in three taps; at 5 pm they are tired and a last customer still
hovers. Sometimes a stall-holder who last opened the app four months ago. Judge every step at 5 pm with a
queue: can the next action be found in under a second without reading?

## Start state
The cashier is signed in on this device in store "Corner Shop" (two registers: Front counter, Back bar).
The device is not yet bound to a register. Nothing is sold yet.

## End state
Front counter was opened with a $150.00 float, took $20.00 in and paid $45.00 out during the day, was closed
at 17:41 with $504.35 counted against $519.35 expected (short $15.00, note written), and Closure 42 is on
the Reports › Closures ledger with its document.

## The shift (one story, every step uses these figures; store currency USD)
- Store: Corner Shop. Registers: Front counter (this device), Back bar (open since 08:55 · Tom R.).
- Cashier: Maria L. Opened 09:02, now 17:41. Site default float $150.00; last count $148.20 (yesterday).
- Pay in: +$20.00, reason Change (09:40). Pay out: −$45.00, reason Supplier (14:10); the store's
  approval limit is $40.00, so this one needs a manager's approval.
- Cash sales $412.35 (31 orders) · Cash refunds −$18.00 (1). Expected cash in drawer $519.35.
- Other tenders (not counted): Card $1,284.60 (52) · Gift card $60.00 (2) · Store credit $25.00 (1).
- Count: $504.35, short −$15.00, note "Counted twice. Wrong change on the 16:20 order." Closure 42.

## Every step the flow must draw (checklist; each variant renders all of them, desktop and phone)
1. **Choose register** (cart column, device unbound, 2+ registers): "Which register is this device at?",
   one 56 pt row per register with the live state as a dot and a word ("Open since 08:55 · Tom R." /
   "Closed · last closure #41, yesterday"), the footer line "Change it later from your avatar · Switch register."
   This is RULED (2026-10-21, 2P·A): draw it as ruled, do not re-decide it.
2. **Open the register** (cart column, Open register card): "Cash in the drawer" amount with the default float
   prefilled, the chips "$150.00 default float" and "$148.20 last count", the last closure line, the primary
   "Open register". Plus the first-ever open: no default, no last count, the field empty and the button
   disabled with its reason.
3. **The cashier sheet** (avatar; right side): who/where header, "Your sales today", the ONE door card
   "In the drawer · $519.35 · Front counter · opened 09:02 by (ML)" with the verb line
   "Pay in · Pay out · Close register ›". This is RULED (2026-10-30, frame D): the door card is the way to
   the money; never Pay in / Pay out tiles on the sheet.
4. **The register panel** (right side, opens in place): header (register disc · Front counter · "Corner Shop ·
   open since 09:02 · 8 h 39 m · Maria L."), the figure tiles "In the drawer" and "Session sales", the three
   money tiles Pay in · Pay out · No sale, the ledger (float → cash sales → refunds → paid in → paid out →
   expected), other tenders, one last-closure row, and "Close register" that knows the time
   ("Close register · it's past 17:30"). RULED 2026-10-28 (the map).
5. **Pay in** (a pane pushed in the panel, ‹ back): "How much is going into the drawer?", the amount,
   the reason chips (Change · Float · Tips · Mistake · Other…), "Put $20.00 in". Validation: "Enter an amount"
   / "Add a reason" beside the disabled button.
6. **Pay out**: "How much is leaving the drawer?", the amount $45.00, reasons (Supplier · Petty cash · Bank ·
   Change · Mistake · Other…), "Take $45.00 out". Plus the approval case: "Over the $40.00 limit · a manager
   must approve" → Manager approval (WordPress username · Password · Approve), and "Approval needs a
   connection" when offline.
7. **Close register** (the count pane pushed in the panel): the Close Register family anchor
   (`anchors/family-close-register-*.png`, picked 2026-11-05): counted cash leads, expected folds open,
   Short/Over/Exact with the note required when not exact, "Count by notes and coins" one tap away,
   "Leave in drawer · To bank", other tenders tucked, "Close & print" / "Close register". The sweep keeps
   it and may adjust it only to match the family.
8. **Closure written**: "Closure 42 written", the three tiles Counted · Expected · Variance, the ladder,
   "Print closure" and "Done"; "Unsynced · n rows not yet on the store" when offline.
9. **Reports › Closures**: the owner's ledger (RULED: the room answers "did every till balance, and can I
   prove it?"): a flat list newest first with Expected · Counted · Difference per row and the result as a
   tinted badge (short = bad, over = ok, exact = muted; unsynced or corrected = warning, as the 2026-10-28 map has it), the open session inline with a
   Status, and the closure's document in the right pane (Closure 42: header, three tiles, ladder, note,
   Reprint copy).
Also, where they fit: the cart column's "Counting on another till" state and the "Offline" badge at the top
of the panel. They are not scored as required.

## Widths and themes
- Desktop/tablet web: 1280 wide (navigation rail plus the register's two columns; the register family opens
  from the RIGHT over the register). Shot as a board 1280 × 2400: the flow's steps as frames.
- Phone web: 390 wide (phone layout, tabs; no rail). Shot as a board 390 × 4000: the steps stacked.
- Light and dark are both first-class; the pages draw from `variants/tokens.css` (the repo's live tokens).

## Constraints (binding, from monorepo-v2 CODING_STANDARDS.md § Design and the rulings)
- As simple as possible on the surface, with deep complexity a few taps away. The default screen shows
  only what the common case needs; everything else is reachable in one or two taps and never deleted.
- **One number, one action** per surface: one figure leads and one primary action. Nothing else competes
  in size, weight or colour.
- Touch first: tap targets ≥ 44 px (48 preferred), ≥ 8 px gaps; keys the cashier hits often ≥ 56 px tall
  on a tablet. Destructive actions sit apart from constructive ones. No hover-only affordances.
- Apple's grammar: full-screen for multi-step tasks; sheets for short, dismissable ones; never an enlarged
  centred modal for a task that grew. Back points where the content goes; otherwise a close (×).
- System fonts. Tabular numerals for every amount. Base 14 px web; nothing a cashier reads under 12 px,
  never under 14 px for anything read at arm's length.
- Layout is a grid, not a wrap. Two layouts only: rail + two columns at ≥ 768 wide, phone tabs below.
- State is visible, not explained: offline / saving / refused / disabled is one badge in one place at the
  top of the pane. A disabled control says why in a few words beside it. Never colour alone; pair it with
  an icon or a word. No walls of text.
- Calm colour, semantic tokens: one accent (the theme's primary) for the primary action; `ok`, `warning`,
  `bad`, `info`, `muted` only carry meaning. Primary is never red; red means void/cancel/refund only.
  Contrast 4.5:1 text, 3:1 UI. Flat surfaces, hairline borders, one radius per theme; no gradients, glass
  or decorative shadows; hierarchy from spacing, weight and colour, in that order.
- Words the cashier uses: buttons are verbs with the object ("Open register", "Put $20.00 in",
  "Take $45.00 out", "Close register", "Print closure"). The strings are the app's own
  (`packages/core/src/contexts/translations/locales/en/core.json`, `register.*` and `reports.*`); a variant
  rehosts them, it does not invent a simplified screen.
- The register family (cashier sheet, register panel, pay in / pay out, the count) opens from the RIGHT
  on every screen (Paul, 2026-10-30: "Cashier and Register modal come from the right, but not every
  fucking modal."). The close stays in the panel: Close register pushes the count pane, Close & print
  pushes the written moment, Done closes the panel (2026-10-28 map).
- One door to the register: the avatar's cashier sheet and its "In the drawer" card; there is no register
  icon anywhere (2026-10-29).
- The cart column shows only the states with no register to sell with: Choose register, Open register,
  No register, Counting elsewhere (2026-10-28).
- Never write the product's long trademark name; it is "WCPOS".

## Assumed (pinned by the orchestrator, not by Paul)
- assumed: the sweep rehosts the ruled map (places, doors, sides) and the app's strings; the variants differ
  in how each surface is composed (what leads, how the amount is entered, how the ledger reads, how the
  closed moment and the Closures ledger are drawn), never in where a surface opens or what it is called.
- assumed: the Close Register step keeps the 2026-11-05 pick (right-side pane, counted cash leads) and is
  only re-skinned to the repo's tokens.
- assumed: the expected amount is shown while counting (blind counting is a store setting outside this
  sweep); only cash is counted.
- assumed: the panel's pushed panes are 420 px wide on desktop and full width on the phone.
- assumed: no baseline shots: the live app on :8081 needs a logged-in store and the headless shoot has no
  session, and no gallery cell renders these screens. The baseline for Consistency is the gallery's own
  cells (`anchors/system-gallery-*.png`) and the Close Register family anchor.
- assumed: Mobbin returned no register-session screens for the queries tried (2026-11-06); the two
  references kept are a one-amount-one-action deposit dialog (Base) and Shopify's POS settings row
  grammar. The vendor survey of 2026-10-28 (Square, Shopify, Lightspeed, Loyverse, Toast) stands in for
  the Closures ledger: Expected · Counted · Difference on every row, newest first, open sessions inline.
