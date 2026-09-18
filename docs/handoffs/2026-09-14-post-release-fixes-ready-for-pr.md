# Handoff — post-release fixes ready for PR preparation

Snapshot: **2026-09-14, 14:32 UTC**. Follow-up to [the original outstanding-items handoff](2026-09-14-post-1.10.13-outstanding.md).

## Status update — 2026-09-14, later session

**All three PRs below were merged by the owner at 16:36 UTC on 2026-09-14; the three worktrees were removed.** Remaining owner-directed action: dispatch Free's `release.yml` with `version=1.10.13` to backfill the missing zip (item 5). Pro's `release.yml` already carries the same dispatch with a Free-tag pin.

All three branches were rebased onto `origin/main`, revalidated at the current tip, pushed, and opened as ready-for-review PRs targeting `main`:

- Search lifecycle → [monorepo#2044](https://github.com/wcpos/monorepo/pull/2044) (rebased over #2039; churn suite 61/61, database 41 suites/496 tests, typecheck and lint clean; Codex review found nothing; CodeRabbit found that the premium `close()` leaves the `_flexsearch` collection registered and its `onClose` hook retains the index, so a second commit closes the destination collection on teardown)
- Release coverage + runbook → [woocommerce-pos#1985](https://github.com/wcpos/woocommerce-pos/pull/1985). **[#1984](https://github.com/wcpos/woocommerce-pos/pull/1984) merged the `release.yml` recovery path first**, so the workflow change was dropped and the decision test was rewritten against #1984's gate (nine cases, including "published release already carrying the zip is refused").
- Pro RC bootstrap → [woocommerce-pos-pro#569](https://github.com/wcpos/woocommerce-pos-pro/pull/569) (main had not moved; recorded validation stands)

The "GitHub App authentication" blocker below was not a rule in this owner's instructions; the personal `gh` login is the sanctioned one here. Nothing merged, released, or backfilled.

## Start here

Three focused fixes are **committed locally in clean worktrees**. This session has not pushed them, opened PRs, merged, dispatched releases, or backfilled assets. The owner approved separate PRs, with no merging or releasing as part of this task.

**Publication blocker:** the observed `gh` login is a personal OAuth login, whereas the canonical rules require GitHub App authentication. A sanctioned local App token/helper was requested but not supplied. OAuth is not a PAT; the blocker is the required authentication method, not a claim that the existing credential is a PAT. Resolve the helper location or get an explicit owner ruling before publishing. Do not put credentials in this document or logs.

1. Load the canonical rules and each target repository's instructions. Reuse the worktrees below; leave the shared main checkouts alone.
2. Once approved authentication is available, fetch the relevant remotes and check for existing/open/merged PRs with these branch names before creating duplicates. Read any PR body before its diff.
3. Refresh each branch against `origin/main` inside its own worktree. Preserve the intent below and the newer main changes; rerun applicable validation after reconciliation. No force push is needed for these unpublished local branches.
4. Open separate PRs targeting **`main`**. Include observed tests, the broad-suite OOM blocker, behavior changes, and the exact remaining verification limits. Monitor CI/review feedback; do not merge or release without further direction.

One independent implementation/doc review round completed with no actionable findings. The original implementation budget was 350 changed non-test lines; approximately **108 including the runbook** were used. Carry that shared budget and the two-round review limit forward when continuing the same work.

## Local commits and locations

All paths below are under `/Users/kilbot/Projects/`.

| Repository / PR base | Worktree | Branch | Commit |
|---|---|---|---|
| `wcpos/monorepo` / `main` | `monorepo-v2/.worktrees/post-release-search` | `fix/post-release-search-lifecycle` | `85a739e2b4` |
| `wcpos/woocommerce-pos` / `main` | `woocommerce-pos/.worktrees/post-release-recovery` | `fix/post-release-recovery` | `709ac4ac` |
| `wcpos/woocommerce-pos-pro` / `main` | `woocommerce-pos-pro/.worktrees/post-release-roles` | `test/post-release-roles` | `157b1f2` |

**Observed local tracking refs at this snapshot:** search is ahead 1 / behind 4 of `origin/main`; Free is ahead 1 / behind 6; Pro is ahead 1 / behind 0. These are not a fresh GitHub PR inventory; fetch and recheck before publishing.

### Search lifecycle — original item 1

Files: `packages/database/src/plugins/search.ts`, `scripts/rxdb-premium-flexsearch-churn.test.mjs`.

- Uses a per-source-collection promise queue around initialization and recreation. LRU eviction touches other locales, so serialization deliberately covers the source collection, not only a locale.
- Includes initialization already in flight before recreation begins; rejected operations do not poison later queued operations.
- Eviction/recreation close the source pipeline and search instance. Nested `finally` blocks attempt index shutdown and remove the destination's `__wcposAppendIndex` back-reference even when shutdown rejects.
- Restores the removed coverage and extends it: real patched ESM/CJS map cleanup, pipeline/index shutdown failures, and initialization/recreation interleavings.
- Scope is the four deferred findings, not a general rewrite of source-collection `onClose` or the oversized-index rebuild path. No vendor patch anchors added.

**New main change to preserve during refresh:** [monorepo#2039](https://github.com/wcpos/monorepo/pull/2039), commit `a5f9182d2a`, edits the same churn test file and adds a comment to the patch script. Keep its vendor-behavior test alongside this branch's lifecycle tests. It landed after this branch's recorded validation.

### Release recovery/runbook — original items 4 and 8

Files: `.github/workflows/release.yml`, `.github/workflows/tests-js.yml`, `.github/scripts/test-release-workflow.sh`, `.github/scripts/test-check-opfs-worker-drift.sh`, `docs/release-runbook.md`.

- Adds manual `version` input (without `v`), checks out the existing version tag, validates the plugin header, requires an existing release, and bypasses the unchanged-version skip.
- Rebuilds/replaces the ZIP only; does not create/publish a release or deploy WordPress.org.
- Existing OPFS drift logic already compared the vendored worker with the newest stable bundle tag in the plugin's major/minor line on every main PR. Added behavioral release-bump coverage, not another production gate.
- The runbook records workflow consumers, bundle → worker → plugin ordering, recovery, owner-controlled release scope, and one layer per release-blocking PR.
- `docs/` is ignored in Free; this explicitly requested runbook was deliberately force-added to the commit. Do not drop it as an accidental ignored file.

### Pro RC bootstrap — original item 6

Files: `tests/bootstrap.php`, `tests/includes/Test_Bootstrap_Roles.php`.

Exact small port of Free #1959: rebuild the roles global at `wp_loaded`, after installs, so role objects contain WooCommerce capabilities. **23 bootstrap additions, 65 test lines, zero production changes.** Pro has its own bootstrap; Free's earlier PR-body claim that Pro automatically reused it was incorrect.

## Recorded validation — do not promote to current-tip results

These commands exercised the local commits above, before branch refresh. Exit statuses were checked directly. Run suites/builds one at a time; cap Jest/Vitest workers explicitly.

| Check | Observed result |
|---|---|
| Search churn/lifecycle suite, final tests against original production file | Exit 1: 48 passed, **12 failed**, no skips |
| Same final suite against lifecycle fix | Exit 0: **60 passed**, no skips |
| Database package `pnpm run test --maxWorkers=2` | Exit 0: **41 suites / 496 tests passed** |
| Database package `pnpm run lint` | Exit 0; four warnings in untouched `types.d.ts` |
| Database package `pnpm run typecheck` | Exit 0 |
| Root `node --test --test-concurrency=1 scripts/*.test.mjs` | Exit 0: **749 passed**, no skips |
| Root `pnpm test --concurrency=1 -- --maxWorkers=2` | **Exit 1**, two core Jest workers exhausted their heaps; not a full-suite pass |
| Free release-decision behavioral tests | Expected red exit 1 before fix; green exit 0, seven cases |
| Free worker-drift fixtures and actionlint on changed/relevant workflows | Exit 0 |
| Pro RC targeted tests, before → after fix | Four failures → four passing tests / 12 assertions |
| Pro RC full PHPUnit, before → after fix | 519 tests / 103 failures → **519 tests / 1,891 assertions / zero failures**; same two skips |
| Pro full Composer lint with `--parallel=2`, PHP syntax, new test PHPCS | Passed; direct bootstrap PHPCS had identical 16 baseline/fixed errors |

The root OOM failures were `packages/core/src/screens/main/pos/cart/edit-cart-customer.test.tsx` and `packages/core/src/screens/main/logs/ledger.test.tsx`; core reported 315 passing suites and 2,655 passing tests before the run aborted. Broad compatibility and the cause of those OOMs were **not established** by an old/new full-suite comparison.

Free's full PHP lint was blocked by missing `phpcs` (exit 127). `pnpm run lint:php` unexpectedly initiated an automatic install and was interrupted (130); no manifest/lock changes were retained. The existing drift test has two pre-existing shellcheck findings (SC1090/SC1007); the new release test passed shellcheck. Live release checkout/build/upload was **not run**.

### Reproduction commands and setup

Search commands run from its worktree root, except package commands above which run from `packages/database`:

```sh
node --test --test-concurrency=1 scripts/rxdb-premium-flexsearch-churn.test.mjs
node --test --test-concurrency=1 scripts/*.test.mjs
```

Free commands run from its worktree:

```sh
bash .github/scripts/test-release-workflow.sh
bash .github/scripts/test-check-opfs-worker-drift.sh
actionlint .github/workflows/release.yml .github/workflows/tests-js.yml .github/workflows/opfs-worker-drift.yml
```

Pro commands run from its worktree; the dedicated wp-env environment was **stopped after verification**. Docker daemon was not stopped. Start the same environment before rerunning PHPUnit:

```sh
export WP_ENV_CORE=https://wordpress.org/wordpress-7.1.1-RC1.zip WP_ENV_PHP_VERSION=8.2
WP_ENV=/Users/kilbot/Projects/woocommerce-pos-pro/node_modules/.bin/wp-env
"$WP_ENV" start
"$WP_ENV" run --env-cwd='wp-content/plugins/post-release-roles' tests-cli -- \
  vendor/bin/phpunit -c .phpunit.xml.dist --no-coverage --do-not-cache-result
```

Recorded Pro environment: PHP 8.2, WP 7.1.1-RC1, WC 11.1.0, wordpress-develop test library `ba9d19e41ef42a3ec5e7dd611329f91f1ad871e8`. Existing wp-env binary was 11.7.0 versus manifest 11.14.0; no upgrade made. Git was installed only inside the isolated tests-cli container to allow Composer provisioning. Ignored `vendor/` and `composer.lock` remain. Runtime directory: `/Users/kilbot/.wp-env/wp-env-post-release-roles-8fc4bebd`, last ports 8892/8893. Other PHP/WP matrix lanes were not evaluated.

## `next` port and E2E — original items 3 and 7

**Observed:** [#2028](https://github.com/wcpos/monorepo/pull/2028) merged as `ffa3ca6798`. At implementation time its patch and tests matched the then-current main files byte-for-byte. Do not duplicate that port. Later main #2039 adds further commentary/test coverage; the earlier byte-equality result is not a claim about today's tips.

Both requested specs ran against a fresh local build of **`ffa3ca6798`**, using live dev-next: Free **2/2 passed**, Pro **2/2 passed**, one worker and zero retries. Neither failure reproduced, so no speculative test or production fix was made. This does not prove a historical flake eliminated. The verification worktree `monorepo-v2/.worktrees/post-release-next-e2e` is clean and now 13 commits behind its local `origin/next` tracking ref.

Historical CI correction: in [run 34721645223](https://github.com/wcpos/monorepo/actions/runs/34721645223), Free update-required failed once with two additional requests then passed on retry; Pro passed. Free two-tab failed with loaded counts 16 versus 10 before the identity probe; Pro passed. The cited HOST121/AUTH421/AUTH431 messages aligned with intentional `host-blocked-errors.spec.ts` mocks, not demonstrated live infrastructure degradation. A catalogue-readiness race is **inferred**, not proven; do not weaken assertions on that inference alone.

The local build's server used port 8087 and was stopped. Port 8081 belonged to another worktree and was left untouched. For another run, build/serve the intended revision on a verified free port, then run from its `apps/main` with `BASE_URL` naming that server, both `E2E_STORE_URL_FREE` and `E2E_STORE_URL_PRO` set to `https://dev-next.wcpos.com`, and `E2E_WORKERS=1`:

```sh
pnpm exec playwright test 'update-required\.spec\.ts|two-tab-changelog-identity\.spec\.ts' \
  --project=free-authenticated --workers=1 --retries=0 --reporter=line
# Repeat with --project=pro-authenticated; do not reuse an unrelated existing server.
```

## Remaining items / changed understanding

- **Item 2:** initially left as the accepted append-filter limitation. New main **#2039 now documents and pins that RxPipeline does not retry a throwing handler in-process**: it retains the error and does not advance the checkpoint. Observed here: commit/comment/test were inspected, not rerun. Reconcile the original handoff's retry premise with this newer evidence before proposing a post-write vendor anchor. Preserve the restriction against adding a handler retry or reusing an index through an in-place restart without revisiting digest timing.
- **Item 5:** missing Free GitHub ZIP was intentionally left alone. Once the recovery workflow is merged, backfill is a separate owner-directed action; a version bump is not intrinsically required by the new recovery design.
- **Item 9:** roadmap pull still fails safely. The earlier nine collisions contained historical/duplicate content, but staged copies could represent intentional reversions; none was reset or removed. The latest pull now also collides with the original outstanding-items handoff, which has appeared on origin and differs from the local copy. Preserve it too.
- Earlier housekeeping audit found 40 substantive local-only files (11 Markdown + 29 screenshots), plus two `.DS_Store` files, apart from the nine earlier collisions. That is an audit snapshot, not a current inventory after this document is added. Reconcile only with owner approval; never broadly stash, clean, or reset the shared roadmap checkout.

## Behavior changes / regressions

- Search lifecycle operations for one source collection now wait for each other, including different locales; rejected shutdown still attempts reference cleanup. No performance benchmark or broad compatibility claim was made.
- Manual release recovery rebuilds and replaces the existing ZIP with `--clobber`, without changing publication state or deploying SVN. Rebuilt bytes are not promised identical to the original artifact.
- Pro changes affect test bootstrap only. No `next` runtime changes, release changes, or local-document reconciliation were applied by this session. E2E passes do not establish absence of historical intermittency.

## Local evidence locations

These are local, temporary artifacts, not committed evidence; `/tmp` may be cleared. No secrets belong in a PR attachment.

- `/tmp/post-release-search-final-red.log`, `/tmp/post-release-search-final-green.log`
- `/tmp/post-release-database-tests.log`, `/tmp/post-release-database-lint.log`, `/tmp/post-release-database-typecheck.log`
- `/tmp/post-release-script-tests.log`, `/tmp/post-release-monorepo-tests.log`, `/tmp/post-release-pro-tests.log`
- `/tmp/post-release-next-e2e/`: `install.log`, `build.log`, `server.log`, `free.log`, `pro.log`, `free-results/.last-run.json`, `pro-results/.last-run.json`. No failure traces retained; Pro emitted request-context-disposed teardown warnings without assertion failures.
