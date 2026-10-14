# Test-suite sweep — what the pile actually costs, and what to do about it

Date: 2026-10-14 (overnight run). Repos: `wcpos/woocommerce-pos` (free), `wcpos/woocommerce-pos-pro`, `wcpos/monorepo`. Lanes: `main` and `next`.

Paul's worry: every AI-written feature adds tests, nothing is removed, and the suite gets slower to run. Two questions: which tests are safe to delete or merge, and how do we cut the overhead of running them.

## 1. Measured — where the time goes

| Suite (lane `next`) | Count | Pure test time | CI job | What gates a PR |
|---|---|---|---|---|
| free PHPUnit | 6,112 tests (5,308 methods, 548 files) | 14.4 min, median 0.14 s | Smoke 17 min → matrix 8 × 12–17 min ∥ coverage **58 min** (Xdebug) | Smoke only (rulesets + `merge-gate.sh`) |
| pro PHPUnit | 931 tests | 2.5 min | Smoke 5 min → matrix 8 × 4–6 min ∥ coverage 12 min | Smoke only |
| monorepo Jest | 1,318 files | — | Unit 7 min, Lint 8 min, Gallery 9 min, in parallel | all |
| monorepo Playwright | 79 specs | — | already 4 shards, 6–13 min each; the 72-min "shared-store queue" is serialisation across PRs, not test count | — |

Source: run 38417778077 (free), 38403032567 (pro), junit artifacts summarised with `junit-slow.py`.

The decisive fact: **no slow tests.** 3,065 free tests take < 0.1 s and 2,882 take 0.1–0.5 s; six take over 5 s. The cost is WordPress's per-test fixture/transaction overhead × 6,000. Deleting 20 % of the suite saves ~3 min of a 17-min job; the structure is what's expensive.

What a free PR actually waits for is the 17-min smoke job (889 s of PHPUnit + 80 s wp-env boot). The 58-min coverage job and the 8-job matrix run on every PR but gate nothing.

## 2. Audited — how much is actually redundant

Nine read-only Codex (GPT-6 Astra) audits read every test folder on `next` against a fixed rubric (duplicate / tautological / dead / over-granular provider / consolidation / testing-the-framework), with "clearly" defined as *a second engineer would agree in 30 s*, and regression tests naming a ticket, contract tests pinning a public shape, and storage-dependent HPOS twins all protected.

| Scope | Methods / blocks screened | Clearly removable | ≈ time |
|---|---|---|---|
| free `tests/includes/API` | 1,532 | 38 executions | 5 s |
| free top-level, Templates, Admin, Payments, Gateways, updates, Abstracts, Integrations | 1,399 | 77 | 10 s |
| free `Sync` | 1,073 | 12 | 2 s |
| free `Services` | 1,291 | 26 | 4 s |
| **free total** | **5,295** | **~153 (3 %)** | **~21 s of 14 min** |
| monorepo `packages/core` | ~5,000 | 32 blocks (2 whole files) | unmeasured |
| monorepo database / sync-core / sync-engine / query | 3,104 | 28 blocks (19 in one file) | unmeasured |
| monorepo components / printer / hooks / utils / scanner / apps/main | 2,981 | 15 blocks | unmeasured |
| monorepo Playwright | 315 | 33 blocks (20 deletes, 23 → 10 merges) | real: each is a browser journey |

So the suites are **not padded** — 3 % is hygiene, not a time fix. The one exception is Playwright, where a tenth of the blocks are prefix-duplicates of longer journeys ("navigate to Coupons and see the list" is the first three lines of "show coupon data or empty state").

What the AI-written junk looks like, concretely (each found in the code, with file:line in the audit reports):

- **The test re-implements the logic and tests the copy.** `packages/database/src/plugins/reset-collection.test.ts`: 19 blocks exercise hand-written `isManagedCollection` / hook / RxJS logic defined inside the test file; production removed the `fast_store` branch they encode and the tests stayed green. `data-table/header.test.tsx` has a local copy of `getNextSortDirection`.
- **Tests the framework, not us.** Two whole files (`i18next-v25.test.ts`, `translation-provider.test.tsx`) construct i18next with inline resources and assert i18next's own behaviour; `TranslationProvider` is never mounted. Free `Test_Card_Gateway` / `Test_Cash_Gateway`: 16 methods compute cashback/change arithmetic *inside the test* or write order meta with `update_post_meta` and read it back — the gateway class is never called.
- **Mock-echo and existence checks.** `assertTrue(true)` endings, `class_exists()`-only tests, `CACHE_TTL === HOUR_IN_SECONDS`, `META_KEY` compared with the alias it is defined from, "register and call wake callback" that asserts the callback is a function.
- **Benchmarks in the unit suite.** `Test_Meta_Data_Benchmark` (11.4 s, the slowest test in the repo) prints timings and ends in `assertTrue(true)`.
- **Prefix duplicates** (Playwright, and the free `*_Controller` vs `Test_Term_Controllers_Parity` pairs): a short test whose every line is the opening of a longer test.
- **One-field-per-test on a full fixture.** `Test_Store_Abstract`: 27 methods each read one default getter off the same `Store`; `Test_Auth_API` recreates three users per test for one boolean.

