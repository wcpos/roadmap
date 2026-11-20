# Fiscal rules on editing a finalised sale

**Research note, 2026-11-20.** This note adds to `roadmap/docs/research/2026-09-11-fiscal-compliance-groundwork.md`, called "the groundwork note" below. It answers one question: which facts of a paid POS sale may a store owner change afterwards, when, and how? The facts are cashier, store, till, time, customer, tax ID, payment method, status and custom fields. The answers are taken regime by regime, from primary text wherever it could be opened.

Each claim carries a confidence mark:
- **CONFIRMED**: I read the primary text.
- **SECONDARY**: the claim rests on a vendor or commentary source only.
- **UNCONFIRMED**: I could not verify it.
- **INFERENCE**: my reading. It is not stated law.

---

## 1. Bottom line

| Field | Safe to edit in place with an audit note | Only before closure | Only via a correcting record | Never |
|---|---|---|---|---|
| **Cashier / operator** | Where no fiscal law applies. DE/AT bookkeeping allows it if the old value stays visible (GoBD Rz. 111). | — | **HR**: a cancellation invoice and a new one (Zakon art. 24); the amendment service (Pravilnik art. 11) covers only the payment method and buyer OIB. | **NO**: no function may change registered information (§ 2-6(3)), with no pre-closure exception; the operator is part of the journal record and the Z-report carries figures per operator (§ 2-8-2 h). **HR, never in place**: the operator's OIB is sent to the tax authority with the invoice. **PT**: SAF-T `SourceID` (INFERENCE). |
| **Store / establishment** | — | — | **DE**: master data such as the location (`Stamm_Orte`) may change only after a closure, and re-attributing a sale to another location contradicts the closure it sits in, so not in place before or after (INFERENCE, §2.2). **IT**: the outlet's address is printed on the receipt, so the fix is a void plus a reissue. **PT**: series are per establishment. **HR**: a cancellation invoice and a new one (Zakon art. 24). | **HR, never in place**: the premises code is part of the invoice number. |
| **Register / till** | — | — | — | **FR, DE, AT, HR, NO**: the till ID is part of the protected or signed record. |
| **Sale time** | — | — | — | **All regimes**: it is signed or protected everywhere (TSE, RKSV, VERI\*FACTU, Portuguese hash, French dataset). |
| **Customer & address** | Simplified receipt that prints no buyer (DE GoBD Rz. 37; FR silent). | — | **Full invoice**: DE § 31(5) UStDV, FR art. 289-I-5, ES art. 15.1 RD 1619/2012, UK VAT Notice 700 §19.8. A buyer named in a Spanish VERI\*FACTU record needs a *subsanación*. | — |
| **Customer tax ID** | — | — | **ES** (a *rectificativa* when the issued invoice itself is wrong; a *subsanación* only where no invoice correction is required), **HR** (art. 11, a new invoice), **DE** (§ 31(5)). | **IT**: the buyer's tax code cannot be added after the sale (DM 7/12/2016 art. 4.2). **PT**: the NIF cannot change once documents exist, except to fill a blank or the generic 999999990. |
| **Payment method** | — | — | **DE** (the TSE signs `Zahlungen`, so Storno plus a new receipt), **HR** (art. 11), **FR** (*mode de règlement* is in the protected dataset). | Never in place. |
| **Fulfilment-type status** | **Every regime read is silent.** | — | Any status that cancels or refunds the sale is a void and needs its own record (all regimes). | — |
| **Custom fields** | Yes, if not printed on a fiscal document and not fiscal data. ES: details outside the registro de alta "pudiendo realizarse directamente". | — | If printed on an issued invoice. | — |

**One rule underlies every cell.** A changed fact must leave the original value and the fact of the change recognisable (DE § 146(4) AO, AT § 131 BAO, FR BOFiP §90). Anything signed, chained or already reported cannot change at all; only a new record can supersede it.

---

## 2. Per-regime findings

### 2.1 France: CGI art. 286-I-3° bis, BOI-TVA-DECLA-30-10-30 (version of 01/10/2025)

