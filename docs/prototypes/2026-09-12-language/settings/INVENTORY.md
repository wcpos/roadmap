<!-- Read-only inventory of the screen on monorepo `next` at f45a7b48a0, 2026-09-18, for roadmap#288: the feature floor the drawing must rehost. Source-only; nothing was run. -->
# Screen inventory: SETTINGS

Read-only inventory of the existing Settings area. Checkout: `/Users/kilbot/Projects/monorepo-v2/.claude/worktrees/inventory-288` (`next`, detached). All paths below are relative to that root. English strings quoted from `packages/core/src/contexts/translations/locales/en/core.json` (a flat JSON of dotted keys).

## 1. Structure

**Shell.** `apps/main/app/(app)/(drawer)/settings/_layout.tsx:9` is a `Stack` with `headerShown: false` holding two routes: the `(pages)` group and one modal route `(modals)/mini-app/[id]` presented as `containedTransparentModal` with `animation: 'fade'` and a transparent background (`:20-27`). `unstable_settings = { initialRouteName: '(pages)' }` (`:7`).

**Area navigation.** `(pages)/_layout.tsx:15` wraps a `<Slot/>` in `NavigationAreaLayout` with `areaLabel={t('common.settings')}`, `testID="settings-navigation"`, `screenTestID="settings-screen"`, `indexHref="/settings"`. The six items come from `apps/main/components/area-navigation/settings.ts:7-38` in order: General, Tax, Printing, Customer Display, Barcode Scanning, Theme (testIDs `settings-nav-<slug>`).

Layout is width-branched in `packages/core/src/screens/main/components/navigation-area/index.tsx:82-123`: `screenSize === 'sm'` renders a 48px back bar (chevron-left + area label + current page label, `testID="settings-navigation-back"`) above the page; every wider size renders a persistent `w-56` left rail (`:113-118`). The area index (`(pages)/index.tsx:11`) `Redirect`s to `/settings/general` on non-`sm` (`navigation-area/index.tsx:137-139`) and renders the tappable list on `sm` (`:141-147`).

**Page frame.** Every leaf page renders `SettingsPage` (`packages/core/src/screens/main/settings/index.tsx:18-44`): a `ScrollView` on `bg-card`, inner column `mx-auto w-full max-w-3xl gap-5 px-4 py-6 md:px-10 md:py-8`, an `h1` `text-xl font-semibold` title, optional muted description, then `ErrorBoundary` > `Suspense` around the body. Page testIDs: `screen-settings-general`, `-tax`, `-printing`, `-barcode-scanning`, `-customer-display`, `-theme`.

**Row/section primitives.** `components/settings-section.tsx:20-37` — optional uppercase `text-2xs tracking-widest` title, optional description, `border-t` divider unless `first`. `components/settings-row.tsx:27-58` — label left / control right on `md+`, stacked full-width below; `inline` keeps one line at every width. It detects `useFormContext() !== null` and swaps `FormItem`/`FormLabel` for `View`/plain `Label`, because the customer-display page has no form provider (`:28-33`). `components/settings-danger-zone.tsx:19-39` — `border-t` footer, muted explanation + `variant="outline-destructive"` button.

**Secondary flows and their overlays.**
- Printer add/edit: right-side `Dialog` (`printer/dialog/printer-dialog-layout.tsx:48` `side="right" size="2xl"`; setup wizard `printer/setup/printer-setup-dialog.tsx:567` `side="right" size="xl"`). `printer/add-printer.tsx:45-48` routes: no `printer` prop → `PrinterSetupDialog` wizard; an existing printer → `EditPrinterDialog`.
- Forget a paired display: `AlertDialog` (`customer-display/paired-displays.tsx:114-131`).
- Tax rates: full-page push to `/(app)/(modals)/tax-rates` (`tax.tsx:217`).
- Advanced disclosures: `Collapsible` (printer advanced `printer/dialog/advanced-settings.tsx:43`; scanner advanced and UUID `barcode-scanning/input-sources.tsx:296,388`; support details `printer/dialog/test-print-error.tsx:83`).
- Printer row overflow: `DropdownMenu` aligned `end` (`printing/printer-row.tsx:127-131`).
- Toasts for test print, scanner registration, clipboard copies.

