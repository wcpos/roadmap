# Icon set for 1.11.0: research and decision

Date: 2026-09-16. Ticket: [Prototype: the register and the orders screens in the new language](https://github.com/wcpos/roadmap/issues/287), part of the [UI overhaul map](https://github.com/wcpos/roadmap/issues/282). Boards: `docs/prototypes/2026-09-12-language/icons/board.html` (twelve families on the register's 26 icons, with prices), `icons/store.html` (the store glyph side by side), and the register's *Icons* switch in `pos-register/index.html`.

## Decision

**Tabler Icons, drawn at a 1.5 px stroke instead of its native 2 px, for a while.** Paul, 2026-09-16: *"I think I like tabler 1.5 so let's go with that for a while … huge icons is quite good as well."* Tabler's rail glyph is `building-store` (the awning), not `cash-register`.

Revisit if: the thinned stroke reads badly at small sizes on Android (Tabler is drawn for 2 px; 1.5 is a global override, not a redraw), or if the friendlier drawing of Hugeicons turns out to matter more than expected once the theme is settled. Hugeicons is the standing alternative; it covers the same list and is drawn at 1.5 natively.

## Why this came up

Paul: *"a custom icon set could be very, very interesting … I would be willing to pay for a nice icon set if it adds some personality."* The app today ships Font Awesome Pro (solid) as transpiled React components in `packages/components/src/icon/svg/fontawesome/solid`, 134 icons including the WCPOS mark. Icons are referenced by camelCase name through `@wcpos/components/icon` (`IconName` is the keyof the generated module).

## What was evaluated

Twelve families, first on the register's own 26 icons (rail, cart, tender), then the six survivors on the app's full list of 133.

| Family | Licence | Stroke / style | Register 26 | App 133 | Paul |
|---|---|---|---|---|---|
| Lucide (today's prototype) | ISC, free | 2 px outline | 25 | not scored | baseline |
| **Tabler** | MIT, free | 2 px outline (+ filled) · 6,000+ | 26 | **131** (+2 under other names) | *"nice but a little too thick"* → 1.5 px variant, **chosen** |
| **Hugeicons** (stroke) | MIT free stroke · Pro from $99/yr, 60,000 icons, 10 styles | 1.5 px, rounded | 26 | **132** | *"quite good as well"*; the store glyph is the one he liked |
| Phosphor | MIT, free · 9,000 across 6 weights | ~1.5, one drawing | 26 | 126 (the cart-plus / cart-check variants are absent) | no duotone |
| Solar | CC BY 4.0, free · 7,600, 6 styles | 1.5, soft | 24 | 114 (no cash register, basket, percent, warehouse …) | — |
| Iconoir | MIT, free · 1,600 | 1.5, thin | 25 | 115 (no receipt, address card, warehouse, bot …) | — |
| Streamline Plump | CC BY free subset (1,500) · Icons plan from $19/mo annual, 300,000 icons, **100 icons per project** | chunky, cartoon-warm | 25 (some wrong matches) | 91 of the free subset; the paid family is 4,000 | kept to the end; only judgeable by buying |
| Streamline Flex / Freehand / Sharp | same plan | soft · hand-drawn · strict | 24–25 | — | out |
| MingCute | Apache 2.0, free | rounded, cute | 26 | — | out |
| Phosphor duotone | MIT | tinted fill | 26 | — | out ("no duotone") |

Coverage was measured by matching Font Awesome names and synonyms against each family's Iconify collection file (`@iconify-json/<prefix>/icons.json` on jsDelivr); a miss is a name the matcher could not find, so real coverage is a little higher than the numbers (Tabler's `id` covers address-card, `player-pause` covers circle-pause; Phosphor's `dots-three-circle` covers circle-ellipsis).

## Prices and licences as of 2026-09-16

- **Streamline**: Icons plan from $19/month billed annually (Full access from $29); 300,000+ icons across 55 sets; standard licence allows up to 100 icons (or 50 illustrations) per project; unlimited projects and clients; downloaded assets stay usable after the subscription ends; every person using the app/plugins needs a seat; enterprise licences lift the per-project cap and allow embedding. Source: home.streamlinehq.com/pricing.
- **Hugeicons Pro**: from $99/year, 60,000+ icons, 10 styles, Figma + SVG + IconJar + React (Untitled UI's 2026 review; vendor page did not load). The free stroke set is 6,000 icons, MIT.
- **Nucleo**: one-time $149 for all 44,282 icons (Core, UI, Sharp, Pixel, Micro Bold); $99 per family; lifetime updates; Mac/Windows app; team plan $299/year. 18 px grid. Source: nucleoapp.com/pricing.
- **Untitled UI Icons**: from $59 one-time, 4,600 icons, 4 styles, unlimited projects (own review).
- **Custom**: ~40 icons from a freelance illustrator, roughly $1,500–4,000 and 2–3 weeks. The common hybrid: buy a family for the long tail, commission the 15 glyphs that carry the brand (register, drawer, receipt, void, paid, empty-state doodle).

## Rulings along the way

- Out: MingCute, Flex, Freehand, Sharp. No duotone. Woo purple theme is unrelated but was struck the same day.
- Tabler is nice but too thick → a `tabler-15` entry in the register's switch, the same drawings with `stroke-width="2"` rewritten to `1.5`.
- Solar, Iconoir and Plump needed hand-picked names (their vocabularies differ: Solar's "slider" is a media control; Plump's names are phrases).
- The store glyph: Paul likes Hugeicons `store-01`; Tabler has `building-store` (awning) and `cash-register`. Tabler's rail uses the awning.

## How the prototype swaps sets

`pos-register/iconsets.js` is generated from the collection files: for each register icon key it holds the family's SVG (viewBox + body). `render()` does `Object.assign(I, I0, ICONSETS[S.icons])` before drawing, falling back to today's glyph where a family has none. The generator (scratchpad `build-iconsets-js.py`) matches by name with a synonym table and a hand-picked override table; the same approach would produce the app's mapping.

## Appendix: Font Awesome name → Tabler → Hugeicons → Phosphor

The app's 133 icons (the WCPOS mark excluded). Names are the Iconify names; Tabler's are the same as the `@tabler/icons-react` component names in kebab case. Dashes mean the matcher found nothing; a few are real gaps (Phosphor has no cart-plus).

| Font Awesome (app) | Tabler | Hugeicons | Phosphor |
|---|---|---|---|
| `address-card` | `id` | `id-card` | `identification-card` |
| `arrow-down` | `arrow-down` | `arrow-down-01` | `arrow-down` |
| `arrow-left` | `arrow-left` | `arrow-left-01` | `arrow-left` |
| `arrow-right` | `arrow-right` | `arrow-right-01` | `arrow-right` |
| `arrow-right-from-bracket` | `logout` | `log-out` | `sign-out` |
| `arrow-rotate-left` | `history` | `undo` | `arrow-counter-clockwise` |
| `arrow-rotate-right` | `refresh` | `refresh` | `arrow-clockwise` |
| `arrow-up` | `arrow-up` | `arrow-up-01` | `arrow-up` |
| `arrows-from-line` | `arrows-vertical` | `unfold-less` | `arrows-vertical` |
| `arrows-to-line` | `fold` | `fold-vertical` | `arrows-in-line-vertical` |
| `badge-dollar` | `coin` | `badge-dollar-sign` | `coin` |
| `badge-percent` | `discount` | `discount` | `seal-percent` |
| `ban` | `ban` | `ban` | `prohibit` |
| `barcode` | `barcode` | `barcode` | `barcode` |
| `barcode-read` | `scan` | `barcode-scan` | `scan` |
| `barcode-scan` | `scan` | `barcode-scan` | `scan` |
| `bars` | `menu` | `list` | `hamburger` |
| `basket-shopping` | `basket` | `shopping-basket-01` | `basket` |
| `bell` | `bell` | `bell` | `bell` |
| `bookmark` | `bookmark` | `bookmark-01` | `bookmark` |
| `box` | `box` | `box` | `package` |
| `box-open-full` | `package` | `package-open` | `package` |
| `boxes-packing` | `packages` | `boxes` | `box-arrow-up` |
| `boxes-stacked` | `packages` | `boxes` | `stack` |
| `calculator` | `calculator` | `calculator` | `calculator` |
| `calculator-simple` | `calculator` | `calculator` | `calculator` |
| `calendar` | `calendar` | `calendar-01` | `calendar` |
| `calendar-days` | `calendar` | `calendar-days` | `calendar` |
| `caret-down` | `caret-down` | `chevron-down` | `caret-down` |
| `caret-left` | `caret-left` | `chevron-left` | `caret-left` |
| `caret-right` | `caret-right` | `chevron-right` | `caret-right` |
| `caret-up` | `caret-up` | `chevron-up` | `caret-up` |
| `cart-circle-check` | `cart-check` | `shopping-cart-check-01` | `—` |
| `cart-circle-plus` | `cart-plus` | `shopping-cart-add-01` | `—` |
| `cart-plus` | `cart-plus` | `shopping-cart-add-01` | `—` |
| `cart-shopping` | `shopping-cart` | `shopping-cart-01` | `shopping-cart` |
| `cash-register` | `cash-register` | `register` | `cash-register` |
| `chart-mixed-up-circle-dollar` | `chart-line` | `chart` | `chart-line` |
| `check` | `check` | `check` | `check` |
| `chevron-down` | `chevron-down` | `chevron-down` | `caret-down` |
| `chevron-left` | `chevron-left` | `chevron-left` | `caret-left` |
| `chevron-right` | `chevron-right` | `chevron-right` | `caret-right` |
| `chevron-up` | `chevron-up` | `chevron-up` | `caret-up` |
| `circle` | `circle` | `circle` | `circle` |
| `circle-check` | `circle-check` | `circle-check` | `check-circle` |
| `circle-chevron-right` | `circle-chevron-right` | `circle-chevron-right` | `caret-circle-right` |
| `circle-dollar` | `coin` | `dollar-circle` | `currency-circle-dollar` |
| `circle-ellipsis` | `dots-circle-horizontal` | `more-horizontal-circle-01` | `dots-three-circle` |
| `circle-exclamation` | `alert-circle` | `alert-circle` | `warning-circle` |
| `circle-half` | `contrast` | `contrast` | `circle-half` |
| `circle-half-stroke` | `contrast` | `contrast` | `circle-half` |
| `circle-info` | `info-circle` | `info` | `info` |
| `circle-minus` | `circle-minus` | `circle-minus` | `minus-circle` |
| `circle-pause` | `player-pause` | `pause-circle` | `pause-circle` |
| `circle-plus` | `circle-plus` | `add-circle` | `plus-circle` |
| `circle-question` | `help-circle` | `help-circle` | `question` |
| `circle-xmark` | `circle-x` | `circle-x` | `x-circle` |
| `clock` | `clock` | `clock-01` | `clock` |
| `comment-question` | `message-question` | `chat-question` | `question` |
| `comments-question` | `message-question` | `chat-question` | `chats` |
| `credit-card` | `credit-card` | `credit-card` | `credit-card` |
| `delete-left` | `backspace` | `delete-01` | `backspace` |
| `desktop` | `device-desktop` | `monitor` | `desktop` |
| `divide` | `divide` | `divide` | `divide` |
| `download` | `download` | `download-01` | `download` |
| `ellipsis-vertical` | `dots-vertical` | `more-vertical` | `dots-three-vertical` |
| `equals` | `equal` | `equal` | `equals` |
| `eye` | `eye` | `eye` | `eye` |
| `eye-slash` | `eye-off` | `eye-off` | `eye-slash` |
| `file-invoice-dollar` | `invoice` | `invoice` | `invoice` |
| `folder` | `folder` | `folder-01` | `folder` |
| `folders` | `folders` | `folders` | `folders` |
| `gear` | `settings` | `cog` | `gear` |
| `gift` | `gift` | `gift` | `gift` |
| `gift-card` | `gift-card` | `gift-card` | `gift` |
| `gifts` | `gift` | `gift` | `gift` |
| `globe` | `globe` | `globe` | `globe` |
| `grid` | `grid` | `grid` | `grid-four` |
| `grid-2` | `grid` | `grid` | `grid-four` |
| `grid-2-plus` | `layout-grid-add` | `grid` | `grid-four` |
| `grip-lines` | `grip-horizontal` | `grip-horizontal` | `dots-six` |
| `grip-lines-vertical` | `grip-vertical` | `grip-vertical` | `dots-six-vertical` |
| `heart-pulse` | `heartbeat` | `heart-pulse` | `heartbeat` |
| `icons` | `icons` | `shapes` | `shapes` |
| `life-ring` | `lifebuoy` | `lifebuoy` | `lifebuoy` |
| `list` | `list` | `list` | `list` |
| `list-tree` | `list-tree` | `list-tree` | `tree` |
| `magnifying-glass` | `search` | `search-01` | `magnifying-glass` |
| `manhole` | `circle-dashed` | `circle-dashed` | `circle-dashed` |
| `memo` | `note` | `note` | `note` |
| `memo-circle-check` | `file-check` | `file-check` | `note` |
| `memo-circle-info` | `file-info` | `note` | `note` |
| `merge` | `git-merge` | `git-merge` | `git-merge` |
| `message-bot` | `robot` | `bot` | `robot` |
| `message-captions` | `message` | `captions` | `chat-text` |
| `message-dollar` | `message-dollar` | `chat` | `chat` |
| `message-lines` | `message` | `chat` | `chat-text` |
| `message-middle` | `message` | `chat` | `chat` |
| `message-plus` | `message-plus` | `chat` | `chat` |
| `minus` | `minus` | `minus` | `minus` |
| `moon` | `moon` | `moon` | `moon` |
| `note-sticky` | `note` | `note` | `note` |
| `pen-to-square` | `edit` | `pencil` | `pencil` |
| `percent` | `percentage` | `percent` | `percent` |
| `plus` | `plus` | `plus` | `plus` |
| `plus-large` | `plus` | `plus` | `plus` |
| `plus-minus` | `plus-minus` | `plus-minus` | `plus-minus` |
| `printer` | `printer` | `printer` | `printer` |
| `receipt` | `receipt` | `receipt` | `receipt` |
| `rectangle-barcode` | `barcode` | `barcode` | `barcode` |
| `right-left` | `arrows-right-left` | `arrow-left-right` | `swap` |
| `scanner-gun` | `scan` | `barcode-scan` | `scan` |
| `shop` | `building-store` | `store-01` | `storefront` |
| `sliders` | `adjustments` | `sliders-horizontal` | `sliders-horizontal` |
| `star` | `star` | `star` | `star` |
| `star-of-life` | `asterisk` | `asterisk` | `asterisk` |
| `store` | `building-store` | `store-01` | `storefront` |
| `sun-bright` | `sun` | `sun-01` | `sun` |
| `sun-haze` | `sun` | `sunrise` | `sun` |
| `tag` | `tag` | `tag-01` | `tag` |
| `tags` | `tags` | `tags` | `tag` |
| `trash` | `trash` | `trash` | `trash` |
| `triangle-exclamation` | `alert-triangle` | `triangle-alert` | `warning` |
| `truck` | `truck` | `truck` | `truck` |
| `user` | `user` | `user` | `user` |
| `user-crown` | `crown` | `crown` | `crown` |
| `user-plus` | `user-plus` | `user-plus` | `user-plus` |
| `users` | `users` | `users` | `users` |
| `warehouse-full` | `building-warehouse` | `warehouse` | `warehouse` |
| `water` | `droplet` | `waves` | `waves` |
| `wordpress` | `brand-wordpress` | `wordpress` | `wordpress-logo` |
| `wordpress-simple` | `brand-wordpress` | `wordpress` | `wordpress-logo` |
| `xmark` | `x` | `x` | `x` |
