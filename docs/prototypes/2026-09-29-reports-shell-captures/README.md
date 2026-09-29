# Reports Sales room, PR 1 of 4 — the shell, walked (2026-09-29)

Captures of wcpos/monorepo#2238 (wcpos/roadmap#332 PR 1: the bar, the date button and picker, the Free scope lock) taken from a local `expo start --web` of the branch against dev-next with a throwaway Playwright walk, light theme, the demo cashier (Spanish locale). File names are `<width>-light-<plan>-<state>.png`: widths tablet 1024×768, phone 390×844, desktop 1440×900; plans `pro` and `free`.

States: `today` (the room as opened), `date` (the picker open), `date-locked` (Free: a locked quick range tapped, the hint and See Pro inside the picker), `day-locked` (Free: yesterday's calendar day tapped, same hint), `scope` (the register and store menu open), `closures` (the Closures room through the link), `back` (Sales again through the bar's arrow).

The body under the head (pills, chart, orders table, summary) is the 1.10 page; PR 2 and PR 3 replace it. The bar and picker on `next` at the time of the walk needed wcpos/monorepo#2236 and #2237 to boot and to draw phone sheets at all; those fixes were applied locally for the walk.


## PR 1b — the till strip (`till-strip/`)

Same walk for wcpos/monorepo PR 1b: `<width>-light-<plan>-<state>.png` under `till-strip/`, states `today`, `closures`, `back`. The tablet and desktop legs opened the register through the POS first (a real session on dev-next), so the strip shows its open state with the float and the expected chip; the phone and Free legs ran in fresh browser contexts and show the same session as the server reports it (the other-device case). No closure exists on that register, so the closed state is covered by the jest fixtures only.
