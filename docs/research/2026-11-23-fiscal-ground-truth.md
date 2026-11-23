# Fiscal compliance (v2.1.0): ground truth before planning

**Research note, 2026-11-23.** For the wayfinder map wcpos/roadmap#641.

**Summary.**
1. The regime-agnostic groundwork is built on `main`: register identity, sale-time provenance, write-once fiscal records, stored closures and the receipt identity block. There is no signing, no hash chain and no country code in any of the three repos.
2. The release is scoped to France and Spain first, due 2026-12-31 (roadmap#225). Paul's 2026-09-10 comment on woocommerce-pos#713 corrected several of the epic's assumptions, but the issue bodies were never updated to match.
3. The open questions are about each regime, not about plumbing. Section C lists them. Section E lists where this work meets the v2.2.0 permissions release (reopen, void, refund, reattribution).

Scope: read-only. No code was run. Labels: **Observed** means read in the cited issue, document or file at the SHA below. **Inferred** means my reading. Code findings in §B were read with `git grep` and `git show` on origin/main. Some were gathered by a read-only sub-agent, and the key ones were re-located by line number for this note.

## SHAs read (origin/main, 2026-11-23)

| Repo | SHA |
|---|---|
| wcpos/woocommerce-pos (Free) | `eee4cb0a84fb95c1d8090ea93d0d7b78396aff5d` |
| wcpos/woocommerce-pos-pro (Pro) | `4a93273cba19187f1119ba5179e1c406c3d089d1` |
| wcpos/monorepo (app, local `monorepo-v2`) | `cc7cdb606460a47dd3c73804f352443d4dd32c1d` |
| wcpos/roadmap | `cacfefe8f0b5c8344d47a537ce0df4e2ab017965` |
| wcpos/wiki | `ea406f67bd76c76a8c8b45e607004aa554c63847` |

Sources read:
- Issues: woocommerce-pos #713, #715–#725, #2378 and PR #2719; woocommerce-pos-pro #147–#150; roadmap #225, #199, #200, #209, #212, #214, #215, #302, #313.
- Roadmap documents: `ROADMAP.md`; `docs/research/2026-09-11-fiscal-compliance-groundwork.md` ("the groundwork note"); `docs/research/2026-11-20-fiscal-rules-on-post-sale-edits.md` ("the post-sale note"); `docs/research/2026-10-16-negative-amounts-and-receiptless-returns.md`; `docs/research/2026-11-22-permissions-ground-truth.md`; `docs/specs/2026-11-22-cashier-permissions-v2.2.0-spec.md`; `docs/handoffs/2026-09-11-fiscal-groundwork-frontier-two.md`.
- Wiki: `architecture/client/fiscal-groundwork.md` and its spokes; `architecture/plugin-free/pos-order-audit-meta.md`; `architecture/client/cart-settlement-completion-proofs.md`; `support/international/fiscal-compliance.md`.

---

## A. Decisions already recorded

### The release: roadmap#225 (filed 2026-09-10)
- **Due date and pitch.** Due 2026-12-31. Pitch: "Sell in France, Spain and beyond with a till that keeps the tamper-evident records the law requires." Observed (#225).
- **Not in the release.** "Countries beyond the first modules. France and Spain come first." Also "Certification by an accredited body where a country requires one rather than self-attestation. That is a commercial step after the software is ready." Observed (#225).
- **Numbering.** Renumbered from v1.12.0 to v2.1.0 on 2026-09-30. The issue records Paul as saying "fiscal compliance moves to 2.1.0 and everything else falls in line after it". Observed (#225 footer).
- **Placement.** `ROADMAP.md:18` puts it under Expedite: "Fiscal compliance Phase 1 (NF525/VeriFactu) … due 2026-12-31 (VeriFactu deadline Jan 2027)". `ROADMAP.md:43` places v2.2.0 permissions after 2.1.0, "and the two swap if this is ready first". Observed.

### The framework epic: woocommerce-pos#713 (2026-04-01) and its sub-issues
- **Key design decisions in the body:**
  1. Fiscal records are separate from WooCommerce orders, in an append-only log, and WooCommerce edits generate corrective entries.
  2. Cryptography runs on the server.
  3. Country modules are extensions.
  4. Fiscal work is offline-first, with a queue.
  5. It builds on the receipt snapshot.

  Observed (#713 body).
- **Trigger.** "Customer request for NF525 compliance to renew their French business license." Observed (#713).
- **Phases in the body.** Phase 1 is the core engine: #715 storage, #716 hash chain, #717 sequences, #718 audit log, #719 country registry. Phase 2 is France. Phase 3 is Spain. Observed (#713 body and first comment).
- **Paul's comment on #713, 2026-09-10**, links the groundwork note and records three corrections:
  1. "the binding French text is BOFiP BOI-TVA-DECLA-30-10-30, not the NF525 référentiel". BOFiP asks for "chaînage **ou** signature électronique" and an archive in "un format ouvert".
  2. "Spain's no-VERI\*FACTU is the **harder** mode".
  3. France's *mode école* and the *total perpétuel* are real obligations with no issue covering them.

  Observed (#713 comment, 2026-09-10).
- **The issue bodies still carry the retracted conventions.**
  - #720 still requires RSA-2048/ECDSA-256 and the 3/7/13/19 excerpt.
  - #722 still requires a France "JCD" XML archive.
  - Pro#148 still builds the 3/7/13/19 excerpt.
  - Pro#149 still lists "certification category, certificate number" for France.

  Observed (issue bodies).
- **Closed sub-issue.** #724 (receipt fields and QR) was closed 2026-04-01 by PR #727. The rest of #715–#725 are open. Observed.
- **Basque Country addendum, 2026-10-21 (Paul's comment on #713).** "the Basque Country is not VeriFactu … 'Spain' in this epic is two receivers behind one chain." Observed.

### The groundwork's own rulings (2.0)
- **Five epics.** The groundwork shipped as epics roadmap #197 (register), #198 (provenance), #199 (closures), #200 (corrections as records) and #201 (receipt identity and QR). It is written down as contract v1 in wiki `architecture/client/fiscal-groundwork.md`, written 2026-09-11 and last updated 2026-11-01. Observed.
- **The contract's filter.** Build only what is "regime-agnostic, useful even if fiscal never ships, and impossible or expensive to backfill". It states: "Signature algorithms, key custody, submission endpoints, hash chains and export formats are out of scope (§7)". Observed (wiki fiscal-groundwork §1).
- **#215 (resolution 2026-09-11).** "All five fiscal epics ship in 1.11.0; the date follows the work". 1.11.0 was later renumbered 2.0.0. Observed.
- **#209, Paul's resolution of 2026-09-10:**
  - "the person is always the token holder".
  - `_pos_user` is server-derived.
  - `reassign_woocommerce_pos_sales` gates every change to `_pos_user` and folds in store reassignment.
  - `_pos_user_created` is write-once.
  - "**A closure is immutable.** Reassigning after close never reopens or amends it."
  - "Sign-in/out events for the fiscal log come from token issue and revoke."

  Observed.
- **#212 amendments (2026-09-10):**
  - A closure carries `store_id`.
  - A forgotten session closed from another register is numbered by the server.
  - `recount` needs `manage_woocommerce_pos_closures`.
  - In Free, the Closures view is Pro and the last closure can be reprinted as a copy.

  Observed (#212 comments).
- **#302.** Refunds are dated by the refund. The WooCommerce floor is 9.0 for 2.0 (Paul's ruling of 2026-09-16). The 2026-10-16 note on #302 ties this to Spanish art. 89 LIVA. Observed.
- **#313 (Paul, 2026-09-16).** `HISTORY_DAYS = 92` is the device reach. "Nothing on the device is pruned by age: closures never". Observed.
- **Refund writer drain (Paul, 2026-10-20).** "A refund drains it first": the refund writer calls `recover()` on a parked sale before looking it up. Observed (wiki `fiscal-groundwork/records-and-closures.md:61`, citing woocommerce-pos#2370).
- **Dropped correction types (2026-10-20).** `gateway_reconciliation` and `hold_release` were dropped. Observed (wiki `records-and-closures.md:45`).
- **Reattribution ruling (Paul, 2026-11-20).** Quoted in the body of woocommerce-pos#2719, which merged to `main` on 2026-11-20: "users with the reassign capability can change Cashier and Store on any order, at any time, including after the register session is closed; each change writes an order note and an append-only change record." Observed.

### What the research said not to build early (a recommendation, not a ruling)
- **The list** (groundwork note §6, lines 408–421):
  - no NF525/LNE/Infocert certification;
  - no NF525 ticket conventions treated as law;
  - no AEAT submission client, XSD binding or QR URL;
  - no TSE;
  - no Austrian signer;
  - no signature algorithm or key-custody choice;
  - no shipping into Portugal before AT certification;
  - no Italian RT;
  - no 6-year archive machinery;
  - no country registry before two countries exist.

  Observed. Its status is research recommendation, not a ruling (Inferred).

---

## B. What is built on `main` today

### Free (woocommerce-pos @ `eee4cb0a`)
- **Records table.**
  - `Fiscal_Record_Store` owns table `wcpos_fiscal_records`. Its docblock reads "no update or delete path is exposed". Observed (`includes/Services/Fiscal_Record_Store.php:14`).
  - Record types: `sale, refund, void, cancellation, late_sale, late_refund, late_movement, recount, reattribution`. Observed (`Fiscal_Record_Store.php:22`). The ruled `approval` type is not in the constant. Observed (wiki `records-and-closures.md:24`).
- **Numbering.** Each type has its own option sequence, `wcpos_fiscal_sequence_{type}`, under lock `wcpos_fiscal_sequence_lock`. The `series` column is `''`, so numbering is global per type, not per register. Observed (`Fiscal_Record_Store.php:28,158`; wiki `records-and-closures.md:49`).
- **Checksum.** Each row carries a sha256 checksum of its payload. Observed (`Fiscal_Record_Store.php:181`). It is not chained to the previous row. Observed: no `prev_hash` anywhere in `includes/`.
- **Write-once replay.** Uniqueness is on `(type, series, number)` and `(type, source_id)`. A replay is a no-op. Observed (`Fiscal_Record_Store.php:125`; wiki `records-and-closures.md:43`).
- **Writers and the parked-sale retry.**
  - A sale record is written per completion (`wcpos_sale_completed`), and a re-completion supersedes the previous one. Observed (wiki `records-and-closures.md:57,61`).
  - A sale whose insert failed is parked under `_wcpos_fiscal_pending`. It is recovered by `recover()` and by the payments sweep through `orders_owed_a_sale()`. Observed (`includes/Services/Fiscal_Record_Writers.php:25,205,329,857`). That retry is what closed #2378 (via #2448). Observed (#2378).
- **Enrichment hook.** The filter `wcpos_fiscal_snapshot_enrich` runs under the sequence lock (five-second wait). The old `woocommerce_pos_fiscal_snapshot_enrich` name is deprecated since 2.0.0. Observed (`Fiscal_Record_Writers.php:825–833`).
- **Read route.** `wcpos/v2/records` is read-only. Observed (`includes/API/V2/Records_Controller.php:40`).
- **Old snapshot retired.**
  - The order-meta `_wcpos_receipt_snapshot*` keys are deleted on upgrade.
  - The sale sequence is seeded from `wcpos_receipt_sequence_counter`, and that option is then deleted.
  - `Receipt_Snapshot_Store` and `Fiscal_Receipt_Service` no longer exist.

  Observed (`includes/Services/Receipt_Snapshot_Cleanup.php:125`; `Fiscal_Record_Store.php:233`).
- **Receipt schema.**
  - Version `1.4.0` (`includes/Services/Receipt_Data_Schema.php:50`), with `software` (`:1096`) and `register` (`:1126`) blocks.
  - The `fiscal.hash`, `qr_payload`, `signed_at` and `signature_excerpt` slots exist (`:1226–1242`) and default to empty. Only refund documents fill `hash`, with the row checksum.

  Observed (schema; `Receipt_Data_Builder.php` per the sub-agent).
- **Reprints and documents.**
  - Reprints are counted on `_wcpos_receipt_print_count` (`includes/Services/Receipt_Print_Counter.php:100,113`).
  - `document=refund:|closure:|xreport:|handover:` is served by `Fiscal_Record_Store::resolve_document()` (`Fiscal_Record_Store.php:348`).

  Observed.
- **Register.**
  - Free's one register is held in option `wcpos_register` (`includes/Services/Option_Register_Repository.php:20`). `wcpos_registers` survives only as a legacy table (`includes/Services/Register_Store.php:16`).
  - Routes: `wcpos/v2/registers` and `/registers/health`.
  - Ledger payment rows carry `register_id` and `session_id`.

  Observed.
- **Provenance keys.**
  - Till-sourced: `_wcpos_register, _wcpos_till, _wcpos_sale_time, _wcpos_sale_tz, _wcpos_sale_counter, _wcpos_session, _wcpos_app_version, _wcpos_app_build` (`includes/Services/Pos_Order_Audit.php:80`).
  - Server-stamped: `_wcpos_sale_received_gmt` (`includes/API/V2/Writers/Order_Writer.php:83`).
  - `_pos_user` and `_pos_user_created` are server-derived (`Pos_Order_Audit.php:37`).

  Observed.
- **Closures.**
  - The legacy `wcpos_closures` table has been folded into the session row (`includes/Services/Closure_Store.php:20`).
  - Numbering is per register, with a jump guard (`MAX_NUMBER_JUMP = 10000`, `:28,737`).
  - Perpetual totals: `perpetual_sales_total` and `perpetual_refunds_total` (`:58–59`).
  - `late_sale` and `late_refund` are carried into the next closure through `carried_by_closure_id` (`:433–456`).
  - Recount and CSV export are present.

  Observed. Per wiki `fiscal-groundwork.md` §8, `perpetual_adjustments_total` "is ruled, not built". Observed.
- **Health.** Counter gaps and duplicates per till, and clock skew over `SKEW_SECONDS = 600` (`includes/Services/Provenance_Health.php:20`), plus the closure findings. Observed.
- **Reattribution.** A cashier or store change on a sale that has a `sale` record writes a `reattribution` record before the change is applied (`Fiscal_Record_Writers.php:112,163`; wiki `pos-order-audit-meta.md:90`). Observed.
- **Audit logging.** Register, session, movement, closure, reprint and recount events go to WP Admin › POS › Settings › Logs. This is not an append-only fiscal event log. Observed (wiki `fiscal-groundwork.md` §8, free#1965). That it does not meet the G6 log is Inferred.

### Pro (woocommerce-pos-pro @ `4a93273c`)
- **Registers per store** as store-post meta: `Meta_Register_Repository` (`includes/Services/Meta_Register_Repository.php:22`), attached through `wcpos_register_repository` (`includes/Registers.php:104–105`). Observed.
- **No fiscal code.** No hit for `fiscal_snapshot_enrich`, `prev_hash`, `openssl_sign`, VeriFactu, TicketBAI, NF525 or fiskaly in `includes/`. Observed. Pro#147–#150 (QR encoding, signature excerpt, document labels, reprint marking) are open with no comments. Observed.
- **Reprint marking already done in Free.** The reprint count that Pro#150 asks for is already counted in Free (`Receipt_Print_Counter.php`). Observed. That Pro#150 is partly superseded is Inferred.

### App (monorepo @ `cc7cdb60`)
- **Provenance stamp.** `saleProvenanceMeta` (`packages/order-math/src/payments/provenance.ts:12`). `withSaleProvenance` (`:137`) never overwrites an existing key. Observed.
- **Per-register sale counter.** `nextSaleCounter` (`packages/query/src/register-session/register-document.ts:388`). Observed.
- **Completion stamp and till id.** Stamped in `packages/core/.../checkout/provenance/stamp-completion.ts`. `_wcpos_till` is stamped in `packages/query/src/mutations/resident.ts:431`. Observed (sub-agent read).

### Not found anywhere
- **No signing or chaining** in any repo: no `openssl_sign`, `sodium_crypto_sign` or chain verification. Observed.
- **No fiscal provider adapter interface.** The `*_Provider_Adapter_Interface` hits are print or payment providers. Observed.
- **No country fiscal code.** Country-specific code exists only for tax IDs (`Tax_Id_Types.php`). Observed.
- **Customer-facing claims (wiki `support/international/fiscal-compliance.md`, 2026-09-30):** "WCPOS is **not certified**" for NF525, VERIFACTU and Norway. Observed.

---

## B2. Where the planning documents and the code differ
- **Global sequences, not per register.** #717's per-register sequence does not exist. The `series` column is reserved for it: "Per-register numbering, chaining and per-series numbering are the country modules' migration". Observed (wiki `records-and-closures.md:49`).
- **No meta storage left.** #715 is about migrating from order-meta snapshots, which are already removed. The custom table exists. Observed (§B). That #715's remaining scope is the "corrections reference originals" and query parts, most of which are built, is Inferred.
- **The enrichment filter is not chain-aware.** #716's comment says the hook receives only `($snapshot, $order_id)`, and that is still true (`Fiscal_Record_Writers.php:832`). Observed.

---

## C. What the epics leave open

Each item is a question no source answers. Labels say where it is recorded as open.

1. **Spain's producer obligation, live since 29 July 2025.** Is WCPOS a *productor o comercializador* under LGT art. 201 bis? The note calls it "a question for a Spanish tax adviser … the only item in this note with live exposure that engineering cannot reduce." Observed (groundwork note §6, lines 425–431). No ruling found. Observed (no comment on #225 or #713).
2. **Spain mode.** VERI\*FACTU (continuous submission, which releases local signing, the event log, export and self-checks) or no-VERI\*FACTU (local signing per ETSI EN 319 132, an event log, export and an integrity alarm), and which first. #713 phases no-VERI\*FACTU first. The research says that is "backwards". Observed (#713 body Phase 3; groundwork note §0.3). Undecided. Inferred.
3. **TicketBAI in 2.1.0 or not.** It is a different receiver, needs registration on the *software garante* register, and its correction model is unconfirmed. Observed (groundwork note §3 and §7; post-sale note §4). No ruling. Observed.
4. **France technique.** Chaining or electronic signature: BOFiP accepts either. Observed (groundwork note §2 and §3). If signing: the algorithm and key custody, which #720 leaves open ("wp_options encrypted? file-based? external KMS?"). Observed (#713 comment 2, #720). Undecided. Inferred.
5. **Numbering scope.** Per register and record type for France, per series for Spain. The move off global per-type sequences is "the country modules' migration". Observed (wiki `records-and-closures.md:49`). What happens to existing sale numbers, and whether a new chain starts at activation, is not ruled. #717's comment suggests "new per-register sequences would start fresh". Observed (#717 comment).
6. **French closures.** Daily, monthly and annual, "unwaivable", each with a period grand total and a *total perpétuel* (groundwork note §3). Built: per-session closures and two perpetual totals. Not built: monthly and annual closures, the period grand total, the ruled `adjustments` counter and the `approval` record. Observed (§B; wiki `records-and-closures.md:57`). How a session closure maps to the French *clôture journalière* is not ruled. Inferred.
7. **Event log (G6).** "no epic yet"; the vocabulary is unchosen. Observed (wiki `fiscal-groundwork.md` §7; groundwork note G6). #718 is open. Observed.
8. **Training mode.** France requires marking only "if offered". Wiki: "training mode (dim, may prove out of scope)". Observed (groundwork note §2; wiki `fiscal-groundwork.md` §7). Whether to offer one is undecided. Inferred.
9. **Archive and export.** France: an "open format" with a French notice, generated at most annually, kept 6 years. Spain: AEAT XSD. Today the only export is the closures CSV. Observed (groundwork note §2–3; §B). The format and the retention machinery are undecided. Observed (#722 open; groundwork note §6).
10. **Vendor documents.** The French *attestation individuelle* (model BOI-LETTRE-000242) and the Spanish *declaración responsable*, per version, inside the product (#725 open). Who signs them, and the publisher identity, are not recorded. Observed (#725; groundwork note §6 "Two things for Paul").
11. **Country registry (#719).** It is Phase 1 in the epic, but the research says to write it "after France and Spain exist". Observed. Not ruled. Observed. #706 (locale consolidation, which #719 depends on) is open. Observed.
12. **Other countries.**
    - Germany through a certified cloud TSE, which is "a procurement and integration decision".
    - Austria through an approved trust provider.
    - Portugal is a "commercial decision" needing AT certification and a fiscal representative.
    - Italy is "later, via partnership".

    Observed (groundwork note §6). #225 excludes "countries beyond the first modules". Observed. Whether any of these is named for 2.1.0 is not ruled. Inferred.
13. **Czech EET 2.0.** The wiki support page states it goes live 1 January 2027, with enactment "pending final enactment" when written (2026-09-30). It is not in any plan. Observed.
14. **Offline and authority timing.** #723 requires that a real-time record is "not finalized until authority confirms (or offline fallback activates)". A non-member comment on #713 (2026-04-10) argues for asynchronous submission. Observed. Not ruled. Observed.
15. **Due date.** 2026-12-31 "follows the milestone; Paul redirects both by telling an agent". Observed (#225 footer). Whether 2026-12-31 still holds is not re-ruled since 2026-09-10. Inferred.

---

## D. Countries and regimes named

Dates are quoted as written, with where and when.

| Regime | Dates as written (source, date written) | Approach in the material |
|---|---|---|
| 🇫🇷 France (CGI art. 286-I-3° bis, BOFiP) | "**21 Feb 2026**: France restored the *attestation individuelle* (loi n° 2026-103 art. 125, model BOI-LETTRE-000242)" (#713 comment, 2026-09-10). "in force since **1 January 2018**. Fine **€7,500 per software or system**", "60 days to regularise" (groundwork note §1, 2026-09-11). "There is no deadline; the exposure is today's." | Build it ourselves and self-attest. Not NF525 certification (groundwork §6). Epic #713 (2026-04-01) said "NF525 (self-attestation)". Observed. |
| 🇪🇸 Spain (VeriFactu, RD 1007/2023, Orden HAC/1177/2024) | "**29 Jul 2025 — already past**: Spain's obligation on *producers/marketers*"; "**1 Jan 2027 / 1 Jul 2027**: Spain, sociedades / everyone else (RD-ley 15/2025)" (#713 comment, 2026-09-10). #713 body (2026-04-01): "Corporate deadline: Jan 2027 (postponed twice — dates may shift again)". `ROADMAP.md:18`: "VeriFactu deadline Jan 2027". | Build it ourselves; the producer's *declaración responsable*; the submission client deferred (groundwork §6). Observed. |
| Basque Country (TicketBAI) | No date given. Addendum 2026-10-21: the merchant "can't use WCPOS for in-person sales here … on a certified app". | Unplanned. Needs *software garante* registration. Observed. |
| 🇩🇪 Germany (KassenSichV, TSE) | "TSE mandatory since 2020"; ELSTER "existing systems had to be reported by **31 July 2025**; new or decommissioned systems within **one month**" (groundwork note §1, 2026-09-11). | A certified cloud TSE (fiskaly, Swissbit, Deutsche Fiskal), "not a cryptography one". Observed. |
| 🇮🇹 Italy (RT) | "POS↔RT telematic pairing obligatory for operations from **1 Jan 2026**"; portal opened "**5 March 2026**", ~"**20 April 2026**" for existing terminals (groundwork note §1). | "a 'later, via partnership' market". Observed. |
| 🇵🇹 Portugal (AT, SAF-T, ATCUD) | ATCUD "since 1 Jan 2023", QR "since 1 Jan 2022", monthly SAF-T "by the 5th" (groundwork note §1). | Don't ship before AT certification, "a commercial decision". Observed. |
| 🇦🇹 Austria (RKSV) | "live since 1 April 2017"; Jahresbeleg "by 31 December", verified "by **15 February**" (groundwork note §1). | Integrate an approved trust provider (A-Trust, Globaltrust, PrimeSign); don't build a signer. Observed. |
| 🇭🇷 Croatia, 🇳🇴 Norway | No dates. Post-sale note (2026-11-20): Croatia is "the strictest regime found"; Norway has per-operator Z figures. | Not planned; analysed for editing rules only. Observed. |
| 🇨🇿 Czech EET 2.0 | "goes live on **1 January 2027** … full enforcement from **1 February 2027**", "pending final enactment" (wiki support page, last updated 2026-09-30). | "WCPOS does not support EET 2.0 yet". Observed. |
| Others in #713 (2026-04-01) | Saudi Arabia "Rolling out by revenue threshold through 2026"; Brazil "Mandatory Jan 2026"; UAE "Jan 2027 (large)"; Philippines "Dec 2026"; plus many more in its tables. | Landscape only; no approach chosen. Observed. |

---

## E. What touches voiding, reopening, editing, refunds, who may do them, and cashier identity

### Built behaviour
- **Reopen.** A reopen is a status change. "It moves no money: every captured payment keeps counting … The latest entry is marked `reopened_at_gmt`." Observed (wiki `cart-settlement-completion-proofs.md` §"Reopen is a status change").
  - Lines can't change on a sale with a standing completion unless the same push reopens it (`reopen_required`). Observed (`Order_Writer.php:758,780`).
  - A reopen or cancel is refused while money is in motion (`wcpos_money_in_motion`). Observed (wiki completion-proofs).
- **Re-completion.** A re-completed sale writes a new `sale` record that supersedes the previous one: `fiscal.supersedes` plus `fiscal.adjustment`, "even at the same total, because the regimes count documents, not differences". The closure `adjustments` counter is "not built". Observed (wiki `records-and-closures.md:57`).
- **Void.** A `void` record is written only for a captured ledger row ("a pending or authorized void reversed nothing"). Observed (wiki `records-and-closures.md:63`).
  - The cart's Void is a delete push that falls back to a cancel status (`app:packages/query/src/mutations/void-order.ts:19-25`). Observed (permissions-ground-truth).
  - Cancelling a completed register sale writes a `cancellation` record. Observed (wiki `records-and-closures.md:64`).
- **Refund.** A `refund` record and refund document are written for every refund of a register sale, wp-admin refunds included. Observed (wiki `records-and-closures.md:62`).
  - A refund binds to the session open when it is made, and one made after that session's closure is a `late_refund`. Observed (wiki `fiscal-groundwork.md` §8; roadmap#329).
  - Refund `date_created` stays at processing time; backdating contradicts art. 89 LIVA and #302. Observed (`docs/research/2026-10-16-negative-amounts-and-receiptless-returns.md` recommendation 4).
- **Who may today:**
  - Payment void and refund routes check `publish_shop_orders` only (`includes/API/V2/Payments_Controller.php:125`).
  - Reopen has no capability of its own.
  - The refund create route is Pro's, extending WooCommerce's controller; its permission check is Unverified in the source.

  Observed (sub-agent; `docs/research/2026-11-22-permissions-ground-truth.md` rows 437–440).
- **Cashier identity.**
  - `_pos_user_created` is write-once. `_pos_user` can be reassigned.
  - Only holders of `reassign_woocommerce_pos_sales` may name another user. Without the capability, the change is still silently ignored.
  - A change on a completed sale writes a `reattribution` record, which "carries no `register_id`, `session_id` or closure ids, so it never appears among a closure's corrections". The sale record and any closure are never modified.

  Observed (wiki `pos-order-audit-meta.md:88–90`; woocommerce-pos#2719). `_pos_user_name` does not exist in Free. Observed (sub-agent grep).

### Planned (v2.2.0, decided, not built)
- **New capabilities.** `void_woocommerce_pos_sales`, `refund_woocommerce_pos_sales`, `reopen_woocommerce_pos_sales` and `edit_woocommerce_pos_order_status`. Observed (`docs/specs/2026-11-22-cashier-permissions-v2.2.0-spec.md:39–43`).
- **Refusal rules.**
  - "**A paid sale is never refused for a permission**": it is saved and flagged "made without permission".
  - "**Refunds, voids, reopening and status changes are refused outright**".
  - A self-claim is allowed only on an open, unpaid sale (ruled 2026-11-23).

  Observed (spec §6).
- **Own-sales scope.** It covers writes. "Own" means `_pos_user_created` or `_pos_user`. Observed (spec §9).

### What the fiscal research says about these paths
- **The general rule.** "A changed fact must leave the original value and the fact of the change recognisable … Anything signed, chained or already reported cannot change at all; only a new record can supersede it." Observed (post-sale note §1, line 27).
- **Fields locked in every regime.** Till and sale time are "Never" changeable in every regime read. Payment method changes only through a correcting record. Observed (post-sale note §1 table).
- **Cashier or operator.**
  - France: the law "does not fix the cashier; the certification standard probably does" (NF525 operator code, SECONDARY).
  - Norway: no function may change registered information, with no pre-closure exception.
  - Croatia: the operator's OIB is sent to the authority.
  - In a Croatian or Portuguese build, "the cashier and store fields must be **read-only after issue**, with cancel-and-reissue as the correction path".

  Observed (post-sale note §2.1, §2.7, §2.8, §3 line 218).
- **Status edits.** "A status that cancels, refunds or hides a paid sale is a void: it needs G4, not an edit." Observed (post-sale note §3).
- **Store edits.** A store edit "must not trigger `calculate_totals()`". Observed (post-sale note §3). A test pins that a store change leaves totals untouched. Observed (wiki `pos-order-audit-meta.md:90`).
- **Tension.** The 2026-11-20 ruling allows cashier and store changes "on any order, at any time" (woocommerce-pos#2719). That conflicts with the post-sale note's read-only-after-issue reading for Croatia and Portugal, and with Norway's no-change rule, if those regimes are ever targeted. Inferred.
- **Cost recalculation.** WooCommerce re-costs lines on every reopen-and-edit and every refund ("Confirmed live on dev-free, 2026-11-22"). That reopen-and-edit recomputes totals on a paid sale is Inferred from it. That this is a money correction under the regimes is Inferred from the post-sale note §3. Observed (spec line 100).
