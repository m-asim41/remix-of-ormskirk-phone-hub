# Daily Sales & Expenses — add missing table GRANTs

You ran the migration yourself and it worked: both tables, indexes, RLS policies, all four RPCs (`save_daily_sale`, `void_daily_sale`, `save_expense`, `void_expense`) and the `updated_at` triggers are all in place.

## One problem remains

The SQL you ran had **no table GRANTs**, so the app cannot reach either table — verified in the live database: only my sandbox role has access; the `authenticated` role your staff screens use has none. `/admin/daily-sales` and `/admin/expenses` will show permission errors until this is fixed.

## Small fix migration

Run one GRANT-only migration:

- `GRANT SELECT, INSERT, UPDATE ON public.expenses TO authenticated;`
- `GRANT ALL ON public.expenses TO service_role;`
- `GRANT SELECT, INSERT, UPDATE ON public.daily_sales TO authenticated;`
- `GRANT ALL ON public.daily_sales TO service_role;`

No `anon` grant (both tables are staff-only) and no DELETE (your design uses voiding, not deletion).

## After the fix

Approve and it applies immediately — then both admin screens work for staff and managers as designed.