## 2. Every control and field

### General (`settings/general.tsx`)
| Control | Kind | Label | Default | Constraint | Does |
|---|---|---|---|---|---|
| Store Name | text input | `settings.store_name` "Store Name" | from store doc | `z.string().optional()` `:50` | local patch on change |
| Store Base Country | combobox | "Store Base Country" | store doc | **`disabled`** `:215` | read-only; feeds state field |
| Store Base State | input (`StateFormInput`) | "Store Base State" | store doc | **`disabled`** `:228` | read-only |
| Store Base City | input | "Store Base City" | store doc | **`disabled`** `:237` | read-only |
| Store Base Postcode | input | "Store Base Postcode" | store doc | **`disabled`** `:246` | read-only |
| Language | select | "Language" | store `locale` | — | UI locale |
| Default Customer | combobox `withGuest` | "Default Customer" + hint "Pre-selected on every new cart." | `0` `:56` | `disabled` while the cashier switch is on `:283` | pre-selects cart customer |
| Default Customer is cashier | switch | "Default Customer is cashier" | `false` `:57` | — | disables the row above |
| Currency | combobox | `common.currency` "Currency" | `'USD'` `:58` | — | |
| Currency Position | select | "Currency Position" | `'left'` `:59` | — | |
| Decimal Separator | text input | "Decimal Separator" | `'.'` `:61` | — | |
| Number of Decimals | numeric input | "Number of Decimals" | `2` `:62` | `z.number()` | |
| Thousand Separator | text input | "Thousand Separator" | `','` `:60` | — | |
| Thousands Group Style | select | "Thousands Group Style" | `'thousand'` `:63` | enum thousand/lakh/wan | |
| Restore server settings | danger button | "Restore server settings" | — | — | GETs `stores/{id}`, patches only `SERVER_OWNED_STORE_FIELDS` `:171-180` |

There is **no Save button**: `useFormChangeHandler` persists every change immediately (`general.tsx:143`, same pattern in tax/barcode).

### Tax (`settings/tax.tsx`)
Read-only mirrored rows (`inline`, value rendered as plain `Text`): Enable taxes `:126`, Prices entered with tax `:133`, Shipping tax class `:154`, Round tax at subtotal level `:161` — all Yes/No via `yesNo()` `:70` except shipping class, which resolves a slug to its display name and falls back to the slug (`:64-69`). Editable: Calculate tax based on (select, default `'base'` `:36`), Display tax totals (radio, default `'itemized'`), Display prices in the shop (radio incl/excl, default `'excl'`), Display prices during cart and checkout (radio), Price display suffix (text). Plus a `DocsLink` to the store's `wp-admin/admin.php?page=wc-settings&tab=tax` (`:73`, hidden when `site.url` is absent `:168`) and a "View all tax rates" button.

### Printing (`settings/printing/index.tsx`)
Printers section: per-row **Test Print** button (per-row spinner via `testingPrinterIds` `:46`), **Edit** (hidden when `profile.isBuiltIn` `printer-row.tsx:115`), overflow menu with "Copy setup report" (always), "Set Default" (only when `!isDefault && !isBuiltIn` `:83`), "Delete" (destructive, only when `!isBuiltIn` `:85`). **Add Printer** button; `DocsLink` "Having trouble?". Templates section: one `Select` per active template, options = `Auto` label (`"Auto — <matched printer>"` or `"Auto — Print Dialog"` `index.tsx:96-98`), an `Unavailable printer` entry only when a stored override points at a missing printer (`:266`), then every printer.

