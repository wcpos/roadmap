# Handoff — FlexSearch churn patch: what is left after #2020 and #2028

Written 2026-09-14, afternoon, after the independent review of the shipped monorepo#2020 and the merge of monorepo#2028. Companion to `2026-09-14-post-1.10.13-outstanding.md` (the release session's list, same day); items 2 and 3 of that doc were corrected when this one was written. Read this one first for anything FlexSearch; read that one for release process, `release.yml`, Pro PHPUnit and the `next` E2E failures.

## Where things stand

| What | State |
|---|---|
| `scripts/patch-rxdb-premium-flexsearch-churn.mjs` and its test | **Byte-identical on `main` and `next`.** `main` got it in #2020 (`7bedfcdc4f`, shipped in app 1.10.13). `next` got the same bytes in #2028 (`ffa3ca6798`, squash-merged 2026-09-14 12:13 UTC). Both lanes run it from `postinstall`. Check: `git diff --exit-code origin/main origin/next -- scripts/patch-rxdb-premium-flexsearch-churn.mjs scripts/rxdb-premium-flexsearch-churn.test.mjs` prints nothing. |
| Electron | Needs **no** mirror for this patch. The index materialises in the renderer, and the renderer runs the monorepo bundle, so the patched dist is already the one it loads. |
| Independent review of the shipped code | Done, two passes (Claude + Codex Astra), both clean on the things most likely to be wrong: the hand-rolled SHA-256 (30/30 and 790/790 against Node `crypto`), the byte accounting (0 drift over 48,000 randomised calls, both update and remove+add paths), the escape namespaces (injective), ES5/strict safety. 48/48 suite. Evidence is in the three review-thread replies on #2028; the fuzz and SHA harnesses were scratchpad-only and are gone. |
| Sentry after 1.10.13 / desktop 1.10.16 | **Not yet checked.** 1.10.13 went out at 10:33 UTC today. The signal to watch is the Windows desktop `OutOfMemoryError: Renderer reached heap limit` family and any new event from `rx-fulltext-search`. Nothing in this handoff depends on that check, but the patch has not been observed in the wild yet. |

## 1. The one code follow-up: a comment at the pre-write persisted marking (both lanes)

**Priority: small, do it first.** Two independent reviewers both read this as live data loss and both had to go read vendor source to learn it is not. The next reader will too.

`wcposChangedSearchEntries` marks an id as persisted **before** the caller's `s.upsert(...)` has resolved. Line 191 of the script on both lanes:

```js
wcposRetainDigest(index, digests, '__wcposPersistedDigestBytes', entry.id, digest);
```

It is benign only because `RxPipeline` never re-invokes a throwing handler. `rxdb/dist/esm/plugins/pipeline/rx-pipeline.js` opens with *"The handler of the pipeline must never throw. If it did anyway, the pipeline will be stuck and always throw the previous error on all operations."* On a throw it sets `this.error`, exits the loop, and skips `setCheckpointDoc`, so the batch is re-read by the **next process**, which starts with an empty map. Anyone who wraps that handler in a retry, or reuses the index object across an in-place restart, turns this into silent search staleness that survives reboots.

What to land:

- A comment directly above line 191 saying exactly that: marked before the write; safe only because the pipeline never retries a handler in-process; do not add a retry around this handler. Put it in the script source. `PRELUDE` is assembled with `Function.prototype.toString()`, so a comment inside the function body is carried into the patched dist verbatim, which is harmless and arguably useful. A comment above the `wcposChangedSearchEntries` declaration stays out of the dist. Either is fine; the dist carries no size constraint that matters here.
- Optional, same PR if it fits: pin the vendor behaviour with a test in `scripts/rxdb-premium-flexsearch-churn.test.mjs` that builds a real `RxPipeline` on memory storage, throws once from the handler, and asserts the handler ran exactly once and the checkpoint did not advance. That turns a memory note into something CI proves. Mutation-check it: make the handler retry and watch it go red.
- **Landing rule: the two lanes must stay byte-identical.** One PR to `main`, then the routine `main`→`next` sync carries it. Do not cherry-pick into `next`; a cherry-pick has made git treat identical bytes as unrelated history before, and the next sync then conflicts. After the sync, rerun the `git diff --exit-code origin/main origin/next -- scripts/...` check above.
- Validation: `node --test scripts/rxdb-premium-flexsearch-churn.test.mjs` (48 tests today) and `pnpm test:scripts`. `test:scripts` in a fresh worktree resolves `rxdb-premium` by walking up to the main tree's `node_modules`; if it is red on anchors, that is the reason, not the change.

The memory note this replaces is `rxdb-pipeline-handler-never-retries` in the monorepo project memory. Once the comment and test are in the repo, the note can point at them.

## 2. `search.ts` teardown refactor — reverted from #2020, on neither lane, no issue filed

The #2020 body still says finding 6 was "Fixed". It was not shipped. Commit `290fabbb3a` (`revert(search): take the search.ts teardown work out of this PR`) removed it before merge, and `packages/database/src/plugins/search.ts` is at the same pre-fix state on both lanes: `evictLRUIfNeeded` and `recreateSearch` tear down with `collection.destroy()` (lines 158, 547, 648) and the only `close()` calls are at 261–262. The four findings are itemised in `2026-09-14-post-1.10.13-outstanding.md`, item 1; that description is accurate and is not repeated here.

