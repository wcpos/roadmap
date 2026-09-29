# Handoff: the Sales room on Reports (wcpos/roadmap#332) — 2026-09-29, 12:40Z

Written before a machine restart. Everything below is committed and pushed; nothing lives only in a worktree or a tmp directory. The scratchpad under `/private/tmp/claude-501/…` may not survive the restart; nothing there is needed to continue.

## Where things are

| PR | State | Merge commit |
|---|---|---|
| PR 1 shell, bar, date button, Free lock hint — wcpos/monorepo#2238 | merged into `next` | `cbde29c82` |
| PR 1b till strip — #2239 | merged | `309c5876a` |
| PR 2a hero (comparison state, chips, figure, companions) — #2241 | merged | `2093e7c8a` |
| PR 2b chart (instant-keyed buckets, comparison series, running total, toggle) — #2246 | **open**, waiting on CI (Lint and Merge Gate were pending at 12:35Z) and the first Codex/CodeRabbit pass | head `8efc9e3a4` |
| PR 3 cards, panels, unticking, Export, Print | not started | |
| PR 4 margin (Cost / Profit / Margin %, Brands card) | not started; see the COGS note | |

The split (PR 2 → 2a + 2b) and every landing note are comments on #332. Captures for each PR are in `docs/prototypes/2026-09-29-reports-shell-captures/` (`till-strip/`, `hero/`, `chart/`) and linked from the PR bodies.

## To resume

1. `git -C /Users/kilbot/Projects/monorepo-v2 fetch origin next`. The PR 2b worktree is `/Users/kilbot/Projects/monorepo-v2/.claude/worktrees/reports-sales-2b` on branch `feat/reports-sales-2b`, clean and pushed.
2. Own #2246 to merge: `gh pr checks 2246 -R wcpos/monorepo --watch`, then read the review threads (`gh api repos/wcpos/monorepo/pulls/2246/comments --paginate`), fix, reply at each thread's **root** comment id and resolve it, push, `@codex review` again (Codex reviews the head at request time; check its "Reviewed commit" line, a request posted right after a push can still review the previous commit). CodeRabbit rate-limits after a few reviews a day; `@coderabbitai review` once its window reopens, and if it stays limited, list the unreviewed commits in the PR body's Reviewers section and merge on green, as #2239 and #2241 did.
3. Merge with `gh pr merge 2246 -R wcpos/monorepo --merge --delete-branch`, post the landing note on #332, then `rm -rf` the worktree, `git worktree prune`, delete the local branch, and open `feat/reports-sales-3` off the new `origin/next` (`git worktree add -b … origin/next`, then `pnpm install --frozen-lockfile --offline`).
4. PR 3: write the brief from the ticket's §3–§5 and BUILD-BRIEF.md the way the 2a/2b briefs were written (Read first with what landed, the craft rules, the states to reach, the ledger lines, the tests by name, a 400 changed-logic-line budget stated per part). Codex reads the AGENTS.md ceiling as *changed* lines: if the cards, panels, unticking, Export and Print together exceed it, split into 3a/3b before sending and post the split on #332. Delegate with `codex exec -m gpt-6-astra -c model_reasoning_effort="high" -C <worktree> -s workspace-write -o <result.md> "Read <brief> and carry out the task it describes. … A type error in a test you have just written is ordinary work: fix it and continue. The only reason to stop is a Readiness failure as the brief defines it."`
5. PR 4 first change: the app's order schema names `cost_of_goods_sold.value` where dev-next's `wcpos/v2` line items actually carry `cogs_value` (`schemas/orders.ts:294`, orders and refunds). The value was null on dev-next because no product has a cost; proving the numeric flow needs a local wp-env with a product cost set, an order through the POS, and a re-read via `wcpos/v2`. Only one wp-env at a time on this machine (another session's `wp-env-refund-session-…` was running earlier).
6. After PR 4: close #332 with a landing comment listing the PRs and merge commits; add one clause to map #282's progress paragraph after the register clause; note on #333 that its app half is unblocked.

## What every PR here needed under review (write these into the PR 3 brief before Codex starts)

- **Shared table cells write query filters the chips do not show.** The orders table's Status, Customer and Cashier cells call `meta.actions.setFilter`; the reports table's `actions` now ignore `status` and `customer_id` and let `cashier` through (the chip mirrors it). Anything PR 3 adds that writes query state must be listed against every other writer of the same key.
- **A print or document path scoped to the session while the screen is scoped to a viewed store.** Store name, id, currency, separators, digit grouping, zone, register names, the cashier label and the status scope each took a round on #2241. `useReportPrint(storeId)`, `ZReport storeId`, `useRegisterNames(storeId)`, `useReportCashier()` and `useReportsData().totals` are the landed shapes; reuse them.
- **Readiness gating.** Model any "wait for X" as `waiting: 'store' | 'cashier' | 'registers' | null` with a terminal-failure state and a rule for when the gate does not apply, and show the reason beside the disabled control (`design.mdc` requires it).
- **Layout.** No page `ScrollView` around same-axis lists on tablet/desktop (Android takes the drags); on phone thread `nestedScrollEnabled` through `DataTable`; the short layout is chosen from the measured workspace (`onLayout`, 720 points); `h-[520px]`-style values fail the Uniwind contract test on Lint.
- **Secondary resources.** One `ReportsComparison` per group under a Suspense whose fallback keeps the primary content and an `ErrorBoundary` with `resetKeys` on the query. `useObservableState(source, [])` over `populate$` hides loading; use no initial value and a skeleton.
- The lint job also runs `scripts/check-react-compiler-smells.mjs` (a `useCallback` whose listed deps differ from what it reads fails it) and `pnpm --filter @wcpos/eslint-config test` (the Uniwind allowlist must shrink when a bare Suspense gains a fallback).

## Known environment facts

- `apps/main/e2e/reports-closures.spec.ts` cannot be run locally: its cold-login path (an unsaved state name, so every test logs in fresh) ends on the connect screen reading "No stores for this user" while the cashier API returns three stores, on the branch and on an unchanged `origin/next` alike (checked 05:10Z on a second worktree). Recorded on #2239, #2241 and #2246 as Not evaluated and in memory (`local-e2e-run-traps-2026-09-12`). The cached-state throwaway walk (`hydrateAuthenticatedPage`) still boots and is the live proof; web E2E is skipped on `next` PRs in CI.
- A local Metro for a worktree: `npx expo start --web --port <n>` from `apps/main` (ports 8091–8095 were used today; 8093 was taken by another session's Metro). Playwright against it: `BASE_URL=http://localhost:<n> E2E_STORE_URL_PRO=https://dev-next.wcpos.com npx playwright test <spec> --project=pro-authenticated --workers=1`.
- The jest gates for this area: `NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir packages/core exec jest src/screens/main/reports src/services/register-session --maxWorkers=2`, one suite at a time. A `useReportsData` mock that returns a new object per render loops the Z-report template tests (a 260 MB log and an OOM-killed worker); memoise it.
- Codex stops: it applies the house "ask rather than guess" rule to its own fixture errors unless the prompt says otherwise, and reads the AGENTS.md line ceiling as changed lines.

## Memory written today (in `~/.claude/projects/-Users-kilbot-Projects-roadmap/memory/`)

`codex-review-loop-on-scoped-ui` (three data points now), `spec-readiness-checks-before-codex` (checks 11 and 12), `local-e2e-run-traps-2026-09-12` (item 4), plus earlier `next-web-boot-broke-after-sdk-58`, `button-is-a-column-unless-told-otherwise`.
