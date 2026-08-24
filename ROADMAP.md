# WCPOS Roadmap

The product roadmap for WCPOS and WCPOS Pro, kept in sync with the
[Roadmap board](https://github.com/orgs/wcpos/projects/4) by Drucker (the PM agent).
Human prose lives outside the generated markers and is never touched by automation;
the generated block is updated via PR by the board-ops executor (`roadmap_doc_edit`
decisions) and reviewed like any other change.

**Release cadence: one dot release per month.**

Status mapping: **Expedite/Now** = current milestone (In Progress), **Next** = Up Next,
**Later** = Backlog, **Shipped** = recently Done (auto-pruned).

## 🚨 Expedite

Critical issues that jump the queue (`priority/P0`):
- Org security P0s (leaked credential removal, TLS validation) — ship immediately, not release-gated
- Fiscal compliance Phase 1 (NF525/VeriFactu) — milestone **Compliance / Fiscalization**, due 2026-12-31 (VeriFactu deadline Jan 2027)

## Now

**v1.10.0 — releasing 2026-08-24** · *Offline & stock-state correctness*:
offline queues (email/order/customer sync), overselling prevention,
server-side stock validation, barcode reliability.

**v1.9.x** — rolling stabilization patches for the 1.9 line (no fixed date).

## Next

**v1.11.0 — targeting mid-September 2026** · *Checkout & payments*:
split payments, and a quick discount at the till via an on-the-fly coupon
(#91) — which retires negative fees.

## Later

**v2.0.0** — tablet-first UI refresh (vision; not yet scheduled).

## Shipped

Recently completed work.

<!-- BEGIN:generated -->
_The sections above this marker are curated by humans. Drucker's roadmap automation
will maintain machine-derived listings here (issue links per lane, milestone progress)
once the autonomy phase is enabled. Until then this block is intentionally empty._
<!-- END:generated -->
