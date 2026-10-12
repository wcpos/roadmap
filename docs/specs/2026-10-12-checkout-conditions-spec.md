# Checkout conditions: the stock condition, the first feature consumer of the action-event contract

Date: 2026-10-12. Lane: `next` (WCPOS 2.0). Owner: Paul. Status: **design chosen**, spec awaiting
the owner's read. Ticket: [#62](https://github.com/wcpos/roadmap/issues/62). Contract: the
action-event spec (`2026-10-09-action-event-contract-spec.md`, §8 slice 4 names this as the first
feature consumer). Visual reference: `docs/prototypes/2026-10-12-checkout-conditions/index.html`
(open it locally; the controls along the top switch variant, device, theme, case and "after tap").
Market survey: `research.md` beside it. Rules: monorepo `.claude/rules/design.mdc`.

## Owner decisions (2026-10-12)

1. **Train: 2.0.** *"I think we'll ship the overselling feature in two, if that makes sense. And
   maybe the cart button state as well?"* Both ship: the stock condition and the cart state.
2. **No core setting for a required order note, or for any other condition.** *"Adding a setting
   for whether an order note is required doesn't make sense at all. That's not something we're
   going to include in every point of sale system. It's something that extensions can tap into if
   they want to."* The Checkout tab of the POS settings does not change. The note and line-info
   rules from the ticket are declarations an extension contributes later (§6), never core toggles.
