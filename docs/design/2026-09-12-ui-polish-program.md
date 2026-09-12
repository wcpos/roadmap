# v1.11.0 UI overhaul program — the language first, then the components (2026-09-12)

> **Charting survey for the wayfinder map [UI overhaul for 1.11.0](https://github.com/wcpos/roadmap/issues/282).**
> The map is canonical: its tickets are the decisions, its *Decisions so far* the record. This
> document is the pre-map plan the map was charted from. Read it once for context; where its
> phase order and the map disagree, the map wins. The gallery handoff it references is fog on
> the map until the component map is decided.

Paul's brief, 2026-09-12: 1.11.0 is a major UI change. The current design is not cohesive and
gets an overhaul to a more modern language. Go over every component, from the lowest primitive
to the whole screen, and apply intense design polish. The result is a high-performance point of
sale with one consistent language that follows industry usability standards and sparks joy.
Cashiers should love using it. Simple and intuitive on the surface, with complex customisation
one tap below it.

This document is the operating plan. It says what is fixed, the three constraints Paul set, the
order of work, the loop each unit goes through, and what is still to decide. It does not restate
the design rules; those live in [`ui-design-guidelines.md`](ui-design-guidelines.md) and the
monorepo's `.claude/rules/design.mdc`, and they bind every screen the overhaul produces.

## Fixed

- **The rules.** `docs/design/ui-design-guidelines.md` (PR #260, 2026-09-11). Primary is the
  theme accent, never red. System fonts, tabular numerals. Beats, not decoration. Touch first.
  The definition of done in there applies to every PR of this program.
- **Structure and flow of the register and the tender pane.** The register is a state of the
  POS screen plus one panel (wcpos/roadmap#214, tickets #268–#274); the tender pane's grid,
  keypad and fold (PR #259). What the cashier does and in what order is decided. How it
  *looks* is not: both get reskinned by the language pass below. Their landing tickets keep
  moving on `next` because the checkout scope is due 2026-09-18; the reskin lands as a token
  and primitive change on top, which is the reason the primitives are built the way section
  *Order of work* says.
- **The process.** Prototype as self-contained HTML on disk, states switchable in the page,
  Playwright captures beside it. Decide in a roadmap issue or the prototype README.
  `/to-spec`, `/to-tickets`, Codex implements on `next` in a worktree, Claude reviews against
  the captures and the rules. Hosted-only mockups are rejected; Paul opens files, not links.
- **The lane.** Everything lands on `next` and ships as 1.11.0 (wcpos/roadmap#195).

## Three constraints (Paul, 2026-09-12)

### 1. Keep the learning in the existing components

The 59 primitives in `packages/components/src` wrap `@rn-primitives/*` and carry years of
cross-platform fixes and feedback-driven customisation. The overhaul replaces their *skin*, not
their *behaviour*. Concretely:

- Every component gets a **behaviour ledger** before it is touched: the fixes and
  customisations it carries, each with its evidence (the commit, the issue, the comment in the
  code, the platform it protects). Codex builds the ledger read-only from history and source;
  Claude checks it against the component. A rebuilt component is not done until every ledger
  line is either preserved or struck with a stated reason.
- The `@rn-primitives` layer stays as the behavioural base unless a ledger shows it is the
  cause of a problem. New skin, same hooks.
- The ledger is a section of the component's contract page, so the PR and the reviewer see it.

### 2. Web and native may diverge where the experience is better

Eight components already have `.web.tsx` files (tooltip, select trigger, virtualized list,
toast, collapsible, keyboard controller, webview, image). The pattern is Metro platform
extensions, and it is allowed anywhere the contract says so. The test is the experience, not
convenience:

- Split when the two platforms have different idioms for the same job: a data table on the web
  is a real table with column resize, keyboard and hover; on a tablet it is rows and sheets.
  Menus and popovers on the web, sheets on a phone. Date and time pickers. Anything that leans
  on hover or a pointer.
- Do not split for styling differences; those are tokens and the scale axis.
- The contract records the decision (`platform split: none | web/native`, with the reason) and
  the gallery captures both.

### 3. Two theme axes: colour, and scale

Colour themes exist (default, ocean, sunset, monochrome, each light and dark, plus system).
They stay, get recalibrated to the new language, and remain the user's choice. The overhaul
adds a **second, independent axis: scale.** A phone needs tighter padding and smaller type; a
32-inch counter monitor needs more space and larger type, or the same layout looks lost.

- **Named steps, not a slider:** `compact`, `regular`, `spacious`, with a possible fourth for
  large displays if the prototypes show `spacious` is not enough. Each step sets the spacing
  unit, the base font size, the minimum tap target and the radius.
- **Auto by default, user override in Settings.** Auto picks from the width class and the
  pointer type (coarse or fine). A window width cannot tell a 27-inch 4K screen from a
  13-inch laptop, so the override is not optional; it is the honest control.
- **Scale is the user's knob; surface density stays the designer's.** The cashier grid, the
  orders table and a settings form still differ in density within a scale step. The two
  multiply; they do not replace each other.
- **Mechanism is a spike, not a decision.** Uniwind's themes are one flat list switched by a
  single name, so scale cannot be a second Uniwind theme without fifteen combined blocks. Text
  sizes are already rem-based with the web root at 87.5 %, so on the web a scale step can be a
  root font-size plus a spacing variable; on native it needs a mechanism the spike finds
  (a CSS variable set per scale, or a context that the primitives read). The spike answers
  this before the token pass and is the first monorepo ticket after the language pass.

## Order of work

The old order (gallery first, then polish bottom-up) was wrong for an overhaul: a gallery of
the current library is a safety net for keeping a design, not for changing one, and every
baseline turns red at the first token change. The language comes first, the component list is
derived from it, and the gallery is built for the new list.

### Phase A — the language, on system screens

Prototype a small set of screens that between them exercise every kind of component, in the
new language, tablet and phone, light and dark, at two scale steps. These are the **system
screens**:

| Screen | What it exercises |
|---|---|
| POS register, columns and tabs | Grid, cart lines, the bar and panel, tender tiles, numpad, beats. Structure decided; reskinned here. |
| Orders list and one order | Data table (web) and rows (native), filters, status, money columns, detail pane, actions. |
| One Settings tab | Forms: inputs, selects, switches, help text, sections, save and dirty state. |
| Connect and first run | Onboarding, empty states, the one marketing-adjacent moment, errors in plain words. |
| Receipt and print | Overlay flow, preview, primary print action, share, a completion beat. |
| Products grid with a variation picker | Tiles, images, search, the sheet on phone and the popover on web. |

Each prototype follows the existing folder shape under `docs/prototypes/` with the addition of
a **scale switch** (compact, regular, spacious) beside the width and theme switches. The pass
also produces the token sheet: the recalibrated colour themes and the scale steps as concrete
values, in one HTML page that shows every token against every other.

Exit: Paul has decided the language on the six screens and the token sheet. Rejected
directions are recorded in each README so they are not proposed again.

### Phase B — extract the component list

From the decided prototypes, a map from the 59 current components to the new set, one line
each: **keep · restyle · merge · split (web/native) · replace · delete · new**, with the reason.
Inputs: the prototypes, the behaviour ledgers, and a **usage census** of the current library
(where each component is used, how often, with which props), built by Codex read-only. The
map is the contracts list and the ticket list. It also settles which learned behaviours have
nowhere to go and need Paul's word before they are dropped.

Exit: the map is in `docs/design/component-map.md` and Paul has ruled on every merge, replace
and delete.

### Phase C — tokens and the scale spike

Land the recalibrated colour themes and the scale mechanism on `next`, both axes wired to
Settings, before any component is rebuilt. The register and tender pane pick up the new
tokens here. This is the one change that touches every screen at once, so it lands alone.

### Phase D — rebuild bottom-up, gallery alongside

Components in dependency order, each with a contract page written first, each rebuilt on its
ledger, each captured in the gallery as it lands. The gallery (handoff:
[`docs/handoffs/2026-09-12-component-gallery-prompt.md`](../handoffs/2026-09-12-component-gallery-prompt.md))
is scoped to the new list and grows with it; baselines exist only for rebuilt components, at 1×,
default light and dark, one scale step.

| Tier | Components (current names; the map renames) |
|---|---|
| 1 Atoms | text, icon, pressable, hstack, vstack, loader, image, logo, label, format (money, dates), sort-icon |
| 2 Controls | button, icon-button, input, textarea, numpad, checkbox, switch, toggle, toggle-group, radio-group, slider, select, combobox, calendar, badge, status-badge, avatar, progress, tooltip, docs-link |
| 3 Containers and overlays | card, list-item, accordion, collapsible, tabs, table, data-table, virtualized-list, tree, tree-combobox, tree-select, dialog, alert-dialog, modal, popover, hover-card, dropdown-menu, toast, panels, portal, form, keyboard-controller, dnd, error-boundary, suspense, print, webview |
| 4 Composed | `packages/core/src/components`: cart line, product tile, order row, customer row, register bar and panel, tender tiles, empty states |

### Phase E — screens

Every screen, in the May inventory's P0–P3 order (`superseded/2026-05-redesign-kit/02-screen-inventory.md`;
the order still holds), re-hosted on the rebuilt components. The six system screens are
already designed and go first; the rest apply the language.

## The loop — one component or one screen at a time

1. **Inventory the real thing.** Every state, every string, every place it is used, and its
   behaviour ledger. Codex, read-only. A prototype of a simplified version evaluates a straw man.
2. **References.** Mobbin per the three rules below, the reference corpus, the rule's competitor
   list. Notes go in the prototype folder.
3. **Prototype.** HTML on disk, states switchable, captures beside it. Claude (Fable or Opus)
   drafts; this is the taste step. For a primitive in Phase D the prototype is its gallery page.
4. **Decide.** Paul. Rejected ideas recorded.
5. **Spec and tickets.** `/to-spec` then `/to-tickets`. Each ticket names its contract page and
   carries the definition of done from the rules.
6. **Implement.** Codex on `next` in a worktree, `-m gpt-6-astra`, effort `high`, added-line
   budget stated. Claude reviews against the captures, the contract, the ledger and the rules.
7. **Gate.** Every ledger line preserved or struck with a reason; gallery diff green or
   explained; tablet and phone screenshots of changed states; both themes; two scale steps;
   budgets green; testIDs present.

## Contracts

One page per component under `docs/design/components/<name>.md`, written in Phase D before the
ticket, cited by the ticket and the PR:

| Field | What it pins |
|---|---|
| Job | One sentence. What the cashier or merchant does with it. |
| Map line | keep / restyle / merge / split / replace / new, from the Phase B map. |
| Behaviour ledger | Every learned fix and customisation, with evidence; preserved or struck with a reason. |
| Platform split | none, or web/native with the reason. |
| Variants and sizes | The closed list. |
| States | default, pressed, focused, disabled (with its reason shown), loading, error, selected, long text. |
| Scale steps | Values at compact, regular, spacious. |
| Surface density | cashier / merchant / admin within a scale step. |
| Tokens | Semantic tokens only. No hex, no `oklch()` in the component. |
| Motion and beat | Durations, easing, the completion beat, reduce-motion. |
| Touch | Minimum target, gap, pressed feedback within 100 ms. |
| Copy | Label rules, German length, Spanish plurals. |
| testIDs | Stable names for every interactive part. |
| Gallery cells | The cells the gallery must render. |

## Tools

**Mobbin, yes, at the reference step, with three rules.** Business tools are indexed under the
**web** platform; the iOS entry under the same brand is the consumer app. Fresha (web) has a
complete POS checkout; Shopify admin (web) has Point of Sale, Register sessions and Create
order; Square (web) is the dashboard. Genuinely absent, checked 2026-09-12 by bare app name in
deep mode: Square POS, Zettle, SumUp, Lightspeed, Toast, Loyverse, Clover, Vend.

1. One screen or one journey per query. One named app per query. No keyword lists, no
   negations, no combined intents.
2. Coverage check before any "not on Mobbin" claim: bare app name, both platforms, deep mode.
   Record it in the prototype's `mobbin-notes.md`.
3. Look at the images. Sixty requests a minute; small `limit` values.

**Reference corpus.** `docs/design/references/`: our own tablet and phone captures of Square
POS, Shopify POS, Lightspeed, SumUp, Zettle and Toast, one folder per app, one file per job
(`checkout-tender.png`, `register-close.png`). Paul takes these; agents pull what the vendors'
help centres show. For a "more modern" language the look-at-all-day references (Linear, Stripe
dashboard, Notion, Shopify admin) are on Mobbin's web side.

**Claude Design, not now.** Hosted output; does not render `@wcpos/components`; the HTML loop
already works. Revisit after Phase D has a gallery that could feed it real previews.

**Performance budgets, measured.** From the rules and from what a cashier notices; a budget
script grows out of `apps/main/e2e/cart-add-timing.ts` and runs on the web build in CI from
Phase C on.

| Moment | Budget |
|---|---|
| Tap to visible pressed state | under 100 ms |
| Product tile tap to the line in the cart | under 150 ms on the web build |
| Transition or sheet open | 150–250 ms, nothing over 400 ms on a waiting path |
| Product grid and cart scroll | no dropped frames at 1,000 products |
| Search keystroke to filtered results | under 100 ms per keystroke |

## Roles

- **Fable** orchestrates: the language pass, contracts, review, merge decisions, anything the
  cashier reads. **Opus** where Fable is overkill.
- **Astra** implements: ledgers, the census, the scale spike, every ticket. `/codex-review` as
  the second opinion.
- **Paul** decides at the end of Phase A and Phase B, rules on dropped behaviours, and takes
  the corpus captures.

## Superseded — the May redesign kit

`~/Projects/redesign/` (2026-05-02) is preserved under
[`superseded/2026-05-redesign-kit/`](superseded/2026-05-redesign-kit/README-SUPERSEDED.md).
Overruled: brand red as primary, soft shadows, claude.ai/design as the tool, the nine-phase
one-per-release rollout. Still used: the screen inventory order, the component audit's gaps,
the three-surface density idea.

## Open decisions

1. **Scale steps: three or four.** Three named steps with auto-pick; a fourth only if the
   Phase A prototypes show a 32-inch display needs more than `spacious`. Recommend three until
   the prototype says otherwise.
2. **Density as a surface context or a prop.** Recommend context set once per screen area with
   a prop override, so a cashier surface cannot forget to opt in.
3. **Gallery baselines in the monorepo or a sibling repo.** Recommend the monorepo at 1×,
   default light and dark, one scale step.

## Next

Phase A. Handoff prompt:
[`docs/handoffs/2026-09-12-language-pass-prompt.md`](../handoffs/2026-09-12-language-pass-prompt.md).
