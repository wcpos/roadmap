# Reports: the build brief (2026-09-18)

Everything a wayfinder or implementer needs to bring the Reports mock-up to life on `next`.
The drawing is `../pos-register/index.html?screen=reports` (tap **Reports** in the rail). Its
decisions are in `README.md`, nineteen passes with Paul's words and the reason for each. This
file is the short form: what is decided, what the page is made of, what data it needs, what
the app already has, and what the existing tickets get wrong. Nothing on the page is open.

## 1. The page, top to bottom

- **Bar.** The register and store as the title ("Front till · UK Store ⌄", opens the register
  and store menu; locked on Free), an Offline badge when offline, the bell. Phone: the menu
  button and the avatar too. No filter icon, no tabs.
- **Free strip** above the body on the Free plan, with its × (dismissed for the session).
  Position: top. The register owns the strip; Reports only shows it.
- **Till strip** (`.till`), a slim full-width card above the chart, **outside the date**: it
  always shows the till now. Open: register, Open, since when, by whom; the last closure as a
  second line; the drawer equation as chips, `Opening float + Cash sales · n − Paid out · note
  = Expected in drawer` (the result chip filled); X-report; a chevron into the Closures room.
  Paid-ins, cash refunds appear as terms; repeated paid-outs fold into one term with a count;
  no-sale and void move no money and are a note. Closed: Closed at, by whom, `Expected ·
  Counted = Drawer result` (short / over / Exact), Reprint. Layout: one row on desktop; on
  tablet, or on a busy day at any width, the equation takes a full second row and X-report sits
  on the title row; "= Expected" never splits; on the phone the terms stack into a ledger, one
  line per term with the sign at the left and the result row filled.
