# The commands primitive v1: named commands, keyboard hotkeys as the first consumer

Decision ticket: [roadmap#428](https://github.com/wcpos/roadmap/issues/428) (grilled and ruled
2026-10-13). Map: [#120](https://github.com/wcpos/roadmap/issues/120). First consumer:
[#65](https://github.com/wcpos/roadmap/issues/65) keyboard hotkeys. Builds on the slot primitive
(#139, `extensions/slots`), the action-event contract (#421, `extensions/actions`,
`docs/specs/2026-10-09-action-event-contract-spec.md`) and the checkout conditions spec's line
registry (#62). Train: **2.0 on `next`**, two PRs.

## Owner decisions (2026-10-13)

- **R1** A command is a registry record `{ id, label, run(ctx, args), when?(ctx) }` in a static typed
  registry with a closed dotted vocabulary. A data command dispatches an action event through its one
  writer; a navigation command calls a host verb. **A command never writes a collection.**
- **R2** Availability is a pure, cheap `when(ctx)`, evaluated at raise time and on demand. No published
  state per command in v1.
- **R3** `run` receives a **command context**: the action context plus three enumerated host
  capabilities built by one provider at the POS root: `navigate`, `cart`, `focus`. Every verb is a
  promise that may reject (the slot `api` rule). The v1 verb list is only what the default hotkey map
  needs.
- **R4** Alt/Option chords, `preventDefault` on every bound chord, active inside inputs too.
- **R5** 2.0 on `next`, now: PR 1 the primitive, PR 2 the hotkeys module with the help sheet.
- Decided from the facts: first-party in-code registration with a serialisable record; help sheet on
  `Alt+/`; debug row per run, merchant-visible rows only for a refusal or a failure; web and Electron
  only, a no-op on native; the existing slot `api` surfaces unchanged; not in v1 the palette, hardware
  buttons, barcode macros, per-merchant key assignment.

## What it changes

- New module `packages/core/src/extensions/commands/`: the registry, the command context, the focus
  registry, README, LEDGER, tests. New module `packages/core/src/extensions/hotkeys/`: the first
  consumer, a side-effect import beside the guards.
- A `CommandsProvider` at the POS root that builds the context and mounts the key bindings.
- Mounted surfaces register their handlers with a surface registry while mounted: the Pay button its
  pay path, the void button its void path, the products search input its focus, the discount dialog
  its opener. A context verb invokes the registered handler and rejects when none is mounted.
  (Amended 2026-10-13 before PR 1: the Pay handler reads the cart conditions context, which exists
  only inside the cart column, so a hook extracted to the POS root could not see it. Registration
  moves nothing and gives "the command does what the button does, while the button exists".)
- A help sheet listing every command with its chord.
- Logs vocabulary `command.refused` and `command.failed`; `pos_commands.*` strings; the write-fence
  scanner's roots gain `extensions/`.

## 1. The registry

```ts
// extensions/commands/types.ts
export const COMMAND_IDS = [
	'pos.search.focus',
	'pos.checkout.open',
	'pos.cart.new',
	'pos.cart.previous',
	'pos.cart.next',
	'pos.cart.discount',
	'pos.cart.void',
	'pos.help.open',
] as const;
export type CommandId = (typeof COMMAND_IDS)[number];
export type CommandSource = 'key' | 'ui' | 'test'; // palette, button, macro join later
export interface CommandDescriptor {
	id: CommandId;
	/** A translation key under `pos_commands.`; the help sheet and a palette render `t(label)`. */
	label: string;
	commandApiVersion: 1;
}
export interface Command extends CommandDescriptor {
	when?: (ctx: CommandContext) => boolean;
	run: (ctx: CommandContext, args?: Readonly<Record<string, unknown>>) => Promise<void>;
}
```

- `registerCommand(command)` at import time; a duplicate id replaces with a `console.warn` outside
  production and throws in production (the action registry's rule, same reason: Fast Refresh).
  `getCommands()` returns a frozen snapshot sorted by id. `COMMAND_IDS` is closed: an id outside it is a
  type error, and the registry refuses it at runtime with a thrown error so a test catches it.
- The descriptor is plain serialisable data (id, label key, version), so a manifest can register one
  later (#226) by naming the id and the host supplying `run`; nothing in v1 depends on that.
- `runCommand(id, ctx, { source, args })`:
  1. unknown id → throws (programming error, never reached from a key);
  2. `when` present and false → resolves `{ outcome: 'refused' }` and logs `command.refused` at
     `info` with `{ type: 'command.refused', command: id, source }`;
  3. otherwise awaits `run`; a throw or rejection resolves `{ outcome: 'failed' }` and logs
     `command.failed` at `warn` with the error message; success logs a `debug` row
     `{ type: 'command.run', command: id, source }` (not in the merchant vocabulary) and resolves
     `{ outcome: 'ran' }`.
  A command is never awaited by a key handler beyond the promise `runCommand` returns; two presses
  of the same chord inside one run are dropped by the hotkeys module, not by the registry (§3).
- **Never a writer.** No command touches a collection. The write-fence scanner
  (`packages/eslint/orders-write-scanner.mjs`) gains `packages/core/src/extensions/` in its scan
  roots so any order write under `commands/` or `hotkeys/` fails the ratchet.

## 2. The command context

```ts
export interface CommandContext extends ActionContext {
	navigate: {
		/** The Pay button's whole path: blocked-by-conditions scroll, degraded block, mark saving,
		 *  enter checkout mode on a wide screen or push the checkout sheet on a phone. */
		openCheckout(): Promise<void>;
		// `leaveCheckout` is reserved with `pos.checkout.leave` (§7); no v1 command needs it
		// (amended on PR 1, 2026-10-13: removed from the v1 context for the ceiling).
	};
	cart: {
		/** Select the blank cart (`setCurrentOrderID('')`). */
		newOrder(): Promise<void>;
		/** Select an open order by uuid, or step through the open carts (`'previous' | 'next'`,
		 *  wrapping, receipts skipped). Rejects for an unknown uuid. */
		selectOrder(target: string | 'previous' | 'next'): Promise<void>;
		/** The void button's path through `cart.order.void`. Resolves when the path ran, the gate's
		 *  refusal included (the button presents it and the gate logs it); rejects only when no
		 *  void surface is mounted. (Amended 2026-10-13 on PR 1: the button's handler returns
		 *  normally after a refusal, and that is the right place to present it.) */
		void(): Promise<void>;
	};
	/** Bring a registered surface to the cashier: focus an input or open a dialog. Rejects when
	 *  nothing is registered for the target (the surface is not mounted). */
	focus(target: 'search' | 'discount'): Promise<void>;
	/** Whether a surface is mounted right now, for `when` (a verb over an unmounted one would fail). */
	hasSurface(target: SurfaceTarget): boolean;
	/** What the context can say about the screen, for `when`. */
	screen: { route: 'cart' | 'checkout' | 'other'; hasOpenOrder: boolean; openOrderCount: number; lineCount: number };
}
```

- Built by `CommandsProvider` (`extensions/commands/provider.tsx`) mounted once at the POS root, inside
  `CurrentOrderProvider` (around `<POSStack />` in the POS layout), from: `useActionContext().ctx`,
  `useCurrentOrderActions()` plus the open-orders list for `newOrder` and `selectOrder`, the surface
  registry for `openCheckout`, `void` and `focus`, and `useCheckoutMode()` for `screen.route`. The
  provider exposes `useCommandContext()` and `useRunCommand()` (a stable
  `(id, source, args) => runCommand(...)`).
- The surface registry (`extensions/commands/surfaces.ts`) is the #62 line registry's shape:
  `registerSurface(target, handler): () => void` with `SurfaceTarget = 'pay' | 'void' | 'search' |
  'discount'`, and `invokeSurface(target)` rejecting with `SurfaceNotMountedError` when nothing is
  registered. The Pay button registers its `handlePay` (so `openCheckout` runs the whole path: the
  conditions scroll, the degraded block, mark saving, checkout mode or the phone sheet); the void
  button registers its `handleRemove` (Undo snapshot, refusal presentation included); the products
  search input registers `() => inputRef.current?.focus()` (`QuerySearchInput` forwards a ref); the
  Add-discount trigger registers an opener while mounted. A detach removes only its own entry; the
  newest registration wins on a remount. `focus(target)` is `invokeSurface` over the two UI targets.
- `when` reads `ctx.screen` and `ctx.hasSurface`, nothing else; it must not read React state or await.
- Nothing in the context is a React object: no router, no order record, no component ref. A verb that
  needs one closes over it inside the provider or inside the registering surface.

## 3. The hotkeys module (first consumer)

`packages/core/src/extensions/hotkeys/` with `index.ts` (registers the eight commands' default
bindings and exports `<Hotkeys />`), `bindings.ts` (the map), `use-hotkeys.web.ts` and a native
`index.native.ts` that renders nothing. Imported for side effect by `CommandsProvider`, which renders
`<Hotkeys />` so bindings exist exactly while the POS is mounted.

Default map (Alt on Windows and Linux, Option on a Mac; `react-hotkeys-hook` spells both `alt`):

| Chord | Command | `when` |
|---|---|---|
| `Alt+F` | `pos.search.focus` | route is cart |
| `Alt+P` | `pos.checkout.open` | route is cart, lineCount > 0 |
| `Alt+N` | `pos.cart.new` | route is cart, the blank cart is not already current |
| `Alt+←` | `pos.cart.previous` | route is cart, openOrderCount > 1 |
| `Alt+→` | `pos.cart.next` | route is cart, openOrderCount > 1 |
| `Alt+D` | `pos.cart.discount` | route is cart, hasOpenOrder |
| `Alt+V` | `pos.cart.void` | route is cart, hasOpenOrder, `hasSurface('void')` (see PR 1b) |
| `Alt+/` | `pos.help.open` | always |

- `useHotkeys` from `@wcpos/hooks/use-hotkeys` with `enableOnFormTags: true` and
  `enableOnContentEditable: true`, `preventDefault: true`; one registration per binding; the handler
  calls `runCommand(id, ctx, { source: 'key' })`. A chord whose previous run has not settled is dropped
  (a `Set` of in-flight ids in the module).
- A refused chord does nothing visible (the `info` row only). A failed one shows the error's toast if
  the verb presented one (void's refusal presentation, the pay path's toasts) and nothing more.
- `Alt+F` and `Alt+D` collide with the Windows browser menu mnemonics. `preventDefault` on keydown
  stops the menu in Chrome and Edge; whether Firefox honours it for an Alt+letter access key is not
  verified (Firefox is known to toggle its menu bar on a bare Alt key**up**), so the help sheet carries
  one line naming the two chords as "may also open the Firefox menu on Windows". No remapping in v1.
- Electron: no accelerator in the app menu uses Alt+letter; nothing to change in wcpos/electron.
- Native: the module renders nothing; `@wcpos/hooks/use-hotkeys` is already a no-op there.

## 4. The help sheet

`pos.help.open` opens a `Dialog` (phone: the sheet variant the cart already uses) titled
`pos_commands.help_title` "Keyboard shortcuts": one row per registered command, `t(label)` left, the
chord as `<Kbd>` keys right (`⌥` on a Mac, `Alt` elsewhere), rows for which `when` is false at
`opacity-50` with `aria-disabled`. Pressing a row runs the command (`source: 'ui'`) and closes the
sheet. A footer line carries the Windows Firefox note. The dialog registers nothing and is mounted by
`<Hotkeys />`. It renders only on web and Electron.

## 5. Words

`pos_commands.search_focus` "Search products", `pos_commands.checkout_open` "Checkout",
`pos_commands.cart_new` "New cart", `pos_commands.cart_previous` "Previous cart",
`pos_commands.cart_next` "Next cart", `pos_commands.cart_discount` "Add discount",
`pos_commands.cart_void` "Void order", `pos_commands.help_open` "Keyboard shortcuts",
`pos_commands.help_title` "Keyboard shortcuts", `pos_commands.help_firefox_note` "On Windows,
Alt+F and Alt+D may also open the Firefox menu." Logs vocabulary (`event-registry.json`, domain
`CLIENT`, `introducedIn` `2.0.0`): `command.refused` "A shortcut was not available", `command.failed`
"A shortcut did not finish".

## 6. Behaviour that must not move

- The Pay button and the void button behave exactly as today; they gain one registration effect each
  and nothing moves, pinned by their existing tests.
- Escape in checkout (`use-checkout-back`), the orders row keys, the cart tab arrows and the browse
  level Escape are untouched; none is a command in v1.
- The barcode wedge detector sees every keystroke it sees today: the module binds chords only, and a
  chord's `preventDefault` never stops propagation.
- The three slot `api` surfaces are unchanged.

## 7. Reserved, not built

The command palette, hardware buttons (Electron `globalShortcut`), barcode macros, per-merchant key
assignment, `pos.checkout.leave` as a bound chord, line and coupon commands, published enablement
streams. Each stays possible: the registry is keyed by a closed id list that grows by edit, the
descriptor is serialisable, `CommandSource` is a union, and `when` can be lifted into a stream later.

## 8. Tests and proof

- `registry.test.ts`: closed ids, duplicate replace outside production, `when` false → refused and the
  `info` row, `run` rejects → failed and the `warn` row, success → `ran` and the `debug` row, the
  `source` recorded, descriptors frozen.
- `surfaces.test.ts`: register, detach removes its own entry only, newest wins on remount, invoke
  rejects with `SurfaceNotMountedError` when nothing is mounted.
- `provider.test.tsx`: `navigate.openCheckout` invokes the registered pay surface and rejects with
  none mounted, `cart.selectOrder('next')` wraps and skips receipts, `cart.newOrder` selects the
  blank cart, `screen` reflects checkout mode. `pay.test.tsx` and the void button's test each gain one
  case: mounting registers the surface, unmounting removes it.
- `hotkeys.test.tsx` (web): `Alt+N` keydown runs `pos.cart.new` with source `key`, also with an input
  focused; `preventDefault` called; a refused chord runs nothing; an in-flight chord is dropped; the
  native module renders nothing.
- `help-sheet.test.tsx`: lists the eight commands, greys the unavailable, a row press runs with source
  `ui`.
- Live proof (PR 2) from the PR preview against dev-next, headless: the help sheet open, `Alt+P` with a
  line in the cart entering checkout, `Alt+N` selecting the blank cart, `Alt+F` focusing search with
  the typed text landing in it; captures under `docs/captures/2026-10-13-commands/`.

## 9. Plan of record

1. **PR 1, the primitive** (`wcpos/monorepo`, `next`): `extensions/commands/` (types, registry,
   surfaces, provider, index, README, LEDGER), the four surface registrations (Pay, void, search,
   discount), `CommandsProvider` at the POS root, the eight command registrations (so PR 2 only
   binds), the scanner roots, the glossary line. No key is bound yet. Under the 400-line ceiling.
   **PR 1b, the void path to the cart column** (found on PR 1: the void button lives inside the
   order sheet, so its surface is mounted only while the sheet is open and `Alt+V` would be refused
   on the cart). The button's handler becomes `useVoidOrder()` in `cart/hooks`, the cart column
   registers the `void` surface while mounted, the button calls the hook; `pos.cart.void`'s `when`
   keeps `hasSurface('void')`, now true whenever the cart column is. Behaviour of the button
   unchanged, pinned by its tests. Lands before PR 2.
2. **PR 2, hotkeys** (`wcpos/monorepo`, `next`): `extensions/hotkeys/`, the help sheet, the words, the
   logs vocabulary, the captures walk, the README's consumer section ("how to write a module like this
   one").
   Each PR needs the `independent-review` status from a fresh Opus reviewer on its final head.

## 10. Glossary lines for `CONTEXT.md` (*Language — Extensibility*)

**Command**: a named thing the POS can be told to do (`pos.checkout.open`), raised by a key, a
button, a macro or a palette; it dispatches an action event or calls a host verb and never writes.
Closed dotted list. _Avoid_: shortcut (that is the key), action (that is the event).
**Hotkey**: a chord bound to a command by the hotkeys module. _Avoid_: hot key, keybinding.
