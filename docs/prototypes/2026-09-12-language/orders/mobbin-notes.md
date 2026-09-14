# Mobbin — the orders list and one order (2026-09-14)

Per the program's three rules: one app per query, deep mode, images looked at, coverage checked
by bare app name before any "not on Mobbin".

## Coverage check (bare app name, deep mode)

| App | Platform | Result |
|---|---|---|
| Square | iOS | Only *Square Go*, the consumer booking app (https://mobbin.com/screens/1e4a3324-3554-4683-a21d-8b4fe3889a76). No POS. |
| Square | web | The seller dashboard is indexed: Virtual Terminal, Invoices, Orders (below). |
| Lightspeed | web | Absent — the query returned Shopify, Magnific and Midday. |
| Fresha | web | Present — Sales list with a detail pane (below). |
| Shopify | web | Present — admin Orders and order detail (below). |

The absent list from 2026-09-12 (Square POS, Zettle, SumUp, Lightspeed, Toast, Loyverse, Clover,
Vend) stands; those go to the reference corpus (#286).

## Drawn from

**Shopify admin — order detail** (web):
https://mobbin.com/screens/08acdf60-2382-48ed-b328-269b035fa838 ·
https://mobbin.com/screens/98f14a3d-8b40-49d7-9116-950d4b18a747 (partially refunded) ·
https://mobbin.com/screens/0bac6f5a-8648-40e5-8f91-1a82964f7dd7 (timeline).
The eyebrow is `# number · Paid · Unfulfilled` as two dot-plus-word statuses; the body is stacked
sections (items, payment totals with "Paid" as its own row, timeline); the rail is customer,
contact, addresses. Taken: the eyebrow with the source chip, the totals block with the refund row,
the customer/payment definition lists. Not taken: the fulfilment machinery and the timeline.

**Square dashboard — Orders list with a detail pane** (web):
https://mobbin.com/screens/6fb72903-0b5a-4f0d-9018-1e3f4395ea9e — tabs All/Active/Scheduled/
Completed/Canceled, a search and a date range, a plain table, and the order opens in a pane on
the right with × and *Mark as…* in its header, status pills, then a definition list. Taken: the
pane beside the list and the definition list. Also: invoices list with a Filter popover of radio
statuses (https://mobbin.com/screens/11f63157-c826-483d-9e60-f5e730b87eb7) — the status filter's
shape.

**Fresha — Sales list with a sale pane** (web):
https://mobbin.com/screens/49add9dd-923b-4bc9-b841-f1a00258e0e9 ·
https://mobbin.com/screens/19b3d404-6805-4734-b993-1f65a55922ca (activity). A three-column table
(Sale #, Client, Status pill), a *Today* chip, and the sale as a right pane with a Completed pill,
the line items, totals and *Paid with Cash*. Taken: the pane's item and totals grouping; the
payment line naming the method. Not taken: the filled green pill.

**Linear / Jira / Twenty — list beside a detail** (web):
https://mobbin.com/screens/cef36326-d8ec-4c6f-acd4-a9f1e1060d33 (Linear issue detail, properties
rail) · https://mobbin.com/screens/baf75577-93e3-4fc4-bf34-de4c7764ad07 (Jira column picker
popover with checkboxes and a search) · https://mobbin.com/screens/ededb987-eca2-4c04-b352-545c2b874c02
(Twenty: a hairline table with a selected row and the record open beside it). Taken: the selected
row + pane, the anchored column picker with checkboxes.

Plus the direction's reference set: Linear display options and Stripe's *Edit columns* for the
anchored display panel, Shopify's orders list for the dot-plus-label status.
