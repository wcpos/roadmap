<!-- Read-only inventory of the screen on monorepo `next` at f45a7b48a0, 2026-09-18, for roadmap#288: the feature floor the drawing must rehost. Source-only; nothing was run. -->
# Receipt and print flow inventory

**Evidence:** Observed in source only. No builds, tests, UI execution, or modifications.
**Scope:** Paid-sale receipt stage; Orders receipt entry points; shared sale/refund receipt preview, printing, PDF, and email flows. Printer settings excluded.
**Citation convention:** Paths beginning `receipt/`, `orders/`, `pos/`, `components/`, or `contexts/` are relative to `packages/core/src/screens/main/`. Other paths are repository-relative.
**English strings:** Taken from `packages/core/src/contexts/translations/locales/en/core.json`; server/template-owned text is identified separately.

## 1. Structure

### Paid-sale stage
- On wide layouts, the receipt replaces the **products column**, leaving the cart column alongside it; it is not another receipt modal. Products-column position remains configurable. `pos/columns/pos-columns.tsx:88–108`.
- On compact checkout, it occupies a full-height, full-size checkout modal. Compact means screen width below 640; medium starts at 640 and large at 1024. `pos/checkout/tender/tender-checkout.tsx:51,137–145`; `packages/core/src/contexts/theme/use-breakpoint.ts:7–14`.
- Topmost conditional region: captured-payment/order-finishing error, expandable diagnostics, documentation link. This can coexist with the successful-payment headline. `pos/checkout/receipt-stage/receipt-stage.tsx:175–178`.
- Success region: green surface; large circular checkmark; headline showing positive change or paid amount; payment-method/cash-tendered detail; multiple-payment count; optional printed destination. `pos/checkout/receipt-stage/receipt-stage.tsx:91–108,179–201`.
- Middle region: shared `ReceiptBody`, with syncing badge, template/printer selectors, mismatch warning, and paper preview. Selectors are side-by-side in the wide stage and stacked in compact mode. `pos/checkout/receipt-stage/receipt-stage.tsx:202–204`; `receipt/receipt-body.tsx:95–110`.
- Footer source order: primary New sale action, Email Receipt, Download PDF, Print Receipt/Print again, No receipt · New sale. Footer wraps; compact primary action takes full width. `pos/checkout/receipt-stage/receipt-stage.tsx:205–234`.
- Finishing clears receipt-stage selection and current order selection; compact finishing replaces the route with `/cart`. Printing/email/PDF do not themselves finish the sale. `pos/checkout/receipt-stage/use-finish-sale.ts:8–15`.
- Android hardware Back finishes; the stage does not install an Escape-to-finish handler. Compact modal dismissal separately calls its finish handler. `pos/checkout/receipt-stage/receipt-stage.tsx:172–173`; `pos/checkout/column/use-checkout-back.ts:7–31`; `pos/checkout/tender/tender-checkout.tsx:65–69`.

### Orders entry points and receipt overlay
- Receipt table cell: receipt icon with delayed tooltip, only for orders having a server ID. The column is **hidden by default**, width 46, unsortable, without a header label. `orders/cells/receipt.tsx:18–40`; `contexts/ui-settings/initial-settings.json:472–478`.
- Row ellipsis menu: “Receipt” appears for persisted orders. The whole action cell disappears in read-only mode. `orders/cells/actions.tsx:172–184,216–228`.
- Order-detail right panel: pinned footer includes “Print Receipt” for persisted orders; it opens the receipt rather than immediately printing. `orders/view/modal.tsx:52–53,90–102`.
- Each detailed refund card with a non-null refund ID has its own “Receipt” button, passing `document=refund:<id>`. `orders/view/sections/refunds.tsx:59–72`.
- Orders receipt route exports the shared `ReceiptScreen`; navigator presentation is `containedTransparentModal` with fade. `apps/main/app/(app)/(drawer)/orders/(modals)/receipt/[orderId].tsx:1`; `apps/main/app/(app)/(drawer)/orders/_layout.tsx:39–45`.
- POS also retains `/cart/receipt/[orderId]`, exporting the same screen. `apps/main/app/(app)/(drawer)/(pos)/(modals)/cart/receipt/[orderId].tsx:1`.
- Shared receipt overlay: title “Receipt” or “Refund receipt”; body; footer containing Close, Email Receipt when applicable, Download PDF, Print Receipt/Print again; top-right ×. `receipt/receipt.tsx:65–80`; `packages/components/src/modal/index.tsx:267–270`.
- Outside POS, overlay side defaults to **right**. Inside POS it follows products-side placement, or becomes a bottom sheet on small screens. `pos/contexts/overlay-side/overlay-side.tsx:14–29`.
- Right/left overlays are full-height; bottom sheets are capped at 85% height. Footer is reverse-stacked below the `sm` CSS breakpoint and horizontal above it. `packages/components/src/modal/index.tsx:232–236,300–307`.
- Opening an existing sale/refund receipt never enables checkout auto-print. `receipt/receipt.tsx:65`.

### Shared document and secondary overlays
- Selectors open dropdown/popover content, not printer settings. The receipt screen contains no printer-configuration shortcut. `receipt/printer-switcher.tsx:63–97`; `packages/components/src/select/index.tsx:159–209`.
- Paper preview: muted bordered surround, white paper canvas, top-right zoom controls, scrollable document. Supported preview widths are A4, 58 mm, and 80 mm. `receipt/components/receipt-preview-viewport.tsx:79–155`; `receipt/components/receipt-preview-viewport-utils.ts:18–36`.
- Actual receipt layout/content comes from selected server-synced templates, locally rendered logicless/thermal content, or a legacy receipt URL—not a fixed React receipt layout. `receipt/hooks/use-template-renderer.ts:233–295`.
- Document data can include store/customer identities and tax IDs, order/date/status, products and metadata, fees, shipping, discounts, tax summary, totals, payments, register, software, and fiscal/reprint information. Template content determines which fields appear. `receipt/utils/build-receipt-data.ts:874–1006`.
- Email opens a **centered dialog** over the receipt: title, validation summary, email input, save-to-billing switch, conditional offline notice, Cancel/Send footer, and ×. `receipt/receipt-actions.tsx:42–55`; `receipt/email.tsx:189–219`; `packages/components/src/dialog/index.tsx:215–218,265–272`.
- PDF uses browser download on web, native sharing or native print fallback on mobile. Print uses the selected printer transport or system print dialog. See §6.

