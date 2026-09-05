# Customer display — phone testing on dev-next (2026-09-05)

Handoff after a day of live-testing the customer display v1 on `dev-next.wcpos.com` with
Paul's phone. Seven bugs found and fixed across two rounds, all merged on `next` and deployed. Paul's ruling for
this phase: **"just let me see the cart on the phone so I can test"** — a phone mockup and the
full template system come later. Ticket wcpos/roadmap#129 carries every finding.

Previous handoff (pairing button, now closed): `2026-09-04-customer-display-pairing-button.md`.

---

## State of dev-next right now

- **Web bundle `web-bundle@next`** carries monorepo#1862, #1863, #1864, #1866 (entry `c08862bf`,
  published ~13:40 UTC, jsDelivr purged). Reload the POS to pick it up.
- **Pro on dev-next** is `next` at pro#529 (deploy-dev runs on push to `next`; verified the served
  display page keys the greeting on `customer.id` in all five states).
- Login demo/demo, store "UK Store" (id 578). Display page: `https://dev-next.wcpos.com/?wcpos-display=1`.

## What was fixed today (root causes, not symptoms)

| Symptom | Root cause | Fix |
|---|---|---|
| "Generate pairing code" disabled on a cold load of settings | **React Compiler** cached the bare `getCustomerDisplayService()` read behind a memo sentinel; the version subscription re-rendered but its result was discarded. Not screen freezing, not a subscription miss. | monorepo#1862: the service reference is the `useSyncExternalStore` snapshot. Screen now compiled with the compiler in jest; `cold-start.test.tsx` uses the real service module. |
| Display shows labels but blank money, no lines | POS sent the **offline receipt shape** (string money, `quantity`); the Pro Ledger template reads the **canonical** shape (`qty`, `*_display`). The 2026-09-03 fix had dropped formatting instead of inserting `mapReceiptData`. | monorepo#1863: snapshot = `formatReceiptData(mapReceiptData(buildReceiptData(...)))`, same as the print path. |
| Phone shows only the totals panel | Ledger grid `minmax(0,1fr) 380px` collapses the list column at 390px. | pro#527: stack below 700px, panel capped at 60dvh. |
| Variation attributes missing (and `": "` on local receipts) | Every add-variation path writes attributes with only `display_key`/`display_value`; `buildReceiptData` read `key`/`value`. | monorepo#1864: prefer the display pair (WC `get_formatted_meta_data` rule). |
| Last row pulses green on customer change / cart switch | Template animated `:last-child`; engine rebuilt the DOM on every `cart.updated`. | pro#528: engine skips unchanged markup (and still re-renders after an overlay replaced the mount); flash removed from the template. |
| (Request) greet a selected customer | — | pro#528: `Hi {{customer.name}}!` under the store name, hidden for guests. Full name only. |
| **Round 2 (afternoon):** "Hi Guest!" on guest sales | Greeting keyed on `customer.name`, but the POS writes the guest customer onto the order with a real billing first name (`t('common.guest')`); the PHP builder does the same. The canonical schema already had `customer.id` (null/0 = guest) and PHP emits it, but `buildReceiptData` omitted it and `mapReceiptData` hardcoded `id: 0`. | monorepo#1866 (builder + mapper emit the id, null for guests); pro#529 (greeting wrapped in `{{#customer.id}}`) |
| Greeting under the totals at the bottom of the phone | It lived in the totals panel, which stacks below the list on narrow viewports. The list also had a fixed `min-height: calc(100vh - 114px)` that a greeting would overflow (Codex P2). | pro#529: greeting is the first child of the list column in all five non-idle states; the list column is a flex column and the items flex-fill. Measured in Chromium at 1280×800 and 390×844: no overflow for short/empty carts. |

### Contract facts worth keeping
- The display broadcast is the **canonical receipt data**: numeric money + `_display` strings +
  `qty`, mirrored by the free plugin's `Receipt_Data_Schema::format_money_fields`. Sample in Pro
  `packages/display/src/sample-snapshot.json`; render context = receipt data at top level +
  `ledger` + `payment`.
- `formatMoney` falls back to `"<code> <amount>"` without Intl, so formatting cannot throw.
- Local variation lines carry attributes ONLY as `display_key`/`display_value`.
- **`customer.id` is the guest discriminator, never `customer.name`**: the guest customer carries a
  real billing name ("Guest", localised) on both the JS and PHP paths.
- The display engine (`packages/display/src/engine.ts`) no longer rebuilds on identical markup;
  a template cannot rely on re-render animations.

## Open follow-ups (in the order Paul is likely to hit them)

Paul's close of the day (~14:00 UTC): "that's it for bugs now". Nothing from today is half-done.

