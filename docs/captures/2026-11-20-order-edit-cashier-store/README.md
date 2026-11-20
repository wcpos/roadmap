# Orders › Edit: Cashier and Store rows

Captures for wcpos/monorepo#3706, taken 2026-11-20 against dev-pro (signed in as the demo cashier) from that PR's branch, with `apps/main/e2e/orders-captures.spec.ts` (`CAPTURES=1`, light scheme, regular scale).

| State | Tablet | Phone |
| --- | --- | --- |
| Editable (reassign capability, plugin feature present) | `tablet-light-regular--edit-identity-editable.png` | `phone-light-regular--edit-identity-editable.png` |
| Locked ("Set at the sale") | `tablet-light-regular--edit-identity-locked.png` | `phone-light-regular--edit-identity-locked.png` |

How each state was reached:

- **Editable.** dev-pro does not yet run the companion plugin (wcpos/woocommerce-pos#2719) and the demo user is a cashier, so the real responses pass through with two lists extended in the browser only: the status route's `capabilities` gains `order_cashier_reassignment`, and the cashier profile's capabilities gain `reassign_woocommerce_pos_sales`. Nothing is pressed and nothing is written to the store.
- **Locked.** The real responses, untouched: the demo cashier does not hold the reassign capability.

Dark scheme was not captured.