## 2. Every control and field

| Control | Kind | Exact label | Default | Validation / condition | Action |
|---|---|---|---|---|---|
| Orders receipt cell | Icon button + tooltip | “Receipt” | Column hidden | Requires order server ID | Opens sale receipt by UUID. `orders/cells/receipt.tsx:18–40` |
| Orders action-menu trigger | Icon button | No visible text; ellipsis | Actions column shown | Hidden in read-only mode | Opens menu. `orders/cells/actions.tsx:172–185` |
| Orders menu receipt | Menu item | “Receipt” | Available for persisted orders | Requires server ID | Opens sale receipt. `orders/cells/actions.tsx:216–228` |
| Detail receipt action | Outline button | “Print Receipt” | Present for persisted order | Requires server ID | Opens receipt panel; does not print yet. `orders/view/modal.tsx:90–95` |
| Refund receipt | Small ghost button | “Receipt” | One per detailed refund | Non-null refund ID | Opens that refund document. `orders/view/sections/refunds.tsx:59–72` |
| Template | Select | Template title; placeholder “Select template” | First `is_active`, otherwise first template | Hidden with ≤1 template; non-offline-capable options disabled offline | Changes preview/template and effective printer selection. `receipt/template-switcher.tsx:37–77`; `receipt/hooks/use-template-renderer.ts:205–229` |
| Printer | Select | “Auto”, “Auto  —  {name}”, or printer name/ID; placeholder “Select printer” | Auto | Hidden when no printers; no option-level connectivity disable | Chooses print destination. `receipt/printer-switcher.tsx:37–93` |
| Auto printer option | Select item | “Auto” | Selected initially | Uses template routing | Resolves configured override, matching default printer, matching first printer, or system fallback. `receipt/hooks/use-resolved-printer.ts:72–99`; `packages/printer/src/resolve-printer.ts:24–56` |
| Zoom out | Icon/text button | “−”; accessible “Zoom out” | Auto-fit zoom | Disabled at 10% | Decreases zoom by 10 points. `receipt/components/receipt-preview-viewport.tsx:69–104` |
| Zoom in | Icon/text button | “+”; accessible “Zoom in” | Auto-fit zoom | Disabled at 200% | Increases zoom by 10 points. `receipt/components/receipt-preview-viewport.tsx:112–127` |
| Zoom value | Read-only status | “{zoom}%” | Fit ≤100% | Not an input or reset button | Displays scale. `receipt/components/receipt-preview-viewport.tsx:105–110` |
| Preview | Scrollable WebView/iframe | Template-defined | Selected template | No fixed field validation | Inspect receipt; template may contain its own interactive HTML. `receipt/receipt-body.tsx:65–77` |
| New sale | Large success button | “New sale” or “Print receipt · New sale” | Auto-print setting initially false | Disabled/loading while `autoPrintPending` | Finishes sale; handler itself does not invoke print. `pos/checkout/receipt-stage/receipt-stage.tsx:206–222`; `contexts/ui-settings/initial-settings.json:153` |
| Skip receipt | Outline button | “No receipt · New sale” | Available | Disabled while `autoPrintPending` | Same finish handler. `pos/checkout/receipt-stage/receipt-stage.tsx:224–233` |
| Email opener | Outline stage button / modal action | “Email Receipt” | Available for sale receipt | Hidden for refund documents; remains available offline | Opens email dialog. `receipt/receipt-actions.tsx:42–55` |
| PDF | Button | “Download PDF” | Available when eligible | Requires online store, no receipt sync, server order ID, selected template ID; loading disables button | Downloads selected sale/refund PDF. `receipt/use-receipt-document.ts:121–124`; `receipt/receipt-actions.tsx:57–64` |
| Print | Button | “Print Receipt”, then “Print again” | Initial label until successful dispatch | Loading while syncing or printing; no explicit offline/no-document disable | Dispatches print; catches rejection at button boundary. `receipt/receipt-actions.tsx:65–71` |
| Receipt close | Outline button / × | “Close”; × has no visible text | Existing-receipt overlay | No print-in-progress guard supplied | Navigates back. `receipt/receipt.tsx:78`; `packages/components/src/modal/index.tsx:80–106` |
| Email address | Text input | “Email Address” | Order billing email or empty | Required valid email via `z.string().email()`; no explicit placeholder/max length | Sets destination. `receipt/email.tsx:28–30,57,173–178,194–198` |
| Save email | Switch | “Save email to Billing Address” | Off | Boolean | Sends/queues `save_to: 'billing'` when on. `receipt/email.tsx:124–127,177,199–204` |
| Send email | Button | “Send” / “Send when online” | Depends on store reachability | Form validation; loading disables button | Sends now or durably queues; does not close dialog automatically. `receipt/email.tsx:113–165,184,216–218` |
| Email cancel / close | Outline button / × | “Cancel”; × has no visible text | Available | No loading guard supplied | Closes dialog. `receipt/email.tsx:214`; `packages/components/src/dialog/index.tsx:175–180,266–272` |
| Finishing diagnostics | Collapsible trigger | “Support details” | Collapsed | Only captured settlement with finishing error | Reveals selectable, scrollable error text. `pos/checkout/tender/captured-unfinished-notice.tsx:16–29` |
| Finishing help | External link | “Having trouble?” | Visible with finishing error | None | Opens `https://docs.wcpos.com/error-codes/PAYMENT121`. `pos/checkout/tender/captured-unfinished-notice.tsx:32–37` |
| Receipt-body crash reset | × icon button | No visible text | Only boundary error | None | Resets boundary. `packages/components/src/error-boundary/fallback.tsx:49,68–73` |
| Delivery-error help | Toast action | “Help” | On coded email/PDF error | None | Opens `https://docs.wcpos.com/error-codes/PRINT311`. `packages/utils/src/logger/index.ts:866–878` |
| Refund-history retry | Outline button | “Retry” | Only local detail error | None | Recreates/refetches refund resource; receipt buttons return with detailed cards. `orders/view/modal.tsx:144–152`; `orders/view/sections/refunds.tsx:186–188` |
| Orders Pro demo | Secondary button | “View Demo” | Free-user overlay | Orders page gated | Opens `https://demo.wcpos.com/pos/orders`. `components/pro-preview-overlay.tsx:34–37,84–90` |
| Orders upgrade | Button | “Upgrade to Pro” | Free-user overlay | Orders page gated | Opens `https://wcpos.com/pro`. `components/pro-preview-overlay.tsx:91–96` |

