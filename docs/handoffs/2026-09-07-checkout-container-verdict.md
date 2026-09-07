# Checkout container for 1.11.0: research, verdict, landing ticket (2026-09-07)

Paul opened with: the checkout modal is too small; 1.11.0 should move to a slide-over from the
right covering ~3/4 of the screen, or full-screen, with full-screen on phones either way; research
what the popular POS systems do so we pick the battle-tested one. By the end of the session the
container was ruled, prototyped and ticketed. **Lane: `next`.** Nothing has been built yet.

## Where things stand

| Artefact | Where | State |
|---|---|---|
| Research (13 vendors, design systems, UX evidence, synthesis) | `docs/research/2026-09-07-checkout-flow-research/` on PR [wcpos/roadmap#164](https://github.com/wcpos/roadmap/pull/164) | Ready for review; README carries the verdict at the top |
| Receipt-stage prototype (options 1–4 after balance zero, auto-print and 58 mm mismatch toggles) | `docs/prototypes/2026-09-07-receipt-stage.html` on the same branch | Throwaway; **awaiting Paul's pick** |
| Interactive prototype (views A/B/C/Phone, transition picker, merchant settings, two-cart walkthrough) | `docs/prototypes/2026-09-07-checkout-container.html` on branch [`prototype/checkout-container`](https://github.com/wcpos/roadmap/blob/prototype/checkout-container/docs/prototypes/2026-09-07-checkout-container.html); also untracked in the main tree | Throwaway; primary source for the ruling |
| Ruling on the payments map | [#97 comment](https://github.com/wcpos/roadmap/issues/97#issuecomment-5569103735) | Recorded |
| Landing ticket | [wcpos/roadmap#165](https://github.com/wcpos/roadmap/issues/165) | Filed, unclaimed, not started |

## What was decided (Paul, 2026-09-07)

1. **A — in-place column swap.** On tablet/desktop, Checkout keeps the two POS columns: the cart
   column stays where it is and becomes the ledger pane (lines, total, payments, remaining, the
   open-order tab strip); the products column is replaced in place by the tender pane. Phones keep
   the full-screen sheet with the collapsed balance bar that already landed in monorepo#1794.
2. **Fade, not slide.** ~180 ms, products fade out and the tender fades in, in place. Paul tried the
   full-width slide in the prototype and called it jarring. Rise and Instant were offered; Fade won.
3. **Two merchant settings must hold with no special cases:** products column left or right, and
   open-order tabs top or bottom. The swap is defined relative to the columns, so the tender pane
   goes wherever the products were and the tab strip stays wherever the merchant put it.
4. **Tabs top/bottom ride the slot infrastructure** (Paul, end of session). The tab strip is a slot
   entry in the cart column, positioned by the per-till setting the same way the panel arrangement
   (#96, monorepo#1785) maps a setting to slot order at the registration site. The ledger pane in
   checkout renders the same cart-column host, which is why the strip never moves. The slot id is
   new and the vocabulary is closed (#139), so the ticket names it as a decision to make in the PR.
5. **Two carts in checkout at once.** Checkout is a mode of the order, not a screen. A waiting
   terminal leg is a chip on its order's tab; the reader it holds is disabled-with-reason on other
   orders; completion never switches the screen; Cancel only from inside the holding order. Builds
   on #154 rule 4 (leaving keeps the row live, reopening resumes, no second intent). The one real
   engineering change is moving the poll loop to an order-scoped background service.

6. **Receipts stay inside the pane** (Paul, end of session). Today balance zero routes into the
   receipt modal on top of the checkout. In A the receipt is the tender pane's final stage and it is
   the **existing receipt screen re-hosted**, not a new strip: template select, printer select with
   Auto, paper-width mismatch badge, zoomable preview, and the footer Email receipt · Download PDF ·
   Print receipt, plus No receipt and New sale (closes the tab). The ledger stays beside it. The
   `autoPrintReceipt` setting on the pos-cart UI settings already exists and keeps working: with it
   on the stage prints once when the final data lands and says where. (An earlier note in this
   session wrongly called auto-print a separate ruling.) **Which of the four receipt layouts is
   still Paul's call** — see the receipt prototype below.

## Why (one line each, evidence in the research)

No vendor uses a side drawer. Lightspeed X/R, Toast and Loyverse do the column swap; Square,
Clover and Odoo go full-screen; centred modals are the minority. Every design system withdraws
the centred modal for complex tasks, two deprecated the side sheet, and no platform offers a
side-anchored native sheet. The two-pane tender flow already built maps one-to-one onto the columns.

## Next steps

1. Merge #164 (docs only). The wcpos-agents bot pushed an accuracy pass onto the branch mid-session;
   it was rebased onto, not overwritten. Check for another bot commit before pushing anything else.
2. Claim #165 (comment Claimed + assign) before the first worktree. Base `origin/next`.
3. Build order: container move and fade (Codex, worktree) → settings and the tab-strip slot entry →
   two-cart chips and reader-busy rule → receipt stage in the pane (second host for `receipt.tsx`) →
   background poll service → Legacy tab width check (#85).
   Layout, transition timing, chip copy and the cashier walk-through are Claude's, not Codex's.
4. Follow-up to file when the swap lands: exact-amount cash shortcut that skips the tender screen.

## Traps met this session

- Screenshots of the prototype straight after `render()` catch the animation mid-flight and look
  broken. Wait ~300 ms. The Playwright script has to run from inside `~/Projects/monorepo-v2` so
  `playwright` resolves; it is not installed anywhere else.
- Two research agents wrote to the same folder; one reported "completed" before its file existed.
  Check the file, not the status.
- `help.shopify.com` describes steps and button names but never layout; Shopify's tender-screen
  layout stays UNVERIFIED. Lightspeed X-Series pages 403 WebFetch; `r.jina.ai` got them.
