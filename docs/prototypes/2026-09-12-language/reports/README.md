# Reports in the 1.11.0 language

The drawing lives in `../pos-register/index.html`: tap **Reports** in the rail (the menu sheet on
the phone), the way the app is used; there is no switch in the strip (Paul 2026-09-17). Open
`../pos-register/index.html?screen=reports` to land on it directly; `index.html` redirects to it.
No server or build is needed; the dark control strip is not part of the design.

**Question it answers:** can the decided Sales glance and shipped Closures paperwork read as
another room in the register's language, at phone, tablet and desktop widths?

## The chart (component review, 2026-09-17)

Paul started the component-by-component review with the hero chart. `chart-variants.html`
holds the eight drawings that led here (A the ghost bars as drawn, B–G the alternatives from
the Mobbin references: Strava's busiest-hour callout, Midday's dashed comparison, Monzo,
Chase, Shopify's compare, Eight Sleep's pairs, H the result). Decided: one chart, two views
behind a toggle in the chart head. **By hour** (By day on a week or month): the period's bars,
the busiest one full-colour with its amount, the comparison as a dashed line, buckets still to
come as faint bars of the comparison. **Running total**: the cumulative line against the
comparison's, the busiest bucket as the thick segment, the closing figure and the comparison's
whole-period figure labelled. Tax is not on the chart: the 1.10.x chart stacked the tax slice on
every bar, and that answers no hour-by-hour question; tax has the Taxes tile and the summary.
The toggle is remembered until the next State preset (`RS.chart`).

**Hero and period (second pass, same day).** Paul: the "£975.23 by now last Monday" line makes
no sense once the chart shows it; he wants Today, This week and This month as visible options
with the comparison following automatically (yesterday, the week before, the month before),
same day last week as the one alternative for a day; and the companions' "11 by now" line was
unclear. Done: the line is gone; the delta chip reads "+1.3% vs yesterday" and opens the
comparison menu (Yesterday, Same day last week, with a note that a live day is compared at the
same time of day); the scope row starts with a Today | This week | This month segment (week and
month locked on Free), then the stepper with the dates ("Mon 14 Sep", "14–20 Sep",
"September") and the earlier/custom menu; each companion carries a signed difference in its
own unit (+3, −£0.05, +9). The 2026-09-14 default of "same day last week" is superseded by
yesterday. Same day last year is gone.

**Scope row (third pass, same day).** Paul did not notice the date picker sitting above the
chart in its own row ("bad UI"); the date and the chart are linked and should show it; the
bordered chips separating everything go; "Front till · UK Store" is a title and belongs in the
bar the way "UK Store" sits above the cart; the picker should carry the quick ranges the way
the 1.10 picker does. Done: the Sales room has no scope row. The date is the hero card's title,
"Today · Mon 14 Sep ⌄", and opens a picker with Today / Yesterday / This week / Last week /
This month / Last month beside a calendar (tap a day, or two days for a range; Done closes;
week, month and earlier days locked on Free). The bar's place is the register and store and
opens that menu; the filter is a sliders icon beside the bell with a dot when active. The delta
chip and the companions' differences are plain coloured text, no borders. Closures keeps a
slim scope row with the same date button and its ⋮. The stepper and the two date inputs are
gone; the segment from the second pass is gone.

**Declutter (fourth pass, same day).** Paul: the "Busiest hour 12 pm, £212.40 from 2 orders"
sentence is obvious from the graph; more graph, less text. Done: the sentence and the legend
line under the chart are gone; the view toggle and the print button share the title row with
the date; the plot is a third taller; the busiest bar's label reads "£212.40 · 2 orders". The
comparison is named once, in the chip; the dashed line and the faint bars still to come carry
no legend.

**Below the chart (fifth pass, same day).** Paul: think about what a cashier or owner comes
here to do; the most common things front and centre; not a fan of the tile cards; and why is
Closures a tab at the top when it is just another kind of information? Answer: it is. Done,
behind the strip's *Below the chart* switch so both can be compared: **one list, Closures a
row** (the pick, on by default) replaces the tiles and the Sales | Closures tabs. Rows in the
order of the jobs: Orders (the orders behind the figure, with the exclusions), Payments (the
till and the card batch), Closures (the till's state and today's closures), Taxes, Refunds and
discounts, Top products, Cashiers, Categories, Registers when all are shown, Cash movements,
Deposits. Each row is name, one-line summary, figure, chevron, and opens the same panel the
tile did. Closures opens as a panel holding the shipped room (session card, closures by day,
the ⋮ export); a closure opened from it has a back arrow to the list; on the phone it is a
page with the crumb. The other position, *Sales | Closures tabs + tiles (as drawn)*, stays for
comparison and goes once he picks.

**Panels (sixth pass, same day).** Paul: look on Mobbin, surely we can do better than the list.
The references (Vercel, Framer, Featurebase and Lovable analytics on the web; Lloyds, Revolut,
YNAB and Starling spending on the phone) all put the *content* of each report under the chart,
three or four rows deep with a share bar, and nobody taps a name to see anything. Done, as the
switch's third and default position, **panels**: six panels in the order of the jobs, each a
head (name, figure, chevron, opens the whole report) over its first rows. Orders: the last
three and "and 11 more". Payments: Card, Cash, PayPal with share bars and order counts.
Closures: the till now (open since 13:00 by Dylan, £293.70 expected) then the period's
closures with their drawer result. Top products, Cashiers, Taxes with bars. The five reports
nobody reads daily (Categories, Refunds and discounts, Cash movements, Deposits, Registers
when all) sit under the panels as the plain list. Three across on desktop, two on tablet, one
on the phone. My pick; the list and the tiles stay behind the switch until he chooses.

