# Legacy order-pay on Pro's shared base — one adapter serves both payment flows

Date: 2026-10-07. Lane: `next` (the 2.0 line), rides the `v2.0.0` tag (Paul, 2026-10-07). Owner: Paul.
Issue: wcpos/roadmap#95 (child of the terminals epic #231). Status: **design posted for approval**;
no code before Paul answers. Rulings it rests on (Paul, 2026-10-05): the standard terminal code lives
in the Pro plugin and extensions tap into it; the legacy order-pay flow stays supported beside the
new flow; there may be ~100 terminal extensions; `next` only, no backport to 1.10.x.

Evidence: three read-only investigations of 2026-10-07 over Windcave `main` b56398a, Mercado Pago
`main` 19037fe, Mollie / Stripe / SumUp `next` (1e4dab1 / f1ab735 / 45f5c78), Square `main` 1bffc58,
PayArc `main` 7816f6f, Pro `next` 484549a and Free `next` a8e1ab2d. Everything below marked
*Observed* was read in those snapshots; nothing was run. The audit of 2026-09-05 and the addendum on
#95 remain the record of what each older plugin learned.

## What the problem is, measured

Seven extensions each carry a private copy of the legacy order-pay plumbing. *Observed* in the two
built on 2026-10-05: Windcave 1,883 plumbing lines against 1,750 provider lines; Mercado Pago 1,836
against 1,074; Mollie's legacy half 1,858 against 960. The plumbing is the larger half of every
extension, and the three copies are **not** equivalent: Mollie's legacy lock is a non-atomic
transient, its create has no idempotency key and its completion has no claim; Mercado Pago's start
does not enforce the allowlist its own lessons file says it does, and its sweeper misses
prepared-only creates; Windcave verifies the amount before taking the completion claim and never
compares the returned TxnRef. Each of those is a lesson another plugin had already paid for.

Meanwhile *Observed* on `next`, Free already owns, for the new flow: the ledger row
(`_wcpos_payments`, one-way lifecycle, `provider_refs`, `events[]`, `seen_events[]`), the per-order
lock (MySQL `GET_LOCK` with an option-lease fallback), the ten-minute sweeper that calls `status()`
on stale live rows, voids past `expires_at` and captures lapsed authorizations, settlement by
`wcpos_settle_payment()` with event dedupe and parking for unknown ids, and amount/currency
verification before a row counts. Pro owns the `server` and `device` handlers, the adapter
interfaces, `Status_Map`, `Event_Log` with redaction, `Reader_Curation`, the provider registries and
the shared webhook route. Every extension on the base is one adapter plus its settings.

And *Observed*: a legacy order-pay payment already ends in a ledger row today, minted **after** the
fact by `Webview_Passthrough` on `woocommerce_payment_complete` (`source: webview`,
`capture_mode: webview`, `status: captured`, amount = order total). Nothing watches that payment
while it is live.

## The design in one paragraph

**The legacy order-pay flow becomes the `server` capture mode entered from the order-pay page.**
Pro ships one order-pay panel: a PHP renderer the extension's gateway hands its `payment_fields()` to,
and one JavaScript controller that drives Free's existing payment route family
(`POST /wcpos/v2/orders/{id}/payments`, `/{uuid}/intent`, `/{uuid}/status`, `/{uuid}/void`) exactly
as the app does. The row is minted at start, not after; the extension's adapter never knows which
surface started it. Lock, idempotency, status vocabulary, verification, sweeper, webhook settlement,
event log and refunds are Free's and Pro's, once. The extension keeps its provider client, its
adapter and its settings page, and deletes everything else.

## The six design questions

### 1. Does the legacy flow get a ledger row? Yes, minted at start