Edit dialog (`printer/add-printer.tsx` + `dialog/*`): Printer Name (placeholder "e.g. Receipt Printer"), Connection type segmented, then one of Network fields (IP Address + Port + Scan Network), Bluetooth picker, USB picker; Advanced ("Printer Settings", `defaultOpen` when editing `:167`): Vendor (Epson / Star Micronics / Generic — Generic only when `genericVendorAllowed` `:104`; switching to an SDK lane silently rewrites `generic`→`epson` `:117-121`), Printer Language, Printer text width, Receipt language (code page — **only when `language === 'esc-pos'`** `advanced-settings.tsx:103`), full-receipt-raster switch, cash-drawer connector select. Toggles: Auto-cut paper, Auto-open cash drawer, Set as default (`printer-toggle-group.tsx:15-47`). Footer: "Save without testing" (only after a failed test `printer-dialog-footer.tsx:40`), "Open drawer" (only when `canOpenDrawer`), "Test Print", "Save".

Setup wizard (`printer/setup/printer-setup-dialog.tsx`): Stop, result cards `printer-setup-result-<address>`, Paper width toggle, "Print a test page on {name}", "Find a USB printer" (web + WebUSB only `:278`), "Find a Bluetooth printer" (not native `:281`), "Not this one? Scan again", "Enter an IP address", "More options" (Name, Vendor, width, code page `:492-556`), address+port form, the three answers, four width buttons, "Try again", "Save without testing", "Start over", "Copy setup report", "Open the printer guide", "Open Bluetooth settings" (Android only `:618,685`), "Done".

### Barcode Scanning (`settings/barcode-scanning/`)
`settings.tsx`: threshold ms (default `24` `:38`), minimum length (default `8`), prefix, suffix (both default `''`), "Play a sound on scan" switch (default `false`). **Conditional block `testID="scan-sound-options"` shows only when that switch is on** (`:205`): sound-theme radio (Classic/Checkout/Soft with per-theme ▶ and ▶✕ preview buttons `:224-241`), Volume slider (step `0.05`, bounded by `MIN/MAX_SCAN_SOUND_VOLUME` `:258-260`) with its own ▶, Success sound switch, Failure sound switch, and **Failure vibration switch only when `Platform.OS !== 'web'`** (`:293`).

`input-sources.tsx`: the whole section is hidden when neither registration nor a direct transport is available (`:172-174`). Controls: per-scanner "Remove"; an advanced `Collapsible` whose trigger text is one of four strings depending on lane and whether any profile exists (`:299-305`); inside it "Connect over USB" / "Disconnect USB scanner", "Connect over Bluetooth serial" / "Disconnect…", "Connect Bluetooth scanner" / "Disconnect…" (each rendered only when that transport reports `available` `:318,332,346`), "Register scanner", and a nested "My scanner isn't in the list" disclosure with a monospace UUID input, "Add", and a docs link (serial lane only `:387`). Mid-flow: name input + "Save scanner" + "Cancel", or a capture prompt + "Cancel" (`:442-473`).

`test-panel.tsx`: Keypress Event input (read-only on web, `autoFocus` + editable on native, placeholder "Tap here, then scan" `:151-161`), Detected Barcode (always read-only), an "Apply" button per suggestion, and a troubleshooting docs link.

### Customer Display (`settings/customer-display/`)
"Generate pairing code" button (`disabled` when the service is null `:82`), "Copy URL" and "Open in browser" **web only** (`pairing-code.tsx:98`), a selectable monospace URL, per-display "Forget" → AlertDialog with "Cancel" / "Forget".

### Theme (`settings/theme.tsx`)
Six equal tiles in two rows of three — System, Light, Dark, Ocean, Sunset, Monochrome (`:148-188`) — each `accessibilityState={{ selected }}`, `min-h-40`, label capped at `numberOfLines={2}`.

## 3. Every state

