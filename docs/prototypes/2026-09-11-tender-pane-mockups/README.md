# Tender pane mockup — the "choose how the customer is paying" screen

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build).

**Question it answers:** what the tender pane (the left pane of the 1.11 checkout column swap) should look like instead of the live screen Paul screenshotted on 2026-09-11.

**Fourth round (this file): direction 01, "the keypad is the screen", pushed.** Paul picked it from the direction board (*"01 is closest. It's still not great, but keep pushing in that direction"*). Cash App's idea: the amount is the whole surface, the balance is already typed at 104 pt, the method row is the commit. Card methods go straight to the terminal moment (direction 05); cash goes straight to a full-bleed Paid beat. Everything in the frame is live: type, tap Cash or Card, watch a terminal run its steps, cancel, split, go offline, switch surface (slate / brand blue / light), switch width. Earlier rounds are kept: `index-v2-grid.html` (grid, rules-driven), `index-v1-three-layouts.html`, `directions.html` (the five-direction board).

Built on the real screen: `packages/core/src/screens/main/pos/checkout/tender/tender-pane.tsx` and `tiles.ts` on monorepo `next`. Every disabled reason the code produces is here, plus quick amounts, change due, split plans, terminal and reader legs, captured legs, Cancel payment and Legacy.

Reopen: `open ~/Projects/roadmap-worktrees/docs-tender-pane-mockups/docs/prototypes/2026-09-11-tender-pane-mockups/index.html`

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Jump to** | Fresh sale · Typed 20 · Split 2 ways · After a cash leg · On the terminal · Paid |
| **Network** | offline: one badge by the label, the dot in the top bar, terminal pills faded with one line under the row saying why |
| **Surface** | Slate (the sidebar colour) · Blue (brand) · Light |
| **Width** | Tablet (1280, ledger beside) or Phone (390, ledger folded to a balance bar, method row scrolls) |

Keyboard: digits and Backspace type, Enter takes cash, Esc closes.

## What it does

- **The amount is the screen.** Balance pre-typed, dimmed until you type; the change line rises as you type; a short amount says what is still to take.
- **The method is the commit.** Cash and Card are white and carry the amount they will take. Terminals and readers sit in the same row in POS-settings order and wrap; unavailable ones fade with one quiet line under the row.
- **Card → terminal moment → Paid.** No confirm screen. The Paid moment is full-bleed green, the tick draws, change is the headline for cash, then Print / Email / No receipt · New sale.
- **Split** is a header action that turns the amount into a plan and pre-types the leg. Custom amounts: type.
- **Close, not an arrow.**

## Screens

`screens/` holds Playwright captures of every jump state, the three surfaces, offline and phone. Regenerate with `node docs/prototypes/2026-09-11-tender-pane-mockups/shoot.mjs` run from the monorepo root (uses its Playwright). `screens-v1/`, `screens-v2/` and `screens/direction-0N.png` are the earlier rounds.

## Open questions

- Cash pre-typed to the balance: exact is one tap, "gave me 20" is two keys and a tap. Right default, or should cash start empty so the cashier always types what was handed over?
- Card as manual entry goes to Paid at once. Ask for the last four or a reference?
- Should every terminal pill carry its reader name and battery, or only once selected?

## Mobbin references

Direction 01 steals from Cash App (the amount is the screen; digits without boxes; Pay as the only button), Revolut and Monzo (quick amounts above the keypad), Apple Wallet and Chase (the tick and "sent" as the whole result screen), Revolut ("being processed" as a calm card). The full set with thumbnails is in `directions.html`. Mobbin has no POS apps; vendor behaviour is in `docs/research/2026-09-07-checkout-flow-research/`.

## Reaction

_To be recorded after Paul has walked it._
