# Rounds

## r0 (Codex gpt-6.1-sol)

| Category | v1 | v2 | v3 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 8 | 7 | 7.5 | 6 | 8 | 6.5 | 7 | 7 | 6 |
| Typography | 7 | 7 | 7 | 7 | 7 | 8 | 8 | 5 | 5 | 5 |
| Spacing and alignment | 7 | 7.5 | 6.5 | 8 | 7 | 8 | 7.5 | 8 | 8 | 8 |
| Colour and contrast — light | 8 | 8 | 8 | 8 | 7.5 | — | 8 | 8 | 8 | 8 |
| Colour and contrast — dark | 8 | 8 | 8 | — | — | 7.5 | — | — | 8 | 8 |
| Iconography and indicators | 8 | 7.5 | 7.5 | 7.5 | 6.5 | 8 | 7.5 | 7.5 | 7 | 7 |
| Consistency | 8 | 7.5 | 7.5 | 7.5 | 7 | 6.5 | 7 | 8 | 8 | 8 |
| Clarity for the person in the brief | 7.5 | 7 | 6.5 | 6.5 | 5 | 7.5 | 8 | 6 | 7 | 7 |
| Density | 6.5 | 7.5 | 5.5 | 7.5 | 6 | 8 | 8 | 8 | 8 | 8 |
| States covered | 8 | 8.5 | 6.5 | 2 | 2 | 2.5 | 3 | 2 | 3 | 2 |
| **Average** | **7.55** | **7.65** | **7.00** | **6.83** | **6.00** | **7.11** | **7.06** | **6.61** | **6.90** | **6.70** |

No SYSTEM BREAK lines (no variant changes a token).

**Pick after r0: v1, provisional.** Columns first: every variant is under the baseline readers page on
Spacing (8), and v1 and v3 are under it on Density (7.5), so no variant may be picked outright. v1
is the one climbed because (a) its Selected mark is the read-only chip the landed Smart readers rows
already use (monorepo#3322), so Consistency is a system fact, not a drawing choice; (b) it keeps
Cash as the first tile, which every WCPOS sale starts from, and puts Tap to Pay first among the
card options, which is what Apple's checklist asks; v2 puts Tap to Pay before Cash and hides
Selected in a 12 px state suffix; (c) v3 draws the chosen reader twice and loses the Android
pre-alert. The pick becomes final when v1's Spacing and Density are at or above the baseline.
Findings for r1: the Selected chip back on the row's line (no separate band); P4 keeps checkout's
reader line with Change beside the Send button; the provider help line on two Tap to Pay tiles at
14 px secondary contrast.

## r1 (Codex gpt-6.1-sol; v1 only, r0 v1 shots as baseline round)

| Category | v1 · r1 | v1 · r0 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8.5 | 8.5 | 8 | 7 | 9 | 8.5 | 8 | 8 | 7.5 |
| Typography | 7.5 | 8 | 8 | 7.5 | 8.5 | 8.5 | 7 | 7 | 7 |
| Spacing and alignment | 8 | 7 | 8.5 | 7.5 | 8.5 | 8.5 | 8.5 | 8 | 8.5 |
| Colour and contrast (light) | 8.5 | 8.5 | 8.5 | 8 | — | 8.5 | 8 | 8.5 | 7.5 |
| Colour and contrast (dark) | 8 | 8 | — | — | 8 | — | — | 8 | 7 |
| Iconography and indicators | 8.5 | 8.5 | 8 | 7 | 8.5 | 8 | 8 | 8 | 8 |
| Consistency | 8.5 | 8.5 | 8.5 | 7.5 | 7 | 7.5 | 9 | 9 | 9 |
| Clarity for the person in the brief | 7.5 | 8 | 8 | 5.5 | 8 | 8.5 | 8 | 8 | 7.5 |
| Density | 6.5 | 6.5 | 8.5 | 8 | 8.5 | 9 | 8 | 8.5 | 8 |
| States covered | 7.5 | 7.5 | 2.5 | 2.5 | 3 | 3.5 | 2 | 2.5 | 2 |
| **Average** | **7.90** | **7.90** | **7.61** | **6.72** | **7.67** | **7.83** | **7.39** | **7.55** | **7.20** |

Spacing rose (the chip is back on the row's line); Typography fell (the name now truncates where the
badge and the actions share its line); Density unchanged (P4 shows a Send button where the chosen
keypad pane belongs). Findings for r2: name never truncates (the action group wraps instead); P4
drawn as the keypad tender pane with the reader line and the commit button; tablet frames for S4,
S5, P4, P5.


## r2 (Codex gpt-6.1-sol; r1 as baseline round)

| Category | v1 · r2 | v1 · r1 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 8 | 8 | 6.5 | 8.5 | 8 | 8 | 8 | 7.5 |
| Typography | 7 | 6.5 | 7.5 | 7 | 8 | 8 | 6.5 | 6.5 | 6.5 |
| Spacing and alignment | 7 | 7 | 8.5 | 7 | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 |
| Colour and contrast (light) | 8 | 8 | 8.5 | 8 | — | 8.5 | 8 | 8 | 8 |
| Colour and contrast (dark) | 8 | 8 | — | — | 7.5 | — | — | 8 | 7.5 |
| Iconography and indicators | 8.5 | 8.5 | 8 | 6.5 | 8 | 8 | 8 | 8 | 7.5 |
| Consistency | 8.5 | 8.5 | 8.5 | 7.5 | 7 | 7.5 | 9 | 9 | 9 |
| Clarity for the person in the brief | 8 | 7.5 | 8 | 5.5 | 8 | 8.5 | 7.5 | 8 | 7.5 |
| Density | 6 | 7 | 8 | 7 | 8 | 8.5 | 8 | 8.5 | 8 |
| States covered | 8 | 7 | 2 | 2 | 2.5 | 3 | 1 | 1.5 | 1 |
| **Average** | **7.65** | **7.60** | **7.44** | **6.33** | **7.33** | **7.61** | **7.17** | **7.40** | **7.10** |

States and Clarity rose, Typography rose, Density fell: P4's keypad pane sat under the whole tile grid and pushed Send off an 844 px phone. Findings for r3: the grid collapses to the selected tile on a tap (the chosen pane's own behaviour); state and instruction lines at 14 px; tablet frames for S3, S6, P6, P7.


