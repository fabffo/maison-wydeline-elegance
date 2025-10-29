import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { products } = useProducts();
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const cartItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);

  const total = cartItems.reduce((sum, item) => {
    return sum + (item!.product.price * item!.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: 'Information requise',
        description: 'Veuillez remplir votre nom et email',
        variant: 'destructive',
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des produits avant de payer',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item!.product.id,
        productName: item!.product.name,
        size: item!.size,
        quantity: item!.quantity,
        unitPrice: item!.product.price,
      }));

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          items: orderItems,
        },
      });

      if (error) throw error;

      if (data?.url) {
        clearCart();
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du paiement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h1 className="text-2xl font-medium mb-4">Votre panier est vide</h1>
            <Button onClick={() => navigate('/collection')}>
              Continuer vos achats
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-medium mb-8">Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={`${item!.productId}-${item!.size}`} className="flex gap-4 p-4 bg-card rounded-lg border">
                <img
                  src={item!.product.images[0]}
                  alt={item!.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item!.product.name}</h3>
                  <p className="text-sm text-muted-foreground">Taille: {item!.size}</p>
                  <p className="text-sm font-medium mt-2">€{item!.product.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item!.productId, item!.size, item!.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item!.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item!.productId, item!.size, item!.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item!.productId, item!.size)}
                      className="ml-auto"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <div className="p-6 bg-card rounded-lg border space-y-4">
              <h2 className="text-xl font-medium">Informations</h2>
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="p-6 bg-card rounded-lg border space-y-4">
              <h2 className="text-xl font-medium">Récapitulatif</h2>
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Chargement...' : 'Payer avec Stripe'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
