# Handoff — printer setup wizard, live HITL work (written 2026-09-03 ~18:00, for a cold restart)

**Task:** wcpos/roadmap#136 (gotcha catalogue) → #135 (wizard flow) → #134 (in-app wizard). Specs on wcpos/monorepo#1597.
**Mode:** HITL. Paul drives the printer; the agent reads code and logs, records on #136 the same hour, ships bounded fixes through PRs. Small steps, live feedback, no one-shots.
**Lane:** `main`, ships in 1.10.x.
**Read the safeguards section of `docs/handoffs/2026-09-03-printer-setup-handoff.md` before anything.** It still applies verbatim: no device credentials, no admin login, no probing beyond the app's own documented status checks (empty ePOS status job on 443; `DLE EOT` over 9143), never raw 9100 on the Epson, no shell print job without Paul's explicit yes for that specific job, physical/admin steps are Paul's. Paul's frame (memory `feedback-printer-work-is-for-one-click-setup-not-for-printing`): the desk printers are test rigs; every finding = signature + cause + wizard remedy; get to one-click, not to a printed slip.

Earlier handoffs this day, for the blow-by-blow: `2026-09-03-printer-setup-handoff.md` (morning), `-handoff-2.md` (afternoon, Spec D). This file supersedes both for current state.

---

## Headline: Spec E works, one caveat left, PR open and NOT merged

**wcpos/monorepo#1819** (branch `codex/epos-xml-lane`, commit 9410fede67; Codex-implemented, Claude-reviewed line by line, one fix added — Electron `NetworkAdapter` never memoises a failed ePOS probe). Epson network printers now print **structured ePOS-Print XML** over 443 instead of ESC/POS-in-`<command>`. `renderEposXml` in `packages/receipt-renderer` (walks the existing receipt AST; `<text>`/`<feed>`/`<cut>`/`<pulse>`/`<image>`/`<barcode>`/`<symbol>`; rows reuse the ESC/POS layout helpers), `PrinterTransport.printMarkup?`/`supportsMarkup?`, the web + Electron Epson ePOS adapters print markup, `PrinterService` prefers it on the ePOS lane and still encodes bytes everywhere else. Tests: receipt-renderer 142, printer 504, tsc ×3, eslint, mutation-checked; 274 + 150 non-test lines (in budget).

**Why Spec E and not the earlier lanes:** on this TM-m30III (fw 13.21, Secure Printing ON — EU/UK default) every ESC/POS byte stream over the network is held and never printed: raw 9100, raw-TLS 9143, and ESC/POS hex inside ePOS `<command>`. Structured ePOS XML over 443 prints and is acknowledged. Full evidence + lane table on #136. **Spec D (9143 raw-TLS) is withdrawn — PRs wcpos/monorepo#1809 and wcpos/electron#402 are CLOSED** (branches kept: `codex/raw-tls-lane`, `codex/print-raw-tls`).

### Live acceptance state (gates the #1819 merge)

Done, Secure Printing ON, no printer-side change:
- ✅ Scan Network → `Discovered: 192.168.1.131:443`, Detected Epson, width **48** (verified on paper earlier).
- ✅ **Test Print printed** (17:49) — Paul: "It worked!!!". No raw write in main.log. This is Paul's 02-Sep bar ("Click Scan Network and it just works") met on a RED Epson with security left on.

Still to do before merge: a real order **receipt**, **Open drawer** (`<pulse>`), the **browser POS** on 443, then **Secure Printing OFF** re-run, then the deliberate breakages (wrong port, port 80, cable out, wrong subnet).

---

## The one open blocker: "prints once, then the next job hangs"

Reproduced twice today. First ePOS job after the printer is idle prints; a second job sent seconds later is held and times out (15 s, dialog "Test print failed … did not respond"). Then:
- 14:05 structured job printed → 14:11 next job hung → needed a power-cycle (status stuck ~3 h until 17:47 cycle).
- 17:49 Test Print printed → Paul pressed **Save** (which re-runs the test print) → hung → but this time the 443 status job answered **200 again at 17:55:39** with nothing touching it, i.e. it **self-cleared in ~2 min**.

