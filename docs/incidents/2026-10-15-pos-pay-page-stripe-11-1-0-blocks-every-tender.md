# Incident: Stripe 11.1.0 blocks every tender on the POS pay page (2026-10-15)

**Impact:** on any store running WooCommerce Stripe 11.1.0 with the gateway enabled, pressing Process Payment at the POS failed for every payment method, including Cash. The frame showed "Payment failed. Please try again." and the spinner never stopped. Two merchants reported it on 2026-10-15 (biltongusa.com and daylightdonutstricities.com). The exposed population is every WCPOS store with Stripe enabled that has taken Stripe 11.1.0 since 2026-10-13, on both the free and Pro plugins, every POS platform.

**Severity:** high. A till that cannot take cash is a closed till. The failure is total for the affected store and the merchant cannot tell which plugin caused it.

**Root cause, in one sentence:** our pay page has been loading Stripe's classic checkout script for about two years without meaning to, because our dequeue pass runs before Stripe enqueues, and Stripe 11.1.0 changed that script to block the pay form whenever the selected method is not a Stripe method.

## How the pieces fit

The POS checkout for Cash, Voucher and third-party gateways opens the store's own pay page in a frame (`/wcpos-checkout/order-pay/{id}/`). The free plugin renders it with its own template (`includes/Templates/Payment.php`, `templates/payment.php`) and forces `is_checkout()` true so gateways behave as they do on WooCommerce's pay page. Process Payment posts a message into the frame; the template clicks the hidden `#place_order` button; WooCommerce's `#order_review` form submits as an ordinary POST.

Any gateway script loaded on that page can bind the form's submit event. To keep the page clean, the template dequeues a merchant-editable list of script and style handles (defaults in `includes/Services/Settings/Checkout_Section.php`; the "Checkout Settings" button on the pay page edits it). The list has named Stripe's classic script `wc-stripe-upe-classic` since v1.4.0 (2023-11-18). The dequeue runs once, at `wp_enqueue_scripts` priority 100.

WooCommerce Stripe enqueues that script from a `wp_footer` callback, not from `wp_enqueue_scripts`. This has been true in every release checked back to 8.0.0 (2024). So the handle was never in the queue when we looked, and Stripe's script has loaded in the footer of every POS pay page on every Stripe-enabled store since then. Its submit handler calls `processPayment()` for whatever method is selected; for a non-Stripe method it found no Stripe element and, up to 11.0.1, returned silently, so the form submitted and nobody noticed.

Stripe PR #5880 (merged 2026-09-17, first shipped in 11.1.0 on 2026-10-13, changelog line "Show an error before submission when required custom checkout fields are empty in Classic Checkout") changed that branch to show the generic error and return `false`, which prevents the submit. From that release on, Cash cannot be submitted while Stripe's script is on the page.

A second, unrelated crash was found in the same store's fatal-errors log during the investigation: PayPal Payments enumerates all gateways on the `wp` hook, which makes PayArc's SkyVerge framework call `wc_get_order()` on the `order-pay` id before our router has validated it. A POS checkout URL whose order does not load fatals inside third-party code. It is not the cause of this incident but it is fixed in the same PR.

## What happened

