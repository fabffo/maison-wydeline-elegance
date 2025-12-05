import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Check, X, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TvaRate {
  id: string;
  name: string;
  rate: number;
  description: string | null;
  is_default: boolean;
  created_at: string;
}

export function TvaRates() {
  const [tvaRates, setTvaRates] = useState<TvaRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', rate: '', description: '' });
  const [newForm, setNewForm] = useState({ name: '', rate: '', description: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTvaRates();
  }, []);

  const fetchTvaRates = async () => {
    const { data, error } = await supabase
      .from('tva_rates')
      .select('*')
      .order('rate', { ascending: false });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les taux de TVA',
        variant: 'destructive',
      });
    } else {
      setTvaRates(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newForm.name || !newForm.rate) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le taux sont requis',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('tva_rates').insert({
      name: newForm.name,
      rate: parseFloat(newForm.rate),
      description: newForm.description || null,
    });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le taux de TVA',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Taux de TVA créé',
      });
      setNewForm({ name: '', rate: '', description: '' });
      setDialogOpen(false);
      fetchTvaRates();
    }
  };

  const startEdit = (rate: TvaRate) => {
    setEditingId(rate.id);
    setEditForm({
      name: rate.name,
      rate: rate.rate.toString(),
      description: rate.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', rate: '', description: '' });
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('tva_rates')
      .update({
        name: editForm.name,
        rate: parseFloat(editForm.rate),
        description: editForm.description || null,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le taux de TVA',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Taux de TVA modifié',
      });
      setEditingId(null);
      fetchTvaRates();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tva_rates').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le taux de TVA. Il est peut-être utilisé par des produits.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Taux de TVA supprimé',
      });
      fetchTvaRates();
    }
  };

  const handleSetDefault = async (id: string) => {
    // First, unset all defaults
    await supabase.from('tva_rates').update({ is_default: false }).neq('id', '');
    
    // Then set the new default
    const { error } = await supabase
      .from('tva_rates')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de définir le taux par défaut',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Taux par défaut mis à jour',
      });
      fetchTvaRates();
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Taux de TVA</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau taux
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un taux de TVA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Ex: TVA 20%"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Taux (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 20"
                  value={newForm.rate}
                  onChange={(e) => setNewForm({ ...newForm, rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Ex: Taux normal"
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taux de TVA</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Par défaut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tvaRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>
                    {editingId === rate.id ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      rate.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === rate.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.rate}
                        onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                        className="w-24"
                      />
                    ) : (
                      `${rate.rate}%`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === rate.id ? (
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    ) : (
                      rate.description || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {rate.is_default ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(rate.id)}
                        title="Définir par défaut"
                      >
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === rate.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdate(rate.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(rate)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce taux ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Les produits utilisant ce taux devront être mis à jour.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(rate.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
