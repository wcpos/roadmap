# Handoff — printer setup wizard, live HITL work (written 2026-09-03 ~16:15, for the next agent)

**Task:** wcpos/roadmap#136 (gotcha catalogue) → #135 (wizard flow) → #134 (in-app wizard). Specs on wcpos/monorepo#1597.
**Mode:** HITL. Paul drives the printer; the agent reads code and logs, records on #136 the same hour, ships bounded fixes through PRs. Small steps, live feedback, no one-shots.
**Lane:** `main`, ships in 1.10.x. Previous handoff (same day, morning): `docs/handoffs/2026-09-03-printer-setup-handoff.md` — its **safeguards section still applies word for word.**

---

## ⚠️ Safeguards (unchanged, plus today's practice)

- No device credentials, no admin login, no probing beyond the app's own documented status checks (empty ePOS status job on 443; `DLE EOT` over 9143), on the one designated printer, and **say what you are sending before you send it**. Worked well today as: announce → send once → report the timestamped result.
- **Never any bytes to raw 9100 on the Epson.** Today adds: **never send a print job from the shell without Paul's explicit yes** for that specific job (he gave one, for one structured ePOS XML job at 14:05:14; it does not carry over).
- Physical/admin steps (Web Config, power-cycle, Test Print) are Paul's.
- **Paul's frame (memory `feedback-printer-work-is-for-one-click-setup-not-for-printing`):** the desk printers are test rigs. Every finding = signature + cause + wizard remedy. "I don't care about printing. I want to get as close to a one-click set up for my users as possible." Don't spend session time getting his printer to print unless it unblocks the next signature.

---

## What was learned today (all on #136, with timestamps)

Printer: EPSON TM-m30III wireless, `192.168.1.131`, fw 13.21, **Secure Printing ON** (read from Web Config → Print Settings at 12:45). Web Config: no cert warning now; admin login is Paul's.

