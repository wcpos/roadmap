# Apps with a similar stack and goals: extension models, action interception and local-first data layers, 2026-10-08

Asked by Paul, 2026-10-08: which shipping apps share our stack and goals, and what do their extension models, their action or event interception, and their local-first reactive data layers look like? This note feeds two tickets. The first is [roadmap#120](https://github.com/wcpos/roadmap/issues/120), the app extensibility map. The second is [roadmap#421](https://github.com/wcpos/roadmap/issues/421), the action-event contract: a middleware chain on named POS actions that can observe, rewrite or refuse, and that must stay complementary to RxDB. It builds on two earlier surveys and does not repeat them. The #140 survey covered React composition, TurboModules, Re.Pack, Shopify Remote DOM, Expo RSC and DOM components, store policy, and Bluesky, Expensify and Mattermost [3]. The #124 survey covered Shopify POS, Square, Clover, Toast and Odoo [4]. Claude Code mods are the model for #421 and are summarised on that ticket [1][5]. Following the sources ruling of 2026-09-02, WordPress and WooCommerce idioms are excluded and contribute nothing here [2]. This is desk research only: official docs, source code read at a stated tag or branch, and vendor engineering blogs.

Labels: **S** Sourced (primary page, repo or code, linked in Sources). **S†** Sourced from a vendor page that would not render, read from a mirror, a search engine's copy, or the docs' source in the repo. **I** Inferred. **U** Unverified. **NE** Not evaluated. A claim with a footnote and no label is S. Secondary sources (forums, third-party write-ups) are named as such where they are used.

## The short answer

1. **No shipping app has our whole shape.** None combines RN/Expo, web and Electron, local-first sync to a server, a money path, and an extension platform. The nearest on stack are listed below; the nearest on goals are server-side ERP hooks (Frappe) and one tiny Go POS.
   - **Notesnook** is RN, Electron and web, and local-first. It has no extension system, and its "Extensions" issue has been open since 2022 [6][8].
   - **Standard Notes** has an RN shell around a WebView, plus Electron and web. Its extensions run in iframes over a permissioned postMessage relay [9][10][11].
   - **Joplin** is RN and Electron. Its plugins run in a separate process; on mobile they run in iframes inside a WebView, and iOS is limited to a curated list [15][21][23].
   - **Actual Budget** is local-first on Electron and web with CRDT sync. Its plugins are unshipped, and its frontend plugin stack was abandoned [33][34][36].
2. **No one surveyed lets an untrusted extension refuse an action before it is written.** In every case the veto belongs to trusted code:
   - In VS Code, an extension's will-save listener can delay a save and add edits, but by the code path only VS Code's own participants can cancel it (I from [76][77]).
   - Obsidian, Joplin and Logseq expose only after-the-fact notifications. Logseq's `onBeforeCommandInvoked` cannot cancel the command [26][17][31]. Joplin built a general filter API and switched it off [18].
   - Real veto-before-write exists only in host-owned, first-party lanes: Frappe `validate`, Vendure `onTransitionStart`, Medusa workflow hooks, tldraw before-handlers, Zero mutators [41][95][92][101][64].
   - That is the split #421 already draws: refusal by trusted policy hooks, fail-open for extensions.
3. **VS Code is the only system with an enforced time budget, and its design is worth copying.** It has four parts:
   - one budget of 1.5 s shared by every listener on the event;
   - a listener is ignored after 3 strikes;
   - async work can be registered only during dispatch;
   - a rewrite is applied only if the document version has not moved [75][76].

   Vendure only logs a warning at 100 ms [96]. Saleor's 20 s is a server number [97]. Figma admits a plugin "can hang, and there is no way to interrupt" it [82].
4. **RxDB's own hooks do not run on replication pulls (verified in 17.5.0 source).** Pulled documents go straight to the storage instance's `bulkWrite`, which never calls `_runHooks` [47][48][51]. #421 marked this point Inferred; it is now Sourced. A second fact matters for #421: a throwing `preSave` rejects every queued incremental write on that document [49]. RxDB middleware is unsafe as a veto point twice over: it misses pulls, and it rejects writes it was not asked about.
5. **Named mutators are the closest analogue to "one named action, one writer".** Replicache and Zero mutators, WatermelonDB `@writer` methods, TanStack DB actions and Excalidraw's single `updater` all follow the pattern [62][64][54][61][104]. Each makes the named function the only write path. TanStack DB even documents a lint rule that forbids UI writes outside actions [61].
6. **Raycast is the cleanest proof of "compose host components, never ship a renderer" with React authoring.** Extensions write React against Raycast's components, a custom reconciler turns the tree into a JSON render tree, and the host diffs it with JSON Patch and draws natively [87][88]. Figma is the proof of the "membrane": one small audited capability interface, so the sandbox could be swapped from Realms to QuickJS within days of a sandbox escape [82][83].

## Axis A: apps on the same stack with similar goals

**Notesnook** (axis A only).
- The stack is React everywhere, React Native for mobile and Electron for desktop. Everything is encrypted on the device with XChaCha20-Poly1305 and Argon2 [6].
- Storage is SQLite through Kysely, and sync runs over SignalR. The merge is last-write-wins on `dateModified`, and conflicting content is kept as a `conflicted` copy [7].
- There is no plugin system. Issue #459, "Extensions" (2022), has one maintainer reply: "Added to the Suggestion Features list" [8].
- **In our position (I):** Notesnook would ship no extension surface at all. That is the Bluesky, Expensify and Mattermost result from #140 [3] again.

**Standard Notes** (axes A and C).
- The RN app wraps the web app in a WebView (`MobileWebAppContainer.tsx`) [9].
- Extensions are full HTML apps in iframes. They talk over a closed enum of postMessage actions: `stream-items`, `stream-context-item`, `save-items`, `create-item(s)`, `delete-items`, `set-component-data`, `request-permissions` and others [9].
- **Permissions are action plus content type:** `{ name: ComponentAction; content_types?: string[] }`. The consent prompt text is generated from them [10].
- The host gates writes. A locked note refuses `save-items` with "…is trying to save, but it is in a locked state and cannot accept changes." Third parties have no interception point [11].
- The iframe has no `allow-same-origin`, so its origin is `null` and messages go to `'*'`. A per-window `sessionKey` makes up for that [11][12].
- In November 2023 Standard Notes moved its own Markdown, Rich text, Code and Checklist iframe editors out to a "Plugins" pane. It marked them deprecated and recommended the first-party "Super" note type instead [13]. Why is not stated in a primary source (U).
- Third-party plugins "are not reviewed by the Standard Notes team" [14].
- **In our position (I):** Standard Notes' relay is our mini-app bridge with a better consent string. Its move back to a first-party editor matches the #120 ruling that hot UI stays host-drawn.

**Joplin** (axes A and C; the closest peer that ships plugins on RN).
- "The plugin system assumes a multi-process architecture, which is safer and easier to manage." On desktop each plugin gets a new `BrowserWindow`, and API calls cross IPC as strings, with event handlers swapped for ids [15].
- The desktop process isolates crashes, not code. The window is created with `nodeIntegration: true, contextIsolation: false` [16].
- `joplin.data` is a REST-shaped API: "use the methods in this class as if you were using a REST API" [17].
- **Every workspace event is a notification:** `onNoteChange`, `onNoteSelectionChange`, `onSyncStart`, `onSyncComplete`. The only filter is `filterEditorContextMenu`, which adds menu items [17].
- **A general filter API exists and is disabled.** The source says: "Not sure if it's the best way to hook into the app so for now disable filters" [18].
- Content scripts extend the Markdown renderer and the editor, but "it is not a way to inject and run arbitrary code in the app, which for safety and performance reasons is not supported" [19].
- The manifest has no permissions field. It declares `platforms`, which defaults to `["desktop"]`, and `app_min_version_mobile` [20].
- **On mobile, plugins run in iframes inside a WebView:** "On mobile, all plugins run in `iframe`s within a `WebView`"; on web, in an `about:srcdoc` iframe [21]. `require` allows only `path`, and `fs` is a "non-functional mock" [22].
- On iOS: "To adhere to AppStore guidelines, the iOS app only allows installing recommended plugins" [23].
- **In our position (I):** Joplin would build a sandboxed tier in a WebView and curate it on iOS. The curation is its answer to Apple 4.7. Its retreat from filters is evidence that a general interception API is the hard part, and that a closed list of named points is safer.

**Obsidian** (axis C; Capacitor, not RN).
- Its own statement: "Obsidian cannot reliably restrict plugins to specific permissions or access levels. This means that plugins will inherit Obsidian's access levels." Restricted Mode is the default, and every plugin version is scanned [24].
- On mobile, "The Node.js API, and the Electron API aren't available… can cause your plugin to crash." The fix is `isDesktopOnly: true` [25].
- Events are `vault.on('create'|'modify'|'delete'|'rename')`, `metadataCache.on(...)` and `workspace.on(...)`, registered through `registerEvent` so they detach on unload [26][27].
- Handlers return `any`, so nothing can veto. The only cancellable events are DOM-level: `editor-paste` and `editor-drop` via `evt.preventDefault()` [27].
- `quit` is "Not guaranteed to actually run" [27].
- Interception is in practice done by monkey-patching prototypes. That is secondary and inferred; the guidelines do not mention it.
- The guidelines warn against `innerHTML` and against the global `app` object [28].
- **In our position (I):** Obsidian's model is trusted, unsandboxed code with UI built from raw DOM. That is ruled out for us by Apple 4.7 [3] and by the host-component ruling [2]. Its lesson is `registerEvent`: every subscription is owned by the extension, so unloading cleans it up.

**Logseq** (axis C).
- Plugins run either in an iframe through a Postmate fork, or in "shadow" mode inside the main window [29].
- The iframe gets no `sandbox` attribute, only `allow`, and messages to file:// origins go to `'*'` [29]. Isolation is therefore weak (I).
- `DB.onChanged` exposes "all transaction data of DB" after the fact [30].
- **`onBeforeCommandInvoked` cannot veto.** The host fires `:before-command-invoked`, then runs the command unconditionally, then fires `:after-command-invoked` [31].
- Capacitor mobile has no plugins at all [32].
- **Lesson (I):** do not call an observe-only hook "before". The name promises a veto it cannot deliver.

**Actual Budget** (axes A and B).
- A "background server" runs in a web worker on the web, or as a Node child process over WebSockets in Electron, on SQLite [33].
- Sync is a CRDT package shared between client and server, with protobuf messages and a Merkle tree [34].
- An architecture decision record keeps bank credentials server-side because exposing them "to extensions and plugins… would increase the attack surface" [35].
- A ten-PR frontend plugin stack on module federation was closed unmerged in March 2026. Its core PR had proposed a `middleware.ts` to "control the rendering of plugin components without having to expose the containers", with try/catch isolation "(not implemented)" [36].
- The live track is server-side bank-sync plugins: zip packages with a `manifest.json` and zip-slip protection, PR 1 of 14, open [37].
- **In our position (I):** Actual would put money integrations on the server first and keep secrets out of client-side extension reach. That matches our descriptor, where the gateway's PHP does the work and the app draws declared UI.

**Element Web** (axis C; Element X and Signal add nothing, since one is native and the other has no extension API).
- Modules declare `static moduleApiVersion = "^2.0.0"` [38].
- `BuiltinsApi` (alpha) "Exposes components… that are part of Element Web to allow modules to render the components as part of their custom components" [39]. It is the only peer that lends host components to modules.
- `registerShouldShowComponent` is a tri-state chain: "if it returns true the component will be rendered, if false it will not be. If undefined will defer to next callback, ultimately falling through to `true`" [39].

**Open-source POS** (axes A and C).
- **POS Awesome** is a Vue and Vuetify Frappe app, web only. Upstream was last pushed in August 2024 [40]. The active V15 fork adds Dexie offline storage and an Electron shell (S, repo tree [40]).
- **Frappe controllers are the strongest documented veto-before-write in retail software.** `validate`: "Use this method to throw any validation errors and prevent the document from saving." Alongside it are `before_insert`, `before_save`, `before_submit` and `before_cancel` [41], hooked per doctype through `doc_events` [42].
- Frappe warns that `override_doctype_class` "can cause issues when you have multiple apps overriding the same DocType class" [42].
- These hooks are server-side, so an offline client bypasses them (I).
- **Universal Till** is a Go offline-first EPOS with Ed25519-signed WASM plugins. It is tiny (3 stars, created September 2025), so weigh it accordingly [43]. It has one blocking pre-tender seam, `payment.<key>.authorize`, beside after-the-fact events [43].
- Its review documents a real incident: "a plugin declaring `{type:"payment", key:"cash"}` captured the built-in cash tender and — once the plugin was disabled — the sync's deactivate step removed cash from checkout entirely." The fix was "First owner wins" plus validation at install time [44].
- No credible RN, Expo or Electron POS with a plugin model was found on GitHub (I: the searches turned up only hobby apps).

## Axis B: local-first reactive data layers and an action layer

The questions for each layer: where intent lives versus where state changes, whether anything can veto before the write, and how two writers are avoided.

**RxDB 17.5.0 (ours).**
- **Hooks.**
  - The hooks are `preInsert`, `postInsert`, `preSave`, `postSave`, `preRemove`, `postRemove` and `postCreate`. They run in series or in parallel, sync or async, except `postCreate`, which cannot be async. "To stop the operation at a specific hook, throw an error" [45].
  - Hooks mutate `data` in place, so they can rewrite [46].
  - `incrementalModify` and `incrementalPatch` go through the incremental write queue. Its pre-write is `beforeDocumentUpdateWrite`, which ends in `_runHooks('pre', 'save', …)` [46][50].
  - When a pre-hook throws, the queue rejects every pending write on that document: "it is not possible to determine which one is to blame" [49].
- **Replication bypasses the hooks.**
  - The replication plugin passes `forkInstance: this.collection.storageInstance` [47]. The downstream path writes pulled documents with `state.input.forkInstance.bulkWrite(…)` [48], and conflict writes take the same route [51].
  - The storage-helper `bulkWrite` contains no `_runHooks`. It runs only the internal plugin hook `preStorageWrite` [51].
  - The sanctioned place to touch pulled data is `pull.modifier`, which "can be called multiple times and should not contain any side effects" [52]. Whether it can drop a document is U.
- **Origin of a change.**
  - `RxChangeEvent` has no origin field. `isLocal` means a *local document*, not "written on this device" [51].
  - The bulk event carries `context`: `'replication-downstream-…'` for pulls, and `'incremental-write'` or `'rx-collection-bulk-insert'` for local writes. RxDB itself uses it to avoid pushing pulled documents back up [51]. It is exposed only on `eventBulks$`, which the source comments as internal [46].
- **Conflicts.**
  - "The default conflict handler will always drop the fork state and use the master state" [52].
  - "A single write operation to a document is the only atomic thing you can do" [53].
  - A pull skips a document that has an unpushed local write until that write has gone up [48].
- **Answer:**
  - **Intent:** RxDB knows only document state.
  - **Veto:** a throw in a pre-hook, but on collection and document writes only.
  - **Two writers:** RxDB *has* two, the app and replication. It separates them by write context and by pushing before pulling.

**WatermelonDB.**
- "All changes must be done within a Writer." It will "only allow one Writer to run at the time" [54].
- The stated reason is ours exactly: "a function could have invariants determining whether the user is allowed to perform an action, that would be invalidated during action's execution… having sync that runs automatically makes them very likely" [54].
- It recommends named `@writer` methods on models, "to organize all code that changes the database in one place". A writer cannot call another writer without `callWriter` [54].
- Sync applies remote changes inside the same `database.write` [55].
- **Answer:**
  - **Intent:** named writer methods.
  - **Veto:** inside the writer.
  - **Two writers:** one global lock, and sync queues behind it.

**PowerSync.**
- A local write and its upload-queue entry are written "in the same transaction, the upload queue can never get out of sync with local data" [56].
- "While mutations are present in the upload queue, the client does not advance to a new checkpoint. This means the client never has to resolve conflicts locally" [57].
- Rejection happens on the server. Validation failures should return `2xx`, because a `4xx` blocks the queue [58].
- Business rules are "the gatekeeper" on the backend. Intent can be recorded as a separate change-log table with a status [59].
- **Answer:**
  - **Intent:** CRUD diffs, plus optional intent tables.
  - **Veto:** none on the client; the server decides after the fact.
  - **Two writers:** downloads are held until the queue drains.

**ElectricSQL with TanStack DB.**
- "Electric does not do write-path sync" [60]. The writes guide offers four patterns. Its rollback caveat: "When syncing through the database, the original write context is much harder to reconstruct" [60].
- TanStack DB's `createOptimisticAction` gives "intent-based mutations that capture specific user actions." If the handler throws, "the optimistic state is automatically rolled back" [61].
- "Some teams require UI writes to use actions so shared validation, side effects, and persistence logic remain together", enforced with ESLint [61].
- **Answer:**
  - **Intent:** named actions.
  - **Veto:** a throw inside the action.
  - **Two writers:** synced and optimistic state live in separate layers, and a lint rule stops direct writes.

**Replicache and Zero** (the closest analogue to #421).
- "A mutator is a named JavaScript function… calling a mutator also creates a *mutation*: a record of a mutator being called with specific arguments" [62].
- **The server re-runs mutations and need not agree:** "the server is authoritative… the pending mutations applied on the client are *speculative*" [62].
- Rebase rewinds to server state and replays pending mutations. "It is possible and common for mutations to calculate a different effect when they run during rebase… a calendar invite may run during rebase and find that the booked room is no longer available" [62].
- An invalid mutation must still be marked processed: "ignore that mutation and increment the `lastMutationID` as if it were applied" [63].
- Zero: "Mutators are how you write data with Zero." "If the mutator throws, the entire mutation is rolled back." The server copy "can add extra checks to enforce permissions." A throw on the server reverts the client's optimistic write [64].
- "Do not generate IDs inside mutators, since mutators run multiple times" [65].
- **Answer:**
  - **Intent:** the mutation (a name plus arguments) is what syncs.
  - **Veto:** a throw, on the client and again on the server.
  - **Two writers:** server state underneath, local mutations replayed on top.

**Triplit.**
- "Access control checks run exclusively on the server… Invalid writes will only be rejected when they have been sent to the server." On rejection the client may `clearPendingChangesForEntity` or retry (S†, the docs' source in the repo [66]).
- **Answer:** no intent layer, no client-side veto, and an outbox.

**TinyBase.**
- Its middleware can rewrite or cancel. For `willSet*`, "the return value is used as the new value… If the function returns undefined… the operation is cancelled." Callbacks chain, and a cancellation stops the rest [67].
- Transactions roll back on a throw or through `doRollback`. `addWillFinishTransactionListener` can still mutate data; `DidFinish` cannot [68].
- **Unlike RxDB, sync merges pass through the same middleware.** `applyMergeableChanges` → `applyChanges` → `willApplyChanges` (S from source [68]).
- **Answer:**
  - **Intent:** store operations only.
  - **Veto:** synchronous middleware.
  - **Two writers:** one pipeline for everything.

**LiveStore.**
- "Your app commits **events**, the **eventlog** orders them, **materializers** derive **state**." The eventlog is "the source of truth" [69].
- Event names are past tense, "to indicate something already occurred" [70].
- If a materializer throws on the committing client, "the event will never be committed and pushed" [71]. Materializers must be "side-effect free and deterministic" [71].
- Local pending events are rebased on upstream, and "the sync backend acts as the global authority" [72].
- Authorisation is left to an `onPush` check on the server [73]. What a rejection does on the client is U.
- **Answer:**
  - **Intent:** events.
  - **Veto:** a throwing materializer, or a check before `commit`.
  - **Two writers:** only materializers write state.

**Linear** (secondary only: a third-party reverse-engineering, not affiliated with Linear [74]).
- `save()` creates an `UpdateTransaction` that is queued and persisted. The in-memory model updates at once, but the local IndexedDB copy is written only from server deltas, because "it cannot contain changes that have not been approved by the server."
- A server rejection runs `rollback`. Conflicts are last-writer-wins [74].

## Axis C: extension and interception models worth borrowing

**VS Code extension host.**
- **Manifest and isolation.**
  - Contribution points are "JSON declarations… in the `contributes` field of the `package.json`". Activation events defer loading, and when-clauses gate UI [80].
  - Extensions run in an Extension Host process with no DOM access. That process "has the same permissions as VS Code itself" and is not sandboxed [81].
  - Each extension gets its own `vscode` API instance from a factory. Unreleased APIs are gated by the manifest's `enabledApiProposals`; a violation throws "Extension '…' CANNOT use API proposal" [79].
- **The will-save budget.**
  - "Subscribers are called sequentially and they can delay saving by registering asynchronous work… there is an overall time budget that all listeners share and if that is exhausted no further listener is called; listeners that take a long time or produce errors frequently will not be called anymore. The current thresholds are 1.5 seconds as overall time budget and a listener can misbehave 3 times before being ignored." Also: "the editor might save without firing this event" [75].
  - `waitUntil` "can only be called during event dispatch and not in an asynchronous manner" [75].
- **How it is enforced.**
  - The thresholds are hard-coded as `{ timeout: 1500, errors: 3 }`. The listener's promises are frozen once it returns, and offenders are logged as "will now be IGNORED because of timeouts and/or errors" [76].
  - Rewrites apply only `if (version === document.version)`. Otherwise the result is a `concurrent_edits` failure, which is not counted against the listener [76].
  - The UI adds a hard abort at 1,750 ms, and a "Skip" button in a progress notification after 3 s [77].
- **No extension veto (I, from the code path).** Only a real `CancellationError` cancels a save. Any other participant error is logged and the save continues [77].
- **File events use a longer budget.** File create, rename and delete participants get a 60 s budget the user can configure (`files.participants.timeout`, `0` disables them). An extension's rewrite of a rename is shown to the user to preview or skip [78].

**Figma plugins.**
- They chose a sandbox on the main thread over iframe-only, because message passing at "~0.1ms per round-trip" was too slow for a synchronous API. The cost they accepted: "Plugins can hang, and there is no way to interrupt a plugin." It was acceptable only because plugins "are only ever run on explicit user action" and a freeze is visibly the plugin's fault [82].
- **The membrane:** "This low-level interface can be implemented equally well with the Realms sandbox… (~500 LOC in our case). This small amount of code then needs to be audited carefully… future APIs can be built on top of this interface without worrying about sandbox-related security issues" [82].
- When Realms escapes were found, "We now use QuickJS… cross-compiled to WebAssembly… We were able to activate our backup plan very quickly thanks to a swappable architecture." On review: "We do not rely on human reviews to audit newly-published plugins for security as audits can produce false negatives. We instead use a sandbox to enforce a security boundary" [83].
- Today: "plugin code runs on the main thread in a sandbox… does not expose browser APIs", and the iframe UI "can access the browser APIs, but not the Figma scene" [84].
- The manifest declares `networkAccess.allowedDomains` with a `reasoning`, plus `permissions` such as `currentuser` [85].
- Figma later turned synchronous node access into async: "If you call any of the deprecated APIs when in dynamic page loading mode, your plugin will throw" [86].

**Raycast.**
- Developers "use React to declare the UI through the custom Raycast components… the reconciler… translates them to concrete updates of… AppKit." Components serialise to a JSON "render tree", and the host diffs successive trees with JSON Patch; "If there are no patches, it means there are no changes" [87].
- "There isn't any HTML or CSS involved… This is similar to how React Native works" [88].
- Extensions "only send registered messages ('render', 'setClipboard', etc.)… arbitrary calling into Raycast code isn't possible" [87].
- Each extension runs in its own V8 isolate "with limited heap memory". A crash shows an error screen for that extension [89].
- Raycast rejected sandboxing in favour of open-source review, and warned that permission prompts breed "fatigue" [87][89].
- The manifest is a superset of `package.json`, with commands as entry points [90].

**Medusa v2.**
- "A hook can have only one handler" [91].
- A `validate` hook created *before* the write step can throw `MedusaError(INVALID_DATA, …)` to "stop the workflow execution" [92].
- Hook handlers take a compensation function that "undoes the actions performed by the hook handler" if the workflow later fails [91][93].
- Subscribers are for actions "that aren't integral to the original flow", and `emitEventStep` "only emits the event after the workflow has finished successfully" [94].

**Vendure, with one idea from Saleor.**
- A state-transition hook vetoes with a typed reason: "If the function resolves to `false` or a string, then the transition will be cancelled. In the case of a string, the string (error message) will be forwarded to the onError handler" [95].
- Ordinary event subscribers run after the publisher and cannot affect it. Blocking handlers run inside its transaction, propagate errors, run in sequence, are ordered by explicit `before`/`after` ids, and log a warning past 100 ms [96].
- Saleor's synchronous `CHECKOUT_FILTER_SHIPPING_METHODS` lets each app exclude methods with a `reason`, and the reasons are concatenated across apps [98]. Its sync webhooks allow 20 s and "will affect Saleor API response time" [97].

**Electron and Tauri** (brief).
- `contextBridge` proxies functions while "all other values are copied and frozen" [99].
- Tauri v2 permissions are namespaced identifiers (`<name>:<command>`) with scopes, granted per window in capability files. The caveat: everything is allowed until capabilities are configured [100].

**tldraw and Excalidraw.**
- tldraw's `StoreSideEffects` is a "correct state enforcer" over a reactive record store:
  - a before-change handler "can return a modified version or the original to prevent the change" (`return prev // Block the change`);
  - a before-delete handler returns `false` to block;
  - before-handlers chain synchronously;
  - after-handlers flush at the end of the outermost atomic operation, with a depth guard at 100 rounds [101].
- Every handler gets `source: 'user' | 'remote'`, so it can "skip validation for trusted remote data". Handlers run in registration order [102].
- Excalidraw has a closed `ActionName` union, and `perform()` returns an `ActionResult` or `false` ("the action should be prevented"). Every path ends in a single `updater(action.perform(...))`, and an `ActionSource` tag rides along [104].
- Redux confirms the split once more: middleware sits "between dispatching an action, and the moment it reaches the reducer", while listener middleware runs "*after* the root reducer has already processed the action" [105][106].

Dropped because they repeat what is above: Saleor beyond the one idea, Tauri beyond the identifiers, tldraw's history API, Jazz and Instant (NE).

## Recommendations

### 1. Our true peers, and what each would do in our position

- **On stack:** Joplin (RN plus Electron, plugins shipped on mobile), Standard Notes (RN shell, Electron, web, iframe extensions), Notesnook (RN, Electron, web, local-first, no extensions) and Actual (local-first, Electron and web, plugins unshipped).
- **On goals:** Frappe/ERPNext (retail with veto hooks, server-side) and Universal Till (offline POS with a pre-tender seam, tiny).
- **None ships host-composed extension UI on RN.** Every sandboxed peer runs plugin-owned HTML in an iframe or WebView [11][21][29]. That is our *mini-app* tier, not the declared or sandboxed host-component tier. On that tier we are ahead of every peer, so no peer can be copied there (I).
- **What each would do here (I):**
  - **Joplin:** a separate runtime with a REST-shaped data API and notification-only events, mobile in a WebView, curated on iOS. It confirms the iOS curation route for the third-party tier [23].
  - **Standard Notes:** the bridge we already have, plus action-and-content-type permissions with a generated consent string [10]. It would pull hot UI back into first-party code [13].
  - **Actual:** money integrations server-side first, with secrets never reachable by client extensions [35][37]. That is already our descriptor's shape.
  - **Notesnook:** nothing [8].
  - **Frappe:** veto at the record, on the server [41]. That remains the right place for *authoritative* refusal, since Woo re-checks everything, so the app chain is a first line, never the last (I).

### 2. For #421: what the surveyed systems say

- **One named action, one writer: confirmed.** Five independent systems make a named function the only write path:
  - Replicache and Zero mutators [62][64];
  - WatermelonDB writers [54];
  - TanStack DB actions [61];
  - Excalidraw's `updater` [104].

  Borrow TanStack's enforcement: a lint rule that forbids `incrementalModify`/`incrementalPatch` on a collection outside that action's handler [61]. This answers the ticket's "direct component write becomes the anti-pattern" with a mechanism rather than a convention. It also supports naming only the already-centralised writers in v1, since each named action needs its lint fence (I).
- **Veto before write.**
  - Borrow Vendure's typed refusal, `false | reason` [95], expressed as #421's `{ deny, reason }` with a `disabledReasonKey`.
  - Borrow Saleor's aggregation of reasons across several refusers [98].
  - Borrow tldraw's and TinyBase's "return the rewritten value, or the previous one to block" for rewrites [101][67].
  - Keep refusal to trusted, first-party hooks. No surveyed system gives an untrusted extension a fail-closed veto (VS Code by code path, I [77]); Frappe, Vendure and Medusa vetoes are all first-party, in-process code [41][95][92].
- **Do not use RxDB middleware as the veto.**
  - It misses replication pulls and conflict writes [47][48][51].
  - A throw in `preSave` rejects every queued write on the document [49].
  - It cannot tell intent [45].

  The ticket's rule ("RxDB hooks are infrastructure") is now Sourced, not Inferred.
- **Async hooks with a time budget.** Take VS Code's four parts as the starting design [75][76]:
  - **One shared budget per event**, not per hook, as a named constant. The till must not hang however many hooks stack.
  - **Strikes** that switch a hook off after N timeouts or errors, logged by name.
  - **Effects registered only during dispatch** (`waitUntil`-style), so a late promise cannot act.
  - **A rewrite applied only if its target is unchanged.** The RxDB equivalent is comparing the document's `_rev` before the bottom handler writes (I).

  Add VS Code's user escape, a "Skip" after a delay [77], only for fail-open hooks. Never treat Vendure's warn-only 100 ms [96] as a budget.
- **A timed-out hook keeps running.** A `Promise.race` timeout only ignores the result; it cannot stop the work. Figma states the extreme case: "there is no way to interrupt a plugin" [82].
  - So a hook must not cause effects itself. Effects go through the capability object, which the host revokes when the hook's slot expires (I).
  - When a later hook or the bottom handler refuses after an earlier hook acted, Medusa's compensation is the model [91][93]. Simplest for v1: hooks have no effects before `next` resolves; observe-only work runs after `await next(e)` (I).
- **Observe after success only.** Medusa emits events "only… after the workflow has finished successfully" [94], and Vendure and Redux run subscribers after the publisher [96][106]. An observe hook in our chain that needs the outcome uses `await next(e)`. Something that needs only the fact of a change subscribes to RxDB, which is the ticket's test.
- **Complementary to RxDB, with an origin tag.**
  - tldraw passes `source: 'user' | 'remote'` to every handler [102]. Excalidraw passes an `ActionSource` [104].
  - RxDB change events carry no origin; only the internal `eventBulks$.context` does [51].
  - The action event should carry its actor and source explicitly. Nothing in the chain should try to work out origin from RxDB (I).
- **Intent is local; pulls arrive unvetted.**
  - Replicache's rebase shows that an action valid on the device can be wrong once server state lands [62].
  - In our case Woo is the authority, and a pull bypasses every app-side check [48].
  - So money-path invariants (the ledger, fiscal provenance) must be re-checked server-side. The app chain must tolerate state it never saw (I).

### 3. For #120: what changes or sharpens the rulings

- **The host-component ruling has a native precedent.** Raycast renders React-authored extensions through a custom reconciler into a JSON render tree, diffed with JSON Patch, drawn natively [87][88].
  - The sandboxed tier is then "a reconciler in the worker emitting a host-component tree", and the declared tier is a single static tree in the same format. #120 already rules the declared tier the static case of the sandboxed one [2]; Raycast shows the two share a wire format in practice (I).
  - Remote DOM stays the named lane [3]. Raycast is the non-DOM proof.
- **Write the capability object as a membrane.** Figma's ~500-line audited interface let it swap sandboxes in days [82][83]. Borrow the shape:
  - `ctx` is the only door;
  - values crossing it are copied and frozen [99];
  - permissions are namespaced identifiers with scopes [100];
  - the sandbox technology (worker, WebView or a WASM interpreter) is chosen behind the membrane and can be replaced (I).
- **Sandbox enforces, review does not.** Figma says so outright [83]. Raycast and Obsidian rely on review and scanning [87][24]. For the third-party tier, the store rules already force the Figma answer [3].
  - Joplin's iOS route is curation, "only allows installing recommended plugins" [23]. That is a viable stopgap if the third-party tier reaches iOS before a sandbox exists (I).
- **Permissions as action plus resource, with a generated consent string,** as Standard Notes does [10]. Declare network access with a reason, as Figma does [85]. Both fit the existing bridge capabilities.
- **Version contracts.** VS Code gates proposed APIs per extension [79], and Element Web modules declare a semver `moduleApiVersion` [38]. Either is the mechanism for #124's private-API lock and pinned versions [4].

### 4. Failure modes to avoid

1. **A "before" hook that cannot refuse.** Logseq's `onBeforeCommandInvoked` runs the command regardless [31]. Name observe-only events in the past tense (LiveStore [70]), or give them a typed result.
2. **A general filter API with no closed list.** Joplin built one and disabled it [18]. Frappe warns about several apps overriding the same class [42]. Obsidian's lack of hooks pushes plugins into monkey-patching (secondary) [27].
3. **Extensions claiming host-owned ids.** A plugin took over the built-in cash tender and, once disabled, deleted it [44]. Reserve host ids and payment-method keys, and make registration "first owner wins" with validation at registration.
4. **Vetoing at the data layer.** RxDB pre-hooks miss pulls and reject unrelated queued writes [48][49]. tldraw's record-level hooks cannot see intent [101].
5. **Budgets that only warn, or none at all.** Vendure warns past 100 ms [96]. Figma cannot interrupt [82]. Medusa documents no hook timeout (I [91]).
6. **Effects before a refusal with no undo.** Medusa needs compensation functions for this [93].
7. **Assuming the hook always fires.** VS Code "might save without firing this event" [75], and Obsidian's `quit` is "Not guaranteed to actually run" [27]. A guard on a final money action must sit in the bottom handler, not in an optional hook (I).
8. **Isolation that is not a boundary.** Joplin's plugin window has `nodeIntegration: true, contextIsolation: false` [16]. Logseq's iframe has no `sandbox` attribute [29]. Figma's same-VM Realms shim was escaped [83].
9. **Generating ids or doing side effects inside code that replays.** Zero mutators "run multiple times" [65], and LiveStore materializers must be side-effect free [71]. If a rewritten event is ever replayed, its hooks must be deterministic (I).
10. **Trusting a dying extension effort.** Actual's frontend plugin stack was closed unmerged [36], and Notesnook's request has sat open for years [8]. Keep v1 small and first-party (already the ruling [2]).

## Sources

Internal context read 2026-10-08: roadmap issues via `gh`; the #140 and #124 findings from wcpos/monorepo research branches. RxDB source at tag `17.5.0`; VS Code, tldraw, Excalidraw, Joplin, Logseq, Standard Notes, Notesnook, Actual and Element Web source on their default branches on 2026-10-08. Quotes from docs pages fetched through a summarising fetcher (VS Code docs, Figma developer docs, Raycast docs, Vendure, Saleor, Tauri, Electron, Redux, tldraw docs) were not byte-checked against raw HTML. Source-file quotes, the Figma and Raycast blog posts and the Medusa markdown were read raw.

1. https://github.com/wcpos/roadmap/issues/421
2. https://github.com/wcpos/roadmap/issues/120
3. wcpos/monorepo `research/extensible-rn-architectures`: `.claude/research/2026-09-02-extensible-react-native-architectures.md`
4. wcpos/monorepo `research/pos-extension-platforms`: `.claude/research/2026-09-01-pos-extension-platforms.md`
5. https://code.claude.com/docs/en/plugins/mods/overview and https://code.claude.com/docs/en/plugins/mods/events (as summarised on #421)
6. https://github.com/streetwriters/notesnook/blob/master/README.md
7. https://github.com/streetwriters/notesnook/blob/master/packages/core/src/database/index.ts, `packages/core/src/api/sync/index.ts`, `packages/core/src/api/sync/merger.ts`
8. https://github.com/streetwriters/notesnook/issues/459
9. https://github.com/standardnotes/app/tree/main/packages/mobile/src and https://github.com/standardnotes/app/blob/main/packages/features/src/Domain/Component/ComponentAction.ts
10. https://github.com/standardnotes/app/blob/main/packages/features/src/Domain/Component/ComponentPermission.ts and https://github.com/standardnotes/app/blob/main/packages/snjs/lib/Services/ComponentManager/permissionsStringForPermissions.ts
11. https://github.com/standardnotes/app/blob/main/packages/snjs/lib/Services/ComponentManager/ComponentViewer.ts
12. https://github.com/standardnotes/app/blob/main/packages/web/src/javascripts/Components/ComponentView/IframeFeatureView.tsx
13. https://github.com/standardnotes/app/commit/c43b593c (PR #2630) and `packages/features/src/Domain/Lists/DeprecatedFeatures.ts`
14. https://standardnotes.com/help/85/how-do-i-install-third-party-plugins
15. https://joplinapp.org/help/dev/spec/plugins
16. https://github.com/laurent22/joplin/blob/dev/packages/app-desktop/services/plugins/PluginRunner.ts and `packages/lib/services/plugins/api/Joplin.ts`
17. https://joplinapp.org/api/references/plugin_api/classes/joplinworkspace.html and https://joplinapp.org/api/references/plugin_api/classes/joplindata.html
18. https://github.com/laurent22/joplin/blob/dev/packages/lib/services/plugins/api/JoplinFilters.ts
19. https://github.com/laurent22/joplin/blob/dev/packages/lib/services/plugins/api/JoplinContentScripts.ts and `JoplinViewsPanels.ts`
20. https://joplinapp.org/help/api/references/plugin_manifest/
21. https://joplinapp.org/help/api/references/mobile_plugin_debugging/
22. https://github.com/laurent22/joplin/blob/dev/packages/app-mobile/components/plugins/backgroundPage/pluginRunnerBackgroundPage.ts
23. https://joplinapp.org/help/apps/plugins
24. https://obsidian.md/help/Extending+Obsidian/Plugin+security
25. https://docs.obsidian.md/Plugins/Getting+started/Mobile+development
26. https://docs.obsidian.md/Plugins/Events
27. https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts
28. https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
29. https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.caller.ts and https://github.com/logseq/logseq/blob/master/libs/src/postmate/index.ts
30. https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.ts
31. https://github.com/logseq/logseq/blob/master/src/main/frontend/handler/plugin.cljs
32. https://github.com/logseq/logseq/blob/master/src/main/frontend/util.cljc
33. https://github.com/actualbudget/actual/blob/master/packages/docs/docs/contributing/project-details/architecture.md
34. https://github.com/actualbudget/actual/blob/master/packages/crdt/README.md
35. https://github.com/actualbudget/actual/blob/master/packages/docs/docs/contributing/leadership/architecture-decision-records.md
36. https://github.com/actualbudget/actual/pull/5786
37. https://github.com/actualbudget/actual/pull/8546
38. https://github.com/element-hq/element-web/blob/develop/packages/module-api/README.md
39. https://github.com/element-hq/element-web/tree/develop/packages/module-api/src/api (`builtins.ts`, `customisations.ts`, `custom-components.ts`)
40. https://github.com/yrestom/POS-Awesome, `posawesome/hooks.py`; fork https://github.com/defendicon/POS-Awesome-V15
41. https://docs.frappe.io/framework/user/en/basics/doctypes/controllers
42. https://docs.frappe.io/framework/user/en/python-api/hooks
43. https://github.com/universaltill/universal-till/blob/main/README.md and `docs/arch/plugin-integration-roadmap.md`
44. https://github.com/universaltill/universal-till/blob/main/docs/code-reviews/2026-07-30-plugin-payment-key-hijack.md
45. https://rxdb.info/middleware.html
46. https://github.com/pubkey/rxdb/blob/17.5.0/src/rx-collection.ts (`_runHooks` L1049–1065, `storageInstance` L288–292, incremental write queue L293–299, `eventBulks$` L218–223)
47. https://github.com/pubkey/rxdb/blob/17.5.0/src/plugins/replication/index.ts (L237)
48. https://github.com/pubkey/rxdb/blob/17.5.0/src/replication-protocol/downstream.ts (L485–488; unpushed-local-write skip near L371)
49. https://github.com/pubkey/rxdb/blob/17.5.0/src/incremental-write.ts (L121–131)
50. https://github.com/pubkey/rxdb/blob/17.5.0/src/rx-document.ts (L323–360, L491–512)
51. https://github.com/pubkey/rxdb/blob/17.5.0/src/types/rx-change-event.d.ts, `src/replication-protocol/upstream.ts` (L244, L513–516), `src/replication-protocol/index.ts` (L83), `src/rx-storage-helper.ts` (`bulkWrite` from L627, `preStorageWrite` L710–715)
52. https://rxdb.info/replication.html
53. https://rxdb.info/transactions-conflicts-revisions.html
54. https://github.com/Nozbe/WatermelonDB/blob/master/docs-website/docs/docs/Writers.md
55. https://github.com/Nozbe/WatermelonDB/blob/master/src/sync/impl/synchronize.js
56. https://docs.powersync.com/configuration/app-backend/client-side-integration.md
57. https://docs.powersync.com/architecture/consistency.md
58. https://docs.powersync.com/handling-writes/writing-client-changes.md
59. https://docs.powersync.com/handling-writes/custom-conflict-resolution.md
60. https://electric-sql.com/docs/guides/writes.md
61. https://github.com/TanStack/db/blob/main/docs/guides/mutations.md
62. https://doc.replicache.dev/concepts/how-it-works
63. https://doc.replicache.dev/reference/server-push
64. https://zero.rocicorp.dev/docs/mutators.md
65. https://zero.rocicorp.dev/llms.txt
66. https://github.com/aspen-cloud/triplit/tree/main/packages/docs (`schemas/permissions.mdx`, `client/event-listeners.mdx`)
67. https://github.com/tinyplex/tinybase/blob/main/site/guides/06_using_middleware.md
68. https://github.com/tinyplex/tinybase/blob/main/site/guides/01_the_basics/6_transactions.md; source `src/mergeable-store/index.ts` (L784–800), `src/store/index.ts` (L1994–2025)
69. https://docs.livestore.dev/overview/concepts
70. https://docs.livestore.dev/building-with-livestore/events
71. https://docs.livestore.dev/building-with-livestore/state/materializers
72. https://docs.livestore.dev/building-with-livestore/syncing
73. https://docs.livestore.dev/patterns/auth
74. https://github.com/wzhudev/reverse-linear-sync-engine (secondary; the author states no affiliation with Linear)
75. https://github.com/microsoft/vscode/blob/main/src/vscode-dts/vscode.d.ts (`onWillSaveTextDocument`, `TextDocumentWillSaveEvent`)
76. https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/extHostDocumentSaveParticipant.ts
77. https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/browser/mainThreadSaveParticipant.ts and https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/textfile/common/textFileSaveParticipant.ts
78. https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/files/browser/files.contribution.ts, `src/vs/workbench/api/common/extHostFileSystemEventService.ts`, `src/vs/workbench/api/browser/mainThreadFileSystemEventService.ts`
79. https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/extHostRequireInterceptor.ts
80. https://code.visualstudio.com/api/references/contribution-points, https://code.visualstudio.com/api/references/activation-events, https://code.visualstudio.com/api/references/when-clause-contexts
81. https://code.visualstudio.com/api/extension-capabilities/overview and https://code.visualstudio.com/docs/configure/extensions/extension-runtime-security
82. https://www.figma.com/blog/how-we-built-the-figma-plugin-system/
83. https://www.figma.com/blog/an-update-on-plugin-security/
84. https://developers.figma.com/docs/plugins/how-plugins-run/
85. https://developers.figma.com/docs/plugins/manifest/
86. https://developers.figma.com/docs/plugins/migrating-to-dynamic-loading/
87. https://www.raycast.com/blog/how-raycast-api-extensions-work
88. https://developers.raycast.com/faq
89. https://developers.raycast.com/information/security
90. https://developers.raycast.com/information/manifest
91. https://docs.medusajs.com/learn/fundamentals/workflows/workflow-hooks
92. https://docs.medusajs.com/learn/fundamentals/workflows/add-workflow-hook
93. https://docs.medusajs.com/learn/fundamentals/workflows/compensation-function
94. https://docs.medusajs.com/learn/fundamentals/events-and-subscribers
95. https://docs.vendure.io/reference/typescript-api/state-machine/state-machine-config/
96. https://docs.vendure.io/guides/developer-guide/events/
97. https://docs.saleor.io/developer/extending/webhooks/overview
98. https://docs.saleor.io/developer/extending/webhooks/synchronous-events/shipping
99. https://www.electronjs.org/docs/latest/api/context-bridge
100. https://v2.tauri.app/security/capabilities/ and https://v2.tauri.app/security/permissions/
101. https://github.com/tldraw/tldraw/blob/main/packages/store/src/lib/StoreSideEffects.ts and `packages/store/src/lib/Store.ts`
102. https://tldraw.dev/sdk-features/side-effects
103. https://tldraw.dev/sdk-features/history
104. https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/actions/types.ts and `packages/excalidraw/actions/manager.tsx`
105. https://redux.js.org/understanding/history-and-design/middleware
106. https://redux.js.org/toolkit/api/createListenerMiddleware

Not verified:
- **VS Code (I):** that extensions can never cancel a save. This is read from the code path; no doc states it.
- **Standard Notes (U):** why it moved its own editors to the Super type; PR #2630 has no body.
- **RxDB (U):** whether `pull.modifier` can drop a document, and whether `upsert`/`incrementalUpsert` run `preInsert` or `preSave`. The 17.5.0 behaviour was not re-checked on 17.6 or master.
- **LiveStore (U):** what a client does with a batch the server rejects in `onPush`.
- **Saleor (U):** its behaviour when a synchronous webhook times out.
- **Logseq (U):** whether a plugin iframe can reach `window.parent`.
- **Actual (U):** whether its frontend plugin effort is formally dead or only paused.
- **Linear:** everything about it rests on a single secondary source.
- **Not evaluated (NE):** Jazz and Instant.
