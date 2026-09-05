# Competitor printer help pages (Epson TM-m30 series) + Netum NT-1809

Date: 2026-09-04. Every claim is sourced; unsourceable items are marked **UNVERIFIED**.

**Naming correction:** there is no "Lightspeed Retail K-Series". K-Series is **Lightspeed Restaurant**; the Retail lanes are X-Series, R-Series and S-Series. Both product lines are covered below.

---

## Part 1 — Competitor help pages

### 1. Shopify POS — Epson TM-m30II / TM-m30III

URLs: [m30III requirements](https://help.shopify.com/en/manual/sell-in-person/hardware/receipt-printers/epsontmm30iii/requirements) · [m30III troubleshooting](https://help.shopify.com/en/manual/sell-in-person/hardware/receipt-printers/epsontmm30iii/troubleshooting) · [m30II troubleshooting](https://help.shopify.com/en/manual/sell-in-person/hardware/receipt-printers/epsontmm30ii/troubleshooting) · [m30III setup](https://help.shopify.com/en/manual/sell-in-person/hardware/receipt-printers/epsontmm30iii/setting-up) · [m30II setup](https://help.shopify.com/en/manual/sell-in-person/hardware/receipt-printers/epsontmm30ii/setting-up)

**(a) Lanes.** Requirements page: *"USB connection is supported on Android, and also on compatible iOS devices with Shopify POS Hub."* and *"Wi-Fi support is Android only."* Ethernet carries no OS restriction (*"For an Ethernet connection, you need an Ethernet cable."*). Bluetooth is documented on the setup and troubleshooting pages for both iOS and Android, but is absent from the m30III requirements page — a Shopify documentation gap, not a statement of non-support. Explicitly unsupported: *"Shopify POS only supports 80mm receipt paper."* · *"RED (Radio Equipment Directive) activated printers don't work currently."* · *"The Epson TM-m30III receipt printer can only connect to one device at a time."* Setup page also warns *"Only connect each printer using 1 connection type at a time."*

**(b) On the printer.** Turn off Secure Printing — *"you need to turn off Secure Printing to allow successful pairing and functionality of your device"*, and *"Secure Printing is activated by default on all products that are in scope of RED."* Shopify names three tools: **TM (Thermal Monitor) Utility, Web Config, or EpsonNet Config (Web version)**. Wi-Fi reset (Android lane): open the cover, hold Feed until the roll-paper LED flashes, pull the paper out, close the cover to print the *Next Action* sheet, then *"Briefly press the Feed button five times, and then hold down the button for at least one second."* A QR code prints; join the printer's SimpleAP network and *"Enter the printer's serial number as the password"* in WebConfig; a status sheet prints PASS or FAIL. Factory reset: *"Use a ball point pen to hold the SW reset button down for 5 seconds"* while powering on, until *"Resetting to Factory Default"* prints — Shopify says this *"can help resolve bluetooth connection issues."* Paper: remove the 58 mm guards, *"Install the roll paper guides by aligning the triangle marks."*

**(c) On the device.** Update POS and the OS. iOS-specific and unusual: *"make sure the Allow cross website tracking permission is turned on."* Bluetooth reset (iOS): *"Next to the printer, select the i icon, then select Forget This Device"*, Bluetooth off, *"Turn off your iOS device for 2–3 minutes"*, reconnect. Android is the same shape. Unpair from the first device before pairing to a new one. In-app: *"Tap + Add hardware > Receipt printers > Epson > Bluetooth > TM30II"*.

**(d) Troubleshooting copy.**
- *Not found on scan*: no dedicated section — routed to POS Hub troubleshooting, the Wi-Fi reset, or the Bluetooth reset; for Wi-Fi it adds confirm the same network, verify the password, power-cycle the router.
- *Test print fails*: **not addressed on either page.**
- *Bluetooth disconnects*: Bluetooth reset → unpair from prior device → *"A factory reset can help resolve bluetooth connection issues."*
- *Connected but not printing*: treated as paper/settings. *"If the ERROR indicator light blinks red, then there's no paper present in the printer."*; LED codes → "page 19 of Epson's Technical Reference Guide"; then Epson Utility → Change Printer Settings > Various Settings > Printing Control set to *"80mm - 48 columns"*.

**(e) Bluetooth on TM-m30.** Yes on both iOS and Android — Bluetooth setup is documented for *"an iPhone, iPad, or Android device"* and the troubleshooting section is headed *"If you're using an iOS or Android device"*. Shopify never mentions MFi; that the iOS path runs over ExternalAccessory is **UNVERIFIED** in Shopify's docs.

### 2. Lightspeed Restaurant K-Series (iPad)

URLs: [TM-m30 series setup](https://k-series-support.lightspeedhq.com/hc/en-us/articles/4402057050395-Epson-TM-m30-series-printer-setup) · [Troubleshooting printing](https://k-series-support.lightspeedhq.com/hc/en-us/articles/31741258838811-Troubleshooting-printing)

**(a) Lanes.** *"All TM-m30 series printers support LAN / Ethernet, but separate models are available for Bluetooth, Wi-Fi, and USB connection types."* Hardware caveat: *"the TM-m30 and TM-m30II must be purchased with a wireless dongle to connect via Wi-Fi (the TM-m30III has built-in Wi-Fi connectivity)."* Bluetooth is discouraged for kitchens: *"Bluetooth printers connect to a single POS device. They are not recommended for kitchen use due to the potential for wireless interference."* Range: *"Set up your printer less than 10 meters, or 33 feet, from the iPad it will connect to."*

**(b) On the printer.** Print a self-test page: *"The self-test page should show the printer's current IP address and its MAC address (hardware address)."* Secure Printing, verbatim: *"Some printer models may have Secure Printing enabled by default, which can cause issues when attempting to pair your printer to Lightspeed POS. You can disable this feature in the Web Config page of your printer. The Web Config page is a settings menu accessible by browser that allows you to check and edit your printer's settings. For more information, see your user's manual. To access your Secure Printing options: 1. Open a web browser on a computer or device connected to the same network as your printer. 2. Enter the IP address of the printer …"* (IP from the self-test page). Also *"assign a static IP to the printer"* / DHCP reservation so the IP does not move.

**(c) On the device.** Same-network check by IP prefix: *"If the first three IP address numbers are identical (e.g., 10.1.10.xx and 10.1.10.xx), the printer and iPad are likely on the same network."* Then Back Office → Hardware > Printers to update the IP, or enter the **hardware (MAC) address** instead — supported for select Epson, Star and Bixolon printers.

**(d) Troubleshooting copy.**
- *Not found / inactive*: *"Troubleshooting an inactive printer depends on how it connects to your system: by Ethernet or USB cable, or wirelessly over Wi-Fi or Bluetooth."* LAN: *"Your iPad must be connected to the same network as the LAN printer in order to print to it. If they're already on the same network and the printer is inactive, the printer's IP address may have changed, requiring you to update it in the Back Office."*
- *Bluetooth disconnects*: *"A Bluetooth printer may disconnect and become inactive if an Ethernet cable or other peripheral is plugged in to it. Unplug any unnecessary devices, and if the issue persists, re-pair the printer with the iPad."*
- *Connected but not printing*: *"Ensure that any third-party settings that interrupt connectivity, such as Secure Printing, have been disabled."* plus a routing check (floor plan → printing profile).
- *USB*: *"try using a different cable … Preferably, you should use one that is manufactured or certified by Apple."* A separate section covers blank / wrong-format / low-quality printouts, keyed off the self-test page.

**(e) Bluetooth.** Supported on iPad for the Bluetooth model variants. Android is not a K-Series target.

### 3. Lightspeed Retail X-Series (iPad / Windows)

URLs: [Bluetooth setup](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534135699739-Setting-up-your-receipt-printer-with-Bluetooth-connection) · [Troubleshooting receipt printers](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534265390875-Troubleshooting-receipt-printers). Both 403 to plain fetchers; readable via the Zendesk API at `/api/v2/help_center/en-us/articles/<id>.json`.

**(a) Lanes.** Bluetooth (iPad + Windows), plus *"Some receipt printers can also be set up using a USB cable, LAN cable, or WLAN connection."* Constraint: *"Bluetooth-connected printers can only be connected to one POS device at a time."* No Android POS lane. Also *"Receipt printers are not currently supported in Lightspeed Hub for Retail POS (X-Series). Currently, only Zebra label printers are supported."*

**(b) On the printer.** Status sheet + pairing mode (TM-m30III): open the cover, *"Hold the feed button down until the paper roll light (orange) starts blinking"*, pull the paper past the cutter, close the cover → *Next Action* printout → *"Select the Bluetooth Status Sheet action by quickly pressing the feed button once, then holding for one second"*. Then *"The printer's Bluetooth light will start flashing to confirm you're in pairing mode. You'll have one minute to connect it to your device."* Generic self-test: *"If your printer has a Feed button, press and hold it until the printer powers on to perform a hardware self-test."* Factory reset: hold Reset with a pen/paperclip while powering on *"until a Resetting to Factory Default message prints."*

Secure Printing — **the fullest step list of any vendor, verbatim**:
> **Disabling Secure Printing on an Epson printer**
> Some Epson printer models may have **Secure Printing** enabled by default in the printer's Web Config page, which can cause issues when attempting to pair your printer to Retail POS. For more information, consult your user manual.
> To access **Secure Printing** options:
> 1. Open a web browser on a computer or device connected to the same network as your printer.
> 2. Enter the IP address of the printer in the address field. Your IP address can be found by printing a status sheet.
> 3. Click **Advanced Settings** > **Administrator login**.
> 4. Enter your password to log in. The default password is the printer serial number and can be found on the bottom of the printer or by printing a status sheet.
> 5. Click **Print** > **Secure Printing**.
> 6. Click **Disable** > **Ok**.

**(c) On the device — the best permission checklist found**, verbatim (iPad):
> On your iPad, review your connection settings:
> - **Settings > Privacy & Security > Local Network**: **Retail (X)** is toggled on.
> - **Settings > Apps > Retail (X)**: **Bluetooth** is toggled on.
> - **Settings > Bluetooth**: **Bluetooth** is toggled on.
> On the **Settings > Bluetooth** page, wait for the printer to appear under **Other devices** (Epson TM-m30III must be in pairing mode), then click it to connect.
> If your iPad requests a device PIN, consult your printer's manual for the number.

In-app: Menu > Settings > Hardware > Receipt printers > **Add printer** > *"Find a printer that's ready to add"*; if absent, *"Follow steps to connect and add a printer"* → self-test → brand/model → connection type → *"Select printer to connect…"*, with the honest note *"Your printer may take a moment to appear, as other connected Bluetooth devices will also populate in the list."*

**(d) Troubleshooting copy.**
- *Not found / inactive*: same-network IP-prefix comparison; *"If the IP address on the settings receipt states NONE, the printer is not connected to the internet."*
- *Bluetooth disconnects*: *"Unplug any cables from the printer other than those connecting it to power or a cash drawer."* then Forget This Device → toggle Bluetooth → re-select; *"Once re-paired, your printer will display as Connected."*
- *Connected but not printing*: the status-light table's normal row reads *"If the printer is in normal status, but isn't printing, check the communication status between the printer and the device."* Receipts-won't-cut and CUPS sections cover the rest.
- Test print path: Sell > Sales history > expand a sale > Print receipt.

**(e) Bluetooth.** Yes on iPad (TM-m30III recommended, TM-m10 also supported); Windows via vendor drivers. No Android lane.

### 4. Square POS

URLs: [Connect a printer](https://squareup.com/help/us/en/article/8246-connect-a-printer-to-square) · [Printer troubleshooting](https://squareup.com/help/us/en/article/5515-printer-troubleshooting) · [Static IP (Epson-specific)](https://squareup.com/help/us/en/article/7103-setting-up-static-ip-with-square-point-of-sale) · [Compatibility](https://squareup.com/us/en/compatibility/accessories/printers)

**There is no Square "Epson network printers" page.** Square organises by connection type, not vendor; the static-IP article is the only Epson-specific walkthrough. Recorded here rather than fabricated.

**(a) Lanes.** Ethernet, Wi-Fi, USB, Bluetooth, AirPrint — with hard OS splits: *"Connecting a printer into an iOS device directly via a Lightning or USB-C is not supported."* and *"For Android devices, you'll need to connect through a USB OTG (On-The-Go) adaptor."* Square is the only vendor that discourages Bluetooth outright: *"Due to poor performance, we do not recommend using Bluetooth printers."* · *"Bluetooth printers can only be wirelessly connected to one POS device at a time"* · *"Bluetooth works best in close proximity, and is not recommended for kitchen printers."* Also *"You won't be able to use an Ethernet connection with Offline payments."*

**(b) On the printer.** Epson IP: *"turning the printer off and holding down the Feed button while turning the printer back on"* … *"Keep pressing down on the feed button until the printer prints out two information sheets"* (first general, second network/IP). Static IP: browse to the IP plus `/webconfig` (example `http://192.168.1.123/webconfig`), *"Log in using **epson** for both the username and password"*, *"Click TCP/IP"*, *"From the Get IP Address section, select Manual"*, enter the IP, Submit, then *"On the next page, click Reset."* **EpsonNet Config is never mentioned, and Square never mentions RED / Secure Printing at all.**

**(c) On the device.** *"Square needs access to your local network in order to connect to network printers."* → Settings > Square > Local Network ON, relaunch. Bluetooth: Settings > Square > Bluetooth ON, relaunch; pair at *"your device's Settings > Bluetooth > toggle Bluetooth ON"*, and *"If prompted for a PIN, enter 1234."* Same-network rule: *"If they are on different networks, the connection will not be successful."* App path: *"Tap ≡ More > Settings > Hardware > Printers."*; manual IP via *"Connect printer > Select printer > Advanced printer setup"*.

**(d) Troubleshooting copy.**
- *Not found on scan*: *"If you are connecting a new printer for the first time and you do not see your printer listed, move on to step two."*; Register Bluetooth → *"Tap Settings > Connect a Printer > Retry scanning."*; then the vendor-app cross-check — download the Star or **Epson** app and see whether the printer is discoverable at all.
- *Test print fails*: not addressed; nearest is *"Make sure there's a roll of paper in the printer."*
- *Bluetooth disconnects*: *"Make sure that your device and hardware accessories are all within 10ft. of each other."* and *"Check that the printer isn't already paired to another device."* → forget and re-pair.
- *Connected but not printing*: no dedicated section — power-cycle the printer (unplug, wait 10 s), restart the POS device, send a diagnostic report, factory reset last.

**(e) Bluetooth on TM-m30 for Square.** No per-model Epson matrix in help; the compatibility page is the stated authority. Community moderators say Epson support arrived on iOS first and on Android *"back in April 2020"*, and a 2025 thread states the TM-m30III variant is supported *"only over network connections, not Bluetooth, when using with iPads"* — community, not documentation, so **UNVERIFIED**. ([thread](https://community.squareup.com/t5/Payments-Troubleshooting/Epson-TM-M30II-printer-does-not-connect-with-Square-iPad-app/td-p/802096))

---

## Part 2 — Netum NT-1809 (58 mm Bluetooth/USB)

### (g) Vendor specs
[Official product page](https://www.netum.net/products/netum-portable-58mm-bluetooth-thermal-receipt-printer-support-android-ios-usb-thermal-printer-for-pos-system-nt-1809): *Interfaces* **USB / Bluetooth**; *Print Command* **ESC/POS**; *Print Speed* 70 mm/sec; *Resolution* **203DPI (8dot/mm)**; *Paper Width* **57.5 ± 0.5 mm**; battery 7.4 VDC/2000 mA. The page states **no** Bluetooth version, no dot count, no chipset, no OS list.

- **Bluetooth version**: retail listings and the sibling NT-1809DD page say **Bluetooth 4.0**, *"auto sleep, auto awake"*; the manufacturer site [gzxlscan.com](https://gzxlscan.com/product-detail/nt-1809dd-58mm-bluetooth-thermal-receipt-printer/) describes the DD as *"Receipt 58mm, Bluetooth 2.0, Low Energy"*. The vendor's own sources contradict each other; a definitive radio class is **UNVERIFIED**.
- **384 dots**: not stated anywhere. It follows arithmetically from 8 dots/mm × 48 mm print width, but no Netum document states it → **UNVERIFIED as a citation**.
- **Chipset**: **UNVERIFIED** — no vendor or FCC document found; no FCC ID located for the NT-1809.
- **Apps**: Android **"POS Printer BT multi-language.apk"** from the [setup guide](https://www.netum.net/pages/thermal-receipt-printer-setup-guide); iOS demo app **"POS-Printer"** (screenshot labelled *POS-PrinterV1.0* in Netum's FAQ PDF). Netum also ships *58mm 80mm Receipt Printer SDK for Android OS* and *for IOS OS*.
- **USB VID/PID: `0x0416` / `0x5011`.** Sourced from Netum's own Setup Tools screenshots in [faq_toubleshooting_for_58MM_Bluetooth_Receipt_Printer.pdf](https://cdn.shopify.com/s/files/1/2144/8019/files/faq_toubleshooting_for_58MM_Bluetooth_Receipt_Printer.pdf), where "USB VID Set" defaults to `0416` and "USB PID Set" to `5011`. Cross-checked in the Linux [usb.ids](http://www.linux-usb.org/usb.ids) database: `0416 Winbond Electronics Corp.` → `5011 Virtual Com Port`. Both fields are user-settable from that tool, so a given unit may differ.

### (h) BLE GATT service / characteristic UUIDs
No library names **Netum or NT-1809 specifically** — a real gap. The UUIDs below come from the generic Chinese 58 mm ESC/POS BLE family this printer belongs to.

- **Service `000018F0-0000-1000-8000-00805F9B34FB`, write characteristic `00002AF1-…`** — the canonical pair. Google's Web Bluetooth demo hardcodes exactly these: `server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb")` → `service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb")` ([WebBluetoothCG/demos](https://github.com/WebBluetoothCG/demos/blob/master/bluetooth-printer/index.html)).
- [**bitbank2/Thermal_Printer**](https://github.com/bitbank2/Thermal_Printer/blob/master/src/Thermal_Printer.cpp) enumerates the family in one table: `szServiceNames[] = {"18f0","18f0","ae30","ff00","ff00","ff00"}` / `szCharNames[] = {"2af1","2af1","ae01","ff02","ff02","ff02"}` — i.e. **18F0/2AF1** (generic ESC/POS), **AE30/AE01** (cat-style pixel printers, not ESC/POS), **FF00/FF02** (other Chinese BLE printers). The same file also carries `SERVICE_UUID0("49535343-FE7D-4AE5-8FA9-9FAFD205E455")`, the Microchip/ISSC transparent-UART service used by BLE-SPP bridge modules — a worthwhile fourth candidate.
- The `FFE0/FFE1` pair from the brief did **not** appear in any printer library found; it is the HM-10 serial-module profile. Probe it, but don't lead with it.
- Practical rule: scan 18F0 first, then FF00, then `49535343-…`, and pick the characteristic whose properties include write-without-response. An iOS reverse-engineering write-up uses exactly that fallback list (`"AE30","AE3A" // X6h printer`, `"18F0" // Generic ESC/POS`, `"AF30"`) and comments *"// Prefer writeWithoutResponse for thermal printers"* ([Medium / iOS Lab](https://medium.com/ios-lab/building-a-bluetooth-thermal-printer-app-for-ios-reverse-engineering-image-processing-and-face-5515877e2848)).

### (i) MTU / chunking
- **20-byte chunks are the safe floor.** bitbank2 chunks at exactly 20, with the comment *"to write more than 20 bytes at a time (used to be 48)"*: `while (iLen > 20) { writeValue(pData, 20, bWithResponse); pData += 20; iLen -= 20; }`, plus a `delay(20)` in the connect path.
- Web Bluetooth negotiates for you, so the Google demo can say *"Can only write 512 bytes at a time to the characteristic / Need to send the image data in 512 byte batches"* and slice at 512 — that is a Web-Bluetooth ceiling, not the printer's.
- Native guidance: default GATT MTU is 23 bytes (20 payload); after negotiation (`requestMTU` on Android, `maximumWriteValueLength` on iOS) chunk at **MTU − 3**, use write-without-response, and request `CONNECTION_PRIORITY_HIGH` during the transfer ([Reliable BLE Data Transfer](https://uynguyen.github.io/2026/04/12/Reliable-BLE-Data-Transfer-MTU-Throughput-Chunking/); [react-native-ble-plx MTU wiki](https://github.com/dotintent/react-native-ble-plx/wiki/MTU-Negotiation)).
- Note that [`react-native-bluetooth-escpos-printer`](https://github.com/januslo/react-native-bluetooth-escpos-printer) is **Bluetooth Classic SPP/RFCOMM on Android**, so it is not a BLE chunking reference.

### (j) SPP Classic vs BLE vs MFi
- **Android/SPP: apparently yes.** Retail listings describe the printer as usable with *"Android 4.0 POS SPP agreement or IR, IRCOMM agreement"*, and Netum publishes both an *Android Bluetooth BLE SDK* and an *Android Bluetooth SPP SDK*. Vendor contradictions make this **partially UNVERIFIED** — probe for the SPP UUID `00001101-0000-1000-8000-00805F9B34FB` at runtime.
- **iOS: BLE only, and definitely not MFi.** Netum's FAQ PDF states the printer *"can not connect with the device via it's built- in Bluetooth, must be connected through an application/software as a mediator"* and, in red, *"Note: The printer do not support iOS Air Print function."* A Newegg listing is blunter: the printer *"cannot be discovered directly by Apple / Android devices' built-in Bluetooth function."* No MFi claim appears anywhere → it will never show up in iOS Settings > Bluetooth, and ExternalAccessory is not an option.

### (k) Known gotchas
All from [Netum's own FAQ PDF](https://cdn.shopify.com/s/files/1/2144/8019/files/faq_toubleshooting_for_58MM_Bluetooth_Receipt_Printer.pdf) unless noted.

- **Pairing PIN**: *"Q: What's the printer pin code? A: Please try "0000" or "1234""*. The Setup Tools screenshot shows the *Bluetooth Pinkey* field defaulting to `1234`.
- **No pairing in OS settings** — the merchant must connect from inside an app (see (j)).
- **Self-test**: *"Turn off the printer--keep pressing the "feed" button---tun on the printer--release the feed button after the red lights on."*
- **Garbled characters**: *"Please check whether the printer language corresponde to the language you need to print or not, if they are not match, please change the language by tools."* Setup Tools exposes *Set Printer Baud* (115200 default), *Bluetooth baud* (921600), *Print width* (58 mm/80 mm), *Set Font* and *Set Default Page* (code page) — a wrong width or code page is the usual cause of garbage.
- **Faint output**: *"if the density is not enough, the printed contents will be very light.(Level 3 is recommanded)"* — adjustable by feed-button sequence or Setup Tools.
- **Blank output**: wrong or reversed thermal paper. **Won't power on**: *"Please make sure the tape on the battery has been removed before power on."*
- **Explicitly incompatible POS list**: *"DO NOT SUPPORT: Square / Mac / iZettle / uber eats / Grubhub / Gloriafood / Doordash / Clover / Open Table / MobiPOS Lite / Intuit Gopayment / **Shopify** / FileMake Go / Sum up / Credit Card Reader / Linga POS / Raspberry Pi / Dymo …"*
- **"Connects but prints nothing" is a documented dead end**, in Netum's own words: *"This may be caused by incompatibility between the printer and the application/register/system, there is currently no solution to this situation, we suggest you apply for and return and refund."*
- **Power saving**: the NT-1809DD sheet advertises *"auto sleep, auto awake"* — expect BLE links to drop when idle and need reconnection. Behaviour on the plain NT-1809 is **UNVERIFIED**.

---

## What this means for our wizard copy

1. Every serious vendor starts with **print a status/self-test sheet** — make that step 1, not an afterthought: it yields the IP, MAC and (on Epson) the RED security mode in one action.
2. **Ask for permissions before scanning, and name them.** Lightspeed X-Series' three-line iPad checklist (Local Network, per-app Bluetooth, system Bluetooth) is the best copy in the field — copy its shape.
3. **Epson + network is the "just works" lane on both OSes**; USB is Android-only everywhere except Shopify's own Hub, and Square refuses direct iOS USB outright. Gate lane offers by OS; don't list all four.
4. **Secure Printing / RED is the highest-value Epson troubleshooting item**, and every vendor words it differently — ship the X-Series six-step Web Config path verbatim (default password = printer serial number), with TM Utility as the no-computer alternative.
5. **Static IP or MAC-address addressing belongs in the happy path**, not in troubleshooting: Lightspeed and Square both trace "worked yesterday, broken today" to a moved DHCP lease.
6. **Nobody documents "found but test print fails."** That is an open gap we can win — pair the test print with a specific next action (paper direction, 80 mm/48-column setting, code page) rather than a retry button.
7. **Netum-class printers need a wholly different wizard branch from Epson**: no OS-level pairing, no MFi, no AirPrint, BLE GATT only on iOS. Never tell a Netum merchant to "pair in Settings".
8. **Probe UUIDs in order 18F0/2AF1 → FF00/FF02 → 49535343-…, preferring write-without-response**; chunk at 20 bytes unless MTU negotiation succeeds, then MTU−3 with a small inter-chunk delay.
9. **Set width and code page explicitly on connect.** Garbled 58 mm receipts are almost always a width/code-page mismatch — Shopify (80 mm/48 columns) and Netum (Set Default Page) both prove it.
10. **Say what we don't support, early.** Shopify's "RED printers don't work currently" and Netum's do-not-support list are unglamorous, but they save tickets: fail loudly at detection time, not silently at the first receipt.
