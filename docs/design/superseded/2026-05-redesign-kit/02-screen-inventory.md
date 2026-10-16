# Screen Inventory & Redesign Priority

Every screen in the app, grouped by user journey, ranked by redesign priority. P0 = "redesign this first, the rest follows from it"; P3 = "leave for later, mostly mechanical".

## How to read this

Each screen lists:
- **Where in the app** — Expo Router path or component path
- **Form factors** — which layouts exist for it
- **States** — the visual states that need to be designed (default, empty, loading, error, offline, etc.)
- **Why this priority** — the reasoning

## P0 — The hero screens

These set the design language. Get them right, the rest is style propagation.

### POS Register (tablet/desktop, columns layout)
**Path:** `apps/main/app/(app)/(drawer)/(pos)/(columns)/`

**The most-used screen by far.** Products grid on the left, cart panel on the right, header on top.

**States to design:**
- Default — empty cart, products visible
- Filling cart — line items, quantity controls, discount buttons
- With customer attached — customer chip, billing/shipping address visible somewhere accessible
- Coupon applied — coupon line items, discount totals
- Offline — connectivity dot is yellow/red, checkout button shows what's available
- Variations popup — variable product → tap → variations selector
- Misc product / open price item

**Why P0:** every cashier looks at this screen all day. Information density is the central design problem. Everything else inherits from this.

### POS Register (phone, tabs layout)
**Path:** `apps/main/app/(app)/(drawer)/(pos)/(tabs)/`

The same job, vertical, tab-switched (Products tab / Cart tab).

**States:** same as columns plus the tab transition.

**Why P0:** the design language has to bend gracefully to phone. If it doesn't, the redesign isn't truly cross-platform.

---

## P1 — Critical journey screens

Touch a stake-holder once a day or once a sale.

### Receipt modal
**Path:** `apps/main/app/(app)/(drawer)/(pos)/(modals)/cart/receipt/[orderId].tsx` and `(drawer)/orders/(modals)/receipt/[orderId].tsx`

WebView-rendered receipt + header controls.

**States:**
- Standard receipt rendered
- Multi-template available — template switcher dropdown visible
- Fiscal mode (with green confirmed banner / yellow pending / red failed + retry)
- Live mode toggle visible
- Printer switcher with mismatch badge
- Syncing-with-server badge during local→API upgrade
- Offline (email button disabled, PHP templates greyed)

**Why P1:** the moment of customer interaction. High-visibility, currently functional but not delightful.

### Checkout modal
**Path:** `apps/main/app/(app)/(drawer)/(pos)/(modals)/cart/[orderId]/checkout.tsx`

Gateway selection → payment processing → completion.

**States:**
- Gateway picker (multiple gateways with per-gateway order status)
- Card terminal flow (Stripe Terminal, SumUp, PayPal Reader — Pro)
- Cash flow (change due)
- WebView gateway flow (legacy fallback for non-contract gateways)
- Success state → handoff to receipt
- Failure / retry

**Why P1:** the highest-friction moment. Errors here mean lost sales.

### Connect / Auth flow
**Path:** `apps/main/app/(auth)/connect.tsx`, `packages/core/src/screens/auth/`

Three steps: add site → choose user → choose store. Shipping uses a list-of-accordions pattern, with `ListItem`, `StatusBadge`, `Avatar`-with-initials.

**States:**
- First-launch (no sites)
- One site, one user, one store (auto-advance)
- Multiple sites, each expanded shows its users
- Auth in progress (browser hand-off)
- Validation errors (toast with field-level detail)
- Pre-v1.9.0 plugin compatibility (legacy roles, freeform opening hours)

**Why P1:** first impression. Sets the tone before anyone sees the register.

---

## P2 — Configuration & management surfaces

Used regularly but not constantly. Where users are usually less rushed.

### Settings — Printer tab
**Path:** `packages/core/src/screens/main/settings/printer/`

Mentioned at length in the wiki because it's a thicket of states.

**States:**
- Empty state (no printers — dashed-border card with CTA)
- Web-specific empty state (note that browsers only support Epson/Star)
- Printer list (each row with edit button)
- Add Printer dialog — name + IP fields, advanced settings collapsible
- IP entered → vendor auto-detection running
- Auto-detected ("Detected: Epson") with vendor populated
- Manual vendor selection (cancels auto-detect)
- Save → connection test → "Save without testing" escape
- Discovery scan running (mDNS, Bluetooth)
- Discovery results list

