# Release-brief roadmap sync — spec (draft v0)

**Status:** ready for review, written 2026-09-11 from the decisions on the [Release-brief roadmap sync map](https://github.com/wcpos/roadmap/issues/178). Every rule below links to the ticket that decided it; the ticket's resolution comment is the authority if this text and it disagree. The page rebuild (§4.2, §10) has landed as [wcpos/wcpos-com#629](https://github.com/wcpos/wcpos-com/pull/629) and the release-issue contract is in live use on [v1.11.0 — Checkout & payments](https://github.com/wcpos/roadmap/issues/195); nothing here is provisional any more.

**Language:** [`CONTEXT.md`](../../CONTEXT.md) (merged as #193). This document uses those words internally; **public copy says "features", never "epics"** (a merchant-wording rule set on the page PR).

---

## 1. Purpose and principles

wcpos.com/roadmap, the five repos' milestones, Project #4 and the Discord roadmap forum have drifted because each was maintained separately and one of them (the board's Status column) by nobody. This system makes **one artifact the source** and everything else a **projection** of it.

1. **The release issue is the source.** One issue per release in `wcpos/roadmap`, written by an agent from Paul's spoken intention. Nothing else is authoritative.
2. **Projections heal, choices are reported.** Anything derivable from the release issue and its sub-issue tree is overwritten into place without asking. Anything that needs a decision is a digest item with a lane.
3. **Nothing depends on a human, or an LLM, keeping a column current.** Every public state is derived from GitHub facts.
4. **Paul never touches issues or the roadmap.** He speaks; agents file; he reads a digest and answers with a sentence.
5. **Two runtimes by kind of work.** A GitHub Action does the mechanical half. The Mac Mini assistant (any Claude session until it exists) does the judgment half. The digest is the seam.
6. **The page never lies.** An empty section beats a stale one; a title alone beats a body fragment.

## 2. The release issue ([#183](https://github.com/wcpos/roadmap/issues/183))

**Identity.** An issue in `wcpos/roadmap` with the `release` label and a title matching

```
^v(\d+)\.(\d+)\.0 — (.+)$      # version — theme; theme ≤ 60 chars; separator is space, em dash, space
```

Exactly one release issue per version. `release` and `epic` are never on the same issue.

**Body.** Three sections, then optional free prose. The whole body is public and written for merchants; internal notes go in comments.

```markdown
### Due date
2026-09-30                     # ISO date, or empty

### Why this release
<prose>

### Not in this release
- <item>                       # optional section; deferred decisions from maps land here
```

"What's in" is never written: it is the sub-issue list.

**Children.** Every direct sub-issue of a release is a public **epic** (Rule A). The sync applies the `epic` label. Work (landing tasks, implementation issues, research) nests under an epic, never under the release. An epic's public text is the `### Summary` section of its body (the Epic form's field); an epic without one **counts on GitHub but is hidden on the page and the forum**.

**Lifecycle, derived.**

| State | Rule | Page group |
|---|---|---|
| Active | the lowest-version open release | Now |
| Planning | any other open release with a due date | Next |
| Planning (dateless) | open, `### Due date` empty | Later |
| Shipped | closed as `completed` | Shipped |
| Withdrawn | closed as `not planned` | never shown; milestone copies deleted |

Reopening returns a release to the open rules.

**Close-out.** When a release closes, its open epics **detach**, lose their milestone and lead the digest (`paul` lane). Shipping never changes another release's scope.

**Scope authority.** Agents attach an epic when it fits the Theme and is not excluded by "Not in this release"; they ask Paul when unsure; they never attach to a shipped release. Every attach/detach on an open release is a digest line.

**Not releases.** Patch lines (`v1.9.x`, `v1.10.x`) have no release issue and do not appear. The `Compliance / Fiscalization` track is retired; its work rides as epics under the releases that ship it. `v2.0.0` is a dateless release. Security P0s are not release-gated.

