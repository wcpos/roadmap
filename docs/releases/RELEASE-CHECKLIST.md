# WCPOS 1.10.x patch train — checklist

**This checklist is mandatory. Every box is ticked in the run record, in order, with the evidence named.** It exists because the 1.10.20 train (2026-09-16) shipped four "by memory" errors that mechanics would have caught, and Paul ruled: *"Do what you have to do to remove these errors from chance. Formalise these into a checklist that must be followed."* Each box names the failure it prevents. The narrative recipe stays in the newest `<date>-wcpos-<ver>-patch-run.md`; this file is the gate.

Copy the boxes below into the run record's **Checklist** section and fill them in as you go. A box that cannot be ticked is a blocker for every step after it, not a note.

## A. Scope — before cutting anything

- [ ] **A1. Every line scoped from its own tag diff, never from memory.** `gh api repos/wcpos/<repo>/compare/<last tag>...main` for monorepo, woocommerce-pos, woocommerce-pos-pro, electron. Record the merge list per line. *(1.10.17 was nearly run monorepo-only from session memory.)*
- [ ] **A2. Worker blob compared.** `apps/main/public/opfs.worker.js` blob at the last app tag vs `main`. If it moved, the plugin legs are REQUIRED and the tag order inverts (bundle → vendor → bundle tag → free). Record both blob SHAs.
- [ ] **A3. Plugin legs decided.** Free/Pro ride if either has commits since its tag OR A2 moved. Write "plugins: required because …" or "plugins: unchanged because …" in the record.
- [ ] **A4. Mobile decided by `eas fingerprint:compare --build-id <shipped build>` for BOTH platforms**, never a local `fingerprint:generate`. Same → OTA; different → store build (owner's call). Record the build ids and runtime versions.
- [ ] **A5. Nobody else is on a train.** `ListAgents` / issue comment trail. Record it.

## B. Notes — written BEFORE any release PR is opened

- [ ] **B1. One app notes file.** Merchant-facing, one bullet per shipped change, bold lead sentence. This is the GitHub release body for the app AND the electron footer source.
- [ ] **B2. One plugin notes file = app notes + plugin-side notes.** For a WordPress.org merchant the plugin update IS the release, so the free readme entry (and Pro CHANGELOG entry) must carry every app change too, plus the plugin's own. Build it by concatenation from B1, never by rewriting from memory. *(1.10.16's readme shipped with only the plugin-side lines and missed "Cashiers can sell an out-of-stock variation again…" — corrected in woocommerce-pos#2002.)*
- [ ] **B3. Diff B2 against B1.** Every B1 bullet must appear verbatim in B2. `grep -c -F -f <(grep '^- \*\*' app-notes) plugin-notes` equals the B1 bullet count. Record the count.

## C. Cut

- [ ] **C1. Monorepo `release/<ver>`** via the git-data API: `apps/main/package.json` bump only; PR ready; auto-merge queued. The release PR's own Merge Gate runs (≈15 min); the push Deploy is NOT waited on for a version bump (Paul, 2026-09-16) — the publish workflows take `override_release_gate='I accept a red main'`.
- [ ] **C2. Free `release/<ver>`** via the git-data API: `package.json`, `readme.txt` (`Stable tag` + the B2 entry under `== Changelog ==`), `woocommerce-pos.php` (header + `VERSION`). Opened as a **draft** and left a draft until D4.
- [ ] **C3. Pro `release/<ver>`**: `package.json`, `CHANGELOG.md` (B2 entry + "(Bundles free plugin <ver>. …)"), `woocommerce-pos-pro.php` (header + `VERSION`). Draft until free is published.
- [ ] **C4. Electron `release/<desk ver>`**: `package.json` + `.monorepo-ref` = `v<app ver>` (a tag, never a SHA). Draft until the app tag exists.

## D. Web + plugins (order is fixed)

- [ ] **D1. App merged; merge-commit tree == release-commit tree** (compare `.tree.sha` through the git-data API). If equal, A4's compare stands for the merge SHA; if not, re-run A4 at the merge SHA before any OTA dispatch.
- [ ] **D2. `Publish Web Bundle`** from the merge SHA, `bundle_branch=main` (+ override). Record the web-bundle commit, entry asset name, and the worker blob (must equal A2's `main` blob).
- [ ] **D3. Worker vendored onto free's release branch by blob SHA** (copy, never rebuild): monorepo == bundle == free. Skip only if A2 did not move.
- [ ] **D4. Bundle tagged `v1.10.N`**, jsDelivr `@1.10` read BEFORE purging, purged only if stale, then `x-jsd-version` == new tag and entry asset 200. Free's drift check can only go green after this.
- [ ] **D5. App GitHub release** at the merge SHA, `--latest`, body = B1. Creates the tag electron needs.
- [ ] **D6. Free: drift green → ready → merge → `release.yml` builds the draft.** Before publishing: (a) the draft's `target_commitish` == the merge commit whose tree built the zip (a draft reused across pushes keeps the FIRST push's target — move it or the tag); (b) download the zip and verify header version, `Stable tag`, and worker bytes == bundle (the zip is FLAT, no top folder); (c) body non-empty (release.yml writes it from the readme since woocommerce-pos#2003; check anyway). Then publish. *(1.10.16: published at the first push's target, deploy started from the old worker — caught, tag moved, deploy re-run.)*
- [ ] **D7. WP.org verified**: SVN trunk `Stable tag`, `tags/<ver>/` 200, tagged header version, worker bytes in BOTH `trunk/` and `tags/<ver>/` == bundle, and the `= <ver> =` readme entry on SVN carries the B1 bullets (count).
- [ ] **D8. Pro: ready → merge → `manual-release.yml releaseVersion=<ver>`** → zip verified: Pro markers, vendored free `Stable tag`, worker bytes, translations pin; body == CHANGELOG top section == B2.

## E. Desktop + mobile

- [ ] **E1. Electron**: drift rerun with the app tag present → ready → merge → cancel the push Publish → `tag-and-release.yml platform=all` → 9 assets → footer names the app version → tag at the merge SHA → publish, latest.
- [ ] **E2. OTA** (if A4 = same): `publish-mobile-update.yml` from the merge SHA, `channel=production` (+ override) → `eas update:list --branch production --json`: both groups' `runtimeVersion` == the shipped builds' from A4, message names the app version + SHA.

## F. Close

- [ ] **F1. `main` → `next` sync PR.** API merge; on 409 resolve in a worktree; `apps/main/package.json` keeps next's version; the worker bundle is REGENERATED with `scripts/build-opfs-worker.mjs` after a fresh install and proved by marker count (never copied from either side). Auto-merge behind its gate — it is a real merge, not a bump.
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
