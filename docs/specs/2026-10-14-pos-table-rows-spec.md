# POS products table: one grid, four kinds

Date: 2026-10-14. Lane: `next`. Owner: Paul. Status: **design chosen, build in progress**
(monorepo branch `feat/pos-table-rows`). Visual reference:
`docs/prototypes/2026-10-14-pos-table-rows/index.html` (open it locally; the strip's Layout,
Columns, Name shows and Price shows switches drive every frame). Parent design: the Poster tile,
`docs/specs/2026-10-12-pos-product-tile-poster-spec.md`. Rules: monorepo `.claude/rules/design.mdc`.

## Owner decisions (2026-10-14)

1. **Columns stay.** *"Keep in mind we have columns. We have fucking columns. For the different
   fields users can add and remove columns."* and *"It can also sort by columns as well so I think
   we need to keep columns."* The POS products table is the column table the settings describe
   (`pos-products.columns` in `initial-settings.json`): nine columns the store turns on, off,
   reorders and resizes (image, name, SKU, barcode, type, stock, cost, price, actions), display
   options under the name column (stock, SKU, barcode, categories, tags, brands, attributes, meta)
   and the price column (tax, on sale), and a header that sorts by any column that can sort. A
   table mockup that replaces the columns with the tile's field switches is wrong on arrival; the
   first board of the day did exactly that and was redrawn.
2. **The tile's vocabulary rides on the grid.** From the redrawn board, with the recommended
   defaults accepted (*"go ahead with what you recommend"*): the opens-more cue is **stack and
   glyph** (the stack says "rows behind this"; the glyph says what kind of container: folder,
   grid, sliders; a variable product is a stack with **no glyph**, as on the tile, because what is
   behind it is its own options, not other things); a variable product's price is **`from` + its
   minimum when the range has a width, the one price when it does not** (the tile's rule), never
   the range.
3. **The problem being solved** (his screenshot, 2026-10-14): a category row was a different
   component with a 40 px thumb and a regular name; a product row had an 80 px picture, a bold
   name and blue category pills; row height changed four times down one screen and nothing said
   which rows open and which rows sell.

## The cues

Each kind has three marks that never disagree: the image cell, the name cell's sub line, the
actions cell. No kind label is printed unless the store turns the **Type** column on.

| Kind | Image cell | Name cell | Type | Stock | Price cell | Actions cell |
|---|---|---|---|---|---|---|
| Category | stacked thumb, folder glyph (bare in the tint without a picture) | name · `N products` | Category | — | — | `›` |
| All products / shortcut | stacked, grid / sliders glyph on tint 5 | name · a shortcut's conditions | — / Shortcut | — | — | `›` |
| Product | flat thumb | name · display options | Simple | count pill | price · Sale pill + struck · tax | `+`, or the in-cart count |
| Variable product (drill) | stacked, no glyph | name · `N options` · display options | Variable | — | `from` · lowest price | `›` |
| Variation | flat (own picture, else the parent's tint) | option chips · display options | Variation | count pill | price · Sale · tax | `+`, or the in-cart count |

- **Stacked thumb** = there are rows behind it (the tile's rule: *"Any card that drills down into
  a new stack should have that consistent UI"*, 2026-10-13). The two cards are the tile's (3 px
  and 6 px down-right).
- **Stock** is the tile's count pill everywhere the table shows stock: the Stock column and the
  name cell's stock display option. "12 in stock" and the In stock / Low / Out badge go.
- **Sold out**: the picture greyed and the words in the price cell instead of a price, no Sale
  pill. Backorder: the clock pill.
- **Categories** in the name cell are plain text joined by `, `, each name still the tap-to-filter
  control; no blue pills.
- **A variation row never repeats the parent's name**: the crumb above and the footer below
  (`6 variations of Hoodie`) carry it. The pane's name header reads **Option**.
- **Actions**: `›` opens, `+` adds, the primary badge is already in the cart. A sellable row
  always ends in a `+`, so the variation row gets one too.

## What it changes

- **`PosterThumb`** (`packages/components/src/poster-tile/thumb.tsx`), beside `PosterTile`: a
  square thumb in the tile's vocabulary (picture or `tintOf` tint, folder / grid / sliders glyph in
  a 20 px card circle on a picture and bare in a tint, the two stack cards, the sold-out greying).
  56 px on touch, 40 px with a mouse. It knows nothing about products.
- **The image column is a fixed-width thumb column** (`width: 68` in the settings). Today it has
  no width, flexes, and the picture (`h-20 w-full`) fills whatever it gets: the 80 px picture in
  the screenshot. The settings merge treats initial values as authoritative for `width`, so this
  reaches existing installs.
- **Term rows** draw the thumb at the image column's width so their names line up with the
  product rows' name cell under the same header. They stay their own component (one cell that
  matters), not TanStack cell rows. The root term list keeps no header.
- **Name cell** words in the tile's order: name, then (drill variable) `N options`, then a facts
  row: stock pill, SKU, barcode, categories, tags, brands, attributes, meta, each only when its
  display option is on and the value exists.
- **Price cell**: one wrapping right-aligned row: price, Sale pill + struck regular (on sale
  option), tax line (tax option). Variable: `from` + minimum when the range has a width, the one
  price when every option costs the same (no `from`).
- **Type column** gets a cell (Simple / Variable / Variation / Grouped / External); it existed in
  the settings with no cell behind it.
- **Touch** (no header today, unchanged): the on columns stack under the name in column order,
  as the row's coarse branch already does; the image cell now stays beside the words instead of
  rendering inside the stacked block.

## Not in this spec

Column order, resize and header sort (untouched). The settings dialog. The `inline` variations
style beyond the thumb and the chips (its popover and expand toggle stay). The grid. The
breadcrumb, footer and filter bar. E2E, screenshots and gallery entries (polish phase on `next`).

## Open, not ruled

- The `+` keeps its current success colour; the board drew it in the foreground colour. Judge on
  dev-next.
- A category without a picture is the folder on its tint (as the tile); the mosaic stays a
  follow-up, as on the tile.
