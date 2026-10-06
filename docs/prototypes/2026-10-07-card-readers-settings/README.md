# Card readers settings page: options board

Board: `index.html` (open it from disk; deep links `?state=updating&w=phone&theme=dark`).
Ticket: wcpos/roadmap#407 (child of #231, release #195). Ruled by Paul on 2026-10-06 during the
first WisePad 3 run (#235): *"we should have a page in the settings for terminals, like we do for
printers"* and *"there has to be a way to disconnect from the POS"*.

Every frame rehosts the real Settings chrome on monorepo `next` (`SettingsPage`, `SettingsSection`,
the Printers row in `settings/printing/printer-row.tsx`, the Printers empty state) and the states
the harness drivers report (`DriverStatus.connection`: disconnected · discovering · connecting ·
updating · connected, plus `progress`, `message`, `reader.battery`), with the three failures seen
on 2026-10-06: the US-location refusal, the stale SDK session, Bluetooth off.

## Directions

| | Shape | Precedent | Where it is weak |
|---|---|---|---|
| A | One row per card **provider**; scan, progress and the found list unfold under the row | Amazon Alexa Bluetooth settings | A provider with no reader is a permanent row; the row grows |
| B | A **card per provider** with the state as the headline and a key–value block | Fitbit, Oura | Tall on a phone for a row's worth of facts |
| C | A plain **list + detail** panel (side panel on tablet, a page on phone) | Apple Watch, Roku | Disconnect is one tap further away; a new primitive on phone |
| D | **Readers, like printers**: rows are readers, the provider is a chip, "Connect a reader" picks the provider and scans in place; nothing connected is the Printers empty state | the app's own Printers page; Fitbit row anatomy | A provider with no reader is only reachable through "Connect a reader" |

**Recommended: D.** It is the page the cashier already knows, one row for the common one-gateway
one-reader store, and Tap to Pay fits as a "This iPhone" row without a special case. The draft PR
in wcpos/monorepo is built from D and re-skins to the chosen direction.

## Also on the board

- **Tap to Pay on iPhone** row states (Apple checklist 3.1–3.9, 4.3): admin sees *Set up*; a cashier
  without `manage_woocommerce` sees why and no button; the awareness moment (Apple's copy, Apple's
  Terms sheet via the SDK); *Preparing · 60%* from `updateProgress`; *Ready* with *How it works*.
- **Checkout keeps one line**: tonight's six-part strip beside the two lines that remain (connected →
  reader and battery; not connected → a link to this page; the commit button disabled until then).
- **Copy table**: one line per driver state, verbs with their object, no ids in a message.

## Waiting on Paul

1. Pick a direction.
2. Disconnect and Forget as two actions (drawn) or one.
3. SumUp's row: one button that opens SumUp's own reader UI (drawn), or made to look like Stripe's.
4. Ship the Tap to Pay row behind the entitlement before Apple's publishing grant?

## Mobbin coverage check (2026-10-07)

Queries ran in deep mode on both platforms. Square POS (register app), SumUp, Zettle, Lightspeed,
Toast, Loyverse remain unindexed, as recorded on 2026-09-12. Found and used: Amazon Alexa (paired
device → Disconnect / Forget), Fitbit and Google Health (device row with battery pill), Oura (ring
details with destructive last action), Apple Watch (unpair confirmation), Roku (found device with
serial), IKEA Home smart and Eight Sleep (update progress with percentage and duration), Shopify
admin Devices (empty state tone). Links are in the board's Precedents section.