## 3. Researched — what the literature says (sources in `scratchpad` notes; the load-bearing ones)

- **One test per behaviour, not per method or per assertion** — Google SWE book ch. 12 ("test behaviours, not methods"; "the ideal test is unchanging"); Khorikov's four-property score (regression protection × refactor resistance × fast feedback × maintainability — one zero makes the test worthless). Several assertions on one fixture describing one behaviour belong in one test. The thing to avoid is the opposite: unrelated behaviours jammed into one test so a failure can't say what broke.
- **Change-detector tests are harmful** — tests that assert *which calls* the code makes rather than what it produces (Google Testing Blog). This is exactly the mock-echo shape above.
- **Mutation testing is the objective "is this test testing anything"** — Infection (PHP) runs only the tests covering a mutated line and can restrict to `--git-diff-lines`; Stryker for JS. A test that kills no mutant another test doesn't is the formal definition of redundant.
- **Coverage finds untested code; it does not grade tests** (Fowler). PHPUnit already marks assertion-free tests *risky* — `failOnRisky` turns that into a failure.
- **Speed levers with numbers:** PCOV ≈ 2.8× faster than Xdebug for line coverage (Bergmann, Dec 2025: 18.9 s vs 53.5 s) but PCOV is unmaintained and needs a patch on PHP 8.4 — Bergmann himself went back to Xdebug *switched on only for the coverage run*. PHPUnit has no `--shard`; ParaTest does, but needs a DB per process under WordPress. `wpSetUpBeforeClass` for read-only fixtures ("per-test fixtures can dramatically decrease performance" — WP core handbook). WordPress core itself runs 68 jobs on PRs and the full 182-job matrix weekly, with a label to opt a PR into the full matrix. Meta's predictive test selection runs a third of dependents and catches > 99.9 % of regressions.
- **Machine-written tests:** Meta's bar (TestGen-LLM) — builds, passes reliably, *adds coverage*; only 25 % of generated tests cleared it.

## 4. Done tonight

| PR | Lane | What | Effect |
|---|---|---|---|
| wcpos/woocommerce-pos#2234 (merged 2026-10-13 23:08Z) | `main` (→ sync PR to `next`) | smoke job sharded 4 ways with a fan-in keeping the `Smoke Test (Latest Stable)` check name; coverage only on trunk pushes; outbound HTTP blocked in the test bootstrap | measured on the PR: shards 4m18s–5m53s (was 17 min); 58 CI-minutes of Xdebug per PR gone |
| wcpos/woocommerce-pos#2237 (merged 2026-10-14 ~00:00Z) | `next` | cherry-pick of #2234 onto `next` plus the REST base-class guard (the routine `main → next` sync is 27 commits behind with nine unrelated conflicts — left for its own PR) | same effect on the development lane; shards 4–6 min |
| wcpos/woocommerce-pos#2238 (merged 2026-10-13 23:50Z) | `main` | the REST base-class guard and the two `Test_Received*` classes moved onto it | the leak sharding exposed, closed on both lanes |
| wcpos/woocommerce-pos#2235 (merged 2026-10-13 23:00Z) | `next` | the audited executions: deletes, merges keeping every assertion (each carries a message naming the original method), benchmarks moved to `@group benchmark` (excluded by default), 7+3 storage-independent methods no longer re-run under the HPOS twin, two emptied files removed | −149 executions (≈ 21 s); every touched class run locally: 1,141 tests, 0 failures |
| wcpos/monorepo#2538 (merged 2026-10-13) | `next` | the audited Jest blocks (two files deleted outright, the 19-block mock-logic file cut to the one real test) and the Playwright prefix-duplicates (20) / merges (23 → 10) | −105 blocks; every touched Jest file run: 355 tests, 0 failures; Playwright validated by the PR's E2E lane |

`main` gets the content sweeps when 2.0 promotes `next`; nothing on `main` is hot enough to justify a separate sweep with its own sync conflicts.

**What sharding found on its first run** — a real suite-isolation defect, fixed in #2234: `Print_Jobs_Controller_Test` renders receipts for stores in other locales; production switches locale and the translation loader **downloads the real language files from the CDN during the test run** (87 KB each — `de_DE`, `es_ES`, `ja`, `fr_FR` observed) into `WP_LANG_DIR/plugins`, outside the per-test transaction. Any later class that asserts on translations sees them; the unsharded run passed only because `Test_I18n_Storefront` happened to run first. Fix: `tests/bootstrap.php` refuses every unstubbed outbound HTTP request (priority 1, so a test's own stub still wins). Full suite with the block: 5,964 tests, nothing downloaded, no new failures. Two wrong guesses (a file planted at the wrong path, a `WP_Textdomain_Registry` reset) cost an hour; what found it was bisecting the shard's file order with the storefront class pinned last — ~7 runs of ~2 min.

