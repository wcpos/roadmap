# Printer program: executing #161 on Claude (2026-09-05 late → 2026-09-06)

Paul, 2026-09-05 23:5x: *"keep going! do everything that needs to be done!!! don't ask"* and *"Do all the remainder on claude"* (Codex hit its usage limit until 2026-09-07 05:45). This is the record of what landed, what is verified, and what is still the merchant's or Paul's to do.

## Where the work is

| Repo / PR | What | State |
|---|---|---|
| wcpos/monorepo#1884 (`codex/spec-m1`) | the scan-first setup dialog on **every platform** (Electron, web, iOS/Android) + P0, P1, P2, the native Secure Printing lane, the width pending state, the USB model query, the code-page setting, the BLE lane on phones, the simulator scenarios and integration tests | open; all CodeRabbit threads answered and confirmed; CI green per push; **Paul merges** ("finish all the work first") |
| wcpos/electron#411 | USB rows named by the product string; `usb-query-model` (GS I 67); preload allowlists the channel ahead of its typed entry | open; CI fought import/order and the preload allowlist test for five pushes — check the last run |
| wcpos/docs#413 | printers guide rewritten around the new flow + 14 troubleshooting pages, one per in-app line; Receipt language setting | open, build green; **Paul merges** (publishes to docs.wcpos.com) |
| wcpos/roadmap#147 | audit, cashier map, mockups, this handoff | open |
| wcpos/roadmap#161 | the plan, boxes ticked as things landed | open |

Dev builds: `~/Projects/monorepo-v2/.worktrees/printer-gotchas-electron` on branch `live-epos-check` carries every merge above plus the Electron submodule on `feat/usb-product-name-and-model-query`. Electron Metro on 8088 (`launch-expo-dev.sh`), Forge relaunched after the USB IPC (`launch-forge-dev.sh`), web Metro on 8089 (`launch-web-chrome.sh`, open http://localhost:8089 in Chrome). Hosted web preview of the last deployed head: https://wcpos--im1abih3e5.expo.app (moves on every push).

## Verified live tonight (Paul, TM-m30III + Netum NT-1809)

- Electron: Wi-Fi Epson found and printed; Netum over Bluetooth LE picked from the ranked chooser, printed, and — after the keep-alive fix — reconnected after minutes idle; width question and ruler answer; Stop; Enter an IP address; Copy setup report present.
- Web (localhost:8089): Netum over the browser's Bluetooth picker printed; Epson over Wi-Fi found by the subnet sweep after the sweep rewrite; manual address check lands as a card.

## Built tonight, NOT yet on a device (next session's walk)

1. **Electron USB with the product string** (wcpos/electron#411): plug the Netum and the TM-m30III in by USB; the card should read the product name and the Epson should come up at 48 columns without the 58/80 question. Forge was relaunched with the new IPC.
2. **iOS/Android scan-first dialog** (M3): needs the dev client on the phone with Metro 8081 (`launch-metro-native.sh`, `EXPO_NO_METRO_LAZY=true`). Expect: SDK-discovered Epson as a Wi-Fi card, "Checking paper width…" then 48, Bluetooth Epson as a ready card. **Secure Printing ON on the Epson**: the card reads "Wi-Fi · secure" and the profile address becomes the `TCPS:` target — this is the one SP-ON session the doctrine asked for; log lines `lane: 'sdk-secure'`.
3. **Generic BLE on Android** (Netum): discovery should list "BlueTooth Printer" as a Bluetooth card; prints over ble-plx in 20-byte chunks. Not yet run on a phone.
4. **P1 trouble lines**: a RED Epson over 9100 should say "Secure Printing is on…"; a held Epson (503) "The printer is holding jobs…"; the edit dialog no longer says "Detected: Epson" with the printer off; row Test Print says "Printed on" only on an acknowledging lane.
5. **Status query on the Bluetooth LE lanes** (e4e8277915): after a test page the app asks the printer `DLE EOT 1/2/4` over the 18F0/2AF0 notify; paper-out or cover-open goes straight to the paper line instead of asking. Needs a real Netum paper-out run. USB and raw TCP through Electron main still cannot ask (`usb-query-status` is the named follow-up in wcpos/electron).

## Decisions still Paul's

- **Bluetooth Classic (SPP) on phones**: the last transport on the plan; needs `react-native-bluetooth-classic` (new native module → dev-client rebuild). Spec on #161; not started.
- **Bench purchase** (~€800) and the **beta cohort** of ten merchants with the Copy setup report button.
- **Merges**: #1884, electron#411, docs#413 (publishes), roadmap#147.

## Audit rows the code disagreed with (recorded, not "fixed")

- #4 raw-probe guard already keys on the discovery vendor; Electron's `detectVendor` reads mDNS service type + TXT.
- N39 Font A: the encoder library already emits `ESC M 0`; a guard now keeps it so.
- The encoder has no CJK code pages at all — Chinese/Japanese/Korean receipts stay on the image method; the docs say so.

## Gotchas added tonight (roadmap#136)

#40 scan read as Wi-Fi-only · #41 BLE "no longer in range" and the forgotten device · #42 ruler answer silently cycled widths · #43 chooser lists the whole shop floor · #44 Electron USB rows never carried the product string.

## Final counts at handoff

printer package vitest 65 files / 645 tests; core `settings/print|catalog-plurals` 25 suites / 191 tests; virtual-printer 41 node tests; utils logger 96. #1884 head e4e8277915; dev build merge 5e21420cde.
