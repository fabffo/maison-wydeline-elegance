import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import heroImage from '@/assets/hero-main.jpg';
import logoWhite from '@/assets/logo-wydeline-white.png';

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
}

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch some products to showcase
    const fetchProducts = async () => {
      try {
        const response = await fetch('/products.json');
        const data = await response.json();
        // Take first 4 products for showcase
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.toLowerCase().trim() });
      
      if (error) {
        if (error.code === '23505') {
          toast.info('Cette adresse email est déjà inscrite !');
        } else {
          throw error;
        }
      } else {
        toast.success('Merci ! Vous serez informé(e) du lancement.');
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-luxury-dark">
      {/* Hero Section */}
      <section className="h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          {/* Logo */}
          <img 
            src={logoWhite} 
            alt="Maison Wydeline" 
            className="h-16 md:h-20 mx-auto mb-8 animate-fade-in"
          />
          
          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Bientôt Disponible
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-4 max-w-3xl mx-auto text-white/90 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            L'élégance en grandes pointures
          </p>
          
          <p className="text-base md:text-lg mb-12 max-w-2xl mx-auto text-white/70 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Maison Wydeline réinvente le chaussant féminin pour les pointures 41 à 45. 
            Des créations élégantes, confortables et durables, fabriquées en Europe.
          </p>
          
          {/* Newsletter signup */}
          <form 
            onSubmit={handleNewsletterSubmit}
            className="max-w-md mx-auto animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            <p className="text-white/80 mb-4 text-sm">
              Inscrivez-vous pour être informé(e) du lancement
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
              <Button 
                type="submit" 
                variant="secondary"
                disabled={isSubmitting}
                className="whitespace-nowrap"
              >
                {isSubmitting ? 'Envoi...' : 'Me prévenir'}
              </Button>
            </div>
          </form>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 text-center">
            Découvrez nos créations
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Un aperçu de notre première collection, pensée pour sublimer les grandes pointures
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-luxury-cream">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-medium text-sm md:text-base">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">{product.price} €</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-luxury-cream">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">
            Nos Engagements
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Élégance</h3>
              <p className="text-muted-foreground">
                Des designs raffinés qui subliment les grandes pointures avec style et sophistication.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Responsabilité</h3>
              <p className="text-muted-foreground">
                Fabrication européenne, sans transport aérien, emballages durables et réparabilité.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Qualité</h3>
              <p className="text-muted-foreground">
                Cuirs premium, savoir-faire artisanal et confort pensé pour une durabilité maximale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-medium mb-6">
            Restez informée
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Soyez la première à découvrir notre collection et bénéficiez d'offres exclusives de lancement.
          </p>
          
          <form 
            onSubmit={handleNewsletterSubmit}
            className="max-w-md mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
              <Button 
                type="submit" 
                variant="secondary"
                disabled={isSubmitting}
                className="whitespace-nowrap"
              >
                {isSubmitting ? 'Envoi...' : 'S\'inscrire'}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-luxury-dark text-white/60 text-center text-sm">
        <p>© 2024 Maison Wydeline. Tous droits réservés.</p>
      </footer>
    </main>
  );
};

export default ComingSoon;
