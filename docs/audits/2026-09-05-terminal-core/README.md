# Terminal core feasibility audit

Audit of the five card-terminal gateway plugins (square, stripe, sumup, mollie, payarc), what they actually share, and a judgement on whether one core library can carry the settings, polling, authorisation, reconciliation and logging they each reinvent. Design ticket: wcpos/roadmap#95.

Audited 2026-09-05. Versions: square 0.8.1, stripe 0.0.30, sumup 0.0.12, mollie 0.5.3, payarc 0.1.15. Host: woocommerce-pos 1.10.7, app 1.10.6. Per-plugin reports are in this folder.

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
| An indeterminate create may have succeeded; keep the attempt and reuse the idempotency key | Square | Mollie, SumUp, Stripe (no idempotency key at all) |
| Deduplicate webhook deliveries by event id | Square, PayArc | Stripe, SumUp, Mollie |
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

```
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
- **Lock** from Square's `OrderLock`. It is the only atomic one; Mollie's transient lock and PayArc's option lock both document that they are advisory.
- **Reconciler** from Square (tip, undercollection to on-hold, duplicate capture) and Mollie (attempt ownership, mode check, idempotent paid, conflict). The provider maps its statuses to the kit's enum: pending, in progress, completed, cancelled, failed, expired.
- **Webhook frame** from Square and PayArc: dedupe, lock, refetch from the provider, then reconcile. Signature verification is provider-specific and stays local.
- **Sweeper** from Square and Mollie, plus Mollie's cancel-on-status-change hook.
- **Terminal registry** from Mollie's settings set (default, allowlist, lock) and Square's cache with last-known-good fallback.
- **Money** from Stripe and Square's exponent tables with PayArc's exact-match and overflow checks.
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
4. **PayArc, then SumUp.** Both gain lock, reconciler, sweeper and resume they do not have.
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

## Decisions needed

1. **Hard dependency.** May terminal plugins require WooCommerce POS? Yes unlocks option A. No means option B and the iframe stays.
2. **Checkout moves into the app.** Is the terminal screen a POS app feature, driven over REST, rather than a page each plugin renders? This is the step that deletes the order gate and the five poll loops.
3. **Web checkout for terminals.** Keep it through the legacy path, or drop it and simplify further? The enable-box labels suggest it is rarely used, but that is inference, not data.
4. **Defects above.** Fix now in each plugin, or fold each into that plugin's migration? The Stripe fatal path and REST permissions should not wait.

Sources: the five per-plugin audit reports in this folder; the drift and census measurements; woocommerce-pos `includes/Payments/*` and `includes/API/V1/Checkout_Controller.php`; monorepo-v2 `use-checkout-session.ts`; woocommerce-pos issues #828 and #830.
