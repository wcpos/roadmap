# Migration Plan — How to redesign without breaking the live app

The app is in production with ~6,000 active installations. This document is the operational answer to "how do we move toward the new aesthetic without anyone's POS breaking on a Saturday afternoon?"

## Operating principles

1. **One small change per release.** Each release ships a focused, self-contained piece of the redesign — a token recalibration, one component, one screen. Never bundle.
2. **Token-first, screen-last.** Tokens are invisible — moving them is the lowest-risk change you can make. Screens are the highest-visibility — move them last.
3. **The cart never breaks.** The POS register is the last thing migrated. Settings, Connect, and Reports are migrated first because a bad release there is recoverable; a bad release on the register is "the customer is at the counter and you can't take their money."
4. **Backward compatible on storage.** No design choice triggers a schema migration. The redesign touches presentation only.
5. **Fix forward, not parallel versions.** If a release has a regression, ship a patch release. Don't carry old + new code in parallel.

## Why no feature flags

Feature flags add complexity that doesn't pay off for this product:

- **Solo developer + ~6,000 self-hosted stores** — instrumenting every flag, monitoring rollouts, and operating a flag service is a tax on every new component.
- **Offline-first app** — flag values may not be fetchable; the app needs to render correctly with stale or missing flags, which is an extra failure mode per component.
- **Each store opts in to upgrades when they want.** Rollout is built into the upgrade pace — fast updaters see the new design first, careful updaters see it later. That's a slow rollout for free.
- **Revert path exists already** — release a patch. Stores update.
- **Web bundle and native paths are decoupled.** Adding a flag layer to keep them in sync is more friction than just shipping releases together.

Feature flags fit centralized SaaS where you control deploy and want 1% traffic A/B tests. WCPOS is a different shape.

## What replaces flags as safety

1. **Visual regression tests** — every PR runs visual regression on Storybook stories. The single most important safety net for a design migration.
2. **E2E tests on critical flows** — selectors are stable testIDs (per project policy). Tests must pass before release.
3. **Small, frequent releases** — one focused change each. Easy to review, easy to revert.
4. **Beta channel (recommended)** — internal testers and friendly users on a pre-release channel get builds 1–2 weeks ahead of stable. EAS Update branch for native, separate jsDelivr URL for web.
5. **Patch release path** — a regression triggers a same-day patch. Stores update. No special infra.

## Phase map at a glance

```
Phase 0  Foundations (visual regression, beta channel)   1 release  Invisible
Phase 1  Token recalibration                              1 release  Whole-app subtle shift
Phase 2  Atom primitives (Button, Input, ...)             5 releases One per
Phase 3  Molecule primitives                              6 releases One per
Phase 4  New primitives (additive)                        7 releases One per
Phase 5  Low-risk screens                                 ~9 releases One per
Phase 6  Onboarding & receipt                             3 releases One per
Phase 7  The register (FINAL)                             3-4 releases One per, extra QA
Phase 8  Pro-gated screens                                5 releases One per
Phase 9  Cleanup                                          1 release  Docs + retire stale tokens
```

The phase order is non-negotiable. The release cadence is yours.

## Phase 0 — Foundations

**Goal:** establish the safety net the migration runs on. Zero design risk; pure infrastructure.

**Tasks:**

- [ ] Add visual regression infrastructure. Storybook + Chromatic, Storybook + Percy, or Playwright screenshot tests. Pick one and commit.
- [ ] Author Storybook stories for every component you plan to redesign — at minimum every primitive in `@wcpos/components`. Cover Light + Dark themes per story.
- [ ] Set up a beta release channel. EAS Update has branch support — a `next` branch for native pre-release. Web bundle: a separate jsDelivr URL or version branch (`web-bundle@next`).
- [ ] Create `redesign/mockups/` and `redesign/decisions/` folders for design records.
- [ ] Document the patch-release runbook so a regression has a clear, fast revert path.

**Exit criteria:** every component you plan to redesign has a Storybook story with visual regression coverage in both themes. Beta channel is available and tested.

## Phase 1 — Token recalibration

**Goal:** update token values to the new spec — recalibrate to the calm app palette (warm grayscale chrome + brand Red as single signature accent — see `01-design-brief.md` Section 5.2), larger radii, soft shadows. This affects every component that uses these tokens, in one release.

**What changes in `apps/main/global.css`:**

