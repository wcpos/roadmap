# Reports page — prototype for wcpos/roadmap#304

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build). Deep links, one example: `index.html?pro=0&viewport=phone&theme=dark` opens Free on a phone in dark mode. Parameters: `pro` (`0` or `1`), `viewport` (`phone` or `tablet`), `theme` (`dark`), `view` (`closures`), `gran` (`day`, `week`, `month`), `cmp` (`lastweek`, `yesterday`, `lastyear`).

**Fourth pass (2026-09-14, same day, after "much better"):** the period title is now the date menu (Today, Yesterday, This week, Last week, This month, Last month, and a custom range reaching as far back as the device's history goes, the Pro retention period); the four reports the first cut had and this one lacked are back (Sales summary behind the print icon on the hero, Sales by register when the scope is All registers, Categories, Cash movements); the filter gained order status; and one template select sits in every panel header so the merchant's WP Admin templates are visible everywhere, with the pane rendering in the chosen one and Print printing what is shown.

**Question it answers:** what does the Reports page look like once the catalogue is Session · Closures · Sales · Cash movements (#303) plus registered reports (#305), and how does a Free user meet its edges now that the gate is scope-level, not page-level (charting decision 7)?

## Third cut (2026-09-14)

The first cut (a report list, a mode switch, chip rows) read as *"this is complex"*. The second cut rehosted the current Reports screen with a chart bolted on, and read as the same design. This cut starts from a survey of what Square, Shopify POS, SumUp, Zettle, Toast, Lightspeed and Loyverse show a store owner, plus how Stripe, Monzo and Toast make a number feel like something (research briefs summarised below).

Two rooms, a segmented control in the page bar:

- **Sales** is a glance. One number (with a print icon that opens the Sales summary document), the same figure from the comparison period directly under it with a delta chip, three companions (orders, average order, items), hourly bars with the comparison period as grey ghost bars behind them, including the hours still to come, and a one-line caption naming the busiest hour. Under that, equal tiles: Payments, In store · Online, Top products, Cashiers, Registers (when the scope is All registers), Categories, Taxes, Orders, Refunds · Discounts, Cash movements, and a plugin's Deposits. A tile holds one number, one micro-chart or three rows, one line. Tapping a tile opens the real table in a side panel (a page on the phone) with a template select in its header and Export CSV and Print in its footer.
- **Closures** is the paperwork. The open session at the top with the expected drawer and *Print X-report*; below it the closures, grouped by day, with the drawer result as the last column. A row opens the closure as recorded, with corrections and the settled figure, a template select in the panel header, and *Recount…* / *Reprint* in the footer.

What the research decided:

- **Comparison on by default, referent = same weekday last week.** Shopify POS, Toast Now and Square Dashboard all compare to the same day last week because retail weeks are weekly-periodic; Loyverse alone uses yesterday. Yesterday and same day last year are one tap away under the headline.
- **Ghost bars, not a second chart.** Toast Now renders the comparison as grey bars behind the live ones with a signed % arrow; Loyverse overlays yesterday by default. Prior-period figure in smaller type under the headline is Stripe's Home pattern.
- **Hourly bars for today** are what every vendor draws (Zettle captions them with the staffing decision they serve; Square removing its hourly curve is the loudest complaint in its reviews). The bucket widens to days for Week and Month, the period steps with ‹ ›.
- **Tiles are the drill-down, not a menu of report names.** Nobody opens on a list of reports. Three rows for top-N (Shopify), a chevron to the full table (Toast, Zettle's *View report*).
- **The documents live in their own named room.** Stripe keeps tax documents under Reporting › Documents so the home stays five numbers; here Closures holds the session, the closures, reprints, recounts and templates.
- **Nobody gamifies.** No rings, streaks or celebratory copy were found in any of the eight POS apps; the delta arrow and a plain-English caption are as far as the category goes, and that matches the design guidelines' definition of joy.

## Dates

The period title is the menu: six presets and a custom range (two date fields, Apply). The cap is the Pro retention period, not a second number (Paul, 2026-09-14: *"as you recommend"*): the copy says *as far back as your history goes*, and a longer range gets one line pointing at WP Admin › Analytics. ‹ › step by the unit chosen, custom ranges included. The comparison for a day is a menu (same day last week by default, yesterday, same day last year); for a week, month or custom range it is the period of the same length immediately before.

## Templates

One select in every panel header, listing the merchant's WP Admin templates for the type the document uses (`report` for the tables and the Sales summary, `closure` for the session and closures), with *Default (built in)* first. The pane renders in the chosen template: Thermal 80 mm is a monospace slip, A4 sales sheet and Weekend handover are branded pages. Print and Reprint print what is shown. The popover's one line says where templates are managed and that a template formats a report and cannot add data.

## Coverage against the first cut

| First cut | Here |
|---|---|
| Session document, X-report, reprint, recount | Closures room |
| Closures list, corrections, settled figure | Closures room |
| Sales summary document | Print icon on the hero |
| Sales by payment, cashier, register, tax, item, category | Tiles and their panels (Registers only under All registers) |
| Cash movements | Tile and panel |
| Registered plugin reports | Deposits tile |
| Register, store, cashier, status, date filters | Scope chip, filter, date menu |
| Customer filter | Dropped: the current screen has it, no vendor surveyed does, and it is a per-customer order list, not a report |
| Report search | Dropped: tiles replace the list |

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Width** | Tablet (1180, icon rail) or Phone (390; tiles go two-up, panels become pages, popovers become sheets) |
| **Edition** | Pro / Free. Free is today on this register; the page is never blurred |
| **Register** | Session open (Closures shows the open session) or closed (shows the last closure with Reprint) |
| **Stores** | 1, or 2 (Pro) — adds stores to the scope popover |
| **Network** | Offline: the plugin's Deposits tile goes to "Unavailable offline" |
| **Theme** | Light / dark |

Inside the frame everything is live: ‹ ›, the date menu and custom range, the comparison menu, tapping a bar, every tile and its panel, the Orders checkboxes (unticking changes every number and shows a chip on the hero), the cashier filter, the scope popover, the Closures list, the closure documents and their templates.

## Free

Today on this register. ‹, every date preset but Today, the custom range, other registers, other stores, earlier closures and last-year comparison each name the tapped thing in a small popover (*Earlier days are in WCPOS Pro*, *Weeks and months are in WCPOS Pro*, *Earlier closures are in WCPOS Pro*…) with one button, *See Pro*. Assumption to react to: the comparison with last week still shows on Free, because it is the joy and it is a number, not a report; it does need last week's orders on the device.

## Where the register panel's rows sit

Below the frame: the register panel from #214 with its two report rows numbered. *Print X-report* prints the open session from the till; the same document opens from Closures › *Print X-report*. The last-closure row reprints from the till and, on tap, opens Closures on that closure. Nothing on the register panel points at Sales.

## Screens

`screens/` holds Playwright captures for every state the strip can reach; `node shoot.js` regenerates them (uses the monorepo's Playwright) and fails on any page or console error.

## Reaction log

- **2026-09-14, picker: B, the list.** Tabs (A) and the launcher (C) were shown beside it and dropped the same day (git history has them).
- **2026-09-14, Free gate: in the picker.** No banner; the Pro rows sit dimmed with a lock inside the popover and the upgrade line shows in its foot only when tapped.
- **2026-09-14, upgrade copy: name the tapped thing.** One line per locked row kind, one button *See Pro*.
- **2026-09-14, first cut rejected as complex; second cut built the same day** (the app's own shape with a comparison chart, checkboxes, a report select and a template select).
- **2026-09-14, custom-range cap = retention.** Asked whether three months is the line or the cap should follow Pro retention; *"as you recommend"*: it follows retention.
- **2026-09-14, third cut: "This is looking much better!!"** Asked for date range options with a custom range (about 3 months max), whether the visual version covers everything the first cut had, and how custom templates are presented. Fourth pass answers all three; the coverage table above is the answer to the second.
- **2026-09-14, second cut rejected as the same design.** Paul: *"you've reproduced the same shitty design that currently exists. Take a step back. Do some proper research on Mobbin and try to come up with something a little more inspired."* Mobbin's POS report screens turned out to be login-gated and not indexed, so the survey used vendor help centres, changelogs and app-store reviews for eight POS apps plus the fintech "engaging numbers" references. Third cut is what came out; both earlier cuts are in git history.

Note for the map: charting decision 4 ruled out *trend comparison*; short comparisons drawn on the device from orders already fetched (same day last week, yesterday, last year; week vs week; month vs month) are now in, yearly analytics stays out.
