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
- Mollie, Square and Payarc ports from the template.

## Lessons recorded in memory

- wp-env forwards NO host env vars into the container (`getenv('CI')` is false there).
- PHPUnit with a directory argument runs zero tests in Free/Pro; always `--filter`.
- The post-merge worktree cleanup removes worktrees that sibling worktrees symlink into.
- BSD sed has no `\b`; Codex "resume" is a fresh session.

## Housekeeping

- Local branches `feat/95-conformance` still exist in Pro and SumUp (squash-merged remotely;
  `git branch -d` refuses, `-D` is guarded). Safe to delete.
- wp-env project for the conformance worktree removed by the cleanup script; Docker daemon untouched.
