# The 1.11.0 language, on the system screens (2026-09-14)

Prototypes for the wayfinder map [UI overhaul for 1.11.0](https://github.com/wcpos/roadmap/issues/282),
Phase A of [the program](../../design/2026-09-12-ui-polish-program.md). Every screen draws from
[the direction](../../design/2026-09-12-direction.md) ("a calm instrument that is already where
you're going, in two postures") and is judged by [the guidelines](../../design/ui-design-guidelines.md).

Self-contained HTML. Double-click `index.html`; no server, no build. The dark strip at the top is
not part of the design: **Width** (phone 390 / tablet 1024 / desktop 1440), **Theme** (the five),
**Scale** (compact / regular / spacious), **State** (every state the inventory lists). Captures sit
in each folder's `screens/`; `node <folder>/shoot.js` regenerates them with the monorepo's
Playwright and fails on any page or console error (`--quick` for one width).

| Screen | Ticket | Status |
|---|---|---|
| [`pos-register/`](pos-register/) | [#287](https://github.com/wcpos/roadmap/issues/287) | drawn, waiting on Paul |
| [`orders/`](orders/) | [#287](https://github.com/wcpos/roadmap/issues/287) | drawn, waiting on Paul |
| settings tab, connect, receipt, products, tokens | [#288](https://github.com/wcpos/roadmap/issues/288) | not started — the language may move after #287 |

## The tokens, as drawn

Both files carry the same token block at the top of their `<style>`; it is the design, everything
below it reads tokens. Three axes:

**Scale step** (the numbers are proposals for [#289](https://github.com/wcpos/roadmap/issues/289)):

| | compact | regular | spacious |
|---|---|---|---|
| spacing unit (`--spacing`) | 3.5 | 4 | 5 |
| base font, web | 13 | 14 | 16 |
| form control | 40 | 44 | 52 |
| list / table row | 36 | 44 | 52 |
| tile, key, tender method | 56 | 64 | 80 |
| radius | 6 | 8 | 10 |
| leading amount | 34 | 40 | 48 |

**Touch floor.** On a coarse pointer (phone, tablet) nothing interactive is under 44 pt at any
step; `max(var(--ctl), var(--floor))` everywhere. On a fine pointer (desktop) the floor is WCAG's
24, so the compact step can be a real desk density. This is how the audit's `h-10` = 40 finding is
closed: one floored token, not a per-screen fix.

**Colour.** The working surface is neutral in every theme (chroma ≤ 0.04). The theme reaches
the controls (primary, ring, selected row) and the rail. The status set is fixed and identical in
all five themes: `ok` green, `warn` amber, `bad` red, `info` blue, `neutral` grey — always a dot
plus a word, never a filled pill.

**Width class** picks the posture: below desktop the pointer is assumed coarse and the orders
list is rows; at desktop it is a table with hover, resize handles, and keyboard focus.

## Decisions for Paul

Each with the options and my pick. Answer in order; the first two move everything else.

1. **Does the language read right?** The captures to judge: `pos-register/screens/tablet-light-regular-open.jpg`,
   `…-tender.jpg`, `…-panel.jpg`; `orders/screens/desktop-light-regular-default.jpg`,
   `…-open-refund.jpg`, `tablet-light-regular-open.jpg`; and the dark twins. Options: (a) this is
   the direction, refine from here; (b) right bones, wrong temperature (say which way); (c) wrong.
   **Pick: (a)** — it is the direction note built, with nothing added.
2. **The rail.** (a) *Drawn:* a pale tinted rail (`--rail` at chroma 0.014), active item on a
   white tile, primary icon. (b) Today's navy block. Pro of (a): nothing on screen is louder than
   the thing about to be pressed; the theme still shows at a glance. Pro of (b): a hard "where am
   I" anchor and eight years of habit. **Pick: (a).**
3. **Scale semantics.** The direction's diagram labelled the counter "compact" with 56 pt rows and
   the desk "spacious" with 36; the program defines compact as *smaller* (phone) and spacious as
   *larger* (32-inch). They contradict. *Drawn:* the program's definition, with posture coming
   from the pointer type, not the step. **Pick: the program's definition** — rows are tall on
   touch at every step because of the floor, not because of the step's name. Feeds #289.
4. **Status in the orders list: dot + label** (drawn) or the icon-only cell with a tooltip (today).
   Costs a 172 px column; gains a status you can read at arm's length and one treatment shared
   with the open order and the receipt. **Pick: dot + label.**
5. **Rows: hairlines** (drawn) or zebra striping (today's `table-row-alt`). Hairlines keep one
   surface colour; zebra helps tracking on wide desktop tables. **Pick: hairlines** — the desktop
   table also gets a hover row, which does the tracking job.
6. **Orders on a tablet: rows** (drawn) or the same table as the web (today). Rows are the
   direction's platform split for a touch surface; the table is one less component. **Pick: rows.**
7. **The open order: a pane beside the list** (drawn, 560 / 440 px, list keeps its core columns)
   or the 800 px right-side modal with its own two columns (today). The pane keeps the list live
   and the row selected; the modal shows more at once. **Pick: the pane** — it is the Linear /
   Fresha shape and the direction's §5.
8. **The tender pane's surface: neutral** (drawn) or the slate surface approved on 2026-09-11.
   Structure, keypad and fold are untouched (PR #259); only the skin moved, because the direction
   bans coloured working surfaces. **Pick: neutral** — the amount is still the screen.
9. **The Paid beat: a calm disc on the neutral surface** (drawn) or the full-bleed green approved
   on 2026-09-11. **Pick: calm** — the out-list rules out a coloured surface; the stamp-in disc is
   the beat.
10. **Line added: settle highlight + quantity focus, no toast** (drawn). A toast on every scan is
    a hundred toasts a day. **Pick: no toast.**
11. **Loading: skeleton rows** (drawn) versus headers plus a central spinner (today). This is
    [#308](https://github.com/wcpos/roadmap/issues/308)'s call; the prototype draws the proposal so it
    can be judged there rather than argued. **Pick: skeleton, still, no shimmer.**
12. **Copy: sentence case everywhere** — "Search orders", "Billing address", "Print receipt" — the
    app today mixes title case ("Search Orders", "Print Receipt"). One rule for the language pass.
    **Pick: sentence case.**

## Rejected while drawing

- A dark toast for every line added — noise on the happy path.
- Filled status pills — they are the loudest mark on a hairline screen and fail on a monochrome
  receipt printer.
- Cards on the phone orders list — rows with a chevron are the iOS grammar; cards are a web habit.
- A full-screen modal for column settings — the direction's §5; anchored panel on tablet and
  desktop, sheet on phone.
- A fourth colour theme surface per screen — the working surface is one neutral, the theme lives
  in the rail and the controls.
- A shadow under the pane and the popovers — hairline and scrim carry the elevation.

## What the inventory changed

Both screens were inventoried read-only on `next` (Codex, `-m gpt-6-astra`, effort high) before
drawing, per rule 9. The orders inventory is summarised in `orders/README.md` and drove the column
set, the filter set, the status set, the row menu, the footer copy and the states. The register's
inventory run had not returned when the drawing was done; the register is drawn from the decided
2026-09-11 prototype and PR #259, which the app's `pos/cart/*` on `next` implements, so the strings
there are the app's. When the run lands its report is folded into `pos-register/README.md`.