**`ROADMAP.md` is deleted**; the README points at wcpos.com/roadmap and `label:release`.

## 3. Status model ([#184](https://github.com/wcpos/roadmap/issues/184))

| Epic fact | Derived state |
|---|---|
| closed, `stateReason = COMPLETED` | done |
| closed, `NOT_PLANNED` or `DUPLICATE` | withdrawn: detached, milestone dropped, never shown |
| open, `subIssuesSummary.completed > 0` | in progress |
| open, otherwise (including zero sub-issues) | planned |

Per-epic progress = `completed / total` sub-issues when `total > 0`. Release progress = done visible epics / visible epics.

**Shipped trigger.** When `wcpos/woocommerce-pos` gets a tag matching `^v(\d+)\.(\d+)\.0$`, the sync closes the matching release issue as `completed`. Patch tags do nothing. A release closed by hand with no tag is a `paul` digest item.

**Project #4** is neither read nor written by anything here. Its built-in "Item closed → Done" and "Pull request merged" workflows are enabled once by hand (UI-only). The board is the agents' triage intake; the README stops calling it the roadmap.

## 4. Projections

### 4.1 Milestones ([#185](https://github.com/wcpos/roadmap/issues/185))

- Five copies per release, always: `woocommerce-pos`, `woocommerce-pos-pro`, `monorepo`, `electron`, `roadmap`. Created with the release issue, closed at ship, deleted on withdrawal.
- Title = version. Description = theme + `\n\nManaged from wcpos/roadmap#N — do not edit.` Due = the brief's date. Hand edits are overwritten.
- The tree writes downward: every descendant of a release (epics and their work, any repo) gets the milestone; reparenting moves it; a disagreeing milestone under an epic is corrected silently.
- A release milestone on an issue with **no parent chain is repo-local targeting**: left alone, never reported.
- At ship, open work in the copies is listed once (`assistant` lane); the sync does not move it.
- **One-off cleanup** (bulk run): delete `2026.1`–`2026.10` and monorepo `Backlog`; leave `v1.9.x` closed; close `v1.10.0` everywhere; retire `Compliance / Fiscalization` (its open issues surface once for epics to be written); `v2.0.0` becomes a dateless release's copies. Afterwards any open non-release milestone is drift.

### 4.2 The page ([#190](https://github.com/wcpos/roadmap/issues/190))

`wcpos.com/roadmap` reads **release issues and their epics directly** from `wcpos/roadmap` with one GraphQL query (≈1 point):

```graphql
repository(owner:"wcpos", name:"roadmap") {
  issues(labels:["release"], states:[OPEN, CLOSED], first:50) { nodes {
    number title state stateReason closedAt body url
    subIssues(first:100) { nodes { number title body state stateReason url
      subIssuesSummary { total completed } } } } } }
```

