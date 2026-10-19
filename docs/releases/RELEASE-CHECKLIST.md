# WCPOS 1.10.x patch train — checklist

**This checklist is mandatory. Every box is ticked in the run record, in order, with the evidence named.** It exists because the 1.10.20 train (2026-09-16) shipped four "by memory" errors that mechanics would have caught, and Paul ruled: *"Do what you have to do to remove these errors from chance. Formalise these into a checklist that must be followed."* Each box names the failure it prevents. The narrative recipe stays in the newest `<date>-wcpos-<ver>-patch-run.md`; this file is the gate.

Copy the boxes below into the run record's **Checklist** section and fill them in as you go. A box that cannot be ticked is a blocker for every step after it, not a note.

## Patch compatibility rule (Paul, 2026-10-19)

**Every patch on a lane is compatible with every other patch on that lane, in both directions.** A `2.0.N` web bundle works with any `2.0.M` plugin; a `2.0.N` plugin works with any `2.0.M` desktop or mobile app; and the reverse of each. A change that needs the other half to be at the same patch to work is not a patch. It bumps the minor across every line (app, bundle ref, free, Pro, desktop, mobile), the way 1.10.28 became 1.11.0. Every line, not only the two that clashed: Paul ruled on 2026-10-14 that every product's visible version moves together when a lane moves minor, an empty release included (*"bump the desktop app to 1.11.0 just so it's in sync with everything else"*), because merchants and support compare the numbers they see. The partial-lane model (plugin-only or Electron-only trains) is for patches, where nothing moves minor.

Why the design forces it, not just prefers it:

- Every plugin on the released lane loads the newest bundle on `@<major.minor>` the moment the tag is purged, so bundle patch N+5 is paired with plugin patches N…N+5 in the field. That is how a bundle fix reaches merchants without a plugin update, and it is the pairing the 2026-10-14 RxDB incident broke.
- Desktop and mobile merchants update when they choose. A plugin released today runs against apps a month old.
- The app's plugin floor (`MINIMUM_WCPOS_PLUGIN_VERSION`) is a minor-level floor, and the app has no upper bound on the plugin version. Nothing in code stops an old app talking to a new plugin; the plugin staying backward compatible within the lane is the only thing that keeps that working.
- Pro's update server treats the first two numbers as the compatible family.

What it means in review, on `main`:

