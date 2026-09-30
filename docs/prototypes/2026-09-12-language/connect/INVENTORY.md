<!-- Read-only inventory of the screen on monorepo `next` at f45a7b48a0, 2026-09-18, for roadmap#288: the feature floor the drawing must rehost. Source-only; nothing was run. -->
# CONNECT / login screen inventory

**Evidence:** Observed in source only; runtime appearance and behavior are **unverified**. No builds, tests, or modifications were performed.
**Scope:** `packages/core/src/screens/auth/**`, its hooks README, and `apps/main/app/(auth)/**`; shared dependencies were followed where they determine visible behavior.
**Delivery:** Entire inventory below, rather than a file, as requested.

## 1. Structure

- **Route:** `apps/main/app/(auth)/connect.tsx:1` re-exports `Connect`; the auth stack starts at `connect` and hides its navigation header. `apps/main/app/(auth)/_layout.tsx:13`.
- **Entry/exit:** The root protects the app stack using `hasStoreSession`; an established session redirects from auth to `/(app)/(drawer)/(pos)`. `apps/main/app/_layout.tsx:104`; `apps/main/app/(auth)/_layout.tsx:39`.
- **Page shell:** Keyboard-avoiding wrapper, vertically scrollable viewport, centered content, 8-point outer padding, full-width column capped at 460 pixels. Taps handled by controls persist while the keyboard is open. `packages/core/src/screens/auth/connect.tsx:20`.
- **Top:** WCPOS logo, 120 × 120. No separate “Connect” page heading or introductory paragraph. `packages/core/src/screens/auth/connect.tsx:31`.
- **URL card:** Label; horizontal URL input and Connect button; conditional error text; conditional documentation link below the error. `packages/core/src/screens/auth/components/url-input.tsx:23`.
- **Saved sites:** Below the URL card, within error/suspense boundaries. No sites means the entire region disappears. `packages/core/src/screens/auth/connect.tsx:36`; `packages/core/src/screens/auth/components/sites.tsx:74`.
- **One site:** A directly expanded card, without an accordion or “Your Sites” heading. Header contains favicon/initials, site name, full URL, and destructive remove icon. `packages/core/src/screens/auth/components/sites.tsx:78`; `packages/core/src/screens/auth/components/site.tsx:39`.
- **Multiple sites:** One card headed “Your Sites”; single-open, collapsible accordion; left chevron, site identity, optional user-count badge, independent remove icon, separators. `packages/core/src/screens/auth/components/sites.tsx:89`.
- **Site body:** Compatible sites show WordPress users, add/sign-in control, then the selected user’s stores and Open POS. Incompatible sites replace this body with the plugin-update warning. `packages/core/src/screens/auth/components/site.tsx:95`.
- **Users:** Stacked selectable rows containing avatar/initials, display name, optional humanized roles, validation status/re-authentication, and removal. `packages/core/src/screens/auth/components/wp-user.tsx:159`.
- **Stores:** Inline radio-card list, not a separate page or overlay; optional store-number suffix; full-width Open POS button below. `packages/core/src/screens/auth/components/store-select.tsx:162`.
- **Bottom:** Small muted “Enter Demo Store” button, always rendered beneath the sites region. `packages/core/src/screens/auth/connect.tsx:41`.
- **Removal overlays:** Site and user removal each use centered `AlertDialog` overlays, not sheets or side panels. `packages/core/src/screens/auth/components/site.tsx:112`; `packages/core/src/screens/auth/components/wp-user.tsx:185`.
- **Authentication surface:** WordPress authentication is external to this component tree: web popup with full-page redirect fallback, native browser authentication session, Electron modal browser window. See §6.
- **Overlay host:** Auth layout mounts a `PortalHost`; the commented-out login-modal route is not active. `apps/main/app/(auth)/_layout.tsx:54`.
- **Completion:** OAuth saves/links credentials and calls `router.back()` only if possible; it does not itself select a store or enter POS. `packages/core/src/screens/auth/hooks/use-login-handler.ts:127`.

## 2. Every control and field

