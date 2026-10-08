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
- **Stripe #149** merged to `main` at `a4b8e1b` and **#163** (open, `next`): PaymentIntents use
  `allowed_payment_method_types`, the parameter Stripe API 2026-09-30.endive (stripe-php 22)
  requires. Another session had already reverted `main` to stripe-php 21, so no release carried
  the break.
- **Stripe, still to do:** conformance transcripts under wp-env (Stripe's CI is plain PHPUnit
  with Pro stubs; the job needs the sibling-Pro shape Mercado Pago's has).
- **SumUp #52** (`next`, open, approved at `feb06ad`, then the two Low findings taken at
  `75e0aa5`): the Pro gate at 30 and the web-checkout removal; SumUp has no Blocks and no MOTO,
  and no PHPUnit, only `tests/regression/*.php` scripts plus phpcs on a file list.
- **SumUp PR B, designed, not started:** no MOTO carve-out, so the old order-pay panel goes
  entirely: `payment_fields()` → `wcpos_pro_order_pay_panel()` after the description;
  `enqueue_payment_scripts()`, `assets/js/payment.js` and the `sumup_create_checkout`,
  `sumup_cancel_checkout`, `sumup_check_payment_status` AJAX actions deleted; `process_payment()`
  → `is_paid()` short-circuit then `wcpos_pro_order_pay_process()`; no `process_refund` exists
  (refunds are Pro's through the provider). Keep `sumup_pair_reader`/`unpair` (settings page) and
  the legacy admin-ajax `sumup_webhook` with an adopted-intent skip. **Adoption** (Stripe's
  shape: boundary, pass-start time, Free `Order_Lock`, fresh read): in flight means
  `_sumup_checkout_status === 'PENDING'` with a transaction id (the old panel's
  `client_transaction_id`) and `needs_payment()`; the action reference is
  `_sumup_reader_id . ':' . transaction_id`, which `SumUp_Server_Provider::fetch()` understands;
  without the provider's `checkout` marker fetch() never calls a leg cancelled on its own, so an
  adopted attempt is captured when its transaction appears or voided at the deadline, never
  wrong about money. The old panel never calls `payment_complete()` from its webhook alone (the
  old JS did it through the form submit), so adoption is what sees a mid-flight attempt through.
  Regression scripts to rewrite: `payment-interface-contract.php`,
  `process-payment-requires-success.php`, `payment-status-*.php`.
- Then the Mollie, Square and Payarc ports from the template.
- **Order of the rest:** Mercado Pago live first (Paul opens the seller account; Windcave is not
  a priority), Stripe PR B then conformance PR, SumUp the same way, then Mollie, Square, Payarc
  ports from the template.

**Two defects found on the way:**

1. **The Pro gate ran before Pro existed.** Every extension on `next` hooked its `wcpos_pro_requires()` gate at `plugins_loaded` priority 11, but Pro's `Activator` runs at 20 and that is what requires `wcpos-pro-functions.php`. So Mercado Pago #13 and Windcave #13 as merged this morning registered nothing on a Pro 2.0 site: notice shown, no provider, no gateway, no adoption. Their gate tests passed because they called `init()` from inside a test after Pro had loaded. Found by the independent review of wcpos/stripe-terminal-for-woocommerce#148, which had copied the bootstrap. Fixes, each a one-line move to priority 30 plus a test that pins it: Stripe #148, wcpos/mercadopago-terminal-for-woocommerce#14, wcpos/windcave-terminal-for-woocommerce#14, template `7426d0f`. Nothing reached merchants; both extensions are `next`-only.

2. **stripe-php 22 breaks PaymentIntent creation.** The Dependabot bump (#143, merged to Stripe's `main` today, unreleased) pins Stripe API `2026-09-30.endive`, which removed the writable `payment_method_types`; every Terminal and phone-order intent would fail with `payment_method_types_no_longer_supported`. The SDK sends its pinned version on each request, so this is independent of the merchant's own API version. Fix on `main`: wcpos/stripe-terminal-for-woocommerce#149 (`allowed_payment_method_types`, which now accepts `card_present` and `interac_present`); the live smoke job that was red on `main` is green on the PR. `next` was reverted to stripe-php ^21 separately and is unaffected until it bumps.

**Stripe on `next`, status:** #148 (Pro-only gate at 30, web checkout removed, E2E site runs Pro via the org bot token) awaiting its CI run after merging `next`; PR B (POS order-pay onto Pro's panel with the MOTO carve-out, legacy adoption) is briefed and starts when #148 merges; conformance transcripts are a third PR because they need Pro's suite under wp-env, which Stripe's plain-PHPUnit CI does not have yet.

## Not done

- Slices 5–8: Mercado Pago 1.0.0 on `next` (first real fixture through the conformance suite),
  Windcave 1.0.0 + the downstream CI job, the extension template repo, app-side prompt rendering.
- A dev-next `sim-prompt` reader; a browser/webview run of the order-pay panel; a real
  admin-post request against the bundle download.
- Live WisePad 3 money-leg proofs — need Paul's test card and iPhone.

## Lessons recorded in memory

- wp-env forwards NO host env vars into the container (`getenv('CI')` is false there).
- PHPUnit with a directory argument runs zero tests in Free/Pro; always `--filter`.
- The post-merge worktree cleanup removes worktrees that sibling worktrees symlink into.
- BSD sed has no `\b`; Codex "resume" is a fresh session.

## Housekeeping

- Pro local branch `feat/95-conformance` still exists (squash-merged remotely; `git branch -d`
  refuses). Safe to delete.
- wp-env project for the conformance worktree removed by the cleanup script; Docker daemon untouched.
