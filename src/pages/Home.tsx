import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Heart, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-main.jpg';
import saoJoaoMadeira from '@/assets/sao-joao-madeira.jpg';
import nosValeurs from '@/assets/nos-valeurs.png';

// Import product images for category grid
import bottinesNoires from '@/assets/ankle-boots-black.jpg';
import bottinesBordeaux from '@/assets/ankle-boots-bordeaux.jpg';
import bottesVertes from '@/assets/boots-green-suede.jpg';
import platesNoires from '@/assets/flats-white.jpg';

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  featured_area: string;
  featured_priority: number;
  featured_label: string | null;
  images: string[];
}

const Home = () => {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Record<string, FeaturedProduct[]>>({
    HERO: [],
    CAROUSEL: [],
    GRID: [],
    NEW: [],
    BEST: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const now = new Date().toISOString();
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .or(`featured_start_at.is.null,featured_start_at.lte.${now}`)
        .or(`featured_end_at.is.null,featured_end_at.gte.${now}`)
        .order('featured_priority', { ascending: true });

      if (productsError) throw productsError;

      const productIds = productsData?.map(p => p.id) || [];
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('product_id, image_url, position')
        .in('product_id', productIds)
        .order('position');

      const enrichedProducts = productsData?.map(dbProduct => {
        const productImages = imagesData?.filter(img => img.product_id === dbProduct.id) || [];
        return {
          ...dbProduct,
          slug: dbProduct.slug || dbProduct.id,
          images: productImages.map(img => img.image_url),
        };
      }) || [];

      const grouped: Record<string, FeaturedProduct[]> = {
        HERO: [],
        CAROUSEL: [],
        GRID: [],
        NEW: [],
        BEST: [],
      };

      enrichedProducts.forEach((product) => {
        if (product.featured_area && grouped[product.featured_area]) {
          grouped[product.featured_area].push(product);
        }
      });

      setFeaturedProducts(grouped);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    );
  }

  const heroProduct = featuredProducts.HERO[0];

  // Category cards for the grid
  const categories = [
    { name: 'Bottines', image: bottinesNoires, link: '/collection?category=bottines' },
    { name: 'Bottes', image: bottesVertes, link: '/collection?category=bottes' },
    { name: 'Plates', image: platesNoires, link: '/collection?category=plates' },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section - Full Width Banner */}
      <section className="relative min-h-[90vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: heroProduct && heroProduct.images[0] 
              ? `url(${heroProduct.images[0]})` 
              : `url(${heroImage})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark/70 via-luxury-dark/40 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/80 mb-4 animate-fade-in">
              Du 41 au 45 • Fabriquées au Portugal
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground mb-6 animate-fade-in leading-[1.1]">
              L'élégance
              <br />
              <span className="font-medium">n'a pas de pointure</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in max-w-lg" style={{ animationDelay: '0.2s' }}>
              Des chaussures raffinées pour les femmes qui chaussent grand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/collection">
                <Button size="lg" className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8">
                  Découvrir la collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcement Bar */}
      <section className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm tracking-wide">
            <span className="font-medium">Livraison offerte</span> en France métropolitaine • Retours gratuits sous 30 jours
          </p>
        </div>
      </section>

      {/* Category Grid - Allbirds Style */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-4">Nos Collections</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Chaque modèle est pensé dès le départ pour les grandes pointures
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={category.link}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-luxury-cream"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl md:text-2xl font-medium text-primary-foreground mb-2">{category.name}</h3>
                  <span className="inline-flex items-center text-sm text-primary-foreground/90 group-hover:underline">
                    Découvrir <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      {featuredProducts.CAROUSEL.length > 0 && (
        <section className="py-16 md:py-24 bg-luxury-cream">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Sélection</p>
                <h2 className="text-3xl md:text-4xl font-light">Nos Incontournables</h2>
              </div>
              <Link to="/collection" className="hidden md:inline-flex items-center text-sm hover:underline">
                Tout voir <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.CAROUSEL.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/produit/${product.slug}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-background mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    {product.featured_label && (
                      <Badge variant="secondary" className="mb-2 text-xs">{product.featured_label}</Badge>
                    )}
                    <h3 className="font-medium text-foreground group-hover:underline">{product.name}</h3>
                    <p className="text-muted-foreground">{product.price} €</p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link to="/collection">
                <Button variant="outline">Voir toute la collection</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Value Proposition - Allbirds Style Split */}
      <section className="bg-background">
        <div className="grid lg:grid-cols-2 min-h-[70vh]">
          <div className="relative aspect-square lg:aspect-auto">
            <img
              src={saoJoaoMadeira}
              alt="São João da Madeira, capitale portugaise de la chaussure"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center p-8 lg:p-16">
            <div className="max-w-lg">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Savoir-faire</p>
              <h2 className="text-3xl md:text-4xl font-light mb-6 leading-tight">
                Fabriquées au Portugal, 
                <br />
                <span className="font-medium">avec exigence</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Nous travaillons avec des ateliers portugais reconnus pour leur excellence artisanale. 
                Cuir de qualité, finitions impeccables et respect des standards européens.
              </p>
              <Link to="/la-marque">
                <Button variant="outline" className="group">
                  Découvrir notre histoire
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* USP Icons Row */}
      <section className="py-16 md:py-20 bg-luxury-cream">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Élégance intemporelle</h3>
              <p className="text-sm text-muted-foreground">
                Des designs raffinés qui subliment toutes les silhouettes
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Confort pensé</h3>
              <p className="text-sm text-muted-foreground">
                Chaque modèle est conçu pour les grandes pointures
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Qualité durable</h3>
              <p className="text-sm text-muted-foreground">
                Matériaux premium, loin de la fast fashion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      {featuredProducts.NEW.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Nouveautés</p>
              <h2 className="text-3xl md:text-4xl font-light">Derniers modèles</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredProducts.NEW.slice(0, 3).map((product) => (
                <Link key={product.id} to={`/produit/${product.slug}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-luxury-cream mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    {product.featured_label && (
                      <Badge variant="secondary" className="mb-2 text-xs">{product.featured_label}</Badge>
                    )}
                    <h3 className="font-medium text-foreground group-hover:underline">{product.name}</h3>
                    <p className="text-muted-foreground">{product.price} €</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers - Large Cards */}
      {featuredProducts.BEST.length > 0 && (
        <section className="py-16 md:py-24 bg-luxury-cream">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Best-sellers</p>
              <h2 className="text-3xl md:text-4xl font-light">Les plus aimées</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {featuredProducts.BEST.slice(0, 2).map((product) => (
                <Link key={product.id} to={`/produit/${product.slug}`} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-lg bg-background mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center">
                    {product.featured_label && (
                      <Badge variant="secondary" className="mb-2 text-xs">{product.featured_label}</Badge>
                    )}
                    <h3 className="font-medium text-lg text-foreground group-hover:underline">{product.name}</h3>
                    <p className="text-muted-foreground">{product.price} €</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEO Content Section - Collapsible/Minimal */}
      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <h2 className="text-2xl font-light text-foreground mb-8">
              Chaussures grandes tailles femme : élégance et exigence
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
              <div>
                <p className="mb-4">
                  Trouver de belles chaussures élégantes quand on chausse du 41 au 45 reste un véritable défi.
                  Chez <strong className="text-foreground">Maison Wydeline</strong>, nous créons des chaussures grandes tailles pour femmes, 
                  pensées pour sublimer toutes les silhouettes.
                </p>
                <p>
                  Nos modèles s'adressent aux femmes qui recherchent des chaussures élégantes grande taille, 
                  adaptées au quotidien comme aux occasions spéciales.
                </p>
              </div>
              <div>
                <p className="mb-4">
                  Toutes nos chaussures sont <strong className="text-foreground">fabriquées au Portugal</strong>, 
                  pays reconnu pour son excellence artisanale dans la chaussure haut de gamme.
                </p>
                <p>
                  Contrairement aux modèles simplement "agrandis", nos chaussures sont conçues dès le départ 
                  pour les grandes pointures : cambrure, largeur, stabilité du talon, maintien du pied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-light mb-6">
            Prête à découvrir votre paire idéale ?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Explorez notre collection de chaussures élégantes du 41 au 45.
          </p>
          <Link to="/collection">
            <Button size="lg" variant="secondary" className="group">
              Explorer la collection
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