| Control | Kind | User-visible label | Default / visibility | Constraint | Action |
|---|---|---|---|---|---|
| Store address | URL input | “Enter the URL of your WooCommerce store:” | Empty; no placeholder | Autocorrect off; no explicit max length or URL-format validator | Edit address; submitting invokes connection. `packages/core/src/screens/auth/components/url-input.tsx:24` |
| Clear address | Icon button | Accessible name “Clear text” | Only when nonempty | None specified | Clears and refocuses input; clears an existing connect error through change handling. `packages/components/src/input/index.tsx:214` |
| Connect | Button | “Connect” | Disabled when exactly empty | Loading also disables the shared Button; whitespace passes the button check but fails hook validation | Starts discovery and persistence. `packages/core/src/screens/auth/components/url-input.tsx:41`; `packages/components/src/button/index.tsx:245` |
| Connect help | External link | “Learn more” | Only when `errorCode` exists | Not every error carries a code | Opens that error’s documentation. `packages/core/src/screens/auth/components/url-input.tsx:55` |
| Site header | Accordion trigger | Dynamic site name, URL, optional “1 user” / “N users” | Multiple sites only; first normally open | At most one expanded; all may be collapsed | Expand/collapse site body. `packages/core/src/screens/auth/components/sites.tsx:95` |
| Remove site | Destructive icon button | No explicit text label; `circleXmark` icon | Each site header | Confirmation required | Opens site-removal dialog. `packages/core/src/screens/auth/components/site.tsx:87` |
| Cancel site removal | Dialog button | “Cancel” | Dialog only | None | Closes dialog without removing. `packages/core/src/screens/auth/components/site.tsx:121` |
| Confirm site removal | Destructive dialog button | “Remove” | Dialog only | No saving/disabled state specified | Removes local site record and its user-site link. `packages/core/src/screens/auth/components/site.tsx:67` |
| Saved WordPress user | Selectable list row | Dynamic display name; fallback “Unknown User”; optional roles | First available user selected | Invalid users remain selectable | Selects user and clears explicit store selection. `packages/core/src/screens/auth/components/wp-users.tsx:42` |
| Re-authenticate | Warning-outline button | “Re-authenticate” | Finished validation and invalid user | No explicit readiness/processing disable prop | Opens WordPress authentication; does not select parent row. `packages/core/src/screens/auth/components/wp-user.tsx:137` |
| Remove user | Destructive icon button | No explicit text label; `xmark` icon | Each user row | Confirmation required | Opens user-removal dialog without selecting row. `packages/components/src/list-item/index.tsx:104` |
| Cancel user removal | Dialog button | “Cancel” | Dialog only | None | Closes dialog. `packages/core/src/screens/auth/components/wp-user.tsx:191` |
| Confirm user removal | Destructive dialog button | “Remove” | Dialog only | No saving/disabled state specified | Removes local credentials and site-credential link. `packages/core/src/screens/auth/components/wp-user.tsx:128` |
| First WordPress sign-in | Dashed pressable row with plus icon | “Sign in with WordPress” | Site has no saved users | Disabled until auth ready or while credentials process | Opens external sign-in. `packages/core/src/screens/auth/components/add-user-button.tsx:69` |
| Additional WordPress sign-in | Same row | “Add another user” | Site has saved users | Same constraints; processing label “Loading...” | Adds another account. `packages/core/src/screens/auth/components/add-user-button.tsx:97` |
| Compact account action | Plain pressable | “Another account…” | Exported compact variant; **not used by CONNECT** | Same constraints | Opens sign-in; no plus icon. `packages/core/src/screens/auth/components/add-user-button.tsx:80` |
| Store option | Pressable radio card | Store name, fallback “Default”; optional “#ID” | Selected user only | Exactly one effective selection; lone/offered register-bound store auto-selected | Selects local store ID. `packages/core/src/screens/auth/components/store-select.tsx:132` |
| Open POS | Large button with right arrow | “Open POS” | Below store list, including empty list | Disabled without selected store, during validation, or for invalid user; no dedicated reason string | Calls app-state login with site, credentials, and store IDs. `packages/core/src/screens/auth/components/store-select.tsx:160`; `packages/core/src/screens/auth/components/wp-users.tsx:87` |
| Demo | Small muted button | “Enter Demo Store” | Always present | Disabled during discovery or credential processing | Connects `https://demo.wcpos.com`, then starts authentication with `user=demo`. `packages/core/src/screens/auth/components/demo-button.tsx:70` |
| Toast help | Toast action | “Help” | Coded logger toast unless suppressed | External navigation | Opens error-code documentation. `packages/utils/src/logger/index.ts:866` |
| Render-error reset | Icon button | No text; `xmark` | Error-boundary fallback | Only render-boundary errors | Resets boundary. `packages/components/src/error-boundary/fallback.tsx:49` |

## 3. Every state

### First run, connection, and discovery

