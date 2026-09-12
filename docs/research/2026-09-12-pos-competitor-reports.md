---
title: POS competitor reporting — what reports exist, and which plan tier gates each
date: 2026-09-12
---

**Bottom line.** Across fifteen POS products checked against vendor documentation only, the reporting catalogue converges on a small, stable core — a sales summary and a payment-method breakdown appear in all fifteen, and sales-by-item, sales-by-employee and a register/cash-drawer document appear in thirteen or fourteen. The real dividing line between a complete product and a thin one is not analytics depth but **whether a register-closure document exists at all**: Zettle's standard app and FooSales have none, and among WooCommerce-native rivals so do wePOS and Jovvie, while Loyverse and Odoo give a full expected-vs-counted close away **free**. Plan-tier gating of analytics is collapsing at the top of the market — Shopify's own pages now say every plan gets every report including a custom report builder, and Square ships two custom-report builders at $0 — so gating reports by tier is a weakening position; what vendors still charge for is inventory economics (Square Plus), cross-location and benchmarking (Toast's Restaurant Management Suite), forecasting (Lightspeed Insights/Plus), the **API** (Toast, Lightspeed X, Odoo, Erply), and — at SumUp and Oliver — the register close itself. Terminology is genuinely split: seven of fifteen use "Z-report" and only four use "X-report", the large Anglophone incumbents use neither, and Toast ships the word without the semantics ("Printing the Z Report does not turn the day over"). Offline reporting is all but nonexistent: **Loyverse alone** keeps shift management and its on-device X/Z report working through an outage, while Lightspeed X-Series cannot even close a register offline.

**Method and confidence.** Every claim is sourced to a vendor-owned page — help centre, official docs, or pricing page — cited inline. Anything that could not be verified against such a page is marked **UNCONFIRMED** rather than inferred. Three vendors have documentation that actively resists verification, and this is flagged in place: **Epos Now** publishes no pricing at all and serves a JS-only support site; **Oliver POS**'s help centre fails TLS entirely; **Lightspeed**'s help centres sit behind Cloudflare (worked around via the Zendesk API on the same hosts). Where a vendor contradicts itself — Square on vendor-sales tiering, Lightspeed on Core's access to two reports, Shopify on whether plans gate reports — both statements are shown rather than resolved.

---

# Part I — Vendor by vendor

## 1. Square

**Packaging changed on 6 October 2025.** Square collapsed 18 à-la-carte subscriptions into three tiers — **Square Free $0**, **Square Plus $49/mo per location**, **Square Premium $149/mo per location** ([press release](https://squareup.com/us/en/press/unified-pricing-and-packaging)). Vertical depth is now bought as *capability packs* — `advanced inventory`, `advanced restaurants`, `advanced bookings` — added to Plus/Premium. `Square for Retail Plus/Premium` and `Square for Restaurants Plus/Premium` are legacy: still honoured for existing subscribers, no longer sold, and the switch is one-way ([help 8569](https://squareup.com/help/us/en/article/8569-switch-to-the-new-square-subscription-plans)).

> **Caveat that affects every row below.** Square's help centre has not caught up with its own pricing pages. Most gated articles carry a dual audience line naming both the legacy plan *and* the new one, and in at least two cases the two disagree (see the Contradictions table). Where they conflict, the pricing-page comparison grid is treated as authoritative.

### 1.1 Sales and payments

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Sales summary | Completed (closed) orders only; gross/net sales, tips, top items | Free | Analytics | [5381](https://squareup.com/help/us/en/article/5381-in-app-summaries-and-reports) |
| Sales trends | Daily/weekly/yearly gross and net sales, average sale, order count | Free | Analytics | [5381](https://squareup.com/help/us/en/article/5381-in-app-summaries-and-reports) |
| Payment methods | Card brand, debit vs credit, domestic vs international | Free | Analytics | [5381](https://squareup.com/help/us/en/article/5381-in-app-summaries-and-reports) |
| Item sales | Item, quantity, gross and net sales; includes archived items | Free | Analytics | [8363](https://squareup.com/help/us/en/article/8363-view-item-category-and-modifiers-sales-reports) |
| Category sales | Top-grossing categories and item counts within each | Free | Analytics | [8363](https://squareup.com/help/us/en/article/8363-view-item-category-and-modifiers-sales-reports) |
| Modifier sales | Top used modifiers for a period | Free | Analytics | [8363](https://squareup.com/help/us/en/article/8363-view-item-category-and-modifiers-sales-reports) |
| Category rollups | Groups several categories into one reporting bucket | Plus/Premium + advanced restaurants | Analytics | [8449](https://squareup.com/help/us/en/article/8449-view-category-rollups-in-a-category-sales-report) |
| Team Sales | Sales per team member, incl. tips and commissions | Plus | Analytics | [pricing](https://squareup.com/us/en/pricing) |
| Discounts | Top used discounts and total discount amounts | Free | Analytics | [8359](https://squareup.com/help/us/en/article/8359-view-discounts-comp-and-void-reports) |
| Comps | Items/charges removed from bills | Free | Analytics | [8359](https://squareup.com/help/us/en/article/8359-view-discounts-comp-and-void-reports) |
| Voids | Voided items/charges | Free | Analytics | [8359](https://squareup.com/help/us/en/article/8359-view-discounts-comp-and-void-reports) |
| Gift cards | Activity summary, multi-location, load fees and details | Free | Analytics | [5496](https://squareup.com/help/us/en/article/5496-reporting-and-analytics-for-your-gift-cards) |
| Gift card overview | Outstanding balance on all issued gift cards | Free | Analytics | [5496](https://squareup.com/help/us/en/article/5496-reporting-and-analytics-for-your-gift-cards) |
| Disputes | Reason, evidence required, deadline, status; dispute/win rate | Free | Analytics | [8361](https://squareup.com/help/us/en/article/8361-view-dispute-reports) |
| Transaction status | Unprocessed, declined, cancelled and expired offline payments (30 days) | Free (account owners only) | Analytics | [5391](https://squareup.com/help/us/en/article/5391-transaction-status-report) |
| Transactions | Full payment history with deep filtering | Free | Analytics | [5145](https://squareup.com/help/us/en/article/5145-transaction-search) |

### 1.2 Accounting

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Reconciliation | Gross sales → refunds → fees → deposits | Free | Analytics | [pricing](https://squareup.com/us/en/pricing) |
| Sales taxes | Tax rate usage, taxable vs non-taxable sales | Free | Analytics | [8360](https://squareup.com/help/us/en/article/8360-view-tax-fee-and-service-charge-reports) |
| Fees | Transactional fees, taxes on fees, cost of taking payments | Free | Analytics | [8360](https://squareup.com/help/us/en/article/8360-view-tax-fee-and-service-charge-reports) |
| Service charges | Transactions with service charges applied | Free | Analytics | [8360](https://squareup.com/help/us/en/article/8360-view-tax-fee-and-service-charge-reports) |
| Transfers | Transfer mechanism, destination account, constituent payments | Free | Analytics | [3813](https://squareup.com/help/us/en/article/3813-match-deposits-to-sales) |

### 1.3 Inventory (Dashboard-only)

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Cost of goods sold report | COGS, total revenue, profit, profit margin | Plus | Analytics | [8522](https://squareup.com/help/us/en/article/8522-track-cost-of-goods-sold) |
| Inventory sell-through report | Sell-through rate, sales velocity, stock levels | Plus | Analytics | [7809](https://squareup.com/help/us/en/article/7809-sell-through-report-with-square-for-retail) |
| Projected profit report | Per-location profit potential by inventory category | Plus | Analytics | [retail pricing](https://squareup.com/us/en/point-of-sale/retail/pricing) |
| Aging inventory report | Average age of inventory, 30/60/90/120+ segmentation, on-hand value | Plus | Analytics | [8265](https://squareup.com/help/us/en/article/8265-track-aging-inventory-with-square-for-retail) |
| Vendor sales | Item sales by vendor | **Premium** | Analytics | [8266](https://squareup.com/help/us/en/article/8266-track-vendor-sales-with-square-for-retail) |
| Inventory variance report | Count and cost variance per stock-count session | Plus | Analytics | [8251](https://squareup.com/help/us/en/article/8251-view-and-export-inventory-variance-report-with-square-for-retail) |

### 1.4 Restaurants

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Close of day report** | Check details, gross/net sales, payment methods, category and item sales; settles card tips | Plus | **Register document** | [6594](https://squareup.com/help/us/en/article/6594-end-of-day-reporting-with-square-for-restaurants) |
| Live sales | Open checks plus closed-check totals, in real time | Plus | Analytics | [8142](https://squareup.com/help/us/en/article/8142-get-real-time-sales-data-on-square-restaurants-pos) |
| Section sales | Sales per floor-plan area (bar vs patio) | Plus | Analytics | [6433](https://squareup.com/help/us/en/article/6433-reporting-with-square-for-restaurants) |
| Kitchen performance | Completed ticket count and average ticket time | Plus | Analytics | [6433](https://squareup.com/help/us/en/article/6433-reporting-with-square-for-restaurants) |
| Menu reports | Filter reports by menu (dinner vs lunch vs happy hour) | Plus | Analytics | [restaurants pricing](https://squareup.com/us/en/point-of-sale/restaurants/pricing) |
| Daily Sales Summary Email | Gross/net sales, service charges, discounts, tips, WoW/YoY | Free per grid (disputed) | Analytics (emailed) | [8579](https://squareup.com/help/us/en/article/8579-review-daily-sales-for-your-restaurant) |
| Catalog reporting | Item performance consolidated across seven sales sources | Free | Analytics | [pricing](https://squareup.com/us/en/pricing) |
| Deferred sales tracking | Splits order placement from fulfilment (pre-orders, catering) | Free | Analytics | [pricing](https://squareup.com/us/en/pricing) |

### 1.5 Staff and labour

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Timecards | Regular/overtime hours, breaks, break violations, labour cost | Square Shifts | Analytics | [6140](https://squareup.com/help/us/en/article/6140-employee-timecard-reporting) |
| Workday | Per-shift hours, breaks, labour cost, declared and pooled tips | Square Shifts | Analytics | [6140](https://squareup.com/help/us/en/article/6140-employee-timecard-reporting) |
| Labor vs sales | Hourly labour cost against net sales | Square Shifts **Plus** | Analytics | [6140](https://squareup.com/help/us/en/article/6140-employee-timecard-reporting) |
| **Workday summary** | Clock in/out, breaks, total paid hours — printed at clock-out | Square Shifts | **Register document** | [6140](https://squareup.com/help/us/en/article/6140-employee-timecard-reporting) |
| Payroll reports and tax forms | Square Payroll outputs | Payroll add-on | Analytics | [topic index](https://squareup.com/help/us/en/topic/reports) |

### 1.6 Cash

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Cash drawers / Drawer History / Current Drawer** | Starting cash, cash sales, cash refunds, paid in/out, expected cash | **Free** (Cash Management add-on, "Add for free") | **Register document** | [8358](https://squareup.com/help/us/en/article/8358-view-cash-drawer-reports), [8344](https://squareup.com/help/us/en/article/8344-start-and-end-a-cash-drawer-session) |

### 1.7 Customers, loyalty, marketing, online, bookings

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Customer insights | Visits, spend, averages, satisfaction — **card transactions only** | Free | Analytics | [5418](https://squareup.com/help/us/en/article/5418-how-to-use-customer-insights) |
| Loyalty reporting | Loyalty vs non-loyalty spend, promotion-attributed sales, top customers | Plus | Analytics | [6467](https://squareup.com/help/us/en/article/6467-view-your-square-loyalty-metrics) |
| Email campaign reports | Campaign success, engagement, sales impact | Plus | Analytics | [8413](https://squareup.com/help/us/en/article/8413-view-email-marketing-campaign-reports) |
| Traffic & sources | Unique visits, page views, referrers, search terms | Plus | Analytics | [6948](https://squareup.com/help/us/en/article/6948-insights) |
| Purchase funnel | Sales per visit, conversion rate, add-to-cart rate | Plus | Analytics | [6948](https://squareup.com/help/us/en/article/6948-insights) |
| Team performance (Appointments) | Client retention, pre-booking, schedule utilisation | **Premium** | Analytics | [7904](https://squareup.com/help/us/en/article/7904-square-appointments-reporting) |
| Future bookings report | Future earnings from booked appointments | **Premium** | Analytics | [pricing](https://squareup.com/us/en/pricing) |
| Service cost tracking | Back-bar expenses per service | **Premium** | Analytics | [pricing](https://squareup.com/us/en/pricing) |
| Invoices reporting | Paid, unpaid and overdue invoice status | Free | Analytics | [pricing](https://squareup.com/us/en/pricing) |
| Square AI | Natural-language questions over Square data; pin charts; CSV download | Free | Analytics | [8516](https://squareup.com/help/us/en/article/8516-use-ask-ai-to-get-insights-about-your-business) |
| Managerbot | Proactively surfaces insights, tasks and support; needs internet | Free | Analytics | [8617](https://squareup.com/help/us/en/article/8617-use-managerbot-to-manage-business-tasks-and-insights) |

### 1.8 Cash drawer detail

The **Cash Management add-on** is free and added in the POS app; only account owners can enable it. Not available on phones ([5152](https://squareup.com/help/us/en/article/5152-cash-management-with-square)). A session tracks "starting cash amount, cash sales, cash refunds, cash paid in/out and the expected cash amount in your cash drawer" ([8344](https://squareup.com/help/us/en/article/8344-start-and-end-a-cash-drawer-session)).

The API field list is the precise contract: `opened_cash_money`, `cash_payment_money`, `cash_refunds_money`, `cash_paid_in_money`, `cash_paid_out_money`, `expected_cash_money`, `closed_cash_money` ([Cash Drawer Shifts API](https://developer.squareup.com/docs/cashdrawershift-api/reporting)). **There is no variance field** in `CashDrawerShift` — expected and counted are both stored, but over/short is the consumer's arithmetic. Square's own sample data records a shortfall as free text: `"description": "Cash drawer came up short"`.

Drawer reports print and email **from the POS app only**; "You cannot print or export cash drawer reports at this time" from Dashboard ([8362](https://squareup.com/help/us/en/article/8362-print-export-or-email-your-reports)).

**X-report / Z-report: Square uses neither term anywhere.** Its vocabulary is "cash drawer session", "Current Drawer", "End Drawer", "cash drawer report", and — Restaurants only — "Close of Day". The functional Z-report is **Close of Day** (Plus), the only feature performing a true day-close; the functional X-report is **View Live Sales** (Plus). A Square Free seller therefore has a drawer session but **no day-close document at all**.

### 1.9 Custom reports — two separate features

| Feature | How it works | Tier | Surface |
|---|---|---|---|
| **Custom reports** (multi-block) | Compose a saved page from nine blocks: Key statistics, Sales summary, Payment methods, Item sales, Category sales, Team member sales, Discounts, Modifier sales, Taxes. Saved and reopened by name. "The ability to save the date/time filters to your custom reports is not currently available." | None stated; permission-gated | Dashboard only — "Custom reports cannot be viewed on your point of sale app" ([6104](https://squareup.com/help/us/en/article/6104-creating-custom-reports-in-the-online-dashboard)) |
| **Custom Report Builder** | Metric-level builder. "Build reports across sales, items, payments, taxes, and more." Choose metrics (gross sales, net sales, item quantity), groupings (item, category, location, team member), filters (date range, location, item category). Presets across Sales, Items, Team, Payments, Taxes. Saved reports editable, renameable, deletable. | None stated; permission-gated | Web Dashboard only ([8624](https://squareup.com/help/us/en/article/8624-create-custom-reports-with-custom-report-builder)) |

Both are free — neither article states a subscription requirement. Square is steering other reports toward the Builder as a general escape hatch (the timecard and gift-card articles both point at it).

### 1.10 Export, scheduling, offline

- **CSV is the documented export format.** No PDF export is documented anywhere. Excel appears on *some* exports (item report, item library) but not as a general option ([8362](https://squareup.com/help/us/en/article/8362-print-export-or-email-your-reports), [8363](https://squareup.com/help/us/en/article/8363-view-item-category-and-modifiers-sales-reports)).
- Column control: "Export only selected columns" or "Export all columns in your view".
- Three stated exceptions: cash drawer reports cannot be printed or exported; custom reports can only be exported, not printed; Transaction status pages can only be printed, not exported.
- **Scheduling:** the only recurring emailed report is the **Daily sales summary** email (daily/monthly/annual variants), with additional recipients per location, configurable by account owners only. **There is no general report scheduler.**
- **APIs:** there is no Square "Reporting API". Data is pulled from Orders, Payments, Payouts, **Cash Drawers** (`GET /v2/cash-drawers/shifts`, `CASH_DRAWER_READ`), Inventory, Catalog, Labor, Team, Customers, Loyalty, Gift Cards, Disputes and Vendors. Aggregation is the integrator's job ([API reference](https://developer.squareup.com/reference/square)).
- **Offline: no report is available offline.** While offline the POS shows pending payments only, and "Pending offline payments can only be viewed from the Square POS apps" ([8551](https://squareup.com/help/us/en/article/8551-view-offline-payments)). Close of Day "can't be run while offline". Both AI features require internet.
- **POS app shows only** transaction history, sales summary, gift cards overview and disputes, plus the Sales report, Drawer History/Current Drawer, the printed Workday summary, and (Restaurants) Live Sales and Close of Day. Everything else is Dashboard-only, stated verbatim per report ([5072](https://squareup.com/help/us/en/article/5072-summaries-and-reports-from-the-online-dashboard)).

### 1.11 Contradictions and gaps

| Item | Status |
|---|---|
| Vendor sales tier | **Contradictory in one sentence** — "Retail Plus and Premium" vs "Square **Premium** with advanced inventory". Pricing grid resolves to Premium only. |
| Daily Sales Summary Email tier | **Contradictory** — pricing grid says all tiers; help article says Restaurants Plus/Premium. |
| Projected profit report | Tier confirmed from the pricing grid; **no help article exists**. Contents UNCONFIRMED. |
| "Inventory by category" | **UNCONFIRMED** — no Square-owned page names such a report. |
| Custom Report Builder metric list | **UNCONFIRMED** — Square publishes examples only. |
| PDF export | **UNCONFIRMED / apparently unsupported** — CSV only in the canonical article. |
| Cash drawer variance field | **UNCONFIRMED as a field** — absent from the API object and unnamed in UI docs. |
| Report scheduling beyond the daily email | **UNCONFIRMED** — no scheduler documented. |
| AI feature naming | Unstable — mid-rename across Ask AI → Square AI → Managerbot; article 8516's slug and content disagree. |

---

## 2. Shopify POS

**The historical plan-gating of report categories is gone.** Shopify's own Basic-plan page states: *"The Basic plan comes with access to all reports, including the ability to create custom reports with data explorations"* ([Basic plan](https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/basic-shopify-plan)), and the [pricing table](https://www.shopify.com/pricing) shows one analytics row — "200+ real-time reports, plus custom analytics" — ticked identically on **Basic, Grow, Advanced and Plus**. ("Shopify" as a tier name is retired; it is now **Grow**.)

Three Shopify pages contradict that and are flagged rather than resolved: the [analytics index](https://help.shopify.com/en/manual/reports-and-analytics) still says report types "depend on your Shopify subscription plan"; [/pos/features](https://www.shopify.com/pos/features) carries a footnote "Reports included with Grow and above plans" against four POS report groups; and the [Advanced plan page](https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-advanced-plan) claims Advanced "offers the most comprehensive reports". Only **predicted values** reads as genuinely Advanced-distinctive.

**The real gating axis is POS Lite vs POS Pro** (+$89/mo per location, [POS pricing](https://www.shopify.com/pos/pricing)), and it is narrow — Pro buys exactly three reporting things.

### 2.1 Retail / POS-specific reports (admin → Analytics → Reports → Retail sales)

All are **any plan, POS Lite**, and all Analytics. Source: [retail sales reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/retail-sales-reports).

| Report name | What it shows |
|---|---|
| POS total sales by product | Total sales per product at POS locations, excluding shipping |
| POS total sales by product variant | Gross sales of top POS sellers at variant level |
| POS total sales by vendor | Vendors and their products, grouped by POS location |
| POS total sales by product type | Retail sales by product type, grouped by POS location |
| Total sales by POS location | Total sales for each point-of-sale location |
| POS total sales by staff member | Sales attributed to staff credited with line items at checkout |
| POS staff daily sales total | Daily sales by the staff member who rang the sale |
| POS staff sales total | Sales by the staff member who processed the sale |

Scope: "The retail sales reports are available only if you sell in person"; data latency 1–5 minutes.

### 2.2 In-app POS reports (POS app → Analytics) — **POS Pro only**

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Daily Sales report | Net sales, AOV, Items per order tiles; top products, top product types, top staff; net payments by type | **POS Pro** | Analytics | [analytics on POS](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/analytics-on-pos) |
| Total sales by staff | Staff name, items sold, net sales; filterable and sortable | **POS Pro** | Analytics | same |

Verbatim gate: *"This feature is available only for locations that are currently on the Shopify POS Pro subscription."* Also needs the staff permission **View analytics for device's location**.

### 2.3 Register documents — cash tracking / register sessions

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Session** | Register session start/end times, net payments by type, cash activity | Lite and Pro | **Register document** | [sessions in admin](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/cash-register-management/register-sessions-in-shopify-admin) |
| **Net payments** | All payments in a session, by payment type | Lite and Pro | **Register document** | same |
| **Session activity** | Log of every cash movement — additions, removals, drawer openings. Only report exportable while a session is open | Lite and Pro | **Register document** | same |
| **Expected cash** | Expected drawer balance; flagged as unreliable if a session stays open too long | Lite and Pro | **Register document** | [sessions in POS](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/cash-register-management/register-sessions-in-shopify-pos) |
| **Descrepencies** *(Shopify's spelling)* | Session discrepancy report | Lite and Pro | **Register document** | same |
| **Cash tracking** (all locations) | Cross-location session comparison | **POS Pro** | **Register document** | [cash tracking reports](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/cash-register-management/cash-tracking-reports-by-location) |
| **Cash tracking summary** (per location) | Per-location session summary | **POS Pro** | **Register document** | same |
| ↳ Discrepancy summary → **Opening discrepancy**, **Closing discrepancy** | Expected vs counted at session open and close | **POS Pro** | **Register document** | same |
| ↳ Cash payments → **Gross payments**, **Refunds**, **Net payments** | Cash payment totals across sessions in scope | **POS Pro** | **Register document** | same |

**The tier split is subtle:** running sessions in the POS app is Lite *and* Pro; viewing the **admin** cash-tracking reports is Pro-only.

### 2.4 General sales reports (admin → Analytics → Reports → Sales)

Any plan, POS Lite, all Analytics. Source: [sales reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report).

Total sales over time · Total sales by product · Total sales by product variant · Total sales by vendor · Sales by discount codes · Total sales by referrer · Total sales by billing location · Total sales by currency (Shopify Payments only) · Total sales by sales channel · Net sales by channel · Sales by customer name · Average order value over time · Bundle total sales over time · Total sales by bundle · Total sales by bundle component · Bundle component and product comparison · Active/Canceled/New subscriptions over time · Subscription sales over time · Subscription vs one-time sales

Two Plus-only *columns* (not reports) exist: Non-shipping script discounts and Shipping script discounts.

### 2.5 Finance reports

Any plan, POS Lite, all Analytics. Source: [finances reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/finances-report).

Finance Summary · Total sales breakdown · Total sales by order · Gross sales by order · Net sales by order · Shipping by order · Sales reversals by order · **Discounts by order** (includes POS-applied discounts) · Payments → Net payments by method / over time / by gateway / by order · Shopify Payments activity report · **Taxes** (destination resolves shipping → billing → POS address) · United States sales tax report (State overview, Jurisdiction report, Detailed transaction report) · Canada sales tax report · Managed Markets taxes · Store credit transactions · Outstanding store credit balance · Net sales from gift cards · Outstanding gift card balance · Tips by staff member · Tips over time · **Cost of goods sold**

### 2.6 Inventory reports

Any plan, POS Lite, all Analytics. Source: [inventory reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/inventory-reports).

Month-end inventory snapshot · Month-end inventory value · Inventory sold daily by product · Products by percentage sold · **ABC product analysis** · Products by sell-through rate · Inventory remaining per product · Inventory adjustment changes · Inventory adjustments by count

Data floor: "Historical data for inventory-based metrics go back only to October 1, 2023."

### 2.7 POS channel surfaces in admin

| Surface | What it shows | Type | Source |
|---|---|---|---|
| Analytics section on the POS channel overview | Gross sales, Orders, Discounts, Returns; Today / Last 7 / Last 30 days | Analytics | [POS from admin](https://help.shopify.com/en/manual/sell-in-person/getting-started/shopify-pos-from-admin/overview) |
| **Activity log for Shopify POS** | "high-risk register actions taken on Shopify POS, such as voids, refunds, and manual discounts" | Register document (audit log) | same |

### 2.8 Register document detail

Shopify calls the unit a **register session** — "a record of all cash activity and payments during specified intervals, including the starting float, any cash added or removed, and the final count" ([cash tracking](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/cash-register-management/cash-tracking)). The old "shift" naming is retired.

Field names: opening float is **"Current amount in drawer"** with a **Count cash** helper (Bills/Coins); the next session auto-opens at the previous close. **Add cash** / **Remove cash** each take an amount and an optional reason code. Closing produces a **Cash counted** field and a **Session complete** screen. Admin asks you to *"Confirm cash counted discrepancy of $X.XX"*.

So: opening float, cash sales, cash added/removed, expected vs counted, and over/short are all captured — but Shopify never says "over/short", it says **discrepancy**.

**X-report / Z-report / shift report: Shopify uses none of these terms.** The nearest analogues are the **Session** report on an open session (X-like, no till clearing) and the printed slip at close — *"'Print' prints the cash details for this register session and a summary that has all payment types"* — which Shopify names nothing. **There is no consolidated end-of-day document** combining sales, tax, tender and drawer.

### 2.9 Stocky is dead

*"On February 2, 2026, Stocky was delisted from the Shopify App Store"* and *"Stocky is no longer available as of August 31, 2026"*, with read-only export access for at least 90 days ([transitioning from Stocky](https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky)). Its reports (ABC analysis, Best sellers, Low Stock Products, Low Stock Variants, Orders, Product, Sales items, Statistics, Stock on hand, Adjustments) were POS Pro-gated. Shopify concedes a gap: *"There isn't a dedicated native report for total purchase order spend by supplier."*

### 2.10 Custom reports

**Feature name: "custom reports", built from a "data exploration"** — no separate branded builder. Customize a report or start "from an empty exploration state", then save; saving also creates a matching metric card in the dashboard library ([custom reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/custom-reports)). **Tier: any paid plan** — Shopify's own Basic page says so.

**ShopifyQL is alive.** "A query language for commerce… SQL-like", exposed via the admin ShopifyQL editor, `shopifyqlQuery` on the GraphQL Admin API, a Python SDK and CLI, and a metric card web component; api_version 2026-07, no deprecation notice ([ShopifyQL](https://shopify.dev/docs/api/shopifyql)).

**ShopifyQL Notebooks is retired** — its App Store listing now reads "This app is not currently available on the Shopify App Store" ([listing](https://apps.shopify.com/shopifyql-notebooks)). The retirement *date* is **UNCONFIRMED**; only current unavailability is confirmed. It was Plus-only.

**Sidekick** can generate and export reports conversationally.

### 2.11 Export, scheduling, offline

- **Export formats: CSV, XML, JSONL, Apache Parquet** ([export reports](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/custom-reports/export-reports)). **Excel is not an export format** — only a program to open a CSV. **PDF is not an export format**: *"If you want a PDF file of a report, then you can print the report instead of exporting."*
- Row cap: *"Reports display a maximum of 1,000 rows"* (totals still reflect all rows).
- Export caveat: in CSV sales exports each row is a line item, so a 5-line order yields 5 rows and inflates apparent order count.
- Cash tracking exports (Pro, admin): Export summary / Export cash discrepancy summary / Export all sessions / Export selected sessions, plus Print.
- **Scheduled / emailed reports: none documented.** Nothing on Shopify's own pages offers it; the field is served by third-party apps.
- **API:** `shopifyqlQuery` on the GraphQL Admin API, requiring the `read_reports` scope and Level 2 access to protected customer data ([reference](https://shopify.dev/docs/api/admin-graphql/latest/queries/shopifyqlQuery)).
- **Offline: no reports are available offline.** The [offline features page](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/selling-offline/offline-features) never mentions analytics, reports or cash tracking, and POS "can't sync orders and inventory with your Shopify admin when you're offline". Offline *does* support cash payments, manual discounts, cash drawer and receipt printers; it does **not** support login, customer search/create, tips, gift cards, discount codes, exchanges, returns or voids.

---

## 3. Lightspeed Retail — X-Series and R-Series

> **Vend IS X-Series — confirmed on a Lightspeed page.** `vendhq.com` 301s to [lightspeedhq.com/vend/](https://www.lightspeedhq.com/vend/), titled "Vend is now Lightspeed", stating: *"Vend—now Lightspeed Retail (X-Series)—supports retailers to streamline operations…"* The X-Series developer docs still live at `docs.vendhq.com`, and legacy article titles still say "Vend-Xero Integration". **Vend is not a separate vendor in this survey.**

> **Fetch note.** Both help centres sit behind a Cloudflare challenge that 403s direct fetches of `/hc/...` URLs. Article text was read through the Zendesk Help Center API on the same hosts, which serves identical official bodies; the `/hc/` URLs cited are the canonical public links.

### 3.1 X-Series plan tiers

[Retail pricing](https://www.lightspeedhq.com/pos/retail/pricing/), which disclaims *"prices reflect Lightspeed Retail (X-Series)"*:

| Plan | Price (annual, USD/mo) | "Advanced sales, staff and inventory reports" | "Insights (Forecasting, order recommendations & custom reporting)" | "API access" |
|---|---|---|---|---|
| **Basic** | $89 | ✗ | ✗ | ✗ |
| **Core** | $149 | ✓ | ✗ | ✗ |
| **Plus** | $289 | ✓ | ✓ | ✓ |

Legacy plans still referenced in help-centre banners: **Lite** and **Pro** (discontinued), **Lean, Standard, Advanced, Enterprise**. Legacy plans are one-way: *"Once you have upgraded from a legacy plan, you will no longer be able to return to a legacy plan."* **Enterprise is not on the public pricing page.** Lightspeed documents the banner convention: *"Articles that do not display a Plan availability detail functionality that is available to all plans."*

**Two gating layers:**
1. **Basic vs advanced reporting** — basic is all plans; advanced is *"Available on Pro, Advanced, Enterprise / Available on Core\*, Plus"*, with Core excluding five reports. Advanced reporting is also sold as an **"Advanced Reporting" add-on** to Lean and Standard ([basic and advanced reporting](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534093525915-Basic-and-advanced-reporting-in-Retail-POS-X-Series)).
2. **The Insights module** — exact product name **"Lightspeed Insights"**. Newer banner: *"Insights features (forecasting, order recommendations, custom reporting) are available to merchants on Plus plans."*

**Add-on price: UNCONFIRMED.** No Lightspeed page publishes one — *"Lightspeed Insights is available in selected plans, but not all… please contact us."*

> **Vendor contradiction flagged, not resolved:** the master article's footnote says *"Individual performance and sales by hour of day reports are not available on the discontinued Pro or current Core plans"*, but the Individual performance report's own banner reads *"Available on Pro, Advanced, Enterprise / Available on Core, Plus"*.

### 3.2 X-Series reports

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Home dashboard** | Sale values, average sale value, average items per sale, gross profit, revenue by day/week/month | All plans | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534030080795-Using-the-home-dashboard) |
| **Sales summary** | Sales performance overview; report types Sales history, Sales summary, Customer groups, Promotions, Sales channels | All plans (Promotions & Sales channels not on Lite) | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534089010715-Using-the-sales-summary-report) |
| **Sales history** | Chronological individual sales, filterable by status/customer/receipt/outlet/user/date | All plans | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534147956123-Exporting-your-reporting-data-from-Retail-POS-X-Series) |
| **Adjustment report** | Impact of manual inventory adjustments by quantity and cost (Manager/Admin only) | All plans | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534010536987-Using-the-Adjustment-report) |
| **Payments report** | All payment types over a period with totals, for reconciliation | All plans; period comparison = advanced | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534178609563-Using-the-payments-report) |
| **Lightspeed Payments report** | Payouts, fees, net/processing-fee/total transaction amounts | All plans, Lightspeed Payments merchants | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533678155931-Reporting-with-Lightspeed-Payments) |
| **Register closure report** | Per-closure: outlet, register, Sequence #, opened/closed, new sales, taxes, discounts, account sales, layaway, delivery/pickup, payments by type | All plans | **Register document** | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534252854043-Using-the-register-closure-report) |
| **Cash movement report** | All recorded cash movements across registers and outlets | All plans | **Register document** | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/42681623234331-Using-the-cash-movement-report) |
| **Gift card report** | Gift card totals, sales, per-card balance and redemption status | All except discontinued Lite | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534216519579-Using-the-gift-card-report) |
| **Store credit report** | Store credit issued / redeemed / outstanding, per-customer balances | All plans | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534226478747-Using-the-store-credit-report) |
| **Tax report** | Each tax type, rate %, tax collected, revenue incl. tax (Admin only) | All plans | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534243502363-Using-the-tax-report) |
| **Retail dashboard** | KPI trends across outlets by day/week/month, 12 filter dimensions | Pro, Advanced, Enterprise / **Core, Plus** | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533720653211-Using-the-retail-dashboard) |
| **Advanced Retail Metrics** | 9 extra home-dashboard metrics under "Things to Know" | Core, Plus | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534104962203-Adding-advanced-retail-metrics-to-the-home-dashboard) |
| **Individual performance report** | Per-staff sales performance for coaching and commissions | Banner says Core, Plus; master article says **not** on Core (contradiction) | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533691932315-Using-the-individual-sales-performance-report) |
| **Sales by hour of day report** | Hourly revenue, COGS, gross profit, margin % — for staffing | **Advanced, Enterprise / Plus** | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534114054683-Using-the-sales-by-hour-of-day-report) |
| **Inventory summary report** | All / on-hand / low inventory by product, brand, SKU, outlet, supplier, category | Advanced reporting (Core, Plus) | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534047935643-Using-the-inventory-summary-report) |
| **Inventory replenishment report** | Closing inventory, items sold, days' cover, reorder points and amounts | Advanced reporting; forecasting columns = Insights | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534149698587-Using-the-inventory-replenishment-report) |
| **Inventory performance report** | Compare products, categories, brands, suppliers, SKUs by ROI | Core, Plus | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534065421979-Using-the-inventory-performance-report) |
| **Inventory turns report** | Times inventory sold and replaced; which brands/categories drive the business | Advanced reporting | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/39896690485787-Using-the-inventory-turns-report) |
| **Sell through inventory report** | % of available inventory sold in a range by product/category/brand/supplier | **Advanced, Enterprise, or add-on / Plus** — excluded on Pro and Core | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534083755675-Using-the-sell-through-inventory-report) |
| **Dusty inventory report** | Slow-moving stock to remerchandise, clear or discontinue, by location | **Advanced, Enterprise, or add-on / Plus** | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534172621083-Using-the-dusty-inventory-report) |
| **Recently out of stock inventory report** | Zero/negative-inventory products with sales and revenue, by outlet | **Advanced, Enterprise, or add-on / Plus** | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534213175835-Using-the-recently-out-of-stock-inventory-report) |
| **Demand forecasting** (Forecasted demand, Suggested order quantity, Missed items sold, Estimated items sold) | Forecast demand and draft POs straight from the report | **Insights module** / Plus | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534181342363-Setting-up-demand-forecasting-reports) |
| **Lightspeed AI** | Natural-language analysis of report data — open beta | **Plus** | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/49239242806043-Using-Lightspeed-AI-with-reports) |
| **Inventory count report** | CSV of a completed inventory count | Not stated | Analytics | [help](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533787981083-How-to-export-an-inventory-count-report) |

**Names that do NOT exist in X-Series:** no "Reorder report" (it is the **Inventory replenishment report**), no "Stock on hand report" (on-hand inventory is a *Measure*), no "Product performance" (it is **Inventory performance**), no "Sales by user/employee" report (a *Report type* plus the Individual performance report), no "Daily sales" report (the Sales summary configured by period), and no report literally named "Insights".

**Role gating is orthogonal to plan gating:** *View sales reports*, *View inventory reports*, *View register closures and cash movement reports*, *View Lightspeed Payments reports*. *"Cashiers can't be granted access to these reports"*, though unchecking register-closure access still lets staff *"open and close their register and view the summary for that specific opening or closure."* Custom user roles are themselves **Plus/legacy Enterprise**.

### 3.3 R-Series reports

R-Series reporting sits under **Reports**, grouped into Basics, Sales & Refunds, Grouped Sales Totals, Point of Sale Reports, Roll-Up Reports, Payments, Registers, Inventory Reports, Other Transactions, Accounting.

> **Lightspeed publishes no canonical list of R-Series reports and no per-report plan gating.** A full-text search of all 505 English R-Series articles returns **zero** statements tying a named POS report to a named plan tier. The documented gate is **employee rights**, not plan. Tier is therefore UNCONFIRMED throughout.

| Report name | What it shows | Type | Source |
|---|---|---|---|
| **Totals** (Sales & Refunds) | Per-sale Total w/ Tax, Total Tax, Tips; drill into Sale ID | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360043108154-Viewing-taxes-by-sale) |
| **Lines** (Point of Sale Reports) | Line-item sales incl. misc. and labor charges, gift card / work order numbers, tags | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/229129868-Inventory-exercise) |
| **Item** (Grouped Sales Totals) | Sales grouped by item — best sellers | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360042955253-Viewing-your-best-sellers) |
| **Sales Tax** / **Tax Class** | Tax collected per sales tax / per tax class | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360043623653-Viewing-taxes-by-sales-tax) |
| **Brand** / **Location** / **Category** | Sales grouped by brand; sales and tips by location; sales by category | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360042926613-Filtering-sales-by-category) |
| **Units Per Sale** | Units sold in a date range | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360042454914-Creating-an-end-of-day-report) |
| **Margin Per Line** | Per-line margin; finds lines sold at the wrong cost | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/229834828-Editing-unit-cost-average-cost-and-FIFO-cost) |
| **Line Employee** | Items/charges processed per employee — performance and commissions | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/229129868-Inventory-exercise) |
| **Tips by Employee** | Real-time tips per employee; reassign a tip | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/4402393076251-Reporting-on-tips) |
| **End of Day** (Roll-Up Reports) | Day's total sales, tax, refunds, returns, products sold; breakdown by payment type; first and last invoice IDs; sales by category; tips by location | **Register roll-up** — closest thing to a Z-report | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/229129868-Inventory-exercise) |
| **Closing Counts** (Registers) | Saved closing counts per register/payment type; Counted amounts editable after saving | **Register document** | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/1260800790810-Opening-and-closing-a-register) |
| **Adds/Payouts** (Payments) | Cash pay-ins and payouts/drops with description and notes | **Register document** | same |
| **Received** (Payments) | Payments received by type incl. refunds and cash-rounding amounts | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/47933727937179-Cash-rounding-in-Retail-POS-R-Series) |
| **Partial** / **Preauthorizations** | Integrated card payments on incomplete sales; open preauth holds | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360010901473-Completing-sales-in-the-Partial-Payments-report) |
| **Sales & Payments Balance** (Accounting) | Sales subtotal / tax / discounts / tips vs payments, by location | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/229130488-Understanding-accounting-packages) |
| **Accounting Status** / **QuickBook Exports** | Failed Lightspeed Accounting postings; QuickBooks IIF export | Analytics / export | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/228839927-Manually-exporting-Retail-POS-R-Series-data-into-QuickBooks) |
| **Reorder list** (Basics) | Items below reorder point plus units needed, with Comparison Location QOH | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360020596114-Understanding-the-Reorder-List-report) |
| **Assets** / **History** | Current inventory asset value; asset value on a past date (queued, CSV) | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/229246768-Using-the-Asset-Report) |
| **Received** / **Returned** (Inventory) | Stock received vs remaining; vendor returns with RTV order number | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360042454934-Viewing-received-and-remaining-items) |
| **Negative inventory** / **In Transit** / **Inventory Movement Logs** | Negative QOH with reason; in-transit quantities; per-item change log | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360020530853-Understanding-the-Negative-inventory-report) |
| **Workorders** / **All transactions** | Work orders; every transaction incl. canceled sales | Analytics | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360036483513-Setting-up-sales-receipts) |
| **Clock Entries** / **Total Hours** | Individual clock-in/out records; hours totalled by date/employee/location | Employee | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/228840287-Managing-employee-hours) |
| **Customer data report** | Flags potentially sensitive data typed into notes/address fields — *"only available to certain merchants"* | Compliance | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/41439241899163-Using-the-Customer-data-report) |
| **UK Digital Normal VAT report** / **UK Digital Retail VAT Report** | MTD VAT exports (CSV), UK only | Tax | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/1260803349550-Exporting-the-UK-Digital-Normal-VAT-report) |
| **Home** (Quick Stats) | Six live KPIs: Revenue, Margin, Profit, Sales, Discounts, Refunds, plus chart and activity feed | Dashboard | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/360009800674-Understanding-Home) |
| **Transactions and Payouts report** | Net sales, refunds, processing fees, settlements, monthly fee statements | Payments | [help](https://retail-support.lightspeedhq.com/hc/en-us/articles/7824219227163-Reporting-with-Lightspeed-Payments) |

**Names that do NOT exist in R-Series:** "Sales Totals", "Sales Summary", "Sales by Register", "Payment Report", "Inventory Valuation", "Employee Hours", "Customer Report", "Z-Report"/"Register Closeout". Real equivalents: Totals, End of Day, Received, Assets, Total Hours, Closing Counts.

**R-Series Analytics add-on: "Lightspeed Analytics"** — a separate app at `lightspeedanalytics.net` with its own login, syncing *"every 2-3 hours"*. **Three editions**: Lightspeed Analytics (*"Full suite"*), **Analytics Core** (*"Essential reporting features"*), **Analytics Enterprise** (multi-account). Features *"available in Lightspeed Analytics only"* (absent from Core): **Custom reports, Favorite reports, Advanced reports drill-down, Report dictionary, Goals and Goals vs Actual, Daily target reports, Scheduling, sharing, and emailing reports** ([about](https://retail-support.lightspeedhq.com/hc/en-us/articles/4410649517723-About-Lightspeed-Analytics)). It adds Sales/Profit Year Over Year, Recent Sales, Sell Through, Dusty Inventory, Recently Out of Stock with Sales, Low Stock Alerts, Margin Alert, Turns, GMROI, Commonly Bought Together, Customer Lifetime Value, Team and Individual Performance, Customer Capture Rate, Upsells Percentage, Sales by Hour of Day, and a Smart view dashboard with an AI Summary.

> **Naming drift Lightspeed never reconciles:** the help centre says **"Lightspeed Analytics"**; the marketing page for the same capability says **"Lightspeed Insights"**; the restaurant equivalent is "Advanced Insights".

### 3.4 Register documents

**X-Series — "register closure".** Open with an opening cash float plus optional note. Four cash-movement types during the day: **Cash out**, **Petty cash out**, **Cash in**, **Petty cash in**, each with an optional note. Close via *"Enter cash total only or Count cash by denomination"* — denomination counting auto-totals into the **Counted ($)** field beside the **expected** amount per payment type, with a live **Differences ($)** field on iPad. Discrepancy wording: *"If your physical count is less than your expected count in Retail POS, this difference will be recorded as a shortfall. If it is more than the expected count, the excess amount will be recorded as an overpayment."* The closure record carries a **Sequence #** (*"Also referred to as Closure #"*). *"Click Print Last Summary to print or save a PDF of the closing summary."*

Two architectural details worth carrying: **closing is online-only** — *"This process connects to the Retail POS cloud server and checks its date and time, recording it as the time the register was closed"* — and cash management, once enabled, *"cannot be disabled"*. **Tier: all plans.** *"All user roles can open and close registers and perform cash movements. These permissions are the default and cannot be removed from user roles."*

**R-Series — "closing count" / "End of Day".** Vocabulary: Open/Close Register, opening float, closing count, Submit/Save/Redo Counts, **Closing Count report**, **Cash Drawer Adjustment** (the auto-printed slip), Payout/Drop, Add Amount, **Adds/Payouts report**. Desktop shows a **Total Remaining** column (*"how much you should be entering in your closing count for each payment type"*); iPad shows **Expected**, **Counted**, **Difference**. Discrepancies are recorded as *"shortages or overages of funds in your cash drawer (cash and non-cash payment types)"*. Counts are **editable after the fact**. Not plan-gated and not role-gated. The **End of Day** roll-up doubles as the X-report equivalent, runnable at any point during the day.

**Does either use "X-report" / "Z-report"? No.** A full-text search of the complete English corpus of both help centres found **no occurrence of "X-report", "Z-report", "X-read" or "Z-read"**; R-Series never uses "closeout" either. X-Series says "register closure" / "end of day totals" / "closing slip"; R-Series says "closing count" / "End of Day" / "Cash Drawer Adjustment".

### 3.5 Custom reports

**X-Series — "Saving customized reports".** *"Sales, inventory, adjustment, payments, and tax reports can be customized using filters, measures, and table formatting to suit your workflows and saved for ongoing use. This functionality is available for Admin and Manager roles."* Saved reports get their own tab beside Summary. It is **customize-and-save, not a blank-canvas builder**. Tier: the current banner says Plus; older per-report phrasing says *"only available to merchants on Advanced or Enterprise plans, or those that have purchased the advanced reporting module."*

**R-Series built-in: no custom reports** — filter-and-export only, no save, no builder. **Lightspeed Analytics: yes, a real builder** — start from an existing report or *"a blank template and build your custom report from scratch (advanced)"*, adding Dimensions, Measures, Filters, Pivot and **Custom Fields** (custom dimensions, custom measures, table calculations); save as new, optionally share company-wide. **Not in Analytics Core.**

**APIs.** X-Series API (base `https://{domain_prefix}.retail.lightspeed.app/api/2026-07`) is **a Plus-plan feature** and has **no reports endpoint family** — you export raw entities (`listsales`, `listpaymenttypes`, `listinventoryrecords`, `getauditlogevents`) and build reporting yourself. Register documents *are* modelled: `GET /registers/{id}/payments_summary` returns expected totals per payment type with `register_open_time` and `register_closure_sequence_number`, and the docs state the intended flow: *"The data received in the first step should be presented to the user as the 'expected' state of the register to allow them for checking for discrepancies."*

R-Series API has **five dedicated report endpoints**, all read-only, all requiring `startDate`/`endDate`, scope `employee:reports`: `Reports/Accounting/PaymentsByDay`, `DiscountsByDay`, `TaxesByDay`, `TaxClassSalesByDay`, `OrdersByTaxClass`. The register closeout is fully modelled: `RegisterCount` (*"a separate calculated 'should have' and actual physical count amounts for each payment type"*), `RegisterCountAmount` (`calculated` vs `actual`), `RegisterWithdraw` (*"The opening count for a register is a positive RegisterWithdraw"*), plus `DisplayTemplate/RegisterCount` for printing closing-count slips from a Twig template. Whether R-Series API access is plan-gated: **UNCONFIRMED**.

### 3.6 Export and offline

**X-Series:** reports export to **XLSX or CSV**, with a vendor warning — *"SKUs that are more than 14 characters long or have a leading 0 are often altered when exported as a CSV file. Export the report as an XLSX format to prevent this error."* **PDF only for the register closing summary**; no PDF export of analytics reports. **Scheduled email: yes** — *"Available on Advanced, Enterprise, and Plus plans / Available in the Advanced reporting add-on"*, up to **50 recipients**, Daily / Weekly / Monthly. Constraints: *"Only saved and prepared reports that use a relative date range… can be scheduled"*; one schedule per report; only the owner can edit recipients, and *"In the event that the owner is no longer a Retail POS user, the scheduled report will need to be set up again."*

**R-Series:** built-in reports are **CSV or print only** — *"Printing allows you to either review the results on paper or create a PDF"*. **No native PDF export, no XLSX from POS reports, and no scheduling or emailing of built-in reports anywhere in the help centre.** Lightspeed Analytics adds scheduled email daily/weekly/monthly with an Alert Mode; download formats are never enumerated (Excel confirmed, rest **UNCONFIRMED**).

**Offline — X-Series** has an offline mode and **reporting is entirely unavailable in it**: *"While offline, you can only access the Sell and Status pages"*. Because closing a register requires the cloud server, **the register closure cannot be produced offline either**. **R-Series documents no POS offline mode at all** — "offline" appears only for payment-terminal modes and for "create an offline backup" meaning a CSV export.

The R-Series terminal offline mode carries sharp reporting consequences worth noting: *"Payments received in standalone mode and offline mode aren't synced to the sales history and don't affect your inventory records. They're reported exclusively in your Lightspeed Payments reports"*; they *"don't generate a receipt ID"*; and failed authorizations *"will show an Offline declined status in your reports. Each payment with the Offline declined status represents a loss."*

### 3.7 Lightspeed gaps

| Item | Status |
|---|---|
| Advanced Reporting / Insights add-on price (both series) | **UNCONFIRMED** — "available in selected plans… please contact us" |
| R-Series per-report plan gating | **UNCONFIRMED** — zero statements across 505 articles |
| R-Series prices | **UNCONFIRMED** — the only retail pricing page disclaims itself as X-Series |
| Which Retail POS plan includes which Lightspeed Analytics edition | **UNCONFIRMED** |
| Lightspeed Analytics download format list | **UNCONFIRMED** (Excel confirmed, rest unnamed) |
| Whether R-Series API access is plan-gated | **UNCONFIRMED** |
| X-Series Enterprise pricing/positioning | **UNCONFIRMED** — in help banners, absent from pricing page |
| Core's access to Individual performance / Sales by hour of day | **Vendor self-contradiction**, unresolved |
| Relationship between "Lightspeed Analytics" and "Lightspeed Insights" | Never documented |

---

## 4. Clover

> **Plan naming trap.** "Starter / Standard / Advanced" are **hardware bundle names, not software plans**. Clover's pricing tables carry a separate `Software plan` row: all three restaurant bundles run **"Restaurant Growth"** ([restaurant pricing](https://www.clover.com/pricing/restaurant)); retail's BASIC bundle runs **"Starter"** while STANDARD and ADVANCED run **"Retail Growth"** ([retail pricing](https://www.clover.com/pricing/retail)). The underlying entitlement model in the developer docs lists the real merchant service plans as **"Payments or Payments Plus", "Essentials or Register Lite", "Register", "Counter Service Restaurant", "Table Service Restaurant"** ([merchant service plans](https://docs.clover.com/dev/docs/understand-merchant-service-plans)).

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Sales report** | Gross sales, refunds, net sales; tender-type breakdown; daypart filtering | Requires "access permission to Reporting". Retail pricing gates "Detailed sales reports" — **Not Included on Starter, Included on Retail Growth** | Analytics | [cash-log-app](https://www.clover.com/en-US/help/cash-log-app) · [retail pricing](https://www.clover.com/pricing/retail) |
| **Sales Overview — Full report** | Sales Summary (Gross/Net/Amount Collected), Tender Types, Revenue Classes, Sales by Card Type, **Cash Deposit**, **Cash Adjustment** | "must have the Access Reporting permission" | Analytics (contains two cash sections) | [full reports](https://www.clover.com/en-CA/help/read-sales-overview-full-reports) |
| **Sales Overview — Trends** | Interactive chart: gross, net, orders, amount collected, average ticket; top-5 tenders, revenue classes, card types, categories, items | Same | Analytics | [trends reports](https://www.clover.com/en-CA/help/read-sales-overview-trends-reports) |
| **Employee sales report** | Sales by employee incl. total sales, tips, refunds | UNCONFIRMED | Analytics | [reports overview](https://www.clover.com/en-US/help/clover-reports-overview) |
| **Item sales report** (nav: *Reports > Item and Service sales*) | Quantity sold, popular items, revenue class performance, COGS, gross profit margin; cash-basis | UNCONFIRMED | Analytics | [item sales](https://www.clover.com/en-US/help/run-or-request-the-item-sales-report) |
| **Tender and card types report** | Sales split by cash/card/digital wallet/gift card, plus card brand | UNCONFIRMED | Analytics | [reports overview](https://www.clover.com/en-US/help/clover-reports-overview) |
| **Sales by Tender and Card Type report** | Drill-down from the Tender Types / Card Types sections | UNCONFIRMED | Analytics | [full reports](https://www.clover.com/en-CA/help/read-sales-overview-full-reports) |
| **Revenue Item Sales report** | Drill-down on Revenue Classes | UNCONFIRMED | Analytics | same |
| **Cash log report** (*Sales activity > Cash log*) | All cash transactions and cash-drawer activity; filter by employee, event, device type | UNCONFIRMED | **Register document** | [cash log](https://www.clover.com/en-US/help/run-cash-log-report) |
| **Removed items report** | Items removed from orders and by which employee (loss prevention) | UNCONFIRMED | Analytics | [reports overview](https://www.clover.com/en-US/help/clover-reports-overview) |
| **Discounts report** | Discounts applied across orders, type, revenue impact | UNCONFIRMED | Analytics | same |
| **Order types report** | Sales by order type — appointment, in-store, online, delivery | UNCONFIRMED | Analytics | same |
| **Gift cards report** | Gift card sales, redemptions, unused balances | UNCONFIRMED | Analytics | same |
| **Kitchen operations report** | KDS metrics: item volume, prep/fulfilment times, station activity | Requires Kitchen Display System | Analytics | same |
| **Guest count report** | Daily guest volume, average turn time by party size, average spend per table | UNCONFIRMED | Analytics | same |
| **Refunds report** | All refund transactions; filter by date, employee, device, tender, amount band | UNCONFIRMED | Analytics | [refunds](https://www.clover.com/en-US/help/run-refunds-report) |
| **Peer insights report** | Anonymised comparison against similar local businesses, refreshed daily | "a standard feature in Clover, as with all other Clover reports" — no opt-out, no upsell | Analytics | [peer group](https://www.clover.com/en-US/help/compare-to-peer-group) |
| **Requested reports** | Queue for any report over a 3-month range; emailed link; viewable 7 days | UNCONFIRMED | Analytics | [item sales](https://www.clover.com/en-US/help/run-or-request-the-item-sales-report) |
| **Reporting app** (on-device) — Sale Overview, Employee Sales, Item Sales, Discounts, Taxes; **Condensed Report** or **Full Report** | On-device report suite, printable (Station, Flex, select Mini) | UNCONFIRMED | **Register document** (printed at device) | [cash log](https://www.clover.com/en-US/help/run-cash-log-report) |
| **Cash Log app** (on-device) | Date, event, amount, reason, employee — printable | UNCONFIRMED | **Register document** | same |

**Names that could NOT be verified — UNCONFIRMED:** "Payments report", "Revenue report", "Shifts report", "Tips report", "Insights" (as an app), "Inventory" (as a report). Nearest real equivalents are the Tender and card types report, Revenue Item Sales report, the Shifts app, and the Show Tips Breakdown column inside Sales Overview.

**Register documents — Clover uses no X/Z terminology anywhere.** The Cash log report records "all cash transactions and cash drawer activities". On-device, the Cash Log app prints date/event/amount/reason/employee, and the **Reporting app** is the closer analogue of a Z — pick a report, pick a range, pick Condensed or Full, print. The Sales Overview Full report carries **Cash Deposit** and **Cash Adjustment** sections, the latter "made during a reporting period, typically at the end of a shift or the end of the day", each drilling into the Cash Log.

**Clover has no shift/Z printed close-out document.** A dedicated Clover shift report is **UNCONFIRMED** — the Shifts app handles clock-in/out, but no help page documents a printed shift report.

**Custom reports — yes.** "Customizable business reports": *Reports > Sales report* → pick a report type ("sales, employee performance, transaction history, or others") → apply Date Range / Employee / Order type / Source of order / Tender type / Device → **Generate**. Under 3 months opens immediately; over 3 months becomes a **Request a Report** job delivered by email ([customizable reports](https://www.clover.com/en-US/help/use-customizable-business-reports)). **No plan tier stated** — the only prerequisite is the Access Reporting permission.

**API:** no dedicated reporting API. The REST API "enables access to detailed transaction data", requiring read payment permission ([transaction data](https://docs.clover.com/dev/docs/working-with-transaction-data-rest)); reports must be assembled from orders/payments/inventory/employees/shifts. Note the hardest real gate in Clover's model: **Payments / Payments Plus plans work only with apps that "do not require order or item-level data"**.

**Export:** Print, or **Options > Export**. Refunds exports **CSV**; item sales offers Accounting Sync (QuickBooks Online), Print and Export. Emailed reports exist **only** as the >3-month "Requested report" flow. **No scheduled/recurring delivery is documented — UNCONFIRMED.** History depth: **5 years, one year at a time**.

**Offline:** offline is a **payments feature only** — device-specific, on by default on Station/Station 2/Mini/Flex/Mobile, holding payments up to **7 days**, excluding EBT and gift cards ([offline payments](https://www.clover.com/en-US/help/set-up-offline-payments)). **What reporting is viewable offline is UNCONFIRMED** — no Clover page addresses it; the dashboard is cloud-only by construction.

---

## 5. Toast

**Plans:** **Starter Kit ($0/mo)**, **Point of Sale (from $69/mo)**, **Build Your Own (custom)** ([pricing](https://pos.toasttab.com/pricing)).

**The analytics add-on's exact name is the "Restaurant Management Suite"** (retail: "Store Management Suite"), in **Essentials / Pro / Enterprise** tiers. The pricing row reads verbatim: *"Restaurant Management Essentials: Scheduled price and menu publishing, **advanced reporting**, partner integrations"* and *"Restaurant Management Pro: Essentials, plus multilocation management and **analytics API**"*. Both are add-ons on Point of Sale and Build Your Own, and **blank on Starter Kit**. Toast confirms: *"Toast Reporting is part of Toast's Restaurant Management Suite"* ([reporting](https://pos.toasttab.com/products/reporting)). "Toast Analytics" and "Sales Insights" are **not** real names; xtraCHEF is a separate add-on suite.

> **The critical Toast finding: the ~40 base reports are gated by user permissions, not plan tier.** Toast's own troubleshooting page attributes blocked report access solely to permissions, product boundaries and browser cache — no entitlement or paid-tier requirement appears ([why can't I access a report](https://support.toasttab.com/en/article/Why-cant-I-access-a-report-in-Toast-Web)). Only a short list of cross-location/benchmarking reports needs the paid suite.

Canonical list: *"over 40 individual reports"* across nine categories ([getting started](https://support.toasttab.com/en/article/Getting-Started-with-Analytics-and-Reports)).

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Sales Summary** | "detailed sales data for your chosen date range"; real-time tiles | Permission 4.1 Sales Reports | Analytics | [Sales Summary](https://support.toasttab.com/en/article/Sales-Summary-Report) |
| **Sales Analytics** | Sales trends over time; compare across dates or locations | Permission 4.1 | Analytics | [Sales Reports Overview](https://support.toasttab.com/en/article/Sales-Reports-Overview) |
| **Sales Breakdown** | Stacks two metrics against each other (dining options, revenue centres, discounts, service areas/types) | No tier | Analytics | same |
| **Orders** / **Order Details** | Every order in range, itemised; per-order detail pop-up | No tier | Analytics | same |
| **Paid in Total** / **Deposit Sales Collected** | Payments in range for orders outside it, and the inverse | No tier | Analytics | same |
| **Location Breakdown** / **Group Sales Overview** | Sales split by location; cross-location comparison consolidating Franchise Fee percentages | Multi-location | Analytics | same |
| **Location Overview** | Net Sales, Gross Sales, Orders, Guests, Labor Cost per location; 15 columns | **Restaurant Management Essentials/Pro/Enterprise** | Analytics | [Location Overview](https://support.toasttab.com/en/article/Restaurant-Management-Location-Overview-Report) |
| **Benchmarking — Lite** | Peer comparison: 30 days, own state, no item-level insight | All customers on POS & Restaurant Operations suite | Analytics | [Benchmarking](https://support.toasttab.com/en/article/Toast-Benchmarking-Overview) |
| **Benchmarking — Essentials** | Any period, YoY, service performance, item-level menu insight, richer peer groups | **Restaurant Management Suite** | Analytics | same |
| **Product Mix (PMIX)** | Sales by menu, menu group, item; expandable to modifiers/sizes/subgroups; no date-range limit | Permission 4.2 Menu Reports; *not available to Toast Retail, MLM or xtraCHEF customers* | Analytics | [PMIX](https://support.toasttab.com/en/article/Product-Mix-PMIX-Report-Overview) |
| **Menu Breakdown**, **Top Menu Items**, **Top Menu Groups**, **Top Modifiers**, **Item Details**, **Modifier Details**, **Food Waste Breakdown** | Menu performance cuts | Permission 4.2 | Analytics | [getting started](https://support.toasttab.com/en/article/Getting-Started-with-Analytics-and-Reports) |
| **86 Report** | Items out of stock, plus items at/below a threshold you set | Permission 4.2 | Analytics | [Menu Report Overview](https://support.toasttab.com/en/article/Menu-Report-Overview-1492794696577) |
| **Labor Summary** | Restaurant-wide and employee-level hours and pay; includes Payroll Export. **Also on the POS device** | Permission 4.3 Labor Reports | Analytics | [Labor Reports](https://support.toasttab.com/en/article/Labor-Reports-Overview) |
| **Labor Cost Breakdown** | Labor spend by job title, employee, hour, day, week; labor % and sales per labor hour | Permission 4.3 | Analytics | same |
| **Employee Productivity** (the server checkout report) | Sales, tips, guests served, turn times per employee | Permission 4.3 | Analytics | same |
| **Hourly Sales** | Sales in 15-minute intervals plus labor cost as share of net sales | Permission 4.3 | Analytics | same |
| **Shifts** (Closed Shifts / Open Shifts) | Clock times, cash and tip details | Permission 4.3 | **Register document** | same |
| **Time Entry Management** / **Time Entry Reporting (legacy)** / **Time Entry Audits** | Itemised shifts and punch editing; full audit trail of changes | Permission 4.3 | Analytics | same |
| **Pooled Tips**, **Break Entries**, **Break Adherence**, **Manager Swipe Card Log** | Tip pooling; breaks taken/missed; live break eligibility; manager card registrations | Permission 4.3 | Analytics | same |
| **Payments**, **Payout Overview**, **Reconciliation**, **Processing Statements**, **Chargebacks**, **Settled Deposits Daily Breakdown**, **Deposits Total Overview**, **Daily Card Activity**, **House Accounts Transactions**, **Gift Card Balances / Transactions**, **Inactive Gift Cards**, **Failed eGift Card Delivery**, **Billing & Invoices** | The Payments category | Drawer/deposit reports need 8.1 Financial Accounts + 1.7 Cash Drawer Access | Analytics | [getting started](https://support.toasttab.com/en/article/Getting-Started-with-Analytics-and-Reports) |
| **Cash Drawer Overview**, **Drawer History**, **Cash Activity Audit**, **No Sale** | Drawer state, historic drawers (with Update Entries), audit of cash events, no-sale opens | 8.1 + 1.7 | **Register document** | same · [Shift Review](https://support.toasttab.com/en/article/Shift-Review-Overview) |
| **End of Day** | Cash & Loss Management category report | No tier | **Register document** | [getting started](https://support.toasttab.com/en/article/Getting-Started-with-Analytics-and-Reports) |
| **Voided Orders**, **Voided Payments**, **Removed Items**, **Discounts**, **Refunds**, **Unpaid Orders**, **Tax Exempt**, **Offline Payments**, **Loyalty Misuse**, **Check Sequence Log** | Loss-management cuts | No tier | Analytics | same |
| **Accounting Overview**, **Accounting By Day**, **Accounting By Location**, **General Ledger Accounts** | Accounting category | No tier | Analytics | same |
| **Tickets by Fulfillment**, **Tickets By Hour**, **Ticket Details** | Kitchen operations | Requires KDS | Analytics | same |
| **Guest Feedback**, **Guest Summary**, **Guest Credits**, **Rewards Accounts**, **Rewards Transactions**, **Fundraising Breakdown** | Marketing | Requires Toast Loyalty or digital receipt enrollment | Analytics | same |
| **Guests Report**, **Bookings Report** | Booking report is "a feature of Toast Tables" | Bookings requires Toast Tables | Analytics | same |
| **Weekly Overview** (Reports dashboard landing page) | Sales, labor, guest counts, menu performance for the week; refreshes hourly; compare to prior week / same week last year / two years ago | No tier | Analytics | [dashboard](https://support.toasttab.com/en/article/How-to-Use-the-Toast-Reporting-Dashboard) |
| **Z Report** | See below | No tier stated | **Register document** | [Z Report](https://support.toasttab.com/en/article/Close-Out-Day-Z-Report-Auto-Capture) |
| **Service Report** | "the same data as the Z Report, broken down by daypart (service period)" | No tier stated | **Register document** | same |
| **Shift Review** | See below | No tier stated | **Register document** | [Shift Review](https://support.toasttab.com/en/article/Shift-Review-Overview) |

**Names that do NOT exist as such — UNCONFIRMED:** "Net Sales Summary", "Menu Item Sales", "Employee Performance" (real: **Employee Productivity**), "Cash Entries" (real: **Cash Activity Audit** / **Drawer History**), "Voids and Comps" (real: **Voided Orders** / **Voided Payments** / **Removed Items**), "Time Entries" (real: **Time Entry Management**), "Sales Categories", "Day Parts", "Sales Exceptions", "Daily Summary". Sales categories and revenue centers exist as Z Report *sections* and Sales Breakdown *dimensions*, not standalone reports.

**Register documents — Toast uses "Z Report" explicitly, and does NOT use "X-report".**

The Z Report is *"a sales summary that can be printed from an in-store receipt printer using the Close Out Day function."* Critically: **"Printing the Z Report does not turn the day over. The data updates in real time as sales occur."** It can be run any time and defaults to the prior seven days. Configurable sections: sales categories, revenue centers, sales & taxes summary, payment details, server tip outs, total voids, total removals, total discounts, credit card breakdown, other payments breakdown, labor, employee over/short, employee signature, pay out breakdown, deposit summary, Deliver figures. Figures are tax-inclusive for IE/UK merchants and net-of-tax for US/CA.

**Shift Review** is *"an optional end-of-day task that employees complete before clocking out"*, giving *"a summary of their sales transactions, tips earned, and any cash to turn in or collect."* Five steps: close checks → declare cash tips → reconcile cash and tips → close cash drawers → clock out. Drawer close-out asks for **Cash actual** and returns **Cash over / Cash short / No difference**; variance beyond a threshold requires manager approval. Permission 3.17 **Cash drawers (Blind)** hides the expected amount. Restricted to the current business week; older shifts are corrected via *Reports > Cash and Loss Management > Drawer History > View > Update Entries*.

Toast is explicit that Close Out Day and cash-drawer close-out are **separate features**.

**Custom reports:** no user-facing builder. Customisation is per-report — a filter bar (time frame, hours, employees, location, dining option, revenue centre, service area) and a **Show/hide columns** control with Restore. Genuinely custom reporting is the **analytics API**, and that is the clearest paid gate in either vendor: *"An active subscription to Toast Restaurant Management Suite Pro or higher"*, plus permissions 4.1, 4.2, 4.3 and 8.4 across every location. It gives "read-only access to a specialized set of reporting and operational data… narrowly focused, high-value data on sales, checks, labor, menus, payouts, and guests" ([analytics API](https://doc.toasttab.com/doc/devguide/apiAnalyticsAccessOverview.html)).

**Export:** three methods, with "Not all reports support every export method" — (1) **Email Export** to comma-separated addresses, "the file format is .xls or .csv, depending on the report"; (2) **Download**; (3) **Print to PDF** via the browser. Filtered column exports are unavailable for Cash Drawer History, Voided Orders and No Sale. XLS exports produce "one file with multiple sheets". PMIX has no automatic scheduling.

**Scheduled delivery is where Toast clearly wins:** an **automatic nightly email** of key metrics, configured at *Toast account > Notifications & alerts > Contact settings* via named Email Lists mapped to fixed Email Types (including Daily/Weekly Performance Summaries). Recipients must be active employees with Sales Report permissions. **There is no custom email digest.**

**Offline — reports and Shift Review are explicitly OFF; cash drawer and printing stay ON.** Verbatim: *"Reports do not include data from offline devices until they reconnect and sync."* Shift Review is *"Unavailable until devices reconnect"*. What survives: *"Printing receipts and opening cash drawers should be unaffected by connection disruptions"*, with manual drawer opening at *Device Menu > Cash Management > Cash Drawers*. Offline mode engages 40 seconds after connectivity loss. **Do not tap Capture on Close Out Day while offline** — authorisations capture automatically on reconnect ([offline mode](https://support.toasttab.com/en/article/Using-Toast-in-Offline-Mode)).

---

## 6. Loyverse

**Plans** ([pricing](https://loyverse.com/pricing)): POS app, Back Office, Dashboard, KDS and CDS are free. Three add-ons:

| Add-on | Price | Billed | Vendor description |
|---|---|---|---|
| **Unlimited sales history** | €5/mo or €50/yr | per store | "View sales reports for any time period and export data to spreadsheets." |
| **Employee management** | €5/mo or €50/yr | **per employee** | "Manage access rights, track timecards and sales by employee." |
| **Advanced inventory** | €25/mo or €250/yr | per store | "Create purchase orders, view inventory valuation report and manage stock." |

> **The report-gating add-on is not "Advanced Inventory" — it is "Unlimited sales history".** Every sales report is free but **capped at the last 31 days, with export disabled entirely**.

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Sales summary | Gross sales, refunds, discounts, net sales, gross profit + chart + per-day table | FREE, 31 days; longer range or export → Unlimited sales history | Analytics | [help](https://help.loyverse.com/help/sales-summary-report-back-office) |
| Sales by item | Per-item SKU, category, sold, refunded, discounts, net sales, COGS, gross profit, margin, taxes | FREE, 31 days | Analytics | [help](https://help.loyverse.com/help/sales-item-report-back-office) |
| Sales by category | Category performance over a period | FREE, 31 days | Analytics | [help](https://help.loyverse.com/help/sales-report-categors) |
| Sales by employee | Per-employee sales | FREE report, but effectively empty without Employee management (see note) | Analytics | [help](https://help.loyverse.com/help/exporting-data-from-loyverse-account) |
| Sales by payment type | Sales split by payment method | FREE, 31 days | Analytics | same |
| Sales by modifier | Sales split by modifier | FREE, 31 days | Analytics | same |
| Discounts | Sales where discounts were applied | FREE, 31 days | Analytics | same |
| Taxes | Tax totals by rate | FREE, 31 days | Analytics | same |
| Receipts | Every transaction; detail shows items, taxes, discounts, payment method, device, employee, customer | FREE | Analytics | [help](https://help.loyverse.com/help/receipts-section-reports-back) |
| Receipts by item | Receipt lines flattened to item level (export only) | FREE, export gated | Analytics | same |
| **Shifts** | POS name, open/close times, expected and actual cash, cash difference; drill-in shows pay ins, pay outs, cash transactions | **FREE** | **Register document** | [help](https://help.loyverse.com/help/shift-management-loyverse-pos) |
| **Shift summary report** (export) | Shift totals export | FREE | **Register document** | same |
| **Pay ins and payouts report** (export) | Cash in/out movements | FREE | **Register document** | same |
| Notification About Low Stock | Low stock alerts | FREE | Analytics | [reports index](https://help.loyverse.com/help/reports) |
| Negative Stock Alerts | Negative stock warnings | FREE | Analytics | same |
| Inventory history | "a complete log of all inventory changes, including transfers, purchase orders, and adjustments" | **Advanced inventory** | Analytics | [help](https://help.loyverse.com/help/advanced-inventory-management) |
| Inventory valuation | Total inventory value, total retail value, potential profit, margin | **Advanced inventory** | Analytics | [help](https://help.loyverse.com/help/inventory-valuation-report) |
| Purchase Orders / Transfer Orders / Stock Adjustments / Inventory Count / Production | Inventory documents, exportable PDF or CSV | **Advanced inventory** | Analytics (documents) | [help](https://help.loyverse.com/help/advanced-inventory-management) |
| Total Hours Worked | Total working hours per employee for a period | Employee management (per pricing page) | Analytics | [help](https://help.loyverse.com/help/time-clock) |
| Timecards | Clock-in/out records; editable | Employee management | Analytics | same |
| Purchase history of a registered customer | Customer's past purchases (POS and Back Office) | FREE | Analytics | [reports index](https://help.loyverse.com/help/reports) |
| Loyverse Dashboard (mobile app) | "Instant access to your store's sales analytics and inventory" | FREE | Analytics | [pricing](https://loyverse.com/pricing) |

> **Sales-by-employee gate.** No help page gates the *report*. But on a free account only the owner exists as an employee; creating more requires Employee management, and cancelling it deletes "All employees except the owner" ([help](https://help.loyverse.com/help/how-use-paid-services-loyverse-pos)). The report is free but empty without the add-on. Formal gate **UNCONFIRMED**.

**Register documents — Loyverse literally uses both terms.** [Shift report help](https://help.loyverse.com/help/shift-report-sales-summary-pos) calls the open shift the **"current shift report (X-report)"** and the closed one the **"closed shift report (Z-report)"**.

- Opening float: "the amount of cash in the drawer at the start of the working period", entered before **Open shift**.
- **Pay In** ("supplying change") / **Pay Out** ("removing cash outside of a refund or sale") under Shift → Cash management.
- **Expected cash amount** "calculated from cash sales, refunds, and pay in/pay out operations"; **Actual cash amount** "counted physically"; difference shown automatically.
- Expected cash is hidden from cashiers without the **View shift report** right.
- X-report prints on demand and "does not close the shift"; on close the **Z-report "will be automatically printed on the connected receipt printer."**
- **Tier: FREE.** Only requires Settings → Features → Shifts and a receipt printer.

**Custom reports:** none. Column choice on Sales summary / Sales by item is the extent. **API:** Loyverse API v1.0 at `https://api.loyverse.com/v1.0/` covering Receipts, Shifts, Inventory, Items, Customers, Employees, Stores, Taxes, Payment types, Webhooks; read-mostly — "you can get only paid receipts from Loyverse API". Whether it needs a paid add-on: **UNCONFIRMED**.

**Export:** **CSV only** for sales/shift/inventory reports; **PDF or CSV** for Advanced Inventory documents. Export of sales reports requires Unlimited sales history. Scheduled/emailed reports: **UNCONFIRMED**.

**Offline** ([help](https://help.loyverse.com/help/offline-work-of-pos)): sales work, and **"Shifts can be managed without interruption."** Receipts save locally flagged "Unsynced". Refunds are disabled, customers cannot be created or edited, stock levels and low-stock alerts are not shown, integrated card terminals do not work. Shift history shows only shifts from the current device. Back Office analytics is web-based, so unavailable — **but the on-device shift report / X-report / Z-report remains.**

---

## 7. Zettle by PayPal (now branded **PayPal Point of Sale**)

**Plans** ([pricing](https://zettle.com/gb/pricing)): **no subscription tiers exist** in the UK. "No contracts or recurring fees." **There is no Zettle Go vs Pro vs Plus split.** Every report below is **FREE**.

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Sales data (Go app) | "sales amount, sales, returns, fees, average sale, cash, redeemed gift cards" | FREE | Analytics | [about reports](https://www.zettle.com/gb/help/articles/1084803-about-reports) |
| Top selling products (app) | Best sellers for a date range with per-product sales | FREE | Analytics | same |
| Reports overview (my.zettle.com) | "summary of your daily, weekly and monthly sales" | FREE | Analytics | same |
| ↳ Big numbers | Total sales, number of sales, average sales amount | FREE | Analytics | same |
| ↳ Past days/weeks/month sales summary | Totals for the past 20 days/weeks/months | FREE | Analytics | same |
| ↳ Sales and payments overview | Sales/refunds by channel, payment methods, total fees | FREE | Analytics | same |
| ↳ Sales by hour | "which hours were the best for sales" | FREE | Analytics | same |
| ↳ Top selling products | Ten best sellers — name, variant, sold quantity, returns, total | FREE | Analytics | same |
| Sales details | "your sales, payments and staff performance", vs last year | FREE | Analytics | same |
| ↳ Sales by month / by day / by hour | Time-series breakdowns | FREE | Analytics | same |
| ↳ Payments and fees | Collected payments excl. fees and refunds; separate cash table | FREE | Analytics | same |
| ↳ Redeemed gift cards | Total from redeemed/refunded gift cards | FREE | Analytics | same |
| ↳ Sales by sales channels | Point of sale, Payment Links, Sent invoices, E-commerce, SDK | FREE | Analytics | same |
| ↳ VAT | "collected VAT per VAT rate and what your sales are excluding and including VAT" | FREE | Analytics | same |
| ↳ Staff | "how much they sell for and their number of sales" | FREE | Analytics | same |
| Sales by product | "name, variant, category, sold quantity, returns, discounts and total" | FREE | Analytics | same |
| Sales by category | Performance of configured categories | FREE | Analytics | same |
| Gift card report | "quantity and amount sold, returned, redeemed, refunded, expired, and reverted" | FREE | Analytics | same |
| Account statement | Account movements | FREE | Analytics | [help](https://www.zettle.com/gb/help/articles/2168618-account-statement) |
| **X-dagrapport (X-report)** | SE/DK/DE/IT/FR/NO only. "sales from a cash register since the last time it was closed" | **PAID cash-register subscription** | **Register document** | [SE help](https://www.zettle.com/se/help/articles/1462951-att-anvanda-kassaregistret) |
| **Z-dagrapport (Z-report)** | Auto-generated on register close; total sales and sum of returns; cumulative figures non-resettable; stored 7 years; owner-only | **PAID cash-register subscription** | **Register document** | same |
| **TSE / DSFinV-K Exporte** | Germany only. Fiscal audit exports, DSFinV-K v2.3 | German Kassensystem feature | **Register document (fiscal)** | [DE help](https://www.zettle.com/de/help/articles/7429308-tse-und-dsfinv-k-exporte) |

**Register documents — in the UK: none.** An enumeration of the entire GB help centre (97 articles) found **no article for cash management, cash drawer, shift, till close, X-report or Z-report**. The only cash article is "Taking cash payments".

**Outside the UK it is a separate paid product.** Sweden: **"PayPal Point of Sale kassaregister kostar 299 kronor i månaden"** — 299 SEK/month including one register, +99 SEK/month per additional register ([SE pricing](https://www.zettle.com/se/help/articles/1475646-pris-och-prenumeration)). The X-dagrapport is on-demand and mid-shift; staff "can only see this type for their own ongoing session". The Z-dagrapport is automatic on close, non-resettable, kept 7 years, owner-only, with a journal-memory export.

**So there is no opening float, paid in/out, expected-vs-counted or drawer difference anywhere in the standard app.** That is the single biggest functional gap in Zettle's reporting.

**Custom reports:** none — filters only. **APIs** ([developer.zettle.com](https://developer.zettle.com/docs/api)): Purchase, Finance, Product Library, Inventory, OAuth. Cost/eligibility **UNCONFIRMED**.

**Export:** my.zettle.com offers **PDF or Excel**, plus "Raw data Excel"; **no CSV option is mentioned**. The Go app gives a printed overview and a PDF — "There is no support for Excel exports in the Go app." Scheduled/emailed reports **UNCONFIRMED**. Staff accounts cannot access sales or product reports and see only their own sales.

**Offline:** the standard app has **no offline mode** — offline payments are "endast tillgängliga i utvalda Point of Sale-appar (POS) som har integrerat PayPal Point of Sale SDK" and "inte tillgänglig i PayPal Point of Sale-standardappen" ([SE help](https://www.zettle.com/se/help/articles/7102116-offlinebetalningar)). Offline reporting **UNCONFIRMED**; reports live on my.zettle.com, so assume none.

---

## 8. SumUp

**Plans.** Not a single ladder: POS Lite is *hardware*; POS Free and POS Plus are *plans*; POS Pro is a *separate iPad product with its own back office*.

| Tier | Price | Source |
|---|---|---|
| **POS Free** | $0/mo (US), "Free" (UK) | [fees](https://www.sumup.com/en-us/credit-card-processing-fees/) |
| **POS Plus** | **£39/mo, 12-month contract, 30-day trial** (UK) / $49/mo (US) | [what's POS Plus](https://help.sumup.com/en-GB/articles/44f1NCVhjK4InnHQI5wnCZ-whats-pos-plus) |
| **POS Pro** | Per-iPad licence; hardware "from £500"; US "from $99/month" | [what's POS Pro](https://help.sumup.com/en-GB/articles/5fOCYhdoiqpbTr66ULfDdq-whats-pos-pro) |

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Sales summary (dashboard) | Sales & revenue chart, trends, totals, averages, card payments, refunds, last payout and fees, receivable balance, best sellers | FREE | Analytics | [help](https://help.sumup.com/en-GB/articles/1oU691QMtpLF048hJvaEIS-article-sales-summary) |
| Sales reports | Items sold minus refunds, cash vs card, tax category | FREE | Analytics | [help](https://help.sumup.com/en-GB/articles/1K6tiRe1quFjBtGgGSs21e-reports) |
| Revenue reports | Total sales, refunds, tips, discounts; then Sales summary / Tax summary / Payment methods / Employee activity / Category / Gift Cards | FREE | Analytics | [help](https://help.sumup.com/en-GB/articles/7zi3nFMMLXYh7tZrFmrHM1-article-my-revenue-report) |
| Payout reports | Card transactions paid out, payout date, fees | FREE | Analytics | [help](https://help.sumup.com/en-GB/articles/1K6tiRe1quFjBtGgGSs21e-reports) |
| Fee invoices | Monthly transaction-fee total | FREE | Analytics | same |
| Payments reports | Paid-out, scheduled, refunded transactions and chargebacks | FREE | Analytics | same |
| Transaction reports | All transactions — card, cash, refunds; method, status, card type | FREE | Analytics | same |
| Online Store reports | Online orders, sales, top sellers | FREE | Analytics | same |
| Items reports | Item sales summary, trends; Items / Categories / Modifiers tabs | FREE — **except Profit and Margin columns, which are POS Plus** | Analytics | same |
| Discount reports | "summary of all sales where discounts were applied" | FREE | Analytics | same |
| Insights (app / Register / POS Lite) | Sales total, items sold, orders, tips, refunds, top 5 sellers, busiest hours, most-used payment methods | FREE | Analytics | [help](https://help.sumup.com/en-GB/articles/7pCkBDH2rQwoZJgmBc8Ddt-sales-insights) |
| **X Report (All Staff)** | "live snapshot of your till… sales, payments, and cash from the moment the till was opened", without closing it | **POS Plus** | **Register document** | [X reports](https://help.sumup.com/en-GB/articles/4jcJqP7DXEeCmeTnZeT7In-x-reports) |
| **Employee X Report** | Only the generating employee's activity; prints their nickname | **POS Plus** | **Register document** | same |
| **Z reports** | Generated by till-close reconciliation; browsable and reprintable under the "Z reports" tab | **POS Plus** | **Register document** | [till management](https://help.sumup.com/en-GB/articles/5bJCay0Xfpqgb76hHHOjE6-article-whats-till-management) |
| **Cash report** | "all the deposits, withdrawals, and discrepancies for each cash drawer session… the expected cash balance, and a breakdown of all cash transactions" | **POS Plus** | **Register document** | [cash management](https://help.sumup.com/en-GB/articles/5tfuRSzk9cd2IYBQSeQnnx-set-up-the-cash-management) |
| **Daily / Monthly / Yearly fiscal archives** | .zip of all sales, refunds, payments and daily totals per period, as .csv | **FREE** — "an easy and cost-free way to download the necessary documents" | **Register document (fiscal)** | [fiscal exports](https://help.sumup.com/en-GB/articles/6qGR5QlZEMDz2ATvz9Rurg-download-your-POS-fiscal-exports) |
| **Cashbook history** | Cash movements for a period, in .csv | FREE | **Register document** | same |
| **The X report of the current day** | .zip of the day's sales, refunds, payments, totals in .csv | FREE | **Register document** | same |
| *POS Pro back office:* **Current drawer** | How long a till has been open, total orders and value, cash currently available, live across stores | **POS Pro** | **Register document** | [POS Pro reporting](https://help.sumup.com/en-GB/articles/1Mk2eK4HMACEr6q7JRHKKh-track-the-performance-of-my-business) |
| *POS Pro:* **Drawers** | When drawers opened/closed, total sales values and customers for each | **POS Pro** | **Register document** | same |
| *POS Pro:* **Accounting** | Total tax value of sales and tax-rate breakdown | **POS Pro** | Analytics | same |
| *POS Pro:* **Product sales** | Units sold plus cost, revenue and profit per item | **POS Pro** | Analytics | same |
| *POS Pro:* **Orders** | Per-order products, total value, full payment breakdown | **POS Pro** | Analytics | same |
| *POS Pro:* **Tips** | Total tips plus per-tip breakdown | **POS Pro** | Analytics | same |
| *POS Pro:* **Payments** | Payment methods used, payment total, order creation time | **POS Pro** | Analytics | same |

**Register documents — SumUp uses "X Report" and "Z Report" literally and heavily.**

POS Plus till management: opening float via "Enter amount" in the Open till box; **"Counted"** field under "Cash movements summary"; **Put cash in / Take cash out** with a reason ("Completed deposits or withdrawals can not be edited for regulatory reasons"); "the difference with the expected cash is automatically calculated". It reconciles *all* payment methods, not just cash. SumUp distinguishes the two tools: cash management records cash in/out; **till management "lets you track and record all payments processed"**.

The X Report is on-demand and unlimited — "no limit and no extra costs to generate one" — role-scoped so cashiers see only their own, and available on SumUp Register, SumUp Terminal, POS Lite and the Business app. Explicit fiscal disclaimer: **"Unlike the Z Report, the X Report is an operational tool and carries no fiscal number."**

POS Pro uses a separate implementation: "Draw management" → Close drawer / Close session, where "the daily X report containing info on the day's takings will print automatically".

SumUp's blanket position: "SumUp's payout report is not to be considered a fiscal document" and "SumUp is not responsible for your fiscal compliance".

**Custom reports:** none. The nearest thing is the **Download center**, which lets you pick report type, timeframe and format. **API** ([developer.sumup.com](https://developer.sumup.com/api)): Checkouts, Readers, Customers, Transactions, Payouts, Receipts, Members, Memberships, Roles, Merchants. **There is no "reports" endpoint, and no endpoint for POS items, drawers, X/Z reports or cash sessions.** API cost **UNCONFIRMED**.

**Export:** Payments report **PDF or XLS**; payouts **PDF**; fiscal archives and cashbook **.zip of .csv**; revenue report **PDF**. POS Pro has an Export button, format **UNCONFIRMED**. **SumUp is the only one of the three free-tier vendors with scheduled emailed reports** — payout reports "sent directly to your email daily or monthly" via Email preferences. Caveat: "Daily reports are only available for past dates, not the current day."

**Offline: UNCONFIRMED.** An enumeration of the SumUp help sitemap found **no article** covering offline mode or offline reporting.

---

## 9. Epos Now

> **Documentation warning.** `support.eposnow.com` is a Salesforce Experience Cloud site that serves only a JS shell; its sitemap redirects to a login and article slugs are not discoverable from the topic index. Quotes below are from live server-rendered article responses, but several indexed articles could not be resolved at all. **Epos Now publishes no pricing page** — [eposnow.com/us/pricing](https://www.eposnow.com/us/pricing/) is a quote-request form. The historic "Standard / Premium" naming **could not be confirmed on any vendor page**, and **no reporting article mentions a plan or tier**.

Epos Now gates reporting by **app install** and **feature module**, not by tier: the Payroll report needs "the free Payroll app… installed from the Epos Now Apps section"; End of Day gratuity totals are "only available if you use the Gratuity app"; Pay Outs "only available if you use the Lottery app"; the Location Area filter "will only be available if you use the Multi-Site Manager feature".

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| Time Intervals | Sales by date and time; filter by location, device, staff, wet/dry | UNCONFIRMED | Analytics | [Sales Report](https://support.eposnow.com/s/article/Reporting-Sales-Report?language=en_US) |
| Time Period | Sales by day | UNCONFIRMED | Analytics | same |
| Time Comparisons | Compare sales by date | UNCONFIRMED | Analytics | same |
| Sales by Product | Sales by product | UNCONFIRMED | Analytics | same |
| Employees | Sales by employee | UNCONFIRMED | Analytics | same |
| Locations | Sales by location | UNCONFIRMED | Analytics | same |
| Size | Sales by size (sizes/variants only) | Requires sizes/variants | Analytics | same |
| Misc Products | All misc products sold | UNCONFIRMED | Analytics | same |
| Wet and Dry | Products split wet vs dry | UNCONFIRMED | Analytics | same |
| Covers | Sales by covers (table plan only) | Requires table plan | Analytics | same |
| Promotions | Sales by promotion | UNCONFIRMED | Analytics | same |
| Brands | Sales by brand | UNCONFIRMED | Analytics | same |
| Customer Types | Sales by customer type | UNCONFIRMED | Analytics | same |
| Reporting Categories | Sales by reporting category | UNCONFIRMED | Analytics | same |
| Till Categories | Sales by till category | UNCONFIRMED | Analytics | same |
| Eat In / Eat Out | Sales split eat-in vs eat-out | UNCONFIRMED | Analytics | same |
| Dining Options | Eat in, takeaway, delivery | UNCONFIRMED | Analytics | same |
| Multiple Choice Products | Sales by multiple-choice product | UNCONFIRMED | Analytics | same |
| Bookkeeping | "a full breakdown of your transactions including the date and time" | UNCONFIRMED | Analytics | [Accounting](https://support.eposnow.com/s/article/Accounting?language=en_US) |
| Daily Tax / Monthly Tax / Quarterly Tax / End of Year Tax | Tax summaries by period | UNCONFIRMED | Analytics | same |
| Payroll | "staff wages and their hours worked" | **Requires the free Payroll app** | Analytics | same |
| Refunds | All completed refunds | UNCONFIRMED | Analytics (audit) | [Auditing](https://support.eposnow.com/s/article/Auditing?language=en_US) |
| Discounts | All discounts applied to products and transactions | UNCONFIRMED | Analytics (audit) | same |
| No Sales | "all No Sales… processed via the Front Till" with reason, date, time, staff, device | UNCONFIRMED | Analytics (audit) | same |
| Void Lines | Items deleted from the Front Till before processing | UNCONFIRMED | Analytics (audit) | same |
| Stock Levels | "a live report which updates each time an item is sold" | Requires stock tracking | Analytics | [Stock Reports](https://support.eposnow.com/s/article/Stock-Reports?language=en_US) |
| Stock Warnings | Products requiring re-order | Requires stock tracking | Analytics | same |
| Stock Discrepancies | Discrepancies in stock movements and stock takes | Requires stock tracking | Analytics | same |
| Non-Selling Stock | List of non-selling stock | Requires stock tracking | Analytics | same |
| Stock History | Historic stock levels — "can only be reviewed day by day" | Requires stock tracking | Analytics | same |
| Stock Changes | Stock level changes between two dates | Requires stock tracking | Analytics | same |
| **End Of Day** | Per-till close record — see below | UNCONFIRMED | **Register document** | [End of Day](https://support.eposnow.com/s/article/End-of-day-reports?language=en_US) |
| Tenders | Transactions by tender: qty, averages, total, % of turnover | UNCONFIRMED | Register-adjacent (Banking) | [Tenders](https://support.eposnow.com/s/article/Tenders-Report?language=en_US) |
| Transaction Report | Completed transactions for a date range with item detail | UNCONFIRMED | Analytics | [Transaction Report](https://support.eposnow.com/s/article/Transaction-Report?language=en_US) |
| Classic Transaction Reports | Legacy variant | UNCONFIRMED | Analytics | [Classic](https://support.eposnow.com/s/article/Transaction-Reports?language=en_US) |
| Completed Transactions | "real-time information on your business" | UNCONFIRMED | Analytics | [Our reports explained](https://support.eposnow.com/s/article/Our-reports-explained?language=en_US) |
| Void Report / Locations Report / Supplier Report / Tronc / Tipping Report / Sales by Product Report / Time Comparison Report / Reporting Categories Report | Titles verified live; bodies not extracted | UNCONFIRMED | Analytics | Epos Now KB |
| Home Page (dashboard) | Three sales metrics vs prior week, sales overview graph, top-10 products by quantity | UNCONFIRMED | Analytics | [Home Page](https://support.eposnow.com/s/article/Home-Page?language=en_US) |
| Data Downloader | Async historical exports | UNCONFIRMED | Analytics | [Data Downloader](https://support.eposnow.com/s/article/Data-Downloader?language=en_US) |

**Unresolvable articles (UNCONFIRMED):** Reporting Glossary A-M, Reporting Glossary N-Z, Setting up a Reporting Dashboard, Bookkeeping Report, Transaction Report PSP Reference.

**Register document.** Epos Now uses neither X nor Z for its own POS — the document is the **End of Day Report** and the act is **Close Till / End of Day**. The only "Z report" it names is the *card reader's*.

> "The End of Day Report is submitted to the Back Office once the Close Till has been performed for the day."
> "once an End of Day has been performed, the data submitted to the Back Office cannot be changed."

Fields: End of day ID, Till name, Location, Opened by, Date/time opened, Close by, Date/time closed, **Opening balance** ("the float amount entered when the till was opened"), Net sales inc VAT, Customer credits purchased, Gratuity, Pay Outs, Petty Cash, Banked, **Expected**, **Actual** ("based on the cash that has been physically counted and/or the card reader's Z report"), **Variance**. `Show Tenders` expands to tender breakdown, notes, sales by product/employee/category, refunds, void summary, tax summary and credit.

**Custom reports:** no builder. **Reporting Dashboards** instead — "compile essential data from various reports into a single, easily accessible interface… setting up scheduled emails to receive regular updates of your dashboard data". Dashboard mechanics **UNCONFIRMED** (article slug unresolvable). **API:** an installable AppStore product called "API" with webhooks and a REST API ([product page](https://www.eposnow.com/us/store/software/apps/api/)); price, tier and endpoints all **UNCONFIRMED** — `developer.eposnow.com` does not resolve.

**Export:** stated identically on every report article — **"All reports can be exported to CSV, Word, Excel and can even be printed"**, with "You can only export reports using a laptop/computer". **No PDF export documented.** Scheduled email exists for dashboards only. **Data Downloader** covers three report types (Bookkeeping, Tax Summary, Stock History), limited to "your first transaction up to 2 years ago", delivered as CSV via a Reports Hub that keeps only the 50 most recent requests.

**Offline: UNCONFIRMED.** The only offline articles are card-authorisation specific. No vendor page states what reporting works offline.

---

## 10. Erply

**Plans** ([pricing](https://erply.com/pricing/)) — four segment-named tiers, each with one vague reporting line:

| Tier | Price | Reporting line (verbatim) |
|---|---|---|
| Giftshop & Grocery chain | $59/store/mo | **"Basic x-/z-reports to run your shop"** |
| Multichannel chains | $199/store/mo | "Reporting" |
| POS for NETSUITE | from $1,800 | "Advanced Reporting" |
| Franchise & Chain | from $3,500 | "Centralized Reporting" |

The entry tier **excludes back-office access**, which matters because Erply's Z report *is* a back-office document — but Erply never states the consequence, so the mapping is **UNCONFIRMED**. **No Erply page maps any named report to a tier.** Marketing claims "over 90 reports" ([tour](https://erply.com/tour-of-reporting)).

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **X-Report** | Per-register, per-day: register open/close time, transactions total, processed documents | Entry tier claims "basic x-/z-reports" | **Register document** | [X-Report](https://wiki.erply.com/article/77-x-report) |
| **Z report** | Back-office multi-day/multi-store/multi-register transaction detail | UNCONFIRMED | **Register document** | same |
| **Day Openings and Closings** | Day open/close records across stores and registers; who opened/closed; editable | UNCONFIRMED | **Register document** | [help](https://wiki.erply.com/article/69-open-and-close-the-day) |
| Sales Summary | By Day, Day Overview, By Weekdays, By Hours | UNCONFIRMED | Analytics | [Sales Reports](https://wiki.erply.com/article/806-sales-reports) |
| Sales by Customer | By customer, account manager, customer group, business area | UNCONFIRMED | Analytics | same |
| Sales by Location | By location, by register | UNCONFIRMED | Analytics | same |
| Item Sales | 15 subcategories: by product, matrix product, product group, department, supplier, category L1/L2, brand, master list, several with drill-down | UNCONFIRMED | Analytics | same |
| Cashier Sales | By cashier | UNCONFIRMED | Analytics | same |
| Detailed Sales | Invoices, invoice rows | UNCONFIRMED | Analytics | same |
| Accounts Receivable | Unpaid invoices and balance statements, customer invoices by period, balance report | UNCONFIRMED | Analytics | same |
| Cost of Goods Sold | COGS summary, or by customer, location, item, cashier | UNCONFIRMED | Analytics | [Terminology](https://wiki.erply.com/article/662-erply-back-office-terminology) |
| Prepayments / Overdue Invoices / Invoices and Payments | Receivables reporting | UNCONFIRMED | Analytics | same |
| Purchase | Summary, by product/group, late deliveries, PO, supplier, detailed | UNCONFIRMED | Analytics | same |
| Inventory | Stock status, balance, warehouse movements, in/out of stock, replenishment, central purchasing | UNCONFIRMED | Analytics | [Inventory Report](https://wiki.erply.com/article/988-inventory-report) |
| Inventory Registrations / Write-Offs / Transfers | Inventory documents by period and location | UNCONFIRMED | Analytics | [Terminology](https://wiki.erply.com/article/662-erply-back-office-terminology) |
| Commissions and Time Clocks | Sales by attendant, timeclock entries, commissions earned | UNCONFIRMED | Analytics | same |
| Export to Accounting | Export Sales report to QuickBooks | UNCONFIRMED | Analytics | same |
| See Login Activities / Logs of Deleted Items | Audit trails | UNCONFIRMED | Analytics (audit) | same |
| See Timeclock Entries | Manual clock in/out per employee and location | UNCONFIRMED | Analytics | same |
| **Make a Custom Report** / **Report Generator** | User-built reports | UNCONFIRMED | Analytics | [Report Generator](https://wiki.erply.com/en/article/836-report-generator) |
| Payments Summary (Cash Audit) | All payments in a period incl. cash and card types, "broken down by locations and their registers" | UNCONFIRMED | Register-adjacent | [tour](https://erply.com/tour-of-reporting) |
| Day Overview | Net total sales today plus payments received today for earlier sales; splits by employee | UNCONFIRMED | Analytics | same |

**Register documents — Erply uses X and Z literally, with a precise and unusual split:**

> **"An X-report covers one day and one register only, and is generated at the POS when the day is closed."** … **"X-reports are typically employee-facing."**
> **"A Z report is generated in the back office and can cover multiple days, stores, and registers."** … **"Z reports are typically handled by managerial staff."**
> **"X-reports can be edited in the back office at any time for accurate bookkeeping."**

Day close: Erply "will automatically prompt you to open the day when the first user logs into the POS"; Close day "will start the day closing process by popping open the cash drawer", the cashier counts dollar/cent/receipt totals and Erply "will automatically calculate the difference between cash counted and cash expected". **"After you close the day, Erply will generate an X-report."**

**Drawer Count mode** ([help](https://wiki.erply.com/article/1339-drawer-count)): default is per-register; with drawer counting on, "X-reports are generated per drawer ID instead of per register", and only employees assigned a drawer ID may open the day. Config parameter `pos_shift_count = BY_DRAWER`.

Over/short is correctable for past dates via Back Office → Retail → Day Openings and Closings → "Point of Sale and Payment Report" ([help](https://wiki.erply.com/fi/article/2192-fixing-over-short-in-the-z-report)).

**Custom reports — Erply has a genuine report builder, the strongest in this survey.** **"Report Generator"** (Reports → Report Generator → Create Report): pick **Tables** (Product, Customer, Sales, Sales Document, Sales Document Row, Payment, Inventory, Supplier, Gift card…), with join validation ("Report contains an error - selected tables cannot be joined"); choose **Fields** as columns via "Show in report" (a filtered column "does not need to be visible"); **group by I** creates subtotal blocks and **group by II** creates total rows; aggregation offers "display totals" and "display row count"; blank filter values become run-time prompts; reports can be filed into **Report Groups**. A downloadable `Report-Generator-Tables-Fields.xlsx` documents the full schema. **Tier UNCONFIRMED** — almost certainly not on the $59 tier, since back office is excluded there, but Erply does not say so.

**API — the deepest of this survey, in two generations.** Classic API ([reporting topic](https://learn-api.erply.com/by-topic/reporting)): `getSalesReport`, `getCostOfGoodsSold`, `getCustomerBalances`, `getAccountStatements`, `getRoundedSales`, `getSalesTotalsByEmployeeAndDay/Month`, `getProductStock`, `getSummaryInventoryReport`, `getPurchaseReport`, `getEmployeeStats`, `getGiftCardRedeemings`, `getUserOperationsLog`, `getAppliedPromotionRecords` and more. Two are register-document calls: **`getPointOfSaleDayTotals`** ("For the 'day closing' procedure", grouped by payment method) and **`getReports`**, which produces "an 'X Report' or 'Z Report'". Newer **Reports API** ([Z Reports](https://wiki.erply.com/article/707-reports-api-z-reports)) composes a Z-report from `/v1/POSDay` plus `/transaction/cashflow`, `/total-by-type`, `/transaction`, `/credit-added`, `/credit-paid`, `/void` — with the notable caveat **"The response does not provide totals"**: day income, cash in/out and over/short must be computed client-side.

**Export:** sales reports "can be opened as an HTML table or downloaded as a .xls file"; Report Generator configures an Excel export per report. **PDF UNCONFIRMED** as a native report export. **CSV UNCONFIRMED** — not mentioned anywhere. **Scheduled/emailed reports: UNCONFIRMED** — no Erply page documents scheduling.

**Offline — Erply is the most explicit vendor here, and the answer is essentially no reporting.** [Offline Mode](https://wiki.erply.com/article/858-offline-mode) lists as unsupported, verbatim: **"View recent sales"**, **"Close the day"**, **"Open the day"**, **"View or print the X-Report"** — plus cash in/out, customer search and creation, stock and price lookup, gift card balances, opening the cash drawer and switching users. The FAQ restates: "You can not close the day in offline mode yet." Offline mode must be enabled **before** an outage.

---

## 11. Korona POS

**Plans** ([pricing](https://koronapos.com/pricing/)) — three cumulative plans, not the old dot-notation. **"Plus" is a plan tier, not a separate analytics product**, and KORONA Food is a $10/register/month add-on module, not a tier.

| Plan | Price | Reporting lines (verbatim) |
|---|---|---|
| **Core** | $59/mo/terminal | "Sales reports"; "Open API access" |
| **Retail** | $79 (most popular) | "KPI reports" |
| **Plus** | $99 | "ABC analysis report", "Top and slow sellers report", "Multi-location inventory tools and reports", "Movement and store comparison", "Accounting data export" |

> **Gating caveat.** Korona's [manual](https://manual.koronapos.com/) is the best-documented in this survey — 79+ report pages — **but almost none state a tier.** Korona *does* use explicit callouts when gating exists ("This feature is only available with the KORONA Plus package" on [Store Prices](https://manual.koronapos.com/store-prices/); three dashboard widgets marked "*Franchise package only*"). Absence of a callout is therefore meaningful but not positive confirmation.

**Analysis & Productivity**

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **ABC Analysis** | Groups products A/B/C by revenue share (A≈70%, B≈20%, C≈10%); flags "Delist", "Increase Price", "Lower Price" | **Plus** (per pricing) | Analytics | [ABC Analysis](https://manual.koronapos.com/abc-analysis/) |
| **Key Performance Report** | Inventory Turnover Rate, Days Of Supply, GMROI | **Retail** inferred | Analytics | [KPI](https://manual.koronapos.com/key-performance-report/) |
| **Top Seller Statistic** | Top-selling products | **Plus** inferred | Analytics | [Top Seller](https://manual.koronapos.com/top-seller-statistic/) |
| **Organization Comparison** | Compares org units: active products/assortments, gross revenue, net yield, gross profit, opening time, operating/staff costs, sales-area and shelf productivity | **Plus** inferred | Analytics | [Comparison](https://manual.koronapos.com/organizational-unit-store-comparison/) |
| Average Receipt Net Revenue · Cashier Statistic · Commodity Group Statistic · Customer ABC · Customer Group Report · Customer Group Statistic · Customer Product Report · Customers per Day of Week · Customers per Hour · Management Report · Most Popular · Organization Indicators · Organization Trend · Periods to Compare · Point of Sale Statistic · Prepaid Cards Report · Product / Customer · Product Performance · Product Report · Products per Weekday · Revenue Statistic by Day · Revenue Statistic by Hour · Supplier Analysis · Top Customers | 24 further analytics reports, each with its own manual page | UNCONFIRMED | Analytics | [index](https://manual.koronapos.com/category/manual/evaluation-reporting/) |

**Financial:** Top Seller Report · Top Seller (Org Average) · Slow Sellers (Org Average) [**Plus** inferred] · Posting Journal · Sector Report · Commodity Group and Hierarchical Report · Organization Report · Payment Method Report · Payment Transactions · Point of Sale Report · Receipts · Discount Report · Couponing Actions Report · Customer Sales Report & Receipts · Delivery Note Summary · Additional Receipt Information · Multiple Payment Type Tracking · Prepaid Transactions · Sales Price Report · Service Provision Distinction/Revenue Reports · Stock Valuation Report · Supplier Sales Report — all **UNCONFIRMED** on tier.

**Managerial**

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Cashier Balance Report** | Balances summarised per cashier | UNCONFIRMED | **Register document** | [help](https://manual.koronapos.com/cashier-balance-report/) |
| **Payment Method Differences** | Expected vs actual variance by payment method | UNCONFIRMED | **Register document** | [help](https://manual.koronapos.com/payment-method-differences/) |
| Receipt Journal | Receipt-level journal | UNCONFIRMED | Analytics (audit) | [help](https://manual.koronapos.com/receipt-journal/) |
| Cancellations | Voided/cancelled transactions | UNCONFIRMED | Analytics (audit) | [help](https://manual.koronapos.com/cancellations/) |
| Account Transactions | Income/expense account movements | UNCONFIRMED | Register-adjacent | [help](https://manual.koronapos.com/account-transactions/) |
| Cashier Report · Cashier Commission Report · Cashier Revenue Report · Seller Revenue Report · Team Commission · Daily Ratings · Prepaid Cards Report | — | UNCONFIRMED | Analytics | [index](https://manual.koronapos.com/category/manual/evaluation-reporting/) |

**Inventory:** Movement Report [**Plus** inferred] · **Store Prices & Store Listing** [**Plus — explicitly stated**] · Warehouse Reports · Warehouse Statistic · Stock History Report · Stock Valuation Report · Stock Receipt Discrepancies · Stock Return Rates · Stock Return Report · Internal Transfer Report · Production Report · Serial Number Report · Advanced Shelf Life Report · Supplier Purchase Report · Suppliers Products Report · Tag Report · Volume Report.

**Register documents — Korona uses Z literally ("z-count", "z-tape") but has no X-report.**

> **"A z-count period represents a business day."**
> **"The end-of-day statement is a summary of all activities for one register for a z-count period."** — "also called z-tape."
> **"Once completed on the POS, a finalized z-count can not be modified."**

It "serves as financial proof", "captures the exact sales revenue and collected tax", and "outlines all payment and account transactions, including shortage and overage". Sections: Commodity Group, Customer Group Revenue, Income/Expenses, Sales Tax, and **Payment Methods showing Expected, Actual and Difference** ([key](https://manual.koronapos.com/finish-day-end-of-day-statement-key/)).

**Four cash-up methods** (configuration, not tiers): **Simple End of Day** (assumes actual matches expected); **POS Balance** (counted amount per point of sale, default three match attempts then "the function completes anyway and the discrepancy shows on the End of Day Statement"); **Cashier Balance** ("the most detailed method", per cashier); **Central Balance** (drawer insert counted later at a web URL).

**Balance Statements** are a distinct and **editable** document — "an accumulation of balance statements… can belong to a cashier, POS, or Organizational unit", explicitly "not to be confused with the end-of-day statements" ([help](https://manual.koronapos.com/balance-statements/)). **Cash Journal** ([help](https://manual.koronapos.com/cash-journal/)) manages cash transactions with opening and closing balances; saved entries "may not be edited or deleted"; exports to PDF or Excel. A **Z-Count Validation Widget** surfaces defective z-counts on the dashboard.

**Custom reports:** no SQL-style builder. A configurable **Dashboard** of widgets (including Z-Count Validation and POS Balance), extensive per-report filtering (Org Unit, Assortment, Date/Time, Supplier, Commodity Group, Day of Week, Cashier, POS, Z-Count) and drill-downs. **API:** "KORONA.cloud API v3"; "Open API access" is on **Core**, the lowest tier; **KORONA Integration** is a paid add-on at +$45/token/month. Endpoint-level reporting schemas **UNCONFIRMED**.

**Export:** **PDF or Excel** per report, consistently. **CSV UNCONFIRMED.** **Korona is the only vendor in this group with documented report scheduling** — [Automatic Report Dispatch](https://manual.koronapos.com/automatic-report-dispatch/) under Settings, covering **Management Report, Tax Consultant Report, Hierarchical Commodity Group Report, Organization Report, Movement Report** plus the Warehouse Report, with Intervals, Time of Day and a Next Execution timestamp. Emailed file format **UNCONFIRMED**. Useful vendor warning: "KORONA does not keep a report of your warehouse data for past dates otherwise" — a scheduled report is the only way to preserve that snapshot.

**Offline** ([FAQ](https://manual.koronapos.com/frequently-asked-questions/)): "Yes, you can temporarily use the POS Terminal without connecting to the cloud", with nine cloud-required functions listed (master data retrieval, sales upload, prepaid/gift cards, inventory receipts, customer orders, customer data, API calls, event tickets). **End-of-day / z-count is notably absent from that list**, and the z-count is an internal POS counter — but Korona never states offline z-count behaviour, so it is **UNCONFIRMED**. Back-office Evaluations are cloud-side and therefore unavailable offline.

---

## 12. Odoo POS

Odoo's POS reporting is **much thinner in the documentation than in the product**. The POS reporting docs page names two things; the rest is confirmed from Odoo's own source repository, which is flagged per row.

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Orders** (internally "Point of Sale Analysis") | Order statistics "in a graph or pivot view that you can filter or group depending on your needs". Group-bys: User, Point of Sale, Product, Product Category, Payment Method, POS Category, Order Date | **One App Free** | Analytics | [reporting](https://www.odoo.com/documentation/latest/applications/sales/point_of_sale/reporting.html) |
| **Analytics** (session drill-down) | "all session activities, including who initiated the session… and who handled specific orders". Fields: Order Ref, Date, Point of Sale, Receipt Number, Customer, Employee, Total, Status | One App Free | Analytics | same |
| **Session Report** → prints the **Sales Details** PDF | **This is Odoo's Z-report.** Menu `Point of Sale ‣ Reporting ‣ Session Report` | One App Free | **Register document** | [source](https://raw.githubusercontent.com/odoo/odoo/master/addons/point_of_sale/wizard/pos_daily_sales_reports.xml) |
| **Sales Details** (date-range variant) | Same PDF over an arbitrary start/end datetime and chosen POS configs | One App Free | **Register document** | [source](https://raw.githubusercontent.com/odoo/odoo/master/addons/point_of_sale/wizard/pos_details.py) |
| Balance Sheet · Profit and Loss · Executive Summary · General Ledger · Aged Receivable · Aged Payable · Cash Flow Statement · Tax Report · Audit Trail | Standard accounting reports | Requires the **Accounting** app → a 2nd app → **Standard** (€11.90/user/mo) or above | Analytics | [accounting reporting](https://www.odoo.com/documentation/latest/applications/finance/accounting/reporting.html) |
| Custom reports (Accounting) | Sub-page under Accounting reporting | Standard+ | Analytics | same |

**Names that do NOT exist as Odoo POS report names:** "Daily Sales", "Sales Analysis", "Product report", "Payment methods", "Taxes", "Cash control". Payments, Taxes and Products are *sections inside the Sales Details PDF*; Payment Method, Product and Product Category are *group-bys on the Orders report*. Odoo's cash vocabulary is "Opening Control", "Cash In/Out", "Closing Register", "Cash Count", "Payments Difference".

**Register document.** The **Sales Details** PDF carries the headings "Sales Details" and "Daily Sales Report", with sections: Session ID, Opening Date, Period, Config names, **Sales**, **Taxes on sales**, **Refunds**, **Taxes on refunds**, **Payments**, **Discounts**, **Invoices**, and **Session Control** — containing Cash Rounding, Number of transactions, and a per-payment-method table of **Expected / Counted / Difference**, plus Cash Move and opening/closing session notes ([template](https://github.com/odoo/odoo/blob/master/addons/point_of_sale/views/pos_session_sales_details.xml)).

Cash-control workflow, in Odoo's wording ([use](https://www.odoo.com/documentation/latest/applications/sales/point_of_sale/use.html)):
- Open: "In the **Opening Control** popover, ensure the **Opening cash amount** is correct."
- Cash in/out: "Click **Cash In/Out**… Specify the reason for the addition or removal of cash, and click **Confirm**." Restricted to "employees with basic or advanced access rights".
- Close: the **Closing Register** popover shows "the number of orders and the total amount made during the session" and "the expected amounts grouped by payment method"; the computed count populates the **Cash Count** field.
- Variance: "When the counted money does not match the expected amount, a **Payments Difference** window appears… Click **Proceed Anyway** to accept the difference and post it to the designated cash difference journal." A **Set Maximum Difference** setting and **Authorized Difference** limit can block closing above a threshold.

All of this is **One App Free** — POS is one app, and "its usage is free for unlimited users, forever, whatever the dependencies of the app" ([pricing FAQ](https://www.odoo.com/pricing-plan)). **There is no X-report** named anywhere in Odoo's docs or POS source; the date-range Sales Details wizard is the nearest thing.

**Custom reports:** **Odoo Studio** builds custom PDF reports, fields, views and models — **Custom plan** (€17.90/user/mo), with two carve-outs Odoo states itself: Studio may be chosen as the app for a free plan, and installing it on Standard auto-upgrades to Custom. **Pivot and graph views** ("two generic views are dedicated to reporting") are available wherever the app is, so free for POS. **External API** (JSON-RPC/XML-RPC) is **Custom plan only**.

**Export:** records to **.csv and .xls** with reusable export templates; pivot view to **.xlsx**; accounting reports to **PDF or XLSX**; Sales Details as **qweb-pdf**. **Scheduled/emailed reports UNCONFIRMED.**

**Offline:** POS "is built to maintain functionality even during temporary network outages" — order creation and management keep working from a browser cache and sync on reconnect. **Reporting offline: effectively none** — every report is a backend view or server-rendered PDF, and Odoo scopes offline mode to "order creation and management".

---

## 13. Oliver POS

> **Documentation warning.** Oliver's knowledge base at [oliverpos.com/help/](https://oliverpos.com/help/) contains **exactly one article**. The older help centre at `help.oliverpos.com` **fails TLS handshake entirely** (no peer certificate presented). Search engines still index articles there, but none could be verified against a live page. Everything below therefore comes from Oliver's **marketing pages and its own WordPress.org plugin readme** — vendor-owned, but not documentation.

**Plans** ([pricing](https://oliverpos.com/pricing/)) — **Free / Starter / Pro / Enterprise**, not the historical Free/Basic/Pro/Advanced:

| Row | Free ($0) | Starter (from $9/mo) | Pro (from $29/mo) | Enterprise (from $49/mo) |
|---|---|---|---|---|
| **Reports** | Today only | Sales summaries | Full suite | + cross-outlet |
| **Advanced cash drawer & end-of-session reporting** | — | — | ✓ | ✓ |

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Shift Summary** | Per-shift roll-up; printed receipt type named "Shift Summary (Z-report)" | **Pro** | **Register document** | [plugin page](https://oliverpos.com/wordpress-plugin/) |
| Sales by Cashier | Sales per staff member; tips surfaced in shift summaries and the per-cashier report | Pro | Analytics | same |
| Sales by Outlet | Sales per location | Pro; cross-outlet roll-ups **Enterprise** | Analytics | same |
| Payment Methods | Sales split by tender | Pro | Analytics | same |
| **Cash Reconciliation** | Expected vs counted cash; blind close and variance reasons | **Pro** | **Register document** | same |
| **Cash Activity** | "the full per-shift cash ledger — adds, removes, drops, deposits, adjustments — every event timestamped" | **Pro** | **Register document** | same |
| POS vs Online (Channel) | In-store vs web sales split | Pro | Analytics | same |
| Cross-outlet roll-ups | "head office sees every outlet in one view" | **Enterprise** | Analytics | same |

**Register document — Oliver has one, and it is Pro-gated.** Features named on the plugin page: **"End-of-day Z-report"** and **"Auto-print Z-report"**; **cash drawer counts**; **opening and closing floats with discrepancy reporting**; **denomination counting** ("Staff count notes and coins individually instead of typing a single total"); **blind close** ("Hides the expected cash total during reconciliation so the cashier can't adjust their count to match"); **variance reasons** (over/under beyond a configurable default of $5 requires a reason: Refund, Tip Out, Petty Cash, Bank Drop, Other); and **cash rounding rules**. **No X-report** is named anywhere. Setup and UI mechanics are **UNCONFIRMED** — that material lives only on the unreachable help host.

**Contradiction worth noting:** the WordPress.org readme claims "Oliver POS includes **15+ unique reports**", while the marketing site's feature grid says "**7 POS reports**" and enumerates exactly seven. Both are Oliver's own copy; the enumerated seven are the more trustworthy.

**Custom reports:** no builder advertised. **CSV exports** — "Every report exports to CSV with every tax line broken out"; reports "can be filtered per outlet, per register or globally". Because Oliver writes standard WooCommerce records, the **WooCommerce REST API** is the escape hatch; Oliver publishes no reporting API of its own. CSV export's tier is **UNCONFIRMED** — it is not a row in the pricing matrix.

**Export:** CSV for every report; the Z-report prints and "auto-prints and emails". No Excel or PDF export claimed.

**Offline:** "The 'Allow offline orders' setting is enabled by default… every order is queued on the device and syncs into WooCommerce in order the moment the connection comes back. **Refunds, live stock checks and customer lookups require an online connection**". Reports live in Oliver Hub inside wp-admin, so **no reporting works offline**.

**Still actively sold? Yes — but the numbers do not reconcile.** Plugin **v4.9.3, last updated 2026-08-14**, with real changelog entries through 2026-08; the site is a recent rebuild carrying comparison pages [/compare/wcpos/](https://oliverpos.com/compare/wcpos/) and [/oliver-vs-wcpos/](https://oliverpos.com/oliver-vs-wcpos/) — they are actively targeting WCPOS. Against that: **700 active installs on WordPress.org** versus a readme claiming "More than **45,000 retailers**" (a ~64x gap); support stats reading "Issues resolved in last two months: 0 out of 1"; 14 one-star reviews among 90 ratings; a **broken help centre**; and their own changelog noting the iOS App Store listing "isn't live yet" as of 2026-06-23. Read: not dormant, but marketing well ahead of measurable install base and documentation.

---

## 14. FooSales

FooSales has a genuinely good help centre at [help.foosales.com](https://help.foosales.com/docs/) — but its **Reports topic is one page long and names only two things**.

**Plans** ([pricing](https://www.foosales.com/pricing/)): **Free (7-day trial)**, **Core (US$19/mo, billed annually per store)**, **Plus (US$38/mo)**. Core→Plus adds Square Payments, Stripe Payments, WooCommerce Product Add-ons and FooEvents — **payments and integrations, not reports**. **No FooSales page gates any report by tier.**

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Daily Summary** | "a snapshot of **total sales** and **payment types** processed through the FooSales apps on a particular day, including previous days" | **All plans** | Analytics | [reports](https://help.foosales.com/docs/topics/reports/) |
| **WooCommerce Analytics ‣ Orders** (with FooSales' **Sales Channel** filter) | WooCommerce's own reporting, with a FooSales-added filter for "Online Only" and "POS Only" orders | All plans (it is WooCommerce's report) | Analytics | same |

Caveat FooSales states itself: "Only orders that were created after the FooSales WordPress plugin was updated to version 1.28.1 include the required order meta" for the Sales Channel filter.

**Register document — FooSales has none.** Verified across five separate pages rather than assumed:

- The entire [Reports topic](https://help.foosales.com/docs/topics/reports/) is WooCommerce Analytics plus Daily Summary — no session, no drawer, no close.
- [Checkout](https://help.foosales.com/docs/topics/checkout/) lists Customer, Order Discount, Coupon Code, Payment Method, Order Notes and Processing an order. Cash appears **only** as a selectable payment type. No opening float, no till count, no cash-up.
- [Orders](https://help.foosales.com/docs/topics/orders/) covers creating, viewing, updating and reverting orders, receipts and refunds. No end-of-day close.
- The [cash drawer FAQ](https://help.foosales.com/docs/frequently-asked-questions/setup/can-i-connect-the-foosales-app-to-a-cash-drawer/) answers purely as a **hardware** question — Star mPOP and Star Micronics drawers fired from a supported thermal printer. **Nothing about counting, floats or reconciliation.**

**So FooSales has no cashier session, no opening/closing float, no expected-vs-counted variance, and no X or Z report.** It can *fire* a cash drawer; it cannot *reconcile* one. The Daily Summary is a read-only snapshot with no counted-cash input and no close action.

**Custom reports:** none. Only WooCommerce's own order filters. **No API and no hooks** — FooSales states it directly: "**FooSales doesn't have an API or any hooks available for third-party developers at the moment**" ([FAQ](https://help.foosales.com/docs/frequently-asked-questions/integrations/is-there-an-api-or-any-hooks-available-for-foosales/)). The apps connect over XML-RPC, so anything built against a FooSales store is really built against WooCommerce.

**Export:** **CSV** via WooCommerce. A **custom XML** file exists but is an offline-recovery mechanism, not a report format. **No Excel, no PDF report export, no scheduled or emailed reports.**

**Offline:** the strongest offline claim of the three WooCommerce-native products — offline mode "makes it possible to use most of the FooSales point of sale functionality without an active internet connection" and activates automatically. New orders, cancellations and refunds are stored on device and synced; product values are editable except stock. Customers "can't be created or modified while in offline mode". **Offline reporting: UNCONFIRMED, and notably so** — neither offline page mentions reports or the Daily Summary at all.

---

## 15. Other WooCommerce-native POS plugins

These were not in the original brief but are the most directly comparable products to WCPOS, so they are included. Coverage is deliberately lighter.

### 15.1 wePOS (weDevs / Dokan)

> **Reachability warning.** `wepos.io` returns NXDOMAIN. `wedevs.com/wepos/` 301s to `dokan.co/wordpress/wepos/`, and every `dokan.co` request timed out at the Cloudflare edge. Everything below is from the **vendor-authored plugin readme** on WordPress.org — the only wePOS-owned page that could be read.

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| "Advanced Reports Dashboard" | "sales summaries, charts, recent orders, payment reports, and inventory alerts" on one page | **Pro** | Analytics | [readme](https://wordpress.org/plugins/wepos/) |
| "CSV order export" | Raw order export from the POS dashboard | **Pro** | Analytics (export) | same |
| "Low stock alerts" | Inventory alerting in the reports dashboard | **Pro** | Analytics | same |
| "Payment Reports for Admin" | Store sales filterable by Payment Method, Customer, Outlet, Cashier; totals for Sales Amount / Total Items / Total Orders | **Pro** | Analytics | docs page **UNCONFIRMED** (unreachable) |

- **Register-closure document: NONE found.** No cash drawer, no opening float, no register open/close, no X/Z report, no shift or end-of-day reconciliation anywhere in the readme. The free tier lists no reporting at all.
- **Custom reports:** none. Filters are fixed. CSV order export is the only user-driven output.
- **Export / offline:** CSV only; no PDF, no scheduled email. No offline mode mentioned; stock "stays in sync with your WooCommerce stock", implying a live connection.
- **Pricing: UNCONFIRMED** — the readme's "Get Pro" links point to an unreachable page.
- **Maintenance: active.** v2.0.1 released 2026-05-21; v2.0.0 (2026-04-27) rebuilt the cashier screen and every admin page including Reports. 2,000+ active installs, 3.5/5 from 22 reviews.

### 15.2 YITH Point of Sale for WooCommerce

The closest structural analogue to WCPOS among the paid WooCommerce plugins, and the strongest register story of the three WordPress-native ones.

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Close Register** / Register closure report | Opening and closing date/time, cashiers logged in, orders, products sold, Cash in hand, sales by payment method, Net Sales, Shipping, VAT, VAT shipping, Order tax, Shipping tax, Total tax, Total sales, Cash Total; optional note | Single paid tier | **Register document** (Z equivalent) | [docs](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/pos-screen/close-register/) |
| **Today's profit** | Same field set, "a recap of all sales made since the Register opening" — mid-session, register stays open | Single paid tier | **Register document** (X equivalent) | [docs](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/pos-screen/todays-profit/) |
| **Manage Cash** | Cash movements during a session: Add / Remove, amount, Reason | Single paid tier | **Register document** | [docs](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/pos-screen/manage-cash/) |
| **Register sessions** (admin) | Session ID, store, register, opening/closing time, total sales; closed sessions allow a note and report download | Single paid tier | **Register document** | [docs](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/settings/registers/) |
| **Dashboard** (POS statistics) | Orders, total sales, net sales, AOV, average items per order, items, customers, coupons; trend chart; sales by payment method; Top cashiers | Single paid tier | Analytics | [docs](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/settings/dashboard/) |
| **Order History** | POS orders grouped by day: order number, payment method, date/time, status, customer, products, tax and fees, receipt reprint; filter by Register | Single paid tier | Analytics / journal | [docs](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/pos-screen/register-history/) |

- **Register-closure document: YES**, the most complete of the WordPress-native plugins. Opening float is captured as **"Open Register – Cash in hand"**; paid in/out via Manage Cash. **Gap worth flagging: no expected-vs-counted reconciliation** — the docs describe "Cash in hand" and "Cash Total" but no declared/blind count field and no difference or variance figure.
- **Custom reports:** none. Two per-register toggles only — **"Enable Register closing report"** (CSV download for managers and cashiers) and **"Enable Register final notes"**. POS orders sync via the WooCommerce REST API.
- **Export:** **CSV closure report only.** Receipts print/PDF after payment. No export documented for Dashboard or Order History.
- **Offline:** explicitly **none** — the product page lists "no offline mode" as a limitation.
- **Pricing: €179.99/yr**, single licence, 1 year of updates and support, 30-day money-back guarantee.
- **Maintenance: active.** v3.26.0 released **2026-08-24**; requires WooCommerce 10.9, tested to WC 11.1.x / WP 7.1.x.

### 15.3 Jovvie (BizSwoop / CPF Concepts)

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| "Reports" | "Advanced reports by user account cashier or shop manager. Breakdown reports by order type Web or Point of Sale." | Basic ($29) and up | Analytics | [features docs](https://jovvie.com/documentation/features-docs/) |
| "Detailed Analytics & Reports" | "integrated right in your WooCommerce dashboard… from product sales to customer insights" | Basic and up | Analytics | [features](https://jovvie.com/features/) |
| "Sales reports & kiosk mode" | Bundled line in the plan comparison | Basic / Pro | Analytics | [pricing](https://jovvie.com/pricing/) |
| "Cashier Draw Management" — "Cash end of day reports per user" | — | **Listed under *Upcoming Features*, not shipped** | Would be a register document | [features docs](https://jovvie.com/documentation/features-docs/) |

- **Register-closure document: NO — and the vendor says so itself.** "Cashier Draw Management… Cash end of day reports per user" sits in the **Upcoming Features** section, not the shipped table. Nothing about drawers, floats, till counts, X/Z reports or shift reconciliation appears on any vendor page. The only shipped cash handling is a "cash tendered field" on order details.
- **Custom reports:** no builder, no saved filters, no documented export; reporting is delegated to the WooCommerce dashboard. There is a developer surface — "Complete REST API, webhooks, and SDK ecosystem" — so custom reporting is an API-build exercise.
- **Export:** none documented. **Offline: not shipped** — "Offline Support" is an Upcoming Feature; the features page says Jovvie works "as long as you have an active internet connection".
- **Pricing:** Jovvie Pay $0/mo +1%/txn · Jovvie Checkout $0/mo · **Basic $29/mo** (1 cashier + 1 manager) · **Pro $49/mo** (unlimited staff/stations) · Ultimate custom. Trial = first 25 orders free.
- **Caveat:** `jovvie.com/llm-info/` is vendor marketing written explicitly to steer AI assistants, including embedded instructions about how to describe the product. Treated as claims, not facts.

### 15.4 Hike POS (WooCommerce integration)

Hike is a standalone POS whose WooCommerce integration is a sync connector — the reporting is Hike's own. It is by far the deepest of this group.

| Report name | What it shows | Tier | Type | Source |
|---|---|---|---|---|
| **Shift report** | Per shift: Register (Outlet), Time opened, Time closed, **Expected**, **Actual**, **Difference**, Sync | Essential+ | **Register document** | [KB](https://help.hikeup.com/portal/en/kb/articles/register-report) |
| **Register Closure Summary** | Cash Register & Sales Summary (Payments Received, Refunds, Net Receipts, Total Sales inc./ex. tax, Total Voided Sales, Tax, Discounts, Surcharge, on-account sales); **Payment Summary** (Payment Type / Expected / Actual / Difference); Payment Details; **Adds / Payouts** (float, money in, money out, user, notes); Transactions; Transactions by SKU; COGS. Actions: Print, Email | Essential+ | **Register document** | same |
| **Float In/Out** | Register, Date, Type (Float / Cash in / Cash out), Amount, User, Notes | Essential+ | **Register document** | same |
| **Cash drawer opened without sale** | Count of no-sale opens; drill-down Opened by, Date & Time | Essential+ | **Register document** (audit) | same |
| **Voided transactions** | Register, total void; drill-down Void by / Void date / Sale / Sold by | Essential+ | **Register document** (audit) | same |
| **Sales Summary report** | Sales inc./ex. tax, Refunds, Discounts, Net sales, COGS, Gross profit, Margin, Net sales tax, Surcharge & Shipping; daily/weekly/monthly with graph | Essential+ | Analytics | [KB](https://help.hikeup.com/portal/en/kb/articles/sales-report) |
| **Sales (by items) report** | Per product: qty sold, sales inc./ex. tax, discounts, markup, purchase cost, gross profit, margin, retail price | Essential+ | Analytics | same |
| **Sales Transactions report** | Order #, Date, Items (Qty), Status, Payment Types, Order Total, User, Customer | Essential+ | Analytics | same |
| **Laybys report** / **On Account report** | Orders with outstanding amounts | Essential+ | Analytics | same |
| **By Category report** | Sales by product type / supplier / brand / tag / season | Essential+ | Analytics | same |
| **Registers report** / **Users report** | Sales totals per register; sales totals per user | Essential+ | Analytics | same |
| **Customers group report** / **Custom Sale report** | Revenue and discounts per customer group; custom line items sold | Essential+ | Analytics | same |
| **Payments Report** / **Inventory Report** / **Customers Report** | Category reports | Essential+ | Analytics | [KB](https://help.hikeup.com/portal/en/kb/articles/inventory-report) |
| **Major Activity Log Report** | Major changes a user made | **Plus+** | Analytics (audit) | [KB](https://help.hikeup.com/portal/en/kb/articles/user-activity-report) |
| **Detailed Analytics** | "comprehensive analytics report… insights into various aspects of your retail business" | **Plus+** | Analytics | [KB](https://help.hikeup.com/portal/en/kb/hike/reporting/detailed-analytics) |
| **Custom reports** | User-built reports over Sales, Customers, Current Inventory, Inventory position, Delivery, Quotes, Sales (by Items), Inventory movement | **Plus+** | Analytics (builder) | [KB](https://help.hikeup.com/portal/en/kb/articles/run-custom-reports) |

- **Register-closure document: YES, the most complete in this whole survey's long tail**, and the only WooCommerce-adjacent product with a true expected-vs-counted variance **per payment type**. Opening uses an **opening float** that "cannot be changed after you open the register"; closing requires confirming the **PAYMENT TALLY** ("it cannot be amended afterward"), then **CLOSE REGISTER** ("this cannot be undone"). Hike says **Expected / Actual / Difference**, not "counted"/"variance". An April 2025 update added Total Cash In/Out Reporting and Automated Register Closure Prints on all plans, plus a **Plus-only blind-count permission** that leaves the "Counted Amount" field blank at close.
- **Custom reports:** a real builder — ADD CUSTOM REPORT, pick sections and data fields, set display order, Title, Cover page, Reporting period (max 90-day window), outlet or All. **Plus plan required.**
- **Export:** **PDF and Excel (.XLSX)** via a shared EXPORT button on every report. Custom reports add **scheduled email** — daily / weekly / monthly, with recipients, a send time in store locale, and a PDF-or-Excel download type. Closure summaries can be printed or emailed directly.
- **Offline:** the register "also works offline" for processing sales, but **opening a register is not available offline**. Offline *reporting* is not claimed.
- **Pricing:** **Essential** $59/mo annual ($69 monthly), single outlet · **Plus** $99/mo annual ($119 monthly) · **Enterprise** quote. "Basic business reporting" on all tiers; **Activity logs, Advanced analytics and Custom reports are Plus and Enterprise only.** The WooCommerce integration is "free and available to all Hike retailers with active subscription".

---

# Part II — Synthesis

## A. The universal set

**Denominator: 15 vendor products** — Square, Shopify POS, Lightspeed X-Series, Lightspeed R-Series, Clover, Toast, Loyverse, Epos Now, Zettle, SumUp, Erply, Korona, Odoo POS, Oliver POS, FooSales. (Vend is folded into X-Series; the four supplementary WooCommerce plugins are counted separately in the last column.)

A vendor counts only where it ships a **named report or a clearly documented equivalent surface** — not where the data merely exists somewhere in a database.

| Report concept | Count | Absent from | Also in extras (of 4) |
|---|---|---|---|
| **Sales summary / totals for a period** | **15 / 15** | — | 4 / 4 |
| **Sales by payment method / tender** | **15 / 15** | — | 4 / 4 |
| **Sales by item / product** | **13 / 15** | Oliver POS, FooSales | 3 / 4 (not Jovvie) |
| **Sales by employee / cashier** | **14 / 15** | FooSales | 3 / 4 (not wePOS) |
| **A register / cash-drawer document** | **13 / 15** | **Zettle** (UK app has none; paid country-specific product elsewhere), **FooSales** (none at all) | 2 / 4 (YITH, Hike — not wePOS, not Jovvie) |
| **Tax / VAT report** | **13 / 15** | Oliver POS (tax lines appear only inside CSV exports), FooSales | 2 / 4 |
| **Inventory / stock report** | **11 / 15** | Zettle (UNCONFIRMED), Odoo (needs the Inventory app), Oliver POS, FooSales | 2 / 4 |
| **Refunds / returns** | **12 / 15** | Erply (no named report), Oliver POS, FooSales | 2 / 4 |
| **Discounts** | **11 / 15** | Lightspeed X-Series (a *measure*, not a report), Erply, Oliver POS, FooSales | 2 / 4 |
| **Sales by category** | **11 / 15** | Lightspeed X-Series (a grouping), Shopify (a grouping), Oliver POS, FooSales | 2 / 4 |
| **Sales by hour / day-part** | **9 / 15** | Square (Free), Odoo, Oliver, FooSales, Epos Now (partial), Clover (daypart filter only) | 2 / 4 |
| **Gift cards** | **9 / 15** | Loyverse, Epos Now, Odoo, Oliver, FooSales, LS R-Series | 1 / 4 |
| **Voids / comps / audit trail** | **9 / 15** | Loyverse, Zettle, SumUp, Odoo, Oliver, FooSales | 2 / 4 |
| **Cost of goods sold / margin** | **8 / 15** | Zettle, Epos Now, Oliver, FooSales, Odoo (needs Accounting), Loyverse (free tier partial) | 2 / 4 |

### What this means for a catalogue

**The irreducible core — five reports.** Sales summary, sales by payment method, sales by item, sales by employee, and a register/cash document. The first two are at 15/15; the next two at 13–14/15, with the only absentees being the two thinnest products in the survey. Anything shipping less than these five is below the floor the market has already set.

**The second ring — four more.** Tax, refunds, discounts, sales by category. All 11–13/15, and all present in every product that anyone would call complete.

**The register document is the real dividing line, not analytics.** 13 of 15 have one, and the two that do not — Zettle's standard app and FooSales — are conspicuous by it. Among the WooCommerce-native competitors specifically the split is stark: **FooSales, wePOS and Jovvie have no register closure at all**; YITH, Oliver and Hike do.

**Terminology is genuinely split, and it is not a regional accident.** Of the 15:

| Vendor | Uses "X-report" | Uses "Z-report" | Its own term |
|---|---|---|---|
| Loyverse | **Yes** | **Yes** | "current shift report (X-report)" / "closed shift report (Z-report)" |
| SumUp | **Yes** | **Yes** | "X Report (All Staff)", "Employee X Report", "Z reports" |
| Erply | **Yes** | **Yes** | X = POS, one day, one register; Z = back office, multi-day/store |
| Zettle (non-UK) | **Yes** | **Yes** | "X-dagrapport" / "Z-dagrapport" — paid product only |
| Toast | No | **Yes** | "Z Report" — but it does **not** close the day |
| Korona | No | **Yes** | "z-count", "z-tape", "End of Day Statement" |
| Oliver POS | No | **Yes** | "End-of-day Z-report", "Shift Summary (Z-report)" |
| Odoo | No | No | "Sales Details" / "Daily Sales Report", "Closing Control" |
| Square | No | No | "cash drawer session", "Close of Day" (Restaurants only) |
| Shopify | No | No | "register session", "discrepancy" |
| Lightspeed X | No | No | "register closure", "Closure #" |
| Lightspeed R | No | No | "closing count", "Cash Drawer Adjustment", "End of Day" |
| Clover | No | No | "Cash log" |
| Epos Now | No | No | "End of Day Report" (the only "Z report" it names is the card reader's) |
| FooSales | — | — | no such document |

**Seven of fifteen use "Z-report"; four use "X-report".** The X/Z vendors skew European and fiscal-facing (Loyverse, SumUp, Erply, Zettle-non-UK), plus Toast, Korona and Oliver. The large Anglophone incumbents — Square, Shopify, Lightspeed (both series), Clover — use none of it.

**A warning if you adopt the label:** Toast ships the *word* "Z Report" without the semantics — *"Printing the Z Report does not turn the day over. The data updates in real time as sales occur."* Merchants trained on Toast will expect a re-runnable summary, not a sealed document. Conversely Korona and Erply treat theirs as sealed: *"Once completed on the POS, a finalized z-count can not be modified"* (Korona), while Erply goes the other way entirely — *"X-reports can be edited in the back office at any time for accurate bookkeeping."* **There is no industry consensus on whether the register document is immutable.** Square, Shopify and Lightspeed R all allow post-hoc editing; Korona, Epos Now and Hike do not.

**Expected-vs-counted variance is rarer than the register document itself.** Present and named in Shopify (*discrepancy*), Lightspeed X (*shortfall* / *overpayment*), Lightspeed R (*shortages or overages*), Loyverse, SumUp, Erply, Korona (*Expected / Actual / Difference*), Epos Now (*Variance*), Odoo (*Payments Difference*), Toast (*Cash over / Cash short*), Oliver, Hike (*Expected / Actual / Difference* per payment type). **Square captures expected and counted but has no variance field at all** — it is absent from `CashDrawerShift` in the API, and Square's own sample data records a shortfall as free text. **YITH records cash in hand and cash total but documents no reconciliation.**

---

## B. The free-tier floor

This is the section that matters most for positioning, so it is stated precisely. "Free" means a $0 tier that a merchant can run a real shop on, not a trial.

### B.1 Square Free ($0/location)

Square's help centre names ten report families as *"available to all Square sellers"*:

| Free on Square | Notes |
|---|---|
| Sales summary, sales trends, payment methods | The POS app shows only sales summary |
| Item sales, category sales, modifier sales | **Dashboard only** |
| Discounts, comps and voids | Dashboard only |
| Tax, fees and service charges | App shows totals only |
| Transaction status | Account owners only |
| Transaction history | Also in the POS app |
| Gift cards | Also in the POS app |
| Disputes | Also in the POS app |
| Reconciliation | Gross sales → refunds → fees → deposits |
| **Custom reports AND Custom Report Builder** | Both free, permission-gated, **web Dashboard only** |
| **Cash drawer sessions** | Cash Management add-on, *"Add for free"* |
| Customer insights | **Card transactions only** — "Cash transactions aren't included at this time" |
| Invoices reporting, Square AI, Managerbot | All tiers |

**What Square Free does NOT get:** Team Sales, labour-vs-sales, all inventory economics (COGS, sell-through, aging, projected profit, variance), loyalty and marketing reporting, online store analytics — and, critically, **any day-close document**. Close of Day is Restaurants **Plus**; Live Sales is Plus. A Square Free seller has a drawer session and no Z-report equivalent.

> **The single most striking free-tier fact in this survey:** Square gives away a genuine **custom report builder** — metrics, groupings, filters, presets, saved reports — at $0. No other vendor does this at any price below Erply's or Hike's paid tiers.

### B.2 Loyverse (free, with add-ons)

| Free on Loyverse | Caveat |
|---|---|
| Sales summary, by item, by category, by payment type, by modifier, discounts, taxes, receipts | **Last 31 days only, and export is disabled entirely** |
| **Shifts — the full X-report and Z-report stack** | **Fully free.** Opening float, pay in/out, expected vs actual, difference, auto-printed Z on close |
| Low stock and negative stock alerts | Free |
| Customer purchase history | Free |
| Loyverse Dashboard mobile app | Free |
| **Offline: sales AND shift management keep working** | The on-device X/Z report survives an outage |

**Paid:** *Unlimited sales history* (€5/mo/store) lifts the 31-day cap **and is the only way to export any sales report**. *Advanced inventory* (€25/mo/store) gates inventory history, valuation and purchase orders. *Employee management* (€5/mo **per employee**) is what makes sales-by-employee non-empty.

> **Loyverse is the benchmark to beat on register documents.** It gives away the complete X/Z, cash-drawer and shift-reconciliation stack for free, uses the industry terminology explicitly, prints the Z automatically, **and it works offline.** SumUp charges £39/month for the same capability; Zettle does not offer it at all.

### B.3 Zettle / PayPal Point of Sale (free, no tiers)

There are **no subscription tiers** in the UK — every report is free:

| Free on Zettle |
|---|
| Sales data and Top selling products (in-app) |
| Reports overview: Big numbers, past days/weeks/months, sales and payments overview, sales by hour, top sellers |
| Sales details: by month / day / hour, payments and fees, redeemed gift cards, sales by channel, **VAT**, **Staff** |
| Sales by product, Sales by category, Gift card report, Account statement |
| Export: **PDF and Excel** (plus "Raw data Excel") from my.zettle.com; PDF only in the app |

**What Zettle does NOT have, at any price, in the standard app: any register document.** An enumeration of the entire 97-article GB help centre found no cash management, cash drawer, shift, till close, X-report or Z-report article. The only cash article is "Taking cash payments". X/Z reports exist **only** as a separate paid country-specific cash-register product — 299 SEK/month in Sweden plus 99 SEK per extra register.

**Also absent:** any offline mode in the standard app.

### B.4 SumUp POS Free ($0)

| Free on SumUp | Paid |
|---|---|
| Sales summary, Sales reports, Revenue reports (incl. Tax summary, Payment methods, Employee activity, Category, Gift Cards) | — |
| Payout reports, Fee invoices, Payments reports, Transaction reports, Online Store reports | — |
| Items reports | **Profit and Margin columns are POS Plus** |
| Discount reports, Insights (in-app) | — |
| **Daily / Monthly / Yearly fiscal archives, Cashbook history, and "The X report of the current day"** — as .zip of .csv | Described by SumUp as *"an easy and cost-free way to download the necessary documents"* |
| **Scheduled emailed payout reports (daily or monthly)** | The only free-tier vendor here with scheduling |
| — | **X Report, Employee X Report, Z reports, Cash report, till management, cash management** all require **POS Plus (£39/mo on a 12-month contract)** |

So SumUp's free tier has surprisingly complete *analytics* and a fiscal CSV archive, but the **interactive register close is paid**.

### B.5 Shopify POS Lite

Lite is $0 on top of a Shopify plan, so "free" is relative — but the gating is worth stating because it is narrower than commonly assumed.

| POS Lite gets | POS Pro adds (+$89/mo per location) |
|---|---|
| **All eight admin retail sales reports** (by product, variant, vendor, product type, location, staff member, staff daily, staff total) | **Daily Sales report** in the POS app |
| All Sales, Finance and Inventory reports in admin | **Total sales by staff** in the POS app |
| **Custom reports / data explorations** and ShopifyQL | **Admin cash tracking reports** (Cash tracking, Cash tracking summary, Opening/Closing discrepancy, Cash payments) |
| **Register sessions in the POS app** — open, add/remove cash, count, close, print | — |
| Session, Net payments, Session activity, Expected cash, Discrepancies | — |

**Plan-tier gating of reports is effectively dead at Shopify.** Its own Basic-plan page says *"The Basic plan comes with access to all reports, including the ability to create custom reports with data explorations"*, and the pricing table ticks "200+ real-time reports, plus custom analytics" identically on Basic, Grow, Advanced and Plus. POS Pro buys exactly three reporting things.

### B.6 Two more genuinely free tiers worth knowing

- **Odoo POS — One App Free.** The full POS app including the **Sales Details / Session Report PDF with Expected / Counted / Difference per payment method**, Opening Control, Cash In/Out, Set Maximum Difference and Authorized Difference — all at $0, for unlimited users, *"whatever the dependencies of the app"*. Accounting reports need a second app (Standard, €11.90/user/mo); Studio needs Custom (€17.90).
- **Oliver POS Free ($0).** Reports limited to **"Today only"**. The entire cash-drawer and end-of-session stack is **Pro ($29/mo)**.

### B.7 The free-tier floor, in one table

| Vendor | Free analytics | Free register document | Free export | Free offline reporting |
|---|---|---|---|---|
| **Loyverse** | Yes — **31-day cap** | **Yes, full X + Z** | **No** (paid add-on) | **Yes** (shifts + shift report) |
| **Odoo** | Yes (POS Orders report) | **Yes, full session close with variance** | Yes (CSV/XLS/PDF) | No |
| **Square** | Yes, broad | Drawer session only — **no day-close** | Yes (CSV) | No |
| **Zettle** | Yes, broad | **None** | Yes (PDF/Excel) | No (no offline mode) |
| **SumUp** | Yes, broad | Fiscal CSV archives only — **interactive close is £39/mo** | Yes (PDF/XLS/CSV) | UNCONFIRMED |
| **Shopify POS Lite** | Yes, near-complete | **Yes** (sessions in app); admin reports are Pro | Yes (CSV/XML/JSONL/Parquet) | No |
| **Oliver POS Free** | **"Today only"** | **No** (Pro) | UNCONFIRMED | No |

**The decision-relevant conclusion:** the free-tier bar for *analytics* is high and broadly similar — a sales summary, item/category, payment methods, tax, and staff. The bar for a *register document* is where free tiers diverge sharply, and only **Loyverse, Odoo and Shopify POS Lite** clear it. Square clears half of it (a drawer session, no day-close). Zettle and Oliver Free do not clear it at all.

---

## C. Custom and user-defined reports

| Vendor | Can a user build their own? | Feature name | How | Tier |
|---|---|---|---|---|
| **Square** | **Yes — two separate features** | **Custom reports** (multi-block) and **Custom Report Builder** | Blocks: Key statistics, Sales summary, Payment methods, Item sales, Category sales, Team member sales, Discounts, Modifier sales, Taxes. Builder: pick metrics, groupings (item/category/location/team member), filters; presets across Sales, Items, Team, Payments, Taxes | **Free**, permission-gated. **Web Dashboard only** — neither works in the POS app |
| **Shopify** | **Yes** | **Custom reports** from a **data exploration** | Customize a report or start from an empty exploration; saving also creates a dashboard metric card. Plus **ShopifyQL** (admin editor, GraphQL `shopifyqlQuery`, Python SDK/CLI) | **Any paid plan** (Basic included) |
| **Erply** | **Yes — the strongest true builder in the survey** | **Report Generator** / "Make a Custom Report" | Pick **Tables** with join validation, pick **Fields** as columns, **group by I** (subtotal blocks) and **group by II** (total rows), aggregation, blank filters become run-time prompts, reports filed into **Report Groups**; full schema published as an XLSX | **UNCONFIRMED** — no page states a tier; back office is excluded at the $59 entry tier |
| **Hike POS** | **Yes** | **Custom reports** | ADD CUSTOM REPORT → pick sections and data fields, display order, title, cover page, reporting period (max 90-day window), outlet | **Plus** ($99/mo annual) |
| **Lightspeed R-Series** | **Yes, but only in the add-on** | **Custom report** (Lightspeed Analytics) | Start from a report or **a blank template**; add Dimensions, Measures, Filters, Pivot and **Custom Fields** (custom dimensions, custom measures, table calculations); save and optionally share company-wide | **Lightspeed Analytics** full edition — **not in Analytics Core**. Which POS plan includes which edition: UNCONFIRMED |
| **Lightspeed X-Series** | **Partly — customize-and-save, not a builder** | **Saving customized reports** | Filters, measures and table formatting on the supplied report families, saved as their own tab. Admin and Manager roles only | **Plus** (banner); older per-report wording says "Advanced or Enterprise… or the advanced reporting module" |
| **Clover** | **Partly** | **Customizable business reports** | Pick a report type, then filter by Date Range / Employee / Order type / Source / Tender type / Device → Generate. Over 3 months becomes an emailed "Request a Report" job | **No tier stated** — only the Access Reporting permission |
| **Odoo** | **Yes, two ways** | **Odoo Studio**; **pivot and graph views** | Studio builds custom PDF reports, fields, views, models. Pivot/graph views give grouping and measures on any app | Studio = **Custom** (€17.90/user/mo), with carve-outs; pivot/graph = **free with the app** |
| **Toast** | **No builder** | — | Per-report filter bar plus **Show/hide columns**. Genuinely custom reporting means the **analytics API** | API requires **Restaurant Management Suite Pro or higher**, plus permissions 4.1, 4.2, 4.3 and 8.4 across every location |
| **Epos Now** | **No builder** | **Reporting Dashboards** | "compile essential data from various reports into a single, easily accessible interface", with scheduled email. Mechanics UNCONFIRMED — article slug unresolvable | UNCONFIRMED |
| **Korona** | **No builder** | Configurable **Dashboard** widgets | Add/reorder widgets (incl. Z-Count Validation, POS Balance); extensive per-report filters and drill-downs | Three widgets are Franchise-only |
| **Loyverse** | **No** | — | Column choice on Sales summary / Sales by item. API is read-mostly | — |
| **Zettle** | **No** | — | Date, staff and category filters only | — |
| **SumUp** | **No** | — | **Download center** — pick report type, timeframe, format | — |
| **Oliver POS** | **No** | — | CSV export of every report; filter per outlet, per register or globally; WooCommerce REST API inherited | CSV tier UNCONFIRMED |
| **FooSales** | **No** | — | WooCommerce order filters only. **No API and no hooks** — stated by the vendor | — |
| **wePOS / YITH / Jovvie** | **No** | — | wePOS: CSV order export (Pro). YITH: CSV closure report only. Jovvie: nothing documented; REST API exists | — |

**Three observations.**

1. **A real report builder is rare and it is not a premium feature everywhere.** Only Erply, Hike, Lightspeed Analytics and Odoo Studio offer genuine build-from-scratch. Square and Shopify offer strong metric-level builders **at their lowest tier**, which resets the expectation: a builder is no longer a differentiator you can charge for at the low end.
2. **Nobody's builder works at the till.** Square's is explicit — *"Custom reports cannot be viewed on your point of sale app"* — and every other builder is a back-office or separate-app surface. Custom reporting is universally a back-office activity.
3. **The API is the real escape hatch, and its gating is the sharpest paid line in the survey.** Toast's analytics API needs Restaurant Management Suite Pro; Lightspeed X-Series API is Plus-only; Odoo's external API is Custom-plan-only; Erply lists API access only on its two upper tiers. Against that, **Korona puts "Open API access" on its lowest tier**, and FooSales has no API at all.

---

## D. Export formats and offline availability

| Vendor | CSV | Excel/XLSX | PDF | Scheduled email | Reports offline? |
|---|---|---|---|---|---|
| **Square** | **Yes** (canonical) | Some reports only | **No** — undocumented anywhere | Daily sales summary email only; **no general scheduler** | **No** |
| **Shopify** | Yes | **No** — CSV only, Excel just opens it | **No** — print to PDF instead | **None documented** | **No** |
| **Lightspeed X-Series** | Yes | **Yes** (preferred — CSV mangles long/leading-zero SKUs) | Closing summary only | **Yes** — Advanced/Enterprise/Plus; 50 recipients; daily/weekly/monthly; relative date ranges only | **No** — Sell and Status pages only; **register cannot even be closed offline** |
| **Lightspeed R-Series** | Yes | No (POS reports) | Print only | **None for built-in reports**; Analytics only | **No POS offline mode documented at all** |
| **Clover** | Yes | — | — | **Only** the >3-month "Requested report" flow | **UNCONFIRMED** — offline is a payments feature only |
| **Toast** | Yes | Yes (`.xls`, multi-sheet) | Print to PDF | **Yes** — automatic nightly email; fixed Email Types, **no custom digest** | **No** — *"Reports do not include data from offline devices until they reconnect"*; Shift Review unavailable. **Drawer and printing keep working** |
| **Loyverse** | **Yes, only** | No | Inventory documents only | UNCONFIRMED | **Yes — shifts and the shift report work offline** |
| **Epos Now** | Yes | **Yes**, plus **Word** | **No** | Dashboards only | UNCONFIRMED |
| **Zettle** | **No CSV option mentioned** | **Yes**, plus "Raw data Excel" | **Yes** | UNCONFIRMED | No offline mode in the standard app |
| **SumUp** | Yes (fiscal .zip of .csv) | Yes (XLS) | **Yes** | **Yes** — payout reports daily or monthly | UNCONFIRMED |
| **Erply** | UNCONFIRMED | **Yes** (.xls) | UNCONFIRMED | **UNCONFIRMED / not found** | **No — explicitly blocked.** "Close the day", "Open the day", "View or print the X-Report" and "View recent sales" are all unsupported offline |
| **Korona** | UNCONFIRMED | **Yes** | **Yes** | **Yes** — Automatic Report Dispatch; six named reports; intervals + time of day | Z-count absent from the cloud-required list, but **UNCONFIRMED** |
| **Odoo** | Yes (.csv/.xls) | Yes (.xlsx pivot) | **Yes** (qweb-pdf, accounting) | UNCONFIRMED | **No** — offline is scoped to "order creation and management" |
| **Oliver POS** | **Yes, only** | No | No | Z-report auto-emails | **No** |
| **FooSales** | Yes (via WooCommerce) | No | No | **No** | **UNCONFIRMED and notably silent** |

**Patterns worth carrying:**

- **PDF export of analytics reports is the exception, not the rule.** Square, Shopify, Lightspeed (both), Oliver and FooSales all lack it; several offer "print to PDF" as the substitute. Zettle, SumUp, Korona and Odoo genuinely export PDF.
- **Scheduled email is a mid-market feature.** Present at Lightspeed X (paid tiers), Toast, Korona, SumUp and Hike. **Absent entirely at Shopify, Erply and every WooCommerce-native plugin bar Oliver's auto-emailed Z.** Square has exactly one daily email and no scheduler.
- **Offline reporting is almost universally absent.** Only **Loyverse** genuinely ships it — sales and shift management, including the on-device X/Z report, keep working through an outage. Everyone else either scopes offline strictly to order capture (Odoo, Shopify, FooSales, Oliver) or blocks it explicitly (Erply, Toast, Lightspeed X). **Lightspeed X cannot even close a register offline**, because closing calls the cloud for an authoritative timestamp — a design constraint worth weighing.
- **Two vendors warn about export fidelity** in ways worth copying: Lightspeed X tells merchants to use XLSX because *"SKUs that are more than 14 characters long or have a leading 0 are often altered when exported as a CSV file"*, and Shopify warns that a CSV sales export emits one row per line item, so a 5-line order inflates apparent order count.
