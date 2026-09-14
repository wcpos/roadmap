# Orders in the 1.11.0 language — prototype for wcpos/roadmap#287

Throwaway, self-contained HTML. Double-click `index.html`. The dark strip is not part of the design.

**Question it answers:** what the orders list and one open order look like in the decided
direction, as a real table on the web (sortable headers, resize handles, hover, keyboard) and as
rows with a detail pane on tablet and phone, at three widths, light and dark, compact and regular.

## Inventory (Codex read-only on `next`, 2026-09-14)

The real screen, so the drawing is not a straw man:

- **Today** the list sits in a `shadow-md` Card with a `bg-card-header` toolbar: a search input,
  the sliders icon, and a wrapping row of `h-6` filter pills (Status, Customer, Cashier, Created
  via/Store, Register, Date Range). The table has an `h-8` uppercase header, alternating row
  colours, content-driven row height, and a footer with "Showing N of M" and a sync button; no
  page numbers. **The phone shows the same table**, not rows.
- **Columns** (17, all reorderable and hideable in a right-side *Order Settings* dialog): Status
  (icon only, header hidden, 45 px), Order Number, Customer (with optional billing/shipping
  lines), Billing Address, Shipping Address (off), Customer Note (icon), Date Created, Date
  Modified (off), Date Completed (off), Date paid (off), Created Via (icon), Cashier, Register
  (off), Payment Method, Total (refund as a red second line), Receipt (off), Actions.
- **Statuses**: pending, processing, on-hold, completed, cancelled, refunded, failed, pos-open,
  pos-partial, plus a synthetic partially-refunded in the open order. Labels come from the server;
  the list cell is an icon with a tooltip, the open order a filled pill — two treatments.
- **Row menu**: View, Edit, Re-open, Receipt (saved only), Sync (saved only), Refund
  (completed/processing/on-hold only), then Delete. Delete confirms: *Deleted orders will be
  placed in the Trash on the server.* No row press opens the order; only the menu does.
- **States**: initial load is the header row plus a central spinner (not skeleton rows);
  "Searching…" while a search settles; "No orders found" for both an empty store and an empty
  filter; "Something went wrong:" with the error text in an error boundary; the sync icon
  animates and a loading footer appears under the rows; offline shows only in the shared header.
- **The open order** is a right-side `w-200` modal with `shadow-lg`: header (order number,
  created-via chip, total at `text-4xl`, status pill, subtitle), then items → totals → refund
  history → note, with a `w-80` rail for customer, addresses, tax IDs, payment and POS metadata.
  Footer: Print Receipt, Refund, Cancel.
- **Focus**: nothing is focused on open; no row keyboard navigation; no column resize handle is
  wired although widths are authored; barcode scans set the search.

## Direction taken

- **Flat hairline card, no shadow**; the toolbar is the page bar (title, search, sliders) and a
  chip row for the six filters, active chips carrying the value and an ×.
- **Status is a dot plus a word** in the list, the open order and the row — one treatment, the
  fixed semantic set from the direction, widening the column to 172 px.
- **Hairline rows, a hover row and a focused row** replace zebra striping on the web; ↑↓ move the
  focus, Enter opens, Esc closes.
- **Web and native split**: at desktop a real table with sortable headers and resize handles on
  hover; at tablet and phone, 56 pt rows (number, customer, note icon; status, date, payment;
  total with the refund line; chevron).
- **The open order is a pane beside the list** (560 px at desktop, 440 at tablet, full screen on
  phone). The list keeps its core columns and the selected row while the pane is open. The
  header carries the order, the source chip, an ellipsis with the row actions, and a close ×.
  Footer: Refund (when eligible) and Print receipt as the primary; no Cancel — × is the way out.
- **Display options are anchored** to the sliders icon, with the table live behind: toggling a
  column changes the table at once (`shoot.js` asserts it). Drag grips for order; the Customer and
  Total sub-options nest under their column; Restore defaults in the header.
- **Filters are anchored popovers**: the status list with dots and a check; the date range with
  the six presets, a Monday-first calendar and Done. Both are sheets on phone.
- **Loading is skeleton rows**, still; searching keeps the rows, dims them and runs a thin
  progress line; empty is split into *No orders yet — Sales you take will appear here* and
  *No orders match these filters — Clear filters*; error is one line, Retry and Help.
- **Sentence case** for every string (Search orders, Billing address, Print receipt).

## Decisions Paul must make

In [`../README.md`](../README.md): status dot + label (4), hairline rows (5), rows on tablet (6),
the pane beside the list (7), loading as skeleton (11, owned by #308), sentence case (12).

## Rejected

- The 800 px modal with its own two columns — hides the list and the selection.
- Filled status pills — loudest mark on the screen; fails on a monochrome receipt.
- Cards for the phone list — rows with a chevron are the touch grammar.
- The right-side settings dialog — covers the table it configures.
- Zebra rows — a second surface colour in a one-surface language.

## Screens

`screens/<width>-<theme>-<scale>-<state>.jpg`: phone, tablet, desktop × light, dark × regular,
compact × eighteen states. `node shoot.js` regenerates them, runs the keyboard and live-column
assertions, and fails on any page or console error; `--quick` is desktop light regular only.
