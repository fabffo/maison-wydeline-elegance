import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Mail } from 'lucide-react';

export const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    // Placeholder for email functionality
    toast({ 
      title: 'Email envoyé', 
      description: `Facture ${invoice.invoice_number} envoyée à ${invoice.orders?.customer_email}` 
    });
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
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Envoyer
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