The attempted fix and its 8 tests still exist as commits `a996bbeea1` and `dcad492c58` on #2020's history. They are fetchable by SHA even though the branch is gone (`git fetch origin a996bbeea1`). Use them as a starting point, not as the answer: CodeRabbit found two defects in that version (cleanup skipped when `pipeline.close()` rejects; teardown not serialised against an in-flight `initSearch`), and both were deferred rather than fixed.

**No tracking issue exists.** Searching open issues for "teardown", "evict" and "flexsearch" returns only #2026. Filing one is the first step, and the lane is Paul's call. My recommendation: `next` first, because it carries the wider searchable blob and heavier register logging that make the retained maps larger, and port to `main` only if Sentry shows renderer heap events on 1.10.13+. It is a concurrency change to app lifecycle code; it gets its own PR, tests that fail without each fix, and no release pressure.

## 3. monorepo#2026 — the index lives in the renderer

Open, no comments, no owner. It records that on desktop the FlexSearch index is built and held in the renderer while rxdb storage runs in the main process, which is why the Windows renderer heap limit is the failure surface for anything search-sized. It is architectural, not a 1.10.x patch, and belongs in 2.0 planning alongside the worklet storage decision (#1885, #1901). Nothing to do now beyond keeping it in view when the renderer-OOM numbers come in.

## 4. Upstream reports to rxdb-premium: filed, covered locally, waiting on the maintainer

| Report | State | Our coverage |
|---|---|---|
| `pubkey/rxdb-premium-issues#30` — a crash during `cleanup()` duplicates every document on the next open | Open; last comment ours (2026-09-12, widening the window to inside `persistInMemoryRows()`). No maintainer reply. | `scripts/patch-rxdb-premium-changelog-replay-safety.mjs`, per its header: makes changelog compaction crash-safe and rebuilds index files from `documents.json` on corrupt boot. Both lanes, in `postinstall`. |
| `pubkey/rxdb-premium-issues#31` — two instances writing one collection make `changelog.txt` unreplayable | Open; no comments. No maintainer reply. | `scripts/patch-rxdb-premium-changelog-identity.mjs`. Both lanes; shipped in 1.10.12 (#2002), mirrored to electron `next` (#437, #438) and `main` (#439). Unit coverage only on `main`; the two-tab E2E exists only on `next` and is red for reasons the other handoff describes. |

Both filed with working repros and not as AI-written prose; keep it that way if either thread reopens. When a fix ships upstream, the patch scripts fail closed on anchor drift at `postinstall`, which is the intended signal to retire the patch rather than re-anchor it.

## 5. Other open threads touched in this run, not FlexSearch

- **#2012** — a stale primary op can defeat the secondary-index byte-range guard (web only). Open. Cross-linked on 2026-09-12 to the "what only the op contract can fix" section of `scripts/rxdb-premium-upstream-report-changelog-ordering.md` on `next`. Waits on upstream; nothing local to do.
- **#2014** — sync 401s. Open. The premise was corrected on 2026-09-12: sampling the event detail showed the 401s hit `/integrity/scan`, `/products` and `/orders`, not only `/cashier/N`. Whoever picks it up starts from that comment, not the title.

## 6. Paul's own list from 2026-09-12 — all landed

He took these on himself and said to leave them alone. For the record, every one is merged, so nothing here is waiting on him:

- Leadership gate: monorepo#1982 and electron#435, both merged.
- Electron `main` mirror of the changelog-identity patch before a desktop build: electron#439 merged; desktop 1.10.15 (#441) and 1.10.16 (#442) released on it.
- Upstream rxdb report: #2007 and #2015 merged; the two reproducible parts are #30 and #31 above.
- Renderer source maps: #2008 (web, to Sentry on every bundle publish) and #1914 (native) merged.
- README / Decision-section catch-up: #2004 merged.

## 7. Housekeeping

- **Worktrees.** `bash ~/.claude/scripts/cleanup-worktrees.sh --dry-run` lists 19 merged worktrees to remove, including `flexsearch-churn`, `flexsearch-churn-main` and `flexsearch-digest-bound` under `~/Projects/monorepo-v2-worktrees/`. The review worktree for this run is `monorepo-v2/.claude/worktrees/review+flexsearch-2020` on `port/flexsearch-ceiling-next`, also merged. Run it without `--dry-run` when no other session is mid-work.
- **The roadmap main clone (`~/Projects/roadmap`) is 78 commits behind and dirty** with another session's printer-research files. The release session's handoff (`2026-09-14-post-1.10.13-outstanding.md`) was sitting there **untracked**; this PR carries it in with its corrections. **Trap:** once this PR merges, `git pull` in that clone will refuse because the untracked file would be overwritten. Delete the untracked copy first (it is identical apart from the two corrections), then pull. Do not stash: the dirty files are someone else's.

## Opening prompt for the next session

```
Read /Users/kilbot/Projects/roadmap/docs/handoffs/2026-09-14-flexsearch-churn-followups.md and do item 1 on the main lane: the comment at the pre-write persisted marking in scripts/patch-rxdb-premium-flexsearch-churn.mjs, plus the RxPipeline no-retry pin test if it fits. Worktree from origin/main, PR to main, keep the two lanes byte-identical via the routine main→next sync, and mutation-check the new test. Then file the tracking issue for item 2 and stop; the lane for item 2 is my call.
```