Transform: parse title and sections; skip a `release`-labelled issue that fails the regex (log); groups per §2; epics visible iff `### Summary` present; order in progress → planned → done, then GitHub sub-issue order; Shipped capped at the latest two. **No bug strip** (`BugFixList` and `roadmap.bugs.*` go). Empty states: no open release → existing "nothing to display yet"; a release with no visible epics → its brief plus "No public items yet". **Zero releases in a production render → `infraLogger.error`** to the Discord alert path. Chip copy: "live from GitHub" → `github.com/wcpos/roadmap/issues?q=label:release`. Cache unchanged (`cacheLife('roadmap')`, revalidate route). Auth unchanged (`wcpos-website`, read-only). `GITHUB_PROJECT_NUMBER` removed; owner/repo are constants. **Layout (built, wcpos/wcpos-com#629):** the active release as a hero — version, theme, `done / visible` fraction, due date, the brief in two columns (Why | Not in this release), epics as cards with full Summaries and progress — and Next / Later / Shipped beneath on the existing scroll-drawn rail, Later with a dotted tone, Shipped faded. Empty brief sections render no heading. A due date must be a real calendar day (`2026-02-31` → null + warning).

### 4.3 The Discord forum ([#189](https://github.com/wcpos/roadmap/issues/189))

- **One thread per visible epic**, created when the epic becomes visible. Starter = Summary, release (header line), progress, GitHub link. Edited in place on change.
- Replies only for events: completed, shipped in vX.Y.0, moved, reopened, withdrawn, detached leftover. Shipped and Withdrawn archive the thread. Human replies are never touched; the sync re-archives only on the next state change.
- Five state tags, one at a time: `Planned` `In progress` `Done` `Shipped` `Withdrawn`. The service creates a missing tag. Type tags are dropped.
- Writer: the sync Action, via `wcpos-discord` (§7). Forum drift is a projection (§6.3).
- First pass under the manual `bulk` dispatch, after Paul glances at the channel and posts a short human announcement.

## 5. The sync Action ([#186](https://github.com/wcpos/roadmap/issues/186))

**Home.** `wcpos/roadmap`: `sync/` (TypeScript, tests) + `.github/workflows/roadmap-sync.yml`. The README's "no code" sentence becomes "the only code here is the sync that keeps the roadmap honest".

**Triggers.** `schedule: */15 * * * *` (the guarantee); `issues: [opened, edited, closed, reopened, labeled, unlabeled]` on this repo; `repository_dispatch: release-tagged` sent by a new step in `woocommerce-pos/.github/workflows/release.yml` after it pushes a `vX.Y.0` tag; `workflow_dispatch` with input `bulk: boolean`.

**Credential.** `wcpos-bot` (App 2860316) via the existing `PROJECT_BOT_APP_ID` / `PROJECT_BOT_PRIVATE_KEY` secrets; per-run installation token scoped to the five repos. No new App.

**Reconcile (stateless, every run).**
1. Read: all `release` issues + sub-issue trees (GraphQL); milestones in five repos (REST); `woocommerce-pos` tags; the digest issue; forum threads (`GET /api/roadmap/threads`).
2. Validate each release issue; a failing one gets **one comment** (marker `<!-- roadmap-sync:invalid -->`, edited not repeated) and **blocks every write derived from it**.
3. Compute desired state: release states, epic states, milestone set, `epic` labels, detachments, forum threads, revalidation need.
4. Diff against actual. If `writes > BULK_CAP` (constant, 100) and not `bulk`: write nothing, report.
5. Apply deltas serialized at ≥1 s; `concurrency: roadmap-sync` group; any write error fails the run (next tick retries).
6. Emit the digest (§6). If any write happened, `POST https://wcpos.com/api/roadmap/revalidate` with `x-webhook-secret`.

**Writes, complete list.** Close release on tag · create/update/close/delete milestone copies (five repos) · set milestone on every descendant, move on reparent · apply `epic` to direct children · detach open epics on release close and withdrawn epics · forum upsert/reply/archive · edit the digest issue · validation comment · Discord ping (§6.4) · revalidate ping. **Never:** Project #4 writes, priority labels, issue closes other than the release-on-tag, attaching epics, editing bodies.

## 6. The digest ([#187](https://github.com/wcpos/roadmap/issues/187))

**Home.** One pinned issue in `wcpos/roadmap`, label `roadmap-digest`, created by the Action if missing, edited in place. Body: **State** → **Attention** (lanes) → fenced `json` block → `Last run: <ISO> (<run URL>)`.

**State section.** Every open release (version, theme, due, group, progress) with its epics (state, progress); the unattached open-epic pool count with a filter link; the latest shipped release.

**Lanes.**

| Lane | Items |
|---|---|
| `paul` | leftover epics awaiting placement · epic attached/detached on an open release (veto) · release closed by hand with no tag |
| `assistant` | epic under an open release with no Summary · epic under the Active release with zero sub-issues · epic whose milestone names a release it is not a child of · open non-release milestone · open work in a shipped release's copies · release blocked by validation · run refused on bulk cap · unknown thread in the forum |
| `log` | milestone copies created/overwritten · `epic` label applied · withdrawn epic detached · release closed on tag · forum thread created/edited/re-tagged/archived · tag created |

Escalation: the assistant re-tags an `assistant` item it cannot resolve to `paul` with a one-line reason.

**JSON block (sketch).**
```json
{ "generatedAt": "…", "runUrl": "…",
  "state": { "releases": [ { "version": "v1.11.0", "theme": "…", "group": "now", "dueOn": "…", "url": "…",
     "epics": [ { "number": 3, "title": "…", "state": "in_progress", "visible": true, "progress": {"completed":3,"total":7}, "url": "…" } ] } ],
     "unattachedEpics": { "count": 61, "url": "…" }, "latestShipped": "v1.10.0" },
  "items": [ { "id": "leftover:21", "lane": "paul", "kind": "leftover", "subject": "wcpos/roadmap#21", "text": "…", "since": "…" } ] }
```
Item `id`s are stable across runs so the assistant can track what it has handled.

**Notification.** A Discord message through the existing webhook **only** when a `paul` item appears or changes, and when the run fails twice in a row. Nothing when green. No heartbeat. The assistant reports a `Last run` older than 2 h.

**Boundary.** The page is not checked by the Action (§4.2 self-alert).

## 7. `wcpos-discord` changes ([#189](https://github.com/wcpos/roadmap/issues/189))

New routes, behind a **dedicated** bearer token (`ROADMAP_API_TOKEN`, a platform credential):
- `PUT /api/roadmap/threads/{issueId}` — idempotent upsert keyed by GitHub issue **id**: create thread or edit starter; set the single state tag (create tag if missing); body `{ title, summary, release, progress, url, state }`.
- `POST /api/roadmap/threads/{issueId}/reply` — `{ event, text }`.
- `POST /api/roadmap/threads/{issueId}/archive`.
- `GET /api/roadmap/threads` — `[ { issueId, threadId, state, starterHash, archived } ]`.

Remove the GitHub-webhook roadmap handlers (`issues`, `pull_request`, dead `projects_v2_item`); keep `/api/agent-events` and the archive listener. Migrate `roadmap_threads` to key on issue id. Add tests for the roadmap routes. Truncate titles at 100 and bodies at 2000 chars explicitly.

## 8. Drucker retirement ([#188](https://github.com/wcpos/roadmap/issues/188))

A sequenced PR series in `wcpos-openclaw`, independent of the sync, each PR leaving the subscription-runtime image building:
1. Copy `services/board-ops/eval/*.json` into `wcpos/roadmap/sync/fixtures/board-ops-audit/`; cut the roadmap sections of `PRODUCT_DIRECTION.md`, Workflow 2 of `OPERATING.md`, the hygiene mandate of `TOOLS.md` to a pointer paragraph; rewrite `product-brief` step 3; delete the skills `roadmap-update`, `milestone-health`, `board-sweep`, `board-judgment`, `discord-roadmap-sync`, and `PRECEDENTS.md`; trim the gateway skill allowlist; drop the two dead Discord schemas; update the single-writer sentence in the five agent `TOOLS.md` + `GITHUB_TOOLING_POLICY.md`; in Seneca's `CLAUDE_CODE_RULES.md` drop the Project #4 URL / `PVT_` id and add "never parent an issue under a `release` issue except per wcpos/roadmap AGENTS.md".
2. Delete the `drucker-hygiene-sweep` and `drucker-review-queue-check` crons and the judgment scheduler; extend `drucker-cron-freeze.test.ts` to guard them.
3. Delete the hygiene/judgment runners and gateway routes (`/api/drucker/board-ops`, `/board-ops/*`), `board-ops-runner.ts`, the `drucker.roadmap.*` intents.
4. Delete `services/board-ops/` with its CI matrix entry, deploy trigger and Dockerfile copy.
5. Close the eleven `drucker-review` issues with one comment; remove the dead constant in `decision-queue/collector.ts`.

The fleet-wide `projects_write` deny stays. App 2860316 is never revoked.

## 9. `wcpos/roadmap` repo changes

- `CONTEXT.md` (PR #193) and **`AGENTS.md` recipe** (below); `.github/ISSUE_TEMPLATE/release.yml` mirroring the body shape; delete `ROADMAP.md`; README rewrite; `sync/` package; workflow; `roadmap-digest` and `release` labels (the latter created 2026-09-11).

**AGENTS.md recipe (to add verbatim):**
> **Releases.** A release is an issue labelled `release` titled `vX.Y.0 — Theme`, body sections `### Due date`, `### Why this release`, `### Not in this release`; the whole body is public. File one only when Paul states a release's intention; write it in his words for merchants. Attach an epic (as a sub-issue) when it plainly fits the Theme and is not excluded; ask Paul when unsure; never attach to a shipped release. Every direct child of a release is public: give it a `### Summary` (2–3 sentences for merchants) or it stays hidden. Work nests under epics, never under a release. Never edit a milestone; the sync owns them. When you close a map whose deferrals affect the active release, add them to its "Not in this release".

## 10. `wcpos-com` changes

Done in [wcpos/wcpos-com#629](https://github.com/wcpos/wcpos-com/pull/629): `github-roadmap.ts` (query + transform per §4.2) and `types/roadmap.ts` replaced; `roadmap-timeline.tsx` rewritten to the hero + rail layout; `bug-fix-list.tsx` deleted; `dev-fixture.ts` rewritten; tests rebuilt on markdown fixtures under `src/services/core/external/__fixtures__/roadmap/` (the sync copies these — §12); error-level self-alert; ten locales updated; `GITHUB_PROJECT_NUMBER` removed from `env.ts` (remove it from Vercel once merged).

## 11. Landing order

1. Drucker retirement PR 1 (fixtures copied) — can start now.
2. `wcpos/roadmap`: `AGENTS.md` + release form + README + delete `ROADMAP.md`; Paul enables Project #4's two built-in workflows (two clicks).
3. `sync/` reconcile with milestones + labels + detach + digest, **dry-run mode** (`workflow_dispatch` only, writes logged not applied) for one week of ticks; read the digest.
4. Bulk cleanup (`bulk: true`): legacy milestones, five copies for v1.11.0 and v2.0.0, `epic` labels.
5. Enable the schedule; add the `release-tagged` dispatch step to the plugin's `release.yml`.
6. `wcpos-com` page rewrite — **done (#629)**; the revalidate ping is enabled when the Action lands (step 5).
7. `wcpos-discord` routes; forum `bulk` first pass after Paul's glance.
8. Drucker retirement PRs 2–5.
9. Assistant onboarding: read the digest JSON, work the `assistant` lane (**provisional**, waits on the Mac Mini).

## 12. Tests

- `sync/fixtures/releases/*.md`: release issue bodies covering valid, malformed title, malformed date, missing section, dateless, withdrawn; `sync/fixtures/trees/*.json`: release → epics → work trees covering every lane item. **The site copies the same fixtures** for its transform tests so the two parsers cannot diverge.
- Board-ops audit fixtures (§8.1) as regression cases for done / stale / orphan checks.
- Reconcile tests assert the exact write list for each fixture, and that a malformed release produces zero writes and one comment.

## 13. Open

- Page layout: settled by building it ([#192](https://github.com/wcpos/roadmap/issues/192) → wcpos/wcpos-com#629).
- Release issue contract in practice: in live use on #195 ([#191](https://github.com/wcpos/roadmap/issues/191)); one clarification for `AGENTS.md`: "Not in this release" is where deferred decisions from maps land.
- Translation of the brief and Summaries (fog on the map).
- The assistant's cadence and record-keeping (fog; waits on the Mac Mini).
- A `track` kind for standing themes was ruled out for now; additive later if needed.