## 3. Every state

### Payment completion and finishing
- **Paid without positive change:** “Paid {amount}”, using derived settled paid amount—not simply order total. Detail lists distinct settled method titles joined with ` + `. `pos/checkout/receipt-stage/receipt-stage.tsx:140–171,185–194`.
- **Positive change:** headline “Change {amount}”. If settled cash exists, detail becomes “Paid {paid} · tendered {tendered} in cash”; only cash-kind tenders contribute to tendered amount. `pos/checkout/receipt-stage/receipt-stage.tsx:158–170`.
- **Split payment:** appends ` · {count} payments` when more than one settled row exists; includes captured and recorded-offline authorized rows. Pending/failed rows do not supply method names. `pos/checkout/receipt-stage/receipt-stage.tsx:146–157,192–194`.
- **Captured but order unfinished:** “The card was charged, but the order didn't finish. Don't charge again — open the order to finish it.” Error details and help sit above the green paid region. `pos/checkout/tender/captured-unfinished-notice.tsx:14–38`.
- **Auto-print waiting:** New sale and No receipt are disabled; primary action spins. No separate adjacent reason string is rendered. `pos/checkout/receipt-stage/receipt-stage.tsx:214–215,229`.
- **Printed:** print label changes to “Print again”; paid stage adds “Printed to {printer}”. Destination falls back to “Print Dialog”. Existing-order overlay has no separate printed-destination line. `receipt/use-receipt-document.ts:284–296`; `pos/checkout/receipt-stage/receipt-stage.tsx:196–200`.
- **Missing stage order:** briefly renders nothing, clears stale receipt selection, and lets parent return to cart/products content. `pos/checkout/receipt-stage/receipt-stage.tsx:113–122`.
- **Reduced motion:** no success animation until preference resolves; reduced-motion or preference-read failure uses complete static state. Otherwise surface fades/scales over 400 ms and tick draws over 450 ms after 150 ms. `pos/checkout/receipt-stage/receipt-stage.tsx:48–89`.

### Loading, empty, offline, and document errors
- **Order lookup loading:** receipt hosts use Suspense-backed record reads; these components do not define a receipt-specific loading sentence. `receipt/receipt.tsx:34`; `pos/checkout/receipt-stage/receipt-stage.tsx:115`.
- **Missing order in overlay:** title “No order found”; standard × remains; no receipt actions are rendered. `receipt/receipt.tsx:37–48`.
- **Receipt syncing:** “Syncing with server...” badge and loading print button while waiting for API data; PDF unavailable. Local receipt data can already supply preview. `receipt/syncing-badge.tsx:13–25`; `receipt/hooks/use-template-renderer.ts:173–203`.
- **Slow receipt API:** syncing/final-data waiting has an 8-second deadline; this does not itself guarantee the frame has loaded. `receipt/hooks/use-template-renderer.ts:25–27,156–171`; `receipt/use-receipt-document.ts:367–373`.
- **Frame loading:** web/Electron WebView shows a white loader overlay until load; native wrapper has no equivalent explicit custom loader. `packages/components/src/webview/index.web.tsx:45,186–189`; `packages/components/src/webview/index.tsx:79–116`.
- **No preview source:** themed empty panel says “This template can’t be previewed for this order. Choose another template, or sync the order and try again.” No retry/sync button is included in that panel. `receipt/receipt-body.tsx:111–118`.
- **Template render error:** literal HTML paragraph “Template render error”. `receipt/hooks/use-template-renderer.ts:267–276`.
- **Receipt API failure:** ordinary sale may retain locally built data; error is logged, not shown as a dedicated inline receipt error. Returned `documentError`/`refetch` are not consumed by `ReceiptBody`. `receipt/hooks/use-receipt-data.ts:175–191`; `receipt/receipt-body.tsx:36–59`.
- **Template sync failure/first run:** no dedicated wizard, template-loading sentence, or retry control; list can be empty, selector hidden, and preview uses legacy URL if present or unavailable state otherwise. `receipt/hooks/use-active-templates.ts:32,58`; `receipt/hooks/use-templates-sync.ts:120–133`; `receipt/receipt-body.tsx:69–71,111`.
- **Offline:** any status other than `online-website-available` counts as offline, including device online/store unreachable. Cached offline-capable templates can render ordinary sales. `receipt/hooks/use-template-renderer.ts:130–131,173–184`.
- **Offline template restriction:** non-offline-capable items are disabled without explanatory suffix/reason text; current/default selection is not automatically changed to an offline-capable template. `receipt/template-switcher.tsx:64–77`; `receipt/hooks/use-template-renderer.ts:205–229`.
- **Offline refund:** no fallback to parent-sale data/URL; unavailable preview is possible, email is hidden, PDF disabled. Printing a refund without its required data rejects rather than printing a sale substitute. `receipt/hooks/use-template-renderer.ts:177,336–337`; `receipt/use-receipt-document.ts:405–406`.
- **Printer mismatch:** amber warning text; warning does not disable print. Exact two messages are listed in §4. `receipt/mismatch-badge.tsx:14–19`; `receipt/receipt-actions.tsx:65–71`.
- **No configured printer:** selector disappears; print can use system dialog. No “no printers” empty-state message. `receipt/printer-switcher.tsx:37–39`; `packages/printer/src/hooks/use-print.ts:206–235`.
- **Print failure:** print spinner eventually clears; `printedTo` is not newly set; error is logged as `PRINT999`. The receipt callback does not request a toast or render an inline message. `receipt/use-receipt-document.ts:273–295`; `packages/printer/src/hooks/use-print.ts:250–252,285–290`.
- **Receipt-body render exception:** “Something went wrong:” plus dynamic error; below 200 px width or above 1,000 error characters, details move into warning-icon tooltip. × resets boundary. `packages/components/src/error-boundary/fallback.tsx:31–73`.

