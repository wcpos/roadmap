# Handoff: the Sales room on Reports (wcpos/roadmap#332) — 2026-09-30, 00:00Z

Continues `2026-09-29-reports-sales-room-handoff.md`. Everything below is committed and pushed; nothing lives only in a worktree or a tmp directory. The briefs this session wrote (3e, 4a, 4b, 4c) and the engine map 4b was built from are beside this file in `2026-09-30-reports-briefs/`.

## Where things are

| PR | State | Merge commit |
|---|---|---|
| 2b chart — wcpos/monorepo#2246 | merged | `15d0aca3d` |
| 3a period section, Orders / Top products / Taxes / Refunds cards — #2250 | merged | `16ead0f72` |
| 3b donut; Payments / Categories / Cashiers — #2254 | merged (Where sold pulled out, see decision) | `859dc60df` |
| 3c detail panels, Export CSV — #2256 | merged | `513ac45f8` |
| 3d Orders panel, unticking, left-out chip — #2262 | merged (Print pulled out to 3e) | `0391a04a1` |
| 3e Print through the plugin's `report` templates — #2270 | merged | `6d8d00962` |
| 4a margin columns, Brands card, four states, rollup — #2274 | merged (review of record: `codex review` on the diff; both bots exhausted) | `9c7927b8a` |
| 4b `refunds-browse` lane in the sync engine — #2277 | **open, waits for a bot pass** (both exhausted 2026-09-29 evening); two `codex review` passes taken | head `a396c3259` |
| 4c Refunds by refund date + margin netting | brief written (`BRIEF-4c.md`), not started; opens off `next` after 4b merges | |
| Where sold card + Channels / Registers panel | **waits on Paul's ruling** (below); its `channels` / `registers` aggregations are on `next`, tested | |

Every landing note, the splits (3 → 3a/3b/3c → 3d/3e; 4 → 4a/4b/4c), the COGS proof and the refunds-route probe are comments on #332. Captures per PR are under `docs/prototypes/2026-09-29-reports-shell-captures/{cards,panels,margin}/`.

## Decision waiting on Paul (posted on #332, 2026-09-29 ~15:40Z)

**Should the Sales room's store scope include the store's online orders?** The Sales query is POS-only by construction (`store` matches `_pos_store` or `created_via = woocommerce-pos`), so "Where sold: In store · Online" can never show Online — the design call PR 1's landing note deferred. **A** (recommended): the store's sales include the site's online orders (one translator rule; multi-store shows the online leg under every store); Where sold returns as In store · Online with Registers under All registers. **B**: the room stays the till's; Where sold becomes Registers-only. One answer, A or B; everything else proceeds.

## To resume

1. `git -C /Users/kilbot/Projects/monorepo-v2 fetch origin next`. The 4b worktree is `/Users/kilbot/Projects/monorepo-v2/.claude/worktrees/reports-sales-4b` (branch `feat/reports-sales-4b`, clean and pushed).
2. **4b:** request `@codex review` and `@coderabbitai review` on #2277 once the windows reopen (Codex said "usage limits for code reviews" from ~21:30Z; CodeRabbit "Review limit reached" all day). Answer threads at their **root** id, resolve, push, re-request; the body carries the stop rule. Merge with `gh pr merge 2277 -R wcpos/monorepo --merge --delete-branch`, landing note on #332, `rm -rf` the worktree, `git worktree prune`, delete the local branch.
3. **4c:** `git worktree add -b feat/reports-sales-4c … origin/next`, `pnpm install --frozen-lockfile --offline`, copy `BRIEF-4c.md` into the worktree root, run `codex exec -m gpt-6-astra -c model_reasoning_effort="high" -C <worktree> -s workspace-write -o <result.md> "Read BRIEF-4c.md … A type error in a test you have just written is ordinary work … Where the brief and the code's real contract differ, the code wins …"`, review the diff, walk it (a local Metro + the throwaway capture spec pattern in the 2026-09-29 handoff; dev-next has refunds in its history), PR titled `feat(reports) 4c of 4: refunds on the day they were made, margin nets them (roadmap#332)`, own to merge. Note: a refund's store and register are its parent's; the brief scopes by parent order or POS identity meta.
4. **Where sold:** when Paul answers — A: a small PR on `query-state-translator.ts`'s `store` rule (+ test) then the Where sold card and its two panels from 3b's first head (`git show 1c2f5a3c1:packages/core/src/screens/main/reports/cards/where-sold.tsx`); B: the card as Registers-only under All registers.
5. **Close-out:** after 4c and Where sold: close #332 with a landing comment listing every PR and merge commit; one clause in map #282's progress paragraph after the register clause; a note on #333 that its app half is unblocked (a registered report becomes one more card through `PeriodSection`'s `cards` array and a `panelSpec`).

