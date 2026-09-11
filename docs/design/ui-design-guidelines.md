# WCPOS UI design guidelines

Date: 2026-09-11. Owner: Paul. Status: adopted as the standing UI position; the enforceable
summary lives in the monorepo at `.claude/rules/design.mdc`, which auto-loads for any agent
touching `packages/components`, `packages/core/src/screens`, `packages/core/src/components` or
`apps/main`, and is pointed to from the monorepo's `CLAUDE.md` and `AGENTS.md`. This page is the
long form: the reasoning, the worked example that triggered it, and the sources.

## Why this exists

On 2026-09-11 three mockups of the checkout tender pane came back with the verdict *"it just looks
ugly. We can do better."* Two of the faults were specific: a back arrow on a pane that sits to
the left of what it returns to, and a list layout for payment methods when a WooCommerce store
routinely runs five or six gateways. The third was general: nothing in the repo told an agent
what good looks like here, so every session started from a generic component-library default.

Paul's brief, verbatim in spirit:

> The UI should be as simple as possible with deep complexity available with a few clicks. It
> should be clean and modern and follow Apple's UI guidelines for touch screens, but it should
> also spark little moments of joy to use for cashiers.

Everything below serves those two sentences.

## The cashier

The person in front of the screen is standing at a counter, arm's length from a shared tablet,
under shop lighting, with a customer waiting. Apple's own iPad guidance assumes people are
"typically within about 3 feet of the device" and often have it on a stand. The second persona
is the stall-holder who last opened the app four months ago and must not have to re-learn it.
Neither reads instructions. Both judge the app by whether the next tap is obvious and whether it
answered.

The design test for every screen is therefore: **at 5 pm with a queue, can the cashier find the
next action in under a second without reading?**

## Principles

### 1. Simple surface, deep reach

Progressive disclosure is the mechanism. Nielsen Norman's definition is exactly the brief: show
"only a few of the most important options" first, then "a larger set of specialized options upon
request". It improves learnability, efficiency and error rate, and it stops working past two
levels deep. Apple's layout guidance endorses the same thing. So: the default screen carries the
common case; everything else is one or two taps away; nothing is deleted to make the screen look
clean. A control that a cashier needs twice a day (split payment, reprint, manager override) is
folded, not removed.

### 2. One number, one action

Refactoring UI's hierarchy chapter is the discipline: not all elements are equal, size is not
the only lever, and the way to make one thing loud is to make everything else quiet. On a POS
screen the loud thing is the amount the cashier is about to take, and the action is the one that
takes it. A second amount is shown only when it differs, and then as a plan, not a second total.

### 3. Touch first

The numbers, all from primary sources:

| Rule | Value | Source |
|---|---|---|
| Minimum tap target | 44 × 44 pt | Apple HIG (iOS, iPadOS) |
| Preferred tap target | 48 × 48 dp, about 9 mm | Material 3 |
| Gap between adjacent targets | 8 dp or more | Material 3; Shopify POS guidance |
| Padding around a bordered control | about 12 pt | Apple HIG |
| Keys hit every sale | errors keep falling up to about 20 mm | Duff et al. 2010; Chen et al. 2013 (kiosk studies) |
| Legal floor for the web build | 24 × 24 CSS px (AA), 44 (AAA) | WCAG 2.5.8, 2.5.5 |

Two consequences. Keypad keys, payment tiles, product tiles and the Pay button are at least
56 pt tall on a tablet, and bigger is not wasted. And the same CSS size is a different physical
size on a phone and on a 24" counter screen, so the check is millimetres on the device, not the
number in the stylesheet.

Fitts's law adds the placement rules: crowd nothing, keep the primary action near where the hand
already is, and don't rely on screen-edge targets on touch (they are slower, not faster, on a
touchscreen). Destructive actions sit apart from constructive ones. There are no hover-only
affordances; hover and keyboard are desktop extras layered onto a touch design.

### 4. Apple's grammar, our accent

Navigation, modality, sheets, popovers, safe areas and typography follow the Human Interface
Guidelines. Modal tasks are "simple, short, and streamlined"; a complex task gets a full-screen
presentation, not an enlarged centred modal. Text defaults to 17 pt on iPad with an 11 pt floor;
the app's base is 14 px on web and 16 px on native, and nothing the cashier reads at arm's length
goes below 14. System fonts throughout, tabular numerals for every amount.

