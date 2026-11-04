# The legacy order-pay panel: the terminal moment on the classic pay page

Board: `index.html` (open it from disk). The "Legacy" tab of the 2.0 checkout is the classic
WooCommerce pay page in an iframe; Pro's shared order-pay panel sits inside the gateway's accordion
row (`includes/Payments/OrderPay/Order_Pay_Panel.php` + `assets/js/order-pay-panel.js` in Pro).
Paul, 2026-11-04, on the shipped panel: *"Can we improve the UI for the legacy screen though??
Can you mock up some examples?"*

## Chosen (Paul, 2026-11-04): A, "the terminal moment, rehosted"

*"recommended looks good"*

The app's decided terminal moment (`../2026-10-05-terminal-log-mockups`, option A) inside the
accordion row:

- Reader line (`Stripe Terminal · Front Desk`) with a green **Connected** badge from the reader's status.
- With more than one reader, chips under the head ("Choose a terminal"); one reader, nothing to choose.
- Idle: the status says **Ready** and the one primary button carries the verb and the object,
  **Send $153.71 to Front Desk**. No amount line, no greyed buttons.
- Once sent: eyebrow **ON THE TERMINAL** and the amount as the one figure; the status said once
  with a dot in the state's colour (blue pulse while live, red for a failure, green when paid, grey
  for a cancel); the horizontal stepper **Sent · On terminal · Approved · Captured**, done nodes green
  with a green line, the live node a blue ring, a red cross on a failure, a grey minus on a cancel or
  time-out.
- While live: one outline-red **Cancel on terminal**. After an end: **Try again** as the primary
  (never after a captured leg; never after the order changed under the page).
- **Details** (hidden until there is something to list) unfolds inside the row: rows of
  mark · words · time, newest first, ids in mono under the row they belong to, then
  Reader / Action / Payment as key–value, and **Copy**. A request refused before any row exists is a
  red row, so Details never opens empty.
- Words, not wire: the app's catalogue (`tender/labels.ts`) ported to the panel, strings supplied
  through the panel config so they translate.

Rejected: **B** "one line and a bar" (a spinner or mark, the status with its time, the button on the
same line, a four-segment bar; the smallest footprint) and **C** "the reader takes the page" (other
methods fold while a leg is live, the row becomes the app's pane with the ring, the big amount and
a PAID stamp). Both carried the same words, stepper and Details; A was recommended for being the
tender pane a cashier already knows.

Precedents: Cash App, Brex and Too Good To Go status timelines; Square and Zettle's "waiting for
card" moment; Stripe's Terminal reader card.
