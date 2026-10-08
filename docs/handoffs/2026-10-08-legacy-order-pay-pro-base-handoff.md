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
