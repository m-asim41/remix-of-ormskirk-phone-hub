# Plan: Apply Daily Sales & Expenses migration

## Goal
Create the `daily_sales` and `expenses` tables (with RLS) so the existing counter screens (`/admin/daily-sales`, `/admin/expenses`) go live.

## Steps
1. Create `daily_sales` table — entry_date, staff_name, cash_sale_pence, card_sale_pence, description + RLS (authenticated select/insert).
2. Create `expenses` table — entry_date, category, description, amount_pence + RLS (authenticated select/insert/update).
3. Enable RLS on both tables with staff-only policies.
4. Verify inserts/updates work through the existing app screens.

## Notes
- Migration runs as a single transaction; rollback on any failure.
- No changes to existing invoices/stock data.
