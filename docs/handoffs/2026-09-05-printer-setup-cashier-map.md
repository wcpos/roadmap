# Printer setup: every screen, every tap, walked as a cashier (2026-09-05)

Paul, 21:45: *"carefully map out all the different permutations and button clicks and follow the UI
changes like you are a human cashier. Some of the chains of action just don't make sense."*

This is that map for the scan-first **Add printer** dialog (`packages/core/src/screens/main/settings/printer/setup/`,
PR wcpos/monorepo#1884). Each row is one tap from one screen. **Was** = what the code did at 21:45;
**Now** = after the fixes pushed tonight. Rulings applied: printing is always the cashier's tap
(never automatic); one line + actions + guide link per screen; the app never explains.

## Screens

| Screen | What the cashier sees |
|---|---|
| **Scanning** | Spinner, "Looking for printers on USB, Bluetooth and Wi-Fi…"; USB / paired cards appear as they enumerate; row: *Find a Bluetooth printer* · *Enter an address* |
| **Results** | Heading (*Found your printer* / *Which printer is yours?* / *No printer found* / *That is an office printer…*), cards, the selected card highlighted, *Paper width 58 mm / 80 mm* when the width is unknown, primary *Print a test page*, row: Bluetooth · Scan again · Enter an address (· guide when nothing found) |
| **Printing** | Spinner, "Found *name*. Printing a test page…", "Look at the printer." |
| **Asking** | Name headline + meta, *Did the test page print?*, three full-width answers, footer "Test page n · N characters per line" |
| **Width** | Name headline, *Which paper is in the printer?*, four full-width widths (current one primary) |
| **Trouble** | Name headline, *Nothing printed*, one line for the lane, error box (with *Having trouble?*), row: *Try again* · *Save without testing* · *Open the printer guide* |
| **Saving / Saved** | Spinner "Saving…" → tick, "*name* is set up", one line, *Done*. No Options on Saved. |
| **Error** (save failed) | Error box, *Try again* (retries the save) · guide |
| **Options** (every screen but Saved) | Fields (name, address + port, vendor, width, toggles), *Check this address*, and on non-scan screens *Scan again* · Bluetooth · USB |

## Taps

| From | Tap | Was (21:45) | Now |
|---|---|---|---|
| Scanning | *Find a Bluetooth printer* | Chooser list rendered, then **vanished** when the Wi-Fi scan finished and auto-printed the Epson | List stays; scan completion only refreshes the cards, never changes screen |
| Scanning | Card (USB/paired) appears, tap it | Printed immediately | Selects the card; *Print a test page* appears |
| Scanning | *Enter an address* | Opens Options, focuses address | same |
| Scanning → done | one printer found | **Auto-printed** a test page | Pre-selected card + *Print a test page* |
| Scanning → done | several found | Results, cards | same; tapping a card selects it |
| Scanning → done | none / office only | Results with hints | One line + Bluetooth · Scan again · Enter an address · guide |
| Results | Card tap | Printed | Selects (highlight) |
| Results | *Paper width 58 / 80* | — (default 42 for every unknown printer, so the Netum printed wrong first) | Shown only when neither identification nor the model table knows the width; sets 32 / 48 before the first page |
| Results | *Print a test page* | — | Printing → Asking (or Trouble) |
| Results | *Scan again* | Rescans, then auto-printed if one found | Rescans; pre-selects; no print |
| Chooser | Pick a device | Printed immediately | Lands as a selected card (`Bluetooth · Generic`), width question if unknown, then *Print a test page* |
| Chooser | 26–55 devices listed | Flat list, phones and beacons mixed with the printer | Printer-like names first with a *Likely a printer* tag, other named devices next, unnamed hidden behind *Show N unnamed devices* |
| Asking | *Yes, and it looks right* | Saving → Saved | same |
| Asking | *Yes, but the ruler stops before the edge* | **Silently cycled 42→48→64→32 and printed again** — looked like "it just prints again" | Width screen: pick the paper, then it prints again |
| Asking | *Nothing came out* | Trouble | same |
| Width | Pick a width | — | Sets columns, prints again → Asking |
| Trouble (Bluetooth) | line | "…same Wi-Fi as this computer" (wrong lane) | "Turn the printer off and on again, then try again." |
| Trouble (USB / paired) | line | Wi-Fi line on Electron for chooser devices | "Check the cable and that the printer is switched on, then try again." |
| Trouble | *Try again* | Printing | same |
| Trouble | *Save without testing* | Saving → Saved | same |
| Error (save failed) | *Scan again* / *Save anyway* | Scan again made no sense after a failed save | *Try again* retries the save |
| Saved | *Done* | Closes; Options still showed under the tick | Closes; no Options on Saved |
| Options | *Check this address* | Identified, then **auto-printed** | Lands as a selected card in Results; *Print a test page* |
| Options | *Scan again* / Bluetooth / USB (non-scan screens) | Bluetooth was only here (hidden) | In the main row on scan screens; here on later screens |
| Any | Close (×) | Stops discovery, disposes the service | same |

## Bluetooth "disappears" (log, 21:40)

Three minutes after a good page, `gatt.connect()` threw `NetworkError: Bluetooth Device is no longer in range`
(macOS Chromium refuses to connect to a device it has not seen advertising recently; the Netum goes quiet
after a link drops). The adapter then **forgot** the device object and fell back to re-opening the chooser,
which needs a tap and an advertising printer → "Timed out reconnecting Bluetooth printer". Fix in flight
(Codex, `codex/ble-keepalive`): keep the GATT link alive for 60 s after the last job, retry once after 1.5 s
on "no longer in range", never forget the device on a transient error, cashier-facing message
"Bluetooth printer is not responding. Turn it off and on again, then try again."

## Still open after tonight

- **Paper width from the printer** where a lane allows it (Epson SDK / `GS I` over USB, Spec K2/K3); the
  58/80 question is the fallback, not the goal.
- **Ruler page that reads itself**: Spec K's numbered ruler so the answer is "the last number you can read",
  not a four-way guess.
- **Web**: same dialog with the browser's USB/Bluetooth pickers (M4, on #1884); preview deploy pending.
- **Chooser**: Chromium only gives names and ids, no service UUIDs, so the ranking is by name. A printer
  advertising no name lands under *Show N unnamed devices*.
