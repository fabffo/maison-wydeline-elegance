import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-main.jpg';

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
      
      // Fetch featured products from database
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .or(`featured_start_at.is.null,featured_start_at.lte.${now}`)
        .or(`featured_end_at.is.null,featured_end_at.gte.${now}`)
        .order('featured_priority', { ascending: true });

      if (productsError) throw productsError;

      // Fetch product images
      const productIds = productsData?.map(p => p.id) || [];
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('product_id, image_url, position')
        .in('product_id', productIds)
        .order('position');

      // Map database products with images
      const enrichedProducts = productsData?.map(dbProduct => {
        const productImages = imagesData?.filter(img => img.product_id === dbProduct.id) || [];
        return {
          ...dbProduct,
          slug: dbProduct.slug || dbProduct.id,
          images: productImages.map(img => img.image_url),
        };
      }) || [];

      // Group by area
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

  return (
    <main className="min-h-screen">
      {/* Hero Section - Dynamic or Static */}
      <section className="h-screen snap-start relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: heroProduct && heroProduct.images[0] 
              ? `url(${heroProduct.images[0]})` 
              : `url(${heroImage})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-white">
          {heroProduct ? (
            <>
              {heroProduct.featured_label && (
                <Badge className="mb-4 text-lg px-4 py-2">{heroProduct.featured_label}</Badge>
              )}
              <h1 className="text-5xl md:text-7xl font-medium mb-6 animate-fade-in max-w-4xl leading-tight">
                Chaussures élégantes grandes tailles pour femmes – du 41 au 45 – Fabriquées au Portugal
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {heroProduct.price} €
              </p>
              <Link to={`/produit/${heroProduct.slug}`}>
                <Button size="lg" variant="secondary" className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  Découvrir
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-medium mb-6 animate-fade-in max-w-4xl leading-tight">
                Chaussures élégantes grandes tailles pour femmes – du 41 au 45 – Fabriquées au Portugal
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {t.hero.subtitle}
              </p>
              <Link to="/collection">
                <Button size="lg" variant="secondary" className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  {t.hero.cta}
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-lg leading-relaxed mb-8">
              Trouver de belles chaussures élégantes quand on chausse du 41 au 45 reste encore aujourd'hui un véritable défi.
              Chez <strong>Maison Wydeline</strong>, nous avons fait le choix de créer une marque dédiée aux femmes qui refusent de choisir entre style, confort et qualité, quelle que soit leur pointure.
            </p>

            <h2 className="text-3xl font-medium mt-12 mb-6">Chaussures grandes tailles femme : élégance et exigence</h2>
            <p className="text-lg leading-relaxed mb-6">
              Maison Wydeline propose une collection de <strong>chaussures grandes tailles pour femmes</strong>, du 41 au 45, pensées pour sublimer toutes les silhouettes. Escarpins, bottines ou sandales sont dessinés avec une attention particulière portée à l'équilibre, au maintien et à la féminité, souvent négligés dans les grandes pointures.
            </p>
            <p className="text-lg leading-relaxed mb-8">
              Nos modèles s'adressent aux femmes qui recherchent des <strong>chaussures élégantes grande taille</strong>, adaptées aussi bien au quotidien qu'aux occasions spéciales : travail, soirée, cérémonie ou mariage.
            </p>

            <h2 className="text-3xl font-medium mt-12 mb-6">Fabrication européenne : le savoir-faire portugais</h2>
            <p className="text-lg leading-relaxed mb-6">
              Toutes nos chaussures sont <strong>fabriquées au Portugal</strong>, pays reconnu pour son excellence artisanale dans la chaussure haut de gamme.
              Nous travaillons avec des ateliers européens sélectionnés pour leur maîtrise du cuir, la qualité des finitions et le respect des standards de fabrication.
            </p>
            <p className="text-lg leading-relaxed mb-4">Choisir Maison Wydeline, c'est faire le choix de :</p>
            <ul className="list-disc list-inside space-y-2 mb-8 text-lg">
              <li>Matériaux durables et soigneusement sélectionnés</li>
              <li>Confort pensé pour les pieds féminins grandes tailles</li>
              <li>Chaussures conçues pour durer, loin de la fast fashion</li>
            </ul>

            <h2 className="text-3xl font-medium mt-12 mb-6">Des chaussures pensées pour les grandes pointures</h2>
            <p className="text-lg leading-relaxed mb-6">
              Contrairement aux modèles simplement "agrandis", nos chaussures sont <strong>conçues dès le départ pour les grandes pointures</strong>.
              Chaque détail compte : cambrure, largeur, stabilité du talon, maintien du pied.
            </p>
            <p className="text-lg leading-relaxed mb-8">
              Notre objectif est simple : offrir aux femmes chaussant du 41 au 45 des chaussures aussi élégantes que confortables, sans compromis.
            </p>

            <h2 className="text-3xl font-medium mt-12 mb-6">Une marque engagée pour les femmes</h2>
            <p className="text-lg leading-relaxed mb-6">
              Maison Wydeline est née d'un constat : trop peu de marques proposent de chaussures féminines et raffinées en grande taille.
              Nous avons choisi de créer une alternative premium, respectueuse du pied, du style et du savoir-faire européen.
            </p>
            <p className="text-lg leading-relaxed">
              Nous livrons en France et en Europe, avec un service client attentif et une expérience d'achat pensée pour vous accompagner en toute confiance.
            </p>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      {featuredProducts.CAROUSEL.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-medium mb-12 text-center">Notre Sélection</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.CAROUSEL.slice(0, 4).map((product) => (
                <div key={product.id} className="relative">
                  <Link to={`/produit/${product.slug}`}>
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-luxury-cream">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="mt-4">
                      {product.featured_label && (
                        <Badge className="mb-2">{product.featured_label}</Badge>
                      )}
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-muted-foreground">{product.price} €</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="min-h-screen snap-start bg-luxury-cream py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-medium text-center mb-20">{t.values.title}</h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-medium mb-4">{t.values.excellence.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.values.excellence.text}</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-medium mb-4">{t.values.elegance.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.values.elegance.text}</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-medium mb-4">{t.values.comfort.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.values.comfort.text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      {featuredProducts.NEW.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-medium mb-12 text-center">Nouveautés</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredProducts.NEW.slice(0, 3).map((product) => (
                <div key={product.id}>
                  <Link to={`/produit/${product.slug}`}>
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-luxury-cream">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="mt-4">
                      {product.featured_label && (
                        <Badge className="mb-2">{product.featured_label}</Badge>
                      )}
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-muted-foreground">{product.price} €</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      {featuredProducts.BEST.length > 0 && (
        <section className="py-24 bg-luxury-cream">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-medium mb-12 text-center">Meilleures Ventes</h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {featuredProducts.BEST.slice(0, 2).map((product) => (
                <div key={product.id}>
                  <Link to={`/produit/${product.slug}`}>
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="mt-4">
                      {product.featured_label && (
                        <Badge className="mb-2">{product.featured_label}</Badge>
                      )}
                      <h3 className="font-medium text-xl">{product.name}</h3>
                      <p className="text-muted-foreground text-lg">{product.price} €</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid Section */}
      {featuredProducts.GRID.length > 0 && (
        <section className="h-screen snap-start grid md:grid-cols-2">
          {featuredProducts.GRID.slice(0, 2).map((product) => (
            <Link key={product.id} to={`/produit/${product.slug}`} className="relative group">
              <div
                className="bg-cover bg-center h-full relative overflow-hidden"
                style={{ backgroundImage: `url(${product.images[0]})` }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  {product.featured_label && (
                    <Badge className="mb-2">{product.featured_label}</Badge>
                  )}
                  <h3 className="text-3xl font-medium">{product.name}</h3>
                  <p className="text-xl">{product.price} €</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
};

export default Home;
