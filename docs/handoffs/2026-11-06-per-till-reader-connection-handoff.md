# Per-till reader connections: the store allows, the till chooses (handoff, 2026-11-06)

Ruled by Paul on 2026-11-05/06 during the 2.0 GA rulings pass (roadmap#523, the GA handoff's Part 2 H):

> *"A user has already asked about this, I think we will need to support different methods per device, eg: tap to pay on the mobile, terminal on the desktop and legacy on the web."*
> *"Yes, let's do A. … I think this will be a common request from users to have one till going over Bluetooth and one over wifi etc. We should make sure we get this right."*

Option A as proposed: **the gateway page holds the set of allowed connections; each till picks from that set on the app's Card readers page; nothing is asked at checkout.** Shipped in two parts: the web/desktop half with the Stripe extension's GA cut, the Bluetooth/Tap to Pay half with the native apps (#113). This record is the design for Stripe and the shape every other provider follows.

Scope of the ruling: the nouns Paul named are Stripe's three routes (Tap to Pay, terminal, legacy) and "one till over Bluetooth, one over wifi". Applying the same model to SumUp, Mollie and the rest is this document's recommendation, not a ruling; it is listed under "Rulings still needed" where it goes beyond Stripe.

## 1. The problem, in the merchant's words

A store runs a Stripe S710 at the counter (smart reader, the store drives it over Wi-Fi), an iPhone at the market stall (Tap to Pay, the app drives it), and a laptop in the back office that takes the odd phone order on the legacy pay page. Today the Stripe gateway has one store-wide **POS connection** (`wcpos_connection`: `server` or `device`). In `server` mode no till can use Bluetooth or Tap to Pay; in `device` mode the Stripe tile reads "not available in the browser" on every web and desktop till. The merchant has to choose one of their tills to disable.

The legacy pay page is **not** part of the either/or: Pro's order-pay panel serves it on every till whatever the mode (MOTO carve-out aside). The only blocked combination is smart readers together with Bluetooth or Tap to Pay on the same store.

## 2. The model

Three layers, each with one owner and one home.

| Layer | Owner | Home | What it holds |
|---|---|---|---|
| **Offers** | the provider | the extension's adapters | which connections this provider can drive at all: `server` (the store drives a cloud reader), `device` (the app drives a reader over Bluetooth/USB or Tap to Pay), `handoff` (the provider's own app), plus the legacy pay page outside the model |
| **Allows** | the merchant | the gateway's own WooCommerce settings page | which of the offered connections this store permits, as checkboxes; for `server`, the allowed-reader list, default reader and selection lock Pro already owns |
| **Chooses** | the till | the app's **Card readers** page (#407), remembered per device | which reader this till pays with; the reader's transport is the leg's transport |

Rules that make it hold together:

- **There is no "mode" on the till.** The till has reader rows (ruled in the #407 build: rows are readers with a provider chip, not providers). A cloud reader from the allowed list is a row on every platform; a Bluetooth reader is a row once paired on a native till; Tap to Pay is a row on a native till that supports it. Paying with a row sets that payment's `capture_mode`. Remember-over-configure: a till with exactly one usable row needs no choice at all.
- **The gateway page allows connection *types*, the till picks a *reader*.** The merchant never configures tills from the store, and the till never changes the store.
- **A till that supports none of the allowed connections** shows the provider's tile as unavailable with one line naming the gateway page setting ("Smart readers are off for this store. Change it under WooCommerce → Settings → Payments → Stripe Terminal.") and a docs link. Never a wall of text.
- **A payment refunds through the connection it was taken on** (`capture_mode` is on the ledger row today: `server`, `device`, `webview`). Mixed connections on one store therefore need no refund work.
- **One reader, one driver.** A Bluetooth reader connects to one SDK instance at a time (Stripe); a cloud reader runs one action at a time and Pro's selection lock already serialises tills on it. Two tills paying through the same physical reader is a lock, not a mode question.
- **Offline differs by connection, not by store.** Stripe's Bluetooth readers queue offline payments and forward later; smart readers over the cloud route and Tap to Pay do not. The readers page states it per row; the store setting says nothing about offline.
- **Defaults.** A new install allows every connection the provider offers. An upgrade keeps exactly what the store had: `server` becomes {server}, `device` becomes {device}; nothing new is switched on behind a merchant's back.

## 3. Per provider: what each one offers, and on which tills

From `docs/research/2026-10-06-sdk-vs-cloud-per-provider.md` and the extension READMEs on `next` (2026-11-06). "Native" means the iOS and Android apps; "any" means web, desktop and native.

| Provider | `server` (cloud reader; any till) | `device` (app drives; native only) | `handoff` (provider's app; native) | Legacy pay page | State in 2.0 |
|---|---|---|---|---|---|
| **Stripe** | WisePOS E, S700/S710, P400 (T600, Verifone per Stripe) | WisePad 3, Reader M2 (US), Chipper 2X; **Tap to Pay** iPhone and Android | none | Pro panel; Stripe's own with MOTO on | both built; **gated by one store-wide select: this is the change** |
| **SumUp** | Solo, Go (Cloud Readers API; Virtual Solo for tests) | Solo, Solo Lite, Air, 3G, PIN+ via the SDK; Tap to Pay (iOS SDK; Android a separate SDK); offline on Solo/Solo Lite, EU opt-in | Payment Switch (legacy, not planned) | SumUp's Woo gateway | cloud tile built; SDK driver is #236 (Solo Lite proof); same model when it lands |
| **Mollie** | Mollie terminals (Enabled-terminals list) | none (no SDK) | Mollie Tap app (tier 2, not built, no ticket) | Pro panel | cloud only: per-till already works through Pro's allowed-reader list |
| **Square** | Square Terminal (device code pairing) | Reader, Stand via the Mobile Payments SDK: **out of 2.0** (#115) | POS API: Reader + Tap to Pay, also mobile web (not built) | Pro panel | cloud only in 2.0 |
| **Payarc** | PAX terminal by serial | none | none | Pro panel | cloud only |
| **Mercado Pago** | Point readers (Pro's allowed-reader list, default, lock) | none in 2.0 | none | Pro panel | cloud only |
| **Windcave** | HIT Stations (Pro's allowed-reader list, default Station, lock) | none | none | Pro panel | cloud only |

So: **every cloud-only provider is already per-till** through Pro's allowed-reader list (the till picks its Station or Point from the allowed set). The model in §2 generalises that list to connection types. Only Stripe needs the change for 2.0; SumUp needs it when its SDK driver lands.

## 4. What changes, where

### 4a. Stripe extension (`next`, before the GA cut #546)

- `wcpos_connection` (select: `device` | `server`) becomes `wcpos_connections` (multi-checkbox: `server` "Smart readers (the store drives the reader)", `device` "Bluetooth readers and Tap to Pay (the POS app drives the reader)"). Migration in `Settings::get_wcpos_connections()`: a saved `server` → `{server}`, `device` → `{device}`, nothing saved → the old inference (a saved **Default terminal** means `{server}`, otherwise `{device}`) **widened to both** only for installs with no saved setting and no default reader, i.e. new installs.
- Adapter registration stops being either/or: register the device provider when `device` is allowed and the server adapter when `server` is allowed; both when both.
- The Terminal **Location** requirement for `device` stays; the validation message names the connection it applies to.
- README's POS-connection paragraph is rewritten to the allowed-set wording; the GA notes say "a store can now run smart readers and the app's readers at once; each till pays with the reader it selects".
- Tests: `DeviceSettingsTest` cases for `{server}`, `{device}`, `{server,device}`, the three migrations, and the registration per set.

Budget: well under 600 lines; one PR. Owner: the mini, section D of roadmap#543, ticket roadmap#523 re-scoped (below).

### 4b. Pro (`main`)

- The descriptor the till receives for a gateway carries **the set** of allowed capture modes, not one. Today's shape implies one by which adapter is registered; the device base already "passes handoffs through". Expected size: small, mostly the serializer and a conformance fixture with both modes registered on one gateway.
- The allowed-reader list, default reader and selection lock stay as they are for `server`; they are the `server` half of "allows".
- Conformance: a fixture gateway that registers both adapters; the suite proves a `server` row and a `device` row can coexist on one order and refund each through its own route.

Owner: the mini, same ticket as 4a or its own PR if the Pro change crosses 150 lines.

### 4c. App (`main`)

Web and desktop (part one, with the Stripe cut):
- The Card readers page lists the store's allowed cloud readers as rows for Stripe, as it does for the cloud-only providers. Tender pane: the Stripe pill pays with the selected row. If the descriptor allows only `device`, the tile is unavailable with the one-line reason and the docs link (§2).

Native (part two, with #113):
- Slice 2 (#407) already builds the rows for Bluetooth readers and the Tap to Pay row. The only addition from this ruling: a native till whose store allows both shows cloud reader rows **and** paired-reader rows on the same page, and the selected row decides. No mode switch, no prompt at checkout.
- Slice 3 (tender pane): the Tap to Pay pill stands on its own as ruled; a smart reader selected on a native till shows under the Stripe pill like it does on web.

### 4d. Docs (wcpos/docs, 2.x tree; folds into roadmap#548)

- Stripe Terminal page: one "Which connection does each till use?" task section with the three-till example from §1, image-led, naming the gateway setting and the Card readers page.
- Card readers page: "A till pays with the reader it selects; the store decides which kinds of reader are allowed."
- Provider pages for SumUp, Mollie, Square, Payarc, Mercado Pago, Windcave: a one-line "connections" row each, from the §3 table.

## 5. Sequencing

1. **Now, by the mini:** 4a and 4b, on the Stripe extension's `next` and Pro's `main`, before the Stripe GA cut (#546 waits on it). Web/desktop part of 4c in the same run. Live proof on the demo store: a desktop till on the simulated smart reader and a web till on the legacy page, same store, both allowed.
2. **With #113 (Fable spec, then the mini):** the native half of 4c inside slices 2 and 3; proof on the borrowed iPhone with Tap to Pay and a simulated smart reader allowed on the same store.
3. **When #236 lands SumUp's SDK driver:** SumUp's gateway page gains the same allowed set (`server` cloud Solo/Go, `device` SDK readers and Tap to Pay); the app side needs nothing new.
4. **Never:** a per-till setting on the WooCommerce side, a mode prompt at checkout, or a POS-settings modal that fans out per gateway (the 2026-09-11 lesson).

## 6. Rulings still needed (Paul; one question each when they come up)

- **SumUp's allowed set** follows the same shape when #236 lands. Proposed: yes, same checkboxes; pick: yes.
- **Mollie's Tap app handoff** (tier 2) has no ticket; not for 2.0. Pick: 2.1 ticket when a merchant asks.
- **Upgrade default** for a store with a saved **Default terminal** and no saved `wcpos_connection`: proposed `{server}` only (today's inference), never both. Pick: as proposed.

## 7. Tickets

- roadmap#523 re-scoped to this design, milestone v2.0.0, `claimed:mini`, on roadmap#543 section D ahead of #546; it carries 4a, 4b and the web/desktop half of 4c with the proof above.
- #113's spec (Fable) absorbs the native half of 4c; no new ticket.
- roadmap#548 (docs) gains the 4d lines.

## Not evaluated

- Stripe's JavaScript Terminal SDK for browsers (smart readers only) as a fourth route: not needed, the cloud route serves the same readers from the store.
- Square's POS API handoff on mobile web.
