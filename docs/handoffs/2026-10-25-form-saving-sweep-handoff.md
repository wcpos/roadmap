# Handoff: one way to save a form, 2026-10-25

**Repo:** `wcpos/monorepo`, lane **`next`** (branch worktrees from `origin/next`, PRs target `next`).
**Owner ruling (Paul, 2026-10-23 and 2026-10-25):** *"We can't have different ways of saving a form."* Every
form that edits a record that already exists saves each field as it is edited, the way Settings and the
cart's Order details sheet do (shipped in wcpos/monorepo#2910 and #2917). A Save button on an edit form is a
defect. On 2026-10-25 he opened Products → Edit product, found a Save button, and called it unacceptable.

This doc is the whole brief for the sweep. The next session reads it, then the two shipped examples, then
does the work in three PRs.

## 1. The rule, as it now stands

1. **An edit to a record that exists saves as it is made.** `useFormChangeHandler` (in
   `packages/components/src/form/use-form-change-handler.ts`) validates the changed path and writes it; the
   shared `SavedMark` (`@wcpos/components/form`, testID `saved-<name>`) acknowledges it beside the label.
   Text fields debounce 300 ms; selects, switches and radios write at once. The footer is **Close** (or ×)
   plus the record's own actions. There is no Cancel, no Save.
2. **A record the store owns reaches the store through the outbox**, not through a button. `localPatch` →
   `applyLocalPatch` → `patchAndEnqueueEngineResident` → `engine.write({ operation: 'update' })` already
   queues a store mutation for every non-cart write (products, variations, customers, coupons, orders that
   are not the open cart); the queue coalesces unclaimed updates to one record
   (`packages/sync-core/src/recordMutationQueue.ts`). "Saved" means saved on the device and on its way.
3. **One explicit button only for an action named for what it does**: creating a record (*Add customer*,
   *Add coupon*, *Add to cart*, *Add printer*), moving money (*Pay*, *Refund*), sending something (*Send*
   on the receipt email, *Send* on the cart hand-over), a status intent on an order (ADR 0040: a status is
   an intent, never an echo), and the record actions already in the footers (*Sync* = take the store's
   copy, *Delete*). The word **Save** is on no button anywhere. **Update customer too** on the cart address
   sheet stays: it writes to a second record.
