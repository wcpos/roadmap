<!-- judge: gpt-6.1-sol -->
SYSTEM BREAK: V3 r0v3 — baseline Access and system Checkout checked checkboxes read `#3858e9`, while V3 checked checkboxes read `#007cba`.

| Category | Baseline Access | Ref: StackAI | Ref: Twenty | Ref: Zoho | System: Checkout | System: General | V3 r0v3 | V3 r2 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hierarchy | 7.5 | 8 | 8 | 7.5 | 8 | 8 | 8 | 8 |
| Typography | 8 | 8 | 8 | 8 | 8 | 8 | 7.5 | 8 |
| Spacing and alignment | 8 | 8 | 8.5 | 8 | 8 | 8 | 8 | 8 |
| Colour and contrast (light) | 8 | 8 | 7.5 | 7 | 8 | 8 | 8 | 8 |
| Colour and contrast (dark) | — | — | — | — | — | — | — | — |
| Iconography and indicators | 7.5 | 8 | 8 | 7.5 | 8 | 7.5 | 7 | 8 |
| Consistency | 9 | 8 | 8 | 7.5 | 9 | 9 | 5 | 9 |
| Clarity for the person in the brief | 5.5 | 5 | 5.5 | 5.5 | 7.5 | 7.5 | 7 | 8 |
| Density | 7 | 7 | 8 | 7.5 | 7.5 | 8 | 8 | 8 |
| States covered | 2.5 | 2 | 2.5 | 2 | 2 | 2 | 8 | 8.5 |
| **Average (applicable categories)** | **7.00** | **6.89** | **7.11** | **6.72** | **7.33** | **7.33** | **7.39** | **8.17** |

### V3 r2

1. **`shots/v3-desktop-light-part02.png`, `shots/v3-desktop-light-part03.png` — States covered.** Open tooltips obscure the Customers checkbox/name and the cost row’s name, hiding the state they explain. **Smallest fix:** position each tooltip below its row, keeping the subject and checkbox visible.

2. **`shots/v3-desktop-light-part02.png` — Clarity.** Customers help says “The only stronger limit is See customer contact details.” That overstates a permission concerning contact details; separate controls also restrict adding and editing customers. **Smallest fix:** replace that sentence with “To withhold contact details, switch off See customer contact details.”

3. **`shots/v3-desktop-light-part03.png` — Clarity.** In the partial state, “Products 3 of 7 on” and Edit products’ “3 of 7” describe different things with nearly identical notation: task rows versus underlying permissions. **Smallest fix:** make the group summary explicit: “3 tasks fully on · 1 partial”; retain the existing row marker and Review link.