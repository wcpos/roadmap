# WCPOS Redesign — Design Brief

> A self-contained brief you can paste (in part or whole) into claude.ai/design when generating mockups.

## 1. What WCPOS is, in one paragraph

WCPOS is a Point-of-Sale application for WooCommerce. Store owners run their existing WooCommerce catalog, stock, and customer records on a register — a tablet on a counter, a phone at a popup, a desktop in a back office. It is **offline-first**: the local RxDB database is the source of truth on the device; the WooCommerce server is the source of truth for the business. There is no middleware, no separate inventory system, no platform lock-in. ~6,000 active installations worldwide. Solo developer, ~3 years in market, free + Pro tiers.

## 2. Why this redesign exists

The app has grown feature-by-feature. We want to step back and address four things together:

1. **Visual refresh** — a more modern, professional, cohesive look. The current palette and density work, but the aesthetic is dated.
2. **UX & flow improvements** — specific journeys (checkout, connecting a site, configuring a printer) feel clunkier than they should.
3. **Information density / layout** — POS screens are dense by nature. We want density that reads well, not density that feels cramped.
4. **Component system overhaul** — 60+ components exist; some are inconsistent. The redesign is the chance to align them.

There may also be **new feature surfaces** introduced through the redesign (better dashboard, end-of-day summary, smarter empty states).

## 3. Form factors — all of them

The same React Native + Expo codebase ships to:

| Form factor | Primary surface | Notes |
|---|---|---|
| **Tablet (iOS, Android)** | Register at a counter, landscape | The main register surface — column layout (products + cart side-by-side). Touch-first. |
| **Phone (iOS, Android)** | Mobile POS, line-busting, popups | Tab layout (products / cart switch via tabs). Portrait. |
| **Desktop (Electron, Web)** | Back office, manager, reporting | Mouse + keyboard. Larger screens. Same component library. |
| **Web (in WP admin)** | The web bundle is also embedded in WordPress as a POS page | Same code as desktop. |

The redesign must work on **all four** without forking. Layouts change; components stay common.

## 4. Personas (drives every design decision)

### Primary: Small Shop Owner
Non-technical. Already runs a WooCommerce online store. Wants to sell in-store without re-entering products. Care most about **simplicity, reliability, and not having to think**. The POS *has to work* when a customer is at the counter. Often shared tablet behind the counter, frequently not a native English speaker.

**Design implications:**
- Default settings work without configuration.
- Errors are plain language, not technical.
- Use "products" not "SKUs"; "sync" not "replication".
- Assume slow / unreliable internet.
- Assume large tap targets — register staff are not careful clickers.

### Primary: Event / Occasional Seller
Sells in person at markets, fairs, popups. Phone or tablet. **Goes months between uses** — must pick the app back up without re-learning.

**Design implications:**
- The app must be immediately usable after months of inactivity.
- Offline mode is the default, not a fallback.
- Onboarding and reconnection should be fast and forgiving.
- No daily-familiarity assumptions in the UI.

### Secondary: Developer / Agency
Installs and configures for clients. Comfortable with REST APIs and React Native. Often the one who hands the device to the shop owner.

**Design implications:**
- Surfaces with technical detail (logs, settings, extensions) can be denser and more technical.
- Clear separation between "shop owner UI" and "developer UI" — the developer is fine with a Settings > Tools area.

### Anti-personas (do NOT optimize for)
- Large retailers with 100k+ products.
- Enterprises needing ERP integration.
- Businesses without WooCommerce.
- E-commerce only (no physical selling).

## 5. Aesthetic direction

### 5.1 Marketing palette ≠ application palette

The WCPOS brand assets at `/Users/kilbot/Projects/wcpos-brand/` are a **marketing brand system** — landing pages, emails, social posts, the logo, the website. They use the WCPOS Slate / Red / Cream identity that comes from the awning logo. That's the right palette for a 5-second hero impression on `wcpos.com`.

**The application UI is a different job.** Cashiers, shop owners, agencies, and developers stare at the app for hours every day. The constraint is **"someone wants to look at this all day every day"** — which means calm, modern, restrained, neutral. Visual energy that's perfect for a marketing hero is exhausting in a register UI.

This is industry-standard separation. Stripe's marketing site is colourful and gradient-heavy; the Stripe Dashboard you actually work in is mostly grayscale with one quiet accent. Square.com sells with bold imagery; Square Dashboard is white, gray, and one accent green. Linear's marketing has flair; the Linear app is near-monochrome with sparse purple. Same rule applies to WCPOS: **brand palette stays in marketing, app gets its own visual system.**

