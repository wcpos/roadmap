# V2 — Guests first

No token changes.

System sheet: `system.html`; the Split chip `on` reads the real Chip on-state (`--selected` / `--selected-foreground`), no token change. The sheet also shows the new Tile `done` state beside rest and selected.

## The idea

A split is a number of people. Tapping Split asks how many are paying and lays out one tile per guest. Lines and amounts are given to guests, and whatever nobody was given is shared evenly by the guests who have nothing yet. Each guest then pays, in one take or in parts, by any method. The plan is visible before any money moves, and it is the same screen that takes the money.

## Pane order (ruled order kept)

label → hero (+ hint) → method row → leg chips / helpers → count + guests → keypad → commit.

## Elements re-arranged or added

- **Split chip:** the real Chip on-state. On = guest mode.
- **Eyebrow:** `Guest 2 of 6 · $159.50 left`.
- **Hero (44 px / 700):** the selected guest's amount, dimmed while it is an untouched even share.
- **Leg chips (Chip):** the selected guest's lines and `+ amount`, or the muted hint `An even share of $124.50`. On the phone they start with `Pick items`.
- **Count row:** `How many are paying?` with the cart stepper (`− 6 +`, 2–12).
- **Guest tiles (Tile):** equal width; 6 per row on the tablet, 3 on the phone. **`new:` Tile `done` state:** `--ok-bg` fill and border, a check in `--ok` before the title, sub `$23.00 · Card`. It reads existing tokens only (see the system sheet).
- **Phone while picking items (round 1):** the guest row collapses to ONE row: the selected guest's tile, `‹ ›` to step to the previous or next guest, and the count stepper. The full guest row comes back when the item list closes. The tablet keeps the full row (its item list is the bill).
- **Paying in parts (round 1):** typing less than a guest's share records a part payment. By default the guest stays open with `$x still to pay` (chip `Guest 4 pays $1.50 later`, the default). The other outcome is the chip `Move $1.50 to Guests 5 and 6`, which re-balances the guests to come (s6 shows it chosen). These are two outcomes with one control each.
- **Bill:** live rows with the stepper. Its centre reads `1 of 2` plus the picked amount, and the right figure is always the line total. Picked row has `--muted` with a 3 px `--primary` left edge. A picked unit reads `1 for Guest 2` (`--selected-foreground`). **Paid part (round 1): `✓ 1 of 2 paid · Guest 1 · Card`.** The sub-line wraps to two lines rather than truncating. **Payments (round 1): `Card · Guest 1 · 1 Flat white, 1 Burger`.**
- **Commit (56 px, 16 px / 600):** `Take $23.00 in Card · Guest 1 of 6`, `… · pays it off`. After a full take, the next unpaid guest is selected. After a part take, the same guest stays selected.
- **Type scale (round 1):** as V1.

## Routes retired

| Retired | Replaced by |
|---|---|
| Split sub-view (ring, four-way control, hint, `No split`) | Count row + guest tiles; `No split` = Split chip off |
| Even tab | The count stepper (shares are even by default) |
| Item tab, `Pay for these`, `Pick next items`, `share these between` | Give lines to the selected guest on the bill / phone list; lines nobody holds are shared evenly |
| Amount tab | Type the selected guest's amount |
| Percent tab | No control (see flow S4) |
| Plan strip pills, `Change split` | Guest tiles are the plan; tap an unpaid guest to change their share |

## Round 1 findings applied, and one conflict

- v2-1 (a guest can pay in parts): applied. **It conflicts with the brief's S12**, which says the shortfall moves to the payments still to come. V2 keeps both outcomes as two chips. The default is the guest owing the rest, because in a seat model the share is that person's. Moving it is one tap. s6 draws the move chosen so that s7 matches the worked numbers ($42.25 for Guests 5 and 6).
- v2-2: on the phone the collapsed chooser row is shown while picking (s2 at 390).
- v2-3: paid rows and Payments carry guest, method and what was bought.
- s6 → s7 is continuous: Guest 4 paid $40.00, Guest 5 $42.25, and Guest 6 is $42.25 with $50 cash and $7.75 change; Paid $140.25.
