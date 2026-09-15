# Expo OTA (EAS Update) for the mobile lane — research, 2026-09-15

**Verdict: adopt.** Every 1.10.x patch since 1.10.9 has been JS-only, yet each one that reached
phones cost a store build ($3, ~45 min) plus store review, and more than half of the releases never
reached phones at all. EAS Update turns that leg into a three-minute publish from the release SHA,
with a rollback that is faster than the store. One-time cost: one store build (the binary must embed
`expo-updates`) and one dev-client rebuild. Ongoing cost on the current Starter plan: $0 up to 3,000
monthly active devices.

Prompted by the 1.10.15 train (monorepo#2051 → 1.10.15), where the mobile leg was again a full
`build.yml` submit for a one-line guard fix. Web already has an OTA lane (jsDelivr `@1.10`);
desktop has electron-updater; mobile is the only client without one.

## What we ship today

- `apps/main` has **no `expo-updates`**, no `runtimeVersion`, no `updates.url`, no `channel` on any
  `eas.json` profile. A phone gets new JS only through a store binary.
- Since `v1.10.0` (2026-08-25): **16 app releases, 7 production store submits** (08-25, 09-02, 09-06,
  09-07, 09-09, 09-10, 09-14). Nine releases never reached phones.
- Last change that moved the native fingerprint: the Sentry native SDK (25dac40d1e, 2026-09-08),
  before 1.10.9. Everything from **1.10.9 to 1.10.15 shares one native fingerprint** — seven releases,
  three store builds spent, all publishable as OTA updates against the 1.10.9 binary.
  (`fix(native)` b05c941f78 on 09-09 patches `expo-opfs` JS only; reanimated 4.5.5 on 09-03 was the
  previous real native move.)

## Facts verified in this session

| Fact | Result |
|---|---|
| Does a release-only `package.json` bump move the fingerprint? | **No.** `@expo/fingerprint` 0.20.8 at HEAD (1.10.15) vs the same tree stamped 1.10.99: identical hash `e8e0fa5e…`, 159 sources, version string absent from the hashed `expoConfig` source. |
| Does `expo-updates`' `fingerprint` runtime policy hash the same way? | Yes. `expo-updates/utils/src/createFingerprintAsync.ts` calls `@expo/fingerprint` with defaults, per platform, ignoring `android/**`/`ios/**` in CNG projects. |
| Per-update payload | iOS production export: Hermes bytecode **22.9 MB raw, 9.1 MB gzip**; assets 672 KB (cached across updates). Budget ≈ 9 MB per device per release. |
| Plan limits (expo.dev/pricing, 2026-09-15) | Free: 1,000 MAU, 100 GiB, no overage possible. **Starter ($19, ours): 3,000 MAU, 100 GiB bandwidth, 20 GiB storage; overage $0.005/MAU, $0.10/GiB, $0.05/GiB storage.** Production ($199): 50,000 MAU, 1 TiB. MAU = a unique install that downloads ≥1 update in the billing month. |
| Code signing | Optional; **gated to Production/Enterprise plans**. Skip; transport is TLS to `u.expo.dev`. |
| Dev client / native E2E | `expo-updates` is inert in debug builds (all APIs reject, `Updates.channel` null); the dev client keeps loading from Metro. Installing the module moves the fingerprint, so **one dev-client rebuild** is needed. |
| Store review | Not needed for an update. A new binary is still needed whenever the fingerprint moves. |

Note for a later cleanup: `app.config.ts` freezes `DEV_CLIENT_NATIVE_VERSION` because "version feeds the
EAS fingerprint". The probe above says it does not (current fingerprint strips `version`,
`buildNumber`, `versionCode`). Verify against the `e2e-native.yml` fingerprint invocation before
removing the freeze; it may be a relic of an older `@expo/fingerprint`.

## How it works (the parts that matter to us)

- A build embeds three things: the update URL, a **runtime version**, and a **channel**. An update is
  served only when platform + runtime version + channel all match. Non-matching updates are simply
  not served; the dangerous case is a false match (native changed, runtime string did not), which the
  `fingerprint` policy rules out by construction.
- Channels map to branches (same name by default). `eas update --channel production` publishes to the
  `production` branch; the newest update on the branch is live.
- Default client behaviour: on cold start, check in the background (`fallbackToCacheTimeout: 0`, no
  startup delay), download, apply on the **next** cold start. `useUpdates()` exposes
  `isUpdatePending` for an optional "restart to update" affordance.
- Rollback: `eas update:rollback` republishes a previous update or rolls clients back to the embedded
  bundle. Percentage rollouts exist (`--rollout-percentage`).
- `eas fingerprint:compare --build-id <last production build>` answers "is the working tree still
  compatible with the last store build?" — that is the train's OTA-or-build decision.
