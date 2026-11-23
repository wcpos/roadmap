# Questions for a Spanish tax adviser: till software under RD 1007/2023 (Veri\*factu)

Prepared 2026-11-23. English first, then the same in Spanish.

---

## English

### The product

The product is point-of-sale (till) software for online shops built on WordPress and WooCommerce. It is free software under the GNU General Public License (GPL).

- It has two parts. A **plugin** that each merchant installs on their own WordPress website, with an optional **paid extension** sold by licence. And a **till app** that connects to the website and runs in a web browser, as a desktop app, or as a phone or tablet app.
- **Each merchant hosts their own website.** The publisher hosts nothing and holds none of the merchants' sales data.
- **The publisher is a company established outside Spain**, with no Spanish tax number. It holds the source code and publishes every version.
- Because the code is GPL and runs on the merchant's own server, **a merchant can technically edit the code**, install other plugins, and change data in the database.
- A till receipt is issued without the customer's details; the design treats it as a simplified invoice (F2), and question 5 asks whether that holds. A till can keep selling while it has no connection, and sends its records when it reconnects.

### What the product will do in Spain

The publisher plans a Spanish mode, switched on per shop, available to merchants who hold a paid licence. Both ways of working are offered: VERI\*FACTU mode (records sent to AEAT as they are made) and the mode without VERI\*FACTU (records signed and kept). In that mode:

- **Each till is its own invoicing system** (SIF), with its own chain and its own installation number, one per till and shop. The website is a further system for documents it issues itself, such as corrections made in its back office.
- **The till generates the billing record at the moment of the sale**, offline included, chains it with AEAT's hash, prints the QR, and in the mode without VERI\*FACTU signs the record with the merchant's certificate at that moment.
- **The website receives the records and keeps them.** In VERI\*FACTU mode the website sends each till's records to AEAT unchanged, in generation order, with AEAT's wait times, and queues and retries them when AEAT or the till's connection is unavailable. The till shows how many records are still unsent.
- **The merchant's qualified certificate** is uploaded once to the website, kept encrypted there, and handed to each till when a cashier signs in. Installed apps keep it in the device's secure storage; browser tills keep it as a key that cannot be exported.
- Corrections follow AEAT's decision tree: a refund or a voided sale is an R5 by difference; editing a completed sale is an R5 by substitution; a customer asking for a full invoice gets an F3 that replaces the F2; an invoice issued in error is annulled.
- At setup the merchant declares that they are not in the SII and not domiciled in the Basque Country or Navarre; the Spanish mode is refused if they are.
- The publisher intends to issue its declaración responsable, per version, to each licensed merchant and inside the product.

### The questions

**1. Can a producer with no establishment in Spain, distributing a free GPL plugin and a paid extension to merchants who host it themselves, be sanctioned under art. 201 bis LGT?**
- *Texts:* LGT art. 201 bis.1 and 201 bis.4; RRSIF art. 3.2.
- *Why it matters:* it sets the publisher's own exposure. If so, is the €150,000 counted per "tipo distinto de sistema" for the free plugin and the paid extension separately, and does the €1,000 apply "por cada sistema … comercializado", meaning per sale or per download?

**2. Since 29 July 2025, is offering a non-adapted version to merchants in Spain an infraction in itself, before any merchant's own obligation date?**
- *Texts:* RRSIF DF 4ª as rewritten by RDL 15/2025, third paragraph; the Hacienda note of 5 October 2026 announcing a postponement to October 2028.
- *Why it matters:* the plugin is freely available today and is not yet adapted. Does free availability count as *comercialización*? Does the announced postponement reach the producer clause at all?

**3. In a WordPress + WooCommerce + plugin + till app installation, which parts are the *sistema informático de facturación*, and which are *componentes* needing their own declaración responsable?**
- *Texts:* RRSIF art. 1.2 and art. 13; Orden HAC/1177/2024 arts. 1.2.b–c and 15.4.
- *Why it matters:* WooCommerce core numbers and stores orders but is made by someone else; the till app now generates, chains and signs the records. Can one declaration from the publisher cover the plugin, the paid extension and the till app on web, desktop and mobile? Can it cover WooCommerce core, which the publisher does not produce?

