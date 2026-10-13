# Overnight handoff: the action-event contract, 2026-10-09

> **Morning update (Paul: "Do as you recommend. If you're happy you can merge it."):** Q1–Q7 taken as
> recommended. **Slice 1a merged** (wcpos/monorepo#2454, `d3ce5cc1`). **Slice 1b merged**
> (wcpos/monorepo#2455, `8dbeecee`) after four review rounds that added refusal presentation,
> a row per strike, a `category` option on `ctx.log`, a silenced log for a settled hook and
> numeric-string hardening. **Slice 2 merged** (wcpos/monorepo#2457, `1aae847f`): `checkout.tender.commit`
> dispatched from `takeTender` inside the order queue, `register.gate` + `session.gate` as guards
> (gate reads through `findOpenSession`, the handler writes), `requiredGuards`, amounts not
> rewritable in v1, a stale-balance refusal, the cash writer consuming the stamped ids; five
> independent review rounds, LEDGER 19–22. CI lesson: the Logs event-label scanner reads dotted
> literals in `pos/checkout` as log types, so the event name and guard ids are constants in
> `extensions/actions/types.ts`. **Slice 3 merged** (wcpos/monorepo#2458, `b1cd0b55`): `checkout.complete`
> around `finishSale`, the audit observer as the first extension-tier hook, `completeSale` taking
> the caller's queue context, and the gate's stamped session id binding in the tender handler
> (LEDGER 23–24); approved first round. The v1 event list is closed. **Slice 3b merged** (wcpos/monorepo#2459, `b1dfc018`): the strike
> rows carry `actions.hook.timeout` / `.failed` / `.disabled` with registry labels, and the §4 write
> fence is a ratcheting scanner with a 16-file allowlist under `packages/eslint` (spec §4 amended;
> four review rounds, one past the stated stop rule because round two's fix regressed the
> `engine.write` match). **All build slices of the contract are on `next`.** Spec §11 live checks run on
> dev-next (bundle from `b1dfc018`, Paul's "do as you recommend"): the over-stock add is refused with
> today's toast (verified), a cash sale's audit row carries the actor and `hookIds: []` (verified,
> order #113034), the no-session refusal is NOT exercised live because every dev-next register has
> an open session the E2E suite relies on (unit-covered). Electron waits for the promotion build.
> Q7 ruled (keep: a switched-off hook stays off until restart). **2026-10-12:** on Paul's call
> for the complete shape rather than a tidy-up, wcpos/monorepo#2464 merged at `9d4b9844`: the
> gateway-contract checkout and the pay page dispatch `checkout.tender.commit` through
> `commitGatewaySale`, `prepareSale`/`gateSale`/`useCartStockGuard` are deleted, the two tender
> gates are the only register and session rules (LEDGER 26 meets line 19). **Later on 2026-10-12**
> (Paul: "start work on all of these", "as you recommend" on void): the cart domain landed in three
> PRs, A #2468 (`cart.line.remove`, fee and shipping edits on `cart.line.update`), B #2471
> (`cart.coupon.apply` / `cart.coupon.remove` through one writer), C #2473 (`cart.customer.set`
> through one writer, the link bridge's stamp as a system action); the void was extracted (D #2472)
> and admitted as `cart.order.void` with a `payments.gate` that refuses a void with live or captured
> legs and an `order.voided` audit row (E #2476, merged at `75ddff0b`); F
> #2477 made every queued cart writer land on the saved record a first add left on the slot. The
> fence allowlist went from 16 files to 6. Every PR had a fresh Opus review with mutation checks;
> the reviews found and the PRs fixed: a coupon race (validated against a cart that moved while
> waiting in the queue), a form overwriting an existing shipping address with `{}`, a refused void
> writing a "voided" row, a session resolver that throws when sessions are on and none is open, and
> a remembered record outliving a closed database. **Later still on 2026-10-12** (Paul: "start the
> rounding work", "do as you recommend", "merge both when green"): cash rounding (#66, #84) landed as
> the first REWRITING consumer, G1 wcpos/woocommerce-pos#2180 (merged `837e985f`: a Rounding select on
> the cash gateway's POS-settings modal, served as `defaults.rounding`) and G2 wcpos/monorepo#2484
> (merged `457268a4`: the `cash.rounding` hook rewrites the tender amounts, the handler derives every
> fact from the payload, a non-taxable "Rounding" fee line moves the stored total by its own money,
> the pane previews the rounded due through the same predicate, the void sweep drops the fee of a
> voided, failed or never-recorded row). Four review rounds plus Greptile and CodeRabbit; the one
> judged-not-changed edge is a stale local ledger after a failed mirror AND a failed refresh AND a
> cancel on a completed sale (half an increment at most). #66 and #84 closed. Nothing else is open on
> #421; the no-session refusal can be seen live on a local wp-env store if ever wanted. Rounding is
> not verified live: it needs the next `next` bundle and plugin release on dev-next. **Late on 2026-10-12** (Paul: "grill #62", "go"): checkout **2026-10-13 (Paul: "I want you to fix the issues if they're real issues"):** the two reopened-order stock defects reported under Found after #62 were fixed in the same run, not parked: wcpos/monorepo#2492 merged on `next` at `9b81a8af9` (the add guard and the raise path net `_reduced_stock` through the gate's helper; a split shares the reduced units across its halves in whole units). Rule strengthened in `~/.claude/CLAUDE.md`: Found is not a parking lot. **Later on 2026-10-13 (Paul: "as you recommend" ×5, "yes"):** the commands primitive v1 (roadmap#428, grilled R1–R5, spec `docs/specs/2026-10-13-commands-primitive-spec.md`) landed on `next` in three PRs: wcpos/monorepo#2509 at `a231ebdd2` (the primitive: registry, command context, registered surfaces), #2518 at `3e04c05ce` (the void path to the cart column), #2521 at `ed456694f` (keyboard hotkeys, #65 closed: eight Alt/Option chords and the `Alt+/` help sheet, live only on the focused screen). Proven live from the PR preview (captures `docs/captures/2026-10-13-commands-hotkeys/`); the live proof found a pre-existing void defect (a store-refused void kept as pending left its lines in the cart and a permanent "Save refused"), fixed in the run as #2525 at `0248c3dec`. #72 (change of cashier) ruled a sales-attribution field for a 2.x train, answered on the ticket. The extensibility map #120 carries the charter and the landing.
> conditions (#62), the spec's slice 4 and the first feature consumer, was grilled (train 2.0; no core
> setting for a required note, "something extensions can tap into"; conditions are data, one evaluator,
> one guard; cart state A from a four-variant board) and landed as wcpos/monorepo#2489 (merged `5158ed2c`):
> the stock condition riding `prevent_overselling`, the amber notice in the banner's slot, the line mark,
> Checkout dimmed and never silent, `conditions.gate` as the third tender guard. Three fresh-review rounds
> (a reopened order's `_reduced_stock` double count and a 1.48:1 dark-mode mark were the blockers) and a
> live capture from the PR preview against dev-next (which found the notice box growing to its cap, fixed
> in round 3; captures in `docs/captures/2026-10-12-checkout-conditions`). Spec
> `docs/specs/2026-10-12-checkout-conditions-spec.md`. #62 closed. Not evaluated on native. Pre-existing,
> not filed: `splitLineItem` copies `_reduced_stock` onto both halves. The table below is the overnight
> state before these merges.

Paul went to bed after "Continue" on the #421 proposal and asked for the work to carry on
overnight. This is the morning state. Read the questions first; everything else is done or parked.

## Questions for the morning (all on [#421](https://github.com/wcpos/roadmap/issues/421), each a comment)

- **Q1** The session gate guards `checkout.tender.commit`, not `checkout.complete`; the
  provenance stamp is the writer's, not a guard. (The spec assumed both lived in sale completion;
  the code runs them in the tender flow before the leg.)
- **Q2** The tender commit runs inside the order's mutation queue (a cart edit queues behind a
  manual leg's POST for its duration).
- **Q3** Slice order became: 1a primitive → 1b stock guard → 2 tender commit → 3 sale completion.
- **Q4** Land the primitive alone (1a), or hold it and review 1a + 1b as a pair?
- **Q5** **R3 reversed:** extensions run first, guards last. Guards outermost meant no guard saw
  an extension's rewrite (an extension could rewrite a quantity after the stock guard passed it).
- **Q6** Two consequences of Q5: budgets are **per tier** (a slow extension could otherwise starve
  a guard into timeouts and disable it), and **once `next` was called the chain's answer stands**
  (an extension's after-work could otherwise replace or lose a guard's refusal).

If any of Q1, Q2, Q5 or Q6 is wrong, say so before slice 2 starts; the branches are cheap to
change at this point.

## What exists

| Thing | Where | State |
|---|---|---|
| Ruling R1–R8 | #421, resolution-rows comment | ruled 2026-10-09 ("Continue"), amended by Q1–Q6 |
| Spec | `docs/specs/2026-10-09-action-event-contract-spec.md` (roadmap `main`) | current, amended four times overnight |
| Peer research | `docs/research/2026-10-08-apps-with-a-similar-stack-and-goals.md` | committed |
| Consumer survey | #421 charting comment | the three hand-wired chains and the planned consumers |
| **Slice 1a, the primitive** | [wcpos/monorepo#2454](https://github.com/wcpos/monorepo/pull/2454), branch `feat/action-events-primitive`, head `387629ad` | **approved**: `independent-review` status posted after five fresh-Opus rounds and three bot rounds; every thread answered and resolved; CI was still finishing Unit Tests when this was written; **not merged** (Q4) |
| **Slice 1b, the stock guard as the first hook** | branch `feat/action-events-stock-guard` (pushed), stacked on 1a, **no PR** (stacked PRs are blocked in this org until 1a merges) | 19 suites / 218 tests, typecheck, lint and `translations:check` green; mutation check fails five tests with the refusal removed; 324 non-test lines; not independently reviewed yet |
| Slice 2 brief | scratchpad `codex-slice2-brief.md` (not in a repo) | written against the corrected placement; waits for Q1/Q2 |
| Worktrees | `~/Projects/monorepo-v2-worktrees/action-events-primitive`, `…/action-events-stock-guard` | both clean, both pushed |

## What the review rounds changed in the primitive (all in the module LEDGER, lines 7–15)

Extensions first, guards last · a budget per tier · the chain's answer stands after `next` ·
no timer for a hook that called `next` synchronously, and a hook's timer stops at `next` ·
after-work has a budget of its own · a disabled guard refuses, a disabled extension is skipped
(including mid-flight) · a rewrite is cloned before `next` is recorded · `e`, `ctx` and every
refusal are frozen · the context clock is a closure so fake timers drive the budgets · the
dispatch awaits the inner chain even when a hook returns early.

## Where to click

1. #2454: read the PR body's "Design decisions" and "Review rounds"; the LEDGER in
   `packages/core/src/extensions/actions/` is the short version of why each rule is what it is.
2. Decide Q4. If "land 1a": merge #2454 (admin merge is not needed; the status is on the head),
   then I open the 1b PR from its branch and get it reviewed. If "pair": say so and I open 1b as
   a draft against 1a's branch for reading only.
3. Answer Q1/Q2/Q5/Q6 or let them stand; slice 2 starts on your word.

## Not verified

- Live behaviour of 1a + 1b in the running app (web or Electron). The jest suites that render
  the cart cells and the add/update hooks are green; no local Metro run was made overnight.
- 1b has had no independent review yet (it has no PR to hang one on).

## Lessons recorded

Memory `action-event-primitive-review-lessons` (the rules above, and that Codex stalled three
times on 1a and once on 1b: a stale lockfile warning, its own type casts, a self-set budget, a
guessed path; the primitive itself was faster to finish by hand).
