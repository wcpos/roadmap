# POS product grid: the Poster tile

Date: 2026-10-12. Lane: `next`. Owner: Paul. Status: **design chosen**, spec awaiting the owner's
read. Visual reference: `docs/prototypes/2026-10-12-pos-product-tile-poster/index.html` (open it
locally; the Fields switches drive every frame). Market survey: `research.md` beside it. Rules:
monorepo `.claude/rules/design.mdc`, `CODING_STANDARDS.md` § Design.

## Owner decisions (2026-10-12)

1. **The Poster.** From a four-direction board (Caption, Poster, Ledger, Keys) Paul chose the
   Poster: the picture is the whole square tile; the words sit on a scrim at its foot. *"I think I
   like B the most, I would want to see the full spectrum of tiles."*
2. **Every grid field stays.** *"I understand that no one else prints sku etc, but that is what sets
   our POS apart, ours is extensible and customisable. I doubt any user would enable them all, but
   for some users showing the COGS is more important than the stock, so we have to give them that
   option."* Nothing is removed from the nine `gridFields`; each gets a fixed home.
3. **A covered picture is the owner's choice.** *"If a store owner really wants everything on, then
   they accept that the picture is going to be covered. What's important is that we get this
   gradient perfect."*
4. **The scrim is "card colour, eased, 85, 48".** From a board of four scrims (black, card colour,
   frosted, band) × two fades × three strengths × three reaches. Black, frosted and band were shown
   and not chosen.
5. **Stock on the tile is a number** when the product manages stock; the old "In Stock" badge goes.

Open, not ruled: a category with no photo of its own — its name on a tint (what the prototype
builds) or a 2×2 mosaic of its products' pictures. The tint needs nothing; the mosaic needs the
category's first four product images, which the browse source does not fetch today. Build the
tint; the mosaic is a follow-up if he asks for it.

## What it changes

`packages/core/src/screens/main/pos/products/v2/` — the grid mode of the register's products
stage. Three tile components are replaced by one: `grid/product-tile.tsx` (product and the
drill variable product), `grid/variation-tile.tsx` (variation, the parent in slot 0, the
placeholder) and `browse/term-tile.tsx` (term, All products, shortcut, the parent term). The
table mode (`rows/*`), the inline variations style (`grid/variable-product-tile.tsx` in the
legacy grid, still selectable as `variationsStyle: 'inline'`), the Deal (`deal-stack.tsx`), the
browse stage, the filter bar, the footer, the settings dialog's fields and the data they read are
untouched. The gallery entry `browse-tiles` (`browse/gallery.tsx`) is re-registered on the new
tile.

## The tile

One component, `PosterTile`, in `packages/components/src/poster-tile/` (a recurring element is a
named reusable component with a contract, never styled in place). It knows nothing about products:
it takes a picture, marks and words. The products screen maps records onto it in
`v2/grid/*` and `v2/browse/term-tile.tsx`, which become thin.

```ts
type PosterTileProps = {
  /** The square. One of: an image source (with the existing attachment/placeholder handling
   * done by the caller), a tint index 0–5 (no picture), or a mosaic of 1–4 image sources. */
  picture: { kind: 'image'; source: ImageSource; still?: boolean }
         | { kind: 'tint'; tint: 0 | 1 | 2 | 3 | 4 | 5 }
         | { kind: 'mosaic'; sources: ImageSource[] };
  /** Top-left mark: a stock count, a low-stock count, a backorder clock, a folder glyph, nothing. */
  mark?: { kind: 'count'; value: number; low?: boolean } | { kind: 'backorder' } | { kind: 'folder' };
  /** Top-right: the in-cart count (always mounted, see InCartCount) and/or the way back. */
  corner?: React.ReactNode;         // InCartCount, already mounted-at-zero
  back?: boolean;                   // the parent in slot 0
  /** Words on the scrim, in order. Each slot is optional; an empty scrim is not drawn. */
  title?: React.ReactNode;          // the name, or parent-name + option chips
  money?: React.ReactNode;          // the money row
  sub?: React.ReactNode;            // "6 options", "161 products", a shortcut's conditions
  facts?: React.ReactNode;          // the facts row (Cost, SKU, barcode, categories)
  /** Greys the picture; the caller also puts "Sold out" in the money slot. */
  out?: boolean;
  /** The stack of cards behind the tile: a variable product. */
  stacked?: boolean;
  /** Grows to the row (a dealt cell) or takes a share (the grid). Same as today's `grow`. */
  grow?: boolean;
  lifted?: boolean;                 // the Deal has its copy out: opacity 0
  onPress: () => void;
  accessibilityLabel: string;
  testID: string;
};
```