- New CSS variables added: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--radius-card`, `--radius-button`, `--radius-input`, `--radius-pill`.
- `--primary` recalibrated to the WCPOS brand Red (`oklch(0.50 0.20 27)` ≈ `#CD2C24`) from the current generic blue (`oklch(0.50 0.18 240)`). The brand Red is used surgically on the Pay / Checkout button and primary CTAs only — not as a chrome colour. Each theme retints within its own family.
- Surface tokens (`--background`, `--card`, `--card-header`, `--sidebar`, `--footer`, `--muted`) recalibrated to a calm warm-grayscale palette. The marketing brand palette (Slate 50–900) is reserved for marketing surfaces; the app uses warm near-white (Light) and warm near-black (Dark). Never pure black or pure white as surface values.
- New `--cream` token, used only as an illustration accent in empty states and on marketing-adjacent surfaces (Connect screen, Pro upgrade overlay, About page) — not in app chrome.
- Semantic tokens (`--success`, `--warning`, `--error`, `--info`) tuned to muted variants — not vibrant — so they sit calmly alongside the grayscale chrome without competing with the brand Red.
- New soft-tint tokens: `--accent-soft` (foreground at ~6%, the default hover tint), `--primary-soft` (Red at ~10%), `--success-soft`, `--warning-soft`, `--error-soft` (each at ~12%). Used for tinted hover backgrounds, active-state pills, and selected rows.

**Risk profile:** the entire app shifts visually. Subtle, but global.

**Mitigation:**

- Visual regression catches anything that breaks layout or contrast.
- Manual QA on hero screens (POS register, Connect, Receipt) before release.
- Beta channel for at least 1 week before stable.
- Watch the contrast ratios — the new shadow + softer color set means contrast is the thing most likely to slip.

## Phase 2 — Atom primitives

**Goal:** redesign Button, Input, Badge, Avatar, IconButton — one per release.

**Per-component pattern:**

1. Branch from main.
2. Update the component in place. The API stays the same — `<Button variant="default" size="default">` works identically; only the visual rendering changes.
3. Update Storybook stories and snapshots to reflect the new visuals.
4. Visual regression must pass for every story.
5. Manual QA: spot-check 3–4 high-traffic screens that use the component.
6. Ship. Patch if needed.

**Order within Phase 2:**

1. **Button** — most-used, most-visible. New: 10px radius, subtle shadow on default variant, refined hover/press states using `--accent-soft` background instead of opacity changes.
2. **Input + InputGroup** — 10px radius, focus ring uses `--ring` with a soft box-shadow rather than a hard outline.
3. **Badge + StatusBadge** — pill-shape (full radius), refined typography, soft background tones.
4. **Avatar** — refined initials typography, slight sizing tweaks.
5. **IconButton** — match Button visual language at icon-only sizes.

**Each ships in its own release.** Yes, there will be a few releases where Button is new but Card still feels old. That's fine — the visual transition is gradual and a stable user-visible cadence is more comforting than a sudden jump.

## Phase 3 — Molecule primitives

Card, ListItem, Modal, Toast, Tooltip, DataTable. Same pattern as Phase 2: one per release, in place, with regression coverage.

**Order:**

1. **Card** — adds an elevation prop (`flat` | `raised`). 12px radius. Subtle shadow on raised.
2. **ListItem** — tighter vertical rhythm, refined hover with `--accent-soft` tint.
3. **Modal** — 12px radius, `--shadow-lg`, calmer enter/exit.
4. **Toast** — refined typography, subtle elevation, longer dismiss timing.
5. **Tooltip** — refined arrow, `--shadow-sm`, faster fade.
6. **DataTable** — refined header tone, hover row with `--accent-soft`, sticky header gets a subtle bottom shadow when scrolled.

DataTable is the biggest of these — give it its own release with extra QA, since it appears on every Pro-gated screen.

## Phase 4 — New primitives (additive)

**Goal:** ship the missing primitives identified in `03-component-audit.md`. These are net-new — no existing code to migrate — so they're lower-risk than refactoring atoms.

Order (one per release):

1. **EmptyState** — illustrated empty state. Used everywhere, so worth shipping early.
2. **Skeleton** — replaces `Loader` spinners over time on data screens.
3. **ConnectivityIndicator** — the green/yellow/red dot. One source of truth.
4. **Money** — `<Money value currency />` reads `wc_get_price_decimals()`. Prevents currency-precision bugs.
5. **KeyValueRow** — right-aligned-value rows for cart totals, receipts, end-of-day.
6. **Stepper** — used in redesigned Connect.
7. **Banner** — full-width status banner for fiscal status, offline notice, license expiring.

Existing screens migrate to these primitives in later phases — the primitives just need to exist before screens can adopt them.

## Phase 5 — Low-risk screens

**Goal:** redesign screens where a bad release is recoverable. These are the canaries.

Order (one per release):

1. **Logs screen** — diagnostic, used by developers. Lowest stakes.
2. **Support screen** — likely link list / contact form.
3. **Notifications panel** — bell icon popover. Self-contained.
4. **Settings → Tools tab**.
5. **Settings → Plugins tab** (extension directory).
6. **Settings → Receipt Templates tab**.
7. **Settings → Print Routing tab**.
8. **Settings → Barcode Scanning tab**.
9. **Settings → Printer tab** — the redemption arc (covered by Prompt 5 in starter prompts).

**Per-screen pattern:**

1. Replace the screen's render code with the redesigned version.
2. Data hooks, queries, mutations stay unchanged — the redesign is presentation-only.
3. testIDs stay (per project policy in `CLAUDE.md`). E2E tests must continue to pass.
4. Manual QA on web, iOS, Android, Electron.
5. Beta channel for the most-touched screens (Printer, Receipt Templates).
6. Ship.

