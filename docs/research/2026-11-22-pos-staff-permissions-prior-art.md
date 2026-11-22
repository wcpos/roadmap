# Prior-art POS staff permissions: what an owner can stop a cashier doing and seeing

**Research note, 2026-11-22**, for [roadmap#601](https://github.com/wcpos/roadmap/issues/601) (map [#599](https://github.com/wcpos/roadmap/issues/599)).

This note builds on the [staff identity research](https://github.com/wcpos/monorepo/blob/research/pos-staff-identity/.claude/research/2026-09-10-pos-staff-identity.md) of 2026-09-10, called "the identity note" below. That note already covers:

- the staff record, PINs and switching;
- sale attribution;
- Shopify's tri-state permissions;
- Toast's coworker-passcode escalation;
- the fact that no vendor exposes its permission model on its API.

None of that is repeated here. This note goes one layer down. For each system it records:

1. what the permission list contains;
2. what a cashier sees for an action they lack;
3. which data can be withheld;
4. where the owner sets it all;
5. what a till does when permissions change;
6. whether a cashier can be limited to their own sales.

**Sources.** Primary only: vendor help centres, vendor API references, vendor marketing pages where nothing else exists, and source code. Everything was read 2026-11-22. Source code is cited at a fixed revision:

- Odoo: branch `18.0` at commit `465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa`, shortened below to `odoo@465ae31c`.
- FooSales: tag `1.44.5` from wordpress.org.
- wePOS: tag `2.0.3` from wordpress.org.
- Jovvie (`point-of-sale-pos-woocommerce`): tag `5.21.5` from wordpress.org.

**Labels.**

- **Observed**: stated in the vendor's own documentation or visible in its source.
- **Inferred**: my reading of what the vendor states.
- **Unverified**: seen only in a search-result snippet, a community forum or a marketing mock-up, or not confirmable at all.
- **Not documented**: the vendor says nothing on the point. It is never a guess.

**Pages that would not render.** Clover's help centre (every `clover.com/help` locale is a client-rendered app shell), Revel's guide (401), Oliver's help centre (TLS failure) and wePOS Pro's docs (proxy block). Claims about those four rest on snippets or marketing pages and are labelled to match.

---

## 1. Comparison

| | Published permission list | Lowest built-in role | Action the cashier lacks | Cost hideable from a role | Customer contact hideable | Data absent from the device, or only from the screen? | Where it is set | When a change reaches the till | Own sales only |
|---|---|---|---|---|---|---|---|---|---|
| **Square** | **No**: three levels plus "Customize", no item list | "Standard": "basic permissions to take transactions" | Owner-passcode override (community, Unverified); look of the control: not documented | **Yes**, "View unit cost" | Not documented | Not documented | Dashboard; set per person; location-scoped; device "modes" centrally | Modes: after the next transaction or app reopen. Permissions: not documented | Not in the help centre; community says yes (Unverified) |
| **Shopify POS** | **Yes**: 10 groups, about 60 items | Cashier (POS Pro); "Associate" default | **Approval required**: manager PIN, per permission | Not in POS roles; admin "View cost" (Unverified) | **Yes**, "View customer details" | Not documented | Admin; per role, never per person; per location | PIN: "a few minutes", refresh or force-close. Roles: not documented | **No**: location scope only |
| **Lightspeed X-Series** | Groups with examples, not an item list | Cashier, with published defaults | Screen withheld, then **switch user**, with a password when switching up | **Yes**, "Show product costs"; API `products:read:costs` | No (export only) | Not documented; iPad stores product and customer data locally | Back office; per role; per outlet; register settings centrally | Not documented | Reports: "their own sales". Sales history: outlet-wide only |
| **Lightspeed R-Series** | **Yes**: 9 groups, about 70 items | Associate (prose only) | Not documented, except a Manager PIN for age verification | **Yes**, "Product Cost", which also hides Margin and Profit | Not documented | Not documented | Back office; per role; per employee location | "automatically updates permissions"; timing not documented | Not documented |
| **Clover** | No list found (help centre unreadable) | Employee | Hidden (blog), manager passcode (community): Unverified | Not documented | Not documented | Not documented | Dashboard or Employees app on the device | Not documented | Not documented |
| **Toast** | **Yes**: about 150 items in 8 or 9 categories | No default jobs documented | **Manager passcode** prompt, disabled buttons, or absent options, per permission | Not documented | Customer lookup needs "Manager" | Not documented | Toast Web; per job **plus per-employee override**; per location | Saves "published immediately", but the device "may not immediately reflect": Resync or restart | **Yes**, "View Other Employees' Orders" off |
| **Loyverse** | **Yes**: POS 14, Back Office 18 | Cashier, defaults not published | **Manager PIN**, one-time access; Refund button absent | **Yes**, "View cost of items" (POS and Back Office) | Not documented | Not documented | Back office; per role; per store | Not documented | **No**: the last 5 receipts from all staff; open tickets yes |
| **Odoo 18** | Two tiers per till (Basic, Advanced) plus config switches | Cashier (`_role='cashier'`) | **Hidden** (`t-if`), Price key **disabled**, "Access Denied" dialog | Screen only: **cost is always loaded** | No: phone, email and address always loaded | **Observed in source: on the device for every role** | Back office, per till config, per person | **Inferred: next page reload**; no push | **No** |
| **Erply** | Rights per module, view/add/edit/delete | Not documented | "error message or hide the feature altogether" | No cost-view right found | Not documented | Not documented | Back office; per user group; per role POS settings | Not documented | **Yes**: view "only records the user added" |
| **Revel** | Unreadable (401) | Not documented | Price override "always requires a manager's password" (Unverified) | "Cost Management" (Unverified) | Not documented | Not documented | Not documented | Not documented | Not documented |
| **YITH POS** | No capability list; manager or cashier per store | Cashier | Hidden (docs) | No role limit on cost | Not documented | Not documented | WP admin, per store and register | Not documented | **No**: all store POS orders |
| **Oliver POS** | "120 permissions across 12 categories", unpublished | Cashier | "PIN overrides for discounts and refunds" (mock-up, Unverified) | Not documented | Not documented | Not documented | Oliver Hub; receipt templates per outlet | "under 10 seconds" (marketing page) | Not documented |
| **FooSales** | **Yes**: about 95 `foosales_pos_*` capabilities by screen | Cashier: everything but 4 | UI "show or hide"; server also refuses refunds | No cost in payloads | Not documented | Other users' orders: **Inferred on device, filtered on screen** | WP admin; per role **plus per-user extras** | Server: per request (Inferred). App: not documented | **Yes** by default (UI) |
| **wePOS (free)** | Page and WooCommerce capabilities only | Cashier: POS access only | Not documented | Not documented | Not documented | Not documented | WP admin, per role | Not documented | Not documented |
| **Jovvie** | **Yes**: about 33 capabilities in 7 groups | Cashier, defaults in source | Hidden; refunds server-enforced; price edit **UI only, says so** | Not documented | Not documented | Screen only (per-station Display hide) | WP admin; per role; per station button visibility | Server: per request (Inferred) | Partly: lookup by exact order number only |

---

## 2. Per-system evidence

### Square

1. **Permission list.** Not published as a list (**Observed**: [permission sets](https://squareup.com/help/us/en/article/5822-employee-permissions); the downloaded page names no individual permissions).
   - There are three levels: Standard, "basic permissions to take transactions at the point of sale"; Enhanced, "backing out of a sale, updating inventory, and managing shifts"; and Full, "all permissions except managing bank accounts". The fetched page shows only the last of these. The Standard and Enhanced wording comes from a snippet, so those two are **Unverified**.
   - Each account has one "Team Permissions" set tied to the shared team passcode (**Observed**, same page).
   - The number of custom sets depends on the plan: 1, 2, or unlimited (**Unverified**, snippet).
   - Individual permissions are named only in other articles (**Observed**):
     - "View unit cost": [unit cost](https://squareup.com/help/us/en/article/8262-set-unit-cost-with-square-for-retail-purchase-orders)
     - "view all completed sales for all team members": [transaction search](https://squareup.com/help/us/en/article/5145-transaction-search)
     - "view limited reporting" and "…detailed sales reporting": [in-app reports](https://squareup.com/help/us/en/article/5381-in-app-summaries-and-reports)
     - "create, edit, and remove team members": [retail team](https://squareup.com/help/us/en/article/6455-setting-up-your-employees-with-square-for-retail)
     - "configure checkout settings": [offline mode](https://squareup.com/help/us/en/article/7777-process-card-payments-with-offline-mode)
2. **Hide, lock or approve.**
   - You choose which tasks require a passcode (**Observed**: [passcodes](https://squareup.com/help/us/en/article/8357-require-passcodes-at-point-of-sale)).
   - The owner passcode "allows you to override Team Member actions" (**Unverified**, community: [forum](https://community.squareup.com/t5/Community-Corner/Passcode-owner-how-does-it-work/m-p/618588)).
   - Whether a denied control is absent or disabled: not documented.
3. **Hidden data.**
   - Without "View unit cost", staff are kept from "viewing or editing unit costs in applicable item and inventory workflows" (**Observed**: [unit cost](https://squareup.com/help/us/en/article/8262-set-unit-cost-with-square-for-retail-purchase-orders)).
   - Reports come in two tiers: limited is a 90-day summary in the app; detailed is Dashboard only (**Observed**: [reports](https://squareup.com/help/us/en/article/5381-in-app-summaries-and-reports)).
   - Location: "A team member assigned only to Location A won't have access to data or features associated with Location B" (**Observed**: [team members](https://squareup.com/help/us/en/article/8356-add-and-manage-team-members)).
   - Customer contact, supplier price, stock, and absent-from-device versus hidden-on-screen: not documented.
4. **Where it is set.**
   - In the Dashboard, under Staff > Team > Permissions; a set is assigned per person along with locations (**Observed**: [permission sets](https://squareup.com/help/us/en/article/5822-employee-permissions), [team members](https://squareup.com/help/us/en/article/8356-add-and-manage-team-members)).
   - Device settings are central through **modes**, "a collection of settings used to configure one or more devices"; a change "gets applied to all of the assigned device codes" (**Observed**: [modes](https://squareup.com/help/us/en/article/8114-create-and-manage-device-profiles)).
   - Whether a mode setting can be locked against change at the till: not documented.
5. **When permissions change.**
   - A set change applies "to all team members assigned to the permission set". Timing is not documented ([permission sets](https://squareup.com/help/us/en/article/5822-employee-permissions)).
   - Mode changes apply after a completed transaction or an app reopen. A remote mode switch can fail if the employee signed in lacks the permission (**Observed**: [modes](https://squareup.com/help/us/en/article/8114-create-and-manage-device-profiles)).
   - Offline payments expire after 72 hours. They are "permanently lost" if you sign out, switch modes or switch locations (**Observed**: [offline mode](https://squareup.com/help/us/en/article/7777-process-card-payments-with-offline-mode)).
   - Permissions offline, and what happens to data already on the device: not documented.
6. **Own sales only.** The help centre names only the "all team members" permission ([transaction search](https://squareup.com/help/us/en/article/5145-transaction-search)). That staff "can still view their own transactions" without it rests on the community forum (**Unverified**: [forum](https://community.squareup.com/t5/Square-Point-of-Sale-Group/Team-Permissions-leave-your-Transactions-visible-to-your/m-p/619123/highlight/true)).

### Shopify POS

1. **Permission list.** All of it is **Observed** on one page: [POS permissions](https://help.shopify.com/en/manual/your-account/users/roles/permissions/pos-permissions). AR marks a permission that can be set to Approval required.
   - **Manager approval**
   - **Checkout**: custom sales (AR), ship to customer (AR), edit taxes (AR), accept offline card payments (AR), cash out gift cards (AR).
   - **Discounts**: custom discounts (AR), discount codes (AR).
   - **Orders**:
     - Manage orders at all locations; manage sales attribution.
     - Return/exchange, ineligible items, unverified returns, complete in-progress returns, restock, remove unfulfilled items, cancel (all AR).
     - Recent carts and their expiry; draft orders.
     - Fulfil shipping/pickup; reassign/cancel fulfilment; transfers.
   - **Customers**: create, edit, delete, view details, abandoned checkouts, view/edit metafields, redeem and manage store credit (both AR).
   - **Apps**: use POS apps; manage POS UI extensions.
   - **Analytics**: view analytics for the device's location.
   - **Register**: payment tracking and its history, start/end sessions, cash-tracking sessions, end sessions from the admin, open drawer.
   - **Store settings**: smart grid, device payment settings, offline payments, switch to offline checkout (AR), receipt settings, required checkout information, switch device location, log out of POS.
   - **Admin permissions for POS channel access**.

   Built-in roles exist on POS Pro only ([predefined roles](https://help.shopify.com/en/manual/your-account/users/roles/predefined-roles), **Observed**):
   - **Cashier**: checkout, discount codes, add customers, open drawer, cash out gift cards.
   - **Sales associate**: those plus more, with custom discounts and returns set to Approval required.
2. **Hide, lock or approve.**
   - Approval required "requires staff with manager approval… to enter their PIN" (**Observed**, permissions page).
   - Two Denied behaviours are stated: with recent carts denied, staff "can't view the recent cart list"; with Open drawer denied, the drawer "still opens automatically after a cash sale" (**Observed**, same page).
   - What every other denied control looks like: not documented.
3. **Hidden data.**
   - Denying "View customer details" "hides" email, phone and shipping address (**Observed**, permissions page).
   - A location assignment "doesn't limit data viewing, so staff can still see inventory at all locations" (**Observed**: [staff by location](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/staff-management/staff-by-location)).
   - Cost: POS roles have no permission for it. The admin store permission "View cost" is **Unverified** (snippet: [store permissions](https://help.shopify.com/en/manual/your-account/users/roles/permissions/store-permissions)).
   - Absent from the device or only from the screen: not documented.
4. **Where it is set.**
   - In the admin; per role, "can't assign individual permissions"; roles apply on POS Pro only (**Observed**: [staff management](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/staff-management/understanding-pos-staff-management)).
   - **Device settings are locked by permission, not by a central lock.** The Store settings group decides who may change the smart grid, receipt settings, payment settings and location, or log out (**Observed**, permissions page).
   - Some settings are set centrally:
     - Receipt printing options for "Default (all locations)" or per location (**Unverified**, snippet: [printing options](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/customize-pos/printed-receipts/printing-options)).
     - Smart grid templates per location, where editing on a device saves a copy for that location (**Unverified**, snippet: [smart grid](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/customize-pos/smart-grid-management)).
5. **When permissions change.**
   - A PIN change "might need a few minutes to sync"; the fix is to refresh store data or force-close the app (**Observed**: [PIN](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/manage-your-shopify-pos-pin)).
   - Role-change timing: not documented.
   - Offline, there is no customer search, edit or create, and no returns, exchanges or voids (**Observed**: [offline features](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/selling-offline/offline-features)).
   - Logging out "might cause loss of offline orders" (**Observed**: [offline checkout](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/selling-offline/offline-checkout)).
   - Permission checks and approvals while offline: not documented.
6. **Own sales only.** No. The only scope is "Manage orders at all locations" (**Observed**, permissions page).

### Lightspeed X-Series (formerly Vend)

All of this is **Observed** on [roles and permissions](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534171377819-Setting-user-roles-and-permissions) unless another source is given.

1. **Permission list.** The page gives groups with examples, not a complete item list.
   - The groups: Product costs, Labels, Discounts (with a per-role limit), Sell, Customers, Saved payment methods, Products, Reporting, Setup and iOS.
   - The Sell group includes the master switch "Create or continue sales" and "View sales history of assigned outlets".
   - **Cashier defaults**:
     - Off: issuing manual store credit, voiding sales, editing sales, removing customers, and "Show product costs".
     - Reports: "Cashiers can't be granted access to these reports."
     - Setup: "All setup permissions are locked for Cashiers and can't be enabled."
   - Open/close register and cash movements "cannot be removed" from any role ([registers](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534185400347)).
2. **Hide, lock or approve.**
   - Without "Create or continue sales", a role "will no longer have access to the Sell screen".
   - On a page they can't use, the user is "notified that they do not have access" and sent elsewhere ([login access](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533966466971-Restricting-user-log-in-access)).
   - **Escalation is a user switch, not an override.** "Cashiers are unable to open the cash drawer outside of a sale… Switch to a manager or admin user" ([cash drawer](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533720722331)).
3. **Hidden data.**
   - "Show product costs" covers "the Sell screen, in the product catalog, in reports, and on the Stock control page".
   - With "View sales reports" off, targets and sales leave the Home dashboard.
   - **The API withholds cost by token scope.** `products:read` is "excluding product costs", and `products:read:costs` is needed to "Read protected product supply prices" ([scopes](https://x-series-api.lightspeedhq.com/docs/scopes)).
   - Sales fields "can be null or omitted depending on… the authenticated user's permissions" ([Sales 101](https://x-series-api.lightspeedhq.com/docs/sales_101)).
   - On iPad, product and customer "data is stored locally" ([offline](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534272395163-Selling-in-offline-mode)).
   - Whether a hidden cost is absent from that local store: not documented.
4. **Where it is set.**
   - Per role in the back office; "Users with the same role will have the same permissions".
   - Outlet access is per user, and Admins always have every outlet ([outlets](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533993514907)).
   - Switching security is account-wide and "cannot be applied to individual outlets or registers" ([user switching](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534037435547)).
   - Per-register settings live in the back office: receipt template, Quick Keys and end-of-sale options ([registers](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534178722459-Setting-up-outlets-and-registers)).
   - Whether those can be locked at the till: not documented.
5. **When permissions change.**
   - How fast a change reaches a device: not documented.
   - Offline, the app shows only Sell and Status. It can't edit customers, "or view product inventory information", and it checks the connection "every two minutes". "Reset data" deletes unsynced sales and "the copy of your web register data saved in your browser" ([offline](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534272395163-Selling-in-offline-mode)).
   - What happens to a queued action: not documented.
6. **Own sales only.**
   - Reporting can be "reports on their own sales, all sales made at assigned outlets…".
   - Sales history is outlet-wide or nothing. An own-sales history: not documented.

### Lightspeed R-Series

All of this is **Observed** on [roles and access](https://retail-support.lightspeedhq.com/hc/en-us/articles/229129608-Setting-up-employee-roles-and-access) unless another source is given.

1. **Permission list.** The full list, grouped as published:
   - **General**: All, External login, Reports, Edit employee time clock entries, Service, Allow record merging.
   - **Sales**: Sales, Refund, Open Register, Register Withdraw, Close Register, Change Prices, Import Catalog Item, Layaways & Special Orders, Line Only Discount, Entire Sale Discount, two serial-number rights, View Customer Sales From Other Shops When Location Restricted, Use customer's saved payment method.
   - **Inventory, general**: Basic, Show quantity-on-hand for all locations, Create transfer in all accessible locations, Categories, Brands, Tags.
   - **Inventory, specific**: Product Cost, Product Create & Edit (requires Product Cost), Special Orders, Purchase Orders and receiving rights, Vendor Returns, Counts, Counts - Reconcile, Transfers, Import, Vendors.
   - **eCom**.
   - **Customers**: Basic, Export, Credit Limit, Customer Deletion, View Gift Card Numbers, Export Gift Card Data, saved payment methods.
   - **Payments Reports**.
   - **Settings**: Basic, Setup Shops, Employee Setup, Employee Account Deletion, Sales Setup, Void Sales, Pricing, Financial Services.

   Gaps and contradictions:
   - "Manager Override" and "Settings - Register Rules" appear only on another page ([age verification](https://retail-support.lightspeedhq.com/hc/en-us/articles/360036974413)).
   - Open and close register are listed as rights, yet another page says they "cannot be removed from user roles" ([registers](https://retail-support.lightspeedhq.com/hc/en-us/articles/1260800790810)). This is a first-party contradiction.
   - The Associate role "Can process sales, transfer stock and close off the register. Restricted from… adding and editing products or accessing reporting". Its per-right defaults are not published.
2. **Hide, lock or approve.**
   - The only manager-PIN flow documented is age verification: "Enter your Manager PIN… a user with the Manager Override permission" ([age verification](https://retail-support.lightspeedhq.com/hc/en-us/articles/360036974413)).
   - Whether other controls are hidden or greyed out: not documented.
3. **Hidden data.**
   - Product Cost governs viewing, editing and exporting cost, plus the Margin and Profit KPIs. A Reports user without it sees Home "with Margin and Profit KPIs hidden".
   - Without "Show quantity-on-hand for all locations", the user sees stock only where they have access.
   - Gift card numbers show as the last 4 digits.
   - Sales older than 30 days need Reports ([sales history](https://retail-support.lightspeedhq.com/hc/en-us/articles/360038826073)).
   - Absent from the device: not documented.
4. **Where it is set.**
   - Per role in Settings > Employee Roles. Location access is per employee, and new employees get every location.
   - A PIN-only employee can only take over a session opened by someone with External login ([login credentials](https://retail-support.lightspeedhq.com/hc/en-us/articles/229129648)).
   - Locking device settings: not documented.
5. **When permissions change.**
   - "Changing employee role permissions automatically updates permissions for all employees with that role." The effect on open sessions is not documented.
   - Smart Terminal settings update "automatically overnight or upon restarting the terminal" ([terminal](https://retail-support.lightspeedhq.com/hc/en-us/articles/27640682216731)).
   - An offline POS mode: not documented.
6. **Own sales only.** History can be filtered by employee ([sales history](https://retail-support.lightspeedhq.com/hc/en-us/articles/360038826073)). A restricting right: not documented.

### Clover

Every `clover.com/help` locale returned an empty app shell, so most Clover points below are **Unverified**.

1. **Permission list.** The default roles are "Administrator, Manager, and Employee". You can add permissions to them and create custom roles (**Unverified**, snippet: [roles](https://www.la.clover.com/pt-BR/help/manage-roles-and-access-permissions)). Permissions are grouped by app, for example "Refund Payments" (**Unverified**: [refunds](https://www.clover.com/en-US/help/refund-paid-transactions-dashboard)). No full list was found.
2. **Hide, lock or approve.**
   - The vendor blog says features you don't grant "are hidden" ([blog](https://blog.clover.com/ca/manage-all-aspects-of-your-business-with-the-clover-dashboard)). It is first-party but not documentation, so **Unverified**.
   - An "enter manager passcode" dialog is reported on the community site (**Unverified**: [community](https://community.clover.com/questions/20069/where-can-i-find-the-manager-passcode.html)).
3. **Hidden data.** The Sales Summary "is a default feature and can't be removed"; Clover advises reviewing permissions "to ensure only authorized users can view sales data" (**Observed**: [dashboard FAQ](https://docs.clover.com/dev/docs/merchant-dashboard-and-reports-faqs)). Cost, contact details, stock, and absent from the device: not documented.
4. **Where it is set.** Either in the Dashboard under Settings > Employee permissions, or in the Employees app on the device (**Unverified**, snippet: [refunds](https://www.clover.com/en-US/help/refund-paid-transactions-dashboard)).
5. **When permissions change.** Not documented. Offline payments run "for up to 7 days", with limits, and "can be declined" later (**Observed**: [offline payments](https://docs.clover.com/dev/docs/handling-offline-payments)). Permissions offline: not documented.
6. **Own sales only.** Not documented.

### Toast

All of this is **Observed** on [permissions](https://doc.toasttab.com/doc/platformguide/adminPermissions.html) unless another source is given.

1. **Permission list.** About 150 permissions. The platform guide groups them into nine categories; the [support reference](https://support.toasttab.com/en/article/Access-Permissions-Reference) numbers them 1.x–8.x. The categories, with the items that matter to a retail till:
   - **POS access**, where the modes come first.
   - **Additional POS access**: Apply Cash Payments, Cash Drawer Access, View Other Employees' Orders, Edit Other Employees' Orders, My Reports, Shift Review Sales Data, No Sale, Key in Credit Cards, Offline / Background Credit Card Processing, Split Checks, Change Server.
   - **Delivery**.
   - **Manager access**:
     - Customer lookup ("look up customers using personal information").
     - Discounts.
     - Void Items / Orders; Void / Refund Payments, plus a "(Limited to Same Day Only)" variant; Unlinked Refunds.
     - Cash Drawers (Blind), Cash Drawers (Full), Cash Drawer Lockdown (Override), Large Cash Over / Under, Pay Out.
     - Shift Review, Close Out Day, Find Checks, Open Items, Tax Exempt.
   - **Restaurant admin**: Sales Reports, Edit Full Menu, Marketing Info, Employee Info, Customer Credits & Reports, Edit Historical Data, Check Audit, Enable Job-Based Access.
   - **Quick edit**: Inventory & Quantity, Price and others.
   - **Web setup**, **Device setup** (Terminal Setup, Advanced Terminal Setup) and **Account admin** (User Permissions and others).

   No default jobs are documented: "Typically… you group a set of access permissions into a job."
2. **Hide, lock or approve.** All three occur, chosen per permission:
   - **Prompt**: "If they do not, the POS prompts for a manager passcode", and the manager must hold the same permission ([discounts](https://support.toasttab.com/en/article/Fixed-Discounts)).
   - **Disabled**: without Apply Cash Payments, "the cash payment buttons… are disabled".
   - **Absent**: "Your complete set of assigned access permissions determines the options that appear on the Toast POS home screen" ([device config](https://doc.toasttab.com/doc/platformguide/adminConfigureDevice.html)).
3. **Hidden data.**
   - **Blind versus full drawer.** Blind "does not allow the employee to view the expected cash amounts", but still lets them open, close out and replace drawers ([cash management](https://doc.toasttab.com/doc/platformguide/adminUserPermissionsCashMgmt.html)).
   - Customer lookup by personal information is a Manager permission.
   - My Reports shows only your own sales; Sales Reports shows the location.
   - Cost and margin: not documented.
   - Offline, "Access guest data and online reports" is unavailable ([offline](https://doc.toasttab.com/doc/platformguide/platformOfflineMode.html)). **Inferred**: guest data is fetched from the server, not cached on the device.
   - Permission-hidden data absent from the device: not documented.
4. **Where it is set.**
   - Per job in Toast Web, **with per-employee overrides** ("choose Override in the Override? column") ([employee jobs](https://doc.toasttab.com/doc/platformguide/platformEmployeeJobs.html)).
   - "Job-based access" applies the permissions of the job the employee is clocked in as.
   - You can grant only permissions you hold yourself.
   - Device settings are configured on each device, and the Terminal Setup and Advanced Terminal Setup permissions decide who may change them ([device config](https://doc.toasttab.com/doc/platformguide/adminConfigureDevice.html)).
   - UI options are set centrally per location ([UI options](https://doc.toasttab.com/doc/platformguide/adminUiOptionsReference.html)).
5. **When permissions change.**
   - Employee and job changes "do not require publishing… they are published immediately" ([publishing](https://doc.toasttab.com/doc/platformguide/platformChangesThatRequirePublishing.html)).
   - Yet "Permission changes made in Toast Web may not immediately reflect on the POS device"; the fix is Resync Data or a restart ([troubleshooting](https://support.toasttab.com/en/article/Troubleshooting-Permissions)).
   - **Offline, nobody can sign in.** "You will not be able to log back in until the connection is restored." Resync is disabled to prevent "the erasure of stored information" ([offline](https://doc.toasttab.com/doc/platformguide/platformOfflineMode.html)).
   - What happens to a queued action: not documented.
6. **Own sales only.**
   - **Yes.** Without View Other Employees' Orders, staff see only their own checks; with it they "review all open, paid, and closed orders, not just their own".
   - Editing others' orders is a separate permission, and bulk void and transfer apply to "their own checks" unless the employee also has Edit Other Employees' Orders.

### Loyverse

All of this is **Observed** on [access rights](https://help.loyverse.com/help/how-manage-access-rights-employees) unless another source is given.

1. **Permission list.**
   - **POS**: View all receipts, Apply discounts with restricted access, Change taxes in a sale, Accept payments, Perform returns, Manage all open tickets, Void saved items in open tickets, View shift report, Open cash drawer without making a sale, Reprint and resend receipts, Manage items, View cost of items, Change settings, Access to live chat support.
   - **Back Office**: View sales reports, Cancel receipts, Manage items, View cost of items, Manage employees, Manage customers, Edit general settings, Manage billing, Manage payment types, Manage loyalty program, Manage taxes, Manage kitchen printers, Manage dining options, Manage POS devices, Access to live chat support.
   - **Presets**: Owner (fixed), Administrator, Manager, Cashier. Cashier is "POS-only operational access", but its checkbox defaults are not published ([employees](https://help.loyverse.com/help/employee-loyverses)).
2. **Hide, lock or approve.**
   - **Prompt**: "the PIN panel will be opened"; another employee's PIN grants one-time access.
   - **Absent**: an employee without the right "would not have the 'Refund' button".
   - Offline, "The refund button is disabled" ([offline](https://support.loyverse.com/en/articles/3178196-offline-use-of-loyverse-pos)).
3. **Hidden data.**
   - The POS cost right shows "the Cost (or Average cost) field in the item's card". The Back Office cost right also covers gross profit, cost of goods and margin.
   - Shift report (expected cash) is a right of its own.
   - Stock "not displayed offline" ([offline](https://support.loyverse.com/en/articles/3178196-offline-use-of-loyverse-pos)).
   - Contact details on the POS: not documented.
   - Absent from the device: not documented. Offline purchase history shows only receipts "previously downloaded to the device" (**Unverified**, snippet: [purchase history](https://help.loyverse.com/help/purchase-history-registered)).
4. **Where it is set.** In the back office, per role; "Their permissions will match the selected role and the assigned store" ([employees](https://help.loyverse.com/help/employee-loyverses)). POS device settings sit behind the "Change settings" right. Central locking: not documented.
5. **When permissions change.**
   - How fast the POS picks up a change: not documented.
   - Offline receipts are stored locally as "Unsynced", and "The system will not allow you to sign out… while there are unsynced receipts" ([offline](https://support.loyverse.com/en/articles/3178196-offline-use-of-loyverse-pos)).
   - What happens to a queued action: not documented.
6. **Own sales only.**
   - **No.** With "View all receipts" off, the list still shows "the last 5 receipts" "from all POS of the same store", not only the employee's own ([receipts list](https://support.loyverse.com/en/articles/1763643-receipts-list-in-the-pos)).
   - Open tickets are the exception: without "Manage all open tickets", an employee cannot open others' tickets.

### Odoo POS 18.0 (source)

The base for every source link below is `https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/`.

1. **Permission list.**
   - There are two tiers per till configuration. **Basic** covers opening a session, cash in/out, sales, refunds, discounts and price changes. **Advanced** adds backend access, creating products and closing the session (**Observed**: [employee login doc](https://www.odoo.com/documentation/18.0/applications/sales/point_of_sale/employee_login.html)).
   - In code, `_role` is `'manager'` for an Advanced employee or a POS Manager group member, and `'cashier'` otherwise (**Observed**: [pos_hr/models/hr_employee.py#L33](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/models/hr_employee.py#L33)).
   - The other restrictions are till-config switches: "Restrict Price Modifications to Managers" and the `manual_discount` switch, which applies to everyone ([point_of_sale/models/pos_config.py#L125](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/pos_config.py#L125), [#L189](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/pos_config.py#L189)).
2. **Hide, lock or approve.** Mostly the control is hidden.
   - Edit product, Backend, Close Register and editing a paid order's payment are hidden with `t-if` (**Observed**: [pos_hr navbar.xml#L8](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/components/navbar/navbar.xml#L8), [ticket_screen.xml#L4](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/screens/screens/ticket_screen/ticket_screen.xml#L4)).
   - The Price key is **disabled** ([product_screen.js#L165](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/screens/product_screen/product_screen.js#L165)).
   - A direct price set raises "Access Denied" ([pos_hr order_summary.js#L7](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/screens/product_screen/order_summary/order_summary.js#L7)).
   - **There is no manager-PIN override.** The one "ask a manager" case is a closing cash difference, and that is a stop, not an override ([closing_popup.js#L87](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/navbar/closing_popup/closing_popup.js#L87)).
   - **Inferred**: these are client-side getters, and server calls run as the session's Odoo user, not as the employee.
3. **Hidden data.**
   - **Cost is on every till, whatever the role.** `standard_price` is in the product load list unconditionally (**Observed**: [point_of_sale/models/product.py#L80](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/product.py#L80)).
   - The cost and margin rows render only when the config switch is on **and** `_role === "manager"` (**Observed**: [product_info_popup.js#L19](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/screens/product_screen/product_info_popup/product_info_popup.js#L19)).
   - That contradicts the field's own help text, "When disabled, only PoS manager can view" ([pos_config.py#L127](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/pos_config.py#L127)). In code, disabled means nobody sees cost.
   - Customer phone, email and address are loaded for every role ([res_partner.py#L32](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/res_partner.py#L32)).
   - Odoo is the one system where "screen only" is observable rather than merely undocumented.
4. **Where it is set.** In the back office, per till config and per person. Receipt and layout settings are per config, and core has no per-device preferences (**Observed**: [pos_hr views/pos_config.xml#L11](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/views/pos_config.xml#L11)).
5. **When permissions change.**
   - The rights fields are not on the list of fields locked while a session is open ([pos_config.py#L627](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/pos_config.py#L627)).
   - Roles are computed in `load_data`, which runs once at page load ([data_service.js#L229](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/models/data_service.js#L229)).
   - No bus message covers employee changes ([pos_config.py#L215](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/pos_config.py#L215)).
   - **Inferred**: a change takes effect at the next reload. Data already loaded stays in the browser until then.
   - Offline cashier switches are buffered and written when the till reconnects ([pos_hr pos_store.js#L15](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/models/pos_store.js#L15)).
6. **Own sales only.** No. The order list has no cashier filter, and the server returns all paid orders for the config ([ticket_screen.js#L593](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/screens/ticket_screen/ticket_screen.js#L593), [pos_order.py#L1403](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/pos_order.py#L1403)).

### Erply and Revel (partial)

- **Erply.** All **Observed** unless marked.
  - `getUserRights` returns POS rights such as `rightMakePOSRefunds`, `rightMakePOSReturnsWithoutReceipt`, `rightChangePrices`, `rightMakeDiscountInPOS`, `rightOpenAndCloseDay`, `rightPOSManagerOverride` and `rightEditStockAndProductCost` ([getUserRights](https://learn-api.erply.com/requests/getuserrights)).
  - Module rights are view, add, edit and delete, each scoped as **all, "Added by myself", or none**. Erply alone among the vendors makes "own records" a general scope rather than one permission.
  - A user lacking a right gets "an error message or hide the feature altogether" ([user groups](https://wiki.erply.com/article/646-user-groups)).
  - Role settings include maximum discount % and "whether the expected amount is visible" at day close ([role settings](https://wiki.erply.com/article/2335-role-settings)).
  - A right to view cost was not found.
- **Revel.** All **Unverified**: the guide returns 401 and these are snippets only.
  - Named permissions include "Cost Management" ("see and manage inventory costs on the POS"), Manager Access, and Price Override, which "always requires a manager's password" ([roles guide](https://support.revelsystems.com/hc/en-us/articles/205153595-Employees-Roles-and-Permissions-Guide), [price overrides](https://support.revelsystems.com/hc/en-us/articles/115002532046-Price-Overrides-)).
  - Store-level settings can remove the Discount and Cancel buttons ([advanced settings](https://support.revelsystems.com/hc/en-us/articles/204947635-Advanced-POS-Settings)).

### WordPress POS plugins

- **YITH POS** (premium; docs only, no source read).
  - Two employee types per store. Managers have "full access to all registers and functionalities of the store"; there is no capability list (**Observed**: [employees](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/settings/stores/employees/)).
  - "Manage Store" and "Switch Register" are manager-only menu items (**Observed**: [user menus](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/pos-screen/pos-screen-2/)).
  - A gist by a YITH developer hides cash-in-hand and Manage Cash from cashiers **with CSS** ([gist](https://gist.github.com/kreamweb/1411d2025e90bf2fef89ff8979f4a98b); first-party author, not documentation, so **Unverified** as product behaviour).
  - With the Cost of Goods integration, cost "will be retrieved and shown in the order detail", with no role limit documented ([COG](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/integrations/yith-cost-of-goods-for-woocommerce/)).
  - Order History is "all orders placed in the current store" (**Observed**: [history](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/pos-screen/register-history/)).
  - Settings are per store and per register, including the receipt template (**Observed**: [register settings](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/settings/stores/register-settings/)).
- **Oliver POS** (marketing pages only).
  - "Granular role builder with 120 permissions across 12 categories, backed by real WordPress capabilities" ([WordPress plugin](https://oliverpos.com/wordpress-plugin/)). The categories are not published.
  - Staff permissions "propagate to every register in under 10 seconds"; a new staff member's "PIN and role on every device immediately" ([management hub](https://oliverpos.com/management-hub/)).
  - Blind close "Hides the expected cash total during reconciliation"; receipt templates are per outlet (same page).
  - "PIN verification is online-only and rate-limited" ([WordPress plugin](https://oliverpos.com/wordpress-plugin/)).
  - These are **Observed** as vendor claims, but none of them could be checked against documentation. The "Refunds over $50: Needs PIN" screen on the [homepage](https://oliverpos.com/) is a mock-up (**Unverified**).
- **FooSales** (plugin 1.44.5 source).
  - About 95 `foosales_pos_*` capabilities, grouped by screen: Sale, Orders, Customers, Products, Settings (**Observed**: [class-foosales-user-roles.php#L63](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/class-foosales-user-roles.php#L63)).
  - The Cashier gets everything except `create_users`, `edit_users`, `…view_other_users_orders` and `…change_others_pin` (**Observed**: [#L436](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/class-foosales-user-roles.php#L436)).
  - Roles can be copied and restricted, and extra capabilities can be added **per user** (**Observed**: [user management](https://help.foosales.com/docs/topics/users/pos-user-management/), [plugin settings](https://help.foosales.com/docs/topics/foosales-plugin/plugin-settings/)).
  - Refunds are refused server-side without the capability (**Observed**: [class-foosales-rest-api.php#L495](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/class-foosales-rest-api.php#L495)).
  - Own sales: the order fetch has no user filter ([foosales-api-helper.php#L1205](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/helpers/foosales-api-helper.php#L1205)). **Inferred**: other users' orders reach the device and are filtered on screen.
  - Offline changes are exported and imported by an admin ([class-foosales-admin.php#L763](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/class-foosales-admin.php#L763)).
- **wePOS** (free 2.0.3 source).
  - The Access matrix toggles page capabilities and WooCommerce capabilities per role (**Observed**: [AccessController.php#L34](https://plugins.trac.wordpress.org/browser/wepos/tags/2.0.3/includes/REST/AccessController.php#L34)).
  - The Cashier gets only `access_wepos` and `wepos_page_view_pos` ([Installer.php#L222](https://plugins.trac.wordpress.org/browser/wepos/tags/2.0.3/includes/Installer.php#L222)).
  - Action-level control ("which POS pages and actions cashiers can access") is a Pro feature ([readme.txt#L71](https://plugins.trac.wordpress.org/browser/wepos/tags/2.0.3/readme.txt#L71)). Its contents: not documented in anything readable.
- **Jovvie** (5.21.5 source).
  - About 33 capabilities in 7 groups: register, sales and orders, money, products and stock, customers, coupons, administration (**Observed**: [Access.php#L165](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Admin/Tabs/Users/Access.php#L165)).
  - The Cashier has no refunds, cash management, browse-all-orders or reports ([Activate.php#L249](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Activate.php#L249)).
  - **Its admin copy states the enforcement tier per permission**, which nobody else does:
    - The matrix is "enforced on the server, so hiding a button elsewhere is not a substitute" ([Access.php#L85](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Admin/Tabs/Users/Access.php#L85)).
    - Refund is "Enforced on the server".
    - Changing a price "hides the buttons only — the server still accepts a price from any role that can complete a sale" ([#L271](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Admin/Tabs/Users/Access.php#L271)).
  - Which buttons a role sees is set separately per **station** ([Stations/Tabs/Tabs.php#L185](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Admin/Stations/Tabs/Tabs.php#L185)).

---

## 3. Conventions every system shares (adopt)

1. **The cashier role is "sell, and little else" by default.** Every published lowest role keeps checkout and switches off refunds or returns, voids and edits of completed sales, reports, setup and cost.
   - **Observed** for Lightspeed X Cashier, R-Series Associate, Jovvie Cashier and wePOS Cashier (§2).
   - Shopify's Cashier lists only what it allows, and returns are not on that list (**Inferred** by omission; the page names no denied items).
   - FooSales is the outlier: its Cashier gets everything except four capabilities (**Observed**).
2. **Permissions are grouped by the screen or job they belong to.** The usual groups are Sell/Checkout, Discounts, Orders/Returns, Customers, Products/Inventory, Register/Cash, Reports, Settings. **Observed** in Shopify, both Lightspeeds, Toast, Loyverse, FooSales and Jovvie.
3. **The same handful of named permissions appear everywhere** (**Observed**):
   - refund or return;
   - discount, often with a cap or a "restricted" tier;
   - change price;
   - void;
   - open the drawer without a sale;
   - view reports;
   - view cost;
   - edit products;
   - create or edit customers;
   - see or edit other people's orders.
4. **Cost is a named permission, set apart from editing products.** Square "View unit cost", Lightspeed X "Show product costs", R-Series "Product Cost", Loyverse "View cost of items", Revel "Cost Management" (Unverified). R-Series makes editing products *depend* on seeing cost. Hiding cost also hides margin and profit (R-Series, Loyverse) (**Observed**).
5. **Blind cash close is a named, separate permission.** Toast Cash Drawers (Blind) versus (Full), Erply "whether the expected amount is visible", Loyverse "View shift report", Oliver "blind close" (**Observed**).
6. **Settings are set in the back office, per role.** Only FooSales and Toast offer per-person exceptions on top of a role. Odoo has no roles at all: its two tiers are lists of named employees per till config (**Observed**).
7. **Location scope is separate from the role.** A role says what you may do; an outlet or store assignment says where (**Observed**: Square, Shopify, both Lightspeeds, Loyverse). Shopify warns this is not data scoping: staff "can still see inventory at all locations".
8. **Device settings are guarded by a permission, not by a central lock.** Shopify's Store settings group, Toast's Terminal Setup and Advanced Terminal Setup, and Loyverse's "Change settings" decide *who* may change the till's own settings. Square's modes and Lightspeed X's register settings set them centrally. None of them documents a per-setting "set here, locked at the till" switch (**Observed** for the permissions; the lock is not documented anywhere).
9. **Nobody documents whether withheld data leaves the device.** Not one vendor says whether a hidden field is absent from the device or only from the screen (**Observed** absence across every help centre read). Where source can be read:
   - Odoo ships cost to every till and hides it in the view (**Observed**).
   - FooSales sends every order and filters by user on screen (**Inferred**).
   - The one first-party statement of data withheld *at the source* is Lightspeed X's API scope `products:read:costs` (**Observed**).
10. **Nobody documents what a till does with an action queued under a permission that was later revoked.** Not documented anywhere. Offline queues (Square, Shopify, Loyverse, Lightspeed X, Toast) are described only as "will sync".

## 4. Notable divergences (choose with a reason)

- **What a cashier sees for a missing permission.**
  - **Shopify and Toast choose per permission** among hidden, disabled and approval (Shopify: Allowed / Denied / Approval required; Toast: a passcode prompt for discounts, disabled cash buttons, absent home-screen options).
  - Loyverse prompts for a PIN for most rights but hides Refund.
  - Lightspeed X never prompts; it makes you switch user.
  - Odoo hides almost everything.
  - **Choose:** hide whole areas and settings; disable an action in context where its absence would confuse the cashier (a Price key). A manager prompt is out of scope for WCPOS v2.2.0 by ruling (map #599). (**Inferred** recommendation.)
- **Own sales only.** There are three shapes:
  - a single "others' orders" permission: Toast's View / Edit Other Employees' Orders, FooSales;
  - a general "added by myself" scope on every module: Erply;
  - nothing at all: Shopify, Loyverse, Odoo, YITH.
  - Toast **splits viewing from editing** others' orders, which is the finer cut. (**Observed**.)
- **How fast a change arrives.**
  - Oliver claims "under 10 seconds" (a marketing page).
  - Toast says changes are "published immediately" but "may not immediately reflect": resync or restart.
  - Shopify says "a few minutes" for a PIN, or force-close.
  - Square modes: after the next transaction.
  - Odoo: next reload (Inferred).
  - **Choose:** state the latency the till guarantees, and give a "refresh permissions" action. Two vendors (Toast, Shopify) document that action as the fix.
- **Offline sign-in.** Toast refuses to sign anyone in while offline ("You will not be able to log back in until the connection is restored"), and Oliver's PIN check is "online-only". Loyverse, Square and Lightspeed X keep selling offline without saying how they authorise. This is the real trade-off: an offline till either trusts its last-known permissions or stops letting people in.
- **Where enforcement lives.**
  - Jovvie labels each permission as server-enforced or button-only, in the admin UI itself.
  - FooSales enforces refunds on the server.
  - Odoo's gates are client getters.
  - Lightspeed X withholds cost at the API by token scope.
  - **Choose:** label it per permission, as Jovvie does. That is the map's "API level versus app only" question answered in the merchant's own UI.
- **Per-person exceptions.** Toast (override column) and FooSales (extra capabilities per user) allow them. Shopify forbids them outright ("can't assign individual permissions"), as do Lightspeed X and Loyverse. Per role only is already ruled for WCPOS.

## 5. Mistakes to avoid

- **Do not say a field is hidden while shipping it to the device.**
  - Odoo loads `standard_price` and every customer's contact details into every till and gates only the popup. Anyone with devtools reads cost.
  - FooSales filters others' orders on screen only (Inferred).
  - A merchant who asked for cost to be "completely hidden" would be misled by either.
- **Do not let the help text and the code disagree about who sees what.** Odoo's Margins & Costs help says "When disabled, only PoS manager can view". The code shows nothing to anyone when it is disabled, and only managers when it is enabled.
- **Do not label a UI-only gate as a permission without saying so.** Jovvie's "hides the buttons only — the server still accepts a price" is the honest version. YITH's CSS gist is the dishonest one: a "permission" a cashier defeats by reloading without the stylesheet.
- **Do not leave stale permissions on a device with no documented way to refresh them.** Toast's "may not immediately reflect" and Shopify's "force close and reopen" are the support load that follows. Make the refresh explicit and the latency known.
- **Do not let losing offline work hinge on an ordinary action.** Square loses pending offline payments on sign-out or a mode switch; Shopify warns logging out "might cause loss of offline orders". Loyverse's rule, "will not allow you to sign out… while there are unsynced receipts", is the safe one. A permission change that signs a cashier out must not discard their queue.
- **Do not make a "limit" that still leaks.** Loyverse's "View all receipts" off still shows the last 5 receipts from *every* cashier at the store. Shopify's location assignment "doesn't limit data viewing". If the toggle reads "own sales", it must mean own sales.
- **Do not publish rights that another page says cannot be removed.** R-Series lists Open Register and Close Register as rights, and another of its own pages says they "cannot be removed from user roles".

## 6. Relation to WCPOS

WCPOS's ruled shape matches the convergence: per-role WordPress capabilities, grouped by job, every new one switched on, with location scope (stores) kept separate from the role. The surveyed systems also give the defaults for a lowest role: sell yes; refund, void, others' orders, reports and cost no. The two places where an offline-first till must go further than every vendor documents are the two the map named.

- **Hidden data.** No vendor says whether withheld data leaves the device. The only systems whose source can be read ship it and hide it on screen. A WCPOS till that replicates products and orders locally would repeat that by default. "Completely hidden, even in the response" therefore has to be a store-side query or field scope, the shape of Lightspeed X's `products:read:costs`, rather than an app gate. It also has to come with a defined purge of rows or fields already replicated when the capability is revoked.
- **Permission changes.** Nobody documents what happens to queued actions or cached data. WCPOS has to choose and state all three:
  - how fast a till picks up a new set of effective capabilities;
  - whether an offline till trusts its last-known set (Loyverse and Square in practice) or refuses sign-in (Toast, Oliver);
  - what happens to a queued mutation whose capability was revoked before it synced. The store should judge it against the capability at sync time and never silently drop it (Loyverse's no-sign-out-with-unsynced rule is the precedent).

Labelling each Access-matrix row as "enforced by the store" or "the app only", as Jovvie does, answers the merchant-facing half of the API-versus-app question. (Inferred throughout.)

## 7. Could not determine

- **Square**: the per-permission list and group names; the contents of the Standard, Enhanced and Full levels; what a denied control looks like; whether mode settings can be locked at the device.
- **Clover**: the whole permission list and the Employee defaults. The help centre does not render.
- **Shopify**: whether POS roles can hide cost (only an admin "View cost" snippet was found); how fast a role change reaches the device.
- **Lightspeed X-Series**: the complete itemised permission list; behaviour when a discount exceeds the role limit; how fast a role change reaches the device.
- **Lightspeed R-Series**: per-role defaults; whether missing controls are hidden or disabled; any offline POS mode.
- **Toast**: default jobs, and any cost or margin permission.
- **Loyverse**: preset defaults, and how and when rights changes reach the POS.
- **Revel**: everything beyond snippets. Its guide returns 401.
- **Oliver**: its 120 permissions and 12 categories. Its help centre fails TLS; claims rest on marketing pages.
- **YITH**: real capability names and how cost is shown by role.
- **wePOS Pro**: the action-level list.
- **FooSales**: how the closed-source app shows a missing capability, and when it refreshes.
- **Jovvie**: how often the app reloads capabilities after a role edit.
- **Every vendor**: whether hidden data is absent from the device (not documented anywhere; observable only in Odoo's source); what happens to an already-queued action after a permission is revoked (not documented anywhere); what happens to data already on the device after a permission change (not documented anywhere).
- **Odoo**: I did not run a live till. The reload-only pickup is inferred from code.
