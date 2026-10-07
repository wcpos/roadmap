# Legacy order-pay on Pro's shared base — one adapter serves both payment flows

Date: 2026-10-07, revised the same day after an adversarial Codex review (GPT-6 Astra, read-only,
against the code; verdict `needs-attention`, twelve findings, all twelve confirmed by reading the
cited lines). Lane: `next` (the 2.0 line), rides the `v2.0.0` tag (Paul, 2026-10-07). Owner: Paul.
Issue: wcpos/roadmap#95 (child of the terminals epic #231). Status: **design posted for approval**;
no code before Paul answers. Rulings it rests on (Paul, 2026-10-05): the standard terminal code lives
in the Pro plugin and extensions tap into it; the legacy order-pay flow stays supported beside the
new flow; there may be ~100 terminal extensions; `next` only, no backport to 1.10.x.

Evidence: three read-only investigations of 2026-10-07 over Windcave `main` b56398a, Mercado Pago
`main` 19037fe, Mollie / Stripe / SumUp `next` (1e4dab1 / f1ab735 / 45f5c78), Square `main` 1bffc58,
PayArc `main` 7816f6f, Pro `next` 484549a and Free `next` a8e1ab2d, plus the adversarial review over
the same trees. *Observed* means read in those snapshots; nothing was run. The audit of 2026-09-05
and the addendum on #95 remain the record of what each older plugin learned.

## What the adversarial review changed

The first draft claimed the base could be built in Pro alone over Free's routes as they stand. The
review disproved that at four points, each a money-path hole that the per-extension plumbing being
deleted guards against today and the app-started flow shares:

1. Free's `intent()` calls the provider **before** saving the row, so a create that the provider
   accepts but whose response is lost leaves no row for the sweeper and a fresh UUID can charge
   again (`Ledger.php:397–414`). Windcave and Mercado Pago both persist before dispatch.
2. The balance that `intent()` checks excludes pending legs, so two tabs (or the app and the
   order-pay page) can each dispatch the full balance to a terminal (`Ledger.php:132–158,
   336–372`). Windcave and Mercado Pago reuse the order's live attempt instead.
3. `derive()` calls `payment_complete()` the moment a row is captured, before the page learns of
   it, so submitting WooCommerce's pay form afterwards hits the already-paid guard
   (`Ledger.php:979–986`, `Templates/Payment.php:437–438`). Mercado Pago's controller navigates
   straight to the received URL for exactly this reason.
4. A response-only field on `status()` is dropped by `apply_transition()`'s fixed copy list
   before the controller answers (`Ledger.php:761–775, 869–873`), so a prompt channel needs a
   Free seam, not just a Pro one.

The design therefore has a **slice 0 in Free**: four small, test-covered changes to the ledger that
the app's own flow benefits from as much as the panel does. The rest of the review's findings
(token expiry, prompt identity, historical refunds, the upgrade cutover, the manager path's real
gates, the Pro gate when Pro is absent, certification CI) are folded into the sections below and
named where they land.

## What the problem is, measured

Seven extensions each carry a private copy of the legacy order-pay plumbing. *Observed* in the two
built on 2026-10-05: Windcave 1,883 plumbing lines against 1,750 provider lines; Mercado Pago 1,836
against 1,074; Mollie's legacy half 1,858 against 960. The plumbing is the larger half of every
extension, and the copies are **not** equivalent: Mollie's legacy lock is a non-atomic transient, its
create has no idempotency key and its completion has no claim; Mercado Pago's start does not enforce
the allowlist its lessons file claims and its sweeper misses prepared-only creates; Windcave verifies
the amount before taking the completion claim and never compares the returned TxnRef.

