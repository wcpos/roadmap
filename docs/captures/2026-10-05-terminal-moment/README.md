# The terminal moment — captures of monorepo#2393 at c7856d05a

Shot 2026-10-05 on the PR's preview deploy (`wcpos--3t51p6rd9h.expo.app`) against dev-next's
simulated terminal, tablet 1024×768 and phone 390×844, light. Design: the chosen option A in
`../../prototypes/2026-10-05-terminal-log-mockups/README.md`.

| State | Tablet | Phone |
|---|---|---|
| Keypad: the To pay row as in the mockup | `tablet--keypad.png` | `phone--keypad.png` |
| Terminal selected | `tablet--keypad-terminal.png` | `phone--keypad-terminal.png` |
| On the terminal: horizontal stepper, latest line | `tablet--on-terminal.png` | `phone--on-terminal.png` |
| Details open while live | `tablet--on-terminal-details.png` | `phone--on-terminal-details.png` |
| Cancelled from the till: grey minus, node marked | `tablet--cancelled.png` | `phone--cancelled.png` |
| Declined: red cross at the ring's size, node marked | `tablet--declined.png` | `phone--declined.png` |
| Declined, Details open: rows, ids, Copy | `tablet--declined-details.png` | `phone--declined-details.png` |

The phone session is in the store's Spanish for the keys that already existed (the language pin
needs the rail, which the phone layout does not have); the new keys show their English fallback
until the translations bundle carries them. Not captured: the saving pane (transient) and the
physical Solo (the hardware run is on roadmap#231).
