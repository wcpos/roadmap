# Connect, before the register

Open [Connect](index.html), choose Connect in the register’s State strip, or open the
cashier sheet and press Switch store. Connect has no rail or Free strip. The logo sits
above one centred column: on first run, the labelled address, Connect and the quiet demo
button; on return, saved sites, user rows with roles and dot-plus-word status, WordPress
sign-in, store radio cards and Open POS. Another address folds below. Several sites form
a single-open accordion; incompatible sites replace the user/store body with an update
line. Discovery names each step under the field; five errors have their inventory copy
and a docs link. Site and user removal open the shared confirmation sheet.

## Captures to judge

`screens/{phone,tablet,desktop}-{light,dark}-{regular,compact}-{state}.jpg`.
All 18 brief states are captured at all 12 combinations. Where content needs scrolling,
`-below-2.jpg` (and further numbered captures) shows the rest rather than hiding it.

- Start with `tablet-light-regular-first-run.jpg`, `…-typing.jpg`, `…-one-site.jpg` and
  `…-many-sites.jpg`; compare the phone, dark and compact twins.
- `…-discovering.jpg` plus `discovery-1.jpg` through `discovery-4.jpg` show the four
  live stages; `discovery-complete.jpg` shows the newly saved site before sign-in.
- `…-error-wp.jpg`, `…-error-timeout.jpg`, `…-error-host.jpg`, `…-error-woo.jpg` and
  `…-error-update.jpg` show the five failures without a competing toast.
- `…-no-users.jpg`, `…-checking-user.jpg`, `…-expired-user.jpg`, `…-no-stores.jpg`,
  `…-many-stores.jpg`, `…-incompatible.jpg`, `…-remove-site.jpg`, `…-demo.jpg`.
- `field-always.jpg` compares the address switch; `remove-user.jpg` is the user confirm.

## Decisions for Paul

1. **The address on a return visit.** (a) Fold it below “Connect another store” (drawn).
   (b) Always show it. (a) puts the saved shop and Open POS first; (b) saves a tap when
   connecting another address. **Pick: (a)** — returning is the common case. The Field
   switch compares visibility; even “Always” keeps saved sites first, unlike today’s
   address-first order.
2. **Discovery says where it is.** (a) Finding your store → Checking WordPress → Checking
   WooCommerce POS → Saving (drawn). (b) The spinner alone, today. (a) gives a slow store
   a visible next step; (b) is quieter but makes every wait look the same.
   **Pick: (a)** — one changing line, then the site arrives once; no success toast.
3. **Stores are radio cards.** (a) Show the choices inline (drawn). (b) Put them in a
   select. (a) exposes the shop names before Open POS; (b) saves height for long lists.
   **Pick: (a)** — this preserves today’s radio-card behaviour, not a new replacement for
   a select. A lone store is selected; several stores require a choice.
4. **An incompatible saved site.** (a) “Update the WooCommerce POS plugin on this site to
   continue” and a docs link (drawn). (b) Today’s “Please update your WCPOS plugin”.
   (a) names the site and explains why its accounts are absent; (b) is shorter.
   **Pick: (a)** — one sentence, not a disabled set of controls. The discovery error
   retains today’s exact “Please update your WCPOS plugin” copy.

## Verification and boundaries

Run from `/Users/kilbot/Projects/monorepo-v2`:
`node /Users/kilbot/Projects/roadmap/.claude/worktrees/docs+design-program-2026-09-12/docs/prototypes/2026-09-12-language/connect/shoot.js`.
The shoot writes the complete matrix without deleting captures, then types an address,
presses Enter, observes all four progress lines in order and checks the one-site result.
It also exercises the field switch, error reset, store selection, account status gates,
accordion, both removal confirms, demo and the cashier-sheet round trip. Page or console
errors fail the run. Control floors and horizontal overflow are checked in every capture.

This is a local web drawing at three widths, not an authentication implementation.
Discovery takes four simulated steps; it never probes the entered address. A newly
connected site has no users until Sign in with WordPress is pressed; reconnecting an
existing address preserves its users. The sign-in control simulates Alex Morgan returning,
and Re-authenticate simulates renewal of the named account. The external WordPress page,
OAuth cancellation/error/wrong-user returns, storage failures and the inventory’s additional
transport errors are not drawn: this pass covers the brief’s selected states, not those
server- or platform-owned flows. Demo finishes with its own account and store. Open POS
returns to the existing register drawing; it does not establish a real session or change
that drawing’s cashier/store fixtures. Data resets on reload.

Focus lands on the address at first run, then Sign in after new discovery or Open POS for
a ready saved account. A confirm focuses its close control, contains Tab and restores
focus on cancellation. Enter submits the address; arrow keys choose a store. The logo
reuses the app’s geometry in neutral tokens so brand red is not a false destructive cue.

## Behavior changes / regressions

Proposals versus the inventoried screen: address folded and moved below saved sites;
visible discovery lines; readable user statuses; Sign in with WordPress also labels the
additional-account row; sheet removal on the phone; clearer incompatible-site copy;
a docs link for the uncoded WordPress/timeout errors; no duplicated error toast. Radio
cards remain as today. The neutral logo is a drawing adaptation, not a brand ruling.
Only the new Connect paths are evaluated here; broad register/Settings/Orders/Reports
compatibility and native authentication behaviour are not evaluated.