## What every PR here needed under review (write these into any new brief)

The five from the 2026-09-29 handoff still hold. Added today, each from a review round:
- **Quantities are not money**: item counts through a `quantity` formatter (three decimals), never the money-precision `number`.
- **Whole phrases in the catalogue**: never `${x}%` or `"a · b"` in code; a plural key's `count` only picks the plural, the shown value is a separately formatted placeholder.
- **Tax and line shapes as `receipt/utils/build-receipt-data.ts:500–540` encodes them**: an empty-string `taxes[].total` means the rate is not on this line; labels fall back `label || rate_code || 'Tax'`; membership by rate id.
- **Footers sum their own rows** where the rows carry line totals (the order total carries shipping and fees).
- **Rows go through `@wcpos/components/virtualized-list`** the way the DataTable composes it (static header, `parentComponent={TableBody}`, static footer).
- **A first caller of a shared discriminant** (`useReceiptDocument({ templateType: 'report' })`) must have every stage below the hook checked; five P1s came from stages that only knew `receipt` and `closure` (template sync readiness, offline-capable filtering, `mapReceiptData`, print outcomes, data readiness).
- **A brief that sketches another repo's schema** names the schema file as the authority and asks for the validator's invariants pinned in tests (two Readiness stops on 3d: `group_by`, `fiscal.is_report_document`, non-nullable `totals`).
- **Every new testID grepped against the tree** (3a's one stop: `reports-period` was the date button's).
- `useNumberFormat` **mutates its options** (lodash `defaults`): build every formatter from its own object (`use-report-formats.ts`).
- Stop rule in the PR body's Reviewers section **before** the second pass; both bots' limits are a daily fact — record unreviewed heads in the body, and for engine-stakes PRs wait for one bot pass.

## Known environment facts (additions)

- `wcpos/v2` routes mount only for a POS-shaped request: over HTTP send `X-WCPOS: 1` and `X-WCPOS-Protocol: 2` (else 426 `wcpos_update_required`); `rest_do_request` inside `wp eval` gets `rest_no_route`. Refunds are `wcpos/v2/refunds?parent=<id>` and honour `after` / `before` / `orderby=date`; the route ignores `pos_store`.
- The local wp-env for the plugin's `next` is in `/Users/kilbot/Projects/woocommerce-pos-worktrees/cogs-probe` (a detached worktree at `4cd90c18`), started with `pnpm exec wp-env start`; product 10 has cost 12.50, order 11 (2 units), refunds 12 (amount-only) and 13 (a line refund). Docker was started by this session; it is left running (never quit a shared daemon).
- COGS shapes (memory `wc-line-cogs-isset-leak`): a costed line carries `cost_of_goods_sold.value`; an uncosted line leaks raw `cogs_value: null`; the schema key is right.
- dev-next occasionally answers 7–8 s per request; the connect probe then fails with AUTH431 and the walk spec's global-setup dies on `logged-in-users-label`. Wait a few minutes and retry; it is not the branch.
- Metro in dev mode hot-reloads worktree edits; a Playwright run against it takes ~1–2 min per width; the `.auth-state` is created by global-setup's own login and lives in the worktree, so it is lost with the worktree.

## Memory written this session (in `~/.claude/projects/-Users-kilbot-Projects-roadmap/memory/`)

`wc-line-cogs-isset-leak` (new), `spec-readiness-checks-before-codex` (checks 13–15), `codex-review-loop-on-scoped-ui` (fourth data point).
