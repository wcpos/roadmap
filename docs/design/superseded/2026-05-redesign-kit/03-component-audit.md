# Component Library Audit

Status of every component in `packages/components/src` and recommendations for the redesign.

## Tokens & theming

### Already in place (do not rebuild)
- **OKLCH-based palette** — all theme colors use `oklch()`. Modern, perceptually uniform, easy to derive variants.
- **Six theme options** — System (auto), Light, Dark, Ocean, Sunset, Monochrome. The five `@variant` blocks (Light through Monochrome) are defined in `apps/main/global.css`; System is a user-picker option that auto-resolves to Light or Dark based on OS preference.
- **Semantic token names** — `--primary`, `--secondary`, `--tertiary`, `--destructive`, `--success`, `--warning`, `--info`, `--attention`, `--error`, plus surface tokens (`--background`, `--foreground`, `--card`, `--card-header`, `--popover`, `--sidebar`, `--table-row`, `--table-row-alt`, `--table-header`, `--footer`, `--muted`, `--accent`).
- **Type scale** — `3xs` (10/11), `2xs` (11/13), `xs` (12/14), `sm` (13/15), `base` (14/16). Web 1rem = 14px, native 1rem = 16px.
- **Border radius** — `--radius: 0.5rem` (8px) baseline.
- **Hairline border** — `--hairline-width` adapts per platform (1px web, hairline native).

### Recommendations
- **Pick a canonical pair (Light + Dark) and design against those.** Treat the others as derivative.
- **Add an `--elevated` / shadow token system.** Today there's surface differentiation by lightness only. A subtle shadow token would help the cart panel feel like a panel, the modal feel like it's floating.
- **Audit the four "distinct shades of grey" used in tables** (`--card-header`, `--table-header`, `--footer`, `--muted`). They're documented but very close in OKLCH lightness — confirm in the redesign that they actually read as distinct on calibrated displays.

---

## Primitive inventory

### Layout — solid

| Component | Notes |
|---|---|
| `hstack` | Flex row helper. Standard. |
| `vstack` | Flex column helper. Standard. |
| `panels` | Resizable side-by-side panels — used in POS columns layout. Worth a UX pass: do users discover the resize handle? |
| `card` | Surface with `--card` background. Solid. |

### Form — comprehensive but inconsistent

| Component | Notes |
|---|---|
| `button` | **Excellent** — 10 variants × 5 sizes, plus outline-* and ghost-*, plus `ButtonGroup`, `ButtonPill` (removable variant), haptic feedback on native. The redesign should preserve this API. |
| `icon-button` | Companion to button. |
| `input` | Standard text input. |
| `input-group` | Composed input with leading/trailing slot. |
| `textarea` | Multi-line input. |
| `label` | Form label. |
| `form` | Form scaffolding. |
| `checkbox` | Standard. |
| `switch` | Standard. |
| `radio-group` | Used in Connect store-select flow. |
| `select` | Native picker on mobile, custom on web. |
| `combobox` | Searchable select. |
| `tree-select` | Hierarchical select (categories). Built on `useHierarchy` hook. |
| `tree-combobox` | Searchable hierarchical select. |
| `slider` | Standard. |
| `toggle-group` / `toggle` | Used for fiscal/live mode in receipt. |
| `numpad` | **POS-specific hero** — touch numeric input. Worth a redesign showcase. |
| `calendar` | Date picker. |

### Feedback

| Component | Notes |
|---|---|
| `alert-dialog` | Confirmation / destructive action prompt. |
| `dialog` | Generic dialog. |
| `modal` | Larger modal pattern (used for settings, checkout). |
| `toast` | Sonner-based. Different impl on web vs native (`.web.tsx` adapter). |
| `tooltip` | Standard. |
| `popover` | Standard. Used for variations, notifications. |
| `hover-card` | Web-only effectively. |
| `progress` | Linear progress. |
| `loader` | Spinner. |
| `error-boundary` | React error boundary wrapper. |
| `suspense` | Suspense wrapper. |

### Navigation

| Component | Notes |
|---|---|
| `dropdown-menu` | Standard. |
| `context-menu` | Right-click on web; long-press on native. |
| `tabs` | Standard. |
| `command` | Command palette (`cmdk`). |
| `accordion` | Used in Connect (sites list). Has `chevronPosition: 'left' | 'right'` and `headerClassName`. |
| `collapsible` | Single-section accordion. |