**4. Please confirm the route chosen for tills that sell offline.**
- *Texts:* RRSIF art. 1.2; Orden art. 7.c; AEAT FAQ on traceability ("cada TPV se considera que es un SIF"); AEAT developer FAQ no. 5 (the till generates the record and the back office forwards it "sin más"); Orden art. 16.4 (delayed submission with `Incidencia = S`).
- *Why it matters:* the design treats each till as its own SIF with its own chain and installation number, so that a sale's record, chain link and QR exist when the receipt is handed over, offline included, and no record is created later on the server. Is that right? And in VERI\*FACTU mode, does it meet the rules for the website, not the till, to send each till's records to AEAT unchanged and in order (a browser cannot present a client certificate to AEAT from page code)?

**5. Is a till receipt from this product a *factura simplificada*, and so in scope, in each normal retail configuration? When the merchant's online orders are invoiced by a different plugin, are the online shop and the tills separate SIFs with separate chains?**
- *Texts:* ROF arts. 4 and 7; RRSIF art. 1.2; AEAT FAQ "¿Están afectadas las tiendas online?".
- *Why it matters:* it decides which sales the Spanish mode must record and whether the product must coexist with another invoicing system on the same site.

**6. With no Spanish tax number, which identifier should the producer use in the declaration and in `SistemaInformatico/IDOtro`?**
- *Texts:* Orden art. 15.1.i and annex 2.6; the record schema's `IDOtro` (type 02 must be a valid EU VAT number; type 07 is not allowed).
- *Why it matters:* every record carries the producer's identifier, and it must match the declaration. For example, a tax number issued outside Spain under type 04 or 06 with its country code, or should the producer obtain a Spanish tax number?

**7. The product uses each merchant's own qualified certificate. Is there also a route for a non-resident producer to submit for merchants?**
- *Texts:* Orden art. 5; RD 1065/2007 arts. 79–81; Orden HAC/1398/2003; Convenio de colaboración social nº 17.
- *Why it matters:* the plan needs every merchant to obtain and upload a qualified certificate. Can a non-resident software producer sign Convenio 17 and submit with its own certificate? If it could, merchants would not need their own certificate for VERI\*FACTU mode.

**8. Is the planned custody of the merchant's certificate acceptable?**
- *Texts:* Orden art. 14; AEAT electronic signature specification §3 (the certificate must belong to the taxpayer or its authorised representative).
- *Why it matters:* the certificate (or seal) is uploaded once to the merchant's own website, usually on shared web hosting, kept encrypted there, and handed to every signed-in till: installed apps hold it in device secure storage, browser tills as a non-exportable key. Is that acceptable under the RRSIF? Does any rule govern where the private key lives, or how many devices may hold the same certificate?

**9. If a merchant or its developer modifies the GPL code, or installs a third-party plugin that alters orders or receipts, who is the producer of the result?**
- *Texts:* RRSIF art. 13; AEAT FAQ on extensions; LGT art. 201 bis.2.
- *Why it matters:* does the publisher's declaration remain valid for the rest of the system? Does the merchant then hold an "alterado o modificado" system under 201 bis.2?

**10. Is it enough for the software to rely on the merchant's own declaration at setup that it is not in the SII and not domiciled in a foral territory?**
- *Texts:* RRSIF arts. 1.3 and 3.3; AEAT developer FAQ no. 3.
- *Why it matters:* setup asks for that declaration and refuses the Spanish mode if the merchant says they are foral. Does the producer carry any further duty to detect or block it?

**11. Are separate shops in one installation separate systems?**
- *Texts:* RRSIF art. 7.a; Orden art. 2.
- *Why it matters:* with the paid extension, one WordPress site can run several shops. The design gives each (till, shop) pair its own chain and installation number. For several shops of one company, is that right, or is the installation one SIF? For shops of different companies (different tax numbers) on one site, is that the multi-taxpayer case, with its own notices and markers?

