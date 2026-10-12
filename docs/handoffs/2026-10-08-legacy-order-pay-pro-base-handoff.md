# Handoff — legacy order-pay on Pro's shared base (roadmap#95), overnight 2026-10-07/08

Spec: `docs/specs/2026-10-07-legacy-order-pay-on-pro-base.md` (roadmap#414). Rides WCPOS 2.0; all
extension and plugin work on `next`. Memory: `legacy-order-pay-on-pro-base-design`.

## Landed on `next` (all four PRs)

| Repo | PR | Merge | Slice |
|---|---|---|---|
| woocommerce-pos | #2154 | `a880303e9` | 0 — ledger hardening: persist before dispatch (`indeterminate`), sweeper re-dispatches unanswered rows, pending legs reserve balance → 409 `wcpos_payment_in_flight` with `payment_id`, `source` on intent, `prompt` on status |
| monorepo | #2436 | `0389e46db` | app rejoins an in-flight server leg on 409 (adopts `payment_id`/`intentId`, OR-seeded cancel flags, stale settlement dropped) |
| woocommerce-pos-pro | #614 | `989b8a0c0` | 1a–2 — `Order_Pay_Panel` + `order-pay-panel.js`, `Order_Pay_Gateway`, five `wcpos_pro_*` helpers, `Legacy_Adoption`, `Payments_Answer_Controller`, `Reader_Curation::allowed()` |
| woocommerce-pos-pro | #616 | `261fbe789` | 3–4 — `tests/includes/Conformance/*` (abstract case, fixture contract, simulated fixture, golden transcripts, README), `Support_Bundle`, `Redactor` hardening, optional `diagnostics()` |

Each PR: Codex (GPT-6 Astra) implementation from a written brief, 3–6 passes by an independent
Opus reviewer posting the `independent-review` status, bot threads dispositioned, merged CLEAN.

## Decisions made without Paul (reversible; each is in the spec or a PR body)

1. Legacy order-pay = `server` capture mode entered from the order-pay page; Pro's panel drives
   Free's payment routes; the row is minted at start (`source: webview`, amount = balance).
2. An unsupported cancel never forges a local void; the row waits for the provider's own expiry.
3. Pro's downstream-conformance CI job (certified extensions' fixtures against candidate Pro) is
   deferred to the first certified extension's 1.0.0 (Windcave).
4. ~~The support bundle lives on a Pro submenu page~~ — **overruled by Paul in the morning** (*"Why
   can't the support button be part of the WooCommerce > Settings > Payment > extension page?"*). It
   can: Pro appends a row to every provider gateway's own WooCommerce settings page through the
   settings-API form-fields filter (woocommerce-pos-pro#618). The rule from the Terminals-block
   revert now covers buttons and tools, not only settings.
5. Redactor trades false positives for leaks: a 13+ digit Luhn-valid `order_id`/`payment_ref` and
   a bare `key=VALUE` in prose are masked.
6. Golden-transcript recording is an explicit in-process opt-in (`WCPOS_RECORD_TRANSCRIPTS=1` on
   the `wp-env run … env` command); a missing golden always fails.

## Morning session (2026-10-08, Paul awake)

- woocommerce-pos-pro#618 — support-bundle button moved onto each provider gateway's WooCommerce
  settings page; Pro submenu page removed. Independent review APPROVED; bot rounds in progress.
- woocommerce-pos-pro#619 — webhook route accepts GET (Windcave FPRN) — merged at `7904f62`.
- Mercado Pago and Windcave `next` branches cut from `main`.
- **Slice 5**: wcpos/mercadopago-terminal-for-woocommerce#13 APPROVED after four independent passes
  (head `3c28fa7`). CI first failed at the Pro-checkout token: the workflow named the wcpos-mini
  App, whose key exists only as a repo secret on the Stripe repo. Swapped (`5424a7d`) to the
  org-level `WCPOS_BOT_APP_ID`/`WCPOS_BOT_PRIVATE_KEY` secrets, already visible to every wcpos
  repo, token scoped to contents:read on Pro; nothing for Paul to configure. CI green on 7.4 and 8.3. **Merged at `06af5ff`.** Decisions amended in review: `external_reference` = `wcpos_<uuid>`;
  `provider_refs.transaction_id` = MP order id; 409s classified by error code, with a busy
  terminal on a REPLAYED create treated as ambiguous; refund `processing` stays pending; currency
  provider-first; adoption paged (25 per `init`).
- **Slice 7 landed**: https://github.com/wcpos/terminal-extension-template (private template repo,
  `e0a390d`): bootstrap gate, thin Gateway, adapter skeleton with the shared rules written for
  real, fixture skeleton, sibling-Pro tests, CI, release, author README, `create-extension.sh`.
- **Slice 6**: wcpos/windcave-terminal-for-woocommerce#13 open (head `5807753`), three fix rounds
  from two independent passes (replayed-`PC` ambiguity reproduced through Free's ledger, refund
  polling with PJ grace and money verification, slot-mapped custom prompt buttons, POS-only
  availability gated on the POS capability, environment-only per-action context); APPROVED after
  pass 3. Same token swap as Mercado Pago (`092a7ed`); the template repo carries it too (`b3a5538`). **Merged at `148fde7`.**
- woocommerce-pos-pro#621 merged at `53edef14f`: the five conformance rules settled by the two
  extensions, in Pro's conformance README.
- Mercado Pago #13 re-approved at `11845b6` (six passes) after the same three gaps the Windcave
  bots found were applied there too.
- **Slice 8a** (session-expired frame reload): monorepo#2438 (branch `feat/95-session-expired-reload`
  from `next`). Approved at `b15d413` after four passes; the Mac mini review agent then pushed
  `c077160` (a successful refresh arms `pollServerTruth`, since the remount resets the load count and
  a payment settled during the refresh was otherwise missed) and approved it. Greptile's P1 on that
  commit (the poll chain could start after checkout closed and settle an old order onto the current
  screen) fixed at `bf677dd` with an unmounted guard on the refresh continuation and the poll;
  red/green shown. The reviewer's one hardening point (set the flag in a layout cleanup) applied at
  `3bd7153`, approved independently. **Merged at `b2944e5`.**

