# Scale and density: the steps, the auto-pick and override, the mechanism, and density as a prop

_Decided 2026-09-18 by Paul in the grilling for [wcpos/roadmap#289](https://github.com/wcpos/roadmap/issues/289), part of the [UI overhaul for 1.11.0 map](https://github.com/wcpos/roadmap/issues/282). Inputs: the [scale-axis research](https://github.com/wcpos/monorepo/blob/research/scale-axis/.claude/research/2026-09-12-scale-axis.md) (#284), the token block and its three steps in the [language prototype](../prototypes/2026-09-12-language/README.md) (the register, orders, settings, connect, reports and token-sheet captures at every step), the Scale row drawn on the settings page (#288), and the [library strategy](2026-09-18-library-strategy.md) (#340). This page binds the token pass in the landing order (#292) and every rebuild ticket that follows._

## In one paragraph

Scale is one user knob with **three steps**, Compact / Regular / Spacious, chosen by **Auto from window width** and overridable in Settings › Appearance beside the theme. A step sets **seven numbers** (spacing unit, base type, control, row, tile, radius, leading amount) and the type ramp derived from base type; one column of numbers serves both platforms, in CSS px on web and dp on native. The **touch floor** is not a step: it comes from the pointer (44 coarse, 24 fine) and controls and rows are the larger of their token and the floor. The steps ride Uniwind's runtime variables through `ScopedVariables` at the app root; **a component never reads the step**. **Density is not an axis**: the surfaces within a step differ by which token they use, and a screen that wants a denser instance passes the existing size prop. There is no density context and no density prop.

## 1. The steps

| token | Compact | Regular | Spacious | what reads it |
|---|---|---|---|---|
| spacing unit `--spacing` | 3.5 | 4 | 5 | every `p-*`, `gap-*`, `size-*`, `h-*` utility; icons ride it |
| base type | 13 | 14 | 16 | the type ramp, at fixed ratios of base |
| form control `--spacing-ctl` | 40 | 44 | 52 | input, select, button default, segmented control |
| list / table row `--spacing-row` | 36 | 44 | 52 | orders table, cart lines, settings rows, list rows |
| tile, key, tender method `--spacing-tile` | 56 | 64 | 80 | product tiles, keypad keys, payment tiles |
| radius `--radius` | 6 | 8 | 10 | the radius family |
| leading amount `--text-amt` | 34 | 40 | 48 | the total, the change due, the ring's figure |

Three steps, not four (Q1). A fourth step for 27-inch and larger displays buys nothing that OS display scaling and more columns do not already give, and it multiplies every gallery shoot by a third. The numbers are the hand-tuned table the prototypes were drawn with (Q2), not a single multiplier of Regular: a multiplier shrinks type as fast as spacing, and over 1,100 captures at all three steps were judged on these numbers. Exactly these seven tokens and the derived type ramp move with the step; nothing else does (Q3).

**One column of numbers, both platforms** (Q2). CSS px on web and dp on native are the same density-independent unit, and native cannot follow a rem (Uniwind multiplies rem out at build time). The web's 87.5 % root font-size retires in the token pass; the tokens are written as plain numbers so `ScopedVariables` can carry them on both platforms. Today's implicit values (web unit 3.5 with 13 px body, native unit 4 with 15 px body) mean the web app runs at Compact and native between Regular and Spacious; Regular is the new default for both.

**The type ramp** is base × fixed ratios (xs 0.857 · sm 0.929 · base 1 · lg 1.143 · xl 1.286 · 2xl 1.5 · 3xl 1.857), each with its line-height partner, so `text-sm` is 12 / 13 / 15 across the steps. The leading amount is its own token, not a ramp stop.

## 2. The floor

One touch floor of **44** on every coarse pointer, including Android, and **24** on a fine pointer (Q4). 44 is WCAG 2.5.5 AAA and Apple's number; Material's 48 counts the slop that hit areas supply, so it is met by `hitSlop`, not by a taller control. Control and row are `max(token, floor)`. The floor is applied in the root's JavaScript before the values reach Uniwind, so native receives plain numbers and nothing relies on `max()` resolving on native.

What that means per step: Compact on a phone is 13 px type with 44 pt controls and rows (tiles are already 56). Compact at a desk with a mouse is real density, 40 px controls and 36 px rows. Regular and Spacious are never floored on touch. This is how the cohesion audit's `h-10` = 40 finding closes: one floored token, not a per-screen fix.

## 3. Auto and the override

**Auto reads width only** (Q5). The pointer already sets the floor, so it does not also move the step.

| width | step | typical device |
|---|---|---|
| under 640 | Compact | phones |
| 640 to 1599 | Regular | tablets, iPad counters, laptops |
| 1600 and wider | Spacious | 27-inch and larger desktop screens |

A window width cannot tell a 27-inch 4K screen at 200 % scaling from a laptop, which is why the override exists; Auto is the honest default, not a promise. The prototype's stand-in map sent the 1440 desktop frame to Spacious; under this rule it is Regular. The captures exist at every step, so nothing drawn is lost.

**Rotation** (Q6). On native, Auto reads the device's shortest side, so turning a phone never changes the type size. On web it reads the live window width, like any other breakpoint.

**The override** is the Scale row under Theme in Settings › Appearance, Auto / Compact / Regular / Spacious, as drawn on the settings prototype (#288). It is stored beside `theme` in the store document, a device-local field the server never owns (`SERVER_OWNED_STORE_FIELDS` excludes it as it excludes theme): one setting per store per device (Q7).

**OS text size** (Q8). The system accessibility text setting multiplies type only, at any step, capped at 1.3 × so the register keypad and the cart never break; it never moves spacing or controls. The app sets no cap today; the cap is a named constant in the token pass.

## 4. The mechanism

`ScopedVariables` at the app root, from Uniwind 1.11.0, which has been the installed version since the pin landed (#344, 2026-09-18) (Q9). It is declarative, its values live in React state so hot reload and theme switches cannot drop them, and it lets the gallery render all three steps side by side in one tree, which the imperative `updateCSSVariables` cannot. The root component computes the step (Auto or the override), the floor (pointer type), applies the floor, and passes the seven numbers and the ramp. This amends the strategy page's line that named the imperative call; the rule it carried stands: **a component never reads the scale step**. Everything a component sizes goes through `--spacing`, `--text-*`, `--radius-*` and the named tokens above.

The leak is hand-written arbitrary lengths: `h-[44px]`, `text-[13px]`, `p-[7px]` bake at build and escape the axis. The Uniwind lint from the strategy gains one row: **no arbitrary pixel lengths**; a needed size is a named token.

## 5. Density is a prop, not an axis

The prototypes show three surface heights within a step, and each is a token: control, row, tile. The cashier grid, the orders table and the settings form differ by which token they use, not by a density value. A context would be a hidden fourth axis that multiplies the gallery and makes a component render differently by where it is mounted, the very thing the "never reads the step" rule exists to prevent (Q10).

So: **no density context and no density prop.** A screen that wants a denser instance passes the component's existing size variant (`sm`, `lg`, …), and the size variants map to tokens. One hand-off to the component map (#291): the button's `compact` size variant duplicates `sm` and now collides with a step name, so it retires there.

## What this page fixes for later tickets

- **The token pass (#292):** the seven tokens and the ramp as plain numbers; the 87.5 % root retired; `ScopedVariables` at the root; the floor applied in JavaScript; the 1.3 × text-size cap as a constant; the arbitrary-length lint row.
- **The gallery (fog on the map):** every cell can render the three steps in one tree, and the two floors are two cells, so a component's scale coverage is six cells, not a rebuild of the tree per step.
- **The component map (#291):** size variants map to tokens; `compact` retires as a variant name; no density prop is added anywhere.
