# Loading card-reader SDKs on demand: research, 2026-10-05

Asked by Paul, 2026-10-05: can WCPOS load a provider's native Bluetooth or Tap to Pay SDK only when a merchant needs it, so that every merchant doesn't carry every SDK and a new provider doesn't need a store build? Builds on [roadmap#114](https://github.com/wcpos/roadmap/issues/114) (the SDK landscape, `.claude/research/2026-08-28-card-present-sdks.md` on monorepo branch `research/card-present-sdks`) and may amend [roadmap#115](https://github.com/wcpos/roadmap/issues/115). Desk research only: nothing was built or measured.

Labels: **Sourced** (primary page, linked), **Inferred** (reasoned from sourced facts), **Unverified** (only absence of evidence, or a secondary source), **Not evaluated**.

## The short answer

No. A native SDK can't be side-loaded into the app. The phone only runs native code that was compiled into the app we shipped. iOS enforces this itself, whatever App Review thinks. Expo updates, server components and server functions all deliver JavaScript, never native code. Android has one exception, Play Feature Delivery. It keeps an SDK off phones that don't need it, but the SDK still has to be in the build we upload, so a new provider still needs a store release.

Paul's point still holds: anything that is JavaScript can go over the air. The problem is that no card-reader vendor we looked at publishes its reader's protocol, so a reader driver can't be written in JavaScript. The JavaScript route works for the *other* ways to reach a reader, and those cover most providers:
- the provider's cloud API (SumUp Solo, Adyen terminals);
- handing the sale to the provider's own app (Square, SumUp, Adyen Tap to Pay on Android);
- possibly Apple's own Tap to Pay API.

The realistic plan is a hybrid:
- **Compiled in:** native SDKs for the few providers and readers that have no other route. That is one store build per new native provider, and we already ship builds often.
- **Over the air:** everything else, as JavaScript drivers.

## Policy, as background only