1. **Operator.** BOFiP's protected dataset (§50) lists the receipt number, the date to the minute, the till number, totals, line detail, payment data and "les traces de modifications et corrections". **It names no operator field.** CONFIRMED. §130 requires that "les enregistrements des règlements réalisés par toute personne qui accède au logiciel ou système de caisse soient mémorisés", which is about who records, not an operator field. CONFIRMED. The only explicit operator identity is for training mode: "l'identification de l'opérateur sous la responsabilité duquel le personnel en formation enregistre les données" (§150). CONFIRMED. NF525 implementations do carry an operator code on every document and in the event journal. SECONDARY (efsta / fiskaltrust docs; the référentiel was not read). **Verdict for France: the law does not fix the cashier; the certification standard probably does.**
2. **Store and till.** "le numéro de la caisse" is in the §50 dataset, so the till cannot change. CONFIRMED. The establishment is not a §50 field. **Silent.**
3. **Buyer data.** No customer field is in §50. **Silent** for the till ticket. For an invoice, "tout document ou message qui modifie la facture initiale et qui y fait référence de façon spécifique et non équivoque est assimilé à une facture" (art. 289-I-5 CGI, as glossed by BOFiP BOI-TVA-DECLA-30-20-20-20). SECONDARY: the BOFiP text was seen in a search excerpt only.
4. **Status.** **Silent.**
5. **Closures.** Daily, monthly and annual closures are "cumulatives et impératives". Their totals must be "intègres et inaltérables" and "ne doivent donc jamais être purgées" (§170). CONFIRMED. BOFiP says nothing about per-operator totals. Whether transactions inside a closed period may change is not stated beyond §90. **Silent.**
6. **Audit trail.** "ces corrections (modifications ou annulations) s'effectuent par des opérations de « plus » et de « moins »". Their "inaltérabilité doit également être garantie". "les données enregistrées ne peuvent pas être modifiées sans laisser de trace" (§90). Access is required "au détail daté (année-mois-jour-heure-minute) des opérations et des corrections apportées" (§100). The software "doit empêcher leur suppression ou modification sans laisser de trace" (§130). CONFIRMED. Gloss: corrections are plus and minus entries, they are themselves tamper-proof, and each is dated to the minute.

URL: https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20251001

### 2.2 Germany: § 146 / § 146a AO, KassenSichV, GoBD, DSFinV-K 2.4

1. **Operator.**
   - The TSE does **not** sign the operator. The `Kassenbeleg-V1` signed data is `<Vorgangstyp>^<Brutto-Steuerumsätze>^<Zahlungen>` (DSFinV-K 2.4, Anhang). CONFIRMED.
   - KassenSichV § 2 (the transaction contents) and § 6 (the receipt contents) do not mention an operator. CONFIRMED.
   - The operator **is** a per-transaction field of the audit export: Bonkopf `BEDIENER_ID`, "Unternehmensinterne Kennung der Person, die den Vorgang erfasst", and `BEDIENER_NAME`. CONFIRMED. DSFinV-K also says "Jeder einzelne Kassenbeleg muss aus den Daten inhaltlich reproduzierbar sein". CONFIRMED.
   - Changing the operator is not addressed directly. Under GoBD Rz. 111 (below), a change is lawful only if the original stays recognisable. INFERENCE.
   - INFERENCE: if WCPOS prints the cashier's name on the receipt, the export must still reproduce the receipt as issued. The write-once snapshot already does that.
2. **Store and till.**
   - Every DSFinV-K record carries `Z_KASSE_ID` ("ID der (Abschluss-) Kasse"). CONFIRMED.
   - Locations sit in `Stamm_Orte` ("Namen und Orte der einzelnen Betriebsstätten mit Kassen"), and master data is stored per closure: "Werden Änderungen an den … Stammdaten vorgenommen, ist zuvor automatisch ein Abschluss zu erstellen." CONFIRMED.
   - So a sale's location is the location of its till's closure. Re-attributing one sale to another store contradicts the closure it sits in. INFERENCE.