- **Hero card.** Title row: the date button ("Today · Mon 14 Sep ⌄", the hero's title; lock
  on Free), then at the right the chart toggle (By hour | Running total; By day on a week or
  month) and the print button (opens the Sales summary document). Under it the **filter
  chips**: Cashier (Everyone / a cashier), Orders (Completed & processing / Every status),
  Compare with (vs yesterday / vs same day last week; a plain chip on a week or month, where
  the comparison is fixed to the period before), and "N orders left out" only when orders are
  unticked (opens the orders, × puts them back). Then the figure, the delta line ("+1.3% vs
  yesterday", coloured, plain text), and three companions (Orders, Average order, Items) each
  with a signed difference in its own unit. Then the chart.
- **The chart.** *By hour*: the period's bars, the busiest full-colour with its amount and
  order count, the comparison as a dashed line, buckets still to come as faint bars of the
  comparison. *Running total*: the cumulative line against the comparison's dashed line, the
  busiest bucket as the thick segment, the closing figure ("£629.19 now" on a live day) and
  the comparison's whole-period figure labelled. Hover or tap a bucket for a tip. No tax on the
  chart, no legend, no sentence under it.
- **Period section** headed by the hero's own words ("Today · Mon 14 Sep"), holding eight cards
  that follow the date, three across on desktop, two on tablet, one on the phone, in the order
  of the jobs: **Orders** (summary block: average, median, largest, items, items per order,
  discounts; a status bar under it: completed, processing, on hold, refunded; "Nothing needs
  you" or what does), **Payments** (thick distinct-hue donut with the total in the middle;
  rows Card, Cash, … with order counts), **Top products** (ranked bars, "n sold"),
  **Categories** (donut with rows), **Cashiers** (donut), **Where sold** (In store · Online as
  a donut; under All registers its second view is Registers), **Taxes** (one proportional bar,
  VAT 20% against VAT 5%, each "on £net"; Net · Tax · Gross), **Refunds** (Refunded · Orders ·
  Kept, a kept-against-refunded bar). Every card head is the name, the figure and a chevron
  that opens the whole report as a detail panel.
- **Encoding rule** (applied to every card): parts of a whole get a donut with rows; ranked
  magnitudes get bars; change over time is the hero chart; ledger figures are plain numbers.
- **Detail panels** open on the **right** (a page with a crumb on the phone): a table or
  labelled rows, footer count, Export CSV and Print, and a template select where a document
  has templates (sales summary, closure, X-report). Orders has tick boxes; unticking an order
  removes it from every figure on the page and the "left out" chip appears.
- **Closures room** behind the till strip's chevron: the shipped room (roadmap#271, landed as
  monorepo#2131 on 2026-09-17), unchanged in structure, restyled: session card, closures by
  business day with its own date, a closure's document with corrections and settled figures,
  Reprint, Recount, Export. A closure opened from the list has a back arrow to it.
- **Gone, do not build:** the report picker, Sales | Closures tabs, the scope row, tile cards,
  the list of reports, the "Busiest hour" sentence, the legend, the "£975.23 by now" line,
  ghost bars in grey, same-day-last-year, Deposits, "voided", the cash-level line (kept only
  as a concept in `till-concepts.html`).

## 2. Rules that came with the decisions

- **The date scopes the figure, the chart and the eight cards. The till strip is outside it.**
  The Closures room keeps its own date for looking back.
- **Comparison:** a day compares with yesterday by default, same day last week as the one
  alternative; a live day is compared at the same time of day; a week compares with the week
  before, a month with the month before. Comparison is on by default and cannot be switched
  off, only changed.
- **Refunds count on the day they were made**, not the day of the order.
- **Orders default to completed and processing**; "Every status" adds pending and on hold.
- **The free plan sees today only**, the bound register and store only: earlier days, weeks,
  months, custom ranges, other registers, All registers and other stores are locked with a
  lock glyph; a tap names the locked scope in a hint with one See Pro button, no modal.
- **Reports are daily reconciliation** (Paul, 2026-09-12): day, week, month, and custom ranges
  inside the 92-day reach; never yearly; no server-side aggregation, figures are computed on
  the device over local orders. The full analytics suite stays in WP Admin.
- **Viewed-store context everywhere** (the Closures room invariants, monorepo#2131): a Pro
  user's selected store drives every formatter, preset and timezone via `useViewedStore`,
  never the bound till's store; local-first rows merge with server pages by
  `server_closure_id ?? id`; a refetch preserves the viewed row's identity.
- **Every figure has a testID**, never a translated string (the repo's E2E selector policy).

## 3. State model (the prototype's `RS`, what the built page must hold)

| key | meaning |
|---|---|
| `gran`, `off`, `cFrom`, `cTo` | period: `day`/`week`/`month`/`custom`, steps back, custom bounds |
| `cmp` | `yesterday` / `lastweek` (day only) |
| `cashier`, `status` | `all` or a cashier; `done` (completed + processing) or `all` |
| `register`, `store` | the bar's scope; `all` registers is Pro |
| `unticked` | order ids left out of every figure |
| `chart` | `hour` / `run`, remembered for the visit |
| `detail`, `closure`, `xreport`, `tpl` | which panel or document is open and its template |
| `pro`, `online`, `regOpen`, `busy`, `stores` | plan, connectivity, till state, fixtures |
| `pop`, `hint`, `tip`, `calMonth`, `pickStart` | transient menu, lock hint, chart tip, picker |

States the build must reach (the twenty in `shoot.js`): today, last week, orders left out,
date menu, scope menu, Payments panel, Orders panel, till busy, session open, register
closed, closure with corrections, recount, empty, loading, offline Sales, offline recount,
Free Sales gate, Free Closures gate, bell panel, online error with Retry.

## 4. Data: what each element needs and where it comes from

| element | needs | source today |
|---|---|---|
| figure, companions, chart, Orders, Top products, Categories, Cashiers, Where sold, Taxes, Refunds | the period's orders with lines, totals, tax lines, status, cashier, register, channel, refunds | the local orders collection (device-computed; the Sales room ticket #332 already scopes this); refunds from the refunds collection, dated by the refund |
| Payments | tender per order | the order's payment method and the split-payment records (1.11 tenders) |
| till strip, X-report | the open session: float, cash sales, paid in/out with notes, cash refunds, no-sale and void counts, expected | the session and cash-movement records the Closures room reads (#271) |
| last closure, Closed state | the latest closure for the register | the closures collection (local-first, #2131) |
| Where sold › Registers | per-register totals | orders' register stamp; only under All registers (Pro) |
| documents and templates | sales summary, closure, X-report templates | the plugin's templates (WP Admin › POS › Templates); a template formats, never adds data |

Nothing on the page needs a new server endpoint. Deposits and any plugin-registered report
return only when `woocommerce_pos_reports` (#333) registers one, as a card of its own.

## 5. Components: what to build, what to reuse

Restyle only (behaviour in the library already): the page bar, the rail, the bell panel, the
right side panel and the phone page with a crumb, the sheet, tables and labelled rows, status
dot-plus-word, the segmented control (chart toggle), buttons, the print and export actions,
the template select, the Free strip and the lock hint.

Behaviour differs or is new for Reports:

- **Filter chip** (`.fchip`): the Orders page's pill, an icon, the value, a chevron at the
  default, a split pill when set (value reopens, × clears). Build once, share with Orders; the
  prototype holds two copies (`.op-chip`, `.fchip`) because the shared lift was never assigned.
- **Date button + picker**: the date as a title with a menu of quick ranges (Today, Yesterday,
  This week, Last week, This month, Last month) beside a calendar; tap a day, or two days for a
  range; Done closes; locks on Free. The existing 1.10 picker's ranges, the new shape.
- **Popover menus** anchored to a control on tablet and desktop, a bottom sheet on the phone,
  with rows (check, label, hint text, lock).
- **Hero chart**: bars + dashed comparison + faint future bars; running total line + area +
  thick busiest segment; labels; tips on hover and tap. SVG in the prototype; Skia on native
  is a known rAF trap when left mounted (memory: `skia-web-canvas-loops-raf-while-mounted`).
- **Thick distinct-hue donut** with the total in the middle and rows: five categorical
  colours (`--c1..--c5` in the reports block: the primary, three hues turned away from it, a
  neutral), the same set on every theme. Still to be lifted into the shared tokens.
- **Share bar** (`bar`: name, figure, share, note) and the proportional **hbar** (Taxes,
  Refunds).
- **KPI** (label, figure, signed difference) and the **delta** text (up / down / flat colour).
- **Till strip**: equation chips with `.op` signs and a filled result; the `.keep` group; the
  phone ledger; the busy wrap.
- **Orders summary block** with the status bar and the "needs you" line.

## 6. What the existing tickets get wrong

- **roadmap#332 (Land the Sales room)** predates the prototype. Superseded in it: "the tiles
  and their tables" (there are cards with content, not tiles; the tables are the detail
  panels), "ghost bars" (the comparison is a dashed line and faint future bars), the
  comparison default (yesterday, not same day last week), the "92-day reach" is still right,
  "the Free gate in the controls" is right but now lives on the date button, the register
  menu and the chips' locked rows. Rewrite it from §1 before anyone builds from it.
- **roadmap#271 (Closures room)** is landed and stays; the prototype only restyles it and adds
  the till strip as its front door.
- **roadmap#333 (registered reports)** is compatible: a registered report becomes one more
  card in the period section, with the encoding rule applied by its declared shape.
- **roadmap#77 (full report suite)** is out: the POS does daily reconciliation only.

## 7. Verification the build should mirror

`shoot.js` is the reference walk: twenty states × three widths × two themes × two scales,
with assertions on every distinguishing element and interactions (unticking orders changes the
figure, the chips set and clear, the chart toggles, the till strip opens the room, a recount
changes the closure, Retry recovers). The Closures room already has a Playwright walk
(`apps/main/e2e/reports-closures.spec.ts`, tablet + phone against a stubbed server); the Sales
room's walk should extend it, one spec, testID selectors only, create-and-find for any order it
needs. Captures live in `screens/` as `<width>-<theme>-<scale>-<state>.jpg`; the build's
gallery should reach the same states.

## 8. Files

- `../pos-register/index.html` — the drawing; Reports is the `RS`/`RP` region and the reports
  CSS block (`:where(.frame[data-screen="reports"])`).
- `README.md` — the nineteen passes, in order, with Paul's words.
- `AUDIT-2026-09-17.md` — every box and row against fresh plugin and client exports.
- `chart-variants.html`, `panel-variants.html`, `closures-variants.html`, `till-variants.html`,
  `till-widths.html`, `till-concepts.html`, `filter-variants.html` — the options that led to
  each decision, each with its research in the file head.
- `shoot.js`, `screens/` — the walk and the captures.
- Rules: `docs/design/ui-design-guidelines.md` (this repo) and the monorepo's
  `.claude/rules/design.mdc`.

## 9. Unassigned, decided

- Lift `--c1..--c5` from the reports block into the shared tokens.
- One shared filter chip for Orders and Reports.