*Observed* on `next`, Free already owns for the new flow: the ledger row (`_wcpos_payments`, one-way
lifecycle, `provider_refs`, `events[]`, `seen_events[]`), the per-order lock (MySQL `GET_LOCK` with an
option-lease fallback), the ten-minute sweeper that calls `status()` on stale live rows, voids past
`expires_at` and captures lapsed authorizations, settlement by `wcpos_settle_payment()` with event
dedupe and parking for unknown ids, and amount/currency verification before a row counts. Pro owns
the `server` and `device` handlers, the adapter interfaces, `Status_Map`, `Event_Log` with redaction,
`Reader_Curation`, the provider registries and the shared webhook route.

And a legacy order-pay payment already ends in a ledger row today, minted **after** the fact by
`Webview_Passthrough` on `woocommerce_payment_complete` (`source: webview`, `capture_mode: webview`,
`status: captured`, amount = order total). Nothing watches that payment while it is live.

## The design in one paragraph

**The legacy order-pay flow becomes the `server` capture mode entered from the order-pay page.**
Pro ships one order-pay panel: a PHP renderer the extension's gateway hands its `payment_fields()` to,
and one JavaScript controller that drives Free's payment route family
(`POST /wcpos/v2/orders/{id}/payments/{uuid}/intent`, `GET …/{uuid}/status`, `POST …/{uuid}/void`)
exactly as the app does. The row is minted at start, not after; the extension's adapter never knows
which surface started it. Lock, idempotency, status vocabulary, verification, sweeper, webhook
settlement, event log and refunds are Free's and Pro's, once. The extension keeps its provider
client, its adapter and its settings page, and deletes everything else.

## Slice 0: the Free changes (money path, small, app-flow wins too)

All in `includes/Payments/Contract/`, each with a PHPUnit case; ~120 non-test lines together.

- **`intent()` persists before dispatch.** The pending row is normalised, saved and indexed (no
  derive) **before** the handler is called; the handler's result is then applied through
  `apply_result()`. A handler `WP_Error` marks the row `failed` with the error code **unless** the
  error carries `indeterminate: true` (transport timeout, 5xx): then the row stays `pending` with no
  action ref. `Server_Handler::intent()` sets that flag from the adapter's error data; the abstract
  adapter classifies `WP_Http` timeouts and 5xx as indeterminate.
- **The sweeper re-dispatches an action-less pending row.** For a `pending` row older than the
  threshold with no `provider_refs.action`, the sweeper calls `handler->intent()` once (idempotent
  by row id, so a provider that did accept returns the same action) and then proceeds as today; a
  second failure fails the row. Covers browser death between create and response.
- **Pending legs reserve the balance.** `intent()` for a **new** UUID refuses when
  `amount > total − counting − pending` and answers 409 `wcpos_payment_in_flight` with the live
  row's id, so a second tab or the app converges on the same leg instead of charging twice. Replay
  of the same UUID is unchanged. A cashier who truly wants a second concurrent leg voids the first.
- **`intent()` accepts `source`.** Only `'webview'` or the default `'app'` (`Ledger::SOURCES`).
- **`status()` carries a response-only `prompt`.** `Ledger::status()` lifts `prompt` off the
  handler's result before `apply_result()` and the controller appends it beside `payment`, the way
  `intent` appends `handoff`. Nothing is persisted.

## The six design questions

### 1. Does the legacy flow get a ledger row? Yes, minted at start

The panel's first request is `POST …/payments/{uuid}/intent` with a client-minted UUID
(`POST …/payments` is `record()`, for manual money, and refuses a `server` method:
`Ledger.php:213–222`). The row is `source: 'webview'`, `capture_mode: 'server'`,
`provider: <family>`, `amount: the order's remaining balance`. From that moment the row is
indistinguishable to Free and Pro from an app-started leg: the route family takes the order lock,
`Server_Handler::intent()` resolves the reader through `Reader_Curation` and calls the adapter's
`create_reader_action()` with the row id as the idempotency key, `status()` goes through
`Status_Map`, the sweeper picks the row up if the browser dies, the webhook settles it by
`metadata.wcpos_payment_id`, and `derive()` calls `payment_complete()` when the counting legs cover
the balance. The panel keeps the UUID in `sessionStorage` keyed by order id, so a reload or a second
tab resumes (or is converged by the 409) rather than minting again.

