import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, GripVertical, Save, Eye, EyeOff, Settings2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PopupConfig {
  id: string;
  is_active: boolean;
  title: string;
  subtitle: string;
  cta_label: string;
  rgpd_text: string;
  display_delay_seconds: number;
  display_scroll_percent: number;
  cooldown_days: number;
  include_paths: string[] | null;
  exclude_paths: string[] | null;
}

interface PopupIncentive {
  id: string;
  label: string;
  promo_code: string;
  short_desc: string | null;
  sort_order: number;
  is_active: boolean;
}

const PopupNewsletter = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Config state
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [configDirty, setConfigDirty] = useState(false);

  // Incentive dialog state
  const [incentiveDialogOpen, setIncentiveDialogOpen] = useState(false);
  const [editingIncentive, setEditingIncentive] = useState<PopupIncentive | null>(null);
  const [incentiveForm, setIncentiveForm] = useState({
    label: '',
    promo_code: '',
    short_desc: '',
    sort_order: 0,
    is_active: true
  });

  // Fetch config
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['popup-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popup_config')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PopupConfig | null;
    }
  });

  // Fetch incentives
  const { data: incentives, isLoading: incentivesLoading } = useQuery({
    queryKey: ['popup-incentives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popup_incentives')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as PopupIncentive[];
    }
  });

  // Sync config state
  useEffect(() => {
    if (configData) {
      setConfig(configData);
    }
  }, [configData]);

  // Save config mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (updatedConfig: Partial<PopupConfig>) => {
      if (!config?.id) throw new Error('No config found');
      const { error } = await supabase
        .from('popup_config')
        .update(updatedConfig)
        .eq('id', config.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-config'] });
      setConfigDirty(false);
      toast({ title: 'Configuration sauvegardée' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  });

  // Create/update incentive mutation
  const saveIncentiveMutation = useMutation({
    mutationFn: async (incentive: typeof incentiveForm & { id?: string }) => {
      if (incentive.id) {
        const { error } = await supabase
          .from('popup_incentives')
          .update({
            label: incentive.label,
            promo_code: incentive.promo_code,
            short_desc: incentive.short_desc || null,
            sort_order: incentive.sort_order,
            is_active: incentive.is_active
          })
          .eq('id', incentive.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('popup_incentives')
          .insert({
            label: incentive.label,
            promo_code: incentive.promo_code,
            short_desc: incentive.short_desc || null,
            sort_order: incentive.sort_order,
            is_active: incentive.is_active
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-incentives'] });
      setIncentiveDialogOpen(false);
      resetIncentiveForm();
      toast({ title: editingIncentive ? 'Incentive modifié' : 'Incentive créé' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  });

  // Delete incentive mutation
  const deleteIncentiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('popup_incentives').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-incentives'] });
      toast({ title: 'Incentive supprimé' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  });

  // Toggle incentive active mutation
  const toggleIncentiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('popup_incentives')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popup-incentives'] });
    }
  });

  const resetIncentiveForm = () => {
    setEditingIncentive(null);
    setIncentiveForm({
      label: '',
      promo_code: '',
      short_desc: '',
      sort_order: (incentives?.length || 0) + 1,
      is_active: true
    });
  };

  const openEditIncentive = (incentive: PopupIncentive) => {
    setEditingIncentive(incentive);
    setIncentiveForm({
      label: incentive.label,
      promo_code: incentive.promo_code,
      short_desc: incentive.short_desc || '',
      sort_order: incentive.sort_order,
      is_active: incentive.is_active
    });
    setIncentiveDialogOpen(true);
  };

  const handleConfigChange = <K extends keyof PopupConfig>(key: K, value: PopupConfig[K]) => {
    if (config) {
      setConfig({ ...config, [key]: value });
      setConfigDirty(true);
    }
  };

  const handleSaveConfig = () => {
    if (config) {
      saveConfigMutation.mutate(config);
    }
  };

  const handleSubmitIncentive = (e: React.FormEvent) => {
    e.preventDefault();
    saveIncentiveMutation.mutate({
      ...incentiveForm,
      id: editingIncentive?.id
    });
  };

  if (configLoading || incentivesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Popup Newsletter</h1>
          <p className="text-muted-foreground">
            Configurez le popup d'inscription à la newsletter avec code promo
          </p>
        </div>
        {config && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="popup-active" className="text-sm">
                Popup {config.is_active ? 'actif' : 'inactif'}
              </Label>
              <Switch
                id="popup-active"
                checked={config.is_active}
                onCheckedChange={(checked) => {
                  handleConfigChange('is_active', checked);
                  saveConfigMutation.mutate({ is_active: checked });
                }}
              />
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
          <TabsTrigger value="settings">Paramètres d'affichage</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Contenu du popup</CardTitle>
              <CardDescription>
                Personnalisez les textes affichés dans le popup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={config.title}
                      onChange={(e) => handleConfigChange('title', e.target.value)}
                      placeholder="Rejoignez le Cercle Maison Wydeline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Sous-titre</Label>
                    <Textarea
                      id="subtitle"
                      value={config.subtitle}
                      onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                      placeholder="Description..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta">Texte du bouton (CTA)</Label>
                    <Input
                      id="cta"
                      value={config.cta_label}
                      onChange={(e) => handleConfigChange('cta_label', e.target.value)}
                      placeholder="Recevoir mon avantage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rgpd">Texte RGPD</Label>
                    <Textarea
                      id="rgpd"
                      value={config.rgpd_text}
                      onChange={(e) => handleConfigChange('rgpd_text', e.target.value)}
                      placeholder="En vous inscrivant..."
                      rows={2}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveConfig}
                      disabled={!configDirty || saveConfigMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveConfigMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incentives Tab */}
        <TabsContent value="incentives">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Incentives (Avantages)</CardTitle>
                  <CardDescription>
                    Gérez les options d'avantages proposées aux utilisateurs
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    resetIncentiveForm();
                    setIncentiveDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Ordre</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Code promo</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incentives?.map((incentive) => (
                    <TableRow key={incentive.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          {incentive.sort_order}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{incentive.label}</p>
                          {incentive.short_desc && (
                            <p className="text-xs text-muted-foreground">{incentive.short_desc}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {incentive.promo_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={incentive.is_active}
                            onCheckedChange={(checked) =>
                              toggleIncentiveMutation.mutate({ id: incentive.id, is_active: checked })
                            }
                          />
                          <Badge variant={incentive.is_active ? 'default' : 'secondary'}>
                            {incentive.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditIncentive(incentive)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Supprimer cet incentive ?')) {
                                deleteIncentiveMutation.mutate(incentive.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!incentives || incentives.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucun incentive configuré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Paramètres d'affichage
              </CardTitle>
              <CardDescription>
                Configurez quand et comment le popup doit s'afficher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config && (
                <>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="delay">Délai d'affichage (secondes)</Label>
                      <Input
                        id="delay"
                        type="number"
                        min={0}
                        value={config.display_delay_seconds}
                        onChange={(e) =>
                          handleConfigChange('display_delay_seconds', parseInt(e.target.value) || 0)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Temps avant affichage automatique
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scroll">Scroll déclencheur (%)</Label>
                      <Input
                        id="scroll"
                        type="number"
                        min={0}
                        max={100}
                        value={config.display_scroll_percent}
                        onChange={(e) =>
                          handleConfigChange('display_scroll_percent', parseInt(e.target.value) || 0)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        % de scroll pour déclencher
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cooldown">Cooldown (jours)</Label>
                      <Input
                        id="cooldown"
                        type="number"
                        min={1}
                        value={config.cooldown_days}
                        onChange={(e) =>
                          handleConfigChange('cooldown_days', parseInt(e.target.value) || 1)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Jours avant réaffichage si fermé
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="exclude">Pages exclues</Label>
                      <Textarea
                        id="exclude"
                        value={config.exclude_paths?.join('\n') || ''}
                        onChange={(e) =>
                          handleConfigChange(
                            'exclude_paths',
                            e.target.value.split('\n').filter(Boolean)
                          )
                        }
                        placeholder="/cart&#10;/checkout"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Une URL par ligne (ex: /cart, /checkout)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="include">Pages incluses (optionnel)</Label>
                      <Textarea
                        id="include"
                        value={config.include_paths?.join('\n') || ''}
                        onChange={(e) =>
                          handleConfigChange(
                            'include_paths',
                            e.target.value ? e.target.value.split('\n').filter(Boolean) : null
                          )
                        }
                        placeholder="Laisser vide pour toutes les pages"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Si rempli, popup uniquement sur ces pages
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveConfig}
                      disabled={!configDirty || saveConfigMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveConfigMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incentive Dialog */}
      <Dialog open={incentiveDialogOpen} onOpenChange={setIncentiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIncentive ? 'Modifier l\'incentive' : 'Nouvel incentive'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitIncentive} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inc-label">Libellé *</Label>
              <Input
                id="inc-label"
                value={incentiveForm.label}
                onChange={(e) => setIncentiveForm({ ...incentiveForm, label: e.target.value })}
                placeholder="-10% sur votre première commande"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inc-code">Code promo *</Label>
              <Input
                id="inc-code"
                value={incentiveForm.promo_code}
                onChange={(e) =>
                  setIncentiveForm({ ...incentiveForm, promo_code: e.target.value.toUpperCase() })
                }
                placeholder="WYDELINE10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inc-desc">Description courte (optionnel)</Label>
              <Input
                id="inc-desc"
                value={incentiveForm.short_desc}
                onChange={(e) => setIncentiveForm({ ...incentiveForm, short_desc: e.target.value })}
                placeholder="Valable 30 jours"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inc-order">Ordre d'affichage</Label>
                <Input
                  id="inc-order"
                  type="number"
                  min={1}
                  value={incentiveForm.sort_order}
                  onChange={(e) =>
                    setIncentiveForm({ ...incentiveForm, sort_order: parseInt(e.target.value) || 1 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={incentiveForm.is_active}
                    onCheckedChange={(checked) =>
                      setIncentiveForm({ ...incentiveForm, is_active: checked })
                    }
                  />
                  <span className="text-sm">
                    {incentiveForm.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIncentiveDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saveIncentiveMutation.isPending}>
                {saveIncentiveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PopupNewsletter;
