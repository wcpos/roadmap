# Fiscal obligations and dates for cash-register / invoicing software (as of 2026-11-23)

**Summary.** Spain's Veri\*factu dates in force are still 1 Jan 2027 (corporate taxpayers) and 1 Jul 2027 (everyone else); the Ministry announced a move to October 2028 on 5 Oct 2026, but no BOE text exists yet. France restored publisher self-attestation from 21 Feb 2026, and no deadline is pending there. Germany requires a certified TSE today (cloud TSE accepted) and has a bill, not yet law, that would require cash registers from 1 Jan 2028. Czechia's EET 2.0 starts 1 Jan 2027.

Context: obligations for the vendor of a self-hosted WooCommerce point-of-sale plugin and app sold worldwide. This is web research only; nothing here is legal advice.

Labels:
- **[Primary]**: confirmed from a tax-authority, ministry, parliament or official-gazette source.
- **[Secondary]**: from an advisory firm, chamber or vendor source.
- **[Memory]**: from prior knowledge, not re-fetched.
- **[Unverified]**: not confirmed.
- **[Inferred]**: a conclusion drawn from the above.

## 1. Spain: Veri\*factu (RD 1007/2023)

### Dates in force

- **[Primary]** Corporate income tax (IS) taxpayers must have adapted systems before **1 Jan 2027**. All other taxpayers have until **1 Jul 2027**.
  - Set by Real Decreto-ley 15/2025 (2 Dec 2025, BOE 3 Dec 2025), which amended DF 4ª of RD 1007/2023.
  - Source: consolidated text at https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840 (last update 03/12/2025; earlier amendment by RD 254/2025, BOE-A-2025-6600).
  - The AEAT note at https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html (updated 13 Oct 2026) gives the same dates.
- **[Secondary]** Congress validated RDL 15/2025 on 11 Dec 2025. Source: https://web.icam.es/se-retrasa-al-2027-la-entrada-en-vigor-de-verifactu-la-nueva-normativa-de-facturacion-electronica/

### Announced postponement (not law)

- **[Primary]** A Ministry of Finance (Hacienda) press note dated **5 Oct 2026** announces a planned postponement of all pending obligations under RD 1007/2023 **to October 2028**.
  - Purpose: to coincide with mandatory e-invoicing for businesses with turnover up to €8M.
  - It says the integrity, conservation, traceability and inalterability requirements stay "en términos sustancialmente equivalentes".
  - Source: https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf
- **[Unverified]** That the postponement has been enacted. No BOE text was found, and the BOE consolidated text still shows 2027. A secondary source agrees that as of 1 Nov 2026 it was unpublished: https://www.zxabogados.com/es/recursos/verifactu-2027/

### What the software producer must do

- **[Primary]** Sign a *declaración responsable* (art. 13 RRSIF). It must be visible inside the software, delivered to buyers, and kept for every version. No external certifier is involved.
  - Sources: the BOE text above, and the AEAT FAQ at https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/certificacion-sistemas-informaticos-declaracion-responsable.html
  - For multi-component systems, each component maker declares; see the AEAT developer FAQ (4 Dec 2025): https://sede.agenciatributaria.gob.es/static_files/AEAT_Desarrolladores/EEDD/IVA/VERI-FACTU/FAQs-Desarrolladores.pdf
- **[Primary]** Technical duties come from RD 1007/2023 and Orden HAC/1177/2024 (https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138):
  - chained hash of the billing records;
  - QR code on the invoice;
  - an event log;
  - either the "VERI\*FACTU" mode, which submits records to AEAT in real time, or a non-submitting mode with signed records.
- **[Primary]** Producers had to offer fully adapted products within 9 months of the Order entering into force, which the AEAT FAQ gives as **29 Jul 2025**. Source: https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html (updated 21 Oct 2026).
- **[Inferred]** Since 29 Jul 2025, producing or selling non-compliant software exposes the producer to the art. 201 bis LGT penalty. **[Memory]** That penalty is €150,000 per financial year per type of system; the amount was not re-checked.

### Does it apply to POS receipts?

- **[Primary]** Yes. The AEAT FAQ (updated 21 Oct 2026, URL above) says "Las facturas simplificadas están sometidas al RRSIF".
  - A cash register is in scope as soon as it issues what amounts to a simplified invoice.
  - Excluded: SII taxpayers, and taxpayers under Basque or Navarre foral direct-tax rules.

### TicketBAI (Basque provinces)

- **[Primary]** Applies in Álava, Gipuzkoa and Bizkaia instead of Veri\*factu (AEAT FAQ above).
- **[Secondary]** Bizkaia: companies from 2024, the self-employed completed in 2026. Source: https://www.easyap.com/en/blog/ticketbai-bizkaia-cuando-entro-en-vigor/
- **[Unverified]** The foral software registration requirements. The foral tax offices' sites were not checked.

## 2. France: art. 286-I-3° bis CGI

