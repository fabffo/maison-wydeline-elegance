import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Download, Upload, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const updateVariantStock = async (variantId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newQuantity })
        .eq('id', variantId);

      if (error) throw error;

      toast({ title: 'Stock mis à jour' });
      fetchProducts();
      setEditingVariant(null);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le stock', variant: 'destructive' });
    }
  };

  const exportToCSV = () => {
    if (variants.length === 0) {
      toast({ title: 'Aucune donnée à exporter', variant: 'destructive' });
      return;
    }

    const csvData = variants.map(v => {
      const product = products.find(p => p.id === v.product_id);
      return {
        'Produit': product?.name || '',
        'Taille': v.size,
        'Stock': v.stock_quantity,
        'Seuil alerte': v.alert_threshold
      };
    });

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({ title: 'Fichier vide', variant: 'destructive' });
        return;
      }

      const updates: Array<{ id: string; stock: number }> = [];
      
      for (let i = 1; i < lines.length; i++) {
        const [productName, size, stock] = lines[i].split(',').map(s => s.trim());
        
        const product = products.find(p => p.name === productName);
        if (!product) continue;

        const variant = variants.find(v => 
          v.product_id === product.id && v.size === parseInt(size)
        );
        
        if (variant) {
          updates.push({ id: variant.id, stock: parseInt(stock) });
        }
      }

      for (const update of updates) {
        await supabase
          .from('product_variants')
          .update({ stock_quantity: update.stock })
          .eq('id', update.id);
      }

      toast({ title: 'Import réussi', description: `${updates.length} stocks mis à jour` });
      fetchProducts();
      setImportDialogOpen(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({ title: 'Erreur', description: "Impossible d'importer le fichier", variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des stocks</h1>
          <p className="text-muted-foreground">Gérez vos produits et leurs variantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importer CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer un fichier CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Format attendu : Produit, Taille, Stock (sans la ligne d'en-tête)
                </p>
                <Input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleImportCSV}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {products.map((product) => {
        const productVariants = variants.filter(v => v.product_id === product.id);
        const lowStockCount = productVariants.filter(v => v.stock_quantity < v.alert_threshold).length;

        return (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {product.name}
                  {lowStockCount > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {lowStockCount} alerte{lowStockCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Taille</TableHead>
                    <TableHead>Stock actuel</TableHead>
                    <TableHead>Seuil d'alerte</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productVariants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.size}</TableCell>
                      <TableCell>
                        {editingVariant === variant.id ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20"
                            />
                            <Button
                              size="sm"
                              onClick={() => updateVariantStock(variant.id, parseInt(editValue))}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingVariant(null)}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <span>{variant.stock_quantity}</span>
                        )}
                      </TableCell>
                      <TableCell>{variant.alert_threshold}</TableCell>
                      <TableCell>
                        {variant.stock_quantity < variant.alert_threshold ? (
                          <Badge variant="destructive">Stock faible</Badge>
                        ) : variant.stock_quantity === 0 ? (
                          <Badge variant="secondary">Rupture</Badge>
                        ) : (
                          <Badge variant="outline">Disponible</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingVariant(variant.id);
                            setEditValue(variant.stock_quantity.toString());
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