3. **A condition is data, not code.** Reasoned from the use cases at Paul's prompt (*"You should
   be able to figure this out by thinking about all the different use cases"*): every present and
   foreseeable condition (stock, note, line info, minimum amount, customer required, tax ID over a
   threshold, age check, manager approval, a plugin's own rule) is a predicate over the order
   snapshot plus a declaration of what is required; the acknowledgement cases are satisfied by a
   cashier's act that writes a fact onto the order. And third-party code in the app is sandboxed
   and vetoless by the #421 ruling, so a plugin's condition can only ever reach the app as a
   declaration. One shape at every horizon: a rule, one pure evaluator, one guard.
4. **The stock condition is the existing feature's second moment.** Prevent overselling refuses a
   line at add time today (`stock.guard.add` / `stock.guard.update`) and cannot watch the cart
   afterwards. The condition rides the same `prevent_overselling` setting and the same predicate,
   and covers stock that moved while the cart sat open.
5. **Cart state A, the notice slot.** *"Yep as you recommend."* From a four-variant board (notice
   slot, button carries it, line only, reason under the button): an amber notice in the slot the
   totals-changed banner owns, one row per over-stock line with its verb, Pay dimmed and never
   silent. Variants B, C and D were shown and not chosen.

## What it changes

`packages/core/src/screens/main/pos/`, the register's cart and the tender flow, on `next`. Nothing
in the plugin: the server's `Stock_Validator` already refuses an order leaving the open statuses
with insufficient stock, and this is the app-side layer of that rule (the ticket's words). No new
setting, no new event, no change to the add-time guard, the totals-changed banner, the legacy
pay page's own plumbing or the gateway/webview refusal parsing. Every dispatch of
`checkout.tender.commit` meets the gate, the gateway-mode sale (`commitGatewaySale`) included: an
over-stock order is refused before a gateway is reached (ruled while building, 2026-10-12).

## 1. The rule and the evaluator

A **condition** is a rule: `{ id, kind, enabled, params, message }`, with `kind` from a closed
first-party list. In 2.0 the list evaluates one kind:

```ts
type ConditionRule =
  | { id: 'stock'; kind: 'stock'; enabled: boolean }      // enabled === store.prevent_overselling
  // reserved kinds, shaped for and not built (§6):
  // | { id; kind: 'note'; enabled; params: {} }
  // | { id; kind: 'line-meta'; enabled; params: { keys: string[] } }
  // | { id; kind: 'min-total'; enabled; params: { minor: number } }
  // | { id; kind: 'customer'; enabled; params: {} }
```

`evaluateConditions(snapshot, rules): UnmetCondition[]` is a pure function in
`pos/conditions/evaluate.ts`. The snapshot is plain data built by the caller:

```ts
type ConditionSnapshot = {
  lines: Array<{ uuid: string; productId: number; variationId: number; quantity: number }>;
  stock: Record<string, StockFacts | null>;   // key `${productId}:${variationId}`; null = unknown
};
type UnmetCondition = {
  id: 'stock';
  reasonKey: 'pos_cart.only_n_available' | 'pos_products.out_of_stock';
  params: { n?: number; name: string };
  lineUuid: string;              // where the fix is
  fix: 'reduce' | 'remove';      // the verb on the notice row
  available: number | null;
};
```

The stock kind reuses the add-time guard's judgement: `evaluateStockForCartChange` in
`pos/hooks/stock-guard.ts` is the one predicate, called per line with the line's quantity and the
sum of every other line of the same product or variation (two lines of one product count once
against its stock, as the add guard counts them). `allowed: false` is unmet; `warning: 'backorder'`
(backorders `notify`) is not unmet, as it is a warning at add time too; unknown availability is
unmet with `pos_products.out_of_stock`, as the add guard refuses it. `fix` is `remove` when
`available` is 0 or unknown, `reduce` otherwise. `rules` with `enabled: false` produce nothing, so
a store with overselling allowed never sees the state.

The evaluator reads no document and dispatches nothing. It is the **one predicate** for the cart
state (§2) and the gate (§3), which cannot disagree because they share it (the cash-rounding
lesson: pane and hook share one function).

## 2. The cart state (variant A)

`useCartConditions(order)` in `pos/conditions/use-cart-conditions.ts` builds the snapshot live:
the order's line items (uuid, product and variation ids, quantity) and, for each distinct product
or variation they name, the stock facts from the local catalog (`manage_stock`, `stock_quantity`,
`stock_status`, `backorders`; the parent's facts when a variation does not manage its own, as the
add guard resolves them). It subscribes to the order document and to those catalog documents, so a
sync that lowers a level or a quantity edit on the line re-evaluates without a tap. It returns
`unmet` (stable by `lineUuid`) and nothing else.

**The notice** `cart/conditions-notice.tsx` mounts in `cart/index.tsx` directly after
`CartTotalsChangedBanner` and before `Totals`: a sibling in the one notice slot, the amber box the
totals-changed banner uses (`border-attention/50 bg-attention/10 m-2 rounded-md border p-2`),
inline, not modal, not dismissible. One row per unmet line: the stock icon, the message from
`reasonKey` and `params` ("Only 2 available for Belt", "Beanie out of stock"), and the verb at the
right edge, "Reduce ›" or "Remove ›". The row is the tap target: `reduce` scrolls the line into
view and opens its quantity keypad (`v2/cells/quantity-keypad.tsx`); `remove` calls the line
strip's own `removeLineItem(uuid, type)` (`v2/cells/line-strip.tsx`), so the writers stay
`cart.line.update` / `cart.line.remove` through the existing hooks. The notice writes nothing
itself. Three or more rows still render as rows (the board shows
two); the slot scrolls with the cart body, it never caps.

**The line mark**: the over-stock line's name cell shows the stock icon and "2 available" /
"Out of stock" from `pos_cart.n_available` / `pos_products.out_of_stock`, and its quantity box
takes the attention colour. `v2/cells/product-name.tsx` already renders `n_available` when the
server refuses stock; it now takes that state from `useCartConditions` as well, and both paths
move from `text-destructive` to the attention token (red on the till means void, rule 7). Icon and
words, never colour alone.

**Pay, dimmed and never silent.** `cart/buttons/pay.tsx` reads `unmet.length > 0` as a `blocked`
state: the button keeps its label ("Checkout {order_total}") and size, renders at the muted
opacity the board shows, and its press scrolls to the first notice row instead of entering
checkout (no save, no `enterCheckout`, no route push). `blocked` sits beside the existing
`storageDegraded` reason; it is not `disabled`, so the press always answers (rule 2: silence after a
tap is a bug). A `pos_cart.checkout_blocked` info row is logged on that press with the unmet ids,
no toast.

**The resolved beat.** When the last unmet row clears, the notice unmounts and Pay returns to full
opacity with a 200 ms ease-out (rule 6); no other animation.

## 3. The gate

`conditions.gate` in `checkout/tender/tender-guards.ts`, `tier: 'guard'`, `order: 2` (after
`register.gate` and `session.gate`), added to `TENDER_GUARD_IDS` so a dispatch without it refuses
with `actions.guard_missing`. It judges the payload, never a document (the void review's rule):

- `takeTender` in `checkout/tender/use-tender-flow.ts`, inside the queue slot it already holds and
  after its balance check, builds the snapshot from `(queue.order ?? order).getLatest()` and
  `ctx.read.catalog` (reads are reads), runs `evaluateConditions`, and puts
  `conditions: { unmet: UnmetCondition[] }` on the payload. The key is not rewritable.
- The gate refuses with the first unmet's `reasonKey` and `params` when `unmet.length > 0`, else
  `next(e)`. Backorder warnings pass. The refusal reaches the cashier through
  `presentTenderRefusal` as today's toast, the tender pane stays open, and the cart behind it
  already shows the notice.
- The payload type in `extensions/actions/types.ts` gains the key; the actions `LEDGER.md` gains one
  line (the gate judges the slot's count, as `payments.gate` does); the README's consumers list
  names #62.

The gate is the enforcement; the cart state is the courtesy. A tender pane opened before stock
moved, a split sale's second leg, and a keypad shortcut all meet the gate.

## 4. Words

Existing keys are reused: `pos_cart.only_n_available` ("Only {n} available for {name}"),
`pos_cart.n_available`, `pos_products.out_of_stock`, `pos_cart.will_be_backordered`. New keys, en
only, in `contexts/translations/locales/en/core.json`:

- `pos_cart.out_of_stock_for`: "{name} out of stock"
- `pos_cart.reduce_line`: "Reduce"
- `pos_cart.remove_line`: "Remove"
- `pos_cart.checkout_blocked`: "Checkout blocked until {n} lines are fixed" (the log row)

Copy is a statement of stock, never the app refusing: no surveyed POS hard-blocks an in-person
sale over stock (research.md), so the block reads as the merchant's rule.

## 5. Behaviour that must not move

- The add-time guards, their refusal keys, toasts and tests.
- `Stock_Validator` on the server and the gateway/webview parsing of `wcpos_insufficient_stock`.
- The totals-changed banner: it stays first in the slot; the two render as siblings.
- A store with `prevent_overselling` off: no notice, no mark, no gate refusal, Pay unchanged.
- The register and session gates and their order; `cash.rounding` still runs first.
- Every existing cart snapshot and screenshot, except the name cell's colour on the server-refusal
  path (destructive → attention), which is the one visual change outside the new state.

## 6. Reserved, not built

- The declaration transport: a plugin contributes rules as data in the store payload (beside
  `prevent_overselling`) or on the product (line info), under #226. The `ConditionRule` shape above
  is what it will declare; the evaluator gains a kind per consumer.
- The kinds `note`, `line-meta`, `min-total`, `customer`, and the acknowledgement kinds (age check,
  approval), each with its consumer.
- An override. A condition is never skipped; an approval kind is satisfied by a written fact.
- A matcher or a per-register rule.

## 7. Tests and proof (polish phase on `next`)

- `conditions/evaluate.test.ts`: the truth table (manage_stock off; backorders `yes` / `notify` /
  `no`; two lines of one product summing; a variation against its own and its parent's stock;
  unknown availability; `enabled: false`; `fix` by availability; stable order by line).
- `use-cart-conditions.test.ts`: a lowered catalog level re-evaluates; a quantity edit clears the
  row; a store with overselling off returns nothing.
- `conditions-notice.test.tsx` and `pay.test.tsx`: one row per unmet line with its verb; the row
  opens the line's keypad; a blocked Pay press scrolls and never saves or enters checkout; the
  storage-degraded path unchanged.
- `tender-guards.test.ts` and `use-tender-flow.test.ts`: the gate refuses with the first unmet's
  key and no leg is written; passes on backorder; `guard_missing` without it; the slot's count,
  not the press-time count, decides (a line changed by a queued write ahead).
- Mutation checks a fresh reviewer runs: the gate's refusal removed; the notice fed by a stale
  count; `enabled` ignored; the sum of sibling lines dropped.
- `orders-write-fence.test.mjs`: allowlist unchanged (the notice and the hook write nothing).
- Screenshots in the PR body: tablet and phone, light and dark, one and two lines, the resolved
  state; the gallery entry for the cart if one exists.
- Not verified live until the next `next` bundle on dev-next; the no-stock path can be driven
  headlessly there by lowering a product's stock in wp-admin under an open cart.

## 8. Plan of record

One PR on `next` under #62, within the 400-line non-test ceiling (evaluator and hook about 120,
notice and Pay state about 90, the gate and payload about 50, the mark and words about 40). It
needs the `independent-review` status from a fresh Opus reviewer on its final head. #62 closes on
its landing comment; the extensibility map (#120) and #421 each get the landing line. The ticket's
other two conditions are not scheduled; they wait on a consumer under #226.
