mode: inside-a-system

# Brief: the Access screen for v2.2.0

Ticket: wcpos/roadmap#613 (map #599). The system is the Free plugin's WP Admin settings app: `packages/settings` drawn with `packages/ui` (Tailwind, prefix `wcpos:`, WP Admin theme colour). WP Admin has one theme: light only. No dark theme exists; do not invent one.

## Subject

One screen, one job: **WP Admin › POS › Settings › Access**. A shop owner picks a role and decides what that role may do at the till.

A second, small frame belongs to the same job and the same system: **one store-wide till setting with its lock**, as it appears on the Checkout settings section.

## Who stands in front of it

A shop owner or manager, at a desk, in WP Admin, a few times a year: when they hire someone, or after something went wrong (a refund they did not expect, a cashier who saw the margins). Not technical. They know the words refund, discount, void, cost, cash drawer. They do not know the word "capability".

## The problem, in the reporters' words

- Paul: "Store Owners want more control over which users can perform which tasks."
- Paul: "some settings might be prevented at an API level, others might just be limited in the app" and "if items are limited in the app, we need to figure out how a global user can assign the permissions".
- A merchant: "Hiding the column is not enough: cost data must not be sent to cashiers."
- A merchant: "I want to turn off 'Automatically show receipt after checkout' as a general setting, but I need to go into each cashiers account and turn it off myself."
- The staff-identity research: "a role whose contents cannot be read is a mistake."

## What the screen must carry

Today the screen shows 9 task rows for the selected role (see `anchors/baseline-*`). In v2.2.0 it carries the rows below. Every row is on or off for the selected role. Names are final; do not reword them.

**Using the POS** (existing rows, keep): Use the POS · Manage POS settings in WP Admin

**Selling**: Give a discount · Change a line's price · Apply a coupon · Add a custom item, fee or shipping · Change tax or mark a sale tax exempt · Void an open sale

**After the sale**: Refund · Reopen or edit a completed sale · Change an order's status · Reassign a sale's cashier · See other cashiers' sales · See other stores' sales (Pro only; absent in Free)

**Customers**: Add a customer · Edit a customer · See customer contact details

**Products**: Edit products · Delete products · Change stock levels · See cost, profit and margin · Manage coupons · Delete coupons · Manage categories

**Cash**: Open and close the register, cash in and out · Open the drawer without a sale · See expected cash · Approve a variance or recount

**Pages**: Reports · POS settings · Store health and logs · Orders · Customers

Two kinds of promise, which the owner must be able to tell apart without reading documentation:

- **Enforced by your store**: the store refuses the action or withholds the data, whatever the till shows. Every row except two.
- **Hidden at the till**: the Orders and Customers page rows only. The menu entry is gone, but "the till still holds this data". An owner who wants a real boundary on orders uses "See other cashiers' sales".

Three rows withhold data rather than block an action (See cost, profit and margin · See customer contact details · See expected cash). Switching one off means the store stops sending that data to this role's tills. "See expected cash" off is the blind count.

## Existing controls: they stay where they are

The role list on the left, the changed-from-defaults dot, the "Restore defaults" button and its confirmation dialog, the info notice with the documentation link, and the "Advanced" disclosure of raw capabilities all exist today and stay. A variant may restyle how rows are grouped and read; moving or removing one of these controls is a `new:` line in `changes.md`.

## Start and end state

Start: the owner opens Access; the Cashier role is selected; everything is on (every new permission starts switched on). End: they have switched off what they want for Cashier, can see at a glance what Cashier may no longer do, and leave. Changes save on click (as today); there is no Save button.

## States every variant must draw

1. **At the WCPOS defaults**: Cashier the day after upgrade. Every new row is on; the three rows WCPOS has always left off for Cashier (Manage POS settings in WP Admin, Delete products, Delete coupons) stay off. (Corrected after round 1: this line first read "all rows on", which was never a real state.)
2. **Restricted**: Cashier with Refund, Give a discount, Change a line's price, See cost, profit and margin, See other cashiers' sales and the Reports page off. The changed dot and Restore defaults enabled. The owner must be able to read what is off without scanning 30 rows.
3. **A "hidden at the till" row**, on and off, with its plain-words explanation reachable.
4. **A data row** off, with what it means reachable ("your store stops sending cost to cashiers' tills").
5. **Partially granted group**: an existing multi-capability row (Edit products) in the mixed state with its "3 of 7" marker and Review link, as today.
6. **Administrator selected**: rows that cannot be removed from administrators (Use the POS, Manage POS settings in WP Admin) shown as not switchable.
7. **Pro row**: "See other stores' sales" present (Pro active). In Free it is absent, not greyed.
8. **Advanced** disclosure closed (default) and its place on the page.
9. **Loading**: the screen before the roles arrive.
10. **Narrow**: 390 px wide WP Admin. The role list and the rows must both remain usable.
11. **The lock frame** (Checkout settings): "Automatically show receipt after checkout" with its store-wide value and the switch "Cashiers can change this", drawn twice: unlocked, and locked. A second setting, "Quick discount keys" (three percentages), in the same pattern.

## Widths and themes

Desktop 1280 (the settings app sits inside WP Admin, right of the admin menu; draw the content area, about 1040 px, with the WP Admin menu indicated at the left as a plain dark bar) and phone 390. Light only.

## Constraints

- Draw with the real components and class strings from `packages/ui/src` (`checkbox.tsx`, `toggle.tsx`, `chip.tsx`, `button.tsx`, `notice.tsx`, `form-row.tsx`, `form-section.tsx`, `nav-*`, `modal.tsx`, `tooltip.tsx`, `skeleton.tsx`) and the current screen `packages/settings/src/screens/access/index.tsx`. Open each component and copy its classes; never guess.
- Colour is a signal: the palette is the system's greys plus the WP Admin theme colour for on-state and selection; amber is already the "changed" signal. Do not add a new hue for the two tiers unless it is a `new:` line.
- Complexity is hidden, never removed: all rows must be reachable; explanations may be tucked away but must be reachable without leaving the page.
- No walls of text: an explanation is one line, plus a docs link where needed.
- Every label is a word the owner would say out loud. No capability names outside Advanced.
- No JavaScript. States are drawn as separate frames on the page, each with a small caption above it naming the state.
- assumed: the till-side rendering (a control gone, a read-only field, "Set by your store" on a locked setting) is fixed by ruling (#605) and is not drawn here.
- assumed: saving stays instant per click with the existing snackbar; no bulk "save" is introduced.
- assumed: groups are the six in the list above plus "Using the POS"; group names are final.
