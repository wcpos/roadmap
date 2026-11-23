# What Veri\*factu requires of invoicing software and its producer

**Research note, 2026-11-23.** Ticket [#644](https://github.com/wcpos/roadmap/issues/644) on map [#640](https://github.com/wcpos/roadmap/issues/640). This note covers what RD 1007/2023 (the *RRSIF*) and Orden HAC/1177/2024 (the *Orden*) require of invoicing software, in VERI\*FACTU mode and in no-VERI\*FACTU mode, and what the software's producer must declare. It goes down to the record, hash, QR, signature and submission formats. It does not propose a design.

It builds on two earlier notes and does not repeat them: `docs/research/2026-09-11-fiscal-compliance-groundwork.md` (the "groundwork note") and `docs/research/2026-11-20-fiscal-rules-on-post-sale-edits.md`. Product code was not read.

**Labels.** Every conclusion is marked:
- **Observed**: read in the primary text cited, or reproduced by running it.
- **Inferred**: my reading of primary texts. It is not stated in them.
- **Unverified**: from a secondary source, or not checked.

Primary sources are BOE texts, AEAT documents and a Ministerio de Hacienda note. Secondary sources are marked **[secondary]**. Each source's date is in §19. Nothing here is legal advice. The questions that need a Spanish tax adviser are in §15, for [#646](https://github.com/wcpos/roadmap/issues/646).

---

## 0. Bottom line

1. **VERI\*FACTU is the less work, by AEAT's own statement.** AEAT says: "para los productores de SIF, los SIF «VERI\*FACTU» resultan más sencillos de producir que los sistemas de emisión de facturas no verificables, ya que tienen bastantes menos requisitos técnicos y de seguridad" (FAQ *Sistemas VERI\*FACTU*). The Orden art. 3 lifts arts. 6.b–f, 7.f, 7.h–j, 8 and 9 from a system while it runs as VERI\*FACTU. Those cover the signature, self-verification, the alarm, the clock duty, chain navigation, retention and export, and the event log. **Observed.** The comparison is in §12.
2. **There is no "no-VERI\*FACTU only" product.** Every invoicing system must be able to submit to AEAT (RRSIF art. 8.1, second paragraph). AEAT: "no se admite la producción de sistemas que únicamente emiten facturas no verificables". A product is therefore *solo VERI\*FACTU* or *dual*. **Observed.** So no-VERI\*FACTU is always work added on top of VERI\*FACTU, never an alternative to it.
3. **Both modes need a qualified electronic certificate.** VERI\*FACTU uses one to authenticate the submission. No-VERI\*FACTU uses one to sign every billing and event record, and it must still be able to submit when AEAT asks (a *requerimiento*). The signing certificate must belong to the taxpayer or to its authorised representative. AEAT also says a system cannot even be tested without one installed. **Observed** (Orden arts. 4.b, 5, 14; signature spec §3; developer FAQ nos. 3 and 11).
4. **A till that issues receipts on its own is its own invoicing system with its own chain.** There is one chain per (system, taxpayer) pair. A point of sale that issues invoices independently is a separate system and needs its own installation number. Billing records may not be generated later at a back office: AEAT says "ese volcado ulterior no es en sentido propio una facturación". The record must exist when the receipt and its QR are handed over. **Observed** (Orden art. 7.c; FAQs on traceability and transmission capacity; developer FAQ no. 5). What this means for a till that sells offline is **Inferred** in §3.3.
5. **The dates are moving, but the law has not changed yet.** On 5 October 2026 Hacienda announced it would postpone the pending RRSIF obligations to October 2028. As of 23 November 2026, the BOE consolidated text still reads 1 January 2027 and 1 July 2027, and AEAT's own note (13 October 2026) still states those dates. The producer clause (nine months from the Orden, so 29 July 2025) was not moved by any of the changes, and the announcement covers only obligations "pendientes de aplicación". **Observed** (texts). That it would not revive or move the producer date is **Inferred** (§13).

---

## 1. The texts and their status

| Text | What it does | Status on 2026-11-23 |
|---|---|---|
| Ley 58/2003 (LGT) art. 29.2.j | Duty of "productores, comercializadores y usuarios" that systems guarantee "integridad, conservación, accesibilidad, legibilidad, trazabilidad e inalterabilidad"; certification may be required by regulation. | In force since 11 Oct 2021 (Ley 11/2021). **Observed.** |
| LGT art. 201 bis | Infraction for making or selling non-compliant systems. Fines: €150,000 per financial year in which there were sales, per system type; €1,000 per system sold without the certificate (letter f); €50,000 per year for a user holding an uncertified or altered system. | In force since 11 Oct 2021. **Observed.** This confirms the groundwork note's secondary-source figures. |
| RD 1007/2023 (RRSIF) | The regulation itself (arts. 1–17). It also amends RD 1619/2012 (the invoicing regulation, *ROF*) to require the QR and the legend (ROF arts. 6.5, 7.5). | Consolidated text "última actualización publicada el 03/12/2025". No later amendment. **Observed.** |
| RD 254/2025 | First postponement (to 2026 dates). | Superseded by RDL 15/2025. **Observed.** |
| RDL 15/2025, disposición final primera | Rewrites RRSIF DF 4ª: companies paying corporate tax (art. 3.1.a) before **1 Jan 2027**, everyone else before **1 Jul 2027**. Producers must offer adapted products within **nine months of the Orden's entry into force**. | BOE 3 Dec 2025, in force 4 Dec 2025. **Observed.** |
| Orden HAC/1177/2024 | Technical development: chain, event log, hash, signature, declaración responsable, submission, QR. The annex lists value codes (L1–L17, L1E–L4E). The field tables live in AEAT's record designs. | BOE 28 Oct 2024, in force **29 Oct 2024**; correction BOE 8 Nov 2024. **Observed.** |
| AEAT technical documents | Hash, QR, signature, web services, validations, XSD/WSDL (versions in §19). The Orden's DA 1ª authorises AEAT to complete the details "sin modificarlas". | Live on sede.agenciatributaria.gob.es and the developer portal. **Observed.** |
| Hacienda *nota informativa*, 5 Oct 2026 | Announces postponement of the pending obligations to October 2028 (§13). | An announcement, not a legal text. **Observed.** |

---

## 2. Who is in scope, and how software could know

### 2.1 Taxpayers

AEAT summarises scope as the "regla de los 4 «NO»". The RRSIF applies to a business established in Spain that issues invoices, *including simplified invoices*, unless any one of these is true:
- it invoices only by hand;
- it is in the SII, compulsorily or voluntarily;
- its tax domicile is in the Basque foral territories or Navarre;
- it holds an art. 5 non-application resolution.

**Observed** (FAQ *ámbitos de aplicación*; RRSIF arts. 1.3, 3, 4, 5).

- **SII.** "El ámbito subjetivo de ambos proyectos es excluyente". A taxpayer in the SII must not submit to VERI\*FACTU and must not print the tax QR. It stops doing both from the moment it begins complying with the SII, without waiting for year end. **Observed** (RRSIF art. 3.3; FAQ *ámbitos*).
- **Foral territories.** The test is tax domicile under the Concierto (Ley 12/2002 arts. 6, 14) and the Convenio (Ley 28/1990 arts. 9, 18). Canarias, Ceuta and Melilla *are* in scope, with IGIC and IPSI in place of VAT (tax code L1: 01 VAT, 02 IPSI, 03 IGIC, 05 other). **Observed.**
- **Retail tickets are in.** "Las facturas simplificadas están sometidas al RRSIF". A day-end summary invoice does not replace the per-ticket records. **Observed** (FAQ *ámbitos*, "Una tienda emite facturas simplificadas…").
- **Online shops are in.** "la forma convencional o virtual … es indiferente". **Observed** (FAQ *ámbitos*, "¿Están afectadas las tiendas online?").
- **Special VAT regimes.** Businesses under the equivalence surcharge, simplified or agricultural regimes are generally not obliged to issue invoices. They fall in scope only when they do issue invoices or simplified invoices through an invoicing system. Pharmacies on direct estimation are in. **Observed.**
- **Simplified invoice ceilings.** €400, or €3,000 for retail and the other activities listed in ROF art. 4.2. AEAT rejects an F2 record whose base plus VAT exceeds €3,000 (+€10 tolerance) (validations §15.8). **Observed.**

### 2.2 How the software would know

No text requires the software to work out whether its user is in the SII, foral, or exempt. AEAT treats the choice of regime as the user's, made when the product is installed and not changeable per session or per invoice. The developer FAQ (no. 3) says "el usuario deberá elegir previamente qué tipo de SIF quiere utilizar y lo instalará… que ya permanecerán así". A product that serves several regimes (RRSIF, TicketBAI, SII) is "un paquete o familia" of separate products. The declaración responsable belongs only to the RRSIF-compliant one. **Observed** (developer FAQ no. 3). That the software therefore learns the regime from a merchant declaration at setup, not by detection, is **Inferred**.

### 2.3 Several taxpayers in one system

The system must behave as a separate system per taxpayer (Orden art. 2):
- separate records;
- a separate chain and event log;
- VERI\*FACTU switchable independently;
- the active taxpayer visible at all times;
- a notice if more than one taxpayer is configured.

Each batch sent to AEAT may carry only one taxpayer's records. The record fields `TipoUsoPosibleMultiOT` and `IndicadorMultiplesOT` declare this. The second is computed per user of a SaaS system, not globally. **Observed** (Orden art. 2; FAQ *Sistemas VERI\*FACTU*; developer FAQ no. 4).

---

## 3. What counts as one system, and the chain

### 3.1 Identity

A system is identified by **taxpayer NIF + system ID + installation number**:
- **System ID** (`IdSistemaInformatico`): 2 characters, each an upper-case letter (not Ñ) or a digit, chosen by the producer. It is unique in combination with the producer's identifier.
- **Installation number** (`NumeroInstalacion`, max 100 characters) "no puede repetirse nunca", even after reformatting and reinstalling on the same machine. AEAT suggests an install timestamp or a never-reused sequence.
- **Version** does not change the identity.
- Each "facturación" of the same taxpayer at a separate, independent billing centre ("como tiendas") needs its own installation number.

**Observed** (developer FAQ no. 4; validations §3.1.5; XSD `SistemaInformaticoType`).

### 3.2 One chain per (system, taxpayer)

- **Scope of the chain.** "Para un determinado obligado tributario, cada sistema informático producirá una única cadena". Alta and anulación records share the chain. **Observed** (Orden art. 7.c–d).
- **Not per series.** Invoice series and year changes do not start a new chain. An ERP whose modules each use their own series but are centrally controlled has one chain. Disconnected modules, which generate records and QR codes independently, are separate systems with separate chains. **Observed** (FAQs *trazabilidad* and *Sistemas VERI\*FACTU*).
- **Tills.** "si un OT dispone de varios TPV … que expiden o gestionan la expedición de sus propias facturas de forma independiente … cada TPV se considera que es un SIF … deberá poseer su propia cadena". Two unconnected billing centres are two systems, and each can run in a different mode. AEAT discourages mixing modes because AEAT's lists of issued invoices are then incomplete. **Observed** (FAQs *trazabilidad*, *capacidad de remisión*).
- **First record.** It carries `PrimerRegistro = S` and no previous-record block. Its hash input still contains `Huella=` with an empty value (§6). If a record marked first reaches AEAT when records already exist for that system and NIF, AEAT accepts it with an error. **Observed** (Orden art. 7.b; hash spec §5; validations §4.3.1).
- **Time.** The generation timestamp carries the time-zone offset, which must be the offset of the territory issuing the invoice (Orden art. 7.e, 7.g). In no-VERI\*FACTU mode the user must keep the clock within **one minute** (art. 7.f, waived for VERI\*FACTU). Before each new record, a no-VERI\*FACTU system must check two things (art. 7.i, waived for VERI\*FACTU):
  - the previous record is correctly chained, including its own stored previous hash;
  - the previous record's timestamp is not more than one minute ahead of now.

  A failed check raises the alarm and writes an event, but invoicing "NUNCA debe interrumpirse". **Observed** (Orden arts. 3, 7; developer FAQ no. 15).

### 3.3 Tills, back office, offline

The developer FAQ (no. 5) accepts two architectures:
- **Server generates.** The point of sale captures the sale, the back office generates the alta record in real time and returns it, and the till prints the invoice with the QR.
- **Till generates.** The till generates the record and prints, and the back office only forwards the record to AEAT "sin más".

Both are subject to these conditions:
- the link between components must be "indefectible y necesaria", not left to the user;
- there must be no invoice without a record, no record without an invoice, and (VERI\*FACTU) no record left unsent;
- the record must exist when the invoice and its QR are issued;
- nothing in between may alter the record;
- in no-VERI\*FACTU mode, whoever issues the invoice must also produce the *signed* record at the same moment ("el RF solo se considera generado cuando está firmado");
- every component that plays a part must be covered by a declaración responsable (§11).

**Observed.**

Generating at a central point after the receipt has been handed over is refused (FAQ *capacidad de remisión*). **Observed.**

In VERI\*FACTU mode, failed transmission (power, network, AEAT down) never stops invoicing. Records are queued and resent in generation order, flagged `Incidencia = S`, retried at least hourly, and a pending-count warning stays on screen until all are sent (§9.6). **Observed.**

**Inferred** from the above: a till that prints a receipt while it cannot reach the server has two compliant shapes.
- **The till is a system.** It generates and chains the record itself, as its own system with its own installation number. In no-VERI\*FACTU mode it also signs at that moment.
- **The server is the system.** The till cannot issue until the server answers.

Collecting till sales on the server and creating the records later is the shape AEAT rejects. The QR does not get in the way of the first option: it carries only NIF, series and number, date and total, and no hash (FAQ *huella*), so a till can render it without the server. Whether a WCPOS till that sells offline counts as a separate system is question Q4.

---

## 4. The *registro de facturación de alta*, field by field

The legal content is RRSIF art. 10.1 (letters a–q). The structure is XSD `RegistroFacturacionAltaType` (SuministroInformacion.xsd, production, fetched 2026-11-23). The format is XML, UTF-8 (Orden art. 10). Amounts are in euros: a foreign-currency invoice is converted (RRSIF art. 10.2). Numbers have no leading zeros (web-services spec §6.8). Dates are `DD-MM-YYYY`. The timestamp is ISO 8601 with offset. Leading and trailing spaces are trimmed by AEAT.

| XSD element (cardinality) | RRSIF art. 10.1 | Mapping for a till receipt (simplified invoice) |
|---|---|---|
| `IDVersion` (1) | — | `1.0` (list L15). |
| `IDFactura/IDEmisorFactura` (1) | a | Issuer NIF. Must equal the header's `ObligadoEmision/NIF`. |
| `IDFactura/NumSerieFactura` (1, ≤60) | d | Series and number in **one** string. Printable ASCII 32–126, but not `" ' < > =`. Together with NIF and date it is the record's unique key. AEAT rejects a duplicate key, and numbers are never reused, not even for test invoices (developer FAQ no. 6). |
| `IDFactura/FechaExpedicionFactura` (1) | e | Issue date. Not in the future, not before 28-10-2024. Generally the same day as record generation and submission (FAQ *Sistemas VERI\*FACTU*). |
| `RefExterna` (0..1, ≤60) | — | Free reference. AEAT queries can filter on it. |
| `NombreRazonEmisor` (1, ≤120) | a | Issuer name. |
| `Subsanacion`, `RechazoPrevio` (0..1) | — | Correction flags (§8). |
| `TipoFactura` (1) | f | List L2: **F2** = "Factura Simplificada y Facturas sin identificación del destinatario art. 6.1.d)"; F1 = full invoice; F3 = full invoice issued in place of simplified ones; R1–R4 corrective; **R5** = corrective of a simplified invoice. |
| `TipoRectificativa` (0..1) | g | Required for R1–R5: **S** (by substitution) or **I** (by difference) (L3). |
| `FacturasRectificadas` (0..1, ≤1000 IDs) | g | IDs of corrected invoices. Optional even for R types. |
| `FacturasSustituidas` (0..1, ≤1000 IDs) | h | F3 only: the simplified invoices it replaces. |
| `ImporteRectificacion` (0..1) | g | Required when `TipoRectificativa = S`. |
| `FechaOperacion` (0..1) | e | The transaction date when it differs from the issue date. |
| `DescripcionOperacion` (1, ≤500) | i | General description. Required. |
| `FacturaSimplificadaArt7273` (0..1) | f | Qualified simplified-invoice flag (allowed for F1, F3, R1–R4). |
| `FacturaSinIdentifDestinatarioArt61d` (0..1) | f | Allowed only for F2 and R5. |
| `Macrodato` (0..1) | — | Required if \|total\| ≥ €100,000,000. |
| `EmitidaPorTerceroODestinatario`, `Tercero` (0..1) | c | Third-party or recipient issuance. |
| `Destinatarios/IDDestinatario` (0..1, ≤1000) | b | **Must be absent for F2 and R5.** NIF, or `IDOtro` with a type code (L7: 02 EU VAT number, 03 passport, 04 foreign ID, 05 residence certificate, 06 other, 07 "no censado"). |
| `Cupon` (0..1) | — | Coupon flag. |
| `Desglose/DetalleDesglose` (1..**12**) | k, l, m, n | Tax breakdown lines, not item lines. Each holds: `Impuesto` (L1); `ClaveRegimen` (L8A/L8B, e.g. 01 general, 18 equivalence surcharge, 20 simplified regime); then either `CalificacionOperacion` (S1 / S2 / N1 / N2) or `OperacionExenta` (E1–E6); `TipoImpositivo`; `BaseImponibleOimporteNoSujeto`; optional `BaseImponibleACoste`; `CuotaRepercutida`; and optional equivalence-surcharge rate and amount. |
| `CuotaTotal` (1) | m | Sum of tax amounts (±€10 tolerance, else accepted with error). |
| `ImporteTotal` (1) | j | Sum of base + tax + surcharge (±€10 tolerance). It **excludes** suplidos, financial surcharges and withholdings. AEAT suggests printing a separate "Total a pagar" (developer FAQ no. 20). |
| `Encadenamiento` (1): `PrimerRegistro` **or** `RegistroAnterior` (`IDEmisorFactura`, `NumSerieFactura`, `FechaExpedicionFactura`, `Huella`) | ñ | Chain to the record immediately before in generation order, alta or anulación (Orden art. 7.a). The Orden says "primeros 64 caracteres", which is the whole SHA-256 hex hash. |
| `SistemaInformatico` (1) | o | Producer `NombreRazon`; producer `NIF` **or** `IDOtro` (a foreign producer uses `IDOtro`; type 02 must be a valid EU VAT number; type 07 is not allowed); `NombreSistemaInformatico` (≤30); `IdSistemaInformatico` (2); `Version` (≤50); `NumeroInstalacion` (≤100); `TipoUsoPosibleSoloVerifactu`, `TipoUsoPosibleMultiOT`, `IndicadorMultiplesOT` (S/N each). |
| `FechaHoraHusoGenRegistro` (1) | p | Generation timestamp with offset. A time ahead of AEAT's clock is accepted with error. |
| `NumRegistroAcuerdoFacturacion`, `IdAcuerdoSistemaInformatico` (0..1) | DA 1ª RD 1007/2023, Orden art. 12 | Only when AEAT has granted an invoicing authorisation. |
| `TipoHuella` (1), `Huella` (1, 64) | — | `01` = SHA-256 (L12), and this record's own hash (§6). |
| `ds:Signature` (0..1) | RRSIF art. 12 | Required in no-VERI\*FACTU mode. Optional, and accepted, in VERI\*FACTU (FAQ *firma*). |

Letter q ("características adicionales") has no field of its own beyond the above. **Observed** for everything in the table (XSD, Orden annex lists, validations v1.2.2, web-services spec v1.0.3).

**How a till receipt maps** (**Inferred** from the table):
- `TipoFactura = F2` with no `Destinatarios`;
- one `DetalleDesglose` per rate and regime combination, up to 12;
- line items do not go in the record.

The record is not the invoice. The receipt must still carry the ROF art. 7 content, plus the QR and, in VERI\*FACTU mode, the legend (ROF art. 7.5). **Observed** (ROF; developer FAQ no. 13 notes that the record does not contain invoice lines).

Not in the record (**Observed**, absent from the XSD): operator or cashier, store, till label, payment method, and item lines. This matches the 2026-11-20 note §2.4.

---

## 5. The *registro de facturación de anulación*

It is generated only "cuando se haya emitido erróneamente una factura" (RRSIF art. 11.1). AEAT calls annulment "un concepto fáctico, no jurídico", for an invoice for a transaction that did not happen. Examples are a test or training invoice, or a failed issuance that never reached the customer. It is not for price or VAT errors, which go through a corrective invoice. **Observed** (developer FAQ no. 17).

XSD `RegistroFacturacionAnulacionType`:
- `IDVersion`;
- `IDFactura` (`IDEmisorFacturaAnulada`, `NumSerieFacturaAnulada`, `FechaExpedicionFacturaAnulada`);
- `RefExterna`;
- `SinRegistroPrevio`: annulling a record that AEAT does not hold;
- `RechazoPrevio`;
- `GeneradoPor` (E/D/T) and `Generador`;
- `Encadenamiento`;
- `SistemaInformatico`;
- `FechaHoraHusoGenRegistro`;
- `TipoHuella`, `Huella`;
- `ds:Signature`.

It is chained in the same chain as the alta records. The annulled invoice keeps its number in the series, and both records stay "a fin de preservar la integridad de la cadena". An annulment may be generated by a system other than the one that issued the invoice. **Observed** (RRSIF art. 11.2; FAQ *anulación*; developer FAQ no. 17).

---

## 6. The hash (*huella*)

- **Algorithm.** SHA-256, the only value in list L12 (hash spec v0.1.2, 27 Aug 2024). **Observed.**
- **Input, alta.** `IDEmisorFactura=…&NumSerieFactura=…&FechaExpedicionFactura=…&TipoFactura=…&CuotaTotal=…&ImporteTotal=…&Huella=<previous record's hash>&FechaHoraHusoGenRegistro=…` **Observed.**
- **Input, anulación.** `IDEmisorFacturaAnulada=…&NumSerieFacturaAnulada=…&FechaExpedicionFacturaAnulada=…&Huella=<previous>&FechaHoraHusoGenRegistro=…` **Observed.**
- **Input, event** (no-VERI\*FACTU). In this order: producer `NIF`; producer `IDOtro/ID`; `IdSistemaInformatico`; `Version`; `NumeroInstalacion`; taxpayer `NIF`; `TipoEvento`; `HuellaEvento` of the previous event; `FechaHoraHusoGenEvento`. This is a separate chain from the billing chain. **Observed.**
- **Rules.**
  - Field names are the literal XML element names, joined with `&`.
  - Values are exactly the XML values with surrounding spaces trimmed.
  - Numeric values with 1 or 2 decimals, or trailing zeros, are treated as equal.
  - A missing or empty field is written `Name=`. This includes `Huella=` on the first record.
  - The string is encoded as UTF-8 bytes.
  - The output is upper-case hex, 64 characters.
  - The hash is stored in the record's own `Huella` (or `HuellaEvento`) field, including on the first record.

  **Observed.**
- **Effect of a wrong hash.** In VERI\*FACTU, a hash that does not match AEAT's recomputation leaves the record "Aceptado con errores", and it must be corrected (*subsanar*). **Observed** (hash spec §7; validations §4.3.1).
- **Worked examples reproduced.** Running `shasum -a 256` on AEAT's three example strings gave exactly the published hashes: `3C464DAF…8F12F60` (first record), `F7B94CFD…802A2B97` (second, chained), `177547C0…388F90C68` (annulment). **Observed** (run 2026-11-23).
- **Who must check hashes.** All systems compute and chain. Only no-VERI\*FACTU systems must also offer on-demand checks of one record and of the whole chain, and must check the previous link before every new record. **Observed** (FAQ *huella*; Orden arts. 3, 6.b, 6.e, 7.i).

---

## 7. The QR and the printed wording

**Common to both modes.** **Observed** (Orden arts. 20–21; QR spec v0.5.0, 10 Dec 2025, §§2–6, 12).
- **Code.** ISO/IEC 18004:2015, error correction **M**, size **30×30 to 40×40 mm**, at least 2 mm quiet zone (6 mm recommended), high contrast.
- **Position.** At the start of the invoice, before the content the invoicing system generates. It must be the first QR on the document, and appear once (first page). Portrait: top, preferably centred. Landscape: top left. The user may choose the exact place within the top area, but may not switch the QR off (developer FAQ no. 9).
- **Label.** **"QR tributario:"** printed above the code, in type at least as large as the rest of the invoice.
- **Content.** A URL with exactly four parameters, URL-encoded UTF-8, printable ASCII only:

  | Parameter | Content |
  |---|---|
  | `nif` | issuer NIF, 9 characters |
  | `numserie` | series and number, ≤60 |
  | `fecha` | `DD-MM-AAAA` |
  | `importe` | total, ≤12 integer digits, `.` and up to 2 decimals |

  Optional `idioma` (gl, ca, eu, es, va, en) may be added. `formato=json` must **never** appear in the printed QR.
- **Electronic invoices.** A structured e-invoice carries the URL as a field instead of the image (Orden art. 20.2).
- **Thermal paper.** AEAT's own layout examples include 57 mm and 44 mm wide tickets with a 30 or 40 mm QR (QR spec §12, examples a–d, f).

**Per mode** (**Observed**, QR spec §§5, 8, 9):

| | VERI\*FACTU | no-VERI\*FACTU |
|---|---|---|
| Production URL | `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?nif=…&numserie=…&fecha=…&importe=…` | `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQRNoVerifactu?…` |
| Test URL | `https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?…` | `https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQRNoVerifactu?…` |
| Wording | "QR tributario:" above, **and** "Factura verificable en la sede electrónica de la AEAT" **or** "VERI\*FACTU" directly below. It may wrap over several lines (RRSIF DF 1ª; ROF art. 6.5.b). | "QR tributario:" only. The legend is forbidden: ROF art. 6.5.b allows it "únicamente" when all records are submitted. |
| What a scan returns | Found (result 00), or "No encontrada" (01), which is also the answer for an annulled invoice. | "No contrastable" (02). The scan only passes the data to AEAT (RRSIF art. 17). |

---

## 8. Corrections: what may and may not change

The rule: "Cualquier necesidad de corrección o anulación … deberá ser realizada mediante al menos un registro de facturación adicional posterior, de forma que se conserven inalterables los datos originalmente registrados" (RRSIF art. 8.2.a). Deleting, hiding or altering a generated record, or adding fake ones, is "alteración". Any function that allows it is non-compliant, and so is direct database editing of issued records exposed through the system (FAQs *uso múltiple* and *declaración responsable*). **Observed.**

AEAT's decision tree (developer FAQ no. 17, **Observed**):

| When the error is found | What it affects | What to do |
|---|---|---|
| Before issuing | — | Edit freely. Drafts, pro formas and delivery notes are not invoices, but under LGT art. 29.2.j their records must still be kept unaltered (developer FAQ no. 11). |
| After issuing | An ROF-defined error: amount, VAT, a return, or a missing mandatory datum | **Factura rectificativa**, a new alta record of type R1–R5. **R5** is for simplified invoices; S (substitution, with `ImporteRectificacion`) or I (differences, negative amounts allowed). A return on a till receipt is R5. |
| After issuing | Only internal record fields not visible on the printed invoice (e.g. a tax code) | Correct the invoice, then **alta de subsanación**: a new alta with the **same ID** and `Subsanacion = S`. If AEAT had rejected the original: `Subsanacion = S` and `RechazoPrevio = X`. "MUY POCO FRECUENTES". |
| After issuing | Neither an ROF error nor a record field | Correct the invoice directly. No new record. |
| After issuing | The whole invoice should never have existed (and no ROF procedure applies) | **Registro de anulación**. Then, if appropriate, a new ordinary invoice under a **new number**. |

- **A customer later asks for a full invoice** for simplified ones. Issue an **F3** listing the replaced F2s (`FacturasSustituidas`). Do not annul or correct the F2s. If an F3 itself is wrong, issue a negative F3 and then a correct F3. A partial return after an F3 needs an R5 against the F2, then an F3 that repeats the R5. **Observed** (developer FAQ no. 27; ROF art. 15.6).
- **Test and training sales.** On a live system they are real invoices. They must be annulled afterwards. AEAT suggests a distinct series (e.g. "PRU 25 XXXX") and a training feature that annuls them automatically. **Observed** (developer FAQ no. 11).
- **Never changeable after generation** (**Observed**, RRSIF art. 8.2.a; Orden art. 6):
  - any field of a generated record;
  - its position in the chain;
  - its timestamp;
  - the invoice number, which may not be reused even after annulment, because AEAT rejects the duplicate key.

---

## 9. VERI\*FACTU mode: the submission service

### 9.1 Transport and endpoints

SOAP 1.1, document/literal, over HTTPS, UTF-8, authenticated by a qualified certificate (web-services spec v1.0.3 §§3–4). **Observed.**

WSDL: `https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/SistemaFacturacion.wsdl`. It declares the ports below (fetched 2026-11-23, **Observed**):

| Service | Production | Test |
|---|---|---|
| VERI\*FACTU submission and query | `https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP` | `https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP` |
| same, "Sello" port | `https://www10.agenciatributaria.gob.es/…/VerifactuSOAP` | `https://prewww10.aeat.es/…/VerifactuSOAP` |
| Response to a requerimiento (no-VERI\*FACTU) | `…/RequerimientoSOAP` on www1 / www10 | prewww1 / prewww10 |

- **Operations.** `RegFactuSistemaFacturacion` (submit) and `ConsultaFactuSistemaFacturacion` (query, VERI\*FACTU only).
- **The "Sello" ports.** That they serve electronic seal certificates (*certificado de sello*) is **Inferred** from the name. AEAT's text here was not found.
- **Live since 23 April 2025** (developer FAQ v1.3 §2). **Observed.**

### 9.2 Whose certificate

The sender authenticates with a qualified certificate valid at AEAT (Orden art. 5). This can be:
- the taxpayer's own certificate; or
- a third party acting as representative, *apoderado*, or *colaborador social* (RD 1065/2007 arts. 79–81; Orden HAC/1398/2003).

Software companies can sign **Convenio de colaboración social nº 17** with AEAT to submit for their clients, directly or under an adviser. The client's grant of representation may be taken electronically, for example by a web form or a pop-up, provided it is completed and signed. AEAT's 18 Dec 2024 resolution (BOE 31 Dec 2024) has a model form (Anexo II). **Observed** (FAQ *Sistemas VERI\*FACTU*; developer FAQ no. 16).

Whether a producer with no Spanish establishment can sign Convenio 17 is not stated (Q7). **Unverified.**

### 9.3 Message

`RegFactuSistemaFacturacion` contains:
- **`Cabecera`**: `ObligadoEmision` (name and NIF); optional `Representante`; for voluntary submission, optional `RemisionVoluntaria` with `FechaFinVeriFactu` and `Incidencia`; for a requerimiento, `RemisionRequerimiento` with `RefRequerimiento` and `FinRequerimiento`.
- **1 to 1,000 `RegistroFactura`**, each one alta or one anulación. Altas and anulaciones may be mixed in one message, but only one taxpayer per message.

**Observed** (XSD; Orden annex §2.2; validations §3.1.2).

### 9.4 Flow control

- The wait between sends starts at **60 s**. Every response carries `TiempoEsperaEnvio`.
- The next send happens when `t` seconds have passed **or** 1,000 records are waiting, whichever comes first.
- Simplified invoices must still go "de forma inmediata", not at closing time.

**Observed** (Orden art. 16.2; web-services spec §6.4.4.1; FAQ *Sistemas VERI\*FACTU*).

### 9.5 Responses and errors

**Overall states.** `Correcto`, `ParcialmenteCorrecto` or `Incorrecto`.

**Per-record states.** `Correcto`, `AceptadoConErrores` or `Incorrecto`, each with an error code and description. A duplicate is rejected and the response carries the stored record's `IdPeticionRegistroDuplicado` and `EstadoRegistroDuplicado` (`Correcta`, `AceptadaConErrores` or `Anulada`).

**CSV.** A *código seguro de verificación* is returned when at least one record is accepted. An accepted response "no implica que los registros … sean completamente válidos".

**SOAP faults.** A malformed message or a bad header returns a SOAP Fault and rejects the whole batch:
- `soapenv:Server` fault: resend;
- `soapenv:Client` fault: fix, then resend;
- no response: resend until one arrives.

**Observed** (Orden art. 16.3, 16.5; web-services spec §§3, 5; FAQ *Sistemas VERI\*FACTU*).

**Errors that do not cause rejection but must be corrected (subsanar)** (validations §4.3.1):
- a recipient NIF that is valid but not in AEAT's census;
- a hash mismatch;
- totals outside ±€10;
- `PrimerRegistro = S` when records already exist.

**Accepted with error, no correction needed:** a generation time ahead of AEAT's clock, and a missing `ClaveRegimen` for IPSI. **Observed.**

### 9.6 When the till or the store is offline

**Observed** (Orden art. 16.4; FAQ *Sistemas VERI\*FACTU*; developer FAQ no. 2):
- Invoicing continues.
- Pending records are sent "en cuanto sea posible, respetando el orden temporal de generación" with `Incidencia = S`.
- The system retries **at least hourly**.
- It shows a warning with **how many records remain**, from the incident until the queue is empty.
- No maximum delay is fixed.
- AEAT may ask for the incident to be justified.

### 9.7 Correction and resubmission

- Rejected records must be corrected and sent again (`Subsanacion = S`, `RechazoPrevio = X` when AEAT never stored the original).
- An annulment of a record AEAT does not hold uses `SinRegistroPrevio = S`.
- Records that already exist in a no-VERI\*FACTU system and are sent after switching to VERI\*FACTU use `RechazoPrevio = X` (list L17).

**Observed** (web-services spec Annex II; Orden annex L17).

### 9.8 Committing to the mode, and leaving it

- **Opting in.** A taxpayer opts in by starting to submit systematically. There is no form 036 notice. **Observed** (RRSIF art. 16.5; FAQ).
- **Lock-in.** It must stay in the mode until 31 December of the last year it operated as VERI\*FACTU (RRSIF art. 16.5; Orden art. 17.2). **Observed.**
- **Leaving.** Opting out is done by filling `FechaFinVeriFactu` in a submission sent before the end of that calendar year. **Observed.**
- **Before the obligation dates.** AEAT treats the time before a taxpayer's obligation date as a test period. Records may stop being sent and other systems used until that date (AEAT *nota informativa*, page updated 13 Oct 2026). **Observed.**

### 9.9 Query service

`ConsultaFactuSistemaFacturacion` lets the issuer, and the recipient, list submitted records by year and month, with optional filters including `RefExterna`. Results are paginated. It works only for VERI\*FACTU (web-services spec §6.4). **Observed.**

---

## 10. No-VERI\*FACTU mode: what is added

Everything in §§4–8 applies, minus the submission. On top of it (**Observed** unless marked):

### 10.1 Signature of every billing and event record (RRSIF art. 12; Orden art. 14; signature spec v0.1.5, 6 Mar 2025)

- **Format.** XAdES Enveloped (ETSI EN 319 132 / TS 101 903), at least class **EPES**, with the AGE signature policy:
  - OID `urn:oid:2.16.724.1.3.1.1.2.1.9`;
  - URL `https://sede.administracion.gob.es/politica_de_firma_anexo_1.pdf`;
  - policy digest SHA-1 `G7roucf600+f03r/o0bAOQ6WAs0=`.
- **Algorithms.** RSA with key ≥1024 bits (ETSI TS 119 312), SHA-256 for the record signature; RSA/SHA-256 or RSA/SHA-512 preferred. A timestamp is not required (XAdES-T allowed).
- **What is signed.** The `RegistroAlta`, `RegistroAnulacion` or `RegistroEvento` node, never the outer message. The signature is stored as `Signature` inside that node. In `EventosSIF.xsd` the event signature is mandatory (`ds:Signature` minOccurs 1).
- **Whose certificate.** A qualified signing certificate, valid and unrevoked on the record's date, from a provider on the EU/EEA Trusted List. "El titular de dicho certificado debe corresponder a la empresa que emite el registro (obligado tributario) o a un representante autorizado por la misma, pudiendo ser un apoderado suyo a este trámite o un colaborador social".
- **When the record exists.** Only once it is signed (developer FAQ no. 5).
- **Checking.** Each signature must be checkable on demand (Orden art. 6.d).

### 10.2 Integrity and self-checks (Orden arts. 6, 7)

- On-demand checks: the hash and signature of any single record, and any part of the chain.
- Navigation from any record to the previous and next, showing whether each link and each timestamp order is valid.
- The art. 7.i check before every new record (§3.2).
- On any detected threat: a clear **alarm** that stays up until integrity is assured again, plus an event record.
- AEAT says the checks need only be available on demand. Running them continuously is optional (developer FAQ no. 15).

### 10.3 Event log (*registro de eventos*) (RRSIF art. 8.3; Orden art. 9; list L2E)

- **Events.** At least:
  - 01 start of operating as NO VERI\*FACTU;
  - 02 end of operating as NO VERI\*FACTU;
  - 03 billing-record anomaly check launched;
  - 04 billing-record anomaly detected;
  - 05 event-record anomaly check launched;
  - 06 event-record anomaly detected;
  - 07 backup restored, if managed by the system;
  - 08 billing records exported for a period;
  - 09 event records exported for a period;
  - **10 summary** at least once every **6 hours of operation** and before shutdown, even if nothing happened;
  - 90 producer-defined events. Anomaly types are listed in L1E.
- **Form.** XML, UTF-8, `EventosSIF.xsd`.
- **Properties.** The same integrity, chaining (its own chain through `EventoAnterior`), signature, retention and export properties as billing records.
- **Scope.** One log per taxpayer.
- **Submission.** Not sent to AEAT unless asked.
- **Dual products.** A *dual* product must implement it. A *solo VERI\*FACTU* product need not (developer FAQ no. 15, note 1).

### 10.4 Retention, export, access (RRSIF arts. 8.2.c, 8.4, 14; Orden art. 8)

- **Retention.**
  - The system keeps all records it generated, accessible and readable.
  - The user must keep them for the ROF art. 19.1 period (the LGT prescription period), even after changing system.
  - AEAT reads this as at least 4 years from the relevant filing deadline, more than 10 in some cases (FAQ *conservación*).
  - Event logs follow the same period.
- **Export.**
  - Export must be possible at least "todos los registros … generados en un periodo", as faithful copies in the art. 10/11 XML format.
  - Records may leave the system only through a successful export, oldest first, with no gaps, and with a clear warning.
  - Backups do not count as export.
- **Inspection.**
  - AEAT may turn up where the system is used and demand immediate full access, a download, and passwords (RRSIF art. 14.1).
  - Tax data must be accessible separately from confidential non-tax data (art. 8.4).
  - The records must be sendable to AEAT's requerimiento service, as generated and without correcting them (Orden art. 18; developer FAQ no. 18).
- **Clock.** The user guarantees accuracy within one minute (Orden art. 7.f).

---

## 11. The declaración responsable

### Content (Orden art. 15.1, in this order)

It is headed **"DECLARACIÓN RESPONSABLE DEL SISTEMA INFORMÁTICO DE FACTURACIÓN"**. Each item is preceded by its descriptive text. **Observed.**

| | Content |
|---|---|
| a | System name |
| b | 2-character system code |
| c | Full version identifier |
| d | Hardware and software components, and a short description of functions |
| e | Whether it can run **only** as VERI\*FACTU |
| f | Whether it supports several taxpayers |
| g | Signature types used in no-VERI\*FACTU mode |
| h | Producer's name |
| i | Producer's **Spanish NIF**, or "otro número de identificación … indicando de qué tipo … y el país" |
| j | Full postal address |
| k | A statement of compliance with LGT 29.2.j, the RRSIF, the Orden and AEAT's published specifications, for that version |
| l | Date (day, month, year) and place (town, country) |

- **Recommended annex.** Other contacts, URLs, a detailed explanation of how each specification is met, anything else (art. 15.2).
- **AEAT's example for a foreign producer.** Item i becomes "Identificación" with number, type (e.g. "02 – NIF IVA") and issuing country (examples v0.5.1, note ii). **Observed.**

### Where and when

- Readable and individualised **inside the system**, reachable "de forma rápida, fácil e intuitiva".
- Also given to the reseller and the customer at purchase and afterwards, on paper or in a widely used free electronic format.
- **Per version**: "Cada versión, por pequeña variación que introduzca, es un producto distinto".
- The producer and the reseller keep the declarations of all versions, and must produce them on request by the customer or AEAT.

**Observed** (RRSIF art. 13.2–3; Orden art. 15.3; FAQ *declaración responsable*).

### What it is not

It is not an external certification and not a registration ("auto-certificación"; "no se prevé ningún registro previo"), and it needs no electronic signature. **Observed.**

### Components and extensions

- Every producer of a component that implements a requirement, or of an extension, must give its own declaration (Orden art. 15.4).
- A component from the same producer whose version cycle is tied to the main component can be covered in the main declaration. Then any change to that component bumps the main version (developer FAQ nos. 5, 8).
- Customisation that does not touch the implementation of the requirements needs no new declaration. Customisation that does touch it needs one (developer FAQ no. 9).
- If the *user* extends the system with its own staff, the **user** becomes producer of that extension and must declare it.

**Observed** (FAQ *declaración responsable*).

### Open source

"La empresa que efectúe la programación del código o integre partes de otro software, ya sea o no de código abierto, debe realizar la declaración responsable … En el caso de que utilice código abierto, se hará responsable del funcionamiento del mismo". **Observed.**

### Records must match the declaration

The record's `SistemaInformatico` block (name, ID, version, installation, producer ID) must agree with the declaration. **Inferred** (same data in both).

### Liability

- A reseller must check that products are declared (LGT 201 bis).
- If a client declines an update, AEAT says the producer bears no liability: "recayendo la que pudiera existir sobre los usuarios mismos" (developer FAQ no. 14).
- A producer must take "cuantas medidas estén técnicamente disponibles" so security is not broken (FAQ *declaración responsable*).

**Observed.**

---

## 12. Which mode is less work, and why

| Obligation | VERI\*FACTU | no-VERI\*FACTU | Source |
|---|---|---|---|
| Alta and anulación records in the Orden's XML format | ● | ● | Orden arts. 10–11 |
| SHA-256 chain, first-record rule, timestamp with offset | ● | ● | arts. 6.a, 7.a–e, 7.g |
| QR with "QR tributario:" | ● plus the VERI\*FACTU legend | ● with no legend | arts. 20–21 |
| Capacity to submit: internet, certificate handling, SOAP client, responses | ● used continuously | ● needed anyway (requerimiento service, and the option to switch) | RRSIF 8.1; Orden art. 4 |
| Qualified certificate | ● for authentication (the taxpayer's or a representative's) | ● for **signing every record** (the taxpayer's or a representative's) and for answering a requerimiento | Orden arts. 5, 14 |
| Flow control, retry queue, incident flag, pending-count warning | ● | ○ | art. 16 |
| XAdES-EPES signature of every billing and event record, verifiable | ○ | ● | arts. 6.c–d, 14 |
| Check previous link and clock before each record | ○ | ● | art. 7.i |
| Integrity and chain checks on demand, chain navigation, persistent alarm | ○ | ● | arts. 6.b, e, f; 7.h, j |
| Event log: own chain, signed, 6-hour summary, shutdown summary | ○ (a *dual* product must still implement it) | ● | art. 9 |
| Retention for the prescription period, export by period, export-then-purge rules | ○ ("NO aparecen reguladas"; AEAT holds the records) | ● | art. 8; developer FAQ no. 13 |
| Clock accuracy ±1 min (on the user) | ○ | ● | art. 7.f |
| Lock-in to 31 Dec once started | ● | — | RRSIF 16.5; Orden art. 17 |
| Declaración responsable per version | ● (states "solo VERI\*FACTU") | ● (states signature types) | art. 15 |

**Verdict: VERI\*FACTU is less work.** AEAT says so in terms (§0.1). The Orden's art. 3 waiver removes the signing engine, the event log and its signed chain, the self-verification interfaces, the alarm, and the retention and export machinery. A no-VERI\*FACTU build must have all of the VERI\*FACTU capacity *and* those (§0.2). VERI\*FACTU's own extra costs are these: a certificate for authentication with a working connection from the system to AEAT, the 60-second flow control, a queue that survives outages, and the lock-in to year end. **Observed** (texts). The weighing is **Inferred**.

This agrees with the map's binding correction ("Spain's no-VERI\*FACTU mode is the harder one").

---

## 13. The announced postponement to October 2028

- **What was announced.** Hacienda's *nota informativa* of 5 October 2026 announces "proceder al aplazamiento de las obligaciones pendientes de aplicación del Real Decreto 1007/2023 … hasta octubre de 2028". The aim is to make them coincide with mandatory e-invoicing for businesses with turnover up to €8 m. A later amendment would bring the scopes and "ciertos aspectos técnicos" closer to e-invoicing and ViDA. The note says the integrity, retention, accessibility, legibility, traceability and inalterability requirements "se mantendrán en términos sustancialmente equivalentes". **Observed.**
- **Legal status on 2026-11-23.** No amending text found. The BOE consolidated RRSIF is still at its 03/12/2025 version (fetched 2026-11-23). AEAT's own note, updated 13 Oct 2026, still gives 1 Jan 2027 and 1 Jul 2027. Secondary press reports agree it is "pendiente" of a BOE rule [secondary: autointellia.com, dsi-net.com, facturadirecta.com, xataka.com, all Oct–Nov 2026]. **Observed** for the BOE and AEAT texts. The press is **Unverified**.
- **The e-invoicing calendar it would align to.** Orden HAC/1028/2026 entered into force 6 Oct 2026. B2B e-invoicing obligations under RD 238/2026 start 6 Oct 2027 for turnover above €8 m and 6 Oct 2028 for everyone else (AEAT *novedades* page, updated 12 Nov 2026). **Observed.** Whether "octubre de 2028" means 6 October 2028 is **Unverified**.
- **What it would change (Inferred).**
  - The taxpayer dates (2027) would move. One date may replace the corporate/other split, but the note does not say.
  - Until then, use stays voluntary.
- **What it would not change (Inferred).**
  - The **producer** obligation: its nine-month clock ran from 29 Oct 2024 to **29 Jul 2025**, and it is not "pendiente".
  - The technical content: hash, QR and records are the same today.
  - The LGT art. 29.2.j and 201 bis duties, in force since 2021.
  - AEAT's statement that adapted systems are already valid and early use is "vivamente" recommended (developer FAQ no. 2).
  - The note also signals a *technical* convergence amendment, which could change formats later. **Inferred** from the note; its content is unknown.

---

## 14. Producer status for a self-hosted GPL plugin sold from outside Spain, and 29 July 2025

**What the texts say** (**Observed**):
- The RRSIF applies to "los productores y comercializadores de los sistemas informáticos … en las cuestiones relativas a sus respectivas actividades de producción y comercialización de los sistemas … puestos a disposición de los obligados tributarios" in scope (art. 3.2). It sets no residence or establishment condition.
- The Orden (art. 15.1.i), the XSD (`IDOtro`) and AEAT's examples all provide for a producer without a Spanish NIF.
- For open source, the producer is whoever "efectúe la programación del código o integre partes de otro software".
- A user who modifies the system with its own staff becomes producer of that modification.
- A third party who supplies an extension is its producer.
- On-premise installs are expressly contemplated (examples v0.5.1, example 1).

**What that suggests** (**Inferred**):
- For WCPOS, the entity that publishes each Free, Pro and app version is the *productor* of what it ships, whether or not the code is GPL and wherever it is based. The merchant's server, WordPress, WooCommerce and other plugins are the installation.
- A merchant who edits the plugin, or adds a plugin that touches the order or receipt path, may become producer of that change.
- Whether WooCommerce core, which numbers orders and holds them, is itself a component that needs a declaration is open (Q3).

**What 29 July 2025 means.**
- The Orden entered into force 29 Oct 2024. Producers "deberán ofrecer sus productos plenamente adaptados" within nine months, which is 29 July 2025. AEAT calls this "una fecha clave para los productores y comercializadores". **Observed** (RRSIF DF 4ª as rewritten by RDL 15/2025; developer FAQ no. 1).
- AEAT's transition table: from 29 July 2025 a *new* client "solo puede contratar un SIF adaptado (el fabricante está obligado a ofertar únicamente productos adaptados)". An existing client with a maintenance contract may keep a non-adapted system until its own 2027 date. **Observed.**
- **Inferred** for software first offered after that date: it has to be adapted from the day it is offered, because no grace period exists for it. Offering a non-adapted system after that date is within the conduct LGT art. 201 bis.1 describes (e.g. letter e, "no cumplan con las especificaciones técnicas"; letter f, not certified). Whether that reaches a non-resident producer of a free GPL plugin, and from which date, is a legal question (Q1, Q2).
- **Not answered by the texts:** whether a merchant using a non-adapted system *before* its own 2027/2028 date makes the producer liable. AEAT's FAQ puts responsibility for not updating on the user (developer FAQ no. 14). **Observed** that the FAQ says so. Its legal weight is **Unverified**.

---

## 15. Questions for a Spanish tax adviser (for [#646](https://github.com/wcpos/roadmap/issues/646))

Each question is tied to the provision it turns on.

1. **LGT art. 201 bis.1 and 201 bis.4; RRSIF art. 3.2.** Can a producer with no establishment in Spain, distributing a free GPL plugin plus a paid extension to merchants who host it themselves, be sanctioned under art. 201 bis? If so, is the €150,000 counted per "tipo distinto de sistema" for Free and Pro separately, and does the €1,000 apply "por cada sistema … comercializado", meaning per sale or per download?
2. **RRSIF DF 4ª (RDL 15/2025), third paragraph.** Since 29 July 2025, is offering a non-adapted version to merchants in Spain an infraction in itself, before any merchant's own obligation date? Does the free availability of the Free plugin count as *comercialización*? Does the announced October 2028 postponement (Hacienda, 5 Oct 2026) reach this clause at all?
3. **RRSIF art. 1.2 and art. 13; Orden arts. 1.2.b–c and 15.4.** In a WordPress + WooCommerce + WCPOS installation, which parts are the *sistema informático de facturación*, and which are *componentes de facturación* needing their own declaración responsable? This covers WooCommerce core (order numbering and storage), the WCPOS Free plugin, the Pro plugin, and the till app on web, desktop and mobile. Can one declaration from the WCPOS producer cover WooCommerce core, which it does not produce?
4. **RRSIF art. 1.2; Orden art. 7.c; AEAT FAQ *trazabilidad* ("cada TPV se considera que es un SIF").** When a till can sell offline and later syncs to the store, is each till a separate SIF with its own chain and installation number? Or is the store the SIF, so that the till must refuse to issue while it cannot reach the store? Is an offline sale whose record is generated when it syncs the "volcado ulterior" AEAT rejects?
5. **ROF arts. 4 and 7; RRSIF art. 1.2.** Is a WCPOS till receipt a *factura simplificada*, so in scope, in each normal retail configuration? When a merchant's online WooCommerce orders are invoiced by a different invoicing plugin, are the online shop and the till two SIFs with two chains (FAQ "¿Están afectadas las tiendas online?")?
6. **Orden art. 15.1.i and annex 2.6.** With no Spanish NIF, which identifier should the producer use in the declaration and in `SistemaInformatico/IDOtro`? For example, a non-EU tax number under type 04 or 06 with its country code, or should the producer obtain a Spanish NIF?
7. **Orden art. 5; RD 1065/2007 arts. 79–81; Orden HAC/1398/2003; Convenio 17.** Can a non-resident software producer sign Convenio de colaboración social nº 17 and submit with its own certificate for merchants? Or must every merchant install its own qualified certificate on its own server?
8. **Orden art. 14 and signature spec §3.** In no-VERI\*FACTU mode the signing certificate must belong to the taxpayer or its representative. Is a merchant's qualified certificate (or seal) stored on a shared web host acceptable custody under the RRSIF? Does any rule govern where the private key lives?
9. **RRSIF art. 13; AEAT FAQ on extensions; LGT art. 201 bis.2.** If a merchant or its developer modifies the GPL code, or installs a third-party plugin that alters orders or receipts, who is the producer of the result? Does the WCPOS declaration remain valid? Does the merchant then hold an "alterado o modificado" system under 201 bis.2?
10. **RRSIF arts. 1.3 and 3.3; AEAT developer FAQ no. 3.** Is it enough for the software to rely on the merchant's own declaration at setup that it is not in the SII and not domiciled in a foral territory? Does the producer carry any duty to detect or block it?
11. **RRSIF art. 7.a; Orden art. 2.** A Pro installation with several stores belonging to one company: one SIF or several "facturaciones" each with its own installation number? Several stores belonging to different companies (NIFs) under one WordPress site: is that the multi-taxpayer case?
12. **ROF art. 19.1 and LGT art. 66; Orden art. 8.3.** For a no-VERI\*FACTU merchant who uninstalls the plugin or changes host, what exactly must be kept, by whom, and for how long? Does the producer carry any duty after the relationship ends?
13. **LGT art. 29.2.j (in force 11 Oct 2021).** Does the general integrity duty already bind a non-adapted POS used in Spain today, independently of the RRSIF dates? Does it bind its producer?
14. **Announced RRSIF amendment (Hacienda note, 5 Oct 2026).** Is anything known about the "convergencia de los ámbitos de aplicación y ciertos aspectos técnicos" that would change the record or QR formats before October 2028?

---

## 16. TicketBAI in one paragraph

TicketBAI shares Veri\*factu's shape but none of its files (**Observed** unless marked):
- **Same in both.** Every invoice, till tickets included, gets an XML record generated before the invoice image. Each record chains to the previous invoice's series, number and date. A QR goes on the document, 30–40 mm with error correction M.
- **Different in TicketBAI.**
  - Every file is **always signed** (XAdES), and the chain carries the first 100 characters of the previous file's `SignatureValue`, not a SHA-256 hash.
  - The printed **TBAI identifier** includes 13 characters of the signature and a CRC-8.
  - The QR URL differs per Hacienda Foral and ends in a CRC-8.
  - Records are sent to the provincial tax office under each territory's own rules.
  - Developers must be **entered in a register** of TicketBAI software and sign a declaration per package, which yields a TBAI licence carried in every file. That is unlike Veri\*factu's self-declaration with no register.

  (TicketBAI functional and technical specifications v1.1, euskadi.eus, version date 12 Feb 2020.)
- **What could be shared** (**Inferred**): the record and chain store, the QR rendering and the receipt slot. The XML formats, the hash and signature input, the submission and the developer registration cannot be.
- **AEAT on the relationship.** The two regimes "NO son coincidentes" (developer FAQ no. 21). A product that serves both is two products under the same declaración-responsable logic (developer FAQ no. 3). **Observed.**
- **Not checked.** Whether v1.1 is still the current TicketBAI version, and Bizkaia's Batuz timetable. **Unverified.**

---

## 17. Test environment and validation tools

- **Portal de Pruebas Externas** (`preportal.aeat.es`, VERI\*FACTU section). It offers a browser web-service client ("Con certificado"), AEAT's own invoicing app, and a query of submitted records, all on test hosts `prewww1.aeat.es` / `prewww10.aeat.es`. The test QR service is at `prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR` and `…/ValidarQRNoVerifactu`. **Observed.**
- **Certificates.** Every test entry point is marked "Con certificado". AEAT's examples use test NIFs such as 89890001K and names such as "certificado uno telematicas". So AEAT test certificates exist (**Inferred**). How a non-Spanish developer obtains one was not found (**Unverified**).
- **Validation material.** Validations and errors document v1.2.2 (8 Apr 2026). Error list `errores.properties` on prewww2 (certificate required). Production and test XSDs (SuministroInformacion, SuministroLR, ConsultaLR, RespuestaSuministro, RespuestaConsultaLR, EventosSIF). The record-design spreadsheet `DsRegistroVeriFactu.xlsx` v1.0, which was not downloaded. **Observed.**
- **Offline checks.**
  - The hash spec's three worked examples (reproduced here, §6).
  - The QR spec's example URLs and JSON responses.
  - The signature spec's example signed record (zip `AnexosEjemplosFirmaRegFact.zip`, not opened).
- **No formal certification or validation service.** None exists for producers; compliance is self-declared (§11). **Observed.**

---

## 18. Unverified, or not read

- The record-design spreadsheet `DsRegistroVeriFactu.xlsx` was not downloaded. Field cardinalities come from the XSD instead.
- The meaning of the "Sello" ports on www10 and prewww10.
- Whether a non-resident producer can sign Convenio 17, or get AEAT test certificates.
- The exact day in "octubre de 2028", and any draft of the amending text.
- TicketBAI's current specification version and Bizkaia's Batuz timetable.
- The AEAT signature-example zip and the error-code list behind a certificate.
- Secondary press on the postponement (listed in §19) was read only to confirm that no BOE text exists yet.

---

## 19. Sources

All retrieved 2026-11-23.

**Primary: law (BOE)**
- RD 1007/2023, consolidated, last update published 03/12/2025: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840
- Orden HAC/1177/2024, BOE 28/10/2024, correction BOE 08/11/2024: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138
- Real Decreto-ley 15/2025, de 2 de diciembre, BOE 03/12/2025 (disposición final primera): https://www.boe.es/buscar/act.php?id=BOE-A-2025-24446
- Ley 58/2003 General Tributaria, consolidated, last update published 21/12/2024 (arts. 29.2.j, 201 bis): https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186
- RD 1619/2012 (ROF), consolidated, last update published 31/03/2026 (arts. 4, 6.5, 7.5, 15, 19): https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696
- Orden HAC/1028/2026, de 2 de octubre (BOE 05/10/2026): https://www.boe.es/eli/es/o/2026/10/02/hac1028

**Primary: Ministerio de Hacienda**
- *Nota informativa*, 5 October 2026, postponement to October 2028: https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf

**Primary: AEAT technical documentation**
- Index of technical information (page updated 17/11/2026): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/informacion-tecnica.html
- Hash specification v0.1.2, 27/08/2024: https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/IVA/VERI-FACTU/Veri-Factu_especificaciones_huella_hash_registros.pdf
- QR and comparison service specification v0.5.0, 10/12/2025: https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/IVA/VERI-FACTU/DetalleEspecificacTecnCodigoQRfactura.pdf
- Electronic signature specification v0.1.5, 06/03/2025: https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/IVA/VERI-FACTU/Espec-Tecnicas/EspecTecGenerFirmaElectRfact.pdf
- Web services: voluntary submission and requerimiento, v1.0.3, 28/07/2025: https://sede.agenciatributaria.gob.es/static_files/AEAT_Desarrolladores/EEDD/IVA/VERI-FACTU/Veri-Factu_Descripcion_SWeb.pdf
- Validations and errors v1.2.2, 08/04/2026: https://www.agenciatributaria.es/static_files/AEAT_Desarrolladores/EEDD/IVA/VERI-FACTU/Validaciones_Errores_Veri-Factu.pdf
- WSDL (production): https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/SistemaFacturacion.wsdl
- XSDs (production) `SuministroInformacion.xsd`, `SuministroLR.xsd`, `RespuestaSuministro.xsd`, `EventosSIF.xsd`, same directory as the WSDL.
- Developer FAQ ("Aclaraciones a dudas de los desarrolladores") v1.3, 4 December 2025: https://sede.agenciatributaria.gob.es/static_files/AEAT_Desarrolladores/EEDD/IVA/VERI-FACTU/FAQs-Desarrolladores.pdf
- Examples of declaraciones responsables v0.5.1 (PDF dated 03/06/2025): https://sede.agenciatributaria.gob.es/static_files/Sede/Tema/IVA/Verifactu/EjemplosDeclaracionResponsable(V0.5.1).pdf
- Portal de Pruebas Externas: https://preportal.aeat.es/PRE-Exteriores/Inicio/_menu_/VERI_FACTU___Sistemas_Informaticos_de_Facturacion/VERI_FACTU___Sistemas_Informaticos_de_Facturacion.html

**Primary: AEAT FAQ** (each page updated 21/10/2026), under https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/
- `cuestiones-generales-ambitos-aplicacion.html` (scope, SII, foral, online shops, retail tickets)
- `sistemas-verifactu.html` (modes, outages, lock-in, certificates, immediacy, "más sencillos de producir")
- `certificacion-sistemas-informaticos-declaracion-responsable.html` (declaración responsable, open source, extensions, dual vs solo)
- `caracteristicas-requisitos-sif-trazabilidad.html` (chain per SIF and taxpayer, per TPV)
- `caracteristicas-requisitos-sif-capacidad-remision-etc_.html` (capacity, disconnected centres, no deferred dump)
- `caracteristicas-requisitos-sistemas-informaticos-facturacion-multiple.html` (multi-taxpayer, deletion)
- `caracteristicas-requisitos-sif-registro-eventos_.html`, `firma.html`, `huella-hash.html`
- `caracteristicas-requisitos-sif-conservacion-accesibilidad-legibilidad.html` (retention period)
- `registros-facturacion-anulacion.html`
- AEAT *nota informativa* on the RDL 15/2025 dates (page updated 13/10/2026): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html
- AEAT *novedades*, Orden HAC/1028/2026 (page updated 12/11/2026): https://sede.agenciatributaria.gob.es/Sede/iva/novedades-iva/novedades-normativa-2026/orden-hac-1028-2026-2-electronica.html

**Primary: Basque Country**
- TicketBAI functional and technical specifications v1.1 (version date 12/02/2020): https://www.euskadi.eus/contenidos/informacion/ticketbai/es_14815/adjuntos/2020.851_TicketBAI_Especificaciones_v_1_1.pdf

**Secondary** (used only to confirm that the October 2028 postponement is not yet in the BOE)
- autointellia.com, "Hacienda aplaza Verifactu a octubre de 2028, pero el cambio aún espera su norma en el BOE": https://autointellia.com/blog/verifactu-aplazamiento-octubre-2028-pendiente-boe
- dsi-net.com, "Aplazamiento de Verifactu a 2028: Qué Dice el BOE y Qué Hacer": https://www.dsi-net.com/verifactu-aplazamiento-2028/
- facturadirecta.com, "VeriFactu se aplaza a octubre de 2028": https://www.facturadirecta.com/blog/verifactu-aplazamiento-octubre-2028/
- xataka.com, "Hacienda vuelve a retrasar Verifactu…": https://www.xataka.com/legislacion-y-derechos/hacienda-vuelve-a-retrasar-verifactu-da-a-empresas-autonomos-octubre-2028-para-adaptarse

**Local**
- `docs/research/2026-09-11-fiscal-compliance-groundwork.md`
- `docs/research/2026-11-20-fiscal-rules-on-post-sale-edits.md`
