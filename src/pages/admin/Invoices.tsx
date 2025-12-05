import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Mail, Loader2 } from 'lucide-react';

export const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, orders(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les factures', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const sendInvoiceEmail = async (invoice: any) => {
    if (!invoice.orders?.customer_email) {
      toast({ 
        title: 'Erreur', 
        description: 'Aucun email client trouvé pour cette facture',
        variant: 'destructive'
      });
      return;
    }

    setSendingId(invoice.id);

    try {
      // Fetch order items for this order
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', invoice.order_id);

      if (itemsError) throw itemsError;

      // Parse shipping address from order
      const shippingAddress = invoice.orders?.shipping_address as any;

      const response = await supabase.functions.invoke('send-invoice', {
        body: {
          customerName: invoice.orders?.customer_name || 'Client',
          customerEmail: invoice.orders?.customer_email,
          invoiceNumber: invoice.invoice_number,
          invoiceDate: new Date(invoice.invoice_date).toLocaleDateString('fr-FR'),
          orderNumber: invoice.order_id.slice(0, 8).toUpperCase(),
          totalAmount: Number(invoice.orders?.total_amount) || 0,
          items: orderItems?.map((item: any) => ({
            productName: item.product_name,
            size: item.size,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            totalPrice: Number(item.total_price)
          })) || [],
          shippingAddress: shippingAddress ? {
            adresse1: shippingAddress.adresse1 || '',
            adresse2: shippingAddress.adresse2 || '',
            codePostal: shippingAddress.codePostal || '',
            ville: shippingAddress.ville || '',
            pays: shippingAddress.pays || 'FR'
          } : undefined
        }
      });

      if (response.error) throw response.error;

      toast({ 
        title: 'Email envoyé avec PDF', 
        description: `Facture ${invoice.invoice_number} envoyée à ${invoice.orders?.customer_email}` 
      });
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      toast({ 
        title: 'Erreur', 
        description: `Impossible d'envoyer l'email: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setSendingId(null);
    }
  };

  const exportInvoices = () => {
    const csv = [
      'N° Facture,Date,Commande,Client,Montant',
      ...invoices.map(i => 
        `${i.invoice_number},${new Date(i.invoice_date).toLocaleDateString()},${i.order_id.slice(0, 8)},${i.orders?.customer_email || ''},${i.orders?.total_amount || 0}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des factures</h1>
          <p className="text-muted-foreground">Consultez et gérez vos factures</p>
        </div>
        <Button variant="outline" onClick={exportInvoices}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-mono text-sm">{invoice.order_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.orders?.customer_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{invoice.orders?.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{Number(invoice.orders?.total_amount || 0).toFixed(2)} €</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {invoice.pdf_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </a>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => sendInvoiceEmail(invoice)}
                        disabled={sendingId === invoice.id}
                      >
                        {sendingId === invoice.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-1" />
                        )}
                        {sendingId === invoice.id ? 'Envoi...' : 'Envoyer'}
                      </Button>
                    </div>
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
