# The direction for the 1.11.0 UI overhaul

> Resolves [Decide the direction](https://github.com/wcpos/roadmap/issues/283) on the wayfinder map
> [UI overhaul for 1.11.0](https://github.com/wcpos/roadmap/issues/282). Decided with Paul,
> 2026-09-12. **Every prototype ticket draws from this page.** Where it and the charting survey
> disagree, this page wins; where it and
> [the design guidelines](https://github.com/wcpos/roadmap/blob/main/docs/design/ui-design-guidelines.md)
> disagree, the guidelines win and this page is wrong.

## In one line

**A calm instrument that is already where you're going, in two postures.**

---

## 1. What is actually incohesive

Source audit of the six screens on `next` (HEAD `23f07bd`), every distinct value counted with
`file:line`: [design cohesion audit](https://github.com/wcpos/monorepo/blob/research/design-cohesion/.claude/research/2026-09-12-design-cohesion-audit.md).
It is a **frozen source audit — no screenshots, no runtime**. Hit rectangles, contrast and browser
zoom are unverified; the visual walk happens per screen inside the prototype tickets.

**The verdict is narrower than "the design is not cohesive" suggests: partially incoherent, not six
unrelated designs.** The foundations are sound and the fractures are concentrated. Scatter ranking,
worst first:

| | Axis | What was measured |
|---:|---|---|
| 1 | **Control shapes** | 51 dimensional forms; control heights from `h-6` to `h-14`. The biggest touch inconsistency. |
| 2 | **Feedback states** | Six coexisting treatments for waiting and failing: blank Suspense, explicit Loader, progress, muted bars, status badges, inline text. |
| 3 | **Type** | 16 size utilities, 4 weights, **19 arbitrary-pixel declarations**; the calendar carries its own numeric scale. |
| 4 | **Radius** | 16 utility forms across 8 radius families. |
| 5 | **Borders and elevation** | **4 shadow strengths in reachable UI — against a flat-surface rule.** |
| 6 | Overlays | 12 presentation families, though several are shared primitives or platform adaptations. |
| 7 | Spacing | 87 forms but only 17 values, and **37% of all 687 declarations are just `gap-2`, `gap-4`, `p-2`, `gap-1`**. |
| 8 | Colour | **950 semantic declarations** dominate; raw-colour exceptions are bounded and enumerable. |
| 9 | Icons | One family, one 8-step size scale. Largely coherent already. |

### The four findings that change the plan

1. **The shared form-control core is consistent and wrong.** Input, Button, Select and Combobox all
   default to `h-10` / `rounded-md`. `global.css` does not override `--spacing`, so Tailwind's
   0.25rem default stands and `h-10` = `calc(var(--spacing) * 10)` = **40 native units against the
   guidelines' 44 pt floor** (`ui-design-guidelines.md:62`); Button's `sm` and `compact` sizes are
   `h-9` = 36 (`packages/components/src/button/index.tsx:119-120`). So the most-touched controls in
   the app miss the touch minimum *by default*, everywhere, identically — verified independently of
   the audit. That is a one-line fix with app-wide reach, and it
   is the single highest-leverage change in the overhaul. It also lands squarely on the scale axis:
   the compact step needs a floored tap-target token so it cannot make this worse.
2. **Shadows exist despite the flat-surface rule.** Orders rests in a `shadow-md` Card while General
   settings is a flat View — two competing surface grammars on adjacent screens. Removing elevation
   is already mandated by the guidelines; the audit says where.
3. **Spacing is a red herring.** 87 utility forms looks alarming and isn't: the distribution is
   strongly concentrated and both stacks already share one 8-step gap mapping. A new spacing system
   is *not* the first lever, and the token sheet should not pretend otherwise.
4. **Colour is already disciplined** — one semantic pipeline, 950 declarations. The exceptions are
   countable: a hardcoded `#F0F4F8` full-surface bypass on the splash screen, receipt-warning and
   camera-overlay colours, and the receipt paper (deliberate — paper must stay paper).

### The shape of the work this implies

The overhaul is **mostly a change of shared defaults plus a states pass**, not a rewrite. Change
`h-10` and `rounded-md` once in the form-control core rather than restyling six screens; unify the
six feedback treatments; strike the arbitrary-pixel type declarations; remove the shadows. That is a
much smaller and much safer change than "go over every component", and it is what the component map
ticket should be built on.

**Do not touch** (the audit's K list — already coherent, and load-bearing): the semantic colour
pipeline and its light/dark contract; the `Text` base-plus-context mechanism that Button and the
other controls inherit from; the single icon family and its 8 shared sizes; the HStack/VStack gap
mapping; the shared `ErrorBoundary` fallback.

**Hardest to unify** (the L list — these go straight to the platform-split ticket, not the
prototypes): the overlay/navigation seam, where Dialog owns local state but Modal closes navigation
and native Modal preserves Fabric view ownership across route transitions; the vendored calendar's
own theme API and the native Toggle size overrides; and receipt paper versus app chrome, where
changing document typography crosses into print-output ownership.

## 2. The five adjectives

These are the words a prototype is judged against. A screen that cannot be described by them is
off-direction, whatever else is good about it.

| | | |
|---|---|---|
| **Calm** | Flat surfaces, hairline borders, one accent, no competing marks. Nothing on screen is louder than the thing you are about to press. | A cashier looks at this for eight hours. |
| **Quick** | The app is already where you're going: focus pre-placed, next action pre-selected, no confirm on the happy path. | This is where the joy lives — see §3. |
| **Precise** | Tabular numerals, exact alignment, a tap that lands where it was aimed, money that never reflows. | It handles money. Sloppy reads as untrustworthy. |
| **Two postures** | One language that tightens for a counter tablet and opens out for a 32-inch desk — same tokens, different scale step. | Constraint 3. The scale axis already carries it. |
| **Deep on demand** | Every surface's configuration is one press away, anchored to that surface, never covering the work. | "Complex customisation just below the surface." |

---

## 3. The feel, and what it is not

**Calm instrument with a touch posture.** One palette, one set of hairlines, one radius. The
difference between a counter tablet and a desk monitor is *scale*, not a different design: at the
compact step rows are 56 pt and labels carry more weight; at spacious they are 36 pt and lighter.
Nothing else changes.

This was chosen over a single desk-calm posture (grey-on-grey at arm's length under fluorescents
is slower to hit, and cashiers work at arm's length) and over a high-contrast tool throughout
(chunky on the desktop, where the merchant does admin).

```
DESK (spacious)            COUNTER (compact)
┌──────────────┐           ┌──────────────┐
│ Flat white   │           │ Flat white   │
│ 1px hairline │           │ 1px hairline │
│ 13px regular │           │ 15px medium  │
│ 36pt rows    │           │ 56pt rows    │
│ accent: rare │           │ accent: rare │
└──────────────┘           └──────────────┘
        same tokens, two postures
```

### What colour does

Constraint 3 keeps the five colour themes, but a rare accent would make them invisible. The ruling:

- **The theme tints the controls** — buttons, focus rings, selected rows, links.
- **The theme tints one structural surface** — the nav rail (`--color-sidebar`), at low
  saturation. A glance says which theme is on.
- **The working surface stays neutral.** No coloured panels, no tinted table bodies, no
  theme-coloured cards.
- **Status colours are a fixed semantic set and never move with the theme.** Paid, unpaid,
  partially paid, refunded, failed, low stock, out of stock, syncing, offline. Unpaid means the
  same thing in every shop and in every theme. Shopify admin's treatment is the reference: a
  coloured **dot plus a text label**, not a filled pill — calmer, and it survives colour blindness
  and a monochrome receipt printer.
- **Red is destructive only.** Unchanged from the guidelines; brand red is never primary.

---

## 4. Where the joy is

**Anticipation.** The joy budget goes on the tap the cashier did not have to make. This is the
thing we design deliberately, measure, and defend in review.

```
Scan    → line added, qty focused, Enter ready
Type    → search focused, no click needed
Tender  → exact amount pre-filled, Enter = done
Print   → no dialog, the receipt goes
```

Consequences that bind every component spec, not just screens:

- **Focus is part of the design.** Every screen states where focus lands on open, where it goes on
  submit, and what Enter does. A component with no focus story is unfinished.
- **Scanner input is captured wherever you are**, not only when a field is focused.
- **No confirm dialog on the happy path.** Confirmation is for destruction, not for completion.
- **Nothing is ever lost** — an interrupted sale survives a reload, a crash, a tab switch.

Beats still exist and still follow the guidelines (150–250 ms, nothing over 400 ms on a waiting
path), but they are the *second* call on the budget: the total settling, change due resolving, the
Paid stamp, a haptic on native. Everything else is still. **Decorative motion is out** — no
sliding rows, no ticking numbers, no gliding tabs. Each of those is time a cashier waits.

---

## 5. How depth arrives

The affordances already exist — `UISettingsDialog` behind a `sliders` icon on POS, products,
orders, coupons, customers and reports; `ellipsisVertical` row menus on every list; a `gear` to
Settings. Nothing new is being added. What changes is **how the depth arrives**:

- **Surface configuration is anchored to the surface it configures** — a panel by the control that
  opened it, with the rows still visible and updating live behind it. You tick a column and watch
  it appear. Today it is a centred modal that hides the very thing being configured.
- **Row actions stay anchored popovers.** Unchanged.
- **A full modal is reserved for app-wide or destructive things.** Not for six checkboxes.

```
┌────────────────────────────┐
│ Products            ≡▾     │
├──────────────┌───────────┐ │
│ SKU  Name    │ ☑ SKU     │ │  ← anchored
│ A-1  Coffee  │ ☑ Name    │ │
│ A-2  Tea     │ ☐ Stock   │ │
│ A-3  Cup     └───────────┘ │
│ rows still visible + live  │
└────────────────────────────┘
```

This is the single largest overlay change in the overhaul and it feeds directly into the
platform-split ticket: an anchored panel on a phone has nowhere to anchor, so phone almost
certainly falls back to a sheet. That is a split to rule on, not to assume.

---

## 6. Icons

135 FontAwesome **solid** glyphs, vendored as SVGR components under
`packages/components/src/icon/svg/fontawesome/solid`, sized by `size-*` classes that already
resolve through `--spacing` — so they ride the scale axis for free.

**Ruling: re-export the same 135 glyphs at regular or light weight.** Filled icons are the
heaviest mark on a hairline monochrome screen — heavier than the text they label — and every
reference app uses line weight. Every icon name stays identical, so no call site changes; the
existing `svg` script in `packages/components/package.json` points at a new source directory.

The licence question is already answered: `cash-register.svg`, `chart-mixed-up-circle-dollar.svg`,
`badge-percent.svg` and `heart-pulse.svg` are Pro-only glyphs and they are vendored here, so the
licence is FontAwesome Pro and the regular, light and thin weights are covered.

Lucide was considered and rejected for now: better coverage and an MIT licence, but `cashRegister`
and `chartMixedUpCircleDollar` have no clean equivalent and it costs a 135-name remap for a
tonal change the weight swap already delivers.

---

## 7. The out-list

Carried from [the guidelines](https://github.com/wcpos/roadmap/blob/main/docs/design/ui-design-guidelines.md):

- No glassmorphism, no gradients, no drop shadows for elevation. Flat surfaces, hairline borders.
- No mascots, no confetti, no emoji in the product UI.
- Brand red is destructive only; primary is the theme accent.
- No hosted-only mockups. Prototypes are HTML on disk with switchable states and captures beside them.
- More than one radius, more than one border colour, more than one type scale.

New, from this direction:

- **No filled or solid icons.** Line weight only.
- **No theme-derived status colours.** The semantic set is fixed across all five themes.
- **No coloured working surfaces.** Theme colour reaches the controls and the rail, nothing else.
- **No full-screen modal for surface-scoped configuration.**
- **No decorative motion.** Motion is state change and the completion beat; nothing else moves.
- **No confirm dialog on the happy path.**
- **No component without a focus story.** Where focus lands and what Enter does is part of the spec.

---

## 8. The reference set

Checked by bare app name on both platforms in deep mode (the coverage rule). Business tools are
web captures; the iOS entry under the same brand is the consumer app.

**The resting state — calm, hairline, anchored depth:**

1. [Linear — display options popover](https://mobbin.com/screens/815793b1-5c75-43ac-94c7-93380781e337) —
   *the* canonical anchored configuration panel. Grouping, ordering, and display properties as
   chips, with the list live behind it. This is §4 built.
2. [Linear — list with a properties panel](https://mobbin.com/screens/212fda35-366e-4dc0-a1d1-3b679659d6ab) —
   calm list plus persistent right-hand detail; the model for an order opened beside the list.
3. [Linear — filter popover](https://mobbin.com/screens/ed670cda-0527-4716-a1a6-0159f12c4f42) —
   how a deep filter tree stays quiet.
4. [Stripe — Edit columns popover](https://mobbin.com/screens/d1ccc54c-679b-406f-893a-8c18cb5690f3) —
   anchored column configuration on a money table, with drag handles. Closest single screen to
   what the orders and products tables need.
5. [Stripe — status filter and badges](https://mobbin.com/screens/373146e1-8686-43b0-8a10-5da707dc8873) —
   fixed status semantics, filter chips, and a summary strip above a money table.
6. [Shopify admin — orders list](https://mobbin.com/screens/ab8ef727-62cf-4f84-a193-a5b943c95f8b) —
   the dot-plus-label status treatment this direction adopts, on a commerce orders table with two
   independent status axes (payment and fulfilment), which is exactly the WCPOS orders problem.
7. [Plane — display properties panel](https://mobbin.com/screens/ad2bc791-b849-44e0-87e1-c14af5f54c29) —
   a second, denser take on the same anchored panel; useful for the compact step.

**The touch posture — POS conventions from a real business app:**

8. Fresha web checkout, three flows:
   [Checking out a service](https://mobbin.com/flows/e0f7c390-5f07-4ea8-9b82-7d311d71f81b),
   [Adding a sale](https://mobbin.com/flows/baea22c6-be8a-4d03-8132-e60af499f538),
   [Selling a membership](https://mobbin.com/flows/d39476e2-ebe6-459b-9775-2189b91ca7df) —
   the cart column, the equal-tile payment grid, the split numpad with preset chips and *Left to
   pay*, *Save unpaid* / *Save part-paid*, and the post-payment activity timeline.

**Not on Mobbin, captured by hand instead:** Square POS, Zettle, SumUp, Lightspeed, Toast,
Loyverse, Clover and Vend are all absent (re-verified 2026-09-12, bare name, deep mode, both
platforms). They are the apps that set the cashier's expectation, which is the guidelines'
tie-breaker, so they are captured directly under
[Capture the reference corpus](https://github.com/wcpos/roadmap/issues/286).

---

## 9. What this direction does *not* settle

Left to the tickets that own them, so the prototypes do not pre-empt them:

- The number of scale steps and what each is numerically —
  [Decide scale and density](https://github.com/wcpos/roadmap/issues/289).
- Which components diverge between web and native, including the anchored-panel-to-sheet fallback
  on phone — [Decide the platform-split rule](https://github.com/wcpos/roadmap/issues/290).
- Which of the 58 components survive, merge or go —
  [Decide the component map](https://github.com/wcpos/roadmap/issues/291).
- The recalibrated values of the five colour themes — the token sheet in
  [the second prototype ticket](https://github.com/wcpos/roadmap/issues/288).
- Which completions get a beat, per screen — fog on the map until the six screens are drawn.
