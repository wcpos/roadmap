# Investigation report: `orders-browse` → `refunds-browse`

## Scope and evidence

**Observed:** Source inspected at commit `02da0127f70989eec9ba83cadafc7683b3aea5a6`, including the current working-tree files. All paths below are relative to this worktree unless absolute.

- **PASS:** Read `INVESTIGATE.md` and traced requirements, scheduling, HTTP fetching, persistence, query translation, binding, and existing tests.
- **PASS:** No files edited; no builds or tests run.
- **Artifacts:** None created. This report is the deliverable.
- **Unverified:** Runtime behavior and the deployed refund endpoint. The endpoint observations in `INVESTIGATE.md` are accepted as supplied evidence, not independently reproduced.

**Conclusion:** This is a small sibling lane, not a new sync subsystem. Refund storage, materialization, transport, coverage persistence, and reactive coverage observation already exist. The missing pieces are the browse requirement/descriptor/seeder/fetch path and the core query-state registration.

Two qualifications matter:

1. Refund ingestion has parent/provenance rules that an orders-derived fetcher must not bypass.
2. The existing orders per-page progress publisher is disconnected from the production coverage facade. Copying its call sites alone would reproduce that problem.

---

## Touchpoint 1 — Public requirement and engine entrypoint

### Existing orders behavior

- `packages/sync-engine/src/require-plane.ts:155–187` defines common requirement properties and `OrderBrowseDimensions`.
- `packages/sync-engine/src/require-plane.ts:228–244` includes:
  ```ts
  { kind: 'orders-browse'; collection: 'orders' } & OrderBrowseDimensions
  ```
- `packages/sync-engine/src/require-plane.ts:321–327` defines the internal `query` requirement, currently restricted to orders/products/customers.
- `packages/sync-engine/src/create-rxdb-sync-engine.ts:1735–1768` supplies the require plane with the active scope, database, coverage, transport, and pull-batch-size reader.
- `packages/sync-engine/src/create-rxdb-sync-engine.ts:2383–2385` forwards public `engine.require()` calls.

### Minimal refunds change

Add the requested public shape, retaining the common `id`, priority, and refresh properties:

```ts
export type RefundBrowseDimensions = {
  after: number;
  before: number;
  limit?: number | 'all';
  store?: string;
};
```

Add its discriminated union member and allow `'refunds'` in the internal `query` collection union.

The requested public names are **`after`/`before`**, whereas orders currently use **`afterSeconds`/`beforeSeconds`**. Translate explicitly; do not rename the existing orders API.

Export the new dimension type through:

- `packages/sync-engine/src/create-rxdb-sync-engine.ts:161–169`
- `packages/sync-engine/src/index.ts:2–18`

No engine collection or database registration is needed: refunds already exist.

---

## Touchpoint 2 — Canonical lane key and descriptor

### Existing orders behavior

`packages/sync-engine/src/scheduler/order-browser-scheduler-descriptor.ts` owns the complete key contract:

- `:39–45`: numeric limit normalization; default 10, 100-record growth steps above one page.
- `:127–155`: key encoding; ranged `limit=all` omits sort.
- `:186–231`: `orderBrowserQueryKey()` normalizes caller dimensions.
- `:245–329`: parser validates the persisted key and produces the scheduler descriptor.
- `:298–300`: `limit=all` becomes a **10,000-record per-pass budget**, not a total result cap.
- `:362–374`: `ORDER_BROWSE_WINDOW_GRAMMAR` supplies the shared seeder.

An orders ranged key contains status/search and optional scope dimensions, for example:

```text
orders:browser:status=completed:after=…:before=…:search=:limit=all
```

### Minimal refunds sibling

Add `refund-browser-scheduler-descriptor.ts`, containing:

- `refundBrowserQueryKey()`
- `parseRefundBrowserSchedulerDescriptor()`
- A refunds grammar for `seedBrowseWindowLane()`.

Suggested persisted spelling:

```text
refunds:browser[:store=<id>]:after=<seconds>:before=<seconds>:limit=<number|all>
```

“Same lane-key behavior” means **the same canonical identity rules**, not literally sharing the orders key:

