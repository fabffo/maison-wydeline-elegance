import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Page pilier SEO pour "chaussures femme grande taille"
 * Objectif: Être la page principale ciblant cette requête générique
 * Canonical self, contenu long ~800 mots, FAQ, maillage interne fort
 */
const PillarPage = () => {
  const { products, loading } = useProducts();
  const { t, language } = useLanguage();

  // Meta SEO dynamiques
  useEffect(() => {
    document.title = language === 'fr' 
      ? 'Chaussures femme grande taille du 41 au 45 | Maison Wydeline'
      : 'Women\'s Large Size Shoes 41 to 45 | Maison Wydeline';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        language === 'fr'
          ? 'Découvrez notre collection de chaussures femme grande taille du 41 au 45. Bottines, bottes et chaussures plates fabriquées artisanalement au Portugal. Élégance et confort pour les grandes pointures.'
          : 'Discover our collection of women\'s large size shoes from 41 to 45. Ankle boots, boots and flat shoes handcrafted in Portugal. Elegance and comfort for larger sizes.'
      );
    }
    
    // Canonical self
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://maisonwydeline.com/chaussures-femme-grande-taille';

    // S'assurer qu'il n'y a pas de noindex sur cette page
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.remove();
    }
  }, [language]);

  // Sélection de produits pour affichage
  const featuredProducts = products.slice(0, 6);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        
        {/* Breadcrumb SEO */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">{t.pillar.breadcrumbHome}</Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="text-foreground font-medium">{t.pillar.breadcrumbCurrent}</li>
          </ol>
        </nav>

        {/* H1 SEO optimisé */}
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-8">
          {t.pillar.h1}
        </h1>

        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {t.pillar.intro1}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {t.pillar.intro2}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t.pillar.intro3}
          </p>
        </div>

        {/* Section: Pourquoi choisir */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            {t.pillar.whyChooseTitle}
          </h2>
          <div className="max-w-4xl">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.pillar.whyChoose1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t.pillar.whyChoose2}
            </p>
          </div>
        </section>

        {/* Section: Collection complète avec liens internes */}
        <section className="mb-16 bg-luxury-cream rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">
            {t.pillar.collectionTitle}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              to="/bottines-grande-taille-femme"
              className="group bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                {t.pillar.ankleBoots}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.pillar.ankleBootsDesc}
              </p>
            </Link>
            
            <Link 
              to="/bottes-plates-grande-taille"
              className="group bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                {t.pillar.flatBoots}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.pillar.flatBootsDesc}
              </p>
            </Link>
            
            <Link 
              to="/chaussures-plates-grande-taille"
              className="group bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                {t.pillar.flatShoes}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.pillar.flatShoesDesc}
              </p>
            </Link>
          </div>
          
          <p className="text-center text-muted-foreground mt-8">
            {t.pillar.collectionNote}
          </p>
        </section>

        {/* Sélection de produits */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">
              {t.pillar.discoverModels}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                to="/collection"
                className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-4"
              >
                {t.pillar.seeCollection} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Section: Confort, style et stabilité */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            {t.pillar.comfortTitle}
          </h2>
          <div className="max-w-4xl">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.pillar.comfort1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t.pillar.comfort2}
            </p>
          </div>
        </section>

        {/* Section: Fabrication portugaise */}
        <section className="mb-16 bg-background border border-border rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            {t.pillar.craftTitle}
          </h2>
          <div className="max-w-4xl">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.pillar.craft1}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.pillar.craft2}
            </p>
            <Link 
              to="/la-marque"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-4"
            >
              {t.pillar.discoverStory} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Section: Comment bien choisir */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            {t.pillar.howToChooseTitle}
          </h2>
          <div className="max-w-4xl">
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">{t.pillar.tip1Title}</strong> {t.pillar.tip1}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">{t.pillar.tip2Title}</strong> {t.pillar.tip2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">{t.pillar.tip3Title}</strong> {t.pillar.tip3}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">{t.pillar.tip4Title}</strong>{t.pillar.tip4}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16 bg-luxury-cream rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-8">
            {t.pillar.faqTitle}
          </h2>
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-2">
                {t.pillar.faq1Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq1A}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">
                {t.pillar.faq2Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq2A}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">
                {t.pillar.faq3Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq3A}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">
                {t.pillar.faq4Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq4A}
              </p>
            </div>
          </div>
        </section>

        {/* Bloc maillage interne final */}
        <section className="pt-8 border-t border-border">
          <h2 className="text-lg font-medium mb-4">{t.pillar.browseCollections}</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/bottines-grande-taille-femme" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {t.pillar.ankleBoots}
            </Link>
            <Link 
              to="/bottes-plates-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {t.pillar.flatBoots}
            </Link>
            <Link 
              to="/chaussures-plates-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {t.pillar.flatShoes}
            </Link>
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {t.pillar.breadcrumbHome}
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
};

export default PillarPage;