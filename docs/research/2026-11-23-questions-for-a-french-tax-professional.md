# Questions for a French tax professional: till software and art. 286 I 3° bis CGI

Prepared 2026-11-23. English first, then the same in French.

---

## English

### The product

The product is point-of-sale (till) software for online shops built on WordPress and WooCommerce. It is free software under the GNU General Public License (GPL).

- It has two parts. A **plugin** that each merchant installs on their own WordPress website, with an optional **paid extension** sold by licence. And a **till app** that connects to the website and runs in a web browser, as a desktop app, or as a phone or tablet app.
- **Each merchant hosts their own website.** The publisher hosts nothing and holds none of the merchants' sales data.
- **The publisher is a company established outside France.** It holds the source code and publishes every version.
- Because the code is GPL and runs on the merchant's own server, **a merchant can technically edit the code**, install other plugins, and change data in the database.

### What the product will do in France

The publisher plans a French mode, switched on per shop, available to merchants who hold a paid licence. In that mode:

- Each till device records every sale, refund and correction as a write-once record at the moment the sale completes, offline included, and links it to the previous record with a plain SHA-256 hash (a hash chain, with no secret key and no signature).
- The website receives the records, keeps them, and checks every link. It makes daily, monthly and annual closures by itself, each carrying the last link of every till's chain and a perpetual total that is never reset.
- A sale is never edited once recorded. A refund, a cancellation or a correction is a new record. Deleting an order that has a record is refused. Editing a paid order's amounts in the website's back office writes a correcting record.
- The website keeps a chained log of events (mode switched on or off, version changes, anomalies, archives, exports, reprints, sign-ins).
- Once a year, and on demand, the website makes an archive: one file holding the records, closures and events as plain documented text, a notice in French, a seal tied to the chain, and a verification tool anyone can run. The merchant downloads and keeps it. Nothing is ever purged.
- The receipt shows the record's number, a short chain reference, and "DUPLICATA" on reprints.
- The publisher intends to meet the rule with its own individual attestation (model BOI-LETTRE-000242), issued to each licensed merchant for the version they use.
- There is no training mode. Staff are trained on a separate test website or before the French mode is switched on.

All BOFiP references below are to BOI-TVA-DECLA-30-10-30 in its version of 25 March 2026, unless another document is named.

### The questions

**1. Does the publisher's attestation survive the move to the CIBS on 1 January 2027?**
- *Texts:* art. 286 I 3° bis CGI as amended by loi n° 2026-103 du 19 février 2026, art. 125 (attestation restored from 21 February 2026); ordonnance n° 2025-1247 du 17 décembre 2025 as amended, creating art. L. 216-48 CIBS ("Un décret détermine les caractéristiques…"); the rewritten art. L. 80 O LPF and art. 1770 duodecies CGI, which mention only a "certificat"; BOI-RES-TVA-000253 of 7 October 2026, section 2.7, which says changes made only to the CGI before 1 January 2027 stay applicable.
- *Why it matters:* the whole French plan rests on the publisher's attestation. If only a certificate from an accredited body will do from 1 January 2027, the plan for France is redrawn before anything is built for it.

**2. Can the publisher attest for merchants who run the software on their own WordPress site, where the merchant can technically edit the code and the data?**
- *Texts:* BOFiP §45 (free software is in scope; changes must not alter the four conditions); §300 (the publisher answers "sous réserve que les dispositifs techniques … ne sont pas modifiés par un tiers"); §310 (for software designed to be adapted, the publisher is the original designer only when "aucun des paramètres" securing compliance can be changed by anyone else); §315, example 1 (a standard product configured without touching the safeguards is covered by the publisher) and example 4 (free software maintained by a community and modified in-house: "L'entreprise utilisatrice est donc considérée comme « l'éditeur »"); §375 (a business that is not a software publisher can then prove compliance only with a certificate); §100 (a technical means must "détecter et démontrer que l'utilisateur n'a pas contourné").
- *Why it matters:* if every merchant who installs a GPL plugin is the publisher, no publisher attestation can cover them and each would need a certificate. If only a merchant who actually modifies the safeguards becomes the publisher, the attestation works for unmodified installs, and the product must be able to show that an install is unmodified. We would like to know what that detection has to prove, and whether a merchant who installs an unrelated plugin is treated as having modified the software.