- Collection, range, optional store, and normalized limit identify the lane.
- Caller `id` and priority do not.
- No status, search, customer, cashier, register, or caller-selected sort.
- `limit=all` is sort-independent.
- The descriptor reports `complete: true` for fetch-to-completion and a numeric per-pass budget.
- Refund history and parent keys remain distinct.

Reuse existing numeric-limit normalization and the ranged budget rather than introducing new tuning constants.

Because `store` attribution is unresolved for nonnumeric slugs, the minimal supported store contract should be a **numeric store ID represented as a string**. Do not inherit orders’ `created_via` interpretation without server evidence.

---

## Touchpoint 3 — Require-plane dispatch

### Existing orders behavior

`packages/sync-engine/src/require-plane.ts` has four important dispatch points:

| Location | Orders behavior |
|---|---|
| `:1651–1662` | Diagnoses numeric limits exceeding the browse backstop. |
| `:1664–1689` | Derives the canonical key returned on `RequirementHandle.queryKey`. |
| `:1697–1713` | Converts the public browse requirement into an internal `query`. |
| `:941–968` | Parses that query, seeds the durable task, then drains it. |

The existing refunds branch at `:914–938` handles only `refresh` and `refunds-by-parent`.

`runSeedDrain()` at `:860–911` already handles active ownership, deduplication, dropped scope writes, ledger rebuilds, and drain outcomes.

**Important distinction:** `activeSearches` coalescing is search-only (`:522–526`). Orders browse deduplication comes from persisted scheduler task identity, not this search map.

### Minimal refunds change

- Include `refunds-browse` in the numeric-backstop diagnostic.
- Derive its key using `refundBrowserQueryKey()`.
- Convert it to an internal refunds `query`.
- Add a refunds-query branch beside the orders-query branch:
  1. Parse the descriptor.
  2. Seed its browse task.
  3. Use the existing `runSeedDrain()` machinery.
  4. Pass forced-refresh information for that exact browse key.

Leave the refund history/parent branch unchanged. A date-range requirement must not accidentally become the fixed-history refresh.

---

## Touchpoint 4 — Durable seeding and fetch-to-completion scheduling

### Existing orders behavior

- `packages/sync-engine/src/scheduler/rx-order-scheduler-task-seeder.ts:26–31`: orders browse defaults are priority 700 and completed-task dedupe of 30 seconds.
- `:131–160`: validates dimensions and derives the task budget.
- `:163–184`: invokes the shared browse seeder.
- `:171–179`: **`limit=all` uses `mode: 'greedy'`**; ordinary numeric windows use `windowed`.

The shared implementation is:

- `packages/sync-engine/src/scheduler/rx-browse-window-lane-seeder.ts:64–99`

It creates one durable task whose ID is:

```text
<queryKey>:windowed
```

That suffix remains `:windowed` even when its mode is greedy.

The runner at:

- `packages/sync-engine/src/scheduler/rx-scheduler-task-runner.ts:411–452`

repeats greedy tasks until the fetcher reports completion, renewing ownership between invocations. A windowed task completes after one invocation.

### Minimal refunds change

Add `seedRefundBrowseSchedulerTask()` to the existing refund seeder module, using a refunds `BrowseWindowLaneDescriptor` and `seedBrowseWindowLane()`.

Preserve:

- Canonical key-derived task identity.
- `greedy` for `'all'`.
- Numeric task budget for each ranged pass.
- `windowed` for numeric limits.
- Existing completed-dedupe behavior.

Do not replace `seedRefundWindowLane()` or `seedRefundParentLane()` at:

- `packages/sync-engine/src/scheduler/rx-refund-scheduler-task-seeder.ts:40–44`

Those describe different populations and lifecycles.

---

## Touchpoint 5 — Scheduler fetcher registration

### Existing orders behavior

- `packages/sync-engine/src/scheduler/engine-scheduler-drain.ts:106–116`: recognizes orders browser descriptors.
- `:414–445`: constructs shared coverage and transport dependencies.
- `:481–487`: registers the orders fetcher.

Existing refunds registration:

