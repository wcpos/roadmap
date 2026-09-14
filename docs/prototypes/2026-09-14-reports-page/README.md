# Reports page — prototype for wcpos/roadmap#304

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build). Deep links: `?pro=0|1&viewport=phone|tablet&theme=dark&report=sales&cmp=week`.

**Question it answers:** what does the Reports page look like once the catalogue is Session · Closures · Sales · Cash movements (#303) plus registered reports (#305), and how does a Free user meet its edges now that the gate is scope-level, not page-level (charting decision 7)?

**Second cut (2026-09-14, same day).** The first cut — a left column of reports, a Session/Dates switch, a row of scope chips and a row of grouping chips — read to Paul as *"this is complex"*, against the principle of hiding complexity. He also asked for the joy of a chart (today vs yesterday, this week vs last, online vs POS), for the order checkboxes the current screen has, and for where WP Admin templates fit. This cut is the app's own Reports page rehosted: the filter pills it already has, the chart it already has (now a comparison), the orders list with its checkboxes, and the report pane with one report select and one template select in its header.

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Width** | Tablet (1180, icon rail) or Phone (390; Orders and Report swap in the lower card) |
| **Edition** | Pro / Free. Free is scoped to today on this register; the page is never blurred |
| **Register** | Session open (default scope = the open session) or closed (scope falls back to today) |
| **Stores** | 1, or 2 (Pro) — adds the Store pill |
| **Network** | Offline: the registered report goes to "Report unavailable offline" |
| **Theme** | Light / dark |

Inside the frame everything is live: the pills, the chart's three comparisons, the order checkboxes, the report select, the template select, the closures list and its drill-in.

## The page

- **The chart leads.** One headline figure with a delta and three comparisons: the date pill's period against the one before it (today vs yesterday by hour, or a range by day), this week vs last, online vs POS. It follows the pills and the ticked orders.
- **The filter pills are the scope.** The first pill is the date pill; its popover starts with *Open now* and today's closures, then the date presets, then earlier sessions. Choosing a session scopes the page to that session; choosing dates scopes it to the range. No mode switch. Register, Store (when more than one), Cashier and Customer pills as today.
- **One report select** in the report card's header, grouped: Sales summary and its groupings (payment method, cashier, register, tax rate, item, category), Cash movements, Session, Closures, then *From plugins*. An entry the current scope cannot answer is dimmed with the reason (*pick a session in the date pill* / *pick dates in the date pill*).
- **One template select** beside it, listing the merchant's WP Admin templates for the type the chosen report uses (`closure` for Session, `report` for the rest). The pane renders the chosen template: Default (built in), Thermal 80 mm, A4 sales sheet.
- **Session is a document** (closure-shaped). Footer: *Print X-report* while open, *Reprint copy* + *Recount…* when closed. **Sales, Cash movements and registered reports are tables** with a heading line naming what is counted and on which basis. Footer: *Export CSV*, *Print*.
- **Closures is a list of Session reports** inside the report pane; a row swaps the pane to that closure with a back link (phone: its own page).
- **Orders keep their checkboxes.** Unticking takes an order out of the headline, the chart and the Sales figures; Session and Closures are records and ignore the ticks.
- **Free:** the date, register and store pills carry a lock; Pro rows in their popovers are dimmed with a lock; tapping one names the tapped thing in the popover foot (*Earlier days are in WCPOS Pro* / *Earlier sessions…* / *Other registers…* / *Other stores…*) with *See Pro*.

## Where the register panel's rows sit

Below the frame: the register panel from #214 with its two report rows numbered, and what each does. *Print X-report* prints the Session report for the open session from the till, no navigation. The last-closure row reprints from the till and, on tap, opens Reports › Session on that closure. Reports › Session carries the same two actions in its footer. Same document, same template.

## Screens

`screens/` holds Playwright captures for every state the strip can reach; `node shoot.js` regenerates them (uses the monorepo's Playwright) and fails on any page or console error.

## Reaction

- **2026-09-14, picker: B, the list.** Tabs (A) and the launcher (C) were shown beside it and dropped the same day (git history has them). A search for "tax" finds *Sales › by tax rate*, plugin reports fit under their own heading, and phone gets a plain list page.
- **2026-09-14, Free gate: in the picker.** No banner. The Pro rows sit dimmed with a lock inside each scope popover and the upgrade line shows in the popover foot only when a Free user taps one; the page keeps one status strip, the scope bar.
- **2026-09-14, upgrade copy: name the tapped thing.** One line per locked row kind, one button *See Pro*.
- **2026-09-14, first cut rejected as complex; second cut built the same day.** Paul: *"this is complex"*, and three asks — a chart for joy (today vs yesterday, this week vs last, online vs POS), keep the order checkboxes, and show where WP Admin templates fit. The list column, the mode switch and the grouping chips are gone; the page is the app's own shape. Note for the map: charting decision 4 ruled out *trend comparison*; short comparisons drawn on the device from orders already fetched are now in, yearly stays out.
