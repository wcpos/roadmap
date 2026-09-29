# Brief — PR 4c of the Sales room on Reports: refunds counted on the day they were made, and the negative-COGS netting (wcpos/roadmap#332 §2, #302, #361)

Branch `feat/reports-sales-4c`, off `origin/next` after PR 4b (wcpos/monorepo#2277) merged. `R/` means `packages/core/src/screens/main/reports/`. This worktree already has `node_modules` (installed offline); do not run `pnpm install`, `git pull` or `git fetch`.

## Stakes

A reporting screen over local orders and refunds. No money moves and nothing is written to the server. The worst failure is a refund counted twice or on the wrong day, caught by the tests below. Treat concurrency findings as accepted risks. No new gate, no flag, no framework.

## Rules every aggregation here follows (each cost a review round on 3a–4a)

Quantities through `quantity`, money through `money`, percentages through `reports.percent`; whole phrases in the catalogue; tax and line shapes as the receipt path encodes them; every name falls back to `t('common.unknown')`; footers sum their own rows; a secondary resource lives under its own `Suspense` + `ErrorBoundary` with a fallback that keeps the primary content; `useObservableState(source, [])` hides loading — use no initial value and a skeleton; a `useMemo` whose deps differ from what it reads fails Lint.

## Read first

- `R/index.tsx:87–99, 211–219` — the sales binding and the comparison binding (`useCollectionBinding('orders', {...state, filters: {...state.filters, dateRange}})`), the query key; `R/context.tsx` — `ReportsProvider({ binding, comparisonBinding })`, `useReportsData()` (`allOrders`, `selectedOrders`, `totals`, `comparisonOrders`), `ReportsComparison` (the Suspense pattern for a secondary binding: fallback keeps the primary content; `ErrorBoundary` with `resetKeys` on the query).
- **4b's lane**: `useCollectionBinding('refunds', { ...state, filters: { dateRange } })` declares `refunds-browse` for the window and serves the local refunds in it (inclusive; `date_created_gmt`). A refund carries `parent_id`, `amount`, `total`, `line_items` (with `cost_of_goods_sold.value` **negative** on a costed line), `meta_data`; **no store or register of its own** — its store and register are its parent order's.
- `R/cards/aggregate.ts` `refundsSummary` (today: the period's orders' embedded `refunds[]`), `R/cards/refunds.tsx`, `R/hero/index.tsx` (the figure and the companions come from `totals`; `calculateTotals` sums embedded refunds into `refundTotal` and does **not** subtract them from `total`), `R/report/utils.ts:29–36`, `R/margin.ts` (`lineCost`, `marginOf`), `R/panels/specs.ts` (the `refunds` spec: one row per embedded refund).
- The build brief §2 "Refunds count on the day they were made, not the day of the order"; #361 "the refunds endpoint returns negative COGS; margin must net against it under #302's dating rule".

## What to build

### 1. A third binding: the period's refunds (`R/index.tsx`, `R/context.tsx`)

Beside the sales and comparison bindings, `refundsBinding = useCollectionBinding('refunds', { ...state, filters: { dateRange: state.filters.dateRange } })` (memoised on the range). `ReportsProvider` takes it; a `ReportsRefunds` component (the `ReportsComparison` pattern) suspends on its resource and re-provides `ReportsData` with `periodRefunds: RefundRow[]` — **scoped to the room**: keep a refund only when its `parent_id` matches an order the sales binding holds for the room's register and store **or**, when the parent is not local, when the refund's `meta_data` carries the room's register / store identity through `wooMetaCarrier.readIdentity` (the same reader the store filter uses); otherwise the refund is outside this room and is dropped (a refund of another store's order is not this store's refund). Under its own `Suspense` whose fallback keeps the page with `periodRefunds: undefined` (the Refunds card shows its skeleton; the hero's figure does not wait), and an `ErrorBoundary` with `resetKeys` on the query. The comparison range's refunds are **not** read in this PR (the delta keeps comparing sales).

### 2. The figures follow #302

