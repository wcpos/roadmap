# Settings, in the register’s language

Open [Settings](index.html), or the register’s gear. The phone’s Menu lists it too.
The page keeps its own State while moving between Settings, POS, Orders and Reports.

The bar and the six-section list lead to the app’s quiet, labelled rows: Store,
Localisation, Currency and numbers; mirrored tax settings above the editable calculation
and display choices; printer rows and template routing; display pairing and paired devices;
scanner sources, detection, sound and the detected test verdict; then System and the nine
theme previews, with Scale below. General has 15 controls including Restore. Loading keeps
the heading and section shell, not invented skeletons. Printer discovery and editing slide
from the right; confirmations use the shared sheet. Changes save as they are made, with one
local completion beat rather than a toast.

## Captures to judge

`screens/{phone,tablet,desktop}-{light,dark}-{regular,compact}-{state}.jpg`.
All 20 brief states are captured; `index` is phone-only. Long sections and panels also have
`-below-2.jpg`, `-below-3.jpg`, etc., so the foot and folded-page content are not silently lost.

- Start with `tablet-light-regular-general.jpg` and its `-below-*` continuation;
  compare `phone-light-regular-index.jpg` and `phone-light-regular-general.jpg`.
- `tablet-light-regular-general-saved.jpg`, `…-general-restore.jpg`,
  `…-general-restore-failed.jpg`; `saved-header.jpg` and `saved-none.jpg` compare the switch.
- `tablet-light-regular-tax.jpg`, `…-printing.jpg`, `…-printing-empty.jpg`,
  `…-printing-test.jpg`, `…-printing-wizard.jpg`, `…-printing-saved.jpg`,
  `…-printing-edit.jpg`, `…-printing-delete.jpg`; inspect their phone and dark twins.
- `tablet-light-regular-theme.jpg`, `…-display.jpg`, `…-display-locked.jpg`,
  `…-scanning.jpg`, `…-scanning-sound.jpg`, `…-scanning-register.jpg`, `…-loading.jpg`.
- `display-empty.jpg`, `display-pairing.jpg`, `display-forget.jpg`, `printer-printed.jpg`,
  `scanner-detected.jpg`, and `restored.jpg` record the extra interaction stops.

## Decisions for Paul

1. **Page shape.** (a) A left section list and quiet rows; phone index and a back bar
   (drawn). (b) One long page. (a) keeps the app’s learned navigation and shows where you
   are; (b) makes browsing everything easier but puts every field in the way.
   **Pick: (a)** — navigation-area’s ledger already makes this rule.
2. **Saved.** (a) Check + Saved beside the changed control for 1.2 s (drawn).
   (b) Saved · just now in the header. (c) Nothing, today. (a) answers where the hand is;
   (b) is quieter when several fields change; (c) leaves instant saving invisible.
   **Pick: (a)** — opacity only, no toast, no Save button. The strip compares all three.
3. **The four address rows.** (a) Values, “Set in WooCommerce, mirrored here.” and
   Open WooCommerce settings (drawn). (b) Disabled inputs, today. (a) says why the values
   cannot be edited and where to go; (b) preserves the form shape but not the explanation.
   **Pick: (a)** — the Tax page’s existing treatment, not a second rule.
4. **Restore and Delete printer.** (a) Confirm sheets (drawn). (b) Execute immediately,
   today. (a) costs a tap on rare destructive actions; (b) is faster but can erase local
   changes or a printer setup by accident. **Pick: (a)** — parity with Forget display.
   Restore finishes at its row with Restored; failure is “Couldn't reach the store · Try again”.
5. **The printer wizard.** (a) The register’s right slide-out, full page on a phone (drawn).
   (b) A centred dialog. (a) leaves the printer list as context and gives the form room;
   (b) feels smaller but makes the phone a cramped form. **Pick: (a)**. Editing shares the
   panel, with Advanced closed as this brief asks (today editing opens it).
6. **Scale lives under Theme.** (a) Compact / Regular / Spacious plus Auto (drawn).
   (b) Leave scale solely to the device. (a) gives the counter a discoverable override;
   (b) removes a decision but cannot accommodate a particular screen or cashier.
   **Pick: (a)**, with Auto’s device mapping spelled out. This is placement, not a ruling
   on #289’s production mechanism.

## Verification and boundaries

Run from `/Users/kilbot/Projects/monorepo-v2`:
`node /Users/kilbot/Projects/roadmap/.claude/worktrees/docs+design-program-2026-09-12/docs/prototypes/2026-09-12-language/settings/shoot.js`.
The shoot captures the full matrix, checks a changed value produces Saved and fades,
and fails on any page or console error. It never deletes captures.

This is the web-platform drawing at three widths, not three operating systems. Native-only
vibration and Android Bluetooth settings are not presented as web controls. No network or
hardware is connected: pairing, print dispatch, restore, clipboard and sound previews are
simulated; external-store destinations are explicitly labelled prototype sheets. Local edits
survive page navigation, not reload. Only the requested printer results/saved/edit drawings
and detected scanner verdict are evaluated; the inventory’s other hardware-error and discovery
phases remain outside this pass. There is no production persistence or performance claim.

## Behavior changes / regressions

Proposed differences from the inventoried app: visible Saved; mirrored address values;
Restore and printer Delete confirm; row-local print completion instead of a toast; restore
failure is visible; Advanced starts closed in printer editing; nine theme previews and Scale.
Settings is newly reachable from the prototype rail and phone menu. Existing register, Orders
and Reports behavior is not broadly regression-tested by this Settings-only shoot.
