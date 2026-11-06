# Brief: Close Register (WCPOS 2.0, web)

## Subject (one screen, one job)
The **Close Register** screen. One job: end the shift on this register. The cashier counts the cash
drawer, sees what the system expected against what they counted, writes a note, and closes the register.

## Who stands in front of it
A cashier at a shop counter, standing, arm's length from a shared tablet or a counter screen, under shop
lighting, at the end of a shift (tired, wants to go home, sometimes a last customer still hovering).
Sometimes a stall-holder who last opened the app four months ago. Judge it at 5 pm: can the next action
be found in under a second without reading?

## Start state
The register is open. The cashier tapped **Close register** on the cashier card (the cashier card is the
way to Pay in / Pay out / Close register). The shift's sales are done.

## End state
The register is closed and a closure record is saved (it appears in Reports > Closures). The cashier sees
a short confirmation with the closure's figures and can print the closure slip or leave.

## Figures to use (sample shift, store currency USD)
- Register: "Front counter", cashier: "Maria L.", opened 09:02 today, now 17:41.
- Opening float: $150.00
- Cash sales: $412.35 (31 orders) · Cash refunds: −$18.00 (1) · Pay in: +$20.00 · Pay out: −$45.00
- **Expected cash in drawer: $519.35**
- Other tenders (not counted, recorded by the system): Card $1,284.60 (52) · Gift card $60.00 (2) · Store credit $25.00 (1)

## Every state the screen must draw (checklist, each variant renders all five)
1. **Drawer short**: counted $504.35, difference −$15.00. Note required before closing.
2. **Drawer over**: counted $522.55, difference +$3.20. Note required before closing.
3. **Drawer balanced**: counted $519.35, difference $0.00. Note optional; closing is one tap.
4. **First-ever close (no previous float)**: this register has never been closed and no opening float
   was recorded. Expected cash is sales-based only ($369.35 = 412.35 − 18.00 + 20.00 − 45.00, float
   unknown). The screen must make the missing float plain and offer to enter it, without blocking the close.
5. **Offline**: the device has no connection. Counting and closing still work; the closure is saved on
   this device and syncs when the connection returns. One badge, at the top of the pane.
Plus, implied by the job: the empty count (nothing typed yet, Close disabled with the reason beside it)
and the closed confirmation. Draw them if they fit; they are not scored as required states.

## Widths and themes
- Desktop/tablet web: 1280 × 800 (navigation rail plus the register's two columns behind or beside it).
- Phone web: 390 × 844 (phone layout, tabs; no rail).
- Light and dark are both first-class.

## Constraints (binding, copied from monorepo-v2 CODING_STANDARDS.md § Design)
- As simple as possible on the surface, with deep complexity a few taps away. The default screen shows
  only what the common case needs; everything else is reachable in one or two taps and never deleted.
- Clean and modern, Apple touch-screen grammar; joy means speed, precision and a quiet acknowledgement
  when something completes, never decoration.
- **One number, one action**: one figure leads and one primary action. Nothing else competes in size,
  weight or colour.
- Touch first: tap targets ≥ 44 px (48 preferred), ≥ 8 px gaps; keys the cashier hits often ≥ 56 px tall
  on a tablet. Destructive actions sit apart from constructive ones. No hover-only affordances.
- Full-screen for multi-step tasks; sheets for short, dismissable ones; never an enlarged centred modal for
  a task that grew. Back points where the content goes; otherwise use a close (×) or a labelled action.
- System fonts. Tabular numerals for every amount. Base 14 px web; nothing a cashier reads under 12 px,
  never under 14 px for anything read at arm's length.
- Layout is a grid, not a wrap. Two layouts only: rail + two columns at ≥ 768 wide, phone tabs below.
- State is visible, not explained: offline / saving / refused / disabled is one badge in one place at the
  top of the pane. A disabled control says why in a few words beside it. No walls of text: an error or
  trouble state is one line, the actions, and a link to docs.wcpos.com. Never colour alone; pair with an
  icon or a word.
- Calm colour, semantic tokens: one accent colour (blue primary) for the primary action; semantic colours
  (ok, warning, bad, info, muted) only carry meaning. Primary is never red; red means void/cancel/refund
  only. Contrast 4.5:1 text, 3:1 UI. Flat surfaces, hairline borders, one radius; no gradients, glass or
  decorative shadows; hierarchy from spacing, weight and colour, in that order.
- Words the cashier uses: buttons are verbs with the object ("Close register", "Print closure slip").
  Plain words. Must survive German length.
- Never write the product's long trademark name; it is "WCPOS".

## Assumed (pinned by the orchestrator, not by Paul)
- assumed: the expected amount is shown while counting (not a blind close); blind close is a store setting outside this screen.
- assumed: only cash is counted; card, gift card and store credit are shown read-only and tucked away (one tap to see).
- assumed: counting is by total amount by default, with "Count by notes and coins" one tap away (denomination grid hidden, not removed).
- assumed: a note is required when the difference is non-zero and optional when balanced.
- assumed: "Leave in drawer for next shift" (float to keep, default = opening float) and "To bank" (counted − float) are part of the close, shown as a secondary line.
- assumed: offline closing is allowed; the record queues locally and syncs.
- assumed: store currency USD, en-US formatting, for judge readability.
- assumed: presentation is a full-height surface over the register (a multi-step task). Paul's ruling, verbatim: "Cashier and Register modal come from the right, but not every fucking modal." A right-side panel is therefore an allowed variant for this register-owned task, not a requirement.
- assumed: no baseline exists (no Close Register screen on monorepo-v2 origin/main as of 2026-11-05); no reference anchors (no Mobbin in this session; the vault's competitor notes list names only, no screens).
