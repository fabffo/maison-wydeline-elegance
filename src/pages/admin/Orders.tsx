import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  A_PREPARER: 'default',
  EXPEDIE: 'outline',
  LIVRE: 'outline',
  RETOUR: 'destructive',
};

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  A_PREPARER: 'À préparer',
  EXPEDIE: 'Expédié',
  LIVRE: 'Livré',
  RETOUR: 'Retour',
};

export const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les commandes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus as any })
        .eq('id', orderId);

      if (error) throw error;

      toast({ title: 'Statut mis à jour' });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' });
    }
  };

  const exportOrders = () => {
    const csv = [
      'ID,Date,Client,Email,Montant,Statut',
      ...orders.map(o => 
        `${o.id},${new Date(o.created_at).toLocaleDateString()},${o.customer_name || ''},${o.customer_email},${o.total_amount},${statusLabels[o.status]}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des commandes</h1>
          <p className="text-muted-foreground">Suivez et gérez toutes vos commandes</p>
        </div>
        <Button variant="outline" onClick={exportOrders}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{Number(order.total_amount).toFixed(2)} €</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status]}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        fetchOrderItems(order.id);
                      }}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informations client</h3>
                  <p className="text-sm">{selectedOrder.customer_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Changer le statut</h3>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A_PREPARER">À préparer</SelectItem>
                      <SelectItem value="EXPEDIE">Expédié</SelectItem>
                      <SelectItem value="LIVRE">Livré</SelectItem>
                      <SelectItem value="RETOUR">Retour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Articles commandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{Number(item.unit_price).toFixed(2)} €</TableCell>
                        <TableCell>{Number(item.total_price).toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold">
                  Total: {Number(selectedOrder.total_amount).toFixed(2)} €
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