## Evening session (2026-10-08): the 2.0 stance for the older extensions

- **Ruling (Paul):** terminal extensions are Pro-only at 2.0, Stripe and SumUp included; Stripe
  drops web checkout; their POS order-pay moves onto Pro's panel with a MOTO carve-out (Stripe's
  own panel stays while "Phone Order" is enabled). Recorded on #95; memory
  `terminal-extensions-pro-only-at-2-0`.
- **Stripe #148** merged at `303fd05` (the gate at `plugins_loaded` 30, web checkout removed, the
  E2E site runs Pro through the org bot token). Codex stalled three times on the brief (two
  readiness failures of mine: a vendor path that did not exist, and a parent-short-circuit
  instruction that contradicted the removal); implemented by hand.
- **Stripe #161** merged at `5266900` (POS order-pay through Pro's panel with the Phone Order
  carve-out, refunds through Pro for a counting server/device row, legacy adoption under Free's
  order lock bounded to orders that existed at upgrade). Codex stalled a fourth time; implemented
  by hand. Five review rounds; the reviewer found that Free already mints a `webview` row for
  every old-panel sale (my first refund rule misrouted exactly the MOTO sales), and that the old
  webhook and AJAX handlers would have recorded an adopted attempt twice. Both fixed with tests.
- **Stripe #149** merged to `main` at `a4b8e1b` and **#163** merged to `next` at `2ecdc3b`: PaymentIntents use
  `allowed_payment_method_types`, the parameter Stripe API 2026-09-30.endive (stripe-php 22)
  requires. Another session had already reverted `main` to stripe-php 21, so no release carried
  the break.
