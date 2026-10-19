v2.2.0 — Control what each cashier can do

### Due date

### Pitch

Decide what each cashier can do at the till: refunds, discounts, voids, the cash drawer, reports and other people's sales.

### Why this release

Today a cashier in WCPOS can do nearly everything the till offers. WordPress roles decide who can open the POS and who can edit products, orders, coupons and customers, but nothing in WooCommerce says "may refund", "may give a discount", "may see the reports page" or "may see other cashiers' sales", and the right to read orders returns every order. Store owners keep asking to give a new cashier less: no refunds, no price changes, no reports, only their own sales. This release gives the POS its own permissions, set per role on the Access screen, enforced by your store and reflected at the till: a control a cashier may not use is hidden or locked, and a page they may not see is not in the menu. Every new permission starts switched on, so nothing changes in your store until you turn something off.

### Not in this release

- Exceptions for one person on top of their role. Permissions are set per role; per-person overrides come only if merchants ask for them.
- Limiting what staff see in WP Admin. This release is about the POS.
- A manager approving a blocked action at the till, and switching cashiers by PIN. They come later unless merchants ask for them.

---

Filed 2026-10-19 on Paul's ask: "A lot of users are asking for fine-grained control over what cashiers can do … We're going to have to do a big milestone where we figure out how to allow store owners to limit access." Placed after v2.1.0 (Fiscal compliance), which has a legal date; if this release is ready first, the two numbers swap. The design starts from wcpos/woocommerce-pos#2130. No date yet.

