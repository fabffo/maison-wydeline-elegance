import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Load all product data from Supabase
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');

        if (productsError) {
          console.error('Failed to load products:', productsError);
          setLoading(false);
          return;
        }

        // Load variants for stock data
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('product_id, size, stock_quantity');

        if (variantsError) {
          console.error('Failed to load variants:', variantsError);
        }

        // Load product images from database
        const { data: productImages, error: imagesError } = await supabase
          .from('product_images')
          .select('product_id, image_url, position')
          .order('position');

        if (imagesError) {
          console.error('Failed to load images:', imagesError);
        }

        // Transform database products to Product type
        const transformedProducts: Product[] = (productsData || []).map((dbProduct) => {
          // Get variants for this product
          const productVariants = variants?.filter(v => v.product_id === dbProduct.id) || [];
          const stock: Record<string, number> = {};
          const sizes: number[] = [];
          
          productVariants.forEach(variant => {
            stock[variant.size.toString()] = variant.stock_quantity;
            sizes.push(variant.size);
          });

          // Get images for this product
          const dbImages = productImages?.filter(img => img.product_id === dbProduct.id) || [];
          const images = dbImages.length > 0 
            ? dbImages.map(img => img.image_url)
            : [];

          return {
            id: dbProduct.id,
            slug: dbProduct.slug || dbProduct.id,
            name: dbProduct.name,
            category: dbProduct.category,
            description: dbProduct.description,
            material: dbProduct.material,
            color: dbProduct.color,
            heelHeightCm: dbProduct.heel_height_cm,
            sizes: sizes.sort((a, b) => a - b),
            price: dbProduct.price,
            stock,
            preorder: dbProduct.preorder ?? false,
            preorderPendingCount: dbProduct.preorder_pending_count ?? 0,
            preorderNotificationThreshold: dbProduct.preorder_notification_threshold ?? 10,
            preorderNotificationSent: dbProduct.preorder_notification_sent ?? false,
            images,
            altText: dbProduct.alt_text,
            tags: dbProduct.tags,
            characteristics: dbProduct.characteristics as Record<string, string> | null,
          };
        });

        setProducts(transformedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load products:', err);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, loading };
};