### Email, PDF, access, and long content
- **Invalid email:** validation summary “Please fix the following errors:” followed by `• email: {validator message}`; generic FormErrors notes untranslated Zod messages. `receipt/email.tsx:28–30,184,192`; `components/form-errors.tsx:13,31–37`.
- **Sending/queue-writing:** Send button loading/disabled; no separate saving sentence. Dialog remains open after completion. `receipt/email.tsx:115,163–165,216`; `packages/components/src/dialog/index.tsx:345–355`.
- **Sent:** success toast “Email sent”; form is not reset and dialog is not closed by the handler. `receipt/email.tsx:128–136`.
- **Offline email:** explanatory notice, action relabeled “Send when online”; successful queue write shows “Receipt email queued” / “It will send as soon as this device can reach your store.” `receipt/email.tsx:88–92,208–218`.
- **Connectivity failure during online send:** queues for later; server 5xx, selected temporary 4xx, transport failures, and offline/asleep/recovering preflight blocks are retryable. `receipt/email-queue/classify.ts:45–73,115–169`.
- **Permanent email refusal/auth required:** not hidden behind a queue promise; delivery-error toast with server/error reason. A successful HTTP response with `success:false` uses server message or “Your server did not send the email.” `receipt/email.tsx:138–161`; `receipt/email-queue/classify.ts:127–135`.
- **Queue unavailable/write failure:** cannot claim queued success; falls through to attempted send/error handling. No distinct queue-unavailable UI. `receipt/email.tsx:76,94–104,119–124`.
- **Queued delivery lifecycle:** pending/sent/failed are stored states, not badges on this screen; draining continues after closing receipt and across app restart. Permanent refusal or six actual attempts ends retries. `receipt/email-queue/queue.ts:22–38,67–72`; `receipt/email-queue/bridge.tsx:25–41`.
- **Downloading PDF:** Download PDF spins/disabled; success toast “PDF downloaded”; failure uses coded delivery toast. Native share-sheet completion is what this handler awaits, not proof of a saved file. `receipt/hooks/use-download-receipt-pdf.ts:40–67`.
- **PDF disabled:** offline, syncing, missing order ID, or missing template ID; no visible reason text beside button. `receipt/use-receipt-document.ts:124`; `receipt/receipt-actions.tsx:57–64`.
- **Pro-locked Orders:** real Orders page is blurred with upgrade card; read-only context hides action menu. Checkout/shared receipt components themselves contain no Pro lock. `components/pro-guard.tsx:18–59`; `apps/main/app/(app)/(drawer)/orders/index.tsx:4`.
- **Permission denied:** no dedicated receipt permission-denied panel. Email auth/refusal uses error toast; receipt-fetch permission failures follow document-error behavior above. `receipt/email-queue/classify.ts:115–135`; `receipt/hooks/use-receipt-data.ts:175–191`.
- **Long content:** receipt content measurement enlarges canvas and scroll area; zoom remains user-selected after manual adjustment. Button strings are single-line/truncated; select triggers clamp label spans; diagnostics are bounded to `max-h-40`. `receipt/components/receipt-preview-viewport.tsx:38–77,129–149`; `packages/components/src/button/index.tsx:135–136,260–267`; `packages/components/src/select/index.tsx:143`; `pos/checkout/tender/captured-unfinished-notice.tsx:25`.
- **Refund history loading/error:** skeleton rows while local detail resolves; error retains summary/reason/negative amount and Retry, but fallback summaries have no receipt buttons. `orders/view/sections/refunds.tsx:135–189`.
- **No refunds:** refund section absent. Missing detailed refund ID hides its receipt action. `orders/view/sections/refunds.tsx:59,207`.

## 4. Every user-facing string

