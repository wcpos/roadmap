# Docs completeness ledger: the 2.0 app against the 2.x pages, 2026-11-03

Research for [roadmap#525](https://github.com/wcpos/roadmap/issues/525), feeding the docs sweep-design ticket. Why it exists, Paul, 2026-11-03, verbatim: *"improving the documentation - making it complete, improving organisation, improving screenshots and explanations is literally the most important part of this task. Don't just do one sweep, do multiple sweeps, as you polish and refine the documentation until you have a full understanding of how the POS works and how you can explain that to users."* The ledger is how "complete" is measured and how a later sweep knows what it closed: a sweep re-runs a row, changes its verdict, and the counts below move.

Labels: **O** Observed (read in the app source, the docs snapshot or the sidebar; path given). **I** Inferred.

The data is [2026-11-03-docs-completeness-ledger.csv](2026-11-03-docs-completeness-ledger.csv): 661 rows, columns `area, functionality, source_path_in_app, journey, docs_page, verdict, note`. Every non-covered row's note says where we looked (pages read, strings grepped).

## Sources and versions

- App: `wcpos/monorepo` `main` at `fe9c264fe` (2.0 beta), pulled 2026-11-03 (**O**). Routes `apps/main/app/**`; screens `packages/core/src/screens/**`; hotkeys `packages/core/src/extensions/hotkeys/bindings.ts`; error registry `packages/utils/src/logger/error-registry.json`; user-visible labels from `packages/core/src/contexts/translations/locales/en/core.json`.
- WP admin: `woocommerce-pos` `origin/main` `7d3e2657` and `woocommerce-pos-pro` `origin/main` `0c04ce1`, read with `git show`/`git grep` (the local checkouts are stale; never read from the working tree) (**O**).
- Docs: `wcpos/docs` `origin/main` at `3dfc896a` (2026-11-03 12:07), extracted with `git archive` because the local checkout is 72 commits behind (2026-10-21) and 53 version-2.x pages changed since (**O**). 238 `.mdx` pages under `versioned_docs/version-2.x/` (the issue's "283" was not reproduced; 238 is the file count) and `versioned_sidebars/version-2.x-sidebars.json` (**O**).
- Register states: the 2026-10-21 rulings (memory `register-states-and-admin-rulings-2026-10-21`); journeys: the [#513 resolution](https://github.com/wcpos/roadmap/issues/513) (J0 to J12 plus the manager tier). The [#364 inventory](../audits/2026-09-23-v2-docs-impact-inventory.md) measured 2.0 correctness (Fine/Amend/Rewrite/New); this ledger measures completeness and findability, so its verdicts are not copied.

## Method

1. **App first.** Every route, panel, setting, cashier action (button or hotkey), register state and band, gateway, hardware path and error code was enumerated from source, one row per merchant-facing unit (not per component). Four read-only passes ran in parallel, one per slice: (A) POS shell, register session, product panel; (B) cart, checkout and tender, receipts, customer display, gateways; (C) back office (Orders, Products, Customers, Coupons, Reports, Store health, Logs, Support), auth/connect, app shell, Free-meets-Pro gates; (D) every in-app setting and every WP-admin settings screen in Free and Pro. Hotkeys and error codes were enumerated directly. Rows duplicated across slices were merged (9 dropped) (**O**).
2. **Then the page.** For each unit, the docs snapshot was grepped for the app's own label and synonyms, and the matching section read before judging.
3. **Verdicts.** `covered`: a page a merchant doing the task would find explains what it does and how to use it. `thin`: one sentence, a list item or table cell with no how-to, or the page skips this unit's behaviour, or describes it in a 1.x shape that leaves the 2.0 task unexplained. `missing`: no 2.x page mentions it. `misfiled`: explained only where a merchant doing the task would not look (an error-code page, Developer Reference, a wp-admin settings page for a till action). Note: a `covered` row can still be wrong for 2.0; contradictions found on the way are listed separately below.
4. **Journey key.** Each row carries J0 to J12 from #513, `MGR` for the manager tier, or `INPUT` for hotkeys (an input mode, not a journey).
5. **Error codes** are keyed to their own pages: a code with a page is `covered` for findability (a cashier is sent there by the app's error), and the body of each page was not audited row by row (**O**: 111 codes in the registry, 111 pages, all in the sidebar).

## Headline counts (O)

| Verdict | All rows | Without error codes |
|---|---|---|
| covered | 353 | 242 (44%) |
| thin | 153 | 153 (28%) |
| missing | 136 | 136 (25%) |
| misfiled | 19 | 19 (3%) |
| **total** | **661** | **550** |

Without the 111 error-code rows, **56% of the app's merchant-facing units are not adequately documented** (thin + missing + misfiled) (**O**).

### Per journey (error codes excluded)

| Journey | Rows | covered | thin | missing | misfiled | covered % |
|---|---|---|---|---|---|---|
| J0 Set up a device | 50 | 24 | 18 | 6 | 2 | 48% |
| J1 Open the register and run the session | 40 | 15 | 11 | 12 | 2 | 38% |
| J12 Find a product | 61 | 31 | 11 | 18 | 1 | 51% |
| J2 Sell to a guest | 50 | 25 | 8 | 13 | 4 | 50% |
| J3 Sell to a customer | 20 | 8 | 9 | 3 | 0 | 40% |
| J4 Park and resume | 17 | 4 | 7 | 6 | 0 | 24% |
| J5 Coupon and quick discount | 13 | 5 | 5 | 3 | 0 | 38% |
| J6 Variations | 9 | 4 | 1 | 4 | 0 | 44% |
| J7 Refund (Pro) | 6 | 4 | 2 | 0 | 0 | 67% |
| J8 Offline sale and offline new customer | 19 | 4 | 6 | 8 | 1 | 21% |
| J9 Receipt and the Paid moment | 75 | 43 | 13 | 14 | 5 | 57% |
| J10 Close the register | 32 | 9 | 17 | 5 | 1 | 28% |
| MGR manager tier | 146 | 66 | 45 | 33 | 2 | 45% |
| INPUT hotkeys | 12 | 0 | 0 | 11 | 1 | 0% |

### Per area

| Area | Rows | covered | thin | missing | misfiled | covered % |
|---|---|---|---|---|---|---|
| App shell | 41 | 11 | 21 | 7 | 2 | 27% |
| Register session | 59 | 20 | 17 | 20 | 2 | 34% |
| Product panel | 49 | 22 | 6 | 20 | 1 | 45% |
| Cart | 62 | 19 | 27 | 14 | 2 | 31% |
| Checkout and tender | 35 | 19 | 6 | 7 | 3 | 54% |
| Payment gateways | 17 | 17 | 0 | 0 | 0 | 100% |
| Receipts | 17 | 8 | 5 | 3 | 1 | 47% |
| Customer display (Pro) | 8 | 0 | 1 | 6 | 1 | 0% |
| Hotkeys | 11 | 0 | 0 | 10 | 1 | 0% |
| Back office | 52 | 20 | 20 | 12 | 0 | 38% |
| Reports | 30 | 3 | 15 | 11 | 1 | 10% |
| Store health and support | 18 | 10 | 2 | 5 | 1 | 56% |
| In-app settings | 92 | 50 | 25 | 13 | 4 | 54% |
| WP Admin settings | 59 | 43 | 8 | 8 | 0 | 73% |
| Error codes | 111 | 111 | 0 | 0 | 0 | 100% |

The pattern (**I** from the tables): what was written per vendor or per code (gateways, error codes, WP admin) is complete; what a cashier does between those (the register session, parking orders, offline, closing, Reports, hotkeys, the customer display) is where the holes are. Every gateway has its page, but Square, PayArc, Windcave and Mercado Pago describe only the Legacy-tab flow (**O**), and whether their tender-pane tiles exist on `main` was not checked (**I**).

## The ten most consequential gaps

Ranked by how many cashiers hit it on a normal day and what goes wrong if the page is not there (**I** for the ranking; each fact **O**, rows in the CSV).

1. **The register session has no cashier page (J1, J10).** Opening the register (float), Pay in / Pay out / No sale, the cashier sheet (who is on the till, Your sales today, the drawer tile, sign out with an open drawer), switching cashier (Hand the till to, hand-over confirm and slip) and switching register (Take the drawer with you / Leave it) are missing or thin. Opening is described only in Managing Your Store > Reports > Reconciliation; the cashier sheet is on no page.
2. **The register bar and its states are undocumented (J1, J8, J10).** The pills (Choose register, No register, Offline · N to send, N awaiting store, Counting, Approval needed, Overdue, Closed), the "No register for this store" and "Can't reach this store's registers" gate cards and the product-panel locks ("Price check only until the register is open", "Counting the drawer") have no page; `pos/index` still describes a 1.x header with a connectivity dot.
3. **The 2.0 product panel's default view is undocumented (J12, J6).** The tile grid, the tiles/rows toggle, tile size and fields, Browse by category with breadcrumb and back, sort, and the in-place variations pane are missing; the docs describe only the table list with plus/arrow buttons. Quick filters (Customise filter bar, Save as, edit/hide/delete) have one line in What's new.
4. **Keyboard shortcuts are wrong end to end (INPUT).** `settings/store/hotkeys` and `pos/index` list Ctrl+Shift navigation chords and Ctrl+F that 2.0 does not bind; none of the eight 2.0 chords (Alt/Option + F, P, N, ←, →, D, V, /) nor the Alt+/ help sheet appears on any page.
5. **Reports is documented as the 1.x screen (MGR, J10).** 3 of 30 units covered: the sales total with comparisons, By hour / By day chart, status scope, the nine cards, drill-in panels with Export CSV and Print report, cost/profit/margin and the Closures room are missing or thin.
6. **Parking and resuming orders (J4, 24%).** The open-order tabs strip and its status chips (In checkout, Partly paid, Waiting for terminal, Paid · awaiting store, Invoice sent, Save refused), the "{count} open" list, and the Order details sheet actions (change Status, hand an order to another cashier, send it to another register or store, Tax exempt, print an unpaid order) are missing or thin; `pos/cart/open-orders` describes a carousel.
7. **Offline (J8, 21%).** The awaiting-store states (bar pill, cashier-sheet band, receipt "Awaiting store · not yet confirmed"), offline scanning, the queued receipt email and the offline new customer that stays a guest sale are missing or thin; `getting-started/offline` lists what works offline, not what the cashier sees.
8. **The Paid moment and receipt stage are 1.x-shaped (J9).** `receipts/at-checkout` describes a receipt modal with a browser print dialogue; "Printed to {printer}" / Print again, Print receipt · New sale, Sync order from the receipt and the Awaiting store state are missing or thin, and Download PDF appears only on PRINT311.
9. **Quick discount (J5).** The Add Discount sheet's Quick discount tab has one sentence; `pos/cart/discounts` teaches a negative fee, which 2.0 refuses ("A fee cannot be negative. Use Add Discount instead", `core.json` `pos_cart.fee_amount_negative`), and the Quick Discounts setting is described as a free list though 2.0 has at most three keys.
10. **Customer display and card readers have no pages (Pro, J2, J9, J0).** Pairing a display (code, URL, paired displays, Forget), its idle, declined and Paid screens, and the per-store display template are on no page; Settings > Card readers (Connect, Tap to Pay, Disconnect, Forget, Release the reader) is explained only inside the Stripe and SumUp gateway pages. The app links to `docs.wcpos.com/customer-display` and `docs.wcpos.com/hardware/card-readers`, neither of which exists in the snapshot nor in `vercel.json` redirects (**O**; that they 404 live is **I**).

Close behind: the closing count (J10: denomination counter, other tenders, the difference note, Closure written / Print closure) is thin; Free's upgrade strip and the Pro preview overlay are missing; the Theme page's Scale, Icons and Fonts and four themes are missing; the Edit Printer dialog's cash-drawer connector, Open drawer and emulation warning are missing; cash rounding per gateway is missing everywhere.

## IA problems (sidebar paths)

1. **The cashier's first task is filed under Reports (O).** Opening the register lives in *Managing Your Store > Reports > Reconciliation* (`reports/reconciliation`), closing in *Using the POS > Reconciliation* (`pos/reconciliation`), register setup in *Managing Your Store > Stores > Registers and devices*, *Managing Your Store > Stores > Setup* and *Settings > WordPress Admin > Registers*. *Using the POS* has no Register page, and nothing for the cashier sheet. One task, five homes.
2. **Split homes (O).** Refunds: *Using the POS > Refunds* and *Managing Your Store > Orders > Refunds*. Reconciliation: *Using the POS > Reconciliation* and *Managing Your Store > Reports > Reconciliation*. Closures CSV: *Settings > WordPress Admin* (Tools) though Reports has its own Export CSV. The store picker every cashier sees: only in the Pro page *Stores > Setup*.
3. **The Settings section is 1.x-shaped (O).** `settings/index` and `settings/store/index` open settings from the user menu or Ctrl+Shift+S as a tabbed panel. *Settings > Store Settings* lists General, Tax, Barcode, Keyboard Shortcuts, Theme; the app's seven pages are General, Tax, Printing, Card readers, Customer display, Barcode scanning, Theme. Printing lives under *Hardware > Receipt Printers*; Card readers and Customer display have no page; Keyboard Shortcuts is not a settings page in 2.0 (it is a POS input mode). `settings/wp-admin/index` lists sections that are not screens (Email Notifications, Registers, Tax IDs) and omits Cloud Print, Extensions, Export closures, Logs and License.
4. **The Using the POS landing describes the 1.x shell (O).** `pos/index`: a header bar, a green/yellow/red connectivity dot, a user menu with "switch users, log out", a "Checkout modal", a drawer table without Coupons and Settings and with Reports marked Pro (Reports is Free in 2.0, ruled 2026-11-02). The register bar, the cashier sheet and the single Offline badge are not on it.
5. **Till behaviour parked on pages a cashier does not open (O; the 19 misfiled rows).** The stock guard and stock notice (Reduce / Remove) and stock changing during checkout: only *Settings > WordPress Admin > Checkout*. Multi-tab: only *Developer Reference > Sync engine*. Session expired banner: AUTH101. Register taken over: REGISTER221. Card charged but order unfinished: PAYMENT121 / CHECKOUT201. Already paid online / exceeded balance: PAYMENT501 / PAYMENT511. Engine warnings band: CHECKOUT411 / CHECKOUT421. Download PDF: PRINT311. Copied site: AUTH341. Paired displays: DISPLAY101.
6. **Checkout is one leaf, the Paid moment is filed under Receipts (O).** *Using the POS > Checkout* has no children; the card-reader cashier flow lives per vendor under the top-level *Payment Gateways*; *Receipts > At checkout* (`receipts/at-checkout`) is sixth of seven in Receipts, after the template and developer pages. The template switcher, printer switcher and mismatch badge on the receipt are explained only on `hardware/printers/index`.
7. **Coupons sits under Using the POS but is the management page (O).** *Using the POS > Coupons* links `coupons/index`, which says coupons are created in WooCommerce and need Pro to apply; the Pro back-office Coupons screen (New coupon, edit, delete, filters) has no home under *Managing Your Store*.
8. **J0 is scattered (O).** Install, connect, licence, choose store and register, pair the printer: *Getting Started > Installation / Connect / Pro License*, *Managing Your Store > Stores > Setup* (Pro), *Stores > Registers and devices*, *Hardware > Receipt Printers > Setup wizard*. Getting Started has ten pages (What's new, Upgrading, Previous versions, Roadmap among them) before the first selling page (**O**); no page walks a new till from install to first sale (**I**).
9. **Screenshots are pre-2.0 everywhere (O dates, I content).** The 2.x pages carry 29 images on 22 pages, every one last changed between 2024-12-08 and 2026-02-08 (`git log` on `static/img/*`), before the 2.0 UI overhaul (roadmap#282, 2026-09); 24 `{/* Screenshot: … */}` placeholders sit on 18 pages. The register bar, cashier sheet, tender pane, tiles, Reports and the customer display have no screenshot at all.
10. **Label drift between app and docs (O).** "Product settings" (app) vs "Display Settings" (docs); "Print closure" vs "Print Z-report"; "Print receipts as an image" vs "Full receipt raster"; "Sync order" vs "Save to Server"; Add Discount sheet tabs vs "Add Coupon button below line items"; caret-opened side dialog vs "three-dot menu" on Orders; "Hand the till to" vs the 1.x user badges on Connect.

## Docs statements the app contradicts (O)

Found while judging completeness; the correctness axis belongs to the #364 lineage, but these are listed because a sweep closing the rows above must not keep them.

- `customers/index` and `products/index`: deleting from the POS "only removes them locally". The app's confirm says deleting a user is permanent with no Trash (`customers.are_you_sure_you_want_to`), and products go to the server Trash. A merchant following the page can delete customer accounts (**I**).
- `coupons/index`: "Coupons are created in WooCommerce, not in the POS"; Pro has New coupon. The page also says applying coupons needs Pro, which `free-vs-pro` contradicts.
- `getting-started/pro-license`: "There's no in-app upgrade to Pro button"; Free shows an upgrade strip on every page. It also asks for a License Email the screen does not have.
- `pos/cart/discounts`: the negative-fee method the cart refuses.
- `settings/store/hotkeys`, `pos/index`, `settings/store/index`: Ctrl+Shift chords and Ctrl+F that 2.0 does not bind (`git grep -i ctrl+shift` finds none in `packages/core` or `apps/main`).
- `pos/index`, `getting-started/index`: Reports marked Pro.
- `reports/reconciliation`: "the drawer icon in the bar" (no register button in the bar since 2026-10-29) and "Print Z-report" (the button says Print closure).
- `getting-started/whats-new`: WP Admin > POS > Settings > Registers (now General > Register); `stores/setup`: "Variance threshold", "Expected close time" (copy ruled out 2026-10-21).
- `support/store-health`: opens on Performance; the app opens on Database.
- `settings/store/tax`: tax rows as choices and a Restore button; in 2.0 they are read-only links to WooCommerce and Restore is on General only.
- App-side links: the notification panel's "About notifications" goes to the docs home (`notification-panel.tsx:158`), not `support/notifications`; the two dead links in item 10 above.

## What this did not reach (honest coverage)

Enumerated (**O**): every route file in `apps/main/app/**` (61 files, the `(gallery)` dev routes excluded); every non-test source file in `packages/core/src/screens/{auth,splash}/**` and `screens/main/{pos,orders,products,customers,coupons,reports,health,logs,support,mini-apps,tax-rates,settings,receipt}/**` and the shared `screens/main/components/*` the screens use; the store schema in `packages/database`; the hotkeys bindings and command list; all 111 registry codes; every Free WP-admin settings screen (`packages/settings/src/screens/*`, Permalink, Font_Pack_Notice) and Pro's `packages/store-edit/**`, `packages/settings/src/*` and List_Stores. 206 of the 238 docs pages are cited by at least one row.

Read in part or not reached:

- Reports cards, panels and closures and the Database screen were read through their translation keys and file headers, not every line of JSX (**O**).
- `packages/query` register-session logic was read only through its callers; `pos/hooks` files outside the slice directories (split line, add coupon) were judged from their callers (**O**).
- Multi-tab `live-tab-gate` / `parked-tab`, `clear-local-data-on-startup`, the refund receipt, print-failure toasts, the dev simulated payment driver and the `stored_value` capture mode were not enumerated (**O**).
- WP-admin product-edit metaboxes (POS visibility, variation barcode), per-gateway reader fields that exist only in the API (`default_reader`, `lock_to_default`, `allowed_readers`), Pro extension actions and the Updaters were not enumerated (**O**).
- The Electron shell beyond its title bar (menus, auto-update, printing permissions), native-only paths beyond what the hardware pages cover, translations, the installer itself (`getting-started/installation` is cited by no row) and the third-party extensions and integrations pages (`extensions/*`, `integrations/*`) were not enumerated against the app (**O**).
- Error-code page bodies were checked for existence, sidebar listing and length (125 to 491 words), not for whether each Troubleshoot step still matches 2.0 (**O**).
- No screen was rendered; every verdict compares the source's strings and structure with the page text (**O**). Uncited pages: `error-codes/index`, `extensions/*` (5), `getting-started/{installation,is-wcpos-right-for-you,previous-versions,roadmap,upgrading-to-2}`, four printer troubleshooting pages, `integrations/*`, `receipts/{index,html-templates,receipt-data,thermal-templates}`, five `reference/*` pages, `stores/index`, `support/performance/index`, `support/translations` and three troubleshooting pages (**O**).

Estimate (**I**): the ledger covers the whole merchant-facing surface of the 2.0 app's screens and settings at the unit level; what it misses is depth on Reports and the Database screen, the multi-tab and startup edge paths, and the Electron/native shells. A second sweep should start there.

## How a sweep uses this

Filter the CSV by journey or area, take the `missing` and `thin` rows, write or fix the page named in `docs_page` (or the page the IA list says should own it), then flip the verdict and re-run the counts. Misfiled rows close by moving the explanation to the task page and leaving a link on the error or reference page.

## The missing list (O)


**App shell**

- Not-found screen: "This screen doesn't exist", Back to the start (MGR)

**App shell / Connect**

- "The login didn't complete" notice (nothing lost, try again) (J0)
- "Signed in as a different user" warning (added to list, selected user still logged out) (J0)

**App shell / Free meets Pro**

- Upgrade strip on every page on Free: "You're on the free version of WCPOS", See what Pro adds, Upgrade to Pro, Dismiss until next launch (MGR)

**App shell / POS shell**

- Desktop title bar carries the place, register pill, Offline badge, bell and avatar (J1)
- Session renewed automatically toast (J8)
- Local database unavailable banner (scanning, checkout, saving, voiding blocked; Reload the app / View status) (J12)

**Register session**

- No register for this store gate card (Try again, Register guide, Open Stores for managers) (J0)
- Can't reach this store's registers gate card (Check the connection, Try again) (J0)
- Products locked band: Price check only until the register is open (J1)

**Register session / Cash movements**

- Movement validation: Enter an amount / Add a reason; drawer balance before and after (J1)

**Register session / Cashier sheet**

- Who is on the till and since when (J1)
- Drawer tile: In the drawer figure, opened by, and the verbs Pay in · Pay out · Close register (closed: Last closure · Open register; counting: back to the count) (J1)
- Awaiting store band (N sales · Sent when you are signed in online) (J8)
- Hand-over confirm: Hand over to X, POS reloads as X, still-open drawer stays for the next cashier, Close register first option (J1)
- Print hand-over slip (J1)
- Hand-over and switch blocked: Finish the payment first / Finish or abandon the count first (J1)
- Switch register confirm: Take the drawer with you (closes at expected, opens target with it as float) / Leave it open here / Take the drawer back (J1)
- Drawer carry outcome toasts (recorded at next sync / carry did not complete) (J8)
- Pro: Switch store needs the store (offline: Needs the store to switch) (J8)
- Sign out, with "X is still open at £Y. Close it first?" / Sign out anyway / Send N sales first (J10)
- WordPress Admin and Desktop App links in the sheet foot (MGR)

**Register session / Close register**

- Count note: Explain any difference (J10)

**Register session / Register bar**

- Register pills before binding: Choose register / No register (J1)
- Offline pills: Offline / Offline · N sales to send (J8)
- Awaiting-store pill: N sales awaiting store (online, store has not answered) (J8)

**Register session / Register panel**

- Drawer carried from another store/register row (Carried) (J1)

**Product panel**

- View mode toggle: grid (tiles, the default) / table (J12)
- Product tiles (poster tile: image, name, price; tap to add) (J12)
- Tile size slider (2 to 8 per row) (J12)
- Tile fields switches (name, price, tax, on sale, category, SKU, barcode, stock, COGS) (J12)
- Sort by and direction in product settings (name, SKU, barcode, type, price, dates, popularity, stock, menu order) (J12)
- Browse by setting (All products / Categories (default) / Tags / Brands / Shortcuts) (J12)
- Browse levels: category/tag/brand tiles or rows with counts, drill into a term, root tally (J12)
- Breadcrumb and back (crumb, Escape, edge swipe, Android system back) (J12)
- Variations style setting (Open in place, the default / Popover on tiles / Expanded rows in table) (J6)
- Open in place: variations pane with Products crumb, option chips, variation tiles (J6)
- Variant not available (option combination with no variation) (J6)
- In-cart count badge on rows and tiles (J12)
- Customise filter bar (drag to reorder, switch a filter off) (J12)
- Save as button: capture the current search and filters as a quick filter (J12)
- Edit, hide from bar, remove from bar, delete a quick filter (J12)
- Shortcuts browse level (quick filters as tiles) (J12)
- Stock guard: X will be backordered / Stock for X has not loaded yet (J12)

**Product panel / Barcode scanning**

- Camera states: Allow camera, Starting camera, Camera unavailable, decoding failing, offline / sync not ready notes (J12)
- Scan of a variable product: Choose a variation (J6)
- Scan lookup failed / Scanning unavailable offline (J8)

**Cart**

- Edit the order customer address in the cart (billing/shipping rows, Same as billing / Use a different address, Update customer too, Tax ID) (J3)
- Country / state pickers in address forms (J3)
- Cart Settings: cart position (Cart left / Cart right) (J2)
- Cart Settings: open orders strip position (Top / Bottom) (J4)
- Cart Settings: Sort items (Newest at bottom / top, Name, Price; fees and shipping stay last) (J2)
- Remove a quick discount from the totals (Remove {label}) (J5)
- Pro: New coupon at the till (coupon form; saved and applied; online only; Upgrade to Pro on Free) (J5)
- Order details: Status field (changing it sends the order to the store and it leaves the cart) (J4)
- Order details: hand an order to another cashier (Cashier field; Hand this order to {name}?; waits in their open orders) (J4)
- Order details: send an order to another register or store (Register / Store fields; Send to {name}; waits in their open orders) (J4)
- Order details: Tax exempt toggle (removes all tax incl. fees and shipping; offline/coupon/WC 11.3/payment-in-progress/reopen limits) (J3)
- Order details: Print (bill/receipt preview of the open order before payment) (J4)
- Checkout blocked, {n} to fix (stock or other conditions stop checkout) (J2)
- Open orders list ("{count} open": every open order with customer, items, age warning after an hour, Close) (J4)

**Checkout and tender**

- Cash rounding (cash total rounded to the gateway increment; Rounded from {amount}; Rounding line on the order) (J2)
- Pro: reader in use by another order (In use by order #{number}) (J9)
- Pro: Check payment again (device confirmation incomplete) (J9)
- Pro: Authorised, not captured / Try capture again (J9)
- Pro: payment Details log (Hide details, Copy, Share, log levels) (J9)
- Pro: Clear attempt (earlier attempt unanswered by the provider; check the provider dashboard first) (J9)
- Pro: Cancel invoice (order open again; send again if needed) (J9)

**Receipts**

- Printed to {printer} confirmation and Print again (J9)
- Awaiting store: receipt before the store confirms (Awaiting store chip, "Awaiting store · not yet confirmed" line, Not saved to the store · no order number, store-copy printer waits) (J8)
- Sync order from the receipt / Syncing with server badge (J9)

**Customer display**

- Pro: idle screen when no cart / cart empty (J2)
- Pro: payment in progress / declined message on the display (J9)
- Pro: Paid moment on the display (J9)
- Customer Display page (Pro gate: requires Pro / update Pro; Learn about customer displays link to /customer-display) (J2)
- Pair a display: Generate pairing code, code expiry, Display page URL, Copy URL, Open in browser (J2)
- Service unavailable state (reload, check Logs) (J2)

**Hotkeys**

- Alt+F Search products (pos.search.focus) (INPUT)
- Alt+P Checkout (pos.checkout.open) (INPUT)
- Alt+N New cart (pos.cart.new) (INPUT)
- Alt+Left Previous cart (pos.cart.previous) (INPUT)
- Alt+Right Next cart (pos.cart.next) (INPUT)
- Alt+D Add discount (pos.cart.discount) (INPUT)
- Alt+V Void order (pos.cart.void) (INPUT)
- Alt+/ Keyboard shortcuts help sheet (lists every command, dims unavailable ones, row press runs it; opens from the cart side, a page on a phone) (INPUT)
- Firefox note: Alt+F and Alt+D may open the Firefox menu on Windows (INPUT)
- Shortcuts exist only on web and desktop (native renders nothing) and only while the POS screen is mounted; they work inside inputs (INPUT)

**Back office / Coupons**

- Pro: Coupon filter pills: Status, Discount Type, Expires date range, Clear all (MGR)
- Pro: Add Coupon in the POS with Generate code (J5)
- Pro: Edit coupon dialog (saves as you go; Delete, Sync) (MGR)
- Pro: Delete coupon (Trash on server) (MGR)

**Back office / Lists**

- Empty and no-match states (No orders yet, No orders match these filters, Clear filters / Clear search) on Orders, Products, Customers, Coupons (MGR)

**Back office / Orders**

- Pro: Scan a receipt/order barcode to search orders (MGR)
- Pro: Orders grouped under store-day headings (MGR)
- Pro: Row keyboard on web: Up/Down moves the focus ring, Enter opens the order (INPUT)
- Pro: Payment attention band: "N sales need attention" (store refused a payment) with Open order and Handled (J9)
- JSON tab on record dialogs (orders, products, customers, coupons) (MGR)
- Pro: Email Invoice actions on an order: Invoice sent line, Send again, Cancel invoice (order open again) (J9)

**Back office / Products**

- Pro: Variation edit dialog (Set for this variation, tax class Same as parent, Managed in the product list) (MGR)

**Reports**

- Sales hero: total, Orders, Average order, Items, comparison (vs yesterday / last weekday / week before / month before / No comparison; live day compared at the same time) (MGR)
- Status scope: Completed & processing vs Every status (adds pending and on hold) (MGR)
- Card: Orders (average, median, largest, items per order, discounts, refunded; Pending / On hold / Processing, Nothing needs you) (MGR)
- Card: Top products (MGR)
- Card: Categories (Uncategorised, lines without a local product) (MGR)
- Card: Brands (MGR)
- Card: Where sold (In store vs Online channels, registers, stores) (MGR)
- Drill-in panels from each card (Sales by payment method/category/brand/cashier, Top products, Taxes collected, Channels, Registers, Stores, Refunds) as side panels or phone pages (MGR)
- Panel Export CSV (MGR)
- Panel Print report (MGR)
- Cost, Profit and Margin % columns (COGS) with "cost missing on k of m items" (MGR)

**Store health and support / Store health**

- Database: storage breakdown (cached images, logs and bookkeeping, other cashiers, other stores, signed-out stores) (MGR)
- Database: server clock skew warning (ahead / behind) (MGR)
- Database: held changes where the store had a newer version (Use server version, Discard device change, Send again, Open record) (MGR)
- Database: queued receipt emails (waiting / failed; Send again, Remove) (J9)
- Database: Registers checks (closures numbered in order, skipped numbers, counter restarted / duplicate receipt numbers, till clocks running ahead) (J10)

**In-app settings / Barcode Scanning**

- Volume slider (J12)
- Success sound / Failure sound / Failure vibration switches (J12)

**In-app settings / Card readers**

- Disconnect / Forget (confirm) / Release the reader (J9)

**In-app settings / Edit Printer dialog**

- Cash drawer connector (Pin 2 / Drawer 1, Pin 5 / Drawer 2) (J2)
- Cash drawer emulation warning (vendor vs language mismatch) (J2)
- Open drawer action (J2)

**In-app settings / Printer setup wizard**

- Save without testing (J0)

**In-app settings / Printing**

- Report templates and Closure templates routing sections (J10)

**In-app settings / Tax**

- Enable taxes (read-only, Set in WooCommerce) (MGR)

**In-app settings / Theme**

- Theme tiles: Paper, Warm, Bold, Market (MGR)
- Scale (Auto, Compact, Regular, Spacious) (MGR)
- Icons (Auto, Tabler, Hugeicons, Phosphor) (MGR)
- Fonts (Auto, System, Instrument, Grotesk, Fraunces, Manrope) (MGR)

**WP Admin settings / Checkout**

- Gateway POS settings modal: Rounding (cash rounding increment, No rounding) (J2)

**WP Admin settings / General**

- Force SSL (MGR)
- Store details (Store name, Phone, Email, Refund & Returns Policy; blank inherits WooCommerce) (MGR)

**WP Admin settings / Pro Edit Store**

- Store specific report and closure templates (J10)
- Customer Display template per store (Store default) (J2)
- Register actions: Rename, Move to store, Retire (Close its session first) (J1)

**WP Admin settings / WP Admin (other)**

- POS base permalink (Settings > Permalinks) (J0)
- Receipt font pack admin notice (could not download fonts from jsDelivr / publish font map) (MGR)

## The thin list (O)


**App shell**

- Navigation rail (wide) / front drawer (phone): POS, Products, Orders, Coupons, Customers, Reports, then Store health, Settings, Support (MGR) → `pos/index`
- Rail item tooltips on web hover (icon-only rail) (MGR) → `pos/index`
- About WCPOS dialog from the drawer foot: app, WCPOS plugin, Pro plugin, WooCommerce, WordPress versions, licence Free/Pro, Release Notes (MGR) → `pos/index`
- Unread-errors badge on the Store health nav item (MGR) → `support/logs`
- Cashier entry (avatar) in every page bar opens the cashier sheet (user menu) (MGR) → `stores/registers-and-devices;reports/reconciliation`
- Update-app gate: plugin newer than this app (web Reload; native/desktop install update; Logout; Learn more) (J0) → `getting-started/connect`
- Update-plugin gate: app newer than the store plugin (update WCPOS in WordPress, log in again) (J0) → `getting-started/connect;error-codes/AUTH331`
- Root error screen: Something went wrong, Try again, Reset app data and restart (unsent-sales warning) (MGR) → `error-codes/CLIENT151;support/troubleshooting/clear-local-data`

**App shell / Connect**

- Your sites list: site card with user count, actions menu, Remove site (Remove store and associated users?) (J0) → `getting-started/connect`
- Site card notice: Update the WooCommerce POS plugin on this site to continue (Learn more) (J0) → `getting-started/connect`
- WordPress user row: Signed in state, Sign in again / Re-authenticate a signed-out user, Remove user confirm (J0) → `getting-started/connect`
- Splash / boot screen with progress bar (J0) → `getting-started/index;products/sync`

**App shell / Free meets Pro**

- Pro preview overlay on Free over Products, Orders, Customers, Coupons (blurred page, page-specific line, Upgrade to Pro, View Demo) (MGR) → `getting-started/free-vs-pro;coupons/index`
- Reports locked scopes on Free (earlier days, other registers, other stores: lock icon, "{scope} are in WCPOS Pro", See Pro) (MGR) → `reports/index;getting-started/free-vs-pro`

**App shell / Mini apps**

- Printer setup wizard mini app hosted in the app (opened from Settings > Printing empty or trouble states) (J0) → `hardware/printers/setup-wizard`

**App shell / POS shell**

- Which side the cart sits on (Panel position: products left or right) (J12) → `getting-started/whats-new`
- Register bar on the till (menu, place, register pill, bell, avatar) as the screen header (J1) → `pos/index`
- Management page bar: bell and cashier avatar on every list page (MGR)
- Offline badge in the bar (one warning badge reading Offline, also when the store is unreachable) (J8) → `getting-started/offline;pos/index`
- Connection toasts: Device went offline / Website is unreachable / Connection restored (J8) → `getting-started/offline`

**App shell / Tax rates**

- Tax rates modal: tax-class tabs, rate table (country, state, postcode, city, rate, name, priority, compound, not on shipping), "N apply to this address", synced count (MGR) → `settings/store/tax`

**Register session**

- Last closure link on the closed register card (J10) → `reports/reconciliation`
- Another till is counting / register was closed on another till by name at time (J1) → `stores/registers-and-devices;error-codes/REGISTER221`
- Products locked band while counting: Counting the drawer. Items can be added after the count. (J10) → `reports/reconciliation`

**Register session / Cash movements**

- No sale: Open the drawer with a reason (Drawer check, Change, Mistake) (J1) → `reports/reconciliation`

**Register session / Cashier sheet**

- Avatar opens the cashier sheet (from the right, on every screen) (J1) → `stores/registers-and-devices;pos/index`
- Your sales today (cashier's own count and total) (J1) → `reports/reconciliation`
- Hand the till to (switch cashier): list of signed-in cashiers with open-cart counts (J1) → `getting-started/connect;reports/reconciliation`

**Register session / Close register**

- Count by notes and coins (denomination counter) (J10) → `reports/reconciliation`
- Count other tenders (e.g. Card counted) (J10) → `reports/reconciliation`
- Closure written sheet: Closure N written, Print closure, Printed on, Done (J10) → `reports/reconciliation;pos/reconciliation`

**Register session / Register bar**

- Tap the store name to switch store (multi-store logins) (J1) → `stores/registers-and-devices`
- Session pills: Counting / Approval needed / Overdue / Closed (J10) → `stores/setup`

**Register session / Register panel**

- Opening the register panel (from the cashier sheet drawer tile; no register button in the bar) (J1) → `reports/reconciliation`
- Other tenders and session sales breakdown (card etc.) in the panel (J10) → `reports/reconciliation`
- Unsynced figures: Figures arrive with the next sync (J8) → `reports/reconciliation`
- Last closure in the panel (number, Exact/Corrected, reprint) (J10) → `reports/reconciliation`
- Close register button, and overdue form "Close register · it's past {time}" (J10) → `reports/reconciliation;settings/wp-admin/registers`

**Product panel**

- Brand filter pill (J12) → `pos/product-panel/index`
- Clear all chip on the filter bar (J12) → `pos/product-panel/search-filtering`
- Quick filters: New quick filter editor (starters, conditions, order by, preview count, button name) (J12) → `getting-started/whats-new`
- Empty states: No products yet / Nothing here matches the filters + Clear filters / none match in this category (J12) → `pos/product-panel/index`

**Product panel / Barcode scanning**

- Android hardware-scanner key interception (J12) → `pos/product-panel/barcode-scanning`
- Barcode not found (not in this store, locally or online) (J12) → `pos/product-panel/barcode-scanning`

**Cart**

- Add new customer from the cart (Add to cart menu > Add new customer; saved-but-not-attached notice) (J3) → `customers/index;pos/cart/index`
- Offline new customer not saved to the store band (order stays a guest sale; send again from Store health) (J8) → `getting-started/offline;support/store-health`
- Add to cart menu (+): Add Discount, Add Fee, Add Miscellaneous Product, Add Shipping, Add new customer (J3) → `pos/cart/index`
- Add Miscellaneous Product dialog (name, price, SKU, tax class/status, categories, virtual/downloadable) (J3) → `pos/cart/index`
- Add Fee dialog (name, amount, Amount Includes Tax, tax class/status; fee cannot be negative) (J3) → `pos/cart/index;pos/cart/discounts`
- Add Shipping dialog (shipping method, method title, amount, Amount Includes Tax, tax) (J3) → `pos/cart/index`
- Edit fee line dialog (J3) → `pos/cart/line-items`
- Edit shipping line dialog (J3) → `pos/cart/line-items`
- Cart line row: tap/hover/swipe reveals Edit and Remove (swipe past the line removes) (J2) → `pos/cart/line-items`
- Quantity keypad on a line (One more / One fewer, typed and fractional quantity) (J2) → `pos/cart/line-items`
- Split a line into separate lines (Split on the quantity keypad; Qty column option) (J2) → `pos/cart/line-items;pos/cart/discounts`
- Quick Discounts setting: up to 3 keys edited on a keypad picture in Cart Settings (J5) → `pos/cart/index;pos/cart/discounts`
- Edit line dialog (Name, Price, Regular Price, SKU, Quantity, Categories, Virtual, Downloadable, tax, custom fields) (J2) → `pos/cart/line-items`
- Custom fields (meta data) on a line: add key/value, hidden fields, protected WCPOS keys (J2) → `pos/cart/line-items;pos/product-panel/meta-data-keys`
- Cart totals block (Subtotal, Fees, Shipping, discount rows, Taxes breakdown / Total Tax, Total; Refund and Net Payment rows) (J2) → `pos/cart/index`
- Order note row under the totals (opens Order details note field) (J4) → `pos/cart/order-actions`
- Add Discount sheet: Quick discount tab (amount or percent off the whole order, recorded as a discount) (J5) → `pos/checkout/index;getting-started/whats-new`
- Add Discount sheet: Coupon tab (search/select synced coupons; Percentage / Fixed cart / Fixed product labels; Apply) (J5) → `coupons/applying-coupons;coupons/index`
- Pro: Coupon form fields (Code + Generate, Discount type/amount, Expires presets 1 Week/1 Month/End of Day/Never/Pick a date, min/max spend, usage limits, Cannot be combined, free shipping, internal note) (J5) → `coupons/index`
- Order details sheet (... button beside Checkout) holding note, fields and Print / Sync order / Void (J4) → `pos/cart/order-actions`
- Order details: Currency field (J3) → `pos/cart/order-actions`
- Order details: Sync order (send the open order to the store now) (J4) → `pos/cart/order-actions;pos/cart/open-orders`
- Order details: Void (deletes the open order; blocked while a payment leg holds money; Cancel payment first) (J4) → `pos/cart/order-actions;pos/cart/open-orders`
- Order still on its way to the store (press Checkout again; nothing charged, no duplicate order) (J8) → `getting-started/offline`
- Open-order tabs strip (switch carts; arrow keys; swipe; current tab underlined) (J4) → `pos/cart/open-orders`
- New order: the + / "+ New" blank cart (J4) → `pos/cart/open-orders`
- Tab status chips (In checkout, In checkout offline, Partly paid {due} due, Waiting for terminal {amount}, Paid awaiting store, Paid receipt, Invoice sent receipt, Awaiting store {due} due, Save refused, Saving order) (J4) → `pos/checkout/index`

**Checkout and tender**

- Unavailable tile reasons (Needs a connection, No terminals set up, In use by order #, Update the app, Not available in the browser, Turn on Bluetooth, Sign in to the provider, Allow access, Takes the whole order) (J9) → `pos/checkout/index;payment/index`
- Payments ledger (payments taken, tendered/change per leg, tip per leg, Paid in full at time, Remaining, Recorded offline, Settles later) (J3) → `pos/checkout/index`
- Order refused by the store at checkout (Order not saved, store's reason, Store health link) (J2) → `getting-started/offline;support/store-health`
- Pro: Release this payment (unresponsive terminal; frees the order to be paid another way; store keeps checking) (J9) → `payment/gateways/square-terminal`
- Gateway-declared fields on the tender pane (Enter {label} / Choose {label}, prefilled email or phone) (J9) → `reference/gateway-template;payment/gateways/email-invoice`
- Pro: Legacy payment page load notices (form did not load, retry; no payment link yet; failed after processing; native payment not completed) (J9) → `pos/checkout/index;payment/index`

**Receipts**

- Paid moment in the checkout column (Paid {amount}, Change {amount}, Paid X tendered Y in cash, payments taken) (J9) → `receipts/at-checkout`
- Print receipt · New sale / New sale / Close from the paid moment (J9) → `receipts/at-checkout`
- Pro: Invoice sent moment (sent to destination, amount due, receipt) (J9) → `payment/gateways/email-invoice`
- Receipt view (preview with Zoom in / Zoom out; Receipt / Refund receipt title; preview unavailable) (J9) → `receipts/at-checkout`
- Receipt email queued offline (Send when online, Receipt email queued, server did not send) (J8) → `getting-started/offline`

**Customer display**

- Pro: live cart mirror on the display (lines, coupons, totals as rung up) (J2) → `getting-started/whats-new`

**Back office / Coupons**

- Pro: Inline-editable code, description, amount and expiry cells; Active toggle; Status; Usage (MGR) → `coupons/index`
- Pro: Coupon form: Discount (Percentage / Amount off order / Amount off products), Expires presets (Never, End of Day, 1 Week, 1 Month, Pick a Date), Minimum/Maximum spend, Total uses, Uses per customer, Max discounted items, One-time use, Cannot be combined, Also grants free shipping, Internal note, Status, custom fields (J5) → `coupons/index`
- Pro: No-permission hint for creating coupons (WP Admin > POS > Settings > Access) (MGR) → `settings/wp-admin/access`

**Back office / Customers**

- Pro: Customer form: name, email, Username and Password set at creation, Role set in WordPress, billing/shipping (Same as billing), Tax IDs with format check, custom fields; saves as you go (MGR) → `customers/index;settings/wp-admin/customer-tax-ids`
- Pro: Edit customer dialog (tap row / caret) with Delete and Sync (MGR) → `customers/index`
- Pro: Delete customer (permanent: no Trash for WordPress users) (MGR) → `customers/index`

**Back office / Lists**

- Sort by column header; drag a header edge to resize columns (MGR) → `products/index;orders/index`
- Phone layout: list rows become cards with a caret; record dialogs open as pages (MGR) → `pos/index`

**Back office / Orders**

- Pro: Orders list opens scoped to the signed-in cashier and current store (MGR) → `orders/index`
- Pro: Filter pills: Status, Payment method, Customer, Cashier, Store, Register, Date range, Clear all (MGR) → `orders/index`
- Pro: Open an order (row caret / tap row) into the order side dialog with View / Edit / JSON tabs (MGR) → `orders/index`
- Pro: Order View tab: status badges (Partially refunded, POS open, POS partial), identity (time, store, cashier, created via), line items, totals with Net Payment, payment (transaction ID, captured, invoice sent), customer with addresses and tax IDs (MGR) → `orders/index`
- Pro: Delete order (Trash on server; permanent if never saved; permission refused toast) (MGR) → `orders/index`
- Pro: Sync one order (refresh failed keeps device copy) (MGR) → `orders/index`

**Back office / Products**

- Pro: Scan a barcode into the Products search ("Barcode scanned" toast) (MGR) → `products/index`
- Pro: Variations display option: Open in place vs Expanded rows (shared with the POS panel) (J6) → `products/index`
- Pro: Product edit dialog: Name, SKU, Barcode, Status, Featured, Categories, Tags, Brands, Regular/Sale price, Tax, Stock (Track quantity / Stop tracking), Virtual, Downloadable, custom fields; saves as you go; Delete, Sync (MGR) → `products/index`
- Pro: Delete product (Trash on server) / variation (permanent) (MGR) → `products/index`

**Back office / Refunds**

- Pro: Refund failure outcomes: offline, app in background, sign in, outcome unknown (check refunds before retrying, a retry could refund twice) (J7) → `orders/refunds`
- Pro: Refunds section in the order view (each refund, By cashier, reason, refund receipt, local refund summary, Retry load) (J7) → `orders/refunds`

**Reports**

- Scope bar: Store (All stores), Register (All registers), Cashier (Everyone) (MGR) → `reports/index`
- Date button: Today, Yesterday, This Week, Last Week, This Month, Last Month, Custom ranges calendar (MGR) → `reports/index`
- Sales chart: By hour / By day, Running total, comparison line (MGR) → `reports/index`
- Leave orders out of the report (Orders panel checkboxes, "N left out", Put them back) (MGR) → `reports/index`
- Print summary (Sales summary) and offline print-waiting states (no template prints offline, printer mismatch) (MGR) → `reports/index`
- Card: Payments (by method, UNPAID) (MGR) → `reports/index`
- Card: Cashiers (MGR) → `reports/index`
- Card: Refunds (refunded vs kept) (MGR) → `reports/index`
- Card: Taxes (gross / net per rate) (MGR) → `reports/index`
- Till strip: today on this register (opening float, cash sales, cash refunds, paid in/out, expected in drawer, Print X-report, last closure, drawer result; No register on this device) (J10) → `reports/reconciliation;pos/reconciliation`
- Pro: Closures room (Earlier closures): list with All / Open / Counted / Corrected, stats (Sessions, Cash at open, Cash at close, Cash activity, Discrepancy), Load more, unavailable offline (J10) → `reports/reconciliation`
- Closure detail panel (session, drawer, counted vs expected, tenders, corrections, late sale / movement, approved by, printed count) (J10) → `reports/reconciliation`
- Print closure / Print X-report from session cards and closure panel (J10) → `reports/reconciliation`
- Recount a closure (Recount..., count by notes and coins, Manager approval, reason, Record count; needs connection and a synced closure) (J10) → `reports/reconciliation`
- Open session cards (open sessions since time by cashier, Print X-report) (J10) → `reports/reconciliation`

**Store health and support / Store health**

- Performance: Server load and pace (Easing off, Paused until, "Your server, over time") (MGR) → `support/store-health;support/performance/server`
- Database: attention panel for stuck records (Fix record, Retry, View log) (MGR) → `support/store-health`

**In-app settings**

- Settings area entry and page nav (General, Tax, Printing, Card readers, Customer Display, Barcode Scanning, Theme) (MGR) → `settings/index;settings/store/index`

**In-app settings / Barcode Scanning**

- Sound theme (Classic, Checkout, Soft) with preview buttons (J12) → `settings/store/barcode`
- Scanner row status (Connected, Registered, Not in range, Not plugged in, Not connected) and Disconnect (J12) → `hardware/scanners/setup-wizard`
- Test panel timing chart, threshold line, recent scans, near-miss and typing verdicts (J12) → `hardware/scanners/setup-wizard`
- Test panel one-tap suggestions (threshold, min chars, prefix, trailing Enter, shift-mangled) (J12) → `hardware/scanners/setup-wizard`

**In-app settings / Card readers**

- This phone section: Set up Tap to Pay (admin only; Not set up - ask an administrator) (J9) → `payment/gateways/stripe-terminal`
- Bluetooth readers section and empty state (J9) → `payment/gateways/stripe-terminal`
- Reader row states (Connected, Ready, Not connected, battery %, Connecting, Could not connect, Bluetooth off, permission, Not logged in) (J9) → `payment/gateways/stripe-terminal`
- No device-mode provider empty state (cloud readers set up on the gateway page) (J9) → `hardware/index`

**In-app settings / Edit Printer dialog**

- Edit Printer opens from row Edit; fields autosave, no Save button, Close flushes (J0) → `hardware/printers/index`
- Printer Name (J0) → `hardware/printers/index`
- Connection type segmented (Network, Bluetooth, USB) per platform (J0) → `hardware/printers/index`
- Network lane: IP Address, Port, Scan Network, Use this printer, detected vendor (J0) → `hardware/printers/index;hardware/printers/setup-wizard`
- Vendor (Epson, Star, Generic) (J0) → `hardware/printers/supported-printers`
- Auto-cut paper (J0) → `hardware/printers/index`
- Test Print in Edit Printer and inline failure with Support details / Copy support details (J0) → `hardware/printers/index`

**In-app settings / General**

- Store base country/state/city/postcode (read-only, Set in WooCommerce link) (MGR) → `settings/store/general`
- Restore server settings (danger zone, confirm dialog, Restored mark, offline failure + Try again) (MGR) → `settings/store/general;settings/store/tax`

**In-app settings / Printer setup wizard**

- More options: Name, Vendor, Printer text width, Receipt language (J0) → `hardware/printers/non-latin-receipts`
- Office printer detected (listed, not tested) (J0) → `hardware/printers/setup-wizard`

**In-app settings / Printing**

- Printer row Test Print (Printed on / Sent to toast) (J0) → `hardware/printers/index`
- Printer row menu: Set Default, Copy setup report, Delete (with confirm) (J0) → `hardware/printers/index`

**In-app settings / Tax**

- Prices entered with tax (read-only, Set in WooCommerce) (MGR) → `settings/store/tax`
- Shipping tax class (read-only) (MGR) → `settings/store/tax`
- Round tax at subtotal level (read-only) (MGR) → `settings/store/tax;support/troubleshooting/totals-disagree`

**WP Admin settings / Cloud Print**

- Print format (PDF recommended / ESC/POS RAW) (J9) → `receipts/cloud-printing`

**WP Admin settings / General**

- Pro: Stores table (Store, Address, Edit, Manage stores) replacing store details (MGR) → `stores/setup`

**WP Admin settings / General > Register**

- Remind the cashier to close at (expected close time; Overdue band, Checkout becomes Close register) (J10) → `settings/wp-admin/registers`
- Pro: site defaults line and Add store / Manage stores links (Pro register section) (J1) → `settings/wp-admin/registers`

**WP Admin settings / Pro Edit Store**

- Register box: per-store override of open/close, variance, close reminder (Site default / Overridden / Customise / Use site default) (J1) → `stores/setup`
- Registers list: name, default float, status (Open since / Counting / Closed - last closure), + Add register (J1) → `stores/setup;settings/wp-admin/registers`

**WP Admin settings / Tools**

- Export closures (CSV download, failure messages) (J10) → `reports/reconciliation`

**WP Admin settings / WP Admin settings shell**

- POS > Settings app nav (General, Checkout, Cloud Print, Access, Sessions, Extensions; Tools: Export closures, Logs; Account: License) (MGR) → `settings/wp-admin/index`

## The misfiled list (O)


**App shell / Connect**

- Site identity clash: store reports the same identity as a saved site (a copy) (J0) → `error-codes/AUTH341`. Only on AUTH341; connect page silent (grep "same identity", "copy of").

**App shell / POS shell**

- Session expired banner with Log in (and "N sales waiting to sync · Log in to continue") (J8) → `error-codes/AUTH101`. Only the AUTH101 error-code page explains a session expiring; offline and connect pages do not mention the banner or the waiting-sales variant; grep "Session expired", "waiting to sync".

**Register session**

- Register taken over by another device (session adopted) (J1) → `error-codes/REGISTER221`. Only REGISTER221 and the Logs event describe it; grep "taken over".
- Multi-tab: the POS open in several browser tabs on one device (stale line, follower tab defers) (J1) → `reference/sync-engine`. Only the Developer Reference sync-engine page and support/store-health "Two tabs, two counts" note talk about several tabs; no cashier page says running two tabs is supported; grep "another tab", "two tabs".

**Product panel**

- Stock guard at add: Only N available for X (J12) → `settings/wp-admin/checkout`. Explained only on the wp-admin Checkout settings page (Prevent Overselling); no product-panel page mentions it.

**Cart**

- Stock on a line ("{n} available", Out of Stock) and the stock notice above the cart (Only N available / out of stock, Reduce, Remove) (J2) → `settings/wp-admin/checkout`. Explained only under Prevent Overselling on the wp-admin Checkout settings page; no cart page mentions the notice or its Reduce/Remove buttons (grep "only .* available" in pos/cart none).
- Engine warnings banner (Check this order's amounts: unknown tax rate, unreadable line price basis) (J2) → `error-codes/CHECKOUT421;error-codes/CHECKOUT411`. Explained only on error-code pages CHECKOUT421/CHECKOUT411; no cart page mentions the warning band.

**Checkout and tender**

- Stock changed during checkout (items exceed available; Return to Cart) (J2) → `settings/wp-admin/checkout`. Only the wp-admin Prevent Overselling section describes the server-side refusal; checkout page does not.
- Payment leg refused after the fact (order already paid online / exceeded balance; refund the difference) (J9) → `error-codes/PAYMENT501;error-codes/PAYMENT511`. Explained only on error-code pages; checkout page has no section on a payment the store refused after it was taken.
- Pro: card charged but order did not finish notice (Don't charge again; Support details) (J9) → `error-codes/PAYMENT121;error-codes/CHECKOUT201`. Pro: explained only on error-code pages PAYMENT121/CHECKOUT201.

**Receipts**

- Download PDF of the receipt (J9) → `error-codes/PRINT311`. Only PRINT311 mentions retrying Download PDF; receipts/at-checkout has no Download PDF action (receipts/storefront PDF is the My Account button).

**Customer display**

- Paired displays list (Connected/Disconnected, Last seen) and Forget (J2) → `error-codes/DISPLAY101`. Pro: "Paired displays" is mentioned only on the DISPLAY101 error-code page.

**Hotkeys**

- Keyboard Shortcuts filed as a Store Setting although the app has no shortcuts settings screen (INPUT) → `settings/store/hotkeys`. In-app settings routes are general, theme, tax, barcode-scanning, printing, card-readers, customer-display; shortcuts are a POS input mode and belong with Using the POS.

**Reports**

- Export closures CSV from Reports (J10) → `reports/index;reports/reconciliation`. Docs only send you to WP Admin > POS > Settings > Tools "Export closures"; the in-app Export CSV is not mentioned.

**Store health and support / Store health**

- Logs: Copy debug info / Share debug info (MGR) → `error-codes/SYNC311`. Named only in an error-code page (SYNC311); support/logs "Using Logs for Support" omits it.

**In-app settings / Card readers**

- Card readers page (no dedicated docs page; Reader guide link targets /hardware/card-readers) (J9) → `payment/gateways/stripe-terminal;hardware/index`. Pro: the page is explained only in passing inside gateway pages (stripe-terminal, sumup-terminal); hardware/index says readers are set up with the gateway; /hardware/card-readers has no page or redirect in the origin/main snapshot or vercel.json.
- Connect a reader (provider sheet "Connect a reader with", scan, found N readers) (J9) → `payment/gateways/stripe-terminal`. Pro: steps exist only in payment/gateways/stripe-terminal#bluetooth-readers; no settings or hardware page a merchant opening Settings > Card readers would find.

**In-app settings / Edit Printer dialog**

- Printer Language (ESC/POS, StarPRNT, Star Line Mode) (J0) → `hardware/printers/setup-wizard`. Only the troubleshooting wizard (garbled-language) explains it, pointing at "Settings > Printing > Advanced Settings > Language", a 1.x path; hardware/printers#printer-options omits it.

**In-app settings / General**

- Clear all local data (danger zone on General) (MGR) → `support/troubleshooting/clear-local-data`. Explained only on a troubleshooting page that says it is in the user menu (top-right); 2.0 moved it to Settings > General on 2026-10-23 and settings/store/general does not mention it.
