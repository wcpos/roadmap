# Handoff: the email invoice gateway as the first declared-UI tender method

Written 2026-10-08 for the agent who picks this up. Paul's words: "we are going to need a
consistent api and hooks into the app that a WordPress plugin can 'inject' into the POS, in this
case into the Tender screen." The email invoice gateway is the first consumer. Read this whole
file, then the rulings it links, before opening a worktree.

## The ruling you are building under

Recorded 2026-10-08 on wcpos/roadmap#121 (amendment comment) and in #120's Notes; glossary in the
monorepo's `CONTEXT.md` via wcpos/monorepo#2442 ("Language — Extensibility").

- **Merchants** customise with templates and settings. **Extension developers** write code, JS or
  React, against **host components**, and never ship their own renderer or markup into the POS.
  The app owns the pixels in every delivery class.
- **Host component**: one of a closed, versioned set of app components an extension may compose
  (field, checkbox, button, banner, list…). The only UI an extension can produce.
- **Declared UI**: a static host-component tree carried in a server descriptor and rendered by the
  app with no extension code. It is the config-class case of composing host components, and it is
  defined as the static case of the later sandboxed-code tier so both share one schema. This is
  the tier the email gateway uses.
- The anti-pattern is WooCommerce Blocks checkout, where every gateway ships its own React and
  nothing looks like one product. The model is Shopify POS UI Extensions, where third-party code
  emits host components and the host renders them.
- Terminals are the already-existing native-class instance of the same contract: typed state in
  (ledger rows, the leg, the prompt), verbs out, the app draws the terminal moment. Do not rebuild
  the terminal path; show it as an instance of the contract you write.

## What the gateway does today

Repo: https://github.com/wcpos/email-invoice-gateway (`wcpos-email-invoice.php`, one file, public,
`main`). It is a plain `WC_Payment_Gateway` with id `wcpos_email_invoice`:

