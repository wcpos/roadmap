# Action-event contract v1: a hook chain on four POS actions, with one writer each

Date: 2026-10-09. Lane: `next` (post-2.0 trains; no code until Paul names one). Owner: Paul.
Status: **ruled** on [wcpos/roadmap#421](https://github.com/wcpos/roadmap/issues/421) (eight
resolution rows, R1 to R8, Paul, 2026-10-09, each as recommended), on the findings of
`docs/research/2026-10-08-apps-with-a-similar-stack-and-goals.md` and the consumer survey comment on
#421. Built under the extensibility rulings on #121 (extension code composes host components and
never ships a renderer), #139/#140 (static typed registry, RSC-serialisable values, closed dotted
ids) and the sources ruling of 2026-09-02 (zero leads from WordPress or WooCommerce). Prompted by
Claude Code's mods; **modelled on whatever suits the till** (Paul, 2026-10-09), which is why the
budget comes from VS Code, the one-writer rule from Zero and TanStack DB, the origin tag from
tldraw and the capability object from Figma. Glossary: monorepo `CONTEXT.md`, *Language —
Extensibility* (lines in §9).

This spec is the build contract for the three behaviour-preserving moves in §8 and the first
feature consumer after them (checkout conditions, #62). It adds the **third extension primitive**
beside slots (UI in, `@wcpos/core/extensions/slots`) and descriptors (config in, contract 1.2): a
dispatch-time chain of hooks on a named POS action, run before the action's one writer.

## What it builds on

- **The per-order mutation queue**, `packages/core/src/screens/main/pos/hooks/order-mutation-queue.ts`:
  `enqueueOrderMutation(recordId, mutation)` serialises stock validation and cart mutations per
  order across hook instances. Every v1 dispatch runs inside it (§3.4).
- **The stock guard**, `pos/hooks/stock-guard.ts` and `use-cart-stock-guard.ts`:
  `evaluateStockForCartChange` returns `{ allowed, warning: 'backorder' | null, available }`, and
  `useAddItemToOrder` / `useUpdateLineItem` refuse or warn on it inside the queue. This is the first
  guard, already written as one.
- **Sale completion**, `pos/checkout/sale-completion.ts`: `completeSale` → `prepareSale`
  (`requireOpenSession`, `recordCompletionAttempt`) → `persistSaleProvenance` → `finishSale` →
  `reportProvenanceGap`, the stock adjustment and the `checkout.completed` audit row; called by the
  manual flow, the terminal-payments service and the completion-journal replay.
- **The tender flow**, `pos/checkout/tender/use-tender-flow.ts`: `takeTender` records a manual leg
  or starts a server/device leg; the terminal-payments service is the sole writer of capture
  narration for a settled leg (its `LEDGER.md` line 22).
- **RxDB 17.5** as the reactive store. Its collection hooks (`preInsert`, `preSave`, `preRemove`,
  `postCreate` in `packages/database`) are infrastructure for ids and populate, never an extension
  surface: pulls and conflict writes bypass them, and a throwing `preSave` rejects every queued
  incremental write on the document (sourced in the research note).

## 1. The two axes (the test every consumer applies)

| Needs | Use |
|---|---|
| the fact that state changed, to redraw or rebroadcast | an RxDB subscription (document or query observable) |
| the intent, the actor, the moment before the write, or the power to refuse or rewrite | an action hook |

The customer display, the register directory and the reports tiles are subscriptions. The stock
guard, the session gate, the fiscal provenance stamp and the audit rows are hooks. A hook never
writes to a collection; the action's **bottom handler** is its one writer, and RxDB then streams the
result to the UI. Two writers for one action is the race this contract forbids.

## 2. The events (R1)

Closed list, `<domain>.<noun>.<verb>`, verb in the imperative, a `const` union in `types.ts`:

| Event | Raised by | Payload (`e.payload`) | Rewrite allowed on | Refuse allowed | Bottom handler (the one writer) | Result |
|---|---|---|---|---|---|---|
| `cart.line.add` | `useAddItemToOrder` | `{ type: CartLineType, line: CartLine }` | `line` | yes | the existing mutation inside `enqueueOrderMutation` (`saveNewOrder` or `localPatch`) | `{ order, line }` |
| `cart.line.update` | `useUpdateLineItem` | `{ type, lineId, patch }` | `patch` | yes | same | `{ order, line }` |
| `checkout.tender.commit` | `takeTender`, from `prepareSale` onward (the zero-balance completion included, as `mode: 'zero-balance'`) | `{ methodId, mode, amountMinor, tenderedMinor, balanceMinor, completing, bindingStatus, registerId, sessionId }` | `registerId`, `sessionId` (the session gate stamps what it found); **not the amounts in v1**, see the note | yes | the existing sequence: `prepareSale`'s attempt record, the provenance stamp, then the leg (`recordManualPayment`, or the minted row and `service.begin`), or the zero-balance patch | the leg outcome |
| `checkout.complete` | `completeSale` | `{ source, registerId?, sessionId? }` | nothing | **no** (money has moved; the completion attempt record is the only gate) | `finishSale` | `'completed' \| 'partial' \| 'not-completed'` |

**Amended on the review of slice 2 (2026-10-09):** the tender amounts are **not rewritable in v1**. The split plan, the provenance stamp and the completion facts are computed from the cashier's entry before the dispatch, so a rewritten amount would be honoured by some steps and not others; a rounding consumer (#66, #84) first refactors the handler to derive everything from the payload, then opens the keys. Also: a guard's reads must be reads — the session gate looks the session up through `findOpenSession`, and the pre-action write that `requireOpenSession` makes stays in the bottom handler; and a money path passes `requiredGuards` to `dispatchAction`, which refuses with `actions.guard_missing` if one is not registered (guards register by a side-effect import).

**Correction on reading the code (2026-10-09, overnight):** `requireOpenSession` and the choose-register check run in `takeTender` through `prepareSale`, before any leg and before the zero-balance completion, not inside `completeSale`; and the provenance stamp (`persistSaleProvenance`) is a **write** that must reach the store before the leg, so it is part of the writer's sequence, never a hook (hooks have no effects before `next`). The guards therefore sit on `checkout.tender.commit` (`register.gate`: refuse `pos_checkout.choose_register_first`; `session.gate`: refuse `pos_checkout.open_register_first`), and `checkout.complete` has no guard in v1. R7 and §8 below are amended to match; the ruling's intent (session gate and provenance as first-party consumers, behaviour-preserving) is unchanged, only their placement.

**Admission test** for a fifth event, written into the registry README: (a) one writer function
already exists for the action, (b) the event has a typed result, (c) a named consumer is waiting.
Receipt print, register open/close, discount apply and customer set fail (a) today and are listed
in the README as candidates, not events. No past-tense notification events: `await next(e)` is the
after-hook (§3.2).

**Amended 2026-10-12, the cart domain (Paul: "start work on all of these"):** with every sale on
`checkout.tender.commit` (wcpos/monorepo#2464), the price-affecting cart writes that still bypass the
chain are admitted. The consumer is the plugin-integration family that needs to see every price
change, not only line adds: Discount Rules (#163), loyalty points (#86), Smart Coupons store credit
(#88), gift cards as tender (#87). Each has one writer today (the §4 fence allowlist names them).

| Event | Raised by | Payload | Rewrite allowed on | Refuse allowed | Bottom handler | Result |
|---|---|---|---|---|---|---|
| `cart.line.remove` | `useRemoveLineItem` (`line_items`, `fee_lines`, `shipping_lines`, `coupon_lines`) | `{ type, lineUuid, line, lineItems }` | nothing | yes | the existing null-out-or-drop patch | the patched order or `false` |
| `cart.line.update` (extended) | `useUpdateFeeLine`, `useUpdateShippingLine` join `useUpdateLineItem`; the payload gains `type: CartLineType` | `{ type, lineUuid, changes, line, lineItems, options }` | `changes` | yes | each hook's existing `calculateCartLine` + patch | as today |
| `cart.coupon.apply` | `useAddCoupon` and `useAddQuickDiscount`, through one writer `applyCouponLine` (a quick discount IS a coupon line carrying its intent meta) | `{ couponLine, lineItems, couponLines }` | nothing in v1 (the discount is recalculated by the writer; a rewriting consumer first makes the recalculation read the payload) | yes | validate (catalog coupon) or the exclusivity check (quick discount), then `recalculate` + patch | `{ success, error? }` |
| `cart.coupon.remove` | `useRemoveCoupon` | `{ code, couponLine, lineItems, couponLines }` | nothing | yes | `recalculate` + patch | the patched order or `false` |
| `cart.customer.set` | one writer `useSetCartCustomer` (was three: `add-customer.tsx`, `edit-cart-customer.tsx`, `use-add-customer.ts`) | `{ customerId, previousCustomerId, billing, shipping, taxIds }` (`taxIds: null` leaves the order's snapshot alone; a caller naming no customer keeps the order's, read inside the slot) | `billing`, `shipping`, `taxIds` | yes | the existing `localPatch` | the patched order or `false` |

Rules carried over: every dispatch runs inside `enqueueOrderMutation` for its order (these writers
called `localPatch` directly; the queue serialises them with the tender commit, which LEDGER 20 wants);
Undo on a removed line dispatches `cart.line.add` with the restored line as its own action, so a guard
sees the restore; the stock guard passes every `type` other than `line_items` straight through; the
fence allowlist burns down by each writer moved. No new log rows: the writers keep their toasts and
rows. Built as three PRs on `next` under the 400-line ceiling: **A** `cart.line.remove` + fee and
shipping onto `cart.line.update`; **B** the two coupon events with the shared writer; **C** the
customer unification and `cart.customer.set`. Each needs the `independent-review` status on its final
head. Rounding (#66, #84: the tender amounts become rewritable), register session open/close and
refund are not admitted by this amendment; they wait for their consumers to be scheduled
(rounding was admitted the same day, below).

**Amended 2026-10-15, split (Paul: "do as you recommend"):** the cart's unit-line split was the one
`line_items` write that still bypassed the chain. It hid behind the `useUpdateLineItem` fence exemption
without being a Bottom handler, so no hook or guard saw a split. `cart.line.split` is admitted with one
writer, `useSplitLineItem`, for the same plugin-integration consumers as the cart domain above.

| Event | Raised by | Payload | Rewrite allowed on | Refuse allowed | Bottom handler | Result |
|---|---|---|---|---|---|---|
| `cart.line.split` | `useSplitLineItem` (`line_items` only) | `{ lineUuid, line, lines, lineItems }`: `lines` are the replacements in order, the first keeping the original uuid and Woo id, the others carrying fresh uuids and no id, any fractional remainder last, `_reduced_stock` conserved | nothing | yes | one `localPatch` | the patched order or `false` |

Rules: entered through `enqueueCartAction` (the order's queue entry, the live target); a refusal writes
nothing and follows the cart's existing refusal presentation; a split on a line no longer in the cart
is reported as a stale line, a quantity of 1 is a no-op. The stock guard does not register: a split
changes neither total quantity nor net demand (`quantity - _reduced_stock`); a cart already over stock
stays the checkout conditions gate's responsibility. No new log row. Landed as one PR on `next`
(wcpos/monorepo, `refactor/cart-line-split-event`), with the `useUpdateLineItem` fence entry replaced
by the new writer's.

**Void, ruled 2026-10-12 (Paul: "as you recommend"):** the Void button's writes are extracted first,
behaviour-preserving, into `voidOrder` / `restoreVoidedOrder` (PR D, the twelve existing tests
unchanged as the proof; the module is a fence `BOTTOM_HANDLERS` entry because the ratchet refuses a
new allowlist key). Then `cart.order.void` is admitted (PR E, wcpos/monorepo#2476): payload
`{ orderId, orderNumber, status, registerId, sessionId, actor, paymentLegs: { live, captured, device } }`
(`actor` as `checkout.complete` carries it; the counts are taken inside the queue slot from the latest
order, and a card leg the terminal service still holds counts as live), nothing rewritable, result
`{ kind: removed | kept-pending }`; dispatched inside `enqueueOrderMutation` with `payments.gate`
required, the delete and its first bounded outcome watch as the bottom handler and the 120 s late
watch outside the slot (a late refusal that keeps the order writes a second, correcting row). First
consumer: an extension-tier after-hook `audit.order-voided` writing a new `order.voided` row with the
actor; a refused void writes no row (`checkout.cancelled` promises reversed payments and does not
fit). Second: a `payments.gate` guard that **refuses a void while the order has live or captured
payment legs**, pointing the cashier to the tender pane's Cancel, which reverses the legs first.
Before, such a void silently deleted the order, money and all; that is the behaviour change the event
buys. No session gate: a void moves no money and must work with no open session.

**Cash rounding, ruled 2026-10-12 (Paul: "start the rounding work"):** #66 and #84 are admitted as
the **first rewriting consumer** of `checkout.tender.commit`; every hook landed so far observes or
refuses, so this is the proof of the third move. The merchant ask (CZ, AU, SE, NZ, and every country
that withdrew its small coins): a cash tender rounds the amount due to the nearest increment, card
and online tenders keep full precision, and the difference is recorded so the books balance. The
setting is per method, as #84 asks, which also answers #66.

*Setting and descriptor.* The POS gateways are hidden from WooCommerce's settings screens by design
(`Gateways::should_suppress_pos_gateways`), so `pos_cash` has no WooCommerce page; its page is the
POS settings screen's gateway modal, and that is where the field goes: **Rounding**, a select
(no rounding, 0.05, 0.10, 0.25, 0.50, 1, 5, 10), shown for cash-kind gateways only, stored as
`rounding_increment` (a decimal string, `''` for none) in `woocommerce_pos_settings_payment_gateways`.
`Descriptor_Builder::build()` fills the slot that already exists and is `null` today:
`defaults.rounding = { increment, mode: 'nearest' }` for a cash-kind gateway with an increment, else
`null`. The app's `PaymentMethodDescriptor` already declares that shape. The till reads it on start
and on `config-changed`; a changed increment reaches a running till on its next start, as every
gateway setting does today.

*The hook.* `cash.rounding` (extension tier, order 0, `pos/checkout/cash-rounding-hook.ts`,
side-effect imported where the tender guards are). On `checkout.tender.commit` it is a pass-through
unless the method's `defaults.rounding` is set, `mode === 'manual'` and the tender completes the
sale (`amountMinor >= balanceMinor`); then it rewrites
`{ amountMinor: due, balanceMinor: due, roundingMinor: due - balanceMinor }` with
`due = roundToIncrement(balanceMinor, incrementMinor, mode)` (a pure function in
`order-math/payments/rounding.ts`, half-up for `nearest`, integer minor units). A partial cash tender
is never rounded: the cashier hands what they hand. The hook reaches the descriptor through a new
read on the context, `ctx.read.paymentMethod(id)`; a hook still writes nothing. The keys
`amountMinor`, `balanceMinor` and the new `roundingMinor` (default `0`) become rewritable;
`tenderedMinor` stays the cashier's entry.

*The handler (the refactor the 2026-10-09 amendment asked for).* `commitTender` derives everything
from `e.payload` after the chain: completing is `amountMinor === balanceMinor` on the rewritten
payload, the split plan's last share, the provenance decision and the `completeOrderFlow` facts
read the payload, never the render-time captures. When `roundingMinor !== 0` the handler, before
the leg, patches a fee line named by `pos_checkout.rounding` ("Rounding") with
`total = fromMinor(roundingMinor)`, `tax_status: 'none'`, the POS intent meta carrying
`{ rounding: { increment, paymentId } }`, and the order's money fields recomputed in the same patch
through `settleAggregate` (the settlement subscription is asynchronous; the leg must see the new
total). The manual writer then records `amount = due`, `tendered` as entered, so `change = tendered
- due`. Online, the provenance push already precedes a completing cash row and carries the fee line,
so the server's ledger sees the rounded total before `POST orders/{id}/payments` (its `record()`
refuses an amount above the balance and `derive()` leaves a short payment in `pos-partial`; both
are why the total moves, not the payment). A rounded due of `0` writes the fee and completes as
`zero-balance`. `useVoidPayments` drops the fee lines whose rounding meta names a row it voids, in
the same patch, so reversing the cash leg reverses its rounding.

*The pane.* Cash is the one method whose due the cashier must see before committing: with a cash
tile selected and an increment set, the large figure, the "Exact amount" chip, the quick chips and
the entry cap use the rounded due, with a one-line hint `pos_checkout.rounded_from`
("Rounded from {amount}"). The preview calls the same pure function; the hook is the authority at
commit. Card and other tiles are untouched.

*Logs.* No new row: the cash row's `change` and the fee line are the record. Receipts show the fee
line as any fee.

*Not in this ruling.* A rounding mode other than nearest in the UI (the function and the descriptor
carry `up` and `down`; the select offers nearest); rounding on the legacy order-pay page
(`Cash::apply_tendered_payment`); rounding of non-cash tenders.

Built as two PRs: **G1** on wcpos/woocommerce-pos `next` (the modal field, the option default and
validation, the descriptor fill, PHPUnit); **G2** on wcpos/monorepo `next` (the pure function, the
context read, the rewritable keys, the hook, the handler refactor and fee write, the void drop, the
pane preview, LEDGER and README). G2 is unit-proven against a descriptor fixture and does not wait
for G1; live proof on dev-next needs both plus a bundle dispatch.

## 3. The hook (R2, R3, R4)

### 3.1 Shape

```ts
type ActionHook<E extends ActionEvent> = (
  ctx: ActionContext,
  e: ActionEventInput<E>,
  next: (e: ActionEventInput<E>) => Promise<ActionResult<E>>
) => Promise<ActionResult<E> | ActionRefusal>;

registerActionHook(event, hook, { id, tier, order? });
```

- `e` is **deeply frozen plain data** held to the RSC-serialisable list: `{ event, orderId, actor:
  { userId, registerId, sessionId }, source: 'user' | 'replay' | 'system', payload }`. Never an
  `RxDocument`; the dispatcher builds it with `toJSON()`. `actor` and `source` are stamped by the
  dispatcher from the register session and the caller; nothing infers them from RxDB.
- `id` is a closed dotted id (`stock.guard`, `session.gate`, `fiscal.provenance`, `audit.log`),
  unique per event; a second registration under the same id throws at registration
  (first owner wins; validated at registration).
- `tier` is `'guard' | 'extension'` (§3.3). `order` is a number, default 0; within a tier the chain
  runs by `order` then `id`, as slots.
- No matcher argument in v1; a hook reads `e` itself.

### 3.2 The three moves

| Move | Code | Effect |
|---|---|---|
| observe | `return next(e)` | nothing changes; the hook saw the event |
| rewrite | `return next({ ...e, payload: { ...e.payload, line } })` | everything beneath sees the rewritten payload |
| refuse | `return { deny: { reasonKey, detail? } }` without calling `next` | nothing beneath runs; the caller shows `reasonKey` |
| after | `const r = await next(e); …; return r` | work after the chain beneath answered; the hook's own return is then ignored and the chain's answer stands (amended on the third review: an after-hook could otherwise replace or lose a guard's refusal) |

`reasonKey` is a translation key the caller already knows how to show: the cart's toast for the
two cart events, the tender pane's folded *not available* list and its commit-time toast for the
checkout events. `detail` is plain data for the log row, never shown raw. A `deny` returned **after**
`next` resolved is a hook failure (the writer has written), logged as a strike (§3.5), and the
result stands.

### 3.3 Tiers and order (R3)

- **`guard`**: first-party only, runs **innermost** (after every extension, before the writer), may refuse, **fails closed** (§3.5).
- **`extension`**: runs **outermost**; may observe and rewrite; a `deny` from an extension is ignored, logged and the
  chain continues (no surveyed system gives untrusted code a veto; the sandboxed tier inherits
  this rule unchanged). **Fails open.**
- The chain is `extensions (by order) → guards (by order) → bottom handler` (**amended overnight
  2026-10-09, Q5 on #421**: R3 said guards outermost, but then no guard ever sees an extension's
  rewrite and an extension could rewrite a quantity after the stock guard passed it; guards now run
  innermost and judge the payload the writer will write). A guard cannot refuse after `next` (the
  writer has run); a refusal of its own after `next` is a strike and the inner answer stands.
- v1 registers no `extension`-tier hooks except the audit observer (§8.3), which is first-party code
  deliberately registered as an extension to prove the lane.

### 3.4 Where a dispatch runs

Every dispatch runs **inside** `enqueueOrderMutation(orderId, …)`. `dispatchAction` takes the queue's
`OrderMutationContext` as a required argument, so it cannot be called from outside a queued mutation
without faking one; a dispatch that is handed a context the queue did not mint throws. Because the
queue serialises the order's writes, a rewrite is always applied against an unchanged target; no
`_rev` comparison is needed in v1 (recorded in `LEDGER.md` as the reason).

`checkout.complete` additionally runs under the completion attempt record that `completeSale` already
keeps (a paid order cannot start a second completing attempt while its finish runs); the dispatcher
does not add a lock of its own.

`checkout.tender.commit` wrapping the tender in the order's queue means a cart edit for that order
queues behind the commit (a manual leg's POST, or the moment a terminal leg is handed to the
service). That is the intended effect: nothing edits a cart while its money is being taken.

### 3.5 Budget, strikes, effects (R4)

Named constants in `registry.ts`, with the reason beside each:

```ts
/** Shared by every hook on one dispatch; the writer's time is not counted. */
export const ACTION_BUDGET_MS: Record<ActionEvent, number> = {
  'cart.line.add': 1_500,        // a tap must not feel stuck
  'cart.line.update': 1_500,
  'checkout.tender.commit': 5_000, // a card leg already waits longer
  'checkout.complete': 5_000,
};
/** Timeouts or throws in one session before a hook is switched off. */
export const ACTION_HOOK_STRIKES = 3;
```

- **One budget per tier on a dispatch** (amended overnight on the third review of #2454: with
  extensions running first, a shared budget let a slow extension starve a guard into a timeout and
  three of those disabled it — an extension veto by the clock), started when that tier's first hook
  is called and shared by the tier's hooks; total hook latency is bounded by two budgets.
  A hook still pending when the budget ends is treated as timed out. A hook's own timer stops once
  it has called `next`: the time it spends waiting on the chain beneath is the inner hooks' to pay.
  After-work (once the chain beneath has answered) gets a fresh budget of the same length; a hook
  that never returns is struck and the inner answer stands, so the dispatch and the order's queue
  behind it never hang (amended overnight on the bot review of #2454's third head).
- **On timeout or throw:** an `extension` hook is skipped and the chain continues; a `guard` hook
  refuses with `reasonKey: 'hook_timeout'` or `'hook_failed'` and the hook's `id` in `detail`.
- **Strikes:** after `ACTION_HOOK_STRIKES` timeouts or throws in a session the hook is switched off
  for the session; one log row names it. The registry exposes `getActionHookState(id)` for the logs
  screen. **Ruled 2026-10-09 (Q7 on #421, Paul, as recommended): a switched-off hook stays off until
  the app restarts; there is no re-arm, timed or manual.** A guard that failed three times on a money
  path is not re-armed silently, and a disabled guard refuses every dispatch until then (fail closed);
  the cashier's recovery is a restart, which the `actions.hook.disabled` row names.
- **No effects before `next`:** `ctx` in v1 is **read-only**: `ctx.log(level, event, data)`,
  `ctx.t(key)`, `ctx.read(collection, id)` (plain data), `ctx.settings` (plain data),
  `ctx.now()`. A hook that must act does so after `await next(e)`. A timed-out hook keeps running
  in JavaScript; with a read-only `ctx` and no document in reach it can change nothing. The
  capability surface grows per consumer, as the bridge's did.

### 3.6 Replay and source (R5)

- The completion-journal replay dispatches `checkout.complete` with `source: 'replay'`. Hooks must
  be deterministic on `e`; an observer that writes rows keys them on `payload.attemptId` so a replay
  never double-writes.
- A document that arrives by replication raises nothing. RxDB's pull and conflict paths bypass the
  collection hooks, and this contract raises events only from the four callers in §2.
- Server-side participation stays WooCommerce's and the REST routes'. Woo is the authority on money
  and stock; a guard here is the first line, never the last.

## 4. Where it lives (R6)

`packages/core/src/extensions/actions/` beside `slots/`:

| File | Holds |
|---|---|
| `types.ts` | `ActionEvent`, `ActionContracts` (payload and result per event), `ActionEventInput`, `ActionResult`, `ActionRefusal`, `ActionHook`, `ActionContext` |
| `registry.ts` | `ACTION_API_VERSION = 1`, `ACTION_BUDGET_MS`, `ACTION_HOOK_STRIKES`, `registerActionHook`, `getActionHooks(event)`, `getActionHookState(id)`, `resetActionRegistry()` (tests), `subscribeActionRegistry` |
| `dispatch.ts` | `dispatchAction(event, input, queueContext, bottom)`: builds and freezes `e`, runs the chain with the budget, tiers and strikes, calls `bottom` last |
| `context.ts` | the read-only `ActionContext` builder |
| `README.md` | the admission test, the tier rules, the guard-ordering example, the candidates list |
| `LEDGER.md` | decisions, appended never rewritten (the house convention) |

- **Status: internal**, reachable only at `@wcpos/core/extensions/actions`, exported from no other
  barrel, API pinned for the dogfood period (#124's lock, as slots).
- **Static registration in code**, module level, no manifest; registration order is the import
  order of the first-party consumers, as slots.
- **The write fence** (amended 2026-10-09, slice 3b, wcpos/monorepo#2459): a ratcheting scanner
  under `packages/eslint` after the Uniwind precedent (`orders-write-scanner.mjs`,
  `orders-write-fence.test.mjs`, `orders-write-allowlist.json`), not an ESLint rule — order writes
  are too polymorphic (`localPatch({ document: order })`, `order.incrementalPatch`,
  `collections.orders.insert`) for a type-blind rule, and the ratchet gives "shrinks, never grows"
  for free. It records document writes (`incrementalModify`, `incrementalPatch`, `patch`, `update`)
  on any identifier containing "order", `localPatch`/`localModify` on such a document, and the
  `orders` collection's insert/upsert methods, under `screens/main/pos/` and `services/`. The four
  bottom handlers and the leg/completion writers the tender handler delegates to are exempt by a
  named list in the scanner with a reason each; every other writer is in the allowlist with its
  count, burning down under #421 as each becomes a reserved event or moves behind a bottom
  handler. Name-based: an order held under a name without the word escapes it (documented).

## 5. Logging

Every dispatch writes nothing by itself. The audit observer (§8.3) writes the rows the app writes
today, with two additions: `e.actor` and the hook ids that rewrote or refused. Strikes and
switched-off hooks write one row each, vocabulary `actions.hook.timeout`, `actions.hook.failed`,
`actions.hook.disabled`, registered in the logs vocabulary with titles (the card-reader logging
slices' pattern).

## 6. Terminals and the descriptor: how the existing contracts sit on this one

- A server or device leg's **commit** is `checkout.tender.commit` with `mode` from the descriptor;
  the bottom handler is the terminal-payments service's `intent`. Capture, status, void and refund
  stay the service's own routes and raise no events in v1 (their writer is the server).
- A `gateway`-mode method (contract 1.2) commits through the same event with `fields` in the
  payload, so a guard may refuse or rewrite declared field values before the submit route is
  called; the `sent` outcome then completes through `checkout.complete` like any other.
- Declared UI, slots and the bridge are untouched.

## 7. Reserved, not built

- Matchers on `registerActionHook`.
- Events for receipt print, register open/close, discount apply, customer set, refund.
- An `extension`-tier veto (never, by ruling), and any effectful `ctx` method.
- Sandboxed delivery of hooks (the Remote DOM lane, #140); hooks ship in the bundle.
- Server-side mirrors of events.

## 8. Build slices (one PR each on `next`, each under the 400-line non-test ceiling)

1. **The primitive** (`wcpos/monorepo`), then **1b, the stock guard onto it** (split overnight
   2026-10-09: the two together came to about 520 non-test lines, over the 400 ceiling, so the
   primitive lands alone with its tests, README, LEDGER, export and glossary, and the stock-guard
   move is the next PR). The lint rule moves to slice 3. Two semantics fixed while building: a
   disabled **guard** is not skipped but refuses every dispatch (`actions.hook_disabled`), a
   disabled extension is skipped; and `getActionHooks` keeps disabled guards for that reason.
   The `actions/` module (§4). `useAddItemToOrder` and `useUpdateLineItem` dispatch `cart.line.add`
   / `cart.line.update` inside their queued mutation; `checkCartStock` becomes the `stock.guard`
   hook (`tier: 'guard'`), returning `{ deny: { reasonKey: stockRejectionKey } }` or `next(e)`, with
   the backorder toast moved to after `await next(e)`. Behaviour-preserving. Tests:
   `use-add-item-to-order.test`, `use-update-line-item.test`, `stock-guard.test`, plus new
   `registry.test.ts` and `dispatch.test.ts` (ordering, budget, strikes, frozen `e`, refusal after
   `next` is a failure, extension deny ignored, dispatch outside the queue throws).
2. **Tender commit** (`wcpos/monorepo`). `takeTender` dispatches `checkout.tender.commit` inside
   `enqueueOrderMutation(order.uuid, …)` from `prepareSale` onward; the choose-register check and
   `requireOpenSession` leave `prepareSale` and register as the `register.gate` and `session.gate`
   guards (`tier: 'guard'`, in that order); the attempt record, the provenance stamp and the leg
   stay in the bottom handler in their current order; the caller maps the two refusals to the
   toasts it shows today. Behaviour-preserving. Tests: `use-tender-flow.test`,
   `sale-completion.test`, `use-checkout-session.test` (it also calls `prepareSale`).
3. **Sale completion + the audit observer** (`wcpos/monorepo`). `completeSale` dispatches
   `checkout.complete` around `finishSale` (no guard); the journal bridge dispatches with
   `source: 'replay'`; the `checkout.completed` audit row moves to one `audit.log` hook registered
   as `tier: 'extension'`, `order: 0`, writing the same row plus `actor` and hook ids; the §5
   vocabulary lands. Behaviour-preserving. Tests: `sale-completion.test`,
   `completion-journal-bridge.test`, `use-complete-order-flow.test`, the terminal service's tests,
   the logs vocabulary tests, a screenshot pair of the strike row on the logs screen.
4. **Checkout conditions (#62)** — the first feature consumer, its own spec against this contract.

Each PR needs the `independent-review` status from a fresh Opus reviewer on its final head. Slice 1
before 2 before 3; slice 4 after Paul names its train.

## 9. Glossary lines for `CONTEXT.md` (*Language — Extensibility*)

**Action event**: a named thing the POS is about to do (`cart.line.add`), dispatched through a chain
of hooks before its one writer runs. Closed dotted list; a fifth needs one writer, a typed result
and a waiting consumer. _Avoid_: filter, event bus, "fire".
**Hook**: a function `(ctx, e, next)` registered on an action event that observes, rewrites or
refuses it; `e` is frozen plain data with `actor` and `source`. _Avoid_: listener (that is RxDB's
side), middleware (we say hook).
**Guard**: a first-party hook that may refuse and fails closed.
**Bottom handler**: the one function that writes for an action event; nothing else writes that
collection for that action (lint-fenced).
The test between an action hook and an RxDB subscription: intent, the moment before, or the
power to refuse → hook; the fact of a change → subscribe.

## 10. Out of scope

- Any change to what the four actions do today; slices 1 to 3 are refactors.
- The sandboxed third-party tier, consent, distribution, and the public API (v2+, #226).
- Commands (keyboard hotkeys #65, change of cashier #72): a sibling primitive that would *raise*
  these events; its own ticket.
- Customer display, reports and register directory: subscriptions, not hooks (§1).

## 11. Acceptance

- Slices 1 to 3 merged on `next` with every named test green and **no change in any existing
  snapshot or screenshot** except the new strike row.
- `registry.test.ts` and `dispatch.test.ts` prove: order within and across tiers; an extension
  `deny` is ignored and logged; a guard `deny` stops the chain and nothing is written; a `deny`
  after `next` is a strike and the result stands; a timed-out guard refuses with `hook_timeout`; a
  timed-out extension is skipped; the third strike switches the hook off and writes one row; `e`
  is frozen (assignment throws); `dispatchAction` outside a queued mutation throws; `source:
  'replay'` reaches the hooks.
- The lint rule reports a direct `incrementalModify` on `orders` added in a test fixture file, and
  its allowlist lists every pre-existing offender with a ticket number.
- Live on dev-next (web) and the local Electron pair: add a line past available stock with the
  guard on (refused, same toast as today), complete a cash sale with no open register session
  (refused, same open-register-first toast), complete a cash sale (the audit row shows the actor
  and an empty hook list).