- **First-run empty:** Logo, empty URL card, disabled Connect, Demo button; no site card, welcome message, or empty-sites copy. `packages/core/src/screens/auth/components/sites.tsx:74`.
- **Idle with saved sites:** Same URL card above saved-site content; address is still initialized empty rather than populated from a saved site. `packages/core/src/screens/auth/components/url-input.tsx:19`.
- **Nonempty address:** Connect enabled unless loading; clear icon appears. Editing after failure removes error and documentation link. `packages/core/src/screens/auth/components/url-input.tsx:31`.
- **Blank/whitespace submission:** Inline “URL is required”; coded invalid-address toast; no inline DocsLink code is set on this early return. `packages/core/src/screens/auth/hooks/use-site-connect.ts:219`.
- **`discovering-url`:** Connect spinner; tries a HEAD Link-header probe, then `/wp-json/`; each probe has a 10-second timeout. `packages/core/src/screens/auth/hooks/use-url-discovery.ts:26`.
- **Discovery normalization:** Removes protocol, whitespace and trailing slashes, then uses HTTPS. Normalized address does not replace the text in the input. `packages/core/src/screens/auth/hooks/use-url-discovery.ts:88`.
- **Fallback discovery success:** A fallback HTTP 200, or JSON 401/403, identifies an API endpoint; restricted access is diagnosed in the API stage rather than immediately called “not WordPress.” `packages/core/src/screens/auth/hooks/use-url-discovery.ts:142`.
- **`discovering-api`:** Same spinner, no displayed stage label; requests `wcpos/v2/site`, falling back to API root only on 404; each GET allows 15 seconds. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:185`.
- **`testing-auth`:** Same spinner while authorization/transport and compatibility probes run. `packages/core/src/screens/auth/hooks/use-site-connect.ts:247`.
- **`saving`:** Same spinner while site is created/updated and linked; no separate saving banner. `packages/core/src/screens/auth/hooks/use-site-connect.ts:285`.
- **`success`:** Spinner stops and saved-site region updates; URL remains; no success banner or automatic WordPress sign-in for ordinary Connect. “Site connected successfully!” exists as unused progress copy. `packages/core/src/screens/auth/hooks/use-site-connect.ts:294`.
- **`error`:** Red inline message; “Learn more” only for a propagated `errorCode`; retry is Connect again or edit address. `packages/core/src/screens/auth/components/url-input.tsx:50`.
- **Internal discovery states:** Both discovery hooks name `idle`, `discovering`, `success`, `error`; CONNECT does not render these names. `packages/core/src/screens/auth/hooks/use-url-discovery.ts:15`; `packages/core/src/screens/auth/hooks/use-api-discovery.ts:47`.

### Distinct connection errors

- **No WordPress endpoint:** “Site does not seem to be a WordPress site”; no inline code/link. `packages/core/src/screens/auth/hooks/use-url-discovery.ts:222`.
- **Timeout:** “The site took too long to respond — check the server and try again”; no inline code/link. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:132`.
- **Bot challenge during URL probes:** If neither probe finds an API and either encountered `cf-mitigated: challenge`, show hosting-block copy plus HOST121 DocsLink; challenge takes precedence over timeout. A successful fallback may continue despite a challenged front page. `packages/core/src/screens/auth/hooks/use-url-discovery.ts:198`.
- **Bot challenge during API fetch:** Same inline hosting-block copy and HOST121 link, plus explicit hosting-block toast. Detection is case-insensitive for header name/value. There is **no CAPTCHA-solving overlay** in this flow. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:114`; `packages/core/src/screens/auth/hooks/bot-challenge.ts:7`.
- **Restricted API:** JSON 401/403 shows server `message` verbatim, otherwise the REST-authentication explanation in §4; AUTH301 toast, but no propagated inline code. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:137`.
- **Malformed/non-object response or other HTTP response failure:** “Bad API response”; missing/non-array namespaces instead gives “WordPress API not found.” `packages/core/src/screens/auth/hooks/use-api-discovery.ts:161`.
- **WooCommerce missing:** “WooCommerce API not found”; AUTH321 inline docs and toast. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:252`.
- **Older WCPOS API:** “Please update your WCPOS plugin”; AUTH331 inline docs and same explicit toast title. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:266`.
- **WCPOS absent/required routes unavailable:** “WCPOS API not found”; AUTH311 inline docs and explicit toast. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:299`.
- **Missing authentication object / endpoint / invalid endpoint:** Three separate strings in §4; toast codes AUTH311/AUTH411, but thrown errors do not propagate inline documentation codes. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:329`.
- **Host rejects authentication/transport:** AUTH421 uses login-token copy; AUTH431 uses REST-unreachable copy; AUTH441, HOST101, HOST111, HOST121, HOST131 use generic hosting-block copy, each with its own docs code. `packages/core/src/screens/auth/hooks/use-site-connect.ts:257`; `packages/core/src/contexts/app-state/hydration-steps.ts:402`.
- **Compatibility warning:** HOST141 search-filter warning toast does not stop connection. **Blocking compatibility failure:** HOST151 shared-cache replay stops connection with hosting-block copy and docs. `packages/core/src/contexts/app-state/hydration-steps.ts:451`.
- **Other failures:** API URL required, discovery failure, authorization-test failure, configuration-save failure, site-data-save failure, generic connection failure, or an underlying error message; exact fallback strings in §4. `packages/core/src/screens/auth/hooks/use-site-connect.ts:272`; `packages/core/src/screens/auth/hooks/use-api-discovery.ts:386`.

