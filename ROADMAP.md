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

**v2.0.0 — A new register, checkout and cash drawer** · no fixed date:
the date follows the work (Paul, 2026-09-11). Ships from `next` stamped `2.0.0` (it was developed
as `1.11.0`; renumbered 2026-09-28, see wcpos/roadmap#363): the new register UI,
a checkout that belongs to the POS (cash, split payments, card terminals at the
till), registers and cash-drawer sessions in Free, saved closures, the customer
display, and the fiscal groundwork every European regime needs. Requires
WooCommerce 9.0. Release issue: wcpos/roadmap#195.

**v1.10.x** — rolling patches for the shipped 1.10 line on `main` (no fixed date).

## Next

**v1.12.0 — Fiscal compliance** (wcpos/roadmap#225) and
**v1.13.0 — Works with your other plugins** (wcpos/roadmap#226): numbered as
planned; they will be renumbered to 2.1 / 2.2 when they are scheduled.

## Later

_Nothing scheduled beyond the two releases above._

## Shipped

Recently completed work.

<!-- BEGIN:generated -->
_The sections above this marker are curated by humans. Drucker's roadmap automation
will maintain machine-derived listings here (issue links per lane, milestone progress)
once the autonomy phase is enabled. Until then this block is intentionally empty._
<!-- END:generated -->