## What changed from 2026-09-14

- Copied the register's tokens, controls, rail, page bar, notification panel, side-panel and
  sheet classes. The avatar is at the top of the rail, Reports is active, and the bell is in
  the page bar. Phone has its menu and avatar in the bar and Sales / Closures below it.
- Added the full-width Free strip outside the body, with top / bottom / Pro positions.
  This does not replace the existing scope-level gates.
- Applied all nine themes and all three scales. Icons follow the theme using the register's
  exact selection rule. No glyphs were added; existing chevrons, sliders, lock, chart, printer
  and document glyphs cover this screen.
- Rehosted detail documents in right-side panels and phone pages. Native template selects
  list the same report / closure templates; the chosen template changes the rendered document.
- Used frameless tables on desktop and labelled rows on touch, footer counts, sentence case,
  the register's pound-prefix `fmt()`, and dot-plus-word status.
- Matched the shipped closure row fields: closure number, register, closed-by name and times,
  counted cash, short / over / Exact result, and Unsynced / Corrected markers. Recorded figures
  remain intact; corrections and recorded → settled figures are separate.
- Added the requested recount drawing, online error with Retry, still loading skeletons and
  empty state. Recount has a required reason capped at 500 characters, counted total,
  denominations and the manager approval line. Offline save is disabled with Connect to recount.

## What did not change

The two-room content decision is from 2026-09-14; the Closures structure is from the supplied
2026-09-17 shipped snapshot. There is no report picker, search, customer filter or session/date
mode toggle. Dates, comparison choices, ghost bars, order exclusions, tile topics and document
templates remain. Fixtures are copied from the prior prototype, fixed to Monday 14 September:
orders, hours, products, cashiers, closures, corrections and cash movements.

The shared language files and the reference `_content/` tree were not modified.

## Driving it

Width: phone 390 / tablet 1024 / desktop 1440. Scale: compact / regular / spacious.
Theme: light, dark, paper, bold, warm, market, ocean, sunset, monochrome.
Plan: Free strip at top (initial), bottom, or Pro without it. Stores: one or two.

The State row draws all nineteen cases:

- Sales: today, last week, orders left out, date menu, scope menu, Payments panel, Orders panel.
- Closures: session open, register closed, closure with corrections, recount, empty, online error.
- Loading, offline Sales, offline recount, Free Sales gate, Free Closures gate, bell panel.

States requiring historical access select Pro. Free states select the top strip; the other
presets keep the selected plan. Plan can be changed afterwards. Choose Pro to try custom dates
or All registers. On Free, locked controls name the tapped scope with one See Pro button.

Tiles open documents; Orders checkboxes update the Sales figures. Dates step by the selected
unit. Closure dates/cashier/register filters affect the list; All registers shows each session
card. Templates format the same data. Print uses the browser print dialog and document-only
print CSS. Export CSV downloads the selected report's tabular data or recorded closure figures,
not the visual template. Recounts only change this page's fixture in memory; reload resets them.

## Open questions

1. **Detail-panel side:** left, right, or a pane beside the list. **Pick: right**, matching the
   shipped Closures room and prior Reports prototype; there is no cart to return to here.
2. **Free strip position:** top or bottom. **Pick: top**, the register owner's recommendation;
   both remain available in Plan. No new Reports-specific banner placement is proposed.

## Rejected

- Reopening the content decisions or inventing report types.
- Blurring Free content, an upgrade banner inside the body, or replacing the scope-level gates.
- A bell in the rail, filled status pills, elevated cards, shimmer or decorative animation.
- A corrected value silently replacing the recorded closure, or a stale document under an error.

## Scope and limitations

This is a fixture-based drawing, not the app: no authentication, server, printer discovery,
real update installation or upgrade navigation. The copied bell actions retain the register's
prototype behaviour. The manager line assumes Paul already has approval capability; it does not
collect credentials. Recount saves are local, not fiscal writes.

The earlier Sales model is deliberately retained: non-today periods and some breakdowns are
synthetic; register/store selection does not fetch independent Sales datasets; every fixture
order is already paid, so the status choices do not demonstrate a different result set. The
shipped printer selector and real server-rendered templates are not reimplemented here.
The supplied TSX uses translation keys without an English catalogue; the online error is drawn
as “Could not load reports.” and needs checking against the live translation.

## Screens and verification

Run `node shoot.js --quick` for tablet / light / regular, or `node shoot.js` for all three widths,
light and dark, regular and compact. The script asserts every State, ghost bars, Free copy, Plan
positions, overflow and representative interactions; it fails on page or console errors.
Captures are `screens/<width>-<theme>-<scale>-<state>.jpg`, frame only, JPEG quality 82.
It uses the monorepo's Playwright, with ancestor lookup for a local installation.

**Observed:** inline JavaScript and `shoot.js` parse. Non-browser DOM checks rendered all
1,539 width/theme/scale/state combinations and exercised exclusions, custom dates, all-register
sessions, template changes, bell dismissal, recount, offline disabling and error Retry.
The old and new Sales models were both run for day/week/month at offsets 0 and 1; their outputs
and the copied fixtures matched for those inputs only.

Captures were taken outside the sandbox with `node shoot.js` (all widths, light and dark, regular and compact); the sandbox itself cannot launch Chromium.
