# WooCommerce refund routes and filters (wcpos/roadmap#322)

Produced 2026-09-16 by a read-only research subagent (Claude Opus) against WooCommerce 11.1.0 and 10.4.3 in the wp-env checkouts and the plugin's `next` branch. Facts only, no live requests.

## 1. Store-wide `GET /wc/v3/refunds`

- Exists: `WC_REST_Refunds_Controller`, `includes/rest-api/Controllers/Version3/class-wc-rest-refunds-controller.php:20`, namespace `wc/v3`, base `refunds`, post type `shop_order_refund`. GET only (no create, single read or delete). Extends `WC_REST_Order_Refunds_Controller`.
- Registered as `'refunds' => 'WC_REST_Refunds_Controller'` (`includes/rest-api/Server.php:190`); the per-order route is `'order-refunds'` (`Server.php:179`), base `orders/(?P<order_id>[\d]+)/refunds`, GET/POST/DELETE.
- Added in **WooCommerce 9.0.0** (`@since 9.0.0` on the class and its methods; [PR #46895](https://github.com/woocommerce/woocommerce/pull/46895); [9.0 release post, 2024-06-18](https://developer.woocommerce.com/2024/06/18/woocommerce-9-0-our-most-accessible-checkout-and-much-more/)).
- The plugin declares `WC requires at least: 5.3` (`woocommerce-pos.php` header on `origin/next`), `WC tested up to: 11.1.0`. The floor is below 9.0.
- WC 11.1.0 added `POST /wc/v3/orders/{id}/refunds/preview` and `compute_totals` (`Version3/class-wc-rest-order-refunds-controller.php:43-59, 629-634`).

## 2. Collection params

Inheritance: `WC_REST_Refunds_Controller` → `WC_REST_Order_Refunds_Controller` (V3) → `WC_REST_Order_Refunds_V2_Controller` → `WC_REST_Orders_V2_Controller` → `WC_REST_CRUD_Controller` → `WC_REST_Posts_Controller`. Only the V2 refunds controller overrides `get_collection_params()`: it unsets `status`, `customer`, `product` (`Version2/class-wc-rest-order-refunds-v2-controller.php:871-877`).

Both refund routes accept (`Version3/class-wc-rest-crud-controller.php`): `context` (570), `page` (573), `per_page` (581, default 10, max 100), `search` (590), `after`/`before` (596/602, ISO8601), `modified_after`/`modified_before` (608/614), `dates_are_gmt` (620), `exclude`/`include` (626/635), `offset` (644), `order` (650), `orderby` (657-668: date, id, include, title, slug, modified), `parent`/`parent_exclude` (673/682), `dp`, `order_item_display_meta`, `include_meta`, `exclude_meta` (orders-v2 2171-2194).

- **`after`/`before` filter the refund's own creation date**: `prepare_objects_query` maps them to `date_query` on `post_date_gmt` (with `dates_are_gmt`) or `post_date` (`crud:310-322`), with `post_type = shop_order_refund` (`crud:344`). `modified_*` map to `post_modified(_gmt)` (`crud:324-336`).
- **`parent` is accepted and silently discarded on `/wc/v3/refunds`**: CRUD sets `post_parent__in` (`crud:297`), refunds-v2 overwrites it with the URL order id (`refunds-v2:267`), the store-wide controller unsets it (`refunds:70`). `parent_exclude` survives. The [docs](https://developer.woocommerce.com/docs/apis/rest-api/v3/refunds/) still list `parent`.
- **No `created_via` filter** on either refund route; it lives only on `WC_REST_Orders_Controller` (V3, `:458`, `:356-365`), which the refund controllers do not extend. Filter client-side or through `woocommerce_rest_refunds_prepare_object_query` (`refunds:82`).
- Status filtering removed; `post_status` forced to all order statuses (`refunds-v2:266`). No filter by `refunded_by`.

## 3. Payload

`get_formatted_item_data()` (`refunds-v2:147-184`): `id`, `date_created`, `date_created_gmt`, `amount`, `reason`, `refunded_by`, `refunded_payment`, `meta_data`, `line_items`, `shipping_lines`, `tax_lines`, `fee_lines`. **`parent_id` is added only by the store-wide controller** (`refunds:124-136`, schema `:168-184`). V3 adds `refund_total`, `api_restock`, `compute_totals`, COGS (`Version3 order-refunds:605-641`).

Schema (`refunds-v2:374-864`): `date_created` / `date_created_gmt` readonly; `amount`, `reason`, `refunded_by`, `meta_data` writable; `refunded_payment` readonly.

**Arbitrary meta can be written on POST** (`refunds-v2:310-313`: `MetaDataUtil::update( $request['meta_data'], $refund ); $refund->save_meta_data();`). `date_created` cannot be supplied through REST (`wc_create_refund()` is called with a fixed arg set, `:292-300`) although the function honours it when called directly (`wc-order-functions.php:663-665`).

## 4. WCPOS plugin (`origin/next`)

- No refund handling under `includes/Sync/`; `Sync_Journal::register_hooks()` (`:264-305`) listens to product/variation/coupon/term/tax/customer and order new/update/trash/delete/untrash, nothing on `woocommerce_order_refunded`, `woocommerce_refund_created`, `woocommerce_new_order_refund`, `woocommerce_update_order_refund`.
- **The parent order is journalled indirectly**: `wc_create_refund()` ends with `$order->set_date_modified( time() ); $order->save();` (`wc-order-functions.php:743-747`), firing `woocommerce_update_order` → `Sync_Journal::record_order_updated()` (`:563`), flushed on `shutdown`. A fully refunded order also gets `update_status()` (`:735-739`). The refund object fires only `woocommerce_update_order_refund`, which nothing observes.
- No `wcpos/v2` refund route. `POST …/payments/{uuid}/refund` (`Payments_Controller.php:44`, `:179-180`) allocates an existing WC refund to a payment row (`Ledger.php:589`); it creates nothing.
- `woocommerce_order_refunded` is hooked once, by `Fiscal_Record_Writers::handle_refund()` (`:33`, `:214-239`), writing the fiscal `refund` record (`order_id`, `refund_id`, `corrects_record_id`, `cashier_id = refunded_by`, payload from `Receipt_Data_Builder::build_refund_document()`). It does not touch the journal.

## 5. HPOS

- `WC_REST_Orders_V2_Controller::get_objects()` branches on `OrderUtil::custom_orders_table_usage_is_enabled()` and uses `WC_Order_Query` (`orders-v2:2213-2233`). Payload dates come from `$refund->get_data()` regardless of data store.
- `OrdersTableQuery::maybe_remap_args()` maps `post_date → date_created`, `post_date_gmt → date_created_gmt`, `post_modified → date_updated`, `post_parent__in → parent_order_id`, `post_parent__not_in → parent_exclude`, `post_type → type` (`OrdersTableQuery.php:262-304`); `process_date_query_columns()` remaps again (`:629-640`). `after`/`before` still filter the refund's creation date.
- Refund status is forced `completed` under HPOS (`OrdersTableRefundDataStore.php:143`; `WC_Order_Refund::get_status()` `:71-76`).

## Not found / not verified

- No WooCommerce tree older than 10.4.3 on the machine; the 9.0.0 introduction is from the docblock, the PR and the release post.
- No live request was issued; the `parent`-discarded finding is a code-path conclusion.
- Whether the plugin's permission layer admits a cashier to `GET /wc/v3/refunds` (`includes/Sync/Endpoint_Permissions.php`) was not traced.
- `wc/v4` refund routes (`Automattic\WooCommerce\Internal\RestApi\Routes\V4\Refunds`) not investigated.
