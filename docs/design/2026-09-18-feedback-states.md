# Feedback states: loading, refreshing, empty, no results, failed, refused, status, outage

Decided by Paul on [#308](https://github.com/wcpos/roadmap/issues/308), 2026-09-18, ten questions,
every recommendation taken. This page is the contract the prototypes already draw and the
component map ([#291](https://github.com/wcpos/roadmap/issues/291)) and landing order
([#292](https://github.com/wcpos/roadmap/issues/292)) apply. The
[cohesion audit](https://github.com/wcpos/monorepo/blob/research/design-cohesion/.claude/research/2026-09-12-design-cohesion-audit.md)
ranked feedback states second-worst of nine axes: six treatments for waiting and failing, two
browsing surfaces that wait differently, two failures with different urgency. This page replaces
the six with one system keyed by *what is happening*, not by who wrote the screen.

## The rule in one paragraph

A surface that has never painted shows a **still skeleton in its own shape**. A surface that has
painted never shows a skeleton again: a pending query **dims the content under a 2 px line**. Zero
rows are one of two states, **Empty** when nothing exists yet and **No results** when narrowing hid
everything, drawn with **one state block** in one inset. Failure has **four tiers keyed by what
failed**: a surface, an action, a background job, or the app's ability to sell. Offline and syncing
are **status, not failure**, in one place per screen, always with text. Nothing here animates
except the line and the spinners inside controls. The shared error boundary is for render
exceptions only.

## 1. The vocabulary

The ticket's words were overloaded ("loading" covered four things). Each state has one name, and
the names are the ones the pages, the component map and the E2E test IDs use.

| State | Meaning | Drawn as |
|---|---|---|
| **Loading** | first paint of a surface is pending; nothing to show yet | skeleton in the content's shape |
| **Refreshing** | content is on screen and a new query is pending (search, filter, sync pull) | content dimmed under a 2 px line, footer text |
| **Empty** | the collection genuinely has nothing yet | state block: icon, "No orders yet", "Sales you take will appear here." |
| **No results** | narrowing (search or a filter) hid everything | state block: search icon, "No orders match these filters", one button that clears the narrowing |
| **Failed** | a surface could not load its content | state block: warning icon, "Orders could not be loaded", Retry, Help |
| **Refused** | an action the cashier took was rejected | one destructive line beside the control, docs link when coded |
| **Status** | offline, syncing, queued: a condition, not a failure | one warn or info chip or band per screen |
| **Outage** | the app cannot sell until something is done | the alert band, the only red surface, with the one action that ends it |

## 2. Loading (Q1, Q2)

**The skeleton is the surface's own shape.** Tiles are muted tiles (an image block, a name bar, a
price bar). A table is its real header, muted rows at the visible column set, and its real footer,
so the ledger's line 13 ("loading retains recognisable table structure", `data-table/LEDGER.md`)
is preserved and extended from the shell to the rows. A report is row-height bars. A settings page
is its own heading and section shell with nothing invented, as the settings prototype draws it.
The placeholder count fills the viewport and is capped at twelve; it is never a fixed eight.

**The spinner survives in two places only:** inside a **control** that is waiting (button and
icon-button `loading`, where it replaces the leading icon and the control is disabled, `button/LEDGER.md`
line 11 preserved; the sync button) and at an **append** (the list footer and grid footer while the
next page loads). It is never a surface's loading state: logs, health, the web receipt scrim and the
data-table shell all move to the skeleton.

**Every screen-root Suspense supplies its surface's skeleton.** Today thirty-odd boundaries have no
fallback, including POS products, which is the audit's first named mismatch; in production a falsy
fallback is blank. A cell-level Suspense keeps `null` or its inline placeholder (avatar initials,
the image placeholder, `header/LEDGER.md` line 7 preserved). The development-only "Loading ..."
substitution stays as the diagnostic it is (`suspense/LEDGER.md` line 2 preserved). Enforcement is a
lint on a bare `Suspense` in the screen index files under `screens/**`, added to the lint list on
the [library strategy page](2026-09-18-library-strategy.md) and landed with the token pass.

## 3. Refreshing (Q3)

Once a surface has painted it never shows a skeleton again. A pending query **dims the content
under a 2 px indeterminate line** at the top of the surface, with "Searching…" or "Syncing…" in the
footer's count slot, as the orders prototype draws it. A pending query with zero rows says
"Searching…" in the state slot, never "No results" (`data-table/LEDGER.md` line 12, issue #1733,
preserved). A sync pull that adds rows to a list the cashier is reading shows the footer text and
nothing else, so reading is never interrupted. The line is the only moving loading element outside
controls.

## 4. Empty and No results (Q4)

**Two states, keyed by narrowing.** A surface is *No results* when any narrowing is active (search
text, a filter, a quick filter) and *Empty* otherwise; the data table and the grid already know
both. Today neither distinguishes them: every zero-row surface says "No X found" whether the store
is an hour old or the cashier mistyped, and none offers a way out.

- **Empty** says what will appear and when: "No orders yet · Sales you take will appear here.",
  "No closures yet · Closures appear here after you close a register.", "Nothing on the till yet."
  No button; there is nothing to undo.
- **No results** names the narrowing and its one button undoes it: "No orders match these filters ·
  Clear filters", "Nothing called “latte oat” · Clear it", "Nothing here matches the filters · Clear
  filters" (the [filters page](2026-09-17-filters-and-breadcrumbs.md)).
- **Small surfaces never split.** Combobox lists and select sheets keep their one muted line ("No
  countries found"), translated. The tree combobox loses its hardcoded English default.

## 5. The state block (Q5)

One anatomy, drawn by the register and orders prototypes:

- a line icon at 2.2× the font size, muted;
- one title line in the foreground colour at weight 500;
- an optional one-line description, muted;
- at most one action row: a quiet button, or a button plus a docs link.

It sits centred in the surface's **body**. The table keeps its header and footer, the grid keeps its
filter bar, the cart keeps its ledger frame; the block replaces the rows, not the surface.

**Two sizes.** *Surface* is the full block. *Inline*, for panels and lists inside sheets (the refunds
section, a picker's variations, a combobox), is one line, no icon, an optional quiet action.

**One inset.** The surface size is inset by six units (24 px at Regular, scaling with the step).
The table's `p-2` and the grid's `p-4` end; they were two authors, not a design. Existing test IDs
(`no-data-message`, `search-pending-message`, `error-boundary-fallback`, `storage-outage-banner`,
`connect-error-message`) are kept on the elements that replace them.

## 6. Failure: four tiers keyed by what failed (Q6)

| Tier | What failed | Treatment | Drawn by |
|---|---|---|---|
| 1 | **A surface** could not load | the state block with a warning icon, "Orders could not be loaded", Retry, Help to docs | orders, reports ("Could not load reports." · Retry) |
| 2 | **An action** was refused | one line in the destructive text style beside the control that caused it; a docs link "Learn more · CODE" when a code exists; the control re-enabled | connect (five discovery errors under the field), settings ("Couldn't reach the store · Try again" at the row), the printer wizard's trouble panel |
| 3 | **A background job** failed while the cashier was elsewhere | the toast the logger already raises: error-code summary as title, the hint as description (`merchant-toast.ts` precedence) | today's `showToast: true` callers |
| 4 | **An outage** blocks selling | the alert band, the only red surface in the app, with the one action that ends it; the affected controls disabled with the reason beside them | products ("Local database unavailable — scanning, checkout, saving and voiding are blocked until the app is reloaded." · Reload the app · View status) |

**A surface catches its own load failures and renders tier 1.** Throwing an expected failure
(network, server, a missing record) into the shared `ErrorBoundary` is a bug, not a state. The
boundary's fallback is for **render exceptions only** and is unchanged: its contract, its dismiss,
its "Something went wrong:" copy and its test ID stay as the audit's do-not-touch line requires
(`error-boundary/LEDGER.md` lines 1–3 preserved). The audit's second named mismatch resolves under
tier 2: the open-register card's plain default text becomes the same destructive line, with a test
ID, that the connect field already draws. The refunds section keeps its local summary and Retry
(`orders/LEDGER.md` line 39 preserved) as an inline tier 1.

A **record that does not exist** at a route ("No order found", six sites today in plain text) is the
surface-size block with a title only: it is Empty for a detail surface, not a failure.

## 7. Status is not failure (Q7)

Offline, syncing and queued are conditions. **One place per screen** (guideline 6): the bar's
status chip on page screens (orders, reports, settings), the band above the products on the register
because the register has no title bar ("Offline, still selling · 3 sales waiting to sync"). Warn
tone for offline, info for syncing. **Always with text, never icon-only**, since colour is never the
only signal; the header's icon-only indicator with its tooltip becomes that chip. Nothing about
status ever dims or blocks a surface. The receipt's "Syncing with server…" and "Offline · cached
receipt" stay as info and warn statuses inside the receipt, the one case where the data on screen is
what the status is about. Transition logging and toasts keep one app-level owner
(`header/LEDGER.md` line 6, issue #929, preserved).

## 8. Copy (Q8)

- The **title** is one line stating what happened or what is true, in the cashier's words, sentence
  case: "No orders yet", "Orders could not be loaded", "Nothing printed".
- The **description**, when present, says what to do next or where things will appear.
- The **action** is a verb: Retry, Clear filters, Reload the app, Try again.
- An **error code never appears in the title**; it rides on the docs link as "Learn more · HOST121".
- "Something went wrong" exists only inside the error boundary.
- Every string wraps; the block never truncates, so German length is a height, not a cut.

These are guidelines 6 and 9 applied to states.

## 9. Motion (Q9)

The skeleton is **still**: no shimmer, no pulse. Content replaces it in a **hard swap**, no fade, no
minimum display time. A state block appears with no entrance animation. The 2 px line is the only
indeterminate motion outside controls. The toast keeps its drop and its four seconds with Undo
(#287). The out-list bans decorative motion; the motion contract (#343) spends its beats on the
sale, not on waiting.

## 10. What the library ships (Q10)

Three new pieces, one restyle, one narrowing. Names are provisional until the component map rules.

| Piece | Job | Status |
|---|---|---|
| `Skeleton` | still block, line, row and tile shapes from the tokens | **new** |
| `EmptyState` | the state block; `kind` empty · no-results · failed, `size` surface · inline | **new** |
| `Notice` | one band for the register's offline band, the storage-outage alert and the receipt's captured warning; tone warn · info · bad | **new** (absorbs `storage-outage-banner`) |
| `DataTableSkeleton` | draws rows at the visible column set, not a centred spinner | restyle |
| `Loader` | the spinner; API unchanged, jobs narrowed to controls and appends | keep, narrowed |
| `Progress` | gains an indeterminate line variant for refreshing | keep, extended |
| `StatusBadge`, `Toast`, `ErrorBoundary`, `FormMessage` | unchanged | keep |

No ledger line is struck by this page.

## Surfaces that change

- **POS products** (grid and table): gains a skeleton fallback (today none); the grid's `p-4` state
  becomes the block; Empty and No results split.
- **Orders, customers, coupons, products, reports/orders tables:** the skeleton draws rows; the
  `p-2` state becomes the block; Empty and No results split with a clear action.
- **Logs:** spinner to row skeleton; empty line to the block.
- **Health:** spinners to inline skeletons.
- **Cart:** gains its Empty block ("Nothing on the till yet." with the cart icon); today it has no
  empty copy at all.
- **Open register card:** plain text failure to the tier 2 line with a test ID.
- **Refunds section:** the two muted bars become inline `Skeleton` lines; the fallback becomes the
  inline failed state with its Retry.
- **The six "not found" routes** (coupon, customer, order edit, refund, view, checkout): plain text
  to the surface block, title only.
- **Header online indicator:** icon-only to the status chip with text; the register gets the band.
- **Storage outage banner and the receipt's captured warning:** become `Notice`; actions and test IDs
  kept.
- **Settings and reports Suspense boundaries:** explicit shell or bar skeletons.
- **Web receipt scrim:** the viewport's muted paper block is its skeleton.
- **Tree combobox:** the hardcoded English empty default is translated.
- **Toasts, the error boundary, form messages:** unchanged.

## What this page fixes for later tickets

- **The component map (#291):** `Skeleton`, `EmptyState` and `Notice` enter as new lines;
  `DataTableSkeleton` as a restyle; `Loader` keeps its ledger with the narrowed job; the
  storage-outage banner folds into `Notice` with its two actions on the ledger.
- **The landing order (#292):** the bare-Suspense lint lands with the token pass; the three pieces
  land in the primitives pass before any screen switches, since every screen's skeleton depends on
  them.
- **The gallery:** every surface component has a cell per state in the table above that applies to
  it (loading, refreshing, empty, no-results, failed), on top of its scale and split cells.
- **The contract template:** "states" is a mandatory field and lists these names.