**3. Is a pre-signed attestation delivered as a download acceptable, or must each one be issued by name?**
- *Texts:* BOFiP §370 ("L'attestation doit être individuelle, c'est-à-dire délivrée nominativement à l'assujetti"; the pre-filled, pre-signed tolerance is written for a document "remis lors de l'achat physique du logiciel"); §390 (paper or downloadable document); BOI-LETTRE-000242 (the attestation "n'a de valeur que si son volet 2 est dûment complété et signé par l'entreprise utilisatrice").
- *Why it matters:* the product is downloaded, never bought physically. It decides whether the publisher can offer a signed part 1 that each licensed merchant downloads and completes with part 2, or must issue each attestation by name.

**4. Does it meet the rule to protect the till records in the product's own tables while WooCommerce orders remain a separate, editable object?**
- *Texts:* BOFiP §40 (in multi-function software, only "la seule fonctionnalité de caisse" must be secured); §50 (the protected data); §90 and §130 (corrections as recorded plus and minus operations, never direct edits).
- *Why it matters:* WooCommerce stores orders and lets a shop manager edit them. The product's records are separate and write-once; in French mode, editing a paid order's amounts writes a correcting record and deleting it is refused. If an inspector treats the WooCommerce order itself as the protected data, the design changes.

**5. Have the "normes établies par l'administration" for the archive's restitution format been published, and from when do they bind?**
- *Texts:* loi n° 2026-534 du 25 juin 2026, adding to art. 286 I 3° bis CGI that archived data "sont restituées dans un format répondant aux normes établies par l'administration"; BOFiP §230 (open format with a French explanatory notice).
- *Why it matters:* the archive format will be replaced by the official one when it exists. Its date decides whether the first release can use an open documented format.

**6. Are the free plugin alone, and the free plugin with the paid extension, one software or two?**
- *Texts:* BOFiP §280 (one certificate or attestation per distinct software, or one for all points of sale whose systems are "absolument identiques en tout point"); BOI-CF-INF-20-10-20 §570 (€7,500 per software).
- *Why it matters:* the French mode needs the paid extension, but merchants run many combinations of plugin, extension and app version. It decides how many attestations a merchant needs and what each must name.

**7. Does BOFiP §150 oblige till software to offer a training or test mode, or does it only regulate such a mode where the software offers one?**
- *Texts:* BOFiP §150 (if a training or test function is used, its data and documents are clearly identified, watermarked "factice" or "simulation", and the supervising operator named); §50 (data from a simulated "école" or "test" module are protected data).
- *Why it matters:* the product will offer no training mode. If a till must offer one, the product has to build it, with its own marked records.

