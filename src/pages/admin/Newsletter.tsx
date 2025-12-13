import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Newsletter = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredSubscribers = subscribers?.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeCount = subscribers?.filter(s => s.is_active).length || 0;

  const exportToCSV = () => {
    if (!subscribers || subscribers.length === 0) return;

    const csvContent = [
      ['Email', 'Date inscription', 'Actif', 'Source'].join(','),
      ...subscribers.map(sub => [
        sub.email,
        format(new Date(sub.subscribed_at), 'dd/MM/yyyy HH:mm'),
        sub.is_active ? 'Oui' : 'Non',
        sub.source || 'coming_soon'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">Gérer les inscriptions à la newsletter</p>
        </div>
        <Button onClick={exportToCSV} disabled={!subscribers?.length}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total inscrits</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <Badge variant="default" className="bg-green-500">{activeCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Désinscrits</CardTitle>
            <Badge variant="secondary">{(subscribers?.length || 0) - activeCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {(subscribers?.length || 0) - activeCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun abonné pour le moment'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {format(new Date(subscriber.subscribed_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscriber.source || 'coming_soon'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                        {subscriber.is_active ? 'Actif' : 'Désinscrit'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Newsletter;
