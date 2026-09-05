# Terminal core feasibility audit

Audit of the five card-terminal gateway plugins (square, stripe, sumup, mollie, payarc), what they actually share, and a judgement on whether one core library can carry the settings, polling, authorisation, reconciliation and logging they each reinvent. Design ticket: wcpos/roadmap#95.

Audited 2026-09-05 at these revisions (every file:line citation refers to them): square 0.8.1 `8e9d4f8`, stripe 0.0.30 `d5691b9`, sumup 0.0.12 `2b53c72`, mollie 0.5.3 `fa89ef7`, payarc 0.1.15 `104fab8`; host woocommerce-pos 1.10.7 `b0eaf82f` (main), app monorepo-v2 1.10.6 `4ba128d335` (main). Per-plugin reports are in this folder.

## Verdict

**Feasible, but not as an extraction.** There is no common code to extract. Same-named files across the five plugins differ by roughly their combined length; only the WooCommerce gateway methods every plugin must implement share a name. A shared layer is a new design that four plugins migrate onto, with Square and Mollie as the reference implementations.

**It should live in WooCommerce POS itself, not in a vendored library.** The host plugin already ships a POS gateway contract since April 2026 (bootstrap, idempotent checkout actions, per-order checkout state, a gateway base class, a POS-enabled check) that none of the five terminal plugins use. Putting the terminal kit there dissolves the version-collision constraint in #95: one copy, one version, gateway plugins declare a minimum POS version. It also deletes the hardest shared concern outright: when the POS app drives checkout over authenticated REST, the order-authorisation gate that all five plugins solved five different ways is no longer needed.

**The gating decision is product, not code:** terminal plugins would require WooCommerce POS, and terminal checkout would move from the order-pay iframe into the POS app. If that is unacceptable, a prefixed Composer package is the fallback. It solves PHP duplication but leaves the JavaScript loop per plugin and fixes travel only by re-releasing all five.

## What was measured

Five independent static audits, one per plugin, produced by GPT-6 Astra in read-only mode against a fixed thirteen-section template so the reports can be compared line for line. Every claim in them cites a file and line. On top of that, two mechanical measurements across all five repositories:

- **Copy-with-drift.** For each file name present in two or more plugins, the pairwise count of changed lines from a unified diff with zero context. If the plugins were copies, this number would be small relative to file length.
- **Function-name census.** Function names shared by three or more plugins under `includes/`.

| File | Lines per plugin (square · stripe · sumup · mollie · payarc) | Changed lines, closest pair | Reading |
|---|---|---|---|
| Logger.php | 148 · 67 · 48 · 103 · 215 | stripe/sumup 27 | Stripe and SumUp share a lineage; the other three are unrelated rewrites |
| Settings.php | 172 · 45 · 43 · 110 · 391 | stripe/sumup 8 | Same lineage again, including accessors for fields that no longer exist |
| AjaxHandler.php | 578 · 1090 · 714 · 176 · 756 | square/mollie 621 | Every pair differs by more than the shorter file's length |
| Gateway.php | 1209 · 1245 · 816 · 435 · 1171 | sumup/mollie 986 | As above |
| PaymentAttempt.php | mollie 163 · payarc 322 | 424 | Same concept, same name, no shared code |
| PaymentReconciler.php | mollie 90 · payarc 557 | 539 | As above |
| WebhookHandler.php | square 235 · mollie 44 · payarc 337 | square/mollie 231 | As above |
| assets/js/payment.js | 1430 · 0 (built) · 602 · 981 · 331 | stripe/payarc 270 | Five poll loops, five state models |

Function names shared by all five: `process_payment`, `payment_fields`, `init_form_fields`. By four: `register_gateway`, `process_admin_options`. By three: `with_lock`, `reconcile`, `handle`, `can_access_order`, `set_log_level`, `enqueue_payment_scripts`, `disconnect`, `create`, `get_gateway_settings`, `admin_options`. Nothing else.

The Stripe and SumUp header files both declare a text domain with a trailing period. The typo travelled; the fixes did not.

## The five plugins

