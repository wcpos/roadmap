# Is FTS5 enough of a prize to break a tie? — research, 2026-09-18

Wayfinder ticket [wcpos/monorepo#2147](https://github.com/wcpos/monorepo/issues/2147), for the 2.0
storage-engine decision. Sibling of §16 of `docs/research/2026-09-17-filesystem-storage-durability.md`,
which raised the question; this file answers its five items and adds the numbers §16 did not have.

**Verdict — no, FTS5 does not break the tie, and it should carry no weight in the engine choice.**

1. The prize is real but conditional: FTS5 is the only option where the search index is never built
   in JS, and it can only be had by choosing SQLite first. It is a *consequence* of the decision,
   not an input to it.
2. Most of the prize is purchasable without it. The avoided read is worth 2,410 / 1,440 / 10,713 ms
   (#2143); a **projection read** — `SELECT` name/sku/barcode instead of whole documents — cuts the
   marshalled bytes 38× and feeds today's folded blob unchanged, with all 17 search traps still
   passing. It costs one generated column in a migration we are already doing for #2150.
3. FTS5 cannot serve two of the enshrined traps. Measured below on SQLite 3.53.4: a trigram index
   passes **15 of 17** and fails `short-term-substring` (`k2`) and `short-qualifier-counts`
   (`MY საბარგული`) — and on an *external-content* table the documented LIKE/GLOB fallback for those
   two **does not exist**, because the index stores no column values.
4. Adopting it is cheap on disk (+2.9 MB at 20k products) and not cheap on writes (upsert 0.23 →
   0.57 ms, a 20k resync 0.09 → 0.45 s) — and it forces `withoutRowId: false` on every collection,
   which changes the on-disk layout #2143 measured.
5. The risk named in §16 survives inspection but is not an FTS5 defect: wa-sqlite #258 and #320 are
   bugs in wa-sqlite's own VFSes that an FTS5-with-triggers write pattern exposed. Neither touches
   the official build or `opfs-sahpool`.

Recommendation: **ship the projection read regardless of engine; revisit FTS5 after durability
decides the engine, as an optimisation, not a tiebreaker.**

## 1. The avoided full read, and what replaces it

**What is avoided.** `packages/query/src/catalogue-search-blob.ts:160` is
`const documents = await collection.find().exec()` — every product document, out of storage, into the
app realm, on every open of every till, scaling with catalogue size. #2143 measured exactly that shape
as `products-catalogue-blob`, 20,000 products of ~2 KB
(`spikes/2143-storage-benchmark/RESULTS.md` on `origin/next`, p50):

| Engine | Mac Chrome | Mac Firefox | Windows CI Chrome |
|---|---:|---:|---:|
| shipped OPFS filesystem (memory-resident) | **89 ms** | 177 ms | 281 ms |
| premium SQLite, `opfs-sahpool` | **2,410 ms** | 1,440 ms | **10,713 ms** |
| premium IndexedDB | 285 ms | 610 ms | 1,059 ms |

That is the number this ticket asked for, and note which way it points: on SQLite the full read is
3–40× *worse* than today, so the blob is not merely unimproved under SQLite, it is a regression —
which is why #2143's resolution lists "stop building the search index from whole documents" as one of
three pieces of migration work its speed case is conditional on.

**What replaces it.** An external-content FTS5 table over premium's `data json` column, kept current
by triggers: FTS5's docs make consistency the application's job and name triggers as the way
(<https://sqlite.org/fts5.html#external_content_tables>), three of them — `AFTER INSERT`,
`AFTER DELETE`, `AFTER UPDATE` (the last a `'delete'` command with the **original** values, then an
insert).

**Measured cost** (local, SQLite 3.53.4 via Python on an M4 Pro, default unix VFS — the same SQLite
version as `@sqlite.org/sqlite-wasm` 3.53.4-build1, but *not* wasm and *not* OPFS, so read the ratios
and expect the wasm absolutes to be worse; 20,000 products of ~1.9 KB, FTS5 over name/sku/barcode,
`tokenize='trigram'`, `content='p'`, VACUUMed, three triggers as above):

| Configuration | 20k seed (one txn) | single-row upsert + commit | database file |
|---|---:|---:|---:|
| no FTS5 | 0.09 s | 0.23 ms | 41.3 MB |
| `detail=full` (default) | 0.45 s | **0.57 ms** | 44.2 MB (**+2.9 MB**) |
| `detail=column` | 0.43 s | 0.48 ms | 43.5 MB (+2.2 MB) |
| `detail=none` | 0.39 s | 0.36 ms | 42.3 MB (+1.0 MB) |

So: **a product upsert costs ~2.5× what it costs today (+0.34 ms), a full resync ~5×, and the index
costs ~3 MB on disk at 20k** — against the 2 MB of *renderer heap* the folded blob costs today
(`catalogue-search-blob.ts:18-24`). Disk is the right place for it; the write multiplier is the price.
`detail=none`/`column` shrink it further but the FTS5 docs restrict full-text queries on those to
tokens of at most three characters, which is useless for us.

**A blocker nobody has recorded: premium's tables are `WITHOUT ROWID`.** Premium creates every
collection as `CREATE TABLE "<collection>-<version>"(id TEXT NOT NULL PRIMARY KEY UNIQUE, revision
TEXT, deleted BOOLEAN …, lastWriteTime INTEGER NOT NULL, data json) WITHOUT ROWID`
(`node_modules/rxdb-premium/dist/esm/plugins/storage-sqlite/sqlite-storage-instance.js`,
`createSQLiteStorageInstance`; the `withoutRowId` setting defaults to on —
`sqlite-types.d.ts:47-52`). FTS5 external content addresses rows by rowid, and a WITHOUT ROWID table
has none (<https://www.sqlite.org/withoutrowid.html> §1). Verified locally on 3.53.4:

```
INSERT INTO fts(fts) VALUES('rebuild');       -> no such column: T.rowid
AFTER INSERT trigger using new.rowid, on fire -> no such column: new.rowid
```

`content_rowid='id'` does not rescue it: FTS5 rowids are integers and `id` is TEXT. So adopting FTS5
means setting `withoutRowId: false` for every collection — a different on-disk layout and a different
primary-key path from the one #2143 benchmarked, so those numbers would need re-taking.

**The traps.** `searchFixtureCatalogue.ts` enshrines 17 traps (`SEARCH_FIXTURE_TRAPS`) that every
search layer must satisfy; `foldSearchText` is lowercase + NFD + strip U+0300–U+036F
(`packages/sync-core/src/searchIndexConfig.ts:48-53`). Run against a trigram FTS5 index over
name/sku/barcode on 3.53.4, terms AND-ed as quoted phrases:

| Configuration | Result |
|---|---|
| `tokenize='trigram remove_diacritics 1'` over raw text | **15/17** |
| `tokenize='trigram'` over JS-folded text | **15/17** |
| `tokenize='unicode61 remove_diacritics 2'` (word tokens) | 14/17 — loses `compound-substring` (`board` in "Skateboard") and both AND-across-terms traps |

Both trigram configurations fail exactly the same two, and for the documented reason: "Substrings
consisting of fewer than 3 unicode characters do not match any rows when used with a full-text query"
(<https://sqlite.org/fts5.html#the_trigram_tokenizer>).

- `short-term-substring` — query `k2`, must find "K2 Skis".
- `short-qualifier-counts` — query `MY საბარგული`, must find id 3013 and not 3014. This is the
  Georgian report behind #2037; the two-character qualifier is what separates the two rows.

The docs' answer is indexed LIKE/GLOB on a trigram table — **and that answer is unavailable to us
twice over.** First, `remove_diacritics` and indexed LIKE/GLOB are mutually exclusive: "Unless the
remove_diacritics option is set" trigram tables support indexed GLOB and LIKE. Confirmed by query
plan: `SCAN … VIRTUAL TABLE INDEX 0:L0` with the default tokenizer, `INDEX 0:` (no L/G) with
`remove_diacritics 1`. Second, and decisively, on an **external-content** table there are no column
values in the index to match against:

```
SELECT rowid FROM fts WHERE name LIKE '%adget%';  -> ERROR: no such column: T.name
SELECT rowid FROM fts WHERE fts MATCH '"adget"';  -> 4609 rows
```

So a one- or two-character term under FTS5 falls back to `JSON_EXTRACT(data,'$.name') LIKE ?` on the
content table — an unindexed scan linear in catalogue *bytes*, exactly the shape
`catalogue-search-blob.ts`'s header already rejected ("a storage-side `$regex` scan is the other wrong
shape — linear in catalogue BYTES, 265 ms at 20k on filesystem-node, over the debounce"). Retiring the
blob therefore needs either a three-character UI minimum — contradicting `short-qualifier-counts` and
the report that produced it — or a JS structure kept alive for short terms, which keeps the full read
and forfeits the prize.

## 2. The platform asymmetry

Where storage runs today, in our own code:

- **Electron:** `packages/database/src/adapters/storage/index.electron.ts` — `getRxStorageIpcRenderer({key:'main-storage', mode:'storage'})`. The engine is in the **main process**, a separate OS process from the renderer whose V8 heap cap is what `WOOCOMMERCE-POS-W8` crashes against.
- **Web:** `packages/database/src/adapters/storage/index.web.ts` — `getRxStorageWorker({workerInput:'/opfs.worker.js'})`. A DedicatedWorker: same OS process, same browser memory pressure. #2026 comment 2 states it directly: *"A browser worker does not create a distinct OS process and gets no exemption from tab or browser-wide memory pressure; it relieves window heap and main-thread execution, which is worth having on web but is not evidence those crashes stop."*

Concretely, what FTS5 changes about *where* index memory lives:

| Platform | Today | Under FTS5 |
|---|---|---|
| Electron | blob rows + text in the **renderer** heap (~2 MB at 20k); built by a full read across IPC | index on **disk in the main process's** database file; page cache in main-process wasm/native memory. A genuinely different heap — the #2026 fix, for the process that actually crashes. |
| Web | blob in the **tab's** heap; built by a full read across the worker RPC | index on **disk in OPFS**; page cache in the worker's wasm heap — same OS process, same pressure. The win is the **avoided read**, not avoided heap. |
| Native (RN) | blob on the **UI JS thread**; `addFulltextSearch`/the blob attach to the `RxCollection`, constructed there (§16) | undecided — the native engine question is #2138/#2145, and nothing here applies until it resolves. |

So FTS5's heap argument is an Electron argument only — and §16's W8 finding already weakened that
from both ends (the dominant 72.56 MiB coupons index was a dev-fixture artifact; 90% of W8 events are
a 1.9.x tail fading before #2092 shipped). What survives everywhere is the avoided full read, and §6
shows that is purchasable more cheaply.

## 3. Availability

- **Official `@sqlite.org/sqlite-wasm`: yes.** `ext/wasm/GNUmakefile:439` lists `-DSQLITE_ENABLE_FTS5`
  under `SQLITE_OPT.full-featured` (<https://github.com/sqlite/sqlite/blob/master/ext/wasm/GNUmakefile>),
  and #2138 records it for the exact artifact we would ship: "`@sqlite.org/sqlite-wasm` 3.53.4-build1
  (SQLite 3.53.4, `ENABLE_FTS5`, `MAX_VARIABLE_NUMBER=32766`, `THREADSAFE=0`)" —
  `spikes/2138-rxdb-sqlite-wasm/RESULTS.md:3-5` on `origin/next`. (The package is installed in no local
  tree — the main clone cannot install — so the spike record is the citation.)
- **wa-sqlite: no.** Its `WASQLITE_DEFINES` block (Makefile:101-115) carries `DEFAULT_MEMSTATUS`,
  `DEFAULT_WAL_SYNCHRONOUS`, `DQS`, `LIKE_DOESNT_MATCH_BLOBS`, `MAX_EXPR_DEPTH`, four `OMIT`s,
  `THREADSAFE`, `USE_ALLOCA`, `ENABLE_BATCH_ATOMIC_WRITE`, then `$(WASQLITE_EXTRA_DEFINES)` — no FTS5.
  Both corruption reporters added it by hand: #320's ran `make WASQLITE_EXTRA_DEFINES="-DSQLITE_ENABLE_FTS5
  -DSQLITE_ENABLE_GEOPOLY=1 -DSQLITE_ENABLE_RTREE=1"`, #258's "compil[ed] a separate build that included
  the FTS5 extension".

That is one more item on the official build's side of §12 — a tiebreaker between the two wasm
packages, which §12 already decided, not between engines.

## 4. The risk: what the two wa-sqlite corruption reports actually were

Both are FTS5-with-triggers workloads, as §16 said. Neither is an FTS5 defect, and neither applies to
the official build with `opfs-sahpool`.

**[#258](https://github.com/rhashimoto/wa-sqlite/issues/258)** — "Database Disk Image Malformed
(IDBatchAtomicVFS, FTS5)", 2025-04-05, **still open**. A custom FTS5 build plus
`AFTER INSERT/UPDATE/DELETE` triggers feeding a contentless FTS5 table; frequent corruption. Removing
FTS5 stopped it; enabling FTS5 but leaving it *unused* did not reproduce it. The thread converged on a
VFS bug — SQLite can write past the file-size offset and **IDBBatchAtomicVFS** never fills the skipped
pages, so reading a never-written page yields a malformed image; sibling **IDBMirrorVFS** had the same
class and was fixed in PR #259. The maintainer's last word is that writes-beyond-EOF explain the 1 GB
case but feel "less likely" at the sizes originally reported, so #258's own root cause is unconfirmed.

**[#320](https://github.com/rhashimoto/wa-sqlite/issues/320)** — "Database Disk Image Malformed
(WriteAheadVFS, FTS5, GEOPOLY)", 2026-04-17, **closed 2026-04-22**. One connection, no concurrency,
`synchronous=NORMAL`, `BEGIN IMMEDIATE`, triggers maintaining fulltext and geopoly indexes; two WAL
files grew past 6 GB and the database then failed to open. The reporter: *"I could not seem to get the
database corruption to occur without the triggers present."* The maintainer reproduced it and fixed
**two bugs in OPFSWriteAheadVFS**: (a) some WAL transactions carried a file size disagreeing with the
page-1 header, which is what raises `SQLITE_CORRUPT` via `xFileSize()` — fixed by always reading the
size from page 1; (b) pages from the first transaction after a WAL rollover were read from the
*previous* WAL file, "poor state management where the WAL file identifier was stale".

**Does it apply to the official build with sahpool?** No: every named defect is in a wa-sqlite VFS
(`IDBBatchAtomicVFS`, `IDBMirrorVFS`, `OPFSWriteAheadVFS`) — hand-written IndexedDB/OPFS journalling
layers outside SQLite's own test matrix. `opfs-sahpool` is written and tested by the SQLite authors,
and #2138 verified WAL really is WAL on it. The transferable lesson is narrower but real:
**FTS5-with-triggers is a heavier, less usual write pattern than plain upserts, and it was the
workload that exposed two latent VFS bugs.** If FTS5 is adopted, the #2144 crash harness must run
*with* the triggers in place — §16 says this already and it holds.

## 5. The seam: how a `MATCH` would reach storage

RxDB's Mango cannot express `MATCH`. Three seams, in order of how much is ours to build:

**(a) `queryModifier` — documented, and not enough on its own.** Premium exposes
`queryModifier?: RxStorageSQLiteQueryModifier<any>`
(`node_modules/rxdb-premium/dist/types/plugins/storage-sqlite/sqlite-types.d.ts:56-63`): "Can be used
to modify the prepared query before sending it to SQLite … you could use it to replace a regex with
%LIKE% expressions". It is applied in `query()` (both branches) and `count()`, and **not** in
`findDocumentsById`. It receives `(queryWithParams, preparedQuery)` and may rewrite SQL and params
wholesale; the caller then wraps the result as
`SELECT COALESCE('[' || group_concat(data, ',') || ']', '[]') FROM (<your query>)`, so the rewrite must
still yield a `data` column — `… WHERE id IN (SELECT c.id FROM fts JOIN "<tbl>" c ON c.rowid =
fts.rowid WHERE fts MATCH ?)` fits.

The catch is upstream of it. The selector must first *translate*, or `prepareSQLiteQuery` sets
`nonImplementedOperator` and `query()` takes the 50-row paging branch that discards the WHERE and
re-matches every row with `getQueryMatcher` (§16) — and mingo will not match a synthetic `$fts`
operator, so that branch returns nothing however the SQL is rewritten. The term must therefore be
smuggled through a *translatable* selector (equality on a sentinel field no document carries) that the
modifier recognises: a private protocol between our query layer and our storage settings, invisible to
`packages/core/src/query/query-state-translator.ts`'s residual matcher unless that is taught it too.

**(b) A custom storage method / side channel.** #2026 comment 2 found the obstacle: premium's
`exposeWorkerRxStorage` forwards only storage, messages and send — not `database` and
`customRequestHandler` — and `customRequest()` creates and closes a channel per call, so "a persistent
owner connection has to be defined rather than assumed". Our worker entry is ours
(`scripts/opfs-worker-entry.mjs`), so adding a handler is easy; keeping it alive is the work.

**(c) What #2143 did.** `spikes/2143-storage-benchmark/worker-sqlite.mjs` is the honest template and
it uses all three: a `queryModifier` rewriting `ORDER BY` into `WHERE <predicate> ORDER BY` with its
own params; a monkey-patch of `instance.query`/`instance.count` after `createStorageInstance`, because
the modifier alone could not reach the paths it needed; and a `self.addEventListener('message')` probe
channel for raw SQL. Its translator emits `LIKE ? ESCAPE '\'` / `GLOB ?` for `$regex` — the
projection-and-scan shape, not `MATCH`.

Net: the seam is buildable, none of it is vendor-supported end to end, and the same wrapping FTS5
needs is already needed for #2150's promoted columns and the pushed products sort. That argues for
doing the query-layer work once, not for FTS5.

## 6. Does it tip the decision — and what the alternative costs

**No.** FTS5 can only be had on SQLite, so it can only *add* to SQLite's side — and a tiebreaker has
to be worth more than the cheapest way to get the same benefit. It is not.

**The alternative #2143 named: a projection read.** Instead of `collection.find().exec()`, read only
the searchable fields and hand them to the existing folded blob. Locally at 20k (3.53.4, native; same
caveat as §1):

| Read | Time | Bytes returned |
|---|---:|---:|
| `SELECT data … WHERE deleted=0` (today's shape) | 13.6 ms | 38.50 MB |
| `SELECT id, json_extract(name), json_extract(sku), json_extract(barcode) …` | 33.0 ms | **1.02 MB** |

Natively the projection is *slower* — `json_extract` parses each 1.9 KB document — but it returns
**38× fewer bytes**, and #2143 attributes the whole-table penalty specifically to marshalling ("SQLite
pays wasm-to-JS marshalling per byte returned, and the Windows runner pays it hardest"). At Chrome's
2,410 ms for 38.5 MB (≈63 µs/KB), 1 MB of payload is ~60 ms of marshalling plus the parse — plausibly
the same band as the shipped engine's 89 ms, **but that is an extrapolation and belongs in the #2143
harness as one added cell before anyone relies on it.**

The parse cost disappears with a stored generated column
(`name TEXT GENERATED ALWAYS AS (json_extract(data,'$.name')) STORED`), making the read
`SELECT id, name, sku, barcode`. SQLite refuses to add a STORED column to a populated table (verified:
`cannot add a STORED column`), so it needs a table rebuild — exactly the migration #2150 already
proposes for promoting `_pos_user`/`_pos_store`. One rebuild, two payoffs.

**Cost comparison, in work rather than money:**

| | Projection read | FTS5 |
|---|---|---|
| Search semantics | unchanged — the blob and its 17 traps keep passing, today, on every engine | 15/17; two short-term traps need a JSON scan fallback or a UI minimum that contradicts #2037 |
| Query seam | none — it is a `find()` with a field projection | a private sentinel-selector protocol through `queryModifier`, plus residual-matcher changes, plus `findDocumentsById` is not covered |
| Storage settings | none | `withoutRowId: false` on every collection; re-take #2143's numbers |
| Write cost | none | +0.34 ms per upsert (~2.5×), resync ~5× |
| Disk | none | ~+3 MB at 20k |
| Crash surface | none | three triggers per collection, the exact workload behind wa-sqlite #258/#320; must go in the #2144 harness |
| Engine-independent? | **yes** — helps on OPFS and IndexedDB too | no |
| Deletions earned | none | `search.ts`, the folded blob, the FlexSearch pipeline, the #2070 export-history bound, the #2020 append bound, the rebuild path, the #2073 sizing question |

The deletion row is the only one FTS5 wins, and §16 is right that it is substantial — a subsystem
patched at least four times. But it is a reward for a decision already made, collectable later, and
not collectable *completely*: short terms keep a JS fallback alive unless Paul rules a three-character
minimum acceptable, which would reverse #2037.

**Recommendation.** Weight FTS5 at zero in the engine choice. Put the projection read on the map for
the #2091/#2143 follow-up regardless of engine, bundled with #2150's table rebuild. If SQLite wins on
durability (#2144) and topology (#2146), revisit FTS5 then, as a deletion project with a stated
decision on short terms — and run its triggers through the crash harness before trusting them.

## What I could not verify

- **The projection read's wasm cost.** Extrapolated from #2143's per-byte marshalling, not measured.
  One cell in the existing harness would settle it; I did not re-run any benchmark, per the ticket.
- **FTS5 under wasm/OPFS.** All local measurements here are native SQLite 3.53.4 via Python on an M4
  Pro with the default unix VFS. The SQLite *version* matches `@sqlite.org/sqlite-wasm` 3.53.4-build1
  and FTS5 semantics are the same, so the trap results and the query plans transfer; the timings and
  file sizes are indicative only.
- **`@sqlite.org/sqlite-wasm`'s compile options read from the artifact.** The package is not installed
  in any local tree (the main clone cannot install), so §3 cites #2138's recorded `ENABLE_FTS5` plus
  upstream `ext/wasm/GNUmakefile:439` rather than a local `PRAGMA compile_options`.
- **wa-sqlite #258's root cause.** Still open; the maintainer's own last assessment is that the
  writes-past-EOF explanation "feels less likely" for the smaller databases originally reported.
- **Native (React Native).** Out of scope here and blocked on #2138/#2145.