1. **Gotcha #9 — Server Direct Print was holding ePOS-Print.** Web Config → Services showed *Server Direct Print Enable*, two `cloudprint.wcpos.com` URLs at 5 s each (leftover August experiment), ePOS-Device Enable, ePOS-Print Enable but locked by those two. That was the 503 from 02 Sep 20:57 onward. **Remedy verified:** Server Direct Print → Disable → Set → restart → 443 status job `200 success="true"` at 12:34:58. Wizard signature: 443 POST = 503 + web UI 200 + `:80 → 404` + 9143 open ⇒ "another print service is using ePOS-Print".
2. **Gotcha #10 — a healthy ePOS status job does not mean ePOS can print under Secure Printing.** With 443 answering status in 1.5 s, the app's `<command>` test print hung to the 15 s main-process timeout, three times (12:37, 12:41 at 48 cols; 14:11, 14:20 at 443/42 cols, the latter in a clean post-power-cycle state). Dialog says *"Test print failed … did not respond on Epson's HTTPS ePOS port"* (support details: `EPOS HTTP request … timed out`). Nothing printed.
3. **Gotcha #11 — raw ESC/POS over TLS 9143 is held too.** Spec D (9143-first Electron lane) was built, reviewed, and live-tested: scan → `Discovered: 192.168.1.131:9143`, width 48, `print-raw-tls sent 916 bytes` (13:41:16 and 13:47:09) → **no slip**, and the printer jammed (443 status timing out, then 503) until a **power-cycle** at 14:04 — longer than the ~4 min plaintext hold. Dialog said *"Test print sent to EPSON TM-m30III"* (Spec B gap). Epson's eRED guide (Rev. D, retrieved via `r.jina.ai` proxy; the PDFs 403 to direct fetches) says: ESC/POS applications "will not run unless used via a USB/Serial/Parallel interface"; "Secure Printing Enabled — must be compliant with RED to print a job"; 9143 is a "service for obtaining printer information". The port-matrix line "9143 TLS RAW — can print" is for Epson's own authenticated drivers/SDKs. Web Config has no TLS RAW toggle.
4. **What prints with Secure Printing ON: structured ePOS-Print XML over 443.** One authorised job (`<text>` header, `<text>` 48-col ruler, `<feed line=3>`, `<cut type=feed>`) at 14:05:14 → `success="true" status=251658262` in 1.8 s, **slip printed, ruler to the edge (48 confirmed on paper)**. Same lane on Electron and in the browser, acknowledged per job.
5. **Width 48 from identify is done** (row click + typed IP), verified on paper.
6. Smaller notes: the dialog re-runs identify on every field change (three zero-byte 9143 probes in 18 s — debounce per address in the wizard); the ePOS handler logs nothing (gotcha #6, still true); a held job's dialog says "sent"; the error panel labels Electron as "Platform: web / Page protocol: HTTP" (cosmetic, not filed); yesterday's 16:25 `<command>` print with SP "ON" is **unexplained** — best guess SP was actually off then; do not cite it.

## Decisions

- **Spec D withdrawn.** wcpos/monorepo#1809 and wcpos/electron#402 **closed** (branches `codex/raw-tls-lane`, `codex/print-raw-tls` kept; worktrees `~/Projects/monorepo-v2/.worktrees/codex-raw-tls-lane`, `~/Projects/monorepo-v2-worktrees/electron-raw-tls` still on disk — remove when convenient). One review lesson worth keeping: Codex raced the *print job* against a 2 s timer; a timed-out IPC call keeps running in main and prints later. Race probes, never jobs.
- **Spec E approved by Paul (~16:00): Epson network printers print structured ePOS-Print XML.** Full text: #1597 comment 5525583319. `renderEposXml` in `packages/receipt-renderer` beside `render-escpos.ts` (same AST, 17 node kinds → `<text>`/`<feed>`/`<cut>`/`<pulse>`/`<image>`/`<barcode>`/`<symbol>`), `PrinterTransport.printMarkup?` + `supportsMarkup?`, Epson ePOS adapters (web + Electron) implement it, service prefers it on the ePOS lane. Budget 500 non-test lines. `<command>` stays only for `printRaw` callers.

## Spec E state (updated 16:40)

- **PR open: wcpos/monorepo#1819** (branch `codex/epos-xml-lane`, commit 9410fede67 on origin/main 1e1118dde8). Codex implemented; Claude reviewed line by line, added one fix (Electron `NetworkAdapter` never memoises a failed ePOS probe), verified: receipt-renderer 142 tests, printer 504 tests, tsc ×3, eslint, `git diff --check`, mutation check (removing `&` escaping fails 4 tests), and a real render of the drawer template. Budget 274 + 150 non-test lines. **Not merged — gated on the live acceptance below.** Known follow-up (not in the PR): the "Full receipt raster" profile toggle still sends bytes via `printRaw` → `<command>` on an ePOS lane → held under Secure Printing (off by default).
- **Dev build worktree `~/Projects/monorepo-v2/.worktrees/printer-gotchas-electron` now has `live-epos-check` reset to `codex/epos-xml-lane`** (the raw-TLS code is gone from it; `printableLanes` no longer contains raw-tls). `apps/electron` submodule still detached at a307e2f (has the unused `print-raw-tls` handler plus #373's `print-epos-http`; harmless). Expo `:8088` + Forge still running from 13:21; renderer changes need only ⌘R.

## Live acceptance for Spec E (Paul drives; record on #136)

Dev build: worktree `~/Projects/monorepo-v2/.worktrees/printer-gotchas-electron` (branch `live-epos-check` = origin/main 9fc97f1dbf **+ codex/raw-tls-lane merged at 5e68ac328b**; `apps/electron` submodule detached at a307e2f = the closed print-raw-tls branch). Already on the Spec E branch (see above); ⌘R is enough, no Forge restart (no main-process change). Expo on `:8088` and Electron Forge run in two Terminal windows (relaunched 13:21 via the pattern in the monorepo's `.claude/skills/electron-dev/SKILL.md` step 7: write the osascript to a temp file, then run it; kill only the Forge/Electron pids, keep Expo).

Secure Printing ON, Server Direct Print OFF (as left), no printer-side change:
1. Scan Network → row `Discovered: 192.168.1.131:443`, width 48.
2. Test Print → **slip prints**, ruler to the edge; the dialog should reflect the printer's ack (Spec B may still say "sent"; note it).
3. A real order receipt; Open drawer (`<pulse>`).
4. Browser POS on 443, same three.
5. Secure Printing OFF → still prints. Then the deliberate breakages (wrong port, port 80, cable out, wrong subnet).

`main.log` (`~/Library/Logs/WCPOS/main.log`) shows nothing for ePOS sends; the paper and the dialog are the evidence. Re-arm: `tail -n 0 -F ~/Library/Logs/WCPOS/main.log | grep --line-buffered -E 'print-raw-tls|print-raw-tcp|print-epos|\[error\]'` to catch any raw write (there must be none for the Epson).

## Printer state as left

Secure Printing ON, Server Direct Print **Disable** (Paul may re-enable later; the cloudprint URLs are still in the form), ePOS-Device Enable, Status Notification Disable. Last known good: 443 status 200 at 14:05; last content jobs: structured XML printed 14:05:14; `<command>` held 14:11 and ~14:20 (those did not jam the status lane on 02 Sep/12:39 — verify before assuming it's clean).

## Remaining cells after Spec E

Spec B (acknowledged test print — trivial on the ePOS lane now, still needed for raw-only printers); the deliberate breakages; Netum NT-1809 over USB on Electron, then BLE on iOS/Android; browser POS WebUSB/WebBluetooth; then the wizard flow itself (#134 lazy chunk, `printer-setup` i18n namespace, prototype `docs/prototypes/2026-09-02-printer-scan-first-flow.html`), copy pass, troubleshooting content (today's gotchas #9–#11 give it three verified branches).