The order afterwards is **the same in both cases**: `_wcpos_payments` holds the row with the provider
references and the event history; `_wcpos_payment_id` indexes it; `derive()` sets the payment method,
title and transaction id. The post-hoc mint in `Webview_Passthrough` stays for gateways not on the
base; it already returns when a live row exists, so a base provider never gets two rows.

### 2. Cashier prompts: an optional channel with an identity

Windcave's HIT returns two display lines and up to two buttons the cashier must answer. No other
provider in the seven has a prompt protocol.

- `fetch()` may return `prompt: { id, lines: string[], buttons: [{ id, label }] }` with an
  `in_progress` observation. `prompt.id` is the provider's revision of the question (for HIT: a hash
  of `DL1`, `DL2`, the enabled buttons and the status id), so a delayed or replayed answer can be told
  from an answer to the next question.
- `Provider_Adapter_Interface` gains `answer( string $ref, string $prompt_id, string $button_id )`.
  Under the order lock the adapter re-fetches, refuses with `wcpos_prompt_stale` (409, carrying the
  fresh observation) when the live prompt's id differs, validates the button against the enabled set,
  sends the answer and returns the resulting observation. `Abstract_Provider_Adapter` returns
  `wcpos_unsupported`, so Stripe, Mollie and SumUp compile untouched.
- Pro registers `POST /wcpos-pro/v1/orders/{id}/payments/{uuid}/answer` with the same gates and lock
  as Free's family. The response-only `prompt` on `status` is slice 0's seam.
- The panel renders lines and buttons; the app's terminal moment renders them in a later monorepo
  slice, when the first prompting provider can be tested live. The panel's cancel is Windcave's
  `CANCEL` answer, mapped inside the adapter's `cancel()`.

### 3. The Pro dependency: an extension-local gate, header names WooCommerce only

*Observed*: all seven headers say `Requires Plugins: woocommerce` only; Square, PayArc, Windcave and
Mercado Pago have no POS gate at all. Pro deactivates the standalone free slug at `plugins_loaded`,
so a `Requires Plugins: woocommerce-pos` header would block activation on every Pro site — banned.
And `wcpos_pro_requires()` is **Pro's** function: when Pro is absent it does not exist.

On the base an extension requires **Pro ≥ 2.0.0 for both flows**. Its bootstrap, before loading any
Pro-dependent class: `if ( ! function_exists( 'wcpos_pro_requires' ) || ! wcpos_pro_requires(
'2.0.0', __FILE__ ) ) { <own admin notice naming Pro 2.0>; return; }`. The gateway is then never
registered, so nothing renders and nothing is available. The template carries this verbatim. A
merchant on one of the five older extensions without Pro is unaffected until that extension raises
its floor (question 4).

### 4. When an extension may delete its own plumbing: at its 1.0.0, after adopting live attempts

- The version that moves onto the base is a **major bump** (`1.0.0` for every current `0.x`). Its
  header, README and changelog say "requires WooCommerce POS Pro 2.0". No `0.x` release ever
  requires Pro 2.0.
- The last `0.x` release stays published for 1.10 merchants; a `release/0.x` branch receives
  merchant-reported fixes only.
