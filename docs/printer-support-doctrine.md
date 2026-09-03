# Printer support doctrine

**Status:** ruling, 2026-09-03 (Paul, after the TM-m30III cell-1 walk on wcpos/roadmap#136).
**Applies to:** every printer lane, every platform, every session that touches printer setup.
**Living copy:** `packages/printer/README.md` in wcpos/monorepo (wcpos/monorepo#1831) (doctrine + the Lessons log that every printer PR appends to). This file records the ruling and the reasoning; if the two drift, the README next to the code is the one that must be true.

## Why this exists

Getting one Epson TM-m30III to print reliably over the network took two people, every tool and doc on the internet, and roughly three sessions across two days. The post-mortem (#136, 2026-09-03 evening) found the time went to four things, in order of cost:

1. **No observability.** The printer subsystem logged nothing. Every finding was inferred from paper and dialog text; two of the day's bugs (an ePOS hold, a dead mDNS socket) each cost a reproduction run that one log line would have replaced.
2. **Building before reading.** Two lanes were built (raw TLS on 9143, ePOS `<command>`) before anyone read Epson's own port table, which says in one line which lanes print with Secure Printing on. Shopify's and Lightspeed's help pages already carried the merchant-facing answer.
3. **The app lied.** "Detected: Epson" came from the profile name, "sent" was shown for discarded jobs, an unreachable printer produced certificate advice. Wrong messages cost real minutes because we trusted them.
4. **Hardware is strange.** The printer-side hold is documented nowhere. Some time is unavoidable; the gotcha catalogue exists to pay it once.

We cannot buy every printer. We do not need to: the number of *lanes* is small and vendors do not invent new ones. The doctrine below is how we support the long tail without owning it.

## The rules

### 1. Research gate before any printer spec
No lane, adapter, or wizard step gets a spec until these are written down in the spec's first section, with links:
- **The vendor's own developer docs** for the lane (Epson: ePOS-Print XML manual, ePOS SDK, the eRED/Secure Printing guide with its port table; Star: WebPRNT, CloudPRNT, mC-Print docs; generic: the ESC/POS command reference the printer claims).
- **Three POS vendors' help pages** for the same printer family (Shopify, Lightspeed, Square, Odoo, Loyverse are the usual ones). What they support, on which lane, and what they tell merchants to change on the printer. If all of them tell merchants to flip a setting, that is the wizard remedy, not a lane to engineer around.
- **The port/lane table** for the vendor: which ports print, which acknowledge, which are held or quarantined, under each security setting.
Spec D (9143) would not have been written under this rule. It costs an hour and saves a day.

### 2. Observability is a feature, not a debug aid
Missing logging in the printer path is a defect (Paul, 19:02, memory `feedback-printer-subsystem-logs-everything`). Every handler logs inputs, outcome, and elapsed time; every probe logs what it sent and what came back; renderer lines reach the same `main.log` as main-process lines (wcpos/electron#404, wcpos/monorepo#1828). When a live finding cannot be explained from the log, the first fix is the log line that would have explained it, before any theory.

Next step on this rule: a **diagnostics export** in the app (main.log + probe matrix + identity + platform), so a merchant's ticket arrives as a signature and their printer becomes a test rig we never bought.

### 3. Prefer lanes that acknowledge
ePOS-Print, WebPRNT, CloudPRNT and IPP return a result per job. Raw 9100 is fire-and-forget and, on RED-era Epsons, actively harmful (quarantine). Order of preference: acknowledged lane → encrypted raw only where the vendor documents it for third parties → plain raw as the generic fallback with honest wording ("sent, could not confirm it printed"). A raw fallback on a vendor that has an acknowledged lane must fail loudly, never send bytes (gotcha #18).

### 4. Design for signatures, not models
The wizard classifies what a printer *answers* (which ports open, which protocols respond, which HTTP codes, which states) and maps signature → cause → remedy. Model names are hints for defaults (width, drawer pin), never for status. A label that says "Detected" must come from a probe result; "No response from <ip>" is a first-class outcome with its own copy (gotchas #19, #20). Every new printer session adds signature rows to #136; that catalogue, not a model list, is the product.

### 5. Say what we support, in tiers
- **Verified:** on a desk, walked through the cell-1 script (TM-m30III over network; next: Netum NT-1809 USB/BLE).
- **Documented:** from vendor docs and the three competitors' pages, same lane family, not on a desk.
- **Generic:** raw ESC/POS over 9100/USB/Bluetooth, best effort, honest wording.
Publish the list. A printer outside all three is "unsupported" in the UI, with the diagnostics export as the path to becoming documented.

### 6. HITL sessions run a fixed script
Infrastructure first, then the flow grown step by step against the real device with live feedback (memory `feedback-step-through-hitl-work-with-live-feedback`). The script per lane: research gate → scan/identify → width → test print → drawer → real receipt (image + barcode) → browser/native client → security setting flipped → the five breakages (wrong port, alternate port, raw port by hand, wrong subnet, device off). Record every finding on #136 the same hour as signature + cause + remedy. Prove a lane on paper before building on it.

### 7. The agent side
- The safeguards in `docs/handoffs/2026-09-03-printer-setup-handoff.md` apply to every session: no device credentials, no admin login, only the app's own documented probes, never raw 9100 on an Epson, no shell print job without an explicit yes for that job.
- Announce → send once → report with a timestamp.
- Do not chase client-side theories before the log has been read; if the log cannot answer, add the log line first.
- Model-specific findings expire; re-verify on firmware updates.

## Lane taxonomy (the whole world, as of 2026-09)

| Lane | Acknowledges | Vendors | Notes |
|---|---|---|---|
| Epson ePOS-Print XML over HTTPS 443 / 8043 | yes | Epson TM-i / TM-m / intelligent | The only lane that prints with Secure Printing ON; browser-capable |
| Epson ePOS over HTTP 80 / 8008 | yes | Epson | Secure Printing OFF only |
| Star WebPRNT (HTTP) / CloudPRNT | yes | Star mC-Print, TSP | Browser-capable |
| IPP 631 | yes | Some Epson/Star, office printers | Not a receipt lane on its own; identify signal |
| Raw ESC/POS TCP 9100 | no | everyone | Generic fallback; quarantined on RED Epsons |
| Raw over TLS 9143 | no | Epson | Documented for Epson's own drivers; held for third parties under SP |
| USB (WebUSB / Electron / Android host) | no | everyone | No iOS |
| Bluetooth classic (SPP / MFi on iOS) | no | Epson, Star, generic | iOS needs the MFi ExternalAccessory path + protocol string |
| BLE | no | Netum and other generics | Chunked writes, per-model characteristics |

## Pointers
- Gotcha catalogue: wcpos/roadmap#136. Wizard flow: #135. In-app wizard: #134. Specs: wcpos/monorepo#1597.
- Vendor docs used: Epson eRED guide Rev D (`download4.epson.biz/sec_pubs/bs/pdf/eRED_POS_revD.pdf`, fetch via the jina proxy), ePOS-Print XML manual, Shopify TM-m30III troubleshooting, Lightspeed X-Series and K-Series printer pages, Odoo ePOS printers page.
- Pre-flight for the mobile lanes: `docs/handoffs/2026-09-04-printer-mobile-preflight.md`.
