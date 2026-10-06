# SDK or cloud: what each route buys, provider by provider, 2026-10-06

Asked by Paul, 2026-10-06: *"Do we know what we actually get with the SDK over, say, the cloud API? I tried the SumUp terminal over Wi‑Fi and it seems to work really well. I guess the SDK is only needed for Bluetooth? Can we offer Bluetooth in any other way? The same goes for gateways like Adyen — what do we gain from the SDK vs the cloud API."*

This builds on three notes and does not repeat them:
- [roadmap#114](https://github.com/wcpos/roadmap/issues/114), the SDK landscape (`.claude/research/2026-08-28-card-present-sdks.md` on monorepo branch `research/card-present-sdks`), cited as **#114**.
- [The loading note](2026-10-05-bluetooth-reader-sdk-loading.md): Paul's 2026-10-05 ruling, the Square build, what is inside the SDKs, and §2a (no vendor publishes its Bluetooth reader protocol).
- [The market survey](2026-10-06-card-present-sdk-market-survey.md), cited as **the survey**.

This was desk research only. Nothing was built or installed. The only hardware evidence is the SumUp Solo run of 2026-10-05, recorded on [roadmap#231](https://github.com/wcpos/roadmap/issues/231).

Labels:
- **S**: Sourced from a vendor developer page, API spec or our own run record (linked in §9).
- **I**: Inferred.
- **U**: Unverified (absence of evidence, conflicting primary pages, or a non-primary source).
- **NE**: Not evaluated.

## The short answer

**What the SDK buys**, in general:
- Bluetooth-only readers.
- Tap to Pay on the phone.
- Offline (store-and-forward) card payments.
- In-process callbacks instead of webhooks.
- The vendor's own pairing, firmware-update and settings screens.

**What the cloud route buys:**
- Every platform: iOS, Android, web, Electron.
- No app weight, permissions or vendor code running at launch.
- Several readers per merchant, and any till can drive any reader.
- Webhooks to the WordPress server, so the server learns the result itself.

**On a reader that has a cloud route, the SDK adds little beyond offline.** SumUp Solo is the clearest case. Over the Cloud API it does on-reader tipping, cancel from the till, refunds, receipts via API, and reader status including battery, firmware and "waiting for PIN". The only thing SumUp lists as SDK-only on a Solo is offline payments. Those are opt-in, Europe only, and Visa and Mastercard only. Paul's "works really well" matches the documentation.

**"Is the SDK only needed for Bluetooth?"** Mostly yes. Bluetooth and Tap to Pay are what the SDK alone does in-app. The one exception is offline: Stripe allows offline mode only through its mobile SDK, even on Wi-Fi smart readers.

**"Can we offer Bluetooth another way?"** We can't drive a Bluetooth reader ourselves, because no vendor publishes the protocol (loading note §2a). But there are three ways around it:
1. **Dual-mode readers.** Two of the readers we care about also speak Wi-Fi to a cloud API:
   - SumUp Solo: Wi-Fi, mobile data and Bluetooth.
   - PayPal Reader, through Zettle's **Reader Connect** API. This is new: the earlier notes said Zettle had no cloud route.
2. **Handoff to the provider's app**, which owns the Bluetooth link:
   - Square: Point of Sale API.
   - SumUp: Payment Switch, now marked legacy.
   - Adyen: Payments app, Android, Tap to Pay only.
   - Mollie: Tap app.
3. **Mollie's Tap app.** It can be driven from the Mollie API "like a traditional card terminal". That puts Tap to Pay on a phone with no SDK in our app.

**Where the SDK is the only in-app way:**
- Stripe M2, WisePad 3 and Chipper 2X BT.
- Stripe Tap to Pay.
- Square Reader and Stand. A handoff exists, but it leaves our app.
- SumUp Air, 3G, PIN+ and Solo Lite. Payment Switch exists, but it is legacy.
- The older Zettle Reader.
- Adyen NYC1.
- Tap to Pay *inside* WCPOS, for Stripe, SumUp, Square and Adyen on iPhone.

## 1. Stripe

| Capability | Cloud (server-driven API) | SDK (React Native Terminal SDK) |
|---|---|---|
| Devices | Smart readers only: T600, S700/S710, WisePOS E, Verifone V660p/UX700/P630/M425 (S) | All of those, plus M2 (US), WisePad 3, Chipper 2X BT over Bluetooth/USB, plus Tap to Pay (S) |
| Tap to Pay | No (S) | iPhone and Android (S) |
| Offline | **No**: "Server-driven integration doesn't support… Collect payments while offline" (S) | Yes, on mobile **and smart** readers ("Offline mode requires the Terminal mobile SDK", S). Max 10,000 USD per payment; merchant bears all decline risk; must have connected online at the same Location within 30 days; no swipe; no contactless in SCA markets; Tap to Pay offline is iPhone-only (private preview), none on Android (S) |
| On-reader tipping | Yes on smart readers (`process_config[tipping]`, S) | Smart readers and WisePad 3; M2 "receipt tipping only" (S) |
| On-screen inputs | Smart readers (S) | Smart readers only (S) |
| Cancel from till | `cancel_action`; not during authorisation (`terminal_reader_busy`) (S) | `collectPaymentMethod` returns a cancelable (S, code samples) |
| Refunds | Refunds API; card-present `refund_payment` reader action (S) | Same back end (I) |
| Receipts | Email/receipt data from the PaymentIntent (I) | Same; offline payments carry `ReceiptDetails`; prebuilt email only after forwarding (S) |
| Reader updates | Smart readers update themselves when idle (S) | Mobile readers are updated **by our app** through the SDK; required updates install during connection; optional ones we must trigger (S) |
| Status | Webhooks `terminal.reader.action_*` or poll; reader "offline" after 2 min silent; missing webhooks leave `in_progress` until `cancel_action` (S) | In-process callbacks, including offline/forwarding events (S) |
| Readers per till | Any reader by ID; one action at a time per reader (S) | "A reader connects to one SDK instance at a time" (S) |
| Platforms | Any server; also a JavaScript SDK for browsers (smart readers only) (S) | iOS, Android (S) |
| Region | Smart readers in most Stripe markets; M2 US only (S) | Same, plus Tap to Pay country list (S) |
| Surcharge, pricing by route | NE | NE |

**Verdict: compile the SDK in.** It is the only route for Stripe's Bluetooth readers and for Tap to Pay. It is also the only route for **offline on any Stripe reader**, including the smart readers that cloud already drives. Cloud is the better default for countertop smart readers: same tipping, no app weight, and web and desktop tills work. Offline is the one reason to drive a smart reader through the SDK, and we only need that if offline card sales are a WCPOS 2.0 goal (ruling 3).

## 2. SumUp

| Capability | Cloud API | SDK (iOS SDK / Android SDK / Android Tap to Pay SDK) |
|---|---|---|
| Devices | **Solo** and **Go** (Go: AU, MX, CA) (S). **Not** Solo Lite, Air, 3G, PIN+ (S) | Solo, Solo Lite, Air, 3G, PIN+; Tap to Pay on iPhone in the iOS SDK; Android Tap to Pay in a separate SDK (S) |
| Tap to Pay | No (S) | Yes (S) |
| Offline | No (S) | Yes, but: opt-in through SumUp's Integrations team with extra terms; "currently supported in Europe through Worldpay"; Visa and Mastercard only; Solo firmware 3.3.31.0+, Solo Lite 2.2.1.25+; not Tap to Pay; merchant bears decline risk; session and volume limits (S) |
| On-reader tipping | Yes: `tip_rates`, `tip_timeout` 30–120 s (timeout needs Solo 3.3.38.0+) (S) | Yes: tip-on-card-reader where `isTipOnCardReaderAvailable` (S) |
| Cancel from till | `terminate`, only while the reader waits for card/PIN; no confirmation; reported as `failed` (S) | No programmatic cancel found; the SDK presents its own checkout screen modally (S modal; U cancel) |
| Refunds | Via SumUp API (S); proven on a Solo sale 2026-10-05 (S, #231) | Via SumUp API (S) |
| Receipts | Receipts API (S). Solo has printer support (S); whether a Cloud checkout prints: U | Receipts API; email/SMS prefill at checkout (S) |
| Reader status | Battery level and temperature, firmware, connection type, `ONLINE`/`OFFLINE`, state `IDLE / SELECTING_TIP / WAITING_FOR_CARD / WAITING_FOR_PIN / WAITING_FOR_SIGNATURE / UPDATING_FIRMWARE` (S, OpenAPI) | Battery, serial, model, active (S) |
| Pairing, firmware | Pairing code on the Solo plus one API call (S); firmware handled on-device (I, from `UPDATING_FIRMWARE`) | SDK's own "card reader page": pair, battery, firmware update (S) |
| Multiple readers on one account | Yes (S) | No (S) |
| Result delivery | Webhook to `return_url` (must be public HTTPS) plus Get Reader Checkout poll (S) | In-process result (S); no webhooks (S) |
| Platforms | "Any server-capable platform" (S) | iOS, Android (S) |

**Solo specifics (Paul's experience).** On 2026-10-05 the Cloud API on a physical Solo did all of these (S, #231):
- A 1.00 € approval, settled by our poll after 13 s, with SumUp's webhook 4 s later.
- A decline.
- A cancel from the till, voided in 3 s on the first path and 12 s after the reader-status fix, ten of those seconds being our own grace.
- A walk-away, which the Solo abandons after about 60 s.
- A provider refund.

What the cloud route **withholds** on a Solo, against the SDK:
- Offline. This is SDK-only, and conditional as above (S).
- A distinct cancel result. The webhook reports a decline and a cancel both as `failed`. A cancelled or expired checkout on a physical Solo "records no transaction" (S, #231). We work around it with the reader-status endpoint.

What it **adds** over the SDK:
- Several Solos per account.
- Webhooks.
- Web and desktop tills.
- No Bluetooth or location permissions.

**Verdict: cloud is enough for Solo, and is the default.** The SDK earns its place for the Bluetooth-only readers (Air, Solo Lite, 3G, PIN+) and for Tap to Pay. It is already built (#236), so keeping it costs binary weight only (loading note). Payment Switch is now "a legacy fallback integration and is no longer actively being developed" (S), so it is not a safe long-term handoff.

## 3. Square

| Capability | Cloud (Terminal API) | SDK (Mobile Payments SDK) | Handoff (Point of Sale API) |
|---|---|---|---|
| Devices | **Square Terminal** (S) | Square Reader for contactless and chip (all gens), Reader for magstripe, Stand (both gens) (S) | Square Reader, Tap to Pay (S) |
| Tap to Pay | No (I) | iPhone and Android (#114) | Yes (S) |
| Offline | The Square Terminal product works offline "for up to 24 hours" (S); whether a Terminal API checkout can start offline: U (it is pushed through Square's cloud, so I: no) | Up to 1,000 payments / 24 h per device; per-seller amount limits; seller must opt in by contacting Square; seller liable; newest reader generations only (S) | A cookbook page exists (S); detail NE |
| On-device tipping | Yes (S) | NE | Square app handles it (S) |
| Signature | `collect_signature`, US and CA only (S) | NE | Square app (S) |
| Surcharge | Automatic card surcharging, US only (S) | NE | NE |
| Receipts | Terminal prints and issues receipts (S) | NE | Square app (S) |
| Refunds | Refunds API; Interac through the Terminal (S) | Payments/Refunds API (I) | Via Square APIs (S) |
| Cancel from till | Cancel while `PENDING` or `IN_PROGRESS` (S) | NE | Not in our app (I) |
| Status | `terminal.checkout.*` webhooks or poll (S) | In-process (I) | URL callback (S) |
| Pairing | Device codes via the Devices API (S) | In-app pairing (S, doc section) | Square app (S) |
| Split tender | Not within one checkout (S) | NE | NE |
| Countries | Features listed for US, CA, AU, GB, JP (S) | US, CA, UK, AU (S) | "Not available in all countries" (S) |

**Verdict: the SDK's capabilities are real, but the case for it is the weakest of the "big three".**
- Square Terminal is fully served by the Terminal API, including Japan, which the SDK doesn't cover.
- Square Reader and Tap to Pay are reachable without native code through the POS API handoff (iOS, Android and mobile web).
- What the SDK adds is Reader/Stand **inside** WCPOS, plus SDK offline.

Against that, the loading note measured the heaviest cost of any SDK:
- 96 MB of frameworks;
- start-up at launch, calling Square;
- microphone and phone-state permissions for every merchant.

Compile it in only if merchants need Reader or Stand without leaving WCPOS (ruling 1).

## 4. Adyen

| Capability | Cloud (Terminal API, cloud) | SDK (POS Mobile SDK) | Handoff (Payments app) |
|---|---|---|---|
| Devices | Adyen terminals: Verifone Engage and Android ranges (S) | **NYC1** card reader (Bluetooth, or USB on Android) and Tap to Pay (S) | Tap to Pay, Android only (S) |
| NYC1 over cloud | No. NYC1 talks "through Bluetooth" to the POS app, and "transaction screens appear on the mobile device" (S); no cloud path documented (I) | Yes (S) | No (S) |
| Offline | "With payment terminals using cloud communications, it is not very useful to enable offline payments" (S). **Local** Terminal API does offline EMV plus store-and-forward (S) | Store-and-forward on **iOS only** (TTP and card reader); no offline EMV; no refunds while offline (S) | NE |
| Tipping | Tipping from the terminal or the POS (S, doc sections) | Not in the Mobile feature table (U, absence) | NE |
| Surcharge | Configuration-based and dynamic (S, doc sections) | Tap to Pay in AU/NZ only (S) | NE |
| Refunds | Referenced and unreferenced (S) | Referenced and unreferenced (S) | NE |
| Cancel, receipts | Cancel an in-progress transaction; generate receipts (S, doc sections) | NE | NE |
| Status | Sync (result in the HTTP response) or async event notifications (S) | In-process (I) | App Link callback (loading note) |
| Platforms | Any server (S) | iOS, Android; "your POS app must be integrated with our Terminal API" in both cases (S) | Android only (S) |

**Verdict: cloud is enough** for every Adyen terminal, and its synchronous endpoint is the simplest result path of any provider. The SDK buys only the NYC1 and Tap to Pay on iPhone (Android Tap to Pay has the Payments-app handoff), plus iOS-only offline. This matches the survey: SDK on demand.

There is a third route, untested: the **local** Terminal API, HTTPS to the terminal's IP on port 8443 with Adyen's certificate and message encryption (S). It is the only Adyen route with full offline. Whether our JavaScript can run it without native TLS code: NE.

## 5. Zettle (PayPal)

| Capability | Cloud (Reader Connect API) | SDK (iOS / Android Payments SDK) |
|---|---|---|
| Devices | **PayPal Reader** over Wi‑Fi (S) | PayPal Reader and the older Zettle Reader over Bluetooth; PayPal Reader also wired (S) |
| Platforms | iOS, Android, **Web, Windows**, "All other platforms" (S) | iOS, Android (S) |
| How it works | REST to link the reader (8-digit code), then a WebSocket "from your web or mobile app"; each payment message carries a Zettle OAuth access token (S) | SDK "places a screen over the host application" (S) |
| Tap to Pay | No (S) | Zettle's overview table marks it supported for the SDK, but the iOS SDK's feature list doesn't mention it, and #114 found it only in PayPal's own app: **U** |
| Offline | No (S) | PayPal Reader only (S) |
| Manual card entry, PayPal/Venmo QR | No (S) | Yes (S) |
| "Multi-Pay" | Yes, PayPal Reader (S); meaning NE | No (S) |
| Tipping | `tippingType` NONE / DEFAULT / AMOUNT / PERCENTAGE (S) | NE |
| Cancel from till | `CANCEL_PAYMENT_REQUEST` (S) | NE |
| Refunds | Not in the Reader Connect pages read (U) | Full or partial, behind a password check or elevated tokens (S) |
| Status | Streamed progress: `PRESENT_CARD`, `PIN_ENTRANCE`, `REQUIRE_SIGNATURE`, `READER_UPDATING`, … and `STATUS_REQUEST` → `READY / BUSY / NOT_CONNECTED` (S) | In-process (I) |
| Readers | Any account in the organisation can send to a linked reader; one WebSocket session covers several links (S) | Pairing through the SDK's Settings view (S) |
| Markets | NE | Card payments in US, UK, SE, NO, DK, FI, DE, MX, NL, FR, ES, IT (S) |
| Access gate | U. Only a secondary source says Reader Connect needs partner approval | Self-service portal (survey) |

**Verdict: this changes the survey.** The survey ranked Zettle "compile in next" because it found no cloud route. Reader Connect is that cloud route, for the current PayPal Reader, and it runs on every WCPOS platform with no native code.

Its shape differs from the other cloud APIs:
- The **till**, not the WordPress server, holds the WebSocket and a Zettle access token (S).
- The server learns the result from the till (I) unless it checks Zettle's Purchase API afterwards (I). That is a weaker money path than a server webhook, and needs designing.

The SDK still buys:
- the older Zettle Reader;
- offline;
- QR payments and manual entry;
- possibly Tap to Pay (unclear).

Reader Connect first; the SDK only if merchants on the old Zettle Reader ask (ruling 2).

## 6. Mollie

Mollie has no SDK; the only routes are cloud and its own apps.
- **Devices:** PAX A920 Pro, A35 and IM30, Mollie Tap Terminal, and any phone running the **Mollie Tap app** (S).
- **Tap to Pay without an SDK.** Tap offers "**API to app**: receive payments triggered remotely through the Mollie API, like a traditional card terminal", for "browser-based partners and software integrations" (S). It also offers Android app-to-app intents (our app registered with Mollie, signed messages), and redirect links on iPhone (S). #114 said Mollie's Tap to Pay had "no public developer surface"; that is now out of date.
- **Status:** webhook or poll; a session times out after about 40 s (S).
- **Refunds:** full and partial (S).
- **Tipping:** the terminals tip (S); whether an API-started sale prompts for a tip: U.
- **Currencies:** EUR, NOK, DKK, SEK, PLN, CHF, CZK, GBP (S).
- **Not established:** offline, cancel via API and receipt printing were not found in the pages read (NE).

**Verdict: cloud only.** API-to-app is worth a spike as the Mollie Tap to Pay route.

## 7. Mercado Pago and Dojo (cloud-only examples)

- **Mercado Pago:** Point Smart 1 and 2 through the unified Orders API, with receipt printing configurable (S). Its Bluetooth readers are reachable only by deep link into the Mercado Pago app (survey). There is no SDK.
- **Dojo:** the Pay at Counter terminal endpoints create, retrieve and cancel sessions, with signature verification and manual or auto capture (S). Dojo's only SDK is Tap to Pay (survey).

Neither needs anything in the app.

## 8. What each route needs

| Need | Cloud | SDK |
|---|---|---|
| Reader connectivity | Its own Wi‑Fi or SIM (S per vendor). SumUp mobile data needs "manual enabling by SumUp" (S) | Bluetooth/USB to the phone; the phone reaches the vendor (S) |
| WCPOS server | Calls the provider. Must be reachable for webhooks: SumUp `return_url` must be public HTTPS (S). Stripe and Mollie can poll; Adyen sync needs no webhook (S) | Only to record the order (I); not needed during an SDK offline sale (I) |
| Tills | Web, Electron, iOS, Android (I; Zettle and SumUp state it, S) | iOS and Android app only (S) |
| App cost | None | Binary size, permissions, launch-time vendor code, build credentials, forced updates: see the loading note's measurements and the survey §3. Not restated here |
| Who builds the cashier UI | Us, from status events | Partly the vendor: SumUp and Zettle present their own checkout screens over our app (S) |

**Per-transaction pricing by route:** none of the developer pages read says the price differs between cloud and SDK. Pricing pages were not read: NE.

## Cross-provider summary

| Provider | Cloud-drivable devices | SDK-only devices | SDK-only capabilities | Dual-mode readers | Handoff | Verdict |
|---|---|---|---|---|---|---|
| Stripe | T600, S700/S710, WisePOS E, Verifone | M2, WisePad 3, Chipper 2X BT; Tap to Pay | Offline (all readers); reader-update UX for mobile readers | None (S) | None found (U) | **SDK earns its place** |
| SumUp | Solo, Go | Air, Solo Lite, 3G, PIN+; Tap to Pay | Offline (EU, opt-in, Visa/MC) | **Solo** (S) | Payment Switch, legacy (S) | Cloud for Solo; **SDK for Bluetooth-only readers and Tap to Pay** |
| Square | Square Terminal | Reader, Stand; Tap to Pay (in-app) | Offline on Reader/Stand | None (I) | POS API: Reader + Tap to Pay, incl. mobile web (S) | **Cloud + handoff first**; SDK only for in-app Reader |
| Adyen | All Adyen terminals | NYC1; Tap to Pay on iPhone | iOS store-and-forward | None (S) | Payments app, Android Tap to Pay (S) | **Cloud**; SDK on demand |
| Zettle | PayPal Reader (Reader Connect) | Zettle Reader | Offline, QR, manual entry; Tap to Pay U | **PayPal Reader** (S) | URL scheme deprecated (loading note) | **Reader Connect first**; SDK on demand |
| Mollie | PAX terminals, Tap Terminal, phones running Tap ("API to app") | n/a | n/a | n/a | Tap app-to-app (Android), redirect links (iPhone) (S) | **Cloud** |
| Mercado Pago | Point Smart 1/2 | n/a (no SDK) | n/a | NE | Deep link to MP app (survey) | Cloud |
| Dojo | Dojo terminals | Tap to Pay (Dojo SDK) | Tap to Pay | NE | NE | Cloud |

## Recommendation

Rank by what the SDK *uniquely* does, not by brand size:

1. **Stripe: keep the SDK** (#235). It is the only route for three Bluetooth readers, Tap to Pay and every offline payment. That is the strongest capability case of any provider.
2. **SumUp: keep the built SDK** (#236) for Air, Solo Lite, 3G, PIN+ and Tap to Pay. Keep cloud as the Solo default (sumup#49 already did this). Don't build on Payment Switch.
3. **Square: Terminal API + POS API handoff first.** The SDK's only unique gain is Reader and Stand inside WCPOS, plus offline. It carries the heaviest measured cost. This narrows Paul's 2026-10-05 exception, so it needs his ruling.
4. **Zettle: Reader Connect, not the SDK.** This reverses the survey's "compile in next". Check the access gate and design how the server verifies the result first.
5. **Adyen, Mollie, Mercado Pago, Dojo: cloud.** Try Mollie's API-to-app as Tap to Pay without an SDK.

On capability grounds, the SDKs that earn a place are **Stripe and SumUp**. Square earns one only if in-app Reader/Stand is wanted. Zettle and Adyen don't, until a merchant needs a reader that has no cloud route.

## Rulings needed from Paul

1. **Square:** does it keep its native SDK under the 2026-10-05 "big providers" exception? Or Terminal API plus POS API handoff first, with the SDK only when merchants ask for Reader/Stand inside WCPOS?
2. **Zettle:** Reader Connect (cloud, every platform) instead of the SDK? This replaces the survey's ruling question 1.
3. **Offline card payments:** is this a WCPOS 2.0 goal? It is the main thing the SDK adds on readers that already have a cloud route (Stripe smart readers, SumUp Solo). The merchant carries the decline risk, and SumUp limits it to Europe on an opt-in.
4. **Mollie Tap to Pay:** spike the Tap app's API-to-app route?

## 9. Sources

**Our records**
- [roadmap#231](https://github.com/wcpos/roadmap/issues/231): the physical SumUp Solo run, 2026-10-05.

**Stripe**
- [Select a reader](https://docs.stripe.com/terminal/payments/setup-reader): capability table, update policy, one SDK per reader.
- [Designing an integration](https://docs.stripe.com/terminal/designing-integration).
- [Collect card payments, server-driven](https://docs.stripe.com/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven).
- [Offline overview](https://docs.stripe.com/terminal/features/operate-offline/overview).
- [Offline payments, React Native](https://docs.stripe.com/terminal/features/operate-offline/collect-card-payments.md?terminal-card-present-integration=terminal&reader-type=bluetooth&terminal-sdk-platform=react-native).
- [On-reader tipping](https://docs.stripe.com/terminal/features/collecting-tips/on-reader).

**SumUp**
- [In-person overview: feature and reader tables](https://developer.sumup.com/terminal-payments/index.md).
- [Cloud API](https://developer.sumup.com/terminal-payments/cloud-api/index.md).
- [SDKs](https://developer.sumup.com/terminal-payments/sdks/index.md).
- [iOS SDK](https://developer.sumup.com/terminal-payments/sdks/ios-sdk/index.md).
- [Android SDK](https://developer.sumup.com/terminal-payments/sdks/android-sdk/index.md).
- [Offline Transactions](https://developer.sumup.com/terminal-payments/sdks/offline-transactions/index.md).
- [Payment Switch](https://developer.sumup.com/terminal-payments/payment-switch/index.md).
- Readers: [Solo](https://developer.sumup.com/terminal-payments/readers/solo/index.md), [Solo Lite](https://developer.sumup.com/terminal-payments/readers/solo-lite/index.md), [Air](https://developer.sumup.com/terminal-payments/readers/air/index.md), [Go](https://developer.sumup.com/terminal-payments/readers/go/index.md).
- [OpenAPI spec](https://github.com/sumup/sumup-developer/blob/main/openapi.json): `CreateReaderCheckoutRequest`, `StatusResponse`.

**Square**
- [Terminal API overview](https://developer.squareup.com/docs/terminal-api/overview).
- [Additional checkout features](https://developer.squareup.com/docs/terminal-api/additional-payment-checkout-features).
- [Payments overview](https://developer.squareup.com/docs/payments-overview): Square Terminal offline.
- [Mobile Payments SDK](https://developer.squareup.com/docs/mobile-payments-sdk).
- [MPSDK offline payments](https://developer.squareup.com/docs/mobile-payments-sdk/android/offline-payments).
- [POS API](https://developer.squareup.com/docs/pos-api/what-it-does).

**Adyen**
- [Mobile solutions: feature, country and option tables](https://docs.adyen.com/point-of-sale/ipp-mobile/).
- [NYC1 user guide](https://docs.adyen.com/point-of-sale/user-manuals/nyc1/).
- [Terminal API](https://docs.adyen.com/point-of-sale/design-your-integration/terminal-api/).
- [Choose an architecture](https://docs.adyen.com/point-of-sale/design-your-integration/choose-your-architecture/).
- [Offline payments](https://docs.adyen.com/point-of-sale/offline-payment/).

**Zettle**
- [Payment integrations overview: platform and hardware tables](https://developer.zettle.com/docs/payment-integrations/overview).
- Reader Connect: [overview](https://developer.zettle.com/docs/payment-integrations/reader-connect/overview), [pairing and links](https://developer.zettle.com/docs/payment-integrations/reader-connect/concepts/pairing-and-links), [link a reader](https://developer.zettle.com/docs/payment-integrations/reader-connect/user-guides/link-reader), [WebSocket](https://developer.zettle.com/docs/payment-integrations/reader-connect/user-guides/create-a-websocket-connection), [make payments](https://developer.zettle.com/docs/payment-integrations/reader-connect/user-guides/make-payments).
- iOS SDK: [overview](https://developer.zettle.com/docs/payment-integrations/ios-sdk), [concepts](https://developer.zettle.com/docs/payment-integrations/ios-sdk/concepts/how-the-payments-sdk-works).
- The portal is a client-rendered app. Text was read from each page's embedded page data (`__NEXT_DATA__`) on developer.zettle.com, not from a search engine copy.

**Mollie**
- [Point of sale method](https://docs.mollie.com/docs/point-of-sale).
- [Integrating terminals](https://docs.mollie.com/docs/integrating-mollie-terminals).
- [Mobile Solutions (Tap)](https://docs.mollie.com/docs/mobile-solutions).
- [Tap to Pay in your Android app](https://docs.mollie.com/docs/integrating-tap-to-pay-in-your-android-app).
- [In-person payments](https://docs.mollie.com/docs/in-person-payments).

**Others**
- [Mercado Pago Point overview](https://www.mercadopago.com.mx/developers/en/docs/mp-point/overview).
- [Dojo terminals](https://docs.dojo.tech/payments/accept-payments/in-person-payments/pay-at-counter/terminals).

## 10. Could not source, and corrections to earlier notes

**Corrections:**
- The loading note and the survey said Zettle has "no cloud payment API". **Reader Connect** is one (S).
- #114 said Mollie's Tap to Pay had no developer surface. Tap now documents API-to-app and Android app-to-app (S).
- SumUp Payment Switch is now legacy and no longer developed (S).
- SumUp has a cloud-only **Go** reader (AU, MX, CA) (S).

**Not sourced:**
- Whether Reader Connect needs partner approval, and in which markets it runs.
- Reader Connect refunds.
- What "Multi-Pay" means.
- Whether the Zettle SDK really offers Tap to Pay. Zettle's own pages conflict.
- Square Mobile Payments SDK tipping, receipts and cancel. Square Terminal offline when driven by the Terminal API.
- Whether a SumUp Cloud checkout prints on the Solo's printer.
- Stripe Terminal surcharging (the page 404'd).
- Adyen Mobile SDK tipping.
- Mollie offline, API cancel and receipts.
- Any statement that per-transaction pricing differs by integration route.