### Paid stage and finishing notice
- `pos_checkout.paid_amount`: “Paid {amount}”; `pos_checkout.change_due`: “Change {amount}”. Catalog:833–834; use: `pos/checkout/receipt-stage/receipt-stage.tsx:185–187`.
- `pos_checkout.paid_tendered_in_cash`: “Paid {paid} · tendered {tendered} in cash”. Catalog:830; use: `pos/checkout/receipt-stage/receipt-stage.tsx:167`.
- `pos_checkout.payments_taken_one`: “{count} payment”; `_other`: “{count} payments”; called as `t('pos_checkout.payments_taken', { count })`. Catalog:2067–2068; use: `pos/checkout/receipt-stage/receipt-stage.tsx:193`.
- `pos_checkout.printed_to`: “Printed to {printer}”. Catalog:836; use: `pos/checkout/receipt-stage/receipt-stage.tsx:198`.
- `pos_checkout.new_sale`: “New sale”; `pos_checkout.print_receipt_new_sale`: “Print receipt · New sale”; `pos_checkout.no_receipt_new_sale`: “No receipt · New sale”. Catalog:831–832,838; use: `pos/checkout/receipt-stage/receipt-stage.tsx:218–232`.
- `pos_checkout.paid_but_order_not_finished`: “The card was charged, but the order didn't finish. Don't charge again — open the order to finish it.” Catalog:2114; use: `pos/checkout/tender/captured-unfinished-notice.tsx:15`.
- `settings.support_details`: “Support details”; `settings.having_trouble`: “Having trouble?”. Catalog:1224,1052; use: `pos/checkout/tender/captured-unfinished-notice.tsx:21,37`.
- Dynamic strings: payment titles or method IDs; joined ` + `; separator ` · `; formatted amounts; printer name; finishing error text. `pos/checkout/receipt-stage/receipt-stage.tsx:149–170,193`; `pos/checkout/tender/captured-unfinished-notice.tsx:27`.

### Receipt chrome and preview
- `common.receipt`: “Receipt”; `receipt.refund_receipt`: “Refund receipt”; `common.no_order_found`: “No order found”; `common.close`: “Close”. Catalog:437,926,387,274; use: `receipt/receipt.tsx:43,71,78`.
- `receipt.select_template`: “Select template”; `receipt.select_printer`: “Select printer”; `common.auto`: “Auto”. Catalog:929,928,242; use: `receipt/template-switcher.tsx:60`; `receipt/printer-switcher.tsx:51–60,76,84`.
- `receipt.syncing_with_server`: “Syncing with server...”. Catalog:932; use: `receipt/syncing-badge.tsx:25`.
- `receipt.preview_unavailable`: “This template can’t be previewed for this order. Choose another template, or sync the order and try again.” Catalog:924; use: `receipt/receipt-body.tsx:116`.
- `receipt.zoom_in`: “Zoom in”; `receipt.zoom_out`: “Zoom out”; literals “−”, “+”, and “{zoom}%”. Catalog:934–935; use: `receipt/receipt-body.tsx:147–148`; `receipt/components/receipt-preview-viewport.tsx:102,110,125`.
- Literal: “Thermal template selected but printer uses system dialog — raw ESC/POS output will not render correctly.” `packages/printer/src/detect-mismatch.ts:17`.
- Literal: “HTML template selected but printer expects raw bytes — HTML content may not print correctly.” `packages/printer/src/detect-mismatch.ts:21`.
- Literal: “Template render error”. `receipt/hooks/use-template-renderer.ts:275`.
- Literal: “Something went wrong:” plus dynamic exception message. `packages/components/src/error-boundary/fallback.tsx:44–45,65–66`.
- Dynamic names: template `title`, trimmed printer name or printer ID, and selected auto text `Auto  —  {name}`. `receipt/template-switcher.tsx:41–47`; `receipt/printer-switcher.tsx:47–60,92`.

### Print, PDF, and email
- `receipt.print_receipt`: “Print Receipt”; `receipt.print_again`: “Print again”; `receipt.print_dialog`: “Print Dialog”; `receipt.download_pdf`: “Download PDF”. Catalog:923,922,921,906; use: `receipt/receipt-actions.tsx:63,70`; `receipt/use-receipt-document.ts:286`.
- `receipt.email_receipt`: “Email Receipt”; `receipt.email_address`: “Email Address”; `receipt.save_email_to_billing_address`: “Save email to Billing Address”. Catalog:912,907,927; use: `receipt/receipt-actions.tsx:45,49`; `receipt/email.tsx:197,203`.
- `receipt.send`: “Send”; `receipt.send_when_online`: “Send when online”; `common.cancel`: “Cancel”. Catalog:930–931,255; use: `receipt/email.tsx:214–217`.
- `receipt.email_offline_notice`: “This device can’t reach your store right now. The receipt will be emailed automatically when the connection returns.” Catalog:909; use: `receipt/email.tsx:210`.
- `receipt.email_queued`: “Receipt email queued”; `receipt.email_queued_detail`: “It will send as soon as this device can reach your store.” Catalog:910–911; use: `receipt/email.tsx:90–91`.
- `receipt.email_sent`: “Email sent”; `receipt.email_not_sent`: “Your server did not send the email.”; `receipt.pdf_downloaded`: “PDF downloaded”. Catalog:913,908,920; use: `receipt/email.tsx:129,139`; `receipt/hooks/use-download-receipt-pdf.ts:48`.
- `common.please_fix_the_following_errors`: “Please fix the following errors:” followed by literal bullet/path format `• {path}: {message}`. Catalog:415; use: `components/form-errors.tsx:33–36`.
- `health.logs.error_summary.PRINT311`: “This receipt could not be emailed or downloaded.” Catalog:1941; resolved via `packages/core/src/contexts/merchant-toast.ts:57–62`.
- PDF error description, `health.logs.error_action.PRINT311`: “Retry; check the email/SMTP or download settings.” Catalog:2040. Email instead supplies its dynamic failure reason. `receipt/email.tsx:151`; `packages/core/src/contexts/merchant-toast.ts:146–148`.
- Error-toast action literal “Help”; URL `https://docs.wcpos.com/error-codes/PRINT311`. `packages/utils/src/logger/index.ts:866–878`.
- Email-error last-resort detail literal “Unknown error”. `receipt/email-queue/classify.ts:91–98`.
- Download/share filenames: `receipt-{orderId}.pdf` and `refund-{refundId}.pdf`; native share dialog title uses filename. `receipt/hooks/use-download-receipt-pdf.ts:38`; `receipt/utils/save-or-share-pdf.ts:61`.

