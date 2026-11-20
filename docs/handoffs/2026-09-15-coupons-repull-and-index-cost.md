# Every till re-downloads the entire coupon set every five minutes

**Date:** 2026-09-15
**Status:** decision needed from Paul; finding 1 looks like a defect, finding 2 is a design call
**Related:** monorepo#2070 (caps the leak this drove), monorepo#2062 (search heap gate),
monorepo#2057 (the same reasoning applied to logs)

## Finding 1: the refresh cadence (the bigger problem)

**Measured, on a soak that never opened a coupon surface at all:**

| | |
|---|---|
| First full coupon pull | 23 seconds after authentication, ~30 seconds after boot |
| Coupon endpoint requests in 51 minutes | 254 |
| Shape | bursts of ~25 pages, pages 0.7–0.9 s apart |
| For comparison, same run | products 99, orders 11, customers 10 |
| Coupons on the store | 2,486 |

No user action asked for any of it. Extrapolated to an eight-hour shift that is roughly 2,400
requests and about 96 full re-downloads of the coupon set.

**Why it happens.** The `reference-seed` maintenance lane
(`packages/sync-engine/src/maintenance/maintenance-lanes.ts`, registered in
`maintenance/lane-registry.ts` at `defaultMs: 5 * 60_000`) ticks every five minutes. Each tick it
counts every reference collection, then:

- **count === 0** — asks the census and backfills if the server reports any rows at all. This is why
  a till's first launch downloads every coupon whether or not anyone wants one.
- **count > 0** — re-seeds the lane **unconditionally**, every five minutes, changed or not. The
  only thing limiting the rate is `REFERENCE_REFRESH_DEDUPE_MS`, four minutes.

There is no "has anything changed?" gate on that second branch, even though the change-signal tick
already reports per-collection changes and `refreshReferenceCollection` exists precisely to refresh
one collection when the signal says it changed.

**The code contradicts itself about whether this should happen at all.**
`packages/sync-engine/src/scheduler/rx-pos-bootstrap-seeder.ts`:

- header, line 11: *"Categories, brands, tags, and coupons are fetched on demand, not seeded at boot."*
- `REFERENCE_LANE_CONFIGS`: *"These lanes are seeded by on-demand and upkeep refreshes, never boot."*
- `referenceLaneTaskFor`, twenty lines later: *"Used both at boot and by the change-signal tick."*

An on-demand path already exists and is respected: `require-plane.ts:1034` carves picker opens out
of the dedupe window so opening the coupon select never gets suppressed.

**Why it is not just wasted bandwidth.** Every refresh re-writes coupon rows, which feeds the
FlexSearch append pipeline, which periodically exports the whole 71 MiB index. Each export was
retained twice in RxDB's change-event buffer, up to 100 deep. That is what took a merchant's till to
3.2 GB over an 11-hour shift. monorepo#2070 caps the retention and removes the crash; it does not
touch the cadence that drove it.

This lane also covers categories, brands and tags. They are cheaper per row, but they are on the
same five-minute clock.

**Not verified:** how many of those 2,486 rows are actually re-written locally per refresh versus
deduped before the write. The HTTP request count is measured; the local write volume is inferred.
Worth measuring before sizing a fix, because it decides whether the cost is mostly network or mostly
storage and index churn.

## Finding 2: the index those refreshes feed is the most expensive in the POS

| Index | Retained | Entries | Per entry |
|---|---|---|---|
| coupons | 71.04 MiB | 2,486 | ~29 KB |
| products | 1.17 MiB | 139 | ~8.6 KB |
| categories | 0.10 MiB | 50 | ~2 KB |
| orders | 0.02 MiB | 14 | ~1.5 KB |
| variations, customers, tags, brands | under 0.3 MiB each | | |

From a Chrome heap snapshot during a 60-minute soak of published 1.10.16 against dev-free, parsed
with the DevTools dominator implementation. The renderer's warm working set was about 140 MiB, so
coupons alone are half of it.