- **Cutover rule.** An upgrade can land while a terminal attempt started by the old plumbing is
  live, and the new sweeper only sees indexed ledger rows. So a migrating extension's `1.0.0` runs
  an **adoption routine** once at upgrade: for every order carrying its old current-attempt meta
  with a non-final status, it calls Pro's `wcpos_pro_adopt_legacy_attempt( $order, $gateway_id,
  $provider_ref, $amount, $currency )`, which mints a `pending` row (`source: 'webview'`) with
  `provider_refs.action = $provider_ref`; Free's sweeper and the webhook then finish it. Old meta is
  left in place, inert. The template includes the hook; Mercado Pago and Windcave, with no merchants,
  ship the routine as a no-op that proves the mechanism in tests.

### 5. Certified providers: certify the transcript, and test it against the Pro that ships

What Windcave QA certifies is the wire exchange — HIT Purchase, Status, UI and Refund messages, their
sequence and their timing — produced by the adapter plus the base's cadence. So:

- The conformance suite records a **golden transcript** per scenario for a certified provider: the
  ordered provider requests the adapter emitted, with the base's timing parameters (poll interval,
  deadline, cancel grace) as fixture inputs. The extension pins the fixtures.
- The extension's CI runs them against its pinned Pro floor; **Pro's own CI** runs every certified
  extension's pinned fixtures against the candidate Pro on each PR to `next` (a "downstream
  conformance" job that checks out the extension at its latest tag). A transcript change fails the
  Pro PR until the certified extension has reviewed it.
- A passing transcript is **not** certification. It is the trigger that says re-certification is or is
  not needed; Windcave's release stays manual until their QA has certified, and their answer on
  per-release re-certification (asked on #400) decides whether this rule is enough.

### 6. Money and status vocabulary: one adapter, flow-blind

Every legacy path charges `$order->get_total()`; none supports a partial amount. The adapter takes
the ledger row and `Server_Handler` forwards `$row['amount']` unchanged; the base never reads
`get_total()`. With the legacy row minted at the balance, the adapter sees a row amount in both flows
and never branches on the flow. Status is Pro's six observations (`pending | in_progress | completed
| cancelled | failed | expired`) mapped by `Status_Map`; the seven legacy vocabularies retire with
their plumbing. Confirmed money is verified by Free before a row counts.

## The order-pay panel, in detail

**Where it renders, and for whom.** The extension's gateway calls `wcpos_pro_order_pay_panel(
$this, $order )` from `payment_fields()`. The panel renders only where every gate it will hit is
satisfied, so a user never sees a panel that answers 403:

- the POS webview (`woocommerce_pos_request()`): the page URL carries the cashier's access token
  (*Observed*: the app appends `token=<jwt>`; the page's own POST already requires it), and the
  controller lifts it into the `Authorization: Bearer` header, which is where Free reads it;
- WooCommerce's own order-pay page for a logged-in **POS user**: `access_woocommerce_pos` (Free's
  baseline REST gate, `API.php:407–446`) **and** `publish_shop_orders` (the route permission), using
  the REST cookie nonce. This is how a merchant takes a phone order at the counter; it is the
  `manage_woocommerce` branch the extensions carry today, narrowed to the gates Free actually has;
- the gateway must be **enabled for the POS** (`descriptor.pos_enabled`, from POS settings); Woo's
  own "enabled" checkbox does not reach the panel;
- anyone else, including a storefront customer: the gateway is not available.

**What the controller does, once.** The state machine of the app's `server` flow (#154): idle →
creating → polling → cancelling → final. Poll at the app's cadence; the deadline is the row's
`expires_at` (five minutes from `Server_Handler`); at the deadline it voids and keeps polling until
the provider confirms, because cancel is a request; on reload it reads the stored UUID and `…/status`
and resumes the live row; a 409 `wcpos_payment_in_flight` makes it adopt that row's id; reader choice
comes from the descriptor's curated list with `lock_to_default` honoured server-side; prompt lines
and buttons render when `status` carries them, and an answer that comes back `wcpos_prompt_stale`
redraws from the fresh observation.

**Completion.** On `captured` the controller **navigates to the received URL** the panel was
rendered with (`wcpos-checkout/order-received/{id}?key=…`), never by submitting the pay form: Free's
`derive()` has already called `payment_complete()`, and a pay POST against a paid order dies.
The received page posts `wcpos-payment-received` as today, so the app's webview contract is
untouched. `wcpos_pro_order_pay_process( $order )` still backs `process_payment()` for the one case
where the form is submitted anyway (a human pressing the host button): paid → success with the
received redirect; otherwise a failure notice. A reload of the order-pay page after payment is Woo's
already-paid page, as for every gateway today; the app's status backstop covers it.

**Access-token expiry.** The token lives thirty minutes from issue, not from page open; a leg can
start at minute 29. The controller treats `woocommerce_pos_auth_token_expired` (401) as **loss of
sight, never as a payment outcome**: it stops polling, keeps the UUID, tells the cashier the payment
continues on the terminal and will be recorded, and posts `wcpos-session-expired` to the host. The
money is closed by the sweeper and the webhook regardless. A monorepo slice has the app answer that
message by reloading the frame with a fresh token, which resumes the same row; until it lands the
cashier reopens the payment from the register. The cookie path has no such cliff.

**Refunds.** `process_refund()` becomes `wcpos_pro_order_pay_refund( $order, $amount, $reason )`.
It binds the WooCommerce refund being created (the newest refund on the order whose amount matches,
captured through `woocommerce_create_refund` as Mollie and Mercado Pago do today) and then:

- for an order with a counting `server`/`device` row for this gateway: allocates through Free's
  `Ledger::refund()` → `Server_Handler::refund()` → the adapter, recording `provider_ref`;
- for a **historical sale** (a `capture_mode: webview` row, or no row at all): calls the adapter's
  `refund()` with a synthesised row whose `provider_refs.transaction_id` is the order's transaction id.
  Adapter contract: `refund()` must work from `provider_refs.action` or, failing that,
  `provider_refs.transaction_id`. The result is written as a refund allocation on the webview row
  when one exists, otherwise as an order note with the provider reference.

Only one path runs per refund: a POS refund goes through Pro's `Refund_Processor` with
`api_refund=false`, so Woo never also calls `process_refund()`; a wp-admin "refund via gateway" calls
`process_refund()` and nothing else.

## The conformance suite

Lives in Pro (`tests/Conformance/`), an abstract PHPUnit case plus a fixture interface. An extension's
CI checks out Pro (private; a read-only fine-grained token stored as an Actions secret in the
extension repo) at its pinned floor and runs the case against its adapter with the provider's HTTP
mocked through `pre_http_request` from the extension's fixture class. Scenarios, each a lesson one
plugin paid for, driven through `Server_Handler` and a real `Ledger`:

1. Create succeeds; row pending with `provider_refs.action` and `expires_at`.
2. Create accepted by the provider, response lost: the row exists `pending` without an action; a
   replayed intent with the same UUID reuses the provider action; the sweeper re-dispatch finds it.
3. A second UUID while a leg is live: 409 `wcpos_payment_in_flight`, no provider call.
4. Cancel returns `requested`; the row stays live until a `cancelled` observation; a later
   `completed` wins.
5. Cancel unsupported by the provider; the panel's copy and the sweeper's expiry path.
6. Webhook replayed; webhook out of order after `completed`; neither changes the row.
7. Browser dies after create; the sweeper settles or voids.
8. Confirmed amount or currency differs from the row: `failed` / `amount_mismatch`.
9. No default reader and no choice: the adapter is never called.
10. Test-mode and live-mode credentials never poll each other's actions.
11. Prompt: a stale `prompt_id` is refused; a delayed answer never reaches the provider.
12. Refund succeeded / pending / failed on a server row, and on a historical webview row.
13. Upgrade adoption: a live legacy attempt becomes a pending row the sweeper finishes.
14. Certified provider: the request transcript of 1–13, with timing parameters, matches the fixture.

The per-plugin `docs/LESSONS.md` files are deleted on migration; their twelve shared themes map onto
the scenarios above, and the provider-specific residue (HIT XML parsing, Mercado Pago's PDV switch)
stays as the extension's own unit tests.

## Logging and the support bundle

Events live on the row and mirror to the WooCommerce log under `woocommerce-pos`; the extensions'
browser-side log panels retire with the plumbing. Missing in Pro: a **support bundle**. One download
on the WCPOS Pro settings page, capability- and nonce-gated, for every registered provider at once:
plugin and Pro versions, each gateway's masked settings and a health line from a new optional adapter
method `diagnostics(): array` (default empty), the last twenty ledger rows with their events
(redacted), and the tail of the WooCommerce log for `woocommerce-pos` and each provider's source.

## The starting template

A repository template, `wcpos/terminal-extension-template`: the plugin file (header, the
extension-local Pro gate from question 3, registration, the adoption hook from question 4),
`Settings`, a thin `Gateway` (form fields, `is_available`, the three helper calls),
`Provider_Adapter extends Abstract_Provider_Adapter` (with `refund()` honouring both reference kinds
and the indeterminate-error classification), a `Conformance_Fixture`, the CI workflow (PHP 7.4–8.4,
the conformance run with the Pro checkout, release by tag) and a README. Nothing else.

## Build slices (one PR each; budgets are non-test lines)

0. **Free: ledger hardening** (~120, `next`): persist-before-dispatch with the indeterminate flag,
   sweeper re-dispatch, pending legs reserve the balance, `source` on intent, response-only `prompt`
   on status. Independent review required (money path).
1. **Pro: order-pay panel + gateway helpers** (~380): renderer and eligibility rule, the JS
   controller (UUID memory, 409 convergence, expiry handling, received-URL navigation), `process`
   and `refund` helpers with the historical path, `wcpos_pro_adopt_legacy_attempt()`. Proven on
   dev-next's simulated terminal from the POS webview and from Woo's order-pay page as a POS user.
2. **Pro: prompt channel** (~140): `answer()` with `prompt_id`, the Pro route, stale refusal, panel
   rendering. Proven with the simulated provider extended to prompt.
3. **Pro: conformance suite** (~450 including the fixture interface): scenarios 1–14, run first
   against the simulated provider in Pro's CI; the downstream-conformance job.
4. **Pro: support bundle + `diagnostics()`** (~250).
5. **Mercado Pago 1.0.0**: adapter over `MercadoPagoClient` / `PointPaymentService`, plumbing and
   `LESSONS.md` deleted, adoption routine, conformance in CI. Proven on the hardware-free sandbox
   once Paul has a seller account (#401).
6. **Windcave 1.0.0**: adapter over `HitClient`, prompt channel's first consumer, golden transcript
   pinned. Mocks only until a UAT account (#400).
7. **Template repository**.
8. **App**: `wcpos-session-expired` frame reload; prompt rendering in the terminal moment (when 6
   can be tested live).

Slices 0–4 are mechanical enough to delegate on this spec; 5 and 6 need the two extensions' READMEs
as well; the panel's copy and the bundle's layout stay with Claude.

## Migration order

Mercado Pago, then Windcave (neither has a merchant). Mollie, Stripe, SumUp, Square and PayArc when
each next needs real work, not before; their legacy paths take real money today.

## Done when

- A new terminal extension contains no AJAX handler, order token, poll loop, lock, reconciler,
  sweeper, logger or support bundle of its own.
- One adapter in it takes a payment from the app's tile, from the POS webview's order-pay page and
  from Woo's order-pay page as a POS user, and refunds a sale made before it migrated.
- The conformance suite runs in every migrated extension's CI, and Pro's CI runs every certified
  extension's transcript.
- Mercado Pago and Windcave are on the base and their `docs/LESSONS.md` files are gone.

## Decisions made here without Paul (say so if wrong)

- The panel is for the POS webview and for a logged-in POS user on Woo's order-pay page; the
  storefront customer never sees a terminal gateway.
- The legacy row is minted at the order's **balance**, not the total.
- A second concurrent leg on one order is refused with the live leg's id (both surfaces); a
  cashier who wants two legs voids the first.
- The prompt channel is a Pro route plus an optional adapter method, with a response-only seam in
  Free's `status()`.
- Re-certification is triggered by a wire-transcript change, tested against the candidate Pro.

## Not in this spec

Bluetooth and Tap to Pay (`device` mode); the proofs owed on #231 and #113; rewriting the five live
extensions on a schedule; Mollie's QR channel (legacy-only, stays in Mollie); any 1.10.x backport.