- **Refunds card and panel** (`R/cards/refunds.tsx`, `aggregate.ts`, `specs.ts`): `refundsSummary` reads `periodRefunds` — Refunded = Σ |refund `amount`| (or `total`), Orders = distinct `parent_id`s "of n" (n the counted orders), Kept = (period sales − refunded) / period sales; the panel lists one row per refund: Order `#number` (the parent's number when local, else `#<parent_id>`), Time (the refund's, in the store's zone), Reason (or "—"), Amount. While `periodRefunds` is `undefined` the card shows its skeleton and the panel its loading line. The embedded `order.refunds[]` are **no longer** the card's source (they date by the order, not the refund).
- **The hero**: the headline figure stays **gross sales of the period** (the build brief's figure is sales; refunds are a card). No change to the hero in this PR beyond the provider.
- **The printed Sales summary** (`report/template.tsx`, `generate-html.ts`): the "Refunds" row reads the period's refunds the same way when `periodRefunds` is known; falls back to the embedded sum while it is not — say which in the ledger.

### 3. Margin nets the refunds (`R/margin.ts`, `R/cards/aggregate.ts`, `R/panels/specs.ts`)

For the Top products, Categories and Brands margin columns: each period refund's `line_items` join to the same groupings by `product_id` / category / brand (the same join as the sale lines; a refund line's product not local → the Unknown row) and **net**: `net` adds the refund line's `total` (negative), `cost` adds its `cost_of_goods_sold.value` (negative) when present — a refund line whose cost is null counts toward `missing` like a sale line. Quantities net too (`quantity` is negative on a refund line). The footer's "cost missing on n of m items" counts refund lines in both. A grouping that nets to zero stays a row (with dashes where nothing is costed), never disappears.

### 4. Translations

`reports.col_time` if missing, `reports.refund_of_order` ("Refund of #{number}") if the panel needs a label; nothing reworded.

## Ledger

`R/LEDGER.md`: add 35 — refunds are read by the day they were made through the refunds lane, scoped to the room by their parent order (or their own POS identity when the parent is not local); the Refunds card, its panel and the printed summary's refund row read them; the embedded `order.refunds[]` are no longer a figure's source; the hero's headline stays gross sales — evidence: build brief §2, #302, #2277, this PR. Add 36 — margin nets a period refund's lines (negative totals, negative costs, negative quantities) into the same groupings — evidence: #361, the wp-env proof on #332 (a refund line's `cost_of_goods_sold.value: −12.5`), this PR. `R/report/LEDGER.md` line 1 re-evidenced (the refund row's new source).

## Tests (by name)

- `R/context.test.tsx` (+3): "period refunds are scoped to the room by their parent order", "a refund whose parent is not local is kept by its own POS identity", "a refund of another store's order is dropped".
- `R/cards/aggregate.test.ts` (+3): "refunded sums the period's refunds, not the orders' embedded ones", "orders counts distinct parents", "a refund made today for last week's order counts today".
- `R/margin.test.ts` (+3): "a refund line nets its negative total, cost and quantity into the grouping", "a refund line without a cost counts as missing", "a grouping netted to zero stays a row".
- `R/cards/refunds.test.tsx` (+2): "the skeleton until the refunds emit", "the figures once they do"; `R/panels/specs.test.ts` (+1): "one row per period refund with the parent's number when local".
- `R/report/template.test.tsx` (+1): "the refund row reads the period's refunds when known".
- Playwright `reports-closures.spec.ts`: the stub answers `GET /wcpos/v2/refunds?after=…` with `[]` (add the route beside the orders stub); assert `card-refunds-refunded` reads the zero amount on both viewports. You cannot run this spec locally.

## Commands (run before you report; verify by exit status; one runner at a time)

```
NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir packages/core exec jest src/screens/main/reports --maxWorkers=2
pnpm --dir packages/core exec eslint src/screens/main/reports --ext .ts,.tsx
pnpm --dir packages/core exec tsc --noEmit
node scripts/check-react-compiler-smells.mjs
pnpm --filter @wcpos/eslint-config test
pnpm translations:check
```

## Out of scope (do not add)

Comparison-range refunds and a refund-aware delta; a change to the hero's headline; Where sold; engine or plugin changes; a store dimension on the refunds lane; `pos/**`; gallery cells; plan, status or handoff files.

## Budget

Estimate, changed non-test logic lines before formatting: `index.tsx` +15, `context.tsx` +60, `cards/aggregate.ts` +40, `cards/refunds.tsx` +15, `margin.ts` +30, `panels/specs.ts` +25, `report/template.tsx` + `generate-html.ts` +15, translations ~6. Hard ceiling **400**; if you are about to exceed it, STOP and report why.

## Fixed lines

- If anything does not work as expected — a missing tool, an install, a permission, a failing baseline you did not cause — stop and say so rather than working around it. Where this brief and the code's real contract differ, the code wins: resolve it and name it in your report; a design question means this brief was not ready: name it as `Readiness failure: <question>` and stop.
- Do not push; do not open or edit a PR; do not reply on any PR; do not `git commit` — the orchestrator reviews the diff and commits.
- Your final message is the report: what changed (file by file), what you ran with exit codes, and your line count against the ceiling.
