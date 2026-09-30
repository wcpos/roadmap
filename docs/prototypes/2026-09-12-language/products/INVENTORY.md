<!-- Read-only inventory of the screen on monorepo `next` at f45a7b48a0, 2026-09-18, for roadmap#288: the feature floor the drawing must rehost. Source-only; nothing was run. -->
# PRODUCTS pane inventory

**Observed:** source and ledgers inspected; no builds, tests, runtime UI verification, or modifications.
**Important discrepancy:** the ticket describes a phone variation sheet, but this checkout implements the variation picker as a **popover on every platform**.

Path abbreviations below expand to:
- `P` = `packages/core/src/screens/main/pos/products`
- `C` = `packages/core/src/screens/main/components/product`
- `M` = `packages/core/src/screens/main`
- `U` = `packages/components/src`
- `E` = `packages/core/src/contexts/translations/locales/en/core.json`
- `R` = `apps/main/app/(app)/(drawer)/(pos)`

## 1. Structure

- **Register placement:** Products and Cart are tabs below 640 px; wider layouts use resizable columns. Products defaults to the left, occupying 60%; column minimum is 25%. Both small-screen panes remain mounted when switching tabs. `R/(tabs)/_layout.tsx:35`, `R/(columns)/index.tsx:44`, `M/pos/columns/pos-columns.tsx:61`, `M/contexts/ui-settings/initial-settings.json:2`.
- **Navigation:** Products is the register index, not the separate Pro-gated `/products` management screen. The tab labels are literal `"Products"` and `"Cart"`. `R/(tabs)/index.tsx:9`, `R/(tabs)/_layout.tsx:52`, `apps/main/app/(app)/(drawer)/products/index.tsx:4`.
- **Header, top to bottom:** search, camera toggle, view toggle, settings; extension filter-slot content; configurable filter bar; optional inline camera panel; conditional storage-outage banner. `P/index.tsx:285–330`.
- **Catalogue:** shared search/filter binding feeds either a virtualized table or fixed-column image grid. Initial query is published products, with `instock` unless out-of-stock display is enabled. `P/index.tsx:339–358`, `P/index.tsx:370–384`.
- **Table:** configurable columns; variable-product rows additionally expose attribute links and expandable nested variation rows. Each expanded block has attribute/search pills, collapse control, rows and its own count/sync footer. `P/cells/name.tsx:33`, `C/variable-product-row/index.tsx:112`, `C/variable-product-row/variations/filters.tsx:40`.
- **Grid:** square image above enabled text fields; incomplete rows retain tile widths using spacers. Variable tiles carry `"Variants"` and open the same attribute picker as the table’s chevron action. `P/grid/index.tsx:108–127`, `P/grid/variable-product-tile.tsx:150–255`.
- **Variation picker:** attribute controls, then a resolved stock badge and priced Add button, or syncing/unavailable feedback. Both callers request a right-side popover, maximum `w-80`; no phone-specific sheet branch exists here. `P/cells/variable-actions.tsx:43–54`, `P/grid/variable-product-tile.tsx:254`, `U/popover/index.tsx:18–65`.
- **Catalogue footer:** optional tax-basis hover card, loaded/total count and sync control. Grid also has an in-list loading/end indicator; table has an active-sync loader. `P/grid/index.tsx:134–172`, `M/components/data-table/footer.tsx:48`, `M/components/data-table/list-footer.tsx:10`.
- **Settings overlay:** opposite-side panel on larger screens; bottom-positioned dialog on small screens, within the POS portal. Filter customization is a routed modal; its editor stacks below the list on narrow layouts and beside it at `md`. Deleting a quick filter opens an alert dialog. `P/index.tsx:306`, `M/pos/contexts/overlay-side/overlay-side.tsx:10–21`, `P/filter-bar/modal.tsx:41–77`.
- **Other exits:** filter customization → `/(app)/(modals)/filter-bar`; tax diagnostics → `/(app)/(modals)/tax-rates`; outage status → `/health/database`. In wide layouts checkout/receipt can replace the Products panel. `P/filter-bar/pos-filter-bar.tsx:81`, `C/tax-based-on/display-current-tax-rates.tsx:133`, `P/storage-outage-banner.tsx:67`, `M/pos/columns/pos-columns.tsx:95–104`.

## 2. Every control and field

Defaults below are authored first-run values; persisted settings override them. `M/contexts/ui-settings/initial-settings.json:2–146`.