**The second one, on `next` (#2237, companion on `main`):** shard 3 opened with a WCPOS REST test file, and four `Test_Error_Reporter` REST tests got `401` instead of their stub route's 500. `WCPOS_REST_Unit_Test_Case` hooks `rest_api_init` before `parent::setUp()`, so the run's *first* REST test case is baked into the framework's hook snapshot and boots the whole API (auth guard included) into every later test's server; its own dropper only shielded later REST cases. Fix: a static `$active` so a callback belonging to another instance returns early. Both finds have the same shape — the unsharded run was green only by accident of file order — and the same cure: a one-process run of the shard's file list with the target pinned last, then bisect.

The REST base-class fix went to `main` as woocommerce-pos#2238 (merged 2026-10-13 23:50Z, three review rounds: the guard moved out of the overridable `rest_api_init()` into a `final` dispatcher after the reviewer found four subclasses overriding it, and the two `Test_Received*` classes that extended `WC_REST_Unit_Test_Case` directly were moved onto the base).

**A third, different in kind — a statistics flake, not an order fault:** `Test_Order_Save_Query_Budget::test_pos_open_order_save_stays_within_the_rows_examined_budget` (a rows-examined gate that seeds 128 orders, `ANALYZE TABLE`s, and asserts the uuid lookup stays under 1,500 rows) passed on one #2237 run and failed on the next with the identical shard-2 file list — the EXPLAIN shows the optimizer driving from `wp_posts` (`type_status_author`, 67 rows × 25 meta) instead of the `meta_key` index. Its own docblock says 128 orders is "2× the measured flip threshold" and that the plan is not portable across DB images; whatever committed rows earlier classes leave in the shard moves that threshold. It also failed in the first local shard reproduction. Paul chose "clean the table before `ANALYZE`"; measured first: the class alone ×3 passes, after either suspected fixture-leaving class passes, after the **full 70-file prefix it fails deterministically** — cumulative fragmentation, not one class's leftovers, degrading InnoDB's sampled statistics. `OPTIMIZE TABLE` before `ANALYZE` in the three budget families' `analyze_fixture_tables()` makes the same prefix pass (852 tests) and all eight budget classes pass together — woocommerce-pos#2239 (`next`) / #2240 (`main`).

**A guard that already exists:** the monorepo's Lint lane fails any PR that deletes tests or drops a file by more than 3 without a `Test-Removal: <why>` trailer (ruling R15). #2538 tripped it, which is the guard doing its job; it is the right shape for the free plugin too.

## 5. Proposed policy (for the repos' CLAUDE.md / review rules — not yet adopted)

**Deletion test** — a PR may delete or merge a test when it can name which applies: (1) asserts nothing about our code (constant, existence, mock-echo, logic copied into the test) — turn on `failOnRisky`; (2) tests WordPress/WooCommerce/React/a library; (3) is a strict prefix or subset of another test on the same path; (4) its feature was removed — the removing PR deletes its tests; (5) flaky in quarantine > 7 days.

**Shape rules for new tests** — one test per *behaviour*; a new input for an existing behaviour is a new data-provider row, not a new method; a bug fix is a row or a named regression test (`test_..._regression_1234`), never a near-copy; read-only WordPress fixtures in `wpSetUpBeforeClass`; benchmarks and live probes in opt-in `@group`s; a test must call production code — if the expected value is computed in the test body, the test is testing itself.

**Review line for AI-written tests** — "does this test fail if the production line it names is deleted?" One mutation check per PR on the money path (the `review-delegated-diffs` rule already asks for this).

**CI tiering** — PR: sharded smoke + lint + PHPStan (free: ~6 min after #2234); push to trunk: the version matrix + coverage; weekly: the oldest WP/WC/PHP row. Jest `--changedSince` on PRs is the next lever if the 7-min unit job becomes the wait.

## 6. Not done / open

- Mutation testing (Infection / Stryker) was researched, not run — a one-package trial would turn "clearly redundant" from judgement into measurement.
- A timing-weighted shard split (the junit artifact has per-test times) if the round-robin shards land unbalanced.
- Free's three `Test_Pos_Uuid` multisite-contention tests sleep 5 s each and `Test_Auth_Service` / `Test_Session_Registry` sleep 6 s in total — 21 s of real wall-clock, as much as the whole redundancy sweep; they are testing time-based behaviour and need a clock seam, not deletion.
