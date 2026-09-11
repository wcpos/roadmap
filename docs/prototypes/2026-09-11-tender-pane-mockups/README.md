# Tender pane mockup — the "choose how the customer is paying" screen

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build).

**Question it answers:** what the tender pane (the left pane of the 1.11 checkout column swap) should look like instead of the live screen Paul screenshotted on 2026-09-11 — uneven tiles, "OTHER" on five of seven, disabled gateways at full size, two competing amounts and a paragraph of instructions at the bottom.

**Second round (this file).** Built against the UI design rules (monorepo `.claude/rules/design.mdc`, long form in `docs/design/ui-design-guidelines.md`) after Paul's verdict on the first round: *the back arrow points nowhere, WooCommerce stores run five or six gateways so the grid wins, and it looks ugly.* One layout, the grid, done properly. The first round's three layouts are kept as `index-v1-three-layouts.html` with their captures in `screens-v1/`.

Built on the real screen: `packages/core/src/screens/main/pos/checkout/tender/tender-pane.tsx` and `tiles.ts` on monorepo `next`. Every tile state the code produces is here, plus the keypad, quick amounts, change due, the terminal and reader lines, split plans, custom amount, captured legs, Cancel payment and the Legacy tab. The ledger pane is the live one. Everything in the frame is live: tap a tile, type an amount, press Take and the leg lands in the ledger; when the balance hits zero a *Paid* stamp lands. Nothing persists.

Reopen: `open ~/Projects/roadmap-worktrees/docs-tender-pane-mockups/docs/prototypes/2026-09-11-tender-pane-mockups/index.html`

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Tap** | nothing · Cash · Card · SumUp (`1` `2` `3`; `0` or Esc clears); tiles in the frame are live too |
| **Split** | off · 2 ways · custom 10,00 — the Split chip in the frame toggles too |
| **Network** | offline: one badge under the total, the dot in the top bar, and every tile that needs the store dims with *Needs a connection* |
| **Width** | Tablet (1280, ledger beside) or Phone (390, ledger folded to a balance bar) |
| **Theme** | Light or Dark, the same tokens swapped |
| **Paid so far** | one captured cash leg, so Remaining ≠ Total and Cancel payment appears |

## What it applies from the rules

- **Close, not a left arrow.** The pane sits left of the ledger; leaving checkout brings the products column back. A left arrow pointed nowhere.
- **One number.** *Total*, or *Remaining* once a leg is taken. A split or custom amount is a plan line under it, not a second total.
- **A grid built for six gateways.** Three fixed columns, 96 pt tiles, order from the POS settings page, never reshuffled. Unavailable gateways stay in their place, dimmed, reason in one quiet line.
- **Progressive disclosure.** Once a method is chosen the grid folds to a chip row (one chip plus *Change method* on phone) so the keypad and Take are always on screen.
- **Kinds are icons.** No *OTHER*.
- **Touch sizes.** Tiles 96, keys 56, Take 52, chips 40–44, close 44, gaps 8–10.
- **Joy, defined.** Pressed states in 100 ms, the change line rises as you type, Take lands the payment in the ledger, *Paid* stamps once at zero. Reduce-motion turns it all off.
- **Tokens, both themes.** Blue primary, red only for Cancel payment (owner ruling 2026-09-11).
- **No paragraph.**

## Screens

`screens/` holds Playwright captures: `tablet*`, `phone*`, light and dark. Regenerate with `node docs/prototypes/2026-09-11-tender-pane-mockups/shoot.mjs` run from the monorepo root (uses its Playwright).

## Mobbin references (first round)

Pulled through the Mobbin MCP on 2026-09-11; its library is consumer apps, so these are idioms, not POS peers: Fresha *Select payment* (equal tiles, one banner for the disabled option), Square *Quick charge* (Split as a secondary button, one notice for what isn't set up), Grab / Etsy / Wise method lists (one grey line for why an option is out), World App / Monzo amount entry (amount leads, quick chips above the keypad). Vendor POS behaviour is in `docs/research/2026-09-07-checkout-flow-research/`.

## Open questions

- Should a card tap for the exact balance skip the keypad and go straight to the terminal (Toast Fast cash, Odoo one-click)? Here it opens the keypad pre-filled.
- Does *Works offline* earn its place while online, or only once the till loses the store?
- Legacy tab when the store has no webview gateway: hide, or keep the position stable?

## Reaction

_To be recorded after Paul has walked it._
