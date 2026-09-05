# Customer display — live testing on dev-next (2026-09-04)

Handoff for the customer display v1 work on the `next` lane. The feature is built and
merged; this session was live-testing it on `dev-next.wcpos.com` (Pro-enabled) and fixing
what surfaced. Five of six symptoms are fixed and merged. One remains **open and not root
-caused**: the pairing button is disabled on a cold load of the settings page.

Ticket: wcpos/roadmap#129 (assigned kilbot) carries running commentary of each finding.

---

## The remaining bug (start here)

On a cold load of `/pos/settings/customer-display` on dev-next (login demo/demo, store "UK
Store", id 578), **"Generate pairing code" stays disabled** with the "The customer display
service is not running on this device" hint — even though everything underneath is healthy.

What is true at the same time as the disabled button:

- The display service **is running**: it lists the display registry successfully and holds a
  live service instance.
- The store record **is** advertising the contract (`display: {contract:1, signaling:
  "/wcpos/v2/display"}`) — confirmed both in the cashier response and the inline props.
- The service start/stop **notifier works**: subscribers fire and the version counter
  increments.
- The settings component **is subscribed** to that notifier.
- **Navigating away and back** (client-side, no reload) enables the button correctly and
  refreshes the registry.

So the state is correct; the settings screen's **first mount never reflects the service that
starts about a second after it renders**. Rough timing: the page renders (disabled) at ~+2s,
the service starts at ~+3s, and the screen does not re-render to pick up the now-non-null
service.

### Where the logic lives

`packages/core/src/screens/main/settings/customer-display/index.tsx`, component
`AdvertisedSettings`:

- `React.useSyncExternalStore(subscribe, getVersion, getVersion)` on the start-notifier.
- `const service = getCustomerDisplayService()` — read once per render.
- `const store = React.useMemo(() => createServiceStore(service), [service])` — the state
  store closes over `service`.
- The button is `disabled={!service}` (passed to `PairingCode`).

The whole screen hinges on the version subscription forcing a re-render of
`AdvertisedSettings` when the service starts, so that `getCustomerDisplayService()` is re-read
and `createServiceStore` is rebuilt with a non-null service. That re-render is what is not
happening on first mount, despite the subscriber demonstrably firing.

### Hypotheses (not yet confirmed)

1. **Screen freezing / detaching.** expo-router + react-native-screens may freeze or detach
   the settings screen around the moment the notify fires, so the subscriber that fires
   belongs to a detached tree and drives no visible re-render. Check the drawer/stack config
   for `freezeOnBlur`, `detachInactiveScreens`, react-freeze, or an Offscreen/Activity
   boundary wrapping the settings pages. The app is React 19.2.3 / expo-router ~57 /
   react-native-screens ~4.26 / react-native-web ~0.21.
2. **Snapshot/subscription timing on mount.** The screen mounts and reads version=0 before
   the service starts; the service starts and bumps version to 1 and fires the listener; but
   the re-render does not land. `useSyncExternalStore`'s mount-time "did the snapshot change
   between render and subscribe" guard should cover this, so if it is not, something about
   the subscribe callback identity or the screen's lifecycle is defeating it.
3. **The `createServiceStore` memo is a red herring for the button** — the button is
   `!service`, read directly, not from the store. So the failure is specifically that
   `AdvertisedSettings` does not re-run at all after the service starts.

### Likely shape of the fix

The robust fix is probably to stop gating on a service reference captured at first render:
either the settings screen subscribes to service-identity changes in a way that survives the
screen's lifecycle, or the whole "is the service up" signal is derived from something the
screen re-reads reliably. Confirm the root cause before choosing — do not guess between the
freezing hypothesis and the subscription hypothesis.

### How to reproduce (important)

Reproduce this in a **local dev build or an integration test**, not by instrumenting the
deployed bundle. The existing unit tests in `index.test.tsx` and
`use-customer-display-service.test.ts` **mock the service module**, so they pass while the
real screen fails — they do not reproduce the real mount-order timing. A faithful repro
needs the real notifier and the real screen lifecycle (mount with no service, start the
service asynchronously, assert the button enables), ideally driving the actual navigator so
any screen-freezing behaviour is in play.

---

## What shipped today (all merged on `next`, all deployed)

### wcpos/woocommerce-pos-pro
- **#523** — advertise the display contract on the cashier store routes. Root cause of
  "Customer displays are a Pro feature" showing with Pro active: the app gates on
  `store.display`, which it reads from the free plugin's `cashier/{id}` route at login. Pro
  only advertised on `/stores` (the one route with a test). `advertise()` now handles both
  the array and response-object shapes of `woocommerce_pos_rest_prepare_store`, plus a new
  hook on `woocommerce_pos_cashier_data`. Tests on all four routes (dispatched to `wcpos/v2`
  for the lane-coverage ratchet).
- **#524** — the display client (`packages/display`) sends `X-WCPOS: 1` on its pairing and
  signaling fetches. Fixes the `request marker missing` warnings in WP admin.
- **#525** — advertise on `woocommerce_pos_inline_vars` too, reusing the cashier hook. The
  web app hydrates stores from the inline initial props, which the free plugin builds without
  the store filters.

### wcpos/monorepo
- **#1849** — settings copy: a site reporting `wcpos_pro_version` but no advertisement is told
  to **update** Pro (not upgrade). New string `settings.customer_display.update_pro`.
- **#1850** — `SettingsRow` renders without a react-hook-form provider. It always rendered
  `FormLabel`, whose `useFormField()` destructures `useFormContext()` and threw
  ("Cannot destructure property 'getFieldState' … as it is null") on the customer display
  page, the first SettingsRow consumer with no form. Falls back to a plain `Label` outside a
  form.
- **#1852** — surface pairing failures. `onMint` rejections were swallowed; a missing service
  only greyed the button. Now a failed mint logs a warning and shows an error toast; the
  disabled state carries a hint pointing at Logs. Also serialised the error in every
  customer-display logger context (an `Error` in a JSON context logs as `{}`).
- **#1854** — the initial-props hydration step must not revoke the display advertisement.
  `mergeServerOwnedStoreFields` deletes `display` when an incoming payload lacks it (so an
  older Pro can withdraw). The web app re-hydrates from inline initial props on every load of
  `/pos/`, and those never carried `display`, so the step revoked what the cashier response
  had just advertised (racing it — hence the `RxError CONFLICT` seen in the console). Added
  `revokeDisplayOnAbsence` (default true); the initial-props step passes false.
- **#1856** — moved the start/stop notifier into the service module
  (`services/customer-display/index.ts`) so it fires inside `startCustomerDisplayService()`
  and `stopCustomerDisplayService()`; no caller can start/stop without subscribers hearing.
  The hook no longer self-notifies, and a throw from the initial `configure()` is logged
  instead of aborting the start path. **This fixed real plumbing but did not fix the disabled
  button** — see the open bug above.

The web bundle was republished to `web-bundle@next` after each monorepo merge; the last
publish (17:40 UTC, entry `191931b766c4113dad3b5894729dbce2`) carries all of the above.

---

## Process notes for the next session

- **Lane:** all this is 1.11 work on `next` across the plugin repos and monorepo. Branch
  worktrees from `origin/next`, target PRs at `next`.
- **Native E2E never blocks merges** (standing ruling). Merge on Lint + Unit + web E2E.
- **Publishing the web bundle to dev-next** is a manual step, not automatic on merge:
  1. Wait for the merge commit's push `Test` run on `next` to go green.
  2. Dispatch `publish-web-bundle.yml` with `monorepo_ref=next`, `bundle_branch=next`,
     `override_release_gate="I accept a red main"` (the `next` lane never has the green push
     Deploy run the gate looks for).
- **wp-env from a plugin worktree:** free ports (`WP_ENV_PORT`/`WP_ENV_TESTS_PORT`) and
  `--env-cwd='wp-content/plugins/<worktree-dir-name>'`; `composer install` first.
- **Codex reviews** on these PRs flagged: v1-only test coverage (route the tests to `wcpos/v2`),
  raw `Error` in JSON log contexts, `jest-dom` import, and explicit `any` in test fixtures.
  Expect the same and pre-empt them.

## Still open on #129 (other session's scope)
- Electron main-process handler for `open-customer-display` in wcpos/electron.
- On-device native verification (needs an EAS dev-client build).

---

## Resolution (2026-09-05)

**Root cause: React Compiler memoization — neither hypothesis above.** The app builds with
`experiments.reactCompiler`. `AdvertisedSettings` subscribed to the start/stop version counter
with `useSyncExternalStore` but discarded the return value, then read
`getCustomerDisplayService()` as a bare call. The compiler treats a call with no reactive inputs
as invariant for the life of the mount and caches it behind a memo sentinel:

```js
React.useSyncExternalStore(subscribe, getVersion, getVersion);
let t1;
if ($[0] === Symbol.for("react.memo_cache_sentinel")) { t1 = getCustomerDisplayService(); $[0] = t1; } else { t1 = $[0]; }
const service = t1;
```

So the notify did re-render the component, but `service` came back from the cache as the null
read at first mount; `createServiceStore(service)` and `disabled={!service}` were cached the same
way. Navigating away and back gave a fresh memo cache, which is why it "fixed" it. The unit tests
passed because ts-jest skips the compiler. `snapshot-source.tsx` is unaffected (it uses the
version as an effect dependency and reads the service inside the effect).

**Fix: wcpos/monorepo#1862 (base `next`).** The service reference is now the external-store
snapshot (`useSyncExternalStore(subscribe, getCustomerDisplayService, getCustomerDisplayService)`),
so it is a reactive value and every memo below keys on it. `packages/core/jest.config.js` compiles
`settings/customer-display/index.tsx` with the React Compiler (the route `data-table` took), and
`cold-start.test.tsx` mounts the real screen with the real service module and notifier, starts the
service on a later macrotask, and asserts the button enables and disables again on stop. Both
fail on the old code.

**Still to do after merge:** dispatch `publish-web-bundle.yml` (`monorepo_ref=next`,
`bundle_branch=next`, override the release gate) once the merge commit's `Test` run is green, then
re-check the cold load on dev-next. `next` is currently 7 ahead / 74 behind `main`, so the
fast-forward sync is a sync PR, not a push.

**Lesson worth keeping:** a `useSyncExternalStore` whose result is unused next to a bare
module-level read compiles silently and is invisible to `check-react-compiler-smells.mjs` (which
only sees bailouts). A lint for an unused `useSyncExternalStore` result would catch the shape.

**Second finding the same day (2026-09-05):** with the button fixed, a paired phone display
showed the cart section with labels but blank money and no lines. Transport was fine; the
payload was the offline receipt shape (string money, `quantity`) while the Pro Ledger
template reads the canonical shape (`qty`, `*_display`). wcpos/monorepo#1863 (base `next`)
makes the snapshot map then format like the print path. Template fixes (phone-width grid,
`receipt_i18n` labels) are deferred to the Pro template pass per Paul.
Both landed the same afternoon: #1863 merged and the `next` bundle republished; the Ledger
template stacks on phones via wcpos/woocommerce-pos-pro#527 (list on top, totals panel capped
at 60dvh beneath), deployed to dev-next through deploy-dev. Open follow-up: store money
precision in `formatReceiptData` (printer package, both consumers).
Round 2 the same afternoon (all merged on `next`): variation attributes were written with only
`display_key`/`display_value` and the JS receipt builder read `key`/`value` (monorepo#1864, also
fixes the empty ": " line on local receipts); the Ledger's last-row flash replayed on every
re-render, so the engine now skips unchanged markup and the flash is gone (pro#528); a selected
customer is greeted by full name (pro#528). Open: `customer.first_name` in both receipt
builders for "Hi Max!", and a real "new line" cue in the template system.
