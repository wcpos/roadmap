# Brief — PR 4b of the Sales room on Reports: a `refunds-browse` lane in the sync engine (wcpos/roadmap#332 §2 "Refunds count on the day they were made", #302)

Branch `feat/reports-sales-4b`, off `origin/next` after PR 4a (wcpos/monorepo#2274) merged. This worktree already has `node_modules` (installed offline); do not run `pnpm install`, `git pull` or `git fetch`.

## Stakes — higher than the screen PRs

This touches the **sync engine** (`packages/sync-engine`) and the **query layer** (`packages/core/src/query`, `packages/query`). A wrong lane key thrashes or stalls sync for every device; a bypassed refund admission rule writes refunds the device must not hold. Treat the existing orders-browse machinery as the contract to mirror, never to generalise. Concurrency findings about the lane's own continuation are in scope; anything about orders' existing behaviour is not. No new endpoint (the route exists and honours the parameters), no feature flag, no framework.

## The design input

`INVESTIGATION.md` at this worktree's root (untracked; the orchestrator removes it) is a read-only map of every place the engine, the bridge and the query layer handle `orders-browse`, with file:line, and the **minimal** `refunds-browse` sibling per touchpoint, an estimate per file (369 non-mechanical lines) and the tests that cover orders. **Implement what it describes; where the code and the map disagree, the code wins — name the resolution in your report.** Its two qualifications are binding:

1. **Refund admission is reused, never bypassed** (Touchpoint 9): a fetched refund is admitted through the same rule `rx-scheduler-refund-fetcher.ts:57–79` applies — a held parent's authoritative refund summary when the parent is local, POS provenance otherwise — extracted into a shared helper if that is the smallest change (the map estimates ~80 mechanical lines for the extraction).
2. **Do not copy the orders per-page progress call sites** (Touchpoint 8): they publish through a facade that does not forward `publishRangedResume()`, so copying them reproduces a known gap. Record coverage through `recordCumulativeQueryResult()` as the drain's adapter does; fixing orders' progress path is out of scope and is named in your report as observed, not repaired.

## What to build

- `packages/sync-engine`: the public `{ kind: 'refunds-browse'; collection: 'refunds' } & RefundBrowseDimensions` requirement (`after`, `before` in epoch seconds — translated to the existing orders spelling internally, the orders API untouched; `limit?: number | 'all'`; `store?: string`, numeric store id as a string only — no `created_via` reading for refunds); the canonical lane key `refunds:browser[:store=<id>]:after=<s>:before=<s>:limit=<n|all>` with the same identity rules as orders (collection, range, store, normalised limit; never the caller id, priority, sort, status or search); the descriptor parser with `complete: true` and the ranged per-pass budget for `limit=all`; the require-plane dispatch (backstop diagnostic, `queryKey`, the internal `query` conversion, the seed-and-drain branch beside `refunds-by-parent`); the durable seeder grammar; the fetcher building `wcpos/v2/refunds?after=&before=&orderby=date&order=desc&per_page=` with the same ranged continuation and completion as orders' `limit: 'all'`; exports in `index.ts`, `scheduler/index.ts`, `testing.ts`.
- `packages/query` and `packages/core/src/query`: the `refunds` collection in the engine-adapter collection map with the `dateRange` and `store` filters, and the query-state translation so `useCollectionBinding('refunds', { filters: { dateRange, store? } })` declares the requirement the way the orders binding does (`query-state-translator.ts:300–530`), with the types and defaults the map names.
- **No UI in this PR.** The Reports screen's third binding, the Refunds card and the hero's refund figure by refund date, and the negative-COGS netting are PR 4c.

## Tests (by name — mirror the orders cases the map lists)

- `sync-engine/src/require-plane.query-key.test.ts` (+): "a refunds-browse key is the collection, the range, the store and the normalised limit", "caller id, priority and sort do not change a refunds-browse key", "limit=all is sort-independent".
- New `sync-engine/src/scheduler/refund-browser-scheduler-descriptor.test.ts`: the key encodes and parses round-trip; `limit=all` yields `complete: true` and the per-pass budget; an invalid key is refused.
- `sync-engine/src/create-rxdb-sync-engine.require-refunds.test.ts` (+): "refunds-browse fetches the window in date order and continues past one page to completion", "a fetched refund is admitted through the parent-held rule when the parent is local", "a fetched refund is admitted through POS provenance when the parent is not local", "a refund outside the rule is not written", "two callers with the same window share one lane", "coverage is recorded cumulatively".
- `core/src/query/query-state-translator.test.ts` (+): "a refunds query-state with a date range becomes a refunds-browse requirement", "a store filter carries as a numeric store id"; `query-bindings.test.tsx` (+): "useCollectionBinding('refunds', …) declares the requirement and serves local rows in the window".
- `sync-engine/src/package-exports.test.ts` updated for the new exports.

## Commands (run before you report; verify by exit status; one test runner at a time)

```
NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir packages/sync-engine exec jest --maxWorkers=2
NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir packages/core exec jest src/query --maxWorkers=2
pnpm --dir packages/query exec jest --maxWorkers=2
pnpm --dir packages/sync-engine exec eslint src --ext .ts
pnpm --dir packages/core exec eslint src/query --ext .ts,.tsx
pnpm --dir packages/core exec tsc --noEmit
pnpm --dir packages/sync-engine exec tsc --noEmit
node scripts/check-react-compiler-smells.mjs
```

If a package uses vitest rather than jest, use its configured runner and say so. Never run two test runners at once.

## Out of scope (do not add)

Any UI; the Reports screen; margin netting; a generic ranged-fetch framework; a `created_via` reading for refunds; repairing the orders progress publisher gap; a plugin change; `pos/**`; plan, status or handoff files.

## Budget

The map's estimate: 369 changed non-mechanical lines across the files it lists, plus ~80 mechanical lines for the admission extraction. Hard ceiling **400 changed non-mechanical, non-test lines**. If you are about to exceed it, STOP and report why instead of continuing; splitting into more files or commits does not raise it.

## Fixed lines

- If anything does not work as expected — a missing tool, an install, a permission, a failing baseline you did not cause — stop and say so rather than working around it. A design question the map does not answer means this brief was not ready: name it as `Readiness failure: <question>` and stop.
- Do not push; do not open or edit a PR; do not reply on any PR; do not `git commit` — the orchestrator reviews the diff and commits.
- Your final message is the report: what changed (file by file), every resolution where the code overrode the map, what you ran with exit codes, and your line count against the ceiling.
