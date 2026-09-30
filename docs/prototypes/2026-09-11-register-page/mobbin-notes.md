# Mobbin pass — what its library has for the register (2026-09-11)

Run through the Mobbin MCP (`claude mcp add mobbin --scope user --transport http https://api.mobbin.com/mcp`), six search batches, ~180 results. Links are Mobbin pages; images are Mobbin's, not vendored.

## What Mobbin does not have

No screens at all from Square POS, Zettle, SumUp, Lightspeed, Loyverse, Toast, Clover, Odoo or Vend. Queries for "open register / starting float", "close shift / count drawer / discrepancy", "pay in / pay out / no sale" and "cash drawer status on the checkout screen" return consumer fintech (Cash App, Chime, Revolut), e-commerce checkouts, and the Shopify **admin** app's draft-order flow. The vendor help-centre research in #204/#205 stays the source for register *flows*; Mobbin is a source for *patterns*.

## The one genuine register screen

**Shopify admin › Point of Sale › Register sessions** (web) — https://mobbin.com/screens/1fa59dcd-d522-44e3-a2dc-ebdbbb485a80

Filters `Today` · `All locations`; a six-cell stat strip **Sessions opened · Sessions closed · Cash at open · Cash activity · Cash at close · Discrepancy**; tabs **All / Open / Closed**; a table; `Export` top right. Back office only — no cart.

