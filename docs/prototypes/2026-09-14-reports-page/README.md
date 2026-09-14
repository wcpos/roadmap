# Reports page — prototype for wcpos/roadmap#304

Throwaway, self-contained HTML. Open `index.html` in a browser (double-click; no server, no build). Deep links: `?pro=0|1&viewport|1|B|C&pro=0|1&viewport=phone|tablet&theme=dark&report=sales`.

**Question it answers:** what does the Reports page look like once the catalogue is Session · Closures · Sales · Cash movements (#303) plus registered reports (#305), and how does a Free user meet its edges now that the gate is scope-level, not page-level (charting decision 7)?

## Driving it

The dark strip at the top is not part of the design.

| Control | What it changes |
|---|---|
| **Width** | Tablet (1180, icon rail) or Phone (390) |
| **Edition** | Pro / Free. Free is scoped to today on this register; the page is never blurred |
| **Register** | Session open (default scope = the open session) or closed (Session → last session; Sales → today) |
| **Stores** | 1, or 2 (Pro) — adds the Store chip |
| **Network** | Offline: the registered report goes to "Report unavailable offline" |
| **Theme** | Light / dark |

Inside the frame everything is live: pick a report, switch Session / Dates, open the scope popovers (sheets on phone), choose a closure from the list to read it as recorded, change the Sales grouping, search the list for "tax". The state renders under the frame.

## The page

- **One scope control, two modes.** `[Session | Dates]` appears only for reports that accept both (Sales, Cash movements). Session takes only a session; Closures takes only dates. The value chip's popover lists the open session, today's closures, then earlier sessions.
- **The session names its register**, so the Register chip exists only in Dates mode. Store chip only when the store count is more than one. Cashier chip on Sales and Cash movements.
- **Default scope:** the open session when there is one; otherwise today for Closures and Sales, the last session for Session.
- **Session is a document** (closure-shaped, `closure` template): opened / closed, float, expected vs counted, variance with settled figures beside the recorded ones, tenders, cash movements, corrections. Footer: *Print X-report* while open, *Reprint copy* + *Recount…* when closed. **Sales, Cash movements and registered reports are tables** (`report` template): a heading line naming what is counted and on which basis, columns, rows, a total row. Footer: *Export CSV*, *Print*.
- **Closures is a list of Session reports.** A row opens the Session report beside the list (tablet) or as its own page (phone, `‹ Closures  Closure 12`).
- **Sales is one report with a group-by** chip row: payment method, cashier, register, tax rate, item, category. The columns change with the grouping; the heading says *Counts payments* or *Counts sales* and names the basis (#303 clarification).
- **Registered report** (Deposits outstanding, from a plugin) sits under *From plugins*, renders through the default report table, and needs a connection.
- **Free:** the scope chips carry a lock; Pro rows in every popover are dimmed with a lock; tapping one shows one line in the popover's foot — *Past sessions, earlier days and other registers are in WCPOS Pro* — with *See Pro*. The report on the page is real and complete for its scope.

## Where the register panel's rows sit

Below the frame: the register panel from #214 with its two report rows numbered, and what each does. *Print X-report* prints the Session report for the open session from the till, no navigation. The last-closure row reprints from the till and, on tap, opens Reports › Session on that closure. Reports › Session carries the same two actions in its footer. Same document, same template.

## Screens

`screens/` holds Playwright captures for every state the strip can reach; `node shoot.js` regenerates them (uses the monorepo's Playwright) and fails on any page or console error.

## Reaction

- **2026-09-14, picker: B, the list.** Tabs (A) and the launcher (C) were shown beside it and dropped the same day (git history has them). A search for "tax" finds *Sales › by tax rate*, plugin reports fit under their own heading, and phone gets a plain list page.
- **2026-09-14, Free gate: in the picker.** No banner. The Pro rows sit dimmed with a lock inside each scope popover and the upgrade line shows in the popover foot only when a Free user taps one; the page keeps one status strip, the scope bar.
