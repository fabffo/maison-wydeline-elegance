import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Collection from './Collection';

// Configuration SEO pour chaque catégorie
export const CATEGORY_SEO_CONFIG: Record<string, {
  category: string;
  title: string;
  description: string;
  h1: string;
  content: string;
}> = {
  'bottines-grande-taille-femme': {
    category: 'Bottines',
    title: 'Bottines grande taille femme 41 à 45 | Maison Wydeline',
    description: 'Découvrez nos bottines grande taille pour femmes du 41 au 45. Cuir premium, fabrication portugaise et confort optimal pour les grandes pointures.',
    h1: 'Bottines grande taille femme',
    content: 'Nos bottines grande taille sont spécialement conçues pour les femmes qui chaussent du 41 au 45. Fabriquées au Portugal avec des cuirs de première qualité, elles allient style contemporain et confort exceptionnel. Chaque modèle est pensé pour les grandes pointures : cambrure adaptée, largeur optimisée et maintien parfait du pied.',
  },
  'bottes-plates-grande-taille': {
    category: 'Bottes',
    title: 'Bottes plates grande taille femme 41 à 45 | Maison Wydeline',
    description: 'Bottes plates grande taille pour femmes du 41 au 45. Élégance intemporelle et confort absolu, fabriquées artisanalement au Portugal.',
    h1: 'Bottes plates grande taille',
    content: 'Nos bottes plates grande taille incarnent l\'élégance décontractée. Parfaites pour le quotidien comme pour les occasions spéciales, elles sont fabriquées au Portugal avec un savoir-faire artisanal. Du 41 au 45, chaque paire est conçue pour offrir un confort optimal aux grandes pointures.',
  },
  'chaussures-plates-grande-taille': {
    category: 'Plates',
    title: 'Chaussures plates grande taille femme 41 à 45 | Maison Wydeline',
    description: 'Chaussures plates grande taille pour femmes du 41 au 45. Confort et élégance au quotidien, fabrication portugaise premium.',
    h1: 'Chaussures plates grande taille',
    content: 'Découvrez notre collection de chaussures plates grande taille, idéales pour les femmes actives qui ne veulent pas sacrifier le style au confort. Du 41 au 45, nos modèles sont fabriqués au Portugal avec des matériaux nobles et une attention particulière portée à l\'ergonomie des grandes pointures.',
  },
  'escarpins-grande-pointure': {
    category: 'Slingback',
    title: 'Escarpins grande pointure femme 41 à 45 | Maison Wydeline',
    description: 'Escarpins et slingbacks grande pointure pour femmes du 41 au 45. Élégance et raffinement, fabrication artisanale portugaise.',
    h1: 'Escarpins grande pointure',
    content: 'Nos escarpins et slingbacks grande pointure sont conçus pour les femmes qui recherchent l\'élégance sans compromis. Du 41 au 45, chaque modèle est fabriqué au Portugal avec des cuirs d\'exception. Talon stable, cambrure adaptée : nous avons pensé à tout pour sublimer les grandes pointures.',
  },
  'chaussures-femme-grande-taille': {
    category: 'all',
    title: 'Chaussures femme grande taille 41 à 45 | Maison Wydeline',
    description: 'Collection complète de chaussures femme grande taille du 41 au 45. Bottines, bottes, escarpins fabriqués au Portugal.',
    h1: 'Chaussures femme grande taille',
    content: 'Bienvenue dans notre collection de chaussures femme grande taille. Du 41 au 45, découvrez nos bottines, bottes, chaussures plates et escarpins fabriqués artisanalement au Portugal. Chaque modèle est conçu spécifiquement pour les grandes pointures, avec une attention particulière portée au confort et à l\'élégance.',
  },
};

interface CategoryPageProps {
  slug: string;
}

const CategoryPage = ({ slug }: CategoryPageProps) => {
  const config = CATEGORY_SEO_CONFIG[slug];
  const navigate = useNavigate();
  const location = useLocation();

  // Mettre à jour les meta tags dynamiquement
  useEffect(() => {
    if (config) {
      // Update title
      document.title = config.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', config.description);
      }
      
      // Update canonical
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://maisonwydeline.com${location.pathname}`);
      }
    }
  }, [config, location.pathname]);

  // Redirection si slug invalide
  if (!config) {
    navigate('/collection', { replace: true });
    return null;
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* H1 SEO optimisé */}
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-6">
          {config.h1}
        </h1>
        
        {/* Contenu SEO unique */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-muted-foreground text-center leading-relaxed">
            {config.content}
          </p>
        </div>

        {/* Réutilisation du composant Collection avec la catégorie pré-filtrée */}
        <CollectionContent category={config.category} />
      </div>
    </main>
  );
};

// Composant interne pour afficher les produits filtrés
import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 9;

const CollectionContent = ({ category }: { category: string }) => {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedColor = searchParams.get('color') || 'all';
  const selectedSize = searchParams.get('size') || 'all';
  const sortBy = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const updateSort = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    setSearchParams(newParams);
  };

  const updatePage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const colors = useMemo(() => {
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    return Array.from(new Set(filtered.map((p) => p.color)));
  }, [products, category]);

  const sizes = useMemo(() => {
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    const allSizes = new Set<number>();
    filtered.forEach((p) => p.sizes.forEach((s) => allSizes.add(s)));
    return Array.from(allSizes).sort((a, b) => a - b);
  }, [products, category]);

  const filteredAndSorted = useMemo(() => {
    let result = category === 'all' ? [...products] : products.filter(p => p.category === category);

    if (selectedColor !== 'all') {
      result = result.filter((p) => p.color === selectedColor);
    }

    if (selectedSize !== 'all') {
      const sizeNum = parseInt(selectedSize, 10);
      result = result.filter((p) => p.sizes.includes(sizeNum));
    }

    switch (sortBy) {
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        break;
    }

    return result;
  }, [products, category, selectedColor, selectedSize, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-12 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <Select value={selectedColor} onValueChange={(v) => updateFilter('color', v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les couleurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les couleurs</SelectItem>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSize} onValueChange={(v) => updateFilter('size', v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les tailles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les tailles</SelectItem>
              {sizes.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <Select value={sortBy} onValueChange={updateSort}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Nouveautés</SelectItem>
                <SelectItem value="priceAsc">Prix croissant</SelectItem>
                <SelectItem value="priceDesc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredAndSorted.length} produit{filteredAndSorted.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && updatePage(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => updatePage(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && updatePage(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Liens internes SEO */}
      <div className="mt-16 pt-8 border-t border-border">
        <h2 className="text-lg font-medium mb-4">Découvrez également</h2>
        <div className="flex flex-wrap gap-3">
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
            to="/escarpins-grande-pointure" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            Escarpins grande pointure
          </Link>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
