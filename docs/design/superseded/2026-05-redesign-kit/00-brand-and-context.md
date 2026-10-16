# Brand & Context — Source of Truth

This is the index file. Read this first if you're touching the redesign for the first time, or if you're an AI agent that needs to ground its work in the actual WCPOS identity.

## Critical: marketing palette ≠ application palette

The single most important thing to know before designing anything:

**`/Users/kilbot/Projects/wcpos-brand/` is the MARKETING brand system.** Slate / Red / Cream — for the marketing website, emails, social posts, app store listings, the logo. That's the right palette for a 5-second hero impression on `wcpos.com`.

**The application UI is a different visual system.** Cashiers, shop owners, and developers stare at the app for hours every day. The constraint is **"someone wants to look at this all day every day"** — calm, modern, restrained, neutral. Mostly grayscale chrome with the brand Red used sparingly (the Pay button, primary CTAs) and the brand Cream used as warm illustration accent in empty states. Reference apps are **Linear, Stripe Dashboard, Notion, Figma, Apple Notes** — apps people actually live in.

This is industry-standard separation. Stripe.com is colourful and gradient-heavy; Stripe Dashboard is mostly grayscale with sparse purple. Square.com sells with bold imagery; Square Dashboard is white, gray, green. Same product, two visual systems for two different jobs.

The full app palette is specified in `01-design-brief.md` Section 5.

## The redesign is grounded in two repositories

### 1. The codebase: `/Users/kilbot/Projects/monorepo-v2/`

This repo. The actual app, the existing component library, the wiki.

**Most relevant for redesign work:**

| Path | What's there |
|---|---|
| `apps/main/global.css` | The current OKLCH token system. The redesign recalibrates these values to the calm app palette. |
| `packages/components/src/` | 60+ existing UI primitives (Button, Card, ListItem, DataTable, ...). Reuse these, don't invent new ones. |
| `apps/main/app/` | Expo Router file-system routes — the screen inventory the redesign covers. |
| `.wiki/product/personas.md` | Who uses WCPOS. |
| `.wiki/product/features.md` | What WCPOS does today. |
| `.wiki/architecture/client.md` | How it's built. |
| `redesign/` | This kit. |

### 2. The marketing brand: `/Users/kilbot/Projects/wcpos-brand/`

The **marketing** brand source-of-truth. Logo, marketing palette, voice, audiences, marketing copy.

**Read these on first contact:**

| Path | Why |
|---|---|
| `brand/story.md` | Why WCPOS exists. Origin in a real shop. The values. |
| `brand/audiences.md` | Three personas with full goals/pains/language preferences. |
| `brand/voice-and-tone.md` | The "straight-talking developer" voice. Do/don't pairs that should govern every UI string. (Voice & tone IS shared between marketing and app.) |
| `brand/visual-identity.md` | The marketing palette, the type scale, spacing scale, accessibility rules. **The colour palette in this file is for marketing, not the app.** Type scale and "system fonts only" rule apply to both. |
| `brand/messaging.md` | Tagline, value props, audience-specific messaging (mostly marketing-relevant). |
| `knowledge/pos-ux-principles.md` | Why POS design is different from app design — Fitts's Law in practice, cognitive load, environmental factors, accessibility as legal requirement. **Highly relevant to the app.** |
| `examples/anti-patterns/examples-to-avoid.md` | What not to do. |

## What's shared between marketing and app

- **Voice & tone** — straight-talking developer, plain language, no marketing speak. Applies everywhere from the website to error messages.
- **Typography rule** — system fonts only. No custom fonts.
- **Personas** — same audience.
- **Anti-patterns** — same don'ts (no corporate jargon, no false urgency, no "AMAZING!").
- **Logo and brand identity** — used in both, just at different prominence.

## What's different between marketing and app

| | Marketing | Application |
|---|---|---|
| **Palette** | Slate / Red / Cream (warm, branded, energetic) | Calm grayscale chrome + brand Red used surgically |
| **Type sizing** | Display 48px, H1 36px (big hero impressions) | Dense scale (10–14px) for tabular data, brand scale for marketing-adjacent surfaces |
| **Density** | Breathes — generous whitespace, hero photography | Dense where it informs (cart, tables); breathable elsewhere (settings, onboarding) |
| **Imagery** | Screenshots in device mockups, real store environments | Real product images from the user's WooCommerce store, illustrated empty states |
| **Visual energy** | Loud is OK — it's a 5-second sales moment | Quiet is required — 8 hours a day stares at this |

## Where the brand DOES show up in the app

The brand isn't absent from the app — it's used surgically:

- **Logo** in the top-left corner of the sidebar, on the splash screen, on the About page.
- **Pay / Checkout button** — brand Red `#CD2C24`. The single signature accent.
- **Connect / auth flow** — first-launch screen is marketing-adjacent. Slightly more brand-forward than the rest of the app: a Cream illustration accent in the empty state, the logo prominent.
- **Pro upgrade overlay** — sales moment inside the app. Brand Red on the upgrade button.
- **Receipt template defaults** — the receipts customers see can carry brand. (User-customisable, but the default template carries it.)
- **Empty state illustrations** — line illustrations with a small Cream accent for warmth.

The brand does **not** show up in: sidebar background (calm gray, not Slate 800), card backgrounds, headers, toolbars, tables, lists, form inputs, most buttons. Default app chrome is grayscale.

## The five-second summary

If you have five seconds before designing something, here it is:

- **App palette:** warm near-white surfaces (Light) / warm near-black (Dark), calm grayscale chrome, brand Red `#CD2C24` ONLY on the Pay button and primary CTAs.
- **Typography:** system fonts only. Tabular figures for prices.
- **Voice:** straight-talking developer. No marketing speak. No emoji. Plain language.
- **Three surfaces:** Cashier (POS register, fast & dense, brand-Red Pay button), Merchant (products / orders / customers, mid-density, neutral chrome), Admin (settings, deep & technical, neutral chrome).
- **Customisation is a feature** — defaults that work, progressive disclosure, settings as a separate world.
- **Reference apps for the look-at-all-day aesthetic**: Linear, Stripe Dashboard, Notion, Figma, Apple Notes.
- **POS-specific patterns** still come from Square Register / Toast / Lightspeed, but their visual language doesn't.
- **Slow rollout via release cadence** — no feature flags. One small change per release. Cart never breaks.

## When uploading to claude.ai/design

The recommended uploads for the WCPOS Redesign project are:

**From this kit (`redesign/`):**
- `00-brand-and-context.md` (this file — the index)
- `01-design-brief.md` (the master brief)
- `02-screen-inventory.md` (the screen list)
- `03-component-audit.md` (the component primitives)

**From the codebase:**
- `apps/main/global.css` (existing token system — to be recalibrated)

**From the brand folder (only some of these — the marketing palette is NOT what we want for the app):**
- `wcpos-brand/brand/voice-and-tone.md` — applies to UI copy
- `wcpos-brand/brand/audiences.md` — persona context
- `wcpos-brand/brand/assets/wcpos-icon.svg` — the actual logo (used in the app)
- `wcpos-brand/knowledge/pos-ux-principles.md` — Fitts's Law, cognitive load, accessibility

**Do NOT upload `wcpos-brand/brand/visual-identity.md` to the app design project** — it'll bias claude.ai/design toward the marketing palette. If you want claude.ai/design to know about the marketing identity at all, paste the relevant note from this file ("The brand has Red and Cream — these go in marketing, not app chrome") into the conversation prompt rather than uploading the full file.

That's about 8 files in the project's Files section. Once uploaded, every prompt in that project has the right context and will produce calm, look-at-all-day mockups, not marketing energy.
