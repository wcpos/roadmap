# Products in the register — roadmap#288

[Open products](index.html). These are register states, not the Products management page.
The dark strip is not part of the drawing.

Top to bottom: the existing search and toolbar, scan feedback directly beneath the search
field, the existing filter bar and its Customise control, an inline resizable camera band,
the standing storage-outage banner when needed, the tile catalogue, and the loaded-count
footer. A variable tile opens attribute buttons, a six-option select, and a searchable
thirteen-option Print combobox with Any option selected. The resolved stock is a dot and a
word, then the priced Add. On a phone this body is a bottom sheet; elsewhere it is anchored
to the tile. The filter editor opens over the cart, with the built-in filter list, a quick
filter's name, one condition per field, ordering, preview, Save and confirmed Delete.

## States and captures to judge

New register states: `var-popover`, `var-sheet`, `var-syncing`, `var-unavailable`,
`camera-permission`, `camera-scanning`, `camera-unavailable`, `scan-searching`,
`scan-notfound`, `scan-ambiguous`, `scan-outofstock`, `filter-editor`,
`filter-editor-empty`, `outage`.

Captures belong to `../pos-register/shoot.js`, not a separate products shoot. After the final
combined shoot, judge these files under `../pos-register/screens/`:

- `tablet-light-regular-var-popover.jpg`, `phone-light-regular-var-sheet.jpg`
- `tablet-light-regular-var-syncing.jpg`, `tablet-light-regular-var-unavailable.jpg`
- `phone-light-regular-camera-permission.jpg`, `tablet-light-regular-camera-scanning.jpg`,
  `tablet-light-regular-camera-unavailable.jpg`
- `tablet-light-regular-scan-searching.jpg`, `tablet-light-regular-scan-notfound.jpg`,
  `phone-light-regular-scan-ambiguous.jpg`, `tablet-light-regular-scan-outofstock.jpg`
- `desktop-light-regular-filter-editor.jpg`, `phone-light-regular-filter-editor-empty.jpg`
- `tablet-light-regular-outage.jpg`, then the dark and compact twins.

These are pending capture names, not captures produced in this products-only run. The full
register shoot is deliberately deferred. Its new assertion taps the variable tile, chooses
Natural, presses Add and checks the settled cart line without a toast.

## Decisions for Paul

**All decided by Paul on 2026-09-18 ("as you recommend"); [#288](https://github.com/wcpos/roadmap/issues/288) is closed.**

1. **Sheet on the phone, popover elsewhere** (drawn), or popover everywhere (today).
   The sheet gives touch choices room and leaves one familiar exit; the popover keeps the
   tile beside its options and avoids a platform split. **Pick: sheet on the phone.**
   The strip's Picker switch compared both; the popover-everywhere home was deleted when #290
   ruled the sheet keyed by phone width. `var-sheet` is the phone, `var-popover` the tablet. Buttons up to four options, select for five to twelve, combobox above
   twelve follow the brief's proposed thresholds, not today's text-length/ten-option rule.
   **Decided (Paul, 2026-09-18): sheet on the phone, popover elsewhere; the Picker switch stayed for #290's split rule, which ruled sheet-by-width on 2026-09-18 and retired the switch.**
2. **Scan feedback under the search field** (drawn), or today's scan toast.
   One place joins the code to the outcome without a message covering products; the toast
   is easier to notice away from search. **Pick: under search**, with the settled cart line
   for success and a chooser sheet only when the code has several matches. No success toast.
   **Decided (Paul, 2026-09-18): as drawn, the pick.**
3. **The camera band inline** (drawn, preserving today's placement), or a separate scanner
   screen. Inline keeps the catalogue usable while scanning and the height adjustable; a
   separate screen gives the viewfinder more room but hides selling. **Pick: inline.**
   Allow camera draws Starting camera… then scanning. The dark strip's Camera demo controls
   draw offline, storage and starting-sync notes and a 350 ms detection flash.
   **Decided (Paul, 2026-09-18): as drawn, the pick.**
4. **Filter editor as a side panel** (drawn), or today's routed modal.
   Over the cart keeps the products it configures in sight; the modal offers more editor
   width. **Pick: side panel**, full height on the phone, with the list and editor in one
   scroll. Visibility/order changes are immediate; Save closes the quick-filter editor;
   zero matches do not block Save. Only Delete asks for confirmation.
   **Decided (Paul, 2026-09-18): as drawn, the pick.**


## Behavior changes / regressions

- Proposed changes, not app changes: phone picker sheet, scan feedback placement, side-panel
  filter editor, and the brief's attribute-control thresholds. Existing table variation
  navigation and the signed-off checkout drawing are not replaced.
- Picker focus starts on Colour; choosing a colour resolves the fixture's size and focuses
  Add. Escape returns to the tile. Adding uses the register's existing line-settle behavior;
  the phone returns to Cart unless its camera band is open. Camera resize also supports the
  arrow keys; built-in filter drag handles support arrow-key ordering.
- Docs only: camera permission, decoding, lookup, storage recovery and preview counts are
  simulated. The extra catalogue tiles make the default loaded count 24 of a fixture census
  of 312. No more products is a strip-controlled settled-end example. Nothing persists to
  the store; extension filters, OS permission UI and hardware scanners are not reproduced.
- The preview illustrates matching and zero-match copy, not a real query engine. Taxonomy
  condition inputs provide fixture suggestions; remote taxonomy browsing is not simulated.
- No broad compatibility or performance claim is made; §2–§4 and §6 are outside this run.