1. **Loading (page body)** — `Suspense` fallback inside `SettingsPage` (`index.tsx:39`). General adds a second boundary above the form (`general.tsx:78-86`) specifically because the customers query's first emission is async and a shared boundary retried forever (#1707, comment at `:69-77`).
2. **Render error** — `ErrorBoundary` at `index.tsx:38`.
3. **Form validation error** — `FormErrors` banner: "Please fix the following errors" + `• <path>: <message>` (`components/form-errors.tsx:33-37`).
4. **Saving (general danger zone)** — button `loading` while the restore request runs (`general.tsx:376`). Failure is logged only (`uiLogger[logLevel]('Failed to restore server settings'…)` `:183`) — **no user-visible error**.
5. **Disabled, server-owned** — the four address rows in General are permanently `disabled`; nothing on screen says why.
6. **Locked/mirrored (tax)** — four value-only rows plus "Set in WooCommerce, mirrored here." and "Open WooCommerce tax settings".
7. **Printers loading** — `isLoading` (local docs undefined OR cloud fetch unsettled, capped at 2 s `use-available-printer-profiles.ts:21,72`) renders **nothing** in the section.
8. **Printers empty** — only when no non-Print-Dialog target exists (`index.tsx:204`): dashed card, "No printers configured", "Add a printer to send receipts straight to your hardware. You can always use the Print Dialog without one.", Add Printer + "Open the printer guide".
9. **Templates empty** — "No active templates found."
10. **Printer routed at an unavailable printer** — the select shows "Unavailable printer".
11. **Test print in flight / done / dispatched** — per-row spinner; success toast is "Printed on %s" only when the lane acknowledges (cloud, or Epson/Star network on ports 443/8043/80/8008 `printing/utils.ts:48-56`), otherwise "Sent to %s".
12. **Test print failed** — toast keyed by `describePrinterError` (`describe-printer-error.ts:14-23`), 9 distinct strings: `setup_err_bridge`, `err_windows_usb`, `err_permission`, `err_unsupported`, `err_reconnect`, `err_paper`, `err_timeout`, `err_refused`, `err_generic`.
13. **Discovery error** — 6 strings via `formatDiscoveryError` (`dialog/discovery-error-message.ts:7-21`): bt-none-found, bt-connect-failed, usb-none-found, network-none-found, ipc-unavailable, and `"Printer discovery error: %s"`. In the wizard, `network-none-found` is suppressed on the results screen (`printer-setup-dialog.tsx:707`).
14. **Wizard phases** — a named 10-value union `scanning | checking | results | printing | asking | width | trouble | saving | saved | error` (`setup/use-printer-setup-flow.ts:103-113`), each with its own heading: "Looking for printers…", "Checking {address}…", "Found your printer" / "Which printer is yours?" / "That is an office printer, not a receipt printer" / "No printer found", "Found {name}. Printing a test page…" + "Look at the printer.", "Did the test page print?", "Which paper is in the printer?", "Nothing printed", "Saving…", "{name} is set up".
15. **Wizard per-card classification** — `ready` / `unsure` / `notprinter` / `unknown` (`use-printer-setup-flow.ts:46-61`) shown as pills "Ready" / "Test needed" / "Office printer" / "No connection".
16. **Wizard trouble reasons** — 8 named causes (`troubleReasonFor` `:87-101`) each with one line: secure, held, permission, pairing, unpaired, unresponsive, paper (routed to `err_paper` `:64`), lane (falls back to bluetooth/device/network wording `:669-673`).
17. **Paper width unknown / pending** — "Checking paper width…" (`printer-setup-dialog.tsx:384`), capped at `WIDTH_QUERY_TIMEOUT_MS = 4000` (`use-printer-setup-flow.ts:32`).
18. **Scanner section absent** — returns `null` when no input source exists on this platform.
19. **Scanner first-run / no profiles** — section description "Almost all barcode scanners pair as a Bluetooth or USB keyboard…" plus "No setup needed for most scanners."
20. **Scanner mid-flow** — capturing or candidate present replaces the whole list (`:271`).
21. **Scanner status per row** — 5 named states (`scannerStatus` `input-sources.tsx:43-64`): Connected, Registered (keyboard lane can never claim a live link), Not in range, Not plugged in, Not connected.
22. **Scanner UUID invalid** — inline `text-destructive` "Enter a full 128-bit UUID in 8-4-4-4-12 format."; duplicate UUID is an info toast instead.
23. **Electron chooser empty** — "Searching for devices…" + the keyboard-mode explainer + guide link (`scanner-device-chooser.electron.tsx:127-142`).
24. **Barcode test verdicts** — 4 mutually exclusive: detected-as-scan (success), near miss (warning), single key (`!isFinite(avgGapMs)`, added so "Infinityms" never renders `test-panel.tsx:223-228`), typing. Plus shift-mangled (destructive) and trailing-Enter notes, and a 3-value history chip: scan / too short / typing.
25. **Customer display Pro-locked** — `!advertised` renders either "Customer displays are a Pro feature." or, when the site reports a Pro version too old for the display contract, "Customer displays need a newer version of WCPOS Pro. Update the Pro plugin in WordPress." (`customer-display/index.tsx:98-113`).
26. **Customer display service unavailable** — pair button disabled + "The customer display service is not running on this device. Reload the app and check Logs for the reason."
27. **Customer display empty** — "No displays are paired with this device."
28. **Pairing failed** — error toast "Could not generate a pairing code" + the raw message.
29. **Per-display connected/disconnected + last seen** — dot + "Connected"/"Disconnected"; "Last seen {time}", or "never" when `last_seen === 0`.
30. **Theme following system** — "Following system theme" vs "Current theme: {theme}".
31. **Long text** — theme tiles clamp to 2 lines and reserve `min-h-40` for the tallest possible card (comment `theme.tsx:45-47`); printer name and connection line are `numberOfLines={1}`.