- **Stripe, still to do:** conformance transcripts under wp-env (Stripe's CI is plain PHPUnit
  with Pro stubs; the job needs the sibling-Pro shape Mercado Pago's has).
- **SumUp #52** merged to `next` at `2154c6a`: the Pro gate at 30 and the web-checkout
  removal; SumUp has no Blocks and no MOTO, and no PHPUnit, only `tests/regression/*.php`
  scripts plus phpcs on a file list.
- **SumUp #53 (PR B)** merged to `next` at `53c57db`, independent review approved at `078474f`
  after eight rounds. The POS order-pay page renders Pro's panel; the old panel, its script and
  its three AJAX actions are gone; pairing and the legacy admin-ajax webhook stay.
  `process_payment()` short-circuits a paid order then hands to `wcpos_pro_order_pay_process()`;
  refunds stay Pro's through the provider. **Adoption** works a snapshotted queue
  (id => `reader:client_transaction_id`) under Free's `Order_Lock`, 25 per request, seeding the
  provider's checkout marker from the old panel's start time so an unpaid adopted attempt is
  confirmed finished from the reader's activity, not voided at the deadline. **Recorded
  successes** whose submit never landed (PAID/SUCCESSFUL meta, unpaid, statuses
  `pending`/`failed`/`pos-open`/`pos-partial`) are completed on Free's ten-minute
  `wcpos_payments_sweep` under the lock, only on SumUp's authenticated lookup saying SUCCESSFUL;
  FAILED/CANCELLED on the matching id is the only final no, anything else retries on a
  1/5/15/60 min/6 h backoff and ends with an order note for staff. The findings the rounds
  closed are listed on the PR and on roadmap#95 (comment 6069228210). Not evaluated: Pro's
  panel in a browser for SumUp; anything against a live SumUp account; conformance transcripts.
- Then the Mollie, Square and Payarc ports from the template.
- **Order of the rest:** Mercado Pago live first (Paul opens the seller account; Windcave is not
  a priority), the Stripe and SumUp conformance PRs (each needs a wp-env job with the sibling-Pro
  shape Mercado Pago's has), then Mollie, Square, Payarc ports from the template.

**Two defects found on the way:**

1. **The Pro gate ran before Pro existed.** Every extension on `next` hooked its `wcpos_pro_requires()` gate at `plugins_loaded` priority 11, but Pro's `Activator` runs at 20 and that is what requires `wcpos-pro-functions.php`. So Mercado Pago #13 and Windcave #13 as merged this morning registered nothing on a Pro 2.0 site: notice shown, no provider, no gateway, no adoption. Their gate tests passed because they called `init()` from inside a test after Pro had loaded. Found by the independent review of wcpos/stripe-terminal-for-woocommerce#148, which had copied the bootstrap. Fixes, each a one-line move to priority 30 plus a test that pins it: Stripe #148, wcpos/mercadopago-terminal-for-woocommerce#14, wcpos/windcave-terminal-for-woocommerce#14, template `7426d0f`. Nothing reached merchants; both extensions are `next`-only.

2. **stripe-php 22 breaks PaymentIntent creation.** The Dependabot bump (#143, merged to Stripe's `main` today, unreleased) pins Stripe API `2026-09-30.endive`, which removed the writable `payment_method_types`; every Terminal and phone-order intent would fail with `payment_method_types_no_longer_supported`. The SDK sends its pinned version on each request, so this is independent of the merchant's own API version. Fix on `main`: wcpos/stripe-terminal-for-woocommerce#149 (`allowed_payment_method_types`, which now accepts `card_present` and `interac_present`); the live smoke job that was red on `main` is green on the PR. `next` was reverted to stripe-php ^21 separately and is unaffected until it bumps.

**Stripe on `next`, status:** #148 (Pro-only gate at 30, web checkout removed, E2E site runs Pro via the org bot token) merged at `303fd05`; #161 (PR B: POS order-pay onto Pro's panel with the MOTO carve-out, legacy adoption) merged at `5266900` after five review rounds; #163 merged at `2ecdc3b`; **#165 (conformance)** merged at `4e2bf12` after five review rounds: a `conformance` CI job (wp-env, sibling Pro via the org bot token, PHP 7.4 and 8.3) runs Pro's provider conformance suite against the real adapter over a scripted Stripe, 23 transcripts committed. The suite and the review found and fixed: unanswered creates and dispatches (and 5xx, and an idempotency conflict on a replay) dropping the leg, a failed dispatch retiring a paid intent, a decline by webhook swallowed (now applied against a fresh read and retired), the old panel's Retry on adopted intents, historical webview refunds (transaction id, charge ids for Interac), and the Phone Order recovery / old refund path / status check acting on the keypad leg's intent that Free now copies into the order transaction id. Not claimed: `expiry`, `cancel_unsupported`, `prompt`, `manual_capture`, `test_live_isolation`. Record on roadmap#95 (comment 6071383587).

**SumUp on `next`, status:** #52 merged at `2154c6a`; #53 (PR B) merged at `53c57db`. Same conformance gap as Stripe.

## Not done

- Slices 5–8: Mercado Pago 1.0.0 on `next` (first real fixture through the conformance suite),
  Windcave 1.0.0 + the downstream CI job, the extension template repo, app-side prompt rendering.
- A dev-next `sim-prompt` reader; a browser/webview run of the order-pay panel; a real
  admin-post request against the bundle download.
- Live WisePad 3 money-leg proofs — need Paul's test card and iPhone.
- **Overnight 2026-10-09 (Paul asleep):** the Pro companion landed first: wcpos/woocommerce-pos-pro#625
  merged at `acbc804` after five review rounds. Pro's suite gains `non_idempotent_create`,
  `webhook_money_only` and `refund_synchronous` (opt-in capabilities with their own lessons; a second
  simulated fixture claims all three). The design record's first replay rule ("busy on a replay is
  indeterminate, create anew once dropped") fell in review: a provider that cannot see whether the
  first checkout was paid must **never dispatch again** for that row; a replay hands back a reference
  of its own, the first checkout settles by webhook, the leg ends only after the store's own cancel
  once the provider reports the checkout ended unpaid, and a paid-but-unlisted checkout is never
  ended on a guess (new lesson `create_indeterminate_paid`). Decided without Paul; recorded on
  roadmap#95 (comments 6071392800, 6072130671).
- **SumUp conformance landed:** wcpos/sumup-terminal-for-woocommerce#54 merged to `next` at `02b58e9`
  after three independent review rounds (approved at `151ef1d`, delta-approved at `e8ff94b`); a
  `conformance` CI job (wp-env, sibling Pro via the org bot token, PHP 7.4 and 8.3) runs Pro's suite
  against the real adapter over a scripted SumUp, 24 transcripts committed. The adapter now: keeps an
  unanswered checkout's leg pending; a replay sends nothing and returns `reader:row-<row id>`; the
  held poll ends the leg only after the store's own cancel (SumUp's delivery that the checkout ended,
  or a 120 s grace), or finds the paid transaction by `foreign_transaction_id` when affiliate keys
  exist, and a lookup SumUp cannot answer concludes nothing (logged); the held markers are
  non-autoloaded options, never transients, so a persistent object cache cannot strand the leg or
  block its refund; a replay whose start marker is gone treats the checkout as old, so a cancel never
  terminates a reader that may be on another sale; the row's `ended` marker and the settled record
  are written only for rows whose create went unanswered, against the authenticated lookup; event ids
  derive from the observation; the webhook resolves adopted rows and does its local lookup before any
  outbound call; refunds fall back to the transaction id. Fixture claims the three new capabilities
  plus `expiry`; not claimed: `cancel_final`, `cancel_unsupported`, `manual_capture`, `prompt`,
  `test_live_isolation`. Record on roadmap#95 (comment 6072583745).
  **Not evaluated:** a browser run of Pro's panel on SumUp; anything against a live SumUp account.
  Two assumptions a live run must check: SumUp lists a paid checkout within the 120 s grace, and SumUp
  echoes `foreign_transaction_id` on its transaction (a transaction without the field still matches,
  so a strict match cannot silently disable the path, but a wrong assumption here means the held poll
  completes on the delivery alone).
- **Mollie port (overnight 2026-10-09, after SumUp #54):** same three-PR shape as SumUp, decided
  without Paul and reversible. **#36** (gate at `plugins_loaded` 30 on `wcpos_pro_requires(2.0.0)`,
  web checkout removed, POS → Settings → Checkout the only switch, applied by `is_available()` on the
  plain order-pay page too) merged at `173e327` after two review rounds. **#37** (the POS order-pay
  page through Pro's panel with legacy adoption) went three independent rounds plus thirteen bot
  threads; the **QR carve-out** is the one product decision: Mollie's panel can show an on-screen
  iDEAL/Bancontact QR code and Pro's cannot yet, so while any QR method is enabled the merchant keeps
  Mollie's own panel (the same shape as Stripe's Phone Order carve-out) and nothing is adopted; with
  none enabled, Pro's panel, which also adopts an open old attempt before it renders. Adoption is by
  Mollie payment id (the provider polls and cancels it directly, no reader marker), snapshots order
  ids only, runs under Free's lock and the old paths' completion claim, and Pro owns an adopted
  payment only while Free's row for it is live (pending/authorized/captured): once Pro's leg ends
  without money the old panel, webhook, sweep and abandoned-list resolver act as before, so an
  order adopted while QR was off is not locked out when QR is switched on. Under Pro's panel no
  old-panel start is accepted at all; the old panel's script stops on a 409 with a reload message;
  the order-status cleanup still cancels an adopted payment when the order is paid another way (Pro
  voids only on cancelled/failed). Refunds: Pro leg → Pro; the old path refunds the transaction id
  first (unless it is a Pro leg's), then the newest paid old-panel attempt. A webhook capture carries
  the complete provider refs so Free sets the order's transaction id either way. **#38 merged at `00a6f03`** (five independent passes, eight bot threads; wp-env job with the sibling Pro, 24 transcripts; capabilities `cancel`,
  `cancel_final`, `cancel_requested_then_completed`, `webhook`, `webhook_money_only`, `refund`,
  `partial_refund`, `expiry`, `legacy_adoption`, `historical_webview_refund`; not claimed
  `cancel_unsupported`, `manual_capture`, `prompt`, `test_live_isolation`) found that the client threw
  one `RuntimeException` for transport loss, 5xx and 4xx alike, so a lost create response dropped the
  leg and a retry could charge twice: `MollieUnansweredException` now maps to Pro's `indeterminate()`
  on create, fetch and refund, and the replay reuses the `Idempotency-Key`. Also: `verify_webhook()`
  resolves adopted actions through Pro's record and answers a forged id with 404; `refund()` falls
  back to the transaction reference and takes the order from the refund record; a refund POST Mollie
  did not answer keeps its WooCommerce record as pending (an error made WooCommerce delete it and a
  retry refund twice), carries the attempt id as `Idempotency-Key`, and the extension's own cron
  re-asks until the refund is confirmed or gives up with a note. Nothing in Pro re-reads a pending
  refund (Mollie's ordinary queued refunds included): a Pro-side question in the morning briefing. The ten defect classes the three ports' reviews found
  are in memory `terminal-port-review-lessons` for the Square and Payarc ports. **Not evaluated:**
  Pro's panel in a browser on Mollie; anything against a live Mollie account (its test profile has no
  point-of-sale method).
- **Morning briefing posted on roadmap#95** (2026-10-09 ~06:20): four questions for Paul (Square/Payarc
  start, a Pro sweep for pending refunds, Pro's `adopt()` write order, the live Mollie assumptions).
  Local branches `feat/95-pro-only`, `feat/95-order-pay`, `feat/95-conformance` remain in the Mollie
  clone (squash-merged; `-D` is guarded). Docker daemon untouched; no wp-env left running.
- **Square #36 merged on `next` at `c99a06d` (2026-10-09 evening, Paul still to answer the briefing):**
  `next` cut from `main` at `1bffc58`; wcpos/square-terminal-for-woocommerce#36 adds `Square_Server_Provider` for Pro's
  base beside the untouched old plumbing, with Pro's conformance suite passing over a scripted Square
  (28 lessons, 25 transcripts; CI on 8.1 and 8.3; the extension installed `--no-dev` there because its
  PHPUnit 10 cannot share a process with Pro's PHPUnit 9). Square facts that shaped it: a checkout has
  no decline state (money is read from the payment; a cancelled checkout with a captured payment is
  money; one ended after a FAILED payment is a failure with the card's code); creates idempotent on the
  row id with IDEMPOTENCY_KEY_REUSED unanswered; references carry the environment; the Mollie refund
  re-ask rule applied from the start (key saved before the POST, cron replay under the same key); SDK
  retries off for the adapter. Live sandbox must check: a declined attempt appears as a FAILED payment
  in `payment_ids`; a cancel of a PENDING checkout answers CANCELED at once. Five independent passes
  and eight bot threads added: an approved-but-not-completed payment on an ended checkout is undecided
  (indeterminate / cancel requested / webhook pending); refund notes say delete the record and refund
  from the dashboard, never "refund again"; a refusal of a re-ask proves nothing unless the replay was
  byte-identical (401/403/IDEMPOTENCY_KEY_REUSED stay open); a success without a refund object is
  unanswered; the create body carries no translated string. Records: roadmap#95 comments 6080715996
  and the landing comment after it. **#37 (Pro-only gate, POS-only gateway, web checkout removed)
  merged at `908e744`** after two independent passes (memoized POS switch; child-process gate test
  with Pro present and absent). **#38 (order-pay through Pro's panel, legacy adoption, Square POS
  app carve-out) merged at `a6005e5`** after eleven independent passes and ten bot threads
  (roadmap#95 comment 6085549425). Beyond the Mollie shape: adoption reads under BOTH locks with
  caches cleared (Square's old lock waits five seconds, long enough for a completion); a one-hour
  adoption window, an older unknown pointer holding the panel until the old sweep reads it unless
  Pro's row reads live; the old attempt closes only once Pro's row is `captured`; the cashier's cancel
  judged under the lock, the cleanup path unguarded; a live Pro row blocks an old-panel start under
  either collection method and the POS app button on any return URL; a POS app transaction returned
  for a paid order is noted as a possible second charge only when verified, naming the order in its
  note, not another order's, at this location, in this currency. **Square is complete on `next`;
  the old plumbing's removal is for its 1.0.0.** Not evaluated: Pro's panel in a browser on Square;
  the upgrade pass on a real store; a live Square account (which note the POS app fills is unknown).
- **PayArc started (2026-10-09 evening):** `next` cut from `main` at `7816f6f`;
  wcpos/payarc-terminal-for-woocommerce#27 (adapter + conformance, 24 transcripts, CI on 7.4/8.3)
  **merged at `00720a8`** after nine independent passes (approved at f509ac3 with two Lows on the
  in-flight sale guard; four more rounds closed them: one option per sale found by prefix from the
  table, no `get_option()` in the scan, compare-and-delete, `$wpdb->last_error` = live; refund notes
  decide "delete the record" by amount because Pro allocates one record across provider and cash
  legs). Lessons 20 and 21 in memory `terminal-port-review-lessons`. PayArc Connect V3 facts: sale accepted at once with a traceId and
  decided on the terminal; TRANSACTION_NOT_FOUND for seconds after a sale = not visible yet; every
  call carries X-Idempotency-Key (the sale's is the row id); cancel confirmed by the read, refused
  once the card is processing; refunds are TERMINAL COMMANDS linked by the sale's 16-char
  transactionId, decided on the terminal (pending until the callback, noted on the order); the
  callback is authenticated by the plugin's URL token or PayArc's bearer. Order transaction id for a
  Pro payment = traceId. Live-run assumptions: a replayed sale under the same key returns the same
  traceId; an in-flight read is created/processing; a linked refund completes without the card.
  **Gate #28 merged at `7aec981`** (Pro-only at 2.0, web checkout removed; approved at 1d25f8b, two
  test-only rounds: PHP's array union keeps the LEFT operand's keys, so a fixture built as
  `$base + array('enabled' => 'yes')` never set it). **Panel #29 merged at `0e8649f`** (Pro's panel,
  `Legacy_Adoption`, old start/poll/cancel/callback yield; 22 regression scripts, 14 mutation checks,
  conformance green; REQUEST CHANGES at fb8fb31 on three Mediums, APPROVE at c51527a/b594d0a/66450e2).
  **PayArc is complete on `next`; every port on this ticket (Stripe, SumUp, Mollie, Square, PayArc)
  stands on Pro's base.** Lessons 22 and 23 in memory `terminal-port-review-lessons` (adoption when
  the old plugin has no sweeper; array-union fixtures). The panel with adoption (old attempt meta
  `_patwc_current_*`, `_patwc_attempt_history`, `PaymentLock`, `PaymentReconciler`, admin-ajax
  callback). Design facts: Pro's adopted row carries a five-minute deadline and the adapter's
  `cancel()` answers 'requested' on TRANSACTION_NOT_FOUND, so a stale pointer PayArc cannot see
  (a sale made under credentials since changed) must be HELD, not adopted; the old plugin has no
  sweeper, so a stale pointer is read from PayArc once at adoption time (final → the old reconciler
  settles it; processing → adopt; not found → hold; a trace-less start older than the in-flight
  window is closed with a note).
- **Payarc sizing before the port started** (kept for the record): neither has a Pro server
  provider at all (no `includes/Server/`, no `wcpos_pro_*` reference), so each needs the template's
  adapter first (Square: the Terminal API checkouts through the scoped SDK with Guzzle, so the
  conformance fake sits on the SDK's HTTP client, PHP >= 8.1 only; Payarc: its terminal sale API),
  then the gate, the panel with adoption, and conformance. A day each, with the review cadence seen
  tonight.
- **Pro-side PR open (2026-10-12, Paul: "continue with the Pro side"):** wcpos/woocommerce-pos-pro#628
  on `next` at `6c31c3d`, answering morning-briefing items 2 and 3. `Refund_Sweep` rides Free's
  ten-minute `wcpos_payments_sweep` (priority 20): an order is marked (`_wcpos_pro_refund_pending`)
  when a pending allocation is saved (Free's `woocommerce_pos_refund_allocated` action) or the
  historical order-pay refund path records a pending record; each pending refund is read back under
  the order lock through a new optional adapter method `fetch_refund( $row, $allocation )` on
  `Abstract_Provider_Adapter` (default unsupported; all five shipped adapters extend the abstract);
  a final answer rewrites the allocation, `refunded_amount`, an event and a note through
  `Ledger::save()`; pending/unanswered/malformed hold the mark; an order whose pending refunds all
  belong to adapters that cannot read drops out unchanged; a rejected refund keeps its record and
  the note says "not with a second refund". `Legacy_Adoption::adopt()` now saves the row before the
  lookup option. No adapter implements `fetch_refund()` yet: each extension repo adds it (Mollie
  first, its refunds are queued). Device rows are not swept.
  **Review pass 1 (fresh Opus, request changes) and the two bots, answered at `00ee3b4`:** the
  sweep saved a ledger it had read before N provider calls while Pro's two till refund paths
  (`Refund_Processor`, `Order_Pay_Gateway::refund()`) never took Free's `Order_Lock`; a scratch
  test erased a paid-out refund. Both till paths now lock with a fresh meta read (a held lock
  refuses before money moves, record rolled back), and the sweep writes each answer against rows
  re-read after the provider call. The mark's value is the time of the last look and the query
  orders by it (fifty pending refunds cannot starve the rest); a missing adapter (extension
  deactivated) holds the mark; a refund pending for 30 days is noted once and no longer asked
  about while still reserving its amount; reference-less refunds are asked about by record on
  both paths and a pending answer's reference is kept; the record remembers the method that
  refunded it; `adopt()` repairs a missing lookup on a retry. The new tests also caught the hook
  registered with the default accepted-args count, which would have thrown on every cron run.
  **Merged at `bcdd278`** after passes 2–4 (fresh Opus each): the historical path's `mark()` had
  judged a stale object outside the lock (now a fresh read under the lock), a pending answer must
  only fill an empty reference, the give-up memory moved to a flag on the refund record (the row's
  event log is capped) and notes the summed unconfirmed amount across rows, and a REFUSED lock on
  `mark()` adds a new meta row (WooCommerce deletes meta by row id, so the sweep's delete of the
  row it loaded cannot reach it; `order_ids()` de-duplicates). Approve at `cbddfcc`, delta at
  `e099831`; six bot threads resolved. Next on the Pro base: each extension implements
  `fetch_refund( $row, $allocation )` (Mollie first: queued refunds; find by metadata when the
  allocation has no reference).
- **Mollie `fetch_refund()` open (2026-10-12, Paul: "as you recommend"):**
  wcpos/mollie-terminal-for-woocommerce#39 on `next` at `c84b927`. `RefundReconciler::read()`
  (by reference, else by the POST's metadata: order, record, attempt id; never creates),
  `pro_status()` shared map, adapter answers indeterminate on silence or a held `refund` lock,
  provider error on a refused read. Regression `server-refund.php` +15 cases; conformance
  unchanged (28/332/6, Pro sibling `bcdd278`). **Merged at `419eb2a`** after three passes and
  four bot threads. Review found a pre-existing Major (since Mollie #38): the record kept ONE
  Mollie refund id per WooCommerce refund record, so a refund Pro splits across two Mollie
  payments had its second leg read the first leg's refund back as already made and never
  refunded, while Pro recorded it returned. Facts are now per payment (`<key>:<payment id>`,
  `_mtfwc_refund_legs` marker, legacy plain keys migrated under the payment on the first
  per-payment write; without that migration a replay posted twice). Stripe, SumUp, Square and
  PayArc adapters still answer unsupported (their refunds are synchronous or on-reader;
  Stripe's can be pending for some payment methods: the next candidate).
- **Stripe `fetch_refund()` open (2026-10-12, Paul: "continue"):**
  wcpos/stripe-terminal-for-woocommerce#166 on `next` at `8755de5`. Reads the refund `refund()`
  made by the id it returned (`StripeTerminalService::retrieve_refund()`, `GET /v1/refunds/{id}`),
  maps Stripe's five states through the map `refund()` already used (shared `refund_status()`);
  5xx or dropped connection indeterminate (`stripe_refund_unanswered`), refused read a provider
  error (never `failed`), a 200 without the refund unanswered, a refund whose `payment_intent`
  (or `charge`, for a historical row naming the charge) is not the row's payment refused
  (`refund_payment_mismatch`), an allocation with no reference `missing_refund_ref` (Stripe's
  `refund()` never returns pending without an id). No adapter meta, so no lock. **Merged at
  `c19f0f1`** (squash of `2cd442a`) after three passes and five bot threads. Pass 1 overturned
  the premise: Stripe can answer a refund POST 200 without the refund, so `refund()` now says
  `pending` with no reference on purpose and `fetch_refund()` finds it by the create's metadata
  (row id AND refund id) among the payment's refunds, paging up to five pages and stopping at the
  one that holds it. Codex found server rows record `stripe_mode`, so the read now travels under
  the recorded mode's key as a per-request option (a second `StripeTerminalService` swaps the
  SDK's global HTTP client and sent the unit test to api.stripe.com: memory lesson 28); the SDK
  client is built key-less when the current mode has none. 586 unit tests green, 27 in the fetch
  file; every pass 2 survivor now fails a test. Pre-existing, outside the PR (pass 3):
  `tests/includes/StripeTerminalServiceTest.php` made 37 real requests to api.stripe.com per
  run: **fixed in stripe-terminal#167, merged at `3b0c44d`** (the constructor installs its curl
  client only while the SDK's client is still a curl client; the service test installs a refusing
  fake by default; 0 real requests at the head). SumUp, Square and PayArc still answer the sweep
  unsupported.
- **Sweep end to end under wp-env (2026-10-12, Paul: "agree"):** stripe-terminal#168 **merged at
  `4416275`** (one pass plus a delta), test-only: `tests/conformance/Test_Stripe_Refund_Sweep.php` drives Pro's real
  `Refund_Sweep` through `do_action( 'wcpos_payments_sweep' )` against the real adapter over the
  scripted `Fake_Stripe_Transport` (now holding refunds, serving the single read and the listing,
  able to lose a create's body, settle, and make a dashboard refund). Six cases; 34/417/7 for the
  whole suite. Traps: a cached adapter instance in `Server_Providers` makes a mode-switch case
  vacuous (reset the instances by reflection, as the sweep's own request builds afresh); the
  fake lists newest first, so a "bind the first listed" mutation survives unless a NEWER foreign
  refund exists. wp-env mounts the worktree as `plugins/<worktree dir name>`, so `--env-cwd`
  must name the worktree directory, not the plugin slug.
- **Unanswered refund create (lesson 11 for Stripe; 2026-10-12, Paul: "agree"):**
  stripe-terminal#169 open at `74403a2`. `refund()` answers `pending` with no reference when the
  POST itself goes unanswered (before: an error, WooCommerce deleted the record, a staff retry
  under a new key could refund twice). New `Refund_Reask` (`includes/Server/Refund_Reask.php`)
  re-sends the same body under the same idempotency key on WP cron (`stwc_refund_reask`; delays
  60/300/1800 s; the event carries the MODE, never the key; a 409 or no answer re-queues; a
  refusal writes `_stwc_refund_refused` on the refund record and notes the order), and
  `fetch_refund()` answers `failed` for a reference-less allocation whose record carries that
  mark. `Settings::get_api_key_for_mode()` shared with `key_for()`. The fake transport's refund
  creates are idempotent by key, with "lose the answer after taken / before arrival" switches and
  an over-refund refusal. Unit 602; e2e 9/155; conformance 37/478/7. Trap: Stripe sends an
  idempotency conflict as a 400 of type `idempotency_error` (the SDK makes it a 409); a fixture
  that sends status 409 lands in the 5xx-unknown bucket and tests nothing. Pass 1 requested
  changes (three Majors, all also raised by Codex/Greptile): a 401/403/429 on the replay was
  recorded as "never made" (stripe-php's `RateLimitException` EXTENDS `InvalidRequestException`,
  so the handler filed a 429 as 400; the handler now tells it apart first, and `is_refusal()`
  whitelists 400/402/404 minus the `rate_limit`/`lock_timeout` codes); the re-ask recorded the
  gateway's mode, not the row's (now `mode_of( $row )`, and `refund()` itself posts under the
  row's key); Pro's sweep never reads device rows, so a pending there would stand for good (device
  rows keep the error; the Pro change is Paul's call). Also: a 12 h `REPLAY_WINDOW` (Stripe prunes
  keys after 24 h, cron can be late), a logged scheduling failure, `fetch_refund()` lists before
  believing the refused mark, and the fake refuses a changed body under a known key. Pass 2
  (approve) added: the re-ask's note must not say "not made" (only the sweep, after Stripe's
  list, may); a deleted refund record stops the re-send; a metadata match must carry the
  allocation's amount. **Merged at `ff5bd55`** (squash of `a34c28a`). Open for Paul: Pro's
  `Refund_Sweep` reads server rows only; device rows (Bluetooth, Tap to Pay) are never read back,
  so their unanswered refund POST still errors and a pending one would stand for good.
- **Device rows in the sweep (2026-10-12 evening; Paul: "keep going" after the #169 report,
  taken as the go-ahead on the pick):** wcpos/woocommerce-pos-pro#633 open at `e47fd09` (base
  `next`, approved by a fresh Opus pass + delta, `independent-review` status posted, CI matrix
  running at the time of writing). `Refund_Sweep::sweep()` takes `server` AND `device` rows and
  reads both through `Server_Providers::get( method_id )`; no server adapter + a device adapter
  registered (`Device_Providers::has()`) releases the mark (nothing will ever read it, the status
  quo for device rows); neither adapter holds it. 15 production lines (Codex from a spec in the
  scratchpad); four new cases on `Test_Refund_Sweep` (26/283), three mutations caught. Review
  found an OLDER Stripe gap: Free's `Settlement` patches an indexed row by payment id whatever
  its mode and Stripe's `webhook_patch()` carries no refs, so a device payment captured by
  webhook before the till's capture holds only Pro's `payment_intent` and Stripe's `refund()`
  answered `missing_payment_ref`. **stripe-terminal#170 open at `0f704cc`** (base `next`; merge
  AFTER Pro #633): `swept()` and the device carve-out gone (device rows take #169's
  pending-and-re-ask path), and `payment_of()` reads `action` → `stripe_payment_intent` →
  `transaction_id` → `payment_intent` for both `refund()` and `fetch_refund()`. **Both merged:**
  Pro #633 at `05f06c4` (squash of `e47fd09`), then stripe-terminal#170 at `49a9695` (squash of
  `bb951f5`, after a delta pass added a case pinning `action` over `payment_intent`). Unit
  621/1614; four mutations caught across the two. Worktrees and the Pro wp-env project removed;
  Docker daemon untouched. Found by the #170 review, neither done, both older than these PRs:
  (1) a webhook-captured row records no `stripe_mode`, so after a test/live switch its pending
  refund is read under the new mode's key (404; Pro keeps asking to the 30-day note; the re-send
  is unaffected) — fix would stamp the mode `refund()` used on the WooCommerce refund record and
  prefer it on the read — **done as stripe-terminal#171, merged at `3471492`** (squash of
  `26d6840`; Paul: "continue"; Codex from a spec, stopped once at a 40-line budget and landed at
  52 of 70; `REFUND_MODE_META = '_stwc_refund_mode'`, `recorded_mode( $row, $refund_id )` feeds
  `mode_of()` and `key_for()`, stamp written BEFORE the POST, row's mode wins; six mutations
  caught; review confirmed WC's `save_meta_data()` leaves an untracked key alone, and noted HPOS
  compatibility-sync may drop the stamp from the posts backup copy only); (2) an offline Bluetooth
  payment settled by its forwarded webhook before the till's capture has NO refs
  (`missing_payment_ref`, an error, never a stuck pending) — Free's `Ledger::apply_transition()`
  replaces `provider_refs` wholesale, so the fix is Free's (merge refs on settle); needs a ticket.
  All worktrees removed; no wp-env running; Docker daemon untouched.

## Lessons recorded in memory

- wp-env forwards NO host env vars into the container (`getenv('CI')` is false there).
- PHPUnit with a directory argument runs zero tests in Free/Pro; always `--filter`.
- The post-merge worktree cleanup removes worktrees that sibling worktrees symlink into.
- BSD sed has no `\b`; Codex "resume" is a fresh session.

## Housekeeping

- Local branches `feat/95-conformance` still exist in Pro and SumUp (squash-merged remotely;
  `git branch -d` refuses, `-D` is guarded). Safe to delete.
- wp-env project for the conformance worktree removed by the cleanup script; Docker daemon untouched.
