# Where cost of goods and other sensitive fields travel

**Research note, 2026-11-22**, for [roadmap#602](https://github.com/wcpos/roadmap/issues/602) (map [#599](https://github.com/wcpos/roadmap/issues/599), epic [#595](https://github.com/wcpos/roadmap/issues/595)). This note records facts only and proposes no design.

## Sources read

| Tag | What | Commit / version |
|---|---|---|
| `free:` | woocommerce-pos `main` | `a46ec86887e5f46d57542e8baf6f270c5678d22a` |
| `pro:` | woocommerce-pos-pro `main` | `a23ceffcc739f6217b72b05abf697a352c8c4db5` |
| `app:` | monorepo-v2 `main` | `a6526a5b4ff7fb476a0e221cfa33672acac2dbe1` |
| `wc:` | WooCommerce **11.2.1**, from a local wp-env copy ([GitHub tree](https://github.com/woocommerce/woocommerce/tree/11.2.1/plugins/woocommerce)) | 11.2.1 |

- I diffed the COGS-relevant `wc:` files against a local 11.3.0-beta.2 copy (`abstract-wc-order.php`, `class-wc-order-item.php`, `wc-order-functions.php`, `CogsAwareRestControllerTrait.php`). None of the differences touch COGS code.
- A few section-6 citations come from a 10.4.3 copy and are marked **(WC 10.4.3)**.
- Each conclusion carries a label:
  - **Observed**: I read the code path.
  - **Inferred**: I followed observed pieces to a conclusion I did not run.
  - **Unverified**: I could not check it.
- No store was run.

**Precondition for everything below.** WooCommerce adds cost fields only when its `cost_of_goods_sold` feature is enabled (`wc:src/Internal/CostOfGoodsSold/CostOfGoodsSoldController.php:44-46`, `CogsAwareTrait.php:20-23`). With the feature off, no response carries cost. Observed.

---

## 1. Bottom line

1. **A push without a cost does not lose the line's cost.** The server never takes a product line's cost from the payload. Whenever WooCommerce recalculates an order's COGS, it re-derives every product line as *the product's current cost × quantity* (`wc:includes/class-wc-order-item-product.php:642-650`). So an order, edit or refund whose payload has no cost still gets a cost, and a whole-document push that leaves the field out does not blank it. Observed in both lanes and in WooCommerce.
2. **That cost is the product's cost at the time of the *latest recalculation*, not at the sale.** WooCommerce recalculates every line of an order in these cases:
   - when the order is created;
   - on any update that posts `line_items`, `billing`, `shipping`, `shipping_lines`, `fee_lines` or `coupon_lines`;
   - on `recalculate_coupons()`;
   - on a tip retotal;
   - on every refund.

   A sale reopened and edited, or refunded, after a product's cost changed is re-costed at the new cost, including the lines that were not touched. This is WooCommerce's own behaviour, not WCPOS's. Observed, not run.
3. **`wcpos/v2` protects a paid, locked sale from that recalculation only when the push leaves its lines unchanged.** A refund re-costs it anyway. Observed.
4. **Cost leaves the store through WooCommerce's own serializers on every product, variation, order and refund lane.** No WCPOS code names `cost_of_goods_sold`. There is no single WCPOS seam: the field rides in at least nine call sites (§2). Observed.
5. **On the till, cost is stored verbatim** in the sync-engine's open `payload` objects. It also sits in mutation-queue rows and 409 conflict documents. Three report panels show it, and it goes out on print and CSV. Receipts and the customer display carry none. Observed (helper trace, spot-checked).
6. **A cashier can change a product's cost today.** It is one field in a push to `wcpos/v2/push/products` (or `variations`), or to the `wcpos/v1` product routes, gated only by WooCommerce's `edit_products`, which the default cashier role holds. The app's Products table exposes it as an editable cell, gated client-side on Pro plus `canEditProducts`. Observed.
7. **Customer contact data, stock, other cashiers' orders and arbitrary plugin `meta_data` reach every till unfiltered.** The only field-level masking anywhere is on closures and sessions, keyed to `view_woocommerce_pos_reports`, which cashiers hold by default. Observed.

---

## 2. Out of the store: routes that carry cost

### 2.1 What WooCommerce emits

| Object | Field | Source |
|---|---|---|
| Product | `cost_of_goods_sold { values[{defined_value, effective_value}], total_value }` | `wc:src/Internal/CostOfGoodsSold/CogsAwareRestControllerTrait.php:19-37`, added at `wc:includes/rest-api/Controllers/Version3/class-wc-rest-products-controller.php:2141-2142` |
| Variation | the same, plus `defined_value_is_additive` | trait `:34-36`, `class-wc-rest-product-variations-controller.php:174-175` |
| Order | `cost_of_goods_sold.total_value` | `class-wc-rest-orders-controller.php:496-498` |
| Order line | `line_items[].cost_of_goods_sold.value` (moved from the item's `cogs_value`) | `class-wc-rest-orders-controller.php:484-494` |
| Refund | `cost_of_goods_sold.value`, plus `line_items[].cost_of_goods_sold.value` | `class-wc-rest-order-refunds-controller.php:576-597` |

- WooCommerce applies no capability check to these fields, only the feature check. Observed.
- Cost never rides in `meta_data`:
  - Product `_cogs_total_value` is an internal key (`wc:includes/data-stores/class-wc-product-data-store-cpt.php:80`).
  - Variation `_cogs_value_is_additive` is an internal key (`class-wc-product-variation-data-store-cpt.php:29-33`).
  - Order-item `_cogs_value` is hidden because the item's data keys are prefixed into the excluded set (`wc:includes/data-stores/class-wc-data-store-wp.php:110-120,204-206`). The item has a `cogs_value` data key only while the feature is on (`wc:includes/class-wc-order-item.php:98-101`).

  Observed.
- Inferred: if the merchant later turns COGS off, any stored `_cogs_value` item rows would surface in line `meta_data`, because the data key that hides them disappears.

### 2.2 WCPOS lanes that pass the field through

Every lane below hands WooCommerce's response through with cost intact (Observed). None of them filters it.

| Lane | Serializer it passes through | Cite |
|---|---|---|
| `wcpos/v1/products`, `/products/{id}/variations` (Free, and Pro subclasses) | `WC_REST_Products_Controller` / `WC_REST_Product_Variations_Controller` subclasses | `free:includes/API/V1/Products_Controller.php:35`, `Product_Variations_Controller.php:34`; `pro:includes/API/V1/Products_Controller.php:30`, `Product_Variations_Controller.php:29` |
| `wcpos/v1/orders` (frozen lane) | `WC_REST_Orders_Controller` subclass | `free:includes/API/V1/Orders_Controller.php:50` |
| `wcpos/v1` and `v2 /orders/{id}/refunds` (Pro): response to the POST, and its idempotent replay | `WC_REST_Order_Refunds_Controller` subclass; `Refund_Processor::build_response_payload` only adds keys | `pro:includes/API/V1/Order_Refunds_Controller.php:28,155`; `pro:includes/Payments/Refund_Processor.php:531-537,647-653` |
| `wcpos/v2/products`, `/orders`, `/customers`, `/refunds`, etc. (catalog proxy) | internal `rest_do_request` to `wc/v3`, then the behaviour's batch filter | `free:includes/API/V2/Catalog_Proxy_Controller.php:75-93`; collection rows `free:includes/Sync/Collections.php:78-83,148-153,342-350` |
| Orders proxy rows | `Order_Serializer::document()` over the `wc/v3` payload | `free:includes/API/V2/Proxy/Orders_Proxy_Behavior.php:86-89` |
| `wcpos/v2/orders/pull` | `Order_Serializer::serialize_order()`, which builds the order with `WC_REST_Orders_Controller::prepare_object_for_response` | `free:includes/API/V2/Orders_Controller.php:111,169`; `free:includes/Sync/Order_Serializer.php:102-113,162-169` |
| `wcpos/v2/variations` | `Product_Serializer::stamp_record()` | `free:includes/API/V2/Variations_Controller.php:321` |
| `wcpos/v2` barcode resolve | `Product_Serializer::stamp_record()` | `free:includes/API/V2/Resolve_Controller.php:115` |
| `wcpos/v2/push/*` write acks | products: `Product_Serializer::augment` over a dispatched `wc/v3` read; orders: `Order_Serializer::document()` | `free:includes/API/V2/Write_Controller.php:752-760`; `free:includes/API/V2/Writers/Order_Writer.php:330-341`; `Variation_Writer.php:85` |

`Product_Serializer::serialize()` is the shared product assembly line (`free:includes/Sync/Product_Serializer.php:117-134`). The order lanes share `Order_Serializer::document()`, except the frozen v1 order lane, which bypasses it by design (`Order_Serializer.php:86-89`). So no single WCPOS seam covers every lane: products, v2 orders, v1 orders, the proxy and Pro refunds each reach WooCommerce's serializer separately. Observed.

### 2.3 Lanes that do not carry the value, but depend on it

- **`/changes/revision-hash`** returns `{id, revision}` only. The revision is an md5 of the full serialized product, cost included, so an admin cost change moves every till's revision signal and triggers a re-pull. `free:includes/API/V2/Changes_Controller.php:391-407,686-693`. Observed.
- **Order CAS revision.** It hashes every top-level key of WooCommerce's own order schema except the four timestamps (`free:includes/Sync/Order_Serializer.php:499-568`, schema read at `:501-510`). That includes `cost_of_goods_sold` whenever the feature adds it to the schema (`wc:.../class-wc-rest-orders-controller.php:394-396`). Line items are hashed whole, `cost_of_goods_sold` included. Observed: the cost is part of every order's revision.
- **Digests, integrity scan, sequence log.** These carry hashes or ids only (`Digests_Controller.php` header; `Integrity_Controller.php` header). Neither digest builder names COGS (grep for `cogs` in `free:includes/Sync/Integrity_Digest.php` and `Digest_Index.php` found nothing). Observed.
- **Receipts.** `free:includes/Services/Receipt_Data_Builder.php` has no cost or COGS key; grep for `cogs` and `cost` found nothing relevant. Observed.
- **Reports.** "No built-in report is computed on the server" (`free:includes/API/V2/Reports_Controller.php:20`). Margin is computed on the device (§3). Observed.
- **Census.** The app still counts variations on `wcpos/v1` (`free:includes/API/V2/Variations_Controller.php:213-218`). Unverified whether that request narrows `_fields`; if it does not, the body carries cost.

---

## 3. On the till: what stores cost

From a read-only helper trace of `app:`, with key claims spot-checked.

- **The `packages/database` schemas are types only.** `products`, `variations`, `orders` and `refunds` declare `cost_of_goods_sold` (`app:packages/database/src/collections/schemas/products.ts:91-116`, `variations.ts:66-95`, `orders.ts:91-100,294-303`, `refunds.ts:23`). None is registered as a collection (`app:packages/database/src/collections/index.ts:369-392`). Observed.
- **Real storage is the sync-engine collections, with an open `payload`.**
  - `app:packages/sync-engine/src/collections/product-schema.ts:38`
  - `variation-schema.ts:110`
  - `order-schema.ts:19`
  - `refund-schema.ts:57-65`

  So `cost_of_goods_sold` is kept whether declared or not. No promoted column or index holds cost. Observed.
- **No inbound filter.** Materialization strips `_rxdb_digest` and order display fields only (`app:packages/sync-engine/src/materialization/record-materialization.ts:69-74,185-234`). The app sends no `_fields` narrowing (helper grep). Observed.
- **Mutation queue: products and variations.**
  - Rows store an open payload (`app:packages/sync-core/src/recordMutationQueue.ts:1431`) and a `conflictDocument` (`:1448`).
  - Outbound product payloads are cut to `{values:[{defined_value}], defined_value_is_additive?}`. The field is dropped when there is no finite `defined_value` (`app:packages/sync-engine/src/materialization/sanitize-outbound-product-payload.ts:35-71`).

  Observed.
- **Mutation queue: orders.**
  - The order strip removes money fields and server-owned meta, not cost (`app:packages/sync-core/src/woo/orderWriteContract.ts:49-104`). Observed.
  - A coalesced row is rebuilt as resident ⊕ prior ⊕ incoming (`app:packages/sync-engine/src/write-path/write-intents.ts:700-718`), so it can carry the resident cost to the wire. Inferred.
  - On a 409, the server's document, cost included, is stored on the queue row (`app:packages/sync-core/src/drainMutationQueue.ts:1130-1135`). Inferred.
- **Logs.**
  - `logs.context` is open (`app:packages/database/src/collections/schemas/logs.ts:43-46`). The redactor masks credentials, email and phone only (`app:packages/utils/src/logger/redact.ts:102-159`).
  - No log call attaching a product or order payload was found. Observed.
  - Conflict recovery logs differing field *paths*, which could name `line_items[n].cost_of_goods_sold.value` (`drainMutationQueue.ts:1096-1113`). Inferred.
- **No stored margin aggregate.** Margin is recomputed per render from local orders, refunds and products (`app:packages/core/src/screens/main/reports/margin.ts:17-57`, `reports/report/sales-figures.ts:133-141`). Observed.
- **Receipt snapshot and customer display.**
  - `ReceiptLine` and `ReceiptData` have no cost field and are built field by field (`app:packages/core/src/screens/main/receipt/utils/build-receipt-data.ts:73-111,188-206,673-746`).
  - The display broadcast is `{order, ledger}` built from that receipt data (`app:packages/core/src/screens/main/pos/customer-display/snapshot-source.tsx:77-85`, `use-display-snapshot.ts:64-70`).
  - Observed for the receipt; Inferred for the display.

## 4. On the screen and on paper

| Where | What | Cite | Label |
|---|---|---|---|
| POS product table | `cost_of_goods_sold` column, read-only, hidden by default | `app:packages/core/src/screens/main/pos/products/cells-for-row.ts:29,39`, `cells/cogs.tsx:17-21`, `contexts/ui-settings/initial-settings.json:120-122` | Observed |
| POS variations pane | same cell | `pos/products/variations-pane.tsx:156` | Observed |
| POS product tiles | "Cost:" / "COGS:" when the tile field is on (off by default) | `pos/products/tiles/tile-words.tsx:131-135`, `variation-tile.tsx:202`, `inline-variable-tile.tsx:250-252`, `initial-settings.json:53` | Observed |
| Products management table | **editable** money cell over `values[0].defined_value`; disabled when Pro access is read-only or the user lacks `canEditProducts` / `canEditVariations` | `app:packages/core/src/screens/main/products/cells/cogs.tsx:26-58`, `products.tsx:100,117,136` | Observed |
| Product / variation edit forms | no cost field | `products/edit/product/form.tsx:35-50`, `edit/variation/form.tsx:29-40` | Observed |
| Reports: Products, Categories, Brands panels | Cost, Profit and Margin % columns, shown when any line carries cost | `reports/panels/specs.ts:139-184`, `margin.ts:17-57` | Observed |
| Report CSV export and printed report | the same columns | `reports/panels/export-csv.ts:5-19`, `panels/document.ts:21-27`, `panels/use-report-print.ts:60-78` | Observed |
| Report cards | no figure; cost presence only decides whether the Brands card shows | `reports/cards/index.tsx:48-52` | Observed |
| Receipts (app model, bundled templates) | none | §3 | Observed |
| Server template gallery | not read | lives in `free:`; see `app:apps/template-studio/scripts/studio-paths.ts:22-30` | Unverified |

---

## 5. Writes: does a sale saved without a cost keep its historical cost?

### 5.1 How WooCommerce sets a line's cost

**Each line's cost is derived, never taken from the payload, for any line whose product exists.**
- `WC_Order_Item_Product::calculate_cogs_value_core()` returns `$product->get_cogs_total_value() * quantity`. It reads the product **as it is now** (`wc:includes/class-wc-order-item-product.php:642-650`).
- `calculate_cogs_value()` writes that value over whatever the item held. It keeps the old value only when the result is `null`, which happens when the product no longer exists (`wc:includes/class-wc-order-item.php:518-540`).

Observed.

**An order recalculation re-costs every line.** `calculate_cogs_total_value()` → `calculate_cogs_total_value_core()` calls `calculate_cogs_value()` on every item of every grouped type (`wc:includes/abstracts/abstract-wc-order.php:3086-3127`). For a shop order it also re-costs each refund's items and subtracts them (`wc:includes/class-wc-order.php:2611-2636`). The order's `save()` then saves every loaded item (`abstract-wc-order.php:477-545`), and the item data store writes `_cogs_value`, deleting it when the value is 0 (`wc:includes/data-stores/abstract-wc-order-item-type-data-store.php:86-88,121-123,230-252`). Observed.

**When the recalculation runs:**

| Trigger | Cite |
|---|---|
| `calculate_totals()` | `abstract-wc-order.php:2549-2551` |
| REST create, always | `class-wc-rest-orders-controller.php:277-281` |
| REST update that posts `billing`, `shipping` or any line collection | `class-wc-rest-orders-controller.php:283-286` |
| `recalculate_coupons()`, which ends in `calculate_totals( true )` | `abstract-wc-order.php:1902,1955` |
| `wc_create_refund()`, on the refund and on the parent order | `wc:includes/wc-order-functions.php:659-660,746-748` |

Observed.

**A posted cost is accepted, then overwritten.**
- WooCommerce's REST line handler sets a posted `line_items[].cost_of_goods_sold.value` (`class-wc-rest-orders-controller.php:189-202`).
- The same request's `calculate_totals()` then re-derives it.
- So a posted cost survives only on a line with no resolvable product, such as a deleted product or a WCPOS miscellaneous line with `product_id` 0. Inferred from the two observed steps.
- The top-level `cost_of_goods_sold.total_value` is `readonly` in the schema (`:407-420`), so it is never written from a request. Observed.

**A refund's cost is the product's current cost too.** `wc_create_refund()` copies each refunded item (`new $class( $item )`), negates the quantity, then runs `$refund->calculate_totals( false )` (`wc-order-functions.php:634-660`). That re-derives the refund line from the product's current cost. The parent order is then recalculated and saved (`:746-749`), which re-costs its original lines too. Observed.

### 5.2 The `wcpos/v2` lane (`POST wcpos/v2/push/orders`, the app's only order write lane)

- The app pushes to `{syncBase}/push/{collection}` (`app:packages/sync-core/src/recordPushAdapter.ts:41-50`). Observed.
- **Shaping.** `Order_Writer` shapes the body with `Pushable_Document::shape()` (`free:includes/API/V2/Writers/Pushable_Document.php:63-80`). That drops:
  - the server money fields (`free:includes/Services/Pos_Order_Audit.php:72`);
  - `tax_ids` and `created_via`;
  - audit meta and item storage meta (`free:includes/Sync/Order_Write_Payload.php:79-112,125-160`).

  It **neither strips nor adds** `cost_of_goods_sold`. Observed.
- **Forwarding.** It forwards to `wc/v3/orders` by an internal `rest_do_request` (`free:includes/API/V2/Write_Controller.php:698-731`; route from `free:includes/Sync/Collections.php:154`; dispatch at `Order_Writer.php:423`). So §5.1 applies unchanged. Observed.
- **Create.** WooCommerce always recalculates, so each line gets its product's cost at that moment. Observed.
- **Update of an editable order** (`pos-open`, `pending`, `on-hold`). A full-document push posts `line_items` and the addresses, so WooCommerce recalculates and **every line is re-costed at today's product cost**. Observed.
- **Update of a locked (paid) order whose lines did not change.** The lines and addresses are removed from the forward; the addresses are applied afterwards without a recalculation (`free:includes/API/V2/Writers/Order_Writer.php:719-730,288-297`). The stored line costs stay as they were. Observed.
- **Which edits count as a line change.** `lines_changed()` compares quantity, subtotal, total, product, variation, tax class and `_woocommerce_pos_data`, not cost (`Order_Write_Payload.php:232-277`). A changed line on a locked order is refused unless the same push reopens it (`Order_Writer.php:766-789`). Observed.
- **Reopen plus edit.** The forward carries lines, so WooCommerce re-costs the whole order. Observed.
- **Coupon re-apply.** A line edit with an unchanged coupon set calls `recalculate_coupons()` after the write (`Order_Writer.php:424-431,733`). That is a second full recalculation. Observed.

### 5.3 The `wcpos/v1` lane (`wcpos/v1/orders`, frozen; still served)

- `Orders_Controller::create_item()` and `update_item()` shape the request (`free:includes/API/V1/Orders_Controller.php:374-458,488-529`) and call the WooCommerce parent. `save_object()` only wraps the parent for stock reservation (`:126-165`).
- `for_partial_update()` does not touch cost (`Order_Write_Payload.php:334-344`).
- There is no locked-order guard on this lane, so any v1 update that posts lines or an address re-costs every line, whatever the order's status. Observed.

### 5.4 Refunds (Pro `wcpos/v1` and `v2 /orders/{id}/refunds`)

- The request is normalised to `{id, quantity, refund_total, refund_tax}` per line, so any cost in the payload is dropped (`pro:includes/API/V1/Order_Refunds_Controller.php:186-238`). Observed.
- The app sends no cost anyway (`app:packages/core/src/screens/main/orders/refund/use-refund-mutation.ts:63-71`). Observed.
- `Refund_Processor` hands the request to WooCommerce's refunds controller (`pro:includes/Payments/Refund_Processor.php:531-576`). So §5.1 applies: the refund line and the whole parent order are re-costed at current product cost. Observed.

### 5.5 Other WCPOS-triggered recalculations

- A tip retotal runs `calculate_totals( false )` (`free:includes/Payments/Contract/Ledger.php:1232-1242`). Observed.
- No WCPOS code hooks `woocommerce_calculated_order_item_cogs_value`, `woocommerce_calculated_order_cogs_value` or `woocommerce_load_order_item_cogs_value` (grep for `cogs` across `free:includes` and `pro:includes` found nothing). Observed.

### 5.6 Answer

**Does the server record a per-line cost when the payload has none?**
Yes, in both lanes and for refunds. It is computed from the product, never read from the payload. Observed.

**Is it the right *historical* cost?**
- **Yes** for a sale created and never recalculated.
- **No** once anything recalculates it after the product's cost changed. In that case every line, untouched ones included, takes the product's current cost. The triggers are a reopen-and-edit, a line or address edit on an open order, a v1 update with lines or addresses, a coupon re-apply, a tip retotal, or any refund.
- Observed in WooCommerce 11.2.1 and the WCPOS lanes. The end-to-end effect is not run.

**Does a whole-document push that omits the field blank it?**
No. An absent `cost_of_goods_sold` is never read: the order setter loop has no setter for it, and the line handler reads it only when it is non-null (`class-wc-rest-orders-controller.php:196-199`). The value is re-derived from the product anyway. Observed.

**The one way a stored line cost reaches 0.**
The line's product now has no cost, or the line's quantity is 0. A 0 value deletes the `_cogs_value` row (`abstract-wc-order-item-type-data-store.php:248-249`). Observed.

**Products.** A whole-document product push that omits `cost_of_goods_sold` leaves the product's cost alone, because WooCommerce sets it only when `values` is present (`CogsAwareRestControllerTrait.php:45-55`). A push with `values: []` would set it to 0, but the app's sanitizer never sends an empty `values` (§3). Observed.

---

## 6. Can a cashier change a cost today?

- **Product and variation cost: yes.**
  - Server side, both product write lanes pass the payload through unchanged:
    - `wcpos/v2/push/products` and `/variations` forward to `wc/v3/products` (`free:includes/Sync/Collections.php:84,126`) through `Null_Writer` / `Variation_Writer` (`free:includes/API/V2/Writers/Collection_Writer_Resolver.php:27-38`, `Null_Writer.php:19-36,54-56`).
    - `wcpos/v1/products` and `wcpos/v1/products/{id}/variations` extend WooCommerce's product controllers (§2.2).
  - WooCommerce applies `cost_of_goods_sold.values[].defined_value` (summed) and `defined_value_is_additive` (`CogsAwareRestControllerTrait.php:45-62`; called at `class-wc-rest-products-controller.php:1152-1153` and `class-wc-rest-product-variations-controller.php:433-434`).
  - The permission is WooCommerce's own product check (`free:includes/Services/Permission_Rules.php:20,110-128`). The default cashier role holds `edit_products`, `edit_others_products`, `edit_published_products` and `publish_products` (`free:includes/Activator.php:1270-1280`).
  - In the app, the Products table's cost cell commits `cost_of_goods_sold` (§4), gated client-side on Pro and `canEditProducts`.
  - Observed.
- **Stale overwrite.** A coalesced product push carries the till's resident `defined_value` (`write-intents.ts:700-718` with the sanitizer). If an admin changed the cost after the till's base revision, the push is a stale write that CAS should refuse, because the product revision includes cost (§2.3). Inferred.
- **Order line cost: no in practice.**
  - A posted line cost is overwritten by the recalculation in the same request (§5.1).
  - The exception is a line without a resolvable product, such as a misc line or a deleted product, where a posted `line_items[].cost_of_goods_sold.value` would persist. Inferred.
  - The order total cost is read-only. Observed.
- **Refund cost: no.** Refund line payloads are normalised to four keys (§5.4). Observed.

---

## 7. Other sensitive fields (lower depth)

From a read-only helper trace. The headline claims were spot-checked: customers `role=all`, v2 read permission, order pull query, and closure masking.

**Read floor for every v2 sync read.** The proxy lists, `/orders/pull`, `/changes`, `/resolve` and `/variations` require only `access_woocommerce_pos` plus store health (`free:includes/Sync/Endpoint_Permissions.php:51-63`). The proxy then also runs WooCommerce's own route check (`Catalog_Proxy_Controller.php:84-93`). Observed.

**Customer email, phone and addresses**
- `wcpos/v2/customers` proxies `wc/v3/customers` and defaults `role` to `all`, so every WordPress user is served, staff included (`free:includes/API/V2/Proxy/Customers_Proxy_Behavior.php:34-38`). v1 does the same (`free:includes/API/V1/Customers_Controller.php:173-175`).
- The read is gated by WooCommerce's `list_users`, which the cashier role holds (`free:includes/Activator.php:1285`).
- WooCommerce itself shows customer `meta_data` only to administrators (WC 10.4.3 `class-wc-rest-customers-v2-controller.php:80-89`). WCPOS re-adds every non-`is_protected_meta` user meta key for every POS user (`free:includes/API/V1/Customers_Controller.php:343-413`; `free:includes/Services/Customer_Meta_Parity.php:20-26,56-89`).
- Orders carry billing and shipping unfiltered (`Order_Serializer.php:102-147`).
- Observed.

**Stock quantities**
- Served on every product lane through WooCommerce's serializers, plus a postmeta fast path for `_fields=id,stock_quantity,…` (`free:includes/API/V2/Proxy/Products_Proxy_Behavior.php:143-216`).
- The read capability is `read_private_products`, held by cashiers.
- No stock filtering exists in Free or Pro.
- Observed.

**Other cashiers' sales**
- `/orders/pull` has no user condition (`free:includes/Sync/Order_Query.php:75-84`). Its narrowing filter `wcpos_order_pull_ids` (`free:includes/API/V2/Orders_Controller.php:144`) has no consumer in Free or Pro.
- `pos_cashier` is a filter the client may send (`free:includes/Sync/Collection_Rules.php:190-194`). Ownership rules cover edit and delete, not read (`Permission_Rules.php:31-56`).
- Observed.
- **Reports.** The app's Sales room defaults to the signed-in cashier but can switch to "Everyone" (`app:packages/core/src/screens/main/reports/index.tsx:398-405`), computed from the unscoped local orders. Inferred.
- **Closures and sessions.**
  - Lists are narrowed by store, not by cashier (`free:includes/API/V2/Closures_Controller.php:153,186-187`, `Sessions_Controller.php:188,241`).
  - Expected, variance and totals are stripped only from users without `view_woocommerce_pos_reports` (`Closures_Controller.php:108-122`, `Sessions_Controller.php:212-217,253-261`). Cashiers hold that capability by default (`Activator.php:1272`).
  - Observed.

**Product and order `meta_data`, including wholesale and supplier meta**
- WooCommerce hides only internal keys and `wp_*` keys, not every underscore key (`wc:includes/data-stores/class-wc-data-store-wp.php:214-216`).
- WCPOS's `Meta_Normalizer` decodes values and enforces size limits, with no key allow-list or deny-list (`free:includes/Sync/Meta_Normalizer.php:24-62,161-228`). The v1 `wcpos_parse_meta_data` likewise only enforces a size limit (`free:includes/API/V1/Traits/WCPOS_REST_API.php:126-161`).
- Observed.
- Any plugin's product or order meta reaches the till and is stored in the open payload. That includes wholesale prices, supplier fields and third-party COGS keys such as `_alg_wc_cog_*`. Inferred.
- The legacy app filter that dropped underscore meta (`app:packages/database/src/plugins/parse-rest-response.ts:74-83`) is not on the sync path. Inferred.

**Other users' personal data**
- `wcpos/v1/cashier/{id}` returns the cashier's own record: email, roles and capabilities (`free:includes/Services/Cashier.php:72-109`).
- Registers, closures and movements carry other users' ids and display names (`free:includes/API/V2/Registers_Controller.php:77-79,454-460`, `free:includes/Services/Closure_Store.php:405-412`).
- Staff email and address arrive through the customers route above.
- Observed.

---

## 8. What breaks if cost is withheld (facts only)

- **Margin columns disappear.** They show only when some line carries cost (`app:.../reports/report/sales-figures.ts:133-141`), so a till that never receives cost shows no Cost, Profit or Margin columns. Observed.
- **The Products table cost cell would read 0.** It reads `values[0].defined_value`, defaulting to 0 (`app:.../products/cells/cogs.tsx:28`). Committing an edit from that state would write the typed value. Observed.
- **Revisions and digests hash cost on the server.** Order CAS revisions are built from WooCommerce's schema, cost included, and the product revision signal includes cost (§2.3). The server compares the client's *claimed* revision string, not a revision the client computes. Whether a per-role response that drops the field would still match is a design question this note does not answer. Observed for the hashing; the consequence is not evaluated.
- **The order write path never reads cost.** Withholding it from a cashier's payloads changes nothing the server stores (§5). Observed.

## Could not determine

- Whether the app's `wcpos/v1` variations census request narrows `_fields`, and so whether that body carries cost.
- The server-side receipt template gallery's fields.
- End-to-end runtime confirmation of §5. It is code-read only; no store was run.
