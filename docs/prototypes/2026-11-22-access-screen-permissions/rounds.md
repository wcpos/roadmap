# Rounds

Judges: Codex GPT-6.1 Sol every round; Opus from round 2 at the latest; Fable once at the final round. Light only (WP Admin has no dark theme), so the dark row is N/A throughout.

## Round 0: three variants, Sol

SYSTEM BREAK (V1, V3): checked checkboxes drawn in #007CBA while the system's Checkout screen draws them in #3858E9. Cause: the variants used the theme-colour fallback for checkboxes; WordPress core paints its own checkbox in #3858E9. The same wrong value is in all three variants' token file, so it is fixed for all three before round 1, not held against one.

| Category | V1 Folded | V2 Summary | V3 Table | Baseline Access | StackAI | Twenty | Zoho | System Checkout | System General |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 7.5 | 8 | 7.5 | 8 | 8 | 7.5 | 7.5 | 8 |
| Typography | 7.5 | 7.5 | 7.5 | 8 | 8 | 8 | 7.5 | 8 | 8 |
| Spacing and alignment | 7 | 7.5 | 8 | 7.5 | 8 | 8 | 8 | 7.5 | 8 |
| Colour and contrast (light) | 8 | 8 | 8 | 8 | 8.5 | 8 | 8 | 8 | 8 |
| Iconography and indicators | 6.5 | 6 | 7 | 7.5 | 7.5 | 8 | 7 | 7.5 | 7.5 |
| Consistency | 5 | 8 | 5 | 9 | 8 | 8 | 8 | 9 | 9 |
| Clarity for the person in the brief | 7 | 7 | 8 | 5.5 | 5 | 5 | 6 | 7 | 7.5 |
| Density | 8.5 | 6 | 7.5 | 8 | 7 | 7.5 | 7.5 | 7 | 7.5 |
| States covered | 8 | 7 | 8 | 3 | 2.5 | 2.5 | 2 | 2 | 2 |
| **Average** | **7.3** | **7.2** | **7.4** | **7.1** | **6.9** | **7.0** | **6.8** | **7.1** | **7.3** |

Findings: `rounds/r0/codex.md`.

### Pick after round 0: V3, the promise table

Read by columns, not the average. Every variant sits under the baseline in typography and indicators, and the baseline's 9 rows are not a like-for-like density comparison with 33. The break on V1 and V3 is one shared wrong token value, fixed for all. What separates them:

- **V3 leads on clarity for the owner (8 against 7 and 7) and on spacing (8)**, the two columns closest to the brief's problem: an owner must tell the two kinds of promise apart and read what is off. Its "show only what is off" control does the second job on the same table the owner edits.
- **V1** has the best density (8.5) but puts every switch behind a click on its group, and its closed line cannot say which off rows are a refusal and which are withheld data.
- **V2** makes the partly granted row read as off (a switch has no mixed position) and is the longest page (density 6).

Climbing V3. V1 and V2 keep their round 0 drawing, with the checkbox colour corrected, as the rejected options.

## Round 1: V3, Sol

Changes: checkbox paint corrected to the system's (all variants); the ordinary promise stated once above the table and removed from 28 rows; filter renamed "Show only restrictions"; Restore defaults dialog frame added.

| Category | V3 r1 | V3 r0 | Baseline Access | StackAI | Twenty | Zoho | System Checkout | System General |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 7.5 | 7 | 8 | 8 | 7.5 | 7.5 | 8 |
| Typography | 8 | 7.5 | 8 | 8 | 8 | 8 | 8 | 8 |
| Spacing and alignment | 8 | 7.5 | 7.5 | 8 | 8 | 8 | 7.5 | 8 |
| Colour and contrast (light) | 8.5 | 8 | 8.5 | 8.5 | 8 | 7.5 | 8.5 | 8.5 |
| Iconography and indicators | 7.5 | 7 | 7.5 | 8 | 8 | 7 | 7.5 | 7.5 |
| Consistency | 8.5 | 5 | 9 | 8.5 | 8 | 8 | 9 | 9 |
| Clarity for the person in the brief | 7 | 7.5 | 6 | 6.5 | 6.5 | 6.5 | 7 | 7.5 |
| Density | 8 | 7 | 6.5 | 8 | 7.5 | 7.5 | 7 | 8 |
| States covered | 8 | 7.5 | 3 | 2 | 2 | 2 | 2.5 | 2.5 |
| **Average** | **7.9** | **7.2** | **7.0** | **7.3** | **7.1** | **6.9** | **7.2** | **7.4** |

No SYSTEM BREAK on r1 (the one reported is against the r0 shots). **Clarity fell 7.5 to 7**: with the "If switched off" heading gone, "Not sent to the till" on a ticked row reads as its current state. Fixed first in round 2 ("When off: …") before anything new. The judge's request for a literal every-row-on frame is declined: the brief's wording was loose and is corrected; the defaults frame is the real state. Findings: `rounds/r1/codex.md`.

## Round 2: V3, Sol and Opus