No offline-specific state and no permission-denied state exist anywhere on this screen: every write is a local RxDB patch. The only network reads are the restore-server-settings GET, the cloud-printer GET, and the pairing-code mint.

## 4. Every user-facing string

Grouped by region, key = English. Because of volume, the strings are given as the key list plus the quotations already inlined in §2-§3; the full set actually used by these folders is 309 `t()` keys, all resolving in `packages/core/src/contexts/translations/locales/en/core.json` except dynamically composed ones.

- **Nav / frame**: `common.settings` "Settings"; `settings.general` "General"; `settings.tax` "Tax"; `settings.printing` "Printing"; `settings.customer_display.title` "Customer Display"; `settings.barcode_scanning` "Barcode Scanning"; `settings.theme` "Theme".
- **General**: section titles `settings.store` "Store", `settings.localization` "Localization", `settings.currency_and_numbers` "Currency & numbers"; `settings.restore_server_settings_description` "These settings were copied from your WooCommerce store. Restoring will overwrite local changes with the server's values."
- **Tax**: `settings.tax_calculation` "Calculation", `settings.tax_display` "Display", `settings.tax_locked_note` "Set in WooCommerce, mirrored here.", `settings.tax_locked_link` "Open WooCommerce tax settings", `common.tax_class_based_on_cart_items` "Based on cart items", `tax_rates.tax_rates` "Tax Rates".
- **Printing**: `settings.printers` "Printers" / `settings.printers_description` "Devices receipts can be sent to."; `receipt.receipt_templates` "Receipt Templates" / `settings.templates_description` "Choose which printer each template prints to."; `settings.connection_print_dialog` "Print Dialog" · `settings.connection_built_in` "built-in"; `settings.managed_by_wcpos` "managed by WCPOS"; `settings.setup_source_system` "Installed printer"; `settings.template_type_thermal` "Thermal"; `settings.having_trouble` "Having trouble?".
- **Printer dialog**: "Add Printer"/"Edit Printer", "Printer Settings", "Save without testing", "Open drawer", "Test Print", `settings.cash_drawer_emulation_warning`, `settings.full_receipt_raster_help` "Prints the whole receipt as an image for Unicode/RTL compatibility. Slower and larger than text mode.", `settings.raw_tcp_not_supported_on_web`, `settings.web_printer_limitation`, `settings.support_details` / `settings.copy_support_details`.
- **Wizard**: the ~70 `settings.setup_*` keys, incl. "Yes, and it looks right", "Printed, but the ruler is off", "Nothing came out", "We print the test page again on your pick.", "Name, width and cash drawer are under the printer's row in Settings."
- **Barcode**: the `settings.barcode_*` and `settings.scanner_*` families; notable long-form copy is `settings.scanner_keyboard_wall_note` "Scanners in keyboard mode can't be connected to directly — that's an operating-system restriction, not a POS one. They still scan into the POS normally." and `settings.scanner_chooser_empty_hint`.
- **Customer display**: the `settings.customer_display.*` family quoted in §3.
- **Docs links**: `https://docs.wcpos.com/customer-display` (`customer-display/index.tsx:20`), `https://docs.wcpos.com/hardware/scanner-setup-wizard` (`input-sources.tsx:26`, `test-panel.tsx:28`, `scanner-device-chooser.electron.tsx:11`), `PRINTER_DOCS_URL` (`printer/printer-docs.ts`).