- `:449–478`: accepts only parsed history/parent keys, greedy mode, and no targeted IDs.
- It also provides `heldParentIds()`, reading resident parent orders and their refund summaries.

### Minimal refunds change

Extend the refunds registration to recognize browse descriptors and dispatch those tasks to a refund-browse fetcher.

Keep mode validation specific:

- Existing history/parent lanes remain greedy-only.
- Browse `'all'` is greedy.
- Numeric browse is windowed.

Reuse the existing refund repository and `heldParentIds()` closure. Do not construct an orders repository for refund payloads.

**Existing ceiling:** `:608–612` applies the refund-specific maximum of 2,000 fetcher invocations. That is a page limit for the existing one-page history fetcher, but would be a **pass** limit for a browse fetcher returning after up to 10,000 records. Its comment must not be mistaken for a universal 200,000-refund cap.

No new retry, locking, or scheduling mechanism is required.

---

## Touchpoint 6 — HTTP request construction and sync bridge

### Existing orders behavior

The dimension-to-URL builder is **not** in `packages/query/src/requirement-bridge.ts`.

That file’s `declareRequirements()` merely calls `engine.require()`:

- `packages/query/src/requirement-bridge.ts:31–49`

The actual orders builder is:

- `packages/sync-engine/src/scheduler/rx-scheduler-order-fetcher.ts:806–846`

It sends:

- `status`, `search`, `customer`
- `pos_cashier`, `pos_register`
- Numeric store as `pos_store`; a slug as `created_via`
- Epoch-second bounds converted to ISO UTC strings
- `dates_are_gmt=true`
- Boundary exclusions as `exclude`
- `per_page`
- `page=1` for ranged walks
- `orderby=date&order=desc` for ranged walks

Transport plumbing:

- `packages/sync-engine/src/require-plane.ts:820–842`: passes the namespace base and scope-bound fetcher to the drain.
- `apps/main/lib/sync-site.ts:14–30`: derives the `wcpos/v2` base.
- `apps/main/lib/engine-fetcher.ts:161–180`: applies authentication, transport/permalink settings, and active `storeId`.
- `packages/sync-engine/src/scheduler/rx-scheduler-collection-fetcher.ts:136–143`: forwards the abort signal.

### Minimal refunds change

Build:

```text
<syncBaseUrl>/refunds
  ?after=<ISO UTC>
  &before=<ISO UTC>
  &dates_are_gmt=true
  &orderby=date
  &order=desc
  &per_page=<bounded size>
  &page=1
  [&exclude=<boundary IDs>]
  [&pos_store=<requested store>]
```

Use `pullRequestLimit()` and the existing Woo per-page maximum.

No new app transport, authentication path, route namespace, or bridge API is needed.

**Unverified server requirements:** The supplied observation confirms range/sort/page-size parameters. Exact orders-style continuation additionally requires:

- `exclude` to be honored.
- The expected `before` boundary semantics.
- Correct GMT interpretation.
- Usable creation timestamps.
- Pagination headers for the corresponding filtered population.

The supplied observation does **not** establish `pos_store` support. Active transport `store_id` and the query’s `pos_store` filter are separate concepts; one cannot substitute for the other without evidence.

---

## Touchpoint 7 — Ranged continuation and completion

### Existing orders behavior

`packages/sync-engine/src/scheduler/rx-scheduler-order-fetcher.ts` contains the ranged algorithm:

| Location | Responsibility |
|---|---|
| `:156–191` | Parses the descriptor and calculates bounded per-page size. |
| `:515–549` | Reads timezone-safe creation seconds and finds the page’s oldest-second IDs. |
| `:580–595` | Reads the persisted cursor independently of freshness. |
| `:764–805` | Resumes the date cursor and sets the per-pass budget. |
| `:815–844` | Sends date bounds, exclusions, page 1, date-desc ordering. |
| `:879–910` | Advances the cursor and accumulates same-second exclusions. |
| `:947–970` | Detects actual server exhaustion. |
| `:981–998` | Writes ranged cumulative coverage. |
| `:1045–1053` | Returns incomplete when another ranged pass is needed. |

Cursor shape:

- `packages/sync-engine/src/scheduler/persisted-coverage-schema.ts:34–57`

