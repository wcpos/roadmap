# v1.11.0 UI polish program — every component, one language (2026-09-12)

Paul's brief, 2026-09-12: 1.11.0 is a major UI change. Go over every component, from the
lowest primitive to the whole screen, and apply intense design polish. The result is a
high-performance point of sale with one consistent design language that follows industry
usability standards and sparks joy. Cashiers should love using it. Simple and intuitive on the
surface, with complex customisation one tap below it.

This document is the operating plan for that work. It says what is already decided, what the
tools are for, what is still missing, the loop each unit of work goes through, and the order of
the sweep. It does not restate the design rules; those live in
[`ui-design-guidelines.md`](ui-design-guidelines.md) and the monorepo's `.claude/rules/design.mdc`.

## Already decided — do not reopen

- **The rules.** `docs/design/ui-design-guidelines.md` (PR #260, 2026-09-11) and the monorepo
  rule that mirrors it. Primary is the theme accent, never red. Flat surfaces, hairline borders,
  one radius. System fonts, tabular numerals. Beats, not decoration. The definition of done is
  in there and applies to every PR this program produces.
- **The hero screen.** The register is a state of the POS screen plus one panel
  (`docs/prototypes/2026-09-11-register-page/`, wcpos/roadmap#214, landing tickets #268–#274).
  The tender pane is reworked (`docs/prototypes/2026-09-11-tender-pane-mockups/`, PR #259,
  slices landing on `next`). The design language is therefore set by two decided screens before
  the bottom-up sweep starts. The sweep applies that language; it does not invent a new one.
- **The process.** Prototype as self-contained HTML on disk, states switchable in the page,
  Playwright captures beside it. Decide in a roadmap issue. `/to-spec`, then `/to-tickets`,
  then Codex implements on `next` in a worktree and Claude reviews against the captures and the
  rules. Hosted-only mockups are rejected; Paul opens files, not links.
- **The lane.** Everything lands on `next` and ships as 1.11.0 (wcpos/roadmap#195, due
  2026-09-18 for the checkout scope; the polish sweep runs on past that date on the same lane).
  Overlay primitives are already on `next` in batches (`DialogContent side`, POS overlays from
  the products side, the phone sheet shell).

## Superseded — the May redesign kit

`~/Projects/redesign/` (2026-05-02, never in git) is preserved under
[`superseded/2026-05-redesign-kit/`](superseded/2026-05-redesign-kit/README.md) and is no
longer a source of truth. What it got wrong against the September rulings: brand red as the
primary accent; soft shadows for elevation; claude.ai/design as the drafting tool; and a
nine-phase, one-component-per-release rollout. 1.11.0 is one release. What still holds and
was lifted into this program: the screen inventory with its priority order, the component
audit's gap list, and the three-surface idea (cashier, merchant, admin) as density tiers.

## Tools — verdicts

**Mobbin, yes, at the reference step, with three rules.** Checked 2026-09-12 against the docs
and by query. Business tools are indexed under the **web** platform; the iOS entry under the
same brand is the consumer app. Fresha (web) has a complete POS checkout: cart column, Cash /
Gift card / Split payment tiles, split-payment numpad with preset chips, tip picker, *Save
unpaid*, sale activity. Shopify admin (web) has Point of Sale, Register sessions and Create
order. Square (web) is the back-office dashboard. Genuinely absent, checked by bare app name in
deep mode: Square POS, Zettle, SumUp, Lightspeed, Toast, Loyverse, Clover, Vend.

1. One screen or one journey per query, phrased as what you would see. One named app per
   query. No keyword lists, no negations, no combined intents.
2. Coverage check before any "not on Mobbin" claim: bare app name, both platforms, deep mode.
   Record the check in the prototype's `mobbin-notes.md`.
3. Look at the images. Metadata says nothing about what a screen contains. Sixty requests a
   minute is the limit; small `limit` values keep the context readable.

**Claude Design, not now.** Its output is hosted; Paul cannot reliably open claude.ai links and
the rule already rejects hosted-only mockups. It does not render `@wcpos/components`, so every
mockup drifts from the library being polished. The HTML-on-disk loop produced a decided register
in a week. Revisit once the component gallery exists: the design-system sync tool can push the
gallery's rendered previews into a Claude Design project so its mockups use the real primitives.
Until then it would be a second source of truth. The `/design` canvas skill inside Claude Code
publishes an Artifact and is out for the same reason.

**HTML prototypes on disk, yes.** Unchanged. Folder per prototype under `docs/prototypes/`,
dated, with `index.html` (states switchable in the page), `shoot.js` (Playwright captures,
asserts the flow, fails on console errors), `mobbin-notes.md`, and a README that states the
question the prototype answers and the decision it produced.

## Missing — the four pieces this program adds

### 1. A component gallery that renders the real library

There are 59 primitives in `packages/components/src`, five themes (default, ocean, sunset,
monochrome, plus system) in light and dark, and no Storybook, no snapshot, no place to see a
component's variants side by side. The e2e suite already builds and serves the web app for
Playwright. The gallery is a route in that web build that renders every component × variant ×
state, switchable by theme and by width (phone 390, tablet 1024, desktop), with a Playwright
script that captures each cell and compares against committed baselines.

It is the workbench for the whole sweep: review captures for every polish PR, visual-regression
baselines so a token change cannot silently reshape a screen, and the previews Claude Design
would need if it is ever adopted. Handoff prompt:
[`docs/handoffs/2026-09-12-component-gallery-prompt.md`](../handoffs/2026-09-12-component-gallery-prompt.md).

### 2. A contract per component

One page per component under `docs/design/components/<name>.md`, written before its polish
ticket and cited by the ticket and the PR. Fields:

| Field | What it pins |
|---|---|
| Job | One sentence. What the cashier or merchant does with it. |
| Variants and sizes | The closed list. Anything else is a new variant with a stated reason. |
| States | default, pressed, focused, disabled (with the reason shown), loading, error, selected, long text, RTL where relevant. |
| Surface density | cashier / merchant / admin: padding, font size, tap target for each. |
| Tokens | The semantic tokens it uses. No hex, no `oklch()` in the component. |
| Motion and beat | Durations, easing, the completion beat if it has one, reduce-motion behaviour. |
| Touch | Minimum target, gap to neighbours, pressed feedback within 100 ms. |
| Copy | Label rules, translation length check (German length, Spanish plurals). |
| testIDs | Stable names for every interactive part. |
| Gallery cells | The variant × state cells the gallery must render. |

The May component audit's gap list (`superseded/2026-05-redesign-kit/03-component-audit.md`,
sections *Gaps* and *Inconsistencies*) is the starting inventory of what the contracts must
resolve.

### 3. A reference corpus

`docs/design/references/`: our own captures of Square POS, Shopify POS, Lightspeed, SumUp,
Zettle and Toast on tablet and phone, one folder per app, one file per screen named by the job
(`checkout-tender.png`, `register-close.png`). Paul takes these on the iPad and phone; agents
pull what the vendors' public help centres show. Mobbin links go in each prototype's notes,
not here. The rule's tie-breaker is the cashier's expectation, and this corpus is how a
prototype shows what that expectation is.

### 4. Performance budgets, measured

A polish pass that slows the till is a regression whatever it looks like. Budgets, from the
rules and from what a cashier notices:

| Moment | Budget |
|---|---|
| Tap to visible pressed state | under 100 ms |
| Tap on a product tile to the line appearing in the cart | under 150 ms on the web build |
| Transition or sheet open | 150–250 ms, nothing over 400 ms on a waiting path |
| Product grid and cart scroll | no dropped frames at 1,000 products |
| Search keystroke to filtered results | under 100 ms per keystroke |

`apps/main/e2e/cart-add-timing.ts` exists; extend it into a budget script that runs on the web
build in CI and fails a PR that breaks a budget. Native is spot-checked on the dev client, not
gated, because builds cost money.

## The loop — one component or one screen at a time

1. **Inventory the real thing.** Every state, every string, every place it is used. Codex,
   read-only, writes the inventory into the contract page. A prototype of a simplified version
   evaluates a straw man.
2. **References.** Mobbin per the three rules, the corpus, and the rule's competitor list.
   Notes go in the prototype folder.
3. **Prototype.** HTML on disk, states switchable, captures beside it. Claude (Fable or Opus)
   drafts; this is the taste step. For a primitive the prototype is its gallery page, not a
   separate HTML file.
4. **Decide.** Paul, in the roadmap issue or the prototype README. Rejected ideas are recorded
   so they are not proposed again.
5. **Spec and tickets.** `/to-spec` then `/to-tickets`. Each ticket names its contract page and
   carries the definition of done from the rules.
6. **Implement.** Codex on `next` in a worktree, `-m gpt-6-astra`, effort `high`, added-line
   budget stated. Claude reviews against the captures, the contract and the rules.
7. **Gate.** Gallery diff green or the diff is explained in the PR body; tablet and phone
   screenshots of changed states; budgets green; testIDs present; both themes checked.

## Sweep order

Tokens first, then primitives in dependency order, then composed components in
`packages/core`, then screens. A primitive is not "done" until every component above it that
uses it has been re-captured in the gallery.

| Tier | Components |
|---|---|
| 0 Tokens | `apps/main/global.css`: the five themes, light and dark, radius, spacing, motion constants |
| 1 Atoms | text, icon, pressable, hstack, vstack, loader, image, logo, label, format (money, dates), sort-icon |
| 2 Controls | button, icon-button, input, textarea, numpad, checkbox, switch, toggle, toggle-group, radio-group, slider, select, combobox, calendar, badge, status-badge, avatar, progress, tooltip, docs-link |
| 3 Containers and overlays | card, list-item, accordion, collapsible, tabs, table, data-table, virtualized-list, tree, tree-combobox, tree-select, dialog, alert-dialog, modal, popover, hover-card, dropdown-menu, toast, panels, portal, form, keyboard-controller, dnd, error-boundary, suspense, print, webview |
| 4 Composed | `packages/core/src/components`: the cart line, product tile, order row, customer row, the register bar and panel, the tender tiles, the empty states |
| 5 Screens | Register and checkout (decided, landing), receipt, orders, products, customers, coupons, reports, settings tabs, health, support, connect and auth |

Screen priority within tier 5 follows the May inventory's P0–P3 order; it is still right.

## Roles

- **Fable** orchestrates: contracts, prototypes, review, merge decisions, anything the cashier
  reads. **Opus** where Fable is overkill.
- **Astra** implements: inventories, the gallery, the budget script, every ticket. Reviews as
  a second opinion via `/codex-review`.
- **Paul** decides at step 4 and takes the corpus captures. Nothing else in the loop needs him.

## Open decisions

1. **Gallery baselines in the monorepo or a sibling repo.** Committed PNGs grow the repo; a
   sibling `wcpos/gallery-baselines` keeps it clean but adds a second checkout to CI. Recommend
   the monorepo at 1× for the default light and dark pair only, the other themes captured for
   review and not committed.
2. **Density tiers as a component prop or as a surface context.** A prop is explicit and
   greppable; a context means a screen sets it once. Recommend context, with the prop as an
   override, so a cashier surface cannot forget to opt in.

## Next

Open a fresh session in the monorepo with the gallery handoff prompt. The gallery is the first
PR of the program; the token pass and the tier 1 contracts follow it.