### 5.2 The application palette — modern, calm, restrained

The look-at-all-day standard is set by Linear, Stripe Dashboard, Notion, Figma, Apple Notes, Cron / Notion Calendar — apps people actually use for hours. They share traits:

- Mostly grayscale or near-grayscale surfaces
- ONE signature accent, used very sparingly
- Visual hierarchy through type weight, spacing, and elevation — not through colour
- Subtle shadows over hard borders
- Warm rather than stark neutrals (a little warmth makes long sessions easier)

**Recommended app palette:**

| Token | Light theme | Dark theme | Notes |
|---|---|---|---|
| `--background` | warm near-white, `oklch(0.985 0.004 65)` | warm near-black, `oklch(0.18 0.005 250)` | Page background. Never pure white / black. |
| `--card` | pure-feeling white, `oklch(0.99 0.002 60)` | one step lighter, `oklch(0.22 0.005 250)` | Cards, panels. |
| `--card-header` | very subtle gray, `oklch(0.96 0.003 60)` | `oklch(0.27 0.005 250)` | Toolbars on cards, table headers. |
| `--sidebar` | deep warm gray, `oklch(0.25 0.004 250)` | darkest, `oklch(0.13 0.005 250)` | Drawer / left navigation. Same in both themes. |
| `--foreground` | `oklch(0.20 0.01 250)` | `oklch(0.95 0.003 60)` | Primary text. |
| `--muted-foreground` | `oklch(0.55 0.005 60)` | `oklch(0.62 0.005 60)` | Secondary text. |
| `--border` | `oklch(0.92 0.003 60)` | `oklch(0.30 0.005 250)` | Hairline borders. |
| `--ring` | matches `--primary` | matches `--primary` | Focus rings. |

**The accent — pick one of two paths:**

**Path A (recommended):** Brand Red as the single signature accent, used **only** on the Pay / Checkout button and a tiny number of equivalents. The brand red appears once or twice per screen, at the moment of action. This connects the app to the WCPOS identity in the highest-impact spot — accepting payment — without making the chrome loud. It's the Linear-purple / Stripe-purple pattern: one signature colour, used like a punctuation mark.

```
--primary: #CD2C24   (only on Pay button, primary CTA, active focus ring)
```

**Path B (alternative):** No brand red in the app chrome at all. Primary CTAs use a calm near-black or quiet indigo. Brand red appears only in marketing surfaces, the logo, and possibly receipts. This keeps the app fully separated from the marketing identity.

```
--primary: oklch(0.25 0.01 250)   (warm near-black) OR oklch(0.50 0.10 265) (quiet indigo)
```

