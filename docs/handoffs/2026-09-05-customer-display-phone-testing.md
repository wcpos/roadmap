# Customer display — phone testing on dev-next (2026-09-05)

Handoff after a day of live-testing the customer display v1 on `dev-next.wcpos.com` with
Paul's phone. Five bugs found and fixed, all merged on `next` and deployed. Paul's ruling for
this phase: **"just let me see the cart on the phone so I can test"** — a phone mockup and the
full template system come later. Ticket wcpos/roadmap#129 carries every finding.

Previous handoff (pairing button, now closed): `2026-09-04-customer-display-pairing-button.md`.

---

## State of dev-next right now

- **Web bundle `web-bundle@next`** carries monorepo#1862, #1863, #1864 (entry published 12:18 UTC,
  jsDelivr purged). Reload the POS to pick it up.
- **Pro on dev-next** is `next` at pro#528 (deploy-dev runs on push to `next`; verified the served
  display page has the greeting markup and no flash rule).
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

### Contract facts worth keeping
- The display broadcast is the **canonical receipt data**: numeric money + `_display` strings +
  `qty`, mirrored by the free plugin's `Receipt_Data_Schema::format_money_fields`. Sample in Pro
  `packages/display/src/sample-snapshot.json`; render context = receipt data at top level +
  `ledger` + `payment`.
- `formatMoney` falls back to `"<code> <amount>"` without Intl, so formatting cannot throw.
- Local variation lines carry attributes ONLY as `display_key`/`display_value`.
- The display engine (`packages/display/src/engine.ts`) no longer rebuilds on identical markup;
  a template cannot rely on re-render animations.

## Open follow-ups (in the order Paul is likely to hit them)

1. **"Hi Max!" by first name** — the canonical receipt data has `customer.name` only. Add
   `customer.first_name` to BOTH builders (JS `buildReceiptData`, PHP `Receipt_Data_Builder` +
   `Receipt_Data_Schema` field tree) and switch the greeting.
2. **Money precision** (Codex on #1863) — `formatReceiptData` formats at the currency's default
   decimals, ignoring the store's `wc_price_decimals`. Printed receipts have the same behaviour;
   fix in `@wcpos/printer` for both consumers, thread `dp` through.
3. **Mixed-language labels** ("Impuestos totales" on the UK store) — `i18n` comes from the
   store's `receipt_i18n`. Template-system concern, not a bug in the display.
4. **Template system + phone mockup** — deferred by Paul. Wants: a real "new line" cue
   (engine-driven, e.g. `data-wcpos-line-key`), narrow-viewport design, i18n.
5. Still open from before: on-device native verification (needs an EAS dev-client build).

## Process notes for the next session

- **Lane:** everything here is 1.11 on `next` (monorepo, free, pro). Worktree from `origin/next`,
  PR base `next`. `next` is ahead of `main` (7 ahead / 74 behind at 10:00 UTC), so syncing is a
  sync PR, not a push.
- **Publishing the web bundle to dev-next is manual:** wait for the merge commit's push `Test`
  run on `next` to be green, then dispatch `publish-web-bundle.yml` with `monorepo_ref=next`,
  `bundle_branch=next`, `override_release_gate="I accept a red main"`. The workflow purges
  jsDelivr itself. Verify: `curl https://cdn.jsdelivr.net/gh/wcpos/web-bundle@next/build/metadata.json`.
- **Pro deploys itself:** push to `next` runs `deploy-dev.yml` (`DEV_NEXT_SITES=dev-next`).
  The display page is `Cache-Control: no-store`, but `display.js?ver=` only changes with the
  plugin version, so the phone may cache an old `display.js` — hard reload after an engine change.
- **Merging:** `gh pr merge` as its own Bash call with `-R`. The `merge-thread-walk` hook blocks a
  merge until every Codex thread has a reply; Codex reviewed every PR today within ~10 min
  (P1/P2 findings, all legitimate) — reply or fix before merging.
- **Rendering the Ledger template locally** (no wp-env needed): Mustache + Playwright from the
  monorepo worktree's node_modules; a script is in this session's scratchpad only — rebuild it
  from `packages/display/src/preview.ts`'s `previewContext` if needed (10 lines).
- **Pro worktree `pnpm install --frozen-lockfile` fails**; plain `pnpm install` works and does not
  change the lockfile. `packages/display` tests: `npx vitest run --maxWorkers=2`.
- **Worktrees left on disk** (cleanup script should have removed the merged ones; check with
  `git worktree list`): `~/Projects/monorepo-v2-worktrees/fix-display-settings-cold-mount`,
  `~/Projects/monorepo-v2-worktrees/fix-display-snapshot-format` (last branch
  `fix/display-variation-attributes`), `~/Projects/woocommerce-pos-pro-worktrees/display-template-phone`
  (last branch `fix/display-engine-noop-render`).
