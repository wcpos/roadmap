# Reports in the 1.11.0 language

The drawing lives in `../pos-register/index.html`: tap **Reports** in the rail (the menu sheet on
the phone), the way the app is used; there is no switch in the strip (Paul 2026-09-17). Open
`../pos-register/index.html?screen=reports` to land on it directly; `index.html` redirects to it.
No server or build is needed; the dark control strip is not part of the design.

**Question it answers:** can the decided Sales glance and shipped Closures paperwork read as
another room in the register's language, at phone, tablet and desktop widths?

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
