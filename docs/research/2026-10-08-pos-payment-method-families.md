# POS payment-method families: what each needs from the tender pane, 2026-10-08

Asked by Paul, 2026-10-08, quoted on [roadmap#416](https://github.com/wcpos/roadmap/issues/416): *"we are going to have to build a flexible system that can handle email invoice gateways, terminal gateways, all sorts of gateways. Perhaps we should do research on some of the sorts of gateways we are going to need to support, then we can see what hooks and APIs will be needed."* Feeds the payment-method descriptor ruling on [#415](https://github.com/wcpos/roadmap/issues/415), whose proposal was written on one gateway (the email invoice gateway). Desk research only: gateway source code, provider API references and POS vendor docs, plus the Free plugin, the app and the contract pages on `next`. Vocabulary is the monorepo glossary's (payment method, gateway, provider, capture mode, driver, payment, ledger, host component, declared UI; "tender" is a verb) [15].

Labels: **S** Sourced (primary page, repo or code, linked in Sources). **S†** Sourced from the vendor's own page, but it is a JavaScript app that would not render here, so the text was read from a search engine's or a mirror's copy. **I** Inferred. **U** Unverified. **NE** Not evaluated.

## The short answer

Every payment method a WooCommerce POS has to drive collapses into **three shapes**, distinguished by *when the money is known*, not by provider:

1. **Record now — the cashier's word is final.** Cash, card on an external terminal, cheque in hand, "other" tenders with a reference, store credit the merchant vouches for. Inputs: an amount, optionally a reference or note. Verb: *Take*. Outcome: immediate; a `captured` row. Every POS surveyed models its merchant-defined tenders this way: a name plus a few flags, a note or reference at the till, recorded as "other", refundable only against the same tender, works offline (Shopify [95][96][97][98], Square [103][104], Lightspeed [108][111][112], Odoo [113]). WooCommerce's own BACS, cheque and COD are *not* this shape in Woo — their `process_payment()` lands `on-hold`/`processing` with no payment and `payment_complete()` never runs [20][21][22] — but the POS already treats them as shape 1 through `capture.mode: manual` [2][4].
2. **Wait at the till — bounded, the customer or provider answers in minutes.** Card readers (the native control case), every QR and wallet rail (PIX, PromptPay, UPI, WeChat Pay), in-store BNPL where the customer confirms on their phone (Klarna in-store, Zip), stored value with a hold. Inputs: nothing, or a code the customer presents. Verb: *Send* (to the reader / the customer). Outcome: polled or pushed, within an expiry the till should set itself (15 min to 24 h defaults across providers [42][43][48][52][55]); cancellable at most providers, not all [50][53]. A `pending` row that becomes `captured`, `failed` or `voided`. This is exactly the `server`/`device`/`stored_value` contract the app already runs for readers [12][13]; what the non-reader members add is a **customer-facing artefact** (a QR string or image, a short code, "confirm on your phone") in place of a reader screen.
3. **Send and leave — unbounded, the customer pays later off the till.** The email invoice gateway, every "pay later / pay by link" product (Woo's own order-pay URL [23][28], Stripe Checkout Session or Payment Link [80][81], Square Invoice or Payment Link [86][89], PayPal Invoice or Order link [91][93], Klarna HPP by email [71][72]), on-account and purchase-order gateways [29][30][31], BACS as "transfer later". Inputs: a destination (email, phone) or a reference. Verb: *Send invoice* / *Put on account*. Outcome: **no money now**; the order leaves the till `pending` or `on-hold`; money arrives days later and mints its own row (the order-pay passthrough does this today for any gateway that calls `payment_complete()` [6]).

The smallest set of app-side shapes that covers all three is therefore **two additions to what exists**: (a) a **declared-fields block** any method may carry (shape 1 needs a reference, shape 3 needs a destination, shape 2 sometimes needs a code), and (b) a **no-money outcome** for shape 3. Shape 2's non-reader members need no new *flow*, only a new *presentation* of the existing wait state (an artefact on the till and the customer display) — real work, but on the terminal-moment surface and the broadcast, not on the descriptor's money model.

## The families, one row each

Inputs = what the till collects before the verb. Timing = how the outcome arrives. Ledger = the row the outcome should leave. Partial = may a leg be less than the balance. Host needs = what the gateway's PHP needs from Free.

| Family | Inputs at the till | Verb | Outcome timing | Ledger after | Partial legs | Refunds | Offline | Host needs |
|---|---|---|---|---|---|---|---|---|
| **1a Email invoice** (wcpos_email_invoice) [1] | email (prefilled from billing), save-to-billing checkbox | Send invoice | Later, by the customer (days); the later payment is any order-pay gateway | **None now.** Order `pending`, stock reduced, invoice email sent. Later: a `source: webview` captured row minted by the passthrough [6] | No — the pay link charges the order total (#110 D3) [10] | None at the till; the paying gateway's own later | None (sends email) | `$_POST` values → `validate_fields()` / `process_payment()`; nothing else [1][24] |
| **1b Pay-by-link, provider-hosted** (Stripe Checkout Session / Payment Link, Square Payment Link or Invoice, PayPal Order link or Invoice, Klarna HPP) | email or phone; nothing if shown on the display | Send link / Send invoice | Later; webhook to the gateway (`checkout.session.completed` [84], `payment.updated` [86], `INVOICING.INVOICE.PAID` [63], `COMPLETED` HPP callback [73]) | None now; the gateway's webhook calls `payment_complete()` → passthrough row [6]. Expiry: Stripe session 30 min–24 h [81], Square link never [87], PayPal order 3–6 h [91][92], Klarna HPP 1 h before the KP session [71] | No (link = order total) | Provider, via the gateway's `process_refund()` [80][86][91] | None | Same as 1a, plus the gateway's own webhook endpoint (already its own) |
| **1c On account / purchase order / invoice gateways** (gazchaps PO, IGFW, wc-invoice-gateway) [29][30][31] | 1–8 text fields (PO number, contact, address) or none | Put on account | Immediate; no money | None. Order `on-hold` (configurable), `wc_reduce_stock_levels()`, fields in order meta [29][30][31] | No | None (`supports = products`) [27] | None | `$_POST` → `validate_fields()` / `process_payment()` |
| **2a Core offline trio** BACS, cheque, COD [20][21][22] | none (`has_fields = false`, reads no `$_POST`) | Take (as POS `manual` today) | Immediate | In Woo: `update_status(on-hold)` / `processing` (COD), `payment_complete()` only for a zero total; `wc_get_is_paid_statuses()` = processing, completed [25]. In the POS: a `captured` manual row [2][4] | Yes (manual) | None in Woo; `via: manual` in the POS [4] | `record` | Nothing — the Free `manual` handler never calls the gateway [4]. BACS "pay by transfer later" is shape 3 (see §Recommendation) |
| **2b Reference variants** (bank transfer + reference, Square note, Lightspeed `remoteReference`, Odoo `transaction_id`) | one reference / note field | Take | Immediate | `captured` row with the reference in `receipt` or `provider_refs` (I) | Yes | Manual | `record` | A fields block on a `manual` method; nothing server-side beyond storing it |
| **3 Terminals** (`server`, `device`) — control case, from the contract only [12][13][17] | nothing; reader choice | Send X to reader | Polled (`status`) or driver callback; pushed by webhook for offline device rows | `pending → authorized → captured`; `failed`/`voided`; `expires_at` swept at 10 min [11][12] | Yes | Provider or device | `queue` (device BT) / `none` | `bootstrap`, `intent`, `capture`, `status`, `void`, `refund` handler; webhook via `wcpos_settle_payment()` [12][18] |
| **4 Stored value** (Woo Gift Cards, PW Gift Cards, Account Funds) [32][33][36][38] | code entry or scan; or "use balance" for a logged-in customer | Redeem | Immediate (balance known server-side) | Contract: `stored_value` row via `intent` (validate + hold) → `capture` (redeem) → `void` (release) [12]. **But** every Woo extension except Account Funds' full-payment gateway is a *cart-level total reduction*, not a gateway: an order item (`gift_card` / `pw_gift_card`) and `order total = total − card` [35][36]; debit at order placement [33][35], re-credit on cancelled/failed/refunded [35][36] | Yes (a card covers part) | Re-credit — Woo GC has its own "Refund to gift cards" flow, separate from gateway refunds [33]; PW re-credits only on the `refunded` status (I) [36]; Account Funds partial credit "stays spent" after a refund [39] | `none` (balance cannot be trusted offline) [10] | A per-extension adapter: Woo GC REST `orders.gift_cards` write (applies and debits at once) [32]; PW Store API `pw-gift-cards` [36]; Account Funds gateway `process_payment()` for full payment only [41] |
| **5a QR / wallet, dynamic** — PIX (Mercado Pago [42][43], PagBank [48]), PromptPay (Opn [52]), UPI (Razorpay [55]), WeChat Pay (Stripe [58]) | nothing | Show code | Pushed by webhook (every provider) **and** polled — the official Woo plugins for MP and Opn poll from the browser too (5 s × 60; 10 s × 10 min) [46][47][54] | `pending` row with an artefact in `handoff` (EMV string: MP, PagBank, Stripe; image URL only: Opn, Razorpay) → `captured` / `failed` / `voided(expired)`. Expiry: MP Orders 15 min default [43], MP Payments 24 h [42], PagBank next-day 23:59 [48], Opn 24 h [52], Razorpay 2 h cap [55], Stripe WeChat undocumented (U). Cancel-unpaid: MP, Razorpay, Stripe yes [45][56][60]; PagBank, Opn **no** [50][53] | Yes (any amount) | Provider, partial (MP, PagBank, Razorpay, Stripe); **none** for PromptPay [52] | `none` | A `server` handler: `intent` (create + return the artefact), `status` (poll), `void` (cancel or let expire), `refund`; the Pro webhook route + a provider adapter's `verify_webhook()` [12][18] |
| **5b QR, static merchant code** (PIX static, Razorpay `multiple_use`, PayPal seller QR [55][65]) | nothing | — | Pushed by webhook (Razorpay), or not at all (PayPal static) [63][65] | A row minted from the webhook matched by amount (U — no order reference on the rail) | — | — | — | Not a tender-pane family: no per-order artefact and no callback for PayPal; two lines, resembles 5a without the handoff |
| **5c Alipay (Stripe)** | nothing | — | Redirect-based in the web client, no QR payload [59]; Terminal smart readers draw WeChat/PayNow but not Alipay [61] | as 5a where a reader is present | — | — | — | Resembles 5a on a reader; otherwise shape 1b |
| **6a BNPL, customer code** — Klarna in-store (QR or 2–20-digit short code) [68][69], Zip AU/NZ (customer code or POS QR) [77][78][79] | nothing (dynamic QR) or the code the customer reads out | Show code / Enter code | Klarna: `status_update` webhook (polling rate-limited) [69]; Zip: polling only [79] | `pending` → `captured` (Klarna `COMPLETED` is auto-captured [69]) / `failed` / `voided`. Klarna unscanned session auto-cancels at 3 h [69]; `DELETE` cancels [70]; Zip `cancel` [78] | Yes | Provider (Klarna OM refunds, partial [75]); Zip U | `none` | A `server` handler as 5a plus a **code field** before `intent`. Partner-gated APIs (Klarna acquirer section, Zip sandbox by request) [68][77] |
| **6b BNPL, card-present** — Afterpay/Clearpay Card [66][67] | nothing | — | Synchronous card tap on the ordinary terminal; the in-store barcode API was retired 2021 [66] | A normal reader row | — | Reader | — | Nothing: resembles family 3; no API exists for a third-party POS |
| **7 Merchant-defined "custom tender"** (prior art: Shopify custom payment type, Square custom payment method, Lightspeed user-defined, Odoo bank/pay_later) [95][103][108][113] | optional note / tip (Square), card-type sub-choice (Shopify external terminal), customer (Odoo `split_transactions`, Lightspeed `requireCustomer`) | Mark as paid | Immediate | A row of `kind: other`, grouped as "Other" in reports [103]; Odoo `pay_later` books a receivable at session close instead [118] | Yes | Same tender only, up to the amount paid [97] | Works (cash and custom types need no setup) [98] | Nothing — in Woo this is any `WC_Payment_Gateway` the merchant enables for POS: the `manual` handler already does it [2] |

Two facts that cut across the table:

- **No vendor lets a third party add a tender's UI.** Shopify POS UI Extensions have no payment or tender target (23 targets, cart and post-purchase only) and Payments Apps are online-checkout only [99][100]; Square has no in-app extension surface; Lightspeed X-Series' gateway payment types open a developer-rendered **iFrame** [110] — the anti-pattern the #121 ruling names; Odoo's `PaymentInterface` is code (`send_payment_request` / `send_payment_cancel` / `send_payment_reversal`) while the host renders every status line from `payment_status` ∈ `pending | waiting | waitingCard | waitingCancel | retry | force_done | reversing | reversed | done` [115][116][117]. Odoo is the closest prior art to our handler contract; declared UI is a step none of them has taken.
- **Every POS's merchant-defined tender collects at most a note or reference and a tip.** Nobody collects an email or an address at the till except through a gateway that does its own work (Square Invoice, PayPal Invoice). The email gateway's two fields are already the richest "custom tender" form in the survey.

## What already exists

| Surface | Covers | Where |
|---|---|---|
| `manual` handler: describe → partial, change for cash, `refunds.via: manual`, `offline: record`, void; `refund()` succeeds at once | Families 2a, 2b (minus the field), 7 | Free `Manual_Handler` [4]; the app mints the row locally and records (`POST orders/{id}/payments`) [12] |
| `webview` handler + the order-pay passthrough: `capture.webview_available`, `partial: false`, refunds by `supports('refunds')`; a `captured` row minted on `payment_complete()` **or** when the paying gateway lands a status in `wc_get_is_paid_statuses()`, only for the order the pay form is paying now | Family 1 today (the Legacy tab), and the *later payment* of every shape-3 family regardless of how the link was sent | Free `Webview_Handler`, `Webview_Passthrough` [5][6]; app `legacy-tab.tsx`, greyed once a live leg exists [16] |
| `Orders::apply_unpaid_gateway_order_status()`: on `woocommerce_payment_successful_result`, a POS order still `pos-open` with no `date_paid` takes the merchant's configured status with `date_paid` suppressed ("no payment was taken at the till") | The no-money outcome, for the Legacy tab only, and only when the gateway left the order `pos-open` — the email gateway moves it to `pending` first, so this never fires for it (I from [7][1]) | Free `Orders.php` [7] |
| v2 route family keyed on the row UUID: `bootstrap`, record, `intent`, `capture`, `status`, `void`, `refund`; per-order lock; `expires_at` + the 10-minute sweep; `wcpos_settle_payment()` and Pro's `POST wcpos/v2/payments/webhook?provider=` with `verify_webhook()` and parked patches | Families 3, 4 (routes defined, no handler shipped), 5a, 6a — the wait shape end to end | wiki routes [12], ledger [11]; Pro `Payments_Webhook_Controller` [18] |
| `stored_value` mode: `intent` validates and holds, `capture` redeems, `void` releases; never offline | Family 4's *contract*; no Free or Pro handler and no app driver — every `stored_value` tile is `no_driver` today | wiki routes [12]; app `tiles.ts` [16] |
| v1 `POST wcpos/v1/orders/{id}/checkout` (`action`, `payment_data`, idempotency header) → `wcpos_process_checkout_action_{id}` filter; terminal statuses `completed | failed | cancelled | awaiting_customer` | A gateway-driven async checkout, the pre-contract shape; `awaiting_customer` is rendered as an error by the app today (#415 facts) | Free `Checkout_Controller`, `Filter_Gateway_Adapter`, `Gateway_Contract` [8][9] |
| Customer-display broadcast `payment.state ∈ started | approved | declined | complete` with `leg` = the row and an optional customer-safe `message`; `input.*` reserved display → POS | Showing that a wait is in progress; **not** carrying a QR or code | wiki broadcast [14] |
| Tender pane: method pills, per-method helpers, one commit button `Take X in Cash` / `Send X to SumUp`, folded unavailable list with `disabledReasonKey`, the terminal moment (Sent → On terminal → Approved → Captured, Cancel on terminal) | The verb and the wait presentation for readers | spec [17]; app `tender-pane.tsx`, `tiles.ts` [16] |
| Descriptor `capabilities` (`amount.partial`, `change`, `refunds.via`, `tips`, `offline`, `void`), `defaults.order_status`, `provider_data`; open `capture.mode` degrading to disabled-with-reason | Every family's static declaration except fields and the no-money outcome | wiki descriptor [10]; app `types.ts` [16] |

## What does not exist yet

Grouped by how many families need each, most first.

1. **A declared-fields block on the descriptor** — needed by 1a, 1b, 1c (destination or reference before *Send*), 2b (a reference before *Take*), 6a and 4 (a code before `intent`). Lands on the **descriptor** (the `fields` block of #415 §1) and the **tender pane's helper area**. Three input kinds cover the survey: text-like (`text | email | tel | number`), `checkbox`, `select`; a `code` input with a scan affordance is the one addition families 4 and 6a will ask for (Shopify's and Odoo's camera/scanner APIs exist for this [100]) — reserve the name, do not build it in v1 (I).
2. **A no-money outcome** — needed by 1a, 1b, 1c and by BACS/cheque used as "pay later". Lands on the **route** (the response carries `outcome`), the **ledger's status projection** (an order can be `pending`/`on-hold` with no live row and must not be re-projected to `pos-open` — today's table maps "no live rows, no leg in flight" to `pos-open` [11]), the **app's completion predicate** (`sent` beside `completed` and `partial` [13]) and the **broadcast** (no `payment.state` fits; idle is right).
3. **A route that runs the gateway's own `process_payment()` with declared values** — needed by 1a, 1b, 1c and by any plain `WC_Payment_Gateway` (the local custom-gateway template [19], Account Funds [41]). The passthrough already knows how to read what a gateway did (`payment_complete()` → row; a paid status → row; anything else → no row) [6]; the route is that logic without the order-pay page. Lands on the **route family** as a sibling (#415 §4b) and on the Free **handler registry** as a new mode.
4. **A customer-facing artefact in the wait state** — needed by 5a, 6a and 1b-on-the-display. Lands on the **`intent` handoff** (an artefact object: `{ kind: qr | code | url, data?, image_url?, expires_at }`, I), the **terminal moment** (a second presentation of the same timeline with the artefact where the reader card is), and the **broadcast** (`payment.state: started` needs an artefact field; `input.*` stays reserved) [14][17]. The existing `expires_at`, sweep, `void` and `status` routes already carry the lifecycle [12].
5. **A webhook-to-row writer for non-terminal providers** — needed by 5a and 6a. **Largely exists**: `wcpos_settle_payment()` plus Pro's provider-keyed webhook route and `verify_webhook()` [12][18]. What is missing is a provider adapter per rail, which is extension work, not contract work. For shape 3 the passthrough on `payment_complete()` is the writer, and it already runs for any gateway [6].
6. **Stored-value adapters** — family 4 only. The contract's row model and the Woo extensions' total-reduction model collide with ledger invariant 1 ("the order total is never mutated by a payment") [11][35][36]: a `stored_value` handler must either write the extension's order item and suppress its total rewrite, or let the extension reduce the total and mint no row. Decide per extension; Account Funds' full-payment gateway is the only one that behaves like a gateway [41]. Not a descriptor question.
7. **`awaiting_customer` as a first-class till state on the v1 checkout route** — nobody new; superseded by items 2 and 4 on the v2 family. Leave it.

## Recommendation for the v1 descriptor

**v1 must cover** shapes 1 and 3: `manual` (exists), terminals (exist), and the new **gateway-processed** mode for the email gateway, the invoice/PO gateways, BACS-as-pay-later and any plain Woo gateway. **Deferred**: the artefact presentation for 5a/6a (a terminal-moment slice plus a broadcast minor, after a first consumer exists — a PIX or UPI extension), stored value (adapter design per extension, roadmap ticket of its own), BNPL (6b needs nothing; 6a is 5a plus a code field and partner-gated APIs), static QR (not a till family).

Against #415's proposal, read on the full set:

- **`declared` as a capture mode with a flat fields block — survives, with one change of meaning.** The research separates two axes the proposal fuses: *what the till collects* (fields) and *how the money moves* (mode). Fields are wanted by shape 1 (`manual` + a reference), shape 2 (`server` + a code) and shape 3. The block should therefore be **mode-independent in schema** — the proposal's own `fields.schema: 1` already allows this — and only the new mode need *read* it in v1; `manual` reading a reference field is a later minor with no schema change. Name the mode for the money, not the UI: it is "Free runs the gateway's `process_payment()` with declared values and reads the outcome the way the passthrough does" (#415 Q3's `gateway` alternative, or similar). A UI-named mode would make "a `manual` method with a field" sound like a second mechanism when it is the same block.
- **The `send` verb with a no-row outcome — survives, but the outcome should be read from the gateway, not declared.** The email gateway lands `pending` and no row is right [1]. The local custom-gateway template calls `payment_complete()` [19], Account Funds' gateway does too [41], and a reference gateway may land `processing` [29] — on the same route these must mint a `captured` row exactly as the passthrough mints one on the Legacy tab [6]. So the route answers `outcome: sent | recorded` from what `process_payment()` did (`payment_complete()` fired or a paid status landed → `recorded` with the row; otherwise `sent`), and `fields.verb.kind` is only the app's pre-answer affordance (button copy and whether the Paid moment or the sent moment is expected). Declaring the outcome, as the proposal does, would paint out every gateway that takes money inside `process_payment()`. Keep `cancel` and `refund` as routes, as proposed.
- **The projection has no row for "sent".** `pending` means "a leg in flight" in the two-status protocol [11]; a sent order is `pending` or `on-hold` with no live row, and a later ledger write would re-project it to `pos-open`. #415 should add a projected state (or a stamp the projection respects) for *awaiting the customer off-till*; the passthrough's later `captured` row then moves it forward as today. This is the one contract-page change the full set forces that the single-gateway proposal missed.
- **The v2 submit route — survives.** Sibling of the family, under the per-order lock, carrying the order summary, with the per-field error shape; it must run the passthrough's minting logic itself (the passthrough's hooks fire on the order-pay form only [6]). `partial: false` and the greyed-with-a-live-leg rule are right for every gateway-processed method (it charges or promises the whole order, #110 D3). `refunds.via` should follow `supports('refunds')` as the webview handler does [5], not be hardwired to `none`: a `recorded` outcome from a refund-capable gateway is refundable.
- **Where the email-only proposal paints the others out:** (i) the declared outcome (above); (ii) fields only inside one mode, which blocks a reference on a cash or card leg — the one thing every POS surveyed collects [103][109][114]; (iii) `refunds.via: none` fixed per mode; (iv) no reserved artefact on the handoff or the broadcast, so the first QR extension would need a broadcast major instead of a minor [14]. Reserve the artefact field name now; build nothing behind it.
- **What the proposal gets right that the full set confirms:** host components only, a closed component set, `prefill` from a closed list, server-side `validate_fields()` as truth with the app's `required` as the first line, no field dependencies in v1, the folded unavailable list with `offline` / `not_with_split` / `unsupported_mode`, and no new tiles or sheets. Nothing in the survey wants more UI than that; Shopify's and Square's merchant-defined tenders collect less.

## Sources

Local repositories were read on `origin/next` (Free, Pro, monorepo) and `main` (gateway, roadmap, wiki) on 2026-10-08.

1. https://github.com/wcpos/email-invoice-gateway/blob/main/wcpos-email-invoice.php
2. wcpos/woocommerce-pos `next`: `includes/Payments/Contract/Descriptor_Builder.php`
3. wcpos/woocommerce-pos `next`: `includes/Payments/Contract/Capture_Mode_Registry.php`
4. wcpos/woocommerce-pos `next`: `includes/Payments/Contract/Manual_Handler.php`
5. wcpos/woocommerce-pos `next`: `includes/Payments/Contract/Webview_Handler.php`
6. wcpos/woocommerce-pos `next`: `includes/Payments/Contract/Webview_Passthrough.php`
7. wcpos/woocommerce-pos `next`: `includes/Orders.php` (`apply_unpaid_gateway_order_status`)
8. wcpos/woocommerce-pos `next`: `includes/API/V1/Checkout_Controller.php`
9. wcpos/woocommerce-pos `next`: `includes/Payments/Filter_Gateway_Adapter.php`, `includes/Payments/Gateway_Contract.php`
10. wiki `architecture/client/payments-contract/descriptor.md`
11. wiki `architecture/client/payments-contract/ledger.md`
12. wiki `architecture/client/payments-contract/routes.md`
13. wiki `architecture/client/payments-contract/tender-flows.md`
14. wiki `architecture/client/customer-display-broadcast.md`
15. wcpos/monorepo `next`: `CONTEXT.md` ("Language — Payments", "Language — Extensibility")
16. wcpos/monorepo `next`: `packages/order-math/src/payments/types.ts`, `packages/core/src/screens/main/pos/checkout/tender/{tiles.ts,tender-pane.tsx,LEDGER.md}`
17. roadmap `docs/specs/2026-09-11-tender-pane-keypad-spec.md`
18. wcpos/woocommerce-pos-pro `next`: `includes/API/V2/Payments_Webhook_Controller.php`
19. Local template `~/Projects/custom-gateway/wcpos-custom.php` (`process_payment()` calls `payment_complete()`); not a public repo (U for a public URL)
20. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/gateways/bacs/class-wc-gateway-bacs.php
21. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/gateways/cheque/class-wc-gateway-cheque.php
22. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/gateways/cod/class-wc-gateway-cod.php
23. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/class-wc-order.php (`payment_complete()`, `get_checkout_payment_url()`, `needs_payment()`)
24. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/class-wc-form-handler.php (`pay_action()`)
25. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/wc-order-functions.php (`wc_get_is_paid_statuses()`, `wc_refund_payment()`)
26. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/wc-stock-functions.php
27. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/includes/abstracts/abstract-wc-payment-gateway.php
28. https://raw.githubusercontent.com/woocommerce/woocommerce/trunk/plugins/woocommerce/templates/emails/customer-invoice.php
29. https://plugins.svn.wordpress.org/gazchaps-woocommerce-purchase-order-payment-gateway/trunk/class.gateway.php
30. https://plugins.svn.wordpress.org/invoice-gateway-for-woocommerce/trunk/Models/Gateways/IGFW_Invoice_Gateway.php
31. https://plugins.svn.wordpress.org/wc-invoice-gateway/trunk/includes/class-wc-invoice-gateway.php
32. https://woocommerce.com/document/gift-cards/rest-api-reference/
33. https://woocommerce.com/document/gift-cards/store-owners-guide/ and https://woocommerce.com/document/gift-cards/faq/
34. https://woocommerce.com/document/gift-cards/snippets/
35. WooCommerce Gift Cards v2.7.4 source, read from a third-party mirror (closed-source extension): a public copy of the extension's source, not linked here because the extension is sold under licence (`includes/class-wc-gc-order.php`, `class-wc-gc-cart.php`, `class-wc-gc-refunds.php`, `rest-api/class-wc-gc-rest-api-order-controller.php`)
36. https://plugins.svn.wordpress.org/pw-woocommerce-gift-cards/trunk/includes/pw-gift-cards-redeeming.php and `includes/blocks/class-pw-gift-cards-blocks-endpoint.php`
37. https://plugins.svn.wordpress.org/pw-woocommerce-gift-cards/trunk/includes/class-pw-gift-card.php
38. https://kestrelwp.com/docs/account-funds-partial-payments/
39. https://kestrelwp.com/docs/account-funds-refunds/
40. https://kestrelwp.com/docs/account-funds-developer-reference/
41. WooCommerce Account Funds v2.9.1 source, read from a third-party mirror: a public copy of the extension's source, not linked here because the extension is sold under licence (`includes/class-wc-gateway-account-funds.php`, `class-wc-account-funds-cart-manager.php`)
42. https://www.mercadopago.com.br/developers/en/docs/checkout-api-v2/payment-integration/pix
43. https://www.mercadopago.com.br/developers/en/docs/qr-code/payment-processing.md
44. https://www.mercadopago.com.br/developers/en/docs/qr-code/notifications.md
45. https://www.mercadopago.com.br/developers/en/docs/checkout-api-payments/payment-management/cancellations-and-refunds.md
46. https://github.com/mercadopago/cart-woocommerce/blob/master/src/Gateways/PixGateway.php
47. https://github.com/mercadopago/cart-woocommerce/blob/master/assets/js/checkouts/pix/mp-pix-pooling.js
48. https://dev.pagbank.uol.com.br/reference/criar-pedido-com-qr-code-pix-v2 (JS app; read from the embedded page body)
49. https://dev.pagbank.uol.com.br/reference/webhooks
50. https://dev.pagbank.uol.com.br/reference/cancelar-pagamento (refund of a paid charge; no cancel-unpaid endpoint documented)
51. https://github.com/pagseguro/pagbank-for-woocommerce/blob/HEAD/src/core/Gateways/PixPaymentGateway.php
52. https://docs.omise.co/promptpay (Opn's own legacy domain; docs.opn.ooo refused the fetch)
53. https://docs.omise.co/charges-api (`/expire` is not supported for PromptPay)
54. https://github.com/omise/omise-woocommerce/blob/master/includes/gateway/class-omise-payment-promptpay.php
55. https://razorpay.com/docs/api/qr-codes/create/
56. https://razorpay.com/docs/api/qr-codes/close/
57. https://razorpay.com/docs/webhooks/payloads/qr-codes/
58. https://docs.stripe.com/payments/wechat-pay/accept-a-payment?payment-ui=direct-api
59. https://docs.stripe.com/api/payment_intents/object and https://docs.stripe.com/payments/alipay/accept-a-payment?payment-ui=direct-api
60. https://docs.stripe.com/api/payment_intents/cancel
61. https://docs.stripe.com/terminal/payments/additional-payment-methods?terminal-sdk-platform=server-driven
62. https://developer.paypal.com/api/invoicing/v2/invoices-generate-qr-code
63. https://developer.paypal.com/api/rest/webhooks/event-names/
64. https://developer.paypal.com/braintree/in-person/legacy/guides/paypal-and-venmo-qrc/
65. https://www.paypal.com/au/cshelp/article/what-are-paypal-qr-code-payments-help373
66. https://developers.afterpay.com/docs/api/in-store/startup (the old `instore-api-v1` URL redirects here)
67. https://www.afterpay.com/en-AU/business/afterpay-card-merchant
68. https://docs.klarna.com/acquirer/klarna/in-store-payments/integrate-klarna-in-store/api-integration/initiate-an-in-store-payment/
69. https://docs.klarna.com/acquirer/klarna/in-store-payments/integrate-klarna-in-store/api-integration/monitor-the-status/
70. https://docs.klarna.com/acquirer/klarna/in-store-payments/integrate-klarna-in-store/api-integration/cancel-a-payment/
71. https://docs.klarna.com/hosted-payment-page/api-documentation/create-session/
72. https://docs.klarna.com/hosted-payment-page/api-documentation/distribute-session
73. https://docs.klarna.com/payments/other-products/hosted-payment-page/api-documentation/status-callbacks/
74. https://docs.klarna.com/payments/other-products/hosted-payment-page/api-documentation/disable-session/
75. https://docs.klarna.com/payments/after-payments/order-management/manage-orders-with-the-api/refund-orders-and-manage-authorizations/
76. https://github.com/krokedil/klarna-payments-for-woocommerce/blob/master/classes/requests/post/class-kp-create-hpp.php
77. https://developers.zip.co/v4/reference/purchase-requests
78. https://developers.zip.co/v4/docs/post-checkouts and https://developers.zip.co/v4/docs/void-checkouts
79. https://developers.zip.co/v4/docs/instore-api-specification
80. https://docs.stripe.com/api/payment-link/create and https://docs.stripe.com/api/payment-link/update
81. https://docs.stripe.com/api/checkout/sessions/create
82. https://docs.stripe.com/api/checkout/sessions/object
83. https://docs.stripe.com/api/checkout/sessions/expire
84. https://docs.stripe.com/checkout/fulfillment.md?payment-ui=stripe-hosted
85. https://docs.stripe.com/terminal/features/display.md?terminal-sdk-platform=server-driven
86. https://developer.squareup.com/reference/square/checkout-api/create-payment-link and https://developer.squareup.com/docs/checkout-api-overview
87. https://developer.squareup.com/docs/checkout-api/guidelines-and-limitations
88. https://developer.squareup.com/reference/square/checkout-api/delete-payment-link
89. https://developer.squareup.com/docs/invoices-api/overview
90. https://developer.squareup.com/docs/invoices-api/create-publish-invoices
91. https://developer.paypal.com/api/orders/v2/schema.json
92. https://developer.paypal.com/api/rest/integration/orders-api/api-use-cases/standard
93. https://developer.paypal.com/api/invoicing/v2/schema.json
94. https://woocommerce.com/document/woopayments/in-person-payments/
95. https://help.shopify.com/en/manual/sell-in-person/getting-started/setup-payment-method/enable-payments
96. https://help.shopify.com/en/manual/sell-in-person/shopify-pos/payment-management/card-payments
97. https://help.shopify.com/en/manual/sell-in-person/shopify-pos/order-management/complete-refund-orders
98. https://help.shopify.com/en/manual/sell-in-person/shopify-pos/selling-offline/offline-checkout
99. https://shopify.dev/docs/api/pos-ui-extensions/latest/targets
100. https://shopify.dev/docs/api/pos-ui-extensions/2026-07/target-apis and https://shopify.dev/docs/apps/build/payments
101. https://shopify.dev/docs/api/admin-graphql/latest/objects/OrderTransaction
102. https://help.shopify.com/en/manual/payments/manual-payments
103. https://squareup.com/help/us/en/article/8611-capture-external-transactions-using-custom-payment-methods
104. https://squareup.com/help/us/en/article/6389-manage-payment-types-with-the-square-app
105. https://developer.squareup.com/reference/square/objects/ExternalPaymentDetails and https://developer.squareup.com/docs/payments-api/take-payments/external-payments
106. https://developer.squareup.com/reference/square/objects/TerminalCheckout and https://developer.squareup.com/docs/terminal-api/overview
107. https://developer.squareup.com/reference/square/objects/Tender
108. https://developers.lightspeedhq.com/retail/endpoints/PaymentType/
109. https://developers.lightspeedhq.com/retail/endpoints/SalePayment/
110. https://x-series-api.lightspeedhq.com/docs/payments_api_reference.md and https://x-series-api.lightspeedhq.com/docs/payments_api_getting_started.md
111. https://x-series-api.lightspeedhq.com/reference/listpaymenttypes
112. https://k-series-support.lightspeedhq.com/hc/articles/1260804605710
113. https://raw.githubusercontent.com/odoo/odoo/18.0/addons/point_of_sale/models/pos_payment_method.py
114. https://raw.githubusercontent.com/odoo/odoo/18.0/addons/point_of_sale/models/pos_payment.py
115. https://raw.githubusercontent.com/odoo/odoo/18.0/addons/point_of_sale/static/src/app/payment/payment_interface.js
116. https://raw.githubusercontent.com/odoo/odoo/18.0/addons/point_of_sale/static/src/app/screens/payment_screen/payment_screen.js
117. https://raw.githubusercontent.com/odoo/odoo/18.0/addons/point_of_sale/static/src/app/screens/payment_screen/payment_lines/payment_lines.xml
118. https://raw.githubusercontent.com/odoo/odoo/18.0/addons/point_of_sale/models/pos_session.py (`_create_pay_later_receivable_lines`)

Families not sourced to a primary page: Square's refund policy for "other" tenders (community only, U); Shopify's `gateway` string for a POS custom payment (U); Zip refunds and expiry (U); the WeChat Pay QR validity on Stripe (U); PagBank's status after an unpaid QR expires (U). The Woo Gift Cards and Account Funds code was read from third-party mirrors of the closed-source extensions, version stated, and their vendor docs were read directly.
