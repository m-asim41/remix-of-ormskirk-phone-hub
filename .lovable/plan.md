# End-to-end counter QA + bug hunt

Goal: run the full counter workflow like real staff would, find anything broken, and fix it. No redesign, no new features.

## Confirmed issue already visible

The preview logs show a React hydration mismatch on the public site (header phone link / footer link row render differently on the server than in the browser). It does not break the page visually, but it causes a full client re-render and console errors. First fix in this pass.

## What gets tested, end to end

Each scenario is driven in a real browser against the live app, with the resulting database rows and printed output checked afterwards.

1. New Repair — £79 job, £5 discount, £30 part payment, then settle the balance. Check totals, payment status (PARTIAL then PAID), invoice number, terms/customer message on print.
2. Buy Phone — purchase at £200 with £300 intended resale. Check stock device created, IMEI stored, expected gross profit strip, purchase receipt print.
3. Sell Phone — sell that same device by IMEI. Check stock marked SOLD, profit recorded, sale invoice + warranty message.
4. Duplicate IMEI — attempt to sell the already-sold device; must be blocked with a clear message, not a raw database error.
5. Direct Sale — two products, discount, cash tendered above total. Check change-due display, stock quantities decrement, receipt.
6. Payments — overpayment rejected, payment on a voided invoice rejected, quick-amount buttons and cash change correct.
7. Void — void a finalised sale with a reason; check reversal (stock back in), audit row, and that voided records drop out of dashboard/report totals.
8. Refresh / back-button double-submit on every create form (idempotency).
9. Auth — login, wrong password message, forgot password, reset password, logout, session restore, role gating (staff cannot void or change roles).

## Checks that run alongside

- Print output for all four document types in both A4 and 80mm thermal: no clipping, terms/customer message present, long names and many line items handled.
- Console and network clean on every admin screen (no errors, no failed requests, no missing data).
- No page-level scrollbar on the counter forms at 1366x768 and 1920x1080; mobile pass at 375 and 768.
- Money maths spot-checked against the database in integer pence, and dashboard vs Reports totals compared for the same date range.

## How fixes are handled

Anything found is fixed in the same pass, smallest safe change first: UI/validation issues in the route components, wording in the shared admin UI, and database-side issues only where an RPC genuinely misbehaves. After each batch of fixes the affected scenario is re-run to confirm it passes.

## Report

Closing summary lists every scenario as pass/fail, each bug found with what was changed, and anything that can only be verified with the real thermal printer or real shop data.