```ts
{
  beforeSeconds,
  excludeWooIds,
  totalRecords,
  downloadedRecords?
}
```

The next `before` is the oldest returned second plus one, clamped not to widen the previous bound. Already-consumed IDs from that boundary second are excluded.

The existing 500-ID boundary exclusion cap fails rather than skipping or looping indefinitely.

**Separate mechanism:** Numeric orders scroll windows use positional-prefix continuation at `:1150–1178`. Ranged walks explicitly bypass it.

### Minimal refunds change

Add a narrowly scoped refund browse walker:

- Use the same date-desc cursor algorithm and persisted cursor shape.
- Keep a 10,000-record ranged pass budget; return `completed: false` when another pass is required.
- Continue through the existing greedy runner.
- Use raw server rows to advance the cursor and detect exhaustion.
- Use admitted/applied refund documents for resident coverage IDs.
- Do not treat an all-rejected page as server exhaustion.
- Numeric limits fetch a bounded date-desc slice; reaching the requested count is not proof that the server has no more records.

Reuse the existing creation-date/page-boundary primitive through a small export or extraction. Do not copy order materialization, dirty-order guards, held-cart settlement, custom-pull checkpoints, or manifest-writing logic.

The requested ranged behavior does not require adding refunds to the numeric scroll-prefix/eviction system.

---

## Touchpoint 8 — Existing progress-wiring gap and coverage persistence

### Observed source gap

Orders attempt per-page publication:

- `packages/sync-engine/src/scheduler/rx-scheduler-order-fetcher.ts:598–612`
- `:929–944`

But:

1. `LocalCoverage` exposes `recordCumulativeQueryResult()`, not `publishRangedResume()`:
   - `packages/sync-engine/src/local-coverage/local-coverage.ts:130–143`
2. Its implementation forwards cumulative writes:
   - `:355–367`
3. The drain’s coverage adapter likewise omits the publisher:
   - `packages/sync-engine/src/scheduler/engine-scheduler-drain.ts:414–430`
4. The lower-level repository implements it:
   - `packages/sync-engine/src/local-coverage/persistence.ts:325–367`

Therefore the optional publisher call returns without writing on this production path.

**Inferred consequence, not runtime-tested:** The orders walker still updates its local `publishedResume` after that no-op. Its final cumulative write supplies that cursor as the expected ancestry (`rx-scheduler-order-fetcher.ts:670–678`). Persistence demotes a mismatched ancestry to incomplete and removes the cursor (`persistence.ts:245–253`). This is more significant than a missing progress animation.

The fetcher and repository tests exercise these components separately; they do not by themselves prove this production connection.

### Minimal refunds recommendation

For the new refund walker, use the **already-wired `recordCumulativeQueryResult()` after each admitted page**, writing together:

- Applied refund IDs.
- The next cursor.
- Progress.
- Expected prior cursor.
- Completion and cursor clearing when exhausted.

This uses the existing persistence primitive and avoids introducing another optional publisher connection. It also keeps the cursor and accumulated IDs together at page boundaries.

Relevant persistence:

- `packages/sync-engine/src/local-coverage/persistence.ts:369–435`: cumulative ID union, cursor preservation/clearing, ancestry check.
- `packages/sync-engine/src/local-coverage/coverage-schema.ts:50–86`: existing schema supports the entire cursor.
- `packages/sync-engine/src/scheduler/persisted-coverage-schema.ts:59–67`: collection-neutral lane type.

**No schema migration is needed.**

Expose the existing cumulative/read capabilities in the refund browse fetcher’s input type. The runtime adapter already supplies them.

Fixing the existing orders publisher connection is a separate existing defect, not something to silently claim this refunds addition fixes.

---

## Touchpoint 9 — Refund admission, identity, and store attribution

### Existing refund-specific behavior

