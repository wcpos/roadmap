# 1.11.0 ("version 2") documentation impact inventory — 2026-09-23

## Totals

| Corpus | Fine | Amend | Rewrite | Retire | New | Total |
|---|---:|---:|---:|---:|---:|---:|
| Wiki | 329 | 119 | 6 | 0 | 3 | 457 |
| Docs version-2.x | 219 | 54 | 7 | 0 | 3 | 283 |
| Combined | 548 | 173 | 13 | 0 | 6 | 740 |

**734 existing pages:** 454 wiki + 280 public docs. Total includes six proposed New pages; one New public split-payment guide is provisional. Zero Retire verdicts: no whole page was proven obsolete. Removed subsections do not require retiring useful pages.

## Scope checks by the orchestrator (2026-09-23)

The investigating run could not reach the GitHub API, so it flagged three delta claims as unverified. They're now settled against #195 and `origin/next`:

- **D2, the iframe:** *default* checkout is the tender pane (#195: "replaces that with a checkout that belongs to the POS"). But `packages/core/src/screens/main/pos/checkout/tender/legacy-tab.tsx` still renders the gateway's payment page (`PaymentWebview`) for webview-only gateways. So the rule is "no longer the default, and kept as a Legacy tab", not "gone". Pages marked Rewrite for D2 describe the default flow and keep a clearly scoped Legacy note.
- **D9, coupons:** *applying* a coupon at the till is Free in 2.0. `add-cart-items-menu.tsx` gates **Add Coupon** on `isPro` on `main` and not at all on `next`. The **Coupons management page** stays Pro (`pro-guard.tsx`: `ProPage` includes `'coupons'`). Free's `readme.txt` on `next` (line ~107) still lists "apply coupons" as a Pro feature. That readme is the stale one.
- **D11, split payments:** in scope. #195's pitch: "cash, split payments and card terminals straight at the register". `payment/split-payments.mdx` is no longer provisional.

## Method and confidence

- **Observed:** wiki membership from `git ls-files '*.md'`, excluding `.claude/`, `.pipeline/`, `INDEX.md`, `CLAUDE.md`, `README.md`; bodies from local `main` `5293ad86a2b17c030d05d8210feae1e00485ff88`. Public membership is every `.md`/`.mdx` under `versioned_docs/version-2.x/`. Its HEAD changed externally from `3d7d1ff` to `b13b7e31` during investigation; a direct diff between those commits shows no changes in the requested tree.
- **Observed reading:** substantive body excerpts and full-file delta searches for every page; complete selected high-risk payment, discount, reconciliation, compatibility and contract bodies. This is triage, not a line-by-line audit of all prose. **No headings-only verdicts**; screenshots were not visually reviewed. H = direct relevant evidence; M = excerpt-based judgement or unresolved scope; L = title/headings only (none). Fine is not a general accuracy endorsement.
- **Unverified release authority:** `gh issue view 195 -R wcpos/roadmap` was attempted first and failed: `error connecting to api.github.com`. Linked issues and wiki PRs #1117/#1120/#1122/#1123 could not be verified. No page is claimed to be already fixed by those PRs. No fetch, pull, checkout, commit or repository edit was performed. This is a complete local-page inventory, **not a verified final release manifest**.
- **Inferred classifications:** D1–D10 come from TASK.md: panels; tender checkout; Free registers/cash/X-Z/CSV/admin; Pro Customer Display; terminal readers/settings; Quick Discount/positive-only fees; register bar/layout/quick filters; WC9/plugin1.11/magstripe break; Free coupons/registers; Analytics excludes open/part-paid POS orders. Historical ADRs/incidents remain history; REST API `v2` is not product branding. Existing architecture and error-code pages already describing the new mechanisms are not blindly rewritten.
- **Provisional D11 / D11\*:** split/partial tender legs, settlement and per-method offline availability. Local `roadmap/ROADMAP.md` explicitly scopes split payments to 1.11; approved `roadmap/docs/specs/2026-09-11-tender-pane-keypad-spec.md` describes split/offline tender behavior. These supplement the supplied deltas but were **not verified against #195**. No D12+ shipping claim is made.
- **D2 conflict — launch-owner decision needed:** the supplied “iframe is gone” statement conflicts with local monorepo `origin/next` `c18820fd`, `packages/core/src/screens/main/pos/checkout/tender/legacy-tab.tsx`: it renders `PaymentWebview` for webview methods and blocks them when the ledger holds live money. The approved tender spec also retains Legacy. Rewrite the default-checkout model, but preserve explicitly scoped fallback guidance until final scope is confirmed.
- **D1 is not literally every dialog:** next code retains centered destructive `AlertDialog`s and WP-admin `packages/ui/src/modal.tsx`; cart overlays adapt left/right/bottom. Confirmed product/order/customer/printer forms need panel directions; OS/browser prompts do not. Logs Help already links directly to docs on both app main and next, so stale offline-help prose is pre-existing, not a panel migration.
- **Other direct checks:** app `utils/wcpos-plugin-version.ts` requires 1.11.0; Free next `readme.txt` requires WooCommerce 9.0; product `TaxBasedOn` footer survives. Free next readme still calls coupons Pro: that conflicts with supplied D9 and is not treated as authority over the stated tier decision. Hardware/runtime behavior and rollout status were not tested.

Paths are relative to the wiki root or public `version-2.x` root respectively. **—** means no supplied delta identified; a delta beside Fine marks a checked non-impact. Grouped error rows enumerate every member; counts count pages, not rows.

## Wiki — support/

| Page | Class | Deltas | Reason | Conf |
|---|---|---|---|---|
| `support/cloud-printing.md` | Fine | — | Cloud transport and provider choice are outside D1–D11. | M |
| `support/cloud-printing/automatic-printing.md` | Amend | D1 | Rename POS Add Printer dialog to panel; retain server auto-print rules. | H |
| `support/cloud-printing/print-queue.md` | Fine | — | Server print-job queue is not a D3 register session. | H |
| `support/cloud-printing/register-and-poll-url.md` | Fine | — | Cloud-printer registration is unrelated to D3 cash registers. | M |
| `support/cloud-printing/troubleshooting.md` | Fine | — | Polling authentication and queue diagnosis unchanged by D1–D11. | M |
| `support/cloud-printing/wcpos-cloud-print-relay.md` | Fine | — | Relay registration and transport are outside D1–D11. | M |
| `support/desktop-mobile.md` | Amend | D2,D8,D11 | Qualify legacy payment frames/offline limits; add paired-plugin requirement. | M |
| `support/error-codes.md` | Amend | D3,D4,D11 | Index register/display/tender error domains; offline Help claim is pre-existing stale. | M |
| `support/error-codes/authentication-and-permissions.md` | Fine | — | Auth/receipt capability failures retain their meaning; D9 is not role access. | M |
| `support/error-codes/checkout-and-payment.md` | Amend | D2,D11 | Scope PY02001 webview polling to Legacy; update stock/tender recovery context. | M |
| `support/error-codes/database-and-storage.md` | Fine | — | DB01005 corruption diagnosis is independent of D1–D11. | M |
| `support/error-codes/local-database-unavailable.md` | Amend | D2 | Replace checkout-screen/Process Payment directions with tender blocked state. | M |
| `support/error-codes/plugin-and-version-faults.md` | Amend | D8 | State plugin 1.11.0 and WooCommerce 9.0 floors explicitly. | H |
| `support/error-codes/square-terminal-messages.md` | Amend | D2,D11 | Distinguish legacy Square partial-capture lockout from supported split tenders. | M |
| `support/error-codes/store-switch-and-database-lifecycle.md` | Fine | — | DB01006 site/database lifecycle is not D3 register-session lifecycle. | M |
| `support/error-codes/stripe-terminal-messages.md` | Amend | D2,D5 | Scope AJAX nonce/order-pay recovery to legacy flow; cover tender-reader errors. | M |
| `support/error-codes/sync-and-connection.md` | Amend | D2 | Qualify checkout-GET/414 and empty-response remedies as legacy-specific. | M |
| `support/extensions.md` | Amend | D5,D9 | Add per-gateway reader setup; distinguish free coupons from Pro extension entitlement. | M |
| `support/hardware.md` | Amend | D1,D5,D8 | Update reader-settings coverage and printer panels; disclose magstripe removal. | M |
| `support/hosting.md` | Amend | D2 | Restrict checkout URL-length and iframe diagnostics to retained Legacy path. | M |
| `support/index.md` | Amend | D3,D4,D7 | Link new register, display and POS-layout support guides. | H |
| `support/international.md` | Fine | — | Translation, tax-ID and certification advice not changed by supplied deltas. | M |
| `support/licensing.md` | Fine | — | Site-bound licence model remains; D9 comparison lives in linked buying guide. | M |
| `support/licensing/account-area.md` | Fine | — | Licence account authentication is outside D1–D11. | M |
| `support/licensing/activation.md` | Fine | — | Licence activation and Pro analytics filters are not D10 order inclusion. | M |
| `support/licensing/bitcoin-checkout.md` | Fine | — | WCPOS subscription checkout is not the D2 merchant POS tender flow. | M |
| `support/licensing/buying-pro.md` | Amend | D3,D4,D9 | Remove coupons from Pro-only examples; describe free registers and Pro display. | H |
| `support/licensing/checkout-problems.md` | Fine | — | Purchasing Pro is unrelated to D2 in-store checkout. | M |
| `support/licensing/discord-community-access.md` | Fine | — | Discord entitlement is outside D1–D11. | M |
| `support/licensing/emails-and-receipts.md` | Fine | — | Pro purchase receipts are not D2 POS sale receipts. | M |
| `support/licensing/expiry-and-renewal.md` | Amend | D8 | Make existing version-family warning concrete for app/plugin 1.11.0 pairing. | M |
| `support/licensing/license-states.md` | Fine | — | Licence state meanings are unchanged by D9 feature-tier changes. | M |
| `support/licensing/pro-updates.md` | Amend | D8 | Add paired app/plugin requirement to upgrade guidance. | M |
| `support/licensing/refunds.md` | Fine | — | Refunding a Pro purchase is unrelated to D11 POS tender refunds. | M |
| `support/licensing/renewal-reminders.md` | Fine | — | Licence renewal notices are outside D1–D11. | M |
| `support/logs.md` | Fine | — | Logs navigation history is pre-existing; no supplied release delta changes it. | M |
| `support/logs/levels-and-search.md` | Fine | — | Existing 1.10 log semantics are outside D1–D11. | H |
| `support/logs/reading-the-logs-screen.md` | Fine | D1 | Help already links directly to docs on main and next; stale modal copy predates release. | H |
| `support/logs/retention-and-server-logs.md` | Fine | — | Log retention and server filtering are outside D1–D11. | M |
| `support/logs/sync-activity.md` | Fine | — | Already describes 1.11 cadence; no new change established under D1–D11. | M |
| `support/orders-receipts.md` | Amend | D3,D11 | Index managed register reconciliation and multi-tender order guidance. | H |
| `support/orders-receipts/coupons.md` | Amend | D6,D9 | Remove repeated Pro-only claims; add Quick Discount coupon distinction. | H |
| `support/orders-receipts/order-records-and-list.md` | Amend | D6,D11 | Restrict negative-fee advice to historical orders; explain per-leg payment identity. | M |
| `support/orders-receipts/orders-and-refunds.md` | Amend | D1,D2,D11 | Update order/refund panels, partial-paid states and re-checkout guidance. | H |
| `support/orders-receipts/receipt-troubleshooting.md` | Amend | D2 | Recheck auto-print workaround against the new paid/receipt stage. | M |
| `support/orders-receipts/receipts-and-pdfs.md` | Amend | D1,D2,D11 | Update receipt entry/toggle location and multiple-tender receipt context. | M |
| `support/orders-receipts/reports-and-till.md` | Rewrite | D3,D9,D10,D11 | No-managed-till/no-CSV/manual-close claims contradict Free sessions and scoped reporting. | H |
| `support/orders-receipts/store-changed-totals.md` | Amend | D2 | Replace checkout-modal and Process Payment locations; keep divergence explanation. | H |
| `support/payments.md` | Rewrite | D2,D5,D6,D9,D11 | Universal iframe, unsupported splits and Pro coupons no longer describe default checkout. | H |
| `support/payments/checkout-troubleshooting.md` | Rewrite | D2,D11 | Replace iframe-first diagnosis and unsupported-split workaround; retain labelled Legacy section. | H |
| `support/payments/discounts-and-coupons.md` | Rewrite | D6,D9 | Negative Add Fee and Pro-only coupons become Quick Discount and free coupons. | H |
| `support/payments/gateway-configuration.md` | Amend | D2,D5,D11 | Separate tender-capable gateways/readers from Legacy whole-order compatibility. | H |
| `support/payments/mollie-terminal.md` | Amend | D2,D5 | Label iframe redirect workflow as Legacy; distinguish tender integration availability. | M |
| `support/payments/payarc-terminal-troubleshooting.md` | Amend | D2 | Scope order-form/AJAX recovery to Legacy rather than every tender payment. | M |
| `support/payments/payarc-terminal.md` | Amend | D2,D5 | Keep provider setup; identify supported Legacy/native path before promising POS compatibility. | M |
| `support/payments/paypal-reader.md` | Amend | D2,D5 | Qualify order-pay/WebSocket walkthrough and add actual reader-settings entry point. | M |
| `support/payments/refunds.md` | Amend | D1,D11 | Update refund panel and explain original-method handling for multi-leg orders. | M |
| `support/payments/square-pos-app-handoff.md` | Amend | D2 | Retain mobile handoff; scope framed-checkout failure to Legacy, not all checkout. | M |
| `support/payments/square-terminal-reliability.md` | Amend | D2,D11 | Separate provider partial-capture lockout from POS split-payment settlement. | M |
| `support/payments/square-terminal.md` | Amend | D2,D5 | Keep pairing/webhooks; qualify old payment-screen flow and tender support. | M |
| `support/payments/stripe-terminal.md` | Amend | D2,D5 | Add tender reader settings; distinguish native collection from storefront order-pay. | M |
| `support/payments/sumup-terminal.md` | Amend | D2,D5 | Retain API troubleshooting; replace universal checkout-panel reader-list instructions. | M |
| `support/payments/vipps-mobilepay.md` | Amend | D2 | Scope thank-you-page receipt routing to Legacy; preserve provider setup. | M |
| `support/permissions.md` | Amend | D2,D3,D9 | Qualify Checkout Settings visibility; add register permissions without a coupon Pro gate. | M |
| `support/permissions/customer-logins-and-catalog-writes.md` | Fine | D9 | WooCommerce role capabilities remain distinct from removal of coupon Pro entitlement. | M |
| `support/plugin-conflicts.md` | Amend | D2 | Isolate legacy checkout script/frame conflicts; login/receipt iframe advice still applies. | M |
| `support/privacy.md` | Fine | — | WP-admin consent modal and website analytics are not the D1 POS panel migration. | M |
| `support/products.md` | Amend | D2 | Update checkout-screen stock-rejection instructions to tender/cart flow. | M |
| `support/products/barcode-scanning.md` | Fine | D8 | HID barcode scanning is not the removed magnetic payment-card reader. | M |
| `support/products/catalog-and-sync-troubleshooting.md` | Amend | D1 | Edit Product JSON diagnostics now use a sliding panel. | H |
| `support/products/variable-products.md` | Fine | — | Variation selection/stock semantics are not changed by supplied deltas. | M |
| `support/receipt-printing.md` | Amend | D2 | Update post-checkout receipt entry links; printer-routing mechanisms remain. | M |
| `support/receipt-printing/legacy-php-template.md` | Fine | D2 | PHP receipt rendering survives; payment iframe changes do not remove templates. | H |
| `support/receipt-printing/printer-discovery.md` | Amend | D1 | Replace repeated Add Printer dialog instructions with panel terminology. | H |
| `support/receipt-printing/printer-setup.md` | Amend | D1 | Add/Edit Printer becomes a panel; OS Print Dialog remains unchanged. | H |
| `support/receipt-printing/printing-troubleshooting.md` | Amend | D1,D2 | Move auto-print explanation from receipt-modal mount to paid/receipt stage. | M |
| `support/receipt-printing/receipt-screen-and-routing.md` | Amend | D1,D2 | Refresh paid-stage/template-picker location; retain three-layer printer routing. | H |
| `support/receipt-printing/store-info.md` | Fine | — | WP-admin store identity/template assignments are outside D1–D11. | M |
| `support/receipt-printing/template-editor.md` | Fine | D1 | WP-admin editor/preview is not the POS modal migration. | M |
| `support/receipt-printing/template-fields-and-pricing.md` | Fine | D6,D11 | Existing discounts/payments arrays remain relevant; no contradictory single-tender claim. | H |
| `support/receipt-printing/template-gallery.md` | Fine | D1,D2 | WP-admin preview and customer invoice pay URL are not removed POS surfaces. | M |
| `support/receipt-printing/thermal-template-authoring.md` | Fine | — | Thermal XML authoring is outside D1–D11. | M |
| `support/tax-configuration.md` | Amend | D2,D7 | Scope product-footer tax checks to cart mode before the tender column swap. | M |
| `support/tax-configuration/rate-matching.md` | Fine | D2,D7 | TaxBasedOn hover/restore still exists; matching algorithm is not a listed delta. | H |
| `support/troubleshooting.md` | Amend | D2,D8 | Replace obsolete plugin floor and qualify legacy Checkout Settings diagnosis. | H |
| `support/troubleshooting/connect-and-sign-in.md` | Fine | D2 | Sign-in frame and auth recovery are not the replaced default payment flow. | M |
| `support/troubleshooting/multi-tab-web.md` | Fine | — | Web write-leader guidance is independent of D3 cash sessions. | M |
| `support/troubleshooting/multisite-cashier-identity.md` | Fine | — | Multisite identity repair is outside D1–D11. | M |
| `support/troubleshooting/unsent-sales.md` | Fine | D1 | Rejected-change confirmations remain centered AlertDialogs; recovery mechanism unchanged. | H |
| `support/upgrade-path.md` | Amend | D8,D9 | Add 1.11/WC9 floors and magstripe removal; remove current Pro-only coupon advice. | H |

## Wiki — architecture/, operations/, other

| Page | Class | Deltas | Reason | Conf |
|---|---|---|---|---|
| `AGENTS.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `SPEC.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/btcpay.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/client.md` | Amend | D2,D3,D4,D8 | Refresh launch lanes and links to the tender, registers and display contracts; do not relabel REST v2. | M |
| `architecture/client/ack-identity-and-adoption.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/app-startup-and-translations.md` | Amend | D8 | Replace the stated plugin 1.8.0 floor with the required 1.11.0 floor. | M |
| `architecture/client/browse-window-growth.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/browse-window-lane-retention.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/capability-gating.md` | Amend | D1,D3,D9 | Add till capabilities and Free coupons; replace edit-customer dialog terminology without changing capability principles. | M |
| `architecture/client/catalog-write-safety.md` | Amend | D2 | Update payment-entry references for tender mode; preserve confirmations and write-safety analysis. | M |
| `architecture/client/census-and-coverage.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/change-signal-server-pressure.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/change-signal.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/checkout-refunds.md` | Rewrite | D2,D5,D11 | Default modal/bootstrap-checkout session description is superseded by tender-pane and per-leg settlement/refunds. | H |
| `architecture/client/ci-lanes-and-nightlies.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/collection-reset.md` | Fine | D1 | Reset confirmation remains a centered AlertDialog; D1 does not invalidate it. | M |
| `architecture/client/connect-and-auth.md` | Amend | D3,D8 | Add register binding after store selection and distinguish old payload normalization from supported plugin versions. | M |
| `architecture/client/coupons.md` | Amend | D6,D9 | Remove explicit Pro-only coupon premise and document Quick Discount through the coupon engine. | M |
| `architecture/client/customer-browse-window.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/customer-display-broadcast.md` | Amend | D4 | Already describes the Pro display contract; change planned/shipping status and confirm launched pairing scope. | M |
| `architecture/client/customer-display-signaling.md` | Fine | D4 | Already describes Pro advertisement and device-owned pairing; no contradictory release mechanism found. | M |
| `architecture/client/customer-display-templates.md` | Amend | D4 | Already covers display templates; verify launch status and Ledger/Pocket/Marquee names, not remove its preview iframe. | M |
| `architecture/client/data-layer.md` | Amend | D2,D7,D11 | Blanket online-checkout requirement and POS-header placement conflict with per-method offline tender and register bar. | M |
| `architecture/client/database-generations.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/dead-letter-recovery.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/dead-letter-surfaces.md` | Fine | D1 | Destructive confirmations remain centered AlertDialogs, not panels. | M |
| `architecture/client/degraded-storage.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/electron-http-bridge.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/electron-storage.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/engine-backed-reads.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/engine-lifecycle.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/engine-monitor.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/engine-packages-and-lanes.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/error-code-registry.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/event-label-registry.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/existence-audit-politeness.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/fiscal-groundwork.md` | Amend | D3 | Cross-link the later server-record register/session ruling; do not present superseded device identity as current. | M |
| `architecture/client/fiscal-groundwork/receipt-identity-and-qr.md` | Fine | D3 | Forward-looking fiscal identity contract; no confirmed D1–D11 change requiring a rewrite. | M |
| `architecture/client/fiscal-groundwork/records-and-closures.md` | Amend | D3 | Refresh session-landing dependency/status for shipped closures; preserve historical fiscal-record decisions. | M |
| `architecture/client/fiscal-groundwork/register-and-provenance.md` | Amend | D3 | Reconcile client-minted register assumptions with later register-sessions server-created/shared-register ruling. | M |
| `architecture/client/gmt-dates-and-reconciliation.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/logging.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/logs-debug-export.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/mini-app-bridge.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/mutation-queue-concurrency.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/navigation-and-settings.md` | Amend | D1,D7 | Tax-rate modal and header-user-menu references need new overlay/register-bar entry points. | M |
| `architecture/client/notifications.md` | Amend | D7 | Add bell relocation to register bar/rail; notification transport remains unchanged. | M |
| `architecture/client/online-status.md` | Amend | D7 | Move the documented header connectivity dot to its register-bar location; keep reachability model. | M |
| `architecture/client/opfs-worker-delivery.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/order-math-tax-parity.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/order-money-precision.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/orders-browse.md` | Amend | D7 | Add configurable quick-filter presentation without rewriting server window/filter semantics. | M |
| `architecture/client/orders-ranged-reports.md` | Amend | D3,D9 | Clarify new Sales/Closures scope and Free/Pro report reach; existing bounded fetch mechanism remains relevant. | M |
| `architecture/client/payment-webview.md` | Amend | D2,D11 | Scope to retained Legacy tender tab, not default checkout; D2 total-removal claim conflicts with next code. | M |
| `architecture/client/payments-contract.md` | Amend | D2,D3,D5,D11 | Already new ledger contract; update launch status/tender links and distinguish retained Legacy mode from primary flow. | H |
| `architecture/client/payments-contract/descriptor.md` | Fine | D2,D5,D11 | Already defines per-method capabilities, reader curation and separate Legacy tab; D2 removal premise disputed. | H |
| `architecture/client/payments-contract/extensions-reports-drivers.md` | Amend | D2,D5,D11 | Confirm shipped provider/driver matrix and scope Legacy compatibility; the new contract itself is already documented. | M |
| `architecture/client/payments-contract/ledger.md` | Fine | D10,D11 | Already models N payment rows, partial statuses and Analytics exclusion; do not rewrite for product v2 branding. | M |
| `architecture/client/payments-contract/routes.md` | Fine | D5,D11 | Already documents capture-mode route family, manual offline and device settlement flows. | M |
| `architecture/client/payments-contract/tender-flows.md` | Amend | D2,D11 | Keep per-leg/offline/refund rules; connect split interaction wording to the shipped tender-pane controls. | M |
| `architecture/client/platform-network-support.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/printer-discovery.md` | Amend | D1 | Clarify verified right-side Add Printer presentation; discovery mechanisms remain. | M |
| `architecture/client/printer-escpos.md` | Amend | D1 | Locate compatibility controls in right-side printer panel; preserve encoding guidance. | M |
| `architecture/client/printer-profiles.md` | Amend | D1 | Clarify right-side Add Printer; retain operating-system Print Dialog terminology. | M |
| `architecture/client/printer-raster.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/printer-renderer.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/printer-transports.md` | Amend | D1 | Clarify adaptive receipt-panel handoff; printing iframes and system dialogs remain. | M |
| `architecture/client/product-browse-window.md` | Amend | D7 | Document quick-filter UI entry points while retaining windowed server-filter contract. | M |
| `architecture/client/product-catalog.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/query-adapter.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/receipt-data-schema.md` | Amend | D11 | Verify payment-array and paid/change mappings against per-leg ledger; do not assume unrelated fiscal fields ship. | M |
| `architecture/client/receipt-email-queue.md` | Fine | D1 | Receipt email dialog remains centered; durable queue mechanism unchanged. | M |
| `architecture/client/receipt-screen.md` | Amend | D1,D2,D11 | Receipt modal and checkout handoff need panel/tender wording and multi-payment receipt verification. | M |
| `architecture/client/receipt-templates.md` | Amend | D11 | Document payment-ledger rendering and recheck explicitly missing paid_total/change_total in local mapper. | M |
| `architecture/client/reconcile-performance.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/reference-collections.md` | Amend | D9 | Remove coupon Pro gating; lazy reference-loading mechanism is unchanged. | M |
| `architecture/client/register-sessions.md` | Amend | D3,D7,D9 | Already specifies Free sessions, register bar and cash movements; change pre-landing status to verified launch state. | H |
| `architecture/client/reports-and-closures.md` | Amend | D3,D9,D10 | Already a 1.11/marketed-2.0 contract; reconcile landing status and Free/current-register versus Pro scope. | H |
| `architecture/client/reports-and-closures/document-and-seam.md` | Fine | D3,D9 | Already defines report/closure documents; no mechanism rewrite justified by release naming. | M |
| `architecture/client/reports-and-closures/page-and-catalogue.md` | Fine | D1,D3,D9 | Already describes Sales/Closures, side panels and tier-by-scope behavior; verify release landings separately. | M |
| `architecture/client/reports-and-closures/time-refunds-and-reach.md` | Fine | D3,D8 | Already specifies session-bound refunds, report reach and WooCommerce 9.0 dependency. | M |
| `architecture/client/reports-and-closures/user-stories.md` | Fine | D3,D9 | Historical/accepted release stories already describe the target report experience, not old merchant steps. | M |
| `architecture/client/require-plane-outcomes.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/schemas-and-migrations.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/screen-pattern.md` | Fine | D1,D7 | Provider nesting, error boundaries and committed-search contracts remain valid; no modal walkthrough here. | H |
| `architecture/client/search.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/site-writes.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/stack-and-monorepo.md` | Amend | D1 | Cart forms use adaptive side/bottom overlays; preserve await-local-write semantics. | M |
| `architecture/client/storage-money-path-guard.md` | Amend | D1,D2,D11 | Map money guards to tender/receipt panels; old push-before-modal assumptions need per-method review. | M |
| `architecture/client/storage-recovery.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/storage-repair-scope.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/store-health-database.md` | Amend | D3 | Add register-session health/rejected-movement context; retain existing confirmation and reset mechanics. | M |
| `architecture/client/store-health-logs.md` | Fine | D1 | Help already links directly to docs on main and next; stale modal copy predates release. | M |
| `architecture/client/store-health-performance.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/store-health-storage-footprint.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/store-health-trends.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/store-settings.md` | Amend | D3 | Add register-session, variance and expected-close settings ownership to existing merge contract. | M |
| `architecture/client/sync-engine-perf-contracts.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/sync-log-observer.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/sync-metrics.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/tax-rate-matching.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/template-studio.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/client/theming-and-components.md` | Fine | D1 | Theme-transition/transparency rules remain; no new component catalogue needed. | M |
| `architecture/client/typed-meta.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/variation-attributes.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/web-bundle.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/web-write-leader.md` | Fine | D1–D11 | Lane-aware; no D1–D11 mechanism change. | M |
| `architecture/client/write-path.md` | Amend | D1,D2,D11 | Update cart-dialog/tender handoff references; preserve engine queue and mutation-adoption rules. | M |
| `architecture/decisions/2026-04-08-subtotal-parity.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-15-shared-ui-component-library.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-15-shared-ui-primitives.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-15-wp-admin-landing-phase1.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-16-wp-admin-landing-cdn-delivery.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-18-session-headers-proxy-layer.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-20-clawflow-workflow-engine.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-21-native-modules-owned-by-expo-app.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-22-clawflow-task-callback-bridge.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-22-expo-config-plugin-printer-build-constraints.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-04-23-workflow-engine-cutover.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-05-13-pnpm-supply-chain-safeguards.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-16-account-per-license-entitlement.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-16-discord-first-class-sign-in.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-16-discord-pro-role-sync.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-16-flat-divider-led-design-language.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-16-marketing-design-language-canonical.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-16-support-page-ai-assistant.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-17-analytics-recorder-seam.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-17-api-error-response-seam.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-06-17-order-math-package.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-07-08-discord-member-info-admin-lookup.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-07-18-scanner-package.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-08-06-negative-fee-tax-semantics.md` | Fine | D6 | Already marked superseded and explicitly preserves historic negative-fee math; retain decision record. | M |
| `architecture/decisions/2026-08-11-sync-engine-politeness-invariant.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-08-12-wiki-token-efficiency-restructure.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-08-17-backend-direction-driver-identity-envelope.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-08-17-engine-native-records.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-08-17-order-ownership.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-08-21-rest-route-transport-mode.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/2026-08-23-money-authority.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/decisions/_index.md` | Fine | D6 | Index already labels negative-fee ADR superseded; historical decisions need not be erased. | M |
| `architecture/decisions/adr-pr-review-pipeline.md` | Fine | D1–D11 | Historical ADR; no D1–D11 change. | M |
| `architecture/infra.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/infra/backups.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/cloud-print-plugin.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/cloud-print-relay.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/dashboard-live-view.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/dashboard-queries.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/dashboard-views.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/docs-site.md` | Amend | D1–D11 | Release documentation switches to marketed 2.x; refresh current 1.x authoring/sidebar/root-serving instructions. | M |
| `architecture/infra/error-dedup-and-guards.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/event-bridge.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/guardrail-and-support-mail.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/hetzner-and-coolify.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/keygen.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/logging-pipeline.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/medusa-cron-execution.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa-customer-auth.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa-email-crons.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa-internationalization.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa-licensing.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa-payments.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa-transactional-email.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa-woocommerce-migration.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/medusa.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/model-gateway-proxy.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/model-routing-policy.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/novu.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/openclaw-platform.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/platform-alerting.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/posthog-daily-report.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/posthog.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/relay-error-triage.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/support-answerer.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/task-intent-labeling.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/updates-server-licensing.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/updates-server-releases.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/updates-server.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/usage-contract.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/infra/wcpos-com-account-area.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-alerting.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-analytics.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-api-conventions.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-auth.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-bitcoin-checkout.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-checkout-flow.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-checkout-server-guards.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-customer-orders.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-downloads.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-i18n.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-licensing.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-middleware.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-performance.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-profile.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-security-and-seo.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-store-environment.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com-support-page.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wcpos-com.md` | Fine | D1–D11 | Website commerce, not D2 POS checkout. | M |
| `architecture/infra/wordpress-sites.md` | Fine | D1–D11 | Infrastructure outside D1–D11. | M |
| `architecture/openclaw-plugins.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/overview.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-atum.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free.md` | Amend | D3,D5,D8,D9 | Add Free register/coupon ownership and new payment service links; refresh minimum/runtime release facts. | M |
| `architecture/plugin-free/authentication-and-sessions.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/barcode-field.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/bundled-a4-templates.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/bundled-thermal-templates.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/change-log-retention.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-admin-ui.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-management-rest.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-polling-and-relay.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-push-providers.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-queue.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-settings.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-thermal-and-drawer.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/cloud-print-trigger.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/customer-tax-ids.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/frontend-bundle-and-translations.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/landing-data-and-consent.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/landing-profile-service.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/payments-contract.md` | Rewrite | D2,D5,D11 | Old four-endpoint checkout-state/adapter mechanism is superseded by descriptor, ledger and per-leg route family. | M |
| `architecture/plugin-free/pdf-rendering.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/permission-gate.md` | Amend | D3,D9 | Extend runtime/management capability tables for registers, cash movements and Free coupon access. | M |
| `architecture/plugin-free/phpunit-test-harness.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/pos-line-item-data.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/pos-order-audit-meta.md` | Amend | D3,D11 | Add register/session/till provenance and reconcile legacy cash keys with payment-ledger authority. | M |
| `architecture/plugin-free/pos-request-detection.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/preview-frame-and-parity.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/receipt-payload.md` | Amend | D11 | Recheck paid/change totals and payments collection against multi-leg ledger instead of one payment method. | M |
| `architecture/plugin-free/receipt-presentation-and-i18n.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/receipt-snapshots-and-adapters.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/rest-api-surface.md` | Amend | D3,D5,D9,D11 | Add register and payment-lifecycle route families; REST v2 naming is not product version 2. | M |
| `architecture/plugin-free/rest-controllers.md` | Amend | D3,D5,D9,D11 | Controller roster and blurred-Pro-coupon premise need register/payment routes and Free coupon update. | M |
| `architecture/plugin-free/security-hardening.md` | Amend | D2 | Label order-pay nonce/key protections as Legacy-path-specific; not evidence primary tender still embeds checkout. | M |
| `architecture/plugin-free/service-lanes-and-groups.md` | Amend | D3,D5,D11 | Extend service roster for session/payment handlers; keep Legacy storefront passthrough scoped correctly. | M |
| `architecture/plugin-free/settings-app-extensions-and-logs.md` | Amend | D5 | Add per-gateway reader-settings entry points to extension/gateway configuration navigation. | M |
| `architecture/plugin-free/settings-app-ui.md` | Amend | D3,D5 | Add Registers/admin navigation and per-gateway reader controls; WP-admin modals are not automatically D1 removals. | M |
| `architecture/plugin-free/settings-module.md` | Amend | D3,D5 | Add register-session policy and per-gateway reader settings ownership to section inventory. | M |
| `architecture/plugin-free/store-details-and-tax-id-fields.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/template-authoring-conventions.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/template-gallery.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/template-management-and-editor.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/template-rendering-engines.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/template-routes-and-storefront-receipts.md` | Amend | D2 | Scope order-pay routes to Legacy checkout; receipt routes and framing policies still have valid consumers. | M |
| `architecture/plugin-free/typed-meta-and-uuids.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/upgrade-funnel-analytics.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/uuid-identity-and-collisions.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/v1-orders-and-products.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-free/v2-change-log-and-integrity.md` | Fine | D1–D11 | REST v2 Change Log and Sequence Polling is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-integrity-digests.md` | Fine | D1–D11 | REST v2 v2 Integrity Digests is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-order-money-precision.md` | Fine | D1–D11 | REST v2 v2 Order Money Precision is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-order-read-augmentation.md` | Amend | D2,D11 | Document payment ledger augmentation and qualify legacy payment-link consumer; not a wholesale API v2 rewrite. | M |
| `architecture/plugin-free/v2-order-update-transformations.md` | Fine | D1–D11 | REST v2 v2 Order Update Transformations is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-orders-proxy.md` | Fine | D1–D11 | REST v2 v2 Orders Proxy is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-product-serialization.md` | Fine | D1–D11 | REST v2 v2 Product Serialization, Augmentation and Visibility is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-push-envelope-and-idempotency.md` | Fine | D1–D11 | REST v2 v2 Push Envelope and Idempotency is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-response-telemetry.md` | Fine | D1–D11 | REST v2 v2 Response Telemetry and the Bulk-ID Fast Path is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-store-scope.md` | Fine | D1–D11 | REST v2 v2 Store Scope is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-targeted-reads.md` | Fine | D1–D11 | REST v2 v2 Targeted Reads for Customers and Variations is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-write-customers-and-catalog.md` | Amend | D8 | Replace explicit WC minimum 5.3 claim with 9.0; retain valid 9.0–9.3 customer-option distinction. | M |
| `architecture/plugin-free/v2-write-order-fields.md` | Fine | D1–D11 | REST v2 v2 Write Surface Order Field Reconciliation is API architecture, not product v2; no specific D1–D11 change found. | M |
| `architecture/plugin-free/v2-write-surface.md` | Amend | D6 | Convert future negative-fee-removal caveat to released Quick Discount behavior while preserving historic fee handling. | M |
| `architecture/plugin-pro.md` | Amend | D4,D5,D9 | Update Pro overview for Customer Display/terminal machinery and remove coupon exclusivity wherever implied. | M |
| `architecture/plugin-pro/admin-react-apps.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/auto-update-system.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/bundling-and-bootstrap-parity.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/extension-mechanism.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/extensions-updater.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/integration-testing.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/licensing.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/meta-deduplication-migration.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/per-outlet-cloud-print.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/rest-namespaces-and-refunds.md` | Amend | D3,D11 | Retain correct Free coupon ownership; reconcile single-order refund route with ledger allocations/session provenance. | M |
| `architecture/plugin-pro/store-authorization.md` | Amend | D3,D10 | Add register/session store-scoping and Analytics exclusion context beside existing query-filter rules. | M |
| `architecture/plugin-pro/store-edit-page.md` | Amend | D3,D4 | Add per-store session policy and Customer Display template settings to the admin form inventory. | M |
| `architecture/plugin-pro/store-edit-save-behaviour.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/store-pricing-and-tax.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/plugin-pro/stores-cpt-and-rest-api.md` | Amend | D3,D4 | Document served register-policy/display fields and default-register creation per store. | M |
| `architecture/plugin-storeapps-smart-coupons.md` | Amend | D9 | Remove claim that ordinary POS coupon application requires Pro; verify extension entitlement separately. | M |
| `architecture/replication-lab.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `architecture/wp-admin-landing.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `docs/handoff.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `operations/agents/_index.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/drucker.md` | Amend | D2,D3,D5,D11 | Refresh stale release-milestone wording/date and reconcile completed checkout/payment scope; agent role is unchanged. | M |
| `operations/agents/pr-review-pipeline.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/ada-skill-design.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/clawflow-control-plane.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/coderabbit-rate-limit-retry.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/codex-guardrails.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/fix-run-triage-and-status-comment.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/fix-worker-runtime.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/incidents.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/known-issues-and-evals.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/merge-gate-coverage-and-staleness.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/model-routing.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/monorepo-ci-scope-and-governance.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/pinning-tests-and-merge-gate.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/pr-fix-delegation-contract.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/recovery-observability.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/review-catchup-sweep.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/session-work-budget.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/stalled-flow-reaper.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/validation-gates.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/agents/pr-review-pipeline/webhook-ingress-and-dispatch-guards.md` | Fine | D1–D11 | Agent/review operation outside D1–D11. | M |
| `operations/deployment.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/agent-workspace-updates.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/coolify-deploy-flows.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/medusa-alerts-and-mail-crons.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/medusa-deploy-gates.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/openclaw-image-guards-and-provenance.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/openclaw-runtime-builds.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/post-deploy-verification.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/posthog-btcpay-and-cloud-print.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/deployment/vercel-wcpos-com.md` | Fine | D1–D11 | Backend/deployment procedure outside D1–D11. | M |
| `operations/incidents/2026-04-15-posthog-initial-deployment.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-04-17-btcpay-data-loss.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-04-22-drucker-wiki-ingest-outage.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-05-25-openrouter-out-of-credits.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-05-25-updates-server-memory-leak-outage.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-05-28-keygen-router-conflict-outage.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-06-29-feed-cost-query-event-loop-outage.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-03-posthog-feature-flags-db-env-names.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-03-pro-license-activation-cutover-gap.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-04-migrated-customers-locked-out-no-emailpass-identity.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-05-checkout-null-stripe-key-no-payment-methods.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-05-pro-download-token-secret-unprovisioned.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-08-worktree-add-race-pr-fix-failure.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-09-btcpay-provider-never-instantiated.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-09-dashboard-usage-summary-event-loop-wedge.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-09-duplicate-expiry-reminders.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-09-keygen-sidekiq-worker-never-started.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-09-winback-false-no-gap-claim.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-31-aide-support-turn-dispatch-degrade-reply-loop.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/2026-07-31-refund-revocation-404-self-hosted-keygen.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/incidents/_index.md` | Fine | D1–D11 | Historical incident, not D1–D11 instructions. | M |
| `operations/overview.md` | Fine | D1–D11 | Navigation-only operations hub; release deltas do not change its process links. | H |
| `operations/release-process.md` | Amend | D8 | Add plugin/app compatibility-floor and marketed-2 versus code-1.11 launch coordination; mechanics remain intact. | M |
| `operations/release-process/app-and-desktop-releases.md` | Amend | D8 | Document app/plugin 1.11 compatibility and refresh current CDN lane examples at launch. | M |
| `operations/release-process/free-plugin-release-train.md` | Amend | D8 | Include WooCommerce 9.0/app-plugin compatibility notices in this release's handoff; keep existing train mechanics. | M |
| `operations/release-process/pro-plugin-release-train.md` | Amend | D8,D9 | Carry bundled-Free minimum and feature-tier changes in Pro notes/Upgrade Notice; no workflow rewrite implied. | M |
| `operations/release-process/withdrawing-a-release.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `operations/translation-pipeline.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/admin-breadcrumb-localization.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/commits-and-incremental-scope.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/docs-ci-gates.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/docs-sweep-and-audit.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/docs-translation-pipeline.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/job-tracking-and-completion.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/mdx-translation-units.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/model-routing-and-translator-guidance.md` | Amend | D1,D2 | Update POS checkout-modal example to tender/panel terminology; translation pipeline mechanics are unchanged. | M |
| `operations/translation-pipeline/output-normalization-and-anchors.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/release-and-consumer-propagation.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/string-ingest-and-completeness.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/two-phase-qa.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/translation-pipeline/webhook-contract.md` | Fine | D1–D11 | Localization pipeline outside D1–D11. | M |
| `operations/wiki-restructure-migration-plan.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `operations/wiki.md` | Fine | D1–D11 | No D1–D11 impact found. | M |
| `product/competitors.md` | Amend | D3,D4,D5,D9 | Remove WCPOS customer-display/register capability gaps and refresh WCPOS feature claims only. | M |
| `product/features.md` | Amend | D3,D4,D9 | Hub incorrectly lists coupons under Pro and omits Free registers and Pro display. | M |
| `product/features/comparison-and-pricing.md` | Amend | D3,D4,D9 | Move coupons to Free, distinguish Free register X/Z reports from Pro report scope, and add display. | H |
| `product/features/free-receipts-and-printing.md` | Amend | D1,D3,D11 | Receipt/printer dialog wording becomes panels; add closure X/Z printing and multi-leg receipt context. | M |
| `product/features/free-selling.md` | Amend | D2,D3,D6,D7,D8,D9,D11 | Replace negative-fee/online-only checkout and old header claims; add Free registers/coupons and new compatibility floor. | H |
| `product/features/pro-and-add-ons.md` | Amend | D3,D4,D5,D9 | Remove Pro-only coupons, add Customer Display/reader controls, and separate Free till reports from Pro scope. | H |
| `product/overview.md` | Amend | D3,D4,D9,D11 | Qualify blanket offline promise by tender capability and update Pro-report/tier summary for Free registers. | H |
| `product/personas.md` | Fine | D1–D11 | No D1–D11 impact found. | M |

## Docs version-2.x

| Page | Class | Deltas | Reason | Conf |
|---|---|---|---|---|
| `coupons/applying-coupons.mdx` | Amend | D9 | Remove the explicit Pro-only/disabled Add Coupon restriction; coupon application is Free. | H |
| `coupons/index.mdx` | Amend | D9 | Remove the Pro gate and blurred-preview claim for the coupon catalogue and cart codes. | H |
| `customers/index.mdx` | Amend | D1 | Refresh customer edit/display-settings presentation for sliding panels; customer-management entitlement is unchanged. | M |
| `extensions/atum.mdx` | Fine | — | ATUM location, stock, pricing and write-back integration has no identified D1–D11 change. | M |
| `extensions/index.mdx` | Fine | D5 | Already lists Stripe/SumUp extensions and installation; directory licensing is not the coupon gate. | M |
| `extensions/polylang.mdx` | Fine | — | Polylang language filtering and per-store language behavior are outside D1–D11. | M |
| `extensions/storeapps-smart-coupons.mdx` | Fine | D9 | Already distinguishes coupon support from Pro-only directory installation; credit integration itself is unchanged. | M |
| `extensions/wp-multilang.mdx` | Fine | — | WP Multilang translation filtering is outside D1–D11. | M |
| `extensions/wpml.mdx` | Fine | — | WPML language-scoped catalogue integration is outside D1–D11. | M |
| `getting-started/connect.mdx` | Amend | D2,D8 | Remove blanket payment-iframe assertion and add app/plugin compatibility floor; login iframe guidance remains relevant. | H |
| `getting-started/free-vs-pro.mdx` | Amend | D3,D4,D9 | Move coupons and registers into Free; add Pro Customer Display and distinguish sales Reports from register reports. | H |
| `getting-started/index.mdx` | Amend | D2,D3,D4,D7,D8,D9 | Refresh the first-sale tour and feature links for tender pane, register bar, display and Free coupons. | M |
| `getting-started/installation.mdx` | Amend | D8 | Replace WooCommerce 5.3 minimum with 9.0 and state app requires plugin 1.11.0. | H |
| `getting-started/offline.mdx` | Rewrite | D2,D9 | Hosted-page-only payment restriction is no longer the default checkout mechanism; separate offline-capable tenders from connected gateways and remove coupon Pro gate. | H |
| `getting-started/previous-versions.mdx` | Amend | D8 | Add compatibility warning before plugin downgrade: current app cannot run against a pre-1.11.0 plugin. | H |
| `getting-started/pro-license.mdx` | Amend | D4,D9 | Add Customer Display to Pro benefits and avoid implying the new register reporting/coupons need Pro. | M |
| `getting-started/roadmap.mdx` | Amend | D2,D3,D4,D5,D6,D7,D9 | Move shipped Customer Display/checkout items out of future-work framing and link new release guides. | H |
| `hardware/index.mdx` | Amend | D4,D5,D8 | Link customer-display setup and per-gateway reader settings; explicitly distinguish supported terminals from removed magnetic-reader input. | M |
| `hardware/printers/android-permissions.mdx` | Fine | — | Android Bluetooth/network printer permissions are unaffected by D1–D11. | M |
| `hardware/printers/bluetooth-pairing.mdx` | Fine | — | Bluetooth printer pairing and one-host connectivity are unaffected by D1–D11. | M |
| `hardware/printers/browser-permissions.mdx` | Fine | D1 | Browser/network permission prompts are not POS modals; D1 does not retire this troubleshooting. | M |
| `hardware/printers/cash-drawer.mdx` | Amend | D3 | Hardware wiring stays; explain register no-sale/cash-movement drawer opening instead of implying receipt printing is the only trigger. | H |
| `hardware/printers/index.mdx` | Fine | D1 | Printer profiles/routing and OS print dialogs remain; no specific release contradiction found in body scan. | M |
| `hardware/printers/ios-local-network.mdx` | Fine | — | iOS local-network permission diagnosis is unaffected by D1–D11. | M |
| `hardware/printers/logo-missing-browser.mdx` | Fine | — | Browser logo/CORS print troubleshooting is unaffected by D1–D11. | M |
| `hardware/printers/network-address.mdx` | Fine | — | Printer IP/network-isolation troubleshooting is unaffected by D1–D11. | M |
| `hardware/printers/non-latin-receipts.mdx` | Fine | — | Thermal character tables/raster output are unaffected by D1–D11. | M |
| `hardware/printers/printed-once-then-stopped.mdx` | Fine | — | Printer connection recovery instructions are unaffected by D1–D11. | M |
| `hardware/printers/receipt-width.mdx` | Fine | — | Paper-width calibration concerns printed columns, not D7 POS columns. | M |
| `hardware/printers/secure-printing.mdx` | Fine | — | Epson Secure Printing configuration is unaffected by D1–D11. | M |
| `hardware/printers/server-direct-print.mdx` | Fine | — | Printer Server Direct Print conflicts are unaffected by D1–D11. | M |
| `hardware/printers/setup-wizard.mdx` | Fine | D1 | Hardware connection wizard remains relevant; its system print dialog is not the removed POS modal. | M |
| `hardware/printers/supported-printers.mdx` | Fine | — | Printer support list has no identified D1–D11 change; hardware claims were not re-tested. | M |
| `hardware/printers/usb-linux.mdx` | Fine | — | Linux USB access troubleshooting is unaffected by D1–D11. | M |
| `hardware/printers/usb-windows.mdx` | Fine | — | Windows printer-queue troubleshooting is unaffected by D1–D11. | M |
| `hardware/scanners/index.mdx` | Fine | D8 | Barcode scanners/camera are not the removed magnetic payment-card reader. | M |
| `hardware/scanners/setup-wizard.mdx` | Fine | D8 | Barcode-scanner pairing/test workflow remains distinct from removed magnetic payment-card input. | M |
| `integrations/index.mdx` | Fine | D2 | Explains REST-side plugin integration, not a required POS order-pay iframe. | M |
| `integrations/woocommerce-tax.mdx` | Fine | D2 | Already describes POS REST-order tax integration rather than online-checkout hooks. | M |
| `orders/index.mdx` | Amend | D1,D2,D11* | Update order/detail presentation and editing-through-checkout wording; describe partial balance versus completed order where D11 ships. | M |
| `orders/refunds.mdx` | Amend | D1,D3,D5,D11* | Replace explicit refund/order-view modals and add cash-register/per-tender refund caveats rather than assuming one original payment method. | H |
| `payment/gateways/email-invoice.mdx` | Amend | D2,D11* | Keep emailed online payment links; show new tender entry and explain whole-order versus partial-payment restrictions. | M |
| `payment/gateways/index.mdx` | Amend | D2,D5 | Distinguish native reader integrations from legacy WooCommerce/web-checkout gateways and link reader settings. | M |
| `payment/gateways/mollie-terminal.mdx` | Amend | D2,D5,D11* | Preserve provider setup; qualify legacy checkout/thank-you redirect instructions and whole-order completion assumption. | M |
| `payment/gateways/paypal-reader.mdx` | Amend | D2,D5,D11* | Preserve PayPal pairing setup; update cashier entry/completion for tender pane and clarify supported capture path. | M |
| `payment/gateways/square-terminal.mdx` | Amend | D2,D5,D11* | Qualify POS/order-pay workflow and whole-order payment/release instructions for native versus legacy tender paths. | M |
| `payment/gateways/stripe-terminal.mdx` | Amend | D2,D5,D11* | Add per-gateway reader settings and native tender workflow; one successful card leg does not necessarily settle a split order. | M |
| `payment/gateways/sumup-terminal.mdx` | Amend | D2,D5,D11* | Update reader configuration and replace unconditional auto-complete-after-payment wording with balance-aware tender completion. | M |
| `payment/gateways/vipps-mobilepay.mdx` | Amend | D2,D11* | Retain wallet/provider setup but relocate cashier flow and qualify order completion versus a tender leg. | M |
| `payment/gateways/web-checkout.mdx` | Amend | D2,D11* | Hosted customer checkout still has a purpose; scope it as the web/legacy option and document split-order limits instead of retiring it. | M |
| `payment/index.mdx` | Rewrite | D2,D5,D11* | Iframe-as-universal-checkout model becomes native tender/payment selection; separate supported legacy fallback and partial settlement. | H |
| `pos/cart/discounts.mdx` | Rewrite | D6,D9 | Replace Add Fee negative amounts, percentage-only quick-discount limits and old discount-fee tax guidance with Quick Discount; coupons are Free. | H |
| `pos/cart/index.mdx` | Amend | D1,D2,D6,D7 | Update cart controls/settings imagery, add Quick Discount and positive-only fees, and show tender pane replacing products. | H |
| `pos/cart/line-items.mdx` | Amend | D1,D6 | Specify panel entry for detailed/raw line editing and distinguish line price overrides from order Quick Discount/positive fees. | M |
| `pos/cart/open-orders.mdx` | Amend | D2,D3,D11* | Add partially-paid/registered order handoff and cancellation safeguards; blanket void-to-trash instructions omit held tender money. | M |
| `pos/cart/order-actions.mdx` | Amend | D1,D2,D11* | Order note/meta open panels, not dialogs; Checkout activates tender mode, and void must account for existing payments. | H |
| `pos/checkout/index.mdx` | Rewrite | D1,D2,D5,D9,D11* | Replace checkout modal/order-pay tutorial with tender pane, current readers and Free coupons; isolate any retained legacy fallback. | H |
| `pos/index.mdx` | Rewrite | D1,D2,D3,D4,D7,D9 | Title-bar/two-fixed-column/modal tour is obsolete: register bar, configurable layout and tender mode define the selling UI. | H |
| `pos/product-panel/barcode-scanning.mdx` | Fine | D7,D8 | Already describes inline resizable camera panel; barcode detection is separate from magnetic payment-card reader removal. | M |
| `pos/product-panel/index.mdx` | Amend | D1,D2,D7 | Add configurable product-column/quick-filter layout and explain when the products column is replaced by tender mode. | H |
| `pos/product-panel/meta-data-keys.mdx` | Fine | — | Product metadata-key copying is unaffected by D1–D11. | M |
| `pos/product-panel/search-filtering.mdx` | Amend | D7 | Current fixed filter-bar account needs customisable quick-filter configuration and updated imagery. | H |
| `pos/product-panel/variations.mdx` | Fine | — | Inline variation selection and attributes have no identified D1–D11 mechanism change. | M |
| `pos/reconciliation.mdx` | Rewrite | D3,D9,D10 | Explicitly denies built-in floats/counts/variance and sends Free users to Analytics; replace with Free register-close workflow. | H |
| `pos/refunds.mdx` | Amend | D3,D5,D11* | Add cash-register and split/original-tender caveats to refund quick steps without duplicating the main refund guide. | M |
| `products/index.mdx` | Amend | D1 | Product Edit is explicitly called a modal; update to panel and replace affected UI imagery. | H |
| `products/pos-only-products.mdx` | Fine | — | POS-only product visibility controls are unaffected by D1–D11. | M |
| `products/sync.mdx` | Fine | — | Product sync/coverage guide concerns existing sync behavior, not checkout/register mechanisms. | M |
| `receipts/at-checkout.mdx` | Amend | D1,D2,D11* | Replace receipt-modal entry/dismissal instructions and show receipt behavior after full versus partial tender completion. | H |
| `receipts/cloud-printing.mdx` | Fine | — | Cloud printer setup/routing and server printing rules have no identified D1–D11 change. | M |
| `receipts/customise.mdx` | Fine | D1 | Template gallery/editor and system print routing remain relevant; no POS-modal dependency identified. | M |
| `receipts/html-templates.mdx` | Fine | D2 | Already describes client-side offline HTML receipt rendering rather than requiring checkout iframe rendering. | M |
| `receipts/index.mdx` | Fine | D2 | Receipt-template engine/gallery overview is not tied to the old checkout mechanism. | M |
| `receipts/receipt-data.mdx` | Fine | D11* | Already defines payments as an array of amount/tendered/change rows; do not rewrite a matching contract merely because split tenders ship. | M |
| `receipts/storefront.mdx` | Fine | D2 | Storefront receipt shortcode/My Account downloads are separate from the POS order-pay iframe. | M |
| `receipts/thermal-templates.mdx` | Fine | — | Thermal XML syntax and preview are unaffected by D1–D11. | M |
| `reference/architecture.mdx` | Amend | D2,D9,D11* | Replace checkout-iframe architecture subsection and coupon Pro qualifier; broader local client/plugin architecture remains valid. | H |
| `reference/fiscal-compliance.mdx` | Fine | D3 | Cash-management/X-Z reporting does not itself establish fiscal certification; existing certification caveats remain necessary. | M |
| `reference/gateway-template.mdx` | Amend | D2,D5,D11* | Scope PHP payment_fields/process_payment template to the legacy/full-order path; it is not automatically a native per-leg tender adapter. | M |
| `reference/pos-discounts.mdx` | Amend | D6,D9 | Remove coupon Pro gate and distinguish new order Quick Discount from unchanged line-price override semantics. | H |
| `reference/role-endpoint-access.mdx` | Amend | D3,D5,D11* | Extend endpoint/role matrix with registers, cash/closure authority and tender/reader surfaces; existing checkout routes alone are incomplete. | M |
| `reference/sync-engine.mdx` | Fine | — | Existing sync-engine/storage contract is not replaced by D1–D11; no unrelated next-lane rewrite assumed. | M |
| `reference/sync-performance.mdx` | Fine | — | Sync resource budgets and recorded benchmarks are outside D1–D11; no fresh performance claim made. | M |
| `reference/wc-rest-api.mdx` | Fine | D2 | REST API explanation and plugin-hook caveats remain valid under native tender checkout. | M |
| `reports/index.mdx` | Amend | D3,D9,D10,D11* | Separate Pro sales Reports from Free X/Z/register CSV and qualify blanket Analytics-total equivalence for open/partial orders. | H |
| `reports/reconciliation.mdx` | Rewrite | D3,D9,D10,D11* | Manual-only floats/drops/counts/variance and no-session claims contradict Free register cash management and tender-aware close. | H |
| `settings/index.mdx` | Amend | D3,D4,D5,D7 | Extend settings map to register configuration, Customer Display, reader settings and configurable selling layout. | M |
| `settings/store/barcode.mdx` | Fine | D8 | Barcode scanner timing/prefix settings are not magnetic payment-card reader settings. | M |
| `settings/store/general.mdx` | Fine | D1 | Store localisation/currency/customer preferences are unchanged; no modal instruction found in body scan. | M |
| `settings/store/hotkeys.mdx` | Fine | D1 | Already says Settings opens a panel; listed screen-navigation shortcuts have no identified delta. | M |
| `settings/store/index.mdx` | Amend | D4,D5,D7 | Already correctly describes side panels; add new Customer Display/reader/layout settings to the tab map, not a D1 rewrite. | H |
| `settings/store/tax.mdx` | Fine | D6 | Tax calculation/display settings contain no negative-fee recipe; D6 belongs in discount guidance, not a wholesale tax-settings rewrite. | M |
| `settings/store/theme.mdx` | Fine | D1 | Theme selection semantics are unchanged; no modal-specific instruction identified. | M |
| `settings/wp-admin/access.mdx` | Amend | D3,D9 | Add cash-management/register-closure capabilities and Free coupon access; WP Admin confirmation dialogs are not automatically D1 targets. | H |
| `settings/wp-admin/checkout.mdx` | Amend | D2,D5,D11* | Replace checkout-modal default selection wording and explain native gateway/reader and tender settlement settings. | H |
| `settings/wp-admin/customer-tax-ids.mdx` | Fine | — | Customer tax-ID copying and receipt labels have no identified D1–D11 change. | M |
| `settings/wp-admin/email-notifications.mdx` | Fine | — | Email toggle groups/hooks have no confirmed D1–D11 change; do not infer a new notification policy from payment UI alone. | M |
| `settings/wp-admin/general.mdx` | Fine | — | General product/customer/privacy settings are not the new Registers admin screen. | M |
| `settings/wp-admin/index.mdx` | Amend | D3,D4,D5 | Link new Registers administration and relevant display/reader settings without confusing Registers with login Sessions. | M |
| `settings/wp-admin/sessions.mdx` | Fine | D3 | This is authenticated-device Sessions, not new cash register sessions; retain login/security management guidance. | H |
| `settings/wp-admin/store-tax-ids.mdx` | Fine | — | Store tax identifiers and receipt assignments are unaffected by D1–D11. | M |
| `stores/index.mdx` | Amend | D3,D9 | Distinguish Free registers from Pro store locations and link register setup; multi-store itself remains Pro. | M |
| `stores/setup.mdx` | Amend | D3,D9 | Add a register-per-location setup link and clarify Free register availability within the single virtual store. | M |
| `support/index.mdx` | Fine | — | Support/contact entry points have no identified D1–D11 mechanism change. | M |
| `support/logs.mdx` | Amend | D3,D4,D5 | Add register/display/payment diagnostic examples and links so launch failures are discoverable in existing logging guide. | M |
| `support/notifications.mdx` | Amend | D7 | Verify and refresh bell/header location under the register-bar layout; notification storage/read semantics remain unchanged. | M |
| `support/performance/checkout.mdx` | Amend | D2 | Scope iframe/style/script tuning to any retained legacy tender path and link native-tender diagnosis; launch fallback status is unresolved, so do not Retire. | M |
| `support/performance/index.mdx` | Amend | D2 | Replace generic slow-payment-modal wording with tender/payment categories and qualified legacy troubleshooting link. | H |
| `support/performance/server.mdx` | Amend | D8 | Add or link WooCommerce 9.0/plugin 1.11.0 floor in compatibility/requirements guidance; unrelated hosting benchmarks remain untouched. | M |
| `support/store-health.mdx` | Amend | D3 | Link register-specific rejected-movement recovery; existing destructive confirmation dialogs remain. | M |
| `support/translations.mdx` | Fine | D1 | Generic translator use of dialogs is not an actionable modal walkthrough; translation contribution workflow is unchanged. | M |
| `support/troubleshooting/clear-local-data.mdx` | Amend | D3,D11* | Extend local-reset data-loss warning to unsent register movements and tender records; do not imply server re-download restores them. | M |
| `support/troubleshooting/cloudflare.mdx` | Fine | — | Cloudflare REST challenge/cache diagnosis remains applicable to new payment/register APIs. | M |
| `support/troubleshooting/critical-error.mdx` | Fine | — | Server-fatal-error log retrieval is unaffected by D1–D11. | M |
| `support/troubleshooting/plugin-conflicts.mdx` | Amend | D2 | Separate login/receipt iframe problems from native tender; qualify Elementor/overlay/Checkout Settings advice as legacy-only. | H |
| `support/troubleshooting/response-error.mdx` | Fine | — | Malformed/empty server response troubleshooting has no identified D1–D11-specific mechanism change. | M |
| `support/troubleshooting/totals-disagree.mdx` | Amend | D6,D11* | Add payment-ledger/balance verification when totals change after money moved; distinguish new Quick Discount from old fee adjustments. | M |
| `error-codes/API01001.mdx`<br>`error-codes/API01002.mdx`<br>`error-codes/API01003.mdx`<br>`error-codes/API01004.mdx`<br>`error-codes/API01005.mdx`<br>`error-codes/API01006.mdx`<br>`error-codes/API01007.mdx`<br>`error-codes/API01008.mdx`<br>`error-codes/API02001.mdx`<br>`error-codes/API02002.mdx`<br>`error-codes/API02003.mdx`<br>`error-codes/API02004.mdx`<br>`error-codes/API02005.mdx`<br>`error-codes/API02006.mdx`<br>`error-codes/API02007.mdx`<br>`error-codes/API02008.mdx`<br>`error-codes/API02009.mdx`<br>`error-codes/API02010.mdx`<br>`error-codes/API03001.mdx`<br>`error-codes/API03002.mdx`<br>`error-codes/API03003.mdx`<br>`error-codes/API03004.mdx`<br>`error-codes/API03005.mdx`<br>`error-codes/API03006.mdx`<br>`error-codes/API03007.mdx`<br>`error-codes/API04001.mdx`<br>`error-codes/API04002.mdx`<br>`error-codes/API04003.mdx`<br>`error-codes/API04004.mdx`<br>`error-codes/API04005.mdx`<br>`error-codes/API04006.mdx`<br>`error-codes/API05001.mdx`<br>`error-codes/API05002.mdx`<br>`error-codes/API05003.mdx`<br>`error-codes/API05004.mdx`<br>`error-codes/API05005.mdx`<br>`error-codes/API06001.mdx`<br>`error-codes/API06002.mdx`<br>`error-codes/API06003.mdx`<br>`error-codes/api.mdx` | Fine | D2,D8 | Retained pre-1.10 network/auth/API references explicitly preserved by the error index; old offline/version statements are historical, not current release instructions. | M |
| `error-codes/AUTH101.mdx`<br>`error-codes/AUTH111.mdx`<br>`error-codes/AUTH121.mdx`<br>`error-codes/AUTH131.mdx`<br>`error-codes/AUTH201.mdx`<br>`error-codes/AUTH301.mdx`<br>`error-codes/AUTH311.mdx`<br>`error-codes/AUTH321.mdx`<br>`error-codes/AUTH331.mdx`<br>`error-codes/AUTH401.mdx`<br>`error-codes/AUTH411.mdx`<br>`error-codes/AUTH421.mdx`<br>`error-codes/AUTH431.mdx`<br>`error-codes/AUTH441.mdx`<br>`error-codes/AUTH999.mdx` | Fine | D8 | Authentication recovery remains valid; AUTH331 already diagnoses an app newer than its plugin and directs a compatible update. | M |
| `error-codes/CHECKOUT101.mdx`<br>`error-codes/CHECKOUT111.mdx`<br>`error-codes/CHECKOUT201.mdx`<br>`error-codes/CHECKOUT211.mdx`<br>`error-codes/CHECKOUT301.mdx`<br>`error-codes/CHECKOUT401.mdx`<br>`error-codes/CHECKOUT411.mdx`<br>`error-codes/CHECKOUT421.mdx`<br>`error-codes/CHECKOUT999.mdx` | Fine | D2,D11* | Cart validation, unknown-outcome and totals/tax warnings already avoid modal/iframe assumptions and caution against duplicate charging. | M |
| `error-codes/CLIENT101.mdx`<br>`error-codes/CLIENT111.mdx`<br>`error-codes/CLIENT121.mdx`<br>`error-codes/CLIENT131.mdx`<br>`error-codes/CLIENT141.mdx`<br>`error-codes/CLIENT142.mdx`<br>`error-codes/CLIENT143.mdx`<br>`error-codes/CLIENT144.mdx`<br>`error-codes/CLIENT151.mdx`<br>`error-codes/CLIENT201.mdx`<br>`error-codes/CLIENT211.mdx`<br>`error-codes/CLIENT999.mdx` | Fine | — | Startup/storage/search/device failures have no identified D1–D11-specific instruction change. | M |
| `error-codes/DB01001.mdx`<br>`error-codes/DB01002.mdx`<br>`error-codes/DB01003.mdx`<br>`error-codes/DB02001.mdx`<br>`error-codes/DB02002.mdx`<br>`error-codes/DB02003.mdx`<br>`error-codes/DB03001.mdx`<br>`error-codes/DB03002.mdx`<br>`error-codes/DB03003.mdx`<br>`error-codes/db.mdx` | Fine | — | Retained pre-1.10 database-code reference; D1–D11 does not justify removing historical support links. | M |
| `error-codes/DISPLAY101.mdx` | Fine | D4 | DISPLAY101 already describes snapshot failure, idle fallback and Settings → Customer Display → Paired displays. | H |
| `error-codes/HOST101.mdx`<br>`error-codes/HOST111.mdx`<br>`error-codes/HOST121.mdx`<br>`error-codes/HOST131.mdx`<br>`error-codes/HOST141.mdx`<br>`error-codes/HOST151.mdx`<br>`error-codes/HOST161.mdx` | Fine | — | REST/CORS/WAF/cache/rate-limit failures remain applicable; no identified D1–D11 mechanism change. | M |
| `error-codes/LICENSE101.mdx`<br>`error-codes/LICENSE201.mdx`<br>`error-codes/LICENSE301.mdx`<br>`error-codes/LICENSE999.mdx` | Fine | D8,D9 | License/Pro-version error remediation remains valid; pages do not falsely Pro-gate coupons or registers. | M |
| `error-codes/PAYMENT101.mdx`<br>`error-codes/PAYMENT111.mdx`<br>`error-codes/PAYMENT121.mdx`<br>`error-codes/PAYMENT201.mdx`<br>`error-codes/PAYMENT211.mdx`<br>`error-codes/PAYMENT221.mdx`<br>`error-codes/PAYMENT301.mdx`<br>`error-codes/PAYMENT401.mdx`<br>`error-codes/PAYMENT501.mdx`<br>`error-codes/PAYMENT511.mdx`<br>`error-codes/PAYMENT999.mdx` | Fine | D5,D11* | Already covers per-payment local-save/finalization/refusal/void/overpayment outcomes; preserve no-double-charge guidance, including PAYMENT111/121/211/221/501/511. | M |
| `error-codes/PRINT101.mdx`<br>`error-codes/PRINT201.mdx`<br>`error-codes/PRINT301.mdx`<br>`error-codes/PRINT311.mdx`<br>`error-codes/PRINT999.mdx` | Fine | D1 | Printing/email/PDF outcomes are independent of the old checkout modal; no explicit obsolete modal workflow found. | M |
| `error-codes/PRODUCT101.mdx`<br>`error-codes/PRODUCT111.mdx`<br>`error-codes/PRODUCT201.mdx`<br>`error-codes/PRODUCT301.mdx`<br>`error-codes/PRODUCT321.mdx`<br>`error-codes/PRODUCT401.mdx`<br>`error-codes/PRODUCT411.mdx`<br>`error-codes/PRODUCT421.mdx`<br>`error-codes/PRODUCT999.mdx` | Fine | D7,D8 | Product/search/stock/barcode error remedies remain valid; barcode scanners are not removed magnetic payment readers. | M |
| `error-codes/PY01001.mdx`<br>`error-codes/PY01002.mdx`<br>`error-codes/PY01003.mdx`<br>`error-codes/PY01004.mdx`<br>`error-codes/PY02001.mdx`<br>`error-codes/PY02002.mdx`<br>`error-codes/py.mdx` | Fine | D2,D5,D11* | Retained pre-1.10 payment-code reference, including conditional split wording; do not recast historical codes as new native-tender instructions. | M |
| `error-codes/REGISTER101.mdx`<br>`error-codes/REGISTER111.mdx`<br>`error-codes/REGISTER201.mdx`<br>`error-codes/REGISTER211.mdx`<br>`error-codes/REGISTER221.mdx`<br>`error-codes/REGISTER301.mdx` | Fine | D3 | REGISTER101/111/201/211/221/301 already describe refused movements, reversals, open/count conflicts and manager approval on the new register panel. | H |
| `error-codes/SY01001.mdx`<br>`error-codes/SY01002.mdx`<br>`error-codes/SY01003.mdx`<br>`error-codes/SY02001.mdx`<br>`error-codes/SY02002.mdx`<br>`error-codes/sy.mdx` | Fine | — | Retained pre-1.10 resource/system-code reference is unaffected by D1–D11. | M |
| `error-codes/SYNC101.mdx`<br>`error-codes/SYNC111.mdx`<br>`error-codes/SYNC121.mdx`<br>`error-codes/SYNC131.mdx`<br>`error-codes/SYNC141.mdx`<br>`error-codes/SYNC151.mdx`<br>`error-codes/SYNC161.mdx`<br>`error-codes/SYNC171.mdx`<br>`error-codes/SYNC181.mdx`<br>`error-codes/SYNC201.mdx`<br>`error-codes/SYNC211.mdx`<br>`error-codes/SYNC221.mdx`<br>`error-codes/SYNC301.mdx`<br>`error-codes/SYNC311.mdx`<br>`error-codes/SYNC321.mdx`<br>`error-codes/SYNC331.mdx`<br>`error-codes/SYNC341.mdx`<br>`error-codes/SYNC401.mdx`<br>`error-codes/SYNC411.mdx`<br>`error-codes/SYNC999.mdx` | Fine | D8 | Sync/storage recovery remains applicable; SYNC341 already distinguishes newer server protocol from an old app, without a hardcoded obsolete minimum. | M |
| `error-codes/index.mdx` | Amend | D3,D4 | Already lists REGISTER and deliberately retains historical codes; add the missing DISPLAY domain and links to register/display guides. | H |

## New pages needed

Proposed inbound links below must be added; they do not exist yet. Existing gateway, discount and architecture pages should be amended rather than duplicated.

| Proposed page | Corpus | Purpose | Linked from |
|---|---|---|---|
| `support/registers.md` | Wiki | D3/D9: Free register/admin setup, opening float, movements, close/count/variance, X/Z/CSV and recovery. | `support/index.md`; `support/orders-receipts/reports-and-till.md` |
| `support/customer-display.md` | Wiki | D4: Pro pairing, Ledger/Pocket/Marquee choice and troubleshooting; reuse existing architecture contracts. | `support/index.md`; `support/hardware.md` |
| `support/pos-layout.md` | Wiki | D1/D2/D7: register bar, adaptive panels, configurable columns/quick filters and tender-mode navigation. | `support/index.md`; `support/payments.md` |
| `registers/index.mdx` | Docs version-2.x | D3/D9: Free register administration and cashier open/close, cash movements, variance, X/Z and CSV walkthrough. | `pos/index.mdx`; `settings/wp-admin/index.mdx`; `reports/reconciliation.mdx` |
| `customer-display/index.mdx` | Docs version-2.x | D4: Pro eligibility, pairing, Ledger/Pocket/Marquee templates and DISPLAY101 recovery. | `getting-started/free-vs-pro.mdx`; `hardware/index.mdx`; `settings/store/index.mdx` |
| `payment/split-payments.mdx` | Docs version-2.x | D11*: multiple tenders, remaining balance, resumption/void/refund precautions and Legacy restrictions; confirm release inclusion. | `pos/checkout/index.mdx`; `payment/index.mdx`; `orders/refunds.mdx` |

## Top 10 riskiest pages

1. **Wiki `support/payments.md`** — universal iframe, unsupported splits and Pro coupons would make the support answerer explain the wrong checkout and entitlement.
2. **Docs `pos/checkout/index.mdx`** — the central first-payment walkthrough teaches a removed default screen/modal rather than tender mode; qualify the retained Legacy path.
3. **Wiki `support/payments/checkout-troubleshooting.md`** — iframe-first diagnosis and old partial-payment workarounds can send a cashier down the wrong recovery path after money moved.
4. **Wiki `support/payments/discounts-and-coupons.md`** — explicitly recommends negative Add Fee and Pro-only coupons, both contradicted by D6/D9.
5. **Docs `pos/cart/discounts.mdx`** — merchant-facing negative-fee recipe and obsolete tax/discount explanation directly affect sale totals.
6. **Wiki `support/orders-receipts/reports-and-till.md`** — denies managed sessions and CSV, prescribes manual close, and overpromises Analytics equality.
7. **Docs `reports/reconciliation.mdx`** — manual-only float/drop/count/variance guidance omits the shipped Free cash-management record.
8. **Docs `pos/cart/open-orders.mdx`** — void/park instructions need to distinguish an unpaid cart from an order already holding tender money.
9. **Docs `getting-started/free-vs-pro.mdx`** — coupon/register gates and missing Pro display guidance can produce the wrong purchasing decision.
10. **Docs `getting-started/installation.mdx`** — WooCommerce 5.3 and missing paired-plugin requirements would send merchants toward an incompatible installation.

## Verification and remaining limits

- **PASS — inventory coverage:** all 454 eligible wiki pages and all 280 public pages classified exactly once; class/confidence values and grouped-error membership checked against enumerated files.
- **PASS — output scope:** only `impact-inventory.md` was written by this investigation; no repository modification commands were used.
- **NOT VERIFIED — authoritative release scope:** #195, linked issues, open catch-up PRs, final shipped UI, screenshots, terminal hardware, and runtime compatibility. Resolve the D1/D2 overstatements and confirm D11 before publishing changes.
- **Accepted triage risk:** body-excerpt review can miss isolated instructions/images; M is not a claim of exhaustive correctness. Older stale 1.9/1.10 caveats are not automatically charged to this release.

## Behavior changes / regressions

None introduced: this is a read-only investigation plus one report. The listed deltas are documentation impacts, not newly observed runtime regressions. No performance or broad compatibility claim was tested. One independent bounded logic-review round returned CLEAN; a separate D1-only scope check removed five over-scoped architecture amendments.
