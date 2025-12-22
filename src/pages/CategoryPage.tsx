import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
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
import { useLanguage } from '@/contexts/LanguageContext';

// Mapping slug -> category filter value
const CATEGORY_MAPPING: Record<string, string> = {
  'bottines-grande-taille-femme': 'Bottines',
  'bottes-plates-grande-taille': 'Bottes',
  'chaussures-plates-grande-taille': 'Plats',
};

// Mapping inverse pour le lien retour
const SLUG_TO_COLLECTION_CATEGORY: Record<string, string> = {
  'bottines-grande-taille-femme': 'Bottines',
  'bottes-plates-grande-taille': 'Bottes',
  'chaussures-plates-grande-taille': 'Plats',
};

interface CategoryPageProps {
  slug: string;
}

const ITEMS_PER_PAGE = 9;

const CategoryPage = ({ slug }: CategoryPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = CATEGORY_MAPPING[slug];
  const categoryConfig = t.category[slug as keyof typeof t.category];

  // Redirection si slug invalide
  if (!category || !categoryConfig) {
    navigate('/collection', { replace: true });
    return null;
  }

  // Mettre à jour les meta tags dynamiquement
  useEffect(() => {
    document.title = categoryConfig.title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', categoryConfig.description);
    }
    
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://maisonwydeline.com${location.pathname}`);
    }
  }, [categoryConfig, location.pathname]);

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
    const filtered = products.filter(p => p.category === category);
    return Array.from(new Set(filtered.map((p) => p.color)));
  }, [products, category]);

  const sizes = useMemo(() => {
    const filtered = products.filter(p => p.category === category);
    const allSizes = new Set<number>();
    filtered.forEach((p) => p.sizes.forEach((s) => allSizes.add(s)));
    return Array.from(allSizes).sort((a, b) => a - b);
  }, [products, category]);

  const filteredAndSorted = useMemo(() => {
    let result = products.filter(p => p.category === category);

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
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">{t.collection.loading}</div>
        </div>
      </main>
    );
  }

  // Construire le lien retour vers /collection avec tous les params
  const buildCollectionLink = () => {
    const collectionCategory = SLUG_TO_COLLECTION_CATEGORY[slug];
    const params = new URLSearchParams(searchParams);
    params.set('category', collectionCategory);
    return `/collection?${params.toString()}`;
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Lien retour à la collection */}
        <div className="mb-6">
          <Link 
            to={buildCollectionLink()} 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <span>←</span>
            <span>{language === 'fr' ? 'Retour à la collection' : 'Back to collection'}</span>
          </Link>
        </div>

        {/* H1 SEO optimisé */}
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-6">
          {categoryConfig.h1}
        </h1>
        
        {/* Contenu SEO unique */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-muted-foreground text-center leading-relaxed">
            {categoryConfig.content}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedColor} onValueChange={(v) => updateFilter('color', v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.collection.allColors} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.collection.allColors}</SelectItem>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSize} onValueChange={(v) => updateFilter('size', v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.collection.allSizes} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.collection.allSizes}</SelectItem>
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
                  <SelectValue placeholder={t.collection.sortBy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t.collection.newest}</SelectItem>
                  <SelectItem value="priceAsc">{t.collection.priceAsc}</SelectItem>
                  <SelectItem value="priceDesc">{t.collection.priceDesc}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredAndSorted.length} {filteredAndSorted.length > 1 ? t.collection.products : t.collection.product}
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

        {/* Lien contextuel vers page pilier */}
        <div className="mt-12 p-6 bg-luxury-cream rounded-xl text-center">
          <p className="text-muted-foreground mb-3">
            {t.collection.discoverComplete}{' '}
            <Link 
              to="/chaussures-femme-grande-taille" 
              className="text-primary font-medium hover:underline underline-offset-2"
            >
              {language === 'fr' ? 'chaussures femme grande taille' : "women's large size shoes"}
            </Link>{' '}
            {t.collection.from41to45}
          </p>
        </div>

        {/* Liens internes SEO */}
        <div className="mt-16 pt-8 border-t border-border">
          <h2 className="text-lg font-medium mb-4">{t.collection.discoverAlso}</h2>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/chaussures-femme-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {language === 'fr' ? 'Chaussures femme grande taille' : "Women's large size shoes"}
            </Link>
            <Link 
              to="/bottines-grande-taille-femme" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {t.category['bottines-grande-taille-femme'].h1}
            </Link>
            <Link 
              to="/bottes-plates-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {t.category['bottes-plates-grande-taille'].h1}
            </Link>
            <Link 
              to="/chaussures-plates-grande-taille" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {t.category['chaussures-plates-grande-taille'].h1}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CategoryPage;