-- Add characteristics JSONB column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS characteristics jsonb DEFAULT '{}';

-- Update Bottines Bordeaux with the specified characteristics
UPDATE public.products 
SET characteristics = '{
  "Matière": "100 % cuir lisse",
  "Coloris": "Bordeaux profond",
  "Fermeture": "Zip latéral discret",
  "Talon": "Bloc confortable, idéal pour un usage prolongé",
  "Style": "Ligne moderne et épurée",
  "Intérieur": "Confortable, pensé pour un port quotidien",
  "Talon enrobé": "Oui",
  "Hauteur de talon": "6 cm"
}'::jsonb
WHERE slug = 'bottines-bordeaux';