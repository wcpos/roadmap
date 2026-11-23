# Where WCPOS merchants are, and which fiscal regimes cover the most of them (as of 2026-11-23)

**Summary.** On a blend of three independent active-use sources, Spain is about **10%** of active WCPOS merchants and France about **3.5%**; together about **13.5%**. The United States is the largest country (about 15%), and roughly half of all merchants are in countries with no till-software rule. After France and Spain, the named regimes covering the most merchants are **Belgium's SCE 2.0 / FDM** (about 3.8%, but it binds hospitality only), **Mexico's CFDI** (about 3.1%) and **Chile's boleta electrónica** (about 2.5%). As a regime *kind*, clearance e-invoicing (Latin America above all) covers more merchants (about 12%) than any kind except "no rule" and the self-declared chain that France and Spain share. Pro numbers are solid. Free numbers rest on opt-in telemetry from about 430 stores against 5,000+ active installs, so they are indicative only.

Answers wcpos/roadmap#662 (part of #640). Regime kinds and dates come from `docs/research/2026-11-23-fiscal-obligations-and-dates.md` on branch `research/fiscal-obligations-and-dates`; anything not in that file is general knowledge and labelled Unverified.

Labels:
- **[Observed]**: a count read from a source listed below.
- **[Inferred]**: a figure derived from observed counts by the stated method.
- **[Unverified]**: general knowledge, not checked against a primary source in this run.

Everything here is an aggregate by country. No merchant, site, person, email, domain or licence key was printed, stored or sent anywhere. All server-side queries were plain SELECTs in read-only sessions (Postgres `SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY`, ClickHouse `--readonly 1`), aggregated on the server so that only country codes and counts left it.

## 1. Sources

All read on **2026-11-23**.

| # | Source | What it measures | Query / method (secrets and hosts removed) | Bias |
|---|---|---|---|---|
| S1 | Pro store (Medusa) orders | Distinct Pro buyers, all time (history imported back to 2014), by billing country of each buyer's latest non-cancelled order | `"order"` ⋈ `order_address` on `billing_address_id`; `status <> 'canceled' AND deleted_at IS NULL AND NOT is_draft_order`; `DISTINCT ON (coalesce(customer_id, lower(email)))` latest order; `GROUP BY country_code` | Includes buyers who left years ago. Billing country is where the buyer pays, which is usually but not always where the till is (agencies buy for clients). |
| S2 | Same, last 24 months | Pro buyers with an order since 2024-11-23 | S1 with `created_at >= '2024-11-23'` | Recent buyers only; renewals and new sales mixed. |
| S3 | Pro licences (Keygen) | Pro licences that validated in the last 90 days, by the billing country of the licence email's latest order | Licences `WHERE last_validated_at > now() - interval '90 days'`; email joined to S1's email→country map inside `awk` on the server; only country counts printed | Best measure of **active Pro installs**. One customer may hold several licences. 4 of 612 licences did not match an order email. |
| S4 | Plugin telemetry (self-hosted PostHog) | WooCommerce **store base country** (`wc_country`) reported by the Free and Pro plugins, per site | Latest `$groupidentify` for group type `site` per group key in the last 90 days (`argMax` over `$group_set.wc_country`, `wcpos_edition`, `order_count_band`); counted only where `order_count_band` is not `0` | **Opt-in**: only sites whose admin accepted analytics, and only plugin versions that send it (first event 2026-04-16). The 90-day window holds 1,459 sites with any event; 593 had taken at least one order (427 Free, 166 Pro). |
| S5 | Error reporting (Sentry) | Unique app installs (`user.id` is a per-install UUID) by the country of the **client IP**, i.e. where the till runs | Discover, project `woocommerce-pos`, `query=release:wcpos-app@*`, `field=geo.country_code,count(),count_unique(user)`, `statsPeriod=90d` → 1,519 installs, 119,012 events | Only installs that logged at least one error or message. A merchant with five tills counts five times. The project's own dev and test installs are not filtered out. |
| S6 | Docs analytics (PostHog) | Distinct docs readers by GeoIP country | Browser events on the docs site, last 90 days, `uniqExact(distinct_id)` by `$geoip_country_code` → 628 readers | Consent-gated; readers include prospects and the project's own staff, not only merchants. Used as a cross-check only. |
| S7 | Updates server request log | Distinct Pro sites checking for updates in the last 30 days, by **top-level domain** of the site URL in the WordPress user agent | `request_type IN ('pro_update','v1_pro_update')`, `DISTINCT` host, then only the last label kept, on the server → 723 sites | 39% are `.com`, and a ccTLD is where a domain is registered, not where a till is. Cross-check only. |
| S8 | WordPress.org plugin API (public) | Free plugin active installs, downloads, version split, language packs | `api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=woocommerce-pos`, `/stats/plugin/1.0/woocommerce-pos`, `/translations/plugins/1.0/?slug=woocommerce-pos` | No country data at all. Active installs is a floor bucket ("5,000+"). |

