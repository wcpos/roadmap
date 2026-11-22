# V1: folded groups — changes from the system today

Layout idea: each of the seven groups is a closed disclosure whose one line is its verdict ("4 of 6 on · Off: Give a discount, Change a line's price"). The owner reads seven lines to know what a role cannot do and opens a group to switch the rows in it.

No token value changes and no new tokens. Every value below is an existing Tailwind v4 / `@theme` value, so there is no `system.html`.

## Elements that change or are new

- new: the 33 rows sit in seven `<details>` boxes ("Using the POS" … "Pages"), each drawn with the classes of today's Advanced disclosure (`border border-gray-200 rounded`, summary `px-3 py-2 text-sm`), `mb-2` between boxes, closed by default.
- new: a group's summary carries its name (`text-sm font-semibold text-gray-900`), a count ("All 6 on" / "4 of 6 on", `text-xs text-gray-500`) and, when anything is off, an "Off:" line naming the rows (`text-xs text-gray-700`, the word "Off:" in `text-gray-500`). The line hides while the group is open.
- new: a chevron (`text-gray-400`, 16 px) at the right of every group summary, turned 180° when open.
- new: the existing Advanced summary gains the same chevron and the group-name type (`font-semibold text-gray-900`) so the eight boxes read as one family. Advanced stays where it is: last, closed by default.
- new: the changed-from-defaults dot (`size-2 rounded-full bg-amber-500`) is also drawn after a row's label, and after a name in a group's "Off:" line, when that row differs from the WCPOS defaults. Today the dot appears only by the role name and in the header.
- new: Orders and Customers (Pages) carry a neutral Chip "Hidden at the till" (`Chip variant=neutral size=sm`) after the label.
- new: Orders, Customers and the three data rows carry the Checkout screen's help icon (`Label tip`: comment-question, `text-gray-300`, 16 px) whose Tooltip holds the one-line meaning. Access uses no help icons today.
- new: when a data row or a "hidden at the till" row is off, a one-line explanation sits under it (`text-xs text-gray-500`, `ml-6`, FormRow's description style); the till rows add a "Learn more" text link (`Button variant=text` colour). Orders off adds: "For a real limit on orders, switch off See other cashiers' sales."
- new: Administrator: Use the POS and Manage POS settings in WP Admin are disabled checkboxes (`opacity-50`, the Checkbox `disabled` state) with "Always on for administrators" (`text-xs text-gray-500`) at the right of the row. Today only `read` in Advanced is disabled.
- new: header copy reads "What an Administrator can do". The live string `access.tasks_title_role` ("What a {role} can do") renders "What a Administrator can do".
- Unchanged: role list (left column, `p-4 mb-1 rounded`, selected `bg-wp-admin-theme-color-lightest`), role dot, info notice, "Restore defaults" (`Button variant=secondary`, disabled at defaults), the header status line, Checkbox and the mixed state with "3 of 7" and Review. At 390 px the role list stacks above the rows as it does today.

## Lock frame (Checkout)

- new: "Automatically show receipt after checkout" is a Toggle row with a help icon, like the rows already on Checkout. "Cashiers can change this" is a Checkbox nested under it at `ml-12 mt-2`, the way Admin emails nests its email checkboxes today.
- new: when that checkbox is unticked, a muted line sits under it (`text-xs text-gray-500`): "Every till uses your setting; cashiers see it as set by your store."
- new: "Quick discount keys" is a label (`text-sm font-medium text-gray-900`) with a help icon, three TextInputs (`w-16`) with a "%" after each (`text-sm text-gray-500`), and the same nested "Cashiers can change this" checkbox.

## Corrections to match the system (round 1)

- Checked checkbox, everywhere it is drawn (rows, the lock frame's "Cashiers can change this", Admin emails): a 1 px `#d1d5dc` (gray-300) border around a `#3858e9` fill, with a white tick. These values were measured in `anchors/system-checkout-desktop-light.png` and `baseline-access-cashier-desktop-light.png`. The fill is WP core's Modern admin scheme colour, recorded in `tokens.css` as `--wp-core-checkbox-checked: #3858e9`. Round 0 had wrongly filled it with `#007cba`.
- Unchecked checkbox: unchanged (1 px `#d1d5dc` border on white, 4 px radius), as measured.
- Switches: unchanged, matching the anchors: `#007cba` on, `#e5e7eb` (gray-200) track off, white knob.
- Mixed checkbox: drawn as the live code paints it, a `#3582c4` border and a `#3582c4` 8×2 bar on white. That is the literal in `packages/settings/src/index.css`, so building it needs no stylesheet change. (Round 1 had painted it `#3858e9`; that is reverted.)

## Drawing notes (not changes)
- The Tooltip is drawn in place above its icon. The real one is portalled and centred on the icon.
- Cashier's defaults are drawn as today plus the new rows: every new row on; Manage POS settings in WP Admin, Delete products and Delete coupons stay off, as WCPOS ships them. That is why "All on" still shows three rows off.
- The POS logo in the brand row is a neutral placeholder.
