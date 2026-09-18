# Is FTS5 enough of a prize to break a tie? — research, 2026-09-18

Wayfinder ticket [wcpos/monorepo#2147](https://github.com/wcpos/monorepo/issues/2147), for the 2.0
storage-engine decision. Sibling of §16 of `docs/research/2026-09-17-filesystem-storage-durability.md`,
which raised the question; this file answers its five items and adds the numbers §16 did not have.

**Verdict — no, FTS5 does not break the tie, and it should carry no weight in the engine choice.**

1. The prize is real but conditional: FTS5 is the only option where the search index is never built
   in JS, and it can only be had by choosing SQLite first — a *consequence* of the decision, not an
   input to it.
2. Most of the prize is purchasable without it. The avoided read is worth 2,410 / 1,440 / 10,713 ms
   (#2143); a **projection read** — `SELECT id, name, sku, barcode` — cuts the marshalled bytes 38× at
   no extra time and feeds today's blob unchanged, all 17 traps passing, riding #2150's table rebuild.
   Not free of plumbing: premium's wrapper needs a full `data` column, so it takes a custom storage
   read (§5(b)), and it fixes a SQLite-specific regression, not every engine.
3. FTS5 **can** serve all 17 traps — `MATCH` with `remove_diacritics 1` at three characters or more
   (15/17) plus `LIKE` over the projected columns below that (`k2`, `MY საბარგული`), 6.4 ms at 20k —
   so it could retire the blob completely. But that form needs rowids *and* the same stored generated
   columns the projection read needs.
4. Its cost: upsert 0.19 → 0.38 ms (~2×), resync ~7×, ~+3 MB disk at 20k. The generated columns alone
   are near-free, so the shared half of the migration is cheap and the FTS5 half is what costs. On
   premium's shipped columns FTS5 can only be a write-only index — no `'rebuild'`, no reads, no `LIKE`.
5. The risk named in §16 is not an FTS5 defect: no FTS5 defect has been isolated in either wa-sqlite
   report; both are FTS5-with-triggers workloads; #320 was root-caused to wa-sqlite's own VFS and
   fixed, #258 is still open and unconfirmed; neither implicates the official build or `opfs-sahpool`.

Recommendation: **if SQLite wins on durability, satisfy #2143's search-index condition with a
projection read through a custom storage read, riding #2150's generated columns; revisit FTS5 after
the engine is decided.**

## 1. The avoided full read, and what replaces it

**What is avoided.** `packages/query/src/catalogue-search-blob.ts:160` is
`const documents = await collection.find().exec()` — every product document, out of storage, on every
open of every till, scaling with catalogue size. #2143 measured that shape as
`products-catalogue-blob`, 20,000 products of ~2 KB (`spikes/2143-storage-benchmark/RESULTS.md` on
`origin/next`, p50):

| Engine | Mac Chrome | Mac Firefox | Windows CI Chrome |
|---|---:|---:|---:|
| shipped OPFS filesystem (memory-resident) | **89 ms** | 177 ms | 281 ms |
| premium SQLite, `opfs-sahpool` | **2,410 ms** | 1,440 ms | **10,713 ms** |
| premium IndexedDB | 285 ms | 610 ms | 1,059 ms |

Note which way it points: on SQLite the full read is 3–40× *worse* than today, so the blob is not
merely unimproved under SQLite — it is a regression, which is why #2143's resolution makes "stop
building the search index from whole documents" one of three conditions on its speed case.

**What replaces it.** An external-content FTS5 table over premium's `data json` column, kept current
by three triggers — `AFTER INSERT`, `AFTER DELETE`, `AFTER UPDATE` (the last a `'delete'` command with
the **original** values, then an insert). FTS5's docs make that consistency the application's job
(<https://sqlite.org/fts5.html#external_content_tables>).

**But the content table needs columns FTS5 can read by name, and premium's has none.** The table I
first measured is premium's shipped shape — `id, revision, deleted, lastWriteTime, data json` — with
`content='p'` and triggers supplying `json_extract(new.data,'$.name')` and friends. It indexes and
MATCHes correctly, but external content resolves declared columns *against the content table*
whenever it reads them, so on that schema every such path fails (verified, 3.53.4):

`MATCH` works (index only); `SELECT name FROM fts …`, `… WHERE name LIKE ?` and
`INSERT INTO fts(fts) VALUES('rebuild')` all raise `no such column: T.name`.

So **premium as shipped can carry a write-only FTS5 index — no `'rebuild'`, no column reads, no
`LIKE`.** Losing `'rebuild'` matters on its own: it is the documented repair for a drifted index, and
without it the only repair is a resync.

**Measured cost** (SQLite 3.53.4 via Python on an M4 Pro, default unix VFS — same SQLite version as
`@sqlite.org/sqlite-wasm` 3.53.4-build1 but *not* wasm and *not* OPFS, so read ratios and expect worse
wasm absolutes; 20,000 products of ~1.9 KB, trigram FTS5 over name/sku/barcode, VACUUMed, three
triggers as above):

| Configuration | 20k seed (one txn) | single-row upsert + commit | database file |
|---|---:|---:|---:|
| baseline, `data json` only | 0.06 s | 0.20 ms | 41.3 MB |
| **+3 STORED generated columns** (no FTS5) | 0.13 s | **0.19 ms** | **41.3 MB** |
| + generated columns + FTS5 `detail=full` | 0.42 s | **0.38 ms** | 44.2 MB (**+2.9 MB**) |
| FTS5 `detail=column` / `detail=none` (no generated columns) | 0.43 / 0.39 s | 0.48 / 0.36 ms | +2.2 / +1.0 MB |

So: **FTS5 roughly doubles a product upsert (0.19 → 0.38 ms), costs ~7× on a full resync and ~3 MB
on disk at 20k** — against the 2 MB of *renderer heap* the folded blob costs today
(`catalogue-search-blob.ts:18-24`). Disk is the right place for it; the write multiplier is the price.
**The three STORED generated columns are nearly free on their own** — upsert unchanged within noise,
no measurable disk growth — so the shared half of the migration is cheap and the FTS5 half is what
costs. `detail=none`/`column` shrink the index further but the docs cap full-text queries there at
three-character tokens, which is useless for us.

**A second constraint nobody has recorded: premium's tables are `WITHOUT ROWID`** — every collection
is `CREATE TABLE "<collection>-<version>"(id TEXT … PRIMARY KEY …, data json) WITHOUT ROWID`
(`rxdb-premium/dist/esm/plugins/storage-sqlite/sqlite-storage-instance.js`,
`createSQLiteStorageInstance`; the setting defaults on, `sqlite-types.d.ts:47-52`). FTS5 external
content addresses rows by rowid and such a table has none
(<https://www.sqlite.org/withoutrowid.html> §1). Verified on 3.53.4:

```
INSERT INTO fts(fts) VALUES('rebuild');       -> no such column: T.rowid
AFTER INSERT trigger using new.rowid, on fire -> no such column: new.rowid
```

`content_rowid='id'` does not rescue it: FTS5 rowids are integers and `id` is TEXT. This binds the
direct external-content design only — so **the two constraints above together make one design fork:**

- **External content over a rowid table** — `withoutRowId: false`, plus stored generated
  `name`/`sku`/`barcode` columns. Verified: `'rebuild'`, column reads and indexed `LIKE` all work.
  The only design that satisfies all 17 traps, and it is **exactly the #2150 rebuild the projection
  read needs** (§6), so FTS5's viable form sits on top of the cheaper alternative rather than instead
  of it. It changes the on-disk layout and primary-key path #2143 benchmarked, so **those numbers
  need re-taking for this design**.
- **A contentless table** (`content=''`, `contentless_delete=1` — added in 3.43.0 and now preferred
  by the docs), or a self-owned FTS table holding the document id as an `UNINDEXED` column, both
  trigger-maintained. These keep `WITHOUT ROWID` intact, so **#2143's numbers stand**. The price:
  contentless stores no column values (verified — MATCH works, column reads return `NULL`, plain
  `DELETE` refused), so **there is no `LIKE` fallback and the two short-term traps genuinely die**;
  the delete path must supply the original values; and any such design must mint integer rowids
  itself, since our keys are TEXT and a `WITHOUT ROWID` table offers a trigger no `new.rowid`. A
  self-owned FTS table avoids the NULL reads by duplicating the text.

So it is not "FTS5 forces `withoutRowId: false`": **the design that keeps the `LIKE` fallback needs
rowids and the generated columns; the design that keeps `WITHOUT ROWID` loses the fallback.**

**The traps.** `searchFixtureCatalogue.ts` enshrines 17 traps (`SEARCH_FIXTURE_TRAPS`) that every
search layer must satisfy; `foldSearchText` is lowercase + NFD + strip U+0300–U+036F
(`packages/sync-core/src/searchIndexConfig.ts:48-53`). Run against a trigram FTS5 index over
name/sku/barcode on 3.53.4, terms AND-ed as quoted phrases:

| Configuration | Result |
|---|---|
| `tokenize='trigram remove_diacritics 1'` over raw text | **15/17** |
| `tokenize='trigram'` over JS-folded text | **15/17** |
| `tokenize='unicode61 remove_diacritics 2'` (word tokens) | 14/17 — loses `compound-substring` (`board` in "Skateboard") and both AND-across-terms traps |

The two `MATCH` misses are `short-term-substring` (`k2` → "K2 Skis") and `short-qualifier-counts`
(`MY საბარგული` → 3013, not 3014 — the Georgian report behind #2037, where a two-character qualifier
separates the rows), for the documented reason: "Substrings consisting of fewer than 3 unicode
characters do not match any rows when used with a full-text query"
(<https://sqlite.org/fts5.html#the_trigram_tokenizer>).

**The `LIKE` fallback works, and it is cheap.** Re-measured on the generated-column content table,
all 17 traps, both tokenizers (the earlier `no such column: T.name` was my test schema's fault, not a
property of external content):

| Path | `trigram` | `trigram remove_diacritics 1` |
|---|---:|---:|
| `MATCH` alone | 13/17 (also loses both accent traps — the stored text is raw) | **15/17** |
| `LIKE` alone over the three columns | 15/17 | 15/17 (`LIKE` never folds) |
| **`MATCH` ≥3 chars, `LIKE` below** | — | **17/17** |

`remove_diacritics 1` is therefore required (it is what passes `accent-fold` and `unicode-fold`), and
`LIKE` covers exactly what trigrams cannot: `k2` finds "K2 Skis", and `%my%` AND `%საბარგული%`
returns 3013 and not 3014. The union is **17/17** because no trap is both short and accented. A term
that *was* both would need a folded stored column, which SQLite cannot compute in a generated column
without ICU or a registered UDF.

**Cost of that fallback: 6.4 ms at 20,000 products**, scanning `name`/`sku`/`barcode` on the content
table. It is unindexed — a two-character pattern has no trigram to look up, and `remove_diacritics 1`
disables indexed LIKE/GLOB outright ("Unless the remove_diacritics option is set"; plans: `INDEX 0:L0`
with the default tokenizer, bare `INDEX 0:` with it). But it scans ~52 characters per row, **not**
catalogue bytes, so it is nowhere near the `$regex` shape `catalogue-search-blob.ts`'s header rejected
(265 ms at 20k) and sits far under the 250 ms debounce.

**What that means for the prize.** The earlier reading — short terms keeping a JS structure and the
full read alive — is withdrawn: **FTS5 can retire the blob completely**, so §16's hoped-for deletion
is real. It costs the generated-column rebuild (§6) plus a 6 ms scan on short terms.

## 2. The platform asymmetry

Storage runs in the **Electron main process** (`adapters/storage/index.electron.ts`,
`getRxStorageIpcRenderer`), a separate OS process from the heap-capped renderer `WOOCOMMERCE-POS-W8`
crashes; on web it is a DedicatedWorker (`adapters/storage/index.web.ts`, `getRxStorageWorker`) in the
same process. #2026 comment 2: *"A browser worker does not create a distinct OS process and gets no
exemption from tab or browser-wide memory pressure; it relieves window heap and main-thread execution,
which is worth having on web but is not evidence those crashes stop."* So:

| Platform | Today | Under FTS5 |
|---|---|---|
| Electron | blob rows + text in the **renderer** heap (~2 MB at 20k); built by a full read across IPC | index on **disk in the main process's** database file; page cache in main-process wasm/native memory. A genuinely different heap — the #2026 fix, for the process that actually crashes. |
| Web | blob in the **tab's** heap; built by a full read across the worker RPC | index on **disk in OPFS**; page cache in the worker's wasm heap — same OS process, same pressure. The win is the **avoided read**, not avoided heap. |

On native the blob sits on the UI JS thread (§16) and nothing here applies until #2138/#2145 resolve
that engine. So FTS5's heap argument is Electron-only — and §16's W8 finding already weakened it from
both ends. What survives everywhere is the avoided full read, which §6 shows is purchasable cheaper.

## 3. Availability

- **Official `@sqlite.org/sqlite-wasm`: yes.** `ext/wasm/GNUmakefile:439` lists `-DSQLITE_ENABLE_FTS5`
  under `SQLITE_OPT.full-featured` (<https://github.com/sqlite/sqlite/blob/master/ext/wasm/GNUmakefile>),
  and #2138 records it for the exact artifact we would ship: "`@sqlite.org/sqlite-wasm` 3.53.4-build1
  (SQLite 3.53.4, `ENABLE_FTS5`, `MAX_VARIABLE_NUMBER=32766`, `THREADSAFE=0`)" —
  `spikes/2138-rxdb-sqlite-wasm/RESULTS.md:3-5` on `origin/next`.
- **wa-sqlite: not in the stock build; reachable only by compiling your own.** Its `WASQLITE_DEFINES`
  block (Makefile:101-115) ends with a `$(WASQLITE_EXTRA_DEFINES)` escape hatch and lists no FTS5, so
  the distributed artifacts have none — but any user can add it there, and both corruption reporters
  did: #320's ran `make WASQLITE_EXTRA_DEFINES="-DSQLITE_ENABLE_FTS5 -DSQLITE_ENABLE_GEOPOLY=1
  -DSQLITE_ENABLE_RTREE=1"`, #258's "compil[ed] a separate build that included the FTS5 extension"
  (and confirmed the corruption "went away" on "the default artifacts distributed by wa-sqlite (i.e.
  without FTS5)").

One more item on the official build's side of §12 — a tiebreaker between the two wasm packages, which
§12 already decided, not between engines.

## 4. The risk: what the two wa-sqlite corruption reports actually were

Both are FTS5-with-triggers workloads, as §16 said.

**[#258](https://github.com/rhashimoto/wa-sqlite/issues/258)** — "Database Disk Image Malformed
(IDBatchAtomicVFS, FTS5)", 2025-04-05, **still open**. A custom FTS5 build plus triggers feeding a
contentless FTS5 table; frequent corruption. Removing FTS5 stopped it; enabling FTS5 but leaving it
*unused* did not reproduce it. The thread converged on a VFS bug — SQLite can write past the file-size
offset and **IDBBatchAtomicVFS** never fills the skipped pages, so reading a never-written page yields
a malformed image; sibling **IDBMirrorVFS** had the same class, fixed in PR #259. The maintainer's
last word is that writes-beyond-EOF explain the 1 GB case but feel "less likely" at the sizes
originally reported, so #258's own root cause is unconfirmed.

**[#320](https://github.com/rhashimoto/wa-sqlite/issues/320)** — "Database Disk Image Malformed
(WriteAheadVFS, FTS5, GEOPOLY)", 2026-04-17, **closed 2026-04-22**. One connection, no concurrency,
triggers maintaining fulltext and geopoly indexes; two WAL files grew past 6 GB and the database then
failed to open. The reporter: *"I could not seem to get the database corruption to occur without the
triggers present."* The maintainer reproduced it and fixed **two bugs in OPFSWriteAheadVFS**: some WAL
transactions carried a file size disagreeing with the page-1 header (what raises `SQLITE_CORRUPT` via
`xFileSize()`), and pages from the first transaction after a WAL rollover were read from the
*previous* WAL file — "poor state management where the WAL file identifier was stale".

**Does it apply to the official build with sahpool?** Stated carefully: **no FTS5 defect has been
isolated in either report; both are FTS5-with-triggers workloads; #320 was root-caused to two bugs in
wa-sqlite's own VFS and fixed, while #258 remains open with its root cause unconfirmed; and neither
implicates the official build or `opfs-sahpool`.** Every defect actually named is in a wa-sqlite VFS —
hand-written IndexedDB/OPFS journalling outside SQLite's own test matrix — whereas `opfs-sahpool` is
written and tested by the SQLite authors, and #2138 verified WAL really is WAL on it. But #258's open
state means the FTS5 workload itself has not been cleared, only that nothing points at our VFS. The
transferable lesson is narrower and real:
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

The catch is upstream of it: the selector must first *translate*, or `prepareSQLiteQuery` sets
`nonImplementedOperator` and `query()` takes the 50-row paging branch that discards the WHERE and
re-matches every row with `getQueryMatcher` (§16) — and mingo will not match a synthetic `$fts`
operator, so that branch returns nothing however the SQL is rewritten. The term must ride a
*translatable* selector (equality on a sentinel field no document carries) that the modifier
recognises — a private protocol, invisible to
`packages/core/src/query/query-state-translator.ts`'s residual matcher unless it is taught too.

**(b) A custom storage method / side channel** — also what the projection read needs (§6). #2026
comment 2 found the obstacle: premium's `exposeWorkerRxStorage` forwards only storage, messages and
send, not `database` and `customRequestHandler`, and `customRequest()` creates and closes a channel
per call, so "a persistent owner connection has to be defined rather than assumed". Our worker entry
is ours (`scripts/opfs-worker-entry.mjs`); adding a handler is easy, keeping it alive is the work.

**(c) What #2143 did.** `spikes/2143-storage-benchmark/worker-sqlite.mjs` needed all three: a
`queryModifier` rewriting `ORDER BY` into `WHERE <predicate> ORDER BY`; a monkey-patch of
`instance.query`/`instance.count`, because the modifier alone could not reach the paths it needed; and
a `self.addEventListener('message')` channel for raw SQL. Its translator emits `LIKE`/`GLOB` for
`$regex` — the projection-and-scan shape, not `MATCH`.

Net: buildable, none of it vendor-supported end to end, and **the projection read needs the same
custom path** (§6), as do #2150's promoted columns and the pushed products sort — an argument for
doing the query-layer work once, not for FTS5.

## 6. Does it tip the decision — and what the alternative costs

**No.** FTS5 can only be had on SQLite, so it can only *add* to SQLite's side — and a tiebreaker has
to be worth more than the cheapest way to get the same benefit. It is not.

**The alternative #2143 named: a projection read.** Read only the searchable fields and hand them to
the existing folded blob. Locally at 20k (3.53.4, native; same caveat as §1):

| Read | Time | Bytes returned |
|---|---:|---:|
| `SELECT data … WHERE deleted=0` (today's shape) | 13.6 ms | 38.50 MB |
| `SELECT id, json_extract(…)×3 …` (no generated columns) | 33.0 ms | 1.02 MB |
| **`SELECT id, name, sku, barcode`** (STORED generated columns) | **13.7 ms** | **1.02 MB** |

With the generated columns the projection is as fast as reading whole documents *and* returns **38×
fewer bytes**; without them `json_extract` parses each 1.9 KB document and costs 2.4× more. #2143
attributes the whole-table penalty specifically to marshalling ("SQLite pays wasm-to-JS marshalling
per byte returned, and the Windows runner pays it hardest"), so at Chrome's 2,410 ms for 38.5 MB
(≈63 µs/KB) a 1 MB payload is ~60 ms of marshalling — plausibly the shipped engine's 89 ms band,
**but that is an extrapolation and belongs in the #2143 harness as one added cell.**

**It is not a plain `find()`, and it is not engine-independent.** RxDB's `find()` returns whole
RxDocuments, and premium's query wrapper is
`SELECT COALESCE('[' || group_concat(data, ',') || ']', '[]') FROM (<query>)` — it needs a full `data`
column, so no field projection survives it. Getting `SELECT id, name, sku, barcode` out of the worker
needs the raw-SQL / custom-request path of §5(b), or a storage-adapter API, written per engine.
And it is only *needed* per engine: the shipped memory-resident engine already does this read in
89 ms and premium IndexedDB in 285 ms. **The projection read is the SQLite-specific fix for a
SQLite-specific regression**, riding the same custom read path §5 describes — not a free win that
helps everywhere, as an earlier draft of this file claimed.

It reads three STORED generated columns (`name`, `sku`, `barcode` as
`GENERATED ALWAYS AS (json_extract(data,'$.…')) STORED`); leave any JSON-extracted and its parse cost
stays. SQLite refuses to add a STORED column to a populated table (verified: `cannot add a STORED
column`), so it needs a table rebuild — the migration #2150 proposes for `_pos_user`/`_pos_store`, and
the schema §1 shows FTS5 needs. **One rebuild, three payoffs**; the columns measured at 0.19 ms per
upsert with no disk growth, so the rebuild is the cost, not the columns.

**Cost comparison, in work rather than money:**

| | Projection read | FTS5 |
|---|---|---|
| Search semantics | unchanged — the blob and its 17 traps keep passing | **17/17**: `MATCH` (`remove_diacritics 1`) ≥3 chars, `LIKE` below it — 6.4 ms at 20k |
| Query seam | **a custom storage read** (§5(b)) — premium's wrapper needs a full `data` column, so `find()` cannot project | the same custom path, plus a sentinel-selector protocol through `queryModifier`, plus residual-matcher changes; `findDocumentsById` is not covered |
| Storage settings | none | `withoutRowId: false` **if** the `LIKE` fallback is kept (then re-take #2143's numbers); a contentless design keeps `WITHOUT ROWID` but loses the fallback |
| Schema | the #2150 rebuild | **the same #2150 rebuild** |
| Write cost | 0.19 ms per upsert — unchanged within noise | 0.38 ms per upsert (~2×), resync ~7× |
| Disk | no measurable growth at 20k | ~+3 MB at 20k |
| Crash surface | none | three triggers per collection, the exact workload behind wa-sqlite #258/#320; must go in the #2144 harness |
| Engine-independent? | no — the shipped engine (89 ms) and IndexedDB (285 ms) do not need it | no |
| Deletions earned | none | `search.ts`, the folded blob, the FlexSearch pipeline, the #2070 export-history bound, the #2020 append bound, the rebuild path, the #2073 sizing question |

The deletion row is the only one FTS5 wins, and §16 is right that it is substantial — a subsystem
patched at least four times. But it is a reward for a decision already made, collectable later.

**Recommendation.** Weight FTS5 at zero in the engine choice: it is a consequence of choosing SQLite,
not an input. **If SQLite wins on durability (#2144) and topology (#2146), satisfy #2143's
search-index condition with a projection read through a custom storage read (§5(b)), riding #2150's
generated columns** — cheap, measured, and it leaves today's blob and all 17 traps untouched. Revisit
FTS5 after that on the same schema, as a deletion project: it now looks able to retire the blob
completely, so the prize is real — but it doubles the write, needs §1's rowid decision, and its
triggers must go through the crash harness first.

## What I could not verify

- **The projection read's wasm cost.** Extrapolated from #2143's per-byte marshalling; one cell in
  the existing harness would settle it. I re-ran no benchmark, per the ticket.
- **FTS5 under wasm/OPFS.** All local measurements are native SQLite 3.53.4 via Python (M4 Pro,
  default unix VFS). The version matches `@sqlite.org/sqlite-wasm` 3.53.4-build1 and FTS5 semantics
  are identical, so trap results and query plans transfer; timings and file sizes are indicative only
  — including the 6.4 ms `LIKE` fallback, which is the one number a till would feel.
- **`@sqlite.org/sqlite-wasm`'s compile options read from the artifact.** Not installed in any local
  tree (the main clone cannot install), so §3 cites #2138's recorded `ENABLE_FTS5` and upstream
  `ext/wasm/GNUmakefile:439` rather than a local `PRAGMA compile_options`.
- **wa-sqlite #258's root cause** (still open, maintainer unconvinced by his own writes-past-EOF
  theory) and **native React Native**, which is out of scope and blocked on #2138/#2145.