3. **Buyer data.**
   - Bonkopf has `KUNDE_NAME`, `KUNDE_ID`, address fields and `KUNDE_USTID`. CONFIRMED.
   - GoBD Rz. 37 allows a retail till that records no customer: "Die Namen der Kunden werden bei Bargeschäften nicht erfasst … – Keine Beanstandung." CONFIRMED.
   - Full invoice: "Es müssen nur die fehlenden oder unzutreffenden Angaben durch ein Dokument, das spezifisch und eindeutig auf die Rechnung bezogen ist, übermittelt werden" (§ 31(5) UStDV). CONFIRMED. Gloss: an invoice is corrected by a separate document that refers to it, not by editing it.
   - A Kleinbetragsrechnung (≤ €250) needs no buyer.
4. **Status.** **Silent.** A later cancellation is a "nachträgliche Vorgangs-Stornierung": "Der Ursprungsbeleg bleibt unverändert. Der Stornobeleg ist ein separater Beleg" (DSFinV-K 4.2.2). CONFIRMED. Gloss: the original receipt is left alone and the cancellation is its own receipt.
5. **Closures.** The Kassenabschluss has a "Buchungsbeleg-Funktion" and must be stored digitally. CONFIRMED. DSFinV-K 2.4's closure files have **no per-operator split**. CONFIRMED by reading the field lists. DSFinV-K 3.0, binding from 2029, was not read.
6. **Audit trail.**
   - "Eine Buchung oder eine Aufzeichnung darf nicht in einer Weise verändert werden, dass der ursprüngliche Inhalt nicht mehr feststellbar ist" (§ 146(4) AO). CONFIRMED.
   - "Spätere Änderungen sind ausschließlich so vorzunehmen, dass sowohl der ursprüngliche Inhalt als auch die Tatsache, dass Veränderungen vorgenommen wurden, erkennbar bleiben … Auch eine Änderungshistorie darf nicht nachträglich veränderbar sein" (GoBD 2019 Rz. 111). CONFIRMED. Gloss: keep the old value, show that it changed, and never let the history itself be edited.
   - Rz. 59: changes "müssen … so protokolliert werden". CONFIRMED.
   - Rz. 109 forbids keeping entries "unprotokolliert" editable. CONFIRMED.
   - The GoBD do not list the log's fields (who, when). **Silent** on the exact fields; who, when, old and new value is the natural reading. INFERENCE.
   - **This binds all bookkeeping, certified or not.**

URLs:
- https://www.gesetze-im-internet.de/ao_1977/__146.html
- https://www.gesetze-im-internet.de/kassensichv/__2.html
- https://www.gesetze-im-internet.de/kassensichv/__6.html
- https://www.gesetze-im-internet.de/ustdv_1980/__31.html
- GoBD 2019 (LfSt Bayern copy): https://www.lfst.bayern.de/fileadmin/RESSOURCEN/INFORMATIONEN/Steuerinfos/Weitere_Themen/Aussenpruefung/2019-11-28-GoBD-1.pdf
- DSFinV-K 2.4 zip: https://www.bzst.de/SharedDocs/Downloads/DE/Aussenpruefung/dsfinv_k_v_2_4.zip

### 2.3 Austria: RKSV, BAO

1. **Operator.** The RKSV text does not mention a cashier or operator. The signed data (§ 9(2)) is the till ID, the receipt number, the date and time, the amounts per VAT rate, the encrypted turnover counter, the certificate serial and the chained previous signature. CONFIRMED. **Silent.**
2. **Store and till.** The Kassenidentifikationsnummer is signed, so the till can never change. CONFIRMED. The establishment is **silent** in the RKSV.
3. **Buyer data.** Not in the signed data. **Silent** in the RKSV. The invoice rules of § 11 UStG were not read. UNCONFIRMED.
4. **Status.** **Silent.**
5. **Closures.** The Monatsbeleg and Jahresbeleg are signed zero-amount receipts carrying the turnover counter (§ 8). CONFIRMED. **No per-operator figures.**
6. **Audit trail.**
   - Storno and training entries are signed, written to the DEP and labelled: "Belege für Trainings- und Stornobuchungen sind ausdrücklich als solche zu bezeichnen" (§ 11(3)). CONFIRMED.
   - Where records are kept on a data carrier, an entry must not be changed so "dass der ursprüngliche Inhalt" is lost (§ 131(1) Z 6 lit b BAO). CONFIRMED. **This binds all bookkeeping.**

