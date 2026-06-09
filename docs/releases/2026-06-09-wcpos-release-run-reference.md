# WCPOS Release Run Reference — 2026-06-09

This document records the real WCPOS release process we walked through for the `1.9.2` app/plugin release line. It is intended as the reference artifact for designing the automated release conductor in the Roadmap repo.

## Release Versions Used

The WCPOS repositories do **not** all share one version sequence. Versions are resolved per repository from the latest release/tag, usually by bumping the patch number.

| Component | Repo | Previous | Released |
| --- | --- | ---: | ---: |
| Main app / monorepo | `wcpos/monorepo` | `v1.9.1` | `v1.9.2` |
| Web bundle | `wcpos/web-bundle` | `v1.9.5` | `v1.9.6` |
| Electron desktop | `wcpos/electron` | `v1.9.1` | `v1.9.2` |
| Free WordPress plugin | `wcpos/woocommerce-pos` | `v1.9.1` | `v1.9.2` |
| Pro WordPress plugin | `wcpos/woocommerce-pos-pro` | `v1.9.1` | `v1.9.2` |

## Critical Ordering Lessons

### Tags/releases must happen after merge

The web-bundle release was initially tagged before the PR was merged. That is wrong for CDN consumption because jsDelivr and users should resolve tags that are reachable from the repository's canonical release history.

Correct order:

1. Create the release PR/branch.
2. Merge the PR to `main`.
3. Create or publish the GitHub release/tag from the merged `main` state.
4. Purge/verify CDN or downstream consumers.

### Monorepo must point to merged submodule commits

Monorepo submodules should point at the merged `main` commits of `web-bundle` and `electron`, not the pre-merge PR branch commits.

For this release:

- `apps/web` initially pointed at `f57858c...`; after merging web-bundle PR #14, it needed to point at `611b7cc...`.
- `apps/electron` initially pointed at `e9c73fa...`; after merging Electron PR #255, it needed to point at `2893426...`.

### Electron release should build after monorepo main is updated

Electron's publish workflow checks out `wcpos/monorepo` `main` to build Expo for Electron. Therefore Electron publish should run only after the monorepo release PR is merged.

### Mobile app build must run after monorepo main is updated

The mobile workflow `wcpos/monorepo/.github/workflows/build.yml` must run after the monorepo release PR is merged, because it builds from `main`.

## Actual Release Flow Performed

### 1. Prepare and release web bundle

Repository: `wcpos/web-bundle`

PR:

- https://github.com/wcpos/web-bundle/pull/14

Important commits:

- Release build branch commit: `f57858c081e6534df86b47e613fe86f1840c42c2`
- Merge commit: `611b7cc9df351ab6dbbfd35594a8d7a8d9a34d71`

Actions performed:

1. Updated monorepo app version first so the web bundle build embeds the new app version.
2. Built the web bundle.
3. Opened and merged web-bundle PR #14.
4. Ensured the release/tag pointed at content reachable from `main`.
5. Purged jsDelivr.
6. Verified CDN metadata.

CDN verification results:

- `https://cdn.jsdelivr.net/gh/wcpos/web-bundle@1.9.6/build/metadata.json` returned the new metadata.
- `https://cdn.jsdelivr.net/gh/wcpos/web-bundle@main/build/metadata.json` returned the new metadata.
- The plugin currently uses the non-`v` jsDelivr style, e.g. `@1.9/build`.

Important lesson: do not rely on a `v`-prefixed jsDelivr ref unless the production code uses it.

### 2. Prepare Electron version bump

Repository: `wcpos/electron`

PR:

- https://github.com/wcpos/electron/pull/255

Important commits:

- Release-prep branch commit: `e9c73faede8a1fb67e1233d5b842b0b62daec966`
- Merge commit: `2893426ad9aeb1bf50c91be8b444836868b26ec4`

Actions performed:

1. Bumped Electron package version to `1.9.2`.
2. Opened PR #255.
3. Validated lint successfully.
4. Merged the PR after the release sequence required it.

### 3. Prepare and merge monorepo release

Repository: `wcpos/monorepo`

PR:

- https://github.com/wcpos/monorepo/pull/568

Important commits:

- Initial release-prep commit: `172562978966dcf13d57c1c40e09ee05658f1b41`
- Fix/update commit: `912b57cb3`
- Merge commit: `089375653265ce4d6a2389e0e2620b2281e64585`

Actions performed:

