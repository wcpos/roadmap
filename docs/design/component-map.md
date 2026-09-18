# The component map

_Decided 2026-09-18 by Paul on [wcpos/roadmap#291](https://github.com/wcpos/roadmap/issues/291), part of the [UI overhaul for 1.11.0 map](https://github.com/wcpos/roadmap/issues/282). Inputs: the [library-evolution census](https://github.com/wcpos/monorepo/blob/research/library-evolution/.claude/research/2026-09-18-library-evolution.md) (58 folders, 1,988 imports), the [mockup concordance](https://github.com/wcpos/monorepo/blob/research/mockup-concordance/.claude/research/2026-09-18-mockup-concordance.md) (64 drawn elements, 31 questions) and its [script addendum](https://github.com/wcpos/monorepo/blob/research/prototype-script/.claude/research/2026-09-18-prototype-script.md) (16 focus questions, six contradictions), the numbered `LEDGER.md` files on `next` (49 library folders, 48 composed pieces, seeded by monorepo#2160), the four source inventories for the settings, connect, receipt and products screens, and the sibling pages: [library strategy](2026-09-18-library-strategy.md) (#340), [scale and density](2026-09-18-scale-and-density.md) (#289), [platform split](2026-09-18-platform-split.md) (#290), [feedback states](2026-09-18-feedback-states.md) (#308), [filters and breadcrumbs](2026-09-17-filters-and-breadcrumbs.md), and the register, orders, settings, connect, receipt and products sign-offs (#287, #288). This page is the contracts list and the ticket list for `/to-spec`; it is a living index and is edited, not superseded, as removal tickets close._

## In one paragraph

Of the 58 library folders, **35 are restyled in place**, **12 are kept untouched**, **3 are deleted** (already ruled) and **2 more are deleted through removal tickets** (`modal` merges into `dialog`, `toggle-group` gives way to the segmented control), **1 is rebuilt** in a `v2/` folder (`dialog`, absorbing `modal`), and **8 new folders** are added (`skeleton`, `empty-state`, `notice`, `chip`, `segmented-control`, `keypad`, `breadcrumb`, `page-bar`). None is split into two: every split is one component with a second rendering keyed by the pointer or the phone width, as the platform page rules. **One way to do each thing** (Paul, 2026-09-18, this ticket): where the drawings or the code offered two routes to one outcome, the map keeps one and lists the other as a removal (§7a). Of the composed pieces under `packages/core`, eleven are rebuilt beside their old folder and the rest are restyled in place. **No ledger line is struck by this page.** Every candidate strike is listed in §7 as a removal ticket for Paul, and until that ticket closes the line stands. The map's own rulings, on the 31 concordance questions, the 16 focus questions and the six contradictions, are in §8; all but three were already answered by the sibling pages or the sign-offs, and those three are Paul's from this session.

## 1. How to read a row

**Verdicts.** *Keep*: no change, not even skin; the token pass may still recolour it through aliases. *Restyle*: skin only, in place, every ledger line listed as preserved in the PR. *Rebuild*: behaviour changes, so a `v2/<name>` beside the old one until promotion. *Delete*: through a ruled removal ticket. *New*: a folder that exists in no form today.

**Columns.** *Split* is the key from the platform page: `engine` (a `.web`/`.native` file, all nine existing, none added), `pointer` (fine / coarse rendering inside one component), `width` (under 640 the anchored thing becomes a sheet or the side panel a page), or `none`. *Size* names the height token family from the scale page: `ctl` (40 / 44 / 52), `row` (36 / 44 / 52), `tile` (56 / 64 / 80), or `type` for text-only pieces; a component never carries a density prop. *States* lists the feedback states from #308 the component owns. *Ledger* is the count of numbered lines on `next` and whether any is a strike candidate (→ §7).

## 2. Atoms

| Component | Verdict | Split | Size | States | Ledger | Note |
|---|---|---|---|---|---|---|
| `text` | restyle | none | type | — | 2 | Type steps to the scale tokens; `TextClassContext` untouched (the audit's do-not-touch list). 342 imports: the token pass carries it, no call site moves. |
| `icon` | restyle | none | type | — | 3 | The glyph set becomes Tabler at 1.5 px under the same API (decided 2026-09-16, [icon set research](2026-09-16-icon-set-research.md)); the 137 generated components regenerate. |
| `hstack`, `vstack` | keep | none | — | — | 0, 0 | Gap values ride the spacing tokens. |
| `label` | restyle | none | type | — | 1 | Sentence case, quiet weight. |
| `badge` | restyle | none | type | — | 1 | The count mark: the phone tab bar's cart count, the quick filter's part count (`Morning menu ②`), the rail's `Free` pill. |
| `avatar` | restyle | none | ctl | Loading | 3 | Moves to the rail top and the cashier panel; initials fallback preserved. |
| `image` | keep | engine | — | — | 2 | |
| `logo` | keep | none | — | — | 0 | Connect hero only; the rail loses it for the avatar. |
| `loader` | restyle | none | — | Loading | 4 | Job narrows to controls and appends (#308); every other site moves to `skeleton`. |
| `progress` | restyle | none | — | Refreshing | 4 | Gains the indeterminate 2 px line (#308). Adds a variant, removes nothing. |
| `sort-icon` | restyle | none | — | — | 0 | |
| `docs-link` | restyle | none | type | — | 1 | The `Learn more · CODE` link of #308's refused tier. |
| `format`, `format/address` | keep | none | — | — | 3 | |
| `print`, `print/row` | keep | none | — | — | 1 | |
| `pressable` | keep | none | — | — | 0 | |
| `card` | restyle | none | — | — | 2 | Loses the orders and products frames (decision 20a, 22); stays for connect's radio cards, the theme tiles and closures. Lines 1–2 (shadow, header rounding) are preserved on the component; the callers leave. |
| `suspense` | keep | none | — | Loading | 2 | The lint on bare `Suspense` in `screens/**` index files is on the screens, not here. |
| `error-boundary` | keep | none | — | Failed (render) | 2 | For render exceptions only (#308); the hardcoded English fallback is a copy ticket, not a component change. |

## 3. Controls

| Component | Verdict | Split | Size | States | Ledger | Note |
|---|---|---|---|---|---|---|
| `button` | restyle | none | ctl, tile for `.xl` | Loading (spinner) | 13 | Heights to the floored `ctl` token in the control core pass; `.q` is `ghost-quiet` for text-only actions and `ghost` for icon buttons (Q1). The `compact` size retires (#289) → removal R4; line 5's compact **type** decision survives on `sm`. The 40-variant catalogue is audited in the token pass; any pruning is its own removal ticket. `ButtonPill` moves to `chip` (below). |
| `icon-button` | restyle | none | ctl | Loading | 4 | Gains an `on` tint state in place. |
| `input` | restyle | none | ctl | Refused (destructive line) | 6 | The control core: height, radius, `border-color + 1 px ring` focus. |
| `textarea` | restyle | none | — | — | 4 | |
| `checkbox` | restyle | none | ctl | — | 2 | Indeterminate state in cart settings. |
| `radio-group` | restyle | none | ctl | — | 4 | Connect's inline radio cards compose it. |
| `switch` | restyle | none | ctl | — | 4 | 34 × 20 geometry from tokens. |
| `slider` | restyle | none | ctl | — | 0 | |
| `toggle` | **delete** | — | — | — | 2 | Ruled on #340; the housekeeping PR, item zero of the landing order. Lines 1–2 are struck by that ruling. |
| `toggle-group` | **delete** (R9) | — | — | — | 1 | One value picker, not two: its six callers move to `segmented-control` in their screens' switch PRs and the folder is deleted at the end (Q3, §7a). |
| `select` | restyle | width | ctl | Empty (list) | 17 | The control core plus the sheet rendering under 640 that `lib/phone-sheet` already gives it; lines 1–3 (touch opening, pointer capture) are the iPad fix and are preserved under the chip trigger. |
| `combobox` | restyle | width | ctl | Empty, No results, Loading | 17 | The customer picker; sheet on the phone as today. |
| `tree-combobox` | restyle | width | ctl | Empty, No results | 14 | Category picker; `INDENT_PX` moves in from `tree-select` before that folder is deleted. |
| `tree` | restyle | none | row | — | 2 | |
| `tree-select` | **delete** | — | — | — | 0 | Ruled on #340. |
| `numpad` | restyle | none | tile | — | 6 | Becomes `Keypad` + its `Display`; lines 1–6 (delayed autofocus, selection on mount only) stay here on the display half (Q4). |
| `calendar` | restyle | none | row | — | 4 | The day-header font branch becomes a token (#290). The reports date button and quick ranges are composed, not here. |
| `form` | restyle | none | — | Refused (`FormMessage`, unchanged) | 12 | Field spacing only. |
| `keyboard-controller` | keep | engine | — | — | 1 | |

## 4. Containers and overlays

| Component | Verdict | Split | Size | States | Ledger | Note |
|---|---|---|---|---|---|---|
| `dialog` | **rebuild** (`v2/dialog`, absorbing `modal`) | width | — | — | 10 + 12 | One overlay component, not two (§7a): `v2/dialog` carries both ledgers (`dialog` 1–10, `modal` 1–12 as preserved lines, `n/a` where the two overlapped). Every drawn side panel is `side="left|right"` as today; the side is chosen by the subject rule in `pos/contexts/overlay-side` (§6), not here. Under 640 a side panel is a page (#290); sheets stay for pickers. Lines 4–8 (side presentation, autofocus after the slide, footer outside the scroll) and `modal` 4, 11, 12 (named portal hosts) preserved. |
| `modal` | **merge into `dialog`**, delete at promotion (R8) | — | — | — | 12 | Its 37 call sites move to `v2/dialog` in their screens' switch PRs; the folder is deleted through R8 once the last one has. |
| `alert-dialog` | restyle | width | — | — | 5 | Centred on every width except the phone, where it is a confirm sheet (#288 S4). |
| `popover` | restyle | width | — | — | 4 | Gains the sheet rendering under 640 (P1: the variation picker; the quantity keypad; filter menus). |
| `hover-card` | keep | pointer | — | — | 1 | Hover card on a fine pointer, popover on a coarse one, as the platform page tables it; one caller. |
| `dropdown-menu` | restyle | width | row | — | 3 | Row `⋯` menus; a bottom sheet under 640 with rows (check, label, hint, lock). |
| `tooltip` | keep | pointer, engine | — | — | 6 | Never the only carrier of a label. |
| `portal` | keep | none | — | — | 0 | Named hosts stay (the POS host so panels do not cover the nav drawer). |
| `collapsible` | keep | engine | — | — | 1 | |
| `accordion` | keep | none | — | — | 5 | |
| `tabs` | restyle | none | ctl | — | 9 | Stays for the checkout column, the edit dialogs and settings. The cart's order strip leaves it (§6), so lines 1–6 (centring) are **preserved for the remaining callers**, not struck; #337's "top risk 2" dissolves. Line 9's `asSelect` stays. |
| `panels` | restyle | none | — | — | 4 | Grip paint only: faint on touch, on hover with a mouse, primary while dragging. The 25 % minimum and the 8 px hit target stay; the drawing's handler-less divider means "as the app does it" (contradiction 6). |
| `table` | restyle | none | row | — | 7 | Frameless, hairline rows, hover row on a fine pointer. `table-row-alt` (zebra) retires by alias in the token pass (its two `useCSSVariable` reads are the trap the strategy names). `pulse-row` stays. Lines 6–7 (the remove latch) preserved through `pulseRemove` (§6). |
| `data-table` | **delete** | — | — | — | 0 | Never imported; ruled on #340. The real data table is the composed piece in `core` (§6). |
| `virtualized-list` | keep | engine | — | — | 19 | Lines 7–8 and 13 (hidden containers, resize recheck, edge tolerance) are exactly the breadcrumb pane case and are relied on, not touched. |
| `dnd` | keep | engine | — | — | 12 | Settings list drag handles. |
| `list-item` | restyle | none | row | — | 2 | |
| `toast` | keep | engine | — | Status (background failure) | 6 | Unchanged (#308); the drawing's cart-column anchor is a host placement in the cart, not a toast change. |
| `status-badge` | restyle (shape) | none | type | Status | 1 | Dot + word by default, under all 16 call sites, no sibling (#287). The tinted filled pill is on the direction's rejected list, so it does not survive as a variant → removal R3. Line 1 (own colours when nested) preserved. |
| `webview` | keep | engine | — | Loading (skeleton scrim, #308) | 11 | |

## 5. New components

Adding a folder removes nothing, so none of these needed a ruling; the map records the choice so the contract has a home.

| Folder | Job | Split | Size | States | Absorbs |
|---|---|---|---|---|---|
| `skeleton` | still block / line / row / tile from tokens; the first paint of every surface | none | row, tile | Loading | `data-table/skeleton.tsx` restyles to rows on it; the logs, health and webview loaders |
| `empty-state` | the one state block, kind empty · no-results · failed, size surface · inline, one inset | none | — | Empty, No results, Failed | the data table's `p-2` branch, the grid's `p-4`, six not-found routes, the cart's first empty copy |
| `notice` | the band: tone warn · info · bad, up to two actions | none | — | Status, Outage | `pos/products/storage-outage-banner.tsx` (with its test IDs), `pos/cart/totals-changed-banner.tsx`, the receipt's captured warning, the gate card's reason line |
| `chip` | the register's pill (#287, cut 3): two-state fills when on; a set select splits into value (reopens) and × (clears); a dimmed state with its reason in a tooltip; an optional count badge. The trigger skin for `select` and `combobox` in a filter bar | none | ctl | — | `ButtonPill` and `button` lines 9–12 move here as preserved lines; the Orders and Reports filter chips (one lift, Reports brief §9); `quick-filter-button` |
| `segmented-control` | a value picker with two to four segments (Payments \| Legacy, Sales \| Closures, chart mode, settings rows) | none | ctl | — | nothing; `toggle-group` keeps its callers |
| `keypad` | the 3 × 4 grid with a height policy that gives way first; cells at the `tile` token | none | tile | — | the tender's inline grid (`tender-pane.tsx:562-582`), the cart quantity keypad, the split Amount / Percent keypads; `numpad` composes it |
| `breadcrumb` | `Products › Tote bag`; the place, never the conditions ([filters and breadcrumbs](2026-09-17-filters-and-breadcrumbs.md)); the phone page's back crumb | none | ctl | — | the settings back bar's affordance (`navigation-area` line 2 preserved on the shell) |
| `page-bar` | the non-register pages' bar: title left, controls right, the status chip's home (#308) | width | ctl | Status | the parts of `components/header` that survive its retirement (§7 R5); it is a library piece because orders, reports and settings share it |

Not library, composed beside their screen until a second caller exists: the **Paid stamp** (beside `receipt-stage`, Q12), the **open-orders list** (`pos/cart`, a takeover at every width), the **pane slide** (`pos/products`, the drill-in motion), the **reports donut, share bar, proportional bar, KPI and till strip** (`reports`, per the build brief §5), the **date button and quick ranges** (`components/order` and `reports` share it, so it lands in `core/components`).

## 6. Composed pieces

The library holds primitives; these stay under `packages/core/src/screens/**` (#340). *Rebuild* means a `v2/` sibling of the file or folder; the screen switches to it atomically.

| Piece | Verdict | Split | Ledger | What changes |
|---|---|---|---|---|
| `pos/cart` — the line (`table.tsx`), the order strip (`tabs.tsx`, `tab-chip.tsx`), the foot (`index.tsx`), the header row (`cart-header.tsx`), the open-orders list (new) | rebuild | pointer (swipe strip vs hover actions), width (the list is a takeover everywhere) | 64 | The strip leaves `tabs` for a plain scroller with the count button pinned left and `+` pinned right, the seven-label priority kept; the foot is `⋯ \| Checkout` at every width, Void inside the order sheet with its Undo toast and late-outcome watch intact; the header row is one height by construction; the `Total` row goes (decision 50, no ledger line). |
| `pos/cart/register-bar.tsx`, `register-panel.tsx`, gate cards, `closure-sheet`, `movement-sheet`, `user-sheet` | restyle | width | (in 64) | The bell arrives beside the drawer glyph, the avatar leaves for the rail (phone keeps both); the gate cards gain the reason line on the dimmed stage (`notice`). |
| `pos/cart/buttons`, `buttons/edit-order-meta` | rebuild | width | 9, 5 | The order sheet: a left side panel with Void (red outline) · Print bill · Save at its foot. Print bill is drawn, wired to nothing, and stays that way here (Q23). |
| `pos/cart/cells` | rebuild | pointer | 13 | The `×` goes; removal is **one route**: the swipe strip's Remove on touch, the hover action's Remove with a mouse, both the same control calling `pulseRemove`, which keeps sole ownership of the re-entrancy latch (lines 1–3 preserved; Q17, §7a). The keypad's `−` stops at 1 and dims; it never removes. Name and price edit in place (`editable-field`). Quantity is edited in **one place**, the `keypad` popover on the quantity (decision 36); the Edit dialog loses its quantity field (R6). Lines 4–5 preserved on the keypad's display. |
| `pos/cart/cells/edit-*`, `pos/cart/totals` | restyle | — | 4, 4, 2, 3 | Edit line item is the line's details only (name, price, tax class, meta); quantity leaves it (R6). The note row stays (decision 44). |
| `pos/checkout`, `checkout/column`, `checkout/components`, `receipt-stage` | restyle | — | 14, 4, 13, 7 | The Paid stage gains the stamp beside it; auto-print holds *Next sale* until dispatch (#288 R1). |
| `pos/checkout/tender` | restyle | width | 33 | Neutral surface, amount at the `amt` token, a fixed three-column methods grid at the `tile` token (five in a row on tablet and desktop), the keypad swapped for the shared `keypad` with lines 1–4 preserved, the split ring as inline SVG (Q24), the payments block as the `bar` drawing with a time per payment and tendered/change from the row (line 29; the row type carries `created_at_gmt`, `tendered`, `change`, so no data ticket). |
| `pos/checkout/hooks`, `payments/**`, `provenance`, `pos/contexts/*` | keep | — | — | No UI. `payments/server` line 12 → removal R1. |
| `pos/contexts/overlay-side` | rebuild | width | 2 | The side is derived from the panel's **subject** (cart things over the products, product things over the cart, the bell and the cashier from the right; decision 46, confirmed by the script), the products column position breaking ties only. Under 640 a panel is a page, not a bottom sheet (#290). Line 1's phone clause → removal R2. |
| `pos/columns` | restyle | — | 5 | The divider grip. |
| `pos/products` (index, `cells`, `grid`, `filter-bar`) | rebuild | pointer (table vs rows come from the data table), width | 19, 5, 11, 12 | The row is the button and the `+` in the last column becomes the count, **no hold and no stepper on the product panel** (Paul, 2026-09-18, this ticket: the stepper is the cart quantity only; decision 35 already said so). The tile gains the in-cart count and the stock badge (stock fixed, no picker, Q16). Drilling into a variable product is **one idiom**: the breadcrumb and the pane slide; the inline expanded rows and the setting that chose between them go (decision 38 revisited under the one-way ruling; R7). Skeleton rows and tiles for the first paint, `empty-state` for the two zero-row cases, `notice` for the outage banner. The filter bar composes `chip`. |
| `pos/products/cells/variations-popover` | restyle | width | 13 | The picker is a sheet on the phone through `popover`'s width rendering (P1). |
| `pos/products/camera-scanner-panel`, the scan hooks | restyle, keep | engine | 12; 12, 7, 5, 7, 7 | The camera is the inline band (P3); scan feedback is one line under the search field (P2); the scanner's capture scope is **as today**, ledgered on the hooks, not widened by the drawing (focus Q7). |
| `components/data-table` | rebuild | pointer | 18 | One component: a frameless table on a fine pointer, rows on a coarse one (#290). Skeleton rows at the visible column set; `empty-state` in the `p-2` inset; line 12 (Searching, not No results) and line 13 preserved; the `data-table-count` / `data-table-loaded-count` contract untouched. Column resize by dragging the header edge is new and **fine-pointer only**, no keyboard path (focus Q5). |
| `components/header` | delete after rehoming | — | 23 | The register has no header (#287) and the other pages get `page-bar`. Lines 6–21 and 23 rehome (status chip, avatar, store switch and local reset in the cashier panel, notifications in the bell panel, external links); lines 1–5 and 22 → removal R5. |
| `components/drawer-content` | rebuild | width | 12 | The pale icon-only rail at 56 px, the avatar at its top, the `Free` pill at its foot, the bell gone from it (decisions 2, 42, 43). Line 1 (icon-only permanent items with tooltips) is the rule already; lines 2–12 preserved. |
| `components/navigation-area` | restyle | width | 3 | The settings shell: rail and index, back bar on the phone. |
| `components/ui-settings`, `components/customer` | restyle | width | 6, 7 | |
| `components/order` | rebuild for `status.tsx` and `filter-bar/*`, restyle for the rest | pointer | 22 | Status is a dot + label cell; tap-to-filter kept where the table renders (fine pointer) and left to the filter bar on rows (Q27). The filter bar composes `chip`, with the measured scroll-into-view and menu clamp the script adds. |
| `components/product` | restyle | — | 50 | `variable-product-row.tsx` (the inline drill-in) is removed under R7; its ledger lines are listed there. |
| `orders` | rebuild | pointer, width | 48 | Frameless list grouped by day on the Date sort (#287), rows with a pane on a coarse pointer, the open order as a pane beside the list with the modal's rail content stacked below the totals (Q28), row selected, the row `⋯` menu present in the rows rendering too (script verdict 1). |
| `reports`, `reports/chart`, `reports/closures`, `reports/orders`, `reports/report` | per the [Reports build brief](../prototypes/2026-09-12-language/reports/BUILD-BRIEF.md) §5: page bar, rail, panels and tables restyle; the chart rebuilds as inline SVG with a stated web path (Q29); donut, share bar, proportional bar, KPI, till strip and orders summary are new composed pieces | width | 19, 13, 29, 11, 10 | Detail panels open from the right on Reports; the register's opposite-side rule is a register rule (Q31). `--c1..--c5` are shared tokens (#288 T2). |
| `settings/**`, `auth/**` | restyle | width | **none** | #288 S1–S6 and C1–C4. These folders have no `LEDGER.md`; the 17 and 15 learned behaviours in their inventories are seeded by task T1 before either restyle PR opens. |
| `logs`, `health` | restyle | — | — | Skeleton adoption (#308). |

## 7. Removals: the ticket list for Paul

The [removal gate](2026-09-18-library-strategy.md#6-the-removal-gate): nothing below is struck until its ticket closes with Paul's ruling, and each lands in its own PR. Already ruled on #340 and not repeated here: the `toggle`, `tree-select` and `data-table` folders and their lines; the tokens `--tertiary`, `--duration-750`, `--error`.

| # | Removal | Reason | Ticket |
|---|---|---|---|
| R1 | `pos/checkout/payments/server/LEDGER.md` line 12 (claim capture narration from either foreground or background) | `70a2d4b086` made the terminal-payments service the sole narrator; a migration following line 12 could reintroduce two writers. Strike, and add the single-narrator invariant under the next number. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R2 | `pos/contexts/overlay-side/LEDGER.md` line 1's phone clause ("bottom sheets on phones") and its column-position derivation | The subject rule (decision 46) generalises lines 1–2; under 640 a side panel is a page (#290). The rest of both lines is preserved. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R3 | `status-badge`'s tinted filled pill shape | Filled pills are on the direction's rejected list; the badge is a dot + word everywhere (#287). Line 1 preserved. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R4 | `button`'s `compact` size variant | Identical to `sm` and collides with the scale step's name (#289). Line 5's compact-type decision is rewritten onto `sm`, not struck. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R5 | `components/header`: lines 1–4 (measured title centring, transparent-until-measured) and 5 (light system-bar icons against the dark sidebar), line 22 (a random upgrade string), and the folder at promotion | The drawn page bar is title-left with no centring; the rail is pale; the strip shows one string (decision 43). Lines 6–21 and 23 rehome first. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R6 | the quantity field of `pos/cart/cells/edit-line-item` | One place to change a quantity: the keypad on the line (§7a). Any of its four lines that names quantity is listed on the ticket. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R7 | `components/product/variable-product-row.tsx`, the inline drill-in, and the products setting that chose it | One drill-in idiom: the breadcrumb and the pane (§7a); reverses decision 38's "both, as a setting". The row's ledger lines (in `components/product`'s 50) are listed on the ticket. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R8 | the `modal` folder, at promotion of `v2/dialog` | One overlay component (§7a); its 12 lines are carried by `v2/dialog`'s ledger as preserved or n/a before deletion. | [#351](https://github.com/wcpos/roadmap/issues/351) |
| R9 | the `toggle-group` folder, after its six callers move to `segmented-control` | One value picker (§7a); its one line is carried or struck on the ticket. | [#351](https://github.com/wcpos/roadmap/issues/351) |

### 7a. One way to do each thing

Paul, 2026-09-18, on this ticket: where two ways to do one thing had crept in, one goes. The five found: removing a cart line (the strip's Remove, not the keypad's `−`), changing a quantity (the keypad, not the Edit dialog), drilling into a variable product (the pane, not the inline rows), the side panel (`dialog`, not `modal`), and the few-segment value picker (`segmented-control`, not `toggle-group`). Considered and kept apart because they are two things: the cart's order strip and the `tabs` component (switching orders is not switching views). Every future contract carries the test: if a second route to the same outcome appears in the drawing or the code, the contract names the one that stays and files the other under §7.

The nine are ruled on one ticket, [Rule on the removal list from the component map](https://github.com/wcpos/roadmap/issues/351), blocked by the refresh ([#350](https://github.com/wcpos/roadmap/issues/350)). Flagged for the refresh pass, not yet a removal: `components/order`'s tap-to-filter on a coarse pointer, `tabs` line 9 once the last `asSelect` caller switches, `toggle-group` if its callers reach zero.

## 8. The judgement calls, answered

The concordance's 31 (C), the script reading's 16 focus questions (F) and six contradictions (X). "Ruled" names where.

| Q | Answer | Where |
|---|---|---|
| C1 quiet button | `ghost-quiet` for text-only actions, `ghost` for icon buttons | this page |
| C2 chip vs pill | one `chip`; `ButtonPill` folds in as its removable form | #287 (cut 3) |
| C3 segmented control | new `segmented-control`; `toggle-group`'s callers move to it and the folder goes (R9) | this page, §7a |
| C4 keypads | one `keypad`; `numpad` composes it and keeps its display lines | this page |
| C5 status dot vs `StatusBadge` | the badge changes shape, no sibling; the pill goes (R3) | #287 |
| C6 banner | one `notice` | #308 |
| C7 quantity keypad overhang | flips side by available space; a spec line for the cart line | this page |
| C8 free strip host | app-wide at the top, one string, dismissed per session | #287 (decision 43) |
| C9 update notice's per-platform action | its own ticket; the row is drawn, nothing wired | this page (out of the map's scope) |
| C10 empty-state doodle | none; the state block's icon is the mark | #308 |
| C11 skeleton rows | still skeleton in the content's shape | #308 |
| C12 stamp's home | beside `receipt-stage` until a second caller | this page |
| C13 panel side | by subject; the column position breaks ties; R2 | decision 46, the script, this page |
| C14 open-orders takeover | at every width | the script (#342) |
| C15 press-and-hold to add | **no hold, no stepper on the product panel**; the row adds, the `+` becomes the count, quantity lives on the cart line | Paul, 2026-09-18, this ticket (decision 35) |
| C16 tile badge property | stock fixed, no picker | this page |
| C17 removal's entry point | one: the strip's Remove (hover Remove with a mouse) through `pulseRemove`; the keypad's `−` stops at 1 | Paul (§7a) |
| C18 rows vs table | pointer | #290 |
| C19 rail labels | icon-only at every step, label in a tooltip | #287 (decision 2) |
| C20 tab format | width alone; the *Tab shows* setting is gone | #287 (decision 17) |
| C21 Void behind `⋯` | yes; safer than adjacency to Checkout | #287 (decision 46) |
| C22 order note row | stays, restyle only | #287 (decision 44) |
| C23 Print bill | its own ticket after the order sheet lands; crosses into the plugin | this page (out of the map's scope) |
| C24 split ring | inline SVG, no Skia on the register | the script |
| C25 payments block facts | the row carries time, tendered and change; no data ticket | this page (verified on `next`) |
| C26 orders extras | grouped by day from the start; status counts when the endpoint exists | #287 (decision 20) |
| C27 status tap-to-filter | kept on the table rendering | the script, this page |
| C28 pane rail content | stacked below the totals | the script |
| C29 non-Skia web chart | required; inline SVG | the script, the Reports brief |
| C30 categorical colours | shared tokens | #288 T2 |
| C31 Reports panels from the right | yes; the register's rule is a register rule | this page, the Reports brief |
| F1 the five register panels | autofocus the first control, return focus on close, Esc unwinds the stack: the Reports model is the app model | this page |
| F2 Esc on the register | closes panels, the order sheet and the open-orders list, innermost first; the tender's own Esc unchanged | this page |
| F3 open-orders list focus | the current order's row on open; the picked row's tab on close | this page |
| F4 breadcrumb focus | the crumb takes focus on drill-in; Back is the crumb's parent, swipe-back on a coarse pointer | this page |
| F5 column resize | fine-pointer only, no keyboard path; `S.cols` is the model | this page |
| F6 keyboard add | Enter on a focused row adds; tiles the same; the scanner is the bulk path | this page |
| F7 scanner scope | as today, per the scan hooks' ledgers; not widened here | this page |
| F8 navigation keyboard model | Tab order; no roving tabindex in 1.11 | this page |
| F9 focus after the order sheet | back to the `⋯` that opened it | this page |
| F10 focus after the strip dismisses | the rail's first item | this page |
| F11 empty state's action | focused when a list empties by the user's own action, not on first paint | this page |
| F12 skeleton `aria-busy` | on every surface skeleton, one treatment | this page |
| F13 focus on Paid | the primary (*Print receipt · New sale*), so Enter means the primary | this page |
| F14 dot + label as filter | the table cell only (C27) | this page |
| F15 Print bill | C23 | — |
| F16 payments drawing | `bar`, the marked default; it rides the tender's focus story | this page |
| X1 line edit | Enter saves, Esc cancels; the script's stub is wrong | this page |
| X2 Enter checks out | no; Enter never leaves the cart | this page |
| X3 Enter on closed / counting | not bound | this page |
| X4 hold-to-void | dead code | #287 (decision 46) |
| X5 press-and-hold to add | C15 | Paul |
| X6 the divider | the app's `panels` behaviour, grip paint only | this page |

Two consequences for the contract template (map fog): **"focus"** joins "states" as a mandatory section (where focus lands on open, where it returns, what Esc and Enter do), and every answer above is its default.

## 9. The contracts list for `/to-spec`

One contract per line; the landing order (#292) sequences them. Restyles of a whole tier can share a ticket.

**Library, new:** `skeleton` · `empty-state` · `notice` · `chip` · `segmented-control` · `keypad` · `breadcrumb` · `page-bar`.

**Library, rebuild (v2 beside):** `dialog` (absorbing `modal`).

**Library, restyle (in place):** the control core (`input`, `button`, `select`, `combobox`, then `icon-button`, `textarea`, `checkbox`, `radio-group`, `switch`, `slider`, `tree-combobox`, `tree`, `numpad`, `calendar`, `form`, `label`) · the atoms (`text`, `icon`, `badge`, `avatar`, `loader`, `progress`, `sort-icon`, `docs-link`, `card`) · the overlays (`alert-dialog`, `popover`, `dropdown-menu`, `tabs`, `panels`, `table`, `list-item`, `status-badge`).

**Composed, rebuild (v2 beside):** the cart line and cells · the order strip and the open-orders list · the cart foot and the order sheet · the products browser (index, cells, grid, filter bar) · the data table · the rail · the orders list and pane · the order status cell and filter bar · the overlay side rule · the reports chart · the reports new pieces.

**Composed, restyle (in place):** register bar and panel, gate cards and sheets · checkout, column, receipt stage · tender · columns · variations popover · camera panel · navigation area · ui-settings · customer · product · closures, reports orders and report · settings · connect · logs · health.

**Removals:** R1–R9 above, ruled on one removal ticket, each landing in its own PR.

**Pre-work:** T1, the ledger refresh, before any rebuild contract opens.

## 10. What this page fixes for later tickets

- **The landing order (#292, decided 2026-09-18: [the landing order page](2026-09-18-landing-order.md)):** the token pass carries `text`, `icon` and the control core; the new eight land in the primitives pass; the screen order is free to choose, and each screen's switch PR names its rebuilt pieces from §6 and its removal PRs from §7.
- **The contract template (map fog):** "focus" is mandatory, with §8's defaults.
- **The gallery (map fog):** one cell per new folder in §5 and per restyled control in §3, across the six scale cells and #308's state cells.
- **T1 ([#350](https://github.com/wcpos/roadmap/issues/350), task, AFK):** refresh every `LEDGER.md` against `next` since 2026-09-12, appending misses under new numbers and listing candidate strikes on the relevant removal ticket; seed `settings/**` and `auth/**` from their inventories' §5.
