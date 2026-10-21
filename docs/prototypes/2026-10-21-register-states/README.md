# Register states, alert bands and the admin setup — decisions of 2026-10-21

Self-contained board: open `index.html` (no build, no server). Paul walked it section by section on 2026-10-21 and decided every open item in the same session. The board keeps the rejected variants greyed so the comparison stays honest; the change log at the foot is the sequence.

## What was decided

**POS screen (wcpos/monorepo, `next`)**

1. **Products column while the register is closed or counting → 1A.** The existing `Notice` component, info tone, the Tabler outline lock added to the icon set (the bespoke `icon/components/lock.tsx` deleted), status only, no action. The Open register card already occupies the cart column on exactly the condition the band renders, so an action went nowhere. 1B (toast), 1C (status beside the search) and 1D (band as the action) are out.
2. **No register for this store → 2A.** The cart column becomes the gate card (`EmptyState`, icon cash-register, one line, Try again, a docs link; "Open Registers" for a user who can manage the store). The bar pill gains a **No register** word; the failed-directory case (unbound, list request failed) uses the same card with "Can't reach this store's registers". Today the pill says "Closed" because `describeRegisterBar` has no `none` branch.
3. **Register picker (store with 2+ registers, device unbound) → 2P·A.** The column is the picker: one question as the title, one 56 pt row per register with the name and the live state as a dot and a word (Open since 09:02 · Amy Okafor / Closed · last closure #41 / Counting · Demo Cashier), a footer line pointing to the avatar's Switch register. Today's picker says "Not opened" on every row.
4. **Every inline alert goes onto `Notice`.** Section 4 is the inventory (3 uses, 22 hand-rolled bands in 13 files, five tint recipes); section 5 renders each one today and on `Notice`. Three keep their own shape with the aligned surface: the cart conditions list (per-line fixes), the Upgrade to Pro strip (promo, moves off the warning colour), Health's left-edge callout (to be ruled or folded). The storage-unavailable box copied into three checkout files becomes the one `StorageOutageBanner`. Success results are a line with a check, never a green band.

**WP admin (wcpos/woocommerce-pos and wcpos/woocommerce-pos-pro, `next`)**

5. **Section 6 → A with C.** Registers live on the store they belong to:
   - Free, and Pro with no Store post, use **POS › Settings › General › Register**: the switch, opening float, approval limit, closing reminder. No Registers page, no name field (a lone register is unnamed in the POS). Pro-without-a-store gets one line under the fields: "To run more than one register, create a store and add registers on its page · Add store".
   - Pro with stores: the **store edit screen** (POS › Stores › *store*, its own WP screen, right column, between Store Settings and Opening Hours) keeps its Register section and gains the store's **register list** under it: name, default float, live status, row menu (Rename, Move to…, Retire), one "Add register" row. The Stores list gains a Registers column.
   - **Settings › Registers is deleted** in both editions.
   - **C, policy flows down:** General holds the site defaults; on a store screen each policy field is *Site default* or *Overridden* (chip + Customise / Use site default), as the page already does for logo, timezone and tax IDs. The verbatim-replace behaviour on `next` is code to change. **No migration**: 2.0 is the first release with registers, so no 1.11.x store holds any of these values.
6. **Section 7, the settings themselves.** One switch, "Open and close the register", then sentences with the value inside them: Opening float [£ 200.00]; "Ask a manager when the count is out" → "by more than [£ 5.00]"; "Remind the cashier to close" → "at [17:30]" (time picker). Help lines say what happens at the till. "Leave blank for none" is gone. Eight settings guidelines (section 7's table) are proposed as a new section 11 of the monorepo's `.claude/rules/design.mdc`.
7. **Section 8** maps the three sites: Free; Pro with no stores (exactly Free: the same option register, a second refused); Pro with several stores and registers each (meta rows per store; the option register adopted onto the first published store; each later store seeded with one).

## Facts verified in code while deciding

- Free mints its one register lazily (`Register_Store::ensure_free_default()`); Pro seeds one per store on publish (`Registers::publish_store()`) and backfills every published store on activation and in `updates/update-2.0.0.php`. "No register" is therefore an anomaly state, never a first-run state.
- The app's directory (`services/register/use-register-binding.ts`) reads `GET /registers?store_id=N`: an empty list is `none`, a failed request stays `unknown`.
- The main-lane plugins have no `/registers` route at all.

## Follow-ups

Three work packages, filed as roadmap tickets (see the PR that landed this folder): the POS states and the `Notice` sweep; the admin rebuild and settings redraw; the design-rules addition. Amends #213's "threshold and close time per store" to "site default with explicit override per store".

Related: roadmap#214 (the register prototype and its rulings), #202 (the wayfinder map), #195 (the epic).
