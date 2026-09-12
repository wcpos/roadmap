# Component gallery on `next` — handoff prompt (2026-09-12, runs in Phase D)

**Not the first session.** Written before Paul's 2026-09-12 direction that the overhaul starts
with the language, this prompt now belongs to Phase D of
`wcpos/roadmap docs/design/2026-09-12-ui-polish-program.md`: the gallery is built for the
component list Phase B produces, and grows as each component is rebuilt. Before running it,
replace "every one of the 59 primitives" below with the Phase B map's list, and add a scale
switch (compact / regular / spacious) beside the theme switch. Everything else stands.

Paste the block below into a fresh Claude Code session opened in `/Users/kilbot/Projects/monorepo-v2`.

```
Build the component gallery on `next`: a route in the web build that renders every primitive in
packages/components/src across its variants, states, themes and widths, with a Playwright script
that captures each cell and compares against committed baselines.

Read first, in this order:
1. wcpos/roadmap docs/design/2026-09-12-ui-polish-program.md — the program; the gallery is
   item 1 under "Missing". Its "Open decisions" 1 is answered here: baselines live in the
   monorepo at 1x, default light and dark only; other themes are captured but not committed.
2. .claude/rules/design.mdc — the rules every cell must be judged by.
3. apps/main/playwright.config.ts — the web build is already served for e2e
   (`pnpm run build:web && npx serve web-build -p 8081 -s`); the gallery script reuses that.
4. packages/core/src/screens/main/settings/theme.tsx — how themes are switched (Uniwind,
   five named themes plus system, light and dark).

What to build:
- A route in apps/main (Expo Router) at /gallery, outside the auth group, gated by a named
  constant `GALLERY_ENABLED = __DEV__` in code. No environment variable; if the gate ever needs
  to change, edit the constant.
- One `<name>.gallery.tsx` beside each component in packages/components/src exporting a list
  of cells: { variant, state, render }. The gallery discovers these files; adding a component
  means adding its cells file, nothing else.
- Gallery chrome: component list on the left, cells in a grid, a theme switch (the five themes,
  light and dark), a width switch (phone 390, tablet 1024, desktop 1280), a density switch
  (cashier, merchant, admin) that the components may ignore until the density contract lands.
  The chrome is not part of the design; keep it plain and out of the captures.
- `apps/main/e2e/gallery.shoot.ts` (or the name the e2e folder's README prefers): opens
  /gallery, iterates every component and cell for the default theme in light and dark at
  tablet width, captures `gallery-baselines/<component>--<variant>--<state>--<theme>.png`,
  compares with Playwright's toHaveScreenshot. A second mode captures all five themes and both
  phone and tablet widths into an ignored folder for review. Fails on any console error.
- A short README in packages/components explaining how to add cells and how to run the shoot.

Scope and budget:
- Every one of the 59 primitives gets a cells file. Start from the component's own props;
  where a component has no variants, one cell per state (default, disabled, loading, error,
  long text) is enough. Do not redesign anything while doing this; the gallery captures the
  library as it is today. Polishing is the program's later tickets.
- Added-line budget, non-test: 1,500 including the cells files. Say so if it will not fit
  and stop rather than truncate cells.
- Test workers capped: `--maxWorkers=2` on jest, one Playwright run at a time.

Process:
- Worktree branched from origin/next after `git pull origin next`.
- Delegate the cells files and the shoot script to Codex (`codex-implement`, `-m gpt-6-astra`,
  effort `high`, budget stated). Review the captures yourself against the rules; a cell that
  looks wrong today is a finding for the program, recorded in the PR body, not fixed here.
- PR to `next`, ready for review, with the tablet light and dark capture grid for Button,
  Input, Dialog and DataTable in the body so Paul can judge the gallery without running it.
- Mutation-check the shoot script once: change one component's padding, confirm the compare
  goes red, revert.

Fixed points: the gallery is dev-only and never in a production bundle's reachable routes; no
new env vars; no hex colours in cells (use the semantic tokens); no new dependency without
listing it in the PR body (Codex cannot install packages, so any dependency need comes back
to you first).
```