- A PR that touches a REST route, a response shape, a header, an option, the sync protocol, a storage schema or a vendored worker answers one question: *would this fail against the lane floor, the `<major.minor>.0` plugin (or app), or any patch between it and the tip?* The floor, not "one patch older": a capability the plugin gained in 2.0.3 is absent on 2.0.0–2.0.2, and those merchants load the newest bundle too. Yes means feature-detect it (the `bareAuthParamSupported` / echo-probe pattern) or bump the minor. Adding something with a fallback is a patch.
- **A minor bump only protects the pairings a mechanism isolates:** web bundle ↔ plugin (the lane ref) and a newer app ↔ an older plugin (the app's plugin floor). Nothing isolates an older desktop or mobile app from a newer plugin: there is no plugin-side app floor and no forced app update. So on the plugin side, removing or renaming anything a client reads (a route, a field, a header, an option) is never a one-step change at any version: keep serving the old shape for at least one full minor (deprecate in `X.Y`, remove in `X.Y+2` at the earliest), until a plugin-side app floor exists, which it does not today. The app side has no such constraint because the floor already forces the plugin forward.
- `MINIMUM_WCPOS_PLUGIN_VERSION` always ends in `.0` (tested in the monorepo). Raising it is a minor.

What is mechanical and what is judgement: the RxDB worker version is guarded on the publish path (A2, D4) and the plugin's drift check; the floor's `.0` is a unit test. The lane-floor E2E legs (app tip against the `<major.minor>.0` plugin, plugin tip against the `<major.minor>.0` bundle) are **filed, not built**: monorepo#2763 and woocommerce-pos#2323. Until they merge, a REST-shaped mismatch is caught only by the changelog read in A1 and the judgement recorded in A2b.

## A. Scope — before cutting anything

- [ ] **A1. Every line scoped from its own tag diff, never from memory.** `gh api repos/wcpos/<repo>/compare/<last tag>...main` for monorepo, woocommerce-pos, woocommerce-pos-pro, electron. Record the merge list per line. *(1.10.17 was nearly run monorepo-only from session memory.)*
- [ ] **A2. Worker blob compared.** `apps/main/public/opfs.worker.js` blob at the last app tag vs `main`. If it moved, the plugin legs are REQUIRED and the tag order inverts (bundle → vendor → bundle tag → free). Record both blob SHAs. **If the worker's `RXDB_VERSION` changed (`grep -o "RXDB_VERSION *= *'[0-9.]*'"` on both blobs), this is NOT a patch: every plugin already in the field keeps its old vendored worker but loads the newest `@<major.minor>` bundle, and RxDB's remote storage refuses any exact-version mismatch (`RM1`). The plugins and the bundle tag go to a NEW minor (`v1.11.0` → `@1.11`), and the old ref is never moved.** *(1.10.28 / bundle v1.10.41, 2026-10-14: RxDB 17.4.0 → 17.6.0 shipped on `@1.10` and broke every web POS on an older plugin, including the demo, until `v1.10.41` was deleted and the release re-cut as 1.11.0.)*
- [ ] **A2b. Cross-component compatibility judged.** Read every merge from A1 on every line against the patch compatibility rule above and write one of: "patch-safe: every line works with every other patch on `<major.minor>`" or "NOT patch-safe because <merge> needs <other half> ≥ <ver> → minor bump, train re-scoped". Judge against the lane floor (`<major.minor>.0`), not the previous patch. A minor verdict here makes the plugin legs in A3 REQUIRED, even when no plugin has a commit. A2 is the RxDB-specific case of this box; this box covers REST, headers, options, protocol, schema and anything else one half reads from the other. *(Rule from Paul, 2026-10-19, after the 1.10.28 → 1.11.0 re-cut.)*
- [ ] **A3. Plugin legs decided.** Free/Pro ride if either has commits since its tag OR A2 moved OR A2b ruled a minor bump (a version-only plugin release on the new lane: the app now relies on something an earlier plugin patch shipped, so the plugin needs no code change but every merchant must be moved onto the new `<major.minor>`). Write "plugins: required because …" or "plugins: unchanged because …" in the record.
- [ ] **A4. Mobile decided by `eas fingerprint:compare --build-id <shipped build>` for BOTH platforms**, never a local `fingerprint:generate`. Same → OTA; different → store build (owner's call). Record the build ids and runtime versions.
- [ ] **A5. Nobody else is on a train.** `ListAgents` / issue comment trail. Record it.

## B. Notes — written BEFORE any release PR is opened

- [ ] **B1. One app notes file.** Merchant-facing, one bullet per shipped change, bold lead sentence. This is the GitHub release body for the app AND the electron footer source.
- [ ] **B2. One plugin notes file = app notes + plugin-side notes.** For a WordPress.org merchant the plugin update IS the release, so the free readme entry (and Pro CHANGELOG entry) must carry every app change too, plus the plugin's own. Build it by concatenation from B1, never by rewriting from memory. *(1.10.16's readme shipped with only the plugin-side lines and missed "Cashiers can sell an out-of-stock variation again…" — corrected in woocommerce-pos#2002.)* **Two forms of the same list (Paul, 2026-10-06): the wp.org `readme.txt` entry is the concise form** — one bold lead sentence per bullet, at most one plain sentence after it, developer changes folded into one unbolded line — because its audience is non-technical. GitHub bodies (app release, electron, Pro `CHANGELOG.md` if wanted) may carry the long form with the explanation after the lead. **The bold lead of every bullet is identical in both forms.** Free's `release.yml` writes the free GitHub body from the readme entry, so free's GitHub release gets the short form; append the long form after Paul publishes if wanted (a `release.yml` re-run overwrites the body).
- [ ] **B3. Diff B2 against B1 by lead sentence.** Every B1 bullet's bold lead must appear in B2: `grep -o '^- \*\*[^*]*\*\*' app-notes > leads; grep -c -F -f leads plugin-notes` equals the B1 bullet count, and `diff` of the same `grep -o` over the short and long plugin forms is empty. Record the count. *(Lead sentences, not whole lines, since 1.10.25 — the short form drops the explanation.)*

## C. Cut

- [ ] **C1. Monorepo `release/<ver>`** via the git-data API: `apps/main/package.json` bump only; PR opened and **admin-merged in the same breath** (`gh pr merge <n> -R wcpos/monorepo --merge --admin`). A pure version bump waits for NOTHING: not its own Merge Gate, not the push Deploy (Paul, 2026-09-16: *"There's absolutely no reason to wait for the tests"*). The publish workflows take `override_release_gate='I accept a red main'`. The same applies to the free, Pro and electron bump PRs once their turn comes. A `main` → `next` sync is NOT a version bump and rides its gate (F1).
- [ ] **C2. Free `release/<ver>`** via the git-data API: `package.json`, `readme.txt` (`Stable tag` + the B2 entry under `== Changelog ==`), `woocommerce-pos.php` (header + `VERSION`). Opened as a **draft** and left a draft until D4.
- [ ] **C3. Pro `release/<ver>`**: `package.json`, `CHANGELOG.md` (B2 entry + "(Bundles free plugin <ver>. …)"), `woocommerce-pos-pro.php` (header + `VERSION`). Draft until free is published.
- [ ] **C4. Electron `release/<desk ver>`**: `package.json` + `.monorepo-ref` = `v<app ver>` (a tag, never a SHA). Draft until the app tag exists.

## D. Web + plugins (order is fixed)

- [ ] **D1. App merged; merge-commit tree == release-commit tree** (compare `.tree.sha` through the git-data API). If equal, A4's compare stands for the merge SHA; if not, re-run A4 at the merge SHA before any OTA dispatch.
- [ ] **D2. `Publish Web Bundle`** from the merge SHA, `bundle_branch=main` (+ override). Record the web-bundle commit, entry asset name, and the worker blob (must equal A2's `main` blob).
- [ ] **D3. Worker vendored onto free's release branch by blob SHA** (copy, never rebuild): monorepo == bundle == free. Skip only if A2 did not move.
- [ ] **D4. Bundle tagged by the script, never by hand:** `scripts/release/tag-web-bundle.sh <web-bundle-sha>` (monorepo `main`, since #2552). It derives the lane from the app version at the bundle's monorepo SHA, refuses a frozen lane (`@1.10` can never move again) and a worker whose `RXDB_VERSION` differs from the lane's newest tag, cuts `v<lane>.<N+1>`, polls jsDelivr `@<lane>` BEFORE purging, purges only if stale, then confirms `x-jsd-version` == new tag and the entry asset serves. Run `--dry-run` first and paste both outputs into the run record. Free's drift check can only go green after this. *(1.10.31/1.11.0: a hand-cut `v1.10.41` carried a 17.6.0 worker onto the 17.4.0 lane and took every older web POS down for 23 minutes; see `docs/incidents/2026-10-14-rxdb-version-shipped-on-released-web-lane.md`.)*
- [ ] **D5. App GitHub release** at the merge SHA, `--latest`, body = B1. Creates the tag electron needs.
- [ ] **D6. Free: drift green → ready → merge → `release.yml` builds the draft.** Before publishing: (a) the draft's `target_commitish` == the merge commit whose tree built the zip (a draft reused across pushes keeps the FIRST push's target — move it or the tag); (b) download the zip and verify header version, `Stable tag`, and worker bytes == bundle (the zip is FLAT, no top folder); (c) body non-empty (release.yml writes it from the readme since woocommerce-pos#2003; check anyway). Then publish. *(1.10.16: published at the first push's target, deploy started from the old worker — caught, tag moved, deploy re-run.)*
- [ ] **D7. WP.org verified**: SVN trunk `Stable tag`, `tags/<ver>/` 200, tagged header version, worker bytes in BOTH `trunk/` and `tags/<ver>/` == bundle, and the `= <ver> =` readme entry on SVN carries the B1 bullets (count).
- [ ] **D8. Pro: ready → merge → `manual-release.yml releaseVersion=<ver>`** → zip verified: Pro markers, vendored free `Stable tag`, worker bytes, translations pin; body == CHANGELOG top section == B2.

## E. Desktop + mobile

- [ ] **E1. Electron**: drift rerun with the app tag present → ready → merge → cancel the push Publish → `tag-and-release.yml platform=all` → 9 assets → footer names the app version → tag at the merge SHA → publish, latest.
- [ ] **E2. OTA** (if A4 = same): `publish-mobile-update.yml` from the merge SHA, `channel=production` (+ override) → `eas update:list --branch production --json`: both groups' `runtimeVersion` == the shipped builds' from A4, message names the app version + SHA.

## F. Close

- [ ] **F1. `main` → `next` sync PR.** API merge; on 409 resolve in a worktree; `apps/main/package.json` keeps next's version (2.0.0 numbering since 2026-09-28); `rxdb-backend.ts` keeps next's rolling `TRANSLATION_VERSION = 'next'`. `next` has no OPFS worker since it moved to SQLite (monorepo `3c212857` web, `01ee2c6d` native) — `apps/main/public/opfs.worker.js`, `scripts/build-opfs-worker.mjs`, the targeted-recovery scripts and the follower plumbing are gone there, so a main-side change to any of them resolves as a deletion, and a main-side storage fix with no mechanism on `next` is **named in the PR body as not ported** (the old "regenerate the worker and prove it by marker count" step applied to the OPFS era only). Auto-merge behind its gate — it is a real merge, not a bump. Check `compare/next...main` `ahead_by` first: on 2026-10-06 three trains' worth (66 commits) had gone unsynced.
- [ ] **F2. Run record committed** to `wcpos/roadmap` `docs/releases/<date>-wcpos-<ver>-patch-run.md` with this checklist filled in, every artifact's verification evidence, and any new trap as a "note worth keeping".
- [ ] **F3. Every GitHub release published this train has a non-empty body** (`gh api repos/wcpos/<repo>/releases?per_page=5 --jq '.[] | "\(.tag_name) \(.body|length)"'` for monorepo, woocommerce-pos, woocommerce-pos-pro, electron). *(v1.10.1, v1.10.7, v1.10.13, v1.10.15 shipped empty; backfilled 2026-09-16.)*

## Mechanics that back the boxes (so the boxes are not the only guard)

| Failure | Mechanism | Since |
|---|---|---|
| Empty free release body | `release.yml` writes the body from the readme's `= <ver> =` section on every run and fails the build if it is missing or empty (`readme-changelog-section.sh` + test) | woocommerce-pos#2003 |
| Reused draft published at the first push's target | `release.yml` moves the draft's target to `$GITHUB_SHA` on every push run | woocommerce-pos#2003 |
| Stale vendored worker | free `opfs-worker-drift.yml` vs the highest `v1.10.x` bundle tag, fails closed | 1.10.10 |
| Electron built against the wrong app | electron `monorepo-drift.yml` against `.monorepo-ref` | 1.10.x |
| Undeliverable OTA | `fingerprint.config.js` skips app-config versions; `check-runtime-version-invariance.sh` | monorepo#2087 |
| Plugin readme missing the app notes | **no mechanism yet** — B2/B3 are the guard. Candidate: a train script that generates the readme entry from the app notes file + plugin notes file, and a drift check between the app release body and the readme entry | open |