### Data

| Component | Notes |
|---|---|
| `data-table` | TanStack-based. The most-used data primitive. Has `index.tsx` and `index.web.tsx`. |
| `table` | Lower-level table primitive. |
| `tree` | Tree view for hierarchical data. |
| `virtualized-list` | Big-list rendering. |
| `list-item` | Recently introduced for Connect — leading avatar, title, subtitle, trailing slot, disabled/pressed. **Should become THE row primitive.** |
| `sort-icon` | Sort affordance for table headers. |

### Display

| Component | Notes |
|---|---|
| `badge` | Counts, labels. |
| `status-badge` | Status pills (online/offline, role tags, fiscal status). |
| `avatar` | With initials fallback (recently added), size + shape + variant variants. |
| `image` | Image with caching/error handling. |
| `icon` | Icon system — has its own `components/`, `svg/`, README. |
| `text` | Text primitive with variants. |
| `format` | Generic format helpers. |
| `format-number` | Number formatting (currency-aware). |
| `logo` | Logo component. |

### Specialized

| Component | Notes |
|---|---|
| `numpad` | Already mentioned. POS-specific. |
| `keyboard-controller` | Keyboard avoidance/handling. |
| `print` | Print integration. |
| `dnd` | Drag-and-drop. |
| `portal` | Portal/teleport. |
| `pressable` | Wrapped Pressable. |
| `webview` | WebView wrapper. |

---

## Gaps — what would help the redesign

These don't exist yet (or are inconsistently implemented per-screen). Lifting them to the library is recommended:

| Missing primitive | Why |
|---|---|
| `EmptyState` | Currently rolled per-screen. Settings > Printer empty has a dashed-border card; Connect has a separate empty pattern. One primitive: `<EmptyState icon title body actions>` would unify a dozen screens. |
| `Skeleton` | Spinners are calmer-than-nothing but skeletons are calmer-than-spinners. A simple `<Skeleton variant="row|card|grid" />` would replace many `<Loader />` instances. |
| `ConnectivityIndicator` | The green/yellow/red dot in the header. Tiny but appears everywhere. Currently inlined; should be one component with one source of truth. |
| `Money` / `Currency` display | `format-number` handles the math. A higher-level `<Money value currency />` that respects the WC store's decimal precision and locale would prevent currency-precision bugs across the app. |
| `KeyValueRow` | "Subtotal: $X.YZ" rows used in cart, checkout, receipt, end-of-day. Currently inlined. Single primitive with right-aligned value, tabular figures. |
| `Stepper` | Connect flow is steps 1→2→3 ("site → user → store"). A reusable `<Stepper steps={...} current={1} />` would make any other multi-step flow consistent. |
| `Banner` | Different from toast. The fiscal status banner (green/yellow/red) at the top of the receipt modal is a banner pattern that recurs (offline notice, license expiring, plugin update available). |
| `SegmentedControl` | iOS-style multi-toggle. `toggle-group` is close but not visually identical to a segmented control. |

## Inconsistencies to flag for the redesign

- **Button variants are *very* extensive** (10 colour × 3 styles × 5 sizes = 150 combos). Worth pruning the actually-used set during the redesign and documenting "these are the canonical 8 button variants; don't reach for the others."
- **`avatar` was recently expanded** (size/shape/variant + initials fallback). Audit other usages in the app — are old call sites still using the old API?
- **`accordion` was recently expanded** (chevronPosition, headerClassName). Same audit.
- **Toast vs Banner vs Dialog vs AlertDialog overlap** — the boundaries between these aren't documented. The redesign is a chance to write a one-pager on "use X when Y".
- **DataTable index.tsx vs index.web.tsx** — divergence between platforms. Confirm both implementations support the same redesign visuals.

---

## Component variants the redesign should explicitly cover

For the brief, when prompting claude.ai/design, name the variants you want it to draw:

**Button states:** default, hover (web), pressed (active), disabled, loading.
**Button variants in the redesign hero shots:** `default` (primary action), `outline` (secondary), `ghost` (tertiary), `destructive`, `success`, plus `ButtonPill` for filter chips.
**Input states:** empty, with value, focused, disabled, error.
**Card variants:** flat (default), with `card-header` toolbar, with footer area.
**Row states:** default, hover, selected, disabled, pressed.

Drawing these once establishes the language for everything else.
