# Dangling-issue audit, 2026-10-31

Paul, 2026-10-31, reading monorepo#3149 and a session's closing note:

> *"I'm noticing lots of dangling issues are being left in notes in the PRs … Sometimes just in the closing notes of the chat. This goes against the dangling issues rule that I have. Because I don't check the notes every time, or sometimes I'm busy, I might miss it and I don't read the PRs every time … important issues might be raised in these comments and they're just going to be forgotten, and then we're just going to sit in the code until someone finds the bug."*

> *"If there's a dangling issue that honestly can't be dealt with at the time, then it needs to be raised in a separate section. It needs to be brought to my attention. It needs to be made sure that I can't miss it. I do usually read the 'blocked on me' section so have a section similar to that that makes it clear to me that something needs my attention."*

Two questions: how often did it happen, and how is it stopped.

## Method

- **PR side:** every PR created since 2026-10-01 in the 38 wcpos repos pushed in October (2,614 PRs; bodies plus top-level comments by `kilbot` / `wcpos-bot`), scanned for deferral headings and vocabulary. 87 sections matched; after removing scope statements for sliced specs, bot boilerplate and plain claims tables, 26 PR bodies carried a real defect or an unanswered question for Paul.
- **Chat side:** every Claude Code transcript on this machine since the 2026-10-13 "Found is not a parking lot" ruling (705 transcripts). 752 closing-note **Found** sections, 126 with deferral vocabulary, 44 of which parked a real defect or work item.
- **Follow-through:** each of the 62 items was checked by a read-only agent; where one note carried two separable findings (A4, A5, C3, C6, C10, D17, and B14's five) each half has its own line below, which makes 73 lines for a later PR, issue or code change that picked it up. Labels below are the agents' (Observed / Inferred). GitHub search rate limits meant batch A searched saved PR lists rather than the live index; that batch's "still dangling" verdicts are Inferred where noted.

The sweep scripts and raw hit lists are not committed; this file is the record.

## Counts

Counted from the itemised sections of this file (one line per finding; sub-findings a/b are separate lines).

| Batch | Lines | Picked up later | Still dangling | Not a defect / accepted |
|---|---|---|---|---|
| A: PR bodies, app | 14 | 5 | 5 | 4 |
| B: PR bodies, plugins/docs/wiki | 21 | 10 | 7 | 4 |
| C: closing notes, app | 20 | 8 | 12 | 0 |
| D: closing notes, plugins/docs/ops | 18 | 5 | 9 | 4 |
| **Total** | **73** | **28** | **33** | **12** |

"Picked up" includes items picked up only because a *different* session found the same thing independently (the ghost Button was noted by four sessions; A1 was opened as #3154 by the session that wrote #3149 after Paul's message). Nothing in the pick-ups came from anyone reading the parked note. Two C pick-ups (C6a, C16) left the live check they named undone; those halves sit in the backlog as C6b and C16.

## Still dangling (the backlog)

Paul's disposition (2026-10-31, option A): fix PRs for the "own PR" lines in order over the sessions that come next; the rulings went to him as six questions with a pick each and he answered *"do as you recommend for all"* (recorded in roadmap memory `rulings-dangling-audit-2026-10-31`). Lines fixed, closed or scheduled since the audit are marked in place.

Each line: what, where it was parked, lane, the pick recorded in the audit session's closing message.

### App (monorepo)

| # | Defect | Parked in | Lane | Verdict |
|---|---|---|---|---|
| A2 | Quantity field accepts a decimal on a store whose REST API refuses one; no client `decimal_qty` gate | #2939 body "Found, not changed"; 10-25 note "say the word" | next | **Fixed 2026-10-31 (ruling 2):** woocommerce-pos#2498 (store payload carries `decimal_qty`), woocommerce-pos-pro#731 (lists), monorepo#3164 (keypad hides the decimal key when off; display keeps full places) |
| A3 | `FormSelect`, `FormCombobox`, `FormRadioGroup`, `FormSegmentedControl`, `FormTreeCombobox` have no label-press handler; a row label names them, a click does nothing | #2852 body "Known gap"; 10-22 note "small follow-up if you want it" | next | Observed: no `onLabelPress` wiring in `packages/components/src/form/` |
| A4b | Whether the plugin's tax-location filter substitutes a fuller store address (rows 2 and 8 of #1875, the 8.35% rate) | #2793 body "Not verified against the plugin" | main | Inferred: no tracker. #1875 itself is OPEN and tracks the line re-tax half |
| A5b | On web the generation-6 probe leaves an empty `pos_v5` file and WAL in the SQLite pool per scope; nothing deletes them | #2404 body "Known edges" | next | Observed: `legacy-scope-drain.ts` documents it as expected; no issue |
| A9 | `packages/query` tests are never typechecked (92 errors); #2905 put "a PR of its own" to Paul as its pick | #2905 body "Question for Paul" | next | Observed: tsconfig still `src/**/*` only |
| C4 | Reports hero shows 0 orders today under Everyone / Completed & processing while the session holds a cash sale | three 10-18 closing notes, "not evaluated further" | next | Inferred: nothing since 10-18 touches that filter |
| C7 | `pos-loader.js` has no retry; a cold-edge 404 on the entry script blanks a first visitor once per publish | 10-21 closing note | next | Observed: unchanged since 10-17; one jsDelivr fallback, no retry |
| C8 | Orders refund modal titles itself with the order's id, not its number | 10-23 closing note | both | **Fixed 2026-10-31:** monorepo#3159 (`main`, also the edit modal there) and #3160 (`next`) |
| C9 | Wedge detector swallows a second keystroke within 24 ms on a focused non-input element | 10-24 closing note "left to the detector" | next | **Closed 2026-10-31 (ruling 3):** the 24 ms window stays; a second key inside it off-input is a scanner burst by design. Not a defect |
| C10a | Customer `password` field autosaves through the 300 ms debounce; a pause mid-typing pushes a partial password | 10-25 closing note; #2949 body "for the owner" | next | Observed: no special case |
| C13 | `pnpm typecheck --force` in `apps/main` rejected by tsc; `@wcpos/core` eslint dies at the 2 GB heap from the root `pnpm run lint` | 10-29 closing note "I'll open a small fix PR after" | next | Observed: lint script still `eslint src`, no heap PR |
| C14 | Tooltips have no strip collision boundary; two Offline labels show on the POS when offline; no form-label fence; `next` CLAUDE.md heading still says jsDelivr | 10-30 closing note "small follow-ups still open" | next | Observed (CLAUDE.md); Inferred (rest) |
| C15 | Clear all on the Orders filter bar is a ghost Button, not the 10-30 word-plus-glyph shape | four closing notes on 10-30/31 (the screenshot) | next | **Fixed 2026-10-31 (ruling 1):** monorepo#3163, the Orders bar's Clear all is a link like the POS bar's |
| C17 | Reanimated "reading from value during render" warning on Electron | 10-22 closing note | next | Inferred: nothing mentions it since |
| C3b | woocommerce-pos#1754 (Stripe Terminal orders paid but left `pos-open`) open since the 1.10 line with zero comments; 10-15 note said it "needs its own check against demo" | 10-15 closing note | main | Observed: still open, uncommented |
| C6b | `pos-cart` add latency 446–617 ms idle against 229 ms on Oct 7 (budget 300 ms); #2863 fixed the search-heap jank but its live checkbox is unticked | 10-20 closing note "perf work, not changed" | next | Inferred |
| C16 | Offline double-session on a cashier switch: the guard shipped in #3034 but the repro on dev-next with the network off never ran | 10-28 closing note; #3034 body "has not been run" | next | Observed |

### Plugins, docs, wiki, tooling

| # | Defect | Parked in | Repo | Verdict |
|---|---|---|---|---|
| B6 | `scripts/generate-php-files.js` still rewrites `.l10n.php` differently from the pipeline's generator; running it by hand desyncs the tree | translations#392/#393 "Footgun, not changed here" | translations | Observed: still on `main`, still exposed as `pnpm generate:php` |
| B7 | ko `critical-error.mdx` title carries a stray closing quote | docs#541 "Not in this PR" | docs | Observed |
| B9a | `version-2.x/settings/wp-admin/registers.mdx` still describes the Free Registers screen woocommerce-pos#2392 deleted; `stores/registers-and-devices.mdx` links to it | wiki#1253 "Found" | docs | Observed |
| B10 | monorepo#3104's hand-over restamps or empties `_wcpos_register` on an open order; the wiki rules reassignment never touches a register and the server refuses `''` for it on `next` | wiki#1288 "Open question (flagged, not resolved)" | monorepo + woocommerce-pos | Observed (no follow-up); server refusal Inferred |
| B12b | wiki `support/permissions/switching-cashiers.md` still says the Switch user sheet is planned, not built | wiki#1286 "Flags for Paul" | wiki | Observed |
| B14e | wiki `receipt-email-queue.md` still says "latest release v1.9.7"; edited 10-31 without fixing it | wiki#1197 | wiki | Observed |
| B14a' | wiki `permission-gate.md` still says `next` compares `post_author`; #2159 synced the `_pos_user` fix | wiki#1190 | wiki | Observed |
| D3 | Three PHP 8.5 deprecations in PayArc, noted "for their own PRs" during the 10-15 pay-POST incident | 10-15 closing note | payarc-terminal | Inferred: no deprecation PR since; the incident doc naming them was not found |
| D5 | The sync digest holds a row per customer and per live order, against ADR 0036's window scoping; multisite has zero test coverage for the eight till tables | 10-19 closing note "a follow-up, Paul's call" | woocommerce-pos | **Fixed 2026-10-31 (ruling 4):** woocommerce-pos#2499, order digests windowed to 90 days, multisite smoke test for the five till tables |
| D6 | `scripts/probe-store-health.mjs` treats a 404 as healthy (how two days of a hijacked port went unnoticed) | two 10-19 closing notes "not changed" | monorepo | **Fixed 2026-10-31:** monorepo#3157 (`main`) and #3158 (`next`) |
| D7 | Pro `Refund_Processor` reads an authorization-only order as pre-ledger (filters on captured statuses only) | 10-20 closing note; woocommerce-pos#2352 body "Pro tidy-up" | woocommerce-pos-pro | Observed: last touched 10-14 |
| D8 | Bundle publish workflow and `tag-web-bundle.sh` print FAIL on transient jsDelivr 503s that clear within a minute; no retry before the verdict | four 10-21 closing notes "noted in the record" | web-bundle / claude-config | Observed: no retry added since 10-19 |
| D12 | Pro's integration parity harness imports two monorepo files that no longer exist on either lane, so it produces no evidence for any `next` tax change | 10-30 closing note "needs its own PR" | woocommerce-pos-pro | Observed: `client-calculator.ts` last changed 03-25 |
| D13 | Printed receipt, report and closure templates in the free plugin not audited for the ruled Store · Register order | four 10-30 closing notes "separate repo, separate PR, not started" | woocommerce-pos | **Audited and fixed 2026-10-31 (ruling 5):** every gallery, thermal and report template already printed store before register; the PHP fallback closure did not and now does, woocommerce-pos#2497 |
| D14 | Pro header says `Requires at least: 5.6`; the updater's `update_plugins_` hook exists only from WP 5.8 | 10-15 closing note | woocommerce-pos-pro | **Fixed 2026-10-31:** woocommerce-pos-pro#727 (`main`) and #728 (`next`) |
| D17d | Offline sales slice D (the SumUp queue) is the one remaining slice ADR 0040 lists as missing | 10-23 closing note "slices C and D remain" | monorepo | **Scheduled 2026-10-31 (ruling 6):** waits for the next SumUp hardware session; no code before it |
## Picked up (no action)

D1 (mercadopago#16), D2 (woocommerce-pos#2280 cut the zips), D9 (windcave#22, v0.1.1), D10 (woocommerce-pos#2437), D17c (#2894), A1 (#3154 open), A4a (#1875 open, tracked), A5a (#2825/#2923 superseded the drain), A6 (electron#500), A7 (#2400), B1 (woocommerce-pos#2471), B2 (#2439/#2440), B3 (woocommerce-pos#2134), B5 (pos-soak#7), B8 (docs#536), B11 (woocommerce-pos#2366; wiki#1247), B13 (stripe-terminal#134), B14a/b/d (synced), C1 (#2535), C2 (woocommerce-pos#2229/#2242), C3a (woocommerce-pos#2467 open issue), C5 (#2729), C6a (#2863), C10b (#2950/#2953), C11 (#2974), C12 (#3080).

## Not a defect / accepted on the record

A8 (Maestro login ids: optional hardening), A10 (declined Codex finding, accepted trade-off), A11 (CLIENT121 no longer emitted), A12 (unbuilt caption, no timestamps), B4 (web-bundle tag numbering is one ahead by design), B9b (one register per store was re-ruled in roadmap#466), B12a (#3022 was ruled "merge it" in chat; the ruling is in memory, not on the thread), B14c (default Cashier role cannot delete on either lane), D4 (#2312 closed unmerged; wiki#1246 rewrote the pages), D11 (dream exited 0 on eight of the last ten nights; the two failures were pool quota), D15 (`watch-pr.sh` line 74 is a plain assignment now; the three errors were a script edited while a watcher ran it), D16 (`next` has `review-gate.yml` via #2857).

## Why the first hooks missed these

- `block-parking-lot-prose.js` matched a short vocabulary ("follow-up", "out of scope", "owner to schedule"). The October bodies used headings instead: "## Not in this PR" (16 times), "## Found, not changed", "## Found during review, not in this PR", "## Known gap", "## Not fixed here", "## Not done", "## Question for Paul (one, with a pick)", "## Decisions for Paul". None matched.
- No hook read the closing message at all. The `Found` rule of 10-13 lived only in CLAUDE.md, and under load sessions wrote "untouched", "not changed; say the word", "worth its own diagnosis", "I'll open a small fix PR after this lands" under it. `ask-carries-a-pick.js` refused "say the word" but not "if you want it".
- "Question for Paul (one, with a pick)" in a merged PR body is the same failure in a different coat: nine ADR-series PRs on 10-23 merged with a question in the body he never saw, each answered by the author's own pick.

## What changed (claude-config commit f8678ff, pushed 2026-10-31)

- **Rule.** The run-ending message has four headings: **Blocked on you**, **Dangling**, **Changed**, **Found**. A defect not fixed in the run goes under **Dangling**, one line: what is broken, why not now, `Pick: <own PR | drop | needs your ruling>`. Found carries only non-defects. A PR body carries design decisions and what the slice is, never a defect left behind or a question for Paul. Paul's words are quoted verbatim in `~/.claude/CLAUDE.md` and in roadmap memory (`feedback-dangling-goes-under-its-own-heading`).
- **Stop hook `found-is-not-a-parking-lot.js`.** Reads the final message. Refuses a Found bullet with deferral vocabulary, a Dangling line with no pick, and strong deferral phrases anywhere outside Blocked on you / Dangling. Never blocks twice in a row; per-session bypass file. Tested on the real October notes.
- **`block-parking-lot-prose.js` tightened.** Heading-aware: deferral headings are refused outright; "Not in this PR" / "Out of scope" pass only when the section names no defect; the vocabulary now covers "needs its own PR", "separate `main` PR", "issue to follow", "will be fixed in", "not started", "Paul's call", "if you want it", "traced by review, not reproduced". Tested on the 26 bodies.
- **`ask-carries-a-pick.js`.** The Blocked-on-you list ends at a Dangling heading, so Dangling lines are notices, not extra questions.
- Hook tests 52/52; both hooks smoke-tested end to end with real payloads. The new PR hook refused the audit session's own smoke-test command on first try, which is the behaviour wanted.

## What the hooks cannot catch

A session that drops a defect from both the PR and the chat leaves no text to match. The hooks make the honest path the cheap path; they do not make silence impossible. The dream run's nightly transcript review is the backstop for that case.
