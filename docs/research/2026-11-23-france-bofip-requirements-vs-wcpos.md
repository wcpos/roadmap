# France: what BOFiP requires of a till, against what WCPOS records

**Research note, 2026-11-23.** Answers [roadmap#643](https://github.com/wcpos/roadmap/issues/643) on the map [#640](https://github.com/wcpos/roadmap/issues/640). It reads the French rule as a checklist, works from the BOFiP in force and the official attestation model (not NF525), and places each item as met, partly met or not met by WCPOS today. It builds on `docs/research/2026-09-11-fiscal-compliance-groundwork.md` (the "groundwork note") and `docs/research/2026-11-20-fiscal-rules-on-post-sale-edits.md` and does not repeat them. It proposes no design.

**Nothing here is legal advice.** §9 lists the questions that need a French tax professional.

Labels:
- **Observed**: I read the primary text or the code.
- **Inferred**: my reading of what I observed.
- **Unverified**: I could not confirm it from a primary source.

Code references are `repo@commit path:line`:
- **Free**: wcpos/woocommerce-pos, `origin/main` = `2022a8e6` (2022a8e64afa04b66b04b8b14024bf7e70b96a1a).
- **Pro**: wcpos/woocommerce-pos-pro, `origin/main` = `fd9f5f11`.
- **App**: wcpos/monorepo, `origin/main` = `21394295`.

Neither plugin's `next` branch carries fiscal code that `main` lacks (Observed: Free `next` has no commits beyond `main`; Pro `next` adds one dependency pin).

---

## 0. Bottom line

1. **The French rule is short and outcome-based, and WCPOS already has most of the dataset.**
   - BOFiP names the data to protect (§50) and four conditions (§80–§260). It mandates no technique: "Le législateur n'a pas défini de cahier des charges, ni de solution technique" (§60).
   - WCPOS writes a frozen, per-type-numbered record for every sale, refund, void, cancellation and late correction. It has register identity, sale-time provenance, numbered register closures and a perpetual total per register.
2. **Four things are missing outright:**
   - provable low-level integrity: no chain, no keyed fingerprint, no verifier;
   - an archive function;
   - monthly and annual closures;
   - a record of post-payment changes made outside the till.
3. **The law has moved since the BOFiP was last updated (25/03/2026):**
   - Loi n° 2026-534 du 25 juin 2026 requires archived data to be "restituées dans un format répondant aux normes établies par l'administration". It also adds payment terminals to the unannounced on-site check.
   - From 1 January 2027 the legislative base moves from art. 286 I 3° bis CGI to art. L. 216-48 CIBS, with the characteristics to be set by décret.
   - The new texts speak only of a "certificat". Whether the publisher's attestation survives that move is a question for a professional (§9).
4. **The GPL is the sharpest legal question.** BOFiP treats the user of freely modifiable open-source till software as its "éditeur" (§315, ex. 4). An assujetti cannot attest its own software unless it is genuinely in the business of publishing till software (§375). Whether WCPOS's attestation can cover a merchant who can edit the plugin depends on facts and a reading only a professional can give (§6, §9).

---

## 1. Which texts bind, as of 2026-11-23

| Text | What it does | Label |
|---|---|---|
| Art. 286 I 3° bis CGI | The obligation: a VAT-registered business that records customer payments in till software uses software meeting "conditions d'inaltérabilité, de sécurisation, de conservation et d'archivage". It is proved by a certificate or a publisher's attestation. Quoted through BOFiP §1 and §270, because Légifrance refused automated access. | Observed via BOFiP |
| **BOI-TVA-DECLA-30-10-30**, version in force from **25/03/2026** ("Version en vigueur du 25/03/2026 à aujourd'hui" on 2026-11-23) | The administration's reading. Every § number in this note refers to it unless another document is named. | Observed |
| **BOI-LETTRE-000242**, version of 25/03/2026 | The attestation model (§5). | Observed |
| BOI-CF-COM-20-60, version of 25/03/2026 | The unannounced on-site check under art. L. 80 O LPF (§4). | Observed |
| BOI-CF-INF-20-10-20, version of 25/03/2026, XVII–XVIII | Fines: €7,500 per till software without proof (§570); 15 % of turnover for supplying fraudulent software (§470). | Observed |
| Loi n° 2026-103 du 19 février 2026, art. 125 (via BOFiP ACTU-2026-00073) | Restores the publisher's attestation from 21 February 2026. | Observed via BOFiP |
| Loi relative à la lutte contre les fraudes sociales et fiscales: article "20 ter" of the CMP text adopted 5 May 2026 (AN T.A. 279) | Rewrites L. 80 O LPF. Adds to art. 286 I 3° bis: "Les données archivées … sont restituées dans un format répondant aux normes établies par l'administration". Creates art. 1770 quaterdecies CGI (€7,500 per payment terminal not shown). Adds "restitution" to L. 216-48 CIBS. | Observed (adopted text) |
| The same, promulgated as **loi n° 2026-534 du 25 juin 2026** | Conseil constitutionnel decision 2026-904 DC of 18 June 2026 struck down arts. 10, 12, 32 and part of 21, none of them about tills. The law's number, date and final article number (reported as art. 87) come from secondary sources. | Observed (decision); Unverified (final numbering) |
| Ordonnance n° 2025-1247 du 17 décembre 2025 (JORF 20/12/2025), as amended by ordonnance n° 2026-671 du 27 juillet 2026 | Recodifies VAT into the CIBS from **1 January 2027** (BOI-RES-TVA-000253, 07/10/2026). New art. L. 216-48 CIBS: "Un décret détermine les caractéristiques…". The abrogation of art. 286 CGI takes effect only when the regulatory provisions taking it over are in force (ord. art. 15, table). | Observed |
| The "normes établies par l'administration" for the restitution format | Searched for and **not found**. Until they exist, "format ouvert" plus a French notice (§230) is the only stated format. | Unverified |

**Who is in scope.**
- In: a VAT-registered business that sells to consumers and records their payments in software with a till function, including online software (§10, §30).
- Out: B2B-only sellers (§10); franchise-en-base and exempt-only businesses (§25).
- Out by tolerance: a business whose every payment passes through a bank or an EU bank in the information-exchange regime (§35, §37). Any other means of payment, cash included, ends the exemption.
- Multi-function software: only the till function must be secured (§40).
- Open-source and in-house software are in scope (§45).

---

## 2. The checklist, condition by condition

"WCPOS" means Free, with Pro where it adds something. For each row, the requirement is one sentence with its §, then the WCPOS position.

### 2.1 The protected dataset (§50) and what counts as a payment record

| # | Requirement | WCPOS today | Ref |
|---|---|---|---|
| D1 | **Scope of a record.** All data of a transaction that can lead to a justificatif (note, ticket, invoice) issued before, with or after payment, plus all data on the receipt "immédiate ou attendue" of the payment (§50). | **Partly.** A `sale` row is written when the sale completes (`wcpos_sale_completed`). Nothing is written for a justificatif printed before completion, for example a pre-bill or an unpaid order's receipt. Whether WCPOS lets a cashier print one is **Unverified**. | Free@2022a8e6 `includes/Payments/Contract/Completion_Stamp.php:160`; `includes/Services/Fiscal_Record_Writers.php:79` |
| D2 | **Line-by-line detail:** justificatif number; date to the minute; till number; total TTC; per line the label, quantity, unit price, line total HT and VAT rate; payment data, especially the mode of payment; traces of modifications and corrections (§50). | **Met (Inferred)** for a completed sale. The row stores `number`, `register_id`, `device_time`, `device_tz` and `received_at_gmt`. Its payload is the full receipt document: lines with `qty`, `unit_price_excl`, `line_total_excl` and `taxes`, plus payments and totals. **Corrections: see I2 and I3.** | `includes/Services/Fiscal_Record_Store.php:63-95`; `Fiscal_Record_Writers.php:590`; `includes/Services/Receipt_Data_Schema.php:440-650` |
| D3 | Data ensuring traceability and integrity, and data used to build the archive, are protected too (§50). | **Partly.** Each row carries a checksum (I4). There is no archive (A1). | `Fiscal_Record_Store.php:181,205-207` |
| D4 | Data from a simulated "école" or "test" module are protected data (§50). | **Not applicable today.** WCPOS has no training or test mode (S3). | — |
| D5 | Billing software with a till function need not record a till number (§50, remark). | Not relevant: WCPOS is a till. | — |

### 2.2 Inaltérabilité (§80–§120)

| # | Requirement | WCPOS today | Ref |
|---|---|---|---|
| I1 | Every §50 datum is unalterable (§80). | **Partly.** No code path updates or deletes a fiscal row, and the REST endpoint is read-only. The guarantee lives in PHP only: there are no database triggers, and any code or user with database access can change a row. | `Fiscal_Record_Store.php:14`; `includes/API/V2/Records_Controller.php:34-53` |
| I2 | **Corrections** (modifications or cancellations), whether made in the till or by an external device, are "plus" and "moins" operations, never direct edits. Each is itself recorded and unalterable (§90). | **Partly.** Refund, void, cancellation, late sale, late refund, late movement, recount and reattribution rows each point at the original through `corrects_record_id`. A reopened sale that completes again writes a new `sale` row with `supersedes` and `adjustment`. **Not recorded:** an edit to a completed order in wp-admin without reopening it, and trashing or deleting an order. Both are corrections "par un dispositif externe" in §90's terms (Inferred). | `Fiscal_Record_Store.php:22`; `Fiscal_Record_Writers.php:138-177,579-609,620-702,714-740`; `includes/Sync/Sync_Journal.php:290-291` |
| I3 | The administration can reach the original data and the **dated (year-month-day-hour-minute) detail** of every correction (§100, last two paragraphs). | **Partly.** Correction rows carry `received_at_gmt` and, where the till supplies it, `device_time`. The gap in I2 applies. | `Fiscal_Record_Store.php:80-82` |
| I4 | **High-level ("logique") inaltérabilité:** no function lets the user modify §50 data, **and** a technical means detects and shows that the user has not bypassed that (§100, first bullet). | **Partly.** The first half is met (I1). Nothing detects a bypass: no verifier re-checks checksums, and a plugin-file integrity check exists but does not cover data. | `includes/Services/File_Integrity.php:1-37` |
| I5 | **Low-level inaltérabilité:** proof that stored data have not changed since they were recorded, "empreinte numérique à clé privée, chaînage, etc." (§100, second bullet). | **Not met.** Each row has a SHA-256 of its own payload with no key and no link to the previous row, so whoever can change a row can recompute its checksum (Inferred). Closures carry no checksum; a closure is written by an UPDATE on the sessions row. No signing code exists. | `Fiscal_Record_Store.php:205-207`; `includes/Services/Closure_Store.php:904` |
| I6 | Integrity over time by a reliable process that prevents modification, detects and traces any access or modification, shows non-modification, and "fournir un système de preuve" (§120). | **Not met.** There is no verifier and no proof export. `Closure_Store::health()` reports closure number gaps, conflicts and total mismatches, but does not prove integrity. | `Closure_Store.php:1092-1140` |

### 2.3 Sécurisation (§130–§150)

| # | Requirement | WCPOS today | Ref |
|---|---|---|---|
| S1 | Secure the §50 data, the modification data and **the data that produce the justificatifs issued**; prevent deletion or modification without trace (§130). | **Partly.** The frozen payload reproduces the receipt as issued. Two exceptions (Inferred): translated labels are stripped before storage and re-applied from current translations when the receipt is shown again, and an order can be deleted without trace (I2). | `Fiscal_Record_Store.php:169-174` |
| S2 | Sécurisation is not about access rights. It ensures that **every person's** recorded payments, and every change to them, are kept (§130). Any reliable process qualifies, "notamment … chaînage des enregistrements ou de signature électronique" (§140). | **Partly.** Every completed sale is recorded whoever rang it (`cashier_id`). The reliable-process half is I5. | `Fiscal_Record_Store.php:78` |
| S3 | **Training/test function:** if one is used, its payment data, its justificatifs (watermarked "factice" or "simulation") and every operation recorded in it are clearly identified, along with **the operator under whose responsibility trainees record** (§150). | **Not met; no such function exists.** Grep for `training`, `demo_mode`, `test_mode` and `sandbox` across Free, Pro and App found nothing. BOFiP words this as a condition on a function that is used. The map's binding correction (Paul, 2026-09-10) treats training mode as a real French obligation. | — |

### 2.4 Conservation (§155–§200)

| # | Requirement | WCPOS today | Ref |
|---|---|---|---|
| C1 | The till software itself keeps the §50 data. A purge is allowed only through the archive function to external storage (§155). | **Partly.** Rows are kept indefinitely; no purge exists. But a **full-wipe uninstall** (constant `WCPOS_REMOVE_ALL_DATA` or option `wcpos_remove_all_data`) drops `wcpos_fiscal_records` and `wcpos_register_sessions`, the table holding the closures, without archiving them. A default uninstall keeps both. Pro's uninstall can trigger Free's. | Free@2022a8e6 `uninstall-functions.php:31-49,89-94,446-448,519-529`; Pro@fd9f5f11 `uninstall.php:279-281` |
| C2 | Proofs of inaltérabilité and traceability are kept for **six years** (art. L. 102 B LPF) and need no paper copy (§155). | **Not met**, since no proofs exist (I5). No retention rule. | — |
| C3 | **Mandatory daily, monthly and annual (or fiscal-year) closures.** "Ces trois échéances sont cumulatives et impératives." Each computes and stores cumulative figures, "intègres et inaltérables", such as the period grand total and the perpetual total (§170). | **Partly.** Closures are per register **session**, numbered per register, unique on `(register_id, number)`, carrying a `business_day`. **No monthly or annual closure exists**: date-range reports are computed on demand and not stored or numbered. Nothing found forces a daily close: a session can span days (Inferred from grep). The closure is not covered by any checksum (I5). | `includes/Services/Register_Session_Store.php:38,55-65`; `Closure_Store.php:760-800`; `includes/Services/Receipt_Data_Builder.php:293,309-312` |
| C4 | "**Cumul du grand total de la période**" means turnover since the start of the current accounting period. "**Total perpétuel**" means turnover since the software was first used, never reset (§170). | **Partly.** Per register, `perpetual_{sales,refunds}_total` = previous closure's perpetual + this period + carried corrections, derived on the server. The period total is per **session**, not per accounting period. There is no grand total for the month, year or fiscal year. | `Closure_Store.php:775`; App@21394295 `packages/query/src/register-session/session-store.ts:619-620` |
| C5 | Counters restart only on a **change of hardware or software**, and the old counters are archived and secured. On a **version change** they keep running (§170). | **Partly (Inferred).** Counters survive plugin updates because they live on session rows. A new register UUID starts at zero. Dropping or recreating the sessions table also restarts them, which a code comment acknowledges. Old counters are not archived (A1). | `includes/Activator.php:528-530` |
| C6 | Closure totals stay in the software, protected, and **are never purged** (§170, §260). | **Partly.** Never purged in normal use, but see the uninstall path in C1. | as C1 |
| C7 | Keep the line-by-line data **and** the cumulative figures. Keeping only Z-reports is non-compliant (§180). | **Met** for completed sales (D2). The gaps in I2 apply. | — |
| C8 | A centralised system fed by points of sale may hold the line data and the cumulative data centrally (§190). | **Met by architecture (Inferred).** Records and closures are on the WordPress server, not the device. | — |

### 2.5 Archivage (§220–§260)

| # | Requirement | WCPOS today | Ref |
|---|---|---|---|
| A1 | Archive at a chosen interval of **at most a year or a fiscal year**. Archiving "a pour objet de figer les données et de donner date certaine". It needs a technical device guaranteeing the archive's integrity over time and its conformity with the source data. A backup is not an archive (§220). | **Not met.** There is no archive function. What exists: a closure CSV export with no period filter and no integrity column, and paginated JSON of fiscal records over REST. | `includes/API/V2/Closures_Controller.php:256-285`; `includes/Services/Closure_Csv.php:99-109`; `Records_Controller.php` |
| A2 | Archives must be easy for the administration to read, even after a change of software. **Open format; a French-language explanatory notice joins the archive.** Encryption is allowed if the administration can read without constraint, e.g. with a key from the publisher (§230). Since loi 2026-534, archived data are also "restituées dans un format répondant aux normes établies par l'administration"; no such norms were found. | **Not met.** | — |
| A3 | Reliable **traceability of archive generation**; the traceability data of purge and archiving are kept (§240). | **Not met.** There is no append-only event log. Logs written through the WooCommerce logger can be rotated or deleted. | `includes/Logger.php:232-235` |
| A4 | A purge beyond the archive interval is optional. Before any purge, a complete archive of the §50 data goes to secured external media or remote storage, or to a third-party archiver. **"Les éditeurs doivent prévoir obligatoirement une fonction permettant de générer des fichiers d'archive"**; the user keeps archives six years (§250). | **Not met** (A1). No purge exists, except the uninstall wipe (C1). | — |
| A5 | A purge is only ever partial: the period grand total and perpetual total of the purged period stay online in the software (§260). | Not applicable until a purge exists. | — |

### 2.6 What BOFiP does not require

I searched the whole BOFiP text for each item below and found none of them (Observed). They are NF525 or vendor conventions, or other regimes' rules:
- **Reprints and duplicates.** BOFiP has no duplicate-marking or reprint-traceability rule. WCPOS keeps a per-order print counter that marks a copy as a reprint, with no per-event history (`includes/Services/Receipt_Print_Counter.php:69-71,100,113`). The fiscal table's `print_count` column is never updated. Closures keep a print count and write a WooCommerce log line (`Closure_Store.php:1063,1081-1086`).
- **An event journal** (sign-in, sign-out, settings, exports, errors) with event codes. BOFiP asks for the trace of modifications and corrections (§90, §100, §130) and the traceability of archiving and purge (§240), nothing broader. WCPOS has no event log. Order notes and a per-payment event list capped at 100 entries are not append-only (`includes/Services/Order_Notes.php:69-135`; `includes/Payments/Contract/Ledger.php:42-46`).
- **Anything on the customer ticket:** signature excerpt, hash, QR, certificate number, software name or version. WCPOS's `fiscal.hash`, `qr_payload`, `signature_excerpt` and `signed_at` are empty on sales (`Receipt_Data_Builder.php:915-922`); only refunds fill `fiscal.hash` (`:1198-1208`).
- **An operator field** in the dataset. The only operator BOFiP names is the training supervisor (§150). WCPOS records `cashier_id` and `approver_id` anyway (`Fiscal_Record_Store.php:78-79`).
- **Gap-free numbering.** BOFiP asks for "le numéro du justificatif" and nothing more. WCPOS numbers per type across the whole site; a failed insert can burn a number (`Fiscal_Record_Store.php:158-189`). A gap does not breach a stated rule, but it weakens the "système de preuve" of §120 (Inferred).
- **A per-tax-rate or per-payment-method total on a closure.** §170 says "comme le cumul du grand total…", an illustrative list. WCPOS stores both breakdowns as the app computes them, not derived on the server (App `session-store.ts:520-640`; Free `Closures_Controller.php:305`).
- **Signature algorithms, key lengths, archive schemas ("JCD"), the 3/7/13/19 excerpt.** None appear.

### 2.7 Multiple registers and multiple stores

| # | Requirement | WCPOS today | Ref |
|---|---|---|---|
| M1 | The till number is part of each record (§50). | **Met.** `register_id` is on every row. Free has one register (option `wcpos_register`); Pro keeps a `_wcpos_register_<uuid>` meta per store. | `Fiscal_Record_Store.php:75`; `includes/Services/Option_Register_Repository.php:12-20`; Pro@fd9f5f11 `includes/Services/Meta_Register_Repository.php:16-24` |
| M2 | Numbering scope. **BOFiP sets none** (Observed). | Sale numbers are **per type, site-wide**; the `series` column is always empty. Closures are numbered per register; the device proposes the number and the server accepts jumps of up to 10,000. | `Fiscal_Record_Store.php:157-164`; `Closure_Store.php:28,723-759`; App `packages/query/src/register-session/register-document.ts:540` |
| M3 | Closures and totals are per till or centralised (§170, §190). The text does not say whether a multi-till shop needs a shop-level total (Observed silence). | Per-register perpetual total only; no store-wide total. | `Closure_Store.php:775` |
| M4 | **One certificate or attestation per distinct software product**, or one for all points of sale of a legal entity whose systems are "absolument identiques en tout point" (§280). The fine is per software, not per till (BOI-CF-INF-20-10-20 §570). | Not a build item. It matters for Free versus Free+Pro, and for sites with different plugin sets (§6). | — |
| M5 | Offline sales: BOFiP is silent on offline capture. | WCPOS records the device's own sale time, timezone and a per-device counter, written once and validated (App `register-document.ts:388-399`; Free `includes/Services/Pos_Order_Audit.php:279-312`). Clock skew and counter gaps are reported, not corrected (`includes/Services/Provenance_Health.php:145-172`). | — |

---

## 3. What the tax inspector does, and in what form

**Unannounced on-site check, art. L. 80 O LPF** (BOI-CF-COM-20-60, 25/03/2026; Observed):
- Agents of at least controller grade arrive unannounced, between 08:00 and 20:00 or during business hours, and hand over an avis d'intervention (§60–§70).
- They ask for the certificate or attestation **for each till software held** (§80). They check that:
  - there is one **for each version used**;
  - the business can show "immédiatement ou par un accès rapide via une fonctionnalité du logiciel ou système, l'identification de la version … notamment son numéro de licence";
  - the document carries every statement in the model;
  - it matches the versions held (§90).
- The check "est limitée à ces seules constatations matérielles"; the agents do not examine the accounts (§100).
- It ends in a procès-verbal (§110–§120). A failure costs **€7,500 per software** (BOI-CF-INF-20-10-20 §570), waived if the document arrives within 30 days (§180). If the fine is applied, the business has 60 days to comply and can be fined again after that (§190).
- **New since June 2026:** the rewritten L. 80 O lets agents ask to be shown every payment terminal, "que ces terminaux soient reliés ou non à une caisse enregistreuse", and record their references and the bank accounts paid into. Each terminal not shown costs €7,500 (new art. 1770 quaterdecies CGI; AN T.A. 279, art. 20 ter; Observed in the adopted text).

WCPOS: version identity sits on each sale payload (`software.plugin_version`, `app_version`, `app_build`; `Receipt_Data_Builder.php:892-898`), on each POS order (`_woocommerce_pos_version`; `includes/API/V2/Writers/Order_Writer.php:873`) and on closures (`Closures_Controller.php:294-304`). Whether the app shows version and licence on a screen a cashier can reach quickly was **not checked**. WCPOS issues no licence number in the attestation's sense; whether a Pro licence key counts is **Unverified**.

**Accounting audit** (vérification de comptabilité): the software must give the administration access to all recorded data (§60), and archives must be readable in an open format with a French notice (§230). Anything the administration later shows to be fraudulent use carries consequences (BOI-CF-COM-20-60 §140; BOI-CF-INF-20-10-20 §470, §490):
- **for the user:** the tax evaded plus an 80 % penalty (art. 1729 c CGI);
- **for the publisher:** a fine of 15 % of its turnover from the software version concerned, plus joint liability for the user's tax (art. 1770 undecies CGI).

BOFiP's own examples of fraudulent use (§450) include changing the split between payment methods to take out cash, and editing a sale to reduce the number of items.

---

## 4. Penalties at a glance (Observed)

| Who | What | Amount | Source |
|---|---|---|---|
| Merchant | No certificate or attestation on request, or refusing the check | €7,500 per software | BOI-CF-INF-20-10-20 §560–§570 |
| Merchant | Payment terminal not shown | €7,500 per device | art. 1770 quaterdecies CGI (AN T.A. 279) |
| Merchant | Tax evaded through fraudulent use | Tax plus 80 % | BOI-CF-COM-20-60 §140 |
| Publisher, distributor, anyone who intervened | Software used fraudulently | 15 % of turnover from it, plus joint liability for the tax | BOI-CF-INF-20-10-20 §470, §490 |
| Publisher or merchant | False attestation, or using one knowingly | 3 years' prison, €45,000 | BOFiP §400; BOI-LETTRE-000242 |

---

## 5. The attestation

- **Who signs.** The "éditeur", meaning "la personne qui détient le code source … et qui a la maîtrise de la modification des paramètres" (§300). It must be a company's legal representative (§370). A foreign publisher may attest in French, or in another language with a certified French translation (§365).
- **Per merchant.** "L'attestation doit être individuelle, c'est-à-dire délivrée nominativement à l'assujetti" (§370). A clause in the terms of sale does not count, even if accepted (§370). Delivery may be digital, downloaded and completed by the merchant with their identity (§390). The pre-filled, pre-signed tolerance is written for a **physical purchase**: "remis lors de l'achat physique du logiciel" (§370). Whether a pre-signed PDF for a download fits that tolerance is **Unverified** (§9).
- **Two parts** (BOI-LETTRE-000242): it "n'a de valeur que si son volet 2 est dûment complété et signé par l'entreprise utilisatrice".
  - **Volet 1, the publisher:** "Je soussigné … représentant légal de la société …, éditeur du logiciel / système de caisse …, atteste que ce logiciel/système OU les fonctionnalités de caisse de ce logiciel/système, mis sur le marché à compter du DATE, dans sa version n° …, sous le numéro de licence (quand il existe), satisfait … aux conditions d'inaltérabilité, de sécurisation, de conservation et d'archivage …". It then lists the functions covered and those not covered.
  - **Volet 2, the merchant:** where and when they acquired or downloaded the software, and the date from which they use it to record consumer payments.
- **Per version.** The merchant must hold an attestation "correspondant à la version … qu'il utilise" (§290). It must name the software, its references and version, any licence number, and the date the merchant acquired it (§375).
- **Major versus minor.** A **major** version is any new version in which "un ou plusieurs paramètres impactant le respect des conditions" changed. A **minor** version changes none of them (§340). This is not semantic versioning: a patch release that touches the fiscal code is major in BOFiP's sense (Inferred). One attestation can cover later minor versions only if it names the root of the last major version and the sub-numbers to be used for minors, **and** the publisher undertakes to use those sub-numbers only for minors (§380). The model's optional bracketed clause carries that undertaking. Every new major version needs a new attestation naming it (§380).
- **What it commits the publisher to.** "Une attestation délivrée par un éditeur engage sa responsabilité sous réserve que les dispositifs techniques garantissant inaltérabilité, sécurisation, conservation et archivage ne sont pas modifiés par un tiers" (§300). Beyond that sentence:
  - a false or wrongly issued attestation exposes the publisher to the 15 % fine and joint liability once fraudulent use is shown (BOI-CF-COM-20-60 §140);
  - it also exposes the publisher to penal sanctions (§150 of the same; BOFiP §400).
- **The other proof.** A certificate from an accredited body (§320–§340) covers the version held, or the major version subject to regular audit.

---

## 6. Open source: when the user is the publisher

What BOFiP says (Observed):
- **§45.** "Les logiciels … dits « libres » ou développés en interne sont également concernés." A user's changes to free software "ne doivent avoir ni pour objet ni pour effet d'altérer" the four conditions.
- **§310.** For software "conçu de manière ouverte" to be adapted to customers' needs, the éditeur is either:
  - the original designer, **when none of the parameters that secure compliance can be changed by anyone other than that designer**; or
  - the last person who configured it, if that intervention changed one of those parameters.
- **§315.** Anyone who changes the software "par modification du code source, patch logiciel, paramétrage ou autre" so far that the protective functions change **invalidates the certificate or attestation** and becomes subject to the obligation for the new version.
  - Example 4, free software maintained by a community and also modified in-house: "L'entreprise utilisatrice est donc considérée comme « l'éditeur » soumis à obligation de certification de la version actuellement en service."
  - Tolerance: each building block may be certified or attested separately. The integrator then also needs a services certification from a COFRAC-accredited body.
- **§375.** The publisher cannot be the business named on the attestation unless that business's declared activity is publishing till software, and the activity must be real. Otherwise a business that develops its own software must hold a **certificate**.

What that means for a GPL WordPress plugin (Inferred; needs a professional, §9):
- A merchant can edit WCPOS's PHP, install other plugins that write to its tables, or use the filters that run before a record is frozen (`wcpos_receipt_data`, `wcpos_fiscal_snapshot_enrich`; `Receipt_Data_Builder.php:1002`, `Fiscal_Record_Writers.php:822-834`). §310's first branch ("aucun des paramètres … ne peut être modifié par d'autres intervenants") is therefore hard to claim literally.
- §300 and §315 point the other way: the publisher's attestation holds "sous réserve" that no third party modifies the protective devices. A merchant who does modify them invalidates the attestation and becomes the éditeur of the new version. Under §375 that merchant can then only prove compliance with a **certificate**, not their own attestation.
- The text gives no rule for a merchant who installs WCPOS **unmodified** on an open platform. The practical difference between "can modify" and "did modify" is detection: §100's "solution technique permettant de détecter et démontrer que l'utilisateur n'a pas contourné". WCPOS's plugin-file integrity check (`File_Integrity.php`) covers files, not data or hooks.
- WooCommerce stores the orders, and any shop manager can edit them in wp-admin. BOFiP's multi-function rule (§40) secures "la seule fonctionnalité de caisse", which supports treating the frozen fiscal records, not the WooCommerce order, as the protected data. Whether an inspector accepts that split is untested.

---

## 7. Gap list, ordered by how much building each needs (largest first)

| Rank | Gap | BOFiP | Size |
|---|---|---|---|
| 1 | **Provable low-level integrity:** a chain or keyed fingerprint over fiscal records **and** closures, and a verifier that detects and demonstrates non-modification and bypass. Today it is an unkeyed per-row SHA-256; closures have none. | §100, §120, §140 | Large |
| 2 | **Archive function:** a periodic archive (at most annual) that freezes data with a date certaine; open format with a French notice; an integrity proof over the archive; traceability of every archive and purge; export to external or remote storage. The administration's restitution format, when published, will also bind. | §220–§250; loi 2026-534 | Large |
| 3 | **Monthly and annual (or fiscal-year) closures**, stored and unalterable, each with the accounting-period grand total and the perpetual total, plus some guarantee of a daily closure, which today is per session and not forced. | §170 | Medium–large |
| 4 | **Corrections outside the till:** wp-admin edits to a completed order without a reopen, and order trash or delete, leave no plus/minus record and no dated trace. | §90, §100, §130 | Medium |
| 5 | **Training or test mode marked per §150**, if WCPOS offers one: segregated, watermarked "factice"/"simulation", supervising operator identified, data inside the protected set. Nothing exists today. | §50, §150 | Medium (only if built) |
| 6 | **Never purge closure totals or records without an archive:** the full-wipe uninstall drops fiscal records and closures. | §155, §170, §250 | Small |
| 7 | **Closure figures derived on the server and covered by integrity:** per-method and per-rate breakdowns are stored as the app sent them; closure numbers are proposed by the device. | §170 ("intègres et inaltérables") | Small–medium |
| 8 | **Perpetual-total continuity:** recreating the sessions table restarts counters; old counters are not archived when a register is replaced. | §170 | Small |
| 9 | **Version and licence identification reachable quickly** for an inspector. Not checked whether the app already shows it. | BOI-CF-COM-20-60 §90 | Small |
| 10 | **The attestation document itself:** volet 1 wording with the scope of functions covered, a version-root scheme for §380, and per-merchant delivery with volet 2. A drafting and business task more than code. | §370–§390; BOI-LETTRE-000242 | Small build; legal decision |

Not gaps under BOFiP, whatever NF525 does: a signature excerpt or QR on the ticket, duplicate marking, an event journal beyond corrections and archiving, an operator field, gap-free per-register sale numbering, any named algorithm (§2.6).

---

## 8. Five facts likely to surprise someone who assumed NF525

1. **The open-source user can become the publisher** (§315 ex. 4). A merchant who is not in the till-software business cannot attest their own modified copy and needs an accredited certificate (§375).
2. **"Version majeure" is not semver.** Any release that changes a parameter affecting the four conditions is major and needs a new attestation (§340, §380). Minor-version cover needs a declared version root and a written undertaking.
3. **The attestation is per merchant and per version, in two signed parts.** A licence clause or a terms-of-sale statement is worth nothing (§370), and the document is invalid without the merchant's volet 2 (BOI-LETTRE-000242).
4. **Nothing is required on the ticket**, no signature excerpt, QR, certificate number or version. Duplicates and a general event journal are not mentioned either. What BOFiP does prescribe is closures (daily, monthly **and** annual), a perpetual total that never resets, and an archive in an open format with a French notice (§170, §230).
5. **The legal ground moved in 2026 and keeps moving.**
   - Loi 2026-534 adds a restitution format to be set by the administration, not yet published, and on-site checks of payment terminals.
   - From 1 January 2027 the obligation's legislative home is art. L. 216-48 CIBS, with the characteristics to come by décret.
   - The new L. 80 O, 1770 duodecies and L. 216-48 wording speaks only of a "certificat", although the February 2026 finance law restored the attestation.

---

## 9. Needs a French tax professional's answer

1. Does the publisher's attestation, restored in art. 286 I 3° bis CGI by LF 2026 art. 125, survive the move to art. L. 216-48 CIBS on 1 January 2027? The rewritten L. 80 O and 1770 duodecies mention only a "certificat". BOI-RES-TVA-000253 section 2.7 says changes made only to the CGI before 1 January 2027 stay applicable; whether that covers this case is the question.
2. Under §310 and §315, can WCPOS attest for merchants running it on WordPress, where the merchant can technically edit code and data? Or does every merchant become the éditeur, needing a certificate (§375)? What do detection and "unmodified" have to prove?
3. Is a pre-signed attestation for a **download** acceptable, given that the §370 tolerance speaks of a physical purchase, or must each be issued nominatively?
4. Does a till whose fiscal records live in WCPOS tables, while WooCommerce orders stay editable in wp-admin, meet §40's "seule la fonctionnalité de caisse" reading?
5. Have the "normes établies par l'administration" for the restitution format been published, and from when do they bind?
6. Are Free and Free+Pro one product or two for §280 and the per-software fine?

---

## 10. Sources

All accessed 2026-11-23.

Primary, read:
- BOI-TVA-DECLA-30-10-30, version in force from 25/03/2026: https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20260325
- BOI-LETTRE-000242, 25/03/2026 (attestation model): https://bofip.impots.gouv.fr/bofip/10692-PGP.html/identifiant=BOI-LETTRE-000242-20260325
- BOI-CF-COM-20-60, 25/03/2026 (L. 80 O check): https://bofip.impots.gouv.fr/bofip/11316-PGP.html/identifiant=BOI-CF-COM-20-60-20260325
- BOI-CF-INF-20-10-20, 25/03/2026, XVII–XVIII (fines): https://bofip.impots.gouv.fr/bofip/7234-PGP.html/identifiant=BOI-CF-INF-20-10-20-20260325
- BOFiP ACTU-2026-00073, 25/03/2026 (attestation restored by loi n° 2026-103, art. 125): https://bofip.impots.gouv.fr/bofip/15035-PGP.html/ACTU-2026-00073
- Assemblée nationale, T.A. n° 279, 5 May 2026, CMP text of the anti-fraud bill, art. 20 ter: https://www.assemblee-nationale.fr/dyn/opendata/PRJLANR5L17BTA0279.html
- Assemblée nationale, amendment n° 4 (Rect) on art. 20 ter, 5 May 2026, adopted: https://www.assemblee-nationale.fr/dyn/17/amendements/2701/AN/4.pdf
- Conseil constitutionnel, décision n° 2026-904 DC du 18 juin 2026: https://www.conseil-constitutionnel.fr/decision/2026/2026904DC.htm
- Ordonnance n° 2025-1247 du 17 décembre 2025, JORF 20/12/2025, texte 19 (a JORF print copy hosted by AIDA/INERIS; Légifrance refused automated access): https://aida.ineris.fr/sites/default/files/2026-04/ordonnance%20n%C2%B0%202025-1247%20du%2017%20d%C3%A9cembre%202025%20portant%20recodification%20de%20la%20taxe%20sur%20la%20valeur%20ajout%C3%A9e%20et%20diverses%20modifications%20du%20code%20des%20impositions%20sur%20les%20biens%20et%20services_0.pdf
- BOI-RES-TVA-000253, 07/10/2026 (VAT recodification moved to 1 January 2027; continuity of doctrine): https://bofip.impots.gouv.fr/bofip/14901-PGP.html/identifiant=BOI-RES-TVA-000253-20261007

Secondary, labelled:
- CMS Francis Lefebvre, "Logiciels/systèmes de caisse : une nouvelle adaptation des moyens de lutte contre la fraude", 2 October 2026 (law number 2026-534, art. 87, payment-terminal check): https://cms.law/en/fra/legal-updates/logiciels-systemes-de-caisse-une-nouvelle-adaptation-des-moyens-de-lutte-contre-la-fraude
- vie-publique.fr, loi du 25 juin 2026 relative à la lutte contre les fraudes sociales et fiscales (search excerpt only; the page did not load): https://www.vie-publique.fr/loi/300456-lutte-contre-les-fraudes-sociales-et-fiscales-loi-du-25-juin-2026

Not read: Légifrance consolidated text of art. 286 CGI, art. 1770 duodecies and quaterdecies CGI, art. L. 80 O and L. 102 B LPF (HTTP 403 to automated clients); the NF525 référentiel (paid, and not the binding text).

Code: Free@2022a8e6, Pro@fd9f5f11, App@21394295, read with `git grep` and `git show` against `origin/main`. Files named in the tables above.
