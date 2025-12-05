-- =====================================================
-- EXPORT SQL - Modifications du 05/12/2025
-- Projet: Wydeline - Gestion TVA dynamique par produit
-- =====================================================

-- =====================================================
-- 1. CRÉATION TABLE TVA_RATES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tva_rates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger pour mise à jour automatique du timestamp
CREATE TRIGGER update_tva_rates_updated_at
    BEFORE UPDATE ON public.tva_rates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. POLITIQUES RLS POUR TVA_RATES
-- =====================================================

ALTER TABLE public.tva_rates ENABLE ROW LEVEL SECURITY;

-- Lecture publique des taux de TVA
CREATE POLICY "Public can view TVA rates"
    ON public.tva_rates
    FOR SELECT
    USING (true);

-- Gestion par admin et backoffice
CREATE POLICY "Admin and backoffice can manage TVA rates"
    ON public.tva_rates
    FOR ALL
    USING (
        has_role(auth.uid(), 'ADMIN'::app_role) 
        OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
    );

-- =====================================================
-- 3. AJOUT COLONNE TVA_RATE_ID SUR PRODUCTS
-- =====================================================

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS tva_rate_id UUID REFERENCES public.tva_rates(id);

-- =====================================================
-- 4. DONNÉES INITIALES - TAUX TVA FRANÇAIS
-- =====================================================

INSERT INTO public.tva_rates (name, rate, description, is_default) VALUES
    ('Standard', 20, 'Taux normal - Chaussures et accessoires', true),
    ('Intermédiaire', 10, 'Taux intermédiaire - Restauration, transports', false),
    ('Réduit', 5.5, 'Taux réduit - Produits alimentaires, livres', false),
    ('Super réduit', 2.1, 'Taux super réduit - Médicaments remboursables, presse', false),
    ('Exonéré', 0, 'Exonération de TVA', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. MISE À JOUR DES PRODUITS EXISTANTS
--    (Lier au taux standard 20% par défaut)
-- =====================================================

UPDATE public.products 
SET tva_rate_id = (
    SELECT id FROM public.tva_rates WHERE is_default = true LIMIT 1
)
WHERE tva_rate_id IS NULL;

-- =====================================================
-- FIN DE L'EXPORT
-- =====================================================
