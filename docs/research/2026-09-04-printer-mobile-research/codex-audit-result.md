# WCPOS printer/native audit

> **Basis:** read-only source/history audit at superproject HEAD `9dfedbdab3c501a0a1bd20600835e726be7c378e`. No runtime/device testing was performed.  
> **Working-tree caveat:** `apps/electron` is checked out at stale `0db981481…`, while the superproject pins `f8ccd4f3…`. Electron findings below use the pinned commit and mark paths `@f8ccd4f`. Pre-existing `apps/electron`, `apps/web`, and `.scratch/` changes were not modified.

## 1. iOS declarations

| Key | Resolved repo value | Source / injector |
|---|---|---|
| `NSLocalNetworkUsageDescription` | `"WCPOS needs local network access to discover and connect to receipt printers."` | Direct `ios.infoPlist`, not a custom plugin: `apps/main/app.config.ts:67-70` |
| `NSBonjourServices` | `["_ipp._tcp", "_ipps._tcp", "_pdl-datastream._tcp"]` | Direct merge: `apps/main/app.config.ts:17-19,71-74`; root `app.json:1-3` contributes nothing |
| `NSAppTransportSecurity` | **NOT FOUND** | No injector |
| `NSAllowsLocalNetworking` | **NOT FOUND** | No injector |
| `NSAllowsArbitraryLoads` | **NOT FOUND** | No injector |
| ATS exception domains | **NOT FOUND** | No injector |
| `UISupportedExternalAccessoryProtocols` | `["jp.star-m.starpro", "com.epson.escpos"]` | Direct merge, not a plugin: `apps/main/app.config.ts:20-24,75-77` |
| `NSBluetoothAlwaysUsageDescription` | `"WCPOS uses Bluetooth to connect supported barcode scanners and receipt printers."` | Direct fallback at `apps/main/app.config.ts:61-66`, then `react-native-ble-plx` receives and writes the same value at `apps/main/app.config.ts:129-138`; plugin implementation: `node_modules/react-native-ble-plx/plugin/build/withBluetoothPermissions.js:5-10` |
| `NSBluetoothPeripheralUsageDescription` | **NOT FOUND** | BLE plugin explicitly treats its option as deprecated and does not inject it: `node_modules/react-native-ble-plx/plugin/build/withBLE.js:17-22` |

`with-printer-support` does not touch Info.plist; it only changes Android Gradle repositories/minSdk: `apps/main/plugins/with-printer-support.js:38-76`.

## 2. Android declarations

Requested permission declarations in `apps/main/app.config.ts:89-100`:

| Permission | State |
|---|---|
| `android.permission.INTERNET` | Present |
| `android.permission.ACCESS_WIFI_STATE` | **NOT FOUND** |
| `android.permission.CHANGE_WIFI_MULTICAST_STATE` | **NOT FOUND** |
| `android.permission.BLUETOOTH` | Present |
| `android.permission.BLUETOOTH_ADMIN` | Present |
| `android.permission.BLUETOOTH_CONNECT` | Present |
| `android.permission.BLUETOOTH_SCAN` | Present |
| `android.permission.ACCESS_FINE_LOCATION` | Present |

Additional declaration: `android.permission.ACCESS_COARSE_LOCATION` at `apps/main/app.config.ts:92`.

