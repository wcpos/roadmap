v2.0.0 — A new register, checkout and cash drawer

### Due date

### Pitch

A checkout that belongs to the POS: cash, split payments and card terminals straight at the register.

### Why this release

Every sale used to finish on WooCommerce's order-pay page, which capped what the POS could do at the till: one payment method per order, no cash without a round trip to the server, and no card terminal talking directly to the POS. WCPOS 2.0 replaces that with a checkout that belongs to the POS. Cash, split payments and card terminals connected straight to the register all become possible, including Bluetooth card readers and Tap to Pay driven from the phone or tablet itself. Refunds and receipts follow the same money model.

Around the new checkout, 2.0 also brings the first customer-facing display (a second screen showing the cart and total as it is rung up), a quick discount at the till that replaces negative fees, and the first two configurable parts of the register layout: which side the cart sits on, and a row of quick filter buttons.

The register itself is rebuilt: a new UI language across every screen, with a compact/regular/spacious scale, the register bar naming the till, and one tender pane where the keypad is the screen. Each register can open and close a cash drawer session: an opening float, cash in and out, a count at close and the variance.

It also lays the fiscal groundwork every European regime will need: each till gets an identity, offline sales keep their real time and register, closures become saved numbered documents, refunds and voids become records of their own, and receipts carry the software version and a real QR code.

### Not in this release

- Surcharges. Legally uneven across countries and no gateway exposes them cleanly; they will be their own effort. (Tips are in: on the reader or at the till, recorded on the order as a Tip fee line.)
- Third-party extension points for the register layout. The slot primitive ships for WCPOS's own panels only.
- Country-specific fiscal compliance: certification, France's exact dataset, Spain's VeriFactu submission. The regime-agnostic groundwork (register identity, sale-time provenance, stored closures, correction records, receipt identity and QR) **is** in this release, so nothing has to be redone when the country modules land.

---

The 1.11 line stays on `main` for patches (it was the 1.10 line until 2026-10-14, when it was re-cut as 1.11.0, the last update before 2.0). All 2.0 work lands on `next`; the plugin's `v2.0.0` tag is the moment this release is shipped.

**Renumbered 2026-09-28.** This release was developed on `next` as `1.11.0`. Paul ruled it ships stamped `2.0.0` so merchants see a major update and support never has to translate "1.11" into "2"; the vocabulary and the reasons are on #363. References to 1.11.0 in PRs and run records dated before 2026-10-14 mean this release; the 1.11.0 published that day is the patch line's last update before 2.0, not this release.