| Concern | Square | Stripe | SumUp | Mollie | PayArc |
|---|---|---|---|---|---|
| Order gate (POS) | order key or HMAC token (no fixed TTL) or capability | HMAC token, 1 h, plus order key, plus needs_payment | order key only, nonce skipped | salted hash token, no expiry, or capability | HMAC of id + key, no expiry, or nonce + capability |
| POS request detection | none | `woocommerce_pos_request()` | none | `woocommerce_pos_request()` + `X-WCPOS` header | none |
| Transport | admin-ajax, bare JSON, HTTP codes | admin-ajax envelope, always 200; REST with `permission_callback => '__return_true'` | admin-ajax envelope, always 200 | admin-ajax envelope, HTTP codes | admin-ajax bare JSON, HTTP codes |
| Attempt persistence | current + history + abandoned ids | intent id only | status meta only | current + history + abandoned ids | current + history + in-flight index |
| Lock | **MySQL GET_LOCK** + option fallback | none | none | transient, non-atomic | add_option, advisory |
| Reconciler | yes: amount + currency + tip, undercollect → on-hold | partial, split across two webhook implementations | none | yes: amount + currency + mode + attempt | yes: exact minor units + identity |
| Webhook dedupe | last 50 event ids | none | none | attempt ownership | trace + status pairs |
| Stale-payment sweep | cron 10 min | none | none | cron 10 min + status-change cleanup | none; lazy index prune |
| Resume after reload | yes | manual check only | manual check only | yes | press Start again |
| Poll loop | 2 s, backoff 2/4/8/15, 330 s, forced read then cancel | 2 s, 300 s, timeout does not cancel | 2 s, ~302 s, forced check then cancel | 2 s, 300 s, cancel on timeout | 1.5 s, 300 s, timeout does not cancel |
| Cancel semantics | request, not result; keeps polling | local reset on any 200 | request, not result; keeps polling | local abandon releases UI | request, not result; keeps polling |
| Terminal curation | paired list, cache + last-known-good; no default/allowlist | no cache, no default, browser remembers | no cache, no default | default + allowlist + lock + inactive filter | manual serial; default = first enabled |
| Money | zero-decimal list | zero-decimal list + account country | always ×100 | EUR only, cents | 5 currencies, exact |
| Cashier log panel | browser-local, gated by setting | browser-local, always on | browser-local, gated | browser-local, gated | browser-local, always on |
| Refunds | none | yes | none | yes | none |
| Tests | PHPUnit ~230 + 45 JS | PHPUnit 211, 0 JS | 10 scripts + 6 JS | 18 scripts + 1 JS suite | 14 scripts, 0 JS |
| SDK packaging | php-scoper prefixed | unprefixed stripe-php | php-scoper prefixed | no SDK | no SDK |

Two plugins carry most of the merchant-hardened behaviour. **Square** has the only atomic lock, the only tip and undercollection handling, webhook dedupe, a sweeper, and the only tested JavaScript state machine. **Mollie** has the full terminal-curation settings set, a sweeper, status-change cleanup, resume, and a reconciler with attempt ownership. **SumUp** is the thinnest: no lock, no reconciler, no sweeper, no resume, no curation. A shared layer adds capability to SumUp, Stripe and PayArc rather than deduplicating them.

## Lessons that did not travel

Each row is a fix one plugin paid for, with a code comment explaining why the naive approach fails, that at least one sibling still lacks.

