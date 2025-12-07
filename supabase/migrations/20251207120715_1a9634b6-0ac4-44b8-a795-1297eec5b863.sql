-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Create table to store product image references
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public can view product images
CREATE POLICY "Public can view product images"
ON public.product_images
FOR SELECT
USING (true);

-- Admin and backoffice can manage product images
CREATE POLICY "Admin and backoffice can manage product images"
ON public.product_images
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- Storage policies for product images bucket
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin and backoffice can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role))
);

CREATE POLICY "Admin and backoffice can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role))
);

CREATE POLICY "Admin and backoffice can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role))
);