### Sites, users, stores, and authentication

- **Incompatible saved site:** User/store controls replaced with “Please update your WCPOS plugin”; single-site layout includes warning icon, accordion body only warning text. `packages/core/src/screens/auth/components/site.tsx:102`; `packages/core/src/screens/auth/components/sites.tsx:210`.
- **No users:** “WordPress Users” heading and “Sign in with WordPress”; no separate no-users message, store section, or Open POS button. `packages/core/src/screens/auth/components/wp-users.tsx:53`.
- **Validation loading:** User row shows small spinner; Open POS disabled. No validation-progress text. `packages/core/src/screens/auth/components/wp-user.tsx:137`.
- **Valid user:** Success-colored avatar and “Logged In” badge. **Invalid user:** Warning avatar and “Re-authenticate”; selected invalid row retains selected highlight. `packages/core/src/screens/auth/components/wp-user.tsx:52`.
- **“Expired”:** Present in a badge expression but normally unreachable: loading takes the first branch, and finished-invalid takes Re-authenticate. `packages/core/src/screens/auth/components/wp-user.tsx:137`.
- **Credential processing:** Add-user row reads “Loading...” and disables; Demo uses spinner and disables. No saved confirmation. `packages/core/src/screens/auth/components/add-user-button.tsx:69`; `packages/core/src/screens/auth/components/demo-button.tsx:112`.
- **OAuth failure / malformed credentials / save failure:** Coded AUTH999 or SYNC101 toasts; hook errors are not rendered inline by these consumers. `packages/core/src/screens/auth/hooks/use-login-handler.ts:61`.
- **Wrong user returned during re-auth:** Saves returned credentials but does not adopt their token for active requests; explicit translated warning in §4. `packages/core/src/screens/auth/components/wp-user.tsx:96`.
- **OAuth cancel/dismiss/locked:** Consumers handle success/error only; no special CONNECT copy. On web, dismissal may trigger full-page redirect instead of simply ending the flow. `packages/core/src/screens/auth/components/add-user-button.tsx:36`; `packages/core/src/hooks/use-wcpos-auth/index.web.ts:201`.
- **Zero stores:** “Store” heading, “No stores found for this user. Ensure POS is set up on the server.”, disabled Open POS. Initial/reactively reset empty list uses this same presentation. `packages/core/src/screens/auth/components/store-select.tsx:128`.
- **One store / offered bound store:** Automatically selected; heading “Store”; binding narrows visible options to that store. **Multiple unbound stores:** “Select a Store”; none selected initially. `packages/core/src/screens/auth/components/store-select.tsx:132`.
- **Login rejection:** Remains on picker; handler logs “Store login failed” without requesting a toast or setting visible pending/error state. `packages/core/src/screens/auth/components/wp-users.tsx:93`.
- **Offline / permission denial:** No dedicated offline badge or permission-denied panel. Discovery failures use the errors above; failed user validation becomes Re-authenticate with disabled Open POS. `packages/core/src/hooks/use-user-validation.ts:403`.
- **Pro-locked:** No Pro upsell, lock, or license-gated control in the scoped screen; plugin compatibility is a version gate. `packages/core/src/screens/auth/components/site.tsx:96`.
- **Long text:** No screen-level truncation limit for site names/URLs, user names/roles, store names, or inline errors; shared user row uses flexible text space. Actual narrow-width wrapping is unverified. `packages/core/src/screens/auth/components/site.tsx:49`; `packages/components/src/list-item/index.tsx:91`.
- **Suspense:** Development fallback says “Loading ...”; production delegates to React Suspense with no explicit fallback supplied here. `packages/components/src/suspense/index.tsx:6`.
- **Render error:** “Something went wrong:” plus dynamic error and reset icon; under 200-pixel width or over 1,000-character error, details move into a tooltip. `packages/components/src/error-boundary/fallback.tsx:31`.

## 4. Every user-facing string

English catalog values below are verbatim. Section headings styled `uppercase` appear uppercased visually; values here preserve source casing.
Catalog: `packages/core/src/contexts/translations/locales/en/core.json:165`; shared values at `:255`, `:303`, `:323`, `:357`, `:362`, `:364`, `:416`.

