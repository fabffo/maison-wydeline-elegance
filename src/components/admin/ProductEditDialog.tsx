import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface ProductEditDialogProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    characteristics: Record<string, string> | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export const ProductEditDialog = ({ product, open, onOpenChange, onSaved }: ProductEditDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [characteristics, setCharacteristics] = useState<{ key: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      
      // Convert characteristics object to array of key-value pairs
      if (product.characteristics) {
        setCharacteristics(
          Object.entries(product.characteristics).map(([key, value]) => ({ key, value }))
        );
      } else {
        setCharacteristics([]);
      }
    }
  }, [product]);

  const handleAddCharacteristic = () => {
    setCharacteristics([...characteristics, { key: '', value: '' }]);
  };

  const handleRemoveCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const handleCharacteristicChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...characteristics];
    updated[index][field] = value;
    setCharacteristics(updated);
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      // Convert characteristics array back to object
      const characteristicsObj: Record<string, string> = {};
      characteristics.forEach(({ key, value }) => {
        if (key.trim()) {
          characteristicsObj[key.trim()] = value;
        }
      });

      const { error } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          characteristics: Object.keys(characteristicsObj).length > 0 ? characteristicsObj : null,
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({ title: 'Produit mis à jour', description: 'Les modifications ont été enregistrées' });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le produit', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du produit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du produit"
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Caractéristiques</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCharacteristic}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {characteristics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune caractéristique définie</p>
            ) : (
              <div className="space-y-3">
                {characteristics.map((char, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={char.key}
                      onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                      placeholder="Clé (ex: Matière)"
                      className="flex-1"
                    />
                    <Input
                      value={char.value}
                      onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                      placeholder="Valeur (ex: 100% cuir)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCharacteristic(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