### Geometry

- The tile is a square (`aspect-square`), `rounded-lg`, hairline `border-border`, `overflow-hidden`,
  `m-1` as today so column maths and the Deal's measurements are unchanged. A stacked tile keeps the
  square and draws two offset layers behind it (4 px and 8 px down-right, card colour, hairline),
  inside the same `m-1` margin.
- The picture fills the square (`cover`). Press feedback: the picture dims to 92 % within 100 ms
  (`active:` on the Pressable), never a background change (there is no caption background to change).
- Marks: `top-2 left-2` and `top-2 right-2`, 22 pt pills (24 pt circle for the count), as today's
  stock pill and `InCartCount`. The parent's back badge is the existing `BADGE` style.

### The scrim (decided: card colour, eased, 85, 48)

- Colour: `bg-card` at **85 %** opacity. White in light mode, near-black in dark. The words are
  `text-foreground`; secondary words (`sub`, tax, struck price, labels) are foreground at 72 %;
  option chips are foreground at 12 % under foreground text; the Sale pill is foreground on card.
  No new hex: two tokens, inverted.
- Shape: the scrim is the words' block plus **48 px** of reach above the first line. Over the reach
  the opacity follows an **ease-in curve** from 0 to 85 %; under the words it is a flat plateau at
  85 %. Thirteen stops, top-down, as fractions of the 48 px and of the 85 %:

  | at | 0 | .018 | .048 | .09 | .139 | .198 | .27 | .35 | .435 | .53 | .66 | .81 | 1 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|---|
  | of 85 % | 0 | .002 | .008 | .021 | .042 | .075 | .126 | .194 | .278 | .382 | .541 | .738 | 1 |

  Then 100 % of 85 % to the bottom. A two-line tile and a seven-line tile fade identically; only
  the plateau grows. The reach and the strength are **constants in the component** (named, with
  this spec cited), not settings.