| Control | Kind | User label | Default | Constraint / condition | Action |
|---|---|---|---|---|---|
| Product search / clear | Input / clear button | “Search Products” | Empty | 250 ms debounce; scanner key handler attached | Shared table/grid search; external scan/reset cancels pending draft. `P/index.tsx:292`, `M/components/query-search-input.tsx:33–57` |
| Camera toggle | Icon button + tooltip | “Scan barcode with camera” / “Close barcode scanner” | Closed | No camera needed until opened | Opens/closes inline panel. `P/camera-scan-button.tsx:15` |
| View toggle | Icon button + tooltip | “Switch to table view” / “Switch to grid view” | Grid | Persists immediately | Changes presentation without replacing query state. `P/view-mode-toggle.tsx:11` |
| Product settings | Icon button | “Product Settings” | Closed | Responsive side/bottom overlay | Opens settings. `P/index.tsx:306` |
| Stock pill / remove | Select / removable pill | “In Stock”, “Out of Stock”, “On Backorder”; cleared: “Stock Status” | In Stock | Exact status, not generic sellability | Filters products and variation choices; × clears. `C/filter-bar/stock-status-pill.tsx:18` |
| Featured / sale pills | Buttons / removable pills | “Featured”, “On Sale” | Inactive | Main press sets true; remove clears | Filters current query. `C/filter-bar/featured-pill.tsx:11`, `C/filter-bar/on-sale-pill.tsx:11` |
| Category pill | Hierarchical multiselect | “Category”; selected name / first name + count | Empty | Lazy tree; excludes missing IDs | Selects multiple categories; × clears all. `C/filter-bar/category-pill.tsx:21–98` |
| Tag / brand pills | Searchable comboboxes | “Tag”, “Brand”; selected name or “ID: {id}” | Empty | Each ordinary picker selects one ID | Filters query; × clears. `C/filter-bar/tag-pill.tsx:22`, `C/filter-bar/brands-pill.tsx:22` |
| Quick-filter buttons | Toggle-like buttons | Merchant-authored name | None configured | Active only when complete resulting query matches | Replace filters/search/sort; active second press restores baseline. `P/filter-bar/quick-filter-button.tsx:25–62` |
| Customize filter bar | Icon pill / settings button | “Customise filter bar” | Available | Always appended to bar | Opens routed modal. `P/filter-bar/pos-filter-bar.tsx:74–85` |
| Simple-product add | Table plus button / whole grid tile | Icon-only / product content | Enabled locally | Cart hook decides whether mutation succeeds | Adds one, or increments a uniquely matching existing line. `P/cells/actions.tsx:19`, `P/grid/product-tile.tsx:62`, `M/pos/hooks/use-add-product.ts:118` |
| Variable-product picker | Table chevron / whole variable tile | Icon-only / product content + “Variants” | Closed | Shares live stock filter | Opens attribute picker. `P/cells/variable-actions.tsx:43`, `P/grid/variable-product-tile.tsx:151` |
| Table column headings | Sort buttons | Configured column label | Name ascending | Image, COGS and actions disable sorting | Changes shared persisted sort. `M/components/data-table/index.tsx:228`, `P/index.tsx:223` |
| Table taxonomy badges | Clickable badges | Merchant category/tag/brand names | Conditional | Name-column display options | Set corresponding ID-array filter. `C/categories.tsx`, `C/tags.tsx`, `C/brands.tsx`; behavior recorded at `C/LEDGER.md:12` |
| Variable image / expansion link | Pressable image / text link | “Expand” / “Collapse”, optional search-match suffix | Collapsed | Variable table row only | Expands/collapses nested variations. `C/attributes.tsx:104–175`, `C/variable-image.tsx` |
| Parent attribute links | Text links | Merchant attribute options | None selected | Variation attributes only | Expand row, clear child search, replace that attribute match. `C/attributes.tsx:83–94` |
| Expanded-row filters / collapse | Removable pills / icon button | Attribute name or “{name}: {option}”; search term | Empty, or seeded relational search | ≤10 options: Select; >10: searchable Combobox | Filter children, remove selections/search, collapse. `C/variation-select.tsx:54–125`, `C/variable-product-row/variations/filters.tsx:40–78` |
| Expanded variation add | Plus icon button | No text label supplied | Enabled locally | Requires parent row | Adds variation with sanitized attribute metadata. `P/cells/variation-actions.tsx:27–49` |
| Picker attributes | Segments / Select / Combobox | Attribute names/options; “Select an option” | No explicit choice; sole viable option auto-selected | Combined option text <15 characters: buttons; otherwise ≤10 options Select, >10 Combobox | Resolve published variation; disable incompatible stock choices. `P/cells/variations-popover/variations.tsx:128–155`, `select.tsx:53–119` |
| Picker add | Loading button | “Add to Cart: {formatted price}” | Absent until exactly one match | Unsellable + Avoid overselling disables; pending add blocks re-entry | Adds chosen variation; caller closes after awaited result. `P/cells/variations-popover/variations.tsx:103–121,219–228` |
| Sync / extended menu | Icon button / long-press menu | “Press to sync, long press for more options”; “Sync”; “Clear and Refresh” | Idle | Loading reflects active sync | Refresh; long press exposes local reset + refresh. Product reset also clears search/filters. `M/components/sync-button.tsx:27–59`, `M/components/data-table/footer.tsx:83` |
| Tax basis / diagnostics | Hover-card trigger / button | “Tax based on: …”; “View all tax rates” | Store-configured | Only when tax calculation enabled | Shows address/rate diagnostics; opens tax-rates modal. `C/tax-based-on/index.tsx:22–55` |
| Camera permission / close | Button / × icon | “Allow camera”; close icon unlabeled | Permission-dependent | Viewfinder mounts only after grant | Request permission; close granted-camera panel. Header toggle remains available before grant. `P/camera-scanner-panel.tsx:175–210` |
| Camera resize | Drag handle / accessibility adjustable | “Drag to resize the camera view” | 176 px | 96–480 px; accessibility steps 16 px | Persists finalized height, including cancelled drags. `P/camera-scanner-panel.tsx:29–36,93–115,228–249` |
| Storage recovery | Text buttons | “Reload the app”; “View status” | Hidden | Storage degraded only | Reload or report manual restart; open database status. `P/storage-outage-banner.tsx:35–69` |
| Out-of-stock display | Switch | “Show out-of-stock products” | Off | Boolean | Rebases live stock filter and reset baseline. `P/ui-settings-form.tsx:102`, `P/index.tsx:218` |
| Presentation / position | Select / segmented | “View Mode”: “Grid”, “Table”; “Panel position”: “Products left”, “Products right” | Grid / left | Cannot deselect position | Persists presentation/placement. `P/ui-settings-form.tsx:107–153` |
| Sort | Select / segmented | “Sort By”; “Sort Direction”; “Ascending”, “Descending” | Name / ascending | Name, SKU, Barcode, Type, Price, Date Created, Date Modified, Popularity, Stock Quantity, Stock Status, Menu Order; Type label discrepancy below | Changes catalogue order. `P/ui-settings-form.tsx:154–213`, `P/filter-bar/filter-bar-layout.ts:13–25` |
| Grid density | Integer slider | “Tile Size” + number | 4 columns | Grid only; 2–8, step 1 | Changes fixed column count. `P/ui-settings-form.tsx:215–235` |
| Grid fields | Nine switches | “Product Name”, “Price”, “Tax”, “On Sale”, “Categories”, “SKU”, “Barcode”, “Stock”, “Cost of Goods Sold” | Name/price on; others off | Grid only; tax/sale modify price rather than stand-alone content | Shows/hides tile details. `P/ui-settings-form.tsx:236–257` |
| Table columns / subfields | Sortable switches / collapsible options | “Columns”, “Display Options”; field labels | Image/name/price/actions on; other columns off | Table only; name has stock/categories on, SKU/barcode/attributes/meta off; tags/brands defaults ambiguous | Reorder/show columns and nested detail fields; price has sale on, tax off. `M/components/ui-settings/columns-form.tsx:79–142`, initial settings `:54–143` |
| Metadata keys | Multiselect combobox / removable chips | “Meta Data Keys”; `Add "{key}" as a custom key`; “Remove {name}” | Empty | Case-insensitive search; literal key identities; comma-separated storage | Discover/select/customize keys copied to cart; remove chips. `P/meta-data-keys-field.tsx:24–34,42–74,111–145` |
| Metadata help | Documentation link | “Learn more” | Available | Opens `https://docs.wcpos.com/pos/product-panel/meta-data-keys` | Explains metadata-key behavior. `P/ui-settings-form.tsx:61,263–279` |
| Settings footer | Buttons | “Close”; “Restore Default Settings” | Available | Changes already autosave; reset has no confirmation here | Dismiss or reset settings. `M/components/ui-settings/index.tsx:128–135` |
| Filter-bar list | Drag handles / switches / edit-delete icons | Built-in labels; merchant quick-filter label and summary | Six built-ins visible in stock/featured/sale/category/tag/brand order | Visibility/order autosave; quick filters use edit/delete, not visibility switches | Reorder/toggle; edit preset; request deletion. `P/filter-bar/filter-bar-list.tsx:45–95` |
| Add/delete quick filter | Buttons / alert dialog | “Add quick filter”; “Delete quick filter?”; “Cancel”; “Delete” | No editor selected | Confirmation required only for deletion | New draft; delete saved preset and close its editor. `P/filter-bar/filter-bar-list.tsx:96–123` |
| Quick-filter name / conditions | Input / repeatable field selectors | “Button name”; “e.g. Sale wines”; “Show products where”; “and”; “Add condition” | Empty name/conditions | One row per category/tag/brand/price/sale/featured/stock/type/search field; add disabled after all used | Build AND conditions; × removes row. `P/filter-bar/quick-filter-editor.tsx:349–444` |
| Condition values | Taxonomy pickers/chips, currency inputs, segments, selects, text | “Choose categories…”; “Min”, “Max”; “Yes”, “No”; stock/type labels; “Enter a search term…” | Taxonomies empty; price unbounded; booleans true; In Stock; Simple; search empty | Nonempty taxonomy/search; at least one finite price bound, min ≤ max; zero/cleared/unparsable means no bound; negatives retained | Edit condition; tag/brand selections accumulate uniquely and are removable. `P/filter-bar/quick-filter-editor.tsx:92–108,186–215,247–345`, `filter-bar-layout.ts:146–175` |
| Quick-filter ordering / save | Select, segments, buttons | “Order by”; “Default order”; “Ascending”, “Descending”; “Cancel”, “Save” | Default order | Named sort-only preset valid; invalid/incomplete draft disables Save, without reason text | Save trimmed name or discard draft; preview does not block zero matches. `P/filter-bar/quick-filter-editor.tsx:446–522` |
| Pane width / boundary reset | Drag divider / × icon | No text label supplied | Width 60%; fallback absent | Wide layout / render failure respectively | Persist width; retry failed subtree. `M/pos/columns/pos-columns.tsx:61–85`, `U/error-boundary/fallback.tsx:49–72` |

