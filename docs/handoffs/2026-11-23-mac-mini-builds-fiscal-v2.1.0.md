# The Mac mini builds v2.1.0 fiscal compliance (#640) behind permissions: standing handoff

**Date:** 2026-11-23. **Map:** [Fiscal compliance for France and Spain (v2.1.0)](https://github.com/wcpos/roadmap/issues/640). **Contract:** `docs/specs/2026-11-23-fiscal-compliance-v2.1.0-spec.md`. **Owner from here:** the Mac mini's Claude, the same session that owns the permissions build (`docs/handoffs/2026-11-22-mac-mini-builds-permissions-v2.2.0.md`). **Why this file:** the decisions are made except the attestation; what is left is sixteen landing tickets whose order is held by blocking links, built in the gaps of the permissions build and then after it.

The line to add to the mini's prompt is at the end.

## How this runs beside permissions

This is the session's plan, described to Paul on 2026-11-23; it is not recorded as his ruling.

- **One builder, one queue.** Permissions (#599) comes first. Take a fiscal ticket only when permissions has nothing takeable: every open permissions ticket is claimed, blocked, or waiting on checks, review or Paul.
- **The tracker holds the order.** Take the first open, unblocked, unclaimed `ready-for-agent` ticket under #640, in the order of the table below. Never start a blocked ticket, whatever the reason looks like.
- **Never two builds at once.** One suite at a time; a fiscal PR and a permissions PR may both be open, but only one is being built or tested at any moment.
- **Same lane as permissions:** `next` in wcpos/woocommerce-pos, wcpos/woocommerce-pos-pro and wcpos/monorepo. Sync `main` into `next` per repo before each slice. Live evidence comes from dev-next only.

## Tickets

| Order | Ticket | What | Blocked by |
|---|---|---|---|
| 1 | #669 | Fiscal 1: the chaining engine | nothing; takeable now, ships dark |
| 2 | #670 | Fiscal 2: till codes and series | #669 |
| 3 | #671 | Fiscal 3: the store receives, verifies and reports | #669, #670, and permissions #625, #626, #627 |
| 4 | #672 | Fiscal 16: completion can wait for an outside answer | #671 |
| 5 | #673 | Fiscal 4: after-issue records | #671 |
| 6 | #674 | Fiscal 5: closures and the running total | #671 |
| 7 | #675 | Fiscal 6: the event log | #671 |
| 8 | #677 | Fiscal 8: the receipt block | #670 |
| 9 | #676 | Fiscal 7: archive, export and verifier | #674, #675 |
| 10 | #678 | Fiscal 9: switching on and off | #671, #673 |
| 11 | #679 | Fiscal 10: France-only items | #678 and the French professional (#659) |
| 12 | #680 | Fiscal 11: Spanish records and the QR | #669, #677, #672 |
| 13 | #681 | Fiscal 12: the certificate and till signing | #678 and the Spanish adviser (#646) |
| 14 | #682 | Fiscal 13: VERI\*FACTU submission | #680, #681 and a test certificate (#668) |
| 15 | #683 | Fiscal 14: the non-reporting mode | #680, #681, #675 |
| 16 | #684 | Fiscal 15: merchant docs | #678 |

Three tickets are Paul's and are not for the mini: #646 and #659 (written answers from outside professionals; the question sheets are `docs/research/2026-11-23-questions-for-a-spanish-tax-adviser.md` and `docs/research/2026-11-23-questions-for-a-french-tax-professional.md`) and #668 (a certificate for the tax agency's test environment). #657, the attestation and declaration decision, waits on the first two.

## Rules that bind every fiscal PR

- **The spec is the contract.** It restates rulings and links each to its ticket; the ticket's resolution is the ruling. Never re-decide a closed ticket. If the spec is unclear, that is the one question for the night.
- **A line marked `assumed:` in the spec** is the charting session's choice of a constant or a format. It may be changed with the reason stated in the PR. A line without that mark is ruled.
- **What lives where** (Paul): "We have to be careful what is stored in the POS, and what is stored on the server. The POS data can be deleted at any time, or a new device, etc." A till holds only what it needs to keep selling. Every PR that puts state on a till says what happens when that state is gone.
- **An issued record is never changed.** Upgrades never rewrite or re-hash an existing record; payload formats are versioned inside each record. A chain breaking on upgrade is the failure every comparable product has had in public.
- **Two engines, one answer.** The app and the plugin must produce byte-identical hashes for the shared test vectors, forever. A change to either engine that changes a vector's output is refused.
- **France and Spain, not "fiscal mode".** No offline limit, the store holding the certificate, the store making closures and a sale completing locally at once are per-country settings. No screen, string or doc states them as rules of fiscal mode (spec §20).
- **The engine is in Free and the app; switching a country on needs Pro** (#656). A lapsed licence never switches a mode off.
- **Scope is France and Spain** outside the Basque Country and Navarre. Spec §18 lists what is out. Seam 1 (Fiscal 16) is built and used by no country.
- **Where a ruling met Spanish law, the spec follows the law** and says so in that section (separate chains for events and closures, the QR's place, corrective invoices). Build the spec's text.
- **Secrets:** a merchant's certificate and its private key never appear in a repo, a ticket, a PR, a log or a test fixture. Tests use generated throwaway certificates.
- **PR laws as for permissions:** worktrees, 600 added production lines per PR, no stacked PRs, no new env vars, no `--no-verify`, one suite at a time with `--maxWorkers=2`, review loop ends at round 5, failing test first. Green, walked two-way PRs merge under standing authority; one-way PRs wait for Paul.
- **Claims and reporting as for permissions:** `claimed:mini` plus assignee; one comment per ticket touched with what was walked and the four headings, then `Safe to exit`. Questions for Paul go on the Mac mini board (#561), one per night, with options and a recommendation. A defect not fixed goes under Dangling, never Found.

## What is not decided

- **The attestation and declaration (#657).** Nothing in the build waits on it except Fiscal 10.
- **France itself.** From 1 January 2027 the French rule moves to the CIBS and its wording names only a certificate. If the French professional (#659) says the publisher's attestation no longer counts, the destination for France is redrawn. Only Fiscal 10 is France-only; everything else is shared or Spanish and is unaffected.
- **Proof of submission.** Without the certificate from #668, Fiscal 13 can only be proven against recorded responses, and its PR must say so.

## The line to add to the prompt

```text
Second map, lower priority: wcpos/roadmap#640, v2.1.0 fiscal compliance. Read docs/specs/2026-11-23-fiscal-compliance-v2.1.0-spec.md and docs/handoffs/2026-11-23-mac-mini-builds-fiscal-v2.1.0.md in wcpos/roadmap. Take a fiscal ticket only when permissions (#599) has nothing takeable; then take the first open, unblocked, unclaimed ready-for-agent ticket under #640 in the handoff's order, never a blocked one. Same lane (next), same PR laws and reporting as permissions. #646, #659, #668 and #657 are Paul's, not yours.
```
