import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Truck, Package } from 'lucide-react';

export const Shipments = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchShipments();
    fetchReadyOrders();
  }, []);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*, orders(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les livraisons', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchReadyOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'A_PREPARER')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const createShipment = async (orderId: string, carrier: string, trackingNumber: string) => {
    try {
      const { error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          order_id: orderId,
          carrier,
          tracking_number: trackingNumber,
          shipment_date: new Date().toISOString(),
        });

      if (shipmentError) throw shipmentError;

      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'EXPEDIE' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      toast({ title: 'Livraison créée' });
      fetchShipments();
      fetchReadyOrders();
      setSelectedShipment(null);
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({ title: 'Erreur', description: 'Impossible de créer la livraison', variant: 'destructive' });
    }
  };

  const updateDeliveryStatus = async (shipmentId: string, delivered: boolean) => {
    try {
      const updates = delivered ? {
        delivery_date: new Date().toISOString()
      } : {};

      const { error: shipmentError } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', shipmentId);

      if (shipmentError) throw shipmentError;

      if (delivered) {
        const shipment = shipments.find(s => s.id === shipmentId);
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'LIVRE' })
          .eq('id', shipment.order_id);

        if (orderError) throw orderError;
      }

      toast({ title: 'Statut mis à jour' });
      fetchShipments();
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des livraisons</h1>
          <p className="text-muted-foreground">Gérez l'expédition et le suivi de vos commandes</p>
        </div>
      </div>

      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Commandes à préparer ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.customer_email}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Créer expédition
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Créer une expédition</DialogTitle>
                          </DialogHeader>
                          <form
                            className="space-y-4"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              createShipment(
                                order.id,
                                formData.get('carrier') as string,
                                formData.get('tracking') as string
                              );
                            }}
                          >
                            <div>
                              <Label htmlFor="carrier">Transporteur</Label>
                              <Input id="carrier" name="carrier" required />
                            </div>
                            <div>
                              <Label htmlFor="tracking">N° de suivi</Label>
                              <Input id="tracking" name="tracking" required />
                            </div>
                            <Button type="submit" className="w-full">Créer</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expéditions en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Transporteur</TableHead>
                <TableHead>N° de suivi</TableHead>
                <TableHead>Date d'expédition</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono text-sm">{shipment.order_id.slice(0, 8)}</TableCell>
                  <TableCell>{shipment.carrier || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-sm">{shipment.tracking_number || 'N/A'}</TableCell>
                  <TableCell>
                    {shipment.shipment_date 
                      ? new Date(shipment.shipment_date).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {shipment.delivery_date ? (
                      <span className="text-green-600">Livré</span>
                    ) : (
                      <span className="text-blue-600">En transit</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!shipment.delivery_date && (
                      <Button
                        size="sm"
                        onClick={() => updateDeliveryStatus(shipment.id, true)}
                      >
                        Marquer livré
                      </Button>
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
};