### Orders entry context
- Refund-card surrounding strings: `orders.refund` with ` #{id}`; `orders.refunded_by` = “By”; `orders.refunds` section; `orders.refund_count_one/other` = “{count} refund” / “{count} refunds”; dynamic date, reason, amount. `orders/view/sections/refunds.tsx:45–80,212–217`; catalog:702–715.
- Refund-fallback strings: “Could not load refund details.” (`orders.refunds_load_failed`), “Local refund summary:” (`orders.local_refund_summary`), “No local refund summaries are available.” (`orders.no_local_refund_summary`), “No reason provided” (`orders.no_reason_provided`), “Retry” (`common.retry`). Catalog:717,683,687–688,447; use: `orders/view/sections/refunds.tsx:159–187`.
- Pro strings: “Upgrade to Pro” (`common.upgrade_to_pro`), “Re-open and print receipts for older orders by upgrading to WCPOS Pro” (`upgrade.re-open_and_print_receipts_for_older`), “View Demo” (`upgrade.view_demo`). Catalog:542,1289,1291; use: `components/pro-preview-overlay.tsx:36,80–95`.
- Pro URLs: `https://demo.wcpos.com/pos/orders`, `https://wcpos.com/pro`. `components/pro-preview-overlay.tsx:37,93`.

### Text inside the receipt document
- Server templates, server receipt HTML, and store `receipt_i18n` provide additional merchant-specific strings not statically enumerable from this checkout. Blank local dictionary values are discarded before English fallback. `receipt/hooks/use-template-renderer.ts:261–295`; `receipt/utils/build-receipt-data.ts:860–875`.
- Built-in thermal literal labels: “SALES RECEIPT”, “Receipt #”, “Date”, “Cashier”, “Customer”, “Tax ID”. `packages/printer/src/encoder/default-thermal-template.ts:40–65`.
- Built-in thermal totals/payment/footer labels: “Subtotal”, “Discount”, “TOTAL”, “Total saved”, “  Tendered”, “  Change”, “Thank you for your purchase!”. `packages/printer/src/encoder/default-thermal-template.ts:78–127`.
- Template dictionary defaults: `copy` “COPY”; `corrects` “Corrects”; `refunded_to` “Refunded to”; `reprint` “Reprint”; `register` “Register”; `sale_time` “Sale time”; `document_refund` “Refund”; `document_void` “Void”; `document_cancellation` “Cancellation”; `software` “Software”. `packages/printer/src/encoder/format-receipt-data.ts:15–25`.
- Further dictionary defaults: `order` “Order”; `date` “Date”; `cashier` “Cashier”; `customer` “Customer”; store/customer generic tax-ID labels “Tax ID”; `subtotal` “Subtotal”; `total_saved` “Total saved”; `total` “Total”; `tax`/`tax_amount_short` “Tax”. `packages/printer/src/encoder/format-receipt-data.ts:26–39`.
- Further defaults: `tax_summary` “Tax Summary”; `included_tax` “Tax included”; `total_tax` “Total Tax”; `taxable_excl_short` “Taxable excl.”; `taxable_incl_short` “Taxable incl.”; `total_refunded` “Total Refunded”; `refunded` “Refunded”; `net_total` “Net Total”; `tendered` “Tendered”; `change` “Change”; `thank_you` “Thank you”; `thank_you_purchase` “Thank you for your purchase!”. `packages/printer/src/encoder/format-receipt-data.ts:36–48`.
- Tax-ID type fallbacks: “VAT ID”, “VAT No.”, “ABN”, “CPF”, “CNPJ”, “GSTIN”, “Codice Fiscale”, “P.IVA”, “NIF”, “CUIT”, “GST/HST No.”, “EIN”, “USt-IdNr.”, “Steuernummer”, “HRB”, “KVK”, “SIRET”, “SIREN”, “Company No.”, “UID”. Explicit/scoped labels take precedence. `packages/printer/src/encoder/format-receipt-data.ts:58–110`.
- Dynamic fiscal footer may contain copy number/print timestamp, corrected document, QR payload, register, receipt number, sale time, and “WCPOS” with versions. `packages/printer/src/encoder/default-thermal-template.ts:129–142`; `receipt/utils/build-receipt-data.ts:976–999`.
- Catalog strings “Fiscal receipt”, “Updated copy”, and fiscal submission status labels are **not rendered as receipt-shell controls/badges in these hosts**. Data may still be rendered by a template. `receipt/receipt-body.tsx:95–153`; `receipt/receipt.tsx:67–80`.

## 5. Learned behaviour