**12. For a merchant in the mode without VERI\*FACTU who uninstalls the plugin or changes host, what exactly must be kept, by whom, and for how long?**
- *Texts:* ROF art. 19.1 and LGT art. 66; Orden art. 8.3.
- *Why it matters:* the product refuses a full-data uninstall until an archive has been exported, and never purges records. Does the producer carry any duty after the relationship ends?

**13. Does the general integrity duty already bind a non-adapted till used in Spain today, independently of the RRSIF dates? Does it bind its producer?**
- *Texts:* LGT art. 29.2.j (in force since 11 October 2021).
- *Why it matters:* it decides whether merchants using the current version are exposed now, before the Spanish mode ships.

**14. Is anything known about the announced amendment that would change the record or QR formats before October 2028?**
- *Texts:* Hacienda note of 5 October 2026 ("convergencia de los ámbitos de aplicación y ciertos aspectos técnicos").
- *Why it matters:* the record and QR formats are being built now. A known change would be built in from the start.

---

## Español

### El producto

El producto es un software de punto de venta (TPV) para tiendas en línea construidas con WordPress y WooCommerce. Es software libre bajo la Licencia Pública General de GNU (GPL).

- Tiene dos partes. Un **plugin** que cada comerciante instala en su propio sitio WordPress, con una **extensión de pago** opcional vendida con licencia. Y una **aplicación de caja** que se conecta al sitio y funciona en un navegador web, como aplicación de escritorio o como aplicación para teléfono o tableta.
- **Cada comerciante aloja su propio sitio.** El editor no aloja nada y no posee ningún dato de ventas de los comerciantes.
- **El editor es una empresa establecida fuera de España**, sin NIF español. Posee el código fuente y publica cada versión.
- Como el código es GPL y se ejecuta en el servidor del comerciante, **un comerciante puede técnicamente modificar el código**, instalar otros plugins y cambiar datos en la base de datos.
- El tique de caja se expide sin los datos del cliente; el diseño lo trata como factura simplificada (F2), y la pregunta 5 plantea si es correcto. Una caja puede seguir vendiendo sin conexión y envía sus registros al reconectarse.

### Lo que hará el producto en España

El editor prevé un modo España, activado por tienda, disponible para los comerciantes con licencia de pago. Se ofrecen las dos modalidades: VERI\*FACTU (registros remitidos a la AEAT a medida que se generan) y la modalidad sin VERI\*FACTU (registros firmados y conservados). En ese modo:

- **Cada caja es su propio sistema informático de facturación** (SIF), con su propia cadena y su propio número de instalación, uno por caja y tienda. El sitio es un sistema más para los documentos que expide él mismo, como las correcciones hechas en su panel de administración.
- **La caja genera el registro de facturación en el momento de la venta**, también sin conexión, lo encadena con la huella de la AEAT, imprime el QR y, en la modalidad sin VERI\*FACTU, firma el registro con el certificado del comerciante en ese momento.
- **El sitio recibe los registros y los conserva.** En modalidad VERI\*FACTU el sitio remite a la AEAT los registros de cada caja sin modificarlos, en orden de generación, respetando los tiempos de espera de la AEAT, y los pone en cola y reintenta cuando la AEAT o la conexión de la caja no están disponibles. La caja muestra cuántos registros quedan sin enviar.
- **El certificado cualificado del comerciante** se sube una vez al sitio, se guarda allí cifrado y se entrega a cada caja cuando un cajero inicia sesión. Las aplicaciones instaladas lo guardan en el almacenamiento seguro del dispositivo; las cajas en navegador, como una clave no exportable.
- Las correcciones siguen el árbol de decisión de la AEAT: un reembolso o una venta anulada en caja es una R5 por diferencias; editar una venta completada es una R5 por sustitución; un cliente que pide factura completa recibe una F3 que sustituye la F2; una factura expedida por error se anula.
- En la configuración el comerciante declara que no está en el SII ni domiciliado en el País Vasco o Navarra; si lo está, el modo España se rechaza.
- El editor prevé emitir su declaración responsable, por versión, a cada comerciante con licencia y dentro del producto.

### Las preguntas