Apple's App Review Guideline 2.5.2 forbids downloading code that "introduces or changes features or functionality" ([guidelines](https://developer.apple.com/app-store/review/guidelines/)). The Developer Program License Agreement §3.3.1(B) says "an Application may not download or install executable code. Interpreted code may be downloaded" if it doesn't change the app's primary purpose ([DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)). Google Play's Device and Network Abuse policy bars downloading "dex, JAR, .so files" from anywhere but Google Play, but exempts code running in an interpreter ([Play policy](https://support.google.com/googleplay/android-developer/answer/9888379)). **Sourced.** So both stores explicitly allow downloaded JavaScript. Nothing below rests on policy.

## 1. Can native SDK code be loaded on demand?

### iOS: not possible (technical)
- Apple's platform security guide says mandatory code signing "helps prevent third-party apps from loading unsigned code resources or using self-modifying code". It also says the system validates the code signature of "all the dynamic libraries that a process links against at launch time", and allows only system libraries or "any library with the same team identifier" ([Apple Platform Security](https://support.apple.com/guide/security/app-code-signing-process-sec7c917bf14/web)). **Sourced.**
- So a vendor framework fetched after install can't be linked or executed. **Inferred** from the above. We did not try it.
- On-Demand Resources and App Clips don't help. Apple's ODR page now returns 404. Guideline 2.5.16(a) says "all App Clip features and functionality must be included in the main app binary" ([guidelines](https://developer.apple.com/app-store/review/guidelines/)). **Sourced.**
- Your expectation (a) holds, on technical grounds.

### Android: possible on one platform, with limits
- **Play Feature Delivery** delivers modules "on demand" from an Android App Bundle and "requires you to publish your app using an app bundle" ([overview](https://developer.android.com/guide/playcore/feature-delivery)). **Sourced.**
- It loads native libraries through `SplitInstallHelper.loadLibrary()` and needs `SplitCompat` in the Application or Activity. If the app wasn't installed by Google Play, deferred installs fail with `APP_NOT_OWNED` ([on-demand](https://developer.android.com/guide/playcore/feature-delivery/on-demand)). **Sourced.**
- A feature module depends on the base module, and the base lists it in `dynamicFeatures` at build time ([dynamic delivery](https://developer.android.com/guide/app-bundle/dynamic-delivery)). **Sourced.** So **a new provider module still means uploading a new bundle, which is a store release.** Play Feature Delivery saves download size per merchant. It does not avoid a store build. **Inferred.**
- **Adyen's sample generalises only in shape.** Adyen's `app-dynamic` puts the whole SDK and the payment Activity inside the feature module, and the base app launches that Activity ([README](https://github.com/Adyen/adyen-pos-mobile-android/tree/main/app-dynamic)). **Sourced.** For another vendor to fit, its SDK must not require startup in the base Application. SumUp Android documents `SumUpState.init(this)` in the Application class (#114). **Sourced** (#114); that this rules SumUp out of a feature module is **Inferred**.
- **Fit with Expo and EAS: no Expo documentation covers dynamic feature modules.** **Unverified** (absence; a search of docs.expo.dev and GitHub found none). React Native autolinking compiles packages into the app module (#114). A vendor in a feature module would therefore need autolinking switched off for it plus a hand-written module created by a config plugin. **Inferred, Not evaluated.**
- **Raw dynamic code loading** (loading a downloaded DEX or `.so`) is technically allowed by the OS. Android 14 requires loaded files to be read-only, "otherwise, the system throws an exception" ([Android 14 changes](https://developer.android.com/about/versions/14/behavior-changes-14)). **Sourced.** Play forbids it (above). Whether a vendor SDK would survive being loaded this way: **Not evaluated.**
- Your expectation (c) is **partly contradicted**. Play Feature Delivery is the only Play-sanctioned native route, but it does not deliver a new provider without a store release, and raw dynamic loading also exists on the OS.

### Expo: where the line is
- **EAS Update** ships "non-native pieces (such as JS, styling, and images)". It can't ship a "change to native code or native dependencies" or a "change to app permissions" ([intro](https://docs.expo.dev/eas-update/introduction/)). **Sourced.**
- If an update calls native code missing from the build, "expo-updates may detect an error and attempt to roll back" ([runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)). **Sourced.**
- **React Server Components and server functions** run on the server and return "an RSC payload" made of serializable data. "You cannot use browser or native APIs in Server Components." Native work needs a `"use client"` component, which is part of the app bundle. Today "EAS Update does not work with Server Components yet" and production deployment is "not recommended yet" ([RSC guide](https://docs.expo.dev/guides/server-components/)). **Sourced.**
- **Config plugins and Expo Modules** run at prebuild and need a native rebuild ([config plugins](https://docs.expo.dev/config-plugins/introduction/)). **Sourced.**
- **Lazy TurboModules**: React Native "lazily creates a Native Module the first time it is accessed" ([lifecycle](https://reactnative.dev/docs/0.80/the-new-architecture/native-modules-lifecycle)). **Sourced.** That saves startup work, not binary size. **Inferred.**
- Your expectation (b) holds.

## 2. Supporting a reader with no vendor SDK in our binary

### 2a. The OTA JavaScript driver: one generic transport compiled in, drivers over the air

The transport already exists. The app on `main` and `next` already ships `react-native-ble-plx` 3.5.1, and `packages/printer` runs JavaScript printer drivers over it. **Sourced** (monorepo `apps/main/package.json`). `expo-updates` is also in both lanes. So a JavaScript driver over BLE could ship by OTA today, **provided a reader protocol to implement exists**. Per provider:

| Provider | Reader protocol documented? | Third-party driver allowed? | What exists instead | Verdict |
|---|---|---|---|---|
| Stripe (M2, WisePad 3) | None found | Bluetooth readers are listed only under the iOS, Android and React Native SDKs. "Server-driven integration doesn't support: Mobile readers" ([designing](https://docs.stripe.com/terminal/designing-integration)) | Smart readers over Wi-Fi via the JavaScript SDK or server-driven | **Not possible.** Sourced (SDK-only); protocol absence Unverified |
| Square (Reader, Stand) | None found | Not addressed | Point of Sale API app switch on iOS, Android and mobile web ([POS API](https://developer.squareup.com/docs/pos-api/what-it-does)) | **Not possible** as a driver. Handoff possible |
| SumUp (Solo, Air) | None found | Not addressed | Cloud API (Solo, Go); Payment Switch (Solo Lite, Solo, Air, 3G, PIN+) ([SumUp](https://developer.sumup.com/terminal-payments/)) | **Not possible** as a driver. Cloud and handoff possible |
| Zettle / PayPal Reader | None found | On iOS the reader is an MFi accessory (`com.izettle.cardreader-one`, #114). "The manufacturer of an MFi accessory decides which third-party apps may communicate with their accessories" ([External Accessory](https://developer.apple.com/documentation/externalaccessory)) | URL scheme "in the process of being deprecated" ([URL-Scheme](https://github.com/iZettle/URL-Scheme)); no cloud payment API found | **Not possible.** Sourced on iOS; Android Unverified |
| Adyen (NYC1) | None found | Not addressed | Terminal API cloud for Adyen terminals; Android Payments app for Tap to Pay via App Links ([Payments app](https://docs.adyen.com/point-of-sale/mobile-android/build/payments-app)) | **Not possible** for NYC1. Tap to Pay handoff possible on Android |

**Certification.** P2PE protects card data "from the point where a merchant accepts the payment card to the secure point of decryption" ([PCI P2PE](https://www.pcisecuritystandards.org/standards/point-to-point-encryption/)). **Sourced.** A driver would only ever move ciphertext, so the barrier is the vendors' closed, account-bound protocols, not a PCI rule against third-party drivers. **Inferred.** No PCI PTS or MPoC text addressing third-party drivers could be fetched: **Unverified.** Tap to Pay on iPhone needs Apple's entitlement whatever the integration ([Tap to Pay](https://developer.apple.com/tap-to-pay/)). **Sourced.**

**The one partial candidate is Tap to Pay on iPhone.** Apple says to "integrate the ProximityReader API and/or your PSP's API" ([Tap to Pay](https://developer.apple.com/tap-to-pay/)). `PaymentCardReader` is set up with a token: "Your payment service provider supplies the string you use to create this token". The app then passes the payment method "to the payment service provider" ([ProximityReader](https://developer.apple.com/documentation/proximityreader/adding-support-for-tap-to-pay-on-iphone-to-your-app)). **Sourced.** So one compiled-in ProximityReader module, with per-PSP token and result handling in OTA JavaScript, is architecturally possible on iPhone. **Inferred.** Whether Stripe, Square, SumUp or Adyen will issue tokens and accept results without their SDK: **Unverified.** Tap to Pay on Android has no public Google API (#114), so it stays SDK-only there.

**Possible for which providers:** none for Bluetooth readers. Tap to Pay on iPhone only if a PSP exposes the raw token API (unverified).

### 2b. Handoff to the provider's app
Possible on iOS and Android:
- Square: POS API, also from mobile web. **Sourced.**
- SumUp: Payment Switch. The SumUp app must be installed and logged in, and an Affiliate Key is needed ([Payment Switch](https://developer.sumup.com/terminal-payments/payment-switch/)). **Sourced.**
- Adyen: Tap to Pay, Android only; "there is no Adyen Payments app for iOS". **Sourced.**
- Zettle: deprecated. **Sourced.**

The cashier leaves WCPOS for each sale, and the reader is paired to the other app. Our driver is an OTA JavaScript URL builder and parser. **Inferred.**

### 2c. Web Bluetooth, WebUSB, WebHID, Web Serial
- **Browser support** (MDN browser-compat-data):
  - Web Bluetooth: Chrome 70 and Chrome Android 56.
  - WebUSB: Chrome 61.
  - WebHID: Chrome 89 desktop.
  - Web Serial: Chrome 89.
  - Safari and iOS have none of them, and Android WebView has none.

  **Sourced** ([BCD](https://github.com/mdn/browser-compat-data/tree/main/api)).
- **Electron** supports all four through `select-bluetooth-device`, `select-hid-device`, `select-serial-port` and `select-usb-device` handlers ([Electron devices](https://www.electronjs.org/docs/latest/tutorial/devices)). **Sourced.**
- The transport exists, but with no published reader protocols (2a) it carries no card reader we know of. **Inferred.**
- Native desktop SDKs for Electron: **Not evaluated.**

### 2d. The provider's cloud route
- **SumUp Solo:** the Cloud API covers it ([SumUp](https://developer.sumup.com/terminal-payments/)). **Sourced.**
- **Adyen terminals:** Terminal API (#114). **Sourced.**
- **Stripe:** has no cloud route for its Bluetooth readers. **Sourced.**

Cloud routes belong to #95: no app code, and every target platform, web included.

## 3. Compiling everything in: what can be sourced
- **Vendors force SDK updates:**
  - Stripe Terminal SDK majors ship "annually" and minors "approximately monthly". End-of-life versions "can't connect to readers", and Tap to Pay "might have additional constraints that require upgrades" earlier ([Stripe versioning](https://docs.stripe.com/terminal/references/sdk-versioning)). **Sourced.**
  - Square supports each Mobile Payments SDK version "for 2 years" ([Square](https://developer.squareup.com/docs/mobile-payments-sdk)). **Sourced.**
- **Google Play's target API rule:** app updates must target API 36 from 31 August 2026, renewed every year ([target SDK](https://developer.android.com/google/play/requirements/target-sdk)). **Sourced.**
- **Known whole-project costs** (from #114, Sourced there):
  - Square: `use_frameworks!` and User Script Sandboxing off.
  - Zettle: the External Accessory background mode, plus a GitHub token at build time.
  - SumUp Android: starts up in the Application class.
  - Toolchain floors that the whole app must meet.

## 4. Build variants as the fallback
- EAS builds variants with different bundle IDs from one codebase through `APP_VARIANT` ([app variants](https://docs.expo.dev/tutorial/eas/multiple-app-variants/)). **Sourced.**
- Each variant is a separate store listing and review, and a separate application signature (Square) and Affiliate Key (SumUp). Those vendor keys are bound to the bundle ID or package name (#114). **Sourced.**
- Whether Apple's Tap to Pay entitlement carries across bundle IDs: **Not evaluated.**
- The server descriptor (#115) could tell a merchant which app to install. **Inferred.** The cost is fragmented support and reviews for every variant. **Inferred.**

## Route comparison

| Route | iOS | Android | Web | Electron | What the cashier loses | What it costs us |
|---|---|---|---|---|---|---|
| Compile everything in, lazy init | Yes | Yes | No | No | Nothing | Binary size and build conflicts (unmeasured); a store build per provider and per forced SDK update |
| Android dynamic feature modules | No | Play installs only | No | No | A one-off download on first use | Hand-built Gradle modules outside Expo's documented path; still a store build per provider |
| Handoff to the provider's app | Square, SumUp | Square, SumUp, Adyen Tap to Pay | Square (mobile web) | No | Leaves WCPOS each sale; second app installed and logged in | Small JavaScript driver, OTA |
| JavaScript driver over BLE/USB | Transport yes, protocols no | Same | Same | Same | n/a | Blocked: no vendor protocol |
| ProximityReader plus PSP token (iPhone Tap to Pay) | Possibly | No | No | No | Nothing | One native module; per-PSP JavaScript over OTA; needs PSP cooperation (unverified) |
| Web device APIs | No | Chrome only | Chromium only | Yes | n/a | Blocked: same as above |
| Provider cloud | Yes | Yes | Yes | Yes | Reader needs Wi-Fi or SIM; a Bluetooth reader can't be used this way | Server adapter only (#95) |
| Multiple app builds | Yes | Yes | n/a | n/a | Has to install the right app | Listings, reviews, vendor keys, and support for each variant |

## The hybrid, and store builds per year
Tiers, in order of preference per provider:
1. Cloud route (#95).
2. Handoff driver (OTA).
3. Compiled-in native SDK, only for readers with neither.

Store builds forced by native SDKs (**Inferred** from §3):
- at least one a year (the Play target API rule and Stripe's yearly major);
- one per new native provider, which can be batched;
- one per vendor security update.

That is perhaps 2–6 a year beyond what we already ship. A store build is not scarce. The 2026-09-15 OTA note counted 7 production submits in three weeks at about $3 and 45 minutes each ([OTA note](2026-09-15-expo-ota-updates-for-mobile.md)). So the cost of the native tier is binary weight and build conflicts, not build count.

## 5. How #235 and #236 map
- Stripe on the React Native SDK (#235) and SumUp's Expo module (#236) stay as compiled-in drivers behind #115's interface. Nothing is redone.
- Their JavaScript halves already ship over the air through `expo-updates`. **Inferred.**
- SumUp also gets an optional Cloud API path for Solo and a Payment Switch path, both as future additions.

## Recommendation
- **Confirm #115's model, narrowed.** Compile in a native SDK only when a provider's reader has no cloud or handoff route, or when the in-app experience is worth it (Stripe Bluetooth, Tap to Pay).
- **Treat cloud and handoff as the default** way to add the long tail, delivered as OTA JavaScript.
- **Don't pursue Play Feature Delivery or app flavours** until a measured size or conflict problem justifies it.
- **Ask Stripe, Adyen and SumUp** whether they support direct ProximityReader token issuance.

## Realistic ceiling
- **Cloud and handoff providers:** unbounded on every platform, at no binary cost. **Inferred.**
- **Native Bluetooth or Tap to Pay SDKs on iOS:** all must sit in one binary. The ceiling is unknown without a build. Two are compiled together today: Stripe and SumUp. The known risk is Square's project-wide Xcode settings. **Not evaluated.**
- **Android:** the same ceiling. Play Feature Delivery could move the size cost off-device for Play installs, but Google warns of "performance issues" at 50 or more installed modules ([overview](https://developer.android.com/guide/playcore/feature-delivery)). **Sourced** (the warning).
- **Web and Electron:** cloud and handoff only.

## Unmeasured follow-ups
1. Build Stripe + SumUp + Square + Zettle + Adyen POS Mobile together on a throwaway branch, and record the Kotlin, AGP and compileSdk pins, `use_frameworks!`, manifest and plist merges, entitlements, and build credentials.
2. Binary size and cold start per SDK, linked but not initialised.
3. Startup effect of SumUp Android's Application-class init and its one-key-per-process binding when other SDKs are present.
4. Store review cost of the combined Bluetooth, location, NFC and External Accessory declarations.
5. A spike to put one vendor SDK in an Expo-prebuilt dynamic feature module.
6. PSP answers on ProximityReader tokens without their SDK.

## Rulings
1. **#115, "one build carrying every shipped SDK": amended (Paul, 2026-10-05).** A native SDK is the last tier after cloud and handoff. Exception: the most popular providers get their native SDK in the app even where another route exists, because the SDK may offer more. Named: Stripe, SumUp, Square, and "maybe a few more… the really big ones". Recorded on [#115](https://github.com/wcpos/roadmap/issues/115).
2. **Handoff to the provider's own app for long-tail providers: accepted** by ruling 1.
3. **Open:** should the native-SDK combination build (follow-up 1) be run before the next native driver lands? Stripe and SumUp build together today; Square is the known risk.
