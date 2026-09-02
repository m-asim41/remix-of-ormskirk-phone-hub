# Daily Sales & Expenses — apply migration

Your SQL is almost complete. The helper functions it relies on (`require_staff`, `is_staff`, `is_manager`, `log_audit`) all exist, and neither `expenses` nor `daily_sales` exists yet, so the migration is safe to apply.

## What is missing in your version

1. **Table GRANTs** — the most important gap. Without `GRANT` statements the app gets a permission error even with RLS policies in place. Needed for both tables:
   - `GRANT SELECT, INSERT, UPDATE ON public.expenses TO authenticated;`
   - `GRANT ALL ON public.expenses TO service_role;`
   - same pair for `public.daily_sales`
   - no `anon` grant (both tables are staff-only)
2. **updated_at trigger** — both tables have `updated_at`, but only the RPCs set it. A direct row update would leave it stale. Add the existing `update_updated_at_column()` trigger to both tables.
3. Everything else (indexes, RLS, policies, four RPCs, function EXECUTE grants) is correct as written and will be applied unchanged.

## What will be applied

- Tables `public.expenses` and `public.daily_sales` with your exact columns and checks
- Indexes on date / status / staff name
- RLS on, with staff read+insert and manager-only update policies
- RPCs `save_daily_sale`, `void_daily_sale`, `save_expense`, `void_expense` (staff can create, managers can edit/void, all audit-logged)
- Function EXECUTE revoked from public/anon, granted to authenticated and service_role
- Plus the two additions above (table grants, updated_at triggers)

## After the migration

Verify the tables answer through the app API, then the `/admin/daily-sales` and `/admin/expenses` screens can read and write. No frontend changes are part of this step.