### URL card and demo

| Key / source | Exact string |
|---|---|
| `auth.enter_the_url_of_your_woocommerce` + literal `:` | “Enter the URL of your WooCommerce store:” |
| `auth.connect` | “Connect” |
| `common.learn_more` | “Learn more” |
| `auth.enter_demo_store` | “Enter Demo Store” |
| Shared input literal, `packages/components/src/input/index.tsx:244` | “Clear text” |
| Placeholder/helper | None specified. `packages/core/src/screens/auth/components/url-input.tsx:26` |
| Documentation destination | `https://docs.wcpos.com/error-codes/{errorCode}`. `packages/utils/src/logger/constants.ts:9` |
| Demo destination | `https://demo.wcpos.com`. `packages/core/src/screens/auth/components/demo-button.tsx:78` |

### Sites, users, stores, and confirmations

| Key / source | Exact string |
|---|---|
| `auth.your_sites` | “Your Sites” |
| `auth.user`; `auth.users` | “user”; “users” — badge combines numeric count, space, word |
| `auth.wordpress_users` | “WordPress Users” |
| `auth.sign_in_with_wordpress`; `auth.add_another_user` | “Sign in with WordPress”; “Add another user” |
| `common.loading` | “Loading...” |
| `register.another_account` | “Another account…” — compact variant only; catalog `:109` |
| `auth.re_authenticate` | “Re-authenticate” |
| `common.logged_in`; `common.expired` | “Logged In”; “Expired” — latter normally unreachable |
| Literal, `packages/core/src/screens/auth/components/wp-user.tsx:52` | “Unknown User” |
| `auth.signed_in_as_different_user` | “Signed in as a different user — they were added to the list, but the selected user is still logged out.” |
| `auth.store`; `auth.select_a_store` | “Store”; “Select a Store” |
| `auth.no_stores_available` | “No stores found for this user. Ensure POS is set up on the server.” |
| `common.default`; `auth.open_pos` | “Default”; “Open POS” |
| `auth.remove_site` | “Remove site” |
| `auth.remove_store_and_associated_users` | “Remove store and associated users?” |
| `auth.remove_2`, `{ name: wpUser.display_name }` | “Remove {name}” |
| `auth.are_you_sure_you_want_to` | “Are you sure you want to remove this user? Removing a user from the POS will not affect any data on the server.” |
| `common.cancel`; `auth.remove` | “Cancel”; “Remove” |
| `common.please_update_your_woocommerce_pos_plugin` | “Please update your WCPOS plugin” |
| Dynamic text | Site name/full URL; user display name; role slugs split/title-cased and joined with “, ”; store name and “#” followed by ID. `packages/core/src/screens/auth/components/wp-user.tsx:56`; `packages/core/src/screens/auth/components/store-select.tsx:200` |

### Connection errors

These are rendered through the inline `error` value, with the conditional paths described in §3.
Catalog: `packages/core/src/contexts/translations/locales/en/core.json:167`–`:218`.

