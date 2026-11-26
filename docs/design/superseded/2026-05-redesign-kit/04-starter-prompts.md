# Starter Prompts for claude.ai/design

Five ready-to-paste prompts, one per priority screen. Each is self-contained — paste into claude.ai/design as a single message.

> **How to use these:** copy a prompt, paste into claude.ai/design, generate, iterate. If the first generation isn't right, refine *one* aspect at a time ("the cart panel feels too cramped — give the line items more vertical breathing room") rather than rewriting the whole prompt.

> **Tip:** open `01-design-brief.md` in another tab. If a prompt below feels under-specified for your taste, paste in the relevant section of the brief at the top.

## Aesthetic anchor (used by every prompt)

The application is for "look at it all day every day" — calm, modern, restrained, neutral. Reference apps: **Linear, Stripe Dashboard, Notion, Figma, Apple Notes**. Mostly grayscale chrome with **one signature accent used sparingly**.

The WCPOS marketing palette (Slate / Red / Cream from `/Users/kilbot/Projects/wcpos-brand/`) is for the marketing website, not the app. The brand shows up in the app surgically: the logo, the Pay/Checkout button (brand Red `#CD2C24`), the Connect/auth screen, the Pro upgrade overlay, illustrated empty states. Everywhere else is calm grayscale.

**App palette (use these in every mockup):**

| Token | Light theme | Dark theme |
|---|---|---|
| Background | warm near-white `oklch(0.985 0.004 65)` | warm near-black `oklch(0.18 0.005 250)` |
| Card | near-white `oklch(0.99 0.002 60)` | one step lighter `oklch(0.22 0.005 250)` |
| Card-header / toolbar | very subtle gray `oklch(0.96 0.003 60)` | `oklch(0.27 0.005 250)` |
| Sidebar | deep warm gray `oklch(0.25 0.004 250)` | darkest `oklch(0.13 0.005 250)` |
| Foreground (text) | `oklch(0.20 0.01 250)` | `oklch(0.95 0.003 60)` |
| Muted text | `oklch(0.55 0.005 60)` | `oklch(0.62 0.005 60)` |
| Border (hairline) | `oklch(0.92 0.003 60)` | `oklch(0.30 0.005 250)` |
| Primary action (Pay button only) | brand Red `#CD2C24` | brand Red `#CD2C24` (slightly brighter for contrast) |
| Success | muted green `oklch(0.55 0.10 155)` | same |
| Warning | muted amber `oklch(0.70 0.12 75)` | same |
| Error | muted red `oklch(0.55 0.18 25)` | same |
| Info | muted blue `oklch(0.55 0.10 235)` | same |

**Hover and pill backgrounds** use soft tints (`--accent-soft` = foreground at ~6% opacity over the surface; `--primary-soft` = primary at ~10%). Not opacity changes on the element itself.

