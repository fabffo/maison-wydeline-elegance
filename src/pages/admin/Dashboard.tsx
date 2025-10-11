import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  totalRevenue: number;
  recentNotifications: any[];
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentNotifications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch low stock variants
        const { data: lowStockVariants } = await supabase
          .from('product_variants')
          .select('product_id, stock_quantity, alert_threshold')
          .limit(100);

        const lowStockCount = lowStockVariants?.filter(v => 
          v.stock_quantity < v.alert_threshold
        ).length || 0;

        // Fetch pending orders
        const { count: pendingCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['PENDING', 'A_PREPARER']);

        // Fetch total revenue
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .in('status', ['PAID', 'EXPEDIE', 'LIVRE']);

        const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        // Fetch recent notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalProducts: productsCount || 0,
          lowStockProducts: lowStockCount,
          pendingOrders: pendingCount || 0,
          totalRevenue,
          recentNotifications: notifications || [],
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('dashboard-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            {stats.lowStockProducts > 0 && (
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-destructive flex items-center gap-1 mt-1"
                onClick={() => navigate('/admin/stocks?filter=outofstock')}
              >
                <AlertTriangle className="h-3 w-3" />
                {stats.lowStockProducts} en rupture
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commandes en attente</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">À préparer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentNotifications.filter(n => !n.read).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Non lues</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentNotifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune notification</p>
          ) : (
            <div className="space-y-3">
              {stats.recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.read && <Badge variant="secondary">Nouveau</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