## r3 (Codex gpt-6.1-sol; r2 as baseline round; reshot at full page height after the first r3 shots were cut at the window)

| Category | v1 · r3 | v1 · r2 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System list rows | System tiles |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7 | 6.5 | 7 | 6 | 8.5 | 8 | 8 | 8 | 7 |
| Typography | 8 | 7 | 7.5 | 7 | 8 | 8 | 6.5 | 6.5 | 6.5 |
| Spacing and alignment | 7.5 | 7 | 7 | 6.5 | 8 | 8 | 8 | 8 | 8 |
| Colour and contrast · light | 8 | 8 | 8 | 7.5 | — | 8 | 8.5 | 8.5 | 8 |
| Colour and contrast · dark | 8 | 8 | — | — | 8 | — | — | 7.5 | 7.5 |
| Iconography and indicators | 8 | 8 | 7.5 | 6.5 | 8.5 | 7.5 | 7 | 8 | 7.5 |
| Consistency | 8 | 8 | 8 | 7 | 7.5 | 7.5 | 9 | 9 | 9 |
| Clarity for the person in the brief | 7.5 | 7 | 7.5 | 5.5 | 8 | 8 | 6 | 7 | 6 |
| Density | 7 | 6.5 | 7.5 | 6.5 | 8 | 8 | 8 | 8 | 8 |
| States covered | 7.5 | 6.5 | 2 | 2 | 2 | 2 | 1 | 1.5 | 1 |
| **Average · available rows** | **7.7** | **7.3** | **6.9** | **6.1** | **7.4** | **7.2** | **6.9** | **7.2** | **6.9** |

Every category rose or held. A first r3 run on the cut shots reported `SYSTEM BREAK: system-chip-light.png reads serif` against the variant AND both baselines; the gallery snapshots are Linux CI renders with a fallback serif, so that line is an anchor artefact, not a break, and the full-height re-run did not repeat it. Findings for r4: one large figure once the keypad opens (the header total becomes a compact line); the collapsed tender row keeps one tile and one action, relabelled Other tenders; tablet frames for S2, S7, P2, P3. The judge's ask to put a second tappable Tap to Pay tile beside the selected tile is declined on the one-number-one-action rule.


