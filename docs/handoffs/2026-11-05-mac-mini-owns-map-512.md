# The Mac mini owns the journeys map (#512): standing handoff

**Date:** 2026-11-05. **Map:** [2.0 journeys: docs, E2E and the cashier soak](https://github.com/wcpos/roadmap/issues/512). **Owner from here:** the Mac mini's Claude, with Paul reviewing proof pages live and approving the style guide once. **Why this file:** the map is decided; what is left is execution in a fixed order with fixed rules, and the Mac mini re-reads this every session instead of re-deriving it from eleven resolution comments.

The paste-able prompt is at the end. Everything above it is the reasoning a session needs when the prompt is not enough.

## Where the map stands

Every decision ticket is closed (#513, #515–#526). The open children are execution:

| Ticket | What | State |
| --- | --- | --- |
| [#514](https://github.com/wcpos/roadmap/issues/514) | Proof page 1, J2 Sell to a guest | Built; Paul's review and the stack review posted 2026-11-05; fixes due before merge |
| [#532](https://github.com/wcpos/roadmap/issues/532) | Showcase data set on demo | Applied to demo; Closures room, dev-free seed, nightly schedule, terminal extensions, receipt template and trading-hours shoots outstanding |
| [#539](https://github.com/wcpos/roadmap/issues/539) | Proof page 2, J1 Open the register | Not started; blocked by #532 and #514 |
| [#540](https://github.com/wcpos/roadmap/issues/540) | Proof page 3, J12 Find a product | Not started; blocked by #532 and #514 |
| [#534](https://github.com/wcpos/roadmap/issues/534) | Style guide, two page templates, the 2.x sidebar board | Blocked by the three proof pages; Paul approves once |

After #534 the map's destination is reached and the rest is `/to-spec` → `ready-for-agent` tickets → `/frontier`.

## The order of work

1. **Finish the J2 proof (#514).** Apply Paul's five directions and the stack review (both on #514): the page loses its chart, gains dense linked labels, names the default-customer setting, shows the Standard Receipt; the monorepo stack becomes one linear chain on one module version, hooks observe only, manifest writes are serialised, the captures run restores theme and language and closes its register session, the legacy-webview test proves its title, every Codex thread is answered in-thread. Merge bottom up, never with branch deletion, after Paul says the page passes.
2. **Close out #532.** Standard Receipt per showcase register; shoots in trading hours; the dev-free seed after the probe sweep; the nightly `apply` + `tidy` as a launchd job once #3246 is on `main`; terminal extensions as credentials arrive; the Closures room by selling the last few days per register through a live session.
3. **Proof pages 2 and 3 (#539, #540)**, in J2's shape, one at a time, each posted for Paul's live review before the next starts. Parallel with step 2 where the showcase set is not needed (the module and spec never need it; the shoot does).
4. **The style guide, templates and sidebar board (#534)** as one docs PR derived from the three pages; Paul looks once.
5. **`/to-spec` from the map's decisions**, in this order, each a `ready-for-agent` ticket: the two E2E fixes that land first (the timing harness, the Closures walk, per #516); the captures and docs-PR workflows (#521); the soak nightly script and rotation (#517, #519) with the results repo; then sweep-1 docs tickets in pairs per journey in shift order (#522), each citing its journey spec, capture manifest, ledger rows, the guide and a template; then the E2E journey PRs in shift order (#516) and the manager tier; then the closing Amend sweep.
6. **`/frontier` the tickets** one journey at a time. The Walked section and the conflict protocol (#526) bind every docs PR; the `pending:` marker gate binds the flip.
7. **Sweeps 2, 3 and 4** per #526 once sweep 1's exit holds.

## Rules that bind every session on this map

- **Rulings over screens.** The app is not automatically right (Paul, map Notes). Ruled and the app disagrees: monorepo issue with `docs-conflict`, page written to the ruling with a hidden `{/* pending: monorepo#N */}` marker. Unruled and odd: one question to Paul. Never a workaround as the path.
- **Every claim is checked.** A statement about default behaviour names the setting that controls it and links to its page. The Walked section lists the steps run, the build, and the settings read. A claim the writer did not see is not written.
- **North star:** the best app for the average cashier, easy and intuitive, complexity hidden not removed. Task page on top, deep leaves below; nothing deleted to simplify.
- **Captures** are marketing material: showcase data, English, Standard Receipt, trading hours, demo for Pro, dev-free for Free-only states, the gateway's store for gateway states; manifest names `store` and `variant`; pins render from the manifest.
- **Stores:** three E2E stores, never a fourth; soak and probes never on demo; one suite at a time; `--maxWorkers=2`.
- **Perf gates** are never widened (cart-add 300 ms, long task 2,000 ms). Timing reads are read-only. A lift is a quarantine and only Paul lifts.
- **PRs:** worktrees, never the main checkout; 600 added production lines, test code excluded; no stacked PRs (branch from `main`, accept overlap); draft PRs for partial work; `Test-Removal:` trailer on any removed block; no new env vars; no `--no-verify`.
- **Claims:** label `claimed:mini` plus assignee where the account allows; check open PRs before opening anything (this machine's earlier chain filed duplicates).
- **Merging:** proof pages and the style guide wait for Paul; green, walked, reviewed test and tooling PRs merge under standing authority; sweep-1 docs pages merge green after `/doc-logic-review` with a Walked section, since the 2.x tree is hidden until the flip and Paul reviews the tree at each sweep's exit (this line is the handoff author's reading of the rulings, not a ruling; Paul can amend it).
- **Reporting:** one comment per ticket touched, in the morning, with Walked, where the spine bent, and the four headings (Blocked on you, Dangling with a pick per line, Changed, Found), then `Safe to exit`. At most one question for Paul per night, with options and a recommendation. A defect not fixed goes under Dangling, never Found.

## The prompt

Paste this to the Mac mini. It is one paragraph per section with no hard wraps.

```text
You own wcpos/roadmap#512, the journeys map, from here to its end. Read first, every session: the map body (Destination, Notes, Decisions so far) and docs/handoffs/2026-11-05-mac-mini-owns-map-512.md in wcpos/roadmap, which holds the order of work and the rules. Never re-decide a closed ticket; if a ruling is unclear, that is your one question.

Order of work: (1) finish the J2 proof on #514 by applying Paul's five directions and the stack review posted there, then merge bottom up without branch deletion once Paul says the page passes; (2) close out #532 (Standard Receipt per showcase register, trading-hours shoots, dev-free seed after the probe sweep, nightly apply+tidy as launchd once #3246 is on main, terminal extensions as credentials arrive, the Closures room through live sessions); (3) proof pages #539 (J1) then #540 (J12) in J2's shape, each posted for Paul's live review before the next starts; (4) #534, the style guide, two templates and the sidebar board, as one docs PR for Paul's single approval; (5) /to-spec the map's decisions into ready-for-agent tickets in the order the handoff lists; (6) /frontier them one journey at a time; (7) sweeps 2 to 4 per #526.

Rules: the ruling is the arbiter, never the screen; every claim names its setting and the Walked section lists settings read; captures are marketing material from the showcase stores; three E2E stores and never soak on demo; perf gates never widened; worktrees, 600 production lines, no stacked PRs, no --no-verify, no new env vars; claim with claimed:mini and check open PRs first; proof pages and the style guide wait for Paul, green walked test PRs merge under standing authority; the north star is the best app for the average cashier, complexity hidden not removed.

Each morning: one comment per ticket touched with Walked, where the spine bent, and the four headings (Blocked on you, Dangling with a pick per line, Changed, Found), then Safe to exit. At most one question a night, with options and a recommendation.
```
