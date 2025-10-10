import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SizeSelectorProps {
  sizes: number[];
  stock: Record<string, number>;
  selectedSize: number | null;
  onSizeSelect: (size: number) => void;
}

export const SizeSelector = ({ sizes, stock, selectedSize, onSizeSelect }: SizeSelectorProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{t.product.selectSize}</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const sizeStock = stock[size.toString()] || 0;
          const isAvailable = sizeStock > 0;
          const isSelected = selectedSize === size;

          return (
            <Button
              key={size}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              disabled={!isAvailable}
              onClick={() => onSizeSelect(size)}
              className={cn(
                'w-16 h-10',
                !isAvailable && 'opacity-40 cursor-not-allowed'
              )}
              aria-label={`${t.product.size} ${size}${!isAvailable ? ` - ${t.product.outOfStock}` : ''}`}
            >
              {size}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
