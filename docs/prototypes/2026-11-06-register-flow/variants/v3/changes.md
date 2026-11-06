# V3 · Rows and sentences: changes

## Token values
None. No system sheet is needed.

## Elements that change which token they read
- Register panel: the figure tiles, money tiles and the ledger fold (`--card`, `--border`, `--radius-tile`) become flush ListRows (`border-b` `--border`, no radius, no surface): `default` (`min-h-14`) for "In the drawer", Pay in, Pay out, No sale; two-line rows for Session sales and Last closure.
- Register panel, "In the drawer" value: the 22 px tile figure becomes AmountFigure `tile` (`text-xl`, bold).
- Pay in / Pay out reasons and the Open register floats: Chip (`--chip`, `--chip-border`, `--radius-chip`; on: `--selected`, `--selected-foreground`) becomes MenuRow choice (`min-h-row`, ✓ in the `w-5` slot reading `--primary`, selected row `--accent`).
- Pay out over the limit: the reason chips fold to one MenuRow with its value (`--muted-foreground` › `--foreground`).
- Close register, Expected: the fold (`--border`, `--radius-tile`, open on tap) becomes an open ListRow group: the Expected row, the ladder lines (`--muted-foreground` labels), then the existing Short band (`--bad-bg`, `--bad`).
- Close register footer: "Close without printing" Button `ghost` becomes "Close register" Button `outline` (`--card`, `--border`) at `lg` height beside the primary.
- Closure written and the Closures document: the three figure tiles and the ladder fold become one receipt column on `--background` inside the `--card` pane (`--border`, `--radius-tile`); the variance row reads the Short band's `--bad-bg` and `--bad`.
- Closure written footer: Print closure and Done sit in one row (`lg` primary, `lg` outline) instead of stacked.
- Closures room: the card rows (`--card`, `--border`, `--radius-tile`, 56 px) become Table rows (`min-h-row`, `border-b` `--border`; head `h-9` caption text; selected row `border-l-2` `--primary` with `--muted`, the repo's `currentRowMark`). The document moves from a Dialog pane to a column (`border-l` `--border`, `--card`).

## Not in the repo today
- new: the ladder as read-only lines 26 px tall (the PropertyList rows it replaces are 36 px).
- new: the one-sentence confirmation above a primary button ("$20.00 goes in · Change"): `--muted-foreground` text with the amount in `--foreground` strong.
- new: the receipt column itself (labels left, values right, hairline groups, centred head), a layout, no new token.
- new: date group headings in the Closures table (caption text `--muted-foreground` over a `border-b` hairline).