- `packages/database/src/collections/schemas/refunds.ts:9–28` includes `parent_id`, creation dates, monetary strings, and metadata; it does not define order status, cashier/register filter fields, or `created_via`.
- `packages/sync-engine/src/collections/refund-schema.ts:39–70` defines refund storage. It has no promoted `posStoreId`, `dateCreatedGmt`, or `remoteKey`.
- `packages/sync-engine/src/materialization/record-materialization.ts:220–233`:
  - Uses refund identity.
  - Extracts `_wcpos_session`.
  - Preserves metadata in the payload.
  - Does not join to the parent or derive store columns.

Admission is implemented at:

- `packages/sync-engine/src/scheduler/rx-scheduler-refund-fetcher.ts:57–79`

It:

1. Uses a held parent’s authoritative refund summary when available.
2. Otherwise admits based on POS provenance.
3. Rechecks parent/provenance after upsert and removes newly inadmissible children.

`hasPosRefundStamp()`:

- `packages/sync-core/src/refund-provenance.ts:4–27`

recognizes session/register/user/store stamps and rejects explicitly foreign-store provenance where applicable.

### Minimal refunds change

Extract/reuse that existing page-admission/upsert/recheck block for browse pages. Do not duplicate its policy or bypass it.

A returned refund’s `parent_id` is not a reason to issue an order fetch for every refund. No parent-join subsystem is needed for the minimum proposal.

### `wooMetaCarrier` and store caveat

- `packages/sync-core/src/pos-carrier/carrier.ts:38–45`: store metadata key is `_pos_store`.
- `:102–109`: `wooMetaCarrier.readIdentity()` reads it from the supplied metadata.
- It does **not** look up a parent or infer a store.

Supplementary local plugin inspection found:

- `/Users/kilbot/Projects/woocommerce-pos-pro/includes/API/V1/Order_Refunds_Controller.php:148–151`: refund context gets the currently selected/authorized store.
- `/Users/kilbot/Projects/woocommerce-pos-pro/includes/Payments/Refund_Processor.php:370–383`: passes that context to audit metadata.
- `/Users/kilbot/Projects/woocommerce-pos-pro/includes/Payments/Refund_Audit_Meta.php:24–42`: writes `_pos_store` to the refund.

**Observed:** This inspected creation path stamps request-context store attribution; it does not demonstrate copying the parent’s `_pos_store`.

**Unverified:** Whether the deployed read route copies/inherits parent metadata, whether historical/non-POS refunds have it, and whether this sibling checkout matches the user’s wp-env.

Consequently, “refund store equals parent order store” is not established. Missing store metadata must not silently mean “belongs to the selected store.”

---

## Touchpoint 10 — Query-state types and defaults

### Existing orders behavior

- `packages/core/src/query/query-state-types.ts:14–46`: collection filter types; no refunds entry.
- `:52–86`: sort fields; no refunds entry.
- `:90–95`: query state requires `search`, `filters`, `sort`, and numeric `limit`.
- `packages/core/src/query/query-state-store.tsx:10–21`: exhaustive default-filter table.

### Minimal refunds change

Add:

```ts
refunds: {
  dateRange?: DateRangeFilter;
  store?: string;
}
```

Add a minimal refund sort field, `date_created_gmt`, and `refunds: {}` to default filters.

The abbreviated call in the task is not the hook’s current literal signature. A complete Reports-shaped state is:

```ts
useCollectionBinding('refunds', {
  search: '',
  filters: { dateRange, ...(store ? { store } : {}) },
  sort: { field: 'date_created_gmt', direction: 'desc' },
  limit: Number.MAX_SAFE_INTEGER,
});
```

No partial-state overload is necessary.

---

## Touchpoint 11 — Field mappings and local filtering

### Existing orders behavior

- `packages/query/src/engine-adapter/collection-map.ts:554–559`: orders creation date maps to promoted `dateCreatedGmt`.
- `:627–633`: store is a metadata-backed dimension.
- `packages/core/src/query/query-state-translator.ts:244–257`: numeric store filters use `identityColumnFilter()`, producing a promoted-column predicate.

Refunds already have a collection-map entry, but only identity/session fields:

- `packages/query/src/engine-adapter/collection-map.ts:302–309`

### Minimal refunds change

Add explicit refund mappings for:

- `date_created_gmt` → `payload.date_created_gmt`, wire dimension.
- `store` → refund metadata, wire dimension only when its endpoint contract is established.

