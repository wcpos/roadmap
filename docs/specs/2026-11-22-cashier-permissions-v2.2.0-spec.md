# Control what each cashier can do: the v2.2.0 contract

Date: 2026-11-22. Lane: `main` (2.0) in every repo. Owner: Paul. Status: **decided, not built**. Release: [v2.2.0](https://github.com/wcpos/roadmap/issues/452). Map: [wcpos/roadmap#599](https://github.com/wcpos/roadmap/issues/599), every ticket closed.

This document is the build contract. It gathers what the map's sixteen tickets decided into one place; where a section is short, the linked ticket's resolution comment holds the detail and the reasons. It does not re-decide anything. If the two disagree, the ticket's resolution is the ruling and this file has a defect.

Evidence is in `docs/research/2026-11-22-*.md` (seven files): the permission machinery on `main`, prior art on permissions and on PINs, the cost and sensitive-field trace, till behaviour on a permission change, the till settings inventory, and switching and the token model. The Access screen mockup is `docs/prototypes/2026-11-22-access-screen-permissions/`; its `variants/v3/changes.md` is the build checklist for that screen.

## 1. Language

- **Permission**: something an owner switches per role on the Access screen. Always a WordPress capability on the role.
- Four kinds, by what the store does: **action permission** (the store refuses the write), **data permission** (the store withholds a field from every response), **page permission** (the page is gone; its data refused where the till does not need it), **own-sales scope** (the store narrows every list to the cashier's own).
- **Store setting**: a till preference the owner sets once for the store. Not a permission, not per role. A **locked** store setting is one a cashier may not change for themselves.
- **Enforced by your store** and **Hidden at the till**: the owner-facing words for the two tiers.
- **Cashier PIN**: a 4 to 6 digit code that lets a person take over or unlock a shared till as themselves.

Glossary entries for the monorepo's `CONTEXT.md` land with slice 1.

## 2. The rules everything follows ([#605](https://github.com/wcpos/roadmap/issues/605))

1. **Anything a cashier's token could do or read through the API is enforced by the store.** The app hiding it is only the visible half.
2. Only two things are honoured by the app alone: **store settings with their locks**, and the **Orders and Customers page rows** (the till needs that data to sell). The Access screen says which rows those are.
3. **Gone or read-only, by what the thing is.** A control that only acts (Refund, Void, Add discount, No sale, a menu page) is gone. A field that also shows a value (line price, tax, a store setting) stays visible and read-only, with no lock decoration. A locked store setting alone carries "Set by your store".
4. **Every new permission is granted when it is introduced**, to every role that has POS access, with a per-capability "introduced" marker so a later version never re-grants one an owner removed. The one exception is a permission **split out of an existing one** (§3, the three splits): it is granted only to roles that held the capability it came from, so a role an owner had already restricted stays restricted. Either way, nothing changes in a store until its owner switches something off.
5. **A restriction never sits behind a licence check** ([#612](https://github.com/wcpos/roadmap/issues/612)). Everything here is Free except the other-stores scope and per-store setting values, which are Pro.
6. Permissions are per role. No per-person exceptions. Nothing in WP Admin outside the POS screens is scoped. A manager approving a blocked action at the till is not in this release.

## 3. The permission list ([#606](https://github.com/wcpos/roadmap/issues/606))

Names follow the pattern 2.0 shipped: `<verb>_woocommerce_pos_<noun>`. 28 rows: 8 exist, 20 are new.

| Group | Owner-facing name | Capability | Kind | Without it | Status |
|---|---|---|---|---|---|
| Selling | Give a discount (cart or line) | `apply_woocommerce_pos_discounts` | action | discount controls gone | new |
| | Change a line's price | `edit_woocommerce_pos_prices` | action | price read-only | new |
| | Apply a coupon | `apply_woocommerce_pos_coupons` | action | coupon control gone | new |
| | Add a custom item, fee or shipping | `add_woocommerce_pos_custom_lines` | action | menu entries gone | new |
| | Change tax or mark a sale tax exempt | `edit_woocommerce_pos_taxes` | action | tax read-only | new |
| | Void an open sale | `void_woocommerce_pos_sales` | action | Void gone | new |
| After the sale | Refund | `refund_woocommerce_pos_sales` | action | Refund gone | new |
| | Reopen or edit a completed sale | `reopen_woocommerce_pos_sales` | action | Reopen gone, order read-only | new |
| | Change an order's status | `edit_woocommerce_pos_order_status` | action | status read-only | new |
| | Reassign a sale's cashier | `reassign_woocommerce_pos_sales` | action | cashier read-only, in the POS cart too | exists |
| | See other cashiers' sales | `view_others_woocommerce_pos_sales` | own-sales scope | lists narrowed to own | new |
| | See other stores' sales (Pro) | `view_other_stores_woocommerce_pos_sales` | own-sales scope | lists narrowed to this store | new |
| Customers | Add a customer | `create_customers` | action | Add gone | exists |
| | Edit a customer | `edit_users` | action | read-only | exists |
| | See customer contact details | `view_woocommerce_pos_customer_details` | data | email, phone, addresses withheld | new |
| Products | Edit products | `edit_products` family | action | read-only | exists |
| | Change stock levels | `edit_woocommerce_pos_stock` | action | stock read-only | new, split from Edit products |
| | See cost, profit and margin | `view_woocommerce_pos_costs` | data | cost withheld; cost, profit, margin columns gone | new |
| | Manage coupons | `edit_shop_coupons` family | action | read-only | exists |
| Cash | Open and close the register, cash in and out | `manage_woocommerce_pos_cash` | action | register controls gone | exists |
| | Open the drawer without a sale | `open_woocommerce_pos_drawer` | action | No sale gone | new, split from the row above |
| | See expected cash | `view_woocommerce_pos_expected_cash` | data | expected figures withheld: the blind count | new, split from Reports |
| | Approve a variance or recount | `manage_woocommerce_pos_closures` | action | no change | exists |
| Pages | Reports | `view_woocommerce_pos_reports` | page | page gone, data refused | exists |
| | POS settings | `view_woocommerce_pos_settings` | page | page gone | new |
| | Store health and logs | `view_woocommerce_pos_health` | page | page gone | new |
| | Orders | `view_woocommerce_pos_orders_page` | page, hidden at the till | menu entry gone | new |
| | Customers | `view_woocommerce_pos_customers_page` | page, hidden at the till | menu entry gone | new |

- **The three splits** grant the new capability to every role that held the one it came from. "See expected cash" amends the till ruling ([#213](https://github.com/wcpos/roadmap/issues/213)): a role that had lost the reports capability also lacks the new one, so an existing blind count stays blind.
- No permission carries a number. Numeric limits are store settings.
- The Access screen's existing rows that are not in this table (Use the POS, Manage POS settings in WP Admin, Delete products, Delete coupons, Manage categories) stay as they are.

## 4. Slice 1: the foundation

**Plugin (Free).**
- One **registry** of POS permissions: capability, owner-facing name, group, kind, tier, default per role, version introduced, and for action permissions the fields it guards (§6). It is the single source for activation grants, the Access screen, the capabilities served to the app and the server checks.
- Grants run from the registry, additive, with the per-capability introduced marker.
- `effective_capabilities()` serves every registry row, and every row another plugin adds through `wcpos_access_settings` (today such a row is saved but never sent to the app).
- A **permissions stamp** on every sync response: a short value that changes when the signed-in cashier's effective permissions, their store's settings or locks, or their PIN state change.

**App.**
- One capability source. **A failed or missing permissions read denies, never allows** (today a missing list grants most capabilities and a failed fetch keeps the old list with no limit).
- When the stamp on a sync response differs from the one held, the app re-reads the cashier record and the store record at once. Online tills learn within one sync. Offline tills keep what they last knew, with no time limit; the store judges every write on arrival.
- A **Refresh permissions** action in Store health.
- **Losing access altogether is learned from the refusal.** Today the cashier record answers 403 to a role without `publish_shop_orders`, and every POS route answers 403 once `access_woocommerce_pos` is gone, so no stamp arrives. The app treats either refusal as "this cashier may no longer use the POS": everything gated is denied and the till shows its existing no-access state. Unsynced sales stay on the device, as today.
- A hidden browser tab makes no requests, so it learns when it is next visible.

**Access screen (Free, WP Admin).** Rebuilt to the mockup's promise table: one grouped table per role from the registry; the ordinary promise said once above it; a line only on the five rows that work differently; "Show only restrictions"; the changed dot per row. The role list, Restore defaults and its dialog, the notice and Advanced stay where they are. The Restore dialog lists what will change; it does not list every row that is kept.

## 5. Slice 2: hidden cost, and the reset ([#608](https://github.com/wcpos/roadmap/issues/608), [#609](https://github.com/wcpos/roadmap/issues/609))

**Plugin (Free).**
- One list of **withheld fields**, each tied to a data permission. For a role without `view_woocommerce_pos_costs`, `cost_of_goods_sold` is stripped where a response is written, on every route in both lanes and every sync stream (products, variations, orders, order lines, refunds, refund lines, write responses).
- **Never strip where the product is read.** WooCommerce computes a line's cost from the product during the cashier's own request; a product that returned no cost to that request would record zero on their sales.
- The key is **absent, not null**.
- **Fail closed**: a conformance test walks every registered route as a role without the permission and asserts the field's absence. A new route that serializes one of these objects passes through the seam or the test fails.
- **Revisions and hashes are computed on what the role is sent.** Today the order revision and the product revision signal both hash cost; a till without cost must not look permanently out of date, and must not re-push.
- The store **ignores `cost_of_goods_sold` in product writes** from a role without the permission.
- The store also **ignores a posted line cost** from that role. WooCommerce derives a line's cost from its product, but keeps a posted `line_items[].cost_of_goods_sold` on a line with no resolvable product (a custom line, a deleted product); a role that may not see cost may not set one there either.

**App.**
- A missing key means withheld; a present null or zero means no cost set.
- Cost, profit and margin are gone for that role: the products table and tiles, the three report panels, CSV and print. No placeholder.
- **The reset.** When a data permission or scope changes for the signed-in cashier, in either direction, the app drops the affected collections for that cashier and pulls them again, with everything derived from them (search indexes, report caches, conflict copies). Cost: products, variations, orders. **Unsynced sales are kept and pushed first**; queued writes are sanitised of withheld fields. Nothing is stripped in place. Each cashier has their own local database per store, so one cashier's reset never touches another's.

**What v2.2.0 does not promise.** The historical cost of a sale. WooCommerce re-costs every line at the product's current cost on each recalculation (reopen-and-edit, a line or address edit, a coupon re-apply, a tip retotal, every refund). Confirmed live on dev-free, 2026-11-22: a sale pushed with no cost recorded 6.42 from the product; a refund after a cost change re-costed the line to 10.00. The docs say so plainly.

## 6. Slice 3: action permissions and the refused write ([#611](https://github.com/wcpos/roadmap/issues/611))

- A v2 push carries the whole document, so each action permission names the **fields it guards** in the registry, and the store compares the pushed sale with the stored one. The same map drives the app's gating. Fields per permission are settled when the slice is built, from the order writer; the comparison already exists for line changes (`lines_changed()`).
- **A paid sale is never refused for a permission.** If payment has been taken, the store saves the sale as rung up and flags it "made without permission: <permission>", with the cashier and the time: a WooCommerce order note and a row in the POS Logs.
- **An open, unpaid sale has just the disallowed change refused**, with one error code per permission. The till restores the line and tells the cashier why in one line.
- **Refunds, voids, reopening and status changes are refused outright**; they reach the store when they are made.
- **Reassignment** follows the standing ruling ([#209](https://github.com/wcpos/roadmap/issues/209)): `reassign_woocommerce_pos_sales` gates every change to a sale's cashier, including a cashier making themselves the cashier, and every change to its store. Today the code allows the self-claim without the capability and gates a store change only by a filter (Pro narrows it to stores the user may use). A refused reassignment returns its error like the rest (today it is dropped silently), and the POS cart gates it as Orders › Edit already does.
- The three splits (stock, drawer, expected cash) land here.
- App gating follows §2 rule 3 for every row.

## 7. Slice 4: page permissions

- **Reports, POS settings, Store health and logs**: the page is gone from the menu and the store refuses the page's data.
- **Orders and Customers**: the menu entry is gone; the till still holds the data. Hidden at the till only.

## 8. Slice 5: store-wide settings and locks ([#607](https://github.com/wcpos/roadmap/issues/607))

- Set in **WP Admin only**: a "Till settings" table on Free's Checkout settings screen (Setting / Store setting / Cashiers can change), and the same on the Pro store edit screen for per-store values. Nothing is set from inside the app.
- **Carrier**: the store record. Free serves the values and locks on its single store; Pro on each store. The new values and every lock are **server-owned, auto-synced store fields**: today an existing store takes only its auto-synced fields from the server and its app-editable fields change only through "Restore server settings", so a lock that was not auto-synced would never reach a till that already knows the store.

| Setting | Store value today | v2.2.0 |
|---|---|---|
| Automatically show receipt after checkout | none | store value + lock |
| Automatically print receipt | none | store value + lock |
| Quick discount keys | none | store value + lock |
| Default customer, default customer is cashier | yes | lock added |
| Currency and number formatting | yes | lock added |
| Tax display and price suffix | yes | lock added |

- **Precedence**: locked, the store's value always. Unlocked, the cashier's own saved value if they have one, else the store's, else the app's bundled default.
- **Upgrade**: store values start equal to the bundled defaults and every lock starts open. A cashier's saved values are kept; locking a setting stops reading them, it does not delete them.
- A locked setting at the till is read-only with "Set by your store".
- Look and layout, and anything set from inside the app, are not in this release. Hardware never gets a store value.

## 9. Slice 6: the own-sales scope ([#610](https://github.com/wcpos/roadmap/issues/610))

- Without `view_others_woocommerce_pos_sales`, the store narrows orders to the cashier's own on **every read path**: both lanes, list and pull streams, bulk-id fast paths, the single read (a row outside scope is a 404), and receipts, receipt PDFs, print jobs, order email and payments for an order, none of which check ownership today.
- **Own** means rung up by (`_pos_user_created`) or currently assigned to (`_pos_user`).
- **The scope covers writes as well as reads.** A push, refund, payment or delete against an order outside scope is refused as not found. Without this a scoped cashier, who holds `edit_others_shop_orders` by default, could write to another cashier's sale by id.
- **No lookup exception.** A scoped cashier cannot open anyone else's sale by any route. Paul: "either they have permissions to do a return (and look up past orders) or they don't."
- A scope change runs the reset on orders, so a checkpoint never serves two result sets and needs no scope key.
- Register figures (X-report, closure) are not this scope; "See expected cash" and Reports govern them.
- Pro: `view_other_stores_woocommerce_pos_sales` narrows on `_pos_store` the same way.

## 10. Slice 7: customer contact details

- Without `view_woocommerce_pos_customer_details`, the store withholds email, phone and addresses from customer records and from orders, through the same seam as cost. The reset covers customers and orders.
- A cashier picks a customer by name. **The store fills billing and shipping from the customer record when the sale is saved**, and sends emailed receipts itself.
- A cashier who may add a customer types the details once and does not see them again.

## 11. Slice 8: cashier PINs ([#617](https://github.com/wcpos/roadmap/issues/617))

- **Set by the owner or a manager in WP Admin, on the user's profile.** Replaceable and clearable there; never shown again. 4 to 6 digits; not required to be unique.
- **Two store settings**: "Cashier PINs" (off by default) and "Lock the till" (never, after each sale, or after 1, 5, 15 or 30 minutes without use).
- With PINs on, a PIN is needed to take over the till from another cashier and to unlock it. The till asks who you are first (pick from the saved cashiers), then the PIN.
- **Checked by the store when it can be reached**, under the shared credential lockout the login page and approval routes use. **Offline, checked on the device** for cashiers already saved on that till, against a per-cashier salted verifier made with a deliberately slow hash and refreshed at each online check; 5 wrong tries lock that cashier on the device until it reconnects.
- A cashier with no PIN signs in with their WordPress password, which needs a connection.
- The lock keeps the till's state exactly. The open sale stays with the cashier who started it.
- Anyone who signs in on a device is added to its saved cashiers, including through WordPress on the browser till.
- **The browser till**: with PINs on it starts locked and asks the signed-in user's PIN, but the WordPress login underneath is the boundary; the setting's help says so in one line.
- Hand-over with PINs off stays as it is today.
- The offline check is not a defence of a copied device: someone who copies the verifier can try every 4 to 6 digit PIN away from the till, and the five-try limit only counts tries made at it. The slow hash raises the cost; it does not remove it. The ruling accepts this ([#617](https://github.com/wcpos/roadmap/issues/617)): the PIN stops the person at a shared till, and saved tokens are unprotected on the device today.
- Not in this release: a cashier setting their own PIN, a PIN as approval for a blocked action, clocking in, protecting saved tokens on the device.

## 12. Order of work ([#614](https://github.com/wcpos/roadmap/issues/614))

One release, eight slices, in the order of §4 to §11. Slices 2 to 5 are independent once slice 1 is in; slice 2 goes first among them because a merchant is waiting on it. Slice 6 needs the reset from slice 2. Slice 7 needs the seam from slice 2. Slice 8 needs the store-settings carrier and the stamp from slices 1 and 5. Each slice lands plugin and app together.

## 13. Testing

- Stakes are **High** for everything the store enforces: a failing test first per permission, on both order storage modes and on the WooCommerce versions CI runs.
- The withheld-field conformance test (§5) and a route walk for the own-sales scope (§9) are the two tests that make a promise provable; neither may be skipped or narrowed.
- App gating is tested from the capability source, one test per row of §3, driven by the registry so a new row cannot ship ungated.
- Live checks run on the hosted dev stores, never a local WordPress.

## 14. Out of scope

Per-person exceptions; scoping WP Admin; a manager approving a blocked action at the till; freezing a sale's cost at payment; filtering third-party meta; store-wide look and layout; anything set from inside the app; permissions that differ per store or register; extensions' own permissions on the Access screen beyond being served to the app.
