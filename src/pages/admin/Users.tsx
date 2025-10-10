import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Group roles by user
      const usersMap = new Map();
      rolesData?.forEach(role => {
        if (!usersMap.has(role.user_id)) {
          usersMap.set(role.user_id, {
            user_id: role.user_id,
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
                <TableHead>ID Utilisateur</TableHead>
                <TableHead>Rôles actuels</TableHead>
                <TableHead>Date d'ajout</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
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
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