**1. ¿Puede sancionarse conforme al art. 201 bis LGT a un productor sin establecimiento en España que distribuye un plugin GPL gratuito y una extensión de pago a comerciantes que lo alojan ellos mismos?**
- *Textos:* LGT art. 201 bis.1 y 201 bis.4; RRSIF art. 3.2.
- *Por qué importa:* fija la exposición del propio editor. En su caso, ¿los 150.000 € se cuentan por «tipo distinto de sistema» para el plugin gratuito y la extensión de pago por separado, y los 1.000 € se aplican «por cada sistema … comercializado», es decir, por venta o por descarga?

**2. Desde el 29 de julio de 2025, ¿ofrecer una versión no adaptada a comerciantes en España es por sí mismo una infracción, antes de la fecha de obligación de cada comerciante?**
- *Textos:* RRSIF DF 4ª en la redacción del RDL 15/2025, párrafo tercero; nota de Hacienda de 5 de octubre de 2026 que anuncia el aplazamiento a octubre de 2028.
- *Por qué importa:* el plugin está hoy disponible gratuitamente y aún no está adaptado. ¿La disponibilidad gratuita cuenta como *comercialización*? ¿El aplazamiento anunciado alcanza a la cláusula de los productores?

**3. En una instalación de WordPress + WooCommerce + plugin + aplicación de caja, ¿qué partes son el *sistema informático de facturación* y cuáles son *componentes* que necesitan su propia declaración responsable?**
- *Textos:* RRSIF art. 1.2 y art. 13; Orden HAC/1177/2024 arts. 1.2.b–c y 15.4.
- *Por qué importa:* el núcleo de WooCommerce numera y almacena los pedidos pero lo produce otro; la aplicación de caja ahora genera, encadena y firma los registros. ¿Puede una sola declaración del editor cubrir el plugin, la extensión de pago y la aplicación de caja en web, escritorio y móvil? ¿Puede cubrir el núcleo de WooCommerce, que el editor no produce?

**4. Les pedimos que confirmen la vía elegida para las cajas que venden sin conexión.**
- *Textos:* RRSIF art. 1.2; Orden art. 7.c; FAQ de la AEAT sobre trazabilidad («cada TPV se considera que es un SIF»); FAQ de desarrolladores de la AEAT nº 5 (la caja genera el registro y el sistema central lo reenvía «sin más»); Orden art. 16.4 (remisión diferida con `Incidencia = S`).
- *Por qué importa:* el diseño trata cada caja como su propio SIF con su propia cadena y número de instalación, de modo que el registro, el eslabón de la cadena y el QR existen cuando se entrega el tique, también sin conexión, y ningún registro se crea después en el servidor. ¿Es correcto? Y en modalidad VERI\*FACTU, ¿cumple las normas que sea el sitio, y no la caja, quien remita a la AEAT los registros de cada caja sin modificarlos y en orden (un navegador no puede presentar un certificado de cliente a la AEAT desde el código de una página)?

**5. ¿Es un tique de caja de este producto una *factura simplificada*, y por tanto incluido, en cada configuración minorista normal? Cuando los pedidos en línea del comerciante se facturan con otro plugin, ¿la tienda en línea y las cajas son SIF distintos con cadenas distintas?**
- *Textos:* ROF arts. 4 y 7; RRSIF art. 1.2; FAQ de la AEAT «¿Están afectadas las tiendas online?».
- *Por qué importa:* determina qué ventas debe registrar el modo España y si el producto debe convivir con otro sistema de facturación en el mismo sitio.

**6. Sin NIF español, ¿qué identificador debe usar el productor en la declaración y en `SistemaInformatico/IDOtro`?**
- *Textos:* Orden art. 15.1.i y anexo 2.6; el `IDOtro` del esquema de registro (el tipo 02 debe ser un NIF-IVA válido de la UE; el tipo 07 no se admite).
- *Por qué importa:* cada registro lleva el identificador del productor y debe coincidir con la declaración. Por ejemplo, un número fiscal expedido fuera de España con el tipo 04 o 06 y su código de país, ¿o debe el productor obtener un NIF español?

