# Mobbin — the register (2026-09-14)

The register's structure and flow were decided with three Mobbin rounds on 2026-09-11
(`../../2026-09-11-register-page/mobbin-notes.md`) and the tender pane with the direction board
(`../../2026-09-11-tender-pane-mockups/`). This pass is a reskin, so no new register query was
run for cut 1; the coverage check from the orders pass (`../orders/mobbin-notes.md`) was run on the
same day and stands: Square POS, Lightspeed and the rest of the till apps are absent, Fresha's web
checkout is present.

## Reused

- **Fresha web checkout**, three flows (the direction's reference 8): the cart column, the
  equal-tile payment grid, the numpad with preset chips and *Left to pay*. The method grid here
  is a fixed three-column grid of equal tiles for that reason.
- **Linear display options** (reference 1) for the anchored cart-settings popover.
- **Jobber / Starling** completion screens (2026-09-11 round three) for the Paid and Closure
  beats: a pale disc, a thin check, the figure, one primary action.
- **Cash App / Chase** money entry (tender board, direction 01): the amount is the screen, the
  symbol locked to the digits.

## Cut 2 — line actions, one click to edit, the open-order strip

Paul asked for research on slide-to-reveal for the cart line's edit and delete. The conventions,
from the platform guidelines rather than a Mobbin query (they are grammar, not a screen):

- **Apple HIG, Lists — swipe actions.** A trailing swipe reveals up to a few actions; the
  destructive one sits outermost and is the full-swipe default; actions are icon plus a short
  word; the row content slides with the gesture. Mail, Messages and Reminders are the reference.
  Taken as drawn: content slides left, **Edit** then **Remove** (destructive, outermost), 56 pt
  tiles, icon over word.
- **Material 3 — swipe to reveal** is the same shape on Android; the one difference is that
  Material also allows a leading swipe. Not used: two directions double the thing to learn.
- **Web has no swipe.** Hover reveals the same two actions inline at the row's right end
  (Linear, Notion, Gmail row hover), and keyboard users reach them by Tab. Rule 2: no hover-only
  affordances on touch — so touch gets the swipe and the edit sheet is also reachable by tapping
  the name (which is the one-click edit Paul asked for).
- **One-click edit of name and price**: Airtable and Notion inline cells (click to edit in place,
  Enter to commit, Esc to cancel), and Shopify POS's cart line, where tapping the line opens its
  editor. Drawn as in-place fields for the two cashiers change most (name, price) and the full
  sheet for everything else.
- **Open-order tabs**: browser tab strips and Linear's view tabs for a text strip with an
  underline; Square's *Open tickets* list and Shopify POS's *Carts* sheet for the overflow list
  with amount, customer and status per row. The status chips are the ones already on `next`.

## Not on Mobbin

Square POS, Zettle, SumUp, Lightspeed, Toast, Loyverse, Clover, Vend — re-checked 2026-09-14 by
bare name (Square iOS returns only the consumer *Square Go*; Lightspeed web returns unrelated
apps). They are captured by hand under
[Capture the reference corpus](https://github.com/wcpos/roadmap/issues/286).