Two decisions compound. **Coupons index a free-text field and products do not** —
`LEGACY_SEARCH_FIELDS` in `packages/query/src/engine-adapter/collection-map.ts` gives products
`name`, `sku`, `barcode` but coupons `code` and **`description`**, which is merchant prose of
arbitrary length. And **the tokenizer indexes every substring**: `tokenize: 'full'` makes cost
quadratic in term length, as the comment on `FLEXSEARCH_LITERAL_TERM_MAX_LENGTH` in
`packages/sync-core/src/searchIndexConfig.ts` already spells out — a 16-character term is 105
substrings. `tokenize: 'full'` is right for products, mirroring WooCommerce's own `LIKE '%term%'`
search (#679); nothing here argues for changing it globally.

**What it buys.** Two surfaces, both of which resolve to a code: the coupons list screen
(`screens/main/coupons/index.tsx`, `testID="search-coupons"`, Pro only) and the add-coupon dialog
(`screens/main/pos/cart/add-coupon.tsx`, which uses `selected.code`). The cart applies coupons by
code, and `useRecalculateCoupons` scans the resident collection directly without touching the index.
Nothing establishes that merchants search coupon descriptions — that is the open question, not a
claim that they do not.

## Options

**On the cadence (finding 1), in priority order:**

**A1. Gate the re-seed on change. (Recommended.)** The count > 0 branch should re-seed only when the
change-signal reports that collection changed, which is what `refreshReferenceCollection` is for.
Keep a long safety-net interval for stores whose signal is broken, since that was exactly the
merchant's state — their tick answered 403 for 11 hours.

**A2. Make the boot backfill on-demand, as the seeder's header already claims.** Fetch when the
coupon picker first opens. Bigger behavioural change: a cashier's first coupon open pays the pull.

**A3. Leave the cadence, cap the blast radius.** Least work, lowest value; the churn stays.

**On the index (finding 2):**

**B1. Drop `description`, keep `code`. (Recommended.)** One line in `LEGACY_SEARCH_FIELDS`. Removes
the unbounded field while keeping what both surfaces use. Expect roughly an order of magnitude off
the index; measure rather than assume. Cost: anyone finding a coupon by description words loses that
silently.

**B2. Stop indexing coupons; scan instead.** What #2057 did for logs: `searchIndex: false` plus a
bounded mango scan over a write-time folded column. Best memory outcome, more work, needs the folded
column on both the sync and local-edit paths.

**B3. Leave it.** Defensible now the crash is capped, but 71 MiB scales with the merchant's coupon
count and description length and nobody is watching it.

Whichever of B is chosen: **bump `SEARCH_INDEX_VERSION` in `@wcpos/database`**. The persisted index
is not re-tokenized in place and stale indexes are only reclaimed on a version change.

## Measured vs not

**Measured:** the request counts and timings; the index sizes and entry counts; the heap curve before
and after #2070 (46 to 404 MiB over an hour, versus 47 to 160 MiB fixed).

**Not measured:** local write volume per refresh; whether any merchant searches coupon descriptions;
coupon counts on production stores, since dev-free's 2,486 coupons against 139 products is not a
realistic ratio; the index size after dropping `description`; whether orders and customers are
similarly expensive on a large store, which is plausible since both index several free-text fields.

A 45-minute attribution run is in flight on the fixed build to explain the remaining ~23 MiB/hour
slope, which is a different question from either finding here.

## Evidence

Numbers come from `diagnose-report.md` and two `.heapsnapshot.analysis.json` files produced in
session `2ebc5483` under
`/private/tmp/claude-501/-Users-kilbot-Projects-monorepo-v2/2ebc5483-cf70-4d15-b9a7-21052e2fbe87/scratchpad/`.
**That is a session scratchpad and will not survive**, which is why every number this decision rests
on is quoted inline here.