The panel calls `POST …/payments` then `…/intent` with a client-minted UUID, like the app. The row is
`source: 'webview'` (already in `Ledger::SOURCES`), `capture_mode: 'server'`, `provider: <family>`,
`amount: the order's remaining balance` (Free's `balance()`, equal to the total on an unpaid order).
From that moment the row is indistinguishable to Free and Pro from an app-started leg: the route
family takes the order lock, `Server_Handler::intent()` resolves the reader through `Reader_Curation`
and calls the adapter's `create_reader_action()` with the row id as the idempotency key, `status()`
goes through `Status_Map`, the sweeper picks the row up if the browser dies, the webhook settles it by
`metadata.wcpos_payment_id`, and `Ledger::derive()` calls `payment_complete()` when the counting legs
cover the balance.

The order afterwards is **the same in both cases**: `_wcpos_payments` holds the row with the provider
references and the event history; `_wcpos_payment_id` indexes it; `derive()` sets the payment method,
title and transaction id. The post-hoc mint in `Webview_Passthrough` stays for gateways that are not
on the base (it already returns when a live row exists, so a base provider never gets two rows).

Why not a separate legacy attempt record adapted to the interface: it would be the eighth copy of
exactly the machinery Free already runs, with its own lock and sweeper, and a row minted after the
fact is the thing that leaves a dead browser's payment unwatched today.

### 2. Cashier prompts: an optional channel on the adapter, carried response-only

Windcave's HIT returns two display lines and up to two buttons that the cashier must answer
(`DL1/DL2`, `B1/B2`, answers `YES/NO/CANCEL`). *Observed*: no other provider in the seven has a
prompt protocol; Mercado Pago's `action_required` and Mollie's QR are display states, not questions.

- `fetch()` may return `prompt: { lines: string[], buttons: [{ id, label }] }` with an `in_progress`
  observation. `Server_Handler::status()` passes it through **response-only** (the way
  `Device_Handler` passes a resume handoff); it is not persisted on the row.
- `Provider_Adapter_Interface` gains `answer( string $ref, string $button_id )`, returning a fresh
  observation. `Abstract_Provider_Adapter` returns `WP_Error` `wcpos_unsupported` so the existing
  adapters (Stripe, Mollie, SumUp) compile untouched.
- Pro registers `POST /wcpos-pro/v1/payments/{uuid}/answer` (same `publish_shop_orders` permission,
  same order lock) rather than widening Free's `Capture_Mode_Handler_Interface`.
- The order-pay panel renders lines and buttons when present. The app's terminal moment renders
  them in a later monorepo slice, scheduled when the first prompting provider can be tested live
  (Windcave has neither an account nor a terminal today).

The panel's cancel is Windcave's `CANCEL` answer; the adapter maps it inside `cancel()`.

### 3. The Pro dependency: gate on `wcpos_pro_requires()`, header names WooCommerce only

*Observed* today: all seven headers say `Requires Plugins: woocommerce` only; Stripe, SumUp and Mollie
register their adapters behind `wcpos_pro_requires('1.11.0')` and keep the legacy gateway when Pro is
absent; Square, PayArc, Windcave and Mercado Pago have no POS dependency gate at all and run on Free or
on nothing. Pro deactivates the standalone free slug at `plugins_loaded`, so a
`Requires Plugins: woocommerce-pos` header would block activation on every Pro site — it is banned.

On the base an extension requires **Pro ≥ 2.0.0 for both flows**: `wcpos_pro_requires( '2.0.0',
__FILE__ )` at registration. Without it the gateway's `is_available()` is false, the adapter is not
registered and Pro's helper persists one admin notice naming the Pro version needed. A merchant who
runs one of the five older extensions without Pro is unaffected until that extension raises its
floor (question 4); the 0.x line they have keeps its own plumbing.

### 4. When an extension may delete its own plumbing: at its 1.0.0

- The version that moves onto the base is a **major bump** (`1.0.0` for every current `0.x`
  extension). Its header, README and changelog say "requires WooCommerce POS Pro 2.0". No `0.x`
  release ever requires Pro 2.0.
- The last `0.x` release stays published as the artefact for 1.10 merchants. A `release/0.x` branch
  is cut at that tag; it receives a fix only when a merchant on 1.10 reports a defect, never
  features. The release workflow publishes from either branch by tag.
- Mercado Pago and Windcave have no merchants, so their `0.1.0` is the 1.10 artefact as it stands and
  their `1.0.0` deletes the plumbing outright. Mollie, Stripe, SumUp, Square and PayArc move when each
  next needs real work; until then they keep both paths exactly as today.

### 5. Certified providers: certify the transcript, not the plumbing

*Observed*: only Windcave states a certification requirement (Windcave QA certifies every POS
integration before production; per-release re-certification asked on #400, unanswered). What
Windcave certifies is the wire exchange — the HIT Purchase, Status, UI and Refund messages and their
sequence — and that is produced by the adapter plus the base's timing (poll cadence, deadline, cancel
order). So:

- The conformance suite records a **golden transcript** per scenario for a certified provider: the
  ordered list of provider requests the adapter emitted under the base. The Windcave extension pins
  those fixtures. A Pro change that alters the sequence fails Windcave's CI; one that does not (logging,
  panel copy, redaction) is not a certification event.
