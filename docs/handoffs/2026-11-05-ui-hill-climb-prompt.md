# UI hill climb for a 2.0 cashier journey

**Date:** 2026-11-05. **Map:** [2.0 journeys: docs, E2E and the cashier soak](https://github.com/wcpos/roadmap/issues/512). **First run:** [UI pass on J2](https://github.com/wcpos/roadmap/issues/550), the proof of the method; a pass for the other journeys is ticketed only after that verdict. **Why this file:** Paul (2026-11-05): *"seeing as though we are doing these cashier journeys and updating the docs and generally going over the app with a fin-tooth comb - we should also incorporate a UI pass (or several passes) while we are doing it."* The journeys land a captures caller that reshoots every screen state from a manifest, which is the baseline and the per-round reshoot a climb needs, so the pass rides each journey: after the module and captures caller are on `main`, before the page's final shoot.

Two blocks. Paste **Block A** to the orchestrating session (one per journey, fill the `<...>` fields). The orchestrator pastes **Block B** to each judge, verbatim, and never adds the target score to it. The method is Theo's council loop (*Agents Sucked At UI Until Today*), trimmed to the two providers we run and bound by the standing rules on roadmap#512.

**The judges find and rank; Paul judges.** Taste is not delegable here (the printer flow of 2026-09-05: *"It works but it looks like shit"*; the Void button: a favourite named and *"do better"* means fix the craft, not re-open the structure). The climb's PR is held for Paul with before/after pairs and is never merged under standing authority. When he rejects a screen, the next artefact is a board of structurally different directions, never another round of polish.

---

## Block A — orchestrator prompt

```text
You are running a UI hill climb on the screens that journey <J#> <journey name> shows a cashier on 2.0 web, for roadmap#<ticket>. Read roadmap#512 and roadmap#513 first, then the UI rulings: monorepo `.claude/rules/design.mdc` and the Design section of monorepo `CODING_STANDARDS.md` it points to, the numbered decision list in roadmap `docs/prototypes/2026-09-12-language/README.md` (PR #281 branch), and the Decisions on roadmap#282. Those rulings decide layout and behaviour; this climb polishes what is already ruled. It never re-decides a ruled layout, never removes a control, option, state, setting or prop to raise a score, never changes a testID or any E2E selector, and never widens a perf gate. If a judge's finding needs any of those, log it under "Needs Paul" and move on. If a finding is a bug (the app disagrees with a ruling), file a monorepo issue per the conflict protocol on roadmap#526 and leave it out of the climb.

## Setup
1. Worktree off `origin/main` in wcpos/monorepo, branch `ui/journey-<J#>-polish`. Write the brief's budget (600 added production lines) to `~/.claude/state/pr-budget/<branch>` before any edit.
2. Baseline captures: run journey <J#>'s captures caller (`CAPTURES=1`) from a local web build of the unchanged branch (Metro + Playwright; the local taste-pass recipe in memory) against dev-pro, which carries the showcase seed (roadmap#532). Never demo, never a fourth store, one suite at a time, `--maxWorkers=2`. Shoot light and dark, desktop and the smallest supported width. Keep these as `round-0/`.
3. Anchor set, fixed for the whole climb and shot once: the same journey moments in Square for Retail, Shopify POS and Lightspeed Retail. Use `~/Projects/WooCommerce POS Competitors` if that folder exists on this machine (it does not exist on the MacBook); otherwise Mobbin (business apps are on its web platform; token in the keychain) or the products' public demos. Anchors never change between rounds.
4. Rubric categories, scored 1–10 each, half points allowed:
   hierarchy · typography · spacing and alignment · colour and contrast (light and dark judged separately) · iconography and indicators · consistency across surfaces · clarity for the average cashier (is every control obviously a control, is every label the word a cashier would use) · density (complexity hidden, not removed).

## Judges
- Codex, pinned `-m gpt-6-astra`, effort high. Opus 5.5 via the Agent tool. Each judge runs in a fresh session every round with Block B and nothing else: it sees the round's captures, the round-0 captures, the anchors and the rubric. It never sees another judge's scores, the previous round's scores, or the stop condition.
- Stage by scarcity: run Codex alone each round until Codex has every category at 9.0 or above. Only then add Opus. Never wait on a judge that has stalled for more than 20 minutes; score the round without it and say so.
- Ask every judge for the score table AND its three highest-leverage findings, each tied to one capture and one category. Findings are the work list; scores are the gauge.

## Loop
- A round is: apply the findings → rebuild → reshoot the same capture set → judge. Fresh judge sessions every round. Record every score, including the anchors' scores, in `rounds.md` as one table per round. Anchor scores drift between rounds; use them as relative reference only, never as a goal.
- A score can go down. If any category falls, revert that round's change for the category before adding anything new, then continue.
- Stop when every active judge has every category at 9.0 or above for two consecutive rounds, OR at round 8, OR when the branch reaches 500 added production lines. On a line stop, open the PR with what is green and report the remaining findings; never raise the budget yourself.
- Taste bounds from Paul, which outrank any judge: the palette is neutral and muted; colour appears only where it carries meaning (a destructive action, the Paid moment, a live indicator); in the app primary stays blue and red is destructive only. If the climb drifts grayscale, restore meaningful colour; if it drifts decorative, strip it. Hide complexity, never remove it. A judge that rewards fewer controls is wrong on that point.

## Output
- One PR, journey <J#> only, body in the monorepo template, held for Paul: never merged under standing authority, no `claimed:` merge. Add a "## Walked" section listing the capture set shot on the final build. Attach, per change, an annotated before/after pair with arrows and a one-line label of what moved. Put the full `rounds.md` table in the body under a "## Rounds" section, so the evidence travels with the PR Paul reviews. Nothing else in the body: no deferred list, no questions.
- Resolution comment on roadmap#<ticket>: the verdict on the method. Which findings held up against Paul's eye once he has looked and which did not, rounds run, production lines used, what the rubric missed.
- Final message, in this order: "Decisions I made without you" (every taste call that was not in a ruling), Blocked on you, Dangling, Changed, Found, then `Safe to exit`. Put the full `rounds.md` table under Changed. Any finding that needed a ruled layout to change, a control to go, or a testID to move goes under Blocked on you as one question with options and a pick.
```

---

## Block B — judge brief (the orchestrator pastes this verbatim; add nothing)

```text
You are reviewing screenshots of a point-of-sale app used by cashiers in small retail stores. You are read-only: you score and report, you change nothing.

You are given:
- `current/`: the screens under review, light and dark, two widths.
- `baseline/`: the same screens before this round of work.
- `anchors/`: the same moments in three other point-of-sale products. Score these too, in the same table, so the numbers are comparable.

Score every screen set (current, baseline, each anchor) from 1 to 10 in each category, half points allowed. 10 means you could not improve it; 5 means a competent designer would redo it. Judge dark mode and light mode as separate colour-and-contrast rows.

Categories: hierarchy · typography · spacing and alignment · colour and contrast (light) · colour and contrast (dark) · iconography and indicators · consistency across surfaces · clarity for the average cashier · density.

Rules for scoring:
- Compare before you score. Look at the anchors and the baseline first, then the current set.
- Clarity means a cashier who has never seen the app knows what every control does from the screen alone, and every label is the word a cashier would say out loud.
- Density rewards complexity that is present but tucked away. Do not reward a screen for having fewer features; penalise a screen that has made something harder to reach.
- Colour is a signal. A muted interface with colour only on the elements that need attention scores higher than a colourful one. Do not penalise restraint; do penalise a screen where a state change or an action is invisible because nothing marks it.

Return:
1. The score table: one row per category, one column per screen set.
2. Your three highest-leverage findings for `current/`, each naming one screenshot, one category, what is wrong, and the smallest change that would fix it.
3. Nothing else. No overall verdict, no praise, no summary.
```

---

## What this takes from Theo, and what it changes

- **Council of judges, fresh each round, findings as the work list and scores as the gauge.** Kept. Two providers instead of three, because Codex Astra and Opus are the two we run.
- **Anchors.** Kept, and made stricter: the anchor set is shot once and frozen, because his anchors' scores drifted upward with unchanged screenshots. Anchors are a reference, never a target.
- **Judges never learn the target.** His suspicion that "9.5" in the prompt biased sub-agents becomes a rule: Block B carries no stop condition, no previous scores, no other judge's view.
- **Stage by scarcity.** His "Soul first, then Opus, then Muse" becomes Codex first, then Opus, with a 20-minute stall rule in place of "don't let Gemini delay you".
- **Scores can fall; stabilise before the next move.** Kept as "revert the category's change before adding anything".
- **Annotated before/after images.** Kept, one per change, in the PR body.
- **The human taste instruction.** His was "restore some colour". Ours is Paul's: neutral palette, colour as signal, hide complexity never remove it. Written as a bound that outranks the judges, because the drift he hit will happen here too.
- **The human as the last judge.** Added. His loop merged on the judges' word; ours holds the PR for Paul, because taste is not delegable on this project and a rejected screen gets a directions board, not round nine.
- **Fork and keep the mergeable PR.** Replaced by the monorepo rules: one journey per PR, 600-line law with a 500-line stop in the brief, round-8 cap, no budget lift by the session, no testID or capability changes.
- **Dropped.** The jester; the 10-of-10 round (9.0 twice in a row is the bar, because 9 to 9.5 cost him ten rounds for a change he could barely see); the open-ended "keep climbing" that ran 18 hours.

Adapting it for the docs "simple" sweep (roadmap#526): same two blocks, with the judge given the page as a non-technical cashier would read it, the J2 "Checkout in Detail" shot as the anchor, and Paul's J2 review points as the rubric.
