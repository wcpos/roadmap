---
title: What WooCommerce merchants already expect from reports, and what the reporting plugin ecosystem sells
date: 2026-09-12
status: research
---

## Bottom line

WooCommerce core gives a merchant a competent **merchandising and accounting analytics suite for the whole store** — ten Analytics reports plus the Overview dashboard (Revenue, Orders, Products, Variations, Categories, Coupons, Taxes, Downloads, Stock, Customers), every one with date-range presets, period comparison, advanced filters and CSV download, backed by pre-aggregated `wc_order_stats` lookup tables and a genuine first-party extension API (`woocommerce_analytics_report_menu_items` in PHP + `woocommerce_admin_reports_list` in JS, with an official `--variant=add-report` scaffold). What core does **not** give, and what merchants therefore pay for, is a short and remarkably stable list: **profit/COGS** (core has stored COGS since 10.3 but still ships no profit report), **customer LTV / cohorts / RFM**, **saved segments**, **scheduled email digests**, **ad-spend joined to revenue**, **subscription MRR**, **multi-store roll-up**, and **free-form column-picking export** — and the two 100,000-install plugins in the category are both *export builders*, not dashboards. Critically for a POS, **not one commercial WooCommerce report is a register report.** That was tested, not assumed: the woocommerce.com marketplace returns no staff-attribution report for `cashier`, `staff`, `employee`, `sales by user` or `commission`, and no product anywhere in the ecosystem sells an X-report, Z-report, drawer reconciliation with counted-vs-expected variance, tender-mix split, or gap-free closure numbering — because a web store never generates those facts. WooCommerce POS should therefore treat core Analytics as the store-wide merchandising layer it already is and **not rebuild Revenue/Products/Categories/Taxes**; its uncontested ground is the register document set, which is exactly what its own users have asked for since 2023 in the single most-upvoted discussion in the repo ([#350 "End-of-day reconciliation"](https://github.com/orgs/wcpos/discussions/350), ↑5), sharpened there into stored, numbered, reprintable daily closures and pressed by a French fiscal mandate. One market-shape note worth carrying into design: **no commercial vendor exposes SQL, PHP hooks or template overrides for custom reports** — every "custom report" in this market is a saved filter-and-column configuration, so a merchant-editable report *template* is an opening rather than a commoditised expectation.

---

## 1. WooCommerce core

### 1a. WooCommerce → Analytics (the modern suite, WC 4.0+)

Source: [Analytics and Sales Reports documentation](https://woocommerce.com/document/woocommerce-analytics/) · [Taxes report](https://woocommerce.com/document/woocommerce-analytics/taxes-report/)

| Report | What it shows | CSV export |
|---|---|---|
| **Overview** (WooCommerce → Overview) | Dashboard of Performance indicators, Charts and Leaderboards (top products, categories, coupons, customers) | Per-widget; leaderboards only |
| **Revenue** | Gross sales, Net sales, Refunds, Coupons, Taxes, Shipping, Total sales — one row per interval (day/week/month/quarter/year) | Yes |
| **Orders** | Order-level table: date, status, customer, customer type (new/returning), products, items sold, coupons, net sales, attribution | Yes |
| **Products** | Per-product Items sold, Net sales, Orders, Category, Variations, Status, Stock; All-products / Single-product / Comparison views | Yes |
| **Variations** | Same metrics at variation granularity; advanced filters on Category, Product, Attribute | Yes |
| **Categories** | Items sold, Net sales, Orders and Products per category; All / Single / Comparison views | Yes |
| **Coupons** | Orders count and discounted Amount per coupon, with comparison | Yes |
| **Taxes** | Tiles for Total tax, Order tax, Shipping tax, Orders; table by tax **code/rate** with the same columns | Yes |
| **Downloads** | Downloadable-file events: date, product, order, username, IP; advanced filters on Product, Username, Order, IP | Yes |
| **Stock** | One table of every product's stock, grouped All / Out of stock / Low stock / In stock / On backorder. **Requires stock management enabled.** | Yes |
| **Customers** | Registered + guest customers: name, sign-up, last active, orders, total spend, AOV, country/region, city, postcode | Yes |
| **Order attribution** | Where orders originated (channel/source/device/campaign); surfaced as an Orders column and, more fully, in the separate [WooCommerce Analytics](https://wordpress.org/plugins/woocommerce-analytics/) beta extension (20,000 installs) | Yes (column) |
| **Settings** | Excluded statuses, actionable statuses, default date range, **Date Type** (created / paid / completed; default *paid*), Updates cadence (Scheduled every 12 h vs Immediately, WC 10.5), Reset defaults | n/a |
| **Import Historical Data** | Backfill the `wc_order_stats` lookup tables; resumable, skip-already-imported, Stop Import, failure log + retry | n/a |

Cross-cutting behaviours a POS is competing with:

| Capability | Detail |
|---|---|
| Date ranges | Today, Yesterday, Week to date, Last week, Month to date, Last month, Quarter to date, Last year, Custom |
| Comparison | vs **Previous period** or **Previous year**, on every report |
| Filters | Quick Filters and Advanced Filters (conditional logic), per report |
| Shareable state | Range + filters are written into the URL — a filtered report is bookmarkable |
| CSV | "Download" in the table header. Fits on one page → immediate download. Larger → **background job, emailed as a link** to the admin who started it |
| Chart interval | Hour (single day) / day / week / month / quarter / year, chosen by range length |

### 1b. WooCommerce → Reports (legacy; **deprecated since WC 4.0, March 2020**, no longer updated)

Source: [WooCommerce Reports documentation](https://woocommerce.com/document/reports/)

| Tab | Sub-report | What it shows | CSV export |
|---|---|---|---|
| **Orders** | Sales by date | Gross sales, net sales, shipping, refunds, coupons graphed over a range | Yes |
| | Sales by product | Daily sales for chosen products; Top sellers / Top freebies / Top earners pickers | Yes |
| | Sales by category | Sales grouped by product category | Yes |
| | Coupons by date | Discount amount and usage count; most-popular and largest-discount views | Yes |
| | Customer downloads | Download log: ID, timestamp, product, file, order, customer IP | Yes |
| **Customers** | Customers vs. Guests | Sign-ups for the period; registered vs guest order comparison | Yes |
| | Customer List | Name, username, email, location, order count, money spent, last order | **No** |
| **Stock** | Low in stock | Products running low | **No** |
| | Out of stock | Products at zero | **No** |
| | Most stocked | Highest inventory counts | **No** |
| **Taxes** | Taxes by code | Tax totals organised by rate/state | Yes |
| | Taxes by date | Tax totals across a period | Yes |

Note: refunds are counted differently in legacy Reports vs Analytics — a long-standing source of merchant confusion.

### 1c. The baseline this sets

A merchant arriving at a POS already has, for free: revenue by period, product/variation/category performance, tax by rate, coupon usage, stock levels, customer spend, and CSV out of all of it. **A POS report that merely re-renders any of those rows on a tablet adds nothing.** What core structurally *cannot* produce, because the data does not exist in a web store, is the register layer: opening float, cash in/out, tender mix, drawer count vs expected, variance, per-cashier attribution, X vs Z semantics, gap-free closure numbering, and a printed document. Core also genuinely lacks profit, LTV/cohorts, and scheduling — see §2.

---

## 2. The plugin ecosystem

### 2a. wordpress.org — ranked by active installs

Queried live against the [wordpress.org plugins API](https://api.wordpress.org/plugins/info/1.2/) on 2026-09-12, across the searches "woocommerce reports", "woocommerce sales report", "woocommerce analytics", "woocommerce report export", "woocommerce product sales report", "woocommerce cost of goods profit", "woocommerce sales report email", "woocommerce advanced reporting", "woocommerce order report", "woocommerce stock report", "woocommerce tax report", "woocommerce profit report", "woocommerce dashboard sales".

| Installs | Plugin | Author | Slug | What it adds over core |
|---:|---|---|---|---|
| 100,000 | **Advanced Order Export For WooCommerce** | algol.plus | `woo-order-export-lite` | Field-picker export of orders to CSV/XLS/XML/JSON/PDF/HTML; rename labels, reorder columns, export any custom field, group by product or customer. Pro: **scheduled** exports, export-on-status-change, delivery by email/FTP/API/Google Sheets |
| 100,000 | **WP All Export** | Soflyy | `wp-all-export` | Drag-and-drop export builder over any post type / custom field, including filtered order lists; round-trips into WP All Import |
| 30,000 | Booster for WooCommerce | Pluggabl | `woocommerce-jetpack` | Bundle; includes a COGS/profit module among ~100 others |
| 20,000 | **WooCommerce Analytics** (beta, first-party) | WooCommerce | `woocommerce-analytics` | Order attribution depth: Orders by Channel / Source / Device / Campaign. Single-currency only |
| 10,000 | Smart Manager | StoreApps | `smart-manager-for-wp-e-commerce` | Excel-like spreadsheet over products/orders/users; bulk edit rather than reporting, but the free lane into StoreApps' paid Smart Reports |
| 10,000 | ATUM Inventory Management | Stock Management Labs | `atum-stock-manager-for-woocommerce` | Stock central, purchase orders, suppliers, inventory valuation & forecasting |
| 9,000 | **Metorik – Reports & Email Automation** (connector) | Metorik | `metorik-helper` | Connector for the SaaS; advertises **75+ reports**, cohorts, segmentation, cost/profit, Subscriptions reporting, goals, custom metrics, scheduled reports, AI assistant ("Tori"), MCP |
| 9,000 | **Cost of Goods: Product Cost & Profit Calculator** | WPFactory | `cost-of-goods-for-woocommerce` | Per-product / per-variation cost field; profit by product, category, or store over any period; sortable admin columns |
| 6,000 | **Ninjalytics** (ex *Product Sales Report for WooCommerce* + *Export Order Items*) | BerryPress | `product-sales-report-for-woocommerce` | **15+ pre-built report templates** (Top Selling Products, Stock Reports, Sales by Region, Live Carts), field picker, live preview, order-line-item export mode |
| 6,000 | Store Exporter | Josh Kohlbach | `woocommerce-exporter` | Product/order/subscription/customer export |
| 3,000 | WP All Export – Order Export | WP All Import | `order-export-for-woocommerce` | Order-specific drag-and-drop export |
| 2,000 | AWCA | Passionate Brains | `advance-wc-analytics` | GA4 event wiring (not store reporting) |
| 1,000 | **Sales Report for WooCommerce** | BeRocket | `sales-report-for-woocommerce` | **The email-digest category**: scheduled daily/weekly/monthly sales email — total sales, order count, products sold, sales-by-day; per-report recipients, send time, weekday, custom subject |
| 1,000 | Active Woot Products Tables | RealMag777 | `profit-products-tables-for-woocommerce` | Product profit tables |
| 900 | Sales Tax Reports For WooCommerce | mystyleplatform | `sales-tax-reports-for-woocommerce` | US sales-tax-return-shaped tax summaries |
| 900 | BjornTech Accounting Report | bjorntech | `woo-accounting-report` | Accounting-period export for bookkeepers |
| 700 | **REPORTiT – Advanced Reporting** | ithemelandco | `ithemelandco-woo-report` | Sales/order/product/category/customer dashboard with smart filters + export; markets itself explicitly as "beyond default WooCommerce reports" |
| 400 | Ni WooCommerce Sales Report | Anzar Ahmed | `ni-woocommerce-sales-report` | Order-product line-item report, summary report, **order-status report**, category, top product, **payment-gateway revenue**, new vs repeat customers |
| 300 | Cost Of Goods For WooCommerce | WpIron | `cost-of-goods` | COGS fields + profit |
| 200 | **Putler** (connector) | Putler | `woocommerce-putler-connector` | Connector for the SaaS; **MRR/churn/LTV**, **multistore reporting**, forecasting & goals, segmentation & funnels, GA4 blended with store data |
| 70 | WooReports — Advanced Reporting | NikanWP | `wc-reports-lite` | Advanced reporting |
| 40 | Alpha Insights | WP Davies | `alpha-insights-sales-report-builder-analytics-for-woocommerce` | Self-described **sales report builder** + COGS |
| ~0–10 | ~10 further "Profit …" plugins (Profitly, Profit Lens, A1 Profit Reports, Gernx, LXIT, Profit Warden, Profitblue, HugeProfit, Anbarak, InsightPress) | various | — | A conspicuous long tail all solving the same single gap: **profit** |

Two structural observations from the ranking:

1. **The install counts live in export, not reporting.** The two 100,000-install plugins are both *export builders* (`woo-order-export-lite`, `wp-all-export`); the largest pure reporting plugin is a connector to a paid SaaS at 9,000. Merchants who outgrow core Analytics overwhelmingly reach for "get my order data out with the columns I choose", not for another dashboard.
2. **Profit is the most-duplicated gap in the whole directory.** More than a dozen distinct plugins exist to attach a cost field to a product and subtract it. That is the single clearest signal of a missing core capability.

### 2b. The COGS wrinkle — core closed the gap, but not in Analytics

Cost of Goods Sold shipped as an experimental core feature in Dec 2024 and **graduated out of beta in WooCommerce 10.3 (22 Oct 2025)** — per-product and per-variation cost, cost captured onto the order item at sale time, COGS handled for refunds, CSV import/export support, and REST + programmatic APIs ([WooCommerce 10.3 release post](https://developer.woocommerce.com/2025/10/22/woocommerce-10-3-cogs-comes-to-core-and-mcp-beta/), [COGS documentation](https://woocommerce.com/document/woocommerce-cost-of-goods-sold-cogs/), [original announcement](https://developer.woocommerce.com/2024/12/04/cogs-in-core/)).

**But COGS does not integrate with WooCommerce Analytics.** Core now records everything needed for a margin calculation and ships no store-wide profit report. That is precisely why a dozen "Profit …" plugins exist on wordpress.org and why every paid vendor leads with profit. (WCPOS's own users asked for the POS side of this in [discussion #403, "Add Cost of Goods Support"](https://github.com/orgs/wcpos/discussions/403) — enter and display COGS in the products panel, and change it on the fly in the cart.)

### 2c. Commercial and hosted products — verified prices

**All woocommerce.com prices are annual subscriptions in USD** (updates + support, 30-day money-back, 2-year option at 20% off). Metorik and Putler bill monthly only.

#### The two real self-serve SaaS products

**Metorik** ([metorik.com](https://metorik.com/), [pricing](https://metorik.com/pricing)) — SaaS + free `metorik-helper` connector (9,000 installs). Tiers scale on a 3-month trailing average of monthly orders; **every tier has every feature**, unlimited seats; 30-day trial, no card; historical sync capped at 120x the monthly order limit.

| Tier | Orders/mo | $/mo | Emails | Stores |
|---|---|---:|---|---:|
| Starter | 0–100 | **$25** | 10k | 1 |
| Level 2 | 100–500 | **$75** | 25k | 5 |
| Level 3 | 500–2k | **$150** | 40k | 10 |
| Level 4 | 2k–5k | **$250** | 75k | 20 |
| Level 5 | 5k–10k | **$400** | 150k | 25 |
| Level 6 | 10k–25k | **$750** | 250k | 50 |
| Level 7 | 25k–50k | **$1,150** | 500k | 100 |
| Level 8 | 50k–100k | **$1,750** | 800k | 150 |
| Level 9 | 100k–150k | **$2,350** | 1.2M | 200 |
| Level 10 | 150k–200k | **$2,950** | 1.6M | 250 |

*Adds over core:* 75+ reports; COGS plus shipping/transaction/operational costs plus **ad-spend sync** (Meta, Google, TikTok, Pinterest, Snapchat, Reddit, Microsoft, and Sheets/CSV for offline spend) → true net profit and margin per product/order/segment; cohorts; LTV; multi-store roll-up; Subscriptions reporting; cart abandonment + email automation.
*Custom reports — the strongest mechanism in the market:* segment any resource (Orders, Customers, Subscriptions, Products, Coupons, Carts) on any attribute with **AND/OR grouped conditions**; segments are **saved, named, team-shared and URL-addressable**, and apply across every report and cohort; they feed dashboard cards, recurring CSV exports and **scheduled email/Slack digests**. Natural-language segment creation via "Jarvis AI"; an API and an MCP server. **No SQL.** ([grouped segmenting](https://help.metorik.com/article/264-grouped-segmenting-and-or), [reports segmenting](https://help.metorik.com/article/225-reports-segmenting), [costs & profit](https://metorik.com/analytics-reports/costs-profit-reporting))

**Putler** ([putler.com](https://putler.com/), [pricing](https://putler.com/pricing)) — SaaS + `woocommerce-putler-connector` (200 installs). Metered on **monthly revenue**, unlimited orders on every tier, flat feature set; 14-day trial (90 days of data); 50% nonprofit/education discount.

| Revenue/mo | $/mo | | Revenue/mo | $/mo |
|---|---:|---|---|---:|
| ≤$10K | **$20** | | $200–300K | **$350** |
| $10–30K | **$50** | | $300–500K | **$500** |
| $30–50K | **$100** | | $500K–1M | **$750** |
| $50–100K | **$150** | | $1–3M | **$1,500** |
| $100–200K | **$250** | | $3–5M | **$2,250** |

*Adds over core:* ten dashboards — Home, Sales, **Subscriptions (ARR/MRR/churn/LTV)**, Products, **Customers with out-of-the-box RFM (11 segments)**, Transactions, **Time Machine (revenue/customer forecasting)**, Audience (GA roll-up), Insights, Web Analytics — plus **multi-source/multi-store consolidation** (Woo + Shopify + eBay/Etsy + PayPal/Stripe balances, currency-normalised) and in-app refund issuing.
*Custom reports:* point-and-click advanced filters across dozens of fields, faceted drilldowns, **save as segment** and reuse, CSV/Mailchimp export. **No SQL, no report builder.** Scheduled email is a fixed weekly update — recipients and cadence are not user-configurable.

#### Self-hosted plugins

| Product | Vendor | Price | Custom-report mechanism |
|---|---|---|---|
| **Ninjalytics** (successor to *Product Sales Report for WooCommerce*) — [wordpress.org](https://wordpress.org/plugins/product-sales-report-for-woocommerce/) (6,000 installs), [vendor](https://berrypress.com/product/woocommerce/ninjalytics/) | BerryPress (ex WP Zone, orig. Potent Plugins) | Free; **$69/yr 1 site, $119/yr unlimited** | **The best self-hosted builder found**: 15+ templates, drag-drop field builder, renameable fields, **formula-based calculated fields**, live preview, saved presets, filters on product/order/customer meta and user role. Pro adds XLSX/HTML and pie charts. **No scheduled email** |
| **Product Sales Report Pro** (legacy) — [vendor](https://berrypress.com/product/woocommerce/product-sales-report-pro/?fromWPzone) | BerryPress | **$59/yr 1 site, $99/yr unlimited** | Saved presets, drag-drop fields, conditional filters, CSV/XLSX/HTML. Vendor states **"we do not plan to introduce new features for this plugin"** — superseded by Ninjalytics |
| **Sales Report Email** — [woocommerce.com](https://woocommerce.com/products/woocommerce-sales-report-email/) | Kestrel (ex-Zorem) | **$59/yr** — *not free* | None. Fixed digest (revenue, orders, AOV, top sellers); recipients + daily/weekly/monthly only. The free wordpress.org version `woo-advanced-sales-report-email` was **closed 2 May 2023 (author request)** |
| **Email Reports** — [woocommerce.com](https://woocommerce.com/products/sales-report-email-pro/) | Zorem | **$99/yr** | Choose which metrics/breakdowns/comparisons appear; multiple scheduled reports; time-of-day and weekday control; branding. **Email only, no CSV** |
| **Sales Report for WooCommerce** — [wordpress.org](https://wordpress.org/plugins/sales-report-for-woocommerce/) | BeRocket | **Free** (1,000 installs) | The free alternative to the two above: per-report recipients, send time, weekday, subject, custom period |
| **Advanced Order Export For WooCommerce** — [wordpress.org](https://wordpress.org/plugins/woo-order-export-lite/) | algol.plus | Free (**100,000** installs); Pro price **UNCONFIRMED** (vendor page 404'd) | Field picker with renamed labels and reordered columns, custom fields/terms, grouping by product or customer, powerful filters, six output formats. Pro adds **scheduled** exports, export-on-status-change, delivery to email/FTP/API/Google Sheets |
| **WP All Export** — [wordpress.org](https://wordpress.org/plugins/wp-all-export/) | Soflyy | Free (**100,000** installs); Pro ([pricing](https://www.wpallimport.com/pricing/)): Export Standalone **$99/yr**, Import+Export Standalone **$169/yr**, Import+Export Pro **$299/yr**, Professional **$299/yr**, Unlimited/lifetime **$1,299**. WooCommerce order export is an **add-on**, bundled in Professional | **Drag-and-drop** three-step builder; rename/rearrange columns; **custom PHP function per field** for computed columns |
| **WooCommerce Ultimate Reports** — [CodeCanyon](https://codecanyon.net/item/woocommerce-ultimate-reports/19947381) | WooPro | **$49 regular / $99 extended**, one-time | 55+ fixed reports (COGS/profit, tax, crosstab, stock planner/valuation), per-report filters, Excel/CSV/PDF. No builder, no hooks, no scheduled email. **No HPOS support** |
| **REPORTiT – Advanced Reporting** — [wordpress.org](https://wordpress.org/plugins/ithemelandco-woo-report/) (700 installs), [vendor](https://ithemelandco.com/plugins/woocommerce-report/) | iThemeland | Free; Pro **$99/yr (1 site), $159/yr (2)**; lifetime **$289 / $469** | Filters (category/role/status/payment/date), period comparison, CSV/Excel. Scheduled email (daily→yearly) is Pro. No saved templates, no hooks |
| **WPFactory Cost of Goods** — [wordpress.org](https://wordpress.org/plugins/cost-of-goods-for-woocommerce/) | WPFactory | Free (9,000 installs); **$49/yr** on woocommerce.com | Settings-driven; profit by product, category or store over any period |
| **ATUM Inventory Management** — [wordpress.org](https://wordpress.org/plugins/atum-stock-manager-for-woocommerce/) | Stock Management Labs | Free (10,000 installs); add-ons **UNCONFIRMED** | Stock Central grid with configurable columns; inventory valuation, forecasting, purchase orders, suppliers |
| **Advanced Reporting for WooCommerce** — [wordpress.org](https://wordpress.org/plugins/advanced-reporting-for-woocommerce/) | Phoeniixx | Free + upsell **UNCONFIRMED** | Fixed panels. **Last updated Dec 2020, 3.1★ — stale** |
| "Advanced WooCommerce Reporting" (CodeCanyon #12042129) | "proword" | **UNCONFIRMED — item page returns HTTP 410 Gone, apparently delisted** | — |
| "WooForce reporting plugin" | — | **Does not exist** — WooForce/WooServe's catalogue is shipping plugins | — |

#### woocommerce.com marketplace — the Reporting & analytics category

Live category: [woocommerce.com/product-category/reporting-and-analytics/](https://woocommerce.com/product-category/reporting-and-analytics/). (The older `/woocommerce-extensions/reporting/` path 404s; "reporting" is no longer an API category slug.)

| Extension | Vendor | $/yr | What it adds |
|---|---|---:|---|
| [WooCommerce Analytics](https://woocommerce.com/products/woocommerce-analytics/) | Woo | **0** | The core baseline (order attribution beta) |
| [Cost of Goods](https://woocommerce.com/products/woocommerce-cost-of-goods/) | SkyVerge | **79** | Profit by date/product/category, most/least profitable sellers, **inventory valuation**. 7k installs, 3.7★; hooks the *legacy* Reports screen, not Analytics |
| [Cost of Goods Sold](https://woocommerce.com/products/cost-of-goods-sold-for-woocommerce/) | WPFactory | **49** | COGS + profit |
| [Profitrics – Profit, COGS & Expense Tracker](https://woocommerce.com/products/profitrics/) | — | **49** | Profit + expenses |
| [QuarkCode Neural Commerce](https://woocommerce.com/products/quarkcode-neuralcommerce/) | QuarkCode | **89** | Advanced COGS & order profits |
| [Cost & Reports](https://woocommerce.com/products/cost-reports-woocommerce/) | — | **89** | COGS + reports |
| [Customer Analytics](https://woocommerce.com/products/customer-analytics/) | Coddium | **79** | Ten reports: **RFM segments, LTV, cohort retention heatmap, repeat-purchase rate, order sequence, churn rate, acquisition-source LTV, per-country LTV**. Pitch: core reports "are organized around products and orders — these are organized around **people**" |
| [Analytics for WooCommerce Subscriptions](https://woocommerce.com/products/analytics-for-woocommerce-subscriptions/) | Zorem | **79** | MRR/ARR, churn rate, **0–100 churn-risk score + MRR at risk**, CLV, renewal forecast (7–365 d), cancellation themes |
| [Email Reports](https://woocommerce.com/products/sales-report-email-pro/) | Zorem | **99** | Configurable scheduled digests |
| [Sales Report Email](https://woocommerce.com/products/woocommerce-sales-report-email/) | Kestrel | **59** | Fixed scheduled digest |
| [Infinite Reports](https://woocommerce.com/products/infinite-reports/) | AFPAIR | **59** | **Custom report builder**: column selection including discovered custom meta and taxonomies, AND/OR filter engine, save → schedule, recurring email/webhook digests, UTM/landing-path attribution fields |
| [Cart Reports](https://woocommerce.com/products/woocommerce-cart-reports/) | WP BackOffice | **89** | Open/abandoned/converted carts. 2.7★ |
| [Role Based Analytics](https://woocommerce.com/products/role-based-analytics-woocommerce/) | CoderPlus | **49** | Segments Analytics by **customer** user role — explicitly *not* staff/cashier attribution |
| [Sales Report By Country](https://woocommerce.com/products/sales-report-by-country/) | — | **59** | Geographic split |
| [Authorize.Net Reporting](https://woocommerce.com/products/woocommerce-authorize-net-reporting/) | — | **49** | Gateway-side reporting |
| [Google Analytics Pro](https://woocommerce.com/products/woocommerce-google-analytics-pro/) | — | **79** | GA depth |
| [PayHelm](https://woocommerce.com/products/woocommerce-reporting-export-tax-payhelm/) · [BeProfit](https://woocommerce.com/products/beprofit-analytics-reports/) · [Google Analytics for Woo](https://woocommerce.com/products/woocommerce-google-analytics/) · [Lebesgue: Marketing & LTV](https://woocommerce.com/products/lebesgue-ai-cmo/) | various | **0** | Free connectors to paid SaaS |

#### Dead, acquired and absent

| Product | Status |
|---|---|
| **StoreApps "Smart Reports"** | **Does not exist under that name.** The product was **Smart Reporter** ([wordpress.org](https://wordpress.org/plugins/smart-reporter-for-wp-e-commerce/)) — v2.10.0, **last updated July 2019, abandoned**. `storeapps.org/product/smart-reports-for-woocommerce/` 404s and no reporting product appears in their current 29-product shop. StoreApps now **upsells Putler** as its reporting answer ([storeapps.org](https://www.storeapps.org/woocommerce-reports-analytics/)). Historical Pro pricing **UNCONFIRMED** |
| **Beeketing** | **Shut down.** Shopify made the apps uninstallable **13 Aug 2019** and killed them **27 Aug 2019** (~70,000 shops), citing "inadequate support for merchants and abuse of our marketing tools" ([Shopify announcement](https://community.shopify.com/c/announcements/beeketing-and-related-apps-no-longer-on-shopify-details-and/m-p/553686)). The [Woo plugin](https://wordpress.org/plugins/beeketing-for-woocommerce/) last updated Dec 2019, flagged as possibly unmaintained. **It was CRO/marketing automation — social proof, upsells, cart timers — never analytics**; no profit, LTV, cohort or RFM claims |
| **Growmatik** | **No longer exists as a brand.** Convesio acquired it from Artbees on **9 May 2024** and relaunched it as **ConvesioConvert**; `growmatik.ai/pricing` 301-redirects to [convesio.com/convert/pricing/](https://convesio.com/convert/pricing/). Monthly, metered on "marketing audience": **Starter $49 / Growth $199 / Pro $399 / Elite $999+** (2.5k / 10k / 25k / 100k). Markets **RFM segmentation** and "Smart Insights"; **no LTV, cohort or funnel reports and no report builder** — its visual builder is automation logic |
| **Conjura** | Connectors are **Shopify + BigCommerce only**; its "WooCommerce analytics" page is SEO content, not a connector. Published $19.99/$59.99/$129.99 per mo but every CTA routes to a demo. **Acquired by Wayflyer, June 2026** |
| **Glew.io** | Woo support explicit; **no price published** — Pro requires annual prepay, Plus is custom. Third-party $79–$649 figures **UNCONFIRMED** |
| **Triple Whale** | Woo listed, but multiple sources say the Woo experience materially lags Shopify's. GMV slider, no flat figure published; third-party $149–$449/mo **UNCONFIRMED** |
| **Daasity** | Woo **not listed** among integrations (Shopify, BigCommerce, Magento, Amazon, Walmart). Contact sales only |
| **Polar Analytics, Lifetimely** | **Shopify-only** |

**Pattern worth naming:** there is essentially **no self-serve, published, checkout-ready BI pricing for a WooCommerce store**. Everything above the plugin tier is demo-gated. The genuine self-serve WooCommerce analytics market is two products: Metorik and Putler.

#### What the vendors themselves shout about

Putler maintains a page explicitly enumerating core's limitations — the single best primary source for vendor gap claims ([putler.com/woocommerce-report-limitations](https://www.putler.com/woocommerce-report-limitations)):

> "There is no native profit report. No margin breakdown by product."
> "There is no customer lifetime value calculation…"
> "It uses last-touch attribution only" … "does not connect ad spend to revenue in any way."
> "There is no revenue forecasting, no stock demand prediction…"
> "WooCommerce exports are CSV only. No Excel, no PDF."
> "There are no MRR, ARR, or churn metrics in the core platform."

Ranked by how often and how prominently the claim recurs across vendors:

| Rank | Gap advertised | Who sells against it |
|---:|---|---|
| 1 | **Profit / COGS / margin** | Six separate marketplace extensions, a dozen wordpress.org plugins, Metorik, Putler, Glew |
| 2 | **Customer-side metrics — LTV, cohort/retention, RFM, churn, repeat purchase** | Coddium Customer Analytics, Metorik cohorts, Putler RFM, ConvesioConvert, Glew |
| 3 | **Ad spend / blended ROAS / CAC** — marketing cost joined to revenue | Metorik (8 native ad integrations), Putler, Triple Whale, Conjura |
| 4 | **Scheduled email digests** | A whole sub-category: Zorem $99, Kestrel $59, BeRocket free, Infinite Reports, REPORTiT, Metorik (email + Slack) |
| 5 | **Subscription MRR / ARR / churn** | Zorem's Subscriptions analytics ("The Subscription Metrics You've Been Missing"), Putler, Metorik |
| 6 | **Multi-store / multi-channel roll-up** | Putler's central pitch (core "primarily gives you data for a single store on a single dashboard"), Metorik |
| 7 | **Custom fields / arbitrary column exports** | Infinite Reports ("Stop wrestling spreadsheets or piecing together partial exports"), Ninjalytics, Product Sales Report Pro |
| 8 | **Forecasting** — revenue and inventory demand | Putler Time Machine, Zorem renewal forecast, SkyVerge inventory valuation. Thinly served |
| 9 | **Data accuracy / reconciliation** — "Transaction status changes on PayPal, Stripe etc. do not always get synchronized with WooCommerce" | Putler alone |
| 10 | **Speed at scale** — reports that don't load WordPress | Metorik ("milliseconds rather than minutes") |

#### Two findings that matter directly to a POS

1. **Sales by cashier / staff does not exist as a commercial WooCommerce report.** The woocommerce.com marketplace API was searched for `cashier`, `staff`, `employee`, `sales by user` and `commission`: nothing returns a staff-attribution report. The extension named "Cashier" ($149) is a *checkout* plugin. Role Based Analytics ($49) segments by **customer** role and explicitly does not attribute a sale to the employee who processed it. The nearest neighbours are affiliate/sales-agent commission plugins, solving a different problem. **Uncontested gap.**
2. **Tax summaries are not served by the reporting category either** — tax is handled by compliance SaaS connectors (TaxJar, Avalara, Quaderno, all $0 connectors), not reporting extensions.

### 2d. **The decision-relevant list: reports merchants pay for because core lacks them**

Ranked roughly by how many independent vendors sell it (a proxy for demand), with the reason core cannot or does not provide it.

| # | Report merchants pay for | Why core doesn't have it | Who sells it |
|---:|---|---|---|
| 1 | **Profit / margin / COGS report** — gross profit by product, category, order and period | Core stores COGS since WC 10.3 but **has no Analytics integration for it** — no store-wide profit dashboard | WPFactory Cost of Goods (9k), Booster, Metorik, Putler, StoreApps, Alpha Insights, ~10 more "Profit …" plugins |
| 2 | **Scheduled report email / digest** — daily, weekly, monthly sales summary delivered to an inbox on a cadence | Core Analytics has **no scheduling of any kind**; its only push is the emailed link for an oversized CSV | Sales Report for WooCommerce (1k), Advanced Order Export Pro, Metorik, Putler |
| 3 | **Free-form column-picker export** — pick entity, tick fields, rename/reorder columns, filter, export to CSV/XLS/XML/JSON/PDF, optionally on a schedule or to FTP/API/Sheets | Core CSV is fixed-column, one report at a time, UI-only | Advanced Order Export (100k), WP All Export (100k), Ninjalytics (6k), Store Exporter (6k) — **the largest install base in the category** |
| 4 | **Customer LTV, cohort and retention reports** — lifetime value, repeat-purchase rate, cohort retention curves, RFM | Core Customers report shows total spend and AOV but no cohorting, no retention curve, no LTV projection | Metorik, Putler, Growmatik, Conjura/Glew-class BI |
| 5 | **Saved segments over orders/customers/products** — multi-condition, named, reusable across reports, exports and automations | Core has per-report Advanced Filters that are URL state, not saved, named, reusable objects | Metorik, Putler |
| 6 | **Order line-item / "product sales" report** — one row per line item with order, billing, shipping and status context | Core Products report aggregates; there is no line-item grain view for fulfilment or accounting | Ninjalytics (6k), Ni WooCommerce Sales Report, Advanced Order Export |
| 7 | **Subscription / MRR reporting** — MRR, churn, renewals, subscriber cohorts | Core Analytics has no subscription concept | Metorik, Putler |
| 8 | **Multi-store roll-up** — several stores in one dashboard | Core is single-site | Metorik, Putler |
| 9 | **Refund report dated to the refund, not the order** | Core Analytics nets refunds into the order's period; there is no standalone refunds report | StoreApps, Metorik; the exact defect [roadmap#77](https://github.com/wcpos/roadmap/issues/77) documents in WCPOS itself |
| 10 | **Sales-tax-return-shaped tax summary** (jurisdiction rollup for filing) | Core Taxes report is by code/rate only, no jurisdiction rollup | Sales Tax Reports For WooCommerce, BjornTech Accounting Report |
| 11 | **Inventory valuation & forecasting** — stock value at cost, reorder points, days-of-cover, purchase orders | Core Stock report is a quantity list only — no value, no forecast | ATUM (10k), StoreApps, Metorik |
| 12 | **Payment-gateway / payment-method revenue split** | Not a dimension anywhere in core Analytics | Ni WooCommerce Sales Report, Metorik |
| 13 | **Order-status report** (revenue and counts by status) | Core excludes statuses rather than reporting on them | Ni WooCommerce Sales Report, REPORTiT |
| 14 | **Blended store + traffic analytics** (GA4 sessions joined to store revenue, funnels, attribution) | Core order attribution is order-side only, last-touch only | Putler, ConvesioConvert, the GA-bridging plugins |
| 15 | **Ad spend / blended ROAS / CAC** — marketing cost joined to order margin | Core has no cost-side data at all | Metorik (8 native ad-platform integrations), Putler, Triple Whale |
| 16 | **RFM segmentation** (recency/frequency/monetary buckets) | Not a concept in core | Putler (11 built-in segments), Coddium Customer Analytics, ConvesioConvert |
| 17 | **Revenue and inventory-demand forecasting** | Core reports history only | Putler Time Machine, Zorem renewal forecast, SkyVerge inventory valuation — thinly served |

**The absence that matters most for a POS.** Nothing in this list, and nothing in the entire wordpress.org reporting category or the woocommerce.com marketplace, is a **register report**: no X-report, no Z-report, no cash-drawer reconciliation with counted-vs-expected variance, no tender/payment-mix split against a drawer, no per-cashier shift report, no gap-free closure numbering, no fiscal audit export. This was tested directly, not assumed: the woocommerce.com marketplace API returns **no staff-attribution report** for `cashier`, `staff`, `employee`, `sales by user` or `commission` — the one extension called "Cashier" ($149) is a checkout plugin, and Role Based Analytics ($49) segments by *customer* role and explicitly does not attribute a sale to the employee who took it.

The ecosystem is built entirely around the *web store's* order table, because that is the only data a web store has. **Sales by cashier, and the whole drawer/closure layer beneath it, is uncontested ground for WooCommerce POS** — and it is exactly what its users have asked for (§4).

---

## 3. Custom report building in the WordPress/WooCommerce world

### 3a. What the plugins actually give users

There is no SQL-exposing, general-purpose report designer with meaningful adoption in this ecosystem. The mechanisms cluster into five shapes:

| Mechanism | Who does it | Detail |
|---|---|---|
| **Column/field picker + filters over one entity** (by far the dominant shape) | Advanced Order Export (100k), WP All Export (100k), Ninjalytics (6k), Store Exporter (6k) | Choose entity (orders / order line items / products / customers), tick the fields, rename and reorder the columns, filter by date range + status + custom field, preview, download. WP All Export is drag-and-drop and lets a user attach a **custom PHP function per field** for computed columns |
| **Pre-built templates as the starting point** | Ninjalytics ("15+ pre-built report templates" — Top Selling Products, Stock Reports, Sales by Region, Live Carts) | The user picks a template, then edits the field set and filters. Template-then-customise, not build-from-blank |
| **Saved segments / filter sets over a shared data model** | Metorik, Putler | The closest thing to a real query builder. Metorik: multi-condition segmentation over orders, customers, products and subscriptions, segments are saved, named and reusable across reports, exports and email automations; plus user-defined **Custom Metrics**; plus an API and MCP server for arbitrary questions. Putler: segmentation + funnels + goals over a unified multi-store model |
| **Scheduled delivery as the "report"** | Sales Report for WooCommerce (1k), Advanced Order Export Pro, Metorik, Putler | The output format *is* the product: a recurring email or file drop, with per-report recipients, cadence, weekday and subject. Core Analytics has no scheduling of any kind |
| **PHP hooks / developer extension** | WooCommerce core itself (see 3b); legacy `woocommerce_admin_reports` filter for the deprecated Reports screen | Code, not UI |

Ranked by power, the whole market clusters into exactly four shapes:

1. **Saved segments applied across every report** — Metorik alone. AND/OR condition groups over any resource, named, team-shared, URL-addressable, feeding dashboards, exports and digests. The genuine differentiator in the category.
2. **Filter + drilldown + save** — Putler, Coddium.
3. **Field-picker builders** — Infinite Reports ($59/yr, with an AND/OR filter engine, discovered custom meta, and save-then-schedule), Ninjalytics (**the only one with formula-based calculated fields**), Product Sales Report Pro, the export plugins.
4. **Fixed reports with filters** — everything else.

Two gaps this leaves, both relevant to a POS:

- **Nobody in the commercial market offers SQL, PHP hooks, or template overrides as a documented extension point.** Every "custom report" claim means a saved filter-and-column configuration, not a query language. The only genuine hook-based path in the whole WooCommerce world is core's own (§3b) — and WP All Export's per-field PHP callback.
- **No popular plugin lets a non-developer compose a new report from scratch across entities.** You pick columns on one entity, or you move the problem to a hosted product with a segment builder. A merchant-editable **report template** is therefore *not* a solved, commoditised expectation in this market — it is closer to an opening.

### 3b. WooCommerce core's official extension API for Analytics

Core does have a real, documented registration path — it is genuinely an extension API, not just filters. Two official docs exist, and they are the only two in the Analytics section of the developer handbook ([Analytics index](https://developer.woocommerce.com/docs/features/analytics/)).

**Scaffold.** There is a first-party generator variant for exactly this:

```
npx @wordpress/create-block -t @woocommerce/create-woo-extension --variant=add-report my-report
```

Verified in the WooCommerce monorepo at `packages/js/create-woo-extension/variants/add-report/` — its README states it "Adds a custom report page to WooCommerce Analytics", "Demonstrates how to use the `woocommerce_admin_reports_list` filter", and "Shows example usage of `ReportFilters` and `TableCard` components". (A sibling `--variant=sql-modification` scaffold backs the extend-an-existing-report doc.)

**Registering a whole new report page — two halves:**

| Side | Hook | Role |
|---|---|---|
| PHP | `woocommerce_analytics_report_menu_items` | Applied in `plugins/woocommerce/src/Internal/Admin/Analytics.php` (since WC 6.4) over the array returned by `Analytics::get_report_pages()`. Push an entry with `id`, `title`, `parent` (`woocommerce-analytics`), `path` (e.g. `/analytics/my-report`) and optional `nav_args`. Also used to *remove* core reports |
| JS | `woocommerce_admin_reports_list` | `const REPORTS_FILTER = 'woocommerce_admin_reports_list'` in `client/admin/client/analytics/report/use-reports.js`; documented in `client/admin/client/analytics/report/README.md` and `client/admin/docs/page-controller.md`. `addFilter` onto it and push `{ report, title, component }` to mount a React component at that path |

The report component is built from **`@woocommerce/components`** (`ReportFilters`, `SummaryList`, `Chart`, `TableCard`) reading through **`@woocommerce/data`** stores, which call the **`wc-analytics` REST namespace** (e.g. `/wp-json/wc-analytics/reports/orders/stats`).

**Extending an existing report** ([Extend analytics reports](https://developer.woocommerce.com/docs/features/analytics/extending-woocommerce-admin-reports/)):

| Layer | Hooks (verbatim) |
|---|---|
| JS — add a filter dropdown | `woocommerce_admin_orders_report_filters` |
| JS — modify the rendered table | `woocommerce_admin_report_table` (receives `{ headers, rows, items }`) |
| JS — currency/number formatting | `woocommerce_admin_report_currency` |
| PHP — accept new query args (also keys the cache) | `woocommerce_analytics_orders_query_args`, `woocommerce_analytics_orders_stats_query_args` |
| PHP — modify SQL, JOIN | `woocommerce_analytics_clauses_join_orders_subquery`, `…_join_orders_stats_total`, `…_join_orders_stats_interval` |
| PHP — modify SQL, WHERE | `woocommerce_analytics_clauses_where_orders_subquery`, `…_where_orders_stats_total`, `…_where_orders_stats_interval` |
| PHP — modify SQL, SELECT | `woocommerce_analytics_clauses_select_orders_subquery`, `…_select_orders_stats_total`, `…_select_orders_stats_interval` |

**Adding a column that also reaches the CSV** ([Add columns to analytics reports and CSV downloads](https://developer.woocommerce.com/docs/features/analytics/adding-columns-to-analytics-reports-and-csv-downloads/)) needs both paths, because core picks the CSV generator by result size (in-browser for one page, server-side + emailed link for more):

- PHP: `woocommerce_admin_report_columns` (adds the SQL `SELECT` fragment), `woocommerce_filter_downloads_export_columns` (CSV header), `woocommerce_report_downloads_prepare_export_item` (row mapping)
- JS: `woocommerce_admin_report_table` (the in-browser download and the table UI)

**Legacy screen:** the deprecated WooCommerce → Reports tabs are extended through the single `woocommerce_admin_reports` filter over a `$reports` array keyed `orders` / `customers` / `stock` / `taxes`.

**Implication for a POS.** A POS could surface its register reports inside wp-admin Analytics via `woocommerce_analytics_report_menu_items` + `woocommerce_admin_reports_list` rather than inventing a parallel admin surface — the path is first-party, scaffolded and stable since WC 6.4. It is, however, a React-in-wp-admin path: it does not help the POS client app itself.

---

## 4. What WooCommerce POS users themselves ask for

### 4a. The headline

[**wcpos/woocommerce-pos discussion #350 — "End-of-day reconciliation"** (22 Mar 2023, ↑5, 2 comments)](https://github.com/orgs/wcpos/discussions/350) is the **most-upvoted discussion in the entire repository** (the next highest are ↑4). The original ask, verbatim in substance:

> "There should be a way for cashier to enter the cash float at the start of a shift and then close at the end of day. Cashiers should also be able to print off an end-of-day report with all sales (sometimes called a z-report)."

Two follow-ups sharpen it into a specification:

| Commenter | Ask |
|---|---|
| @jnavarroc | A **daily ticket report**: system opens a new record each day, registers all tickets, cashier can print a provisional Z listing every ticket (**ticket number, date/time, ticket value, amount paid, status**), the day auto-closes at midnight, and **each day's report stays retrievable afterwards** — i.e. closures as *stored, numbered documents*, not a recomputed view. Proposed UI: a list of days (date + total), newest first, empty days hidden |
| @jvieille | "Any progress on this? **It is a mandatory requirement in France at least.**" — attached a real end-of-day report PDF as a model |

That is the whole shape of the ask: float in → sales → Z out → printed → kept.

### 4b. Adjacent user asks that feed the same surface

| Ref | Ask | Relevance |
|---|---|---|
| [discussion #348](https://github.com/orgs/wcpos/discussions/348) — Receipt template creator (↑2) | Multiple **user-editable** templates, A4 *and* thermal widths, choose at the point of sale. @MaryOJob: "very important feature for accounting purposes"; @kilbot adds country compliance (Spain QR on invoices from 2026) | The template-editing mechanism a Z-report also needs |
| [discussion #403](https://github.com/orgs/wcpos/discussions/403) — Add Cost of Goods Support (↑1) | Enter/display COGS in the products panel and change it on the fly in the cart, following core's COGS feature | The one ecosystem-wide report gap (§2b) reaching the POS |
| [discussion #360](https://github.com/orgs/wcpos/discussions/360) — POS Log (↑2) | "a log of important events in the POS so cashiers can retrace any errors or problems" | Audit trail, sibling of the fiscal event log |
| [wiki#652](https://github.com/wcpos/wiki/issues/652) | "How to switch between staff/cashier users in the POS" — a recurring support question | Per-cashier attribution is a live user need, not a hypothesis |
| [wiki#733](https://github.com/wcpos/wiki/issues/733) | Partial return/refund does not prompt to print a receipt showing change | Refunds and their documents |
| [wiki#1083](https://github.com/wcpos/wiki/issues/1083) | Tax breakdown as a separate line at POS with tax-inclusive pricing | Tax-by-rate presentation |

Searches run: `gh search issues --owner wcpos` for *report*, *z-report*, *analytics*, *export*, *sales report*, *end of day*, *shift*; `gh api repos/wcpos/woocommerce-pos/discussions`; `gh search issues --repo wcpos/wiki` for *report*, *export*, *cashier*, *till*, *cash*. **No user-authored issue in `wcpos/monorepo` or `wcpos/woocommerce-pos` asks for a product, category, revenue or coupon report** — every user report request in the org is about the register document set.

### 4c. How the org has already internalised it

The internal tracking issues are worth listing because they show the ask converging on stored documents rather than dashboards:

| Issue | Title |
|---|---|
| [roadmap#9](https://github.com/wcpos/roadmap/issues/9) | Reporting templates — "Configurable reporting templates for end-of-day (Z-report) and shift summaries. Users need different report formats depending on their business type." Explicitly links discussion #350. Names report data aggregation endpoints (**sales by payment method, tax totals**), template storage, a report viewer/printer UI, and **A4 + thermal** print support |
| [roadmap#77](https://github.com/wcpos/roadmap/issues/77) | Reports overhaul: full report-template suite (fiscal/Z-reports, product & stock reports) + dedicated refunds collection. Contains the report catalogue research below, and documents the **refund-date defect**: the current screen sums `order.refunds[].total` against the *order's* creation date, so a refund taken today against last week's order neither appears today nor is correctly attributed — fixed by syncing refunds as their own collection keyed on the refund's own `date_created_gmt` |
| [roadmap#199](https://github.com/wcpos/roadmap/issues/199) | Saved end-of-day reports: closures as stored, numbered documents — @jnavarroc's ask, promoted |
| [roadmap#197](https://github.com/wcpos/roadmap/issues/197) | Every till has a name: a register identity stamped on orders, receipts and reports |
| [roadmap#6](https://github.com/wcpos/roadmap/issues/6) / [#7](https://github.com/wcpos/roadmap/issues/7) | Cash float management / Shift start–stop (both opened 2026-02-05) |
| [roadmap#250](https://github.com/wcpos/roadmap/issues/250) / [#251](https://github.com/wcpos/roadmap/issues/251) / [#271](https://github.com/wcpos/roadmap/issues/271) | The closure template type (Free virtual default, X-report heading, copy marking; Pro editable); the close flow writing the closure with its number and printing the Z once; the Closures view on Reports with reprint and export |
| [woocommerce-pos#713](https://github.com/wcpos/woocommerce-pos/issues/713), [#717](https://github.com/wcpos/woocommerce-pos/issues/717)–[#723](https://github.com/wcpos/woocommerce-pos/issues/723) | Fiscal compliance framework (NF525 France, VeriFactu Spain), gap-free sequence numbers, audit event logger, audit file exporter (XML/CSV/JSON), Z-report and fiscal closure engine, real-time and batch reporting engine |

roadmap#77's own research table — the register report catalogue the competitive set (Square, Shopify POS, Lightspeed, Clover, Toast, Loyverse) all ship:

| Report | Core contents it must carry |
|---|---|
| X-report | Totals **without resetting**; sales so far, payment-method split, refunds, voids, current drawer expectation |
| Z-report | **Resets/closes the period**; gross, net, **tax by rate**, discounts, refunds, voids, **tender breakdown**, transaction count, opening/closing float, grand total, register/operator, datetime |
| End-of-day / Daily Sales Summary | Gross/net, tax, discounts, refunds, AOV, items sold, top items, payment mix |
| Weekly / Monthly / Yearly | Period totals + per-interval breakdown, YoY comparison, tax summary |
| Cash-up / drawer reconciliation | Opening float, cash sales, paid in/out, expected vs counted, **variance** |
| Shift report (per cashier / register) | Per-cashier sales, refunds, discounts, AOV, tips, drawer activity |

roadmap#77's stated universal must-have: **tax broken down by rate** (standard / reduced / zero-rated / exempt), each showing taxable base + tax amount reconciling to gross — "what makes a VAT/sales-tax return fillable and survives audit."

---

## Appendix — verification notes

| Claim | How verified |
|---|---|
| The Analytics report set | Directory listing of `plugins/woocommerce/src/Admin/API/Reports/` in the WooCommerce repo: `Categories, Coupons, Customers, Downloads, Export, Import, Orders, PerformanceIndicators, Products, Revenue, Stock, Taxes, Variations`; client side `client/admin/client/analytics/report/` has `categories, coupons, customers, downloads, orders, products, revenue, stock, taxes, variations` |
| `woocommerce_analytics_report_menu_items` | `apply_filters()` call read in `plugins/woocommerce/src/Internal/Admin/Analytics.php` (since WC 6.4) |
| `woocommerce_admin_reports_list` | `const REPORTS_FILTER` in `client/admin/client/analytics/report/use-reports.js`; documented in that folder's `README.md` and in `client/admin/docs/page-controller.md` |
| `--variant=add-report` scaffold | `packages/js/create-woo-extension/variants/add-report/` exists, with `includes/Admin/Setup.php.mustache` hooking `woocommerce_analytics_report_menu_items` and `src/index.js.mustache` hooking `woocommerce_admin_reports_list` |
| `woocommerce_admin_reports` (legacy) | `apply_filters()` in both `includes/admin/class-wc-admin-reports.php` and `src/Admin/API/Reports/Controller.php` |
| Install counts | Live wordpress.org plugins API (`action=plugin_information`), read 2026-09-12. wordpress.org reports installs in coarse buckets (1k / 6k / 9k / 10k / 20k / 100k), so treat them as orders of magnitude |
| wcpos discussions | `wcpos/woocommerce-pos` has discussions enabled with **39** threads; they are served at `github.com/orgs/wcpos/discussions/<n>`, so the org discussions and the repo discussions are the same set — there is no second, separate org-level forum |

### Unconfirmed / caveats

- **UNCONFIRMED:** whether WooCommerce plans to wire COGS into Analytics. The 10.3 announcement does not commit to it.
- **Beeketing's shutdown is now confirmed** (Shopify announcement: uninstallable 13 Aug 2019, killed 27 Aug 2019). Note the survey found it was **CRO/marketing automation, never analytics** — it does not actually belong in a reporting comparison except as a historical marker.
- **Growmatik no longer exists as a brand** — acquired by Convesio from Artbees on 9 May 2024 and relaunched as ConvesioConvert; the old pricing URL 301-redirects.
- **StoreApps has no current reporting product.** "Smart Reports for WooCommerce" 404s; the real product was *Smart Reporter*, abandoned since July 2019. StoreApps now upsells Putler. Its historical Pro pricing is **UNCONFIRMED** (archive.org was not reachable from the research tooling).
- Several Pro prices remain **UNCONFIRMED**: Advanced Order Export Pro (vendor page 404'd), ATUM add-ons, Phoeniixx Advanced Reporting, and the demo-gated BI tier (Glew, Triple Whale, Daasity).
- Install counts are wordpress.org's rounded buckets, not exact figures.
- Legacy WooCommerce → Reports has been deprecated since WC 4.0 (March 2020) and receives no updates; treat it as a compatibility surface, not a baseline to match.
