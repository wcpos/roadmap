# Tender pane mockup — the "choose how the customer is paying" screen

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build).

**Question it answers:** what the tender pane (the left pane of the 1.11 checkout column swap) should look like instead of the live screen Paul screenshotted on 2026-09-11.

**Fourth round (this file): direction 01, "the keypad is the screen", pushed.** Paul picked it from the direction board (*"01 is closest. It's still not great, but keep pushing in that direction"*). Cash App's idea: the amount is the whole surface, the balance is already typed at 104 pt, the method row is the commit. Card methods go straight to the terminal moment (direction 05); cash goes straight to a full-bleed Paid beat. Everything in the frame is live: type, tap Cash or Card, watch a terminal run its steps, cancel, split, go offline, switch surface (slate / brand blue / light), switch width. Earlier rounds are kept: `index-v2-grid.html` (grid, rules-driven), `index-v1-three-layouts.html`, `directions.html` (the five-direction board).

Built on the real screen: `packages/core/src/screens/main/pos/checkout/tender/tender-pane.tsx` and `tiles.ts` on monorepo `next`. The mock order has three lines (Belt, Scarf, Socks · 46,00 £) so Item split has something to split. Every disabled reason the code produces is here, plus quick amounts, change due, split plans, terminal and reader legs, captured legs, Cancel payment and Legacy.

Reopen: `open ~/Projects/roadmap-worktrees/docs-tender-pane-mockups/docs/prototypes/2026-09-11-tender-pane-mockups/index.html`

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Jump to** | Fresh sale · Typed 20 · Card selected · SumUp selected · Split chooser · Split 2 ways · 3 ways after leg 1 · Percent tab · Item tab · Items after leg 1 · Items shared by 2 · Items pick the next · After a cash leg · On the terminal · terminal failure, cancellation, and expiry states · Paid · Unavailable list open |
| **Network** | offline: one badge by the label, the dot in the top bar, terminal pills faded with one line under the row saying why |
| **Surface** | Slate (the sidebar colour) · Blue (brand) · Light |
| **Width** | Tablet (1280, ledger beside) or Phone (390, ledger folded to a balance bar, method row scrolls) |

Keyboard: digits and Backspace type, Enter takes cash, Esc closes.

## What it does

- **The amount is the screen.** Balance pre-typed, dimmed until you type; the change line rises as you type; a short amount says what is still to take.
- **Terminal pills carry status** (round 10): a green dot when the reader is connected, with battery where it reports one; grey in the unavailable list. 
- **Choose the method, then commit** (round 5, after Paul's notes). The method row under the amount is a selector; the helpers change with it (notes + Exact for cash, Full balance for card, reader line + Change for a terminal); one white button at the bottom names the action. Unavailable gateways sit in a folded *N not available right now* list with reasons. Payments / Legacy is a segmented control at the far right; Split is a chip beside the To pay label.
- **Card → terminal moment → Paid.** No confirm screen. The Paid moment is full-bleed green, the tick draws, change is the headline for cash, then Print / Email / No receipt · New sale.
- **Split flow** (round 8: four modes). The Split chip takes over the pay pane (round 9, no sheet): the amount being split stays at the top, four tabs under it. **Even**: 2 to 6 ways with the amount each. **Amount**: 5 / 10 / 20 / 50, Half, or type the first payment on the keypad. **Percent**: 10 / 20 / 25 / 30 / 50 / 75 with the amount shown. **Item**: tick the cart lines this payment covers, *Pay for these · 28,00 £*, or share the ticked lines between 2 / 3 / 4 people (round 10). Item is a loop: after a group lands the ledger marks those lines *paid · Card + SumUp*, the strip shows *Rest 6,00 £* with *Pick next items* beside it, and the Item tab greys the paid lines so the next customer's items can be ticked. *No split* clears a plan. A plan puts a strip under the number: done legs green with their method, the current leg outlined, the rest dim, and *Change split* beside them. The label reads *Payment 2 of 3 · 12,00 £ left*, the commit button reads *Take 6,00 £ in Card · 2 of 3*. Typing less than the planned leg says the difference moves to the next payment; a part payment without a plan says what is left after it. Each leg can use a different method.
- **Close, not an arrow.**

## Screens

`screens/` holds Playwright captures of every jump state, the three surfaces, offline and phone. Regenerate with `node docs/prototypes/2026-09-11-tender-pane-mockups/shoot.mjs` run from the monorepo root (uses its Playwright). `screens-v1/`, `screens-v2/` and `screens/direction-0N.png` are the earlier rounds.

Run the interaction checks from that same installed monorepo workspace, pointing `ROADMAP_CHECKOUT` at this checkout:

```sh
node "$ROADMAP_CHECKOUT/docs/prototypes/2026-09-11-tender-pane-mockups/keyboard.test.mjs"
node "$ROADMAP_CHECKOUT/docs/prototypes/2026-09-11-tender-pane-mockups/shoot.test.mjs"
```

## Open questions

- Cash pre-typed to the balance: exact is one tap, "gave me 20" is two keys and a tap. Right default, or should cash start empty so the cashier always types what was handed over?
- Card as manual entry goes to Paid at once. Ask for the last four or a reference?
- Should every terminal pill carry its reader name and battery, or only once selected?

## Mobbin references

Direction 01 steals from Cash App (the amount is the screen; digits without boxes; Pay as the only button), Revolut and Monzo (quick amounts above the keypad), Apple Wallet and Chase (the tick and "sent" as the whole result screen), Revolut ("being processed" as a calm card). The full set with thumbnails is in `directions.html`. Mobbin has no POS apps; vendor behaviour is in `docs/research/2026-09-07-checkout-flow-research/`.

## Reaction

Approved on round 10, 2026-09-11: *"ok, this looks great!!! Can we start work on that and make sure everything is captured, especially things like the split screen and the terminal payment animation."* Path to here: three grid layouts (v1) → *"it just looks ugly"* → the design rules → a rules-driven grid (v2) → *"moderately better, not something we could ever ship"* → the five-direction board → 01 chosen → method selection step, unavailable list, Split/Legacy separated → split chooser → five split models → four modes (Even / Amount / Percent / Item) → split takes over the pane, not a sheet → Item loops and shares N ways, terminal pills carry status.

Build contract: `docs/specs/2026-09-11-tender-pane-keypad-spec.md`. Epic on wcpos/roadmap under v1.11.0 (#195).

## Split board (round 7)

`split-directions.html` — five models of what a split *is*, each drawn on the current pay surface with the Mobbin idiom it borrows: **A** even ways plus Amount / Percent tabs (Revolut, Splitwise), **B** build the legs first then take them in order (Monzo, Wise), **C** split by item (GoPay), **D** how many people, a stepper with person cards (Blackbird, Chime, PayPal), **E** no plan at all, Half / A third / Type chips on the keypad (Monzo). Captures in `screens/split-A..E.png`. Built after Paul asked to see more options for the split flow.
