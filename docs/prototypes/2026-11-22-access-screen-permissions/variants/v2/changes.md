# V2: summary first — changes from the system today

Layout idea: a panel above the rows says what the role can't do, sorted by what the store does about it (refuses it, stops sending it, only hides it at the till). Below it every row is a switch in its group, and only the five rows that are not a plain refusal carry a line saying what off means.

No token value changes and no new tokens. Every value below is an existing Tailwind v4 / `@theme` value, so there is no `system.html`.

## Elements that change or are new

- new: every task row is a Toggle (`ui/src/toggle.tsx`, label `text-sm font-medium text-gray-900`) instead of a Checkbox, the way the General and Checkout screens draw on/off settings.
- new: Toggle has no mixed position, so a partly granted row (Edit products) is drawn as an off switch with the existing "3 of 7" marker and the Review link beside it. Switching it on grants the rest, as ticking does today.
- new: a "Cashier can't" panel between the header and the first group: `border border-gray-200 rounded-md bg-gray-50 p-3`. Title `text-sm font-semibold text-gray-900`, count "9 of 33 off" `text-xs text-gray-500`, then up to three labelled lines: "Your store refuses", "Your store stops sending", "Hidden at the till" (`text-xs text-gray-500`). Each off row is a neutral Chip (`Chip variant=neutral size=sm`) that links to its switch. With nothing off it reads "{Role} can do everything".
- new: the changed-from-defaults dot (`size-2 rounded-full bg-amber-500`) is also drawn after a row's label and inside a panel chip when that row differs from the WCPOS defaults. Today the dot appears only by the role name and in the header.
- new: group headings: `text-sm font-semibold text-gray-900` with a count at the right ("4 of 6 on", `text-xs text-gray-500`), `pb-1.5 border-b border-gray-200`, `mt-5` between groups.
- new: the three data rows and Orders and Customers use Toggle's `description` (`text-xs text-gray-500`) for their one line, always visible: "Off: your store stops sending …" or "Off hides the menu only; the till still holds this data. Learn more". Orders off adds: "For a real limit on orders, switch off See other cashiers' sales."
- new: Administrator: Use the POS and Manage POS settings in WP Admin are disabled switches (`opacity-50`) with the description "Always on for administrators."
- new: header copy reads "What an Administrator can do". The live string renders "What a Administrator can do".
- new: at 390 px the role list becomes a Select (`ui/src/select.tsx`) under a "Role" label (`text-sm font-medium text-gray-700`), above the header. At desktop width the role list is unchanged.
- Unchanged: role list at desktop width, role dot, info notice, "Restore defaults", header status line, the "3 of 7" marker and Review link, Advanced (last, closed).

## Lock frame (Checkout)

- new: "Automatically show receipt after checkout" is a Toggle with a description. "Cashiers can change this" is a second, small Toggle at the right of the same row, using Toggle's documented small label (`labelClassName="text-xs font-normal text-gray-500"`). The row is capped at `max-w-[600px]` so the two switches stay in reach of each other.
- new: the setting's description changes with the lock: "Each cashier can turn it off on their own till." unlocked, "Set by your store on every till." locked.
- new: "Quick discount keys" is a label, three TextInputs (`w-16`) with "%" after each, a description line, and the same small switch at the right.

## Corrections to match the system (round 1)

- Checked checkbox: a 1 px `#d1d5dc` (gray-300) border around a `#3858e9` fill, with a white tick. These values were measured in `anchors/system-checkout-desktop-light.png` and `baseline-access-cashier-desktop-light.png`. The fill is WP core's Modern admin scheme colour, recorded in `tokens.css` as `--wp-core-checkbox-checked: #3858e9`. V2 draws every row and both lock controls as switches, so no checkbox appears on this page. The correction lives in the shared CSS and `tokens.css` only.
- Switches: unchanged, matching the anchors: `#007cba` on, `#e5e7eb` (gray-200) track off, white knob.

## Drawing notes (not changes)
- Cashier's defaults: every new row on; Manage POS settings in WP Admin, Delete products and Delete coupons stay off, as WCPOS ships them. So at defaults the panel lists those three, with no dots.
- Frames 3–7 are cropped to one group. A dashed rule marks the cut.