| Key | Exact string |
|---|---|
| `auth.url_is_required` | “URL is required” |
| `auth.site_does_not_seem_to_be` | “Site does not seem to be a WordPress site” |
| `auth.site_took_too_long_to_respond` | “The site took too long to respond — check the server and try again” |
| `auth.failed_to_discover_wordpress_api` | “Failed to discover WordPress API” |
| `auth.wordpress_api_url_is_required` | “WordPress API URL is required” |
| `auth.bad_api_response` | “Bad API response” |
| `auth.wordpress_api_not_found` | “WordPress API not found” |
| `auth.rest_api_restricted` | “The WordPress REST API on this site requires authentication. A security plugin may be blocking public access to the REST API.” |
| `auth.woocommerce_api_not_found` | “WooCommerce API not found” |
| `auth.woocommerce_pos_api_not_found` | “WCPOS API not found” |
| `auth.authentication_configuration_not_found` | “Authentication configuration not found” |
| `auth.wcpos_authentication_endpoint_not_found_please` | “WCPOS authentication endpoint not found. Please ensure WCPOS plugin is version 1.8.0 or higher” |
| `auth.wcpos_login_url_is_invalid_please` | “WCPOS login URL is invalid. Please ensure WCPOS plugin is properly configured” |
| `auth.failed_to_discover_api_endpoints` | “Failed to discover API endpoints” |
| `auth.server_blocks_login_token` | “The store's server is blocking the login token — ask your host about the Authorization header.” |
| `auth.store_rest_api_unreachable` | “The store's REST API did not answer at any address — a security plugin or firewall may be blocking it.” |
| `auth.host_compatibility_problem` | “This store's hosting setup is blocking the app — the details page names the exact cause and fix.” |
| `auth.failed_to_test_authorization_methods` | “Failed to test authorization methods” |
| `auth.failed_to_save_site_data` | “Failed to save site data” |
| `auth.failed_to_save_site_configuration` | “Failed to save site configuration” |
| `auth.failed_to_connect_to_site` | “Failed to connect to site” |
| Dynamic errors | Server-provided restricted-API message or propagated `Error.message`; not a finite translated vocabulary. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:148`; `packages/core/src/screens/auth/hooks/use-site-connect.ts:305` |

### Progress copy present in hooks but not displayed by CONNECT

- `auth.discovering_wordpress_api`: “Discovering WordPress API...”; `auth.validating_api_endpoints`: “Validating API endpoints...”.
- `auth.testing_authorization_methods`: “Testing authorization methods...”; `auth.saving_site_configuration`: “Saving site configuration...”.
- `auth.site_connected_successfully`: “Site connected successfully!”.
- These populate `progress`; `UrlInput` consumes only `onConnect`, `loading`, `error`, `errorCode`, and `reset`. `packages/core/src/screens/auth/hooks/use-site-connect.ts:235`; `packages/core/src/screens/auth/components/url-input.tsx:18`.

### Toast copy and shared fallbacks

Logger messages such as “Login failed: …” are **not normally the displayed toast title**: the app installs a merchant-copy adapter; explicit titles win, otherwise the translated code summary and action are used. `apps/main/app/_layout.tsx:93`; `packages/core/src/contexts/merchant-toast.ts:49`.
For the following table, keys are `health.logs.error_summary.{CODE}` and `health.logs.error_action.{CODE}`.
Sources: `packages/core/src/contexts/translations/locales/en/core.json:1859`, `:1873`, `:1905`, `:1921`–`:1932`, `:1958`, `:1972`, `:2004`, `:2020`–`:2031`.

| Code | Exact title | Exact description |
|---|---|---|
| AUTH999 | “Signing in or staying signed in hit an unexpected problem.” | “Try again; if it repeats, contact support with the log details.” |
| SYNC101 | “This change could not be saved to the local database and remains only on this device.” | “Note the unsaved change and check device storage, then restart. Do not clear local data.” |
| AUTH411 | “The store address is missing or not a valid URL.” | “Check the store address for typos.” |
| AUTH301 | “Another authentication plugin is preventing WCPOS from connecting.” | “Ask the site admin to exempt WCPOS in the conflicting auth plugin.” |
| AUTH311 | “The WCPOS store route is unavailable.” | “Ask the site admin to check WCPOS is active and REST isn't blocked.” |
| AUTH321 | “WooCommerce is not active on this site, so WCPOS cannot connect.” | “Ask the site admin to reactivate WooCommerce, then reconnect.” |
| AUTH421 | “The store's server is blocking the login token on every channel this app can use.” | “Ask your host to let the Authorization header reach WordPress.” |
| AUTH431 | “The store's REST API did not answer on any address form this app can use.” | “Ask your host to allow the store's REST API through.” |
| AUTH441 | “The login token is larger than this server accepts.” | “Ask your host to raise the header and URL size limit.” |
| HOST101 | “The server is blocking the browser's permission check (CORS preflight), so the web app cannot reach it.” | “Ask your host to allow the API's OPTIONS preflight.” |
| HOST111 | “The server's cross-origin (CORS) configuration is broken, so the browser refuses its responses.” | “Ask your host to fix the store's CORS headers.” |
| HOST121 | “A bot-protection page is answering instead of the store's API.” | “Ask your host to allow-list the store's API paths.” |
| HOST131 | “A proxy in front of the store rejects the server's responses for having too many headers.” | “Ask your host to raise the proxy's header limit.” |
| HOST141 | “The host's security filter is blocking product searches.” | “Ask your host to allow product-search requests.” |
| HOST151 | “A cache in front of the store is replaying one person's API responses to everyone.” | “Ask your host to exclude the API from caching.” |

- **Explicit overrides:** Outdated plugin → “Please update your WCPOS plugin”; missing WCPOS namespace → “WCPOS API not found”; invalid HTTP response → “Bad API response”; API-fetch bot challenge → hosting-block sentence; wrong-user re-auth → different-user warning above. These bypass generic summary/action selection. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:119`, `:165`, `:281`, `:309`.
- **Toast action:** Literal “Help”, linking to `https://docs.wcpos.com/error-codes/{code}`. `packages/utils/src/logger/index.ts:873`.
- **Shared render fallback:** Literal “Something went wrong:” plus dynamic error; development suspense literal “Loading ...”. `packages/components/src/error-boundary/fallback.tsx:44`; `packages/components/src/suspense/suspense.tsx:17`.
- **Diagnostics, not additional CONNECT labels:** “Invalid login response - missing required parameters”, “Failed to save WordPress credentials”, OAuth security/parser errors, and prefixed login/re-auth errors feed logging/handler state; coded toast translation normally replaces them. `packages/core/src/screens/auth/hooks/use-login-handler.ts:63`, `:142`.