So the "jam" is a printer-side hold between back-to-back jobs, not a client bug (the app posts one stateless HTTPS request per job via `print-epos-http`, holds no connection) and not always power-cycle-required. Strongest lead (Epson ePOS SDK docs, web sweep on #136): **ePOS-Device exclusive control** — the device serves one session; back-to-back synchronous jobs collide. ePOS-Device is **Enable** in Web Config right now.

### Next experiments (next session, Paul drives, keep the shell out so timing is clean)
1. Power-cycle → Test Print (prints) → immediately Test Print again (expect hang) → poll 443 status to time the self-clear → Test Print (expect prints). Fixed ~N-min hold, or power-cycle needed?
2. Web Config → Services → **ePOS-Device → Disable → Set → power-cycle → two Test Prints.** Both print ⇒ exclusive control is the cause; wizard/setup remedy = disable ePOS-Device (Paul-side, one-time, resets on firmware update). Still fails ⇒ ePOS-Device exonerated; look at an inter-job settle or a status-poll-until-ready before each ePOS POST in the app (or the spooler/`onreceive` async model).
3. Frequency reality check: a merchant prints one receipt per sale with gaps. Does real-world spacing avoid this entirely? If yes, it is a troubleshooter note, not a #1819 blocker.

Do NOT let this hold merge if (3) says spacing avoids it and (1) says it self-clears — record it as a known gotcha and ship the lane.

---

## Also open (own PRs, after acceptance — Paul to confirm each)

- **Gotcha #12 — success feedback hidden behind the modal.** A successful Test Print's only cue is a snackbar "Test print sent to EPSON TM-m30III" rendered *behind* the Add Printer modal; failures show inline, successes don't. Also still says "sent" though the ePOS lane returns `success="true"`. Fix in a small own PR: render the success state inline in the dialog like the failure panel, and (Spec B wording) "Printed on <name>" when acknowledged / "Did the test page print?" otherwise. Logged on #136; NOT filed as an issue (the dangling-issues hook blocks that — do the work in its PR, don't park it in an issue).
- **Full receipt raster** profile toggle still sends bytes via `printRaw` → `<command>` on an ePOS lane → held under Secure Printing. Off by default. Noted in the #1819 PR body. Fold into Spec E follow-up or its own PR.
- **Spec B** (acknowledged test print — `TestPrintResult`) is now trivial on the ePOS lane (the printer returns success + status bits); still needed for raw-only printers. Was always queued after this.

---

## Environment (as left ~18:00)

- **Dev build worktree:** `~/Projects/monorepo-v2/.worktrees/printer-gotchas-electron`, branch `live-epos-check` **reset to `codex/epos-xml-lane`** (= the #1819 code; raw-TLS code is gone from it; `printableLanes` no longer has raw-tls). `apps/electron` submodule detached at a307e2f (carries the now-unused `print-raw-tls` handler + #373's `print-epos-http`; harmless, don't commit the pointer). Expo `:8088` + Electron Forge running in two Terminal windows since 13:21. Renderer changes need only ⌘R; no Forge restart (no main-process change in Spec E). Served bundle confirmed to carry the Spec E code (renderEposXml, printMarkup).
- **Main-process log:** `~/Library/Logs/WCPOS/main.log`. `print-raw-tcp`/`print-raw-tls` log every send; **ePOS-Print logs nothing** (gotcha #6) — for an ePOS job the paper + the dialog are the only evidence. Re-arm to catch any stray raw write (there must be none for the Epson): `tail -n 0 -F ~/Library/Logs/WCPOS/main.log | grep --line-buffered -E 'print-raw-tls|print-raw-tcp|print-epos|\[error\]'`.
- **Printer:** TM-m30III, `192.168.1.131`, Secure Printing **Enable**, Server Direct Print **Disable**, ePOS-Device **Enable**, Status Notification Disable. Last status 200 at 17:57. If Test Print hangs, check the 443 status job first (the jam signature) before assuming a code fault; a power-cycle is Paul's to do.
- **Codex:** GPT-5.6 Sol via `codex exec`. One transient backend 404 mid-afternoon (retried, fine). Prompts + results in the session scratchpad (`/private/tmp/claude-501/-Users-kilbot-Projects-roadmap/<id>/scratchpad/`, gone on restart — the prompts are reconstructable from the specs).

## Working rules
- Worktrees from `origin/main` only; check `git diff --cached --name-only` has no `apps/*` before any commit; after `git submodule update --init` rerun `~/.claude/scripts/fix-submodule-core-worktree.sh ~/Projects/monorepo-v2`.
- Tests `--maxWorkers=2`, one suite/package at a time.
- **Before every push: `git fetch` and confirm the remote head is your ancestor** — the review-fix bot `wcpos-agents[bot]` pushes to open PR branches on its own.
- Record every live finding on #136 the same hour, with timestamps.