## r4 (Codex gpt-6.1-sol; r3 as baseline round)

| Category | V1 r4 | V1 r3 | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System chip | System rows | System tile |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 7.5 | 7 | 9 | 8.5 | 7.5 | 8 | 7.5 |
| Typography | 8 | 8 | 7 | 7 | 8.5 | 8 | 7 | 7 | 7 |
| Spacing and alignment | 7.5 | 7.5 | 8 | 6.5 | 8.5 | 8 | 8 | 8 | 8 |
| Colour and contrast — light | 8 | 8 | 8 | 7.5 | — | 8 | 8.5 | 8.5 | 8.5 |
| Colour and contrast — dark | 7.5 | 7.5 | — | — | 8 | — | — | 8 | 8 |
| Iconography and indicators | 8 | 8 | 7.5 | 6 | 8 | 7.5 | 8 | 8 | 8 |
| Consistency | 8.5 | 8.5 | 8 | 7 | 8 | 8 | 8.5 | 8.5 | 8.5 |
| Clarity for the person in the brief | 7.5 | 7.5 | 6.5 | 5.5 | 8 | 8 | 7.5 | 7.5 | 7.5 |
| Density | 7.5 | 7 | 7 | 6.5 | 8 | 8.5 | 8 | 8 | 7.5 |
| States covered | 8.5 | 6.5 | 2 | 2.5 | 3 | 3.5 | 2.5 | 3 | 2.5 |
| **Average** | **7.90** | **7.65** | **6.83** | **6.17** | **7.67** | **7.56** | **7.28** | **7.45** | **7.30** |

Density and States rose, the rest held. Findings for r5 (the cap): disabled tiles keep their reason line at normal muted contrast; the full-balance chip returns above the keypad; the awareness sheet's body stays a stand-in with its caption saying Apple's toolkit copy replaces it (the toolkit is not held locally; the review guide only points to it).


## r5 (Codex gpt-6.1-sol; r4 as baseline round) — the cap

`SYSTEM BREAK: V1 r5 — no system sheet; the change from whole-tile dimming to icon/title-only dimming is unjudged against disabled sibling controls.`

| Category | V1 r5 | V1 r4 baseline | Baseline readers | Baseline checkout | Ref phone | Ref tablet | System anchors |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 6.5 | 6 | 8.5 | 7 | 7 |
| Typography | 8 | 8 | 7 | 7 | 8.5 | 8 | 6 |
| Spacing and alignment | 8 | 8 | 7.5 | 7 | 8.5 | 8 | 8 |
| Colour and contrast (light) | 8.5 | 7 | 8 | 8 | — | 8 | 8.5 |
| Colour and contrast (dark) | 8 | 6.5 | — | — | 7 | — | 8 |
| Iconography and indicators | 8 | 8 | 6.5 | 5 | 8 | 7.5 | 7.5 |
| Consistency | 5 | 7.5 | 7.5 | 7 | 7.5 | 7.5 | 9 |
| Clarity for the person in the brief | 7 | 7 | 6.5 | 5.5 | 7.5 | 7 | 7.5 |
| Density | 7 | 7 | 7 | 6.5 | 8 | 7 | 8 |
| States covered | 8 | 8 | 2 | 2 | 2.5 | 2.5 | 2 |
| **Average** | **7.55** | **7.50** | **6.50** | **6.00** | **7.33** | **6.94** | **7.15** |

Colour and contrast rose (light 7 → 8.5, dark 6.5 → 8) but at the cost of a SYSTEM BREAK: the icon-and-title-only dimming is a change to how the system's Tile draws a disabled state, and no system sheet was made. A climb never ends with a break open, so **that change is reverted** for delivery (whole-tile dimming as today) and the real defect, a disabled tile's reason line at about 2.2:1, is ticketed against the monorepo Tile component. Consistency's 5 is the break, nothing else. Two post-cap corrections from the findings: the keypad's bottom row is decimal separator, 0, backspace (the system Keypad has no 00 and no C); the single-provider Tap to Pay tile carries the help line "This device". The repeated ask for a second tappable tile in the collapsed tender row stays declined (one number, one action).

**Stop:** round 5 reached; no judge reached 9.0 everywhere; Opus and Fable did not sit because Sol never cleared the bar. The pick is v1 as climbed, with the reasons in the r0 entry.
