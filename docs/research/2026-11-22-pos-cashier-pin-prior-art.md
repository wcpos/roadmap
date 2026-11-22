# Prior-art POS cashier PINs: who sets them, switching, idle lock, lockout and offline

**Research note, 2026-11-22**, for [roadmap#616](https://github.com/wcpos/roadmap/issues/616) (map [#599](https://github.com/wcpos/roadmap/issues/599)).

This note builds on the [staff identity research](https://github.com/wcpos/monorepo/blob/research/pos-staff-identity/.claude/research/2026-09-10-pos-staff-identity.md) of 2026-09-10, called "the identity note" below. Its §4 and §5 already cover, in outline:

- PIN lengths per vendor (Square 4, Shopify 4–6, Loyverse 4, Revel 6, Toast 1–8 or 4+);
- Shopify's 5-try lockout;
- Lightspeed X's barcode switching and its four switching-security settings;
- R-Series' *Verify PIN Delay* and *Auto Sign Out Delay*;
- Erply's `switchUser`, which mints a new session key;
- Odoo's client-side, unsalted SHA-1 PIN check.

Those points are not re-argued here; they are only extended or corrected. The sibling [permissions note](https://github.com/wcpos/roadmap/blob/research/pos-staff-permissions-prior-art/docs/research/2026-11-22-pos-staff-permissions-prior-art.md) of the same day covers what a cashier may do. This note covers how a cashier proves who they are at a shared till.

**Sources.** Primary only: vendor help centres, vendor API references and source code, all read 2026-11-22. Source code is cited at a fixed revision:

- Odoo: branch `18.0` at commit `465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa`, shortened to `odoo@465ae31c`. Links are relative to `https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/`.
- Clover Android SDK: commit `e792835936a164cf730f4d8bb44fc242a246b429`, shortened to `clover-sdk@e7928359`. Links are relative to `https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/`.
- WordPress plugins, each at a wordpress.org tag: FooSales `1.44.5`, Jovvie (`point-of-sale-pos-woocommerce`) `5.21.5`, wePOS `2.0.3`, Oliver POS (`oliver-pos`) `4.9.4`. Links point at `plugins.trac.wordpress.org/browser/<slug>/tags/<tag>/`. The text was read from the matching `downloads.wordpress.org` zip, because trac refuses scripted fetches.

**Labels.**

- **Observed**: stated in the vendor's own documentation or visible in its source.
- **Inferred**: my reading of what the vendor states or what the code does.
- **Unverified**: seen only in a search-result snippet, a community forum or a marketing page.
- **Not documented**: the vendor says nothing on the point. It is never a guess.

**Pages that would not render.**

- **Clover**: every `clover.com/help` locale is an empty app shell. Clover facts below come from its developer docs, its SDK source and one server-rendered regional support page; help-centre claims are snippets, labelled Unverified.
- **Shopify**: `help.shopify.com` returns a bot check to direct downloads. It was read through a fetch tool that returns extracts, so Shopify quotes are near-verbatim rather than byte-checked.
- **Lightspeed X-Series and R-Series**: both help centres return 403 to fetchers. They were read through the public Zendesk article API, which serves the same article body; the article URLs are cited.
- **X-Series**: the switching-security article the identity note cited (`25534175243419`) now returns 404. Its content is in [25534180030619](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534180030619).
- **Erply**: wiki screenshots were unreadable, including the one listing its idle sign-off options.
- **Toast**: the "find an employee's passcode" article returns 404; its replacement is cited.

---

## 1. Comparison

| | Who sets it; length; unique; shown again | Asked for | Required? | Switch screen | Open sale on switch | Wrong-attempt limit | Offline | Where checked | Time clock |
|---|---|---|---|---|---|---|---|---|---|
| **Square** | Owner or team creator; 4 digits, unique; staff can see theirs in the Team app | Per-device idle timeout (options not documented); "after each sale"; chosen tasks | Off until switched on per device | Keypad; badge tap (Inferred: code identifies) | Not documented; open tickets park sales | Not documented | Not documented | Not documented | **Yes** |
| **Shopify POS** | Admin roles; staff own (Unverified); 4–6 digits, unique; generate or type | Idle lock (options not documented); "Lock screen after sale"; Approval-required actions | **Always** | One PIN pad; the PIN identifies | Not documented; carts auto-save "Opened by" | **5 wrong, 30 s block** | Not documented; nearby-device approval needs internet | Not documented (sync implies device, Inferred) | Not documented |
| **Lightspeed X** | **No PIN**: password plus system-assigned barcode | Re-identify after each sale; idle 5 min–24 h; parked sale, layby, return, quote | Account-wide 4-way setting; password always when switching up | Pick a name or scan a barcode, then a password if required | **Cart survives** | Not documented | Not documented; must already be signed in | Not documented | Separate, after login |
| **Lightspeed R** | Admin; staff can change theirs; **6+ for sensitive roles**, no trivial codes | Verify PIN Delay (minutes); before each sale or workorder | Per employee ("Pin Active") | PIN only; it identifies | Not documented | Not documented; admin manual lock | No offline POS documented | Not documented | **Yes** |
| **Clover** | Owner, Dashboard or device app; 4–6 digits, all the same length (6 for new merchants, Unverified) | App start; "log out after each order"; named-action auth dialog | Optional "default employee" with no passcode | Lock = log out | Not documented | Not documented | Not documented (edits need network) | Not documented; API stores it hashed | Prompt at login exists |
| **Toast** | Manager in Toast Web; 3–8 / 6–8 / 4+ / 1–8 digits (four first-party answers); unique per location; **shown** in profile | "Auto switch user" after send, hold or pay; idle "Screen Timeout" ≥ 5 s; manager code for actions | Needed for any POS use | One passcode screen; it identifies | Stays with its owner; "Prompt user when editing another server's check" | Not documented (Toast Web: 5 per hour) | **Works**: staff clock in and take orders offline | Not documented (sync implies device, Inferred) | **Yes** |
| **Loyverse** | Owner or Employee Management; 4 digits, unique; **viewable** in Back Office | App start, switch, device wake; manager PIN for one-time access | Mandatory once any employee or Time Clock exists | One PIN pad; it identifies | Not documented; open tickets per person | Not documented | Not documented (app sells offline) | Not documented (viewable, so stored recoverably, Inferred) | **Yes** |
| **Odoo 18** | HR user, or staff if self-edit is on; digits, **no length**, **not unique**; plaintext | App start; manual Lock; **no idle lock** | Store switch; per employee (no PIN, no prompt) | Type a PIN (it identifies), pick a name, or scan a badge | Empty order passes to the new cashier; lined order re-stamped on next line | **None** | **Works**: hashes on device | **Device**, unsalted SHA-1 | Same field as Attendance kiosk |
| **Erply** | Manager on user card; **6+ digits**, or a swipe card; optional expiry | Idle sign-off (seconds or minutes); "Auto logout after sale" | Optional per user; password first | PIN only; it identifies | "Fully maintains POS state" on lock | Server blocks after repeats (count not documented) | **No**: switch and lock unsupported | **Server** (`switchUser`) | **Yes** |
| **FooSales** | Admin, or `…change_others_pin`; **exactly 4**; WP password hash; never shown | App start (after connect); "Lock POS"; idle minutes (free entry) | Store switch; forced on by user switching | Pick a user, then PIN | Not documented | **3 wrong in 24 h removes switch-user** until an admin restores it | **No** (Inferred) | **Server**, every request | Not in source |
| **Jovvie** | Staff on own profile or admin; 4–6 digits; WP hash; never shown | Never, 30 s, 1 min or 5 min idle; "Lock After Each Sale"; refund passcode | Per station, off by default | List of operators, then passcode | Not in source (client closed) | **5 per user+station per 60 s** | **No** (Inferred: lock state on server) | **Server** | Not in source |
| **Oliver POS** | Admin, or staff set-once then change-with-current; 4–6 digits, **unique**; WP hash; shown as `****` | "Require PIN to Open Shift"; idle not in source | Optional per staff | PIN alone identifies | Not in source (apps closed) | **5 per 15 min per device account** | **Online only** (server code and marketing) | **Server** | Not in source |
| **YITH POS** | No PIN: WordPress login | Not documented | n/a | One cashier per register; take-over | Logout leaves the register open | Not documented | Not documented | n/a | Not documented |
| **wePOS (free)** | No PIN, lock or switch in source | n/a | n/a | WordPress logout only | n/a | n/a | n/a | n/a | n/a |

---

## 2. Per-system evidence

### Square

Sources: [S1 passcodes](https://squareup.com/help/us/en/article/8357-require-passcodes-at-point-of-sale), [S2 team members](https://squareup.com/help/us/en/article/8356-add-and-manage-team-members), [S3 permission sets](https://squareup.com/help/us/en/article/5822-employee-permissions), [S4 troubleshooting](https://squareup.com/help/us/en/article/8589-troubleshoot-common-employee-tracking-issues), [S5 Square Stand](https://squareup.com/help/us/en/article/5175-accept-payments-with-square-stand), [S6 badges](https://squareup.com/help/us/en/article/7918-get-started-with-team-member-badges), [S7 open tickets](https://squareup.com/help/us/en/article/5337-use-open-tickets-with-square), [S8 offline](https://squareup.com/help/us/en/article/7777-process-card-payments-with-offline-mode).

1. **Setting.**
   - "Only account owners can require passcodes at point of sale and edit the owner passcode" (S1, **Observed**).
   - A personal passcode is assigned when the team member is created ("Generate a personal passcode"), and "they can see [it] upon accepting their invitation" (S2, **Observed**).
   - It is "a unique, 4-digit passcode" (S1, **Observed**).
   - Shown again: "Team members can later find their passcode in the Square Team app" (S2, **Observed**).
   - Reset by editing it in Dashboard (S1, S2). A self-service reset is not documented.
2. **When.**
   - Idle: the timeout "determines how long your point of sale stays unlocked after the last interaction", set on the device or per location in Modes (S1, **Observed**). The options on offer are not documented; a community post lists Never, 30 seconds, 1 minute and 5 minutes (**Unverified**: [community](https://community.squareup.com/t5/Orders-Menu-Items-Catalog/HELP-Setting-Timeout-on-Square-for-Retail-POS/td-p/714764)).
   - After a sale: "Require passcode after each sale" (S4, **Observed**).
   - Named actions: "select the tasks you want to require a passcode to perform" (S1, **Observed**).
3. **Required.** Off until "Toggle on Passcodes" on the device (S1, **Observed**). In Restaurants modes it can only be enabled from Dashboard (S5, **Observed**). "The team member doesn't have a passcode assigned" is listed as a sign-in failure (S4, **Observed**).
4. **Switching.**
   - The screen is not described. A unique code implies the keypad identifies as well as authenticates (**Inferred**).
   - Badges: staff "tap their badge … when presented with a passcode screen" (S6, **Observed**).
   - The open sale on hand-over: not documented. Open tickets park a sale and are reachable "from any logged-in device"; seeing others' tickets is a permission (S7, **Observed**).
5. **Lockout.** Not documented.
6. **Offline.** Not documented; the offline article never mentions passcodes (S8).
7. **Where checked.** Not documented.
8. **Time clock.** Yes: the passcode is used "to sign in and out and clock in and out" (S2, **Observed**).

### Shopify POS

Sources: [H1 manage PIN](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/manage-your-shopify-pos-pin), [H2 create or change PIN](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/create-or-change-pin), [H3 login](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/login), [H4 app settings](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/getting-started/app-settings), [H5 lock screen](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/customize-pos/lock-screen), [H7 recent carts](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/order-management/manage-recent-carts), [H8 POS permissions](https://help.shopify.com/en/manual/your-account/users/roles/permissions/pos-permissions), [H9 offline checkout](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/selling-offline/offline-checkout).

1. **Setting.**
   - "When you assign a staff member a POS role, they get a PIN"; "Tap Generate random PIN or enter a new PIN" (H2, **Observed**).
   - Owners and the POS administrator roles "can edit their own PIN and edit PINs for other POS staff members" (H1, H2, **Observed**). Whether ordinary staff can change their own is not documented.
   - "their unique 4 to 6-digit PIN"; "Every staff member with Shopify POS access has a unique PIN" (H1, H2, **Observed**). H4 and H5 say "a 4-digit PIN" to unlock, a first-party inconsistency.
   - Shown again: not documented. Reset is "generate a new PIN".
   - A new PIN "might need a few minutes to sync … to each device" (H2, **Observed**).
2. **When.**
   - The device is first signed in with an account email and password (H1, **Observed**).
   - "You can set your device to lock after a period of inactivity, or whenever a sale concludes"; the settings are "Tap a time option" and "Lock screen after sale" (H4, **Observed**). The time options are not documented.
   - **Correction to the identity note**, which recorded "no auto-lock … unverified": an inactivity lock is documented.
   - Named actions: "Approval required" permissions take a manager's PIN (H8, **Observed**).
3. **Required.** "Every staff member must use a PIN to access Shopify POS" (H3, **Observed**). No off switch is documented.
4. **Switching.**
   - Lock returns to "the login PIN pad for other staff members to access the app using their PIN" (H3, **Observed**). The unique PIN identifies (**Inferred**).
   - The cart on hand-over: not documented. Carts auto-save, are "labeled Opened by" a named staff member, and delete after 24 hours (H7, **Observed**).
5. **Lockout.** "After 5 incorrect PIN entries, Shopify POS blocks the next attempt for 30 seconds" (H1, **Observed**).
6. **Offline.**
   - PIN unlock and switching offline: not documented. H1's troubleshooting says "Confirm that the device is connected to the internet".
   - "You can't save a cart when the POS device is offline" (H7, **Observed**).
   - Logging out "might cause loss of offline orders" (H9, **Observed**).
   - Approving a nearby device's login needs the approving device online (H3, **Observed**).
7. **Where checked.** Not documented. Per-device sync of a new PIN suggests a copy is held on the device (**Inferred**).
8. **Time clock.** Not documented.

### Lightspeed X-Series

Sources: [X1 switching settings](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534180030619), [X2 user switching](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534037435547), [X3 login access and re-authentication](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533966466971), [X4 offline](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534272395163), [X5 time clock](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533718862235), [X6 switch anywhere](https://x-series-support.lightspeedhq.com/hc/en-us/articles/27850625698331), [X7 SSO](https://x-series-support.lightspeedhq.com/hc/en-us/articles/25533674435867), [API user](https://x-series-api.lightspeedhq.com/reference/getuserbyid).

1. **Setting.**
   - **No PIN or passcode feature.** A help-centre search for "PIN" and "passcode" finds only payment-terminal articles (**Observed** absence).
   - "Retail POS assigns each user in your store a unique user barcode, which can be changed by a Manager or Admin" (X1, **Observed**). It can be viewed and printed any time (X1, **Observed**).
   - Reset: "Generate new Quick Switch ID" (X2, **Observed**).
   - In the API it is `switch_id`; the user has no PIN field (API user, **Observed**).
2. **When.**
   - "Users must re-identify themselves after each sale by selecting their username or entering their username and password" (X1, X3, **Observed**). Whether this always applies or follows the switching setting is unclear (**Inferred**).
   - Idle: "Require logging in after inactivity", from "5 minutes" to "24 hours", entered as hours and minutes. Then the app shows "a re-identification page. Any user can log in from this page" (X3, **Observed**).
   - On iPad the timer ignores external-keyboard activity and "freezes" while the iPad sleeps (X3, **Observed**).
   - Named actions: retrieving a parked sale, an on-account, layby or return sale, and converting a quote (X2, **Observed**, also in the identity note).
3. **Required.**
   - One setting "covers the entire Retail POS account and cannot be applied to individual outlets or registers" (X2, **Observed**).
   - The four options, which the identity note listed, are restated in X1 (**Observed**). With barcode switching, "If a user has not logged in that day, they will have to enter their password once" (X1, **Observed**).
   - A role can be "Only has access to log in through user switching" (X3, **Observed**).
   - The two no-password options "will override SSO on the Sell screen" (X7, **Observed**).
4. **Switching.**
   - Pick a name ("Type in the user's name or find the user profile"), with logged-out users greyed out on iPad, or scan the barcode into product search (X2, **Observed**).
   - **The cart survives**: "If there is a pre-loaded cart on iOS and a different user signs in when re-authenticating, the cart will still exist" (X3, **Observed**).
   - Switching now works "anywhere in the app without getting logged out" (X6, **Observed**).
   - Parked sales are not per person; whoever retrieves one must identify (X2, **Observed**).
5. **Lockout.** Not documented.
6. **Offline.** Switching offline: not documented. "You also won't be able to use Retail POS in offline mode if you weren't logged into your store before the Internet connection was lost" (X4, **Observed**).
7. **Where checked.** Not documented.
8. **Time clock.** Separate: users clock in after login, and signing out "will not clock the user out" (X5, X2, **Observed**).

### Lightspeed R-Series

Sources: [R1 login credentials](https://retail-support.lightspeedhq.com/hc/en-us/articles/229129648), [R2 register settings](https://retail-support.lightspeedhq.com/hc/en-us/articles/228842387), [R3 switching employees](https://retail-support.lightspeedhq.com/hc/en-us/articles/228840287), [R4 roles and access](https://retail-support.lightspeedhq.com/hc/en-us/articles/229129608-Setting-up-employee-roles-and-access), [R5 release note](https://retail-support.lightspeedhq.com/hc/en-us/articles/23279200530075), [R6 settings from cloud](https://retail-support.lightspeedhq.com/hc/en-us/articles/1260800114289), [API Employee](https://developers.lightspeedhq.com/retail/endpoints/Employee/).

1. **Setting.**
   - An admin sets it under Employee Setup: "Click the Pin Active checkbox. In the Set New PIN field, enter the employee's PIN" (R1, **Observed**).
   - Staff can change their own via "Employee settings … Change PIN" (R1, **Observed**).
   - "Easy-to-guess PIN combinations (such as 1234, 1111, or 0101) cannot be set … Employees with access to sensitive permissions, such as managers, must set a PIN with a minimum of six digits" (R1, **Observed**). The **only vendor that ties PIN strength to role.** The floor for other staff, and uniqueness: not documented.
   - API `accessPin` appears only in the create and update tables, never in responses (**Inferred**: write-only).
   - Reset: an admin enters a new one (R1, **Observed**).
2. **When.** All from R2, **Observed**:
   - "Verify PIN Delay: Duration of idle time, in minutes, until the system requests an employee's access PIN";
   - "Require PIN Before Each Sale" and "Require PIN Before Each Workorder";
   - "Auto Logout Delay", a full sign-out (R4 calls it "Auto Sign Out Delay" and suggests a full business day).
   - Both delays are free-entry minutes; no range is documented. Lightspeed later "Reduced frequency of unnecessary PIN prompts" (R5, **Observed**).
3. **Required.** Per employee, by "Pin Active" (R1, **Observed**). PIN-only staff work only once "a Lightspeed Retail session was opened by an employee with external login access" (R1, **Observed**, in the identity note). What a person with no PIN does: not documented.
4. **Switching.** "Click Change Employee. Enter the employee's PIN … The previous employee will be logged out automatically"; on iPad, "Tap Lock … Enter the employee's PIN" (R3, **Observed**). No name picker: the PIN identifies (**Inferred**). The open sale and per-person parking: not documented.
5. **Lockout.** Not documented. The admin can manually lock an employee out, the `lockOut` field (R1, API, **Observed**).
6. **Offline.** No offline POS is documented; the POS "uses the internet to retrieve your settings from the cloud" (R6, **Observed**).
7. **Where checked.** Not documented.
8. **Time clock.** Yes: "This is the PIN they'll use to clock in and out and access your Retail account from the Lock screen" (R1, **Observed**).

### Clover

Sources: [C1 `Lockscreen.java`](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/Lockscreen.java), [C2 `IEmployeeService.aidl`](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/aidl/com/clover/sdk/v3/employees/IEmployeeService.aidl), [C3 `Intents.java`](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v1/Intents.java), [C4 `Employee.java`](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v3/employees/Employee.java), [C5 `MerchantProperties.java`](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v3/merchant/MerchantProperties.java), [C6 create employee](https://docs.clover.com/dev/reference/employeecreateemployee), [C7 Kiosk quick start](https://docs.clover.com/dev/docs/developer-quick-start-clover-kiosk-integration), [C8 Flex support](https://nl.clover.com/en/support/clover-flex/), [C9 test merchants](https://docs.clover.com/dev/docs/working-with-test-merchants).

1. **Setting.**
   - Set in Web Dashboard under Employees, "Access code", or in the device Employees app (C8, **Observed**).
   - "Access codes for Clover devices can consist of 4 to 6 digits. Each employee access code must be the same length" (C8, **Observed**). The merchant property `pinLength` holds it ([C5#L81](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v3/merchant/MerchantProperties.java#L81)). Lengthening it "adds '00' to the end of the original 4-digit access code" (C8, **Observed**).
   - The API has `pin`, "Employee PIN (hashed)", and `unhashedPin` (C6, **Observed**). The SDK caps `UNHASHEDPIN_MAX_LEN = 8` ([C4#L797](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v3/employees/Employee.java#L797)).
   - Help-centre snippets say a 6-digit code with no repeating or sequential digits, and "Effective April 2026, new merchants must use 6-digit passcodes" (**Unverified**).
   - Uniqueness, shown again, self-reset: not documented (community says the Dashboard shows the codes, **Unverified**).
2. **When.**
   - App start: "Upon startup, the Clover Kiosk displays an unlock screen that requires an employee password" (C7, **Observed**).
   - After a sale: merchant property `autoLogout` ([C5#L44](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v3/merchant/MerchantProperties.java#L44)); `EXTRA_OBEY_AUTO_LOGOUT`: "If true and merchant uses auto-logout, device logs out after payment" ([C3#L120](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v1/Intents.java#L120), **Observed**). The help-centre label "Log out after each order" is **Unverified**.
   - Idle: not documented. The only figure is Android sleep "after about 30 minutes" (C7, **Observed**).
   - Named actions: `ACTION_AUTHENTICATE_EMPLOYEE` opens a dialog to authenticate a specific employee, any manager, or anyone holding a permission ([C3#L393](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/v1/Intents.java#L393), **Observed**).
3. **Required.** Optional: "An ID for the default employee which is a employee that has no passcode. Not all merchants enable the default employee" ([C1#L72](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/Lockscreen.java#L72), **Observed**).
4. **Switching.** "On Clover devices lock and unlocking the screen is tied to logging out and logging in Clover employees" ([C1#L26](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/java/com/clover/sdk/Lockscreen.java#L26)); the active employee change "coincides with the lockscreen being shown or dismissed" ([C2#L102](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/aidl/com/clover/sdk/v3/employees/IEmployeeService.aidl#L102), **Observed**). The screen layout and the open order on hand-over: not documented.
5. **Lockout.** Not documented for the device.
6. **Offline.** Not documented. Creating and updating employees: "Device must have network connectivity to succeed" ([C2#L62](https://github.com/clover/clover-android-sdk/blob/e792835936a164cf730f4d8bb44fc242a246b429/clover-android-sdk/src/main/aidl/com/clover/sdk/v3/employees/IEmployeeService.aidl#L62), **Observed**); that sentence says nothing of unlocking.
7. **Where checked.** Not documented. The API stores the PIN "(hashed)" (C6).
8. **Time clock.** A merchant property `logInClockInPrompt` exists (C5, **Observed**); its name suggests a clock-in prompt at login (**Inferred**).

### Toast

Sources: [T1 find or edit access code](https://support.toasttab.com/en/article/Find-or-Edit-an-Employee-s-POS-Access-Code), [T2 log in](https://support.toasttab.com/en/article/Log-in-to-a-Toast-Product-or-Device), [T3 troubleshoot login](https://support.toasttab.com/en/article/Log-in-to-Toast-Troubleshoot-Your-Account), [T4 clock-in issues](https://support.toasttab.com/en/article/Get-Help-With-Employee-Clock-in-Issues-on-the-POS), [T5 access types](https://doc.toasttab.com/doc/platformguide/adminToastPosAccessTypes.html), [T6 API checklist](https://doc.toasttab.com/doc/cookbook/apiIntegrationChecklistEmployee.html), [T7 UI options](https://doc.toasttab.com/doc/platformguide/adminUiOptionsReference.html), [T8 screen timeout](https://support.toasttab.com/en/article/Adjust-POS-Screen-Timeout), [T9 permissions](https://doc.toasttab.com/doc/platformguide/adminPermissions.html), [T10 transfers](https://doc.toasttab.com/doc/platformguide/adminTransferringOrders.html), [T11 offline](https://doc.toasttab.com/doc/platformguide/platformOfflineMode.html), [T12 offline employees](https://doc.toasttab.com/doc/platformguide/adminOfflineEmployees.html).

1. **Setting.**
   - A manager sets it in Toast Web: "Enter a new number in the POS access code field" (T1, **Observed**).
   - "no two employees at the same location can share the same code" (T1, **Observed**).
   - **Four first-party lengths**: "three to eight digits" (T1), "6–8 digit" (T2), "4+ digit" (T5), "1 to 8 numeric characters" (T6). All **Observed**; they contradict each other.
   - Self-change contradicts too: "Employees cannot change their own POS access code" (T3) and "you cannot change your own" (T2), yet the platform guide lists "Change passcode" as self-service (T9) and T1 says an employee "may have changed their code through the MyToast app". All **Observed**.
   - **Shown again**: "The employee's current POS access code is displayed in the Account info section of their profile", to a viewer with Employee Info and a superset of the employee's permissions (T1, **Observed**).
2. **When.**
   - The device login is separate: "a device-level action … individual employees clock in and take orders by entering their POS access code" (T2, **Observed**).
   - "Auto switch user" signs the user out "each time employees send an order to the kitchen, hold an order, or complete a payment transaction" (T7, **Observed**).
   - Idle: a Screen Timeout "in minutes or seconds … cannot be less than five (5) seconds" signs the user out (T7, T8, **Observed**).
   - Named actions: a manager's code for permissions such as Split Checks and transfers (T9, T10, **Observed**).
3. **Required.** "If you do not include a passcode, the employee … cannot log into a Toast POS device" (T6, **Observed**).
4. **Switching.**
   - One passcode screen, and the code identifies: if the wrong name appears, "two employees may share the same POS access code" (T4, **Observed**).
   - "you can still select switch user at any point" (T8, **Observed**).
   - Checks stay with their server: an option to "Prompt user when editing another server's check" (T7), and transfers to "a different employee who is currently clocked in" (T10, **Observed**).
5. **Lockout.** Not documented for the passcode screen. Toast Web: "After five failed login attempts in one hour, your account is locked for one hour" (T3, **Observed**).
6. **Offline.** **Passcode use works offline**: "During offline mode, employees can clock in on Toast POS devices and perform many tasks, such as taking orders" (T12, **Observed**). "More than one front of house employee can work on a device, but … they use only that one device while offline" (T11, **Observed**). The identity note's "you will not be able to log back in" (T11) refers to the device login, not the passcode (**Inferred**, from T2's split between the two).
7. **Where checked.** Not documented. "The employee can use the new code after the POS device syncs" (T1), together with offline clock-in, implies a device-side check (**Inferred**).
8. **Time clock.** Yes: the code is "also called a POS passcode, clock-in number, or PIN" (T1, **Observed**).

### Loyverse

Sources: [L1 PIN access](https://help.loyverse.com/help/pin-code-access), [L2 employees](https://help.loyverse.com/help/employee-loyverses), [L3 access rights](https://help.loyverse.com/help/how-manage-access-rights-employees), [L4 switch employees](https://help.loyverse.com/help/switch-employees), [L5 employee login](https://help.loyverse.com/help/how-give-employees-access-login), [L6 time clock](https://help.loyverse.com/help/time-clock), [L7 offline](https://support.loyverse.com/en/articles/3178196-offline-use-of-loyverse-pos).

1. **Setting.** A "unique 4-digit PIN", "created while adding an employee … and can be changed at any time from the Back Office" (L1, **Observed**). **Viewable**: the POS PIN field lets you "View the employee's current PIN"; "Only the account owner or users with assigned access to Employee Management can view or change PIN codes" (L1, **Observed**). The owner creates theirs at first setup (L2, **Observed**).
2. **When.** "The PIN entry screen appears each time a user logs into the POS, switches users, or when the device wakes from sleep mode" (L1, **Observed**). A one-time access by a superior's PIN for a missing right (L3, **Observed**). An app idle timer: not documented; the lock follows the device's sleep (**Inferred**). After each sale: not documented.
3. **Required.** PIN-less login "is only allowed when: There is no employee added … and The Time Clock feature is disabled" (L1, **Observed**). An employee's email login is only "for the first login to connect the employee to the POS device" (L5, **Observed**).
4. **Switching.** "Tap the lock icon … The PIN pad will appear. The next employee can enter their personal PIN" (L4, **Observed**). The current sale on a switch: not documented. Open tickets of others need "Manage all open tickets" (L3, **Observed**), so tickets are in effect per person (**Inferred**).
5. **Lockout.** Not documented.
6. **Offline.** PIN entry and switching offline: not documented. The app sells offline and "will not allow you to sign out … while there are unsynced receipts" (L7, **Observed**).
7. **Where checked.** Not documented. A PIN the Back Office can display is stored recoverably, not only as a one-way hash (**Inferred**).
8. **Time clock.** Yes: "The Time Clock feature requires PIN authentication" (L6, **Observed**).

### Odoo POS 18.0 (source)

1. **Setting.**
   - `pin = fields.Char(string="PIN", groups="hr.group_hr_user", …)` on the employee form ([hr/models/hr_employee.py#L146](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/hr/models/hr_employee.py#L146), **Observed**). No password widget, so HR users read it back (**Inferred**).
   - Staff can set their own when the `hr.hr_employee_self_edit` parameter is on: `'pin'` is a self-writable field ([hr/models/res_users.py#L62](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/hr/models/res_users.py#L62), [#L163](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/hr/models/res_users.py#L163), **Observed**).
   - Digits only, no length ([hr_employee.py#L444](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/hr/models/hr_employee.py#L444)). **Not unique**: only the badge has a unique constraint ([#L186](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/hr/models/hr_employee.py#L186)). Both **Observed**.
2. **When.**
   - App start: `if (!this.hasLoggedIn) { this.showScreen("LoginScreen"); }` ([pos_hr/static/src/overrides/models/pos_store.js#L11](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/models/pos_store.js#L11), **Observed**).
   - Manual: a "Lock" button calls `showLoginScreen()`, which clears the cashier; it is hidden on small screens (`!ui.isSmall`) ([pos_hr/…/navbar/navbar.xml#L14](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/components/navbar/navbar.xml#L14), [point_of_sale/static/src/app/store/pos_store.js#L202](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/store/pos_store.js#L202), **Observed**).
   - **Idle does not lock.** After 5 minutes the till shows a screensaver ([pos_store.js#L185](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/store/pos_store.js#L185)). On activity it shows `firstScreen` ([point_of_sale/static/src/app/pos_app.js#L22](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/pos_app.js#L22)), which is `!this.cashier ? "LoginScreen" : "ProductScreen"` ([pos_store.js#L182](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/static/src/app/store/pos_store.js#L182)). The idle path never clears the cashier (**Observed** in code), so the last cashier resumes without a PIN (**Inferred**).
   - After each sale and before named actions: not in source; rights are role-based.
3. **Required.** `module_pos_hr` "Show employee login screen" ([point_of_sale/models/pos_config.py#L176](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/point_of_sale/models/pos_config.py#L176)). Who may log in: `basic_employee_ids`, "If left empty, all employees can log in" ([pos_hr/models/pos_config.py#L10](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/models/pos_config.py#L10)). **No PIN, no prompt**: the check runs only `if (!pin && employee && employee._pin)` ([pos_hr/static/src/app/select_cashier_mixin.js#L123](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/app/select_cashier_mixin.js#L123)). All **Observed**.
4. **Switching.**
   - The login screen offers a PIN box, a name list and a badge scan ([pos_hr/…/login_screen/login_screen.xml#L15](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/screens/login_screen/login_screen.xml#L15), **Observed**).
   - A typed PIN that matches one employee signs them in; if several share it, a "Change Cashier" list appears and the PIN is re-checked ([select_cashier_mixin.js#L90](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/app/select_cashier_mixin.js#L90), **Observed**).
   - Open order: one with no lines "can be considered to be un-owned" and passes to the new cashier; adding a line re-stamps `employee_id` to whoever is at the till ([pos_hr/…/pos_store.js#L67](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/models/pos_store.js#L67), [#L81](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/models/pos_store.js#L81), **Observed**). Orders are shared by the till, not parked per person (**Inferred**).
   - The cashier persists per browser tab in `sessionStorage` ([pos_store.js#L124](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/models/pos_store.js#L124), **Observed**).
5. **Lockout.** None. A wrong PIN shows "Wrong PIN" with no counter ([select_cashier_mixin.js#L50](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/app/select_cashier_mixin.js#L50), **Observed**).
6. **Offline.** Works, because the comparison is local (**Inferred**). Writing the cashier to the session is buffered offline and flushed on the `online` event ([pos_store.js#L15](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/models/pos_store.js#L15), [#L60](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/overrides/models/pos_store.js#L60), **Observed**).
7. **Where checked.** On the device, `employee._pin !== Sha1.hash(inputPin)` ([select_cashier_mixin.js#L43](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/static/src/app/select_cashier_mixin.js#L43)). The hashes, unsalted SHA-1 of the PIN and of the badge, go to any `point_of_sale.group_pos_user` ([pos_hr/models/hr_employee.py#L52](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/pos_hr/models/hr_employee.py#L52)). Both **Observed**; already in the identity note.
8. **Time clock.** The same field: "PIN used to Check In/Out in the Kiosk Mode of the Attendance application … and to change the cashier in the Point of Sale application" ([hr_employee.py#L147](https://github.com/odoo/odoo/blob/465ae31c1aea5a9a3f84e2f328d55d2cc9d435aa/addons/hr/models/hr_employee.py#L147), **Observed**). The POS does not clock anyone in.

### Erply

Sources: [E1 PIN login](https://wiki.erply.com/article/1825-logging-in-using-pin), [E2 sign in and out](https://wiki.erply.com/article/461-sign-in-and-out-of-the-pos), [E3 PIN management](https://wiki.erply.com/article/2413-pin-management), [E4 users and roles](https://wiki.erply.com/article/2648-flax-enterprise-configuration-users-and-roles), [E5 cashier security](https://wiki.erply.com/article/2649-flax-enterprise-configuration-cashier-security-and-access), [E6 inactivity sign-off](https://wiki.erply.com/article/1612-force-system-sign-off-after-period-of-inactivity), [E7 auto logout after sale](https://wiki.erply.com/article/1713), [E8 release 4.52.8](https://wiki.erply.com/article/2467-pos-brazil-version-4-52-8), [E9 switch cashiers](https://wiki.erply.com/article/463-switch-cashiers-at-the-pos), [E10 offline](https://wiki.erply.com/article/858-offline-mode), [E11 clock in](https://wiki.erply.com/article/2161-how-to-clock-in-out-at-the-pos), [E12 auth calls](https://wiki.erply.com/article/896-2-authentication-related-calls), [switchUser](https://learn-api.erply.com/requests/switchuser), [error codes](https://learn-api.erply.com/error-codes).

1. **Setting.** "A PIN must have a minimum length of six digits and can be set by a manager on the user card" (E1, **Observed**). The same field takes a swipe card (E2). Flax POS can generate one or take one manually, 6 digits (E3); a generated PIN is "shown at the top of the form. Record it before saving" (E4). Expiry: "Password & PIN code expiration (in days) … Set 0 to turn expiry off" (E5). All **Observed**. Uniqueness: not documented; the API looks a user up by PIN alone, which needs it (**Inferred**).
2. **When.**
   - Idle: "Force system sign-off after period of inactivity", in seconds (E6), or in Flax "Log out after inactivity in minutes … Set 0 to turn it off" (E5). **Observed**.
   - After a sale: "Auto logout after sale"; by default "the user remains logged in" (E7, **Observed**).
   - Since 4.52.8, "softlogout cases replaced with lock screen that fully maintains POS state" (E8, **Observed**).
3. **Required.** Optional per user (E1). "any user must first log in to the POS with their username and password before being able to log in with a PIN" (E1, E12). **Observed**.
4. **Switching.** "Switch User … Erply will prompt you to enter a unique employee PIN"; "The newly signed in employee will now be the main POS user" (E9, **Observed**). The API takes only the PIN as `cardCode` ([switchUser](https://learn-api.erply.com/requests/switchuser), **Observed**). The open sale is kept on a lock ("fully maintains POS state", E8); on a switch it is not documented.
5. **Lockout.** Error 1052: "User has been temporarily blocked because of repeated unsuccessful login attempts" ([error codes](https://learn-api.erply.com/error-codes), **Observed**). The count and duration: not documented. A session key more than two hours stale cannot switch (1056, **Observed**).
6. **Offline.** **Not supported**: offline mode "does not currently support: Switch users, Lock the POS" (E10, **Observed**). A later fix stops users getting "stuck on lock screen by locking POS or attempting to switch users in offline mode" (E8, **Observed**).
7. **Where checked.** On the server: `switchUser` returns "a NEW session key, with the user rights of the PIN holder" (**Observed**). With switching unavailable offline, there is no device check (**Inferred**).
8. **Time clock.** Yes: "Choose the employee … and enter the PIN" (E11, **Observed**). Release 4.49.7 fixed clock-in where "the pin of one employee could be used on another" ([release](https://wiki.erply.com/article/1661), **Observed**).

### WordPress POS plugins

- **FooSales 1.44.5.** Base: `https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/`.
  - **Setting.** An admin on the user profile, "Enter a custom 4-digit PIN used to unlock the POS and load your capabilities" ([admin/templates/foosales-user-pos-options.php#L45](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/templates/foosales-user-pos-options.php#L45)), or anyone with `…change_others_pin`. Exactly 4 digits, stored with `wp_hash_password` ([admin/helpers/foosales-api-helper.php#L4954](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/helpers/foosales-api-helper.php#L4954)). The app only learns `has_pos_pin` ([admin/class-foosales-user-roles.php#L783](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/class-foosales-user-roles.php#L783)). Uniqueness is not enforced; the user is picked first. **Observed**.
  - **When.** "Enable PIN lock" and "Auto-lock timeout (minutes)", "Leave blank to disable auto-lock" ([admin/templates/foosales-settings-users-settings.php#L166](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/templates/foosales-settings-users-settings.php#L166), [#L176](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/templates/foosales-settings-users-settings.php#L176), **Observed**). In the bundled app the auto-lock fires only for users holding the lock capability (**Observed** in the minified bundle). After each sale: not in source.
  - **Required.** PIN lock is forced on whenever user switching is on ([foosales-api-helper.php#L1464](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/helpers/foosales-api-helper.php#L1464)). A user with none gets "This user does not currently have a POS PIN set" ([admin/class-foosales-rest-api.php#L473](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/class-foosales-rest-api.php#L473)). The changelog: "Removed the capability of switching users without needing to enter their PIN" ([readme.txt#L428](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/readme.txt#L428)). **Observed**.
  - **Switching.** Pick a user, then the PIN. The server re-checks the PIN on **every request**, from an `X-POS-User-PIN` header, and acts as that user ([class-foosales-rest-api.php#L461](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/class-foosales-rest-api.php#L461), **Observed**). The app therefore holds the plaintext PIN in memory (**Observed** in the bundle); whether it persists further was not determined.
  - **Lockout.** Three wrong PINs for *another* user within 24 hours remove `…switch_user` from the device's connected account, until an administrator grants it back ([foosales-api-helper.php#L4832](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/helpers/foosales-api-helper.php#L4832)). "Verifying your own PIN gains nothing over your existing credentials, so it isn't counted" ([#L4885](https://plugins.trac.wordpress.org/browser/foosales/tags/1.44.5/admin/helpers/foosales-api-helper.php#L4885)). **Observed**.
  - **Offline.** Unlock posts to the store with no local fallback (**Inferred** from the bundle). **Where checked**: the server, `wp_check_password` (**Observed**). **Time clock**: not in source.
- **Jovvie 5.21.5.** Base: `https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/`.
  - **Setting.** "POS Operator Passcode" on the WordPress profile, editable by the user or an admin ([includes/Operator/UserProfile.php](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Operator/UserProfile.php)); `^\d{4,6}$`, stored by `wp_hash_password` ([includes/Operator/Pin.php#L12](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Operator/Pin.php#L12), [#L20](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Operator/Pin.php#L20)). Never shown: "Leave blank to keep current Passcode". **Observed**.
  - **When.** Per station: "Enable User Switch" (off by default), "Switch Type" passcode or WordPress login, "Auto-Lock Timeout" **Never, 30 seconds, 1 minute, 5 minutes**, and "Lock After Each Sale" ([includes/Admin/Stations/Tabs/Users/PinSwitch.php#L26](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Admin/Stations/Tabs/Users/PinSwitch.php#L26), [#L202](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Admin/Stations/Tabs/Users/PinSwitch.php#L202), **Observed**). A fresh WordPress login counts as the first sign-in, so "the cashier is not prompted for a passcode" on top of it ([includes/Frontend.php#L568](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Frontend.php#L568), **Observed**). A separate station-wide refund passcode, stored as plain station meta and compared with `hash_equals` ([includes/API/Refunds.php#L848](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/API/Refunds.php#L848), **Observed**).
  - **Required.** In passcode mode a user without one "cannot sign in to it" ([PinSwitch.php#L117](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Admin/Stations/Tabs/Users/PinSwitch.php#L117), **Observed**).
  - **Switching.** A list of operators, then the passcode; the server records an operator session per terminal, station and register that becomes "the acting identity of every later request" ([includes/API/Operators.php](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/API/Operators.php), **Observed**). The open sale: not in source; the POS client is a separate, closed or cloud-hosted bundle.
  - **Lockout.** "Rate limiting: 5 attempts per user+station per 60 seconds", then "Too many failed attempts" ([Operators.php#L194](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/API/Operators.php#L194), **Observed**).
  - **Offline.** While locked the server refuses every change: "The register is locked. Unlock it to continue" ([includes/Operator/ActingUser.php#L637](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/Operator/ActingUser.php#L637), **Observed**), so unlocking needs the store (**Inferred**). **Where checked**: the server, `Pin::verify_pin` ([Operators.php#L228](https://plugins.trac.wordpress.org/browser/point-of-sale-pos-woocommerce/tags/5.21.5/includes/API/Operators.php#L228), **Observed**). **Time clock**: not in source.
- **Oliver POS 4.9.4.** Base: `https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/`. The plugin (server side) is readable; the apps are closed.
  - **Setting.** Admin field `maxlength="6" pattern="[0-9]*"` ([includes/admin/class-staff-admin.php#L434](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/admin/class-staff-admin.php#L434)). Staff may set their own only if none exists ("cannot overwrite an existing PIN") and change it with the current one; "PIN must be 4–6 digits" ([includes/rest-api/class-staff-rest.php#L352](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/rest-api/class-staff-rest.php#L352), [#L401](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/rest-api/class-staff-rest.php#L401)). Stored by `wp_hash_password` ([includes/class-pos-roles.php#L778](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/class-pos-roles.php#L778)). **Unique**: "That PIN is already in use by another staff member" ([class-staff-admin.php#L1023](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/admin/class-staff-admin.php#L1023)). All **Observed**.
  - **When.** "Require PIN to Open Shift", default yes ([includes/admin/class-settings.php#L569](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/admin/class-settings.php#L569), **Observed**). Idle, lock and after-sale: not in source.
  - **Switching.** `POST /staff/verify-pin` loops over all staff and returns whoever matches, so the PIN alone identifies ([class-staff-rest.php#L300](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/rest-api/class-staff-rest.php#L300), **Observed**).
  - **Lockout.** "Rate-limit PIN verification by IP+user (5 fails / 15 min)", reset on success ([class-staff-rest.php#L289](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/rest-api/class-staff-rest.php#L289), **Observed**). The user in the key is the device's WordPress account, so all staff on one device share the bucket (**Inferred**).
  - **Offline.** The code says "Apps must round-trip PINs through `POST /oliver-pos/v1/staff/verify-pin` rather than caching the password hash locally"; the `pin_hash` field was deprecated in 4.5.2 and defaulted off in 4.5.4 ([class-staff-rest.php#L162](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/rest-api/class-staff-rest.php#L162), **Observed**). Its docblock says the field goes in 4.6.0, yet 4.9.4 still emits it behind the `oliver_pos_emit_pin_hash` option ([#L214](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/rest-api/class-staff-rest.php#L214), **Observed**). Marketing: "PIN verification is online-only and rate-limited" ([WordPress plugin page](https://oliverpos.com/wordpress-plugin/), **Unverified** as app behaviour). **Where checked**: the server, `wp_check_password` ([class-pos-roles.php#L806](https://plugins.trac.wordpress.org/browser/oliver-pos/tags/4.9.4/includes/class-pos-roles.php#L806), **Observed**).
- **YITH POS** (premium; docs only). The cashier enters "the correct login info", then picks a store and register ([POS screen](https://docs.yithemes.com/yith-point-of-sale-for-woocommerce/pos-screen/pos-screen/)). "Only one Cashier at a time can be logged into the same Register", with a take-over; logout "will not close the Register". **Observed**. PIN, idle lock and lockout: not documented.
- **wePOS 2.0.3** (free). No PIN, lock or switch strings in the PHP or built JS; the cashier is the logged-in WordPress user with a "Logout" link (**Observed**, source at [tags/2.0.3](https://plugins.trac.wordpress.org/browser/wepos/tags/2.0.3/)). wePOS Pro: not documented in anything readable.

---

## 3. Conventions every system shares (adopt)

1. **Device sign-in and person sign-in are separate.** A privileged account signs the device in once; staff then use a short code on top. Shopify (email and password, then PIN), Toast ("a device-level action"), R-Series (External login opens the session), Erply (password first), Loyverse (email only "for the first login"), Odoo (the POS session's user, then an employee), FooSales and Jovvie (a WordPress login, then a PIN). **Observed** in each §2 entry.
2. **The code is numeric, 4 to 6 digits, and set by someone above the cashier.** Square 4, Shopify 4–6, Loyverse 4, Clover 4–6, FooSales 4, Jovvie and Oliver 4–6; Erply and R-Series managers set a 6-digit floor. Every system lets an owner or manager set it; about half also let staff change their own (Shopify admins, R-Series, Odoo with self-edit, Jovvie, Oliver). **Observed**.
3. **One code per person, unique, and typing it is the identification.** Square, Shopify, Toast, Loyverse, Erply, Oliver, R-Series: a single keypad with no name step. The exceptions pick a name first: FooSales, Jovvie, Lightspeed X; Odoo offers both. **Observed** (the "keypad identifies" reading is Inferred for Square and R-Series).
4. **"Lock after each sale" is a standard switch.** Square, Shopify, Clover, Toast, Erply, Jovvie, R-Series (before each sale), and X-Series (re-identify after each sale). **Observed**.
5. **An idle lock exists, and its time is the merchant's choice.** Square, Shopify, X-Series (5 min to 24 h), R-Series (minutes), Toast (≥ 5 s), Erply, FooSales (minutes), Jovvie (Never/30 s/1 min/5 min). **Observed**. Only Odoo has a screensaver that is not a lock.
6. **A no-PIN path exists but is narrow.** Clover's default employee, Loyverse with no employees and no time clock, Odoo per employee, Square with passcodes off. Shopify and Toast have none. **Observed**.
7. **The PIN doubles as the time clock** where a clock exists: Square, Toast, Loyverse, R-Series, Erply, Odoo (Attendance kiosk). X-Series keeps them separate. **Observed**.
8. **The open sale belongs to the till, not the cashier.** Where documented, a switch does not discard the cart: X-Series ("the cart will still exist"), Erply ("fully maintains POS state"), Odoo (re-stamps the order). Per-person ownership, where it exists, is the parked ticket, not the live cart: Toast checks, Loyverse and Square open tickets, Shopify "Opened by". **Observed**.

## 4. Notable divergences (choose with a reason)

- **Where the PIN is checked, and therefore offline.** This is the decision that matters for an offline till.
  - **Device**: Odoo (hashes shipped, works offline). Toast documents offline clock-in and order-taking, and Shopify's per-device sync implies the same (both Inferred device-side).
  - **Server**: Erply ("does not currently support: Switch users, Lock the POS" offline), FooSales (every request), Jovvie (lock state on the server), Oliver (moved *off* the device: hash deprecated in 4.5.2 so that "stolen devices can't be brute-forced offline").
  - Square, Clover, Loyverse, Lightspeed: not documented.
  - **Choose:** no vendor documents a design that is both offline and safe against a stolen device. Oliver's move is the one explicit reasoning on record. (**Inferred**.)
- **Wrong-attempt limits.** Shopify: 5, then 30 s. Jovvie: 5 per user and station per minute. Oliver: 5 per 15 min per device account. FooSales: 3 in 24 h removes switching until an admin restores it. Erply: a server block, count not documented. Odoo: none. The rest: not documented. **Choose:** a short time-boxed back-off (Shopify, Jovvie) keeps a busy till usable; an admin-only unlock (FooSales) strands the shop until someone with wp-admin is found. (**Observed** facts, **Inferred** choice.)
- **Can the PIN be shown again?** Toast and Loyverse show it to a manager; Square shows it to the owner of it in the Team app; FooSales, Jovvie and Oliver never do (WordPress password hashes); R-Series is write-only in its API. A PIN an admin can read back is stored recoverably. **Choose:** never shown; reset instead. (**Inferred**.)
- **Who switches up.** X-Series always asks for a password when switching to a more privileged user, even when barcode switching skips it otherwise. R-Series demands 6 digits for sensitive roles. Nobody else scales the credential to the role. **Observed**.
- **Idle option sets.** Free entry (X-Series, R-Series, Toast, Erply, FooSales) versus a short fixed list (Jovvie Never/30 s/1 min/5 min; Square's list Unverified). X-Series sets a floor of 5 minutes and a ceiling of 24 hours; Toast a floor of 5 seconds. **Observed**.
- **Granularity of the switch.** Account-wide (X-Series: "cannot be applied to individual outlets or registers"), per device (Square), per station (Jovvie), per till config (Odoo), per register (R-Series settings). **Observed**.

## 5. Mistakes to avoid

- **Do not ship PIN hashes to the till.** Odoo sends unsalted SHA-1 of a digits-only PIN to every POS user (identity note). Oliver shipped a hash too, deprecated it for that reason, and 4.9.4 still emits it behind an option whose docblock says it was removed. A 4–6 digit keyspace makes any hash on the device a plaintext.
- **Do not make the idle screen look like a lock when it is not.** Odoo's 5-minute screensaver hands the till back to the last cashier on a tap.
- **Do not leave PIN entry unthrottled.** Odoo has no counter at all.
- **Do not let the throttle strand the shop.** FooSales' lockout needs an administrator to restore switching; on a Saturday that is a closed till.
- **Do not let PINs collide silently.** Odoo has no uniqueness rule and resolves a collision by showing a list; Toast's own troubleshooting starts with "two employees may share the same POS access code".
- **Do not document four lengths.** Toast's help gives 3–8, 6–8, 4+ and 1–8 digits, and contradicts itself on whether staff can change their own code.
- **Do not store a PIN where an admin can read it.** Loyverse and Toast display current PINs; Odoo keeps them in a plaintext field.
- **Do not keep the plaintext PIN on the device to re-send.** FooSales sends the PIN in a header on every request, so the app holds it in memory for the session.
- **Do not require a privileged person on site to start the day.** R-Series' PIN-only staff cannot reopen a session (identity note); Erply and X-Series need a full password once a day.

## 6. Relation to WCPOS

Each WCPOS cashier is a WordPress user with their own token, a device may hold several saved cashiers, and the till works offline. That puts WCPOS in the gap no vendor fills on the record: a PIN that works offline (Odoo, Toast) without a crackable hash on the device (Oliver's reason for going online-only). WCPOS has an option the vendors' shared-device designs lack. Each saved cashier's own token is already on the device, so the PIN does not need to prove identity to the store. It needs to unlock a per-cashier secret held locally, for example a token wrapped by a key derived from the PIN with a slow KDF, with a local attempt counter that wipes or re-requires a password after a few failures. The store-side check then stays the token, as now (**Inferred**). The conventions to adopt are the ones in §3: device sign-in separate from person sign-in, a unique 4–6 digit code that identifies on its own, "lock after each sale" and a merchant-chosen idle lock (a short fixed list, as Jovvie and reportedly Square offer), a time-boxed back-off rather than an admin unlock, a cart that stays with the till across a switch, and never showing a PIN again.

## 7. Could not determine

- **Square**: the idle timeout options (community only); the switch screen layout; the open sale on hand-over; wrong-attempt limits; offline passcode use; where the check happens.
- **Shopify**: the inactivity time options; whether ordinary staff can change their own PIN; offline PIN unlock; where the check happens; a time clock.
- **Lightspeed X-Series**: whether "re-identify after each sale" is always on or follows a setting; wrong-attempt limits; offline switching; where the check happens.
- **Lightspeed R-Series**: the PIN floor for non-sensitive roles; uniqueness; the open sale on switch; wrong-attempt limits; where the check happens.
- **Clover**: almost all merchant-facing detail (help centre unreadable): idle options, uniqueness, the switch screen, lockout, offline unlock, where the check happens.
- **Toast**: which of its four PIN lengths is current; whether staff can change their own code; passcode-screen lockout; where the check happens.
- **Loyverse**: any app idle timer; lockout; offline PIN entry; where the check happens.
- **Erply**: the idle sign-off option list (screenshot only); the lockout count and duration; the open sale on switch.
- **FooSales**: whether the app keeps the PIN beyond memory; the open sale on switch.
- **Jovvie, Oliver**: everything in their closed POS clients: open sale on switch, Oliver's idle and lock behaviour, and whether Oliver's app has any offline PIN fallback.
- **YITH POS, wePOS Pro**: any PIN feature at all.
- **Odoo**: I did not run a live till; the "idle resumes without a PIN" reading is from code.