1. Updated `apps/main/package.json` from `1.9.1` to `1.9.2`.
2. Refreshed `pnpm-lock.yaml`.
3. Updated `apps/web` submodule to the merged web-bundle commit `611b7cc...`.
4. Updated `apps/electron` submodule to the merged Electron commit `2893426...`.
5. Fixed a TypeScript issue in `packages/components/src/virtualized-list/virtualized-list.web.tsx` by including `horizontal` in `WebItemContext`.
6. Ran local validation:
   - `pnpm --filter @wcpos/components run typecheck` passed.
   - `pnpm run lint` passed with warnings only.
   - `pnpm run -w build:main` passed.
7. Pushed PR update.
8. CI passed:
   - Lint
   - Unit tests
   - Merge Gate
   - CodeQL
   - Dependency Review
9. Merged PR #568.

Important issue fixed:

```text
src/virtualized-list/virtualized-list.web.tsx(211,14): error TS2352
Property 'horizontal' is missing in type ... but required in type 'WebItemContext<T>'.
```

### 4. Release free WordPress plugin

Repository: `wcpos/woocommerce-pos`

PRs:

- Version bump PR: https://github.com/wcpos/woocommerce-pos/pull/1129
- Follow-up changelog fix PR: https://github.com/wcpos/woocommerce-pos/pull/1131

Release:

- https://github.com/wcpos/woocommerce-pos/releases/tag/v1.9.2

Actions performed:

1. Bumped plugin version to `1.9.2` in:
   - `woocommerce-pos.php`
   - `package.json`
   - `readme.txt` Stable tag
2. Added `readme.txt` changelog entry.
3. Initially missed important app UI improvements from monorepo.
4. Added a follow-up PR to include the missing UI/app notes.
5. Deleted stale draft release that had been built before the changelog correction.
6. Triggered the Manual Release workflow for `1.9.2` from updated `main`.
7. Published the GitHub release with release notes.
8. Publishing triggered the WordPress.org deploy workflow.

Validation performed:

- `php -l` on root PHP files passed.
- `composer run lint` passed: `19 / 19 (100%)`.

Final free release notes included:

- Star Online cloud printing support.
- Redesigned printer settings.
- Responsive controls / tabs as select.
- Improved printer discovery UI.
- Product sorting controls.
- Cloud print setup improvements.
- Server-side PDF receipt downloads.
- Cloud printer access fix.
- Blank template title fallback.
- Translation metadata through `2026.6.0`.

### 5. Release Pro WordPress plugin

Repository: `wcpos/woocommerce-pos-pro`

PR:

- https://github.com/wcpos/woocommerce-pos-pro/pull/308

Release:

- https://github.com/wcpos/woocommerce-pos-pro/releases/tag/v1.9.2

Actions performed:

1. Bumped Pro version to `1.9.2` in:
   - `woocommerce-pos-pro.php`
   - `package.json`
   - changelog files
2. PR #308 was merged.
3. A Pro release had been created before the free plugin release notes were corrected.
4. Deleted the old Pro `v1.9.2` release and tag.
5. Re-ran the Pro Manual Release workflow for `1.9.2`.
6. Published/updated release notes with combined Free/App + Pro-specific notes.

Validation performed:

- `php -l` on root PHP files passed.
- `composer run lint` passed: `19 / 19 (100%)`.

Pro-specific release notes included:

- Per-outlet cloud print routing.
- Shared cloud-print rule filter improvements.
- Admin store list authorization fix.
- Release package exclude fix.
- Translation/test matrix metadata updates.

### 6. Release Electron desktop apps

Repository: `wcpos/electron`

Release:

- https://github.com/wcpos/electron/releases/tag/v1.9.2

Relevant PRs:

- Version bump: https://github.com/wcpos/electron/pull/255
- Publish unblock: https://github.com/wcpos/electron/pull/256
- Linux C++17 fix: https://github.com/wcpos/electron/pull/257

Actions performed:

1. Merged Electron version bump PR #255.
2. Publish workflow failed before any publish jobs because `validate-flathub-extra-data` treated Flathub submission TODOs as a hard release blocker.
3. Fixed this by changing Flathub placeholder validation to a warning and removing it as a dependency of `publish-linux`.
4. Re-ran publish for all platforms.
5. macOS Intel, macOS Apple Silicon, and Windows assets published successfully.
6. Linux then failed rebuilding `usb` because the native module needed C++17.
7. Fixed Linux native rebuild to set C++17 flags.
8. Re-ran Linux publish.
9. Linux native rebuild succeeded, but Flatpak maker failed.
10. Published Electron release with macOS and Windows assets, noting Linux packages are deferred.

