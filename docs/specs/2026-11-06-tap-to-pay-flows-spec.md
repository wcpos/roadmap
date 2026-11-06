# Tap to Pay flows: enable, prepare, pay, recover

Date: 2026-11-06. Lane: monorepo `main` (2.0), extension repos `next`. Owner: Paul. Status:
**design approved (ruled 2026-11-05 on #113, "ok, as you recommend"), options board for
slices 2 and 3 next, then build.** Parent: #113 (Tap to Pay hardware and accounts) under #231
(card terminals at the register). Research: `docs/research/2026-10-06-tap-to-pay-per-provider.md`
(§4 and §4b carry Apple's checklist numbers used below). Per-till design:
`docs/handoffs/2026-11-06-per-till-reader-connection-handoff.md` §4c part two is folded into
slices 2 and 3 here (ruled on #523, 2026-11-05/06). Rules: monorepo `.claude/rules/design.mdc`;
the PR size law (600 added production lines, round 5 cap; an implementer that stops at its budget
ends the slice, never a lift).

## Owner decisions

1. **The six-slice decomposition and the three recommendations proposed on 2026-10-06 stand**
   (#113, 2026-11-05): admin is `manage_woocommerce` and the gate fails closed; Tap to Pay is its
   own pinned pill in the tender pane, never greyed; a declined or timed-out tap still offers a
   receipt, built client-side and sent through the share sheet or email.
2. **Reader maintenance lives in Settings, not checkout** (#407, 2026-10-06: *"we should have a
   page in the settings for terminals, like we do for printers"*). The Card readers page exists
   (monorepo #2529, Direction D). This spec adds to it; it does not redraw it.
3. **The connection type is per till, chosen on the Card readers page, never asked at checkout**
   (#523, 2026-11-05/06). On a native till whose store allows both smart readers and the app's
   readers, the cloud reader rows and the phone's own rows sit on the same page, and the selected
   row decides the leg's transport.
4. **Warm-up is a scoped exception to lazy start**: the SDK prepares the phone at launch and on
   every return to the foreground **only on a till where Tap to Pay has been set up**. Apple's
   checklist 1.5 requires the warm-up; the lazy-start policy protects every other merchant.
5. **Slices 5 and 6 wait for the first device run** on the borrowed iPhone (#113, 2026-11-05);
   slices 1 to 4 are specified to build now. Stripe is the first provider; SumUp follows through
   the same seams once #236 lands (its SDK brings its own terms and education screens).

## Vocabulary

- **Set up**: the one-time act of accepting the provider's Tap to Pay terms on this phone. Apple:
  *enablement*. Only an administrator does it; everyone else sees "Ask an administrator".
- **Preparing**: the SDK configuring the phone as a reader after set-up and on every warm-up.
  Apple: *configuration*, reported as `updateProgress`.
- **Ready**: the phone is a connected reader (`status.reader.transport === 'tap_to_pay'`).
  Its name app-wide is **This device** (`settings.card_readers.this_device`), never the model.
- **Terminal moment**: the stepper the pay sheet shows from "Hold the card to the top of the
  phone" to the outcome. Already a chosen design; this spec changes its words, not its shape.

## Slice 1: driver and harness (Stripe)

Where: `apps/main/lib/payment-drivers/stripe-terminal/driver.ts` and `packages/core/src/services/
payment-drivers/types.ts`. SDK names are Stripe's React Native Terminal SDK's; the implementer
checks them against the installed `@stripe/stripe-terminal-react-native` before writing.

- **Terms are the provider's truth, never ours.** `connect()` for a `tap_to_pay` reader passes
  `tosAcceptancePermitted: caps.canAcceptReaderTerms` (fail closed: unknown capabilities mean
  `false`). The SDK's terms sheet is Apple's; the app never shows its own. The driver listens for
  `onDidAcceptTermsOfService` and records nothing but a log line: whether the merchant has
  accepted is read from the SDK every time (Apple 1.6), never from local state.
- **A non-admin connect that needs terms** fails with a typed status reason
  `terms_required` (new on `DriverStatus`), which the row and the pill turn into "Ask an
  administrator to set this up" (`settings.card_readers.tap_to_pay_admin_only`, exists).
- **`prepare()`** (new on the driver interface, optional): on iOS, calls the SDK's Tap to Pay
  warm-up for a till that has set up (the remembered reader for this method has
  `transport: 'tap_to_pay'`, `remembered-readers.ts`); otherwise returns at once. Called from the
  app root on cold start and on `AppState` active, after the drivers are registered. Decision 4
  bounds it: a till with no Tap to Pay memory never touches the SDK at launch.
- **Progress** already flows from `onDidReportReaderSoftwareUpdateProgress` into
  `status.progress`; `prepare()` reports through the same field so one indicator serves both.
- **Android**: the same `prepare()` and terms seam, with the attestation outcomes
  (`ATTESTATION_FAILURE`, `TAP_TO_PAY_INSECURE_ENVIRONMENT`) mapped to two status reasons whose
  lines say what to turn off (screen recorders, accessibility services, overlays, developer
  options). The Stripe plugin options from #429 are already in `app.config.ts`.
- **Tests**: driver tests for the terms flag on both capability states, `prepare()` on a till with
  and without a Tap to Pay memory, and the two Android reasons. No device needed.

Budget: 600. Nothing visual.

## Slice 2: the Card readers page, native half of per-till

Where: `packages/core/src/screens/main/settings/card-readers/` (`index.tsx`, `reader-row.tsx`,
`use-reader-actions.ts`, `docs.ts`). The page already has sections **This phone** (Tap to Pay row
and a connected phone reader) and **Bluetooth readers**, one state line per row, a stable action
slot, the admin-gated **Set up**.

What this slice adds:

- **The Tap to Pay row's full state line**, one answer per state: `Not set up · Set up` (admin),
  `Not set up · ask an administrator` (exists), `Preparing… 40%` (progress from slice 1, Apple
  3.9.1), `Ready · This device`, and an error in plain words with Help beside it. The row is never
  hidden on an eligible phone (Apple 3.6): iOS 17.6+ on an iPhone XS or later, or an Android
  phone whose descriptor lists the transport. Below iOS 17.6 the line says "Update iOS to use Tap
  to Pay" (Apple 1.4).
- **The awareness moment** (Apple 3.1 to 3.4): the first tap on **Set up** opens a full-screen
  sheet with Apple's copy and the `wave.3.right.circle` symbol, one button, **Continue**, which
  hands over to the SDK's terms sheet. Shown once per phone; reachable again from the row's
  overflow as **About Tap to Pay**. The education flow (slice 5) opens right after terms are
  accepted (Apple 4.2) and from the same overflow (4.3); until slice 5 lands the overflow item is
  absent, not disabled.
- **Cloud readers on the same page** (#523 part two): when the method's `capture.modes` carries a
  `server` entry, a third section **Smart readers** lists `hardware.readers` (name, online or
  offline, location), with the store's `lock_to_default` honoured as it is on web. A tap selects
  the row for this till; the selection is remembered per device beside the Bluetooth memory
  (`remembered-readers.ts` gains `{ transport: 'server', reader_id }`). One selected row per
  method across all three sections: selecting a smart reader releases a held Bluetooth reader
  after the same confirm Disconnect uses today, and vice versa.
- **The empty and the unavailable lines** follow the handoff's rule: a section the store does not
  allow shows one line naming the gateway setting ("Only smart readers are allowed for this
  payment method. Allow the app's readers on its WooCommerce settings page.") with the docs link,
  never a disabled control.
- **Permission pre-alerts** (Apple 2.x): location, and notifications for slice 4's missed-result
  alert, are asked from this page at set-up time, each behind one sentence that says why, never
  first at checkout.

Board questions (the options board precedes the build; see "Options board" below): the shape of
the selected state across three sections, where the awareness sheet's Continue leads on Android,
and how a phone with every section populated reads at phone width.

Budget: 600, with the cloud section allowed to split out as its own PR if the board lands it
heavier than the Tap to Pay states.

## Slice 3: the tender pane

Where: `packages/core/src/screens/main/pos/checkout/tender/` (`tiles.ts`, `tender-pane.tsx`,
`labels.ts`, `use-tender-flow.ts`).

- **Tap to Pay is its own pill.** A device-mode method whose descriptor lists `tap_to_pay` and
  whose driver can connect the phone contributes a second tile beside the gateway's own: label
  Apple's localised string ("Tap to Pay on iPhone"; "Tap to Pay" when the pill would wrap), the
  `wave.3.right.circle` symbol, no provider logo (Apple 5.4, 5.5). On Android the label is "Tap to
  Pay". One pill per phone, not per provider: when two providers both offer Tap to Pay, the pill
  belongs to the method whose Tap to Pay row is set up; two set-up providers is a board question.
- **First among cards and never greyed** (Apple 5.1 to 5.3). The pill sits first in the card
  group; the cash tile's place is unchanged. Before set-up a tap opens the awareness sheet and
  terms (admin) or the "Ask an administrator" line (everyone else) inside the pay sheet, one
  line, with the link to Settings › Card readers. Below iOS 17.6, or while the phone is offline
  for a method that needs the network, the pill stays visible and the tap explains in one line.
- **The gateway's own pill** keeps today's behaviour: on a native till with a smart reader
  selected on the Card readers page, the leg runs on that reader, named as on that page, under
  the gateway's pill, as it does on web (#523 part two). A Bluetooth reader held by the phone
  shows the same way. `deviceTransport` in `use-tender-flow.ts` reads the selected row, not the
  first transport the descriptor lists.
- **The amount is fixed before the tap** (Apple 5.x, HIG): tips and fee rules are settled in the
  keypad pane before the terminal moment opens; the terminal moment shows the figure and no
  editable field. This is already how the keypad pane hands a leg over; the test pins it.
- **Within one second** (Apple 5.6): the pill's tap opens the terminal moment immediately with
  the "Getting ready" step while the SDK's collect starts; nothing waits on a network round trip
  before the sheet appears. The leg creation that needs the server (the intent) runs behind the
  first step, as the Bluetooth path already does.

Budget: 600.

## Slice 4: the terminal moment's words, the receipt, the missed result

Where: `terminal-leg-view.tsx`, `labels.ts`, the receipt actions in the pay sheet, and a small
local-notification helper under `apps/main/lib/`.

- **Steps for a Tap to Pay leg**: Getting ready → Hold the card to the top of the phone → Reading
  → Approved / Declined / Timed out / PIN needed (the SDK's own screen covers PIN; our step names
  it so the stepper does not go blank). Apple's screens own the tap itself; ours frame it.
- **Receipt after any outcome** (Apple 5.10): the Approved step keeps today's receipt actions. The
  Declined and Timed out steps gain the same **Receipt** action, which builds a client-side
  declined-payment receipt (store, time, last four when the SDK gives it, amount, "Declined",
  no order number) and offers it through the share sheet or email. Nothing is posted to the
  store for a declined tap.
- **Missed result** (Apple 5.12): if the app is backgrounded between Reading and the outcome and
  the outcome is anything but Approved, a local notification says "Your last Tap to Pay payment
  was not approved" and opens the pay sheet on that order. Permission is asked in slice 2's
  pre-alert; without it the notice shows on the next foreground instead.
- **Fallback to another tender** is already the pay sheet's split view: after Declined the
  pane returns to the tile list with the leg unpaid. Apple's regional fallback requirement
  (CA, GL, IE, IM, JE, UK, MX) is met by that path; slice 6 only checks the words.

Budget: 400.

## Slice 5: merchant education (after the first device run)

A native module over `ProximityReaderDiscovery` (iOS 18+), presented right after terms acceptance
and from the Card readers overflow; on iOS 17.6 and 17.x a short in-app sheet with Apple's
copy covering contactless cards, Apple Pay and PIN entry. Expo module under
`apps/main/modules/proximity-reader-discovery/`, config plugin for nothing new (the entitlement
is already set by #2405). Needs a device: the Simulator has no Proximity Reader. Budget: 300.

## Slice 6: regional (after the first device run)

Fallback-method wording for CA, GL, IE, IM, JE, UK and MX; surcharge display for AU and BR through
the fee-rule totals (`surchargeAmount` / `surchargePercent` passed to the SDK and itemised on the
receipt); IFR card-brand choice before tapping in BE, DE, DK, FR and NO is the SDK's screen, ours
only passes the flag. Budget: 300. Each region's words are a docs line too (#548's page).

## Sequencing and proof

1. Slice 1, then slices 2, 3 and 4 in any order on top of it, each its own PR to `main`.
2. **The first device run** on the borrowed iPhone (already carrying the 1.11.x TestFlight build;
   a dev client with the development entitlement is needed, built by the mini's grouped native
   bump #552): set up as admin, set up refused as a cashier, prepare at launch and on foreground,
   approve, decline with a receipt, background during Reading and receive the notice, a simulated
   smart reader allowed on the same store beside Tap to Pay with each selected in turn and the
   leg running on the selected one. Filmed, since Apple wants the three videos later anyway.
3. Slices 5 and 6 after that run.
4. Apple's publishing entitlement is applied for after slices 1 to 5 are on `main` with the
   videos; **no TestFlight build carries Tap to Pay until it is granted.** This gates the GA
   mobile build, not the web and desktop GA.

The logging audit epic for this area is #408; each slice's PR names the log lines it adds there.

## Not in scope

- SumUp Tap to Pay and SumUp Bluetooth (#236): same seams, their own ticket.
- Offline sessions for any reader (#427).
- Apple's marketing requirements (launch email, hero splash, push): after general availability,
  and every piece goes to Apple first (research §4b, Marketing 6.x).
- A per-register reader setting on the server: the till remembers its own choice (#523).
- Any change to the keypad tender pane's layout or the terminal-moment stepper's shape.

## Options board (before slices 2 and 3 are built)

One HTML board, opened locally, four frames per question, one recommended, per the rule that an
unbuilt visual form gets a board, not a question:

1. **The selected-row mark across three sections** on the Card readers page: a check on the
   selected row's action slot; a "Selected" state word; a radio column; the selected row lifted
   into This phone as "Paying with".
2. **The Tap to Pay pill beside the gateway's pill** when the same gateway also has a smart
   reader selected: two pills in the card group; one gateway pill with a reader switch in the
   terminal moment's first step (rejected by decision 3 unless the board shows it never asks); the
   Tap to Pay pill first and the gateway pill carrying the reader's name; the gateway pill hidden
   while Tap to Pay is set up (loses the smart reader; shown only to be ruled out).
3. **Two providers both set up for Tap to Pay** on one phone: one pill owned by the most recently
   set up; one pill per provider with the provider as the sub line; a picker inside the first
   step; disallow the second set-up with a line naming the first.
4. **The awareness sheet and the Android equivalent**: Apple's full-screen copy on iOS; on Android
   the SDK's own terms with a one-line pre-alert; the same sheet on both with platform words.

The board is a separate PR to this repo under `docs/prototypes/2026-11-xx-tap-to-pay-board/`.
