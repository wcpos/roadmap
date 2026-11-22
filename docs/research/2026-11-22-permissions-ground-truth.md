# Permissions ground truth on `main`, 2026-11-22

**Research note for [roadmap#600](https://github.com/wcpos/roadmap/issues/600)**, part of the [cashier permissions map #599](https://github.com/wcpos/roadmap/issues/599). It re-takes the survey in [woocommerce-pos#2130](https://github.com/wcpos/woocommerce-pos/issues/2130), which was taken on 2026-10-05 at `04f7ff00`. Facts only. This note proposes no design.

**Commits read** (clean detached checkouts of `main`; read only, nothing built or run):

| Repo | Short | Full SHA | Date |
|---|---|---|---|
| Free plugin `woocommerce-pos` | `a46ec868` | `a46ec86887e5f46d57542e8baf6f270c5678d22a` | 2026-11-22 |
| Pro plugin `woocommerce-pos-pro` | `a23ceffc` | `a23ceffcc739f6217b72b05abf697a352c8c4db5` | 2026-11-21 |
| App `monorepo-v2` | `a6526a5b` | `a6526a5b4ff7fb476a0e221cfa33672acac2dbe1` | 2026-11-22 |

Citations are `path:line` at those commits. In this note, `free:` means `woocommerce-pos/` at `a46ec868`, `pro:` means `woocommerce-pos-pro/` at `a23ceffc`, and `app:` means `monorepo-v2/` at `a6526a5b`.

**Labels:**
- **Observed**: read in the code at that commit.
- **Inferred**: follows from code that was read, but the chain was not traced end to end.
- **Unverified**: not checked. For example, WooCommerce or WordPress core source was not opened.

---

## 0. What changed since the 2026-10-05 survey

| #2130 said (at `04f7ff00`) | On `main` now | Label |
|---|---|---|
| WCPOS-owned caps are `access_woocommerce_pos`, `manage_woocommerce_pos`, `*_wcpos_store*` | Four more ship: `manage_woocommerce_pos_cash`, `view_woocommerce_pos_reports`, `manage_woocommerce_pos_closures`, `reassign_woocommerce_pos_sales` (`free:includes/Services/Settings/Access_Section.php:136-143`). They were added in commit `8bab471b` (2026-09-12, woocommerce-pos#1960). | Observed |
| Caps "re-granted on every version bump" | An upgrade grants only names absent from the snapshot option `woocommerce_pos_role_caps_synced`, so a cap the merchant removed stays removed (`free:includes/Activator.php:120-139`). An explicit activation still re-grants every default. | Observed |
| Ownership keys on `post_author` | It now keys on `_pos_user` (`free:includes/Services/Permission_Rules.php:297-303`). woocommerce-pos#2131 landed this. | Observed |
| `pos_cashier` / `pos_store` are UI filters, not authorization | Still true for orders. Registers, sessions, closures, records and reports now have an enforced **store reach** seam (`free:includes/Services/Store_Reach.php:56-83`). | Observed |
| Pro `includes/Orders.php` adds a `_pos_store` scope param | Pro has no order-list query scoped by `_pos_store`. `pro:includes/Orders.php` now only answers the store-reassignment filter (`:30,49-64`). | Observed |
| A per-cap "introduced" marker is proposed | None exists (§1.4). | Observed |

---

## 1. Plugin vocabulary

### 1.1 WCPOS's own capabilities (Free)

| Capability | Default roles (`free:includes/Activator.php:1270-1327`) | Main checks | Label |
|---|---|---|---|
| `access_woocommerce_pos` | administrator, shop_manager, cashier (cashier gets it beside the list, `:1354,1369`) | global `wcpos/*` gate `free:includes/API.php:412-449`; sync `free:includes/Sync/Endpoint_Permissions.php:52`; most routes in §4 | Observed |
| `manage_woocommerce_pos` | administrator, shop_manager | settings `free:includes/API/V1/Settings.php:340,362,371`; register writes `free:includes/API/V2/Registers_Controller.php:77-80`; templates writes; logs; extensions; `free:includes/Admin/Menu.php:67` | Observed |
| `manage_woocommerce_pos_cash` | administrator, shop_manager, cashier | every `POST` under `/sessions` (`free:includes/API/V2/Sessions_Controller.php:71`); `POST /closures` (`free:includes/API/V2/Closures_Controller.php:78`); closure print (`free:includes/API/V1/Receipts_Controller.php:402`) | Observed |
| `view_woocommerce_pos_reports` | administrator, shop_manager, cashier | `/reports` (`free:includes/API/V2/Reports_Controller.php:213-220`); closures reads (`Closures_Controller.php:81,85,110`); session figures (`Sessions_Controller.php:213-217,253-261`); fiscal documents (`free:includes/Services/Fiscal_Record_Store.php:351`) | Observed |
| `manage_woocommerce_pos_closures` | administrator, shop_manager (**not** cashier) | recount (`Closures_Controller.php:72-76,135-148`); the approver of a session override (`Sessions_Controller.php:317,370`) | Observed |
| `reassign_woocommerce_pos_sales` | administrator, shop_manager (**not** cashier) | v2 order writer (`free:includes/API/V2/Writers/Order_Writer.php:821`) | Observed |
| 13 `*_wcpos_store(s)` caps | administrator only (Free `Activator.php:1270-1327`; Pro `pro:includes/updates/update-1.7.5.php:41-64`) | Free never checks them. Pro registers the `wcpos_store` post type with `capability_type => 'wcpos_store'`, `map_meta_cap => true` (`pro:includes/Services/Stores.php:110-111`). Pro's REST store CRUD checks `manage_woocommerce_pos`, not these (`pro:includes/API/V1/Stores.php:180-190`). | Observed |

Pro registers **no** capability of its own beyond the 13 store caps. No Pro production code references the four 2.0 caps; they appear only in Pro tests (`pro:tests/includes/Test_Registers.php:115`, `pro:tests/includes/API/Test_Till_Store_Reach.php:68`). Pro loads Free's Activator, so Free's grants run on Pro sites (`pro:woocommerce-pos-pro.php:304`). **Observed.**

### 1.2 WooCommerce and WordPress capabilities

**Granted to the Cashier role** (`free:includes/Activator.php:1265-1294`, **Observed**):
- products: `read_private_products`, `publish_products`, `edit_product`, `edit_products`, `edit_published_products`, `edit_private_products`, `edit_others_products`
- orders: `read_private_shop_orders`, `publish_shop_orders`, `edit_shop_orders`, `edit_others_shop_orders`
- coupons: `read_private_shop_coupons`, `publish_shop_coupons`, `edit_shop_coupons`, `edit_published_shop_coupons`, `edit_private_shop_coupons`, `edit_others_shop_coupons`
- terms: `manage_product_terms`
- WordPress: `read`, `list_users`, `edit_users`
- creating customers: `create_customers` on WC ≥ 9.9, else `promote_users`. Each sync removes whichever of the two is obsolete (`:1357-1361`).

The cashier gets **no** delete cap for products, coupons or orders. **Observed.**

**Checked but not granted by WCPOS** (**Observed**):

| Capability | Where it is checked |
|---|---|
| `manage_woocommerce` | sync admin operations (`free:includes/Sync/Endpoint_Permissions.php:70-79`); `free:includes/API.php:416`; `free:includes/Services/Cashier.php:282`; `free:includes/Services/Auth.php:908`; Pro support bundle (`pro:includes/Payments/Support_Bundle.php:22,63,274`) |
| `delete_shop_orders`, `{ctx}_others_shop_orders` | `free:includes/Services/Permission_Rules.php:236-255` |
| `manage_options` | `free:includes/Services/Auth.php:902,924,937`; `free:includes/Services/Permission_Rules.php:350,432,470`; Pro store reach also admits store-less rows (`pro:includes/Registers.php:602`) |
| `promote_users` | Access write (`free:includes/API/V1/Settings.php:371`) |
| `install_plugins`, `update_plugins` | Pro extensions action (`pro:includes/API/V1/Extensions_Action.php:122,130`) |
| `view_order` | `free:includes/Storefront_Receipts.php:155` |
| `pay_for_order` | `free:includes/Templates/Payment.php:219` |

### 1.3 Filters on capabilities (Observed)

- `map_meta_cap` → `Permission_Rules::map_user_meta_caps` (registered at `free:includes/Activator.php:54`; logic at `free:includes/Services/Permission_Rules.php:418-443`). It applies the staff-account rule to `edit_user`, `delete_user`, `remove_user`, `promote_user`, `edit_users`, `delete_users` and `promote_users`. It only ever adds `do_not_allow`.
- `editable_roles` and `invite_user` fences: a till user may assign the `customer` role only (`free:includes/Activator.php:57-58`, `free:includes/Services/Permission_Rules.php:498-540`).
- `user_has_cap` is hooked only temporarily, to grant `access_woocommerce_pos` for one internal dispatch (`free:includes/Templates/Received.php:54-67`).
- The `wcpos_template` post type and its taxonomies map every cap to `manage_woocommerce_pos` (`free:includes/Templates.php:262-270,318-322,346-350`).
- Pro hooks **no** `map_meta_cap` and **no** `user_has_cap` filter.

### 1.4 How grants run, and the "introduced" marker

**Observed:**
- `Activator::version_check()` runs from `init()` on `plugins_loaded` on **every** request (`free:includes/Activator.php:59,65-81`). The docblock at `:1104` says "every admin page load", which does not match the code.
- It fires when any of these holds (`:1108-1113,1334-1336`), and then defers `single_activate(false, false)` to `init` (`:1139-1152`):
  - the stored version is older than `VERSION`;
  - `woocommerce_pos_role_caps_fingerprint` differs from the md5 of the definition;
  - `woocommerce_pos_role_caps_synced` is missing.
- **Upgrade** (`full_role_sync = false`) grants only names absent from the `woocommerce_pos_role_caps_synced` snapshot (`:120-139`). There are two exceptions:
  - the snapshot is missing and the fingerprint does not match, so every default is re-granted once (`:127,134`);
  - the Cashier role was deleted, so it is recreated with its full set (`:1348-1355`).
- The snapshot and fingerprint are written only after the roles are confirmed persisted (`:169-192`).
- **Explicit activation** (`full_role_sync = true`) re-grants every default, including caps a merchant removed (`:96-113`).
- **Deactivation** strips only `manage_woocommerce_pos` and `access_woocommerce_pos` from administrator, shop_manager and cashier (`free:includes/Deactivator.php:104-115`). Reactivation is an explicit activation, so it restores the full set.
- **Uninstall with full wipe** removes every cap containing `woocommerce_pos` or `wcpos_store`, then the cashier role (`free:uninstall-functions.php:466-476`).
- **Upgrade files:** in Free, only `free:includes/updates/update-0.4.php:17-25` touches caps. Pro's store caps are granted once, latched by `wcpos_stores_migrated` (`pro:includes/updates/update-1.7.5.php:19,66`). Pro's `update-2.0.0.php` only seeds registers (`:17`).
- A comment at `pro:includes/Activator.php:264-267` describes a "role-caps repair" path that Pro's `version_check()` no longer has (`:115-117`).

**Per-capability "introduced" marker: none (Observed).** Searches for these found nothing in either plugin: files named `*capabilit*`, the strings `caps_introduced`, `capability_since`, `introduced_in`, `first_seen` and `cap_version`, and any filter on `role_capability_definition()`. The snapshot option records which names were seen per role, not when each was introduced. Git history is the only "since" record.

**No capability registry (Observed).** The vocabulary sits in three separate lists:
- `Activator::role_capability_definition()`: per-role defaults, not filterable;
- `Access_Section::get_caps()`: private (`free:includes/Services/Settings/Access_Section.php:130-180`);
- `Access_Section::REPORTED_ONLY_CAPABILITIES` (`:45`).

---

## 2. The Access screen

**Routes** (Observed): `GET` and `POST/PUT/PATCH` `wcpos/v1|v2/settings/access`, registered in the settings section loop (`free:includes/API/V1/Settings.php:129-151,384-408`).

| | Required caps | Where |
|---|---|---|
| Read | `manage_woocommerce_pos` | `Settings.php:339-341` |
| Write | `manage_woocommerce_pos` + `edit_users` + `promote_users` | `Settings.php:59-61,370-372`; repeated in the service at `free:includes/Services/Settings/Access_Section.php:265-271` (`woocommerce_pos_settings_error`, 403) |
| Both | `access_woocommerce_pos` | the global gate (`free:includes/API.php:418-419`) |

**What `read()` returns** (`Access_Section.php:187-244`, **Observed**):
- One entry per role in `$wp_roles->roles`, shaped `{ name, defaults, capabilities: { wcpos, wc, wp } }`. Every role on the site is listed.
- The groups:
  - `wcpos`: the six caps above (`:136-143`);
  - `wc`: 30 primitives, including all `delete_*_products` and `delete_*_shop_coupons` (`:144-175`);
  - `wp`: `read` only (`:176-178`).
- `defaults` comes from `role_capability_definition()`. Non-cashier roles get only the `wcpos` group of defaults; the cashier gets every group plus `access_woocommerce_pos` (`:196-212`).

**How rows are grouped in the UI** (Free settings package, **Observed**):
- Group headings are WCPOS / WooCommerce / WordPress (`free:packages/settings/src/screens/access/index.tsx:17-21`).
- Nine "task groups" bundle primitives (`free:packages/settings/src/screens/access/task-groups.ts:47-126`): use POS, manage settings, edit products, delete products, edit coupons, delete coupons, manage orders, manage customers, manage categories.
- **None of the four 2.0 caps is in a task group.** They appear only as raw toggles under Advanced (`index.tsx:276-343`).

**How a row is added** (**Observed**):
- `apply_filters( 'wcpos_access_settings', $role_caps )`, then the deprecated alias `woocommerce_pos_access_settings` (deprecated in 2.0.0) (`Access_Section.php:242-243`).
- It takes one argument, the whole role map. A row is added by setting `$settings[$slug]['capabilities'][$group][$cap] = bool`, optionally with `['defaults'][$group][$cap]`.
- The write allow-list is rebuilt from the filtered `read()` (`:286-296`), so a filter-added cap becomes writable.
- **A filter-added cap is never reported to the app.** `effective_capabilities()` walks `capability_names()`, which reads the unfiltered `get_caps()` (`:52-56`).

**Validation on save** (`Access_Section.php:261-330`, **Observed**):
- The payload replaces the role's caps wholesale; `merge()` returns the patch (`:346-348`).
- Exactly one known role slug per request. Any other count is a silent no-op that returns `read()` (`:276-280`).
- Groups are flattened, intersected with the allow-list (woocommerce-pos#1159, `:307`) and passed through `wp_validate_boolean`.
- Administrator `read` and the removal of administrator `manage_woocommerce_pos` are skipped (`:313-319`). Then each cap gets `add_cap` or `remove_cap`.
- There is no `isset` guard on `$update[$slug]['capabilities']` before the `foreach` at `:300`.

**What Pro adds: nothing to this screen (Observed).**
- Pro hooks neither filter name.
- Pro's settings JS registers only `extensions.action`, `general.store_details_block` and `general.register_section` (`pro:packages/settings/src/index.tsx:8-11`).
- Pro's per-store access is a separate **Staff** panel on the Store edit screen: "Who can use this store", with "Everyone with POS access" or "Only these people". It writes the `_authorized_users` post meta (`pro:includes/Abstracts/Store.php:71`, `pro:includes/API/V1/Stores.php:423-426`).

---

## 3. What is served to the app

### 3.1 `effective_capabilities()`

`free:includes/Services/Settings/Access_Section.php:74-109`, **Observed**:
1. Start from `capability_names()`: `get_caps()` wcpos + wc + wp, unfiltered (`:52-56`).
2. Keep each name for which `user_can( $user, $cap )` is true. That call runs `map_meta_cap` and `user_has_cap`, so a role editor's deny applies (comment at `:62-67`).
3. `edit_product` and `delete_product` are read from `apply_filters( 'user_has_cap', $user->allcaps, … )`, with a multisite super-admin bypass (`:84-96`).
4. Append `manage_woocommerce` and `delete_users` if held (`REPORTED_ONLY_CAPABILITIES`, `:45,102-106`).
5. Return a flat `string[]` in vocabulary order.

How it merges multiple roles is WordPress's own allcaps merge plus any `user_has_cap` deny (Inferred from the comments at `:62-67` and `free:includes/Services/Cashier.php:250-260`).

Pro adds nothing to this list (Observed).

### 3.2 Where it is carried

| Carrier | Field | Cite | Label |
|---|---|---|---|
| `GET wcpos/v1/cashier/{id}` and `wcpos/v2/cashier/{id}` (cashier is promoted into v2 by the registry) | `capabilities`, beside `roles` and `stores` | `free:includes/Services/Cashier.php:85-87`; `free:includes/API/V1/Cashier.php:50`; `free:includes/API/Controller_Registry.php:107,159`. Filters: `wcpos_cashier_data` (`Cashier.php:108`), `wcpos_rest_prepare_cashier` (`V1/Cashier.php:196`) | Observed |
| Web frontend inline props | `wp_credentials.capabilities`, beside `roles` | `free:includes/Services/Auth.php:675-677`, used by `free:includes/Templates/Frontend.php:83,318` | Observed |
| Login redirect payload | **not carried**: tokens, id, uuid and display_name only | `free:includes/Templates/Auth.php:437-451`; `free:includes/Services/Auth.php:694-712` | Observed |
| Token refresh | **not carried** | `free:includes/Services/Auth.php:720-776`; `free:includes/API/V1/Auth.php:285-290` | Observed |
| JWT claims | **not carried**: user id only | `free:includes/Services/Auth.php:409-412` | Observed |
| `GET wcpos/v2/status` → `capabilities` | **a different thing**: server *feature* flags, not user caps | `free:includes/API/V2/Status_Controller.php:33,72` | Observed |

What Pro changes in the payload (**Observed**):
- **Store list.** Pro narrows the store list to stores where `Stores::current_user_is_authorized()` passes (`pro:includes/Services/Stores.php:64,132-166,232-254`). An empty `authorized_users` means everyone is allowed, and administrators are not exempt.
- **Current user, not the payload's user.** Free's `get_accessible_stores($user)` passes a user, but Pro's check reads `get_current_user_id()`. For a payload built for a user other than the caller, the list would follow the caller (Inferred).
- **Display block.** Each store gets a `display` block (`pro:includes/Services/Customer_Display.php:47-51,415-444`).
- **License.** The last 8 characters of the license key go into the REST index (`pro:includes/API.php:62-74`).
- **No register-access list.**

### 3.3 Entry gate

`Cashier::can_open_pos()` blocks only on `access_woocommerce_pos` and `publish_shop_orders` (`free:includes/Services/Cashier.php:231-235`). `missing_pos_capabilities()` also lists `read_private_products`, `read_private_shop_orders` and `list_users` (`:214-218`). It is used at `free:includes/Templates/Auth.php:418` and `free:includes/Templates/Frontend.php:60`. **Observed.**

### 3.4 How and when the app reads it

**Observed:**
- **Storage.** The list lives at `userDB.wp_credentials.capabilities`, an optional `string[]` (`app:packages/database/src/collections/schemas/wp-credientials.ts:42`). `roles` sits beside it (`:34`), and the list is deduplicated at `app:packages/database/src/collections/wp-credentials.ts:87`.
- **Login does not write it.** `saveLoginCredentials` keeps uuid, id, display_name and the tokens (`app:packages/query/src/user-db/credentials.ts:18-84`).
- **The cashier record does write it.** `useUserValidation` calls `GET ${site.wcpos_api_url}cashier/${userId}` (`app:packages/core/src/hooks/use-user-validation.ts:197,218`). Discovery stores `wcpos_api_url` as `…/wcpos/v2/` (`app:packages/core/src/screens/auth/hooks/use-api-discovery.ts:405`). `recordCashierProfile` writes `capabilities` and `roles` (`app:packages/query/src/user-db/credentials.ts:202-252`).
- **A response without the field deletes the stored list** (`credentials.ts:240-251`), which puts the user back to "unknown".
- **Embedded web boot.** `globalThis.initialProps.wp_credentials` is merged by `upsertEmbeddedCredentials`, and a payload without `capabilities` drops the stored ones (`credentials.ts:91-113`, `:108`).
- **Token refresh does not touch it.** `POST wcpos/v2/auth/refresh` patches `access_token` and `expires_at` only (`app:packages/hooks/src/use-http-client/refresh-access-token.ts:150,186,208`).
- **When it is re-read.** `useUserValidation` is mounted in the app layout (`app:apps/main/app/(app)/_layout.tsx:400`) and on two auth screens (`app:packages/core/src/screens/auth/components/wp-user.tsx:44`, `app:packages/core/src/screens/auth/components/store-select.tsx:84`). It re-fetches when the key `${userId}-${accessToken.slice(-10)}` changes (`use-user-validation.ts:145-149`). On wake it re-runs only if an attempt was deferred while the app was backgrounded (`:139-141,340-343`).
- **What never triggers a re-read:** an interval, a sync, or a plain resume.

**Inferred:** the list is re-read on app or session mount and after every token refresh or re-auth, because a refreshed token has a new tail.

**Unknown is treated as granted for most caps** (`app:packages/core/src/screens/main/hooks/user-capabilities.ts:30-64`, `has = c => !known || granted.has(c)`). The exceptions:

| Cap or derived flag | Without a known list | Cite |
|---|---|---|
| `canAcceptReaderTerms` (`manage_woocommerce`) | denied | `user-capabilities.ts:61` |
| `canReassignSales` (`reassign_woocommerce_pos_sales`) | denied | `user-capabilities.ts:62` |
| `manage_woocommerce_pos_closures` | denied | `app:packages/core/src/screens/main/reports/closures/recount-sheet.tsx:70` |
| `view_woocommerce_pos_reports`, for register figures (`blind`) | denied | `app:packages/core/src/services/register-session/use-register-session.ts:160` |
| `view_woocommerce_pos_reports`, for the Reports page | **granted** | `app:packages/core/src/screens/main/reports/index.tsx:508` |
| `manage_woocommerce_pos_cash` (`canManageCash`) | **granted** | `use-register-session.ts:161` |

All six rows are **Observed**.

---

## 4. Server enforcement

### 4.1 The global layer (Observed)

- **The full API loads only on WCPOS requests.** It is constructed only for requests that carry the WCPOS marker (`free:includes/Init.php:388-405`). Otherwise only the public `GET wcpos/v1/print-jobs/relay-verification` is registered (`:418`).
- **Every `wcpos/*` route requires `access_woocommerce_pos`.** `API::rest_pre_dispatch` enforces it (`free:includes/API.php:412-449`). A refusal is 401 `woocommerce_pos_rest_unauthorized` or 403 `woocommerce_pos_rest_forbidden`.
- **Routes exempt from that gate:**
  - the public routes `/auth/test`, `/auth/refresh`, `/ping`, `/echo`, `/site` and `/print-jobs/relay-verification`;
  - the printer-token routes;
  - `/receipts/` when the user is logged in;
  - the three sync admin operations, for a user with `manage_woocommerce` (`free:includes/Sync/Api.php:26,46-57`).
- **Lanes.** The nine v1 data controllers are frozen to v1. v2 serves its native services plus v1's non-frozen ones (`free:includes/API/Controller_Registry.php:25,142-175`).

### 4.2 Route-level checks beyond WooCommerce's own

Denial is `rest_forbidden` with 401 or 403 unless noted. **All Observed**, except where a row says otherwise.

**Free: orders and order writes**

| Route | Method | Caps checked | On denial / notes | Cite |
|---|---|---|---|---|
| v2 `/push/{collection}` (the order writer and other writes) | POST | `access_woocommerce_pos` + health. Then forwards to `wc/v3` under `Permission_Rules` "writes" scope. Product, variation and coupon edit and delete are pre-checked with WooCommerce. | WooCommerce's errors. Order edit and delete by a non-owner need `{ctx}_others_shop_orders`. | `free:includes/API/V2/Write_Controller.php:115,439-450,715-731` |
| — the cashier reassignment inside a v2 order push | | to another user: `reassign_woocommerce_pos_sales`, and the target must hold `access_woocommerce_pos`. To the pushing user: always allowed, no capability checked (`:819-824`) | **Silently not applied**: no error and no note for a refused cashier change | `free:includes/API/V2/Writers/Order_Writer.php:816-850` |
| — the store reassignment inside a v2 order push | | filter `wcpos_order_store_reassignment_allowed`; Pro requires an authorized store | Silently skipped | `free:includes/API/V2/Writers/Order_Writer.php:643,689`; `pro:includes/Orders.php:30,49-64` |
| v1 orders update and delete | PUT, DELETE | `Permission_Rules::verdict`, v1 lane | WooCommerce's errors | `free:includes/API/V1/Orders_Controller.php:171-181` |
| v2 and v1 `/orders/{id}/email` | POST | `publish_shop_orders` (WooCommerce `shop_order` create) | `woocommerce_rest_cannot_create`. No ownership check. | `free:includes/API/V2/Order_Email_Controller.php:27`; `free:includes/API/V1/Orders_Controller.php:284,668-674` |
| v2 `/orders/{id}/payments[...]`, `/payment-methods/{m}/submit, cancel`, `/close` | POST, GET | `publish_shop_orders` only | No order-ownership or read check | `free:includes/API/V2/Payments_Controller.php:77,124-128` |
| v2 `/payment-methods` · `/payment-methods/{id}/bootstrap` | GET · POST | `access_woocommerce_pos` · `publish_shop_orders` | | `free:includes/API/V2/Payment_Methods_Controller.php:37,49,67,94` |
| `/payment-gateways`, `/payment-gateways/{id}/bootstrap`, `/orders/{id}/checkout` | | `publish_shop_orders` | | `free:includes/API/V1/Payment_Gateways.php:67`; `Gateway_Bootstrap_Controller.php:55`; `Checkout_Controller.php:78` |
| Refund create | POST | Free has no refund route of its own. Pro's v1 and v2 refunds controllers extend `WC_REST_Order_Refunds_Controller` and add a required `X-WCPOS-Idempotency-Key` (400). | WooCommerce's check (**Unverified**: WooCommerce source not read) | `pro:includes/API/V1/Order_Refunds_Controller.php:136-143` |

**Free: catalog and customers**

| Route | Method | Caps checked | On denial / notes | Cite |
|---|---|---|---|---|
| v2 catalog proxy `/products`, `/orders`, `/customers`, `/products/categories`, `/products/brands`, `/products/tags`, `/coupons`, `/taxes`, `/refunds` | GET | `access_woocommerce_pos`, then WooCommerce's check. Coupons, taxes and refunds reads are granted on `access_woocommerce_pos`. | WooCommerce's errors | `free:includes/API/V2/Catalog_Proxy_Controller.php:53`; `free:includes/Services/Permission_Rules.php:107-109,259-262` |
| v2 `/orders/pull`, `/changes/*`, `/digests`, `/integrity/scan`, `/integrity/bucket`, `/variations`, `/resolve/barcode`, `/status` | GET | `access_woocommerce_pos` + health | 403, or 503 when unhealthy | `free:includes/Sync/Endpoint_Permissions.php:51-63` |
| v2 `/uuid/backfill`, `/orders/index/backfill`, `/integrity/rebuild` | POST | `manage_woocommerce` | | `free:includes/Sync/Endpoint_Permissions.php:70-79` |
| v1 customers create, edit, delete | | `verdict`: the staff-account rule; create falls back to `create_customers` / `promote_users` | `woocommerce_pos_rest_cannot_edit_staff_account` | `free:includes/API/V1/Customers_Controller.php:137-155`; `free:includes/Services/Permission_Rules.php:93-95,129-134,346-364` |
| v1 products, variations, terms | | WooCommerce's own checks | | — |
| `/data/order_statuses` | GET | any logged-in user | | `free:includes/API/V1/Data_Order_Statuses_Controller.php:147-151` |

**Free: registers, sessions, closures, records and reports**

| Route | Method | Caps checked | On denial / notes | Cite |
|---|---|---|---|---|
| v2 `/registers`, `/registers/health`, `/registers/{uuid}` | GET / POST, PATCH, DELETE | `access_woocommerce_pos` / `manage_woocommerce_pos` | Create on Free → `wcpos_registers_pro` 403. Store reach narrows the list. | `free:includes/API/V2/Registers_Controller.php:62,77-80,92-94,128,141` |
| v2 `/sessions`, `/{id}`, `/{id}/status`, `/approve`, `/carry`, `/{id}/movements`, `/movements` | GET / POST | GET: `access_woocommerce_pos`. Every POST: `manage_woocommerce_pos_cash`. | The approver must be a **different** user holding `manage_woocommerce_pos_closures`, else `wcpos_override_refused` 403. Figures are stripped without `view_woocommerce_pos_reports`. Out of reach → 404 `wcpos_session_not_found`. | `free:includes/API/V2/Sessions_Controller.php:48,71,213-217,253-261,317,370` |
| v2 `/closures`, `/last`, `/export`, `/{id}` | GET | `access_woocommerce_pos` + `view_woocommerce_pos_reports`; export also `manage_woocommerce_pos` | Out of reach → 404 `wcpos_closure_not_found` | `free:includes/API/V2/Closures_Controller.php:44,71,81,87-92` |
| v2 `/closures` | POST | `access_woocommerce_pos` + `manage_woocommerce_pos_cash` | The row is stripped without the reports cap | `Closures_Controller.php:78,109-121` |
| v2 `/closures/{id}/print` | POST | `access_woocommerce_pos` + `manage_woocommerce_pos_cash` + `view_woocommerce_pos_reports` | | `Closures_Controller.php:84-86` |
| v2 `/closures/{id}/recount` | POST | `manage_woocommerce_pos_closures`, or an `approval` body whose user holds it | `wcpos_recount_approval_invalid` / `_forbidden` 403 | `Closures_Controller.php:72-76,135-148` |
| v2 `/records`, `/records/{id}` | GET | `access_woocommerce_pos` | Store reach applies | `free:includes/API/V2/Records_Controller.php:40,66-68,125,146` |
| v2 `/reports`, `/reports/{key}` | GET | `access_woocommerce_pos` + `view_woocommerce_pos_reports`, then the report's own declared `capability` | `wcpos_report_forbidden` 403. A hidden report → `wcpos_report_not_found` 404. Free's day gate → `wcpos_report_scope_locked` 403. | `free:includes/API/V2/Reports_Controller.php:35,50,95,119,213-220`; `free:includes/Services/Reports_Registry.php:60-117`; `free:includes/Services/Report_Scope_Gate.php:36-51` |

**Free: receipts, printing, templates, settings and auth**

| Route | Method | Caps checked | On denial / notes | Cite |
|---|---|---|---|---|
| `/receipts/{order_id}`, `/pdf`, `/print` | GET / POST | `access_woocommerce_pos`. Closure, X-report and handover documents need `view_woocommerce_pos_reports`; printing a closure needs `manage_woocommerce_pos_cash`. | `wcpos_rest_insufficient_permissions` 403. No order-ownership check. | `free:includes/API/V1/Receipts_Controller.php:60,96,137,402,418-428`; `free:includes/Services/Fiscal_Record_Store.php:351` |
| `/print-jobs` and siblings | various | `access_woocommerce_pos`; `/relay/register` needs `manage_woocommerce_pos`; cloudprnt and epson-sdp use a printer token | `wcpos_print_job_invalid_token` 401 | `free:includes/API/V1/Print_Jobs_Controller.php:98-273,860,1248,1259` |
| `/templates`, `/templates/active`, `/gallery`, `/{id}` | GET | `access_woocommerce_pos`; `context=edit` needs `manage_woocommerce_pos` | `wcpos_rest_cannot_view` / `_edit` | `free:includes/API/V1/Templates_Controller.php:72,84,103,215,1582-1630` |
| `/templates/batch`, `/install`, `/{id}` (PUT, DELETE), `/{id}/copy`, `/{id}/preview` | write | `manage_woocommerce_pos` | `wcpos_rest_cannot_update` | `Templates_Controller.php:128,195,241,267,285,336,1640-1670` |
| `/settings/{section}` | GET / write | `manage_woocommerce_pos`. The cloud_print read needs only `access_woocommerce_pos`. The Access write is as in §2. | | `free:includes/API/V1/Settings.php:46-61,339-372,384` |
| `/settings` · `/settings/payment-gateways/readers` · `/settings/tax_ids/detection` | GET | `__return_true` · `manage_woocommerce_pos` · `manage_woocommerce_pos` | | `Settings.php:119,156,194` |
| `/logs`, `/logs/mark-read`, `/extensions` | | `manage_woocommerce_pos` | | `free:includes/API/V1/Logs.php:73,83`; `free:includes/API/V1/Extensions.php:61` |
| `/auth/sessions` (GET, DELETE), `/auth/sessions/{jti}`, `/auth/users/sessions` | | self, `manage_options`, or `manage_woocommerce` (never against an administrator) | | `free:includes/API/V1/Auth.php:93,114,141,171,538-541`; `free:includes/Services/Auth.php:893-947` |
| v1 `/consent`, `/consent/dismiss` | POST | `manage_woocommerce_pos` | `wcpos_consent_forbidden` 403 | `free:includes/Admin/Consent.php:303,320,336-342` |
| `/stores`, `/stores/{id}` (Free routes) | GET | logged in (plus the global gate) | | `free:includes/API/V1/Stores.php:47,57,155` |

**Pro routes and Pro checks**

| Route or check | Caps / rule | On denial | Cite |
|---|---|---|---|
| `/stores` POST; `/stores/{id}/edit` GET; `/stores/{id}` PUT, PATCH, DELETE; `?context=edit` | `manage_woocommerce_pos`. There is no `*_wcpos_store` check and no per-store authorization check. | `woocommerce_pos_rest_forbidden` 401/403; `woocommerce_pos_store_not_found` 404 | `pro:includes/API/V1/Stores.php:61-101,116-123,180-190,222-332` |
| `GET /stores/{id}` | Pro's `get_store` checks only that the store exists and is published, not `current_user_is_authorized()`. The list does apply that check. | — | `pro:includes/Services/Stores.php:215-223,264-275` (Observed); the effect on the route response is Inferred |
| `POST /wcpos/v2/registers` (with `manage_woocommerce_pos`) | `store_id` must be authorized | `wcpos_register_store_refused` 400; `wcpos_register_store_required` 409 | `pro:includes/Registers.php:536-555` |
| `PATCH /wcpos/v2/registers/{uuid}` move | the target store must be authorized; the register may not have an open session | `wcpos_register_move_refused` 400; 409 | `pro:includes/Registers.php:556-569,669-677` |
| Store reach for registers, sessions, closures, records and reports | answers Free's `wcpos_closures_list_args` with the user's authorized stores (+ store-less rows when the user has `manage_options`). Free answers 404 out of reach. | 404 | `pro:includes/Registers.php:35,584-608`; `free:includes/Services/Store_Reach.php:17-20,56-83` |
| v1 order write `_pos_store` | stamped only for an authorized `store_id` | silently skipped | `pro:includes/API/V1/Orders_Controller.php:47-70` |
| v2 product write on a product with per-store prices | the scope must be known and authorized | `woocommerce_pos_store_scope_required` 409 | `pro:includes/Store_Pricing.php:193-197,572-591,679-694` |
| v2 `/orders/{id}/payments/{uuid}/answer` | `publish_shop_orders` only; no store-reach or ownership check | 404 / 409 / 501 in the callback | `pro:includes/API/V2/Payments_Answer_Controller.php:22-30` |
| `/display/*` | `access_woocommerce_pos` or a display token; store-filtered | `wcpos_display_store_forbidden` 403; `wcpos_display_unauthorized` 401 | `pro:includes/API/V1/Display_Controller.php:46-338` |
| `/extensions/action` | `install_plugins`; also `update_plugins` for update actions | 401/403 | `pro:includes/API/V1/Extensions_Action.php:121-139` |
| Analytics `wcpos_store`, `wcpos_cashier`, `wcpos_gateway` query filters | filter results only; no authorization check on the store | — | `pro:includes/API/V1/Analytics.php:102-132,267-276` |
| POS page `?store=` | must be authorized | `wp_die` | `pro:includes/Templates.php:51-84` |
| wp-admin order store picker | nonce only, no authorization check | — | `pro:includes/Admin/Orders/Single_Order.php:64-84` |

All Pro rows are **Observed**, except the `GET /stores/{id}` route effect (Inferred) and the refund permission (Unverified, in the Free table above).

### 4.3 Query scopes and ownership (Observed)

- **Order filters are not enforced.** `pos_cashier`, `pos_store` and `pos_register` are client-supplied order filters over `_pos_user`, `_pos_store` and `_wcpos_register` (`free:includes/Sync/Collection_Rules.php:186-208,325-333`; v1 mapping `free:includes/API/V1/Orders_Controller.php:80-81`). Nothing forces `pos_cashier` to equal the current user.
- **The order pull lane can only be narrowed,** through the `wcpos_order_pull_ids` filter (`free:includes/API/V2/Orders_Controller.php:144`).
- **Order reads are not ownership-scoped on either lane.**
- **Ownership keys on `_pos_user`.** `Permission_Rules::owns_order` is true when `_pos_user` equals the current user (`free:includes/Services/Permission_Rules.php:297-303`). It applies to edit on both lanes and to delete on v2 (`:31-56,228-258`). The same rule gates the order-pay form (`free:includes/Form_Handler.php:102`).
- **`_pos_user` is stamped server-side** (`free:includes/API/V2/Writers/Order_Writer.php:85,871`; `free:includes/API/V1/Orders_Controller.php:920-926`).
- **Audit meta is guarded.** WCPOS-token writes of `_pos_*` audit meta through non-WCPOS order routes are refused with 403 `woocommerce_pos_rest_audit_meta_forbidden` (`free:includes/Services/Core_Order_Audit_Guard.php:87-190`).
- **Store reach is enforced.** It covers registers, sessions, closures, records, reports and fiscal documents (`free:includes/Services/Store_Reach.php:56-83`; `free:includes/Services/Report_Scope_Resolver.php:28`; `free:includes/Services/Fiscal_Record_Store.php:355`). On Free there is no store restriction, so reach is unrestricted (`Store_Reach.php:67-68`).
- **No Pro per-role store map.** A cashier is limited to some stores only through each store's `authorized_users` list.

### 4.4 Extension points that touch permissions (Observed)

| Area | Hook | Cite |
|---|---|---|
| Access rows | `wcpos_access_settings` (adds toggles, not app-reported caps) | `free:includes/Services/Settings/Access_Section.php:242` |
| Staff-account list | `wcpos_protected_account_capabilities` | `free:includes/Services/Permission_Rules.php:328` |
| Store reach | `wcpos_closures_list_args`; `wcpos_registers_list_args`, `wcpos_sessions_list_args`, `wcpos_records_list_args`; `wcpos_session_row` | `free:includes/Services/Store_Reach.php:20,57` |
| Reports | `wcpos_reports`, with a per-report `capability` | `free:includes/Services/Reports_Registry.php:60-117` |
| Orders | `wcpos_order_store_reassignment_allowed`, `wcpos_order_pull_ids` | `Order_Writer.php:643`; `V2/Orders_Controller.php:144` |
| Cashier payload | `wcpos_cashier_data`, `wcpos_rest_prepare_cashier`, `wcpos_cashier_accessible_stores` | `free:includes/Services/Cashier.php:108`; `free:includes/API/V1/Cashier.php:196` |
| Routes | `wcpos_rest_api_controllers`, `wcpos_rest_api_v2_controllers`, `wcpos_rest_namespaces`; action `wcpos_register_settings_sections` (its routes default to `manage_woocommerce_pos`) | `free:includes/API/Controller_Registry.php` |

**No hook** changes the role definitions, `get_caps()` or `REPORTED_ONLY_CAPABILITIES`. The Pro hooks actually used are `wcpos_closures_list_args`, `wcpos_order_store_reassignment_allowed`, `wcpos_get_stores` and `wcpos_get_store`.

---

## 5. App gating

Every place the app reads a user capability (**Observed**). In the "Without it" column, **hides** means the control is not shown, **disables** means it is shown but unusable, and **unregistered** means the route is absent.

**Products, coupons and customers**

| Where | Capability (derived flag) | Without it |
|---|---|---|
| `app:apps/main/app/(app)/(drawer)/products/_layout.tsx:26,36` | `canEditProducts` / `canEditVariations` | edit routes unregistered (`Stack.Protected`) |
| `app:apps/main/app/(app)/(drawer)/coupons/_layout.tsx:25,35` | `canEditCoupons` / `canCreateCoupons` | edit and add routes unregistered |
| `app:apps/main/app/(app)/(drawer)/customers/_layout.tsx:26,36` | `canEditCustomers` / `canCreateCustomers` | edit and add routes unregistered |
| `app:packages/core/src/screens/main/products/cells/{name.tsx:29, editable-price.tsx:34, stock-quantity.tsx:38, barcode.tsx:29, cogs.tsx:32}` | edit products / variations | inline cell disabled, with a tooltip |
| `app:packages/core/src/screens/main/products/cells/actions.tsx:24`, `cells/variation-actions.tsx:23`, `products/row.tsx:69`, `products/products.tsx:298,461` | edit products / variations | open and edit disabled, with a tooltip |
| `app:packages/core/src/screens/main/products/edit/product/form.tsx:188,203`; `edit/variation/form.tsx:133,148` | `canDeleteProducts` / `canDeleteVariations` | Delete hidden |
| `app:packages/core/src/screens/main/customers/row.tsx:23`, `cells/actions.tsx:23`, `index.tsx:88` | `canEditCustomers` (`edit_users`) | editing disabled, with a tooltip |
| `app:packages/core/src/screens/main/customers/index.tsx:162-176` | `canCreateCustomers` | Add disabled |
| `app:packages/core/src/screens/main/customers/edit/form.tsx:112,126` | `canDeleteCustomers` (`delete_users`) | Delete hidden |
| `app:packages/core/src/screens/main/coupons/{row.tsx:26, index.tsx:99, cells/actions.tsx:21}` | `canEditCoupons` | disabled, with a tooltip |
| `app:packages/core/src/screens/main/coupons/index.tsx:191-205` | `canCreateCoupons` | Add disabled |
| `app:packages/core/src/screens/main/coupons/edit/form.tsx:67,81` | `canDeleteCoupons` | Delete hidden |

**The cart and Orders › Edit**

| Where | Capability (derived flag) | Without it |
|---|---|---|
| `app:packages/core/src/screens/main/pos/cart/add-cart-items-menu.tsx:54` | isPro && `canCreateCustomers` | "Add new customer" disabled |
| `app:packages/core/src/screens/main/pos/cart/add-coupon.tsx:110-139` | isPro && `canCreateCoupons` | "New coupon" disabled |
| `app:packages/core/src/screens/main/pos/cart/edit-cart-customer.tsx:279` | `canEditCustomers` | "Update customer too" hidden |
| `app:packages/core/src/screens/main/orders/edit/form.tsx:494-495,567,607` | `canReassignSales`; for Cashier also the server feature `order_cashier_reassignment` | Cashier and Store rows locked |

**Registers, reports and settings**

| Where | Capability (derived flag) | Without it |
|---|---|---|
| `app:packages/core/src/services/register-session/use-register-session.ts:161` → `pos/cart/open-register-card.tsx:78`, `register-panel.tsx:89,181,258,269,327,344,349,402,622`, `pos/cart/index.tsx:242,274`, `switch-confirm.tsx:183`, `user-sheet.tsx:817` | `manage_woocommerce_pos_cash` (`canManageCash`) | float entry replaced by a REGISTER231 notice; paid-in, paid-out, no-sale, movement void and retry, and Close register are hidden; sign-out skips the close-first prompt; register carry is not offered |
| `use-register-session.ts:160`, `reports/closures/index.tsx:77`, `reports/closures/session-card.tsx:276` → `blind` | `view_woocommerce_pos_reports` | expected and drawer figures hidden; X-report print disabled (`register-panel.tsx:618`); no variance-approval check (`count-decision.ts:48`) |
| `app:packages/core/src/screens/main/reports/index.tsx:508` | `view_woocommerce_pos_reports` | whole Reports page replaced by a "no access" text |
| `app:packages/core/src/screens/main/reports/closures/recount-sheet.tsx:70,101,112,186` | `manage_woocommerce_pos_closures` | recount asks for a manager's username and password |
| `app:packages/core/src/screens/main/pos/cart/register-gate-card.tsx:31` | `manage_woocommerce_pos` | docs link instead of the wp-admin Stores link |
| `app:packages/core/src/screens/main/settings/card-readers/index.tsx:170,308-319` | `manage_woocommerce` (`canAcceptReaderTerms`) | "Set up Tap to Pay" hidden |
| `app:packages/core/src/screens/main/health/record-edit-route.ts:19-50` | isPro + the collection's edit cap | no edit link from Logs or Health |

**Not read anywhere in the app (Observed):**
- any `*_shop_orders` cap;
- `canCreateProducts`, which is derived but unused (there is no add-product route);
- roles, which are displayed only (`app:packages/core/src/screens/auth/components/wp-user.tsx:61-69`) and used as a customer-picker filter (`app:packages/query/src/query-state/search-select.ts:34`);
- capabilities in the drawer: every menu item is rendered (`app:packages/core/src/screens/main/components/drawer-content/index.tsx:62-70`).

**Gates that act like permissions but are not capabilities (Observed):**
- **The Pro licence.**
  - `withProAccess` blurs Products, Orders, Customers and Coupons and makes them read-only on Free (`app:packages/core/src/screens/main/components/list-frame/index.tsx:33-36`; `pro-guard.tsx:31-59`).
  - `readOnly = !isPro` in the order modal hides Re-open, Sync, Delete and Refund (`app:packages/core/src/screens/main/orders/edit/modal.tsx:25`; `orders/edit/view.tsx:144-186`).
  - Reports on Free are limited to today and the current store (`app:packages/core/src/screens/main/reports/date-button.tsx:141,221`; `reports/bar.tsx:71`).
- **Store settings.**
  - `register_sessions` switches register sessions on (`use-register-session.ts:97`).
  - `variance_threshold` and the session's `approval_required` force a manager approval (`app:packages/core/src/services/register-session/count-decision.ts:47-54`).
  - Tax exempt is hidden when the store's prices include tax (`app:packages/core/src/screens/main/pos/cart/buttons/edit-order-meta/tax-exempt-row.ts:26-41`).
- **Server refusals mapped to messages.**
  - 403 / `rest_*` / `woocommerce_pos_rest_forbidden` become INSUFFICIENT_ROLE (`app:packages/hooks/src/use-http-client/parse-wp-error.ts:59-79`).
  - A register 403 becomes REGISTER_CASH_NOT_PERMITTED (`app:packages/query/src/register-session/queue.ts:158`).
  - A refused order delete shows a toast (`app:packages/core/src/screens/main/orders/order-actions.tsx:105-112`). The cart's Void falls back to a cancel status (`app:packages/query/src/mutations/void-order.ts:19-25`).

---

## 6. Inventory of gateable things

**How a write reaches the server:**
- **push**: the action patches the local RxDB document, and the sync engine sends `POST wcpos/v2/push/{collection}` (`app:packages/sync-core/src/recordPushAdapter.ts:45-51`; writeable collections at `app:packages/query/src/engine-adapter/collection-map.ts:86-147`). The server re-judges the push through `free:includes/API/V2/Write_Controller.php`. The action → local patch → push chain is **Inferred** per row.
- **REST**: a direct call with base `wcpos/v2/` (`app:packages/core/src/screens/main/hooks/use-rest-http-client/index.ts:209`).

The "Server gate" column states what the server judges beyond `access_woocommerce_pos` (§4). In it, **WC** means WooCommerce's own controller check.

### 6.1 Pages

The menu is defined at `app:apps/main/app/(app)/(drawer)/_layout.tsx:132-146`.

| Page | Where | Routes | App gate today | Server gate today |
|---|---|---|---|---|
| POS (the till) | `(drawer)/(pos)/` | orders push and pull; sessions REST | none on the page; cash caps inside (§5) | `publish_shop_orders` to open (`Cashier.php:231-235`) |
| Products | `(drawer)/products/index.tsx` | `wcpos/v2/products`, `/variations`; push | Pro (read-only on Free) + edit caps | WC product caps |
| Orders | `(drawer)/orders/index.tsx` | `wcpos/v2/orders`; push | Pro only | WC order caps; reads not ownership-scoped |
| Coupons | `(drawer)/coupons/index.tsx` | `wcpos/v2/coupons`; push | Pro + coupon caps | read on `access_woocommerce_pos`; writes WC |
| Customers | `(drawer)/customers/index.tsx` | `wcpos/v2/customers`; push | Pro + customer caps | `list_users` / `edit_users`; staff-account rule |
| Reports | `(drawer)/reports/index.tsx` | local orders; REST `reports`, `closures`, `closures/{id}`, `closures/last`, `sessions` (`app:packages/core/src/screens/main/reports/closures/use-closure-rows.ts:276,350`; `use-last-closure.ts:64-72`) | `view_woocommerce_pos_reports` (granted when unknown); Free limited to today | `view_woocommerce_pos_reports` + store reach |
| Store health (Database, Performance, Logs) | `app:apps/main/components/area-navigation/health.tsx:10-27` | `GET registers/health` (`health/use-register-health.ts:72`); `POST` receipt email (`health/queued-emails.tsx:52`) | edit links only | `access_woocommerce_pos` for health; `/logs` needs `manage_woocommerce_pos` |
| Settings (7 tabs, §6.4) | `app:apps/main/components/area-navigation/settings.ts:7-43` | mostly local | none, except Tap to Pay | — |
| Support | `(drawer)/support/index.tsx` | none found | none | — |

All rows **Observed**, except the route chains, which are **Inferred** where marked push.

### 6.2 Actions on a sale

| Action | Where | How it reaches the server | App gate | Server gate |
|---|---|---|---|---|
| Cart discount (quick keys or %) | `pos/cart/add-cart-items-menu.tsx:88`, `pos/cart/add-discount.tsx`, `pos/cart/quick-discount-keys.tsx` | orders push | none | none beyond WC order edit |
| Coupon on the cart | `pos/cart/add-coupon.tsx` | orders push | none (creating one: isPro + `canCreateCoupons`) | WC |
| Change line price, regular price, name or quantity | `pos/cart/cells/edit-line-item/form.tsx:176-233` | orders push | none | none beyond WC order edit |
| Change line tax status or class | `pos/cart/cells/cart-line-rows.tsx:27`, plus the line, fee and shipping forms | orders push | none | none beyond WC order edit |
| Tax exempt | `pos/cart/buttons/edit-order-meta/form.tsx:590-615` | orders push | a store setting and state only | none beyond WC order edit |
| Add fee, shipping or misc product | `pos/cart/add-cart-items-menu.tsx:77-95` | orders push | none | none beyond WC order edit |
| Remove a line | `pos/cart/cells/line-strip.tsx:598` | orders push | none | none beyond WC order edit |
| Void (cart) | `pos/cart/order-sheet.tsx:100-104`, `pos/hooks/use-void-order.ts:37` | delete push; becomes a cancel if refused | none | the cashier holds no `delete_shop_orders`; ownership rule on v2 delete |
| Delete order (Orders page) | `orders/edit/view.tsx:165`, `orders/order-actions.tsx:94-119` | delete push | Pro | as Void |
| Reopen a sale | `orders/use-reopen-order.ts`, `orders/edit/view.tsx:149` | orders push | Pro | none beyond WC order edit + ownership |
| Refund | `orders/edit/view.tsx:170` → `orders/refund/use-refund-mutation.ts:127` | REST `POST orders/{id}/refunds` | Pro; no capability | WC refunds controller (Unverified) |
| Park, or multiple open carts | `pos/cart/tabs.tsx:425` | orders push (`pos-open`) | none | none beyond WC |
| Reassign cashier or store, from the **POS cart** | `pos/cart/buttons/edit-order-meta/form.tsx:483-503` | orders push | **none** | cashier: `reassign_woocommerce_pos_sales`, except to oneself; store: only the filter `wcpos_order_store_reassignment_allowed` (Pro: an authorized store), no capability. A refusal is silently dropped (`Order_Writer.php:642-645,816-850`) |
| Reassign cashier or store, from **Orders › Edit** | `orders/edit/form.tsx:564-607` | orders push | `canReassignSales` | same |
| Change order status | POS `edit-order-meta/form.tsx:466-475`; Orders `orders/edit/form.tsx:547` | orders push | allowed-status list only | none beyond WC |
| Change the cart's customer | `pos/cart/cart-header.tsx:136` | orders push | none | none beyond WC |
| Add a customer | `pos/cart/add-cart-items-menu.tsx:54`; customers add route | customers push | isPro + `canCreateCustomers` | `create_customers` / `promote_users` |
| Edit a customer | customers edit; `pos/cart/edit-cart-customer.tsx:279` | customers push | Pro + `canEditCustomers` | `edit_users` + staff-account rule |
| Edit a product or its stock | Products page only; there is no product edit in `pos/` | products / variations push | Pro + edit caps | WC product caps |
| Print a receipt | receipt modal: `GET /receipts/{id}` (`receipt/hooks/use-receipt-data.ts:77`), `/receipts/{id}/pdf` (`use-download-receipt-pdf.ts:42`), `POST /print-jobs` (`hooks/use-cloud-enqueue.ts:33`) | REST | none | `access_woocommerce_pos`; no ownership check |
| Email a receipt | `receipt/email.tsx:139` → `POST /orders/{id}/email` | REST | none | `publish_shop_orders`; no ownership check |
| Take payment, split tender, close the sale | `pos/cart/buttons/pay.tsx`; `POST orders/{id}/checkout` (`pos/checkout/hooks/use-checkout-session.ts:398`), `orders/{id}/payments` (`pos/checkout/payments/record-manual-payment.ts:223`), `…/payment-methods/{m}/submit` and `/cancel` (`submit-gateway-payment.ts:102,212`), `…/payments/{p}/void` and `/capture` (`void-payments.ts:98`; `services/terminal-payments/service.ts:247`), `orders/{id}/close` (`pos/commands/close-sale.ts:68`) | REST | none | `publish_shop_orders`; no ownership check |
| Open the cash drawer (no sale) | `pos/cart/movement-sheet.tsx:151` (opens locally) + `POST movements` | REST | `canManageCash` | `manage_woocommerce_pos_cash` |

All rows **Observed**, except the push chains (Inferred) and the refund permission (Unverified). App paths are under `app:packages/core/src/screens/main/`, except `services/` and `hooks/`, which are under `app:packages/core/src/`.

### 6.3 Register and session actions

These are queued locally, then sent over REST from `app:packages/query/src/register-session/queue.ts`.

| Action | Route | App gate | Server gate |
|---|---|---|---|
| Open the register | `POST sessions` (`queue.ts:405`) | `canManageCash` | `manage_woocommerce_pos_cash` |
| Start a count, close | `POST sessions/{id}/status` (`:433,439`), `POST closures` (`:578`) | `canManageCash` | `manage_woocommerce_pos_cash` |
| Cash in / out, no sale | `POST movements` (`:486`) | `canManageCash` | `manage_woocommerce_pos_cash` |
| Carry the register to another store | `POST sessions/{id}/carry` (`app:packages/query/src/register-session/carry.ts:53`) | `canManageCash` | `manage_woocommerce_pos_cash` |
| Manager approval of a variance | `POST sessions/{id}/approve` with a username and password (`app:packages/core/src/screens/main/pos/cart/approve-sheet.tsx:52`) | the variance threshold; the caller's own caps are not read | the approver is a different user with `manage_woocommerce_pos_closures` |
| Recount a closure | `POST closures/{id}/recount` (`app:packages/core/src/screens/main/reports/closures/recount-sheet.tsx:108`) | `manage_woocommerce_pos_closures`, else approval credentials | same |
| X-report | — | `blind` disables printing | the closure print needs the reports cap |
| Closure / Z print | `POST closures/{id}/print` (`app:packages/core/src/screens/main/receipt/hooks/use-receipt-data.ts:125`) | none | `manage_woocommerce_pos_cash` + `view_woocommerce_pos_reports` |
| See expected and drawer figures | — | `view_woocommerce_pos_reports` | figures stripped server-side without it |

All rows **Observed**.

### 6.4 Settings screens

The tabs are listed at `app:apps/main/components/area-navigation/settings.ts:7-43`; the screens are under `app:packages/core/src/screens/main/settings/`.

| Tab | Where it writes | App gate | Server gate |
|---|---|---|---|
| General (`general.tsx`) | the local `userDB.stores` doc via `patchStoreSettings` (`app:packages/query/src/user-db/store-settings.ts:17`); "Restore" reads `GET stores/{id}` (`general.tsx:208`) | none | — |
| Tax (`tax.tsx:115`) | local store doc | none | — |
| Barcode scanning (`barcode-scanning/settings.tsx:108`) | local store doc | none | — |
| Theme (`theme.tsx:181-512`) | local store doc | none | — |
| Printing (`printing/index.tsx`) | local printer profiles; server templates read via `GET templates` (`app:packages/query/src/store-local/templates-sync.ts:60`) | none | template edits need `manage_woocommerce_pos` (wp-admin) |
| Card readers (`card-readers/index.tsx`) | local pairing; `POST payment-methods/{id}/bootstrap` (`app:packages/core/src/services/terminal-payments/service.ts:155`) | Tap to Pay set-up needs `manage_woocommerce` | `publish_shop_orders` |
| Customer display (`customer-display/index.tsx`) | pairing over REST (`app:packages/core/src/screens/main/pos/customer-display/use-customer-display-service.ts:102-107`) | none | Pro `/display/*`: `access_woocommerce_pos` + store reach |
| Per-till UI settings: quick discounts, auto-print, auto-show receipt (`app:packages/core/src/screens/main/pos/cart/ui-settings-form.tsx:130-175`); product columns (`pos/products/ui-settings-form.tsx`) | local | none | — |

**Labels:** the settings writes are **Observed**.

**Inferred:**
- The General, Tax, Barcode and Theme values stay on the device. The `stores` collection is not in the push list (`collection-map.ts:86-147`), and the server-owned store fields are a separate list (`app:packages/database/src/collections/schemas/stores.ts:689`).
- No in-app settings tab writes a store-wide server setting. The server-side settings (`/settings/{section}`, `manage_woocommerce_pos`) are edited in wp-admin.

---

## 7. Observations a decision ticket may need

Each is a fact, not a proposal.

1. **Missing from the app's list.** A cap added through `wcpos_access_settings` is writable on the Access screen but is never sent to the app (`Access_Section.php:52-56` vs `:286-296`). **Observed.**
2. **The four 2.0 caps have no task-group row.** They appear only under Advanced (`free:packages/settings/src/screens/access/task-groups.ts:47-126`; `index.tsx:276-343`). **Observed.**
3. **The app fails open or closed cap by cap.**
   - It fails open for an unknown list, which includes a server response without the field.
   - It fails closed for `manage_woocommerce`, `reassign_woocommerce_pos_sales` and `manage_woocommerce_pos_closures`.
   - `view_woocommerce_pos_reports` is mixed: open for the Reports page, closed for register figures.

   Sources are in §3.4. **Observed.**
4. **The app re-reads caps only on mount, re-auth and token refresh.** A cap removed on the server reaches a running till only at its next token refresh or relaunch (§3.4). **Inferred.**
5. **Reassigning the cashier from the POS cart has no app gate.** The server drops an unauthorized change without an error or a note (`Order_Writer.php:816-850`). The Orders › Edit path is gated. **Observed.**
6. **No ownership check on payments, receipts or order email.** These routes check `publish_shop_orders` or `access_woocommerce_pos` only. The same holds for Pro's payment-answer route (§4.2). **Observed.**
7. **Order reads are never scoped.** Neither lane scopes them by cashier or by store. Store reach covers registers, sessions, closures, records, reports and fiscal documents only (§4.3). **Observed.**
8. **Pro's single-store read skips authorization.** `get_store` does not apply the per-store `authorized_users` check that the store list applies (`pro:includes/Services/Stores.php:215-223`). **Observed;** the effect on `GET /stores/{id}` is **Inferred**.
9. **The cashier holds no delete cap.** No product, coupon or order delete is granted, so Void depends on the server refusal and the client's cancel fallback (`free:includes/Activator.php:1274-1294`; `app:packages/query/src/mutations/void-order.ts:19-25`). **Observed.**
10. **Nothing gates the till's sale controls.** Discounts, line price, tax, fees, status, customer, park, payment and receipts have no app gate and no server rule beyond WooCommerce's order edit and `publish_shop_orders` (§6.2). **Observed.**

## 8. Not determined

- **WooCommerce's own permission callbacks**, for refunds and for order, product and customer writes. WooCommerce source was not opened. **Unverified.**
- **Live behaviour.** Nothing was run. The fail-open and refresh timing in §3.4 are read from code only.
- **Whether a token refresh always changes the 10-character tail** that `useUserValidation` keys on. **Inferred**, not checked.
- **What an embedded web build does after boot.** Whether it ever re-reads caps beyond `initialProps` and the cashier fetch was not traced.
