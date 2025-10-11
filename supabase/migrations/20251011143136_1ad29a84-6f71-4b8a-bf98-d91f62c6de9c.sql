-- Add featured fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_area TEXT,
ADD COLUMN IF NOT EXISTS featured_priority INTEGER,
ADD COLUMN IF NOT EXISTS featured_start_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_end_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_label TEXT;

-- Add low stock threshold to product_variants if not exists
ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 3;

-- Create index for featured products queries
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured, featured_area, featured_priority) WHERE is_featured = true;

-- Comment on columns
COMMENT ON COLUMN public.products.is_featured IS 'Indicates if product is featured on homepage';
COMMENT ON COLUMN public.products.featured_area IS 'Area where product is featured: HERO, CAROUSEL, GRID, NEW, BEST';
COMMENT ON COLUMN public.products.featured_priority IS 'Display order priority (lower = first)';
COMMENT ON COLUMN public.products.featured_start_at IS 'Start date/time for featuring';
COMMENT ON COLUMN public.products.featured_end_at IS 'End date/time for featuring';
COMMENT ON COLUMN public.products.featured_label IS 'Label to display: Nouveauté, Iconique, etc.';
COMMENT ON COLUMN public.product_variants.low_stock_threshold IS 'Threshold for low stock alert (default: 3)';