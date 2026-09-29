# Brief — PR 4a of the Sales room on Reports: margin — Cost / Profit / Margin %, the Brands card, the four states (wcpos/roadmap#332 §6, #361)

Branch `feat/reports-sales-4a`, off `origin/next` after PR 3e (wcpos/monorepo#2270) merged. Everything below `R/` means `packages/core/src/screens/main/reports/`. This worktree already has `node_modules` (installed offline); do not run `pnpm install`, `git pull` or `git fetch`.

## Stakes

A reporting screen over local orders. No money moves and nothing is written to the server. The worst failure is a wrong margin figure, caught by the tests below. Treat concurrency, partial-failure and retry findings as accepted risks, not defects. Do not add locking, retries, caches, network calls, feature flags or fallbacks. **Margin takes no gate of its own** (ruled on #361 / #300 decision 7): no Pro check, no lock row, no setting — the page's scope lock is the only gate.

## Rules every aggregation and label here follows (each cost a review round on 3a–3c)

- **Quantities are not money**: counts through `quantity`, never `number`; money through `money`; percentages through `reports.percent`.
- **Whole phrases in the catalogue**; a plural key's `count` only picks the plural.
- **Tax and line shapes as the receipt path encodes them**; every shown name falls back to `t('common.unknown')`.
- **Empty states are period-neutral**; **a disabled control says why**; **no z-index on panel content**.
- **Footers sum their own rows** (never the order total where the rows carry line totals).

## The COGS shapes (proved on a local wp-env, WooCommerce 10.4.3, plugin `next` — wcpos/roadmap#332, 2026-09-29)

- A line whose product has a cost: `line_items[].cost_of_goods_sold: { value: 25 }` (quantity × unit cost, **net of tax**, already multiplied); no `cogs_value` key.
- A line whose product has **no** cost: `line_items[].cogs_value: null` and **no** `cost_of_goods_sold` key (WooCommerce's v3 controller rewrites the raw `cogs_value` into `cost_of_goods_sold.value` only inside `isset()`, which is false for `null`). **Read `line.cost_of_goods_sold?.value`; absent or `null` is *cost missing*; never read `cogs_value`; never treat missing as 0.**
- An order the feature was on for carries an order-level `cost_of_goods_sold: { total_value }` even when every line's cost is null; a product carries `cost_of_goods_sold: { values: [{ defined_value, effective_value }], total_value }` when the feature is on. **The feature is on for the period when any selected order or any joined local product carries a `cost_of_goods_sold` object.** Off → the margin columns and the Brands card are **absent, not empty**.
- A refund line carries `cost_of_goods_sold: { value: -12.5 }` (negative). Netting refunds is **PR 4b** with the refunds-collection read; this PR reads the period's orders only.
- The schema `packages/database/src/collections/schemas/orders.ts:294` already declares `cost_of_goods_sold.value` on a line and is right; do not rename it. Document the two shapes in a comment at the top of `margin.ts` with the #332 reference.

## Read first (what is on `next`)

- `R/cards/aggregate.ts` — `topProducts`, `categories(orders, products, totals)` (`LocalProduct = { id, categories[{id,name}] }`), the unknown / uncategorised keys; `R/cards/use-local-products.ts` — `useLocalProducts(ids)` over `observeEngineQuery(engine, locale, { collection: 'products', selector: { id: { $in } }, limit })`, `undefined` until the first emission; `R/cards/categories.tsx` — the card; `R/cards/donut.tsx`; `R/cards/index.tsx` — the `cards` array (Brands goes between Categories and Cashiers).
- `R/panels/specs.ts` — `panelSpec(id, inputs) → PanelSpec { keys, head, types, align, rows[{key, cells, raw}], total }` (3d added `keys`, `types` and `raw`; every column has a stable key, a type `text | number | money` and an alignment); `R/panels/panel.tsx` — `DetailPanel`, the footer status line, Print through `buildReportDocument` (3e); `R/panels/document.ts` — the columns come from `keys` / `head` / `types` / `align`, so new columns need all four; `R/panels/export-csv.ts`.
- `packages/database/src/collections/schemas/products.ts:284, 318` — a product's `categories[{id,name,slug}]` and `brands[{id,name,slug}]`, both flat; `schemas/categories.ts:29` — a category's `parent` (0 at the top). Read local categories the way `useLocalProducts` reads products (`collection: 'categories'`).
- `.claude/rules/design.mdc` rules 5, 7, 10.

## What to build

### 1. `R/margin.ts` — pure

- `lineCost(line) → number | null`: `line.cost_of_goods_sold?.value` when it is a finite number, else `null`.
- `marginOf(lines) → { net, cost, profit, marginPct, missing, items }`: `net` = Σ line `total` (net of tax — **gross profit = net sales − COGS**, the ruling), `cost` = Σ `lineCost` over lines that have one, `profit = net − cost`, `marginPct = net ? profit / net : null`, `missing` = lines whose cost is null, `items` = Σ quantity (non-finite as 0). Rounded at `num_decimals`.
- `cogsEnabled(orders, products) → boolean`: any order with an object `cost_of_goods_sold`, or any product with one.
- `topLevelOf(categoryId, tree: Map<id, { id, name, parent }>) → { id, name }`: walk `parent` until 0 or a missing node (at most 10 steps; a missing parent stops at the last known node). `chainLabel(categoryId, tree) → "Coffee › Beans"` (` › ` from `reports.chain_separator`, so translators can change it).
- `brands(orders, products, totals, num_decimals)`: the Categories aggregation over `product.brands[0]` — keys `unknown` (no local product) and `nobrand` (`reports.no_brand`, "No brand"); returns `{ parts, unknownLines, totalLines }` like `categories`.

### 2. The Categories card rolls up to the top level (`R/cards/categories.tsx`, `R/cards/use-local-categories.ts`)

`useLocalCategories(ids)` reads the local categories for the ids the joined products name **and their ancestors**: one `observeEngineQuery` over the ids, then a second over any `parent` ids not yet held, up to three rounds (memoised on the sorted id list; `undefined` until the first emission). The card's donut groups each line's category by `topLevelOf`; the centre label stays "{n} categories" counting the top-level groups; the panel (`specs.ts` `categories`) keeps one row per **assigned** category, labelled by `chainLabel`, sorted by amount. While the categories have not emitted, the card shows its skeleton (the panel its loading line).

### 3. The Brands card (`R/cards/brands.tsx`) and panel

The Categories card's shape over `brands(...)`: `card-brands`, name `reports.card_brands` ("Brands"), the donut with "{n} brands" in the centre, the `card-brands-unknown` line when lines have no local product. **Absent when `cogsEnabled` is false** (not rendered, no slot, no empty state) — the `cards` array filters it by a flag the section reads once from `useReportsData()` + the products the Categories card already loads (lift the products read into the section or a small shared hook so Categories and Brands share one query — one `useLocalProducts` call, not two). When on and there are no brands on any product: the donut's single part is No brand and the line `reports.no_brands_on_products` ("No brands on these products") shows under it (`card-brands-empty`). Panel `brands`: Brand · Qty · Amount · Share (+ the margin columns below), Total; `DetailId` gains `'brands'`.

### 4. Cost / Profit / Margin % columns (`R/panels/specs.ts`, `R/panels/panel.tsx`)

When `cogsEnabled`, the **Top products**, **Categories** and **Brands** specs gain three columns after Amount: Cost (money), Profit (money), Margin % (`reports.percent` of `marginPct × 100`, "—" when null). Per row, `marginOf` over that row's lines (so the aggregations must keep their lines: extend `topProducts`, `categories`, `brands` rows with `lines: OrderLine[]` or compute the margin inside them — your call, but one pass). The Total row carries the sums and the overall margin. `keys` `cost`, `profit`, `margin`; `raw` the numbers; `types` `money | money | number`; `align` right — the printed document and the CSV follow without further change (`document.test.ts` must stay green). Off → the specs are exactly as today (the tests from 3c/3d must pass unchanged when the fixture orders carry no `cost_of_goods_sold`).

**The cost-missing line.** When `cogsEnabled` and `missing > 0` for the panel's rows, the footer status reads `reports.cost_missing_status` ("{count} orders · {total} · cost missing on {n} of {m} items") instead of `reports.panel_status`; testID `detail-panel-cost-missing` on the footer text in that case. Never a Margin % that silently reads 100 %: a row whose cost is entirely missing shows Cost "—", Profit "—", Margin "—" (not 0 / 100 %); a row with some lines missing shows the figures over the lines that have a cost and the footer line names the gap.

### 5. Translations

`reports.card_brands`, `reports.panel_brands` ("Sales by brand"), `reports.n_brands_one/_other`, `reports.no_brand`, `reports.no_brands_on_products`, `reports.col_cost`, `reports.col_profit`, `reports.col_margin` ("Margin %"), `reports.cost_missing_status`, `reports.chain_separator` (" › "). Reuse `common.brand` / `common.cost` if they exist (grep first).

## Ledger

`R/LEDGER.md`: add 33 — margin is a measure on the groupings already built, read from each line's `cost_of_goods_sold.value` (absent or null is cost missing, never 0), gross profit = net sales − COGS, present only when the period's orders or products show the feature on, with no gate of its own; the Brands card is the Categories card over `brands[0]`; the Categories card rolls up to the top-level category through the local categories' `parent` chain while its panel keeps the assigned category with its chain — evidence: wcpos/roadmap#332 §6, #361, the wp-env proof on #332 (2026-09-29), this PR. Add 34 — a panel whose rows miss a cost says so in its footer; a row with no cost at all shows dashes, never 100 % — evidence: #361 "costs unset", this PR.

## Tests (by name)

- `R/margin.test.ts`: "a costed line reads cost_of_goods_sold.value", "a line with cogs_value null and no cost_of_goods_sold is cost missing, not zero", "profit is net sales minus cost and margin is profit over net", "a row with every cost missing has null margin", "cogsEnabled is true from an order-level object alone", "cogsEnabled is false for orders without the key and products without it", "topLevelOf walks parents and stops at a missing node", "chainLabel joins the chain", "brands groups by the product's first brand with unknown and nobrand keys".
- `R/cards/brands.test.tsx`: "absent when the feature is off", "No brand and the empty line when no product has a brand", "names the lines without a local product".
- `R/cards/categories.test.tsx` (+2): "groups a sub-category under its top-level parent in the card", "shows the skeleton until the categories emit".
- `R/panels/specs.test.ts` (+4): "the margin columns appear only when the feature is on", "a row with every cost missing shows dashes", "the total row sums cost and profit and carries the overall margin", "the brands spec".
- `R/panels/panel.test.tsx` (+1): "the footer names the items missing a cost".
- Existing tests unchanged: the 3a–3d fixtures carry no COGS, so every spec and card renders as before.
- Playwright `reports-closures.spec.ts`: the stub's orders carry no COGS, so assert `card-brands` has count 0 and `detail-products` has no `col_cost` head (feature off end to end). You cannot run this spec locally.

## Commands (run before you report; verify by exit status)

```
NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir packages/core exec jest src/screens/main/reports --maxWorkers=2
pnpm --dir packages/core exec eslint src/screens/main/reports --ext .ts,.tsx
pnpm --dir packages/core exec tsc --noEmit
node scripts/check-react-compiler-smells.mjs
pnpm --filter @wcpos/eslint-config test
pnpm translations:check
```

One jest process at a time. Never run prettier on `apps/main/global.css`.

## Out of scope (do not add)

Refund netting and refunds counted by refund date (PR 4b); Where sold (pending the scope ruling); a schema change or migration; fetching products, categories or brands over HTTP (local only; the unknown row names the gap); a Pro check, lock row or setting for margin; a margin figure on the hero or the cards' heads; changes to `R/chart/*`, `R/till-strip.tsx`, `R/bar.tsx`, `R/closures/*`, `pos/**`; gallery cells; plan, status or handoff files.

## Budget

Estimate, changed non-test logic lines before formatting: `margin.ts` 110, `use-local-categories.ts` 40, `cards/brands.tsx` 45, `cards/categories.tsx` +15, `cards/index.tsx` +10, `specs.ts` +70, `panel.tsx` +15, `document.ts` 0, translations ~20. Hard ceiling **400 changed non-test lines**. If you are about to exceed it, STOP and report why instead of continuing; splitting the work into more files or commits does not raise it.

## Fixed lines

- If anything does not work as expected — a missing tool, an install, a permission, a failing baseline you did not cause — stop and say so rather than working around it. A design question means this brief was not ready: name it as `Readiness failure: <question>` and stop.
- Do not push; do not open or edit a PR; do not reply on any PR; do not `git commit` — the orchestrator reviews the diff and commits.
- Your final message is the report: what changed (file by file), what you ran with exit codes, and your line count against the ceiling.