| Lesson | Learned in | Still missing in |
|---|---|---|
| POS renders order-pay as the customer, the cashier submits, so a plain nonce fails | all five, five different ways | none, but no two agree |
| Cancel is a request, not a result; keep polling until the provider confirms | Square, SumUp, PayArc | Stripe, Mollie |
| An indeterminate create may have succeeded; keep the attempt and reuse the idempotency key | Square | Mollie, SumUp, Stripe (no idempotency key at all); PayArc (sends a key but never stores it, and a thrown sale clears the in-flight index, so a retry mints a new key and can collect twice) |
| Deduplicate webhook deliveries by event id | Square (last 50 event ids) | Stripe, SumUp, Mollie; PayArc dedupes by trace+status pair, not event id, so a repeated delivery with a different status is not caught |
| A stale failed event can arrive after success; order by timestamp or attempt | Stripe, Square, SumUp, Mollie | PayArc (partial, via status pairs) |
| Browsers die; a cron sweeper must reconcile lingering payments | Square, Mollie | Stripe, SumUp, PayArc |
| Re-submitting order-pay after payment hits the "already paid" guard; navigate to the receipt directly | Stripe, Mollie | SumUp, PayArc (Square handles via redirect_url) |
| Never silently pick the first terminal; it may be the wrong physical device | Mollie | PayArc picks the first enabled registry entry |
| Currency exponent is not always 2 | Stripe, Square | SumUp always multiplies by 100; Mollie is EUR-only by design |
| The WooCommerce enable checkbox is web-only; POS enables from its own settings | Square, Stripe, SumUp, Mollie (after 0.5.3) | PayArc labels it "online checkout" but gates settings validation on it |
| Register AJAX actions only when doing AJAX | Mollie, SumUp | Square, Stripe, PayArc |
| Redact secrets before logging | Square, Mollie, PayArc | Stripe, SumUp |
| The cashier log should read server events, not only browser messages | nobody | all five keep the panel browser-local |

## The host already started

WooCommerce POS 1.10.x ships a POS payment-gateway contract, added 2026-04-23 under woocommerce-pos #828 and #830.

- **Routes:** `GET /wcpos/v1/payment-gateways`, `POST …/payment-gateways/{id}/bootstrap`, `POST` and `GET /wcpos/v1/orders/{id}/checkout`.
- **Server:** `Abstract_POS_Gateway` base class, `Gateway_Adapter_Interface`, `Gateway_Contract`, `Checkout_State_Repository`, `Idempotency_Repository` keyed by `X-WCPOS-Idempotency-Key`, stock validation on every action.
- **Semantics:** checkout state `{checkout_id, status, provider_data, terminal}`; terminal statuses `completed`, `failed`, `cancelled`, `awaiting_customer`; capabilities `supports_checkout`, `requires_hardware`, refund flags.
- **POS enabled:** `Gateway_Contract::is_pos_enabled()` reads POS settings first, WooCommerce `enabled` only as fallback. This is the check Mollie 0.5.3 reimplemented.
- **App:** `useCheckoutSession` bootstraps, posts `start`, then polls `GET …/checkout`; legacy gateways fall back to the order-pay webview, chosen per gateway by `shouldUseContractCheckout`.
- **Adopters:** `pos_cash` and `pos_card` only. None of the five terminal plugins.

**It is not terminal-grade yet.** The app loop polls every 750 ms and gives up after 40 attempts, a 30-second cap that a card terminal routinely exceeds. There is no cancel action, `requires_hardware` is declared but unused in the UI, and `awaiting_customer` is surfaced as an error. Server-side there is no attempt persistence, locking, reconciliation or sweeping; the adapter is one method that receives an action string. Everything the terminal plugins learned still has to be built here. The point is that the foundation, the routing, and the collision-free home already exist.

## What the shared layer is

```text
POS app (monorepo)          woocommerce-pos: terminal kit         Provider plugin (×5)
─────────────────────       ─────────────────────────────         ────────────────────
Terminal checkout screen    Terminal_Gateway base class           Adapter interface:
start · poll · cancel       Attempt store (current, history,        create(order, terminal)
resume, terminal picker,      abandoned) in order meta              fetch(ref) → status
hardware states             Order lock: GET_LOCK + fallback         cancel(ref) → requested|final
Cashier event log           Reconciler: identity, amount,           list_terminals()
  read from server            currency, tip, idempotent paid        verify_webhook(req) → ref
                            Webhook frame: dedupe, lock, refetch    refund(ref, amount)
Auth: cashier REST session  Sweeper cron + status-change cleanup
(no order token, no nonce   Terminal registry + settings fields   Stays local: SDK, auth,
hack, no iframe, no         Money, Logger with redaction            OAuth, status mapping,
postMessage)                Per-order event log                     MOTO, QR, app handoff
        ──REST──▶                        ──PHP calls──▶
Legacy webview stays for un-migrated gateways and web checkout
```