- Sentry: OTA bundles need their own source maps. Wrap `metro.config.js` with
  `getSentryExpoConfig` (assigns Debug IDs; must compose with the existing serializer-cache config) and
  upload with `npx @sentry/expo-upload-sourcemaps dist` after each publish. Symbolication matches on
  Debug ID, not release/dist, so the native-release derivation in `sentry-sink.native.ts` stays as is.
  This upload runs in Actions, so `SENTRY_AUTH_TOKEN` also needs to be a repo secret (today it is only
  an EAS env var, because native builds run on EAS).

## Proposed integration

1. **App config** (`apps/main`): `npx expo install expo-updates` (57.0.22, the sdk-57 line; 57.0.19
   fixed "Launch asset not found" on both platforms, 57.0.14 closed a path-traversal in manifests, so
   do not pin older). In `app.config.ts`: `runtimeVersion: { policy: 'fingerprint' }`,
   `updates: { url: 'https://u.expo.dev/eb1b6e66-92d7-47f5-b93f-95bf51287f60', checkAutomatically: 'ON_LOAD', fallbackToCacheTimeout: 0 }`.
   In `eas.json`: `production.channel = "production"`, `adhoc.channel = "adhoc"`; leave `development`
   without a channel.
2. **Workflow** `publish-mobile-update.yml`, a mirror of `publish-web-bundle.yml`: `workflow_dispatch`
   with `monorepo_ref` and `channel`, the same require-green-main gate, setup-monorepo →
   `pnpm run -w build:main` → `eas update --channel <channel> --environment production --message "app v<ver> <sha>" --non-interactive`
   → Sentry source-map upload. `EXPO_PUBLIC_*` values are inlined at publish time, same as a build.
3. **Train change** (roadmap `docs/releases` recipe): after the web-bundle leg, run
   `eas fingerprint:compare --build-id <last production build id>`. Unchanged → dispatch the OTA
   workflow at the merge SHA and record the update group id in the run record. Changed → `build.yml`
   as today (the new binary embeds the JS; no OTA needed for that release). Keep a periodic store build
   anyway (each fingerprint move, or roughly monthly) so new installs start close to current.
4. **One-time**: the `expo-updates` install moves the fingerprint, so the first release after this
   lands is a store build for both platforms and a dev-client rebuild for native E2E (`build=true` is
   Paul's call under the build cap). Phones on binaries older than that never receive updates and
   must take that one store update.
5. **Later, taste decision**: a "restart to update" line in Settings driven by `useUpdates()`; and
   Sentry tags `expo-update-id` / `expo-is-embedded-update` so a crash names the update it ran.

## Open questions for Paul

- **Mobile monthly active devices.** Below 3,000 the Starter plan covers it at $0; at 10,000 it is
  $35/month plus bandwidth (10,000 × 4 releases × 9 MB ≈ 360 GB → ~$26). Read it off App Store Connect
  and the Play console; I cannot.
- Whether the first OTA-capable binary should be 1.10.16 (carrying #2054 as well) or wait for a
  fingerprint-moving change that needs a build anyway.

## Sources

- Expo docs: [introduction](https://docs.expo.dev/eas-update/introduction/), [getting started](https://docs.expo.dev/eas-update/getting-started/), [how it works](https://docs.expo.dev/eas-update/how-it-works/), [runtime versions](https://docs.expo.dev/eas-update/runtime-versions/), [download updates](https://docs.expo.dev/eas-update/download-updates/), [rollouts](https://docs.expo.dev/eas-update/rollouts/), [rollbacks](https://docs.expo.dev/eas-update/rollbacks/), [code signing](https://docs.expo.dev/eas-update/code-signing/), [dev client](https://docs.expo.dev/eas-update/expo-dev-client/), [GitHub Actions](https://docs.expo.dev/eas-update/github-actions/), [estimate bandwidth](https://docs.expo.dev/eas-update/estimate-bandwidth/), [environment variables](https://docs.expo.dev/eas-update/environment-variables/), [FAQ](https://docs.expo.dev/eas-update/faq/), [`expo-updates` API](https://docs.expo.dev/versions/latest/sdk/updates/), [EAS CLI reference](https://docs.expo.dev/eas/cli/), [using Sentry](https://docs.expo.dev/guides/using-sentry/)
- Pricing: [expo.dev/pricing](https://expo.dev/pricing), [usage-based pricing](https://docs.expo.dev/billing/usage-based-pricing/), [plans](https://docs.expo.dev/billing/plans/)
- Sentry: [Expo source maps](https://docs.sentry.io/platforms/react-native/sourcemaps/uploading/expo/)
- Fingerprints: [Expo blog: understanding and comparing fingerprints](https://expo.dev/blog/understanding-and-comparing-fingerprints-in-expo-apps), [`expo-updates` `createFingerprintAsync.ts`](https://github.com/expo/expo/blob/main/packages/expo-updates/utils/src/createFingerprintAsync.ts), [expo-updates sdk-57 changelog](https://github.com/expo/expo/blob/sdk-57/packages/expo-updates/CHANGELOG.md)
- Local evidence: fingerprint probe script and iOS export in the session scratchpad (`fingerprint-version-probe.sh`, `export-size.sh`); build history via `gh run list --workflow build.yml`.
