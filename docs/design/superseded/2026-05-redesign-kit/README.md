# WCPOS Redesign Kit

This folder contains everything you need to redesign the WCPOS app, gradually, without breaking the live app for the ~6,000 active installations using it today.

You're a developer, not a designer. These docs are written for that. No knowledge of design systems is assumed — but the docs are grounded in the *actual* state of the codebase, the wiki, the existing component library, and the WCPOS brand.

## The three big shifts

1. **Look-at-all-day aesthetic — calm, modern, restrained.** The app is something people stare at for hours. The visual system is mostly grayscale chrome with the WCPOS brand Red used sparingly (Pay button, primary CTAs) and Cream as a warm illustration accent. **Reference apps: Linear, Stripe Dashboard, Notion, Figma, Apple Notes.** The marketing palette in `/Users/kilbot/Projects/wcpos-brand/` (full Slate / Red / Cream) is for the marketing website, not the app — see `00-brand-and-context.md` for that distinction and Section 5 of the brief for the full app palette.
2. **Three surfaces, three rule sets.** Cashier (POS register, fast & dense), Merchant (products / orders / customers, mid-density), Admin (settings, deep & technical). The same component renders differently across surfaces. Customisation is a feature — defaults that work, progressive disclosure, settings as a separate world. See Sections 6 and 7 of the brief.
3. **Slow rollout via release cadence.** The app is in production. The redesign ships one focused change per release — tokens first, primitives next, screens last. No feature flags; self-hosted stores upgrade at their own pace and that's the rollout. Visual regression tests are the safety net. See `05-migration-plan.md`.

## Files

| File | What it is | When to use it |
|---|---|---|
| `00-brand-and-context.md` | The index — points to the brand folder (`/Users/kilbot/Projects/wcpos-brand/`) and codebase paths that are the source-of-truth for the redesign. | Read this first if you're picking up the kit cold. |
| `01-design-brief.md` | The master brief — product context, personas, form factors, **WCPOS brand identity**, **surface principles**, **customisation as a feature**, constraints, the recommended phased approach, **production constraint**. | Read this end-to-end on first contact. Re-read before each new screen. Paste relevant sections into claude.ai/design when prompting. |
| `02-screen-inventory.md` | Every screen in the app, grouped by user journey and ranked by redesign priority (P0–P4). | Use this to decide what to design next. P0 screens are "design these first, the rest follows from them". |
| `03-component-audit.md` | Status of every component in `@wcpos/components`. What exists, what's good, what's inconsistent, what's missing. | Reference when prompting — tells claude.ai/design which components to reuse vs. invent. Also a prioritised list of library-level improvements. |
| `04-starter-prompts.md` | Five ready-to-paste prompts for claude.ai/design, one per priority screen, **anchored in the WCPOS brand palette**. Plus a bonus design-system reference-sheet prompt. | Open in another tab. Copy a prompt, paste into claude.ai/design, generate, iterate. |
| `05-migration-plan.md` | The 9-phase incremental migration plan. Tokens → atoms → molecules → screens, one focused change per release. Visual regression as the safety net; no feature flags. | The operational guide for shipping the redesign without breaking production. Read after the brief. |

## Suggested workflow

### Design phase (this is "where do I start as a non-designer")

1. **Read `00-brand-and-context.md`** (~3 min) so you know where the brand source-of-truth is.
2. **Read `01-design-brief.md` end-to-end** (~15 min). Sections 5–7 are where the design philosophy lives.
3. **Skim `05-migration-plan.md`** (~10 min) to understand the order of operations — it informs which screens are worth designing first.
4. **Set up the claude.ai/design Project** — upload the recommended files (see `00-brand-and-context.md` for the list, and the "Working with claude.ai/design" walkthrough below).
5. **Generate the design-system reference sheet** using the bonus prompt at the bottom of `04-starter-prompts.md`. This gives you a single image with the WCPOS-branded palette + typography + buttons — your north star.
6. **Generate the POS register hero** (Prompt 1). Iterate until it feels right. This is the screen that sets the language for everything else.
7. **Generate the same screen on phone** (Prompt 2). Confirm the language scales across form factors.
8. **Decide if you're committed.** If the hero screens feel right, you have your design language. The remaining screens are mostly applying it.
9. **Work down P1 → P2 → P3 screens** from `02-screen-inventory.md`, using starter prompts as templates.

### Build phase (this is "how do I actually ship it")

Follow `05-migration-plan.md` exactly. The order is:

- **Phase 0** Foundations (visual regression infrastructure, beta channel).
- **Phase 1** Token recalibration (one release; new palette / radius / shadow values applied app-wide).
- **Phase 2** Atom primitives (Button, Input, Badge, Avatar) — one per release, in place.
- **Phase 3** Molecule primitives (Card, ListItem, Modal, Toast, DataTable) — one per release.
- **Phase 4** Net-new primitives (EmptyState, Skeleton, ConnectivityIndicator, Money, KeyValueRow, Stepper, Banner) — one per release, additive.
- **Phase 5** Low-risk screens (Settings tabs, Logs, Support, Notifications) — one per release.
- **Phase 6** Onboarding & Receipt (Connect, Receipt modal, Tax rates).
- **Phase 7** The register itself (the hero, last because it's the highest stakes — beta channel for 2 weeks before stable).
- **Phase 8** Pro-gated screens (Customers, Coupons, Orders, Products, Reports).
- **Phase 9** Cleanup (retire stale tokens, document the design system).

The cart never breaks at any phase. Regressions are addressed by patch releases — fix forward, not flag flip.

## Where to save mockups

When you generate mockups in claude.ai/design and want to save them, drop them in `redesign/mockups/` (create the folder). Suggested naming:

```
redesign/mockups/
  pos-register-tablet-v1.png
  pos-register-tablet-v2.png
  pos-register-phone-v1.png
  receipt-modal-v1.png
  ...
```

That keeps your iterations next to the brief that produced them, and lets you commit them to git for design review with collaborators.

## Capturing decisions

Once you settle on a direction or make a non-obvious tradeoff, capture it in `redesign/decisions/YYYY-MM-DD-<name>.md` (similar to ADRs). Examples:

- `2026-05-15-keep-system-fonts-no-inter.md`
- `2026-05-22-cart-panel-uses-cream-not-card-header.md`
- `2026-06-03-display-settings-as-sliding-panel.md`

Future-you will thank you. So will the next contributor.

## Recommendations before any mockups

Three things worth doing first:

1. **Decide the accent question.** The brief recommends brand Red `#CD2C24` as the single signature accent (used only on Pay / Checkout / primary CTAs). The alternative is no brand colour in the app chrome at all — accent is a calm near-black or quiet indigo. Both are reasonable; the brief explains the trade. Make this call before generating mockups, since it ripples through every screen.
2. **Set up Phase 0 infrastructure** (visual regression on Storybook stories, optional beta channel) before any redesigned component lands. Visual regression is the safety net that replaces what feature flags would have provided.
3. **Lift `EmptyState`, `Skeleton`, `ConnectivityIndicator`, `Money`, `KeyValueRow`, `Stepper`, `Banner` to the component library** as net-new primitives (Phase 4 of the migration plan). Doing this early means you can prompt claude.ai/design with "use the EmptyState component" and get consistent results in every mockup.

None of these blocks starting the design work — but doing them in parallel will make every mockup more shippable.
