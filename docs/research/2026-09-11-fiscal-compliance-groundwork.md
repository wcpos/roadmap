# Fiscal compliance groundwork for WCPOS

**Research note — 2026-09-11.** What France (NF525), Spain (VeriFactu) and the comparable
regimes (Germany, Italy, Portugal, Austria) actually oblige of point-of-sale software; what
WCPOS has against each obligation today; and which foundations can be laid **now**, inside the
existing plugins, so that the country work later is assembly rather than excavation.

Scope: read-only research. It creates no issues and changes no code. It reads the existing
compliance milestone in `wcpos/woocommerce-pos` and `wcpos/woocommerce-pos-pro`, the epic
[wcpos/woocommerce-pos#713](https://github.com/wcpos/woocommerce-pos/issues/713), the plugin's
receipt/fiscal services, and the 1.11.0 payments contract in the wiki.

> **Where the epic lives.** The task named a "Fiscal compliance framework" epic in
> `wcpos/roadmap`. There isn't one — the epic is
> [wcpos/woocommerce-pos#713](https://github.com/wcpos/woocommerce-pos/issues/713), with the
> `Compliance / Fiscalization` milestone in the two plugin repos (12 issues in Free, 4 in Pro).
> `wcpos/roadmap` holds only the adjacent reports epic
> [#77](https://github.com/wcpos/roadmap/issues/77) and the `ROADMAP.md` expedite line.

---

## 0. Bottom line

Four things changed the shape of this job, and three of them are good news:

1. **France no longer needs NF525.** The éditeur's *attestation individuelle* was abolished by
   the 2025 finance act and **restored on 21 February 2026** by loi n° 2026-103, art. 125. The
   binding text is therefore the CGI and BOFiP — **not** the NF525 référentiel, which is a
   private AFNOR/LNE standard. Several requirements the epic treats as French law
   (signature excerpt at characters 3/7/13/19, certificate number on the ticket, a mandated
   "JCD" XML archive, RSA-2048) are **NF525 conventions, not legal obligations**. BOFiP asks for
   "chaînage des enregistrements **ou** de signature électronique" and an archive "dans un
   format ouvert". This materially shrinks the French job.
2. **Spain's software-producer deadline is already past.** Both postponements moved the
   *taxpayer* dates; neither moved the obligation on producers and marketers of invoicing
   software, which fell due **29 July 2025**. This is a question for Paul and an accountant,
   not an engineering ticket — see §6.
3. **Spain's "no-VERI\*FACTU" mode is the harder mode, not the easier one.** Submitting to AEAT
   continuously releases the system from local record signing, the event log, export and
   integrity self-checks. The epic's phasing has this backwards.
4. **The 1.11.0 payments contract makes offline sales a fiscal problem that must be solved at
   the till, not on the server.** Offline rows ride the order write and `payment_complete()`
   fires when the order lands, so today's receipt sequence is assigned in **server-arrival
   order** with **server time**. Every regime numbers and chains in sale order, per register.
   Nothing captured after the fact can repair a sale whose own time and till were never
   recorded. This is the single most time-sensitive item in this note.

The groundwork shortlist in §5 follows from those four, and from one filter: **build only what
is regime-agnostic, useful even if fiscal never ships, and impossible or expensive to
backfill.** Everything that is regime-specific or certification-bound is listed in §6 as work
to *avoid* starting.

---

## 1. The dates that matter

| Date | Regime | What it is |
|---|---|---|
| **29 July 2025** *(past)* | 🇪🇸 Spain | Producers and marketers of invoicing software must offer RRSIF-adapted products. Nine months from Orden HAC/1177/2024's entry into force (29 Oct 2024). **Not moved** by RD 254/2025 or RD-ley 15/2025 — both moved only the taxpayer dates. |
| **21 February 2026** *(past)* | 🇫🇷 France | *Attestation individuelle* restored by loi n° 2026-103 du 19 février 2026, art. 125 (BOFiP ACTU-2026-00073, 25 Mar 2026). Model letter: **BOI-LETTRE-000242**. Certificate and self-attestation are both valid proof again. |
| **1 January 2027** | 🇪🇸 Spain | Corporate-income-tax payers (sociedades) must have a compliant SIF operating. RD-ley 15/2025, de 2 de diciembre (BOE 3 Dec 2025), validated by Congress 11 Dec 2025. |
| **1 July 2027** | 🇪🇸 Spain | Everyone else — autónomos, IRPF/IRNR-EP, atribución de rentas. |

Continuous, already-live obligations with no future date to plan against:

- 🇫🇷 **France** — in force since **1 January 2018**. Fine **€7,500 per software or system**
  (art. 1770 duodecies CGI), 60 days to regularise from the procès-verbal (art. L. 80 O LPF).
  Unannounced inspections are the enforcement mechanism. There is no deadline; the exposure is
  today's.
- 🇩🇪 **Germany** — TSE mandatory since 2020. The §146a Abs. 4 ELSTER notification channel opened
  1 Jan 2025; existing systems had to be reported by **31 July 2025**; new or decommissioned
  systems within **one month**.
- 🇮🇹 **Italy** — POS↔RT telematic pairing obligatory for operations from **1 Jan 2026**
  (L. 207/2024 art. 1 c.74–77; Provv. 424470 of 31 Oct 2025). The portal service opened
  **5 March 2026** and pre-existing terminals had 45 days, i.e. ~**20 April 2026**. It is a
  merchant portal action, not a software feature.
- 🇵🇹 **Portugal** — AT software-product certification, ATCUD (since 1 Jan 2023), QR (since
  1 Jan 2022), monthly SAF-T (PT) by the 5th. All live.
- 🇦🇹 **Austria** — RKSV live since 1 April 2017. Jahresbeleg by 31 December each year, verified
  in FinanzOnline or the BMF Belegcheck app by **15 February**.

**Roadmap alignment.** `ROADMAP.md` expedites "Fiscal compliance Phase 1 (NF525/VeriFactu) —
milestone Compliance / Fiscalization, due 2026-12-31 (VeriFactu deadline Jan 2027)". The
December 2026 target is right for Spain. France has no target date because it is already
overdue for any French merchant running WCPOS today.

---

## 2. Requirements table

Legend: **●** required · **◐** required in a weaker or conditional form · **○** not required ·
**⊘** satisfied by an external certified component, not by our code.

| Obligation | 🇫🇷 FR | 🇪🇸 ES | 🇩🇪 DE | 🇮🇹 IT | 🇵🇹 PT | 🇦🇹 AT |
|---|---|---|---|---|---|---|
| **Gap-free sequential numbering, per register or per series** | ● per register, per record type | ● per series (número + serie) | ● TSE transaction number + signature counter (⊘) | ● per RT device | ● per series, pre-registered with AT | ● per register |
| **Cryptographic chaining of records** | ◐ chaining **or** e-signature — BOFiP names both as acceptable | ● SHA-256 huella, each record carries part of the previous record's hash | ⊘ inside the TSE | ⊘ inside the RT | ● RSA signature of each doc incorporates the previous doc's signature in the same series | ● each receipt's signature chains to the previous receipt's |
| **Digital signature of each record** | ◐ alternative to chaining; no algorithm mandated by law | ● ETSI EN 319 132 (XAdES) — **only in no-VERI\*FACTU mode** | ⊘ TSE | ⊘ RT | ● RSA key registered with AT | ● from an approved Austrian VDA (A-Trust / Globaltrust / PrimeSign) |
| **Tamper-evident event / audit log** | ● modification-and-correction trace, minute-dated, showing original and every later operation | ● registro de eventos — **only in no-VERI\*FACTU mode** | ● GoBD + DSFinV-K journal | ◐ within the RT | ◐ within SAF-T | ● DEP, continuous, quarterly backup export |
| **Signature excerpt or QR on the receipt** | ○ **not a BOFiP requirement** (an NF525 convention) | ● QR on every invoice; "VERI\*FACTU" legend in submitting mode, "QR tributario:" otherwise | ◐ QR may substitute for the printed TSE fields | ● documento commerciale fields; lottery code if offered | ● QR encoding ATCUD, plus 4 signature characters | ● machine-readable QR/OCR code on every Beleg |
| **Software identification / version on the receipt** | ○ not in BOFiP | ○ not on the receipt (it is in the declaración responsable, inside the product) | ● TSE serial + signature counter | ● RT registration data | ● "Processado por programa certificado n.º XXXX/AT" | ◐ via the signed code |
| **Secure retention** | ● 6 years (art. L. 102 B LPF) | ● tax prescription period (4 years by LGT art. 66) — **only in no-VERI\*FACTU mode** | ● GoBD retention | ● per RT/AdE rules | ● per AT rules | ● 7 years |
| **Structured export format** | ◐ **"format ouvert"** — no schema mandated; a French-language notice must accompany the archive | ● AEAT XSD for records and events | ● **DSFinV-K** (v2.4) | ● AdE corrispettivi XML | ● **SAF-T (PT)** monthly | ● **DEP** export, Anlage Z 3 |
| **Closure / Z reports as retained documents** | ● daily, monthly, annual — **unwaivable**; period grand total **and** perpetual grand total (never reset) | ○ not a closure regime | ● via TSE/DSFinV-K | ● daily corrispettivi transmission | ○ | ● Startbeleg, Monatsbeleg, Jahresbeleg, Schlussbeleg |
| **Corrections: no deletion, corrective record only** | ● "opérations de « plus » et de « moins »" | ● registro de anulación — at least one *additional* record; the original stands | ● | ● | ● | ● |
| **Training / demo mode segregated and marked** | ● training data is part of the protected dataset; documents watermarked "factice"/"simulation"; the supervising operator identified | ○ | ◐ (Trainingsbuchungen flagged in DSFinV-K) | ○ | ○ | ○ |
| **Transmission to the authority** | ○ on audit only | ◐ optional — that is what VERI\*FACTU *is* | ○ on audit; one-off ELSTER system notification | ● daily | ● monthly SAF-T | ○ except Startbeleg/Jahresbeleg checks |
| **Vendor-side certification, attestation or declaration** | ◐ certificate **or** self-attestation (BOI-LETTRE-000242) since 21 Feb 2026 | ● **declaración responsable** by the producer, visible inside the product, per version | ○ for the POS; the **TSE** must be BSI-certified (TR-03153) | ● RT or software solution approved by AdE via an *ente certificatore* | ● **AT certification of the software product**, per product, Modelo 24, fiscal representative for third-country producers | ◐ signature unit licensed via an approved VDA |
| **Per-device registration with the authority** | ○ | ○ | ● ELSTER, within one month | ● portal pairing of each POS terminal to the RT | ● each document series registered with AT | ● Kassen-ID + signature unit in FinanzOnline |

**What the table says.** Seven obligations recur in at least four regimes and are expressible
without knowing which country you are in: per-register sequential numbering, chaining, a record
for every correction, an event log, a slot on the receipt for a machine-readable code, a
structured export, and closures. Everything else is either country-specific formatting or an
external certified component. **That intersection is the groundwork.**

---

## 3. The regimes in one paragraph each

**France — art. 286-I-3° bis CGI, BOI-TVA-DECLA-30-10-30.** Four conditions —
inaltérabilité, sécurisation, conservation, archivage — applied to a defined dataset: every
transaction and payment line with its justificatif number, date to the minute, register number,
totals, per-line detail, payment method, *and the traces of every modification and correction*,
plus training-mode data. BOFiP is explicit that the legislator "n'a pas défini de cahier des
charges, ni de solution technique" — it states outcomes, and names chaining or electronic
signature as acceptable techniques rather than mandating either. Closings are the one
prescriptive part: daily, monthly and annual, unwaivable, each storing a *cumul du grand total
de la période* and a *total perpétuel* that never resets; keeping only Z-reports without
line-level data is explicitly non-compliant. Archives must be generatable by the editor, at
most annually, in an open format, with a French-language notice, retained 6 years. Proof is a
certificate from an accredited body (NF525 via AFNOR/Infocert, or LNE) **or** the editor's own
attestation individuelle — the latter abolished 16 Feb 2025 and restored 21 Feb 2026.

**Spain — RD 1007/2023 + Orden HAC/1177/2024 (VeriFactu).** Every invoice, including the
*factura simplificada* that a till receipt is, must have a *registro de facturación de alta*
generated at or immediately before issuance, carrying the series/number/date of the immediately
preceding record and part of its SHA-256 huella; errors are undone by a *registro de anulación*,
never a deletion. Every invoice carries a QR pointing at AEAT's cotejo service with the issuer
NIF, series/number, date and amount. The producer must publish a *declaración responsable*
inside the product, per version. Then the fork: **VERI\*FACTU** submits each record to AEAT
continuously and prints "Factura verificable en la sede electrónica de la AEAT" — and in
exchange is released from local signing, the event log, export and integrity self-checks;
**no-VERI\*FACTU** keeps everything locally and must additionally sign each record
(ETSI EN 319 132), maintain a *registro de eventos*, support export, self-verify the chain, and
raise a visible alarm on every connected terminal if integrity is threatened. Dual-use software
is separately illegal under LGT art. 201 bis, and has been since 2021.

**Germany — §146a AO / KassenSichV.** A BSI-certified **TSE** (TR-03153) signs the start and
end of every transaction and maintains a strictly sequential signature counter and transaction
number. The POS software itself is not certified; the TSE is, and cloud TSEs from foreign
vendors (fiskaly, Swissbit, Deutsche Fiskal) are explicitly equivalent to hardware ones, which
is what makes Germany reachable for a SaaS POS at all. A receipt must be offered on every sale
with prescribed fields (a QR may substitute). Audit means producing a **DSFinV-K** export on
demand. Each recording system must be notified to the Finanzamt through ELSTER.

**Italy — registratore telematico.** Daily aggregate *corrispettivi* transmitted to Agenzia
delle Entrate, historically only from a certified hardware RT. A software-only route exists
(D.Lgs. 1/2024 art. 24; Provv. 111204 of 7 Mar 2025) with a two-module architecture and approval
via an accredited *ente certificatore*, but its electronic-payment sub-module was still being
rolled out at the time of the sources reviewed. Every sale gets a *documento commerciale*. From
1 Jan 2026 each payment terminal must be paired to the RT in the AdE portal.

**Portugal — certified software, SAF-T (PT), ATCUD.** The heaviest vendor obligation of the six:
the **software product** is certified by the AT, per product, and the certificate number is
printed on every document. Each document's RSA signature chains to the previous document in the
same series; each series is pre-registered with the AT to obtain its ATCUD validation code;
every document carries a QR; SAF-T (PT) Faturação is filed monthly by the 5th. Non-resident
vendors can certify, but must appoint a Portuguese fiscal representative.

**Austria — RKSV.** Every till has a *Signaturerstellungseinheit* from one of three approved
Austrian trust providers, as a smartcard or as a cloud HSM — so a foreign SaaS POS integrates
by API rather than building a signer. Each receipt's signature chains to the previous receipt's;
an AES-256-encrypted *Umsatzzähler* accumulates turnover; a QR/OCR code goes on every Beleg; a
*Datenerfassungsprotokoll* is kept continuously and exported in the Z-3 format. Till and
signature unit are registered in FinanzOnline, commissioned with a Startbeleg, closed monthly
with a Monatsbeleg, and the December one — the Jahresbeleg — is verified with the BMF app or a
FinanzOnline upload by 15 February.

---

## 4. What WCPOS has today

Evidence is from `wcpos/woocommerce-pos` `includes/` at `7d20ff70`, and the payments contract in
`wcpos/wiki` at `bee3350`.

| Obligation | Today | Gap |
|---|---|---|
| Immutable record of a sale | `Receipt_Snapshot_Store` writes a **write-once** JSON snapshot to order meta `_wcpos_receipt_snapshot` on `woocommerce_payment_complete`, with a separate SHA-256 checksum in `_wcpos_receipt_snapshot_checksum`, under a MySQL `GET_LOCK`. `Receipts_Controller` serves it. | Stored as **order meta**, so "all records for register X between two dates" is a meta join. No record for anything but a completed sale. `Receipts_Controller` also supports `mode=live`, rebuilding a receipt from the **mutable** order; the default is `fiscal` but a merchant setting (`checkout.receipt_default_mode`) can flip it. |
| Sequential numbering | One **global** counter, `wcpos_receipt_sequence_counter`, a WP option incremented under a named lock; written to `_wcpos_receipt_sequence` and into `fiscal.sequence` / `fiscal.receipt_number`. | Not per register — there is no register. Assigned **server-side at `payment_complete`**, which for an offline sale is *sync-arrival time*, not sale time. A store with three tills interleaves their numbers by arrival order. |
| Register / till identity | **None.** `_pos_store` is the Pro store *scope*; `_pos_user` is the cashier; the ledger row carries `cashier_id` and an optional `store_id`. Device ids in the client belong to printers and scanners. | Nothing identifies the physical till. Needed by FR (numéro de caisse in the protected dataset), DE (ELSTER per system), AT (Kassen-ID), IT (per-terminal pairing) — and by the reports overhaul. |
| Hash chaining | `fiscal.hash` exists in the schema and is **always empty**. The per-record checksum is not a chain. | Chaining needs the previous record's hash; the extension hook `woocommerce_pos_fiscal_snapshot_enrich` receives only `($snapshot, $order_id)`. |
| Signature | `fiscal.signed_at` and `fiscal.signature_excerpt` exist and are **always empty**. | No signer, no key custody. |
| Event / audit log | **None.** `Pos_Order_Audit` stamps `_pos_user`, `_pos_store`, `_woocommerce_pos_version` and the cash-tender keys on the order and `Core_Order_Audit_Guard` stops a POS token forging them through core REST — good provenance, but per-order state, not an event stream. `Order_Notes` writes a human note per snapshot. | No sign-in/out, void, reprint, discount, override, shift-open/close or error events; nothing append-only. |
| Software identification | `_woocommerce_pos_version` is stamped on every POS order by `Orders_Controller`, server-derived. | **Not in the receipt snapshot or schema** — so the version that produced a given receipt is knowable from the order but not from the record a regime would inspect. No build/plugin-set identity. |
| Receipt fiscal slots | `Receipt_Data_Schema` (v1.2.0 on `main`) has a whole `fiscal` section: `immutable_id`, `receipt_number`, `sequence`, `hash`, `qr_payload`, `tax_agency_code`, `signed_at`, `signature_excerpt`, `document_label`, `is_reprint`, `reprint_count`, `extra_fields[]`. `store.tax_ids[]` landed via #853/#857. | Only `immutable_id`, `receipt_number` and `sequence` are populated. **QR is text-only** — the thermal adapters emit `[QR] payload` rather than a barcode, across ESC/POS, StarPRNT, TSPL, ZPL and CPCL. No register field, no software-identity field. |
| Corrections | A refund is a WooCommerce `shop_order_refund`; the ledger tracks `refunds[]` per payment row with `refunded_amount` rollups. | **No snapshot, no sequence, no record** is created for a refund or a void. `Receipt_Snapshot_Store` hooks `payment_complete` only. Roadmap [#77](https://github.com/wcpos/roadmap/issues/77) has already established that refunds must be dated by the refund, not the order. |
| Closure / Z report | A **client-side screen**: `packages/core/src/screens/main/reports/` aggregates today's completed orders and renders a printable Z-report template. | Nothing is stored, numbered, or retained. No period grand total, no perpetual grand total. Nothing prevents transactions landing in an already-reported day — and with offline sync, they routinely will. |
| Export | Receipt JSON via REST per order. | No day/period export of records or events in any format. |
| Training mode | **None.** | France requires it, marked. |
| Offline behaviour | Offline payment rows ride the order write with `recorded_offline: true`; the receipt prints from the **local** ledger; `payment_complete()` fires server-side when the order lands. | An offline sale prints a receipt with **no fiscal number at all**, then acquires one later in arrival order. This is the deepest structural gap. |

**Where the existing epic is over- or under-specified.** #720 mandates RSA-2048/ECDSA-256 for
France and #724/pro#148 build the 3/7/13/19 signature excerpt — both are NF525 conventions, not
BOFiP requirements, and with self-attestation restored neither is legally forced. #722 specifies
a France "JCD XML" archive; BOFiP asks only for an open format. #719 (country registry) sits in
Phase 1 ahead of any country implementation, which is an abstraction built before the two cases
that would shape it. And nothing in the milestone covers **training mode** (a French obligation)
or the **grand total perpétuel**, which is the one genuinely prescriptive part of the French text.

---

## 5. Groundwork shortlist

Ranked by *(cost of backfilling later)* × *(value if fiscal never ships)*. All six are
regime-agnostic and none of them commits us to a country, an algorithm, a certificate or a
submission endpoint.

### G1 — The till as a first-class object

**What.** A `register` entity: a stable id minted once per installed till, a merchant-visible
name ("Front counter", "Kiosk 2"), and an admin list. Stamped on every order the till writes,
carried on the payment ledger row alongside `cashier_id`/`store_id`, surfaced in the receipt
snapshot and available as a report filter. Survives reinstall via the same persistence the
client already uses for store credentials; a new install is a new register, deliberately.

**Why it is groundwork for every regime.** France protects the *numéro de caisse* as part of the
dataset and numbers per register. Germany notifies *each system* to the Finanzamt. Austria
registers a Kassen-ID. Italy pairs *each terminal*. Portugal numbers per series, which in a
multi-till shop means per till. Nothing downstream — numbering, chaining, closures, exports —
can be built per register until a register exists, and historical orders can never be
re-attributed to a till that was never recorded.

**Size.** Medium. A client-side identity, one meta key, a ledger field, an admin screen, a
report filter.

**Summary (merchant-facing).** Each till in your shop now has its own name and identity, so
sales, receipts and reports can be traced back to the exact register that rang them up. Reports
can be filtered by till, and cash-up stops mixing three counters into one number.

---

### G2 — Sale-time provenance, captured at the till

**What.** At tender, the till records three things into the order it writes: the **sale's own
time** (device clock, with timezone and offset), the **register id** from G1, and a
**device-local monotonic counter** that increments per completed sale on that till. All three
ride the offline queue unchanged and are write-once on the server, in the same way
`Pos_Order_Audit` already treats the till-sourced keys. The server's receipt sequence stays as
it is for now; this epic is about *capturing* the facts, not renumbering.

**Why it is groundwork for every regime.** Every regime binds a record's number to the moment
and the place of the sale. WCPOS assigns both on the server at sync arrival, which for an
offline sale is minutes or days late and in the wrong order. Once a sale has synced without its
own time and till, no later work can reconstruct them — this is the only item on this list where
delay destroys data rather than merely costing effort. It is also the prerequisite for moving
numbering per-register later without a migration, and the honest input to any chain.

**Size.** Medium to large — it crosses the app, the offline queue and the server write path, and
needs a deliberate answer for a till whose clock is wrong (record both device and server time;
never silently prefer one).

**Summary (merchant-facing).** Sales made while the till is offline now record the real time they
happened and the till that took them, not the time they later reached your server. Your reports
and receipts reflect the shop's day, not the network's.

---

### G3 — The closure as a stored document, built inside the reports overhaul

**What.** When a shift or day is closed, persist a **closure record**: a number from its own
sequence, the register, the operator, the period, totals per tax rate, per payment method,
transaction and refund counts, cash float opening/expected/actual, a **period grand total** and
a **perpetual grand total that never resets**. X-reports read without closing; Z-reports close.
Store it; don't recompute it.

**Why it is groundwork for every regime.** France makes daily, monthly and annual closings
unwaivable and specifically requires both grand totals, and says that keeping only Z-reports
without underlying line data is non-compliant — so the closure must be a stored document *and*
the lines must survive. Germany, Italy and Austria all have closure documents. And the timing is
the point: [#77](https://github.com/wcpos/roadmap/issues/77) is rebuilding reports **now**. If
the new Z-report ships as another screen aggregation, this becomes a second migration in 2027.
Adding "and it saves a numbered record" while #77 is being designed is nearly free.

**Size.** Medium, and mostly already inside #77's scope — plus the perpetual counter, which is
the piece #77 would not otherwise have.

**Summary (merchant-facing).** Closing a shift now produces a saved, numbered end-of-day report
rather than a screen you have to remember to print. Every closure is kept, so you can reopen last
March's Tuesday exactly as it was reported.

---

### G4 — Corrections are records

**What.** Extend the immutable snapshot from "a completed sale" to "a fiscally significant
document": a refund, a void, a correction and a cancelled-during-checkout sale each get their own
write-once record, their own type, their own number, and a reference to the record they correct.
The original record is never touched.

**Why it is groundwork for every regime.** Every one of the six forbids deletion and requires the
correction to be an additional record — France's "opérations de « plus » et de « moins »",
Spain's *registro de anulación*, and so on. WCPOS today creates a record only when money is
taken, which means the half of the ledger a tax inspector cares most about does not exist. It
also lines up with #77's finding that a refund must be dated by the refund.

**Size.** Medium. New record types on the existing store, a second hook alongside
`woocommerce_payment_complete`, and receipt rendering for a refund document (roadmap
[#78](https://github.com/wcpos/roadmap/issues/78) already wants a receipt after a refund).

**Summary (merchant-facing).** Refunds and voids now produce their own permanent record and their
own receipt, instead of only editing the original sale. Nothing is ever erased — a correction is
always visible as a correction.

---

### G5 — The receipt identity block, and a QR that is actually a QR

**What.** Two additive things. (a) Extend the receipt schema with the identity a regime looks
for: software name, version and build, the register from G1, the document type, and copy marking
with a reprint count and date — populating the `is_reprint`/`reprint_count` slots that already
exist. (b) Make `fiscal.qr_payload` **render**: a real barcode in ESC/POS, StarPRNT, TSPL, ZPL
and CPCL, and in the HTML and PDF renderers, replacing today's `[QR] payload` placeholder.

**Why it is groundwork for every regime.** Spain, Portugal and Austria put a mandatory QR on
every document; Germany allows one to stand in for the printed TSE fields; Italy's documento
commerciale carries machine-readable data. The *content* differs per country and belongs in the
country modules (pro#147 already scopes that) — but the *rendering* is identical everywhere and
is a real chunk of work across five printer languages. Doing it now also unblocks non-fiscal
uses: an order-lookup QR, an e-receipt link, a review prompt.

**Size.** Medium, weighted toward the printer work. The schema half is small and purely additive.

**Summary (merchant-facing).** Receipts can now print a real scannable QR code on any supported
printer, and reprints are clearly marked as copies with their number and date. Each receipt also
records exactly which version of WCPOS produced it.

---

### G6 — An append-only event log

**What.** One append-only store and a **fixed, versioned event vocabulary**: sign-in, sign-out,
sale completed, refund, void, receipt printed, copy printed, discount applied, price overridden,
shift opened, shift closed, closure generated, export generated, fiscal error. Each event carries
time, register, operator, type and a small payload. Queryable by date, register, operator and
type. Nothing is updated or deleted.

**Why it is groundwork for every regime.** France requires the minute-dated trace of every
modification and correction; Spain requires a *registro de eventos* in no-VERI\*FACTU mode;
Germany's GoBD and DSFinV-K and Austria's DEP both assume a journal. The vocabulary is the part
worth fixing early — every regime's export is a projection of the same events under a different
name, and a log started late is a log with a hole in it. It is also immediately useful for
support: "who voided this, and when".

**Size.** Small to medium if it shares storage with G4's records under a different record type;
the design cost is in choosing the vocabulary, not the plumbing.

**Summary (merchant-facing).** WCPOS now keeps a permanent, unalterable log of what happened at
the till — sign-ins, voids, discounts, reprints and shift closures. When something looks wrong in
the takings, there is a record of how it got that way.

---

**Not on the list, deliberately.** A generic country-registry abstraction (epic #719) — it is
better written after France and Spain exist than before, or it will be shaped by neither. Key
storage and a signing engine (#720) — see §6. And renumbering the existing global receipt
sequence: G1 and G2 make that migration possible later; doing it before a register exists just
moves the problem.

---

## 6. What must not be attempted early

| Don't | Why |
|---|---|
| **Pursue NF525 / LNE / Infocert certification, or pay for it** | The attestation individuelle is valid again as of 21 Feb 2026 (loi n° 2026-103 art. 125). Certification is a private standard, costs money, and binds recertification to "version majeure" changes — an active product would be re-certifying continuously. The compliant path is the four BOFiP conditions plus a BOI-LETTRE-000242 attestation. |
| **Implement NF525's ticket conventions as if they were French law** | The 3/7/13/19 signature excerpt, certificate number, certification category and line count are référentiel conventions. BOFiP requires none of them on the ticket. Build the *slots* (G5); don't populate them to a private spec we are not certifying against. |
| **Build an AEAT submission client, XSD binding, or QR verification URL now** | The technical spec lives in AEAT documents outside the Order and is versioned independently; the taxpayer date is 2027; and the endpoints and preproduction environment will have moved by then. Build the payload slot, not the client. |
| **Build a TSE, or design signing "to also cover Germany"** | A TSE must be BSI-certified under TR-03153. Germany is reached by integrating a certified cloud TSE (fiskaly, Swissbit, Deutsche Fiskal) — a procurement and integration decision, not a cryptography one. Any signing engine we write cannot satisfy Germany. |
| **Build an Austrian signer** | The key lives in an approved Austrian VDA's HSM or on their smartcard, and never leaves. The integration is an API call to A-Trust, Globaltrust or PrimeSign. |
| **Choose a signature algorithm or key-custody model now** | Each regime dictates the key's provenance: Portugal registers ours with the AT, Austria's belongs to a VDA, Spain's is XAdES in one mode and unnecessary in the other, France mandates nothing. Picking now is picking wrong. Storing a private key in `wp_options` on shared hosting is a decision that deserves its own security review, not a side-effect of a fiscal ticket. |
| **Ship into Portugal at all before AT certification** | Certification is of the *software product*, per product, requires Modelo 24 and a Portuguese fiscal representative for a third-country producer, and the certificate number must print on every document. This is a commercial decision with a cost and a lead time, made before any code. |
| **Try to make WCPOS an Italian registratore telematico** | The hardware RT route is closed to us; the software route needs approval by an accredited *ente certificatore* and AdE, and its payment sub-module was still rolling out. The 2026 POS↔RT pairing is a merchant action in the AdE portal, not a feature. Italy is a "later, via partnership" market. |
| **Start 6-year archival, purge and external-media machinery** | France's archiving obligation is real but it is the *last* piece: it presupposes the records, the closures and the events all exist. Building retention over a record model that is about to change is wasted work. |
| **Write the country registry before two countries exist** | An abstraction over one implementation is a guess. France and Spain differ enough (closures vs. no closures; chaining-or-signing vs. mandatory chaining; audit-only vs. optional submission) that building both first will produce a much better seam. |

**Two things for Paul, not for engineering.**

1. **Spain, now.** The obligation on *producers and marketers* of invoicing software fell due
   **29 July 2025** and was not moved by either postponement. LGT art. 201 bis carries sanctions
   for producing or marketing non-compliant systems (secondary sources put it at €150,000 per
   year and per program type; not verified against raw BOE text here). Whether WCPOS, sold to
   Spanish merchants from outside Spain, is a *productor o comercializador* within that article's
   reach is a question for a Spanish tax adviser. It is the only item in this note with live
   exposure that engineering cannot reduce.
2. **France, now.** Any French merchant running WCPOS today is exposed to €7,500 per till, and
   the customer who triggered this epic asked for exactly that. The attestation route means the
   gate is our own honest assessment against four conditions — which is cheap to sign and
   expensive to sign falsely. G1–G6 are what make it signable.

---

## 7. Flagged as unconfirmed

Carried forward from the research so they are not quietly promoted to fact:

- **France:** no BOFiP-level requirement was found for printing software name/version, a
  signature or a hash on the customer ticket, nor for duplicate-copy marking. These may be
  NF525-référentiel requirements; the référentiel is a paid AFNOR document and was not read.
- **France:** art. 1770 duodecies CGI still reads in terms of the certificate; the LF2026
  restoration of the attestation may not yet be reflected in that article's wording.
- **Spain:** the QR's size (30×30–40×40 mm), ISO/IEC 18004 and error-correction level M come from
  secondary technical summaries of the Order's art. 21, not from the raw BOE text.
- **Spain:** the LGT art. 201 bis penalty figures are secondary-source only.
- **Spain:** the 4-year retention figure for no-VERI\*FACTU is inferred from the general LGT
  art. 66 prescription period; AEAT's own FAQ says "periodo de prescripción fiscal".
- **Spain:** whether AEAT's **production** submission endpoint is fully live as of September 2026
  could not be confirmed from an explicit official statement.
- **Italy:** the operational status of the software-RT electronic-payment sub-module needs
  re-checking directly against the AdE "Soluzioni software" pages.
- **Portugal:** the certification process and cost detail come from a mirrored legacy DGCI FAQ,
  not the live Portal das Finanças procedure; the SAF-T Contabilidade deferral to 2028 and the
  QES shift to 1 Jan 2027 are trade-press only.
- **Austria:** the foreign-vendor registration mechanics are inferred from VDA documentation, not
  from RIS or BMF directly; the Registrierkassenpflicht thresholds disagree across sources.

---

## Sources

**France**
- BOFiP, BOI-TVA-DECLA-30-10-30 — the four conditions, dataset, closings, archiving: https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20251001
- BOFiP ACTU-2025-00160 — abolition of the attestation (LF2025 art. 43) and the transitional tolerance: https://bofip.impots.gouv.fr/bofip/14826-PGP.html/ACTU-2025-00160
- BOFiP ACTU-2026-00073 (25 Mar 2026) — restoration of the attestation by LF2026 art. 125; model BOI-LETTRE-000242: https://bofip.impots.gouv.fr/bofip/15035-PGP.html/ACTU-2026-00073
- Légifrance, art. 1770 duodecies CGI — €7,500 and the 60-day regularisation: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051203251
- economie.gouv.fr — certification des logiciels de caisse, inspections: https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/ce-quil-faut-savoir-sur-la-certification-des-logiciels-de-caisse
- impots.gouv.fr — scope of the obligation: https://www.impots.gouv.fr/professionnel/questions/quel-est-le-champ-dapplication-de-lobligation-de-detenir-un-logiciel-de
- LégiFiscal — LF2026 restoration summary: https://www.legifiscal.fr/actualites-fiscales/4460-loi-finances-2026-retablissement-auto-certification-logiciels-caisse.html

**Spain**
- BOE-A-2023-24840 — Real Decreto 1007/2023, consolidated (incl. disposición final cuarta): https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840
- BOE-A-2024-22138 — Orden HAC/1177/2024: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138
- BOE-A-2025-6600 — Real Decreto 254/2025 (first postponement): https://www.boe.es/buscar/doc.php?id=BOE-A-2025-6600
- AEAT — Orden ministerial announcement, start of the nine-month producer clock: https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2024/octubre/28/orden-ministerial-que-se-regulan-verifactu.html
- AEAT FAQ — Sistemas VERI\*FACTU (modes, event log, QR, retention): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/sistemas-verifactu.html
- AEAT — hash algorithm and encoding specification: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/informacion-tecnica/algoritmo-calculo-codificacion-huella-hash.html
- AEAT preproduction portal: https://preportal.aeat.es/

**Germany**
- BSI — fiscalisation certification (TR-03153) and certified TSE products: https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Zertifizierung-und-Anerkennung/Zertifizierung-von-Produkten/Zertifizierung-nach-CC/Zertifizierte-Produkte-nach-CC/Fiskalisierung/Fiskalisierung_node.html
- BMF FAQ — Belegausgabepflicht and receipt content: https://www.bundesfinanzministerium.de/Content/DE/FAQ/FAQ-steuergerechtigkeit-belegpflicht.html
- Finanzamt Hessen — §146a Abs. 4 ELSTER notification and its deadlines: https://finanzamt.hessen.de/meldung-von-kassensystemen-und-taxameternwegstreckenzaehlern-nach-ss-146a-absatz-4-ao
- DIHK — electronic reporting of cash systems from 1 Jan 2025: https://www.dihk.de/de/themen-und-positionen/elektronische-meldung-von-kassen-systemen-ab-1-januar-2025-moeglich--120058

**Italy**
- Agenzia delle Entrate — POS/RT pairing from 1 Jan 2026: https://www.agenziaentrate.gov.it/portale/-/pagamenti-elettronici-dal-1%C2%B0-gennaio-2026-scattano-le-nuove-regole.-ecco-come-abbinare-registratori-di-cassa-e-pos
- Agenzia delle Entrate — press release on Provv. 424470 of 31 Oct 2025: https://www.agenziaentrate.gov.it/portale/documents/d/guest/059_com-st-provv-rt-pos-31-10-2025
- Agenzia delle Entrate — Soluzioni software, normativa e prassi (Provv. 111204/2025): https://www.agenziaentrate.gov.it/portale/it/soluzioni-software/normativa-e-prassi
- Agenzia delle Entrate — technical specifications v1.1: https://www.agenziaentrate.gov.it/portale/documents/d/guest/specifichetecniche_v-1-1
- Agenzia delle Entrate — lotteria degli scontrini, merchant guide: https://www.agenziaentrate.gov.it/portale/lotteria-degli-scontrini-info_guida-esercenti

**Portugal**
- Portaria 340/2013 (amending Portaria 363/2010) — signing and chaining rules: https://diariodarepublica.pt/dr/detalhe/portaria/340-2013-503842
- Garrigues — certified software mandatory for non-resident entities: https://www.garrigues.com/en_GB/new/use-certified-invoicing-software-becomes-mandatory-non-resident-entities-not-established

**Austria**
- WKO — Registrierkassen- und Belegerteilungspflicht: https://www.wko.at/steuern/registrierkassen-belegerteilungspflicht
- WKO — Prüfung des Jahresbelegs: https://www.wko.at/steuern/pruefung-jahresbeleg-registrierkasse
- A-Trust — RKSV product portfolio (smartcard and HSM signing): https://www.a-trust.at/de/produkte/registrierkasse/rksv_portfolio/
- Globaltrust — RKSV FAQ, cloud HSM signing for POS vendors: https://globaltrust.eu/faq-globaltrust-rksv/

**WCPOS**
- Epic: https://github.com/wcpos/woocommerce-pos/issues/713 — and the `Compliance / Fiscalization` milestone in `wcpos/woocommerce-pos` (#715–#725, #857) and `wcpos/woocommerce-pos-pro` (#147–#150)
- Reports overhaul: https://github.com/wcpos/roadmap/issues/77
- Payments contract v1: `wcpos/wiki` `architecture/client/payments-contract.md` and `payments-contract/ledger.md`, `payments-contract/tender-flows.md`
- Plugin code read: `includes/Services/Receipt_Snapshot_Store.php`, `Fiscal_Receipt_Service.php`, `Receipt_Data_Schema.php`, `Receipt_Data_Builder.php`, `Pos_Order_Audit.php`, `Core_Order_Audit_Guard.php`, `includes/API/V1/Receipts_Controller.php`, `includes/API/V1/Orders_Controller.php`
