import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Pencil } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '' });
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch profiles to get names
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Create a map of profiles by user_id
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Group roles by user
      const usersMap = new Map();
      rolesData?.forEach(role => {
        if (!usersMap.has(role.user_id)) {
          const profile = profilesMap.get(role.user_id);
          usersMap.set(role.user_id, {
            user_id: role.user_id,
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            roles: [],
            created_at: role.created_at
          });
        }
        usersMap.get(role.user_id).roles.push(role.role);
      });

      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, currentRoles: string[], newRole: string) => {
    if (!isAdmin) {
      toast({ title: 'Accès refusé', description: 'Seuls les administrateurs peuvent modifier les rôles', variant: 'destructive' });
      return;
    }

    try {
      // Remove all existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Add new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as any }]);

      if (insertError) throw insertError;

      toast({ title: 'Rôle mis à jour' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le rôle', variant: 'destructive' });
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || ''
    });
  };

  const updateUserProfile = async () => {
    if (!isAdmin || !editingUser) {
      toast({ title: 'Accès refusé', description: 'Seuls les administrateurs peuvent modifier les profils', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: editingUser.user_id,
          first_name: editForm.first_name.trim(),
          last_name: editForm.last_name.trim()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({ title: 'Profil mis à jour' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les rôles et permissions des utilisateurs</p>
        </div>
        <Shield className="h-8 w-8 text-muted-foreground" />
      </div>

      {!isAdmin && (
        <Card className="border-yellow-500">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-600">
              ⚠️ Vous n'avez pas les permissions pour modifier les rôles utilisateur.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>ID Utilisateur</TableHead>
                <TableHead>Rôles actuels</TableHead>
                <TableHead>Date d'ajout</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.first_name || '-'}</TableCell>
                  <TableCell>{user.last_name || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{user.user_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.roles.map((role: string) => (
                        <Badge 
                          key={role} 
                          variant={role === 'ADMIN' ? 'default' : 'secondary'}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Select
                          value={user.roles[0] || 'USER'}
                          onValueChange={(value) => updateUserRole(user.user_id, user.roles, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="BACKOFFICE">BACKOFFICE</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                placeholder="Prénom"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                placeholder="Nom"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Annuler
              </Button>
              <Button onClick={updateUserProfile}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