**Why P2:** the most frustrating area for new users. Lots of states. Big win if redesigned cleanly.

### Settings — Receipt Templates tab
**Path:** `packages/core/src/screens/main/settings/receipt-templates/`

Editor with field picker, live preview, engine + output type badges.

**States:** template list, edit mode for logicless template, edit mode for thermal XML, read-only legacy PHP, preview rendering.

**Why P2:** important but only touched during setup or when changing receipt design.

### Settings — Print Routing tab

Per-template printer overrides.

**States:** auto-matched (default), explicit override, mismatch warning.

**Why P2:** advanced. Important to expose but not central.

### Settings — other tabs

Barcode scanning, Logs, Plugins (extension directory), Tools, etc.

**Why P2:** mostly forms and lists. Apply the redesign tokens; minimal bespoke design needed.

---

## P3 — Pro-gated screens

These need a redesign pass *with* the frosted-blur upgrade overlay considered as a first-class state, not an afterthought.

### Products screen
**Path:** `apps/main/app/(app)/(drawer)/products/`

DataTable (TanStack) with cells for image, name, price, stock, COGS, etc. Column toggles via UI settings.

**States:**
- Pro user: full table with inline editing for stock/price/COGS
- Free user: same table behind frosted-blur overlay + upgrade card

### Orders screen
**Path:** `apps/main/app/(app)/(drawer)/orders/`

Order history, filterable. Order edit modal, view modal, refund modal.

### Customers screen
**Path:** `apps/main/app/(app)/(drawer)/customers/`

Customer list + add/edit modals.

### Reports screen
**Path:** `apps/main/app/(app)/(drawer)/reports/`

Charts (victory-native, async-loaded). End-of-day summary.

### Coupons screen
**Path:** `apps/main/app/(app)/(drawer)/coupons/`

Coupon list (free) + add/edit (Pro).

**Why P3:** these are largely DataTable + modal patterns. Once the tokens, table, and modal have been redesigned at P0/P1/P2, these mostly inherit.

---

## P4 — Background surfaces

### Logs screen
Diagnostic. Developer persona. Dense, technical. Apply tokens, no special design needed.

### Support screen
Likely just a contact form / link list.

### Tax rates modal
Form + table. Apply tokens.

### Notifications panel
Bell icon → popover with virtualized list of notifications.

**Why P4:** important but design-light. Apply the language; don't reinvent.

---

## Component-level redesign opportunities (orthogonal to screens)

Independent of screens, these primitives in `@wcpos/components` would benefit from a polish pass:

| Component | Why |
|---|---|
| `data-table` | Used everywhere. Row hover, sort affordance, inline edit cells, sticky header all need a thoughtful pass. |
| `list-item` | Just introduced for the Connect flow. Worth establishing as the canonical row pattern across the app (sites, users, customers, line items, coupons, printers). |
| `status-badge` | Used for connection state, role tags, fiscal status. The full taxonomy of "states" should be a single visual system. |
| `numpad` | POS-specific. Touch-first numeric input. Worth being a hero component. |
| `card-header` | Used as filter bars, toolbars, section headers. Define one bar pattern. |
| `empty-state` | Doesn't exist as a primitive yet — currently each screen rolls its own. Worth lifting to the library. |
| `loader` / skeleton | Today: spinners. Skeletons would feel calmer and faster. |
| `connectivity-indicator` | The green/yellow/red dot. Tiny but important — deserves a proper micro-component. |

## Summary table

| Priority | Screen | Form factors | Why |
|---|---|---|---|
| P0 | POS Register (columns) | Tablet, Desktop | THE register surface |
| P0 | POS Register (tabs) | Phone | Same job, mobile |
| P1 | Receipt modal | All | Customer-facing moment |
| P1 | Checkout modal | All | Highest friction |
| P1 | Connect / auth | All | First impression |
| P2 | Settings — Printer | All | Most frustrating area |
| P2 | Settings — Receipt Templates | Desktop primarily | Setup-time |
| P2 | Settings — Print Routing | Desktop primarily | Advanced |
| P2 | Settings — other tabs | All | Apply tokens |
| P3 | Products (Pro + free overlay) | All | DataTable inheritance |
| P3 | Orders (Pro + free overlay) | All | DataTable inheritance |
| P3 | Customers (Pro + free overlay) | All | DataTable inheritance |
| P3 | Reports (Pro + free overlay) | All | Charts |
| P3 | Coupons | All | DataTable inheritance |
| P4 | Logs, Support, Notifications | All | Background |
