# The register flow's V2 design is built (run record, 2026-11-07)

The build handoff is `2026-11-06-register-flow-v2-build-handoff.md` (roadmap#568; § 4a carries Paul's answers). The
design is `docs/prototypes/2026-11-06-register-flow/` (V2 · The figure leads). Six slices, one PR each, all on
wcpos/monorepo `main` by 08:30 UTC.

| Slice | PR | Merge |
|---|---|---|
| 1 Hero numerals inside the field (`field-box` `figure`; `RegisterAmount` one look; the web placeholder-colour defect fixed) | #3349 | ca00d27c1 |
| 2 Register panel: hero figure, the three verbs as `stack` Buttons, Expected and Other tenders fold | #3350 | f2558fdd1 |
| 3 Pay in / pay out: name as title, consequence in the header, keypad under the figure, reason grid, hold reason in the footer's aside; `DialogFooter`'s phone column leads with its aside | #3355 | efcae3c5d (`--admin`, see below) |
| 4 The count: keypad collapses after entry and reopens on the amount (ruled), Expected + band block, `varianceAmount`; cart ledger line 107 | #3356 | a4a10b387 |
| 5 Closure written: the variance leads with its eyebrow, two tiles, Closure paper open | #3351 | 8cd81351e (`--admin`, see below) |
| 6 Reports › Closures: stat strip led by the net difference, tabs, Expected · Counted · Difference with a word badge | #3352 | 3c57fb7c4 |

Live renders (before/after, tablet and phone, light and dark) sit on the MacBook in
`~/Desktop/mockups/2026-11-07-register-v2-slice{1..6}/`.

## Decisions made in the build (beyond § 4a)

- The Keypad keeps its own steps (`tile` on the tablet, `shrink` on the phone); no new size.
- Reason chips are three per row on the tablet and two on the phone (design rule 4; CodeRabbit on #3355).
- `stack` is a height floor (`min-h-14`): a translated verb label may take two lines (the Spanish labels truncated).
- The Closures room keeps its five stat figures and notes, led by the discrepancy; the drawing's five-stat set
  was not adopted (dropping figures is not a restyle's call).
- Not built, on purpose: the pay-out approval line (no such feature), "Close register" without printing (a second
  close path), "Leave in drawer / To bank", the Expected ledger fold inside the count, the Reports scope row's
  phone grid (shared with the Sales room; a question for Paul).

## The `--admin` merges

From 05:00 UTC every branch's E2E shard 6 (`pos-money-oracle.spec`: "fee cart recorded no per-rate taxes on
fee_lines", "server line_items count") was red on dev-pro: slices 3 and 5, and two other sessions' branches alike,
with main green at 04:39 (a4a10b3) and no app commit after it. Ruled out: woocommerce-pos#2589 (one line in
`templates/receipt.php`), the store's tax settings (`calc_taxes` on, US/AL base) and its rates (eight, incl. US 10 %
and US/AL 2 %). Paul, 2026-11-07, on the one question (wait, or merge the two Codex-clean heads with `--admin`):
*"do as you recommend"*. Both were merged with the review gate passing locally, zero open threads and Codex clean on
the head. The money-oracle cause is still open.

## Open for Paul (queued, one at a time)

1. The keypad under the Open register card's float (the drawing's frame 2) is in no slice; typing over a prefilled
   default needs a rule (first digit replaces the suggestion, or edits the text). Recommended: replaces.
2. The Reports scope row's phone grid is the shared Reports header: both rooms, or neither. Recommended: both.
