# Boot replay rebuilds storage indexes on every reopen — a reader-side false positive since 2026-09-12

Status: **verified mechanism, fix deferred by Paul (2026-09-16, "do as you recommend": fix as its
own scoped PR, not during a patch train).** Found while diagnosing native E2E run 35058824874's
Android red (the first run on the dev client rebuilt with `expo-updates`); it turned out NOT to be
that run's cause — that was the Android Metro process still fingerprinting per manifest request,
fixed by mirroring #2068's pre-resolve into the Android job — but it is real.

## Symptom

On every process reopen of a database with uncompacted writes, the app logs, per collection:

```
'[wcpos] rebuilt storage indexes from documents.json', { db: 'pos_v4_…', col: 'products',
  reason: 'stale-changelog-op:A:index-3', documents: N, skipped: 0 }
```

Reasons seen: `stale-changelog-op:{A,D,R}:index-N` (A add, D delete, R replace; `index-N` is the
collection's `IndexState.indexId`, file `index-0000N.txt`). Seen on Android phone and tablet, on iOS,
and on the last GREEN native run (09-15 00:08): 19–23 rebuilds per run, same reason codes. So it is
old and tolerated, not a regression — but it is a full index rebuild from `documents.json` on every
cold start until compaction clears the changelog, proportional to catalogue size.

## Mechanism (read-only investigation by Codex GPT-6 Astra, 2026-09-16; file:line on monorepo `main`)

- The detector: `scripts/patch-rxdb-premium-changelog-replay-safety.mjs:67–76` marks a replayed
  secondary-index op stale when its position is out of bounds / breaks index-string order (A) or
  does not hold the named index string (D/R). Introduced in `ef4ab2c7` (2026-08-30).
- The guard: `scripts/patch-rxdb-premium-changelog-identity.mjs:28–34` rejects a secondary A/R op
  unless its byte range matches the primary index's **current** row. Introduced in `73f172b4`
  (2026-09-11), applied after boot replay.
- The interaction: `e959b30076` (2026-09-12, cherry-pick of `698d64e2`) moved sibling linking to
  **before** boot replay so the guard applies during replay (`identity.mjs:128–147`). Boot replay is
  grouped — all primary-index history first, then secondary (`replay-safety.mjs:67–75,200`) — so
  during secondary replay "current primary" is the FINAL state, not the state at that point in
  history. A valid historical A at old bytes `[0,10]` is skipped once the row has moved to `[10,20]`;
  the following R/D then finds no row and is (correctly, given the skipped A) marked stale → rebuild.
- Reproduced in memory with the actual helpers: A, D and R all fail with linked indexes; identical
  inputs pass unlinked. Device files were not available, so the exact offending ops are inferred.
- Same code ships to web (`apps/main/public/opfs.worker.js`) and desktop (electron applies both
  patch scripts; `src/main/rxdb-storage.ts:129` selects filesystem-node). "Every merchant cold start
  pays 35–85 s" is NOT established — the E2E timing includes dev-client startup; the rebuild's own
  cost was not measured.

## What a fix must respect

- `e959b30076`'s intent was deliberate: the range gate must apply during boot replay (its commit
  message and test assert the link precedes the replay). So the fix is not "revert e959b3". It is:
  during boot replay, compare a secondary op against the primary state **as of that op** — either by
  interleaving primary/secondary ops in original changelog order, or by walking the primary history
  alongside. Keep the live-peer guard and the stale detector.
- Three artifacts must move together, or web/desktop silently keep the old behaviour:
  1. `scripts/patch-rxdb-premium-changelog-identity.mjs` (+ its `.test.mjs`) in the monorepo;
  2. `apps/main/public/opfs.worker.js` — a committed bundle that INLINES patched rxdb-premium; rebuild
     it from the same checkout's node_modules and verify by marker count before committing;
  3. `wcpos/electron`'s copy of the patch scripts (`package.json:23` applies both).
- Pin it: a test that replays an insert-then-replace history through linked indexes and asserts NO
  `stale-changelog-op` rebuild; it must be red on today's code first.
- Measure before claiming a startup win: time from process start to `engine.ready` on a device with a
  real catalogue, before and after, with the changelog non-empty.