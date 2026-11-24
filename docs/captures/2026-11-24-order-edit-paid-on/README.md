# Orders › Edit: Paid on row

Captures of the Paid on row on the Orders › Edit tab of a completed POS sale, taken 2026-11-24 against dev-pro (signed in as the demo cashier) from wcpos/monorepo branch `codex/paid-on-row` at `a0bc2e368`, with `apps/main/e2e/orders-captures.spec.ts` (`CAPTURES=1`, light and dark schemes, regular scale). The spec ran with one change on top of that commit: the walk filters the orders list to Completed before it looks for a sale, because the row shows only on a completed sale.

```
CAPTURES=1 BASE_URL=http://localhost:8097 pnpm --dir apps/main exec playwright test e2e/orders-captures.spec.ts --project=pro-authenticated --workers=1 --grep "regular orders edit tab: paid on" --reporter=list
```

`BASE_URL` was a Metro web server of that commit (`expo start --web`).

| State | Tablet | Phone |
| --- | --- | --- |
| Resting, with "Change day" | `tablet-{light,dark}-regular--edit-paid-on-resting.png` | `phone-{light,dark}-regular--edit-paid-on-resting.png` |
| Card open, empty | `tablet-{light,dark}-regular--edit-paid-on-card.png` | `phone-{light,dark}-regular--edit-paid-on-card.png` |
| Calendar open (a sheet on phone) | `tablet-{light,dark}-regular--edit-paid-on-calendar.png` | `phone-{light,dark}-regular--edit-paid-on-calendar.png` |
| Day picked and reason typed, Move enabled | `tablet-{light,dark}-regular--edit-paid-on-ready.png` | `phone-{light,dark}-regular--edit-paid-on-ready.png` |
| Locked: "Set at the sale" | `tablet-{light,dark}-regular--edit-paid-on-locked-cashier.png` | `phone-{light,dark}-regular--edit-paid-on-locked-cashier.png` |
| Locked: "Needs a newer WCPOS plugin" | `tablet-{light,dark}-regular--edit-paid-on-locked-plugin.png` | `phone-{light,dark}-regular--edit-paid-on-locked-plugin.png` |
| Corrected, with the "Rung up" and "Moved by" lines | `tablet-{light,dark}-regular--edit-paid-on-corrected.png` | `phone-{light,dark}-regular--edit-paid-on-corrected.png` |

How each state was reached. Every stub below edits a real response in the browser only. Move was never pressed, and nothing was written to the store.

- **Resting, card, calendar, ready.** The status route's `capabilities` gains `order_sale_day_correction` and `order_cashier_reassignment`, and the cashier profile's capabilities gain `reassign_woocommerce_pos_sales`. The walk presses Change day and opens the calendar. It then picks the day before the sale's day and types a reason. Last, it presses Cancel.
- **Locked, "Set at the sale".** The cashier profile's capabilities lose `reassign_woocommerce_pos_sales`, which the demo cashier does not hold anyway.
- **Locked, "Needs a newer WCPOS plugin".** The capability is added and the status route's `capabilities` lack `order_sale_day_correction`.
- **Corrected.** As for resting, and every `GET /wcpos/v2/orders*` response gives each paid POS sale a `_wcpos_sale_day` of `{ at_gmt: <paid moment minus one day>, reason, by: <its cashier>, changed_at_gmt }`. That is the form the store serves for an applied correction. The app stores that answer in its local database in the browser; the store's orders are unchanged.
