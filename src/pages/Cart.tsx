import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ShoppingBag } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const checkoutSchema = z.object({
  nomComplet: z.string().trim().min(1, 'Le nom est requis').max(100, 'Maximum 100 caractères'),
  email: z.string().trim().email('Email invalide').max(255, 'Maximum 255 caractères'),
  telephone: z.string().trim().min(10, 'Téléphone invalide').max(20, 'Maximum 20 caractères'),
  adresse1: z.string().trim().min(1, 'L\'adresse est requise').max(200, 'Maximum 200 caractères'),
  adresse2: z.string().trim().max(200, 'Maximum 200 caractères').optional(),
  codePostal: z.string().trim().min(4, 'Code postal invalide').max(10, 'Maximum 10 caractères'),
  ville: z.string().trim().min(1, 'La ville est requise').max(100, 'Maximum 100 caractères'),
  pays: z.string().trim().length(2, 'Code pays ISO2 requis').default('FR'),
});

const Cart = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem } = useCart();
  const { products } = useProducts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nomComplet: '',
      email: '',
      telephone: '',
      adresse1: '',
      adresse2: '',
      codePostal: '',
      ville: '',
      pays: 'FR',
    },
  });

  const cartItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);

  const total = cartItems.reduce((sum, item) => {
    return sum + (item!.product.price * item!.quantity);
  }, 0);

  const handleCheckout = async (values: z.infer<typeof checkoutSchema>) => {
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

      const shippingAddress = {
        nomComplet: values.nomComplet,
        adresse1: values.adresse1,
        adresse2: values.adresse2 || '',
        codePostal: values.codePostal,
        ville: values.ville,
        pays: values.pays,
      };

      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          customerName: values.nomComplet,
          customerEmail: values.email,
          phone: values.telephone,
          shippingAddress,
          items: orderItems,
        },
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.url) {
        // Ouvrir Stripe Checkout dans un nouvel onglet
        window.open(response.data.url, '_blank');
        
        toast({
          title: 'Redirection vers le paiement',
          description: 'Une nouvelle fenêtre s\'est ouverte pour finaliser votre paiement',
        });
      } else {
        throw new Error('Aucune URL de paiement reçue');
      }
    } catch (error: any) {
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-6">
                <div className="p-6 bg-card rounded-lg border space-y-4">
                  <h2 className="text-xl font-medium">Informations personnelles</h2>
                  
                  <FormField
                    control={form.control}
                    name="nomComplet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@exemple.fr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input placeholder="0612345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-6 bg-card rounded-lg border space-y-4">
                  <h2 className="text-xl font-medium">Adresse de livraison</h2>
                  
                  <FormField
                    control={form.control}
                    name="adresse1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 rue de la Paix" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adresse2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complément d'adresse (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Appartement, étage, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="codePostal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal *</FormLabel>
                          <FormControl>
                            <Input placeholder="75001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ville"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville *</FormLabel>
                          <FormControl>
                            <Input placeholder="Paris" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays (code ISO2) *</FormLabel>
                        <FormControl>
                          <Input placeholder="FR" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    type="submit"
                    disabled={loading || !form.formState.isValid}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Chargement...' : 'Payer avec Stripe'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
