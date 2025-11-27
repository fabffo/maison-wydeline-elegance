import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

export const ProductPreorderConfig = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le produit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          preorder: product.preorder,
          preorder_notification_threshold: product.preorder_notification_threshold,
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Sauvegardé',
        description: 'La configuration de précommande a été mise à jour',
      });
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !product) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/admin/products')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux produits
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Précommande - {product.name}</CardTitle>
          <CardDescription>
            Gérer les paramètres de précommande pour ce produit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-0.5">
              <Label htmlFor="preorder">Activer la précommande</Label>
              <p className="text-sm text-muted-foreground">
                Permet aux clients de commander même sans stock
              </p>
            </div>
            <Switch
              id="preorder"
              checked={product.preorder}
              onCheckedChange={(checked) =>
                setProduct({ ...product, preorder: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">
              Seuil de notification (nombre de précommandes)
            </Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              value={product.preorder_notification_threshold || 10}
              onChange={(e) =>
                setProduct({
                  ...product,
                  preorder_notification_threshold: parseInt(e.target.value) || 10,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Le backoffice sera notifié quand ce nombre de précommandes est atteint
            </p>
          </div>

          <div className="space-y-2">
            <Label>Précommandes en cours</Label>
            <div className="text-2xl font-bold">
              {product.preorder_pending_count || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              {product.preorder_notification_sent
                ? '✓ Notification envoyée'
                : 'Pas encore de notification'}
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