**Do not reuse the orders numeric-store prefilter unchanged.** It targets `posStoreId`, which refund documents do not have.

Add a small refund-specific store-filter branch that:

- Reads `_pos_store` using `wooMetaCarrier.readIdentity()`.
- Uses a payload-metadata predicate handling numeric and string metadata values consistently.
- Does not use `created_via` for slugs.

No promoted-column migration or new index is required for the minimum implementation. Read-side cost is an accepted risk for this report query.

---

## Touchpoint 12 — Query-state translation to remote demand

### Existing orders behavior

`packages/core/src/query/query-state-translator.ts`:

- `:51–58`: order filter registrations.
- `:287–296`: converts UI date strings to UTC epoch seconds, including timezone-less Woo strings.
- `:299–309`: requirement ID suffixes.
- `:415–427`: local read plan.
- `:465–521`: builds orders browse demand.
- `:509–514`: converts the Reports numeric sentinel to `'all'` when a date bound exists.
- `:520`: scoped demand gets priority 700.

### Minimal refunds change

Add:

1. Refund date/store filter registrations.
2. `'refunds-browse'` requirement ID suffix.
3. A refund branch alongside orders:
   - Convert `dateRange.from/to` using the existing UTC conversion helper.
   - Emit public `after`/`before` epoch seconds.
   - Forward supported store ID.
   - Preserve finite limits.
   - Convert `Number.MAX_SAFE_INTEGER` to `'all'`.
   - Set scoped priority 700.
   - Do not emit orders-only dimensions.

Because the proposed refund requirement requires both bounds, invalid or missing bounds must not turn into an unbounded refund history walk.

Keep `represented` honest. In particular:

- Unsupported store semantics cannot be labeled remotely represented.
- Nonempty refund search is not implemented by this requirement.
- For a finite window, a local sort differing from the fixed wire sort cannot be presented as the exact remote slice.

**Inherited boundary caveat:** Local date filtering is inclusive (`:267–280`), whereas the orders cursor code relies on exclusive server date bounds. The supplied refund-route observation does not settle equality at the endpoints. Preserve the chosen orders translation deliberately and test exact-boundary records before claiming equivalence.

---

## Touchpoint 13 — `useCollectionBinding`, progress, and Reports

### Existing binding behavior

- `packages/core/src/query/query-bindings.ts:734–761`: compiles state, creates a read descriptor, and delegates to the generic engine binding.
- `:264–305`: declares demand and takes the returned handle’s canonical key for coverage.
- `:167–177`: suppresses coverage targeting when the filtered query is not represented.
- `:569–595`: combines local result count, coverage verdict, and census.
- `:700–708`: exposes `laneProgress$`.

Observation chain:

```text
coverage lane write
→ engine.coverageChanges()
→ observeCoverage()
→ coverageProjection$()
→ binding.laneProgress$
```

Sources:

- `packages/sync-engine/src/create-rxdb-sync-engine.ts:2586–2588`
- `packages/query/src/engine-query.ts:130–136`
- `packages/sync-engine/src/local-coverage/coverage-verdicts.ts:83–101`

Progress is derived from `rangedResume`, independently of freshness:

- `downloadedRecords`, falling back to accumulated IDs.
- `totalRecords`, nullable.
- No cursor → `progress: null`.

### Minimal refunds change

**No production change to `useCollectionBinding` is needed.** Once types, compiler, requirement key, and coverage writes exist, it can use refunds through the same generic path.

Do not use `total$` as the range-progress denominator: it can prefer the collection census. `laneProgress$.total` is the ranged walk’s denominator.

### Reports integration boundary

Current Reports creates orders bindings at:

- `packages/core/src/screens/main/reports/index.tsx:83–99`

It requests all results through:

- `:56`: `Number.MAX_SAFE_INTEGER`.

A refund binding can derive a stable state containing only date range/store. Do not spread order status/cashier/register filters into it.

Existing UI consumers remain orders-specific:

- `packages/core/src/screens/main/reports/context.tsx:213–235`
- `packages/core/src/screens/main/reports/sync-progress.tsx:22–54`
- `packages/core/src/screens/main/reports/panels/panel.tsx:164–173`