Published Electron assets:

- `WCPOS-1.9.2-arm64.dmg`
- `WCPOS-1.9.2-x64.dmg`
- `WCPOS-darwin-arm64-1.9.2.zip`
- `WCPOS-darwin-x64-1.9.2.zip`
- `WCPOS-1.9.2-Setup.exe`
- `WooCommercePOS-1.9.2-full.nupkg`
- `RELEASES`

Linux follow-up required:

- Decide whether Flatpak should be part of the Electron release workflow or a separate Flathub workflow.
- Ensure `.deb`/`.rpm` can publish even if Flatpak fails.
- Finalize `flathub/com.wcpos.main.yml` only after the Linux `.deb` exists.

### 7. Trigger mobile app build and submission

Repository: `wcpos/monorepo`

Workflow:

- `.github/workflows/build.yml`
- Run: https://github.com/wcpos/monorepo/actions/runs/27215725092

Inputs used:

```text
platform = all
profile  = production
submit   = true
```

Important prerequisite:

- Monorepo PR #568 had to be merged first. Before merge, `main` still had `apps/main` version `1.9.1`, and old submodule refs.

Verified before dispatch:

- `apps/main/package.json` version was `1.9.2`.
- `apps/web` submodule was `611b7cc...`.
- `apps/electron` submodule was `2893426...`.

## Current Manual Release Checklist

Use this checklist until automation replaces it.

### Web bundle / app / electron / mobile

- [ ] Determine next monorepo app version from latest monorepo release/tag.
- [ ] Determine next web-bundle version from latest web-bundle release/tag.
- [ ] Determine next Electron version from latest Electron release/tag.
- [ ] Update `apps/main/package.json` in monorepo.
- [ ] Build web bundle from the updated monorepo app.
- [ ] Open web-bundle PR.
- [ ] Merge web-bundle PR.
- [ ] Create/publish web-bundle release/tag from merged `main`.
- [ ] Purge jsDelivr for relevant refs.
- [ ] Verify jsDelivr metadata resolves to the new bundle.
- [ ] Open Electron version bump PR.
- [ ] Merge Electron PR.
- [ ] Update monorepo submodules to merged web/electron commits.
- [ ] Run monorepo validation.
- [ ] Open/update monorepo release PR.
- [ ] Merge monorepo release PR.
- [ ] Create/publish monorepo GitHub release/tag.
- [ ] Trigger Electron Publish workflow.
- [ ] Publish Electron release notes and release.
- [ ] Trigger mobile `build.yml` with `platform=all`, `profile=production`, `submit=true`.

### Free / Pro plugin

- [ ] Determine next Free plugin version from latest release/tag.
- [ ] Determine next Pro plugin version from latest release/tag.
- [ ] Bump Free plugin version in header, constant/package files, and `readme.txt` Stable tag.
- [ ] Build Free plugin release notes from PHP plugin changes + main app changes.
- [ ] Ensure app UI changes from monorepo are represented in `readme.txt`.
- [ ] Open and merge Free plugin release PR.
- [ ] If a stale draft release exists, delete it and rerun release workflow.
- [ ] Publish Free plugin release with reviewed notes.
- [ ] Confirm WordPress.org deploy starts/completes.
- [ ] Bump Pro plugin version and changelog.
- [ ] Open and merge Pro plugin release PR.
- [ ] Rebuild Pro after Free plugin release is finalized.
- [ ] Publish Pro release with combined Free/App + Pro-specific notes.

## Automation Requirements Discovered

The Roadmap release conductor should support these requirements:

