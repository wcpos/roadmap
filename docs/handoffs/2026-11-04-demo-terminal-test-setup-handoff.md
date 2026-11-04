# Handoff: card terminals on the public demo (demo.wcpos.com, 2.0 beta), 2026-11-04

**Site:** `https://demo.wcpos.com/pos`, demo/demo. Plugins as `wp plugin list` reports them: `woocommerce-pos-pro`
2.0.0-beta.2, and the three terminal extensions `stripe-terminal-for-woocommerce`, `mollie-terminal-for-woocommerce`
and `sumup-terminal-for-woocommerce` each at their own 2.0.0-beta1 (the extensions' first 2.0 beta; their version
string has no dot before the number). Server shell: `ssh wcpos-prod`, `wcpos demo wp …`. The container's `wp-content/mu-plugins` is a
read-only mount of the host directory `/data/wordpress/mu-plugins`, which every WordPress site on the box shares:
a file there must host-scope itself on `get_option('home')`, as the dev-next simulated gateways do.

**Ask (Paul, 2026-11-04):** *"Right now none of the Terminal plugins are available for testing … Can you help me
getting these set up with test accounts so users can test."* Tender tab showed Stripe "Not available in the
browser" and Mollie/SumUp "No terminals set up"; the Legacy tab showed Stripe greyed with "No terminal is
available".

## 1. State after this run

| Tile | State | How |
| --- | --- | --- |
| Stripe Terminal | **Works end to end in the browser** on the US Store (USD). Observed: headless sale of $89.76 paid in 24 s through the Payments tab. | The demo's test keys were already present; the gateway was in `device` (Bluetooth) mode with no location. Set `wcpos_connection=server`, `wcpos_location_test=tml_F2EVQA3rKoAy6T` (location "US Store" on the US test account), ran `Pos_Webhook::ensure()` (POS webhook `we_1UY3TKIItXSfSXNxtm61VcbA`) and `Pos_Reader_Settings::mirror()`. The account's simulated WisePOS E "Front Desk" (`tmr_F2EVlAbgE8Z17w`) now lists as online. |
| Stripe: the card tap | Demo-only mu-plugin `/data/wordpress/mu-plugins/wcpos-demo-card-tap.php` (host-scoped to demo.wcpos.com). | Stripe's server-driven simulated reader never presents a card by itself. On each payment `status`/`intent` request the file lists simulated readers at the location and, 4 s after first seeing an `in_progress` action, calls `POST /v1/test_helpers/terminal/readers/{id}/present_payment_method`. Outcome follows Stripe's test amounts: a total ending `.00` approves, `.05` declines (`generic_decline`), `.01` `call_issuer`, `.55` `incorrect_pin`. Not timed from `stwc_payment_dispatch_at`: the extension refreshes that option on every poll. |
| SumUp Terminal | Tile is live, readers list, **but a push answers `READER_OFFLINE`** (observed, US Store). | Sandbox key (merchant `MU4RPYVV`, EUR) copied from dev-next's option; `wcpos_connection=server`, enabled. POS gateway settings lock readers to the "WCPOS Virtual Solo" (`rdr_6VBDR53M6B9YWTWTTNZE5MVMXM`) so no tester can push to Paul's physical Solo. The Virtual Solo is online only while a browser has virtual-solo.sumup.com open and paired; a fresh tab is "Device Not Paired" and pairing needs the sandbox key. Nobody holds that tab. |
| Mollie Terminal | **Still "not available right now"** (no API key on the demo). | The only Mollie key we hold (dev-next) is a test key on profile `pfl_MMaQ2sK28F` "WCPOS", status unverified, zero terminals. `POST /v2/profiles/me/methods/pointofsale` → 422 "Couldn't enable point of sale, method is unavailable", and `methods/all` does not list `pointofsale`. Mollie creates a test terminal only once Point of Sale is enabled on the profile; a test payment then completes through the payment's `changePaymentState` link. The dashboard check needs Paul's Mollie login (Chrome was signed out, 1Password locked). |
| EU Store | Store #33861 "EU Store", `_currency=EUR`, NL address, register seeded. | Mollie's adapter refuses non-EUR and the SumUp sandbox is EUR; the three existing demo stores are USD. Stripe's US test account stays on the US Store. |

Probe residue on the demo: orders #33862–#33867 (one $89.76 Stripe sale paid, one SumUp attempt failed, one
Legacy-tab attempt failed, zero-total carts).

## 2. Defect found: the Legacy tab is broken for every terminal on 2.0

Every terminal payment started from the Legacy tab (Pro's shared order-pay panel) fails at the first request:

```
POST /wp-json/wcpos/v2/orders/33867/payments/<uuid>/intent → 400
The terminal declined or cancelled the payment. Command ID must be a UUID.
```

Free has required a UUID `command_id` and the order `revision` on every money command since
wcpos/woocommerce-pos@2b13db79 (2026-10-20, ADR 0040 rules 5 and 6a); Pro's `assets/js/order-pay-panel.js` sent
neither. Fixed and merged the same day:

- wcpos/woocommerce-pos-pro#755: one id per logical command, kept across lock waits and transport retries; the
  answered revision adopted; a stale `intent` ends the payment (its amount is the page-load balance), a stale
  `capture` or `void` is re-sent once; a cancel that lands mid-command voids instead of re-charging.
- wcpos/woocommerce-pos-pro#757: the panel reads the revision as the token's cashier. Free's `Form_Handler` serves
  the pay page as the order's **customer** (a guest on most POS orders), so the compared read ran as user 0 and
  every command drew a 428 once #755 was in.

Live, observed on the demo with both files hotpatched into the Pro dir (originals kept in the php container at
`/tmp/pro-legacy-backup-755`; the next Pro beta installed there replaces them): Legacy tab → Stripe Terminal →
Send to terminal → paid, order #33874 completed with its captured row in about 16 s. The hotpatched files were
`assets/js/order-pay-panel.js` as merged in #755 and `includes/Payments/OrderPay/Order_Pay_Panel.php` at #757's
final head (3771089, squash-merged unchanged), so the run exercised the merged content of those two files; it is
not a test of a Pro build.

## 3. Open for Paul

1. **SumUp for testers.** Options: (a) a demo-only "pair your Virtual Solo" REST route on the sandbox merchant
   so each tester pairs their own tab (readers accumulate; unpair on expiry); (b) a persistent paired Virtual Solo
   kept open on the server and auto-approving (a headless browser service to run and watch); (c) hide the SumUp
   tile on the demo until hardware demos exist. Recommendation: (a).
2. **Mollie.** Sign in at my.mollie.com → test mode → Point of Sale; if it can be enabled, a test terminal appears
   and the demo needs the key plus a small auto-complete helper like the Stripe one (drive `changePaymentState`).
   If Mollie refuses POS on the unverified profile, hide the tile on the demo.

Memory: `demo-site-terminal-test-setup` in the roadmap memory index.
