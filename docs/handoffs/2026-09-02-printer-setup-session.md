# Handoff — printer setup wizard, live HITL session (2026-09-02)

**Task:** wcpos/roadmap#136 (printer-setup gotcha catalogue) → feeds #135 (wizard flow) and #134 (landing).
**Mode:** HITL — Paul drives two desk printers on each platform; the agent reads code, watches logs, records. Build infrastructure first, then grow the flow step by step against real hardware. Never one-shot.
**Lane:** `main`, ships in 1.10.x.

---

## Where the work stands

### Merged
- **wcpos/electron#373** (6d651d8) — main-process `print-epos-http` handler (HTTPS with request-scoped `rejectUnauthorized: false`, 1–30 s timeout, 1 MB cap).
- **wcpos/monorepo#1598** (5639aac596) — Electron network path for Epson: probe `443 → 8043 → 80 → 8008` with an empty ePOS status job, print via acknowledged ePOS-Print, raw 9100 only as fallback.
- **Verified live earlier today:** TM-m30III with Secure Printing **ON** printed via ePOS/443, no printer-side change. This is the core fix and it works.

> ⚠️ **Release note:** the monorepo `apps/electron` submodule pointer must move past 6d651d8 before a packaged Electron build carries the main handler. Today's monorepo merge only lands the renderer half.

### Open
- **wcpos/monorepo#1775** — "identify printers at scan time" (Spec A). Commits `a5a490e6ff` + `a226a575b9` on branch `codex/identify-at-scan`. CI/review not yet driven to green; **do not merge** until the live blocker below is resolved.
- **wcpos/electron#374** — cert-trust decision: accepted the request-scoped risk; CodeQL alert #23 dismissed. **wcpos/electron#400** — follow-up: trust-on-first-use fingerprint pinning (not started).
- **wcpos/wiki#1088** — bridge contract v1 spec (written by a parallel session; four deltas from us posted as a review comment).
- **wcpos/monorepo#1597** — carries **Spec A** (in #1775) and **Spec B** (acknowledged test print — *not started*).

