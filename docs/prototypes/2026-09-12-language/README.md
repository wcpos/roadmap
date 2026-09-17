# The 1.11.0 language, on the system screens (2026-09-14)

Prototypes for the wayfinder map [UI overhaul for 1.11.0](https://github.com/wcpos/roadmap/issues/282),
Phase A of [the program](../../design/2026-09-12-ui-polish-program.md). Every screen draws from
[the direction](../../design/2026-09-12-direction.md) ("a calm instrument that is already where
you're going, in two postures") and is judged by [the guidelines](../../design/ui-design-guidelines.md).

Self-contained HTML. Double-click `index.html`; no server, no build. The dark strip at the top is
not part of the design: **Width** (phone 390 / tablet 1024 / desktop 1440), **Theme** (the five),
**Scale** (compact / regular / spacious), **State** (every state the inventory lists). Captures sit
in each folder's `screens/`; `node <folder>/shoot.js` regenerates them with the monorepo's
Playwright and fails on any page or console error (`--quick` for one width).

| Screen | Ticket | Status |
|---|---|---|
| [`pos-register/`](pos-register/) | [#287](https://github.com/wcpos/roadmap/issues/287) | drawn, waiting on Paul |
| [`orders/`](orders/) | [#287](https://github.com/wcpos/roadmap/issues/287) | drawn, waiting on Paul |
| settings tab, connect, receipt, products, tokens | [#288](https://github.com/wcpos/roadmap/issues/288) | not started — the language may move after #287 |

## The tokens, as drawn

Both files carry the same token block at the top of their `<style>`; it is the design, everything
below it reads tokens. Three axes:

**Scale step** (the numbers are proposals for [#289](https://github.com/wcpos/roadmap/issues/289)):

| | compact | regular | spacious |
|---|---|---|---|
| spacing unit (`--spacing`) | 3.5 | 4 | 5 |
| base font, web | 13 | 14 | 16 |
| form control | 40 | 44 | 52 |
| list / table row | 36 | 44 | 52 |
| tile, key, tender method | 56 | 64 | 80 |
| radius | 6 | 8 | 10 |
| leading amount | 34 | 40 | 48 |

**Touch floor.** On a coarse pointer (phone, tablet) nothing interactive is under 44 pt at any
step; `max(var(--ctl), var(--floor))` everywhere. On a fine pointer (desktop) the floor is WCAG's
24, so the compact step can be a real desk density. This is how the audit's `h-10` = 40 finding is
closed: one floored token, not a per-screen fix.

**Colour.** The working surface is neutral in every theme (chroma ≤ 0.04). The theme reaches
the controls (primary, ring, selected row) and the rail. The status set is fixed and identical in
all five themes: `ok` green, `warn` amber, `bad` red, `info` blue, `neutral` grey — always a dot
plus a word, never a filled pill.

**Width class** picks the posture: below desktop the pointer is assumed coarse and the orders
list is rows; at desktop it is a table with hover, resize handles, and keyboard focus.

## Decisions for Paul

Each with the options and my pick. Answer in order; the first two move everything else.

1. **Does the language read right?** The captures to judge: `pos-register/screens/tablet-light-regular-open.jpg`,
   `…-tender.jpg`, `…-panel.jpg`; `orders/screens/desktop-light-regular-default.jpg`,
   `…-open-refund.jpg`, `tablet-light-regular-open.jpg`; and the dark twins. Options: (a) this is
   the direction, refine from here; (b) right bones, wrong temperature (say which way); (c) wrong.
   **Pick: (a)** — it is the direction note built, with nothing added.
2. **The rail.** (a) *Drawn:* a pale tinted rail (`--rail` at chroma 0.014), active item on a
   white tile, primary icon. (b) Today's navy block. Pro of (a): nothing on screen is louder than
   the thing about to be pressed; the theme still shows at a glance. Pro of (b): a hard "where am
   I" anchor and eight years of habit. **Pick: (a).**
3. **Scale semantics.** The direction's diagram labelled the counter "compact" with 56 pt rows and
   the desk "spacious" with 36; the program defines compact as *smaller* (phone) and spacious as
   *larger* (32-inch). They contradict. *Drawn:* the program's definition, with posture coming
   from the pointer type, not the step. **Pick: the program's definition** — rows are tall on
   touch at every step because of the floor, not because of the step's name. Feeds #289.
4. **Status in the orders list: dot + label** (drawn) or the icon-only cell with a tooltip (today).
   Costs a 172 px column; gains a status you can read at arm's length and one treatment shared
   with the open order and the receipt. **Pick: dot + label.**
5. **Rows: hairlines** (drawn) or zebra striping (today's `table-row-alt`). Hairlines keep one
   surface colour; zebra helps tracking on wide desktop tables. **Pick: hairlines** — the desktop
   table also gets a hover row, which does the tracking job.
6. **Orders on a tablet: rows** (drawn) or the same table as the web (today). Rows are the
   direction's platform split for a touch surface; the table is one less component. **Pick: rows.**
7. **The open order: a pane beside the list** (drawn, 560 / 440 px, list keeps its core columns)
   or the 800 px right-side modal with its own two columns (today). The pane keeps the list live
   and the row selected; the modal shows more at once. **Pick: the pane** — it is the Linear /
   Fresha shape and the direction's §5.
8. **The tender pane's surface: neutral** (drawn) or the slate surface approved on 2026-09-11.
   Structure, keypad and fold are untouched (PR #259); only the skin moved, because the direction
   bans coloured working surfaces. **Pick: neutral** — the amount is still the screen.
9. **The Paid beat: a calm disc on the neutral surface** (drawn) or the full-bleed green approved
   on 2026-09-11. **Pick: calm** — the out-list rules out a coloured surface; the stamp-in disc is
   the beat.
10. **Line added: settle highlight + quantity focus, no toast** (drawn). A toast on every scan is
    a hundred toasts a day. **Pick: no toast.**
11. **Loading: skeleton rows** (drawn) versus headers plus a central spinner (today). This is
    [#308](https://github.com/wcpos/roadmap/issues/308)'s call; the prototype draws the proposal so it
    can be judged there rather than argued. **Pick: skeleton, still, no shimmer.**
12. **Copy: sentence case everywhere** — "Search orders", "Billing address", "Print receipt" — the
    app today mixes title case ("Search Orders", "Print Receipt"). One rule for the language pass.
    **Pick: sentence case.**

Added in cut 2 of the register (2026-09-14, after Paul's nine points):

13. **The footer button that opens the order modal:** *Order details* (drawn) · *Details* ·
    *This order* · keep *Order Meta*. **Pick: Order details** — names what is inside (status,
    cashier, note, currency, transaction ID, metadata) and reads as a cashier's word.
14. **Tender close.** (a) top-left × (cut 1) · **(b) top-right ×** (drawn default) · (c) *Back to
    cart* under the keypad. The pane sits left of the cart, so (b) puts the way out nearest what
    the cashier returns to and where every sheet's × already lives; (c) is the most literal but
    costs a row under the commit and reads like a second action. **Pick: (b).**
15. **Legacy gateways — decided (Paul, 2026-09-14).** The legacy checkout is an iframe that takes
    the pane, so it is its own view; the **Payments | Legacy text toggle stays in the header**.
    Icons (keypad | globe) were drawn and judged too confusing for now; a tile in the grid and a
    link under the keypad were drawn and set aside. The strip keeps all four for the record.
16. **Line actions.** Swipe to reveal *Edit* and *Remove* on touch; the same two on hover on the
    web; name and price edit in place with one tap. **Pick: as drawn** — rule 2 (no hover-only
    affordances on touch) is why both exist. The edit-line form and the cart settings are
    **full-height slide-outs** from the products side (Paul, 2026-09-14), the products settings a
    slide-out from the opposite side, as on `next`.
17. **Open-order tabs — the strip scrolls (Paul prefers scrolling).** Six styles in the strip
    (*Tab style*) and in `pos-register/screens/variants/tabs-*.jpg`, tablet and phone, twelve
    orders, each with the count button pinned left (opens the open-orders list) and + pinned
    right, with a fade at the scroll edge:
    (a) **amount over status** — two lines, the chip text readable without opening anything;
    (b) **amount + dot** — one line, densest, status by colour only (needs the list for the word);
    (c) **chips** — pills, the current one filled; reads as a filter row rather than tabs;
    (d) **cards** — small cards with amount, customer and status, current with a primary top
    edge; the most information, the tallest;
    (e) **numbered** — like (a) with #1, #2… so a cashier can say "cart 3";
    (f) **status edge** — one line with a coloured top edge per status, amount and customer.
    **Revised the same day: Paul prefers the simplicity of (b) amount + dot, with a format
    setting.** The default is now amount + dot, and cart settings gain *Tab shows*: amount and
    status dot · amount and customer · amount over status · customer (amount for guests) · number
    and amount. Custom titles (table number, a name) come with the restaurant extension later.
    **Code check** (`pos/cart/tab-chip.tsx` on `next`): the chip on a tab that is *not* active
    has exactly seven labels in a fixed priority — *Save refused* (error) → *Paid · receipt*
    (success) → *Waiting for terminal · £* → *Partly paid · £ due* → *Saving order…* / *In
    checkout · offline* / *In checkout* (all info) → none; the active tab never carries one.
    The dot colours follow: red · green · amber for waiting and partly paid · grey for the three
    in-progress states. **The open-orders list takes the whole cart column** (Paul), a full
    overlay with its own header and ×, not a popover.
23. **Void.** Paul: *"the Void button sucks, do some research on Mobbin."* Seven placements on
    `pos-register/board-void.html` (captures in `screens/board-void/`): outlined red beside
    Checkout (today) · ⋮ beside Checkout with Void, Save and Order details inside (Fresha) · a
    quiet *Discard* text button in the bar (Shopify draft order) · a trash icon in the customer row
    (Gmail, Linear) · *Hold to void*, a quiet button that fills while held, the hold being the
    confirmation (Slack, Revolut) · a destructive row at the bottom of the Order details slide-out
    (iOS settings, Stripe) · quiet red text under Checkout (Square, Stripe). Paul (same day):
    *"really … I'm sure you can do better"* — placements of a red button are not design; and the ⋮
    beside Checkout is a **phone** candidate only, not for larger screens. Second board,
    `pos-register/board-void-2.html` (captures in `screens/board-void-2/`): what the strongest
    products do is have **no Void button** — Stripe's invoice editor has no delete on the page,
    Shopify shows *Discard* only for unsaved changes and cancels from the order's own actions,
    Linear deletes from the item's ⋯ with Undo, Apple swipes the row and keeps a Recently Deleted,
    browsers close the tab. Five models: (a) **the tab is the sale** — × on the current tab, Undo
    toast, *Recently voided* in the open-orders list; (b) **the order chip owns its actions** —
    *#102476 ▾* in the customer row opens Park, Save, Print pro-forma, Void, and the footer is
    Checkout alone; (c) **emptying is voiding** — swipe lines away, *Remove all* appears after the
    first swipe; (d) **park or void from the open-orders list** — swipe a row, or the two actions
    under the current sale; (e) **void with a reason, inline** — a one-beat reason row instead of
    a dialog, switchable off. (a), (b) and (c) are live in the prototype's *Void style* switch;
    (b) is the default. Paul: *"the only one of these worth keeping is the dots for a small
    screen. The outline red is still best, but you need to do better."* Round three, the button
    itself at Checkout's height with a press state: red text on a grey pill (Apple) · red text
    link (Linear) · neutral, red on press (Stripe) · trash + word · outline refined · 56 pt
    square. Paul: *"you've clearly lost the plot … the problem is not whether the button has a
    border or not, it's far more fundamental than that."* **Round four** re-diagnoses: today's
    footer is a dialog's button row (Cancel | OK) under a cart, so Void and Checkout read as
    peers. Mobbin: Fresha (the one real POS with this footer) has a *To pay* row, one full-width
    *Pay now* and a quiet ⋮; Shopify treats the draft order as a document with *Discard* and
    *Save* in its title bar; Glovo, UNIQLO and 7-Eleven make the footer a bar with the total as
    the largest thing and one action beside it; Lightspeed parks and discards from quiet text
    above Pay. Six structures, each the whole cart column, at the top of
    `pos-register/board-void.html` (captures `screens/board-void/sN-*.jpg`): (1) **lifecycle
    row** — Details · Save · Print · Void as one row of text actions above a single Checkout;
    (2) **the sale is a document** — *#102476 · Guest* as the title, *Discard* and *Save* beside
    it, Checkout alone at the foot; (3) **a bar** — the amount at display size on the left, item
    count and *Void sale* at metadata weight under it, Checkout on the right; (4) **receipt tail**
    — one muted card holding the sale's name with *Void* at its head, the tax rows, *To pay*, and
    *Pay now*; (5) **action rail** — the cart's verbs down its edge, Void at the bottom;
    (6) Fresha exactly, for the record. (1)–(4) are live under the register's *Void button*
    switch; (1) is the default. Paul: *"Nope, get rid of them all. Only keep the small screen
    version with the dots, just make sure the dots button is not the same size as the checkout
    button. Have another try of the Void | Checkout."* **Decided: phone = ⋮ at 44 pt beside
    Checkout at 56, no switch.** Round five, the pair for tablet and desktop, five executions not
    seen before: outlined red matched (56 pt, 600 weight, red hairline at half strength) · tonal
    red (9 % wash, no border; Shopify critical, Material tonal) · one joined control, Void |
    Checkout as two cells of one rectangle · two pills at 34/66 (Talabat, CHOPT) · filled red
    (Toast). Live under *Void button*; the matched outline is the default. The rejected rounds
    are folded into a collapsed section at the bottom of the board. Paul: *"either 1 or 5."*
    **Outlined red matched is the default; filled red stays in the switch as the other finalist.**
    The final pick waits on the personality direction, since a red box reads differently on cream
    paper than on white.
25. **Personality.** Paul: *"I like the design. I just find it uninspired, boring, dull."*
    Diagnosis: the language is the 2026 SaaS default with the brand removed (grey-blue neutrals,
    one blue, 8 px radius, system font, hairlines, grey tiles, copy nobody wrote). Personality
    lives in type with a voice, a canvas that is not white, the money as the hero, moments, and
    copy written by a person. `personality/board.html` (captures `personality/screens/board/`):
    six directions, the same register and data, only tokens, seams and words moved: (1) **the
    paper till** — cream canvas, ink buttons, serif italic total, mono numbers, the cart as a
    receipt with a torn edge; (2) **bold money** (Cash App, Wise) — white, black, lime; the
    total at 44 pt; pills; (3) **the warm shop** (Fresha, Aesop) — warm off-white, terracotta,
    Fraunces for money, tiles as colour swatches; (4) **the market stall** — category colours,
    Manrope, 2 px ink outlines, coral with a hard shadow, emoji fallbacks, copy with a person
    behind it; (5) **the dark stage** (Linear) — near-black, violet as light, glow on the total;
    (6) **Woo, owned** — WooCommerce purple and Bricolage Grotesque, everything else as today.
    **Pick: (3) as the base, with (4)'s category colours on the tiles and (2)'s 44 pt total.**
    The six are also live as *Theme* values in the register. Paul: *"The themes aren't bad,
    except for the woo theme 🤮"* — Woo is out.
26. **Personality, not a skin.** Paul: *"subtle changes that give this app its own personality."*
    Research (Mobbin): Cash App makes the number the hero and moves it; Wise, giant numerals and
    one loud colour; Duolingo, a character and a voice, restraint being what makes it land;
    Tally, Typeform, Cake, one hand-drawn line per empty state; Linear and Gmail, undo instead of
    dialogs; every fintech celebrates with confetti, which is the thing to avoid. Through-line:
    **it is a till, run by a person.** Seven touches live in the register under *Touches*, each
    on its own toggle: numbers roll (the total counts to the new value in 420 ms, the tab chip and
    the Take button with it) · PAID stamp (a rubber stamp slams at 8°, no confetti) · a voice
    (Sale, Till, Park this sale, Walk-in, "Nothing on the till yet.", "Drawer's open.") ·
    price-tag pence (£24<sup>10</sup>) · sold today (×14 on the tiles) · the receipt tears off
    after a sale and a fresh one rolls in · a doodle for the empty till. Listed for later: the
    cashier's day (sales · takings · busiest hour, a sparkline, "First one. Have a good day."),
    undo never dialogs, the scanner as a character, time of day, the receipt the customer keeps,
    opt-in sounds, physical feedback. **Pick: all but the doodle stay; the doodle needs a better
    drawing.**
    Paul (2026-09-16): likes the Market Stall theme and some of the touches, but the raised
    pence are too much for the default themes. **Ruled: price-tag pence only when the theme is
    Market Stall; the default themes keep plain numbers and the system typeface.** What personality
    is still missing is open.
27. **Signature layouts.** Asked which lever to pull next (layout, motion, brand layer, copy),
    Paul chose layout. `layouts/board.html` (captures `layouts/screens/board/`): five shapes for
    the same register, same sale: (1) **the till roll** — catalogue | a strip of receipt paper the
    sale prints onto | the money (amount at display size, Card, Cash, Park, Void); (2) **the menu
    board** — products as a three-column menu with dotted leaders, the sale as a drawer along the
    bottom with item chips and Take; (3) **keypad first** — a huge amount display, the keypad with
    Take as its long key, quick keys for the most-sold products, catalogue and cart in a side
    sheet; (4) **two faces** — the right 40 % is the customer's: their items in large type, the
    total, "Hi Sarah", tap to pay; (5) **the counter** — the sale runs across the top as cards with
    a dark running-total board at the end, products take the full width below. **Pick: the till
    roll**, with the counter second for wide screens.
    Paul (2026-09-16): *"No wrong direction again."* Layouts board rejected, off the hub.
28. **Consolidation (2026-09-16).** Paul: consolidate what we have and the decisions made, remove
    the toggles, clean up. **Decided:** tender close is top-right (14); Void is outlined red,
    matched (23, round five no. 1); Legacy is the header text toggle (15). **Narrowed:** tab
    style to two candidates, amount + dot and amount over status (17), still open. Woo theme
    removed. Switches for the decided items removed from the register; the Touches before/after
    buttons fixed (the strip's click handler had not been listening for them).
29. **Touches ruled (2026-09-16).** Total: the count-up would get boring → a single 220 ms settle,
    nothing spins. PAID stamp: keep. Voice: out, plain labels are safer with translations.
    Price-tag pence: whimsical themes only (Market Stall, Paper till). Sold-today: out, but the
    tile badge is kept for a property chosen in POS Products settings (stock for now, amber when
    low). Receipt tear-off: whimsical themes only. Doodle: still open.
30. **Icon set.** Paul: *"a custom icon set could be very, very interesting… I would be willing to
    pay for a nice icon set if it adds some personality."* `icons/board.html` (captures
    `icons/screens/board/`): the register's 26 icons (rail, cart, tender) drawn from twelve
    families by name from the Iconify collections — Lucide (today), Phosphor regular and duotone,
    Tabler, Hugeicons stroke, Solar linear, MingCute, Iconoir, Streamline Plump, Flex, Freehand,
    Sharp — with coverage counts and 2026-09-16 prices: Streamline Icons plan from $19/month
    annual, 300,000+ icons, 100 icons per project; Hugeicons Pro from $99/year, 60,000 icons,
    10 styles; Nucleo $149 one-time for 44,282 icons, $99 per family; Untitled UI from $59
    one-time; custom drawing of ~40 icons roughly $1,500–4,000. **Pick: Phosphor, duotone for the
    rail and the big moments, regular elsewhere** — free, complete, one drawing at six weights,
    and the duotone fill is the personality. If spending: Streamline Plump is the only warm set;
    the hybrid (buy Plump, commission the 15 brand-carrying glyphs) is the route to a set that is
    nobody else's.
    Paul (2026-09-16): out are MingCute, Flex, Freehand, Sharp; no duotone; Tabler is nice but a
    little too thick → a Tabler variant with the stroke thinned to 1.5 px added to the register's
    *Icons* switch, which now holds Lucide, Phosphor, Tabler, Tabler 1.5, Hugeicons, Solar,
    Iconoir, Plump.
    Coverage against the app's full list (134 Font Awesome Pro solid icons in
    `packages/components/src/icon/svg/fontawesome/solid`, 133 without the WCPOS mark), matched by
    name and synonyms against each family's free collection: Tabler 131, Hugeicons 132, Phosphor
    126 (only cart-plus / cart-check variants missing), Solar 114, Iconoir 115, Plump free subset
    91. Table on the icons board. **Tabler and Hugeicons are complete; Phosphor near enough; Solar
    and Iconoir have real gaps (no cash register in Solar, no receipt in Iconoir). Pick: Tabler at
    1.5 px.**
    **Decided (Paul, 2026-09-16): Tabler at 1.5 px, for a while; Hugeicons is the standing
    alternative ("quite good as well"). Tabler's rail glyph is `building-store`. Full write-up:
    `docs/design/2026-09-16-icon-set-research.md`.**
31. **The table's surface (2026-09-16).** Paul: not happy with the background of the table, but no
    box around it; find a compromise; every table Mobbin has, in five or six really different
    versions. Today the products sit on the page grey beside a white cart panel. Mobbin sweep: 44
    screens from 40 apps, saved to `pos-register/screens/mobbin-tables/` and shown under each
    panel of `pos-register/board-table-3.html` (captures in `screens/board-table-3/`). Ten
    treatments of the decided table, surfaces only: 01 today · 02 the white sheet, data white and
    chrome tinted (Attio, Twenty, folk, Linear) · 03 all white, one seam (Shopify, Fresha,
    Klaviyo, Stripe, Square) · 04 the header band (Employment Hero, Hotjar, Copy.ai, Wix) · 05 rows
    as cards on the grey (Navan, Zillow, Aboard, Luma) · 06 zebra, no lines (Uxcel, Supabase,
    Adaline) · 07 the well, a sunken tint with no stroke (Gemini, Revolut Business, Cursor) · 08
    the floating sheet, shadow and no stroke (Podia, Airwallex, Workable, Deel) · 09 the grid
    (Dovetail, Neon, Attio, Retool, n8n) · 10 the dark till, white sheet beside a charcoal cart
    (Fey, Revolut Business, Linear dark). What Mobbin shows: data-first products (CRMs, Linear,
    Shopify's index) put the records on white and the chrome on grey; the white card on a grey
    page is the commonest shape for a product list but it is the box Paul ruled out; row-cards
    and zebra are the two ways to keep a grey page without a box. **Pick: 02 the white sheet,
    runner-up 04 the header band.** Waiting on Paul.
    **Paul (2026-09-16): leaning to today's surface or the floating sheet, not sure.**
    **Paul (2026-09-17): a toggle on the main mockup for today's, the floating sheet, and all white.**
    Done: the register's `Surface` switch (`data-surface` on the frame), on tiles and the table.
32. **Filter bar, and the slide (2026-09-16).** Paul: the filter bar from the existing app comes
    back under the search, and grows (users will add their own filter buttons); variations should
    not expand the table down but slide it left, with a breadcrumb at the top so the whole table
    becomes the variations view; a category chosen from a row's chip or from the bar does the same.
    Drawn live in `pos-register/board-table-4.html` (captures in `screens/board-table-4/`) on both
    surfaces he is between. The bar holds the app's own pills, read from
    `packages/core/src/screens/main/pos/products/filter-bar/pos-filter-bar.tsx`: Stock status,
    Featured, On sale, Category, Tag, Brand, the user's quick filters and an add button. The
    Category column in the table is a chip; pressing it, or a category from the pill's menu,
    slides the table left (280 ms, the old pane drifts 24% and fades) and a breadcrumb *Products ›
    Coffee · 4 products* takes the top; the Category pill fills with the name and its × is another
    way back. A variable product slides to *Products › Tote bag · 3 variations* with the product's
    image, SKU and starting price on the right of the crumb, attribute columns in the table, + adds
    the variation to the cart. On the floating sheet the sheet is the stage and its corners clip
    the slide. Waiting on Paul: which surface; whether the bar stays put or travels; whether the
    pill should fill.
33. **One header language (2026-09-16).** Paul: the cart's header was a tinted band while the
    products table's is text over a hairline, "that just looks weird". The table's is the decided
    language (decision 22), so the cart header drops the band and takes the same height, type and
    hairline, in the register and on boards 3 and 4. The band survives nowhere; if a band is ever
    wanted it is the surface board's 04 for both tables at once, not one of them.
34. **All white, the header, the resize, the footer, the add button (2026-09-17).** Paul: show
    it all white like one of the examples; play with the header; the resizable columns and the
    existing app's table footer have to be there; think outside the box on Add to cart. Board 4
    grew: a third frame (all white, one seam), and a strip that swaps, on every frame, the
    **header** (caps over a hairline, today · sentence case, 13 px medium, dark · tinted band ·
    bold with a 2 px dark rule; the cart's header follows each) and the **add idiom** (+ at the row
    end, today · the row is the button, a count badge at the end · the price is the button, an
    outlined pill that fills blue with a count · + that becomes a − n + stepper once in the cart ·
    the word *Add* that becomes *Added · n* · tap adds, hold 450 ms for a − n + popover on the row).
    Column edges in the header drag to resize (`S.cols` per view, a 44 px floor, the name column
    takes the remainder). The footer is the app's (`data-table/footer.tsx`): *Tax based on: Shop
    base address ▾* left, *Showing n of m* and the sync button right; in the variations view the
    count reads *3 variations of Tote bag*. Mobbin behind the add idioms (12 screens in
    `screens/mobbin-add/`, at the bottom of the board): Sweatpals and Instacart (+ or Add, then a
    stepper), Snoonu (the price is the button), Chipotle and HelloFresh (count with a stepper),
    IKEA (filled basket), Walmart, Shopee, Kiwi (a stepper on every row), CAVA (count with a
    picker). **Picks: sentence case on all white, caps elsewhere; tap adds + hold for quantity
    with the count badge, price-as-button the strongest alternative.** Waiting on Paul.
    **Header decided (Paul, 2026-09-17): caps over a hairline, as it is.**
    **Paul (2026-09-17): likes the + that becomes a stepper, but the column it needs is a waste
    of space; likes the press-and-hold. Ruled: an add button, press-and-hold for quantity, the
    stepper as a popover.** Drawn as the board's default: the + as today (a 64 px column), a tap
    adds one, holding the + for 450 ms opens − n + as a popover on the row, and once the item is
    in the + shows the count in its place (a 32 px blue circle). Variations the same. Open: whether
    the + should carry the count or stay a plain +.
    **Paul, same day: the cart will have a slide to remove; explore a slide to add, maybe a slide
    to add quantity with the stepper; on desktop it has to reveal itself on mouse-over.** Drawn as
    the seventh idiom (*Swipe to add · hover reveals*): a rightward drag on the row body pulls a
    green *+ Add* out from under the left edge, past 88 px it adds on release (the row flashes and
    the count appears in the last column); with a mouse, hovering a row slides its body 152 px
    left to show a − n + stepper at the right, the cart-line hover actions mirrored. Open: swipe as
    a second gesture beside the hold, or instead of it.
35. **How the tablet POS apps add an item (2026-09-17).** Paul: a native tablet app; swiping to
    add is too many moves, the whole row as a button is more intuitive; research how the other POS
    systems do it. Read from each vendor's own help pages (links in the hub log's sources):
    **Square** tiles add on one tap; a second tap adds another (or a new line with consolidation
    off); tap the cart line for quantity, modifiers, notes; long-press is grid editing. **Shopify
    POS** smart-grid tiles add on tap; quantity is + − on the cart line; swipe turns tile pages;
    long-press edits tiles. **Lightspeed X (Vend)** quick keys add on tap, again to add another;
    expand the line to edit quantity. **Lightspeed R** list view has a + per row or thumbnail →
    Add to Sale; + − on the line; … menu. **Loyverse** tap adds; tap the line for + −; swipe left
    on the line deletes; long-press on the grid is layout mode. **Toast** tap adds; tap the check
    line for quantity; long-press is manager Quick Edit. **Clover** tap adds, and a QTY bar (preset
    numbers, tap before the item) sets quantity first. **Zettle** tap adds; long-press edits the
    tile; quantity in the cart. Summary: the tile or row is the button, one tap adds, again adds
    another, quantity lives on the cart line, nobody swipes to add, long-press belongs to editing.
    Applied: board 4's default is now *Row is the button* with a count at the row end; Clover's
    quantity-first (×1 ×2 ×3 ×5 ×10 beside the search, the next row tap adds that many, then it
    resets) is a new idiom; the hold, the +, the price, the stepper, the word and the swipe stay
    in the strip for comparison. Also fixed: `.in` on the count pill matched the search field's
    class and inherited its padding; the state class is now `.has`.
    **Paul (2026-09-17): with that. The table has the last column anyway for the variable products'
    chevron, so the + sits there and becomes the quantity; whether the whole row or only the icon
    is the button he leaves to me. Ruled by that: the whole row is the button, the + stays as the
    affordance and becomes the count.**
36. **The cart line: quantity, edit, remove, on touch and on mouse (2026-09-17).** Paul: the
    stepper is right for cart quantity but takes too much room, so only on the active line; the
    swipe is really intuitive on a tablet but a row sliding on mouse-over would confuse desktop
    users, who need edit (the line's details) and remove on every line; workshop it. New live
    board `pos-register/board-cart.html` (captures in `screens/board-cart/`, touch and mouse for
    each): 01 **the selected line expands** (a second row: stepper, Edit, Remove; both pointers
    the same) · 02 **the quantity is the button** (a popover with the stepper and a 1–9 keypad;
    the name opens edit; remove is swipe on touch, a trash on hover on mouse) · 03 **nothing until
    you ask** (swipe left reveals Edit and Remove on touch; on mouse, hovering fades the stepper,
    Edit and Remove in at the line's end, over the total, the line never moves; click pins them)
    · 04 **a … on every line** (menu: quantity stepper, Edit line, Remove; Lightspeed R and
    Shopify's answer) · 05 **the stepper in place on the selected line** (the quantity box widens
    into − n +, the total stacks over n × price, Edit and Remove appear at the end; the others
    stay compact; Paul's brief exactly). All five: − at 1 becomes a trash; remove shows a 2.6 s
    Undo toast; on desktop + − ⌫ ↑ ↓ act on the selected line. **Pick: 03 with 02's quantity
    popover** (the line never reflows, quantity gets a keypad); 05 if the stepper should be seen.
    **Decided (Paul, 2026-09-17):** the one-tap quick edit of name and price stays (from cut 2).
    **Quantity is the button**, but not a popover below: the box expands in place, the number
    exactly where it was, − to its left, + to its right, the keypad beneath, the border appearing
    to grow (drawn with a 180 ms clip-path from the box's rectangle). **Paul: the overhang is
    fine; make the keypad bigger, to touch best practice.** Cells are 48 px (Material's minimum,
    over Apple's 44 pt), so the panel is 144 px wide and overhangs the cart's left edge by 38 px;
    the board draws a sliver of the products column to show that honestly. The phone sheet's keys
    are 56 px with 8 px gaps. Typing on the keypad replaces the number, − at 1 is a trash. On
    phones the same opens the app's bottom sheet (stepper and keypad, Done). **Edit and delete
    live under the line**: press and swipe the *total column* left; under 80 px it springs back,
    past 80 it snaps to Edit / Delete, past 240 it deletes (with Undo). On a mouse, hovering the
    total nudges the line 14 px so the strip's edge shows, and a click on the total opens it.
    Live as D1 (tablet, with the sliver) and D2 (phone) at the top of the cart board; the five
    explorations are folded below.
    **In the register (2026-09-17, Paul: "I don't see the cart changes"):** the quantity is a
    button opening the expanding keypad (positioned over the box after each render, `--qdy` for
    the grow animation), a `qty` sheet on the phone width, real quantity and removal on the line
    data with a 3 s Undo row, the swipe on the total (`pointerdown` on `.tot`, the strip's own
    width as the snap point, strip + 80 px to delete), the desktop nudge via `:has(.tot:hover)` and
    click-to-open on the total; the hover buttons are removed. Keyboard digits, ⌫, Enter, Esc drive
    the open keypad.
37. **The products footer (2026-09-17).** Paul's screenshot of today's app: *Tax based on: Shop
    base address* left, *Showing 24 of 209 ⟳* right; important, and cluttered; icons perhaps.
    Five treatments under `Footer` on board 4: today's text · icons with the values (a percent
    glyph for the tax basis, a list glyph for the count) · one compact 32 px line (*% Shop base ·
    12 of 1,204 · ⟳*) · the tax basis moves to the cart's customer row as a chip (it is a property
    of the sale, set by the customer's address, not of the product list) and the footer keeps
    count and sync · no footer (count inside the search field's right end, sync in the toolbar,
    tax chip in the cart). **Pick: tax basis to the cart, count and sync as the compact line.**
    The filter pills now carry the app's icons (box, tag, star, folder), as in the screenshot.
    **Decided (Paul, 2026-09-17): icons and values; no icon before the count; "Shop base address"
    condensed to "Shop base" (the full name in the tooltip and in the select).** Board 4's default.
    In the register too (2026-09-17, Paul: "the footer is still the old footer"), with the filter
    bar, the row as the button, the count in the last column, and adds that change the sale.
    **Decided (Paul, 2026-09-17): today's surface.** The switch and the sheet and all-white CSS are
    out of the register; board 3 and board 4 keep the ten for the record.

38. **Variations slide, or inline rows: a setting (2026-09-17).** Paul: bring the table breadcrumbs
    and the slide across, rather than the popovers; users will get a POS panel setting to choose
    the style. In the register a variable product slides the table left behind a breadcrumb
    (`‹ Products › Tote bag`; the SKU, from-price and count came across from board 4 and Paul
    struck them, that information is already on the page); the Category
    pill opens a menu and a pick slides the same way, the pill filling with the name and its ×
    the way back. The strip's **Variations** switch and a row in the products settings swap
    between the slide and the inline indented rows (decision 22). Default in the mock-up: slide.

39. **The grid drills in the same way; the transition, six ways (2026-09-17).** Paul: the grid
    needs the same breadcrumbs; research the best grid transitions on Mobbin. The sweep: every
    iOS catalogue (Afterpay, Shop, DICK'S, SKIMS) pushes, the name becomes the title and a back
    arrow returns; web tools (Craft, Air, Savee) swap the folder's contents in place under a
    crumb; the media apps (Apple Photos, Pinterest) zoom out of the tile; Loyverse and Square put
    a back tile first in the child grid; Blinkit and Square Go re-filter under chips and never
    navigate. `pos-register/board-grid.html` draws six live: push, fade, zoom, hero (Material's
    container transform), stagger, back tile. **Recommendation: push**, the table's own motion,
    so the register's grid now has the breadcrumb and slides like the table. Not decided.

40. **Filters and breadcrumbs (2026-09-17).** Paul: with a variable selected, can you toggle
    in-stock; does it show in the breadcrumb; what about two chips; what about a quick filter
    with several parts. The model, from NN/g and Baymard and the saved-view pattern in Linear,
    Notion and Innovaccer: **the breadcrumb is the place, the chips are the conditions, the
    footer is the count.** The crumb only ever shows hierarchy (Products › Drinks, Products ›
    Tote bag); the bar keeps every applied chip visible and filled (Stock · In stock, Featured ×)
    and they persist across levels; a quick filter is one chip with a parts badge, and pressing
    it when on opens its parts with Turn off and Edit; a chip that does not apply at the current
    level (a product filter inside a product's variations) stays on but dims, with the reason in
    its tooltip; conditions AND together with the place; an empty result shows "Nothing here
    matches the filters" with Clear filters. Written up in
    `docs/design/2026-09-17-filters-and-breadcrumbs.md` and live in the register (Stock is a
    select, Featured a toggle, Morning menu the quick filter).
24. **More product-list options.** `pos-register/board-table-2.html` (captures in
    `screens/board-table-2/`): the decided base for comparison, then compact no-images (Attio) ·
    comfortable with category (Shopify POS) · menu board, name and price only (Toast, Square) ·
    quantity steppers (wholesale) · category tabs above (Square item library) · two columns ·
    sort chips with no header (Linear) · search-first with keyboard hints (Superhuman, Raycast).
    These are layers on the base, not replacements: category tabs, sort chips and search-first
    combine with any row style.
Orders, after Paul's first thoughts (2026-09-14):

20. **The list's frame.** Paul: away from the rounded-corner chrome table. Four styles in the
    strip (*List style*), captured in `orders/screens/variants/list-*.jpg`:
    (a) **no frame** — the page is the surface, a hairline header row and hairline rows edge to
    edge (Linear, Stripe); (b) **no frame, grouped by day** — (a) with a soft *Today · 2 · £70.60*
    header per day, collapsible (Linear's groups); (c) **status counts + no frame** — a strip of
    status counts as two-state chips above (a), replacing the Status select (Stripe's
    transactions tabs); (d) the hairline card from cut 1. **Pick: (a)** as the base, with (b) as
    the default grouping for the *Date* sort (most orders are read by day) and (c) as the day the
    counts endpoint exists; the card is the one to drop.
21. **Toggle versus select.** A two-state filter (*Unpaid · Today · My sales*) is a chip with no
    chevron that fills when on and shows a check; a select (*Customer ▾ · Date range ▾*) carries a
    value, a chevron, and an × when set; a hairline separates the two groups. **Pick: as drawn.**
22. **The product table reuses the orders table.** Drawn in the register (*Products · table
    view*): the same header row, hairline rows, resize handles and footer, with Name + SKU,
    Price, Stock as a dot-plus-number when low or out, and a + per row (a chevron for a variable
    product). The tile/table control is **one icon button that shows the view you would switch
    to** (list icon while on tiles, grid icon while on the table). **Decided (Paul, 2026-09-14,
    from the seven-idiom board in `pos-register/board.html`): frameless rows with a header, and a
    variable product opens its variations as indented rows (board 01 + 07).** The table language
    is decided on the POS and flows to orders, customers and coupons; the orders list is
    therefore frameless too (decision 20's (a)), with grouping and counts as later additions.
18. **Where WordPress admin lives without a header.** Today it is a web-only item in the shared
    header's user menu (`openExternalURL(site.home + '/wp-admin')`, with *Desktop App*); the POS
    has no header. (a) **a *This site* group in the user sheet: WordPress admin, Desktop app**
    (drawn, web only; desktop width in the strip) · (b) a WordPress glyph in the rail's bottom
    cluster · (c) a link on the Settings screen. **Pick: (a)** — it sits with Switch store and
    Sign out, which are the other things about *where you are signed in*; the rail is the app's
    own map and an external link there reads as a screen.
19. **What "switch user" means on the web.** Read from source (monorepo `next`, plugin `main`):
    in embedded mode `/pos` is gated by the WordPress cookie (`auth_redirect()` when not logged
    in, `access_woocommerce_pos` checked), then the template mints a JWT for the cookie user and
    injects it as `initialProps`. On **every** page load the hydration step
    `PROCESS_INITIAL_PROPS` upserts that user's credentials and **sets the current session to
    them**, so a switch made in the app lasts until the next refresh, then the cookie user is
    back. The pieces for a real switch already exist: credentials are stored per site
    (`site.wp_credentials`), `login({wpCredentialsID})` swaps the session, *Another account…* runs
    the JWT login (`/pos/login`, the plugin's own login template) with a same-window redirect and
    a redirect-return claim. What is missing is one rule in that hydration step. **Decided (Paul,
    2026-09-14): the cookie gates `/pos` and adds its user to the device; the app owns the active
    user across a refresh.** Switch user survives a reload; Sign out still ends the cookie session.
    Tracked as [wcpos/monorepo#2043](https://github.com/wcpos/monorepo/issues/2043), not a map
    ticket: it is one conditional in `PROCESS_INITIAL_PROPS`, no plugin change. **Paul's caution
    (2026-09-14): be very careful managing the logged-in user once several share a device.** The
    case to design and test against: user A's token expires, the re-auth form appears, and user B
    signs in on it. The form must name whose session it renews, and B signing in must become a
    switch to B, never A's session with B's token. The test flows are on the issue.

## Rejected while drawing

- A dark toast for every line added — noise on the happy path.
- Filled status pills — they are the loudest mark on a hairline screen and fail on a monochrome
  receipt printer.
- Cards on the phone orders list — rows with a chevron are the iOS grammar; cards are a web habit.
- A full-screen modal for column settings — the direction's §5; anchored panel on tablet and
  desktop, sheet on phone.
- A fourth colour theme surface per screen — the working surface is one neutral, the theme lives
  in the rail and the controls.
- A shadow under the pane and the popovers — hairline and scrim carry the elevation.

## What the inventory changed

Both screens were inventoried read-only on `next` (Codex, `-m gpt-6-astra`, effort high) before
drawing, per rule 9. The orders inventory is summarised in `orders/README.md` and drove the column
set, the filter set, the status set, the row menu, the footer copy and the states. The register's
inventory run had not returned when the drawing was done; the register is drawn from the decided
2026-09-11 prototype and PR #259, which the app's `pos/cart/*` on `next` implements, so the strings
there are the app's. When the run lands its report is folded into `pos-register/README.md`.
