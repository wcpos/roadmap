# Checkout state and the URL — routing audit (2026-09-08)

Prompted by Paul's dev-next finding: on tablet/desktop the Pay press swaps the columns but the URL stays `/cart/<uuid>`, so a refresh drops the cashier back at the cart. Wanted: refresh lands in the same checkout, ideally with the chosen payment type.

Sources: route tree under `apps/main/app/(app)/(drawer)/(pos)/`, `packages/core/src/screens/main/pos/{contexts/current-order,checkout,cart,columns}`, expo-router 57.0.14 (`web.output: 'single'`, typed routes on, no custom linking config). Codex read-only trawl plus my own reading; nothing was run.

## 1. How the POS URL works today

**The URL is a mirror, not the source of truth.** The current-order provider keeps the selected order in React state. `setCurrentOrderID` then (1) calls `router.setParams({ orderId: [uuid] })` and (2) on web schedules a raw `window.history.replaceState(null, '', '/cart/<uuid>')` to overwrite whatever expo-router wrote. The raw write exists because the `[...orderId]` catch-all cannot be emptied through `setParams`, so "new order" would otherwise keep showing the previous uuid. Cost: this write also strips any query string and any extra path segment, and it drops expo-router's own history id from the entry.

**Cold load** reads the first catch-all segment in the POS `_layout` and hands it to the provider as the initial selection. The order shows only if it is in the open-orders resource (`pos-open | pos-partial | pending`, this cashier, this store); otherwise the new-order placeholder shows. The placeholder itself has no URL other than `/cart`.

**Route shapes** (groups are invisible in the public path):

| Public path | Route file | Behaviour |
|---|---|---|
| `/cart`, `/cart/<uuid>` | `(columns)/cart/[...orderId]` and `(tabs)/cart/[...orderId]` | Columns on wide, tabs on `sm`. Resize does not navigate; each layout renders the other shape itself. |
| `/cart/<uuid>/checkout` | `(modals)/cart/[orderId]/checkout` in the POS Stack | The one checkout URL. `sm`: the full-screen sheet. Wide + payments contract loaded: `enterCheckout(uuid)` then `<Redirect>` to the columns `/cart/<uuid>`, **dropping the suffix**. |
| `/cart/receipt/<uuid>` | `(modals)/cart/receipt/[orderId]` | Routed receipt modal (legacy webview host, Orders reprint). |

Exact dynamic segments beat the catch-all, so `/cart/<uuid>/checkout` always resolves to the modal route, while `/cart/<uuid>/anything/else` falls through to the catch-all with `orderId = ['<uuid>', 'anything', 'else']`.

**Checkout mode** is the module-level store from #165 (`checkoutOrders`, `receiptOrders`, `savingOrders`, `selectedReceiptOrder`) plus derivation from the ledger: any pending/authorized/captured row puts the order in checkout regardless of the store. So a **part-paid** order already survives refresh in checkout; an **unpaid** checkout entered only via the flag does not. Tender UI state (`tab`, `view`, `methodId`, keypad entry, split share) lives in a `useReducer` inside `CheckoutColumn`, keyed by order uuid, so it also resets on tab switch and resize.

**Exits** (`← Cart`, Escape, Android back, cancel-void, New sale, autoShowReceipt off) mutate the store and, on `sm` only, `router.replace('/cart')`. Browser back and drawer navigation are deliberately unguarded. `router.replace('/cart')` is group-unqualified and matches both layouts by route order, not by width.

## 2. Why the URL did not change in #165

The swap was built as a mode of the order precisely so that several orders can be in checkout at once and tab switching is free. A route can only name one order, so the store, not the route, had to own the set. The URL was left as it was. That is the gap Paul hit.

## 3. Options

### A. A real columns checkout route (`(columns)/cart/[orderId]/checkout`)
Enter checkout by navigating; derive the flag from the route. Cleanest in theory, but: the public path collides with the modal route (one of them must own the cold link); a single route cannot express two orders in checkout, so the store stays anyway; sibling Stack screens do not share component identity, so the columns would remount on every enter/leave and the 180 ms fade would fight the Stack transition; every exit path and the phone redirect need re-plumbing. Largest surface, least gain.

### B. Mirror the store into the URL, seed the store from the URL on cold load (recommended)
Keep memory + ledger as truth. One URL writer owns the whole POS path (today there are two: `setParams` and the raw `replaceState`). Desired path is a pure function of `(currentOrderId, stage, methodId)`:

| State | Path |
|---|---|
| cart | `/cart/<uuid>` |
| checkout, no method | `/cart/<uuid>/checkout` |
| checkout, method picked | `/cart/<uuid>/checkout/<methodId>` |
| receipt stage | `/cart/receipt/<uuid>` (existing route) |

Cold load: `/cart/<uuid>/checkout` hits the modal route, which on wide already redirects group-qualified into the columns; pass `['<uuid>', 'checkout']` as the catch-all so the URL keeps its suffix. `/cart/<uuid>/checkout/<methodId>` lands directly in the catch-all. The columns read the tail once on mount: `[1] === 'checkout'` ⇒ `enterCheckout(uuid)`; `[2]` ⇒ initial `methodId` for that order's tender reducer, applied only after descriptors load and the tile is enabled (never replay a payment; keypad entry is not restored, prefill is the balance as when tapping the tile). Receipt cold load opens the routed receipt modal over the columns, since a completed order is no longer an open order and cannot host the in-column stage; New sale there closes to `/cart`.

Two orders in checkout: the URL names the active tab only. After refresh the other order resumes checkout if it has a leg (ledger derivation), otherwise it is a plain open order again. That matches the ticket's "only money persists" rule.

Files: `contexts/current-order/index.tsx` (writer becomes `syncPosUrl`, called from selection and from the store), `checkout/checkout-mode.ts` (per-order `initialMethodId` seed), `columns/pos-columns.tsx` (read the tail on mount), `checkout/index.tsx` (redirect params), `tender/use-tender-flow.ts` (seed the reducer), plus tests. Roughly 150–200 lines.

### C. Persist the store to local storage, leave the URL alone
Restores several checkouts at once, but does not put state in the URL, cannot be linked or bookmarked, and the phone sheet still needs its route. Rejected for this ask; could complement B later.

## 4. Traps to design around

- **Two URL writers.** Anything that adds a query string or suffix will be wiped by the next `setCurrentOrderID` unless the raw `replaceState` is folded into one writer. Fix this first; it is the blocker Codex flagged too.
- **Group-unqualified `router.replace('/cart')`** resolves by route order. Use group-qualified hrefs when the target must be the columns.
- **Method restore is conditional.** `pickMethod` refuses disabled tiles and needs `methods` loaded; seed through the same gate.
- **Exits must rewrite the URL** or a refresh puts the cashier straight back into checkout after they left it.
- **Store switch** resets the store; the URL must not rehydrate a checkout for another store's order (the open-orders filter already drops it, so the seed is a no-op there).
- **Typed routes** regenerate on new route files; B adds none.

## 5. Recommendation

Build B on `next`: one URL writer, path suffix for stage and method, catch-all tail as the cold-load seed, receipt via the existing receipt route. Phones already have the stage in their URL through the modal route; the method suffix can come to the sheet in the same change or later.

## Outcome

Built as recommended on `next` (wcpos/monorepo#1912, merged 2026-09-08). Walked live: Pay, method pick, reload, keypad cancel, 3-segment deep link, leave, tab switch all round-trip through the address bar. Screenshots `u1`/`u2` in `docs/handoffs/2026-09-08-optimistic-checkout-screens/`.