The BLE plugin also injects `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, location, and scan permissions: `node_modules/react-native-ble-plx/plugin/build/withBLE.js:23-32` and `withBLEAndroidManifest.js:23-70`.

- `<uses-feature android:name="android.hardware.usb.host">`: **NOT FOUND**.
- `android:usesCleartextTraffic`: **NOT FOUND**.
- `android:networkSecurityConfig`: dev/adhoc only, set to `"@xml/network_security_config"` by `apps/main/plugins/with-user-ca-trust.js:44-57`; enabled by `apps/main/app.config.ts:112-115`.
- Generated config is exactly:
  - trust anchors: `<certificates src="system" />` and `<certificates src="user" />`;
  - cleartext allowed only for `localhost`, `127.0.0.1`, `10.0.2.2`, `10.0.3.2`, each with `includeSubdomains="false"`;
  - source: `apps/main/plugins/with-user-ca-trust.js:27-42`.
- Production `network_security_config`: **NOT FOUND**.
- `USB_DEVICE_ATTACHED`/`USB_ACCESSORY_ATTACHED` intent filter and `@xml/device_filter`: **NOT FOUND**.
- Prebuilt `apps/main/android/`: **NOT FOUND**.

## 3. Native printer discovery

- Implementation is **vendor SDK discovery**, not `react-native-zeroconf`, an Expo discovery module, or Android `NsdManager`.
- Dispatcher runs Epson and Star discovery concurrently: `packages/printer/src/hooks/use-printer-discovery.ts:13-18,54-82`.
- Epson: `react-native-esc-pos-printer`; subscribes to `PrintersDiscovery`, then calls `start({ timeout: 10_000, autoStop: true })`: `packages/printer/src/discovery/epson-native-discovery.ts:53-86`.
- Star: `react-native-star-io10`; exact interfaces:
  `InterfaceType.Lan`, `InterfaceType.Bluetooth`, `InterfaceType.BluetoothLE`, `InterfaceType.Usb`: `packages/printer/src/discovery/star-native-discovery.ts:38-59`.
- Exact DNS-SD/Bonjour service types passed to discovery: **NOT FOUND**. WCPOS passes no service-name list; the three `NSBonjourServices` entries are declarations, not browse calls. Vendor SDK internals are compiled/opaque.
- Android multicast lock (`createMulticastLock`/`MulticastLock`): **NOT FOUND** in the inspected WCPOS-owned declarations or source. The Wi-Fi/multicast permissions are likewise not present in those declarations; the generated merged manifest was not inspected, so their absence from the final manifest is **UNVERIFIED**.

## 4. Native network printing

**Important finding:** an Epson ePOS HTTP/HTTPS printing lane on native is **NOT FOUND**.

- All native network profiles instantiate `NetworkAdapter`: `packages/printer/src/printer-service.ts:94-101`.
- Native `NetworkAdapter` is `packages/printer/src/transport/network-adapter.ts:5-18`; it uses `react-native-tcp-socket` and ignores `_vendor`.
- It writes raw ESC/POS bytes through `TcpSocket.createConnection()` and `client.write()`: `network-adapter.ts:41-64`.
- Native discovery explicitly declares only `printableLanes: new Set(['raw'])`: `packages/printer/src/discovery/identify-probes.ts:24-31`.
- Structured markup is used only when a transport exposes `supportsMarkup`; native `NetworkAdapter` does not, so it falls back to raw bytes: `packages/printer/src/printer-service.ts:255-282,311-327`.
- Port `80`: opens a raw TCP socket to port 80 and writes ESC/POS bytes. It does **not** issue an HTTP POST.
- Native HTTPS POST mechanism: **NOT FOUND**.
- Native self-signed printer-certificate handling: **NOT FOUND / not applicable** because the path is not TLS.
- The Android dev/adhoc user-CA plugin concerns platform HTTPS trust generally; it is not used by this raw-TCP printer path.

The `EpsonEposAdapter` uses global `fetch`, `AbortController`, and an HTTP/HTTPS POST (`packages/printer/src/transport/epson-epos-adapter.ts:35-45,64-112`), but it is selected by the web adapter, not native: `packages/printer/src/transport/network-adapter.web.ts:24-32`.

WCPOS-authored native-network errors:

- `"Network printer profile is missing an address"` — `packages/printer/src/printer-service.ts:95-98`.
- ``TCP connection to ${this.host}:${this.port} timed out`` — 10 seconds, `packages/printer/src/transport/network-adapter.ts:37-39`.
- `"NetworkAdapter does not support HTML printing. Use printRaw instead."` — `network-adapter.ts:69-70`.
- No-response error/code: **NOT FOUND**; the code does not read a printer response and resolves after the socket write callback.
- Certificate error/code: **NOT FOUND**.
- Permission error/code: **NOT FOUND**.
- Socket/write errors are propagated verbatim (`network-adapter.ts:43-45,60-64`); their platform-library strings/codes are not enumerated by WCPOS.

For contrast, Electron’s pinned ePOS handler uses Node `http`/`https` and sets `rejectUnauthorized: false` for ports `443`/`8043`: `apps/electron/src/main/print-epos-http.ts@f8ccd4f:35-37,50-63`.

## 5. Native Bluetooth printing

- Epson library: `react-native-esc-pos-printer` `4.5.0`; `apps/main/package.json:98`.
- Star library: `react-native-star-io10` `1.12.1`; `apps/main/package.json:104`.
- Epson adapter converts addresses to `BT:` and delegates `connect → addCommand → sendData`: `packages/printer/src/transport/epson-native-adapter.ts:5-21,63-81`.
- Star adapter selects `InterfaceType.Bluetooth` or `BluetoothLE` and delegates `open → printRawData`: `packages/printer/src/transport/star-native-adapter.ts:17-59,96-129`.

**iOS transport:** both mechanisms are available through vendor SDKs.

- Classic Star/Epson uses MFi/ExternalAccessory, supported by the two configured protocols.
- Epson wrapper links both `CoreBluetooth.framework` and `ExternalAccessory.framework`: `node_modules/react-native-esc-pos-printer/ios/EscPosPrinter.xcodeproj/project.pbxproj:9-14,54-63`.
- Epson exposes `PORTTYPE_BLUETOOTH_LE` as iOS-only: `node_modules/react-native-esc-pos-printer/src/discovery/constants.ts:28-35`.
- Star distinguishes classic and BLE; its documentation identifies classic Bluetooth as MFi and BLE as non-MFi: `node_modules/react-native-star-io10/README.md:50-58,95-107`.

Printer BLE service UUIDs: **NOT FOUND**.  
Printer BLE characteristic UUIDs: **NOT FOUND**.  
BLE write chunk size: **NOT FOUND**. WCPOS passes the full byte array to the vendor SDK; UUID selection/chunking is internal to the SDK.

Android runtime permissions:

- Epson discovery requests `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` on API 31+, fine location on API 29–30, and coarse location below 29, via `PermissionsAndroid.requestMultiple`: `node_modules/react-native-esc-pos-printer/src/core/utils/permissions.ts:7-50`.
- Epson denial code is `PERMISSION_ERROR = -2`, message `"Permission error"`: `node_modules/react-native-esc-pos-printer/src/discovery/constants.ts:62-83`; invocation at `PrintersDiscovery.tsx:38-46`.
- Direct Epson printing without discovery performs no permission request: **NOT FOUND** in `epson-native-adapter.ts`.
- Star runtime permission request in WCPOS: **NOT FOUND**. Star’s documentation says the caller must request Bluetooth permissions: `node_modules/react-native-star-io10/README.md:124-126,194-211`.
- iOS relies on the system prompt driven by `NSBluetoothAlwaysUsageDescription`; no JS permission request is present.

Exact generic-vendor refusal, `packages/printer/src/transport/device-adapter.ts:24-26`:

```ts
throw new Error(
	`Unsupported native printer vendor for ${profile.connectionType}: ${profile.vendor}`
);
```

Thus the concrete messages are `"Unsupported native printer vendor for bluetooth: generic"` and `"Unsupported native printer vendor for usb: generic"`.

## 6. USB printing

### Electron

The pinned handler is implemented and registered: `apps/electron/src/index.ts@f8ccd4f:18-26`.

- Uses `usb` `2.18.0`: `apps/electron/package.json@f8ccd4f:66-79`.
- Non-Windows discovery filters USB printer-class `0x07`: `apps/electron/src/main/usb-printer.ts@f8ccd4f:15-16,45-55,120-135`.
- Opens device, claims printer interface, optionally detaches Linux kernel driver, finds bulk OUT, and calls `out.transfer(bytes, ...)`: `usb-printer.ts@f8ccd4f:57-118`.
- Timeout: `20_000` ms: `usb-printer.ts@f8ccd4f:15-16,79-84`.
- Windows enumerates spooler queues and RAW-spools them; legacy direct `usb:` keys are refused: `usb-printer.ts@f8ccd4f:120-129,138-178`.

### Android native

- Generic WCPOS USB-host implementation: **NOT FOUND**.
- `UsbManager.requestPermission`: **NOT FOUND**.
- App-owned `bulkTransfer`: **NOT FOUND**.
- Epson/Star profiles delegate to their native SDK adapters; Star selects `InterfaceType.Usb` (`star-native-adapter.ts:34-36,50-52`) and Epson builds a `USB:` target (`epson-native-adapter.ts:15-16`).
- Any USB permission/bulk-transfer implementation inside compiled vendor SDK binaries is **Unverified**.

### iOS

- USB is omitted from the native settings UI on iOS: `packages/core/src/screens/main/settings/printer/dialog/connection/connection-type-segmented.tsx:27-30`.
- Epson USB is documented in this adapter as Android-only: `packages/printer/src/transport/epson-native-adapter.ts:34-42`.
- Star adapter contains USB/Lightning support for an existing profile, but normal iOS UI creation is unavailable.

### Browser

- WebUSB exists via `@point-of-sale/webusb-receipt-printer`; chooser/connection: `packages/printer/src/hooks/use-printer-discovery.web.ts:106-121`.
- Printing reloads the selected device, reconnects, then calls `printer.print(data)`: `packages/printer/src/transport/webusb-adapter.ts:7-24`.
- Capability is `!!navigator.usb`; comment states Chromium desktop/Android, never iOS Safari: `packages/printer/src/transport/device-capabilities.ts:1-10`.

## 7. Native dev-client builds

`apps/main/eas.json:7-42`:

- `development`: `extends: "monorepo"`, `distribution: "internal"`, `developmentClient: true`, Android `buildType: "apk"`, iOS `simulator: true`.
- `production`: `distribution: "store"`, Android `buildType: "app-bundle"`, `autoIncrement: true`.
- `adhoc`: `distribution: "internal"`; `developmentClient`: **NOT FOUND**.
- Shared values: `pnpm: "11.1.1"`, `node: "22.13.1"`, `EXPO_USE_FAST_RESOLVER: "true"`.
- The EAS `development` iOS profile is simulator-only; a physical-iPhone dev client requires a local/device build or another profile.

`expo-dev-client` is present at `"~57.0.12"`: `apps/main/package.json:76`. The config explicitly says development-client JS is served by Metro: `apps/main/app.config.ts:26-28,40-42`.

**Commit `a561104223`:** yes, its JS/TS changes can reach an already-compatible dev client through Metro without rebuilding the native shell. However, it does **not** activate structured ePOS XML on native because native remains on raw `NetworkAdapter`; its ePOS transport changes target web/Electron.

Current version/config:

- Package/app production version: `"1.10.6"` — `apps/main/package.json:4`.
- Development-client native version: `"1.10.3"` — `apps/main/app.config.ts:5-12,42`.
- `runtimeVersion`: **NOT FOUND**.
- `expo-updates` application dependency/config: **NOT FOUND**.
- iOS `buildNumber`: `"1"` — `apps/main/app.config.ts:57`.
- Android `versionCode`: `1` — `apps/main/app.config.ts:88`.
- Production identifiers are remotely managed (`"appVersionSource": "remote"`, `"autoIncrement": true`): `apps/main/eas.json:2-4,31-38`; current remote build numbers are **NOT FOUND** in the repo.
- Bundle/package IDs: dev `com.wcpos.main.dev`, adhoc `com.wcpos.main.adhoc`, production `com.wcpos.main`: `apps/main/app.config.ts:52-56,87`.
- Prebuilt `apps/main/ios/`: **NOT FOUND**.
- Prebuilt `apps/main/android/`: **NOT FOUND**.

Native-config history since 2026-08-25:

- `8489413` (2026-08-28): removed `e2e-test`, consolidated on `development`; no new native capability.
- `b07be3f` (2026-08-28): changed Android dev/adhoc network-security XML; **Android rebuild required**.
- `76b4e7f` (2026-08-28): network-security test only; no rebuild.
- `028335c` (2026-08-29): added dev-only Info.plist/manifest dev-menu defaults; **iOS and Android development-client rebuild required**.
- `f1d51cc` (2026-08-30): froze development version at `1.10.3` to reuse the existing client; no new native capability.
- `5ff8384` (2026-08-30): named the same frozen constant; resolved config unchanged.
- Native dependency change `fff34cd` (2026-09-03): `react-native-reanimated` `"4.5.1"` → `"4.5.5"`; **iOS/Android rebuild required**.
- `a561104223` itself changed no native config or native dependency; **no rebuild required for that commit alone**.

## 8. Renderer-side printer logger on native

- Printer namespace is exactly `["wcpos", "printer"]`: `packages/printer/src/logger.ts:1-2`; category becomes `"wcpos.printer"` in context: `packages/utils/src/logger/index.ts:1022-1044`.
- Default level is `debug` in development and `info` otherwise: `packages/utils/src/logger/index.ts:539-550`.
- Development native: all permitted lines go through `console.log`: `packages/utils/src/logger/index.ts:697-718`. They therefore go to the React Native/Expo JS console and whichever Metro/device-log tooling is attached—not an app-owned log file.
- Production native:
  - `debug`: kept in the in-memory flight recorder, max 100 events / 64 KiB: `packages/utils/src/logger/index.ts:823-843`; `flight-recorder.ts:13-14`.
  - `info`: not sent to OS console, but persisted to the local RxDB `logs` collection once bound.
  - `warn`/`error`: sent through `console.warn`/`console.error` and persisted.
  - Routing rules: `packages/utils/src/logger/index.ts:697-722,823-855`.
- The native app binds its `logs` collection at `apps/main/app/(app)/_layout.tsx:353-363`; rows are inserted at `packages/utils/src/logger/index.ts:440-472`.
- Electron forwarding requires `window.__electronLog`: `packages/utils/src/logger/index.ts:724-744`; on iOS/Android that bridge is **NOT FOUND**, so native printer logs do not go to Electron `main.log`.
- Native app-owned filesystem log destination: **NOT FOUND**.

## Verification

- **Observed:** source/config/history inspected; no files modified.
- **Not evaluated:** generated prebuild manifests, device behavior, vendor binary internals, and remotely managed EAS build numbers.
