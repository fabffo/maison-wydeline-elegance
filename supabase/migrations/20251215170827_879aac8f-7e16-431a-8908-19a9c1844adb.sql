-- Ajout des colonnes fournisseur à la table products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS reference_fournisseur TEXT,
ADD COLUMN IF NOT EXISTS description_fournisseur TEXT;