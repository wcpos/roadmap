# Register on `next` — handoff prompt (2026-09-11)

Paste the block below into a fresh Claude Code session opened in `/Users/kilbot/Projects/monorepo-v2`.

```
Implement the cashier register on `next`, starting from the decided design. Do not redesign anything.

Where the decisions live (read all four before doing anything else):
1. wcpos/roadmap `docs/prototypes/2026-09-11-register-page/README.md`, section "What to build on `next`" — 12 ordered items. This is the build list. Open `index.html` there (Playwright captures in `screens/`) to see every state; `shoot.js` shows the full flow chain.
2. `CONTEXT.md` in the monorepo → "Language — Cashiers & till" — the vocabulary (cashier, register, session, counting, opening float, closure, blind count, the two capabilities, override by code). Use these words in code, tickets and copy.
3. wcpos/roadmap#214 — the resolution comment (register is a state of the POS screen, not a page; no title bar; registers are server records with a device pointer; several devices may share one register).
4. wcpos/roadmap#215 — the landing-order proposal: register record + device pointer → session + POS screen → stored closure → Reports Closures (Pro); PIN switching and the first-cash-sale auto-open ruling after 1.11.0.

Process (from the map, wcpos/roadmap#202): landings on `next` follow /to-spec → /to-tickets.
Step 1: run /to-spec with the README build list, the language, and #214/#215 as the source. The spec's seams: the plugin REST (register, session, movements, closure) and the POS cart column (bar → open card → panel → count → closure sheet). Propose those two and confirm with Paul before publishing.
Step 2: run /to-tickets. Split along #215's order: (a) plugin records + REST, (b) app bar + user sheet + first sign-in bind/picker + Open register card, (c) Register panel + count + closure sheet + beats, (d) Reports Closures (Pro). Each ticket names its README items by number and carries the DoD from the WCPOS UI design rules: tablet + phone screenshots, testIDs on every control, reduce-motion honoured.
Step 3: implement, one ticket at a time, in a worktree branched from `origin/next` (pull first). Delegate implementation to Codex (`codex-implement`, `-m gpt-6-astra`, effort `high`, added-line budget stated); you review against the prototype captures and the design rules. Overlays use the batch-0 primitives already on `next` (`DialogContent side`, POS overlays slide from the products side via `usePOSOverlaySide()`; see memory `overlay-migration-in-flight-2026-09-11`). Cart tabs already exist in `packages/core/src/screens/main/pos/cart/tabs.tsx`; rehost them, don't rewrite.

Fixed points not to reopen: no Register menu item; no signed-out state; registers are never created on the device; the bar shows the store name, not the till amount; status pill only when the state is abnormal; the drawer icon opens the panel, the empty cart stays a cart; tabs top/bottom is a user setting, bottom default. Rejected: header variants A–D, idea 1 ("empty cart is the register"). Parked, ask Paul only if a ticket needs the answer: first-cash-sale auto-open (idea 2); Open tab on Closures / remote counting; where register settings live.

Before the first PR: batches 4a/4b of the overlay migration are still queued on `next` — check whether they block the panel, and if not, do not wait for them.
```
