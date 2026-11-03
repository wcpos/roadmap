# Automatic fees at the till: how and when WCPOS could land them, 2026-11-03

Asked by Paul, 2026-11-03, after a merchant's comment on [roadmap#64](https://github.com/wcpos/roadmap/issues/64#issuecomment-6602451333) (Default fee option): *"do some research and map out how and when we might be able to land such a feature. It should be thought of as an extensibility feature"* ([#120](https://github.com/wcpos/roadmap/issues/120), the app extensibility map). Desk research against the app on `main` (2.0, monorepo `1a9220960`), the Free plugin's `origin/main`, the ruled specs under `docs/specs/`, the roadmap tickets named below and the public surcharge rules. No code was run.

Labels: **O** Observed (read in the code, a ticket or a spec, path given). **I** Inferred. **U** Unverified (from memory, not re-checked this session).

## The short answer

Almost everything the merchant asks for already exists as a primitive on `main`; what is missing is the **declaration** that strings them together and one **field on the order**. A percent fee line is already recomputed by the engine on every cart change, already honours the Tax exempt switch, already prints as its own receipt line and already reaches WooCommerce as a fee. Cash rounding already proves a per-payment-method adjustment written as a fee line at commit time through the action-event chain. The checkout conditions spec already reserved "a plugin contributes rules as data in the store payload" as the declaration transport. So the feature is:

1. **A rule** (`fee` kind) declared per store: name, percent, basis, tax status, and `when: always | payment method in […]`. Declared by the merchant's settings and, through one filter, by any WooCommerce plugin. That is the extensibility: the first-party settings page is one declarer among several, not a "default fee" checkbox.
2. **An intended payment method on the order while it is still a cart**, set by a command, shown by a control, pre-selecting the checkout. The conditional fee follows it live.
3. **One engine step** that materialises a rule's fee line when absent and leaves a cashier's removal alone, plus **one guard** on `checkout.tender.commit` that refuses a commit whose conditional fees disagree with the leg's method.

No new action event, no new primitive, no server change beyond the declaration. About six PRs across three repos (sizes in §6). The decision that gates it is the train, and a design board for the cart control; both are Paul's. Two things to say plainly first: the word in merchant copy is **fee**, never surcharge (§4), and the merchant's current workaround can be eased on 1.11.x with a plugin change before any of this ships (§7).

## 1. What the merchant asked for

