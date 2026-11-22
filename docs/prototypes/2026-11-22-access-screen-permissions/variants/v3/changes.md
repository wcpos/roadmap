# V3: promise table — changes from the system today (final)

Layout idea: one grouped table for the role, under one line that states the ordinary promise: "Switch a row off and your store refuses it, unless the row says otherwise." Only the five rows that work differently say so, in a line under their own name. A "Show only restrictions" tick turns the same table into the list of what the role is restricted from.

There are no new tokens and no token value changes beyond the correction below, so there is no `system.html`. Building this needs no change to `Tooltip`, `Checkbox`, `Toggle` or `index.css`.

## Corrections to match the system

- Checked checkbox, everywhere it is drawn (rows and the filter): a 1 px `#d1d5dc` (gray-300) border around a `#3858e9` fill, with a white tick. These values were measured in `anchors/system-checkout-desktop-light.png` and `baseline-access-cashier-desktop-light.png`. The fill is WP core's Modern admin scheme colour, recorded in `tokens.css` as `--wp-core-checkbox-checked: #3858e9`. Round 0 had wrongly filled it with `#007cba`.
- Unchecked checkbox: unchanged (1 px `#d1d5dc` border on white, 4 px radius), as measured.
- Mixed checkbox: drawn as the live code paints it, a `#3582c4` border and a `#3582c4` 8×2 bar on white. That is the literal in `packages/settings/src/index.css`, so building it needs no stylesheet change.
- Switches: unchanged, matching the anchors: `#007cba` on, `#e5e7eb` (gray-200) track off, white knob.

## Elements that change or are new

- new: the role column is a fixed `12rem` (`grid-cols-[12rem_1fr]`) instead of one third of the grid, so the table gets about 530 px. The role list keeps its place, item style and dot.
- new: the ordinary promise, stated once between the header and the filter: "Switch a row off and your store refuses it, unless the row says otherwise." (`mt-3 text-sm text-gray-600`). No ordinary row carries promise wording.
- new: the task rows are drawn in the Table component (`ui/src/table.tsx`, as the Gateways table on Checkout): `rounded-md border border-gray-200`, header row `bg-gray-50 text-xs uppercase tracking-wide text-gray-500` with one heading, "{Role} can", rows `border-t border-gray-100`, cells `px-3 py-2`. The Checkbox sits in its own first column, top-aligned with the label's first line.
- new: group rows inside the table: the group name (`font-semibold text-gray-900`) with a count in `text-xs text-gray-500`, `pt-3.5 pb-1`, `border-t border-gray-200`. There is one counting form. With the filter off it reads "4 of 6 on" / "All 6 on", or "3 of 7 on · 1 partly" when the group holds a partly granted row. With the filter on it reads "2 restricted", where a partly granted row counts as one. The row keeps its "3 of 7" marker and Review link unchanged.
- new: the three data rows carry one line under the label, in the grey caption style (`text-xs text-gray-500`, regular weight), with no help icon: "When off: your store stops sending cost, profit and margin to this role's tills." / "When off: your store stops sending customer contact details to this role's tills." / "When off: your store stops sending the expected cash total, so counts are blind."
- new: Orders and Customers (the weaker tier) carry one line under the label, the same whether the row is on or off, with no help icon. The first clause is in `text-xs font-medium text-gray-900` and the rest in `text-xs text-gray-500`. Orders: "**Only hidden at the till.** The till keeps the data. For a real limit, switch off See other cashiers' sales. Learn more". Customers: "**Only hidden at the till.** The till keeps the data. To withhold contact details, switch off See customer contact details. Learn more". "Learn more" is in the text-button colour and does not wrap. Each line takes at most two lines at desktop width.
- new: the same grey line slot carries "Always on for administrators" on the two locked Administrator rows.
- new: a filter line under the promise: a Checkbox "Show only restrictions" and, at the right, "N restricted" (`text-xs text-gray-500`). Ticked, the table keeps only the restricted rows, still under their groups. A partly granted row counts as restricted and keeps its mixed box, its "3 of 7" marker and its Review link.
- new: the changed-from-defaults dot (`size-2 rounded-full bg-amber-500`) is also drawn after a row's label when that row differs from the WCPOS defaults.
- new: Administrator: the two rows administrators keep are disabled checkboxes (`opacity-50`).
- new: header copy reads "What an Administrator can do". The live string `access.tasks_title_role` renders "What a Administrator can do".
- new: at 390 px the role list is two to a row (`grid-cols-2 gap-1`, items `px-3 py-2` instead of `p-4`). The promise line stays above the table, and the five exception lines are the same as at desktop width.
- Unchanged: info notice, header and status line, "Restore defaults" and its confirmation Modal (title, body, "What will change" with Grant / Remove / Keep, Cancel and Restore defaults; drawn as a frame over the Restricted state, with the new row names as its task labels), Checkbox, the "3 of 7" marker and Review, Advanced (last, closed, under the table). The `Tooltip` component is not used on this screen.

## Lock frame (Checkout)

- new: a "Till settings" section under the email rows, headed like Gateways (`mt-4 mb-2 text-base font-semibold`, intro line) and drawn as a Table with the columns Setting / Store setting / Cashiers can change. "Automatically show receipt after checkout" has a Toggle in Store setting. "Quick discount keys" has three TextInputs (`w-14`) with "%". Cashiers can change is a column of Toggles (no label), as the Gateways table's Enabled column is.
- new: when Cashiers can change is off, a line sits under the setting's name (`text-xs text-gray-500`): "Set by your store on every till."

## Drawing notes (not changes)

- The Modal's Keep line lists every task that stays on, as `index.tsx` builds it. With 33 rows that is a long paragraph. It is drawn as the code produces it.
- Frame 1 is "At the WCPOS defaults": every new row on; Manage POS settings in WP Admin, Delete products and Delete coupons stay off, as WCPOS ships them, so it reads "3 restricted". There is no every-row-on frame.
- Frame 5 shows the filter on ("4 restricted" in Products). A rows-only inset under it shows the same state with the filter off ("3 of 7 on · 1 partly").
- Frames 3, 4, 6, 7 and 8 are cropped. A dashed rule marks the cut.
