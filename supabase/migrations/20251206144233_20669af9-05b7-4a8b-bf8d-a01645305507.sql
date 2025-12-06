-- Ajouter la contrainte UNIQUE sur product_variants (un seul variant par produit/taille)
ALTER TABLE public.product_variants
ADD CONSTRAINT unique_product_variant UNIQUE (product_id, size);

-- Ajouter la FK de product_variants vers products
ALTER TABLE public.product_variants
ADD CONSTRAINT fk_product_variants_product
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Ajouter la FK de stock_movements vers products
ALTER TABLE public.stock_movements
ADD CONSTRAINT fk_stock_movements_product
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;