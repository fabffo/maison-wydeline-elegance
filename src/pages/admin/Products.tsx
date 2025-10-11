import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .order('product_id, size');

      if (productsError) throw productsError;
      if (variantsError) throw variantsError;

      setProducts(productsData || []);
      setVariants(variantsData || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les produits', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const syncFromJSON = async () => {
    try {
      const response = await fetch('/products.json');
      const jsonProducts = await response.json();

      for (const product of jsonProducts) {
        const { error: productError } = await supabase
          .from('products')
          .upsert({
            id: product.id,
            name: product.name,
            category: product.category,
            description: product.description,
            material: product.materials[0],
            color: product.color,
            price: product.price
          });

        if (productError) throw productError;

        for (const size of product.sizes) {
          const { error: variantError } = await supabase
            .from('product_variants')
            .upsert({
              product_id: product.id,
              size: size,
              stock_quantity: product.stock[size] || 0,
              alert_threshold: 5
            }, {
              onConflict: 'product_id,size'
            });

          if (variantError) throw variantError;
        }
      }

      toast({ title: 'Synchronisation réussie', description: `${jsonProducts.length} produits synchronisés` });
      fetchProducts();
    } catch (error) {
      console.error('Error syncing from JSON:', error);
      toast({ title: 'Erreur', description: 'Impossible de synchroniser', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des produits</h1>
          <p className="text-muted-foreground">Synchronisation et aperçu des produits</p>
        </div>
        <Button onClick={syncFromJSON}>
          <Upload className="h-4 w-4 mr-2" />
          Synchroniser depuis JSON
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Aucun produit trouvé</p>
            <Button onClick={syncFromJSON}>
              <Upload className="h-4 w-4 mr-2" />
              Importer depuis products.json
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const productVariants = variants.filter(v => v.product_id === product.id);
            const totalStock = productVariants.reduce((acc, v) => acc + v.stock_quantity, 0);

            return (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {product.name}
                        <Badge variant="outline">{product.category}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/admin/stocks')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les stocks
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Prix:</span>
                      <p className="font-medium">{product.price} €</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Couleur:</span>
                      <p className="font-medium">{product.color}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Matière:</span>
                      <p className="font-medium">{product.material}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock total:</span>
                      <p className="font-medium">{totalStock} unités</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