**Critical rules:**
- Never pure black (always warm near-black). Never pure white (always warm near-white).
- Brand Red appears only on Pay / Checkout / primary CTAs — sparingly. Most buttons are outline, ghost, or muted-fill in neutrals.
- System fonts only (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`). No custom fonts.
- Card radius: 12px. Button radius: 8px. Pill radius: full.
- Soft single-direction shadows for elevation. Borders are hairline and subtle.
- Tabular figures for prices.
- 1.5px stroke icons, rounded line-caps.
- Calm motion only. No bouncy transitions.

**Surface awareness** (see brief Section 6): the cashier surface (POS register, receipt) is dense + simple + brand-Red Pay button. The merchant surface (products, orders, customers) is mid-density + inline editing + neutral chrome. The admin surface (settings, plugins) is wide + deep + technical + neutral chrome. Tell claude.ai/design which surface you're designing.

---

## Prompt 1 — POS Register, tablet (the hero)

```
Design the main POS register screen for WCPOS, a Point-of-Sale app for WooCommerce.

CONTEXT
- Form factor: tablet, landscape, 1024×768 (typical iPad-class device on a counter).
- User: small-shop owner, mid-transaction with a customer waiting. Touch-first, no mouse, staff are not careful tappers.
- Surface: Cashier surface — speed and accuracy over everything else, big tap targets, brand-Red Pay button.
- Aesthetic anchor: Linear's calm + Stripe Dashboard's restraint + Square Register's POS-savvy layout. Warm near-white background (Light) or warm near-black (Dark). Calm warm-gray sidebar — NOT brand Slate. The ONLY brand color in this screen is the Pay button (brand Red `#CD2C24`). Everything else is neutral grayscale. System fonts only.
- Dense where it helps (line items, totals — eye needs to count). Breathable everywhere else.

LAYOUT
- Two-column layout. LEFT (about 65% width): products grid. RIGHT (about 35% width): cart panel.
- Top: a slim header bar spanning both columns with: store switcher, connectivity indicator dot (green = connected), notifications bell (with unread count badge), user avatar.
- Left edge: a thin dark sidebar (collapsible drawer) with navigation icons for POS, Products, Orders, Customers, Coupons, Reports, Settings. Use the --sidebar token (dark blue-grey).

PRODUCTS GRID (left column)
- Search input at the top with a barcode-scan icon.
- Below: a row of category filter chips (use ButtonPill components).
- Below: the grid itself — product tiles, 4 columns, each tile shows the product image, name, price (currency-aware), and a small stock indicator. A "Variants" badge appears on variable products. Tile size is configurable but show 4 columns here.
- Footer: a row of quick-action buttons — toggle to table view, scan barcode, add misc product.

CART PANEL (right column)
- Card with --card-header toolbar at top reading "Order #" and a customer chip ("Walk-in customer" by default; tap to attach a customer).
- Body: list of line items. Each line shows: product name + variation (if any), quantity stepper (- count +), unit price, line total. Sub-rows for applied discounts with a small "x" to remove.
- Below the line items: applied coupons as ButtonPill components (removable).
- Below: a row of quick-discount percentage buttons (5%, 10%, 15%, 20%) — these apply to the entire order.
- Footer (sticky bottom): subtotals (Subtotal, Tax, Discount, Total). Totals use larger, bolder type. A big primary "Checkout" button at the very bottom (full-width of cart panel).

DESIGN TOKENS (use the calm app palette — Linear / Stripe Dashboard feel)
- Surfaces (Light): --background = warm near-white (oklch(0.985 0.004 65)), --card = near-white (oklch(0.99 0.002 60)), --card-header = subtle gray (oklch(0.96 0.003 60)), --sidebar = deep warm gray (oklch(0.25 0.004 250))
- Surfaces (Dark): --background = warm near-black (oklch(0.18 0.005 250)), --card = oklch(0.22 0.005 250), --card-header = oklch(0.27 0.005 250), --sidebar = darkest oklch(0.13 0.005 250)
- Text (Light): --foreground = oklch(0.20 0.01 250), --muted-foreground = oklch(0.55 0.005 60)
- Text (Dark): --foreground = oklch(0.95 0.003 60), --muted-foreground = oklch(0.62 0.005 60)
- The Pay/Checkout button: brand Red #CD2C24 — this is the ONLY brand color visible on this screen. White text on Red.
- Most other buttons: outline (hairline border, transparent background, foreground text) or ghost (no border, --accent-soft hover)
- Semantic: success oklch(0.55 0.10 155), warning oklch(0.70 0.12 75), error oklch(0.55 0.18 25), info oklch(0.55 0.10 235) — all muted, not vibrant
- Borders: hairline, very subtle (--border)
- Radius: cards 12px, buttons 8px, pills full
- Shadows: soft, single-direction (top-left light source). Cards have shadow-sm; cart panel has shadow-md.
- Hover states: tinted-soft backgrounds (--accent-soft = foreground at ~6%), not opacity changes.

TYPOGRAPHY
- System fonts only: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...
- Tabular figures for prices.

DRAW IT IN BOTH LIGHT AND DARK
Show the design twice, side-by-side: once in Light theme (warm near-white background, never pure white), once in Dark theme (warm near-black, never pure black). Both themes use brand Red ONLY for the Pay/Checkout button — that's the single point of WCPOS brand identity in this screen. Everything else is calm grayscale.

STATES TO SHOW
- Cart has 5–6 line items including one with a variation, one with a quantity > 1, and one with a discount applied.
- Customer is attached (show their name in the customer chip).
- One coupon is applied.
- Connectivity dot is green.
- Show 16+ products in the grid, with at least 2 marked "On Sale" and 1 marked "Out of stock".

CONSTRAINTS
- All currency values use the same locale formatting. Show $ amounts but design as if values could be 0–8 decimal places (don't hardcode 2dp into layout).
- Buttons must be at least 44×44px tap targets.
- Don't invent net-new components — assume there's a library of: Button, Card, Input, ListItem, Avatar, Badge, StatusBadge, ButtonPill, Tooltip.

Output: a single high-fidelity mockup, both Light and Dark.
```

---

## Prompt 2 — POS Register, phone (tabs layout)

```
Design the main POS register screen for WCPOS on a phone (iPhone 14-class, 390×844 portrait).

CONTEXT
- User: event seller at a market or popup. Phone in one hand, customer in front of them. Touch-only.
- This is the same app as the tablet POS — same component library and design tokens — but with a phone-appropriate layout. The design language (colours, type, spacing) must match the tablet version.
- Surface: Cashier surface, mobile.
- Aesthetic anchor: Linear iPhone app + Cash App's register feel — calm, modern, restrained. Warm near-white background (Light) or warm near-black (Dark). Brand Red `#CD2C24` ONLY on the Pay/Checkout CTA. Everything else is neutral grayscale. System fonts only.

LAYOUT
- A tab bar at the bottom: "Products" tab (default) and "Cart" tab. The Cart tab shows a small badge with line item count.
- Top: minimal header — drawer hamburger, store switcher (compact), connectivity dot, notifications bell.
- The Products tab and Cart tab each fill the screen below the header and above the tab bar.

PRODUCTS TAB
- Search input + barcode scan icon.
- Category filter chips, horizontally scrollable.
- Grid of product tiles, 2 columns, large enough to read product names. Each tile: image, name, price.

CART TAB
- Order number + customer chip at top.
- Scrollable list of line items, each with quantity stepper.
- Quick discount chips in a horizontal scroll row.
- Sticky footer with totals stack and a big full-width primary "Checkout" button.

DRAW IT
Three frames side-by-side:
1. Products tab, several products visible, no items in cart yet
2. Cart tab, 4 line items, customer attached, totals visible
3. Cart tab, EMPTY STATE — a friendly illustration or icon and text "No items yet — tap a product to add it to the cart"

USE THE SAME DESIGN TOKENS as the tablet version: --primary (blue), --card, --card-header, --footer, --background, --foreground.

CONSTRAINTS
- Tap targets minimum 44×44px.
- Designed for thumb reach — primary actions in the lower half of the screen.
- Bottom-tab navigation must clear the iOS home indicator.
```

---

## Prompt 3 — Receipt modal

```
Design the receipt modal for WCPOS, a WooCommerce POS app. This modal opens after checkout completes (or when re-printing a past order).

CONTEXT
- Form factor: tablet, landscape, but the modal itself is a centered dialog about 600px wide and most of the screen tall.
- The receipt itself is rendered in a WebView inside the modal — shown as monospace text mimicking a thermal printout, or as styled HTML for HTML templates.
- User: cashier finishing a transaction. May want to: change template, switch fiscal/live mode, change which printer it goes to, reprint, email the receipt.
- Surface: Cashier surface (a modal pulled out of the register flow).
- Aesthetic anchor: Linear modal + Stripe's receipt modals — calm, restrained, refined. Modal surface is near-white (Light) or one-step-lighter-than-background near-black (Dark) with soft shadow-lg. 12px radius. Brand Red `#CD2C24` ONLY for the Print primary action button. The "Fiscal confirmed" banner uses muted success-soft background, not bold green. Calm motion on entry. Tabular figures inside the receipt.

LAYOUT (top to bottom inside the modal)
- Header bar:
  - Title "Receipt" + small order number (e.g. "Order #1234")
  - Right: close (X) button
- Toolbar row 1 (template + printer):
  - Template switcher (dropdown) — current template name + a small badge ("Offline" or "PHP" or "Thermal")
  - Printer switcher (dropdown) — current printer name OR "System Dialog" OR "Auto"
  - A small amber MismatchBadge appears next to the printer if the current template/printer pairing is incompatible
- Toolbar row 2 (mode + status):
  - A ToggleGroup with two options: "Fiscal" / "Live" (only shown when the order has a fiscal snapshot)
  - A small "Mode: Live" or "Mode: Fiscal" pill on the right
- Status banner (full-width):
  - When fiscal submission is confirmed: a thin green banner "Fiscal receipt confirmed"
  - When pending: thin yellow banner "Fiscal submission pending..."
  - When failed: thin red banner with a "Retry" button
- Main body: the receipt content (WebView). Show a thermal-style monospace preview with: store header, line items, subtotal/tax/total, payment method, "Thank you" footer.
- Footer bar (sticky):
  - Left: a small "Syncing with server..." badge (only visible during the optimistic local-first → API upgrade window)
  - Right: two buttons — "Email" (outline, disabled when offline) and "Print" (primary)

DRAW THREE STATES side by side
1. Default — Live mode, template switcher visible, printer auto-resolved, no banner
2. Fiscal confirmed — Fiscal toggle selected, green banner visible, both Live and Fiscal options in the toggle group
3. Mismatch — thermal template selected but System Dialog printer chosen, amber MismatchBadge visible, Print button still active but with a tooltip/warning state

DESIGN TOKENS
- Modal surface: --popover, --popover-foreground
- Card header tone: --card-header
- Banners: --success (green), --attention (yellow/amber), --error (red)
- Buttons: --primary for Print, outline for Email

CONSTRAINTS
- The receipt body itself should look like a real thermal-paper receipt (monospace, narrow column).
- Modal should feel calm — banners are subtle, not alarming.

Output: the three states side-by-side in light theme, plus the same three in dark theme below.
```

---

## Prompt 4 — Connect / Auth flow (first-launch onboarding)

```
Design the Connect screen for WCPOS — the first thing a user sees when they launch the app for the first time, or after logging out. This is a three-step flow: site → user → store.

CONTEXT
- Form factor: design for tablet portrait (768×1024) — the Connect screen is laid out the same on phone and tablet, so a tall layout works for both.
- User: small-shop owner setting up the POS for the first time, OR an event seller picking the app back up after months of inactivity.
- Tone: warm welcome, not corporate. Help text in plain language. The user might not be a native English speaker. Voice: straight-talking developer ("Connect your store" not "Embark on your retail journey").
- Surface: Marketing-adjacent — this is the first impression, before any cashier work. Slightly more brand-forward than the rest of the app is allowed here.
- Aesthetic anchor: Stripe Connect onboarding + Linear's first-launch flow + a hint of the WCPOS marketing warmth. Warm near-white background (Light) / warm near-black (Dark). The empty-state illustration can use Cream `#F5E5C0` as a warm accent (this screen is the closest the app gets to marketing). Brand Red `#CD2C24` on the active Stepper step and the "Open POS" primary button. Logo prominently displayed at the top. Soft shadow-sm on the site accordion cards. 12px card radius. Generous whitespace.

LAYOUT
- Top: WCPOS logo (centered) + small "Connect to your store" title.
- Below: a Stepper showing three steps: 1. Site → 2. User → 3. Store. Active step is highlighted.
- Below: the body, which changes per step.

STEP 1 — Add Site
- An input field "WordPress site URL" with placeholder "https://yourstore.com"
- Below: a list of previously-connected sites (each is an Accordion row with the site favicon as Avatar, site title, site URL as subtitle, and a StatusBadge for online/offline).
- Each accordion expands to reveal connected users (Step 2 inline).

STEP 2 — Choose user (inside expanded site accordion)
- List of authorised WordPress users. Each row uses a ListItem: Avatar (with initials fallback if the gravatar fails), display name as title, role tags as subtitle, "Open" or "Re-auth" trailing button.
- An "Add User" button at the bottom that triggers a browser-based OAuth flow.
- Selecting a user reveals Step 3 inline.

STEP 3 — Choose store (inside expanded user)
- A RadioGroup of stores the user has access to. Single-store sites auto-select.
- Each radio shows the store name, address (small, muted), and a StatusBadge for hours (Open / Closed / Open in 2h).
- Below: a primary "Open POS" button (full-width). Disabled until a store is selected; enabled the moment one is.

STATES TO DRAW
1. EMPTY (first launch) — no sites yet, just the "Add WordPress site URL" input and a friendly empty-state illustration with the text "Connect your WooCommerce store to get started"
2. ONE SITE, MULTI-STORE — site accordion expanded, user selected, three stores visible as radios, none selected
3. ONE SITE, SINGLE STORE — auto-selected, "Open POS" button live and inviting
4. ERROR — toast at the top saying "Couldn't connect to that site. Check the URL and try again." (use --error tone, plain language)

DESIGN TOKENS
- Surfaces: --background, --card
- Stepper: active step uses --primary, inactive --muted
- Buttons: primary ("Open POS"), outline ("Add User")

CONSTRAINTS
- Empty state should feel inviting, not empty.
- Error states use plain language. "Couldn't connect" not "ECONNREFUSED".
- The flow should be obvious to someone who has never seen it AND obvious to someone returning after 6 months.

Output: the four states in a 2×2 grid, light theme. Below, the same 2×2 in dark theme.
```

---

## Prompt 5 — Settings: Printer tab (the redemption arc)

```
Design the Printer settings tab in WCPOS. Today this is the most-frustrating area of the app for new users — multiple states, vendor auto-detection, advanced settings, web vs native differences. This redesign should make it feel calm and obvious.

CONTEXT
- Form factor: settings opens as a large modal on tablet/desktop (about 900×700) and full-screen on phone. Design for the modal version.
- The Settings modal has a left-side tab list: Printer, Receipt Templates, Print Routing, Barcode, Logs, Plugins, Tools. Show the Printer tab active.
- User: shop owner setting up their first thermal printer. They have an Epson TM-m30 plugged into their network. They know its IP address but not much else.
- Surface: Admin / Configuration surface — wide and deep is OK here, technical language is welcome (the audience is technical or at least technically-curious), advanced-settings collapsibles expected.
- Aesthetic anchor: Stripe Dashboard Settings + Linear Settings + Notion Settings. Calm, generous, refined, fully neutral chrome. Empty state has a beautifully crafted printer illustration (line-style, single-direction shadow, monochrome with a small Cream accent for warmth). The auto-detect "Detected: Epson" pill uses a soft success-tinted background with calm green text, not a bold green chip. Card radius 12px, dialog radius 12px, subtle shadow-md on the dialog overlay. Primary "Save" button uses brand Red `#CD2C24`. Settings tab list (left side): hairline-bordered, hover uses --accent-soft tint, active uses a slightly darker tint and a left-edge brand-red accent bar (NOT a red background).

LAYOUT (Printer tab content)
- Section header: "Printers" + a small "Add Printer" button (top-right of the section).
- Below: the printer list.

DRAW FIVE STATES side-by-side or stacked

STATE 1 — EMPTY STATE (no printers configured yet)
- A dashed-border card centered in the section.
- Icon (printer-with-plus) + heading "No printers yet" + body "Add a network printer to print receipts directly. You only need the printer's IP address — we'll detect the rest automatically."
- A primary "Add Printer" button.
- Small note below: "On web, only Epson and Star printers are supported. Other vendors require the desktop app." (only when on web)

STATE 2 — ADD PRINTER DIALOG (open over the empty state)
- A focused dialog overlay.
- Title: "Add Printer"
- Two simple fields: "Name" (placeholder "Receipt Printer") and "IP address".
- Below: a collapsed "Advanced settings" section (chevron-right, label).
- Footer: "Cancel" (outline) and "Save" (primary).

STATE 3 — IP ENTERED, AUTO-DETECTING
- Same dialog, IP filled in.
- A small inline indicator next to the IP field: a tiny spinner + "Detecting vendor..."
- Advanced settings is still collapsed.

STATE 4 — AUTO-DETECTED
- IP field shows the value, and a small green pill "Detected: Epson" appears next to it.
- Advanced settings can stay collapsed (it's auto-populated). If expanded, show: Vendor (Epson, with the auto-detect badge), Port (8043), Language (ESC/POS), Paper width (80mm).
- Save button is now active.

STATE 5 — PRINTER LIST (with one printer added)
- Two rows in the printer list:
  1. "Receipt Printer" (Epson, 192.168.1.50, ESC/POS, 80mm) — with a green dot indicating reachable, and an Edit button
  2. "System Print Dialog" (always present, can't be deleted) — small explanatory subtitle "Browser/OS print dialog"
- A subtle "Default" star next to the chosen default.
- "Add Printer" button still visible at the section header.

DESIGN TOKENS
- Cards: --card, --card-header
- Empty state border: dashed, --border colour
- Auto-detect badge: --success (green) for confirmed, --muted for in-progress
- Buttons: primary ("Add Printer", "Save"), outline ("Cancel", "Edit")

CONSTRAINTS
- Each state should feel like a step in a calm conversation, not a form interrogation.
- Plain language throughout. No "ePOS endpoint" or "SOAP" — those are implementation details.
- Empty state must not feel empty — it should feel inviting.

Output: the five states stacked vertically, light theme. Then the same five in dark theme below.
```

---

## Bonus prompt — Tokens & primitives reference sheet

Useful as a one-shot prompt to get a single image you can pin and reference for everything else:

```
Generate a design system reference sheet for the WCPOS Point-of-Sale app — a single shareable image showing:

AESTHETIC ANCHOR
The reference sheet should feel like a Linear / Stripe Dashboard / Notion design system page. This is for a "look at it all day every day" application, NOT for marketing. Mostly grayscale chrome with one signature accent (brand Red) used sparingly. Restrained, refined, calm. Soft single-direction shadows. 12px corner radius on cards, 8px on buttons, full-radius on pills.

NOTE: WCPOS has a separate marketing palette (Slate / Red / Cream from wcpos-brand/) — that's for the marketing website. This reference sheet is for the APP, where the visual system is calm and neutral.

1. PALETTE — Light theme + Dark theme side-by-side. Swatches in OKLCH:
   - **Surfaces (Light)**: --background = oklch(0.985 0.004 65) [warm near-white, NOT pure white], --card = oklch(0.99 0.002 60), --card-header = oklch(0.96 0.003 60), --sidebar = oklch(0.25 0.004 250)
   - **Surfaces (Dark)**: --background = oklch(0.18 0.005 250) [warm near-black, NOT pure black], --card = oklch(0.22 0.005 250), --card-header = oklch(0.27 0.005 250), --sidebar = oklch(0.13 0.005 250)
   - **Text**: foreground oklch(0.20 0.01 250) [light] / oklch(0.95 0.003 60) [dark]; muted-foreground oklch(0.55 0.005 60) [light] / oklch(0.62 0.005 60) [dark]
   - **Borders**: hairline, very subtle — oklch(0.92 0.003 60) [light] / oklch(0.30 0.005 250) [dark]
   - **Primary action (used SPARINGLY)**: WCPOS brand Red `#CD2C24`. The reference sheet should show it on exactly one button (the "Pay" example) — that's the discipline.
   - **Semantic (muted, not vibrant)**: success oklch(0.55 0.10 155), warning oklch(0.70 0.12 75), error oklch(0.55 0.18 25), info oklch(0.55 0.10 235)
   - **Soft-tint tokens** for hover backgrounds and pill backgrounds: --accent-soft (foreground at ~6%), --primary-soft (Red at ~10%), --success-soft, --warning-soft, --error-soft (each at ~12%).

2. TYPOGRAPHY — the type scale: 3xs, 2xs, xs, sm, base, lg, xl, 2xl, 3xl. Show each at the correct size with sample text.

3. BUTTONS — every variant (primary, secondary, outline, ghost, destructive, success, warning) at default size. Plus button states: default, hover (--accent-soft tint background, not opacity), pressed, disabled, loading. Buttons are 8px radius. The "primary" variant uses brand Red `#CD2C24` with white text — but in real screens, only used on Pay/Checkout/primary-CTA. "Secondary" uses --card-header background with foreground text. "Outline" uses hairline border on transparent. "Ghost" is no border, no background, foreground text.

4. CONTROLS — Input (empty / focused with a soft glow ring / error), Checkbox, Switch, RadioGroup, Combobox, ButtonPill (regular and removable), StatusBadge in the full taxonomy (online, offline, pending, failed, draft, published, sale, out-of-stock). Pills use soft-tint backgrounds (e.g. success-soft for "online"), not bold solid colors.

5. CARDS & SURFACES — a Card (12px radius, shadow-sm) with a card-header toolbar and footer area. A raised Card (shadow-md). A Modal floating over background (12px radius, shadow-lg). A Toast notification in each tone (success, info, warning, error).

6. ROW PATTERNS — a ListItem with avatar, title, subtitle, trailing slot (the canonical row). Hover state uses --accent-soft tinted background.

7. EMPTY STATE — a sample empty state with an illustrated icon (Stripe/Fresha-style line illustration), title, body, primary action button.

Layout the sheet as a single tall A4-portrait image, organised in sections with clear headers. The aesthetic is Stripe / Square / Fresha — calm, refined, modern. Title the sheet "WCPOS Design System v2 — Light + Dark".
```

---

## How to keep iterating

After you generate a mockup you like, save it to `redesign/mockups/` (a folder you create). For each iteration:

1. Note one thing you want to change.
2. Send a focused refinement to claude.ai/design ("the totals stack at the bottom of the cart should be more prominent — heavier type, more vertical space").
3. Save the new version with a numeric suffix (e.g. `pos-register-tablet-v3.png`).

When the design is stable, document the decisions back in this folder as `05-design-decisions.md` so future-you (or a contributor) understands why the design is the way it is.