- Web: one CSS `linear-gradient(to bottom, …)` over the scrim box, `color-mix(in srgb, var(--card)
  N%, transparent)` per stop (or the equivalent rgba from the theme's card token). Native:
  `react-native-svg` `<LinearGradient>` with the thirteen `<Stop>`s as the scrim's background
  (`react-native-svg` is already a dependency; `expo-linear-gradient` is **not** added, it would move
  the native fingerprint and cost a build). The gradient's `height` is the measured scrim height;
  the stops are expressed as `48 / height` fractions, so the plateau starts exactly at the words.
- Padding: 10 px sides and bottom; the reach is the top padding. Gap between word rows: 2 px.
- No scrim is drawn when every word slot is empty (picture-only tiles: the marks still show).

### No picture

- A product or variation with no image: a **tint** square, the words in the same place, no scrim
  (the tint is opaque and the words sit on it directly). Six tint tokens are added to
  `apps/main/global.css` as light/dark pairs, `--tile-tint-0 … --tile-tint-5` (light ≈
  `oklch(0.93–0.95 0.035–0.045 h)`, dark ≈ `oklch(0.31–0.34 0.03–0.05 h)`, hues 250/160/40/300/
  90/200), with Tailwind classes `bg-tile-tint-0 …`; `picture.tint` is that index, so prop value
  and token number are the same. They are named by index, never by category.
- **Which tint**, one pure function `tintOf(key: number | string): 0–5` with unit tests: a number
  is `id % 6`; a string is the sum of its UTF-16 code units `% 6` (the same product always gets the
  same tint; the function is the one place the rule lives). The key is the product's first category
  id; a variation's is its parent's first category id; a product with no category passes its
  `name`.
- A category with no image: the folder glyph top-left, name and count at the foot, on
  `tintOf(term id)`. All products and a shortcut: the existing grid/sliders glyph, on tint 5.
- The old `PRODUCT_IMAGE_PLACEHOLDER` (a grey picture) is no longer shown on a tile; `TileImage`'s
  error path hands the tile `kind: 'tint'` instead. (Table rows keep the placeholder; out of scope.)

## Words, slot by slot

The products screen fills the slots from the record and `gridFields` exactly as the current tiles
read them (`useDocField` selectors unchanged). A field that is switched off is not rendered, not
hidden.

| Slot | Product | Variable (drill) | Variation | Category / All / Shortcut |
|---|---|---|---|---|
| title | `name` (2 lines, clipped) | `name` | parent `name` small (12 px, 72 %) then one chip per attribute option (`sanitizeVariationAttributesRead(attributes)[].option`, the same values `resolveVariationName` joins; a variation with no usable attributes falls back to one chip of `resolveVariationName`) | `name` (2 lines) |
| money | price · Sale pill + struck regular when `on_sale` and `gridFields.on_sale` · `incl. X tax` when `gridFields.tax` — one wrapping row | `from` + min price when the range has a width (as `getVariablePrices` today); the same Sale/tax rules | as product | — |
| sub | — | `{count} options` (new string; today's `n_variations` reads "variations") | — | `{count} products` when `count > 0` (as today); a shortcut's `describeQuickFilter` sentence |
| facts | `Cost {total_value}` · `SKU {sku}` · barcode · categories joined `, ` — in that order, each only when its field is on and the value exists | as product (no categories for a variation) | as product | — |
| mark | count when `manage_stock` and `stock_quantity > 0` (low when `≤ low_stock_amount` or status `lowstock`); backorder clock when sellable at 0; nothing when stock is not managed; **all only when `gridFields.stock_quantity`** | — | as product | folder glyph on a category with a picture; on a tint the glyph sits in the tint instead |
| out | `displayStockStatus` is `outofstock`: picture greyed, money slot shows **Sold out** in place of the price, no Sale pill | — | as product | — |

- The facts row is `flex-wrap` with a 10 px column gap and 1 px row gap, 12 px, clipped at three
  lines (`max-h`). A fact never wraps inside itself (SKU, barcode: `nowrap` + ellipsis); the
  categories fact is its own line with ellipsis. Labels (`Cost`, `SKU`) are foreground at 65 %.
- `name` and `price` switched off are honoured as today (`hasAnyField`): with both off and no
  other field, no scrim.
- The money row never stacks: price, Sale pill, struck price and the tax line are inline children
  of one `flex-wrap` row with `items-baseline`. `PriceWithTax` is reused for the amounts (its
  `taxDisplay: 'text'` is the tax line).
- Strings. Existing: `common.from`, `common.sku`, `common.barcode`, `common.cogs` (shown as the
  label **Cost**: add `common.cost` rather than printing "COGS" on a till), `pos_products.n_products`,
  `pos_products.in_cart_count`, `common.back`. New: `pos_products.n_options` ("{count} options"),
  `pos_products.sold_out` ("Sold out"), `common.sale` ("Sale"), `common.backorder` ("Backorder"),
  `pos_products.n_left` and `pos_products.n_products` are used by the tiles today but are not in
  `en/core.json` — add them (the pill reads the number only; `n_left` is its accessibility label). `common.in_stock` / `common.out_of_stock` leave the tile (they stay
  for the table and the filter bar).

## Marks

- **Stock count** (`mark.kind = 'count'`): the box glyph and the number in a card-colour pill with
  a hairline; `low` turns it `bg-warning text-warning-foreground`. The number is the whole message
  (research: Square and Toast print the count; nobody prints "In stock").
- **Backorder**: a clock glyph and the word, muted. **Sold out** is not a mark: it is the greyed
  picture and the word in the money slot, one message.
- **In-cart count**: `InCartCount` unchanged, mounted at zero, in the `corner` slot.
- **Folder** on a category with a photo: a 24 pt card-colour circle with the folder glyph,
  top-left, so a photo category and a photo product never read the same.
- The parent's **back** badge: the existing 24 pt circle with the chevron, top-right, on the tile
  in slot 0 (product parent on the Deal, term parent on the browse level), as today.

## Settings

No new setting. `gridFields` keeps its nine keys and the settings dialog's **Tile fields** switches
are unchanged. `gridColumns` 2–8 unchanged. `variationsStyle` unchanged: `drill` uses the Poster;
`inline` keeps the legacy variable tile (its popover) — it is the retained old idiom per the
2026-09-20 ruling and is not restyled here.

## Behaviour that must not move

- The Deal: `PosterTile` forwards its `ref` (a `Measurable`) and honours `lifted` and `grow`
  exactly as `ProductTile` does; `deal-stack.test.tsx` and `variations-grid.test.tsx` stay green
  without edits beyond the testIDs below.
- testIDs: `product-tile`, `variable-product-tile`, `variation-tile`, `variations-parent-tile`,
  `variation-placeholder`, `browse-*` (`termTestId`), `browse-parent`, `browse-parent-badge`,
  `product-tile-stock-{id}`, `variation-tile-stock-{id}` and the `-{id}` image squares are kept with
  the same meaning (`apps/main/e2e/pos-variations-drill-in.spec.ts`, `pos-browse-by.spec.ts`,
  the Maestro flows).
- `useRenderProbe` / `probeEvent` instrumentation stays on the product tile and `TileImage`.
- The placeholder tile (`VariationPlaceholder`) is a tint-less muted square, as today.
- Term tiles keep their own height in a dealt cell (`TileSize 'own'`); a Poster tile is a square
  so this is now always true, and the words-body/`WORDS_PADDING` machinery goes.

## Not in this spec

The table rows; the inline variations popover; the category mosaic (needs data); any change to
the filter bar, crumb, footer or settings dialog layout; a per-tile colour chosen by the merchant;
pinned or merchant-arranged tiles (roadmap#404).

## Tests and proof (polish phase on `next`)

- Unit, cheap, not pinned to the look: `poster-tile.test.tsx` renders each slot combination (no
  scrim when empty; `out` greys and hides Sale; stacked draws the layers; tint index from an id);
  `grid/product-tile.test.tsx` and `browse/term-tile.test.tsx` updated for the slot mapping (which
  field goes where, facts order, count/low/backorder/none, "Sold out" replaces the price). The
  existing stock-mark tests move with the mark.
- Gallery: `browse-tiles` re-registered; the gallery label after the push run settles (required
  check on `next`). No E2E runs, no screenshot runs, no device pass (owner ruling 2026-10-08);
  publish `@next` after merge so he can see it on dev-next.
- One review pass, green CI, merge.

## Plan of record

1. `PosterTile` in `@wcpos/components` with the scrim (web CSS gradient, native svg gradient), tint
   tokens, stack, marks; unit tests.
2. Map `grid/product-tile.tsx` and `grid/variation-tile.tsx` onto it (product, variable, variation,
   parent, placeholder); strings; tests.
3. Map `browse/term-tile.tsx` onto it (term with/without picture, All, shortcut, parent); gallery;
   tests.
4. Publish `@next`; the LEDGER entries for `pos/products/grid` and `pos/products/v2/browse` record
   the change with this spec as evidence.
