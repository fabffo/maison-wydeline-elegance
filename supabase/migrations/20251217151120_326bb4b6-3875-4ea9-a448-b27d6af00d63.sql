-- Add missing columns to products table for full JSON migration
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS heel_height_cm NUMERIC,
ADD COLUMN IF NOT EXISTS alt_text TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Update existing products with data from JSON
UPDATE public.products SET 
  slug = 'bottes-noires-nappa',
  heel_height_cm = 6,
  alt_text = 'Bottes hautes en cuir nappa noir portées',
  tags = ARRAY['bottes', 'nappa', 'noir', 'intemporel']
WHERE id = 'mw-bottes-noires-nappa';

UPDATE public.products SET 
  slug = 'bottes-vertes-truffe',
  heel_height_cm = 6,
  alt_text = 'Bottes en daim vert truffe portées',
  tags = ARRAY['bottes', 'daim', 'vert']
WHERE id = 'mw-bottes-vertes-truffe';

UPDATE public.products SET 
  slug = 'bottines-bordeaux',
  heel_height_cm = 4,
  alt_text = 'Bottines en cuir bordeaux en situation',
  tags = ARRAY['bottines', 'cuir', 'bordeaux']
WHERE id = 'mw-bottines-bordeaux';

UPDATE public.products SET 
  slug = 'bottines-daim-noires',
  heel_height_cm = 4,
  alt_text = 'Bottines en daim noir sur fond clair',
  tags = ARRAY['bottines', 'daim', 'noir']
WHERE id = 'mw-bottines-daim-noires';

UPDATE public.products SET 
  slug = 'bottines-noires',
  heel_height_cm = 4,
  alt_text = 'Bottines en cuir noir portées',
  tags = ARRAY['bottines', 'cuir', 'noir']
WHERE id = 'mw-bottines-noires';

UPDATE public.products SET 
  slug = 'chaussures-plates-blanches',
  heel_height_cm = 1.5,
  alt_text = 'Chaussures plates blanches en cuir',
  tags = ARRAY['plats', 'blanc', 'léger']
WHERE id = 'mw-plates-blanches';

UPDATE public.products SET 
  slug = 'slingback-bordeaux',
  heel_height_cm = 5,
  alt_text = 'Escarpins slingback bordeaux verni',
  tags = ARRAY['escarpins', 'slingback', 'bordeaux']
WHERE id = 'mw-slingback-bordeaux';

UPDATE public.products SET 
  slug = 'slingback-camel',
  heel_height_cm = 5,
  alt_text = 'Escarpins slingback camel en daim',
  tags = ARRAY['escarpins', 'slingback', 'camel']
WHERE id = 'mw-slingback-camel';

UPDATE public.products SET 
  slug = 'slingback-jeans',
  heel_height_cm = 5,
  alt_text = 'Escarpins slingback bleu jeans',
  tags = ARRAY['escarpins', 'slingback', 'jeans']
WHERE id = 'mw-slingback-jeans';