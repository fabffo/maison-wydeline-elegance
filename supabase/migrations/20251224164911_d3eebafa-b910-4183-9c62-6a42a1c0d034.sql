-- ============================================
-- PROMO CODES SYSTEM
-- ============================================

-- 1) Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed', 'free_shipping')),
  value NUMERIC,
  min_cart_amount NUMERIC,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit_total INTEGER,
  usage_limit_per_email INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Create promo_assignments table
CREATE TABLE IF NOT EXISTS public.promo_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Modify newsletter_subscribers - add missing columns
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ;

-- 4) Modify email_logs - add missing columns for newsletter logging
ALTER TABLE public.email_logs
  ADD COLUMN IF NOT EXISTS template_key TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS related_table TEXT,
  ADD COLUMN IF NOT EXISTS related_id UUID;

-- 5) Enable RLS on new tables
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_assignments ENABLE ROW LEVEL SECURITY;

-- 6) RLS Policies for promo_codes (admin/backoffice only)
CREATE POLICY "Admin and backoffice can manage promo codes"
ON public.promo_codes
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7) RLS Policies for promo_assignments
CREATE POLICY "Admin and backoffice can view promo assignments"
ON public.promo_assignments
FOR SELECT
USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

CREATE POLICY "Service role can insert promo assignments"
ON public.promo_assignments
FOR INSERT
WITH CHECK (true);

-- 8) Create updated_at trigger for promo_codes
CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Insert default promo code for newsletter welcome
INSERT INTO public.promo_codes (code, label, type, value, is_active, usage_limit_per_email)
VALUES ('WYDELINE10', 'Bienvenue -10%', 'percent', 10, true, 1)
ON CONFLICT (code) DO NOTHING;