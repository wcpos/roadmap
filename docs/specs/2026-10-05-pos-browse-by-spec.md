# POS products: Browse by — categories, tags, brands and shortcuts as tiles

Date: 2026-10-05. Lane: `next`. Owner: Paul. Issue: wcpos/roadmap#392 (proposal: "Add optional
categories first list to the POS screen"). Status: **approved in principle** on the first mockup
round of `docs/prototypes/2026-10-05-pos-browse-by/index.html` — *"Do as you recommend"* (approach
A, WooCommerce-native category semantics), then *"concentrate on getting the tiles and table
working"* with two scope cuts recorded below. The mockup is the visual reference; this spec is the
build contract. Rules: monorepo `.claude/rules/design.mdc`, `CODING_STANDARDS.md` § Design.

Market basis: `~/Projects/wcpos-handoffs/pos-browse-views-review-2026-10-05.html` (45 POS
systems). Categories-first is the home screen of Clover, Toast, Square for Restaurants, Revel,
Lavu, Erply and every open-source restaurant POS; YITH and Actuality are the two WooCommerce
competitors with a per-register `All products / Categories first` switch. The curated "favorites
grid" of Square, Shopify and Lightspeed is covered here by the **Shortcuts** source, which renders
the quick filters the filter bar already stores.

## Owner decisions (2026-10-05)

1. **Offer all three taxonomies** — categories, tags, brands — as one component: "brands and tags
   kind of follow the same format".
2. **Category semantics are WooCommerce's, verified from source.** A parent archive includes its
   descendants (`WP_Tax_Query` `include_children => true`, `get_term_children()`); the per-category
   `display_type` meta (`products` / `subcategories` / `both`) decides whether child categories are
   shown before the products; empty subcategories are hidden
   (`woocommerce_product_subcategories_hide_empty` is `true` by default); order is the term `order`
   meta, exposed by REST as `menu_order`. The POS treats an unset `display` as `both` — the shop's
   default is `products`, but the shop-wide option is not synced and child tiles are the point of
   the mode.
3. **The breadcrumb is already decided** and is used as it is (the `Breadcrumb` component the
   variations drill-in renders). Nothing in this spec changes its shape.
4. **The filter bar is untouched** in every browse mode. The Category pill stays in Categories mode;
   the quick-filter chips stay in Shortcuts mode. "We'll deal with the filter bar later."
5. **Scope is tiles and table.** Pinned product tiles, pages/folders, a per-register hide list, a
   start category, new quick-filter condition fields, a cashier-side mode switch in the header, and
   any change to the crumb or filter bar are out.

## What it changes

`packages/core/src/screens/main/pos/products/v2/` — the products stage of the register. Today the
stage opens on the products grid (or table) and drills one level, product → variations, on
`DealStack` (grid) or `PaneStack` (table). This spec adds a per-device **source** above the
products: the stage can open on a set of **terms** (categories, tags, brands) or **shortcuts**
(quick filters), each of which drills into a products grid/table, which still drills into
variations. The products grid, product tiles, rows, search, scanner, settings dialog, filter bar,
footer and the variations drill-in are reused unchanged.

## The setting

- `uiSettings['pos-products'].browseBy`: `'all' | 'categories' | 'tags' | 'brands' | 'shortcuts'`.
  Default `'all'` (today's screen, unchanged). Per device, like `viewMode`; added to
  `contexts/ui-settings/initial-settings.json` and the hydration rule in `ui-settings/utils.ts`;
  an unknown value reads as `'all'`.
- Shown in the existing product-settings dialog (`ui-settings-form.tsx`) as **Browse by**, a
  five-row option list under the View row (mockup: *Settings sheet*). Each row carries its count on
  the right (`5 categories`, `8 tags`, `6 brands`, `5 quick filters`; All products carries none).
- A source with nothing to show is dimmed, not hidden, with the reason beside it (design rule 5):
  `No tags yet`, `No brands yet`, `No shortcuts yet`. Zero terms means zero terms with
  `count > 0`. Choosing it is not possible; if the stored value's source later becomes empty (terms
  deleted on the server), the stage shows the root with only the All products tile.
- No second control in the header. The grid/table toggle is the only register-side toggle.

## Sources

| Source | Collection | Hierarchy | Image | Order | Hidden | Product set of a term |
|---|---|---|---|---|---|---|
| categories | `products/categories` | `parent` | `image.src` | `menu_order` asc, then `name` | empty (below) | `categories: [id, …descendants]` |
| brands | `products/brands` | `parent` | `image.src` | `menu_order` asc, then `name` | empty (below) | `brands: [id, …descendants]` |
| tags | `products/tags` | flat | none | `name` asc | empty (below) | `tags: [id]` |
| shortcuts | `uiSettings.filterBar` quick filters | flat | none | stored order | never | the quick filter, applied by `apply-quick-filter.ts` exactly as a chip press |

