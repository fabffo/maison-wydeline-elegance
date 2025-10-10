import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { BadgePreorder } from './BadgePreorder';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/produit/${product.slug}`} className="group">
      <article className="relative">
        <div className="aspect-[3/4] mb-4 overflow-hidden bg-luxury-cream rounded-lg">
          <img
            src={product.images[0]}
            alt={product.alt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        {product.preorder && (
          <div className="absolute top-4 right-4">
            <BadgePreorder />
          </div>
        )}
        <h3 className="text-lg font-medium mb-2">{product.name}</h3>
        <p className="text-muted-foreground">€{product.price}</p>
      </article>
    </Link>
  );
};
