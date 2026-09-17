# Filters and breadcrumbs in the POS product browser

2026-09-17 · for the v1.11 register (ticket #287, map #282). Prototype:
`docs/prototypes/2026-09-12-language/pos-register/index.html`, table or grid view.

## The question

The product table and grid now drill in: a category, then a variable product's variations,
each behind a breadcrumb. The filter bar sits above with the app's chips (Stock status,
Featured, On sale, Category, Tag, Brand) plus the user's own quick filters. Paul asked how the
two interact:

- You have a variable product open. Can you toggle in stock / out of stock? Does that show in
  the breadcrumb?
- What if In stock and Featured are both on?
- What if a quick filter is on whose query has several parts?

## The rule

**The breadcrumb is the place. The chips are the conditions. The footer is the count.**

Three separate jobs, three separate places, and nothing is ever said twice.

| | Answers | Lives in | Persists across levels |
|---|---|---|---|
| Breadcrumb | Where am I? | `Products › Drinks`, `Products › Tote bag` | No: it *is* the level |
| Chips | What am I narrowing by? | the filter bar, filled when on | Yes |
| Count | What did that leave? | the footer, `3 of 12`, `2 of 3` | Recomputed per level |

This is the split NN/g draws between hierarchy and facets and the one Baymard's navigation
research assumes: breadcrumbs communicate position in the taxonomy; applied-filter chips
communicate the facet values constraining the list. Some retail sites merge the two into
"attribute breadcrumbs" (`Products > Brand: Apple > In stock`), and the guides that describe
them treat it as a separate pattern for very large catalogues, not a replacement. At a till the
path is at most two levels deep, the chips are already on screen, and a merged crumb would grow
with every tap. Keep them apart.

## The answers

**A variation open, then toggle stock.** Yes. The chips stay usable at every level. Stock is a
variation-level attribute, so the variations pane narrows (`2 of 3` in the footer) and the Stock
chip fills (`Stock · In stock`). The breadcrumb does not change: you are still in
`Products › Tote bag`.

**In stock and Featured both on.** Two filled chips, ANDed, one count. `Stock · In stock` and
`Featured ×` in the bar, `3 of 12` in the footer, the crumb untouched. Chips are additive and
each is removable on its own, which is the whole reason they are chips and not a sentence.

**A quick filter with several parts.** One chip, named by the user, with a small badge for the
number of parts (`Morning menu ②`). One tap turns it on. When it is on, tapping it opens a small
sheet listing its parts (`Category · Drinks, Bakery` / `Stock · In stock`) with **Turn off** and
**Edit**. This is the saved-view pattern in Linear, Notion and Innovaccer's design system: the
summary chip collapses the conditions, and progressive disclosure shows them on request. The
parts AND in with everything else; the quick filter does not replace the other chips, and it
does not expand into loose chips that could be removed one by one (that would silently edit the
saved filter).

**A chip that does not apply at this level.** Inside a product's variations, Category,
Featured, On sale, Tag and Brand are product-level facets: they cannot narrow a list of one
product's variations. Those chips stay on (the user set them and will return to the list) but
dim, and their tooltip says why: *A product filter; not used inside a product's variations.*
Stock keeps full weight because it applies. Nothing is silently dropped and nothing lies about
what is filtering.

**A place and a condition that disagree.** The place always wins the *scope*; the conditions
narrow inside it. Drilling into Merch with `Morning menu` on (which includes a category clause)
gives an empty pane: *Nothing here matches the filters* with **Clear filters**. That is honest
and one tap away from recovery. The alternative, quietly ignoring the quick filter's category
clause because a crumb superseded it, produces a list the chips do not describe.

## What the prototype does

- Category chip: a select (menu); a pick slides to the category pane and fills the chip with
  `Category · Drinks ×`. The × and the breadcrumb's `‹ Products` both return.
- Stock chip: a select (Any, In stock, Low stock, Out of stock); the chip fills with the pick.
- Featured chip: a toggle; filled with × when on.
- Morning menu: the quick filter as above.
- Footer: `12 of 1,204` unfiltered; `n of 12` when anything narrows; `n of 3` in the variations.
- Empty state in the pane with Clear filters (clears the chips, not the place).

## Sources

- NN/g, Filters vs. Facets: https://www.nngroup.com/articles/filters-vs-facets/
- NN/g, Breadcrumb navigation increasingly useful: https://www.nngroup.com/articles/breadcrumb-navigation-useful/
- Baymard, Homepage and category navigation UX: https://baymard.com/blog/ecommerce-navigation-best-practice
- Pencil & Paper, Breadcrumbs UX (attribute breadcrumbs): https://www.pencilandpaper.io/articles/breadcrumbs-ux
- Pencil & Paper, Enterprise filtering patterns: https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering
- Innovaccer design system, Table filters (collapsed chip groups, saved filter views): https://design.innovaccer.com/patterns/tableFilters/usage/
- PatternFly, Filters: https://www.patternfly.org/patterns/filters/design-guidelines/
- Linear, Custom views: https://linear.app/docs/custom-views
- Notion, Views, filters, sorts and groups: https://www.notion.com/help/views-filters-and-sorts
