-- Create popup_config table
CREATE TABLE public.popup_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  title TEXT NOT NULL DEFAULT 'Rejoignez le Cercle Maison Wydeline',
  subtitle TEXT NOT NULL DEFAULT 'Chaussures élégantes du 41 au 45, fabriquées au Portugal. Recevez en avant-première nos nouveautés et offres privées.',
  cta_label TEXT NOT NULL DEFAULT 'Recevoir mon avantage',
  rgpd_text TEXT NOT NULL DEFAULT 'En vous inscrivant, vous acceptez de recevoir nos emails. Désinscription en 1 clic.',
  display_delay_seconds INTEGER NOT NULL DEFAULT 10,
  display_scroll_percent INTEGER NOT NULL DEFAULT 50,
  cooldown_days INTEGER NOT NULL DEFAULT 7,
  include_paths TEXT[] DEFAULT NULL,
  exclude_paths TEXT[] DEFAULT ARRAY['/cart', '/checkout'],
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) DEFAULT NULL
);

-- Create popup_incentives table
CREATE TABLE public.popup_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  promo_code TEXT NOT NULL,
  short_desc TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add columns to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
ADD COLUMN incentive_id UUID REFERENCES public.popup_incentives(id) DEFAULT NULL,
ADD COLUMN promo_code TEXT DEFAULT NULL,
ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Rename source to source_path if it exists differently
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscribers' AND column_name = 'source') THEN
    ALTER TABLE public.newsletter_subscribers RENAME COLUMN source TO source_path;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscribers' AND column_name = 'source_path') THEN
    ALTER TABLE public.newsletter_subscribers ADD COLUMN source_path TEXT DEFAULT NULL;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.popup_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_incentives ENABLE ROW LEVEL SECURITY;

-- RLS policies for popup_config
CREATE POLICY "Public can view popup config"
ON public.popup_config
FOR SELECT
USING (true);

CREATE POLICY "Admin and backoffice can manage popup config"
ON public.popup_config
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- RLS policies for popup_incentives
CREATE POLICY "Public can view active incentives"
ON public.popup_incentives
FOR SELECT
USING (true);

CREATE POLICY "Admin and backoffice can manage incentives"
ON public.popup_incentives
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- Update newsletter_subscribers policy to allow select by email for duplicate check
CREATE POLICY "Public can check own email subscription"
ON public.newsletter_subscribers
FOR SELECT
USING (email = current_user_email());

-- Triggers for updated_at
CREATE TRIGGER update_popup_config_updated_at
BEFORE UPDATE ON public.popup_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_popup_incentives_updated_at
BEFORE UPDATE ON public.popup_incentives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default config
INSERT INTO public.popup_config (
  is_active,
  title,
  subtitle,
  cta_label,
  rgpd_text,
  display_delay_seconds,
  display_scroll_percent,
  cooldown_days,
  exclude_paths
) VALUES (
  true,
  'Rejoignez le Cercle Maison Wydeline',
  'Chaussures élégantes du 41 au 45, fabriquées au Portugal. Recevez en avant-première nos nouveautés et offres privées.',
  'Recevoir mon avantage',
  'En vous inscrivant, vous acceptez de recevoir nos emails. Désinscription en 1 clic.',
  10,
  50,
  7,
  ARRAY['/cart', '/checkout']
);

-- Insert default incentives
INSERT INTO public.popup_incentives (label, promo_code, sort_order, is_active) VALUES
  ('-10% sur votre première commande', 'WYDELINE10', 1, true),
  ('Livraison offerte dès 200€ pour les membres', 'FREESHIP200', 2, true),
  ('Accès anticipé aux nouveautés + offre privée', 'VIPACCESS', 3, true);