1. **Independent lane versions.** Each repository has its own version stream. The conductor should default to latest release/tag patch `+1`, with explicit overrides.
2. **Merge-before-release invariant.** No GitHub release/tag should be created before the PR containing the release files is merged.
3. **Submodule awareness.** Monorepo must update submodules to merged `main` commits, not PR branch commits.
4. **Release-note aggregation.** Free and Pro plugin notes must include main app changes, not just PHP plugin changes.
5. **Stale draft detection.** If a release workflow creates a draft from stale content, the conductor should detect/delete/rebuild or fail with a clear recovery step.
6. **CDN purge/verify.** Web-bundle release should automatically purge jsDelivr and verify the production URL style used by the plugin.
7. **Platform-specific Electron resilience.** Flatpak/Flathub should not block Windows/macOS release. Linux `.deb`/`.rpm` should not be coupled to Flathub submission if avoidable.
8. **Mobile build gating.** Mobile production submit should only run after monorepo `main` has the release version and expected submodule refs.
9. **Status tracking.** The conductor should write a tracking issue/comment with every PR, workflow run, release URL, validation result, and manual gate.
10. **Recovery commands.** Every failure mode should have an explicit next action: rerun workflow, delete stale draft, update submodule, publish notes, or defer a platform.


## Automation Direction Agreed After This Release

The Roadmap repo should become the release **conductor**, not a replacement build system.

Existing repository workflows remain the execution source of truth because they already contain the repo-specific build, signing, package, and deploy knowledge:

- `wcpos/web-bundle` owns web bundle build/release mechanics.
- `wcpos/electron` owns Electron Forge publishing, signing, and desktop release assets.
- `wcpos/monorepo` owns app package builds and mobile `build.yml` EAS submission.
- `wcpos/woocommerce-pos` owns free plugin packaging and WordPress.org deployment.
- `wcpos/woocommerce-pos-pro` owns Pro plugin packaging and private release publishing.

Roadmap should orchestrate these workflows by:

1. Resolving versions per lane.
2. Creating release plans and tracking issues.
3. Opening or updating release PRs.
4. Waiting for checks and merges.
5. Detecting stale drafts/tags.
6. Dispatching existing repo workflows with the correct inputs.
7. Recording release URLs, workflow runs, and recovery actions.

The old first-pass draft workflow-contract PRs were closed because the real release showed that we should adapt the existing workflows incrementally instead of replacing them with parallel contracts.

## Partial Release Lanes

A release train does not always include every repository. The conductor must support lane selection.

Examples:

| Scenario | Enabled lanes | Notes |
| --- | --- | --- |
| Full app/plugin release | `web_bundle`, `electron`, `monorepo`, `free_plugin`, `pro_plugin`, `mobile` | Full dependency order applies. |
| PHP plugin patch only | `free_plugin`, optionally `pro_plugin` | No web bundle or mobile build needed unless app-facing changes exist. |
| Web bundle hotfix | `web_bundle`, optionally `monorepo` if submodule ref must be tracked | Publish web bundle after merge, purge jsDelivr, verify CDN. |
| Electron-only patch | `electron` | Bump Electron version, publish desktop apps, optionally update monorepo submodule later for traceability. |
| Mobile-only rebuild | `mobile` | Requires monorepo `main` already contains desired app version/source. |

### Electron-only patch flow

An Electron-only patch affects only `wcpos/electron`. It should not force a monorepo app version bump, web-bundle build, free plugin release, Pro release, or mobile submission unless the patch changes shared app code or requires a new Expo build from monorepo.

Automated conductor flow:

1. Operator dispatches Roadmap release conductor with lane `electron` only.
2. Conductor resolves latest Electron release/tag and proposes the next Electron patch version, e.g. `v1.9.2 -> v1.9.3`.
3. Conductor creates a tracking issue for the Electron-only release.
4. Conductor opens an Electron release PR that bumps Electron package metadata and includes release notes scoped to the desktop fix.
5. Conductor waits for Electron PR checks.
6. Conductor merges the Electron PR only after checks pass and approval gates are satisfied.
7. Conductor dispatches the existing Electron Publish workflow.
8. Conductor monitors platform jobs independently:
   - macOS Intel
   - macOS Apple Silicon
   - Windows
   - Linux, if enabled and healthy
9. Conductor publishes the Electron GitHub release after assets are present.
10. Conductor records any deferred platforms, such as Linux/Flatpak, without blocking already-built desktop assets.

Optional follow-up:

- If the monorepo tracks Electron as a submodule for traceability, the conductor can open a low-risk monorepo PR to update `apps/electron` to the merged Electron commit. This should be a separate optional `monorepo_submodule_sync` lane, not part of the required Electron patch release.

Important invariant:

- If the Electron publish workflow checks out `wcpos/monorepo` `main`, an Electron-only patch is safe only when it does not require changes to monorepo app code. If the Electron patch depends on app code changes, enable the `monorepo` lane first and run Electron publish only after monorepo `main` is updated.