URLs:
- https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20009390
- https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10003940&Paragraf=131

### 2.4 Spain: RD 1007/2023 (VERI\*FACTU), RD 1619/2012

1. **Operator.** The registro de alta (art. 10.1) contains no operator, user or employee field. CONFIRMED. **Silent.**
2. **Store and till.** No establishment or till field. There are only the system's identity and "características … de su instalación" (art. 10.1.o). CONFIRMED. **Silent.**
3. **Buyer data.**
   - The record carries the destinatario's NIF and name "cuando sean obligatorios" (art. 10.1.b). CONFIRMED.
   - AEAT's FAQ:
     - "no podrá alterarse o manipularse el primer registro de facturación". Gloss: the first record can never be altered.
     - "deberá generarse otro registro que complete, modifique o anule el contenido del anterior". Gloss: a new record must complete, change or cancel it.
     - For "menciones de la factura que no estén contempladas en el «registro de facturación de alta»", "la subsanación no exigirá generar un nuevo registro, pudiendo realizarse directamente". Gloss: details the record does not hold may be corrected directly.
     - CONFIRMED.
   - RD 1619/2012:
     - "Deberá expedirse una factura rectificativa en los casos en que la factura original no cumpla alguno de los requisitos" of arts. 6 and 7 (art. 15.1). Art. 6 includes the recipient's NIF and domicile on a complete invoice. CONFIRMED.
     - Issuing a full invoice in exchange for a simplified one is **not** a rectificativa if the simplified one met art. 7.1 (art. 15.6). CONFIRMED.
   - So, on a simplified ticket, adding a buyer later goes through a substitute full invoice. Changing a wrong buyer on an issued full invoice needs a rectificativa; a subsanación record alone is not an alternative, because AEAT reserves it for errors in the billing record that do not require correcting the invoice. The address is not in the registro, so it can be fixed "directamente" in VERI\*FACTU terms, but RD 1619 still asks for a rectificativa on a complete invoice. INFERENCE from the two texts together.
4. **Status.** **Silent.**
5. **Closures.** None: Spain is not a closure regime (groundwork note §2).
6. **Audit trail.**
   - The record must not be alterable "sin que el sistema informático lo detecte y avise de ello" (art. 8.2.a). CONFIRMED.
   - The registro de eventos (art. 8.3) records "determinadas interacciones" automatically. Its field list sits in Orden HAC/1177/2024 and was not read. UNCONFIRMED.
   - In VERI\*FACTU mode the event log is waived (groundwork note).

URLs:
- https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840
- https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696
- https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/registros-facturacion-alta.html

TicketBAI was not re-read. Its correction model is UNCONFIRMED (groundwork note §7).

### 2.5 Italy: documento commerciale (DM 7 December 2016)

1. **Operator.** Not among the required contents. **Silent.**
2. **Store.** The minimum contents include "e) ubicazione dell'esercizio" (art. 2). CONFIRMED. Gloss: the outlet's location is printed on the document. Once the document is issued, the store is a printed fiscal fact and cannot be edited. INFERENCE. The RT device serial is on the document too. SECONDARY.
3. **Buyer data.** For fiscal effect the document carries "anche il codice fiscale o il numero di partita IVA dell'acquirente" (art. 4.1). Its issue is mandatory "se è richiesta dall'acquirente non oltre il momento di effettuazione dell'operazione" (art. 4.2). CONFIRMED. Gloss: the buyer's tax code must be requested at or before the sale, so it cannot be added afterwards.
4. **Status.** **Silent.**
5. **Closures.** The daily corrispettivi are transmitted (groundwork note). Once sent, they are the authority's data, not ours.
6. **Corrections.** A reso or annullamento document must cite the original document commerciale. SECONDARY (pmi.it, fiscoetasse); the RT specification body was not read.

URL: https://www.fiscoetasse.com/files/9244/decreto-mef-7-12-2016.pdf (a Gazzetta Ufficiale print copy)

### 2.6 Portugal: certified software, SAF-T (PT)