- **[Primary]** Who is in scope: VAT-registered businesses recording customer payments without an invoice (B2C) on cash software or systems.
  - Conditions: inalterability, security, retention and archiving.
  - Out of scope: franchise-en-base businesses and businesses selling only B2B.
- **[Primary]** Law 2025-127 (art. 43) had removed the self-attestation route. **Law 2026-103 of 19 Feb 2026, art. 125, restored the publisher's individual attestation from 21 Feb 2026.**
  - Source: BOFiP BOI-TVA-DECLA-30-10-30-20260325 (version of 25 Mar 2026), https://bofip.impots.gouv.fr/bofip/10691-PGP.html
- **[Primary]** How compliance is proven today: **either** a certificate from an accredited body (accreditation in France or another EU state) **or** the publisher's individual attestation on the model BOI-LETTRE-000242. The attestation names the software, its version and the acquisition date. Same BOFiP source.
- **[Primary]** Foreign publishers may attest in French or with a certified translation. For open-source software, the user business may be treated as the publisher. Same BOFiP source.
- **[Secondary]** The earlier BOFiP (1 Oct 2025) set a "certificate required from 1 Sep 2026" deadline. The current BOFiP no longer states it.
  - Sources: https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20251001 and https://www.legifiscal.fr/actualites-fiscales/4255-fin-auto-certification-logiciels-caisse-report-1er-septembre-2026.html
  - **[Inferred]** That deadline is obsolete.
- **[Inferred]** No upcoming deadline.
- **[Memory]** The art. 1770 duodecies fine is €7,500 per system; not re-fetched.

## 3. Germany: KassenSichV / TSE / reporting duty

- **[Memory]** Current law (§ 146a AO, KassenSichV) requires:
  - a **BSI-certified TSE**, in hardware or cloud form;
  - the DSFinV-K export;
  - receipt fields.
  - The cash software itself is not certified, so integrating a certified cloud TSE meets the TSE requirement.
  - **[Primary]** Supporting this, the government bill below restates that recordings are protected by a "zertifizierte technische Sicherheitseinrichtung" and exported in DSFinV-K.
- **[Primary]** Reporting duty: reports must be made through ELSTER, available since 1 Jan 2025.
  - Systems bought before 1 Jul 2025 had to be reported by 31 Jul 2025.
  - Any purchase or retirement after that date must be reported within one month (§ 146a Abs. 4 AO; BMF letter of 28 Jun 2024).
  - Source: https://www.finanzamt.nrw.de/en/node/1790 (undated page).
- **[Secondary]** 2nd KassenSichV amendment: BGBl. 2026 I Nr. 10, in force 1 Feb 2026. It is mainly editorial (odometers, BMF rights in certification). Source: https://kpmg.com/de/de/themen/2026/01/2-vo-aend-kassensichvo-bgbl.html (Jan 2026).
- **[Primary]** A **draft law, not yet passed**: *Entwurf eines Gesetzes zur Fortentwicklung von Kassenaufzeichnungen …*, BR-Drs. 585/26 of 9 Oct 2026 (Bundesrat comment period ended 20 Nov 2026; flagged urgent).
  - Cash register required from **1 Jan 2028** for businesses with turnover over €100,000.
  - Paper receipts replaced by a technology-neutral digital receipt duty.
  - Sources: https://dserver.bundestag.de/brd/2026/0585-26.pdf and the BMF press release of 23 Sep 2026, https://www.bundesfinanzministerium.de/Content/DE/Pressemitteilungen/Finanzpolitik/2026/09/2026-09-23-digitale-belege-und-digitale-kassen.html
- **[Secondary]** Further detail on the draft, from https://www.ihk.de/koeln/hauptnavigation/recht-steuern/steuern/bundesregierung-beschliesst-kassenpflicht-7183040 (undated):
  - exemption when cash takings are €12,000 or less;
  - the reference year is 2026; businesses that first cross the threshold later are covered from 1 Jul of the following year;
  - a new criminal offence for distributing manipulation software.

## 4. Austria: RKSV

- **[Primary]** Source: the BMF FinanzOnline handbook, version of 7 Jan 2021, https://finanzonline.bmf.gv.at/eLearning/BMF_Handbuch_Registrierkassen.pdf
- What a software till must do:
  - sign every receipt through a signature or seal creation unit holding a certificate from a qualified trust provider;
  - chain the receipts and record them in the DEP data log;
  - print the machine-readable code on each receipt;
  - register the signature unit and the register in FinanzOnline;
  - create a start receipt, check it (BMF Belegcheck app), and record it as the first DEP entry, within one week of commissioning (§ 6 Abs. 3 RKSV).
- **[Inferred]** The signature unit can be a hardware card or an HSM/cloud signing service, so it can be integrated.
- **[Memory]** The obligation applies above €15,000 turnover with more than €7,500 in cash sales.

## 5. Other markets

