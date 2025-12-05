-- Create TVA rates table
CREATE TABLE public.tva_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rate numeric NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tva_rates ENABLE ROW LEVEL SECURITY;

-- Public can view TVA rates
CREATE POLICY "Public can view TVA rates"
ON public.tva_rates
FOR SELECT
USING (true);

-- Admin and backoffice can manage TVA rates
CREATE POLICY "Admin and backoffice can manage TVA rates"
ON public.tva_rates
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- Add tva_rate_id to products table
ALTER TABLE public.products ADD COLUMN tva_rate_id uuid REFERENCES public.tva_rates(id);

-- Insert standard French TVA rates
INSERT INTO public.tva_rates (name, rate, description, is_default) VALUES
('TVA 20%', 20.00, 'Taux normal - Chaussures, vêtements, accessoires', true),
('TVA 10%', 10.00, 'Taux intermédiaire - Restauration, transports', false),
('TVA 5.5%', 5.50, 'Taux réduit - Alimentation, livres', false),
('TVA 2.1%', 2.10, 'Taux super réduit - Médicaments remboursés, presse', false),
('Exonéré', 0.00, 'TVA non applicable', false);

-- Update existing products to use default TVA rate (20%)
UPDATE public.products 
SET tva_rate_id = (SELECT id FROM public.tva_rates WHERE is_default = true LIMIT 1);

-- Create trigger for updated_at
CREATE TRIGGER update_tva_rates_updated_at
BEFORE UPDATE ON public.tva_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();