1. **Sync `next` from `main`** — `next` is now BEHIND `main` in all three repos (monorepo 82 ahead /
   20 behind, free 22 / 74, pro 31 / 13). Sync PR, not a push; the free plugin's 74 are the 1.10.x
   stream and may collide with the payments work. Do it as its own session before the gap grows.
2. **Put wcpos/roadmap#129 on the 1.11.0 milestone.** It has none. It stays OPEN until the release
   train ships (standing rule), so the milestone is what stops it getting lost.
3. **"Hi Max!" by first name** — the canonical receipt data has `customer.name` only. Add
   `customer.first_name` to BOTH builders (JS `buildReceiptData`, PHP `Receipt_Data_Builder` +
   `Receipt_Data_Schema` field tree) and switch the greeting. #1866 touched exactly those spots
   for `customer.id`, so the path is warm. Full name reads formal on a customer-facing screen.
4. **Money precision** (Codex on #1863) — `formatReceiptData` formats at the currency's default
   decimals, ignoring the store's `wc_price_decimals`. Printed receipts have the same behaviour;
   fix in `@wcpos/printer` for both consumers, thread `dp` through.
5. **Mixed-language labels** ("Impuestos totales" on the UK store) — `i18n` comes from the
   store's `receipt_i18n`. Template-system concern, not a bug in the display.
6. **Template system + phone mockup** — deferred by Paul. Wants: a real "new line" cue
   (engine-driven, e.g. `data-wcpos-line-key`), narrow-viewport design, i18n.
7. Still open from before: on-device native verification (needs an EAS dev-client build).
8. Housekeeping: two orphaned wp-env Docker volumes (~1.6 GB) from old free-plugin worktrees;
   `bash ~/.claude/scripts/cleanup-worktrees.sh` removes them when Docker is running.

## Process notes for the next session

- **Lane:** everything here is 1.11 on `next` (monorepo, free, pro). Worktree from `origin/next`,
  PR base `next`. See follow-up 1 for the current `next`/`main` drift.
- **Publishing the web bundle to dev-next is manual:** wait for the merge commit's push `Test`
  run on `next` to be green (Lint + Unit; web E2E is path-filtered and may skip), then
  `gh workflow run publish-web-bundle.yml -R wcpos/monorepo --ref next -f monorepo_ref=next
  -f bundle_branch=next -f override_release_gate="I accept a red main"`. The workflow purges
  jsDelivr itself. Verify: `curl https://cdn.jsdelivr.net/gh/wcpos/web-bundle@next/build/metadata.json`
  and check the entry hash changed (today: `bfa104f6` → `c08862bf`).
- **Pro deploys itself:** push to `next` runs `deploy-dev.yml` (`DEV_NEXT_SITES=dev-next`).
  The display page is `Cache-Control: no-store`, but `display.js?ver=` only changes with the
  plugin version, so the phone may cache an old `display.js` — hard reload after an engine change.
  Template-only changes need no reload of `display.js`.
- **Merging:** `gh pr merge` as its own Bash call with `-R`. The `merge-thread-walk` hook blocks a
  merge until every Codex thread has a reply; Codex reviewed every PR today within ~10 min
  (P1/P2 findings, all legitimate) — reply or fix before merging. Reply with
  `gh api graphql` and `-F body=` variables; inline `×`/backticks in the query string break parsing.
- **Hook trap:** `git worktree add -B <branch>` in the same command as `gh pr create` trips the
  stacked-PR hook (it reads `-B` as the PR base). Create the worktree in one call, the PR in another.
- **Rendering the Ledger template locally** (no wp-env needed): `docs/handoffs/scripts/ledger-layout-check.cjs`
  renders the real template with Mustache in headless Chromium at 1280×800 and 390×844 and prints
  page/list overflow, greeting position and panel visibility per state. Run from a monorepo
  worktree (it has playwright + mustache):
  `NODE_PATH="$PWD/node_modules:$PWD/packages/printer/node_modules" PRO=<pro worktree> node <script>`.
- **Pro worktree `pnpm install --frozen-lockfile` fails**; plain `pnpm install` works and does not
  change the lockfile. `packages/display` tests: `npx vitest run --maxWorkers=2`.
- **Worktrees on disk** (the cleanup script does NOT flag them; reuse them by checking out a new
  branch from `origin/next`, node_modules are already installed):
  `~/Projects/monorepo-v2-worktrees/fix-display-settings-cold-mount`,
  `~/Projects/monorepo-v2-worktrees/fix-display-snapshot-format` (last branch
  `fix/display-customer-id`, merged), `~/Projects/woocommerce-pos-pro-worktrees/display-template-phone`
  (last branch `fix/display-greeting-guest`, merged).
