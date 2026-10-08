# Declared UI in the tender pane — 2026-10-09 (roadmap#419)

`mockup-*` are the two new Jump states on `../../index.html` (*Email invoice*, *Invoice sent*).
`app-*` are the real web app (monorepo `feat/declared-ui-tender`) against Free `next` 5594a603 with
wcpos/email-invoice-gateway c74498c, walked by Playwright at 1280×720 and 390×844:
`invoice-empty` (guest order, required email empty: the commit holds and names the field),
`invoice` (email typed, checkbox ticked, *Send invoice · $25.00*), `sent` (the neutral sent moment).
