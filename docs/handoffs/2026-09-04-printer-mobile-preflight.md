# Pre-flight — iOS/Android network, Bluetooth and USB printer lanes (for 2026-09-04)

**Rule being applied:** doctrine §1 (`packages/printer/README.md` in the monorepo, wcpos/monorepo#1831; ruling in `docs/printer-support-doctrine.md`): the research gate is passed *before* any device is touched. The first 30–45 minutes of the session fill this file in from vendor docs and competitor help pages; the HITL walk starts only when every "TODO" below is either answered or explicitly parked.

**Carry-over from 2026-09-03:** the printer-side knowledge transfers whole — the TM-m30III prints structured ePOS XML over 443 in both Secure Printing states, holds are printer-side and cleared by a power-cycle, port 80 only works with SP off. Everything new tomorrow is *client-side*: permissions, certificates, and the transports each OS allows.

## A. Network lane on iOS and Android (same ePOS lane, different client)

Research before touching a device — write the answer and the source next to each:
- **iOS local-network permission** (iOS 14+): the app must declare `NSLocalNetworkUsageDescription` and list every Bonjour type it browses in `NSBonjourServices` (`_pdl-datastream._tcp`, `_printer._tcp`, `_ipp._tcp`, `_ipps._tcp`, `_star._tcp`, and any Epson type). Missing entries = discovery finds nothing forever, silently. TODO: confirm what the Expo dev client / production Info.plist currently declares.
- **App Transport Security vs the printer's self-signed certificate:** does `fetch` to `https://192.168.1.131` fail on iOS? What does our HTTP layer do on iOS for local IPs (`NSAllowsLocalNetworking`? per-host exception? a native module)? Epson's answer for browsers is the certified-domain feature (Odoo's path); ours must not depend on it. TODO: read the app's ATS config and how the web adapter's `fetch` behaves in React Native (RN `fetch` on iOS rejects self-signed by default).
- **Android:** cleartext to port 80 needs a network-security-config allowance for local ranges; self-signed HTTPS needs either a user-added CA (not acceptable for merchants) or a native trust override for the printer's host. TODO: what does the current Android build allow, and what does the Expo config expose.
- **mDNS on mobile:** which discovery module the native app uses (Zeroconf / NSD), whether it needs the same service list, and whether Android's NSD needs `CHANGE_WIFI_MULTICAST_STATE`.
- **Signature copy:** "No response" vs "Blocked by the OS" (permission denied) vs "Certificate rejected" must be three different dialogs on mobile. Map each to the error the client actually raises.

Competitor pages to read first (all three, per §1): Shopify POS iOS/Android printer setup for TM-m30 series, Lightspeed K-Series (iPad) printer setup, Square's Epson network printer page. Note what each tells the merchant to do on the printer and on the device.

## B. Bluetooth

- **Epson TM-m30III on iOS = MFi ExternalAccessory**, not CoreBluetooth. Requires the Epson protocol string in `UISupportedExternalAccessoryProtocols` and pairing in iOS Settings first. TODO: confirm the exact protocol string from Epson's ePOS SDK for iOS docs, and whether Expo can ship it (config plugin).
- **Android:** Bluetooth classic SPP works with runtime permissions (`BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN` on 12+). TODO: what the current app requests.
- **Netum NT-1809 is BLE** (generic): chunked writes, per-model service/characteristic UUIDs. TODO: find the UUIDs from the vendor sheet or a known library, and the max write size.
- Known gotcha already on record: native Add Printer refuses Bluetooth/USB for `vendor: generic`.

## C. USB

- **iOS: no USB printing.** Say so in the UI; do not attempt.
- **Android:** USB host API with the runtime device-permission dialog; bulk transfer to the printer interface. TODO: current implementation state and which printers were ever tried.
- **Electron/desktop:** existing `usb-printer` handler; Windows spooler path (`winspool`) separate.
- **Browser:** WebUSB needs a user gesture and a secure context; Chromium only.

## D. The fixed HITL script per lane (doctrine §6)

For each lane: scan/identify → width → Test Print → Open drawer → real receipt (image + barcode) → security setting flipped where the lane has one → breakages (wrong port/address, alternate port, raw by hand, wrong subnet, device off / out of range / unplugged). Timestamps, dialog text, and main.log lines for each; record on #136 the same hour.

## E. Before the first tap

1. Merge wcpos/monorepo#1828 after reading any bot push; move the dev build's `apps/electron` to f8ccd4f; restart Forge — so main.log carries the printer story from minute one.
2. Confirm the native dev clients on the phone/tablet are on a build that contains #1819 (structured ePOS) — an older build will send `<command>` and hang the printer under Secure Printing.
3. Decide Secure Printing state for the day (it is OFF as left on 2026-09-03); run the network lane once in each state.
