# Filesystem storage durability: is rxdb-premium's append-only engine the future?

Research for wcpos/monorepo#2091. Date: 2026-09-17. Scope: read-only investigation of the
installed rxdb-premium 17.4.0 source, WCPOS's patch stack, RxDB's public docs and issues,
the WHATWG File System spec, and SQLite's own documentation.

## 1. Verdict

The problems are not integration bugs and they are not bad luck. The abstract-filesystem
engine is a hand-rolled database with no durability layer: one append-only `documents.json`
addressed by raw byte offsets that live in *separate* derived index files, a commit that spans
three or four files with **no fsync anywhere in the write path**, no checksums, no length
framing, no atomic rename-into-place, no generation numbers, and a changelog whose operations
are **array positions** rather than identities. Every one of those is a primitive SQLite has had
for decades and tests against simulated power loss. The strongest evidence that this is the
design and not WCPOS is that RxDB's own maintainer, on 2026-09-08, filed and reproduced the
`changes.json` corruption against plain `getRxStorageFilesystemNode()` and measured invalid
JSON after **629 of 963 writes — 65% of the time** — with the database "permanently unusable"
([rxdb-premium-issues#28](https://github.com/pubkey/rxdb-premium-issues/pull/28)); that an
unrelated production user hit the same crash-then-JSON-parse-failure class on OPFS and went
back to IndexedDB ([rxdb#7074](https://github.com/pubkey/rxdb/issues/7074)); and that RxDB's
own Quick Recommendations tell Electron and React Native users to use **SQLite**, and browser
users to use **IndexedDB**. The filesystem storages are recommended on *speed*, and no RxDB
documentation page makes a durability, atomicity, crash-safety or fsync claim of any kind.
Recommendation: move native to SQLite at 2.0, seriously evaluate moving desktop too, and keep
web on OPFS only because the alternatives there are worse — while budgeting the web recovery
stack as a permanent cost, not a temporary one. Caveat in the other direction: SQLite is not
magic (it publishes its own corruption list), and `rxdb-premium/storage-sqlite` is a thin,
much younger layer over it with its own bug history, including silent-wrong-answer query bugs —
you get SQLite's durability, not SQLite's maturity, for the query layer. And one finding cuts
against the easy fix in either direction: on macOS, Chrome's OPFS `flush()` is
`F_BARRIERFSYNC`, an ordering barrier rather than a real sync (iOS Chrome is WebKit, whose flush
guarantee is undocumented — a separate unknown, §4), so "just add fsync" would not fully
close the gap on the Mac tills and is unproven on the iPad ones — which is an argument for an engine that is designed
to survive reordered and torn writes, not merely one that calls flush.

**Update (2026-09-18).** The web half of that recommendation is superseded by the later sections and
by the map's rulings (wayfinder map [monorepo#2137](https://github.com/wcpos/monorepo/issues/2137)):
speed on the POS workload is the first criterion, §17 makes premium IndexedDB a viable web candidate
and control, §19 proves the rxdb + wasm SQLite + OPFS adapter and conformance path in one page and one
dedicated worker (the deployment topology — leader, routing, failover, Android — is #2146, still
open, and the web gate is not closed until it works), and §20 measures the query patch that must ship
with it. Read §1 as the durability verdict on the incumbent, which stands;
read the web plan from §17–§20 and the map, not from the paragraph above.

## 2. What WCPOS actually hit

Class key: **(a)** upstream logic bug any engine could ship · **(b)** consequence of the design
(append-only file + positional in-memory index + no fsync + no checksums) · **(c)** WCPOS
integration choice (multi-tab, worker, Electron IPC).

| Defect / patch | Class | Would SQLite have prevented it? |
|---|---|---|
| `changes-file-salvage` — `knownChangesFileSize` never assigned, every bulk written at offset 0; reader is a bare `JSON.parse("[" + file + "]")` | a + b | **Yes.** The bug is (a), but it is only *fatal* because the WAL has no record framing. SQLite journal/WAL frames carry length and checksums; a torn tail is discarded, not fed to a parser. |
| `changelog-replay-safety` — crash between index persist and changelog truncation double-replays ops (#1605) | b | **Yes.** This is precisely what a rollback journal / WAL exists to make atomic, and it is covered by SQLite's simulated-crash VFS tests. |
| `changelog-identity` — peer changelog ops applied by array **position**; a late delete removes a healthy neighbour | b + c | **Yes.** SQLite addresses rows by key/rowid and coordinates writers with file locks, never by replaying positions into another process's in-memory array. |
| `cleanup-compaction-batch` — 50 docs/call, every index file rewritten in full between batches; 30% idle CPU | b | **Yes.** Space reuse is internal (free-list / `VACUUM`), incremental, and does not hold a cross-tab lock or broadcast byte positions. |
| `resurrection-leak` — index row leaked on delete→re-insert, drifts into garbage byte ranges after compaction | a + b | **Yes.** The missing `previousDocumentData` is (a), but the *corruption* is (b): the app-visible index is a byte-range map the caller maintains. SQLite maintains its own indexes at 100% MC/DC coverage. |
| `task-queue-containment` — one throwing write skips `cleanupAfterRun`, leaks OPFS access handles, poisons the promise queue forever | a + c | **Partly.** The promise-chain poisoning is plain (a) and you would still own your own queue. But the access-handle leak is platform-dependent, not gone: §19 measured that when premium replaces a worker without terminating the old one, the old `opfs-sahpool` VFS keeps its exclusive OPFS handles and the replacement fails with `NoModificationAllowedError` (hence `mode: 'one'`), and a hung-but-alive worker keeps them too (#891). What SQLite removes is the statement-level wedge: a failed statement does not poison the connection. |
| 42 GB `documents.json` — compaction built a gap-sized whitespace string past V8's 512 MB cap (electron#429) | b | **Yes.** Upstream `cleanupDocumentJsonFile` literally does `" ".repeat(gap)` (`cleanup.js`). No SQL engine relocates records by writing whitespace over the hole. |
| Windows power cut leaves NUL-filled ranges in `documents.json` (electron#459, monorepo#1955) | b | **Yes** — this is the canonical case. No fsync, no checksum, no torn-write detection, so zeroed extents read back as a "valid" byte range. SQLite's `synchronous` settings and checksummed journal/WAL frames exist for exactly this, and it recovers from torn pages by design: *"SQLite never assumes that database page writes are atomic… and hence SQLite is always able to automatically recover from torn pages induced by a crash"* (psow.html). |
| Boot replay rebuilding every index on every reopen since 2026-09-12 (false positive) | c | **N/A.** This defect only exists because WCPOS had to write a recovery pass at all. |

The scale of the workaround: **2,225 lines** of storage patching and recovery code
(`scripts/patch-rxdb-premium-*.mjs` minus the FlexSearch one, plus the 1,131-line
`scripts/opfs-targeted-recovery.mjs`), against a **closed-source** engine, re-derived by literal
minified-source anchors on every upgrade. ~300 commits on `origin/main` since 2026-03-01 match
corrupt/recover/repair/compaction/changelog.

### What the source actually shows

Read from the installed package. `documents-file.js`, `index-state.js`, `attachments.js`,
`storage-filesystem-node/index.js` and `filesystem-expo.js` carry **no** WCPOS marker, i.e. they
are pristine upstream 17.4.0; `helpers.js`, `cleanup.js`, `changelog.js`, `task-queue.js` and
`bulk-write.js` are WCPOS-patched and are quoted only where the shape is clearly upstream's.

- **fsync is never called on data.** `flush()` is *defined* on every backend —
  `NodeFilesystemWritable.flush = () => nodeOpenHandle.sync()`
  (`node_modules/rxdb-premium/dist/esm/plugins/storage-filesystem-node/index.js:1`) — but the
  only call site in the whole abstract-filesystem plugin is `appendAttachmentFiles`
  (`.../storage-abstract-filesystem/attachments.js:1`, `o.flush&&await o.flush()`). Attachments
  are flushed; `documents.json`, the index files, `changes.json` and `changelog.txt` are not.
  `TaskQueue.cleanupAfterRun` closes handles without flushing (`task-queue.js`).
- **On React Native there is no durability primitive at all.** WCPOS uses
  `getRxStorageExpoAsync()` (`packages/database/src/adapters/storage/index.ts:1`), whose writable's
  `flush` is a literal empty function: `t.flush=async function(){}`
  (`.../storage-filesystem-expo/filesystem-expo.js:1`).
- **No framing, no checksums.** `writeDocumentRows` (`documents-file.js:1`) concatenates raw
  JSON at an offset with no delimiter, length prefix or digest; reads slice `[start,end]` from
  the index row and `JSON.parse` the result. Any drift reads garbage.
- **Index persistence is a destructive in-place overwrite**, not rename-into-place:
  `persistInMemoryRows` writes at offset 0, space-pads to the old byte length, then truncates
  (`index-state.js:1`). A crash mid-write leaves a half-old/half-new index.
- **Changelog ops are positions.** `runChangelogOperation` does `rows.splice(at, 1)`
  (`index-state.js:1`); the whole file is read with `JSON.parse("[" + raw + "]")` (`changelog.js`).
- **Unpatched boot has no validation.** Upstream `initRead` parses each index file and rethrows;
  a truncated index means the collection never opens, with no recovery path. Everything that
  currently detects and repairs this (`__wcposValidateRows`, `__wcposRebuildIndexes`) is WCPOS's.

### WCPOS's own signal (Sentry and the issue trackers, queried 2026-09-17)

Sentry project `woocommerce-pos`, last 90 days (2026-06-19 → 2026-09-17, i.e. the 1.10.x line;
Sentry retention does not reach the 1.8 era, so no before/after comparison is possible there).

| Measure (90 d) | Value |
|---|---|
| Users with any error event | 820 |
| Users hit by a storage-class error (`Storage`, `rxdb-fs`, `documents.json`, `index rebuild` in the message) | **195** (26,076 events) |
| Storage-class users by platform | Windows web 106 · Mac web 34 · Windows desktop 45 (main 29 + renderer 16) · macOS desktop 21 · iOS Safari 3 · **native iOS/Android 0** |
| Native telemetry footprint for ANY error | Android 8 users / 131 events · iOS 4 users / 18 events |

Largest storage issues by users: `bulkWrite` remote error (2HY, 100 users, Windows-dominated),
`cleanup` remote error (2JZ, 93), "Storage degraded" in query (2J9, 62), second `bulkWrite`
signature (2KB, 42), desktop `index-rebuilt` telemetry (2JJ, 38), `findDocumentsById` (2K0, 29),
desktop `cleanup-recovery` (2JH, 21). One Windows 1.10.9 desktop install alone produced 10,932
`hollow-row-dropped` events (2MN).

Two readings. **First, roughly one in four users who report any error reports a storage error,
and they are almost all on Windows — web and desktop.** Windows is also where the NUL-fill
(electron#459) and 42 GB (electron#429) cases came from, which is consistent with the no-fsync
finding: Windows zero-fills the unflushed tail of a file after a crash, so an engine that never
flushes shows the damage there first. **Second, native is silent, but native is also nearly
unmeasured**: twelve users total reached Sentry from iOS/Android in 90 days. "No native corruption
reports" is not evidence that the Expo storage is safe; it is evidence that the native install base
is too small (or its reporting too thin) to say. This matters because #2091 is scoped to native
only, while the measured pain is desktop and web.

Issue trackers, org-wide (`gh search issues --owner wcpos`): **before v1.9.0 (2026-06-03) there is
no SQLite, "database is locked" or local-database corruption report at all.** The pre-1.9 database
items are an IndexedDB schema-migration break (woocommerce-pos#413), raw RxDB errors surfacing to
users (monorepo#128) and a `bulkWrite` sync error (monorepo#163). Since v1.9.0: 19 issues/PRs
mention "corrupt", 80 "recovery", 40 "opfs", 20 "compaction". Caveat: total org issue volume
roughly doubled over the same window (791 before, 1,253 since), so the raw counts overstate the
change; the zero-before is the durable part of the finding.

What the engines were at v1.8.11 (`packages/database/src/adapters/default/*.ts` at that tag):
native `rxdb-premium/storage-sqlite` over `expo-sqlite ~55`; desktop `storage-sqlite` over
`better-sqlite3` behind an IPC bridge; web IndexedDB inside `storage-worker`. RxDB 16.21.1.

## 3. What others report (A)

Public signal is weak by construction: `rxdb-premium` is closed source, and both
`pubkey/rxdb-premium-issues` and `pubkey/expo-opfs` have **GitHub issues disabled** (bugs arrive
as PRs). With that caveat, searching `pubkey/rxdb` for opfs/filesystem/corruption returns only
three substantive reports, **two of which are WCPOS's own** (#8290, #8841).

- **[rxdb#7074](https://github.com/pubkey/rxdb/issues/7074)** (independent user, 2025-04): app
  crash on iPad during replication → on restart, OPFS storage yields a JSON parse error. The
  maintainer's reply is the only atomicity claim found anywhere: *"We write JSON of documents in
  blocks in a way where either the full json is stored or nothing. From my side this looks like a
  safari bug."* The reporter then reproduced it on desktop Chromium/Ubuntu, disproving the Safari
  theory, also reported a 9 GB heap leak, retested a v17 beta and still hit it. Closed 2026-01-18
  with "I *think* the original issue is fixed"; the reporter's last word was that they went back
  to IndexedDB. **Note their framing: "we didn't have these errors with indexDB."**
- **[rxdb-premium-issues#28](https://github.com/pubkey/rxdb-premium-issues/pull/28)** (opened by
  the maintainer himself, 2026-09-08): reproduces WCPOS's `changes.json` bug against plain
  `getRxStorageFilesystemNode()` on a temp directory — `knownChangesFileSize` "is never assigned
  anywhere", 65% of runs end with invalid JSON, "the database is permanently unusable". Fixed in
  a **private** repo (`rxdb-premium-dev#574`), still open, **not in any released build**.
  Related WCPOS reports #27, #30 ("a crash during `cleanup()` duplicates every document on the
  next open") and #31 ("two instances writing one collection make `changelog.txt` unreplayable"
  — no crash required) have had **no maintainer response**.
- **Maturity labels.** RxStorage Filesystem (Node) graduated from beta only in
  [17.0.0](https://rxdb.info/releases/17.0.0.html) (2026-03-31) — six months ago, and #28 broke
  it inside that window. **The Expo Filesystem storage WCPOS ships on native is still marked
  beta** ("may have breaking changes without a major RxDB version release").
- **The docs promise nothing.** `rx-storage-filesystem-node.html`, `rx-storage-opfs.html`,
  `rx-storage-sqlite.html`, `rx-storage.html`, `faq.html`, the Electron and React Native pages:
  zero mentions of durability, crash safety, atomicity or fsync (`fsync` has 0 hits across the
  whole docs source). `rx-storage-performance.html` is vendor benchmark marketing on the vendor's
  commercial site — no hardware, browser version or run count, and its own hedge: *"you should do
  your own measurements."*
- **RxDB's own recommendation contradicts its marketing.** Quick Recommendations: browser →
  Dexie/IndexedDB; Electron & React Native → **SQLite** if you have premium; `rx-storage-performance`
  → *"The IndexedDB storage is recommended for mostly all use cases."* Filesystem/OPFS are pushed
  only on speed. In [rxdb#8227](https://github.com/pubkey/rxdb/issues/8227) the maintainer
  explains he prefers IndexedDB because it is *"way more battle tested"*.
- **Released changelog, 17.4.0 → 17.5.0 (2026-08-20, current):** no filesystem/OPFS/corruption
  entries at all. Nothing staged for the next release.

## 4. OPFS durability (B)

OPFS is a sound *substrate*. It is not a database, and it gives weaker guarantees than the code
built on it assumes — including WCPOS's own `__wcposFlushRun` patch.

- **The spec promises an attempt, not durability.** `flush()` is normatively *"**Attempt to**
  transfer all cached modifications… to the file system's underlying storage device"*, and *"can be
  a no-op on some file systems"*. fsync, durability, stable storage, crash, power and torn appear
  **nowhere in the spec**. `close()` adds that it *"does not guarantee that all file modifications
  will be immediately reflected in the underlying storage device. Call the `flush()` method first if
  you require this guarantee"* — it disclaims and points at `flush()`, which only attempts. The chain
  terminates in nothing. [whatwg/fs#71](https://github.com/whatwg/fs/issues/71) ("This behavior is
  currently not well specified") was **closed with zero comments**; that is the whole deliberation.
- **Torn writes are explicitly in scope**, and direct OS writes mean the spec *"prevents a detailed
  specification of the write order and the results of partial writes"*. The atomicity language —
  *"User agents try to ensure that no partial writes happen"* — attaches **only to
  `FileSystemWritableFileStream`**, which the engine does not use for `documents.json`. So the
  maintainer's "either the full json is stored or nothing" describes the *other* handle type.
- **On macOS, Chrome's `flush()` is an ordering barrier, not a sync.** `base::File::Flush()`
  is `fdatasync()` on Linux/Android/ChromeOS, `FlushFileBuffers()` on Windows, and on Apple platforms
  `fcntl(F_BARRIERFSYNC)` — with the in-source comment recording that `F_FULLFSYNC` *"used to be"* the
  default and was changed *"for greatly reduced latency… no detectable sign of increased corruption"*.
  Corruption, note — not loss. A barrier preserves ordering; it does not put the bytes on the medium.
  This establishes **macOS Chrome only**: Chrome on iOS is WebKit, not Chromium's file layer, so iOS
  inherits WebKit's undocumented flush (next point) and is a separate unknown to measure, not a
  platform the barrier finding covers.
  **In Incognito, `Flush()` is a literal no-op that returns `true`.** WebKit documents nothing beyond
  a code comment ("Persist changes to disk"), and [whatwg/fs#156](https://github.com/whatwg/fs/issues/156)
  (open, unanswered) records that Safari never used a full sync either.
- **`write()`'s error contract is broken in shipping browsers at the quota boundary.** Chrome returns
  `4294967288` (Chromium's internal `FILE_ERROR_NO_SPACE` as a uint32) — a value **larger than the
  buffer** — instead of throwing `QuotaExceededError`; Firefox returns a truthful short write, then
  `0`. A naive `if (written < buf.byteLength)` check therefore **passes on Chrome when out of quota**.
  Given WCPOS's ENOSPC work, this deserves a direct check of what the engine and the recovery wrapper
  do with a short/oversized return.
- **`persist()` buys eviction protection, not durability**, and nothing ties it to fsync. On Safari it
  is heuristically granted, and **no WebKit primary source confirms persisted origins are exempt from
  ITP's inactivity deletion** — do not assume they are.
- **SQLite's own wasm docs make no durability or production-readiness claim for OPFS**, warn that
  *"desktop-grade concurrency is not a real thing in browser environments"* and that reading locks
  OPFS files, and carry a standing sidebar that OPFS databases *"sometimes disappear for
  environment-specific reasons outside of this library's control"*. `opfs-sahpool` is fastest and
  needs no COOP/COEP but **"Does not support multiple simultaneous connections"** — so under the
  `multiInstance: true` ruling, OPFS-SQLite on web means the slower `opfs` VFS, where WAL needs
  `locking_mode=exclusive` and therefore *"eliminates all concurrency support"*.
- **wa-sqlite shows this is hard for everyone:** open OPFS corruption issues for reload-during-large-write
  on FTS5 (#320), holes from writes past the file-size offset (#258), and concurrent migrations
  poisoning the lock file so *"even a brand-new connection cannot open the database"* (#341,
  deterministic 4/4 in Chromium).
- **The production references do not validate OPFS as a system of record.** Notion's post is genuine
  first-party engineering — and their SQLite is a **cache**: they report *"multiple rows with the same
  ID but different content"* from *"tabs writing to the same file at the same time"*, found Web Locks
  plus focus-only writes insufficient, and shipped a SharedWorker-elected active tab. Photoshop's OPFS
  files are Adobe's **scratch/VM swap**. Losing either costs nothing. No first-party Figma post exists.

**Net for web:** OPFS gives byte storage, exclusive file locks, and an "attempt" at flushing that is
weakest on Apple hardware — most of WCPOS's tills. Anything durable on top must supply framing,
checksums, atomic replacement and a real journal itself. The engine supplies none of those.

## 5. SQLite as the comparator (C)

SQLite's position is the opposite of RxDB's: it publishes an exhaustive list of how it *can* be
corrupted, which is itself the evidence of rigour.

**The single most relevant sentence for WCPOS** is on `pragma.html#pragma_synchronous`:
*"**Transactions are durable across application crashes regardless of the synchronous setting or
journal mode.**"* WCPOS's dominant failure mode is app crashes and unclean shutdowns, not only
power cuts. Against that class SQLite is durable at *every* setting. The companion line:
*"WAL mode is always consistent with synchronous=NORMAL, but WAL mode does lose durability. A
transaction committed in WAL mode with synchronous=NORMAL might roll back following a power
loss."* So WAL + `synchronous=NORMAL` trades power-loss durability only — never consistency,
never the file.

- **`howtocorrupt.html`** enumerates eight categories: rogue overwrite (incl. deleting a hot
  journal), locking problems (NFS, `close()` cancelling POSIX locks, `fork()`), failure to sync
  (drives that lie; `synchronous=OFF`), drive/flash failure, memory corruption, OS problems, config
  errors, and nine historical SQLite bugs. **Its residual risk is hardware lying about fsync, not the
  absence of fsync** — and WAL blunts even that: *"In WAL mode, the only time that a failed sync
  operation can cause database corruption is during a checkpoint operation."* For accuracy: the page
  carries **no** Android/iOS-specific warning.
- **Not risk-free, and it matters for a version pin:** the WAL-reset race *"is likely present in
  all versions of SQLite from 3.7.0 through 3.51.2… fixed in version 3.51.3 (2026-03-13)."*
- **Testing:** 155.8 KSLOC of library against 92,053 KSLOC of test code (**590×**); 100% branch
  and 100% MC/DC coverage; 51,445 + 50,362 distinct cases; ~1 billion fuzz mutations/day. §3.3
  **crash testing** uses a VFS that *"randomly reorders and corrupts the unsynchronized write
  operations to simulate the effect of buffered filesystems"*, after which every run must show the
  transaction completed or fully rolled back, verified by `PRAGMA integrity_check`. That is exactly
  the test WCPOS keeps failing in production and cannot write against a minified closed blob.
- **expo-sqlite** (SDK 54–57): async-first with sync twins. WAL appears in the examples with no
  prose recommendation and no rationale; `synchronous`, checkpointing and durability are not
  mentioned, and the bundled SQLite version is not stated. **It does not document that async calls
  run off the JS thread** — the only threading statement warns that the *sync* variants block. Its
  2026 bug reports are in the *binding*, not SQLite: missing per-statement locks under concurrent
  reads of a shared prepared statement (expo/expo#49785-49787), an iOS `EXC_BAD_ACCESS` in `getAll`
  (#49776, open), an Android double-close of native handles (#48999, open), a kv-store lock bypass
  (#47448).
- **op-sqlite** is the only binding that documents its contract: *"All execute calls run on a
  (single) separate and dedicated thread, so the JS thread is not blocked."* Cost: needs prebuild
  and **conflicts with expo-sqlite and expo-updates** at link time. Five closed `corrupt` issues,
  none on-disk-at-rest.
- **`node:sqlite` is NOT stable** — *"Stability: 1.2 - Release candidate"*, never Stable. Electron
  37+ bundles a Node that has it, but it regressed once already (electron#47671). If desktop moves,
  verify `require('node:sqlite')` against the pinned Electron build; better-sqlite3 remains the
  fallback, with the addon rebuild/signing pain that drove WCPOS off it originally.
- **`rxdb-premium/storage-sqlite` is the honest caveat, and it cuts hard.** Premium pushes
  selectors, indexes and sorting into SQLite via `JSON_EXTRACT` (needs SQLite ≥ 3.38); the trial
  build does none of that (no indexes, 500-doc cap, in-memory queries), so trial numbers are
  meaningless. Adapters cover `expo-sqlite`, `node:sqlite`, `react-native-quick-sqlite`, wa-sqlite,
  Capacitor, Tauri — **op-sqlite and better-sqlite3 are not listed**. **Its defect history is
  query-correctness, several of them silent-wrong-answer class**, which for a POS is worse than a
  crash: bulk updates silently failing (#7984), `null` comparisons wrong (#7356), "does not use
  indexes correctly" (#8631), `$in` broken on arrays (#5320), plus transaction-serialization bugs
  on async single-connection adapters (#9024). **You would buy SQLite's durability and RxDB's
  SQL-mapping layer — only the first is battle-tested.**
- **And RxDB's own numbers say this is a performance downgrade.** On their published node bench,
  `node:sqlite` loses to filesystem-node on 7 of 8 measures (bulk insert 8.62 vs 5.78 ms; find 3000
  by id 26.41 vs 22.04; 50 serial inserts 10.84 vs 2.42). The React Native page carries an explicit
  callout that Expo Filesystem has *"significantly better performance compared to SQLite"*. If
  WCPOS moves, it must be argued as **a durability purchase paid for in latency**, not sold as a
  win on both.

## 6. Is filesystem storage the future? (D)

No — not this shape of it. The append-only-JSON-file family has a known ceiling and a known
history. NeDB, its most-used exemplar, is explicit that *"compaction forces the OS to physically
flush data to disk, while appends to the data file do not"*, ships a `corruptAlertThreshold`
because corrupt lines are expected, and is now unmaintained ("may have bugs and security issues").
LokiJS documents nothing about durability at all and reads as abandoned (README at v1.3, 2015
copyright). PouchDB and Dexie both delegate to IndexedDB, i.e. to a browser-maintained engine.
Nobody in this space built a durable engine on raw file byte-offsets in JavaScript, because the
primitives that make it durable are exactly the ones SQLite already has.

"One engine on every platform" is real value — one query semantics, one recovery stack, reproduce
native bugs on the Mac — and #2091 is right to price it. But note that it cuts the other way too:
**SQLite also runs on all four targets** (wasm on web, `node:sqlite`/better-sqlite3 on desktop,
expo-sqlite/op-sqlite on native). One-engine consistency is not an argument *for* the filesystem
storage specifically; it is an argument for picking one engine, and today the filesystem choice
means the one engine is the one with no fsync.

## 7. What making filesystem storage robust would take (E)

| Missing primitive | Patchable from WCPOS's postinstall? |
|---|---|
| fsync/flush discipline (flush data before the metadata that references it; flush before truncating the changelog) | **Partly** — already done in patched `helpers.js`/`cleanup.js` via `__wcposFlushRun`. But it is a no-op on `getRxStorageExpoAsync`, so native gets nothing. |
| Torn-write detection: length prefix + CRC per record in `documents.json`, `changes.json`, `changelog.txt` | **No.** Changes the on-disk format and every reader/writer. Upstream only. |
| Atomic index replacement (write `index-N.tmp`, flush, rename) instead of in-place pad-and-truncate | **No** in general — `FileSystemDirectoryHandle` has no rename; needs a two-generation scheme baked into the format. |
| Generation numbers / monotonic sequence ids on changelog ops so replay is idempotent and identity-addressed | **Partly** — the `changelog-identity` patch approximates this by index-string identity, at real complexity cost. Doing it properly is a format change. |
| An idempotent recovery pass that cannot make things worse | **Yes, and WCPOS has written one** — 1,131 lines of it. It is also where the 2026-09-12 false positive came from. |
| Multi-writer correctness without positional replay | **No.** The broadcast protocol *is* positions. |

Honest estimate: this is **not "a few more patches"**. Three of six primitives require changing the
on-disk format, which means either upstream does it or WCPOS forks a closed-source, minified,
license-gated package. WCPOS is already ~2,200 lines into reimplementing a storage engine's
durability layer from the outside, through text anchors that must be re-derived on every upgrade,
against a maintainer who rejected one such reproduction as *"too much AI. I do not understand it"*
and has not replied to the two most recent crash reports. The marginal return on patch #8 is low
and the tail risk is unchanged.

## 8. What this changes about the #2091 spike

- **Add durability to the measured axes.** #2091 currently measures cold boot, ingest, query
  latency, JS-thread lag and memory — all latency. Given that the presenting problem is corruption,
  a spike that only measures speed will re-decide on the same basis that got us here. Add a
  kill-during-write / power-cut harness (SIGKILL mid-`bulkWrite`, mid-`cleanup`, and a
  truncate/zero-fill injection on each file) and count unopenable databases and lost acknowledged
  writes per 100 runs, per candidate. SQLite's §3.3 crash test is the template.
- **Candidate 1 (filesystem-expo on the JS thread) should be scored with `flush()` being a no-op.**
  That is not a tuning parameter; on `getRxStorageExpoAsync` there is currently no way to force
  data to storage at all.
- **Candidate 2 (the same engine on the worklet) does not change durability by one bit.** It is a
  latency fix for a latency problem. If the spike's conclusion is "move to the worklet", it has
  answered a different question than the one Paul is asking here.
- **Re-open the desktop assumption, with eyes open.** #2091 fixes desktop on filesystem-node
  because "the old pain was the better-sqlite3 native addon, not SQLite". The addon pain is real —
  but electron#429 (42 GB) and electron#459 (NUL ranges) are **both desktop**, so desktop is not the
  safe platform this assumption treats it as. `node:sqlite` removes the addon but is only
  *"Stability: 1.2 - Release candidate"* and has regressed once inside Electron (#47671). Desktop
  deserves to be a measured candidate, not a given — and not an assumed easy win either.
- **Keep web on OPFS, but book the recovery stack as permanent.** There is no better substrate on
  web under `multiInstance: true` (`opfs-sahpool` is single-connection, so OPFS-SQLite on web means
  the slower COOP/COEP `opfs` VFS, where WAL needs exclusive locking anyway). The right framing is
  not "web is fine" but "web carries a hand-written recovery layer indefinitely" — an argument for
  *not* also carrying it on two other platforms.
- **Two cheap checks worth doing regardless of the spike's outcome.** (1) On macOS Chrome's
  `flush()` is `F_BARRIERFSYNC` (and iOS Chrome is WebKit, undocumented), so `__wcposFlushRun` is
  weaker than its name implies on the Mac tills and unknown on the iPad ones — measure whether it
  actually changes the power-cut outcome before crediting it. (2) Chrome returns a
  byte count *larger than the buffer* when OPFS quota is exhausted, so audit every `write()` return
  check in the engine and in `opfs-targeted-recovery.mjs` for the `written < length` pattern.
- **Two named risks for the web candidate (added 2026-09-17 evening).** (1) The pool VFS is
  single-connection and rxdb serialises on one `TX_QUEUE_BY_DATABASE`, so 1.8.x's escape hatch of
  reopening with a fresh connection on `database is locked` no longer exists; a rejected transaction
  poisoning the shared queue (rxdb-premium-issues#25, open) can only be fixed in the queue — include
  it in the harness. (2) A hung-but-alive storage worker holding exclusive OPFS handles that the
  successor cannot open is monorepo#891, and a third party reported the same state on rxdb's own
  SharedWorker storage on the RxDB Discord (2025-05-21, no maintainer reply; see §14) — the
  heartbeat/terminate protocol is a requirement of the leader-worker design, not a follow-up.
- **Track the unreleased upstream fix.** `rxdb-premium-dev#574` (the `changes.json` fix) is not in
  17.5.0. If it ships and #30/#31 get answered, re-evaluate — but a first release containing it
  is evidence of one bug fixed, not of a durability layer arriving.

## 9. Sources

Local (read-only, installed rxdb-premium 17.4.0 unless noted):
`node_modules/rxdb-premium/dist/esm/plugins/storage-abstract-filesystem/{documents-file,index-state,attachments,task-queue,changelog,cleanup,bulk-write,helpers}.js`;
`.../storage-filesystem-node/index.js`; `.../storage-filesystem-expo/filesystem-expo.js`;
`.../storage-opfs/worker-filesystem.js`; `packages/database/src/adapters/storage/index.ts`;
`scripts/patch-rxdb-premium-*.mjs`; `scripts/opfs-targeted-recovery.mjs`.
WCPOS internal (Sentry / issue trackers): electron#429, electron#459, electron#387 (Sentry
WOOCOMMERCE-POS-2GA), monorepo#1955, monorepo#1605, wcpos/monorepo#2091.

External:
- https://rxdb.info/rx-storage.html · /rx-storage-opfs.html · /rx-storage-filesystem-node.html · /rx-storage-sqlite.html · /rx-storage-performance.html (vendor benchmark marketing) · /react-native-database.html · /electron-database.html · /releases/17.0.0.html · /premium
- https://github.com/pubkey/rxdb/issues/7074 · /8290 · /8841 · /8227
- https://github.com/pubkey/rxdb-premium-issues/pull/28 · /27 · /30 · /31 · /26
- https://raw.githubusercontent.com/pubkey/rxdb/master/CHANGELOG.md; `gh api repos/pubkey/rxdb/releases` (17.5.0, 2026-08-20)
- https://fs.spec.whatwg.org/ (flush, write, close, createSyncAccessHandle, createWritable) · whatwg/fs#71 · whatwg/fs#156
- Chromium `base/files/file_posix.cc`, `file_win.cc`, `file_system_sync_access_handle.cc`, `file_system_access_incognito_file_delegate.cc` (chromium.googlesource.com)
- https://webkit.org/blog/12257/ · https://webkit.org/blog/14403/updates-to-storage-policy/ · https://storage.spec.whatwg.org/#persistence
- rhashimoto/wa-sqlite issues #320, #258, #341, #336, #111 and `src/examples/README.md`
- https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite · https://developer.chrome.com/blog/how-photoshop-solved-working-with-files-larger-than-can-fit-into-memory
- https://sqlite.org/howtocorrupt.html · /testing.html · /wal.html · /pragma.html#pragma_synchronous · /atomiccommit.html · /psow.html
- https://sqlite.org/wasm/doc/trunk/persistence.md
- https://docs.expo.dev/versions/latest/sdk/sqlite/ · https://docs.expo.dev/guides/local-first/ · https://reactnative.dev/docs/asyncstorage (AsyncStorage removed from core)
- https://op-engineering.github.io/op-sqlite/ · https://nodejs.org/api/sqlite.html · https://github.com/WiseLibs/better-sqlite3
- expo/expo#49785-49787, #49776, #48999, #47448 · electron/electron#47671 · pubkey/rxdb#7984, #7356, #8631, #5320, #9024, #8635
- https://github.com/louischatriot/nedb (README) · https://github.com/techfort/LokiJS (README)

Flagged as unverified: whether Safari's `persist()` exempts an origin from ITP's inactivity
deletion (no WebKit primary source confirms it); Chromium tracker issue bodies (anonymous fetches
hit a sign-in wall, so those are cited only where a readable primary source quotes them).

## 10. Beyond RxDB: how file-based engines actually earn durability

Paul's pushback on the first pass is correct and it reframes the question. RxDB is not the subject;
it is one data point. The real question is whether "raw files plus your own framing" is a solved
problem with a published recipe, and if so whether that recipe is reachable from JavaScript on
WCPOS's four targets. The answer, stated up front because it *is* the finding: **the recipe is
thirty years old, exhaustively documented and near-identical across every serious engine — and
almost nobody in the JavaScript ecosystem implements it, because the two engines that already did
(SQLite, and the browser's own IndexedDB) run everywhere JavaScript runs.**

### 10.1 The standard toolkit, engine by engine


Five primitives recur. **(1) Framed records** — a length prefix and a checksum around every record,
so a reader can tell a whole record from a torn one. **(2) A log with ordered fsync** — data reaches
stable storage *before* the pointer that references it. **(3) Atomic replacement** — rename (or
link) into place, or alternating header slots selected by a bit, so the commit point flips in one
step that cannot be half-done. **(4) Immutable segments plus a manifest** — files written once,
never edited, with a separate commit point naming which count. **(5) Idempotent recovery** — replay
twice, land in the same state.

| Engine | Framing | Log / fsync ordering | Atomic commit | Torn write + recovery |
|---|---|---|---|---|
| **LevelDB** | 32 KiB blocks; `record := checksum: uint32 // crc32c of type and data[]`, `length: uint16`, `type: uint8` (FULL/FIRST/MIDDLE/LAST). SSTable blocks add a 5-byte trailer, "1-byte type + 32-bit crc". | Log before memtable; MANIFEST "is formatted as a log". | `CURRENT` written to a temp name via `WriteStringToFileSync`, then `env->RenameFile(tmp, CurrentFileName(dbname))`. | Resync by construction: "If there is a corruption, skip to the next block." Recovery reads CURRENT → MANIFEST. |
| **RocksDB** | Same lineage: 32 KiB blocks, `\|CRC (4B) \| Size (2B) \| Type (1B) \| Payload\|`; the recyclable variant adds a log number so a stale record can't pass as live. | `WriteOptions::sync` defaults to **false**, and its comment is the most useful sentence here: "if it is just the process that crashes (i.e., the machine does not reboot), **no writes will be lost even if sync==false**." | Manifest + immutable SSTs. | `kTolerateCorruptedTailRecords` "ignores any error discovered at the tail of the log"; `kPointInTimeRecovery` is "the default as of version 6.6". |
| **LMDB** | n/a | **No WAL at all**; fsync on commit unless `MDB_NOSYNC`/`MDB_NOMETASYNC` (which "preserve the ACI… but not D"). | Copy-on-write B+tree, **two alternating meta pages**: `#define NUM_METAS 2`, "Transaction N writes meta page #(N % 2)"; open reads both "so we can use the latest one." | "no active data pages are ever overwritten… **eliminates the need of any special recovery procedures after a system crash**." |
| **Bitcask** | `crc \| tstamp \| ksz \| value_sz \| key \| value` (`CRCSIZEFIELD 32`, `HEADER_SIZE 14`). | Data file *is* the log; `bitcask:sync/1`. | Immutable files after rotation; deletes are tombstones dropped at merge; merge emits new data + hint files. | "the data files and the commit log are the same thing… recovery is trivial with no need for 'replay.'" |
| **CouchDB** | 4 KiB blocks (`SIZE_BLOCK, 16#1000`), 5-byte prefix; chunks are `<<1:1, len:31>>, Checksum, Bin` — flag bit, 31-bit length, digest (now xxhash128; MD5 legacy-read only). | Append-only: "CouchDB never overwrites committed data or associated structures." | Headers padded out to the next 4 KiB boundary, so **every header starts on a block**. | Scans **backwards** from the last block, 1024 prefixes per `pread`, taking the first header whose checksum verifies. "partially flushed updates are simply forgotten on restart." |
| **Lucene** | Codec header + 16-byte footer per file: "the last 8 bytes of every index file contain the zlib-crc32 checksum of the file." | `flush()` "does not commit (fsync) them (call commit() for that)"; `prepareCommit()` is "the first phase of 2-phase commit". | Write-once segments + a `segments_N` commit point; "File names are never re-used". | `commit()` → "the index updates will survive an OS or machine crash or power loss." An unreferenced partial segment doesn't count. |
| **git** | Content addressing *is* the checksum: an object "is uniquely identified by the SHA-1 of its contents." | Default "is equivalent to `core.fsync=committed,-loose-object`… but **risks losing recent work in the event of an unclean system shutdown**"; `fsyncMethod=writeout-only` is "the default mode on macOS". | Temp `tmp_obj_XXXXXX` in the destination dir, then **hardlink** into place; `rename()` only as a fallback. `batch` mode fsyncs a dummy file as a barrier before renames. | `git fsck`. Not an exemplar — see ALICE below. |
| **PostgreSQL** | "Each individual record in a WAL file is protected by a **CRC-32C** (32-bit) check"; `XLogRecord` = `uint32 xl_tot_len` + `pg_crc32c xl_crc`. | `synchronous_commit`: all non-`off` modes "wait for local flush of WAL to disk." | WAL before data; `full_page_writes` because a partially completed page write leaves "a mix of old and new data." | CRC "checked during crash recovery, archive recovery and replication." |
| **MMKV** (WeChat; wrapped by `react-native-mmkv`) | Protobuf `KV { string key = 1; buffer value = 2; }` appended into an mmap'd region. | None — the design page's claim is that mmap itself means no crash-induced loss. | On fill: de-duplicate keys, rewrite in full, double the file if needed. | **CRC32 in a `.crc` sidecar** (`CRC_SUFFIX`), mapped as a second file holding `MMKVMetaInfo { m_crcDigest, m_sequence, m_actualSize, m_lastConfirmedMetaInfo{…} }` — a two-generation rollback. On mismatch it tries the last-confirmed pair, then asks the app; default `OnErrorDiscard = 0`, **throw the file away**. Tencent's own number: ~700k failed verifications/day on WeChat iOS. |
| **Realm core** | — | `sync_according_to_durability()` over `Durability::Full \| Unsafe \| MemOnly`. | **Two top-refs + a select bit** (LMDB's trick): `uint64_t m_top_ref[2]`, "bit 0 of m_flags is used to select between the two top refs", with the order stated — "all data… written to stable storage before flipping the slot selector". | An unflipped commit is invisible. **Deprecated Sept 2024; EOL 30 Sept 2025.** |
| **ZooKeeper / etcd** | ZK: "`checksum Txnlen TxnHeader Record 0x42`", "8bytes Adler32", written *before* the record. etcd: `Record { type; crc; data }` over `crc32.Castagnoli` (CRC-32**C**), chained from a per-segment seed. | ZK `channel.force(false)`; etcd `fileutil.Fdatasync` plus an fsync of the parent directory. | Segment files. | etcd names WCPOS's exact problem and solves it: `isTornEntry` — "if any data for a sector chunk is all 0, it's a torn write" — and a torn tail on the last file is `io.ErrUnexpectedEOF`, truncate-and-continue, not corruption. |
| **`write-file-atomic` / `atomically` → `conf` → `electron-store`** | None. | `fsync` option defaults to **true**. | Temp file beside the target, fsync, "then it renames the file back to the filename you specified." | Whole-file replace only. `conf` catches Windows `EXDEV` and falls back to a plain `fs.writeFileSync` — the "atomic" has an escape hatch. |
| **`lowdb` / `steno`** | None. | **None — no `fsync` call anywhere in `steno`**: `writeFile(temp, data)` then `rename(temp, target)`. | Rename. | Rewrites the *entire* JSON document every save. |

Two conclusions. First, **the toolkit is boring, universal and old.** A dozen independent engines in
C, C++, Erlang, Java and Go, written by different people for different workloads, converge on the
same five primitives and each publishes its format so a third party can verify. There is no missing
research here. Against that list the rxdb-premium abstract-filesystem engine has **none of the
five**: §2 established from the installed source that it has no length prefix, no checksum, no fsync
on data, no rename-into-place, no generation number, and a changelog addressed by array position. It
is not a weak implementation of the toolkit; it does not implement it. The `write-file-atomic` row
is the ladder's bottom rung and worth naming precisely — temp-fsync-rename buys *"you will never
read a half-written file"* and nothing else: no partial update, no concurrent writers, no
record-level recovery, and a full rewrite of the document on every change. Correct for a 5 KB
settings file; hopeless for a 20k-product catalogue, where adding one row rewrites tens of megabytes.

Second, and this is the argument against building the toolkit yourself from outside a closed
package: **even the engines that implement it get it wrong.** Pillai et al. (OSDI '14) pointed ALICE
at LevelDB (1.10, 1.15), GDBM, LMDB, SQLite (rollback and WAL), PostgreSQL, HSQLDB, Git, Mercurial,
HDFS, ZooKeeper and VMWare Player: "ALICE finds 60 static vulnerabilities in total… Altogether,
applications failed in more than 4000 crash states." Seven of eleven could lose data; two — both
LevelDB versions and HSQLDB — produced **silent errors**, and LevelDB's is WCPOS's exact shape: "A
crash can result in the appended portion of the file containing garbage; LevelDB's recovery code
does not properly handle this situation." Git showed 2–5 per filesystem because "Git developers
expect total ordering from the file system." Near-clean: LMDB (one), SQLite-WAL, PostgreSQL — though
the same paper notes "SQLite does not provide durability under the default journal-mode… but its
documentation seems misleading." Then fsyncgate: PostgreSQL found in 2018 that a failed `fsync()` on
Linux can clear the error and drop the pages, so a retry succeeds while the data is gone — "we
completed the checkpoint, and merrily carried on our way. Whoops, data loss" — and PostgreSQL's own
docs now warn "the second attempt may be reported as successful, when in fact the data has been
lost." Rebello et al. (ATC '20) then tested PostgreSQL, LMDB, LevelDB, SQLite and Redis against
fsync failure: "although applications use many failure-handling strategies, **none are sufficient**."
If the authors of LMDB and SQLite cannot close this from inside their own engines, WCPOS cannot
close it from a postinstall script applied to minified code.

### 10.2 Who ships raw files + own framing on OPFS or React Native?

| Project | Web substrate | Atomicity relied on |
|---|---|---|
| **PGlite** | Postgres's own data directory inside an **OPFS access-handle pool** with randomised filenames plus a state file holding "the directory tree mapping along with file metadata". IndexedDB FS is the recommended default because "the OPFS VFS is not supported by Safari" (Safari caps sync access handles at 252; Postgres needs 300+). | Postgres's own WAL. Single-connection: multi-tab needs a leader election — "Only the leader then starts PGlite". `relaxedDurability` defers the flush. |
| **DuckDB-wasm** | DuckDB's own single-file format written straight to `opfs://`. | Manual — "call `CHECKPOINT` to flush writes to disk"; one handle per file. |
| **PowerSync web** | wa-sqlite. **Default `IDBBatchAtomicVFS`** ("uses IndexedDB for storage… Multiple tabs are fully supported"); `OPFSCoopSyncVFS` "Recommended for applications requiring multi-tab support, especially on Safari/iOS"; `AccessHandlePoolVFS` "is not designed for multiple tab use cases"; `OPFSWriteAheadVFS` Chromium-only. | SQLite's journal/WAL over the VFS; IDB transactions in the default. |
| **absurd-sql** | SQLite pages as blocks **inside IndexedDB** — "It basically stores a whole database into another database. Which is absurd." | IDB transactions, explicitly: "We're leveraging IDB transactions to ensure safe atomic writes"; "only one tab can be writing". Chose IDB because "It's the only option for something database-like that works across all browsers". |
| **automerge-repo** | IndexedDB and Node-fs adapters; **no OPFS adapter exists**. Chunked by key range (`[documentId, "incremental", hash]`, `[documentId, "snapshot", headsHash]`), merged on load. | Crash-safe **by construction, not by fsync**: compaction is `save(newSnapshot)` then `remove(oldKeys)`, so a crash in between leaves redundant-but-correct chunks. Its NodeFS adapter is candid that "`writeFile` is not atomic" and covers reads with an in-memory pending-write cache rather than a rename. |
| **y-indexeddb** | IndexedDB; every update appended via `addAutoKey`, compacted at `PREFERRED_TRIM_SIZE = 500` by appending a merged snapshot then deleting the range below it. | Same append-then-compact shape. |
| **WatermelonDB** | Native = own bundled SQLite over JSI, with `journal_mode = WAL`, `synchronous = FULL`, `locking_mode = EXCLUSIVE` set explicitly. **Web = LokiJS on IndexedDB** — "WebSQL would be a perfect fit for Watermelon, but sadly is a dead API, so we must use IndexedDB". | SQLite / IDB. |
| **Evolu · cr-sqlite · Turso wasm · Fireproof · Replicache/Zero · TinyBase · Dexie · PouchDB** | SQLite or IndexedDB, every one. Evolu: official SQLite Wasm on the OPFS SAHPool VFS (RN: `expo-sqlite`). cr-sqlite: wa-sqlite `IDBBatchAtomicVFS`, `durability: "relaxed"`. libsql wasm: `file:` URLs only, browser persistence unstated. Fireproof: its own CAR/prolly-tree format stored *inside* IndexedDB. Replicache/Zero: `kvStore: "idb" \| "mem"` (Zero on native uses `expoSQLiteStoreProvider()`). TinyBase: localStorage/IDB/sqlite-wasm/expo-sqlite persisters plus one OPFS persister that writes whole-store JSON. Dexie and PouchDB: IndexedDB. | IDB transactions or SQLite. |

And what IndexedDB *is*, from the engines' own source, because this is the punchline. **Chromium**:
"A backing store has a dedicated leveldb database where all data for that origin is stored", at
`IndexedDB/<serialized_origin>.leveldb/` — so LevelDB's CRC32C framing and CURRENT-via-rename, row 1
of 10.1. **WebKit**: `SQLiteIDBBackingStore.cpp`, file `IndexedDB.sqlite3`, `CREATE TABLE` schema,
`enableAutomaticWALTruncation()`. **Firefox**: `dom/indexedDB/DBSchema.cpp` creates `object_data`;
`ActorsParent.cpp` runs `PRAGMA journal_mode = wal` with a documented fallback, writing `.sqlite`,
`.sqlite-wal`, `.sqlite-shm`. "IndexedDB" is not an alternative to a durable file engine — it *is* a
vendor-maintained durable file engine, with the 10.1 toolkit inside it and a browser team's
crash-test budget behind it. (Dated: a SQLite backing store and a `MigrateDatabase` path are in the
Chromium tree as of 2025; the engine may change, the property will not.)

**Verdict.** No production JavaScript library other than rxdb-premium hand-rolls its own record
format onto raw OPFS or raw React Native files. The two near-misses are not counter-examples:
DuckDB-wasm and PGlite do put raw bytes on OPFS, but the format is DuckDB's and Postgres's — engines
that arrived with the full toolkit already built and tested — and even they need a manual
`CHECKPOINT` or a leader election to stay correct. The only other own-format-on-raw-OPFS project
found was a hobby B+tree (`opfsdb`) with no durability claim at all. Everyone else does one of two
things: put SQLite's bytes in an OPFS container, or keep their own format and hide it *inside*
IndexedDB, borrowing IDB's transactions for atomicity. A third pattern is worth stealing regardless
of engine — automerge-repo's and y-indexeddb's chunk-append plus save-new-then-delete-old, which
makes an interrupted compaction merely wasteful instead of destructive. RxDB's filesystem storages
occupy a fourth category, append-only files with neither framing nor an atomic commit, and they are
alone in it.

### 10.3 React Native specifically



| Engine | Shape | Durability design (own docs/source) | Status | RxDB storage? |
|---|---|---|---|---|
| **expo-sqlite** | Queryable SQL | SQLite. Docs mention WAL as a perf tip only; no `synchronous`/fsync prose. | SDK 57, maintained | **Yes** — premium `getSQLiteBasicsExpoSQLiteAsync` |
| **op-sqlite** | Queryable SQL | SQLite; "All execute calls run on a (single) separate and dedicated thread". Sets no journal/synchronous pragmas itself (unverified beyond a source grep). | Maintained (pushed 2026-09-15) | **No** — not named on either RxDB page |
| **react-native-nitro-sqlite** | Queryable SQL | SQLite. | Maintained; predecessor `react-native-quick-sqlite` says "DEPRECATED: Use react-native-nitro-sqlite instead" (last push 2024-11-13) | Only via the deprecated `getSQLiteBasicsQuickSQLite` |
| **react-native-mmkv** → MMKV | **KV only** | mmap + append + full write-back; CRC32 in a `.crc` sidecar with a last-confirmed generation; default on mismatch is discard the file. | Maintained (8.5k stars, pushed 2026-09-14) | **No** |
| **Realm** | Queryable | Two top-refs + select bit, ordered flush→flip→sync. | **Deprecated Sept 2024, EOL 30 Sept 2025**; core survives as OSS | **No** |
| **react-native-leveldb** | KV only | LevelDB's framing, via "completely synchronous, blocking API". | Stale — 90 stars, last push 2025-10-22 | **No** |
| **WatermelonDB** | Queryable | Own bundled SQLite; explicitly `WAL` + `synchronous = FULL` + `locking_mode = EXCLUSIVE`. | Maintained | n/a (own ORM) |

Note what RxDB itself recommends on RN: "the premium Expo Filesystem RxStorage is highly
recommended" for performance, with SQLite as the fallback — and its named bare-RN adapter is a
package whose own repo says it is deprecated. Two further facts bound the whole "roll your own on
RN" option. The community RxDB storages on npm are *all* SQLite or PGlite adapters
(`bun-sqlite-for-rxdb`, `@tallyui/storage-sqlite`, `@basepurpose/rxdb-sqlite`,
`@xuhaojun/rxdb-storage-pglite`); there is no MMKV, LevelDB or Realm storage for RxDB anywhere. And
**`expo-file-system` has no flush primitive at all**: the words "fsync", "flush", "durable" and
"atomic" do not appear on its API page, and `FileHandle` exposes only `offset`, `size`,
`readBytes`, `writeBytes`, `close`. On React Native you cannot build primitive (2) even if you want
to — which is consistent with §2's finding that the Expo storage's `flush` is `async function(){}`.

### 10.4 The four-target matrix



| Engine | Web (OPFS/worker) | Electron main (Node) | iOS | Android | Toolkit present | Queryable | RxDB storage |
|---|---|---|---|---|---|---|---|
| **SQLite** | Yes — wa-sqlite / sqlite-wasm over an OPFS or IDB VFS (`opfs-sahpool` is single-connection) | Yes — `node:sqlite` (RC) or better-sqlite3 | Yes — expo-sqlite, op-sqlite | Yes | **Full** | **Yes** | **Yes** (premium `storage-sqlite`) |
| **IndexedDB** | Yes (native) | Only via a Chromium renderer, not the main process | No | No | Full — it *is* LevelDB or SQLite | Yes (via Dexie/premium) | Yes |
| **LevelDB / RocksDB** | No | Yes (native addon) | Via `react-native-leveldb` (stale) | Same | Full | **No** — KV | No |
| **LMDB** | No | Yes (`lmdb-js`) | No RN binding found | No | Full | No — KV | No |
| **MMKV** | No | No | Yes | Yes | Partial — CRC + generations, no fsync, discard-on-mismatch | No — KV | No |
| **Realm** | No | No | Yes (deprecated) | Yes (deprecated) | Full | Yes | No |
| **Raw files + own framing** | Yes (OPFS) | Yes (Node fs) | Yes (expo-file-system) | Yes | **None, and the platform only half-provides it**: the WHATWG File System spec has no `move`/`rename` (0 occurrences; whatwg/fs#10 and #180 are still open PRs), but Chromium ships `FileSystemFileHandle.move()` unflagged for files (`file_system_file_handle.idl`, `MeasureAs=FileSystemAccessMoveRename`; directory moves stay behind `FileSystemAccessAPIExperimental`), so atomic file replacement exists on Chrome, Edge and Electron and not on Safari or Firefox; and expo-file-system exposes no flush at all | Only what you write | rxdb-premium only |

The expected shape holds, with one correction and one sharpening. The correction: raw-files-plus-own-framing
is *not* uniformly available — it is available as a byte store everywhere, but atomic replacement
is Chromium-only on web (fine for Electron and most of WCPOS's web tills, absent on Safari and
Firefox) and flush is absent on Expo, so "build the toolkit yourself" is not merely expensive on web
and native, it is partly impossible on the platforms where it is not Chromium. The sharpening: SQLite
is the only row that is durable-by-design, present on all four targets, queryable, and already has
an RxDB storage. IndexedDB is web-only but is, underneath, the same toolkit maintained by Google,
Apple and Mozilla.

### 10.5 Could WCPOS put a durable engine under RxDB without premium's SQL query layer?



Partly, and it is a documented path. RxDB's `RxStorage` interface is 315 lines and eleven instance
methods (`bulkWrite`, `findDocumentsById`, `query`, `count`, `getAttachmentData`,
`getChangedDocumentsSince`, `changeStream`, `cleanup`, `close`, `remove`, plus
`createStorageInstance`), and `test/unit/custom-storage.ts` documents the supported route verbatim:
"When you create your own implementation of the RxStorage interface, you can run the whole unit test
suite over your custom storage" — clone the repo, replace that one file, run with
`DEFAULT_STORAGE=custom`. The shape Paul is reaching for is also already a shipped premium product:
the **memory-mapped** storage is "an in-memory storage that is used for query and write operations"
that "is kept persistent with a given underlying storage", where "Writes are appended in blocks
rather than modifying the state in place" — i.e. in-memory index plus a durable KV underneath,
exactly the pattern. Its documented limits are the price: everything must fit in memory, "it is not
possible to have the same storage open in multiple JavaScript processes", no attachments, a Storage
Migrator run to adopt it, and on ungraceful death "it might happen that some memory writes are not
persisted to the parent storage" unless `awaitWritePersistence: true`. The single-process limit
collides head-on with the standing `multiInstance: true` web ruling.

The honest cost of a custom storage over MMKV or SQLite-as-KV: you inherit the durability of the
substrate for free, and you inherit the *entire query engine* as your problem — Mango selectors,
index selection, sort, `getChangedDocumentsSince` checkpoint ordering, the change stream and
multi-instance event propagation. RxDB's own conformance suite is 3,807 lines and 63 cases, and it
is worth knowing what it does not contain: grepping it for crash, fsync, power, torn or corrupt
returns exactly one hit, and that hit is `it('must not crash', …)` inside `prepareQuery`. Passing
the suite proves your storage is API-correct; it proves nothing about durability, which is precisely
how an engine with none of the five primitives passes as a first-class RxStorage. And WCPOS has
already seen what a young RxDB query layer costs — §5's silent-wrong-answer bug list for
`storage-sqlite` is the *vendor's* version of this work.

**Does this change §8's recommendation? No.** A custom storage over a durable KV is a real,
documented shape, but it trades a query layer someone else maintains and tests for one WCPOS writes,
on a team that is already 2,200 lines deep in maintaining a storage engine's durability layer from
the outside — and the only substrate that would spare WCPOS both jobs at once, on all four targets,
is the one §8 already points at. The one thing 10.1–10.4 do change is the *emphasis*: the missing
primitive is not fsync. RocksDB ships with `sync=false` by default and still loses nothing when only
the process crashes, because its records are framed and its commit point is atomic. WCPOS's
dominant failure mode is application crashes, and the engine loses data on them because it has no
framing and no atomic commit — so the kill-during-write harness in §8 should be scored on
process-kill runs first, where a correctly built engine is expected to be perfect, not merely better.

### 10.6 Sources for section 10



- LevelDB: `doc/log_format.md`, `doc/impl.md`, `db/filename.cc` (`SetCurrentFile`), `table/format.h:79` — https://github.com/google/leveldb
- RocksDB: wiki "Write Ahead Log File Format", "WAL Recovery Modes"; `include/rocksdb/options.h` (`WriteOptions::sync`) — https://github.com/facebook/rocksdb
- LMDB: `libraries/liblmdb/lmdb.h` (intro comment, `MDB_NOSYNC`/`MDB_NOMETASYNC`), `mdb.c:1251` (`NUM_METAS`), `mdb.c:4253` — https://github.com/LMDB/lmdb
- Bitcask: "Bitcask: A Log-Structured Hash Table for Fast Key/Value Data" (Basho, 2010-04-27) https://riak.com/assets/bitcask-intro.pdf; `include/bitcask.hrl` — https://github.com/basho/bitcask
- CouchDB: `src/couch/src/couch_file.erl` (`SIZE_BLOCK`, `assemble_file_chunk_and_checksum/1`, `handle_write_header/2`, `find_header/3`, `find_newest_header/2`) — https://github.com/apache/couchdb; https://docs.couchdb.org/en/stable/intro/overview.html (note: that page's "two consecutive, identical chunks" header description is **stale** relative to the code, which appends headers at block boundaries and scans backwards)
- Lucene: `lucene90/package-summary.html`, `CodecUtil` javadoc, `IndexWriter` javadoc (`prepareCommit`, `commit`, `flush`, `rollback`), `CodecUtil.java` — https://lucene.apache.org/core/9_0_0/core/ and https://github.com/apache/lucene
- git: https://git-scm.com/docs/git-config (`core.fsync`, `core.fsyncMethod`), https://git-scm.com/docs/gitglossary; `object-file.c` (`finalize_object_file_flags`, `odb_transaction_files_fsync`), `odb/source-loose.c` (`create_tmpfile`, `close_loose_object`) — https://github.com/git/git
- PostgreSQL: https://www.postgresql.org/docs/current/wal-reliability.html, /runtime-config-wal.html, /wal-internals.html, /runtime-config-error-handling.html (`data_sync_retry`); `src/include/access/xlogrecord.h`
- fsyncgate: Craig Ringer, pgsql-hackers 2018-03-28, https://www.postgresql.org/message-id/flat/CAMsr%2BYHh%2B5Oq4xziwwoEfhoTZgr07vdGG%2Bhu%3D1adXx59aTeaoQ%40mail.gmail.com; https://lwn.net/Articles/752063/
- Rebello, Patel, Alagappan, Arpaci-Dusseau & Arpaci-Dusseau, "Can Applications Recover from fsync Failures?", USENIX ATC '20 — https://www.usenix.org/conference/atc20/presentation/rebello
- Pillai, Chidambaram, Alagappan, Al-Kiswany, Arpaci-Dusseau & Arpaci-Dusseau, "All File Systems Are Not Created Equal: On the Complexity of Crafting Crash-Consistent Applications", OSDI '14 — https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-pillai.pdf
- MMKV: https://github.com/Tencent/MMKV/wiki/design; `Core/MMKV.cpp` (`m_crcPath`, `crcPathWithPath`, `checkFileCRCValid`), `Core/MMKV_IO.cpp`, `Core/MMKV_IO.h` (`CRC_SUFFIX`), `Core/MMKVMetaInfo.hpp`, `Core/MMKVPredef.h` (`MMKVRecoverStrategic`) — https://github.com/Tencent/MMKV; wrapper https://github.com/mrousavy/react-native-mmkv
- Realm: `src/realm/alloc_slab.hpp` (`m_top_ref[2]`, `flags_SelectBit`), `src/realm/group_writer.cpp` (`GroupCommitter::commit`) — https://github.com/realm/realm-core; deprecation https://github.com/mongodb/docs-realm/blob/master/source/deprecation.txt (rendered at https://www.mongodb.com/docs/atlas/device-sdks/deprecation/); https://github.com/realm/realm-js
- ZooKeeper `FileTxnLog.java` — https://github.com/apache/zookeeper; etcd `server/storage/wal/{wal.go,decoder.go,walpb/record.proto}`, `pkg/crc/crc.go` — https://github.com/etcd-io/etcd
- https://github.com/npm/write-file-atomic · https://github.com/fabiospampinato/atomically · https://github.com/sindresorhus/conf (`source/index.ts`, EXDEV fallback) · https://github.com/sindresorhus/electron-store · https://github.com/typicode/lowdb · https://github.com/typicode/steno (`src/index.ts` — no fsync)
- PGlite https://pglite.dev/docs/filesystems, https://pglite.dev/docs/multi-tab-worker · DuckDB-wasm https://duckdb.org/docs/current/clients/wasm/instantiation · PowerSync https://docs.powersync.com/client-sdk-references/javascript-web · Evolu https://github.com/evoluhq/evolu (`packages/web/src/Sqlite.ts`), https://github.com/evoluhq/sqlite-wasm · cr-sqlite https://github.com/vlcn-io/js (`packages/crsqlite-wasm/src/index.ts`) · libsql https://github.com/tursodatabase/libsql-client-ts · absurd-sql https://github.com/jlongster/absurd-sql + https://jlongster.com/future-sql-web
- automerge-repo `StorageAdapterInterface.ts`, `StorageSubsystem.ts`, `automerge-repo-storage-indexeddb/src/index.ts`, `automerge-repo-storage-nodefs/src/index.ts` — https://github.com/automerge/automerge-repo
- Fireproof https://use-fireproof.com/docs/architecture + `core/gateways/indexeddb` · Replicache https://doc.replicache.dev/concepts/how-it-works · Zero https://zero.rocicorp.dev/docs/react-native · TinyBase https://tinybase.org/guides/persistence/an-intro-to-persistence/ + `createOpfsPersister` · y-indexeddb https://github.com/yjs/y-indexeddb (`src/y-indexeddb.js`) · WatermelonDB https://watermelondb.dev/docs/Implementation/DatabaseAdapters · Dexie https://dexie.org/docs/Dexie/Dexie · PouchDB https://pouchdb.com/adapters.html · opfsdb https://github.com/sliterok/opfsdb
- IndexedDB internals: Chromium `content/browser/indexed_db/docs/README.md` and `leveldb_coding_scheme.md` (chromium.googlesource.com); WebKit `Source/WebCore/Modules/indexeddb/server/SQLiteIDBBackingStore.cpp`; Mozilla `dom/indexedDB/DBSchema.cpp` and `ActorsParent.cpp` (hg.mozilla.org)
- React Native engines: https://docs.expo.dev/versions/latest/sdk/sqlite/ · https://docs.expo.dev/versions/latest/sdk/filesystem/ (no fsync/flush/atomic/durable anywhere on the page) · https://op-engineering.github.io/op-sqlite/ · https://github.com/margelo/react-native-nitro-sqlite · https://github.com/greentriangle/react-native-leveldb
- RxDB: `src/types/rx-storage.interface.d.ts`, `test/unit/custom-storage.ts`, `test/unit/rx-storage-implementations.test.ts` (3,807 lines / 63 cases / zero durability cases) — https://github.com/pubkey/rxdb; https://rxdb.info/rx-storage-memory-mapped.html · /rx-storage-sharding.html · /rx-storage-localstorage-meta-optimizer.html · /rx-storage-filesystem-expo.html · /rx-storage-sqlite.html · /react-native-database.html; npm registry search for RxDB storages (all SQLite/PGlite; none for MMKV, LevelDB or Realm)
- https://fs.spec.whatwg.org/ — searched for `move(` and `rename`: **0 occurrences each**; whatwg/fs#10 (2022) and #180 (2026) add `move` and are still open; Chromium `third_party/blink/renderer/modules/file_system_access/file_system_file_handle.idl` ships file `move()` with `MeasureAs` only (no runtime flag), `file_system_handle.idl` keeps directory `move()` behind `FileSystemAccessAPIExperimental`

Flagged as unverified for section 10: whether an explicit Lucene doc sentence states that a partial
segment is ignored because `segments_N` is the commit point (the mechanism is documented piecewise,
not in one quotable line); whether `write-file-atomic`/`atomically` fsync the parent directory after
rename (neither README says); which CouchDB release moved the default checksum from MD5 to
xxhash128; whether Chromium's SQLite IndexedDB backing store is enabled by default today; op-sqlite's
default journal/synchronous pragmas; and browser persistence for `@libsql/client-wasm`.

## 11. Addendum (2026-09-17, after Paul offered to change the multi-tab ruling)

The ruling does not need to flip; the topology under it does. The multi-tab damage class (positional
changelog ops from one tab deleting a neighbour row in another) exists because web runs **one storage
instance per tab on the same files** (`packages/database/src/adapters/storage/index.web.ts` →
`getRxStorageWorker` → per-tab dedicated `opfs.worker.js`). Electron already runs the other shape:
every window proxies over IPC to **one** main-process storage, which is why the #1050 CAS and recovery
were correct there without any of this machinery (#1057 body).

Web can adopt Electron's shape with parts that are already installed:

- `getRxStorageSharedWorker` ships in the installed `rxdb-premium/plugins/storage-worker`
  (`dist/esm/plugins/storage-worker/non-worker-shared.js`); rxdb's docs: "the SharedWorker is created
  exactly once, even when there are multiple browser tabs opened" (rxdb.info/rx-storage-shared-worker.html).
- Inside it, `getRxStorageSQLite` over `getSQLiteBasicsWasm` (wa-sqlite; documented on
  rxdb.info/rx-storage-sqlite.html) with wa-sqlite's `AccessHandlePoolVFS`: OPFS, worker-only, sync
  build, single connection by design, `journal_mode=wal` allowed, "Full durability ✅", no COOP/COEP
  (wa-sqlite `src/examples/README.md`). One connection is exactly what a SharedWorker gives.
- `multiInstance: true` stays: each tab still creates its own RxDatabase against the shared storage, and
  rxdb says not to set it false "when you also create the same storage on another realm". The
  BroadcastChannel then carries RxDB change events only, never file positions.

Support envelope (MDN browser-compat-data, 2026-09-17): `FileSystemSyncAccessHandle` Chrome 102, Chrome
Android 109, Firefox 111, Safari 15.2; `SharedWorker` Chrome 5, Safari re-added in 16, **Chrome Android
only from 148**. WCPOS web users over 90 days are Chrome/Edge/Electron on Windows and Mac first, then
Firefox 44, Safari 29, Chrome Mobile Android 21 (Sentry). Fallback where `SharedWorker` is missing:
dedicated worker + a `navigator.locks` exclusive lease with a "POS is open in another tab — take over"
screen (the PGlite / Notion pattern), or wa-sqlite's multi-connection `OPFSCoopSyncVFS`.

Known cost to design for: one worker is one point of failure for every tab (monorepo#891 already
records shared-worker death starving opens), so the liveness/respawn protocol that issue asks for
becomes a requirement, not a nice-to-have — Electron's main process has the same property today.

**Net:** with the topology changed, SQLite becomes viable on all four targets, which restores the
one-engine property Paul valued in 1.9 — this time on an engine that has the toolkit. The web
candidate belongs in the #2091 spike alongside native and desktop, scored on the same crash harness.


## 12. Is wa-sqlite fit for purpose? (wa-sqlite vs the official SQLite wasm build)

**Short answer: the SQLite core is battle-tested in both, because it is the same C code. The VFS is
not SQLite, and wa-sqlite's VFS layer is not battle-tested — its own repository says so in as many
words. The official `opfs-sahpool` is a port of that same wa-sqlite file, maintained by the SQLite
team, tested in the SQLite tree, and shipped on sqlite.org's download page next to the Windows DLLs.
Take the SQLite project's copy. The only thing standing in the way is an rxdb adapter that, on
inspection, does not work with wa-sqlite either.**

### What is, and is not, SQLite in each package

| | wa-sqlite | @sqlite.org/sqlite-wasm |
|---|---|---|
| SQLite version | `SQLITE_VERSION = version-3.53.0` (`Makefile`), with its own `SQLITE_THREADSAFE=0`, `SQLITE_DQS=0`, `SQLITE_DEFAULT_WAL_SYNCHRONOUS=1`, `SQLITE_OMIT_*` defines | 3.53.4 (`3.53.4-build1`, 2026-09-08), the project's own build |
| Who wrote the VFS | Roy Hashimoto, `src/examples/*VFS.js` — **the project's own JavaScript, not SQLite code** | The SQLite project, `ext/wasm/api/sqlite3-vfs-opfs-sahpool.c-pp.js` |
| What the project calls itself | "a WebAssembly build of SQLite **with support for writing SQLite virtual filesystems completely in Javascript**… several OPFS virtual file systems are among the examples provided as **proof of concept**" (README) | "making WASM builds of the library **first-class members of the family of supported SQLite deliverables**" (about.md) |
| What it says about the VFSes | "These examples are intended to help developers get started… and to experiment. **Using them as-is in production is not prohibited but that isn't their primary purpose.**" (`src/examples/README.md`) | A documented, supported VFS with install/pool APIs and stated limits (persistence.md) |
| License / cadence | MIT since 2023-02-10, "changed by generous sponsors Fleet Device Management and Reflect"; 12 ad-hoc releases in 25 months (v1.0.1 2024-07 → v1.1.2 2026-08-11) | Public domain; versioned with SQLite — `sqlite-wasm-3530400.zip` sits on sqlite.org/download.html beside the DLLs |

`opfs-sahpool` **is** `AccessHandlePoolVFS`: the official file's header says it is "a port of Roy
Hashimoto's OPFS SyncAccessHandle pool… with Roy's explicit permission". This is not a choice between
two designs, but between the author's example file and the SQLite team's maintained fork of it.

### Maintainers, cadence, bus factor

**wa-sqlite:** 1,415 stars, 109 forks, 14 contributors — and **945 of 989 commits (95.6%) by one
person**, since `shoestringr` (775) and `rhashimoto` (170) are both Roy Hashimoto
`<roy@shoestringresearch.com>`. Issues enabled, 6 open / 80 closed. Last release v1.1.2, 2026-08-11.
No SUPPORT or FUNDING file and no support statement anywhere; the README points at GitHub discussions
and an FAQ issue label. VFS testing is `test/AccessHandlePoolVFS.test.js` running five generic suites
(`vfs_xAccess/xOpen/xClose/xRead/xWrite`) on **Chrome 129 only** (`.github/workflows/ci.yml`);
grepping the whole test tree for crash/power/corrupt/torn/kill returns **zero hits**. Bus factor one.
That is arithmetic, not a slur.

**sqlite/sqlite-wasm:** 1,055 stars, 22 contributors, 1 open / 90 closed issues — all packaging (Vite
resolution, ESM exports, typings). It contains **no VFS source**: it "wraps the code of SQLite Wasm
with _no_ changes, apart from added TypeScript types" and redirects bugs to SQLite's own tracker
(README). The VFS lives in the fossil tree at `ext/wasm/`, tested there by `tester1.c-pp.js` and
`ext/wasm/tests/`. Support: "Technical support is provided… via the sqlite forum. Those with
commercial SQLite support contracts may use their usual support channels" (index.md). Note that
sqlite.org/testing.html's four harnesses and 100% MC/DC describe the **core library**, not the JS layer.

### Corruption and durability history

wa-sqlite's tracker, searched for `corrupt`, `data loss`, `OPFS`, `AccessHandlePool`:

| # | State | Opened | Title | Attributed to |
|---|---|---|---|---|
| 320 | closed 2026-04-22 | 2026-04-17 | Disk image malformed (WriteAheadVFS, FTS5, GEOPOLY) | **wa-sqlite** — wrong size via `xFileSize`, then "pages were being read at the correct offset but from the wrong WAL file… poor state management where the WAL file identifier was stale" |
| 258 | **open** | 2025-04-05 | Disk image malformed (IDBBatchAtomicVFS, FTS5) | **wa-sqlite** — "I did not consider that SQLite might write beyond the file size offset"; both IDB VFSes reproduced failing on trunk. Open 17 months. |
| 341 | **open** | 2026-08-12 | OPFSCoopSyncVFS: concurrent migrations hang forever and poison the lock file | unresolved; original repro was against the `@journeyapps` fork, a clean one landed 2026-09-16 |
| 336 / 345 / 346 | **open** | 2026 | opaque I/O error instead of `SQLITE_FULL` on quota exhaustion; `WriteAhead` null crash; VACUUM ignores a write error | wa-sqlite |
| 303 / 296 / 111 | closed | 2023–25 | WAL corrupts the file header; `NoModificationAllowedError` after storage clear; `synchronous=0` malforms the image | wa-sqlite / browser / user misuse |

**The finding that matters is the silence, not the noise.** Every OPFS corruption issue above is
against `OPFSWriteAheadVFS`, `OPFSCoopSyncVFS` or the IndexedDB VFSes. Searching the tracker for
`AccessHandlePool` returns **zero issues, open or closed, ever**. At 457 lines, single-connection, no
cross-tab locking, no VFS-level WAL, it is the least ambitious file in that directory and has no
corruption history — which cuts against reading wa-sqlite's issue list as a verdict on the VFS we
would actually use.

The official build is not clean either, and the honest framing is that nobody's OPFS layer is:

- **sahpool's own bug (2023-07-23):** reusing a pool slot left the previous filename's tail in the
  header (`hello.sqliteame.sqlite`) — "the database not being found after the page is refreshed, the
  sah pool getting exhausted, or even creating two OPFS files with the same encoded name". Fixed on
  trunk the same evening. Stephan Beal: "Roy's original impl doesn't have that problem because he
  uses scope-local buffers" — the port introduced it.
- **SQLITE_CORRUPT on sahpool, iOS/WebKit (2025-04-18):** one connection, no pragmas, weeks clean,
  then one INSERT deterministically returns SQLITE_CORRUPT while every SELECT works. Never
  root-caused. Beal: "almost always impossible to track down the (thankfully rare!) cases of
  corruption in either of the OPFS VFSes", and the line for the spike doc: **"Browser storage is very
  much 'built on sand'… it must never be relied upon for any data which cannot be easily recovered
  from other sources."**
- **~40 corruption reports from 40,000 users (2023-10-23)** on the official `opfs` VFS (not sahpool),
  always Windows, one of them reproducible by restarting Windows with Chrome running; believed
  environmental, and in the same thread half a dozen users lost databases entirely to CCleaner.

What the official docs commit to for `opfs-sahpool`, verbatim: **"Does not support multiple
simultaneous connections"**; "No filesystem transparency"; `initialCapacity` defaults to 6 and "needs
to be at least twice the number of expected database files (to account for journal files) and may
need to be even higher than three times the number of databases plus one… The library cannot
guestimate an ideal value - it must be provided by the client." WAL works since 3.47 but "requires
that a client specifically activate exclusive-locking mode for a db handle immediately after opening
it", and "does not provide any concurrency benefits in this environment". Plus the disappearance
sidebar: databases "sometimes disappear for environment-specific reasons outside of this library's
control" — virus scanners, "computer cleaner" software, storage permissions, "a browser-internal
decision to clean up on its own".

`xSync` maps to `flush()` in **both** (official `xSync:` → `file.sah.flush()`; wa-sqlite
`AccessHandlePoolVFS.js:169` `jSync()` → `file.accessHandle.flush()`), so §1's finding stands: on
macOS Chrome `flush()` is `F_BARRIERFSYNC` (iOS Chrome is WebKit: undocumented), giving SQLite ordering rather than a hardware sync —
which SQLite is designed to survive and the append-only engine is not.

**Unverified:** I could not source the "252 access handles per origin in Safari" figure first-party.
No such constant exists in WebKit's `FileSystemStorageHandle.cpp`, `FileSystemStorageManager.cpp` or
`NetworkStorageManager.cpp`, and neither the SQLite docs nor the forum state a numeric cap. The
mechanism is real — WebKit opens the file in the network process and passes a descriptor to the web
process (bug 231466) — but treat the number as folklore until the spike measures it. It should not
bite us regardless: sahpool holds a handful of slots per database, not one per row.

### Who actually runs each in production (first-party sources only)

| Product | Package | VFS | Tab strategy | Source |
|---|---|---|---|---|
| **Notion** | official SQLite-team wasm build (package never named) | **`opfs-sahpool`** | dedicated Worker per tab; SharedWorker elects one active tab; tab-close via a held Web Lock | notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite |
| **Evolu** | `@evolu/sqlite-wasm`, a fork of **`sqlite/sqlite-wasm`** + SQLite3MultipleCiphers | `opfs-sahpool` via `installOpfsSAHPoolVfs()` / `OpfsSAHPoolDb` | `Db.worker` + `Shared.worker`, `navigator.locks` | `packages/web/src/Sqlite.ts:48,88` |
| **PowerSync** web SDK | `@journeyapps/wa-sqlite` — a fork **199 commits ahead / 4 behind** upstream | **default `IDBBatchAtomicVFS`**; docs recommend **`OPFSCoopSyncVFS`** for multi-tab | SharedWorker leader, BroadcastChannel fallback | `packages/web/src/db/adapters/resolveAndValidateOptions.ts`; `client-sdks/reference/javascript-web.mdx` |
| **LiveStore** | `@livestore/wa-sqlite`, own fork | `AccessHandlePoolVFS`, one connection per db, **WAL disabled** | web-locks leader worker; SharedWorker is a proxy only | `docs/…/state/sqlite.md`; `context/…/01-persistence/spec.md` |
| **Expo** `expo-sqlite` (web) | wa-sqlite vendored into the Expo repo | `AccessHandlePoolVFS` (VFS name `expo-sqlite`) | one dedicated worker; requires COOP/COEP | `packages/expo-sqlite/web/worker.ts:10,48` |
| **vlcn/cr-sqlite** | `@vlcn.io/wa-sqlite`, own fork | `IDBBatchAtomicVFS` | single connection + `async-mutex` | `packages/crsqlite-wasm/src/index.ts:4` — **dead: last JS commit 2023-12-16** |

npm downloads, last month (registry API): `@sqlite.org/sqlite-wasm` **2,876,510**;
`@journeyapps/wa-sqlite` 713,881 (essentially all PowerSync SDK installs); upstream **`wa-sqlite`
45,360**; `@livestore/wa-sqlite` 30,044; `@vlcn.io/crsqlite-wasm` 5,163. Nothing in production runs
*upstream* wa-sqlite — PowerSync, LiveStore, vlcn and Expo each ship a fork or a vendored copy.

Three things fall out of that table. **Notion is the largest first-party-confirmed `opfs-sahpool`
deployment**, and chose it for our exact reason: "we went with OPFS SyncAccessHandle Pool VFS because
it didn't have the requirement of cross-origin isolation". (They also report hitting corruption —
"multiple rows with the same ID but different content" — on the *other* OPFS VFS.) **PowerSync is not
evidence for AccessHandlePoolVFS**: their default is IndexedDB, their multi-tab recommendation
`OPFSCoopSyncVFS`. And **LiveStore, who do run `AccessHandlePoolVFS`, turn WAL off**: "Write-ahead
logging (WAL) is currently not supported/enabled for the web adapter using OPFS
(AccessHandlePoolVFS). The underlying VFS does not support WAL reliably in this setup." That is a
first-party production report contradicting §11's "`journal_mode=wal` allowed", which came from
wa-sqlite's own README table.

### The rxdb adapter question — and the thing nobody has checked

`SQLiteBasics<T>` is six fields (`rxdb/dist/types/plugins/storage-sqlite/sqlite-types.d.ts`):
`open(name) => Promise<DB>`, `all(db, {query, params, context}) => Promise<SQLResultRow[]>`,
`run(db, …) => Promise<void>`, `setPragma(db, key, value)`, `close(db)`, and a literal
`journalMode: 'WAL' | 'WAL2' | 'DELETE' | … | ''`. That is a trivially small seam, and
`getSQLiteBasicsWasm` is re-exported unchanged from open-source rxdb, so we can read it.

Reading it is unpleasant. The installed source
(`node_modules/rxdb/dist/esm/plugins/storage-sqlite/sqlite-basics-helpers.js`, rxdb 17.4.0) calls:

```
sqlite3.open_v2(name)            // exists in wa-sqlite
sqlite3.execWithParams(db.nr, …) // DOES NOT EXIST in wa-sqlite
sqlite3.run(db.nr, …)            // DOES NOT EXIST in wa-sqlite
sqlite3.exec(db.nr, "pragma …")  // exists (callback form)
sqlite3.close(db.nr)             // exists
```

wa-sqlite's `src/sqlite-api.js` exports `bind_*`, `column_*`, `exec`, `statements`, `step`,
`open_v2`, `close` — there is no `execWithParams` and no `run`, on master or in any released dist.
A GitHub code search for `execWithParams` in `rhashimoto/wa-sqlite` returns **0 hits**; across all of
GitHub the only match in either project is rxdb's own call site. The published docs page compounds
it: it imports the **Asyncify** build, never registers a VFS at all (so you get a memory database),
and its snippet reads `SQLite.Factory(module)` where `module` is undefined — the variable it just
assigned is `sqliteModule`. The doc comment in the source is a third story again: it says
`@link wa-sqlite` and then shows `import sqlite3InitModule from '@sqlite.org/sqlite-wasm'` and
`getSQLiteBasicsWasm({ dbConstructor: sqliteWasm.oo1.DB })`, an argument shape the function never
reads. And the whole adapter funnels every call through one module-global promise chain
(`runQueueWasmSQLite`) because "the wa-sqlite module has problems when running prepared statements
with params in parallel… This is bad for performance and should be fixed at the wa-sqlite repo."

So the premise that "rxdb-premium supports wa-sqlite and not the official build" is false in both
directions: **it supports neither as shipped.** We are writing an adapter whichever build we pick.
Writing one over `@sqlite.org/sqlite-wasm` is the easy version — `open` is
`new poolUtil.OpfsSAHPoolDb('/name')`, `all` is
`db.exec({sql, bind, rowMode:'object', returnValue:'resultRows'})`, `run` is `db.exec({sql, bind})`,
`setPragma` is `db.exec('pragma …')`, `close` is `db.close()` (api-oo1.md). Roughly 25 lines,
synchronous under the hood, no serialization queue needed. Keep `journalMode: 'WAL'` — not the
`WAL2` default in the type, which is not in mainline SQLite — and issue
`pragma locking_mode=exclusive` before anything else, as the official WAL docs require.

### Verdict

**(a) Is the SQLite core battle-tested in both? Yes, identically.** Both compile the same
amalgamation from sqlite.org — 3.53.0 for wa-sqlite, 3.53.4 for the official build.
sqlite.org/testing.html: four independently developed harnesses, 100% branch and MC/DC coverage in
the as-deployed configuration, "millions and millions of test cases", plus out-of-memory, I/O-error,
crash-and-power-loss, fuzz and malformed-database tests, against ~592× as much test code as library
code. That is exactly the property §1 found the append-only engine lacks, and either package gives it
to us. wa-sqlite's compile defines deserve one look in the spike (`SQLITE_THREADSAFE=0` is fine for
one connection; `SQLITE_DEFAULT_WAL_SYNCHRONOUS=1` means NORMAL, not FULL) but they are ordinary
options, not modifications.

**(b) Is the VFS layer battle-tested? Only one of them, and only barely.** For wa-sqlite's
`AccessHandlePoolVFS`: its own directory README says production use "isn't their primary purpose";
its entire CI coverage is five generic method suites on one Chrome version, with zero crash tests; it
has no corruption history of its own, but its five sibling VFSes have seven issues, three still open,
all fixed by one person; and the largest first-party deployments I could confirm run it with **WAL
switched off** (LiveStore) or do not run it at all (PowerSync defaults to IndexedDB). Nobody ships
*upstream* wa-sqlite in production — 45k npm downloads a month against 2.88M for the official build.
For official `opfs-sahpool`: same algorithm, but in the SQLite tree with `ext/wasm` tests, shipped in
every SQLite release, limits documented, supported on the forum and under commercial contracts, its
one self-inflicted corruption bug fixed within hours in 2023 — and **Notion runs it**, first-party
confirmed, at a scale and on a browser matrix WCPOS will never approach. That is the single strongest
battle-testing datum on either side of this comparison. Neither VFS has anything like the core's
crash testing, which is precisely why §8 wants a harness.

**(c) Recommendation for WCPOS.** Put **`@sqlite.org/sqlite-wasm` with `opfs-sahpool`** in the #2091
web spike — inside §11's SharedWorker, one connection, `initialCapacity` set explicitly rather than
left at 6 (count our databases ×3, +1), and a ~25-line `SQLiteBasics` adapter over `oo1.DB`. Do not
adopt wa-sqlite on the strength of rxdb's documentation, because that documentation does not describe
working code; keep it in the spike only as a fallback if sahpool's single-connection install collides
with something we cannot restructure. Treat **WAL as unproven, not as a given** — §11 took
"`journal_mode=wal` allowed" from wa-sqlite's README table, and LiveStore's docs say the opposite from
production; run the spike both ways and let the harness decide. At the VFS layer specifically the
harness must exercise, on Chrome, Firefox and Safari: **kill mid-transaction with WAL** (a worker is
not a process and cannot take a signal, but `Worker.terminate()` is immediate — it stops the thread
wherever it is, mid-`xWrite` included — so the crash is deterministic if the VFS stops at the named
boundary first: wrap sahpool's `xWrite`/`xSync` so that at the boundary — once between `xWrite` and
`xSync`, once between the WAL append and the checkpoint — the worker signals the page through a
`SharedArrayBuffer` (`Atomics.store` + `notify`; `postMessage` does not flush from a blocked worker)
and blocks on `Atomics.wait`, and the page, watching with `Atomics.waitAsync` or a poll, terminates
it there. `SharedArrayBuffer` needs cross-origin isolation, which §17's production setup does not
have, so either serve the harness with test-only COOP/COEP headers (Playwright can add them on the
route) or block the worker without isolation: a synchronous `XMLHttpRequest` to a harness route that
never answers is legal in a worker and holds it at the boundary just as well. Do **not** inject by throwing: SQLite sees a thrown `xWrite` as an I/O error and runs its
rollback path, so a clean reopen proves error handling, not crash durability. Kill the whole browser
process for process-level crashes — the "slight performance boost from WAL" claim in the official docs carries no
crash-safety claim at all);
**page-cache spill** (`cache_size` below the working set so the journal actually reaches OPFS instead
of living in memory — that is how #320's WAL-boundary bug surfaced); **reopen after quota
exhaustion** (wa-sqlite #336 shows this layer can report an opaque I/O error instead of
`SQLITE_FULL`; verify sahpool distinguishes them and that the reopen is clean); **handle exhaustion**
(fill the pool, assert a clean install failure rather than corruption, and measure the real
per-origin ceiling on Safari since the 252 figure is unsourced); and **slot reuse across reopen**
(delete and recreate databases until pool slots recycle — the exact path that produced the 2023
`hello.sqliteame.sqlite` bug). Score process-kill runs first, where a correctly built engine should
be perfect, exactly as §10.5 argues.

### 12.1 Sources

**wa-sqlite** — https://github.com/rhashimoto/wa-sqlite: `README.md` (purpose, "proof of concept",
MIT-since-2023 sponsor note), `src/examples/README.md` ("Using them as-is in production is not
prohibited but that isn't their primary purpose"; VFS comparison table), `Makefile`
(`SQLITE_VERSION = version-3.53.0`, `WASQLITE_DEFINES`), `package.json` (v1.1.2),
`src/sqlite-api.js` (full exported API — no `execWithParams`, no `run`),
`src/examples/AccessHandlePoolVFS.js` (457 lines; `DEFAULT_CAPACITY = 6`; `jSync()` → `flush()` at
:169), `test/AccessHandlePoolVFS.test.js`, `.github/workflows/ci.yml` (Chrome 129).
GitHub API: `repos/rhashimoto/wa-sqlite` (1,415 stars, 6 open issues), `/contributors`,
`/commits?author=shoestringr` (Roy Hashimoto `<roy@shoestringresearch.com>`), `/releases`,
commit-count via Link header (989). Issues #111, #258, #296, #303, #320, #336, #341, #345, #346.

**Official build** — https://sqlite.org/wasm/doc/trunk/index.md (support statement; "In the Wild"
list; wa-sqlite credit), `/about.md` ("first-class members of the family of supported SQLite
deliverables"), `/persistence.md` (sahpool advantages/disadvantages, `initialCapacity`, SAHPool
Concurrency, WAL Mode with OPFS, Storage Limits, "Mysterious Disappearance of Databases"),
`/api-oo1.md` (`oo1.DB`, `exec`, `selectObjects`, `prepare`, `close`).
Source: `ext/wasm/api/sqlite3-vfs-opfs-sahpool.c-pp.js` (header crediting Roy Hashimoto; `xSync` →
`file.sah.flush()`; `SECTOR_SIZE`), `ext/wasm/tester1.c-pp.js`, `ext/wasm/tests/` —
https://github.com/sqlite/sqlite/tree/master/ext/wasm.
https://sqlite.org/download.html (`sqlite-wasm-3530400.zip`). https://sqlite.org/testing.html.
npm packaging repo https://github.com/sqlite/sqlite-wasm — `README.md` ("with _no_ changes"), tags
(`3.53.4-build1` 2026-09-08), issue list.

**SQLite forum** — "WASM OPFS-sahpool VFS filename bug" (2023-07-23)
https://sqlite.org/forum/forumpost/65b08a58c9b36415dbcc58cf8eca84dc24197e8ca8267355679c873d0c434c65 ·
"Rare Corruption using SQLite WASM" (2023-10-23)
https://sqlite.org/forum/forumpost/5543370423fe67d00f5fd1e94a083313a3743090bac577170885197c1e826f1d ·
"SQLITE_CORRUPT but almost all queries still work?" (2025-04-18)
https://sqlite.org/forum/forumpost/7a40306f802152167beda7ee025e99067b8541e4023a5a6e5f9a925f61e8d351

**rxdb** — installed 17.4.0: `/Users/kilbot/Projects/monorepo-v2/node_modules/rxdb/dist/esm/plugins/storage-sqlite/sqlite-basics-helpers.js`
(`getSQLiteBasicsWasm`, `runQueueWasmSQLite`, the `@sqlite.org/sqlite-wasm` doc comment),
`node_modules/rxdb/dist/types/plugins/storage-sqlite/sqlite-types.d.ts` (`SQLiteBasics`: `open`,
`all`, `run`, `setPragma`, `close`, `journalMode`),
`node_modules/rxdb-premium/dist/esm/plugins/storage-sqlite/sqlite-basics-helpers.js` (re-exports
`getSQLiteBasicsWasm` from `rxdb/plugins/storage-sqlite`). Docs page https://rxdb.info/rx-storage-sqlite.html
("Usage with Webassembly in the Browser"). GitHub code search for `execWithParams`: 0 hits in
`rhashimoto/wa-sqlite`, only `pubkey/rxdb`'s own call site elsewhere.

**Production adopters (first-party only)** — Notion: https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite ·
Evolu: https://github.com/evoluhq/evolu `packages/web/src/Sqlite.ts:48,88` and
https://github.com/evoluhq/sqlite-wasm `README.md` · PowerSync:
https://github.com/powersync-ja/powersync-js `packages/web/src/db/adapters/resolveAndValidateOptions.ts`
and https://github.com/powersync-ja/powersync-docs `client-sdks/reference/javascript-web.mdx` ·
LiveStore: https://github.com/livestorejs/livestore `docs/src/content/docs/building-with-livestore/state/sqlite.md`,
`context/02-system/04-runtime/01-web/01-persistence/spec.md`,
`docs/src/content/docs/platform-adapters/web-adapter.mdx` · Expo:
https://github.com/expo/expo `packages/expo-sqlite/web/worker.ts:10,48` · vlcn:
https://github.com/vlcn-io/js `packages/crsqlite-wasm/src/index.ts:4` (last commit 2023-12-16) ·
downloads from `https://api.npmjs.org/downloads/point/last-month/<pkg>`.

**Safari handle cap (unverified)** — searched WebKit `Source/WebKit/NetworkProcess/storage/`
(`FileSystemStorageHandle.cpp`, `FileSystemStorageManager.cpp`, `NetworkStorageManager.cpp`): no
per-origin handle constant. Mechanism from https://bugs.webkit.org/show_bug.cgi?id=231466 and
https://webkit.org/blog/12257/the-file-system-access-api-with-origin-private-file-system/. The "252"
figure has no first-party source I could find.

Flagged as unverified for section 12: the Safari 252-handle cap; whether Notion uses the
`@sqlite.org/sqlite-wasm` npm package specifically (they name only "the WebAssembly implementation of
sqlite3" and the VFS in prose); whether Reflect, named as a wa-sqlite sponsor, actually runs it in
production (no first-party statement found); and whether the SQLite team's `ext/wasm` tests include
any crash- or power-loss case for `opfs-sahpool` (the tests exist; sqlite.org/testing.html's crash
testing describes the C core, and I did not read every `ext/wasm/tests/` file).

## 13. Corrections to §11 after the §12 vetting (2026-09-17)

1. **The SQLite connection cannot live in a SharedWorker.** The WHATWG File System spec marks
   `createSyncAccessHandle()` and the whole `FileSystemSyncAccessHandle` interface
   `[Exposed=DedicatedWorker]` (fs.spec.whatwg.org §2.3, §2.6); LiveStore's web adapter docs say the
   same in practice ("synchronous OPFS API which isn't supported in a shared worker"). So the
   topology is Notion's, not "rxdb's SharedWorker storage": **one dedicated worker in the leader tab
   holds the single connection; a SharedWorker (or BroadcastChannel) only routes the other tabs'
   requests to it**, and a `navigator.locks` lease decides who the leader is (Notion: "only one tab is
   permitted to actually use its Web Worker… A SharedWorker is responsible for managing which is the
   'active tab'"). WCPOS already has the lock-based leader from #1057; what is new is routing
   follower tabs' storage calls to the leader's worker (rxdb's `storage-remote` message-channel
   plugin is the seam), and the failover when the leader tab closes.
2. **Use the SQLite team's build, not upstream wa-sqlite.** `opfs-sahpool` in `@sqlite.org/sqlite-wasm`
   is the SQLite project's maintained port of Roy Hashimoto's `AccessHandlePoolVFS`; Notion ships it
   first-party ("OPFS SyncAccessHandle Pool VFS… because it didn't have the requirement of
   cross-origin isolation"); wa-sqlite's own `src/examples/README.md` says production use "isn't their
   primary purpose". Details and numbers in §12.
3. **Write the rxdb adapter; do not assume `getSQLiteBasicsWasm`.** rxdb core's helper calls
   `sqlite3.execWithParams()` and `sqlite3.run()`, neither of which exists in wa-sqlite's
   `src/sqlite-api.js` (0 hits), and the docs snippet never registers a VFS. A `SQLiteBasics` over the
   official `oo1.DB` is a small, documented task (`open/all/run/setPragma/close`).
4. **Treat WAL on the pool VFS as unproven.** LiveStore, the one confirmed production
   `AccessHandlePoolVFS` user, documents "Write-ahead logging (WAL) is currently not supported/enabled
   for the web adapter using OPFS (AccessHandlePoolVFS)" (`docs/.../state/sqlite.md`). The spike must
   measure rollback-journal vs WAL on the pool VFS under the crash harness rather than assume WAL.
5. **Safari's "252 access handles" cap is folklore** until someone finds it in WebKit source; the
   pool's `initialCapacity` should be measured on a real iPad, not sized from that number.

## 14. Known issues with rxdb's SQLite storage (tracker sweep, 2026-09-17)

*Reconciliation first: §13 was appended by another session while this sweep was running, and its
point 1 is correct — I verified it independently against the spec rather than taking it on trust.
https://fs.spec.whatwg.org/ IDL: `[Exposed=DedicatedWorker] Promise<FileSystemSyncAccessHandle>
createSyncAccessHandle();` on `FileSystemFileHandle`, and `[Exposed=DedicatedWorker, SecureContext]
interface FileSystemSyncAccessHandle`. Both the pool VFSes need that handle, so **§12(c)'s "inside
§11's SharedWorker, one connection" is wrong as written** — the connection must live in a dedicated
worker owned by the leader tab, with a SharedWorker or BroadcastChannel only routing. §12's build and
VFS choice, adapter finding and harness list are unaffected; only the location of the connection
changes.*

Before swapping engines, the question is whether `rxdb-premium/storage-sqlite` is a second shit-show.
It is not — but its defect profile is a *different* one, and worth naming precisely.

**Bugs live in two places.** `pubkey/rxdb` carries the OSS layer (`src/plugins/storage-sqlite/`,
which is where the helpers and the `sqliteBasics` adapters actually live, premium re-exports them).
`pubkey/rxdb-premium-issues` has **issues disabled**: premium bug reports arrive as *pull requests*
carrying a failing reproduction. WCPOS already owns four of them (#26, #27, #30, #31) — all
abstract-filesystem. That repo is the one to watch, and it is invisible to a normal issue search.

Every `storage-sqlite` defect filed in the last 15 months, with closure reason verified via the API
(none were stale-closed; all were closed `completed` by the maintainer):

| # | Opened → closed | Days | Symptom |
|---|---|---|---|
| rxdb 7236 | 2025-06-05 → 06-16 | 11 | SQLite storage fails while querying |
| rxdb 7356 | 2025-08-22 → 09-01 | 10 | Queries with `null` executed incorrectly |
| **rxdb 7984** | 2026-03-08 → 03-10 | **2** | **bulk update silently truncates at 199 docs and reports success for all of them** |
| rxdb 8180 | 2026-03-25 → 05-05 | 41 | "no such table: main.plugin-local-documents-…" during schema migration |
| rxdb 8438 | 2026-04-28 → 05-13 | 15 | "too many SQL variables" on large replication metadata lookups |
| rxdb 8631 | 2026-06-11 → 07-02 | 21 | adapter does not use indexes correctly |
| rxdb 8635 | 2026-06-15 → 06-23 | 8 | `console.dir` inside the `BEGIN;` retry catch throws on Hermes, so **the retry loop never runs and the real SQLite error is replaced by a `TypeError`** |
| rxdb 9024 | 2026-08-31 → 09-10 | 10 | migration finalize does `Promise.all([oldStorage.remove(), metaStorage.remove()])`, bypassing `TX_QUEUE_BY_DATABASE` → "database is locked" on async single-connection adapters |
| **premium 25** | 2026-07-20 → **OPEN** | 59+ | cancelling replication closes the SQLite metadata instance mid-write; "the rejected transaction also **poisons SQLite's shared queue**, causing unrelated later operations to fail" — blocked on rxdb PR #8871 |

Open `storage-sqlite` issues in the public tracker today: **zero**. Median time-to-fix: ~10 days.
That is a materially better support posture than the filesystem engine, where §2's defects needed
2,225 lines of our own patching.

**Three of these are directly about the stack §11 and §12 propose, and should be read before the
spike starts:**

1. **premium-issues #11 (2026-03-05) is our exact web stack, and it silently lost data.** The
   reproduction runs `getRxStorageSQLite` over **wa-sqlite with `AccessHandlePoolVFS` (OPFS SAH pool,
   synchronous build)** in a worker, and reports that "a second-pass upsert of 15,000 documents
   results in only ~75 documents being written with **no error surfaced**". That became rxdb #7984
   ("only 199 documents are updated… the operation reports success for all documents, rather than
   just the documents that were inserted, and no failures") and was fixed in 17.x two days later. It
   is fixed, and we are on 17.4.0 — but it is a reminder that this layer's failure mode is *wrong
   answers reported as success*, at exactly our document counts. Incidentally the repro had to
   hand-roll the `SQLiteBasics` interface over Comlink rather than use `getSQLiteBasicsWasm`, which
   independently corroborates §12's finding that the shipped adapter does not work.
2. **premium-issues #25 is open and is the same failure class as our `task-queue-containment`
   patch.** One rejected transaction poisons a shared promise queue and every later operation
   inherits the error. §2 already lists that exact shape against the filesystem engine. Moving to
   SQLite does not buy immunity from it — it is rxdb's queue, not the engine's.
3. **rxdb #9024 confirms one connection per database is rxdb's design, not an accident** —
   `sqlite-helpers.ts` keeps a `TX_QUEUE_BY_DATABASE` serialization queue — and that the queue can be
   bypassed by rxdb's own code paths. Our proposed topology is single-connection by construction, so
   this class of bug is ours to inherit, and the spike should include a migration run, not just CRUD.

**Net for item 1:** RxDB-over-SQLite has *no* corruption or data-at-rest history in either tracker —
which is the whole point of the move — but it does have a live history of silent wrong answers,
index misuse and transaction-queue poisoning. Those are recoverable (resync fixes a wrong answer; a
corrupt store does not fix itself), and they are fixed in days rather than patched by us. That is a
better trade, not a free one. §5's caution stands: *you buy SQLite's durability and RxDB's SQL-mapping
layer, and only the first is battle-tested*.

### The Discord, partially swept (2026-09-17)

RxDB's community chat (`rxdb.info/chat` → `discord.gg/AdqM4ckqVF`) needs an account and is not
indexed or web-fetchable, and the maintainer's stale-bot routinely redirects reporters there, so it
can hold reports that never reached either tracker. A `codex-computer-use` run was blocked by
un-granted macOS Screen-Recording/Accessibility permissions; Paul searched it by hand instead and
captured three threads. **Only the `shared worker` term was swept** — `wa-sqlite`, `sahpool`,
`opfs-sahpool`, `getSQLiteBasicsWasm` and `opfs` remain unsearched, so this is a partial result, not
a clean bill of health.

**1. The orphaned shared worker — the find that matters.** RiverFlowed, 2025-05-21, on rxdb's Shared
Worker Storage wrapper, with no maintainer reply (one 👍 reaction): *"when it happens — app gets
stuck, user will try to close the page. At this step (since page is in infinite loop) it can't
terminate SharedWorker. So we're getting into the state when no page uses SharedWorker but it's still
alive. It can be noticed in chrome://inspect/#workers. And after that when user tries to open an
application — he just gets stuck in infinite loading (replication never finishes). It won't ever
finish at this step if you won't terminate worker manually."* Their proposed fix is the one we would
have to write: *"probably it makes sense just to kill the worker when it can't reach the main thread
(implement kinda Heartbeat)?"*

That is **monorepo#891's failure mode, reproduced by a third party on rxdb's own shared-worker
storage, sixteen months ago, and never answered.** It is not identical to our post-§13 shape — a
dedicated worker in the leader tab dies with its tab, so it cannot outlive every page the way theirs
did — but the sibling mode is exactly #891 constraint 1: a hung-but-alive holder retaining exclusive
OPFS access handles that the successor then cannot open. It also independently corroborates that
RxDB ships no liveness story here: the reporter notes the plugin is *"non-opensource"*, which matches
the 810-byte minified wrapper described below.

**2. rxdb#9024 was cross-posted, and the Discord adds nothing to it.** silwalprabin, 2026-08-29,
posted the identical report to the Discord — same author as the "ping" on the GitHub issue, same
`expo-sqlite finalizeAsync` `SQLITE_LOCKED (code 6)`, same three source links, same conclusion
(*"serializing SQLiteBasics operations per connection prevents the lock"*) and five questions. Useful
negative: for this defect the two channels carry one report, not two. Useful positive: it confirms
somebody runs **encrypted Premium SQLite storage on React Native in production at 17.3.0** with
`multiInstance: false`.

**3. A SQLite-storage question that turns out not to be ours.** Nico, 2026-04-20, using the premium
SQLite storage with `replicateRxCollection`: a checkpoint returned from a pull handler is not
persisted when the documents array is empty, so a pull that returns zero documents cannot advance the
sync. pubkey confirmed it is deliberate — *"Its not persisted to not have so many database writes on
each RESYNC / only when actually documents are synced"* — and suggested partial sync. Worth recording
because the reporter says the docs imply otherwise, but **it does not apply to WCPOS**: `git grep -l
replicateRxCollection origin/main` returns **zero files**, and nothing imports `rxdb/plugins/replication`.
WCPOS runs its own sync engine, so RxDB's replication checkpoint semantics are not on our path.

**4. `wa-sqlite` and `sahpool`: no hits in what was swept — read with the caveat above.** Only
`shared worker` was searched, so these terms have not had a direct search and this is not a null
result from one; it is an absence in the threads that search surfaced. What makes the absence
informative anyway is that it converges with four independent findings, and the conclusion is hard
to avoid.

- RxDB's premium SQLite users are demonstrably active in that Discord — threads 2 and 3 above are
  both production SQLite deployments — so the channel is not simply empty of SQLite traffic. It is
  empty of *browser-wasm* SQLite traffic. Every SQLite user visible is on `expo-sqlite` or Node.
- `getSQLiteBasicsWasm` calls `sqlite3.execWithParams()` and `sqlite3.run()`, and **neither exists in
  wa-sqlite's `src/sqlite-api.js`** (§12). An adapter that cannot work as shipped would be reported
  within a day by anyone who tried it. In fifteen months of tracker history, nobody has.
- The documented snippet on rxdb.info/rx-storage-sqlite.html passes an undefined `module` and never
  registers a VFS, so it yields an in-memory database. Also never reported.
- The only exercise of this path anywhere is premium-issues #11 — a Copilot-authored *reproduction
  harness*, which had to hand-roll the `SQLiteBasics` interface over Comlink rather than use the
  shipped adapter.

**Inference: the RxDB + wasm-SQLite + OPFS path is effectively unused, and WCPOS would be its first
serious production deployment.** That is a different risk statement from the one §12 answered.
§12 asked whether SQLite and its VFS are battle-tested and found: the core yes, the VFS adequately
(Notion ships `opfs-sahpool`). This asks whether the *integration* is battle-tested, and the answer
is no — not "it has bugs", but "nobody has walked it". The engine is proven, the seam to RxDB is
green-field, and the spike should be budgeted as integration work on an unproven path rather than as
wiring up a supported adapter.

It also settles the wa-sqlite-versus-official question in the one direction still open. §12 already
preferred the SQLite team's build on stewardship; the null result removes the last argument for
wa-sqlite, which was tacit compatibility with rxdb's documented adapter. There is no such
compatibility and no installed base to inherit, so there is no cost to writing the ~25-line adapter
over `oo1.DB` instead.

*Honest caveat on the negative:* Discord search is not exhaustive — people may write "wasm sqlite" or
"sqlite in the browser" rather than the package name, and the search was scoped to one server. The
null result alone would prove little; it carries weight only because it agrees with the three
code-level findings above.

One more thing the sweep turned up, now doubly relevant given §13: the installed
`getRxStorageSharedWorker` (`rxdb-premium/dist/esm/plugins/storage-worker/non-worker-shared.js`) is
**810 bytes** — one `addEventListener("message", …)` and one `onerror`, with no `terminate`, no
reconnect and no retry anywhere in it. RxDB does nothing when the worker on the other end dies. §13
moves us off that plugin onto `storage-remote` for routing, but the property is the same either way:
the liveness, leader-failover and respawn protocol monorepo#891 asks for is not something we inherit
from RxDB. It is entirely ours to write, and it is now on the critical path rather than beside it.

## 15. What 1.8.x Electron actually did, and what it predicts for a shared web worker (2026-09-17)

Paul asked to re-read the 1.8.x Electron code on the theory that its workarounds came from putting
queries over IPC, and that today he'd consider putting the database in the global space instead.
**The symptom he remembers is exactly right; the topology is the inverse of what he remembers, and
the inversion is the useful part.**

**In 1.8.x the database lived in the RENDERER.** `packages/database/src/adapters/default/index.electron.ts`
at `v1.8.11` builds `getRxStorageSQLite({ sqliteBasics: { … } })` renderer-side, where every method is
an `ipcRenderer.invoke('sqlite', …)`. The main process held no RxDB at all — the Electron repo's
`package.json` at `b9d11c08` (the submodule pin at `v1.8.5`) lists `better-sqlite3` and no `rxdb`.
So RxDB, the query planner and the mango→SQL translation all ran in the renderer, the main process
was a dumb SQL executor, and **what crossed IPC was one prepared statement plus its params, per
statement**. That is literally "queries over IPC", and it is the *most* chatty arrangement possible.

Today is the exact inverse: `getRxStorageIpcRenderer` in the renderer, `exposeRxStorageRemote` in
main, **one message per RxStorage operation** (`bulkWrite`, `query`, `count`). The flip *reduced*
boundary traffic while moving more work across it.

**"Database in the global space" was already tried — and shelved, then vindicated.** On 2025-02-23
`1cde2f39ad` created `index.electron.ts.bak` and `proxy.ts` — a recursive `Proxy` shipping
`{ methodPath, args }` over an `rxStorage` channel — with the matching main-process half in the
Electron repo (`34ac1c3`). That is today's topology, prototyped and abandoned the same day, in favour
of the `sqliteBasics`-over-IPC arrangement that shipped through all of 1.8.x. No commit says why, but
the code shape shows it: a property-path proxy over `invoke` returns plain JSON, so it cannot hand
back a live storage instance and has nowhere to put `changeStream()`'s observable. The same topology
succeeded in 2026-04 the moment it was built on **RxDB's own** `exposeRxStorageRemote` rather than a
hand-rolled bridge. **The lesson in the history is not "don't proxy storage" — it is "don't hand-roll
the proxy."** (`proxy.ts` is still dead code on `origin/main`; delete it before it misleads someone.)

### The workarounds, and which are boundary taxes

| 1.8.x workaround | Commit | Why | Recurs across any boundary? |
|---|---|---|---|
| `invokeWithTimeout` — 30 s `Promise.race`, plus error code `DB01002 QUERY_TIMEOUT` | `3b3f4f8892` 2025-12-08 | "when the app is backgrounded, IPC can become slow or stalled, and we don't want the renderer to wait forever" | **Yes — the archetype.** See below. |
| Errors rethrown as plain `{ message, stack }` objects | `7c0cd6fb82` 2025-02-23 | "rethrown as plain objects so that they can cross the IPC boundary (i.e. be serializable)" | **Yes.** `postMessage` mangles `Error` exactly as `invoke` does. |
| Empty-response guards (`if (!result) throw …`) | `7c0cd6fb82` | an `invoke` that resolved with nothing; renderer could not tell "no rows" from "no answer" | **Yes** — request/response correlation. |
| `waitForIpcRenderer` — untimed 50 ms poll for the bridge | `7c0cd6fb82` | storage module evaluated before `contextBridge` exposed it | **Yes** — startup race. |
| base64 attachment codec; `wcpos-image://` protocol | `f20ae97`, `9e1b076` 2026-04 | "Avoids Blob serialization issues across Electron's contextBridge" | **No** — structured clone handles Blobs. Electron-specific. |
| `fakeVersion: '17.0.0'`, then `disableVersionCheck()` | `52e1d47`, `c3fe6cc` 2026-04-06 | RxDB `RM1` refuses any version difference across the bridge | **Yes, and worse in a SharedWorker** — it outlives the tab that spawned it, so an old tab and a freshly-loaded tab must agree on a version the worker already picked. |
| `convertBooleansToNumbers`, `journalMode: 'WAL2'`, native `withDatabaseRetry` | various | SQLite semantics | **No** — engine class. The *native* adapter, with no boundary at all, carries its own retry loop; that is what non-boundary noise looks like. |

**The timeout is the finding.** 1.8.x had a 30 s deadline on every storage call. The 2026-04 flip
**deleted it and never replaced it — Electron has no storage timeout today.** Web then rebuilt the
same guard from scratch in August 2026 after a production incident: `9cc71d4a60` (#1040) records
"rxdb's `requestRemote` has no timeout, so every RPC stays pending forever. Measured live 45s after a
bare `worker.terminate()`: no banner, checkout and save still enabled — **the cashier keeps selling
into a dead database**." That is the same workaround, invented twice, on two different boundaries,
because nobody carried the lesson across. A third boundary will need it a third time, and it should
be written into the spike as a requirement rather than discovered again — **and the timeout alone is
not the requirement.** A `Promise.race` deadline only rejects the caller; it cancels nothing on the
far side, so a `bulkWrite` that timed out because the boundary was slow or backgrounded can still
commit after the UI has shown `DB01002` and retried or moved on, and the sale is applied twice or
its outcome is unknowable. The requirement is the deadline **plus** either cancellation/fencing of
the in-flight request or stable operation ids with late-result reconciliation (idempotent writes),
so a late answer is recognised rather than re-applied.

Also boundary-inherent and still live: `RxDocument.get(path)` returns a **Proxy** for object-valued
paths, and a Proxy is not cloneable **anywhere**. The rule — *never pass RxDB documents across a
boundary, pass `doc.toJSON()`* — is already enforced for the web worker (`write-intents.ts`) and is
the same rule desktop needs (`wcpos/electron#322`).

### Two facts that change the 2.0 plan

1. **SharedWorker was already evaluated and rejected, on 2026-08-07, for a reason §11 and §12 both
   missed.** Verified in the body of `d901949b19` (the #1057 commit, an ancestor of both `origin/main`
   and `origin/next`): *"Why leader election + multiInstance, not SharedWorker: SharedWorker is
   unsupported on Chrome/WebView for Android (a primary POS platform), so it would leave Android
   tablet users with no storage. navigator.locks + RxDB leadership work everywhere the web POS
   runs."* Combined with §13's spec finding that `createSyncAccessHandle()` is
   `[Exposed=DedicatedWorker]`, there are now **two independent reasons** the SharedWorker shape in
   §11 is wrong. The shape that survives both is the one already shipped: `navigator.locks` leader
   election, the connection in the leader tab's **dedicated** worker, followers routed to it.
2. **Electron is not evidence that one storage serves N clients well — it is evidence that it serves
   one client well.** `multiInstance: false`, one `BrowserWindow`, and main's `send()` does
   `openRenderers.forEach((sender) => sender.send(channelId, payload))` — a **broadcast, not a
   per-requester answer**, which is precisely the property N clients would need. The second-renderer
   attempt was abandoned (`f48bd6d5f8`, 2026-09-04). There is no respawn, reconnect or
   stale-bridge-after-reload handling anywhere in either repo; a renderer reload does not destroy
   `webContents`, so the stale sender stays in `openRenderers` while the renderer-side client starts a
   fresh request-id space. If the web plan borrows Electron's topology, it must not borrow the
   assumption underneath it, stated verbatim in `storage-lock.ts`: *"Cross-process exclusion is not
   needed — the storage bridge is the one holder of these files."*

Nobody ever measured what crossing IPC costs — no latency figure, payload budget or batching note
exists in either repo's history. The instrument already exists and is wired only on native:
`packages/database/src/plugins/storage-timing-probe.ts` (`STORAGE_SLOW_CALL_MS = 16 // One 60 Hz
frame`), recording calls/totalMs/maxMs/rows per `layer:collection:method`. Enabling it on web and
Electron is a one-line adapter change and should precede, not follow, the spike.

**Unverified / correction to note:** #891's three constraints (a hung-but-alive worker cannot be
killed and retains its exclusive OPFS handles; no dead-vs-hung signal; the worker channel is
app-global) are the strongest argument on record against any single shared worker, and they were read
from the issue, not re-derived here. Separately, the standing `multiInstance` ruling **is** enforced
on `origin/main` — `apps/main/lib/create-app-engine.ts:559`, `multiInstance: isWeb ? webLocksAvailable
: (options.multiInstance ?? false)` — but the artefacts the ruling is usually cited through are not:
`packages/database/src/adapters/default/README.md` on `origin/main` contains only three short platform
paragraphs and **has no Decision section**, and there is no `multi-instance-ruling.test.ts` on that
branch. The repo's own `CLAUDE.md` tells agents to read that Decision section before touching the
flag. The ruling is live in code; the pointer and the pinning test are not. Worth fixing
independently of this research.

## 16. Query language and search, if web storage becomes SQLite (2026-09-17)

Two questions from Paul: what does this do to the query language we have, and does it get FlexSearch
off the renderer thread. Short answers: **the translatable operator set is eleven operators wide and
two of our hot paths fall outside it, with a worse penalty than "slower"**; and **no, a storage swap
does not move any search index — only adopting FTS5 would, and that is separate, unproposed work.**

### How queries reach storage today

WCPOS does not hand UI selectors to RxDB. `compileQuery()`
(`packages/core/src/query/query-state-translator.ts`) splits every grid query into a **prefilter**
(the Mango selector that actually reaches storage), an in-JS **residual** matcher, and a
`sortPushable` flag; `executeAdapterQuery()` (`packages/query/src/engine-adapter/execute-query.ts`)
then picks `findByIds` / pushed `find+count` / unpushed `find`. Documents are stored as
`{uuid, remoteId, <promoted columns>, payload, sync, local}` with `payload` the raw Woo record, so
most selectors are dotted `payload.*` paths. The legacy Woo schemas under
`packages/database/src/collections/schemas/` are **types only** — do not size a migration against
their `indexes` arrays.

### What translates, and what the fallback actually costs

The premium translator (`sqlite-query.js`, 1,900 bytes) handles `$or $and $eq $ne $gt $gte $lt $lte
$exists $in $nin`, plus implicit equality, nested-object recursion and `null → IS NULL`. Everything
else throws `isNonImplementedOperatorError`.

**The fallback is not "the same query, matched in JS".** Verified in
`sqlite-helpers.js`: on that error the catch block does `m=[], l = p + " " + u + " LIMIT " + r`. The
params array is emptied and the query is rebuilt from prefix + ORDER BY + LIMIT — **the WHERE clause
is discarded entirely.** `sqlite-storage-instance.js` then pages the *whole table* in
`NON_IMPLEMENTED_OPERATOR_QUERY_BATCH_SIZE = 50` round trips, `JSON.parse`-ing every row and applying
`getQueryMatcher` until `skip+limit` matches accumulate. `count()` is worse again: it calls `query()`
and returns `{count: documents.length, mode: 'slow'}`.

So one unsupported operator anywhere in a selector demotes that query from an indexed seek to a full
table scan marshalled through JS, 50 rows at a time.

**Two production paths land there:**

| Path | Selector | Consequence |
|---|---|---|
| **Logs search** — `buildScanSearchSelector` (`packages/sync-core/src/scanSearchSelector.ts`), the only production `$regex` producer | 5 `$regex` arms per term (1 folded + 4 raw `$options:'i'`) | On the measured 46k-row logs day: ~920 round trips and 46k `JSON.parse`s, against a today-measured 40–66 ms in-storage scan (`logs-volume.bench.test.ts`) |
| **Orders cashier/store pills** — `compileReadFilter`'s `metadata`/`store` operators | `{'payload.meta_data': {$elemMatch: {key:'_pos_user', value}}}` | The POS's **default orders view**. The engine already sets `allowSlowCount: true` here because "adapter counts run payload selectors (for example meta_data `$elemMatch`) with no index" |

Also unsupported and in use: `$not` (8), `$allMatch` (7, the variations attribute filter — already a
pure JS residual with no prefilter), `$all`, `$size`, `$mod`, and `$nor` (only `$or`/`$and` are in the
translator's root list).

**Open question to settle first:** the discarded-WHERE rebuild keeps the `INDEXED BY "<indexId>"`
prefix, and SQLite errors if a named index cannot be used. Whether a WHERE-less scan with a matching
ORDER BY counts as "used" decides whether logs search is *slow* or *throws*. Test that before
anything else.

### Semantics that change even where the operator translates

- **`$exists` on an explicit `null`.** Rendered as `JSON_EXTRACT(…) != '<random token>'` for true and
  `IS NULL` for false, so a field present with JSON `null` reads as *absent* in SQL and *present* to
  mingo. The logs kind filter is built from `{'actor.id': {$exists: …}}`, `{'actor.name': …}`,
  `{actor: {$exists: true}}`.
- **`$nin` is asymmetric with `$in`.** `$in` on a schema-declared `type:'array'` field emits
  `EXISTS (SELECT 1 FROM json_each(…))`; `$nin` gets a plain `NOT IN`, and `NULL NOT IN (…)` is NULL,
  so missing fields never match. `$ne` explicitly ORs in `IS NULL`; `$nin` does not.
- **Sorting.** `ORDER BY JSON_EXTRACT(…)` uses SQLite type ordering (NULL < numeric < TEXT < BLOB) and
  BINARY collation. `stockQuantity: {type:['number','null']}` is a *pushable* sort field, so its
  NULL placement is exactly where JS and SQLite may disagree. The #2086 test pinning "storage order
  for a pushable string sort (code-unit, not collated)" is the regression gate for this.
- **A trap to keep avoiding:** `mangoQuerySelectorToSQL` recurses into a nested plain object passing
  only the child key, so `{actor: {id: 5}}` would emit `JSON_EXTRACT(data,'$.id')` — the parent
  segment is lost. WCPOS always writes dotted strings. Keep it that way.
- **`boolParamsToInt` is load-bearing.** `featured`/`onSale` filters work only because bind params are
  converted to 1/0. The bundled wasm basics does this; **any adapter we hand-roll must too, or those
  filters fail silently.**

### Indexes: the good news, and the gap

RxDB's filled schema becomes real SQLite expression indexes —
`CREATE INDEX … ON tbl(JSON_EXTRACT(data,'$.field'), …)` — using the same `getJsonExtract` text the
queries use, so declared `indexes` keep working and index identity lines up. **But only `products`
(`stockStatus`, `price`, `[type,stockStatus]`) and `orders` (`dateCreatedGmt`,
`[status,dateCreatedGmt]`) declare any.** `variations`, `customers`, `taxRates`, `categories`,
`brands`, `tags` and `coupons` declare none — and **`remoteId`, which every sync-engine reconciliation
query filters on with `$in`, is indexed nowhere**. Those `$in` lists are not batched by the selector
translator (only `findDocumentsById` batches, at `SQLITE_VARIABLES_LIMIT = 32000`), so each becomes a
full-table scan with one bind param per id — and past that same ceiling the statement does not scan
slowly, it fails outright with `too many SQL variables` (the #8438 class recorded in §14), before any
index could be used. An index on `remoteId` fixes the scan, not the ceiling: the migration and the
spike also batch reconciliation `$in` lists below it. Declaring indexes is cheap and should precede
the spike (see §18's correction on what "cheap" means when shipped).

Four of the five default grid sorts are **not** pushable today (`pos-products`/`products` →
`payload.name`, `customers` → `payload.last_name`, `coupons` → `payload.date_created_gmt`, `pos-cart`
→ `remoteId`); only `orders` (`dateCreatedGmt`) is pushed and indexed. An unpushable sort runs
`find({selector: prefilter})` with no sort, no limit, and sorts the whole set in JS with an
`Intl.Collator`. **SQLite does not change that shape — it only changes what a full read costs.**

### Search: a storage swap does not move any index

The search structures live in the app's JS realm on **all three platforms** — renderer on web and
Electron, the RN UI JS thread on native — because `addFulltextSearch()` attaches to the
`RxCollection`, which is constructed there. #2091 already records this: *"Out of scope: search. The
catalogue search structure moves above the storage regardless (#2073 blob), so it does not enter this
decision."*

Search also no longer emits selectors. Since **#2092** (merged to `main` 2026-09-16, `eb2fc62b35`),
`products`/`variations` carry `options: {searchIndex: false}` and are answered by a folded-text blob
with `indexOf` — **+2 MB and 0.8 ms build at 20k products, replacing 143 MiB and ~8 s**. All non-logs
lanes end at `hitIds` → `findByIds`, which under SQLite hits `id TEXT PRIMARY KEY` and batches at
32,000 — safe and fast. #2026's body is now stale: it still argues from `tokenize: 'full'`, which
products and variations no longer reach.

**FTS5 would move an index, and it is platform-asymmetric.** The official `@sqlite.org/sqlite-wasm`
build ships `-DSQLITE_ENABLE_FTS5` (`ext/wasm/GNUmakefile:439`); **wa-sqlite's default build does
not**, which is why issue #258's reporter compiled a custom one — and #258 and #320, the two
wa-sqlite corruption reports, are both FTS5-with-triggers. FTS5's `trigram` tokenizer gives the
substring matching `tokenize:'full'` exists for — **for terms of three characters or more.** A one-
or two-character term generates no trigram and a `MATCH` returns nothing, where today's fold-blob
`indexOf` matches it; so retiring the blob needs either a three-character UI minimum or a
`LIKE`/`GLOB` fallback (a scan) for short terms, and the spike measures that fallback rather than
assuming it away. On **Electron** storage runs in the main process, so
an FTS5 index there is a genuinely different heap — the #2026 fix. On **web** it is not: per #2026's
own comment 2, *"a browser worker does not create a distinct OS process and gets no exemption from
tab or browser-wide memory pressure"*, so FTS5 in the storage worker would not obviously stop the
Windows renderer OOMs. RxDB's Mango cannot express `MATCH` either; the seam is the documented
`queryModifier` hook, and the wiring is ours. Nothing in the codebase mentions FTS5 today (**zero
hits** for `fts5`/`trigram`/`tokenize=` on both lanes).

**The dominant number in the heap evidence is a measurement artifact, and that changes the reading of
#2026.** The 72.56 MiB coupons index (2,527 rows at 29.4 KiB/row) is 72.4 of the 73.2 MiB of
FlexSearch heap at soak minute 10 — but it reflects the **dev store's inverted data shape**, not a
merchant's. Owner ruling, 2026-09-17: *a representative merchant has roughly 2,000 products and 200
coupons; we happen to have the opposite.* That is why **#2082 is parked deliberately — it treats a
symptom of our own fixture, not a user-facing defect** — and the parking is correct.

Follow that through and the picture inverts. For a representative merchant the dominant index was
never coupons; it was **products**, extrapolated at 143 MiB for a 20k catalogue — and **#2092 deleted
exactly that index**, replacing it with a 2 MB blob. So the most likely reading is that **#2092 is the
fix for the `WOOCOMMERCE-POS-W8` renderer OOMs** (50 events, all Windows, all production), and the
coupon index was a red herring introduced by soaking against the dev store. Corollary: any future
search-heap measurement taken on the dev store should be treated as unrepresentative unless the
collection mix is stated alongside it.

### W8 measured (Sentry API, 2026-09-17)

Queried directly rather than inferred. Issue `WOOCOMMERCE-POS-W8` = group `5324755063`,
`wcpos/woocommerce-pos`, "OutOfMemoryError: Renderer reached heap limit", status **unresolved /
ongoing**, `firstSeen` **2024-04-11**, 200 events lifetime, `environment: production` on every one,
Windows on every one across **five distinct OS builds** (10.0.26200, 10.0.22631, 10.0.22621,
10.0.19042, 10.0.18363).

**Release breakdown of the 52 release-tagged events — this is the finding:**

| Release | Events | Last seen | Contains #2092? |
|---|---:|---|---|
| WCPOS@1.9.9 | **42** | 2026-09-06 | no |
| WCPOS@1.9.6 | 5 | 2026-09-05 | no |
| WCPOS@1.10.3 | 2 | 2026-08-27 | no |
| WooCommerce-POS@1.8.2 | 1 | 2026-08-03 | no |
| WCPOS@1.10.15 | 1 | 2026-09-14 | no |
| WCPOS@1.10.17 | 1 | 2026-09-16 16:30 UTC | no |

**No W8 event has ever been recorded from a build containing #2092.** `2b19c423c2` landed
2026-09-16 05:39 UTC and first shipped in **v1.10.19, published 2026-09-16 07:27 UTC**
(`git tag --contains` → v1.10.19, v1.10.20, v1.10.21; latest release v1.10.21, 2026-09-16 23:21 UTC).
Every W8 event predates that build.

**But that is not yet evidence of a fix, and the honest reading cuts the other way.** Three things:

1. **W8 was never evidence about current code.** 47 of 52 tagged events (90%) are on **1.9.x**, and
   that cluster ends 2026-09-06. The crash rate collapsed when users moved off 1.9.9 — ten days
   before the blob existed.
2. **The post-1.9.x baseline is ~1 event per 5–8 days** (two events in the ten days before the fix
   shipped). Against that rate, the ~33 hours v1.10.19+ has been in the wild buys essentially no
   statistical confidence. Re-query by release after two to three weeks of adoption.
3. **`userCount: 1` is an attribution artifact, not a fact about scope.** 50 of the 52 events carry
   no user id; only two are attributed. Five distinct Windows builds say multiple machines. Do not
   repeat "one user" — and equally, do not repeat #2026's "50 events, production" as if it described
   the shipped app, because it describes 1.9.x.

**Consequence for this decision:** the search-*heap* argument for SQLite is weaker than §16 first
implied, from both ends — the dominant measurement was a dev-fixture artifact and the production
crash evidence is a legacy-release tail that was already fading before the blob shipped. Re-check W8
by release in early October; if v1.10.19+ is still clean after real adoption, close #2026 as
overtaken rather than building for it.

### But search is still a legitimate tiebreaker, and the reason is not heap (owner challenge, 2026-09-17)

An earlier draft of this section said search should carry *no* weight. That was wrong, and the
correction matters. Two different mechanisms get conflated under "move search to the storage", and
only one of them needs SQLite.

**Mechanism A — relocate the JS index to where storage runs. Does not need SQLite.** The installed
premium package already exposes it: `getRxStorageOPFS({usesRxDatabaseInWorker: true})`
(`storage-opfs/index.js`, which simply sets `inWorker: !usesRxDatabaseInWorker` on the abstract
filesystem). It is not a free flag — hosting the RxDatabase in the worker and proxying collections to
the UI is ours to build, and #2026 comment 2 warns that premium `find()` returns RxDocuments rather
than ids, so an ids-only RPC moves the boundary rather than sitting behind it. But it is **engine
independent**: we could do it on OPFS today. It is therefore not an argument for SQLite.

**Mechanism B — FTS5, where the index is never materialised in JS at all. SQLite only, and this is
the real argument.** Every search structure WCPOS has must currently be *built in the app realm by
reading every document out of storage*: `catalogue-search-blob.ts:160` is literally
`const documents = await collection.find().exec()`, and FlexSearch rehydrates the same way. That full
read happens on every open, on every till, and scales with catalogue size **whether or not the
renderer is near its heap cap**. An FTS5 index lives in the database file beside the data and is
maintained incrementally by the engine — no full read, no rebuild, no export history, no
change-event buffer to bound. That property is permanent and is untouched by the W8 finding, which
only retires the *crash* argument, not the *architecture* one.

The prize is also a deletion, not just a feature: FTS5 would retire `search.ts`, the folded-text
blob, the premium FlexSearch pipeline, the export-history bound (#2070), the append-history bound
(#2020), the rebuild/recovery path and the whole #2073 sizing question — a subsystem this repo has
patched at least four separate times.

**Honest weighting.** Search should not *drive* the engine choice, and it cannot rescue SQLite if
durability goes against it. But if durability puts SQLite ahead, FTS5 is a substantial bonus; and if
durability is close, it is a fair tiebreaker. Three caveats to carry into the spike: FTS5 **with
triggers** is the exact workload behind both wa-sqlite corruption reports (#258, #320), so it belongs
in the crash harness rather than being assumed safe; on **web** the heap benefit is limited because a
worker is not a separate OS process (#2026 comment 2), so the win there is the avoided full read, not
the avoided heap; and on **Electron**, where storage is in the main process, it is both. Trigram
indexes are not small either — but they are on disk, not in the renderer.

## 17. Is there actually a choice left, and does a spike earn its keep? (owner challenge, 2026-09-17)

Paul: *"you've already ruled out staying with the current filesystem storage, right? So what choice is
there realistically. It's only sqlite, right?"* Half right, and the half that is wrong is my omission.

**What is genuinely ruled out.** The incumbent — rxdb-premium abstract-filesystem over OPFS — as a
*target state*. §1's five missing primitives, §2's 2,225 lines of WCPOS patching, and RxDB's own
maintainer reproducing `changes.json` corruption after 629 of 963 writes on plain
`getRxStorageFilesystemNode()` settle that. Nothing found since has argued the other way.

**What is not ruled out: there are two web candidates, not one.** I have spent §11–§16 on SQLite and
barely mentioned the other, which is a bias worth naming rather than quietly fixing.

| | SQLite over wasm + `opfs-sahpool` | **Premium IndexedDB** (`rxdb-premium/plugins/storage-indexeddb`) |
|---|---|---|
| Installed today | no (adapter must be written — §12) | **yes**, already in `node_modules` |
| RxDB's own recommendation | Electron / React Native | **"In the Browser… the IndexedDB RxStorage if you have 👑 premium access"** (rxdb.info/rx-storage.html, Quick Recommendations) |
| Durability substrate | SQLite's journal/WAL, checksummed frames | delegated to the browser: **LevelDB** (Chromium) / **SQLite** (WebKit) — both have real journaling and checksums, unlike the append-only JSON engine |
| Works in a SharedWorker | **No** — `createSyncAccessHandle()` is `[Exposed=DedicatedWorker]` (§13) | **Yes** — async APIs, no sync access handle needed |
| Multi-tab | leader tab + dedicated worker + routing (§13) | native |
| COOP/COEP | not required | not required |
| Production precedent in RxDB's own community | **none found** (§14 null result) | the fallback an RxDB user retreated to after OPFS corruption (rxdb#7074, §1) |
| Known defect | integration unproven end-to-end | premium-issues #21/#22: SharedWorker + IndexedDB `TransactionInactiveError` |
| Speed | fastest OPFS option | slower on RxDB's published benchmarks |

The asymmetry that matters is **multi-instance, not the SharedWorker.** §15 records that SharedWorker
is unavailable on Chrome/WebView for Android, a primary POS platform, so §11's original topology is
not legal for IndexedDB either: its async API would let one connection live in a SharedWorker where
one exists, but that is not platform support. What IndexedDB does have is native per-tab
multi-instance — every tab opens its own connection and the browser serialises them, so RxDB's
`multiInstance: true` works with no leader election, follower routing or failover. Choosing SQLite
means building all three (§13); choosing IndexedDB does not. That is a large hidden cost on the
SQLite side that no durability comparison surfaces.

**Does a spike earn its keep?** Not as a bake-off — Paul's instinct is right about that, and #2091's
framing as a three-way comparison is the wrong shape for web. But three questions remain that cannot
be answered by reading, and two of them can fail:

1. **Feasibility (can fail).** Nobody has ever run rxdb + wasm SQLite + OPFS in production (§14), and
   the documented adapter calls methods that do not exist (§12). This is a yes/no, not a measurement.
2. **The crash harness (can fail).** §1's entire thesis is that the incumbent fails simulated crash
   tests. Swapping to an engine we have only *read* about, without running the same harness, would
   repeat the mistake that got us here — and §1's own finding that Chrome's OPFS `flush()` is
   `F_BARRIERFSYNC` on macOS (and WebKit's undocumented flush on iOS) means SQLite-on-OPFS is not
   automatically safe either.
3. **Query regressions (already concrete, §16).** The non-implemented-operator fallback *discards the
   WHERE clause*, and it lands on the POS's default orders view (`$elemMatch`) and logs search
   (`$regex`). The `INDEXED BY`-without-WHERE question decides whether logs search is slow or throws.

**Recommended shape:** drop the comparison, keep the de-risking. One feasibility build on the SQLite
path with the crash harness attached and §16's two query paths exercised — **with premium IndexedDB
run against the same harness as the control**. IndexedDB costs almost nothing to include (no adapter,
already installed) and it is the answer if SQLite's integration risk bites. Native is the one place a
real comparison still applies, because `expo-sqlite` is a supported adapter and §5 records RxDB's own
numbers showing SQLite as a latency downgrade against filesystem — that tradeoff is measurable and
could genuinely go either way.

## 18. Two open questions answered locally, and a correction (2026-09-17)

Measured with native `sqlite3` 3.50.4 on an M-series Mac, not read from docs.

### `INDEXED BY` with no WHERE does NOT throw — §16's open question is closed

§16 flagged that the non-implemented-operator fallback discards the WHERE clause but **keeps** the
`INDEXED BY "<indexId>"` prefix, and that SQLite errors when a named index cannot be used — leaving it
unknown whether logs search would be slow or would break. Replicating rxdb-premium's exact table and
index shape:

```sql
CREATE TABLE "t"(id TEXT NOT NULL PRIMARY KEY UNIQUE, revision TEXT,
  deleted BOOLEAN NOT NULL CHECK (deleted IN (0,1)), lastWriteTime INTEGER NOT NULL, data json);
CREATE INDEX "idx" ON "t"(deleted, JSON_EXTRACT(data,'$.foo'), id);
SELECT data FROM "t" INDEXED BY "idx" ORDER BY JSON_EXTRACT(data,'$.foo') LIMIT 50 OFFSET 0;
```

**It runs.** A full index scan counts as "using" the index, so the constraint is satisfied. Plan:

```
|--SCAN t USING INDEX idx
`--USE TEMP B-TREE FOR ORDER BY
```

The temp b-tree appears because the index's leading column (`deleted`) is unconstrained once the
WHERE is gone, so the index cannot supply ordering. Ordering by an expression **not** in the index
behaves identically. **Logs search degrades; it does not break.**

**And the retained hint is not the problem.** At 46,000 rows of ~500 B JSON, page at OFFSET 45,000:
**4 ms with the hint, 4 ms without it** — the hint costs nothing measurable. The same page as a
*pushed* query (`WHERE deleted=0 AND JSON_EXTRACT(...)>?`) is **0.02 ms**. So the fallback's cost is
the **discarded WHERE — roughly 200x** — and the fix is §16's documented `queryModifier` hook
rewriting `$regex` into `LIKE`/`GLOB` so the predicate stays in SQL, not anything to do with the
index hint.

**Caveat that matters more than the numbers:** this is *native* SQLite with a warm page cache. The
shipped path is wasm + a **JavaScript** VFS over OPFS, where every page read is a JS call into an
access handle. **Treat 4 ms as a floor, not an estimate.** The multiplier over a JS VFS is precisely
what the benchmark ticket exists to find.

### Correction: declaring the missing indexes is NOT cheap on its own

§16 and the handoff both called "declare the missing indexes" a cheap task. That is wrong when shipped
standalone. RxDB hashes the **whole** JSON schema —
`hashFunction(JSON.stringify(this.jsonSchema))` (`rx-schema.js`) — and `indexes` is part of it. On
open, `rx-database.js:324` compares `docInDb.data.schemaHash` with the collection's hash and throws
**DB6** when they differ: *"another instance created this collection with a different schema… you must
increment [the version]"*. A version bump means a schema migration of every user's local collection.

So the task splits:

- **In the benchmark harness — free.** Throwaway schemas, no installed base.
- **Shipped on its own — a migration event** across nine collections (the seven that declare no
  indexes, plus `products` and `orders`, which gain `remoteId`), for no user-visible benefit.
- **Shipped with the engine change — free**, because swapping storage is already a cold-resync event
  (cf. #672, "delete the dead storage migration — cold-resync boots clean").

**Therefore: declare the indexes inside the engine migration, never before it.** The only place they
are needed earlier is the benchmark harness, where they cost nothing.

### Windows is not required to decide (the speed decision; crash coverage is separate)

Chrome's Apple-only flush cost (§4: `F_BARRIERFSYNC` today, `F_FULLFSYNC` before Chromium changed it;
which one rhashimoto's figures were taken under is not recorded, so re-measure before leaning on
them) is a Chrome-on-Apple behaviour, not a Mac behaviour: rhashimoto measured **24.3 tx/s in
Chrome vs 434 in Firefox vs 818 in Safari on the same Mac mini**. So running the harness in all three
browsers on a Mac **brackets** the answer — Chrome-on-Mac is the pessimistic bound for SQLite writes,
Firefox and Safari the optimistic one. If the winner is the same at both ends, no Windows machine is
needed. Escalate to a GitHub Actions `windows-latest` job (Chrome preinstalled, driven headless by
Playwright; the repo has 29 ubuntu jobs and 1 macos-15 but no Windows runner yet) only if the bracket
straddles the decision. *Caveat from the 2026-09-18 review:* the bracket is an assumption, not a
measurement — nothing bounds Chromium on NTFS with `FlushFileBuffers()` from Firefox or Safari on a
Mac, and Windows Chrome/Edge is where most tills run — so both Mac endpoints could agree while a
Windows run picked the other engine. The `windows-latest` job costs nothing; running the same harness
there once to check the bracket, rather than trusting it, is the cheap sound version of this rule.
The ruling above (Windows not required to decide) is the owner's and stands until he changes it. Note
also that the POS-critical gaps in birchill's data — startup 46 ms vs
535 ms, single write 0.17 ms vs 3.17 ms — are **not fsync-bound**, so Chrome's Apple flush cost
cannot explain them away in either direction.

**Scope of this ruling: the speed decision only.** Crash survival cannot be bracketed from a Mac.
Windows has a different filesystem and flush path (`FlushFileBuffers()`, §4), and §2 places almost
all of WCPOS's measured storage failures and the NUL-filled-range incidents there. The crash harness
(wayfinder [monorepo#2144](https://github.com/wcpos/monorepo/issues/2144)) therefore keeps a Windows
leg on the `windows-latest` runner above, whatever the speed bracket says.

## §19 — Feasibility build result (2026-09-17, late; wayfinder ticket #2138)

The rxdb + official sqlite-wasm + opfs-sahpool path that §12–§14 called green-field **works**. rxdb-premium
`getRxStorageSQLite` over a 32-line `SQLiteBasics` adapter on `oo1.DB` (`@sqlite.org/sqlite-wasm` 3.53.4-build1,
SQLite 3.53.4 with FTS5) passed rxdb 17.4.0's own storage conformance suite: the whole unit suite in Node
(1416 passing, WAL effective on all 1505 opens) and 65/65 of `init` + `rx-storage-implementations` in Chrome 154
inside a dedicated worker on the pool VFS. Evidence and reproduction: monorepo PR #2155,
`spikes/2138-rxdb-sqlite-wasm/RESULTS.md`.

**Scope of "works": one page, one dedicated worker, the conformance suite.** The production web
topology §15 requires — a `navigator.locks` leader, follower request routing, leader-close and reload
failover, and Android, where SharedWorker does not exist — is not exercised by this build and is not
proven by it. That is wayfinder [monorepo#2146](https://github.com/wcpos/monorepo/issues/2146)
("Topology: where does the single connection live, and who routes to it?"), still open; the web
feasibility gate is not closed until it is demonstrated, on Android as well as desktop Chrome.

Findings that feed §11/§13/§15 (topology and boundary taxes):

- **Silent hang class, measured.** A top-level `await` in the worker before `exposeWorkerRxStorage` loses the
  page's first request; `createStorageInstance` never resolves and nothing is reported — premium's page-side
  `getRxStorageWorker` pushes Worker `error` events into an array it never reads. Expose synchronously and await
  the wasm init lazily in `open()`. This is #891 in miniature and must be designed for in the leader-tab worker.
- **One worker per page is forced, not chosen.** Premium's default `mode: 'storage'` spawns a new worker after the
  last instance closes and never terminates the old one; the old pool VFS keeps its OPFS access handles and the
  new `installOpfsSAHPoolVfs` fails with `NoModificationAllowedError`. `mode: 'one'` is mandatory.
- **WAL on the pool VFS is real** (answers `wal`) provided `PRAGMA locking_mode = exclusive` is issued first;
  without it the pragma silently answers `delete`. This resolves the "WAL unproven on sahpool" line of §13.
- `storeAttachmentsAsBase64String: true` is required (no `Buffer` in a worker).
- rxdb's `now()` is per realm and runs ahead of wall-clock under load (+50 ms after 5,000 calls); premium's SQLite
  cleanup compares `lastWriteTime` with the worker's `Date.now()`. One conformance test trips on it; production
  `minimumDeletedTime` values make it moot, but it is a cross-realm contract gap to remember.

## §20 — The two unsupported-operator paths, measured on the real stack (2026-09-18; wayfinder ticket #2145)

§16 identified the mechanism (the fallback discards the WHERE and pages the table 50 rows at a time) and §18
measured its page natively at 4 ms. Measured now on the stack §19 proved works — premium SQLite, official
sqlite-wasm 3.53.4, `opfs-sahpool`, dedicated Chrome 154 worker — at 46k logs rows and 20k orders, with the
selectors the screens actually issue (Logs: five `$regex` arms per regex-escaped term; Orders: the default scope
of cashier **and** store, one `$elemMatch` each), the grids' real cumulative windows (20/60/100 and 10/50/100) and
`count()` normalized as RxQuery does it (primary-key order). Monorepo `spikes/2145-query-paths/RESULTS.md`.

Both screens render only when `find` **and** `count` have answered, and one worker serves both, so the
user-visible figure of a selector change (keystroke, pill) is their sum; a scroll only extends the limit and re-runs the find:

| Screen action | As shipped | With `queryModifier` | Patched (one statement) |
|---|---:|---:|---:|
| Logs: keystroke, first window of 20 | **115 s** | 7.5 s | 0.38 s |
| Logs: scroll to 100 rows (find only — the cached count is reused) | **32.9 s** | 16 ms | 11 ms |
| Orders: pill change, first window of 10 | **29.7 s** | 15.5 s | 0.72 s |
| Orders: scroll to 100 rows (find only — the cached count is reused) | **3.7 s** | 7 ms | 5 ms |

- **A fallback `find` page costs ~330 ms, not 4 ms**: the WHERE-less statement keeps `INDEXED BY` but cannot
  use the index for ordering once `deleted` is unconstrained, so every page temp-b-tree-sorts the whole table,
  and wasm + the JS VFS makes that ~80x dearer than native. A grid window needs `1 / hit-rate` such pages (20
  for the first Logs window at 1 hit in 50). A fallback `count` pages the whole table in primary-key order —
  no sort, but 921 pages × ~117 ms on logs (108 s), 401 × ~73 ms on orders (29 s).
- **`queryModifier` alone fixes neither screen.** Premium calls the modifier on every page of the fallback
  loop, so an injected WHERE makes a grid window one statement up to 50 rows and two up to 100 — milliseconds,
  within 1.5–2.5x of the floor. But `count()` still routes through `query()` and pages with `OFFSET`, so it
  issues `matches/50 + 1` full filtered scans (20 × 375 ms on logs = 7.5 s; 51 × 305 ms on orders = 15.5 s),
  and both screens wait for it. The rewrite itself is sound: `GLOB` for the fold-space arm, `LIKE … ESCAPE`
  for the ASCII-best-effort raw arms, `EXISTS (SELECT 1 FROM json_each(…))` per stamp, the regex literal
  unescaped first — verified against the shipped matcher on a punctuation-bearing term.
- **A ~20-line premium patch is required and is the whole difference**: let the modifier declare the selector
  fully translated, then run `query()` without the loop and `count()` as `SELECT COUNT(1) … WHERE <modified>`.
  That is 0.38 s / 0.72 s screen-visible — 300x / 40x over shipped — and still a full scan, because `LIKE`
  over JSON text and `json_each` over `meta_data` cannot use an index. Getting below it is a schema decision
  for the engine migration: promote `_pos_user` / `_pos_store` to indexed top-level columns at write time so
  the Orders default view becomes a seek and `$elemMatch` leaves the hot path.

Consequence for the decision: none of this changes the engine choice by itself — the same two selectors are
unindexed scans on OPFS today (§16) — but it fixes the size of the query-translation work that must ship with a
SQLite engine (modifier + the small patch + two promoted columns), and it retires "is the modifier enough?" as
an open question: it is not. That scope is the *unsupported-operator* work only. The translated-operator
semantic differences §16 lists — `$exists: true` treating an explicit `null` as absent (the logs kind filter
uses exactly those actor fields), `$nin` excluding missing fields, and pushed sorts ordering nullable fields
differently — translate successfully and therefore never reach the modifier or the patch; they change query
results silently even after the hot paths pass, so the migration work carries parity fixes or checks with
their own tests for each of them.
