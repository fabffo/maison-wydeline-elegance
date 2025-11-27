import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Load static product data
        const response = await fetch('/products.json');
        const staticProducts = await response.json();

        // Load real-time stock and preorder data from Supabase
        const { data: variants, error } = await supabase
          .from('product_variants')
          .select('product_id, size, stock_quantity, low_stock_threshold');

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, preorder, preorder_pending_count, preorder_notification_threshold, preorder_notification_sent');

        if (error || productsError) {
          console.error('Failed to load variants or products:', error, productsError);
          setProducts(staticProducts);
          setLoading(false);
          return;
        }

        // Merge stock and preorder data with static products
        const productsWithStock = staticProducts.map((product: Product) => {
          const productVariants = variants?.filter(v => v.product_id === product.id) || [];
          const productData = productsData?.find(p => p.id === product.id);
          const stock: Record<string, number> = {};
          
          productVariants.forEach(variant => {
            stock[variant.size.toString()] = variant.stock_quantity;
          });

          return {
            ...product,
            stock,
            preorder: productData?.preorder ?? product.preorder,
            preorderPendingCount: productData?.preorder_pending_count ?? 0,
            preorderNotificationThreshold: productData?.preorder_notification_threshold ?? 10,
            preorderNotificationSent: productData?.preorder_notification_sent ?? false,
          };
        });

        setProducts(productsWithStock);
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