Adding the library capability does not automatically add refund progress to the existing display or print readiness. Actual report arithmetic, context expansion, and translated refund progress copy are separate screen integration work.

---

## Touchpoint 14 — Exports, testing adapter, and unchanged infrastructure

### Required small export changes

- `packages/sync-engine/src/scheduler/index.ts:52–53`: export the refund key/parser/seeder through the scheduler seam.
- `packages/sync-engine/src/testing.ts:89`: export the refund key for tests.
- `packages/query/src/testing.ts:146–156`: make the fake engine return the refund browse key; otherwise binding tests would receive `queryKey: null`.
- `packages/query/src/testing.ts:67`: expose the helper alongside the orders helper.

### No ranged-only changes needed

- `packages/sync-engine/src/scheduler/browse-window-lane-eviction.ts:169–179`: ranged orders are excluded from numeric-window eviction; refund ranged keys should remain excluded.
- `packages/sync-engine/src/local-coverage/coverage-key-retention.ts:95–111`: ranged keys are not scroll-window retention candidates.
- Coverage schema and observer infrastructure are collection-neutral.
- `packages/query/src/requirement-bridge.ts:76–83` already supplies refund reset-history refresh. Mounted refund bindings can redeclare their own ranged demand through coverage-generation changes.

---

## Existing tests to mirror

**These files were inspected or located, not executed.**

| Area | Existing test files |
|---|---|
| Requirement dispatch and outcomes | `packages/sync-engine/src/create-rxdb-sync-engine.require-orders.test.ts`; `packages/sync-engine/src/create-rxdb-sync-engine.require-drain-outcomes.test.ts` |
| Returned canonical key | `packages/sync-engine/src/require-plane.query-key.test.ts` |
| Key normalization/parser | `packages/sync-engine/src/scheduler/order-browser-scheduler-descriptor.test.ts` |
| Persisted grammar contract | `packages/sync-engine/src/scheduler/browse-window-grammar.test.ts` |
| Seeding, identity, greedy ranged mode | `packages/sync-engine/src/scheduler/rx-order-scheduler-task-seeder.test.ts` |
| HTTP, ranges, continuation, completion | `packages/sync-engine/src/scheduler/rx-scheduler-order-fetcher.test.ts` |
| Cursor ancestry and publication | `packages/sync-engine/src/local-coverage/ranged-resume-ancestry.test.ts` |
| Coverage verdict/progress | `packages/sync-engine/src/local-coverage/coverage-verdicts.test.ts`; `packages/sync-engine/src/create-rxdb-sync-engine.coverage-changes.test.ts` |
| Query translation | `packages/core/src/query/query-state-translator.test.ts` |
| Binding demand/progress | `packages/core/src/query/query-bindings.test.tsx` |
| Query state/demand composition | `packages/core/src/query/query-state-store.test.tsx`; `packages/core/src/query/query-demand-oracle.test.ts` |
| Package surface | `packages/sync-engine/src/package-exports.test.ts` |

Particularly useful orders cases:

- `rx-scheduler-order-fetcher.test.ts:2300–2677`: advertised last page, 10,000-record continuation, missing total header, resume without re-download, reset, concurrent changes, same-second ties, per-page progress, ignored dimensions, oversized tie group.
- `rx-order-scheduler-task-seeder.test.ts:186–210`: ranged task must be greedy.
- `query-state-translator.test.ts:537–627`: Reports sentinel, date range, sort-independent ranged key.
- `query-bindings.test.tsx:601–684`: ranged progress, clearing progress, and refusing unrelated lane totals.

Also preserve the existing refunds cases in:

- `packages/sync-engine/src/scheduler/refund-lane-descriptor.test.ts`
- `packages/sync-engine/src/scheduler/rx-refund-scheduler-task-seeder.test.ts`
- `packages/sync-engine/src/scheduler/rx-scheduler-refund-fetcher.test.ts`
- `packages/sync-engine/src/create-rxdb-sync-engine.require-refunds.test.ts`
- `packages/sync-engine/src/materialization/record-materialization.test.ts`
- `packages/sync-core/src/refund-provenance.test.ts`

