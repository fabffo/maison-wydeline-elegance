import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { ChevronRight } from 'lucide-react';

/**
 * Page pilier SEO pour "chaussures femme grande taille"
 * Objectif: Être la page principale ciblant cette requête générique
 * Canonical self, contenu long ~800 mots, FAQ, maillage interne fort
 */
const PillarPage = () => {
  const { products, loading } = useProducts();

  // Meta SEO dynamiques
  useEffect(() => {
    document.title = 'Chaussures femme grande taille du 41 au 45 | Maison Wydeline';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Découvrez notre collection de chaussures femme grande taille du 41 au 45. Bottines, bottes et chaussures plates fabriquées artisanalement au Portugal. Élégance et confort pour les grandes pointures.'
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
  }, []);

  // Sélection de produits pour affichage
  const featuredProducts = products.slice(0, 6);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        
        {/* Breadcrumb SEO */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="text-foreground font-medium">Chaussures femme grande taille</li>
          </ol>
        </nav>

        {/* H1 SEO optimisé */}
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-8">
          Chaussures femme grande taille : élégance et confort du 41 au 45
        </h1>

        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Trouver de belles <strong className="text-foreground">chaussures femme grande taille</strong> lorsqu'on 
            chausse du 41 au 45 est souvent un véritable parcours du combattant. Modèles peu élégants, confort 
            approximatif, choix limité…
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Chez <strong className="text-foreground">Maison Wydeline</strong>, nous avons fait le choix inverse : 
            concevoir des chaussures pensées dès l'origine pour les grandes pointures, sans compromis entre style, 
            maintien et confort.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Notre collection de <strong className="text-foreground">chaussures femme grande pointure</strong> s'adresse 
            aux femmes exigeantes, à la recherche de modèles raffinés, durables et parfaitement adaptés à leur morphologie.
          </p>
        </div>

        {/* Section: Pourquoi choisir */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            Pourquoi choisir des chaussures femme grande taille adaptées ?
          </h2>
          <div className="max-w-4xl">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Les <strong className="text-foreground">chaussures grande taille</strong> ne peuvent pas être de simples 
              modèles agrandis. Lorsqu'on chausse du 41 au 45, le pied nécessite une cambrure adaptée, une largeur 
              maîtrisée et un équilibre optimal.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nos <strong className="text-foreground">chaussures femme grande taille</strong> sont conçues avec ces 
              contraintes dès la phase de design. Chaque modèle bénéficie d'une attention particulière portée aux 
              proportions, garantissant ainsi un maintien parfait et un confort durable.
            </p>
          </div>
        </section>

        {/* Section: Collection complète avec liens internes */}
        <section className="mb-16 bg-luxury-cream rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">
            Une collection complète de chaussures femme grande pointure
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              to="/bottines-grande-taille-femme"
              className="group bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                Bottines grande taille femme
              </h3>
              <p className="text-sm text-muted-foreground">
                Élégance et caractère pour toutes les occasions
              </p>
            </Link>
            
            <Link 
              to="/bottes-plates-grande-taille"
              className="group bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                Bottes plates grande taille
              </h3>
              <p className="text-sm text-muted-foreground">
                Confort absolu et style intemporel
              </p>
            </Link>
            
            <Link 
              to="/chaussures-plates-grande-taille"
              className="group bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                Chaussures plates grande taille
              </h3>
              <p className="text-sm text-muted-foreground">
                La polyvalence au quotidien
              </p>
            </Link>
          </div>
          
          <p className="text-center text-muted-foreground mt-8">
            Chaque modèle est disponible du 41 au 45, avec une attention particulière portée aux proportions et au confort.
          </p>
        </section>

        {/* Sélection de produits */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">
              Découvrez nos modèles
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
                Voir toute la collection <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Section: Confort, style et stabilité */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            Chaussures femme grande taille : confort, style et stabilité
          </h2>
          <div className="max-w-4xl">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nos chaussures offrent maintien, stabilité et confort longue durée, tout en restant féminines et élégantes. 
              Que vous cherchiez des bottines pour le bureau, des bottes pour vos sorties ou des chaussures plates pour 
              le quotidien, chaque modèle répond aux exigences des femmes qui chaussent grand.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les semelles intérieures sont conçues pour épouser la forme du pied, tandis que les matériaux souples 
              s'adaptent naturellement à votre morphologie. Le résultat : un confort immédiat, dès le premier port.
            </p>
          </div>
        </section>

        {/* Section: Fabrication portugaise */}
        <section className="mb-16 bg-background border border-border rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            Fabrication portugaise &amp; savoir-faire artisanal
          </h2>
          <div className="max-w-4xl">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Toutes nos chaussures sont fabriquées au Portugal, dans la région de <strong className="text-foreground">São João da Madeira</strong>, 
              reconnue mondialement pour son expertise dans la chaussure de qualité.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nous travaillons avec des ateliers familiaux qui perpétuent un savoir-faire transmis de génération en génération. 
              Cuirs premium, finitions haut de gamme et contrôle qualité rigoureux garantissent des chaussures durables et élégantes.
            </p>
            <Link 
              to="/la-marque"
              className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-4"
            >
              Découvrir notre histoire <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Section: Comment bien choisir */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            Comment bien choisir ses chaussures femme grande taille ?
          </h2>
          <div className="max-w-4xl">
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Modèles conçus spécifiquement</strong> pour grandes pointures (pas de simples agrandissements)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Largeur et stabilité</strong> adaptées à la morphologie du pied</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Matériaux souples et durables</strong> qui s'adaptent au pied</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Usage quotidien ou occasionnel</strong> : choisissez selon vos besoins</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16 bg-luxury-cream rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-8">
            Questions fréquentes
          </h2>
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-2">
                À partir de quelle pointure parle-t-on de grande taille ?
              </h3>
              <p className="text-muted-foreground">
                On considère généralement qu'une chaussure femme est en grande taille à partir du 41. 
                Chez Maison Wydeline, nous proposons des modèles du 41 au 45.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">
                Les chaussures grande taille sont-elles plus larges ?
              </h3>
              <p className="text-muted-foreground">
                Oui, nos chaussures grande taille intègrent une largeur et une cambrure spécifiquement 
                adaptées aux grandes pointures, pour un maintien et un confort optimaux.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">
                Où trouver des chaussures femme grande taille élégantes ?
              </h3>
              <p className="text-muted-foreground">
                Chez <strong className="text-foreground">Maison Wydeline</strong>, nous proposons une collection 
                dédiée aux femmes qui chaussent du 41 au 45 : bottines, bottes et chaussures plates, 
                toutes fabriquées artisanalement au Portugal.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">
                Sont-elles adaptées à un usage quotidien ?
              </h3>
              <p className="text-muted-foreground">
                Absolument. Nos chaussures sont conçues pour offrir un confort durable, que ce soit pour 
                une journée au bureau ou une sortie en ville. Les matériaux premium et les finitions 
                soignées garantissent une longévité exceptionnelle.
              </p>
            </div>
          </div>
        </section>

        {/* Bloc maillage interne final */}
        <section className="pt-8 border-t border-border">
          <h2 className="text-lg font-medium mb-4">Parcourir nos collections</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/bottines-grande-taille-femme" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Bottines grande taille femme
            </Link>
            <Link 
              to="/bottes-plates-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Bottes plates grande taille
            </Link>
            <Link 
              to="/chaussures-plates-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Chaussures plates grande taille
            </Link>
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Accueil
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
};

export default PillarPage;