### Decisions recorded this session
- **Placement reversed (#126 amended, #120 pointed):** the printer wizard is built **in the app** as a lazy chunk with its own `printer-setup` i18n namespace, **not** a mini-app. The mini-app host/bridge/catalog from #1763 stand for external apps (shipping-calculator class). Landing ticket **#134** re-scoped accordingly; **#135** keeps the prototype.
- **Flow chosen (#135):** "autopilot" variant — scan on open → identified printers → one ready printer prints the test page without asking → *"Did the test page print?"* → save. Address/port/vendor/width under Options, never required. Prototype: `docs/prototypes/2026-09-02-printer-scan-first-flow.html`.
- Memory written: `printer-wizard-placement-in-app-not-mini-app`, `feedback-step-through-hitl-work-with-live-feedback`.

---

## Gotchas logged on #136 so far
1. **Epson Secure Printing (EU RED)** — ON by default on every wireless-capable Epson placed on the EU/UK market since 2025-08-01. With it on: raw 9100 / plain-HTTP ePOS / 8008 are silently held ~4 min then discarded; only TLS lanes (443 ePOS, 9143 raw-TLS, 8043) print. Fix = the #1598/#373 ePOS-over-443 lane. **Fixed and merged.**
2. **Vendor from Bonjour name only** — `detectVendor` keys on the word "epson"/"star"; the TM-m30III advertises `_ipp` + `_http` only (no `_pdl-datastream`), so the app maps it to 9100 by rule. Only an endpoint probe finds the working port. Model string is in the TXT (`ty=EPSON TM-m30III Series`), so width-from-model is viable.
3. **Width default mislabelled** — "80mm standard (42 chars)" steers merchants wrong; an 80 mm Epson is 48. Identify now sets 48 from the model.
4. **A probe is a job** — *(current blocker, see below)* any bytes written to raw 9100 (even a 3-byte DLE EOT status request) quarantine a Secure-Printing Epson for ~4 min, jamming every lane including ePOS.

---

## Session 2 (20:30–21:40) — rounds 2 and 3, and the lane decision that came out of them

Paul left at 21:40; printer went off the network at ~21:23 (likely unplugged). Nothing below is verified live past the shell tests noted.

### Round 2 — resolved: the "fix didn't work" scan ran before the fix existed
`~/Library/Logs/WCPOS/main.log` (Electron main, +0200): raw 3-byte writes to 9100/631/**9143** at 19:56:37 and 19:57:44; a226a575b9 was committed at 20:02:32 and merged into the dev build at 20:02:44. The 9143 touch only exists in a5a490e6ff's code. Hypothesis (b) ruled out by reading. Served bundle contains "HTTP lanes first". Recorded on #136 (gotchas #5, #6).

### Round 3 — a different failure: ePOS-Print on 443 says 503 while the printer is healthy
After Paul reloaded and re-tried, the app wrote nothing raw (log clean, watch silent) and Test Print still failed. Shell evidence (#136 comment, gotchas #7, #8):
- `POST service.cgi` on 443 → **HTTP 503**, empty body, `Server: lighttpd`, continuously 20:57 → 21:23 (then the printer dropped off the network). Same POST answered `success="true"` at 20:35. Web UI on 443 fine throughout.
- **8043 is ePOS-Device (socket.io)**, answers 200 to anything — NOT a print lane. `parseEposResponse` rejects it, so the probe is safe, but never treat 8043 as a 443 fallback.
- **9143 raw-over-TLS works**: handshake against the printer's own cert, a one-line ruler print delivered (Paul has not yet confirmed it printed — ask), `DLE EOT` answered: n=1 `0x16` online, n=2/4 `0x12` cover closed, paper present.
- Candidate causes of the 503, unresolved: (a) something holding the device via ePOS-Device (exclusive control) — e.g. the printer's Web Config tab Paul opened to accept the cert; (b) the plaintext jobs the app posts to :80 (identify's `securePrinting` probe fires whenever 443 answers) and :8008 (`probeVendorEndpoint` GET, and the print-path probe after 443 fails), renewed by every Test Print attempt. Epson's eRED port table: 80/8008/8009 blocked under Secure Printing; 443/8043/8143/9143 allowed.

### Decisions / recommendations made to Paul (he asked the questions; nothing built)
- **Width never came from HTTP** — it comes from the Bonjour TXT / service name → `identify-models.ts` table. Paul's premise "HTTP is only good for width" corrected.
- **Electron Epson lane should be 9143 raw-TLS first**, ePOS/443 as fallback and as the browser lane. Needs a `print-raw-tls` main handler in wcpos/electron (same shape as `print-raw-tcp`, `tls.connect`, request-scoped `rejectUnauthorized:false`). DLE EOT over 9143 gives Spec B its "did it print" status. **Drop identify's plaintext :80 securePrinting probe**; never post plaintext to 80/8008 on a host whose 443 or 9143 answered.
- **Other vendors have no 9143 equivalent** (vendor sweep `docs/superpowers/specs/2026-08-26-red-secure-printing-vendor-sweep.md` in wcpos/docs + today's searches): Star = plain 9100 + WebPRNT 80/443; Bixolon = plain raw port (Web Print SDK is host-side on 18080); Citizen/SII/generic = plain 9100 only. Lane table: Epson → 9143/443; Star → 9100/WebPRNT; rest → 9100, browser-unreachable.
- **Auto-detect + width for other vendors = same pipeline, more inputs** (proposed as **Spec C** on #1597, not yet written): forward mDNS TXT `ty`/`product` into identify (electron main currently passes only `service.name`); widen the model table (Bixolon, Citizen, model-number width rule XP-58/XP-80 etc., explicit Netum NT-1809 → 32); USB VID table (Epson 04b8, Star 0519, Bixolon 1504, Citizen 1d90, STMicro 0483 for clones); ESC/POS `GS I 67` model query on raw lanes only after HTTP lanes stayed silent; ruler question stays the universal floor. ~150 lines, after Spec B.
- **Bonjour** = open mDNS/DNS-SD; Electron runs its own listener (`bonjour-service`), OS support irrelevant; **Windows Firewall prompt** declined = discovery finds nothing forever (wizard copy). Native uses Epson/Star SDK UDP discovery, not mDNS. Generic printers don't advertise at all → Electron needs a zero-byte 9100 connect sweep (new IPC; skip mDNS-identified hosts); "nothing found" copy must say: hold feed on power-up → self-test page → type the IP.

### PRs (state at 11:05, 09-03)
- **wcpos/monorepo#1781 — MERGED** to main at 10:42 (6b68fdaaad) on Paul's repeated "guide these through to merge". Not verified live.
- **wcpos/monorepo#1775 — MERGED** 11:32 (d565b2cdca). Was head **a70445f8fe** (fbd0074141 + a70445f8fe: CodeRabbit caught that the Epson-never-9100 rule left `notReceiptPrinter` true on refused ePOS candidates; `namedClosed` now uses raw/IPP entries only). Waiting on the Merge Gate, then merge. A local pre-merge hook (`merge-thread-walk`) requires a reply on every review thread — all replied as of 11:15. Overnight the review-fix bot pushed two commits: 7854ffa6ee (pre-identification generation check, CodeRabbit finding — kept) and 36357be796 (OPFS targeted-recovery change to stop dev RedBox overlays breaking the iOS Maestro flows — right finding, wrong PR: out of scope and it broke Lint/Merge Gate via the Electron sync gate). Reverted in 8704573062; tracked as **wcpos/monorepo#1796** with the bot's commit as the candidate fix (needs a wcpos/electron companion + submodule bump). Added 0bec79d4f6: a host already named Epson is never touched on 9100 even when no HTTP lane answers (this morning's 503 case). Branch is printer-only vs main; 12 identify / 18 electron-hook / 3 native-hook / 4 adapter tests pass, tsc + eslint clean. Triage table on the PR has 13 rows with SHAs. ⚠️ The bot reacts to reviews by pushing to this branch — compare heads before any further push.

### Tomorrow, in order
1. Plug the printer in. Check 443 from the shell before touching the app: `curl -sk -m 6 -o /dev/null -w "%{http_code}\n" -X POST "https://192.168.1.131/cgi-bin/epos/service.cgi?devid=local_printer&timeout=3000" -H 'Content-Type: text/xml' --data '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"></epos-print></s:Body></s:Envelope>'` → expect 200. If 503 persists after a power-cycle with no browser tab open on the printer, cause (a) is out and (b)/firmware state is in; check Web Config → ePOS-Print enabled.
2. Ask Paul: did the 9143 ruler line print (~20:58)? Did he have the printer's Web Config open in a tab during the 503?
3. Split cause (a)/(b): with 443 = 200 and nothing else touching the printer, POST the empty job to plain `http://192.168.1.131:80/...` once, re-check 443 at +3 s/+15 s/+45 s/+2 min. (Script pattern in the #136 round-3 comment; the earlier run never got a 200 to start from.)
4. Both PRs are merged and `live-epos-check` = origin/main as of 11:40 (merge 9fc97f1dbf). Reload Electron (⌘R), then the scan check: no `print-raw-tcp … :9100` line for the Epson, width 48, then Test Print.
5. Then decide with Paul: 9143-first lane (electron handler + transport) and dropping the :80 probe — write it as a spec before Codex touches it. Spec B still next in the queue; Spec C after.

## Environment (as left running)

- **Dev build worktree:** `~/Projects/monorepo-v2/.worktrees/printer-gotchas-electron`, branch `live-epos-check` = `origin/main` + `codex/identify-at-scan` merged; `apps/electron` submodule at the #373 head (`fe5ac62`).
- **Codex work worktree:** `~/Projects/monorepo-v2/.worktrees/codex-identify-at-scan`, branch `codex/identify-at-scan` (this is what #1775 tracks — commit fixes here, then merge into the dev build to test).
- **Two Terminal windows:** Expo dev server on `:8088`, Electron Forge (main-process logs). Both were gone by 11:45 on 09-03 (not the watchdog — windows closed); relaunched from the dev worktree at 11:50 via the `electron-dev` skill pattern, bundle verified to contain the merged identify/adapter code. Main-process log file: `~/Library/Logs/WCPOS/main.log` (`print-raw-tcp` logs every send; `print-epos-http` logs nothing).
- **Codex worktree #2:** `~/Projects/monorepo-v2/.worktrees/codex-epos-port-cache`, branch `codex/epos-port-cache` (= #1781).
- **Printer 1:** EPSON TM-m30III (wireless variant), `192.168.1.131` / `EPSONB0001C.local`, 80 mm roll, **Secure Printing ON**, Web Config at `https://192.168.1.131`. ⚠️ Admin password is **not** the serial (XBVW055889 was rejected 09-03 10:45) — Paul has it. Firmware 13.21. **09-03 10:33: ePOS-Print on 443 returns 503 for every POST, persisting across a power cycle; web UI 200, :80 → 404 (SP still on), 9143 raw-TLS online and answering `GS I` queries. It is a printer setting, not a hold — Paul to check Web Config → ePOS-Print / print services. Do NOT Scan Network on the current dev build: with no HTTP lane answering, identify falls through to the raw 9100 touch that quarantines the printer.**
- **Printer 2 (not yet touched):** Netum NT-1809 — 58 mm portable, **BLE + USB only, no LAN**, generic ESC/POS, not visible to OS Bluetooth pairing UI. Known gotcha before testing: the native Add Printer form refuses Bluetooth/USB for `vendor: generic`, so on iOS/Android it can't be configured over Bluetooth today.

## Remaining cells (the walk)
- Finish cell 1: resolve the blocker, then the deliberate breakages (wrong port, port 80, cable out, wrong subnet) with Secure Printing off.
- **Spec B** (acknowledged test print, #1597) — hand to Codex next; the "sent, did it print?" step needs it for raw-only printers.
- Netum over USB (Electron), then BLE on iOS/Android dev clients.
- Browser POS: WebUSB/WebBluetooth, Chromium local-network prompts.
- Then the wizard flow itself (prototype → real in-app screens, #134), copy pass, troubleshooting content.

## Working rules
- Worktree from `origin/main`; never edit the main working tree. Submodule `core.worktree` landmine: after any `git submodule update --init`, rerun `~/.claude/scripts/fix-submodule-core-worktree.sh ~/Projects/monorepo-v2` and check `git diff --cached --stat` shows the expected file count before any submodule commit.
- Tests capped: `--maxWorkers=2`, one suite at a time.
- Computer use (driving simulators/native windows) → delegate to Codex; plain web pages are fine directly.
- Deliver artifacts as local files and `open` them (hosted links 404 for Paul).
- Codex implements bounded specs; Claude reviews line-by-line, mutation-checks one test, verifies live before merge.
