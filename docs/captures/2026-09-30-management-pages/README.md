# Management pages — consistency sweep captures (2026-09-30)

Live shots from the sweep after the Orders (monorepo#2285), Customers + Coupons (#2293) and Products (#2298) switches landed on `next`. Each PNG is the evidence for one follow-up PR.

| File | What it shows | PR |
|---|---|---|
| `customers-tablet-dark-false-empty-before.png` | "No customers yet" beside *Showing 0 of 5,454* with the sync spinner turning — before | monorepo#2310 |
| `orders-tablet-headers-truncate.png` | Orders at 1024 in Spanish after the fix: "NÚMERO…", "FECH… ▾", "MÉTODO…" truncate instead of running into the neighbour | monorepo#2314 |
| `coupons-phone-status-sheet-before-after.png` | Phone, Coupons status chip open: before (scrim only, sheet below the fold) / after (sheet rises from the bottom) | monorepo#2316 (found by #2312) |
| `phone-lists-four-pages.png` | Orders · Customers · Coupons · Products at 390 px, before #2310 — the shared bar, search row, chip row, row anatomy and footer | — |