What each piece is built from:

- **Attempt store** from Square's `OrderMeta` and Mollie's `PaymentAttempt`: current pointer, history, abandoned ids kept separately so the sweeper can still see them.
- **Lock** from Square's `OrderLock`. Its MySQL `GET_LOCK` driver is the only atomic lock in the family; its option-driver fallback is best-effort, as Square's own comment says. The shared layer must not carry that fallback as if it were atomic: where `GET_LOCK` is unavailable the fallback has to be a real mutual exclusion (an `INSERT … ON DUPLICATE KEY` claim row or `add_option` with a unique key, released in `finally`), not a read-then-write on an option.
- **Reconciler** from Square (tip, undercollection to on-hold, duplicate capture) and Mollie (attempt ownership, mode check, idempotent paid, conflict). The provider maps its statuses to the kit's enum: pending, in progress, completed, cancelled, failed, expired.
- **Webhook frame** from Square and PayArc: dedupe, lock, refetch from the provider, then reconcile. Signature verification is provider-specific and stays local.
- **Sweeper** from Square and Mollie, plus Mollie's cancel-on-status-change hook.
- **Terminal registry** from Mollie's settings set (default, allowlist, lock) and Square's cache with last-known-good fallback.
- **Money** from Square's zero-decimal table with PayArc's exact-match and overflow checks. Not Stripe's converter as-is: it maps HUF and TWD to zero decimals, which is Stripe's manual-payout rule, while charges in both are two-decimal; importing it would undercharge those currencies 100×. Charge exponents must be defined independently of payout rules.
- **Checkout loop in the app** from Square's tested state machine: idle, creating, polling, cancelling, final; deadline around 300 s; backoff on transport errors; forced read then cancel at deadline; cancel is a request; resume on reopen. Ships once, in the app, instead of five times.
- **Cashier log** becomes a per-order event log the kit writes and the app reads. Today every plugin's panel shows only what the browser saw, which is why support asks for screenshots.

What stays in each plugin: the provider SDK, credentials and OAuth, provider-specific settings, and the flows only that provider has (Stripe MOTO and keep-warm, Mollie QR, Square's mobile app handoff, PayArc's Login and registry model).

## Where it lives

The constraint #95 set: a merchant may install two terminal plugins side by side, and shared PHP loaded twice at different versions is a real class of bug.

**A · Inside woocommerce-pos (recommended).** The kit ships in the host plugin under its existing namespace. Terminal plugins extend the host's base class and declare `Requires Plugins: woocommerce-pos` plus a minimum version.
- No collision: one copy, versioned with the host.
- Every plugin already soft-depends on the host; the contract, routes, idempotency and POS-enabled check exist.
- Fixes travel with one host release; plugins re-release only for provider changes.
- Cost: hard dependency on the host; web checkout for terminals needs the host installed (it is free on wp.org).

**B · Prefixed Composer package (fallback).** A `wcpos/terminal-core` package vendored into each plugin and namespace-prefixed at build time with php-scoper, which Square and SumUp already run.
- No collision: each plugin carries its own prefixed copy. No dependency change for merchants.
- Cost: a fix travels only by re-releasing all five; the JS loop stays per plugin (an npm package built into each); the iframe, nonce hack and order token all remain.

**C · Separate core plugin (rejected).** A sixth plugin required by the five. Solves collision by arbitration, like Action Scheduler, but is a new artifact to install, version and support, duplicating what the host already is, and buys nothing over A.

A is recommended because the collision problem is not solved by cleverness but by there being one copy, and the host is that copy. It also converts concern one of #95 from "share it" to "delete it": under the contract, the POS app calls the host over the cashier's authenticated REST session, so the order-pay page is never rendered as the customer for a POS sale and no plugin needs an order token. B remains a valid answer if the hard dependency is refused; it is the same kit, distributed differently.

