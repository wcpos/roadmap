# The kinds of fiscal regime least like France and Spain, and whether the ruled core bends or breaks

**Research note, 2026-11-23, for [roadmap#661](https://github.com/wcpos/roadmap/issues/661) on the map [roadmap#640](https://github.com/wcpos/roadmap/issues/640).** It sorts the world's till-fiscalisation regimes into kinds by what they demand of the software, then tests each block of the core this map has ruled against each kind. It does not propose adding a country to v2.1.0 and does not design the seams. Nothing here is legal advice.

It builds on, and does not repeat, `docs/research/2026-09-11-fiscal-compliance-groundwork.md`, `docs/research/2026-11-20-fiscal-rules-on-post-sale-edits.md` and the dates note on branch `research/fiscal-obligations-and-dates` (`docs/research/2026-11-23-fiscal-obligations-and-dates.md`, called "the dates note" below).

Labels:
- **[P]** a tax-authority, ministry, gazette or official technical-specification source. **[P, host]** official text read on a non-official host.
- **[S]** a secondary source: a fiscalisation-middleware vendor, adviser, trade press or newsletter.
- **[snippet]** the page was seen only as a search result, not opened.
- Conclusions are marked **Observed** (stated in a source read), **Inferred** (my reading) or **Unverified** (not confirmed).
- Source IDs in brackets, such as [AT-2], resolve in §10, which gives each URL and its date.

---

## 1. Bottom line

- **Inferred.** Eight kinds of regime exist beside France's and Spain's, and they differ from them on four axes only: who makes the record tamper-evident (the till, a device, a service, the authority), who owns the legal number, whether the sale may complete before something outside the till answers, and how long a till may be out of contact. Everything else they demand (closures, logs, archives, receipt fields, correcting records) is a variation the ruled core already has a place for.
- **Observed.** Per-till identity is the most common shape everywhere. Austria gives each till a register ID, Belgium a terminal ID, Sweden per-till counters, Poland a per-device kasa, Saudi Arabia a per-device certificate, Croatia and Slovenia a premises-and-device number, Portugal a series per terminal. The ruling that each till chains and numbers its own records ([#648](https://github.com/wcpos/roadmap/issues/648), [#649](https://github.com/wcpos/roadmap/issues/649)) is the most widely compatible choice the map could have made.
- **Observed.** Three rulings break against most kinds: **no offline limit** (almost every other kind sets one, from none at all to 5 days), **the store holds the merchant's certificate and hands it to tills** (most signing kinds forbid a copied or exportable key), and **the store makes every closure by itself** (most device and signing kinds want per-till closures inside the till's own chain). None of the three is wrong for France or Spain. Each becomes hard to undo only if it is built as an engine invariant rather than as a per-mode setting.
- **Inferred.** Six seams would let the core serve every kind later (§6). Most of what they need is cheap now, because it is only shapes in the record and the engine's interfaces. Two parts are costly to add after France and Spain ship, because they run through the paid-sale path: **completion can wait on an external answer** and **the protector sees the transaction from its start** (§7).
- **Inferred.** One principle meets a hard limit: Portugal and Norway require a signing key known only to the software producer. A GPL codebase cannot keep one, so serving either would need a producer-run signing service, which cuts across the line in [#653](https://github.com/wcpos/roadmap/issues/653) that WCPOS holds no merchant's fiscal data.

---

## 2. The ruled core under test

Taken from the resolution comments of the closed tickets. Where #656 has a later comment replacing an earlier one, the later one is used.

| # | Core block | Ruled in |
|---|---|---|
| C1 | **Each till chains its own records** at sale completion, offline included. France: plain SHA-256 chain, no key, anchored in closures and archives. Spain: AEAT's hash, plus the merchant's signature in the non-reporting mode. One chain per till per taxpayer. A wiped till starts a new chain. Upgrades never re-hash. | #648, #647 |
| C2 | **Each till owns a gapless series** under a short code the store gives it (`T07-000123`), with a separate refund and correction series. The store has its own series. The order number stays; the fiscal number is the legal one. A number is consumed only when the record is chained. A wiped till gets a new code. | #649 |
| C3 | **The store keeps and verifies** every record, refuses a record whose link does not match, walks every chain in a health check, and holds everything durable. A till is never the only copy for longer than it is offline. | #648, #656 |
| C4 | **No offline limit.** Every fiscal till, browser tills included, sells offline as today and shows its unsent count. | #656 (later comment) |
| C5 | **Cancel-and-reissue.** An issued record never changes. Refund, void, reopen-and-edit and late customer details are new chained records. Deleting an order with a fiscal record is refused. | #650 |
| C6 | **Automatic closures by the store.** Daily, monthly and annual, per store, each carrying every till's chain head and the running total. A day waits for offline tills, then closes without them. The cash count stays the cashier's; a register open across midnight blocks nothing. | #651 |
| C7 | **One chained event log** on the store; tills chain their own events with their sales. | #654 |
| C8 | **The archive.** The store seals one documented file per year and on demand; the merchant downloads it. Nothing is purged. WCPOS holds no merchant's fiscal data. | #653 |
| C9 | **The locked receipt block.** One fiscal template element per country that a template may move but not remove, the same on paper, email and digital. | #655 |
| C10 | **The store holds the certificate.** It is uploaded once, kept encrypted, handed to a till at sign-in, kept in device secure storage (apps) or as a non-exportable key (browsers). | #656 |
| C11 | **Engine core, country modes in Pro**, set per store, with a setup check; switching off is a recorded event that closes the chain. | #656 |

---

## 3. The kinds

Sorted by what the regime demands of the software, not by geography. K1 is the baseline France and Spain belong to.

| Kind | What it demands of the software, in one line | Examples |
|---|---|---|
| **K1 Self-declared chained records** | The software chains or signs its own records; the producer declares or attests conformity; nothing outside the till is consulted at sale time. | France, Spain (both modes) |
| **K2 Certified signing device or service** | A certified device or service outside the till signs each transaction (and in Germany numbers it); the till must reach it during the sale. | Germany TSE, Austria RKSV, Belgium FDM, Sweden control unit or control system |
| **K3 Real-time reporting with an authority-returned ID** | The till signs a security code with a certificate, sends each receipt, and prints the identifier the authority returns; offline grace of 48 hours to 5 days; premises or devices registered in advance. | Croatia, Slovenia, Montenegro, Albania, Slovakia eKasa, Czechia EET 2.0 (light variant), Quebec WEB-SRM; Greece myDATA is a ledger variant |
| **K4 The authority's control unit signs and counts** | An authority-issued secure element or virtual control unit signs and numbers each receipt; the till is a certified client and cannot issue without it. | Serbia (ESIR/PFR), Kenya eTIMS, Rwanda EBM, Tanzania VFD |
| **K5 Fiscal hardware owns numbering and memory** | A sealed, type-approved fiscal printer or module holds the counters, the memory and the daily Z; it usually prints the fiscal document itself. | Italy RT, Bulgaria, Turkey, Romania, Hungary (hardware registers), Russia, Argentina controlador fiscal, Panama |
| **K6 Certified device-bound software with an online repository** | The software route of K5: certified software bound to one device, a key that cannot leave a secure area, a mandatory online repository, and a short connectivity leash. | Italy's software route (2025), Poland software kasa, Hungary cloud register, Lithuania i.EKA [S] |
| **K7 Certified software with a producer key and an audit file** | The software itself is certified or declared, signs each document with an RSA key (the producer's in two of three), chains per series or till, and exports SAF-T. | Portugal, Norway, Denmark |
| **K8 Clearance e-invoicing applied to receipts** | The authority or an accredited provider authorises, numbers or stamps the document. Four sub-kinds: 8a cleared per document; 8b authority-allocated number ranges; 8c device-stamped and reported within 24 h; 8d periodic consolidation of B2C sales. | 8a Brazil NFC-e, Mexico CFDI, Colombia, Argentina CAE; 8b Chile CAF, Argentina CAEA; 8c Saudi Arabia ZATCA, Egypt; 8d Mexico factura global, Peru resumen diario, Malaysia |
| **K9 No till rule, but an anti-suppression law** | No certification or reporting; making, supplying or possessing software that deletes or re-sequences sales is an offence. | UK, Australia, Canada (federal), US states, New Zealand, Ireland; the Netherlands has a voluntary quality mark |

**Kinds the ticket's list missed** (Inferred):
- **K4** is distinct from K2: the authority, not a certified vendor, issues the unit and owns its counters.
- **K6** is distinct from K5: no hardware, but device binding and a connectivity leash stricter than most hardware.
- **K8c** (ZATCA, Egypt) is the kind closest to the ruled core: a per-device counter and previous-record hash, reported within 24 hours.
- **K9** is a kind, not an absence: it constrains what the software may offer.

**Demands that cut across kinds** (Observed, sources in §4): advance registration of premises, devices or series with the authority (HR, SI, ME, PT, DE, AT, BE, SA, EG, KE); linking card terminals to the till (Italy from 1 Jan 2026 per the dates note; Greece [GR-1]); marked training receipts in their own numbering (NO [NO-1], PT [PT-2], AT [AT-1], DK [DK-1]); operator identity by national ID (Belgium [BE-2]); a locked device clock (Saudi Arabia [SA-1]); a receipt only on request or digitally (Czechia [CZ-1], Norway [NO-1]).

---

## 4. Each kind, question by question

The eight questions the ticket asks: who makes the record and its number; online at sale and the offline fallback; what is certified and by whom; the receipt; closures, logs and archives; corrections; multi-till; third-party carriers.

### K2 Certified signing device or service (DE, AT, BE, SE)

- **Who makes the record and its number.**
  - Germany: the TSE makes the start and end time, a "unique and continuous" transaction number, the signature counter and the check value. It must be called at the start of a sale, again within 45 s of any change, and at the end [DE-1 §1.12.2.4, 2.2.2]. DSFinV-K 3.0 adds a 300-second rule for logging line items [DE-2]. The till's own BON_NR need only be unique within one closing and may repeat over the till's life [DE-2]. The gap-revealing chain "results from the TSE-managed transaction number and signature counter" [DE-1 §1.15.1]. **Observed:** in Germany the legal number belongs to the device, not the till.
  - Austria: the till makes the receipt number and an AES-256-encrypted running total; the signature unit signs; each signature covers part of the previous one, so **the till builds the chain of signatures** [AT-1 §8, 9; AT-2 §4.6]. Observed.
  - Belgium: the till sends its own ticket number; the FDM adds its event counter, total counter, signature and time [BE-1]. Observed.
  - Sweden: the till numbers receipts in an unbroken series; the control unit makes the control code [SE-2]. Observed.
- **Online at sale; offline fallback.**
  - Germany: the till may keep selling until the outage is fixed; receipts show the outage; there is no hours limit; nothing allows signing afterwards [DE-1 §1.14.2–1.14.4]. A cloud TSE needs a connection on every call [S, DE-3, Unverified which page].
  - Austria: up to 48 h counts as temporary; longer is reported in FinanzOnline. During the outage receipts carry "Sicherheitseinrichtung ausgefallen"; afterwards a signed zero-amount Sammelbeleg covers the gap. Receipts are never re-signed [AT-1 §17(4); AT-2 §3.6, 3.6.1].
  - Belgium: **none**. "A transaction … cannot be completed as long as a signature from the FDM cannot be received" [BE-1, POS spec §3]. A failed FDM means handwritten receipts and an emergency FDM [BE-2 Q511; BE-3, 2018 page, Unverified for SCE 2.0].
  - Sweden: with a physical control unit, a sale is registered only once the unit returns a code, so **none** [SE-2 4 kap. 9 §]; with a control system, up to 48 h of buffering with a marked receipt [SE-1 5 kap. 46 §].
- **Certified.** Germany: the TSE only, by the BSI [DE-1 §1.16–1.17]. Austria: no till certification; the signature unit meets eIDAS Annex II [AT-1 §12, 20–22]. Belgium: **both the till software and the FDM** [BE-1; BE-4]. Sweden: control units and control systems, by an accredited body; the till needs a manufacturer's declaration [SE-3 14 kap.; SE-2 8 kap.]. Observed.
- **Receipt.** Germany: times, transaction number, till and TSE serials, signature counter, check value, printed "in the format the TSE returned them" or as a DSFinV-K QR [DE-1 §2.4.4]. Austria: a QR carrying register ID, number, time, amounts, encrypted total, certificate serial and signatures [AT-1 §10–11]. Belgium: a QR from a URL the FDM generates, plus FDM ID, counters and a short signature [BE-1 §6.5–6.6]. Observed.
- **Closures, logs, archives.** Germany: a per-till closing number, "ascending, continuous, not resettable", once or more a day or spanning days; TSE TAR export plus DSFinV-K; each till notified to the tax office within a month [DE-2]. Austria: **signed zero-amount start, month, year and closing receipts inside each till's chain**; the receipt journal (DEP) exportable at any time [AT-1 §6–8, 17(8)]. Belgium: a daily Z at minimum, FDM-signed; automatic X/Z reports use a "robot" user; reprints need a signed Copy event [BE-2 Q501, Q503]. Sweden: a Z per till per sales day; an XML journal export [SE-4 4 kap. 5 §]. Observed.
- **Corrections.** All four: a new signed record pointing to the original (Germany storno with reversed signs [DE-2 §4.2.2]; Austria void receipt [AT-2 §3.2.4]; Sweden return receipt [SE-2]). Belgium separates REFUND from CORRECTION, the latter only before payment [BE-2 Q301]. Observed.
- **Multi-till.** Germany: one TSE may serve a group of tills; each till belongs to exactly one TSE [DE-1 §1.6, 1.16.2.4]. Austria: one signature unit may serve many tills; each till has its own register ID and registration [AT-2 §3.3.1; AT-1 §16]. Belgium: a terminal ID per terminal and a device ID per device [BE-1 §6.2–6.3]. Sweden: a type C control unit serves several tills with counters per till [SE-3 4 kap. 7 §]. Observed.
- **Third-party carriers.** Germany: cloud TSEs (fiskaly, Deutsche Fiskal, fiskaltrust) [S]; the TSE's certificate comes from the TSE maker's PKI, not the merchant [DE-1 §2.2.3.2]. Austria: remote signing in an HSM is allowed, the certificate is the merchant's, the key must not be extractable [AT-2 §3.3.1; AT-1 §15]; A-Trust, GLOBALTRUST and primesign [S, AT-3, Unverified which page]. Sweden: a control system's server run by the maker in the EEA; keys derived from Skatteverket's master key never leave the unit [SE-1 11 kap.; SE-3 11 kap.]; fiskaly SIGN SE [S, SE-5]. Belgium: none; the FDM is hardware [BE-1 §2.4.3]. Observed.

### K3 Real-time reporting with an authority-returned ID (HR, SI, ME, AL, SK, CZ, QC; GR)

- **Who makes the record and its number.** The till computes a security code signed with a certificate (ZKI in Croatia, ZOI in Slovenia, IKOF in Montenegro, NSLF in Albania), sends the receipt, and prints the identifier the authority returns (JIR, EOR, JIKR, NIVF) [HR-1 art. 2, 15; SI-1; ME-1 S; AL-1 S]. The receipt number is the till's but embeds a **registered** premises code and device code: Croatia "number / premises / device", unbroken per premises or per device [HR-1 art. 9]; Slovenia PREMISES-DEVICE-n, unbroken per business year [SI-1]. Czechia EET 2.0 drops the signed code and the printed ID: the till sends a recording-unit ID, device ID, sequential number, time and total only; the authority's POK need not be printed [CZ-1 S; CZ-2 S]. Observed.
- **Online at sale; offline fallback.** In Croatia and Slovenia the normal path waits for the answer: the receipt carries the JIR or EOR the authority returns [HR-1 art. 15(3), 15(5); SI-1, where the till waits up to a time the merchant sets, allowing for FURS's two-second processing limit]. The sale completes before the answer only on the fallback, when the connection or the authority's system fails; whether the other members' normal path waits likewise is Not evaluated. Croatia: receipt issued without a JIR, data sent within **two working days** [HR-1 art. 21]. Slovenia: two working days [SI-1]. Montenegro and Albania: 48 h [ME-1 S; AL-1 S]. Czechia: at most 48 h after the sale [CZ-1 S; an earlier draft said 5 days, Unverified against the enacted text]. Slovakia: an "OFF-LINE DOKLAD" with its own code, sent within 96 h; paper receipts entered within 10 days [SK-1]. Observed.
- **Certified or registered.** Croatia: every premises registered in ePorezna; no software certification [HR-1 art. 16]. Slovenia: premises registered with FURS; the FURS certificate "may be copied, installed on each device or held centrally" [SI-1]. Montenegro: premises, devices, operators, the software maker and maintainer all registered [ME-1 S]. Quebec: the software is certified by Revenu Québec and the merchant obtains a digital certificate for it [QC-1 P, snippet; QC-2 P, snippet]. Czechia: units and certificates in the MOJE daně portal, a certificate valid a year and able to cover several units [CZ-1 S]. Observed.
- **Receipt.** Croatia: JIR, ZKI and a QR holding the verification URL, JIR or ZKI, time and amount [HR-1 art. 7; HR-2]. Slovenia: ZOI as a QR, PDF417 or Code128, plus EOR; copies marked "KOPIJA" with their own sequence [SI-1]. Montenegro: a QR showing an unfiscalised receipt's status [ME-1 S]. Observed.
- **Closures, logs, archives.** No closure duty found except Montenegro's daily registration of cash deposits [ME-1 S]. Inferred.
- **Corrections.** A fiscalised corrective or cancellation record that references the original (SI [SI-1], ME [ME-1 S], AL [AL-2 S]). Croatia: storno of items on an issued receipt is "expressly forbidden by law"; a full cancellation and a new receipt instead [HR-2]. Montenegro: the original must be fiscalised before its correction [ME-1 S]. Observed.
- **Multi-till.** Per-device and per-premises identifiers registered in advance (HR, SI, ME). Observed.
- **Third-party carriers.** Croatia: a merchant may authorise another person to send under that person's certificate [HR-2]. Greece: licensed e-invoicing providers with a B2C licence type, or ERP software transmitting to myDATA, which returns a `qrCodeUrl` to print; card terminals must be linked to the till [GR-1 P, snippet; GR-2 P, snippet]. Observed (Greece from snippets only).

### K4 The authority's control unit signs and counts (RS, KE, RW, TZ)

- **Who makes the record and its number.** Serbia: a secure element issued by the tax authority, personalised per taxpayer and per premises (smart card or .pfx), signs each receipt; a receipt without it is not fiscal; the number is the processor's "PFR number" plus counters per receipt and transaction type [RS-1]. Kenya: the control unit (OSCU online, VSCU local) returns its invoice number, counters, internal data and signature; the till's own consecutive number survives as a secondary ID and resumes after a reset from the last transmitted number [KE-1 §5.3, 6.3]. Rwanda: the VSDC returns its ID, time, counters, internal data and signature [RW-1]. Tanzania: a virtual fiscal device (VFD) with authority-side global and daily counters [TZ-1 P, snippet; TZ-2 S]. Observed (Tanzania Inferred).
- **Online at sale; offline fallback.** Serbia: data within "five days at the latest" when offline, which needs a local processor (L-PFR) [RS-1]. Kenya and Rwanda: no receipt unless connected to a working control unit [KE-1 §6.7; RW-1 §2, 7.8]; Kenya's VSCU suits "not always online" [KE-2], its offline limit Unverified. Observed.
- **Certified.** Serbia: the till software (ESIR), the processor and the secure element are all approved and publicly listed; premises registered and given codes by the authority [RS-1]. Kenya: certified third-party integrators [KE-2]. Observed.
- **Receipt.** Serbia: a QR with the full signature [RS-1]. Rwanda: an "SDC Information" block, a QR of date, time, SDC ID, number, internal data and signature, the authority's logo; copies watermarked "Copy" [RW-1 §7.18–7.29]. Observed.
- **Closures.** Kenya and Rwanda: X and Z reports, a Z per calendar day [KE-1 §6.5; RW-1]. Observed.
- **Corrections.** Kenya and Rwanda: cancel first, citing the original control-unit number, once only; refunds and credit notes under their own labels, from the same solution that issued the original [KE-1 §6.16; KE-2; RW-1 §7.6, 7.17]. Serbia: a refund receipt referencing the original, then a new sale [RS-1]. Observed.
- **Third-party carriers.** Serbia's cloud processor (V-PFR) is an approved element [RS-1]. Observed.

### K5 Fiscal hardware owns numbering and memory (IT RT, BG, TR, RO, HU, RU, AR, PA)

- **Who makes the record and its number.** Italy RT: the sealed fiscal module; a document number is the 4-digit closure number, a hyphen and a counter reset at each daily closure [IT-1]. Bulgaria: the fiscal device owns the fiscal receipt; the sales software (SUPTO) generates a unique sale number when the sale is first entered and passes it to the device [BG-1 S; BG-2 S, Unverified against the official annex]. Hungary: the tax unit computes a control code from the receipt and the previous code; the number embeds the authority device ID and a daily counter [HU-1 Annex 2]. Turkey: e-documents signed with the device's fiscal certificate, which replaces the merchant's signature [TR-1 P, host]. Romania: the fiscal module and memory own totals and counters; the electronic journal hashes each day [RO-1, draft]. Observed.
- **Online at sale; offline fallback.** Italy RT: daily data within 12 days, with an out-of-service event for longer breaks [IT-1]. Bulgaria: a 2017 draft blocks the device after 24 h unsent, then a paper book for 48 h [BG-3, draft; current limit Unverified]. Hungary: only hardware registers may work offline, for **at most 72 h, then the device locks itself** [HU-1 Annex 2 A/16–18]. Russia: the fiscal drive stops signing after 30 days without the data operator's acknowledgement [RU-1 S]. Turkey: "continuously online" [TR-1]. Observed.
- **Certified.** Device models, by the tax authority or a commission (all). Bulgaria also admits the sales software to a public register [BG-4 S]. Observed.
- **Receipt.** Printed by the device, with its fiscal logo, memory number and QR (Bulgaria QR with the device's registration number [BG-3]; Romania "BON FISCAL" and the fiscal series [RO-1, draft]). Observed.
- **Closures.** The device's daily Z is the closure everywhere. Hungary: daily open and close on the device, and a tax day cannot cross a calendar day [HU-1 §33–46]. Romania: the device forces a Z if a sale is attempted more than 24 h after the last one [RO-1 art. 38(2)(b), draft]. Observed.
- **Corrections.** Device storno or refund documents (BG [BG-5, page not loaded, Unverified]; HU sztornó, negative totals not allowed [HU-1]). Observed for Hungary.
- **Multi-till.** One device per till, or Italy's "Server RT" collecting for many points of sale in one shop [IT-1]. Observed.
- **Third-party carriers.** The device and its service company; no software-only route found for Bulgaria, Turkey or Romania. Inferred.

### K6 Certified device-bound software with an online repository (IT software route, PL, HU cloud)

- **Who makes the record and its number.** Italy (Provv. 111204, 7 Mar 2025): MF1 on the point of issue (a PC, tablet or SmartPOS) records, signs and issues; MF2 at an accredited provider's server (the "Erogatore") stores, seals the daily file and sends it [IT-2 §1.5–1.6, 10.1]. Each point of issue has its own certificate, its key in a "secure area" (smart card, HSM or equivalent) that prevents extraction or copying; signed documents chain by SHA-256 into a per-device journal; numbering as the RT [IT-3 §7.1–7.2, 9.2, draft as notified to the EU]. Poland: the producer issues a per-kasa certificate; the central repository assigns a registration number; each receipt is signed with the kasa's private key and carries the hash of the previous one [PL-1 annex §3, 13–17]. Observed.
- **Online at sale; offline fallback.** Italy: each document to the provider's server in real time; **after 60 minutes without contact the device blocks**, force-closes the day and issues nothing [IT-3 §3.2.5, draft]. Poland: data out at least every 2 hours; **no sales without that day's key from the Ministry** [PL-1 annex §20, 37–47]. Hungary: cloud registers cannot work offline at all [HU-1 Annex 2]. Observed.
- **Device binding.** Poland: the kasa is bound to the one device it was fiscalised on, will not start on another, and cannot be restored from a backup [PL-1 annex §1, 18]. Observed.
- **Certified.** Italy: the solution approved by the Agenzia's Director, an accredited certifier, the provider accredited and bound by agreement [IT-2 §3–4]. Poland: a 5-year approval, renewed for every change [PL-1 §24–25]. Observed.
- **Closures.** Italy: the cash closure within 24 h of opening, per device [IT-3 §3.2.5]. Poland: a daily fiscal report after the day's sales and before the next day's first, chained [PL-1 annex §4, 25]. Observed.
- **Corrections.** Italy: a reso (refund, capped at the remaining amount per VAT rate) or annullo (full only), each finding the original by device ID and number [IT-3 §1.2]. Poland: no cancelling an approved receipt and no returns in the kasa; returns go in a separate register [PL-1 annex §19]. Observed.
- **Status.** Italy's route is not yet open [IT-2 §3.3; dates note]. Poland's is limited to listed taxpayer groups [PL-1]. Observed.

### K7 Certified software with a producer key and an audit file (PT, NO, DK)

- **Who makes the record and its number.** Portugal: the software, "progressive and continuously within each series"; a series per establishment or terminal [PT-2 §1.6–1.8]. **Each series is sent to the tax authority before first use and the authority returns a validation code**, printed as `ATCUD:Code-SeqNo` [PT-3 arts. 2–4]. Norway and Denmark: the software numbers; no series registration [NO-1; DK-1]. Observed.
- **Online at sale; offline fallback.** None required in any of the three; Portugal reports monthly and needs the authority once per new series [PT-2 §2.4–2.5; PT-4 S, snippet]. Observed.
- **Certified, and the key.** Portugal: the developer declares to the authority with its public key; the RSA signature over date, entry time, number, total and the previous hash uses "a private key, only known by the program developer", which the program must "protect in an efficient way" [PT-1 arts. 3–6; PT-2 §2.1.3–3.1.4]. Norway: a product declaration per version; RSA-SHA1 chained per till; the vendor may not use one key pair per customer and the private key must be its "unique knowledge"; a self-developed system cannot be declared [NO-1 §3-1; NO-2; NO-3]. Denmark: no approval; RSA-SHA512 with an OCES3 company certificate issued to the business owner or the system supplier, chained per company per till, signed "during the completion of a transaction, not by batch processing" [DK-1; DK-2]. Observed.
- **Receipt.** Portugal: four signature characters, "Processado por programa certificado n.º NNNN/AT", ATCUD and QR; nothing printable until signed [PT-1 art. 6(3); PT-2 §1.10; PT-3]. Norway: headings and markings ("KOPI", "Returkvittering", training receipts with their own numbering) [NO-1 §2-8-4 to 2-8-6]. Observed.
- **Closures.** Norway: an X and a numbered Z per till point; **a Z cannot be produced while any sale is open**; export only after a Z [NO-1 §2-7, 2-8-3]; a Z from each till point at the end of each day [NO-4]. Denmark: a daily Z that resets counters [DK-1]. Portugal: none; SAF-T export instead [PT-2]. Observed.
- **Corrections.** Credit notes (Portugal, no negative amounts [PT-2 §2.2.6]); return receipts (Norway [NO-1 §2-8-5]); no function may change registered data (Norway [NO-1 §2-6], Denmark [DK-1]). Observed.
- **Multi-till.** A chain per series (PT) or per till (NO, DK). Observed.
- **Third-party carriers.** None required; Denmark's certificate authority only. Inferred.

### K8 Clearance e-invoicing applied to receipts

- **8a Cleared per document.**
  - Brazil NFC-e: the merchant numbers within its series, signs with its own certificate, and the state tax office authorises each note; in offline contingency the receipt is marked and the XML sent **within 24 h** [BR-1]. Skipped numbers must be formally voided [BR-2 S, snippet]. Cancellation within 30 minutes [BR-3 S, snippet].
  - Mexico CFDI: the merchant signs; an accredited provider (PAC) stamps and assigns the UUID within 72 h [MX-2 S, snippet]. Cash sales go into a daily, weekly or monthly "factura global" [MX-3 S, snippet]. Every cancellation needs a reason code, and code 04 means cancelling and reissuing the global without that sale [MX-1].
  - Colombia: the POS document exists only once the authority has validated it; its number and range are ones the authority authorised [CO-1 arts. 5, 19]. A 2024 draft says there is no POS contingency [CO-2 S, snippet]. Observed.
- **8b Authority-allocated number ranges.**
  - Chile: the SII issues folio ranges (a CAF file) that the taxpayer must keep secure, and unused folios must be annulled [CL-1]. Each boleta goes to the SII within one hour, or within one hour of the connection returning [CL-2 §6].
  - Argentina CAEA: a code per fortnight, operations reported within 8 days of its end; from 1 Jun 2026 contingency-only, with abuse caps at 5% of monthly sales [AR-1; AR-2 S, snippet]. Observed.
- **8c Device-stamped, reported within 24 h.**
  - Saudi Arabia: each unit keeps a counter that "cannot be reset" and the previous invoice's hash; it applies the cryptographic stamp and holds its own certificate (CSID); it may produce only one sequence; offline invoices are queued and reported within 24 h [SA-1 Second B, Third E.2, Annex 1].
  - Exporting the stamp's private key, changing the clock, resetting the counter and editing logs are prohibited [SA-1 Annex 1; SA-2].
  - Egypt: the POS computes each receipt's UUID as a SHA-256 over the receipt including the previous UUID; the first has an empty previous UUID; submit within 24 h; the POS is registered first; returns within 540 days [EG-1]. Observed.
- **8d Periodic consolidation.** Mexico's factura global within 24 h after its period [MX-3 S, snippet]; Peru's daily summary within 7 days [PE-1 P, snippet]; Malaysia's monthly consolidated e-invoice within 7 days of month end, cancellation within 72 h of validation [MY-1 S, snippet; MY-2]. Observed (from snippets for Mexico and Peru).
- **Out of scope.** India's B2C invoices need no IRN [IN-1 P, snippet]; Poland's cash-register receipts stay outside KSeF [PL-2 P, snippet]. Observed.
- **Third-party carriers.** PACs (Mexico), OSEs and PSEs (Peru), authorised providers (Colombia); merchant certificates in Brazil, Chile and Peru. Observed from the sources above.

### K9 No till rule, but an anti-suppression law

- **UK:** making, supplying or promoting a sales-suppression tool is penalised up to £50k, possessing one up to £1k plus daily penalties; a tool is one whose main function, or one of them, is suppressing records [UK-1]. Making Tax Digital is about records and returns, not tills [UK-2 P, snippet]. Observed.
- **Australia:** producing, supplying or possessing an electronic sales-suppression tool has been an offence since 2018 [AU-1 P, snippet]; the tax office's examples include "permanently delete and re-sequence transactions" [AU-2 P, snippet]. Observed from snippets.
- **Canada (federal):** penalties for using, possessing, making or selling suppression software, criminal penalties up to $1M or 5 years [CA-1]. Quebec restaurants and bars need certified software talking to WEB-SRM (K3) [QC-3 P, snippet]. Observed.
- **USA:** no federal rule; many states make selling or possessing "zappers" or "phantom-ware" an offence, for example Florida [US-1 P, snippet]. Observed from snippets.
- **New Zealand** [NZ-1 P, snippet] and **Ireland** [IE-1 P, snippet] have similar offences. The **Netherlands** has a voluntary quality mark and general record-keeping law [NL-1 P, snippet]. Observed from snippets.
- **What it demands** (Inferred): no permanent delete of a sale and no renumbering, in the product or as an add-on. C5's refusal to delete an order with a fiscal record already meets it while a fiscal mode is on; whether WCPOS offers such a function with no fiscal mode on is Not evaluated here.

---

## 5. The fit table: each core block against each kind

**F** fits as it is. **S·n** fits with seam n (§6). **X** cannot fit as ruled; that kind needs a different design for that block. K1 (France, Spain) fits every row by construction and is left out.

| Core block | K2 signing device | K3 real-time ID | K4 authority unit | K5 fiscal hardware | K6 device-bound software | K7 producer-key software | K8 clearance | K9 none |
|---|---|---|---|---|---|---|---|---|
| C1 each-till chain, plain hash | S·1 (DE: chain is the TSE's counters; AT: chain of signatures; BE, SE: device codes) | S·1 (signed security code; the chain is optional) | S·1 (the unit signs) | S·1 (the device's memory is the record; the till's chain is a shadow) | S·1 (signed, then chained, on the device) | S·1 (RSA chain; the key is the producer's) | S·1 (8a: signature only; 8c: counter and previous hash, very close) | F |
| C2 till-owned gapless series under a store code | S·2 (DE: the TSE owns the legal number; AT, BE, SE: fits) | S·2 (premises and device codes are registered with the authority; SI restarts yearly) | S·2 (the unit's number is the legal one) | S·2 (the device's closure-counter number) | S·2 (IT: closure-counter; PL: registry number) | S·2 (PT: each series needs an authority code before first use) | S·2 (8b: ranges from the authority; 8a: UUID or authorisation from outside) | F |
| C3 store keeps and verifies | S·1 (verifies foreign signatures, or trusts the device's export) | F | S·1 | S·1 (the device's journal is the legal copy) | S·1 | F | F | F |
| C4 no offline limit | X for BE and SE control units (no offline at all); S·4 for AT (selling continues on marked receipts; an outage over 48 h is reported in FinanzOnline; a summary receipt after recovery) and DE (no limit, marked receipts) | S·4 (48 h to 5 days) | X without a local unit; S·4 with one (RS 5 days) | S·4 (12 days to 72 h, then the device locks) | X (60 min or a daily key) | F | S·4 (24 h to 7 days; CO none; CL open-ended) | F |
| C5 cancel-and-reissue | S·5 (the cancel is a new signed record; BE separates refund from correction) | S·5 (HR forbids item storno; ME: fiscalise the original first) | S·5 (cancel first, once) | S·5 (device storno) | S·5 (PL: no cancelling in the kasa; IT: reso or annullo) | F | S·5 (time windows: BR 30 min, MY 72 h, MX reason codes) | F |
| C6 automatic closures by the store | S·3 (closures per till; AT's month and year receipts sit in each till's chain) | F | S·3 (Z per till per day) | X for the closure itself (the device makes it); the store's closure becomes a report | S·3 (per device within 24 h or before the next day's first sale) | S·3 (NO: Z per till, not while a sale is open) | F (8d: the store makes the summary) | F |
| C7 chained event log | F | F | F | F | F | F | F | F |
| C8 archive | S·6 (DSFinV-K, DEP, SE XML journal are formats of it) | F | F | S·6 | F | S·6 (SAF-T) | F | F |
| C9 locked receipt block | S·6 (fields exactly as the device returns them) | S·6 (the returned ID; pending on the fallback, when it arrives after the sale) | S·6 (print what the unit returns) | X on the device's own receipt; F on a non-fiscal copy | S·6 (content from the certified module) | F | S·6 (QR, UUID, contingency legend) | F |
| C10 store holds the certificate | X (keys in the TSE, HSM, FDM or control unit; only access is shared) | F (SI allows copies; HR allows an authorised third party's certificate; ME one per entity on the device) | X (the authority's element) | X (the device's certificate) | X (non-exportable, one device) | X (producer key, not the merchant's) for PT, NO; F for DK, but signing must happen at completion, so an offline till needs the key | S·1 (8a, 8b: merchant certificate fits; 8c: X, the device generates its own key) | F |
| C11 per-store modes in Pro, switch on and off | F | F (plus advance registration, S·2) | F | F | F | F | F | F |
| Paid-sale path: the sale completes locally at once | X for BE, SE control units, DE start-of-sale call: S·3 | S·3 (HR, SI: wait for the ID; on the fallback, complete now and the ID later) | X without a local unit: S·3 | X (the device completes the sale): S·3 | X (online at sale): S·3 | F | S·3 (8a contingency; CO prior validation) | F |

The last row is not a ruled block but the assumption under all of them, from #647 and #656: the record, chain link and QR exist when the receipt is handed over, offline included, with nothing outside the till consulted.

---

## 6. The seams

Named, not designed.

1. **The protector is pluggable.** The step that makes a record tamper-evident is a provider: a plain hash (France), AEAT's hash and an optional merchant signature (Spain), a call to an external device or service (TSE, HSM, FDM, control unit, the authority's secure element, a fiscal printer), a device-generated key that never leaves the device (Saudi Arabia, Italy's software route, Poland), or a producer-held key behind a service (Portugal, Norway). The record stores whatever the provider returns, inside the versioned payload #648 already rules. This seam also carries **key custody**: the store-held certificate of C10 is one custody option, not the engine's model.
2. **The legal number can come from outside.** A record carries the till's own counter and, separately, a legal identifier the provider or the authority supplies: a TSE transaction number, a fiscal device's closure-counter, an authority-returned ID (JIR, EOR, UUID, CUDE), a number drawn from an authority range (Chile). A till code may also need an authority-side registration before use (Portugal's per-series code, Croatian and Slovenian premises, Saudi device onboarding), so issuing a till code can wait on an outside step.
3. **Completion can wait on an external answer.** Per mode, a sale's fiscal step is one of: local and immediate (France, Spain); synchronous to a device or service, blocking completion, with a defined failure (Belgium, Sweden, Kenya, Rwanda, Italy's software route, the normal path in Croatia and Slovenia, where the receipt prints the JIR or EOR); or complete now and acknowledged later, with a pending state the record and receipt carry (the Croatian and Slovenian fallback receipt without a JIR or EOR, Czechia, Slovakia, Brazil's contingency, Saudi Arabia). Germany adds a variant: **the protector is called at the start of the transaction** and on changes, not only at the end. The same seam lets closures happen at till level inside a till's chain (Austria, Norway, Poland, Italy), since a closure is a record the till's protector signs.
4. **The offline rule is a per-mode policy.** A deadline, a warning, a stop on selling, a recovery record (Austria's Sammelbeleg), or none. France and Spain set none, as ruled.
5. **Corrections map to the mode's document types.** Cancel-and-reissue stays the rule; the mode says which document each row of #650 becomes, what reference it carries (the legal number of seam 2), and its windows and bans (Brazil 30 minutes, Malaysia 72 h, Croatia no item storno, Poland no cancel in the kasa).
6. **Outputs are per mode.** The receipt block renders fields read from the record, in the exact form the provider returned, including a pending variant; exports (DSFinV-K, DEP, SAF-T PT, NO and DK, Sweden's XML journal) are formatters over the archive's records; periodic summaries (Mexico, Peru, Malaysia) are store-side documents built like closures.

Seam 4 is the only one France and Spain already exercise as a setting (both set none). Seams 5 and 6 are what #648's "one engine, country payloads" already implies. Seams 1 to 3 are new.

---

## 7. Distilled: the smallest set, and what each costs

### Cheap to leave now

These are shapes in the record and in interfaces the France and Spain build defines anyway. Each costs little now and keeps a kind open. Inferred throughout.

- **Seam 1, as an interface.** The engine calls a protector that returns opaque, versioned protection fields, and never assumes it holds key bytes (signing may be remote, asynchronous, or done on a device that cannot export the key). France's plain hash and Spain's hash-and-signature are its first two providers.
- **Seam 2, as fields.** A record carries the till counter and a legal number that may differ, plus room for external IDs and a device serial. For France and Spain the legal number is the till's own. #649 already separates the fiscal number from the order number; this is one more slot.
- **A record status.** Issued locally, sent, accepted, rejected. VERI\*FACTU's send queue needs it anyway; it is seam 3's pending state at no extra cost.
- **The receipt block reads, never computes.** It renders what the record holds and has a pending variant (seam 6). The receipt schema's reserved fields (#655) are already the carrier.
- **Per-mode constants** for the offline rule, the correction mapping and the closure cadence (seams 4, 5), with France and Spain set as ruled.
- **A closure is a record type the chain can hold at either level.** The store's automatic closures (#651) are one producer; nothing in the record model forbids a till-level closure in a till's chain.
- **Export formatters behind the archive** (seam 6).

### Costly to add after France and Spain ship

These run through the paid-sale path, which the permissions release (#625 to #627) is rewriting now and fiscal will hang off next. Inferred throughout.

- **Completion that can block on, or pend for, an outside answer (seam 3).** If fiscal completion is built as "local, synchronous, always succeeds", then adding a blocking device or service call, its timeout, its failure screen and its retry later touches checkout, payment, receipt printing and the customer display in every app (web, desktop, mobile), plus the store-side sale path in WP Admin. Building the call site as possibly-asynchronous, with a defined failure, now costs a little; retrofitting it costs a release.
- **A protector called at the start of the transaction, not only at the end** (Germany's TSE, and DSFinV-K 3.0's line-item timing). This reaches into the cart, not only the completion step. It is cheap only if the fiscal engine is given a transaction lifecycle (start, change, finish, abandon) when the paid-sale path is laid down, even with France and Spain ignoring the first three.

Everything else in §6 can be added later as new providers, new payload versions and new per-mode settings without rewriting records already written, because #648 versions the payload and forbids re-hashing.

---

## 8. Rulings so far that a common kind makes hard to undo

Each is right for France and Spain as ruled. The risk is in building it as an engine invariant rather than a France and Spain setting. Inferred unless stated.

1. **No offline limit, browser tills included (#656, later comment).** **Observed:** of the kinds in §4, only K7 (Portugal, Norway, Denmark), Germany, Austria (marked receipts, an outage over 48 h reported in FinanzOnline, a Sammelbeleg after recovery; §4 K2), Chile (send within an hour of reconnecting) and the K9 markets allow indefinite offline selling; everyone else sets a limit or allows none. The code is easy to change per mode (seam 4). What is hard to undo is the promise: merchant docs and UI that say a fiscal till always sells offline, and the absence of any place in the checkout where selling can be refused. Recommendation for the spec: say "France and Spain have no offline limit", not "fiscal tills have none".
2. **The store holds the certificate and hands it to tills (#656, ruling 4).** **Observed:** K2, K4, K5, K6, Portugal, Norway and Saudi Arabia all forbid a copied or exportable signing key, or give the key to someone other than the merchant. Slovenia explicitly allows copies; Croatia, Montenegro and Denmark use merchant certificates. It is hard to undo only if the signing code assumes it has the key's bytes. Seam 1 as an interface removes the risk.
3. **The store makes every closure; a forgotten close blocks nothing; a register open across midnight spans two fiscal days (#651).** **Observed:** Austria's month and year receipts sit inside each till's chain; Norway forbids a Z while a sale is open; Hungary forbids a tax day across a calendar day; Poland and Italy close per device within a day. Keeping the cashier's cash count apart from the fiscal closure, as ruled, helps every kind. The hard part to undo is only if till chains are defined as never containing a closure.
4. **WCPOS holds no merchant's fiscal data (#653), with the code being GPL.** **Observed:** Portugal's signature key is "only known by the program developer"; Norway forbids per-customer keys and requires the key be the vendor's "unique knowledge" [PT-1; NO-2]. A GPL build cannot ship that key, so the only route is a producer-run signing service. Its inputs include each document's date, number and total and the previous hash, which is merchant fiscal data. This is a principle, not code, and it is the one ruling that two whole countries make hard to keep. No action for v2.1.0; it belongs in the "how each other country would be met later" lines.
5. **A wiped till gets a new code and a new chain (#648, #649).** **Observed:** where tills, devices or series are registered with the authority (Portugal per series, Croatia and Slovenia per device, Saudi Arabia per device with a one-time code, Austria and Germany per register), every wipe is a new registration and a decommissioning notice. Not hard to undo, but browser tills that lose storage often would make it an operational burden in those kinds.

Not at risk: cancel-and-reissue (#650) fits every kind once the cancel is itself a new record pointing to the original, which is how #650 is ruled; the chained event log (#654) and the archive (#653) fit every kind and only gain formats; per-till chains and series (#648, #649) are the most widely shared shape found.

---

## 9. Unverified points and gaps

- **Not opened, snippet only:** Greece, Quebec, Peru, Mexico's factura global timing, Australia, Ireland, New Zealand, the Netherlands and the US state codes. Read the primary text before any decision rests on them.
- **Drafts:** Italy's software-route annex was read as notified to the EU and may differ from the adopted text, including the 60-minute limit. Romania's details come from an April 2026 draft. Bulgaria's 24-hour block is from a 2017 draft.
- **No source URL at all:** Hungary's online registers usable until about mid-2028; EET 2.0 promulgated on 7 Oct 2026 (the dates note gives a secondary for it); Kazakhstan's 72-hour limit; Lithuania's 72-hour block; Chile's warning on CAF files older than 24 months; Argentina's RG 5647/2025; Poland's approval being issued by the Central Office of Measures. None of these carries a conclusion above.
- **Not read:** Bulgaria's official annex and storno page (the page would not load); Argentina's RG 5852/2026 (HTTP 500); Kenya's VSCU offline limit; Tanzania's VFD specification.
- **Not evaluated:** Russia, Kazakhstan, Uzbekistan, North Macedonia and Bosnia beyond one line each in the agents' notes; Latvia; Spain's TicketBAI (out of scope per #658); whether any WCPOS function today counts as a K9 suppression tool when no fiscal mode is on.

---

## 10. Sources

Dates are the document's or page's own; "n.d." means undated, read 2026-11-23.

| ID | Source | Date | URL |
|---|---|---|---|
| DE-1 | [P] AEAO zu § 146a AO (Bavarian tax office copy) | 2023-06-30 | https://www.lfst.bayern.de/fileadmin/RESSOURCEN/INFORMATIONEN/Steuerinfos/Weitere_Themen/Elektronische_Kassensysteme/2023-06-30-AEAO-Par-146-AO.pdf |
| DE-2 | [P] BMF: DSFinV-K 3.0 and new AEAO (applies from 2029), BZSt download page | 2026-10-26 | https://www.bzst.de/DE/Unternehmen/Aussenpruefungen/DigitaleSchnittstelleFinV/digitaleschnittstellefinv_node.html |
| DE-3 | [S, snippet] fiskaly: cloud TSE needs a stable connection (one of these two pages) | n.d. | https://developer.fiskaly.com/en/faq ; https://workspace.fiskaly.com/countries/germany/integration-guide/ |
| AT-1 | [P] RKSV, consolidated text | 2026-11-23 | https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20009390 |
| AT-2 | [P] BMF Erlass on the RKSV | 2026-09-29 | https://findok.bmf.gv.at/findok/iwg/84/84683/84683.1.pdf |
| AT-3 | [S, snippet] WKO Registrierkassenpflicht page (signature providers), page unconfirmed | n.d. | https://www.wko.at/information-consulting/unternehmensberatung-buchhaltung-informationstechnologie/it-dienstleistung/registrierkassenpflicht |
| BE-1 | [P] GKS 2.0 POS spec v2.2 and FDM spec v1.4 | 2026-04-17 | https://www.geregistreerdkassasysteem.be/nl/gks-20-1 |
| BE-2 | [P] GKS producer FAQ | 2026-06-23 | https://www.geregistreerdkassasysteem.be/sites/default/files/FAQ%20NL.pdf |
| BE-3 | [P] "Wat als mijn GKS defect is" | 2018-03-23 | https://www.geregistreerdkassasysteem.be/nl/ondernemer/werkwijze/wat-als-mijn-gks-defect |
| BE-4 | [P] GKS 2.0 technical information | 2024-06-10 | https://www.geregistreerdkassasysteem.be/nl/producteur-distributeur/producent/gks-20-technische-informatie |
| SE-1 | [P, host] SKVFS 2020:9 (control systems) | 2020-11-30 | https://lagen.nu/skvfs/2020:9 |
| SE-2 | [P, host] SKVFS 2021:17 | 2021-11-22 | https://lagen.nu/skvfs/2021:17 |
| SE-3 | [P, host] SKVFS 2016:1 | 2016-01-25 | https://lagen.nu/skvfs/2016:1 |
| SE-4 | [P, host] SKVFS 2021:18 (transition to 31.12.2026) | n.d. | https://lagen.nu/skvfs/2021:18 |
| SE-5 | [S] fiskaly: certified cash registers in Sweden | 2025-09-23 | https://www.fiskaly.com/blog/certified-cash-registers-in-sweden |
| SK-1 | [P] Slovakia Act 384/2025, consolidated | 2026-02-28 | https://static.slov-lex.sk/static/SK/ZZ/2025/384/20260228.html |
| HR-1 | [P] Zakon o fiskalizaciji, NN 89/25 | 2025-06-13 | https://narodne-novine.nn.hr/clanci/sluzbeni/2025_06_89_1233.html |
| HR-2 | [P] Porezna uprava, B2C fiscalisation | 2026-10-07 | https://porezna-uprava.gov.hr/hr/fiskalizacija-racuna-u-krajnjoj-potrosnji-b2c-poslovanje/8033 |
| SI-1 | [P] FURS, davčne blagajne procedures | 2015-10-13 | https://www.fu.gov.si/fileadmin/Internet/Nadzor/Podrocja/Davcne_blagajne_in_VKR/Opis/Davcne_blagajne_-_postopki_potrjevanja.pdf |
| RS-1 | [P] PURS, obligations of fiscalisation taxpayers | 2025-01 | https://purs.gov.rs/upload/media/2025/3/7/759121/Obaveze_obveznika_fiskalizacije_jan.pdf |
| ME-1 | [S] Tiramisu ERP, electronic fiscalisation in Montenegro | n.d. | https://tiramisuerp.com/en/electronic-fiscalization-in-montenegro |
| AL-1 | [S] fiscal-requirements.com, Albania offline | 2024-04-05 | https://www.fiscal-requirements.com/news/2937-fiscalization-in-albania-what-happens-if-the-communication-or-connection-with-the-tax-administration-is-interrupted |
| AL-2 | [S, snippet] vatupdate, Albania misstatements | 2026-08-27 | https://www.vatupdate.com/2026/08/27/albania-clarifies-nine-common-misstatements-about-its-fiscalisation-regime/ |
| CZ-1 | [S] podnikatel.cz, EET 2.0 overview | 2026-05-22 | https://www.podnikatel.cz/clanky/jak-bude-vypadat-eet-2-0-prinasime-podrobny-prehled/ |
| CZ-2 | [S] fiscal-requirements.com, EET 1.0 to 2.0 | n.d. (after 2026-09-22) | https://www.fiscal-requirements.com/news/6005-czech-republic-what-changes-from-eet-10-to-eet-20 |
| HU-1 | [P] Decree 8/2025 NGM | 2025-12-20 (status) | https://njt.jog.gov.hu/jogszabaly/2025-8-20-2X |
| GR-1 | [P, snippet] AADE decision A.1112/2025 | 2025-08-01 | https://aade.gr/egkyklioi-kai-apofaseis/mydata-diataxeis/1112-01-08-2025 |
| GR-2 | [P, snippet] AADE POS and cash-register linking | n.d. | https://www.aade.gr/en/diasyndesi-pos-tameiakon-systimaton/ti-prepei-na-kano-gia-na-diasyndetho |
| QC-1 | [P, snippet] Revenu Québec, certification of SRSs for WEB-SRM | n.d. | https://www.revenuquebec.ca/en/partners/product-developers/fields-of-activity/developers-mandatory-billing-cloud-solution/certified-srss-designed-to-communicate-with-the-web-srm/ |
| QC-2 | [P, snippet] Revenu Québec, SRS configuration | n.d. | https://www.revenuquebec.ca/fr/entreprises/mesures-particulieres/facturation-obligatoire/equipement-requis-facturation-obligatoire/configuration-du-sev-facturation-obligatoire/ |
| QC-3 | [P, snippet] Revenu Québec, restaurant sector | n.d. | https://www.revenuquebec.ca/fr/entreprises/mesures-particulieres/facturation-obligatoire/secteur-de-la-restauration-facturation-obligatoire/ |
| KE-1 | [P] KRA, TIS for OSCU/VSCU spec v2.0 | 2023-04 | https://www.kra.go.ke/images/publications/TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf |
| KE-2 | [P] KRA eTIMS service page | n.d. (integrator list 2025-03-24) | https://www.kra.go.ke/component/kra_services/service/16 |
| RW-1 | [P] RRA, CIS for VSDC spec | 2018-03 | https://www.rra.gov.rw/fileadmin/user_upload/20180328_tspe_cis_v4.pdf |
| TZ-1 | [P, snippet] TRA, Tax Administration (General) (Amendment) Regulations 2025 | 2025 | https://www.tra.go.tz/images/uploads/regulations/Subsidiary_legislation_%28The_Tax_Administration_%28General%29_%28Amendment%29_Regulations%2C_2025%29.pdf |
| TZ-2 | [S] tra-vfd client package (Go) | n.d. | https://pkg.go.dev/github.com/Golang-Tanzania/tra-vfd |
| IT-1 | [P] Agenzia delle Entrate, RT spec v11 | n.d. | https://www.agenziaentrate.gov.it/portale/documents/20143/4952835/Specifiche_Tecniche_RT_V11.pdf/246859ea-1586-5164-daf9-af01779de295 |
| IT-2 | [P, host] Provv. 111204, software solutions | 2025-03-07 | https://informazionefiscale.it/IMG/pdf/provvedimento_ssw.pdf |
| IT-3 | [P] Technical annex as notified to the EU (draft) | n.d. | https://technical-regulation-information-system.ec.europa.eu/bg/notification/26140/text/D/IT |
| PL-1 | [P] Dz.U. 2025 poz. 861, software cash registers | 2025-06-25 | https://api.sejm.gov.pl/eli/acts/DU/2025/861/text.pdf |
| PL-2 | [P, snippet] KSeF, consumers | n.d. | https://ksef.podatki.gov.pl/konsumenci-i-osoby-fizyczne |
| BG-1 | [S] kik-info, summary of an NRA opinion | n.d. | https://kik-info.com/stanovishta-na-nap/6a1ad78802d589bca94832a8bcc0dd95 |
| BG-2 | [S, snippet] ERP.net, unique sale number rule | n.d. | https://docs.erp.net/model/business-rules/R29929.html |
| BG-3 | [P] TRIS 2017/0367, draft amendment to Ordinance N-18 | 2017-08 | https://technical-regulation-information-system.ec.europa.eu/it/notification/17887/text/D/EN |
| BG-4 | [S, snippet] vatupdate, fiscalisation in Bulgaria | 2021-09-27 | https://vatupdate.com/2021/09/27/fiscalization-in-bulgaria |
| BG-5 | [P, not loaded] NRA, sale and storno documents | n.d. | https://nra.bg/wps/portal/nra/fiskalni-ustroystva-supto-i-e-magazini/dokumenti-zaprodajba-i-storno-operatsii/Dokumenti-za-prdajba |
| TR-1 | [P, host] VUK General Communiqué 593 | 2026-05-08 | https://www.alomaliye.com/2026/05/08/vergi-usul-kanunu-genel-tebligi-sira-no-593-vuk-593/ |
| RO-1 | [P, host] Draft HG amending the HG 479/2003 norms | 2026-04 | https://startupcafe.ro/wp-content/uploads/2026/04/proiectHGcasedemarcat_01042026.pdf |
| RU-1 | [S, snippet] Kontur, cash register blocking (one of two pages) | n.d. | https://kontur.ru/ofd/spravka/549-blokirovka_onlajnkassy ; https://kontur.ru/market/spravka/25431-kassa_ne_peredaet_cheki_v_fns |
| PT-1 | [P] Portaria 363/2010 (AT's English translation) | 2010-06-23 | https://info.portaldasfinancas.gov.pt/en/tax-information/doing-business/invoicing-and-accounting-systems/certify-invoicing-software-for-corporate-tax-compliance/Documents/ordinance-363-2010-certification-of-computer-invoicing-programs.pdf |
| PT-2 | [P] Despacho 8632/2014 (AT's English translation) | 2014-07-03 | https://info.portaldasfinancas.gov.pt/en/tax-information/doing-business/invoicing-and-accounting-systems/certify-invoicing-software-for-corporate-tax-compliance/Documents/order-no-8632-2014-of-the-3rd-july.pdf |
| PT-3 | [P] Portaria 195/2020 (ATCUD, QR) | 2020-08-13 | https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Portaria_195_2020.pdf |
| PT-4 | [S, snippet] InvoiceXpress, SAF-T by the 5th | n.d. | https://invoicexpress.com/blog/alteracao-data-entrega-saft-dia-5/ |
| NO-1 | [P] Kassasystemforskrifta FOR-2015-12-18-1616 | amended 2026-02-03 | https://lovdata.no/dokument/SF/forskrift/2015-12-18-1616 |
| NO-2 | [P] Skatteetaten, digital signature guideline | 2017-07 | https://www.skatteetaten.no/globalassets/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-regnskap/requirements-and-guidelines-for-implementing-digital-signatures-in-cash-register-systems.pdf |
| NO-3 | [P] Skatteetaten, self-developed cash systems | 2016-12-12 | https://www.skatteetaten.no/nn/rettskjelder/type/uttalelser/prinsipputtalelser/egenutviklede-kassasystemer/ |
| NO-4 | [P] Skatteetaten, end-of-day cash reports | n.d. | https://www.skatteetaten.no/rettskilder/type/uttalelser/prinsipputtalelser/serveringssteder--kravet-til-a-skrive-ut-eller-lagre-kassarapporter-i-systemet-ved-dagens-slutt/ |
| DK-1 | [P] Skat, signature guideline v1.5.2 | 2025-04 | https://skat.dk/media/i4xilbvg/guideline-for-implementing-digital-signature-in-digital-cash-registers-v152.pdf |
| DK-2 | [P] Skat, supplier page | n.d. (script 2026-06-12) | https://skat.dk/erhverv/nye-krav-til-digital-salgsregistrering-for-visse-brancher-i-2024/for-leverandoerer-system-til-digital-salgsregistrering |
| BR-1 | [P] SEFAZ-PE, NFC-e contingency | n.d. | https://www.sefaz.pe.gov.br/Servicos/Nota-Fiscal-de-Consumidor-Eletronica/Paginas/contingencia.aspx |
| BR-2 | [S, snippet] Jornal Contábil, cancellation vs inutilização | n.d. | https://jornalcontabil.com.br/noticia/principais-diferencas-entre-cancelamento-carta-de-correcao-e-inutilizacao-de-notas-fiscais/ |
| BR-3 | [S, snippet] Jornal Contábil, 30-minute cancellation | n.d. | https://jornalcontabil.com.br/noticia/cancelamento-nfce-mudanca-no-prazo-muda-de-24h-para-30-min/ |
| MX-1 | [P] SAT, cancellation FAQ | 2026-08-25 | https://www.sat.gob.mx/minisitio/Factura/documentos/PreguntasFrecuentes_CancelacionFactura25082026.pdf |
| MX-2 | [S, snippet] Edifact, 72 hours to stamp | n.d. | https://www.edifact.com.mx/masinfo/72-horas-para-timbrar-fundamento-legal |
| MX-3 | [S, snippet] El Contribuyente, factura global | 2022-01 | https://www.elcontribuyente.mx/2022/01/estos-cambios-tiene-la-factura-global-en-2022/ |
| CO-1 | [P] DIAN Resolución 165/2023 | 2023-11-02 | https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0165_2023.htm |
| CO-2 | [S, snippet] PwC, DIAN draft PR-000924-24 | 2024 | https://legalytributarioenlinea.co.pwc.com/Repositorio%20PwC/PDF/Doctrina/DIAN/Resoluciones/2024/PR-000924-24.pdf |
| CL-1 | [P] SII FAQ 001_380_6569 (CAF) | updated 2026-11-02 | https://www.sii.cl/preguntas_frecuentes/bol_electr_vtas_serv/001_380_6569.htm |
| CL-2 | [P] SII Res. Ex. 74/2020 | 2020-07-02 | https://www.sii.cl//normativa_legislacion/resoluciones/2020/reso74.pdf |
| AR-1 | [P] ARCA, contingencies (CAEA) | n.d. | https://arca.gob.ar/fe/emision-autorizacion/contingencias.asp |
| AR-2 | [S, snippet] vatupdate, RG 5782/2025 | 2025-11-07 | https://www.vatupdate.com/2025/11/07/resolution-5782-2025-arca-introduces-c-a-e-a-for-electronic-invoicing |
| SA-1 | [P] ZATCA, E-Invoicing Implementation Resolution (English) | 2023-05-19 | https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Documents/20230519_E-Invoicing%20Implementation%20Resolution%20English.pdf |
| SA-2 | [P] ZATCA, Simplified Guide | 2022-06-29 | https://zatca.gov.sa/en/E-Invoicing/Introduction/Guidelines/Documents/Simplified%20guide_En.pdf |
| EG-1 | [P] ETA, receipt issuance FAQ | n.d. | https://sdk.invoicing.eta.gov.eg/receiptissuancefaq/ |
| PE-1 | [P, snippet] SUNAT, electronic services operators | n.d. | https://cpe.sunat.gob.pe/informacion_general/operador_servicios_electronicos |
| MY-1 | [S, snippet] RSM Malaysia, consolidated e-invoice | 2025-01-28 | https://www.rsm.global/malaysia/node/352 |
| MY-2 | [P] MyInvois SDK, cancel document | n.d. (©2024) | https://sdk.myinvois.hasil.gov.my/einvoicingapi/03-cancel-document/ |
| IN-1 | [P, snippet] Notification 14/2020-Central Tax | 2020-03-21 | https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-14-central-tax-english-2020.pdf |
| UK-1 | [P] Finance Act 2022, Schedule 14 | 2022 (acts from 2022-02-24) | https://www.legislation.gov.uk/ukpga/2022/3/schedule/14 |
| UK-2 | [P, snippet] HMRC, software for Making Tax Digital | n.d. | https://www.gov.uk/guidance/choose-the-right-software-for-making-tax-digital-for-income-tax |
| AU-1 | [P, snippet] Treasury Laws Amendment (Black Economy Taskforce Measures No. 1) Act 2018 | 2018-10-03 | https://www.legislation.gov.au/C2018A00121/asmade/2018-10-03/text/original/pdf |
| AU-2 | [P, snippet] ATO, electronic sales suppression tools | n.d. | https://ato.gov.au/esst |
| CA-1 | [P] CRA tax alert, electronic suppression of sales | 2025-05-28 | https://www.canada.ca/en/revenue-agency/corporate/about-canada-revenue-agency-cra/tax-alert/electronic-suppression-sales.html |
| US-1 | [P, snippet] Florida Statutes § 213.295 | 2025 | https://www.flsenate.gov/Laws/Statutes/2025/213.295 |
| NZ-1 | [P, snippet] IRD Revenue Alert RA 22/01 | 2022-12-13 | https://www.taxtechnical.ird.govt.nz/revenue-alerts/2022/ra-22-01 |
| IE-1 | [P, snippet] Taxes Consolidation Act 1997, s. 1078 | n.d. | https://www.irishstatutebook.ie/eli/1997/act/39/section/1078 |
| NL-1 | [P, snippet] Belastingdienst, guide to a reliable checkout system | 2023 | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/themaoverstijgend/brochures_en_publicaties/handreiking-voor-een-betrouwbaar-afrekensysteem |
