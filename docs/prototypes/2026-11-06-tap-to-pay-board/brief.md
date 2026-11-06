mode: inside-a-system

# Brief: Tap to Pay on the Card readers page and in the pay sheet (roadmap#113 slices 2 and 3)

Spec: `docs/specs/2026-11-06-tap-to-pay-flows-spec.md` (roadmap#565), section "Options board".
Repo whose system this is: wcpos/monorepo `main` (tokens `apps/main/global.css`, components
`packages/components/src`). Tokens extracted verbatim to `variants/tokens.css`.

## Subject

Two screens of the native phone app (iPhone first, Android the same layout), each with one job:

1. **Settings › Card readers** on a till whose store allows both smart readers and the app's own
   readers for the same Stripe gateway. Job: the cashier sees which reader this till pays with and
   an administrator can set up Tap to Pay on this phone.
2. **The pay sheet** (tender pane) on that same phone. Job: take the money with the reader the
   till chose, with Tap to Pay reachable in one tap.

## Who stands in front of it

A cashier at a counter, standing, phone in hand, customer waiting. Sometimes a stall-holder who
last opened the app four months ago. Sometimes the store's administrator doing one-time setup.

## The problem, in the reporters' words

- Paul, 2026-10-06, after the first WisePad run: *"this is a little messy doing this on the checkout
  page … we should have a page in the settings for terminals, like we do for printers. That way we
  can connect and give more information."* and *"there has to be a way to disconnect from the POS."*
- Paul, 2026-11-05, on readers per till: *"A user has already asked about this, I think we will
  need to support different methods per device, eg: tap to pay on the mobile, terminal on the
  desktop and legacy on the web."* and 2026-11-06: *"I think this will be a common request from
  users to have one till going over Bluetooth and one over wifi etc. We should make sure we get
  this right."*
- Apple's review checklist (research doc §4b): the Tap to Pay button in checkout is *"prominent,
  reachable without scrolling, first in the list when several payment options exist, never greyed
  out or hidden"*; enablement is *"reachable from settings, not only at checkout"*; terms are
  accepted *"only by an administrator or authorised party, with a contact-an-admin message for
  anyone else"*; a configuration progress indicator while the phone is prepared.

## What exists today (rehost it, do not simplify it)

**Card readers page** (`packages/core/src/screens/main/settings/card-readers/`): page title in the
settings bar, intro line "Readers this till can take card payments with.", then sections built
with `SettingsSection` (title, one-line description) holding `DeviceList` of `DeviceRow`s:

- **Smart readers** (landed 2026-11-06, monorepo#3322). Description: "The store drives these over
  the network. This till pays with the selected one." One row per cloud reader: `icon="card"` in a
  40 px tinted square, name (subheading), the gateway as a muted `Badge` tag ("Stripe"), second line
  identifiers joined by " · " (location, and "Set by the store" under a lock), a state word with a
  tone dot ("Online" ok / "Offline" muted). Action slot: the chosen reader shows a read-only
  `Chip` **Selected** (`on` state: `bg-selected border-selected text-selected-foreground`); every
  other online reader shows a ghost `Button` **Use this reader**; under a store lock, no buttons.
- **This phone**: the Tap to Pay row (title "Tap to Pay on iPhone", sub "Take contactless payments
  with this iPhone"; Android: "Tap to Pay on Android" / "…with this phone") with an admin-only
  **Set up** button, or the line "Not set up · ask an administrator" for a cashier; once set up and
  connected the row is "This device" with state "Ready" (ok). While preparing: a `Progress` bar with
  a percentage and "Preparing…". Below iOS 17.6: "Update iOS to use Tap to Pay".
- **Bluetooth readers**: one row per connected or remembered Bluetooth reader (name, serial as
  identifier, provider tag, "Connected · 82%" ok / "Not connected" muted), actions **Disconnect** or
  **Connect**, and a ⋮ overflow (Forget, Help). An empty section shows "Connect a reader" (+) and
  the "Having trouble?" docs link.

DeviceRow classes: wrapper `gap-3 py-3` with `border-border border-t` between rows; `flex-row
items-center gap-3`; icon square `size-10 items-center justify-center rounded-lg` + tone tint
(`bg-muted` muted, `bg-ok/15` ok); body `min-w-0 flex-1 gap-0.5`; name `Text variant="subheading"`;
tag `Badge variant="muted"`; actions `shrink-0 flex-row items-center justify-end gap-2`.
Chip: `bg-chip rounded-chip border-[var(--shape-ctl-border)] border-chip-border flex-row
items-center gap-1.5 px-3 h-11` (44 px control height), `on`: `bg-selected border-selected
text-selected-foreground`. Buttons: 44 px high, `rounded-control`, ghost = no border, text only.

**Pay sheet** (`packages/core/src/screens/main/pos/checkout/tender/tender-pane.tsx`): header
"Pay order #1024" with × and a Payments / Legacy segmented control; TOTAL label and the one big
figure ("18,00 £", tabular); a Split button; then a `TileGrid` (2 columns on a phone, 5 on a
tablet) of `Tile`s: `bg-card rounded-tile border border-border`, `min-h-tile grow flex-col
items-center justify-center gap-1 px-2 py-2`; selected tile `border-primary bg-muted`; each tile
has an icon, a title (subheading) and an optional help line ("Works offline" badge, or a reason
such as "No terminals set up"). Order today: Cash, Card, then the gateways in the store's order.
A gateway with a connected device reader shows the reader's name on its help line ("This device"
for Tap to Pay, the reader's name for Bluetooth, the smart reader's name for a cloud reader).
A disabled tile is dimmed with its reason in one line and never a wall of text.

## States each variant must render

Subject 1, Card readers page (phone 390 wide, light and dark; tablet 768 wide, light):
- S1 all three sections populated: two smart readers (one Online and selected, one Offline), the
  Tap to Pay row **not set up**, viewed by an **administrator** (Set up offered), one Bluetooth
  reader remembered but not connected.
- S2 same, viewed by a **cashier** (no Set up; the "ask an administrator" line).
- S3 Tap to Pay **preparing** at 40 %.
- S4 Tap to Pay **ready and selected** (This device · Ready), smart reader rows no longer selected.
- S5 Bluetooth reader **connected and selected**, Tap to Pay set up but not the chosen one.
- S6 the **awareness sheet** opened from Set up (iOS, Apple's copy and the wave symbol, one
  Continue) and the Android equivalent (one pre-alert line, then the SDK's own terms).
- S7 below iOS 17.6 ("Update iOS to use Tap to Pay"), and the store-lock case on the smart rows.

Subject 2, Pay sheet (phone 390 wide, light and dark; tablet 768 wide, light):
- P1 Tap to Pay set up: the Tap to Pay tile and the Stripe tile both present, with Cash, Card,
  Mollie Terminal, SumUp Terminal (six gateways is normal).
- P2 Tap to Pay **not set up**, administrator: the tile is still there, tapping it opens terms.
- P3 Tap to Pay not set up, cashier: the tile present, the one-line "Ask an administrator" after a
  tap, with the link to Settings › Card readers.
- P4 a smart reader selected on the page: the Stripe tile carries that reader's name; Tap to Pay
  tile still present.
- P5 two providers both set up for Tap to Pay (Stripe and SumUp).
- P6 the phone offline: tiles that need the network say so in one line; Tap to Pay stays visible.
- P7 the terminal moment's first step for a Tap to Pay leg ("Getting ready" with the fixed amount).

## The four questions the board answers (one frame set per question, inside the variants)

1. **The Selected mark on the phone's own rows**: Smart readers already use a read-only Selected
   chip in the action slot. Where does it sit on the This phone row and a Bluetooth row, which also
   carry a state line and Connect / Disconnect? Candidates: the chip in the action slot beside
   Disconnect; the chip after the state word; the chip replacing the state word; the chosen row
   lifted into This phone as "Paying with".
2. **The Tap to Pay tile beside the gateway's own tile** when the same gateway also has a smart
   reader selected: two tiles in the card group; Tap to Pay first and the Stripe tile carrying the
   reader's name; the Stripe tile hidden while Tap to Pay is set up (shown to be ruled out).
3. **Two providers both set up for Tap to Pay**: one tile owned by the most recently set up; one
   tile per provider with the provider as the help line; a picker inside the first step; refuse the
   second set-up with a line naming the first.
4. **The awareness sheet** and the Android equivalent.

## Widths and themes

Phone 390 × 844 (the narrowest a cashier screen must survive), tablet 768 wide (the rail layout
begins at 768 × 480). Light and dark, both first-class. Themes come from `tokens.css`; the page
reads `body[data-theme="light"]` / `"dark"` and must switch when `<html data-theme="dark">` is
set (the shoot script injects it): add `html[data-theme="dark"] body { … }` mirroring or copy the
dark block under that selector.

## Constraints (binding, from monorepo `CODING_STANDARDS.md` § Design)

- One number, one action per screen. The pay sheet's figure leads; nothing competes.
- Touch first: 44 × 44 pt minimum targets, 48 preferred; tiles the cashier hits every sale at
  least 56 pt tall; 8 pt gaps; destructive apart from constructive; a visible pressed state.
- Apple's grammar: sheets for short tasks, full-screen for multi-step; back points where the
  content goes; system fonts; tabular numerals; nothing under 12 px, nothing the cashier reads at
  arm's length under 14 px; base 16 px native.
- Layout is a grid, not a wrap: tiles equal width in fixed columns, order kept, width never
  follows label length. Phones two columns.
- State is visible, not explained: one badge in one place; a disabled control says why in a few
  words beside it; unavailable options folded or dimmed, never competing at full size; an error,
  empty or trouble state is one line, the actions and a docs link; never colour alone.
- Calm colour, semantic tokens only (`bg-background`, `bg-card`, `text-muted-foreground`,
  `bg-primary`, `bg-selected`, `text-destructive`, `bg-success`…); one accent per screen; red is an
  action (void, cancel), never a state; flat surfaces, hairline borders, one radius per theme; no
  gradients, glass or decorative shadows.
- Words the cashier uses: buttons are verbs with the object; no label that repeats the element;
  plain words; must survive German length.
- Apple's Tap to Pay rules: the button says "Tap to Pay on iPhone" ("Tap to Pay" when short), the
  `wave.3.right.circle` symbol, never the Apple logo, never greyed or hidden, first among the card
  options; Android says "Tap to Pay".
- Complexity is hidden, never removed: every control that exists today stays reachable.

## House defaults to avoid

Cream backgrounds, italic accent words, 01/02/03 section labels, monospace labels, pill buttons
where the system uses `rounded-control`, hairline broadsheet rules, decorative illustration,
emoji, mascots.

## Assumed

- assumed: the gateway's own tile keeps its title as the merchant named it ("Stripe Terminal") and
  the Tap to Pay tile has no provider name on its face; the provider appears only on its help line
  when two providers are set up (question 3).
- assumed: the awareness sheet uses Apple's published copy block for Tap to Pay on iPhone and the
  app's `bg-background`; no imagery beyond the system symbol.
- assumed: "Paying with" (question 1, candidate 4) would move a row between sections and is drawn
  only to be judged, not favoured.