### Applicable numbered ledger entries
- `pos/checkout/receipt-stage/LEDGER.md #1`: receipt order independent of current cart; vanished selection clears — **stage host**. Physical citation: `pos/checkout/receipt-stage/LEDGER.md:11`.
- `pos/checkout/receipt-stage/LEDGER.md #2`: positive change leads; otherwise settled paid amount, including recorded-offline authorization — **paid headline**. `pos/checkout/receipt-stage/LEDGER.md:12`.
- `pos/checkout/receipt-stage/LEDGER.md #3`: distinct settled methods in ledger order; cash-kind-only tendered sum — **paid detail**. `pos/checkout/receipt-stage/LEDGER.md:13`.
- `pos/checkout/receipt-stage/LEDGER.md #4`: disable both finish actions during auto-print pending — **footer**. `pos/checkout/receipt-stage/LEDGER.md:14`.
- `pos/checkout/receipt-stage/LEDGER.md #5`: receipt actions secondary; explicit finish clears selection and returns compact flow to cart — **footer/navigation**. `pos/checkout/receipt-stage/LEDGER.md:15`.
- `pos/checkout/receipt-stage/LEDGER.md #6`: wait for reduced-motion preference, then animate or render final static state — **success region**. `pos/checkout/receipt-stage/LEDGER.md:16`.
- `pos/checkout/receipt-stage/LEDGER.md #7`: lazy native haptics; feedback failure nonfatal; Android Back but not stage Escape finishes — **feedback/navigation**. `pos/checkout/receipt-stage/LEDGER.md:17`.
- `pos/checkout/receipt-stage/LEDGER.md #8`: captured-but-unfinished warning survives onto receipt above success headline — **error region**. `pos/checkout/receipt-stage/LEDGER.md:18`.
- `orders/LEDGER.md #3`: focused receipt-barcode scans search Orders instead of products — **finding an order to reprint**. `orders/LEDGER.md:13`.
- `orders/LEDGER.md #8`: read-only mode hides entire action cell — **menu receipt entry**. `orders/LEDGER.md:18`.
- `orders/LEDGER.md #37`: locally available refund cards remain usable offline and update live, newest first — **refund receipt entry**. `orders/LEDGER.md:47`.
- `orders/LEDGER.md #38`: changing order must not flash previous order’s refunds — **refund receipt entry identity**. `orders/LEDGER.md:48`.
- `orders/LEDGER.md #39`: refund loading/error stays isolated with local summary and Retry — **refund receipt entry availability**. `orders/LEDGER.md:49`.
- `orders/LEDGER.md #40`: right detail panel, responsive rail, receipt/refund actions outside scrolling body — **detail footer**. `orders/LEDGER.md:50`.
- `orders/LEDGER.md #41`: each refund card opens its own `refund:<id>` document with ID-specific testID — **refund receipt button**. `orders/LEDGER.md:51`.
- `orders/LEDGER.md #42`: refunded-product names decode HTML entities — **refund card containing receipt action**. `orders/LEDGER.md:52`.
- `orders/LEDGER.md #44`: refund-summary totals use the rendered list and consistent negative amounts — **refund card/section context**. `orders/LEDGER.md:54`.
- `components/data-table/LEDGER.md #7`: visible-column changes reach native cells — **optional receipt column**. `components/data-table/LEDGER.md:17`.
- `components/data-table/LEDGER.md #10`: individual cell Suspense/error isolation — **receipt-cell host**. `components/data-table/LEDGER.md:20`.
- `components/data-table/LEDGER.md #13`: loading table preserves configured visible-column shell — **receipt-column loading context**. `components/data-table/LEDGER.md:23`.
- Other listed-folder ledgers were inspected; unrelated product/customer editing, navigation, settings, and pure data-layer entries are excluded. No `LEDGER.md` was present under the shared `receipt/` directory.

### Visible/interactable behaviour with no ledger line in the scoped ledgers
- **No ledger line:** template dropdown disappears with ≤1 option; printer dropdown disappears with none. `receipt/template-switcher.tsx:37`; `receipt/printer-switcher.tsx:37`.
- **No ledger line:** template selection resets by order; effective manual printer choice is tied to template identity. Switching away reads Auto; returning can recover the previous pick because the stored pick is retained. `receipt/hooks/use-template-renderer.ts:211–229`; `receipt/hooks/use-resolved-printer.ts:33–50`.
- **No ledger line:** Pro store assignments constrain template ordering when matches exist; otherwise all published/virtual templates remain available. `receipt/hooks/use-active-templates.ts:60–78`.
- **No ledger line:** paper auto-fit stops after manual zoom; changing template remounts viewport and discards old document-size measurement. `receipt/components/receipt-preview-viewport.tsx:43–76`; `receipt/use-receipt-document.ts:143–164`.
- **No ledger line:** auto-print is claimed once per sale across stage remounts, only after frame load and final-data readiness; existing receipt modal never auto-prints. `receipt/use-receipt-document.ts:332–360`; `pos/checkout/checkout-mode.ts:35–41`.
- **No ledger line:** email remains reachable offline, queues durably, deduplicates pending same-order/same-address requests, and preserves a later request to save billing email. `receipt/email.tsx:119–120`; `receipt/email-queue/queue.ts:168–186`.
- **No ledger line:** queued sends resume independently of receipt dialog; delivery is at-least-once, so lost responses can produce duplicate customer emails. `receipt/email-queue/bridge.tsx:25–32`; `receipt/email-queue/queue.ts:22–27`.
- **No ledger line:** email sends do not pass selected template ID; PDF and ordinary cloud-print jobs do. `receipt/email.tsx:124–127`; `receipt/hooks/use-download-receipt-pdf.ts:42–44`; `receipt/use-receipt-document.ts:265–266`.
- **No ledger line:** preview does not increment print count; applicable print preparation fetches counted content, with local counts committed after dispatch. Local/server counts are not reconciled. `receipt/use-receipt-document.ts:198–219`; `receipt/hooks/use-receipt-data.ts:89–115`; `packages/printer/src/hooks/use-print.ts:239–249`.
- **No ledger line:** printer profile can open cash drawer during printing; there is no receipt-stage drawer toggle. `packages/printer/src/printer-service.ts:266,471,501`.
- **No ledger line:** shared `ReceiptBody` also supports `hideSelects` and non-zooming `fullWidth` flow preview with minimum height 384; neither scoped receipt host enables these modes. `receipt/receipt-body.tsx:20–32,99,119–142`; `receipt/receipt.tsx:75`.