## Phase 6 — Onboarding & receipt

**Goal:** the journey screens.

1. **Connect / auth flow** (Prompt 4) — the first thing every new user sees.
2. **Receipt modal** (Prompt 3) — the customer-facing moment.
3. **Tax rates modal** — small, related to receipt setup.

Each gets its own release. Beta channel for both Connect and Receipt before stable.

## Phase 7 — The register (the moment of truth)

**Goal:** the POS register. The hero. The thing every cashier looks at all day.

1. **POS register, columns layout** (Prompt 1) — tablet/desktop primary register surface.
2. **POS register, tabs layout** (Prompt 2) — phone register surface.
3. **Checkout modal** — gateway selection → payment processing.
4. **Add misc product modal** — small companion modal.

**Extra precaution:**

- **Beta channel for at least 2 weeks** before stable, with active friendly testers actually selling things.
- E2E tests for the full purchase flow (select product → add to cart → checkout → receipt) must pass.
- **Same-day patch path ready.** If a regression appears, the patch is "revert the screen change in a hotfix release" — you should know in advance which commit to revert and have the release pipeline warm.
- Watch the metric that matters most — order completion rate. Monitor before/after the release.

## Phase 8 — Pro-gated screens

Customers, Coupons, Orders, Products, Reports. Each gets its own release.

**Order:**

1. **Customers** (smallest data tables, simplest mutations).
2. **Coupons**.
3. **Orders** — historical data, refund modal.
4. **Products** — biggest data table, most mutations.
5. **Reports** — charts, end-of-day summary.

The frosted-blur Pro upgrade overlay is a first-class state — design it in, don't bolt it on. QA the blurred state in both Light and Dark themes.

## Phase 9 — Cleanup

**Goal:** documentation pass and removal of any stale tokens or unused variants.

**Tasks:**

- [ ] Audit `global.css` for unused tokens. Retire any.
- [ ] Audit `@wcpos/components` for unused button variants (the current 10×3×5 matrix is large — many combinations are likely unused).
- [ ] Publish a Storybook deployment as the public design system reference.
- [ ] Write a one-page "WCPOS Design System" doc covering tokens, components, do/don't.
- [ ] Move `redesign/` content into the wiki as historical record (or keep as a project artifact).

## Cross-cutting practices (apply at every phase)

### Visual regression as the safety net
Every PR that touches a redesigned component or screen must pass visual regression in both themes. This is the single most important practice — it catches what manual QA misses.

### E2E coverage on the register
Don't break testIDs. Per the project's CLAUDE.md, E2E tests use stable testIDs. The redesign moves visuals, not selectors.

### Translations
Don't change copy as part of a visual redesign. Translation churn during a visual migration makes regression analysis impossible. Keep them as separate releases.

### Accessibility
Color contrast verified on every token change. Focus rings visible on every interactive element. Tap targets ≥ 44px on touch.

### Per-platform parity
Web, iOS, Android, Electron must all look right. Don't redesign just for web. Test all four for every screen migration. The web-only `index.web.tsx` divergences in components like `data-table` need extra care.

### Decision log
Every meaningful design decision goes in `redesign/decisions/YYYY-MM-DD-decision-name.md`. Examples:
- "Why we kept the brand Red as primary instead of softening to a friendlier pink"
- "Why we kept the 5-theme model"
- "Why the cart panel kept its dense rhythm"

Future-you (or a contributor) will thank you.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Token recalibration breaks a component visually | Medium | Low | Visual regression on PR. Beta channel before stable. |
| A redesigned component has a subtle behavior regression | Medium | Medium | Visual regression + E2E. Same-day patch if found. |
| Register has a checkout regression | Low | High | 2-week beta. Friendly tester pool actively selling. Patch path warm. |
| Native renders differently from web | Medium | Medium | Per-platform QA at each phase. RNW divergence noted. |
| Translation strings overflow new layouts | Medium | Low | German / RTL preview at design time. |
| A self-hosted store is slow to update and sees inconsistent UI | High | Low | Self-hosted == users opt in to upgrades. Their old version is still working. The slow update is a feature, not a bug. |

## How to know it's working

Watch these after every release:

- **Order completion rate** — must stay flat or improve. The single most important metric.
- **Support ticket volume** — leading indicator of UX regressions.
- **Crash rate / error rate** — should stay flat.
- **User feedback** — qualitative, but the only signal that captures "feels nicer".

If any of these dip after a release, the next release is a patch.

## TL;DR

- Tokens first. Atoms before molecules before screens. Settings before Connect before Receipt before Register.
- One change per release. Small, frequent releases beat big, rare ones.
- Visual regression is the safety net.
- Beta channel for high-stakes releases (register, receipt, connect).
- Cart never breaks.
- Fix forward with a patch — don't carry old + new in parallel.
- The phase order is the risk model. Don't reorder.
