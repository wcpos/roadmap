# Handoff — printer lanes on iOS/Android/desktop, the matrix walk (2026-09-04 → 2026-09-05, written 19:05 on 09-05)

**Task:** wcpos/roadmap#136 (gotcha catalogue) → #135 (scan-first wizard flow, prototype `docs/prototypes/2026-09-02-printer-scan-first-flow.html`) → #134 (in-app wizard). Specs on wcpos/monorepo#1597 (Spec G, G9, H/H2/H3, I, J, K this session). Lane `main`, 1.10.x.
**Mode:** HITL; doctrine in `packages/printer/README.md` (monorepo) — research gate first, log everything, one printer = one row, transport is a routing choice. Pre-flight with the research answers: `docs/handoffs/2026-09-04-printer-mobile-preflight.md`; research files under `docs/research/2026-09-04-printer-mobile-research/`.
**Safeguards unchanged** (see `2026-09-03-printer-setup-handoff.md`): no device credentials, no admin logins, no probing the Epson beyond the app's own status checks, never bytes to raw 9100 on the Epson, shell jobs on the Netum only with Paul's yes for that job. The SP-OFF raw-9100 rows below are historical observations from the app run, **not an approved exception and not a test to repeat**; all future Epson tests use an acknowledged ePOS/SDK lane.

## Matrix (state at 19:35 on 09-05; "Verified" = printed from the app on paper)

| Lane | Web | Desktop (Electron) | iOS | Android |
|---|---|---|---|---|
| Epson network | Verified 09-03 (logo missing #14) | Verified 09-03 | Verified 09-04, simulator only, SP OFF (raw 9100); permission/entitlement signatures need a real iPad | Verified 09-04 SP OFF (raw 9100). SDK `TCPS:` TLS lane prints SP OFF; **SP ON untested** (candidate acknowledged lane for RED printers). Port-80 ePOS probe now succeeds on the new dev client (identify sees the lane) |
| Epson Bluetooth | **Not possible** (Web Bluetooth is BLE-only; the TM-m30III is Classic/MFi; also bonded to one host at a time) | untested (macOS pairing → "Paired Bluetooth printers" serial lane; unpair from the Pixel first) | needs device (MFi `com.epson.escpos` declared) | **Verified 09-04/05** (SDK; pairing needs the Bluetooth Status Sheet; width from the printer, 48) |
| Epson USB | **Verified 09-05** (WebUSB; width 42 default → Spec K2/K3; #39 row not applied) | untested | n/a (Epson: no iOS USB for this model) | **Verified 09-05** (SDK `USB:/dev/bus/usb/001/002`, width from the printer, 48) |
| Netum Bluetooth (BLE) | **Verified 09-05** (library reconnect works where Chrome persists the permission; #39) | **Verified 09-05, receipt-grade** (Spec H2, GATT 18F0/2AF1; #38 tail fix confirmed on a 7.4 KB receipt) | unsupported (generic refusal, copy not yet captured) | unsupported (same) |
| Netum USB | **Verified 09-05** (WebUSB; 42 default; #39; logo missing = #14) | **Verified 09-05** (class 7, found at once; width defaults to 42 → Spec K) | n/a | unsupported |

## PRs

Merged: wcpos/monorepo#1860 (Spec G1–G8), #1853 (dev-client cleartext), #1861 (phone-width settings UI). Open: **#1868** (Spec I: multi-line centred text per line; raw job hex capture), **#1869** (Spec H + H2 + #38: Web Bluetooth via the held device, session registry, chooser auto-select, acknowledged tail), **#1877** (Spec J: no empty-state flash, "Having trouble?" relocated, no premature address error). Roadmap: #147 (this docs branch, draft).

## Gotchas added this session (all on #136 with timestamps)

`#21` DOMParser on Hermes · `#22` SDK-discovered Epson relabelled generic · `#23` native raw print logged nothing · `#24`/`#25` phone-width layout · `#26` logo needs canvas (native raster in G8) · `#27` barcode HRI off · `#28` TCPS/sub-device targets in the Bluetooth picker · `#29` `BT:` row only while in pairing mode (open) · `#30`/`#33`/`#37` width defaults on Bluetooth/USB/generic (G7 for Epson SDK lanes; Spec K for generic) · `#31` width query has no pending state (Spec G9, open) · `#32` image src entities on the regex path · `#34` 32-column footer (I1) — dotted rule/amount shift not reproduced offline, compare the hex capture next time · `#35` Electron BLE print used the library's `getDevices()` reconnect · `#36` premature address error · `#38` BLE tail cut off (acknowledged last chunk).

Dev-client lessons (not merchant-facing): `wcpos-dev://` is the dev scheme now; Metro over Wi-Fi needs `EXPO_NO_METRO_LAZY=true` or the first lazy import dies with "Cannot read property 'reload' of undefined" (Expo's async-require reload path); a connected BLE peripheral stops advertising until power-cycled; `system_profiler SPBluetoothDataType` shows who holds the link.

## Next session, first taps

1. Work through the six review threads on #1869 (Codex connector P1/P2 + CodeRabbit) and merge it; then the detailed receipt again on the Netum over USB and compare `Raw job dispatched` hex (#1868) against the 32-column render for the dotted rule and amount shift (#34).
2. Build Spec L (native network profile with `secureTarget` prints via the Epson SDK TLS lane on the Secure Printing signature), then the one Secure Printing ON session: TCPS print, plus Bluetooth/USB confirmation that SP does not touch them.
3. Android Netum: capture the "nothing found" state on the Bluetooth tab and the generic refusal copy.
4. Desktop Epson Bluetooth via macOS pairing + the serial lane; desktop Epson USB.
5. Then the wizard build (#135): scan on open → identified printers → test page prints → "Did it print?" → save; address/port/vendor/width under Options. Spec K's ruler question belongs in that flow.

## Environment as left

- Dev build worktree `~/Projects/monorepo-v2/.worktrees/printer-gotchas-electron` (branch `live-epos-check` = main + #1869; #1868/#1877 not merged in). Electron Forge + web Metro (:8088) + native Metro (:8081, `EXPO_NO_METRO_LAZY=true`) in Terminal windows; relaunch scripts in the session scratchpad (`launch-expo-dev.sh`, `launch-forge-dev.sh`, `launch-metro-native.sh`; `metro-tail.sh` reads the live tab).
- Pixel 10: dev client 1.10.3 (build 81bd5e87, 09-05 17:44, carries #1853) → Metro over Wi-Fi at `http://192.168.1.157:8081`; iPad mini simulator: older dev client (ExpoLinking error on reload — rebuild before reuse).
- Printers: TM-m30III 192.168.1.131, **Secure Printing OFF**, Bluetooth paired to the Pixel; Netum NT-1809 (BLE `BlueTooth Printer`, USB 0416:5011). Saved profiles on the Pixel: network 9100, Bluetooth (48); on Electron: Netum USB (32), Netum BLE.
- Shell tools (scratchpad, Python venv with bleak 3.0.2): `ble-discover.py` (GATT map), `ble-testprint.py`, `ble-gsi.py`/`ble-dle.py` (status queries). 443 status poll: `poll-443-status.sh`.
- Monitors die with the session; re-arm the 443 poll and the main.log BLE grep.