Changes: exception wording phrased as a consequence ("When off: …"); frame 1 retitled "At the WCPOS defaults"; Orders and Customers help names the control that sets a real limit; mixed checkbox back to the live value.

| Category | Sol: V3 r2 | Sol: V3 r0 | Sol: Baseline | Opus: V3 r2 | Opus: V3 r0 | Opus: Baseline |
|---|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 8 | 7.5 | 8 | 7 | 6 |
| Typography | 8 | 7.5 | 8 | 7 | 7 | 7 |
| Spacing and alignment | 8 | 8 | 8 | 7.5 | 7.5 | 6.5 |
| Colour and contrast (light) | 8 | 8 | 8 | 7.5 | 6.5 | 7 |
| Iconography and indicators | 8 | 7 | 7.5 | 7 | 7 | 6 |
| Consistency | 9 | 5 | 9 | 7.5 | 5 | 8 |
| Clarity for the person in the brief | 8 | 7 | 5.5 | 7.5 | 7.5 | 5 |
| Density | 8 | 8 | 7 | 8 | 6.5 | 6 |
| States covered | 8.5 | 8 | 2.5 | 8.5 | 8 | 2 |
| **Average** | **8.17** | **7.39** | **7.00** | **7.6** | **6.9** | **5.9** |

Reference anchors, Sol: StackAI 6.89, Twenty 7.11, Zoho 6.72, System Checkout 7.33, System General 7.33. Opus: StackAI 6.6, Twenty 7.1, Zoho 6.6.

No SYSTEM BREAK on r2 from either judge. Clarity recovered (Sol 7 to 8). No category fell. Opus's Consistency 7.5 is under its baseline 8; its findings name the cause (the two exception kinds drawn identically, and stacked explanations), which round 3 addresses. Both judges: open tooltips cover the row they explain. Findings: `rounds/r2/codex.md`, `rounds/r2/opus.md`.

Round cap set to 3 for this session (the mockup is one ticket of a larger map); round 3 is the final round and all three judges score it.

## Round 3 (final): V3, Sol, Opus and Fable

Changes: tooltips opened below their icon; the three data rows' line in the grey caption style and only "only hidden at the till" dark; an off Orders or Customers row reduced to one line; Customers help corrected; a group with a partly granted row counted as "3 on · 1 partly".

| Category | Sol r3 | Sol r0 | Sol baseline | Opus r3 | Opus r0 | Opus baseline | Fable r3 | Fable r0 | Fable baseline |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 8 | 7.5 | 7.5 | 8 | 6.5 | 6 | 7.5 | 6.5 | 6 |
| Typography | 8 | 8 | 8 | 7.5 | 7 | 7 | 7 | 6.5 | 6.5 |
| Spacing and alignment | 8 | 8 | 7.5 | 7.5 | 7.5 | 7 | 7.5 | 7 | 6 |
| Colour and contrast (light) | 8.5 | 8 | 8.5 | 8 | 6.5 | 7 | 7.5 | 6 | 6.5 |
| Iconography and indicators | 8.5 | 7.5 | 8 | 7 | 6.5 | 6 | 6.5 | 6 | 5 |
| Consistency | 8.5 | 5 | 9 | 7.5 | 5 | 8 | 7.5 | 5 | 7 |
| Clarity for the person in the brief | 8 | 7 | 6.5 | 8 | 7 | 5.5 | 7.5 | 6.5 | 5 |
| Density | 8 | 7 | 7.5 | 8 | 6.5 | 6 | 7.5 | 6.5 | 5 |
| States covered | 9 | 7.5 | 4 | 9 | 8.5 | 2.5 | 8.5 | 7 | 3 |
| **Average** | **8.3** | **7.3** | **7.3** | **7.8** | **6.8** | **6.1** | **7.4** | **6.3** | **5.6** |

No SYSTEM BREAK on r3 from any judge (each one reported is against the r0 shots). No category fell between r2 and r3 for Sol or Opus. The climb stops at the round cap (3), not at the 9.0 bar: no judge has every category at 9.

Still under the baseline: Consistency for Sol (8.5 against 9) and Opus (7.5 against 8). Both judges tie it to the same two things, fixed in the final polish below: the hidden-at-the-till tier worded two ways, and the group count changing grammar.

### Final polish (applied once after round 3, not re-judged)

All three judges' remaining findings converge on four points:

1. **No tooltips on the five exception rows.** Each shows its one-line meaning in the row at every width, as the phone layout already did. This removes the overlap every judge flagged in every round and the need to change the Tooltip component.
2. **One phrase for the weaker tier, in both states, starting with a different word from the data rows:** "Only hidden at the till." against "When off: your store stops sending …".
3. **One counting form:** "3 of 7 on · 1 partly"; with the filter on, groups count restrictions ("2 restricted").
4. **The lock is a Toggle,** as the Gateways table's Enabled column on the same page, not a Checkbox.

The round 0 shots of V3 that later rounds were judged against are `rounds/r0/shots/v3-*`.
