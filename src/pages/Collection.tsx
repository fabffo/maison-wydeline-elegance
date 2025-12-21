import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCanonicalUrl, useSEORedirect } from '@/components/SEORedirect';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 9;

const Collection = () => {
  const { t } = useLanguage();
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // SEO: Redirect anciennes URLs et canonical
  useSEORedirect();
  useCanonicalUrl('/collection');
  
  const selectedCategory = searchParams.get('category') || 'all';
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

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const colors = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.color)));
  }, [products]);

  const sizes = useMemo(() => {
    const allSizes = new Set<number>();
    products.forEach((p) => p.sizes.forEach((s) => allSizes.add(s)));
    return Array.from(allSizes).sort((a, b) => a - b);
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

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
  }, [products, selectedCategory, selectedColor, selectedSize, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-12">
          {t.nav.collection}
        </h1>

        {/* Filters */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedCategory} onValueChange={(v) => updateFilter('category', v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.collection.allCategories} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.collection.allCategories}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
            {filteredAndSorted.length} {t.collection.results}
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
          <h2 className="text-lg font-medium mb-4">Parcourir par catégorie</h2>
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
          </div>
        </div>
      </div>
    </main>
  );
};

export default Collection;