Michigan Service Office, Pro 1.11.10, WooCommerce 11.2.1 (the same Michigan merchant as [#485](https://github.com/wcpos/roadmap/issues/485) by the evidence of the two threads, **I**). Two charges on every POS sale: 10% service and handling always, 5% when the customer pays by card, both on the line-item subtotal before tax. Today they are two placeholder products priced by hand, so they show as product sales in reports. They want:

- a per-store list of automatic fees: name, percent of subtotal, condition (always, or payment method in a multi-select of the POS gateways), tax status with class;
- the fee lines live in the cart, recalculated as lines change, because customers with a fixed budget add and remove items until the total lands;
- a way to set the intended payment method **in the cart** (Cash / Card is enough; the exact card gateway is chosen at checkout as now), with checkout pre-selecting it and re-evaluating if the cashier changes it before the pay page loads;
- removal or edit of an automatic fee on one order through the existing line menu; each fee as its own receipt line;
- respect for the Tax exempt switch ([#477](https://github.com/wcpos/roadmap/issues/477)); documented behaviour against coupons and quick discounts.

The same ask was raised on Discord in May 2024 (a 5% card charge) and is what the `wcpos/credit-card-fee` plugin half-answers: a manual "Add credit card fee" button on the order-pay page, 3% constant, BACS only (**O**, that repo's README).

## 2. What exists on `main` today

| Need | What exists | Where | Label |
|---|---|---|---|
| A fee that is a percent of the subtotal, recalculated as the cart changes | A fee line carries `_woocommerce_pos_data: { amount, percent, prices_include_tax, percent_of_cart_total_with_tax }`; settlement step 5 recomputes every active percent fee over the active line items on every settle, after coupon replay ("coupon replay → percent fees on the post-replay basis") | `packages/order-math/src/settle.ts` 166–262; `cart-line.ts` `calculatePercentAmount` (sum of active line `total`, plus `total_tax` when the with-tax flag is set) | O |
| "Before tax" basis | `percent_of_cart_total_with_tax: false` is the ex-tax basis; the default follows the store's `prices_include_tax` | `order-math/src/internal/lines/pos-data.ts` `extractFeeLineData` | O |
| Tax exempt orders carry no fee tax | The fee maths spreads `vatExemptTaxFields(config, true)` into the recomputed line | `cart-line.ts`, fee path before `calculatePercentAmount` | O |
| Cashier removes or edits the fee on one order | `cart.line.remove` (null-out-or-drop patch, a tombstone) and `cart.line.update` for `fee_lines`, both through the action chain with one writer each | action-event spec §2 (2026-10-12 amendment); `pos/hooks/use-remove-line-item.ts`, `use-update-cart-line.ts` | O |
| Fee reaches WooCommerce as a fee, prints as a fee | Order writes accept `fee_lines` with the POS meta; `Orders::fee_after_calculate_taxes` keeps POS tax semantics; receipts render fee lines | Free `includes/Orders.php:1073`, `Sync/Order_Write_Payload.php` | O |
| A per-payment-method money adjustment at commit | Cash rounding: `rounding_increment` per cash gateway in the POS gateway modal → `defaults.rounding` in the descriptor → extension-tier hook on `checkout.tender.commit` rewrites the amounts → the bottom handler writes a "Rounding" fee line with intent meta before the leg → `useVoidPayments` drops it with the leg; the pane previews with the same pure function | `pos/checkout/cash-rounding-hook.ts`; `order-math/src/payments/rounding.ts`; Free `Payments/Contract/Descriptor_Builder.php:150`, `Services/Settings/Payment_Gateways_Section.php` | O |
| Rules as data, one evaluator, one guard | Checkout conditions (#62): `ConditionRule`, `evaluateConditions`, `conditions.gate`; §6 reserves "a plugin contributes rules as data in the store payload (beside `prevent_overselling`)" under #226 | `docs/specs/2026-10-12-checkout-conditions-spec.md`; `pos/conditions/` | O |
| A per-order switch in the Order details sheet, written by a command | Tax exempt: a row with its own hidden/disabled reasons, a command that settles the cart through `settleCartWrite` | `pos/cart/buttons/edit-order-meta/tax-exempt-row.ts`; `pos/commands/tax-exempt.ts` | O |
| The order's payment method before checkout | Nothing. `use-checkout-session.ts:236` reads `orderData.payment_method || 'pos_cash'`; no cart code writes `payment_method`; the tender pane's tile is the first choice | `pos/checkout/hooks/use-checkout-session.ts` | O |
| A surcharge capability on the descriptor | None, by ruling: *"Surcharges are out of 1.11.0 — legally uneven across countries and no driven gateway exposes them cleanly. The descriptor carries no surcharge capability. Revisit as its own effort if merchants ask."* (Paul, 2026-09-02, [#106](https://github.com/wcpos/roadmap/issues/106)) | #106 | O |
| Negative fees | Gone from the till; a discount is a coupon ([#91](https://github.com/wcpos/roadmap/issues/91), ruled 2026-08-24) | #91 | O |

Merchants have now asked, twice, so #106's "revisit as its own effort" clause is what this note answers.

## 3. How it fits the extensibility map

Four primitives are ruled on #120: slots (UI in, #139), descriptors (config in, #415), action events (the intent chain, #421), the read model (#423), and commands (#428). An automatic fee touches three and adds none.

**Declaration (config class).** A rule is plain data, in the shape the conditions spec reserved:

```ts
type AutomaticFeeRule = {
  id: string;                       // stable per store, written into the fee line's intent meta
  name: string;                     // the cart and receipt label
  percent: string;                  // decimal string, as fee amounts are
  basis: 'line_items' | 'line_items_inc_tax';   // today's percent_of_cart_total_with_tax, named
  tax_status: 'taxable' | 'none';
  tax_class: string;
  when: { always: true } | { payment_methods: string[] };   // POS gateway ids
};
```

It rides the store payload (per store on Pro for free: Pro's `Store extends DefaultStore` inherits a Free prop, memory `store-field-conformance-lists`; a per-store override is one `META_FIELDS` entry on Pro). The Free plugin builds the list from its own settings and passes it through one filter, so a WooCommerce plugin that wants a fee at the till declares one and never touches the app. That filter is the first use of the transport #62 §6 reserved, and the thing that makes this an extensibility feature rather than a checkbox: a payments plugin that charges by method, a service-charge plugin, a deposit plugin all declare the same shape. Reserved on the same shape, not built: a `discount` kind (a conditional quick-discount coupon, the lawful inversion of a card fee in countries that ban it, §4), fixed-amount fees, per-register rules.

**Engine (the read side of the rules).** One settle step, before today's step 5: for each rule whose `when` holds for the order, if no active fee line **and no tombstone** carries that rule's id in its intent meta, materialise one (`percent: true`, the rule's basis, tax fields); step 5 then recomputes it as it recomputes any percent fee. A removed automatic fee is a tombstone, so it stays off for that order; an edited one keeps its own meta, so the cashier's edit stands. The step is pure over the order snapshot plus the rules, lives in `@wcpos/order-math` beside the percent recompute, and writes through the one patch settlement already writes, so no second writer and no new event (the §1 axis of the action-event spec: a fee following cart state is a fact of state, not an intent). **I**: the settle pipeline is the right owner; a reviewer should confirm `settleAggregate` sees the rules through `config` without a new read.

**The intended method (a command, a field, a control).** The order already has `payment_method` and checkout already reads it as the preselected method (`|| 'pos_cash'`). The cheapest correct design reuses it: a command `pos.order.payment-method.set` is the one writer, a row in the Order details sheet is the first control (the Tax exempt precedent, with the same hidden/disabled reasons: locked once money is held, reopen first), and `when.payment_methods` evaluates against it. The merchant's Cash / Card is then a two-entry control over gateway ids: "Card" maps to every gateway in any rule's list, so both their card gateways produce the same total and the specific gateway is still chosen at the tile. Where the control sits (sheet row, a segmented control in the cart foot beside Add fee, a chip on the Pay button) is a **board**, not a pick, at build time (the GIVE ME OPTIONS rule).

**Commit (the guard).** When a tile is tapped the pane sets the intent through the same command before any amount is entered, so the keypad's balance already includes or excludes the fee; nothing rewrites amounts at commit, unlike rounding. A guard `fees.gate` on `checkout.tender.commit` (`tier: 'guard'`, after `conditions.gate`) refuses with a "totals changed, look again" key when the order's conditional fees disagree with the leg's `methodId`, so a split sale's second leg, a keypad shortcut and the gateway-mode sale all meet it. The Legacy tab, where the gateway is picked on the Woo page, counts as an unknown method: `payment_methods` rules do not apply to it, documented. Splits: v1 evaluates one intent per order, never per leg (a per-leg fee is a different product and was not asked for).

**Not touched.** Slots (no new insertion point: the control is a sheet row or a cart-foot button in existing composition), the broadcast (the customer display already shows fee lines), the descriptor (no surcharge capability is added; the rule names gateway ids, the descriptor stays ignorant of fees, as #106 ruled), the server's money model (a fee line is a fee line).

## 4. Why the word is "fee" and why the rule is generic

The card-fee half is the legally uneven part #106 named, and it has got more uneven since:

- **Australia** bans surcharges on eftpos, Mastercard and Visa cards (debit, prepaid and credit) from 1 October 2026 under the RBA's new standards; American Express followed on the same date ([NAB](https://www.nab.com.au/business/payments-and-merchants/merchant-support-centre/rba-surcharging-changes), [CommBank](https://www.commbank.com.au/articles/newsroom/2026/09/cba-card-surcharging.html), [Lightspeed AU](https://www.lightspeedhq.com/au/rba-surcharging/)). Lightspeed's page is what a POS vendor had to publish for its merchants.
- **United States**: Visa caps a credit surcharge at 3% and never above the merchant's cost of acceptance, Mastercard at 4%; debit cards may not be surcharged; Connecticut and Massachusetts ban them outright, California restricts line-item surcharges, Colorado caps at 2% (vendor compliance guides, which disagree on dates and on Maine: [Goodwin](https://www.goodwinlaw.com/en/insights/publications/2025/03/insights-finance-ftec-want-to-have-customers-cover-payment), [Verifee](https://verifee.com/resources/credit-card-surcharge-laws-by-state-the-2026-compliance-guide/), [PaymentCloud](https://paymentcloudinc.com/blog/credit-card-surcharge-laws-by-state/)). The merchant's 5% card fee is above Visa's cap; that is between them and their acquirer, and not something the till should judge.
- **UK and EU** ban surcharges on consumer cards (the UK since January 2018, the EU under PSD2 for cards covered by the Interchange Fee Regulation) (**U**).

So: the feature is **automatic fees with a condition**, named "Automatic fees" in settings and whatever the merchant types on the receipt; the condition is "payment method is one of", not "card"; the app knows nothing about networks, caps or countries; the docs page carries one line, "check the rules where you trade", and names the discount inversion once the `discount` kind exists. Square, for comparison, offers automatic percentage service charges but not a payment-method condition at the POS ([Square AU](https://squareup.com/help/au/en/article/7625)).

## 5. Open points for the decision ticket

Charted as a planning-only decision ticket under #120 (link on #64). Resolution rows, recommendation last:

- **R1 Rule shape and kinds.** The `AutomaticFeeRule` above, `fee` only; `discount`, fixed amounts and per-register rules reserved on the same shape.
- **R2 Who declares.** (a) Free settings → Checkout tab, a list editor, plus Pro per-store on the Stores screen, plus the filter; (b) plugin-only: no first-party settings, the filter and a small `wcpos/automatic-fees` plugin as the first declarer. Recommend (a): a service charge is a standard POS setting (Square, Lightspeed), and the filter ships either way.
- **R3 How a rule becomes a line.** The settle-time materialisation with tombstone-means-off; rule changes reach open carts on their next settle. Alternative: write the lines at order creation only (stale on rule edits, re-adds after removal need extra state). Recommend settle-time.
- **R4 The intent field.** Reuse `payment_method`, one command writer. Alternative: a protected meta key, which checkout would then have to read as well. Recommend reuse, with the lock rules Tax exempt has.
- **R5 The control.** A board of three at build time (sheet row; cart-foot segmented Cash / Card; Pay-button chip), phone and tablet.
- **R6 Checkout.** Tile tap sets the intent, `fees.gate` refuses a mismatch, Legacy tab is unknown, one intent per order. Alternative: a rewriting hook that adds the fee at commit as rounding does; rejected because the cart would not show it and the keypad balance would move after entry.
- **R7 Coupons and tax.** Basis is post-coupon line totals (today's engine order), documented; Tax exempt zeroes fee tax by construction. Nothing to decide, recorded for the docs page.

## 6. When

Facts about the trains (**O**, milestones read 2026-11-03): 2.0 is in public beta (beta 2 cut 2026-11-03, web and desktop only; features do not join a beta, Paul: *"I am always going to fix a few small things"*). `next` is deleted; GA re-cuts it. After GA: **v2.1.0 Fiscal compliance** (due 2026-12-31, already carrying non-fiscal items: the exchange flow, embedded barcodes, reporting templates, the printer wizard), **v2.2.0 Cashier permissions**, **v2.3.0 Works with your other plugins** (#226, where #62 pinned the declaration transport and where the plugin-integration consumers of the cart events sit).

Size once a train is named, each PR under the 600-line law and the 400-line task ceiling (**I**):

| PR | Repo | Carries | Non-test lines |
|---|---|---|---|
| F1 | woocommerce-pos | `automatic_fees` in the Checkout settings section (schema, validation, the list editor), the store payload prop, the `woocommerce_pos_automatic_fee_rules` filter, the five conformance lists | ~300 |
| P1 | woocommerce-pos-pro | per-store override as a `META_FIELDS` entry and the Stores screen rows (draft until F1 merges) | ~150 |
| A1 | monorepo | the rule type, the settle step, tombstone semantics, store schema field and `normalizeStorePayload` default | ~250 |
| A2 | monorepo | the command, the Order details row, the control from the chosen board variant | ~250 |
| A3 | monorepo | tile tap sets the intent, `fees.gate`, Legacy-tab rule, LEDGER lines | ~150 |
| D1 | docs | the fees page, the one legal line, coupon order | prose |

Roughly a week of sessions after the ruling, F1 → P1 and A1 in parallel → A2 (after the board) → A3 → D1, each with a fresh independent review.

**Options for the train.**

- **v2.1.0** (first minor after GA, due 2026-12-31). Pro: earliest the merchant can have it; the train already carries non-fiscal work; six small PRs. Con: it is the fiscal train and its date is the fiscal milestone's; every addition is load on the date.
- **v2.3.0** (#226). Pro: on theme for the declaration transport, beside the plugin consumers. Con: third minor out; the merchant keeps hand-pricing placeholder products through 2027.
- **A train of its own** between them, "the till does the arithmetic" (automatic fees, tips at the till, custom line fields #60). Pro: a public theme merchants read. Con: a new release issue is Paul's to open.

Recommendation: **v2.1.0**, with the filter in F1 from day one so #226 inherits a working transport rather than a promise.

## 7. The merchant now, on 1.11.x

Nothing above reaches 1.11.x (two-lane rule: 1.11.x is the patch line). What can ease the workaround before 2.x is a change to the public `wcpos/credit-card-fee` plugin, server-side only: a configurable percentage per fee instead of the 3% constant, an always-fee added when the POS creates the order (a `wcpos_request()` hook on order creation), and the card fee added automatically when a listed gateway is selected on the order-pay page instead of behind a button. Totals are then right at checkout and in reports, which removes the hand arithmetic and the product-sales misreport. The cart still does not show the fees before checkout, the same limit #485's stopgap has (the totals-changed banner fires after the first save). This is Paul's call, filed as an open point on the decision ticket, not started.

## Sources

- [roadmap#64](https://github.com/wcpos/roadmap/issues/64) and the merchant's [comment](https://github.com/wcpos/roadmap/issues/64#issuecomment-6602451333); [#106](https://github.com/wcpos/roadmap/issues/106) tips and surcharges; [#91](https://github.com/wcpos/roadmap/issues/91) quick discount; [#62](https://github.com/wcpos/roadmap/issues/62) checkout conditions; [#477](https://github.com/wcpos/roadmap/issues/477) tax exempt; [#485](https://github.com/wcpos/roadmap/issues/485); [#120](https://github.com/wcpos/roadmap/issues/120) the map; [#226](https://github.com/wcpos/roadmap/issues/226), [#225](https://github.com/wcpos/roadmap/issues/225), [#452](https://github.com/wcpos/roadmap/issues/452) the releases.
- `docs/specs/2026-10-09-action-event-contract-spec.md` (events, the cash-rounding amendment of 2026-10-12), `docs/specs/2026-10-12-checkout-conditions-spec.md` (§6 reserved transport), `docs/specs/2026-10-08-payment-method-descriptor-spec.md`.
- wcpos/monorepo `main` at `1a9220960`: `packages/order-math/src/settle.ts`, `cart-line.ts`, `internal/lines/pos-data.ts`, `payments/rounding.ts`; `packages/core/src/screens/main/pos/hooks/use-add-fee.ts`, `checkout/cash-rounding-hook.ts`, `checkout/hooks/use-checkout-session.ts`, `cart/buttons/edit-order-meta/tax-exempt-row.ts`, `commands/tax-exempt.ts`, `extensions/actions/`.
- wcpos/woocommerce-pos `origin/main`: `includes/Payments/Contract/Descriptor_Builder.php`, `includes/Services/Settings/Payment_Gateways_Section.php`, `includes/Orders.php`, `includes/Abstracts/Store.php`; wcpos/woocommerce-pos-pro `includes/Abstracts/Store.php` (`META_FIELDS`).
- [wcpos/credit-card-fee](https://github.com/wcpos/credit-card-fee) README.
- Surcharge rules: [NAB on the RBA changes](https://www.nab.com.au/business/payments-and-merchants/merchant-support-centre/rba-surcharging-changes), [CommBank](https://www.commbank.com.au/articles/newsroom/2026/09/cba-card-surcharging.html), [Lightspeed AU](https://www.lightspeedhq.com/au/rba-surcharging/), [Goodwin](https://www.goodwinlaw.com/en/insights/publications/2025/03/insights-finance-ftec-want-to-have-customers-cover-payment), [Verifee](https://verifee.com/resources/credit-card-surcharge-laws-by-state-the-2026-compliance-guide/), [PaymentCloud](https://paymentcloudinc.com/blog/credit-card-surcharge-laws-by-state/); [Square service charges (AU)](https://squareup.com/help/au/en/article/7625).