- A transcript change is a re-certification review, raised on the extension before the Pro version is
  allowed as its floor. Until Windcave answers on per-release re-certification, that is the rule.

### 6. Money and status vocabulary: one adapter, flow-blind

*Observed*: every legacy path charges `$order->get_total()`; none supports a partial amount. The
adapter interface takes the ledger row and `Server_Handler` forwards `$row['amount']` unchanged; the
base never reads `get_total()`. With the legacy row minted at the order's balance, the adapter sees a
row amount in both flows and never branches on the flow. Status is Pro's six observations
(`pending | in_progress | completed | cancelled | failed | expired`) mapped by `Status_Map`; the seven
legacy vocabularies (uppercase SumUp and Square, `paid`/`declined`/`verification_failed` elsewhere)
retire with their plumbing. Confirmed money is verified by Free before a row counts; a mismatch is
`failed` / `amount_mismatch` with an order note, as it is for the app today.

## The order-pay panel, in detail

**Where it renders.** The extension's gateway calls `wcpos_pro_order_pay_panel( $this, $order )`
from `payment_fields()` and returns `wcpos_pro_order_pay_process( $order )` from `process_payment()`.
The panel renders only where the base can act:

- the POS webview (`woocommerce_pos_request()`): the page URL carries the cashier's access token
  (*Observed*: the app appends `token=<jwt>`; the page's own POST already requires it), and the
  controller sends it as the `Authorization: Bearer` header to the route family;
- the standard WooCommerce order-pay page for a logged-in user with `publish_shop_orders` (the
  "Customer payment page" link in wp-admin, how a merchant takes a phone order at the counter): the
  controller uses the REST cookie nonce. This is what the extensions' `manage_woocommerce` branch
  served;
- anyone else (a customer on the storefront): the gateway is not available. A card terminal cannot be
  driven by the customer.

**What the controller does, once.** The state machine of the app's `server` flow (#154): idle →
creating → polling → cancelling → final. Poll at the app's cadence; the deadline is the row's
`expires_at` (five minutes from `Server_Handler`); at the deadline it voids and keeps polling until
the provider confirms, because cancel is a request; on reload it reads `…/status` and resumes the
live row; reader choice comes from the descriptor's curated list with `lock_to_default` honoured
server-side; prompt lines and buttons render when the status response carries them. On `captured`
it submits WooCommerce's pay form; `wcpos_pro_order_pay_process()` reads the ledger, returns success
with the received-page redirect when a counting row covers the balance, and a failure notice
otherwise. The received page posts `wcpos-payment-received` as today, so the app's webview contract
(the message bridge, the frame gate, the status backstop) is untouched.

**Refunds.** `process_refund()` becomes `wcpos_pro_order_pay_refund( $order, $amount, $reason )`:
it resolves the WooCommerce refund being created, allocates against the order's counting rows
through Free's `Ledger::refund()` and `Server_Handler::refund()`, and records `provider_ref` on the
allocation. A wp-admin refund and a POS refund take the same path.

**Access token lifetime.** The POS access token lives thirty minutes (*Observed*); the page's POST
already depends on it, and a terminal leg ends in five. No new token scheme.

## The conformance suite

Lives in Pro (`tests/Conformance/`), shipped as an abstract PHPUnit case plus a fixture interface. An
extension's CI checks out Pro at its pinned floor and runs the case against its adapter with the
provider's HTTP mocked through `pre_http_request` from the extension's fixture class. Scenarios, each
a lesson one plugin paid for, driven through `Server_Handler` and a real `Ledger`:

1. Create succeeds; row pending with `provider_refs.action` and `expires_at`.
2. Create is indeterminate (timeout, 5xx); a replayed intent reuses the row id and does not create a
   second provider action.
3. Cancel returns `requested`; the row stays live until a `cancelled` observation; a later `completed`
   wins (cancel is a request, not a result).
4. Cancel unsupported by the provider; the panel's copy and the sweeper's expiry path.
5. Webhook replayed; webhook out of order after `completed`; neither changes the row.
6. Browser dies after create; the sweeper settles or voids the row.
7. Confirmed amount or currency differs from the row; `failed` / `amount_mismatch`.
8. No default reader and no choice; the adapter is never called (the cashier must pick).
9. Test-mode and live-mode credentials never poll each other's actions.
10. Refund succeeded / pending / failed, and the allocation recorded.
11. For a certified provider: the request transcript of 1–10 matches the pinned fixture.

The per-plugin `docs/LESSONS.md` files (87 and 66 items) are deleted on migration; the twelve themes
they share map onto the scenarios above, and the provider-specific residue (HIT XML parsing, Mercado
Pago's PDV switch) stays as the extension's own unit tests.

## Logging and the support bundle

Events already live on the row and mirror to the WooCommerce log under `woocommerce-pos` (*Observed*);
the extensions' browser-side log panels retire with the plumbing. Missing in Pro: a **support bundle**.
One download on the WCPOS Pro settings page, capability- and nonce-gated, for every registered
provider at once: plugin and Pro versions, each gateway's masked settings and a health line from a new
optional adapter method `diagnostics(): array` (default: empty), the last twenty ledger rows with
their events (redacted), and the tail of the WooCommerce log for `woocommerce-pos` and each
provider's source. Most of the hundred terminals will never be on our desk; this is the test run we
get.

## The starting template

A repository template, `wcpos/terminal-extension-template`, containing nothing but: the plugin file
(header, `wcpos_pro_requires( '2.0.0', __FILE__ )`, registration), `Settings`, a thin `Gateway`
(form fields, `is_available`, the three helper calls), `Provider_Adapter extends
Abstract_Provider_Adapter`, a `Conformance_Fixture`, the CI workflow (PHP 7.4–8.4, the conformance
run, release by tag) and a README. Every terminal extension begun after it ships starts from it.

## Build slices (one PR each, `next`; budgets are non-test lines)

1. **Pro: order-pay panel + gateway helpers** (~350): renderer, availability rule, `process` and
   `refund` helpers, the JS controller. Proven on dev-next's simulated terminal (the `wcpos-wordpress`
   mu-plugin), from the POS webview and from the wp-admin payment page.
2. **Pro: prompt channel** (~120): `answer()` on the interface and abstract, response-only `prompt`,
   the Pro route, panel rendering. Proven with the simulated provider extended to prompt.
3. **Pro: conformance suite** (~400 including fixtures interface): the abstract case and scenarios
   1–11, run first against the simulated provider in Pro's own CI.
4. **Pro: support bundle + `diagnostics()`** (~250).
5. **Mercado Pago 1.0.0** on the base: adapter over the existing `MercadoPagoClient` and
   `PointPaymentService`, plumbing and `LESSONS.md` deleted, conformance in CI. Proven on the
   hardware-free sandbox (`SBX0000001` + `/events`) once Paul has a seller account (#401).
6. **Windcave 1.0.0**: adapter over `HitClient`, prompt channel's first consumer, golden transcript
   pinned. Untestable beyond mocks until a UAT account (#400).
7. **Template repository**.
8. **App: prompt rendering** in the terminal moment (monorepo), when 6 can be tested live.

Slices 1–4 are mechanical enough to delegate on this spec; 5 and 6 need the spec plus the two
extensions' READMEs; the panel's copy and the bundle's layout stay with Claude.

## Migration order

Mercado Pago, then Windcave (neither has a merchant). Mollie, Stripe, SumUp, Square and PayArc when
each next needs real work, not before; their legacy paths take real money today.

## Done when

- A new terminal extension contains no AJAX handler, order token, poll loop, lock, reconciler,
  sweeper, logger or support bundle of its own.
- One adapter in it takes a payment from the app's tile, from the POS webview's order-pay page and
  from the wp-admin payment page.
- The conformance suite runs in every migrated extension's CI and fails the build when an adapter
  breaks a lesson.
- Mercado Pago and Windcave are on the base and their `docs/LESSONS.md` files are gone.

## Decisions made here without Paul (say so if wrong)

- The panel is for the POS webview and for a logged-in manager's payment page; the storefront customer
  never sees a terminal gateway.
- The legacy row is minted at the order's **balance**, not the total (identical on an unpaid order;
  correct on a partially paid one).
- The prompt channel is a Pro route and an optional adapter method, not a change to Free's handler
  interface.
- Re-certification is triggered by a wire-transcript change only.

## Not in this spec

Bluetooth and Tap to Pay (`device` mode); the proofs owed on #231 and #113; rewriting the five live
extensions on a schedule; Mollie's QR channel (legacy-only, stays in Mollie); any 1.10.x backport.
