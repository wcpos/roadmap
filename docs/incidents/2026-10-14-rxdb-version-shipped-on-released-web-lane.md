# Incident: RxDB 17.6.0 shipped onto the `@1.10` web lane (2026-10-14)

**Impact:** every web POS running a WooCommerce POS plugin older than 1.10.28 failed to open its database from 09:39 to 10:02 UTC (23 minutes). The demo store was among them. Desktop and mobile were never affected. No free merchant received the bad plugin (WordPress.org holds a new release for about six hours before offering it as an update); Pro merchants who updated in the fifteen minutes Pro 1.10.28 was published got a working POS only after taking 1.11.0.

**Severity:** high. The web POS is the product for most merchants, and the outage was total for anyone on it with an older plugin.

**Root cause, in one sentence:** we changed the storage engine's version in a patch release, and the delivery design (one shared CDN ref per minor, a worker vendored per plugin) cannot carry a version change inside a minor.

## How the pieces fit

The web POS runs in two halves that must agree exactly:

1. **The app bundle**, loaded from jsDelivr at `https://cdn.jsdelivr.net/gh/wcpos/web-bundle@<major.minor>/...`. jsDelivr resolves `@1.10` to the highest `v1.10.N` tag. Every plugin on the 1.10 line, whatever its patch number, loads the newest 1.10 bundle. This is how a bundle fix reaches merchants without a plugin update.
2. **The storage worker** (`opfs.worker.js`), served by the **plugin** from its own files. Each plugin release vendors a copy of the worker that matched the bundle at its release.

RxDB's remote-storage bridge compares the two halves' versions as strings on every database open (`rxdb/plugins/storage-remote/remote.js`: `msg.version !== mustBeRxDBVersion` → `RM1`). `17.4.0` and `17.6.0` are a refusal. There is no tolerance for a minor difference.

So the rule the design implies, which nobody had written down: **the RxDB version is a property of the lane.** Once `@1.10` has a tag, every later `v1.10.N` tag must carry the same RxDB version, because plugins already in the field will load it with their old worker.

## What happened