**8. Does a plain SHA-256 hash chain, with no key and no signature, made on each till device and anchored in the closures and archives kept on the website, meet the integrity conditions?**
- *Texts:* BOFiP §100, second bullet (proof that data have not changed since recording, "empreinte numérique à clé privée, chaînage, etc."); §120 (a reliable process and "un système de preuve"); §140 ("chaînage des enregistrements ou de signature électronique"); §190 (a central system fed by points of sale may hold the data centrally).
- *Why it matters:* someone with database access could recompute an unkeyed chain. The design relies on anchoring (each closure carries every till's chain head, each archive carries the closure heads, each receipt carries its place in the chain) instead of a key. If a key or a signature is expected, the design changes.

---

## Français

### Le produit

Le produit est un logiciel de caisse pour les boutiques en ligne construites avec WordPress et WooCommerce. C'est un logiciel libre, sous licence publique générale GNU (GPL).

- Il comporte deux parties. Une **extension (plugin)** que chaque commerçant installe sur son propre site WordPress, avec une **extension payante** facultative vendue sous licence. Et une **application de caisse** qui se connecte au site et fonctionne dans un navigateur web, comme application de bureau, ou comme application pour téléphone ou tablette.
- **Chaque commerçant héberge son propre site.** L'éditeur n'héberge rien et ne détient aucune donnée de vente des commerçants.
- **L'éditeur est une société établie hors de France.** Il détient le code source et publie chaque version.
- Le code étant sous GPL et exécuté sur le serveur du commerçant, **un commerçant peut techniquement modifier le code**, installer d'autres extensions et modifier les données en base.

### Ce que le produit fera en France

L'éditeur prévoit un mode France, activé boutique par boutique, réservé aux commerçants titulaires d'une licence payante. Dans ce mode :

- Chaque appareil de caisse enregistre chaque vente, remboursement et correction sous forme d'enregistrement non modifiable au moment où la vente se termine, y compris hors connexion, et le relie au précédent par une empreinte SHA-256 simple (un chaînage, sans clé secrète ni signature).
- Le site reçoit les enregistrements, les conserve et vérifie chaque maillon. Il établit lui-même des clôtures journalières, mensuelles et annuelles, chacune portant le dernier maillon de la chaîne de chaque caisse et un total perpétuel jamais remis à zéro.
- Une vente n'est jamais modifiée une fois enregistrée. Un remboursement, une annulation ou une correction est un nouvel enregistrement. La suppression d'une commande qui a un enregistrement est refusée. La modification des montants d'une commande payée dans l'administration du site crée un enregistrement correctif.
- Le site tient un journal chaîné des événements (activation ou désactivation du mode, changements de version, anomalies, archives, exports, réimpressions, connexions).
- Une fois par an, et à la demande, le site produit une archive : un seul fichier contenant les enregistrements, les clôtures et les événements en texte documenté, une notice en français, un sceau lié à la chaîne, et un outil de vérification que chacun peut exécuter. Le commerçant la télécharge et la conserve. Rien n'est jamais purgé.
- Le ticket indique le numéro de l'enregistrement, une courte référence de chaînage, et « DUPLICATA » sur les réimpressions.
- L'éditeur entend satisfaire à l'obligation par sa propre attestation individuelle (modèle BOI-LETTRE-000242), délivrée à chaque commerçant titulaire d'une licence pour la version qu'il utilise.
- Il n'y a pas de mode école. Le personnel est formé sur un site de test distinct ou avant l'activation du mode France.

Sauf mention contraire, les références BOFiP ci-dessous renvoient au BOI-TVA-DECLA-30-10-30 dans sa version du 25 mars 2026.

### Les questions

**1. L'attestation de l'éditeur survit-elle au transfert vers le CIBS au 1er janvier 2027 ?**
- *Textes :* art. 286 I 3° bis du CGI modifié par l'article 125 de la loi n° 2026-103 du 19 février 2026 (attestation rétablie à compter du 21 février 2026) ; ordonnance n° 2025-1247 du 17 décembre 2025 modifiée, créant l'art. L. 216-48 du CIBS (« Un décret détermine les caractéristiques… ») ; l'art. L. 80 O du LPF et l'art. 1770 duodecies du CGI dans leur nouvelle rédaction, qui ne mentionnent qu'un « certificat » ; BOI-RES-TVA-000253 du 7 octobre 2026, point 2.7, selon lequel les modifications apportées au seul CGI avant le 1er janvier 2027 restent applicables.
- *Pourquoi c'est important :* tout le projet pour la France repose sur l'attestation de l'éditeur. Si seul un certificat délivré par un organisme accrédité est admis à compter du 1er janvier 2027, le projet pour la France est revu avant toute réalisation.

**2. L'éditeur peut-il délivrer l'attestation à des commerçants qui exploitent le logiciel sur leur propre site WordPress, où le commerçant peut techniquement modifier le code et les données ?**
- *Textes :* BOFiP §45 (les logiciels libres sont concernés ; les modifications ne doivent pas altérer les quatre conditions) ; §300 (l'éditeur répond « sous réserve que les dispositifs techniques … ne sont pas modifiés par un tiers ») ; §310 (pour un logiciel conçu pour être adapté, l'éditeur est le concepteur d'origine seulement lorsque « aucun des paramètres » assurant la conformité ne peut être modifié par d'autres intervenants) ; §315, exemple 1 (un produit standard paramétré sans toucher aux dispositifs de sécurisation est couvert par l'éditeur) et exemple 4 (logiciel libre maintenu par une communauté et modifié en interne : « L'entreprise utilisatrice est donc considérée comme « l'éditeur » ») ; §375 (une entreprise qui n'est pas éditeur de logiciels ne peut alors justifier que par un certificat) ; §100 (une solution technique doit « détecter et démontrer que l'utilisateur n'a pas contourné »).
- *Pourquoi c'est important :* si tout commerçant qui installe une extension sous GPL est l'éditeur, aucune attestation de l'éditeur ne peut le couvrir et chacun aurait besoin d'un certificat. Si seul le commerçant qui modifie effectivement les dispositifs de sécurisation devient l'éditeur, l'attestation vaut pour les installations non modifiées, et le produit doit pouvoir démontrer qu'une installation n'est pas modifiée. Nous souhaitons savoir ce que cette détection doit prouver, et si un commerçant qui installe une extension sans rapport est réputé avoir modifié le logiciel.

**3. Une attestation pré-signée remise par téléchargement est-elle recevable, ou chaque attestation doit-elle être délivrée nominativement ?**
- *Textes :* BOFiP §370 (« L'attestation doit être individuelle, c'est-à-dire délivrée nominativement à l'assujetti » ; la tolérance du document pré-rempli et pré-signé vise un document « remis lors de l'achat physique du logiciel ») ; §390 (document papier ou téléchargeable) ; BOI-LETTRE-000242 (l'attestation « n'a de valeur que si son volet 2 est dûment complété et signé par l'entreprise utilisatrice »).
- *Pourquoi c'est important :* le produit est téléchargé, jamais acheté physiquement. La réponse détermine si l'éditeur peut proposer un volet 1 signé que chaque commerçant titulaire d'une licence télécharge et complète par le volet 2, ou s'il doit délivrer chaque attestation nominativement.

**4. Satisfait-on à l'obligation en protégeant les enregistrements de caisse dans les tables propres du produit, alors que les commandes WooCommerce restent un objet distinct et modifiable ?**
- *Textes :* BOFiP §40 (dans un logiciel multifonction, seule « la seule fonctionnalité de caisse » doit être sécurisée) ; §50 (les données protégées) ; §90 et §130 (les corrections sont des opérations « plus » et « moins » enregistrées, jamais des modifications directes).
- *Pourquoi c'est important :* WooCommerce stocke les commandes et permet à un gestionnaire de boutique de les modifier. Les enregistrements du produit sont distincts et non modifiables ; en mode France, modifier les montants d'une commande payée crée un enregistrement correctif et sa suppression est refusée. Si un vérificateur considère la commande WooCommerce elle-même comme la donnée protégée, la conception change.

**5. Les « normes établies par l'administration » pour le format de restitution des archives ont-elles été publiées, et à partir de quand s'appliquent-elles ?**
- *Textes :* loi n° 2026-534 du 25 juin 2026, ajoutant à l'art. 286 I 3° bis du CGI que les données archivées « sont restituées dans un format répondant aux normes établies par l'administration » ; BOFiP §230 (format ouvert accompagné d'une notice explicative en français).
- *Pourquoi c'est important :* le format d'archive sera remplacé par le format officiel dès qu'il existera. Sa date détermine si la première version peut utiliser un format ouvert documenté.

**6. L'extension gratuite seule, et l'extension gratuite avec l'extension payante, constituent-elles un seul logiciel ou deux ?**
- *Textes :* BOFiP §280 (un certificat ou une attestation par logiciel distinct, ou un seul pour tous les points de vente dont les systèmes sont « absolument identiques en tout point ») ; BOI-CF-INF-20-10-20 §570 (7 500 € par logiciel).
- *Pourquoi c'est important :* le mode France exige l'extension payante, mais les commerçants utilisent de nombreuses combinaisons de versions de l'extension, de l'extension payante et de l'application. La réponse détermine combien d'attestations il faut à un commerçant et ce que chacune doit mentionner.

**7. Le §150 du BOFiP oblige-t-il un logiciel de caisse à proposer un mode école ou test, ou encadre-t-il seulement un tel mode lorsque le logiciel en propose un ?**
- *Textes :* BOFiP §150 (si une fonction école ou test est utilisée, ses données et justificatifs sont clairement identifiés, portent la mention « factice » ou « simulation », et l'opérateur responsable est identifié) ; §50 (les données d'un module « école » ou « test » sont des données protégées).
- *Pourquoi c'est important :* le produit ne proposera pas de mode école. Si une caisse doit en proposer un, le produit doit le réaliser, avec ses propres enregistrements identifiés.

**8. Un chaînage SHA-256 simple, sans clé ni signature, réalisé sur chaque appareil de caisse et ancré dans les clôtures et archives conservées sur le site, satisfait-il aux conditions d'inaltérabilité ?**
- *Textes :* BOFiP §100, second tiret (preuve que les données n'ont pas été modifiées depuis leur enregistrement, « empreinte numérique à clé privée, chaînage, etc. ») ; §120 (un procédé fiable et « un système de preuve ») ; §140 (« chaînage des enregistrements ou de signature électronique ») ; §190 (un système centralisé alimenté par les points de vente peut détenir les données de façon centralisée).
- *Pourquoi c'est important :* une personne ayant accès à la base de données pourrait recalculer un chaînage sans clé. La conception repose sur l'ancrage (chaque clôture porte le dernier maillon de chaque caisse, chaque archive porte ceux des clôtures, chaque ticket porte sa place dans la chaîne) plutôt que sur une clé. Si une clé ou une signature est attendue, la conception change.
