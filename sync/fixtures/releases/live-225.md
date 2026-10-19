v2.1.0 — Fiscal compliance

### Due date

2026-12-31

### Pitch

Sell in France, Spain and beyond with a till that keeps the tamper-evident records the law requires.

### Why this release

Countries across Europe now require point-of-sale software to prove that every sale is recorded and cannot be quietly altered: France's NF525, Spain's VeriFactu, with Germany, Italy, Austria and Portugal on similar paths. WCPOS 2.0 laid the regime-agnostic groundwork: every till has an identity, offline sales keep their real time, closures are stored documents, corrections are records, receipts carry a real QR code. This release builds the country modules on top: signed and hash-chained records, gap-free numbering, official closure reports, audit-file export and, where a country demands it, reporting to the tax authority straight from the POS. Nothing about how you sell changes; what changes is what you can show an inspector.

### Not in this release

- Countries beyond the first modules. France and Spain come first; the framework is built so each further country is a module, not a rewrite.
- Certification by an accredited body where a country requires one rather than self-attestation. That is a commercial step after the software is ready.

---

Provisional release, filed 2026-09-10 from the `Compliance / Fiscalization` milestone (due 2026-12-31) on the plugin repos and the fiscal groundwork research. Filed as v1.12.0; renumbered **v2.1.0** on 2026-09-30 as the first minor after WCPOS 2.0 (Paul: fiscal compliance moves to 2.1.0 and everything else falls in line after it). The date follows the milestone; Paul redirects both by telling an agent, not by editing here.

