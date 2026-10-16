# Superseded — the May 2026 redesign kit

These seven files are `~/Projects/redesign/` as written on 2026-05-02, copied here unchanged on
2026-09-12 so they are in git. They are **not** a source of truth. The program that replaces
them is [`../../2026-09-12-ui-polish-program.md`](../../2026-09-12-ui-polish-program.md); the
rules are [`../../ui-design-guidelines.md`](../../ui-design-guidelines.md).

Overruled since May:

| The kit says | The ruling says |
|---|---|
| Brand red `#CD2C24` as the primary accent on Pay | Primary is the theme accent, never red; red is destructive only (Paul, 2026-09-11) |
| Soft single-direction shadows for elevation | Flat surfaces, hairline borders, one radius; no shadows to make a card look premium |
| Draft mockups in claude.ai/design | HTML on disk, states switchable, Playwright captures; hosted-only mockups rejected |
| Nine phases, one component per release, no feature flags | One release: everything lands on `next` and ships as 1.11.0 |
| Storybook + Chromatic or Percy as the safety net | A gallery route in the existing web build, shot by the Playwright the e2e suite already runs |

Still useful as raw material:

- `02-screen-inventory.md` — every screen with its states and a P0–P3 order. The order holds.
- `03-component-audit.md` — the *Gaps* and *Inconsistencies* sections are the starting list for
  the component contracts.
- `01-design-brief.md` sections 3, 4 and 6 — form factors, personas and the three-surface idea
  (cashier, merchant, admin), carried into the program as density tiers.

Everything else in these files, including the palette tables and the starter prompts, is
history. The original folder can be deleted once this is merged.