## 3. Every state

- **First run:** grid, four columns, name/price only, published in-stock products, name ascending; no bespoke onboarding message. Settings are above. `P/index.tsx:370–384`.
- **Initial suspension:** most local Suspense boundaries supply no fallback; production wrapper does not invent a loader. Tile-image suspension keeps tile text visible with an empty image source. `U/suspense/index.tsx:6`, `P/grid/tile-image.tsx:34–40`.
- **Searching versus empty:** both presentations show `"Searching…"` only for an unanswered active search; settled empty results show `"No products found"`. `P/grid/index.tsx:141–149`, `M/components/data-table/index.tsx:261–273`.
- **Loading more / end:** populated grid shows a loader while paging is pending, `"No more products"` only at a settled end; empty grid has neither extra footer. Table’s in-list loader follows sync activity and has no equivalent end label. `P/grid/grid-footer.tsx:30–45`, `M/components/data-table/list-footer.tsx:10`.
- **Unknown totals:** `"Showing {shown}"`; known totals: `"Showing {shown} of {total}"`. Product denominator is store census, not filtered-result count; variation denominator follows parent IDs where available. `M/components/data-table/footer.tsx:64`, `C/variable-product-row/variations/footer.tsx:56–70`.
- **Stale grid hits:** unreadable records are temporarily omitted, loaded count subtracts them, and a warning is logged; no dedicated inline warning. `P/grid/index.tsx:68–101`.
- **Images / unpriced products:** missing/failed grid images use local placeholder; variable table price renders nothing without a usable range, whereas grid falls back to parent price. No `"unpriced"` badge. `P/grid/tile-image.tsx:19`, `C/variable-price.tsx:39`, `P/grid/variable-product-tile.tsx:174–221`.
- **Long text:** grid name is two lines, categories one line; table names are not line-limited here; quick-filter summaries and tax-basis labels are one line. `P/grid/product-tile.tsx:78,121`, `P/cells/name.tsx:35`, `P/filter-bar/filter-bar-list.tsx:67`, `C/tax-based-on/index.tsx:35`.
- **Variation unresolved:** more than one match shows choices without Add; zero while active shows `"Syncing…"`; zero after activity stops shows `"Variant not available"`. `P/cells/variations-popover/variations.tsx:159–179`.
- **Variation disabled / stock:** options can be disabled without reason text. Resolved badge is `"{quantity} in stock"`, `"On Backorder"` or `"Out of Stock"`; unmanaged sellable stock has no badge. Add disables on unsellability only with Avoid overselling on. `P/cells/variations-popover/buttons.tsx:45`, `stock-status.tsx:64–95`, `variations.tsx:226`.
- **Variation adding:** button loading/re-entry guard lasts through awaited addition; no distinct `"Saving"`/`"Saved"` label. Expanded-row/simple add controls do not define their own loading state. `P/cells/variations-popover/variations.tsx:103–120,225`, `P/cells/actions.tsx:19`.
- **Expanded variation empty:** filter strip and count/sync footer remain; no explicit no-variations row is rendered by this table. `C/variable-product-row/variations/table.tsx:89–147`.
- **Settings saving / saved:** immediate `patchUI` writes and reset; no local pending, saved or write-error presentation. Quick-filter Save closes the editor immediately after starting persistence. `P/ui-settings-form.tsx:89–93`, `P/filter-bar/modal.tsx:31–37`.
- **Quick-filter draft states:** no selection → `"Select a quick filter to edit it, or add a new one."`; invalid → disabled Save without explanation; zero preview → `"No products match right now. You can still save this button."`; 200+ cap and five-name preview. `P/filter-bar/modal.tsx:61–71`, `quick-filter-preview.tsx:36–55`.
- **Camera permission:** ungranted/initial/denied permission uses `"WCPOS needs camera access to scan barcodes."` and `"Allow camera"`. No separate permanently-denied/settings-link branch. `P/camera-scanner-panel.tsx:140,175–186`.
- **Camera lifecycle/errors:** `"Starting camera…"`; scanning hides status text; unavailable → `"Camera unavailable — check that no other app is using it."`; decoder failure → `"Barcode decoding is failing — close the scanner and try again."` Five consecutive web decode failures trigger the latter; any successful attempt clears it. `P/camera-scanner-panel.tsx:142–155`, `P/scanner-viewfinder.web.tsx:152–173`.
- **Offline/bootstrap:** no standing engine-outage banner. Camera note is `"Offline — only products already on this device will scan."` or `"Sync is still starting — some products may not be found yet."`; local scans remain possible. `P/camera-scanner-panel.tsx:165–173`, `P/use-barcode.ts:210–224`.
- **Storage unavailable:** standing red banner, reload/status controls, camera storage note, and storage-specific scan toast; exact complete copy is in §4. Storage note outranks offline/bootstrap. `P/storage-outage-banner.tsx:49–71`, `P/camera-scanner-panel.tsx:167`.
- **Scan outcomes:** searching, added, add-failed, not-found, ambiguity, lookup failure, out-of-stock, offline unavailable, storage unavailable and too-short rejection have distinct feedback, transcribed in §4. Success lasts 2.5 s, alerts 6 s, searching at most 30 s; accepted camera detection flashes green for 350 ms, not necessarily successful sale. `P/use-scan-feedback.ts:13–19,100–204`, `P/camera-scanner-panel.tsx:124`.
- **Counting:** catalogue content dims to 40% opacity; header remains undimmed. This component supplies no counting reason string or pointer-event disable. `P/index.tsx:331–335`.
- **Render failure:** `"Something went wrong:"` plus actual exception message and × reset; narrow containers or very long messages use an icon/tooltip presentation. **Pro-locked:** no gate in this register pane; separate management Products route is gated. `U/error-boundary/fallback.tsx:31–72`, `apps/main/app/(app)/(drawer)/products/index.tsx:4`.
- **Hardware sources:** available/unavailable, connected/disconnected and per-device identity are exposed to scanner settings, not rendered as Products controls; connection failures are logged, with no hook-local translated prompt. `P/use-hid-scan.web.ts:191–270`, `P/use-serial-scan.web.ts:257–352`, `P/use-ble-scan.ios.ts:373–495`.

## 4. Every user-facing string

English below is verbatim from the bundled catalogue. `common.*` and `pos_products.*` are abbreviated as `common.` and `pos.` **only within this section**; `pos.` here means `pos_products`, not the separate `pos` namespace.