1. **Operator.**
   - SAF-T (PT) records, per document, `SourceID` = "Utilizador que gerou o documento" (field 4.1.4.10, mandatory). It also records, per status, the "Utilizador responsável pelo estado atual do documento" (4.1.4.3.4). CONFIRMED (Portaria 302/2016).
   - Certification rule 1.11: "A aplicação não pode permitir que num documento já assinado seja alterada qualquer informação fiscalmente relevante." Gloss: nothing fiscally relevant may change on a signed document. CONFIRMED (Despacho 8632/2014, via informador.pt).
   - Whether `SourceID` counts as "fiscalmente relevante" is not defined. Treating it as frozen is INFERENCE.
   - Rule 3.3.6 forbids reusing user codes once they have made fiscally relevant movements. CONFIRMED.
2. **Store.** A series code must be "específico de cada um dos estabelecimentos e ou programa(s)" (1.8). CONFIRMED. Gloss: the document number already encodes the establishment.
3. **Buyer data.**
   - Forbidden: "A alteração do NIF, numa ficha de cliente já existente e com documentos emitidos" (3.3.3), except filling a missing NIF or replacing the generic 999999990. CONFIRMED.
   - Name changes are likewise forbidden while no NIF is on the file (3.3.4). CONFIRMED.
   - Corrections to the taxable amount or the tax use "documentos retificativos de faturas" that identify the corrected document (2.2.6, 1.4). CONFIRMED.
   - A wrong buyer detail is NOT corrected that way. AT binding ruling 10376 (2016-05-19), §10: cancelling the invoice ("anulação de faturas") is the procedure when the correction is due to "motivos não relacionados com a alteração do valor tributável ou do imposto correspondente (ex. erro na indicação do NIF do adquirente)"; §11: value and tax corrections go "exclusivamente" through a documento retificativo. So a wrong buyer NIF is a cancellation and a new invoice. CONFIRMED (ruling read). https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/documents/informacao_10376.pdf
4. **Status.** The SAF-T status (Normal / Anulado, etc.) is fiscal. Fulfilment status is **silent**.
5. **Closures.** Not a closure regime.
6. **Audit trail.** Every status change records the user, the date and time, and the reason (4.1.4.3.x). CONFIRMED.

URLs:
- https://informador.pt/legislacao/diploma/despacho-n-o-8632-2014/
- https://antigo.occ.pt/fotos/editor2/dr_portaria302-2016.pdf

### 2.7 Croatia: Zakon o fiskalizaciji (NN 89/25), Pravilnik (NN 153/25). The strictest regime found.

1. **Operator.** The request to the tax authority carries "OIB operatera na uređaju za izdavanje računa koji izdaje račun" as a mandatory field (Privitak 1). Gloss: the issuing operator's personal ID. CONFIRMED.
2. **Store and till.** The premises code is "jedinstvena na razini OIB-a obveznika", and the device code is unique per premises. Both are part of the invoice number. CONFIRMED.
3. **Buyer data and the decisive rule.** Art. 11(1): "Ako obveznik fiskalizacije računa ima potrebu promijeniti podatak o načinu plaćanja i/ili OIB-u primatelja računa … odmah izdaje kupcu račun kojim se taj podatak ispravlja." Gloss: if the seller must change the payment method or the buyer's OIB, it immediately issues the customer an invoice correcting that datum. CONFIRMED. **Only these two data may change, only through a new invoice and message. The operator, premises and device are not on the list.**
4. **Status.** **Silent.**
5. **Closures.** Not read.
6. **Audit trail.** The change goes to the tax authority's system as an XML request (Privitak 3). CONFIRMED.

URL: https://narodne-novine.nn.hr/clanci/sluzbeni/2025_12_153_2278.html

### 2.8 Norway: kassasystemforskriften (FOR-2015-12-18-1616). Per-operator Z.

1. **Operator.**
   - "Dersom kassasystemet har funksjonar for identifikasjon av den enkelte operatør … skal elektronisk journal innehalde opplysningar om vedkomande sitt namn eller tilsettnummer i samband med salstransaksjonane" (§ 2-7(5)). Gloss: if the system identifies operators, the journal must hold each operator's name or staff number against their sales. CONFIRMED.
   - The X-report carries "talet på kontantsal og beløp fordelt på ulike betalingsmiddel spesifisert for kvar enkelt operatør, dersom kassasystemet har funksjonar for dette" (§ 2-8-2 h), and the Z-report contains at least the X-report contents (§ 2-8-3(1)). Gloss: cash-sale counts and amounts by payment method, per operator, if the system can do that. CONFIRMED.