- `payment_fields()` renders two inputs on the order-pay page: an email field (prefilled from the
  order's billing email) and a "Save email to Billing Address" checkbox.
- `validate_fields()` requires the email.
- `process_payment()` reads both from `$_POST`, optionally writes the billing email, sets the order
  to `pending` with the note "Awaiting customer payment", filters
  `woocommerce_email_recipient_customer_invoice` and sends WooCommerce's customer invoice email,
  which carries the "Pay for this order" link. No money is taken at the till.

On the 2.0 tender pane (`next`) it already works through the **Legacy** segmented control: Free's
`Descriptor_Builder` gives any gateway without a registered capture mode `capture.mode = webview`,
`legacyPaymentMethods()` lists it, and the Legacy tab opens the same order-pay frame. So the merchant
is not broken; what is missing is a first-class place in the keypad screen.

## The seams you will touch (all verified on `next`, 2026-10-08)

Free plugin (`wcpos/woocommerce-pos`, lane `next`):

- `includes/Payments/Contract/Descriptor_Builder.php` builds one descriptor per gateway:
  `resolve_kind()` (filter `wcpos_payment_method_kind`), `resolve_mode()` (filter
  `wcpos_payment_method_capture_mode`, default `manual` for the house manual gateways else
  `webview`), then `Capture_Mode_Registry::resolve()` finds a handler whose `describe( $gateway )`
  returns `capture` and `capabilities`. `provider_data` comes through
  `wcpos_payment_gateway_provider_data` (see `includes/Payments/Abstract_POS_Gateway.php`).
- `includes/API/V2/Payment_Methods_Controller.php` serves the envelope
  `{ schema: 1, contract, methods[] }`. The wiki documents it at
  `wiki/architecture/client/payments-contract/descriptor.md`; read that page first and amend it in
  the same PR series.
- Capture modes today: `manual | webview | server | device | stored_value`.

App (`wcpos/monorepo`, lane `next`, `packages/core`):

- `packages/order-math/src/payments/types.ts`: `PaymentMethodDescriptor` (schema 1: id, title,
  kind, pos_enabled, order, capture, capabilities, defaults, provider_data) and the envelope.
  Enums are `OpenEnum`: unknown values are kept and disabled with a reason (contract §13), so a new
  mode degrades gracefully on an older app.
- `packages/core/src/screens/main/hooks/use-payment-methods.ts` reads the envelope from the
  store's extra data and guards each row.
- `packages/core/src/screens/main/pos/checkout/tender/`: `tiles.ts` (`buildTenderTiles`,
  `legacyPaymentMethods`), `tender-state.ts` (reducer: tab, methodId, view, entry), `tender-pane.tsx`
  (`TenderKeypad`: the method row, the per-method helpers, the one commit button, the keys),
  `use-tender-flow.ts` (legs, ledger rows, `terminalLeg`, verbs), `legacy-tab.tsx`, `LEDGER.md`
  (the folder's decision ledger; append, never rewrite).
- The tender pane's chosen design is `docs/specs/2026-09-11-tender-pane-keypad-spec.md` and the
  mockup `docs/prototypes/2026-09-11-tender-pane-mockups/index.html` in this repo. Helpers change
  per method; the commit button names the action. Do not add tiles, sheets or a second button.

## What to build, in order

Each step is one PR on `next` of the repo named. Stop after step 1 and get Paul's word on the
descriptor before any app code.

1. **Decision ticket on #120, then the spec** (roadmap repo). Charter: the tender-method
   descriptor. Decide and write down:
   - **The declared-UI schema**: a host-component tree with a closed component set for v1. Enough
     for this gateway and the next ten Woo gateways: `field` (text, email, tel, number), `checkbox`,
     `select`, `note` (a line of text). Each has `id`, `label`, `required`, `default`, and a
     `prefill` source from a closed list (`order.billing.email`, `customer.email`…). No layout
     primitives in v1; the app lays helpers out.
   - **Where it lives**: a `fields` block on the descriptor, additive under schema 1 (older apps
     ignore it; the gateway stays on the Legacy tab there). Decide whether it is a new capture mode
     (`declared`) or a new `capture.ui` block on existing modes. Recommendation: a mode, because the
     tender reducer, tiles and commit path all branch on mode and a mode is what the Legacy tab
     tests for.
   - **The verb and its outcome**: this gateway's commit is "Send invoice", not "Take". The sale
     closes with no captured money and the order pending. Decide how that is written: a ledger row
     with status `pending` and `kind: other`, or an order-status outcome with no row. Read
     `LEDGER.md`, the Free `Ledger` and the capture-mode handlers before choosing; the decision must
     survive the receipt, reports and the display's `payment.state`.
   - **How the values travel**: the app posts the collected field values with the verb to a Free
     route (the existing checkout route family or a sibling), and Free calls the gateway's existing
     `validate_fields()` and `process_payment()` with those values in place of `$_POST`. The gateway
     file should not need to know the app exists.
   - **Availability and refusal**: what the gateway declares for `capabilities` (no change, no
     partial, no refunds via provider, offline `none`), and what the app shows when it is not
     available (the folded "not available right now" list, with a reason).
   - Record each decision with a resolution row on the ticket and the lines in the spec; the
     terminal path is described in the same spec as the native instance of the contract.

2. **Free: the descriptor side** (`wcpos/woocommerce-pos`, `next`). A capture-mode handler for the
   new mode, the `fields` block in `Descriptor_Builder` output and the REST schema, a filter a
   gateway uses to declare its fields (or a method on `Abstract_POS_Gateway`), the route that takes
   field values and runs the gateway's own validation and processing, PHPUnit for the descriptor
   and the route, and the wiki descriptor page amended in the same PR.

3. **The gateway** (`wcpos/email-invoice-gateway`, `main`). Declare the two fields and the verb
   through the Free hook; keep `payment_fields()` so the plugin still works on 1.10 and on the
   Legacy tab. One release.

4. **App: render declared UI in the tender pane** (`wcpos/monorepo`, `next`). The helper area
   renders the declared tree with host components; the method pill, the commit button label from
   the verb, the posting of values, the outcome written the way step 1 decided, and the method no
   longer listed on the Legacy tab. Tests at the level of the existing `tender-pane.test.tsx` and
   `use-tender-flow.test.tsx`. Tablet and phone screenshots against the mockup's Jump state of the
   same name, per the tender-pane spec. UI taste is Claude's, not delegable.

5. **Docs** (`wcpos/docs`): one page for gateway authors, "Declaring fields for the POS tender
   screen", written from the spec, as a draft PR merged with the release that ships step 4.

## Sequencing and load

The 2.0 train is loaded and the tender-pane slices are still landing on `next`. Step 1 can start
now; it is planning. Steps 2 to 5 wait until the tender-pane slices are merged, because the helper
area, the method row and the commit path are the surfaces this work renders into and they are
still moving. If Paul says "build it now" anyway, build on the tip of `next` at that moment and
rebase freely; do not fork the tender pane.

## Rules that bind this work

- Worktrees only; `main` and `next` stay clean. Free, Pro and the monorepo branch from
  `origin/next`; the gateway repo from `origin/main`.
- A `next` PR needs an `independent-review` status from a fresh Opus reviewer on its final head;
  every bot thread is dispositioned before merge.
- No new env vars. The component set, prefill sources and verbs are named constants in code.
- The 400-line non-test ceiling per task applies to each step.
- Do not ask Paul to configure anything per repo; the CI pattern for a private Pro checkout is
  the org-level `WCPOS_BOT_*` secrets (see the 2026-10-08 roadmap#95 handoff).
- Never name the component `Slot`; the registry naming rules from #139 stand.

## Not decided, flagged for the ticket

- Whether declared fields may depend on one another (show the "save to billing" box only when the
  email differs from the order's). Recommendation: no in v1; that is the sandboxed tier's job.
- Whether a declared field can be required by the app before the verb is enabled, or only
  validated server-side by the gateway. Recommendation: both, with the server as truth.
- Whether the Legacy tab stays at all once the first three Woo gateways have declared fields.
  Not this ticket's call; note it on #120.

## Where things are

- Ruling: https://github.com/wcpos/roadmap/issues/121 (amendment comment, 2026-10-08) and the
  Notes on https://github.com/wcpos/roadmap/issues/120.
- Glossary PR: https://github.com/wcpos/monorepo/pull/2442.
- Gateway: https://github.com/wcpos/email-invoice-gateway.
- Payments descriptor contract: `wiki/architecture/client/payments-contract/descriptor.md`.
- Tender pane spec and mockup: this repo, `docs/specs/2026-09-11-tender-pane-keypad-spec.md`,
  `docs/prototypes/2026-09-11-tender-pane-mockups/index.html`.
- Extensibility research the schema should follow: roadmap#140 (static typed registry, Shopify
  Cart-API-shaped props, RSC-serialisable values) and roadmap#124 (manifest-declared targets, typed
  readonly data, curated write methods).