## Migration and coexistence

Un-migrated plugins keep working throughout. The app already decides per gateway: a gateway that does not advertise `supports_checkout` gets the legacy order-pay webview, exactly as today. A merchant with two terminal plugins can run one on each path.

1. **Host kit and app terminal screen.** Extend the contract with cancel, a hardware-grade deadline, terminal selection, the state enum and the per-order event log; build the kit in the host from Square and Mollie; build the app screen from Square's state machine and tests. Nothing ships to merchants yet except inert code in the host.
2. **Mollie first.** Smallest codebase (1.9K lines PHP), newest, already has attempt, lock, reconciler, sweeper and curation concepts. QR stays local as a second channel.
3. **Square second.** The reference for hardening. Migrating it proves the kit lost nothing: tips, undercollection, duplicate capture, webhook dedupe. Its Square-app handoff stays a local channel.
4. **PayArc, then SumUp.** SumUp gains lock, reconciler, sweeper and resume from nothing. PayArc already has an advisory lock, a reconciler with exact-amount verification, trace+status dedupe and Start-driven resume; its migration must reach parity with those (exact minor-unit matching, the processor-response fields on the row, the in-flight settings guard) before deleting them, and only atomic locking, scheduled sweeping and page-load resume are net new.
5. **Stripe last.** Largest and oldest, with a disabled React frontend, Blocks support, MOTO and keep-warm to carry over, and a second webhook implementation to retire.

Each migration is a major version of that plugin that deletes its AJAX handler, token, poll loop, lock, reconciler and sweeper in favour of an adapter of a few hundred lines.

## Effort and risk

Estimates from the audited line counts, not measurements.

| Work | Size | Basis |
|---|---|---|
| Host kit (PHP + tests) | 2,500 to 3,500 lines | Square's OrderMeta, OrderLock, CheckoutReconciler, PaymentSweeper, WebhookHandler and Logger total about 1,500 lines; Mollie's equivalents about 700; generalising and testing roughly doubles it |
| App terminal checkout | one screen plus hook changes | Square's controller is 800 lines with 45 tests; the app already has bootstrap, start and poll |
| Per-plugin migration | delete 60 to 75% of PHP, all checkout JS | Mollie keeps about 500 of 1,900 lines; Stripe keeps its 1,360-line service plus Gateway settings |

Risks:
- **Cross-repo coordination.** Step one touches the host and the app before any plugin benefits. A host release with an inert kit is safe; the app screen must ship before Mollie's migration is usable.
- **Version skew.** A migrated plugin on an old host must fail loud at activation, not at the first sale.
- **Losing hardening in translation.** Every row in the lessons table becomes an acceptance test on the kit before Square migrates. Square's JS tests port to the app.
- **Web checkout.** Four plugins label the enable box web-only, which suggests few merchants sell terminals on the web store. If any do, the legacy order-pay path keeps working through the same adapter, but it keeps the order token and the iframe with it.

## Defects surfaced by the audit

Pre-existing and unrelated to the design question. Each needs a fix or a decision.

