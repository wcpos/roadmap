# Split flows — audit (2026-09-17)

The chooser plans the balance that is still owed. It does not take a payment. Each leg then
uses the ordinary method picker and keypad; the last one lands on Paid.

**Observed:** the new flow assertions pass through the real DOM handlers in tablet and phone
modes (jsdom, not a rendered browser). **Unverified:** screenshots, browser errors and visual
fit. Chromium cannot launch in this sandbox. This is a prototype audit, not a payment-provider test.

| # | Flow | How |
|---|---|---|
| 1 | Even, 2–6 ways, any method per leg | Tap a numbered tile, then choose the method for each payment. Taken legs tick. The 2–6 plans sum to the balance in the DOM checks. |
| 2 | Even, more than 6 ways | **More…** opens the pinned − / n / + stepper, bounded at 2 and 20. **Split n ways** applies it. Eight and twenty legs are asserted. |
| 3 | One amount, then the rest | Amount → type the first amount → **Split · £x first**. The rest is the second leg. |
| 4 | One percentage, then the rest | Percent → type the percentage → commit. The label names the balance it is a percentage of. |
| 5 | Three or more unequal shares | Amount or Percent → type → **+ Add share**. Repeat for further shares that leave a remainder, or type one more such share and commit. The final share is the rest. With an empty buffer, commit keeps the accumulated shares plus the rest, not the ghost half. 20 / 30 / rest gives £18.74 / £28.11 / £46.85 on £93.70. Each added chip has ×; removing it returns its allocation. |
| 6 | Items for one payer, the rest for another | Item → tick lines → **Take £x for n items**. This commits the selected amount and the rest; choose the payment method next. |
| 7 | Items for A, items for B, the rest for C | Tick A's lines → **Next payer** → tick B's → **Take £x for n items**. Assigned lines are disabled and show the payer number; × on their draft chip unlocks them. **Next payer** can be repeated for further payers. |
| 8 | A part payment without a plan, then split | Type and take the part payment, then Split. The label reads **SPLIT · £73.70 LEFT** after £20 of £93.70. Even tiles divide £73.70; the taken chip stays ticked. |
| 9 | Change the plan after a payment | **Change split** re-plans only the remaining balance. Taken payments stay ticked and have no remove button in the chooser. |
| 10 | Undo the plan before taking anything | **No split**, beside Done, clears the plan and returns to the plain keypad. It is absent once a payment has been taken. |
| 11 | Cancel the last taken payment | **Cancel payment** in the pay head removes the last taken payment; that amount becomes pending again. The sum is asserted after cancellation. |
| 12 | A cash leg with change | Cash tendered above a planned leg is change for that leg: £50 against a £46.85 leg records £46.85 taken and £3.15 change, and the plan holds. Cash above the whole remaining balance gives change the same way. A method without change (card, a terminal) above the leg pays more instead (flow 13). Asserted. |
| 13 | Take more than planned | Type the larger amount and Take. Pending legs shrink or drop; the plan still sums to the total. Asserted at £70.28 against a £46.85 leg. |
| 14 | Take less than planned | Type the smaller amount and Take. The shortfall returns to pending legs. Asserted at £23.43 against a £46.85 leg. |
| 15 | Terminal declined or cancelled | **Cancel on terminal** now returns to the keypad, clears the in-flight amount and leaves the plan untouched. Cancellation is asserted. A real decline is not simulated by this prototype and was not tested. |
| 16 | Every leg on the same method | Pick Card for both legs; both payments are recorded as Card and the sale completes. |
| 17 | Last leg completes the sale | Taking the last leg shows Paid; the tablet ledger says **Paid in full**. Both are asserted. |
| 18 | Odd pennies in an even split | Divide in pennies: on £93.70 split eight ways, the first two legs are £11.72 and the other six £11.71. The sum is asserted. |
| 19 | Percentage rounded to a penny | 33 % of £93.70 becomes £30.92; the rest is £62.78. Both values and their sum are asserted. |
| 20 | Split on the phone | The same controls and flow assertions run in phone mode; the ledger is not drawn. Chips scroll sideways rather than adding rows. Browser fit at compact and regular remains unverified. |

Amount quick keys and the ghost half use the unallocated balance. Percent quick keys remain
percentages of the balance being split, not percentages of the shrinking rest; choices that
would leave no remainder are disabled. Done / × leaves the chooser; use its commit to apply a draft.

The capture script retains its earlier blocks and adds `split-three-percent-tablet` and
`split-three-percent-phone`, plus the multi-leg fit assertions. Those captures have not been
regenerated here; see [the verification report](SPLIT-FLOWS-REPORT.md).