4. **The two kinds never share one form.** Where a sheet holds both (the order's fields and its status),
   the intent lives in its own bordered card with its own form and button, exactly as the cart's Order
   details sheet does ("Hand over" card with *Send*).

`CODING_STANDARDS.md` § Components, the "Saving" paragraph (line ~331 on `next`), says only "what the
device owns"; **slice A rewrites it** to the four points above. The memory ruling file in the main session's
memory (`ruling-saving-is-never-a-button-two-kinds-never-share-a-form.md`) has been updated already.

## 2. Inventory (read on `next` at `57b2e4f621`, 2026-10-25)

### Already on the model (reference implementations; copy their shape)

| Form | File | Notes |
| --- | --- | --- |
| Order details sheet (cart) | `packages/core/src/screens/main/pos/cart/buttons/edit-order-meta/form.tsx` | Edit form + "Hand over" card. The pattern for a form that also carries a status intent. |
| Edit line item / fee / shipping | `pos/cart/cells/edit-*/form.tsx` | `SavedFieldProvider` wrapper + inner `…Fields`; Close-only footer. |
| Cart customer address | `pos/cart/edit-cart-customer.tsx` | Autosave + one explicit *Update customer too*. |
| Settings general / tax / barcode / theme | `packages/core/src/screens/main/settings/*.tsx` | `useMarkSaved` after the writer resolves. |
| Column pickers | `components/ui-settings/columns-form.tsx`, `pos/*/ui-settings-form.tsx` | |

### To convert (the sweep)

| # | Form | File | Writes through | Today |
| --- | --- | --- | --- | --- |
| 1 | Edit product | `packages/core/src/screens/main/products/edit/product/form.tsx` | `useCatalogueRecord().saveCatalogueFields` (= `localPatch`) | Cancel / **Save** (`product-edit-save-button`), Delete + Sync on the left |
| 2 | Edit variation | `products/edit/variation/form.tsx` | same | Cancel / **Save** (`variation-edit-save-button`) |
| 3 | Edit customer | `customers/edit/form.tsx` → shared `components/customer/customer-form.tsx` | `useCustomerRecord().saveCustomerFields` then `pushDocument(customer)` | Cancel / **Save**, Delete + Sync on the left |
| 4 | Edit coupon | `coupons/edit/form.tsx` → shared `components/coupon/coupon-form.tsx` | `useCouponRecord().saveCouponFields` then `pushDocument(coupon)` | Cancel / **Save** |
| 5 | Orders → Edit tab | `orders/edit/form.tsx` | `saveOrderFields` then `pushDocument(order)`, `blockIfDegraded('save-order')` | Cancel / **Save** (`order-edit-save-button`); `values:` (reactive) |

### Keep as they are (one verb, creation or money); only the label must not say Save

`customers/add.tsx` and `coupons/add.tsx` (they reuse the shared forms above, whose submit button
currently reads `common.save` for BOTH add and edit: after the sweep the add screens label it *Add
customer* / *Add coupon*), `pos/cart/add-customer.tsx`, `add-fee.tsx`, `add-shipping.tsx`,
`add-discount.tsx`, `add-misc-product.tsx`, `settings/printer/add-printer*.tsx` and
`printer-setup-dialog.tsx`, `receipt/email.tsx` (*Send*), `orders/refund/form.tsx` (*Refund*), the
checkout tenders. Inline cells (`components/editable-field.tsx`, `number-input.web.tsx`,
`products/cells/barcode.tsx`) already commit in place on blur/Enter with no button: leave them.

## 3. The three PRs (each ≤ 600 added production lines; split again before opening if one grows)

### Slice A: products and variations (+ the standards paragraph)

- Both forms: `SavedFieldProvider` around the body, `useFormChangeHandler` whose `onChange` maps the one
  changed root field to its wire shape (`tax_class` → `taxClassToWire`, `categories` → `{ id, name }[]`,
  `stock_quantity` number) and calls `saveCatalogueFields(record, { [root]: wire })`; `return Boolean(written)`.
  `SavedMark name=<root>` beside each label (`HStack` label + mark, as the cart sheets do).
- Footer: left `RecordFooterActions` (Delete, Sync) as today; right **Close** only. Delete `formActions`,
  `handleSave`, `onSave`, `loading`, the `common.save` / `common.cancel` uses here, the `product-edit-save-button`
  and `variation-edit-save-button` testIDs.
- **Sync pulls the store's copy and resets the form** (`onSynced: form.reset(formValues(latest))`). Before the
  pull, `await flush()` from the hook (it returns `Promise<boolean>`); a debounced write landing after the
  reset would put the stale draft back over the pulled values. If the flush reports false, do not pull.
- The product form reads `readOnly` from the licence: when read-only, the fields are disabled today and
  must stay so; the hook must not write for a read-only form (mount it only when `!readOnly`, or make the
  writer return false).
- `CODING_STANDARDS.md` § Components "Saving": replace the paragraph with § 1 above (four sentences, not
  four bullets; keep the owner date).
- Tests: `products/edit/product/form.test.tsx` exists; add the autosave cases (a name edit writes
  `{ name }` after the debounce; a categories change writes `{ id, name }` rows; Sync after a pending edit
  flushes first). Variation gets a small twin. Heap flag `NODE_OPTIONS=--max-old-space-size=4096`,
  `--maxWorkers=2`, one suite at a time.
- E2E selectors (do not run the suite; keep it honest): `apps/main/e2e/products-page.spec.ts` lines ~433
  and ~550 click `product-edit-save-button` and then wait for the products push response. Replace with:
  fill the name, wait for `saved-name`, then the push response (the outbox sends it), then close the modal.
  `product-modal-sync` / `variation-modal-sync` assertions stay.

### Slice B: customers and coupons (+ the shared forms' add label)

- The shared `CustomerForm` and `CouponForm` take an explicit footer from the caller instead of owning a
  submit button: the add screens pass *Add customer* / *Add coupon* (new strings
  `customers.add_customer`, `coupons.add_coupon`; neither exists in `core.json` today), the edit screens
  pass Close plus the record actions and mount the autosave handler. `SavedMark` renders nothing without
  a `SavedFieldProvider` above it (the context has a null default, verified), so the add screens need no
  wrapper.
- Writer: per field `saveCustomerFields(customer, { [root]: value })` / `saveCouponFields(...)`. The
  explicit `pushDocument(customer)` after the patch exists because the edit was one Save; verify in
  `applyLocalPatch` that a customer/coupon patch enqueues through `patchAndEnqueueEngineResident`
  (it should: both collections are write doors). If it does, the `pushDocument` call goes; if some
  field is not "syncable" (`syncableChanges`), say which in the PR body rather than adding a push.
- Addresses: billing and shipping are objects. Write the whole object root on any nested change
  (`billing.first_name` → `{ billing: form.getValues().billing }`), as the cart address sheet does, and mark
  `billing` / `shipping` saved.
- Coupon form: `expiry` presets and `usage_limit` set several fields at once (`section-summaries`,
  `expiry-preset-chips`): a preset handler writes its fields in one `saveCouponFields` call and marks them,
  the way the settings forms call `useMarkSaved` after a compound write.
- Tests: `coupon-form.test.ts` exists; add the edit autosave cases; a customer edit test file is new.
- Strings: after this slice `common.save` must have no button caller. Grep; delete it and
  `common.saved`'s unused siblings only if nothing else reads them (`node scripts/extract-js-strings.js --check`).

### Slice C: the Orders screen Edit tab

- Same split as the cart's Order details sheet: the fields (customer, billing, shipping, note, currency,
  tax ids, meta) autosave through `saveOrderFields(order, { [root]: value })`; **status moves into its own
  card with its own form and one button, *Update status*** (toast `Status updated`), with the same
  `handleSend`-style rollback on a failed push (ADR 0040: status is an intent; write it only when it
  differs from the record's; on refusal restore the previous status). Payment method, title and
  transaction id stay read-only.
- `blockIfDegraded('save-order', { orderId })` (#163 ruling R5) guards every write: the hook's `onChange`
  returns false when storage is degraded, and the status card's button is disabled as the Save is today.
- The form uses reactive `values:` today. Switch to `defaultValues` keyed by `order.uuid` (`key=` on the
  form component from its caller): the write's echo re-binding the form reset it under the cashier's hands
  on the cart sheet (Codex P1 on #2910).
- `handleCustomerChange` writes `customer_id`, `billing` and `shipping` together: one `saveOrderFields`
  call with the three roots, then mark all three saved. Do not route it through the per-field hook.
- Meta rows: copy `reconcileMetaWithOrder` from the cart sheet (store ids carried, tombstones only for keys
  the draft opened with, protected keys filtered, just-added blank rows skipped).
- Is an order on the Edit tab ever the open cart? If the record can be the open cart, the open-cart hold
  applies and the outbox will not push until the cart's explicit action; say so in the body. Otherwise the
  outbox pushes each field.
- Tests: `orders/edit/form.test.tsx` and `modal.test.tsx` exist; adapt and add the status-card case.
- No E2E spec selects `order-edit-save-button` today (grepped `apps/main/e2e`); nothing to update there.

## 4. Traps already paid for (copy, do not rediscover)

- A form that writes what it shows uses `defaultValues`, keyed per record, never reactive `values`.
- The hook validates the changed PATH (`form.trigger(name)`), never its root; schema fields whose control
  hands back a string need `z.coerce.number()` or the gate refuses every change.
- Two text fields inside one 300 ms window: the hook already flushes the first before queueing the second.
- Any action that pulls or pushes next (Sync, Update status, Send) awaits `flush()` and stops on `false`.
- `markSaved` only after the writer resolved true; `localPatch` reports its own failure (toast + log row)
  and resolves undefined, so the form reports nothing extra on failure.
- Writers inside a modal must take the owning record, never read "current" state: a debounced write can
  land after the modal closed and another record was selected.
- Labels are required on `SavedMark` (`label={t('settings.saved')}`).
- Lint: `no-misused-promises` on async handlers given to the hook; wrap with `void …`.
- Keep `.claude/research/` briefs out of the commit (gitignored); the worktree guard needs literal absolute
  paths (`git -C /abs/path …`).

## 5. Done means

- No button in `packages/core` carries `common.save`; `grep -rn "common.save'" packages/core/src` is empty.
- Each converted form: field edit → `saved-<name>` appears; closing and reopening shows the edit; the
  outbox row for the record exists (Logs screen) and lands on dev-next after publish.
- Unit tests for every converted form, `tsc`, lint, `node scripts/extract-js-strings.js --check` green per PR.
- Each PR: one pre-push review pass, review loop ends at round 5 (split rather than a sixth), merge on
  `review-gate` green, never `--auto`. After the last merge publish `@next`
  (`gh workflow run publish-web-bundle.yml -R wcpos/monorepo --ref next -f monorepo_ref=<sha> -f bundle_branch=next -f override_release_gate='I accept a red main'`)
  and prove it by the cdn.wcpos.com manifest build id.
- Polish phase on `next`: no E2E runs, no screenshots, no gallery label (selectors updated by hand).
- Ledgers: `orders/LEDGER.md` gets one line for slice C; products, customers and coupons have no ledger
  yet, so the PR body carries the decision (do not create ledgers for this).

## 6. Open questions, with the recommendation taken unless Paul objects

1. *Update status* is the button on the Orders Edit tab's status card (the cart says *Send* because the
   order leaves the cart; here it does not). Taken.
2. The licence-gated read-only product form keeps its disabled fields and shows no Saved marks. Taken.