**Back points where the content goes.** A left arrow on a pane that is to the left of the thing
it returns to is wrong. Use a close (×) or a labelled action instead. This is the specific fault
from the tender pane and it generalises: every affordance's direction must match the layout it
lives in.

The "accent" is what WCPOS adds on top of Apple's grammar: the slate palette, the flat surfaces,
the restraint. It is not a second grammar.

### 5. Layout is a grid, not a wrap

Tiles are equal width in fixed columns and keep their order. Width never follows label length,
because a wrapping flow of unequal tiles reshuffles itself and reads as careless. Design the
payment grid for six gateways, because that is a normal WooCommerce store. Material's window
size classes give the breakpoints: compact under 600 dp stacks to one or two columns; medium
and expanded use the space they have.

### 6. State is visible, not explained

Nielsen's first heuristic is visibility of system status. On a POS that means one badge in one
place for offline, saving, refused; a disabled control that says why in a few words beside it;
unavailable options folded or dimmed so they never compete with live ones. Fresha and Square
both put the explanation for what isn't available in one banner rather than on every tile.

And the standing house rule: no walls of text in the app. An error, empty or trouble state is
one line, the actions, and a link to docs.wcpos.com. Colour is never the only signal.

### 7. Motion means something

This is where "moments of joy" is defined so that it cannot be read as decoration.

The primary sources agree on restraint. Apple: "generally avoid adding motion to UI interactions
that occur frequently" and "let people cancel motion". Rauno Freiberg found that removing motion
from core interactions made him feel "much faster". Emil Kowalski: keep animations under
300 ms, default to ease-out, never animate keyboard-initiated actions. Material's tokens put
selection controls at 200 ms and nothing on a user-waited path above 400 ms. Nielsen's response
limits set the budget: feedback within 0.1 s feels instant, 1 s keeps the flow of thought.

So joy is:

- **Speed.** A press shows a pressed state within 100 ms. The change-due line appears as the
  amount is typed. Nothing waits on an animation.
