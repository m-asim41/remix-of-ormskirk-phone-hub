# Expenses page + how the current reports work

## Part 1 — How your report system works today

You have two reporting screens.

### Reports (`/admin/reports`)
Pick a period (7 / 30 / 90 days or a custom From–To). Everything below recalculates for that period. Voided records are excluded.

Top four cards:
- **Total revenue** — repair totals + sale totals in the period.
- **Gross profit** — repair revenue + (sales revenue − cost of the items sold). It is a *gross* number: no rent, wages, bills or other running costs are deducted, because the system has nowhere to record them yet.
- **Spent buying phones** — what you paid customers/suppliers for handsets in the period.
- **Owed by customers** — unpaid repair balances.

Tables:
- **Where the money came from** — repairs vs sales, minus cost of items sold, ending in gross profit.
- **Payments taken by method** — cash / card / bank / other split of money received.
- **Stock ageing** — phones in stock grouped 0–30, 31–60, 61–90, 90+ days, with cost value. Tells you what is sitting too long.
- **Most common repairs** — top faults by job count and revenue.
- **Products to reorder** — accessories at or below their reorder level.
- **CSV exports** — Invoices, Payments, Stock for the chosen period.

### Day end (`/admin/day-end`)
One single day. Shows takings in, money paid out, net, refunds, a per-method breakdown, and the **expected cash in drawer**. You type the counted cash and it shows the variance (over/short) for closing the till.

### What the reports cannot tell you today
- True net profit (no running costs recorded).
- Where cash goes out other than phone purchases and refunds.
- Monthly cost trends (rent, wages, parts bought, phone bill, van fuel, etc).

That gap is exactly what the Expenses page fills.

## Part 2 — Expenses page

### Database
New table `public.expenses`:
- `id`, `expense_date`, `category` (RENT, WAGES, UTILITIES, PARTS, STOCK_SUPPLIES, MARKETING, TRANSPORT, SOFTWARE, BANK_FEES, OTHER)
- `description`, `amount_pence`, `payment_method` (CASH / CARD / BANK / OTHER)
- `supplier_id` (optional link), `reference`, `notes`, `recurring` flag
- `created_by`, `created_at`, `updated_at`

Rules: RLS on, GRANTs for `authenticated` + `service_role`, staff can insert/read, only managers (OWNER/ADMIN) can edit or delete. Every change written to `audit_logs`. A `save_expense` RPC (security definer, staff-only) handles insert/update, same pattern as `save_product`.

Optional flag `affects_cash_drawer` (default true for CASH) so day-end can subtract cash expenses from expected drawer.

### New page `/admin/expenses`
- Period filter (same pills as Reports) + category filter + search.
- Stat cards: total spend in period, biggest category, cash spend, count of entries.
- Table: date, category, description, method, supplier, amount, actions (edit / delete for managers).
- **Add expense** dialog: compact one-screen form — date, category dropdown, amount, method, description, optional supplier/reference/notes. Sticky save bar, keyboard-friendly, matching your counter form style.
- CSV export of expenses for the period.
- Sidebar link added under Reports.

### Reports upgrades once expenses exist
- New card **Net profit** = gross profit − expenses in period.
- New table **Expenses by category** for the period.
- "Where the money came from" gains an Expenses line before a Net profit row.
- Day end: cash expenses deducted from expected drawer, plus an "Expenses today" line.

### Technical notes
- Migration creates table + grants + policies + `save_expense` RPC.
- `src/lib/admin/queries.ts` gets `expensesQuery` and expense data folded into `reportsQuery` / `dayEndQuery`.
- New route `src/routes/_authenticated/admin.expenses.tsx` plus `AddExpenseDialog` component reusing existing admin UI primitives.
