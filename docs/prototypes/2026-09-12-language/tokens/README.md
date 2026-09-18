# Token sheet — roadmap#288

[Open the sheet](index.html), a page of the register at `?screen=tokens` (module `TK`).
The dark strip is not the drawing. Theme highlights a column; Scale highlights the specimen
step. Escape returns to the register.

Top to bottom: colour tokens across the nine themes, each with a swatch and resolved oklch;
five text contrast pairs and the focus ring against the canvas; the five dot-and-word statuses;
the seven scale numbers at all three steps and the touch/fine-pointer floor; every distinct
`--fs`/`--amt` font-size expression rendered at all three steps, then each theme's display and
mono faces; named CSS animation beats with durations and Play; six glyphs for each of the
three theme-selected icon sets; radius, hairline and the register pop's computed shadow.
Probes use the live frame's CSS under every theme × scale, not a copied value table.

## Captures to judge

Run from `/Users/kilbot/Projects/monorepo-v2`:

```sh
node /Users/kilbot/Projects/roadmap/.claude/worktrees/docs+design-program-2026-09-12/docs/prototypes/2026-09-12-language/tokens/shoot.js
```

Nine full-length captures under `screens/`, tablet at regular scale:
`tablet-light-regular.jpg`, `tablet-dark-regular.jpg`, `tablet-paper-regular.jpg`,
`tablet-bold-regular.jpg`, `tablet-warm-regular.jpg`, `tablet-market-regular.jpg`,
`tablet-ocean-regular.jpg`, `tablet-sunset-regular.jpg`, `tablet-monochrome-regular.jpg`.
The shoot fails on page/console errors or contrast failures in either default theme, and checks
the shared categories, Scale, Play, reduced motion and the phone's local matrix scrolling.

## Decisions for Paul

1. **Default light, following the system to Default dark** (pick), or a personality theme
   as the first-run default. The defaults leave the work first and fit system appearance;
   a personality theme makes the till recognisable sooner. **Pick: defaults follow the
   system; personality is opt-in.** This sheet compares themes; it does not implement the
   system-following mechanism.
2. **Five shared categorical colours** (drawn), or categories derived from each theme.
   Shared colours keep the same category recognisable between shops and pages; theme-derived
   colours coordinate more closely with the controls. **Pick: shared.** `--c1` through `--c5`
   now live in the shared token block; Reports consumes them without its former overrides.
3. **What personality is still missing?** Decision 26 is still Paul's question: are the
   theme-led icons, money faces and completion touches enough, or is there a specific moment
   that still feels anonymous? Keeping these costs no more attention; adding a touch can make
   that moment recognisable but spends attention on every sale. **Pick: leave the question
   open for Paul**, not a new decoration or a reopening of the signed-off register.

## Behavior changes / regressions

- Docs only. The new page measures the current drawing; it does not repair other themes.
  The status count is relative to the highlighted theme: the light and dark status sets
  differ, despite the earlier README's fixed-set intention. Personality-theme contrast
  failures remain red and explicitly labelled; the shoot gates Default light and Default dark.
- Categorical colours now match the former Default light Reports palette on every theme.
  This deliberately changes dark/personality Reports charts, including the formerly
  theme-derived `--c1`; it does not change primary controls or semantic statuses.
- CSS is authoritative for motion: `rollin` is 480 ms, `tear` 420 ms, and the separate
  `sl-tear` study is 320 ms; these differ from the brief's roll/tear examples. The stamp is
  `slam`, the tick is `draw`; panel and sheet beats keep their CSS names. Play runs one cycle,
  not an infinite spinner; reduced motion remains still. JS timer orchestration is not replayed.
- Contrast uses browser-resolved, 8-bit sRGB with WCAG relative luminance. It measures the named
  opaque pairs, not every control, translucent composition, font rendering or chart distinction.
  The pop shadow is displayed as measured, including `none`; no elevation is invented.