## 6. Platform differences

- **Web/Electron preview:** DOM iframe; DOM buttons with tooltip titles; zoom percentage is polite live status; ResizeObserver refits/remeasures; scroll area supports overflow on both axes. `receipt/components/receipt-preview-viewport.web.tsx:42–64,89–120`.
- **Native preview:** React Native WebView, Pressables with accessibility labels/states, `onLayout` fitting, vertical ScrollView; no explicit horizontal ScrollView. `receipt/components/receipt-preview-viewport.tsx:55–61,89–132`.
- **Cross-origin web documents:** iframe content measurement requires accessible document body; inaccessible documents retain fallback paper geometry. Same-origin content gets zero margins and hidden internal overflow so outer viewport owns scrolling. `packages/components/src/webview/index.web.tsx:135–154`.
- **Web system printing:** hidden iframe invokes `window.print()`; waits for images, then settles on `afterprint` or a timeout. `packages/printer/src/transport/system-print-adapter.web.ts:44–122`.
- **Native system printing:** `expo-print` opens the OS print dialog with HTML. `packages/printer/src/transport/system-print-adapter.ts:18–19`.
- **Electron printing:** IPC submits HTML/data URL or external receipt URL to a hidden BrowserWindow; URL path avoids browser fetch CORS. Completion/error is job-specific. `packages/printer/src/transport/system-print-adapter.electron.ts:29–62`; `packages/printer/src/hooks/print-from-url.electron.ts:18–62`.
- **Direct/cloud printer:** shared dispatch chooses cloud order job, thermal XML, full-receipt raster, built-in receipt encoder, or system HTML path based on profile/content. Printer setup itself is excluded. `packages/printer/src/hooks/use-print.ts:137–235`.
- **PDF:** web/Electron browser-style Blob download; native cache file → share sheet, or OS print when sharing unavailable. `receipt/utils/save-or-share-pdf.web.ts:45–60`; `receipt/utils/save-or-share-pdf.ts:46–66`.
- **Feedback/navigation:** native success haptic; Android hardware Back; no stage Escape handler on desktop. Native modal scrim explicitly dismisses; web modal uses dialog primitive dismissal. `pos/checkout/receipt-stage/receipt-stage.tsx:66–76,173`; `packages/components/src/modal/index.tsx:136–150,190–195`.
- **Email overlay:** centered on all platforms; native adds safe-area padding and keyboard avoidance; footer stacks at narrow widths. `packages/components/src/dialog/index.tsx:139–170,218,292–302`.
- **Pro preview:** Android supplies a BlurTargetView; other platforms render content directly behind blur. `components/pro-guard.tsx:46–59`.

## 7. Open questions

- **Unverified live:** exact merchant receipt layout, template titles, logo/barcode content, translated document labels, and external HTML interactions depend on server/store data unavailable in source-only inspection. `receipt/hooks/use-template-renderer.ts:261–295`.
- **Auto-print completion semantics:** ledger says finishing must wait for the automatic print attempt to complete, but `autoPrintPending` ends when the attempt starts; it does not include `isPrinting`. Is leaving during dispatch intended? `pos/checkout/receipt-stage/LEDGER.md:14`; `receipt/use-receipt-document.ts:343–345,368–373`.
- **Dismissal versus disabled finish controls:** Android Back and compact modal close call finish directly without checking `autoPrintPending`. Compact web modal can also have primitive Escape dismissal despite the stage’s Escape opt-out. Is this intended? `pos/checkout/receipt-stage/receipt-stage.tsx:173`; `pos/checkout/tender/tender-checkout.tsx:65–68`; `packages/components/src/modal/index.tsx:136–141`.
- **Print confirmation wording:** “Printed to …” reflects resolved dispatch, not confirmed paper delivery; browser `afterprint` can also mean the dialog closed. Cancellation-specific semantics were not run. `receipt/use-receipt-document.ts:293–295`; `packages/printer/src/transport/system-print-adapter.web.ts:82–105`.
- **Refund + order-based cloud printer:** refund deliberately omits order/template job identifiers, while that cloud path requires them. No refund-specific alternative or disable is exposed here. Expected user experience needs confirmation. `receipt/use-receipt-document.ts:265–266`; `packages/printer/src/hooks/use-print.ts:159–165`.
- **Offline mixed-payment document:** stage headline derives all settled ledger methods, but local receipt-data builder constructs one payment from legacy order payment fields. Template/server-dependent printed detail may differ from stage summary. `pos/checkout/receipt-stage/receipt-stage.tsx:146–157`; `receipt/utils/build-receipt-data.ts:969–974`.
- **Frame error presentation:** frame failure releases auto-print waiting, but web loader is cleared only on load—not its error callback. Actual failure appearance was not executed. `receipt/use-receipt-document.ts:362,372`; `packages/components/src/webview/index.web.tsx:127,178–189`.
- **Validation wording:** repository defines the email validator but not its exact English Zod message; FormErrors explicitly leaves translation TODO. Exact validator suffix remains unverified. `receipt/email.tsx:28–30`; `components/form-errors.tsx:13,36`.
- **Email template expectation:** selected preview/PDF template is not included in email request; which server template email uses cannot be established here. `receipt/email.tsx:124–127`.
- **Direct-link Pro boundary:** Orders index is Pro-wrapped, but receipt route export and shared Receipt contain no equivalent check. Source-only inventory does not establish intended access for direct links. `apps/main/app/(app)/(drawer)/orders/index.tsx:4`; `apps/main/app/(app)/(drawer)/orders/(modals)/receipt/[orderId].tsx:1`.

### Behavior changes / regressions
- None introduced: read-only inventory, 0 changed lines. Runtime correctness, compatibility, and actual print/email delivery were not evaluated.