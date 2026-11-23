# The Mac mini builds v2.2.0 permissions (#599): standing handoff

**Date:** 2026-11-22. **Map:** [Control what each cashier can do (v2.2.0)](https://github.com/wcpos/roadmap/issues/599). **Contract:** `docs/specs/2026-11-22-cashier-permissions-v2.2.0-spec.md`. **Owner from here:** the Mac mini's Claude. **Why this file:** every decision is made; what is left is building seventeen tickets in a fixed order under fixed rules, and the mini re-reads this each session instead of re-deriving it from sixteen resolution comments.

The paste-able prompt is at the end.

## Where the map stands

All sixteen decision, research and prototype tickets are closed. The open children are the build:

| Slice | Ticket | What | Blocked by |
|---|---|---|---|
| 1 | [#620](https://github.com/wcpos/roadmap/issues/620) | Permission registry, introduced marker, stamp on sync (Free) | none |
| 1 | [#621](https://github.com/wcpos/roadmap/issues/621) | App capability source: fail closed, stamp re-read, Refresh permissions | #620 |
| 1 | [#622](https://github.com/wcpos/roadmap/issues/622) | Access screen: the promise table (Free settings app) | #620 |
| 2 | [#623](https://github.com/wcpos/roadmap/issues/623) | Hidden cost in the store | #620 |
| 2 | [#624](https://github.com/wcpos/roadmap/issues/624) | Hidden cost and the reset in the app | #621, #623 |
| 3 | [#625](https://github.com/wcpos/roadmap/issues/625) | Selling permissions judged on push; paid sale flagged | #620 |
| 3 | [#626](https://github.com/wcpos/roadmap/issues/626) | After-sale permissions and the three splits | #625 |
| 3 | [#627](https://github.com/wcpos/roadmap/issues/627) | Action-permission gating in the app | #621, #625, #626 |
| 4 | [#628](https://github.com/wcpos/roadmap/issues/628) | Page permissions | #621 |
| 5 | [#629](https://github.com/wcpos/roadmap/issues/629) | Store-wide settings and locks in the store | #620 |
| 5 | [#630](https://github.com/wcpos/roadmap/issues/630) | Store-wide settings in the app | #621, #629 |
| 6 | [#631](https://github.com/wcpos/roadmap/issues/631) | Own-sales scope in the store | #620, #623 |
| 6 | [#632](https://github.com/wcpos/roadmap/issues/632) | Own-sales scope in the app | #624, #631 |
| 7 | [#633](https://github.com/wcpos/roadmap/issues/633) | Hidden customer contact details | #623, #624 |
| 8 | [#634](https://github.com/wcpos/roadmap/issues/634) | Cashier PINs in the store | #629 |
| 8 | [#635](https://github.com/wcpos/roadmap/issues/635) | Cashier PINs in the app | #621, #630, #634 |
| docs | [#636](https://github.com/wcpos/roadmap/issues/636) | The v2.2.0 permissions docs | #627, #624 |

Blocking is wired natively, so the tracker shows the frontier. The first takeable ticket is #620; #621, #622, #623, #625 and #629 open as soon as it lands.

## The order of work

1. **#620 first, alone.** Everything reads the registry.
2. **Then #621**, the app's capability source: every app ticket is blocked by it.
3. **Then slice 2 (#623, #624)**: a merchant is waiting on hidden cost, and the reset it builds is what slices 6 and 7 stand on.
4. **Then #622, and slices 3, 4 and 5** in ticket order. They are independent of each other once #620 and #621 are in; take them one at a time anyway (one suite at a time on this machine).
5. **Slice 6, then 7, then 8.** #635 needs a lock-screen options board picked before it is built; run `/mockup` and post the board as its one question.
6. **#636, the docs, runs beside the build from slice 3 on.** It is blocked until slices 2 and 3 are on `next` (#624, #627), because the Access page describes rows those slices add. From then on, when a slice lands, write that slice's pages under #636 before taking the next slice's ticket. This is the one exception to taking tickets in list order.

## Rules that bind every session on this build

- **The spec is the contract; the resolution comments are the rulings.** Never re-decide a closed ticket. If the spec and a resolution disagree, the resolution wins and the spec gets a fix PR. If both are silent, that is the night's one question.
- **Scope is the nouns in the ruling.** Nothing here authorises per-person exceptions, WP Admin scoping, manager approval at the till, freezing a sale's cost, filtering third-party meta, store-wide layout, or setting anything from inside the app (spec §14). A capability, option or setting is never removed because a slice stopped using it.
- **Every new permission is granted on introduction.** A slice that changes what an existing store's cashier can do without an owner switching something off is a defect.
- **The store enforces; the app shows.** No row of the permission list ships as a hidden button except the two the spec names. A restriction never sits behind a licence check.
- **Stakes are High for everything the store enforces**: a failing test first per permission, both order storage modes, the WooCommerce versions CI runs. The two route-walk tests (withheld fields, own-sales scope) are never skipped or narrowed.
- **Plugin and app land together per slice.** A store-side ticket may merge before its app ticket only because everything starts switched on; do not cut a release between the two halves of a slice.
- **Lane: `next`, in Free, Pro and the app** (Paul, 2026-11-23: *"All work on permissions and fiscal compliance should be done on the next branch"*). `next` was re-cut from `main` on 2026-11-23 in wcpos/woocommerce-pos, wcpos/woocommerce-pos-pro and wcpos/monorepo. Every build worktree branches from `origin/next` and every build PR has base `next`; nothing for this release targets `main`. Roadmap docs (this repo) stay on `main`. Pro on `next` pins Free to `dev-next`. 2.0.x fixes keep landing on `main`; bring them over with a main→next sync PR per repo before starting a slice, and again when a slice's PR conflicts.
- **Live evidence on this lane comes from dev-next**, the hosted store that serves `next` (Paul, 2026-11-23: asked "a local wp-env, or the hosted dev-next store?" after this line had been changed to wp-env on a front desk ruling, he chose the hosted dev-next store; his standing rule of 2026-10-21 is that test and soak evidence comes from the hosted stores, never a local WordPress). dev-next runs Pro with Free vendored; dev-free and dev-pro serve `main` and show none of this work. After a plugin merge to `next`, dev-next needs the Pro `deploy-dev.yml` run on `next`; after an app merge it needs the web bundle published to `@next` (the app repo's `CLAUDE.md` has both commands). A walk that cannot be done on dev-next is said so in the ticket comment and goes to Paul on the board as one question; it is never moved to a local WordPress on the worker's own judgement.
- **Order of proof.** Before merge a PR is proven by its tests and its review. A plugin change reaches dev-next only after it merges to `next` and is deployed, so its live walk happens then: deploy, walk the behaviour on dev-next, and record what was walked in the ticket comment before the ticket closes. A live walk that fails is a fix PR opened in the same session, and the ticket stays open until it passes. An app change whose store side is already on dev-next can be walked before merge from its PR preview.
- **PRs:** worktrees, never a main checkout; 600 added production lines, tests excluded; no stacked PRs; no new env vars; no `--no-verify`; one test suite at a time with `--maxWorkers=2`; review loop ends at round 5.
- **Live evidence comes from dev-next** (see the lane line above), never from a local WordPress.
- **UI:** the Access screen is built to the picked mockup and its `changes.md`; the till side follows the gone-or-read-only rule with no new decoration. #622, #627 and #635 carry shots in the PR; #635 waits for Paul.
- **Merging:** green, walked, reviewed two-way PRs merge under standing authority. "Walked" here means every review thread on the PR has been read and answered; it is not the live walk. Anything labelled one-way (it changes an authorization answer on a public route, which most store-side tickets here do) waits for Paul's word in chat or on the board.
- **Claims:** label `claimed:mini` plus assignee; check open PRs before opening anything.
- **Reporting:** one comment per ticket touched, with what was walked and the four headings (Blocked on you, Dangling with a pick per line, Changed, Found), then `Safe to exit`. Questions for Paul go on the Mac mini board (#561), one per night, with options and a recommendation. A defect not fixed goes under Dangling, never Found.

## Already on `main` or open from the charting session

- Pro: a single-store read now honours the store's Staff list (woocommerce-pos-pro#860, merged).
- Free: the phone-width checkbox tick and the Access heading article (woocommerce-pos#2757, #2759, merged).
- Free: the manager-approval routes share the login page's lockout (woocommerce-pos#2758, open, one-way). #634 depends on it.
- App: hand-over to a just-added account (PR open from the charting session's agent). #635 rebuilds this flow; do not duplicate the fix.

## The prompt

```text
You own the build of wcpos/roadmap#599, v2.2.0 "Control what each cashier can do", from here to its last ticket. Read first, every session: docs/specs/2026-11-22-cashier-permissions-v2.2.0-spec.md and docs/handoffs/2026-11-22-mac-mini-builds-permissions-v2.2.0.md in wcpos/roadmap, then the ticket you are taking and the resolution comments its spec section links. Every decision is made; never re-decide a closed ticket. If the spec is unclear, that is your one question for the night.

Order of work: #620 first and alone; then #621; then #623 and #624 (hidden cost and the reset); then #622, #625, #626, #627, #628, #629, #630 in that order; then #631, #632, #633; then #634 and #635, where #635 needs a lock-screen options board from /mockup posted as a question before it is built; #636, the docs, opens once #624 and #627 are on next; from then on, when a slice lands, write its pages under #636 before taking the next slice's ticket. Otherwise take the first open, unblocked, unclaimed ticket in that order, claim it with claimed:mini and the assignee, and check open PRs before opening anything.

Lane: all build work for this release is on the next branch in wcpos/woocommerce-pos, wcpos/woocommerce-pos-pro and wcpos/monorepo: branch every worktree from origin/next and open every PR with base next, never main; roadmap docs stay on main; sync main into next per repo before each slice; live evidence comes from dev-next.

Rules: the store enforces and the app shows, and no permission ships as a hidden button except the two the spec names; every new permission is granted on introduction, so nothing changes for a store until its owner switches something off; a restriction never sits behind a licence check; scope is the nouns in the rulings and spec §14 lists what is out; failing test first per permission on both order storage modes; the two route-walk tests are never skipped or narrowed; worktrees, 600 added production lines per PR, no stacked PRs, no new env vars, no --no-verify, one suite at a time with --maxWorkers=2, review loop ends at round 5; live evidence from the hosted dev stores only; the Access screen is built to docs/prototypes/2026-11-22-access-screen-permissions and its variants/v3/changes.md; green walked two-way PRs merge under standing authority, one-way PRs wait for Paul.

Each session ends with one comment per ticket touched: what was walked, then Blocked on you, Dangling with a pick per line, Changed, Found, then Safe to exit. Questions for Paul go on the Mac mini board #561, one per night, with options and a recommendation.
```