| Plugin | Defect | Where | Severity |
|---|---|---|---|
| Stripe | Charge-success webhook path calls `Settings::get_secret_key()`, which does not exist; that branch cannot execute | includes/API.php:541-581 | fatal path |
| Stripe | Webhook call sites pass a severity to `Logger::log()`, which accepts only a message; levels are ignored | includes/API.php:480-523, Logger.php:46-64 | diagnostics |
| Stripe | All REST routes use `permission_callback => '__return_true'` (already noted in #95) | includes/API.php:49-123 | auth |
| Square | Cancel response has top-level `status`; the cancel normaliser reads nested `checkout.status`, so a direct cancel result is never classified final by that parser | AjaxHandler.php:285-311, payment.js:508-521 | UX |
| Square | Sweeper cannot expire attempts that never got a checkout id; they stay queued | PaymentSweeper.php:216-250 | cleanup |
| SumUp | `Settings::get_api_key()` reads `secret_key` and `test_secret_key`, fields the form does not have; the real key path bypasses it | Settings.php:15-42, Gateway.php:122-130 | dead code |
| SumUp, Stripe | Header text domain ends with a period | main plugin file | i18n |
| SumUp | No cleanup of abandoned payments if the browser dies; no lock on create | AjaxHandler.php:155-185 | reliability |
| Mollie | Lock is get-then-set on a transient, not atomic; reconciler writes attempt status before the verification branch | PaymentLock.php:7-32, PaymentReconciler.php:10-58 | race |
| Mollie | Empty admin.js enqueued on every admin screen | Gateway.php:21, 354 | cosmetic |
| PayArc | Admin JS populates a select for a field that is now a text input; settings help says transactions use the Login token while the accessor defaults to SecretKey | admin.js:67-98, Gateway.php:87-104, Settings.php:142-147 | UX / docs |
| PayArc | Diagnostics rows read options nothing writes | Gateway.php:643-700 | dead code |
| Square, Stripe, PayArc | AJAX actions registered on every request, not only under `wp_doing_ajax()` | Plugin.php:64-85 / AjaxHandler.php:30-83 / AjaxHandler.php:37-52 | hygiene |
| SumUp | `process_payment()` completes any order that has a transaction id, and the id is stored at checkout creation before the reader acts, so submitting the pay form after Start marks an unpaid order paid | Gateway.php:236-255, AjaxHandler.php:187-218 | payment integrity |
| Stripe | The registered `payment_intent.succeeded` webhook saves metadata but never calls `payment_complete()`, and there is no sweeper; a captured charge stays on an unpaid order if the browser closes | API.php:477-524, stripe.md §4 | money taken, order unpaid |
| Stripe | `get_readers` and `validate_service` are `nopriv` with no order gate and no nonce; anyone can enumerate readers and force Stripe calls | AjaxHandler.php:408-470 | auth |
| Stripe | Currency converter treats HUF and TWD as zero-decimal (the payout rule); charges are two-decimal, so those currencies are undercharged 100× | Utils/CurrencyConverter.php:44-49 | money |
| Mollie | `process_refund()` calls `wc_create_refund()` after WooCommerce has already created the refund, so every refund creates a second refund record and double-counts the refunded total (confirmed in code) | RefundHandler.php:10-16 | data integrity |
| Square | OAuth connection stores expiry and a refresh token and has `needs_refresh()`/`refresh()`, but nothing calls them; an expired token fails until the merchant reconnects | Services/SquareOAuth.php:289-305, square.md §11 | service lifetime |
| PayArc | Indeterminate create replays with a fresh idempotency key (see the lessons table) | PaymentAttempt.php:127-171, Services/PayArcPaymentService.php:71-95 | duplicate collection |

## Rulings (Paul, 2026-09-05)

1. **Hard dependency and home.** The shared layer is the `server` capture mode of the 1.11 payments contract (roadmap #97); the contract lives in Free, the terminal mechanisms in Pro, and a migrated extension's server tile requires Pro. See the addendum below and the boundary in the spec hub §1.
2. **Checkout moves into the app.** Yes: the POS app drives `server` and `device` legs over the cashier's REST session (tickets #152–#155).
3. **Web checkout for terminals.** Keep it via the legacy order-pay path; each extension's legacy gateway survives the migration, so this costs nothing now.
4. **Defects.** Fix now on `main`: Stripe fatal webhook path and open REST routes (shipped, 0.0.31); Stripe webhook completion, anonymous AJAX and HUF/TWD exponents (0.0.32); SumUp `process_payment` integrity (0.0.13); Mollie duplicate refund (0.5.4). Fold into the migration: Square OAuth refresh (second in line, clean reconnect failure), PayArc indeterminate-create replay (solved structurally by row-UUID idempotency in #152). The remaining hygiene items ride each plugin's migration.

Sources: the five per-plugin audit reports in this folder; the drift and census measurements; woocommerce-pos `includes/Payments/*` and `includes/API/V1/Checkout_Controller.php`; monorepo-v2 `use-checkout-session.ts`; woocommerce-pos issues #828 and #830.

## Addendum: how this lands in the 1.11.0 payments contract (#97)

Written after reading roadmap #97, the Payments Contract v1 spec (wcpos/wiki#1090: hub, descriptor, ledger, routes, tender-flows, extensions) and what has landed on `next` in woocommerce-pos#1839. This supersedes the "host already started" section and option A above: the adapter contract that section describes is **deleted in the 1.11 batch** (#108, spec §10). The recommendation survives; its home is now the contract's `server` capture mode.

### What #97 already settles for #95

| Audit proposal | Contract v1 | Landed on `next`? |
|---|---|---|
| Kit lives in the host, one copy, no version collision | Free owns the capture-mode **registry** (`wcpos_register_capture_mode`) and the **route family** `intent / capture / status / void / refund` keyed by the row UUID; extensions register a handler per provider (§4.5, §10) | yes: `Capture_Mode_Registry`, `Capture_Mode_Handler_Interface`, `Abstract_Capture_Mode_Handler`, `manual` + `webview` handlers |
| Delete the order-authorisation gate | Routes use the plugin's JWT + `X-WCPOS` gate and `publish_shop_orders`; the app is the cashier (§4.5) | yes |
| Attempt store: current pointer, history, abandoned ids | The **ledger row** is the attempt: client-minted UUID, snapshots, one-way lifecycle, **retry = new row** (§3.4), `provider_refs` | yes: `Contract/Ledger.php` |
| "Indeterminate create: keep the attempt, reuse the idempotency key" (Square) | Built in: handlers receive a row that already exists; provider calls carry the row id as idempotency header and `metadata.wcpos_payment_id` (§4.3) | yes for the route family |
| Webhook frame: refetch then reconcile | `wcpos_settle_payment( $payment_id, $patch )` finds the row across orders by `metadata.wcpos_payment_id` and applies the patch under §3.4 (§4.5) | **no** (specified, not landed) |
| Money: exact leg amount, currency exponent | Handlers receive the **leg amount, never `get_total()`** (#108); `Contract/Money.php` | yes |
| Tips | `on_reader`: confirmed − leg written as a fee on `capture` (§9) | no |
| Enable checkbox is web-only | Descriptor `pos_enabled` comes from POS settings (#104) | yes |
| Provider adapter interface | `describe / bootstrap / intent / capture / status / void / refund` maps one-to-one onto the audit's `create / fetch / cancel / list_terminals / verify_webhook / refund` | yes |

So the "kit" is smaller than the audit estimated: ledger, idempotency, auth and the row model already exist in Free. What remains is exactly the **`server` capture mode**, which §14 lists as not yet done, plus the app's `server` flow screen.

### Gaps the audit adds to the spec for `server` mode

Each of these is a lesson one plugin paid for (the "lessons that did not travel" table). The spec currently leaves them to "the handler", which means five re-implementations again. Proposed placement in brackets.

1. **Per-order lock around every handler call** [Free, route family]. The app's `status` poll, a `void`, and the webhook writer can run concurrently on one row. §4.5 says Free persists and derives; it should also serialise. Square's `OrderLock` (MySQL `GET_LOCK`, option fallback) is the only atomic lock in the family; Mollie's transient lock and PayArc's option lock both document that they are advisory.
2. **Stale-row sweeper** [Free, cron]. A `server` row only advances when the app calls `status`. If the app dies, the row stays `pending`/`authorized` and the order stays `pending` forever. Square and Mollie both learned this and run a ten-minute cron; Mollie also voids on `woocommerce_order_status_changed` to cancelled/failed. Free should call `status()` on live rows older than a threshold and `void` past a deadline, for every mode that has a handler.
3. **Amount and currency verification on the way in** [Free, route family]. A handler returns "the row's new state"; Free should refuse `captured` where the provider's confirmed amount or currency differs from the row (outside the `on_reader` tip rule). Square's undercollection case (customer pays less than the leg) needs a ruling: the money moved, so it is neither `captured` nor cleanly `failed`. Proposed: `failed` with `failure_reason: amount_mismatch` plus a needs-attention item, matching the overpaid-offline pattern in §7.
4. **Webhook dedupe by provider event id** [Free, `wcpos_settle_payment`]. Row idempotency covers replays of the same state; providers also deliver the same event twice and out of order. Square keeps the last 50 event ids per order; PayArc keeps trace+status pairs. A small per-row `seen_events[]` closes it; the one-way lifecycle already refuses regressions.
5. **Reader curation** [descriptor + POS settings]. Five plugins, five reader pickers. The spec has `hardware.discovery: sdk|manual` and "bootstrap if the handler asks (reader identity)". Mollie's default / allowlist / lock-to-default and Square's cached list with last-known-good fallback are the merchant-facing features; both belong in Free's POS settings per method, with the handler supplying `list_readers()` through `describe()` or `bootstrap`, so the app renders **one** picker for every `server` provider and Free stores the choice.
6. **Cashier event log** [ledger row]. All five plugins keep the log browser-side, which is why support asks for screenshots. Proposed `row.events[]`: timestamped, redacted, capped, written by Free on every transition and by handlers through a helper, returned on `status`. The app's checkout logger shows it; five log panels retire.
7. **Deadline and cancel semantics** [app `server` flow, once]. Square's state machine is the reference: idle → creating → polling → cancelling → final; ~300 s deadline; backoff on transport errors; forced read then `void` at the deadline; **cancel is a request, not a result** (keep polling until the provider confirms; Stripe and Mollie get this wrong today); resume on reopen from the live row. Its 45 JS tests port to the app.
8. **Version gate** [extensions]. §14 already lists "minimum-POS-version declaration". A migrated extension on an old host must fail loud at activation, not on the first sale.

Items 1, 3 and 4 are correctness of Free's route family and belong in Free regardless of the Pro question below. Items 2, 5, 6 and 7 are the shared `server`-mode machinery.

### Free or Pro for the shared `server`-mode base

Paul's framing was "part of the core Pro plugin". The spec's boundary table gives Pro the `server` / `device` / `stored_value` handlers **for its own integrations** and says extensions register handlers with Free's registry, with "which provider's handler lives in Pro versus its extension decided per provider at landing". The shared machinery above is not any provider's handler; it is where an extension's handler runs.

- **In Free:** an `Abstract_Server_Handler` next to `Abstract_Capture_Mode_Handler`; every extension can offer a `server` tile without Pro.
- **In Pro:** the same class ships in Pro; an extension's tile appears only with Pro active, and without Pro the extension has the Legacy tab only. This matches #102's original boundary ("Pro = terminals") and is a legitimate business choice.

Same code either way; the difference is whether the new tiles are a Pro feature. Note Pro vendors Free via Composer and shadows it at runtime (the pipeline finding on #97), so "core Pro plugin" already contains both; the only question is what an extension can do standalone. This needs Paul's ruling before the `server`-mode landing ticket is written.

### Migration order versus "Stripe Terminal first"

Spec §10 says Stripe Terminal first; that is the `device` driver (the only provider with an official React Native SDK, #114). The five audited plugins are all `server`-driven today. For proving the `server` mode, Mollie remains the cheapest proof (smallest, newest, already has attempt/lock/reconciler/sweeper concepts); Stripe's server-driven smart readers can follow. The two can run in parallel: Stripe `device` driver, Mollie `server` handler.

### Effort, revised

The host-side estimate in the audit (2,500 to 3,500 lines) assumed ledger, idempotency and auth had to be built. They exist. What remains: lock, sweeper, verification, event log, `Abstract_Server_Handler`, reader curation settings, `wcpos_settle_payment`, roughly 1,200 to 1,800 lines with tests, plus the app's `server` flow screen. Per-plugin migration is unchanged: each extension keeps its legacy gateway (Legacy tab) and adds a handler of a few hundred lines over its existing provider layer, then deletes its own AJAX handler, token, poll loop, lock, reconciler and sweeper once the Legacy tab is no longer needed.

The defects table above stands and is unaffected by #97.
