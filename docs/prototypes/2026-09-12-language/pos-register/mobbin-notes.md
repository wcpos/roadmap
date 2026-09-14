# Mobbin — the register (2026-09-14)

The register's structure and flow were decided with three Mobbin rounds on 2026-09-11
(`../../2026-09-11-register-page/mobbin-notes.md`) and the tender pane with the direction board
(`../../2026-09-11-tender-pane-mockups/`). This pass is a reskin, so no new register query was
run; the coverage check from the orders pass (`../orders/mobbin-notes.md`) was run on the same
day and stands: Square POS, Lightspeed and the rest of the till apps are absent, Fresha's web
checkout is present.

## Reused

- **Fresha web checkout**, three flows (the direction's reference 8): the cart column, the
  equal-tile payment grid, the numpad with preset chips and *Left to pay*. The method grid here
  is a fixed three-column grid of equal tiles for that reason.
- **Linear display options** (reference 1) for the anchored product-settings popover.
- **Jobber / Starling** completion screens (2026-09-11 round three) for the Paid and Closure
  beats: a pale disc, a thin check, the figure, one primary action.
- **Cash App / Chase** money entry (tender board, direction 01): the amount is the screen, the
  symbol locked to the digits.

## Not on Mobbin

Square POS, Zettle, SumUp, Lightspeed, Toast, Loyverse, Clover, Vend — re-checked 2026-09-14 by
bare name (Square iOS returns only the consumer *Square Go*; Lightspeed web returns unrelated
apps). They are captured by hand under
[Capture the reference corpus](https://github.com/wcpos/roadmap/issues/286).
