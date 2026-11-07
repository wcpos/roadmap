# Split payment — hill-climb mockups (2026-11-07)

Static HTML, no build. Open `index.html` (double-click). Pages are written against the monorepo's live theme tokens (`variants/tokens.css`, extracted from `apps/main/global.css`) and the component class strings in `packages/components`.

**Question it answers:** Paul, 2026-11-07: *"I'm not convinced these screens are as easy to use as they could be … 6 drinks and 8 meals in a cart. One customer wants to pay for 1 drink + 1 meal, another 1 drink + $10, another $20 off the bill, and the remaining 3 split it evenly … We need to document each one and make sure we have an intuitive flow."*

**What is here**

- `brief.md` — the mode (inside-a-system), the person, Paul's words, the inventory of today's split view, the worked order ($182.50), the **scenario catalogue S1–S20**, the shot list, the binding constraints and the vendor comparison.
- `variants/v1*` — **the pick: "the payment is built, not planned."** No split sub-view; the bill's lines carry the cart stepper and are the picker; a typed amount or `+ amount` tops a leg up; `Split the rest · Percent · 2–6 ways` tiles sit in the helpers row; the plan strip (done / now / to come) sits under the method row. `v1/flow.md` gives the taps for every scenario (Paul's table: 20 taps); `v1/changes.md` lists what the system gains and the routes it retires; `v1/system.html` is the sibling sheet.
- `variants/v3*` — rejected: the four tabs kept, each composing on the next payment (last shot in `rounds/r3`). `variants/v2*` — dropped after round 1: guests first, the seat model (last shot in `rounds/r1`).
- `anchors/` — the real register frame with today's split open (light and dark), Paul's screenshot, the real keypad pane, the component gallery sheets, three fintech references. Shot once, never changed.
- `rounds.md` — every judge table (Codex GPT-6.1 Sol), the pick's reason, every revert and every finding declined with its reason. `rounds/<r>/codex.md` are the judges' verbatim reports; `rounds/final/shots` is the delivered state, `rounds/r3` and `rounds/r1` hold the rejected variants' last shots. Intermediate round shots are not committed.
- `tools/` — the shoot and page-build scripts used.

**Result:** V1 picked on round 3's columns (at or above the baseline in every category, no system break); climbed to the round cap; best table average 8.15 with Consistency 9. Sol was the only judge: no category reached 9.0 in two consecutive rounds, so Opus and Fable never judged.

**Not decided here:** whether to keep the four-tab structure (the 2026-09-11 approved pane's) or retire it for V1. That is Paul's call; the build spec waits for it.