- **Header:** `common.search_products` = `"Search Products"`; `common.product_settings` = `"Product Settings"`; `pos.switch_to_grid_view` = `"Switch to grid view"`; `pos.switch_to_table_view` = `"Switch to table view"`. `E:430,464,891–892`.
- **Settings names:** `common.view_mode` = `"View Mode"`; `grid` = `"Grid"`; `table` = `"Table"`; `panel_position` = `"Panel position"`; `pos.products_left` = `"Products left"`; `products_right` = `"Products right"`. `E:340,408,514,556,865–866`.
- **Settings controls:** `common.show_out-of-stock_products` = `"Show out-of-stock products"`; `sort_by` = `"Sort By"`; `sort_direction` = `"Sort Direction"`; `ascending` = `"Ascending"`; `descending` = `"Descending"`; `tile_size` = `"Tile Size"`; `tile_fields` = `"Tile Fields"`; `columns` = `"Columns"`; `display_options` = `"Display Options"`. `E:240,279,305,311,492,497–498,528–529`.
- **Column/field labels:** `common.image` = `"Image"`; `product_name` = `"Product Name"`; `name` = `"Name"`; `stock` = `"Stock"`; `sku` = `"SKU"`; `barcode` = `"Barcode"`; `type` = `"Type"`; `cost_of_goods_sold` = `"Cost of Goods Sold"`; `cogs` = `"COGS"`; `price` = `"Price"`; `tax` = `"Tax"`; `actions` = `"Actions"`. `E:227,245,277,284,345,375,422,429,496,501,517,536`.
- **Detail labels:** `common.categories` = `"Categories"`; `tags` = `"Tags"`; `brands` = `"Brands"`; `attributes` = `"Attributes"`; `meta_data` = `"Meta Data"`; `meta_data_keys` = `"Meta Data Keys"`; label-map-only `regular_price_2` = `"Regular price"`. `E:241,253,257,373–374,439,516`.
- **Sort extras:** `common.date_created` = `"Date Created"`; `date_modified` = `"Date Modified"`; `popularity` = `"Popularity"`; `stock_status` = `"Stock Status"`; `menu_order` = `"Menu Order"`; `products.stock_quantity` = `"Stock Quantity"`. `E:298–299,371,417,502,904`.
- **Filter labels/options:** `common.category` = `"Category"`; `tag` = `"Tag"`; `brand` = `"Brand"`; `featured` = `"Featured"`; `on_sale` = `"On Sale"`; `in_stock` = `"In Stock"`; `out_of_stock` = `"Out of Stock"`; `on_backorder` = `"On Backorder"`; `id_2` = `"ID: {id}"`. `E:251,258,334,344,346,399–400,407,515`.
- **Taxonomy pickers:** `common.search_categories` = `"Search Categories"`; `search_tags` = `"Search Tags"`; `search_brands` = `"Search Brands"`; `no_category_found` = `"No category found"`; `no_tag_found` = `"No tag found"`; `no_brand_found` = `"No brand found"`; `select_tag` = `"Select Tag"`; `select_brand` = `"Select Brand"`; shared category-select placeholder `select_category` = `"Select Category"`. `E:377–378,393,456,458,466,472,474,483`.
- **Metadata:** `pos.add_custom_meta_key` = `"Add \"{key}\" as a custom key"`; `common.remove_2` = `"Remove {name}"`; `common.learn_more` = `"Learn more"`; `pos.meta_data_keys_description` = `"Product meta keys copied to the cart. Suggestions come from products synced to this device — you can also type a custom key."` `E:357,443,854,862`.
- **Settings/footer actions:** `common.close` = `"Close"`; `restore_default_settings` = `"Restore Default Settings"`; `sync` = `"Sync"`; `clear_and_refresh` = `"Clear and Refresh"`; `press_to_sync_long_press_for` = `"Press to sync, long press for more options"`. `E:273–274,421,446,513`.
- **Catalogue states/counts:** `common.searching` = `"Searching…"`; `no_products_found` = `"No products found"`; `no_results_found` = `"No results found"`; `loading` = `"Loading..."`; `showing_n` = `"Showing {shown}"`; `showing_of` = `"Showing {shown} of {total}"`; `pos.no_more_products` = `"No more products"`. `E:362,389,391,468,493–494,863`.
- **Variation controls/states:** `common.variants` = `"Variants"`; `expand` = `"Expand"`; `collapse` = `"Collapse"`; `search_variations` = `"Search Variations"`; `no_variation_found` = `"No variation found"`; `add_to_cart` = `"Add to Cart"`; `pos.select_an_option` = `"Select an option"`; `syncing` = `"Syncing…"`; `combination_unavailable` = `"Variant not available"`; `in_stock` = `"{quantity} in stock"`. `E:230,278,322,394,467,548,856,861,890,893`.
- **Relational search suffix:** `common.variation_found_for_term_one` = `"{count} variation found for \"{term}\""`; `_other` = `"{count} variations found for \"{term}\""`; appended to Expand/Collapse with literal `" - "`. `E:550–551`, `C/attributes.tsx:126–138`.
- **Filter customization:** `common.filter_bar` = `"Filter bar"`; `pos.customize_filter_bar` = `"Customise filter bar"`; `filter_bar_description` = `"Choose which filters appear on the bar and add quick filters that apply several conditions at once."`; `add_quick_filter` = `"Add quick filter"`. `E:335,855,857,860`.
- **Delete preset:** `pos.delete_quick_filter` = `"Delete quick filter?"`; `delete_quick_filter_description` = `"This removes the quick filter from the filter bar."`; `common.cancel` = `"Cancel"`; `delete` = `"Delete"`; `save` = `"Save"`. `E:255,304,452,858–859`.
- **Preset editor:** `pos.quick_filter_button_name` = `"Button name"`; `quick_filter_name_placeholder` = `"e.g. Sale wines"`; `quick_filter_conditions_heading` = `"Show products where"`; `quick_filter_and` = `"and"`; `quick_filter_add_condition` = `"Add condition"`; `quick_filter_editor_hint` = `"Select a quick filter to edit it, or add a new one."` `E:869–871,873,875,878`.
- **Preset values/order:** `pos.quick_filter_choose_categories` = `"Choose categories…"`; `quick_filter_min` = `"Min"`; `quick_filter_max` = `"Max"`; `quick_filter_search_placeholder` = `"Enter a search term…"`; `quick_filter_order_by` = `"Order by"`; `quick_filter_default_order` = `"Default order"`; `common.search` = `"Search"`; `yes` = `"Yes"`; `no` = `"No"`. `E:376,455,564,872,874,876–877,879,887`.
- **Product-type options:** `common.simple` = `"Simple"`; `variable` = `"Variable"`; `grouped` = `"Grouped"`; `external` = `"External"`. `E:325,341,469,537`.
- **Preset summaries:** `pos.quick_filter_selected` = `"{label}: {count} selected"`; `quick_filter_not_on_sale` = `"Not on sale"`; `quick_filter_not_featured` = `"Not featured"`; `quick_filter_search` = `"Search: {term}"`; `quick_filter_sort` = `"Sort: {field} {direction}"`; direction is literal `"↑"`/`"↓"`; components join with `" · "`. `E:867–868,886,888–889`, `P/filter-bar/filter-bar-layout.ts:251–259`.
- **Price summaries:** `pos.quick_filter_price_range` = `"Price {min}–{max}"`; `quick_filter_price_min` = `"Price {min}+"`; `quick_filter_price_max` = `"Price up to {max}"`; bounds use store currency. `E:880–882`, `P/filter-bar/filter-bar-layout.ts:238–248`.
- **Preview:** `pos.quick_filter_preview_count` = `"{n} products match on this device"`; `quick_filter_preview_count_capped` = `"200+ products match on this device"`; `quick_filter_preview_empty` = `"No products match right now. You can still save this button."` `E:883–885`.
- **Camera controls:** `pos.camera_scan_open` = `"Scan barcode with camera"`; `camera_scan_close` = `"Close barcode scanner"`; `camera_permission_prompt` = `"WCPOS needs camera access to scan barcodes."`; `camera_permission_grant` = `"Allow camera"`; `camera_resize_handle` = `"Drag to resize the camera view"`. `E:1510–1515`.
- **Camera status:** `pos.camera_starting` = `"Starting camera…"`; `camera_unavailable` = `"Camera unavailable — check that no other app is using it."`; `camera_decoder_error` = `"Barcode decoding is failing — close the scanner and try again."` `E:1513,1516–1517`.
- **Camera readiness:** `pos.camera_scan_storage_unavailable` = `"Local database unavailable — reload the app to restore scanning."`; `camera_scan_offline` = `"Offline — only products already on this device will scan."`; `camera_scan_engine_not_ready` = `"Sync is still starting — some products may not be found yet."` `E:1518–1520`.
- **Too-short scan:** `common.barcode_scanned` = `"Barcode scanned: {barcode}"`; `barcode_must_be_at_least_characters` = `"Barcode must be at least {minLength} characters long"`. `E:246,248`, `M/hooks/barcodes/too-short-feedback.ts:13–18`.
- **Scan progress/success:** `common.barcode_searching_online` = `"Searching store…"`; `pos.scan_added` = `"Added to cart"`; `scan_add_failed` = `"Couldn’t add to cart"`; descriptions are scanned code or product name. `E:249,1482,1495`, `P/use-scan-feedback.ts:100–126`.
- **Scan missing/ambiguous:** `pos.scan_not_found` = `"Barcode not found"`; `scan_not_found_description` = `"{code} — not in this store, locally or online"`; `scan_several_matches` = `"Several matches"`; description uses `common.product_found_locally_one` = `"{count} product found locally"` / `_other` = `"{count} products found locally"`, then `" — {code}"`. `E:426–427,1483–1485`.
- **Scan failure/stock:** `pos.scan_lookup_failed` = `"Lookup failed"`; `scan_lookup_failed_description` = `"{code} — Store didn’t respond — check your connection and scan again"`; `out_of_stock` = `"{name} out of stock"`, with scanned code as description. `E:864,1486–1487`.
- **Scan unavailable:** `pos.scan_unavailable` = `"Scanning unavailable"`; `scan_unavailable_description` = `"{code} — Not on this device, and the store can’t be searched while offline"`; `scan_storage_unavailable_description` = `"{code} — Local database unavailable — reload the app before taking more sales"`; `scan_outage_view_status` = `"View status"`. `E:1488–1490,1494`.
- **Storage banner:** `pos.scan_storage_outage_banner` = `"Local database unavailable — scanning, checkout, saving and voiding are blocked until the app is reloaded."`; `scan_storage_outage_reload` = `"Reload the app"`; `scan_storage_outage_restart_manually` = `"This build can't reload itself — close the app completely and open it again."` `E:1491–1493`.
- **Manual cart feedback:** actual keys `common.added_to_cart` = `"{name} added to cart"` and `pos.error_adding_to_cart` = `"Error adding {name} to cart"`. `E:231,730`; callers `M/pos/hooks/use-add-product.ts:152–164`, `use-add-variation.ts:104–117`.
- **Tax footer:** `common.tax_based_on` = `"Tax based on"`; `shop_base_address` = `"Shop base address"`; `customer_billing_address` = `"Customer billing address"`; `customer_shipping_address` = `"Customer shipping address"`, composed with `": "`. `E:292,294,491,518`.
- **Tax diagnostics:** `common.calculate_tax_based_on` = `"Calculate tax based on"`; `matched_rates` = `"Matched rates"`; `country` = `"Country"`; `state` = `"State"`; `city` = `"City"`; `postcode` = `"Postcode"`; `name` = `"Name"`; `rate` = `"Rate"`; `class` = `"Class"`; `no_rates_matched` = `"No rates matched"`; `view_all_tax_rates` = `"View all tax rates"`. Headings append `":"`; absent address fields display `"-"`. `E:254,259–260,285,369,375,390,420,436,499,555`.
- **Literal/dynamic display:** `"Something went wrong:"` and exception text; tax annotation `${inclOrExcl} ${formattedTax} tax` (`incl`/`excl`); range hyphens; tile `"SKU: …"`, `"Barcode: …"`, `"Stock: …"`, `"COGS: …"`; metadata `"key: value"`; chip `"✕"`; merchant names, attributes, categories, tags, brands, presets and rate names. `U/error-boundary/fallback.tsx:44`, `C/price-with-tax.tsx:51,71`, `P/grid/product-tile.tsx:110–132`, `P/cells/meta-data.tsx:44–47`, `P/meta-data-keys-field.tsx:127`.