| Time (UTC) | Event |
|---|---|
| 2023-11-18 | `wc-stripe-upe-classic` added to the pay-page dequeue defaults (free v1.4.0). The intent was right; the hook was too early for Stripe's enqueue and nothing tested that the handle actually left the page. |
| 2024–2026 | Stripe's classic script loads in the POS pay-page footer on every Stripe-enabled store. Harmless: its handler returns silently for non-Stripe methods. |
| 2026-09-17 | Stripe #5880 merged: the silent return becomes "Payment failed. Please try again." plus a blocked submit. |
| 2026-10-13 | Stripe 11.1.0 released with that change. WordPress auto-updates begin rolling it to merchants. |
| 2026-10-14 | WCPOS 1.11.0 released (free and Pro). Its pay path changed 47 lines, none in script handling. |
| 2026-10-15 10:35–10:39 | Paul reproduces on biltongusa.com: four attempts, every method fails. Because 1.11.0 is a day old, the report reads as a WCPOS regression. The fatal-errors log shows the PayArc crash, which sends the first investigation after our plugin's order reads. |
| 2026-10-15 ~10:50 | Codex drives the owner's browser: Cash attempt fails with the notice in the frame and **zero** `order-pay` requests in the Network tab, and no new fatal is logged. The failure is client-side, before any request. |
| 2026-10-15 ~11:15 | The notice string is traced to Stripe's `client/classic/upe/payment-processing.js`; the 11.0.1 → 11.1.0 diff shows the blocking change; Stripe's `wp_footer` enqueue explains why our dequeue never applied. Both stores confirmed on 11.1.0 (their `changelog.txt`; Stripe's `readme.txt` "Stable tag" still says 11.0.1 in the 11.1.0 build, so it is not a version indicator). |
| 2026-10-15 ~11:25 | daylightdonutstricities.com pay page fetched: `upe-classic.js` and `wc_stripe_upe_params` present with only Cash and Stripe Terminal on offer. |
| 2026-10-15 ~11:35 | Hotfix applied on daylightdonutstricities.com by editing Pro's `includes/Templates.php` (`init_payment_template()` now dequeues the handle at `wp_print_footer_scripts` priority 1). Re-fetch shows the script gone; Paul confirms Cash payment works. **biltongusa.com still needs the same edit** at the time of writing. |
| 2026-10-15 ~11:50 | Plugin fix opened as wcpos/woocommerce-pos#2269 (free, `main` lane) for the 1.11.1 patch. Full PHPUnit suite green (5231 tests); mutation check shows both new tests fail without the fix. |

## Why the checks did not catch it

- **No test ever asserted the outcome.** The settings tests check that the default list contains the handle; nothing loads the pay template with a footer-enqueued script and checks the printed footer. A test of the list is not a test of the page.
- **The dev stores have no WooCommerce Stripe.** `dev-free`, `dev-pro` and `dev-next` do not have `woocommerce-gateway-stripe` installed at all; only the demo store does, at 11.0.1. Every Playwright and Maestro checkout run exercised a pay page with no Stripe script on it. The web E2E suite covers a Cash sale on the pay page and passed truthfully against what it was shown.
- **Nothing runs between our releases.** Every E2E run is triggered by our own pushes. A third-party plugin update on a quiet day changes the merchant's page and nothing of ours re-tests it. The only scheduled jobs are screenshot cleanup and the worker-drift check.
- **The release checklist has no checkout smoke on a gateway-equipped store.** `docs/releases/RELEASE-CHECKLIST.md` gates the bundle, the worker and the tags; it does not ask anyone to take a Cash payment on a store that carries the gateways merchants run. The demo store, the only one with Stripe, was on 11.0.1 anyway, so even that smoke would have passed this time.
- **The pay page has no way to say "a script blocked the submit".** The app waits for a payment-received message or a server status change. When a frame script prevents the submit, the app sees nothing and spins. No client error code, no Sentry event, no notice text captured. The merchant sees a generic failure and we see nothing at all.
- **The first signals pointed elsewhere.** A one-day-old release and a PHP fatal in the log were both real and both irrelevant. The handoff that followed them named Pro's sync scope as the lead; Pro hooks nothing on order reads. The fatal's backtrace, which was in the log's "Additional context" expander the whole time, settled that in one read.

## The fix

**On a live store today (until the patch ships):** either a WPCode / Code Snippets PHP snippet, or, where only the plugin editor is available, the edit to Pro's `includes/Templates.php` that daylightdonutstricities.com now carries. Both dequeue `wc-stripe-upe-classic` at `wp_print_footer_scripts` priority 1 on POS checkout requests. The plugin-editor edit is lost at the next Pro update, which is fine because that update carries the real fix.

**In the plugin (free `main`, wcpos/woocommerce-pos#2269, ships as 1.11.1 free and Pro):**

1. `Templates\Payment` runs `remove_scripts_and_styles()` again at `wp_print_footer_scripts` priority 1, so the merchant's dequeue list binds the whole page, head and footer. No new setting, no Stripe-specific code; the default list already names the handle. A PHPUnit test enqueues a listed handle from `wp_footer` and asserts it is not printed while a control handle is.
2. `Template_Router::maybe_set_checkout_context()` (already at `wp` priority 1) answers 404 for a POS checkout URL whose order does not load, before any other plugin's `wp` hook can crash on it. Covered by a test on the router.

**Upstream:** Stripe's handler should return early when the selected method is not one of its own, as 11.0.1 did. Issue text is drafted (`stripe-upstream-issue.md` in the 2026-10-15 session scratchpad) and not yet filed.

**free PR #2268 must not merge.** It removes `wc-stripe-upe-classic` from the dequeue defaults to let Stripe work as a POS tender (free #1755). Under 11.1.0 that would put every store in this incident's state deliberately. Stripe as a POS tender cannot coexist with other tenders on one pay page until Stripe fixes the handler.

## Safeguards

Done or in flight:

1. **The dequeue list binds the whole page**, with a test that checks the printed output, not the setting. *(in the fix PR)*
2. **An unloadable order answers 404 before third-party `wp` hooks run.** *(in the fix PR)*
3. **Memory note** `pay-page-dequeue-must-bind-the-footer` records the signature (every tender fails, no request leaves the frame), the Stripe facts, and the "readme Stable tag is not the version" trap. *(done)*

Proposed, for Paul's call:

4. **Put the real gateways on the dev stores.** Install and enable WooCommerce Stripe, PayPal Payments and Square on `dev-pro` and `dev-next` in test mode, auto-update on. The pay page under test then carries the scripts merchants' pages carry. Cost: a test-mode account per gateway and a one-off seed.
5. **A scheduled checkout canary.** Run the web E2E Cash-sale spec against `dev-pro` nightly, independent of our pushes, so a gateway update between our releases turns a run red before a merchant calls. The spec exists (`apps/main/e2e/pos-checkout.spec.ts`); the missing piece is a `schedule:` trigger and a notification.
6. **The frame reports a blocked submit.** The pay template's message handler already clicks `#place_order`; it can also observe whether the submit was prevented (a submit event whose default is prevented, with no navigation inside a short window) and post `wcpos-payment-blocked` to the app with the notice text and the list of script handles on the page. The app turns that into a named error code (registry entry, toast naming the script, Sentry event). The merchant then reads "a checkout script (wc-stripe-upe-classic) stopped the payment" instead of "Payment failed", and support reads a count across installs instead of nothing.
7. **The troubleshooting form lists footer handles too.** Today it lists only handles queued when the body renders, so a merchant could not have unticked Stripe's script even if they had guessed. Rendering the list from the final queue, or adding footer-enqueued handles to it, makes the self-serve path real.
8. **A triage tripwire for "started with your release".** Before bisecting our own diff, list third-party plugin releases dated within a few days of the report (Stripe's was the day before ours) and read the fatal log's full context. Both would have shortened this by hours. Goes in the diagnosing skill.
9. **File the Stripe issue and answer #2268.** Outward-facing, so they wait for a go.