- **Precision.** Springs with full damping (Apple's own starting point) for anything a gesture
  drives; ease-out for everything else; interruptible always.
- **A completion beat.** When something finishes, the app acknowledges it once and briefly: the
  total settles, the *Paid* stamp lands, a capture gets a short haptic on native, the receipt
  slides in. Nielsen Norman's model calls this surface delight, and it only works on top of a
  screen that is already usable.

Joy is not confetti, mascots, emoji, gradients, or animation for its own sake. Reduce-motion is
honoured by swapping motion for a fade.

### 8. Calm colour, semantic tokens

The app's palette is the slate scale from the brand's visual identity, expressed as OKLCH
semantic tokens in `apps/main/global.css`, with light and dark both first-class. Components use
the tokens, never a hex. One accent colour carries the primary action on a screen; semantic
colours carry meaning only. Contrast is 4.5:1 for text and 3:1 for UI components and icons
(WCAG 1.4.3, 1.4.11), and those are thresholds, not targets. Surfaces are flat with hairline
borders and one radius; hierarchy comes from spacing, weight and colour, in that order, because
Refactoring UI's advice to "use fewer borders" and "start with too much white space" is what
stops a dense screen looking busy.

Open decision, not silently resolved here: the brand document names red as the primary action
colour and the app's `--primary` is blue, with red reserved for destructive. Both are internally
consistent. Paul decides; until then the app keeps blue.

### 9. Words the cashier uses

Buttons are verbs with the object on them (*Take 18,00 £ in Cash*). A label that repeats what the
element already says is noise: no *OTHER* above *SumUp Terminal*. Plain words from the personas
page: products, not SKUs; sync, not replication. Every string is translated and has to survive
German length. The brand voice applies inside the app too: direct, not blunt; calm, not cute;
error copy says what happened and what to do next.

### 10. Before you draw, open the real screen

Inventory what the existing screen does, every state and string, and rehost it; a mockup that
invents a simplified version evaluates a straw man. Then look at what Square, Shopify POS,
Lightspeed, Toast, Zettle and SumUp do for the same task, because the cashier's expectation is
the tie-breaker and the app deviates only with a stated reason. Take zero leads from WordPress
or WooCommerce admin idioms.

## Definition of done for a UI change

- Walked every state as a cashier: empty, loading, saving, error, offline, disabled, long text,
  part-paid, phone width, dark mode.
- Screenshots of the changed states in the PR body, tablet and phone.
- No new explanatory paragraph in the app. No new hex colour. No new `useEffect` for layout.
- Touch targets and contrast checked on the device class, not assumed.
- Every interactive element carries a stable `testID`.
- The PR body names any rule it breaks and why.

## Worked example: the tender pane

The screen that triggered this: seven payment tiles in a wrapping row, five labelled *OTHER*,
two dead ones at full size with an orange reason under each, *TOTAL* and *This payment* at
similar weight, a *Split* chip, and a two-line paragraph explaining the screen.

Applying the rules: one leading amount; a fixed three-column grid of equal tiles sized for six
gateways; kind as an icon, title as the only text; unavailable methods folded into one row with
their reasons; the keypad opening under the grid with the change line updating as digits are
typed; a close affordance instead of a left arrow because the pane is on the left; the paragraph
gone. The mockups in `docs/prototypes/2026-09-11-tender-pane-mockups/` predate these rules and
are the next thing to be reworked against them.

## Sources

Apple Human Interface Guidelines: [Accessibility (control sizes)](https://developer.apple.com/design/human-interface-guidelines/accessibility),
[Layout](https://developer.apple.com/design/human-interface-guidelines/layout),
[Designing for iPadOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados),
[Typography](https://developer.apple.com/design/human-interface-guidelines/typography),
[Modality](https://developer.apple.com/design/human-interface-guidelines/modality),
[Motion](https://developer.apple.com/design/human-interface-guidelines/motion),
[WWDC18 Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/).

Material Design 3: [Structure and touch targets](https://m3.material.io/foundations/designing/structure),
[Motion tokens](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs),
[Window size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes),
[Canonical layouts](https://m3.material.io/foundations/layout/canonical-layouts/overview).

WCAG 2.2: [2.5.8 Target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
[2.5.5 Target size enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html),
[1.4.3 Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[1.4.11 Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
[2.3.3 Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

Vendors: [Shopify POS app performance and touch guidance](https://shopify.dev/docs/apps/build/performance/point-of-sale),
[Shopify app design principles](https://shopify.dev/docs/apps/design),
[Square register redesign](https://squareup.com/us/en/press/square-releases-new-register-design),
[Square on tap-target prominence](https://developer.squareup.com/blog/beyond-mobile-first/).
The vendor checkout survey is in `docs/research/2026-09-07-checkout-flow-research/`.

Interaction craft: [NN/g response-time limits](https://www.nngroup.com/articles/response-times-3-important-limits/),
[NN/g ten heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/),
[NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/),
[NN/g Fitts's law](https://www.nngroup.com/articles/fitts-law/),
[NN/g theory of user delight](https://www.nngroup.com/articles/theory-user-delight/),
[Rauno Freiberg, Invisible details of interaction design](https://rauno.me/craft/interaction-design),
[Emil Kowalski, Great animations](https://emilkowal.ski/ui/great-animations) and [Good vs great](https://emilkowal.ski/ui/good-vs-great-animations),
[Josh Comeau on spring physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/),
Dan Saffer, *Microinteractions* (O'Reilly, 2013).

Visual craft: [Refactoring UI](https://www.refactoringui.com/) and its
[colour palette chapter](https://www.refactoringui.com/previews/building-your-color-palette).

Touch ergonomics research: [W3C Mobile A11y TF summary of target-size research](https://www.w3.org/WAI/GL/mobile-a11y-tf/wiki/Summary_of_Research_on_Touch/Pointer_Target_Size)
(Duff et al. 2010; Chen et al. 2013; Gao & Sun 2015; Jin et al. 2007).

Brand: `~/Projects/wcpos-brand/brand/visual-identity.md`, `voice-and-tone.md`, `audiences.md`;
wiki `product/personas.md`.

Not sourced, so not claimed: glove and wet-finger accuracy, glare in retail, measured cashier
error rates. Treat any guideline on those as inference until a primary study turns up.
