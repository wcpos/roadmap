# Handoff — 2026-09-30, the v2 line, R5 rehome and the Settings switch

## State at close

| Item | State | Where |
|---|---|---|
| Releases after 2.0 | #225 → **v2.1.0 — Fiscal compliance** (due 2026-12-31); #226 → **v2.2.0 — Works with your other plugins** | wcpos/roadmap#396 → `main` `adac08cd`; the plugin repos' `Compliance / Fiscalization` and `v1.11.0` milestones are drift for the sync |
| R5 PR 1, the rehome | **landed** | wcpos/monorepo#2332 → `next` `63e124800`; #397 closed |
| Screen switch 10, Settings | **landed** | wcpos/monorepo#2343 → `next` `6b0bf9d17`; #398 closed; captures in `docs/captures/2026-09-30-settings-switch/` |
| Form re-bind echo writes (found on the walk) | **landed** | wcpos/monorepo#2349 → `next` `aba41f387` |

## What is left on the UI overhaul (landing order #292)

1. **The tail**: health, support, logs, the product editor — each its own switch spec; health and support still render the legacy header. Health's rail keeps its old treatment through `NavigationSurfaceContext` (no `barTestID`).
2. **R5 PR 2** (strike header lines 1–5 and 22; the upgrade strip becomes one string) — can be filed now. **R5 PR 3** (delete `components/header`) after health and support switch; the sm/md drawer's bell item goes with it (header line 21).
3. **R9**: the last `toggle-group` caller is `pos/products/cells/variations-popover/buttons.tsx`.
4. **Promotions** (§1 step 6).
5. Open on #398: Saved marks for Printing's template routing and the Customer display controls (no form on either page).

## What every delegated run here needed (add to the next brief)

- **Never `git mv` in a Codex brief** — the index is outside the sandbox; plain `mv`, the orchestrator stages (readiness check 20).
- **Grep a shared layout's other consumers before making it do something new** — `NavigationAreaLayout` is Settings *and* Health (check 21).
- **The `independent-review` commit status gates `next`** — a fresh Opus reviewer session posts the verdict comment and the status; the author never does (memory `independent-review-status-gates-next`). Both bots were capped all day; the CLI `codex review` was the second opinion, not the gate.
- **Codex counts the soft budget as the stop** — a "stopped at N/260" resume with "the budget is 380" finishes the run.
- **`fill()` on a settings input reverts** — the reactive `values` re-bind; type instead. The same re-bind echoes a change per normalised field (now skipped in the hook, #2349).
- **The Uniwind allowlist ratchet** fails Lint on any class outside it (`whitespace-nowrap` did); the eslint-config script tests run locally with `node --test tests/*.test.mjs` in `packages/eslint`.
- **dev-next latency**: the app's HTTP timeout is 15 s; when `/wp-json/wcpos/v2/site` answers in 18 s the E2E setup dies at Connect and looks like a code fault. Poll for two fast answers before a captures run.

## Also this session

- The review bots' `Test-Removal:` guard fires on moved tests; a line in the PR body and a commit message clears it on the next push.
- Memory: `release-status-starts-from-the-handoffs` (this morning's miss), `independent-review-status-gates-next`, readiness checks 20–21; `MEMORY.md` compacted.
