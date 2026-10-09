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
| `checkout.tender.commit` | `takeTender`, from `prepareSale` onward (the zero-balance completion included, as `mode: 'zero-balance'`) | `{ methodId, mode, amountMinor, tenderedMinor, balanceMinor, completing, bindingStatus }` | `amountMinor`, `tenderedMinor` | yes | the existing sequence: `prepareSale`'s attempt record, the provenance stamp, then the leg (`recordManualPayment`, or the minted row and `service.begin`), or the zero-balance patch | the leg outcome |
| `checkout.complete` | `completeSale` | `{ source, registerId?, sessionId? }` | nothing | **no** (money has moved; the completion attempt record is the only gate) | `finishSale` | `'completed' \| 'partial' \| 'not-completed'` |

**Correction on reading the code (2026-10-09, overnight):** `requireOpenSession` and the choose-register check run in `takeTender` through `prepareSale`, before any leg and before the zero-balance completion, not inside `completeSale`; and the provenance stamp (`persistSaleProvenance`) is a **write** that must reach the store before the leg, so it is part of the writer's sequence, never a hook (hooks have no effects before `next`). The guards therefore sit on `checkout.tender.commit` (`register.gate`: refuse `pos_checkout.choose_register_first`; `session.gate`: refuse `pos_checkout.open_register_first`), and `checkout.complete` has no guard in v1. R7 and §8 below are amended to match; the ruling's intent (session gate and provenance as first-party consumers, behaviour-preserving) is unchanged, only their placement.

**Admission test** for a fifth event, written into the registry README: (a) one writer function
already exists for the action, (b) the event has a typed result, (c) a named consumer is waiting.
Receipt print, register open/close, discount apply and customer set fail (a) today and are listed
in the README as candidates, not events. No past-tense notification events: `await next(e)` is the
after-hook (§3.2).

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
| after | `const r = await next(e); …; return r` | work after the writer ran, with the result |

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

- **One budget per dispatch**, shared by every hook on it, started when the first hook is called.
  A hook still pending when the budget ends is treated as timed out. A hook's own timer stops once
  it has called `next`: the time it spends waiting on the chain beneath is the inner hooks' to pay.
- **On timeout or throw:** an `extension` hook is skipped and the chain continues; a `guard` hook
  refuses with `reasonKey: 'hook_timeout'` or `'hook_failed'` and the hook's `id` in `detail`.
- **Strikes:** after `ACTION_HOOK_STRIKES` timeouts or throws in a session the hook is switched off
  for the session; one log row names it. The registry exposes `getActionHookState(id)` for the logs
  screen.
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
- **The lint fence:** an ESLint rule in `packages/eslint` (`wcpos/orders-write-through-actions`)
  that reports `incrementalModify`, `incrementalPatch`, `patch`, `insert` and `bulkUpsert` on the
  `orders` collection outside the four bottom handlers and the services already named sole writers
  in their ledgers. Existing offenders go in the rule's allowlist with the ticket that burns each
  down; the allowlist shrinks as consumers touch them, never grows.

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
