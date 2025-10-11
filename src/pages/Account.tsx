import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, ShoppingBag, LogOut, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';

export default function Account() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const { hasRole, loading: roleLoading } = useUserRole();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    setUser(session.user);
    await fetchOrders(session.user.id, session.user.email);
    setLoading(false);
  };

  const fetchOrders = async (userId: string, email: string | undefined) => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`user_id.eq.${userId},customer_email.eq.${email}`)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Déconnexion réussie',
      description: 'À bientôt !',
    });
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'secondary',
      PAID: 'default',
      A_PREPARER: 'outline',
      EXPEDIE: 'default',
      LIVRE: 'default',
      CANCELLED: 'destructive',
      RETOUR: 'destructive',
    };

    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAID: 'Payée',
      A_PREPARER: 'À préparer',
      EXPEDIE: 'Expédiée',
      LIVRE: 'Livrée',
      CANCELLED: 'Annulée',
      RETOUR: 'Retour',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mon Compte</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {!roleLoading && hasRole('BACKOFFICE') && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Accès Back-Office</h3>
                    <p className="text-sm text-muted-foreground">
                      Gérez les commandes, produits et expéditions
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/admin')}>
                  Accéder au Back-Office
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Mes commandes
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Historique des commandes</CardTitle>
                <CardDescription>
                  Retrouvez toutes vos commandes passées
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Aucune commande pour le moment</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/collection')}
                    >
                      Découvrir la collection
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-medium">
                                Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {order.order_items?.length} article(s)
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.product_name} - Taille {item.size}
                                </span>
                                <span className="text-muted-foreground">
                                  {item.quantity} × {item.unit_price}€
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t mt-4 pt-4 flex justify-between font-medium">
                            <span>Total</span>
                            <span>{order.total_amount}€</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Compte créé le</p>
                  <p className="text-muted-foreground">
                    {new Date(user?.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
