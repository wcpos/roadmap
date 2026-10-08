# Payment-method descriptor v1: declared fields, the `gateway` mode and the send-and-leave outcome

Date: 2026-10-08. Lane: `next` (2.0). Owner: Paul. Status: **ruled** on
[wcpos/roadmap#415](https://github.com/wcpos/roadmap/issues/415) (eight resolution rows, R1 to R8,
Paul, 2026-10-08, each taken "as you recommend"), on the findings of
[#416](https://github.com/wcpos/roadmap/issues/416)
(`docs/research/2026-10-08-pos-payment-method-families.md`). Built under the extensibility ruling of
2026-10-08 ([#121 amendment](https://github.com/wcpos/roadmap/issues/121#issuecomment-6064565000),
#120 Notes): extension developers compose **host components**; the app owns the pixels; **declared
UI** is the static case of the sandboxed tier. Glossary: monorepo `CONTEXT.md`, *Language — Payments*
and *Language — Extensibility*. "Tender" is a verb.

This spec is the build contract for handoff steps 2 to 5
(`docs/handoffs/2026-10-08-email-invoice-gateway-declared-ui-handoff.md`). It amends
*Payments Contract v1* (wiki `architecture/client/payments-contract/`) as **contract 1.2**, additive
under descriptor schema 1. The first consumer is the
[email invoice gateway](https://github.com/wcpos/email-invoice-gateway); the second is any plain
`WC_Payment_Gateway` a merchant enables for the POS.

## What it builds on

The 2.0 tender pane, all five slices merged on `next` 2026-09-12 (roadmap#261; spec
`docs/specs/2026-09-11-tender-pane-keypad-spec.md`): one surface, method pills, per-method helpers,
one commit button, the folded unavailable list, the terminal moment, the Paid moment. Free's
descriptor builder and capture-mode registry (`includes/Payments/Contract/`), the v2 payment route
family under the per-order lock, the order-pay passthrough that mints a row when a gateway calls
`payment_complete()` or lands a paid status, and the app's sale-completion owner
(`packages/core/src/screens/main/pos/checkout/sale-completion.ts`).

## The three shapes (from #416)

Every payment method a POS drives is one of three, by when the money is known:

| Shape | Families | Till collects | Verb | Outcome | Contract today |
|---|---|---|---|---|---|
| 1 Record now | cash, card on an external terminal, reference tenders | an amount, maybe a reference | Take | a `captured` row at once | `manual` |
| 2 Wait at the till | readers; QR and wallet rails; in-store BNPL; stored value | nothing, or a code | Send to the reader / customer | a `pending` row that settles within an expiry | `server`, `device`, `stored_value` |
| 3 Send and leave | email invoice, pay-by-link, on-account, BACS as pay-later | a destination or a reference | Send invoice / Put on account | no money now; the order leaves the till; the later payment mints its own row | the Legacy tab only |

v1 covers shapes 1 and 3 (R1). Shape 2's non-reader rails get a reserved artefact field (§7) and
their own ticket when the first PIX or UPI consumer is chosen.

## 1. Descriptor additions (contract 1.2, schema 1)

### 1.1 The `gateway` capture mode (R2)

A sixth mode, named for how the money moves like its siblings: **Free runs the gateway's own
`process_payment()` with the declared values and reads what it did.** Free registers
`Gateway_Handler` in `Capture_Mode_Registry`; `describe()` returns:

- `capture.mode: "gateway"`, `capture.provider: null`, `capture.hardware: null`,
  `capture.webview_available: true` while the gateway still renders `payment_fields()` (so the
  method stays on the Legacy tab, and on older apps that is where it is found).
- `capabilities` (R7): `amount.partial: false` (every `process_payment()` and every pay link acts on
  the order total; #110 D3), `change: false`, `refunds.via` from `supports('refunds')` as the
  webview handler does (`provider`, else `manual`), `refunds.partial` likewise, and the handler's
  `refund()` makes that true: a `recorded` row refunds through the gateway's own `process_refund()`
  when it supports refunds (any truthy answer is a success, as `wc_refund_payment()` reads it; a
  `WP_Error` or a falsy answer is `502 wcpos_provider_error`), else the entry is marked succeeded
  at once as the manual handler does (handed back by hand); a gateway that is no longer installed
  is `404 wcpos_payment_method_not_found`, never a silent success; `provider_ref` is `null`
  because `process_refund()` answers a boolean, not a reference, `tips: none`,
  `offline: none`, `void: false`. These are fixed by the handler: there is no per-capability
  override filter in Free (corrected 2026-10-08 after the first Codex pass found none). A gateway
  that needs different capabilities registers its own handler class under the **scoped key**
  `gateway:<gateway id>` (the registry's existing `<mode>:<provider>` form; the mode filter
  answers `gateway:<gateway id>` and the builder resolves the scoped key before the bare one), so
  one gateway's handler never captures another gateway-mode method and two such extensions coexist
  (review on wcpos/wiki#1201, 2026-10-08). A scoped handler's `describe()` must set
  `capture.provider` to the gateway id: the ledger dispatches later row operations (`refund`,
  `void`, `status`) by the row's snapshotted `provider`, so a handler that leaves it `null` is used
  for the descriptor only and Free's own handler serves the rows; `partial: true` is never valid on this mode because `submit` acts on the
  order total.

A gateway opts in through the existing `wcpos_payment_method_capture_mode` filter, answering
`gateway`, or through a method on `Abstract_POS_Gateway`. `declared` is the glossary word for the UI
tier and never a mode; `webview` keeps meaning the order-pay page only.

Older apps keep the mode (`OpenEnum`), show the method in the folded list with `unsupported_mode`
("Update the app to use Email Invoice") and offer it on the Legacy tab through `webview_available`.

### 1.2 The `fields` block (R3)

A flat list of host components, one level deep, with its own schema number. It lives on the
descriptor beside `capabilities`, is **independent of mode** (any mode may carry it; only `gateway`
reads it in v1; `manual` reading a reference field is a later minor with no schema change), and is
absent, not empty, on a method that declares nothing.

```json
"fields": {
  "schema": 1,
  "verb": { "kind": "send", "label": "Send invoice" },
  "components": [
    { "component": "field", "id": "woocommerce_pos_invoice_email_address", "input": "email",
      "label": "Email address", "required": true, "default": "", "prefill": "order.billing.email" },
    { "component": "checkbox", "id": "woocommerce_pos_save_billing_email",
      "label": "Save email to billing address", "default": false, "prefill": null }
  ]
}
```

| Component | Declares | Value posted |
|---|---|---|
| `field` | `id`, `label`, `input: text \| email \| tel \| number`, `required`, `default`, `prefill` | string |
| `checkbox` | `id`, `label`, `default`, `prefill` | boolean |
| `select` | `id`, `label`, `required`, `default`, `options: [{ value, label }]` | one option's `value` |
| `note` | `text` | nothing |

Rules:

- `id` is the gateway's own `$_POST` key. Free hands the values over unchanged (§2.1).
- `prefill` is a key from a closed list, a named constant in Free and in the app:
  `order.billing.email`, `order.billing.phone`, `customer.email`, `customer.phone`. The app fills
  the component from the source when it is non-empty, else from `default`. An unknown key is
  ignored and `default` is used.
- An unknown `component` name within a known `fields.schema` is **display-only by rule** and is
  skipped and logged on both sides. A new **value-bearing** component is a `fields.schema` bump: an
  app that knows only schema 1 disables the method with `unsupported_fields` (*Update the app to
  use …*) when `fields.schema` is higher, so it never submits without a value the gateway expects
  (review on wcpos/wiki#1201).
- `label`, `text` and option labels are the gateway's own translatable copy, exactly as `title` is.
  Nothing in the block is markup, a class, a style or a render function.
- No grouping, no layout primitives, no conditional visibility (components may not depend on one
  another). The app lays the components out in declaration order as helpers.
- `code` (a scan input) is a **reserved** component name for stored value and BNPL, not built.

### 1.3 The verb (R4)

`fields.verb: { kind, label }`. `kind` is `take` or `send`, a closed list; `label` is the gateway's
copy for the commit button. The app composes `{label} · {amount}` with the usual tail (`· pays it
off`). `kind` tells the app only which moment to expect after the request (Paid for `take`, sent
for `send`); it **does not decide the outcome** (§3). `cancel` and `refund` are the existing routes,
never declared verbs.

## 2. Routes (contract 1.2)

Both routes are siblings of the payment route family, under the per-order lock, with the family's
auth (`publish_shop_orders`) and error style.

### 2.1 Submit (R6)

`POST wcpos/v2/orders/{id}/payment-methods/{method}/submit`
`{ "attempt_id": uuid, "values": { "<id>": value } }`

Free, for a method in `gateway` mode and a POS order (`409 wcpos_invalid_transition` otherwise):
answers a replay first (below), then refuses a **new** attempt on a method that is not
`pos_enabled` (`403 wcpos_payment_method_disabled`; a lost response is replayed even after the
merchant switched the method off), then **validates the values against
the declared schema** (`required`, string or boolean by component, `select` membership) and
answers `wcpos_fields_invalid` keyed per component before the gateway sees anything; then gives the
request a WooCommerce session, customer and cart if it has none (REST requests have none;
`wc_add_notice()` needs the session and WooCommerce's own BACS, cheque and COD call
`WC()->cart->empty_cart()`; all request-scoped, the session never `init()`ed, so no cookie and no
session row); sets
`$_POST[id] = value` for each declared component (checkbox → `'1'` when true, unset when false; a
value for an undeclared id is dropped); sets each string value **slashed** (`wp_slash()`, as WordPress does for every request global, so
a gateway's `wp_unslash()` round-trips); calls the gateway's `validate_fields()`, collects
`wc_get_notices('error')` keyed by the notice's own `id` data else `_form`, and clears them (a
`false` return with no notice is still a refusal, under `_form`);
**assigns the gateway to the order** (`payment_method`, the descriptor's title) as WooCommerce's
own pay form does before `process_payment()`; then calls `process_payment( $order_id )` and reads
the outcome (§3.1). Response:

```json
{ "outcome": "sent" | "recorded", "payment": row | null, "order": summary }
```

`order` is the server's derivation as on every other write. Errors:

| Code | Status | When |
|---|---|---|
| `wcpos_fields_invalid` | 400 | `validate_fields()` added error notices. `data.errors` is `{ "<id>": message }` for notices Free can key to a declared component (by the gateway's own `wc_add_notice` data, else the first required empty field), and `data.errors._form` for the rest. Nothing written. |
| `wcpos_provider_error` | 502 | `process_payment()` returned anything but `result: success`, or threw, with no money observed; or it answered a redirect to another host (§3.1). `data.detail` carries the gateway's notice, the exception's message, or the host. Nothing written: the payment method assigned before the call is put back. |
| `wcpos_order_already_paid` | 409 | The balance is zero. |
| `wcpos_payment_conflict` | 409 | A live leg exists (the method is `partial: false`; the till should not have offered it). |
| `wcpos_capture_mode_unsupported` | 501 | The method is not in `gateway` mode. |

Idempotent on `attempt_id` for the life of the order: a replay of a known attempt returns the
stored answer and never calls the gateway again. A `recorded` attempt is the row itself (the
attempt id **is** the client-minted row id, so the row is `source: app` like every app row and the
ledger's own replay rule applies); a `sent` attempt is remembered in the order's **attempt history**,
`_wcpos_gateway_attempts` (`{ attempt_id: sent | cancelled }`, capped at 50), a meta of its own
that the stamp's clearing never touches: a delayed retry of an earlier send answers `sent` again,
and a retry of a send the till has cancelled answers `409 wcpos_payment_conflict`, so nothing sends
twice for the life of the order.

### 2.2 Cancel (R8)

`POST wcpos/v2/orders/{id}/payment-methods/{method}/cancel` `{ "attempt_id", "reason"? }`

`attempt_id` names the send the till means to undo: `409 wcpos_payment_conflict` when it is not the
stamp's current attempt (a stale cancel after *Send again*, or another till's view), and
`409 wcpos_invalid_transition` when `{method}` is not the stamp's method. Otherwise clears the
awaiting-customer stamp, returns the order to `pos-open` through the existing two-status
flip, adds an order note, and **does not call the gateway** (Woo gateways have no cancel hook; the
pay link stops working on a `pos-open` order as it does today). Stock follows Woo's own status hooks.
`409 wcpos_invalid_transition` when the order holds no stamp or a counting row exists.

## 3. Outcomes and the ledger

### 3.1 The outcome is read from the gateway (R4)

The submit route applies the passthrough's rule without the order-pay page. Free arms the same
window the passthrough uses around `process_payment()` and watches `woocommerce_payment_complete`
and `woocommerce_order_status_changed` for this order only:

- **`recorded`** — `payment_complete()` fired, or the gateway landed a status in
  `wc_get_is_paid_statuses()`: Free mints a `captured` row (`id` = the attempt id, `source: app`,
  `capture_mode: gateway`, `method_id`, `kind` from the descriptor, `amount` = the order total,
  `provider_refs.transaction_id` from the order) through the passthrough's own minting, derives, and
  answers with the row. **Observed money wins:** if the listener saw the order paid and
  `process_payment()` then threw or returned anything but `success`, the row is still minted and the
  answer is `recorded` (logged as a warning); a bad return value never discards money that moved.
  This is what the local custom-gateway template, Account Funds and any gateway that charges
  inside `process_payment()` produce.
- **`sent`** — anything else: `result: success` with the order left where the gateway put it
  (`pending` for the email gateway, `on-hold` for a purchase-order gateway). No row. Free writes the
  stamp (§3.2) and answers with `payment: null`.
- **A redirect elsewhere is refused.** A hosted checkout (PayPal Standard and every off-site
  gateway) answers `result: success` with a `redirect` to the provider's page: neither record-now
  nor send-and-leave, and only a browser can follow it. When no money was observed and the
  redirect's host is neither `home_url()`'s nor `site_url()`'s, Free answers `502 wcpos_provider_error` with `data.detail`
  naming the host, and writes nothing; a redirect on this site (the order-received page, a custom
  thank-you) is what a normal gateway returns and stays as above. (Paul, via roadmap-00,
  2026-10-08.)

A `verb.kind` that disagrees with the outcome is accepted and logged at info; the money is the truth.
`Orders::apply_unpaid_gateway_order_status()` does not run on this route: the gateway's own status
stands.

### 3.2 The awaiting-customer stamp (R5)

One order meta, `_wcpos_awaiting_customer`, written on `sent`:

```json
{ "method_id": "wcpos_email_invoice", "destination": "x@y", "attempt_id": "…", "sent_at_gmt": "…", "cashier_id": 7 }
```

Beside it, the attempt history `_wcpos_gateway_attempts` (`{ attempt_id: sent | cancelled }`)
outlives the stamp (§2.1).

`destination` is the value of the first `field` with `input: email` or `tel`, else `null`. While the
stamp is set and no counting row exists, the ledger projection (ledger §3.3) and the two-status
cancel **leave the order's status alone**: a sent order is `pending` or `on-hold` with no live row
and must never be re-projected to `pos-open`. A stamped order **counts as in progress** for the projection whatever status the gateway left it in
(`on-hold` from a purchase-order gateway included), so the moment money lands the stamp clears and
the order projects to `pos-partial` or completes, instead of staying `on-hold` beside a ledger that
says otherwise. The stamp clears when any counting row lands (the passthrough's row when the
customer pays online, or a till payment when the customer returns), when the order reaches a paid,
`cancelled`, `refunded` or trashed status, or on the cancel route. The receipt, the orders list and
the customer display read it for *Invoice sent to x@y on …*. No new registered order status.

### 3.3 Reports, receipts, display

A `recorded` outcome is an ordinary captured row: reports, the receipt and `payment.state` need
nothing new. A `sent` outcome leaves no row: reports count nothing; the receipt prints the ledger as
it stands and the balance due, with the stamp's line beneath; the display receives no
`payment.state` (none fits) and drops to idle after the sale leaves the till.

## 4. The app

### 4.1 Tender pane

- **Method pill:** a `gateway` method is a pill like any other, in POS-settings order.
- **Helpers:** the `fields` components rendered with host components in declaration order:
  `field` → the app's text input (keyboard type from `input`), `checkbox` → the app's checkbox,
  `select` → the app's select, `note` → one muted line. Prefilled per §1.2. The keypad stays; the
  entry is pre-typed to the balance and read-only for `partial: false`.
- **Commit:** `{verb.label} · {amount}`; disabled with the first empty required component's own
  line (*Enter an email address*) until it is filled; `verb.kind` picks the expected moment.
- **Unavailable list** (R7): `offline` (*needs a connection*), `not_with_split` (a live leg exists;
  the Legacy tab's wording), `unsupported_mode`.
- **Refusal:** `wcpos_fields_invalid` renders each keyed message under its component and `_form`
  messages as one line above the commit button, which stays enabled for a corrected retry;
  `wcpos_provider_error` is the existing refusal toast with the gateway's notice.

### 4.2 Completion outcomes

`sale-completion.ts` gains **`sent`** beside `completed` and `partial`: the sale leaves the till
(`New sale` semantics as for `completed`), the pane shows the **sent moment** instead of the green
Paid moment, no `checkout.completed` audit row is written (a `checkout.sent` row is), the receipt
prints the balance due, the display drops to idle. A `recorded` outcome goes through the manual-leg
predicate with the returned row and summary, exactly as a `manual` record does. The completion
journal treats a `sent` attempt as decided on the response. **The response's `order` summary is the
truth for the moment shown:** a `sent` answer whose summary status is `pos-open` (a replay of an
earlier send after a later one was cancelled at another till) shows no sent moment and writes no
`checkout.sent` row; the pane stays on the order with its balance due (third review of
wcpos/woocommerce-pos#2162).

The sent moment's design is step 4's work under the tender-pane spec and the design rules: same
surface, a neutral (not green) state, headline *Invoice sent*, sub-line *to x@y · 46,00 £ due*,
buttons `Print receipt · New sale`, `New sale`. Tablet and phone screenshots against a new Jump
state of the same name on the mockup.

### 4.3 After `sent` (R8)

The order is found in Orders under its `pending`/`on-hold` status with the stamp's line. Opening it
offers the keypad on the full balance (any counting row clears the stamp), **Send again** (the
submit route with a new `attempt_id` and corrected values; the stamp's current attempt is replaced
and every attempt stays in the history) and **Cancel invoice** (§2.2, naming the current attempt;
the cancelled attempt is remembered so a late retry of it is refused). No new
list, no banner in the cart.

## 5. The gateway author's side

A gateway author declares fields with a filter on the descriptor, `wcpos_payment_method_fields`
(`array|null $fields, WC_Payment_Gateway $gateway`), or by implementing a method on
`Abstract_POS_Gateway`; opts into the mode with `wcpos_payment_method_capture_mode`. Nothing else
changes: `validate_fields()` and `process_payment()` keep reading `$_POST`; `payment_fields()` is
kept so the plugin still works on 1.10 and on the Legacy tab. The email invoice gateway's change is
the two filters above, one release. The docs page for authors (step 5) is written from §1.2, §1.3
and this section.

## 6. Terminals: the native instance of the same contract

The terminal path is not re-decided; it is shown here as the same contract in its native class so
the next reader sees one model, not two.

| Contract | Declared UI (`gateway`) | Native (`server` / `device`) |
|---|---|---|
| What the app renders | the `fields` tree, with host components | the reader line, the terminal moment: host components the driver never touches |
| Typed state in | `fields` + `prefill` sources; the response's `outcome`, row and summary | the descriptor's `hardware`, the ledger row and its `events[]`, the leg phase, the driver's `status$` |
| Verbs out | `submit`, `cancel` | `intent`, `capture`, `status`, `void`, `refund`; driver `collect`, `cancel` |
| Who moves the money | the gateway's own PHP on the server | Pro against the provider (`server`); the SDK on the device (`device`) |
| Availability | `offline`, `not_with_split`, `unsupported_mode` | `no_driver`, `driver_*`, `no_readers`, `reader_in_use`, `offline` |
| Outcome | read from what `process_payment()` did | read from the row the handler or driver returns |

In both classes the extension emits state and answers verbs; the app owns the pixels.

## 7. Reserved, not built

- `artefact` on the `intent` handoff and on the broadcast's `payment.state` payload:
  `{ kind: qr | code | url, data?, image_url?, expires_at }` for the QR, wallet and BNPL rails. Name
  reserved in the contract pages now so the first such extension is a minor, not a major.
- The `code` component (scan affordance) in `fields`.
- `manual` reading a `fields` block (a reference on a cash or card leg, written to `receipt`).
- `awaiting_customer` on the v1 checkout action route stays as it is; superseded by §3.

## 8. Copy and test IDs

New `pos_checkout.*` keys: `send_verb_amount` (`{label} · {amount}`), `enter_field` (`Enter {label}`),
`invoice_sent`, `sent_to_amount_due`, `send_again`, `cancel_invoice`, `invoice_sent_to_on`,
`not_with_split` (exists as `legacy_not_with_split`; reuse). English in `en/core.json` only.

Test IDs: `checkout-field-<id>`, `checkout-field-<id>-error`, `checkout-form-error`,
`checkout-sent`, `checkout-sent-headline`, `checkout-sent-print`, `checkout-sent-new`,
`orders-send-again`, `orders-cancel-invoice`.

## 9. Out of scope

The artefact presentation for shape 2's non-reader rails; stored value (adapter per extension, its
own ticket); BNPL; static QR; partial legs on `gateway` methods; a declared availability-rule
vocabulary; whether the Legacy tab stays once three Woo gateways declare fields (noted on #120).

## 10. Build slices (one PR each; Free, Pro, monorepo on `next`; the gateway on `main`)

1. **Free: descriptor and routes** (roadmap#417). `Gateway_Handler`, the `fields` block in `Descriptor_Builder`
   and the REST schema, the `wcpos_payment_method_fields` filter, the submit and cancel routes with
   the outcome reader and the stamp, the projection's stamp rule, PHPUnit for the descriptor, both
   routes and the projection; the wiki descriptor, routes and ledger pages amended to contract 1.2
   in the same PR, with the reserved `artefact` and `code` names.
2. **The gateway** (roadmap#418). The two filters; `payment_fields()` kept. One release on `main`.
3. **App: declared UI in the tender pane** (roadmap#419). Types (`fields`, `KNOWN_CAPTURE_MODES` + `gateway`),
   `buildTenderTiles` reasons, the helper renderer with host components, prefill, commit label and
   required gating, the submit call and refusal rendering, the `sent` completion outcome and the
   sent moment, Orders' *Send again* and *Cancel invoice*, the method no longer listed on the Legacy
   tab when the app can drive it. Tests at the level of `tender-pane.test.tsx` and
   `use-tender-flow.test.tsx`; tablet and phone screenshots against the mockup's new Jump state.
   UI taste is Claude's, not delegable.
4. **Docs** (roadmap#420). *Declaring fields for the POS tender screen*, one page for gateway authors in
   `wcpos/docs`, draft PR merged with the release that ships slice 3.

Each slice: worktrees only; one wp-env or Jest run at a time with `--maxWorkers=2`; no new env vars
(component set, prefill sources, verbs and reasons are named constants); the 400-line non-test
ceiling; a `next` PR needs an `independent-review` status from a fresh Opus reviewer on its final
head and every bot thread dispositioned.

## 11. Acceptance

Slice 1: `GET wcpos/v2/payment-methods` serves the email gateway with `capture.mode: gateway` and
the two-component `fields` block; submit with an empty email answers `400 wcpos_fields_invalid`
keyed to the field; submit with an email answers `outcome: sent`, the order is `pending`, the
invoice email was triggered, the stamp is set, and a replayed `attempt_id` sends nothing; submit
against the custom-gateway template answers `outcome: recorded` with a captured row; cancel returns
the order to `pos-open` and clears the stamp; a ledger write on a stamped order leaves `pending`
alone. Slice 3: the mockup's Jump states *Email invoice* and *Invoice sent*, tablet and phone, in the
PR body; the Legacy tab no longer lists the method; the web E2E walk gains sent, send again and
cancel.