- **Empty means empty for the till, not for the storefront.** WooCommerce's term `count` is its
  catalog recount, which excludes products hidden from the catalog (`exclude-from-catalog`) — and
  POS-only products are exactly those. So a term is hidden only when `count === 0` **and** no
  product the till has synced carries it (one local query over the products collection for the
  zero-count ids, re-run as products arrive). A term that is empty for the till but not the shop
  cannot occur; one that is empty for the shop but holds POS-only products shows as soon as one of
  them is local. The settings row's count and its dimming use the same predicate.
- **A parent is visible when any descendant is.** WooCommerce's recount counts a hierarchical
  term's descendants into it (`_wc_term_recount`, `wc_change_term_counts`), so a shop-visible
  child never has an empty parent. The POS-only case can: an organising parent with no products
  of its own whose child holds only POS-only products has `count === 0` on both, and only the
  child is carried by a synced product. The parent stays visible — entering it includes its
  descendants, and hiding it would make the branch unreachable.
- **The tile's `N products` is the term's `count`, shown only when `count > 0`.** That number is
  the storefront's (catalog-visible products, descendants included); a term kept only because a
  synced product carries it shows no count rather than `0 products` over a non-empty level.
- "Descendants" is the transitive closure over `parent` in the local collection, computed by a pure
  function (`term-tree.ts`: `childrenOf`, `descendantsOf`, `orderTerms`, `displayTypeOf`) with unit
  tests. A term whose `parent` points at a missing term is treated as a root.
- The product set is written with the existing query-state actions (`setFilter` on the taxonomy
  field) — the translator's `taxonomy-many` entry takes an id set, so nothing in the engine or the
  browse-window seeder changes. The baseline filters (`status`, `stock_status`) and the sort setting
  apply as today, so a term shows what the All-products grid would show narrowed to the term.
- Brands read the existing `products/brands` collection, which the Brand pill already fills; the
  core `wc/v3/products/brands` route exists from WooCommerce 9.4.0, so on an older store (2.0
  supports 9.0+) the collection stays empty and the Brands row is dimmed `No brands yet`. Whether
  that sync failure surfaces anywhere is the Brand pill's existing behaviour, unchanged here.
- Display type (`display` field, categories and brands): `products` → products only;
  `subcategories` → child tiles only; `both`, `default`, empty or unknown → child tiles then
  products. Tags and shortcuts have no children and always show products.
- A shortcut tile's second line is `describeQuickFilter()` from `filter-bar-layout.ts`. Tapping it
  runs the same `apply-quick-filter` path as its chip, so the chip in the (untouched) filter bar
  lights up and a second tap on the chip still restores the baseline. The shortcut's products are
  whatever that filter yields; the crumb's detail is the query total.

## The stage, by state

### Root (`browseBy !== 'all'`)

Grid: the term set as tiles, **All products first**, in the source's order. No crumb at the root —
today's grid has none, and the All products tile says where you are. Tiles are the product tile's
size and columns (`gridColumns`), so `useFitPageSize` and the skeleton count stay valid.

