# The platform-split rule: when a component diverges, what keys it, and which components do

_Decided 2026-09-18 by Paul in the grilling for [wcpos/roadmap#290](https://github.com/wcpos/roadmap/issues/290), part of the [UI overhaul for 1.11.0 map](https://github.com/wcpos/roadmap/issues/282). Inputs: the [library-evolution census](https://github.com/wcpos/monorepo/blob/research/library-evolution/.claude/research/2026-09-18-library-evolution.md) (nine file-level splits, fifteen inline `Platform.OS` branches), the [mockup concordance](https://github.com/wcpos/monorepo/blob/research/mockup-concordance/.claude/research/2026-09-18-mockup-concordance.md), the three data points from the prototypes (rows with a pane on the tablet, #287; the variation picker as a sheet on the phone, the receipt email dialog centred everywhere while the printer wizard and filter editor slide out and become phone pages, #288), the [scale and density page](2026-09-18-scale-and-density.md) (#289, the pointer keys the floor), and the [UI design guidelines](ui-design-guidelines.md) ("hover and keyboard are desktop extras layered onto a touch design"). This page binds the component map (#291) and every rebuild ticket._

## The rule in one paragraph

A component splits only when two contexts need a **different idiom for the same job**, and each split is keyed by **the thing that actually differs**. There are three keys. The **platform** (a Metro `.web.tsx` / `.native.tsx` file) only when the *engine* differs: one side needs a primitive or library the other lacks. The **pointer** when the *posture* differs: hover, keyboard, drag handles and dense tables belong to a fine pointer; swipe, long-press and tall rows to a coarse one. The **phone width** (under 640) when the *room* differs: anchored things become sheets, side panels become pages. Styling differences are never a split; tokens, the scale step and the floor carry them. A split is **one component with two renderings behind one API and one name**, never two components.

## 1. The three keys

| key | what differs | how it is read | examples |
|---|---|---|---|
| platform (`.web` / `.native` file) | the engine: a primitive or library one side lacks | Metro resolution; the specifier never names the platform | tooltip, toast, virtualized list, webview, image |
| pointer (`fine` / `coarse`) | the posture: hover, keyboard, drag, density vs swipe, long-press, tall rows | a `usePointer` hook: web reads `(pointer: fine)` and `(hover: hover)`; native is always coarse (an iPad trackpad is treated as touch) | table vs rows, hover card vs popover, hover actions vs swipe strip |
| phone width (under 640) | the room: whether an anchored or side surface fits | the existing `useIsPhone` hook | popover vs sheet, side panel vs page |

Rows versus table is keyed by the **pointer** (Q2), not width or platform: the register sign-off put rows on the tablet, and at 1024 wide only the pointer separates an iPad from a small desktop window. iPad Safari gets rows; a touchscreen laptop with a trackpad gets the table.

Sheets are keyed by **width on every platform** (Q3): a phone-sized browser window gets the sheet too, which is what the prototype and the library's existing phone-sheet shell already do.

## 2. Surfaces

- **Anchored surfaces** (popover, select, combobox, tree combobox, dropdown menu, the calendar inside a popover) are a popover beside their trigger and a **sheet on the phone**, through the one sheet shell.
- **Side panels** (dialog with a side) are a panel beside the content and a **full page on the phone**. A long form slides out and fills the phone.
- **Centred dialogs and confirmations** (a short task like the receipt email, every alert dialog) **never split**: centred at every width (Q4).
- **Nothing is hover-only on a coarse pointer** (Q5). The hover card's one use opens as a popover on tap; tooltip content is never the only carrier of a fact; the cart line's hover actions are its swipe strip on touch.

## 3. Which components split

**Engine splits, all nine existing files, stay and none are added:** `collapsible/primitives.web`, `dnd/index.web`, `image/index.web`, `keyboard-controller/index.web`, `select/trigger.web`, `toast/sonner.web`, `tooltip/index.web`, `virtualized-list/virtualized-list.web`, `webview/index.web`.

**Idiom splits, one component with two renderings each** (Q6):

| component | key | renderings |
|---|---|---|
| data table | pointer | a real table (sortable headers, resize handles on hover, hover row, arrow-key focus) or rows with a chevron and a detail pane |
| popover, select, combobox, tree combobox, dropdown menu, calendar in a popover | phone width | anchored popover, or the sheet shell |
| dialog side panels | phone width | side panel, or a full page |
| hover card | pointer | hover card, or a popover on tap |
| tooltip | pointer (and engine) | hover on a fine pointer, long-press on a coarse one; never the only carrier |
| variation picker (composed) | phone width | popover beside the tile, or a sheet |
| cart line actions (composed) | pointer | hover strip, or the swipe strip |

## 4. The fifteen inline branches are not splits

They collapse (Q7). Twelve are **overlay plumbing** (the `StyleSheet.absoluteFill` and fade-in/out branches in select, dropdown menu, popover, hover card, dialog, modal, alert dialog, accordion, tabs), which the one overlay system absorbs. Two are **test-id plumbing** (`data-testid` on web), which one helper absorbs. The calendar's day-header font-size branch is a **token** and dies in the token pass. After the rebuild, **a component never reads the platform outside an engine file**; it reads the pointer and the phone width from one `lib/device` module (Q8), and the scale step and the floor stay at the root as the scale page decided.

## What this page fixes for later tickets

- **The component map (#291):** every candidate carries its key from the table above; the fifteen inline branches are classified per branch (overlay, test-id, token) rather than kept; the rebuilt data table is one component with the rows rendering, not a sibling list component; the library's own `data-table` folder, never imported from core, is judged there.
- **The landing order (#292):** the `usePointer` hook and the `lib/device` module land with the token pass; the overlay system absorbs the twelve plumbing branches when it lands.
- **The gallery:** an idiom-split component has two cells per key (fine/coarse, phone/wide) on top of its scale cells.