**7. El producto usa el certificado cualificado propio de cada comerciante. ¿Existe además una vía para que un productor no residente remita en nombre de los comerciantes?**
- *Textos:* Orden art. 5; RD 1065/2007 arts. 79–81; Orden HAC/1398/2003; Convenio de colaboración social nº 17.
- *Por qué importa:* el plan exige que cada comerciante obtenga y suba un certificado cualificado. ¿Puede un productor de software no residente firmar el Convenio 17 y remitir con su propio certificado? Si pudiera, los comerciantes no necesitarían su propio certificado para la modalidad VERI\*FACTU.

**8. ¿Es aceptable la custodia prevista del certificado del comerciante?**
- *Textos:* Orden art. 14; especificación de firma electrónica de la AEAT §3 (el certificado debe corresponder al obligado tributario o a su representante autorizado).
- *Por qué importa:* el certificado (o sello) se sube una vez al sitio del propio comerciante, normalmente en un alojamiento web compartido, se guarda allí cifrado y se entrega a cada caja con sesión iniciada: las aplicaciones instaladas lo guardan en el almacenamiento seguro del dispositivo, las cajas en navegador como clave no exportable. ¿Es aceptable conforme al RRSIF? ¿Alguna norma regula dónde debe estar la clave privada, o cuántos dispositivos pueden tener el mismo certificado?

**9. Si un comerciante o su desarrollador modifica el código GPL, o instala un plugin de terceros que altera pedidos o tiques, ¿quién es el productor del resultado?**
- *Textos:* RRSIF art. 13; FAQ de la AEAT sobre extensiones; LGT art. 201 bis.2.
- *Por qué importa:* ¿sigue siendo válida la declaración del editor para el resto del sistema? ¿Tiene entonces el comerciante un sistema «alterado o modificado» en el sentido del 201 bis.2?

**10. ¿Basta con que el software se apoye en la declaración del propio comerciante, en la configuración, de que no está en el SII ni domiciliado en un territorio foral?**
- *Textos:* RRSIF arts. 1.3 y 3.3; FAQ de desarrolladores de la AEAT nº 3.
- *Por qué importa:* la configuración pide esa declaración y rechaza el modo España si el comerciante dice ser foral. ¿Tiene el productor algún deber adicional de detectarlo o bloquearlo?

**11. ¿Son sistemas distintos las tiendas distintas de una misma instalación?**
- *Textos:* RRSIF art. 7.a; Orden art. 2.
- *Por qué importa:* con la extensión de pago, un mismo sitio WordPress puede gestionar varias tiendas. El diseño da a cada par (caja, tienda) su propia cadena y número de instalación. Para varias tiendas de una misma empresa, ¿es correcto, o la instalación es un único SIF? Para tiendas de empresas distintas (NIF distintos) en un mismo sitio, ¿es el supuesto de varios obligados tributarios, con sus avisos e indicadores propios?

**12. Para un comerciante en la modalidad sin VERI\*FACTU que desinstala el plugin o cambia de alojamiento, ¿qué debe conservarse exactamente, quién debe hacerlo y durante cuánto tiempo?**
- *Textos:* ROF art. 19.1 y LGT art. 66; Orden art. 8.3.
- *Por qué importa:* el producto rechaza una desinstalación con borrado de datos hasta que se haya exportado un archivo, y nunca purga registros. ¿Tiene el productor algún deber una vez terminada la relación?

**13. ¿El deber general de integridad obliga ya hoy a una caja no adaptada usada en España, con independencia de las fechas del RRSIF? ¿Obliga a su productor?**
- *Textos:* LGT art. 29.2.j (en vigor desde el 11 de octubre de 2021).
- *Por qué importa:* determina si los comerciantes que usan la versión actual están expuestos ya, antes de que se publique el modo España.

**14. ¿Se sabe algo de la modificación anunciada que cambiaría los formatos del registro o del QR antes de octubre de 2028?**
- *Textos:* nota de Hacienda de 5 de octubre de 2026 («convergencia de los ámbitos de aplicación y ciertos aspectos técnicos»).
- *Por qué importa:* los formatos del registro y del QR se están construyendo ahora. Un cambio conocido se incorporaría desde el principio.
