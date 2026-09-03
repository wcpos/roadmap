# Handoff — printer setup wizard, live HITL work (written 2026-09-03 ~19:50, updated ~20:20, for a cold restart)

**Task:** wcpos/roadmap#136 (gotcha catalogue) → #135 (wizard flow) → #134 (in-app wizard). Specs on wcpos/monorepo#1597.
**Mode:** HITL. Paul drives the printer; the agent reads code and logs, records on #136 the same hour, ships bounded fixes through PRs. Small steps, live feedback, no one-shots.
**Lane:** `main`, ships in 1.10.x.
**Read the safeguards section of `docs/handoffs/2026-09-03-printer-setup-handoff.md` first.** Unchanged: no device credentials, no admin login, no probing beyond the app's own status checks (empty ePOS status job on 443), never raw 9100 on the Epson, no shell print job without Paul's explicit yes for that job, physical/admin steps are Paul's.
**New standing rules:** `docs/printer-support-doctrine.md` (Paul's post-mortem ruling, 2026-09-03 ~20:50 — research gate before any spec, observability as a feature, acknowledged lanes first, signatures not models, support tiers, the fixed HITL script) and memory `feedback-printer-subsystem-logs-everything` + `feedback-printer-research-gate-before-spec`. **Tomorrow starts with `docs/handoffs/2026-09-04-printer-mobile-preflight.md`, filled in from docs before any device is touched.** The living doctrine + Lessons log is `packages/printer/README.md` (wcpos/monorepo#1831, open) — every printer PR appends to that log.

Earlier handoffs today: `-handoff.md` (morning), `-handoff-2.md` (Spec D), `-handoff-3.md` (Spec E). This file supersedes them for current state.

---

## Headline: cell 1 is walked end to end; #1819 MERGED; Spec F logging landed in electron; three monorepo PRs open

**wcpos/monorepo#1819** (Spec E, structured ePOS XML over 443) **MERGED 19:48 (a561104223)** on Paul's call after the full walk. Evidence on #136 (comments 18:06 → 19:44):

- Secure Printing ON: scan → 443 → 48 → Test Print ✅ → Open drawer `<pulse>` ✅ → real receipt with `<image>` logo + `<barcode>` ✅ → browser POS (preview build) ✅.
- Secure Printing OFF (Paul flipped it ~18:52; services restart ~30 s, no power-cycle): scan still lands on 443 → Test Print ✅ → Save ✅ (profile finally persisted) → browser Test Print ✅.
- Breakages: wrong port 9101 → prints (Epson lane ignores non-ePOS ports, gotcha #17); port 80 → prints with SP off; port 9100 typed → prints via 443, zero raw writes; wrong subnet → identify rewrites port to 9100 and Test Print falls back to **raw 9100** (#18) with a bare error string and wrong copy (#19); printer off → wrong copy + fake "Detected: Epson" (#20).

**The "hold" (prints once, then hangs) is settled as printer-side and NOT a #1819 blocker:** curl and the app behave identically (`Connection: close` from the printer, so no socket reuse); back-to-back is not the trigger (four jobs in four minutes all printed after a cycle); spacing is not a cure; a hung job holds the status lane too (timeout → 503 for 2–10 min); self-clear was seen once (17:55), a power-cycle always clears it. Web sweep: Shopify tells merchants "RED printers don't work, turn Secure Printing off"; Lightspeed X gives the Web Config steps; Lightspeed K built a compliant lane and documents "a slight delay"; Epson's eRED guide lists 443 as "Can print (encrypted)" with SP on. Wizard remedy = detect the SP signature and walk the merchant through Web Config → Secure Printing → Disable (Lightspeed's six steps), keep the #1819 lane as the best-effort path with SP on.

## PR state at 20:20 (check remote heads before touching — the bot pushes; it pushed ec16b12 to #404 today)

- **wcpos/monorepo#1819** — Spec E. **MERGED.** Follow-ups (own PRs, none started): gotcha #12 (success feedback behind the modal), #14 (browser logo via plugin REST/CORS), #18 (Epson raw fallback must fail loudly), #19 (unreachable copy), #20 (real "Detected" label), full-receipt-raster on the ePOS lane, Spec B.
- **wcpos/monorepo#1823** — gotcha #13 (`?` for U+202F). **MERGED 20:3x (4b4d780f49).**
- **wcpos/electron#404** — Spec F Electron half. **MERGED 20:1x (f8ccd4f3cc)** with Paul's three rulings applied: production `main.log` level `info`; electron-log `initialize({ preload: true })` renderer bridge (`window.__electronLog.<level>(...)`); handler logging. Bot commit ec16b12 (one outcome per failed request; Bonjour constructor error callback) read and accepted.
- **wcpos/monorepo#1829** — `apps/electron` pointer bump 1f78585 → f8ccd4f. **MERGED 20:4x (a78d658795).** The dev-build worktree's `apps/electron` is still detached at a307e2f — move it to f8ccd4f and restart Forge to get the new main-process logging.
- **wcpos/monorepo#1828** — Spec F monorepo half: `@wcpos/utils` logger forwards to `window.__electronLog`; `packages/printer/src/logger.ts` `printerLogger`; probe/identify/cached-port lines. 85 + 2 suites green; merged with main after #1819 (adapter conflict resolved, log lines kept inside `probeEposPort`). **Open, mergeable, checks running; merge manually after reading any bot push** (auto-merge deliberately off). Worktree `.claude/worktrees/codex-printer-logging` (its `apps/electron` was deinit'ed to make the root lockfile install; do not re-init there).
- Dialog outcome lines (Test Print / Open drawer / Save) were left out of #1828 (Codex judged the local-logger switch more than one line) — small follow-up.

**Worktree lesson:** a monorepo worktree with `apps/electron` initialised at a newer commit than the recorded pointer fails `pnpm install --frozen-lockfile` (nested workspace, lockfile mismatch). Either leave the submodule uninitialised for monorepo-only work, or accept `--no-frozen-lockfile` and never commit the lockfile churn.

## New gotchas today (all on #136 with timestamps)

#13 U+202F → `?` (PR #1823) · #14 browser prints drop the logo (cross-origin `<img>`; Electron uses `wcpos-image://` cache; remedy = serve the logo via the plugin REST namespace with CORS or embed as data URL) · #15 Electron main loses mDNS after hours; only an app restart fixes it (troubleshooter: "restart the app, scan again") · #16 withdrawn (store is UTC) · #17 Port field is advisory for Epson · #18 unreachable Epson-named host → port rewritten to 9100 → raw fallback (must fail loudly; Spec B #2) · #19 unreachable ⇒ wrong copy (certificate/8008/Chrome advice, in Electron) · #20 "Detected: Epson" is name-derived, not a probe result.

## Environment (as left ~19:50)

- **Dev build:** `~/Projects/monorepo-v2/.worktrees/printer-gotchas-electron`, branch `live-epos-check` = 9410fede67 (#1819). Expo `:8088` (Terminal window from 13:21) + **Electron Forge relaunched 19:00:40** in a new Terminal window (the old one was killed to clear gotcha #15). `apps/electron` submodule detached at a307e2f (don't commit the pointer). Chrome on `http://localhost:8088` shows a stuck "Reset didn't finish" OPFS page — use the PR preview `https://wcpos--nvq22onzhy.expo.app` for browser tests.
- **Printer:** TM-m30III 192.168.1.131, **Secure Printing now DISABLED** (Paul, ~18:52) — re-enable is Paul's Web Config step if the next test needs SP on. Server Direct Print Disable, ePOS-Device Enable (experiment 2 never needed). Saved Electron profile: 192.168.1.131:443, Epson, 48 (Paul confirmed the breakage edits were cancelled).
- **Shell artefacts:** `poll-443-status.sh` and `wait-then-print.sh` in the session scratchpad (gone on restart; both reconstructable: the status job is `buildEposXml('')` to `service.cgi?devid=local_printer&timeout=4000`).
- **Log:** `~/Library/Logs/WCPOS/main.log`; ePOS still logs nothing until #404 lands + submodule bump.

## Working rules (unchanged)
Worktrees from `origin/main`; `git diff --cached --name-only` has no `apps/*` before commits; `fix-submodule-core-worktree.sh` after any submodule init; tests `--maxWorkers=2`, one suite at a time; `git fetch` + ancestor check before every push; record every live finding on #136 the same hour; Codex implements bounded specs, Claude reviews line by line and mutation-checks; zsh: use arrays for multi-file tool args (unquoted `$F` does not word-split).