## 5. Learned behaviour

All ledgers within both requested trees were read. Below, `#n` means the ledger’s stable authored entry, not its physical line. Pure implementation/data-layer entries and entries concerning unrelated management forms are omitted.

### Products pane — `P/LEDGER.md:11–29`
- `P/LEDGER.md #1`: [catalogue] Table/grid share relational product-and-variation search and barcode fallback.
- `P/LEDGER.md #2`: [catalogue] Initial browsing excludes non-published products.
- `P/LEDGER.md #3`: [ordering] Invalid stored sort falls back to authored name ascending.
- `P/LEDGER.md #4`: [ordering] Legacy price sort normalizes; Type sort survives reseeding.
- `P/LEDGER.md #5`: [filters] Out-of-stock setting changes both live filter and reset baseline without remounting.
- `P/LEDGER.md #6`: [expanded rows] Live Stock Status changes update already-rendered variations.
- `P/LEDGER.md #7`: [table] Screen owns expansion; table must not reset it.
- `P/LEDGER.md #8`: [table] Collapse must continue working in minified builds.
- `P/LEDGER.md #10`: [catalogue] Measured first page fills grid plus one row/table plus two, clamped 10–50.
- `P/LEDGER.md #11`: [catalogue] Hidden zero-size layouts do not replace the last usable page-size measurement.
- `P/LEDGER.md #12`: [settings] Reset updates visible form/column structure, not merely stored values.
- `P/LEDGER.md #13`: [settings] Larger-screen settings cover the opposite pane, keeping products visible.
- `P/LEDGER.md #15`: [metadata] Suggestions remain sorted, distinct and current as local products/database change.
- `P/LEDGER.md #16`: [metadata] Custom keys remain selectable and persist in comma-separated form.
- `P/LEDGER.md #17`: [metadata] Key labels remain literal rather than HTML-decoded.
- `P/LEDGER.md #18`: [outage] Only storage loss gets a standing banner, with reload/status/manual-restart feedback.
- `P/LEDGER.md #19`: [catalogue] Counting dims products without unmounting the browser.