2. **Till.** The cash point ID is on the reports (§ 2-8-2 d). CONFIRMED. The establishment is **silent**.
3. **Buyer data.** Not read. UNCONFIRMED.
4. **Status.** **Silent.**
5. **Closures.** "Z-rapporten kan ikkje innehalde registreringar som er omfatta av ein tidlegare Z-rapport" (§ 2-8-3). Gloss: a Z-report cannot contain registrations covered by an earlier Z-report. CONFIRMED. Combined with per-operator Z figures, re-attributing a sale's cashier after its Z contradicts a closed, numbered report. INFERENCE.
6. **Audit trail.** The journal is "sikra mot endring og sletting" (§ 2-7(1)). The system must have no user function to "ta bort, endre eller legge til opplysningar i registreringane" (§ 2-6(3)). Gloss: no user may remove, change or add data in registrations. CONFIRMED. Corrections take a "Returkvittering" (§ 2-8-5). CONFIRMED.

URL: https://lovdata.no/dokument/SF/forskrift/2015-12-18-1616

### 2.9 Jurisdictions without fiscalisation law

- **UK (HMRC).**
  - The VAT record "must contain all the information that must be shown on VAT invoices" (VAT Notice 700 §19.4.1). CONFIRMED.
  - VAT errors are corrected "by issuing a credit note", which "should bear a reference to the number and date of that VAT invoice" (§19.8). CONFIRMED.
  - Retailers issuing less detailed invoices need not keep copies (§19.3). CONFIRMED.
  - Making Tax Digital was not read; nothing in it is known to touch the operator or store. **Silent / UNCONFIRMED.**
  - URL: https://www.gov.uk/guidance/vat-guide-notice-700
- **US (IRS).**
  - "The taxpayer must ensure that its machine-sensible records contain sufficient transaction-level detail so that the information and the source documents underlying the machine-sensible records can be identified" (Rev. Proc. 98-25 §5.01(3)). CONFIRMED.
  - Rev. Proc. 98-25 is silent on the operator and on how edits are made.
  - State anti-zapper statutes were not read. UNCONFIRMED.
  - URL: https://www.eitc.irs.gov/pub/irs-drop/rp-98-25.pdf
- **Australia (ATO).**
  - A tool is an ESST if "(a) it is capable of falsifying, manipulating, hiding, obfuscating, destroying, or preventing the creation of, a record that (i) an entity is required by a taxation law to keep … and (ii) is … created by … an electronic point of sale system; (b) a reasonable person would conclude that one of its principal functions is to falsify, manipulate, hide, obfuscate, destroy, or prevent the creation of, such records" (TAA 1953 s 8WAB). CONFIRMED.
  - Producing or supplying one carries 5,000 penalty units (s 8WAC). CONFIRMED.
  - An audited cashier or store edit is not that. INFERENCE. An unlogged edit that moves takings between people or stores, or a status flip that hides a paid sale from reports, is the profile the section describes.
  - URL: https://www.legislation.gov.au/C2018A00121/asmade/2018-10-03/text/original/pdf
- **Canada / Quebec (MEV-WEB).** It covers restaurants and bars only (SECONDARY). Not researched.

---

## 3. What this means for WCPOS

### Today: no certified build, no regime-specific signing

