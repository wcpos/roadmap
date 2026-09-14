# POS register in the 1.11.0 language — prototype for wcpos/roadmap#287

Throwaway, self-contained HTML. Double-click `index.html`. The dark strip is not part of the design.

**Question it answers:** what the register (the POS screen with the cart column, the register
states, the tender pane and the beats) looks like in the direction decided on 2026-09-12, at phone,
tablet and desktop, light and dark, compact and regular. The structure and flow are fixed
([#214](https://github.com/wcpos/roadmap/issues/214), PR #259, the 2026-09-11 prototype beside
this one); this is a reskin, and everything that changed is skin.

## What changed from the 2026-09-11 register prototype

Same bar, same cart, same open card, same panel, same count, same closure sheet, same tender
pane. On top of them:

- **Tokens, not values.** Every size reads `--u` (spacing unit), `--ctl` (control), `--row`,
  `--tile`, `--r`, `--amt`, floored by `--floor` on touch. The scale switch changes those seven
  numbers and nothing else, which is the "two postures" claim made concrete.
- **Controls are 44 by default** (`--ctl` at regular; 40 at compact only on a fine pointer). The
  `h-10` finding is closed here once.
- **Flat, hairline, one radius.** The panel, the sheets and the anchored popover have a hairline
  and a scrim; no shadow anywhere. The old prototype's `shadow-md` cards and the navy rail are gone.
- **The rail is pale**, tinted with the theme at low chroma; the active item is a white tile with
  the primary icon. The theme shows in the rail and the controls, nowhere on the working surface.
- **Line-weight icons** (1.75 stroke), standing in for the regular-weight re-export in §6 of
  the direction.
- **Status is a dot plus a word** (the register picker's "Open since 09:02", the count's "Exact",
  the terminal's "Reader connected"); pills are hairline outlines, only when a state is abnormal.
- **Focus is drawn.** "Session open" shows the ring on search; "Line just added" shows the
  quantity of the new line focused with a settle highlight; the count and the open card show the
  amount focused. The notes under the frame say what Enter does in each state.
- **The tender pane sits on the neutral surface**, not slate: the amount is still the screen,
  methods are a fixed three-column grid of equal tiles (rule 5), the keypad keys are `--tile`,
  the commit is the theme's primary. Unavailable gateways fold into one line under the grid.
- **The Paid beat is a stamped disc**, not a full-bleed green surface; the receipt actions stack
  under it, print first.
- **No toast on a line add.** The settle highlight and the focus are the acknowledgement.

## States (the strip's *State* row)

Session open · Line just added (beat) · New empty cart · Register closed (open card) · Choose
register · Counting · Overdue · Register panel · Closure written (beat) · Offline · Products
loading · No results · Column settings (anchored) · Tender keypad · Tender on the terminal · Paid
(beat) · German strings.

Everything in the frame is live: tap a tile to add a line (settle + focus), the drawer icon opens
the panel, Close register goes to the count, typing a count updates the variance line, Close &
print raises the closure sheet, Checkout opens the tender pane, digits and Enter take cash, a
terminal method waits and lands, and the Paid actions start a new sale.

## Inventory

Rule 9: the real screen on `next` was sent to Codex read-only (`-m gpt-6-astra`, effort high)
for its state and string inventory before drawing. That run had not returned when this was
drawn; the strings here are the ones the 2026-09-11 prototype rehosted and the ones landed on
`next` under `packages/core/src/screens/main/pos/cart/` (register bar, open card, panel, count,
closure sheet, user sheet, register picker, movement and approve sheets). When the report lands
it is folded in here, with anything it contradicts listed.

## Decisions Paul must make

Listed with the whole set in [`../README.md`](../README.md): the language itself (1), the rail
(2), scale semantics (3), the tender surface (8), the Paid beat (9), the line-add beat (10).

## Rejected

- Slate tender surface and full-bleed Paid — the out-list bans coloured working surfaces.
- A wrapping method row — rule 5, tiles keep their width and order.
- Toast per scan — noise on the happy path.
- Navy rail carried over — the loudest block on a calm screen.

## Screens

`screens/` holds Playwright captures `<width>-<theme>-<scale>-<state>.jpg` for phone, tablet and
desktop × default light and dark × regular and compact × the seventeen states. `node shoot.js`
regenerates them (uses the monorepo's Playwright), runs the interaction assertions, and fails on
any page or console error. `--quick` captures tablet light regular only.
