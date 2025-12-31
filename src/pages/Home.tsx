import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Heart, Shield } from "lucide-react";
import { Seo } from "@/components/Seo";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import heroImage from "@/assets/hero-main.jpg";
import saoJoaoMadeira from "@/assets/sao-joao-madeira.jpg";

// Import product images for category grid
import bottinesNoires from "@/assets/ankle-boots-black.jpg";
import bottesVertes from "@/assets/boots-green-suede.jpg";
import platesNoires from "@/assets/flats-white.jpg";

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
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .or(`featured_start_at.is.null,featured_start_at.lte.${now}`)
        .or(`featured_end_at.is.null,featured_end_at.gte.${now}`)
        .order("featured_priority", { ascending: true });

      if (productsError) throw productsError;

      const productIds = productsData?.map((p) => p.id) || [];
      const { data: imagesData } = await supabase
        .from("product_images")
        .select("product_id, image_url, position")
        .in("product_id", productIds)
        .order("position");

      const enrichedProducts =
        productsData?.map((dbProduct) => {
          const productImages = imagesData?.filter((img) => img.product_id === dbProduct.id) || [];
          return {
            ...dbProduct,
            slug: dbProduct.slug || dbProduct.id,
            images: productImages.map((img) => img.image_url),
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
      console.error("Error fetching featured products:", error);
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
    { name: t.home.categoryAnkleBoots, image: bottinesNoires, link: "/bottines-grande-taille-femme" },
    { name: t.home.categoryBoots, image: bottesVertes, link: "/bottes-plates-grande-taille" },
    { name: t.home.categoryBallerinas, image: platesNoires, link: "/ballerines-grande-taille-femme" },
  ];

  return (
    <>
      <Seo
        title="Chaussures femme grande taille 41 à 45 – Maison Wydeline"
        description="Maison Wydeline propose des chaussures élégantes pour femmes chaussant du 41 au 45, fabriquées au Portugal avec un confort premium."
        canonical="https://maisonwydeline.com/"
      />
      <main className="min-h-screen">
      {/* Newsletter Popup */}
      <NewsletterPopup />
      {/* Hero Section - Full Width Banner */}
      <section className="relative min-h-[90vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              heroProduct && heroProduct.images[0] ? `url(${heroProduct.images[0]})` : `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark/70 via-luxury-dark/40 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            {/* Micro-accroche */}
            <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/80 mb-4 animate-fade-in">
              {t.home.tagline}
            </p>

            {/* H1 Branding – éviter cannibalisation avec page pilier */}
            <h1 className="sr-only">{t.home.h1}</h1>

            {/* Slogan visuel (branding) */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground mb-6 animate-fade-in leading-[1.1]">
              {t.home.heroTitle1}
              <br />
              <span className="font-medium">{t.home.heroTitle2}</span>
            </h2>

            <p
              className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in max-w-lg"
              style={{ animationDelay: "0.2s" }}
            >
              {t.home.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Link to="/collection">
                <Button
                  size="lg"
                  className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
                >
                  {t.home.discoverCollection}
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
            <span className="font-medium">{t.home.announcement}</span> {t.home.announcementText}
          </p>
        </div>
      </section>

      {/* Category Grid - Allbirds Style */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-4">{t.home.collectionsTitle}</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {t.home.collectionsSubtitle}
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
                    {t.home.discover} <ArrowRight className="ml-1 h-3 w-3" />
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
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">{t.home.selection}</p>
                <h2 className="text-3xl md:text-4xl font-light">{t.home.essentials}</h2>
              </div>
              <Link to="/collection" className="hidden md:inline-flex items-center text-sm hover:underline">
                {t.home.seeAll} <ArrowRight className="ml-1 h-3 w-3" />
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
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.featured_label}
                      </Badge>
                    )}
                    <h3 className="font-medium text-foreground group-hover:underline">{product.name}</h3>
                    <p className="text-muted-foreground">{product.price} €</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link to="/collection">
                <Button variant="outline">{t.home.seeFullCollection}</Button>
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
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">{t.home.expertise}</p>
              <h2 className="text-3xl md:text-4xl font-light mb-6 leading-tight">
                {t.home.madeInPortugal1}
                <br />
                <span className="font-medium">{t.home.madeInPortugal2}</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t.home.madeInPortugalText}
              </p>
              <Link to="/la-marque">
                <Button variant="outline" className="group">
                  {t.home.discoverStory}
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
              <h3 className="font-medium mb-2">{t.home.timelessElegance}</h3>
              <p className="text-sm text-muted-foreground">{t.home.timelessEleganceText}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">{t.home.thoughtfulComfort}</h3>
              <p className="text-sm text-muted-foreground">{t.home.thoughtfulComfortText}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">{t.home.lastingQuality}</h3>
              <p className="text-sm text-muted-foreground">{t.home.lastingQualityText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      {featuredProducts.NEW.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">{t.home.newArrivals}</p>
              <h2 className="text-3xl md:text-4xl font-light">{t.home.latestModels}</h2>
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
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.featured_label}
                      </Badge>
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
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">{t.home.bestSellers}</p>
              <h2 className="text-3xl md:text-4xl font-light">{t.home.mostLoved}</h2>
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
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.featured_label}
                      </Badge>
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

      {/* SEO Content Section - Maillage interne optimisé */}
      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <h2 className="text-2xl font-light text-foreground mb-8">
              {t.home.seoTitle}
            </h2>

            <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
              <div>
                <p className="mb-4">
                  {t.home.seoParagraph1}{" "}
                  <Link 
                    to="/chaussures-femme-grande-taille" 
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    {t.home.seoLink1}
                  </Link>{" "}
                  {t.home.seoParagraph2}{" "}
                  <strong className="text-foreground">Maison Wydeline</strong>{t.home.seoParagraph3}
                </p>
                <p className="mb-4">
                  {t.home.seoParagraph4}{" "}
                  <Link 
                    to="/bottines-grande-taille-femme" 
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    {t.home.seoLink2}
                  </Link>{" "}
                  {t.home.seoParagraph5}{" "}
                  <Link 
                    to="/bottes-plates-grande-taille" 
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    {t.home.seoLink3}
                  </Link>
                  {t.home.seoParagraph6}
                </p>
              </div>
              <div>
                <p className="mb-4">
                  {t.home.seoParagraph7}{" "}
                  <Link 
                    to="/la-marque" 
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    {t.home.seoLink4}
                  </Link>
                  {t.home.seoParagraph8}
                </p>
                <p className="mb-4">
                  {t.home.seoParagraph9}{" "}
                  <Link 
                    to="/ballerines-grande-taille-femme" 
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    {t.home.seoLink5}
                  </Link>{" "}
                  {t.home.seoParagraph10}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 md:py-20 bg-luxury-cream">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-4">{t.home.socialTitle}</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            {t.home.socialText}
          </p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/maisonwydeline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivre Maison Wydeline sur Instagram"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-background text-luxury-dark hover:bg-luxury-dark hover:text-white transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@maisonwydeline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivre Maison Wydeline sur TikTok"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-background text-luxury-dark hover:bg-luxury-dark hover:text-white transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-light mb-6">{t.home.ctaTitle}</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {t.home.ctaText}
          </p>
          <Link to="/collection">
            <Button size="lg" variant="secondary" className="group">
              {t.home.ctaButton}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
    </>
  );
};

export default Home;
