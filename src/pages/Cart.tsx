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
import { Trash2, ShoppingBag, Tag, X, Check, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface AppliedPromo {
  id: string;
  code: string;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number | null;
  minCartAmount: number | null;
  label: string | null;
}

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
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

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

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item!.product.price * item!.quantity);
  }, 0);

  // Calculate discount
  const calculateDiscount = (): number => {
    if (!appliedPromo) return 0;
    
    if (appliedPromo.minCartAmount && subtotal < appliedPromo.minCartAmount) {
      return 0;
    }
    
    if (appliedPromo.type === 'percent' && appliedPromo.value) {
      return subtotal * (appliedPromo.value / 100);
    }
    if (appliedPromo.type === 'fixed' && appliedPromo.value) {
      return Math.min(appliedPromo.value, subtotal);
    }
    return 0;
  };

  const discount = calculateDiscount();
  const total = subtotal - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    setPromoError(null);
    
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        setPromoError('Code promo invalide ou expiré');
        return;
      }
      
      // Check dates
      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now) {
        setPromoError('Ce code promo n\'est pas encore actif');
        return;
      }
      if (data.ends_at && new Date(data.ends_at) < now) {
        setPromoError('Ce code promo a expiré');
        return;
      }
      
      // Check usage limit
      if (data.usage_limit_total && data.used_count >= data.usage_limit_total) {
        setPromoError('Ce code promo a atteint sa limite d\'utilisation');
        return;
      }
      
      // Check min cart amount
      if (data.min_cart_amount && subtotal < data.min_cart_amount) {
        setPromoError(`Minimum d'achat requis: €${data.min_cart_amount}`);
        return;
      }
      
      setAppliedPromo({
        id: data.id,
        code: data.code,
        type: data.type as 'percent' | 'fixed' | 'free_shipping',
        value: data.value,
        minCartAmount: data.min_cart_amount,
        label: data.label,
      });
      
      toast({
        title: 'Code promo appliqué',
        description: data.label || `${data.code} activé`,
      });
      
      setPromoCode('');
    } catch (err) {
      setPromoError('Erreur lors de la validation du code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

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
        isPreorder: item!.isPreorder || false,
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
          promoCode: appliedPromo?.code || null,
        },
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.url) {
        // Detect if we're in an iframe (Lovable preview) - Stripe doesn't work in iframes
        const isInIframe = window.self !== window.top;
        if (isInIframe) {
          // In preview: open new tab
          window.open(response.data.url, '_blank');
        } else {
          // In production: redirect in same tab
          window.location.href = response.data.url;
        }
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

                {/* Promo Code Section */}
                <div className="p-6 bg-card rounded-lg border space-y-4">
                  <h2 className="text-xl font-medium flex items-center gap-2">
                    <Tag size={20} />
                    Code promo
                  </h2>
                  
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-primary" />
                        <div>
                          <span className="font-medium">{appliedPromo.code}</span>
                          {appliedPromo.type === 'percent' && appliedPromo.value && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (-{appliedPromo.value}%)
                            </span>
                          )}
                          {appliedPromo.type === 'fixed' && appliedPromo.value && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (-€{appliedPromo.value})
                            </span>
                          )}
                          {appliedPromo.type === 'free_shipping' && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (Livraison offerte)
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Entrez votre code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        className="uppercase"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                      >
                        {promoLoading ? <Loader2 size={16} className="animate-spin" /> : 'Appliquer'}
                      </Button>
                    </div>
                  )}
                  
                  {promoError && (
                    <p className="text-sm text-destructive">{promoError}</p>
                  )}
                </div>

                <div className="p-6 bg-card rounded-lg border space-y-4">
                  <h2 className="text-xl font-medium">Récapitulatif</h2>
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedPromo && discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Réduction ({appliedPromo.code})</span>
                      <span>-€{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium text-lg border-t pt-4">
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
