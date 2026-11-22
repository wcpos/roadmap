# Till settings inventory

**Research note, 2026-11-22, for [#604](https://github.com/wcpos/roadmap/issues/604)** (map [#599](https://github.com/wcpos/roadmap/issues/599), release [#452](https://github.com/wcpos/roadmap/issues/452)).

**The question:** which till settings exist, where is each one stored, and what already carries shared configuration from the store to every till? This note records facts only. It proposes no design.

**Commits read** (clean checkouts of `main`, read only; nothing was built or run):

| Prefix | Repo | Commit |
|---|---|---|
| `app:` | monorepo-v2 | `a6526a5b4ff7fb476a0e221cfa33672acac2dbe1` |
| `free:` | woocommerce-pos | `a46ec86887e5f46d57542e8baf6f270c5678d22a` |
| `pro:` | woocommerce-pos-pro | `a23ceffcc739f6217b72b05abf697a352c8c4db5` |

Paths are relative to each repo's root.

**Labels:**
- **Observed**: I read the code.
- **Inferred**: my reading of code I read.
- **Unverified**: I could not confirm it.

---

## 0. Bottom line

1. **Until now, "per user per device" was not precise.** The keying is per **install, site, cashier and store**.
   - The store record's `localID` is the first 10 hex characters of SHA-256 over `{user, siteID, wpCredentialsID, storeID}` (`app:packages/query/src/user-db/stores.ts:15-31`).
   - `user` is the install's single local "Global User" (`app:packages/query/src/user-db/hydration.ts:33-36`).
   - Each `localID` opens its own database, `store_<gen>_<localID>` (`app:packages/query/src/user-db/session.ts:43`, `app:packages/database/src/database-names.ts:65`).
   - So two cashiers on one till each get their own copy of every UI setting, the theme, the scanner tuning, the printer profiles and the remembered card readers. **Observed.**
2. **Two settings are keyed below the cashier.**
   - The **register binding** is per install, site and store, not per cashier: the user-DB local doc `register`, `sites[siteUuid].bindings[storeId]` (`app:packages/query/src/register-session/register-document.ts:48-68, 101-102`).
   - The **till identity** is per install (`app:packages/database/src/till-anchor-key.ts:7`, `till-anchor.web.ts:13`).
   - **Observed.**
3. **No setting is stored per register.** **Observed** by grep.
4. **The app reads no till behaviour setting from the server's settings routes.**
   - Its only call to a settings route is `/settings/cloud-print`.
   - Store-wide values reach the till as **fields on the store record**, which arrives inside the cashier response, in the boot payload of the browser build that WordPress serves, or through a manual "Restore".
   - **Observed** (grep over `app:packages`, `app:apps`).
5. **Today no server value reaches any setting in the UI-settings documents.**
   - These documents hold `autoShowReceipt`, `autoPrintReceipt`, `quickDiscounts`, the columns and the layout.
   - Their defaults come only from the bundled `initial-settings.json` (`app:packages/core/src/screens/main/contexts/ui-settings/utils.ts:44-75`). **Observed.**
6. **Three working cases of "server default, local or narrower override" exist already** (section 5):
   - Pro store register rules over site rules, with a "use site default" reset.
   - The card reader, where the server sets a default and a lock and the till remembers its own reader unless the lock is on.
   - The in-app store fields: the server value applies on first sight, then the device edit wins until "Restore server settings".
   - **Observed.**

---

## 1. The inventory

**Column key:**
- **SR** (store record) means keyed per install × site × cashier × store, as defined in §0.1.
- **UIS** means a UI-settings RxState doc `<id>_v2` in the store DB (`app:packages/core/src/screens/main/contexts/ui-settings/provider.tsx:68,83`). The defaults are at `app:…/ui-settings/initial-settings.json`.
- `stores.*` means the user-DB `stores` document (`app:packages/database/src/collections/schemas/stores.ts`).

### 1a. UI settings documents: receipt, cart, products and list screens

All rows are keyed on SR. **Observed.**

| Setting | What it does | Stored | Edited in the app |
|---|---|---|---|
| `pos-cart.autoShowReceipt` (default `true`, json:156) | Shows the receipt stage after checkout | UIS `pos-cart_v2` | Cart header settings form, `app:packages/core/src/screens/main/pos/cart/ui-settings-form.tsx:147` (mounted `cart-header.tsx:152-157`). Read at `pos/checkout/sale-completion.ts:354,371,497`, `tender/use-tender-flow.ts:763,768,1448`, `tender/tender-checkout.tsx:121`, `hooks/use-complete-order-flow.ts:58`, `pay-page/use-settle-gateway-snapshot.ts:73,77`, `pos/register-panel-entries.ts:37` |
| `pos-cart.autoPrintReceipt` (default `false`, json:157) | Prints the receipt after checkout without a dialog | UIS `pos-cart_v2` | `pos/cart/ui-settings-form.tsx:158`. Read at `receipt/use-receipt-document.ts:528,544,551,645`, `sale-completion.ts:353`, `use-tender-flow.ts:1452`, `receipt-stage/receipt-stage.tsx:239` |
| `pos-cart.quickDiscounts` (default `[5,10,15]`, json:160) | Up to three preset discount percentages on the price cells | UIS `pos-cart_v2` | `pos/cart/ui-settings-form.tsx:135`. Read at `pos/cart/cells/price.tsx:59`, `regular_price.tsx:52` |
| `pos-cart.receiptOutputType` (json:158), `pos-cart.openCashDrawer` (json:159) | **Nothing.** Neither has a control or a reader. The drawer is actually driven by `printer_profiles.autoOpenDrawer` (§1c) | UIS | None. Grep finds only `initial-settings.json`; the label test notes the two keys as unlabelled (`…/ui-settings/use-ui-label.test.ts:13-25`) |
| `pos-cart.position`, `openOrdersPosition`, `sortLines`, `sortBy`, `sortDirection`, `columns` (json:151-242) | Cart side, open-orders strip, line order, cart columns | UIS | `pos/cart/ui-settings-form.tsx:87,102,117`. Columns are edited through display options |
| `pos-products.*` (json:2-148): `viewMode`, `gridColumns`, `gridFields`, `browseBy`, `showOutOfStock`, `sortBy`, `sortDirection`, `variationsStyle`, `filterBar`, `metaDataKeys`, `width`, `scannerHeight`, `columns` | The product grid or table on the sell screen: what shows, the order, how variations open, which meta keys show | UIS `pos-products_v2` | `pos/products/ui-settings-form.tsx:114-263` (mounted `pos/products/index.tsx:590-595`). `width` and `scannerHeight` are panel sizes set by dragging (Inferred) |
| `products`, `orders`, `coupons`, `customers` (json:244-622) | Sort and column choice on each list screen | UIS | `app:packages/core/src/screens/main/components/display-options.tsx:28-37` (used in `orders/index.tsx:283`, `customers/index.tsx:182`, `coupons/index.tsx:211`); `products/products.tsx:526` |
| `reports-orders` (json:623) | Sort and columns of the Reports order list | UIS | No edit control found under `screens/main/reports` (grep). Read at `reports/index.tsx:290` |

### 1b. Settings screen (Settings › General, Tax, Theme, Barcode scanning)

- Navigation: `app:apps/main/components/area-navigation/settings.ts:8-42`. The sections are General, Tax, Printing, Card readers, Customer display, Barcode scanning and Theme.
- Every field saves on change.
- All rows are keyed on SR. **Observed.**

| Setting | What it does | Stored | Edited at |
|---|---|---|---|
| Store name | The store name shown in the app | `stores.name` (`stores.ts:19`) | `app:packages/core/src/screens/main/settings/general.tsx:238-246` |
| Language | UI language; empty follows the system | `stores.locale` (`stores.ts:341`) | `general.tsx:284-297`; read `hooks/use-locale/index.ts:62-77` |
| Default customer / default customer is cashier | Customer preset on a new cart | `stores.default_customer`, `default_customer_is_cashier` (`stores.ts:109-118`) | `general.tsx:298-330` |
| Currency, position, decimal and thousand separators, decimals | Money formatting | `stores.currency` … `price_num_decimals` (`stores.ts:174-231`) | `general.tsx:334-389` |
| Thousands group style | Thousand, lakh or wan grouping | `stores.thousands_group_style` (`stores.ts:195`). Not server-owned | `general.tsx:390-404` |
| Restore server settings | Re-applies the server values of the in-app editable fields | writes `stores` | `general.tsx:203-228, 407-413` |
| Base address rows | Read-only, "Set in WooCommerce" | `stores.store_*` | `general.tsx:247-280` |
| Tax based on; total, shop and cart display; price suffix | How the till shows and bases tax | `stores.tax_*`, `price_display_suffix` | `settings/tax.tsx:142,188,197,206,218` |
| Enable taxes, prices include tax, shipping tax class, rounding | Read-only | `stores.*`, auto-synced | `tax.tsx:156-177` |
| Barcode: average-time threshold, min length, prefix, suffix | Keyboard-wedge scan detection | `stores.barcode_scanning_*` (`stores.ts:549-566`) | `settings/barcode-scanning/settings.tsx:168-208` |
| Scan sound and haptics: on/off, theme, volume, success, failure | Feedback on each scan | `stores.barcode_scanning_sound_*` (`stores.ts:567-601`) | `barcode-scanning/settings.tsx:218-337` |
| Scanner profiles (direct-connected scanners) | Pairs a scanner with this till | store DB `scanner_profiles`, PK `deviceKey` (`app:packages/database/src/collections/schemas/scanner-profiles.ts:16-63`) | `barcode-scanning/input-sources.tsx:192,270` |
| Theme | One of 10 themes, including follow-system | `stores.theme` (`stores.ts:602`) | `settings/theme.tsx:512` |
| Scale / density | auto, compact, regular or spacious | `stores.scale` (`stores.ts:608`) | `theme.tsx:158,181` |
| Icons, fonts | Icon family and type set | `stores.icons`, `stores.fonts` (`stores.ts:616-631`) | `theme.tsx:257,354` |
| Sync cadence | Check interval and pull batch size | `stores.sync_check_interval_ms`, `sync_pull_batch_size` (`stores.ts:203-219`) | Health › Performance, `app:apps/main/components/health/performance-screen.tsx:122,175` |

### 1c. Hardware: printers, drawer, card readers, customer display

| Setting | What it does | Stored | Keyed on | Label |
|---|---|---|---|---|
| Printer profiles: connection, vendor, address, port, language, columns, print mode, raster, auto-cut, default, name | One printer the till can print to | store DB `printer_profiles` (`app:packages/database/src/collections/schemas/printer-profiles.ts:7-100`); edited in `settings/printer/setup/printer-setup-dialog.tsx:479-602` | SR | Observed |
| Cash drawer: auto-open after print, drawer pin | Kicks the drawer through the printer | `printer_profiles.autoOpenDrawer`, `drawerConnector` (`app:packages/query/src/commands/printer-profiles.ts:76-85`) | SR, per printer | Observed |
| Printer code page | Encoder code page | Sent to `printer_profiles` (`settings/printer/profile-config.ts:101`) but not declared in its schema | SR | Unverified that it persists |
| Template → printer routing | Sends a template to a chosen printer, or Auto | store DB `template_printer_overrides` (`schemas/template-printer-overrides.ts:6-19`); edited `settings/printing/index.tsx:197-244` | SR | Observed |
| Web printer device handle | Reconnects a WebUSB or Web Bluetooth printer | localStorage `wcpos.webdevice.<key>` (`app:packages/printer/src/transport/web-device-store.ts:13-27`) | browser origin | Observed |
| Remembered card reader, per payment method | The reader this till pays with; Forget removes it | store DB RxState `terminal-readers_v2` (`app:packages/query/src/store-local/remembered-readers.ts:13,40-55`); edited `settings/card-readers/use-reader-actions.ts:132,176`, and saved at checkout `pos/checkout/tender/remembered-readers.ts:66-72` | SR × method | Observed |
| Customer display pairing | Pairs or forgets a customer display | **Server**: `POST /pairings {device_id, store_id}`, `DELETE /displays/:id` (`app:packages/core/src/services/customer-display/signaling-client.ts:38-70`); edited `settings/customer-display/index.tsx:73-84` | install device id × store | Observed |

### 1d. Till binding and other device state

| Setting | What it does | Stored | Keyed on | Label |
|---|---|---|---|---|
| Register binding | Which register this till sells on | user DB local doc `register`, `sites[siteUuid].bindings[storeId]` (`register-document.ts:48-68`); picked at `app:packages/core/src/screens/main/pos/cart/register-picker.tsx:39,55`, auto-bound when the store has only one register (`app:packages/core/src/services/register/use-register-binding.ts:230`) | install × site × store (**not cashier**) | Observed |
| Till identity and sale counter | Till id, `Register XXXX`, counter | `register` local doc, plus an anchor: localStorage `wcpos.tillId` on web and Electron, a file on native (`till-anchor-key.ts:7`, `till-anchor.web.ts:13`, `till-anchor.ts:26`) | install | Observed |
| Last session | Which site, cashier and store reopen at boot | user DB RxState `v2.current` (`app:packages/query/src/user-db/state.ts:29`) | install | Observed |
| Verbose diagnostics | Verbose logging for 24 hours | localStorage `wcpos_verbose_diagnostics` (`app:packages/utils/src/logger/index.ts:625-660`); toggled at `screens/main/logs/index.tsx:123,148` | origin | Observed |
| Log level | No UI; set only from the console | localStorage `wcpos_log_level` (`logger/index.ts:613-621`) | origin | Observed |

### 1e. Not settable in the app

| Item | Fact | Label |
|---|---|---|
| Keyboard shortcuts | Fixed Alt-chords, never saved (`app:packages/core/src/extensions/hotkeys/bindings.ts:7-17`) | Observed |
| Notifications | No user setting found | Observed |
| Receipt template set (Pro) | Server-owned `stores.active_templates` (`stores.ts:659`). The one-off pick in the receipt view lives in React state only (`receipt/hooks/use-template-renderer.ts:271-286`) | Observed |
| Telemetry consent | Server-owned `stores.tracking_consent` (`stores.ts:119`) | Observed |

**Storage libraries.** No AsyncStorage, MMKV, electron-store or expo-secure-store dependency exists in any `package.json` (Observed). Electron's main-process code is not in this repo, so preferences held there were not checked (Unverified).

---

## 2. About the store or about the device or person: an observation per setting

The judgements here are **Inferred**. They say only whether a single store-wide value would be meaningful, with the reason; none is a ruling.

| Setting | A store-wide value is meaningful? | Why (observation) |
|---|---|---|
| `autoShowReceipt`, `autoPrintReceipt` | Yes | They describe the checkout flow, not the hardware. The merchant in #452 asked for exactly this one. `autoPrintReceipt` only works when the till has a printer, so it depends on the device. |
| `quickDiscounts` | Yes | Preset discount amounts are pricing policy. |
| `receiptOutputType`, `openCashDrawer` | n/a | Nothing reads them (§1a). |
| Cart side, open-orders position, line sort | Maybe | Layout preference, but a store may want every till to look alike for training. |
| Product grid and list columns, sorts, filter bar, variations style, meta keys | Maybe | Layout preference. `gridFields.cost_of_goods_sold` and the `cost_of_goods_sold` columns touch the hidden-cost question in #595, which is a permission matter, not a layout one. |
| Panel `width`, `scannerHeight` | No | They follow the screen size of the device. |
| Language | Maybe | It can describe the person or the shop floor. The server already has a store `locale` (Pro `_locale`). |
| Default customer / customer is cashier | Yes | The server already holds it (free general settings), and it is copied on first sight. |
| Currency and number formatting, tax display and tax basis | Yes | The server already owns these, and Pro stores carry currency and locale. They are editable on the device only as a local override. |
| Thousands group style | Yes | Formatting convention of the shop's region. Today it has no server value. |
| Barcode timing, prefix, suffix | Mostly no | They depend on the scanner model. A prefix or suffix could be the same across a fleet of identical scanners. |
| Scan sound and haptics | Maybe | Shop-floor policy or a personal preference. |
| Scanner profiles, printer profiles, printer address, web device handle | No | They identify hardware attached to one device. |
| Template → printer routing | No (as stored) | It names device-local printer ids. Server Cloud Print assignments are a separate store-level rule list (§4). |
| Cash drawer auto-open | Partly | The physical pin is hardware. Whether to open after a sale is policy, but it is stored on the printer profile. |
| Remembered card reader | No for the pick, yes for the policy | The server already holds the store side: `default_reader`, `allowed_readers` and `lock_to_default` (§5). |
| Customer display pairing | No | Device pairing; already on the server. |
| Theme, scale, icons, fonts | Maybe | Personal or device readability; a store may want brand uniformity. Scale relates to the screen size. |
| Sync cadence | No | Device and network tuning. |
| Register binding, till identity | No | These identify the device. |
| Verbose diagnostics, log level | No | Support tooling. |

---

## 3. Existing carriers: configuration the app reads from the server

| Carrier | Server source | How it reaches the till | Freshness | Survives offline | Label |
|---|---|---|---|---|---|
| **Site record** (`sites`) | `free:includes/API/V2/Site.php:48-90` (`GET wcpos/v2/site`), the REST index with `?wcpos=1` (`free:includes/API.php:304-333`). Pro adds `license` and its version (`pro:includes/API.php:48-73`) | At connect (`app:packages/core/src/screens/auth/hooks/use-api-discovery.ts:224-241`). On each signed-in mount, `useSiteInfo` patches versions, license and `search_meta_keys` (`app:packages/query/src/user-db/sites.ts:245-279`) | Mount only. No poll, no ETag (`app:packages/core/src/hooks/use-site-info.ts:36-121`) | User DB | Observed; offline Inferred |
| **Cashier record** (`wp_credentials`) | `free:includes/API/V1/Cashier.php:173-199`, built by `free:includes/Services/Cashier.php:72-109`. Carries roles, effective `capabilities` (`free:includes/Services/Settings/Access_Section.php:74-104`) and `stores[]` | `useUserValidation` on signed-in mount (`app:packages/core/src/hooks/use-user-validation.ts:192-218`) → `recordCashierProfile` (`app:packages/query/src/user-db/credentials.ts:172-280`) | Re-fetched when the user or access-token key changes (`use-user-validation.ts:138-148`). No poll | User DB; an offline failure keeps the stored copy (`use-user-validation.ts:351-372`) | Observed; offline Inferred |
| **Store record** (`stores`) | Free: one store built from WP/WC options and the WCPOS general settings (`free:includes/Abstracts/Store.php:98-189`). Pro: the `wcpos_store` post type through `wcpos_get_stores` (`pro:includes/Services/Stores.php:64,129`), meta at `pro:includes/Abstracts/Store.php:656-737` | Inside the cashier response's `stores[]`: new stores are inserted whole; existing ones get only `AUTO_SYNCED_STORE_FIELDS` (`app:packages/query/src/user-db/stores.ts:131-207, 212-303`). `APP_EDITABLE_STORE_FIELDS` (`app:packages/database/src/collections/schemas/stores.ts:747-771`) change only through "Restore server settings" (`GET stores/{id}`, `settings/general.tsx:202-224`) | Same as the cashier record. The config fingerprint does **not** cover store fields | User DB | Observed; offline Inferred |
| **Register record** | `free:includes/API/V2/Registers_Controller.php:38-63, 421-470`: id, name, store_id, default_float, session, last_closure. Pro swaps in a multi-register repository (`pro:includes/Registers.php:105`) | `GET registers?store_id=` and `GET registers/{id}` (`app:packages/core/src/services/register/use-register-binding.ts:111,178`) | On session start, on store switch and when going back online (`use-register-binding.ts:257-273`). No interval | Only the bound pointer, the name and the live session persist (`register-document.ts:323-350`); the list stays in memory | Observed |
| **Embedded boot payload** (browser build served by WordPress) | `free:includes/Templates/Frontend.php:252-353` prints `initialProps` {site, wp_credentials, stores}. Pro adds `site.license` and per-store `display` (`pro:includes/Templates.php:91-103`, `pro:includes/Services/Customer_Display.php:51`) | `applyEmbeddedBootPayload` (`app:packages/core/src/contexts/app-state/hydration-steps.ts:133-227`, `app:packages/query/src/user-db/hydration.ts:42-120`). Native and Electron get `{}` (`initial-props.ts:8`) | Every `/pos/` page load | Merged into the user DB | Observed |
| **Settings route** | `free:includes/API/V1/Settings.php:117-205, 384-410`: `wcpos/v2/settings` plus one route per section | The app calls only `/settings/cloud-print` (`app:packages/core/src/screens/main/settings/printer/use-available-printer-profiles.ts:45`). General-section values reach the till only as store-record fields (`free:includes/Abstracts/Store.php:175-189`) | On mount (Inferred) | Not traced | Observed (grep) |
| **Tax classes, shipping methods, order statuses, payment-methods descriptor** | `/taxes/classes`, `/shipping_methods`, `/data/order_statuses`, `wcpos/v2/payment-methods` (`free:includes/API/V2/Payment_Methods_Controller.php:37`) | `ExtraDataProvider` (`app:packages/core/src/screens/main/contexts/extra-data/provider.tsx:48-117`) | Fetched when missing, and on every `config-changed` engine event. The payment descriptor is fetched on every start | Store DB state `data_v2` | Observed |
| **Templates** | `free:includes/API/V1/Templates_Controller.php:72` | `syncTemplates` (`app:packages/query/src/store-local/templates-sync.ts:36-129`), run when the receipt renderer or Printing settings mounts | On mount | Store DB `templates` | Observed |
| **Tax rates** | `wcpos/v2/taxes` | Sync-engine collection (`app:packages/sync-engine/src/collections/collection-descriptors.ts:764-770`) | Change-signal poll every `sync_check_interval_ms` (default 60 s) | Engine scope DB `pos_v<n>_…`, not the Store DB (`app:packages/sync-engine/src/create-rxdb-sync-engine.ts:984-996`) | Observed |
| **Config fingerprint** | `free:includes/API/V2/Changes_Controller.php:151-199`; hashes only `barcode_field` and the payload contract versions (`free:includes/Sync/Config_Fingerprint.php:197-230`) | Polled with `If-None-Match` on each change-signal tick (`app:packages/sync-engine/src/change-signal/config-fingerprint-source.ts:112-139`); a change emits `config-changed` | **The only server-side change detection for configuration** | Baseline persisted (`change-signal-state-schema.ts:1-11`) | Observed |
| **Server features** | `GET wcpos/v2/status` → `capabilities` | `app:packages/core/src/screens/main/hooks/use-server-feature.ts:11-31` | Once per site per session | Memory only | Observed |

**Store-record fields that already act as store-wide till behaviour** (schema Observed; behaviour Inferred):
- Register rules: `register_sessions`, `variance_threshold`, `expected_close_time`.
- Stock and quantity: `prevent_overselling`, `decimal_qty`.
- Default customer: `default_customer`, `default_customer_is_cashier`.
- Tax and price display: `calc_taxes`, `prices_include_tax`, `tax_round_at_subtotal`, `tax_display_*`, `tax_total_display`, `price_display_suffix`.
- Coupons and discounts: `enable_coupons`, `calc_discounts_sequentially`.
- Receipt content: `receipt_i18n`, `policies_and_conditions`, `footer_imprint`, `tax_ids`, `opening_hours`.
- Other: `tracking_consent`, and `display` (Pro customer display).

**What the store record does not carry** (Observed):
- No receipt behaviour (show or print after checkout).
- No quick discounts.
- No layout.
- No cash-rounding field.

**Inconsistencies found along the way** (Observed):
- No server code in Free or Pro emits the app's `stores.active_templates`. Pro's admin response has `active_receipt_templates`, `active_report_templates` and `active_closure_templates` instead (`pro:includes/API/V1/Stores.php:544-547`).
- App comments say the inline boot props "never carry `display`" (`app:packages/query/src/user-db/stores.ts:179-181`), but Pro's `wcpos_inline_vars` filter now adds it.

---

## 4. Server-side settings UI today (WP Admin)

**Free › POS › Settings** is a React app (`free:includes/Admin/Menu.php:141-150`). Its routes are listed at `free:packages/settings/src/router.tsx:43-120`. Each section is one wp_options row, `woocommerce_pos_settings_<id>` (`free:includes/Services/Settings/Abstract_Section.php:119-121`). It is read as the defaults merged with the saved values and then passed through the filter `wcpos_<id>_settings` (`:177-200`). All Observed.

| Screen | Shared settings edited there | Reaches the till? |
|---|---|---|
| General | Store name, phone, email, policies, tax IDs | As store fields (`free:includes/Abstracts/Store.php:534-544`) |
| General | `register_sessions`, `variance_threshold`, `expected_close_time` | As store fields |
| General | `decimal_qty` | As a store field |
| General | `default_customer`, `default_customer_is_cashier` | As store fields |
| General | `tracking_consent` | As a store field |
| General | `pos_only_products`, `restore_stock_on_delete`, `barcode_field`, `generate_username`, `force_ssl`, storefront receipt | Server-side. `barcode_field` also reaches the till through the config fingerprint |
| Checkout | `prevent_overselling` | As a store field |
| Checkout | Email toggles | Server only |
| Checkout | `receipt_default_mode` (fiscal or live; `free:includes/Services/Settings/Checkout_Section.php:27`) | Server only (`free:includes/Services/Receipt_Mode.php:17-23`). I found no admin control for it |
| Checkout › Gateways | Enabled, order, title, description, order status, rounding increment, default gateway (`free:includes/Services/Settings/Payment_Gateways_Section.php:37-54`) | Through the payments descriptor (Inferred) |
| Gateways | Per-gateway `default_reader`, `allowed_readers`, `lock_to_default` (`Payment_Gateways_Section.php:250-255`) | Yes (`app:…/pos/checkout/tender/tiles.ts:54-91`). No editor found in these three repos; it may live on the terminal extensions' gateway pages (Unverified) |
| Cloud Print | Printers and assignments (`printer_id`, `store_id`, `scope`, `template_id`, `copies`, `trigger`; `free:includes/Services/Settings/Cloud_Print_Section.php:52-56, 424-433`) | Through `/settings/cloud-print` |
| Access | Roles × capabilities. Writes WP roles, not an option (`Access_Section.php:130-182, 321-323`) | As effective `capabilities` on the cashier record |
| Templates (separate page) | Live template per type, order, disabled built-ins (`free:includes/Templates.php:814, 880, 922`) | Through the templates sync |

With Pro active, the store-details and register blocks on General are swapped for Pro components. The register block is labelled "site defaults" (`pro:packages/settings/src/index.tsx:9-11`, `pro:packages/settings/src/general-register-section.tsx:77`). Observed.

**Pro store edit screen.** The store is the `wcpos_store` post type (`pro:includes/Services/Stores.php:24`). The editor is the React page `wcpos-store-edit` (`pro:includes/Admin/Stores/Edit_Store.php:30,75`). Its pages are Details, Opening hours, Currency, Tax, Receipts, Display, Registers and Staff (`pro:packages/store-edit/src/pages.ts:5-8`). Values are saved as post meta through `pro:includes/API/V1/Stores.php:340-466`. Observed.

| Page | Fields |
|---|---|
| Details | name, logo, `use_site_logo`, address, phone, email, url |
| Currency | `currency`, `currency_pos`, `locale`, `timezone` |
| Opening hours | hours, notes |
| Tax | `tax_address`, `tax_ids`; tax rates shown read-only |
| Receipts | `personal_notes`, `policies_conditions`, `footer_imprint`, `active_receipt_templates` |
| Display | `active_display_template` |
| Registers | register list (name, `default_float`, move to another store; `_wcpos_register_<uuid>` meta, `pro:includes/Services/Meta_Register_Repository.php:16-23`); `register_sessions`, `variance_threshold`, `expected_close_time`; closure and report templates |
| Staff | `authorized_users`; empty means everyone (`pro:includes/Services/Stores.php:249-252`) |

**Registers.**
- Free holds one register in the `wcpos_register` option, with only `name` and `default_float` (`free:includes/Services/Option_Register_Repository.php:13-20`).
- Free has no register screen beyond the opening float on General (`free:packages/settings/src/screens/general/register-section.tsx:95-101`).
- No per-register setting exists in either plugin.
- Observed.

**Cashier profile.** Neither plugin adds user-profile fields (no `show_user_profile` or `edit_user_profile` hook found by grep). Observed.

---

## 5. Prior art for "server default, local override"

| # | Where | Precedence | Label |
|---|---|---|---|
| 1 | **Pro store register rules over the site rules** | Store meta wins whenever its row exists, even when empty or off; otherwise the site value applies (`pro:includes/Abstracts/Store.php:274-291`). The API returns `{site, store, value}` per rule (`:311-317`). Saving `null` deletes the row and restores inheritance (`pro:includes/API/V1/Stores.php:348-356`). The UI shows "Site default" or a "Use site default" button per rule, plus reset all (`pro:packages/store-edit/src/components/cash-drawer-rules.tsx:26-36, 80-81`) | Observed |
| 2 | **Card reader: server default, till memory, server lock** | The server sets `default_reader`, `allowed_readers` and `lock_to_default` per gateway. The till's remembered reader wins over the default unless the lock is on: `initialReaderId`, "The till's last confirmed choice wins unless the store has locked its default" (`app:packages/core/src/screens/main/pos/checkout/tender/tiles.ts:75-91`). The server enforces the same rule: the lock forces the default, and a reader outside the allowed list gets a 403 (`pro:includes/Payments/Server/Reader_Curation.php:24-31, 112-123`). **The only case found where a server flag decides whether a till's own value may stand.** | Observed |
| 3 | **In-app store fields** | The full server payload is applied when the store doc is first created (`app:packages/query/src/user-db/stores.ts:269-287`). After that, `APP_EDITABLE_STORE_FIELDS` "must not auto-sync — a login must never revert an in-app edit" (`app:packages/database/src/collections/schemas/stores.ts:743-771`). A later server change to one of these fields therefore does not reach an existing till until someone taps "Restore server settings". Restore is all or nothing, with no per-field marker (`settings/general.tsx:203-226`) | Observed; the consequence for later server changes is Inferred |
| 4 | **Free store details** | Own setting → WooCommerce store options → WordPress values (`free:includes/Services/Store_Defaults.php:18-50, 94-119`). The fallbacks are shown as placeholders in the admin form | Observed |
| 5 | **Pro store currency, currency position, locale, tax IDs, logo** | Store meta, when not empty, wins over WooCommerce/WordPress or the Free values (`pro:includes/Abstracts/Store.php:677-691, 497-512`; `free:includes/Services/Store_Logo_Resolver.php:29-45`). Phone, email, url and timezone do **not** fall back (`pro:includes/Abstracts/Store.php:667-669, 732-737`). Tax and price display have no store override; they come from WooCommerce (`free:includes/Abstracts/Store.php:144-156`) | Observed |
| 6 | **Templates per store** | The store's ordered list intersected with the site's enabled list; if empty, the site list (`free:includes/Templates.php:1009-1066`). The app filters to `stores.active_templates` and falls back to all (`app:packages/core/src/screens/main/receipt/hooks/use-active-templates.ts:40-72`); see the `active_templates` gap in §3 | Observed |
| 7 | **Customer display template** | The store's pick if still enabled, else the global Live template (`pro:includes/Services/Customer_Display.php:357-392`) | Observed |
| 8 | **Printer per template** | A printer picked at print time → the device's `template_printer_overrides` → auto-match by paper width or output type (`app:packages/printer/src/resolve-printer.ts:24-57`). It has "no server counterpart" (`app:packages/query/src/commands/template-printer-overrides.ts:5-20`). How it interacts with server Cloud Print assignments was not evaluated | Observed |
| 9 | **Receipt mode** | A valid requested mode → the `receipt_default_mode` setting → `fiscal` (`free:includes/Services/Receipt_Mode.php:17-23`) | Observed |
| 10 | **UI settings** | Bundled `initial-settings.json` → saved local state. Missing keys are filled in; invalid enum values are reset; for columns, the bundled capability flags win and the user's `show` and order survive (`app:…/ui-settings/utils.ts:44-134`). **No server layer** | Observed |

**Not found** (grep, Observed):
- No per-register override of any store or site setting.
- No per-cashier setting on the server.
- No "cashier may change this" flag other than the reader `lock_to_default`.

---

## 6. Could not determine

- Whether the user DB persists on every platform storage (web OPFS or IndexedDB, Electron, native SQLite) across restarts. Every "survives offline" above is therefore Inferred.
- Electron main-process preferences: that code is not in this repo.
- Whether `printer_profiles.codePage` persists (not in the schema).
- Where `default_reader`, `allowed_readers` and `lock_to_default` are edited in WP Admin.
- On web, whether one user DB per origin means one per site (the app served by the plugin on each store domain) or one shared across sites (the hosted web app). This decides what "device" means on web.
- Whether the barcode selectors published by the config fingerprint survive a restart.
