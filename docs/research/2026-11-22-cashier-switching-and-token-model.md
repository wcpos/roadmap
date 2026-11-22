# Cashier switching and the token model on `main`

**Research note, 2026-11-22**, for [roadmap#615](https://github.com/wcpos/roadmap/issues/615) (map [#599](https://github.com/wcpos/roadmap/issues/599); the audit parked in [#217](https://github.com/wcpos/roadmap/issues/217), from the ruling on [#209](https://github.com/wcpos/roadmap/issues/209)). The question is how a cashier signs in, stays signed in and switches on a shared till today, on web, desktop and native, and what a PIN and an idle lock would have to hook into. This note records facts only. It proposes no design.

It does not repeat the [till behaviour research](https://github.com/wcpos/roadmap/blob/research/till-behaviour-on-permission-change/docs/research/2026-11-22-till-behaviour-on-permission-change.md) (database keying per cashier, capability refresh, what survives a switch or a purge). Where a fact from it is needed, it is cited as **[till §n]**.

## Sources

Everything here comes from reading clean `main` checkouts. Nothing was built, run or tested.

| Tag | Repo | Commit |
|---|---|---|
| **[app]** | wcpos/monorepo | `596451e436e9c0787da207bc7cb471ad0fc764a8` |
| **[free]** | wcpos/woocommerce-pos | `a46ec86887e5f46d57542e8baf6f270c5678d22a` |
| **[pro]** | wcpos/woocommerce-pos-pro | `d7ba98ccadc42358a533148b5d223da8bdd26822` |
| **[electron]** | wcpos/electron (`origin/main`) | `2db70242b52ef4cd37e59cf1d90f0933051d5ca1` |

Citations are `repo path:line` at those commits. Short [app] paths resolve as follows: `screens/…`, `contexts/…`, `hooks/…` and `services/…` are under `packages/core/src/`; `user-db/…` and `register-session/…` are under `packages/query/src/`; `use-http-client/…` is under `packages/hooks/src/`. A short path after a full one in the same entry is in the same directory.

Each conclusion carries one of three labels:
- **Observed**: read in code (including "Observed (absence)": a grep over the repo found no match).
- **Inferred**: reasoned from code that was read.
- **Unverified**: not established.

## Bottom line

1. **A device keeps every cashier's access and refresh token in plain text, in the same User DB, on every platform.** No secure store, keychain or encryption is used. The server keeps only a session row per refresh `jti` and cannot see whether a device still holds the token (§1.4, §1.5). **Observed** (storage); **Inferred** (what the server cannot see).
2. **Nothing stands between a person at the till and another stored cashier's valid token.** On the connect screen it is select a tile, then "Open POS". In the user sheet it is "Hand the till to {name}", then one confirm dialog. No password, PIN or biometric (§2). **Observed.**
3. **There is no idle, lock or timeout of any kind in the app.** The only "idle" notions slow sync down. Activity and visibility signals exist (`user-activity`, `host-visibility`, `requestStateManager.onWake`, RN `AppState`, Electron `powerMonitor`), but none of them locks or signs anyone out (§5). **Observed.**
4. **Native and desktop boot offline with any stored token; sign-in and refresh need the network.** A switch offline is narrower: the connect screen cannot enter offline, and the user sheet's "Hand the till to" is not disabled offline but reaches only a stored cashier with a store matching the current one (otherwise it drops to `/connect`); that it completes fully offline is not verified. The web embedded POS cannot boot offline (§3.1, §6). **Observed / Inferred.**
5. **On embedded web, a reload always returns the till to the WordPress cookie user**, minting a fresh access token from that cookie session (§7). **Observed** (re-point); **Inferred** (consequence).
6. **The only credential check after sign-in is manager approval by WordPress username and password** (close-time variance approval and closure recount), done inline with `wp_authenticate()`, with no rate limit and no token issued. The app login uses a separate private `wp_check_password` path that has rate limiting and lockout. No PIN or passcode code exists (§8). **Observed.**

---

## 1. The token end to end

### 1.1 Issue on web (the `/pos` page)

- **Login gate.** `Frontend::get_template()` calls `auth_redirect()` when `! is_user_logged_in()`, then refuses with `wp_die(…, 403)` if `Cashier::can_open_pos()` fails. **Observed** ([free] `includes/Templates/Frontend.php:53-62`).
- **Tokens go into the page.** `Auth::get_user_data($user, true)` runs before the template, and the result ships as `initialProps.wp_credentials` in an inline `<script>`, with `nocache_headers` and cache-plugin opt-outs. **Observed** ([free] `Frontend.php:79-83,318,335,350-356,388-405`). The full refresh token is therefore in the page HTML. **Inferred.**
- **Payload fields:** `uuid`, `id`, `username`, `email`, `first_name`, `last_name`, `nice_name`, `display_name`, `roles`, `capabilities`, `avatar_url`, `access_token`, `refresh_token`, `token_type`, `expires_at` (access expiry). **Observed** ([free] `includes/Services/Auth.php:666-684`).
- **A new access token on every load; a new session only sometimes.** If the httponly cookie `wcpos_web_session_jti` names a live session with more than one day left (`WEB_SESSION_REUSE_MIN_REMAINING`), the refresh JWT is re-signed with the same `jti` and the same expiry, and no new registry row is written. Otherwise `generate_token_pair()` creates a new session. The cookie is then (re)set: httponly, SameSite=Lax, `secure` only on SSL, expiring with the refresh token. **Observed** ([free] `Auth.php:26,636-664,1138-1167`).
- **JWT claims.** Access: `iss`, `iat`, `exp`, `jti`, `type: access`, `data.user.id`, `refresh_jti` (the session it belongs to). Refresh: same with `type: refresh`. HS256, separate secrets. **Observed** ([free] `Auth.php:403-419,435,499-510,526`).

### 1.2 Issue on desktop and native (webview login)

- **Server login page** ([free] `includes/Templates/Auth.php`):
  - Needs `redirect_uri` and `state`; holds a 10-minute auth-session transient. **Observed** (`:53,120-136,332-366`).
  - Allowed redirect schemes `wcpos`, `wcpos-dev`, `wcpos-adhoc`, `exp`, `https`, `http`; http(s) must match the site origin or `https://wcpos.expo.app`, or pass `wcpos_auth_redirect_origin_allowed`. **Observed** (`:68,82,235-243,262-310`).
  - Checks the password with a private `authenticate_direct()` (`get_user_by` + `wp_check_password`), deliberately bypassing `wp_authenticate` so 2FA and captcha plugins do not run. The only hook is `wcpos_authenticate_user`. **Observed** (`:7,466-536`).
  - Rate limit 10 attempts per IP per 15 min; lockout after 5 failures per account and peer for 15 min. **Observed** (`:30-48`).
  - Sets no WordPress auth cookie. **Observed (absence)** (no `wp_set_auth_cookie`/`setcookie` in the file).
  - Always mints a **new** token pair (`get_redirect_data()`), then 302s to `redirect_uri` with query parameters `access_token`, `refresh_token`, `token_type`, `expires_at`, `id`, `uuid`, `display_name`, `state`. No capabilities. **Observed** ([free] `Services/Auth.php:694-711`; `Templates/Auth.php:437-467`).
  - Records `platform`, `version`, `build` from the request onto the session row. **Observed** ([free] `includes/Services/Session_Context.php:103-108`; `Session_Registry.php:150-180`).
- **App side** ([app] `hooks/use-wcpos-auth/`):

  | Platform | How the login page opens | Source (Observed) |
  |---|---|---|
  | Native | expo-auth-session `useAuthRequest`, `ResponseType.Token`, no PKCE, endpoint `site.wcpos_login_url`, extra params `platform`/`version`/`build`; redirect `${scheme}://` | `index.ts:7,29-56,110`; `utils.ts:22-29` |
  | Electron | 32-byte random `state`, IPC `auth:prompt`; renderer checks the returned `state` | `index.electron.ts:57-103` |
  | Web (standalone) | expo popup, falling back to a full-page redirect; CSRF state and return path in `sessionStorage`; tokens stripped from the URL by `history.replaceState` and held in module memory | `index.web.ts:148-235`; `redirect-result.ts:13-15,57-67,104-167` |

- **Electron main process.** `ipcMain.handle('auth:prompt')` opens a 500×600 `BrowserWindow` (`contextIsolation`, no preload, `partition: 'persist:external-auth'`), intercepts `will-navigate`/`will-redirect` to the redirect URI, parses the parameters and resolves the IPC call. It keeps no tokens. **Observed** ([electron] `src/main/auth-handler.ts:14-56,61-177`). The comment says the persisted partition "keeps the user's WP login for future prompts" (`:90`); since the WCPOS form sets no WP cookie, that partition holds a WP login only if one happened elsewhere in that window. **Inferred.**
- **Saving.** `saveLoginCredentials` writes `access_token`, `refresh_token`, `expires_at` into `wp_credentials` (keyed by the server `uuid`) and links it to the site. **Observed** ([app] `user-db/credentials.ts:18-84`).

### 1.3 Lifetime, refresh, expiry, revocation

- **Lifetimes:** access 30 min, refresh 30 days, refresh not rotated, refresh is a public route that checks only that the session is live and the user exists. **Observed** ([till §2.1]; [free] `Auth.php:1025-1046`).
- **Client refresh is reactive only.** A 401 triggers a refresh, a 403 does not; nothing compares `expires_at` with the clock and no JWT is decoded client-side. **Observed** ([app] `use-http-client/create-token-refresh-handler.ts:133-136`; `apps/main/lib/engine-fetcher.ts:456,496`; **Observed (absence)** of any `expires_at` read: it is only written, `user-db/credentials.ts:40,65`, `use-http-client/refresh-access-token.ts:207-208`).
- **Terminal vs transient refresh failure.** 401/403/404 from `/auth/refresh`, or no refresh token, is terminal: `requestStateManager.setAuthFailed(true)`, logged SESSION_EXPIRED. A 5xx, network error or malformed body is transient: backoff 1 s to 60 s, no latch. **Observed** ([app] `refresh-access-token.ts:11-12,125-127,157-168,228-235,258-299`).
- **After the latch.** Requests fail preflight with `AUTH_REQUIRED`; the fallback handler opens OAuth for an invalid refresh token, or shows "Please log in to continue" with a Login action. The session-hold banner shows while `writeSessionHeld || authRequired` and clears itself if the credential's `access_token` changes underneath it. **Observed** ([app] `use-http-client/request-state-manager.ts:285-291`; `screens/main/hooks/use-rest-http-client/auth-error-handler.ts:148-184`; `screens/main/components/session-hold-banner/index.tsx:48,63-95`). `authFailed` is in-memory, so a reload retries with the stored tokens. **Inferred** (`request-state-manager.ts:146-148`).
- **Server revocation triggers:** `wp_logout` (revokes the session named by this browser's cookie only), password reset or change (revokes all, with blacklist). No revoke on role, capability or deletion. **Observed** ([free] `Auth.php:72-108,796-815,1116-1131`; `includes/Init.php:306-308`; [till §2.1]).
- **Revocation is immediate for access tokens.** Access validation rejects a blacklisted `jti`/`refresh_jti` and also rejects when the session row is not live, so removing a row kills its outstanding access tokens. **Observed** ([free] `Auth.php:297-335`).
- **The app itself never revokes a session on logout.** **Observed (absence)** (no `auth/sessions` call in [app]). On embedded web, though, logout sends the browser to the WordPress logout URL, and `wp_logout` then revokes that browser's cookie-named POS session (§7).

### 1.4 Where tokens are stored on each device

- **Schema.** `wp_credentials` holds `access_token`, `refresh_token` (strings) and `expires_at` (access expiry, unix seconds). There is no refresh-expiry field. `last_access` is the device's till stamp, not a token field. **Observed** ([app] `packages/database/src/collections/schemas/wp-credientials.ts:1-78`).
- **One User DB per device / origin, every platform** ([till §1.1]):

  | Platform | Backend | Source (Observed) |
  |---|---|---|
  | Web | SQLite in OPFS via an rxdb-premium storage worker | [app] `packages/database/src/adapters/storage/index.web.ts:1,52,151` |
  | Native | SQLite via expo-sqlite under `Documents/wcpos-sqlite` | [app] `adapters/storage/index.ts:1-12,69-71`; `sqlite-root.ts:4` |
  | Electron | renderer uses `getRxStorageIpcRenderer`; the main process owns SQLite files at `userData/wcpos_sqlite` | [app] `adapters/storage/index.electron.ts:1,22`; [electron] `src/main/rxdb-storage.ts:18,99-103,105-139` |

- **No secure storage or encryption.** **Observed (absence)**: no `expo-secure-store`, `safeStorage`, keytar, keychain or RxDB encryption plugin in [app] or [electron]. Tokens are therefore plain text in SQLite. **Inferred.**
- **Elsewhere.** localStorage holds no token (till anchor, instance/install ids, log level, display device id); sessionStorage holds only OAuth CSRF state; the only cookie is the server's httponly `wcpos_web_session_jti`, which carries a `jti`, not a token. Electron's electron-store holds no token. **Observed** ([app] `packages/database/src/till-anchor.web.ts:13-22`; `hooks/use-wcpos-auth/redirect-result.ts:30-31`; [free] `Auth.php:1149-1166`; [electron] `src/main/config.ts:8-17`).

### 1.5 What the server can see and revoke

- **Session registry.** One user-meta row `_woocommerce_pos_refresh_tokens`, a map keyed by refresh `jti`. Each entry: `expires`, `created`, `last_active`, `ip_address`, `user_agent`, `device_info` (`device_type`, `browser`, `browser_version`, `os`, `app_type`, optional `build`), later `access_expires`. **Observed** ([free] `includes/Services/Session_Registry.php:21,156-189,346-373,763-770`).
- **Last-used.** Every authenticated request writes a `wcpos_session_seen_{jti}` transient (7-day TTL, at most once per 5 min); the row's `last_active` changes only on `/auth/refresh`. **Observed** (`Session_Registry.php:61,75,287-335`; [free] `Auth.php:334,755,882-884`).
- **Cap.** `MAX_SESSIONS_PER_USER = 200`, but eviction takes only sessions idle 7 days (`SESSION_EVICTION_IDLE_SECONDS`), and the count may exceed 200 rather than evict a live device. A row over 6 MB is discarded, signing out all of that user's devices. **Observed** (`Session_Registry.php:23-50,77-90,574-660`).
- **Endpoints** (`wcpos/v1`, promoted to `wcpos/v2`): `GET auth/sessions`, `DELETE auth/sessions` (all, or all except current), `DELETE auth/sessions/{jti}`, `GET auth/users/sessions` (admin/manager list). Self; admins for anyone; shop managers for anyone except an administrator. **Observed** ([free] `includes/API/V1/Auth.php:29,93-185,336-370,513-585`; `Services/Auth.php:893-943`).
- **Admin UI.** The plugin settings have a Sessions screen that lists and revokes. **Observed** ([free] `packages/settings/src/screens/sessions/index.tsx:51-115`; `router.tsx:77-82`). The app has no session UI; Pro has no session code. **Observed (absence).**
- **What the server cannot see.** It stores `jti`s, not tokens, and has no signal of whether a device still holds or has deleted its tokens, or which cashier is active on a device at a given moment; its only liveness signals are `last_active`, the seen transient and `access_expires`. **Inferred.**

---

## 2. Stored cashiers on a device

- **A saved cashier tile** is `WpUser`, one per stored credential linked to the site (`WPUsers` over `observeSiteCredentials`, which reads the site's `wp_credentials` link array). It shows avatar or initials, `display_name`, humanised `roles`, a "Signed in" / "Sign in again" badge, a "Re-authenticate" button when validation fails, and a remove × with a confirm. **Observed** ([app] `screens/auth/components/wp-user.tsx:57-70,152-233,235-250`; `wp-users.tsx:88-105`; `user-db/reads.ts:58-70`).
- **How many.** No cap: linking appends the uuid with no length check and the schema array has no `maxItems`. **Observed** ([app] `user-db/sites.ts:90-125`; `packages/database/src/collections/schemas/sites.ts:62-68`). No other write path caps it. **Inferred.**
- **Removing a tile** deletes the credential document only (no server revoke, no database removed). **Observed** ([app] `wp-user.tsx:148-150`; [till §1.3]).
- **What tapping a tile does.** It only selects the tile; entry is the "Open POS" button in `StoreSelect`, enabled when `selectedStoreLocalID && isValid && !isValidating`. Validity comes from `useUserValidation`, which sends `GET cashier/{id}` with the stored token. **Observed** ([app] `wp-user.tsx:200`; `screens/auth/components/store-select.tsx:152,210-220`; `wp-users.tsx:123-137`; `hooks/use-user-validation.ts:67,192-218,339-373`).

  | Token state | Result | Label |
  |---|---|---|
  | Access token valid | "Signed in"; one press of Open POS goes straight in | Observed |
  | Access expired, refresh valid | validation client refreshes on 401 and retries; goes in silently | Inferred (`use-user-validation.ts:92-127`; `create-token-refresh-handler.ts:12-21,133-135`) |
  | Both expired | validation fails: "Sign in again" + "Re-authenticate", Open POS disabled; the login window opens only on "Re-authenticate" | Inferred (`use-user-validation.ts:339-373`; `store-select.tsx:152`) |
  | Offline | validation fails, Open POS disabled on this screen | Inferred (`use-user-validation.ts:356-372`) |

- **Logging out keeps both tokens on the device.** On native and standalone web, logout nulls the `current` session pointer only. **Observed** ([app] `user-db/state.ts:36-38`; `contexts/app-state/store-session.ts:101-104`). On embedded web it keeps the pointer, clears the till stamp and goes to the WordPress logout URL, which revokes that browser's POS session on the server (§7). **Observed** ([app] `contexts/app-state/index.tsx:170-184`).
- **Nothing stands between a person at the till and another cashier's valid token**, on either the connect screen or the user sheet (§3.1). No password, confirm-as-that-person, PIN or biometric exists. **Observed** (absence in both paths; [app] `screens/main/pos/cart/switch-confirm.tsx:135-172,284-294`; `user-sheet.tsx:534-560`).

---

## 3. Switching today

### 3.1 Every route to a different cashier

There is no "Switch User" menu item. Cashier change lives in the user sheet (opened from the cashier avatar) as a "Hand the till to" band. "Switch store" is the "Switch" verb on the sheet's Store row. **Observed** ([app] `user-sheet.tsx:436-475,701-733`; `screens/main/components/cashier-entry/index.tsx:78`).

| Route | What happens | Label / source |
|---|---|---|
| **User sheet, "Hand the till to {name}"** | Lists every stored credential for the site except the signed-in one, each with "{count} open cart(s)". Disabled while busy, paying or counting; **not** disabled offline. Tap → `SwitchConfirm`: "Hand the till to {name}?", "The POS reloads as {name}.", "The drawer stays open on {register}." when a session is open, a "Waits here for you" notice for open carts or unsent sales, "Hand over to {name}", optional "Print hand-over slip". Confirm → `switchUser`: finds the target's store matching the current store id, `clearRefreshedToken()`, `setAuthFailed(false)`, then `login({siteID, wpCredentialsID, storeID})`; with no matching store, `logout()` and `/connect`. No token validation before `login()`. | Observed: [app] `user-sheet.tsx:246-319,534-569,701-706`; `switch-confirm.tsx:135-172,295-311` |
| **User sheet, "Another account…"** | Shown when online, not busy, not paying. Runs OAuth, then only `handleLoginSuccess` → `saveLoginCredentials` (adds or patches the row, links it to the site) and `router.back()`. It does **not** switch the session. The new row starts with `stores: []`; stores are linked only by `recordCashierProfile`, called from `useUserValidation`, which is mounted on the connect screen. | Observed: [app] `user-sheet.tsx:719-722`; `screens/auth/components/add-user-button.tsx:100-113`; `screens/auth/hooks/use-login-handler.ts:71-104`; `user-db/credentials.ts:47,264` |
| | Handing the till to a freshly added account from the sheet therefore finds no store and drops to `/connect`. | Inferred (`user-sheet.tsx:543-546`) |
| **User sheet, "Sign out"** | If the register is bound, a session is open and the cashier has `manage_woocommerce_pos_cash`: "{name} is still open at {amount}. Close it first?" / "A till left open stays open for the next cashier. The closure records who closed it.", with "Close register" (starts counting) or "Sign out anyway". Otherwise `logout()` at once, so a cashier without the cash capability leaves the register open with no prompt. | Observed: [app] `user-sheet.tsx:602-618,800-822`; `switch-confirm.tsx:261-271,295-304` |
| **Connect / auth screen** | After logout: tile → Open POS → `login()` → `commitStoreSession` → `switchAppEngineScope`. | Observed: [app] `wp-users.tsx:113-139`; [till §1.3] |
| **Forced sign-outs** | Re-login by a different user (§4, path B) and the update-required / compat-gate "Logout" call `logout` with no register prompt. | Observed: [app] `use-session-login-flow.ts:127-143`; `screens/main/update-required.tsx:51-52`; `screens/main/compat-gate.tsx:44` |

### 3.2 What a switch does to the cart, the register session and the queue

- **Open carts** stay in the outgoing cashier's per-cashier databases, which the engine pauses rather than closes; they are not moved to the new cashier. **Inferred** from per-cashier keying and pause-not-teardown ([till §1.1, §1.3]; [app] `user-db/stores.ts:15-31`). The confirm counts them per cashier (`useOpenOrdersHandle(wpCredentials.id, store.id, registerId)`). **Observed** ([app] `switch-confirm.tsx:83-84`). Whether the per-row "{count} open cart(s)" in the hand-over list can read another cashier's carts from the active engine is **Unverified** ([app] `packages/query/src/reads/open-cart-count.ts:10-27`).
- **Register session.** The device's register binding lives in the shared User DB; the session, closure and cash-movement rows are read from the active cashier's Store DB and refreshed from the server per register (`GET sessions?register_id=…`). **Observed** ([app] `register-session/drawer.ts:186-213`; `register-session/refresh.ts:19-40`; `services/register-session/use-register-session.ts:95-107`). A hand-over neither closes nor transfers the session: `run('cashier')` only calls `switchUser`, and the copy says the drawer stays open. **Observed** ([app] `user-sheet.tsx:568-569`; `switch-confirm.tsx:139-140`). `opened_by` stays the original opener. **Inferred** (`user-sheet.tsx:126,146-158`).
- **Offline queue.** A switched-away cashier's deferred sales are sent only under that cashier's own session; the sheet warns "Awaiting store · N sales" / "Sent when you are signed in online." **Observed** ([app] `user-sheet.tsx:225-243`). The queue itself is per cashier and paused ([till §1.3, §5]).

### 3.3 `switchUserSessionStore`

Despite the name it switches the **store only**, never the user. It reads the persisted `current` pointer, replaces `storeID`, runs `hydrateUserSession`, and returns `commitStoreSession` (refuse an incomplete session, switch the engine scope, write the pointer, stamp the till time). Its only caller is `switchStore`, used by `useSwitchStore`. Cashier changes go through `login()`. **Observed** ([app] `contexts/app-state/hydration-steps.ts:33-42`; `contexts/app-state/index.tsx:121-159,192-221`; `screens/main/pos/cart/use-switch-store.ts:14-59`; `contexts/app-state/store-session.ts:78-91`).

---

## 4. Re-login answered by a different person

There are two paths and they behave differently.

- **A. The tile's "Re-authenticate" on the connect screen** ([app] `screens/auth/components/wp-user.tsx:72-146`):
  - `handleLoginSuccess({params})` runs **before** the id check, so the returned person's tokens are always saved, under the returned `uuid`, creating or patching that person's row and linking it to the site. **Observed** (`wp-user.tsx:93`; `user-db/credentials.ts:54-79`).
  - If `params.id` matches the tile, the token is adopted (`setRefreshedToken`, `setAuthFailed(false)`). Otherwise a warning is logged ("Re-authentication returned a different user; credentials saved but token not adopted for active requests") with the toast `auth.signed_in_as_different_user`: "Signed in as a different user — they were added to the list, but the selected user is still logged out." No error code, no dialog. **Observed** (`wp-user.tsx:100-111`; `packages/core/src/contexts/translations/locales/en/core.json:513`).
  - The original tile stays "Sign in again", and a new tile for the other person appears. **Inferred.**
- **B. In-session re-login** (session-hold banner "Log in", or the fallback 401 handler) ([app] `screens/main/hooks/use-rest-http-client/use-session-login-flow.ts:105-173`):
  - On an id mismatch it logs `SIGNED_IN_AS_WRONG_USER` (AUTH121) with a toast whose text comes from the error registry: "The signed-in store account does not match the cashier on this till." / "Sign in with your own account." **Observed** (`use-session-login-flow.ts:111-122`; `contexts/merchant-toast.ts:50-77`; `packages/utils/src/logger/error-registry.json:1603-1620`).
  - It then calls `onUserMismatch`, which is `logout`, and returns before `handleLoginSuccess`, so the returned token is never saved or adopted. If logout fails: "Sign out failed — you may still be signed in as the previous user." **Observed** (`use-session-login-flow.ts:127-148`; `core.json:489`). The returned token is discarded (the server session it created stays live until it expires or is revoked). **Inferred.**
  - On a match: save, adopt, clear `authFailed`, `engine.sessionRestored()`, toast "Session renewed". **Observed** (`:147-173`; `core.json:510`).

---

## 5. Idle behaviour

- **No idle lock, screen lock, session timeout, auto-logout, screensaver or keep-awake exists on any platform.** **Observed (absence)** (no matches in [app] `apps/` and `packages/` for those terms beyond Android activity strings; no `expo-keep-awake`, `powerSaveBlocker` or `LocalAuthentication`). The only server "idle" constant is session eviction after 7 days unused ([free] `Session_Registry.php:50`).
- **Existing signals and who consumes them:**

  | Primitive | Where | What it emits | Fed by / used by | Label |
  |---|---|---|---|---|
  | `markUserActivity` / `lastUserActivityMs` / `onUserActivity` | [app] `packages/utils/src/user-activity.ts:4,15,19` | time of last touch, key or scan; listeners | Fed by native touch capture, web/Electron `keydown`/`pointerdown`, barcode scans ([app] `apps/main/app/(app)/_layout.tsx:69-72,94-98,256`; `screens/main/hooks/barcodes/use-barcode-detection.ts:262`). Used by the sync cadence controller and background trickles (60 s quiet before running) ([app] `apps/main/lib/create-app-engine.ts:927-928`; `packages/sync-engine/src/cadence-controller.ts:94-105,260-265`; `packages/sync-engine/src/maintenance/customer-trickle.ts:54,184`; `maintenance/product-trickle.ts:64,192`) | Observed |
  | Idle slow-down | [app] `packages/sync-engine/src/change-signal/tick-cadence.ts:1-2,50-54` | after 10 min without activity, change polling decays (`[30_000, 60_000]`); any activity restores it | sync only | Observed |
  | `setHostVisible` / `hostIsVisible` / `onHostVisibilityChange` | [app] `packages/utils/src/host-visibility.ts:4,16,20` | visible flag, listeners | Fed only on web from `document.visibilityState` (`_layout.tsx:99-103`); used by the cadence controller (`cadence-controller.ts:100-101,266-290`). On native nothing sets it, so it stays true | Observed / Inferred |
  | `requestStateManager.onWake` | [app] `use-http-client/request-state-manager.ts:166-226,256` | `visibilitychange`: hidden blocks new requests; visible fires wake callbacks; installs only when `document` exists | `hooks/use-user-validation.ts:138-140,396`, `hooks/use-site-info.ts:42-48`, `screens/main/receipt/hooks/use-templates-sync.ts:24-29`, `use-http-client/request-queue.ts:119`, `use-http-client/create-token-refresh-handler.ts:93`, `screens/main/pos/checkout/payments/record-manual-payment.ts:128-132` | Observed |
  | React Native `AppState` | [app] `screens/main/hooks/use-rendered-order-refresh.ts:21-42`; `apps/main/lib/payment-drivers/stripe-terminal/bridge.tsx:104`; `sumup/bridge.tsx:33` | foreground / background | order refresh while active; reader bridges on return to foreground | Observed |
  | Electron `powerMonitor` | [electron] `src/index.ts:143-163` | `suspend`, `resume`, `lock-screen`, `unlock-screen` | all four only log; `resume` also sends `system-resume` to the renderer. Lock/unlock are not forwarded | Observed |
  | `system-resume` IPC | [electron] `src/ipc-channels.ts:150,185`; [app] `packages/printer/src/ipc/channels.cts:144,178` | allowed channel | nothing in [app] subscribes to it | Observed (absence of a subscriber) |

- **Electron visibility.** `backgroundThrottling: false`, and the comment says `visibilityState` stays `visible` even when minimised, so on desktop only the activity-based signal changes. **Observed** (comment, [electron] `src/main/window.ts:47-56`); runtime effect **Inferred**.
- `useAppState` in `contexts/app-state` is the session/store context, unrelated to RN `AppState`. **Observed** ([app] `contexts/app-state/index.tsx:33`).

---

## 6. Offline

| Action | Offline? | Label / source |
|---|---|---|
| First sign-in (any platform) | No: loads the server's `wcpos_login_url`, or the server-rendered `/pos` page | Inferred ([app] `hooks/use-wcpos-auth/index.ts:31-34`; [free] `Templates/Auth.php`, `Frontend.php`) |
| Token refresh | No: POST `auth/refresh`; a network failure is transient and never latches `authFailed` | Observed ([app] `refresh-access-token.ts:186-200,246-249`) |
| Any request | Fails preflight with `DEVICE_OFFLINE`, so no 401 arrives and no refresh is attempted | Observed ([app] `request-state-manager.ts:277-282`; `screens/main/hooks/use-rest-http-client/index.ts:154-158`); consequence Inferred |
| Boot, native and Electron | Yes, with any stored token: the network hydration steps are web-only; the rest opens the DB and hydrates from the persisted pointer. Expiry matters only at the first 401 after coming back online | Observed ([app] `hydration-steps.ts:103-127,137,249-250,304-330`; `packages/utils/src/platform/index.electron.ts:18`); consequence Inferred |
| Boot, embedded web | No: needs PHP to render `/pos`; no service worker found | Inferred; Observed (absence of a service worker in [app] `apps/main` and [free] `assets/js`) |
| Connect-screen tile entry | No: Open POS needs `useUserValidation`'s network call to succeed | Inferred (§2) |
| "Hand the till to" in the user sheet | Not disabled offline, and `login()` makes no validation request on this path | Observed ([app] `user-sheet.tsx:316,534-560`); that it completes fully offline is Inferred |
| "Another account…" | Hidden offline | Observed ([app] `user-sheet.tsx:719-722`) |

---

## 7. Web specifics

- **Two web modes.** Embedded: `globalThis.initialProps` carries `site` and `wp_credentials` (the `/pos` page). Standalone: no `initialProps`; the user connects by OAuth, e.g. from `https://wcpos.expo.app`. **Observed** ([app] `contexts/app-state/initial-props.web.ts:4-23`; [free] `Templates/Auth.php:73-82`).
- **Reload re-points to the cookie user.** On every embedded boot the payload is merged into `wp_credentials` and the session pointer is set to the payload's credential (`wpCredentialsID = payload uuid`), whatever cashier was active before. **Observed** ([app] `hydration-steps.ts:137-210`; `user-db/hydration.ts:61-67`; `user-db/credentials.ts:91-113`). So a person who reloads gets the WordPress cookie user's POS, with a freshly minted access token (§1.1). **Inferred.**
- **Logout on embedded web** clears the till stamp and navigates to `wp-login.php?action=logout&…&redirect_to=<pos>&reauth=1&wcpos=1`; `wp_logout` then revokes that browser's POS session. **Observed** ([app] `contexts/app-state/index.tsx:170-184`; [free] `Frontend.php:367-380`; `Auth.php:79-83`). Standalone web and native clear only the local pointer. **Observed** (`index.tsx:185-189`).
- **More than one cashier on embedded web.** "Another account…" has no web or embedded check, and OAuth back to the site's own origin is allowed, so the User DB can hold several cashiers' credentials there. **Observed** ([app] `user-sheet.tsx:719-722`; [free] `Templates/Auth.php:262-310`). The embedded boot credential is not added to the site's link array (only `saveLoginCredentials` links), so the WordPress cookie user would not appear in another cashier's "Hand the till to" list. **Inferred** ([app] `user-db/hydration.ts:61-67`; `user-db/credentials.ts:77`; `user-db/reads.ts:58-70`).
- **What a lock in the page could not reach.** The WordPress auth cookie is set and read by WordPress, outside the app; any reload of `/pos` while it is valid re-mints a token for that user and opens the POS. The app holds no copy of the cookie. **Inferred** from the above. The app's own controls over that cookie are limited to sending the browser to the WordPress logout URL. **Observed** (`index.tsx:170-184`).
- **Live-tab gate** is storage ownership, not auth: Web Locks and BroadcastChannel let one tab own the OPFS worker; others show a parked screen with take-over. **Observed** ([app] `apps/main/components/live-tab-gate.web.tsx:34-110`).

---

## 8. Existing PIN, passcode and approval-by-credential code

- **No PIN, passcode or biometric code** in [app], [free], [pro] or [electron]; no PIN field on users or printers. **Observed (absence).** Unrelated "codes": customer-display pairing codes ([pro] `includes/Services/Customer_Display.php:55-94`), a Stripe reader pairing callback ([app] `apps/main/lib/payment-drivers/stripe-terminal/driver.ts:193-194`), `OrderApproval` in money commands (the cashier's press, no credential; [app] `packages/query/src/store-local/money-commands.ts:30-33`). **Observed.**

### 8.1 Close-time variance approval

- **Client.** `ApproveSheet` posts `sessions/{id}/approve` with `{ username, password, counted }`, online only; fields from `ApprovalFields`. It accepts the response only if `approved_by` is numeric and `approved_counted` matches, clears the password, records the approval locally (`recordApproval`), then closes the session; `wcpos_override_refused` logs `approval-refused`. Need for approval is decided by variance over threshold or a server `approval_required` flag, unless this exact count is already approved. **Observed** ([app] `screens/main/pos/cart/approve-sheet.tsx:39-86,107`; `screens/main/components/register-count/approval-fields.tsx`; `services/register-session/count-decision.ts:47-54`; `register-session/session-store.ts:818-837`).
- **Server.** Route needs `manage_woocommerce_pos_cash` from the caller. Inline in `approve()`: session must be `counting`; `wp_authenticate($username, $password)` (the full WordPress authenticate filter chain, so 2FA/captcha plugins may act); refused if the approver is the current user or lacks `manage_woocommerce_pos_closures`; every refusal is 403 `wcpos_override_refused`. The store also refuses the session's opener (`refuse_own_approval`) and writes `approved_by`, `approved_counted`, `approved_expected` while still `counting`. **No token is issued**; the response is the session row. Doc comment: "Check manager credentials for this request only; persist only the approver id". **Observed** ([free] `includes/API/V2/Sessions_Controller.php:43,70-71,101-102,302-326`; `includes/Services/Register_Session_Store.php:279-321`).
- **No rate limit or lockout** on this route. **Observed (absence)**; the only throttling is on the app login page ([free] `Templates/Auth.php:30-48`).
- **Recorded.** The approver id is carried onto the closure (`approved_by`, `approved_by_name`) and printed on the closure receipt. **Observed** ([free] `includes/Services/Closure_Store.php:799,884-885`; `templates/closure.php:34-35`).
- **A token-based approver path exists on the server only.** `change_status()` accepts an optional `approver_token` on close, validated with `Auth::instance()->validate_token()` with the same self-approval and capability checks. The app has a schema field for it and preserves it in the queue but never sets it. **Observed** ([free] `Sessions_Controller.php:367-374`; [app] `packages/database/src/collections/schemas/register-sessions.ts:49`; `register-session/queue.ts:219`); unused **Inferred** (no setter found).

### 8.2 Closure recount approval

- **Client.** `RecountSheet` posts `closures/{id}/recount` and adds `approval: { username, password }` only when the current user lacks `manage_woocommerce_pos_closures`; it reuses `ApprovalFields`. **Observed** ([app] `screens/main/reports/closures/recount-sheet.tsx:70,108-112,189`).
- **Server.** With an `approval`, the permission check drops the closures capability from the caller's requirement; inline `wp_authenticate()`; failure `wcpos_recount_approval_invalid`, approver without `manage_woocommerce_pos_closures` `wcpos_recount_approval_forbidden`; approver id passed to `recount()`. No self-approval check, no rate limit. **Observed** ([free] `includes/API/V2/Closures_Controller.php:72-76,135-171`).

### 8.3 Reusability

- The two approval checks are separate inline copies of the same steps (`wp_authenticate` → capability check → approver id); there is no shared helper. The only shared piece is `refuse_own_approval`, used by both session approval paths. **Observed** ([free] `Sessions_Controller.php:309-326`; `Closures_Controller.php:135-148`; `Register_Session_Store.php:279`).
- The app-login check (`authenticate_direct`, `wp_check_password`, rate limit and lockout) is `private` to `Templates\Auth` and not reused. **Observed** ([free] `Templates/Auth.php:30-48,487-536`).
- `manage_woocommerce_pos_closures` is granted to administrator and shop_manager by default and is configurable in Access settings. **Observed** ([free] `includes/Activator.php:1303,1325`; `includes/Services/Settings/Access_Section.php:141`).
- Both approval checks answer yes/no for one request and return no credential, so neither currently yields a token for the approver. **Observed** (§8.1, §8.2). The server's `approver_token` path is the one place a second user's JWT is accepted for an action. **Observed** (§8.1).

---

## Could not determine

1. **Hand-over offline, end to end:** whether `login()` from "Hand the till to" completes with no network on native and desktop (read, not run).
2. **Open-cart count per row:** whether the hand-over list's "{count} open cart(s)" can read another cashier's carts from the active engine, given per-cashier databases.
3. **`router.back()` after "Another account…"** inside the user sheet: whether it has a navigation side effect.
4. **Electron auth partition:** whether `persist:external-auth` ever holds a WordPress cookie in practice, and so whether a second login prompt on desktop can complete without a password.
5. **2FA on approvals:** how common 2FA plugins behave on the `wp_authenticate()` used by variance and recount approval (they run there, unlike the app login); not tested.
6. **Electron on-disk protection:** whether the OS-level `userData` location adds any protection to the plain-text SQLite files beyond file permissions.