### Table cells — `P/cells/LEDGER.md:11–15`
- `P/cells/LEDGER.md #1`: [names] Decode product and variation display names.
- `P/cells/LEDGER.md #2`: [variation rows] Compose names from their own attributes, avoiding collapsed parent titles.
- `P/cells/LEDGER.md #3`: [add] Malformed variation attributes must not break manual addition.
- `P/cells/LEDGER.md #4`: [metadata] Show configured keys only and decode rendered content consistently with cart.
- `P/cells/LEDGER.md #5`: [picker] Carry Stock Status across the native portal boundary.

### Attribute picker — `P/cells/variations-popover/LEDGER.md:11–23`
- `P/cells/variations-popover/LEDGER.md #1`: [picker] Isolated parent-scoped, published-only choices.
- `P/cells/variations-popover/LEDGER.md #2`: [opening] Refresh once without hiding resident children.
- `P/cells/variations-popover/LEDGER.md #3`: [loading] Empty results retry after 3/10 seconds; unsettled refresh advances after 15 seconds.
- `P/cells/variations-popover/LEDGER.md #4`: [loading] Unknown count stays retryable; arrivals cancel unnecessary retries.
- `P/cells/variations-popover/LEDGER.md #5`: [matching] Wildcard “Any option” attributes match directly without expanding combinations.
- `P/cells/variations-popover/LEDGER.md #6`: [matching] Distinguish custom ID-zero attributes by name; tolerate unnamed global IDs.
- `P/cells/variations-popover/LEDGER.md #7`: [selection] Auto-select sole viable option, but keep wildcard-compatible alternatives.
- `P/cells/variations-popover/LEDGER.md #8`: [availability] Disable against exact Stock Status and the remaining partial selection.
- `P/cells/variations-popover/LEDGER.md #9`: [controls] Buttons/Select/searchable Combobox adapt to option lengths; decode labels, not identities.
- `P/cells/variations-popover/LEDGER.md #10`: [empty] Distinguish syncing from unavailable combination.
- `P/cells/variations-popover/LEDGER.md #11`: [stock] Show quantity/backorder/out-of-stock; invent no unmanaged quantity.
- `P/cells/variations-popover/LEDGER.md #12`: [stock/add] Resolve child-versus-parent stock owner; overselling setting governs Add refusal.
- `P/cells/variations-popover/LEDGER.md #13`: [add] Loading state prevents duplicate presses during pending write.

### Filter customization — `P/filter-bar/LEDGER.md:11–22`
- `P/filter-bar/LEDGER.md #1`: [bar] Persist mixed built-in/quick-filter order and visibility; retain legacy presets.
- `P/filter-bar/LEDGER.md #2`: [bar] Drop malformed entries/duplicate IDs while restoring missing built-ins.
- `P/filter-bar/LEDGER.md #3`: [preset] Replace current query; pressing active preset again restores baseline.
- `P/filter-bar/LEDGER.md #4`: [preset] Active state compares the full query, including sort and taxonomy sets.
- `P/filter-bar/LEDGER.md #5`: [editor] One condition per field; named sort-only presets valid; incomplete drafts disable Save.
- `P/filter-bar/LEDGER.md #6`: [price] Zero/cleared/unparsable means no bound; preserve finite negatives.
- `P/filter-bar/LEDGER.md #7`: [sort] Default-order choice must remain usable in web Select.
- `P/filter-bar/LEDGER.md #8`: [preview] Device-only count capped at 200+, five names, non-blocking zero warning.
- `P/filter-bar/LEDGER.md #9`: [preview] Match POS publication, stock and default-sort baseline.
- `P/filter-bar/LEDGER.md #10`: [preview] Debounce 250 ms; suspended preview must eventually resolve.
- `P/filter-bar/LEDGER.md #11`: [list] Visibility/reorder save immediately; deletion confirms and closes deleted editor.
- `P/filter-bar/LEDGER.md #12`: [summary] Price descriptions use merchant currency.

### Grid — `P/grid/LEDGER.md:11–21`
- `P/grid/LEDGER.md #1`: [layout] Fixed-width virtual rows; incomplete rows use spacers.
- `P/grid/LEDGER.md #2`: [sync] Skip unreadable stale records rather than crashing; log omissions.
- `P/grid/LEDGER.md #3`: [footer] Loaded count reflects rendered products; denominator remains store census.
- `P/grid/LEDGER.md #4`: [paging] One shared paging verdict prevents premature terminal states.
- `P/grid/LEDGER.md #5`: [footer] Empty rendered grid has no loading/end footer; paging still considers original hits.
- `P/grid/LEDGER.md #6`: [search] Pending answer says Searching, not No products found.
- `P/grid/LEDGER.md #7`: [tiles] Image-only mode removes text padding; variable tiles retain equal widths.
- `P/grid/LEDGER.md #8`: [price] Variable ranges, equal-endpoint collapse, sale strike-through, parent fallback and omitted subranges.
- `P/grid/LEDGER.md #9`: [COGS] Read `total_value`; retain zero cost.
- `P/grid/LEDGER.md #10`: [images] Independent loading boundary and offline-capable placeholder.
- `P/grid/LEDGER.md #11`: [picker] Preserve native stock-filter context and product identity.

### Camera — `P/camera-scanner-panel.LEDGER.md:11–22`
- `P/camera-scanner-panel.LEDGER.md #1`: [panel] Inline, permission-first scanning leaves selling surfaces usable.
- `P/camera-scanner-panel.LEDGER.md #2`: [scan] Cooldown/check digits suppress repeated frames; reopening resets deduplication.
- `P/camera-scanner-panel.LEDGER.md #3`: [feedback] Too-short codes produce shared warning.
- `P/camera-scanner-panel.LEDGER.md #4`: [routing] Camera must not emit into another app section.
- `P/camera-scanner-panel.LEDGER.md #5`: [camera] Web/Electron rear-facing 1280×720 ideal capture; native Expo scanning.
- `P/camera-scanner-panel.LEDGER.md #6`: [offline] Bundled decoder avoids CDN dependency.
- `P/camera-scanner-panel.LEDGER.md #7`: [recognition] Platform symbology names must produce identical retail handling.
- `P/camera-scanner-panel.LEDGER.md #8`: [closing] Stopped decoder cannot deliver late scans.
- `P/camera-scanner-panel.LEDGER.md #9`: [error] Five consecutive failures show error; successful empty decode also clears it.
- `P/camera-scanner-panel.LEDGER.md #10`: [feedback] Accepted detection flashes 350 ms; readiness prioritizes storage loss.
- `P/camera-scanner-panel.LEDGER.md #11`: [resize] Persist 96–480 px and stable consecutive/cancelled gestures; accessible increments.
- `P/camera-scanner-panel.LEDGER.md #12`: [resize] Slim 20 px band retains 44 px touch target.

