# Rounds: the register flow

Cap: rounds=3 (r0 = three variants, r1 and r2 = the picked variant after each round's findings).
Anchors (frozen, shot once): the Close Register family pick of 2026-11-05 (`anchors/family-close-register-*`,
desktop and phone, light and dark); two references from Mobbin (`ref-base-deposit-one-amount-one-action`,
`ref-shopify-pos-settings-cash-management-row`); the repo's gallery (`anchors/system-gallery-*`). No baseline:
the live app needs a logged-in store and no gallery cell renders these screens.
Judges: Codex GPT-6.1 Sol alone until every category is 9.0 or above; then Opus; Fable confirms the stop.
Shots: desktop 1280 × 5400 (the flow's steps as frames), phone 390 × 6400 (the steps stacked); light and dark.

Variants:
- **V1 · Tiles and ledger** — the 2026-10-28 map drawn literally: figure tiles, three money tiles, the ledger;
  every money task a pane pushed in the panel; the count is the family sheet; Closures as cards with the
  document in a pane. Changes no token (`variants/v1/changes.md`).
- **V2 · The figure leads** — one 40 px amount leads every money surface with the checkout keypad under it;
  the ledger folds under Expected; the panel is one figure and a verb row; the closed moment leads with the
  variance; Closures opens with a stat strip. Changes no token value (`variants/v2/changes.md`).
- **V3 · Rows and sentences** — the panel is a stack of 56 px rows with the ledger as rows; reasons are a ✓
  choice list; each money pane ends in one sentence above the button; the closed moment is a receipt column;
  Closures is a dense hairline table with the document as a right column (`variants/v3/changes.md`).

## Round 0 (Codex, gpt-6.1-sol) — three variants, anchors scored alongside

SYSTEM BREAK on every set, all of one kind: no system sheet. V1 — the amount input's typography; V2 — the amount
input's border treatment; V3 — the selected row's fill. None of the three changes a token's value, but each
changes which component an element is drawn as, and the judge is right that the siblings are unjudged.

| Category | V1 · Tiles and ledger | V2 · The figure leads | V3 · Rows and sentences | Family close | Base ref | Shopify ref | System gallery |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 6.5 | 8 | 7 | 9 | 9 | 8 | 7 |
| Typography | 7 | 8 | 7 | 8.5 | 8.5 | 8 | 7 |
| Spacing and alignment | 7 | 7.5 | 7 | 8.5 | 8.5 | 8.5 | 7 |
| Colour and contrast · light | 7.5 | 7.5 | 7.5 | 8.5 | 7 | 7.5 | 7.5 |
| Colour and contrast · dark | 7.5 | 7.5 | 7.5 | 8.5 | — | — | 7 |
| Iconography and indicators | 7 | 7 | 7.5 | 8 | 7 | 8 | 7.5 |
| Consistency | 5 | 5 | 5 | 6.5 | 8 | 8 | 8 |
| Clarity for the person in the brief | 6 | 6.5 | 6.5 | 8.5 | 7 | 6 | 3 |
| Density | 6.5 | 7 | 6.5 | 8.5 | 8 | 7.5 | 6.5 |
| States covered | 5.5 | 5 | 6 | 3 | 1 | 1 | 2 |
| **Average** | **6.55** | **6.90** | **6.75** | **7.75** | **7.11** | **6.94** | **6.25** |

Findings (the three per variant, verbatim in `rounds/r0/codex.md`): V1 — two equal figures compete in the
panel; the Closures rows lack a labelled Expected · Counted · Difference; the written moment has no ladder.
V2 — the count's keypad displaced Other tenders and the "Change" action; the written moment replaced the three
tiles and ladder with a variance headline; the reason chips are 32 px. V3 — the count opens with the ledger
expanded and the counted cash demoted; the Closures rows drop Expected and Counted; the phone board omits
first-ever open, empty-amount validation, offline approval and the unsynced closure.

**Pick: V2 · The figure leads.** Read by columns: V2 leads or ties on hierarchy (8 against 6.5 / 7),
typography (8), spacing (7.5) and density (7), and ties V3 on clarity. Its one low column, states covered
(5 against 5.5 / 6), is three missing drawings, each named by the judge and each additive. V2 is also the
variant that reads as the Close Register family (the counted figure leads, the checkout keypad the cashier
already knows), which is what the brief asks the sweep to be: one family. No baseline exists to disqualify
against. Consistency sits at 5 on every variant for the same reason, so it does not separate them; round 1
renders V2's system sheet so it can be judged. V3's phone-state finding applies to every variant and is taken
into round 1; V1's Closures-row finding too.

## Round 1 (Codex, gpt-6.1-sol) — V2 after the round-0 findings, with its system sheet; r0's V2 as baseline

Applied from r0: the count keeps Other tenders and "Leave in drawer · To bank · Change"; the written moment and
the Closures document carry Counted · Expected · Variance and the folded Closure paper; every chip is 44 px in
rows with 8 px gaps; the Closures rows carry labelled Expected · Counted · Difference (a column each on desktop);
the phone board gained the first-ever open, Pay in with nothing typed, Pay out over the limit offline, the
unsynced closure, and the Closure 42 document. The system sheet (`variants/v2/system.html`) exists.

SYSTEM BREAK (real, not "no sheet"): the editable AmountFigure is an unframed 40 px figure while its sibling
FieldBox is a bordered, filled input; two grammars for one editable-currency role, and the borderless amount
also reads like the panel's read-only balance. Fixed in round 2 by keeping the FieldBox boundary around the hero
amount. The baseline's break line is the r0 "no sheet" kind.

| Category | V2 · r1 | V2 · system sheet | V2 · r0 baseline | Family close | Base ref | Shopify ref | System gallery |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8.5 | 8 | 8 | 9 | 9 | 8 | 7.5 |
| Typography | 7.5 | 8 | 7.5 | 8.5 | 8.5 | 8 | 7 |
| Spacing and alignment | 7.5 | 7 | 7.5 | 8.5 | 9 | 8.5 | 8 |
| Colour and contrast · light | 7 | 7 | 7 | 8 | 8 | 8 | 7 |
| Colour and contrast · dark | 7 | 7 | 7 | 8.5 | — | — | 7 |
| Iconography and indicators | 8 | 8 | 7.5 | 8.5 | 8.5 | 8.5 | 8 |
| Consistency | 5 | 5 | 5 | 7 | 7 | 7.5 | 8.5 |
| Clarity for the person in the brief | 7 | 7 | 7 | 9 | 5.5 | 6 | 5.5 |
| Density | 7.5 | 8 | 7 | 9 | 8.5 | 8 | 7.5 |
| States covered | 7 | 1.5 | 5.5 | 2.5 | 1 | 1 | 1.5 |
| **Average** | **7.2** | **6.7** | **6.9** | **7.8** | **7.2** | **7.1** | **6.8** |

Nothing fell against the baseline (the anchors' own scores drift round to round; read them as relative).
Findings for round 2: (1) keep the FieldBox boundary around every editable hero amount, numerals unchanged;
(2) frame 6 (Pay out $45.00) shows "Take $45.00 out" enabled with no approval warning while 6b requires approval
for the same amount: frame 6 must carry the over-the-limit notice and lead to the approval pane; (3) draw the
missing states at both widths: "Add a reason" validation, a blank first-ever open (not "$0.00"), and the count's
Over and Exact states with their note rule.

## Round 2 (Codex, gpt-6.1-sol) — V2 after the round-1 findings; r1's V2 as baseline

Applied from r1: every editable amount keeps the FieldBox frame with the 40 px numerals inside, and read-only
figures (In the drawer, the variance, the stat strip) stay unframed, so typed and displayed amounts are told
apart by the frame; frame 6 (Pay out $45.00) carries "Over the $40.00 limit · a manager must approve" and
"Continue to approval", with a new 6a under the limit ($12.00 Petty cash); new states at both widths: 5c
"Add a reason", 2b with a true placeholder, 7b Over (+$3.20, note required), 7c Exact (note optional).

| Category | V2 · r2 (with sheet) | V2 · r1 baseline | Family close | Base ref | Shopify ref | System gallery |
|---|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 9 | 9 | 8 | 7 |
| Typography | 7 | 7 | 8.5 | 8.5 | 8 | 7 |
| Spacing and alignment | 6.5 | 7 | 8.5 | 9 | 8.5 | 8 |
| Colour and contrast · light | 7.5 | 7.5 | 8 | 7.5 | 8 | 7.5 |
| Colour and contrast · dark | 7.5 | 7.5 | 8 | — | — | 7.5 |
| Iconography and indicators | 8 | 8 | 8.5 | 7.5 | 8.5 | 8 |
| Consistency | 5 | 5 | 5 | 8 | 8.5 | 9 |
| Clarity for the person in the brief | 7.5 | 7 | 8.5 | 4.5 | 5 | 5 |
| Density | 7 | 7 | 8.5 | 7.5 | 8 | 7 |
| States covered | 8.5 | 7 | 2.5 | 1 | 1 | 2 |
| **Average** | **7.3** | **7.1** | **7.5** | **6.9** | **7.1** | **6.8** |

Clarity and states rose; spacing fell 7 → 6.5, and the judge places the fall on the system sheet (the
$150.00 overruns its field at 390 px). SYSTEM BREAK still open, and it is the sheet's: its editable-amount cell
was drawn at 56 px medium weight while the subject is a 64 px field with 40 px bold numerals, so the sheet did
not show the subject's element and the Consistency column judged a cell that is not in the design. The judge
also reads the Close Register family anchor's primary (#1D5FD6 light, #2F6FDB dark) against the gallery's
(#0031CC, #00A9FC): that anchor was drawn in the 2026-11-05 run's own palette, before tokens.css existed; V2
reads the gallery's tokens. Findings: (1) the sheet's phone cell overruns; (2) on the phone the count's keypad
pushes "Leave in drawer · To bank" and Other tenders below the first viewport, smallest fix a keypad that
collapses after entry; (3) cashier-facing metadata, validation lines and the count note are ~12 px, and the
note is one line, against the brief's 14 px rule.

Cap reached (rounds=3). A climb never ends with a SYSTEM BREAK open, and this one is a mis-drawn sheet, not
the design, so round 2 is re-scored once after a corrective pass that changes only: the sheet's editable cell
(now the subject's own 64 px / 40 px bold element), the sheet's phone column span, and finding 3 (the brief's
own 14 px rule and the family's multiline note). Finding 2 is a behaviour change and stays open for Paul.

## Round 2b (Codex, gpt-6.1-sol) — round 2 re-scored after the corrective pass; r2 as baseline

Applied: the sheet's editable-amount cell is the subject's own element (64 px field, 40 px bold numerals) and
spans both phone columns; cashier-facing small text is 14 px (header sub-lines, field labels, the reasons
beside disabled buttons, the note rule, ladder details, tile and notice details); the count note is a
multi-line box again in 7, 7b and 7c.

| Category | V2 · r2b (with sheet) | V2 · r2 baseline | Family close | Base ref | Shopify ref | System gallery |
|---|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 8.5 | 8.5 | 7.5 | 7 |
| Typography | 7.5 | 7 | 8.5 | 8 | 8 | 7 |
| Spacing and alignment | 7 | 6.5 | 8.5 | 8 | 8 | 7 |
| Colour and contrast · light | 7.5 | 7.5 | 8.5 | 7 | 7.5 | 7.5 |
| Colour and contrast · dark | 7 | 7 | 8 | — | — | 7 |
| Iconography and indicators | 7.5 | 7.5 | 8 | 7 | 8 | 7.5 |
| Consistency | 5 | 5 | 5 | 7.5 | 8 | 8 |
| Clarity for the person in the brief | 7.5 | 7 | 8.5 | 6.5 | 6.5 | 5.5 |
| Density | 6.5 | 6.5 | 8.5 | 8 | 7.5 | 7 |
| States covered | 7.5 | 7.5 | 3 | 1.5 | 1 | 1 |
| **Average** | **7.10** | **6.95** | **7.50** | **6.89** | **6.89** | **6.45** |

Typography, spacing and clarity each rose; nothing fell against the baseline. SYSTEM BREAK still reported, and
again the sheet's rendering: its primary button was drawn at the default label weight while the flow's commit
button is `--w-commit`. Findings: (1) the phone capture ended inside the Closure 42 document (a shot height,
fixed by shooting taller); (2) the keypad, always open, pushes "Leave in drawer · To bank" and Other tenders
below the count's first phone viewport, where the family anchor shows them beside the count (smallest fix: a
keypad that collapses once the amount is entered); (3) the sheet's primary must be the flow's own element.
Round 2c below re-scores once more after (1) and (3); (2) stays open for Paul.

## Round 2c (Codex, gpt-6.1-sol) — the sheet's buttons as the flow's own; r2b as baseline

| Category | V2 · r2c (with sheet) | V2 · r2b baseline | Family close | Base ref | Shopify ref | System gallery |
|---|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 9 | 8.5 | 8 | 7 |
| Typography | 8 | 8 | 8.5 | 8 | 8 | 7 |
| Spacing and alignment | 7.5 | 7.5 | 8.5 | 8 | 8.5 | 7.5 |
| Colour and contrast · light | 7.5 | 7.5 | 8.5 | 7 | 8 | 8 |
| Colour and contrast · dark | 7.5 | 7.5 | 8.5 | — | — | 8 |
| Iconography and indicators | 7.5 | 7.5 | 8.5 | 8 | 8 | 8 |
| Consistency | 8 | 5 | 5 | 8 | 8.5 | 9 |
| Clarity for the person in the brief | 7.5 | 7.5 | 8.5 | 7 | 6.5 | 5 |
| Density | 7 | 7 | 8.5 | 8 | 8 | 7 |
| States covered | 8.5 | 8 | 3 | 1 | 1 | 1 |
| **Average** | **7.7** | **7.4** | **7.7** | **7.1** | **7.2** | **6.8** |

No SYSTEM BREAK against V2: Consistency 5 → 8 once the sheet drew the flow's own elements. The two break lines
left are the Close Register family anchor (drawn 2026-11-05 in that run's own palette, #1D5FD6 / #2F6FDB,
against the gallery's #0031CC / #00A9FC; V2 reads the gallery's tokens, so the family screen is the one to
re-skin when it is built) and the baseline (no sheet). Nothing fell.

**Stop: cap reached (rounds=3), no break open.** Not every category is 9.0, so Opus and Fable were never added.
Open findings, not applied: (1) on the phone the Closures filter row clips "All cashiers" and lacks the date
filter (an explicit two-column filter grid); (2) the count's keypad, always open, pushes "Leave in drawer ·
To bank · Change" below the first phone viewport (a keypad that collapses after entry and reopens on tapping
the amount); (3) the register panel's Expected ledger is only drawn folded (one expanded frame per layout).

Shots: the per-round shot sets were left out of the record (the final V2 and the round-0 sets are under `img/`); the judges' tables are in `rounds/r*/codex.md`.

## Round 3 (Codex, gpt-6.1-sol) — the three open findings applied after Paul's ruling; r2c as baseline

Paul (2026-11-06, "as you recommend"): the count's keypad collapses once the amount is entered and reopens on
tapping the amount. Applied with the other two: the Closures scope row is a grid (two columns on the phone)
with the date filter drawn as a date range; the register panel has an Expected-open frame per layout.
Also: "Leave in drawer $…" and "To bank $…" each stay on one line (the family's own round-1 finding).

| Category | V2 · r3 | V2 · r2c baseline | System r3 | System r2c | Family close | Base ref | Shopify ref | System gallery |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8.5 | 8 | 7.5 | 7.5 | 9 | 9 | 8 | 7.5 |
| Typography | 7.5 | 7.5 | 7.5 | 7.5 | 8.5 | 8.5 | 8 | 7.5 |
| Spacing and alignment | 7 | 7 | 7 | 7.5 | 8.5 | 8.5 | 8.5 | 7.5 |
| Colour and contrast · light | 8 | 8 | 8 | 8 | 8.5 | 7.5 | 8.5 | 8.5 |
| Colour and contrast · dark | 6.5 | 6.5 | 7.5 | 7.5 | 8.5 | — | — | 7.5 |
| Iconography and indicators | 7.5 | 7.5 | 8 | 8 | 8.5 | 7.5 | 8.5 | 8 |
| Consistency | 5 | 5 | 9 | 9 | 7.5 | 9 | 9 | 9 |
| Clarity for the person in the brief | 7 | 7.5 | 6.5 | 6.5 | 9 | 6.5 | 8 | 6 |
| Density | 8.5 | 7.5 | 6.5 | 7 | 8.5 | 8.5 | 8 | 7.5 |
| States covered | 8.5 | 7.5 | 1.5 | 1.5 | 3 | 1 | 1 | 1.5 |
| **Average** | **7.40** | **7.20** | **6.90** | **7.00** | **7.95** | **7.33** | **7.50** | **7.05** |

A fresh context: r2c re-scores at 7.20 here against 7.70 in its own round, so the columns are read against
the baseline column. Hierarchy, density and states covered rose (8 → 8.5, 7.5 → 8.5, 7.5 → 8.5); clarity fell
(7.5 → 7) because the counting frame showed a partial figure ($504.3) while the shortage and the bank amount
stayed at the full count. Reverted per the skill: the counting frame keeps the keypad open with the whole amount
and the caret, as r2c drew it. The judge also named a SYSTEM BREAK that r2c already carried: the count's keypad
drew 6 px gaps against the sheet's 8 px. Fixed: the count reads the component's 8 px. Both changes are shot into
`img/` and not re-scored (one follow-up round, the cap already reached).

Open findings, not applied: (2) on the phone the Closures filter chips are ~32 px tall, under the brief's 44 px
touch minimum (make them 44 px in the same two-column grid); (3) in the dark theme the shortage text (`--bad` on
`--bad-bg`, #F85452 on #442321) measures ~4.23:1, under 4.5:1 for small text: a token pairing to adjust in the
repo's dark theme with the sibling error states together, not in a mockup.
