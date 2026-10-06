# Tap to Pay, provider by provider: who, where, which phones, what it costs, what it asks of WCPOS, 2026-10-06

Asked by Paul, 2026-10-06: *"Tap to Pay is going to be quite important for my users — most of them are small stores, markets, pop-ups etc. The ability to use their existing phone to take payments will be very compelling."*

Tap to Pay comes only through a provider's SDK compiled into our app, or by handing the sale to the provider's own app, never over a cloud API (earlier notes). This note asks which providers' Tap to Pay WCPOS merchants can use, where, on which phones, at what cost, and what each demands of our app. Desk research only; nothing was built.

It builds on, and does not repeat:
- [the SDK-or-cloud note](2026-10-06-sdk-vs-cloud-per-provider.md);
- [the market survey](2026-10-06-card-present-sdk-market-survey.md), cited as **the survey**;
- [the loading note](2026-10-05-bluetooth-reader-sdk-loading.md);
- [roadmap#114](https://github.com/wcpos/roadmap/issues/114), cited as **#114**: `.claude/research/2026-08-28-card-present-sdks.md` on monorepo branch `research/card-present-sdks`.

Labels:
- **S**: Sourced from a primary page (Apple, a PSP's developer docs or pricing page, or a vendor repository), linked in §8.
- **S†**: The vendor's own page, but it returned 403 or would not render, so the text was read from the search engine's copy.
- **I**: Inferred.
- **U**: Unverified. This covers absence of evidence, conflicting primary pages, and forum posts by non-Apple users.
- **NE**: Not evaluated.

## The short answer

**Two SDKs we already have cover almost every WCPOS market.** Those two are **Stripe** and **SumUp**.
- **Stripe** alone offers Tap to Pay on iPhone in 38 of the 59 countries on Apple's list. On Android it covers the US, Canada, the UK, most of the EU, Australia, New Zealand and Singapore. Japan is iPhone-only, in preview (S).
- **SumUp** adds Brazil, Chile, Colombia and Peru (S). Together they reach **42 of Apple's 59 countries** (counted from Apple's list).
- **Adyen** adds four more, but its merchants are not market-stall sellers (I).
- **Square** adds **no country**, and its Tap to Pay is reachable by the POS API handoff anyway.

So the order is Stripe, then SumUp (its Android Tap to Pay SDK is separate and review-gated), then cheap JavaScript handoffs for Mollie, Viva, myPOS and Square.

**The Apple and Google gates.**
- **iPhone only.** iPhone XS or later; "not supported in iPadOS" (S). An iPad till still needs a reader.
- **One entitlement, ours.** The organization account's Account Holder requests it: development first, distribution later, and a production verification for each bundle ID (S).
- **Apple's HIG is a review criterion.** It sets an administrator-only terms flow, a merchant tutorial, the button wording, preparing the reader at launch and on every foreground, and Apple-only assets in marketing, with announcements sent to Apple for approval (S).
- **Android has no Google API** (U, absence). Each PSP's SDK attests the phone itself: GMS-certified, integrated NFC, a recent patch, no root, **developer options off**. Stripe needs Android 13+; SumUp and Mollie take 11+ (S).
- **PCI binds the PSP, not us** (I, from Apple's and PCI's wording).

**The biggest unknown.** Nobody publishes whether **one WCPOS entitlement can carry several PSPs**, or whether two Tap to Pay SDKs can share one app. The entitlement is a single boolean, and each PSP supplies its own per-merchant token at runtime (S), which points to "yes" (I). But Apple reviews each request behind a sign-in (U), and both SDKs drive the same system `ProximityReader` (I). Settle it with Apple and by a build before promising a second Tap to Pay provider.

## 1. Coverage matrix

The cells show **iPhone · Android**, for Tap to Pay **inside WCPOS**:
- **Y**: available in the SDK.
- **P**: available in public preview.
- **H**: available by handoff to the provider's own app.
- **—**: none.
- **U**: conflicting sources.

Stripe's cells come from its availability lists. SumUp's come from its developer page, Adyen's from its country table, and Square's from its Mobile Payments SDK country list (all S).

| Country | Stripe | SumUp | Square | Adyen | Other routes into WCPOS |
|---|---|---|---|---|---|
| United States | Y · Y | — · Y | Y · Y | Y · Y | Square POS API (H) |
| Canada | Y · Y | — · — | Y · Y | Y · — | — |
| United Kingdom | Y · Y | Y · Y | Y · Y | Y · Y | Mollie API-to-app (H), Viva (H), myPOS Glass (Android H), Revolut iPhone SDK (S†), Dojo iPhone SDK |
| Ireland | Y · Y | Y · Y | — (own app) | Y · Y | Mollie, Viva, Revolut |
| France, Germany, Italy, Netherlands, Belgium, Austria, Portugal | Y · Y | Y · Y | — (FR own app) | Y · Y | Mollie, Viva, Revolut, myPOS; Worldline/Nexi (gated) |
| Spain | Y · P | Y · Y | — (own app) | Y · Y | Mollie, Viva, Revolut |
| Poland, Czechia | Y · Y / Y · P | Y · Y | — | Y · Y | Viva, Mollie |
| Sweden, Denmark, Finland | Y · Y | Y · Y | — | Y · Y | Mollie, Viva |
| Norway | P · Y | Y · Y | — | Y · Y | Viva |
| Switzerland | Y · Y | Y · Y | — | Y · Y | Mollie, Worldline |
| Greece | — · — | — · Y (I: "Europe") | — | — · — | Viva (H) |
| Australia | Y · Y | Y · Y | Y · Y | Y · Y | Tyro (gated SDK; Android app H), Windcave iPhone SDK |
| New Zealand | Y · Y | — · — | — | Y · Y | Windcave iPhone SDK |
| Japan | P · — | — | — (own app) | Y · — | — |
| Singapore, Hong Kong, Malaysia | Y·Y / P·P / P·Y | — | — | Y · Y (MY: — · Y) | — |
| Mexico | P · P | — · — | — | Y · Y | Mercado Pago (U) |
| Brazil | — · — | U · Y | — | — | Mercado Pago, Cielo, Stone (own apps; U) |
| Chile | — · — | Y · Y | — | — | — |
| Colombia, Peru | — · — | U · Y | — | — | — |
| Argentina | — | — | — | — | Mercado Pago own app only (U) |
| South Africa | — | — | — | — | Yoco own app only; its SDK is partner-gated and for card machines (S) |
| India, Nigeria, Kenya | — | — | — | — | None found. Apple's list has no India or Nigeria (S, absence) |

**What the counts say** (Observed, by parsing [Apple's list](https://developer.apple.com/tap-to-pay/regions/)):

| Set of SDKs | Countries with Tap to Pay on iPhone |
|---|---|
| Stripe | 38 |
| Stripe + SumUp | 42 |
| Stripe + SumUp + Adyen | 46 |
| + Square | 46 (no change) |

- **Stripe only (no SumUp):** US, Canada, Japan, Liechtenstein, Malaysia, New Zealand, Puerto Rico, Singapore.
- **SumUp only (no Stripe):** Brazil, Chile, Colombia, Peru.
- **Not covered by any of the four:** Argentina, Costa Rica, Dominican Republic, Faroe Islands, Greece, Greenland, Guatemala, Honduras, Monaco, Panama, South Africa, Taiwan, Ukraine.

Two caveats on these counts:
- Apple's list counts a PSP's **own** app as well as its SDK (I). For example, it shows SumUp in Brazil marked "SDK", while SumUp's developer page omits Brazil for iOS. That conflict is marked U.
- Apple's list is not complete. It omits Stripe in Mexico and Hong Kong, which Stripe lists in preview.

## 2. The platform layer

### Apple: Tap to Pay on iPhone

- **Countries:**
  - 59 countries and regions, each with its supported PSPs; Apple marks some PSPs "(SDK)" (S).
  - India and every African country except South Africa are absent (S, absence).
- **Devices:** `isSupported` is true only on "iPhone XS or newer" (S). Apple says only "the latest version of iOS". Stripe states **PIN entry needs iOS 16.4+** and that betas don't work (S). PSP floors: Mollie 16, Square, Dojo and Viva 16.7, Windcave 17, Adyen **18.4**, Tyro **18.6** (S).
- **iPad:** "Not supported in iPadOS, macOS, tvOS, visionOS, or watchOS" (S, HIG).
- **Entitlement** (`com.apple.developer.proximity-reader.payment.acceptance`):
  - Requested from an "organization-level Apple Developer account", logged in "as the Account Holder". "Apple reviews each application using predefined criteria" (S).
  - The first grant is development-only. "TestFlight beta testing and App Store submissions require an entitlement that allows distribution", requested by replying to the original email (S).
  - Each bundle ID "would need to request their own production verification process" (Apple DTS, [forum 795780](https://developer.apple.com/forums/thread/795780), S).
  - Turnaround: Apple states none. Adyen says LIVE "can take up to several weeks" (S). One developer reports 1.5 months stuck in development (U, user post).
- **Several PSPs in one app:** the entitlement is a boolean. The token that sets up the reader is a JWT "from your payment service provider that includes the merchant's unique identifier", and terms are accepted "once for a given merchant identifier" (S). So the API is PSP-neutral at runtime (I). Whether Apple's review or production verification is tied to a named PSP is addressed by no Apple page, forum answer or PSP doc (U).
- **Terms flow (HIG):** terms are accepted "before you perform the initial device configuration", and shown "only to an administrative user". An admin may accept "through a web interface or a different app" (S). Stripe's Terminal onboarding links are that web route (S).
- **Merchant education:** a tutorial covering each payment type, card placement and PIN entry, including accessibility mode. Apple provides `ProximityReaderDiscovery` for it (S). Stripe: "Apple requires you to present a 'How to Tap' instructional overlay… before submitting your app for review" (S).
- **Checkout rules (HIG):** these are listed in §4. The one with the widest effect: "prepare the feature as soon as your app starts and immediately after each transition to the foreground". First-time configuration "can take up to two minutes" (S).
- **Marketing:** only Apple's toolkit assets, and never "Tap to Pay" alone. "Submit all PR announcements that mention Tap to Pay on iPhone, including press releases, blog posts… to Apple for review and approval before publishing. Reviews can take several weeks" (S).
- **Offline:** ProximityReader has Store-and-Forward types, but use depends on the PSP. Stripe's offline Tap to Pay is an iPhone-only private preview (SDK-or-cloud note).
- **Card limits:** the no-PIN limit is £100 in the UK, €50 in the euro area, C$250 in Canada, A$100–200 in Australia and NZ$200 in New Zealand. Many Canadian and Finnish cards need an offline PIN, which Tap to Pay cannot take (Stripe, S).

### Android

- **No public Google API** for accepting card payments was found. Google's payment APIs are for paying, not accepting (U, absence; consistent with #114). Each PSP builds its own kernel and attestation.
- **Device floors** differ by PSP (S):

  | PSP | Android floor | Other conditions |
  |---|---|---|
  | Stripe | 13+ | GMS with the Play Store installed; integrated NFC; ARM; patch under 12 months; unrooted with a locked bootloader; unmodified OS; hardware keystore ≥ 100; developer options **disabled** |
  | SumUp | 11+ | SDK minSdk 30 |
  | Adyen | 12+ | Google-certified; hardware key attestation; integrated NFC ("detachable NFC modules are not compliant with… MPoC") |
  | Square | 9+ | Phones only |
  | Mollie (app) | 11+ | Patch under 12 months; GMS. Huawei and Honor are excluded |

- **PIN entry on Android:** Stripe can collect a PIN only when developer options are off, no accessibility service runs, nothing records the screen, and no overlay window is open (`TAP_TO_PAY_INSECURE_ENVIRONMENT`). The PIN pad also appears at a random position (S).
- **Google Play:** no Play policy specific to Tap to Pay was found (U, absence).

### Card schemes and PCI

- Apple: Tap to Pay on iPhone "follows the PCI CPoC Standard", and "the PSP is responsible for all the necessary certifications" (S).
- PCI MPoC is "for entities developing, deploying, or managing solutions"; which entities must validate is for "the payment brands" to say (S). Mastercard's Tap on Phone programme addresses acquirers and MPoC vendors (survey, S†).
- Our app only forwards the PSP's encrypted payload, "valid for only 60 seconds" (S). So the obligation falls on the PSP, not WCPOS (I).

## 3. Per provider

### Stripe

- **Tap to Pay on iPhone:**
  - Generally available: AT AU BE CA CH CZ DE DK ES FI FR GB IE IT LU NL NZ PL PT SE SG US.
  - Public preview: BG CY EE HK HR HU JP LI LT LV MT MX MY NO RO SI SK.
  - In the iOS **and React Native** SDKs. PIN on iOS 16.4+ (S).
- **Tap to Pay on Android:**
  - Generally available: AT AU BE CA CH DE DK FI FR GB IE IT MY NL NO NZ PL PT SE SG US.
  - Public preview: BG CY CZ EE ES GI HK HR HU LI LT LU LV MT MX RO SI SK (S).
- **Pricing.** Card-present rates apply plus a per-authorisation Tap to Pay fee (S):

  | Country | In-person rate | Tap to Pay fee | Online rate |
  |---|---|---|---|
  | UK | 1.4% + 10p (EEA cards) | + £0.10 | 1.5% + 20p |
  | Euro page (served by geolocation, ES) | 1.4% + €0.10 | + €0.10 | 1.5% + €0.25 |
  | AU | 1.65% + A$0.10 | + A$0.15 | NE |
  | CA | 2.7% + C$0.05 | + C$0.15 | NE |
  | NZ | 2.6% + NZ$0.05 | + NZ$0.15 | NE |
  | US | 2.7% + 5¢ (S†) | + 10¢ (S†) | NE |

- **Onboarding:** no reader to register; pass a Location ID at connect. The merchant links an Apple ID and accepts Apple's terms once per Stripe account, in the app or on the web. Platforms are bound by Stripe's "Apple acceptance platform" terms (S).
- **What it demands of our app:**
  - The entitlement, which Stripe's Expo plugin does not add (#114).
  - On Android, Tap to Pay runs in a **separate process** with a second `Application` instance. `MainApplication.onCreate` must return early when `TapToPay.isInTapToPayProcess()` (S).
- **Testing:** the sandbox has "simulated Tap to Pay readers" (S). On Android, "emulators aren't supported… The same device requirements are enforced in the simulated and production reader" (S).

**Verdict.** This is the backbone, and it is already ruled in (#235). It has the most countries, both platforms, one React Native package, a simulated reader and a published per-tap price. The one open commercial question is whether merchants on **WooPayments** (Stripe under WooCommerce's platform account) can use a third-party Terminal integration. That was not evaluated here (NE).

### SumUp

- **Tap to Pay on iPhone:**
  - Built into the iOS SDK we already ship (#236) (S).
  - Countries: AU, AT, BE, BG, CL, HR, CY, CZ, DK, EE, FI, FR, DE, HU, IE, IT, LV, LT, LU, MT, NL, NO, PL, PT, RO, SK, SI, ES, SE, CH, UK (S).
  - Apple also lists SumUp, marked "SDK", in BR, CO and PE (U: conflict).
- **Tap to Pay on Android:**
  - A **separate SDK** (S).
  - Countries: "Europe, Australia, Brazil, Chile, Colombia, Peru, United States" (S).
  - Requirements: Android 11+, NFC; Kotlin 2.0+ (2.2.x for 1.1.6+), minSdk 30, compileSdk 36, core-library desugaring (S).
  - Access: "credentials to access and use the SDK is restricted pending review and must be requested via our Integration team", and the Maven repository needs credentials (S).
  - "The SDK is not debuggable", and attestation disables payments on debug-mode or rooted devices (S).
- **Pricing (UK):** 1.69% pay-as-you-go, the same for Tap to Pay as for readers. Payments Plus is 0.99% from £16/month on one SumUp page and £19/month on another (S).
- **What it demands:**
  - The SDK provides most of Apple's checklist: terms sheet, device and OS checks, progress and outcome screens, and merchant education. From 7.2.0 it uses `ProximityReaderDiscovery` on iOS 26+ (S).
  - We build the fallback payment and receipts, and use `tapToPayProductName` rather than a hard-coded string (S).
  - Only the main account can activate; employee sub-accounts can't. A device passcode is required (S).
- **Testing:** "compiled out for the Simulator and can never work there". Use a SumUp sandbox merchant with a **non-sandbox** Apple ID. On Android, a sandbox account from SDK 1.1.0, and no emulators (S).

**Verdict.** Second, and partly free. iPhone Tap to Pay comes with the SDK we already built. Android needs the separate, review-gated SDK, so apply for those credentials early. It is the only SDK route to Tap to Pay in Chile, Colombia and Peru, and on Android in Brazil.

### Square

- **Tap to Pay:**
  - The Mobile Payments SDK is limited to accounts in the US, Canada, the UK and Australia (S).
  - iPhone XS+, iOS 16.7+, with an iOS **deployment target of 17.1+** for the SDK (S). That is up from 16 in #114.
  - Android 9+, phones only. No other Square Reader may be paired at the time (S).
  - No offline Tap to Pay (S).
  - Square's own app also offers it in IE, FR, ES and JP (Apple list, S). The SDK does not.
- **Pricing:** US "2.6% + 15¢ per tap"; UK "from 1.75% per tap" (S). Whether that differs from Square's reader rate: NE.
- **What it demands:**
  - Our own entitlement; the merchant links an Apple ID with `linkAppleAccount()` (S).
  - The SDK's measured costs: 96 MB, launch-time init, microphone and phone-state permissions (loading note).
  - Testing: **MockReaderUI** simulates "a swiped, inserted, or tapped card" in the sandbox (S). Whether it simulates Tap to Pay itself: U.

**Verdict.** Square adds no Tap to Pay country over Stripe. The **POS API handoff** already reaches Square Tap to Pay with no native code (SDK-or-cloud note). Tap to Pay therefore does not strengthen the case for the Square SDK (ruling 1).

### Adyen

- **Tap to Pay on iPhone:** AU, CA, 27 European countries (not Greece), JP, HK, MX, NZ, SG, UAE, UK and US. Needs iOS 18.4+ (S).
- **Tap to Pay on Android:** the same, minus CA and JP, plus MY. Needs Android 12+ (S).
- **Payments app:** a no-SDK handoff, on Android only (S).
- **Testing:** separate TEST and LIVE entitlements, with LIVE taking "up to several weeks". Testing needs a sandbox Apple Account, a physical Adyen test card, and Support enabling the test account (S).
- **Pricing:** "$0.13 + a fee determined by the payment method", Interchange++, and a minimum invoice "depending on industry" (S). No Tap to Pay-specific fee was published (NE).

**Verdict.** It adds only UAE and a few Asian markets over Stripe and SumUp. Adyen's merchant base and minimums don't fit market stalls (I). Add it on demand, with the Android Payments-app handoff first.

### Zettle (PayPal)

Zettle's integration table marks the **SDK** as supporting "TTP" (S), and the iOS SDK binary carries strings such as "Tap to Pay is activated" (Observed, `iZettle/sdk-ios`). But no public page documents an API or steps for it, and the changelog is silent (U). PayPal's own app offers Tap to Pay on iPhone in 10 countries (Apple list, S).

**Verdict.** Unproven; ask Zettle before counting it. It covers no country Stripe and SumUp miss.

### Revolut

A Tap to Pay on iPhone SDK was announced on 2026-07-14. It "wraps Apple's ProximityReader framework" (S†). Countries, OS floor, gating and Android are U: the developer pages returned 403. Revolut is on Apple's list in 26 countries (S).

**Verdict.** Watch it. It is UK/EU, where Stripe and SumUp already cover.

### Mollie, Viva, myPOS (handoffs; no native code)

- **Mollie Tap:** "API to app" triggers a payment on the Tap app "like a traditional card terminal". App-to-app is Android only; iPhone uses redirect links (S). The app needs iOS 16+ / Android 11+. Pricing is 1.20% for domestic consumer cards on pay-as-you-go, or €0.10 + 0.85% on Pro at €20/month (S). Mollie appears in 17 Apple countries (S). Whether API-to-app can bring the Tap app forward on the same phone: U.
- **Viva Terminal app:** an iOS URL-scheme handoff with a callback, covering 24 European countries including **Greece** (S). If the PIN screen appears, "the third-party client application… will be 'reset' to its idle screen, losing its current state" (S). So WCPOS must persist the cart (I).
- **myPOS Glass:** an Android app-to-app bridge. Android 10+, and "your app must be reviewed and approved by the myPOS team" (S).

**Verdict.** Each is a small JavaScript driver shipped over the air (loading note). Build them when their merchants ask.

### Gated, narrow or not available

| Provider | Tap to Pay offer | Verdict |
|---|---|---|
| **Dojo** (UK) | iPhone SDK: iOS 16.7, UK only (S). Its Android Tap to Pay is "exclusive to Dojo's Pocket device", not any phone (S). That corrects the survey | No |
| **Windcave** (AU/NZ) | iPhone SDK, iOS 17+; the merchant needs a REST user with Tap to Pay enabled; no Android (S) | No: Stripe covers both countries |
| **Tyro** (AU) | iOS SDK only, iOS 18.6+; Android 12+ via SDK or Tyro's app. Apps "must pass a series of tests"; contact a Partner Manager (S) | Not now |
| **Worldpay** | triPOS Mobile; iPhone needs iOS 18.4 (survey, S†). The page would not render (U) | No |
| **Chase (J.P. Morgan)** | Developer docs list Tap to Pay as "Coming Soon" (S) | No |
| **Nexi** | SoftPOS: iOS SDK; Android "APP2APP" only (S) | Gated handoff |
| **Worldline** | Tap on Mobile: iOS SDK; Android app-to-app; validation by its ToM integration team (S) | Gated handoff |
| **Teya** | Integrations target Teya terminals (S); no third-party Tap to Pay found (U) | No |
| **Yoco** (ZA) | Tap to Pay on iPhone in its own app; the SDK is for card machines and partner-limited (S) | No |
| **Mercado Pago** (AR/BR/MX) | Tap to Pay in its own app (S). A third-party route was not found (U) | No |
| **Paystack, PhonePe** | No Tap to Pay offer for third-party apps found (U) | No |

## 4. What Tap to Pay demands of the WCPOS app

**Entitlements and accounts** (detail in §2)
- One entitlement on the WCPOS bundle ID, requested by an **organization** account's Account Holder (S). Whether WCPOS's account is organization-level: NE.
- Every bundle ID needs its own production verification (S). So test Tap to Pay only on the production ID plus one development ID (I).

**Screens Apple's HIG requires** (S unless marked):
1. An **enable flow**: terms shown only to an administrator, with a message for non-admins. WCPOS cashier roles must map to "administrator" (I).
2. A **tutorial**: `ProximityReaderDiscovery` on iOS 18+, with a fallback below that; SumUp brings its own.
3. A **"Tap to Pay on iPhone" button** in checkout ("Tap to Pay" if space is short), with the `wave.3.right.circle` symbol and never the Apple logo. It is shown even before activation, with a progress indicator while configuration runs.
4. **The final amount, tips included, fixed before the tap**, then a progress indicator during authorisation.
5. **Result screens**: approval, decline, PIN-required.
6. A **receipt offer** (QR or text) and a **fallback to another tender** (cash, reader, payment link).

This maps onto the chosen keypad tender pane (I).

**Launch behaviour**
- The HIG and Apple's sample prepare the reader at launch and on every foreground (S). Stripe and SumUp both advise the same (S).
- That conflicts with the survey's proposed "start lazily" policy. The fix is to prepare only on devices where the merchant has enabled Tap to Pay (I).

**Attestation (Android)**
- Merchants' phones must be GMS-certified, patched within 12 months, and have developer options off (S).
- Our error copy must cover `ATTESTATION_FAILURE` and `TAP_TO_PAY_INSECURE_ENVIRONMENT`. On the second, the merchant must turn off screen recorders, accessibility services and overlays (S).
- Whether any SDK needs the app installed from Google Play, rather than sideloaded: NE.

**Two processes on Android**
- Stripe's Tap to Pay process creates a second `Application`. SumUp's reader SDK initialises in `Application`. The Expo `MainApplication` must guard both (S for Stripe; I for the interaction).

**Testing without hardware**

| Provider | iOS | Android |
|---|---|---|
| Stripe | Simulated Tap to Pay reader in the sandbox (S); in the iOS Simulator: U | Real compliant phone, developer options off (S) |
| Square | MockReaderUI (S); Tap to Pay coverage: U | MockReaderUI (S) |
| SumUp | Physical iPhone XS+ only; the Simulator is impossible (S) | Real NFC phone; the SDK is not debuggable (S) |
| Adyen | Physical test card and sandbox Apple Account (S) | Physical test card (S) |

**Practical consequence:** Tap to Pay needs a **dedicated test iPhone and a dedicated test Android phone**, plus a physical test card. Developer options must stay off on the Android phone, so it cannot be the debugging phone (I).

**Marketing and docs:** WCPOS blog posts and release notes that announce it go to Apple first (§2).

## 5. Recommendation: SDK set and order for Tap to Pay

1. **Stripe Tap to Pay, iPhone and Android: first.**
   - It is already in the app (#235), with the widest reach and a simulated reader.
   - Request the Apple entitlement **now**: a development grant, then a distribution grant on reply, with weeks of lead time (S).
2. **SumUp Tap to Pay on iPhone: second.**
   - It is in the SDK we already built (#236), so it needs no new native code (I).
   - Apply **now** for the review-gated **Android Tap to Pay SDK** credentials, then add it.
3. **Handoffs over the air, on merchant demand:**
   - Mollie API-to-app (EU/UK);
   - Viva (EU, including Greece);
   - Square POS API (US/CA/UK/AU);
   - myPOS Glass and the Adyen Payments app (Android).
4. **Not for Tap to Pay:**
   - Square SDK, Adyen SDK, Zettle, Dojo, Windcave, Tyro, Worldpay, Chase, Revolut. None adds a WCPOS-weighted country that 1–3 miss.
   - Re-check Revolut and Zettle in six months.
5. **Where there is no in-app Tap to Pay:** India, most of Africa, Argentina, Central America, Taiwan and Ukraine. Merchants there use cash, a cloud terminal or a Bluetooth reader. On Apple's list, Greece is not covered by Stripe or SumUp, but Viva reaches it by handoff.

## 6. Must be verified

**By build**
1. Stripe Tap to Pay in the Expo app on a real iPhone and Android phone: the entitlement added by our config plugin, and the Android `isInTapToPayProcess` guard next to SumUp's init.
2. **Two Tap to Pay SDKs in one binary** (Stripe and SumUp): does each SDK's `PaymentCardReader.prepare` survive the other's, and can a merchant switch provider without relaunching?
3. SumUp's Android Tap to Pay SDK next to Stripe's `stripeterminal-taptopay`: Kotlin, minSdk and compileSdk resolution.
4. Whether Stripe's simulated Tap to Pay reader runs in the iOS Simulator.

**By Apple** (in the entitlement request, or through DTS)
1. Can one entitlement serve Stripe, SumUp and later others? Does adding a PSP need a new production verification?
2. Grant turnaround, and whether review is per PSP flow.

**By the PSP**
1. **SumUp:** access to the Android Tap to Pay SDK; iPhone Tap to Pay in BR, CO and PE; whether SDK merchants pay the app rate.
2. **Stripe:** can WooPayments merchants use a third-party Terminal Tap to Pay integration? Confirm the US per-tap fee (S† only).
3. **Square:** does MockReaderUI simulate Tap to Pay?
4. **Zettle:** is Tap to Pay in the SDK, and how is it exposed?
5. **Revolut:** countries, Android, access.
6. **Mollie:** does API-to-app work with WCPOS and Tap on the same phone?

## Rulings needed from Paul

1. **Order:** Stripe Tap to Pay first, SumUp second, others by handoff only? This drops the Square SDK from the Tap to Pay case.
2. **Who may enable Tap to Pay:** which WCPOS role counts as Apple's "administrator" for accepting the terms? Store owner only, or any manager?
3. **Launch work:** may Tap to Pay prepare at launch and on every return to the foreground on devices where it is enabled? This is a scoped exception to the lazy-start policy.
4. **Marketing:** accept that any WCPOS announcement mentioning Tap to Pay on iPhone goes to Apple for approval first, and uses only Apple's assets?
5. **Credentials:** apply now for the Apple entitlement and for SumUp's Android Tap to Pay SDK, before WCPOS 2.0 design work starts?

## 7. Corrections to earlier notes

- **Dojo:** its "TTP Android SDK" works only on Dojo's own **Pocket** device, not on any phone (survey).
- **Zettle:** "No TTP in SDK" (#114 and the survey) is now **unverified**. Zettle's own table claims it, and the iOS binary carries Tap to Pay strings.
- **Revolut:** it now has a Tap to Pay on iPhone SDK (S†). The survey said it had none.
- **Square:** its iOS deployment target is **17.1+**, not 16 (#114).

## 8. Sources

**Apple**
- [Tap to Pay on iPhone](https://developer.apple.com/tap-to-pay/).
- [Countries and regions, with PSPs](https://developer.apple.com/tap-to-pay/regions/).
- [Marketing guidelines](https://developer.apple.com/tap-to-pay/marketing-guidelines/).
- [How to accept payments](https://developer.apple.com/tap-to-pay/how-to-accept-payments/).
- [HIG: Tap to Pay on iPhone](https://developer.apple.com/design/human-interface-guidelines/tap-to-pay-on-iphone).
- [Setting up the entitlement](https://developer.apple.com/documentation/proximityreader/setting-up-the-entitlement-for-tap-to-pay-on-iphone).
- [Adding support](https://developer.apple.com/documentation/proximityreader/adding-support-for-tap-to-pay-on-iphone-to-your-app).
- [ProximityReader](https://developer.apple.com/documentation/proximityreader).
- [isSupported](https://developer.apple.com/documentation/proximityreader/paymentcardreader/issupported).
- [ProximityReaderDiscovery](https://developer.apple.com/documentation/proximityreader/proximityreaderdiscovery).
- DTS forum answers: [795780](https://developer.apple.com/forums/thread/795780), [794192](https://developer.apple.com/forums/thread/794192); user report [792166](https://developer.apple.com/forums/thread/792166) (U).
- Apple's documentation pages were read through their JSON data endpoints (`/tutorials/data/documentation/...json`).

**PCI**
- [MPoC standard](https://www.pcisecuritystandards.org/standards/mobile-payments-on-cots-mpoc/).

**Stripe**
- Tap to Pay: [iPhone](https://docs.stripe.com/terminal/payments/setup-reader/tap-to-pay?platform=ios), [Android](https://docs.stripe.com/terminal/payments/setup-reader/tap-to-pay?platform=android).
- Connect a reader: [React Native](https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=react-native&reader-type=tap-to-pay), [iOS](https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=tap-to-pay).
- [Testing](https://docs.stripe.com/terminal/references/testing).
- [Contactless limits](https://support.stripe.com/questions/what-are-the-regional-contactless-limits-for-stripe-terminal-transactions).
- Pricing: [GB](https://stripe.com/gb/pricing), [AU](https://stripe.com/au/pricing), [CA](https://stripe.com/ca/pricing), [NZ](https://stripe.com/nz/pricing). The euro and US figures come from [stripe.com/pricing](https://stripe.com/pricing), which redirects by geolocation; US is S†.

**SumUp**
- [Tap to Pay](https://developer.sumup.com/terminal-payments/readers/tap-to-pay).
- [iOS SDK](https://developer.sumup.com/terminal-payments/sdks/ios-sdk), including "Apple's Requirements for Tap to Pay on iPhone".
- [Android Tap-to-Pay SDK](https://developer.sumup.com/terminal-payments/sdks/android-ttp).
- [UK Tap to Pay pricing](https://www.sumup.com/en-gb/tap-to-pay-on-android/) and [UK pricing](https://www.sumup.com/en-gb/pricing/).

**Square**
- [Mobile Payments SDK](https://developer.squareup.com/docs/mobile-payments-sdk) and its [iOS page](https://developer.squareup.com/docs/mobile-payments-sdk/ios).
- Tap to Pay: [iOS](https://developer.squareup.com/docs/mobile-payments-sdk/ios/tap-to-pay), [Android](https://developer.squareup.com/docs/mobile-payments-sdk/android/tap-to-pay).
- Pricing: [US](https://squareup.com/us/en/payments/tap-to-pay), [UK](https://squareup.com/gb/en/payments/tap-to-pay).

**Adyen**
- [Mobile solutions: country table](https://docs.adyen.com/point-of-sale/ipp-mobile/).
- Requirements: [iOS](https://docs.adyen.com/point-of-sale/mobile-ios/requirements/), [Android](https://docs.adyen.com/point-of-sale/mobile-android/requirements/).
- Building Tap to Pay: [iOS](https://docs.adyen.com/point-of-sale/mobile-ios/build/tap-to-pay/), [Android](https://docs.adyen.com/point-of-sale/mobile-android/build/tap-to-pay/).
- [Pricing](https://www.adyen.com/pricing).

**Others**
- Zettle: [integration overview](https://developer.zettle.com/docs/payment-integrations/overview), read from the page data; [sdk-ios](https://github.com/iZettle/sdk-ios), whose localisation files contain Tap to Pay strings.
- Revolut: [Tap to Pay SDK blog](https://developer.revolut.com/blog/2026-07-14-tap-to-pay-sdk) (S†).
- Mollie: [Mobile Solutions](https://docs.mollie.com/docs/mobile-solutions), [Tap to Pay on iPhone pricing](https://www.mollie.com/products/pos-payments/tap-to-pay-on-iphone).
- Viva: [iOS app integration](https://developer.viva.com/apis-for-point-of-sale/card-terminal-apps/ios-app/).
- myPOS: [Glass SDK](https://developers.mypos.com/sdks/glass-sdk).
- Dojo: [Tap to Pay](https://docs.dojo.tech/tap-to-pay), [iPhone](https://docs.dojo.tech/tap-to-pay-on-iphone), [Pocket](https://docs.dojo.tech/tap-to-pay-on-pocket).
- Windcave: [Tap to Pay on iPhone](https://www.windcave.com/developer-attended-tap-to-pay-on-iPhone).
- Tyro: [Tap to Pay](https://docs.connect.tyro.com/docs/in-person-payments/tap-to-pay/overview).
- J.P. Morgan: [in-store payments](https://developer.payments.jpmorgan.com/docs/commerce/in-store-payments).
- Nexi: [SoftPOS integration](https://developer.nexigroup.com/softposmobilepos/en-EU/docs/integration-deep-dive/).
- Worldline: [Tap on Mobile Partner Center](https://docs.smartpos.worldline-solutions.com/Tap-on-Mobile/Partner-Center/).
- Yoco: [in-person getting started](https://developer.yoco.com/in-person/getting-started/).

## 9. Could not source

Everything listed in §6 "by Apple" and "by the PSP", plus:
- Apple's own iOS-version table and its request form, both behind a sign-in at `register-docs.apple.com` and the developer account.
- A Google API or Play policy for Tap to Pay (none found).
- Square's Android Tap to Pay countries, one by one.
- Worldpay's pages (would not render).
- Tap to Pay prices for Adyen, Viva and myPOS. Whether merchants using a third-party SDK integration pay the provider's own-app rate.