### Scan resolution/feedback — `P/use-barcode.LEDGER.md:11–22`, `P/use-scan-feedback.LEDGER.md:11–17`
- `P/use-barcode.LEDGER.md #1`: [routing] Scans belong to the whole POS section, including Cart/checkout; mounting caveat in §7.
- `P/use-barcode.LEDGER.md #2`: [lookup] Local miss checks store, refreshes matched records, then checks locally again.
- `P/use-barcode.LEDGER.md #3`: [ambiguity] Hydrate at most ten candidates; publication filtering may leave one sellable match.
- `P/use-barcode.LEDGER.md #4`: [recognition] Preserve symbology, especially UPC-E versus unrelated eight-digit codes.
- `P/use-barcode.LEDGER.md #5`: [waiting] Equivalent online probes share a ten-second deadline.
- `P/use-barcode.LEDGER.md #6`: [offline] Reject online escalation only after local miss, not merely during startup.
- `P/use-barcode.LEDGER.md #7`: [stock] Hidden-out-of-stock scan gate uses sellability, permitting valid backorders.
- `P/use-barcode.LEDGER.md #8`: [variation] Require parent; fetch if absent; reject unpublished parent.
- `P/use-barcode.LEDGER.md #9`: [variation] Sanitized explicit metadata prevents failed scans/duplicate attributes.
- `P/use-barcode.LEDGER.md #10`: [search] Only newest concurrent scan may alter shared search.
- `P/use-barcode.LEDGER.md #11`: [completion] Success awaits cart write; one toast; clear pending search; online add failure terminates progress.
- `P/use-barcode.LEDGER.md #12`: [errors] Storage loss gets its own terminal outcome; ordinary misses remain warnings.
- `P/use-scan-feedback.LEDGER.md #1`: [toast] One toast identity per scan, updated in place.
- `P/use-scan-feedback.LEDGER.md #2`: [toast] Searching expires after 30 seconds.
- `P/use-scan-feedback.LEDGER.md #3`: [sound] Opt-in outcome sounds; silent searching.
- `P/use-scan-feedback.LEDGER.md #4`: [sound] Honor settings at playback time, including mid-lookup disabling.
- `P/use-scan-feedback.LEDGER.md #5`: [sound] Classic/checkout/soft themes align across platforms; volume bounded.
- `P/use-scan-feedback.LEDGER.md #6`: [haptic] Failure vibration may operate without failure tone; master switch silences both.
- `P/use-scan-feedback.LEDGER.md #7`: [sound] Web waits for resumed audio; native rewinds; audio failures never block scanning.

### Hardware sources — source-ledger entries at lines 11 onward
- `P/use-hid-scan.web.LEDGER.md #1`: [hardware] Capability-gated HID-POS only, not keyboard-wedge equivalence. `:11`.
- `P/use-hid-scan.web.LEDGER.md #2`: [recognition] Report-ID-zero devices must deliver usable scans. `:12`.
- `P/use-hid-scan.web.LEDGER.md #3`: [connection] Replacement/unmount must not leave duplicate scan delivery. `:13`.
- `P/use-hid-scan.web.LEDGER.md #4`: [reconnect] Saved granted devices reopen without another chooser. `:14`.
- `P/use-hid-scan.web.LEDGER.md #5`: [device identity] Actual live profile reported; missing device name remains empty. `:15`.
- `P/use-serial-scan.web.LEDGER.md #1`: [recognition] Prefix/suffix framing, deduplication and current minimum length apply to streamed chunks. `:11`.
- `P/use-serial-scan.web.LEDGER.md #2`: [disconnect] Release pending reader so port actually closes. `:12`.
- `P/use-serial-scan.web.LEDGER.md #3`: [replacement] Only one transport reads; new attachment resets framing/cooldown. `:13`.
- `P/use-serial-scan.web.LEDGER.md #4`: [status] Old stream termination cannot mark replacement disconnected. `:14`.
- `P/use-serial-scan.web.LEDGER.md #5`: [chooser] Include standard SPP and saved vendor services. `:15`.
- `P/use-serial-scan.web.LEDGER.md #6`: [reconnect] Exactly one saved/granted match reconnects; ambiguity requires chooser. `:16`.
- `P/use-serial-scan.web.LEDGER.md #7`: [identity] Normalize USB/Bluetooth identities; avoid duplicate registrations; preserve empty names. `:17`.
- `P/use-ble-scan.ios.LEDGER.md #1`: [availability] iOS-only, supported native module and three Netum service families. `:11`.
- `P/use-ble-scan.ios.LEDGER.md #2`: [recognition] First allowlisted scanner; split UTF-8 notifications reconstruct one deduplicated barcode. `:12`.
- `P/use-ble-scan.ios.LEDGER.md #3`: [waiting] Bluetooth readiness bounded at ten seconds, discovery at thirty. `:13`.
- `P/use-ble-scan.ios.LEDGER.md #4`: [disconnect] Teardown settles pending connect gestures. `:14`.
- `P/use-ble-scan.ios.LEDGER.md #5`: [replacement] Release stale peripherals so they become discoverable again. `:15`.
- `P/use-ble-scan.ios.LEDGER.md #6`: [reconnect] Exactly one recognized saved profile; store change restarts selection. `:16`.
- `P/use-ble-scan.ios.LEDGER.md #7`: [status] Monitor failure disconnects/unregisters actual live device. `:17`.

### Shared product components — `C/LEDGER.md:11–60`
- `C/LEDGER.md #1`: [cells] Displayed fields remain live as records change.
- `C/LEDGER.md #2`: [filters] Taxonomy badges and six pills modify the same query.
- `C/LEDGER.md #3`: [category] Hierarchical multiselect with lazy tree loading.
- `C/LEDGER.md #4`: [category] Missing-ID categories do not become unusable options.
- `C/LEDGER.md #6`: [category] Selected labels resolve independently; loading/fallback and first-name-plus-count remain intelligible.
- `C/LEDGER.md #7`: [category] Suspended tree must resolve rather than recreate its resource forever.
- `C/LEDGER.md #10`: [stock pill] Clearing must actually remove the previous Select value.
- `C/LEDGER.md #11`: [taxonomy] Search pickers remain accessible beyond their first 50 results.
- `C/LEDGER.md #12`: [labels] Decode attributes, taxonomy labels and grouped-product names.
- `C/LEDGER.md #13`: [variation] Decode labels without changing option identities.
- `C/LEDGER.md #15`: [pills] Active/inactive icon treatment remains distinct.
- `C/LEDGER.md #16`: [variation] ≤10 options use Select; longer lists use searchable Combobox.
- `C/LEDGER.md #17`: [grouped names] Show all referenced group members, not arbitrary first-page products.
- `C/LEDGER.md #18`: [expanded rows] Isolated child filters; collapse teardown clears search/attributes.
- `C/LEDGER.md #19`: [expanded rows] Merchant `menu_order` ascending, not alphabetical ordering.
- `C/LEDGER.md #20`: [opening] One non-blocking refresh per expansion.
- `C/LEDGER.md #21`: [children] Parent variation-list changes update displayed children.
- `C/LEDGER.md #22`: [search] Expanding relational hit reveals children using parent search and clears stale attributes.
- `C/LEDGER.md #23`: [attribute links] Expand, clear search, replace only matching attribute identity.
- `C/LEDGER.md #24`: [collapse] Images, links and collapse controls preserve production-safe expansion updates.
- `C/LEDGER.md #26`: [columns] Visibility changes immediately affect variable parent and child rows.
- `C/LEDGER.md #27`: [native expansion] Measure content through non-scrolling ScrollView rather than zero-height children.
- `C/LEDGER.md #28`: [motion] Mount for expansion; retain content until collapse animation finishes.
- `C/LEDGER.md #29`: [loading] Image suspension does not hide unrelated parent-row cells.
- `C/LEDGER.md #30`: [add] Child rows preserve actual parent Row so Add works.
- `C/LEDGER.md #31`: [count] Reactive parent totals, authoritative zero, rendered-count floor; unknown total has no denominator.
- `C/LEDGER.md #32`: [refresh] Clear-and-refresh resets locally, never deletes merchant variations remotely.
- `C/LEDGER.md #34`: [stock] Self-managed stock follows finite quantity/backorders; other stock follows server status.
- `C/LEDGER.md #35`: [stock] Only explicit `yes`/`notify` permits backorders.
- `C/LEDGER.md #36`: [stock] Local quantity edits update built-in statuses immediately; custom statuses remain server-owned.
- `C/LEDGER.md #37`: [variation lists] Live Stock Status governs; clearing admits all statuses and follows quantity edits.
- `C/LEDGER.md #38`: [names] Sanitized nonempty attributes compose child name; served name is fallback.
- `C/LEDGER.md #39`: [images] Prefer usable `images[0]`, then singular `image`; placeholder on failure.
- `C/LEDGER.md #41`: [images] Offline inline SVG placeholder also works with Android’s base64 requirement.
- `C/LEDGER.md #42`: [price] Accept typed variable-price metadata and legacy JSON.
- `C/LEDGER.md #43`: [price] Optional subranges/no-price state remain valid; absent display range renders nothing.
- `C/LEDGER.md #44`: [price] Quiet missing metadata only when all served parent prices are blank.
- `C/LEDGER.md #45`: [diagnostics] Variable-price faults identify product, rather than merging unrelated failures.
- `C/LEDGER.md #46`: [tax] Tax-basis display still follows customer address despite split contexts.
- `C/LEDGER.md #47`: [tax] Diagnostic rate names decode merchant HTML entities.
- `C/LEDGER.md #48`: [tax/footer] Tax-basis text stays one line in normal and no-rate states.
- **No ledger line:** grid names truncate to two lines; category text to one; tile stock shows any non-null quantity, unlike table’s managed/finite check. `P/grid/product-tile.tsx:78,121–128`, `P/cells/stock-quantity.tsx:40`.
- **No ledger line:** current table variable-price cell lacks grid’s parent-price fallback and sale-range strike-through. `C/variable-price.tsx:35–71`, `P/grid/variable-product-tile.tsx:174–221`.
- **No ledger line:** variation caller closes after any fulfilled add promise, including a returned `false`; picker button ignores deselection’s empty value. `P/cells/variable-actions.tsx:29–34`, `P/cells/variations-popover/buttons.tsx:31–35`.
- **No ledger line:** catalogue settings have no save acknowledgment; extension filter-slot contents are runtime-defined and cannot be exhaustively transcribed from this host. `P/ui-settings-form.tsx:93`, `P/index.tsx:315`.

