# POS product grid: the Poster tile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three grid tile components of the register's products stage (product, variation, term) with one `PosterTile` whose picture is the whole square and whose words sit on a card-colour scrim at its foot, as decided in the spec.

**Architecture:** `PosterTile` lives in `@wcpos/components` and knows nothing about products: it takes a picture (image slot, tint, mosaic), two marks, five word slots and three flags (`out`, `stacked`, `lifted`), forwards its `Pressable` ref for the Deal and keeps the `m-1` frame so column maths and the Deal's measurements do not move. The products screen's `v2/grid/*` and `v2/browse/term-tile.tsx` become thin mappers from records and `gridFields` onto those slots. The stacked layers of a variable product are drawn inside the tile's frame and, on the parent's copy in slot 0, their opacity follows a shared value `DealCell` animates on the Deal's own beats.

**Tech Stack:** React Native + Expo, Uniwind classes (semantic tokens in `apps/main/global.css`), Reanimated (the existing `DealStack` / `DealCell`), `react-native-svg` (already a dependency) for the native scrim gradient, CSS `linear-gradient` for web, jest + `@testing-library/react` (jsdom) in `@wcpos/core` and `@wcpos/components`.

## Global Constraints

- **Spec is the contract:** `wcpos/roadmap` `docs/specs/2026-10-12-pos-product-tile-poster-spec.md` (merged, #424 + #425). Visual reference: `docs/prototypes/2026-10-12-pos-product-tile-poster/index.html` beside it (open locally; the Fields switches drive every frame). Where this plan and the spec differ, the spec wins, except the one recorded deviation in Task 2 (`picture.kind = 'slot'`).
- Lane `next`. Worktree `/Users/kilbot/Projects/monorepo-v2-worktrees/pos-poster-tile`, branch `feat/pos-poster-tile` (created off `origin/next`, `.env` copied, installed). Always use absolute paths or `-C <worktree>`; relative paths are refused by a guard.
- Design rules: monorepo `.claude/rules/design.mdc` (read it first). Semantic tokens only (`bg-card`, `text-foreground`, `bg-warning`, the new `bg-tile-tint-N`), never a hex in a component; only `transform` and `opacity` animate; a press shows within 100 ms; no kind labels ("Variable", "Category") anywhere on a tile; no box-within-box.
- **Polish phase on `next` (owner ruling 2026-10-08):** cheap unit tests of slot mapping and logic only; no E2E runs, no screenshot runs, no device pass, no gallery baseline chasing beyond re-registering the `browse-tiles` stories. Do not add tests pinned to the look.
- **The Deal's integration is judged in the running app**, never on a board: start Metro web from the worktree (`apps/main`, without `CI=1`) and watch a variable product deal out and gather back; film frames only if asked.
- Tests: ALWAYS `--maxWorkers=2`, one suite at a time, from the worktree root: `pnpm --filter @wcpos/core test --maxWorkers=2 <path>` and `pnpm --filter @wcpos/components test --maxWorkers=2 <path>` (no `--` separator: pnpm forwards it and jest reads the flag as a filename). `pnpm typecheck --force` and `pnpm lint` before the branch is called done.
- Component tests in `@wcpos/core` are jsdom + `@testing-library/react` with the `react-native` / `@wcpos/components/*` mocks the neighbouring `v2/*.test.tsx` use (`grid/product-tile.test.tsx`, `browse/term-tile.test.tsx`, `deal-stack.test.tsx`). Copy their mock blocks; do not invent a harness.
- Strings go through `useT()` with keys in `packages/core/src/contexts/translations/locales/en/core.json`, placed alphabetically among their neighbours in the `common.` / `pos_products.` blocks. Never print a raw key or English in a component.
- Budget: about **900 changed non-test source lines** across the branch (the three old tiles are mostly deleted lines; deletions are authorised in full). If a task is about to blow its own budget below, stop and say why rather than splitting it into more files.
- Commits: `feat(pos): …` / `test(pos): …` / `feat(components): …`, imperative, no trailing period; one commit per task. **Do not push and do not open a PR**; the orchestrator does that after review.

---

## File structure

| File | Responsibility |
|---|---|
| `apps/main/global.css` (modify) | Six tint tokens `--tile-tint-0 … -5` in the light and dark `@variant` blocks plus their `--color-tile-tint-N` theme aliases, so `bg-tile-tint-N` classes exist. |
| `packages/components/src/poster-tile/tint-of.ts` (new) | `tintOf(key: number \| string): 0\|1\|2\|3\|4\|5` — the one place the tint rule lives. |
| `packages/components/src/poster-tile/tint-of.test.ts` (new) | Its unit test. |
| `packages/components/src/poster-tile/scrim.tsx` (new) | `Scrim` (native): measures its height, draws the 13-stop `react-native-svg` gradient behind its children. Exports `SCRIM_REACH`, `SCRIM_STRENGTH`, `SCRIM_STOPS`. |
| `packages/components/src/poster-tile/scrim.web.tsx` (new) | `Scrim` (web): the same stops as one CSS `linear-gradient` over `var(--card)`. |
| `packages/components/src/poster-tile/index.tsx` (new) | `PosterTile` and `PosterTileProps`: frame, square, picture, marks, scrim with word slots, stack layers, `out`, `lifted`, `grow`, forwarded ref. |
| `packages/components/src/poster-tile/poster-tile.test.tsx` (new) | Slot combinations, no scrim when empty, `out`, `stacked`, tint. |
| `packages/components/src/poster-tile/LEDGER.md` (new) | The component's ledger entry (every component dir has one). |
| `packages/components/package.json` (modify) | `"./poster-tile": "./src/poster-tile/index.tsx"` export. |
| `packages/core/src/contexts/translations/locales/en/core.json` (modify) | New keys (Task 3). |
| `packages/core/src/screens/main/pos/products/grid/tile-image.tsx` (modify) | `onFailed` callback so a tile can fall back to a tint. |
| `packages/core/src/screens/main/pos/products/v2/grid/product-tile.tsx` (rewrite) | Product and drill variable product → `PosterTile`. Exports `GridFields` (unchanged shape) and the shared `useTileWords` helpers if useful. |
| `packages/core/src/screens/main/pos/products/v2/grid/variation-tile.tsx` (rewrite) | `VariationTile`, `ParentTile` (stacked, Deal-driven layer fade), `VariationPlaceholder`. |
| `packages/core/src/screens/main/pos/products/v2/deal-stack.tsx` (modify, small) | `DealCell` animates a `cards` shared value for slot 0 and provides it through `useDealCards()`. |
| `packages/core/src/screens/main/pos/products/v2/browse/term-tile.tsx` (rewrite) | `TermTile`, `ParentTermTile`, `termTestId` → `PosterTile`; `WORDS_PADDING` / `WordsBody` deleted; `BADGE` kept only if another file imports it (grep). |
| `packages/core/src/screens/main/pos/products/v2/browse/gallery.tsx` (modify) | Same story ids on the new tile. |
| Tests touched | `grid/product-tile.test.tsx`, `browse/term-tile.test.tsx`, `variations-grid.test.tsx`, `deal-stack.test.tsx` (one new test), `rows/in-cart-count.test.tsx` untouched. |
| `packages/core/src/screens/main/pos/products/v2/LEDGER.md` (modify) | Entries for `pos/products/grid` and `pos/products/v2/browse` citing the spec. |

---

### Task 1: Tint tokens and `tintOf`

**Files:**
- Modify: `apps/main/global.css` (the `@theme` alias block near line 35–90 and both `@variant light` / `@variant dark` blocks)
- Create: `packages/components/src/poster-tile/tint-of.ts`, `tint-of.test.ts`

**Interfaces:**
- Produces: `tintOf(key: number | string): 0 | 1 | 2 | 3 | 4 | 5`; Tailwind classes `bg-tile-tint-0 … bg-tile-tint-5`.

- [ ] **Step 1: Failing test** — `tintOf(6) === 0`, `tintOf(7) === 1`, `tintOf(-1)` is in range (use `((n % 6) + 6) % 6`), `tintOf('Hoodie') === tintOf('Hoodie')`, a string's value is the UTF-16 code-unit sum `% 6` (assert one computed example), `tintOf('')` is `0`.
- [ ] **Step 2: Run** `pnpm --filter @wcpos/components test --maxWorkers=2 src/poster-tile/tint-of.test.ts` → fails (module missing).
- [ ] **Step 3: Implement** `tint-of.ts` (pure, no React, a doc comment citing the spec § No picture).
- [ ] **Step 4: Tokens.** In the light block: `--tile-tint-0: oklch(0.94 0.04 250)` … hues 250, 160, 40, 300, 90, 200 (lightness 0.93–0.95, chroma 0.035–0.045). In the dark block: `oklch(0.32 0.04 h)` (0.31–0.34, 0.03–0.05). In the `@theme` alias block: `--color-tile-tint-0: var(--tile-tint-0)` … 5. Check how `--color-warning` is aliased there and copy the shape exactly. Verify the class compiles by using `bg-tile-tint-3` in Task 2's component and grepping the generated CSS if Uniwind emits one, or by running the test suite that renders it.
- [ ] **Step 5: Run the test → passes. Commit** `feat(components): tint tokens and tintOf for the Poster tile`.

### Task 2: `PosterTile` in `@wcpos/components`

**Files:**
- Create: `packages/components/src/poster-tile/index.tsx`, `scrim.tsx`, `scrim.web.tsx`, `poster-tile.test.tsx`, `LEDGER.md`
- Modify: `packages/components/package.json` (export)

**Interfaces (Produces):**

```ts
export type PosterPicture =
  | { kind: 'image'; source: ImageSource; still?: boolean; recyclingKey?: string; onDisplay?: () => void; onError?: () => void }
  | { kind: 'slot'; children: React.ReactNode }   // DEVIATION from the spec (recorded): the caller renders the square's
                                                   // picture itself (TileImage: Suspense + attachment hook + probes + useCopyPicture).
  | { kind: 'tint'; tint: 0 | 1 | 2 | 3 | 4 | 5 }
  | { kind: 'mosaic'; sources: ImageSource[] };
export type PosterMark =
  | { kind: 'count'; value: number; low?: boolean } | { kind: 'backorder' } | { kind: 'folder' }
  | { kind: 'glyph'; name: IconName };   // CLARIFICATION of the spec: All products (`grid`) and a shortcut (`sliders`) keep their glyph, in the folder's 24 pt circle
export type PosterTileProps = {
  picture: PosterPicture;
  mark?: PosterMark;
  markLabel?: string;            // accessibility label for the mark (e.g. "3 left", "Backorder")
  markTestID?: string;           // `product-tile-stock-{id}` / `variation-tile-stock-{id}`
  corner?: React.ReactNode;      // InCartCount, always mounted by the caller
  back?: boolean;                // the parent in slot 0: 24 pt card circle, chevronLeft, top-right
  backTestID?: string;           // `browse-parent-badge`
  title?: React.ReactNode; money?: React.ReactNode; sub?: React.ReactNode; facts?: React.ReactNode;
  out?: boolean;
  stacked?: boolean;
  stackStyle?: StyleProp<ViewStyle>;   // an Animated style for the two layers (the Deal's fade); plain Views otherwise
  grow?: boolean;                // `grow` vs `flex-1`, exactly as today's ProductTile
  lifted?: boolean;              // opacity 0 on the Pressable, as today's LIFTED
  onPress: () => void;
  accessibilityLabel: string;
  testID: string;
  squareTestID?: string;         // `${testID}-${id}` on the square, as today
  children?: never;
};
export const PosterTile: React.ForwardRefExoticComponent<PosterTileProps & React.RefAttributes<ViewInstance>>;
export const SCRIM_REACH = 48; export const SCRIM_STRENGTH = 0.85; export const SCRIM_STOPS: readonly [at: number, of: number][];
```

Behaviour (from the spec § The tile, § Geometry, § The scrim, § No picture, § Marks):

- Frame: `Pressable` with `m-1 ${grow ? 'grow' : 'flex-1'} rounded-lg border border-border` and **no `overflow-hidden`** (the stack layers are outside the square but inside the frame); `style={lifted ? { opacity: 0 } : undefined}`; `accessibilityRole="button"`. The square inside: `aspect-square overflow-hidden rounded-lg bg-card` with `squareTestID`. Press feedback: the picture layer gets `active:opacity-90` (dims to about 92 %), never a background change.
- Stack (`stacked`): two absolutely positioned `View`s **behind** the square, `bg-card border border-border rounded-lg`, offset `{ top: 3, left: 3, right: -3, bottom: -3 }` and `{ 6, 6, -6, -6 }`, the far one at opacity .6; wrapped in one `Animated.View` that takes `stackStyle` (import `Animated` from `react-native-reanimated`; `@wcpos/components` already depends on it). z-order: layers first in the tree, square after, so the square paints on top without zIndex.
- Picture: `image` → `@wcpos/components/image` `Image` filling the square (`h-full w-full`, `transition: 0` when `still`); `slot` → children as given; `tint` → the square has `bg-tile-tint-${tint}` and no scrim; `mosaic` → a 2×2 grid of up to four `Image`s (one source: full; two: halves; three: one left half + two stacked right; four: quarters). `out` → `opacity-40` on the picture layer (greyed; use opacity, no filter).
- Mark top-left (`top-2 left-2`): `count` → 22 pt-high pill `bg-card border border-border` with the `box` icon (check `@wcpos/components/icon` registry for the glyph names; `boxOpen`/`cube`/`box` — pick what exists) and the number in `text-xs font-bold tabular-nums`; `low` → `bg-warning text-warning-foreground`, no border. `backorder` → a pill with the `clock` glyph and `markLabel` text in `text-muted-foreground`. `folder` → 24 pt card circle with the `folder` glyph (icon registry) in `text-muted-foreground`; `glyph` → the same circle with the named icon. `markTestID` goes on the mark's `View`; `accessibilityLabel={markLabel}`.
- Corner top-right: `corner` rendered absolutely at `top-2 right-2`; `back` → the 24 pt card circle with `chevronLeft`, at `top-2 right-2` too (the parent never has a cart count in the corner slot; if both are given, `back` sits under `corner`).
- Scrim: rendered only when at least one of `title`, `money`, `sub`, `facts` is non-null **and** the picture is not a tint. Absolutely positioned `left-0 right-0 bottom-0`, padding `pt-[48px] px-[10px] pb-[10px]`, column, `gap-[2px]`, `text-foreground`. Its background is the gradient (`Scrim` component). On a tint the same words block is rendered with `pt-[10px]` and no gradient. Word slots render in order title, money, sub, facts; the callers style their contents (the component only places them).
- `Scrim` native: `onLayout` → height `h`; `<Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1 ${h}">` → `<Defs><LinearGradient id x1=0 y1=0 x2=0 y2=1>` with one `<Stop offset={(at * SCRIM_REACH) / h} stopColor={card} stopOpacity={of * SCRIM_STRENGTH} />` per table row plus `offset=1, stopOpacity=SCRIM_STRENGTH`; `<Rect width=1 height={h} fill="url(#id)">`. `card` is the resolved card colour: `useCSSVariable('--card')` from `uniwind` (deal-stack.tsx uses it this way). Use a unique gradient id per instance (`React.useId()`). Until `h` is known render nothing behind the words.
- `Scrim` web: `style={{ backgroundImage: 'linear-gradient(to bottom, ' + stops + ')' }}` with each stop `color-mix(in srgb, var(--card) ${Math.round(of * 85)}%, transparent) ${at * 48}px` and a final `color-mix(in srgb, var(--card) 85%, transparent) 48px` + `… 100%`. If React Native Web drops `backgroundImage`, fall back to a `dataSet`-free plain class `poster-scrim` defined in `apps/main/global.css` with the same gradient (one place; say which you used in the commit message). Verify in the browser during Task 6.
- `SCRIM_STOPS` is the spec's 13-row table as `[at, of]` pairs, exported from `scrim.tsx` and re-exported identically from `scrim.web.tsx` (one constants module `scrim-stops.ts` both import is cleaner; do that).

- [ ] **Step 1: Failing tests** in `poster-tile.test.tsx` (jsdom; mock `react-native-svg` to plain elements and `uniwind`'s `useCSSVariable` to `'#fff'`; mock `react-native-reanimated` as `deal-stack.test.tsx` does): (a) no scrim element (`testID="poster-scrim"`) when every word slot is empty; (b) a scrim when `title` is given over an image; (c) no scrim and class `bg-tile-tint-4` when `picture.kind === 'tint'` with words; (d) `out` puts the dim class on the picture layer; (e) `stacked` renders two layers (`testID="poster-stack"` wrapper with two children); not stacked renders none; (f) `mark.kind === 'count'` renders the number and `markTestID`; `low` adds `bg-warning`; (g) `back` renders `backTestID`; (h) `onPress` fires on click; (i) the forwarded ref reaches the `Pressable` (ref.current is non-null after render).
- [ ] **Step 2: Run → fail.** `pnpm --filter @wcpos/components test --maxWorkers=2 src/poster-tile/poster-tile.test.tsx`
- [ ] **Step 3: Implement** `scrim-stops.ts`, `scrim.tsx`, `scrim.web.tsx`, `index.tsx`; add the package export; write `LEDGER.md` (date, what, spec link, the `slot` deviation and why).
- [ ] **Step 4: Run → pass. `pnpm typecheck --force`. Commit** `feat(components): PosterTile with the card-colour scrim, tints, marks and stack`.

### Task 3: Strings

**Files:** `packages/core/src/contexts/translations/locales/en/core.json`

- [ ] Add, alphabetically in their blocks: `"common.backorder": "Backorder"`, `"common.cost": "Cost"`, `"common.sale": "Sale"`, `"pos_products.n_left": "{count} left"`, `"pos_products.n_options": "{count} options"`, `"pos_products.n_products": "{count} products"`, `"pos_products.sold_out": "Sold out"`. Check each does not already exist (`n_left` and `n_products` are used today but missing). Run the translations/i18n unit test if one guards the file (`grep -rl core.json packages/core/src --include=*.test.*`).
- [ ] Commit `feat(pos): strings for the Poster tile`.

### Task 4: Product, variable, variation, parent and placeholder on the Poster

**Files:**
- Modify: `packages/core/src/screens/main/pos/products/grid/tile-image.tsx` — add `onFailed?: () => void`, called from `TileImageInner` when `!uri || error` (once per uri; `useEffect` on `[uri, error]`); keep the placeholder image for the legacy grid callers.
- Rewrite: `v2/grid/product-tile.tsx`, `v2/grid/variation-tile.tsx`
- Modify: `v2/deal-stack.tsx` (`DealCell`: the `cards` shared value + `useDealCards`)
- Tests: `v2/grid/product-tile.test.tsx` (update), `v2/variations-grid.test.tsx` (update only what the DOM change breaks), `v2/deal-stack.test.tsx` (one new test)

**Interfaces:**
- Consumes: `PosterTile`, `tintOf` from `@wcpos/components/poster-tile`; strings from Task 3.
- Produces: `ProductTile` and `VariationTile`/`ParentTile`/`VariationPlaceholder` with the same props and testIDs as today; `GridFields` unchanged; `useDealCards(): SharedValue<number> | null` exported from `deal-stack.tsx`.

Mapping (spec § Words, slot by slot — follow the table exactly):

- **Shared helpers** in `product-tile.tsx` (exported for `variation-tile.tsx`): `useMoneyRow({ price, regularPrice, onSale, taxStatus, taxClass, gridFields, from?, out })` → `ReactNode | null`: when `out` → `<Text className="font-bold">{t('pos_products.sold_out')}</Text>` (no Sale pill, no struck price); else one `View className="flex-row flex-wrap items-baseline gap-x-1.5"` with optional `from` (`text-foreground/70 text-xs`), `PriceWithTax` for the price (`font-bold`), then when `gridFields.on_sale && onSale`: the Sale pill (`bg-foreground text-card rounded px-1 text-[10px] font-bold uppercase` with `t('common.sale')`) and the struck regular price (`PriceWithTax strikethrough`, `text-foreground/70`); `taxDisplay` `'text'` when `gridFields.tax`. `useFactsRow({ sku, barcode, categories?, cost, gridFields })` → `ReactNode | null`: `View className="flex-row flex-wrap gap-x-2.5 gap-y-px max-h-[46px] overflow-hidden"`; children in order Cost (`t('common.cost')` label `text-foreground/65` + formatted `total_value`), SKU (`t('common.sku')` + value, `numberOfLines={1}`), barcode (value, `numberOfLines={1}`), categories (own line `w-full numberOfLines={1} decodeHtml`); each only when its field is on and the value exists; returns `null` when nothing. All at `text-xs`. `stockMark({ gridFields, manageStock, stockQuantity, lowStockAmount, status })` → `{ mark, label } | null` per the spec's mark row (count when managed and `> 0`, `low` when `status === 'lowstock'` or `≤ low_stock_amount`; `backorder` when `displayStockStatus` is `onbackorder`; `null` otherwise or when `!gridFields.stock_quantity`).
- **`ProductTile`**: keep the props, the ref, `useRenderProbe`, `useProductCount`, `useAddProduct`, `getVariablePrices` for the drill case (`from` when `min !== max`). `picture`: `{ kind: 'slot', children: <TileImage record={record} onFailed={() => setFailed(true)} /> }` until `failed`, then `{ kind: 'tint', tint: tintOf(firstCategoryId ?? name) }` (first `categories[0].id`; when there is no category pass `name`). `out = displayStockStatus(payload) === 'outofstock'`. `stacked = !!onDrill`. `sub` for drill: `t('pos_products.n_options', { count: variations.length })` when `> 0`. `title`: `gridFields.name && <Text className="font-bold leading-tight" numberOfLines={2} decodeHtml>{name}</Text>`. `corner`: the always-mounted `InCartCount` exactly as today (the chevronRight hint on a variable tile with zero in cart goes: the stack now says "tap to deal"). `testID` / `squareTestID` as today. `accessibilityLabel = name`.
- **`VariationTile`**: `title` = parent name small (`text-xs text-foreground/70`, `numberOfLines={1}`) over a `flex-row flex-wrap gap-1` of chips (`bg-foreground/12 rounded px-1.5 py-px text-xs font-bold`) one per `sanitizeVariationAttributesRead(attributes)[].option`; no usable attributes → one chip of `resolveVariationName(payload)`. Picture: the variation's own image through the existing `VariationImage` (keep it, as a `slot`), falling back to `tintOf(parent first category id ?? parent name)` on error (add the same `onFailed` to `VariationImageInner`). Money/facts/mark/out as product (no categories fact). `useVariationCount` and `addVariation` unchanged. `testID="variation-tile"`, square `variation-tile-${id}`, mark `variation-tile-stock-${id}`.
- **`ParentTile`**: `PosterTile` with `picture` = slot `<TileImage record still />`, `back`, `stacked`, `stackStyle` from `useDealCards()` (below), `title` = name, `sub` = `n_options`, `grow`, `accessibilityLabel = t('common.back')`, `testID="variations-parent-tile"`. No money, no facts, no mark (spec table: the parent shows name + options only).
- **`VariationPlaceholder`**: unchanged.
- **`DealCell` and `useDealCards`** (deal-stack.tsx): add `const cards = useSharedValue(1)`; in the existing direction effect, for `parent` only, after `travel.value = …`: when `dealt` → `cards.value = withDelay(FIRST_FRAME_DELAY, withTiming(0, { duration: BEATS.newTiles.duration, easing: EASE, ...REDUCE }))`; when gathering → the last tile home is index 1, whose turn is `count - 2`, so `const span = Math.min(count - 2, BEATS.oldTiles.cap - 1) * BEATS.oldTiles.step` and `cards.value = withDelay(FIRST_FRAME_DELAY + span, withTiming(1, { duration: BEATS.oldTiles.duration, easing: EASE, ...REDUCE }))` (lands with the last gathering tile). A cell that mounts `atRest` starts at `cards = 0`? No: slot 0 at rest in a dealt grid shows the parent **without** its cards (they are on the table), so initialise `useSharedValue(atRest ? 0 : 1)`. Provide it through `const DealCardsContext = React.createContext<SharedValue<number> | null>(null)` wrapped around the parent's children next to `CopyPictureContext.Provider`; export `useDealCards = () => React.useContext(DealCardsContext)`. In `ParentTile`: `const cards = useDealCards(); const stackStyle = useAnimatedStyle(() => ({ opacity: cards ? Math.min(1, Math.max(0, cards.value)) : 1 }))`. Only `opacity` animates. Nothing else in `deal-stack.tsx` changes.

- [ ] **Step 1: Update failing tests.** `product-tile.test.tsx`: keep every existing assertion that is about behaviour (press adds, drill passes the ref, lifted → opacity 0, count badge, stock pill id and number, low → `bg-warning`), delete the ones about the old StatusBadge / "In Stock" / `COGS:` text, and add: "Sold out" replaces the price when `outofstock`; the Sale pill and struck price only when `on_sale` and `gridFields.on_sale`; facts order Cost → SKU → barcode → categories; `n_options` on a drill tile; `stacked` layers present on a drill tile and absent on a simple one; a failed image renders the tint class (`TileImage` mocked to call `onFailed`). `deal-stack.test.tsx`: one new test that `useDealCards()` inside slot 0 reads `0` after the deal is dealt and `1` when gathered (the reanimated mock makes `withTiming`/`withDelay` return their final values — check how the existing test mocks them and mirror it).
- [ ] **Step 2: Run** `pnpm --filter @wcpos/core test --maxWorkers=2 src/screens/main/pos/products/v2/grid/product-tile.test.tsx` → fails.
- [ ] **Step 3: Implement** the four files above.
- [ ] **Step 4: Run** that suite, then `variations-grid.test.tsx`, then `deal-stack.test.tsx` (one at a time) → all pass. `pnpm typecheck --force`.
- [ ] **Step 5: Commit** `feat(pos): product, variation and parent tiles on the Poster; the stack fades with the Deal`.

### Task 5: Term tiles on the Poster, gallery

**Files:**
- Rewrite: `v2/browse/term-tile.tsx`
- Modify: `v2/browse/gallery.tsx` (imports only; same story ids), `v2/browse/term-grid.tsx` only if an import (`BADGE`, `WORDS_PADDING`) breaks — grep first.
- Tests: `v2/browse/term-tile.test.tsx` (update)

**Mapping:**
- `term` with `imageSrc`: picture = `{ kind: 'image', source: { uri }, still, recyclingKey: termKey(term), onDisplay: painted, onError: → failed }` where `painted = useCopyPicture()` must still be called (the copy waits for the picture; on error call it too). `failed` → tint `tintOf(term.id)`. `mark = { kind: 'folder' }` only while the picture shows; on a tint the folder glyph is the mark too (spec: "on a tint the glyph sits in the tint instead" — render the same mark; the tint has no scrim so the glyph reads as part of the tint). `title` = name (2 lines), `sub` = `n_products` when `count > 0`.
- `term` without `imageSrc`: tint `tintOf(term.id)`, folder mark, title, sub.
- `all`: tint 5, mark `{ kind: 'glyph', name: 'grid' }` (the existing grid glyph), title = `t('pos_products.browse_all_products')`, no sub.
- `shortcut`: tint 5, glyph `sliders`, title = name, sub = `description` (2 lines).
- `ParentTermTile`: the same mapping as its term plus `back`, `backTestID="browse-parent-badge"`, `grow`, `accessibilityLabel = t('common.back')`, `testID="browse-parent"`, picture `still`. Never stacked.
- Sizing: `TermTile` takes `dealt` today for `TileSize 'own'`; a Poster is always a square, so `dealt` → just `grow={false}` (`flex-1`) is wrong in a dealt cell (the cell is `flex-1`; a `flex-1` child inside it is fine horizontally; today's `own` existed for *height*). Use: root → `flex-1` (no `grow`); dealt child → `grow` (the cell pins its height to the row and a square tile keeps its aspect). Verify in the browser in Task 6 that a term tile beside a product tile in a level keeps its square; if `grow` stretches it, pass neither and give the Pressable `w-full` via a wrapping `View className="flex-1"` — say which in the commit.
- Keep `termTestId` and `LIFTED` semantics (`lifted` → opacity 0). Delete `WordsBody`, `WORDS_PADDING`, `UNDER`, `tileClass`, `TermImage`, `TermBody`.

- [ ] **Step 1: Update failing tests** in `term-tile.test.tsx`: keep behaviour assertions (press passes the term and the ref; testIDs; parent badge; lifted); replace words-body assertions with: a term without an image has the tint class; All products has the `grid` glyph; a shortcut's description is in the `sub` slot; the folder mark on a picture term; `n_products` only when `count > 0`.
- [ ] **Step 2: Run → fail.** `pnpm --filter @wcpos/core test --maxWorkers=2 src/screens/main/pos/products/v2/browse/term-tile.test.tsx`
- [ ] **Step 3: Implement**; re-point `gallery.tsx` (ids `tile-image`, `tile-plain`, `tile-long`, `tile-all`, `tile-shortcut`, `tile-parent`, `row` unchanged).
- [ ] **Step 4: Run** that suite, then `browse/term-level-grid.test.tsx`, `browse/browse-root.test.tsx` (one at a time). `pnpm typecheck --force`. `pnpm lint`.
- [ ] **Step 5: Commit** `feat(pos): term, All products, shortcut and parent tiles on the Poster`.

### Task 6: Judge it in the running app, ledger

- [ ] From `apps/main` in the worktree start Metro for web (**without** `CI=1`; see memory `metro-web-bundle-cache-serves-the-pre-edit-bundle`), open the POS, turn every grid field on in the settings dialog and look at: a simple product, a variable product (stack visible, 3/6 px, inside the gap), a sold-out product, a product with no image (tint), a category with and without a picture, All products, a shortcut, both themes. Then tap a variable product: the copy's cards fade over the first beat; the parent in slot 0 is a single card with the back badge; tap back: the cards return as the last variation gathers. Fix what is wrong. Confirm the web scrim actually renders the gradient (inspect the element's computed `background-image`).
- [ ] Note what you saw, and anything that still looks off, in the final report (the orchestrator decides whether to film).
- [ ] `v2/LEDGER.md`: entries for `pos/products/grid` and `pos/products/v2/browse` dated 2026-10-12 citing the spec, the `slot` deviation and the `glyph` clarification.
- [ ] Commit `docs(pos): ledger entries for the Poster tile`. Report: files changed, line counts against the budget, the exact test commands run with their exit codes, and what was judged in the browser.