Recommendation: **Path A.** The brand red used sparingly on the action moment is calm in aggregate (a cashier sees it 50× a day, not 5,000× — it doesn't fatigue), and it gives the app a recognisable identity without dominating. This brief assumes Path A from here on; switch to Path B in `decisions/` if you decide otherwise.

**Semantic colours** stay restrained and slightly desaturated from their marketing equivalents:

```
--success    oklch(0.55 0.10 155)   muted green
--warning    oklch(0.70 0.12 75)    muted amber
--error      oklch(0.55 0.18 25)    muted red
--info       oklch(0.55 0.10 235)   muted blue
```

Soft-tint variants for hover backgrounds and pill backgrounds:

```
--primary-soft    primary at ~10% opacity over background
--success-soft    success at ~12% opacity
--warning-soft    warning at ~12% opacity
--error-soft      error at ~12% opacity
--accent-soft     foreground at ~6% opacity   (the default hover tint)
```

### 5.3 Where the WCPOS brand DOES show up in the app

The brand isn't absent from the app — it's just used surgically:

- **Logo** in the top-left corner of the sidebar, on the splash screen, on the About page.
- **Pay / Checkout button** — brand Red `#CD2C24` (Path A above).
- **Connect / auth flow** — first-launch screen is marketing-adjacent. Can be slightly warmer and more brand-forward than the rest of the app: a Cream `#F5E5C0` accent in the empty-state illustration, the logo prominent. Once the user opens the POS, the brand recedes.
- **Pro upgrade overlay** — the call-to-action moment. Brand Red on the upgrade button, possibly a Cream-tinted card. This is a sales moment inside the app.
- **Receipt template defaults** — receipts customers see at the end of a transaction. These can carry brand: WCPOS-store-owner's logo + brand colour scheme. Note: the receipt template itself is user-customisable; we're talking about the default template's defaults.
- **Empty states** — illustrated empty states can use Cream as an illustration accent (alongside neutral line work). Cream is the closest the app gets to "warmth as a UI signal."

The brand does **not** show up in:
- Sidebar background (calm dark gray, not Slate 800)
- Card backgrounds (near-white / near-black)
- Headers, toolbars (subtle warm grays)
- Tables, lists (neutral grays)
- Form inputs (neutral)
- Most buttons (outline / ghost / muted, not red)
- Default chrome (grayscale)

### 5.4 Aesthetic references — the look-at-all-day list

The references shift from Stripe / Square / Fresha to apps people actually live in:

- **Linear** — calm grayscale + sparingly-used purple. The Linear app is the cleanest model for what "look at all day" looks like in 2026.
- **Stripe Dashboard** — restrained, mostly grayscale, purple appears as punctuation.
- **Notion** — almost pure grayscale. Per-page colour is user-controlled, not chrome.
- **Figma** — mostly gray; blue used very subtly in selection / active states.
- **Apple Notes / Reminders / Calendar** — warm grayscale with iOS accent moments.
- **Cron / Notion Calendar** — practically monochrome.

Square Register, Toast, Lightspeed remain useful for **POS-specific patterns** (cart layouts, gateway pickers, receipt flows) — but their visual languages are not the target. We want the calm of Linear with the POS-savvy of Square.

### 5.5 Concrete cues for every mockup

- Surfaces: warm near-white (Light) / warm near-black (Dark). Never pure white or pure black.
- Primary action: brand Red `#CD2C24` on Pay / Checkout / primary CTAs only. Sparingly.
- Most buttons: outline or ghost or muted-fill in neutral tones. Brand Red is not a default button colour.
- Hover states: `--accent-soft` tinted background (a hint of foreground over the surface), not opacity changes.
- Card radius: 12px. Button radius: 8px. Pill radius: full.
- Elevation through soft single-direction shadows (sm on cards, md on raised, lg on modals) — not through borders.
- Tabular figures for prices.
- 1.5px stroke icons, rounded line-caps, consistent across the app.
- Calm motion. Subtle eases. No bouncy transitions.
- Whitespace that breathes on settings / onboarding; density that informs on cart / tables.

### 5.6 Typography — system fonts only

This rule is shared between marketing and app, from `wcpos-brand/brand/visual-identity.md`:

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

No custom fonts. Fast, native, accessibility-aware. The app's existing dense scale (`3xs` / `2xs` / `xs` / `sm` / `base`) is calibrated for tabular density inside data tables and cart line items; the brand-document type scale (Body 16px, H1 36px etc.) sits above for marketing-adjacent surfaces (the Connect screen, empty states, settings forms).

**Tabular figures for prices** wherever the system font supports it (modern San Francisco, Segoe UI, and Roboto all do).

### 5.7 Voice & tone

Source: `wcpos-brand/brand/voice-and-tone.md`. The brand voice is a **straight-talking developer who built this thing to solve a real problem. No marketing speak, no hype, no fluff.** This applies to both marketing copy and app UI strings.

For app UI copy:
- Plain language. Active voice. Contractions. "you" and "your".
- "Couldn't connect" not "Network failure" or "Oops!"
- No emoji in product copy.
- No "Simply" or "Just" — patronising.
- Specific over vague — "Synced 47 products in 2.3s" not "Lightning-fast sync".

For error messages: say what went wrong, say what to do, nothing else. "Couldn't connect to your store. Check your internet connection and try again." — not "Oops! Something went wrong! 😅"

### 5.8 The six themes

The app ships six theme options (defined as `@variant` blocks in `apps/main/global.css`, plus a System option in the user-facing picker that auto-follows OS dark-mode preference):

| Theme | Role | Surfaces under the new palette | Accent |
|---|---|---|---|
| **System** | Auto-follows the OS dark-mode setting. Resolves to Light or Dark — no separate spec. | (resolved) | (resolved) |
| **Light** | Canonical light theme. Most users on default. | Warm near-white (`oklch(0.985 0.004 65)` and friends) | Brand Red `#CD2C24` on Pay / primary CTAs |
| **Dark** | Canonical dark theme. | Warm near-black (`oklch(0.18 0.005 250)` and friends) | Brand Red `#CD2C24` (slightly brighter for contrast) |
| **Ocean** | Cool-tinted variant. User customisation for "I prefer my POS cooler / more blue." | Cool-tinted neutrals — same lightness curve as Light/Dark but the hue rotates toward cyan/blue (e.g. `oklch(0.985 0.004 220)` and friends in light mode; equivalents in dark mode) | Brand Red `#CD2C24` (the through-line stays) |
| **Sunset** | Warm-tinted variant. User customisation for "I prefer my POS warmer / more amber." | Warm-tinted neutrals — same lightness curve as Light/Dark but the hue rotates toward amber/orange (e.g. `oklch(0.985 0.005 70)` and friends) | Brand Red `#CD2C24` (the through-line stays — and Red sits naturally inside a warm-tinted theme) |
| **Monochrome** | Accessibility / no-chroma. For users who want maximum contrast or no colour at all. | Pure grayscale (`oklch(L 0 0)` everywhere — chroma stripped) | **No brand Red.** The Pay button uses a very dark gray (Light) or very light gray (Dark) — hierarchy preserved through lightness, not colour. |

**Key principles:**

- **Light and Dark are the canonical pair.** Design hero screens against these two. Ocean / Sunset are *re-derivations* — same component layouts, same lightness hierarchy, just retinted at the hue level. They should not be designed independently; they should fall out of Light/Dark by hue rotation.
- **Brand Red is the through-line across Light, Dark, Ocean, Sunset.** Switching themes changes the surface tint but doesn't change the WCPOS identity. A user moving from Dark to Sunset still sees the same Pay button colour.
- **Monochrome is the explicit exception.** Users who pick Monochrome have opted out of colour entirely. The Pay button uses extreme lightness contrast instead of brand Red.
- **Today's Ocean / Sunset are dramatic** (deep navy with bioluminescent teal; magenta-and-gold) — too "designed" for an all-day app. The redesign tones them down: cool-tinted-calm and warm-tinted-calm, not "ocean fantasy" and "sunset fantasy". They become preference choices, not visual statements.
- **System is the recommended default for new installs.** Most modern apps default to System; users who want to override pick Light, Dark, or one of the variants.

### 5.9 Density principle

WCPOS is dense by nature on the cashier surface — we're not making it spacious everywhere, we're making density *legible*. Whitespace where it helps eyes scan; tightness where it helps eyes count. Surface principles in Section 6 govern *where* density applies. The merchant and admin surfaces are notably more breathable than the cashier surface.

## 6. Surface principles — three different worlds

WCPOS has three fundamentally different design surfaces. Mixing the rules of one into another is the most common failure mode in POS design. The redesign treats them as distinct.

### 6.1 The Cashier surface
**Where:** POS register, cart panel, checkout modal, receipt modal.

**Who:** the cashier mid-transaction, often with a customer waiting.

**Rules:**
- Speed and accuracy over everything else.
- Information density is high — but everything on screen earns its place.
- Big tap targets. Fitts's Law: pay button = biggest, most reachable button on the screen.
- Muscle memory matters more than discoverability — same button in the same place every time.
- High contrast (retail lighting, sun glare, fluorescents).
- No "advanced" controls visible by default. If a feature isn't used 50+ times a day, it doesn't live here.
- Customisation happens *behind* the surface (Display Settings panel), not on it.

**Reference patterns:** Square Register, Toast, Lightspeed.

### 6.2 The Merchant surface
**Where:** Products, Orders, Customers, Coupons, Reports.

**Who:** the shop owner doing back-office work, mid-density tasks. Less time pressure than the cashier surface.

**Rules:**
- Mid-density. Tables, filters, sort, search.
- Inline editing is OK and expected — that's the whole point of these screens.
- Show counts, totals, summaries — context matters here.
- Deeper filtering and column customisation is welcomed (Display Settings live here).
- Pro upgrade overlay is a first-class state on these screens.
- Keyboard navigation matters on web/desktop.

**Reference patterns:** Linear's issue list, Stripe Dashboard, Notion's database views.

### 6.3 The Admin / Configuration surface
**Where:** Settings (printer, receipt templates, print routing, barcode, plugins, tools, logs), tax rates, store editor, payment gateway configuration.

**Who:** a developer, agency, or technically-minded shop owner. Set-up time, not in-the-moment.

**Rules:**
- Wide. Deep. Every option exposed if the user wants to find it.
- Tabs, sidebars, sections — hierarchical and navigable.
- Technical language is OK ("REST API", "ESC/POS", `pos_type`) — the audience is technical.
- "Advanced settings" collapsibles are expected.
- Defaults work; experts customise.
- Plugin / extension ecosystem visible here.

**Reference patterns:** WordPress Admin, Stripe Dashboard settings, VS Code settings.

### 6.4 What this means for the redesign

When designing any screen, name its surface first. The same component (a table, a button, a card) might render differently based on which surface it's in:

- Button on the Cashier surface: large, brand red, full-width on the cart, generous tap target.
- Button on the Merchant surface: standard size, brand red for primary actions, outline for secondary.
- Button on the Admin surface: standard size, may sit in a row of equal-weight controls.

Surface-aware design also means **transitions between surfaces are deliberate**. Going from the Cashier surface (POS register) to the Admin surface (settings) is a *modal* — visually distinct, pulled out of the cashier's normal flow.

## 7. Customisation is a feature

WCPOS isn't a Stripe-style fixed-aesthetic product. WordPress and WooCommerce users expect deep customisation, and so do WCPOS users:

- Currency precision (0–8 decimal places per WC store config)
- Tax rules (per region, per product class, per location)
- Receipt templates (HTML, thermal XML, legacy PHP — plus the Template Gallery)
- Payment gateways (varies per region; Pro adds card terminals)
- Display Settings (column visibility, tile size, quick discount values, COGS toggle)
- Per-store config (Pro: per-store pricing, templates, tax rates, opening hours)
- Plugins and extensions (WordPress ecosystem)
- Six theme options (System, Light, Dark, Ocean, Sunset, Monochrome)
- Multi-language (RTL, character-tall scripts, long German strings)

**The design challenge:** look simple at first glance, but expose deep customisation for users who want it.

### 7.1 Patterns for managing the simplicity / customisation tension

| Pattern | Used for | Reference |
|---|---|---|
| **Defaults that work** | Most users never touch settings — sensible defaults are the difference between "easy" and "broken-out-of-the-box". | Apple, Square. |
| **Progressive disclosure** | "Advanced settings" collapsibles. Show the simple form; let users expand for power. | Stripe, Linear. |
| **Contextual menus** | Right-click on web, long-press on native, "..." overflow buttons. Power lives one click away. | Notion, Figma. |
| **Settings as a separate world** | Don't make the cashier surface configurable in real-time. Settings is a modal. | Square, Lightspeed. |
| **Display Settings per screen** | Each Merchant screen has its own UI Settings panel — column visibility, tile size, etc. The user customises the view, not the data. | Linear's view properties. |
| **Plugin / extension marketplace** | Lift extensibility to a first-class surface. Don't hide it under "advanced". | WordPress admin, Raycast. |
| **Roles affect visibility** | The cashier persona sees less; the admin/agency persona sees more. (Currently partial in WCPOS.) | Most enterprise SaaS. |

### 7.2 Customisation surfaces that need redesign attention

- **POS Display Settings** — sliding panel from the products grid. Toggle columns (price, tax, sale, category, SKU, barcode, stock, COGS), adjust tile size (2–8 columns), set quick discount percentages. Today functional but utilitarian. Should feel like a Linear "view options" panel — power-user-friendly, calm.
- **Receipt Templates** — pick which templates are active, set default, edit source. The Template Gallery (admin) feels intentional already; the in-app switcher could feel more like a Notion block menu.
- **Print Routing** — per-template printer overrides. Power-user feature; deserves a clean "match templates to printers" UI rather than a settings table.
- **Theme picker** — six options shipped (System, Light, Dark, Ocean, Sunset, Monochrome). Could become a delightful theme-preview surface — show a tiny live render of the cart in each theme rather than a colour swatch.
- **Plugins / Extensions** — extension directory, install/activate/auto-update flow. Aim for a Stripe Marketplace or VS Code Extensions feel rather than the WordPress plugin admin density.

### 7.3 Anti-patterns to avoid

- **Settings buried under settings buried under settings.** WordPress admin's worst trait. Three levels deep, max.
- **Customisation that breaks the cashier surface.** A user toggling a Display Setting should never break the cart.
- **Showing all advanced options to everyone.** The cashier shouldn't see tax-rate-precision settings on the register.
- **"Advanced mode" toggles that disable simple mode.** Customisation should be additive, not replace simplicity.
- **Power features hidden so well no one finds them.** If the agency persona can't find right-click menus or column toggles, the customisation isn't useful.

## 8. Constraints (non-negotiable)

These are bright lines for the redesign — every mockup must respect them:

1. **Offline-first.** The cart, products, customers must look identical online and offline. The connectivity indicator (green / yellow / red dot in the header) is the only visual that changes.
2. **Currency precision varies 0–8 decimal places.** Never hardcode `2`. JPY shows `¥1,250`; KWD shows `KD 12.345`. Number layouts must accommodate either.
3. **Locales.** Right-to-left languages, long German strings, character-tall scripts. Buttons must wrap or truncate gracefully.
4. **No platform-specific designs.** A button looks the same on iOS, Android, web, and desktop (with platform-appropriate touch targets).
5. **Free vs Pro overlay.** Pro-only screens render the real screen with their actual data behind a frosted-blur overlay + upgrade card. The redesign needs to look intentional with the blur on.
6. **Reliability over features.** If a redesign change introduces a state where the cashier is unsure what to do, it does not ship.
7. **Cross-platform component library.** We are working with what's in `@wcpos/components` (60+ components). Mockups should reuse what exists, not invent net-new primitives unless we explicitly add to the library.

## 9. The component library — what to draw with

Available primitives in `packages/components/src` (group by purpose):

**Layout**: HStack, VStack, Panels, Card

**Form**: Button (10 variants × 5 sizes), ButtonGroup, ButtonPill, IconButton, Input, InputGroup, Textarea, Label, Form, Checkbox, Switch, RadioGroup, Select, Combobox, TreeSelect, TreeCombobox, Slider, ToggleGroup, Toggle, Numpad, Calendar

**Feedback**: AlertDialog, Dialog, Modal, Toast (Sonner), Tooltip, Popover, HoverCard, Progress, Loader, ErrorBoundary, Suspense

**Navigation**: DropdownMenu, ContextMenu, Tabs, Command, Accordion, Collapsible

**Data**: DataTable (TanStack), Table, Tree, VirtualizedList, ListItem (with Avatar, title, subtitle, trailing slot), SortIcon

**Display**: Badge, StatusBadge, Avatar (with initials fallback), Image, Icon, Text, Format, FormatNumber, Logo

**Specialized**: Numpad (POS-specific), Calendar, KeyboardController, Print, DnD, Portal, Pressable, WebView

**Variant pattern**: built on `class-variance-authority`. Buttons have `variant` × `size` matrices: 10 colour variants (default / destructive / secondary / muted / success / info / attention / warning / error + outline-* + ghost-*) × 5 sizes (xs / sm / default / lg / xl).

## 10. Information architecture (current)

Top-level routes (Expo Router file-system routing):

```
(auth)/connect              — Initial setup: site → user → store

(app)/(drawer)/             — Main authenticated drawer
  (pos)/                    — POS register (THE hero screen)
    (columns)/              — Tablet / desktop layout (products + cart side-by-side)
    (tabs)/                 — Phone layout (products / cart as tabs)
    (modals)/               — checkout, receipt, add-misc-product
  products/                 — Product management (Pro-gated for free users)
  orders/                   — Order history (Pro)
  customers/                — Customer management (Pro)
  coupons/                  — Coupon management
  reports/                  — Reports (Pro)
  logs/                     — Diagnostic logs
  support/                  — Help / contact

(app)/(modals)/
  settings                  — Settings tabs (printer, receipt templates, barcode, etc.)
  tax-rates                 — Tax rates configuration
```

**Navigation chrome:** sidebar drawer with the dark sidebar token (`--sidebar`, `--sidebar-foreground`). Header has connectivity indicator dot, store switcher, notifications bell with unread badge, user avatar.

## 11. The redesign in phases (recommended)

You don't have to do this all at once. Recommended order:

### Phase 0 — Tokens & primitives audit (no design work)
- Pick which of the 6 themes is canonical. Recommendation: **Light + Dark** as the canonical pair — System auto-resolves to one of these; Ocean / Sunset / Monochrome are re-derivations.
- Decide if any token is missing or duplicated.
- Re-render existing primitives against the chosen tokens; flag visual debt.

### Phase 1 — Hero screen: POS register (tablet, columns)
This is *the* screen. If the redesign nails the POS register, everything else is downstream. Generate mockups for:
- Default state: products grid (left), cart panel (right), header
- Cart with line items, discounts, customer attached
- Checkout in progress (gateway selection → payment processing → success)
- Empty cart state
- Offline state (what changes, what doesn't)

### Phase 2 — Hero on phone (tabs layout)
The same screen, vertical, tab-switched. Sanity-check that the design language holds when the layout is fundamentally different.

### Phase 3 — Receipt modal + checkout flow
The high-stakes moment. Receipt modal with template switcher, fiscal/live toggle, printer switcher, mismatch badges. Checkout modal with gateway picker.

### Phase 4 — Connect / onboarding
First impression. The site → user → store flow. Empty state, error states, success state.

### Phase 5 — Settings (printer first)
Settings is a large surface. Start with the printer tab (the most-touched and most-frustrating area today: empty state, add-printer dialog with auto-detect, advanced settings collapsible, print routing).

### Phase 6 — Pro-gated screens with frosted overlay
Free users see real data behind blur + upgrade card. The blur look must be intentional, not accidental.

### Phase 7 — Reports / end-of-day
The newest feature surface. Smaller charts, clear daily summary, exportable.

## 12. Working with claude.ai/design

A few patterns that produce better mockups for this app:

**Always tell it the form factor.** "Design the POS register screen for **tablet landscape, 1024×768**." Otherwise it defaults to desktop browser.

**Tell it the persona viewing the screen.** "The user is a small-shop owner mid-transaction with a customer waiting." This shifts the design away from "showcase" toward "in use".

**Reuse the token names.** Tell it the palette uses `--primary`, `--card`, `--card-header`, `--sidebar`, `--success`, `--warning`. It will produce designs that map cleanly back to your existing tokens.

**Tell it the constraint.** "Cart must show 8+ line items without scrolling on a 768px-tall screen." Specific constraints produce specific designs.

**Iterate one slice at a time.** Get the cart panel right, then the products grid, then the header. Trying to redesign the whole register at once produces mush.

**Bring in the actual components.** Tell it: "use the existing Button (variant=default, size=default), Card, ListItem, StatusBadge primitives — don't invent new ones."

See `04-starter-prompts.md` for ready-to-paste prompts for the priority screens.

## 13. Success criteria

The redesign is "done" (per phase) when:

- [ ] A small-shop owner can complete a sale on a tablet without thinking about the UI.
- [ ] A new cashier can connect a site and open the POS in under 3 minutes without instructions.
- [ ] The same screen reads well on a 7" phone, a 12" tablet, and a 27" desktop.
- [ ] Currency renders correctly for JPY (0 dp), USD (2 dp), and KWD (3 dp) without layout breaks.
- [ ] Offline state is visually obvious without being alarming.
- [ ] Light and Dark themes both look intentional — not "Light, then inverted".
- [ ] Pro upgrade overlay reads as a feature, not a bug.

## 14. Production constraint — incremental, never big-bang

**The app is in production with ~6,000 active installations. Nothing about this redesign justifies breaking the live app.**

The redesign is delivered as a **slow rollout via release cadence**, not a flag flip:

1. **One change per release.** Each release ships a focused, self-contained piece — a token recalibration, one component, one screen. Never bundle.
2. **Tokens first, screens last.** Tokens are invisible — moving them is the lowest-risk change you can make. Screens are the highest-visibility — move them last.
3. **No feature flags.** Self-hosted stores upgrade at their own pace, so the rollout is naturally gradual. Adding a flag layer would be infrastructure for its own sake. Visual regression and small releases are the safety net instead.
4. **Fix forward, not parallel versions.** If a release has a regression, ship a patch release. Don't carry old + new code in parallel.
5. **The cart never breaks.** Whatever else changes, completing a sale on the POS register must work on every release. The register is the last thing redesigned.
6. **Backward compatibility on data.** No design choice forces a schema migration. RxDB collections, server payloads, and printer profiles are all unchanged by the redesign.
7. **Beta channel for high-stakes releases.** Connect, Receipt modal, and especially the POS register get 1–2 weeks on a beta channel (EAS Update branch for native, separate jsDelivr URL for web) before stable.

See `05-migration-plan.md` for the concrete phased plan, release-by-release.

## 15. Out of scope for the redesign

- Receipt template designs themselves (the gallery covers this — we have HTML and thermal templates already)
- WordPress admin UI (separate codebase, separate design)
- Marketing site (`wcpos.com`)
- Plugin install / activation flow inside WordPress (PHP plugin admin pages)
