# Tender pane mockups — the "choose how the customer is paying" screen

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build).

**Question it answers:** what the tender pane (the right-hand pane of the 1.11 checkout column swap) should look like instead of the live screen Paul screenshotted on 2026-09-11 — uneven tiles, "OTHER" on five of seven, disabled gateways at full size, two competing amounts and a paragraph of instructions at the bottom.

Built on the real screen: `packages/core/src/screens/main/pos/checkout/tender/tender-pane.tsx` and `tiles.ts` on monorepo `next`. Every tile state the code produces is here (works offline, no terminals set up, not available in the browser, needs a connection), plus the keypad, quick amounts, change due, the terminal line, split plans, custom amount, a captured leg, Cancel payment and the Legacy tab. The ledger pane is the live one. Nothing persists.

Reopen: `open ~/Projects/roadmap-worktrees/docs-tender-pane-mockups/docs/prototypes/2026-09-11-tender-pane-mockups/index.html`

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Layout** | A · Grid / B · List + panel / C · Two big buttons — `←` `→` also cycle |
| **Tap** | nothing · Cash · Card · Simulated terminal (`1` `2` `3`, `0` clears); tiles in the frame are live too |
| **Split** | off · 2 ways · custom 10,00 |
| **Network** | offline disables everything that needs the store, one badge in the header |
| **Width** | Tablet (1280, ledger beside) or Phone (390, ledger folded to a balance bar) |
| **Paid so far** | one captured cash leg, so Remaining ≠ Total and Cancel payment appears |

## Layouts

- **A · Grid** — the live layout tidied: equal tiles, icon kinds, unavailable methods folded into one row, keypad under the tiles as today. Least change.
- **B · List + panel** — methods as a list, a panel beside it that is the split plan (all of it / 2 ways / 3 ways / custom, amounts shown) until a method is tapped, then the keypad. Split leaves the header.
- **C · Two big buttons** — Cash and Card carry the balance (*Take 18,00 £*); terminals are a chip row underneath. Card is one tap, cash opens the keypad because change is the question.

The notes under the frame list what changed against the live screen, the Mobbin references, and the questions each layout raises.

## Screens

`screens/` holds Playwright captures: `A|B|C-tablet-*`, `*-phone*`. Regenerate with `node shoot.mjs` run from the monorepo root (uses its Playwright).

## Mobbin references

Pulled through the Mobbin MCP on 2026-09-11 (its library is consumer apps, so these are idioms, not POS peers):

- Fresha · Select payment — four equal tiles with icons, one banner for the disabled tile, ledger and *To pay* on the right.
- Square · Quick charge — *Split payment* as a secondary button beside the section title; one notice for what isn't set up.
- Grab, Etsy, Wise — payment method lists: icon + title rows, one grey line for why an option is out.
- World App, Monzo — amount leads, quick-amount chips above the keypad.

Vendor POS behaviour (Toast Fast cash, Odoo one-click, Lightspeed) is in `docs/research/2026-09-07-checkout-flow-research/`.

## Reaction

_To be recorded after Paul has walked it — which layout, which pieces from the others, what changed._
