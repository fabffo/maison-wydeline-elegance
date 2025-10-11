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

        // Load real-time stock from Supabase
        const { data: variants, error } = await supabase
          .from('product_variants')
          .select('product_id, size, stock_quantity, low_stock_threshold');

        if (error) {
          console.error('Failed to load variants:', error);
          setProducts(staticProducts);
          setLoading(false);
          return;
        }

        // Merge stock data with static products
        const productsWithStock = staticProducts.map((product: Product) => {
          const productVariants = variants?.filter(v => v.product_id === product.id) || [];
          const stock: Record<string, number> = {};
          
          productVariants.forEach(variant => {
            stock[variant.size.toString()] = variant.stock_quantity;
          });

          return {
            ...product,
            stock
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
