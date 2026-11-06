# Rounds: Close Register

Cap: rounds=2 (r0 = three variants, r1 = the picked variant after one round of findings).
Anchors: none. No baseline (no Close Register screen on monorepo-v2 origin/main, 2026-11-05); no Mobbin in this session; the vault's competitor notes list names only, no screens.
Judges: Codex (staged by scarcity; Opus joins only once every Codex category is 9.0+).
Shots: desktop 1280×2600 (screen in the top 800 px, states board below), phone 390×844; light and dark.

## Round 0 (Codex, gpt-6-astra) — three variants

| Category | V1 · Side sheet | V2 · Counting desk | V3 · Equation |
|---|---:|---:|---:|
| Hierarchy | 7.5 | 7 | 7.5 |
| Typography | 8 | 8 | 8 |
| Spacing and alignment | 4 | 4 | 4 |
| Colour and contrast (light) | 7.5 | 7.5 | 7.5 |
| Colour and contrast (dark) | 7.5 | 7.5 | 7.5 |
| Iconography and indicators | 7 | 7 | 7 |
| Consistency | 5 | 5 | 5 |
| Clarity for the person in the brief | 6 | 5.5 | 5.5 |
| Density | 8 | 6 | 5.5 |
| States covered | 8 | 8 | 8 |
| **Average** | **6.85** | **6.55** | **6.55** |

Opus judge: not run (staged by scarcity: no Codex category at 9.0).

**Pick: V1, right-side sheet.** Highest average (6.85 vs 6.55 / 6.55), and it leads on the two categories that separate the layouts: clarity (6 vs 5.5) and density (8 vs 6 / 5.5). It also fits Paul's ruling that the register modal comes from the right and keeps the register visible behind the close. All three got the same spacing (4) and consistency (5) scores. Both come from the shoot script, which centre-cropped every phone shot and cut off its left edge. The script is fixed, and the r0 phone shots were reshot afterwards, but the r0 scores above were given on the cropped shots. V2's keypad led the screen even with the note focused, and V3's equation hid the float and bank line on the phone.

## Round 1 (Codex, gpt-6-astra) — V1 after round-0 findings; r0 sets re-scored as baseline

| Category | V1 · r1 | V1 · r0 baseline | V2 · r0 | V3 · r0 |
|---|---:|---:|---:|---:|
| Hierarchy | 8.5 | 8.5 | 8 | 7.5 |
| Typography | 8.5 | 8.5 | 8 | 8 |
| Spacing and alignment | 8.5 | 8.5 | 8 | 8 |
| Colour and contrast · light | 8 | 8 | 8 | 8 |
| Colour and contrast · dark | 8 | 8 | 8 | 8 |
| Iconography and indicators | 8.5 | 8.5 | 8 | 8 |
| Consistency | 8.5 | 8.5 | 8 | 7.5 |
| Clarity for the person in the brief | 8 | 7.5 | 7.5 | 7 |
| Density | 9 | 9 | 7.5 | 6.5 |
| States covered | 9 | 8 | 8 | 7.5 |
| **Average** | **8.45** | **8.30** | **7.90** | **7.60** |

Applied from r0: first-ever close reads "Difference unknown · Opening float not recorded" (not "Unchecked +$150.00"); offline badge reads "Offline · saves here, syncs when online"; a 390 px width cap the designer had added was removed. Nothing scored lower, so nothing was reverted.

This round was judged twice. The first run used phone shots that the shoot script had centre-cropped, so it was discarded (rounds/r1/codex-invalid-cropped-phone.md). The table above comes from the corrected shots, and in it the r0 variants were re-scored on clean shots: V1 8.30, V2 7.90, V3 7.60, which confirms the pick.

Stop: rounds=2 cap reached. Not every category is at 9.0, so the Opus judge was never added. The r1 findings were not applied: (1) the first-close label 'Expected in drawer' should read 'Before opening float'; (2) on the phone, 'To bank' wraps away from its amount; (3) shortage red. Finding 3 is rejected as a taste call: the design rules map the bad state to the destructive red (--bad: var(--destructive)), and the brief's 'red means void/cancel/refund only' was my shorthand for the primary action, not the state.

## After the cap (2026-11-06, kept as the record)

Findings 1 and 2 from round 1 are applied to `variants/_common.py`, `variants/_v1.py` and the regenerated
`variants/v1.html`, without a re-score: the first-ever close's subtotal reads "Before opening float"
(the header stays "Expected from sales"; the brief's figure is sales-based), and "Leave in drawer $150.00"
and "To bank $354.35" each stay on one line on the phone. The shots under `img/` and the scores above are
from before these two edits. Finding 3 (shortage red) stays rejected, as above. Copied here from the
journal session's scratchpad (`green/`, 2026-11-05); the judges' raw logs and per-round shots were left out.
