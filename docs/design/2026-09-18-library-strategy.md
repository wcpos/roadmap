# The library evolution strategy and the Uniwind contract

_Decided 2026-09-18 by Paul in the grilling for [wcpos/roadmap#340](https://github.com/wcpos/roadmap/issues/340), part of the [UI overhaul for 1.11.0 map](https://github.com/wcpos/roadmap/issues/282). Inputs: the [mockup-to-library concordance](https://github.com/wcpos/monorepo/blob/research/mockup-concordance/.claude/research/2026-09-18-mockup-concordance.md) and its [script addendum](https://github.com/wcpos/monorepo/blob/research/prototype-script/.claude/research/2026-09-18-prototype-script.md), the [library-evolution options and usage census](https://github.com/wcpos/monorepo/blob/research/library-evolution/.claude/research/2026-09-18-library-evolution.md), the [token block on Uniwind](https://github.com/wcpos/monorepo/blob/research/token-block-on-uniwind/.claude/research/2026-09-18-token-block-on-uniwind.md), the [motion contract proposal](https://github.com/wcpos/monorepo/blob/research/motion-contract/.claude/research/2026-09-18-motion-contract.md), and the two behaviour ledgers ([library](https://github.com/wcpos/monorepo/blob/research/component-ledger/.claude/research/2026-09-12-component-behaviour-ledger.md), [composed pieces](https://github.com/wcpos/monorepo/blob/research/composed-ledger/.claude/research/2026-09-18-composed-behaviour-ledger.md)). This page is the input to the landing order (#292) and binds every rebuild ticket that follows the map._

## In one paragraph

The new language lands **token-first** in `apps/main/global.css` and the four shared `cva` defaults, then per component: **in place** where only the skin changes, and in a **`src/v2/<name>` tier inside `packages/components`** where the behaviour changes. There is no sibling package. Composed screen pieces stay beside their screens under `packages/core` and follow the same rule. Nothing old is deleted inside a rebuild; every deletion goes through a removal ticket Paul has ruled on. Every component's hard-won behaviour lives in a numbered `LEDGER.md` beside its code before any rebuild starts, and every PR that touches a component says, line by line, what it preserved and what it struck.

## 1. Strategy

| Component class | Mechanism | Why |
|---|---|---|
| Skin changes only (most of the 58; the concordance's 28 restyle-only rows) | Restyle **in place** | Moves no ledger lines; the diff shows every deletion |
| Behaviour changes (the concordance's behaviour-differs primitives, about fifteen; finalised in the component map #291) | **`packages/components/src/v2/<name>`**, exported as `@wcpos/components/v2/<name>` | Old and new coexist per call site; one portal host, one `lib/`, one stylesheet; every resolver already maps the namespace by wildcard so it costs zero config edits and no native-fingerprint change |
| New components (status dot + label, Paid stamp, segmented control, banner, …) | A new folder under `src/` | Nothing is removed, so no ruling is needed to add one |
| Composed screen pieces (cart line, tender tiles, register bar, tab strip, orders rows, closures) | **Stay under `packages/core/src/screens/**`**, same two mechanisms (`v2/` beside the old piece when behaviour changes, in place when skin) | The library holds primitives. A composed piece moves into `@wcpos/components` only when a second screen imports it |

Rejected: a sibling package (six resolver edits including `apps/main/package.json`, duplicated platform splits and tests, and a copied file starts a fresh git history, which is how the ledger already lost `collapsible`'s past).

**Order of the token pass:** (i) the token sheet in `global.css` (the scale axis from #284, the recalibrated themes, the new names from #339 with every old name kept as an alias); (ii) the shared control core in `input`, `button`, `select`, `combobox` (the `h-10`/`h-9` defaults to the floored control token, the radius family); (iii) the states pass per component in place; (iv) `v2/` folders for the named minority.

## 2. Coexistence and a release cut

- **No runtime flag.** A screen moves to `v2` call sites **atomically, in one PR**, in the landing order. A half-switched screen mixes two languages in front of a cashier.
- A 1.11.0 cut ships whatever mixture of switched and unswitched screens exists that day; every mixture was intentional per screen.
- The token pass is **one PR, revertible as a set**, and it does **not land before a minimal gallery route** can shoot the new controls across themes, widths and scale steps with Playwright. Uniwind never errors on an unsupported construct, so the gallery is the only instrument.
- **Promotion** (when the last old caller has moved): `git mv src/<name>` → `src/deprecated/<name>` and `git mv src/v2/<name>` → `src/<name>`, so `git log --follow` keeps working on both. The deprecated folder is deleted only through a removal ticket.

## 3. The ledger lives in the repo

- **`LEDGER.md` in every component folder** that has ledger lines (58 under `packages/components/src`, 48 composed pieces under `packages/core`), seeded from the two research branches in one mechanical Codex PR on `next` **before any rebuild ticket opens**.
- Lines carry **stable numbers assigned once at seeding and never reused**; a struck line leaves a gap. Each line keeps its evidence (commit, issue, verbatim comment with file and line).
- A `v2/<name>/LEDGER.md` is the old sheet plus a **status per line**: `preserved` with a pointer to the new code, `struck` with a link to the ruling, or `n/a` with a reason.
- "Preserved" means the **behaviour**, not the comment. Where a load-bearing line has no test, the rebuild ticket adds the test before the restyle.

## 4. The Uniwind contract for a rebuilt component

**May use:** semantic utility classes; `@theme` token names (`bg-card`, `text-muted-foreground`, `h-ctl`, …); `web:` / `native:` / `ios:` / `android:` variants; `active:`, `focus:`, `disabled:`; width breakpoints; `transition-*`; `max()` / `min()`; `color-mix()` (knowing native mixes in RGB, so tonal surfaces are precomputed tokens); `tabular-nums`; `gap`; the `*-safe` utilities for safe areas. `useCSSVariable` only to feed a third-party API that takes a colour value. Never a hex or `oklch()` in a component. Scale, theme and the pointer floor are set at the app root through Uniwind's runtime variables (`ScopedVariables`, per [the scale and density page](2026-09-18-scale-and-density.md), #289); a component never reads the scale step.

**Banned on shared or native code, with the replacement:**

| Banned | Because | Use instead |
|---|---|---|
| bare `hover:` | inert or leaking on native | `web:hover:` |
| `group-*` | no runtime effect without Uniwind Pro (not licensed, not wanted) | lift the state into React |
| `before:` / `after:` | no RN equivalent | a child `View` |
| `animate-*` without a native twin; `motion-reduce:` / `motion-safe:` | no keyframes path in Uniwind; the media guard is inert on native | `web:animate-*` + a Reanimated twin from `lib/motion.ts` |
| `focus-visible:` | never matches on native | `focus:` |
| `clamp()` | unsupported, emits the bare name | `max(min(…))` or JS |
| `filter`, `backdrop-filter`, `mask-image` | mapped to nothing | a pressed-state colour token; `expo-linear-gradient` for scroll fades |
| `sticky` | not an RN position | `stickyHeaderIndices` |
| `truncate`, `whitespace-nowrap`, `text-ellipsis` | inert as CSS | `numberOfLines` + `ellipsizeMode` |
| CSS grid | not yet in RN | flex-wrap with a computed column count, or `numColumns` |
| `outline` as a focus ring | no RN outline | border or `boxShadow` that does not change layout |
| `data-[…]` for theme, scale or pointer | those axes ride the root's `ScopedVariables` (#284, #289) | tokens |

**Enforcement, a ratchet:** a lint test over class strings in `packages/components` and `packages/core` fails on the banned prefixes. Today's offending sites (3 bare `hover:`, 47 `group-*`, 31 `web:animate-*` without a twin, and the rest) go into an allowlist file that **may only shrink**; the test fails if it grows, and a site leaves the list when its component is rebuilt.

## 5. The motion contract

Adopted as proposed in the motion research: `packages/components/src/lib/motion.ts` owns every named duration and easing and a `BEATS` record; it generates the web `@theme` motion tokens so the two runtimes share one definition; a test asserts every `web:animate-*` class names a real token. Banned: decorative motion, over 400 ms on a waiting path, non-interruptible beats, ticking numbers, gliding tabs. Reduce-motion: native takes Reanimated's system default; web gets one `@media (prefers-reduced-motion: reduce)` block in `global.css` with the spinner and the indeterminate bar excluded by name.

Two rulings inside it (Paul, 2026-09-18):

- **"No sliding rows" means no reorder glide.** Arrival beats stay: the tile stagger and the payment-row land. The **tile stagger keeps a fixed step and a hard cap of eight tiles**; tiles past the eighth appear with it, so the last tile lands inside 400 ms. The beat record carries both numbers and the reason.
- **The two shipped over-budget beats are fixed, not grandfathered:** the 800 ms add pulse (`table/pulse-row.tsx`) and the 600 ms Paid tick (`receipt-stage.tsx`).

## 6. The removal gate

A **removal** is the deletion of any of: a component, a variant, a prop, a platform branch, a ledger line's behaviour, a token, an export.

1. **A rebuild PR removes nothing.** Under `v2/` the old component stays until promotion; a new component is added beside the old one.
2. **An in-place restyle lists every ledger line** of the touched component in its PR body as preserved (pointer) or struck (link). A struck line with no ruling blocks the PR.
3. **A removal happens only in a removal ticket Paul has ruled on**, listed in the component map (#291) with its reason, and lands in its own PR.
4. **Tokens retire by alias.** The token pass keeps every old name as an alias; an alias retires through a removal ticket after class greps **and** `useCSSVariable` greps both read zero (the two zebra-striping reads in `table/` are the case that breaks silently).

**Ruled now (2026-09-18), one housekeeping PR before the token pass, item zero of the landing order:** delete `--tertiary`, `--duration-750`, and `--error` after its 17 sites move to `--destructive`; revive `--radius` as the radius token; delete the dead exports `data-table`, `tree-select`, `toggle`. One-line note each.

## 7. How a judgement call is raised

Every two-candidate or no-home row in the concordance becomes **one question on the component map (#291)**, answered by Paul before the component is specced, never inside an implementation PR. The 31 questions from the concordance and the 16 from the script reading are already filed there. Adding a new component beside an old one removes nothing and needs no ruling; the concordance question is still filed so the map records the choice.

## 8. Pre-work and where it goes

| Work | Where | Blocks |
|---|---|---|
| Bump the Uniwind lockfile pin to 1.11.0 and re-check animation, `focus-visible`, `ScopedVariables`, `box-shadow` | task ticket on the map (AFK) | the landing order (#292) |
| Seed `LEDGER.md` in every folder from the two research ledgers, numbered | task ticket on the map (AFK) | the component map (#291) |
| The housekeeping PR (six deletions, revive `--radius`) | item zero of the landing order | nothing |
| A minimal gallery route | first item of the landing order after housekeeping | the token pass |

## Glossary

- **Restyle** — a change to a component's skin only: classes, tokens, `cva` defaults. Done in place.
- **Rebuild** — a change to a component's behaviour: composition, props, interaction model. Done in a `v2/` folder beside the old one.
- **v2 tier** — `packages/components/src/v2/<name>`, the parallel home of a rebuilt component until promotion.
- **Promotion** — the `git mv` pair that makes `v2/<name>` the default and parks the old one under `deprecated/`.
- **Ledger line** — one numbered, evidenced behaviour a component learned; lives in its folder's `LEDGER.md`.
- **Preserved / struck** — a ledger line's status after a change: the behaviour still holds (pointer), or it was removed under a ruling (link).
- **Removal** — deleting a component, variant, prop, platform branch, ledger behaviour, token or export. Only through a removal ticket.
- **Beat** — a short, interruptible completion animation defined once in `motion.ts`; never decoration.
- **Ratchet** — an allowlist of existing rule breaks that may only shrink.