## 5. Learned behaviour

**Ledger result:** No `LEDGER.md` or `<stem>.LEDGER.md` exists under the scoped auth screen or auth route folders. There are therefore no in-scope numbered ledger entries to list.
The following behavior is observed in source and marked **no ledger line**:

- **Sites — no ledger line:** First site expands initially; newly added site expands immediately; explicit all-collapsed state survives ordinary updates; removal of the expanded site falls back to the first remaining site. `packages/core/src/screens/auth/components/sites-expansion.ts:10`.
- **Redirect return — no ledger line:** Expand the initiating site so its otherwise-unmounted authentication consumer can receive the one-shot result. `packages/core/src/screens/auth/components/sites.tsx:57`.
- **Site reconnect — no ledger line:** Updating discovery details preserves locally linked users rather than erasing them while login is in flight. `packages/core/src/screens/auth/hooks/use-site-connect.ts:150`.
- **URL entry — no ledger line:** Clear refocuses; editing dismisses stale errors; keyboard submission runs the same connect operation. `packages/core/src/screens/auth/components/url-input.tsx:31`; `packages/components/src/input/index.tsx:214`.
- **Discovery — no ledger line:** Front-page timeout still allows `/wp-json/` fallback; a challenge on the front page alone does not prevent a successful fallback. `packages/core/src/screens/auth/hooks/use-url-discovery.ts:204`.
- **Discovery messaging — no ledger line:** An installed older WCPOS API gets update instructions, not “API not found”; missing/hidden current routes remain a distinct error. `packages/core/src/screens/auth/hooks/use-api-discovery.ts:261`.
- **User selection — no ledger line:** First credential is implicit default; removed explicit choice falls back to first remaining; changing user resets store choice. `packages/core/src/screens/auth/components/wp-users.tsx:37`.
- **User row — no ledger line:** Re-authenticate and remove stop press propagation; selected expired users keep selected styling instead of being visually replaced by the warning variant. `packages/core/src/screens/auth/components/wp-user.tsx:143`, `:165`.
- **Account addition — no ledger line:** New presses reset response deduplication so repeating the same login/error is not silently ignored. `packages/core/src/screens/auth/components/add-user-button.tsx:71`.
- **Re-authentication — no ledger line:** A returned different user may be added, but their token must not replace the selected user’s active token; warn explicitly. `packages/core/src/screens/auth/components/wp-user.tsx:89`.
- **Store list — no ledger line:** Names sort naturally and case-insensitively; numeric store ID breaks name ties, avoiding hash-order reshuffling between logins. `packages/core/src/screens/auth/components/store-select.tsx:23`.
- **Store refresh — no ledger line:** Reactively inserted/renamed stores and newly received numeric IDs update the picker; switching users clears previous stores. `packages/core/src/screens/auth/components/store-select.tsx:69`; `packages/core/src/screens/auth/components/store-select.helpers.ts:14`.
- **Register binding — no ledger line:** A binding only preselects a store actually offered to this user; unavailable bindings do not remove the ordinary picker; lone-store behavior remains. `packages/core/src/screens/auth/components/store-select.helpers.ts:26`.
- **Validation — no ledger line:** Known invalid/in-flight users cannot open POS; background-blocked validation defers and retries on wake rather than immediately marking credentials invalid. `packages/core/src/screens/auth/components/store-select.tsx:156`; `packages/core/src/hooks/use-user-validation.ts:404`.
- **Demo — no ledger line:** Discovery precedes auth; one auth prompt per attempt; Demo does not bypass the store-selection flow. `packages/core/src/screens/auth/components/demo-button.tsx:96`.

## 6. Platform differences

