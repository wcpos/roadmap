# Filters and breadcrumbs in the POS product browser

2026-09-17 · for the v1.11 register (ticket #287, map #282). Prototype:
`docs/prototypes/2026-09-12-language/pos-register/index.html`, table or grid view.

## The question

The product table and grid now drill in: a variable product's variations behind a breadcrumb
(and, when this was asked, a category too; see the last section for why that went). The filter bar sits above with the app's chips (Stock status,
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
| Breadcrumb | Where am I? | `Products › Tote bag` | No: it *is* the level |
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

**Conditions that disagree.** Merch ticked with `Morning menu` on (which includes a category
clause of its own) gives an empty pane: *Nothing here matches the filters* with **Clear
filters**. That is honest and one tap away from recovery. The alternative, quietly dropping one
clause because another contradicts it, produces a list the chips do not describe.

## Many categories, and a tag on top

Paul (2026-09-17, with a screenshot of today's POS: `Promotions +31 ×` beside `Acme ×`): today a
user can tick many categories and add a tag. Under the rule this is not a breadcrumb question
at all. A breadcrumb holds **one** place; thirty-one categories are not a place, they are a
condition. So:

- **Category is a chip, not a crumb.** Its menu is a checkbox list, as today. Off, it reads
  `Category ▾`. On, it reads the first pick and how many more (`Drinks +1`, `Promotions +31`),
  the full list in its tooltip, and it splits in two: the label reopens the list, the × clears
  the whole group, which is exactly the shape today's chip already has.
- **Tag is the same chip.** `Tag ▾` off; `Acme ×` on. Both filled, both in the bar, ANDed with
  everything else. Within a group the picks are OR (any of these categories); across groups
  they are AND (one of these categories, and this tag, and in stock). That is the standard
  faceted-search semantics and what today's POS does.
- **The breadcrumb is for variations only, for now.** `Products › Tote bag`. Categories would
  earn a crumb only if the POS gained folder browsing (tap a category tile, go inside it, as
  Loyverse and Square do), and that would be navigation living beside the chip, not instead of
  it. The category slide from board 4 is therefore out of the register; the grid still staggers
  on every re-fill, which is the motion Paul chose for it.
- **Clear all** appears at the end of the bar as soon as two groups are on, so `Promotions +31`
  plus `Acme` is one tap to undo.

Nothing changes for the footer: it says what the whole set left, `3 of 12`.

## What the prototype does

- Category chip: a checkbox list; the chip fills with `Drinks +1 ×`. The label reopens the list,
  the × clears the group. Tag is the same. No crumb, no slide.
- Stock chip: a select (Any, In stock, Low stock, Out of stock); the chip fills with the pick.
- Featured chip: a toggle; filled with × when on.
- Morning menu: the quick filter as above.
- Footer: `12 of 1,204` unfiltered; `n of 12` when anything narrows; `n of 3` in the variations.
- Empty state in the pane with Clear filters (clears every chip, not the place). Clear all at
  the end of the bar once two groups are on.

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
