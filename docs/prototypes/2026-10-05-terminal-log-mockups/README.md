# The terminal moment: the log area

Board: `index.html` (open it from disk). Built on the real screen,
`packages/core/src/screens/main/pos/checkout/tender/terminal-leg-view.tsx` on monorepo `next`, in
the state Paul saw on the first physical SumUp Solo run (2026-10-05, order #113007, 11,00 €
declined on "Paul Solo").

## Chosen (Paul, 2026-10-05, round 2): option A, "the latest line under the stepper"

*"Yes, as you recommend."*

- **The stepper is horizontal again**, as chosen on 2026-09-11 in
  `../2026-09-11-tender-pane-mockups` (the app shipped a vertical list; that is a deviation to
  undo, not a design to keep). Done nodes green with a green line behind them, the live node a
  white disc with a blue ring, the failed node a red cross, a cancelled node a grey minus.
  `connected · 82%` in the card head.
- **A failure mark at the ring's size** where the spinner was: a red cross on failure, a grey
  minus on a cancel or time-out (no money moved, so no red). Both the node and the big mark.
- **One line under the stepper** says what just happened, in words, with its time. It is the top
  of the log. Amber for a wobble, red for a failure, grey for a cancel.
- **Details** unfolds, inside the card: the full list (mark · words · time, ids in mono under the
  row), the reader / action / payment ids as key–value, then Copy and Share.
- **Words, not wire**: the catalogue at the foot of the board maps every server and client event
  message to cashier copy. Ids never appear in a message. Unknown messages fall through
  unchanged.
- **"Declined or cancelled on the terminal"** where the provider cannot tell them apart (SumUp
  reports both as `FAILED`).
- **One row shape everywhere**: the same row goes into the Logs screen, the register closure and
  the printer log when they are next touched.

Rejected: B (the list always under the card: the pane grows a row per event and repeats the
stepper), C (a sheet: one tap further away, a new primitive on both platforms), and round 1's
Status | Log tabs (a tab control at the moment the cashier least wants to explore).

## Path

Round 1 (vertical steps as the log, list, tabs, sheet) → *"On the original mockups the terminal
progress was horizontal. I think I prefer that."* → round 2 on the horizontal stepper → A chosen.

Precedents: Cash App, Brex and Too Good To Go status timelines (a tick per step, the time under
the label); MoonPay's Status | Details segmented card.