- **Screen layout:** No platform-specific auth-screen files or width-based page variants in scope; all use the same capped column. `packages/core/src/screens/auth/connect.tsx:31`.
- **Native keyboard:** Real keyboard-controller wrapper uses padding avoidance; web wrapper returns children unchanged. `packages/components/src/keyboard-controller/index.tsx:1`; `packages/components/src/keyboard-controller/index.web.tsx:17`.
- **Web authentication:** Implementation first tries Expo’s popup flow, despite the file’s same-window-first header comment; missing/dismissed popup or a blocked-popup exception triggers same-window redirect. `packages/core/src/hooks/use-wcpos-auth/index.web.ts:182`.
- **Web return:** Result is captured once and claimed by initiating site/consumer; add-user and per-user re-auth have different claim keys. `packages/core/src/hooks/use-wcpos-auth/index.web.ts:52`; `packages/core/src/screens/auth/components/add-user-button.tsx:31`.
- **Native authentication:** Expo AuthSession; Android Custom Tab uses `createTask:false` to avoid resurrecting a separate browser task; iOS uses its system authentication session. `packages/core/src/hooks/use-wcpos-auth/index.ts:99`.
- **Electron authentication:** IPC `auth:prompt` opens a modal BrowserWindow; renderer validates returned state. Actual shell window chrome/layout is outside this repository’s scoped files. `packages/core/src/hooks/use-wcpos-auth/index.electron.ts:1`, `:73`.
- **Confirmation dialogs:** Same centered modality; web CSS fade/zoom, native Reanimated fade. Footer stacks in reverse order below `sm` and becomes a right-aligned row at `sm`. `packages/components/src/alert-dialog/index.tsx:20`, `:36`, `:92`.
- **Interaction styling:** Web adds cursor/hover/color-transition treatment to account/store choices; touch selection remains available. `packages/core/src/screens/auth/components/add-user-button.tsx:84`; `packages/core/src/screens/auth/components/store-select.tsx:192`.
- **Theme/system bars:** Semantic background; light theme uses dark system-bar icons, other themes light icons. `apps/main/app/(auth)/_layout.tsx:27`.
- **Browser-only host states:** CORS diagnostics distinguish blocked preflight from broken response headers; native/Electron do not take this browser evidence branch. `packages/core/src/contexts/app-state/hydration-steps.ts:520`.

## 7. Open questions

- **README drift:** README describes `wcpos/v1`, older compatibility requirements, API-root-first discovery and visible progress tracking; implementation uses `wcpos/v2/site` first and does not render progress. Which documentation is intended as the designer’s contract? `packages/core/src/screens/auth/hooks/README.md:33`, `:123`, `:204`; `packages/core/src/screens/auth/hooks/use-api-discovery.ts:195`.
- **Version-gate mismatch:** Saved-site compatibility uses the minimum in `wcpos-plugin-version.ts`, but discovery only checks version inside the missing-required-namespace branch. A site with the namespace and too-old version can therefore reach a different gate later. `packages/core/src/utils/wcpos-plugin-version.ts:15`; `packages/core/src/screens/auth/hooks/use-api-discovery.ts:266`.
- **Stale endpoint-error copy:** The authentication-endpoint error still explicitly says “version 1.8.0 or higher”; this differs from the current compatibility constant. `packages/core/src/contexts/translations/locales/en/core.json:213`.
- **Demo errors:** Demo discards `useSiteConnect.error/errorCode`; URL-discovery timeout/non-WordPress/challenge paths do not all request toasts. Some demo connection failures therefore have no explicit feedback in this component. `packages/core/src/screens/auth/components/demo-button.tsx:17`, `:87`; `packages/core/src/screens/auth/hooks/use-url-discovery.ts:212`.
- **Validation timing:** `isValid` starts true and `isLoading` false before validation effect starts; screen comments describe blocking in-flight validation, but first-frame/reselection timing is unverified. `packages/core/src/hooks/use-user-validation.ts:40`; `packages/core/src/screens/auth/components/store-select.tsx:156`.
- **Removal lifecycle:** Dialog actions do not explicitly close, disable, or show errors while awaiting removal; shared Action is a Button, unlike Cancel’s explicit close. Successful deletion normally unmounts the owner; failed-removal behavior is unverified. `packages/components/src/alert-dialog/index.tsx:129`; `packages/core/src/screens/auth/components/site.tsx:67`.
- **Credential-save failure contract:** Login handler catches and records failures without rethrowing, while re-auth awaits it before adopting a token. Visible outcome after a persistence failure is not established by this source-only inventory. `packages/core/src/screens/auth/hooks/use-login-handler.ts:140`; `packages/core/src/screens/auth/components/wp-user.tsx:89`.
- **External WordPress page:** Username/password fields, password reset, server permission-denied messages and any challenge inside the external browser are server-owned; their strings/layout cannot be inventoried from these files. `packages/core/src/hooks/use-wcpos-auth/index.ts:29`.
- **Layout/accessibility verification:** Long translations, phone-width wrapping, keyboard focus, overlay dismissal, and unnamed icon announcements require runtime inspection; no claims of visual verification are made.

### Behavior changes / regressions

None introduced: this was a read-only inventory. Existing ambiguities are recorded above, not asserted as runtime-tested regressions.