**[Observed] S8:** 5,000+ active installs; 526,782 downloads all time; version split 2.0 32.5%, 1.11 11.1%, 1.10 9.8%, 1.9 14.3%, older 32.3%. Language packs exist for 12 locales: cs_CZ, el, es_CL, es_CO, es_ES, es_MX, es_VE, fr_FR, nl_NL, pt_BR, ro_RO, ru_RU. A language pack's existence is not a usage count, and locale is not country.

**[Observed] Pro totals:** S1 4,198 buyers all time; S2 909 buyers in 24 months; Keygen holds 6,229 licences, 815 unexpired and unsuspended, 612 validated in 90 days (S3), 552 in 30 days.

**[Inferred] A test-store cluster removed from S4.** 56 Pro sites with base country Estonia report zero orders, one POS user, a `+00:00` timezone and installs under 90 days old; they look like automated test stores, not merchants. Restricting S4 to stores with at least one order removes them along with other idle installs (356 Free and 86 Pro sites have zero orders; 130 sites sent no properties).

### Sources that could not be read

- **WordPress.org installs by country**: not published by any public endpoint.
- **WordPress.org language-pack downloads per locale**: not published; only the list of packs above.
- **Updates-server and app update checks by IP country** (Pro update checks, the app's update and subscriber calls): the log stores client IPs, but no GeoIP database is on a read-only path, and sending addresses to an outside lookup service is not allowed. The ccTLD proxy (S7) was used instead.
- **Server-side plugin events' GeoIP**: these come from the merchant's web host, so they locate the hosting company, not the till. Not used.
- **Support desk and Discord by language**: no read path to either is recorded in the access notes on this machine. Not attempted.
- **The companion regime-kinds file** (the kinds ticket under #640): no branch for it was pushed when this was written; the six kinds are taken from #662's own wording.

## 2. Shares by country

**Combined share [Inferred]** = the plain mean of a country's share in S3 (active Pro licences), S4 (stores with orders, Free and Pro) and S5 (active app installs). The three are independent and biased differently (billing address vs store setting vs till IP; paying vs opted-in vs erroring), so no one of them is weighted above the others. The first 15 countries below hold 72% of the combined figure; the 54 further countries the three sources list are each at 1.7% or less, and a tail of countries with one or two merchants each is not listed by the sources at all.

**Free installs ≈ [Inferred]** = 5,000 (the WordPress.org floor) × the country's share of Free stores with orders in S4. It is a rough estimate, not a floor: 5,000 bounds the total from below, but opted-in stores may be spread across countries differently from the rest, so no country's figure is a minimum. It also inherits S4's small sample.

| Rank | Country | Combined | S3 active Pro licences (n=612) | S2 Pro buyers, 24 mo (n=909) | S4 stores with orders (n=593) | S4 Free only (n=427) | S5 app installs (n=1,519) | Free installs ≈ |
|---|---|---|---|---|---|---|---|---|
| 1 | United States | 14.6% | 17.8% | 18.6% | 11.5% | 8.4% | 14.6% | ~420 |
| 2 | Spain | 10.0% | 11.1% | 10.1% | 7.9% | 7.5% | 11.0% | ~380 |
| 3 | Netherlands | 7.0% | 8.3% | 6.9% | 4.6% | 4.0% | 8.1% | ~200 |
| 4 | Australia | 4.6% | 5.1% | 5.1% | 3.0% | 1.4% | 5.8% | ~70 |
| 5 | United Kingdom | 4.4% | 6.0% | 6.1% | 3.9% | 3.5% | 3.3% | ~180 |
| 6 | Belgium | 3.8% | 4.9% | 4.1% | 3.5% | 2.6% | 3.0% | ~130 |
| 7 | France | 3.5% | 2.8% | 2.6% | 2.4% | 2.1% | 5.5% | ~110 |
| 8 | Mexico | 3.1% | 1.6% | 2.4% | 5.7% | 7.7% | 1.8% | ~390 |
| 9 | India | 2.7% | 0.5% | 0.3% | 4.0% | 5.4% | 3.6% | ~270 |
| 10 | Nigeria | 2.6% | 0.8% | 0.7% | 3.0% | 2.8% | 4.0% | ~140 |
| 11 | South Africa | 2.6% | 2.6% | 2.9% | 3.2% | 3.3% | 1.9% | ~160 |
| 12 | Chile | 2.5% | 1.0% | 1.0% | 3.4% | 4.0% | 3.3% | ~200 |
| 13 | Switzerland | 2.4% | 2.9% | 2.6% | 2.2% | 1.6% | 2.0% | ~80 |
| 14 | Canada | 2.2% | 3.6% | 4.5% | 1.0% | 0.5% | 2.1% | ~20 |
| 15 | Argentina | 1.8% | 1.5% | 1.5% | 2.4% | 3.0% | 1.6% | ~150 |
| 16 | Pakistan | 1.7% | 0.0% | 0.0% | 3.2% | 4.4% | 1.8% | ~220 |
| 17 | Germany | 1.2% | 1.5% | 2.3% | 1.3% | 1.4% | 0.8% | ~70 |
| 18 | Brazil | 1.1% | 0.8% | 1.3% | 1.2% | 1.4% | 1.4% | ~70 |
| 19 | Thailand | 1.1% | 0.8% | 0.6% | 1.5% | 1.6% | 0.9% | ~80 |
| 20 | Bangladesh | 1.0% | 0.0% | 0.0% | 2.5% | 3.5% | 0.6% | ~180 |
| 21 | Denmark | 1.0% | 1.5% | 1.7% | 1.2% | 0.5% | 0.4% | ~20 |
| 22 | Estonia | 1.0% | 1.1% | 0.8% | 0.5% | 0.5% | 1.3% | ~20 |
| 23 | Greece | 0.9% | 0.0% | 0.1% | 0.7% | 0.2% | 2.1% | ~10 |
| 24 | Italy | 0.9% | 0.8% | 0.9% | 1.2% | 1.6% | 0.7% | ~80 |
| 25 | New Zealand | 0.8% | 1.1% | 0.8% | 0.8% | 0.7% | 0.3% | ~40 |

All percentages in the table are [Inferred] from [Observed] counts. Further observations:

- **[Inferred] Pro and Free have different geographies.** Pro skews to high-income, low-fiscal-burden markets (the US, UK, Australia, Canada, the Netherlands). Free stores with orders skew to Latin America and South Asia: Mexico, India, Pakistan, Chile, Bangladesh and Argentina are 28% of Free stores with orders but 5% of active Pro licences.
- **[Observed] Spain has grown in Pro.** Spain is 7.1% of all-time Pro buyers (S1, rank 4), but 10.1% of buyers in the last 24 months (S2, rank 2) and 11.1% of active licences (S3, rank 2). The US fell from 26.6% of all-time buyers to 18.6%.
- **[Observed] The cross-checks agree on the order at the top.** Docs readers (S6): Spain 11.6%, the US 10.5%, the Netherlands 6.4%, the UK 4.9%, India 4.3%, France 4.1%, Belgium 4.0%. Pro update checks by ccTLD (S7), as a share of the 723 sites: `.uk` 7.3%, `.nl` 6.4%, `.be` 3.5%, `.au` 3.5%, `.es` 3.2%, `.ch` 1.9%, `.za` 1.9%, `.fr` 0.8%, with `.com` at 39%.
- **[Inferred] France is the most uncertain of the large countries:** it is 5.5% of app installs (S5) but 2.4–2.8% of Pro licences and stores with orders. Several tills per French merchant, or a docs and app audience larger than the buyer base, would explain it; this run cannot tell which.

## 3. France and Spain

| | Spain | France | Together |
|---|---|---|---|
| Combined (S3+S4+S5) | 10.0% | 3.5% | **13.5%** |
| Active Pro licences (S3) | 11.1% (68) | 2.8% (17) | 13.9% (85) |
| Pro buyers, 24 months (S2) | 10.1% (92) | 2.6% (24) | 12.8% (116) |
| Free stores with orders (S4, Free) | 7.5% (32) | 2.1% (9) | 9.6% (41) |
| App installs (S5) | 11.0% (167) | 5.5% (83) | 16.5% (250) |

**[Inferred]** About one merchant in seven is in France or Spain; the range across sources is 9.6% to 16.5%. Spain is three to four times France on the Pro and telemetry sources, and twice France on app installs. The Basque provinces (TicketBAI instead of Veri\*factu) cannot be split out: no source holds a region.

## 4. Regime kinds and named regimes

Each country is assigned the kind that binds a B2C till receipt there, the obligation a POS vendor would have to build for. Where a country has two, the heavier one is taken and the other noted. Countries in the fiscal-obligations file carry its label; every other assignment is **[Unverified]** general knowledge.

### Country → kind

| Kind | Countries in the top 60 (named regime) | Source of the assignment |
|---|---|---|
| No till-software rule | US, NL, AU, GB, ZA, CH, CA, NG, DK, EE, NZ, IE, SG, FI, AE, HK, IS, NC, LK, MA, DZ, LB, TT, BH, KW, IL, CY, AD; IN and ID for B2C (both clear B2B invoices) | All [Unverified]. Notes: Canada's Québec SRM binds restaurants only; Denmark registers bookkeeping systems, not tills; the UAE's e-invoicing is B2B and still phasing in; Nigeria's e-invoicing is for large taxpayers. |
| Self-declared chained records | ES (Veri\*factu; TicketBAI in the Basque provinces), FR (art. 286-I-3° bis CGI attestation), NO (kassasystemforskriften product declaration) | ES, FR [Primary in the dates file]; NO [Unverified] |
| Certified device or signing service | DE (KassenSichV TSE), AT (RKSV), SE (certified control unit), PT (AT-certified software), TH (Revenue Department POS approval), LT (fiscal module), PH (BIR POS accreditation) | DE [Memory/Primary], AT [Primary], SE [Secondary], PT [Memory] in the dates file; TH, LT, PH [Unverified] |
| Real-time reporting | PK (FBR POS integration, Tier-1 retailers), GR (myDATA with fiscal devices), EG (ETA e-receipt), CZ (EET 2.0 from 1 Jan 2027), GH (E-VAT), ZM (Smart Invoice), KE (eTIMS) | CZ [Primary in the dates file]; the rest [Unverified] |
| Fiscal hardware | BE (SCE 2.0 + FDM, hospitality only), IT (RT device), HU (online cash register), PL (online cash register), RO (AMEF), BD (EFD/SDC), VE (SENIAT fiscal printer), MT (fiscal cash register), TR (ÖKC), PR (IVU terminal) | BE [Secondary], IT [Primary], PL [Primary] in the dates file; the rest [Unverified] |
| Clearance e-invoicing | MX (CFDI), CL (boleta electrónica, SII), AR (factura electrónica, ARCA), BR (NFC-e), CO (DIAN POS electronic document), PE (SUNAT CPE), EC (SRI), CR (comprobante electrónico), MY (MyInvois, consolidated B2C allowed), TW (uniform e-invoice), UY (CFE), VN (e-invoice) | All [Unverified] |
| Not mapped | IR (0.7% combined; the regime was not assessed) | — |

### Share of merchants under each kind [Inferred]

Computed over the countries each source lists; the rest is the long tail of countries with one or two merchants each, and is not mapped.

| Kind | Combined | Active Pro licences (S3) | Free stores with orders (S4) |
|---|---|---|---|
| No till-software rule | 50.8% | 59.8% | 34.7% |
| Self-declared chained records | 14.0% | 14.5% | 9.6% |
| Clearance e-invoicing | 11.8% | 8.2% | 20.1% |
| Fiscal hardware | 7.8% | 7.7% | 9.4% |
| Real-time reporting | 4.2% | 1.0% | 6.8% |
| Certified device or signing service | 3.4% | 4.2% | 3.0% |
| Not mapped, plus the unlisted tail | 8.2% | 4.6% | 16.4% |

Fiscal hardware and real-time reporting are upper bounds for the merchants those regimes bind: they count all of Belgium, whose regime binds hospitality only, and all of Pakistan, whose regime binds Tier-1 retailers only. No source shows what fraction of either country's merchants is in scope.

### Share of merchants under each named regime [Inferred]

A ≤ marks a country share that bounds a sector-limited regime from above; the share the regime actually binds is unknown.

| Named regime | Kind | Combined | Active Pro (S3) | Free with orders (S4) |
|---|---|---|---|---|
| ES Veri\*factu (incl. TicketBAI) | Self-declared chain | 10.0% | 11.1% | 7.5% |
| BE SCE 2.0 / FDM (hospitality only) | Fiscal hardware | ≤3.8% | ≤4.9% | ≤2.6% |
| FR art. 286 CGI | Self-declared chain | 3.5% | 2.8% | 2.1% |
| MX CFDI | Clearance | 3.1% | 1.6% | 7.7% |
| CL boleta electrónica | Clearance | 2.5% | 1.0% | 4.0% |
| AR factura electrónica | Clearance | 1.8% | 1.5% | 3.0% |
| PK FBR POS integration (Tier-1 retailers only) | Real-time | ≤1.7% | 0.0% | ≤4.4% |
| DE KassenSichV TSE | Certified device / service | 1.2% | 1.5% | 1.4% |
| BR NFC-e | Clearance | 1.1% | 0.8% | 1.4% |
| TH RD POS approval | Certified device | 1.1% | 0.8% | 1.6% |
| BD EFD/SDC | Fiscal hardware | 1.0% | 0.0% | 3.5% |
| GR myDATA + fiscal device | Real-time | 0.9% | 0.0% | 0.2% |
| IT RT | Fiscal hardware | 0.9% | 0.8% | 1.6% |
| CO DIAN POS e-document | Clearance | 0.8% | 0.8% | 1.4% |

### The three regimes after France and Spain

1. **Belgium, SCE 2.0 / FDM — about 3.8% combined, 4.9% of active Pro.** [Inferred] It binds hospitality businesses only, and no source says which Belgian merchants run restaurants or bars. The share it actually covers is therefore some fraction of 3.8%.
2. **Mexico, CFDI — about 3.1% combined, 7.7% of Free stores with orders.** [Inferred] The largest single regime among Free stores, and mostly a Free-plugin population (1.6% of active Pro).
3. **Chile, boleta electrónica — about 2.5% combined.** [Inferred] Also mostly Free.

[Inferred] If Belgium is discounted for its hospitality-only scope, Argentina (1.8%) is third. Mexico, Chile and Argentina together, plus Brazil, Colombia, Peru, Ecuador and Costa Rica, make Latin American clearance e-invoicing about 11% of merchants, close to Spain alone, but it is eight separate national systems, not one. Germany, the regime most often named next, is only 1.2%.

## 5. Confidence

- **Pro shares: moderate to high [Inferred].** S1–S3 are the store's own billing records. S2 and S3 agree within about one point for every top-15 country, and S3 counts licences that actually validated in the last 90 days. The main error is billing country ≠ till country for agencies and multinational buyers.
- **Free shares: low to moderate [Inferred].** S4 rests on 427 Free stores with orders out of 5,000+ active installs (under 9%), and only sites that opted in to analytics on recent versions. Opt-in rates may differ by country and language, and the translated admin may raise it in Spanish- and French-speaking markets. The sample is too small to rank countries below about 1.5%.
- **Combined shares: moderate for the top seven, low below [Inferred].** The US, Spain and the Netherlands are in the top four of every source. Australia, the UK, Belgium and France are in the top ten of S3 and S5 but rank 6th to 14th among stores with orders (S4). From rank 8 down, sources disagree by a factor of 2–10 (Mexico 1.6–5.7%, India 0.5–4.0%, Canada 1.0–3.6%), so the order there depends on the equal-weight choice.
- **France and Spain at 13.5%: moderate [Inferred]**, with a range of 9.6–16.5% across sources.
- **Regime mapping: low to moderate [Unverified]** outside the nine countries in the fiscal-obligations file. Every share under a kind inherits both the country-share error and any mis-assignment.
- **Not counted:** merchants who never bought Pro, never opted in to analytics and never logged an app error are invisible to every country source. That is most Free installs.
