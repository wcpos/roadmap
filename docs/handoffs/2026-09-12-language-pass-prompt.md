# Phase A — the language on six system screens (handoff prompt, 2026-09-12)

First session of the v1.11.0 UI overhaul program
(`wcpos/roadmap docs/design/2026-09-12-ui-polish-program.md`, *Order of work*, Phase A).
Paste the block below into a fresh Claude Code session opened in `/Users/kilbot/Projects/monorepo-v2`.
It reads the app there and writes prototypes into a roadmap worktree, as the register session did.

```
Run Phase A of the v1.11.0 UI overhaul: the new design language, prototyped on six system
screens, plus the token sheet. Nothing is implemented in this session.

Read first, in this order:
1. wcpos/roadmap docs/design/2026-09-12-ui-polish-program.md — the program. Phase A is yours.
   The three constraints (keep the learning, web/native may diverge, colour × scale axes) and
   the six screens are fixed.
2. wcpos/roadmap docs/design/ui-design-guidelines.md and .claude/rules/design.mdc here — the
   rules. Every prototype is judged by them; a screen that breaks one says so in its README.
3. wcpos/roadmap docs/prototypes/2026-09-11-register-page/ and
   docs/prototypes/2026-09-11-tender-pane-mockups/ — the decided structure and flow of the
   register and tender pane. Reskin them; do not restructure them.
4. apps/main/global.css — the current tokens (five colour themes, light and dark; rem-based
   text scale, web root at 87.5 %).
5. wcpos/roadmap docs/design/superseded/2026-05-redesign-kit/02-screen-inventory.md — the
   states each screen has. Rule 9: open the real screen in the app and inventory every state
   and string before drawing it.

Direction from Paul: the current design is not cohesive; the overhaul moves to a more modern
language. Look-at-all-day calm (Linear, Stripe dashboard, Notion, Shopify admin on Mobbin's
web side) with the POS-savvy of Fresha's web checkout and the register conventions in the
rules. Joy is speed, precision and a beat at completion, never decoration.

Deliverables, all in a roadmap worktree branched from origin/main:
- docs/prototypes/2026-09-12-language/ with one folder per screen: pos-register,
  orders, settings-tab, connect, receipt, products. Each has index.html (self-contained,
  double-click to open, no build), a dark strip of switches that is not part of the design:
  Width (phone 390 / tablet 1024 / desktop 1440), Theme (the five, light and dark), Scale
  (compact / regular / spacious), and a State jump for every state the inventory lists.
  shoot.js captures every width × state at default light and dark and at regular and
  compact scale, asserts no console errors. README.md states the question, the direction
  taken, the rejected alternatives, and the decisions it needs from Paul.
- docs/prototypes/2026-09-12-language/tokens/index.html — the token sheet: every colour
  theme's recalibrated values against every other, the three scale steps as concrete numbers
  (spacing unit, base font size, minimum tap target, radius), type scale, motion constants.
  One page; this is the north star for Phase C.
- docs/prototypes/2026-09-12-language/mobbin-notes.md — the coverage check run (bare app
  name, both platforms, deep mode) and the screens actually drawn from, with links.
- A decisions list at the top of docs/prototypes/2026-09-12-language/README.md: every call
  Paul has to make to close Phase A, each with the options and your pick.

Process:
- Before drawing, dispatch Codex read-only from this repo for the state and string
  inventory of each of the six screens (`codex exec -m gpt-6-astra -s read-only
  -c model_reasoning_effort="high" "<prompt>"`), one run per screen, batched by file
  overlap; write each result into the screen's README under "Inventory".
- Mobbin per the program's three rules. One named app per query. Record the coverage check.
- Draw the register first; it sets the language. Then orders, which stresses the table and
  the web/native split. Then the other four. Stop after the register and orders and show
  Paul the captures before drawing the rest; the language may move.
- Prototypes are taste work: draft them yourself (Fable or Opus), do not delegate the drawing.
  Delegate the shoot scripts and the inventory to Codex.
- One PR to wcpos/roadmap main per checkpoint (register+orders, then the rest), ready for
  review, with the tablet light and dark captures of each screen in the body so Paul can
  judge without opening the files. Draft while a checkpoint is incomplete.

Fixed points not to reopen: the register's structure and flow (#214); the tender pane grid,
keypad and fold (PR #259); primary is the theme accent, never red; system fonts; no shadows
for elevation; no hosted-only mockups; no confetti, mascots or emoji. Parked, ask Paul only if
a screen needs it: a fourth scale step for large displays; whether density is a context or a
prop; where the scale override lives in Settings.

Exit: Paul has ruled on the six screens and the token sheet. Then Phase B (the component map
and the behaviour ledgers) gets its own handoff.
```