- **WCPOS implements no fiscalisation regime today, and that is not an exemption from one.** A merchant in a jurisdiction that requires a fiscalised till (the TSE under § 146a AO in Germany, the RKSV in Austria, the RT in Italy, certified software in Portugal, Croatia's fiscalisation, Norway's cash-register rules) is bound by that law whether or not the software implements it. Whether WCPOS may lawfully be used as the till in each of those regimes is a separate question, and this note does not answer it.
- What this section answers is narrower: **which attribution edits the current architecture can make without destroying the record.** The yardstick is the general bookkeeping rule that applies to every system's data: § 146(4) AO and GoBD Rz. 111 in Germany, § 131 BAO in Austria, BOFiP's "sans laisser de trace" in France, and the Australian ESST definition. All of them allow a change to data that is not signed, provided the original value and the fact of change stay recognisable and the history itself is immutable. Meeting them is necessary everywhere and sufficient only where no fiscalisation law applies.
- So an edit screen for cashier and store is consistent with those bookkeeping rules **if all of the following hold**:
  - **Write-once fields stay untouched.** `_wcpos_receipt_snapshot` and `_pos_user_created` already are write-once (wiki: `pos-order-audit-meta.md`). The edit must never touch them, so the receipt as issued stays reproducible. That matches DSFinV-K's "Jeder einzelne Kassenbeleg muss … reproduzierbar sein".
  - **Every edit writes an append-only entry** with who, when, field, old value and new value. An order note alone is not enough: it can be deleted, and GoBD says "Auch eine Änderungshistorie darf nicht nachträglich veränderbar sein".
  - **Stored closure figures are never recomputed.** If a closure or Z exists for the sale's session, the stored figures stay as closed. Reports should show the edit as a later change, not rewrite the closed period. Norway (§ 2-8-3) and France (§170) both make the closure immutable. Whether 2.0's register-session closures are stored documents was not checked here. Verify.
- **Store edits have a money side-effect.** Pro moves an order's tax location to `_pos_store` (wiki, woocommerce-pos#1545). Any recalculation after a store edit would change the tax on a paid sale, and that is a money correction under every regime. The store edit must not trigger `calculate_totals()`. Stating this is INFERENCE from the wiki; the code path was not checked.
- **Locked fields stay locked.** Till, time, payment method and totals remain correctly locked. Payment method is changeable only through a correcting record (Croatia art. 11, the German TSE, the French dataset).
- **Status edits.** Processing ↔ completed and custom fulfilment statuses are silent everywhere. A status that cancels, refunds or hides a paid sale is a void: it needs G4, not an edit.

### A future certified or fiscalised build

- **G6, the event log**, becomes the home for attribution changes: an event type such as `attribution_changed`, never an in-place edit of a signed record. This is the French "trace", the Spanish *registro de eventos* and the German Protokoll.
- **G4, corrections are records.** In Croatia and Portugal, and wherever the store is printed (Italy), a store or cashier change is a void of the original plus a reissue. In Croatia the *amendment* service (Pravilnik art. 11) covers only the payment method and the buyer's OIB; any other wrong detail is corrected by a cancellation invoice (*storniranje računa*, Zakon art. 24, which applies the ordinary invoicing obligations to the storno and names no field restriction) and a new invoice. In a Croatian or Portuguese build the cashier and store fields must be **read-only after issue**, with cancel-and-reissue as the correction path.
- **G3, the closure as a stored document.** With per-operator Z figures (Norway; NF525 probably), the original attribution is never edited, before or after the session's Z: Norway's § 2-6(3) has no pre-closure exception. A change of operator can only be a separate correcting record that leaves the registration as made; whether a later closure reports it as an adjustment is a design question for that build.
- **Buyer data.** A full-invoice build needs a "corrective document" path: a *rectificativa* in Spain, a § 31(5) document in Germany, art. 289-I-5 in France. For simplified receipts, a "convert to full invoice" path is needed (Spain art. 15.6). Italy forbids adding the buyer's tax code after the sale.

---

## 4. Unconfirmed

