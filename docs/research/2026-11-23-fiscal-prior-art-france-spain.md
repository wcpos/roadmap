# Fiscal prior art: how other tills meet the French and Spanish rules

**Research note, 2026-11-23**, for [roadmap#645](https://github.com/wcpos/roadmap/issues/645) (map [#640](https://github.com/wcpos/roadmap/issues/640)).

This note builds on two earlier notes and does not repeat them:

- [`2026-09-11-fiscal-compliance-groundwork.md`](2026-09-11-fiscal-compliance-groundwork.md), "the groundwork note": what each regime requires and what WCPOS has today.
- [`2026-11-20-fiscal-rules-on-post-sale-edits.md`](2026-11-20-fiscal-rules-on-post-sale-edits.md), "the edits note": which facts of a paid sale may change afterwards.

This note answers a different question: how have products placed like WCPOS (software the merchant hosts or can modify, sold across borders) met France's rule (art. 286-I-3° bis CGI, BOFiP BOI-TVA-DECLA-30-10-30) and Spain's Veri\*factu (RD 1007/2023, Orden HAC/1177/2024) and TicketBAI, and what have they converged on? It proposes no design.

**Sources.** Vendors' own documentation, source code and changelogs, plus the French and Spanish administrations' texts where they decide who may attest. All web pages were read on 2026-11-23 unless a source date is given. Code is cited as `path:line @ <short sha>` at these revisions:

| Short | Repository | Full commit | Date |
|---|---|---|---|
| `odoo18@21b8e6cf` | github.com/odoo/odoo, branch 18.0 | `21b8e6cf67280f6ce9cf5bd88de592f44922cfa4` | 2026-11-23 |
| `odoo19@99c13bea` | github.com/odoo/odoo, branch 19.0 | `99c13bea333ae69bf7193e5d84973c047f2a4adf` | 2026-11-23 |
| `oca16@07465521` | github.com/OCA/l10n-spain, branch 16.0 | `074655215218270e7c81873293e5da0cc839a782` | 2026-11-21 |
| `doli@681d5c69` | github.com/Dolibarr/dolibarr, `develop` | `681d5c69706950195c85f5220d72ae0b74ecdb14` | 2026-11-23 |
| `doli24@5c6c7ff6` | github.com/Dolibarr/dolibarr, tag 24.0.3 | `5c6c7ff6a5112413b1c27221c8d11750afad56f8` | 2026-11-11 |
| `dolif@811e9681` | github.com/Dolibarr/dolibarr-foundation | `811e968188a75967426c1b90fd08019bc16fcb6c` | 2026-10-19 |
| `pasteque@bad37b90` | framagit.org/pasteque/pasteque-server, `master` | `bad37b906eb2baf70ebbdcbb33f73b737b44b538` | 2024-03-20 |
| `pdesk@2ced38dd` | framagit.org/pasteque/pasteque-desktop | `2ced38dda2ff346ba79db070fd9d0d2635032827` | 2026-08-12 |

WordPress plugins are cited as `file:line @ <slug> <version>`, read from the wordpress.org download of that version.

**Labels.**

- **Observed**: read in the primary text, the vendor's own page or the source.
- **Inferred**: my reading of what was observed.
- **Unverified**: from a search snippet, a secondary write-up or a page that would not open.
- **Claim**: a vendor's marketing statement, reported as a statement, not as a fact.

---

## 1. Bottom line

1. **No self-hosted or open-source product in this survey has an NF525 certificate today.** Odoo and Pastèque rely on attestations; Dolibarr's LNE audit (from June 2026) had produced no certificate by 2026-10-19 and its public releases ship with the LNE-mode locks switched off. The certified products in this survey are hosted (SumUp, Lightspeed K-Series). (Observed, §3.) Infocert's and LNE's registers were not checked (§7), so whether any product outside the survey holds one is Unverified.
2. **Who signs is the question every self-hostable product has had to answer, and the French and Spanish texts answer it the same way: whoever programs or modifies the safeguards.** A user who modifies them becomes the publisher (France) or the producer (Spain). In France a user that is not itself a software publisher cannot self-attest at all and needs a certificate (BOFiP §375). (Observed, §2.)
3. **For Spain, everyone who submits chose VERI\*FACTU mode only**: Odoo, OCA, Lightspeed, Quaderno and (through fiskaly) Square. Only FacturaScripts claims the local, signed no-VERI\*FACTU mode, and one WordPress plugin withdrew it because it never signed. (Observed, §3.)
4. **Most WordPress Veri\*factu plugins are thin clients of a SaaS**, which is then the producer that signs the declaración. Only plugins with no installs keep the chain on the WordPress site. No WooCommerce POS claims Veri\*factu or TicketBAI; one claims NF525 without naming a certifier, and the largest commercial WooCommerce POS says plainly it cannot comply. (Observed, §3.6–3.7.)
5. **The public mistakes are chain breaks on upgrade, guards that miss a state, and stale legal claims**, not failed audits. No merchant fine traceable to a named product was found. (Observed, §6.)

---

## 2. Who may attest or declare for self-hosted and open-source software (primary texts)

This frames every product below.

**France, BOFiP BOI-TVA-DECLA-30-10-30, version of 25/03/2026** ([link](https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20260325)). Observed unless marked.

- §45: "Les logiciels ou systèmes de caisse dits « libres » ou développés en interne sont également concernés par l'obligation." Modifications "ne doivent avoir ni pour objet ni pour effet d'altérer le respect des conditions".
- §300: the éditeur is "la personne qui détient le code source"; the publisher answers for its safeguards only if they "ne sont pas modifiés par un tiers".
- §310: for software designed to be adapted, the éditeur may be "le dernier intervenant ayant paramétré le logiciel" where that configuration touches the four conditions.
- §315: anyone who alters the safeguards "invalide le certificat ou l'attestation et se trouve soumis à l'obligation de sécurisation de la nouvelle version". Example 1: a publisher's standard product whose configuration does not touch the safeguards is covered by the publisher's certificate or attestation. Example 2: an integrator whose changes alter the safeguards becomes the éditeur. Example 4: "Logiciel libre dont le code source est fourni par la communauté de développeurs": "L'entreprise utilisatrice est donc considérée comme « l'éditeur »" and is "soumis à obligation de certification de la version actuellement en service".
- §365: the attestation is delivered to the merchant "spontanément ou à sa demande, par l'éditeur", for "la version vendue ou fournie". A foreign publisher may issue it in French or with a certified translation (Observed via a summary of the page; the exact sentence was not quoted).
- §370: it must be "individuelle, c'est-à-dire délivrée nominativement à l'assujetti"; a clause in the terms of sale "ne vaut pas attestation individuelle". A pre-filled document the merchant completes is tolerated.
- §375: a merchant that develops its software "pour ses besoins propres" can prove compliance only "par la production d'un certificat délivré par un organisme accrédité", unless its declared activity is software publishing.
- §380: an attestation covers later minor versions if it names the major version and the sub-numbering; "Toute nouvelle version majeure … doit donner lieu à l'établissement d'une nouvelle attestation". §340 (2025 version): a major version is one where parameters affecting the four conditions changed.
- §390: a paper or downloadable document, following model BOI-LETTRE-000242.
- §30: the obligation applies "y compris en cas d'enregistrement sur un logiciel … accessible en ligne". BOFiP draws no SaaS / self-hosted distinction.
- **Inferred:** a publisher of GPL software that ships a standard build is in example 1, not example 4, as long as it holds the source and the merchant does not alter the safeguards. A merchant or integrator who alters them is in example 2 or 3, and under §375 a merchant that is not a publisher can then only use a certificate.

**Spain, AEAT FAQ on certification and the declaración responsable, updated 21/10/2026** ([link](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/certificacion-sistemas-informaticos-declaracion-responsable.html)). Observed.

- The declaration falls to "La empresa que efectúe la programación del código o integre partes de otro software, ya sea o no de código abierto", which "se hará responsable del funcionamiento del mismo".
- "Si el software hubiera sido desarrollado por la propia empresa, será esta la que deba certificarlo."
- Changes by another producer "no están cubiertas por la certificación del productor del SIF original"; a user who changes it "con sus propios medios" becomes the producer and signs a declaración.
- "Cada versión, por pequeña variación que introduzca, es un producto distinto." The declaration must be "accesible dentro del propio SIF" and also outside it.
- AEAT publishes no list of compliant software (the FAQ says it is self-certified). A competitor's blog telling merchants to check "the AEAT's list of certified systems" ([Holded](https://www.holded.com/es/blog/tpv-verifactu)) is wrong on that point (Inferred).
- **Contrast (Observed):** France lets minor versions ride on one attestation (§380); Spain treats every version as a new product.

---

## 3. Product by product

### 3.1 Comparison in brief

| Product | Hosting | France | Spain | Chain lives | Key / secret | Closures | Receipt | Proof reaches merchant | Charged |
|---|---|---|---|---|---|---|---|---|---|
| **Odoo** | Both | Own attestation, Enterprise contract only | Own declaración, VERI\*FACTU only; TicketBAI licence hard-coded | Merchant's database, per company | FR none; ES merchant's .p12 in DB | Daily/monthly/annual by cron, perpetual total | FR full hash; ES "QR tributario:" + QR + "VERI\*FACTU" | FR form keyed to contract and DB UUID; ES public PDF | Modules free (LGPL); FR proof needs Enterprise |
| **OCA l10n-spain** | Self | n/a | No producer named; integrator or merchant declares; VERI\*FACTU only | Merchant's DB, per company | Merchant's .p12, unencrypted on disk | None | QR 40 mm, "QR Tributario" / "VERI\*FACTU" | Upload slot for a declaración someone else writes | Free (AGPL) |
| **Dolibarr** | Both | Attestation from an integrator or host; LNE audit in progress, no certificate | Third-party paid modules | Merchant's DB, per entity | HMAC key in DB, decryptable by admin outside LNE mode | Day/month/year, lifetime totals | "DUPLICATA"; hash excerpt only in LNE mode | Not from the project; from partners | Module free; certification cost the association ~€80k |
| **Pastèque** | Self | Attestations via service providers; no certificate | n/a | Merchant's DB, per till | None (plain SHA3-512); archives GPG-signed | Day/period/year, perpetual total | "Duplicata" only | Through providers (Inferred) | Free |
| **FacturaScripts** | Self | n/a | Plugin author declares; both modes per fiscal year (claim) | Merchant's DB | Merchant's certificate | n/a | QR at top of ticket (claim) | Admin → "Acerca de" (claim) | Plugin free; POS €24.99 |
| **WP Veri\*factu plugins** | Self + SaaS | n/a | SaaS is the producer (Quaderno, B2Brouter) | In the SaaS | In the SaaS | None | QR via a PDF-invoice plugin | SaaS's legal page | SaaS subscription |
| **Woo POS add-ons** | Self | Webkul claims "NF525" with no certifier; YITH says it cannot comply | None claim | Not public | Not public | None described | Signature as QR/text (Webkul claim) | Not found | Webkul $49 (claim) |
| **SumUp** | Hosted | NF525 certificate (Infocert, iOS, cat. B) | Cloud submission, no certificate step (claim) | Vendor | Vendor | Daily Z (claim) | QR (claim) | Download in app settings | Spain "no charge" (claim) |
| **Lightspeed** | Hosted | K: NF525 (claim); L: self-attestation | K: own declaración via efsta, VERI\*FACTU only | Vendor / efsta | ES merchant's certificate uploaded | Not found | QR on all receipts | Public PDF; L attestation filled in by merchant | Not found |
| **Square** | Hosted | Self-attestation, "Secure Cash Register v1.0" | Via fiskaly; merchant e-signs an agreement | Vendor / fiskaly | Vendor | Per-device daily Z | Veri\*factu QR | Public PDF + merchant addendum | Not found |

Hiboutik: no page found mentioning NF525, LNE, attestation or Veri\*factu (Observed absence, hiboutik.com feature pages).

### 3.2 Odoo (odoo/odoo, LGPL-3)

**France, `l10n_fr_pos_cert`.**

- **Proof: Odoo SA's own attestation, not NF525.** The form page "Certificate of compliance to the French law" says the requirements are "implémentées dans Odoo Enterprise à partir de la version 9" and an "attestation de conformité est téléchargeable" ([odoo.com/my/contract/french-certification](https://www.odoo.com/my/contract/french-certification)). Observed, claim. The 19.0 docs: the certificate "is granted by Odoo SA to Odoo Enterprise users with a subscription number" ([france.html 19.0](https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations/france.html)). Observed. The 2017 blog told Community users to "upgrade to Odoo Enterprise" ([Odoo blog, 2017-12-12](https://www.odoo.com/es/blog/viaje-5/get-the-anti-fraud-certification-with-odoo-464)). Observed, claim.
- The form asks for contract number, database name and UUID, legal representative and company. Modified code and third-party modules are excluded: "c'est à l'organisme qui a développé le module de le certifier." Observed, claim. The returned PDF was not seen.
- NF525: two partner blogs say Odoo is not certified and holds only an Infocert "preuve d'engagement" ([auguria.fr, 2025-09-25](https://www.auguria.fr/blog/actualites-publications-5/nf525-pos-odoo-ou-en-est-la-conformite-225); [hors-du-commun.fr, 2026-10-18](https://www.hors-du-commun.fr/blog/tout-savoir-sur-odoo-2/le-logiciel-de-caisse-odoo-est-il-certifie-nf525-65)). Unverified (secondary).
- **Chain.** SHA-256 of the previous order's hash plus canonical JSON of the order (`addons/l10n_fr_pos_cert/models/pos.py:98-103 @ odoo18@21b8e6cf`). One chain per company on a `no_gap` sequence (`l10n_fr/models/res_company.py:53-73`; `pos.py:60-82`). Written when the order becomes paid/done/invoiced (`pos.py:194-220`). No signing key. Observed.
- Hashed order fields: `date_order, user_id, lines, payment_ids, pricelist_id, session_id, pos_reference, sale_journal, fiscal_position_id, pos_version`; `partner_id` left the hash from 17.4 (`pos.py:45-46`). Line fields: `notice, product_id, qty, price_unit, discount, tax_ids, tax_ids_after_fiscal_position` (`pos.py:47`). Observed. Payments enter only as record IDs, so payment amounts and method are not in the hash although the integrity PDF says payment data is guaranteed (`report/pos_hash_integrity.xml:43-51`). Inferred.
- **Switch on.** Auto-installs with `l10n_fr_account` and `point_of_sale` (`__manifest__.py:27-29`); everything hinges on the company country being France or a DOM-TOM (`l10n_fr/models/res_company.py:29-32`). Observed. Changing the country turns the guards off. Inferred.
- **What becomes impossible.** Writing hashed fields on a paid/done/invoiced order (`pos.py:207-211`); writing lines once done/invoiced, but not in `paid` (`pos.py:231-236`); deleting any order, even at uninstall (`pos.py:222-226`); changing taxes on a fiscal position used by an order (`account_fiscal_position.py:10-19`); editing or deleting a closing (`account_closing.py:143-148`). POS numbering forced to `no_gap` in 18.0 (`pos.py:26-27`), override gone in 19.0 (`@ odoo19@99c13bea`). The server-side 24-hour session check is a no-op since 2021; only the front end forces a closing popup (`pos.py:33-35`; `static/src/js/Chrome.js:13-22`). Observed. Nothing in code stops uninstalling; the docs say uninstalling "will reset the security hashes" and "Modifying source code… is not allowed". Observed, claim. Backup restore: not found.
- **Closures.** Daily, monthly, annual crons (`data/account_sale_closure_cron.xml`), each with period total, cumulative grand total and last order (`account_closing.py:24-34`). "Daily" means the 24 hours before the cron ran (`:126-131`); the `last_order_hash` field stores the sequence number, not the hash (`:111`). Observed. Menus: Point of Sale ‣ Reporting ‣ French Statements ‣ Sales Closings / POS Inalterability Check (`views/pos_inalterability_menuitem.xml:17-19`); the check prints "Résultat du test d'intégrité" with first and last hash and any corrupted orders (`report/pos_hash_integrity.xml`). Observed.
- **Receipt.** The full hash is printed; a manually changed price shows the struck-through old price (`static/src/xml/OrderReceipt.xml:4-24`). Observed.
- **Relaxations.** Commit 5504414a22 (2024-07-15) relaxed constraints after "a re-reading of the law": orders immutable only after validation, partner editable. Observed.

**Spain, Veri\*factu (`l10n_es_edi_verifactu`, `l10n_es_edi_verifactu_pos`).**

- **Proof: Odoo SA's own declaración, VERI\*FACTU only.** Docs: "Producers of Veri\*Factu billing systems must self-certify… Download Odoo's 'declaración responsable'" ([spain.html 19.0](https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations/spain.html)). The 3-page PDF: version "18+", only-VERI\*FACTU "SÍ", multi-taxpayer "SÍ", signed by Odoo SA's legal representative on 24 June 2025; it says SaaS and on-premise are both covered. Observed. The code sends Odoo SA as producer, system "Odoo", ID "00", version `odoo.release.version`, `TipoUsoPosibleSoloVerifactu='S'` (`l10n_es_edi_verifactu/models/verifactu_document.py:814-838 @ odoo18@21b8e6cf`). Observed. The module also landed on 17.0 (2025-07-22), outside the declared "18+". Inferred.
- **Chain.** Uppercase SHA-256 huella (`verifactu_document.py:30-32, 865-888`), one chain per company from a `no_gap` sequence (`res_company.py:79-89`); each record stored as a JSON attachment (`:489-500`); `NumeroInstalacion` = sha256(database UUID) (`:809-811`). Observed.
- **Keys and submission.** The merchant's certificate is a DB record with its PKCS#12 password in a Char field (`certificate/models/certificate.py:29-30`). SOAP to AEAT, batches of up to 1,000 in chain order, honouring AEAT's wait time, cron retry after 60 s (`verifactu_document.py:895-963`). Observed.
- **Switch on.** Install manually, tick "Enable Veri\*Factu", upload a certificate, untick "Test Environment", which defaults on (`res_company.py:12-20`); database neutralisation forces test mode back on (`data/neutralize.sql`). Observed. No guard found against unticking the enable box later. Inferred.
- **What becomes impossible.** No user group may write, create or delete documents (`security/ir.model.access.csv`); reset-to-draft hidden for registered moves (`account_move.py:227-238`); an order over the simplified-invoice limit must be invoiced (`pos_order.py:241-243`). Observed. Chained documents are protected by an `at_uninstall=False` guard, so uninstalling deletes them (`verifactu_document.py:180-184`). Inferred.
- **Corrections.** POS refund reason R1–R5 (`pos_order.py:47-57`); refunding a non-invoiced order is forced to R5 (`ticket_screen.js:9-12`); non-R5 needs a customer (`pos_order.py:244-251`); sent as rectificativa by differences, type "I" (`verifactu_document.py:603-608`). Invoicing a registered ticket sends an anulación of the ticket and registers the invoice as F3 (`pos_order.py:276-285`; `l10n_es_edi_verifactu_pos/models/account_move.py:14-16`). The POS cancel button does nothing: "no clean way to cancel PoS orders" (`pos_order.py:134-138`). Subsanación not supported (`verifactu_document.py:337-340`). Observed.
- **Receipt.** "QR tributario:", the QR, then "VERI\*FACTU" (`l10n_es_edi_verifactu_pos/static/src/.../order_receipt.xml:5-10`); QR to AEAT's ValidarQR with nif, numserie, fecha, importe (`verifactu_document.py:293-311`). Observed. No closure screen; a Veri\*Factu tab on each order lists documents, status and a JSON download. Observed.

**Basque Country, TicketBAI (`l10n_es_edi_tbai`, `l10n_es_edi_tbai_pos`).** Odoo's production software licence is hard-coded (`l10n_es_edi_tbai/models/res_company.py:13-42`); XML is XAdES-signed with the company certificate (`l10n_es_edi_tbai_document.py:691-739`) and chained by `chain_index` (`:166-197`); a chained move cannot be reset to draft or deleted without a `force_delete` context (`account_move.py:125-136`); the receipt prints "TicketBai QR Code" only once accepted (`l10n_es_edi_tbai_pos` `order_receipt.xml:5-9`; `pos_order.py:115-122`). Observed.

### 3.3 OCA l10n-spain (Odoo Community, AGPL-3)

- **No producer of record.** The `verifactu.developer` model holds free-text name, NIF, system name, version and an empty upload field for a declaración (`l10n_es_verifactu_oca/models/verifactu_developer.py:12-16 @ oca16@07465521`); no developer record ships in `data/`. Observed. The maintainer: "ni la OCA, ni AEOdoo ni las empresas contribuidoras van a asegurar por ti esa instalación"; the client or implementer signs and uploads ([discussion #4451, 2025-10-14](https://github.com/OCA/l10n-spain/discussions/4451)). Observed.
- **Mode.** VERI\*FACTU only (`models/verifactu_mixin.py:280`); no local signing, no event log. The choice is explained in issue #3337 (2024-01-13) by the obligations it avoids. Observed.
- **Chain.** SHA-256 over AEAT's field string, computed at posting (`models/account_move.py:165-201, 543-550`); one chain per company shared by invoices and POS orders, with "TODO: … chaining for each PoS Config" (`account_move.py:203-204`; `l10n_es_verifactu_pos_oca/models/pos_order.py:131-137`); last entry taken under `SELECT … FOR UPDATE NOWAIT` (`verifactu_mixin.py:309-366`). Observed.
- **Keys.** The merchant's .p12, one per company, written unencrypted to the server's data directory (`l10n_es_aeat/wizard/aeat_certificate_password.py:48-60, 85-91`). Observed.
- **Queue.** Cron every minute, batches of 1,000; entries older than 240 s go with `Incidencia=S` (`verifactu_invoice_entry.py:144-153, 176-178`); failures stay `not_sent` and retry (`:305-310`); AEAT's wait time not honoured (`README.rst:86`). Resend is a new chained record with `Subsanacion=S` and `RechazoPrevio=X` after a rejection (`account_move.py:272-276, 651-662`). Observed. **The record sent is rebuilt from live data at send time; only the hash is stored** (`verifactu_invoice_entry.py:301-303`), and [issue #5279](https://github.com/OCA/l10n-spain/issues/5279) (open, 2026-10-01) shows `TipoFactura` can differ from what was hashed. Observed.
- **Switch on / locks.** `verifactu_enabled` plus an optional start date (`res_company.py:11-38`) forces hash-restricted sale journals that cannot be turned off (`account_journal.py:28-64`). Once sent, date, number and cancel/reset are blocked (`account_move.py:622-649`; POS `pos_order.py:632-663`); before sending this module guards nothing. Observed.
- **Corrections.** R1–R5, by differences only; substitution is a TODO (`verifactu_mixin.py:47-56`); anulación by wizard (`wizards/verifactu_cancel_invoice_wizard.py:18-24`); POS ticket F2, refund R5 (`pos_order.py:123-126, 182-189`); POS anulación raises `NotImplementedError` (`:628-630`); F3 not implemented. Observed.
- **Receipt.** POS QR built in the browser with ZXing, 40×40 mm, at the top of the ticket between "QR Tributario" and "VERI\*FACTU" (`l10n_es_verifactu_pos_oca/static/src/js/models.js:18-55`; `static/src/xml/OrderReceipt.xml:9-21`). The browser's `importe` is not fixed to two decimals, unlike the server's (`models.js:27` vs `pos_order.py:203`). Observed; that they can differ is Inferred.
- **TicketBAI (`l10n_es_ticketbai*`).** The integrator registers as developer and holds the licence: "es necesario dar de alta la entidad desarrolladora en Hacienda" (`l10n_es_ticketbai_api/README.rst:47`). Chain per company for invoices but **per POS config** for tickets (`l10n_es_ticketbai_pos/models/ticketbai_invoice.py:41-55`). **The POS signs in the browser**: the server sends the P12 to the till, unencrypted when the company certificate is used, and the chain pointer lives in browser storage (`pos_config.py:41-62`; `static/src/js/db.js:14-22`); the README recommends one device certificate per register (`README.rst:41-43`). A rejection marks that invoice and everything chained after it as error and rewinds the pointer (`l10n_es_ticketbai_api/models/ticketbai_invoice.py:651-729`). Observed.

### 3.4 Dolibarr (`blockedlog` and TakePOS, GPL-3)

- **The LNE-mode locks ship switched off.** `CERTIF_LNE` defaults to `'0'`, which the code describes as a version "not certified but compliant with the law by using an attestation of an IT provider… you must find an IT company that give you the attestation" (`htdocs/blockedlog/versionmod.inc.php:36-41 @ doli@681d5c69`; same at `doli24@5c6c7ff6`). Observed.
- **Proof.** Outside LNE mode the module tells users they "can't use this software without a compliance statement… you MUST ask your reseller, integrator or hosting company" (`htdocs/langs/en_US/blockedlog.lang:67`). The association does not sign one. Observed. Its LNE file (dossier LNE21-QU2507-0131, "Dolibarr 24+") had a mock audit in Feb 2026, an initial audit 1–5 June 2026, and a committee on 24/09/2026 requiring a further audit; no certificate is recorded; cost to date €79,858.75 excl. VAT (`doc/Certification/` cost report `@ dolif@811e9681`). Observed. DoliCloud: "Attestation Loi Finance fournie sur demande" (francenum.gouv.fr listing). Claim. The Dolibarr wiki says a merchant who modifies the code "becomes the editor". Observed.
- **Chain.** `HMAC-SHA256(previoushash . data, key)` over entity, dates, action, module, POS source, amounts, refs, user name, links, note and the object's JSON (`htdocs/blockedlog/class/blockedlog.class.php:1743-1779, 1864`); one chain per entity seeded by a random fingerprint (`:2122, 2397-2413`). The key is generated at enable time (`htdocs/core/modules/modBlockedLog.class.php:226`) and stored AES-encrypted in the database with the instance key, or in LNE mode with a key fetched from the association's server using SIREN plus a registration hash (`blockedlog.class.php:1846-1861, 1967-2007`). Observed. Outside LNE mode the server admin can decrypt the key and re-sign. Inferred. An encrypted end-of-chain flag stamps `EndOfChainDeletionDetected` into the next record if rows vanished (`:1514-1568`). Observed.
- **What becomes impossible (all builds).** Once used in France the module is always enabled (`modBlockedLog.class.php:99-107`); a forced disable writes a deliberately invalid record (`:446`); a validated invoice's ref, totals, date, customer tax IDs and lines are frozen; a sent or printed invoice cannot be un-validated; a closed cash control cannot be deleted (trigger `interface_99_modBlockedlog_ActionsBlockedLog.class.php:81-215`). **LNE mode only:** POS invoices cannot be edited or deleted, the module can never be disabled, company country cannot change, a closed cash control cannot reopen, and custom receipt templates are blocked (`commoninvoice.class.php:870-1043`; `blockedlog.class.php:2455-2469`; `admin/company.php:103`; `takepos/receipt.php:146-152`). Observed.
- **Corrections.** A credit note linked to the source invoice (`htdocs/takepos/invoice.php:661-673`). Observed.
- **Closures and archive.** Day/month/year cash controls with lifetime totals (`htdocs/compta/cashcontrol/class/cashcontrol.class.php:88-91, 528-560`). Archive is a CSV per year or month with per-line OK/KO, period and lifetime totals, and a closing line `END - sha256=… - hmac_sha256=…` (`htdocs/blockedlog/admin/blockedlog_archives.php:256, 600-682`); each export is itself logged. Users must archive at least yearly and keep seven years (lang `:9`). There is a tax-auditor role and a file-integrity check against signed file lists on dolibarr.org (`htdocs/admin/system/filecheck.php:172`). Observed.
- **Receipt.** Always "*** DUPLICATA ***" from the second print (`takepos/receipt.php:307-318`); in LNE mode also print date, the first 10 characters of the HMAC, "LNE Certified POS system" and SIRET (`:270-292, 562-590`). Observed.
- **Spain.** Paid Dolistore modules from three vendors; the wiki says the native log "may be enough" ([wiki, 2025-12-19](https://wiki.dolibarr.org/index.php/Law_SIF_for_the_AEAT_In_Spain)). Observed.

### 3.5 Pastèque (Association Pastèque, free software)

- **Proof.** "Pastèque fonctionne depuis ce temps avec des attestations individuelles" and can be used again after the 2026 law (pasteque.org news, 2026-02-13); it "arrive sans aucune attestation ni certification" ("Respect LF2016" page). Observed. In 2017, v8 was "attestable" only if the server sat with the provider giving the attestation and the merchant had no server access (linuxfr, 2017-12-26). Observed. Certification was judged to need controlled, subcontracted deployments and to "doubler le budget des prestataires" (pasteque.org, 2024-11-27). Observed.
- **Chain.** Each sale and each Z is a FiscalTicket whose content is the ticket's JSON (`src/lib/Model/FiscalTicket.php:44-51 @ pasteque@bad37b90`); `signature = "sha3-512:" + hash(prevSignature-sequence-number-timestamp-content)` with no secret (`:146-181`). Observed. Anyone with database access can recompute the chain. Inferred. One sequence per till, separately for sales and Zs; ticket number 0 is an end-of-sequence record re-signed to the last ticket to detect truncation (`src/lib/API/TicketAPI.php:257-276`). Archives are zips signed with the operator's GPG key and chained (`ArchiveAPI.php:384-438`). Observed.
- **Locks.** Rewriting a ticket is refused and logged as a failure ticket; delete is disabled (`TicketAPI.php:136-152, 278-279`). Observed.
- **Closures.** Day, period, fiscal year; per-period, per-year and a perpetual total "never reset" (`src/lib/Model/CashSession.php:46-51, 327-365, 545-555`). Observed.
- **Receipt.** "Duplicata" on reprint only; no hash or software identity (`TicketPrintScript.java:306-308 @ pdesk@2ced38dd`). Observed.

### 3.6 FacturaScripts and the WordPress Veri\*factu plugins

**FacturaScripts** (LGPL core; Verifactu plugin under a proprietary EULA; its listed source repository returns 404, so no code was read). The plugin author issues the declaración, downloadable at Administrador → Acerca de; resellers must issue their own ([plugin page](https://facturascripts.com/plugins/verifactu)). Both modes, chosen per fiscal year: "Una vez guardado, el modo de un ejercicio ya no se puede cambiar"; no-VERI\*FACTU signs locally with an event log ([setup guide](https://facturascripts.com/publicaciones/como-configurar-verifactu)). QR at the top of the ticket from v0.8. All claim. The POS plugin TPVneo costs €24.99 per install ([TPVneo](https://facturascripts.com/plugins/tpvneo), 2026-11-17). Observed.

**wordpress.org.** A search for "verifactu" returns 31 plugins; four have more than 10 installs. Observed.

| Plugin | Installs | Version, updated | Model |
|---|---|---|---|
| woocommerce-es (Close·technology) | 900+ | 3.5.0, 2026-10-23 | ERP connector (Holded, Odoo…); the ERP holds the chain |
| woocommerce-quaderno | 400+ | 2.7.19, 2026-09-18 | Quaderno SaaS |
| wp-ticketbai (FacturaONE) | 70+ | 3.47, 2026-05-22 | FacturaONE SaaS; being discontinued |
| wp-facturaone | 40+ | 5.55, 2026-11-11 | FacturaONE SaaS |
| b2brouter-for-woocommerce | 10+ | 1.0.6, 2026-06-01 | B2Brouter SaaS |

- **Quaderno.** The SaaS is the producer: its declaración names Recrea Systems SLU, VERI\*FACTU only, "records are considered signed once sent to AEAT", signed 2025-07-29 ([quaderno.io/es/legal/verifactu](https://quaderno.io/es/legal/verifactu)). Invoice on `woocommerce_payment_complete` or status completed, credit note on `woocommerce_refund_created` (`classes/class-wc-qd-invoice-manager.php:10-11`, `class-wc-qd-credit-manager.php:10 @ woocommerce-quaderno 2.7.19`). Observed. "Plans start at just $29 per month" (`readme.txt:45`). Claim.
- **B2Brouter.** Certificates "managed in the B2Brouter dashboard, not in the WordPress plugin"; simplified invoice when the customer has no tax ID (`includes/Invoice_Generator.php:802-814 @ b2brouter-for-woocommerce 1.0.6`); default invoice number = WooCommerce order number and credit-note number = refund ID (`:1650-1665`), which share one counter, so a series is not consecutive (Inferred); refunds as negative rectificativas referencing the original (`:643-666`); uninstall keeps invoice IDs "so your tax audit trail stays intact" (`Admin.php:706-714`). Observed. Its declaración names B2Brouter Global SL. Unverified (PDF unreadable).
- **FacturaONE.** Warns "No se puede modificar o eliminar una factura una vez emitida" (`FONE_custom_order.php:118-121 @ wp-facturaone 5.55`); wp-ticketbai blocks customer edits once reported (`wp-ticketbai.php:189-191 @ 3.47`) and places the TicketBAI QR through the "PDF Invoices & Packing Slips" plugin (`FTBAI_wcpdf.php:92-109`). Observed.
- **The on-site model (0 installs, shown for contrast).** Encadena SIF 1.5.4 computes the SHA-256 huella in WordPress (`lib/nucleo/class-encasi-huella.php:33-57`), stores the merchant's .p12 encrypted under uploads, chains per taxpayer and series, maps a cancelled order to anulación and a refund to rectificativa ("Un reembolso NO es una anulación", `includes/class-encasi-woocommerce.php:8-25`), and hard-codes one sole trader as producer (`includes/datos-productor.php:17-42`). Freefactu generates draft declaraciones whose producer defaults to the merchant (`includes/utilities/class-freefactu-declaration-manager.php:104-105 @ 1.1.2`). Observed.

### 3.7 WooCommerce POS products

- **Webkul "WooCommerce POS French NF525 Certification"**, an add-on to Webkul's own POS: orders "certified according to French Law… in accordance with the French anti-fraud measure NF525", a signature printed as QR or text, enabled under Point of Sale › Settings; no certifier, certificate number, closures or archive described; $49 one-time on the page ([store page, v2.0.0, 2026-07-09](https://store.webkul.com/woocommerce-pos-french-nf525-certified.html); [user guide, 2021-09-07, modified 2025-07-23](https://webkul.com/blog/woocommerce-pos-nf525-certification-user-guide/)). Claim. Inferred: naming NF525 without a certificate is a claim of certification the product cannot show.
- **YITH POS** says it does not comply: it "creates orders using WooCommerce API, nothing more… NF525 norm wants the 'transactions' cannot be modified after being placed and this is NOT true for WooCommerce orders" ([YITH support, 2022-03-04, updated 2023-03-17](https://support.yithemes.com/hc/en-us/articles/4574026385169)). Observed.
- **Woo's own Point of Sale** is not offered in France or Spain ([docs](https://woocommerce.com/document/woo-mobile-app-point-of-sale-mode/)). Observed.
- **Turbo Retail Suite** (free POS on wordpress.org), 1.5.0 (2026-10-12): the ticket now reads "ORDER RECORDED — NOT AN INVOICE" and "LITE does not implement the Spanish VeriFactu… rules" (`readme.txt:26-28, 119`). Observed.
- **Kiwiz for WooCommerce** (60+ installs, 2.2.1): "certification en temps réel dans la Blockchain pour se conformer à la loi anti-fraude TVA 2018", for online invoices, not a till; uninstall deletes all `_kiwiz_%` order meta (`uninstall.php:47 @ 2.2.1`). Claim / Observed.
- OpenPOS, Oliver POS, ConnectPOS, FooSales, Hike, Jovvie: no French or Spanish claim found. Unverified (search only).

### 3.8 Hosted tills, merchant-facing side only

**SumUp.**
- France: Infocert certificate No 525/0451-4, issued 23/10/23 to Tiller Systems, "Sumup Caisse, version(s) 4, IOS, Catégorie B", NF525 rules V2.2, first admitted 22/11/21 for v3.13, annual surveillance, validity checkable by QR (PDF linked from [sumup.com/fr-fr/business-guide/certification-nf525](https://www.sumup.com/fr-fr/business-guide/certification-nf525/)). Observed. Downloaded in the app under Settings › "NF525 Certificate" ([help article 75000046313](https://help.sumup.com/en-GB/pos/articles/75000046313)). Observed.
- Spain: enter the tax ID, choose the province, "Confirmar"; "Cada venta o reembolso se envía a Hacienda en tiempo real"; "Tus facturas ya incluyen el QR obligatorio"; "No cobramos nada por activar la función" ([sumup.com/es-es/ley-antifraude](https://www.sumup.com/es-es/ley-antifraude/)). Claim. No certificate or representation step is mentioned, and the page's deadlines are stale (1 Jan / 1 Jul 2026). Observed.

**Lightspeed.**
- France, L-Series: self-attestation by Lightspeed POS Belgium B.V. for "Lightspeed Restaurant POS (L)", "version n° 8, iOS, French Fiscal", version root 8/8.x, DocuSigned 31 Aug 2023; the merchant prints, fills in, signs and keeps it on site ([attachment](https://resto-support.lightspeedhq.com/hc/fr/article_attachments/18925457822747)). Switch-on requires a local "LiteServer", country France, VAT/Siret/NAF, "French Fiscal" under FDM settings, a void reason, no invoice payment types, and VAT limited to 5.5/10/20 % ([article 360001879434](https://resto-support.lightspeedhq.com/hc/articles/360001879434)); "Your FDM settings can't be changed after they have been saved" ([article 226305867](https://resto-support.lightspeedhq.com/hc/en-us/articles/226305867)). Observed.
- France, K-Series: "certifiée NF525 par AFNOR Certification, via INFOCERT… sans attestation individuelle" ([blog, 2025-06-27](https://www.lightspeedhq.com/fr/blog/certification-caisse-enregistreuse/)). Claim; certificate not found.
- Spain, K-Series: declaración by Lightspeed Netherlands B.V. for version "26.36.0 LSK", VERI\*FACTU only, multi-taxpayer, signed 14 Aug 2026; middleware **efsta EFR** builds the records, chain and QR and submits ([PDF](https://pdf.lightspeedhq.com/legal/es/Responsible_Declaration_Verifactu_latest.pdf); [legal page](https://www.lightspeedhq.com/es/legal/declaracion-responsable-verifactu/)). The merchant uploads their own certificate and password under Business › Settings › Fiscal details; tax ID must match the certificate; certificate status and expiry shown; prerequisites: POS ≥ 26.36.0, all shifts and orders closed; "All transactions, refunds, and voids are recorded and sent to efsta"; QR on all receipts ([K-Series article](https://k-series-support.lightspeedhq.com/hc/en-us/articles/53394509875099)). Observed.

**Square.**
- France: self-attestation by Squareup International Limited for "Secure Cash Register", version 1.0, root 1./1.X, signed 20 Sept 2021 ([legal page](https://squareup.com/fr/fr/legal/general/anti-vat-fraud-attestation)). The merchant fills in part 2 and an addendum, and at inspection cites the "version de conformité de sécurité … PAS … la version de l'application", shown under Plus › Assistance › À propos ([help 7628](https://squareup.com/help/fr/fr/article/7628-article-88)). Z reports per device under Rapports › Rapports de conformité, filtered by period, location and device; no monthly/annual closure or grand total described ([help 7940](https://squareup.com/help/fr/fr/article/7940-z-de-caisse)). Observed.
- Spain: through **fiskaly**; enrolment per location accepts fiskaly's end-user terms, auto-renews annually, and "Las solicitudes de desactivación se aplicarán siempre a finales de año"; the merchant downloads an agreement and signs it "con un certificado electrónico válido" ([help 8536](https://squareup.com/help/es/es/article/8536-enable-veri-factu-for-your-square-business)). A refund "crea automáticamente una … Factura Rectificativa que se envía a la AEAT" with its own number, a reference and a new QR; above €3,000 the till requires the customer's NIF, name and address and prints "Factura" ([help 6116](https://squareup.com/help/es/es/article/6116-process-refunds)). With Veri\*factu on, issuing invoices from Transactions after the sale "no estará disponible temporalmente"; wrong VAT rates "puede impedir que una transacción sea verificada" and no QR prints ([help 6139](https://squareup.com/help/es/es/article/6139-print-receipts)). Observed.

---

## 4. Conventions others converge on

Observed patterns across the survey, stated as what others do; none is a recommendation.

1. **One chain per legal entity** (company / entity / taxpayer) is the default for both regimes (Odoo FR and ES, OCA Veri\*factu, Dolibarr). Per-till chains appear where the till signs or numbers on its own (Pastèque, OCA TicketBAI POS).
2. **Chaining with SHA-256 and no signature for France** (Odoo, Pastèque with SHA3-512). Dolibarr is the one that adds an HMAC key, and only its LNE mode protects the key from the admin.
3. **VERI\*FACTU (submitting) mode only for Spain**, declared as `TipoUsoPosibleSoloVerifactu = S` (Odoo, OCA, Lightspeed, Quaderno; Square via fiskaly). The stated reason is that it removes local XAdES signing, the event log, export and integrity self-checks.
4. **The merchant's own qualified certificate submits to AEAT**, uploaded in the back office with expiry shown (Odoo, OCA, Lightspeed, FacturaScripts). The alternative is a representation agreement with the vendor's partner (Square/fiskaly) or a SaaS that holds it (Quaderno, B2Brouter).
5. **Asynchronous submission queue**: a cron every 60 s, batches up to 1,000, `Incidencia=S` for late records, retry on connection failure (Odoo, OCA, FacturaScripts).
6. **Corrections:** France, a credit note or refund order that is itself chained (Odoo, Dolibarr, Pastèque); Spain, rectificativa by differences (type "I"), R5 for simplified tickets, F3 with an anulación of the ticket when a ticket becomes a full invoice (Odoo). Substitution ("S") is the common gap.
7. **Receipt:** France, "DUPLICATA" on reprints everywhere; a hash or hash excerpt where any is printed (Odoo full, Dolibarr 10 characters in LNE mode). Spain, a 40 mm QR to AEAT's ValidarQR with nif, numserie, fecha, importe, labelled "QR tributario" above and "VERI\*FACTU" below (Odoo, OCA).
8. **Closures:** daily, monthly and annual with period and perpetual totals (Odoo, Dolibarr, Pastèque), plus an integrity-check screen or report naming the first and last record and any broken ones (Odoo, Dolibarr).
9. **Turning it on is a one-way door:** Odoo's hash-restricted journals cannot be turned off once used, Dolibarr's module is always enabled in France once used, Lightspeed's FDM settings cannot change, Square deactivates only at year end, FacturaScripts fixes the mode per fiscal year.
10. **The attestation or declaration is versioned separately from the app.** Square attests "Secure Cash Register v1.0" and tells merchants to quote that, not the app version; Lightspeed attests version root 8/8.x. In Spain each declaración names one exact version (Lightspeed 26.36.0, Odoo "18+").
11. **Proof is delivered as a PDF**: France, filled in by or for the merchant by name (Square, Lightspeed L, Odoo's form); Spain, one public PDF that is also reachable in the product (Odoo, Lightspeed, FacturaScripts).

---

## 5. Divergences to choose between

1. **Who signs the French attestation for a self-hostable product.** The publisher for its standard build (Odoo, Enterprise contract only, modified code excluded); an integrator or host per installation (Dolibarr, Pastèque); or nobody until certified (Dolibarr's LNE path). BOFiP §§300–375 (§2) bound the choice.
2. **Who is the Spanish producer for a self-hostable product.** The publisher named in code (Odoo); nobody shipped, the integrator or merchant fills in the fields (OCA, Freefactu); a SaaS that holds the chain (Quaderno, B2Brouter); a fiscal middleware behind the vendor (efsta, fiskaly).
3. **Where the chain is computed and the certificate is held.** In the merchant's database and server (Odoo, OCA, Dolibarr, Encadena); in a SaaS or middleware (Quaderno, B2Brouter, Lightspeed/efsta, Square/fiskaly); in the till's browser (OCA TicketBAI POS).
4. **Chain scope.** Per company (Odoo, OCA Veri\*factu, Dolibarr) or per till (Pastèque, OCA TicketBAI POS).
5. **Hash alone, keyed hash, or signature for France.** Plain hash (Odoo, Pastèque); HMAC with a server-held key (Dolibarr); signed archives on top (Pastèque GPG).
6. **What the hash covers.** IDs of related records (Odoo's payments) or the record's full content (Dolibarr's object JSON, Pastèque's ticket JSON).
7. **What a record sent to AEAT is built from.** The stored snapshot (Odoo stores the JSON) or live data at send time (OCA, issue #5279).
8. **Spanish mode.** VERI\*FACTU only (nearly everyone) or both modes (FacturaScripts, claim).
9. **How the locks are switched on.** By company country (Odoo, Dolibarr); by an explicit setting (Odoo ES, OCA, Lightspeed FDM); by a build-time constant (Dolibarr `CERTIF_LNE`).
10. **What uninstalling does.** Refuses to delete orders (Odoo FR); deletes chained documents (Odoo ES, Inferred); keeps records by default (B2Brouter, Encadena); deletes everything (Kiwiz).
11. **French closures.** Cron at fixed periods (Odoo) or cashier-closed sessions (Dolibarr, Pastèque, Square's per-device Z).

---

## 6. Mistakes others made in public

**Chain breaks and guard gaps (code and issue trackers).**

- Odoo: only the last move line was hashed ([#17671](https://github.com/odoo/odoo/issues/17671), 2017); a computed tax field in the hash "corrupted" hashes when fiscal positions changed ([#32665](https://github.com/odoo/odoo/issues/32665), 2019); the server 24-hour check left sessions stuck and was neutralised (commit a1508eddc9, 2021-12-09); constraints relaxed after "a re-reading of the law" (PR #170140, 2024-07-15); numbering gaps under concurrent payments (eed50d6c6e, 2025-04-29); integrity check timed out at ~40k orders (0dcaa83ad7, 2025-08-03); an upgraded database with 67,281 unsequenced orders broke the previous-order lookup (2e152bbdd5, 2025-10-16). Veri\*factu, open: QR dropped on ePOS printing ([#235957](https://github.com/odoo/odoo/issues/235957)), PKCS12 TypeError ([#236570](https://github.com/odoo/odoo/issues/236570)), AEAT error 1103 on 17.0 ([#237783](https://github.com/odoo/odoo/issues/237783)), QR missing on the 17.0 invoice ([#238307](https://github.com/odoo/odoo/issues/238307)), all Nov–Dec 2025. Observed.
- Dolibarr, after the v24 upgrade: HMAC key undecodable, "new records silently not written" ([#39999](https://github.com/Dolibarr/dolibarr/issues/39999), open); invoices cannot be validated ([#40153](https://github.com/Dolibarr/dolibarr/issues/40153)); every pre-v19 record shows KO ([#42089](https://github.com/Dolibarr/dolibarr/issues/42089)); v18 lines KO from a wrong format migration ([#42245](https://github.com/Dolibarr/dolibarr/issues/42245)); the first record always KO on fresh activation ([#41504](https://github.com/Dolibarr/dolibarr/issues/41504)); with no encryption key configured, secrets stored in clear and the HMAC key leaking into error messages ([#41250](https://github.com/Dolibarr/dolibarr/issues/41250), open); a malformed signed file list shipped ([#41403](https://github.com/Dolibarr/dolibarr/issues/41403)). All Sept–Oct 2026. Observed.
- OCA: an infinite retry loop filled databases with gigabytes of response rows ([#4810](https://github.com/OCA/l10n-spain/issues/4810)); editing a customer changed an already-accepted invoice ([discussion #4578](https://github.com/OCA/l10n-spain/discussions/4578), 2025-11-12); the record sent differs from the one hashed ([#5279](https://github.com/OCA/l10n-spain/issues/5279), open); POS chaining errors are only logged, so a failed order never gets a chain record and is never sent (`l10n_es_verifactu_pos_oca/models/pos_order.py:93-103`; outcome Inferred); a renumbering deadlock ([#5170](https://github.com/OCA/l10n-spain/issues/5170), open); `IdSistemaInformatico` error 1177 which the maintainer called "algo aleatorio" ([#4376](https://github.com/OCA/l10n-spain/issues/4376), [#4451](https://github.com/OCA/l10n-spain/discussions/4451)). Observed.
- WordPress plugins, in their own changelogs: B2Brouter silently dropped the refund reason on every release (1.0.5) and under-reversed VAT on rectificativas (1.0.6); Gwii Invoice Hash generated no hash on databases without `GET_LOCK` (1.1.1) and records nothing for partial refunds. Observed.

**Withdrawn or changed claims.**

- Encadena SIF 1.5.3 withdrew its no-VERI\*FACTU mode: "It never signed records with XAdES, so it could not be declared as a SIF" (`readme.txt:136-139`). Observed.
- wp-ticketbai is being discontinued and kept "unicamente para clientes antiguos" (readme @ 3.47). Observed.
- Turbo Retail Suite relabelled its ticket "NOT AN INVOICE" and disclaimed Veri\*factu (1.5.0, 2026-10-12). Observed.
- Pastèque's own site contradicts itself: "Respect LF2016" still says "n'est plus conforme" since 1 Sept 2025, while the 2026-02-13 news says use is legal again. Observed.
- Stale legal statements on vendor pages: SumUp's French guides say self-certification "n'est plus acceptée" (Unverified, snippets) and its Spanish page gives 2026 deadlines (Observed); Odoo's Veri\*factu module ships on 17.0 under an "18+" declaración (Inferred).

**The French regime itself (policy record, Observed).**

- The 2025 abolition of attestations was justified by "la prolifération des logiciels de caisse dits permissifs auto-certifiés", publishers competing "à rendre plus permissifs leurs propres logiciels" ([amendment I-1548, 2024-10-18](https://www.assemblee-nationale.fr/dyn/17/amendements/0324A/AN/1548.pdf)).
- Counter-evidence in the 2026 debate: of more than 4,000 inspections in 2022–2024, "une seule opération a abouti à la sanction d'un éditeur", self-attested; and a Paris appeal-court ruling (24 June 2020) on a *certified* package diverted to fraud by its installation ([amendment I-CF602, 2025-10-17](https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/CION_FIN/CF602.pdf)). Certification put at about €20k, then €3.8–6k a year.
- A written question says a 35-year publisher had to stop trading ([QE 7756, JO 2025-06-24](https://questions.assemblee-nationale.fr/dyn/17/questions/QANR5L17QE7756.pdf)). Claim as reported.
- The government's answer to QE 8260 (JO 2026-03-10): "Le recours à un organisme agréé n'est donc plus, à ce jour, obligatoire (cf article 125 de la loi de finances pour 2026)". Its answer to QE 11484 (JO 2026-02-10) says BOFiP tolerances gave publishers until 1 Sept 2026.

**Spain.**

- AEAT's VERI\*FACTU page (updated 2026-11-17) carries a 05/10/2026 ministry notice forecasting a further postponement ([sede page](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html)). Observed. Press reports October 2028 pending a BOE text ([wwwhatsnew, 2026-10-06](https://wwwhatsnew.com/2026/10/06/hacienda-verifactu-octubre-2028-aplazamiento-factura-electronica-2026)). Unverified.
- AEAT's "Operación Amperio" (2025-07-16) targeted dual-use software in one sector: 75 sites, 67 companies ([Hacienda press release](https://www.hacienda.gob.es/es-ES/Prensa/Noticias/Paginas/2025/20250716-NP-AEAT-OPERACION-AMPERIO.aspx)). Observed; it named no till vendor.
- No press naming a vendor that missed the 29 July 2025 producer deadline, no confirmed AEAT submission outage, and no merchant fined over a till's certificate version were found.

---

## 7. Not opened, not found, unverified

- Odoo's French attestation PDF (behind the contract form), the odoo/enterprise repository, and core `point_of_sale` refund code.
- Infocert's and LNE's certificate registers, so the NF525 status of Odoo, Dolibarr and Lightspeed K-Series is from vendor or partner pages only.
- FacturaScripts' Verifactu source and declaración text; B2Brouter's and FacturaONE's declaraciones; Square's and SumUp's Spanish declaraciones.
- Hiboutik: nothing on any item.
- Webkul's and Quaderno's server code; commercial plugins outside wordpress.org.
- The Hacienda Foral registers of *software garante*; whether OCA's demo developer (Binovo) is listed.
- The Dolibarr wiki module page (404) and its Spanish Dolistore module pages.
- economie.gouv.fr's certification page (403).
- Monthly and annual closures and archive screens for SumUp, Lightspeed and Square.
- Restore-from-backup behaviour: no product other than Dolibarr documents any detection, and Dolibarr's is conditional. Its end-of-chain flag detects rows deleted from the tail of the chain. By default the flag is stored in the database's `const` table, so a full database restore rolls the chain and the flag back together and leaves nothing to compare; only when `BLOCKEDLOG_END_FLAG_IN_A_FILE` is defined is the flag a file under the data directory (`blockedlog.class.php:1456-1512, 1585-1609, 1658-1665 @ doli@681d5c69`). Observed. That file-based flag can expose a database restore only if the file is not restored with the database. Inferred.

---

## Sources

**Primary legal and administrative**
- BOFiP BOI-TVA-DECLA-30-10-30, 25/03/2026: https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20260325
- BOFiP BOI-TVA-DECLA-30-10-30, 01/10/2025: https://bofip.impots.gouv.fr/bofip/10691-PGP.html/identifiant=BOI-TVA-DECLA-30-10-30-20251001
- AEAT FAQ, certificación y declaración responsable (updated 21/10/2026): https://sede.agenciatributaria.gob.es/Sede/en_gb/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/certificacion-sistemas-informaticos-declaracion-responsable.html
- AEAT VERI\*FACTU page (updated 17/11/2026): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html
- Assemblée nationale amendment I-1548 (PLF 2025): https://www.assemblee-nationale.fr/dyn/17/amendements/0324A/AN/1548.pdf
- Assemblée nationale amendment I-CF602 (PLF 2026): https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/CION_FIN/CF602.pdf
- Written question 7756: https://questions.assemblee-nationale.fr/dyn/17/questions/QANR5L17QE7756.pdf
- Hacienda, Operación Amperio (2025-07-16): https://www.hacienda.gob.es/es-ES/Prensa/Noticias/Paginas/2025/20250716-NP-AEAT-OPERACION-AMPERIO.aspx

**Vendors' own pages**
- Odoo: https://www.odoo.com/my/contract/french-certification · https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations/france.html · https://www.odoo.com/documentation/19.0/applications/finance/fiscal_localizations/spain.html · https://www.odoo.com/es/blog/viaje-5/get-the-anti-fraud-certification-with-odoo-464
- OCA: https://github.com/OCA/l10n-spain/discussions/4451 · https://github.com/OCA/l10n-spain/issues/5279
- Dolibarr: https://wiki.dolibarr.org/index.php/Law_SIF_for_the_AEAT_In_Spain
- FacturaScripts: https://facturascripts.com/plugins/verifactu · https://facturascripts.com/publicaciones/como-configurar-verifactu · https://facturascripts.com/plugins/tpvneo
- Quaderno: https://quaderno.io/es/legal/verifactu
- Webkul: https://store.webkul.com/woocommerce-pos-french-nf525-certified.html · https://webkul.com/blog/woocommerce-pos-nf525-certification-user-guide/
- YITH: https://support.yithemes.com/hc/en-us/articles/4574026385169
- WooCommerce POS: https://woocommerce.com/document/woo-mobile-app-point-of-sale-mode/
- SumUp: https://www.sumup.com/fr-fr/business-guide/certification-nf525/ · https://help.sumup.com/en-GB/pos/articles/75000046313 · https://www.sumup.com/es-es/ley-antifraude/ · https://www.sumup.com/fr-ch/business-guide/ticket-z-mensuel/
- Lightspeed: https://resto-support.lightspeedhq.com/hc/fr/article_attachments/18925457822747 · https://resto-support.lightspeedhq.com/hc/articles/360001879434 · https://resto-support.lightspeedhq.com/hc/en-us/articles/226305867 · https://www.lightspeedhq.com/fr/blog/certification-caisse-enregistreuse/ · https://pdf.lightspeedhq.com/legal/es/Responsible_Declaration_Verifactu_latest.pdf · https://www.lightspeedhq.com/es/legal/declaracion-responsable-verifactu/ · https://k-series-support.lightspeedhq.com/hc/en-us/articles/53394509875099
- Square: https://squareup.com/fr/fr/legal/general/anti-vat-fraud-attestation · https://squareup.com/help/fr/fr/article/7628-article-88 · https://squareup.com/help/fr/fr/article/7940-z-de-caisse · https://squareup.com/help/es/es/article/8536-enable-veri-factu-for-your-square-business · https://squareup.com/help/es/es/article/6116-process-refunds · https://squareup.com/help/es/es/article/6139-print-receipts

**Secondary (labelled where used)**
- https://www.auguria.fr/blog/actualites-publications-5/nf525-pos-odoo-ou-en-est-la-conformite-225
- https://www.hors-du-commun.fr/blog/tout-savoir-sur-odoo-2/le-logiciel-de-caisse-odoo-est-il-certifie-nf525-65
- https://www.holded.com/es/blog/tpv-verifactu
- https://wwwhatsnew.com/2026/10/06/hacienda-verifactu-octubre-2028-aplazamiento-factura-electronica-2026

**Code** — at the revisions in the table at the top: odoo/odoo (`l10n_fr_pos_cert`, `l10n_fr`, `account`, `l10n_es_edi_verifactu`, `l10n_es_edi_verifactu_pos`, `l10n_es_edi_tbai`, `l10n_es_edi_tbai_pos`); OCA/l10n-spain (`l10n_es_verifactu_oca`, `l10n_es_verifactu_pos_oca`, `l10n_es_aeat`, `l10n_es_ticketbai*`); Dolibarr/dolibarr (`htdocs/blockedlog`, `htdocs/takepos`, `htdocs/compta/cashcontrol`); pasteque-server and pasteque-desktop; wordpress.org plugins woocommerce-es 3.5.0, woocommerce-quaderno 2.7.19, wp-facturaone 5.55, wp-ticketbai 3.47, b2brouter-for-woocommerce 1.0.6, encadena-sif 1.5.4, freefactu 1.1.2, kiwiz 2.2.1, Turbo Retail Suite 1.5.0.
