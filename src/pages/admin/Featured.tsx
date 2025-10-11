import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Star, StarOff, ArrowUp, ArrowDown, Pencil, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type FeaturedArea = 'HERO' | 'CAROUSEL' | 'GRID' | 'NEW' | 'BEST';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  is_featured: boolean;
  featured_area: FeaturedArea | null;
  featured_priority: number | null;
  featured_start_at: string | null;
  featured_end_at: string | null;
  featured_label: string | null;
}

export const Featured = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    is_featured: false,
    featured_area: '' as FeaturedArea | '',
    featured_priority: 0,
    featured_start_at: '',
    featured_end_at: '',
    featured_label: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured_priority', { ascending: true, nullsFirst: false })
        .order('name');

      if (error) throw error;
      
      const typedData = (data || []).map(p => ({
        ...p,
        featured_area: p.featured_area as FeaturedArea | null,
      }));
      
      setProducts(typedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les produits', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      is_featured: product.is_featured,
      featured_area: product.featured_area || '',
      featured_priority: product.featured_priority || 0,
      featured_start_at: product.featured_start_at ? product.featured_start_at.split('T')[0] : '',
      featured_end_at: product.featured_end_at ? product.featured_end_at.split('T')[0] : '',
      featured_label: product.featured_label || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      const updateData: any = {
        is_featured: formData.is_featured,
        featured_area: formData.is_featured ? formData.featured_area : null,
        featured_priority: formData.is_featured ? formData.featured_priority : null,
        featured_start_at: formData.featured_start_at || null,
        featured_end_at: formData.featured_end_at || null,
        featured_label: formData.featured_label || null,
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({ title: 'Produit mis à jour' });
      fetchProducts();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le produit', variant: 'destructive' });
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id);

      if (error) throw error;
      toast({ title: product.is_featured ? 'Produit retiré de la vitrine' : 'Produit ajouté à la vitrine' });
      fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const changePriority = async (product: Product, direction: 'up' | 'down') => {
    const currentPriority = product.featured_priority || 0;
    const newPriority = direction === 'up' ? currentPriority - 1 : currentPriority + 1;

    try {
      const { error } = await supabase
        .from('products')
        .update({ featured_priority: newPriority })
        .eq('id', product.id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error changing priority:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  const featuredProducts = products.filter(p => p.is_featured);
  const nonFeaturedProducts = products.filter(p => !p.is_featured);

  const getAreaLabel = (area: FeaturedArea | null) => {
    const labels = {
      HERO: 'Hero',
      CAROUSEL: 'Carrousel',
      GRID: 'Grille',
      NEW: 'Nouveautés',
      BEST: 'Meilleures ventes',
    };
    return area ? labels[area] : '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion de la vitrine</h1>
        <p className="text-muted-foreground">
          Gérez les produits mis en avant sur la page d'accueil
        </p>
      </div>

      {/* Featured Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            Produits en vitrine ({featuredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun produit en vitrine
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{product.featured_priority || 0}</span>
                        <div className="flex flex-col">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => changePriority(product, 'up')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => changePriority(product, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.price} €</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getAreaLabel(product.featured_area)}</Badge>
                    </TableCell>
                    <TableCell>
                      {product.featured_label && (
                        <Badge>{product.featured_label}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {product.featured_start_at && (
                          <div>Début: {new Date(product.featured_start_at).toLocaleDateString()}</div>
                        )}
                        {product.featured_end_at && (
                          <div>Fin: {new Date(product.featured_end_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFeatured(product)}
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Non-Featured Products */}
      <Card>
        <CardHeader>
          <CardTitle>Autres produits ({nonFeaturedProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonFeaturedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price} €</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Ajouter à la vitrine
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_featured">Mettre en vitrine</Label>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>

            {formData.is_featured && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="featured_area">Zone d'affichage</Label>
                  <Select
                    value={formData.featured_area}
                    onValueChange={(value) => setFormData({ ...formData, featured_area: value as FeaturedArea })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HERO">Hero (bannière principale)</SelectItem>
                      <SelectItem value="CAROUSEL">Carrousel</SelectItem>
                      <SelectItem value="GRID">Grille</SelectItem>
                      <SelectItem value="NEW">Nouveautés</SelectItem>
                      <SelectItem value="BEST">Meilleures ventes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_priority">Priorité d'affichage</Label>
                  <Input
                    id="featured_priority"
                    type="number"
                    value={formData.featured_priority}
                    onChange={(e) => setFormData({ ...formData, featured_priority: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Plus le nombre est petit, plus le produit apparaît en premier</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_label">Label (optionnel)</Label>
                  <Input
                    id="featured_label"
                    placeholder="Ex: Nouveauté, Iconique..."
                    value={formData.featured_label}
                    onChange={(e) => setFormData({ ...formData, featured_label: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="featured_start_at">Date de début</Label>
                    <Input
                      id="featured_start_at"
                      type="date"
                      value={formData.featured_start_at}
                      onChange={(e) => setFormData({ ...formData, featured_start_at: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featured_end_at">Date de fin</Label>
                    <Input
                      id="featured_end_at"
                      type="date"
                      value={formData.featured_end_at}
                      onChange={(e) => setFormData({ ...formData, featured_end_at: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};