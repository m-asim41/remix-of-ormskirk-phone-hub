# Full database export (CSV) — all live data

You are moving to your own Supabase project, so you need a complete copy of the live data. This exports every table as a CSV file (standard format Supabase can import), bundled into one downloadable zip.

## What gets exported (all 29 tables)

- **Money / documents:** invoices, invoice_items, invoice_terms, invoice_terms_settings, payments, sales, sale_items, repair_invoices, phone_purchases, phone_purchase_items, doc_sequences
- **People:** customers, customer_ledger_entries, suppliers, supplier_ledger_entries, profiles, user_roles
- **Stock:** products, product_categories, product_images, stock_items, stock_movements
- **Daily ops:** daily_sales, expenses
- **Website:** repair_services, faqs, customer_reviews, business_settings, website_enquiries, audit_logs

Each becomes one `.csv` with headers, and all files are zipped into `db-export.zip` you can download and import into your new Supabase project.

## Notes for importing to your own Supabase

- `user_roles` links users to roles by user ID — the user IDs will differ in your new project, so re-assign your OWNER role there after creating your account.
- `profiles` likewise references auth user IDs from this project.
- Everything else (invoices, stock, customers, expenses, website content) imports as-is.

## What is NOT exportable this way

- Auth user accounts (emails/passwords) — Supabase does not expose password hashes through SQL. You'll need to re-create user accounts in your new project.
- The database functions (save_expense, take_payment, direct_sale, etc.) — if you want the full SQL definitions of all functions and RLS policies to recreate the backend in your project, say so and I'll export those too.
