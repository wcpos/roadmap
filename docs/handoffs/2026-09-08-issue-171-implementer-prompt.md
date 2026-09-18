# Implementer prompt for wcpos/roadmap#171 (written 2026-09-08)

Paste as the opening message of a fresh session in the monorepo.

---

Implement wcpos/roadmap#171 on the `next` lane of wcpos/monorepo (1.11.0).

Read the issue first: `gh issue view 171 -R wcpos/roadmap`. It is the spec. Do not re-research the design; the three rules are decided.

Context you need before touching code:
- Pay is optimistic (wcpos/monorepo#1911): `packages/core/src/screens/main/pos/cart/buttons/pay.tsx` calls `enterCheckout(uuid)` and `markOrderSaving(uuid)` from the checkout-mode store (`pos/checkout/checkout-mode.ts`), then awaits `pushDocument`. The tender pane (`pos/checkout/tender/`) shows skeletons and keeps tiles inert while `savingOrders` has the uuid. Today any non-success in the push calls `abandon()`: leave checkout, toast, back to the cart.
- The save path: `packages/core/src/screens/main/contexts/use-push-document.ts` → `engine.write(...)` → `awaitWriteOutcome` in `packages/query/src/await-write-outcome.ts`, which resolves on `write-acknowledged` / `write-ack-rematerialized`, rejects with a typed `WriteOutcomeError` (status, reason) on `write-rejected` / `write-conflict`, and otherwise rejects on a 15 s timer. The drain lane (`packages/sync-engine/src/write-path/write-drain-lane.ts`) returns `{ status: 'skipped', reason: 'offline' }` when connectivity is offline and backs off on transient failures; permanent 4xx dead-letters into the Store health surface.
- Payment tiles already carry the capability rule: `capabilities.offline === 'record'` tiles work offline, everything else shows "Needs a connection" (`tender/tiles.ts`, `tender/labels.ts`). `record-manual-payment.ts` records a local leg when the order has no server id.

What to build:
1. Make the save report which of three outcomes it saw instead of one thrown error: `rejected` (WriteOutcomeError, carry status + reason), `queued-offline` (drain skipped for offline), or still `saving` (no terminal event yet). Remove the 15 s timer from the checkout path; the wait is bounded by engine events (terminal write events, the drain report, connectivity change), never a clock.
2. Store: replace the boolean `savingOrders` membership with a per-order save state `saving | queued-offline | rejected` (keep the existing hook names working or update every caller; there are tests for each).
3. Tender pane behaviour per rule:
   - rejected: leave checkout, toast the server's reason, and refuse Pay for that order until the rejection is resolved or discarded in Store health. One line, the reason, a link to Store health; no new modal.
   - queued-offline: clear the skeletons; tiles follow the existing capability rule (works-offline tiles live, others disabled with the existing reason line). The ledger and header render normally.
   - saving that outlasts a few seconds: keep the skeletons and the Back to cart button, add one line saying the store is not answering. Flip to the other two states on events.
4. Tab chip and Pay button read the same state.

Rules of the repo:
- Work in a worktree branched from `origin/next` (`git pull origin next` first); PR targets `next`. Never edit the main working tree.
- No `eslint-disable` anywhere (React Compiler rules). No new env vars: constants in code with a comment. No effects for state plumbing: effects only synchronise with external systems; events publish to the store where they happen.
- Copy that merchants read is one line plus actions; explanations live in docs, not the app.
- Tests: co-located jest, run with `--maxWorkers=2`, one suite at a time. Mutation-check at least one new test. `pnpm typecheck --force` and `npx eslint` on every changed file before pushing. `pnpm translations:check` if you add strings to `packages/core/src/contexts/translations/locales/en/core.json`.
- Walk it live before opening the PR: dev-mode web build (`cd apps/main && npx expo start --web --port 8082`, port 8081 may be taken) with a throwaway Playwright spec on the `isolatedProductTest` fixture against `https://dev-next.wcpos.com` (`BASE_URL=http://localhost:8082 E2E_STORE_URL_PRO=https://dev-next.wcpos.com npx playwright test e2e/zz-*.spec.ts --project=pro-authenticated --workers=1`). Simulate offline with `page.context().setOffline(true)` and a permanent rejection by routing the push request to a 4xx. Delete the throwaway spec before committing. Screenshot each of the three states.
- Open the PR as ready-for-review with the validation commands and exit codes in the body, and reply to every bot review thread before merging.

Out of scope: mirroring a local payment leg once the order syncs (offline-orders work), terminal or server-capture flows (#154), and anything about the URL mirror (#1912).