- Term with an image: image area (same proportion as the product tile's), then name (500 weight)
  and `N products` muted — `N` is the term's `count`, omitted when it is 0 (above).
- Term without an image: the name centred on a `bg-muted` card, 18 px 600, `N products` under it
  (omitted likewise).
  **No per-term colour** — the mockup's tints are illustrative; design rule 7 keeps colour
  semantic. If Paul wants the tints they are a token decision for the design program, not this
  build.
- All products: `bg-muted` card, grid glyph, the words `All products`, no count.
- Shortcut: name, then its description line.

Table: the same set as rows on the products card — All products first; thumb (image, or the first
letter on `bg-muted`), name, `N products` / description under it, `›` at the end. No header row.

### Inside a term (depth ≥ 1)

Grid: the tapped tile **deals** (`DealStack`, unchanged): it walks to the first slot and is the way
back; what it holds is dealt out from under it; the grid it came from fades underneath and stays
mounted. What it holds, in order: child term tiles (per display type), then product tiles. The
crumb is the existing `Breadcrumb` over the dealt grid, exactly as the variations drill-in renders
it: `parents = [source label, …ancestor terms]`, `here = term name`, `detail = N products` from the
query total. Escape and the edge-swipe go back one level, as today.

Levels nest: a child term tile deals in turn, over the parent's dealt grid; a product tile deals
its variations (unchanged). The crumb grows one segment per level; tapping any ancestor returns to
it (every intermediate level is gathered in one pass, not one per level). Depth is whatever the
taxonomy has; nothing caps it, though the market never documents more than two or three.

Table: the tapped row **pushes** a pane (`PaneStack`, unchanged): the crumb above, then the rows —
child term rows (per display type), then product rows on a `DataTable` with the products columns.
Nested levels push again; a product row drills into variations as today.

All products (the first tile/row) is a term like any other: it deals/pushes the plain products
grid/table with crumb `<source label> › All products` (`Categories › All products`,
`Tags › All products`, …) and no taxonomy filter.

### Search and scanning

Unchanged rule, one more level: a drill-in remembers the search it opened under; typing or
scanning a different search returns to the products. In a browse mode that means: while
`state.search` is non-empty the stage shows the products grid/table (search spans the whole
catalogue, no taxonomy filter, no crumb — today's search result), and clearing the search returns
to the root term set. The scanner's add-to-cart on an exact barcode match is unchanged.

### Empty and trouble states

- A term whose product set is empty under the current filters shows the existing
  `nothing_matches_filters` state with its Clear filters action (which clears the taxonomy filter
  too, i.e. returns to the term root).
- A term set to `subcategories` whose children are all hidden shows its products instead (a folder
  with nothing in it is never shown).
- Storage outage, counting session and price-check banners render above the stage as today.

## Platforms and layout

One component, both layouts (`isPhoneWindow`): phones use the phone grid columns. Web, Electron,
iOS and Android. The deal and the pane are the existing motion contracts; **film the category deal
and its return on web and on the Pixel before calling it done** (design rule 6; the variations deal
needed three Android first-frame fixes in #2398).

## Test IDs

`browse-root` (the term set), `browse-term-<id>` (a term tile/row, the taxonomy term id),
`browse-shortcut-<id>` (a quick filter tile/row), `browse-all-products`, `browse-parent` (the
dealt parent tile in slot 0). The crumb keeps `products-breadcrumb` and `products-breadcrumb-back`.
Product tiles and rows keep their ids. The setting rows: `ui-settings-browse-by-<value>`.

## Strings

`pos_products.browse_by`, `.browse_all_products`, `.browse_categories`, `.browse_tags`,
`.browse_brands`, `.browse_shortcuts`; the counts `.n_products`, `.n_categories`, `.n_tags`,
`.n_brands`, `.n_quick_filters` each as an `_one`/`_other` pair (`{count} product` /
`{count} products` — the catalogue's plural contract, `catalog-plurals.test.ts`); `.no_categories_yet`,
`.no_tags_yet`, `.no_brands_yet`, `.no_shortcuts_yet`. Crumb root labels reuse the source labels.

## Testing

- **Unit:** `term-tree.ts` — ordering (menu_order then name; tags by name), hidden empties,
  children, descendants (deep, orphaned parent), display-type resolution; the setting's hydration
  (unknown → `'all'`); shortcut tile description.
- **Component (jest-expo):** root renders All products first and the ordered set; `subcategories`
  / `products` / `both` render the right mix; tapping a term writes the id set to the query
  state; the crumb's `parents` after two levels; a search clears the path and clearing the search
  shows the root term set; a source with no terms is dimmed in the settings form with its reason; the
  shortcuts source renders the stored quick filters in order and a tap applies one.
- **Gallery:** term tile (image / no image / All products / shortcut) and term row stories — the
  gallery check is required on `next`; label after the push run settles.
- **E2E (web, store-agnostic):** create a category and a product in it with the writer
  credentials (skip with reason when they are not configured), set Browse by → Categories in the
  settings dialog, assert `browse-term-<id>` at the root, tap it, assert the product's row/tile,
  assert `products-breadcrumb`, go back via `products-breadcrumb-back`, then type a search and
  assert the root is gone and the product is found. Clean up best-effort.
- **Native:** no fingerprint input changes (JS only); the Maestro baseline is unaffected because the
  default is `'all'`.

## Slices

1. `term-tree.ts` + the `browseBy` setting + settings form row + root tiles and rows (no drill).
2. Drill-in: nested deal (grid), nested pane (table), crumb, descendants filter, display type,
   search reset.
3. Shortcuts source.
4. Gallery stories, E2E spec, filmed deal on web and Pixel.

Each slice is a PR to `next` with the fresh-session review before opening, per the lane's gate.

## Not in this spec (follow-ups, each its own ticket)

- Pinned product tiles (a tile that adds to cart from the root) and a `products` condition on
  quick filters (hand-picked shortcut contents) — the rest of the curated-grid shape.
- Per-register hide list for terms ("choose which categories appear", the issue's nice-to-have).
- Filter-bar behaviour in a browse mode (whether the active taxonomy's pill or the quick-filter
  chips stay) — Paul: later.
- Per-term colour tints.
