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

**Audit (seventh pass, same day).** Paul: the bars are a nice touch; categories could get the
same treatment with a pie chart; go over every box and row and make sure it earns its keep
(would deposits not just be part of the Orders data? is there a separate report for deposits?
which report templates go where?). `AUDIT-2026-09-17.md` holds the answer, read off fresh
exports of the plugin and the client by Codex and judged here. Applied: Top products and
Categories are one panel with two views, and Categories draws a donut with its rows; cash
movements fold into the Closures panel (they are session records that explain the drawer);
discounts fold into the Orders panel's footer (an order field); Deposits is gone (no endpoint,
field, line type, template or plugin integration anywhere; it was the 2026-09-14 example of a
plugin-registered report and returns only when one registers); "voided" is gone (no such
aggregate exists); Refunds stays as a row; In store · Online returns as a row. Under the six
panels the list is now In store · Online, Refunds, and Registers under All registers.

**Encodings (eighth pass, same day).** Paul: why isn't In store vs Online a pie chart; check the
best way to represent each data. The rule, now applied to every panel: **parts of a whole get a
donut** with its rows (Payments; In store · Online; Categories; Registers), **ranked
magnitudes get bars** (Top products; Cashiers), **change over time is the hero chart**, and
**ledger figures are plain numbers** (Taxes is a row again, "VAT 20% £198.08 · VAT 5%
£8.68", because a chart adds nothing to what gets typed into the return). In store · Online
is a panel ("Where sold") whose second view, under All registers, is Registers; the Registers
row is gone. The donut's centre shows the largest share. Six panels: Orders, Payments,
Closures, What sold, Cashiers, Where sold; two rows: Taxes, Refunds.

**Orders (ninth pass, same day).** Paul: the Orders card is just a list of three orders, it
gives nothing. Done: the panel shows the shape of the baskets, a distribution, so bars: how
many orders fell under £25, £25 to £50, £50 to £100 and over £100, what each band added up to
and its share of sales, the largest order named in the footer with the discounts. The head
still opens the full list with the tick boxes.

**Options and picks (tenth pass, same day).** Paul: the Orders box still sucks; Cashiers is a
share so it should be a pie; the donut is ugly; do research, think outside the box, ten
options. `panel-variants.html` holds ten Orders panels (size bands, strip plot, timeline,
summary block, status bar, basket size, Pareto, footfall, bullet graph, needs attention) and
eight share-chart styles (thin single-hue donut, thick distinct-hue donut, thick one-colour
donut, 100% bar, half donut, waffle, proportional tiles, big number with a hairline), each on
the fixture, with the research behind them in the file's head (Few's graph selection matrix,
Carbon, UNHCR, Observable; Glassdoor, Commons, Starling, Rivian, Obvious, Higgsfield,
Monarch on Mobbin). **Decided:** Orders is the summary block (average, median, largest,
items, items per order, discounts) with the status bar under it (completed, processing, on
hold, refunded) and a "Nothing needs you" line; the share panels (Payments, Cashiers,
Categories, Where sold) use the thick donut with distinct hues and the total in the middle,
which adds a five-colour categorical set to the reports scope (the primary, hues turned away
from it, a neutral). The proportional tiles and the 100% bar are acceptable alternatives if
four donuts read as repetition. Cashiers is a donut now, not bars.

**Cards and the filter (eleventh pass, same day).** Paul: two random rows at the end of the
page is stupid, put them in cards too, Taxes is a chance for a proportional bar to vary the
page; and the filter icon in the bar makes no sense, if it scopes the figures it belongs with
them. Done: Taxes is a card with one proportional bar (VAT 20% against VAT 5%, each "on
£net") and Net · Tax · Gross figures; Refunds is a card with Refunded · Orders · Kept figures
and a kept-against-refunded bar; the list under the panels is gone, so it is eight cards.
The filter left the bar and sits in the hero's title row after the date as "· Everyone ⌄"
(a cashier's name when filtered, "· every status" when widened), because it is the scope of
every figure below. The bar is now the register and store, the bell, and on the phone the
menu and the avatar.

**Closures card (twelfth pass, same day).** Paul: the Closures card is the weakest point; ten
mockups, with research into what is available and what people need. `closures-variants.html`
holds them (as drawn, the drawer ladder, a variance strip, the day as a timeline, three checks,
two tiles, a bullet per closure, by cashier, needs attention, the week as cells), with what the
plugin knows and what the cashier, owner and manager need in the file's head. **Decided:** C2,
the drawer ladder, and a rule that came with it: the date scopes the figure, the chart and the
other seven cards, but the Closures card is outside the date and always shows the till now.
While the till is open: register, Open, since when and by whom, the X-report button, then
opening float + cash sales − paid out = expected in drawer, and the last closure as the footer.
When it is closed: Closed at, by whom, Reprint, then expected, counted and the drawer result.
The Closures room behind the head keeps its own date for looking back. Paul on the period
question: "if the closures are affected by the date range, that gets a bit complicated"; agreed.
Then: "I don't mind if the cards update with the date range but it needs to be made more
explicit." Done: two labelled sections under the hero. **Right now · Front till** holds the
Closures card; **Today · Mon 14 Sep** (the hero's own words, changing with the date, with
"follows the date above" at its right) holds the seven cards that do.
Then: "Maybe closures go up to the top now, above the chart, in a small infographic", so the
chart, the date and the cards read as one block. Done: the till is a slim full-width strip
above the hero, outside the date: register · Open since 13:00 · Dylan, the last closure
under it, the drawer equation as chips (Opening float £100.00 + Cash sales £343.70 − Paid out
£150.00 = Expected in drawer £293.70, the result chip filled), X-report and a chevron into the
Closures room; when closed, Expected · Counted = Drawer result with Reprint. The seven cards
keep the period as their heading; the "Right now" section is gone.

**The strip under load (thirteenth pass, same day).** Paul: what happens with money paid in,
paid out and other things; four or five examples. `till-variants.html` draws six strips
(equation chips, the bridge, one composition bar, in and out columns, the figure with pills,
every tender) across five states (open with sales only; open with a paid-in, two paid-outs,
cash refunds, a no-sale and a void; counting; closed short; all registers), with what a
session can contain in the file's head. **Decided:** V1, the equation chips, "but it really
sucks on smaller screens", so: chips in a row on tablet and desktop, wrapping onto their own
row when the day is busy; on the phone the same terms stack into a ledger, one line per term
with the sign at the left and the expected row filled. Repeated paid-outs fold into one chip
with a count; no-sale and void move no money and are a note. The State row gains *Till busy*.

**Scrapped and redrawn (fourteenth pass, same day).** Paul: five width variations of the
chips were "just minor variations … scrap everything, find some interesting ways to present
this information". `till-concepts.html` holds ten pictures of the same session that are not
chips: the X-report as a receipt, a cash tray, the cash level through the session, what leaves
the drawer tonight, a drawer-limit gauge, a sentence, opened-with against holds-now, the day as
handovers, a cash book, a scoreboard. **Decided:** C3, the cash level through the session, "the
most interesting", with the chips as the backup. The strip now draws a step line from the float
at open to now, up with every cash sale, down where cash left, the paid-in, paid-outs and
refunds marked and named, the float as a dashed line, "£293.70 now" at the end; when the till
is closed the line ends at the count with the drawer result. Desktop keeps it in the middle of
the strip; tablet and phone give it its own row; the phone drops the event labels. The chips
remain behind the strip's *Till* switch as the backup.

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
