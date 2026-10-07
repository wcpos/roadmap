# Handoff — 2026-10-07, Sentry watch: five bugs from the 1.10.24/1.10.25 releases, then a standing loop

Written for a fresh Claude Code session on the Mac Mini. It has none of this machine's memory, so
everything it needs is here. Scope: fix the five bugs below, then keep watching Sentry and fix what
arrives. The main-lane repos: `wcpos/monorepo` (app), `wcpos/woocommerce-pos` (free plugin),
`wcpos/woocommerce-pos-pro`, `wcpos/electron`. Every fix is a PR on `main` per the rules in
`~/.claude/CLAUDE.md` (worktree, pull first, PR when done, own the follow-up).

## Sentry access

- **Token**: read-only, in `~/.claude/.env` as `SENTRY_AUTH_TOKEN` with `SENTRY_ORG=wcpos`. Paul
  copies that file onto the Mini; nothing loads it for you: `set -a; source ~/.claude/.env; set +a`.
  It is read-only (403 on any write). Never commit it or echo it; this repo is public.
- **REST base** `https://sentry.io/api/0`, header `Authorization: Bearer $SENTRY_AUTH_TOKEN`.
  One project, `woocommerce-pos`, id `1220733`. Org slug `wcpos`.
- **Release namespaces in that one project**: `wcpos-app@x.y.z` = the app bundle on web and the
  Electron renderer (the `environment` tag splits `web` / `electron`); `WCPOS@x.y.z` = the Electron
  main process (its numbers run one ahead of the app's); `com.wcpos.main@x.y.z+N` = native iOS and
  Android (filter native by `environment:ios|android`, never by release); `wcpos-php@x.y.z` = the
  plugin. Merchants today: app 1.10.25 (released 2026-10-06; most tills still on 1.10.24), desktop
  1.10.28, plugin 1.10.20 (free 1.10.21 ships with the 1.10.25 train), native 1.10.18 (28).
- **Error codes**: app errors are fingerprinted by `tags.errorCode` (SYNC321, CHECKOUT101, AUTH101…),
  so one issue holds many titles. The title is just the first event. Always read the per-event
  context before believing a title. `user` = per-install UUID; "users" means installs, not people.
- **The scrubber** replaces auth-looking context values with `[Filtered]` (`errorCode: AUTH101`,
  push `reason`). Tags and titles are intact; the title carries the HTTP status and reason.

Queries that work (all `GET`, add `&project=1220733`):

```
# per-release volume — leave event.type OFF; the app's captureMessage events are the bulk
/organizations/wcpos/events/?field=release&field=environment&field=count()&field=count_unique(user)&query=&statsPeriod=14d&sort=-count()
# issues inside one release, split by code and title
/organizations/wcpos/events/?field=issue&field=errorCode&field=title&field=count()&field=count_unique(user)&query=release:wcpos-app@1.10.25&statsPeriod=7d&sort=-count()
# new issues this week
/organizations/wcpos/issues/?query=firstSeen:-7d&statsPeriod=7d&sort=freq
# one issue — needs the FULL short id
/organizations/wcpos/issues/?query=issue:WOOCOMMERCE-POS-2HZ&statsPeriod=14d     → gives the numeric id
/organizations/wcpos/issues/{id}/tags/user/   /tags/release/   /tags/errorCode/
/organizations/wcpos/issues/{id}/events/?query=release:wcpos-app@1.10.25&per_page=50   → list (no context)
/organizations/wcpos/issues/{id}/events/{eventID}/   → context at event.context.context, breadcrumbs in entries[type=breadcrumbs]
# daily series, to see whether a fix moved anything
/organizations/wcpos/events-stats/?query=errorCode:CHECKOUT101&statsPeriod=28d&interval=1d&yAxis=count()
```

Traps: the issues endpoint's `count` / `userCount` are whole-issue, not per release; `firstSeen`
is clipped to `statsPeriod`. To split a fingerprint-by-code issue by cause, fetch 40–60 recent
events and tally `context.context.error`. Do it sequentially; parallel fetches get rate-limited.
Write one small Python script with a `get(path, **params)` helper and subcommands; do not hand-roll
curl per query.

## The five bugs, in priority order

Numbers are 2026-09-23 → 2026-10-07 unless stated. Sentry short ids are `WOOCOMMERCE-POS-<id>`.

### 1. Checkout times out because the push request is never sent (CHECKOUT101 / 2HZ, 2K3, 2KA, 2KV)

- **What merchants see**: "Checkout failed". Flat at ~50 events and ~15 installs a day for four
  weeks; 98 web installs on 1.10.24 in two weeks. monorepo#2198 (shipped 09-23 in 1.10.24) was
  meant to fix it and the daily series did not move.
- **Evidence**: sampled 60 recent `Failed to send document to server` (2K3) events: 49 are
  `Timed out waiting for mutation`. Of the web ones, 35 have **no `POST …/push/orders` breadcrumb
  anywhere in the 15 s window**, while ticks, reads and integrity scans to the same store flow
  normally; 6 show a POST that hung or returned 404. On 1.10.25 web the same order (#11911 on that
  store) timed out four times in three minutes as the cashier re-pressed Checkout, with no POST.
  The first failure on that order was a write-rejected/deferred, then only timeouts.
- **Where**: the checkout waiter is `packages/query/src/await-write-outcome.ts` (15 s, hears only
  its exact mutationId). The drain is `packages/sync-engine/src/write-path/write-drain-lane.ts`;
  the backoff release for an explicit row is at `write-intents.ts:497` ("the drain releases a
  record's backoff once for an explicit row queued after the chain's last attempt"). Hypothesis: a
  second explicit retry after a failed attempt does not release the chain again, so the row parks
  behind `nextAttemptAt` and the waiter times out. Verify with a test before fixing.
- **Done when**: a unit test for "explicit retry after a failed attempt issues the push within the
  wait", and the CHECKOUT101 daily series drops once the fix is on the CDN bundle. Split the
  remaining events by `context.error`: `write-deferred (401)` is bug 2, `write-rejected` with POST
  404 is a store without the v2 push route (not ours).

### 2. Orders stuck behind a 401 for days, retried once a minute (AUTH101 / 2NS, plus 2J0)

- **What merchants see**: nothing, which is the problem. Sales sit in the outbox; the till keeps
  working for reads.
- **Evidence**: AUTH101 push failures went from ~10 a day to 300–1,500 a day from 09-23. Two
  Electron installs produced ~4,000 events over three and six days, retrying the same five or six
  orders every drain. 42 installs in total, 10 on Electron carry 90 % of it. monorepo#2181
  (1.10.19) holds a 401'd order for re-auth instead of dead-lettering it, and the once-a-minute
  retry noise was knowingly left. Nothing surfaces a re-login to the merchant.
- **Where**: `write-drain-lane.ts` (`write-deferred` at ~line 669), the HTTP client's 401 handler
  in `packages/hooks/src/use-http-client/` (`request-state-manager.ts` has the auth-failed state).
  Related open ticket: monorepo#2014 (cashier/N returns 401 on otherwise-working installs).
- **Done when**: a held-for-re-auth outbox shows the cashier a re-login prompt with the count of
  waiting sales, the retry is capped or backs off, and one Sentry event per hold rather than per
  attempt.

### 3. Push answered 2xx with no document is treated as a failure (SYNC321 / 2QK, 2P8, 2VN)

- **Evidence**: 2QK: `push failed (HTTP 201: no-document)`, 23 events, 3 installs; 2P8: the same
  with HTTP 200, 1 install; 2VN: HTTP 202 on every endpoint for one store (a host-level challenge
  page, not ours). On 201 the server created the order and the till records a failure, so the
  next attempt can create it twice. Money path, small volume.
- **Where**: the push response parsing in `packages/sync-engine/src/write-path/` (search
  `no-document`). Find out what the body was (the plugin's push route in
  `wcpos/woocommerce-pos` `includes/API/V2/`), then either tolerate a 201 whose body is a bare id
  or a notice-prefixed JSON, or reconcile by `mutationId` on the next pull before re-creating.
- **Done when**: a 201/200 with an unusable body never leads to a second create of the same order.

### 4. Offline or backgrounded app crashes the order screen and aborts the token refresh (CLIENT151 / 2TF, 2TP; CLIENT999 / 2M1)

- **Evidence**: 2TF `Error: No internet connection`, 17 events, 5 installs, new 09-27, thrown from
  `use-order-refunds.ts` into the error boundary (`wcpos.app.error-boundary`, component stack
  `RefundsSection`). 2TP `App is in background` lands in the same boundary. 2M1 `Error handler
  token-refresh threw an error: App is in background` on 29 installs: a 401 that arrives while the
  app is asleep stops the refresh chain (`willStopChain: true`).
- **Where**: `packages/hooks/src/use-http-client/request-state-manager.ts` `checkCanProceed()`
  (lines ~242–262) rejects with those two reasons; the refunds hook wraps `http.get` in a suspense
  observable so the rejection reaches the boundary. The order view is
  `packages/core/src/screens/main/orders/view/sections/refunds.tsx`.
- **Done when**: offline and asleep render an offline state in the refunds section (not the
  boundary), and a 401 during sleep is retried when the app wakes rather than ending the chain.

### 5. Desktop storage corruption cluster is still live on 1.10.27 / 1.10.28 (2JJ, 2R2, 2JH, 2JZ, 2KB, 2N6, 2MB, 2W3)

- **Evidence**: six Windows installs produce most of: `rxdb-fs index-rebuilt` (2JJ, 2,127 events
  on 1.10.27, reason `stale-changelog-op`), `document-repair-refused` (2R2, `no-valid-document`),
  `cleanup-recovery` (2JH), plus the renderer-side `Storage remote method error in cleanup /
  bulkWrite` (2JZ, 2KB: JSON parse errors on `existenceManifest` and order rows). On web the same
  cleanup failure hit 45 installs on 1.10.24. One Android install (1.10.18 (28)) now crashes the
  Ledger screen on it (2W3, `JSON Parse error … targeted recovery failed … missing-primary-row`).
- **Where**: `wcpos/electron` `src/main/opfs-targeted-recovery.mjs`, `src/main/rxdb-storage-telemetry.ts`;
  the repair-and-retry is electron#460 / monorepo#2114 (merged 09-16). The 1.10.24 search-index
  rebuild (#2199) worked: `Failed to initialize search` fell from 249 events on 1.10.23 to under
  20 on 1.10.24. Read the electron repo's own notes on this class before touching it; it is the
  longest-running defect family and has rulings (web `multiInstance` stays `true`).
- **Done when**: a repair refusal has a next step (quarantine and re-pull the row) instead of
  refusing forever, and the Android error boundary case does not take the Ledger screen down.

## Dropped on purpose (do not file)

- **Server totals differ** (CHECKOUT401 / 2HX): of 50 recent events, 31 are the rounding class the
  1.10.25 train fixes (#2333/#2344); 17 are one store whose till computes zero tax, a store tax
  setup the till does not model, not a bug. monorepo#1875 is the home for the real classes.
- Plugin one-offs: a PrintNode 403 logged 183 times from one store (2V7); `FUNCTION corporate.MD5
  does not exist` on one host's digest rebuild (2V9/2V8); one PHP fatal that is a mid-upgrade
  autoload miss (2VS). Old-bundle issues (Y5, XR, 167) are 1.7–1.9 clients.
- Noise worth cutting in the Sentry sink if you touch it: a Sentry event per failed tick (2J4,
  HTTP 520/401, 174 installs), browser-extension errors (MetaMask 2JD, `frame_ant` 2TG), and
  SYNC401 `engine.lane.tick` rows that are plain `Failed to fetch (host)`.

## The standing loop, after the five

Once a day (or `/loop 6h`), run the per-release query for the current `wcpos-app@`, `WCPOS@` and
`wcpos-php@` releases over 24 h and the `firstSeen:-24h` list. Act on:

- any new issue with 3+ installs, or any `fatal` on `wcpos-php@`;
- any code whose daily series doubles against the prior week;
- CHECKOUT101, AUTH101 and the storage family above — report their daily count against the
  numbers in this doc so a shipped fix is judged by the metric, not by the PR being green.

For each: one PR on the right repo's `main`, evidence from Sentry in the PR body (short id, counts,
the sampled cause split), and a validation plan that names the Sentry series that must move. A
finding is a PR or an explicit drop with the reason; never a parking-lot ticket. Ask Paul one
question at a time, only for what Sentry, `gh` or the code cannot answer.
