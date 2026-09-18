## Destination

For **1.11.0** the desktop app is built from a **standalone `wcpos/electron` repo** that *imports* the monorepo at a pinned ref, instead of living inside it as the `apps/electron` submodule. Merchants see no change. What changes is the shape of the seam between the two repos and the way the desktop build gets its renderer.

Builds on the ruling already recorded on wcpos/monorepo#1582 (Paul, 2026-08-25): *the monorepo and the electron repo should not share files; they talk across the IPC bridge and nothing else.* This map is the sequencing and the design of the "import" side that #1582 left open. It also closes wcpos/monorepo#1305 (the lockfile-importer exclusion becomes structural by deletion).

## What is true today (charted 2026-09-09)

The coupling is already thinner than it looks. Facts that shape the plan:

- **The electron submodule is not a pnpm importer.** `pnpm-lock.yaml` has no `apps/electron` importer and none of electron's native packages (`electron`, `usb`, `serialport`, `electron-winstaller`, `macos-alias`…) are in the monorepo lock. The monorepo's `preinstall` initialises only `apps/web`; CI keeps `apps/electron` uninitialised on purpose (`publish-web-bundle.yml` comment, run 33784231072). Electron already installs on its own in its CI (`test.yml`), and locally the submodule is uninitialised on Paul's machine.
- **The release build already "imports" the monorepo.** Electron's `Publish` (`tag-and-release.yml`) job `build-expo` checks out `wcpos/monorepo` (default branch, **unpinned**), runs `pnpm --filter @wcpos/main build:electron`, and hands `apps/main/electron-build` to the platform jobs as the `expo-dist` artifact. Forge packages it as `extraResource` `dist/`, served under `wcpos://`. This is the model #1582 said to keep.
- **The only real file-sharing is a nested pnpm workspace in the electron repo** (`pnpm-workspace.yaml` = `.` + `packages/*`, from electron#279) carrying a vendored `@wcpos/printer` with two files: `src/ipc/channels.cts` (IPC registry) and `src/transport/device-key.ts`. Inside the monorepo the specifier resolves to `packages/printer`; standalone it resolves to the vendored copy. That double resolution shipped 1.10.1 with every HTTP request dead (electron#354 / #368).
- **Four byte-identical copies** of monorepo storage files live in electron's main process (`scripts/opfs-targeted-recovery.mjs` + test, `patch-rxdb-premium-changes-file-salvage.mjs` + test), enforced today by `scripts/opfs-recovery-electron-sync.test.mjs`, which inits the submodule as the *last* step of the monorepo Lint job. The RxDB version must also match across the bridge (RxError RM1), enforced only by a Dependabot ignore-comment.
- **Dev loop** (`.claude/skills/electron-dev/SKILL.md`): two Terminal windows from the monorepo worktree — Expo on `:8088` with `ELECTRON=true`, and `electron-forge start` which loads `http://localhost:8088`. Electron's own `dev:expo` (`scripts/dev-expo.mjs`) walks up the tree looking for a monorepo root and is documented as broken from the nested workspace (electron#321).
- **Pointer plumbing that is already dead or reference-only:** `bump-submodules.yml` (daily; rejected by the `Protect main` ruleset, GH013), the `apps/electron` gitlink in every release PR ("reference-only"), `stage-submodule-bumps.mjs` in the pre-commit hook, `submodules:update`, the `@wcpos/electron/*` tsconfig path (zero importers).
- All three repos are **public**, so cross-repo fetches in CI need no token.
- Lanes: monorepo `next` is 128 ahead / 50 behind `main`; electron `next` is 0 ahead / 45 behind (a plain fast-forward). Nothing electron-side is in flight on `next`; roadmap#146 (desktop display window) is post-1.11 polish.

## The design of the seam ("electron imports the monorepo")

The electron repo consumes **exactly one artifact** from the monorepo, built from **one pinned ref**, and checks **one short list of copied files** against that same ref. Nothing else crosses: no workspace link, no path alias, no shared package name.

1. **Renderer artifact.** Unchanged in kind: `pnpm --filter @wcpos/main build:electron` → `electron-build/` → `dist/` inside the package. The `ELECTRON=true` export (Metro's `.electron.ts` resolution) stays in the monorepo; `apps/main`'s `build:electron` script is the public contract of the monorepo towards desktop.
2. **The pin.** A one-line file in the electron repo, `.monorepo-ref`, holding the monorepo ref the desktop is built from. On electron `main` it is the monorepo **release tag** (`v1.10.9` today); on electron `next` it is the branch name `next`. `Publish` reads it in `build-expo` (`actions/checkout` `ref:`), with a `workflow_dispatch` input `monorepo_ref` as an override. The `release-notes` job derives the monorepo release from the pin instead of assuming the two repos share a tag — fixing the known wrong-footer bug when the desktop and app version lines diverge.
3. **IPC contract, owned on each side.** Electron gets its own `src/ipc-channels.ts` (allowlist + types) and `src/main/device-key.ts`; the nested `packages/printer`, `pnpm-workspace.yaml`, the `@wcpos/printer: workspace:*` dependency and the `../../packages/printer` ts-node entry go. The monorepo keeps `packages/printer/src/ipc/channels.cts` as the **renderer's** declaration (it is electron-free by design). Two declarations, one wire — kept honest by the packaged-app smoke test (electron `scripts/smoke-packaged-app.mjs`: renderer-invoked channels ⊆ preload allowlist, plus a real request over the bridge), which stays **load-bearing**. Wire rule, already on #1582: a channel rename lands as an alias for one release, then the old name is dropped.
4. **Drift guard for the copied files.** A new electron workflow `monorepo-drift.yml` reads `.monorepo-ref`, fetches the four copied files and the root `package.json` `rxdb`/`rxdb-premium` versions from `wcpos/monorepo` at that ref (`gh api …/contents/<path>?ref=`), and fails on any sha256 or version mismatch. Runs on PR, push and **daily** (the schedule is load-bearing — the drift is caused by a commit in the other repo, exactly like the plugin's OPFS-worker guard). Replaces the monorepo's submodule-based sync test and the Dependabot comment-convention for rxdb.
5. **Dev loop, two repos, two terminals.** Monorepo gains a root script `dev:electron-renderer` (`ELECTRON=true EXPO_NO_METRO_LAZY=true BROWSER=none pnpm --filter @wcpos/main dev --web --port 8088 --clear`). Electron's `pnpm dev` becomes `electron-forge start` alone (honouring `EXPO_PORT`, default 8088). `scripts/dev-expo.mjs` and its monorepo-root walk are deleted. For a local packaged build: `build:electron` in the monorepo, then `pnpm renderer:import <path-to-electron-build>` in electron (a copy into `dist/`), then `pnpm make`.

## Landing order

Each phase is a coherent PR set; 1 and 2 are electron-only and safe to merge before the monorepo touches anything.

**Phase 0 — prep (no PRs).** Fast-forward electron `next` from `main`. Decide the lane (D1). Make a standalone local clone `~/Projects/electron` with `~/Projects/electron-worktrees/` (the submodule-worktree `core.worktree` trap disappears with it).

**Phase 1 — electron owns its IPC surface** (wcpos/electron). Move the two vendored files to `src/`, rewire ~15 imports (`preload.ts`, `ipc.ts`, `novu.ts`, `auth-handler.ts`, `printer-discovery.ts`, `usb-printer.ts`, `serial-printer.ts`, `winspool-printer.ts`, `telemetry-consent.ts`, `types.d.ts`, tests), delete `packages/`, `pnpm-workspace.yaml`, the `workspace:*` dep, the ts-node `moduleTypes` entries; delete `scripts/dev-expo.mjs` + test and the `dev:expo`/`test:dev-expo` scripts; README "Development" and "Building" sections rewritten for the two-repo loop. Proof: `pnpm install` from a fresh standalone clone, `pnpm lint && pnpm exec tsc && pnpm test`, and a local `pnpm package` + `test:smoke-packaged` against a renderer export.

**Phase 2 — pin and drift guard** (wcpos/electron). Add `.monorepo-ref` (initial value = the monorepo release the current desktop shipped against); `build-expo` checks out that ref with the dispatch override; `release-notes` resolves the monorepo release from the pin; add `monorepo-drift.yml`; drop the rxdb ignore-comment in `dependabot.yml` in favour of the guard (keep the ignore itself). Proof: a `Publish` dispatch with `platform=linux` against the pinned tag reproduces the current release's renderer; the drift workflow is green on the pin and red on a deliberately stale copy in a PR.

**Phase 3 — remove the submodule** (wcpos/monorepo; closes #1582, #1305). `git rm apps/electron` + `.gitmodules` entry; root `package.json` (`dev:electron`, `electron`, `submodules:update`, the `check-bump-submodules-workflow` step in `test:scripts`); `tsconfig.json` `@wcpos/electron/*`; delete `bump-submodules.yml` and `scripts/check-bump-submodules-workflow.mjs` + test; `test.yml` OPFS sync step + `scripts/opfs-recovery-electron-sync.test.mjs`; `stage-submodule-bumps.mjs` `SUBMODULE_PATHS` → `apps/web` only (test fixtures use `apps/electron` — switch them); `ci-plan.mjs` submodule list; `merge-gate.sh` / `test-merge-gate.sh` config-path list; `extract-js-strings.js` exclusion; `check-ci-test-matrix` test fixture; `pnpm-workspace.yaml` — remove the dead `allowBuilds` entries for packages not in the lock (`electron`, `electron-winstaller`, `macos-alias`, `usb`, `@serialport/bindings-cpp`, `fs-xattr`, `@zowe/secrets-for-zowe-sdk`, `better-sqlite3`), and fix the `@sentry/cli` / `shell-quote` / `@electron/node-gyp` comments that cite `apps/electron` (verify each is still pulled by something before touching the override); `README.md`, `AGENTS.md`, `publish-web-bundle.yml` and `push-js-strings.yml` comments; add `dev:electron-renderer`; rewrite `.claude/skills/electron-dev/SKILL.md` for the two-repo loop. `apps/main`'s `build:electron`, `metro.config.js`'s `ELECTRON` block and every `.electron.ts` file stay — they are the renderer. `apps/web` stays a submodule (out of scope, per #1582). Proof: `pnpm install --frozen-lockfile` unchanged lock; `pnpm test:scripts`; Merge Gate green; a `Publish Web Bundle` dry run is unaffected (it never touched electron).

**Phase 4 — docs, memory, layout.** Wiki: `architecture/client.md` targets table + submodule sentence, `architecture/client/stack-and-monorepo.md` "Submodules" section, `operations/release-process.md` "Lane Sequencing", `operations/release-process/app-and-desktop-releases.md` "Desktop (Electron) Publish" (pin step, notes lookup). Roadmap: the release run reference under `docs/releases/`. Session memory: local repo layout, release-train mechanics, the electron-dev recipe.

**Phase 5 — proof on a real train.** The first desktop release after phase 2 (a 1.10.x patch if D1 = `main`, else the first 1.11 pre-release) runs the new sequence and is recorded in `docs/releases/`.

## The release train afterwards

- Monorepo release PR: version bump + `apps/web` pointer only. No electron gitlink, no nightly bump job.
- Electron bump PR: `package.json` version **and** `.monorepo-ref` = the monorepo release tag. Merge only after that monorepo release exists (the drift guard and `release-notes` both read the pin, so a missing release is red, not silent). Cancel the push run, dispatch `Publish platform=all`, publish the draft. Translations pin, Flathub `extra-data`, Windows `windows-2022` pin: unchanged.
- Still true: desktop embeds its own renderer, so a web-bundle hotfix never reaches desktop; the packaged smoke test is the only thing that verifies the wire contract.

## Decisions to make (recommendation first)

- **D1 — lane.** *Recommend `main` for all three repos' PRs.* This is repository infrastructure, lane-neutral and invisible to merchants; phases 1–2 are backward-compatible (the pin's first value reproduces today's behaviour). Landing the gitlink deletion on `next` instead would turn every `main`→`next` sync into a modify/delete conflict on `apps/electron` until promotion. "For 1.11.0" is met either way: the standalone shape is what 1.11.0 promotes with. If Paul rules `next`, the plan is identical minus the sync-conflict tax.
- **D2 — pin form.** *Recommend a release tag in `.monorepo-ref`* over floating `main`: reproducible desktop builds, an explicit ordering constraint instead of "hope `main` is at the version", and it repairs the release-notes lookup. Bumped by hand in the electron bump PR; an auto-bump PR workflow is a later nicety.
- **D3 — renderer registry.** *Recommend keeping `channels.cts` in the monorepo as the renderer's single declaration* rather than inlining per file as #1582's scope list says. The bug was the electron repo importing it under the same package name; one registry per side, none shared, is the honest shape and the smoke test guards the wire either way.
- **D4 — where the drift guard lives.** *Electron repo.* The consumer pins the ref, so the consumer checks its copies against it.
- **D5 — `apps/web` submodule.** Out of scope, unchanged.

## Routing

Phases 1–3 are clear-spec mechanical work: delegate to Codex (`gpt-6-astra`) via `codex-implement`, one phase per worktree, with the file lists above as the spec; Claude reviews each diff against the proofs listed and owns the wiki/memory pass. Nothing here is user-facing.

## Related

- wcpos/monorepo#1582 — the ruling and the monorepo-side scope (this map sequences it)
- wcpos/monorepo#1305 — lockfile-importer exclusion; closed by phase 3
- wcpos/electron#279, #321, #354, #368 — the nested workspace, the broken `dev:expo`, the 1.10.1 channel-rename incident, the packaged smoke test
- wcpos/roadmap#146 — desktop display window (post-1.11; rides the electron train, unaffected)

## Execution record (2026-09-09, lane `main` per Paul: "do it as you recommend")

- Phase 0: electron `next` fast-forwarded to `main`; standalone clone at `~/Projects/electron`, worktrees in `~/Projects/electron-worktrees/`.
- Phase 1: wcpos/electron#419 merged (`47696a8`): IPC registry and device-key codec moved into `src/`, nested workspace and `@wcpos/printer` dependency removed, `dev-expo.mjs` deleted, `renderer:import` added (stage-then-rename after a review finding). Codex (Astra) implemented; reviewed and lint-fixed by hand.
- Phase 2: wcpos/electron#420 merged (`ae78bae`): `.monorepo-ref` = `v1.10.9`, `build-expo` checks out the pin (dispatch override `monorepo_ref`), `release-notes` reads the app release from the pin, `scripts/check-monorepo-drift.sh` + `monorepo-drift.yml` (seven copied files + rxdb versions; daily). Live proof: the push-triggered Publish run 34400865330 resolved the pin and built the renderer from `v1.10.9`.
- Phase 3: wcpos/monorepo#1933 opened against `main` (submodule removed, `dev:electron-renderer`, `electron-dev` skill rewritten, packages comments repointed). Closes monorepo#1582 and #1305 on merge.
- Phase 4: session memory updated (local repo layout, release-train mechanics, submodule landmine, the map memory). Wiki pages are not hand-edited: the daily `/wiki-sync` folds the merged PRs.
- Phase 5 (open): the first desktop release after this is the proof on a real train. Sequence: monorepo release + tag → electron bump PR sets `package.json` version and `.monorepo-ref` → merge → cancel push run → dispatch Publish `platform=all`.
