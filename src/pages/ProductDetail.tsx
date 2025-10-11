import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { SizeSelector } from '@/components/SizeSelector';
import { BadgePreorder } from '@/components/BadgePreorder';
import { useToast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find((p) => p.slug === slug);
      if (found) {
        setProduct(found);
      } else {
        navigate('/404');
      }
    }
  }, [slug, products, loading, navigate]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      toast({
        title: t.product.selectSize,
        variant: 'destructive',
      });
      return;
    }

    addItem(product.id, selectedSize);
    toast({
      title: t.product.addToCart,
      description: `${product.name} - ${t.product.size} ${selectedSize}`,
    });
  };

  if (loading || !product) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </main>
    );
  }

  const availableSizes = product.sizes.filter((size) => product.stock[size.toString()] > 0);
  const hasStock = availableSizes.length > 0;
  const totalStock = product.sizes.reduce((sum, size) => sum + (product.stock[size.toString()] || 0), 0);
  const lowStockThreshold = 3;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:text-luxury-beige transition-colors"
        >
          <ChevronLeft size={16} />
          {t.nav.collection}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-luxury-cream rounded-lg">
              <img
                src={product.images[selectedImage]}
                alt={product.alt}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square w-20 overflow-hidden bg-luxury-cream rounded-lg border-2 transition-colors ${
                      idx === selectedImage ? 'border-luxury-dark' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium mb-2">{product.name}</h1>
              <p className="text-2xl text-muted-foreground">€{product.price}</p>
            </div>

            {product.preorder && (
              <div>
                <BadgePreorder />
              </div>
            )}

            {!hasStock && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                <p className="font-medium">
                  {product.preorder ? '📦 Disponible en précommande' : '⚠️ Rupture de stock'}
                </p>
              </div>
            )}

            <div className="prose prose-sm">
              <h3 className="font-medium text-base">{t.product.description}</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">{t.product.materials}</h3>
              <p className="text-sm text-muted-foreground">{product.materials.join(', ')}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {t.product.heelHeight}: {product.heelHeightCm} cm
              </p>
            </div>

            <SizeSelector
              sizes={product.sizes}
              stock={product.stock}
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
              lowStockThreshold={lowStockThreshold}
            />

            {hasStock ? (
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full"
                size="lg"
              >
                {t.product.addToCart}
              </Button>
            ) : (
              <Button disabled className="w-full" size="lg">
                {product.preorder ? 'Précommande' : t.product.outOfStock}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
