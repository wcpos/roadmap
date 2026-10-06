# Card-present SDK market survey: which native SDKs to compile in, 2026-10-06

Asked by Paul, 2026-10-06: *"Research the top SDKs. If we are going to build, why not include as many as possible?"* Builds on [roadmap#114](https://github.com/wcpos/roadmap/issues/114) (the ten-provider landscape, `.claude/research/2026-08-28-card-present-sdks.md` on monorepo branch `research/card-present-sdks`, cited below as **#114**) and on [the loading note](2026-10-05-bluetooth-reader-sdk-loading.md) (Paul's 2026-10-05 ruling and the Square combination build, cited as **the loading note**). Desk research only: nothing was built, installed or measured today. Facts already established in #114 are referenced, not repeated.

Labels: **S** Sourced (primary page, repo or registry, linked in §6). **S†** Sourced from the vendor's own page, but the page is a JavaScript app that would not render here, so the text was read from the search engine's copy of it. **I** Inferred. **U** Unverified (absence of evidence, or a non-primary source). **NE** Not evaluated.

## The short answer

> **Corrected later on 2026-10-06:** Zettle does have a cloud route (Reader Connect, driving the PayPal Reader over Wi‑Fi), which [the SDK-or-cloud note](2026-10-06-sdk-vs-cloud-per-provider.md) found. That note reverses the "compile in next" verdict for Zettle below to "cloud first" and re-ranks Square on capability grounds. Read it after this one.

**Realistically two more, not twenty.** On top of Stripe, SumUp and Square, only **Zettle (PayPal)** clearly earns a place in the app, and **Adyen** is a strong second if a merchant asks for it. That makes four or five native SDKs in total.

I checked 40 providers. Three reasons rule most of them out:

1. **They don't offer a phone SDK at all.** The provider wants you to send the sale to its own terminal over the internet. That covers Mollie, Revolut, Teya, Mercado Pago, Paystack, Helcim, Moneris, Pine Labs, PayArc and Vipps. Those routes are better for us anyway: no app build, and they work on web and desktop too.
2. **The provider's own route is a handoff to its app.** Viva, Worldline, Nexi (Android), Tyro (Android) and Paytm all work this way. That is a small JavaScript driver we can ship over the air, not a native SDK.
3. **The SDK is closed to us or the wrong shape.** Some need a sales rep or a partner application first: Clover, Yoco, Tyro, Worldline. PagBank says new integrations are "currently unavailable". Some cover one platform only: Windcave (iPhone), Stone and Razorpay (Android). Some are stale: myPOS iOS, Razorpay's React Native wrapper. Card-reader makers (Verifone, Ingenico, PAX, MagTek, ID TECH, BBPOS) aren't payment providers, so there's nothing to sign a merchant up to.

"Why not include as many as possible?" has a measured answer now. Every SDK we add is a cost carried by **every** merchant, including those who never use it:
- more app size (Square's frameworks alone are 96 MB in the debug build);
- more permission prompts;
- start-up network calls (Square contacts Square at every launch);
- more build-time credentials;
- a vendor's forced-update clock.

## 1. Master table

Woo signal = active installs of the provider's **own** WooCommerce gateway plugin on wordpress.org, read from `api.wordpress.org/plugins/info/1.2` on 2026-10-06 (**S**). Quality: **weak-to-moderate**. It counts *online* gateway installs, rounded down to a bucket. It doesn't count in-person use, and it misses plugins sold off wordpress.org. WCPOS itself shows 5,000 on the same scale.

| Provider | Regions | Third-party phone SDK? | RN / Expo | Readers & Tap to Pay | Build-time costs | Account / approval gates | Cloud or handoff alternative | Woo signal | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| **Stripe Terminal** | US, CA, UK, IE, AU, NZ, SG, JP, MY, most of EU (S) | Yes (S) | Official RN SDK, still `0.0.1-beta.33` (S); ships a config plugin (#114) | M2 (US), WisePad 3; TTP iPhone + Android (S) | iOS 15.1 / API 26; BT background mode; no build credential (#114) | Apple TTP entitlement only (#114) | Smart readers via server-driven API; **not** Bluetooth readers (S) | `woocommerce-gateway-stripe` 700k; WooPayments 800k (S) | **Compiled in** (ruled) |
| **Square** | US, CA, UK, AU (S) | Yes, Mobile Payments SDK (S) | Official RN plugin 2026.8.1; Expo plugin is a sample, not a package (S, loading note) | Square Reader, Stand; TTP both (#114) | Kotlin/AGP/compileSdk 36 floors; packaging build phase must run last; init at launch; `RECORD_AUDIO`, `READ_PHONE_STATE`; calls home at launch (loading note, Observed) | Application signature per app; one app may serve many sellers (S) | POS API app-switch, incl. mobile web (loading note) | `woocommerce-square` 80k (S) | **Compiled in** (ruled) |
| **SumUp** | UK/EU, US, LatAm (U) | Yes (S) | None official; WCPOS's own Expo module (#236) | Solo, Air, 3G, PIN+; TTP iPhone in SDK, Android separate package (#114) | Android init in Application class; AGP 9.2.1 / Kotlin 2.4 floors; location string mandatory (#114). iOS SDK 7.2.0 tagged 2026-10-05 (S) | Affiliate Key per bundle ID (#114) | Cloud API (Solo); Payment Switch handoff (loading note) | 10k (S) | **Compiled in** (ruled) |
| **Zettle / PayPal** | Card payments: US, UK, SE, BR, NO, DK, FI, DE, MX, NL, FR, ES, IT (S†) | Yes; self-service developer portal (S†) | None (#114) | PayPal/Zettle Reader; **no TTP in SDK** (#114) | External Accessory background mode + MFi protocol in `Info.plist`; `PPRiskMagnes` dependency; `ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES`; Android artifacts on GitHub Packages, **PAT at build time** (#114, S) | Client ID per app (#114); MFi accessory maker decides which apps may talk to it (loading note) → PayPal must allow our app (I); multi-merchant terms (U) | **None**: URL scheme deprecated, no cloud payment API found (loading note) | `woocommerce-paypal-payments` 800k (PayPal online, not Zettle); `zettle-pos-integration` 4k (Zettle's own Woo sync) (S) | **Compile in: next candidate** |
| **Adyen** | TTP/reader: US, UK, EU (not GR), CA (iPhone), AU, NZ, MX, SG, HK, MY, AE, JP (iPhone) (S) | Yes, POS Mobile SDK; iOS 3.21.0 (2026-09-25), Android 2.20.0 (S) | None for card-present; `@adyen/react-native` 2.12.0 is online only (S) | NYC1 reader; TTP iPhone (iOS 18.4+) + Android (#114) | Android artifacts behind Adyen-issued Artifactory key; manual-init and Play Feature Delivery samples (#114) | Adyen merchant account; TTP back-office enablement (#114) | **Terminal API cloud** for Adyen terminals; Android Payments-app handoff (#114) | Not on wordpress.org (NE) | **Cloud first; compile in on demand** |
| Mollie | EU/UK (U) | No (#114) | n/a | Mollie Terminal (cloud) | none | merchant account | Terminals API (cloud) | 100k (S) | Cloud |
| Clover (Fiserv) | US (S) | Yes, Clover Go SDK (S) | None found (npm, S) | Clover Go reader, legacy RP450; no TTP documented (S) | iOS 14+ via CocoaPods; Android Maven Central, **targetSdk 26–35 only** (S), below Play's API 36 rule (loading note) → conflict (I) | "Acquire API Keys from your Developer Relations Representative"; OAuth app (S) | NE (Clover devices have REST/Remote Pay; not checked) | 2k (S) | Not now: rep-gated, US-only, target-API clash |
| myPOS | EEA, UK (U) | Yes (S) | None (npm, S) | myPOS Go2 (BT module), Combo over BT/USB (S) | Android `com.mypos:slavesdk` on Maven Central, repo active 2026-06 (S); **iOS SDK is a hand-added ObjC framework, README cites iOS 6 / Xcode 7, last push 2025-03** (S) | merchant account + "requested access" (S) | NE | 4k (S) | Not now: iOS SDK stale |
| Viva.com | EU (S) | **No** embeddable SDK found; app-to-app only (S†) | n/a | Viva Terminal app (TTP iPhone in many EU countries) (S†) | none | merchant account | **Handoff**: Android intents, iOS URL scheme (S†) | 6k (S) | Handoff |
| Dojo | UK (S) | Yes: TTP iPhone SDK (SPM, iOS 16.7, Xcode 15.3) and TTP Android SDK (S) | None | TTP only; Dojo terminals via cloud (S) | Apple entitlement; short-lived activation secret (S) | NE beyond Apple (S) | Pay at Counter terminals API (S) | 800 (S) | Cloud (terminals); TTP SDK not worth it yet |
| Teya | UK/EU (U) | No phone SDK; POSLink cloud + on-terminal Android SDK (S) | n/a | Teya terminals | none | partner/business accounts (S) | POSLink (cloud) | 400–1k (third-party/Borgun plugins) (S) | Cloud |
| Revolut | UK/EU (U) | No SDK; server-to-server push to Revolut Terminal (S†) | n/a | Revolut Terminal (push); Reader only in Revolut's own POS (S†) | none | merchant API key | Push Payments API (cloud) | 7k (S) | Cloud |
| Tyro | AU (U) | Yes: TTP SDK iOS (min **iOS 18.6**) + Android 12+ (S) | NE | TTP only (S) | NE | "contact your Partner Manager" for certification (S) | Android Tap to Pay app handoff (S) | not on wp.org (S) | Not now: partner-certified, AU-only |
| Windcave | AU, NZ (S) | TTP iPhone SDK only (SPM, iOS 17, 1.3.0 2026-03-30) (S) | NE | TTP iPhone; terminals via HIT (S) | Apple entitlement (S) | Windcave REST user with TTP enabled (S) | HIT cloud for terminals (S) | not found (S) | Cloud |
| Nexi | IT, wider EU (U) | iOS SoftPOS SDK only; Android via App2App (S†) | NE | SoftPOS / MobilePOS (S†) | NE | NE | App2App handoff (S†) | 7k (`cartasi-x-pay`) (S) | Handoff |
| Worldline | EU (U) | iOS SDK (1.7, 2025-08); Android app-to-app only (S†) | NE | Tap on Mobile (S†) | NE | validation by ToM_Integration team (S†) | App-to-app (Android) (S†) | 500–1k (S) | Handoff |
| Payplug | FR (U) | PayPlugNexo SDK, Android + iOS guides (S); scope not readable | NE | U | NE | NE | NE | not found (S) | NE (needs a follow-up read) |
| Worldpay | US (U) | triPOS Mobile SDK; TTP iPhone needs iOS 18.4 (S†) | NE | readers U; TTP iPhone (S†) | NE | "submerchants" wording (S†); gate U | NE | no own plugin found (S) | Not now: gating unknown |
| Global Payments / Heartland | US (U) | iOS/Android SDKs exist; card-present via Portico (S) | None | readers U | CocoaPods `Heartland-iOS-SDK`; Android repo idle since 2024-09 (S) | developer registration + certification (S) | NE | 1k (S) | Not worth it |
| Elavon | US/CA/EU (U) | Commerce SDK, iOS ObjC + Android Java (S†) | NE | Ingenico/MagTek readers (S†, Converge Mobile) | NE | NE | NE | 200 (S) | Not worth it |
| J.P. Morgan (Chase) | US, CA (S†) | TTP iPhone SDK; Android "coming soon" (S†) | NE | TTP iPhone | NE | enterprise merchant relationship (U) | NE | not found (S) | Not worth it |
| NMI | US (U) | Device SDKs: VP3350 reader + TTP iPhone/Android (S) | NE | ID TECH VP3350; TTP both (S) | NE | via NMI resellers (U) | Lane/3600 cloud API (S) | NE | NE; worth a look later (one SDK, many ISOs) (I) |
| Moneris | CA (S†) | TTP SDK announced (S†) | NE | Moneris Go terminals; TTP | NE | NE | Moneris Go cloud integration (S) | 900 (third-party) (S) | Cloud |
| Helcim | CA, US (U) | No phone SDK; Payment Hardware API (S†) | n/a | Smart Terminal, Card Reader GEN3 (S†) | none | dev test account via support (S†) | Cloud API (S†) | 800 (S) | Cloud |
| Shift4 | US (U) | None found; on-device SkyTab/A930 apps only (S†) | n/a | n/a | n/a | partner NDA (S†) | NE | 20 (S) | Not possible (U) |
| Nuvei | global (U) | Mobile SDKs are online; card-present SDK unclear (S†) | NE | U | NE | NE | NE | 100 (S) | NE |
| Checkout.com | global | None found (U) | n/a | n/a | n/a | n/a | n/a | 200 (S) | Not possible (U) |
| Authorize.net | US | Deprecated by vendor (#114) | None | Chipper 2X discontinued | n/a | n/a | retail API | 1k (S) | Not worth it |
| PayArc | US | No (#114) | n/a | PAX via cloud | none | ISO boarding | Payarc Connect (cloud) | NE | Cloud |
| Vipps MobilePay | Nordics | No card reader (#114) | n/a | QR only | none | merchant agreement | QR REST | NE | Not applicable |
| Mercado Pago | LatAm (U) | No phone SDK in the Point docs read (S) | n/a | Point Smart 1/2 via Orders API (S) | none | merchant account | Orders API (cloud); deep link into MP app (S) | 100k (S) | Cloud |
| Stone / Pagar.me | BR | Android SDK, Bluetooth pinpads (Gertec MobiPin 10, PAX D180/D200) (S†); iOS none found (U) | Community `react-native-stone-pos` 1.0.1 (S) | pinpads; no TTP found | JitPack (S†) | NE | NE | 4k (S) | Not worth it (Android-only) |
| PagBank (PagSeguro) | BR | PlugPag BT library; **"new integrations are unavailable"** (S) | stale community wrapper (2022) (S) | Mini, Minizinha, Moderninha (S) | n/a | closed (S) | NE | 3k (S) | Not possible |
| Cielo | BR | LIO on-terminal SDK (S); TTP iPhone SDK reported (U) | NE | LIO terminals | n/a | n/a | LIO remote integration (S) | 700 (third-party) (S) | Not worth it |
| Getnet | BR, ES, MX (U) | None found (U) | n/a | n/a | n/a | n/a | NE | 300–400 (third-party) (S) | NE |
| Razorpay POS (Ezetap) | IN | Android SDK; RN wrapper `react-native-ezetap-sdk` 1.2.1, last 2023 (S) | stale | Ezetap devices (U) | NE | "get API keys from the Razorpay PoS team" (S†) | NE | 100k (online) (S) | Not worth it |
| Pine Labs | IN | No phone SDK; App-to-App on its Android terminals, cloud API (S†) | n/a | Plutus terminals | none | NE | Cloud integration (S†) | not found (S) | Cloud |
| Paytm | IN | No phone SDK; App Invoke on Paytm EDC device; third-party apps need a pentest report (S†) | n/a | EDC device | n/a | pentest + merchant letter (S†) | QR (S†) | 3k (S) | Not applicable |
| PhonePe | IN | None found (U) | n/a | n/a | n/a | n/a | NE | 10k (S) | NE |
| Yoco | ZA | Yes, iOS + Android SDK (S) | Community **Expo module** `react-native-yoco` 0.3.5 (2026-03) (S) | Yoco card machines (S) | JFrog Maven repo; data binding; Podfile deployment-target and simulator-arch overrides (S) | "SDK Integration Application form"; partner-limited (S, U for the "limited" wording) | NE | 10k (S) | Not now: partner-gated, one country |
| Paystack | NG, GH, KE, ZA (U) | No phone SDK; push payment requests to Paystack Terminal (S) | n/a (terminal apps are RN, on-device) (S) | Paystack Terminal | none | merchant account | Terminal API (cloud) (S) | 30k (S) | Cloud |
| Verifone / Ingenico / PAX / MagTek / ID TECH / BBPOS | — | Device SDKs (S†) | n/a | reader hardware | n/a | need a processor that holds the keys (S†, MagTek/CardPointe) | via a processor | n/a | Not applicable: hardware, not a provider |
| Apple Tap to Pay / Google / Mastercard Tap on Phone | — | Platform layer (#114) | n/a | TTP | entitlement per app (#114) | PSP required; Google has no public API; Mastercard is a programme for acquirers and MPoC vendors (S) | n/a | n/a | Reached through a PSP SDK |

## 2. The shortlist beyond Stripe, SumUp and Square

Ranked by: does the merchant have **no other route**, how many WooCommerce merchants does it plausibly reach, and how open is the gate.

### 1. Zettle (PayPal): compile in next
- **Why it ranks first:** Zettle has no cloud payment API and a deprecated app-switch (loading note), so the only way to take a Zettle reader payment in WCPOS is to compile the SDK in. PayPal is the biggest payments brand in WooCommerce after Stripe (800k installs of PayPal Payments, **S**), and Zettle ships its own WooCommerce stock-sync plugin (4k, **S**), so its merchants already sell through WooCommerce. Card payments cover 13 markets including the US and UK (**S†**). The portal is self-service (**S†**).
- **Conflict risks to check by build:**
  - **iOS `Info.plist`:** the External Accessory background mode and the `com.izettle.cardreader-one` protocol. Apple asks for the accessory maker's approval in App Review for apps that declare an MFi protocol. That approval is PayPal's, not ours (**I**, from the External Accessory doc in the loading note).
  - **iOS build settings:** `ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES`, and the `PPRiskMagnes` dependency (**S**, changelog).
  - **Android:** a GitHub PAT with `read:packages` in EAS secrets, and an `OAuthActivity` in the manifest (#114). Zettle's Kotlin and AGP pins against Square's (2.2.21 / 8.9.1) and SumUp's (2.4.0 / 9.2.1): **NE**.
  - **Start-up:** configuration is documented in `Application.onCreate()` / `didFinishLaunchingWithOptions`, but `start()` can be called separately (#114). Whether it can be deferred entirely: **U**.
  - **Permissions:** location is mandatory ("won't accept payments without these texts", #114), and the app already asks for it for SumUp.
- **Doesn't buy:** Tap to Pay. Zettle keeps Tap to Pay inside its own app (#114).

### 2. Adyen: cloud first, compile in when a merchant asks
- **For:** It has the best-engineered SDK in the survey:
  - manual initialisation;
  - a Play Feature Delivery sample;
  - Tap to Pay on both platforms in a dozen-plus markets;
  - monthly releases (**S**).
- **Against:** Its terminals are already reachable through the Terminal API with no app code (#114). It has no wordpress.org plugin, so the WooCommerce signal is unknown (**NE**). And Tap to Pay on iPhone needs iOS 18.4 (#114).
- **Conflict risks:**
  - an Adyen-issued Artifactory key in EAS (#114);
  - SPM-only iOS distribution next to CocoaPods pods (**I**; distribution format **NE**);
  - a second PSP behind the same Tap to Pay entitlement (see §3).

### 3. Clover Go (Fiserv): watch, don't build
- **For:** It's the US's biggest SMB card-acceptance brand, and the SDK is current: iOS 1.5.0, August 2026 (**S**).
- **Against:** WooCommerce signal is 2k (**S**). It's US-only (**S**). API keys come through a Clover Developer Relations representative (**S**). Its Android docs list target SDK 26–35 (**S**), while Play requires API 36 for updates from 31 August 2026 (loading note). Whether that blocks us or is just stale docs: **U**.
- **Conflict risks:** CocoaPods next to the other three; OAuth redirect handling; the targetSdk ceiling.

### 4. myPOS: Android maybe, iOS no
The Android SDK is current, open and on Maven Central (**S**). The iOS SDK is a manually linked Objective-C framework whose README still cites iOS 6 and Xcode 7, last pushed March 2025 (**S**). A one-platform driver is an odd product for a cross-platform POS (**I**). Re-check when myPOS ships an iOS update.

### 5. Yoco: if WCPOS goes to South Africa
- Yoco is the only candidate with an **existing Expo module**: the community `react-native-yoco`, built on Expo Modules, 0.3.5 (**S**).
- Access is gated by an application form (**S**).
- **Conflict risks:**
  - the JFrog Maven repository;
  - Android data binding enabled app-wide;
  - a Podfile override that forces the simulator to exclude arm64 (**S**). That would also slow the development loop on Apple-silicon Macs (**I**).

**Not shortlisted, though large:**
- **Worldpay, Global Payments, Elavon, J.P. Morgan, NMI:** each is a big acquirer or gateway. But their phone SDKs sit behind partner or enterprise relationships we couldn't read, and their WooCommerce plugins are small or absent (**S** counts; gates **U**).
- **Mollie, Mercado Pago, Razorpay:** big in WooCommerce (100k each, **S**), but Mollie and Mercado Pago are cloud-only for in-person (#114, **S**). Razorpay's POS wrapper is a 2023 Android-only artifact (**S**).

## 3. What grows with every SDK we add

Each line is a cost paid by **every** merchant on every device, whether or not they use that provider.

- **Binary size.**
  - Measured on the simulator debug build (loading note, Observed): Square 96 MB, Stripe 69 MB, SumUp 67 MB of frameworks. The app bundle went from 585 MB to 684 MB when Square was added.
  - Store (App Store thinned / Play split) sizes: **NE**. No vendor in this survey publishes a size figure (**U**, absence).
  - Google warns of performance problems above 50 installed feature modules (loading note). That limit is irrelevant at five SDKs (**I**).
- **Permissions and plist strings shown to every merchant:**
  - Square: microphone (`RECORD_AUDIO`) and phone state (`READ_PHONE_STATE`). The app's own microphone text currently says WCPOS doesn't use the microphone (loading note).
  - Zettle: External Accessory.
  - Every reader SDK: Bluetooth.
  - SumUp and Zettle: location, which they call mandatory.

  The app-store privacy labels have to cover the union of what all SDKs collect (**I**). Square's SDK sends a Bugsnag session at launch (Observed), so crash-reporting data from a third party is now in every merchant's app (**I**).
- **Launch-time work and network calls:**
  - Square must start at process launch on both platforms. It called `api.squareupsandbox.com` and Bugsnag at start-up on a merchant who never chose Square (Observed).
  - SumUp Android starts in the Application class (#114).
  - Zettle documents launch-time configuration (#114).
  - Each additional launch-time SDK adds cold-start cost (**NE**) and another third party contacted by every merchant's phone (**I**).
  - Adyen and Stripe can start lazily (#114).
- **Build-time credentials and private repositories:**
  - Zettle: a GitHub PAT.
  - Adyen: an Artifactory key.
  - Square and Yoco: their own Maven repositories (Observed / **S**).

  Each is a secret or endpoint EAS must reach on every build. If any one of them is down or expires, every build fails, including builds for merchants who don't use that provider (**I**).
- **Config-plugin collisions.** Square's sample plugin overwrote SumUp's edit to `android/build.gradle` (loading note, Observed). The plugins edit shared files, so collisions grow pairwise, roughly n(n−1)/2 pairs to keep working (**I**).
- **Toolchain floors.** The app takes the *highest* minimum and the *lowest* maximum across all SDKs (#114):
  - Kotlin and AGP: SumUp's 2.4.0 / 9.2.1 against Square's 2.2.21 / 8.9.1;
  - iOS minimum: Tyro 18.6, Adyen TTP 18.4;
  - and, if Clover joins, its target-SDK ceiling.
- **Review and entitlements.**
  - **Apple Tap to Pay:** the entitlement is per app, requested by the Account Holder, with a second distribution entitlement before TestFlight (#114). Whether adding a second or third PSP needs Apple to re-review the entitlement: **U**.
  - **MFi accessories (Zettle):** need the maker's sign-off at App Review (**I**).
  - **Per-app vendor keys:** Square's application signature, SumUp's Affiliate Key, Zettle's Client ID and Clover's rep-issued keys are each bound to our bundle ID (#114, **S**). Every build variant multiplies them.
- **Forced updates.**
  - Stripe ships a yearly major, and end-of-life versions "can't connect to readers".
  - Square supports each version for 2 years.
  - Play's target-API rule renews every year (loading note).

  Each SDK is one more clock that can force a store build. Each forced bump can break a pairing above (**I**).

## 4. Recommendation

**Inclusion list and order:**
1. Stripe, SumUp and Square: already ruled.
2. **Zettle**, gated on the build checks below and on PayPal agreeing to our app using its MFi reader.
3. **Adyen** only when a merchant who needs NYC1 or Tap to Pay asks. Until then, Adyen terminals go through the Terminal API cloud adapter (#95).
4. Stop there. Re-examine Clover and myPOS once a year, or when a merchant asks.
5. Every other provider is cloud (#95) or handoff (OTA JavaScript), per the loading note's tiers.

**Policy worth adopting with the list:** a new native SDK must (a) start lazily, or Paul explicitly accepts its launch cost, (b) need no permission the merchant can see beyond Bluetooth, location and NFC, unless ruled otherwise, and (c) fetch without a personal credential, or the credential lives in EAS secrets with an owner. Square already breaks (a) and (b). That's why the question below matters.

## 5. Must be verified by a build

1. **Android build of plain `next`**, then `next` + Square. This is still open from the loading note, and it blocks every Android claim here.
2. **Zettle added to the combination build:**
   - iOS: Podfile with `PPRiskMagnes`; `Info.plist` merge; app starts with Zettle linked but not started.
   - Android: GitHub Packages with a PAT in EAS; manifest merge with Square's permissions; Kotlin/AGP resolution against SumUp's 2.4.0 / 9.2.1.
3. **Store-build size** (thinned iOS `.ipa`, Play `.aab` split) for each SDK, linked but not initialised. **Cold start** with and without Square's launch init.
4. **Network capture at launch** with all SDKs present, to list every third party contacted before a merchant picks a provider.
5. Adyen: whether SPM and CocoaPods coexist in our Expo prebuild, and whether manual initialisation keeps it off the launch path on iOS.
6. If Clover is ever considered: whether its Android SDK runs with targetSdk 36.

## Rulings needed from Paul

1. **Zettle as the fourth native SDK:** approve, subject to the build in §5.2 and PayPal's MFi approval?
2. **Adyen:** native SDK now, or cloud-only until a merchant asks?
3. **What counts as "really big":** WooCommerce reach plus a usable gate (this note's test), or global processor size? The second would bring in Clover, Worldpay and Global Payments, all of which are gated.
4. **Launch-time cost:** may a compiled-in SDK start at app launch and contact its vendor for every merchant (Square does today), or must every SDK start only when its provider is chosen?

## 6. Sources

**Prior notes**
- #114: monorepo `.claude/research/2026-08-28-card-present-sdks.md` (branch `research/card-present-sdks`).
- The loading note: [2026-10-05-bluetooth-reader-sdk-loading.md](2026-10-05-bluetooth-reader-sdk-loading.md).

**Registries**
- wordpress.org plugin API, queried 2026-10-06: `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=<provider> woocommerce`. Slugs as named in the table.
- npm registry (`npm view`), 2026-10-06: `mobile-payments-sdk-react-native` 2026.8.1, `@stripe/stripe-terminal-react-native` 0.0.1-beta.33, `react-native-yoco` 0.3.5, `react-native-ezetap-sdk` 1.2.1, `react-native-stone-pos` 1.0.1, `@adyen/react-native` 2.12.0, `react-native-plugpag` 1.0.3. Not on npm: `react-native-mypos`, `react-native-clover-go`, `react-native-viva-wallet`, `react-native-tyro`, `react-native-dojo`.
- GitHub API (`gh api repos/...`), 2026-10-06: push dates and releases for every repo named below.

**Provider pages**
- **Stripe:** [reader availability](https://docs.stripe.com/terminal/payments/setup-reader) · [RN SDK](https://github.com/stripe/stripe-terminal-react-native)
- **Square:** [Mobile Payments SDK](https://developer.squareup.com/docs/mobile-payments-sdk) (countries, signature, 2-year support)
- **SumUp:** [sumup-ios-sdk](https://github.com/sumup/sumup-ios-sdk) (v7.2.0, 2026-10-05)
- **Zettle:** [sdk-ios](https://github.com/iZettle/sdk-ios) and its [CHANGES](https://github.com/iZettle/sdk-ios/blob/master/CHANGES) · [sdk-android](https://github.com/iZettle/sdk-android) · [developer FAQ](https://developer.zettle.com/docs/faq) (markets, S†)
- **Adyen:** [mobile solutions availability](https://docs.adyen.com/point-of-sale/ipp-mobile/) · [adyen-pos-mobile-ios](https://github.com/Adyen/adyen-pos-mobile-ios) · [adyen-pos-mobile-android](https://github.com/Adyen/adyen-pos-mobile-android)
- **Clover:** [Clover Go SDK](https://docs.clover.com/dev/docs/clover-go-sdk) · [clover-ios-payment-sdk](https://github.com/clover/clover-ios-payment-sdk)
- **myPOS:** [myPOS-SDK-Android](https://github.com/developermypos/myPOS-SDK-Android) · [myPOS-SDK-iOS](https://github.com/developermypos/myPOS-SDK-iOS)
- **Viva:** [card terminal apps](https://developer.viva.com/apis-for-point-of-sale/card-terminal-apps/) (S†)
- **Dojo:** [Tap to Pay](https://docs.dojo.tech/tap-to-pay) · [Tap to Pay on iPhone SDK](https://docs.dojo.tech/tap-to-pay-on-iphone) · [terminals](https://docs.dojo.tech/payments/accept-payments/in-person-payments/pay-at-counter/terminals)
- **Teya:** [developer docs](https://docs.teya.com/)
- **Revolut:** [Terminal push payments](https://developer.revolut.com/docs/guides/merchant/accept-payments/in-person-payments/terminal/push-payments) (S†)
- **Tyro:** [Tap to Pay overview](https://docs.connect.tyro.com/docs/in-person-payments/tap-to-pay/overview)
- **Windcave:** [windcave-taptopay-sdk-ios](https://github.com/Windcave/windcave-taptopay-sdk-ios) · [developer documentation](https://www.windcave.com/developer-documentation)
- **Nexi:** [SoftPOS integration](https://developer.nexigroup.com/softposmobilepos/en-EU/docs/integration-deep-dive/) (S†) · [SoftposDemo](https://github.com/NexiPayments/SoftposDemo)
- **Worldline:** [Tap on Mobile Partner Center](https://docs.smartpos.worldline-solutions.com/Tap-on-Mobile/Partner-Center/) (S†)
- **Payplug:** [PayPlugNexo](https://docs.payplug.com/payplug-nexo/)
- **Worldpay:** [triPOS Mobile Tap to Pay](https://docs.worldpay.com/apis/tripos/tripos-mobile/sdk-features/tap-to-pay-iphone) (S†)
- **Global Payments / Heartland:** [heartland-ios](https://github.com/hps/heartland-ios) · [globalpayments/android-sdk](https://github.com/globalpayments/android-sdk)
- **Elavon:** [Commerce SDK](https://developer.elavon.com/products/commerce-sdk/v1/overview) (S†)
- **J.P. Morgan:** [in-store payments](https://developer.payments.jpmorgan.com/docs/commerce/in-store-payments) (S†)
- **NMI:** [Device SDKs & APIs](https://docs.nmi.com/docs/device-sdks-apis)
- **Moneris:** [integrated payments](https://www.moneris.com/en/partners/partner-with-moneris/software-platforms/integrated-payments) (S†)
- **Helcim:** [Payment Hardware API](https://devdocs.helcim.com/docs/overview-of-payment-hardware-api) (S†)
- **Shift4:** [SkyTab partner guide](https://s4-myportal.s3.amazonaws.com/downloads/documentation/skytab/partner%20integration%20&%20developer's%20guide%20for%20shift4's%20skytab%20and%20a930%20device%20v1_6c.pdf) (S†)
- **Nuvei:** [mobile payment options](https://developer.nuvei.com/mobile-payment-options) (S†)
- **Mercado Pago:** [Point overview](https://www.mercadopago.com.mx/developers/en/docs/mp-point/overview) · [point-android_integration](https://github.com/mercadopago/point-android_integration)
- **Stone:** [SDK Android pin pad](https://sdkandroid.stone.com.br/page/pin-pad) (S†)
- **PagBank:** [plugpag](https://github.com/pagseguro/plugpag)
- **Cielo:** [SDKs](https://developercielo.github.io/en/tutorial/sdks-cielo)
- **Razorpay:** [razorpay-pos-payment-react-native-sdk](https://github.com/AtifQEzetap/razorpay-pos-payment-react-native-sdk)
- **Pine Labs:** [app integration](https://developer.pinelabs.com/in/instore/app-integration) (S†)
- **Paytm:** [POS via App Invoke](https://www.paytmpayments.com/docs/pos-connection-via-app-invoke/) (S†)
- **Yoco:** [in-person getting started](https://developer.yoco.com/in-person/getting-started/) · [react-native-yoco](https://github.com/tolypash/react-native-yoco)
- **Paystack:** [push payment requests](https://paystack.com/docs/terminal/push-payment-requests/)
- **MagTek:** [CardPointe MagTek guide](https://developer.cardpointe.com/guides/magtek) (S†)
- **Mastercard:** [Tap on Phone implementation guide](https://www.mastercard.com/content/dam/mccom/shared/business/payments/commercial-payments/accept-payments/mobile-point-of-sale/tap-on-phone/pdf/Implementation-Guide-Sept-2025.pdf) (S†)

## 7. Could not source

- **Store-build sizes** for any SDK. No vendor publishes one, and only simulator debug sizes exist (loading note).
- **Multi-merchant terms** for Zettle, SumUp, Clover and myPOS: whether one public app may serve many merchants without per-merchant approval. Square is the only vendor with a fetched statement (#114).
- **Whether PayPal grants MFi accessory access** to a third-party app like WCPOS (**I** that it must; process **U**).
- **Pages that would not render** (S† in the table): Viva, Revolut, Nexi, Worldline, Worldpay, Elavon, Global Payments, J.P. Morgan, Moneris, Helcim, Nuvei, Pine Labs, Paytm, Zettle's FAQ. They are JavaScript apps or returned 403/empty, so the facts come from the search engine's copy of the vendor page.
- **Payplug's** PayPlugNexo scope; **Getnet**, **PhonePe** and **Checkout.com** card-present SDKs (none found); **Cielo's** Tap to Pay SDK (news coverage only).
- **Adyen's and Worldpay's WooCommerce reach.** Neither has a plugin on wordpress.org.
- **Apple's handling of multiple PSPs** under one Tap to Pay entitlement.
