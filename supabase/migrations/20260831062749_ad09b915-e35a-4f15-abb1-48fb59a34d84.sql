DROP TRIGGER invoice_terms_no_change ON public.invoice_terms;
CREATE TRIGGER invoice_terms_no_change
  BEFORE UPDATE ON public.invoice_terms
  FOR EACH ROW EXECUTE FUNCTION public.invoice_terms_immutable();