| Time (UTC) | Event |
|---|---|
| 2026-10-13 | monorepo #2504 (rxdb 17.4.0 → 17.6.0) merged to `main`, the 1.10.x patch line. It was reviewed and tested as an app change; the lane constraint was not part of the review. |
| 2026-10-14 09:2x | Paul's go for the 1.10.31 patch train. Checklist box A2 was ticked: "worker blob moved, so plugins are required and the tag order inverts". The box asked whether the worker changed, not whether its RxDB version changed. |
| 09:30 | `Publish Web Bundle` from `eea33c50`. |
| 09:33 | Web-bundle tag `v1.10.41` created by hand (`gh api`). |
| 09:39 | `@1.10` purged and serving 1.10.41. **Outage begins** for every web POS on a plugin older than 1.10.28. The tills show a dead page; no Sentry event is sent, because the error-reporting sink only starts after it reads consent from the database that failed to open. |
| 09:48 | Free 1.10.28 published (held by WordPress.org's six-hour delay); Pro 1.10.28 published. |
| 09:55 | Paul: "We shouldn't have done the RxDB update on the plugin on the main branch… Take a look at the demo site now. It's broken." |
| 10:00 | Paul's call: pull Pro, pull the bundle off jsDelivr, bump to 1.11. Pro 1.10.28 returned to draft. |
| 10:02 | Tag `v1.11.0` created at the same bundle commit, `v1.10.41` deleted, `@1.10` purged. `@1.10` reads 1.10.40 again. **Outage ends.** |
| 10:07 | Free 1.11.0 (same code, version bump) published and deployed to WordPress.org; Pro 1.11.0 published. 1.10.28 later deleted from GitHub and the WordPress.org SVN tag. |
| 10:4x–11:05 | App renumbered to 1.11.0 (so the sidebar matches), bundle v1.11.1, desktop 1.11.0, OTA 1.11.0. Desktop `next` base moved to 2.0.0. |

## Why the checks did not catch it

- **Review of #2504** judged the dependency bump on the app's own tests. Nothing in the PR template, the reviewers' brief or the lane rules said that the worker's RxDB version is frozen for the life of a minor.
- **Checklist A2** recorded that the worker blob moved and correctly made the plugin legs mandatory. The train then did exactly what a moved worker normally needs. A moved worker is common (any storage fix moves it); a moved RxDB version is the rare, dangerous case, and the box did not separate them.
- **The free plugin's drift check** (`opfs-worker-drift.yml`) compares the release branch's vendored worker to the highest bundle tag on its lane. It passed, because the new plugin's worker did match the new bundle. The merchants it could not see were the ones on older plugins.
- **The tag is cut by hand.** `gh api … refs/tags/v1.10.41` has no check in front of it. The `@1.10` ref moved the moment the tag existed.
- **Sentry was blind to it** by construction (see the timeline), so the first signal was a human looking at the demo site.

## The fix that shipped

Renumbering, not code: the 17.6.0 bundle became `v1.11.0`; plugins 1.11.0 load `@1.11`; `@1.10` is frozen at `v1.10.40` (17.4.0) for the plugins that still vendor a 17.4.0 worker. 1.10.28 was deleted from GitHub and WordPress.org. All lines now read 1.11.0.

## Safeguards (Paul: "This needs to be a blocker on releasing. It needs to be a version bump.")

Mechanical, failing closed, at each place the mistake could have been made:

1. **`publish-web-bundle.yml` refuses to publish a worker whose `RXDB_VERSION` differs from the lane's.** When `bundle_branch=main`, the workflow derives the lane from `apps/main/package.json`, fetches the worker at the highest existing `v<major.minor>.N` tag, and fails if the RxDB versions differ. A lane with no tag yet passes (that is what a minor bump produces). The workflow also now checks out the SHA the release gate approved rather than the input ref, so a branch that moves between the two steps cannot build an ungated commit. *(done: monorepo #2552 on `main` at `355cf6ec`, #2553 on `next` at `618ad903`; first live run is the next publish from `main`)*
2. **The bundle tag is cut by a script, never by hand.** `scripts/release/tag-web-bundle.sh <web-bundle-sha>` re-runs the same check against the bundle commit, computes the next patch tag on the lane, refuses any lane below the newest one (so `@1.10` can never move again), and does the poll-then-purge dance the checklist describes. Checklist D4 points at the script. Replaying the incident against it: the 17.6.0 worker on the 17.4.0 lane fails with `worker RXDB_VERSION 17.6.0 != 17.4.0 on v1.10.40`; without the override, `lane 1.10 is frozen`. *(done: monorepo #2552 / #2553)*
3. **The free plugin refuses a release whose worker's RxDB moved without a minor bump.** `check-worker-rxdb-minor.sh` compares the vendored worker's `RXDB_VERSION` to the last published plugin tag on the same `major.minor`. Wired into `opfs-worker-drift.yml`, which gates the release branch. *(done: woocommerce-pos #2246 on `main`, #2247 on `next`)*
4. **Checklist A2 now asks the right question**: not "did the worker move?" but "did its `RXDB_VERSION` move?", with the rule that a yes is a new minor. *(done, roadmap `RELEASE-CHECKLIST.md`)*
5. **The rule is written where agents read it**: monorepo `CLAUDE.md` web-lane paragraph (the released lane is `@1.11`; a version change is a new minor), and the memory note `rxdb-version-change-needs-a-new-bundle-minor`. *(done)*

Proposed, not built, for Paul's call:

6. **Make the failure visible to the merchant and to us.** On RM1 the till shows a dead page and reports nothing. The app could catch the open-time RM1 and render "Your WooCommerce POS plugin needs updating to <version>", and report it through a path that does not depend on the database. On `main` that is a small change in the web storage adapter; on `next` the same failure mode exists: the plugin's `next` branch vendors `sqlite.worker.js` and `indexeddb.worker.js`, so the `next` gate checks every worker the plugin vendors (monorepo #2559 on `next` at `38571324`). The IndexedDB worker is a legacy file pinned at rxdb 16.21.1 that web-bundle copies forward unchanged, so it is compared lane-to-lane only. Given "there probably won't be another patch", this only pays off if there is one.
7. **Ban engine bumps on the stable lane.** A `main`-lane PR that changes the `rxdb` or `rxdb-premium` version in a lockfile fails CI unless the app's minor is bumped in the same PR. Cheaper than (1) to reason about, but (1) already covers the delivery path; this would catch it at review time instead of release time.

## Notes worth keeping

- WordPress.org's six-hour hold on new releases turned a bad free release into a non-event. Pro has no such hold; a Pro mistake is live the moment the release is published.
- The outage's lack of Sentry signal is a general property, not specific to this bug: anything that breaks before the database opens is invisible. The only monitor that saw it was a person.
- Renumbering was the right fix and took 25 minutes end to end. The cost was the renumbering of every other line to match (another hour), which is why the rule is "new minor" rather than "revert".

## Follow-up (13:30 UTC)

Sentry 10:00–13:12 UTC: no RM1 on any release. One web site and one desktop install on 1.11.0 so far (the WordPress.org hold lifts about 16:00 UTC); 37 web sites still on 1.10.30 against the frozen `@1.10`, all healthy. The only new issue was an AUTH121 wrong-user sign-in on the 1.11.0 desktop, which is the designed security check firing after a cashier signed in with another account, not a regression.