## 6. Platform differences

- **Responsive, not OS-specific:** below 640 px uses Products/Cart tabs and bottom settings; 640–1023 is `md`, ≥1024 `lg`. Grid column preference remains 2–8 even on phones; no automatic one/two-column override exists in the grid. `M/contexts/../..` is not needed: exact breakpoint file is `packages/core/src/contexts/theme/use-breakpoint.ts:7–14`; grid `P/grid/index.tsx:49,82`.
- **Variation picker:** table and grid both use shared Popover on web, Electron, iOS and Android; native adds full-screen overlay geometry for touch/accessibility, not a bottom sheet. Select/Combobox are nested choice overlays. `U/popover/index.tsx:31–61`, `U/select/index.tsx:174–201`.
- **Camera:** native uses back-facing Expo Camera with EAN-13/EAN-8/UPC-A/UPC-E/Code128/QR; web/Electron uses owned media stream, locally bundled ZXing decoder and mapped symbology names. `P/scanner-viewfinder.tsx:43–49`, `P/use-camera-scan.ts:15`, `P/scanner-viewfinder.web.tsx:21–40`, `P/camera-decoder.web.ts`.
- **Hardware:** WebHID/Web Serial are capability-gated Chromium/Electron sources; native base files are inert. BLE implementation is iOS-only; Android/web/Electron base BLE returns unavailable. Pairing/connection controls live outside Products. `P/use-hid-scan.ts:3–28`, `P/use-serial-scan.ts:3–28`, `P/use-ble-scan.ts:18–25`.
- **Feedback:** web/Electron synthesize tones and have no failure haptic; native uses WAV assets plus optional error haptic. Sound defaults off; theme fallback classic, volume default .15, clamped .05–.4. `P/play-scan-sound.web.ts:69–107`, `P/play-scan-sound.ts:26–78`, `P/scan-sound-themes.ts:8–15`, `P/use-scan-feedback.ts:49–56`.
- **Native expansion/recovery:** variation expansion uses measured ScrollView content and 500 ms height animation. Reload may require manually quitting/reopening a native build; web/Electron can follow their reload implementation. `C/variable-product-row/index.tsx:30,83–94,136–145`, `P/storage-outage-banner.tsx:30–42`.

## 7. Open questions

- **Phone sheet requirement:** is this a requested future behavior or supplied by another branch? Neither picker caller nor shared Popover implements it. `P/cells/variable-actions.tsx:52`, `P/grid/variable-product-tile.tsx:254`, `U/popover/index.tsx:18`.
- **Publication parity:** picker explicitly filters published variations; expanded-row provider supplies no publication filter, and default variation query state contains only `attributeMatches`. Whether upstream parent IDs guarantee publication is not established here. `P/cells/variations-popover/index.tsx:175`, `C/variable-product-row/context.tsx:45–49`, `packages/core/src/query/query-state-store.tsx:17`.
- **Sort label:** `SORT_FIELD_VALUES` includes `type`, but Product Settings’ `sortLabels` omits it. Selected fallback can show raw `"type"`; option label is undefined. Quick-filter editor does supply `"Type"`. `P/ui-settings-form.tsx:159–185`, `P/filter-bar/filter-bar-layout.ts:17,195`.
- **Table defaults:** tags/brands nested entries contain `"hide": false`, not the `"show"` boolean read by UI/schema; intended first-run visibility is ambiguous. `M/contexts/ui-settings/initial-settings.json:82–88`, `M/components/ui-settings/columns-form.tsx:25–26`.
- **Picker completion:** should a refused add keep the picker open? Both callers ignore the add hook’s boolean result before closing; button deselection is also ignored despite the parent comment describing removal. `P/cells/variable-actions.tsx:31–34`, `P/grid/variable-product-tile.tsx:142–145`, `P/cells/variations-popover/variations.tsx:83`, `buttons.tsx:31`.
- **Checkout scanning:** ledger promises section-wide scans, but wide checkout replaces the Products component that owns the subscription. Continued scanning in that replacement state is **unverified**, not established by the route check alone. `P/use-barcode.ts:89–93,508`, `M/pos/columns/pos-columns.tsx:95–104`.
- **Missing-parent scan:** absent parent ID or still-missing parent sets search and returns without a terminal scan toast; searching expires by timeout if previously shown. Is this the intended feedback? `P/use-barcode.ts:428–431,455–457`, `P/use-scan-feedback.ts:19`.
- **Runtime-only content:** extension strings, actual catalogue content, OS permission/device-chooser wording and downstream mutation-error details cannot be enumerated from these folders. Runtime appearance/accessibility, performance and compatibility were **not evaluated**.

### Behavior changes / regressions

None introduced: this was read-only. Existing discrepancies and presentation differences are recorded above, not asserted as runtime-tested regressions.