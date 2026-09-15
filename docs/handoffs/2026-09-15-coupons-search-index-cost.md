# Coupons carry the most expensive search index in the POS

**Date:** 2026-09-15
**Status:** decision needed from Paul before any code change
**Owner question:** *"It seems a heavy load for a relatively trivial part of the POS."*
**Related:** monorepo#2070 (merged/queued fix for the export-history leak this amplified),
monorepo#2062 (search heap gate), monorepo#2057 (the same reasoning applied to logs)

## The finding

On a live dev store, the coupons FlexSearch index is 60x the size of the products index and
accounts for roughly half the POS renderer's warm memory.

| Index | Retained | Entries | Per entry |
|---|---|---|---|
| coupons | 71.04 MiB | 2,486 | ~29 KB |
| products | 1.17 MiB | 139 | ~8.6 KB |
| categories | 0.10 MiB | 50 | ~2 KB |
| orders | 0.02 MiB | 14 | ~1.5 KB |
| variations, customers, tags, brands | under 0.3 MiB each | | |

Measured from a Chrome heap snapshot taken during a 60-minute soak of the published 1.10.16 build
against dev-free, parsed with the DevTools dominator implementation. The renderer's warm working set
was about 140 MiB, so coupons alone are half of it.

## Why coupons cost so much more per row

Two decisions compound.

**1. Coupons index a free-text field; products do not.**
`LEGACY_SEARCH_FIELDS` in `packages/query/src/engine-adapter/collection-map.ts`:

- products: `name`, `sku`, `barcode` — all short, bounded strings
- coupons: `code`, **`description`** — the description is merchant prose of arbitrary length

**2. The tokenizer indexes every substring.**
`tokenize: 'full'` in `packages/database/src/plugins/search.ts` indexes every substring of every
term, so cost is quadratic in term length. The repo already knows this: the comment on
`FLEXSEARCH_LITERAL_TERM_MAX_LENGTH` in `packages/sync-core/src/searchIndexConfig.ts` spells out
that a 16-character term is 105 substrings and a 30-character email is 406. A sentence of coupon
description is many such terms, and unlike product names they are not shared vocabulary across rows.

`tokenize: 'full'` is deliberate and correct for products: it mirrors WooCommerce's own
`LIKE '%term%'` search, and compound-word languages need mid-word matching (see #679). Nothing here
argues for changing it globally.

## What it is bought for

Two surfaces, both of which a cashier reaches by code in practice:

- the coupons list screen, `packages/core/src/screens/main/coupons/index.tsx`, search box
  `testID="search-coupons"` (Pro only)
- the add-coupon-to-cart dialog, `packages/core/src/screens/main/pos/cart/add-coupon.tsx`,
  `testID="add-coupon-search-input"`, which resolves the selection to `selected.code`

The cart applies a coupon **by code**. `useRecalculateCoupons` scans the resident coupons collection
for each applied code and never goes through the search index at all.

Nothing establishes that merchants search coupon descriptions. That is the open question this
document exists to put in front of the owner, not a claim that they do not.

## The compounding cost: coupons are a greedy reference collection

`refreshReferenceCollection` in `packages/sync-core/src/applyReplicationActions.ts` full-refreshes
coupons, categories, brands and tags on **any** change to the collection — create, update or delete —
because the greedy fetcher is prunable by set difference, so a re-pull both upserts current rows and
prunes deleted ones. There is no per-id pull for these.

Observed on that soak: **254 requests to the coupons endpoint in 51 minutes**, in bursts of about 25
pages, against 99 for products, 11 for orders and 10 for customers, with no user action asking for
any of it. Every refresh re-writes coupon rows, which feeds the FlexSearch append pipeline, which
periodically exports the whole index.

That is how this turned from a size problem into a crash. Each export of a 33 MiB index was retained
twice in RxDB's change-event buffer, up to 100 events deep, which is what took a merchant's till tab
to 3.2 GB over an 11-hour shift. monorepo#2070 caps that history and removes the crash. **It does not
make the index smaller, and the re-pull cadence is untouched.**

## Options, with a recommendation

**A. Drop `description` from the coupon index; keep `code`. (Recommended.)**
One line in `LEGACY_SEARCH_FIELDS`. Removes the unbounded free-text field while leaving code search,
which is what both surfaces resolve to anyway. Expect the index to fall by roughly an order of
magnitude; measure rather than assume. Cost: a merchant who today finds a coupon by typing words
from its description loses that, silently.

**B. Stop indexing coupons entirely; scan instead.**
Exactly what #2057 did for logs: `searchIndex: false` plus a bounded mango scan over a write-time
folded column. Best memory outcome and it matches how the data is actually used, since a coupon set
is small and bounded where a product catalogue is not. More work, and it needs the folded column
written on both the sync and the local-edit paths.

**C. Leave it.**
Defensible now that #2070 removes the crash. The renderer still carries 71 MiB on a store with a few
thousand coupons, and that ceiling scales with the merchant's coupon count and description length,
which nobody is watching.

Whichever is chosen: **bump `SEARCH_INDEX_VERSION` in `@wcpos/database`**. The persisted index is not
re-tokenized in place, and stale indexes are only reclaimed on a version change.

## What is measured and what is not

Measured: the index sizes and entry counts above; the request counts; the heap curve before and
after #2070 (46 to 404 MiB over an hour, versus 47 to 160 MiB fixed).

Not measured: whether any real merchant searches coupon descriptions; coupon counts on production
stores, since dev-free's 2,486 coupons against 139 products is not a realistic ratio; the index size
after dropping `description`; whether the same per-row analysis makes the orders or customers index
expensive on a large store, which is plausible since both index several free-text fields and neither
was large on this store.

A separate 45-minute attribution run is in flight on the fixed build to explain the remaining
~23 MiB/hour slope, which is not this defect and may or may not touch coupons.

## Evidence

Numbers above come from `diagnose-report.md` and the two `.heapsnapshot.analysis.json` files
produced in session `2ebc5483` under
`/private/tmp/claude-501/-Users-kilbot-Projects-monorepo-v2/2ebc5483-cf70-4d15-b9a7-21052e2fbe87/scratchpad/`.
**That directory is a session scratchpad and will not survive**, which is why every number this
decision rests on is quoted inline here rather than linked.
