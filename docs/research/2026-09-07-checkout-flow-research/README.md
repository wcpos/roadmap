# Cart → checkout: what the market does, and the recommendation for 1.11.0

Date: 2026-09-07. Lane: `next` (1.11.0). Question from Paul: the checkout modal is too small; should 1.11.0 move to a right-side slide-over covering ~3/4 of the screen, or a full-screen takeover, with full-screen on phones either way — and which pattern have the popular POS systems battle-tested?

Two sourced companions sit beside this file:

- [`vendor-checkout-flows.md`](./vendor-checkout-flows.md) — 13 POS products, each claim with its help-centre / SDK / source-code URL.
- [`design-guidance-and-ux-evidence.md`](./design-guidance-and-ux-evidence.md) — Apple HIG, Material 3, Polaris, Carbon, Fluent, Atlassian, NN/g, Baymard, the W3C dialog pattern, and what React Navigation / Expo Router can actually present.

## Where the build already is

- The two-pane tender flow from the [#111 verdict](https://github.com/wcpos/roadmap/issues/111) (ledger left like a receipt; tiles + keypad right; split, cash-to-receipt, Legacy tab, Cancel payment) merged on `next` in [monorepo#1794](https://github.com/wcpos/monorepo/pull/1794).
- Its **container** is still the generic centred `Modal`: `size="2xl"` (800 px wide) on tablet/desktop, `size="full"` below tablet width, hosted by the `(modals)/cart/[orderId]/checkout` route (`tender-checkout.tsx` on `next`). The verdict's "modal slides in from the right" never landed. So this research decides a container change to a landed build, not a redesign of the tender flow.
- The POS screen itself is two slot-registered columns, products (order 10, left) and cart (order 20, right), under the `(columns)` route group, with a `(tabs)` group for phones.

## What the vendors do on tablet and desktop

| Pattern | Who | Cart lines still visible? |
|---|---|---|
| **In-place column swap** — cart/check column stays, the product area becomes the tender pane | Lightspeed X-Series (Vend), Lightspeed R desktop, Toast, Loyverse | Yes, all four |
| **Full-screen takeover** | Square (all editions), Clover, Odoo, SumUp POS Pro | Mostly no (SumUp Pro yes; Square unverified) |
| **Centred modal** | Zettle iPad, Erply | Zettle yes (cart rail beside it); Erply no |
| **No transition** — Cash/Card live on the cart screen | SumUp app / POS Lite | Yes |
| **Side drawer / slide-over** | **Nobody** | — |

Shopify POS moves to a separate "Select payments" screen with a `Split payment` button; its help centre never describes the layout, so Shopify's row stays UNVERIFIED rather than guessed.

Other conventions that held across the set (details and URLs in the vendor file):

- The running balance heads the tender pane, and the total rides the Charge/Pay button before that.
- Cash is a keypad or field plus suggested amounts; several vendors add an exact-amount shortcut that skips the tender screen entirely (Toast `Fast cash`, Odoo 19 one-click, Lightspeed X card icon).
- Split is a control on the tender screen; every tile pre-fills the balance.
- Back is a left-aligned arrow or X, never a swipe. Clover makes a visible Cancel a requirement for custom tenders.
- Post-payment is a receipt screen whose primary action starts the next sale; Toast and Zettle make "No receipt" primary.
- Phones converge on one pane at a time: cart behind a bottom bar or badge, an extra `Charge` step tablets elide, fewer controls.

## What the design guidance says

- **Every design system withdraws the centred modal once the task grows.** Polaris: "Don't use modals to display complex forms." Carbon: "A modal is not an alternative to page" and "Don't make modals full page." NN/g: "Avoid modal dialogs that interrupt high-stake processes such as checkout flows." "Too small" was the predicted failure, and simply enlarging the modal is the one fix Carbon explicitly forbids.
- **A side sheet is justified only when the page behind it must be referenced.** Carbon reserves slide-in panels for when the user "needs to reference the page along with the panel"; Fluent's Drawer is for "when retaining context is beneficial." Two systems have deprecated the pattern outright: Polaris removed Sheet because it "blocks other parts of the UI, forces users to switch context, and adds complexity," and Atlassian is deprecating Drawer in favour of Modal.
- **Full-screen is the named answer for multi-step tasks.** Apple: "Consider using a full-screen modal style for in-depth content or a complex task." Material's full-screen dialog is for "a series of tasks." NN/g: a multi-step flow "probably justifies dedicating a full page."
- **Compact width is unanimous:** Polaris sheets enter from the bottom on small screens, Material moves supporting content into a bottom sheet, UIKit turns every sheet into a full-width card. A side panel degrades to full-screen on phones no matter what.
- **No platform offers a side-anchored native sheet.** iOS sheets are centred on iPad and bottom-anchored on iPhone; Android's `formSheet` is a bottom sheet; on web Expo Router renders modal routes as plain routes. A right slide-over has to be a custom animated view inside a `transparentModal` route on every platform, and if it traps focus it must meet the W3C modal-dialog contract (inert background, Escape, focus return).

## Recommendation

**Use the in-place column swap, animated.** On tablet and desktop, pressing Checkout keeps the two-column POS layout: the cart column becomes the ledger pane (lines, total, payments taken, remaining balance) and the products column is replaced by the tender pane (tiles, keypad, Legacy tab). The tender pane may still slide in from the right over the products area, which keeps the feel Paul described, and Loyverse animates exactly this way (ticket panel slides to the edge, grid becomes the payment pane). Below tablet width, keep what already landed: a full-screen sheet with the ledger collapsed to a balance bar.

Why this over the 3/4 slide-over Paul was leaning to:

1. **It is the convention.** Of the systems Paul's tie-breaker names, Lightspeed does it, and so do Toast and Loyverse; Square goes full-screen; no vendor uses a side drawer. The standing principle on the payments map is to follow what a Square/Shopify/Lightspeed cashier expects and deviate only with a stated reason. There is no stated reason for a drawer.
2. **It uses the whole screen.** A 3/4 slide-over leaves a dimmed, dead quarter showing a stale cart while the ledger pane shows the same lines. The design-system case for a side sheet, referencing the page behind, is already satisfied by the ledger pane inside the checkout, so the strip behind buys nothing and costs a quarter of the tender pane, including the Legacy tab's gateway form ([#85](https://github.com/wcpos/roadmap/issues/85) is exactly a complaint about that form being cramped).
3. **It is the same two panes already built.** The #111 layout maps one-to-one onto the POS columns, so this is a container change: the tender checkout moves from the `(modals)` group into the `(columns)` layout, and the `(tabs)` phone route keeps the full-screen sheet. Nothing in the tender state machine changes.
4. **It needs no custom sheet.** The slide-over has no native presentation on iOS, Android or web and would be a hand-rolled overlay carrying the full modal-dialog accessibility contract on each. A column swap is ordinary layout plus a reanimated transition, which is already a dependency.
5. **The guidance agrees.** Full-page for multi-step, context kept by re-rendering the summary inside the flow, no enlarged modal.

Why not the pure full-screen takeover (Square/Clover style): it hides the app chrome and the cart for no gain, and the systems closest to WCPOS in shape (a web/tablet register with a persistent cart column) all keep the column. Full-screen remains the phone behaviour, where every vendor and every design system lands anyway.

## Points the landing ticket must carry

- **Back affordance:** a left-aligned `← Cart` (arrow or X) at the top of the tender pane, plus Escape on desktop and the hardware/predictive back on Android. No swipe-to-dismiss. Leaving with a live leg routes through the existing Cancel payment view, which lists what to return or void, so a navigation away (drawer, tabs, browser back) mid-split must be intercepted the same way.
- **Deep link stays:** keep `/cart/[orderId]/checkout` addressable (tests, E2E, the receipt handoff) even though it renders inside the columns layout rather than the modals group.
- **The cart column becomes read-only ledger:** no add-to-cart while a leg is live; the products column is gone, so accidental adds are impossible, which is the point of the swap.
- **Width:** the ledger keeps the cart column's width (the resizable divider position), the tender pane gets the rest. On medium tablets in portrait, Material's guidance is a 50/50 split or collapse to the phone layout; test iPad portrait explicitly.
- **Legacy tab:** the webview now gets the full tender-pane width. Re-check the order-pay form layout at that width before closing #85.
- **Exact-amount shortcut:** several vendors let cash-for-the-exact-total skip the tender screen. Not for this ticket, but worth a follow-up issue once the swap lands.

## Gaps left open in the research

- Shopify's payment-screen layout, Square's merchant-facing tender screen, and Clover's Register cart screen could not be sourced from primary pages (client-rendered help sites). None of them would change the recommendation: Shopify and Square are full-screen or unverified, not drawers.
- Material 3's own side-sheet width rule (256–400 dp) and its compact-width fallback are cited from the Android component docs rather than the m3.material.io spec, which could not be fetched.
- No published usability study covers tablet POS tender screens specifically; the UX evidence is web checkout (Baymard) and general overlay research (NN/g).
