v1.10.0 — Offline & stock-state correctness

### Due date

2026-08-25

### Shipped on

2026-08-25

### Pitch

A rebuilt sync engine: the POS asks the server what changed instead of re-downloading your catalogue.

### Why this release

The biggest release since WCPOS was rebuilt in React Native. Your store now syncs through a change log on a new server API, so the POS asks what changed since it last checked instead of pulling the whole catalogue and hoping it landed. Work done offline is queued and replayed reliably, stock is checked before a sale is accepted, a barcode with no local match is looked up on the server in one step, and a Store Health screen tells you what is wrong before your customers do.

### Not in this release

- A new checkout. Sales still finish on the WooCommerce order-pay page; the POS-owned checkout, split payments and card terminals are v1.11.0.

---

Shipped as the Free plugin's `v1.10.0` tag on 25 August 2026. Release notes: https://github.com/wcpos/woocommerce-pos/releases/tag/v1.10.0. Filed after the fact on 2026-09-10 so the public roadmap shows what shipped; the `### Shipped on` date is the tag date, not this issue's closing date.

