import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { ChevronRight, ArrowRight } from 'lucide-react';
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

  // Sommaire / ancres
  const tableOfContents = [
    { id: 'pourquoi', label: language === 'fr' ? 'Pourquoi choisir' : 'Why choose' },
    { id: 'collections', label: language === 'fr' ? 'Collections' : 'Collections' },
    { id: 'modeles', label: language === 'fr' ? 'Nos modèles' : 'Our models' },
    { id: 'confort', label: language === 'fr' ? 'Confort' : 'Comfort' },
    { id: 'fabrication', label: language === 'fr' ? 'Fabrication' : 'Craftsmanship' },
    { id: 'conseils', label: language === 'fr' ? 'Conseils' : 'Tips' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <main className="min-h-screen pt-24 pb-16">
      
      {/* Hero discret avec fond léger */}
      <div className="bg-muted/30 py-12 md:py-16 mb-12">
        <div className="container mx-auto px-6">
          
          {/* Breadcrumb SEO */}
          <nav className="mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center justify-center gap-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">{t.pillar.breadcrumbHome}</Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-foreground font-medium">{t.pillar.breadcrumbCurrent}</li>
            </ol>
          </nav>

          {/* H1 SEO optimisé */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-center mb-10 tracking-tight">
            {t.pillar.h1}
          </h1>

          {/* Introduction dans une card blanche */}
          <div className="max-w-4xl mx-auto bg-background rounded-2xl shadow-sm border border-border/50 p-8 md:p-10">
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              {t.pillar.intro1}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">
              {t.pillar.intro2}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t.pillar.intro3}
            </p>
          </div>

          {/* Mini sommaire / Table des matières */}
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2 md:gap-3" aria-label="Sommaire">
            {tableOfContents.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border border-border/60 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-6">
        
        {/* Section: Pourquoi choisir */}
        <section id="pourquoi" className="mb-16 scroll-mt-28">
          <h2 className="text-2xl md:text-3xl font-light mb-8 max-w-4xl mx-auto">
            {t.pillar.whyChooseTitle}
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-10">
            <p className="text-muted-foreground leading-relaxed">
              {t.pillar.whyChoose1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t.pillar.whyChoose2}
            </p>
          </div>
        </section>

        {/* Section: Collection complète avec liens internes */}
        <section id="collections" className="mb-16 bg-luxury-cream rounded-2xl p-8 md:p-12 scroll-mt-28">
          <h2 className="text-2xl md:text-3xl font-light mb-10 text-center">
            {t.pillar.collectionTitle}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              to="/bottines-grande-taille-femme"
              className="group bg-background rounded-xl p-6 text-center border border-transparent hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[180px]"
            >
              <h3 className="text-xl font-medium mb-3 group-hover:text-primary transition-colors">
                {t.pillar.ankleBoots}
              </h3>
              <p className="text-sm text-muted-foreground flex-1">
                {t.pillar.ankleBootsDesc}
              </p>
              <span className="inline-flex items-center justify-center gap-1 mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {language === 'fr' ? 'Découvrir' : 'Discover'} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            
            <Link 
              to="/bottes-plates-grande-taille"
              className="group bg-background rounded-xl p-6 text-center border border-transparent hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[180px]"
            >
              <h3 className="text-xl font-medium mb-3 group-hover:text-primary transition-colors">
                {t.pillar.flatBoots}
              </h3>
              <p className="text-sm text-muted-foreground flex-1">
                {t.pillar.flatBootsDesc}
              </p>
              <span className="inline-flex items-center justify-center gap-1 mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {language === 'fr' ? 'Découvrir' : 'Discover'} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            
            <Link 
              to="/ballerines-grande-taille-femme"
              className="group bg-background rounded-xl p-6 text-center border border-transparent hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[180px]"
            >
              <h3 className="text-xl font-medium mb-3 group-hover:text-primary transition-colors">
                {t.pillar.ballerinas}
              </h3>
              <p className="text-sm text-muted-foreground flex-1">
                {t.pillar.ballerinasDesc}
              </p>
              <span className="inline-flex items-center justify-center gap-1 mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {language === 'fr' ? 'Découvrir' : 'Discover'} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          
          <p className="text-center text-muted-foreground mt-10 max-w-2xl mx-auto">
            {t.pillar.collectionNote}
          </p>
        </section>

        {/* Sélection de produits */}
        {!loading && featuredProducts.length > 0 && (
          <section id="modeles" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl md:text-3xl font-light mb-10 text-center">
              {t.pillar.discoverModels}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link 
                to="/collection"
                className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-4 font-medium"
              >
                {t.pillar.seeCollection} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Section: Confort, style et stabilité */}
        <section id="confort" className="mb-16 scroll-mt-28">
          <h2 className="text-2xl md:text-3xl font-light mb-8 max-w-4xl mx-auto">
            {t.pillar.comfortTitle}
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-10">
            <p className="text-muted-foreground leading-relaxed">
              {t.pillar.comfort1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t.pillar.comfort2}
            </p>
          </div>
        </section>

        {/* Section: Fabrication portugaise */}
        <section id="fabrication" className="mb-16 bg-background border border-border rounded-2xl shadow-sm p-8 md:p-12 scroll-mt-28">
          <h2 className="text-2xl md:text-3xl font-light mb-8 max-w-4xl mx-auto">
            {t.pillar.craftTitle}
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed mb-5">
              {t.pillar.craft1}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t.pillar.craft2}
            </p>
            <Link 
              to="/la-marque"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-4 font-medium"
            >
              {t.pillar.discoverStory} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Section: Comment bien choisir */}
        <section id="conseils" className="mb-16 scroll-mt-28">
          <h2 className="text-2xl md:text-3xl font-light mb-8 max-w-4xl mx-auto">
            {t.pillar.howToChooseTitle}
          </h2>
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-5 text-muted-foreground">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-2 h-2 mt-2.5 rounded-full bg-primary" />
                <span><strong className="text-foreground">{t.pillar.tip1Title}</strong> {t.pillar.tip1}</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-2 h-2 mt-2.5 rounded-full bg-primary" />
                <span><strong className="text-foreground">{t.pillar.tip2Title}</strong> {t.pillar.tip2}</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-2 h-2 mt-2.5 rounded-full bg-primary" />
                <span><strong className="text-foreground">{t.pillar.tip3Title}</strong> {t.pillar.tip3}</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-2 h-2 mt-2.5 rounded-full bg-primary" />
                <span><strong className="text-foreground">{t.pillar.tip4Title}</strong>{t.pillar.tip4}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-16 bg-luxury-cream rounded-2xl p-8 md:p-12 scroll-mt-28">
          <h2 className="text-2xl md:text-3xl font-light mb-10 max-w-4xl mx-auto">
            {t.pillar.faqTitle}
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-background border border-border/50 rounded-xl p-6">
              <h3 className="font-medium text-lg mb-3">
                {t.pillar.faq1Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq1A}
              </p>
            </div>
            
            <div className="bg-background border border-border/50 rounded-xl p-6">
              <h3 className="font-medium text-lg mb-3">
                {t.pillar.faq2Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq2A}
              </p>
            </div>
            
            <div className="bg-background border border-border/50 rounded-xl p-6">
              <h3 className="font-medium text-lg mb-3">
                {t.pillar.faq3Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq3A}
              </p>
            </div>
            
            <div className="bg-background border border-border/50 rounded-xl p-6">
              <h3 className="font-medium text-lg mb-3">
                {t.pillar.faq4Q}
              </h3>
              <p className="text-muted-foreground">
                {t.pillar.faq4A}
              </p>
            </div>
          </div>
        </section>

        {/* Bloc maillage interne final */}
        <section className="pt-10 border-t border-border max-w-4xl mx-auto">
          <h2 className="text-lg font-medium mb-6 text-center">{t.pillar.browseCollections}</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link 
              to="/bottines-grande-taille-femme" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
            >
              {t.pillar.ankleBoots}
            </Link>
            <span className="text-border">•</span>
            <Link 
              to="/bottes-plates-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
            >
              {t.pillar.flatBoots}
            </Link>
            <span className="text-border">•</span>
            <Link 
              to="/ballerines-grande-taille-femme" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
            >
              {t.pillar.ballerinas}
            </Link>
            <span className="text-border">•</span>
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
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