- **Italy**
  - **[Primary]** Merchants use an approved RT fiscal device or the Agenzia's web procedure.
  - **[Primary]** Software-only route: the product must be approved and the provider ("Erogatore") accredited and bound by an agreement with the Agenzia. Source: Provv. 111204 of 7 Mar 2025, https://www.agenziaentrate.gov.it/portale/documents/20143/8792480/ProvvSSW-111204-2025.pdf
  - **[Unverified]** When accreditation opens. A secondary source says 15 Mar 2027 (https://www.italiaoggi.it/diritto-e-fisco/fisco/scontrini-digitali-velocizzatori-nel-mirino-boom-di-applicativi-pos-che-dialogano-con-le-entrate-m4yjx74k), and another says late 2026.
  - **[Primary]** Card terminals must be linked to the RT for transactions from 1 Jan 2026. Source: Provv. 424470 of 31 Oct 2025, https://www.agenziaentrate.gov.it/portale/documents/20143/9354005/provvedimento-del-31-ottobre-2025.pdf
- **Portugal**
  - **[Memory]** Invoicing software must be AT-certified (Portaria 363/2010).
  - **[Secondary]** ATCUD and QR codes are mandatory now (https://invoicexpress.com/blog/regras-faturacao-contabilidade-2026/).
  - **[Unverified]** A qualified e-signature on PDF invoices from 1 Jan 2027 (secondary: https://edicomgroup.com/pt/blog/declaracao-saft-portugal).
  - **[Primary]** AT certification page: https://info.portaldasfinancas.gov.pt/pt/apoio_ao_contribuinte/Negocios/Faturacao/Regras_mecanismos_comunicacao/Certificacao_programas/Paginas/default.aspx (not fetched).
- **Poland**
  - **[Primary]** Requirements for software cash registers are set by Dz.U. 2025 poz. 861 (25 Jun 2025): https://eli.gov.pl/eli/DU/2025/861/ogl/pol/pdf
  - **[Secondary]** The list of activities allowed to use software cash registers was extended from 1 Apr 2026, and a national e-cash register is planned from 1 Jul 2028. Source: an answer to a parliamentary question, https://api.sejm.gov.pl/sejm/term10/interpellations/attachment/ATTDYWJ4P/i19929-o1.pdf
  - **[Unverified]** Whether confirmation by the President of GUM is required.
- **Czechia**
  - **[Primary]** EET 2.0 takes effect **1 Jan 2027** and covers cash and in-person card and QR payments. The Chamber overrode the Senate on 9 Sep 2026. Source: https://mf.gov.cz/cs/ministerstvo/media/tiskove-zpravy/2026/snemovna-prehlasovala-senat-a-stvrdila-zavedeni-ee-65151
  - **[Secondary]** Promulgated on 7 Oct 2026.
- **Belgium**
  - **[Secondary]** Certified till plus FDM fiscal data module for hospitality; SCE 2.0 mandatory from 1 Jul 2026. Source: https://blog.forumforthefuture.be/fr/article/horeca-le-nouveau-systeme-de-caisse-enregistreuse-sce-2.0-devient-obligatoire-a-partir-du-1er-juillet-2026/31412
- **Sweden**
  - **[Secondary]** Certified control unit; new requirements from 1 Jan 2027, including SKVFS 2021:17 and an XML journal export. Source: https://www.fiskaly.com/blog/certified-cash-registers-in-sweden
- **Not evaluated:** Hungary, Croatia, Greece, Slovakia, Norway.

## 6. Summary table

| Regime | Applies to POS receipts? | What the vendor must do | Hard date | Met by integrating a certified third-party service? |
|---|---|---|---|---|
| Spain Veri\*factu | Yes (simplified invoices) | Self-declaration, hash chain, QR, event log, optional real-time submission | Producer: 29 Jul 2025. Users: 1 Jan / 1 Jul 2027. Oct 2028 announced, not enacted | Partly. The vendor still declares its own system; each component is declared by its maker |
| Spain TicketBAI | Yes | Foral software registration, signature, submission | In force | Unverified |
| France | Yes (B2C) | Publisher attestation or accredited certificate | In force; no upcoming deadline | The attestation is the vendor's own; no third party is needed |
| Germany | Yes | Certified TSE, DSFinV-K, receipts. Merchant reports through ELSTER | In force. Cash-register duty from 2028 is a draft | Yes, a certified cloud TSE |
| Austria | Yes | Signing, DEP, start receipt, FinanzOnline registration | In force | Yes, a signing service (Inferred) |
| Italy | Yes | RT device, or an approved software solution through an accredited provider | In force. Software route opens 2027 (Unverified) | Yes, through an accredited provider |
| Portugal | Yes | AT certification of the software | In force | No; the software itself is certified (Inferred) |
| Poland | Yes | Online cash register, or a software register in listed activities only | In force; national e-cash register 2028 (secondary) | Partly |
| Czechia | Yes (cash and in-person card) | Online reporting | 1 Jan 2027 | Likely (Inferred) |
