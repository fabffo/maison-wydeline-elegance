import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download } from 'lucide-react';

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  invoice?: {
    invoice_number: string;
    id: string;
  };
  order_items: Array<{
    product_name: string;
    size: number;
    quantity: number;
    unit_price: number;
  }>;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        // In a real implementation, you'd call an edge function to verify the session
        // and retrieve the order details
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </main>
    );
  }

  if (!sessionId) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Session invalide</h1>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
          <h1 className="text-3xl font-medium mb-2">Paiement réussi !</h1>
          <p className="text-muted-foreground">
            Merci pour votre commande. Un email de confirmation vous a été envoyé.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-4">
          <div>
            <h2 className="text-xl font-medium mb-4">Détails de la commande</h2>
            <p className="text-sm text-muted-foreground">
              Votre facture sera générée automatiquement et disponible sous peu.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild className="flex-1">
              <Link to="/collection">Continuer vos achats</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
