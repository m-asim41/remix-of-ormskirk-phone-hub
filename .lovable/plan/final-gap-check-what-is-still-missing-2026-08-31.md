# Final gap check — what is still missing

Almost everything from the production-readiness list is now done: security scan + fixes, refunds/returns, day-end cash-up, sitemap + robots, low-stock dashboard widget, invoice terms/messages, POS polish. Only a few small items remain.

## What is confirmed already done (verified in code)
- Refunds (`refund_invoice` RPC + manager-only Refund dialog on invoice detail)
- Day end & cash up screen with CSV export
- Low-stock alerts on admin dashboard (`lowStockProducts` widget)
- Sitemap route + robots.txt
- Security findings fixed and recorded
- Password reset flows, auth gating, HIBP protection, public signups disabled

## Remaining work (this plan)

1. **One-click CSV backup/export**
   Currently only Day End has CSV export. Add export buttons so the shop is never locked in:
   - Reports screen: export invoices (date range), payments, and stock/handsets to CSV
   - Customers screen: export customer list to CSV

2. **Business settings sanity pass (with Altaf)**
   Verify in Settings before go-live: VAT number, company registration, invoice number prefix, opening hours, bank/payment details, WhatsApp number — everything printed on invoices must be correct.

3. **Staff accounts for real use**
   Create the actual counter staff logins and assign roles on the Staff screen. Confirm each role only reaches the screens it should (STAFF/TECHNICIAN cannot refund or change settings).

4. **Final live counter QA**
   One real pass of: repair, buy, sell, direct sale, part payment, refund, day-end — plus printing on the actual 80mm printer.

5. **Publish**
   After the above, publish the site.

## Technical notes
- CSV export reuses existing `downloadCsv` from `src/lib/admin/csv.ts`; queries already exist in `src/lib/admin/queries.ts` (invoices, payments, stock, customers) — this is UI wiring only, no database changes.
- Staff accounts are created via the auth sign-up + Staff screen role assignment; no code change needed unless a role check is found wrong during QA.

## Suggested order
CSV export → settings sanity pass → staff accounts → counter QA → publish.
