-- Staff (signed-in) access, matching existing policies
GRANT SELECT, INSERT, UPDATE ON public.business_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT SELECT ON public.stock_items TO authenticated;
GRANT SELECT ON public.stock_movements TO authenticated;
GRANT SELECT ON public.invoices TO authenticated;
GRANT SELECT ON public.invoice_items TO authenticated;
GRANT SELECT ON public.invoice_terms TO authenticated;
GRANT SELECT, UPDATE ON public.invoice_terms_settings TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.sales TO authenticated;
GRANT SELECT ON public.sale_items TO authenticated;
GRANT SELECT ON public.repair_invoices TO authenticated;
GRANT SELECT ON public.phone_purchases TO authenticated;
GRANT SELECT ON public.phone_purchase_items TO authenticated;
GRANT SELECT ON public.customer_ledger_entries TO authenticated;
GRANT SELECT ON public.supplier_ledger_entries TO authenticated;
GRANT SELECT ON public.doc_sequences TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.website_enquiries TO authenticated;

-- Public website (anonymous) read access, matching existing public policies
GRANT SELECT ON public.business_settings TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.product_categories TO anon;
GRANT SELECT ON public.repair_services TO anon;
GRANT SELECT ON public.customer_reviews TO anon;
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT ON public.stock_items TO anon;
GRANT INSERT ON public.website_enquiries TO anon;

-- Backend / admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
