# Fiscal groundwork — second frontier (2026-09-11, afternoon session)

GitHub auth dropped at ~09:40Z (the gh token vanished from the keychain) and came back at ~10:05Z; nothing was lost — the queued pushes went out and the PR watch resumed. If you did not re-login yourself, something else on the machine rewrote the credential store; worth knowing.

## Merged to `next` today (this session)

| Ticket | PR | What |
|---|---|---|
| #240, #241 | closed | Till register + provenance (landed earlier as monorepo#1962) |
| #242 | free#1950, mono#1967, pro#556 | Store column + move on Registers screen; bound register skips the store picker; every sign-in re-registers |
| #252 | free#1947, mono#1966 | `pos_register` filter; `registerId` dimension end to end, Register column/pill, per-register report totals |
| #253 | free#1948, mono#1969 | `GET wcpos/v2/registers/health` + the Store health Registers panel |
| #246 | mono#1971 | till receipt identity: 1.4 blocks, print intent, offline copies |
| #247 | free#1949 | `wcpos_fiscal_records`, the sale/void/cancellation writers, the refund document, the records route |

## Open PRs (all review threads answered and resolved; CI reruns were in flight when auth died)

| PR | Ticket | State when auth died |
|---|---|---|
| free#1952 | #244 + #245 reprint counting + template QR/copy/identity blocks | **merged** 2026-09-11 as 84835b27; #244 and #245 closed with landing notes |
| free#1955 | #248 (plugin half): refund document as a credit note in twelve templates, `Corrects` + `Refunded to` labels, legacy receipt page takes `document=refund:{id}` via the shared `Fiscal_Record_Store::resolve_document()` | opened 2026-09-11 afternoon; local format/lint/PHPStan/PHPUnit green |
| mono#1973 | #248 (app half): receipt route takes `document=refund:{id}`, Receipt button on each refund card, Email hidden, PDF named `refund-<id>.pdf`, built-in thermal template mirrors the plugin | **merged** 2026-09-11 (two review threads: per-refund testID fixed; uncounted system-dialog print dispositioned as the #1971 ruling) |
| free#1954 | infra, not fiscal: the bot's roles-bootstrap patch for the WP 7.1.1-RC1 matrix job | **closed** — the RC job failed identically with it (485 failures); the RC job is red on `next` and non-blocking, the real diagnosis is the RC library's install path |

## In flight locally

- Nothing uncommitted. The session keeps watching the open PRs and merges each when its gate is green with no open threads.
- Queued behind #1952 (do, don't file — the dangling-issues hook refused an issue): the legacy receipt page (`includes/Templates/Receipt.php`) honours `intent=print` and counts/marks through `Receipt_Print_Counter::count_after()` for the sale and for `document=refund:{id}`, and the app appends `intent=print` to the URL it prints on the server-rendered + system-dialog path (never the preview URL). Today that path is uncounted for sales (#1971 ruling) and refund documents (#1973 review thread, dispositioned). Own PR pair on `next` once #1952 merges.

## Design calls made without you today (say if any is wrong)

- `wcpos_fiscal_records` table proposal is in free#1949's body (columns, keys, per-type option sequences under `GET_LOCK`). The `sale` row is self-repairing; a refused insert for the others adds an order note and fires `woocommerce_pos_fiscal_record_failed` — the durable recovery job is a follow-up on #247.
- The records route is not protocol-exempt (nothing in wp-admin reads it yet); `/records/{id}` applies the same store scope as the list.
- A WP Overnight native PDF cannot carry the copy marking, so a print of one is not counted.
- The refund document's `receipt_number` is the refund sequence; `immutable_id` is `<refund_id>:<number>`; allocation falls back to a single counting row, else `unallocated`.
- Provenance health: unregistered = absent from the site's full register list; the cap counts POS-stamped orders only and `truncated` says when it bit; skew lists both directions.
- The default templates' identity block is four short centred lines (one guarded part each), not one line with separator logic.

## Not touched

- Closures (#249–#251) still wait on the session landing (#215 ordering).
- Live dev-next taste pass of the merged app changes (Register column/pill, picker skip) — not done.
- #244 and #245 closed with #1952. #248 closes with #1955 (#1973 merged). Then the epics #197/#198/#200/#201 have every landing ticket closed except the closures (#199 waits on #215).
- When #1952 merges, #1955 needs `origin/next` merged in: both touch the same gallery templates, and the `Corrects` line should move into #1952's identity blocks at that point.
