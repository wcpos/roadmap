# Overnight handoff: the action-event contract, 2026-10-09

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