- The NF525 référentiel's operator, closure and edit rules: SECONDARY only. The référentiel is paid and was not read.
- The French art. 289-I-5 CGI wording: seen only in a BOFiP search excerpt.
- The field list of the Spanish *registro de eventos* (Orden HAC/1177/2024): not read.
- Corrections under TicketBAI.
- Austria: the § 11 UStG invoice-correction rules.
- Italy: the reso and annullamento procedure in Specifiche Tecniche RT (SECONDARY).
- Whether the device serial is on the Italian documento commerciale.
- Whether Portugal's SAF-T `SourceID` counts as "informação fiscalmente relevante" under rule 1.11.
- Portugal: the content of the signature hash input (believed to be the date, entry time, number, total and previous hash; not re-read).
- Germany: DSFinV-K 3.0, binding from 2029, was not read, and the GoBD 2024/2025 consolidated text was not checked for renumbering. Rz. 111 is quoted from the 2019 text.
- Croatia: the closure rules, and the last ~7k characters of the Pravilnik.
- Norway: the buyer-data rules.
- Not researched at all: Sweden (SKVFS 2014:9), Belgium GKS/SCE, Poland, Slovenia, Hungary, Quebec MEV-WEB, US state anti-zapper laws, and UK Making Tax Digital.
- Whether WCPOS 2.0's register-session closure is a stored, immutable document, and whether a store edit recomputes tax.

---

## 5. Sources

Primary, read:
- BOFiP BOI-TVA-DECLA-30-10-30 (01/10/2025): https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20251001
- AO § 146: https://www.gesetze-im-internet.de/ao_1977/__146.html
- KassenSichV § 2: https://www.gesetze-im-internet.de/kassensichv/__2.html
- KassenSichV § 6: https://www.gesetze-im-internet.de/kassensichv/__6.html
- UStDV § 31: https://www.gesetze-im-internet.de/ustdv_1980/__31.html
- GoBD 2019 (BMF, 28 Nov 2019, LfSt Bayern copy): https://www.lfst.bayern.de/fileadmin/RESSOURCEN/INFORMATIONEN/Steuerinfos/Weitere_Themen/Aussenpruefung/2019-11-28-GoBD-1.pdf
- DSFinV-K 2.4, with the AEAO zu § 146a of 30 June 2023 (BZSt zip): https://www.bzst.de/SharedDocs/Downloads/DE/Aussenpruefung/dsfinv_k_v_2_4.zip
- DSFinV-K versions index: https://www.bzst.de/DE/Unternehmen/Aussenpruefungen/DigitaleSchnittstelleFinV/digitaleschnittstellefinv_node.html
- RKSV: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20009390
- BAO § 131: https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10003940&Paragraf=131
- RD 1007/2023: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840
- RD 1619/2012: https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696
- AEAT VERI\*FACTU FAQ, registros de alta: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/registros-facturacion-alta.html
- DM 7 dicembre 2016 (GU print copy): https://www.fiscoetasse.com/files/9244/decreto-mef-7-12-2016.pdf
- Despacho 8632/2014 (informador.pt consolidation): https://informador.pt/legislacao/diploma/despacho-n-o-8632-2014/
- Portaria 302/2016, SAF-T (PT): https://antigo.occ.pt/fotos/editor2/dr_portaria302-2016.pdf
- Croatian Pravilnik, NN 153/2025: https://narodne-novine.nn.hr/clanci/sluzbeni/2025_12_153_2278.html
- Norwegian kassasystemforskriften: https://lovdata.no/dokument/SF/forskrift/2015-12-18-1616
- HMRC VAT Notice 700: https://www.gov.uk/guidance/vat-guide-notice-700
- IRS Rev. Proc. 98-25: https://www.eitc.irs.gov/pub/irs-drop/rp-98-25.pdf
- Treasury Laws Amendment (Black Economy Taskforce Measures No. 1) Act 2018, s 8WAB TAA: https://www.legislation.gov.au/C2018A00121/asmade/2018-10-03/text/original/pdf

Secondary:
- NF525 operator code: efsta, https://docs.efsta.net/efr/FR/infocert ; fiskaltrust, https://fiskaltrust.eu/media/fiskaltrust-guide-utilisateur-administration-fiscale.pdf
- Italian reso and annullamento: https://www.pmi.it/?p=316271
- French art. 289-I-5 gloss, BOFiP BOI-TVA-DECLA-30-20-20-20 (search excerpt): https://bofip.impots.gouv.fr/bofip/142-PGP.html/identifiant=BOI-TVA-DECLA-30-20-20-20-20190925

Local:
- `/Users/kilbot/Projects/roadmap/docs/research/2026-09-11-fiscal-compliance-groundwork.md`
- `/Users/kilbot/Projects/wiki/architecture/plugin-free/pos-order-audit-meta.md`
