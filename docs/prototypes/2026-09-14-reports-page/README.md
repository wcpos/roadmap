# Reports page — prototype for wcpos/roadmap#304

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build). Deep links: `?pro=0|1&viewport=phone|tablet&theme=dark&view=closures&gran=week&cmp=yesterday`.

**Question it answers:** what does the Reports page look like once the catalogue is Session · Closures · Sales · Cash movements (#303) plus registered reports (#305), and how does a Free user meet its edges now that the gate is scope-level, not page-level (charting decision 7)?

## Third cut (2026-09-14)

The first cut (a report list, a mode switch, chip rows) read as *"this is complex"*. The second cut rehosted the current Reports screen with a chart bolted on, and read as the same design. This cut starts from a survey of what Square, Shopify POS, SumUp, Zettle, Toast, Lightspeed and Loyverse show a store owner, plus how Stripe, Monzo and Toast make a number feel like something (research briefs summarised below).

Two rooms, a segmented control in the page bar:

- **Sales** is a glance. One number, the same figure from the comparison period directly under it with a delta chip, three companions (orders, average order, items), hourly bars with the comparison period as grey ghost bars behind them, including the hours still to come, and a one-line caption naming the busiest hour. Under that, eight equal tiles: Payments, In store · Online, Top products, Cashiers, Taxes, Orders, Refunds · Discounts, and a plugin's Deposits. A tile holds one number, one micro-chart or three rows, one line. Tapping a tile opens the real table in a side panel (a page on the phone) with Export CSV and Print; Print is where the WP Admin template is chosen.
- **Closures** is the paperwork. The open session at the top with the expected drawer and *Print X-report*; below it the closures, grouped by day, with the drawer result as the last column. A row opens the closure as recorded, with corrections and the settled figure, a template select in the panel header, and *Recount…* / *Reprint* in the footer.

What the research decided:

- **Comparison on by default, referent = same weekday last week.** Shopify POS, Toast Now and Square Dashboard all compare to the same day last week because retail weeks are weekly-periodic; Loyverse alone uses yesterday. Yesterday and same day last year are one tap away under the headline.
- **Ghost bars, not a second chart.** Toast Now renders the comparison as grey bars behind the live ones with a signed % arrow; Loyverse overlays yesterday by default. Prior-period figure in smaller type under the headline is Stripe's Home pattern.
- **Hourly bars for today** are what every vendor draws (Zettle captions them with the staffing decision they serve; Square removing its hourly curve is the loudest complaint in its reviews). The bucket widens to days for Week and Month, the period steps with ‹ ›.
- **Tiles are the drill-down, not a menu of report names.** Nobody opens on a list of reports. Three rows for top-N (Shopify), a chevron to the full table (Toast, Zettle's *View report*).
- **The documents live in their own named room.** Stripe keeps tax documents under Reporting › Documents so the home stays five numbers; here Closures holds the session, the closures, reprints, recounts and templates.
- **Nobody gamifies.** No rings, streaks or celebratory copy were found in any of the eight POS apps; the delta arrow and a plain-English caption are as far as the category goes, and that matches the design guidelines' definition of joy.

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Width** | Tablet (1180, icon rail) or Phone (390; tiles go two-up, panels become pages) |
| **Edition** | Pro / Free. Free is today on this register; the page is never blurred |
| **Register** | Session open (Closures shows the open session) or closed (shows the last closure with Reprint) |
| **Stores** | 1, or 2 (Pro) — adds stores to the scope popover |
| **Network** | Offline: the plugin's Deposits tile goes to "Unavailable offline" |
| **Theme** | Light / dark |

Inside the frame everything is live: ‹ › and Day / Week / Month, the comparison menu, tapping a bar, every tile and its panel, the Orders checkboxes (unticking changes every number and shows a chip on the hero), the cashier filter, the scope popover, the Closures list, the closure documents and their templates.

## Free

Today on this register. ‹, Week, Month, other registers, other stores, earlier closures and last-year comparison each name the tapped thing in a small popover (*Earlier days are in WCPOS Pro*, *Weeks and months are in WCPOS Pro*, *Earlier closures are in WCPOS Pro*…) with one button, *See Pro*. Assumption to react to: the comparison with last week still shows on Free, because it is the joy and it is a number, not a report; it does need last week's orders on the device.

## Where the register panel's rows sit

Below the frame: the register panel from #214 with its two report rows numbered. *Print X-report* prints the open session from the till; the same document opens from Closures › *Print X-report*. The last-closure row reprints from the till and, on tap, opens Closures on that closure. Nothing on the register panel points at Sales.

## Screens

`screens/` holds Playwright captures for every state the strip can reach; `node shoot.js` regenerates them (uses the monorepo's Playwright) and fails on any page or console error.

## Reaction log

- **2026-09-14, picker: B, the list.** Tabs (A) and the launcher (C) were shown beside it and dropped the same day (git history has them).
- **2026-09-14, Free gate: in the picker.** No banner; the Pro rows sit dimmed with a lock inside the popover and the upgrade line shows in its foot only when tapped.
- **2026-09-14, upgrade copy: name the tapped thing.** One line per locked row kind, one button *See Pro*.
- **2026-09-14, first cut rejected as complex; second cut built the same day** (the app's own shape with a comparison chart, checkboxes, a report select and a template select).
- **2026-09-14, second cut rejected as the same design.** Paul: *"you've reproduced the same shitty design that currently exists. Take a step back. Do some proper research on Mobbin and try to come up with something a little more inspired."* Mobbin's POS report screens turned out to be login-gated and not indexed, so the survey used vendor help centres, changelogs and app-store reviews for eight POS apps plus the fintech "engaging numbers" references. Third cut is what came out; both earlier cuts are in git history.

Note for the map: charting decision 4 ruled out *trend comparison*; short comparisons drawn on the device from orders already fetched (same day last week, yesterday, last year; week vs week; month vs month) are now in, yearly analytics stays out.