## 5. Learned behaviour

**There is no `LEDGER.md` anywhere under `packages/core/src/screens/main/settings/**` or under the settings routes** — every ledger in the repo lives in `packages/components/src/*/` and in sibling screen folders. The one ledger that governs this screen's shell is `packages/core/src/screens/main/components/navigation-area/LEDGER.md`:

- `components/navigation-area/LEDGER.md #1`: wide layouts get a persistent page rail and the area root redirects to its default page; narrow gets a tappable index — region: the Settings shell (rail vs index).
- `components/navigation-area/LEDGER.md #2`: a narrow leaf page (or deep link) always carries a back bar, because it is the only in-app route to siblings — region: the `sm` back bar.
- `components/navigation-area/LEDGER.md #3`: the active page carries both visual and accessibility selection state — region: the rail / index items. Cites `69a36ee74c feat(settings): redesign settings pages with quiet row-based layout`.

Behaviour visible in code with **no ledger line** (each is a decision a redraw would silently lose):
- Settings never has a Save button; `useFormChangeHandler` writes on every change (`general.tsx:143`, `tax.tsx:112`, `barcode-scanning/settings.tsx:100`). **no ledger line**
- Rows have no dividers; only sections do (`settings-section.tsx:16-19`, `settings-row.tsx:22-26`). **no ledger line**
- `SettingsRow` deliberately degrades to a plain label outside a form provider so the customer-display page matches (`settings-row.tsx:28-33`). **no ledger line**
- Scanner list rows use `ghost-quiet` Remove, not destructive red: "a destructive-red button on every row is alarm for a list, not emphasis" (`input-sources.tsx:121-123`). **no ledger line**
- "Not in range" is muted, never destructive; only a live link earns colour (`input-sources.tsx:100-102`). **no ledger line**
- Status wording is transport-specific on purpose — "not in range" for radio, "not plugged in" for cable (`input-sources.tsx:36-41`). **no ledger line**
- The direct-connection apparatus is hidden behind a disclosure so the section does not read as required setup; saved scanners stay outside it (`input-sources.tsx:136-145`). **no ledger line**
- Mid-flow replaces the list: "one thing is happening, so one thing shows" (`input-sources.tsx:270`). **no ledger line**
- Manual UUID entry is an escape hatch, hidden by default because surfacing it made the section read as a form (`input-sources.tsx:384-386`). **no ledger line**
- Sound previews play through the same platform module at the selected volume — "what you hear is what a scan sounds like" (`barcode-scanning/settings.tsx:123-126`). **no ledger line**
- A "sent" toast is never phrased as "printed" unless the lane answers (`printing/index.tsx:165`, `printing/utils.ts:43-47`). **no ledger line**
- The templates chip says "Thermal", not "ESC/POS", because the wire format depends on the printer (`printing/utils.ts:18-28`). **no ledger line**
- The printers list waits up to 2 s for cloud printers so the empty state never flashes, and never blanks on a hung request (`use-available-printer-profiles.ts:20-21,27-29`). **no ledger line**
- Wizard secondary actions are buttons, not links — "Paul, 2026-09-05: buttons over links" (`printer-setup-dialog.tsx:220`). **no ledger line**
- Theme tiles are height-locked to the tallest possible card so all six match across rows, locales and widths (`theme.tsx:45-47`); `ThemeGrid` is isolated so `useUniwind()` does not re-render the page and cancel the theme transition (`theme.tsx:70-75`). **no ledger line**
- The shipping-tax-class row falls back to the raw slug rather than reading blank while the class list loads (`tax.tsx:62-63`). **no ledger line**
- `AdvancedSettings` opens by default when editing an existing printer but stays closed when adding (`add-printer.tsx:167`). **no ledger line**

