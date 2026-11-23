# Fiscal compliance for France and Spain: the v2.1.0 contract

Date: 2026-11-23. Lane: `next` in Free, Pro and the app (Paul, 2026-11-23: *"All work on permissions and fiscal compliance should be done on the next branch"*). Docs for this repo stay on `main`. Owner: Paul. Status: **decided except the attestation and declaration ([#657](https://github.com/wcpos/roadmap/issues/657)), which wait on [#646](https://github.com/wcpos/roadmap/issues/646) and [#659](https://github.com/wcpos/roadmap/issues/659)**. Release: [v2.1.0](https://github.com/wcpos/roadmap/issues/225). Map: [wcpos/roadmap#640](https://github.com/wcpos/roadmap/issues/640).

This document is the build contract. It gathers what the map's tickets decided into one place. It does not re-decide anything. Where a section is short, the linked ticket's resolution comment holds the detail and the reasons. If the two disagree, the ticket is the ruling and this file has a defect.

Where a ticket left a choice to "the spec", this file made the smallest sensible choice. Paul ruled on the product choices among them on 2026-11-23 ([#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): *"as you recommend"*; those are written as rulings. The constants and formats that remain are marked **`assumed:`** so each one can be seen and overruled. Conclusions drawn by reading are marked **Inferred**. Nothing in this file is legal advice.

Evidence is in seven research files, all dated 2026-11-23 and on `main` since [#664](https://github.com/wcpos/roadmap/pull/664), with that PR's review corrections:

- [`fiscal-ground-truth`](../research/2026-11-23-fiscal-ground-truth.md): what is built on `main` and what was already ruled ("ground truth").
- [`fiscal-obligations-and-dates`](../research/2026-11-23-fiscal-obligations-and-dates.md): the law and dates in each country ("dates research").
- [`france-bofip-requirements-vs-wcpos`](../research/2026-11-23-france-bofip-requirements-vs-wcpos.md): BOFiP as a checklist and the French gap list ("French research"). § numbers written "BOFiP §n" are BOFiP's own.
- [`spain-verifactu-requirements`](../research/2026-11-23-spain-verifactu-requirements.md): VERI\*FACTU down to the record, hash, QR and submission ("Spain research").
- [`fiscal-prior-art-france-spain`](../research/2026-11-23-fiscal-prior-art-france-spain.md): how comparable products did it ("prior art").
- [`fiscal-regime-kinds-vs-the-core`](../research/2026-11-23-fiscal-regime-kinds-vs-the-core.md): the kinds of regime least like France and Spain, tested against this core ("regime-kinds note").
- [`where-wcpos-merchants-are`](../research/2026-11-23-where-wcpos-merchants-are.md): merchants by country, as aggregates ("merchant-country note").

**Who this serves.** On a blend of three independent active-use sources, Spain is about 10% of active WCPOS merchants and France about 3.5%, about one merchant in seven together (merchant-country note §3; aggregates by country only, range 9.6% to 16.5% across sources). Spain is the second-largest country after the United States.

Two question sheets for outside professionals sit beside them: [`questions-for-a-french-tax-professional`](../research/2026-11-23-questions-for-a-french-tax-professional.md) and [`questions-for-a-spanish-tax-adviser`](../research/2026-11-23-questions-for-a-spanish-tax-adviser.md).

## 1. Language

- **Store**: a WCPOS store as the plugin knows it. Free has one; Pro has several, each with its own edit screen. A fiscal mode is set per store.
- **Taxpayer** (or **legal entity**): the business that issues the documents, identified by its legal name and tax number. Several stores may belong to one taxpayer. A taxpayer is not a WordPress user.
- **Till**: one installation of the app (browser, desktop or mobile) signed in to one store. It is not a **register**, which stays the cash-drawer and session object it is today. Numbering and chains belong to the till ([#649](https://github.com/wcpos/roadmap/issues/649)).
- **Till code**: the short code the store gives a till when it first signs in, for example `T07`. It prefixes every fiscal number the till issues.
- **Fiscal mode**: France or Spain switched on for a store. Spain has two:
  - **VERI\*FACTU mode**: every record is sent to the Spanish tax agency (AEAT) as it is made.
  - **Non-reporting mode** (the law's "no VERI\*FACTU"): every record is signed with the merchant's qualified certificate and kept, with an event log, self-checks and export duties.
- **Fiscal record**: a write-once row for a document or a change: a sale, a refund, a correction, a closure, a change of cashier or store. It is never updated or deleted. The existing table `wcpos_fiscal_records` is its home on the store.
- **Fiscal number**: a record's number in its series, for example `T07-000123`. It is the document's legal number. The WooCommerce order number stays as it is.
- **Chain**: an ordered sequence of fiscal records in which each record carries the hash of the one before. A chain has one owner (a till or the store) and one taxpayer.
- **Chain head**: the position and hash of the last record in a chain.
- **Session closure**: today's register closure, made by a cashier who counts cash. Unchanged.
- **Fiscal closure**: a record totalling a period and carrying every till's chain head and the running total. In France and Spain the store makes them by itself, daily, monthly and annually ([#651](https://github.com/wcpos/roadmap/issues/651)). "Closure" alone in this file means a fiscal closure.
- **Running total**: the French *total perpétuel*, carried forward per store in each fiscal closure.
- **Event log**: the chained record of things that happen to a fiscal store or till that are not sales: mode switches, chain changes, versions, anomalies, archives, exports, failed submissions, reprints, sign-ins, certificate changes ([#654](https://github.com/wcpos/roadmap/issues/654)).
- **Archive**: one sealed, documented file holding the records, closures and events of a closed period, kept on the store and downloaded by the merchant ([#653](https://github.com/wcpos/roadmap/issues/653)).
- **Unsent record**: a fiscal record that exists on a till and has not yet been accepted by the store.

## 2. The rules every slice follows

1. **France and Spain only.** Paul, asked with Czechia's 1 January 2027 date and Spain's announced postponement in front of him, chose *"France and Spain only, as ruled"* (map, 2026-11-23). The earlier ruling on [#225](https://github.com/wcpos/roadmap/issues/225) (2026-09-10): "France and Spain come first". The Spanish mode serves Spain outside the Basque Country and Navarre ([#658](https://github.com/wcpos/roadmap/issues/658)).
2. **What lives where.** Paul: *"We have to be careful what is stored in the POS, and what is stored on the server. The POS data can be deleted at any time, or a new device, etc."* ([#656](https://github.com/wcpos/roadmap/issues/656)).
   - A till holds its code, its counter, the last link of its chain, its unsent records and, in Spain, the certificate.
   - The store holds everything durable: every record once received, every closure, the running totals, the archive and, in Spain, the certificate.
   - A till is never the only copy of anything for longer than it is offline.
   - A wiped till gets a new code and a new chain ([#648](https://github.com/wcpos/roadmap/issues/648), [#649](https://github.com/wcpos/roadmap/issues/649)). The store records the old chain as ended at its last received record. The certificate comes back from the store.
   - Records made offline and not yet sent are lost with the device. Design cannot remove that exposure; the docs say so plainly.
   - That the store holds the certificate and hands it to tills is a rule of the France and Spain modes, not of fiscal mode ([#661](https://github.com/wcpos/roadmap/issues/661); §20).
3. **An issued record is never changed.** Anything that alters a sale after its record is issued is a new chained record ([#650](https://github.com/wcpos/roadmap/issues/650)). Upgrades never rewrite or re-hash existing records; the payload format is versioned inside each record ([#648](https://github.com/wcpos/roadmap/issues/648)). Chains breaking on upgrade is the failure every comparable product has had in public (prior art §6).
4. **In France and Spain, no offline limit; the unsent count is shown.** Paul first answered "as you recommend" to a limit on installed apps and online-only browser tills, then came back: *"WAIT, on that last question, I think I want C"* ([#656](https://github.com/wcpos/roadmap/issues/656)). So in France and Spain every fiscal till, browser tills included, sells offline as today. The offline rule is a per-country setting, not a rule of fiscal mode ([#661](https://github.com/wcpos/roadmap/issues/661); §20). The till shows its count of unsent fiscal records. There is no cap on unsent records or time offline, no online-only rule for browser tills, and no block on signing out or clearing data while records are unsent.
5. **Each till chains its own records, in both countries.** In France and Spain a sale completes locally at once: the record, its chain link and (Spain) its QR exist when the receipt is handed over, offline included ([#647](https://github.com/wcpos/roadmap/issues/647), [#648](https://github.com/wcpos/roadmap/issues/648)). The store keeps and verifies what tills send, and adds its own chain for closures and for anything done outside a till.
6. **The engine is core; the country modes need Pro.** Paul answered "A": chaining, numbering and closures ship in Free and the app; switching on France or Spain needs an active Pro licence, and the attestation or declaration is issued to that licensed merchant ([#656](https://github.com/wcpos/roadmap/issues/656)).
7. **Both Spanish modes are built.** Paul: *"I think we should do both modes."* And, on whether each till is its own invoicing system: *"I think we should do it properly, no half measures"*, confirmed with "A" ([#647](https://github.com/wcpos/roadmap/issues/647)).
8. **The corrections of 2026-09-10 bind every slice** (Paul, on woocommerce-pos#713, quoted in ground truth §A): the binding French text is BOFiP, which accepts "chaînage ou signature" and an archive in an open format; Spain's no-VERI\*FACTU mode is the harder one; France's training mode and *total perpétuel* are real obligations. Training mode is answered in rule 10.
9. **Nothing is purged by WCPOS.** Records stay on the store for as long as the site exists; the archive is the copy that survives the site ([#653](https://github.com/wcpos/roadmap/issues/653)).
10. **No training mode in this release** ([#652](https://github.com/wcpos/roadmap/issues/652)). Staff train on a separate test site or before a fiscal mode is switched on, and the docs say so. This rests on reading BOFiP §150 as regulating such a mode only where one is offered; it reopens if the French professional answers otherwise (§16).
11. **The permissions release applies on top.** Each action in §7 still needs its v2.2.0 permission, and a refused action is refused the way that release specifies ([#650](https://github.com/wcpos/roadmap/issues/650); §15).

## 3. Rulings that replaced earlier ones

Where tickets disagree, the later ruling wins. Each case:

- **Where cryptography runs.** The June epic said "cryptography runs on the server" (woocommerce-pos#713, ground truth §A). [#648](https://github.com/wcpos/roadmap/issues/648) (2026-11-23) moved chaining to each till in both countries. #648 wins.
- **Offline selling.** [#656](https://github.com/wcpos/roadmap/issues/656) recorded a limit for installed apps and online-only browser tills, then Paul's correction to "no limit". The correction wins, and the Spain ruling on [#647](https://github.com/wcpos/roadmap/issues/647) stands with no narrowing for browser tills.
- **The event log's chain.** [#648](https://github.com/wcpos/roadmap/issues/648) said the event log "has its own" chain. [#654](https://github.com/wcpos/roadmap/issues/654) narrowed it: store events on the store's chain of events, a till's events in the till's chain with its sales. #654 wins, with the Spanish exception in §9.
- **Country modules as extensions.** The June epic said so; [#656](https://github.com/wcpos/roadmap/issues/656) put the engine in Free and gated the countries by Pro. #656 wins. The June epics (woocommerce-pos#713, #720 to #723) are superseded by the map's tickets (map Notes).

## 4. Slice 1: the chaining engine ([#648](https://github.com/wcpos/roadmap/issues/648))

**What is built.**
- One chaining engine in the app (TypeScript), mirrored in Free (PHP) for verification. Country-specific payloads; one engine.
- **France:** a plain SHA-256 hash chain, no key and no signature. Made tamper-evident by anchoring: each closure carries every till's chain head, each archive carries the closure heads, and each receipt carries the record's place in the chain.
- **Spain:** the hash exactly as AEAT specifies it (Spain research §6), proved against AEAT's three published examples, which the research reproduced. In non-reporting mode each record is also signed (§13).
- **What one chain spans:** one chain per till per taxpayer, and one per store for store-side records. Sales, refunds and corrections share a till's chain.
- **The first record** links to nothing and says so. A chain ends with a final record when the mode is switched off (§12) or when the store ends it.
- **Versioned payload:** every record names its payload format, and a verifier picks the hash rule from it. A new format applies to new records only.

**What exists** (ground truth §B): each row of `wcpos_fiscal_records` carries a sha256 checksum of its own payload, not linked to the previous row; no `prev_hash`, signing or chain verification exists in any repo. The write-once replay guard on `(type, series, number)` and `(type, source_id)` exists.

**Till holds:** for each chain it owns, the chain id, the chain head, and the records not yet accepted. **Store holds:** every received record with its hash and previous hash, and each chain's last accepted head.

**Failure cases.**
- Two records made at once on one till: the engine serialises chain writes on the device; a record is chained before it is shown or printed.
- An app update mid-chain: old records keep their format and hash; the new format starts at the next record.
- The till's storage is lost: the chain ends at the store's last received record (§6).

**For the spec.**
- `assumed:` the France hash is SHA-256, lower-case hex, over the UTF-8 bytes of the RFC 8785 canonical JSON of `{format, chain_id, position, previous_hash, record_type, series, number, issued_at, payload}`, with `previous_hash` null on the first record and every money amount written as a decimal string. The format is named `fr-1` and documented in the archive notice (§10). [#648](https://github.com/wcpos/roadmap/issues/648) says France's payload "is ours to define and document".
- `assumed:` in Spain, a fiscal record stores the AEAT XML record as generated (its `Huella` is the chain hash) and, beside it, the receipt document the till printed. The existing per-row checksum covers the receipt document. The AEAT record carries no item lines (Spain research §4).
- `assumed:` a chain id is a UUID the till generates when the chain starts. In Spain it is also the installation number, which "no puede repetirse nunca" (Spain research §3.1).

## 5. Slice 2: till codes and numbering ([#649](https://github.com/wcpos/roadmap/issues/649))

**What is built.**
- Each till gets a short code from the store when it first signs in, and counts its own documents without gaps: `T07-000123`.
- Refunds and corrections count in their own series on the same till: `T07-R-000004`. Spain requires a distinct series for corrective invoices.
- The store has its own series for documents it issues itself, such as corrections made in WP Admin.
- The receipt shows both the fiscal number and the order number; the fiscal number is the legal one.
- A till that is reinstalled or loses its storage gets a new code. The old series ends at its last number and the store records that as an event (§9).
- A number is consumed only when the record is chained. A test sale consumes a real number; in Spain it must then be annulled (§7).

**What exists** (ground truth §B): a global per-type sequence `wcpos_fiscal_sequence_{type}` under a lock, and an empty reserved `series` column. The global sequence stays as the store's own receipt order; the `series` column carries the till series. Per-register sale counters (`nextSaleCounter`) and closure numbers per register exist in the app and are not the fiscal number.

**Till holds:** its code, its two counters, per chain. **Store holds:** every code it has issued and which till and store it went to, never reused; each series' last received number; the store's own series counters.

**Failure cases.**
- A till that is offline when first used in fiscal mode has no code: it cannot issue a fiscal document until it has signed in online once. Signing in already needs a connection, so no till reaches fiscal mode without one (Inferred).
- A gap in a till series at the store (a record never arrived) is reported by the health check (§6), never filled.

**For the spec.** [#649](https://github.com/wcpos/roadmap/issues/649) says the code format and width are examples.
- `assumed:` a till code is `T` followed by a site-wide sequence of at least two digits, never reused. A till that sells for two stores holds one code, one chain and one pair of series per store. In Spain this makes each (till, store) pair its own system with its own installation number, which matches AEAT's "each billing centre" reading (Spain research §3.1).
- `assumed:` numbers are six digits, zero-padded, growing past `999999` without a reset.
- `assumed:` the store's series are `S<store id>-000001` and `S<store id>-R-000001`.

## 6. Slice 3: the store receives, verifies and reports ([#648](https://github.com/wcpos/roadmap/issues/648), [#653](https://github.com/wcpos/roadmap/issues/653), [#656](https://github.com/wcpos/roadmap/issues/656))

**What is built.**
- The store verifies every chained record on receipt and refuses a record whose link does not match that till's last accepted one.
- The health check walks every chain and reports the first break. The app verifies its own chain at start-up.
- The till shows its count of unsent fiscal records.
- **A restored backup is detected:** if the store finds its chain is behind what a till or a later archive says it should be, it records the anomaly and tells the merchant.

**What exists** (ground truth §B): `Provenance_Health` reports counter gaps, duplicates and clock skew over 600 seconds; `Closure_Store::health()` reports closure gaps and mismatches; the read-only `wcpos/v2/records` route. None verifies integrity (French research I6).

**Till holds:** its unsent records, and the store's last acknowledgement per chain. **Store holds:** the records, each chain's accepted head, and its own chain heads.

**Failure cases.**
- Records arrive out of order: the store holds them until the gap is filled, then accepts in chain order.
- A record arrives that the store has already accepted (its acknowledgement was lost): the store recognises it by chain and position, checks it is byte-identical, and acknowledges it again without the link check. A different record at an accepted position is a link mismatch.
- A link does not match: the record is refused into the chain, an anomaly event is written, and the till is told to end that chain and start a new one.
- The store is restored from a backup: tills report heads the store no longer has; the anomaly is recorded and shown in WP Admin.

**For the spec.**
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): a refused record is still kept, exactly as received, in a quarantine list on the store, so the store remains the durable copy of every issued document. In VERI\*FACTU mode it is still sent to AEAT as generated, because no record may be left unsent (Spain research §3.3); AEAT's answer is recorded.
- `assumed:` restore detection works in two directions. Each till sends, with every sync, the last head the store acknowledged for each of its chains. Each sync response carries the store's own chain heads, and the till keeps the latest. A store asked about a head it does not hold has been rolled back.

## 7. Slice 4: what may be done after issue ([#650](https://github.com/wcpos/roadmap/issues/650))

Paul, shown the table against a stricter alternative: *"as you recommend"*. The rule behind every row: an issued record is never changed; anything that alters the sale is a new chained record. The record types for France and the Spanish invoice types were left to the spec, to be taken from the Spain research; the columns below do that.

| Action | Fiscal mode on (#650) | France record | Spain record (Spain research) | v2.2.0 permission |
|---|---|---|---|---|
| Refund, full or part | Allowed. A new refund record. | `refund`, till R series | **R5, by difference** (`TipoRectificativa = I`), negative amounts, `FacturasRectificadas` = the original (§4, §8) | Refund |
| Void a completed sale | Allowed. Recorded as a cancellation of the original. | `cancellation`, till R series | **R5 by difference for the full amount.** Annulment is only for an invoice that should never have existed, "un concepto fáctico, no jurídico" (§5, §8) | Change an order's status (Inferred: v2.2.0's Void is for open sales) |
| Reopen and edit a completed sale | Allowed, as cancel-and-reissue: the original is cancelled by one record and the edited sale is a new one with a new number. | `cancellation` of the original, then a new `sale` with `supersedes` (exists) | **R5 by substitution** (`TipoRectificativa = S`, with `ImporteRectificacion`), one record in the R series carrying the corrected sale, only when an amount, the tax or the customer's identity changed; otherwise nothing (§4, §8; see below) | Reopen or edit |
| Cancel an open, unpaid sale | As today. Nothing was issued. | none | none | Void an open sale |
| Change status of a completed sale | Free where no money moves; to Cancelled or Refunded it follows the void or refund row. | none, or as those rows | none, or as those rows | Change an order's status |
| Reassign cashier | Allowed with the permission. Writes a change record; the original stays as issued. | `reattribution` on the store's chain (exists) | none to AEAT: the record holds no cashier (§4) | Reassign |
| Reassign store | Same, but refused when the other store is a different legal entity. | `reattribution` | none to AEAT: the issuer does not change | Reassign |
| Add customer details afterwards | Allowed as cancel-and-reissue. | `cancellation`, then a new `sale` with the customer | **F3** listing the replaced F2 in `FacturasSustituidas`; the F2 is neither annulled nor corrected (§8, developer FAQ no. 27) | Reopen or edit (Inferred) |
| Edit a paid order's money in WP Admin | Allowed, and writes a correcting record. | cancel-and-reissue on the store's chain and series | R5 by substitution, issued by the store as its own system | WooCommerce's order editing (not a POS permission) |
| Trash or delete an order that has a fiscal record | Refused. | — | — | — |

**What exists** (ground truth §B, §E): `refund`, `void`, `cancellation`, `late_*`, `recount` and `reattribution` records, each pointing at the original with `corrects_record_id`; a re-completion writes a new `sale` with `supersedes` and `adjustment`; a reattribution record before a cashier or store change. Not recorded today: a WP Admin edit to a completed order and an order trash or delete (French research I2).

**Till holds:** the records it issues for these rows, in its chain. **Store holds:** the same once received, and the records it issues itself (WP Admin edits, reattributions, annulments) on its own chain.

**Failure cases.**
- A refund, void, reopen or status change is refused by the store for a permission: v2.2.0 refuses these outright, and "they reach the store when they are made" (permissions spec §6). **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): refunds, voids and reopens need the store to be reachable in fiscal mode; sales work offline. The till chains the record for these rows only after the store has accepted the action, so a refused action never leaves an issued record. If the till then loses the record before sending it, the store issues the record itself on its own chain.
- A paid sale made without permission: v2.2.0 saves it and flags it. Its record was issued at the till and stands; the flag is not a fiscal record.
- A Spanish sale over the simplified-invoice ceiling: AEAT rejects an F2 whose total passes €3,000 plus €10, unless the record carries a billing-agreement number or `FacturaSinIdentifDestinatarioArt61d = S` (Spain research §2.1). WCPOS uses neither, so the ceiling binds. **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): above €3,000 the till asks for the customer's name and tax number before taking payment and issues an F1 instead of an F2. The €400 ceiling for activities outside ROF art. 4.2 is not checked: the store does not know its activity.

**For the spec.**
- **The Spanish column is for the usual case, a correction of a simplified invoice (F2).** R5 is the corrective type for simplified invoices only; a correction of a full invoice uses R1 to R4, by the reason the law gives (Spain research §4, §8). So a refund, a completed void or an edit of an F1 or F3 is an R1 to R4, by difference or by substitution exactly as the F2 rows say. `assumed:` the till and the store issue R1 for these; the code is checked against AEAT's list L2 when the slice is built, because the research does not quote the meaning of each of R1 to R4 (Inferred). An F3 that is itself wrong is corrected by a negative F3 and then a correct F3; a partial return after an F3 is an R5 against the F2, then an F3 that repeats the R5 (Spain research §8, developer FAQ no. 27).
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): in Spain, reopening and editing a sale issues a corrective invoice only when something the tax agency holds has changed: an amount, the tax, or the customer's identity. An edit that changes only something AEAT does not hold, such as a note, issues nothing to AEAT (Spain research §8, the decision tree's "neither an ROF error nor a record field" row). France keeps cancel-and-reissue on every reopen-and-edit, as #650 rules.
- `assumed:` new record types `annulment` (Spain), `full_invoice` (Spain F1 and F3) and `approval` (ruled, not built; §8) join the existing constant. An F3 takes its number from the till's sales series.
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): in Spain a document issued in error (a test sale, or one that never reached the customer) is annulled from WP Admin by the store, which may annul another system's record (Spain research §5). The annulled number stays used.

## 8. Slice 5: fiscal closures and the running total ([#651](https://github.com/wcpos/roadmap/issues/651))

Paul, shown this against "the cashier must close the register every day": *"as you recommend"*.

**What is built.**
- The cash count stays as it is: closing a register session is still the cashier's act and the only place cash is counted.
- In France and Spain the store makes fiscal closures by itself: one per store per day, then per month and per year. Each totals the chained records of the period and carries the chain head of every till it covers. Nobody presses anything.
- A day's closure is made once every till's records for that day have arrived. A till that was offline holds the day open, and the store says which till it is waiting on. After a set wait the day closes without it, and its late records go into the next closure, marked late, as late sales already are.
- The running total lives in the closures, per store, carried forward in each one, so it survives a table being rebuilt (French gap 8).
- A register left open across midnight blocks nothing; its session closure spans two fiscal days.
- Fiscal closures are immutable and chained on the store's chain. The `adjustments` counter and the `approval` record that were ruled and not built are part of this slice. Breakdowns are derived by the store from records, never taken from the app (French gap 7).

BOFiP §170's remark exempts billing software with a till function from the three closures; WCPOS is a till, not billing software, so the closures apply (French research C3, Inferred there).

**What exists** (ground truth §B; French research C3–C5): numbered session closures per register with `perpetual_sales_total` and `perpetual_refunds_total`, late records carried by `carried_by_closure_id`, recount and CSV export. No monthly or annual closure; breakdowns come from the app; the perpetual totals restart if the sessions table is recreated; `perpetual_adjustments_total` is ruled and not built.

**Till holds:** nothing new. **Store holds:** every fiscal closure and the running total.

**Failure cases.**
- A till never comes back: the day closes after the wait; if the till later reappears, its records are late in the next closure.
- A closure job does not run (WP-Cron needs traffic): the next run makes every missing closure in date order. A closure is never skipped.
- The sessions table is rebuilt: fiscal closures do not depend on it.

**For the spec.**
- `assumed:` the wait is 48 hours after the day ends. [#651](https://github.com/wcpos/roadmap/issues/651) left the length to the spec.
- The day boundary is the store's timezone (ruled).
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): the annual closure follows the calendar year. BOFiP §170 also allows the fiscal year; a setting for it is not built.
- `assumed:` in Spain, where the store's AEAT chain may hold only invoice records (Spain research §3.2), closures go on the store's WCPOS chain, the same chain that carries them in France (§9).

## 9. Slice 6: the event log ([#654](https://github.com/wcpos/roadmap/issues/654))

Paul answered "A": one chained event log for both countries.

**What is built.**
- **Recorded:** a fiscal mode switched on or off; a till given its code, or a chain ended and replaced; software version changes of the plugin and of each till; a chain break or other anomaly detected, and when it was fixed; every archive made and every export handed over; a failed or rejected submission to the tax agency and its retry; reprints; sign-in and sign-out at a till; the certificate added, replaced or about to expire.
- **Where:** kept on the store. A till writes its own events into its own chain alongside its sales and sends them like any record, so they survive and are lost exactly as its sales are. Store-side events are on the store's chain of events.
- **Chained in every fiscal store**, not only in Spain's non-reporting mode.
- **Read-only in WP Admin**, as its own tab on the existing Logs screen, and part of an inspector's export.

**What exists** (ground truth §B, §A): register, session, movement, closure, reprint and recount events go to the WooCommerce logger on the Logs screen, which can be rotated or deleted and is not a fiscal log. Sign-in and sign-out come from token issue and revoke ([#209](https://github.com/wcpos/roadmap/issues/209)). A per-order reprint counter exists.

**Till holds:** its unsent events in its chain. **Store holds:** every event.

**Failure cases.** A till's unsent events are lost with the device, like its sales. A store event that fails to write is retried; the action it records is not undone.

**For the spec.**
- Spain's non-reporting mode names its required events in the Orden (Spain research §10.3: codes 01 to 10 and 90, with a summary at least every six hours of operation and before shutdown). Those are the floor; the list above is checked against them.
- `assumed:` in Spain a till's events go in a **separate event chain of that till**, not in its sales chain. AEAT's billing chain links each record to "the record immediately before … alta or anulación" (Spain research §4, §6), and the Orden's event log has its own chain through `EventoAnterior` (§10.3). A till event inside the billing chain would break the AEAT hash. In France, as ruled, a till's events share its sales chain.
- `assumed:` the six-hourly summary is written every six hours while the till runs and at sign-out. A browser till that is closed without signing out writes it at its next start, with the gap visible in the event times.

## 10. Slice 7: the archive, the export and the verifier ([#653](https://github.com/wcpos/roadmap/issues/653))

Paul, shown this against "WCPOS also offers to send each archive to storage it runs": *"as you recommend"*. WCPOS holds no merchant's fiscal data.

**What is built.**
- The store makes an archive by itself with each annual closure, and a merchant can make one on demand for any closed period. Making one is an event.
- An archive is a single file: the records, closures and events of the period as plain, documented text files; a notice explaining the format (French for France, Spanish for Spain); and a seal over the whole file that ties it to the chain.
- It is kept on the store and offered as a download. WP Admin reminds the merchant each time one is made to keep a copy somewhere other than the site, and shows when they last downloaded one.
- The inspector's export is the same file for a chosen period, plus a one-page summary and a verification report anyone can re-run.

**What exists** (ground truth §B; French research A1): a closures CSV with no period filter and no integrity column, and paginated JSON over REST. No archive function.

**Till holds:** nothing. **Store holds:** every archive made.

**Failure cases.**
- The period has unsent records from a till: the archive covers what the store holds and names, per till, the last record it holds. Late records go in the next archive.
- The site is lost: the merchant's downloaded copy is the archive; the docs say so.
- A seal is checked against a store whose chain has been rolled back: the verifier reports the archive's heads as missing from the store (§6).

**For the spec.** The file layout, the seal and the verifier are designed here ([#653](https://github.com/wcpos/roadmap/issues/653)). France's June 2026 law says the administration will set an archive format, not yet published (French research §1); the format below is replaced by the official one when it appears.
- `assumed:` the archive is a ZIP file holding `records.jsonl`, `closures.jsonl` and `events.jsonl` (one JSON object per line, as stored), a `SHA256SUMS` manifest of every file, the notice as plain text, and `verify.html`. In Spain it also holds the AEAT records as their XML, which the non-reporting mode's export requires (Spain research §10.4).
- `assumed:` the seal is the SHA-256 of the manifest. It is written into the store's event chain as the archive event, so the archive is anchored in the chain; the archive carries that event's position.
- `assumed:` the verifier is `verify.html`, a self-contained page inside every archive that runs offline in any browser and re-checks every hash, chain link, closure head and the seal, built from the app's engine. The store's health check runs the same rules in PHP.

## 11. Slice 8: the fiscal receipt block ([#655](https://github.com/wcpos/roadmap/issues/655))

Paul answered "A": a locked fiscal block.

**What is built.**
- **Spain:** the fiscal number, the date and time, the issuer's name and tax number, the QR code at the size AEAT sets with its caption ("QR tributario", plus "VERI\*FACTU" in the reporting mode), and the document type: "Factura simplificada" on an F2.
- **France:** the law requires nothing on the ticket (French research §2.6). WCPOS still prints the fiscal number and a short chain reference, so an inspector can tie a paper ticket to a record, and "DUPLICATA" on a reprint.
- **Both:** reprints are counted and marked; the block is the same on paper, email and the digital receipt.
- **The fiscal block is one template element.** A merchant can move it and style around it, but in fiscal mode a template without it cannot be saved or printed. The built-in templates carry it already. The customer display and the three template mirrors follow the same block.

**What exists** (ground truth §B): the receipt schema 1.4.0 with empty `fiscal.hash`, `qr_payload`, `signed_at` and `signature_excerpt` slots, which carry the block; the reprint counter `_wcpos_receipt_print_count`.

**Till holds:** what it needs to render the block offline. The Spanish QR carries only tax number, series and number, date and total, never the hash, so a till renders it without the store (Spain research §3.3). **Store holds:** the same data in the record.

**Failure cases.** A merchant's custom template without the block refuses to save and print in fiscal mode, with one line saying why. A reprint of a sale made before the switch carries no block.

**For the spec** (wording from Spain research §7):
- The QR is ISO/IEC 18004, error correction M, 30 to 40 mm, with a quiet zone; its URL has exactly `nif`, `numserie`, `fecha` and `importe`, to `ValidarQR` in VERI\*FACTU mode and `ValidarQRNoVerifactu` in non-reporting mode. "QR tributario:" is printed above it. In VERI\*FACTU mode "VERI\*FACTU" is printed below it; in non-reporting mode that legend is forbidden.
- `assumed:` the built-in templates print the QR at 35 mm.
- `assumed:` the document-type caption follows the invoice type issued: "Factura simplificada" for F2, "Factura" for F1 and F3, "Factura rectificativa" for R1 to R5. The research quotes no caption for the full and corrective types, so the wording is checked against ROF arts. 6 and 7 when the slice is built.
- AEAT says the QR goes "at the start of the invoice", is the first QR on the document, and may move only within the top area (Spain research §7). That limits "a merchant can move it" in Spain. **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): in Spain the QR and its caption are fixed at the top of the receipt, and the rest of the block moves freely.
- `assumed:` the French chain reference is the chain position and the first eight characters of the record's hash.

## 12. Slice 9: switching on and off, setup checks and the certificate ([#656](https://github.com/wcpos/roadmap/issues/656), [#658](https://github.com/wcpos/roadmap/issues/658))

Paul answered "A": a fiscal mode can be switched off, as a recorded event.

**What is built.**
- A fiscal mode is set per store, on the store's edit screen in WP Admin. "Per store" on a single-store Pro site means that one store.
- **Setup checks** what the country needs before it will switch on: legal name, tax number and address; for Spain also the mode, the merchant's certificate, and their word that they are not in the Basque Country, Navarre or the SII scheme.
- **Before the switch,** one screen says what changes: completed sales can no longer be edited in place, orders with fiscal records cannot be deleted, numbering starts, and it applies from the next sale. Sales made before the switch are not chained.
- **In Spain, the certificate** is uploaded once to the store, kept encrypted there and handed to a till when a cashier signs in. Installed apps keep it in the device's secure storage; browser tills keep it as a key that cannot be exported.
- **Uninstalling with "delete all data"** is refused while fiscal records exist, until an archive has been exported. Today the full wipe drops fiscal records and closures without archiving (French gap 6).
- **Switching off** is a recorded event: the chain is closed with a final record, every record and closure is kept and stays exportable, and tills stop issuing fiscal documents. Switching on again starts a new chain.

**What exists:** nothing (ground truth §B: no country code; Pro has no fiscal code).

**Till holds:** the store's fiscal mode as an auto-synced store field, and in Spain the certificate. **Store holds:** the mode and its history, the setup data and the certificate.

**Failure cases.**
- A till offline at the moment of the switch keeps selling as before until it syncs. **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): its sales made after the switch but before it learned of it are not chained; the store records them as made outside fiscal mode by that till, in the event log.
- A till offline at a switch-off keeps issuing until it syncs; its records are accepted and the chain then closes.
- The certificate expires: an event is written ahead of time; once expired, non-reporting tills keep selling and record the anomaly, since invoicing "NUNCA debe interrumpirse" (Spain research §3.2).

**For the spec.**
- Whether Spain allows leaving VERI\*FACTU mode only at a year end is taken from the law: a taxpayer stays in the mode until 31 December of the last year it operated in it, and leaves by sending `FechaFinVeriFactu` before the year ends (Spain research §9.8). So a switch-off or a change to non-reporting mode in Spain takes effect on 1 January following, and the store sends the end date with its last submission of the year. Before the merchant's own obligation date AEAT treats the time as a test period (§9.8).
- **Entering the SII ends the Spanish mode at once, not at year end.** A taxpayer in the SII must stop submitting and stop printing the tax QR from the moment it begins complying with the SII (Spain research §2.1). The setup screen's SII declaration covers only the day of the switch. **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): joining the SII is something the merchant declares with a start date, and the Spanish mode stops then. The store's edit screen offers "This business has entered the SII" with a start date; from that date the store and its tills stop sending to AEAT and stop printing the QR, the chains close with a final record, and the change is an event. Records already made stay kept and exportable, as for any switch-off.
- How the certificate is encrypted at rest on a merchant's host waits on adviser question 8 (§16).
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): setup **refuses** when the merchant says they are in the Basque Country or Navarre ([#658](https://github.com/wcpos/roadmap/issues/658) left refuse-or-warn to the spec), and refuses a store whose currency is not the euro, since AEAT records are in euros (Spain research §4).
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): a Pro licence that lapses never switches a mode off and never stops records being made. It only blocks switching a mode on. Switching off stays a recorded act.
- `assumed:` the switch, the setup checks, the certificate store and the AEAT client live in Pro. The country payloads live in Free and the app, because the store verifies them (§6) and the engine is core.
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): the screens are gated by the existing "Manage POS settings in WP Admin" capability.
- **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): the archive that lets an uninstall delete data must cover every record, closure and event the wipe would remove, the current period included. The uninstall screen offers to make that archive up to the moment, and allows the wipe only once it has been downloaded and nothing newer exists except that archive's own bookkeeping: the archive event that carries its seal and the event recording its download, both written after its contents are fixed. Any other newer record means a new archive is needed. An archive of an earlier period does not count.

## 13. Spain: the records, VERI\*FACTU submission and the non-reporting mode ([#647](https://github.com/wcpos/roadmap/issues/647))

In Spain every till holds its own chain, its own installation number and the merchant's certificate. The store does the same for documents it issues itself.

**Ruling 3 (Paul, 2026-11-23): in the reporting mode every till signs and the store forwards.** Asked with three options because a browser till cannot present the merchant's certificate to the tax agency from page code (Inferred, not yet tested), he answered *"as you recommend"* (the first) ([#647](https://github.com/wcpos/roadmap/issues/647)):
- Every till chains and signs its own records and issues the receipt and QR by itself, offline included.
- The store forwards each record to the tax agency unchanged and reports each answer back to the till. One sending queue, in one place, for all three platforms.
- Ruling 2 stands otherwise: each till is its own system with its own chain and installation number. Whether a till whose records are forwarded still counts as its own system is adviser question 4 ([#646](https://github.com/wcpos/roadmap/issues/646)).

### 13.1 The records (both modes)

- **Alta and anulación records** in the Orden's XML, UTF-8, field by field as Spain research §4 and §5 list them. A till receipt is `TipoFactura = F2` with no `Destinatarios`, one `DetalleDesglose` per rate and regime (up to 12), and no item lines.
- **`SistemaInformatico`** carries the producer, system name, 2-character system ID, version and installation number. It must agree with the declaration (Spain research §11), which waits on [#646](https://github.com/wcpos/roadmap/issues/646) and [#657](https://github.com/wcpos/roadmap/issues/657).
- **The hash** as §4 above, with the timestamp's offset of the issuing territory (Canarias differs).
- **One chain per (system, taxpayer)**, never per series; numbers are never reused (Spain research §3.2, §8).
- **Every till signs its records in both Spanish modes** (ruling 3), with the merchant's qualified certificate, as XAdES Enveloped at least EPES (13.3). In VERI\*FACTU mode the signature is optional and accepted by AEAT (Spain research §4, `ds:Signature` row); the ruling makes it the rule, so one signing path serves both modes.

### 13.2 VERI\*FACTU mode: the submission

From Spain research §9:
- SOAP 1.1 over HTTPS to AEAT's `VerifactuSOAP` endpoints, authenticated by a qualified certificate; operation `RegFactuSistemaFacturacion`; 1 to 1,000 records per message, one taxpayer per message.
- **Flow control:** wait `TiempoEsperaEnvio` (60 seconds at the start) between sends, or send at 1,000 waiting records, whichever comes first. Simplified invoices still go "de forma inmediata", not at closing time.
- **Offline or AEAT down:** invoicing continues; pending records go in generation order with `Incidencia = S`; retry at least hourly; a warning with the count remaining shows until the queue is empty.
- **Responses:** per-record `Correcto`, `AceptadoConErrores` or `Incorrecto` are stored with the record; a record rejected for an error in the record only is corrected and resent as an alta de subsanación (`Subsanacion = S`, `RechazoPrevio = X`); where the invoice itself carries an ROF-defined error, a factura rectificativa is issued instead, and nothing more is done with the rejected original (Spain research §9.7, developer FAQ no. 17); "accepted with errors" ones that need correcting are listed in WP Admin. A SOAP `Server` fault or no answer is resent; a `Client` fault is a defect, logged as an event.
- Every failed or rejected submission and its retry is an event (§9).

**Till holds:** its records and, per record, whether AEAT has accepted it, learned from the store. **Store holds:** the send queue, every response, and the certificate.

**For the spec.**
- **The store sends to AEAT for every till; no till calls AEAT** (ruling 3). The store forwards each record exactly as the till generated and signed it, and reports AEAT's answer for each record back to its till. AEAT accepts a shape in which the till generates the record and the back office forwards it "sin más" (Spain research §3.3, developer FAQ no. 5).
- **One sending queue, on the store** (ruling 3). `assumed:` inside it each till chain's records go in that chain's generation order, and one message carries one chain's records.
- `assumed:` while records are pending, the store retries at AEAT's wait time and never more than 60 minutes apart.
- The till's warning shows two counts: unsent to the store (rule 4) and not yet accepted by AEAT.

### 13.3 Non-reporting mode: what is added

From Spain research §10, on top of everything in 13.1:
- **Every alta, anulación and event record is signed** at the moment it is made (alta and anulación records are signed in both modes by ruling 3; the event records are this mode's), with the merchant's qualified certificate: XAdES Enveloped, at least EPES, with the AGE signature policy; RSA with SHA-256. A record exists only once signed.
- **The event log** in `EventosSIF.xsd` format, with its own chain and signatures (§9 above).
- **Self-checks** on demand: the hash and signature of any record and any part of a chain, navigation from a record to the previous and next, and a persistent **alarm** on any detected threat, with an event.
- **Before each new record** the till checks the previous record's link and that its timestamp is not more than one minute ahead of now. A failure raises the alarm and writes an event; selling never stops.
- **Retention and export** of all records by period in the Orden's XML, oldest first and with no gaps, through the archive (§10); a successful export is the only way records leave.
- **Answering a requerimiento:** the store sends the requested records, as generated, to AEAT's `RequerimientoSOAP` service.
- The user's duty to keep the clock within one minute is stated in the docs.

**Till holds:** the certificate as a non-exportable key or in secure storage, its billing chain and its event chain. **Store holds:** every signed record and event, and the certificate.

**Failure cases.** A till whose stored key is lost or wiped gets the certificate again when a cashier signs in; until then it cannot sign, and so cannot issue a Spanish document. **Ruled** (Paul, 2026-11-23, [#640](https://github.com/wcpos/roadmap/issues/640#issuecomment-7104344981)): in Spain such a till refuses to complete a sale until it has the certificate, because an unsigned record is not a record (Spain research §3.3) and the no-limit ruling covers being offline, not lacking a key.

## 14. France: the items left from the gap list ([#643](https://github.com/wcpos/roadmap/issues/643))

The French research ranks ten gaps (§7). Gaps 1 to 4 and 6 to 8 are covered by §4 to §12. Gap 5 (training mode) is ruled out (rule 10). The rest:

- **WP Admin edits write a correcting record** (gap 4): §7, row "Edit a paid order's money in WP Admin", on the store's chain and series ([#650](https://github.com/wcpos/roadmap/issues/650)).
- **Uninstall refusal** (gap 6): §12 ([#656](https://github.com/wcpos/roadmap/issues/656)).
- **Closure figures derived by the store** (gap 7): §8 ([#651](https://github.com/wcpos/roadmap/issues/651)).
- **Version and licence quick to show** (gap 9): an inspector asks to see "immédiatement ou par un accès rapide" the version in use, "notamment son numéro de licence" (BOI-CF-COM-20-60 §90, French research §3). `assumed:` the app's About screen shows the plugin version, the Pro version, the app version and build, the attestation's version (with [#657](https://github.com/wcpos/roadmap/issues/657)) and the Pro licence identifier with its middle masked. Whether a Pro licence key counts as a licence number is Unverified (French research §3).
- **The attestation document** (gap 10): [#657](https://github.com/wcpos/roadmap/issues/657).

## 15. How it sits with the permissions release

**Order of building** (map Notes): the permissions release ([#599](https://github.com/wcpos/roadmap/issues/599)) is built on the same lane first. The fiscal build starts once its action-permission tickets [#625](https://github.com/wcpos/roadmap/issues/625), [#626](https://github.com/wcpos/roadmap/issues/626) and [#627](https://github.com/wcpos/roadmap/issues/627) have merged; they change the order writer and the paid-sale path that fiscal records hang off.

**Which permission gates which fiscal action** (the permission names are v2.2.0 spec §3):
- Refund: `refund_woocommerce_pos_sales`.
- Void a completed sale, and any status change to Cancelled or Refunded: `edit_woocommerce_pos_order_status` (Inferred: v2.2.0's `void_woocommerce_pos_sales` covers open sales).
- Reopen and edit, and adding customer details afterwards: `reopen_woocommerce_pos_sales` (Inferred for the second).
- Reassign cashier or store: `reassign_woocommerce_pos_sales`, with v2.2.0's self-claim exception on an open, unpaid sale. In fiscal mode a store change across legal entities is refused whatever the permission.
- Cancel an open, unpaid sale: `void_woocommerce_pos_sales`.
- Session close and cash count: `manage_woocommerce_pos_cash`, unchanged. In France and Spain fiscal closures need no permission; nobody makes them.
- Store health on the till, where the chain check and the unsent count can be seen in detail: `view_woocommerce_pos_health`.

**How the two refusal rules meet.**
- "A paid sale is never refused for a permission" (v2.2.0 §6): the sale's fiscal record was issued at the till and stands; the "made without permission" flag sits beside it.
- "Refunds, voids, reopening and status changes are refused outright": the record for these is chained only after the store accepts (§7).
- A sale's cashier is fixed in its record; a reassignment never edits it and writes a `reattribution` record, as the 2026-11-20 ruling already does.

## 16. Waiting on

- **[#646](https://github.com/wcpos/roadmap/issues/646), the Spanish tax adviser** (fourteen questions; [sheet](../research/2026-11-23-questions-for-a-spanish-tax-adviser.md)). It blocks: the declaración's producer identifier (question 6) and so the `SistemaInformatico` values; the encryption of the certificate at rest (question 8); and turning on the Spanish mode for merchants, which also needs [#657](https://github.com/wcpos/roadmap/issues/657). It confirms rather than permits: each till as its own system, and the store forwarding the till's records under ruling 3 (question 4, §13.2). Building the Spanish slices does not wait on it.
- **[#657](https://github.com/wcpos/roadmap/issues/657), the attestation and the declaration.** It blocks the shipped documents, the attestation's version-root scheme (BOFiP §380) and what the About screen shows for them (§14). It needs the answers of #646 and #659 (Inferred).
- **[#659](https://github.com/wcpos/roadmap/issues/659), the French tax professional** (eight questions; [sheet](../research/2026-11-23-questions-for-a-french-tax-professional.md)). It blocks the attestation's wording and delivery (questions 2 and 3) and the training-mode ruling (question 7, which reopens [#652](https://github.com/wcpos/roadmap/issues/652) if a till must offer one).
  - **If #659's answer is that only an accredited certificate satisfies France from 1 January 2027, the destination for France is redrawn before any France-only slice is built.** The map's destination is France "met by the publisher's own attestation".
  - **France-only:** the French payload format and its notice (§4, §10), the French content of the receipt block (§11), the version and licence screen (§14), and the French setup checks (§12).
  - **Shared** (both countries, by ruling): the engine, till codes and numbering, the store's verification and health, the after-issue rules, fiscal closures, the event log, the archive and verifier, the receipt block element, switching on and off, uninstall refusal and WP Admin correcting records. Fiscal closures and the running total are shared by ruling ([#651](https://github.com/wcpos/roadmap/issues/651), [#656](https://github.com/wcpos/roadmap/issues/656)); only France's law asks for them (Inferred), so a redraw for France would reopen whether they are built now.
  - **Spain-only:** the AEAT records, hash and QR, the certificate, VERI\*FACTU submission, and the non-reporting mode (§13).

**What the map leaves unspecified, and where it stands.** How compliance is proven before release (AEAT's test environment, live evidence) is not ruled; §17 records only the tests that make the rulings provable. A store switching on with years of sales: ruled in part (earlier sales are not chained). The merchant-facing docs pages: their required content is in the rulings above. The open Pro tickets (woocommerce-pos-pro#147 to #150): not reconciled by any ruling; ground truth §B notes Pro#150 is partly done in Free.

## 17. Testing

- Stakes are **High** throughout: a wrong hash, a lost record or a misnumbered document is a legal defect for the merchant.
- One set of test vectors drives both engines (TypeScript and PHP): the same inputs give the same bytes and the same hash. AEAT's three published hash examples are among them (Spain research §6).
- Every after-issue row in §7 has a failing test first, on both order storage modes.
- An upgrade test opens records written by the previous release and verifies them unchanged.
- Live checks run on the hosted dev stores, never a local WordPress.

## 18. Out of scope

- **Other countries,** one line each on the likely route (dates research §6; map Out of scope):
  - Czechia (EET 2.0 from 1 January 2027): online reporting; likely through a certified service (Inferred).
  - Germany: a certified cloud TSE, DSFinV-K export and ELSTER reporting; a 2028 cash-register duty is a bill, not law.
  - Austria: an approved signing service, DEP and FinanzOnline registration.
  - Italy: an approved RT device, or the software route through an accredited provider.
  - Portugal: AT certification of the software itself; not served before it.
  - Poland: an online cash register, or a software register in listed activities.
  - Belgium: a certified till with a fiscal data module for hospitality.
  - Sweden: a certified control unit.
- **TicketBAI (Álava, Gipuzkoa, Bizkaia) and Navarre** ([#658](https://github.com/wcpos/roadmap/issues/658)): the Spanish mode serves Spain outside the foral territories and says so. TicketBAI is not in this release; its three provincial software registrations are a commercial step.
- **Accredited third-party certification** (NF525/LNE and equivalents): "a commercial step after the software is ready" ([#225](https://github.com/wcpos/roadmap/issues/225), 2026-09-10).
- **Training mode** ([#652](https://github.com/wcpos/roadmap/issues/652)): none in this release; reopens on #659 question 7.

## 19. Size and slicing

Proposed landing tickets. None is created by this file. Size classes are against the law of at most 600 added production lines per PR: **S** fits one PR, **M** one or two, **L** will need several. Each slice lands plugin and app together, so a slice touching two repos is at least two PRs.

| # | Landing ticket | Repos | Delivers | Depends on | Size |
|---|---|---|---|---|---|
| 1 | Chaining engine | app, Free | §4: chain format, `fr-1` and AEAT hash, shared test vectors, till-side chain state, PHP verifier; the replaceable protector interface and a closure record type a till chain may hold (§20) | #625 to #627 merged | L |
| 2 | Till codes and series | app, Free | §5: codes, gapless till series, store series, chain end on wipe; a legal-number field apart from the till counter (§20) | 1 | M |
| 3 | Store receipt, verification and health | app, Free | §6: in-order acceptance, refusal and quarantine, health walk, start-up check, unsent count, restore detection; the record status local, sent, accepted, rejected (§20) | 1, 2 | L |
| 16 | Completion that can wait | app, Free | §20 seam 1: the paid-sale path can wait for an outside answer with a defined result when none comes; unused by France and Spain; tested with a stand-in; uses slice 3's record status | 3 | M |
| 4 | After-issue records | app, Free | §7 French column: cancel-and-reissue, completed void, change records, delete refusal, WP Admin correcting records | 3 | L |
| 5 | Fiscal closures and running total | Free | §8: daily, monthly, annual closures, wait, chain heads, `adjustments`, `approval`, store-derived breakdowns | 3 | M–L |
| 6 | Event log | app, Free | §9: till and store event chains, Logs tab | 3 | M |
| 7 | Archive, export and verifier | Free, app | §10: archive file, seal, notices, download reminders, inspector export, `verify.html`; export formatters behind the archive (§20) | 5, 6 | L |
| 8 | Fiscal receipt block | app, Free | §11: locked element, French content, DUPLICATA, template refusal, mirrors and customer display; the block reads from the record and never computes (§20) | 2 | M |
| 9 | Switching on and off | Pro, Free, app | §12: store edit screen, setup checks, explain screen, final record, uninstall refusal, licence gate; per-country settings for the offline rule, correction rules and closure timing (§20) | 3, 4 | M–L |
| 10 | France-only items | app, Free | §14: About screen with versions and licence; the `fr-1` format document | 9 | S–M |
| 11 | Spanish records and QR | app, Free | §13.1, §7 Spanish column, §11 Spanish content: alta, anulación, F2, R5, F1, F3, QR | 1, 8, 16 | L |
| 12 | Certificate and till signing | Pro, app | §12 certificate: upload, encryption at rest, hand-over, secure storage and non-exportable key, expiry events; XAdES signing of every Spanish record on the till in both modes (ruling 3) | 9; #646 q8 | L |
| 13 | VERI\*FACTU submission | Pro, app | §13.2: one store-side queue forwarding each record unchanged, flow control, retries, answers reported back to the till, corrections, counts, year-end exit; uses slice 3's record status | 11, 12; a Spanish test certificate | L |
| 14 | Non-reporting mode | app, Pro | §13.3: store-side signing, signed `EventosSIF` chain, self-checks, alarm, clock check, requerimiento, XML export | 11, 12, 6 | L |
| 15 | Merchant docs pages | docs | The pages the rulings require: offline risk, training on a test site, keeping archive copies, the clock duty, the foral exclusion | 9 | S |

**Expected count: 37 to 54 PRs** (Inferred), counting one PR per repo for each slice at the low end and the extra PRs each L slice needs at the high end.

**The three riskiest pieces.**
1. **Till-side chaining with the store as the only durable copy (slices 1 and 3).** Two engines in two languages must produce byte-identical hashes forever, including after upgrades; chain breaks on upgrade are the most common public failure (prior art §6). A wiped till loses its unsent records by ruling, and restore detection depends on tills reporting heads.
2. **Signing on tills (slices 12 and 14).** XAdES-EPES signing in a browser, a desktop app and a phone, now in both Spanish modes (ruling 3), with the merchant's certificate handed out by the store and held as a non-exportable key; a signed, chained event log with a six-hourly summary from a browser that can be closed at any time. One comparable plugin withdrew this mode because it never signed (prior art §6).
3. **VERI\*FACTU submission (slice 13).** It cannot be tested without a qualified certificate, and how a developer outside Spain obtains an AEAT test certificate was not found (Spain research §17). The store-forwarding shape (§13.2) is ruled; whether a forwarded till still counts as its own system is adviser question 4. A queue that rebuilds records from live data instead of the stored record is a known public failure (prior art §6, OCA issue #5279).

## 20. Seams for other kinds of regime ([#661](https://github.com/wcpos/roadmap/issues/661))

The regime-kinds note sorts the world's till rules into nine kinds by what they demand of the software, from self-declared chained records (France, Spain) to certified signing devices, real-time reporting, authority control units, fiscal hardware, device-bound software, producer-key software, clearance e-invoicing and markets with no till rule (§3). They differ from France and Spain on four axes only: who makes the record tamper-evident, who owns the legal number, whether a sale may complete before something outside the till answers, and how long a till may be out of contact (§1). Paul, asked which costly seams to build now: *"as you recommend"* (seam 1 only).

**Built now: completion can wait for an outside answer.** The paid-sale path can wait for an answer from a device, a service or a tax authority, with a defined result when none comes. France and Spain do not use it: in both, a sale completes locally at once. It is tested with a stand-in. Slice 16 carries it. It shares the record-status machinery (local, sent, accepted, rejected) with VERI\*FACTU's send queue (slices 3 and 13), so a record waiting on an outside answer and a record waiting on AEAT are the same state.

**The cheap seams, included without asking** (#661), each with the slice that carries it:
- A replaceable signer that never assumes it holds the key: slice 1 (the protector interface), with France's hash and Spain's hash and signature as its first providers (slices 1 and 12).
- A legal-number field separate from the till counter: slice 2. For France and Spain the legal number is the till's own.
- A record status (local, sent, accepted, rejected): slice 3, used by slices 13 and 16.
- A receipt block that reads from the record: slice 8.
- Per-country settings for the offline rule, the correction rules and the closure timing: slice 9, with France and Spain set as ruled (no offline limit, §7's table, automatic store closures).
- A closure that can sit inside a till chain: slice 1 (a record type either chain may hold); France and Spain put closures on the store's chain (slice 5).
- Export formatters behind the archive: slice 7.

**Not built now:** a signer that is told when a sale starts, as Germany's TSE needs (regime-kinds note §7). It is not in this release.

**Rules that hold only in France and Spain.** Four rulings are written in this file as rules of the France and Spain modes, never as rules of fiscal mode: no offline limit (rule 4), the store holds the certificate (rule 2, §12), the store makes every closure (§8), and a sale completes locally at once (rule 5).

## 21. How the build runs

This is the session's plan for running the build, described to Paul with ruling #661; it is not his ruling ([#661](https://github.com/wcpos/roadmap/issues/661)).
- One queue on the Mac mini, behind the permissions release.
- Fiscal tickets that touch the order writer or the paid-sale path are blocked by [#625](https://github.com/wcpos/roadmap/issues/625), [#626](https://github.com/wcpos/roadmap/issues/626) and [#627](https://github.com/wcpos/roadmap/issues/627).
- France-only tickets (§16) are blocked by [#659](https://github.com/wcpos/roadmap/issues/659).
- The VERI\*FACTU submission slice (13) is blocked on a Spanish test certificate, a task for Paul.
- The mini takes a fiscal ticket only when the permissions release has nothing it can take.
