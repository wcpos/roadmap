# What a till does today when the user or their permissions change

**Research note, 2026-11-22**, for [roadmap#603](https://github.com/wcpos/roadmap/issues/603) (map [#599](https://github.com/wcpos/roadmap/issues/599)). The question is how the 2.0 app behaves when the signed-in user, or what that user is allowed to do, changes while the till already holds data. This note records facts only. It proposes no design.

## Sources

Everything here comes from reading clean `main` checkouts. Nothing was built, run or tested.

| Tag | Repo | Commit |
|---|---|---|
| **[app]** | wcpos/monorepo (`~/Projects/monorepo-v2`) | `a6526a5b4ff7fb476a0e221cfa33672acac2dbe1` |
| **[free]** | wcpos/woocommerce-pos | `a46ec86887e5f46d57542e8baf6f270c5678d22a` |
| **[pro]** | wcpos/woocommerce-pos-pro | `a23ceffcc739f6217b72b05abf697a352c8c4db5` |

Citations are `repo path:line` at those commits. A path is given in full the first time it is cited. When one entry has several citations, a short path that follows a full one is in the same directory or package as that full path. On their own, short [app] paths resolve as follows:
- `pos/…`, `reports/…`, `health/…`, `customers/…`, `logs/…` and `receipt/…` are under `packages/core/src/screens/main/`;
- `contexts/…` and `services/…` are under `packages/core/src/`;
- `scheduler/…`, `change-signal/…`, `local-coverage/…`, `write-path/…`, `maintenance/…`, `materialization/…` and `collections/…` are under `packages/sync-engine/src/`. One citation sits outside them: RxDB's own `bulkUpsert`, read from rxdb 17.6.0 installed in a local `node_modules`. The Electron main process (`wcpos/electron`) was not checked out, so its storage, clear and image-cache code was not read.

Each conclusion carries one of three labels:
- **Observed**: read in code.
- **Inferred**: reasoned from code that was read.
- **Unverified**: not established.

## Bottom line

1. **Synced data is stored per cashier.** Each cashier has their own copy of products, orders, customers, coupons and every other synced collection. The copy lives in a database named after site + store + cashier (§1). **Observed.**
2. **The server's sync protocol does not know which user is asking.** No cursor, ETag, digest, journal row or integrity cache includes the user or their capabilities. Every sync read is gated only on `access_woocommerce_pos` (§7). **Observed.**
3. **Nothing is purged automatically when a user's scope shrinks.** A store removed from a Pro cashier loses only its row in the user database. A user who loses POS access keeps everything on the till. A store switch and a cashier switch both pause the old scope and keep its database open (§3). **Observed.**
4. **Capabilities are refreshed only when the cashier record is re-fetched.** That happens when the signed-in shell mounts and whenever the access token changes, and the token lives 30 minutes. A failed re-fetch, including a 403 because `access_woocommerce_pos` was removed, leaves the old capabilities in place indefinitely (§2). **Observed** (mechanism); **Inferred** (durations).
5. **A queued write records nothing about who made it or what they were allowed.** The server stamps `_pos_user` as whoever's token pushes it. A 403 on a queued write is permanent: the write is dead-lettered, and the sale stays on the device as a refused change (§5). **Observed.**
6. **No primitive removes one field without a re-pull.** A field disappears from a stored document only when the document is rewritten. That happens on a revision-stamp change, a reset, or a scope-generation bump, which is a cold resync (§4). **Observed / Inferred.**

---

## 1. Local database keying

### 1.1 The databases the app opens

| Database | Name | Keyed on | Holds | Label |
|---|---|---|---|---|
| User DB | `wcposusers_v10` | device / browser origin only | `users`, `sites`, `wp_credentials` (every signed-in cashier's tokens, roles, capabilities), `stores`, the session pointer | Observed: [app] `packages/database/src/database-names.ts:13,64`; `packages/database/src/collections/index.ts:369-375`; `packages/query/src/user-db/hydration.ts:31-35` |
| Store DB | `store_v10_<localID>` | `localID` = first 10 hex chars of SHA-256 over `{user, siteID, wpCredentialsID, storeID}` | `logs`, `notifications`, `templates`, `printer_profiles`, `scanner_profiles`, `template_printer_overrides`, `receipt_email_queue`, `closures`, `register_sessions`, `cash_movements` | Observed: [app] `packages/query/src/user-db/stores.ts:15-31,235-240`; `packages/database/src/create-db.ts:54-64`; `packages/database/src/collections/index.ts:377-388` |
| Engine scope DB | `pos_v7_<siteHash12>_s<store>_c<cashier>` | site URL (FNV-1a, 12 hex) + store id + cashier (WP user) id | every synced collection (`orders`, `products`, `variations`, `customers`, `taxRates`, `categories`, `brands`, `tags`, `coupons`, `refunds`), plus `recordMutations` (the offline queue), `engineKv`, `syncCheckpoints`, coverage, existence-manifest and scheduler state | Observed: [app] `packages/sync-core/src/storeScopeIdentity.ts:69,134-160`; `apps/main/app/(app)/_layout.tsx:174`; `apps/main/lib/create-app-engine.ts:677-682`; `packages/sync-engine/src/collections/engine-collections.ts:114-183` |
| Previous-generation scope DB | `pos_v6_…` | same as above | opened only to drain an old queue | Observed: [app] `packages/sync-core/src/storeScopeIdentity.ts:192`; `packages/sync-engine/src/write-path/legacy-scope-drain.ts:233-262` |
| Temporary DB | `temporary` | none (in memory) | draft orders | Observed: [app] `packages/database/src/create-db.ts:80-87` |

A cashier is identified as follows:
- The engine scope uses `cashierId: wpCredentials.id`, the WordPress user id. **Observed** ([app] `apps/main/app/(app)/_layout.tsx:174`).
- The Store DB uses `wpCredentialsID`. **Observed** (`stores.ts:15-31`). It is per WordPress user. **Inferred** from the `wp_credentials` primary key being the server-supplied `uuid` ([app] `packages/database/src/collections/schemas/wp-credientials.ts:6`).

The logs are the Store DB's `logs` collection, not a separate database. **Observed** ([app] `packages/query/src/user-db/session.ts:56-58`).

### 1.2 Platforms

Every platform uses the same database names; only the storage underneath differs.
- **Web:** one SQLite OPFS pool per browser origin (`.wcpos-sqlite`), run in a single worker. **Observed** ([app] `packages/database/src/adapters/storage/index.web.ts:52,151-155`; `sqlite-pool.ts:2-4`).
- **Native:** one SQLite file per database name under `Documents/wcpos-sqlite`. **Observed** ([app] `packages/database/src/adapters/storage/index.ts:67`; `sqlite-root.ts:4`).
- **Electron:** storage runs in the main process over IPC (`getRxStorageIpcRenderer({key:'main-storage'})`). **Observed** ([app] `adapters/storage/index.electron.ts`). The on-disk layout is **Unverified**, because the main-process code is not in the monorepo.

### 1.3 Two cashiers on one device, same site and store

- **Shared:** the User DB. That means the site record, **both cashiers' credential rows (tokens and capabilities)**, the store rows and the session pointer. The `temporary` DB is shared too. **Observed.**
- **Separate:** the Store DB and the engine scope DB. Both names differ by cashier. **Observed.**
- **The catalogue, orders, customers and coupons are therefore downloaded and stored once per cashier.** So are logs, templates, printer profiles, register sessions and cash movements. **Inferred** from every synced collection living in the scope DB.
- **What happens to cashier A's databases when B signs in.** "Hand the till to" and Connect-screen login both go `login()` → `commitStoreSession` → `switchAppEngineScope`. **Observed** ([app] `packages/core/src/screens/main/pos/cart/user-sheet.tsx:548-552`; `packages/core/src/contexts/app-state/store-session.ts:78-91`). A same-site engine is reused, and `StoreScopeManager.switchTo` aborts A's in-flight work. **"The outgoing database STAYS OPEN — pause, not teardown."** **Observed** ([app] `packages/sync-core/src/storeScopeManager.ts:211-241`; `apps/main/lib/create-app-engine.ts:159-162`). The engine's own contract says store switching "preserves every scope's data, cursors, and mutation queue". **Observed** ([app] `packages/sync-engine/src/create-rxdb-sync-engine.ts:23-25`). A's databases stay on disk, and open in that process. **Inferred.**
- **Logout:**
  - Native, desktop and standalone web: logout only clears the session pointer. **Observed** ([app] `packages/core/src/contexts/app-state/index.tsx:170-190`; `store-session.ts:101-104`; `packages/query/src/user-db/state.ts:36-38`).
  - Embedded web: logout clears the till-access stamp and redirects to the WordPress logout URL. **Observed** (same `index.tsx:170-190`).
  - No database is closed or deleted, and the engine is not disposed. `disposeAppSyncEngine` is called only from the web live-tab gate. **Observed** ([app] `apps/main/components/live-tab-gate.web.tsx:48`).
- **Removing a cashier badge, a site or a store row deletes no database:**
  - `removeCredentials` removes the credential document. **Observed** ([app] `packages/query/src/user-db/credentials.ts:142-155`).
  - `removeSite` removes the site document. **Observed** (`sites.ts:224-236`).
  - `mergeStoresWithResponse` removes `stores` rows. **Observed** (`stores.ts:252-267`).
  - A code comment confirms "Removing a site keeps its scope databases". **Observed** ([app] `apps/main/lib/create-app-engine.ts:197-198`).
  - Only "Clear local data" or recovery (`clearAllDB`) and the legacy purge and drain remove databases. **Observed.**

---

## 2. Capability freshness

### 2.1 Server: where effective capabilities come from

- **The computation.** `Access_Section::effective_capabilities()` runs `user_can()` over the Access-settings capability list. It then adds `manage_woocommerce` and `delete_users` when the user holds them. **Observed** ([free] `includes/Services/Settings/Access_Section.php:45,74-109`).
- **Shipped in exactly two places:**
  - The cashier resource, `GET wcpos/v1/cashier/{id}` (`get_cashier_data`). **Observed** ([free] `includes/Services/Cashier.php:87`; `includes/API/V1/Cashier.php:50-58,173-200`).
  - The inline web boot payload. **Observed** ([free] `includes/Services/Auth.php:677`, whose only caller is `includes/Templates/Frontend.php:83`).
- **Not shipped:**
  - The native OAuth redirect carries tokens, uuid, id and display name only. **Observed** ([free] `includes/Services/Auth.php:694-711`; `includes/Templates/Auth.php:438`). (The wiki's `capability-gating.md` says the login payload carries capabilities; that holds only for the web inline payload.)
  - Token refresh returns only `access_token`, `token_type`, `expires_at` (plus `expires_in`). **Observed** ([free] `includes/Services/Auth.php:720-768`; `includes/API/V1/Auth.php:251-297`).
  - Pro adds nothing to the capability payload. **Observed** ([pro] the only `wcpos_cashier_data` hook is `includes/Services/Customer_Display.php:48`).
- **Token lifetimes:**
  - Access token: 30 minutes (`HOUR_IN_SECONDS / 2`, filter `wcpos_jwt_access_token_expire`). **Observed** ([free] `includes/Services/Auth.php:1025-1028`).
  - Refresh token: 30 days (filter `wcpos_jwt_refresh_token_expire`). **Observed** ([free] `includes/Services/Auth.php:1042-1045`).
  - The refresh token is not rotated on refresh. **Observed** ([free] `Auth.php:757`).
- **Refresh does not re-check capabilities.** It checks the refresh JWT, that the session is still live (otherwise 403 `woocommerce_pos_auth_refresh_token_revoked`), and that the user exists (otherwise 404). `/auth/refresh` is a public route, so the baseline gate does not apply to it. **Observed** ([free] `includes/Services/Auth.php:737,745-752`; `includes/API/V1/Auth.php:49-57`).
- **Every request is re-checked for `access_woocommerce_pos`.** `API::rest_pre_dispatch` covers every `wcpos/v1` and `wcpos/v2` route except public auth, printer-token and receipt-passthrough routes, and the sync admin operations:
  - Not logged in: **401** `woocommerce_pos_rest_unauthorized`, with the token error as `reason`.
  - Logged in without the capability: **403** `woocommerce_pos_rest_forbidden`.
  **Observed** ([free] `includes/API.php:408-448`).
  - Route callbacks add their own checks, e.g. `Endpoint_Permissions::permissions_check`. **Observed** ([free] `includes/Sync/Endpoint_Permissions.php:51-62`).
  - Validating the access token itself checks the session registry and blacklist, not capabilities. **Observed** ([free] `includes/Services/Auth.php:261-356`; `includes/Services/Session_Registry.php:21,269-274`).
- **Sessions are revoked automatically only on `wp_logout`, password reset and password change.** No hook revokes on a role change, a capability change or user deletion. **Observed** ([free] `includes/Init.php:306-308`).

### 2.2 Client: where capabilities are kept and when they are re-fetched

- **Storage.** `wp_credentials.capabilities?: string[]` in the User DB, shared by every cashier on the device. There is no separate in-memory copy; hooks read the document reactively. **Observed** ([app] `packages/database/src/collections/wp-credentials.ts:23,87-89`).
- **Writers:**
  - `recordCashierProfile` replaces the array from the cashier response, and deletes the key if the response omits it. **Observed** ([app] `packages/query/src/user-db/credentials.ts:172-252`, esp. `:216-218,241-251`).
  - `upsertEmbeddedCredentials` does the same from the web inline payload. **Observed** (`credentials.ts:91-113`).
  - Login does not write capabilities. **Observed** (`credentials.ts:18-84`).
- **When the cashier record is fetched.** `useUserValidation` calls `GET …/cashier/{id}`. The effect is keyed on `${userId}-${accessToken.slice(-10)}`, so it re-runs when the signed-in shell mounts and whenever the stored access token changes. **Observed** ([app] `packages/core/src/hooks/use-user-validation.ts:143-150,197,385-397`; mounted at `apps/main/app/(app)/_layout.tsx:400`). A wake tick re-runs only a validation that was deferred while the tab was hidden. **Observed** (`use-user-validation.ts:134-141`). There is no timer poll. **Observed.**
- **Token refresh is reactive.** It happens on a 401 only, in both the HTTP client and the engine fetcher. A 403 never triggers a refresh. Nothing schedules a refresh from `expires_at`. **Observed** ([app] `packages/hooks/src/use-http-client/create-token-refresh-handler.ts:125-136`; `apps/main/lib/engine-fetcher.ts:496-514`).
- **A failed cashier fetch leaves the stored capabilities unchanged.** That covers a 403, a 401 after refresh, and a network error: the catch path sets `isValid=false` and logs. **Observed** ([app] `use-user-validation.ts:339-373`).
- **Unknown capabilities fail open.** `has = !known || granted.has(cap)`. If the array is absent, every gate passes except `canAcceptReaderTerms` and `canReassignSales`. If the array is present, a name missing from it is denied. **Observed** ([app] `packages/core/src/screens/main/hooks/user-capabilities.ts:30-65`). Some screens read the raw field directly with their own defaults:
  - Reports and `canManageCash` fail open.
  - Closures blind mode and the register-gate manager check fail closed.
  **Observed** ([app] `reports/index.tsx:505-508`; `reports/closures/index.tsx:76-77`; `pos/cart/register-gate-card.tsx:29-31`; `services/register-session/use-register-session.ts:99,160-161`).

### 2.3 How long a revoked capability can stay live in the UI

These durations are all **Inferred** from §2.1–2.2. The server re-judges every request throughout.

| Case | Online till | Offline till |
|---|---|---|
| A capability removed; `access_woocommerce_pos` kept | Until the access token expires (≤ 30 min from issue) **and** the till next makes a request: expiry alone triggers nothing (§2.2). That request gets a 401, refreshes, and the new token re-runs the cashier fetch, which overwrites the capabilities. Exception: if the removed capability is `publish_shop_orders`, the cashier fetch itself returns 403 ([free] `includes/API/V1/Cashier.php:146-151`; `includes/Services/Cashier.php:199-201`), so the stored capabilities stay, unbounded, as in the next row. | Unbounded: no request is made and nothing checks expiry. It ends at the first online refresh. |
| `access_woocommerce_pos` removed | **Unbounded.** Refresh keeps succeeding because it is public and checks no capabilities. The cashier fetch gets 403 each time, and the stored capabilities stay. The UI stays signed in while sync calls fail with 403 (logged as AUTH201). | Unbounded, as above. |
| User deleted | The session registry (user meta) is gone, so the access token is rejected → 401 → refresh 403/404 → treated as terminal: `authFailed` is set and the app opens OAuth sign-in. **Local data stays.** ([app] `packages/hooks/src/use-http-client/refresh-access-token.ts:246-298`; `packages/core/src/screens/main/hooks/use-rest-http-client/auth-error-handler.ts`) | Unbounded until online. |
| Embedded web, any case | A page reload re-ships capabilities. A user who can no longer open the POS gets `wp_die` with HTTP 403. ([free] `includes/Templates/Frontend.php:60-62`) | n/a |

---

## 3. Scope changes today

### 3.1 A Pro cashier removed from a store

- **How Pro assigns stores.** Each store's post meta `authorized_users` lists its users. An empty list means everyone. **Observed** ([pro] `includes/Services/Stores.php:232-254`).
- `Stores::get_stores()` skips stores the user is not authorized for, and Free's `Cashier::get_accessible_stores()` reads it. **Observed** ([pro] `Stores.php:64,153-157`; [free] `includes/Services/Cashier.php:123-134`).
- **Pro narrows reach in some places:** registers, sessions, closures and records (`Store_Reach`), store pricing, and order store reassignment. **Observed** ([pro] `includes/Registers.php:35,584-608`; `includes/Store_Pricing.php:679-694`; `includes/Orders.php:49-64`).
- **Free's store header is not authorization.** `Store_Scope` "does not authorize the store". **Observed** ([free] `includes/Sync/Store_Scope.php:45`). Whether generic product or order sync refuses a store header for a store the user is no longer authorized for is **Unverified**; no such check was found.
- **Client, native and desktop.** After the cashier fetch, `mergeStoresWithResponse` bulk-removes `stores` rows missing from the response. **Observed** ([app] `packages/query/src/user-db/stores.ts:253-260`).
  - The running session keeps its in-memory store and Store DB, so the till carries on in the removed store until it relaunches. **Inferred** ([app] `contexts/app-state/store-session.ts:35-37` checks only for null).
  - On the next launch the session fails to hydrate with AUTH131 and the auth screens show. **Inferred** ([app] `packages/query/src/user-db/session.ts:39-41`; `contexts/app-state/index.tsx:236-270`).
- **Client, web boot.** The boot payload only patches or inserts stores; it never deletes one. If the old store is gone, selection falls back to `stores[0]`. **Observed** ([app] `packages/query/src/user-db/hydration.ts:92-113`; `hydration-steps.ts:185-196`).
- **Nothing deletes the removed store's Store DB or scope DB.** **Observed** (§1.3).
- A user authorized for zero stores: **Unverified.**

### 3.2 A user who loses POS access

- **Role or capability removed:**
  - There is no session revocation (§2.1).
  - Every `wcpos/*` call returns 403. The client does not refresh, log out, block the screen or purge on a 403. The engine logs the first 403 per path at error level (AUTH201 `INSUFFICIENT_ROLE`) and repeats at info. **Observed** ([app] `apps/main/lib/engine-fetcher.ts:456,475-490`; `packages/utils/src/logger/rejected-write-code.ts:27`).
  - The session-hold banner reacts only to 401-derived states. **Observed** ([app] `packages/sync-engine/src/create-rxdb-sync-engine.ts:495-507`; `packages/core/src/screens/main/components/session-hold-banner/index.tsx`).
- **User deleted:** see §2.3. Sign-in is forced and local data stays. **Inferred.**
- **The baseline gate `Cashier::missing_pos_capabilities()`** checks five capabilities: access, `publish_shop_orders`, `read_private_products`, `read_private_shop_orders` and `list_users`. `can_open_pos()` blocks on the first two only. **Observed** ([free] `includes/Services/Cashier.php:214-235`).
  - It is enforced at page entry only: the OAuth login form refuses to issue tokens, and the web `/pos` page returns `wp_die` with 403. It is not enforced on REST. **Observed** ([free] `includes/Templates/Auth.php:418-421`; `includes/Templates/Frontend.php:60-62`).
  - The cashier REST route itself checks only `publish_shop_orders`. **Observed** ([free] `includes/API/V1/Cashier.php:143-150`).
- **Signing in again as a different user** in the re-auth flow logs `SIGNED_IN_AS_WRONG_USER` and logs out. **Observed** ([app] `packages/core/src/screens/main/hooks/use-rest-http-client/use-session-login-flow.ts:111-145`).

### 3.3 Store switch, same user

`switchStore` re-hydrates and commits a new session pointer, and the engine pauses the old scope (§1.3). Nothing is purged. Capabilities are untouched because they live on the credential, not the store. **Observed** ([app] `packages/core/src/contexts/app-state/index.tsx:192-221`; `pos/cart/use-switch-store.ts:25`).

### 3.4 What does purge today

Only these remove local data:
- the manual **Clear local data** (`clearAllDB`) and its startup flag;
- the per-collection **reset** (§4.1);
- the legacy-generation purge and drain.

**Observed** ([app] `pos/cart/clear-local-data.tsx:85`; `apps/main/components/clear-local-data-on-startup.tsx`). None of them is triggered by a user, store or capability change. **Observed** (no caller found).

---

## 4. Purge and resync primitives

### 4.1 The engine reset funnel ("Clear and refresh", Store health › Database)

- **Entry points.** A long-press on the list footer and the Store health row both call `resetCollectionsAndRefill`. Resetting products also resets variations. **Observed** ([app] `packages/core/src/screens/main/hooks/use-collection-reset.ts:22-29`; `health/database.tsx:305-310`; `packages/query/src/requirement-bridge.ts:137-153`).
- **Resettable collections:** orders, products, variations, customers, taxRates, categories, brands, tags, coupons and refunds, plus `mutations`, which is guarded and returns `needs-confirmation` while anything is pending. **Observed** ([app] `packages/sync-engine/src/collections/engine-collections.ts:64-75,186-191`; `create-rxdb-sync-engine.ts:26-28`).
- **Mechanism.** The scope manager bumps the epoch and aborts in-flight work. It then runs the cursor invalidators and drops and re-adds the RxDB collection (`live.remove()` + `addCollections`), with a 30 s timeout. **Observed** ([app] `packages/sync-core/src/storeScopeManager.ts:121,468-545`; `engine-collections.ts:214-225`).
- **Cleared alongside:** the collection's checkpoint, trickle and prefetch state, existence-manifest rows, scheduler task state, coverage records and lanes, and the orders custom-pull checkpoint. **Observed** ([app] `create-rxdb-sync-engine.ts:1151-1220,1917-1922`).
- **Not cleared:** the census totals cache and the shared change-signal cursor. **Observed** (same lines; the engine contract says the cursor is "deliberately untouched", `:26-27`).
- **Refill and its cost:**
  - Products and variations: a bounded browse-window seed, not a bulk pull. Pages of 100, at most 50 pages per drain per window, with trickle batches of 10. **Observed** ([app] `requirement-bridge.ts:98-129`; `scheduler/product-browse-window-descriptor.ts:90-91`; `scheduler/browse-window-continuation.ts:53`; `maintenance/product-trickle.ts:63`).
  - Reference collections: a full greedy refresh at about N/100 requests. **Observed** ([app] `change-signal/change-signal-handlers.ts:91,273-284`; `cadence-controller.ts:188`).
  - Customers and orders: no eager refill; they come back on demand. **Observed.**
- **Scope of the funnel.** It touches only the active cashier's scope DB. It does not touch that cashier's Store DB, the queue, or any other cashier's scope DB. **Observed.**

### 4.2 Schema versions and migrations

- **Every engine sync collection is at `version: 0` with no `migrationStrategies`.** An in-place schema change would throw DB6 and take down the scope DB, so the house rule is to bump the scope generation instead. **Observed** ([app] `engine-collections.ts:114-126`; `product-schema.ts:7-11`).
- `payload`, `sync` and `local` are `additionalProperties: true`, so unknown fields are kept. **Observed** ([app] `product-schema.ts:38-40`).
- The mutation queue has strategies v1–v8, all pass-through except a v2 backfill. **Observed** ([app] `packages/sync-core/src/recordMutationQueue.ts:1505-1524`).
- In the app DB, only `stores` is at v1, with a pass-through strategy. **Observed** ([app] `packages/database/src/collections/index.ts:71-74`).
- RxDB would allow a strategy that deletes a property after a version bump, and the tier test accepts a version above 0 when it has strategies. No such strategy exists. **Inferred** ([app] `engine-collections.tier.test.ts:76-81`).

### 4.3 Generation bump (cold resync)

- `SCOPE_DATABASE_GENERATION = 7`; the previous generation is 6. The app DB generation is `v10`. **Observed** ([app] `storeScopeIdentity.ts:69,192`; `packages/database/src/database-generation.ts`).
- A bump opens a fresh, empty database, which refills under the policies in §4.1. **Observed.**
- **The old database:**
  - It is drained, then removed only if its queue is empty; it is kept whole if any work is parked. **Observed** ([app] `write-path/legacy-scope-drain.ts:233-262`).
  - On web and Electron, "removal drops tables; the file remains". **Observed** (`legacy-scope-drain.ts:45-49`).
  - On web, the legacy purge removes IndexedDB and `rxdb-*` OPFS entries only. **Observed** ([app] `purge-legacy-db.web.ts:15-17,59-63`).
  - Whether scope generations older than 6 ever leave the web SQLite pool: **Unverified.**

### 4.4 Change signal, digests, census and reconcile

- **Targeted pull (an id appeared in the change stream).** Fetches `include=` ids in batches (default 50). **Ids the server does not return are pruned locally** unless they have pending work. A non-2xx response throws before any prune. **Observed** ([app] `change-signal-handlers.ts:90,103-124,139-219`).
- **Rebaseline.** Re-pulls every resident product, variation and customer id and prunes the absent ones. That costs residents ÷ batch requests. It is triggered only by:
  - an epoch mismatch;
  - an unproven generation;
  - a cursor below the server's horizon or past its head;
  - a backlog over 5,000.

  None of these is user-driven. **Observed** ([app] `packages/sync-core/src/hybridChangeSignal.ts:344,652-711`; `change-signal-handlers.ts:453-488`).
- **Config fingerprint.** A store-wide md5 over the barcode field and the payload contract version. It takes no user or role input. A stale fingerprint re-derives barcodes locally, or re-pulls resident products and variations. **Observed** ([free] `includes/Sync/Config_Fingerprint.php:163-232`; [app] `packages/sync-core/src/applyReplicationActions.ts:389-450`).
- **Existence audit (reconcile).** Prunes local, manifested, non-dirty ids that are absent from the server's bucket set. It never downloads, and never prunes a resident without a manifest row. **Observed** ([app] `local-coverage/reconcile-existence-pass.ts:1-37,234-238`; `local-coverage/manifest.ts:224`).
  - Per-tick ceilings: 3 scan pages per space, 2 drill-downs, 50 buckets per page, 5×1000 prime chunks. **Observed** ([app] `local-coverage/local-coverage.ts:192,200`; `reconcile-port.ts:32`; `manifest.ts:72-73`).
  - The server's bucket set is site-wide (§7), so the audit would not prune records hidden from one user only. **Inferred.**
- **Census** computes totals only and deletes nothing. **Observed** ([app] `scheduler/census.ts`).
- **Reference collections** (categories, brands, tags, coupons) are `greedy-prunable`: a full refresh prunes whatever the server no longer returns. Tax rates are `upsert-refresh`, so only tombstones remove them. **Observed** ([app] `collections/collection-descriptors.ts:765,773-794`; `change-signal-handlers.ts:286-353`).

### 4.5 Can a field be stripped without a full re-pull?

- **Pulled documents are written whole.** Materialization builds a fresh stored document from the incoming payload ([app] `materialization/record-materialization.ts:76-149`). Non-order collections are written with `bulkUpsert` ([app] `scheduler/engine-scheduler-drain.ts:192-206`; `change-signal-handlers.ts:198-207,328-338`), which RxDB implements as a whole-document replacement (rxdb 17.6.0 `dist/esm/rx-collection.js:414-488`). Orders are written with `incrementalModify`; it replaces `payload` and keeps only protected meta entries and the print count ([app] `write-path/engine-order-repository.ts:273-450`). **Observed.**
- **The write is skipped when the server's revision stamp is unchanged.** `withoutUnchanged` drops the write when the stored and incoming `sha256:` stamps are equal and the client-owned fields match. `payload` is not compared in that case. Rows with local work are never overwritten. **Observed** ([app] `write-path/local-work-guard.ts:27-45,68-116`).
- **Where the stamp is computed.** On the `wcpos_sync_proxy_response` filter at priority 9, over the record as it stands at that point. `Meta_Normalizer` runs earlier (priority 5) and other stampers later (10). For products the stamp comes from `bare_for_revision()` before `augment()`. **Observed** ([free] `includes/Sync/Revision.php:47-76,98-100,168-172`; `includes/Sync/Product_Serializer.php:149-155,192-208`).
- **What follows:**
  - A field withheld *before* the stamp is computed changes the stamp. The next pull of that record then rewrites it without the field.
  - A field withheld *after* the stamp leaves the stamp equal, and the old value survives every incremental pull and every resident re-pull.
  - Either way the record is re-pulled only when something brings it into a pull: a change-stream entry, a rebaseline, a reset, or a browse or trickle fetch. A permission change writes no journal row (§7).

  **Inferred.**
- **No primitive today strips one field from stored documents in place.** **Observed** (no migration strategy, no patch path found).

---

## 5. The offline queue

- **What a queued write records:** `mutationId`, `collectionName`, `operation`, `recordId`, `origin`, the whole outbound `payload`, `baseRevision` and `queuedAt`. Drain bookkeeping adds status, attempts, backoff, conflict data, dead-letter verdict, claims and leases. **There is no user id, role or capability snapshot on the row.** **Observed** ([app] `packages/sync-core/src/recordMutation.ts:31-49`; `recordMutationQueue.ts:64-153`).
  - Who queued it is implied only by which cashier's scope DB holds the queue (§1.1). **Inferred.**
  - The register outbox is separate (Store DB `cash_movements`, `register_sessions`, `closures`). Cash movements do carry `created_by`. **Observed** ([app] `packages/database/src/collections/schemas/cash-movements.ts:15`; `packages/query/src/register-session/queue.ts`).
- **Whose queue drains.** Only the active scope's lanes run. A switched-away cashier's queue is kept but paused (§1.3), so it drains only when that cashier's scope is active again. **Inferred** from the pause-not-teardown contract; there was no live run.
- **The server stamps the order's cashier at push time.** On a v2 create, `_pos_user` and `_pos_user_created` are set to `get_current_user_id()`, which is the user whose token pushes. On update they are filled only if empty. Audit meta is write-once, and a client-sent `_pos_user` is honoured only as an explicit reassignment. That requires the target to be the pusher, or the pusher to hold `reassign_woocommerce_pos_sales` and the target `access_woocommerce_pos`. **Observed** ([free] `includes/API/V2/Writers/Order_Writer.php:85-86,637-661,805-861,870-877`; `includes/Sync/Mutation_Store.php:479-500`).
- **Server refusals on push:**
  - **401:** treated as session-expired. Retried with backoff after re-auth, and it walls the rest of the drain pass. **Observed** ([app] `packages/sync-core/src/drainMutationQueue.ts:64-67,125-126,930-945`).
  - **403:** this is what a user without `access_woocommerce_pos` gets from `rest_pre_dispatch` ([free] `includes/API.php:443-447`). A wc/v3 capability refusal on the forwarded write is also a 403, and so is `post_permission_error` for products, variations and coupons ([free] `includes/API/V2/Write_Controller.php:439-450`). The drain treats any 4xx outside {401, 408, 409, 425, 429} as **permanent**. The row is dead-lettered (status `rejected`) with `rejectedStatus`, `rejectedReason`, `rejectedMessage` and `rejectedAt`, and **it is never retried automatically**. **Observed** ([app] `drainMutationQueue.ts:57-63,149-163,882-885`). A 403 maps to AUTH201 `INSUFFICIENT_ROLE`. **Observed** ([app] `packages/utils/src/logger/rejected-write-code.ts:27`).
    - Note the contrast: the payment command path treats a WordPress `rest_forbidden` 403 as re-sendable, and only a `wcpos_*` 403 as definitive. **Observed** ([app] `packages/sync-core/src/woo/moneyCommandAnswer.ts:24,199-210`).
  - **409** stale revision: the row parks as `conflicted` with the server document, after one automatic re-anchor for orders. **Observed** ([app] `drainMutationQueue.ts:39-47`).
  - **428:** one revision refresh and re-push, then `needs-revision` or a dead letter. **Observed** (`:48-56`).
  - **Validation 400 / 422:** permanent, so dead-lettered. They are coded SYNC211 / SYNC204 / SYNC201 by reason. **Observed** (`rejected-write-code.ts:22-37`).
- **Where a refused sale goes:**
  - It stays in the cashier's scope DB `orders` collection as a local resident, with its dead-letter row in `recordMutations`. **Observed** ([app] `recordMutationQueue.ts:49-52`).
  - The checkout pane mirrors order dead letters into a "rejected" hold. **Observed** ([app] `packages/core/src/screens/main/pos/checkout/use-rejected-order-saves.ts:20-60`).
  - Store health lists them for recovery. Recovery goes through `resolveConflict`:
    - `requeue-rebuilt` re-pushes a payload rebuilt from the current resident under a fresh `mutationId`.
    - `discard` drops the intent; for a born-local create it **destroys the resident**.

    **Observed** ([app] `packages/sync-engine/src/write-path/conflict-resolution.ts:24-36`).
  - A requeue is pushed under whoever is signed in to that scope at the time. **Inferred.**

---

## 6. Other copies that outlive a purge of the main collections

"Reset" below means the engine reset funnel (§4.1).

| Copy | Where | What it holds | Cleared by reset? | Label / source |
|---|---|---|---|---|
| Offline queue and dead letters | scope DB `recordMutations` | whole outbound `payload`; on a 409, the server's whole `conflictDocument` | No; `mutations` needs explicit confirmation and no UI row maps to it | Observed: [app] `recordMutationQueue.ts:91-94,1426-1471`; `storeScopeManager.ts:483-495` |
| Other cashiers' and other stores' scope DBs | `pos_v7_…_s<store>_c<cashier>` | a full synced copy each | No; only Clear local data or the legacy drain removes them | Observed: §1.3 |
| Previous-generation scope DB | `pos_v6_…` | old copy, kept whole while any work is parked; on web and Electron the file remains after removal | No | Observed: `legacy-scope-drain.ts:45-49,233-262` |
| Logs | Store DB `logs` (per cashier) | product names in "added to cart" rows, customer names, order ids and numbers, free-form context; credential-redacted only (email and phone redaction runs only on the Sentry path); kept 30 days, capped at 25 MiB | No | Observed: [app] `packages/utils/src/logger/retention.ts:2-3`; `logger/index.ts:756-760`; `sentry-core.ts:115`; `pos/hooks/use-add-product.ts:183-198`; `customers/add.tsx:55-62` |
| Closures, register sessions, cash movements | Store DB | `closures.receipt_snapshot`, `order_ids`, breakdowns, server findings; cashier ids, amounts, reasons | No | Observed: [app] `collections/schemas/closures.ts:13-51` |
| Receipt email queue | Store DB `receipt_email_queue` | order id and number, customer **email**, last error; deleted after a successful send | No | Observed: [app] `collections/schemas/receipt-email-queue.ts:20-82`; `packages/query/src/receipt-email-queue/queue.ts:462,569-577` |
| Notifications (Novu) | Store DB `notifications` | title, body, read and seen state | No | Observed: [app] `services/novu/notification-sync.ts:167` |
| Store-local documents | Store DB local docs | completion journal, `new-customer-link` (a copy of the new customer's billing and shipping), payment-attention entries | No | Observed: [app] `packages/query/src/store-local/*.ts` |
| Credentials of every cashier | User DB `wp_credentials` | tokens, roles, capabilities | No | Observed: §1.1 |
| Search | in memory, per collection object | folded-text blob, disposed on collection close and rebuilt from the new collection | Yes (rebuilt) | Observed / Inferred: [app] `packages/query/src/search-blob.ts:12-27,118-119,190` |
| Receipt data | React state, fetched from `GET /wcpos/v2/receipts/{id}` | no persisted client cache found; the fiscal snapshot is on the server | n/a | Observed / Inferred: [app] `receipt/hooks/use-receipt-data.ts` |
| Customer display | in memory; WebRTC to the display; an optional server fallback holds a snapshot for 60 s | current order plus store document, ≤ 200 KiB | n/a | Observed: [app] `services/customer-display/snapshot.ts:5`; `display-session.ts:15-17,294-341` |
| Images | web: Cache API `wcpos-images-v1`; native: expo-image disk cache; Electron: main process | product images | No (web: cleared only by Clear local data; native: nothing calls `clearDiskCache`; Electron: Unverified) | Observed / Inferred: [app] `packages/core/src/screens/main/hooks/use-image-attachment/index.web.ts:47`; `packages/database/src/clear-all-db.web.ts:85-99` |
| Debug export, closure CSV | clipboard, share sheet, OS file | 10 recent error rows; closure data | outside the app | Observed: [app] `logs/logs-logic.ts:426`; `reports/closures/save-or-share-csv.ts` |
| Web localStorage | origin | log level, display device id (the till anchor is cleared by Clear local data) | No | Observed: [app] `clear-all-db.web.ts:75-99` |

Reports read from the `orders` collection, not from a separate cache. **Observed.**

---

## 7. Stream identity

### 7.1 How checkpoints are keyed (client)

All sync state lives inside the per-cashier scope DB. The default checkpoint port is that DB's `engineKv`, and the app supplies no override. **Observed** ([app] `create-rxdb-sync-engine.ts:1120-1146`).

- **Change-signal cursor:** one per scope, at `engineKv` key `checkpoint:change-signal` (sequence + epoch), shared by every collection. ETag validators are kept in memory. **Observed** ([app] `change-signal/change-signal-lane.ts:89`; `change-signal-source.ts:233-240`).
- **Orders custom-pull checkpoint:** `syncCheckpoints['custom-pull']` = `{updatedAtGmt, orderId, revision, sequence, epoch}`. **Observed** ([app] `write-path/engine-order-repository.ts:39,727-756`; `collections/sync-checkpoint-schema.ts`).
- **Coverage:** keyed `${collection}::${id}` and `${collection}::${queryKey}`. Query keys are query shapes (`census:<c>`, `orders:custom-pull`, browse-window grammar keys). An order browse key may include a `cashier` *filter* dimension, but that is a filter, not identity. **Observed** ([app] `local-coverage/persistence.ts:83-89`; `scheduler/census.ts:28`; `order-browser-scheduler-descriptor.ts:151-153`).
- Other `engineKv` keys hold existence-reconcile and prime cursors and the trickle and prefetch states. **Observed** ([app] `local-coverage/local-coverage.ts:201-203`).
- **No client cursor, checkpoint or lane key contains a user or capability.** Identity comes only from which scope DB holds the state. **Inferred.**

### 7.2 What the client sends, and what the server answers with

- **Client requests:**
  - `GET /changes/tick?since=` and `/changes/sequence-log?since=&limit=`, with `If-None-Match`. **Observed** ([app] `change-signal-source.ts:254-360`).
  - `/orders/pull?updated_at_gmt&order_id&sequence&include_deletes=true`. **Observed** ([app] `packages/sync-core/src/customPullAdapter.ts:53-65`).
  - Catalog proxy `include=` pulls. **Observed** ([app] `change-signal-handlers.ts:163-168`).
  - Repair tiers: `/integrity/scan`, `/integrity/bucket`, `/changes/range-checksum`, `/changes/revision-hash`, `/digests`. **Observed** ([app] `local-coverage/reconcile-port.ts:158-200`; `manifest.ts:352,500,586`).
  - Every request carries the cashier's JWT, `X-WCPOS-Store` and `X-WCPOS-Instance`. **Observed** ([app] `packages/utils/src/request-preamble.ts:260-269`; `sync-engine/src/transport/engine-transport.ts:150-152`).
- **Server answers:**
  - **Permission:** every sync read checks only `access_woocommerce_pos` plus install health. **Observed** ([free] `includes/Sync/Endpoint_Permissions.php:51-62`).
  - **Journal:** columns `sequence, object_type, object_id, deleted, revision, modified_gmt, origin, created_gmt`. **No user column.** The epoch is a single site-wide option. **Observed** ([free] `includes/Sync/Sync_Journal.php:75-87,154-163`).
  - **Sequence log:** drops update rows for POS-hidden catalog ids. That is a site setting, not per user. Tombstones always flow. **Observed** ([free] `includes/API/V2/Changes_Controller.php:213,241-252`; `includes/Sync/Pos_Visibility.php:127`).
  - **ETag:** head sequence + md5 of fingerprints, barcode fields, epoch and horizon. No user, no store. **Observed** ([free] `Changes_Controller.php:613-629`).
  - **Integrity scan cache key:** collection, bucket size, filters and window. No user. **Observed** ([free] `includes/API/V2/Integrity_Controller.php:323-324`). The only server-side use of the user in sync is the drift-streak key (`instance:<X-WCPOS-Instance>`, falling back to `user:<id>:store:<store>`), which is not a cursor. **Observed** (`Integrity_Controller.php:480-485`).
  - **Digests:** filtered by post status and POS visibility only. **Observed** ([free] `includes/Sync/Digest_Index.php:428-462,826-843`). `get_current_user_id` / `current_user` appears in `includes/Sync/*.php` only in `Endpoint_Permissions.php`. **Observed** (grep).
  - **Orders pull:** `Order_Query::changes_after_checkpoint()` takes no user. The only narrowing seam is the `wcpos_order_pull_ids` filter. Neither Free nor Pro hooks it, and the orders digest and integrity surfaces do not apply it. **Observed** ([free] `includes/API/V2/Orders_Controller.php:112,144-147`; `includes/Sync/Collections.php:163`; grep over both plugins).
  - **Catalog proxy:** forwards to wc/v3 with `rest_do_request`, so WooCommerce's own read checks run as the current user. **Inferred** ([free] `includes/API/V2/Catalog_Proxy_Controller.php`). No per-user result narrowing was found in the proxy behaviours. **Observed** ([free] `includes/API/V2/Proxy/Customers_Proxy_Behavior.php:85-130`). Third-party filters: **Unverified.**

### 7.3 What serving a different result set to the same checkpoint would do

- **Orders.** The server docblock states the behaviour:
  - "The checkpoint advances PAST an excluded row and its journal entry is never re-offered to that client, so exclusion is permanent per-checkpoint".
  - "a scope that later WIDENS only reaches clients after a full resync".
  - "Exclusion does not tombstone. A copy the till already holds stays until a real delete tombstones it".

  On the client, only `deletes` remove orders. **Observed** ([free] `includes/API/V2/Orders_Controller.php:126-137`; [app] `packages/sync-core/src/customPullAdapter.ts:316-320`).
- **Catalog and customers.**
  - A scope change writes no journal row, so it triggers no pull. **Inferred.**
  - When an id *does* come through the stream and the server returns fewer records than asked for, the client prunes the missing ones. A rebaseline does the same across every resident. **Observed** (§4.4).
  - A 403 throws before any prune, so a refused read removes nothing. **Observed** ([app] `change-signal-handlers.ts:103-124`).
- **Reference collections.** The next full refresh would prune whatever the server stopped returning. **Inferred** (greedy-prunable, §4.4).
- **Existence audit.** It would not prune per-user exclusions, because the server's bucket set is site-wide. **Inferred.**
- **Shared cursor.** The change-signal cursor is shared across collections and survives a per-collection reset. A narrowed stream would therefore not replay rows the cursor has already passed. **Inferred** (`create-rxdb-sync-engine.ts:26-27`).

---

## Could not determine

1. **Electron main process** (`wcpos/electron` was not checked out): the on-disk layout, what Clear local data removes there, and the image cache.
2. **Pro store header:** whether generic product or order sync refuses a store header for a store the user is no longer authorized for.
3. **Zero stores:** what the app does for a Pro user authorized for none.
4. **Store switch remount:** whether a store switch remounts the signed-in shell, which would add a cashier fetch.
5. **Third-party narrowing:** whether WooCommerce or third-party filters narrow wc/v3 list reads per user, and whether a missing read capability yields a 403 or a filtered list on each proxied route.
6. **Web pool cleanup:** whether scope generations older than 6 ever leave the web SQLite pool.
7. **Paused queues:** the behaviours in §1.3 and §5 (a paused cashier's queue and open databases) were read, not run.
