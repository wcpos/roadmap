# Is FTS5 enough of a prize to break a tie? — research, 2026-09-18

Wayfinder ticket [wcpos/monorepo#2147](https://github.com/wcpos/monorepo/issues/2147), for the 2.0
storage-engine decision. Sibling of §16 of `docs/research/2026-09-17-filesystem-storage-durability.md`,
which raised the question; this file answers its five items and adds the numbers §16 did not have.

**Verdict — no, FTS5 does not break the tie, and it should carry no weight in the engine choice.**

1. The prize is real but conditional: FTS5 is the only option where the search index is never built
   in JS, and it can only be had by choosing SQLite first — a *consequence* of the decision, not an
   input to it.
2. Most of the prize is purchasable without it. The avoided read is worth 2,410 / 1,440 / 10,713 ms
   (#2143); a **projection read** — `SELECT id, name, sku, barcode` — cuts the marshalled bytes 38×
   for 2.4× more SQL time natively (33.0 vs 13.6 ms; the net wasm win is an extrapolation until a
   harness cell measures it) and feeds today's blob unchanged, all 17 traps passing.
   Not free of plumbing: premium's wrapper needs a full `data` column, so it takes a custom storage
   read (§5(b)) — which issues the `json_extract` expressions directly, so the catalogue tables need
   **no schema change at all**; and it fixes a SQLite-specific regression, not every engine.
3. FTS5 **can** serve all 17 traps — `MATCH` over **folded** columns with a **folded query** at three
   characters or more (15/17; `remove_diacritics` is then unnecessary, and worse, since it does not
   strip Greek tonos) plus `LIKE` below that (`k2`, `MY საბარგული`), 6.4 ms at
   20k — so it could retire the catalogue blob. Four designs reach it: external content bound to the
   base table (layout change), or to a filtered **view** (no layout change), a self-owned table
   (+5.5 MB of duplicated text), or contentless. **Folded storage is FTS5's cost, not the projection
   read's** — the blob folds what it is handed.
4. Its cost, for the direct external-content design as measured: upsert 0.19 → 0.38 ms (~2×), resync
   ~7×, ~+3 MB of index at 20k plus +15.2 MB for its STORED folded columns on the production shape
   (the other designs cost differently or are unmeasured, §1). On premium's shipped columns FTS5 still answers
   `MATCH` from the index and returns rowids — what it loses is **column-value reads, `LIKE`, and
   `'rebuild'`, so with an id↔rowid mapping it remains queryable and short-term blind; repair is a
   manual drop-and-repopulate rather than the built-in command.**
5. The risk named in §16 is not an FTS5 defect: no FTS5 defect has been isolated in either wa-sqlite
   report; both are FTS5-with-triggers workloads; #320 was root-caused to wa-sqlite's own VFS and
   fixed, #258 is still open and unconfirmed; neither implicates the official build or `opfs-sahpool`.

Recommendation: **if SQLite wins on durability, satisfy #2143's search-index condition with a
projection read through a custom storage read that issues `json_extract(data,'$.payload.*')`
directly against the existing products and variations tables — no columns, no migration; revisit
FTS5 after the engine is decided.**

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

**The triggers must know about soft deletes.** RxDB deletes by setting the `deleted` flag, hard-
deleting only later in `cleanup()`, so an unconditional `AFTER UPDATE` re-indexes a tombstone's text
and leaves deleted products matching. Skip the insert arm when `new.deleted != 0`, guard the
**delete arm** to `old.deleted = 0`, and filter `deleted = 0` on every `LIKE` fallback path anyway —
skipping the insert only cleans the index, and the fallback enumerates the content or base table,
where the tombstone still sits (or read through the filtered view) — otherwise
`cleanup()`'s later hard-delete of an already-unindexed tombstone issues a second FTS5 `'delete'` for
a rowid no longer indexed, which can surface as "database disk image is malformed" (updating an
already-deleted document has the same hazard). `'rebuild'` needs the same exclusion — a content
**view** filtered on `deleted = 0`, or a delete pass afterwards.

**But the content table needs columns FTS5 can read by name, and premium's has none.** The table I
first measured is premium's shipped shape — `id, revision, deleted, lastWriteTime, data json` — with
`content='p'` and triggers supplying `json_extract(new.data,'$.payload.name')`. It indexes and
MATCHes, but external content resolves declared columns *against the content table* whenever it reads
them, so there `SELECT name FROM fts …`, `… WHERE name LIKE ?` and
`INSERT INTO fts(fts) VALUES('rebuild')` all raise `no such column: T.name` (verified, 3.53.4). So
**on premium's shipped columns an FTS5 index is queryable but loses the built-in repair**: `MATCH`
still answers from the index and returns rowids, so with an id↔rowid mapping it serves searches; what
is lost is column-value reads, `LIKE`, and `'rebuild'` — the documented repair for a drifted index.
A drifted index can still be dropped, recreated and repopulated from the intact base table with the
triggers' own `json_extract` expressions, so the loss is convenience, not repairability.

**The production JSON paths are nested, and my fixtures' were not.** The persisted document is
`{uuid, remoteId, <promoted columns>, payload, sync, local}` with the Woo fields under `payload`
(§16 of the 2026-09-17 doc; #2143's schemas index `payload.name`), and `LEGACY_SEARCH_FIELDS`
(`packages/query/src/engine-adapter/collection-map.ts:34`) are *legacy flattened* spellings resolved
against `legacySearchSnapshot`, which spreads `payload` to the top level. The real columns are
**`$.payload.name`, `$.payload.sku`, `$.payload.barcode` for products, and `$.payload.sku`,
`$.payload.barcode` for variations** — variations carry no `name`. Verified on the production shape,
root-level `$.name` yields **NULL** while `$.payload.name` yields the value, so the path is
load-bearing for correctness — but **not** for the timings: re-measured at 20k, nested paths cost seed
0.10 → 0.11 s and upsert 0.19 → 0.21 ms against the root-level fixture, the same extract cost class.
It does move the disk figure; see below.

**Measured cost** (SQLite 3.53.4 via Python, M4 Pro, default unix VFS — same SQLite version as
`@sqlite.org/sqlite-wasm` 3.53.4-build1 but *not* wasm and *not* OPFS, so read ratios; 20k products of
~1.9 KB, trigram FTS5 over name/sku/barcode, VACUUMed, triggers as above):

| Configuration | 20k seed (one txn) | single-row upsert + commit | database file |
|---|---:|---:|---:|
| baseline, `data json` only | 0.06 s | 0.20 ms | 41.3 MB |
| **+3 STORED generated columns** (no FTS5) | 0.13 s | **0.19 ms** | **41.3 MB** |
| + generated columns + FTS5 `detail=full` | 0.42 s | **0.38 ms** | 44.2 MB (**+2.9 MB**) |

So: **FTS5 roughly doubles a product upsert (0.19 → 0.38 ms), costs ~7× on a resync and ~3 MB on disk
at 20k**, against the 2 MB of *renderer heap* the blob costs today (`catalogue-search-blob.ts:18-24`).
Disk is the right place for it; the write multiplier is the price. **The three STORED generated
columns are nearly free on writes**, so the column half of the migration is cheap on time and the FTS5
half is what costs — but **on disk they are not free on the production shape**: with nested
`$.payload.*` paths the same three columns took 20k products from 41.3 to **56.5 MB (+15.2 MB)**,
where the root-level fixture showed none. That is the page-packing cliff again (~1.9 KB rows crossing
two-per-page at 4 KB), now landing on the shape we actually persist — size it against a real
catalogue before quoting either number. The projection read needs no generated column at all: the
custom read issues the `json_extract` expressions directly (the 33.0 ms row in §6, 2.4× the native
whole-document SQL time; its wasm cost is unmeasured), so STORED columns are an FTS5-side choice, not
the migration's, and even FTS5 can use `VIRTUAL` ones (indexable, UDF-callable) instead. (`detail=column`/`none` shrink the index to +2.2 / +1.0 MB, but the docs cap full-text
queries there at three-character tokens. That is not fatal: a longer term can be decomposed into
overlapping three-code-point tokens joined by `AND` and the superset verified with `LIKE` on the
folded columns the short-term fallback already needs. Unevaluated here, so the +2.9 MB is the
measured ceiling, not the floor.)

**A second constraint nobody has recorded: premium's tables are `WITHOUT ROWID`** — every collection
is `CREATE TABLE "<collection>-<version>"(id TEXT … PRIMARY KEY …, data json) WITHOUT ROWID`
(`…/storage-sqlite/sqlite-storage-instance.js`, `createSQLiteStorageInstance`; the setting defaults
on, `sqlite-types.d.ts:47-52`). FTS5 external content addresses rows by rowid and such a table has
none
(<https://www.sqlite.org/withoutrowid.html> §1). Verified on 3.53.4: `INSERT INTO fts(fts)
VALUES('rebuild')` raises `no such column: T.rowid`, and an `AFTER INSERT` trigger using `new.rowid`
raises `no such column: new.rowid` when it fires.

`content_rowid='id'` does not rescue it: FTS5 rowids are integers and `id` is TEXT. This binds the
direct external-content design only — so **the two constraints above together make one design fork:**

| Design | Base table | Traps | Measured cost at 20k |
|---|---|---|---|
| **External content over a rowid table** + folded generated columns | `withoutRowId: false` — layout and primary-key path change, so **#2143's numbers need re-taking** | **17/17** (`'rebuild'`, column reads and `LIKE` all verified working) | index +2.9 MB, upsert 0.19 → 0.38 ms, `LIKE` 6.4 ms as measured with STORED folded columns, which add +15.2 MB on the production shape; with VIRTUAL UDF-backed columns instead, no column disk cost but the read and `LIKE` costs are unmeasured |
| **Contentless** (`content=''`, `contentless_delete=1`) + base-table folded columns | `WITHOUT ROWID` kept — **#2143's numbers stand** | **17/17** — `MATCH` for long terms, and short terms by `LIKE` on the base table's folded columns, which return the text `id` directly | unmeasured; costs the mapping table and a join on every query that involves `MATCH` (long or mixed terms) — contentless columns, `UNINDEXED` id included, read back `NULL`, so `MATCH` returns only the FTS rowid; a pure short-term `LIKE` reads the base table, which carries the text `id`, and needs no join |
| **Regular, self-owned FTS5 table** (own rowids, `docid UNINDEXED`, text duplicated) | `WITHOUT ROWID` kept — **#2143's numbers stand** | **17/17** — `LIKE` runs over its own stored text | +5.5 MB (92.2 → 97.7); upsert 0.30 → 0.72 ms; `LIKE` **2.2 ms** |

**A fourth variant sidesteps the layout change entirely:** bind external content to a **view**
filtered on `deleted = 0` exposing the mapped integer as `content_rowid`, with the same id↔rowid
mapping — `'rebuild'`, column reads and `LIKE`, without `withoutRowId: false` and without duplicated
text.

`contentless_delete=1` (3.43.0+, now preferred by the docs) is better than §16 implied: verified on
3.53.4, ordinary `DELETE … WHERE rowid=?` and `UPDATE` both work and need **no** original values —
that contract binds only *legacy* contentless tables, where both statements are refused outright. Its
real cost is the missing column values. The external-content design must map our TEXT document id
to an integer FTS rowid, since a `WITHOUT ROWID` table offers a trigger no `new.rowid`. For the
self-owned table the map is an optimisation, not a requirement — FTS5 assigns the rowid on insert,
`docid UNINDEXED` reads back, and triggers can `DELETE`/`UPDATE` by `docid` (a virtual-table scan,
which is why the measurement used an auxiliary
`map(rid INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE)`). The same holds for contentless on
3.47+: `contentless_unindexed=1` persists `UNINDEXED` columns so a `docid` reads back from `MATCH`,
and with `contentless_delete=1` the triggers can act by that id, so its map too is optional
(unverified here; the 3.53.4 target supports the option).

So it is not "FTS5 forces `withoutRowId: false`" — **every design here can reach 17/17**, and only
external content bound *directly* to the base table needs the layout change.

**The traps.** `searchFixtureCatalogue.ts` enshrines 17 (`SEARCH_FIXTURE_TRAPS`) that every search
layer must satisfy; `foldSearchText` is lowercase + NFD + strip U+0300–U+036F
(`packages/sync-core/src/searchIndexConfig.ts:48-53`). Against a trigram FTS5 index over
name/sku/barcode on 3.53.4, terms AND-ed as quoted phrases:

| Configuration | `MATCH` | + `LIKE` below 3 chars |
|---|---|---|
| `trigram remove_diacritics 1`, raw text, raw query | **15/17** | 15/17 — `LIKE` misses non-ASCII (see below) |
| `trigram remove_diacritics 1`, **folded** text and query | **15/17** | **17/17** |
| **`trigram`, folded text and query** (no `remove_diacritics`) | **15/17** | **17/17** |

(`unicode61` word tokens score 14/17 — trigram is the only viable tokenizer.)

The two `MATCH` misses are `short-term-substring` (`k2` → "K2 Skis") and `short-qualifier-counts`
(`MY საბარგული` → 3013, not 3014 — the Georgian report behind #2037, where a two-character qualifier
separates the rows), for the documented reason: "Substrings consisting of fewer than 3 unicode
characters do not match any rows when used with a full-text query"
(<https://sqlite.org/fts5.html#the_trigram_tokenizer>).

**The `LIKE` fallback works, and it is cheap.** Re-measured on the generated-column content table,
all 17 traps, both tokenizers (the earlier `no such column: T.name` was my test schema's fault, not a
property of external content):

| Path (folded columns, folded query) | `trigram` | `trigram remove_diacritics 1` |
|---|---:|---:|
| `MATCH` alone | **15/17** | **15/17** |
| `LIKE` alone over the three columns | 15/17 | 15/17 |
| **`MATCH` ≥3 chars, `LIKE` below** | — | **17/17** |

**`remove_diacritics` is not required — folding both sides is.** An earlier draft scored plain trigram
13/17, but that came from folded columns queried with *unfolded* terms; the blob folds the query too,
and with both sides folded plain `trigram` equals `remove_diacritics 1` at 15/17, accent traps
included. Two reasons to fold and drop the option: it **is not equivalent to `foldSearchText` for all
scripts** — verified, SQLite's table does not strip Greek tonos, so a stored `άλογο` MISSES the query
`αλογο` under both tokenizers while folding both sides matches, costing us long accented searches the
blob finds today — and it disables FTS5's indexed LIKE/GLOB, though that is moot here: the short-term
fallback has no trigram to look up, and `LIKE ? ESCAPE '\'`, which the escaping contract below
requires, takes the bare virtual-table scan rather than the `L0` plan even with the default tokenizer.
So the requirement is *fold both sides*, and
`LIKE` covers exactly what trigrams cannot: `k2` finds "K2 Skis", and `%my%` AND `%საბარგული%`
returns 3013 and not 3014. The union is **17/17** because no trap is both short and accented. A term
that *was* both would need a folded stored column, which SQLite cannot compute in a generated column
without ICU or a registered UDF.

**The fallback must run over FOLDED stored text.** SQLite's `LIKE` case-folds **ASCII only**, while
`foldSearchText` lowercases and NFD-strips Unicode, and `remove_diacritics` applies to `MATCH` alone.
Verified: a stored `ΣΚΙ Helmet` or `ЩИТ Board` is found by `LIKE '%σκ%'` / `'%щи%'` **only** when the
column holds the folded value (raw text returns nothing; ASCII like `k2` matches either way). So the
generated columns — or a self-owned table's duplicated text — must hold the *folded* value, from a
folded field the app writes into the document or a folding function on the connection.
**Contrary to expectation, a generated column CAN call an application-defined deterministic
function** — verified `STORED` and `VIRTUAL` with `wcpos_fold` registered via `createFunction`
(sqlite-wasm exposes the same on its OO1 `DB`). The catch is the failure mode: without the function
registered, reads of the stored value and `PRAGMA integrity_check` succeed but **every write fails
with `unknown function: wcpos_fold()`** — tractable for our single storage-worker connection, at the
cost of a database no other tool can write. With folded columns the union is **17/17**, re-verified
end to end; the blob already folds both sides, so this is parity, not a new semantic.

**The folded storage this needs is an FTS5 cost, not a projection cost** — the blob folds what it is
handed, so a projection read is fine on raw columns (§6). Measured natively (Python UDF, *not* wasm):
folded columns via a registered `wcpos_fold` cost seed 0.09 → 0.12 s, upsert 0.20 → 0.21 ms and **no
disk growth** — nearly free, though three UDF calls per row cross the wasm↔JS boundary on our stack
and that crossing is **unmeasured**. App-written folded fields need no UDF but grew this fixture
41.3 → 77.4 MB: a **page-packing cliff** (~1.9 KB rows crossing two-per-page at 4 KB), not a linear
cost, so that route needs sizing against a real catalogue.

**Cost of that fallback: 6.4 ms at 20,000 products**, scanning `name`/`sku`/`barcode` on the content
table — a per-collection figure, like every number in this section: variations are a second table,
trigger set and fallback scan, so a catalogue-wide total is the sum over both. A two-character pattern has no trigram to look up either way, and the indexed LIKE/GLOB path
that `remove_diacritics` would disable is unavailable regardless: the literal-safe `LIKE ? ESCAPE '\'`
the contract below requires takes the bare `INDEX 0:` scan even with the default tokenizer, so neither
the short-term fallback nor a reduced-detail verification scan is indexed. But with materialised (STORED or
self-owned) folded columns it scans ~52 characters per row, **not**
catalogue bytes, so it is nowhere near the `$regex` shape `catalogue-search-blob.ts`'s header rejected
(265 ms at 20k). One caveat before calling it far under the 250 ms debounce: in the external-content
and contentless designs the folded columns sit in the same records as the ~1.9 KB JSON payload, so
an unindexed scan still walks the pages of the whole table; 6.4 ms is a warm native page cache, not
OPFS cold. Keeping the scan off the payload pages needs a query shape that can use an index:
separate per-column indexes do not cover a `name OR sku OR barcode` predicate, and an
external-content `LIKE`'s row-by-row content lookup bypasses them anyway, so it takes a direct
base-table query over one composite covering index, per-column index scans joined by `UNION`, or
the self-owned table's compact text. Unmeasured here.

**Two escaping contracts, and no trap covers either.** `LIKE` must be emitted as
`LIKE ? ESCAPE '\'` with `%`, `_` and `\` escaped in the term (as #2143's translator already does for
`$regex`); and a literal `"` in a term (`12" ruler`) terminates the quoted FTS phrase, so **embedded
quotes must be doubled** — binding the MATCH string as a parameter does *not* escape FTS query
grammar, since the parameter is the whole query expression. **`SEARCH_FIXTURE_TRAPS` covers neither**,
so traps carrying a `%`/`_` and a `"` must be added before either path is trusted. Routing needs its
own trap too: the ≥3-character test must count **Unicode code points after folding** by iterating,
not `.length` — `😀a` is `.length` 3 but two code points, and would be mis-routed to `MATCH`, which
cannot serve it.

**What that means for the prize.** The earlier reading — short terms keeping a JS structure and the
full read alive — is withdrawn: **FTS5 can retire the blob completely**, so §16's hoped-for deletion
is real, at the cost of folded columns plus a 2–6 ms scan on short terms.

## 2. The platform asymmetry

Storage runs in the **Electron main process** (`adapters/storage/index.electron.ts`,
`getRxStorageIpcRenderer`), a separate OS process from the heap-capped renderer `WOOCOMMERCE-POS-W8`
crashes; on web it is a DedicatedWorker (`adapters/storage/index.web.ts`, `getRxStorageWorker`) in the
same process — #2026 comment 2: *"a browser worker does not create a distinct OS process and gets no
exemption from tab or browser-wide memory pressure … not evidence those crashes stop."* So:

| Platform | Today | Under FTS5 |
|---|---|---|
| Electron | blob rows + text in the **renderer** heap (~2 MB at 20k); built by a full read across IPC | index on **disk in the main process's** database file; page cache in main-process wasm/native memory. A genuinely different heap — the #2026 fix, for the process that actually crashes. |
| Web | blob in the **tab's** heap; built by a full read across the worker RPC | index on **disk in OPFS**; page cache in the worker's wasm heap — same OS process, same pressure. The win is the **avoided read**, not avoided heap. |

On native the blob sits on the UI JS thread (§16) and nothing here applies until #2138/#2145 resolve
that engine. So FTS5's heap argument is Electron-only, and §16's W8 finding already weakened it from
both ends; what survives everywhere is the avoided full read, which §6 buys cheaper.

## 3. Availability

- **Official `@sqlite.org/sqlite-wasm`: yes.** `ext/wasm/GNUmakefile:439` lists `-DSQLITE_ENABLE_FTS5`
  under `SQLITE_OPT.full-featured`
  (<https://github.com/sqlite/sqlite/blob/master/ext/wasm/GNUmakefile>), and #2138 records it for the
  exact artifact we would ship — "3.53.4-build1 (SQLite 3.53.4, `ENABLE_FTS5`, …)",
  `spikes/2138-rxdb-sqlite-wasm/RESULTS.md:3-5` on `origin/next`.
- **wa-sqlite: not in the stock build; reachable only by compiling your own.** Its `WASQLITE_DEFINES`
  block (Makefile:101-115) lists no FTS5 and ends with a `$(WASQLITE_EXTRA_DEFINES)` escape hatch, so
  the distributed artifacts have none — but any user can add it there, and both reporters did: #320's
  ran `make WASQLITE_EXTRA_DEFINES="-DSQLITE_ENABLE_FTS5 …"`, #258's "compil[ed] a separate build that
  included the FTS5 extension" (and confirmed the corruption "went away" on "the default artifacts
  distributed by wa-sqlite (i.e. without FTS5)").

One more item on the official build's side of §12 — a tiebreaker between the wasm packages, which §12
already decided, not between engines.

## 4. The risk: what the two wa-sqlite corruption reports actually were

Both are FTS5-with-triggers workloads, as §16 said.
**[#258](https://github.com/rhashimoto/wa-sqlite/issues/258)** — "Database Disk Image Malformed
(IDBatchAtomicVFS, FTS5)", 2025-04-05, **still open**. A custom FTS5 build plus triggers feeding a
contentless table; frequent corruption. Removing FTS5 stopped it; enabling FTS5 but leaving it
*unused* did not reproduce it. The thread converged on a VFS bug — SQLite can write past the file-size
offset and **IDBBatchAtomicVFS** never fills the skipped pages, so reading a never-written page yields
a malformed image (sibling **IDBMirrorVFS**, same class, fixed in PR #259). The maintainer's last word
is that this explains the 1 GB case but feels "less likely" at the reported sizes, so #258's root
cause is unconfirmed.

**[#320](https://github.com/rhashimoto/wa-sqlite/issues/320)** — "Database Disk Image Malformed
(WriteAheadVFS, FTS5, GEOPOLY)", 2026-04-17, **closed 2026-04-22**. One connection, no concurrency,
triggers maintaining fulltext and geopoly indexes; two WAL files grew past 6 GB and the database
failed to open. The reporter: *"I could not seem to get the database corruption to occur without the
triggers present."* The maintainer reproduced it and fixed **two bugs in OPFSWriteAheadVFS**: some WAL
transactions carried a file size disagreeing with the page-1 header (what raises `SQLITE_CORRUPT` via
`xFileSize()`), and pages from the first transaction after a WAL rollover were read from the
*previous* WAL file.

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

RxDB's Mango cannot express `MATCH`. Two seams reach it, and they are **alternatives, not stages**.

**(a) `queryModifier`.** Premium exposes `queryModifier?: RxStorageSQLiteQueryModifier<any>`
(`rxdb-premium/dist/types/plugins/storage-sqlite/sqlite-types.d.ts:56-63`): "Can be used to modify the
prepared query before sending it to SQLite … replace a regex with %LIKE% expressions". Applied in
`query()` (both branches) and `count()`, **not** `findDocumentsById`. It may rewrite SQL and params
wholesale, but the caller wraps the result in `SELECT COALESCE('[' || group_concat(data, ',') || ']',
'[]') FROM (<your query>)`, so the rewrite must still yield a `data` column — a
`… WHERE id IN (SELECT c.id FROM fts JOIN "<tbl>" c ON c.rowid = fts.rowid WHERE fts MATCH ?)` fits
for external content bound directly to a rowid table; the contentless and filtered-view designs join
through the id↔rowid mapping instead (`… JOIN map m ON m.rowid = fts.rowid` and `c.id = m.id`), and a
self-owned table joins its readable `docid` straight to `c.id`.
The catch is upstream: the selector must *translate*, or `prepareSQLiteQuery` sets
`nonImplementedOperator` and `query()` takes the 50-row paging branch that discards the WHERE and
re-matches with `getQueryMatcher` (§16) — mingo will not match a synthetic `$fts` operator, so that
branch returns nothing however the SQL is rewritten. The term must ride a *translatable* sentinel
selector the modifier recognises: a private protocol, invisible to the residual matcher unless taught.

**(b) A custom storage method / side channel** — **also exactly what the projection read needs (§6)**,
which is why it is the cheaper route: once the raw-SQL handler exists, it can run `MATCH` and return
ids or rows directly, and none of (a)'s sentinel protocol is needed. #2026 comment 2 found the
obstacle: premium's `exposeWorkerRxStorage` forwards only storage, messages and send, not `database`
and `customRequestHandler`, and `customRequest()` creates and closes a channel per call, so "a
persistent owner connection has to be defined rather than assumed". Our worker entry is ours
(`scripts/opfs-worker-entry.mjs`); adding a handler is easy, keeping it alive is the work.

**What #2143 did** — `worker-sqlite.mjs` used a `queryModifier`, a monkey-patch of
`instance.query`/`instance.count` where the modifier could not reach, and a `message` channel for raw
SQL. Net: buildable, none vendor-supported end to end, and **the projection read needs path (b)
anyway**, as do #2150's columns and the pushed sort — do the query-layer work once.

## 6. Does it tip the decision — and what the alternative costs

**No.** FTS5 can only be had on SQLite, so it can only *add* to SQLite's side — and a tiebreaker has
to be worth more than the cheapest way to get the same benefit. It is not.

**The alternative #2143 named: a projection read.** Read only the searchable fields and hand them to
the existing folded blob. Locally at 20k (3.53.4, native; same caveat as §1):

| Read | Time | Bytes returned |
|---|---:|---:|
| `SELECT data … WHERE deleted=0` (today's shape) | 13.6 ms | 38.50 MB |
| `SELECT id, json_extract(data,'$.payload.…')×3 … WHERE deleted=0` (direct expressions; a VIRTUAL column reads the same) | 33.0 ms | 1.02 MB |
| **`SELECT id, name, sku, barcode … WHERE deleted=0`** (STORED generated columns) | **13.7 ms** | **1.02 MB** |

With the generated columns the projection is as fast as reading whole documents *and* returns **38×
fewer bytes**; without them `json_extract` costs 2.4× more. #2143 attributes the whole-table penalty
to marshalling ("SQLite pays wasm-to-JS marshalling per byte returned"), so at Chrome's 2,410 ms for
38.5 MB (≈63 µs/KB) a 1 MB payload is ~60 ms — plausibly the shipped engine's 89 ms band, **but that
is an extrapolation and belongs in the #2143 harness as one added cell.**

**Every projection query and the custom-read contract must carry `WHERE deleted = 0`** — the raw-SQL
path bypasses RxDB's deleted filtering and tombstones persist until `cleanup()`, so an unfiltered
projection would feed deleted products into the blob.

**It is not a plain `find()`, and it is not engine-independent.** RxDB's `find()` returns whole
RxDocuments and premium's wrapper is
`SELECT COALESCE('[' || group_concat(data, ',') || ']', '[]') FROM (<query>)`, which needs a full
`data` column, so no field projection survives it: getting `SELECT id, name, sku, barcode` out of the
worker needs §5(b)'s raw-SQL path or a storage-adapter API, per engine. It is also only *needed* per
engine — the shipped engine already does this read in 89 ms, IndexedDB in 285 ms. **The projection
read is the SQLite-specific fix for a SQLite-specific regression**, not a free win everywhere as an
earlier draft claimed.

It reads `id, json_extract(data,'$.payload.name'), json_extract(data,'$.payload.sku'),
json_extract(data,'$.payload.barcode')` (variations: `sku` and `barcode` only) straight off the
existing products and variations tables (the blob covers both, §16 of the 2026-09-17 doc). **No
generated column is needed**: the raw-SQL path evaluates the expressions itself, and the benchmark row
above shows a VIRTUAL column reads no faster, so adding columns would buy a schema migration and an
expression evaluation on every write for nothing. **The values do not need to be folded either**:
`catalogue-search-blob.ts` applies `foldSearchText` to whatever fields it receives, so today's
semantics are preserved exactly. The read is the 33.0 ms row rather than 13.7 ms — a 2.4× native
SQL-side regression against 13.6 ms for whole documents, with the net wasm speedup an extrapolation
from the 38× byte reduction until the harness cell exists. Generated columns enter only if an index or
FTS5 wants a named column: `ALTER TABLE … ADD COLUMN` accepts a VIRTUAL one on a populated table and
refuses STORED (verified: `cannot add a STORED column`), so STORED, with its rebuild and +15.2 MB, is
confined to FTS5's external-content or contentless designs, and even there UDF-backed VIRTUAL folded
columns are the alternative (unmeasured read cost, §1). #2150's `_pos_user`/`_pos_store` promotion is
the one rebuild left, on **orders** — and a VIRTUAL-plus-index column is worth testing there before
committing to it.

**Cost comparison, in work rather than money:**

| | Projection read | FTS5 |
|---|---|---|
| Search semantics | unchanged — the blob and its 17 traps keep passing | **17/17**: `MATCH` over folded columns with a folded query ≥3 chars, `LIKE` below it — 6.4 ms at 20k |
| Query seam | **a custom storage read** (§5(b)) — premium's wrapper needs a full `data` column, so `find()` cannot project | **the same custom path plus a `MATCH` handler in it.** The §5(a) sentinel-selector/`queryModifier` route is an *alternative*, not an addition — take it only if the raw-SQL path is not built |
| Storage settings | none | `withoutRowId: false` **only** for external content bound *directly* to the base table (then re-take #2143's numbers). External content over a filtered view, self-owned and contentless all keep `WITHOUT ROWID` and all keep the `LIKE` fallback |
| Schema | **none** — direct `json_extract` expressions in the custom read; no columns, no migration | **two catalogue rebuilds** for STORED folded columns (external content, or contentless leaning on them), or none with UDF-backed VIRTUAL folded columns, which the triggers and the base-table `LIKE` can read (verified callable; read cost unmeasured); none for a self-owned table |
| Write cost | none — no columns to maintain (a STORED column would measure 0.21 ms per upsert) | direct external content 0.38 ms per upsert (~2×), resync ~7×; self-owned 0.72 ms; contentless and filtered-view unmeasured |
| Disk | none (a STORED column would add **+15.2 MB at 20k** on the production shape; none on the root-level fixture — a packing cliff) | direct external content ~+3 MB of index at 20k **plus +15.2 MB if its folded columns are STORED** on the production shape (none if VIRTUAL, at an unmeasured UDF read cost); self-owned +5.5 MB; contentless and filtered-view unmeasured (same STORED-or-VIRTUAL choice). All per collection: variations add a second index |
| Crash surface | none | three triggers per collection, the exact workload behind wa-sqlite #258/#320; must go in the #2144 harness |
| Engine-independent? | no — the shipped engine (89 ms) and IndexedDB (285 ms) do not need it | no |
| Deletions earned | none | the **catalogue blob** and the #2073 sizing question — but only for products/variations, the two collections that opt out of FlexSearch. `search.ts`, the FlexSearch pipeline and its #2070/#2020 history bounds still serve every other searchable collection and survive unless all of them are migrated, a cost not analysed here |

The deletion row is the only one FTS5 wins, and it is narrower than §16 implied: retiring the blob is
real; retiring the FlexSearch subsystem is not, unless every searchable collection moves.

**Recommendation.** Weight FTS5 at zero in the engine choice: it is a consequence of choosing SQLite,
not an input. **If SQLite wins on durability (#2144) and topology (#2146), satisfy #2143's
search-index condition with a projection read through a custom storage read (§5(b)) that issues
the `json_extract` expressions directly** — no columns, no migration, nothing on write or disk, a
33 ms native read for 1 MB (wasm unmeasured), semantics untouched because the
blob folds what it is handed, and all 17 traps keep passing. Revisit FTS5 afterwards, as a scoped
deletion project: it retires the catalogue blob but not the FlexSearch subsystem, it doubles the
write, it needs §1's design decision, its `LIKE` fallback is what forces folded storage (with the
costs recorded in §1), and its triggers must go through the crash harness first.

## What I could not verify

- **The projection read's wasm cost** — extrapolated from #2143's per-byte marshalling; one cell in
  the existing harness would settle it. I re-ran no benchmark, per the ticket.
- **The contentless design**, and the wasm cost of the `wcpos_fold` UDF per write — both unmeasured.
- **FTS5 under wasm/OPFS.** All local measurements are native SQLite 3.53.4 via Python (M4 Pro,
  default unix VFS); the version matches `@sqlite.org/sqlite-wasm` 3.53.4-build1 and FTS5 semantics
  are identical, so trap results and query plans transfer, but timings and sizes are indicative only.
- **`@sqlite.org/sqlite-wasm`'s compile options from the artifact** — not installed in any local tree
  (the main clone cannot install), so §3 cites #2138's record and upstream `GNUmakefile:439`.
- **wa-sqlite #258's root cause** (still open, maintainer unconvinced by his own writes-past-EOF
  theory) and **native React Native**, which is out of scope and blocked on #2138/#2145.
