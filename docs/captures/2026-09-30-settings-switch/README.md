# Settings switch — the captures walk (2026-09-30)

Screen switch 10 (wcpos/roadmap#398, wcpos/monorepo#2343 at `86ccb41b9` (the independent-review fix head; `e726820b4` after it touches only Health's rail)), shot by `apps/main/e2e/settings-captures.spec.ts` against a local Metro of the branch and dev-next: 12 device × theme × scale combos, all passing, 102 PNGs. These fourteen are the representative set; the rest are reproducible from the spec (`CAPTURES=1`). The store's locale is Spanish, so labels read in Spanish; the new keys (Saved, the Restore title, the address link) show in English until the translation bundle carries them.

| File | What it shows |
|---|---|
| `tablet-light-regular--general.png` | The area on the shared bar (Configuración · bell); the rail as a quiet list with the selected surface; the frameless page; sentence-case section labels; the four address rows as mirrored values with the note and the link |
| `tablet-light-regular--general-saved.png` | After typing into the store name: **✓ Saved** under the control's right edge, out of flow — the row did not move |
| `tablet-light-regular--general-restore.png` | Restore server settings asks first |
| `tablet-light-regular--tax.png` | Tax's four locked rows through the shared `LockedRow`, unchanged in look |
| `tablet-light-regular--printing.png` | Printers and templates once the cloud lookup settles (the list renders nothing for up to 2 s, pre-existing) |
| `tablet-light-regular--theme.png` | Flat tiles, the selected one outlined with a check; Scale as a segmented control on one labelled row |
| `tablet-light-regular--barcode-scanning.png` | Barcode scanning on the restyled primitives |
| `tablet-dark-regular--general.png`, `tablet-dark-regular--theme.png` | The dark theme |
| `tablet-light-compact--general.png`, `tablet-light-spacious--general.png` | The scale steps |
| `phone-light-regular--index.png` | The phone index: the bar with the hamburger, bell and avatar over the six rows |
| `phone-light-regular--general.png` | A phone leaf: **‹ Configuración · General** in one bar, the page beneath |
| `phone-dark-regular--theme.png` | The phone leaf in dark |

Found on the walk and fixed on the branch: `fill()` in the spec reverted the edit (the form's reactive `values` re-bind; the spec types instead); the same re-bind echoes a change per normalised field and stole the Saved mark (`savedKeys`; the echo writes themselves are wcpos/monorepo#2349); Scale read twice (the section title and the row label; now one row).
