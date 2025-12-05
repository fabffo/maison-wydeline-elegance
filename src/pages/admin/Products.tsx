import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Eye, AlertTriangle, PackageX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TvaRate {
  id: string;
  name: string;
  rate: number;
  is_default: boolean;
}

export const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [tvaRates, setTvaRates] = useState<TvaRate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [productsRes, variantsRes, tvaRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('product_variants').select('*').order('product_id, size'),
        supabase.from('tva_rates').select('*').order('rate', { ascending: false })
      ]);

      if (productsRes.error) throw productsRes.error;
      if (variantsRes.error) throw variantsRes.error;
      if (tvaRes.error) throw tvaRes.error;

      setProducts(productsRes.data || []);
      setVariants(variantsRes.data || []);
      setTvaRates(tvaRes.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les produits', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateProductTva = async (productId: string, tvaRateId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ tva_rate_id: tvaRateId })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, tva_rate_id: tvaRateId } : p));
      toast({ title: 'TVA mise à jour' });
    } catch (error) {
      console.error('Error updating TVA:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour la TVA', variant: 'destructive' });
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
            price: product.price,
            preorder: product.preorder || false,
            preorder_pending_count: 0,
            preorder_notification_threshold: 10,
            preorder_notification_sent: false
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
            const outOfStock = productVariants.filter(v => v.stock_quantity === 0).length;
            const lowStock = productVariants.filter(v => v.stock_quantity > 0 && v.stock_quantity < v.alert_threshold).length;
            const isPreorderActive = product.preorder === true;

            return (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {product.name}
                        <Badge variant="outline">{product.category}</Badge>
                        {isPreorderActive && (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                            📦 Précommande active
                          </Badge>
                        )}
                        {outOfStock > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => navigate(`/admin/stocks?product=${product.id}`)}
                          >
                            <PackageX className="h-3 w-3" />
                            {outOfStock} en rupture
                          </Badge>
                        )}
                        {lowStock > 0 && (
                          <Badge 
                            variant="secondary"
                            className="flex items-center gap-1 cursor-pointer bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20"
                            onClick={() => navigate(`/admin/stocks?product=${product.id}`)}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {lowStock} stock faible
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/products/${product.id}/preorder`)}
                      className="mr-2"
                    >
                      ⚙️ Précommande
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/stocks?product=${product.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les stocks
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
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
                    <div>
                      <span className="text-muted-foreground">Précommandes:</span>
                      <p className="font-medium">
                        {product.preorder_pending_count || 0} / {product.preorder_notification_threshold || 10}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TVA:</span>
                      <Select
                        value={product.tva_rate_id || ''}
                        onValueChange={(value) => updateProductTva(product.id, value)}
                      >
                        <SelectTrigger className="h-8 w-32 mt-1">
                          <SelectValue placeholder="Choisir TVA" />
                        </SelectTrigger>
                        <SelectContent>
                          {tvaRates.map((rate) => (
                            <SelectItem key={rate.id} value={rate.id}>
                              {rate.name} ({rate.rate}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