## 6. Platform differences

- **Printer dialog is a three-way platform split**: `printer/add-printer.tsx` (native), `add-printer.web.tsx`, `add-printer.electron.tsx`. All three hand a `platform` prop to the same wizard (`add-printer.tsx:47`, `add-printer.web.tsx:52`). Web shows "Web browsers can print directly to Epson and Star Micronics printers over network, USB, or Bluetooth when the browser supports it." plus "Connect USB printer" / "Connect Bluetooth printer" gated on `isWebUsbSupported()` / `isWebBluetoothSupported()` (`add-printer.web.tsx:130-168`) and never offers `connectionType: 'system'` (`:179`). Electron branches again on `isWindowsPlatform()`: "Installed printers" (winspool) on Windows vs "Paired Bluetooth printers" elsewhere (`add-printer.electron.tsx:192-215`).
- **Wizard**: "Find a USB printer" is web-only (`printer-setup-dialog.tsx:278`); "Find a Bluetooth printer" is hidden on native because SDK discovery already lists BT printers (`:280-285`); the scan help line differs per platform (`:400-408`); "Open Bluetooth settings" fires an Android intent (`:66-70`, rendered at `:618,685`); classification itself is platform-dependent (`use-printer-setup-flow.ts:46-61`).
- **Scanner chooser**: `scanner-device-chooser.tsx` is a `return null` stub — browsers show their own Web Serial/WebHID picker and native has no serial/HID transport; only `scanner-device-chooser.electron.tsx` renders, and it must always reply on `serial-port-selected` / `hid-device-selected` or the main process blocks forever (`:13-23`).
- **Barcode sound**: the haptic switch is native-only (`barcode-scanning/settings.tsx:293`).
- **Barcode test input**: on web a global key listener captures scans and the field is read-only; on native the field is the capture surface and feeds both the trace capture and the production detector (`test-panel.tsx:94-105,157-159`).
- **Customer display**: "Copy URL" / "Open in browser" render only on web (`pairing-code.tsx:98`). `copyUrl` reads `navigator.clipboard` with no native fallback (`:60-64`).
- **Width, not OS**: the rail/back-bar split is `screenSize === 'sm'` from `useTheme()`, so a narrow desktop window gets the phone layout (`navigation-area/index.tsx:86`).

## 7. Open questions

1. **Restore server settings fails silently.** The catch only logs (`general.tsx:181-191`); the button stops spinning and nothing on screen changes, whether the patch was empty or the request 403'd. There is no success feedback either.
2. **No confirmation on "Restore server settings"** despite the copy warning it "will overwrite local changes" (`general.tsx:371-377`) — the destructive styling is the only guard.
3. **The four disabled address fields carry no explanation.** Country/state/city/postcode are `disabled` (`general.tsx:215,228,237,246`) with no equivalent of Tax's "Set in WooCommerce, mirrored here." note.
4. **Deleting a printer has no confirmation** (`printing/index.tsx:122-130`) while forgetting a display does (`paired-displays.tsx:114`).
5. **Printers section renders nothing at all while loading** (`printing/index.tsx:214`) — no skeleton, no spinner, for up to 2 s.
6. **`showMenu = true; // the setup report is always offered`** (`printer-row.tsx:86`) is a dead constant; whether the overflow menu should ever hide is undecided in code.
7. **The mini-app modal route is reachable under Settings but nothing in this screen links to it** (`(modals)/mini-app/[id].tsx:5`); its entry point is outside the inventoried folders.
8. **`settings.setup_paper_32`/`_48` ("58 mm"/"80 mm") coexist with `setup_width_32/42/48/64`** — two different vocabularies for paper width on two wizard screens (`printer-setup-dialog.tsx:390,653`).
9. **Sound-preview buttons are glyph-only (`▶`, `▶✕`)** with `aria-label` but no visible text (`barcode-scanning/settings.tsx:231,240`); `▶✕` has no established meaning.
10. **The General page's double Suspense boundary is load-bearing** (`general.tsx:69-86`, #1707): a redraw that flattens the component tree there reintroduces an infinite retry loop.
