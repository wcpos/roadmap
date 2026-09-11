# Tender pane: the keypad is the screen

Date: 2026-09-11. Lane: `next` (1.11.0). Owner: Paul. Status: **approved** on the tenth round of
`docs/prototypes/2026-09-11-tender-pane-mockups/index.html` (*"ok, this looks great!!! Can we start
work on that"*). This spec is the build contract; the mockup is the visual reference and every
state named here is a Jump button on it. Rules: monorepo `.claude/rules/design.mdc`.

## What it replaces

The tender pane of the 1.11 checkout column swap (`packages/core/src/screens/main/pos/checkout/tender/`):
the tile grid, the keypad-under-tiles, the header "This payment · Split" line and the explanatory
paragraph. The ledger pane, the column swap container, the phone full-screen sheet, the Legacy
tab, Cancel payment, the tender reducer's money maths, the terminal and device legs, and the
receipt stage all stay; this changes what the pane shows and how the cashier moves through it.

## The surface

The pane is one dark surface (`--sidebar` slate; brand blue and light are alternates, slate ships
first) with, top to bottom:

1. **Header.** Close (×, 44 pt, Esc on desktop) · `Order #n · k items · customer` (+ `· X paid`
   once a leg exists) · `Cancel payment` (destructive text, only once a leg exists) · a
   Payments / Legacy segmented control at the far right.
2. **Label row.** `TO PAY 46,00 £` or `REMAINING 8,00 £`, the **Split** chip beside it (hidden
   when nothing is left), the offline badge when offline. Under a plan the label is the plan
   text (`Payment 2 of 3 · 12,00 £ left`, `Scarf + Socks · 1 of 2 · 28,00 £ left`).
3. **The number.** The entry, 104 pt (72 on phone), tabular. Pre-typed to *this payment*
   (balance, or the planned leg) and dimmed to 70 % until the cashier types; typing replaces it.
   Under it one line: `Change 2,00 £` (green, rises in 180 ms), `Part payment · 9,00 £ left after
   this`, `Less than planned · X moves to the next payment`, or `Only 18,00 £ is due — Card can't
   give change`.
4. **Plan strip** (only under a plan): one pill per leg. Done legs green with a tick and their
   method; the current leg outlined; upcoming dim; a dashed `then 6,00 £` for the remainder of an
   Item plan; `Pick next items` (Item plans with lines left) and `Change split` as text links.
5. **Method selector.** One pill per enabled, available method in POS-settings order, wrapping;
   the chosen one white. Cash preselected on open. Terminal and reader pills carry a status dot
   (green connected, amber busy, grey off) and battery `82 %` where the driver reports one.
   Unavailable methods are not in the row: a folded `N not available right now` line beneath
   opens a list with icon, title, grey dot for terminals, and the reason. Reasons are the
   existing `disabledReasonKey` strings.
6. **Helpers**, which change with the method: cash → the two notes above the amount and `Exact`;
   card → `Full balance`; terminal/reader → the reader line (`SumUp Solo · Counter 1 · ●
   connected · 82 % · Change`) and `Full balance`.
7. **Keypad.** 3 × 4, digits at 34 pt, no key boxes, pressed state within 100 ms, min height
   224 pt; `C` and backspace muted.
8. **Commit.** One white button, 58 pt: `Take 46,00 £ in Cash`, `Send 18,00 £ to SumUp`, with a
   tail `· 2 of 3`, `· 9,00 £ left` or `· pays it off`. Disabled with `Choose how the customer
   is paying` when no method, or when a non-change method is over-tendered.

Phone (compact): same order, keypad rows 54 pt, the selector scrolls sideways, the ledger folds
to the existing balance bar. Keyboard: digits, Backspace, Enter commits, Esc closes or backs out
of the split view.

## Behaviour

- **Method first, then commit.** Selecting a method never takes money. Changing method keeps
  the typed amount unless it is invalid for the new method.
- **Cash** gives change; the notes helpers are the smallest note above the amount and the next.
- **Card (manual)** and any method with `change === false` refuse an entry above the balance
  with the one-line reason; commit is disabled.
- **Terminal / reader** commit goes straight to the terminal moment; no confirm step.
- **Offline** (existing `online` flag): one badge in the label row, the top-bar dot amber, every
  server/device method moves to the unavailable list with `needs a connection`. Cash and card
  with `offline: 'record'` stay.
- **Cancel payment** (existing voids flow) is the only red text on the surface.

## Split

The Split chip **takes over the pane** (same header with × back to payment; no sheet). The
amount being split stays at the top at full size; under it a four-tab segmented control:

| Tab | Options | Plan it makes |
|---|---|---|
| **Even** | 2 · 3 · 4 · 5 · 6 ways, amount each shown | `even {ways}`: equal legs over the remaining balance, remainder on the last |
| **Amount** | 5 · 10 · 20 · 50 (only those below the balance) · Half · *Type the first payment* | `fixed {first}`: one leg of `first`, the rest one more leg; *Type* returns to the keypad with the entry cleared |
| **Percent** | 10 · 20 · 25 · 30 · 50 · 75 %, amount shown | `fixed {first, title: "25 %"}` |
| **Item** | Cart lines with tick boxes, paid lines greyed with `paid · Card`; `Pay for these · 28,00 £`; `or share these between 2 · 3 · 4` with the amount each | `items {ids, first: sum, ways}`: `ways` equal legs over the ticked lines, then the rest |

Rules for every plan:

- The current leg is pre-typed; typing less re-plans the remainder evenly across the legs still
  to come (`Less than planned · X moves to the next payment`); typing more on cash gives change.
- Each leg can use any method.
- **Item plans loop.** When the group's legs are all taken, the ticked lines are marked paid
  with the methods that paid them (the ledger shows `paid · Card + SumUp` on the line); the
  strip shows `Rest 6,00 £` outlined and `Pick next items`, which reopens the Item tab with paid
  lines greyed. The plan ends when the balance is zero.
- `Change split` reopens the split view with the current plan highlighted; `No split` clears it.
- Split view copy is one line per tab: `Any method for each payment · change the split at any
  time`; `The first payment is this much, the rest is one more payment`; `…this share…`;
  `Tick what this customer is paying for · pick the next items after` / `2 of 3 items paid ·
  tick the next ones, or close to take the rest`.

Reducer mapping: today's `splitPlan {ways, shareMinor, taken}` and `customAmount` become
`plan: {kind:'even', ways, from} | {kind:'fixed', firstMinor, title, from} | {kind:'items',
lineIds, firstMinor, ways, from} | null`, where `from` is the payment-row count when the plan
was made. `tender-recorded` advances by counting rows since `from`; the Item plan writes
`line → payment` provenance on the order (the receipt prints it). Item apportioning of tax and
discounts is by line total; the order's existing totals are not recomputed.

## The terminal moment

After `Send X to <terminal>` the pane becomes the terminal view: header `Order #n · Payment 1 of
1`, `ON THE TERMINAL` label, the amount at 80 pt, one status line, a 112 pt ring, a card with
`<model> · <reader>` and `● connected · 82 %`, a four-step timeline **Sent → On terminal →
Approved → Captured**, and `Cancel on terminal`. The ledger row shows `Waiting`.

Timeline mapping to the existing leg phases (`terminal-leg-view.tsx`): `creating` → Sent
current; `collecting` / `polling` → On terminal current; `confirming` / `capturing` / `polling
+ capturing` → Approved current; `final` captured → Captured done, then the Paid moment; `final`
failed / cancelled / expired → the existing failure copy in the status line, timeline stops at
the step that failed, buttons `Try again` / `Choose another way` (existing). `cancelRequested`
and `cancelling` reuse the existing strings. Show log / Hide log stays, folded under the card.

Animation: the ring spins at 1 s linear; step dots fill with a 200 ms ease-out; the status line
crossfades 150 ms; nothing blocks Cancel. Reduce-motion: ring static, dots switch instantly.

## The Paid moment

When the balance reaches zero the pane turns success green (200 ms), a 96 pt white tick draws
its stroke over 450 ms after a 150 ms delay, and the headline is `Change 2,00 £` for cash with
change or `Paid 46,00 £` otherwise; the sub-line names the method(s) (`Paid 46,00 £ · tendered
50,00 £ in cash`, `SumUp Solo · Counter 1 · contactless`, `3 payments: Cash 18,00 £, Card 11,00 £,
SumUp 11,00 £`). Buttons: `Print receipt · New sale` (white), `Email receipt`, `No receipt · New
sale`. This is the receipt stage's content re-skinned: auto-print, the preview frame wait, and
`New sale` semantics are unchanged. Native gets a short success haptic on capture.

## Copy

New `pos_checkout.*` keys: `to_pay`, `remaining`, `split`, `change_split`, `no_split`,
`pick_next_items`, `not_available_right_now_n`, `exact_amount`, `full_balance`, `take_amount_in`
(exists), `send_amount_to`, `pays_it_off`, `amount_left`, `part_payment_left`, `less_than_planned`,
`no_change_for_method`, `choose_how_paying`, `payment_n_of` (exists), `rest_of_the_order`,
`split_even`, `split_amount`, `split_percent`, `split_item`, `n_ways`, `each`, `then_amount`,
`half`, `type_first_payment`, `pay_for_these`, `share_these_between`, `items_paid_of`,
`on_the_terminal`, `sent`, `approved`, `captured` (existing status strings reused), `paid_amount`
(exists), `change_amount` (exists), `email_receipt`. English in `en/core.json` only.

## Test IDs

`checkout-close`, `checkout-entry`, `checkout-label`, `checkout-split-chip`, `checkout-plan`,
`checkout-plan-leg-<i>`, `checkout-method-<id>`, `checkout-method-status-<id>`,
`checkout-unavailable-toggle`, `checkout-unavailable-<id>`, `checkout-quick-<value>`,
`checkout-key-<k>`, `checkout-commit`, `checkout-split-tab-<even|amount|percent|item>`,
`checkout-split-option-<value>`, `checkout-split-item-<lineId>`, `checkout-split-items-go`,
`checkout-split-share-<n>`, `checkout-terminal-step-<i>`, `checkout-terminal-status` (exists),
`checkout-terminal-cancel`, `checkout-paid`, `checkout-paid-headline`, `checkout-paid-print`,
`checkout-paid-email`, `checkout-paid-none`.

## Out of scope

Blue and light surfaces (tokens only, no toggle). Tips. Per-line tax apportioning beyond line
totals. A confirm step before a terminal. Changing the ledger pane. Wayfinder #171's offline
save states keep their existing views; this pane inherits them.

## Build slices (one PR each, `next`)

1. **Surface, selector, keypad, commit** — replace `TenderPane` tiles+keypad; selector with
   status dots (driver `status$` + battery where a driver exposes it); unavailable list; helpers
   per method; commit labels; phone layout. Reducer: `pick-method` keeps entry; commit path
   unchanged.
2. **Split view** — takeover view, four tabs, `plan` reducer shape, plan strip, item provenance
   on the order and the ledger's `paid ·` marks, Item loop.
3. **Terminal moment** — timeline over the existing leg phases, ring, card, cancel; failure
   states; reduce-motion.
4. **Paid moment** — receipt stage re-skin, tick draw, haptic, three buttons.
5. **Copy + E2E** — strings, test IDs, a web E2E walk of cash exact, cash with change, card
   over-tender refusal, even split 2 ways, item split with share, terminal capture (simulated),
   offline.

Acceptance for each slice is the mockup's Jump state of the same name, screenshotted tablet and
phone in the PR body, plus the design rule's definition of done.