Essential additional integration case: declare a real refund browse requirement through the production engine, observe `coverageChanges`, interrupt/redeclare, and verify that cursor, accumulated IDs, and progress survive together. A fake publisher alone would miss the existing orders wiring problem.

---

## Estimated implementation size

**Proposal only; actual changes in this investigation: 0 lines.**

This estimate assumes a small refund-browse sibling, reuse of refund page admission, existing cumulative coverage writes, and no generic ranged-fetch framework.

| File | Estimated changed non-test lines |
|---|---:|
| `packages/sync-engine/src/require-plane.ts` | 35 |
| New `packages/sync-engine/src/scheduler/refund-browser-scheduler-descriptor.ts` | 55 |
| `packages/sync-engine/src/scheduler/rx-refund-scheduler-task-seeder.ts` | 20 |
| New `packages/sync-engine/src/scheduler/rx-scheduler-refund-browse-fetcher.ts` | 155 |
| `packages/sync-engine/src/scheduler/rx-scheduler-refund-fetcher.ts` | 10, plus relocation of the existing admission block |
| `packages/sync-engine/src/scheduler/rx-scheduler-order-fetcher.ts` | 2, to expose the existing boundary primitive |
| `packages/sync-engine/src/scheduler/engine-scheduler-drain.ts` | 6 |
| `packages/core/src/query/query-state-translator.ts` | 50 |
| `packages/query/src/engine-adapter/collection-map.ts` | 16 |
| `packages/core/src/query/query-state-types.ts` | 6 |
| `packages/core/src/query/query-state-store.tsx` | 1 |
| `packages/sync-engine/src/create-rxdb-sync-engine.ts` | 1 |
| `packages/sync-engine/src/index.ts` | 1 |
| `packages/sync-engine/src/scheduler/index.ts` | 4 |
| `packages/sync-engine/src/testing.ts` | 2 |
| `packages/query/src/testing.ts` | 5 |
| **Estimated non-mechanical total** | **369** |

Extracting the existing refund admission block would additionally produce roughly 80 mechanically changed lines across removal/addition. Tests are excluded. Files identified above as unchanged have a zero-line estimate.

The 155-line fetcher allowance is the main uncertainty. If implementation exceeds the 400-line non-mechanical ceiling, stop and reassess rather than add a generalized framework. Full Reports UI/data integration and repairing the pre-existing orders progress path are not hidden inside this estimate.

---

## Behavior changes / regressions

### Proposed intended changes

- Reports-shaped refund queries can demand an explicit historical range instead of relying on resident/history refunds.
- Refund range/store combinations get independent canonical lanes.
- Ranged refund demand continues until exhausted and exposes resumable progress.
- Existing history and parent refund demand remain unchanged.

### Existing limitations or risks identified

- **Observed/Inferred:** Orders per-page progress publication is not connected through the production coverage facade; cursor ancestry can consequently be demoted.
- **Unverified:** Refund `exclude`, endpoint-boundary semantics, and server store filtering.
- **Observed:** Refunds lack orders’ promoted store/date fields; copying orders’ local store predicate would target a nonexistent column.
- **Observed:** Inspected Pro creation code stamps the request-context store, not demonstrably the parent’s store.
- **Inferred:** A server total may include refunds rejected by client parent/provenance admission. Progress must not misrepresent downloaded eligible refunds as the full server population.
- **Accepted scope limit:** Numeric refund windows need not acquire orders’ scroll-prefix optimization; repeat fetching is preferable to expanding this request.
- **Not evaluated:** Performance, runtime compatibility, or regressions. No tests or builds were run.

## Blocked on me

Nothing blocks this investigation. Before asserting complete store-scoped behavior, the implementation needs evidence for refund store attribution and endpoint filtering, plus the cursor parameters listed above.

## Changed

Nothing. No files, tests, builds, commits, or artifacts were created.

## Found

The minimum addition is a refund browse lane plus query-state registration, reusing existing refund ingestion and cumulative coverage. The generic binding already supports the required progress projection; the notable existing defect is the disconnected orders per-page publisher.

print the complete report