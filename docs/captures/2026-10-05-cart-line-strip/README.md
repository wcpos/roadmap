# Cart line strip — the captures walk (2026-10-05)

wcpos/monorepo#2377 at `b4aa90f93`, shot by a temporary Playwright spec against a local Metro of the branch and dev-next: tablet (1024×768) and phone (390×844) in light and dark at the regular scale, plus a desktop run with a mouse (1280×800) for the hover peek, which exists only on fine pointers. Eleven PNGs. The store's locale is Spanish, so Edit and Remove read *Editar* and *Eliminar*.

| File | What it shows |
|---|---|
| `tablet-light-regular--cart-with-lines.png` | The row at rest |
| `tablet-light-regular--line-strip-revealed.png` | The strip after a tap on the total: Edit a solid grey block, Remove a solid red one, square, flush to the row's right edge, as tall as the row (here a taller row, with the struck regular price) |
| `tablet-dark-regular--cart-with-lines.png`, `tablet-dark-regular--line-strip-revealed.png` | The same in the dark theme |
| `phone-light-regular--cart-with-lines.png`, `phone-light-regular--line-strip-revealed.png` | The phone: the blocks at the same height as the row, the name and quantity slid off to the left |
| `phone-dark-regular--cart-with-lines.png`, `phone-dark-regular--line-strip-revealed.png` | The phone in dark |
| `desktop-light-regular--total-hovered.png` | A mouse resting on the total: the row sits 16 px left and a sliver of the red block shows there is something underneath |
| `desktop-light-regular--cart-with-lines.png`, `desktop-light-regular--line-strip-revealed.png` | Desktop at rest and revealed |

The strip's motion (the bounce, the no-flicker hover, the opened strip staying put under the pointer) is in the PR's per-frame film figures, not here.