Steal for **Reports › Closures** (Pro):
- The stat strip above the table, summing the filtered range: closures, cash at open, activity (in − out), cash at close, variance. Our table has the per-row figures; the strip gives the manager the range answer without a spreadsheet.
- An **Open** tab: sessions currently open on other registers, read-only (Square lets a manager *end* a drawer from the dashboard but never *start* one; #205 §10.3). Whether a manager may start counting remotely is a decision, not a default — flagged below.

## Patterns worth stealing, mapped onto the second cut

### Open register card → amount entry (Chime, Stake, talabat, World App)
https://mobbin.com/screens/bc213e0f-1c21-42cc-b5f4-22653f95a783 · https://mobbin.com/screens/ec94a6f9-14d6-45e7-95f0-b3740a4f72a7

Convention: one oversized number, **three preset chips in a row directly above the keypad**, primary button under the chips or pinned to the bottom. The number is prefilled with the suggested value.

Change to the card: replace `Expected float £200 … [Use £200]` with the big amount **prefilled** to the expected float and a chip row `£200 default float` · `£195.00 last count` · `Other`. One tap confirms the common case; typing overrides. Opening variance line appears only when the typed value differs. On phone, a numeric keypad, not the system keyboard.

### Count by denomination → stepper rows with the total pinned (Warby Parker, Booking.com, Grill'd)
https://mobbin.com/screens/763ae052-8853-43e3-b963-ad1c75b593bd · https://mobbin.com/screens/9db6b7f0-fbbb-4c6a-bcb3-4457afe35cea

Convention: label left, `− count +` right, one row per item, **running total pinned in the sticky footer beside or inside the primary button**.

Change to the count: the denomination helper becomes a list of rows (`£20 · − 8 + · £160.00`) instead of a grid of free inputs, and the footer reads **`Close & print · £177.50`** so the counted total is never scrolled away. Rows at zero stay visible (Shopee), because a cashier scans for the note they are holding.

### First sign-in → name with suggestions (Xbox, IKEA, Philips Hue, Eight Sleep)
https://mobbin.com/screens/b65349da-145a-4a57-85e8-c1d22441beb7 · https://mobbin.com/screens/6186c991-1b9f-48b1-8988-a0f1518a1131

Convention: prefilled default **or** a short list of tappable suggestions, keyboard already up, exactly one primary button.

Change to the setup card: keep the prefilled `Front counter` and add three suggestion rows under the field — `Front counter`, `Back office`, `Register 2` — the last derived from the store's register count. Skip is wrong here (the register must exist), so no secondary button.

### Register panel → right drawer (Revolut Business, Airwallex, Maze, Xero)
https://mobbin.com/screens/b6cf6d78-c811-4af2-827f-c4d2ba0fd1f1 · https://mobbin.com/screens/98c5699d-743b-49c3-9523-f3f3511c0962

Convention: roughly a third of the width, **headline amount in the fixed header**, labelled sections with status pills, cancel + primary pinned to the panel footer. Revolut puts the headline number *as the title*.

Change to the panel: move the expected figure into the header line (`Register · £480.80 expected`) so the hero card can shrink and the three cash actions rise; the panel is what a cashier opens to *do* something, not to read a number they already saw on the bar. Footer stays: `Close register` + `Done`.

### Register bar → status strip (Airwallex, Remote, Satispay)
https://mobbin.com/screens/f5c82067-1d39-4c3b-a0cd-c90b86969d91 · https://mobbin.com/screens/a76ec0ee-e2fb-449b-a28a-420e999ed1a7

Convention: **status in a coloured pill, amount in a large neutral number**, fixed above the scrolling list, chevron or whole row as the tap target. Warning colour carries the state; the amount stays neutral.

The bar already does this. One change: when overdue, colour the pill, not the whole bar — the amount stays neutral so it still reads as a figure, not an alarm.

## Decisions these raise (Paul)

1. **Reports › Closures gains an Open tab** listing sessions open on other registers. Read-only, or may a manager start counting remotely (Square: end yes, start no)?
2. **Prefill the float** (Chime/Shopify) vs make the cashier type it (first cut). Prefill is the convention; the opening-variance line still catches a drawer that differs.
3. **Denomination rows with steppers** replace the free-input grid. Same data, fewer mis-taps on a phone.

Everything else above is a refinement of the second cut and can land in it without a ruling.

## Round two (same evening) — no title bar: where offline, notifications and identity go

Asked Mobbin the three placement questions directly instead of asking for POS screens. Seven searches, ~90 results, work tools preferred. Images viewed, not just descriptions.

### Offline
- **Substack editor** — https://mobbin.com/screens/9fd25f36-21d5-4081-bf84-91a254993ffd — a ~20 px amber `● Offline` pill top-left of the pane's toolbar row; nothing blocked; quiet state is *no pill*.
- **Aboard** — https://mobbin.com/screens/304bebf4-8055-4ada-883b-24e938686783 — the only top chrome is a 24 px strip with a yellow "Trial mode · 1 day left" pill centred; the rail and content carry no alert.
- **Asana / Podia / Alta** — a full-width tinted banner only where an action is actually blocked; **n8n** — a green toast on reconnect, then nothing.
- **iOS (Particle, Alta, Qantas)** — a floating capsule under the status bar or a tinted banner between header and content; retry lives in the page body.

Convention: **status is a small pill in the pane's top row while true, absent otherwise; a banner only where something is blocked.** This is rule 5 verbatim. So: no green dot anywhere. An amber `Offline` pill appears in the register bar only while offline. If a tender is blocked offline (card via server), that tender's tile says so, not the bar.

### Notifications
- **Gorgias** — https://mobbin.com/screens/6c590e83-4434-467e-ad4a-5bf202e11459 — dark ~40 px rail, bell third from top, unread = red 14 px circle with the count on the glyph's corner; panel opens flush against the rail.
- **Hootsuite** (quiet) — https://mobbin.com/screens/997eeac9-7b55-46f2-87ca-d59e79dfb473 — bell at the *bottom* of the rail above help and avatar; no badge when nothing is unread.
- **Patreon / Homerun / Copilot** — labelled sidebars put the count as a pill on the row; quiet rows have no pill.

Convention: **rail bell in the bottom cluster; a count badge only when there is a count.** Done in D and E. Phone: a dot on the hamburger.

### Identity, no caret
- **Hootsuite** — https://mobbin.com/screens/155a6fa5-52e6-466e-b3b3-6333eb747dd6 — bottom cluster bell → help → avatar as the last item; clicking the avatar slides a 300 px account panel out beside the rail.
- **Shop (Shopify)** — https://mobbin.com/screens/e759e521-b2e4-440b-8ef5-0f6532962be0 — 40 px rail, single initials avatar pinned bottom-left, no header row at all.
- **Fabric** — https://mobbin.com/screens/8b1dee7d-68a4-4f99-b7ef-4f3eb374983f — avatar last in the rail with a corner dot as the only status signal.
- **Patreon** — https://mobbin.com/flows/63dda702-ffb9-4b29-a69e-a58be8bf9ad9 — sidebar footer row (avatar, name, role) whose kebab opens a popover of accounts with a check on the current one — the Switch User shape.
- **Postman** — avatar with no caret opens a popover; the caret is not needed for discoverability on an avatar.

Convention: **avatar as the rail's last item, opening a panel; no caret.** That is D. E moves the avatar to the bar for one reason only: the session records who acted, and the till is where a second cashier steps in. Both are conventional; the choice is whether "who is ringing" is till state or app state.

### The layout itself
- **Fresha POS** — https://mobbin.com/screens/bcbc7fb0-545b-42c7-9451-608eef1f5747 — dark icon rail, catalogue centre, ~240 px cart column right, **no app bar**; the only header is a 24 px breadcrumb `Cart › Tip › Payment` at the top of the centre pane that doubles as a step strip.
- **Square (web)** — https://mobbin.com/screens/f4cd018c-ee3c-4fb6-93db-6599ffbcc115 — one 48 px strip: × and settings left, running total centred, Create order / Reset / Charge right; alerts are an inline peach banner, never in the strip.

Convention: **the POS screen's only chrome is one thin strip carrying the sale's state**, and alerts go inline in the pane. Removing our title bar is the conventional move, not the radical one.

## Round three — polish: the beat at completion, calm money entry

Six searches, ~80 results, calm examples only (Careem, Canva, Care.com, Workable, AutoSend excluded for sparkles, confetti, poppers, thumbs-up and glossy 3D checks).

### Completion is a state change, not a new page
- **Wise** — https://mobbin.com/flows/bcb39266-2ceb-4c95-83b6-ec7a1f755211 — after "Mark as paid" nothing navigates: the avatar gains an 18 px green check badge, a row changes to "Paid on Wednesday", the buttons disappear.
- **Kit** — https://mobbin.com/flows/93424cea-0e3d-497a-8a7b-90c71532cca1 — checking off a job: the checkbox fills, a small "Done today ✓" pill appears, the total updates in place. No modal, no button.
- **PayPal** — https://mobbin.com/flows/34e1ed64-0a44-414e-ace8-b585ddc13f30 — a 24 px green "Completed" pill top-left of the detail sheet.

Applied: **Paid in / out / No sale** never leave the panel — the Paid in/out row settles with a short highlight and its figure updates in place; a dark toast at the top of the cart names the exact movement. **Open register** returns the cart with one toast: `✓ Register open · float £195.00`.

### When a moment deserves its own screen
- **Jobber, Payment Recorded** — https://mobbin.com/screens/ffc24d22-55cf-4e32-afa6-39c76c713375 — a 40 px pale-green disc with a thin dark-green check, one line with the amount, outlined *View Receipt* and filled *Done*. The closest to a till.
- **Starling, Transfer approved** — https://mobbin.com/screens/cfef74cd-7dc3-4f7e-8385-7b1ff8598a34 — a 72 px mint disc with a thin check and three words. Nothing else.
- **Chime, Vivid** — outlined green circle-check 32–56 px, the amount, one *Done*.

Applied: **Closure N written** is the only moment with its own sheet: a 40 px pale disc with a thin check (stamps in at 250 ms), the three figures (counted, expected, variance — counted only for a blind cashier), the Z-report as a preview fold, and one primary action *Print Z-report*. After printing, a green *Printed on Epson TM-m30* line and *Done*; a PRINTED stamp lands on the receipt.

### Toasts
- **Klarna** — https://mobbin.com/screens/ac043613-ee27-4614-9bdc-cc0380e5b411 — pale-green bar under the status bar, 18 px check, copy naming the object, underlined *Undo* at the right.
- **Medium, Kitchen Stories, Julienne** — a dark inset bar near the top, copy naming exactly what changed, *Undo* at the right, no icon or a small one.

Applied: the toast is a dark inset bar at the top of the cart column, an 18 px check, the exact object (`Paid out £10.00 · Parking`), and **Undo** at the right for Paid in / Paid out (undo = the voiding row the model already has). 2.2 s, or 4 s when Undo is offered.

### Money entry
- **Cash App, Chase UK, Oportun, Wealthfront** — one oversized amount with the symbol locked to the figures, a grey secondary line, a bare keypad, one *Next*.

Applied: the big inputs (float, cash counted, movement amount) are 64 px, 32 px tabular figures, the `£` adjacent to the digits in the same weight, left-aligned so the symbol and the number read as one token. One line under, one button.

### Receipt preview
- **Satispay** — https://mobbin.com/screens/0f78d64c-f57e-4c3e-839c-6b022bff3440 — the page on top, then stacked full-width *Share / Download / Print*: print is a first-class button, not buried in a share sheet.
- **Apple Wallet, Klima** — rendered page with a page badge; export as one pill.

Applied: *Print Z-report* is the sheet's primary button; the preview is a fold. The reprint sheet keeps the COPY stamp.

### Pressed states and motion (from the rules, confirmed by every calm example above)
- Every tap target shows a pressed state within 100 ms: 1.5 % scale and a tint on buttons, tiles, list rows, the bar's icon buttons and chips.
- Sheets fade and rise 150–200 ms ease-out; the panel slides 220 ms; the toast drops in 200 ms; the settle highlight fades over 800 ms. `prefers-reduced-motion` switches all of it off.
- Nothing below 12 px; chips are 44 pt; tiles 56 pt; rows 44 pt.

## Correction (2026-09-12) — Fresha's checkout is on Mobbin

The opening section says Mobbin has no register screens. Round two then cites one Fresha POS
screen for its layout. Both under-read what is there: **Fresha's business app**, indexed under
the **web** platform, has three complete checkout flows. *Checking out a service*
(https://mobbin.com/flows/e0f7c390-5f07-4ea8-9b82-7d311d71f81b), *Adding a sales*
(https://mobbin.com/flows/baea22c6-be8a-4d03-8132-e60af499f538) and *Selling a membership*
(https://mobbin.com/flows/d39476e2-ebe6-459b-9775-2189b91ca7df). Together they show the cart
column with client, lines, subtotal, tax, tip and *To pay*; a *Select payment* grid of equal
tiles (Cash, Gift card, Split payment, Other); a split-payment numpad with preset amount chips
and *Left to pay*; a tip picker with percentage tiles and *Custom tip*; *Save unpaid* and
*Save part-paid* as the secondary action; and a sale activity timeline once paid.

Why the flows were missed: the searches asked iOS for POS screens, and Fresha's iOS entry is the
consumer booking app. Business tools on Mobbin (Fresha, Square dashboard, Shopify admin, Xero)
are web captures. The coverage rule that follows: check by bare app name on both platforms in
deep mode before writing "not on Mobbin". The absent list (Square POS, Zettle, SumUp,
Lightspeed, Toast, Loyverse, Clover, Vend) was re-checked that way on 2026-09-12 and stands.

What Fresha adds: the equal-tile payment grid and the numpad-with-chips are the conventions the
tender pane mockups (PR #259) landed on, now with a like-for-like business-app source rather
than consumer fintech. Nothing in the register flow itself changes.
