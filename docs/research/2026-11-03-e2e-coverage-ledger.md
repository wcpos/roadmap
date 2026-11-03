# E2E coverage ledger: what each web E2E block protects, and which are journey-shaped, 2026-11-03

Ticket: [roadmap#515](https://github.com/wcpos/roadmap/issues/515), on the map [roadmap#512](https://github.com/wcpos/roadmap/issues/512); feeds the reorganisation ticket [#516](https://github.com/wcpos/roadmap/issues/516). Read-only against `~/Projects/monorepo-v2/apps/main/e2e` on `main` (2.0) at `1a9220960` ("the Pro closures walk is reconciled with the Reports room and leaves quarantine", #3220), plus `apps/main/playwright*.config.ts`. Context read: `.claude/handoffs/2026-11-03-e2e-after-the-2.0-promotion.md` (monorepo) and [2026-10-14-test-suite-sweep.md](2026-10-14-test-suite-sweep.md). Nothing was run: no Playwright, no Jest, no build.

Labels: **O** Observed (read in a file, path given). **I** Inferred. **NE** Not evaluated.

The full row set, with every testID, is in [2026-11-03-e2e-coverage-ledger.csv](2026-11-03-e2e-coverage-ledger.csv) (same rows as the table in section 2, plus the columns that do not fit here).

## Method

- **O** Every `*.spec.ts` in `apps/main/e2e` (78 files) plus `hostile-headers.ts` (the one non-`.spec` file a project matches: `free-hostile`, `testMatch: /hostile-headers\.ts/`) was parsed with the monorepo's own TypeScript 5.9.3 compiler API. A "block" is one call site of `test(…)` or of any extended fixture whose name ends in `Test` (`authenticatedTest`, `liveTest`, `couponTest`, `isolatedProductTest`, …) with a title and a function argument, including `.only/.fixme/.slow` forms. `test.step`, hooks and `test.skip(cond, reason)` are not blocks.
- **O** testIDs are every `getByTestId(…)` argument inside the block's body ("direct"). The CSV also lists the testIDs reached through helper functions the block calls, resolved transitively across every `e2e/*.ts` file by function name. **I** The helper column over-approximates: a helper that branches (tile or table, pane or dialog) contributes both branches, and two helpers with one name in different files are merged.
- **O** Project scope comes from `playwright.config.ts` `testMatch`/`testIgnore` per project, then from runtime `test.skip(getStoreVariant(…) !== 'pro' | 'free')` guards at test or describe level.
- **O** Quarantine is matched on `quarantine.json` `file` + `title` (describe titles joined by ` › `) + `project`, exactly as `quarantine.ts` `quarantineEntry()` does.
- **O** Durations: `spec-timings.json` holds **per spec file** wall-seconds summed across workers, from GitHub Actions run 33617749219, measured 2026-09-02 (462 results, 3,635 s). It has 36 of the 78 spec files; the other 42 have no number. There is no per-block timing anywhere in the repo, so the ledger gives the file figure; the CSV adds file ÷ blocks as `avg_seconds`, which is **I** (blocks are not equal: one file holds a 30-line smoke next to a 180-line live payment).
- **I** "Prefix-duplicate" means a block whose every step is the opening of a longer block on the same path (the 2026-10-14 sweep's definition). Found by a statement-level prefix comparison of every pair of bodies, then by reading every block under ~25 lines against its neighbours. #2538 (merged 2026-10-13) already removed the sweep's 20 prefix duplicates; the 13 here are what remains.
- Scripts lived in a scratch directory and are not committed (they are not a deliverable).

## 1. Headline counts

| Count | Value | Label |
|---|---:|---|
| Spec files (`*.spec.ts`) | 78 (+ `hostile-headers.ts`) | O |
| Test blocks (call sites) in the 78 spec files | **292** (+1 in `hostile-headers.ts` = 293 rows) | O |
| … of which `products.spec.ts:13` is a wrapper (`productSearchTest(title)`) called twice (lines 74, 98) | +1 declared test | O |
| … of which inside loops (captures 8 × 12 combos, `checkout-device` × 4 scenarios, `reports-closures` × 2 viewports, coupon specs × stores, perf × 6 routes / × 9 dropdowns) | 16 call sites | O |
| Blocks that never request `page`/`posPage`/`context` | 87 (84 harness pure-logic, 2 probe-provisioning guards, 1 Electron perf that launches its own app); the 2 `store-pick.unit` blocks use a static page and no store | O |
| `.unit.spec.ts` files / blocks | 4 / 30 (`money-oracle-guards` 11, `order-lifecycle` 11, `permalink-transport` 6, `store-pick` 2) | O |
| Other pure-logic blocks living in ordinary `.spec.ts` files | 56 (`search-probe.spec.ts` 31 of its 33, `order-cleanup` 8, `store-login-retry` 5, `quarantine` 4, `coupon-probe` 3, `cashier-slot` 2, `politeness-1129.live` 3) | O |
| Quarantined (`quarantine.json`, ledger [monorepo#2284](https://github.com/wcpos/monorepo/issues/2284)) | 14 entries = **7 blocks × 2 projects**, groups G2 (1), G4 (2), G6 (1), G7 (3) | O |
| Perf / ceiling gates | 11 blocks: 5 in default CI (`pos-cart:58` 300 ms, `pos-cart:69` 8 s, `search-heap:93`, `search-latency:44`, and the request-shape gate `search-walk:71`), 6 opt-in (4 `.perf`, `politeness-1129.live:241`, `tick-403-soak.live:95`). 3 of the 5 CI gates are quarantined | O |
| Opt-in `.live` (own configs, never in the CI matrix) | 7 files / 11 blocks (3 of them pure logic) | O |
| Opt-in `.perf` (`playwright.search-performance.config.ts`) | 3 files / 6 blocks | O |
| Opt-in `.cold` (`pro-cold-start`, `E2E_COLD_START=1`) | 1 file / 2 blocks | O |
| Opt-in `CAPTURES=1` (collected in both authenticated projects, skipped at runtime) | 7 files / 8 blocks (96 runs when on) | O |
| Distinct testIDs depended on directly / including via helpers | 445 / 562 | O (helper figure I, over-approximate) |
| Most-used direct testIDs | `search-products` 43 blocks, `checkout-button` 19, `data-table-count` 18, `screen-pos` 13, `no-data-message` 13, `receipt-new-sale` 12 | O |

**Per project (static, from the config and runtime variant guards):**

| Project | When it exists | Blocks collected | − other-variant skips | − captures | − quarantined | = blocks that run (before store-capability skips) | of which no browser |
|---|---|---:|---:|---:|---:|---:|---:|
| `pro-authenticated` | always | 261 | 7 | 8 | 7 | **239** | 83 |
| `free-authenticated` | only when `E2E_STORE_URL_FREE` is set (main names dev-free) | 244 | 40 | 8 | 7 | **189** | 83 |
| `free-unauthenticated` | with free | 12 (`auth` 6, `rest-route-transport` 1, `host-blocked-errors` 5) | 0 | 0 | 0 | 12 | 0 |
| `pro-unauthenticated` | always | 6 (`auth`) | 0 | 0 | 0 | 6 | 0 |
| `free-hostile` | with free | 1 (`hostile-headers.ts`) | 0 | 0 | 0 | 1 | 0 |
| `pro-cold-start` | `E2E_COLD_START=1` | 2 | 0 | 0 | 0 | 2 | 0 |

- **O** The wrapper in `products.spec.ts` adds one more test to each authenticated project; the loops add `checkout-device` +3 (pro only) and `reports-closures` +2 per project. **NE** How many blocks a run actually skips for store capability (writer credentials, "store declares no manual cash method", "no simulated terminal provider") — that depends on the store and is not in the source.
- **O** `rest-route-transport.spec.ts` and `host-blocked-errors.spec.ts` are matched ONLY by `free-unauthenticated` and ignored by `pro-authenticated`, so with no free store named they do not run anywhere.
- **I** The ticket's "241" is not reproduced by any single rule. 292 − 30 `.unit` − 11 `.live` − 8 captures − 2 `.cold` = 241 is one decomposition; `pro-authenticated` running 239 is another near-miss. `TEST-PLAN.md` (121 tests / 15 files) is stale, as the brief said (**O**).

## 2. Per spec file

| Spec file | Blocks | spec-timings s | Projects | Opt-in |
|---|---:|---:|---|---|
| `auth-captures.spec.ts` | 2 | — | free+pro | CAPTURES=1 |
| `auth.spec.ts` | 6 | 66.4 | unauth (free+pro) | — |
| `cashier-slot.spec.ts` | 2 | 0.9 | free+pro | — |
| `checkout-device.spec.ts` | 1 | — | pro (free excluded at collection) | — |
| `checkout-offline-tender.spec.ts` | 2 | — | pro (runtime skip on free) | — |
| `checkout-tender.spec.ts` | 13 | — | pro (free excluded at collection) | — |
| `checkout-terminal.spec.ts` | 7 | — | pro (runtime skip on free) | — |
| `coupon-probe.spec.ts` | 3 | — | free+pro | — |
| `coupons-captures.spec.ts` | 1 | — | free+pro | CAPTURES=1 |
| `coupons.spec.ts` | 3 | 54.9 | free (runtime skip on pro), pro (runtime skip on free) | — |
| `customer-picker-paging.spec.ts` | 1 | 38.2 | free+pro | — |
| `customers-captures.spec.ts` | 1 | — | free+pro | CAPTURES=1 |
| `customers.spec.ts` | 7 | 105.3 | free (runtime skip on pro), free+pro, pro (runtime skip on free) | — |
| `ghost-prune.live.spec.ts` | 2 | — | ghostprune config (free) | .live |
| `header.spec.ts` | 2 | 42.1 | free (runtime skip on pro), free+pro | — |
| `host-blocked-errors.spec.ts` | 5 | 29.4 | free-unauth only | — |
| `hostile-headers.ts` | 1 | — | free-hostile only | — |
| `idle-backfill.live.spec.ts` | 1 | — | soak config (store from SOAK_STORE_URL) | .live |
| `live-tab.spec.ts` | 3 | — | free+pro | — |
| `logs.spec.ts` | 5 | 90.1 | free+pro | — |
| `money-oracle-guards.unit.spec.ts` | 11 | 3.5 | free+pro | — |
| `navigation.spec.ts` | 7 | 115.4 | free+pro | — |
| `order-cleanup.spec.ts` | 8 | 3.3 | free+pro | — |
| `order-lifecycle.unit.spec.ts` | 11 | 4.1 | free+pro | — |
| `orders-captures.spec.ts` | 1 | — | free+pro | CAPTURES=1 |
| `orders.spec.ts` | 5 | 83.7 | free (runtime skip on pro), pro (runtime skip on free) | — |
| `permalink-transport.unit.spec.ts` | 6 | 2.8 | free+pro | — |
| `politeness-1129.live.spec.ts` | 4 | — | own .live config (pro) | .live |
| `pos-browse-by.spec.ts` | 1 | — | free+pro | — |
| `pos-cart-toast-burst.spec.ts` | 1 | — | free+pro | — |
| `pos-cart.spec.ts` | 14 | 278.6 | free+pro | — |
| `pos-checkout.spec.ts` | 10 | 319.8 | free+pro | — |
| `pos-coupon-apply.spec.ts` | 1 | 210.0 | free+pro | — |
| `pos-coupon-checkout.spec.ts` | 2 | — | pro (runtime skip on free) | — |
| `pos-filter-bar.spec.ts` | 3 | — | free+pro | — |
| `pos-money-oracle.spec.ts` | 7 | 198.8 | free+pro | — |
| `pos-offline-new-customer.spec.ts` | 2 | — | pro (runtime skip on free) | — |
| `pos-open-orders-switching.spec.ts` | 1 | 23.8 | free+pro | — |
| `pos-panel-resize.spec.ts` | 1 | 12.3 | free+pro | — |
| `pos-refunds.spec.ts` | 3 | 49.3 | pro (runtime skip on free) | — |
| `pos-scroll-settings.spec.ts` | 1 | 31.8 | free+pro | — |
| `pos-variation-popover-states.spec.ts` | 4 | 81.6 | free+pro | — |
| `pos-variation-stock-pill.spec.ts` | 1 | 22.5 | free+pro | — |
| `pos-variations-drill-in.spec.ts` | 2 | — | free+pro | — |
| `pos-variations.spec.ts` | 7 | 246.3 | free+pro | — |
| `pro425-store-pricing.live.spec.ts` | 1 | — | own .live config (pro) | .live |
| `product-category-filter.spec.ts` | 1 | 26.1 | free+pro | — |
| `product-visibility.spec.ts` | 1 | 144.5 | free+pro | — |
| `products-captures.spec.ts` | 1 | — | free+pro | CAPTURES=1 |
| `products-page.spec.ts` | 11 | 178.4 | free (runtime skip on pro), pro (runtime skip on free) | — |
| `products.spec.ts` | 7 | 189.4 | free+pro | — |
| `protocol-signal.spec.ts` | 1 | 15.5 | free+pro | — |
| `quarantine.spec.ts` | 4 | — | free+pro | — |
| `register-bar.spec.ts` | 1 | — | free+pro | — |
| `register-captures.spec.ts` | 1 | — | free+pro | CAPTURES=1 |
| `register-closure.spec.ts` | 1 | — | free+pro | — |
| `register-count.spec.ts` | 1 | — | free+pro | — |
| `register-session.spec.ts` | 1 | — | free+pro | — |
| `reports-closures.spec.ts` | 2 | — | free+pro | — |
| `reports.spec.ts` | 5 | 62.3 | free (runtime skip on pro), pro (runtime skip on free) | — |
| `rest-route-transport.spec.ts` | 1 | 56.4 | free-unauth only | — |
| `search-heap.spec.ts` | 1 | — | free+pro | — |
| `search-latency.spec.ts` | 1 | — | free+pro | — |
| `search-probe.spec.ts` | 33 | 41.1 | free+pro | — |
| `search-responsiveness-probe.perf.spec.ts` | 2 | — | search-performance config (pro) | .perf |
| `search-responsiveness.electron.perf.spec.ts` | 1 | — | search-performance config (pro) | .perf + E2E_ELECTRON_EXECUTABLE |
| `search-responsiveness.perf.spec.ts` | 3 | — | search-performance config (pro) | .perf |
| `search-terms.spec.ts` | 2 | — | free+pro | — |
| `search-walk.spec.ts` | 1 | — | free+pro | — |
| `server-created-visibility.spec.ts` | 3 | 648.7 | pro (free excluded at collection) | — |
| `server-down-1135.live.spec.ts` | 1 | — | own .live config (pro) | .live |
| `session-recovery.live.spec.ts` | 1 | — | own .live config (pro) | .live |
| `settings-captures.spec.ts` | 1 | — | free+pro | CAPTURES=1 |
| `settings.spec.ts` | 9 | 162.6 | free+pro | — |
| `store-login-retry.spec.ts` | 5 | — | free+pro | — |
| `store-pick.unit.spec.ts` | 2 | — | free+pro | — |
| `tick-403-soak.live.spec.ts` | 1 | — | soak config (store from SOAK_STORE_URL) | .live |
| `update-required.spec.ts` | 2 | 28.2 | free+pro | — |
| `variation-sku-search.cold.spec.ts` | 2 | — | pro-cold-start | .cold (E2E_COLD_START=1) |

**O** Durations are the `spec-timings.json` per-file seconds (2026-09-02); "—" means the file has no measurement. Of the 42 unmeasured files, the heavier live ones are `checkout-tender`, `checkout-terminal`, `checkout-offline-tender`, `pos-coupon-checkout`, `pos-offline-new-customer`, `reports-closures` and the three `register-*` specs. **NE** Their durations.

## 3. The ledger (one row per block)

Columns: **Protects** is the screen or feature (from the title, the body and the file's own header comment; **I** where the title alone did not say). **testIDs** are the first four direct ones; the CSV carries every direct testID and every testID reached via helpers. **Scope**: `free+pro` = collected and run in both authenticated projects; `pro (runtime skip on free)` = collected in both, skipped on free by a variant guard; `pro (free excluded at collection)` = in `free-authenticated`'s `testIgnore`. **Group** keys are the journeys and remainder groups in section 4. "(no browser)" marks a block that never requests a page. **Prefix-duplicate** rows are **I** with the basis in the CSV `prefix_basis` column (most are Observed statement-for-statement; two are Inferred through helpers).

| # | spec:line | Title (describe › test) | Protects | testIDs (direct; CSV has all + via helpers) | Scope | Quarantine | Perf gate | Opt-in / expansion | Prefix-duplicate of | Group |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | `auth-captures.spec.ts:44` | ${device}-${colorScheme}-${step} › first run, typing and discovery error | Connect screen captures | `connect-error-message`, `connect-store-button`, `store-url-input` | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 2 | `auth-captures.spec.ts:55` | ${device}-${colorScheme}-${step} › saved account, store selection and Open POS | Connect screen captures | `/^store-option-/`, `open-pos-button`, `register-bar-avatar`, `user-sheet-sign-out` +1 | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 3 | `auth.spec.ts:13` | Connect Screen › connect form controls and URL enablement | Connect screen | `connect-store-button`, `enter-demo-store-button`, `store-url-input` | unauth (free+pro) | — | — | — | — | N5 |
| 4 | `auth.spec.ts:24` | Connect Screen › should not connect to invalid store URL | Connect screen | `connect-store-button`, `logged-in-users-label`, `store-url-input` | unauth (free+pro) | — | — | — | — | N5 |
| 5 | `auth.spec.ts:33` | Connect Screen › discovers a store at an internationalised (IDN) address | Connect screen | `add-user-button`, `connect-store-button`, `logged-in-users-label`, `store-url-input` | unauth (free+pro) | — | — | — | — | N5 |
| 6 | `auth.spec.ts:55` | Connect Screen › discover store and show add-user action | Connect screen | `add-user-button`, `connect-store-button`, `logged-in-users-label`, `store-url-input` | unauth (free+pro) | — | — | — | — | N5 |
| 7 | `auth.spec.ts:75` | Unauthenticated Navigation › should show connect screen when not logged in | Connect screen | `connect-store-button`, `store-url-input` | unauth (free+pro) | — | — | — | auth.spec.ts:13 connect form controls and URL enablement | N5 |
| 8 | `auth.spec.ts:83` | Unauthenticated Navigation › should handle unknown routes gracefully | Connect screen | `connect-store-button`, `not-found-screen` | unauth (free+pro) | — | — | — | — | N5 |
| 9 | `cashier-slot.spec.ts:4` | maps indices 0..7 collision-free within each event band | E2E cashier-slot band mapping (no browser) | — | free+pro | — | — | — | — | N1 |
| 10 | `cashier-slot.spec.ts:13` | selects the band by event name and falls back to the local band | E2E cashier-slot band mapping (no browser) | — | free+pro | — | — | — | — | N1 |
| 11 | `checkout-device.spec.ts:113` | POS device capture with the simulated driver (live store) › «scenario» | Simulated reader device capture at checkout (approve/decline/cancel/tip) | `checkout-method-${device!.id}`, `checkout-receipt-stage`, `checkout-terminal-cancel`, `checkout-terminal-retry` | pro (free excluded at collection) | — | — | x4 scenarios | — | J11 |
| 12 | `checkout-offline-tender.spec.ts:236` | POS offline cash tender (live store, ADR 0040 Decided 1) › records a cash sale offline, tells … | Offline cash tender journalled and adopted on reconnect (ADR 0040) | `checkout-tender-pane`, `orders-attention`, `receipt-awaiting-store`, `receipt-new-sale` +4 | pro (runtime skip on free) | — | — | — | — | J8 |
| 13 | `checkout-offline-tender.spec.ts:270` | POS offline cash tender (live store, ADR 0040 Decided 1) › a cashier who moves on before the l… | Offline cash tender journalled and adopted on reconnect (ADR 0040) | `checkout-receipt-stage`, `checkout-tender-pane`, `open-order-chip-${sale.uuid}`, `open-order-tab-${sale.uuid}` +1 | pro (runtime skip on free) | — | — | — | — | J8 |
| 14 | `checkout-tender.spec.ts:139` | POS two-pane checkout (live store) › renders the tender checkout with the order balance | Tender pane renders order balance | — (19 via helpers) | pro (free excluded at collection) | — | — | — | — | J2 |
| 15 | `checkout-tender.spec.ts:162` | POS two-pane checkout (live store) › takes the full balance in cash and the server records one… | Full cash tender, one captured leg | `checkout-method-${cash!.id}`, `checkout-receipt-stage`, `checkout-tender-pane`, `pos-products-panel` +3 | pro (free excluded at collection) | — | — | — | — | J2 |
| 16 | `checkout-tender.spec.ts:212` | POS two-pane checkout (live store) › auto-prints the receipt on the receipt stage when the set… | Auto-print receipt on receipt stage | `checkout-method-${cash!.id}`, `checkout-receipt-stage`, `checkout-tender-pane`, `receipt-new-sale` +1 | pro (free excluded at collection) | — | — | — | — | J9 |
| 17 | `checkout-tender.spec.ts:280` | POS two-pane checkout (live store) › splits a payment across two tenders and the server record… | Split across two tenders, two legs | `checkout-method-${second!.id}`, `checkout-receipt-stage`, `checkout-tender-pane`, `pos-products-panel` +4 | pro (free excluded at collection) | — | — | — | — | J3 |
| 18 | `checkout-tender.spec.ts:347` | POS two-pane checkout (live store) › refuses an over-tender on a method that cannot give change | Over-tender refused on no-change method | `checkout-commit`, `checkout-entry-hint`, `checkout-quick-balance` | pro (free excluded at collection) | — | — | — | — | J3 |
| 19 | `checkout-tender.spec.ts:372` | POS two-pane checkout (live store) › splits evenly through the split view and records two legs | Split evenly via split view | `/^checkout-plan-leg-\d+$/`, `checkout-label`, `checkout-method-${cash!.id}`, `checkout-paid` +8 | pro (free excluded at collection) | — | — | — | — | J3 |
| 20 | `checkout-tender.spec.ts:440` | POS two-pane checkout (live store) › shares a ticked line between two payments | Shared ticked line between two payments | `/^checkout-plan-leg-\d+$/`, `/^checkout-split-item-/`, `checkout-method-${cash!.id}`, `checkout-paid` +6 | pro (free excluded at collection) | — | — | — | — | J3 |
| 21 | `checkout-tender.spec.ts:513` | POS two-pane checkout (live store) › shows the Paid moment for a cash sale with change | Paid moment with change | `checkout-entry-hint`, `checkout-paid`, `receipt-change-due`, `receipt-new-sale` | pro (free excluded at collection) | — | — | — | — | J9 |
| 22 | `checkout-tender.spec.ts:540` | POS two-pane checkout (live store) › shows the offline badge when the till loses the store | Offline badge when till loses store | `checkout-offline` | pro (free excluded at collection) | — | — | — | — | J8 |
| 23 | `checkout-tender.spec.ts:556` | POS two-pane checkout (live store) › preserves a partly paid cart while a second cart complete… | Partly paid cart survives second cart checkout | `checkout-ledger`, `checkout-receipt-stage`, `checkout-server-order-id`, `checkout-tender-pane` +10 | pro (free excluded at collection) | — | — | — | — | J4 |
| 24 | `checkout-tender.spec.ts:631` | POS two-pane checkout (live store) › cancels mid-split, listing the cash to return, and voids … | Cancel mid-split lists cash to return, voids leg | `checkout-cancel-leg-${rowId}`, `checkout-cancel-payment`, `checkout-tender-pane`, `pos-products-panel` +2 | pro (free excluded at collection) | — | — | — | — | J3 |
| 25 | `checkout-tender.spec.ts:703` | POS two-pane checkout (live store) › on a phone › lands on the phone Products tab after New sa… | Phone: New sale lands on Products tab (#2363) | `checkout-method-${cash!.id}`, `checkout-receipt-stage`, `drawer-item-orders`, `drawer-item-pos` +6 | pro (free excluded at collection) | — | — | — | — | J2 |
| 26 | `checkout-tender.spec.ts:810` | POS declared UI: a gateway that sends the customer away (live store) › sends an invoice, sends… | Send-away gateway: invoice, resend, cancel from Orders | `checkout-button`, `checkout-commit`, `checkout-field-${emailField.id}`, `checkout-fields` +14 | pro (free excluded at collection) | — | — | — | — | J11 |
| 27 | `checkout-terminal.spec.ts:101` | POS terminal (server capture-mode) checkout (live store) › approves and closes the leg | Server capture-mode terminal leg lifecycle | `checkout-commit`, `checkout-keypad`, `checkout-method-${terminal!.id}`, `checkout-reader-sim-approve` +2 | pro (runtime skip on free) | — | — | — | — | J11 |
| 28 | `checkout-terminal.spec.ts:163` | POS terminal (server capture-mode) checkout (live store) › declines, then retries as a NEW row | Server capture-mode terminal leg lifecycle | `checkout-keypad`, `checkout-method-${terminal!.id}`, `checkout-reader-sim-approve`, `checkout-reader-sim-decline` +3 | pro (runtime skip on free) | — | — | — | — | J11 |
| 29 | `checkout-terminal.spec.ts:225` | POS terminal (server capture-mode) checkout (live store) › cancel is a request; a late capture… | Server capture-mode terminal leg lifecycle | `checkout-method-${terminal!.id}`, `checkout-reader-sim-late-capture`, `checkout-terminal-status` | pro (runtime skip on free) | — | — | — | — | J11 |
| 30 | `checkout-terminal.spec.ts:264` | POS terminal (server capture-mode) checkout (live store) › deadline voids the leg | Server capture-mode terminal leg lifecycle | `checkout-method-${terminal!.id}`, `checkout-reader-sim-expire`, `checkout-terminal-another`, `checkout-terminal-retry` +1 | pro (runtime skip on free) | — | — | — | — | J11 |
| 31 | `checkout-terminal.spec.ts:313` | POS terminal (server capture-mode) checkout (live store) › leaving and reopening resumes the s… | Server capture-mode terminal leg lifecycle | `checkout-entry`, `checkout-method-${terminal!.id}`, `checkout-reader-sim-slow`, `checkout-tender-pane` +6 | pro (runtime skip on free) | — | — | — | — | J11 |
| 32 | `checkout-terminal.spec.ts:370` | POS terminal (server capture-mode) checkout (live store) › reloading mid-capture completes onc… | Server capture-mode terminal leg lifecycle | `/^logs-attempts-/`, `/^logs-detail-/`, `/^logs-row-/`, `checkout-method-${terminal!.id}` +10 | pro (runtime skip on free) | — | — | — | — | J11 |
| 33 | `checkout-terminal.spec.ts:464` | POS terminal (server capture-mode) checkout (live store) › a reader held by another order is d… | Server capture-mode terminal leg lifecycle | `checkout-method-${terminal!.id}`, `checkout-reader-sim-approve`, `checkout-reader-sim-stuck`, `checkout-reader-sim-stuck-reason` +7 | pro (runtime skip on free) | — | — | — | — | J11 |
| 34 | `coupon-probe.spec.ts:25` | coupon-probe orphan selection › sweeps only stamped probe coupons older than the orphan age | Probe-coupon orphan sweep selector (no browser) | — | free+pro | — | — | — | — | N1 |
| 35 | `coupon-probe.spec.ts:42` | coupon-probe orphan selection › a merchant coupon never qualifies, whatever its age | Probe-coupon orphan sweep selector (no browser) | — | free+pro | — | — | — | — | N1 |
| 36 | `coupon-probe.spec.ts:51` | coupon-probe orphan selection › anything but a list selects nothing | Probe-coupon orphan sweep selector (no browser) | — | free+pro | — | — | — | — | N1 |
| 37 | `coupons-captures.spec.ts:70` | ${device}-${colorScheme}-${step} › reachable coupons states | Coupons page captures | `/^data-table-row-/`, `/^data-table-skeleton-/`, `coupon-filter-status-publish`, `coupon-filter-type-percent` +13 | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 38 | `coupons.spec.ts:28` | Coupons Page (Pro) › Coupons page initial state | Coupons page | `coupons-add-button`, `data-table-count`, `no-data-message`, `search-coupons` | pro (runtime skip on free) | — | — | — | — | J14 |
| 39 | `coupons.spec.ts:53` | Coupons Page (Pro) › should search coupons | Coupons page | `/^data-table-row-/`, `search-coupons`, `«LOADED_COUNT_TEST_ID»`, `«nonMatchingRowTestIdasstring»` | pro (runtime skip on free) | — | — | — | — | J14 |
| 40 | `coupons.spec.ts:120` | Coupons Page (Free) › should show View Demo button on upgrade overlay | Coupons upgrade overlay View Demo | `upgrade-title`, `view-demo-button` | free (runtime skip on pro) | — | — | — | — | J19 |
| 41 | `customer-picker-paging.spec.ts:94` | POS customer picker › reaches past the first page as the list scrolls | Cart customer picker pages past 50 rows (#1553) | `/^customer-select-option-/`, `cart-customer-name`, `cart-customer-select` | free+pro | — | — | — | — | J3 |
| 42 | `customers-captures.spec.ts:70` | ${device}-${colorScheme}-${step} › reachable customers states | Customers page captures | `/^data-table-row-/`, `/^data-table-skeleton-/`, `customers-bar-display`, `customers-display-options` +7 | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 43 | `customers.spec.ts:28` | Customers in POS › opens the customer picker from the name and the address editor from the pin | Customer chip opens picker; pin opens address editor | `cart-customer-address`, `cart-customer-name`, `cart-customer-select`, `customer-address-dialog` | free+pro | — | — | — | — | J3 |
| 44 | `customers.spec.ts:67` | Add Customer from Cart (Pro) › should create a customer from the cart and attach it to the ord… | Create customer from cart and attach | `add-customer-dialog`, `cart-customer-name`, `customer-email-input`, `customer-first-name-input` +3 | pro (runtime skip on free) | — | — | — | — | J3 |
| 45 | `customers.spec.ts:98` | Add Customer from Cart (Pro) › should show customer form fields in dialog | Add-customer dialog shows fields | `menu-add-customer` | pro (runtime skip on free) | — | — | — | customers.spec.ts:67 should create a customer from the cart ... | J3 |
| 46 | `customers.spec.ts:121` | Add Customer from Cart (Free) › should show add-customer menu item disabled for free users | Add-customer disabled on Free | `menu-add-customer` | free (runtime skip on pro) | — | — | — | — | J19 |
| 47 | `customers.spec.ts:138` | Customers Page (Pro) › Customers page initial state | Customers page initial state | `customers-add-button`, `data-table-count`, `no-data-message`, `screen-customers` +1 | pro (runtime skip on free) | — | — | — | — | J14 |
| 48 | `customers.spec.ts:163` | Customers Page (Pro) › should search customers | Customers page search (probe) | `/^data-table-row-/`, `screen-customers`, `search-customers`, `«LOADED_COUNT_TEST_ID»` | pro (runtime skip on free) | — | — | — | — | J14 |
| 49 | `customers.spec.ts:220` | Customers Page (Free) › should show View Demo button on upgrade overlay | Customers upgrade overlay View Demo | `upgrade-title`, `view-demo-button` | free (runtime skip on pro) | — | — | — | — | J19 |
| 50 | `ghost-prune.live.spec.ts:318` | #1284 ghost residents live proof › mint a frozen profile holding a real ghost | #1284 ghost residents prune (frozen profile A/B) | — (22 via helpers) | ghostprune config (free) | — | — | .live | — | N8 |
| 51 | `ghost-prune.live.spec.ts:362` | #1284 ghost residents live proof › A/B: ghost residency after manual passes on the served bund… | #1284 ghost residents prune (frozen profile A/B) | — (7 via helpers) | ghostprune config (free) | — | — | .live | — | N8 |
| 52 | `header.spec.ts:6` | Register bar (the POS has no title bar) › should show the cashier avatar on the bar | Register bar / upgrade banner | `header-title-container`, `register-bar-avatar` | free+pro | — | — | — | register-bar.spec.ts:5 POS uses the register bar and opens the cashier sheet | J1 |
| 53 | `header.spec.ts:20` | Upgrade Banner (Free) › should show upgrade banner for free users | Free upgrade banner | `upgrade-notice-banner` | free (runtime skip on pro) | — | — | — | — | J19 |
| 54 | `host-blocked-errors.spec.ts:125` | AUTH431 names REST transport blocked when both auth routes are absent | Connect-time host-blocked error codes (AUTH431/421, HOST121/151/141) | — (5 via helpers) | free-unauth only | — | — | — | — | N4 |
| 55 | `host-blocked-errors.spec.ts:140` | AUTH421 names hosts that strip every credential channel | Connect-time host-blocked error codes (AUTH431/421, HOST121/151/141) | — (5 via helpers) | free-unauth only | — | — | — | — | N4 |
| 56 | `host-blocked-errors.spec.ts:157` | HOST121 names bot challenges blocking the API | Connect-time host-blocked error codes (AUTH431/421, HOST121/151/141) | — (5 via helpers) | free-unauth only | — | — | — | — | N4 |
| 57 | `host-blocked-errors.spec.ts:170` | HOST151 blocks an authenticated echo replayed from shared cache | Connect-time host-blocked error codes (AUTH431/421, HOST121/151/141) | — (5 via helpers) | free-unauth only | — | — | — | — | N4 |
| 58 | `host-blocked-errors.spec.ts:197` | HOST141 warns when search-like ping requests are blocked without blocking connect | Connect-time host-blocked error codes (AUTH431/421, HOST121/151/141) | `logged-in-users-label`, `toast-HOST141` | free-unauth only | — | — | — | — | N4 |
| 59 | `hostile-headers.ts:55` | census and order browse survive stripped Tier 2 headers | Census and order browse with stripped Tier 2 headers | `data-table-count`, `data-table-loaded-count`, `error-toast`, `no-data-message` +5 | free-hostile only | — | — | — | — | N4 |
| 60 | `idle-backfill.live.spec.ts:164` | idle POS trickles products+variations and manual check refreshes totals | Idle trickle lanes and manual census (soak) | `db-check-everything`, `health-nav-database`, `screen-health-database` | soak config (store from SOAK_STORE_URL) | — | — | .live | — | N9 |
| 61 | `live-tab.spec.ts:7` | a write defers takeover, then the ceiling allows it to proceed | Second-tab park/takeover and write-hold ceiling | `parked-tab`, `parked-tab-take-over`, `«LOADED_COUNT_TEST_ID»` | free+pro | — | — | — | — | N11 |
| 62 | `live-tab.spec.ts:43` | an unanswered request explains how to continue, but closing the holder still grants ownership | Second-tab park/takeover and write-hold ceiling | `parked-tab`, `parked-tab-take-over`, `«LOADED_COUNT_TEST_ID»` | free+pro | — | — | — | — | N11 |
| 63 | `live-tab.spec.ts:80` | second tab parks, takes over, and the former holder can take it back | Second-tab park/takeover and write-hold ceiling | `parked-tab`, `parked-tab-take-over`, `«LOADED_COUNT_TEST_ID»` | free+pro | — | — | — | — | N11 |
| 64 | `logs.spec.ts:14` | Store health · Logs › shows the stat header, preset chips and the flat ledger | Store health · Logs ledger | `logs-chip-actions`, `logs-chip-all`, `logs-chip-errors`, `logs-chip-sync` +12 | free+pro | — | — | — | — | J17 |
| 65 | `logs.spec.ts:43` | Store health · Logs › expands a ledger row to its inline detail | Store health · Logs ledger | — (4 via helpers) | free+pro | — | — | — | — | J17 |
| 66 | `logs.spec.ts:54` | Store health · Logs › filters the ledger via the sync preset chip | Store health · Logs ledger | `logs-chip-actions`, `logs-chip-all`, `logs-chip-sync`, `logs-ledger` | free+pro | — | — | — | — | J17 |
| 67 | `logs.spec.ts:83` | Store health · Logs › the ledger starts directly below the controls, not down the page | Store health · Logs ledger | `logs-chip-verbose`, `logs-ledger` | free+pro | — | — | — | — | J17 |
| 68 | `logs.spec.ts:102` | Store health · Logs › searches logs without breaking the ledger | Store health · Logs ledger | `logs-ledger`, `search-logs` | free+pro | — | — | — | — | J17 |
| 69 | `money-oracle-guards.unit.spec.ts:25` | assertDiscriminating › THROWS when every per-rate tax lands on the store precision (the origin… | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 70 | `money-oracle-guards.unit.spec.ts:34` | assertDiscriminating › passes when a per-rate tax carries content below the store precision | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 71 | `money-oracle-guards.unit.spec.ts:38` | assertDiscriminating › respects the store precision — 0.555 discriminates at 2dp but NOT at 3dp | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 72 | `money-oracle-guards.unit.spec.ts:45` | assertDiscriminating › THROWS at dp=0 on a whole unit, where the spread is widest (JPY) | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 73 | `money-oracle-guards.unit.spec.ts:52` | assertDiscriminating › THROWS when the line type under test carries no taxes at all | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 74 | `money-oracle-guards.unit.spec.ts:62` | assertDiscriminating › is SCOPED — a discriminating product tax cannot vouch for the fee under… | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 75 | `money-oracle-guards.unit.spec.ts:71` | assertMixedTaxTreatment › THROWS on a taxed line beside an untaxed one (the original hole) | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 76 | `money-oracle-guards.unit.spec.ts:78` | assertMixedTaxTreatment › passes on two distinct rate sets plus an untaxed line | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 77 | `money-oracle-guards.unit.spec.ts:89` | assertMixedTaxTreatment › THROWS when no untaxed line ran — the other half of the cart | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 78 | `money-oracle-guards.unit.spec.ts:96` | assertMixedTaxTreatment › THROWS when both taxed lines share a rate set — same class twice is … | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 79 | `money-oracle-guards.unit.spec.ts:107` | assertMixedTaxTreatment › is order-insensitive on the rate set — [6,8] and [8,6] are one signa… | Money-oracle coverage guards (no browser) | — | free+pro | — | — | — | — | N1 |
| 80 | `navigation.spec.ts:6` | Authenticated Navigation › should show the POS screen after login | Drawer navigation and viewports | `search-products` | free+pro | — | — | — | navigation.spec.ts:15 should be responsive on desktop viewport | J18 |
| 81 | `navigation.spec.ts:10` | Authenticated Navigation › should be responsive on mobile viewport | Drawer navigation and viewports | `search-products` | free+pro | — | — | — | — | J18 |
| 82 | `navigation.spec.ts:15` | Authenticated Navigation › should be responsive on desktop viewport | Drawer navigation and viewports | `cart-customer-name`, `search-products` | free+pro | — | — | — | — | J18 |
| 83 | `navigation.spec.ts:23` | Drawer Navigation › should have all sidebar navigation buttons | Drawer navigation and viewports | `drawer-item-${route}` | free+pro | — | — | — | — | J18 |
| 84 | `navigation.spec.ts:41` | Drawer Navigation › drawer items below the fold stay reachable on very short viewports | Short viewport: drawer scrolls to bottom items (#1425) | `drawer-item-health`, `health-nav-logs`, `pos-drawer-open-button` | free+pro | — | — | — | — | J18 |
| 85 | `navigation.spec.ts:58` | Drawer Navigation › should navigate to Support page | Drawer navigation and viewports | `screen-support` | free+pro | — | — | — | — | J18 |
| 86 | `navigation.spec.ts:65` | Drawer Navigation › should navigate to a page and back to POS | Drawer navigation and viewports | `health-nav-logs`, `screen-logs`, `screen-pos`, `search-logs` +1 | free+pro | — | — | — | — | J18 |
| 87 | `order-cleanup.spec.ts:18` | order-cleanup pure logic › extractOrderIdFromPushBody reads bare and enveloped shapes | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 88 | `order-cleanup.spec.ts:26` | order-cleanup pure logic › extractOrderNumberFromPushBody reads bare and enveloped shapes, fal… | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 89 | `order-cleanup.spec.ts:36` | order-cleanup pure logic › extractOrderIdFromPushBody rejects non-positive-integer ids and junk | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 90 | `order-cleanup.spec.ts:46` | order-cleanup pure logic › shouldFinalizeStatus only accepts finalize-able statuses | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 91 | `order-cleanup.spec.ts:55` | order-cleanup pure logic › finalize policy: pos-open is finalized, cancelled is the terminal t… | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 92 | `order-cleanup.spec.ts:62` | order-cleanup pure logic › selectOrdersToFinalize keeps only pos-open, drops fixtures, dedupes | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 93 | `order-cleanup.spec.ts:75` | order-cleanup pure logic › selectOrdersToFinalize respects a custom retain set | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 94 | `order-cleanup.spec.ts:83` | order-cleanup pure logic › chunk splits into fixed-size groups without dropping items | Order teardown decision functions (no browser) | — | free+pro | — | — | — | — | N1 |
| 95 | `order-lifecycle.unit.spec.ts:13` | expectRateSetParity › accepts matching numeric rate sets in any order and spelling | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 96 | `order-lifecycle.unit.spec.ts:17` | expectRateSetParity › treats missing arrays as the empty set (tax-free stores) | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 97 | `order-lifecycle.unit.spec.ts:21` | expectRateSetParity › fails on a set mismatch | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 98 | `order-lifecycle.unit.spec.ts:27` | expectRateSetParity › rejects a BLANK server rate_id instead of coercing it to rate 0 | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 99 | `order-lifecycle.unit.spec.ts:34` | expectRateSetParity › rejects a missing or non-numeric server rate id | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 100 | `order-lifecycle.unit.spec.ts:47` | posAppliedRateIds › unions the rate ids across every line array, deduped and sorted | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 101 | `order-lifecycle.unit.spec.ts:60` | posAppliedRateIds › is the empty set for a tax-free sale, and for lines with no taxes array | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 102 | `order-lifecycle.unit.spec.ts:65` | posAppliedRateIds › rejects a BLANK or non-numeric line tax id instead of coercing it to rate 0 | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 103 | `order-lifecycle.unit.spec.ts:74` | expectTaxParity › accepts equality and the one-microunit tie at full width | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 104 | `order-lifecycle.unit.spec.ts:79` | expectTaxParity › rejects a missing client value instead of coercing it to zero | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 105 | `order-lifecycle.unit.spec.ts:84` | expectTaxParity › rejects two microunits and display-money drift | Money-oracle parity helpers (no browser) | — | free+pro | — | — | — | — | N1 |
| 106 | `orders-captures.spec.ts:70` | ${device}-${colorScheme}-${step} › reachable orders states | Orders page captures | `/^data-table-row-/`, `/^data-table-skeleton-/`, `/^orders-day-heading-/`, `data-table-count` +19 | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 107 | `orders.spec.ts:70` | Orders Page (Pro) › Orders page columns and filters | Orders page | `data-table-count`, `no-data-message`, `order-filter-status` | pro (runtime skip on free) | — | — | — | — | J14 |
| 108 | `orders.spec.ts:86` | Orders Page (Pro) › should show orders or empty state | Orders page | `data-table-count`, `no-data-message` | pro (runtime skip on free) | — | — | — | orders.spec.ts:70 Orders page columns and filters | J14 |
| 109 | `orders.spec.ts:110` | Orders Page (Pro) › should search orders | Orders search finds a just-saved order | `/^data-table-row-/`, `data-table-row-${orderUuid}`, `save-to-server-button`, `search-orders` | pro (runtime skip on free) | — | — | — | — | J14 |
| 110 | `orders.spec.ts:181` | Orders Page (Pro) › should open the order modal with its actions from the row | Order modal and actions from the row caret | `checkout-button`, `data-table-row-${uuid}`, `order-modal`, `order-modal-delete` +1 | pro (runtime skip on free) | — | — | — | — | J14 |
| 111 | `orders.spec.ts:211` | Orders Page (Free) › should show View Demo button on upgrade overlay | Orders upgrade overlay View Demo | `upgrade-title`, `view-demo-button` | free (runtime skip on pro) | — | — | — | — | J19 |
| 112 | `permalink-transport.unit.spec.ts:22` | wcposRestRoute › reads the same route out of both permalink spellings | Permalink-spelling route matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 113 | `permalink-transport.unit.spec.ts:31` | wcposRestRoute › decodes the percent-encoded plain spelling the app actually sends | Permalink-spelling route matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 114 | `permalink-transport.unit.spec.ts:42` | wcposRestRoute › handles the /index.php plain form and sub-routes | Permalink-spelling route matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 115 | `permalink-transport.unit.spec.ts:51` | wcposRestRoute › returns null for URLs that address no WCPOS route | Permalink-spelling route matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 116 | `permalink-transport.unit.spec.ts:60` | isWcposRestRoute › matches a route in both spellings and rejects a different route | Permalink-spelling route matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 117 | `permalink-transport.unit.spec.ts:70` | isWcposRestRoute › does not match a longer route that merely starts with the same segments | Permalink-spelling route matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 118 | `politeness-1129.live.spec.ts:126` | pressure evidence replay › rejects failures outside the rolling window and pressure that recov… | Pressure-evidence replay (pure logic) (no browser) | — | own .live config (pro) | — | — | .live | — | N1 |
| 119 | `politeness-1129.live.spec.ts:139` | pressure evidence replay › accepts an active Retry-After window from one 503 | Pressure-evidence replay (pure logic) (no browser) | — | own .live config (pro) | — | — | .live | — | N1 |
| 120 | `politeness-1129.live.spec.ts:148` | pressure evidence replay › accepts a full fast high-pressure header window | Pressure-evidence replay (pure logic) (no browser) | — | own .live config (pro) | — | — | .live | — | N1 |
| 121 | `politeness-1129.live.spec.ts:241` | #1129 — store-open politeness against the live server › a forced populated-manifest rebaseline… | #1129 store-open audit politeness | `/^data-table-row-/`, `data-table-count`, `data-table-total-count`, `screen-products` +1 | own .live config (pro) | — | MAX_SCAN_REQUESTS = 9; MAX_BUCKET_REQUESTS = 2 (request ceilings) | .live | — | N8 |
| 122 | `pos-browse-by.spec.ts:117` | Browse by categories › categories first: the root shows the category, drilling in shows the pr… | Browse by categories (roadmap#392) | `add-to-cart-button`, `browse-all-products`, `browse-root`, `browse-term-${category.id}` +7 | free+pro | — | — | — | — | J12 |
| 123 | `pos-cart-toast-burst.spec.ts:37` | a five-add burst shows one toast and every tap reaches the product | Add burst: one toast, every tap lands (#2370) | `cart-quantity-input`, `product-tile`, `screen-pos`, `success-toast` | free+pro | — | — | — | — | J2 |
| 124 | `pos-cart.spec.ts:54` | POS Cart › should show guest customer by default | Guest customer chip by default | `cart-customer-name` | free+pro | — | — | — | customers.spec.ts:28 opens the customer picker from the name ... | J2 |
| 125 | `pos-cart.spec.ts:58` | POS Cart › should add a product to the cart and show checkout button | Add one product, 300 ms add budget | `cart-quantity-input` | free+pro | G7 (free/pro) | CART_ADD_BUDGET_MS = 300 | — | — | J2 |
| 126 | `pos-cart.spec.ts:69` | POS Cart › should absorb twenty rapid adds and paint the exact quantity | Twenty rapid adds paint exact quantity (8 s budget) | `cart-quantity-input` | free+pro | G7 (free/pro) | budgetMs = 8_000 (local) | — | — | J2 |
| 127 | `pos-cart.spec.ts:113` | POS Cart › should update quantity in cart | POS cart | `cart-quantity-input`, `keypad-key-done` | free+pro | — | — | — | — | J2 |
| 128 | `pos-cart.spec.ts:135` | POS Cart › should allow entering multiple digits in numpad without resetting | POS cart | `cart-quantity-input`, `keypad-key-${digit}`, `keypad-key-done`, `quantity-keypad-value` | free+pro | — | — | — | — | J2 |
| 129 | `pos-cart.spec.ts:155` | POS Cart › should add multiple different products | POS cart | `add-to-cart-button`, `checkout-button`, `product-tile` | free+pro | — | — | — | — | J2 |
| 130 | `pos-cart.spec.ts:185` | POS Cart › should void an order to clear cart | POS cart | `checkout-button`, `void-button` | free+pro | — | — | — | — | J2 |
| 131 | `pos-cart.spec.ts:197` | POS Cart › cart subtotal and checkout total | POS cart | `cart-subtotal`, `checkout-button` | free+pro | — | — | — | — | J2 |
| 132 | `pos-cart.spec.ts:221` | POS Cart - save to server parity (live store) › a plain one-product cart saves with identical … | One-product cart saves with identical totals | `checkout-button`, `order-totals-changed-banner`, `save-to-server-button` | free+pro | — | — | — | — | J13 |
| 133 | `pos-cart.spec.ts:310` | POS Cart - Add Items Menu › should show the add-cart-item dropdown menu | Add-items menu | `add-cart-item-menu`, `menu-add-fee`, `menu-add-misc-product`, `menu-add-shipping` | free+pro | — | — | — | — | J13 |
| 134 | `pos-cart.spec.ts:321` | POS Cart - Add Items Menu › should add a fee via the dropdown menu | Add fee via menu | `add-to-cart-submit`, `checkout-button` | free+pro | — | — | — | — | J13 |
| 135 | `pos-cart.spec.ts:334` | POS Cart - Add Items Menu › should add shipping via the dropdown menu | Add shipping via menu | `add-to-cart-submit`, `checkout-button` | free+pro | — | — | — | — | J13 |
| 136 | `pos-cart.spec.ts:347` | POS Cart - Add Items Menu › should add a miscellaneous product via the dropdown menu | Add misc product via menu | `add-to-cart-submit`, `checkout-button` | free+pro | — | — | — | — | J13 |
| 137 | `pos-cart.spec.ts:358` | POS Cart - Add Items Menu › should close the dialog without adding an item | Add-items dialog closes without adding | — (14 via helpers) | free+pro | — | — | — | — | J13 |
| 138 | `pos-checkout.spec.ts:192` | POS Cart - Order Actions › should save order to server | Save order to server | `save-to-server-button`, `success-toast` | free+pro | — | — | — | — | J4 |
| 139 | `pos-checkout.spec.ts:209` | POS Cart - Order Actions › open order details and add a note | Order details: add a note | `order-meta-button`, `order-note-input`, `saved-customer_note` | free+pro | — | — | — | — | J4 |
| 140 | `pos-checkout.spec.ts:225` | POS Cart - Multiple Orders › should create a new order via tab | New order via tab | `checkout-button`, `new-order-tab` | free+pro | — | — | — | — | J4 |
| 141 | `pos-checkout.spec.ts:244` | POS Checkout › should show order total in checkout | Checkout shows cart total | `«cartTotalId»` | free+pro | — | — | — | — | J2 |
| 142 | `pos-checkout.spec.ts:272` | POS Checkout › should cancel checkout and return to cart | Cancel checkout back to cart | `checkout-button` | free+pro | — | — | — | orders.spec.ts:181 should open the order modal with its actions from the row | J2 |
| 143 | `pos-checkout.spec.ts:284` | POS Checkout › should disable payment when the server omits the payment link | Payment disabled when server omits pay link | — (23 via helpers) | free+pro | — | — | — | — | J2 |
| 144 | `pos-checkout.spec.ts:315` | POS Checkout - real payment (live store) › completes payment and the server order matches what… | Real payment; server order matches cart | — (28 via helpers) | free+pro | — | — | — | — | J2 |
| 145 | `pos-checkout.spec.ts:497` | POS Checkout - real payment (live store) › a sale without the receipt leaves exactly one POS s… | Sale without receipt leaves one POS screen | `screen-pos`, `search-products` | free+pro | — | — | — | — | J9 |
| 146 | `pos-checkout.spec.ts:538` | uses the legacy webview for built-in POS gateways even when supports_checkout=true | Legacy webview for built-in gateways | — (23 via helpers) | free+pro | — | — | — | — | J11 |
| 147 | `pos-checkout.spec.ts:573` | falls back to the legacy webview when supports_checkout=false | Legacy webview fallback when supports_checkout=false | — (23 via helpers) | free+pro | — | — | — | — | J11 |
| 148 | `pos-coupon-apply.spec.ts:128` | POS Cart - coupon application parity (live store) › applies a percent coupon through the cart … | Percent coupon cart/server money parity, per store | `add-cart-item-menu`, `add-coupon-combobox`, `add-coupon-option-${probeCoupon!.id}`, `add-coupon-search-input` +5 | free+pro | — | — | x stores the cashier can open (>=1) | — | J5 |
| 149 | `pos-coupon-checkout.spec.ts:146` | POS Cart - coupon checkout (live store) › paying a couponed order applies the paid snapshot an… | Couponed order pays and clears its tab, per store | `add-cart-item-menu`, `add-coupon-combobox`, `add-coupon-option-${probeCoupon!.id}`, `add-coupon-search-input` +16 | pro (runtime skip on free) | — | — | x stores the cashier can open (>=1) | — | J5 |
| 150 | `pos-coupon-checkout.spec.ts:293` | POS Cart - coupon checkout (live store) › removing a coupon from a saved cart still checks out… | Couponed order pays and clears its tab, per store | `add-cart-item-menu`, `add-coupon-combobox`, `add-coupon-option-${probeCoupon!.id}`, `add-coupon-search-input` +17 | pro (runtime skip on free) | — | — | x stores the cashier can open (>=1) | — | J5 |
| 151 | `pos-filter-bar.spec.ts:27` | the filter bar renders the built-in pills | POS filter bar and quick-filter editor | `filter-pill-categories`, `filter-pill-featured`, `filter-pill-on_sale`, `filter-pill-stock_status` | free+pro | — | — | — | — | J12 |
| 152 | `pos-filter-bar.spec.ts:34` | a quick filter authored in the editor applies and clears its conditions from the bar | POS filter bar and quick-filter editor | `/^filter-bar-edit-[0-9a-f-]{36}$/`, `filter-bar-add-quick-filter`, `filter-bar-delete-${quickFilterId}`, `filter-bar-delete-confirm` +12 | free+pro | G6 (free/pro) | — | — | — | J12 |
| 153 | `pos-filter-bar.spec.ts:98` | a built-in pill can be hidden from the bar and shown again | POS filter bar and quick-filter editor | `filter-bar-toggle-featured`, `filter-pill-featured` | free+pro | — | — | — | — | J12 |
| 154 | `pos-money-oracle.spec.ts:452` | POS money oracle — line taxes survive the round trip (live store) › a cart with a fee saves wi… | Per-rate tax parity cart vs server | — (27 via helpers) | free+pro | — | — | — | — | J13 |
| 155 | `pos-money-oracle.spec.ts:467` | POS money oracle — line taxes survive the round trip (live store) › a cart with a shipping lin… | Per-rate tax parity cart vs server | — (27 via helpers) | free+pro | — | — | — | — | J13 |
| 156 | `pos-money-oracle.spec.ts:482` | POS money oracle — line taxes survive the round trip (live store) › a misc product priced to a… | Per-rate tax parity cart vs server | — (18 via helpers) | free+pro | — | — | — | — | J13 |
| 157 | `pos-money-oracle.spec.ts:514` | POS money oracle — line taxes survive the round trip (live store) › a mixed-tax-class cart sav… | Per-rate tax parity cart vs server | — (13 via helpers) | free+pro | — | — | — | — | J13 |
| 158 | `pos-money-oracle.spec.ts:574` | POS money oracle — line taxes survive the round trip (live store) › a percent quick discount i… | Percent quick discount pro-rata (coupon line) | — (33 via helpers) | free+pro | — | — | — | — | J5 |
| 159 | `pos-money-oracle.spec.ts:603` | POS money oracle — line taxes survive the round trip (live store) › a fixed quick discount is … | Fixed quick discount equal-per-unit (coupon line) | — (33 via helpers) | free+pro | — | — | — | — | J5 |
| 160 | `pos-money-oracle.spec.ts:638` | POS money oracle — line taxes survive the round trip (live store) › a product + fee + shipping… | Per-rate tax parity cart vs server | — (32 via helpers) | free+pro | — | — | — | — | J13 |
| 161 | `pos-offline-new-customer.spec.ts:92` | Cart: new customer while the store is unreachable (#1523) › attaches the customer at once, and… | New customer while store unreachable (#1523) | `cart-customer-name`, `checkout-method-${cash!.id}`, `checkout-receipt-stage` | pro (runtime skip on free) | — | — | — | — | J8 |
| 162 | `pos-offline-new-customer.spec.ts:221` | Cart: new customer while the store is unreachable (#1523) › on the gateway pay page, a custome… | New customer while store unreachable (#1523) | `cart-customer-name` | pro (runtime skip on free) | — | — | — | — | J8 |
| 163 | `pos-open-orders-switching.spec.ts:63` | POS open-orders tab switching › cart contents follow the selected order tab across switches | Open-order tab switching keeps cart contents | `keypad-key-1`, `keypad-key-2`, `keypad-key-done`, `new-order-tab` +2 | free+pro | — | — | — | — | J4 |
| 164 | `pos-panel-resize.spec.ts:14` | resizes the visible POS products panel | Products panel resize | `pos-products-panel`, `pos-resize-handle`, `screen-pos` | free+pro | — | — | — | — | J18 |
| 165 | `pos-refunds.spec.ts:211` | POS refunds (Pro) › submits refund_destination=cash for a non-cash order | Refund destination=cash for non-cash order (request shape) | `confirm-process-refund-button`, `process-refund-button`, `refund-destination-cash`, `refund-destination-original_method` | pro (runtime skip on free) | — | — | — | — | J7 |
| 166 | `pos-refunds.spec.ts:254` | POS refunds (Pro) › submits refund_destination=original_method when provider refunds are suppo… | Refund destination=original_method (request shape) | `confirm-process-refund-button`, `process-refund-button`, `refund-destination-original_method` | pro (runtime skip on free) | — | — | — | — | J7 |
| 167 | `pos-refunds.spec.ts:313` | POS refunds (Pro) - real refund (live store) › refunds a completed order and the server record… | Real refund recorded by server | `confirm-process-refund-button`, `process-refund-button`, `refund-custom-amount` | pro (runtime skip on free) | — | — | — | — | J7 |
| 168 | `pos-scroll-settings.spec.ts:15` | POS products scroll position survives a Settings round-trip | Products scroll survives Settings round trip | `data-table-loaded-count`, `data-table-scroller-products`, `pos-products-grid-scroller`, `screen-settings-general` +1 | free+pro | — | — | — | — | J18 |
| 169 | `pos-variation-popover-states.spec.ts:94` | POS variation popover option states › greys out a combination that does not exist once its par… | Variation popover option states | `variation-option-Blue`, `variation-option-Large`, `variation-option-Small` | free+pro | — | — | — | — | J6 |
| 170 | `pos-variation-popover-states.spec.ts:113` | POS variation popover option states › greys out an option whose every variation sits outside t… | Variation popover option states | `variation-option-Blue`, `variation-option-Red` | free+pro | — | — | — | — | J6 |
| 171 | `pos-variation-popover-states.spec.ts:136` | POS variation popover option states › a greyed option cannot be selected | Variation popover option states | `variation-option-Blue`, `variation-option-Large`, `variation-popover-add-to-cart`, `variation-popover-unavailable` | free+pro | — | — | — | — | J6 |
| 172 | `pos-variation-popover-states.spec.ts:158` | POS variation popover option states › offers an unsellable combination; Add to Cart follows Av… | Variation popover option states | `checkout-button`, `success-toast`, `variation-option-Large`, `variation-option-Red` +2 | free+pro | — | — | — | — | J6 |
| 173 | `pos-variation-stock-pill.spec.ts:58` | POS expanded variations follow the Stock Status pill › shows every variation when cleared and … | Expanded variations follow Stock Status pill | `data-table-row-variation-${probe.variationIds[cell]}`, `variable-product-expand`, `«probe.rowTestId!»` | free+pro | — | — | — | — | J6 |
| 174 | `pos-variations-drill-in.spec.ts:7` | drills into variations, adds a line and returns to products | Variations drill-in (table and grid) | `/^data-table-row-variation-/`, `cart-line-total`, `new-order-tab`, `products-breadcrumb` +5 | free+pro | — | — | — | — | J6 |
| 175 | `pos-variations-drill-in.spec.ts:34` | in the grid, a variable tile deals its variations as tiles and the parent tile goes back | Variations drill-in (table and grid) | `/^data-table-row-variation-/`, `cart-line-total`, `new-order-tab`, `products-breadcrumb` +6 | free+pro | — | — | — | — | J6 |
| 176 | `pos-variations.spec.ts:193` | POS Variations › should add variation to cart via popover attribute selection | POS variations | `checkout-button`, `success-toast`, `variation-popover-add-to-cart` | free+pro | — | — | — | — | J6 |
| 177 | `pos-variations.spec.ts:213` | POS Variations › should show expand link on variable product name | POS variations | `variable-product-expand` | free+pro | — | — | — | pos-variations.spec.ts:220 should add variation to cart via expanded row plus button | J6 |
| 178 | `pos-variations.spec.ts:220` | POS Variations › should add variation to cart via expanded row plus button | POS variations | `add-variation-to-cart-button`, `checkout-button`, `success-toast`, `variable-product-expand` | free+pro | — | — | — | pos-variations.spec.ts:382 should increment quantity when adding same variation twice | J6 |
| 179 | `pos-variations.spec.ts:245` | POS Variations › should collapse expanded variable product row | POS variations | `add-variation-to-cart-button`, `variable-product-expand` | free+pro | — | — | — | — | J6 |
| 180 | `pos-variations.spec.ts:269` | POS Variations › should add multiple variations to cart | POS variations | `add-variation-to-cart-button`, `checkout-button`, `variable-product-expand` | free+pro | — | — | — | — | J6 |
| 181 | `pos-variations.spec.ts:316` | POS Variations › should render the variation image the server sent | POS variations | `data-table-row-variation-${withImage!.id}`, `variable-product-expand` | free+pro | G2 (free/pro) | — | — | — | J6 |
| 182 | `pos-variations.spec.ts:382` | POS Variations › should increment quantity when adding same variation twice | POS variations | `add-variation-to-cart-button`, `cart-quantity-input`, `checkout-button`, `variable-product-expand` | free+pro | — | — | — | — | J6 |
| 183 | `pro425-store-pricing.live.spec.ts:59` | pro#425 — store-scoped pricing in the till › the products grid renders the STORE price, not th… | pro#425 store-scoped price in grid | `data-table-row-${PROBE_SLUG}`, `screen-products`, `search-products` | own .live config (pro) | — | — | .live | — | N8 |
| 184 | `product-category-filter.spec.ts:341` | Product category filter › shows the products the store puts in a category, and hides the rest | Category filter pill vs store membership (#941) | `filter-pill-categories`, `filter-pill-remove-categories`, `search-products`, `tree-combobox-item-${category.id}` +3 | free+pro | — | — | — | — | J12 |
| 185 | `product-visibility.spec.ts:249` | POS visibility (online-only products) › an online-only product leaves the POS and returns when… | Online-only product leaves and returns | `view-mode-toggle`, `«probe.rowTestId»` | free+pro | — | — | — | — | J20 |
| 186 | `products-captures.spec.ts:73` | ${device}-${colorScheme}-${step} › reachable products states | Products page captures | `/^data-table-row-variation-/`, `/^data-table-skeleton-/`, `data-table-count`, `data-table-loaded-count` +13 | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 187 | `products-page.spec.ts:88` | Products Page (Pro) › Products page initial table | Products page (Pro) | `data-table-count`, `search-products` | pro (runtime skip on free) | — | — | — | — | J14 |
| 188 | `products-page.spec.ts:102` | Products Page (Pro) › should reorder rows when clicking the Name column header on Products page | Products page (Pro) | `data-table-count`, `data-table-header-name`, `search-products`, `«alpha.probe.rowTestId»` +1 | pro (runtime skip on free) | — | — | — | — | J14 |
| 189 | `products-page.spec.ts:216` | Products Page (Pro) › should search products on Products page | Products page (Pro) | `/^data-table-row-/`, `screen-products`, `search-products`, `«created.probe.rowTestId»` | pro (runtime skip on free) | — | — | — | — | J14 |
| 190 | `products-page.spec.ts:314` | Products Page (Pro) › should inline edit stock quantity and push the change to the server | Products page (Pro) | `screen-products`, `search-products`, `success-toast`, `«rowTestId»` | pro (runtime skip on free) | — | — | — | — | J14 |
| 191 | `products-page.spec.ts:379` | Products Page (Pro) › should rename a product via the edit modal and push the change to the se… | Products page (Pro) | `product-edit-close-button`, `product-edit-modal`, `product-edit-name-input`, `product-open-button` +4 | pro (runtime skip on free) | — | — | — | — | J14 |
| 192 | `products-page.spec.ts:475` | Products Page (Pro) › modal edit pushes a sparse payload even when the store serves poisoned f… | Products page (Pro) | `product-edit-close-button`, `product-edit-modal`, `product-edit-name-input`, `product-open-button` +4 | pro (runtime skip on free) | — | — | — | — | J14 |
| 193 | `products-page.spec.ts:593` | Products Page (Pro) › should show a revert snackbar and auto-revert when the server rejects a … | Products page (Pro) | `screen-products`, `search-products`, `toast-SYNC202`, `«rowTestId»` | pro (runtime skip on free) | — | — | — | — | J14 |
| 194 | `products-page.spec.ts:663` | Products Page (Pro) › should open a product's modal, with its record actions, from the row car… | Products page (Pro) | `data-table-count`, `product-edit-modal`, `product-modal-sync`, `product-open-button` | pro (runtime skip on free) | — | — | — | — | J14 |
| 195 | `products-page.spec.ts:687` | Products Page (Pro) › should open a variation's modal, with sync, from its row caret | Products page (Pro) | `data-table-count`, `search-products`, `variation-modal-sync` | pro (runtime skip on free) | — | — | — | — | J14 |
| 196 | `products-page.spec.ts:725` | Products Page (Pro) › should collapse expanded variable product on Products page | Products page (Pro) | `data-table-count`, `search-products` | pro (runtime skip on free) | — | — | — | — | J14 |
| 197 | `products-page.spec.ts:768` | Products Page (Free) › should show View Demo button on upgrade overlay | Products upgrade overlay View Demo | `upgrade-title`, `view-demo-button` | free (runtime skip on pro) | — | — | — | — | J19 |
| 198 | `products.spec.ts:13` | «title» | Product search by name / count changes (wrapper, 2 call sites) | — (6 via helpers) | free+pro | — | — | x2 call sites (lines 74, 98) | — | J12 |
| 199 | `products.spec.ts:55` | Products in POS › product view-mode round trip | Grid/table view-mode round trip | `data-table-count`, `product-tile`, `variable-product-tile`, `view-mode-toggle` | free+pro | — | — | — | — | J18 |
| 200 | `products.spec.ts:76` | Products in POS › should clear search and show all products | Clear search restores products | `search-products`, `«LOADED_COUNT_TEST_ID»` | free+pro | — | — | — | — | J12 |
| 201 | `products.spec.ts:90` | Products in POS › should show "No products found" for nonsense search | Nonsense search shows No products found | `no-data-message`, `search-products` | free+pro | — | — | — | — | J12 |
| 202 | `products.spec.ts:100` | Products in POS › should add a simple product to cart by clicking tile | Add simple product by tile | — (13 via helpers) | free+pro | — | — | — | pos-cart.spec.ts:221 a plain one-product cart saves ... (and every live checkout spec) | J2 |
| 203 | `products.spec.ts:107` | Products in POS › should open variation popover when clicking variable product tile | Variable tile opens popover | `screen-pos`, `search-products`, `variable-product-tile` | free+pro | — | — | — | pos-variations.spec.ts:193 should add variation to cart via popover attribute selection | J6 |
| 204 | `products.spec.ts:119` | Products in POS › should add product to cart in table view | Add product in table view | `view-mode-toggle` | free+pro | — | — | — | — | J2 |
| 205 | `protocol-signal.spec.ts:65` | every sync request uses the protocol transport proven by the store echo | Sync requests use the echo-proven protocol transport | — | free+pro | — | — | — | — | N3 |
| 206 | `quarantine.spec.ts:20` | finds the entry for a matching project, file and title | Quarantine gate matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 207 | `quarantine.spec.ts:24` | does not match the same test in a different project | Quarantine gate matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 208 | `quarantine.spec.ts:28` | does not match a different title in the same file | Quarantine gate matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 209 | `quarantine.spec.ts:32` | matches the path relative to testDir, not the basename | Quarantine gate matcher (no browser) | — | free+pro | — | — | — | — | N1 |
| 210 | `register-bar.spec.ts:5` | POS uses the register bar and opens the cashier sheet | Register bar opens cashier sheet | `header-title-container`, `register-bar-avatar`, `register-bar-place`, `user-sheet` +1 | free+pro | — | — | — | — | J1 |
| 211 | `register-captures.spec.ts:97` | ${device}-${colorScheme}-${step} › reachable register states | Register (POS) captures | `/^checkout-split-(share\|option)-/`, `cart-line-remove`, `cart-line-total`, `cart-quantity-input` +32 | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 212 | `register-closure.spec.ts:108` | writes Closure 1 and leaves the last closure in the register panel | Closure written and shown in register panel (stubbed contract) | `closure-done`, `closure-title`, `closure-written`, `count-amount` +7 | free+pro | — | — | — | — | J10 |
| 213 | `register-count.spec.ts:85` | counts denominations, closes, and returns to the open register card | Denomination count and close (stubbed contract) | `closure-done`, `closure-written`, `count-amount`, `count-close` +9 | free+pro | — | — | — | — | J10 |
| 214 | `register-session.spec.ts:77` | opens a register, records paid out, and undoes it | Open register, paid out, undo (stubbed contract) | `/^movement-void-/`, `movement-amount`, `movement-confirm`, `movement-reason` +9 | free+pro | — | — | — | — | J1 |
| 215 | `reports-closures.spec.ts:575` | «viewport.name» › walks grouped closures, settled recount, reprint and CSV | Grouped closures, settled recount, reprint, CSV (tablet+phone) | `closure-back`, `closure-badge-${probe.ids[0]}`, `closure-badge-${probe.ids[1]}`, `closure-correction-${correctionId}` +25 | free+pro | — | — | x2 viewports (tablet, phone) | — | J10 |
| 216 | `reports-closures.spec.ts:680` | «viewport.name» › Free › locks historical dates without issuing a closures request | Free: historical dates locked, no closures request | `reports-lock-hint`, `reports-period`, `reports-period-${period}`, `reports-period-today` +1 | free+pro | — | — | x2 viewports (tablet, phone) | — | J19 |
| 217 | `reports.spec.ts:14` | Reports Page (Pro) › should navigate to Reports page | Reports Sales room | `screen-reports` | pro (runtime skip on free) | — | — | — | reports.spec.ts:42 should show the period cards | J15 |
| 218 | `reports.spec.ts:35` | Reports Page (Pro) › should show the scope chips | Reports Sales room | `hero-chips`, `screen-reports` | pro (runtime skip on free) | — | — | — | — | J15 |
| 219 | `reports.spec.ts:42` | Reports Page (Pro) › should show the period cards | Reports Sales room | `reports-period-section`, `screen-reports` | pro (runtime skip on free) | — | — | — | reports-closures.spec.ts:575 walks grouped closures ... (walkSales asserts reports-period-section) | J15 |
| 220 | `reports.spec.ts:49` | Reports Page (Pro) › should show print button | Reports Sales room | `hero-print`, `screen-reports` | pro (runtime skip on free) | — | — | — | — | J15 |
| 221 | `reports.spec.ts:67` | Reports Page (Free) › should show the day report, not an upgrade overlay | Free sees day report, no overlay | `reports-period-section`, `screen-reports`, `upgrade-title` | free (runtime skip on pro) | — | — | — | — | J19 |
| 222 | `rest-route-transport.spec.ts:13` | connects and finds an owned product through query-form REST when path routes are blocked | Query-form REST when path routes blocked | `product-tile-${created.probe.id}`, `screen-pos`, `search-products`, `«created.probe.rowTestId»` | free-unauth only | — | — | — | — | N3 |
| 223 | `search-heap.spec.ts:93` | committed searches neither retain per keystroke nor block the main thread | Search heap / long-task gate | `search-products` | free+pro | G7 (free/pro) | LONG_TASK_BUDGET_MS = 2_000; HEAP_CEILING_BYTES = 768 MB; MAX_RETAINED_OVER_BASELINE = 1.25; MAX_NODES_OVER_PLATEAU = 1.5 | — | — | N6 |
| 224 | `search-latency.spec.ts:44` | a single-word search meets the latency budgets on a slow host | Search latency budgets on slow host | `data-table-loaded-count`, `search-products`, `«newRegExp(`^(product-tile\|data-table-row-fixture)-»` | free+pro | — | FIRST_ROW_CEILING_MS = 3_000; FULL_PAGE_CEILING_MS = 4_000 (targets 1_500 / 3_000, ROUND_TRIP_MS = 800) | — | — | N6 |
| 225 | `search-probe.spec.ts:38` | builds canonical rest_route URLs for plain WordPress permalinks | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 226 | `search-probe.spec.ts:47` | tries the captured authorization transport first, then the alternates | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 227 | `search-probe.spec.ts:55` | starts from a captured QUERY credential and still offers the header form | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 228 | `search-probe.spec.ts:65` | offers no candidate when the app was never seen authenticating | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 229 | `search-probe.spec.ts:108` | re-reads the app credential until one actually authenticates | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 230 | `search-probe.spec.ts:127` | gives up with the statuses it saw when no credential ever authenticates | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 231 | `search-probe.spec.ts:138` | bounds every verification request by what is left of the budget | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 232 | `search-probe.spec.ts:160` | proves the credential against the namespace the caller named | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 233 | `search-probe.spec.ts:178` | a swept probe helper writes with the resolved credential, not the captured one | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 234 | `search-probe.spec.ts:222` | provisions simple products before a test requests posPage | Simple product provisioned before posPage (no browser) | — | free+pro | — | — | — | — | N2 |
| 235 | `search-probe.spec.ts:238` | provisions a variable product before a test requests posPage | Variable product provisioned before posPage (no browser) | — | free+pro | — | — | — | — | N2 |
| 236 | `search-probe.spec.ts:243` | search-probe pure logic › accepts matching variations demand while searching products | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 237 | `search-probe.spec.ts:269` | search-probe pure logic › accepts an exact result that renders locally without server demand | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 238 | `search-probe.spec.ts:310` | search-probe pure logic › waits through a 401 the app recovers from | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 239 | `search-probe.spec.ts:324` | search-probe pure logic › still fails, naming the status, when no search demand ever succeeds | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 240 | `search-probe.spec.ts:335` | search-probe pure logic › an exact local row does not excuse a search demand that 401d | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 241 | `search-probe.spec.ts:368` | search-probe pure logic › an include-only variations route is unsupported without asking for a… | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 242 | `search-probe.spec.ts:389` | search-probe pure logic › a store the app never authenticated against is unsupported, not a fa… | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 243 | `search-probe.spec.ts:405` | search-probe pure logic › writer credentials must be either fully configured or fully absent | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 244 | `search-probe.spec.ts:416` | search-probe pure logic › isolates concurrent writer login sessions with unique states | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 245 | `search-probe.spec.ts:457` | search-probe pure logic › writer authorization falls back to the query param when the header i… | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 246 | `search-probe.spec.ts:514` | search-probe pure logic › uses prefixed query transport when an older server accepts it | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 247 | `search-probe.spec.ts:553` | search-probe pure logic › probe deletes travel as POST with a _method=DELETE override | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 248 | `search-probe.spec.ts:591` | search-probe pure logic › continues to query writer auth when the header probe throws | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 249 | `search-probe.spec.ts:635` | search-probe pure logic › adopts only the exact product identified by the create token | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 250 | `search-probe.spec.ts:656` | search-probe pure logic › rejects malformed product adoption lists | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 251 | `search-probe.spec.ts:662` | search-probe pure logic › sweeps orphaned directional arrival probes | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 252 | `search-probe.spec.ts:709` | search-probe pure logic › product helpers name the fixture required for their page registration | Search/product probe harness (no browser) | — (11 via helpers) | free+pro | — | — | — | — | N1 |
| 253 | `search-probe.spec.ts:720` | search-probe pure logic › deletes a created variable parent whose response omits its slug | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 254 | `search-probe.spec.ts:744` | search-probe pure logic › adopts a variation created before an ambiguous transport failure | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 255 | `search-probe.spec.ts:780` | search-probe pure logic › missing writer credentials keep product probes skippable | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 256 | `search-probe.spec.ts:790` | search-probe pure logic › configured HTTP failures fail immediately, including variable-produc… | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 257 | `search-probe.spec.ts:800` | search-probe pure logic › transport failures retry once, then retain configured-writer failure… | Search/product probe harness (no browser) | — | free+pro | — | — | — | — | N1 |
| 258 | `search-responsiveness-probe.perf.spec.ts:7` | frame probe accepts an ordinary browser input | Frame-probe control experiments | — (5 via helpers) | search-performance config (pro) | — | — | .perf | — | N7 |
| 259 | `search-responsiveness-probe.perf.spec.ts:15` | frame probe catches a blocking input handler | Frame-probe control experiments | `search-control` | search-performance config (pro) | — | — | .perf | — | N7 |
| 260 | `search-responsiveness.electron.perf.spec.ts:14` | desktop search preserves typing and reports frame smoothness | Electron desktop search smoothness (no browser) | `add-user-button`, `connect-button`, `health-nav-logs`, `open-pos-button` +3 | search-performance config (pro) | — | expectSearchResponsive (as above) | .perf + E2E_ELECTRON_EXECUTABLE | — | N7 |
| 261 | `search-responsiveness.perf.spec.ts:8` | screen: ${route} preserves typing and reports frame smoothness | Search input smoothness per surface | `health-nav-logs` | search-performance config (pro) | — | expectSearchResponsive: zero long tasks > 50 ms (soft); smoothness reported only | .perf x6 routes | — | N7 |
| 262 | `search-responsiveness.perf.spec.ts:49` | dropdown: ${label} preserves typing and reports frame smoothness | Search input smoothness per surface | `add-cart-item-menu`, `add-discount-kind-coupon`, `menu-add-discount`, `settings-nav-general` | search-performance config (pro) | — | expectSearchResponsive (as above) | .perf x9 dropdowns | — | N7 |
| 263 | `search-responsiveness.perf.spec.ts:63` | address dropdown searches preserve typing and report frame smoothness | Search input smoothness per surface | `country-select`, `country-select-option-US`, `customer-billing-address-toggle`, `customer-form-close` +1 | search-performance config (pro) | — | expectSearchResponsive (as above) | .perf | — | N7 |
| 264 | `search-terms.spec.ts:8` | preserves MY in cold and warm Georgian all-term searches | Multi-term search (mocked server) | `data-table-loaded-count`, `search-products`, `«newRegExp(`^(product-tile\|data-table-row-fixture)-»` | free+pro | G4 (free/pro) | — | — | — | J12 |
| 265 | `search-terms.spec.ts:73` | finds a product when the typed words are reordered or separated | Multi-term search (mocked server) | `data-table-loaded-count`, `search-products`, `«newRegExp(`^(product-tile\|data-table-row-fixture)-»` | free+pro | G4 (free/pro) | — | — | — | J12 |
| 266 | `search-walk.spec.ts:71` | Product search walk politeness › a search with more server hits than the window never repeats … | Search walk politeness (no repeat, stops on release) | `search-products` | free+pro | — | request-shape gate over OBSERVE_MS = 30_000 / AFTER_CLEAR_MS = 10_000 (no timing budget) | — | — | N6 |
| 267 | `server-created-visibility.spec.ts:161` | a product created on the server reaches the products grid without a search | Server-created product reaches products grid | `/^data-table-row-/`, `data-table-count`, `data-table-header-name`, `data-table-header-price` +2 | pro (free excluded at collection) | — | — | — | — | J20 |
| 268 | `server-created-visibility.spec.ts:332` | an order created on the server reaches the orders grid without a search | Server-created order reaches orders grid | `/^data-table-sort-number-(asc\|desc)$/`, `data-table-count`, `data-table-header-date_created_gmt`, `data-table-header-number` +8 | pro (free excluded at collection) | — | — | — | — | J20 |
| 269 | `server-created-visibility.spec.ts:493` | a customer created on the server reaches the customers grid without a search | Server-created customer reaches customers grid | `/^data-table-row-/`, `/^data-table-sort-email-(asc\|desc)$/`, `customer-email-${probeEmail}`, `data-table-header-email` +5 | pro (free excluded at collection) | — | — | — | — | J20 |
| 270 | `server-down-1135.live.spec.ts:62` | #1135 server-down feedback (live store) › dot goes amber and manual sync spins + toasts once t… | #1135 server-down dot and manual sync feedback | `db-check-everything`, `error-toast`, `health-nav-database`, `register-bar-pill` +2 | own .live config (pro) | — | — | .live | — | N8 |
| 271 | `session-recovery.live.spec.ts:46` | #2112 incomplete store session recovery › a pointer to a missing site row returns to the store… | #2112 incomplete store session recovery | `search-products`, `store-url-input`, `toast-AUTH131` | own .live config (pro) | — | — | .live | — | N8 |
| 272 | `settings-captures.spec.ts:73` | ${device}-${colorScheme}-${step} › reachable settings states | Settings captures | `/^printer-row-.*-delete$/`, `/^printer-row-.*-delete-cancel$/`, `/^printer-row-.*-delete-confirm$/`, `/^printer-row-.*-menu$/` +9 | free+pro | — | — | CAPTURES=1 x12 (2 devices x 2 schemes x 3 scales) | — | N10 |
| 273 | `settings.spec.ts:16` | Settings Area › settings navigation and General form | Settings area | `screen-settings-general`, `settings-nav-barcode-scanning`, `settings-nav-card-readers`, `settings-nav-general` +3 | free+pro | — | — | — | — | J16 |
| 274 | `settings.spec.ts:34` | Settings Area › should show Tax settings page | Settings area | `screen-settings-tax`, `settings-nav-tax` | free+pro | — | — | — | — | J16 |
| 275 | `settings.spec.ts:42` | Settings Area › should show Barcode Scanning page | Settings area | `scanner-advanced-trigger`, `scanner-keyboard-wall-note`, `screen-settings-barcode-scanning`, `settings-nav-barcode-scanning` | free+pro | — | — | — | — | J16 |
| 276 | `settings.spec.ts:60` | Settings Area › should show Theme page and list themes | Settings area | `screen-settings-theme`, `settings-nav-theme` | free+pro | — | — | — | — | J16 |
| 277 | `settings.spec.ts:68` | Settings Area › should leave the settings area | Settings area | `screen-settings-general` | free+pro | — | — | — | — | J16 |
| 278 | `settings.spec.ts:83` | Settings Area › should show Saved beside the edited store name only, then clear it | Saved indicator beside edited store name | `saved-name`, `settings-general-name` | free+pro | — | — | — | — | J16 |
| 279 | `settings.spec.ts:202` | Language Settings › should have a language set in settings | Settings area | `combobox-search`, `language-select`, `language-select-content`, `«SWITCH_TARGETS[0].optionTestID»` | free+pro | — | — | — | — | J16 |
| 280 | `settings.spec.ts:225` | Language Settings › should re-render the settings form labels in the new language | Settings area | `screen-settings-general` | free+pro | — | — | — | — | J16 |
| 281 | `settings.spec.ts:237` | Language Settings › should persist language after closing and reopening settings | Settings area | `screen-settings-general` | free+pro | — | — | — | — | J16 |
| 282 | `store-login-retry.spec.ts:4` | store-outage signatures are retryable | Global-setup login retry classifier (no browser) | — | free+pro | — | — | — | — | N1 |
| 283 | `store-login-retry.spec.ts:15` | a site-probe timeout is retryable with either permalink style | Global-setup login retry classifier (no browser) | — | free+pro | — | — | — | — | N1 |
| 284 | `store-login-retry.spec.ts:28` | site HTTP errors and timeouts without a site probe on the same line are not retryable | Global-setup login retry classifier (no browser) | — | free+pro | — | — | — | — | N1 |
| 285 | `store-login-retry.spec.ts:42` | an ordinary login failure is not retryable | Global-setup login retry classifier (no browser) | — | free+pro | — | — | — | — | N1 |
| 286 | `store-login-retry.spec.ts:51` | setup is staggered by shard only in CI | Global-setup login retry classifier (no browser) | — | free+pro | — | — | — | — | N1 |
| 287 | `store-pick.unit.spec.ts:40` | storePickLocator › the default pick is the first offered store, never the cashier row above it | Harness store-pick locator | — (2 via helpers) | free+pro | — | — | — | — | N1 |
| 288 | `store-pick.unit.spec.ts:47` | storePickLocator › a requested store is picked by its WooCommerce id | Harness store-pick locator | — (2 via helpers) | free+pro | — | — | — | — | N1 |
| 289 | `tick-403-soak.live.spec.ts:95` | a permanently 403 tick does not grow the renderer | Permanent 403 tick renderer growth (soak) | `search-products` | soak config (store from SOAK_STORE_URL) | — | HEAP_CEILING_BYTES = 768 MB; MAX_UNCOLLECTED_TAIL_OVER_PLATEAU = 1.25; MAX_RETAINED_OVER_STEADY = 1.25; MAX_NODES_OVER_STEADY = 1.5; MAX_LISTENERS_OVER_STEADY = 1.5 | .live | — | N9 |
| 290 | `update-required.spec.ts:85` | the gate refusal renders the blocking update screen and sync goes quiet | 426 update-required screen and quiet sync | `error-toast`, `update-required-docs-link-SYNC341`, `update-required-logout`, `update-required-reload` +1 | free+pro | — | — | — | — | N3 |
| 291 | `update-required.spec.ts:115` | after logout the login card shows the update notice, not Re-authenticate | 426 update-required screen and quiet sync | `error-toast`, `open-pos-button`, `update-required-card-notice`, `update-required-docs-link-SYNC341` +4 | free+pro | — | — | — | — | N3 |
| 292 | `variation-sku-search.cold.spec.ts:45` | Cold start — variation SKU search › the local catalogue starts (and stays) empty | Variation SKU search on thin local catalogue (#991) | `no-data-message`, `product-tile`, `variable-product-tile` | pro-cold-start | — | — | .cold (E2E_COLD_START=1) | — | J6 |
| 293 | `variation-sku-search.cold.spec.ts:56` | Cold start — variation SKU search › searching a variation SKU pulls the non-resident variation… | Variation SKU search on thin local catalogue (#991) | `add-variation-to-cart-button`, `cart-quantity-input`, `search-products`, `variable-product-expand` +1 | pro-cold-start | — | — | .cold (E2E_COLD_START=1) | — | J6 |

## 4. Candidate journeys

**I** throughout this section: the grouping is a judgement from titles, bodies and testIDs. A block belongs to the journey whose cashier (or manager) outcome it proves; a block that proves one step of a journey is listed under it even if it lives in a spec named after a screen. 161 blocks fall into 20 journeys; 132 fall into none.

| Journey | Blocks | Spec files they live in |
|---|---:|---|
| J1 Open the register and run the session (open float, paid in/out, cashier sheet) | 3 | 3 |
| J2 Sell to a guest (find product, add, cart edits, checkout, pay) | 18 | 5 |
| J3 Sell to a customer (pick or create customer, address, split tender) | 9 | 3 |
| J4 Park and resume (open-order tabs, save to server, second cart) | 5 | 3 |
| J5 Coupon and quick discount | 5 | 3 |
| J6 Variations (popover, expand, drill-in, stock filter) | 17 | 6 |
| J7 Refund | 3 | 1 |
| J8 Offline sale and offline new customer | 5 | 3 |
| J9 Receipt and the Paid moment | 3 | 2 |
| J10 Close the register (count, closure, closures in Reports) | 3 | 3 |
| J11 Card terminal, reader device and send-away gateways | 11 | 4 |
| J12 Find a product (search, categories, filter bar, browse-by) | 10 | 5 |
| J13 Fees, shipping and misc lines, and the money they save | 11 | 2 |
| J14 Back office: Products, Orders, Customers, Coupons pages | 18 | 4 |
| J15 Reports (Sales room) | 4 | 1 |
| J16 Settings | 9 | 1 |
| J17 Store health and Logs | 5 | 1 |
| J18 Navigate the app shell (drawer, viewports, layout prefs) | 10 | 4 |
| J19 Free store meets the Pro gates | 8 | 7 |
| J20 Store-side changes reach the till (arrival, visibility) | 4 | 2 |

### Cashier journeys

**J1. Open the register and run the session (open float, paid in/out, cashier sheet)** — 3 blocks in 3 spec files (1 prefix-duplicates).

- `header.spec.ts:6` Register bar (the POS has no title bar) › should show the cashier avatar on the bar — prefix-dup
- `register-bar.spec.ts:5` POS uses the register bar and opens the cashier sheet
- `register-session.spec.ts:77` opens a register, records paid out, and undoes it

**J2. Sell to a guest (find product, add, cart edits, checkout, pay)** — 18 blocks in 5 spec files (2 quarantined, 3 prefix-duplicates, 2 perf gates).

- `checkout-tender.spec.ts:139` POS two-pane checkout (live store) › renders the tender checkout with the order balance — pro (free excluded at collection)
- `checkout-tender.spec.ts:162` POS two-pane checkout (live store) › takes the full balance in cash and the server records one captured leg — pro (free excluded at collection)
- `checkout-tender.spec.ts:703` POS two-pane checkout (live store) › on a phone › lands on the phone Products tab after New sale and keeps it… — pro (free excluded at collection)
- `pos-cart-toast-burst.spec.ts:37` a five-add burst shows one toast and every tap reaches the product
- `pos-cart.spec.ts:54` POS Cart › should show guest customer by default — prefix-dup
- `pos-cart.spec.ts:58` POS Cart › should add a product to the cart and show checkout button — quarantined G7 (free/pro); perf gate
- `pos-cart.spec.ts:69` POS Cart › should absorb twenty rapid adds and paint the exact quantity — quarantined G7 (free/pro); perf gate
- `pos-cart.spec.ts:113` POS Cart › should update quantity in cart
- `pos-cart.spec.ts:135` POS Cart › should allow entering multiple digits in numpad without resetting
- `pos-cart.spec.ts:155` POS Cart › should add multiple different products
- `pos-cart.spec.ts:185` POS Cart › should void an order to clear cart
- `pos-cart.spec.ts:197` POS Cart › cart subtotal and checkout total
- `pos-checkout.spec.ts:244` POS Checkout › should show order total in checkout
- `pos-checkout.spec.ts:272` POS Checkout › should cancel checkout and return to cart — prefix-dup
- `pos-checkout.spec.ts:284` POS Checkout › should disable payment when the server omits the payment link
- `pos-checkout.spec.ts:315` POS Checkout - real payment (live store) › completes payment and the server order matches what the cart sent
- `products.spec.ts:100` Products in POS › should add a simple product to cart by clicking tile — prefix-dup
- `products.spec.ts:119` Products in POS › should add product to cart in table view

**J3. Sell to a customer (pick or create customer, address, split tender)** — 9 blocks in 3 spec files (1 prefix-duplicates).

- `checkout-tender.spec.ts:280` POS two-pane checkout (live store) › splits a payment across two tenders and the server records both legs — pro (free excluded at collection)
- `checkout-tender.spec.ts:347` POS two-pane checkout (live store) › refuses an over-tender on a method that cannot give change — pro (free excluded at collection)
- `checkout-tender.spec.ts:372` POS two-pane checkout (live store) › splits evenly through the split view and records two legs — pro (free excluded at collection)
- `checkout-tender.spec.ts:440` POS two-pane checkout (live store) › shares a ticked line between two payments — pro (free excluded at collection)
- `checkout-tender.spec.ts:631` POS two-pane checkout (live store) › cancels mid-split, listing the cash to return, and voids the leg — pro (free excluded at collection)
- `customer-picker-paging.spec.ts:94` POS customer picker › reaches past the first page as the list scrolls
- `customers.spec.ts:28` Customers in POS › opens the customer picker from the name and the address editor from the pin
- `customers.spec.ts:67` Add Customer from Cart (Pro) › should create a customer from the cart and attach it to the order — pro (runtime skip on free)
- `customers.spec.ts:98` Add Customer from Cart (Pro) › should show customer form fields in dialog — prefix-dup; pro (runtime skip on free)

**J4. Park and resume (open-order tabs, save to server, second cart)** — 5 blocks in 3 spec files.

- `checkout-tender.spec.ts:556` POS two-pane checkout (live store) › preserves a partly paid cart while a second cart completes checkout — pro (free excluded at collection)
- `pos-checkout.spec.ts:192` POS Cart - Order Actions › should save order to server
- `pos-checkout.spec.ts:209` POS Cart - Order Actions › open order details and add a note
- `pos-checkout.spec.ts:225` POS Cart - Multiple Orders › should create a new order via tab
- `pos-open-orders-switching.spec.ts:63` POS open-orders tab switching › cart contents follow the selected order tab across switches

**J5. Coupon and quick discount** — 5 blocks in 3 spec files.

- `pos-coupon-apply.spec.ts:128` POS Cart - coupon application parity (live store) › applies a percent coupon through the cart and the server …
- `pos-coupon-checkout.spec.ts:146` POS Cart - coupon checkout (live store) › paying a couponed order applies the paid snapshot and clears its ca… — pro (runtime skip on free)
- `pos-coupon-checkout.spec.ts:293` POS Cart - coupon checkout (live store) › removing a coupon from a saved cart still checks out and pays — pro (runtime skip on free)
- `pos-money-oracle.spec.ts:574` POS money oracle — line taxes survive the round trip (live store) › a percent quick discount is a coupon line…
- `pos-money-oracle.spec.ts:603` POS money oracle — line taxes survive the round trip (live store) › a fixed quick discount is a coupon line: …

**J6. Variations (popover, expand, drill-in, stock filter)** — 17 blocks in 6 spec files (1 quarantined, 3 prefix-duplicates, 2 opt-in).

- `pos-variation-popover-states.spec.ts:94` POS variation popover option states › greys out a combination that does not exist once its partner is selected
- `pos-variation-popover-states.spec.ts:113` POS variation popover option states › greys out an option whose every variation sits outside the Stock Status…
- `pos-variation-popover-states.spec.ts:136` POS variation popover option states › a greyed option cannot be selected
- `pos-variation-popover-states.spec.ts:158` POS variation popover option states › offers an unsellable combination; Add to Cart follows Avoid overselling
- `pos-variation-stock-pill.spec.ts:58` POS expanded variations follow the Stock Status pill › shows every variation when cleared and only the matchi…
- `pos-variations-drill-in.spec.ts:7` drills into variations, adds a line and returns to products
- `pos-variations-drill-in.spec.ts:34` in the grid, a variable tile deals its variations as tiles and the parent tile goes back
- `pos-variations.spec.ts:193` POS Variations › should add variation to cart via popover attribute selection
- `pos-variations.spec.ts:213` POS Variations › should show expand link on variable product name — prefix-dup
- `pos-variations.spec.ts:220` POS Variations › should add variation to cart via expanded row plus button — prefix-dup
- `pos-variations.spec.ts:245` POS Variations › should collapse expanded variable product row
- `pos-variations.spec.ts:269` POS Variations › should add multiple variations to cart
- `pos-variations.spec.ts:316` POS Variations › should render the variation image the server sent — quarantined G2 (free/pro)
- `pos-variations.spec.ts:382` POS Variations › should increment quantity when adding same variation twice
- `products.spec.ts:107` Products in POS › should open variation popover when clicking variable product tile — prefix-dup
- `variation-sku-search.cold.spec.ts:45` Cold start — variation SKU search › the local catalogue starts (and stays) empty — .cold (E2E_COLD_START=1); pro-cold-start
- `variation-sku-search.cold.spec.ts:56` Cold start — variation SKU search › searching a variation SKU pulls the non-resident variation from the server — .cold (E2E_COLD_START=1); pro-cold-start

**J7. Refund** — 3 blocks in 1 spec files.

- `pos-refunds.spec.ts:211` POS refunds (Pro) › submits refund_destination=cash for a non-cash order — pro (runtime skip on free)
- `pos-refunds.spec.ts:254` POS refunds (Pro) › submits refund_destination=original_method when provider refunds are supported — pro (runtime skip on free)
- `pos-refunds.spec.ts:313` POS refunds (Pro) - real refund (live store) › refunds a completed order and the server records the refund — pro (runtime skip on free)

**J8. Offline sale and offline new customer** — 5 blocks in 3 spec files.

- `checkout-offline-tender.spec.ts:236` POS offline cash tender (live store, ADR 0040 Decided 1) › records a cash sale offline, tells the cashier it … — pro (runtime skip on free)
- `checkout-offline-tender.spec.ts:270` POS offline cash tender (live store, ADR 0040 Decided 1) › a cashier who moves on before the link returns sti… — pro (runtime skip on free)
- `checkout-tender.spec.ts:540` POS two-pane checkout (live store) › shows the offline badge when the till loses the store — pro (free excluded at collection)
- `pos-offline-new-customer.spec.ts:92` Cart: new customer while the store is unreachable (#1523) › attaches the customer at once, and the paid serve… — pro (runtime skip on free)
- `pos-offline-new-customer.spec.ts:221` Cart: new customer while the store is unreachable (#1523) › on the gateway pay page, a customer acknowledged … — pro (runtime skip on free)

**J9. Receipt and the Paid moment** — 3 blocks in 2 spec files.

- `checkout-tender.spec.ts:212` POS two-pane checkout (live store) › auto-prints the receipt on the receipt stage when the setting is on — pro (free excluded at collection)
- `checkout-tender.spec.ts:513` POS two-pane checkout (live store) › shows the Paid moment for a cash sale with change — pro (free excluded at collection)
- `pos-checkout.spec.ts:497` POS Checkout - real payment (live store) › a sale without the receipt leaves exactly one POS screen

**J10. Close the register (count, closure, closures in Reports)** — 3 blocks in 3 spec files.

- `register-closure.spec.ts:108` writes Closure 1 and leaves the last closure in the register panel
- `register-count.spec.ts:85` counts denominations, closes, and returns to the open register card
- `reports-closures.spec.ts:575` «viewport.name» › walks grouped closures, settled recount, reprint and CSV

**J11. Card terminal, reader device and send-away gateways** — 11 blocks in 4 spec files.

- `checkout-device.spec.ts:113` POS device capture with the simulated driver (live store) › «scenario» — pro (free excluded at collection)
- `checkout-tender.spec.ts:810` POS declared UI: a gateway that sends the customer away (live store) › sends an invoice, sends it again from … — pro (free excluded at collection)
- `checkout-terminal.spec.ts:101` POS terminal (server capture-mode) checkout (live store) › approves and closes the leg — pro (runtime skip on free)
- `checkout-terminal.spec.ts:163` POS terminal (server capture-mode) checkout (live store) › declines, then retries as a NEW row — pro (runtime skip on free)
- `checkout-terminal.spec.ts:225` POS terminal (server capture-mode) checkout (live store) › cancel is a request; a late capture wins — pro (runtime skip on free)
- `checkout-terminal.spec.ts:264` POS terminal (server capture-mode) checkout (live store) › deadline voids the leg — pro (runtime skip on free)
- `checkout-terminal.spec.ts:313` POS terminal (server capture-mode) checkout (live store) › leaving and reopening resumes the same leg — no se… — pro (runtime skip on free)
- `checkout-terminal.spec.ts:370` POS terminal (server capture-mode) checkout (live store) › reloading mid-capture completes once without takin… — pro (runtime skip on free)
- `checkout-terminal.spec.ts:464` POS terminal (server capture-mode) checkout (live store) › a reader held by another order is disabled with th… — pro (runtime skip on free)
- `pos-checkout.spec.ts:538` uses the legacy webview for built-in POS gateways even when supports_checkout=true
- `pos-checkout.spec.ts:573` falls back to the legacy webview when supports_checkout=false

**J12. Find a product (search, categories, filter bar, browse-by)** — 10 blocks in 5 spec files (3 quarantined).

- `pos-browse-by.spec.ts:117` Browse by categories › categories first: the root shows the category, drilling in shows the probe, the crumb …
- `pos-filter-bar.spec.ts:27` the filter bar renders the built-in pills
- `pos-filter-bar.spec.ts:34` a quick filter authored in the editor applies and clears its conditions from the bar — quarantined G6 (free/pro)
- `pos-filter-bar.spec.ts:98` a built-in pill can be hidden from the bar and shown again
- `product-category-filter.spec.ts:341` Product category filter › shows the products the store puts in a category, and hides the rest
- `products.spec.ts:13` «title»
- `products.spec.ts:76` Products in POS › should clear search and show all products
- `products.spec.ts:90` Products in POS › should show "No products found" for nonsense search
- `search-terms.spec.ts:8` preserves MY in cold and warm Georgian all-term searches — quarantined G4 (free/pro)
- `search-terms.spec.ts:73` finds a product when the typed words are reordered or separated — quarantined G4 (free/pro)

**J13. Fees, shipping and misc lines, and the money they save** — 11 blocks in 2 spec files.

- `pos-cart.spec.ts:221` POS Cart - save to server parity (live store) › a plain one-product cart saves with identical totals and no d…
- `pos-cart.spec.ts:310` POS Cart - Add Items Menu › should show the add-cart-item dropdown menu
- `pos-cart.spec.ts:321` POS Cart - Add Items Menu › should add a fee via the dropdown menu
- `pos-cart.spec.ts:334` POS Cart - Add Items Menu › should add shipping via the dropdown menu
- `pos-cart.spec.ts:347` POS Cart - Add Items Menu › should add a miscellaneous product via the dropdown menu
- `pos-cart.spec.ts:358` POS Cart - Add Items Menu › should close the dialog without adding an item
- `pos-money-oracle.spec.ts:452` POS money oracle — line taxes survive the round trip (live store) › a cart with a fee saves with identical pe…
- `pos-money-oracle.spec.ts:467` POS money oracle — line taxes survive the round trip (live store) › a cart with a shipping line saves with id…
- `pos-money-oracle.spec.ts:482` POS money oracle — line taxes survive the round trip (live store) › a misc product priced to a beyond-precisi…
- `pos-money-oracle.spec.ts:514` POS money oracle — line taxes survive the round trip (live store) › a mixed-tax-class cart saves with identic…
- `pos-money-oracle.spec.ts:638` POS money oracle — line taxes survive the round trip (live store) › a product + fee + shipping cart saves wit…

### Manager and back-office journeys

**J14. Back office: Products, Orders, Customers, Coupons pages** — 18 blocks in 4 spec files (1 prefix-duplicates).

- `coupons.spec.ts:28` Coupons Page (Pro) › Coupons page initial state — pro (runtime skip on free)
- `coupons.spec.ts:53` Coupons Page (Pro) › should search coupons — pro (runtime skip on free)
- `customers.spec.ts:138` Customers Page (Pro) › Customers page initial state — pro (runtime skip on free)
- `customers.spec.ts:163` Customers Page (Pro) › should search customers — pro (runtime skip on free)
- `orders.spec.ts:70` Orders Page (Pro) › Orders page columns and filters — pro (runtime skip on free)
- `orders.spec.ts:86` Orders Page (Pro) › should show orders or empty state — prefix-dup; pro (runtime skip on free)
- `orders.spec.ts:110` Orders Page (Pro) › should search orders — pro (runtime skip on free)
- `orders.spec.ts:181` Orders Page (Pro) › should open the order modal with its actions from the row — pro (runtime skip on free)
- `products-page.spec.ts:88` Products Page (Pro) › Products page initial table — pro (runtime skip on free)
- `products-page.spec.ts:102` Products Page (Pro) › should reorder rows when clicking the Name column header on Products page — pro (runtime skip on free)
- `products-page.spec.ts:216` Products Page (Pro) › should search products on Products page — pro (runtime skip on free)
- `products-page.spec.ts:314` Products Page (Pro) › should inline edit stock quantity and push the change to the server — pro (runtime skip on free)
- `products-page.spec.ts:379` Products Page (Pro) › should rename a product via the edit modal and push the change to the server — pro (runtime skip on free)
- `products-page.spec.ts:475` Products Page (Pro) › modal edit pushes a sparse payload even when the store serves poisoned fields — pro (runtime skip on free)
- `products-page.spec.ts:593` Products Page (Pro) › should show a revert snackbar and auto-revert when the server rejects a stock edit — pro (runtime skip on free)
- `products-page.spec.ts:663` Products Page (Pro) › should open a product's modal, with its record actions, from the row caret — pro (runtime skip on free)
- `products-page.spec.ts:687` Products Page (Pro) › should open a variation's modal, with sync, from its row caret — pro (runtime skip on free)
- `products-page.spec.ts:725` Products Page (Pro) › should collapse expanded variable product on Products page — pro (runtime skip on free)

**J15. Reports (Sales room)** — 4 blocks in 1 spec files (2 prefix-duplicates).

- `reports.spec.ts:14` Reports Page (Pro) › should navigate to Reports page — prefix-dup; pro (runtime skip on free)
- `reports.spec.ts:35` Reports Page (Pro) › should show the scope chips — pro (runtime skip on free)
- `reports.spec.ts:42` Reports Page (Pro) › should show the period cards — prefix-dup; pro (runtime skip on free)
- `reports.spec.ts:49` Reports Page (Pro) › should show print button — pro (runtime skip on free)

**J16. Settings** — 9 blocks in 1 spec files.

- `settings.spec.ts:16` Settings Area › settings navigation and General form
- `settings.spec.ts:34` Settings Area › should show Tax settings page
- `settings.spec.ts:42` Settings Area › should show Barcode Scanning page
- `settings.spec.ts:60` Settings Area › should show Theme page and list themes
- `settings.spec.ts:68` Settings Area › should leave the settings area
- `settings.spec.ts:83` Settings Area › should show Saved beside the edited store name only, then clear it
- `settings.spec.ts:202` Language Settings › should have a language set in settings
- `settings.spec.ts:225` Language Settings › should re-render the settings form labels in the new language
- `settings.spec.ts:237` Language Settings › should persist language after closing and reopening settings

**J17. Store health and Logs** — 5 blocks in 1 spec files.

- `logs.spec.ts:14` Store health · Logs › shows the stat header, preset chips and the flat ledger
- `logs.spec.ts:43` Store health · Logs › expands a ledger row to its inline detail
- `logs.spec.ts:54` Store health · Logs › filters the ledger via the sync preset chip
- `logs.spec.ts:83` Store health · Logs › the ledger starts directly below the controls, not down the page
- `logs.spec.ts:102` Store health · Logs › searches logs without breaking the ledger

**J19. Free store meets the Pro gates** — 8 blocks in 7 spec files.

- `coupons.spec.ts:120` Coupons Page (Free) › should show View Demo button on upgrade overlay — free (runtime skip on pro)
- `customers.spec.ts:121` Add Customer from Cart (Free) › should show add-customer menu item disabled for free users — free (runtime skip on pro)
- `customers.spec.ts:220` Customers Page (Free) › should show View Demo button on upgrade overlay — free (runtime skip on pro)
- `header.spec.ts:20` Upgrade Banner (Free) › should show upgrade banner for free users — free (runtime skip on pro)
- `orders.spec.ts:211` Orders Page (Free) › should show View Demo button on upgrade overlay — free (runtime skip on pro)
- `products-page.spec.ts:768` Products Page (Free) › should show View Demo button on upgrade overlay — free (runtime skip on pro)
- `reports-closures.spec.ts:680` «viewport.name» › Free › locks historical dates without issuing a closures request
- `reports.spec.ts:67` Reports Page (Free) › should show the day report, not an upgrade overlay — free (runtime skip on pro)

### App shell and cross-actor journeys

**J18. Navigate the app shell (drawer, viewports, layout prefs)** — 10 blocks in 4 spec files (1 prefix-duplicates).

- `navigation.spec.ts:6` Authenticated Navigation › should show the POS screen after login — prefix-dup
- `navigation.spec.ts:10` Authenticated Navigation › should be responsive on mobile viewport
- `navigation.spec.ts:15` Authenticated Navigation › should be responsive on desktop viewport
- `navigation.spec.ts:23` Drawer Navigation › should have all sidebar navigation buttons
- `navigation.spec.ts:41` Drawer Navigation › drawer items below the fold stay reachable on very short viewports
- `navigation.spec.ts:58` Drawer Navigation › should navigate to Support page
- `navigation.spec.ts:65` Drawer Navigation › should navigate to a page and back to POS
- `pos-panel-resize.spec.ts:14` resizes the visible POS products panel
- `pos-scroll-settings.spec.ts:15` POS products scroll position survives a Settings round-trip
- `products.spec.ts:55` Products in POS › product view-mode round trip

**J20. Store-side changes reach the till (arrival, visibility)** — 4 blocks in 2 spec files.

- `product-visibility.spec.ts:249` POS visibility (online-only products) › an online-only product leaves the POS and returns when it is revealed
- `server-created-visibility.spec.ts:161` a product created on the server reaches the products grid without a search — pro (free excluded at collection)
- `server-created-visibility.spec.ts:332` an order created on the server reaches the orders grid without a search — pro (free excluded at collection)
- `server-created-visibility.spec.ts:493` a customer created on the server reaches the customers grid without a search — pro (free excluded at collection)


### Blocks that fit no journey (keep their own specs)

**O** for the counts; **I** for the grouping. 132 blocks. 86 of them (N1) are harness pure logic (84 never request a page; the 2 `store-pick.unit` blocks load static markup). 83 of the 86 collect in both authenticated projects, because nothing in `playwright.config.ts` separates them from browser specs (**O**: no `testIgnore` for `.unit.spec.ts` or the pure-logic files); the other 3 sit in `politeness-1129.live.spec.ts`.

| Group | Kind | Blocks | Spec files (blocks) |
|---|---|---:|---|
| N1 | Harness pure logic (no browser) | 86 | `cashier-slot.spec.ts` (2), `coupon-probe.spec.ts` (3), `money-oracle-guards.unit.spec.ts` (11), `order-cleanup.spec.ts` (8), `order-lifecycle.unit.spec.ts` (11), `permalink-transport.unit.spec.ts` (6), `politeness-1129.live.spec.ts` (3), `quarantine.spec.ts` (4), `search-probe.spec.ts` (31), `store-login-retry.spec.ts` (5), `store-pick.unit.spec.ts` (2) |
| N2 | Probe / fixture guards | 2 | `search-probe.spec.ts` (2) |
| N3 | Protocol, transport and update-required | 4 | `protocol-signal.spec.ts` (1), `rest-route-transport.spec.ts` (1), `update-required.spec.ts` (2) |
| N4 | Hostile edge and host-blocked connect errors | 6 | `host-blocked-errors.spec.ts` (5), `hostile-headers.ts` (1) |
| N5 | Auth / connect (unauthenticated) | 6 | `auth.spec.ts` (6) |
| N6 | Perf gates (timing, heap, politeness walk) | 3 | `search-heap.spec.ts` (1), `search-latency.spec.ts` (1), `search-walk.spec.ts` (1) |
| N7 | Opt-in perf (.perf, search-performance config) | 6 | `search-responsiveness-probe.perf.spec.ts` (2), `search-responsiveness.electron.perf.spec.ts` (1), `search-responsiveness.perf.spec.ts` (3) |
| N8 | Opt-in live proofs (.live, own configs) | 6 | `ghost-prune.live.spec.ts` (2), `politeness-1129.live.spec.ts` (1), `pro425-store-pricing.live.spec.ts` (1), `server-down-1135.live.spec.ts` (1), `session-recovery.live.spec.ts` (1) |
| N9 | Opt-in soaks (playwright.soak.config.ts) | 2 | `idle-backfill.live.spec.ts` (1), `tick-403-soak.live.spec.ts` (1) |
| N10 | Opt-in captures (CAPTURES=1) | 8 | `auth-captures.spec.ts` (2), `coupons-captures.spec.ts` (1), `customers-captures.spec.ts` (1), `orders-captures.spec.ts` (1), `products-captures.spec.ts` (1), `register-captures.spec.ts` (1), `settings-captures.spec.ts` (1) |
| N11 | Multi-tab ownership (live tab) | 3 | `live-tab.spec.ts` (3) |

## 5. What the captures shoot, and what the soaks sample

### The seven `*-captures.spec.ts`

**O** All seven share one shape: a module-level `test.skip(process.env.CAPTURES !== '1', …)`, then three nested loops creating a describe `${device}-${colorScheme}-${step}` per combination. Devices: `tablet` 1024×768 and `phone` 390×844. Colour schemes: `light`, `dark` (Playwright `colorScheme`). Scales: `compact`, `regular`, `spacious`, applied as a style tag of `scaleVariables(step, 'coarse')` from `@wcpos/components/lib/scale` scoped to `:root` and `[style*="--spacing:"]`, BEFORE each state is entered and removed after it. That is 12 combinations per block. `hasTouch` is on for phone only, except `auth` and `register` where it is on for both. Each state is a viewport `page.screenshot` to `info.outputPath('<combo>--<state>.png')`, attached as `<area>-captures-<state>`. A settle of `SETTLE_MS = 350` (one pane entrance of 280 ms plus a frame) precedes each shot. A state that cannot be reached is recorded as a `skip-state` annotation, not a failure; `register` also saves a `<state>--skipped.png` diagnostic.

| Spec | Blocks | States per combination (in order) | Runs × states when `CAPTURES=1` |
|---|---:|---|---:|
| `auth-captures` | 2 | `first-run`, `typing`, `discovery-error`; `one-site-with-users`, `selected-user-with-stores`, `open-pos-enabled` | 24 runs, up to 72 PNGs |
| `coupons-captures` | 1 | `list`, `row-hovered` (tablet only), `status-popover`, `status-set`, `clear-all-visible`, `display-options`, `searching`, `no-results`, `loading` (`searching` and `loading` only if reached) | 12 runs, up to 108 |
| `customers-captures` | 1 | `list`, `row-hovered`, `display-options`, `searching`, `no-results`, `loading` | 12, up to 72 |
| `orders-captures` | 1 | `list`, `date-day-headings`, `row-hovered`, `pane-open`, `pane-as-page`, `status-popover`, `status-set`, `clear-all-visible`, `date-popover`, `display-options`, `searching`, `no-results`, `loading` | 12, up to 156 |
| `products-captures` | 1 | `list`, `variable-expanded`, `chip-set`, `clear-all-visible`, `display-options`, `searching`, `no-results`, `loading` | 12, up to 96 |
| `register-captures` | 1 | `session-open-empty-cart`, `line-just-added`, `cart-with-lines`, `line-strip-revealed`, `quantity-keypad-open`, `order-sheet-open`, `open-orders-list` (only if the open-orders count shows), `cart-settings`, `register-panel`, `movement-sheet`, `products-no-results`, `products-settings`, `variations-drill-in-table`, `variations-drill-in-grid`, `variation-popover-inline`, `tender-keypad`, `split-open`, `paid` (the last two need a manual cash tender; `paid` makes a real sale) | 12, up to 216 |
| `settings-captures` | 1 | `index`, `general`, `general-saved`, `general-restore`, `tax`, `printing` (settle 2,500 ms), `printing-delete` (opened, never confirmed), `theme`, `barcode-scanning`, `customer-display` | 12, up to 120 |

- **O** `register-captures.spec.ts`'s header names what it does NOT shoot: closed register, counting, overdue, closure, offline, terminal moment and twelve open orders ("captured at the live review (these require dedicated fixtures)"). It also checks the checkout ledger header's y position is the same across states (`checkHeader`).
- **O** The captures collect in BOTH `free-authenticated` and `pro-authenticated`, so with `CAPTURES=1` each runs twice (once per store variant) unless `--project` narrows it. **NE** Which project the board builder reads.
- **O** `playwright.gallery.config.ts` is a separate suite (`testDir: './gallery'`), not these captures.

### The two soaks (`playwright.soak.config.ts`)

**O** One worker, no retries, `timeout: 1_000_000`, `video: 'off'`, `trace: 'retain-on-failure'`; `BASE_URL` is required (a served `web-build`); the store is `SOAK_STORE_URL` → `E2E_STORE_URL_PRO` → `https://dev-pro.wcpos.com`, and the variant follows `SOAK_STORE_VARIANT` or the `dev-free.*` hostname. Both self-authenticate (no shared `globalSetup`) and check the served bundle's identity against the worktree's `web-build` (`served-bundle-identity.ts`).

| | `idle-soak` → `idle-backfill.live.spec.ts:164` | `tick-403-soak` → `tick-403-soak.live.spec.ts:95` |
|---|---|---|
| Question | Do the trickle lanes run unprompted in a real idle session (#1279, #1286, #1281)? | Does a `/wcpos/v2/changes/tick` that answers 403 forever grow the renderer (broparts.ge 2026-09-15, 3.2 GB tab)? |
| Setup | authenticate and wait for catalogue; 20 s settle; click `db-check-everything` | `page.route` fulfils every tick with 403 `rest_forbidden` (OPTIONS answered 200 for CORS); CDP `HeapProfiler` + `Performance.getMetrics` |
| Window | `SOAK_MS`, default `DEFAULT_IDLE_SOAK_MS = 12 min` (`idle-backfill-soak-duration.ts`); timeout soak + 8 min | `WARM_UP_MINUTES = 11` + `SOAK_MINUTES` (default 12; minimum enforced so re-warm, plateau and tail do not overlap) |
| Cadence | one log line every 15 s | one sample every `SAMPLE_EVERY_MS = 30_000`, scheduled against elapsed time; types `brake` every `TYPE_EVERY_MS = 120_000` with `KEY_GAP_MS = 400`, then deletes it |
| What is sampled | wire traffic only: census probes (`per_page=1`), ordered product trickle pages, customer trickle pages, `include=` variation pulls; product payloads parsed for variable parents and their variation ids | per sample: `label`, tick count, `heapUsed`, DOM `nodes`, `listeners`, long-task count and ms. One forced GC at the steady sample (minute 11, labelled `-collected`), then 2 re-warm samples, then uncollected samples; a final `after-gc` collected sample |
| Windows | idle window = the whole soak after the click | plateau = first 4 uncollected samples, tail = last 4 (`TAIL_WINDOW = 4`, the last two minutes) |
| Gates | ≥5 new census probes within 240 s of the click (9 collections, coalescing allowed); ≥1 ordered product page pull in the idle window; ≥1 variation `include` pull **only when** a resident variable parent still has an unfetched variation (else annotated "NOT EVALUATED" with the reason) | every sample < `HEAP_CEILING_BYTES` 768 MB; tail mean / plateau mean ≤ 1.25; after-gc / steady heap ≤ 1.25; nodes and listeners after-gc / steady ≤ 1.5; ≥2 ticks seen and more ticks at the end than at the steady sample |
| Output | `[soak] t+Ns productPages= customerPages= variationPulls= census=` console lines; a skip-reason annotation | CSV attachment `tick-403-soak.csv`, columns `label,ticks,heapUsed,nodes,listeners,longTasks,longTaskMs`; a summary annotation and console line (`warmUpMinutes … steady … plateau … tail … max … afterGc … nodes a→b listeners a→b longTaskMs`) |

- **O** `search-heap.spec.ts:93` (default CI, quarantined G7) is the in-matrix sibling of the tick soak: same `HEAP_CEILING_BYTES = 768 MB`, `MAX_RETAINED_OVER_BASELINE = 1.25`, `MAX_NODES_OVER_PLATEAU = 1.5`, plus `LONG_TASK_BUDGET_MS = 2_000`, over `SEARCH_HEAP_CYCLES` (default 30) committed searches; it has no tail-over-plateau heap gate (its header explains why).
- **O** The other five `.live` specs each have their own one-project config (`playwright.ghostprune|politeness1129|pro425|session-recovery|verify1135.config.ts`, one worker, no retries).

## 6. What this means for the reorganisation ticket (#516)

- **O** A third of the "E2E" blocks are not browser tests. 86 pure-logic blocks (30 in `.unit.spec.ts`, 56 inside ordinary spec files, 31 of them in `search-probe.spec.ts`); 83 of them collect in both authenticated projects. Any count of "journeys vs blocks" has to separate them first: of the 239 blocks that run in `pro-authenticated`, 83 never request a page, leaving 156.
- **I** The cashier journeys are spread thin across screen-named files. J2 "sell to a guest" draws on 5 spec files, J6 variations on 6, J11 terminal on 4, and the Free gate checks (J19) sit in 7 files, four of them the same two-assertion "View Demo" test copied per page. The longest live journeys already exist (`checkout-tender`, `pos-checkout:315`, `pos-coupon-checkout`, `checkout-terminal`), and 13 shorter blocks are prefix-duplicates of them or of their neighbours.
- **O** The data a reorganisation would weigh by is thin: `spec-timings.json` is per file, two months old, and missing 42 of 78 files including every heavy live checkout spec; 3 of the 5 in-CI perf gates are quarantined (G7), so they currently do not gate; the 2026-11-03 handoff records that quarantined timing cases still cost retry time on shards 3 and 5 (O in the handoff, NE here).
