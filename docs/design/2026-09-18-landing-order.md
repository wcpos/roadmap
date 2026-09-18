# The landing order on `next`, the definition of done, and the contract template

_Decided 2026-09-18 by Paul on [wcpos/roadmap#292](https://github.com/wcpos/roadmap/issues/292), part of the [UI overhaul for 1.11.0 map](https://github.com/wcpos/roadmap/issues/282). Inputs: the [library strategy](2026-09-18-library-strategy.md) (#340), the [scale and density](2026-09-18-scale-and-density.md) (#289), [platform split](2026-09-18-platform-split.md) (#290) and [feedback states](2026-09-18-feedback-states.md) (#308) pages, the [component map](component-map.md) (#291) and its removal ticket ([#351](https://github.com/wcpos/roadmap/issues/351)), the ledger refresh task ([#350](https://github.com/wcpos/roadmap/issues/350)), and the state of `next` on 2026-09-18. This page is the ordered list `/to-spec` writes contracts from and `/to-tickets` lands._

## In one paragraph

Nothing on `next` needs to wait. Every register ticket with app UI is already landed there on today's primitives, and the map classes the register bar, panel, checkout and tender as **in-place restyles**, so the token pass reskins them and the register's rebuilt pieces arrive only in its own switch PR: **nothing is built twice.** The order is: housekeeping, then three preconditions that can run side by side (the minimal gallery route, the plumbing PR, the ledger refresh), then the **token pass alone** as one revertible PR, then the **primitives pass** (the eight new folders, `v2/dialog`, the tier restyles), then the **screens, one atomic PR each**, starting with a small pilot (connect and auth) and then the register. Removals ride beside the order, each in its own PR after its ruling. A rebuild, restyle or switch is done when its ledger is accounted for line by line, its gallery cells are shot and reviewed, its captures cover both postures, both themes and the three steps, its lint allowlist shrank, and its budget row is recorded.

## 1. The order

| # | Lands | Contains | Waits on |
|---|---|---|---|
| 0 | **Housekeeping PR** | The six deletions ruled on #340 (`--tertiary`, `--duration-750`, `--error` after its 17 sites move to `--destructive`; the dead exports `data-table`, `tree-select`, `toggle`) and `--radius` revived. One-line note each. | nothing |
| 1a | **Minimal gallery route** | A web route rendering the control core (`input`, `button`, `select`, `combobox`), `text` and `icon` across the six scale cells (three steps × two floors) in both themes, shot by Playwright. Its full shape and the baseline home are the gallery ticket's (§7). | 0 |
| 1b | **Plumbing PR** | No visual change: `lib/motion.ts` with `BEATS` and the web token generator; `lib/device` with `usePointer` beside `useIsPhone`; the lint ratchet (banned Uniwind prefixes, bare `Suspense` in `screens/**` index files, arbitrary pixel lengths) with its shrink-only allowlist seeded from today's sites; the web reduce-motion block. | 0 |
| 1c | **Ledger refresh** ([#350](https://github.com/wcpos/roadmap/issues/350)) | Every `LEDGER.md` refreshed against `next` since 2026-09-12; `settings/**` and `auth/**` seeded; candidate strikes posted on #351. | nothing; runs beside 1a and 1b |
| 2 | **Token pass**, one PR | The token sheet in `global.css` (the seven scale tokens as plain numbers, the recalibrated themes, the new names with every old name aliased, the web 87.5 % root retired); `ScopedVariables` at the app root carrying the step with the pointer floor and the OS text-size cap in root JavaScript, Auto by width with the override stored beside `theme`; the four `cva` defaults of the control core moved to the floored tokens; `text` and `icon` restyled. Revertible as a set. | 1a, 1b |
| 3 | **Primitives pass**, several PRs | The eight new folders (`skeleton`, `empty-state`, `notice`, `chip`, `segmented-control`, `keypad`, `breadcrumb`, `page-bar`); `v2/dialog` absorbing `modal` with the overlay system that takes the twelve overlay-plumbing `Platform.OS` branches; the tier restyles (controls, atoms, overlays), one PR per tier; each PR adds its gallery cells. | 2; the first rebuild contract also waits on 1c |
| 4 | **Removal rulings** ([#351](https://github.com/wcpos/roadmap/issues/351)) | R1–R9 plus the refresh's candidates, each ruled, each landing in its own PR named by the switch that needs it. | 1c |
| 5 | **Screens**, one atomic PR each, in §3's order | Each names its rebuilt composed pieces from the map's §6 and the removal PRs it depends on from §7; its states from #308; its captures per §4. | 3; its removal PRs from 4 |
| 6 | **Promotions** | When the last old caller of a `v2/` folder has moved: the `git mv` pair, and the deprecated folder deleted only through its removal ticket (R8, R9). | 5 |

The pass at 2 is the one place the whole app changes at once, which is why it lands alone, after the gallery can see it, and reverts as a set. Everything after it changes one component or one screen per PR.

## 2. The register work already on `next`

Checked on 2026-09-18: the register bar (#268), the session in the cart column (#269), counting (#270), the Closures room (#271) and the sessions and movements collections (#274) are **closed and merged on `next`**. What is still open on the cashiers map is plugin work (#272 capabilities and settings, #273 registers as server records) and the reports registry (#333), none of which draws app UI. So "the register work landing on today's primitives" is done landing, and the question becomes how it is reskinned:

- `pos/cart/register-bar.tsx`, `register-panel.tsx`, the gate cards and sheets, `pos/checkout/**`, `tender`, `receipt-stage`, `reports/closures`: **restyle in place** (map §6). The token pass and the control core do most of it; their in-place PRs finish it in the register's switch.
- The cart line and cells, the order strip and open-orders list, the cart foot and order sheet, the products browser, the overlay side rule: **rebuild beside** (`v2/`), landing only in the register's switch PR (§3, item 2).

Register follow-ups still to come (#255 the phone checkout sheet, #276 provenance on the receipt, #329 refund sessions) land on whatever the register is at the time; after the register's switch they land on the new pieces. None is held for the overhaul.

## 3. The screen order (Q1, Paul: "do as you recommend")

1. **Pilot: connect and auth** (`auth/**`, the Connect pages). No ledger until 1c seeds fifteen lines; four small pages composed of `page-bar`, `notice`, `skeleton` and the control core. The pilot exists to prove the definition of done, the gallery diff, the capture set and the ledger accounting where a mistake costs an afternoon.
2. **The register** (`pos/**`: the products browser, the cart, the register bar and panel, checkout and tender, the overlay side rule). The cashier's screen, the deepest ledgers (cart 64, tender 33, products 19+), and nearly every new primitive. Needs R1, R2, R6, R7 landed or ruled kept.
3. **Orders** (`orders`, `components/order`, `components/data-table` on a fine pointer). Shares the rebuilt data table with the products browser, so the register's switch has already exercised it.
4. **Reports** (page bar, rail, panels, the inline SVG chart, the Closures room restyle; per the Reports build brief §5).
5. **Settings** (`settings/**`, `components/navigation-area`, `ui-settings`, the token sheet screen). Needs R5 (the header) to have landed, since the page bar replaces it.
6. **The tail**: customers, the product editor (`components/product`, R7), logs and health (skeleton adoption), `drawer-content` (the rail) if it has not moved with the register.

The rail (`components/drawer-content`) and the header's rehoming are shared shell: they switch with the register (item 2), and every later screen inherits them.

Rejected: register first with no pilot (the process is tested on the most expensive screen), and leaves first with the register last (cashiers see a mixed app for longest, and register follow-ups keep landing on old pieces).

## 4. The definition of done

One list, three shapes. A **component PR** (rebuild in `v2/` or restyle in place) must meet A–F; a **screen switch PR** meets A–H; a **removal PR** meets A and I.

- **A. Ledger accounted for.** Every line of every touched `LEDGER.md` appears in the PR body as `preserved` (a pointer to the new code), `struck` (a link to its ruling on #351) or `n/a` (a reason). A struck line without a ruling blocks the PR. A load-bearing line with no test gets the test **before** the restyle, in the same PR or a preceding one.
- **B. Contract filled.** The contract of §5 is complete, and the one-way test passed: no second route to any outcome the component owns, or the second route is named and filed on #351.
- **C. Gallery cells shot and reviewed.** Six scale cells (Compact / Regular / Spacious × coarse / fine floor), two per idiom-split key (fine/coarse or phone/wide), one per applicable #308 state, in both themes; the Playwright diff against the baseline is reviewed and the new baseline committed where the gallery ticket puts it.
- **D. Uniwind contract kept.** No banned construct; the lint allowlist shrank by the component's sites and did not grow.
- **E. Motion within contract.** Every beat named in `motion.ts`, none over 400 ms on a waiting path, none non-interruptible; a `web:animate-*` class names a real token.
- **F. Budget rows kept.** The component's relevant budget rows from §8 (pressed state and transitions for every component; tap-to-line, the search rows and scroll where §8 assigns them) are written in the PR body with their measured value. The PR-tier rows gate on the PR; the trunk-tier rows gate on the Deploy dispatch the reviewer checks. *(Decided 2026-09-18; until then the row only recorded.)*
- **G. Screen captures.** The switched screen at tablet and phone, light and dark, all three steps, in every state the screen has under #308: twelve captures per state, attached to the PR as its artifact and, once the gallery ticket decides the home, committed there.
- **H. E2E contract untouched.** Every `testID` the specs select survives (the `data-table-count` / `data-table-loaded-count` contract named on the map), and the native and web suites that cover the screen are green on the PR; the switch is one PR, no runtime flag, no half-switched screen.
- **I. One removal, one ruling.** The PR deletes exactly what its R line rules, names #351 and the ruling comment, and nothing else changes.

Every PR also carries the standing gates: Codex review on every fix push, review threads resolved, typecheck.

## 5. The contract template

The fields a rebuild, restyle or new-component contract carries, for `/to-spec`. **Mandatory** fields are always filled; the rest say "none" explicitly when they do not apply, never omitted.

| Field | Status | Fixed by |
|---|---|---|
| Job (what the component is for, in a sentence) | mandatory | survey |
| Map line (the component map row, verdict and what changes) | mandatory | #291 |
| Ledger (every line, preserved / struck / n/a) | mandatory | #340 §3 |
| Platform split (none, or the key: engine, pointer, width) | mandatory | #290 |
| Variants and sizes (the token family: ctl, row, tile, type) | mandatory | #289 |
| States (the eight of #308 that apply, each drawn) | mandatory | #308 |
| Focus (where focus lands on open, where it returns, Esc and Enter) | mandatory | #291 §8 defaults |
| One-way test (a second route named, or none) | mandatory | #291 §7a |
| Tokens (which tokens it reads; never a raw value) | mandatory | #340 §4 |
| Motion and beat (named in `motion.ts`, or none) | mandatory | #343, #340 §5 |
| Touch (the floor, `hitSlop`, swipe or hold) | mandatory | #289 §2 |
| Copy (every string it renders, sentence case) | mandatory | #287 |
| testIDs (the stable ids, existing ones kept) | mandatory | E2E policy |
| Gallery cells (the cell list from DoD C) | mandatory | this page |
| Density (the size prop's values, if it takes one) | optional | #289 |
| Budget rows (which §8 rows apply, with their values) | mandatory | §8 |

## 6. The review gate (decided on this ticket)

Paul signs off **live** (the PR's web preview or dev-next) on the **pilot** and the **register** switch before they merge. Every later screen switch and every component PR merges on green under the standing merge authority, with its captures attached, and Paul reviews on dev-next; a rejection there is a follow-up PR, not a revert. The token pass merges on green once its gallery diff is reviewed, because the gallery is the instrument the strategy page made its precondition.

## 7. What this page fixes for later tickets

- **The gallery ticket (graduated from the map's fog):** the minimal route (1a) is fixed here; the ticket decides the full shape (cells, the route's URL and how it selects step, floor, theme and state), the baseline home (monorepo at 1× versus a sibling repo), and the diff tolerance. **Decided 2026-09-18: [the gallery page](2026-09-18-gallery.md)** (a route in `apps/main` in a gallery build, shot by its own Playwright project as a Test job; page per component, cells in one tree, theme by query; baselines in the monorepo, Linux only, CI-written, zero pixels; captures as PR artifacts only).
- **The performance budgets ticket (graduated):** the rows are pressed state, tile tap to cart line, transitions, scroll at 1,000 products, search per keystroke; the ticket measures today's `next` from `apps/main/e2e/cart-add-timing.ts` and sets the values and the CI script. DoD F records until it lands, gates after. **Decided 2026-09-18: §8 below** (two columns per row, a device verdict on a release build and a CI ceiling fixed at the instrument; six rows, transitions static and search split; existing gates unchanged at 300 / 3,000 / 3,000 ms, two rows record-only until their instruments land; three tiers: PR, the `lane=next` dispatch, E2E Native).
- **`/to-spec`:** one contract per line of the component map's §9, in the order of §1 and §3 here, each with §5's fields and closed by §4.
- **The contract template** is §5; the fog line on the map is cleared by this page.

## 8. The performance budgets (decided 2026-09-18 on [the budgets ticket](https://github.com/wcpos/roadmap/issues/353))

**A budget row has two columns.** The **device verdict** is the budget: a felt pass/fail on
Paul's iPad on a **release build** of `next`, never the dev client, whose magnitudes are inflated
by on-device compilation. The **CI ceiling** is an alarm on the runner: set from the measured band
with headroom, and when it trips it is fixed at the **instrument** (window, fixture, where the
clock starts), never at the number. Either column may be empty. This is the 2026-09-10 ruling that
the felt-latency budget is checked by Paul himself, plus a mechanical tripwire between his checks.

**Six rows.** The survey's five, with transitions made static (a transition's length is a constant
in code, so the instrument is lint on the motion tokens, not a stopwatch) and search split into the
two different things the 2026-09-16 measurement showed: typing, which costs 0.2–1.3 ms per key,
and the results commit that follows it.

| Row | Device verdict (release build) | CI ceiling | Instrument | Where it runs | A miss lands as |
|---|---|---|---|---|---|
| **Pressed state** | visible before the finger lifts | 100 ms from tap to the painted pressed style | new: a Playwright probe on the gallery build's button cell, click → first frame carrying the pressed style | every PR, the gallery job in the Test workflow | failed check |
| **Transitions** | none | durations only from the motion tokens; 400 ms cap on a waiting path | lint: every `withTiming` duration and `web:duration-*` / `web:animate-*` class resolves to a token | every PR, the Test workflow | failed check |
| **Tile tap to cart line** | the line is there when the eye reaches the cart | web **300 ms** add intent → quantity in the DOM (as today, `apps/main/e2e/pos-cart.spec.ts`); native **3,000 ms** handler entry → cart-table commit (as today, Maestro flow 04) | existing, unchanged; neither includes paint and they are not one metric | web: the Deploy dispatch with `lane=next` every screen PR already needs before merge, and every push to `main`; native: E2E Native on `main` pushes, native-touching PRs and dispatch | failed check / failed flow |
| **Scroll at 1,000 products** | no hitch through the grid and the cart | record only until the instrument lands; then the worst of its first ten trunk runs plus the observed day-to-day runner drift, written here when set | new: a 1,000-product fixture and a scripted scroll over grid and cart counting long tasks over 50 ms and rendered rows (frame counts on a shared runner flake and are not gated) | the same Deploy dispatch and `main` pushes | annotation plus a line in the PR comment while record-only; failed check once the ceiling is written |
| **Typing never blocks** | typing never stutters | no long task over 50 ms while typing | existing `search-responsiveness` probe's long-task assertion, promoted from local-only to the Deploy run; its frame smoothness stays reported, never gated | the same Deploy dispatch and `main` pushes | failed check |
| **Keystroke to first row** | the first row lands within a beat | **3,000 ms** as today (`search-latency.spec.ts`, target 1,500 annotated) | existing; the instrument must start its clock after boot pulls have drained, since the gate sits at zero headroom on trunk (1.8 s local, 2.4–3.0 s on CI) | the same Deploy dispatch and `main` pushes | failed check |

**Measured on `next`, 2026-09-18.** The morning dispatch (run 35327301946) read **first row 8,489 ms**
on the free store and stopped the other shards. That is read as a defect on `next` to be found, not
a reason to move the ceiling. A second dispatch (run 35361489738; an earlier one, 35360735268, was cancelled by mistake seven
minutes in) was started for this page; its numbers are appended below when it lands. The web tap-to-line number is not recoverable from past
reports (the merged report drops the attachment); the gate has passed at 300 ms on every trunk run
since it landed.

**What this fixes for DoD F.** A component PR records the rows that apply to it (pressed state
and transitions for every component; tap-to-line for the tile, the cart and the tender; the search
rows for the search field and the products surfaces; scroll for the grid, the table and the cart).
The PR-tier rows gate now; the trunk-tier rows gate on the dispatch the review gate already checks,
and the reviewer follows the run link. The device verdict is taken at the pilot, the register
switch, the token pass and each release, and is written as one line per row on that PR or the
release record. Rejected: making CI numbers the budget (simulators and the dev client lie), a
device-only budget (regressions land silently between checks), the survey's unmeasured 150 ms and
100 ms values (the first PR after would be red for a reason nobody can read), a push-to-`next`
Deploy trigger (a CI change that collides with dispatches on the lane's one store), and a store on
every PR's Test job.
