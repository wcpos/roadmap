# Handoff: the search-heap long-task gate on 2.0, 2026-11-03

**Repo:** `wcpos/monorepo`, lane **`main`** (2.0 beta; branch worktrees from `origin/main`, PRs target `main`).
**Spec:** `apps/main/e2e/search-heap.spec.ts`, test *committed searches neither retain per keystroke nor block the
main thread*. Its long-task gate (`LONG_TASK_BUDGET_MS = 2_000`: the sum of main-thread long tasks over 30
type-and-delete cycles of the word `brake`, 300 committed searches) is **quarantined** for the beta in
`apps/main/e2e/quarantine.json` as group G7, both projects (#3216, merged 2026-11-03 11:41Z as 96e7ee267). A
quarantined test is `fixme` on PR and push runs (`apps/main/e2e/quarantine.ts`); it runs only under
`E2E_QUARANTINE=only`.
**Owner ruling (Paul, 2026-11-02, on the beta gates):** *"Just lift for the moment, it's a fucking beta."* The lift
is the quarantine; the 2,000 ms target was not widened and never is (owner ruling on #2284: quarantine, never
shorten or widen). The weekly `E2E_QUARANTINE=only` run (Deploy workflow cron, Sundays 22:17 UTC) is meant to report when it
passes again. **It cannot today:** `deploy.yml` pins the scheduled checkout to `next` (lines 164, 275, 419, 919) and
sets the lane to `next` (line 126), and `next` was deleted until the GA re-cut (#3218). The first Sunday after the
deletion is 2026-11-08. The repoint to `main` (lane `main`, stores dev-free/dev-pro, the refuse-step at line 95 and
the "no main group" concurrency comment at line 153 updated with it) is its own PR; until it merges, measure with
a dispatch or a PR run as in §2.

The job this doc hands over: **find what makes the 2.0 web build spend 4–13 s on the main thread across 300
searches on some jobs and under 2 s on others, fix it, and lift the G7 entries before GA.** This is perf work on an
interaction, so it ships under the interaction-freezes ruling (one project, never an opportunistic perf PR):
`~/.claude/projects/-Users-kilbot-Projects-monorepo-v2/memory/ruling-interaction-freezes-are-one-project.md`.

## 1. What is known

### The gate is bimodal per job, not per tree

Every reading since the 2.0 promotion (2026-11-02), lone jobs unless stated, dev-free / dev-pro at 2.0:

| When (UTC) | Run / head | free (ms) | pro (ms) | Notes |
| --- | --- | --- | --- | --- |
| 11-02 20:15 | rerun of 41472588456, one shard | 845 | 1,867 | pass |
| 11-02 22:0x | lone rerun | 845 | 1,867 | pass |
| 11-02 23:50 | 41548499724 (21716e151) | 5,225 / 7,560 / 12,763 | 8,441 / 6,179 / 3,764 | fail every attempt; two PR runs overlapped the tail |
| 11-03 02:19 | 41565438333 (62417392d) | 6,395 / 7,701 | 4,444 / 8,000 | fail every attempt |
| 11-03 03:32 | 41572770186 (e29a022a1) | 979 | 595 | pass |
| 11-03 04:50 | 41580428195 (e702975bf) | 4,773 / 7,647 / 7,069 | pass | fail every attempt |
| 11-03 09:20 | lone rerun of 41580428195, shard 6 only, nothing else on the repo | 5,132 / 7,947 / 8,022 | 2,748 then pass | fail |
| 11-03 ~12:00 | 41629521100 (96e7ee267, gate quarantined) | n/a | n/a | main fully green |

Seven lone jobs on 11-02/03 read 0.6–1.9 s on both projects and passed first time; on the red jobs the free leg
read 4.5–13 s on every one of its three attempts. One reading sits in between: the 09:20 job's pro leg read 2,748 ms
and then passed on its retry (the first pro attempt of that job is the only intermediate value in the table). The head
made no difference (e29a022a1 green, e702975bf red twice, and the only commit between them is a test-only
sweep). Under overlapping full runs it fails almost always. The heap gates (ceiling, retained-after-GC ≤ 1.25,
DOM nodes ≤ 1.5) passed on every one of those runs: **this is main-thread time, not retention.**

The 09:20 lone rerun is the most useful data point: free and pro ran on the **same runner** in the same job,
free read 5–8 s on three attempts and pro 2.7 s then passed. So the mode is not purely the runner. Whether it
is store-shaped (dev-free carries more products than dev-pro?), renderer-shaped (a Chromium state that
persists across Playwright retries in the same worker), or a cold-cache effect on the first project is the
open question. Nobody has yet captured a CPU profile from a red job.

### Where the main-thread time goes (measured once, on `next` 2026-10-22)

CPU profile of search cycles 6–10 on dev-next (run 39691629238, branch `probe/search-heap-cpu-profile`,
ea27d90a0): React render 31–37 %, GC 12–22 %, program 12–15 %, React commit/effects 2–8 %, RxJS subscribe/next
5 %, RxJS unsubscribe 3.5–4.3 %, RxDB `toJSON` 3 %. **No FlexSearch, query-translation or SQLite frames**: the
search runs in the worker; the main thread's cost is re-rendering the results list (react-native-web Views),
per-row `useRecordField` subscriptions built on mount and torn down on unmount, and `doc.toJSON()` flat clones per
emission in `packages/query/src/records/use-record-field.ts`. Long tasks on that run: 3,103 ms on attempt 1,
1,132 ms on the retry, i.e. the same two modes, a month before the promotion. Full numbers:
`memory/search-heap-live-profile-is-render-churn-not-retention.md`.

The results-commit measurement from #2080 (2026-09-16) agrees: each keystroke costs 0.2–1.3 ms, the repopulation
commit after the term clears costs 18–27 ms, of which React render ~15, record reads ~10, GC ~9, a forced
style+layout from `useOnEndReached` reading `scrollTop` in a passive effect ~5. `memory/search-jank-is-the-results-commit-not-the-input.md`.
Open issue for that commit: wcpos/monorepo#2085.

### What has been ruled out

- **Store backlog.** dev-free carried 3,990 leaked probe coupons until 2026-11-02; the startup sync paged them
  serially and starved every demand request. Deleted on the box and swept by #3212. The 11-03 readings above
  are all after the purge (78 coupons on dev-free, 90 on dev-pro).
- **Cross-run contention.** The 09:20 rerun ran with nothing else on the repo and still read 5–8 s.
- **The gate's own method.** The heap-trend gate was dropped in #2846/#3103; the long-task total subtracts the
  harness's forced GC; samples are read before the final collection. The CSV attachment
  (`search-heap.csv`) carries per-cycle `longTasks,longTaskMs`, so a red job's attachment shows whether the
  time is spread across cycles or lands in a few.
- **2.0 being slower than 1.11 as a rule.** Seven lone jobs on 2.0 read under 2 s, the same as 1.11 did.

## 2. What to do, in order

1. **Capture a CPU profile from a red job.** Rebase the probe branch's `apps/main/e2e/cpu-profile.ts` (+140)
   and the spec's `attachProfile` hook (+62) from ea27d90a0 onto `main` in a worktree; open a DRAFT-then-ready
   probe PR that carries exactly three files, the helper, the spec and `quarantine.json`, so CI's path filter
   runs the one spec on both projects (~15 min a round). The probe PR is an instrument, not a merge: it closes
   once the profile is in hand, unless the profile attachment earns its place in the spec for good. On the branch, delete the two search-heap G7 entries: a quarantined test is `fixme` and
   never runs on a PR, so the probe needs the gate live. That branch is never merged with the entries gone;
   the attachment (`search-heap-cycles.cpuprofile` or whatever the probe names it) lands in the blob-report
   artifact whether the gate passes or fails. Rerun the shard with `gh run rerun <run> --failed` until one job
   lands in the high mode (two of nine lone jobs did). Keep the per-cycle CSV from the same job.
2. **Name the mode from the profile.** Compare a high job against a low job on the same head: same self-time
   shape scaled up (the renderer is slow: CPU throttling, a second Chromium on the runner, a GPU-less paint
   path) or a different shape (an extra subscriber chain, a stuck interval, the cold-start sync still
   draining, an image decode storm). Also diff the first cycles against the last: a mode that fades is warm-up,
   a mode that holds is state.
3. **If the mode is renderer or runner state**, the fix is in the harness (what the spec waits for before it
   measures, or what the job runs beside it), and the gate can leave quarantine once ten consecutive weekly
   runs are green. The weekly run's history: `gh run list --workflow deploy.yml --event schedule`.
4. **If the mode is the app**, the levers are the ones already named and unbuilt: one record subscription per
   row instead of per cell, no per-emission `toJSON` clone, no geometry read in a passive effect, stable row
   keys so a cleared search reuses the page-1 fibers. That is the interaction-freezes project. Do not ship it
   as a standalone perf PR; put it on that project's list with the profile beside it, and tell Paul the
   budget question the ruling leaves open (the felt-latency number, his device).
5. **Lift the G7 search-heap entries** (both projects) in `apps/main/e2e/quarantine.json` in the PR that makes
   the weekly run green, and run `node apps/main/scripts/e2e-quarantine-check.mjs` (must exit 0). The cart-add
   G7 entries (`pos-cart.spec.ts`, #3210) are a separate question and stay unless their own readings are under
   300 ms.

## 3. Traps

- **Never widen the 2,000 ms.** The repo's rule (`memory/never-move-the-gate-to-get-green.md`) and Paul's words
  on #2284 and #3216. A lift is a quarantine, and only Paul lifts.
- **A lone red on this gate is not evidence about the diff.** Implicate a PR only if two lone reruns on fresh
  runners both fail while main's own push run on the parent passes.
- **Job logs:** `gh run view --job <id> --log` returns nothing for the E2E shards. Use
  `gh api --allow-escape-sequences repos/wcpos/monorepo/actions/jobs/<job>/logs > file` and strip `\x1b[...m`.
  The spec prints `[search-heap] cycles=… longTaskMs=…` on stdout and `heapUsed/cycle (MB): …` for the sawtooth.
- **Blob reports** (`blob-report-<shard>` artifacts) hold the Playwright traces; a trace's `*.network` file lists
  every request, which is how the coupon backlog was found. The CSV and the CPU profile attach to the test
  result inside the same artifact.
- **main's push run tests the production export** (no E2E ledger, `EXPO_PUBLIC_WCPOS_E2E` is preview-only in
  `deploy.yml`), so `waitForCadenceStart` takes the network-quiet fallback there. PR runs have the ledger. A
  reading from a PR run and one from a push run are comparable only after the store went quiet in both.
- **Share the dev stores.** Other sessions run E2E on dev-free/dev-pro; one run at a time on the stores, or the
  gate reads contention.

## 4. Pointers

- Memory (read first): `memory/search-heap-gate-marginal-since-2092.md` (the readings and the two-rerun rule),
  `memory/search-heap-live-profile-is-render-churn-not-retention.md`, `memory/main-web-e2e-red-since-2-0-promotion.md`
  (how the whole red family was closed), `memory/dev-free-leaked-probe-coupons-starved-startup-sync.md`.
- PRs: #3216 (quarantine), #3210 (cart-add quarantine, same shape), #2846 / #3103 (gate method),
  #2106 (window minima), #2080 (results-commit measurement), #3212 (coupon sweep).
- Probe code: `probe/search-heap-cpu-profile` at ea27d90a0 (`apps/main/e2e/cpu-profile.ts`).
- Code under suspicion: `packages/query/src/records/use-record-field.ts`; the POS products panel under
  `packages/core/src/screens/main/pos/products/`.
