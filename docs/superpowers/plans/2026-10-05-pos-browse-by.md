# POS products "Browse by" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a register open the products panel on category / tag / brand / shortcut tiles (or rows) that drill into their products, per device, with WooCommerce's own category semantics, reusing the existing deal, pane and breadcrumb.

**Architecture:** One products query state (the root `QueryStateProvider`) stays the source of truth; a *browse path* of terms lives in the stage and projects the deepest term's id set into the taxonomy filter, and is dropped the moment that filter or the search no longer matches it — the same guard the variations drill-in uses for search. Each level of the path is a nested `DealStack` (grid) or `PaneStack` (table) whose root is the level's own grid of child-term tiles + product tiles, and whose detail is either the next term or a product's variations. A pure `term-tree.ts` module owns ordering, hiding, descendants and display type.

**Tech Stack:** React Native + Expo, Uniwind classes, Reanimated (existing `DealStack`/`PaneStack`), `@wcpos/query` engine bindings, zod settings schema, jest-expo component tests, Playwright E2E, the apps/main gallery.

## Global Constraints

- Lane `next`; worktree `/Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by` (branch `feat/pos-browse-by`, already created and installed). Every slice is its own PR to `next`, after the fresh-session review the lane requires.
- Spec: `wcpos/roadmap` `docs/specs/2026-10-05-pos-browse-by-spec.md` (PR #403). Owner decisions: breadcrumb reused as is; **filter bar untouched in every mode**; scope = tiles and table; no per-term colour (image-less tiles are `bg-muted` with the name).
- Design rules: `CODING_STANDARDS.md` § Design. Tap targets ≥ 44 pt; semantic tokens only (`bg-card`, `bg-muted`, `text-muted-foreground`…), never a hex; animate only `transform`/`opacity`; nothing animates on mount; no skeleton or spinner inside a moving surface.
- Tests: ALWAYS `--maxWorkers=2`, one suite at a time. From the worktree root: `pnpm --filter @wcpos/core test -- --maxWorkers=2 <path>`; the hook `cap-test-workers.js` blocks uncapped runs. `pnpm typecheck --force` before every push.
- The filter bar's stored quick filter is `{ type: 'quick', id, label, conditions, sort? }` (`filter-bar-layout.ts` `quickFilterSchema`; pills are `type: 'pill'`). A shortcut's `name` is the quick filter's `label`.
- Strings: every user-facing string goes through `useT()` with a key in `packages/core/src/contexts/translations/locales/en/core.json`, sorted into the `pos_products.` block alphabetically like its neighbours.
- Test IDs from the spec: `browse-root`, `browse-term-<id>`, `browse-shortcut-<id>`, `browse-all-products`, `browse-parent`, `ui-settings-browse-by-<value>`; the crumb keeps `products-breadcrumb` / `products-breadcrumb-back`.
- Commit messages: `feat(pos): …` / `test(pos): …`, imperative, no trailing period. Do not push or open a PR from a task; the slice's final task does that.

---

## File structure

All paths under `packages/core/src/screens/main/pos/products/v2/` unless stated.

| File | Responsibility |
|---|---|
| `browse/term-tree.ts` (new) | Pure functions over term records: `orderTerms`, `visibleTerms`, `childrenOf`, `descendantIds`, `displayTypeOf`. No React. |
| `browse/browse-source.ts` (new) | The `BrowseBy` union, the `BrowseTerm` shape every source produces (`id`, `name`, `count`, `imageSrc`, `display`, `parent`, `kind`), `taxonomyFieldFor(source)`, `labelKeyFor(source)`. |
| `browse/use-browse-terms.ts` (new) | Reads the three taxonomy collections (one `useAllTermsBinding` per collection, generalised from `useAllCategoriesBinding`) and the quick filters, and returns `BrowseTerm[]` for a source. |
| `browse/use-browse-path.ts` (new) | The path state + guard + projection into the root query (`setFilter`/`clearFilter`, quick-filter apply), and `search` reset. Exposes `path`, `enter(term, target?)`, `backTo(depth)`, `root()`. |
| `browse/term-tile.tsx` (new) | `TermTile`, `AllProductsTile`, `ParentTermTile`. |
| `browse/term-row.tsx` (new) | `TermRow`, `AllProductsRow`. |
| `browse/level-snapshot.ts` (new) | `useLevelSnapshot(answer, settled)`: a level's own last answer, held while the shared products query is another level's (a child over it, or gathering its set again on the way back). |
| `browse/term-grid.tsx` (new) | The root term grid (`BrowseRootGrid`) and a level's dealt grid (`TermLevelGrid`: slot 0 parent, child term tiles, product tiles from the level snapshot). |
| `browse/term-table.tsx` (new) | The root term list (`BrowseRootTable`) and a level's pane (`TermLevelTable`: crumb, child term rows, product rows on `DataTable`). |
| `browse/browse-stage.tsx` (new) | `BrowseStage`: owns the nested `DealStack`/`PaneStack` recursion for `path` and the per-level variations drill; renders `DrillIn` for a product. |
| `index.tsx` (modify) | Reads `browseBy`; when not `'all'` renders `BrowseStage` in place of the bare `DealStack`/`PaneStack`; passes the products element and the drill plumbing down. |
| `drill-in.tsx` (modify) | New optional `parents` prop for the crumb (defaults to today's `[Products]`). |
| `../ui-settings-form.tsx` (modify) | `browseBy` in the zod schema + a **Browse by** option list. |
| `../../../contexts/ui-settings/initial-settings.json` (modify) | `"browseBy": "all"` under `pos-products`. |
| `../../../contexts/ui-settings/use-ui-label.ts` (modify) | label for `browseBy`. |
| `packages/core/src/query/query-bindings.ts` (modify) | `useAllTermsBinding(collection)`; `useAllCategoriesBinding` becomes a one-line wrapper. |
| `packages/core/src/contexts/translations/locales/en/core.json` (modify) | new `pos_products.*` keys. |
| `apps/main/components/gallery/registry.tsx` + `browse/gallery.tsx` (new) | tile/row stories. |
| `apps/main/e2e/pos-browse-by.spec.ts` (new) + `apps/main/e2e/fixtures.ts` (modify) | E2E. |

---

## Slice 1 — term tree, setting, root tiles and rows (no drill)

### Task 1: `term-tree.ts`

**Files:**
- Create: `packages/core/src/screens/main/pos/products/v2/browse/term-tree.ts`
- Test: `packages/core/src/screens/main/pos/products/v2/browse/term-tree.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type TermLike = { id: number; name: string; parent?: number; menu_order?: number; count?: number; display?: string };
  export type DisplayType = 'products' | 'subcategories' | 'both';
  export function orderTerms<T extends TermLike>(terms: T[], hierarchical: boolean): T[];
  export function visibleTerms<T extends TermLike>(terms: T[], knownNonEmpty?: ReadonlySet<number>): T[]; // count > 0, or a synced product carries it, or any descendant is visible
  export function childrenOf<T extends TermLike>(terms: T[], parentId: number): T[]; // ordered, visible
  export function rootTerms<T extends TermLike>(terms: T[]): T[];            // parent missing/0/orphaned, ordered, visible
  export function descendantIds(terms: TermLike[], id: number): number[];     // [id, ...all descendants], no duplicates, cycle-safe
  export function displayTypeOf(term: TermLike): DisplayType;                 // 'subcategories' | 'products' | else 'both'
  ```

- [ ] **Step 1: Write the failing tests**

```ts
// term-tree.test.ts
import {
	childrenOf,
	descendantIds,
	displayTypeOf,
	orderTerms,
	rootTerms,
	visibleTerms,
} from './term-tree';

const T = (id: number, name: string, extra: Partial<{ parent: number; menu_order: number; count: number; display: string }> = {}) => ({
	id,
	name,
	count: 1,
	...extra,
});

describe('orderTerms', () => {
	it('orders a hierarchical taxonomy by menu_order then name', () => {
		const out = orderTerms([T(1, 'Snacks', { menu_order: 2 }), T(2, 'Drinks', { menu_order: 1 }), T(3, 'Bakery', { menu_order: 2 })], true);
		expect(out.map((t) => t.name)).toEqual(['Drinks', 'Bakery', 'Snacks']);
	});
	it('treats a missing menu_order as 0', () => {
		const out = orderTerms([T(1, 'B', { menu_order: 1 }), T(2, 'A')], true);
		expect(out.map((t) => t.name)).toEqual(['A', 'B']);
	});
	it('orders a flat taxonomy by name only, ignoring menu_order', () => {
		const out = orderTerms([T(1, 'Vegan', { menu_order: 0 }), T(2, 'Decaf', { menu_order: 9 })], false);
		expect(out.map((t) => t.name)).toEqual(['Decaf', 'Vegan']);
	});
	it('compares names case-insensitively and locale-aware', () => {
		const out = orderTerms([T(1, 'éclair'), T(2, 'Apple'), T(3, 'banana')], false);
		expect(out.map((t) => t.name)).toEqual(['Apple', 'banana', 'éclair']);
	});
});

describe('visibleTerms', () => {
	it('hides terms with no catalog count and no synced product', () => {
		expect(visibleTerms([T(1, 'A', { count: 0 }), T(2, 'B', { count: 3 })]).map((t) => t.id)).toEqual([2]);
	});
	it('hides a term with no count at all', () => {
		expect(visibleTerms([{ id: 1, name: 'A' }])).toEqual([]);
	});
	it('keeps a zero-count term a synced product carries (POS-only products are not in the catalog recount)', () => {
		expect(visibleTerms([T(1, 'A', { count: 0 }), T(2, 'B', { count: 0 })], new Set([2])).map((t) => t.id)).toEqual([2]);
	});
	it('keeps an empty parent whose descendant is visible, so the branch stays reachable', () => {
		const terms = [T(1, 'Org', { count: 0 }), T(2, 'Mid', { parent: 1, count: 0 }), T(3, 'Leaf', { parent: 2, count: 0 }), T(4, 'Bare', { parent: 1, count: 0 })];
		expect(visibleTerms(terms, new Set([3])).map((t) => t.id)).toEqual([1, 2, 3]);
	});
	it('does not loop on a parent cycle', () => {
		expect(visibleTerms([T(1, 'A', { parent: 2, count: 1 }), T(2, 'B', { parent: 1, count: 0 })]).map((t) => t.id)).toEqual([1, 2]);
	});
});

describe('rootTerms and childrenOf', () => {
	const terms = [T(1, 'Drinks', { menu_order: 1 }), T(2, 'Hot', { parent: 1, menu_order: 2 }), T(3, 'Cold', { parent: 1, menu_order: 1 }), T(4, 'Orphan', { parent: 99 }), T(5, 'Empty', { parent: 1, count: 0 })];
	it('roots are parentless or orphaned, ordered and visible', () => {
		// Orphan has no menu_order (0), Drinks has 1: the rule puts Orphan first.
		expect(rootTerms(terms).map((t) => t.name)).toEqual(['Orphan', 'Drinks']);
	});
	it('an empty parent with a POS-only child is a root, and the child is its child', () => {
		const posOnly = [T(1, 'Org', { count: 0 }), T(2, 'Leaf', { parent: 1, count: 0 })];
		expect(rootTerms(posOnly, new Set([2])).map((t) => t.name)).toEqual(['Org']);
		expect(childrenOf(posOnly, 1, new Set([2])).map((t) => t.name)).toEqual(['Leaf']);
	});
	it('children are the direct, visible, ordered children', () => {
		expect(childrenOf(terms, 1).map((t) => t.name)).toEqual(['Cold', 'Hot']);
	});
});

describe('descendantIds', () => {
	it('returns the term and every descendant, deep', () => {
		const terms = [T(1, 'A'), T(2, 'B', { parent: 1 }), T(3, 'C', { parent: 2 }), T(4, 'D')];
		expect(descendantIds(terms, 1)).toEqual([1, 2, 3]);
	});
	it('includes hidden descendants (their products still belong to the parent)', () => {
		const terms = [T(1, 'A'), T(2, 'B', { parent: 1, count: 0 })];
		expect(descendantIds(terms, 1)).toEqual([1, 2]);
	});
	it('survives a cycle', () => {
		const terms = [T(1, 'A', { parent: 2 }), T(2, 'B', { parent: 1 })];
		expect(descendantIds(terms, 1)).toEqual([1, 2]);
	});
});

describe('displayTypeOf', () => {
	it.each([
		['products', 'products'],
		['subcategories', 'subcategories'],
		['both', 'both'],
		['default', 'both'],
		['', 'both'],
		[undefined, 'both'],
		['garbage', 'both'],
	])('%p → %s', (display, expected) => {
		expect(displayTypeOf({ id: 1, name: 'x', display: display as string })).toBe(expected);
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by && pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/term-tree.test.ts`
Expected: FAIL — `Cannot find module './term-tree'`.

- [ ] **Step 3: Implement**

```ts
// term-tree.ts
/**
 * The WooCommerce shop's reading of a product taxonomy, as pure functions over the local term
 * records: ordered by the term's menu_order then name, empty terms hidden
 * (`woocommerce_product_subcategories_hide_empty`), a parent including its descendants
 * (`WP_Tax_Query` `include_children`), and the per-term display type.
 */
export type TermLike = {
	id: number;
	name: string;
	parent?: number;
	menu_order?: number;
	count?: number;
	display?: string;
};

export type DisplayType = 'products' | 'subcategories' | 'both';

const byName = (a: TermLike, b: TermLike) =>
	a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

export function orderTerms<T extends TermLike>(terms: T[], hierarchical: boolean): T[] {
	return [...terms].sort((a, b) =>
		hierarchical ? (a.menu_order ?? 0) - (b.menu_order ?? 0) || byName(a, b) : byName(a, b)
	);
}

/**
 * WooCommerce's `count` is the catalog recount, which leaves out products hidden from the
 * catalog — the POS-only products a till sells. So a zero-count term stays if a synced product
 * carries it (`knownNonEmpty`, from one local products query for the zero-count ids), and a
 * parent stays whenever a descendant does: the shop's recount already folds descendants into a
 * parent's count (`_wc_term_recount`), so the only parent this lifts is one whose branch holds
 * nothing but POS-only products — and hiding it would make that branch unreachable.
 */
export function visibleTerms<T extends TermLike>(terms: T[], knownNonEmpty?: ReadonlySet<number>): T[] {
	const byId = new Map(terms.map((term) => [term.id, term]));
	const visible = new Set<number>();
	for (const term of terms) {
		if (!((term.count ?? 0) > 0 || knownNonEmpty?.has(term.id))) continue;
		// The term and every ancestor; a cycle ends where it started.
		for (let cursor: TermLike | undefined = term; cursor && !visible.has(cursor.id); cursor = cursor.parent ? byId.get(cursor.parent) : undefined)
			visible.add(cursor.id);
	}
	return terms.filter((term) => visible.has(term.id));
}

export function rootTerms<T extends TermLike>(terms: T[], knownNonEmpty?: ReadonlySet<number>): T[] {
	const ids = new Set(terms.map((term) => term.id));
	return orderTerms(
		visibleTerms(terms, knownNonEmpty).filter((term) => !term.parent || !ids.has(term.parent)),
		true
	);
}

export function childrenOf<T extends TermLike>(terms: T[], parentId: number, knownNonEmpty?: ReadonlySet<number>): T[] {
	return orderTerms(
		visibleTerms(terms, knownNonEmpty).filter((term) => term.parent === parentId),
		true
	);
}

export function descendantIds(terms: TermLike[], id: number): number[] {
	const children = new Map<number, number[]>();
	for (const term of terms) {
		if (!term.parent) continue;
		children.set(term.parent, [...(children.get(term.parent) ?? []), term.id]);
	}
	const seen = new Set<number>([id]);
	const queue = [id];
	while (queue.length > 0) {
		for (const child of children.get(queue.shift() as number) ?? []) {
			if (seen.has(child)) continue;
			seen.add(child);
			queue.push(child);
		}
	}
	return [...seen];
}

export function displayTypeOf(term: TermLike): DisplayType {
	return term.display === 'products' || term.display === 'subcategories' ? term.display : 'both';
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run the Step 2 command. Expected: PASS, 22 tests.

- [ ] **Step 5: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/screens/main/pos/products/v2/browse/term-tree.ts packages/core/src/screens/main/pos/products/v2/browse/term-tree.test.ts
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): term tree — WooCommerce's ordering, hiding, descendants and display type as pure functions"
```

### Task 2: `browseBy` setting, label, strings

**Files:**
- Modify: `packages/core/src/screens/main/contexts/ui-settings/initial-settings.json` (the `pos-products` block, next to `"variationsStyle": "drill"`)
- Modify: `packages/core/src/screens/main/contexts/ui-settings/use-ui-label.ts` (the `pos-products` label map, next to `viewMode`)
- Modify: `packages/core/src/screens/main/contexts/ui-settings/utils.ts` (`ENUM_VOCABULARIES['pos-products']`)
- Modify: `packages/core/src/screens/main/contexts/ui-settings/utils.test.ts` (two tests, next to the `position` ones at lines 226-254)
- Modify: `packages/core/src/contexts/translations/locales/en/core.json`
- Create: `packages/core/src/screens/main/pos/products/v2/browse/browse-source.ts`
- Test: `packages/core/src/screens/main/pos/products/v2/browse/browse-source.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const BROWSE_BY = ['all', 'categories', 'tags', 'brands', 'shortcuts'] as const;
  export type BrowseBy = (typeof BROWSE_BY)[number];
  export function readBrowseBy(value: unknown): BrowseBy;          // unknown → 'all'
  export type TaxonomySource = 'categories' | 'tags' | 'brands';
  export function isTaxonomy(source: BrowseBy): source is TaxonomySource;
  export function isHierarchical(source: TaxonomySource): boolean;   // categories, brands
  export function collectionFor(source: TaxonomySource): 'products/categories' | 'products/tags' | 'products/brands';
  export type BrowseTerm =
    | { kind: 'all' }
    | { kind: 'term'; id: number; name: string; count: number; imageSrc?: string; display?: string; parent?: number }
    | { kind: 'shortcut'; id: string; name: string; description: string };
  export function termKey(term: BrowseTerm): string;   // 'all' | `term-${id}` | `shortcut-${id}`
  ```

- [ ] **Step 1: Write the failing test**

```ts
// browse-source.test.ts
import { BROWSE_BY, collectionFor, isHierarchical, isTaxonomy, readBrowseBy, termKey } from './browse-source';

it('reads an unknown or missing value as all', () => {
	expect(readBrowseBy(undefined)).toBe('all');
	expect(readBrowseBy('favourites')).toBe('all');
	for (const value of BROWSE_BY) expect(readBrowseBy(value)).toBe(value);
});

it('knows which sources are taxonomies and which nest', () => {
	expect(isTaxonomy('all')).toBe(false);
	expect(isTaxonomy('shortcuts')).toBe(false);
	expect(isTaxonomy('tags')).toBe(true);
	expect(isHierarchical('categories')).toBe(true);
	expect(isHierarchical('brands')).toBe(true);
	expect(isHierarchical('tags')).toBe(false);
	expect(collectionFor('brands')).toBe('products/brands');
});

it('keys every kind of term distinctly', () => {
	expect(termKey({ kind: 'all' })).toBe('all');
	expect(termKey({ kind: 'term', id: 7, name: 'x', count: 1 })).toBe('term-7');
	expect(termKey({ kind: 'shortcut', id: 'qf1', name: 'x', description: '' })).toBe('shortcut-qf1');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/browse-source.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `browse-source.ts`**

```ts
export const BROWSE_BY = ['all', 'categories', 'tags', 'brands', 'shortcuts'] as const;
export type BrowseBy = (typeof BROWSE_BY)[number];
export type TaxonomySource = 'categories' | 'tags' | 'brands';

/** A persisted value the app does not know (a newer build wrote it) reads as today's screen. */
export function readBrowseBy(value: unknown): BrowseBy {
	return (BROWSE_BY as readonly unknown[]).includes(value) ? (value as BrowseBy) : 'all';
}

export function isTaxonomy(source: BrowseBy): source is TaxonomySource {
	return source === 'categories' || source === 'tags' || source === 'brands';
}

/** WooCommerce registers product_cat and product_brand as hierarchical; product_tag is flat. */
export function isHierarchical(source: TaxonomySource): boolean {
	return source !== 'tags';
}

export function collectionFor(
	source: TaxonomySource
): 'products/categories' | 'products/tags' | 'products/brands' {
	return `products/${source}`;
}

export type BrowseTerm =
	| { kind: 'all' }
	| {
			kind: 'term';
			id: number;
			name: string;
			count: number;
			imageSrc?: string;
			display?: string;
			parent?: number;
	  }
	| { kind: 'shortcut'; id: string; name: string; description: string };

export function termKey(term: BrowseTerm): string {
	if (term.kind === 'all') return 'all';
	if (term.kind === 'term') return `term-${term.id}`;
	return `shortcut-${term.id}`;
}
```

- [ ] **Step 4: Add the setting default and label**

In `initial-settings.json`, inside `"pos-products"`, directly after `"variationsStyle": "drill",` add:

```json
    "browseBy": "all",
```

In `use-ui-label.ts`, in the `pos-products` map directly after the `viewMode:` line add:

```ts
					browseBy: t('pos_products.browse_by'),
```

- [ ] **Step 5: Add the strings**

In `core.json`, in the `pos_products.` block (keep alphabetical order within the block), add:

```json
	"pos_products.browse_all_products": "All products",
	"pos_products.browse_brands": "Brands",
	"pos_products.browse_by": "Browse by",
	"pos_products.browse_categories": "Categories",
	"pos_products.browse_shortcuts": "Shortcuts",
	"pos_products.browse_tags": "Tags",
	"pos_products.n_brands_one": "{count} brand",
	"pos_products.n_brands_other": "{count} brands",
	"pos_products.n_categories_one": "{count} category",
	"pos_products.n_categories_other": "{count} categories",
	"pos_products.n_products_one": "{count} product",
	"pos_products.n_products_other": "{count} products",
	"pos_products.n_quick_filters_one": "{count} quick filter",
	"pos_products.n_quick_filters_other": "{count} quick filters",
	"pos_products.n_tags_one": "{count} tag",
	"pos_products.n_tags_other": "{count} tags",
	"pos_products.no_brands_yet": "No brands yet",
	"pos_products.no_categories_yet": "No categories yet",
	"pos_products.no_shortcuts_yet": "No shortcuts yet",
	"pos_products.no_tags_yet": "No tags yet",
```

Every count string is an `_one`/`_other` pair: i18next picks the form from `count`, so call sites ask for the base key (`t('pos_products.n_products', { count })`) and `catalog-plurals.test.ts` fails a base without `_other`. The existing bare `pos_products.n_variations` is not this task's.

Then run the translations check the repo uses for `core.json` ordering/validity: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/contexts/translations` and fix any ordering complaint it reports.

- [ ] **Step 5b: Hydration — an unknown stored value reads as `all`**

`mergeWithInitalValues` (`ui-settings/utils.ts`) resets an enum setting whose persisted value is outside its vocabulary; that table is the per-device hydration rule the spec names. Add `browseBy` to it:

```ts
import { BROWSE_BY } from '../../pos/products/v2/browse/browse-source';
// …
const ENUM_VOCABULARIES: Partial<Record<UISettingID, Record<string, readonly string[]>>> = {
	'pos-products': { position: ['left', 'right'], browseBy: BROWSE_BY },
	'pos-cart': { openOrdersPosition: ['top', 'bottom'] },
};
```

And in `utils.test.ts`, after the `keeps a position the cashier actually chose` test:

```ts
	it('resets a browseBy outside the vocabulary to all', async () => {
		const currentState: Record<string, unknown> = { position: 'left', browseBy: 'favourites', filterBar: [] };
		const state = {
			get: () => currentState,
			set: jest.fn(async (key: string, updater: (value: unknown) => unknown) => {
				currentState[key] = updater(currentState[key]);
			}),
		};
		await mergeWithInitalValues('pos-products', state as never);
		expect(currentState.browseBy).toBe('all');
	});

	it('keeps a browseBy the cashier chose, and seeds all on a state written before the setting existed', async () => {
		const chosen: Record<string, unknown> = { position: 'left', browseBy: 'categories', filterBar: [] };
		const older: Record<string, unknown> = { position: 'left', filterBar: [] };
		for (const currentState of [chosen, older]) {
			const state = {
				get: () => currentState,
				set: jest.fn(async (key: string, updater: (value: unknown) => unknown) => {
					currentState[key] = updater(currentState[key]);
				}),
			};
			await mergeWithInitalValues('pos-products', state as never);
		}
		expect(chosen.browseBy).toBe('categories');
		expect(older.browseBy).toBe('all');
	});
```

- [ ] **Step 6: Run the tests**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/browse-source.test.ts src/screens/main/contexts/ui-settings`
Expected: PASS (the `initial-settings.test.ts` suite still passes with the new key; `utils.test.ts` gains two tests).

- [ ] **Step 7: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add -A packages/core/src/screens/main/pos/products/v2/browse packages/core/src/screens/main/contexts/ui-settings packages/core/src/contexts/translations/locales/en/core.json
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): browseBy device setting, its label and strings"
```

### Task 3: `useAllTermsBinding` and `useBrowseTerms`

**Files:**
- Modify: `packages/core/src/query/query-bindings.ts:1117-1141` (`useAllCategoriesBinding`)
- Create: `packages/core/src/screens/main/pos/products/v2/browse/use-browse-terms.ts`
- Test: `packages/core/src/screens/main/pos/products/v2/browse/use-browse-terms.test.tsx`

**Interfaces:**
- Consumes: `BrowseBy`, `BrowseTerm`, `collectionFor`, `isTaxonomy`, `isHierarchical` (Task 2); `rootTerms`, `childrenOf`, `orderTerms`, `visibleTerms` (Task 1); `describeQuickFilter`, `normalizeFilterBar`, `QuickFilter` from `../../filter-bar/filter-bar-layout`.
- Produces:
  ```ts
  // query-bindings.ts
  export function useAllTermsBinding(collection: 'products/categories' | 'products/tags' | 'products/brands'): EngineBinding<...>; // same shape as useAllCategoriesBinding returns today
  export function useAllCategoriesBinding() { return useAllTermsBinding('products/categories'); }
  // use-browse-terms.ts
  export type BrowseTerms = {
    /** Every visible term of the source, in order; undefined until the collection has answered. */
    all: BrowseTerm[] | undefined;
    rootsOf: () => BrowseTerm[];            // for the root grid
    childrenOf: (term: BrowseTerm) => BrowseTerm[];   // [] for flat sources and shortcuts
    idsFor: (term: BrowseTerm) => number[];  // [id, ...descendants] for a taxonomy term; [] otherwise
    quickFilterFor: (term: BrowseTerm) => QuickFilter | undefined;
  };
  export function useBrowseTerms(source: BrowseBy): BrowseTerms;
  ```

- [ ] **Step 1: Write the failing test**

The hook is tested through its pure projection. Export `projectTerms` and test that; the hook itself is a thin composition. Mock the binding hooks.

```tsx
// use-browse-terms.test.tsx
import { projectTerms, projectShortcuts } from './use-browse-terms';

const rec = (payload: Record<string, unknown>) => ({ payload });

describe('projectTerms', () => {
	const records = [
		rec({ id: 1, name: 'Drinks', parent: 0, menu_order: 1, count: 12, image: { src: 'https://x/d.jpg' }, display: 'both' }),
		rec({ id: 2, name: 'Hot', parent: 1, menu_order: 1, count: 6 }),
		rec({ id: 3, name: 'Cold', parent: 1, menu_order: 2, count: 6, image: null }),
		rec({ id: 4, name: 'Empty', parent: 0, count: 0 }),
	];
	it('projects a hierarchical source into roots, children and id sets', () => {
		const terms = projectTerms(records as never, 'categories');
		expect(terms.rootsOf().map((t) => t.kind === 'term' && t.name)).toEqual(['Drinks']);
		const drinks = terms.rootsOf()[0];
		expect(terms.childrenOf(drinks).map((t) => t.kind === 'term' && t.name)).toEqual(['Hot', 'Cold']);
		expect(terms.idsFor(drinks)).toEqual([1, 2, 3]);
		expect(drinks.kind === 'term' && drinks.imageSrc).toBe('https://x/d.jpg');
		expect(terms.childrenOf(drinks)[1].kind === 'term' && terms.childrenOf(drinks)[1].imageSrc).toBeUndefined();
	});
	it('projects a flat source by name with no children', () => {
		const terms = projectTerms([rec({ id: 9, name: 'Vegan', count: 2 }), rec({ id: 8, name: 'Decaf', count: 1 })] as never, 'tags');
		expect(terms.rootsOf().map((t) => t.kind === 'term' && t.name)).toEqual(['Decaf', 'Vegan']);
		expect(terms.childrenOf(terms.rootsOf()[0])).toEqual([]);
		expect(terms.idsFor(terms.rootsOf()[0])).toEqual([8]);
	});
});

describe('projectShortcuts', () => {
	it('turns the stored quick filters into shortcut terms in order, described', () => {
		const items = [
			{ type: 'builtin', id: 'stock_status', visible: true },
			{ type: 'quick', id: 'qf-2', label: 'Breakfast', conditions: [{ field: 'categories', value: [3, 4] }] },
			{ type: 'quick', id: 'qf-1', label: 'Under 3', conditions: [{ field: 'price', value: { max: 3 } }] },
		];
		const terms = projectShortcuts(items as never, (qf) => `desc:${qf.name}`);
		expect(terms.rootsOf().map((t) => t.kind === 'shortcut' && [t.id, t.name, t.description])).toEqual([
			['qf-2', 'Breakfast', 'desc:Breakfast'],
			['qf-1', 'Under 3', 'desc:Under 3'],
		]);
		expect(terms.quickFilterFor(terms.rootsOf()[0])?.label).toBe('Breakfast');
		expect(terms.idsFor(terms.rootsOf()[0])).toEqual([]);
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/use-browse-terms.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Generalise the binding**

In `query-bindings.ts` replace the body of `useAllCategoriesBinding` so the file reads:

```ts
export function useAllTermsBinding(
	collection: 'products/categories' | 'products/tags' | 'products/brands'
) {
	const bindingId = React.useId();
	const compiled = React.useMemo(
		() =>
			compileQuery(
				collection,
				{
					search: '',
					filters: {},
					sort: { field: 'name', direction: 'asc' },
				},
				{ id: bindingId }
			),
		[bindingId, collection]
	);
	return useEngineBinding(
		{
			collection,
			selector: {},
			sort: [{ name: 'asc' }],
		},
		compiled,
		true,
		bindingId
	);
}

export function useAllCategoriesBinding() {
	return useAllTermsBinding('products/categories');
}
```

Run `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/query` to confirm the existing bindings tests still pass (if `compileQuery`'s collection parameter is typed narrower than the union, widen that parameter's type to accept the three term collections — do not cast).

- [ ] **Step 4: Implement `use-browse-terms.ts`**

```ts
import * as React from 'react';

import { useObservableEagerState } from 'observable-hooks';

import { useDocField } from '@wcpos/query';

import { useAllTermsBinding } from '../../../../../../query';
import { useUISettings } from '../../../../contexts/ui-settings';
import { describeQuickFilter, normalizeFilterBar, type QuickFilter } from '../../filter-bar/filter-bar-layout';
import { useT } from '../../../../../../contexts/translations';
import { useCurrencyFormat } from '../../../../hooks/use-currency-format';
import { type BrowseBy, type BrowseTerm, collectionFor, isHierarchical, isTaxonomy, type TaxonomySource } from './browse-source';
import { childrenOf, descendantIds, orderTerms, rootTerms, visibleTerms, type TermLike } from './term-tree';

export type BrowseTerms = {
	all: BrowseTerm[] | undefined;
	rootsOf: () => BrowseTerm[];
	childrenOf: (term: BrowseTerm) => BrowseTerm[];
	idsFor: (term: BrowseTerm) => number[];
	quickFilterFor: (term: BrowseTerm) => QuickFilter | undefined;
};

type TermRecord = { payload: TermLike & { image?: { src?: string } | null } };

const toTerm = (record: TermRecord): BrowseTerm & { kind: 'term' } => ({
	kind: 'term',
	id: record.payload.id,
	name: record.payload.name,
	count: record.payload.count ?? 0,
	imageSrc: record.payload.image?.src || undefined,
	display: record.payload.display,
	parent: record.payload.parent || undefined,
});

/** Pure: the taxonomy records → the source's terms. Exported for its test. */
export function projectTerms(records: TermRecord[] | undefined, source: TaxonomySource): BrowseTerms {
	const payloads = (records ?? []).map((record) => record.payload);
	const byId = new Map(payloads.map((term) => [term.id, term]));
	const hierarchical = isHierarchical(source);
	const asTerm = (term: TermLike) => toTerm({ payload: term } as TermRecord);
	return {
		all: records === undefined ? undefined : orderTerms(visibleTerms(payloads), hierarchical).map(asTerm),
		rootsOf: () => (hierarchical ? rootTerms(payloads) : orderTerms(visibleTerms(payloads), false)).map(asTerm),
		childrenOf: (term) => (term.kind === 'term' && hierarchical ? childrenOf(payloads, term.id).map(asTerm) : []),
		idsFor: (term) =>
			term.kind !== 'term' ? [] : hierarchical && byId.has(term.id) ? descendantIds(payloads, term.id) : [term.id],
		quickFilterFor: () => undefined,
	};
}

/** Pure: the filter bar's stored items → shortcut terms, in the merchant's order. */
export function projectShortcuts(
	items: ReturnType<typeof normalizeFilterBar>,
	describe: (quickFilter: QuickFilter) => string
): BrowseTerms {
	const quickFilters = items.filter((item): item is QuickFilter => item.type === 'quick');
	const terms: BrowseTerm[] = quickFilters.map((quickFilter) => ({
		kind: 'shortcut',
		id: quickFilter.id,
		name: quickFilter.label,
		description: describe(quickFilter),
	}));
	return {
		all: terms,
		rootsOf: () => terms,
		childrenOf: () => [],
		idsFor: () => [],
		quickFilterFor: (term) =>
			term.kind === 'shortcut' ? quickFilters.find((quickFilter) => quickFilter.id === term.id) : undefined,
	};
}

const NONE: BrowseTerms = { all: [], rootsOf: () => [], childrenOf: () => [], idsFor: () => [], quickFilterFor: () => undefined };

function useTaxonomyTerms(source: TaxonomySource): BrowseTerms {
	const binding = useAllTermsBinding(collectionFor(source));
	// Read as state, never suspend: the tiles are on a stage that must not swap for a skeleton.
	// eslint-disable-next-line wcpos/no-dollar-getter-into-observable-hooks -- ObservableResource exposes a stable BehaviorSubject property, not an RxDB $-getter; exception dated 2026-10-02.
	useObservableEagerState(binding.resource.valueRef$$);
	const answer = binding.resource.valueRef$$.value;
	const hits = answer?.current.hits as { record: TermRecord }[] | undefined;
	return React.useMemo(() => projectTerms(hits?.map((hit) => hit.record), source), [hits, source]);
}

export function useBrowseTerms(source: BrowseBy): BrowseTerms {
	// Hooks are unconditional: every source's data is read; only one is projected.
	const categories = useTaxonomyTerms('categories');
	const tags = useTaxonomyTerms('tags');
	const brands = useTaxonomyTerms('brands');
	const { uiSettings } = useUISettings('pos-products');
	const items = normalizeFilterBar(useDocField(uiSettings, (value) => value.filterBar));
	const t = useT();
	const { format } = useCurrencyFormat();
	const shortcuts = React.useMemo(
		() => projectShortcuts(items, (quickFilter) => describeQuickFilter(quickFilter, { t, format })),
		[items, t, format]
	);
	if (source === 'all') return NONE;
	if (source === 'shortcuts') return shortcuts;
	if (isTaxonomy(source)) return { categories, tags, brands }[source];
	return NONE;
}
```

Check `describeQuickFilter`'s real signature in `filter-bar-layout.ts:209` and pass exactly what it takes (it needs the translator and currency formatter per ledger line 12); adjust the call above to its parameter list — do not change `describeQuickFilter`.

**Zero-count terms a synced product carries.** `projectTerms` takes a third argument `knownNonEmpty: ReadonlySet<number>` and passes it through to `rootTerms`/`childrenOf`/`visibleTerms`; `useTaxonomyTerms` builds it with one more binding over `products` whose selector is `{ [source]: { $elemMatch: { id: { $in: zeroCountIds } } } }` (the product payload stores `categories`/`tags`/`brands` as `{ id, name, slug }[]`; check `collection-map.ts` for the exact field path and use `useEngineBinding` as `useAllTermsBinding` does, `limit` = the number of zero-count ids × 1 is not expressible, so read the hits and collect the term ids they carry into the Set). The products binding is skipped (selector `null`/binding disabled) when there are no zero-count terms. Add to the test file: `projectTerms(records, 'categories', new Set([4]))` keeps `Empty` (count 0) in `rootsOf()`.

Three bindings always mounted is acceptable: the Brand/Tag/Category pills already hold the same collections; if `useAllTermsBinding` turns out to subscribe three queries per products panel and that shows in the products-panel perf gate, split `useBrowseTerms` into a per-source hook mounted by the stage only for the active source (the hook order stays unconditional because the stage mounts one component per source).

- [ ] **Step 5: Run the tests to verify they pass**

Run the Step 2 command, then `pnpm typecheck --force` from the worktree root. Expected: PASS; typecheck clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/query/query-bindings.ts packages/core/src/screens/main/pos/products/v2/browse/use-browse-terms.ts packages/core/src/screens/main/pos/products/v2/browse/use-browse-terms.test.tsx
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): browse terms — one binding per taxonomy, shortcuts from the stored quick filters"
```

### Task 4: Term tiles and rows

**Files:**
- Create: `packages/core/src/screens/main/pos/products/v2/browse/term-tile.tsx`
- Create: `packages/core/src/screens/main/pos/products/v2/browse/term-row.tsx`
- Test: `packages/core/src/screens/main/pos/products/v2/browse/term-tile.test.tsx`

**Interfaces:**
- Consumes: `BrowseTerm` (Task 2); `Measurable` from `../deal-stack`; `TileImage` is NOT reusable (it takes a product record) — the term tile renders `@wcpos/components/image` directly from `imageSrc`.
- Produces:
  ```tsx
  export function TermTile({ term, onPress, lifted }: { term: BrowseTerm; onPress: (term: BrowseTerm, target?: Measurable) => void; lifted?: boolean }): JSX.Element;
  export function ParentTermTile({ term, onPress }: { term: BrowseTerm; onPress: () => void }): JSX.Element; // slot 0 of a dealt grid
  export function TermRow({ term, onPress }: { term: BrowseTerm; onPress: (term: BrowseTerm) => void }): JSX.Element;
  ```
  `testID`: `browse-all-products` for `{kind:'all'}`, `browse-term-<id>` for a term, `browse-shortcut-<id>` for a shortcut; `browse-parent` on `ParentTermTile`.

- [ ] **Step 1: Write the failing test**

```tsx
// term-tile.test.tsx
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ParentTermTile, TermTile } from './term-tile';
import { TermRow } from './term-row';

jest.mock('../../../../../../contexts/translations', () => ({
	useT: () => (key: string, vars?: { count?: number }) =>
		key === 'pos_products.n_products' ? `${vars?.count} products` : key === 'pos_products.browse_all_products' ? 'All products' : key,
}));

const drinks = { kind: 'term' as const, id: 7, name: 'Drinks', count: 12, imageSrc: 'https://x/d.jpg' };
const snacks = { kind: 'term' as const, id: 8, name: 'Snacks', count: 4 };
const breakfast = { kind: 'shortcut' as const, id: 'qf-1', name: 'Breakfast', description: 'Hot Food + Bakery' };

describe('TermTile', () => {
	it('renders an image tile with name and count, and reports its press with itself', () => {
		const onPress = jest.fn();
		render(<TermTile term={drinks} onPress={onPress} />);
		expect(screen.getByText('Drinks')).toBeTruthy();
		expect(screen.getByText('12 products')).toBeTruthy();
		expect(screen.getByTestId('browse-term-7-image')).toBeTruthy();
		fireEvent.press(screen.getByTestId('browse-term-7'));
		expect(onPress).toHaveBeenCalledWith(drinks, expect.anything());
	});
	it('renders a name-on-muted tile when there is no image', () => {
		render(<TermTile term={snacks} onPress={jest.fn()} />);
		expect(screen.queryByTestId('browse-term-8-image')).toBeNull();
		expect(screen.getByText('Snacks')).toBeTruthy();
	});
	it('shows no count on a term the storefront counts as empty (kept for its POS-only products)', () => {
		render(<TermTile term={{ ...snacks, count: 0 }} onPress={jest.fn()} />);
		expect(screen.queryByText(/products$/)).toBeNull();
		render(<TermRow term={{ ...snacks, count: 0 }} onPress={jest.fn()} />);
		expect(screen.queryByText(/products$/)).toBeNull();
	});
	it('renders All products with no count', () => {
		render(<TermTile term={{ kind: 'all' }} onPress={jest.fn()} />);
		expect(screen.getByTestId('browse-all-products')).toBeTruthy();
		expect(screen.queryByText(/products$/)).toBeNull();
	});
	it('renders a shortcut with its description', () => {
		render(<TermTile term={breakfast} onPress={jest.fn()} />);
		expect(screen.getByTestId('browse-shortcut-qf-1')).toBeTruthy();
		expect(screen.getByText('Hot Food + Bakery')).toBeTruthy();
	});
	it('is invisible while lifted (its copy is out on the stage)', () => {
		render(<TermTile term={snacks} onPress={jest.fn()} lifted />);
		expect(screen.getByTestId('browse-term-8')).toHaveStyle({ opacity: 0 });
	});
});

describe('ParentTermTile', () => {
	it('is the way back', () => {
		const back = jest.fn();
		render(<ParentTermTile term={drinks} onPress={back} />);
		fireEvent.press(screen.getByTestId('browse-parent'));
		expect(back).toHaveBeenCalled();
	});
});

describe('TermRow', () => {
	it('renders name, count and reports its press', () => {
		const onPress = jest.fn();
		render(<TermRow term={drinks} onPress={onPress} />);
		expect(screen.getByText('12 products')).toBeTruthy();
		fireEvent.press(screen.getByTestId('browse-term-7'));
		expect(onPress).toHaveBeenCalledWith(drinks);
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/term-tile.test.tsx`
Expected: FAIL — modules not found. (If jest-expo complains about a new test file location, see memory `jest-expo-new-test-file`: match a sibling test's mocks.)

- [ ] **Step 3: Implement `term-tile.tsx`**

```tsx
import * as React from 'react';
import { Pressable, View, type ViewInstance } from 'react-native';

import { Icon } from '@wcpos/components/icon';
import { Image } from '@wcpos/components/image';
import { Text } from '@wcpos/components/text';
import { VStack } from '@wcpos/components/vstack';

import { useT } from '../../../../../../contexts/translations';
import { termKey, type BrowseTerm } from './browse-source';

import type { Measurable } from '../deal-stack';

// A tile the deal has lifted off the grid: its copy is out on the stage.
const LIFTED = { opacity: 0 };
// The product tile's frame: same margin, border, radius, so term and product tiles share a grid.
const TILE = 'bg-card border-border active:bg-muted m-1 flex-1 overflow-hidden rounded-lg border';

export function termTestId(term: BrowseTerm): string {
	if (term.kind === 'all') return 'browse-all-products';
	return `browse-${termKey(term)}`;
}

function TermBody({ term }: { term: BrowseTerm }) {
	const t = useT();
	if (term.kind === 'all') {
		return (
			<View className="bg-muted aspect-square items-center justify-center gap-2 p-3">
				<Icon name="grid" size="lg" className="text-muted-foreground" />
				<Text className="text-center font-bold" numberOfLines={2}>
					{t('pos_products.browse_all_products')}
				</Text>
			</View>
		);
	}
	if (term.kind === 'shortcut') {
		return (
			<View className="bg-muted aspect-square items-center justify-center gap-1 p-3">
				<Icon name="filter" size="lg" className="text-muted-foreground" />
				<Text className="text-center text-lg font-bold" numberOfLines={2} decodeHtml>
					{term.name}
				</Text>
				<Text className="text-muted-foreground text-center text-xs" numberOfLines={2}>
					{term.description}
				</Text>
			</View>
		);
	}
	if (!term.imageSrc) {
		return (
			<View className="bg-muted aspect-square items-center justify-center gap-1 p-3">
				<Text className="text-center text-lg font-bold" numberOfLines={3} decodeHtml>
					{term.name}
				</Text>
				{/* The storefront's count; a term kept for its POS-only products has none to show. */}
				{term.count > 0 && (
					<Text className="text-muted-foreground text-center">
						{t('pos_products.n_products', { count: term.count })}
					</Text>
				)}
			</View>
		);
	}
	return (
		<>
			<View className="aspect-square" testID={`${termTestId(term)}-image`}>
				<Image source={{ uri: term.imageSrc }} recyclingKey={termKey(term)} className="h-full w-full" />
			</View>
			<VStack className="p-2" space="xs">
				<Text className="font-bold" numberOfLines={2} decodeHtml>
					{term.name}
				</Text>
				{term.count > 0 && (
					<Text className="text-muted-foreground">{t('pos_products.n_products', { count: term.count })}</Text>
				)}
			</VStack>
		</>
	);
}

/** A term as a tile: tapping it opens the term (the tile goes along so the deal can start from it). */
export function TermTile({
	term,
	onPress,
	lifted,
}: {
	term: BrowseTerm;
	onPress: (term: BrowseTerm, target?: Measurable) => void;
	lifted?: boolean;
}) {
	const tile = React.useRef<ViewInstance>(null);
	const label = term.kind === 'all' ? undefined : term.name;
	return (
		<Pressable
			ref={tile}
			onPress={() => onPress(term, tile.current)}
			style={lifted ? LIFTED : undefined}
			accessibilityRole="button"
			accessibilityLabel={label}
			className={TILE}
			testID={termTestId(term)}
		>
			<TermBody term={term} />
		</Pressable>
	);
}

/** The term whose contents are out on the grid: slot 0, and tapping it is the way back. */
export function ParentTermTile({ term, onPress }: { term: BrowseTerm; onPress: () => void }) {
	const t = useT();
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={t('common.back')}
			// `grow`, not `flex-1`: inside a dealt cell the tile takes its row's height.
			className="bg-card border-border active:bg-muted m-1 grow overflow-hidden rounded-lg border"
			testID="browse-parent"
		>
			<View className="relative">
				<TermBody term={term} />
				<View className="bg-card absolute top-2 right-2 size-6 items-center justify-center rounded-full">
					<Icon name="chevronLeft" size="sm" className="text-muted-foreground" />
				</View>
			</View>
		</Pressable>
	);
}
```

If `Icon` has no `grid` or `filter` name, use the closest existing names from `@wcpos/components/icon`'s map (`layoutGrid`, `filter`/`sliders`) — check the map, don't add icons.

- [ ] **Step 4: Implement `term-row.tsx`**

```tsx
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@wcpos/components/icon';
import { Image } from '@wcpos/components/image';
import { Text } from '@wcpos/components/text';

import { useT } from '../../../../../../contexts/translations';
import { termKey, type BrowseTerm } from './browse-source';
import { termTestId } from './term-tile';

/** A term as a row of the products card: thumb, name and count, a chevron at the end. */
export function TermRow({ term, onPress }: { term: BrowseTerm; onPress: (term: BrowseTerm) => void }) {
	const t = useT();
	const name = term.kind === 'all' ? t('pos_products.browse_all_products') : term.name;
	// The storefront's count; a term kept for its POS-only products has none to show.
	const sub =
		term.kind === 'term'
			? term.count > 0 ? t('pos_products.n_products', { count: term.count }) : undefined
			: term.kind === 'shortcut'
				? term.description
				: undefined;
	return (
		<Pressable
			onPress={() => onPress(term)}
			accessibilityRole="button"
			accessibilityLabel={name}
			className="border-border active:bg-muted min-h-row flex-row items-center gap-3 border-b px-2"
			testID={termTestId(term)}
		>
			<View className="bg-muted size-10 items-center justify-center overflow-hidden rounded-lg">
				{term.kind === 'term' && term.imageSrc ? (
					<Image source={{ uri: term.imageSrc }} recyclingKey={termKey(term)} className="h-full w-full" />
				) : term.kind === 'all' ? (
					<Icon name="grid" className="text-muted-foreground" />
				) : term.kind === 'shortcut' ? (
					<Icon name="filter" className="text-muted-foreground" />
				) : (
					<Text className="text-muted-foreground font-bold">{term.name.slice(0, 1)}</Text>
				)}
			</View>
			<View className="flex-1 gap-0.5">
				<Text numberOfLines={1} decodeHtml>
					{name}
				</Text>
				{sub ? (
					<Text className="text-muted-foreground text-xs" numberOfLines={1}>
						{sub}
					</Text>
				) : null}
			</View>
			<Icon name="chevronRight" className="text-muted-foreground" />
		</Pressable>
	);
}
```

`min-h-row` is the row height class the `DataTableRow` uses (see `components/data-table/v2/rows`); if the class is named differently there, use that name — the row must be the same height as a product row.

- [ ] **Step 5: Run the tests to verify they pass**

Run the Step 2 command. Expected: PASS, 9 tests.

- [ ] **Step 6: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/screens/main/pos/products/v2/browse/term-tile.tsx packages/core/src/screens/main/pos/products/v2/browse/term-row.tsx packages/core/src/screens/main/pos/products/v2/browse/term-tile.test.tsx
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): term tile, parent term tile and term row"
```

### Task 5: Root grid and root table

**Files:**
- Create: `packages/core/src/screens/main/pos/products/v2/browse/term-grid.tsx` (only `BrowseRootGrid` in this slice)
- Create: `packages/core/src/screens/main/pos/products/v2/browse/term-table.tsx` (only `BrowseRootTable` in this slice)
- Test: `packages/core/src/screens/main/pos/products/v2/browse/browse-root.test.tsx`

**Interfaces:**
- Consumes: `TermTile`, `TermRow` (Task 4); `BrowseTerm`; `DealStagedContext` from `../deal-stack`; `gridColumns` from ui settings.
- Produces:
  ```tsx
  export function BrowseRootGrid({ terms, onOpen }: { terms: BrowseTerm[]; onOpen: (term: BrowseTerm, target?: Measurable) => void }): JSX.Element; // testID browse-root
  export function BrowseRootTable({ terms, onOpen }: { terms: BrowseTerm[]; onOpen: (term: BrowseTerm) => void }): JSX.Element; // testID browse-root
  ```
  Both render `{kind:'all'}` first, then `terms`.

- [ ] **Step 1: Write the failing test**

```tsx
// browse-root.test.tsx
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { BrowseRootGrid } from './term-grid';
import { BrowseRootTable } from './term-table';

jest.mock('../../../../../../contexts/translations', () => ({
	useT: () => (key: string, vars?: { count?: number }) => (vars?.count !== undefined ? `${vars.count} ${key}` : key),
}));
jest.mock('../../../../contexts/ui-settings', () => ({
	useUISettings: () => ({ uiSettings: { gridColumns: 2 } }),
}));
jest.mock('@wcpos/query', () => ({ ...jest.requireActual('@wcpos/query'), useDocField: (doc: Record<string, unknown>, read: (value: Record<string, unknown>) => unknown) => read(doc) }));

const terms = [
	{ kind: 'term' as const, id: 1, name: 'Drinks', count: 12 },
	{ kind: 'term' as const, id: 2, name: 'Snacks', count: 4 },
	{ kind: 'term' as const, id: 3, name: 'Merch', count: 3 },
];

it('the root grid shows All products first, then the terms in order, on the grid columns', () => {
	const onOpen = jest.fn();
	render(<BrowseRootGrid terms={terms} onOpen={onOpen} />);
	const root = screen.getByTestId('browse-root');
	const ids = root.findAllByProps({ accessibilityRole: 'button' }).map((node) => node.props.testID).filter(Boolean);
	expect(ids).toEqual(['browse-all-products', 'browse-term-1', 'browse-term-2', 'browse-term-3']);
	fireEvent.press(screen.getByTestId('browse-term-2'));
	expect(onOpen).toHaveBeenCalledWith(terms[1], expect.anything());
});

it('the root table shows All products first, then the terms in order', () => {
	const onOpen = jest.fn();
	render(<BrowseRootTable terms={terms} onOpen={onOpen} />);
	const ids = screen.getByTestId('browse-root').findAllByProps({ accessibilityRole: 'button' }).map((node) => node.props.testID).filter(Boolean);
	expect(ids).toEqual(['browse-all-products', 'browse-term-1', 'browse-term-2', 'browse-term-3']);
	fireEvent.press(screen.getByTestId('browse-all-products'));
	expect(onOpen).toHaveBeenCalledWith({ kind: 'all' });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/browse-root.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `BrowseRootGrid` in `term-grid.tsx`**

```tsx
import * as React from 'react';
import { View } from 'react-native';

import * as VirtualizedList from '@wcpos/components/virtualized-list';
import { useDocField } from '@wcpos/query';

import { useUISettings } from '../../../../contexts/ui-settings';
import { DealStagedContext, type Measurable } from '../deal-stack';
import { termKey, type BrowseTerm } from './browse-source';
import { TermTile } from './term-tile';

const ALL: BrowseTerm = { kind: 'all' };

/** The term set at the root of a browse mode: All products first, then the terms, on the grid's columns. */
export function BrowseRootGrid({
	terms,
	onOpen,
}: {
	terms: BrowseTerm[];
	onOpen: (term: BrowseTerm, target?: Measurable) => void;
}) {
	const { uiSettings } = useUISettings('pos-products');
	const columns = useDocField(uiSettings, (value) => value.gridColumns);
	// The term whose copy is out on the stage steps aside, as a dealt product tile does.
	// The stage stages the path entry itself (`{ kind: 'term', term, target }`, Task 8/12).
	const staged = React.useContext(DealStagedContext) as { kind?: string; term?: BrowseTerm } | null;
	const lifted = staged?.kind === 'term' && staged.term ? termKey(staged.term) : null;
	const cells = [ALL, ...terms];
	const rows = Array.from({ length: Math.ceil(cells.length / columns) }, (_, row) =>
		cells.slice(row * columns, row * columns + columns)
	);
	return (
		<View className="flex-1" testID="browse-root">
			<VirtualizedList.Root style={{ flex: 1 }}>
				<VirtualizedList.List
					data={rows}
					estimatedItemSize={200}
					renderItem={({ item: row }) => (
						<VirtualizedList.Item>
							<View className="flex-row">
								{row.map((term) => (
									<TermTile key={termKey(term)} term={term} onPress={onOpen} lifted={lifted === termKey(term)} />
								))}
								{Array.from({ length: columns - row.length }).map((_, i) => (
									<View key={`spacer-${i}`} className="m-1 flex-1" />
								))}
							</View>
						</VirtualizedList.Item>
					)}
				/>
			</VirtualizedList.Root>
		</View>
	);
}
```

- [ ] **Step 4: Implement `BrowseRootTable` in `term-table.tsx`**

```tsx
import * as React from 'react';
import { View } from 'react-native';

import * as VirtualizedList from '@wcpos/components/virtualized-list';

import { termKey, type BrowseTerm } from './browse-source';
import { TermRow } from './term-row';

const ALL: BrowseTerm = { kind: 'all' };

/** The term set at the root of a browse mode as rows: All products first, then the terms. */
export function BrowseRootTable({ terms, onOpen }: { terms: BrowseTerm[]; onOpen: (term: BrowseTerm) => void }) {
	const rows = [ALL, ...terms];
	return (
		<View className="flex-1" testID="browse-root">
			<VirtualizedList.Root style={{ flex: 1 }}>
				<VirtualizedList.List
					data={rows}
					estimatedItemSize={60}
					keyExtractor={(term) => termKey(term)}
					renderItem={({ item }) => (
						<VirtualizedList.Item>
							<TermRow term={item} onPress={onOpen} />
						</VirtualizedList.Item>
					)}
				/>
			</VirtualizedList.Root>
		</View>
	);
}
```

Check `VirtualizedList.List`'s prop names against `@wcpos/components/virtualized-list` (it wraps FlashList: `data`, `renderItem`, `estimatedItemSize`, `keyExtractor` exist in `ProductGrid`'s usage) and use exactly those.

- [ ] **Step 5: Run the tests to verify they pass**

Run the Step 2 command. Expected: PASS, 2 tests. (If `findAllByProps` is awkward with the virtualized list in jest, assert with `screen.getAllByRole('button')` order instead — the assertion is the ORDER and the All-first rule.)

- [ ] **Step 6: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/screens/main/pos/products/v2/browse/term-grid.tsx packages/core/src/screens/main/pos/products/v2/browse/term-table.tsx packages/core/src/screens/main/pos/products/v2/browse/browse-root.test.tsx
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): browse root grid and table — All products first, then the terms"
```

### Task 6: Settings form row and the stage switch (root only)

**Files:**
- Modify: `packages/core/src/screens/main/pos/products/ui-settings-form.tsx:49-60` (schema) and after the `variationsStyle` `FormField` (~line 150)
- Modify: `packages/core/src/screens/main/pos/products/v2/index.tsx:419-438`
- Create: `packages/core/src/screens/main/pos/products/v2/browse/browse-stage.tsx` (root-only version; Task 8 adds the drill)
- Test: `packages/core/src/screens/main/pos/products/ui-settings-form.test.tsx` (extend), `packages/core/src/screens/main/pos/products/v2/browse/browse-stage.test.tsx`

**Interfaces:**
- Consumes: `readBrowseBy`, `BROWSE_BY` (Task 2); `useBrowseTerms` (Task 3); `BrowseRootGrid`/`BrowseRootTable` (Task 5).
- Produces:
  ```tsx
  export function BrowseStage(props: {
    source: Exclude<BrowseBy, 'all'>;
    viewMode: 'grid' | 'table';
    /** Today's products element (grid or table), rendered under All products and inside terms. */
    products: React.ReactNode;
    // Task 8 adds: drill plumbing
  }): JSX.Element;
  ```

- [ ] **Step 1: Extend the settings-form test**

Open `ui-settings-form.test.tsx`, find how it renders the form and presses a segmented control (the `variationsStyle` case), and add:

```tsx
it('offers Browse by with All products first and dims a source with nothing to show', async () => {
	// Render with the test's existing providers; the terms hook is mocked to an empty brands source.
	jest.spyOn(browseTerms, 'useBrowseCounts').mockReturnValue({ categories: 5, tags: undefined, brands: 0, shortcuts: 2 });
	renderForm();
	expect(screen.getByTestId('ui-settings-browse-by-all')).toBeTruthy();
	expect(screen.getByTestId('ui-settings-browse-by-brands')).toHaveAccessibilityState({ disabled: true });
	expect(screen.getByText('pos_products.no_brands_yet')).toBeTruthy();
	fireEvent.press(screen.getByTestId('ui-settings-browse-by-categories'));
	await waitFor(() => expect(lastSaved().browseBy).toBe('categories'));
});
```

`renderForm` / `lastSaved` are whatever that test file already uses to mount the form and observe the saved document — reuse them under their real names. Add to `use-browse-terms.ts`:

```ts
/**
 * How many terms each source would show — for the settings row's count and its dimming.
 * `undefined` until the source's collection has answered: a source that is still loading is
 * not an empty one, and the dialog can open before the browse bindings have (All products).
 */
export function useBrowseCounts(): Record<Exclude<BrowseBy, 'all'>, number | undefined> {
	const categories = useTaxonomyTerms('categories');
	const tags = useTaxonomyTerms('tags');
	const brands = useTaxonomyTerms('brands');
	const { uiSettings } = useUISettings('pos-products');
	const items = normalizeFilterBar(useDocField(uiSettings, (value) => value.filterBar));
	const answered = (terms: BrowseTerms) => (terms.all === undefined ? undefined : terms.rootsOf().length);
	return {
		categories: answered(categories),
		tags: answered(tags),
		brands: answered(brands),
		shortcuts: items.filter((item) => item.type === 'quick').length,
	};
}
```

In the form test, assert the three states: Categories enabled with `5 categories`; Tags enabled with no count text and not dimmed (unanswered: `counts.tags === undefined`); Brands dimmed with `No brands yet`.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/ui-settings-form.test.tsx`
Expected: FAIL — no `ui-settings-browse-by-all`.

- [ ] **Step 3: Add the schema entry and the form row**

In the zod `schema` add after `variationsStyle`:

```ts
	browseBy: z.enum(['all', 'categories', 'tags', 'brands', 'shortcuts']).optional(),
```

After the `variationsStyle` `FormField` add:

```tsx
					<FormField
						control={form.control}
						name="browseBy"
						render={({ field: { value, onChange } }) => (
							<BrowseByField value={readBrowseBy(value)} onChange={onChange} />
						)}
					/>
```

and in the same file (below the form) the field:

```tsx
function BrowseByField({ value, onChange }: { value: BrowseBy; onChange: (value: BrowseBy) => void }) {
	const t = useT();
	const counts = useBrowseCounts();
	const rows: { value: BrowseBy; label: string; count?: string; empty?: string }[] = [
		{ value: 'all', label: t('pos_products.browse_all_products') },
		{ value: 'categories', label: t('pos_products.browse_categories'), count: t('pos_products.n_categories', { count: counts.categories }), empty: t('pos_products.no_categories_yet') },
		{ value: 'tags', label: t('pos_products.browse_tags'), count: t('pos_products.n_tags', { count: counts.tags }), empty: t('pos_products.no_tags_yet') },
		{ value: 'brands', label: t('pos_products.browse_brands'), count: t('pos_products.n_brands', { count: counts.brands }), empty: t('pos_products.no_brands_yet') },
		{ value: 'shortcuts', label: t('pos_products.browse_shortcuts'), count: t('pos_products.n_quick_filters', { count: counts.shortcuts }), empty: t('pos_products.no_shortcuts_yet') },
	];
	return (
		<View className="gap-1 px-1">
			<Text>{t('pos_products.browse_by')}</Text>
			<View className="border-border overflow-hidden rounded-lg border">
				{rows.map((row) => {
					// Dimmed only once the source has answered empty; a loading source is still a choice.
					const count = row.value === 'all' ? undefined : counts[row.value];
					const disabled = count === 0;
					const on = row.value === value;
					return (
						<Pressable
							key={row.value}
							disabled={disabled}
							accessibilityRole="radio"
							accessibilityState={{ checked: on, disabled }}
							onPress={() => onChange(row.value)}
							className={`border-border active:bg-muted min-h-ctl flex-row items-center gap-2 border-b px-3 last:border-b-0 ${on ? 'bg-muted' : ''}`}
							testID={`ui-settings-browse-by-${row.value}`}
						>
							<Icon name="check" className={on ? 'text-primary' : 'opacity-0'} />
							<Text className={`flex-1 ${disabled ? 'text-muted-foreground' : ''}`}>{row.label}</Text>
							<Text className="text-muted-foreground text-xs">{disabled ? row.empty : count === undefined ? '' : row.count}</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
```

Imports to add at the top of the form file: `Pressable`, `Icon`, `readBrowseBy`, `type BrowseBy` from `./v2/browse/browse-source`, `useBrowseCounts` from `./v2/browse/use-browse-terms`. `min-h-ctl` is the 44 pt control height class used by the register controls (`CODING_STANDARDS` § Design rule 2); if Uniwind's class is named differently in `global.css`, use that name. The rows are a radio list, not a `SegmentedControl`: five labels in German do not fit a segment row (rule 8).

- [ ] **Step 4: Write the failing stage test**

```tsx
// browse-stage.test.tsx
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BrowseStage } from './browse-stage';

jest.mock('./use-browse-terms', () => ({
	useBrowseTerms: () => ({
		all: [{ kind: 'term', id: 1, name: 'Drinks', count: 12 }],
		rootsOf: () => [{ kind: 'term', id: 1, name: 'Drinks', count: 12 }],
		childrenOf: () => [],
		idsFor: () => [1],
		quickFilterFor: () => undefined,
	}),
}));
jest.mock('../../../../../../contexts/translations', () => ({ useT: () => (key: string) => key }));
jest.mock('../../../../contexts/ui-settings', () => ({ useUISettings: () => ({ uiSettings: { gridColumns: 2 } }) }));
jest.mock('@wcpos/query', () => ({ ...jest.requireActual('@wcpos/query'), useDocField: (doc: Record<string, unknown>, read: (value: Record<string, unknown>) => unknown) => read(doc) }));
let search = '';
jest.mock('../../../../../../query', () => ({
	useQueryState: () => ({ search, filters: {}, sort: { field: 'name', direction: 'asc' } }),
	useQueryStateActions: () => ({ setFilter: jest.fn(), clearFilter: jest.fn(), resetFilters: jest.fn(), clearSearch: jest.fn(), setSearch: jest.fn(), setSort: jest.fn() }),
}));

it('opens on the root term set, not the products, in grid and table', () => {
	const renderProducts = () => <Text testID="products">products</Text>;
	const { rerender } = render(<BrowseStage source="categories" viewMode="grid" renderProducts={renderProducts} />);
	expect(screen.getByTestId('browse-root')).toBeTruthy();
	expect(screen.getByTestId('browse-term-1')).toBeTruthy();
	expect(screen.queryByTestId('products')).toBeNull();
	rerender(<BrowseStage source="categories" viewMode="table" renderProducts={renderProducts} />);
	expect(screen.getByTestId('browse-root')).toBeTruthy();
	expect(screen.queryByTestId('products')).toBeNull();
});

it('a search displaces the term set with the catalogue-wide products', () => {
	search = 'lat';
	render(<BrowseStage source="categories" viewMode="grid" renderProducts={() => <Text testID="products">products</Text>} />);
	expect(screen.getByTestId('products')).toBeTruthy();
	expect(screen.queryByTestId('browse-root')).toBeNull();
	search = '';
});
```

- [ ] **Step 5: Implement the root-only `BrowseStage`**

```tsx
// browse-stage.tsx
import * as React from 'react';

import { type BrowseBy } from './browse-source';
import { BrowseRootGrid } from './term-grid';
import { BrowseRootTable } from './term-table';
import { useBrowseTerms } from './use-browse-terms';

export type BrowseStageProps = {
	source: Exclude<BrowseBy, 'all'>;
	viewMode: 'grid' | 'table';
	/**
	 * Today's products grid or table, wired to the given drill handler. The stage shows it when
	 * a search has displaced the term set (Task 12 drills from it into the stage's own drill).
	 */
	renderProducts: (onDrill: (record: EngineRecord<'products'> | null, target?: Measurable) => void) => React.ReactNode;
};

/**
 * The products stage when a browse source is on: the term set at the root, each term dealing
 * (grid) or pushing (table) its contents, products inside. Task 8 adds the levels; here the
 * root alone, so the setting has something to show.
 */
export function BrowseStage({ source, viewMode, renderProducts }: BrowseStageProps) {
	const terms = useBrowseTerms(source);
	const { search } = useQueryState<'products'>();
	const roots = terms.rootsOf();
	const open = () => {};
	const noDrill = () => {};
	// A search spans the catalogue, not the term set: the products show, with no crumb (spec,
	// "Search"). The filter bar's own clear brings the term set back.
	if (search !== '') return <>{renderProducts(noDrill)}</>;
	return viewMode === 'grid' ? (
		<BrowseRootGrid terms={roots} onOpen={open} />
	) : (
		<BrowseRootTable terms={roots} onOpen={open} />
	);
}
```

with `import { useQueryState } from '../../../../../../query';`, `import type { EngineRecord } from '@wcpos/query';` and `import type { Measurable } from '../deal-stack';` among the imports.

- [ ] **Step 6: Mount it in `index.tsx`**

In `POSProductsContent`, after `const variationsStyle = …` add:

```tsx
	const browseBy = readBrowseBy(useDocField(uiSettings, (value) => value.browseBy));
```

Then make the products element a function of its drill handler. Today `const products = (<Suspense …>…</Suspense>)` bakes `setDrilled` in (through `VariableTile` for the grid and `onDrill={setDrilled}` for the table). Extract it, in the same file, as a component so the tile component identity stays stable per handler exactly as it is today:

```tsx
/** Today's products grid or table, drilling variable products through `onDrill`. */
function ProductsView({ onDrill, ...rest }: { onDrill: (record: EngineRecord<'products'> | null, target?: Measurable) => void; /* every value the element reads today: viewMode, binding, tableActions, noDataMessage, loading, state.sort, variationsStyle, cellsForRow, tableConfig */ }) {
	const VariableTile = React.useCallback(
		(props: React.ComponentProps<typeof ProductTile>) => (
			<VariableProductTile {...props} variationsStyle={rest.variationsStyle} onDrill={onDrill} />
		),
		[rest.variationsStyle, onDrill]
	);
	return ( /* the existing `products` JSX, with `VariableTile` above and `onDrill={onDrill}` on VariableProductRow */ );
}
```

and in `POSProductsContent`: `const renderProducts = React.useCallback((onDrill) => <ProductsView onDrill={onDrill} viewMode={viewMode} … />, [viewMode, binding, tableActions, noDataMessage, loading, state.sort, variationsStyle, tableConfig]);` then `const products = renderProducts(setDrilled);` so the `all` mode is unchanged. Move the `VariableTile` `useCallback` out of `POSProductsContent` into `ProductsView` (it is the same code). Run `index.test.tsx` after: it must pass unchanged.

and replace the block from `{/* Tiles are dealt out of the tile that was tapped; rows slide in as a pane. */}` through the closing `)}` of the grid/table conditional (inside `<ErrorBoundary>` in `POSProductsContent`; line numbers drift, anchor on the text) with:

```tsx
								{browseBy !== 'all' ? (
									<BrowseStage source={browseBy} viewMode={viewMode} renderProducts={renderProducts} />
								) : viewMode === 'grid' ? (
									<DealStack
										testID="products-pane-stack"
										detail={drilled}
										target={drill?.target}
										renderDetail={renderDrillIn}
									>
										{products}
									</DealStack>
								) : (
									<PaneStack
										testID="products-pane-stack"
										detail={drilled}
										paneClassName="bg-background"
										renderDetail={renderDrillIn}
									>
										{products}
									</PaneStack>
								)}
```

Imports: `import { BrowseStage } from './browse/browse-stage';` and `import { readBrowseBy } from './browse/browse-source';`.

- [ ] **Step 7: Run the tests and typecheck**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse src/screens/main/pos/products/ui-settings-form.test.tsx src/screens/main/pos/products/v2/index.test.tsx` then `pnpm typecheck --force`.
Expected: PASS; typecheck clean. `index.test.tsx` must still pass unchanged — the default `browseBy` is `'all'`, so today's path is untouched.

- [ ] **Step 8: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add -A packages/core/src/screens/main/pos/products
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): Browse by setting row and the root term set on the products stage"
```

### Task 7: Slice 1 PR

- [ ] **Step 1: Run the whole products suite once, capped**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products src/screens/main/contexts/ui-settings src/query` and `pnpm typecheck --force`. All green, or fix before continuing.

- [ ] **Step 2: Fresh-session review before opening** (the `next` lane's gate — memory `independent-review-status-gates-next`): run `/codex-review` on the branch diff against `origin/next`, fix what it finds, re-run the suites above.

- [ ] **Step 3: Push and open the PR against `next`**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by push -u origin feat/pos-browse-by
```

Then `gh pr create --base next` with title `feat(pos): Browse by — setting and root term tiles/rows (slice 1 of roadmap#392)` and a body that names the spec (`wcpos/roadmap#403`), says the default is `all` so nothing changes for existing devices, and lists the test commands run. The PR owner babysits it to merge (`/fix`).

---

## Slice 2 — the drill-in: nested deal and pane, crumb, descendants, display type, search reset

### Task 8: `use-browse-path.ts`

**Files:**
- Create: `packages/core/src/screens/main/pos/products/v2/browse/use-browse-path.ts`
- Test: `packages/core/src/screens/main/pos/products/v2/browse/use-browse-path.test.tsx`

**Interfaces:**
- Consumes: `useQueryState`, `useQueryStateActions` from `../../../../../../query` (the root products provider); `isQuickFilterActive`, `quickFilterToQueryPatch` from `../../filter-bar/apply-quick-filter`; `getPOSProductSort` from `../../pos-product-sort`; `BrowseTerms` (Task 3); `taxonomyField` below.
- Produces:
  ```ts
  export type PathEntry = { kind: 'term'; term: BrowseTerm; target?: Measurable };   // `kind` so a DealStack's staged detail can be told from a product drill
  export type BrowsePath = {
    /** The live path: entries whose projection the root query still carries. [] at the root. */
    path: PathEntry[];
    enter: (term: BrowseTerm, target?: Measurable) => void;  // push (and project)
    backTo: (depth: number) => void;                          // keep path[0..depth), re-project
    root: () => void;                                          // backTo(0)
  };
  export function taxonomyField(source: BrowseBy): 'categories' | 'tags' | 'brands' | null;
  export function useBrowsePath(source: Exclude<BrowseBy, 'all'>, terms: BrowseTerms): BrowsePath;
  ```
  Projection rules (the guard is what makes "search clears the path" and "a pill press clears the path" fall out):
  - taxonomy term at the deepest level → `setFilter(field, terms.idsFor(term))`; path entries are shown only while `state.filters[field]` equals that id set (as a set) and `state.search === ''`.
  - `{kind:'all'}` → `clearFilter(field)`; shown while `state.filters[field]` is empty/undefined and `state.search === ''`.
  - shortcut → the chip's exact sequence: `resetFilters(); clearSearch(); setFilter(each patch field); if (patch.search) setSearch(patch.search); setSort(quickFilter.sort ?? settingsSort)`; shown while `isQuickFilterActive(quickFilter, state, resetState)` (a shortcut's own `search` condition is allowed, so the `search === ''` rule does not apply to it).
  - `backTo(depth)` re-projects the new deepest entry (or clears the field when the path empties).
  - **The projection belongs to the path that made it.** The hook records what it put into the query (`projected`: the taxonomy field and id set, or the shortcut's quick filter) and `unproject()` undoes exactly that, and only what is still there: a taxonomy field still equal to the projected id set is cleared; a shortcut's patch fields still equal to the patch are cleared one by one, its `search` cleared if still the patch's, its sort restored to the settings sort if still the quick filter's. Leaving a shortcut level (`backTo(0)`), a dropped path (search, pill), a source change (`source` prop moves while a path is stored) and unmount (Browse by → All products) all go through `unproject()` — so the next source, or All products, never starts restricted by the last one, and a search typed over a shortcut spans the catalogue (the search survives; the patch does not).

- [ ] **Step 1: Write the failing test**

Use a tiny fake store so the hook is tested against real state transitions. The `../../../../../../query` module exports `useQueryState` and `useQueryStateActions` reading React context; mock the module with an in-memory store:

```tsx
// use-browse-path.test.tsx
import * as React from 'react';
import { act, renderHook } from '@testing-library/react-native';

let state = { search: '', filters: {} as Record<string, unknown>, sort: { field: 'name', direction: 'asc' } };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const actions = {
	setFilter: jest.fn((field: string, value: unknown) => { state = { ...state, filters: { ...state.filters, [field]: value } }; emit(); }),
	clearFilter: jest.fn((field: string) => { const { [field]: _, ...rest } = state.filters; state = { ...state, filters: rest }; emit(); }),
	resetFilters: jest.fn(() => { state = { ...state, filters: { status: 'publish' } }; emit(); }),
	clearSearch: jest.fn(() => { state = { ...state, search: '' }; emit(); }),
	setSearch: jest.fn((search: string) => { state = { ...state, search }; emit(); }),
	setSort: jest.fn((field: string, direction: 'asc' | 'desc') => { state = { ...state, sort: { field, direction } }; emit(); }),
};
jest.mock('../../../../../../query', () => ({
	useQueryState: () => React.useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state),
	useQueryStateActions: () => actions,
}));
jest.mock('../../../../contexts/ui-settings', () => ({ useUISettings: () => ({ uiSettings: { sortBy: 'name', sortDirection: 'asc', showOutOfStock: true } }) }));
jest.mock('@wcpos/query', () => ({ ...jest.requireActual('@wcpos/query'), useDocField: (doc: Record<string, unknown>, read: (value: Record<string, unknown>) => unknown) => read(doc) }));

import { useBrowsePath } from './use-browse-path';

const drinks = { kind: 'term' as const, id: 1, name: 'Drinks', count: 12 };
const hot = { kind: 'term' as const, id: 2, name: 'Hot', count: 6, parent: 1 };
const breakfast = { kind: 'shortcut' as const, id: 'qf-1', name: 'Breakfast', description: '' };
const quickFilter = { type: 'quick', id: 'qf-1', label: 'Breakfast', conditions: [{ field: 'categories', value: [3] }] };
const terms = {
	all: [drinks, hot],
	rootsOf: () => [drinks],
	childrenOf: () => [hot],
	idsFor: (term: { kind: string; id?: number }) => (term.id === 1 ? [1, 2] : term.id === 2 ? [2] : []),
	quickFilterFor: (term: { kind: string }) => (term.kind === 'shortcut' ? quickFilter : undefined),
};

beforeEach(() => {
	state = { search: '', filters: { status: 'publish' }, sort: { field: 'name', direction: 'asc' } };
	jest.clearAllMocks();
});

it('entering a term projects its id set and the path shows it; entering a child narrows', () => {
	const { result } = renderHook(() => useBrowsePath('categories', terms as never));
	act(() => result.current.enter(drinks));
	expect(actions.setFilter).toHaveBeenLastCalledWith('categories', [1, 2]);
	expect(result.current.path.map((entry) => entry.term)).toEqual([drinks]);
	act(() => result.current.enter(hot));
	expect(actions.setFilter).toHaveBeenLastCalledWith('categories', [2]);
	expect(result.current.path.map((entry) => entry.term)).toEqual([drinks, hot]);
});

it('backTo re-projects the ancestor; root clears the field', () => {
	const { result } = renderHook(() => useBrowsePath('categories', terms as never));
	act(() => { result.current.enter(drinks); result.current.enter(hot); });
	act(() => result.current.backTo(1));
	expect(actions.setFilter).toHaveBeenLastCalledWith('categories', [1, 2]);
	expect(result.current.path.length).toBe(1);
	act(() => result.current.root());
	expect(actions.clearFilter).toHaveBeenLastCalledWith('categories');
	expect(result.current.path).toEqual([]);
});

it('a search drops the path; clearing the search shows the root again, not the term', () => {
	const { result } = renderHook(() => useBrowsePath('categories', terms as never));
	act(() => result.current.enter(drinks));
	act(() => actions.setSearch('lat'));
	expect(result.current.path).toEqual([]);
	expect(actions.clearFilter).toHaveBeenLastCalledWith('categories');
	act(() => actions.clearSearch());
	expect(result.current.path).toEqual([]);
});

it('a filter-bar change to the taxonomy drops the path', () => {
	const { result } = renderHook(() => useBrowsePath('categories', terms as never));
	act(() => result.current.enter(drinks));
	act(() => actions.setFilter('categories', [9]));
	expect(result.current.path).toEqual([]);
});

it('All products clears a pill on the source taxonomy so it opens, and is shown while the field stays clear', () => {
	state = { ...state, filters: { ...state.filters, categories: [9] } };
	const { result } = renderHook(() => useBrowsePath('categories', terms as never));
	act(() => result.current.enter({ kind: 'all' }));
	expect(actions.clearFilter).toHaveBeenLastCalledWith('categories');
	expect(result.current.path.map((entry) => entry.term)).toEqual([{ kind: 'all' }]);
	act(() => actions.setFilter('categories', [9]));
	expect(result.current.path).toEqual([]);
});

it('a shortcut applies the quick filter exactly as its chip does and is shown while active', () => {
	const { result } = renderHook(() => useBrowsePath('shortcuts', terms as never));
	act(() => result.current.enter(breakfast));
	expect(actions.resetFilters).toHaveBeenCalled();
	expect(actions.clearSearch).toHaveBeenCalled();
	expect(actions.setFilter).toHaveBeenLastCalledWith('categories', [3]);
	expect(actions.setSort).toHaveBeenLastCalledWith('name', 'asc');
	expect(result.current.path.map((entry) => entry.term)).toEqual([breakfast]);
	act(() => actions.setFilter('on_sale', true));
	expect(result.current.path).toEqual([]);
	// The pill the cashier pressed stays; the shortcut's own patch, still there, goes.
	expect(state.filters).toEqual({ status: 'publish', on_sale: true });
});

it('leaving a shortcut level takes its patch back out; a search typed over it keeps the search and drops the patch', () => {
	const { result } = renderHook(() => useBrowsePath('shortcuts', terms as never));
	act(() => result.current.enter(breakfast));
	act(() => result.current.root());
	expect(state.filters).toEqual({ status: 'publish' });
	act(() => result.current.enter(breakfast));
	act(() => actions.setSearch('lat'));
	expect(result.current.path).toEqual([]);
	expect(state.search).toBe('lat');
	expect(state.filters).toEqual({ status: 'publish' });
});

it('changing the source clears the projection the old source made', () => {
	const { result, rerender } = renderHook(({ source }) => useBrowsePath(source, terms as never), {
		initialProps: { source: 'categories' as 'categories' | 'tags' },
	});
	act(() => result.current.enter(drinks));
	expect(state.filters.categories).toEqual([1, 2]);
	rerender({ source: 'tags' });
	expect(state.filters.categories).toBeUndefined();
	expect(result.current.path).toEqual([]);
});

it('unmounting clears the projection (Browse by → All products)', () => {
	const { result, unmount } = renderHook(() => useBrowsePath('categories', terms as never));
	act(() => result.current.enter(drinks));
	unmount();
	expect(state.filters.categories).toBeUndefined();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/use-browse-path.test.tsx`
Expected: FAIL — module not found. (The fake store's `clearFilter` deletes the key, as written, so `toBeUndefined` and the `toEqual` on `filters` hold.)

- [ ] **Step 3: Implement**

```ts
// use-browse-path.ts
import * as React from 'react';

import { useDocField } from '@wcpos/query';

import isEqual from 'lodash/isEqual';

import { useQueryState, useQueryStateActions } from '../../../../../../query';
import { useUISettings } from '../../../../contexts/ui-settings';
import { isQuickFilterActive, quickFilterToQueryPatch } from '../../filter-bar/apply-quick-filter';
import { getPOSProductSort } from '../../pos-product-sort';
import { type BrowseBy, type BrowseTerm } from './browse-source';

import type { Measurable } from '../deal-stack';
import type { FiltersOf } from '../../../../../../query/query-state-types';
import type { QuickFilter } from '../../filter-bar/filter-bar-layout';
import type { BrowseTerms } from './use-browse-terms';

export type PathEntry = { kind: 'term'; term: BrowseTerm; target?: Measurable };
export type BrowsePath = {
	path: PathEntry[];
	enter: (term: BrowseTerm, target?: Measurable) => void;
	backTo: (depth: number) => void;
	root: () => void;
};

type TaxonomyField = 'categories' | 'tags' | 'brands';
/** What the path put into the query, so that exactly that can be taken back out. */
type Projection =
	| { kind: 'taxonomy'; field: TaxonomyField; ids: number[] }
	| { kind: 'shortcut'; quickFilter: QuickFilter };

export function taxonomyField(source: BrowseBy): 'categories' | 'tags' | 'brands' | null {
	return source === 'categories' || source === 'tags' || source === 'brands' ? source : null;
}

const sameSet = (left: unknown, right: number[]) =>
	Array.isArray(left) && left.length === right.length && right.every((id) => left.includes(id));
const sameSort = (left: { field: string; direction: string }, right: { field: string; direction: string }) =>
	left.field === right.field && left.direction === right.direction;

/**
 * The browse path and its projection into the ONE products query. The path is state, but what
 * is SHOWN is the path only while the query still carries what the path put there: a search,
 * a pill press, Clear filters, or a quick-filter chip all move the query, and the path falls
 * away on the same render — the guard the variations drill-in already applies to search.
 */
export function useBrowsePath(source: Exclude<BrowseBy, 'all'>, terms: BrowseTerms): BrowsePath {
	const state = useQueryState<'products'>();
	const actions = useQueryStateActions<'products'>();
	const { uiSettings } = useUISettings('pos-products');
	// Exactly what the chip reads (filter-bar.tsx QuickChip), so a shortcut is active for the
	// path precisely when its chip lights.
	const settingsSort = useDocField(uiSettings, (value) => getPOSProductSort(value.sortBy, value.sortDirection));
	const showOutOfStock = useDocField(uiSettings, (value) => value.showOutOfStock);
	const field = taxonomyField(source);
	const [stored, setStored] = React.useState<PathEntry[]>([]);
	const resetState = React.useMemo(
		() => ({
			filters: {
				categories: [],
				tags: [],
				brands: [],
				status: 'publish' as const,
				...(showOutOfStock ? {} : { stock_status: 'instock' as const }),
			},
			sort: settingsSort,
		}),
		[showOutOfStock, settingsSort]
	);

	// What the stored path has put into the query. A ref, not state: it is read by cleanups that
	// run after the render that moved the source or unmounted the stage.
	const projected = React.useRef<Projection | null>(null);
	const latest = React.useRef({ state, actions, settingsSort });
	latest.current = { state, actions, settingsSort };

	// Take back out exactly what the path put in, and only what is still there: a pill the
	// cashier pressed inside a level is theirs and stays.
	const unproject = React.useCallback(() => {
		const current = projected.current;
		projected.current = null;
		if (!current) return;
		const { state: now, actions: act, settingsSort: baseline } = latest.current;
		if (current.kind === 'taxonomy') {
			if (sameSet(now.filters[current.field], current.ids)) act.clearFilter(current.field);
			return;
		}
		const patch = quickFilterToQueryPatch(current.quickFilter);
		for (const [key, value] of Object.entries(patch.filters))
			if (isEqual(now.filters[key as keyof FiltersOf<'products'>], value))
				act.clearFilter(key as keyof FiltersOf<'products'>);
		if (patch.search && now.search === patch.search) act.clearSearch();
		if (current.quickFilter.sort && sameSort(now.sort, current.quickFilter.sort))
			act.setSort(baseline.field, baseline.direction);
	}, []);

	const project = React.useCallback(
		(entry: PathEntry | undefined) => {
			unproject();
			if (!entry) return;
			if (entry.term.kind === 'all') {
				// The whole catalogue: a pill on the source's own taxonomy would contradict the tile
				// the cashier just tapped, so it goes too (it is not restored — All products means
				// all). Nothing is recorded: the level is live while the field stays empty.
				if (field && (latest.current.state.filters[field] as number[] | undefined)?.length)
					actions.clearFilter(field);
				return;
			}
			const { term } = entry;
			if (term.kind === 'term' && field) {
				const ids = terms.idsFor(term);
				actions.setFilter(field, ids as never);
				projected.current = { kind: 'taxonomy', field, ids };
				return;
			}
			const quickFilter = terms.quickFilterFor(term);
			if (!quickFilter) return;
			// The chip's exact sequence (filter-bar.tsx QuickFilterButton), so the chip lights up too.
			actions.resetFilters();
			actions.clearSearch();
			const patch = quickFilterToQueryPatch(quickFilter);
			for (const [key, value] of Object.entries(patch.filters))
				actions.setFilter(key as keyof FiltersOf<'products'>, value as never);
			if (patch.search) actions.setSearch(patch.search);
			const sort = quickFilter.sort ?? settingsSort;
			actions.setSort(sort.field, sort.direction);
			projected.current = { kind: 'shortcut', quickFilter };
		},
		[actions, field, terms, settingsSort, unproject]
	);

	// The projection belongs to the source that made it: a source change or an unmount (Browse
	// by → All products) takes it back out, or the next screen starts restricted by the last.
	React.useEffect(
		() => () => {
			unproject();
			setStored([]);
		},
		[source, unproject]
	);

	// Is the deepest entry still what the query carries?
	const deepest = stored[stored.length - 1];
	let live = stored.length > 0;
	if (deepest) {
		const { term } = deepest;
		if (term.kind === 'all') live = state.search === '' && (!field || !(state.filters[field] as number[] | undefined)?.length);
		else if (term.kind === 'term') live = state.search === '' && !!field && sameSet(state.filters[field], terms.idsFor(term));
		else {
			const quickFilter = terms.quickFilterFor(term);
			live = !!quickFilter && isQuickFilterActive(quickFilter, state, resetState);
		}
	}
	const path = live ? stored : [];

	// A path the query no longer carries is forgotten, and what it put there and is still there
	// is taken back out (a search typed over a term or a shortcut must span the whole catalogue;
	// the search itself stays).
	React.useEffect(() => {
		if (stored.length > 0 && !live) {
			setStored([]);
			unproject();
		}
	}, [stored.length, live, unproject]);

	const enter = React.useCallback(
		(term: BrowseTerm, target?: Measurable) => {
			const entry: PathEntry = { kind: 'term', term, target };
			project(entry);
			setStored((current) => (live ? [...current, entry] : [entry]));
		},
		[project, live]
	);
	const backTo = React.useCallback(
		(depth: number) => {
			const next = stored.slice(0, depth);
			project(next[next.length - 1]);
			setStored(next);
		},
		[stored, project]
	);
	const root = React.useCallback(() => backTo(0), [backTo]);

	return { path, enter, backTo, root };
}
```

The `resetState` above is the chip's own (`v2/filter-bar.tsx` `QuickChip`: empty taxonomy arrays, `status: 'publish'`, `stock_status: 'instock'` unless `showOutOfStock`, the settings sort) — copied, not approximated, so the path's "active" is the chip's "lit". The test's `useUISettings` mock must therefore return `{ sortBy: 'name', sortDirection: 'asc', showOutOfStock: true }` and its `resetFilters` fake set `{ status: 'publish' }` (what `resetFilters` leaves with `showOutOfStock` on); `isQuickFilterActive` is the real module.

- [ ] **Step 4: Run the tests to verify they pass**

Run the Step 2 command. Expected: PASS, 9 tests. (`project` runs `unproject` first, so entering a child from a parent clears the parent's set and then sets the child's — the test's `toHaveBeenLastCalledWith` sees the second.) If the "entering a child" test shows `path` lagging one render, the guard is reading stale `state` — `enter` must call `project` BEFORE `setStored` (it does) and the fake store must emit synchronously (it does); fix the hook, not the test.

- [ ] **Step 5: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/screens/main/pos/products/v2/browse/use-browse-path.ts packages/core/src/screens/main/pos/products/v2/browse/use-browse-path.test.tsx
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): browse path — projected into the products query, dropped when the query moves"
```

### Task 9: `DrillIn` takes its crumb's parents

**Files:**
- Modify: `packages/core/src/screens/main/pos/products/v2/drill-in.tsx:22-60`
- Test: `packages/core/src/screens/main/pos/products/v2/drill-in.test.tsx` (extend)

**Interfaces:**
- Produces: `DrillIn` gains `parents?: { label: string; onPress: () => void; testID?: string }[]` — the crumb's ancestors BEFORE the product. Default: today's single `[Products → back]`. When given, the LAST given parent keeps `testID: 'products-breadcrumb-back'` semantics: the Breadcrumb's last parent is the back control, so `back` must be the last entry's `onPress`.

- [ ] **Step 1: Extend the test**

Add to `drill-in.test.tsx`, following its existing render helper:

```tsx
it('renders the given ancestors before the product and keeps the last one as the way back', () => {
	const back = jest.fn();
	const toRoot = jest.fn();
	renderDrillIn({ parents: [{ label: 'Categories', onPress: toRoot }, { label: 'Hot', onPress: back }] });
	fireEvent.press(screen.getByTestId('products-breadcrumb-parent-0'));
	expect(toRoot).toHaveBeenCalled();
	fireEvent.press(screen.getByTestId('products-breadcrumb-back'));
	expect(back).toHaveBeenCalled();
});
```

(`products-breadcrumb-parent-0` is the Breadcrumb's generated id for an unnamed parent — see `breadcrumb/index.tsx:40,60`.)

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/drill-in.test.tsx`
Expected: FAIL — no `products-breadcrumb-parent-0`.

- [ ] **Step 3: Implement**

In `drill-in.tsx` add the prop and build the crumb from it:

```tsx
export function DrillIn({
	parent,
	back,
	stockStatus,
	tiles = false,
	parents,
}: {
	parent: EngineRecord<'products'>;
	back: () => void;
	stockStatus?: string;
	tiles?: boolean;
	/** The crumb's ancestors before the product; the last one is the way back. Default: Products. */
	parents?: { label: string; onPress: () => void; testID?: string }[];
}) {
	…
	const crumbParents = (parents && parents.length > 0
		? parents.map((entry, index) =>
				index === parents.length - 1 ? { ...entry, testID: 'products-breadcrumb-back' } : entry
			)
		: [{ label: t('pos_products.products_crumb'), onPress: back, testID: 'products-breadcrumb-back' }]) as [
		{ label: string; onPress: () => void; testID?: string },
		...{ label: string; onPress: () => void; testID?: string }[],
	];
	const crumb = (
		<Breadcrumb parents={crumbParents} here={name} detail={t('pos_products.n_variations', { count })} autoFocus testID="products-breadcrumb" />
	);
```

Everything else in the file stays.

- [ ] **Step 4: Run the suite**

Run the Step 2 command plus `src/screens/main/pos/products/v2/index.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/screens/main/pos/products/v2/drill-in.tsx packages/core/src/screens/main/pos/products/v2/drill-in.test.tsx
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): drill-in crumb takes its ancestors"
```

### Task 10: `TermLevelGrid` — a term's dealt grid

**Files:**
- Create: `packages/core/src/screens/main/pos/products/v2/browse/level-snapshot.ts`
- Modify: `packages/core/src/screens/main/pos/products/v2/browse/term-grid.tsx` (add `TermLevelGrid`)
- Test: `packages/core/src/screens/main/pos/products/v2/browse/level-snapshot.test.tsx`
- Test: `packages/core/src/screens/main/pos/products/v2/browse/term-level-grid.test.tsx`

**Interfaces:**
- Consumes: `DealCell`, `DealFade`, `FRONT`, `useDeal`, `DealStagedContext` from `../deal-stack`; `ProductTile`, `GridFields` from `../grid/product-tile`; `VariableProductTile` from `../grid/variable-product-tile`; `ParentTermTile`, `TermTile` (Task 4); `Breadcrumb`; `ProductsFooter` from `../footer`; `displayTypeOf` (Task 1).
- Produces:
  ```tsx
  // level-snapshot.ts
  export type LevelAnswer = { hits: { record: EngineRecord<'products'> }[]; total: number | undefined };
  export function useLevelSnapshot(live: LevelAnswer | undefined, settled: boolean): LevelAnswer | undefined;
  // term-grid.tsx
  export function TermLevelGrid(props: {
    term: BrowseTerm;                       // the dealt parent (slot 0)
    children: BrowseTerm[];                 // child terms (already filtered by display type by the caller)
    answer: LevelAnswer | undefined;        // the products query's answer, attributed to the current projection by the stage; undefined while gathering
    settled: boolean;                       // this level is the deepest: the query is its own (the stage's word)
    showProducts: boolean;                  // display type !== 'subcategories'
    crumb: { parents: Crumb[]; here: string };   // detail (`N products`, the query total) is the level's own, from its snapshot
    back: () => void;
    onOpenTerm: (term: BrowseTerm, target?: Measurable) => void;
    onDrillProduct: (record: EngineRecord<'products'>, target?: Measurable) => void;
    variationsStyle: string;
    binding: ReturnType<typeof useRelationalCollectionBinding>;   // for the footer and the window guard
    actions: { extendLimit: () => void };                        // the root query's actions: the level extends the window as the cashier scrolls
    empty: React.ReactNode;                                       // index.tsx's noDataMessage: shown under slot 0 when the level has answered with no products and no child terms
  }): JSX.Element;
  ```
  Behaviour: slot 0 = `ParentTermTile`; then one `DealCell` per child term; then one per product; the grid shows `useLevelSnapshot(answer, settled)` — its own last answer, held while a child level is over it and while the query gathers its set again on the way back — so tiles never morph into another level's products; the crumb is a row of its own above the grid, in a `DealFade` (exactly as `DrillIn` does with `tiles` on `next` since #2396: never over the grid, never inside a card), the grid reports the node its slots rest in with `useDeal().placeGrid` (as `variations-grid.tsx` does — `testID="variations-slots"` is the pattern), and the crumb's detail is `N products` from the snapshot's `total` (the query total, not the loaded window).

  The products query is windowed (the grid's `useGuardedExtendLimit`, #1221): a level with more products than the window extends it as the cashier nears the end of the scroller — `useGuardedExtendLimit(actions.extendLimit, shown?.hits.length ?? 0, binding)` called from an `onScroll` near-end check (the scroller is an `Animated.ScrollView`, which has no `onEndReached`), so a category of 300 products does not stop at the first 100. The level with `term.kind === 'all'` (All products) is this same component with no children: the All products tile deals to slot 0 and is the way back, exactly like a term.

  Why not `useDeal().dealt`: a level stays `dealt` while a grandchild is over it, and `ObservableResource.reload` (query-bindings `useObservableResource`) keeps the previous answer while the re-projected query loads, with no loading flag — so neither "am I dealt" nor "is the answer defined" says whose answer this is. The stage attributes the answer (Task 12) and says which level is settled.

- [ ] **Step 1: Write the failing tests**

```tsx
// level-snapshot.test.tsx
import { renderHook } from '@testing-library/react-native';

import { useLevelSnapshot } from './level-snapshot';

const own = { hits: [{ record: { uuid: 'a' } }], total: 1 } as never;
const theirs = { hits: [{ record: { uuid: 'b' } }], total: 9 } as never;

it('takes the live answer while settled, holds it while not, and ignores a live answer that is not its own', () => {
	const { result, rerender } = renderHook(({ live, settled }) => useLevelSnapshot(live, settled), {
		initialProps: { live: undefined as typeof own | undefined, settled: true },
	});
	expect(result.current).toBeUndefined();            // cold: gathering
	rerender({ live: own, settled: true });
	expect(result.current).toBe(own);
	rerender({ live: theirs, settled: false });        // a child level is over it; the query is the child's
	expect(result.current).toBe(own);
	rerender({ live: undefined, settled: true });      // on the way back: deepest again, query gathering its set
	expect(result.current).toBe(own);
	rerender({ live: theirs, settled: true });         // its own fresh answer (the stage attributed it)
	expect(result.current).toBe(theirs);
});
```

```tsx
// term-level-grid.test.tsx
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { TermLevelGrid } from './term-grid';

jest.mock('../../../../../../contexts/translations', () => ({ useT: () => (key: string, vars?: { count?: number }) => (vars?.count !== undefined ? `${vars.count} ${key}` : key) }));
jest.mock('../../../../contexts/ui-settings', () => ({ useUISettings: () => ({ uiSettings: { gridColumns: 2, gridFields: { name: true, price: false, tax: false, on_sale: false, category: false, sku: false, barcode: false, stock_quantity: false, cost_of_goods_sold: false } } }) }));
jest.mock('@wcpos/query', () => ({ ...jest.requireActual('@wcpos/query'), useDocField: (doc: Record<string, unknown>, read: (value: Record<string, unknown>) => unknown) => read(doc) }));
jest.mock('../grid/product-tile', () => ({ ProductTile: ({ record, onDrill }: { record: { uuid: string; payload: { name: string } }; onDrill?: () => void }) => { const { Text } = jest.requireActual('react-native'); return <Text testID={`product-${record.uuid}`} onPress={onDrill}>{record.payload.name}</Text>; } }));
jest.mock('../grid/variable-product-tile', () => ({ VariableProductTile: ({ record }: { record: { uuid: string; payload: { name: string } } }) => { const { Text } = jest.requireActual('react-native'); return <Text testID={`variable-${record.uuid}`}>{record.payload.name}</Text>; } }));
jest.mock('../footer', () => ({ ProductsFooter: () => { const { View } = jest.requireActual('react-native'); return <View testID="products-footer" />; } }));
jest.mock('../deal-stack', () => {
	const React = jest.requireActual('react');
	const { View } = jest.requireActual('react-native');
	return {
		DealCell: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
		DealFade: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
		FRONT: {},
		DealStagedContext: React.createContext(null),
		useDeal: () => ({ grid: null, placeGrid: () => {}, dealt: true }),
	};
});

const drinks = { kind: 'term' as const, id: 1, name: 'Drinks', count: 12 };
const hot = { kind: 'term' as const, id: 2, name: 'Hot', count: 6, parent: 1 };
const latte = { uuid: 'l', payload: { type: 'variable', name: 'Latte' } };
const flat = { uuid: 'f', payload: { type: 'simple', name: 'Flat White' } };
const base = {
	term: drinks,
	children: [hot],
	answer: { hits: [{ record: latte }, { record: flat }], total: 80 },
	settled: true,
	showProducts: true,
	crumb: { parents: [{ label: 'Categories', onPress: jest.fn() }], here: 'Drinks' },
	back: jest.fn(),
	onOpenTerm: jest.fn(),
	onDrillProduct: jest.fn(),
	variationsStyle: 'drill',
	binding: {} as never,
	actions: { extendLimit: jest.fn() },
	empty: <Text testID="no-data-message">nothing</Text>,
};
jest.mock('../../../../../../query', () => ({ useGuardedExtendLimit: (extend: () => void) => extend }));

it('deals the parent first, then child terms, then products', () => {
	render(<TermLevelGrid {...(base as never)} />);
	const order = ['browse-parent', 'browse-term-2', 'variable-l', 'product-f'].map((id) => screen.getByTestId(id));
	expect(order.every(Boolean)).toBe(true);
	expect(screen.getByTestId('products-breadcrumb')).toBeTruthy();
	// The crumb's detail is the query TOTAL, not the two loaded rows.
	expect(screen.getByText('80 pos_products.n_products')).toBeTruthy();
	fireEvent.press(screen.getByTestId('browse-parent'));
	expect(base.back).toHaveBeenCalled();
});

it('keeps its own products while a child level is over it', () => {
	const { rerender } = render(<TermLevelGrid {...(base as never)} />);
	rerender(<TermLevelGrid {...(base as never)} settled={false} answer={{ hits: [{ record: { uuid: 'x', payload: { type: 'simple', name: 'Other' } } }], total: 1 }} />);
	expect(screen.getByTestId('product-f')).toBeTruthy();
	expect(screen.queryByTestId('product-x')).toBeNull();
});

it('shows only child terms, and no products footer, for a subcategories display type', () => {
	render(<TermLevelGrid {...(base as never)} showProducts={false} />);
	expect(screen.queryByTestId('product-f')).toBeNull();
	expect(screen.getByTestId('browse-term-2')).toBeTruthy();
	expect(screen.queryByTestId('products-footer')).toBeNull();
});

it('holds placeholders for products until the query answers', () => {
	render(<TermLevelGrid {...(base as never)} answer={undefined} />);
	expect(screen.getAllByTestId('product-placeholder').length).toBeGreaterThan(0);
});

it('extends the query window when the cashier nears the end of the level', () => {
	render(<TermLevelGrid {...(base as never)} />);
	fireEvent.scroll(screen.getByTestId('browse-level-scroller'), {
		nativeEvent: { contentOffset: { y: 900 }, contentSize: { height: 1200 }, layoutMeasurement: { height: 300 } },
	});
	expect(base.actions.extendLimit).toHaveBeenCalled();
});

it('shows the empty state under the parent tile when the level answered with nothing and has no children', () => {
	render(<TermLevelGrid {...(base as never)} children={[]} answer={{ hits: [], total: 0 }} />);
	expect(screen.getByTestId('browse-parent')).toBeTruthy();
	expect(screen.getByTestId('no-data-message')).toBeTruthy();
	expect(screen.queryByTestId('product-placeholder')).toBeNull();
});

it('is the All products level too: the All products tile in slot 0, no children', () => {
	render(<TermLevelGrid {...(base as never)} term={{ kind: 'all' }} children={[]} />);
	expect(screen.getByTestId('browse-parent')).toBeTruthy();
	expect(screen.queryByTestId('browse-term-2')).toBeNull();
	expect(screen.getByTestId('product-f')).toBeTruthy();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/level-snapshot.test.tsx src/screens/main/pos/products/v2/browse/term-level-grid.test.tsx`
Expected: FAIL — modules/exports not found.

- [ ] **Step 3: Implement `level-snapshot.ts`, then `TermLevelGrid`** (append to `term-grid.tsx`)

```ts
// level-snapshot.ts
import * as React from 'react';

import type { EngineRecord } from '@wcpos/query';

export type LevelAnswer = {
	hits: { record: EngineRecord<'products'> }[];
	/** The query total (the footer's and the crumb's number), not the loaded window. */
	total: number | undefined;
};

/**
 * What a level shows. The products query is shared by every level of the browse stage, so the
 * live answer is this level's only while the level is the deepest AND the answer was made under
 * its projection — `settled`, the stage's word. Otherwise the level holds the last answer that
 * was its own: while a child is dealt over it, and while the query gathers its set again on the
 * way back, the tiles on stage stay the tiles that came out.
 */
export function useLevelSnapshot(
	live: LevelAnswer | undefined,
	settled: boolean
): LevelAnswer | undefined {
	const held = React.useRef<LevelAnswer | undefined>(undefined);
	if (settled && live !== undefined) held.current = live;
	return held.current;
}
```

```tsx
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, { useAnimatedRef, useScrollViewOffset } from 'react-native-reanimated';
import { of } from 'rxjs';
import { Breadcrumb } from '@wcpos/components/breadcrumb';
import type { EngineRecord } from '@wcpos/query';
import { useGuardedExtendLimit } from '../../../../../../query';
import { DealCell, DealFade, FRONT, type Measurable, useDeal } from '../deal-stack';
import { ProductTile, type GridFields } from '../grid/product-tile';
import { VariableProductTile } from '../grid/variable-product-tile';
import { ProductsFooter } from '../footer';
import { type LevelAnswer, useLevelSnapshot } from './level-snapshot';
import { ParentTermTile } from './term-tile';
import { useT } from '../../../../../../contexts/translations';

type Crumb = { label: string; onPress: () => void; testID?: string };
// How many product placeholders a cold level holds: a row's worth, so the deal goes out with shape.
const PLACEHOLDER_ROWS = 1;
// The products grid's onEndReachedThreshold, as a fraction of the content height.
const END_REACHED_FRACTION = 0.1;

/** A product that has not arrived yet: its slot is held, in a tile's own shape. */
function ProductPlaceholder() {
	return (
		<View className="bg-muted m-1 grow rounded-lg" aria-busy testID="product-placeholder">
			<View className="aspect-square" />
		</View>
	);
}

/**
 * One term's contents as a dealt grid: the term itself in slot 0 (the way back), its child
 * terms, then its products. The hits it was dealt with are held while it gathers, so the tiles
 * travelling home are the tiles that came out.
 */
export function TermLevelGrid({
	term,
	children,
	answer,
	settled,
	showProducts,
	crumb,
	back,
	onOpenTerm,
	onDrillProduct,
	variationsStyle,
	binding,
	actions,
	empty,
}: {
	term: BrowseTerm;
	children: BrowseTerm[];
	answer: LevelAnswer | undefined;
	settled: boolean;
	showProducts: boolean;
	crumb: { parents: Crumb[]; here: string };
	back: () => void;
	onOpenTerm: (term: BrowseTerm, target?: Measurable) => void;
	onDrillProduct: (record: EngineRecord<'products'>, target?: Measurable) => void;
	variationsStyle: string;
	binding: { active$: unknown; total$: unknown; sync: unknown; pending$?: unknown; exhausted$?: unknown };
	actions: { extendLimit: () => void };
	empty: React.ReactNode;
}) {
	// The slots rest inside this node; the stage measures it so the deal lands on the grid, not
	// on the stage it is inset from (as variations-grid.tsx).
	const { placeGrid } = useDeal();
	const slotsNode = React.useRef<React.ComponentRef<typeof View>>(null);
	const scroller = useAnimatedRef<Animated.ScrollView>();
	const scroll = useScrollViewOffset(scroller);
	const { uiSettings } = useUISettings('pos-products');
	const columns = useDocField(uiSettings, (value) => value.gridColumns);
	const gridFields = useDocField(uiSettings, (value) => value.gridFields) as GridFields;
	// The stage stages the path entry itself (`{ kind: 'term', term, target }`) or the product drill.
	const staged = React.useContext(DealStagedContext) as { kind?: string; term?: BrowseTerm } | null;
	const t = useT();

	// This level's own answer, held while the shared query is another level's (level-snapshot.ts).
	const shown = useLevelSnapshot(answer, settled);
	const detail = shown?.total === undefined ? undefined : t('pos_products.n_products', { count: shown.total });
	// The footer's total is this level's too (as the variations footer takes its parent's count),
	// not the live binding's, which may already be another level's.
	const total$ = React.useMemo(() => of(shown?.total ?? 0), [shown?.total]);

	const products: (EngineRecord<'products'> | null)[] = !showProducts
		? []
		: shown === undefined
			? Array.from({ length: columns * PLACEHOLDER_ROWS }, () => null)
			: shown.hits.map((hit) => hit.record);
	// The query is windowed; the level asks for more as the cashier nears its end (as the
	// products grid does through onEndReached — an Animated.ScrollView has no such prop).
	const extend = useGuardedExtendLimit(actions.extendLimit, shown?.hits.length ?? 0, binding as never);
	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
		if (contentOffset.y + layoutMeasurement.height >= contentSize.height * (1 - END_REACHED_FRACTION)) extend();
	};
	// Answered with nothing to show: the way back stays in slot 0, the empty state (with its Clear
	// filters) sits under it. A level whose products are hidden by its display type is not empty.
	const isEmpty = showProducts && shown !== undefined && shown.hits.length === 0 && children.length === 0;
	const count = 1 + children.length + products.length;
	const rows = Array.from({ length: Math.ceil(count / columns) }, (_, row) =>
		Array.from({ length: columns }, (_, column) => row * columns + column)
	);
	const parents = crumb.parents.map((entry, index) =>
		index === crumb.parents.length - 1 ? { ...entry, testID: 'products-breadcrumb-back' } : entry
	) as [Crumb, ...Crumb[]];

	return (
		<View className="flex-1" testID="browse-level">
			{/* The crumb is a row of its own on the ground above the grid (drill-in.tsx). */}
			<DealFade>
				<Breadcrumb parents={parents} here={crumb.here} detail={detail} autoFocus testID="products-breadcrumb" />
			</DealFade>
			<View className="min-h-0 flex-1 px-1" testID="browse-level-surface">
			<View
				ref={slotsNode}
				className="min-h-0 flex-1"
				testID="browse-level-slots"
				onLayout={() => placeGrid(slotsNode.current as Measurable)}
			>
			<Animated.ScrollView ref={scroller} className="flex-1" testID="browse-level-scroller" onScroll={onScroll} scrollEventThrottle={16}>
				{rows.map((row, rowIndex) => (
					<View key={rowIndex} className="flex-row" style={rowIndex === 0 ? FRONT : undefined}>
						{row.map((index) => {
							if (index >= count) return <View key={index} className="m-1 flex-1" />;
							let cell: React.ReactNode;
							if (index === 0) cell = <ParentTermTile term={term} onPress={back} />;
							else if (index <= children.length) {
								const child = children[index - 1];
								cell = <TermTile term={child} onPress={onOpenTerm} lifted={staged?.kind === 'term' && !!staged.term && termKey(staged.term) === termKey(child)} />;
							} else {
								const record = products[index - 1 - children.length];
								if (!record) cell = <ProductPlaceholder />;
								else if (record.payload.type === 'variable')
									cell = <VariableProductTile record={record} gridFields={gridFields} variationsStyle={variationsStyle} onDrill={onDrillProduct} />;
								else cell = <ProductTile record={record} gridFields={gridFields} />;
							}
							return (
								<DealCell key={index} index={index} count={count} columns={columns} scroll={scroll}>
									{cell}
								</DealCell>
							);
						})}
					</View>
				))}
			</Animated.ScrollView>
			{isEmpty && <View className="flex-1">{empty}</View>}
			</View>
			</View>
			{/* No products footer over a level that shows only its subcategories. */}
			{showProducts && (
				<DealFade>
					<ProductsFooter collectionName="products" active$={binding.active$ as never} total$={total$} sync={binding.sync as never} count={products.filter(Boolean).length} />
				</DealFade>
			)}
		</View>
	);
}
```

(Run the formatter; the nesting above is written flat to keep the diff readable.) `variations-grid.tsx` on `next` is the reference for the surface/slots/scroller nesting — copy its shape, not the pre-#2396 one with `contentContainerStyle={{ paddingTop: top }}`.

Note `VariableProductTile` reads `DealStagedContext` itself to lift the tapped product; the context value at a level is whatever the level's own `DealStack` stages (Task 11 stages `{ record }` for a product and `{ term }` for a term, so both tiles can read it). `ProductTile` inside a dealt cell must grow to the row: if the tile's `flex-1` leaves it heightless in a cell, give `ProductTile` the same `grow` treatment `VariationTile` has (`TILE` constant in `variation-tile.tsx:33`) via a `className` prop rather than a copy of the tile.

- [ ] **Step 4: Run the tests to verify they pass**

Run the Step 2 command. Expected: PASS, 7 tests. `useScrollViewOffset` on the Animated.ScrollView and an `onScroll` handler coexist (Reanimated merges them); if the mock environment complains, check `variations-grid.test.tsx` for how it stubs Reanimated and copy that. `ParentTermTile` must render `{ kind: 'all' }` as the All products card (Task 4's `TermBody` already does for the root tile).

- [ ] **Step 5: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/screens/main/pos/products/v2/browse/level-snapshot.ts packages/core/src/screens/main/pos/products/v2/browse/level-snapshot.test.tsx packages/core/src/screens/main/pos/products/v2/browse/term-grid.tsx packages/core/src/screens/main/pos/products/v2/browse/term-level-grid.test.tsx
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): a term's dealt grid — parent, child terms, products, crumb above"
```

### Task 11: `TermLevelTable` — a term's pane

**Files:**
- Modify: `packages/core/src/screens/main/pos/products/v2/browse/term-table.tsx` (add `TermLevelTable`)
- Test: `packages/core/src/screens/main/pos/products/v2/browse/term-level-table.test.tsx`

**Interfaces:**
- Consumes: `DataTable` from `../../../../components/data-table/v2`, `DataTableSkeleton`; `ProductRow`, `VariableProductRow` from `../rows/*`; `TermRow`; `Breadcrumb`; `ProductsFooter`; `cellsForRow` from `../../index`.
- Produces:
  ```tsx
  export function TermLevelTable(props: {
    term: BrowseTerm; children: BrowseTerm[];
    answer: LevelAnswer | undefined; settled: boolean;   // as TermLevelGrid: shown through useLevelSnapshot
    showProducts: boolean;
    crumb: { parents: Crumb[]; here: string };            // detail is the snapshot's total
    onOpenTerm: (term: BrowseTerm) => void;
    onDrillProduct: (record: EngineRecord<'products'>) => void;
    variationsStyle: string;
    binding; state; actions;   // the root products binding/state/actions, as index.tsx passes DataTable
    empty: React.ReactNode;    // index.tsx's noDataMessage, handed to DataTable as noDataMessage when the level has no child rows
  }): JSX.Element;
  ```
  Behaviour: crumb above (not over) the rows as `DrillIn` does without `tiles`; the level with `term.kind === 'all'` is this same component with no child rows (All products as a pane); child term rows on top of the `DataTable`'s rows via `ListHeaderComponent`; products rows from `tableConfig={{ data: shown.hits }}` where `shown = useLevelSnapshot(answer, settled)` — the pane holds its own rows while a child pane is pushed over it and while the query gathers its set again on the pop, exactly as the grid does (Task 10 says why `dealt`/"is the answer defined" cannot stand in); a `DataTableSkeleton` with `rowCount` = children + 4 until the snapshot exists.

- [ ] **Step 1: Write the failing test**

```tsx
// term-level-table.test.tsx
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { TermLevelTable } from './term-table';

jest.mock('../../../../../../contexts/translations', () => ({ useT: () => (key: string) => key }));
jest.mock('../../../../components/data-table/v2', () => ({
	DataTable: ({ tableConfig, ListHeaderComponent, renderItem, noDataMessage }: { tableConfig: { data: { record: { uuid: string } }[] }; ListHeaderComponent: React.ComponentType; renderItem: (args: { item: { original: { record: { uuid: string; payload: { type: string } } } }; index: number; table: unknown }) => React.ReactNode; noDataMessage?: React.ReactNode }) => {
		const { View } = jest.requireActual('react-native');
		return <View testID="table"><ListHeaderComponent />{tableConfig.data.length === 0 ? noDataMessage : tableConfig.data.map((row, index) => <View key={row.record.uuid}>{renderItem({ item: { original: row }, index, table: {} })}</View>)}</View>;
	},
}));
jest.mock('../../../../components/data-table/v2/skeleton', () => ({ DataTableSkeleton: () => { const { View } = jest.requireActual('react-native'); return <View testID="skeleton" />; } }));
jest.mock('../rows/product-row', () => ({ ProductRow: ({ item }: { item: { original: { record: { uuid: string } } } }) => { const { Text } = jest.requireActual('react-native'); return <Text testID={`row-${item.original.record.uuid}`}>row</Text>; } }));
jest.mock('../rows/variable-product-row', () => ({ VariableProductRow: ({ item }: { item: { original: { record: { uuid: string } } } }) => { const { Text } = jest.requireActual('react-native'); return <Text testID={`vrow-${item.original.record.uuid}`}>row</Text>; } }));
jest.mock('../footer', () => ({ ProductsFooter: () => null }));

const drinks = { kind: 'term' as const, id: 1, name: 'Drinks', count: 12 };
const hot = { kind: 'term' as const, id: 2, name: 'Hot', count: 6, parent: 1 };
const base = {
	term: drinks, children: [hot], showProducts: true, settled: true,
	answer: { hits: [{ record: { uuid: 'l', payload: { type: 'variable' } } }, { record: { uuid: 'f', payload: { type: 'simple' } } }], total: 80 },
	crumb: { parents: [{ label: 'Categories', onPress: jest.fn() }], here: 'Drinks' },
	onOpenTerm: jest.fn(), onDrillProduct: jest.fn(), variationsStyle: 'drill',
	binding: {} as never, state: { sort: { field: 'name', direction: 'asc' } } as never, actions: {} as never,
	empty: <Text testID="no-data-message">nothing</Text>,
};

it('renders the crumb, then child term rows, then product rows', () => {
	render(<TermLevelTable {...(base as never)} />);
	expect(screen.getByTestId('products-breadcrumb')).toBeTruthy();
	expect(screen.getByTestId('browse-term-2')).toBeTruthy();
	expect(screen.getByTestId('vrow-l')).toBeTruthy();
	expect(screen.getByTestId('row-f')).toBeTruthy();
	fireEvent.press(screen.getByTestId('browse-term-2'));
	expect(base.onOpenTerm).toHaveBeenCalledWith(hot);
});

it('shows a skeleton until the products answer, and no products for subcategories display', () => {
	const { rerender } = render(<TermLevelTable {...(base as never)} answer={undefined} />);
	expect(screen.getByTestId('skeleton')).toBeTruthy();
	rerender(<TermLevelTable {...(base as never)} showProducts={false} />);
	expect(screen.queryByTestId('row-f')).toBeNull();
	expect(screen.getByTestId('browse-term-2')).toBeTruthy();
});

it('hands the empty state to the table when the level answered with nothing and has no children', () => {
	render(<TermLevelTable {...(base as never)} children={[]} answer={{ hits: [], total: 0 }} />);
	expect(screen.getByTestId('no-data-message')).toBeTruthy();
});

it('keeps its own rows while a child pane is over it', () => {
	const { rerender } = render(<TermLevelTable {...(base as never)} />);
	rerender(<TermLevelTable {...(base as never)} settled={false} answer={{ hits: [{ record: { uuid: 'x', payload: { type: 'simple' } } }], total: 1 }} />);
	expect(screen.getByTestId('row-f')).toBeTruthy();
	expect(screen.queryByTestId('row-x')).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/term-level-table.test.tsx`
Expected: FAIL — not exported.

- [ ] **Step 3: Implement `TermLevelTable`** (append to `term-table.tsx`)

```tsx
import { of } from 'rxjs';
import { Breadcrumb } from '@wcpos/components/breadcrumb';
import type { EngineRecord } from '@wcpos/query';
import { DataTable } from '../../../../components/data-table/v2';
import { DataTableSkeleton } from '../../../../components/data-table/v2/skeleton';
import { cellsForRow } from '../../index';
import { ProductsFooter } from '../footer';
import { ProductRow } from '../rows/product-row';
import { VariableProductRow } from '../rows/variable-product-row';
import { useT } from '../../../../../../contexts/translations';
import { type LevelAnswer, useLevelSnapshot } from './level-snapshot';

type Crumb = { label: string; onPress: () => void; testID?: string };
type Hit = { record: EngineRecord<'products'> };
// Skeleton rows for a cold level beyond its child rows: a screen's worth is more than a pane shows.
const SKELETON_PRODUCT_ROWS = 4;

/**
 * One term's contents as a pane: the crumb above, its child terms as rows at the top of the
 * products table, then its products. The rows travel with their pane; none animates on its own.
 */
export function TermLevelTable({
	term, children, answer, settled, showProducts, crumb, onOpenTerm, onDrillProduct, variationsStyle, binding, state, actions, empty,
}: {
	term: BrowseTerm;
	children: BrowseTerm[];
	answer: LevelAnswer | undefined;
	settled: boolean;
	showProducts: boolean;
	crumb: { parents: Crumb[]; here: string };
	onOpenTerm: (term: BrowseTerm) => void;
	onDrillProduct: (record: EngineRecord<'products'>) => void;
	variationsStyle: string;
	binding: React.ComponentProps<typeof DataTable>['binding'];
	state: { sort: React.ComponentProps<typeof DataTable>['sort'] };
	actions: React.ComponentProps<typeof DataTable>['actions'];
	empty: React.ReactNode;
}) {
	const parents = crumb.parents.map((entry, index) =>
		index === crumb.parents.length - 1 ? { ...entry, testID: 'products-breadcrumb-back' } : entry
	) as [Crumb, ...Crumb[]];
	const Header = React.useCallback(
		() => (
			<View>
				{children.map((child) => (
					<TermRow key={termKey(child)} term={child} onPress={onOpenTerm} />
				))}
			</View>
		),
		[children, onOpenTerm]
	);
	// This pane's own answer, held while the shared query is another level's (level-snapshot.ts).
	const shown = useLevelSnapshot(answer, settled);
	const t = useT();
	const detail = shown?.total === undefined ? undefined : t('pos_products.n_products', { count: shown.total });
	// The table's total is this pane's own (as VariationsTable hands its parent's count).
	const total$ = React.useMemo(() => of(shown?.total ?? 0), [shown?.total]);
	const data = showProducts ? shown?.hits : [];
	return (
		<View className="flex-1" testID="browse-level">
			<Breadcrumb parents={parents} here={crumb.here} detail={detail} autoFocus testID="products-breadcrumb" />
			<View className="flex-1">
				{data === undefined ? (
					<>
						<Header />
						<DataTableSkeleton id="pos-products" rowCount={SKELETON_PRODUCT_ROWS} />
					</>
				) : (
					<DataTable<Hit>
						id="pos-products"
						persistSort={false}
						collectionName="products"
						binding={binding}
						resource={binding.resource}
						tableConfig={{ data }}
						sort={state.sort}
						actions={actions}
						active$={binding.active$}
						total$={total$}
						sync={binding.sync}
						cellsForRow={cellsForRow}
						// A level with child rows is not empty when its products are; one with neither
						// shows the empty state (with its Clear filters) under the crumb.
						noDataMessage={children.length === 0 && showProducts ? (empty as React.ReactElement) : undefined}
						ListHeaderComponent={Header}
						renderItem={({ item, index, table }) => (
							<VirtualizedList.Item>
								{item.original.record.payload.type === 'variable' ? (
									<VariableProductRow item={item} index={index} table={table} variationsStyle={variationsStyle} onDrill={onDrillProduct} />
								) : (
									<ProductRow item={item} />
								)}
							</VirtualizedList.Item>
						)}
						estimatedItemSize={100}
						// No products footer under a level that shows only its subcategories.
						TableFooterComponent={showProducts ? (props) => <ProductsFooter {...props} count={data.length} /> : undefined}
						getItemType={(row) => row.original.record.payload.type}
					/>
				)}
			</View>
		</View>
	);
}
```

Check `DataTable`'s props in `components/data-table/v2/index.tsx`: `noDataMessage` is `string | React.ReactElement` and renders when the list is empty (line ~330) — with `undefined` it falls back to `common.no_results_found`, so when the level has child rows and no products pass a component that renders nothing (`<></>`) rather than `undefined`; `tableConfig={{ data }}` is how `VariationsTable` hands it rows; confirm its `handleEndReached` still extends the window with the `binding`/`actions` it is given when rows come from `tableConfig.data` (it should — the guard reads the binding, not the rows); if it keys the guard on `resource` hits, pass `onEndReached` through as the grid level does; `ListHeaderComponent` — if the v2 `DataTable` does not forward it to the list, add that one prop pass-through (it already forwards `ListFooterComponent`, see `variations-pane.tsx:135`). `cellsForRow` is the export from `../../index`; the `tableConfig` expanding meta (expanded rows for inline variations) is not needed at a term level because `variationsStyle === 'inline'` renders `InlineRow` which manages its own expansion — confirm by reading `components/product/variable-product-row.tsx` before relying on it; if it needs the `meta` from `index.tsx`'s `tableConfig`, pass the same `tableConfig` object down from `index.tsx` instead of `{ data }` alone (merge: `{ ...tableConfig, data }`).

- [ ] **Step 4: Run the tests to verify they pass**

Run the Step 2 command. Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add packages/core/src/screens/main/pos/products/v2/browse/term-table.tsx packages/core/src/screens/main/pos/products/v2/browse/term-level-table.test.tsx
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): a term's pane — crumb, child term rows, product rows"
```

### Task 12: `BrowseStage` — the nested stacks

**Files:**
- Modify: `packages/core/src/screens/main/pos/products/v2/browse/browse-stage.tsx`
- Modify: `packages/core/src/screens/main/pos/products/v2/index.tsx` (pass the drill plumbing; `level` for the filter bar)
- Test: `packages/core/src/screens/main/pos/products/v2/browse/browse-stage.test.tsx` (extend)

**Interfaces:**
- Consumes: `useBrowsePath` (Task 8), `useBrowseTerms` (Task 3), `TermLevelGrid` (Task 10), `TermLevelTable` (Task 11), `DrillIn` with `parents` (Task 9), `DealStack`, `PaneStack`.
- Produces: `BrowseStage` props become
  ```tsx
  {
    source: Exclude<BrowseBy, 'all'>;
    viewMode: 'grid' | 'table';
    renderProducts: (onDrill) => React.ReactNode;   // today's products element wired to the STAGE's drill, shown when a search displaces the term set
    empty: React.ReactNode;                         // index.tsx's noDataMessage, for a level that answered with nothing
    initialFilters: Record<string, unknown>;
    variationsStyle: string;
    stockStatus?: string;
    binding; state; actions;                    // root products binding/state/actions
    onDrilledChange: (drilled: boolean) => void; // so index.tsx can set the filter bar's level
  }
  ```
  A level's detail is `type Detail = PathEntry | ProductDrill` — the stored path entry (`{ kind: 'term', term, target }`, Task 8) or the stage's product drill (`{ kind: 'product', record, depth, search, target }`) **by identity**: `DealStack` re-arms its deal whenever `detail !== staged`, so a detail built fresh on each render would re-deal every render. `detailAt(depth)` returns `path[depth]`, else the drill object itself. The stage keeps ONE product drill (shown only at `depth === path.length` and while `search === state.search`, the existing rule); `drillProduct` reads the current depth/search from a ref so its identity is stable (it is baked into tile components through `renderProducts`); every move of the path (`openTerm`, `goBackTo`, `goRoot`) clears it first, and a drilled product's crumb ends with the current term, whose press closes the drill.

  All products is a level like any term: `TermLevelGrid`/`TermLevelTable` with `term={{ kind: 'all' }}` and no children, so in the grid the All products tile deals to slot 0 and is the way back, and in the table it is a pushed pane with the crumb above. A product drilled there, or in the search-displaced root, drills into the STAGE's drill (`renderProducts(drillProduct)`), never `index.tsx`'s — the outer stack that consumed that state is not mounted in browse mode.

  The stage also owns two readings of the shared products query that the levels cannot make for themselves:
  - **Attribution.** `ObservableResource.reload` keeps the previous answer while a re-projected query loads (query-bindings `useObservableResource`), so the answer object is paired with the query key it arrived under; `answer` is `undefined` while the current key has no answer of its own. Edge: an emission of the old query that lands in the same render as a key change is attributed to the new key — one wrong frame, which the level snapshot then replaces; noted, not guarded.
  - **Search displacement.** With the path empty and `state.search !== ''`, depth 0 is today's products element (`props.renderProducts(drillProduct)`, which reads the query itself) with no crumb — the spec's search contract; clearing the search shows the root term set again because the path was already dropped.

- [ ] **Step 1: Extend the stage test**

Add to `browse-stage.test.tsx` (its mocks already stub `useBrowseTerms`; import `act` alongside `render`; stub `DealStack`/`PaneStack` to render children + detail side by side with testIDs):

```tsx
jest.mock('../deal-stack', () => {
	const React = jest.requireActual('react');
	const { View } = jest.requireActual('react-native');
	return {
		DealStack: ({ detail, renderDetail, children, testID }: { detail: unknown; renderDetail: (d: unknown) => React.ReactNode; children: React.ReactNode; testID?: string }) => <View testID={testID}><View testID="stack-root">{children}</View>{detail ? <View testID="stack-detail">{renderDetail(detail)}</View> : null}</View>,
		DealStagedContext: React.createContext(null),
		DealCell: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
		DealFade: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
		FRONT: {},
		useDeal: () => ({ grid: null, placeGrid: () => {}, dealt: true }),
	};
});
jest.mock('@wcpos/components/pane-stack', () => {
	const { View } = jest.requireActual('react-native');
	return { PaneStack: ({ detail, renderDetail, children, testID }: { detail: unknown; renderDetail: (d: unknown) => React.ReactNode; children: React.ReactNode; testID?: string }) => <View testID={testID}><View testID="stack-root">{children}</View>{detail ? <View testID="stack-detail">{renderDetail(detail)}</View> : null}</View> };
});
jest.mock('../drill-in', () => ({ DrillIn: ({ parents }: { parents: { label: string }[] }) => { const { Text } = jest.requireActual('react-native'); return <Text testID="drill-in">{parents.map((p) => p.label).join(' › ')}</Text>; } }));

it('tapping a root term opens its level; a child term nests; the crumb goes back; All products shows the products', () => {
	render(<BrowseStage {...stageProps} source="categories" viewMode="grid" />);
	fireEvent.press(screen.getByTestId('browse-term-1'));
	expect(screen.getByTestId('browse-level')).toBeTruthy();
	expect(screen.getByTestId('browse-parent')).toBeTruthy();
	fireEvent.press(screen.getByTestId('browse-term-2'));          // Hot, a child of Drinks
	expect(screen.getAllByTestId('browse-level').length).toBe(2);
	fireEvent.press(screen.getAllByTestId('products-breadcrumb-parent-0')[1]); // Categories, from the deepest crumb
	expect(screen.queryByTestId('browse-level')).toBeNull();
	fireEvent.press(screen.getByTestId('browse-all-products'));
	expect(screen.getByTestId('products')).toBeTruthy();
	expect(screen.getByTestId('products-breadcrumb')).toBeTruthy();
});

it('a product drilled inside a term gets the term crumb as its ancestors, and the term crumb closes the drill', () => {
	render(<BrowseStage {...stageProps} source="categories" viewMode="table" />);
	fireEvent.press(screen.getByTestId('browse-term-1'));
	fireEvent.press(screen.getByTestId('variable-product-drill'));
	expect(screen.getByTestId('drill-in').props.children).toBe('Categories › Drinks');
	fireEvent.press(screen.getByTestId('drill-in-last-parent'));     // the DrillIn mock renders the last parent as a pressable
	expect(screen.queryByTestId('drill-in')).toBeNull();
	expect(screen.getByTestId('browse-level')).toBeTruthy();         // still inside Drinks
});

it('a search typed inside a term shows the catalogue-wide products with no crumb; clearing it shows the root set', () => {
	render(<BrowseStage {...stageProps} source="categories" viewMode="grid" />);
	fireEvent.press(screen.getByTestId('browse-term-1'));
	act(() => queryActions.setSearch('lat'));                          // the Task 8 fake store
	expect(screen.getByTestId('products')).toBeTruthy();
	expect(screen.queryByTestId('products-breadcrumb')).toBeNull();
	expect(screen.queryByTestId('browse-level')).toBeNull();
	act(() => queryActions.clearSearch());
	expect(screen.queryByTestId('products')).toBeNull();
	expect(screen.getByTestId('browse-term-1')).toBeTruthy();
});

it('a product drilled from the search-displaced root opens in the stage', () => {
	render(<BrowseStage {...stageProps} source="categories" viewMode="grid" />);
	act(() => queryActions.setSearch('lat'));
	fireEvent.press(screen.getByTestId('products'));
	expect(screen.getByTestId('drill-in')).toBeTruthy();
});

it('All products is a dealt level with the All products tile in slot 0', () => {
	render(<BrowseStage {...stageProps} source="categories" viewMode="grid" />);
	fireEvent.press(screen.getByTestId('browse-all-products'));
	expect(screen.getByTestId('browse-level')).toBeTruthy();
	expect(screen.getByTestId('browse-parent')).toBeTruthy();
	expect(screen.getByTestId('products-breadcrumb')).toBeTruthy();
});
```

The first test's last four lines (press `browse-all-products`, expect `products` and the crumb) become: expect `browse-level` and `browse-parent` (the `products` element is only the search-displaced root now).

The `DrillIn` mock gains a pressable for its last parent: `<Pressable testID="drill-in-last-parent" onPress={parents[parents.length - 1].onPress} />` beside the `Text`. `queryActions` is the Task 8 fake store's `actions` object, exported from the test's mock factory (hoist it with `jest.mock`'s factory returning the same object both tests import).

`stageProps` is a fixture in the test file with `empty={<Text testID="no-data-message" />}`, `renderProducts={(onDrill) => <Pressable testID="products" onPress={() => onDrill(variable)} />}` (so a drill from the search-displaced root can be asserted to open `drill-in`), `actions: { extendLimit: jest.fn(), … }`, `total$: of(80)`, a `binding` whose `resource.valueRef$$.value.current.hits` holds one variable product and one simple product, `state`, `actions` fakes, `initialFilters: { status: 'publish' }`, `variationsStyle: 'drill'`, `onDrilledChange: jest.fn()`; the `useBrowseTerms` mock returns Drinks at the root with Hot as its child and `idsFor` → `[1,2]` / `[2]`; the `use-browse-path` module is NOT mocked (its own test covers it; here the query mock from Task 6's test is extended with a working `setFilter`/`clearFilter` fake exactly as in Task 8's test so the guard sees what `enter` wrote).

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2/browse/browse-stage.test.tsx`
Expected: FAIL — tapping a term does nothing.

- [ ] **Step 3: Implement the full stage**

```tsx
// browse-stage.tsx
import * as React from 'react';

import { useObservableEagerState } from 'observable-hooks';
import type { Observable } from 'rxjs';

import { PaneStack } from '@wcpos/components/pane-stack';
import type { EngineRecord } from '@wcpos/query';

import { useT } from '../../../../../../contexts/translations';
import { useQueryState } from '../../../../../../query';
import { DealStack, type Measurable } from '../deal-stack';
import { DrillIn } from '../drill-in';
import { type BrowseBy, type BrowseTerm } from './browse-source';
import type { LevelAnswer } from './level-snapshot';
import { BrowseRootGrid, TermLevelGrid } from './term-grid';
import { BrowseRootTable, TermLevelTable } from './term-table';
import { displayTypeOf } from './term-tree';
import { useBrowsePath, type PathEntry } from './use-browse-path';
import { useBrowseTerms, type BrowseTerms } from './use-browse-terms';

type ProductDrill = { kind: 'product'; record: EngineRecord<'products'>; depth: number; search: string; target?: Measurable };
// By identity: DealStack re-arms whenever `detail !== staged`, so a level's detail is the stored
// path entry or the drill object itself, never a fresh literal.
type Detail = PathEntry | ProductDrill;
type DrillHandler = (record: EngineRecord<'products'> | null, target?: Measurable) => void;

export type BrowseStageProps = {
	source: Exclude<BrowseBy, 'all'>;
	viewMode: 'grid' | 'table';
	renderProducts: (onDrill: DrillHandler) => React.ReactNode;
	empty: React.ReactNode;
	variationsStyle: string;
	stockStatus?: string;
	binding: {
		resource: { valueRef$$: { value: { current: { hits: { record: EngineRecord<'products'> }[] } } | null } };
		active$: unknown;
		total$: unknown;
		sync: unknown;
	};
	state: { sort: unknown };
	actions: { extendLimit: () => void };
	onDrilledChange: (drilled: boolean) => void;
};

function sourceLabel(source: Exclude<BrowseBy, 'all'>, t: ReturnType<typeof useT>): string {
	return t(`pos_products.browse_${source}`);
}

/**
 * The products stage with a browse source on. Level 0 is the term set; each entry of the path
 * is a level dealt (grid) or pushed (table) over the one before; a product drilled at the
 * deepest level is its variations, over that level. The path and the product drill both fall
 * away when the query moves (search, a pill, Clear filters) — see use-browse-path.
 */
export function BrowseStage(props: BrowseStageProps) {
	const { source, viewMode, binding, onDrilledChange } = props;
	const terms = useBrowseTerms(source);
	const { path, enter, backTo } = useBrowsePath(source, terms);
	const state = useQueryState<'products'>();
	// The product drill remembers its depth and the search it opened under (the existing rule).
	const [drill, setDrill] = React.useState<ProductDrill | null>(null);
	const drilled = drill && drill.search === state.search && drill.depth === path.length ? drill : null;
	React.useEffect(() => onDrilledChange(drilled !== null), [drilled, onDrilledChange]);
	// Stable: it is baked into the tiles' component identity through renderProducts, and a new
	// handler per keystroke would remount every tile under the search.
	const where = React.useRef({ depth: path.length, search: state.search });
	where.current = { depth: path.length, search: state.search };
	const drillProduct = React.useCallback<DrillHandler>(
		(record, target) =>
			setDrill(record ? { kind: 'product', record, depth: where.current.depth, search: where.current.search, target } : null),
		[]
	);
	// The products answer as state: a level never suspends (a tile swapped for a skeleton
	// mid-deal would lose its place).
	// eslint-disable-next-line wcpos/no-dollar-getter-into-observable-hooks -- ObservableResource exposes a stable BehaviorSubject property, not an RxDB $-getter; exception dated 2026-10-02.
	useObservableEagerState(binding.resource.valueRef$$ as never);
	const liveAnswer = binding.resource.valueRef$$.value;
	const total = useObservableEagerState(binding.total$ as Observable<number | undefined>);
	// Attributed: the resource keeps the previous answer while a re-projected query loads, so an
	// answer object is paired with the query key it arrived under, and a key without an answer of
	// its own is "gathering" (see the Interfaces note on the one-frame edge).
	const queryKey = JSON.stringify([state.search, state.filters, state.sort]);
	const attributed = React.useRef<{ key: string; answer: typeof liveAnswer }>({ key: queryKey, answer: undefined });
	if (liveAnswer !== attributed.current.answer) attributed.current = { key: queryKey, answer: liveAnswer };
	const answer: LevelAnswer | undefined =
		attributed.current.key === queryKey && liveAnswer ? { hits: liveAnswer.current.hits, total } : undefined;
	const t = useT();
	const rootLabel = sourceLabel(source, t);
	const labelOf = (term: BrowseTerm) => (term.kind === 'all' ? t('pos_products.browse_all_products') : term.name);

	// Every move of the path closes the product drill: a stale drill at a depth the path returns
	// to would otherwise reappear.
	const openTerm = React.useCallback((term: BrowseTerm, target?: Measurable) => { setDrill(null); enter(term, target); }, [enter]);
	const goBackTo = React.useCallback((depth: number) => { setDrill(null); backTo(depth); }, [backTo]);
	const goRoot = React.useCallback(() => goBackTo(0), [goBackTo]);
	// A search over an empty path has displaced the term set: the catalogue-wide products show.
	const searchDisplaced = path.length === 0 && state.search !== '';

	// What is on stage at `depth`: the next path entry, or the product drilled here — the stored
	// objects themselves (identity, see Detail).
	const detailAt = (depth: number): Detail | null =>
		path[depth] ?? (drilled && drilled.depth === depth ? drilled : null);
	// The crumb's ancestors for the level at `depth`: the source, then the path above it.
	const crumbParentsAt = (depth: number) => [
		{ label: rootLabel, onPress: goRoot },
		...path.slice(0, depth).map((entry, index) => ({
			label: labelOf(entry.term),
			onPress: () => goBackTo(index + 1),
		})),
	];
	// A product drilled at `depth` sits inside path[depth - 1]: that term is the last crumb parent,
	// and pressing it closes the drill (the path stays where it is).
	const drillParentsAt = (depth: number) =>
		depth === 0 ? undefined : [...crumbParentsAt(depth - 1), { label: labelOf(path[depth - 1].term), onPress: () => drillProduct(null) }];

	// Level `depth` (0 = the root) with whatever is dealt over it.
	const renderLevel = (depth: number): React.ReactNode => {
		const detail = detailAt(depth);
		const content = depth === 0 ? (searchDisplaced ? props.renderProducts(drillProduct) : renderRoot()) : renderTerm(path[depth - 1], depth);
		const renderDetail = (d: Detail) =>
			d.kind === 'term' ? renderLevel(depth + 1) : (
				<DrillIn
					parent={d.record}
					back={() => drillProduct(null)}
					stockStatus={props.stockStatus}
					tiles={viewMode === 'grid'}
					parents={drillParentsAt(depth)}
				/>
			);
		return viewMode === 'grid' ? (
			<DealStack testID={depth === 0 ? 'products-pane-stack' : `browse-stack-${depth}`} detail={detail} target={detail?.target} renderDetail={renderDetail}>
				{content}
			</DealStack>
		) : (
			<PaneStack testID={depth === 0 ? 'products-pane-stack' : `browse-stack-${depth}`} detail={detail} paneClassName="bg-background" renderDetail={renderDetail}>
				{content}
			</PaneStack>
		);
	};

	const renderRoot = () =>
		viewMode === 'grid' ? <BrowseRootGrid terms={terms.rootsOf()} onOpen={openTerm} /> : <BrowseRootTable terms={terms.rootsOf()} onOpen={openTerm} />;

	const renderTerm = (entry: PathEntry, depth: number) => {
		const { term } = entry;
		const crumb = { parents: crumbParentsAt(depth - 1), here: labelOf(term) };
		// The query is this level's own only while it is the deepest (a product drill over it
		// does not move the products query).
		const settled = depth === path.length;
		// All products is a level with no children: the whole catalogue under the crumb, its tile
		// in slot 0 of the deal.
		const display = term.kind === 'term' ? displayTypeOf(term) : 'products';
		const children = display === 'products' ? [] : terms.childrenOf(term);
		const showProducts = display !== 'subcategories' || children.length === 0;
		return viewMode === 'grid' ? (
			<TermLevelGrid term={term} children={children} answer={answer} settled={settled} showProducts={showProducts} crumb={crumb} back={() => goBackTo(depth - 1)} onOpenTerm={openTerm} onDrillProduct={drillProduct} variationsStyle={props.variationsStyle} binding={binding as never} actions={props.actions} empty={props.empty} />
		) : (
			<TermLevelTable term={term} children={children} answer={answer} settled={settled} showProducts={showProducts} crumb={crumb} onOpenTerm={openTerm} onDrillProduct={drillProduct} variationsStyle={props.variationsStyle} binding={binding as never} state={props.state as never} actions={props.actions as never} empty={props.empty} />
		);
	};

	return <>{renderLevel(0)}</>;
}
```

In `TermLevelGrid`/`BrowseRootGrid`, the `DealStagedContext` value is whatever the enclosing `DealStack` stages: the `Detail` object — a path entry (`kind: 'term'`) or the product drill (`kind: 'product'`). The term tiles read `staged?.kind === 'term' && staged.term` (Tasks 5, 10); `VariableProductTile`'s `staged?.uuid` check must also read a drill. Adjust `variable-product-tile.tsx`'s one line to `const stagedRecord = (staged as { record?: EngineRecord<'products'> } | EngineRecord<'products'> | null); lifted = (stagedRecord && ('record' in stagedRecord ? stagedRecord.record?.uuid : stagedRecord.uuid)) === props.record.uuid` so the root (`all` mode) stage, which stages the record itself, and a browse level, which stages `{ kind: 'product', record, … }`, both lift the right tile.

- [ ] **Step 4: Wire `index.tsx`**

Replace the Task 6 `BrowseStage` mount with:

```tsx
									<BrowseStage
										source={browseBy}
										viewMode={viewMode}
										renderProducts={renderProducts}
										empty={noDataMessage}
										variationsStyle={variationsStyle}
										stockStatus={stockStatusFilter}
										binding={binding as never}
										state={state}
										actions={tableActions}
										onDrilledChange={setBrowseDrilled}
									/>
```

with `const [browseDrilled, setBrowseDrilled] = React.useState(false);` near `drill`, and the filter bar's level becoming `level={drilled || browseDrilled ? 'variations' : 'products'}`. A drill does not outlive its stage: in `index.tsx` add `React.useEffect(() => { setDrill(null); }, [browseBy]);` (a drill opened under All products is not shown under a browse source, nor restored when switching back), and in `BrowseStage` add `React.useEffect(() => () => onDrilledChange(false), [onDrilledChange]);` so an unmounting stage hands the filter bar's level back. Stage test: unmount while drilled → `onDrilledChange` last called with `false`.

- [ ] **Step 5: Run the tests**

Run: `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products/v2` then `pnpm typecheck --force`. Expected: PASS (all v2 suites, including `deal-stack.test.tsx`, `drill-in.test.tsx`, `index.test.tsx`).

- [ ] **Step 6: Try it live** (web, dev-next): from `apps/main`, `npx expo start --web --port 8141` (no `CI`), open the register, Product settings → Browse by → Categories, and walk Categories → a parent → a child → a variable product → back along the crumb, in grid and table. Then type a search inside a term and clear it. Then press a Category pill inside a term. Each should behave as the spec's *The stage, by state* says. **Film the category deal and its return** (`CODING_STANDARDS` § Design rule 6): record with the browser's performance panel or `--video` in Playwright and step the frames; the parent tile must step aside on the same frame its copy appears, and nothing may flash on the return. Fix before committing.

- [ ] **Step 7: Commit**

```bash
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by add -A packages/core/src/screens/main/pos/products
git -C /Users/kilbot/Projects/monorepo-v2-worktrees/pos-browse-by commit -m "feat(pos): browse stage — nested deal and pane per term, product drill inside a term"
```

### Task 13: Slice 2 PR

- [ ] Run `pnpm --filter @wcpos/core test -- --maxWorkers=2 src/screens/main/pos/products src/query` and `pnpm typecheck --force`.
- [ ] `/codex-review` the diff against `origin/next`; fix; re-run.
- [ ] Push and open the PR against `next`: title `feat(pos): Browse by — drill-in, crumb, descendants, display type (slice 2 of roadmap#392)`; body names the spec, lists the walk from Step 6 with what was filmed, and the test commands. Babysit to merge.

---

## Slice 3 — Shortcuts

Shortcuts are already a source in Tasks 3 and 8 (projection and application). This slice is the proof and the polish.

### Task 14: Shortcut tiles end to end

**Files:**
- Test: `packages/core/src/screens/main/pos/products/v2/browse/browse-stage.test.tsx` (extend)
- Modify: `use-browse-terms.ts` if `describeQuickFilter`'s output needs trimming for a tile (one line, ≤ 2 rows at the tile's width — keep the function, slice in the tile with `numberOfLines={2}` as Task 4 already does).

- [ ] **Step 1: Extend the stage test**

```tsx
it('shortcuts: the stored quick filters are the root; tapping one applies it and shows its products', () => {
	render(<BrowseStage {...stageProps} source="shortcuts" viewMode="grid" />);
	expect(screen.getByTestId('browse-shortcut-qf-1')).toBeTruthy();
	fireEvent.press(screen.getByTestId('browse-shortcut-qf-1'));
	expect(queryActions.resetFilters).toHaveBeenCalled();
	expect(queryActions.setFilter).toHaveBeenCalledWith('categories', [3]);
	expect(screen.getByTestId('browse-level')).toBeTruthy();
	expect(screen.getByTestId('products-breadcrumb')).toBeTruthy();
});
```

(The `useBrowseTerms` mock gains a `shortcuts` branch returning one shortcut `qf-1` with `quickFilterFor` → `{ type:'quick', id:'qf-1', label:'Breakfast', conditions:[{ field:'categories', value:[3] }] }`; `queryActions` is the query mock's actions object.)

- [ ] **Step 2: Run it** — expected PASS already if Tasks 3, 8 and 12 are complete; if it fails, the gap is in `isQuickFilterActive`'s `resetState` (Task 8 Step 3 note) — fix there.

- [ ] **Step 3: Live check** on dev-next: create two quick filters via Customise, switch Browse by → Shortcuts, tap each; the chip in the filter bar lights as it does from a chip press; tap the chip to clear → the stage returns to the shortcut tiles.

- [ ] **Step 4: Commit and PR** — `test(pos): shortcuts source end to end`; `/codex-review`; PR `feat(pos): Browse by — shortcuts (slice 3 of roadmap#392)`.

---

## Slice 4 — gallery, E2E, films

### Task 15: Gallery stories

**Files:**
- Create: `packages/core/src/screens/main/pos/products/v2/browse/gallery.tsx`
- Modify: `apps/main/components/gallery/registry.tsx` (import + register under `'browse-tiles'`)
- Test: `apps/main/__tests__/gallery-registry.test.tsx` (its existing assertion that every registered id has stories covers it)

- [ ] **Step 1: Write the stories** following the shape of `@wcpos/components/breadcrumb/gallery` (open it and match its `stories` export exactly):

```tsx
import * as React from 'react';
import { View } from 'react-native';

import { ParentTermTile, TermTile } from './term-tile';
import { TermRow } from './term-row';

const drinks = { kind: 'term' as const, id: 1, name: 'Drinks', count: 12, imageSrc: 'https://placehold.co/400x400.png' };
const snacks = { kind: 'term' as const, id: 2, name: 'Snacks', count: 4 };
const longName = { kind: 'term' as const, id: 3, name: 'Kaffeespezialitäten und Heißgetränke', count: 7 };
const shortcut = { kind: 'shortcut' as const, id: 'qf', name: 'Breakfast', description: 'Hot Food + Bakery · in stock' };
const noop = () => {};

export const stories = [
	{ id: 'tile-image', title: 'Term tile · image', render: () => <View className="w-48"><TermTile term={drinks} onPress={noop} /></View> },
	{ id: 'tile-plain', title: 'Term tile · no image', render: () => <View className="w-48"><TermTile term={snacks} onPress={noop} /></View> },
	{ id: 'tile-long', title: 'Term tile · long name', render: () => <View className="w-48"><TermTile term={longName} onPress={noop} /></View> },
	{ id: 'tile-all', title: 'All products tile', render: () => <View className="w-48"><TermTile term={{ kind: 'all' }} onPress={noop} /></View> },
	{ id: 'tile-shortcut', title: 'Shortcut tile', render: () => <View className="w-48"><TermTile term={shortcut} onPress={noop} /></View> },
	{ id: 'tile-parent', title: 'Parent term tile (slot 0)', render: () => <View className="w-48"><ParentTermTile term={drinks} onPress={noop} /></View> },
	{ id: 'row', title: 'Term rows', render: () => <View className="w-96"><TermRow term={{ kind: 'all' }} onPress={noop} /><TermRow term={drinks} onPress={noop} /><TermRow term={snacks} onPress={noop} /><TermRow term={shortcut} onPress={noop} /></View> },
];
```

- [ ] **Step 2: Register** in `registry.tsx`: `import { stories as browseTiles } from '@wcpos/core/screens/main/pos/products/v2/browse/gallery';` and `'browse-tiles': browseTiles,` in the map (alphabetical with its neighbours).
- [ ] **Step 3: Run** `pnpm --filter main test -- --maxWorkers=2 __tests__/gallery-registry.test.tsx __tests__/gallery-cells.test.tsx` — PASS. The gallery check on the PR shoots baselines: after the push run settles, add the `gallery:update-baselines` label (memory: never right after a push).
- [ ] **Step 4: Commit** `feat(gallery): browse tiles and rows`.

### Task 16: E2E spec

**Files:**
- Modify: `apps/main/e2e/fixtures.ts` (add `setBrowseBy`)
- Create: `apps/main/e2e/pos-browse-by.spec.ts`

- [ ] **Step 1: Fixture** (after `setVariationsStyle`):

```ts
export async function setBrowseBy(page: Page, value: 'all' | 'categories' | 'tags' | 'brands' | 'shortcuts'): Promise<void> {
	await page.getByTestId('products-settings-button').click();
	const dialog = page.getByRole('dialog').filter({ has: page.getByTestId(`ui-settings-browse-by-${value}`) });
	await dialog.getByTestId(`ui-settings-browse-by-${value}`).click();
	await dialog.getByTestId('ui-settings-close').click({ force: true });
	await expect(dialog).toBeHidden();
}
```

- [ ] **Step 2: Spec** — store-agnostic, probe-based (`CLAUDE.md` E2E policies): reuse `product-category-filter.spec.ts`'s `chooseCategory` (export it from that file or move it to `search-probe.ts`) to pick a category with members, create a probe product in it with `createSearchProbe({ productData: { categories: [{ id }] } })` under the writer credentials, skip with reason when they are not configured, and:

```ts
import { expect } from '@playwright/test';
import { authenticatedTest as test, ensureRegisterOpen, setBrowseBy } from './fixtures';
import { ensureGridView, ensureTableView } from './pos-view-mode';
// …probe imports as product-category-filter.spec.ts

test('categories first: the root shows the category, drilling in shows the probe, the crumb goes back, search spans everything', async ({ posPage: page, request }, testInfo) => {
	test.skip(!productWriterCredentialsConfigured(), 'E2E_PRODUCT_WRITER_USER/_PASS not configured — the categories-first drill needs a product the spec created');
	// …choose a ROOT category with members (`parent === 0`; a nested one renders inside its ancestor's level, not at browse-root — pick with the same store-API read product-category-filter.spec.ts uses, filtered on parent 0 and count > 0, else test.skip with the reason), create the probe in it (token from mintSearchProbeToken), wait for it to be searchable (searchAndWaitForServer)
	await ensureRegisterOpen(page);
	await setBrowseBy(page, 'categories');
	try {
		for (const view of [ensureGridView, ensureTableView]) {
			await view(page);
			await expect(page.getByTestId('browse-root')).toBeVisible();
			await expect(page.getByTestId('browse-all-products')).toBeVisible();
			await page.getByTestId(`browse-term-${category.id}`).click();
			await expect(page.getByTestId('products-breadcrumb')).toBeVisible();
			await expect(page.getByTestId(new RegExp(`^(product-tile|data-table-row-product)-${probe.id}$`))).toBeVisible({ timeout: 30_000 });
			await page.getByTestId('products-breadcrumb-back').click();
			await expect(page.getByTestId('browse-root')).toBeVisible();
			await page.getByTestId('search-products').fill(probe.token);
			await expect(page.getByTestId('browse-root')).toBeHidden();
			await expect(page.getByTestId(new RegExp(`-${probe.id}$`)).first()).toBeVisible({ timeout: 30_000 });
			await page.getByTestId('search-products-clear').click();
			await expect(page.getByTestId('browse-root')).toBeVisible();
		}
	} finally {
		await setBrowseBy(page, 'all');
		await deleteSearchProbe({ /* best effort, as the other specs do */ });
	}
});
```

Read the product tile/row testIDs on `next` before finalising the regexes (`product-tile-<id>` on the tile's image view, `data-table-row-product-<id>` on a row — confirm in `data-table/v2/rows`). The probe's category membership must survive `showOutOfStock` = false: create it `manage_stock: false`, `stock_status: 'instock'`.

- [ ] **Step 3: Run it** against dev-next (`CI=1` is fine for Playwright; it does not watch files): `cd apps/main && npx playwright test e2e/pos-browse-by.spec.ts --workers=1` with the `E2E_*` secrets from `~/.claude/.env`. Expected: PASS in both views. `next`-lane PRs do not run the web E2E suite; dispatch `deploy.yml` on the branch per memory `next-lane-live-suite-only-runs-on-dispatch` and link the run in the PR.

- [ ] **Step 4: Films** — the category deal out and back on web (Playwright `--video`, stepped) and on the Pixel over adb (memory `android-first-frame-ordering-in-reanimated-transitions` has the recipe). Save the frame captures under `packages/core/src/screens/main/pos/products/v2/captures/<date>-browse-deal/` as the variations deal did, and add a `## Browse by` line to `v2/LEDGER.md` recording what was filmed and any first-frame fix.

- [ ] **Step 5: Commit and PR** — `test(e2e): categories-first browse, both views` + `docs(ledger): browse by films`; `/codex-review`; PR `feat(pos): Browse by — gallery, E2E and films (slice 4 of roadmap#392)`. Babysit to merge.

---

## Self-review against the spec

- Setting, default `all`, dimmed sources with reason, no header control → Tasks 2, 6.
- Sources table (collections, hierarchy, image, order, hidden, product set) → Tasks 1, 3; "empty for the till, not the storefront" → `knownNonEmpty` in Tasks 1, 3 and `useBrowseCounts` (Task 6 reads `rootsOf()`, which already applies it).
- Brands on WC < 9.4 → empty collection → dimmed `No brands yet` → Task 6 (`useBrowseCounts` → 0 once answered; `undefined` while loading is not dimmed).
- Display type, descendants → Tasks 1, 12 (`renderTerm`), 10/11 (`showProducts`, `children`).
- Root: All first, no crumb, tile anatomy, no per-term colour → Tasks 4, 5.
- Inside a term: deal with parent at slot 0, children then products, crumb as the existing component, nested levels, crumb ancestors return in one pass → Tasks 10, 12 (`backTo` truncates the path; every intermediate `DealStack` sees its `detail` go `null` on the same render).
- Table: pane push, crumb above, child rows then product rows → Task 11.
- All products as a term → Task 12: `TermLevelGrid`/`TermLevelTable` with `term={{ kind: 'all' }}`, so the tile deals to slot 0 and is the way back (no separate component).
- A product drilled under All products or the search-displaced root opens in the stage → `renderProducts(drillProduct)` (Tasks 6, 12); the drill handler is identity-stable so tiles do not remount per keystroke.
- A level's detail is the stored object (path entry / drill) by identity → `DealStack` re-arms only on a real change (Task 12 `detailAt`).
- The projection belongs to the path: source change, unmount, leaving a shortcut, a dropped path all `unproject()` exactly what is still there → Task 8.
- Levels extend the query window near the end of the scroller → Task 10 (`useGuardedExtendLimit` + `onScroll`), Task 11 (DataTable's own end-reached).
- Search/scan reset to products while non-empty, root on clear → Task 8 (guard + effect), Tasks 6 and 12 (`searchDisplaced`: depth 0 is `renderProducts(drillProduct)` while the path is empty and the search non-empty), Task 12 (`drill.search`).
- A term is visible when any descendant is (POS-only branch under an organising parent) → Task 1 `visibleTerms` lifts ancestors; the tile shows no count at `count === 0` → Task 4.
- Crumb detail is the query total → the stage reads `binding.total$`; each level snapshots `{ hits, total }` together (Tasks 10, 11, 12).
- A level's rows/tiles are its own while covered or gathering → `useLevelSnapshot` (Task 10) in both the grid and the table; the stage attributes the shared answer to its query key (Task 12).
- Product drill inside a term: the term crumb closes it; every path move clears it → Task 12 (`drillParentsAt`, `goBackTo`).
- `browseBy` in the per-device hydration rule → Task 2 Step 5b (`ENUM_VOCABULARIES`, two `utils.test.ts` tests).
- Count strings are `_one`/`_other` pairs → Task 2 Step 5.
- Empty states: nothing-matches with Clear filters → the search-displaced root has it inside `renderProducts`; a term level has it through the `empty` prop (Tasks 10, 11: `index.tsx`'s `noDataMessage`, shown under slot 0 / handed to `DataTable` when the level answered with no products and has no child terms; Task 12 threads it as `BrowseStageProps.empty`). Clear filters clears the taxonomy field, which drops the path to the root — the spec's return.
- Subcategories display with all children hidden → products instead → Task 12 (`showProducts = display !== 'subcategories' || children.length === 0`).
- Test IDs, strings → Tasks 2, 4, 10, 11.
- Gallery, E2E, films, ledger → Tasks 15, 16.
- Filter bar untouched → no task touches `v2/filter-bar.tsx` or `filter-bar/*` (Task 8 only imports from them). `level` still flips to `variations` for a product drill (Task 12 Step 4).

Type consistency: `BrowseTerm`, `termKey`, `termTestId` (Tasks 2, 4) are used with those names in 5, 10, 11, 12; `BrowseTerms.{rootsOf, childrenOf, idsFor, quickFilterFor}` (Task 3) in 8 and 12; `useBrowsePath` returns `{ path, enter, backTo, root }` (Task 8) — Task 12 wraps `backTo` as `goBackTo`/`goRoot` and leaves `root` unused; `LevelAnswer`/`useLevelSnapshot` (Task 10) in 11 and 12, with the level props `answer`/`settled`/`crumb: { parents, here }`; `DrillIn.parents` (Task 9) as consumed in 12 (`drillParentsAt`); `useBrowseCounts` (Task 6) as consumed by the form.
