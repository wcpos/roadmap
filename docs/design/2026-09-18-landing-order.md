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
- **F. Budget row recorded.** The component's relevant budget rows (pressed state, transition, the tap-to-line where it applies) measured and written in the PR body. Until the budgets ticket (§7) sets values and the CI script, the row records; after it, the row gates.
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
| Budget rows (which budget rows apply) | optional until the budgets ticket, then mandatory | §7 |

## 6. The review gate (decided on this ticket)

Paul signs off **live** (the PR's web preview or dev-next) on the **pilot** and the **register** switch before they merge. Every later screen switch and every component PR merges on green under the standing merge authority, with its captures attached, and Paul reviews on dev-next; a rejection there is a follow-up PR, not a revert. The token pass merges on green once its gallery diff is reviewed, because the gallery is the instrument the strategy page made its precondition.

## 7. What this page fixes for later tickets

- **The gallery ticket (graduated from the map's fog):** the minimal route (1a) is fixed here; the ticket decides the full shape (cells, the route's URL and how it selects step, floor, theme and state), the baseline home (monorepo at 1× versus a sibling repo), and the diff tolerance.
- **The performance budgets ticket (graduated):** the rows are pressed state, tile tap to cart line, transitions, scroll at 1,000 products, search per keystroke; the ticket measures today's `next` from `apps/main/e2e/cart-add-timing.ts` and sets the values and the CI script. DoD F records until it lands, gates after.
- **`/to-spec`:** one contract per line of the component map's §9, in the order of §1 and §3 here, each with §5's fields and closed by §4.
- **The contract template** is §5; the fog line on the map is cleared by this page.
