# A frosted scrim on native: research, 2026-10-13

Asked for the Poster tile's scrim. On web, the scrim (`packages/components/src/poster-tile/scrim.tsx`, branch `feat/pos-poster-scrim`) draws `backdrop-filter: blur(6px)` under a mask that follows the same 48 px eased fade as the card-colour tint, then holds a plateau at 92 %. On native, `scrim.native.tsx` draws only the tint, because `SCRIM_BLUR_PX` is "web only until native can mask a blur". The question: can iOS and Android draw the same thing with what the `next` lane already ships, or do they need a new native dependency (which moves the native fingerprint and costs an EAS build)? Desk research plus one local command (the autolinking resolver). No blur was built or filmed on a device.

Labels: **Sourced** (primary page or source file, linked), **Observed** (a command I ran), **Inferred** (reasoned from sourced facts), **Unverified** (absence of evidence, or a secondary source), **Not evaluated**.

## The short answer

- **No new native dependency is needed. Both candidates are already in the app binary.**
  - `@shopify/react-native-skia` 2.11.2 is a direct dependency of `apps/main` on `next` and already draws the health and report charts.
  - `@react-native-masked-view/masked-view` 0.3.2 is a hard `dependency` of `expo-router` (in `expo-router/package.json`, `dependencies`), and Expo autolinks transitive React Native modules by default since [expo#38635](https://github.com/expo/expo/pull/38635) (`expo-modules-autolinking` CHANGELOG). **Observed:** running `expo-modules-autolinking react-native-config` in `apps/main` lists `@react-native-masked-view/masked-view`, `@shopify/react-native-skia` and `react-native-svg` for both iOS and Android. I ran it on `main` (SDK 57). On `next`, the lockfile shows `expo-router@58.0.9` resolving the same 0.3.2, so the same result there is **Inferred**.
- **expo-blur is the wrong tool.** It has no mask or gradient-alpha prop on either platform. On iOS, Apple says a mask on a *superview* of a `UIVisualEffectView` "causes the effect to fail". That rules out MaskedView wrapped around a BlurView.
- **A backdrop blur isn't needed at all.** The scrim sits over the tile's own picture, so "blur what's behind the scrim" means "a blurred copy of the same picture, lined up under the scrim, with its alpha faded". That removes live backdrop sampling, the expensive and fragile part on both platforms. The one difference: anything drawn between the picture and the scrim (a badge, say) wouldn't be blurred. **Inferred.**
- **Try first:** wrap a blurred copy of the picture in `MaskedView`, with the scrim's existing SVG gradient as the mask. Blur the copy with expo-image `blurRadius`, ideally from a small thumbnail source. This uses only dependencies already in the binary, on both platforms. The risk is masked-view on Android under the New Architecture (§4). **If Android misrenders, use Skia there** (`<Mask>` + `<Image><Blur/></Image>`). Skia is the exact equivalent of the CSS, also already linked, and costs one GPU surface per tile.
- **Keep the stakes in proportion.** At `SCRIM_STRENGTH = 0.92`, card colour covers the plateau at 92 %, so the blur shows mostly inside the 48 px fade. A close approximation is good enough. **Inferred.**

## 1. expo-blur `BlurView` (~58.0.1)

- **No mask support.** The prop set is `tint`, `intensity`, `blurReductionFactor`, `blurMethod`, `blurTarget` and View props ([`BlurView.types.ts`](https://github.com/expo/expo/blob/main/packages/expo-blur/src/BlurView.types.ts); [docs](https://docs.expo.dev/versions/v58.0.0/sdk/blur-view/)). The iOS view is a plain `UIVisualEffectView` whose intensity is set by pausing a `UIViewPropertyAnimator` at `fractionComplete` (`ios/BlurEffectView.swift`). There's no mask or gradient handling anywhere in the package source. **Sourced.**
- **iOS masking is ruled out by Apple.** "Masks directly applied to a UIVisualEffectView are forwarded to the internal views… Applying a mask to a superview of a UIVisualEffectView object causes the effect to fail, and an exception is thrown." ([UIVisualEffectView](https://developer.apple.com/documentation/uikit/uivisualeffectview), "Use masks with a visual effect view"). `RNCMaskedView` on iOS sets `self.maskView` on itself (`ios/RNCMaskedView.m`), so it is exactly that superview. **Sourced.** Community reports of it "working" exist; Apple's contract says it doesn't. **Unverified.**
- **iOS opacity hazard.** Apple: "Setting the alpha to less than 1 on the visual effect view or any of its superviews causes many effects to look incorrect or not show up at all" (same page). So fading a tile's opacity in with Reanimated, or a cross-fade, would break the blur mid-animation. **Sourced.** `intensity` itself is animatable with Reanimated (docs). **Sourced.**
- **Android methods.** `experimentalBlurMethod` is deprecated in favour of `blurMethod` (types file):
  - `'none'`, the default: a semi-transparent tint, no blur.
  - `'dimezisBlurView'`: Dimezis [BlurView](https://github.com/Dimezis/BlurView). expo-blur pins `version-3.1.0` in `android/build.gradle`.
  - `'dimezisBlurViewSdk31Plus'`: blurs only on API 31+, `'none'` below.
  - Expo docs: efficient blur needs "the RenderNode Android API, which was introduced in Android SDK 31", and older versions use "the much less efficient RenderScript API" ([docs, Performance](https://docs.expo.dev/versions/v58.0.0/sdk/blur-view/)). **Sourced.**
  - The app's `minSdkVersion` is 26 (`apps/main/app.config.ts` on `next`), so Android 8–11 devices would get a tint only, or the slow path. **Sourced/Inferred.**
- **Android needs a `BlurTargetView`.** Without `blurTarget` the view silently falls back to `NONE` (`ExpoBlurView.kt`, `setBlurMethod`). "The BlurTarget may not contain a BlurView that targets the same BlurTarget" ([BlurView 3.0 notes](https://github.com/Dimezis/BlurView/blob/master/BlurView_3.0.md)). In a grid, that means a `BlurTargetView` around each tile's picture, with the `BlurView` beside it. One target around the whole list doesn't work, because the BlurViews would be inside it. **Sourced/Inferred.**
- **Cost in a list of ~40.** No first-party measurement exists for a scrolling list of BlurViews: Expo's docs and Dimezis's README say nothing about lists. **Unverified.** What the source shows:
  - Every BlurView registers an `OnPreDrawListener` that recomputes its on-screen position each frame.
  - Each BlurView draws a blur `RenderNode` sized to the **whole target** (`blurNode.setPosition(0, 0, target.getWidth(), target.getHeight())`), then clips to its own bounds ([`RenderNodeBlurController.java`](https://github.com/Dimezis/BlurView/blob/master/library/src/main/java/eightbitlab/com/blurview/RenderNodeBlurController.java)).
  - The snapshot itself is "basically zero overhead… recorded on a RenderNode" (3.0 notes).
  - So per-tile targets keep each blur tile-sized: roughly 20 GPU blurs per frame for the visible tiles while scrolling. **Inferred, Not evaluated.**
- **Transforms and clipping.** Dimezis "honors its position and size changes, including view animation and property animation". Translation, `setScaleX` and `setRotation` need nothing extra; only `ViewPropertyAnimator` needs `notifyRotationChanged` (README; 3.0 notes). Reanimated on Fabric sets view properties directly, so it should be covered. **Inferred.** Rounded corners: expo-blur 58.0.0 fixed "BlurView not applying border radius styles to the native blur layer" ([CHANGELOG](https://github.com/expo/expo/blob/main/packages/expo-blur/CHANGELOG.md), #45691); older docs said to use `overflow: 'hidden'`. **Sourced.**
- **Verdict:** not worth it for this scrim. iOS can't be masked, and on Android it would be one target plus one blur per tile, with a tint-only fallback below API 31.

## 2. react-native-svg 15.15.5: `<Filter>` + `<FeGaussianBlur>` + `<Mask>`

- **Both platforms have native implementations.** iOS: `apple/Filters/RNSVGFeGaussianBlur.mm` uses Core Image `CIGaussianBlur`, or `CIMotionBlur` when the X and Y deviations differ. Android: `FeGaussianBlurView.java`. `<Mask>` exists on both (`RNSVGMask.mm`; `RenderableView.render` on Android applies masks with `DST_IN`, in luminance or alpha mode). `<Image>` loads through `RCTImageLoader` on iOS and **Fresco** on Android (`ImageView.java`). So `<Image filter="url(#b)" mask="url(#m)">` with a `<LinearGradient>` inside the mask is expressible on both. **Sourced (package source).**
- **Android cost and quality are poor.**
  - Each filtered element is drawn into a fresh full-canvas `ARGB_8888` bitmap. The blur then creates a new `RenderScript` context, `ScriptIntrinsicBlur` and two `Allocation`s **on every apply**.
  - The radius is clamped: `stdDeviation * 2`, capped at 25, so at most σ ≈ 12.5. The work runs on the CPU, from `onDraw`.
  - RenderScript is deprecated from Android 12. **Sourced** (`FeGaussianBlurView.java`, `RenderableView.java`).
  - Saving grace: `SvgView` caches its output bitmap and redraws only when invalidated (`SvgView.onDraw`, `mBitmap`). A static tile pays once per mount, not per scroll frame. But a recycling list mounts while scrolling. **Inferred.**
- **Second decode.** The SVG `<Image>` doesn't share expo-image's cache (SDWebImage on iOS, Glide on Android). It's a second fetch and decode through RN's own pipeline. **Sourced/Inferred.**
- **`<ForeignObject>` can't mask a native blur.** iOS draws foreign children with `[layer renderInContext:]` (`RNSVGForeignObject.mm`), and Apple says a snapshot of only the effect view "doesn't contain the effect" (UIVisualEffectView page). Android draws them onto the SVG's software bitmap canvas, which pushes Dimezis into its "slow… shouldn't be a common case" software path (`RenderNodeBlurController.draw`). **Sourced/Inferred.**
- **Verdict:** works on both platforms with no new dependency. But on Android it is a CPU blur on mount with a capped radius and a second decode. Use it only as a fallback.

## 3. expo-image `blurRadius`, RN `Image` `blurRadius`, and fading their alpha

- **expo-image** blurs once at decode, not live. The prop's docs: "The radius of the blur in points… This effect is not applied to placeholders" (`src/Image.types.ts`).
  - iOS: `SDImageBlurTransformer(radius: blurRadius / 2)`, with the comment "uses Apple's CIGaussianBlur internally" (`ios/ImageModule.swift`, `ios/ImageView.swift`).
  - Android: Glide `BlurTransformation(min(radius, 25), 4)` from `jp.wasabeef:glide-transformations:4.3.0` (`ExpoImageViewWrapper.kt`). That downsamples ×4, then runs a RenderScript blur, or `FastBlur` on the CPU if RenderScript fails ([source](https://github.com/wasabeef/glide-transformations/blob/main/transformations/src/main/java/jp/wasabeef/glide/transformations/BlurTransformation.java)).
  - **Sourced.** The cost is one extra transformed bitmap per tile, cached by the image library. It's cheap on Android because of the ×4 downsample. **Inferred.**
  - Radii don't match CSS `blur(6px)` one-to-one on either platform (iOS halves the value; Android's radius applies after the ×4 downsample), so tune by eye. **Inferred.**
- **RN core `Image`.** `blurRadius` is "the blur radius of the blur filter added to the image", with "On iOS, you will need to increase `blurRadius` by more than `5`" ([docs](https://reactnative.dev/docs/next/image#blurradius)). Android uses Fresco's `IterativeBoxBlurPostProcessor`, a CPU box blur (`ReactImageView.kt`). **Sourced.** It has no advantage over expo-image here.
- **RN core styles can't do the fade.** `filter: blur()` is "Android only" and "only supported on Android 12+", and it blurs the view itself. There's no `mask-image` or `backdrop-filter` style ([View style props](https://reactnative.dev/docs/next/view-style-props#filter)). **Sourced.** RN does draw `linear-gradient` backgrounds natively (`backgroundImage`; `experimental_backgroundImage` in the 0.86 types), which can serve as a mask element. **Sourced.**
- **Fading the blurred copy's alpha:**
  - **Masked-view (exact).** It's already in the binary (§4). The child is a plain image view, not a `UIVisualEffectView`, so Apple's restriction doesn't apply. **Inferred.**
  - **Stepped bands (approximate).** Use 6–8 horizontal strips across the 48 px fade. Each strip is an `overflow: hidden` view holding the blurred image, offset so it lines up, at the opacity of its stop. Then one full-opacity strip covers the plateau. The image cache serves every strip after the first. Opacity on an image view is safe on both platforms. The compromise is a stepped ramp of about 6 px steps instead of a smooth one; under a tint that is itself fading, it is probably invisible. **Inferred, Not evaluated.**
  - **Reanimated** adds nothing: it animates values and has no masking primitive. **Inferred.**
  - **SVG `<Mask>` over `<ForeignObject>`** is a dead end (§2).
- **Verdict:** expo-image `blurRadius` is the right blur source on both platforms: decode-time, cached, and already used by the tile. Masked-view is the clean way to fade it; stepped bands work if masked-view fails.

## 4. `@react-native-masked-view/masked-view` 0.3.2

- **Expo-compatible and already shipped.**
  - SDK 58's `bundledNativeModules.json` pins `"@react-native-masked-view/masked-view": "0.3.2"` ([sdk-58](https://github.com/expo/expo/blob/sdk-58/packages/expo/bundledNativeModules.json)).
  - expo-router depends on it, and only uses it when the native view is registered (`build/react-navigation/elements/MaskedViewNative.js`: `UIManager.getViewManagerConfig('RNCMaskedView') != null`).
  - Autolinking already compiles it in (Observed, above). **Sourced/Observed.**
  - Making it a direct `apps/main` dependency at the same 0.3.2 should not move the fingerprint. `@expo/fingerprint` hashes the `react-native-config` autolinking output and `package.json` `scripts`, not the dependency list (`@expo/fingerprint/build/sourcer/Bare.js`). **Inferred**: confirm with `npx @expo/fingerprint` before and after.
- **Maintenance is thin.** Last release v0.3.2 on 2024-11-04; last push 2025-10-06; 68 open issues. Fabric support was merged and reverted the same day (2024-04-01, #221/#222), so it runs through React Native's legacy view-manager interop layer. Android fixes sit unmerged: [#250](https://github.com/react-native-masked-view/masked-view/pull/250), [#252](https://github.com/react-native-masked-view/masked-view/pull/252), [#253](https://github.com/react-native-masked-view/masked-view/pull/253). (GitHub API, 2026-10-13.) **Sourced.**
- **How Android draws it.** `dispatchDraw` draws the children, then draws a bitmap of the mask child with `PorterDuff.DST_IN`, after `setLayerType(LAYER_TYPE_HARDWARE)`. The mask bitmap is re-snapshotted in software (`view.draw(canvas)`) on layout, on attach, and when the mask subtree invalidates (`RNCMaskedView.java`). **Sourced.** Per tile, that is one offscreen layer plus one ARGB mask bitmap the size of the scrim, rebuilt when a recycled cell re-attaches. **Inferred.**
- **Known Android issues.**
  - [#241](https://github.com/react-native-masked-view/masked-view/issues/241) / [#242](https://github.com/react-native-masked-view/masked-view/issues/242) (2025, open): "Android does not render a Mask at all", including on Expo 52, with one report on a Huawei Mate 30.
  - [#235](https://github.com/react-native-masked-view/masked-view/issues/235): a gradient behind a mask fails on Android with the New Architecture. The only workaround offered was turning the New Architecture off, which RN 0.88 can't do.
  - [#233](https://github.com/react-native-masked-view/masked-view/issues/233): black background on RN 0.76, fixed in 0.3.2 by #228.
  - [#251](https://github.com/react-native-masked-view/masked-view/issues/251): the mask flashes during screen removal.
  - No first-party issue covers a gradient mask over expo-blur's `BlurView` specifically. **Unverified.**
  - expo-router uses masked-view only for the iOS header back-title, so the app doesn't currently exercise its Android path. **Inferred.**
- **Verdict:** usable at zero native cost, iOS with confidence, Android only after a device check. Never wrap it around `BlurView` on iOS (§1).

## 5. Skia 2.11.2 (already linked; for completeness)

- **It draws exactly the web scrim.**
  - `<Mask>` takes a drawing as its alpha mask, and a `LinearGradient` paint works inside it ([mask](https://github.com/Shopify/react-native-skia/blob/v2.11.2/apps/docs/docs/mask.md)).
  - `<Blur blur={σ}>` on an `<Image>` is a Gaussian with that sigma ([blur](https://github.com/Shopify/react-native-skia/blob/v2.11.2/apps/docs/docs/image-filters/blur.md)), the same unit as CSS `blur(6px)`. Use `mode="clamp"` so the edges don't darken (the default is `decal`).
  - `<BackdropBlur>` also exists, but it only blurs what is drawn in the same canvas ([backdrop filters](https://github.com/Shopify/react-native-skia/blob/v2.11.2/apps/docs/docs/backdrop-filters.md)). **Sourced.**
- **Costs.**
  - One canvas per tile. On Android, 2.11.2 backs a translucent canvas with a `TextureView` (`SkiaBaseView.java`). The current docs describe TextureView as "an extra texture copy and typically a frame of latency", noting it "can stall during some view animations", while respecting parent clipping, alpha and transforms ([canvas docs, main](https://github.com/Shopify/react-native-skia/blob/main/apps/docs/docs/canvas/canvas.md)). Those docs are for 3.x; 2.11.2 shares the TextureView path. **Sourced/Inferred.**
  - iOS draws into a `CAMetalLayer`. A canvas with no animated values "is drawn once" (same page; 3.x). **Sourced.**
  - `useImage(url)` is a second fetch and decode outside expo-image's cache ([image](https://github.com/Shopify/react-native-skia/blob/v2.11.2/apps/docs/docs/image.md)). A small thumbnail URL makes that cheap. **Inferred.**
- **Verdict:** the exact fallback, Android especially. It's heavier per tile (a GPU surface each) than masked-view plus expo-image.

## 6. What the platforms recommend

- **Apple.** The HIG says to use standard materials (`UIBlurEffect`) "to convey a sense of structure in the content beneath Liquid Glass". For controls over media, Apple uses clear Liquid Glass with "a dark dimming layer of 35% opacity" if the content is bright, and reduce-transparency settings change how materials look ([HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials)). **Sourced.** Nothing discourages a blurred picture under a label. A gradient-masked ("progressive") blur isn't a public UIKit material; it's what Apple's own scroll-edge effects do internally. **Inferred.**
- **Android.** No Material Design 3 page on blur over content turned up. **Unverified (absence).** The platform's own word is AOSP's [Window blurs](https://source.android.com/docs/core/display/window-blurs):
  - "an expensive operation, so it's supported only on selected devices"
  - "Devices with less performant GPUs might choose not to support window blurs"
  - blurs may be turned off "during battery saving mode"
  - apps should "implement two versions for the window background"

  That page is about cross-window blur, not in-window `RenderEffect`. **Sourced.** RN's `filter: blur` is Android 12+ only (§3). So Android itself treats real-time blur as optional on mid-range hardware. A **baked** blur (expo-image at decode) sidesteps this; a per-frame blur doesn't. **Inferred.**

## Recommendation

| Platform | Fidelity | Dependency | Simplest first implementation |
|---|---|---|---|
| **Web** (and Electron) | **Exact** | none | Already built: `backdrop-filter: blur(6px)` + `mask-image` from the same stops (`scrim.tsx`). `backdrop-filter` is "Baseline 2024" ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)); `mask-image` is "Widely available" since December 2023 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)). |
| **iOS** | **Exact in effect.** Compromise: blurs the tile's picture, not other layers under the scrim. | none new: masked-view 0.3.2 via expo-router (declare it directly at 0.3.2 to pin it) | `MaskedView` with `maskElement` = the scrim's existing SVG `LinearGradient` (black, alpha = the stops, then a plateau), wrapping an expo-image of the same source with `blurRadius`, positioned absolute at the tile's full size and bottom-aligned so it registers with the picture. Never `BlurView`. |
| **Android** | **Exact if masked-view renders on device; otherwise Skia (exact, heavier) or stepped bands (approximate: ~6 px opacity steps).** | none new (masked-view, or Skia 2.11.2; both already linked) | The iOS code unchanged. Check on a mid-range API 26–30 phone and the Pixel. If the mask is missing or black (#241/#242/#235), switch Android to `scrim.android.tsx`: a Skia `<Canvas>` with `<Mask mask={<Rect><LinearGradient/></Rect>}><Image fit="cover"><Blur blur={6} mode="clamp"/></Image></Mask>`, fed a small thumbnail via `useImage`. |
| any | not worth it | expo-blur `BlurView` | iOS can't be masked (Apple); Android needs a target per tile and only blurs on API 31+. |

Under every option, feed the blurred copy the smallest WooCommerce thumbnail size. A 6 px blur destroys anything finer, and it cuts the second decode to almost nothing. **Inferred.** Keep the blur static: no Reanimated on it. It moves with the tile because it is part of the tile.

## Not evaluated

- No device run of any option, and no frame-time numbers for 40 tiles. The masked-view Android path is the one unknown that decides between the first choice and Skia.
- Fingerprint invariance when masked-view is promoted to a direct dependency: run `npx @expo/fingerprint` before and after.
- Whether RN 0.88's interop layer still hosts `RNCMaskedView` on Android. expo-router exercises it only on iOS.
